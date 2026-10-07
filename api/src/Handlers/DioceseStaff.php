<?php
// Diocesan sign-in (2026-10-07). A diocese editor is an address a GLOBAL ADMINISTRATOR designated for one
// diocese; nobody can claim a diocese for themselves. They sign in with an emailed code (or the optional password
// or passkey, see AccountApi) and keep that diocese's page through ParishPagesApi::putDiocese and friends.
// One address holds at most one diocese. Same rules as the other sign-ins: every failure is the same 401, a code
// request answers identically for every address, and the editor row is re-read on every request.
if (!defined('UO_API')) { exit; }

final class DioceseStaffApi
{
    private const HOUR = 3600;
    private const GENERIC_OK = ['status' => 'ok', 'message' => 'If that address is authorized, a code has been sent.'];

    // ---- Sign-in -----------------------------------------------------------------

    /** POST /diocese/auth/request-code {email} -- byte-identical answer whether or not the address is an editor. */
    public static function requestCode(array $params): void
    {
        [$b] = Request::jsonBody();
        if ($b === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        $email = Auth::normalizeEmail($b['email'] ?? null);
        if ($email === null) { Response::error(422, 'invalid_input', 'Invalid input.', ['email' => 'Enter a valid email address.']); return; }
        foreach ([['dioceseReq_email', $email, 5], ['dioceseReq_ip', Request::ip(), 20]] as [$name, $key, $limit]) {
            $rl = RateLimit::hit($name, $key, $limit, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        }
        $st = Db::pdo()->prepare('SELECT 1 FROM diocese_staff WHERE email = ? LIMIT 1');
        $st->execute([$email]);
        $job = $st->fetchColumn() === false ? null : function () use ($email): void {
            $code = Auth::issueCode('diocese', $email);
            Mailer::send($email, 'Your Universal Office code',
                "Your Universal Office code is $code.\n\nIt expires in " . Auth::CODE_TTL_MINUTES
                . " minutes. If you didn't ask for this, you can ignore this message.\n");
        };
        Response::json(200, self::GENERIC_OK);
        Deferred::run($job);
    }

    /** POST /diocese/auth/verify-code {email, code} -> {token, expires_at, diocese:{key}} or a generic 401. */
    public static function verifyCode(array $params): void
    {
        [$b] = Request::jsonBody();
        if ($b === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        $email = Auth::normalizeEmail($b['email'] ?? null);
        if ($email !== null) {
            $rl = RateLimit::hit('dioceseVerify_email', $email, 10, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        }
        if ($email === null || Auth::verifyCode('diocese', $email, $b['code'] ?? null) === null) {
            Response::error(401, 'unauthorized', 'That code was not accepted.');
            return;
        }
        $s = AccountApi::startSession('diocese', $email);
        if ($s === null) { Response::error(401, 'unauthorized', 'That code was not accepted.'); return; }
        $st = Db::pdo()->prepare('SELECT diocese_key FROM diocese_staff WHERE email = ?');
        $st->execute([$email]);
        Response::json(200, ['token' => $s['token'], 'expires_at' => $s['expires_at'], 'diocese' => ['key' => $st->fetchColumn()]]);
    }

    // ---- Designating editors (global administrators only) ---------------------------

    /** A global administrator (re-checked on every call) with the write rate limit applied; null after an emitted error. */
    private static function admin(bool $write): ?array
    {
        $p = Auth::require();
        if ($p === null) { return null; }
        if ($p['type'] !== 'admin') { Response::error(403, 'forbidden', 'Not allowed.'); return null; }
        $email = Auth::normalizeEmail($p['email'] ?? null);
        if ($email === null || !AdminApi::isAdminEmail($email)) { Response::error(401, 'unauthorized', 'Authentication required.'); return null; }
        if ($write) {
            $rl = RateLimit::hit('adminwrite', 'session:' . $p['session_id'], 60, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return null; }
        }
        return $p;
    }

    private static function keyFrom(array $params): ?string
    {
        $key = ($params['body'] ?? '') . '/' . ($params['name'] ?? '');
        return Validate::dioceseKey($key) ? $key : null;
    }

    /** GET /admin/dioceses/{body}/{name}/editors */
    public static function listEditors(array $params): void
    {
        if (self::admin(false) === null) { return; }
        $key = self::keyFrom($params);
        if ($key === null) { Response::error(404, 'not_found', 'Not found.'); return; }
        $st = Db::pdo()->prepare('SELECT id, email, created_at FROM diocese_staff WHERE diocese_key = ? ORDER BY id ASC');
        $st->execute([$key]);
        $out = [];
        foreach ($st->fetchAll() as $r) {
            $out[] = ['id' => (int)$r['id'], 'email' => $r['email'], 'added_at' => Validate::isoUtc($r['created_at'])];
        }
        Response::json(200, ['editors' => $out]);
    }

    /** POST /admin/dioceses/{body}/{name}/editors {email} -- emails the new editor how to sign in. */
    public static function addEditor(array $params): void
    {
        $p = self::admin(true);
        if ($p === null) { return; }
        $key = self::keyFrom($params);
        if ($key === null) { Response::error(404, 'not_found', 'Not found.'); return; }
        [$b] = Request::jsonBody();
        if ($b === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        $email = Auth::normalizeEmail($b['email'] ?? null);
        if ($email === null) { Response::error(422, 'invalid_input', 'Invalid input.', ['email' => 'Enter a valid email address.']); return; }
        $pdo = Db::pdo();
        $dup = $pdo->prepare('SELECT 1 FROM diocese_staff WHERE email = ?');
        $dup->execute([$email]);
        if ($dup->fetchColumn() !== false) { Response::error(409, 'conflict', 'That address already keeps a diocesan page.'); return; }
        $pdo->prepare('INSERT INTO diocese_staff (diocese_key, email, added_by, created_at) VALUES (?, ?, ?, UTC_TIMESTAMP())')
            ->execute([$key, $email, Auth::normalizeEmail($p['email'])]);
        $id = (int)$pdo->lastInsertId();
        Audit::log('admin', null, 'diocese.editor.add', "id=$id");
        Response::json(201, ['editor' => ['id' => $id, 'email' => $email]]);
        Deferred::run(function () use ($email): void {
            $url = rtrim((string)Config::get('site_url'), '/') . '/parish/diocese-admin.html';
            Mailer::send($email, 'You can now keep your diocese\'s page on The Universal Office',
                "You have been designated to keep your diocese's page on The Universal Office: the bishop, convention dates\n"
                . "and the bishop's prayer list.\n\n"
                . "To sign in, open $url and enter this email address. We then email you a 6-digit code.\n"
                . "A password or passkey is optional. If you did not expect this, you can ignore this message.\n");
        });
    }

    /** DELETE /admin/diocese-editors/{id} -- ends that person's sessions at once (they cascade with the row). */
    public static function removeEditor(array $params): void
    {
        if (self::admin(true) === null) { return; }
        $id = (string)($params['id'] ?? '');
        if (!ctype_digit($id) || strlen($id) > 18) { Response::error(404, 'not_found', 'Not found.'); return; }
        $n = Db::pdo()->prepare('DELETE FROM diocese_staff WHERE id = ?');
        $n->execute([(int)$id]);
        if ($n->rowCount() === 0) { Response::error(404, 'not_found', 'Not found.'); return; }
        Audit::log('admin', null, 'diocese.editor.remove', "id=$id");
        Response::json(200, ['status' => 'ok']);
    }
}
