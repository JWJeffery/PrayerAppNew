<?php
// Staff authentication endpoints (spec 8.3): request-code, verify-code, logout, /me.
if (!defined('UO_API')) { exit; }

final class AuthApi
{
    private const HOUR = 3600;
    private const GENERIC_OK = ['status' => 'ok', 'message' => 'If that address is authorized, a code has been sent.'];

    /** POST /auth/request-code {email} -- byte-identical answer whether or not the address is authorized. */
    public static function requestCode(array $params): void
    {
        [$body] = Request::jsonBody();
        if ($body === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        $email = Auth::normalizeEmail($body['email'] ?? null);
        if ($email === null) {
            Response::error(422, 'invalid_input', 'Invalid input.', ['email' => 'Enter a valid email address.']);
            return;
        }
        foreach ([['reqcode_email', $email, 5], ['reqcode_ip', Request::ip(), 20]] as [$name, $key, $limit]) {
            $rl = RateLimit::hit($name, $key, $limit, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        }

        // Only staff of an APPROVED parish get mail. The lookup is the only branch before the reply.
        $st = Db::pdo()->prepare("SELECT 1 FROM staff st JOIN parishes p ON p.id = st.parish_id
                                  WHERE st.email = ? AND p.status = 'approved' LIMIT 1");
        $st->execute([$email]);
        $job = $st->fetchColumn() === false ? null : function () use ($email): void {
            $code = Auth::issueCode('login', $email);
            Mailer::send($email, 'Your Universal Office code',
                "Your Universal Office code is $code.\n\nIt expires in " . Auth::CODE_TTL_MINUTES
                . " minutes. If you didn't ask for this, you can ignore this message.\n");
        };

        Response::json(200, self::GENERIC_OK);
        Deferred::run($job);
    }

    /** POST /auth/verify-code {email, code} -> {token, expires_at, staff, parish} or a generic 401. */
    public static function verifyCode(array $params): void
    {
        [$body] = Request::jsonBody();
        if ($body === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        $email = Auth::normalizeEmail($body['email'] ?? null);
        if ($email !== null) {
            $rl = RateLimit::hit('verify_email', $email, 10, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        }
        $fail = fn() => Response::error(401, 'unauthorized', 'That code was not accepted.'); // one message for every failure

        if ($email === null || Auth::verifyCode('login', $email, $body['code'] ?? null) === null) { $fail(); return; }

        $st = Db::pdo()->prepare("SELECT st.id, st.role, st.display_name, p.id AS pid, p.slug, p.name, p.visibility, p.status
                                  FROM staff st JOIN parishes p ON p.id = st.parish_id
                                  WHERE st.email = ? AND p.status = 'approved'");
        $st->execute([$email]);
        $s = $st->fetch();
        if ($s === false) { $fail(); return; }

        $session = Auth::createSession('staff', (int)$s['id']);
        Audit::log('staff:' . $s['id'], (int)$s['pid'], 'session.create');
        Response::json(200, [
            'token' => $session['token'],
            'expires_at' => $session['expires_at'],
            'staff' => ['id' => (int)$s['id'], 'role' => $s['role'], 'display_name' => $s['display_name']],
            'parish' => ['slug' => $s['slug'], 'name' => $s['name'], 'visibility' => $s['visibility'], 'status' => $s['status']],
        ]);
    }

    /** POST /auth/logout */
    public static function logout(array $params): void
    {
        $p = Auth::require();
        if ($p === null) { return; }
        Auth::deleteSession($p['session_id']);
        Response::json(200, ['status' => 'ok']);
    }

    /** GET /me -- who is signed in, and how they can sign in (never the password or any secret). */
    public static function me(array $params): void
    {
        $p = Auth::require();
        if ($p === null) { return; }
        $account = AccountApi::summary((string)Auth::emailOf($p));
        if ($p['type'] === 'admin') { Response::json(200, ['principal' => 'admin', 'email' => $p['email'], 'account' => $account]); return; }
        if ($p['type'] === 'reader') { Response::json(200, ['principal' => 'reader', 'email' => $p['reader']['email'], 'account' => $account]); return; }
        $parish = $p['parish'];
        unset($parish['id']);
        Response::json(200, ['principal' => 'staff', 'staff' => $p['staff'], 'parish' => $parish, 'account' => $account]);
    }
}
