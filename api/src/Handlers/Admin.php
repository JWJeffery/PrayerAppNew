<?php
// Admin endpoints (spec 8.5). The admin is the site owner: emails in config['admin_emails'].
if (!defined('UO_API')) { exit; }

final class AdminApi
{
    private const HOUR = 3600;
    private const GENERIC_OK = ['status' => 'ok', 'message' => 'If that address is authorized, a code has been sent.'];
    private const BAD_TOKEN = 'This approval link is invalid, already used, or has expired.';

    /** An OWNER: an address listed under admin_emails in the private config. Owners cannot be removed in the app. */
    public static function isOwnerEmail(string $email): bool
    {
        foreach ((array)Config::get('admin_emails', []) as $a) {
            if (Auth::normalizeEmail($a) === $email) { return true; }
        }
        return false;
    }

    /** Any global administrator: an owner, or an address an owner designated on the admin page (table admins). */
    public static function isAdminEmail(string $email): bool
    {
        if (self::isOwnerEmail($email)) { return true; }
        $st = Db::pdo()->prepare('SELECT 1 FROM admins WHERE email = ?');
        $st->execute([$email]);
        return $st->fetchColumn() !== false;
    }

    /**
     * Admin principal, else an emitted 401 (no session) or 403 (a staff session). The address behind the
     * session is checked against the administrator list on EVERY call, so removing someone ends their access
     * at once even if their 30-day sign-in has not expired.
     */
    private static function admin(): ?array
    {
        $p = Auth::require();
        if ($p === null) { return null; }
        if ($p['type'] !== 'admin') { Response::error(403, 'forbidden', 'Not allowed.'); return null; }
        $email = Auth::normalizeEmail($p['email'] ?? null);
        if ($email === null || !self::isAdminEmail($email)) { Response::error(401, 'unauthorized', 'Authentication required.'); return null; }
        return $p;
    }

    /** Admin principal for a handler that only owners may use (managing the administrator list). */
    private static function owner(): ?array
    {
        $p = self::admin();
        if ($p === null) { return null; }
        if (!self::isOwnerEmail((string)Auth::normalizeEmail($p['email']))) {
            Response::error(403, 'forbidden', 'Only an owner can manage administrators.');
            return null;
        }
        return $p;
    }

    // ---- Administrators (managed in the app) ------------------------------------

    /** GET /admin/admins -- owners (from the config) and designated administrators. */
    public static function listAdmins(array $params): void
    {
        $p = self::admin();
        if ($p === null) { return; }
        $out = [];
        foreach ((array)Config::get('admin_emails', []) as $a) {
            $e = Auth::normalizeEmail($a);
            if ($e !== null) { $out[] = ['id' => null, 'email' => $e, 'owner' => true, 'added_at' => null]; }
        }
        foreach (Db::pdo()->query('SELECT id, email, created_at FROM admins ORDER BY id ASC')->fetchAll() as $r) {
            $out[] = ['id' => (int)$r['id'], 'email' => $r['email'], 'owner' => false, 'added_at' => Validate::isoUtc($r['created_at'])];
        }
        $you = Auth::normalizeEmail($p['email']);
        Response::json(200, ['admins' => $out, 'you' => $you, 'can_manage' => self::isOwnerEmail((string)$you)]);
    }

    /** POST /admin/admins {email} -- owners only. Emails the new administrator how to sign in. */
    public static function addAdmin(array $params): void
    {
        $p = self::owner();
        if ($p === null) { return; }
        $rl = RateLimit::hit('adminwrite', 'session:' . $p['session_id'], 60, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        [$b] = Request::jsonBody();
        if ($b === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        $email = Auth::normalizeEmail($b['email'] ?? null);
        if ($email === null) { Response::error(422, 'invalid_input', 'Invalid input.', ['email' => 'Enter a valid email address.']); return; }
        if (self::isAdminEmail($email)) { Response::error(409, 'conflict', 'That address is already an administrator.'); return; }
        $pdo = Db::pdo();
        $pdo->prepare('INSERT INTO admins (email, added_by, created_at) VALUES (?, ?, UTC_TIMESTAMP())')
            ->execute([$email, Auth::normalizeEmail($p['email'])]);
        $id = (int)$pdo->lastInsertId();
        Audit::log('admin', null, 'admin.add', "id=$id");
        Response::json(201, ['admin' => ['id' => $id, 'email' => $email, 'owner' => false]]);
        Deferred::run(function () use ($email): void {
            $url = rtrim((string)Config::get('site_url'), '/') . '/parish/admin.html';
            Mailer::send($email, 'You are now an administrator of The Universal Office',
                "You have been designated an administrator of The Universal Office.\n\n"
                . "To sign in, open $url and enter this email address. We then email you a 6-digit code.\n"
                . "There is no password. If you did not expect this, you can ignore this message.\n");
        });
    }

    /** DELETE /admin/admins/{id} -- owners only. Ends that person's sessions at once. */
    public static function removeAdmin(array $params): void
    {
        $p = self::owner();
        if ($p === null) { return; }
        $rl = RateLimit::hit('adminwrite', 'session:' . $p['session_id'], 60, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        $id = (string)($params['id'] ?? '');
        if (!ctype_digit($id) || strlen($id) > 18) { Response::error(404, 'not_found', 'Not found.'); return; }
        $pdo = Db::pdo();
        $st = $pdo->prepare('SELECT email FROM admins WHERE id = ?');
        $st->execute([(int)$id]);
        $email = $st->fetchColumn();
        if ($email === false) { Response::error(404, 'not_found', 'Not found.'); return; }
        $pdo->prepare('DELETE FROM admins WHERE id = ?')->execute([(int)$id]);
        $pdo->prepare("DELETE FROM sessions WHERE principal = 'admin' AND admin_email = ?")->execute([$email]);
        Audit::log('admin', null, 'admin.remove', "id=$id");
        Response::json(200, ['status' => 'ok']);
    }

    // ---- Admin sign-in (same rules as staff, separate flow) --------------------

    /** POST /admin/auth/request-code {email} */
    public static function requestCode(array $params): void
    {
        [$b] = Request::jsonBody();
        if ($b === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        $email = Auth::normalizeEmail($b['email'] ?? null);
        if ($email === null) { Response::error(422, 'invalid_input', 'Invalid input.', ['email' => 'Enter a valid email address.']); return; }
        foreach ([['adminreq_email', $email, 5], ['adminreq_ip', Request::ip(), 20]] as [$name, $key, $limit]) {
            $rl = RateLimit::hit($name, $key, $limit, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        }
        $job = !self::isAdminEmail($email) ? null : function () use ($email): void {
            $code = Auth::issueCode('admin', $email);
            Mailer::send($email, 'Your Universal Office code',
                "Your Universal Office code is $code.\n\nIt expires in " . Auth::CODE_TTL_MINUTES
                . " minutes. If you didn't ask for this, you can ignore this message.\n");
        };
        Response::json(200, self::GENERIC_OK);
        Deferred::run($job);
    }

    /** POST /admin/auth/verify-code {email, code} -> {token, expires_at} */
    public static function verifyCode(array $params): void
    {
        [$b] = Request::jsonBody();
        if ($b === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        $email = Auth::normalizeEmail($b['email'] ?? null);
        if ($email !== null) {
            $rl = RateLimit::hit('adminverify_email', $email, 10, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        }
        if ($email === null || !self::isAdminEmail($email) || Auth::verifyCode('admin', $email, $b['code'] ?? null) === null) {
            Response::error(401, 'unauthorized', 'That code was not accepted.');
            return;
        }
        $s = Auth::createSession('admin', null, $email);
        Audit::log('admin', null, 'session.create');
        Response::json(200, ['token' => $s['token'], 'expires_at' => $s['expires_at'], 'admin' => ['email' => $email]]);
    }

    // ---- Approval by emailed token (the token IS the authorization; POST only) ---

    /** Valid, unused, unexpired approval token -> [tokenRowId, parishId, name, dioceseKey, status], else null. */
    private static function lookupToken($token): ?array
    {
        if (!is_string($token) || preg_match('/^[0-9a-f]{64}$/', $token) !== 1) { return null; }
        $st = Db::pdo()->prepare('SELECT t.id AS tid, p.id AS pid, p.name, p.diocese_key, p.status
                                  FROM approval_tokens t JOIN parishes p ON p.id = t.parish_id
                                  WHERE t.token_hash = ? AND t.used_at IS NULL AND t.expires_at > UTC_TIMESTAMP()');
        $st->execute([hash('sha256', $token)]);
        $r = $st->fetch();
        return $r === false ? null : $r;
    }

    private static function tokenLimit(): bool
    {
        $rl = RateLimit::hit('approvetoken_ip', Request::ip(), 30, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return false; }
        return true;
    }

    /** POST /admin/approval-info {token} -> the parish name and diocese only. */
    public static function approvalInfo(array $params): void
    {
        [$b] = Request::jsonBody();
        if ($b === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        if (!self::tokenLimit()) { return; }
        $t = self::lookupToken($b['token'] ?? null);
        if ($t === null || $t['status'] !== 'pending') { Response::error(400, 'bad_request', self::BAD_TOKEN); return; }
        Response::json(200, ['parish' => ['name' => $t['name'], 'diocese_key' => $t['diocese_key']]]);
    }

    /** POST /admin/approve {token} */
    public static function approve(array $params): void
    {
        [$b] = Request::jsonBody();
        if ($b === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        if (!self::tokenLimit()) { return; }
        $t = self::lookupToken($b['token'] ?? null);
        if ($t === null || $t['status'] !== 'pending') { Response::error(400, 'bad_request', self::BAD_TOKEN); return; }

        $pdo = Db::pdo();
        // Single use, atomically: only one caller can flip used_at from NULL.
        $use = $pdo->prepare('UPDATE approval_tokens SET used_at = UTC_TIMESTAMP() WHERE id = ? AND used_at IS NULL');
        $use->execute([$t['tid']]);
        if ($use->rowCount() !== 1) { Response::error(400, 'bad_request', self::BAD_TOKEN); return; }
        self::approveParish((int)$t['pid'], 'admin-token');
        $slug = $pdo->query('SELECT slug FROM parishes WHERE id = ' . (int)$t['pid'])->fetchColumn();
        Response::json(200, ['status' => 'approved', 'parish' => ['slug' => $slug, 'name' => $t['name']]]);
        self::mailRectors((int)$t['pid']);
    }

    private static function approveParish(int $parishId, string $actor): void
    {
        Db::pdo()->prepare("UPDATE parishes SET status = 'approved', approved_at = UTC_TIMESTAMP() WHERE id = ? AND status = 'pending'")
            ->execute([$parishId]);
        Audit::log($actor, $parishId, 'parish.approve');
    }

    private static function mailRectors(int $parishId): void
    {
        Deferred::run(function () use ($parishId): void {
            $st = Db::pdo()->prepare("SELECT email FROM staff WHERE parish_id = ? AND role = 'rector'");
            $st->execute([$parishId]);
            $url = rtrim((string)Config::get('site_url'), '/') . '/parish/';
            foreach ($st->fetchAll(PDO::FETCH_COLUMN) as $email) {
                Mailer::send($email, 'Your parish is approved',
                    "Your parish is approved on The Universal Office.\n\nLog in at $url with your email address; we will email you a code.\n");
            }
        });
    }

    // ---- Admin session endpoints ----------------------------------------------------

    /** GET /admin/parishes -- no intention text, ever. */
    public static function listParishes(array $params): void
    {
        if (self::admin() === null) { return; }
        $rows = Db::pdo()->query(
            "SELECT p.id, p.slug, p.name, p.diocese_key, p.visibility, p.status, p.created_at, p.approved_at,
                    (SELECT COUNT(*) FROM staff s WHERE s.parish_id = p.id) AS staff_count,
                    (SELECT COUNT(*) FROM intentions i WHERE i.parish_id = p.id AND i.expires_at > UTC_TIMESTAMP()) AS active_intentions,
                    (SELECT s2.email FROM staff s2 WHERE s2.parish_id = p.id AND s2.role = 'rector' ORDER BY s2.id LIMIT 1) AS rector_email,
                    (SELECT s3.display_name FROM staff s3 WHERE s3.parish_id = p.id AND s3.role = 'rector' ORDER BY s3.id LIMIT 1) AS rector_name
             FROM parishes p ORDER BY FIELD(p.status, 'pending', 'approved', 'suspended'), p.created_at DESC"
        )->fetchAll();
        $out = array_map(fn($r) => [
            'id' => (int)$r['id'], 'slug' => $r['slug'], 'name' => $r['name'], 'diocese_key' => $r['diocese_key'],
            'visibility' => $r['visibility'], 'status' => $r['status'],
            'staff_count' => (int)$r['staff_count'], 'active_intentions' => (int)$r['active_intentions'],
            'rector_name' => $r['rector_name'], 'rector_email' => $r['rector_email'],
            'created_at' => Validate::isoUtc($r['created_at']),
            'approved_at' => $r['approved_at'] === null ? null : Validate::isoUtc($r['approved_at']),
        ], $rows);
        Response::json(200, ['parishes' => $out]);
    }

    private static function parishById(array $params): ?array
    {
        $id = (string)($params['id'] ?? '');
        if (!ctype_digit($id) || strlen($id) > 18) { Response::error(404, 'not_found', 'Not found.'); return null; }
        $st = Db::pdo()->prepare('SELECT id, slug, name, status FROM parishes WHERE id = ?');
        $st->execute([(int)$id]);
        $r = $st->fetch();
        if ($r === false) { Response::error(404, 'not_found', 'Not found.'); return null; }
        return $r;
    }

    /** POST /admin/parishes/{id}/approve -- approve from the admin page (no email token needed). */
    public static function approveById(array $params): void
    {
        if (self::admin() === null) { return; }
        $p = self::parishById($params);
        if ($p === null) { return; }
        if ($p['status'] !== 'pending') { Response::error(409, 'conflict', 'Only a pending parish can be approved.'); return; }
        Db::pdo()->prepare("UPDATE approval_tokens SET used_at = UTC_TIMESTAMP() WHERE parish_id = ? AND used_at IS NULL")->execute([$p['id']]);
        self::approveParish((int)$p['id'], 'admin');
        Response::json(200, ['status' => 'approved']);
        self::mailRectors((int)$p['id']);
    }

    /** POST /admin/parishes/{id}/suspend */
    public static function suspend(array $params): void
    {
        if (self::admin() === null) { return; }
        $p = self::parishById($params);
        if ($p === null) { return; }
        if ($p['status'] !== 'approved') { Response::error(409, 'conflict', 'Only an approved parish can be suspended.'); return; }
        Db::pdo()->prepare("UPDATE parishes SET status = 'suspended' WHERE id = ?")->execute([$p['id']]);
        Audit::log('admin', (int)$p['id'], 'parish.suspend');
        Response::json(200, ['status' => 'suspended']);
    }

    /** POST /admin/parishes/{id}/unsuspend */
    public static function unsuspend(array $params): void
    {
        if (self::admin() === null) { return; }
        $p = self::parishById($params);
        if ($p === null) { return; }
        if ($p['status'] !== 'suspended') { Response::error(409, 'conflict', 'Only a suspended parish can be restored.'); return; }
        Db::pdo()->prepare("UPDATE parishes SET status = 'approved' WHERE id = ?")->execute([$p['id']]);
        Audit::log('admin', (int)$p['id'], 'parish.unsuspend');
        Response::json(200, ['status' => 'approved']);
    }

    /** DELETE /admin/parishes/{id} {confirm: "DELETE <slug>"} -- cascade delete. */
    public static function delete(array $params): void
    {
        if (self::admin() === null) { return; }
        $p = self::parishById($params);
        if ($p === null) { return; }
        [$b] = Request::jsonBody();
        if (($b['confirm'] ?? null) !== 'DELETE ' . $p['slug']) {
            Response::error(422, 'invalid_input', 'Invalid input.', ['confirm' => 'Type DELETE followed by the parish short name to confirm.']);
            return;
        }
        Audit::log('admin', (int)$p['id'], 'parish.delete');
        Db::pdo()->prepare('DELETE FROM parishes WHERE id = ?')->execute([$p['id']]);
        Response::json(200, ['status' => 'ok']);
    }

    /** GET /admin/status -- deployment self-check for the admin (no secrets). */
    public static function status(array $params): void
    {
        if (self::admin() === null) { return; }
        $pdo = Db::pdo();
        Response::json(200, [
            'php' => PHP_VERSION,
            'extensions' => ['sodium' => extension_loaded('sodium'), 'pdo_mysql' => extension_loaded('pdo_mysql'),
                             'mbstring' => extension_loaded('mbstring'), 'openssl' => extension_loaded('openssl')],
            'database' => true,
            'migrations' => $applied = $pdo->query('SELECT version FROM schema_migrations ORDER BY version')->fetchAll(PDO::FETCH_COLUMN),
            // Update files shipped with this code that the database has not recorded yet: they still need importing.
            'pending_migrations' => array_values(array_diff(
                array_map(fn($f) => basename($f, '.sql'), glob(dirname(__DIR__, 2) . '/migrations/*.sql') ?: []), $applied)),
            'mail_driver' => Config::get('mail.driver'),
            'time_utc' => gmdate('Y-m-d\TH:i:s\Z'),
        ]);
    }
}
