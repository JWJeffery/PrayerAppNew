<?php
// Staff endpoints (spec 8.4). The parish is ALWAYS derived from the session, never from the
// client, and the session is re-checked (unexpired, parish approved) on every call.
if (!defined('UO_API')) { exit; }

final class StaffApi
{
    private const HOUR = 3600;
    private const MAX_ACTIVE = 100;
    private const MAX_DELEGATES = 5;

    // ---- Shared plumbing -----------------------------------------------------

    /** Staff principal, or an emitted 401/429 and null. $write counts against the 60/hour session limit. */
    public static function ctx(bool $write, bool $rectorOnly = false): ?array
    {
        $p = Auth::require();
        if ($p === null) { return null; }
        if ($p['type'] !== 'staff') { Response::error(403, 'forbidden', 'Not allowed.'); return null; }
        if ($write) {
            $rl = RateLimit::hit('staffwrite', 'session:' . $p['session_id'], 60, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return null; }
        }
        if ($rectorOnly && $p['staff']['role'] !== 'rector') {
            Response::error(403, 'forbidden', 'Only the rector can do this.');
            return null;
        }
        return $p;
    }

    public static function json(): ?array
    {
        [$body] = Request::jsonBody();
        if ($body === null) { Response::error(400, 'bad_request', 'Bad request.'); }
        return $body;
    }

    public static function idParam(array $params): ?int
    {
        $id = (string)($params['id'] ?? '');
        return ctype_digit($id) && strlen($id) <= 18 ? (int)$id : null;
    }

    public static function audit(array $p, string $action, ?string $detail = null): void
    {
        Audit::log('staff:' . $p['staff']['id'], $p['parish']['id'], $action, $detail); // ids only, never text/emails
    }

    private static function item(array $r): array
    {
        return [
            'id' => (int)$r['id'],
            'category' => $r['category'],
            'text' => $r['body'],
            'created_at' => Validate::isoUtc($r['created_at']),
            'expires_at' => Validate::isoUtc($r['expires_at']),
            'extension_count' => (int)$r['extension_count'],
            'expired' => (bool)$r['expired'],
        ];
    }

    private const ITEM_COLS = 'id, category, body, created_at, expires_at, extension_count, (expires_at <= UTC_TIMESTAMP()) AS expired';

    /** One intention of THIS parish, or null (another parish's id is indistinguishable from a missing one). */
    private static function findItem(int $parishId, int $id): ?array
    {
        $st = Db::pdo()->prepare('SELECT ' . self::ITEM_COLS . ' FROM intentions WHERE id = ? AND parish_id = ?');
        $st->execute([$id, $parishId]);
        $r = $st->fetch();
        return $r === false ? null : $r;
    }

    public static function invalid(array $fields): void
    {
        Response::error(422, 'invalid_input', 'Invalid input.', $fields);
    }

    // ---- Intentions ------------------------------------------------------------

    /** GET /staff/intentions -- everything current plus items that expired in the last 7 days. */
    public static function listIntentions(array $params): void
    {
        $p = self::ctx(false);
        if ($p === null) { return; }
        $st = Db::pdo()->prepare('SELECT ' . self::ITEM_COLS . ' FROM intentions
                                  WHERE parish_id = ? AND expires_at > UTC_TIMESTAMP() - INTERVAL 7 DAY
                                  ORDER BY expires_at ASC, id ASC');
        $st->execute([$p['parish']['id']]);
        Response::json(200, ['intentions' => array_map([self::class, 'item'], $st->fetchAll())]);
    }

    /** POST /staff/intentions {category, text, days?} */
    public static function createIntention(array $params): void
    {
        $p = self::ctx(true);
        if ($p === null) { return; }
        $b = self::json();
        if ($b === null) { return; }

        $errors = [];
        $category = $b['category'] ?? null;
        if (!is_string($category) || !in_array($category, Validate::CATEGORIES, true)) { $errors['category'] = 'Choose a category.'; }
        [$text, $e] = Validate::text($b['text'] ?? null, 200);
        if ($e !== null) { $errors['text'] = $e; }
        [$days, $e] = Validate::days($b['days'] ?? null, 21);
        if ($e !== null) { $errors['days'] = $e; }
        if ($errors) { self::invalid($errors); return; }

        $pdo = Db::pdo();
        $pid = $p['parish']['id'];
        $pdo->beginTransaction();
        try {
            // Serialize concurrent adds for this parish so the 100-item cap cannot be raced.
            $pdo->prepare('SELECT id FROM parishes WHERE id = ? FOR UPDATE')->execute([$pid]);
            $cnt = $pdo->prepare('SELECT COUNT(*) FROM intentions WHERE parish_id = ? AND expires_at > UTC_TIMESTAMP()');
            $cnt->execute([$pid]);
            if ((int)$cnt->fetchColumn() >= self::MAX_ACTIVE) {
                $pdo->rollBack();
                Response::error(409, 'limit_reached', 'This parish already has ' . self::MAX_ACTIVE . ' active intentions. Remove some first.');
                return;
            }
            $pdo->prepare('INSERT INTO intentions (parish_id, category, body, created_by, created_at, expires_at)
                           VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL ? DAY)')
                ->execute([$pid, $category, $text, $p['staff']['id'], $days]);
            $id = (int)$pdo->lastInsertId();
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) { $pdo->rollBack(); }
            throw $e;
        }
        self::audit($p, 'intention.add', "id=$id");
        Response::json(201, ['intention' => self::item(self::findItem($pid, $id))]);
    }

    /** PATCH /staff/intentions/{id} {text?, category?} */
    public static function editIntention(array $params): void
    {
        $p = self::ctx(true);
        if ($p === null) { return; }
        $id = self::idParam($params);
        $b = self::json();
        if ($b === null) { return; }
        $pid = $p['parish']['id'];
        if ($id === null || self::findItem($pid, $id) === null) { Response::error(404, 'not_found', 'Not found.'); return; }

        $errors = []; $sets = []; $args = [];
        if (array_key_exists('category', $b)) {
            if (!is_string($b['category']) || !in_array($b['category'], Validate::CATEGORIES, true)) { $errors['category'] = 'Choose a category.'; }
            else { $sets[] = 'category = ?'; $args[] = $b['category']; }
        }
        if (array_key_exists('text', $b)) {
            [$text, $e] = Validate::text($b['text'], 200);
            if ($e !== null) { $errors['text'] = $e; } else { $sets[] = 'body = ?'; $args[] = $text; }
        }
        if (!$errors && !$sets) { $errors['text'] = 'Nothing to change.'; }
        if ($errors) { self::invalid($errors); return; }

        $args[] = $id; $args[] = $pid;
        Db::pdo()->prepare('UPDATE intentions SET ' . implode(', ', $sets) . ' WHERE id = ? AND parish_id = ?')->execute($args);
        self::audit($p, 'intention.edit', "id=$id");
        Response::json(200, ['intention' => self::item(self::findItem($pid, $id))]);
    }

    /** POST /staff/intentions/{id}/extend {days} */
    public static function extendIntention(array $params): void
    {
        $p = self::ctx(true);
        if ($p === null) { return; }
        $id = self::idParam($params);
        $b = self::json();
        if ($b === null) { return; }
        $pid = $p['parish']['id'];
        if ($id === null || self::findItem($pid, $id) === null) { Response::error(404, 'not_found', 'Not found.'); return; }
        [$days, $e] = Validate::days($b['days'] ?? null, null);
        if ($e !== null) { self::invalid(['days' => $e]); return; }

        // From the later of "now" and the current expiry, so an already-expired item is revived
        // for the full period; reset the reminder so a fresh digest can go out (spec 6.4).
        Db::pdo()->prepare('UPDATE intentions
                            SET expires_at = GREATEST(expires_at, UTC_TIMESTAMP()) + INTERVAL ? DAY,
                                extension_count = extension_count + 1, reminder_sent_at = NULL
                            WHERE id = ? AND parish_id = ?')->execute([$days, $id, $pid]);
        self::audit($p, 'intention.extend', "id=$id days=$days");
        Response::json(200, ['intention' => self::item(self::findItem($pid, $id))]);
    }

    /** DELETE /staff/intentions/{id} -- hard delete, no history. */
    public static function deleteIntention(array $params): void
    {
        $p = self::ctx(true);
        if ($p === null) { return; }
        $id = self::idParam($params);
        $pid = $p['parish']['id'];
        if ($id === null || self::findItem($pid, $id) === null) { Response::error(404, 'not_found', 'Not found.'); return; }
        Db::pdo()->prepare('DELETE FROM intentions WHERE id = ? AND parish_id = ?')->execute([$id, $pid]);
        self::audit($p, 'intention.delete', "id=$id");
        Response::json(200, ['status' => 'ok']);
    }

    // ---- Delegates (rector only) ----------------------------------------------

    /** GET /staff/delegates -- everyone with access to this parish. */
    public static function listDelegates(array $params): void
    {
        $p = self::ctx(false, true);
        if ($p === null) { return; }
        $st = Db::pdo()->prepare('SELECT id, email, display_name, role, created_at FROM staff WHERE parish_id = ? ORDER BY role = "rector" DESC, id ASC');
        $st->execute([$p['parish']['id']]);
        $out = [];
        foreach ($st->fetchAll() as $r) {
            $out[] = ['id' => (int)$r['id'], 'email' => $r['email'], 'display_name' => $r['display_name'], 'role' => $r['role'],
                      'created_at' => Validate::isoUtc($r['created_at']), 'is_you' => (int)$r['id'] === $p['staff']['id']];
        }
        Response::json(200, ['staff' => $out]);
    }

    /** POST /staff/delegates {email, display_name?} */
    public static function addDelegate(array $params): void
    {
        $p = self::ctx(true, true);
        if ($p === null) { return; }
        $b = self::json();
        if ($b === null) { return; }
        $errors = [];
        $email = Auth::normalizeEmail($b['email'] ?? null);
        if ($email === null) { $errors['email'] = 'Enter a valid email address.'; }
        [$name, $e] = Validate::text($b['display_name'] ?? null, 120, false);
        if ($e !== null) { $errors['display_name'] = $e; }
        if ($errors) { self::invalid($errors); return; }

        $pdo = Db::pdo();
        $pid = $p['parish']['id'];
        $pdo->beginTransaction();
        try {
            $pdo->prepare('SELECT id FROM parishes WHERE id = ? FOR UPDATE')->execute([$pid]);
            $cnt = $pdo->prepare("SELECT COUNT(*) FROM staff WHERE parish_id = ? AND role = 'delegate'");
            $cnt->execute([$pid]);
            if ((int)$cnt->fetchColumn() >= self::MAX_DELEGATES) {
                $pdo->rollBack();
                Response::error(409, 'limit_reached', 'A parish can have at most ' . self::MAX_DELEGATES . ' delegates.');
                return;
            }
            $pdo->prepare("INSERT INTO staff (parish_id, email, display_name, role, created_at) VALUES (?, ?, ?, 'delegate', UTC_TIMESTAMP())")
                ->execute([$pid, $email, $name]);
            $id = (int)$pdo->lastInsertId();
            $pdo->commit();
        } catch (PDOException $ex) {
            if ($pdo->inTransaction()) { $pdo->rollBack(); }
            if ($ex->getCode() === '23000') { // duplicate email: same answer whoever already holds it
                Response::error(409, 'conflict', 'That address cannot be added.');
                return;
            }
            throw $ex;
        }
        self::audit($p, 'delegate.add', "id=$id");
        Response::json(201, ['delegate' => ['id' => $id, 'email' => $email, 'display_name' => $name, 'role' => 'delegate']]);
    }

    /** DELETE /staff/delegates/{id} */
    public static function removeDelegate(array $params): void
    {
        $p = self::ctx(true, true);
        if ($p === null) { return; }
        $id = self::idParam($params);
        $pdo = Db::pdo();
        $st = $pdo->prepare('SELECT id, role FROM staff WHERE id = ? AND parish_id = ?');
        $st->execute([$id ?? 0, $p['parish']['id']]);
        $row = $st->fetch();
        if ($row === false) { Response::error(404, 'not_found', 'Not found.'); return; }
        if ($row['role'] !== 'delegate' || (int)$row['id'] === $p['staff']['id']) {
            Response::error(403, 'forbidden', 'Only delegates can be removed here.');
            return;
        }
        $pdo->prepare('DELETE FROM staff WHERE id = ?')->execute([$id]); // sessions cascade
        self::audit($p, 'delegate.remove', "id=$id");
        Response::json(200, ['status' => 'ok']);
    }

    // ---- Parish settings (rector only) ------------------------------------------

    /** PATCH /staff/parish {visibility: 'public'|'code'} */
    public static function updateParish(array $params): void
    {
        $p = self::ctx(true, true);
        if ($p === null) { return; }
        $b = self::json();
        if ($b === null) { return; }
        $vis = $b['visibility'] ?? null;
        if (!is_string($vis) || !in_array($vis, ['public', 'code'], true)) {
            self::invalid(['visibility' => "Choose 'public' or 'code'."]);
            return;
        }
        $pid = $p['parish']['id'];
        $pdo = Db::pdo();
        $out = ['parish' => ['slug' => $p['parish']['slug'], 'name' => $p['parish']['name'], 'visibility' => $vis]];
        if ($vis === $p['parish']['visibility']) { Response::json(200, $out); return; }

        if ($vis === 'code') {
            // A fresh code, and a bumped version so no pass from any earlier code survives.
            $code = Crypto::generateJoinCode();
            $pdo->prepare("UPDATE parishes SET visibility = 'code', join_code_enc = ?, join_code_version = join_code_version + 1 WHERE id = ?")
                ->execute([Crypto::encryptJoinCode($code), $pid]);
            $out['join_code'] = Crypto::formatJoinCode($code);
        } else {
            $pdo->prepare("UPDATE parishes SET visibility = 'public', join_code_enc = NULL, join_code_version = join_code_version + 1 WHERE id = ?")
                ->execute([$pid]);
        }
        self::audit($p, 'parish.visibility', $vis);
        Response::json(200, $out);
    }

    private static function currentCode(int $parishId): array
    {
        $st = Db::pdo()->prepare('SELECT visibility, join_code_enc, join_code_version FROM parishes WHERE id = ?');
        $st->execute([$parishId]);
        return $st->fetch();
    }

    /** GET /staff/parish/join-code */
    public static function getJoinCode(array $params): void
    {
        $p = self::ctx(false, true);
        if ($p === null) { return; }
        $r = self::currentCode($p['parish']['id']);
        $code = $r['visibility'] === 'code' ? Crypto::decryptJoinCode($r['join_code_enc']) : null;
        if ($code === null) { Response::error(404, 'not_found', 'This parish does not use a join code.'); return; }
        Response::json(200, ['join_code' => Crypto::formatJoinCode($code)]);
    }

    /** POST /staff/parish/join-code/rotate -- new code; every reader pass stops working. */
    public static function rotateJoinCode(array $params): void
    {
        $p = self::ctx(true, true);
        if ($p === null) { return; }
        $r = self::currentCode($p['parish']['id']);
        if ($r['visibility'] !== 'code') { Response::error(409, 'conflict', 'This parish does not use a join code.'); return; }
        $code = Crypto::generateJoinCode();
        Db::pdo()->prepare('UPDATE parishes SET join_code_enc = ?, join_code_version = join_code_version + 1 WHERE id = ?')
            ->execute([Crypto::encryptJoinCode($code), $p['parish']['id']]);
        self::audit($p, 'parish.join_code_rotate');
        Response::json(200, ['join_code' => Crypto::formatJoinCode($code)]);
    }

    // ---- Account deletion (Apple 5.1.1(v) / Google Play) ---------------------------

    /** DELETE /staff/me -- removes the caller and all their sessions. */
    public static function deleteMe(array $params): void
    {
        $p = self::ctx(true);
        if ($p === null) { return; }
        $pdo = Db::pdo();
        if ($p['staff']['role'] === 'rector') {
            $st = $pdo->prepare("SELECT COUNT(*) FROM staff WHERE parish_id = ? AND role = 'rector' AND id <> ?");
            $st->execute([$p['parish']['id'], $p['staff']['id']]);
            if ((int)$st->fetchColumn() < 1) {
                Response::error(409, 'conflict', 'You are the only rector. To leave, delete the parish instead (DELETE /staff/parish), or contact admin@theuniversaloffice.com.');
                return;
            }
        }
        self::audit($p, 'staff.delete_self');
        $pdo->prepare('DELETE FROM staff WHERE id = ?')->execute([$p['staff']['id']]); // sessions cascade
        Response::json(200, ['status' => 'ok']);
    }

    /** DELETE /staff/parish {confirm: "DELETE <slug>"} -- deletes the parish and everything in it. */
    public static function deleteParish(array $params): void
    {
        $p = self::ctx(true, true);
        if ($p === null) { return; }
        $b = self::json();
        if ($b === null) { return; }
        if (($b['confirm'] ?? null) !== 'DELETE ' . $p['parish']['slug']) {
            self::invalid(['confirm' => 'Type DELETE followed by the short name of the parish, for example: DELETE st-bede.']);
            return;
        }
        self::audit($p, 'parish.delete');
        Db::pdo()->prepare('DELETE FROM parishes WHERE id = ?')->execute([$p['parish']['id']]); // cascades everything
        Response::json(200, ['status' => 'ok']);
    }
}
