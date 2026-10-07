<?php
// Optional accounts (2026-10-07): readers who keep their settings, an optional password for anyone who signs
// in, and passkeys. Emailed codes keep working for everyone; a password or passkey is an extra way in, never
// a requirement. Sessions stay bearer tokens (never cookies). Nothing here returns a password, a hash or a
// passkey's secret.
if (!defined('UO_API')) { exit; }

final class AccountApi
{
    private const HOUR = 3600;
    /** A session counts as "just confirmed" for this long after sign-in or an emailed re-confirmation. */
    private const FRESH_SECONDS = 900;
    private const PROFILE_MAX_BYTES = 7000;   // the whole request body may not exceed 8 KB, so the wrapper fits too

    // ---- Shared plumbing ---------------------------------------------------------

    private static function json(): ?array
    {
        [$body] = Request::jsonBody();
        if ($body === null) { Response::error(400, 'bad_request', 'Bad request.'); }
        return $body;
    }

    /** Any signed-in session, with its address; an emitted 401 and null otherwise. $write counts against 60 per hour. */
    private static function ctx(bool $write): ?array
    {
        $p = Auth::require();
        if ($p === null) { return null; }
        $email = Auth::emailOf($p);
        if ($email === null) { Response::error(401, 'unauthorized', 'Authentication required.'); return null; }
        if ($write) {
            $rl = RateLimit::hit('accountwrite', 'session:' . $p['session_id'], 60, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return null; }
        }
        return [$p, $email];
    }

    public static function summary(string $email): array
    {
        $pdo = Db::pdo();
        $pw = $pdo->prepare('SELECT 1 FROM credentials WHERE email = ?');
        $pw->execute([$email]);
        $pk = $pdo->prepare('SELECT COUNT(*) FROM passkeys WHERE email = ?');
        $pk->execute([$email]);
        return ['email' => $email, 'has_password' => $pw->fetchColumn() !== false, 'passkeys' => (int)$pk->fetchColumn()];
    }

    private static function storedHash(string $email): ?string
    {
        $st = Db::pdo()->prepare('SELECT password_hash FROM credentials WHERE email = ?');
        $st->execute([$email]);
        $h = $st->fetchColumn();
        return $h === false ? null : $h;
    }

    /**
     * Changing how someone signs in needs a recent proof it is really them: signed in or confirmed by an emailed
     * code in the last 15 minutes, or the current password given with the request. Emits 403 reauth_required when
     * neither holds. A stolen, idle session therefore cannot quietly add a password or passkey of its own.
     */
    private static function confirmed(array $p, string $email, array $body): bool
    {
        if (($p['fresh_age'] ?? PHP_INT_MAX) <= self::FRESH_SECONDS) { return true; }
        $hash = self::storedHash($email);
        if ($hash !== null && array_key_exists('current_password', $body) && Password::verify($body['current_password'], $hash)) { return true; }
        Response::error(403, 'reauth_required', 'Please confirm it is you first.');
        return false;
    }

    /** Sign out every other session for this address, in every role. Used after a password change or removal. */
    private static function endOtherSessions(int $keepSessionId, string $email): void
    {
        Db::pdo()->prepare("DELETE FROM sessions WHERE id <> ? AND (
                              admin_email = ?
                              OR staff_id IN (SELECT id FROM staff WHERE email = ?)
                              OR reader_id IN (SELECT id FROM readers WHERE email = ?))")
            ->execute([$keepSessionId, $email, $email, $email]);
    }

    /** Start a session for $email in role $as ('staff' | 'admin' | 'reader'); null when that address does not hold the role. */
    public static function startSession(string $as, string $email): ?array
    {
        $pdo = Db::pdo();
        if ($as === 'staff') {
            $st = $pdo->prepare("SELECT st.id, st.parish_id FROM staff st JOIN parishes p ON p.id = st.parish_id
                                 WHERE st.email = ? AND p.status = 'approved'");
            $st->execute([$email]);
            $r = $st->fetch();
            if ($r === false) { return null; }
            $s = Auth::createSession('staff', (int)$r['id']);
            Audit::log('staff:' . $r['id'], (int)$r['parish_id'], 'session.create');
            return $s + ['principal' => 'staff'];
        }
        if ($as === 'admin') {
            if (!AdminApi::isAdminEmail($email)) { return null; }
            $s = Auth::createSession('admin', null, $email);
            Audit::log('admin', null, 'session.create');
            return $s + ['principal' => 'admin'];
        }
        if ($as === 'reader') {
            $st = $pdo->prepare('SELECT id FROM readers WHERE email = ?');
            $st->execute([$email]);
            $id = $st->fetchColumn();
            if ($id === false) { return null; }
            $pdo->prepare('UPDATE readers SET last_login_at = UTC_TIMESTAMP() WHERE id = ?')->execute([(int)$id]);
            $s = Auth::createSession('reader', null, null, (int)$id);
            Audit::log('reader:' . $id, null, 'session.create');
            return $s + ['principal' => 'reader'];
        }
        return null;
    }

    private static function roleOf($v): ?string
    {
        return in_array($v, ['staff', 'admin', 'reader'], true) ? $v : null;
    }

    // ---- Readers: emailed code ---------------------------------------------------

    /** POST /reader/request-code {email} -- any valid address may ask; the answer never says whether it has an account. */
    public static function readerRequestCode(array $params): void
    {
        $b = self::json();
        if ($b === null) { return; }
        $email = Auth::normalizeEmail($b['email'] ?? null);
        if ($email === null) { Response::error(422, 'invalid_input', 'Invalid input.', ['email' => 'Enter a valid email address.']); return; }
        foreach ([['readerreq_email', $email, 5], ['readerreq_ip', Request::ip(), 20]] as [$name, $key, $limit]) {
            $rl = RateLimit::hit($name, $key, $limit, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        }
        Response::json(200, ['status' => 'ok', 'message' => 'If that address is valid, a code has been sent.']);
        Deferred::run(function () use ($email): void {
            $code = Auth::issueCode('reader', $email);
            Mailer::send($email, 'Your Universal Office code',
                "Your Universal Office code is $code.\n\nIt expires in " . Auth::CODE_TTL_MINUTES
                . " minutes. If you didn't ask for this, you can ignore this message.\n");
        });
    }

    /** POST /reader/verify-code {email, code} -- the first correct code creates the account. */
    public static function readerVerifyCode(array $params): void
    {
        $b = self::json();
        if ($b === null) { return; }
        $email = Auth::normalizeEmail($b['email'] ?? null);
        if ($email !== null) {
            $rl = RateLimit::hit('readerverify_email', $email, 10, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        }
        if ($email === null || Auth::verifyCode('reader', $email, $b['code'] ?? null) === null) {
            Response::error(401, 'unauthorized', 'That code was not accepted.');
            return;
        }
        Db::pdo()->prepare('INSERT INTO readers (email, created_at, last_login_at) VALUES (?, UTC_TIMESTAMP(), UTC_TIMESTAMP())
                            ON DUPLICATE KEY UPDATE last_login_at = UTC_TIMESTAMP()')->execute([$email]);
        $s = self::startSession('reader', $email);
        Response::json(200, ['token' => $s['token'], 'expires_at' => $s['expires_at'], 'principal' => 'reader', 'account' => self::summary($email)]);
    }

    // ---- Password sign-in ----------------------------------------------------------

    /** POST /auth/password-login {email, password, as} -- as: 'staff' | 'admin' | 'reader'. One generic answer for every failure. */
    public static function passwordLogin(array $params): void
    {
        $b = self::json();
        if ($b === null) { return; }
        $email = Auth::normalizeEmail($b['email'] ?? null);
        $as = self::roleOf($b['as'] ?? null);
        $rl = RateLimit::hit('pwlogin_ip', Request::ip(), 40, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        if ($email !== null) {
            $rl = RateLimit::hit('pwlogin_email', $email, 10, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        }
        $hash = $email === null ? null : self::storedHash($email);
        $ok = Password::verify($b['password'] ?? null, $hash);   // costs the same whether or not a password exists
        $s = ($ok && $email !== null && $as !== null) ? self::startSession($as, $email) : null;
        if ($s === null) { Response::error(401, 'unauthorized', 'That email and password were not accepted.'); return; }
        Response::json(200, ['token' => $s['token'], 'expires_at' => $s['expires_at'], 'principal' => $s['principal']]);
    }

    // ---- Other providers (Apple, Google, Facebook ...) -- switched off until a provider is added -------

    /** POST /auth/social {provider, id_token, as} */
    public static function socialLogin(array $params): void
    {
        $b = self::json();
        if ($b === null) { return; }
        $rl = RateLimit::hit('social_ip', Request::ip(), 40, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        $provider = $b['provider'] ?? null;
        $verifier = Social::verifier($provider);
        if ($verifier === null) { Response::error(400, 'provider_unavailable', 'That way of signing in is not available.'); return; }
        $as = self::roleOf($b['as'] ?? null);
        $token = $b['id_token'] ?? null;
        $claims = (is_string($token) && $token !== '' && strlen($token) <= 8192) ? $verifier->verify($token) : null;
        $subject = is_array($claims) && is_string($claims['subject'] ?? null) ? $claims['subject'] : '';
        $pdo = Db::pdo();
        $email = null;
        if ($subject !== '' && strlen($subject) <= 255) {
            $known = $pdo->prepare('SELECT id, email FROM identities WHERE provider = ? AND subject = ?');
            $known->execute([$provider, $subject]);
            $row = $known->fetch();
            if ($row !== false) {
                // Already linked: the provider's own stable id is what identifies them, even if their address there changed.
                $email = $row['email'];
                $pdo->prepare('UPDATE identities SET last_used_at = UTC_TIMESTAMP() WHERE id = ?')->execute([(int)$row['id']]);
            } elseif (($claims['email_verified'] ?? false) === true && ($e = Auth::normalizeEmail($claims['email'] ?? null)) !== null) {
                // First time: link to the account that owns this address. Only a provider-VERIFIED address may be
                // linked, so nobody can claim an address they have not proved they own.
                $email = $e;
                if ($as === 'reader') {
                    $pdo->prepare('INSERT INTO readers (email, created_at, last_login_at) VALUES (?, UTC_TIMESTAMP(), UTC_TIMESTAMP())
                                   ON DUPLICATE KEY UPDATE last_login_at = UTC_TIMESTAMP()')->execute([$email]);
                }
                $pdo->prepare('INSERT INTO identities (provider, subject, email, created_at, last_used_at) VALUES (?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())')
                    ->execute([$provider, $subject, $email]);
            }
        }
        $s = ($email !== null && $as !== null) ? self::startSession($as, $email) : null;
        if ($s === null) { Response::error(401, 'unauthorized', 'That sign-in was not accepted.'); return; }
        Response::json(200, ['token' => $s['token'], 'expires_at' => $s['expires_at'], 'principal' => $s['principal']]);
    }

    // ---- Re-confirming with an emailed code -----------------------------------------

    /** POST /account/reauth/request-code */
    public static function reauthRequestCode(array $params): void
    {
        $c = self::ctx(false);
        if ($c === null) { return; }
        [$p, $email] = $c;
        $rl = RateLimit::hit('reauthreq', 'session:' . $p['session_id'], 5, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        Response::json(200, ['status' => 'ok']);
        Deferred::run(function () use ($email): void {
            $code = Auth::issueCode('reauth', $email);
            Mailer::send($email, 'Confirm it is you: your Universal Office code',
                "Your Universal Office confirmation code is $code.\n\nIt expires in " . Auth::CODE_TTL_MINUTES
                . " minutes. If you didn't ask for this, you can ignore this message.\n");
        });
    }

    /** POST /account/reauth {code} */
    public static function reauth(array $params): void
    {
        $c = self::ctx(false);
        if ($c === null) { return; }
        [$p, $email] = $c;
        $b = self::json();
        if ($b === null) { return; }
        $rl = RateLimit::hit('reauthverify', 'session:' . $p['session_id'], 10, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        if (Auth::verifyCode('reauth', $email, $b['code'] ?? null) === null) {
            Response::error(401, 'unauthorized', 'That code was not accepted.');
            return;
        }
        Db::pdo()->prepare('UPDATE sessions SET reauth_at = UTC_TIMESTAMP() WHERE id = ?')->execute([$p['session_id']]);
        Response::json(200, ['status' => 'ok']);
    }

    // ---- Password: add, change, remove ------------------------------------------------

    /** POST /account/password {password, current_password?} */
    public static function setPassword(array $params): void
    {
        $c = self::ctx(true);
        if ($c === null) { return; }
        [$p, $email] = $c;
        $b = self::json();
        if ($b === null) { return; }
        if (!self::confirmed($p, $email, $b)) { return; }
        $problem = Password::problem($b['password'] ?? null, $email);
        if ($problem !== null) { Response::error(422, 'invalid_input', 'Invalid input.', ['password' => $problem]); return; }
        Db::pdo()->prepare('INSERT INTO credentials (email, password_hash, updated_at) VALUES (?, ?, UTC_TIMESTAMP())
                            ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), updated_at = UTC_TIMESTAMP()')
            ->execute([$email, Password::hash($b['password'])]);
        self::endOtherSessions($p['session_id'], $email);
        Audit::log(self::actor($p), null, 'password.set');
        Response::json(200, ['account' => self::summary($email)]);
    }

    /** DELETE /account/password {current_password?} */
    public static function removePassword(array $params): void
    {
        $c = self::ctx(true);
        if ($c === null) { return; }
        [$p, $email] = $c;
        $b = self::json();
        if ($b === null) { return; }
        if (!self::confirmed($p, $email, $b)) { return; }
        Db::pdo()->prepare('DELETE FROM credentials WHERE email = ?')->execute([$email]);
        self::endOtherSessions($p['session_id'], $email);
        Audit::log(self::actor($p), null, 'password.remove');
        Response::json(200, ['account' => self::summary($email)]);
    }

    private static function actor(array $p): string
    {
        return $p['type'] === 'staff' ? 'staff:' . $p['staff']['id'] : ($p['type'] === 'reader' ? 'reader:' . $p['reader']['id'] : 'admin');
    }

    // ---- Passkeys -----------------------------------------------------------------------

    private static function passkeyRow(array $r): array
    {
        return ['id' => (int)$r['id'], 'label' => $r['label'], 'created_at' => Validate::isoUtc($r['created_at']),
                'last_used_at' => $r['last_used_at'] === null ? null : Validate::isoUtc($r['last_used_at'])];
    }

    /** GET /account/passkeys */
    public static function listPasskeys(array $params): void
    {
        $c = self::ctx(false);
        if ($c === null) { return; }
        $st = Db::pdo()->prepare('SELECT id, label, created_at, last_used_at FROM passkeys WHERE email = ? ORDER BY id ASC');
        $st->execute([$c[1]]);
        Response::json(200, ['passkeys' => array_map([self::class, 'passkeyRow'], $st->fetchAll())]);
    }

    /** POST /account/passkeys/options {current_password?} -> {token, publicKey} for navigator.credentials.create */
    public static function passkeyRegisterOptions(array $params): void
    {
        $c = self::ctx(true);
        if ($c === null) { return; }
        [$p, $email] = $c;
        $b = self::json();
        if ($b === null) { return; }
        if (!self::confirmed($p, $email, $b)) { return; }
        Response::json(200, Passkeys::registrationOptions($email));
    }

    /** POST /account/passkeys {token, clientDataJSON, attestationObject, label?, current_password?} */
    public static function passkeyRegister(array $params): void
    {
        $c = self::ctx(true);
        if ($c === null) { return; }
        [$p, $email] = $c;
        $b = self::json();
        if ($b === null) { return; }
        if (!self::confirmed($p, $email, $b)) { return; }
        $r = Passkeys::finishRegistration($email, $b['token'] ?? null, $b['clientDataJSON'] ?? null, $b['attestationObject'] ?? null, $b['label'] ?? null);
        if (!$r['ok']) {
            $msg = ['expired' => 'That took too long. Please try again.', 'limit' => 'You already have ' . Passkeys::MAX_PER_ACCOUNT . ' passkeys. Remove one first.',
                    'duplicate' => 'That passkey is already saved.', 'rejected' => 'That passkey could not be verified.'][$r['error']] ?? 'That passkey could not be saved.';
            Response::error($r['error'] === 'limit' ? 409 : 422, $r['error'] === 'limit' ? 'limit_reached' : 'invalid_input', $msg);
            return;
        }
        Audit::log(self::actor($p), null, 'passkey.add', 'id=' . $r['id']);
        Response::json(201, ['account' => self::summary($email)]);
    }

    /** DELETE /account/passkeys/{id} {current_password?} */
    public static function passkeyDelete(array $params): void
    {
        $c = self::ctx(true);
        if ($c === null) { return; }
        [$p, $email] = $c;
        $b = self::json();
        if ($b === null) { return; }
        if (!self::confirmed($p, $email, $b)) { return; }
        $id = (string)($params['id'] ?? '');
        if (!ctype_digit($id) || strlen($id) > 18) { Response::error(404, 'not_found', 'Not found.'); return; }
        $del = Db::pdo()->prepare('DELETE FROM passkeys WHERE id = ? AND email = ?');
        $del->execute([(int)$id, $email]);
        if ($del->rowCount() !== 1) { Response::error(404, 'not_found', 'Not found.'); return; }
        Audit::log(self::actor($p), null, 'passkey.remove', "id=$id");
        Response::json(200, ['account' => self::summary($email)]);
    }

    /** POST /passkey/login/options -> {token, publicKey} for navigator.credentials.get (no address needed) */
    public static function passkeyLoginOptions(array $params): void
    {
        $rl = RateLimit::hit('passkeyopts_ip', Request::ip(), 60, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        Response::json(200, Passkeys::loginOptions());
    }

    /** POST /passkey/login {token, as, id, clientDataJSON, authenticatorData, signature} */
    public static function passkeyLogin(array $params): void
    {
        $b = self::json();
        if ($b === null) { return; }
        $rl = RateLimit::hit('passkeylogin_ip', Request::ip(), 40, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        $as = self::roleOf($b['as'] ?? null);
        $email = Passkeys::finishLogin($b['token'] ?? null, $b['id'] ?? null, $b['clientDataJSON'] ?? null, $b['authenticatorData'] ?? null, $b['signature'] ?? null);
        $s = ($email !== null && $as !== null) ? self::startSession($as, $email) : null;
        if ($s === null) { Response::error(401, 'unauthorized', 'That passkey was not accepted.'); return; }
        Response::json(200, ['token' => $s['token'], 'expires_at' => $s['expires_at'], 'principal' => $s['principal']]);
    }

    // ---- Reader settings (the profile the app keeps) ----------------------------------------

    private static function readerCtx(bool $write): ?array
    {
        $c = self::ctx($write);
        if ($c === null) { return null; }
        if ($c[0]['type'] !== 'reader') { Response::error(403, 'forbidden', 'Not allowed.'); return null; }
        return $c;
    }

    /** GET /reader/profile -> {profile: object|null, updated_at: string|null} */
    public static function getProfile(array $params): void
    {
        $c = self::readerCtx(false);
        if ($c === null) { return; }
        $st = Db::pdo()->prepare('SELECT profile_enc, profile_updated_at FROM readers WHERE id = ?');
        $st->execute([$c[0]['reader']['id']]);
        $r = $st->fetch();
        $plain = $r['profile_enc'] === null ? null : Crypto::unseal($r['profile_enc']);
        $profile = $plain === null ? null : json_decode($plain, true);
        Response::json(200, ['profile' => is_array($profile) ? (object)$profile : null,
                             'updated_at' => $r['profile_updated_at'] === null ? null : Validate::isoUtc($r['profile_updated_at'])]);
    }

    /** PUT /reader/profile {profile} -- replaces the saved settings. Plain values only; stored encrypted. */
    public static function putProfile(array $params): void
    {
        $c = self::readerCtx(true);
        if ($c === null) { return; }
        $b = self::json();
        if ($b === null) { return; }
        $profile = $b['profile'] ?? null;
        $err = null;
        if (!is_array($profile) || ($profile !== [] && array_keys($profile) === range(0, count($profile) - 1))) { $err = 'Settings must be an object.'; }
        elseif (count($profile) > 60) { $err = 'Too many settings.'; }
        else {
            foreach ($profile as $k => $v) {
                if (!is_string($k) || preg_match('/^[A-Za-z][A-Za-z0-9_]{0,59}$/', $k) !== 1) { $err = 'A setting has an invalid name.'; break; }
                if (!(is_null($v) || is_bool($v) || is_int($v) || is_float($v) || (is_string($v) && mb_strlen($v, 'UTF-8') <= 600 && mb_check_encoding($v, 'UTF-8')))) {
                    $err = 'A setting has an invalid value.'; break;
                }
            }
        }
        $encoded = $err === null ? json_encode($profile, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : false;
        if ($err === null && ($encoded === false || strlen($encoded) > self::PROFILE_MAX_BYTES)) { $err = 'Your settings are too large.'; }
        if ($err !== null) { Response::error(422, 'invalid_input', 'Invalid input.', ['profile' => $err]); return; }
        Db::pdo()->prepare('UPDATE readers SET profile_enc = ?, profile_updated_at = UTC_TIMESTAMP() WHERE id = ?')
            ->execute([Crypto::seal($encoded), $c[0]['reader']['id']]);
        $at = Db::pdo()->prepare('SELECT profile_updated_at FROM readers WHERE id = ?');
        $at->execute([$c[0]['reader']['id']]);
        Response::json(200, ['updated_at' => Validate::isoUtc($at->fetchColumn())]);
    }

    /** DELETE /account {current_password?} -- a reader deletes their account and everything saved with it. */
    public static function deleteAccount(array $params): void
    {
        $c = self::readerCtx(true);
        if ($c === null) { return; }
        [$p, $email] = $c;
        $b = self::json();
        if ($b === null) { return; }
        if (!self::confirmed($p, $email, $b)) { return; }
        $pdo = Db::pdo();
        $pdo->prepare('DELETE FROM readers WHERE id = ?')->execute([$p['reader']['id']]);   // their sessions go with it
        $other = $pdo->prepare('SELECT 1 FROM staff WHERE email = ? LIMIT 1');
        $other->execute([$email]);
        if ($other->fetchColumn() === false && !AdminApi::isAdminEmail($email)) {
            // The address holds no other role, so its password and passkeys go too.
            $pdo->prepare('DELETE FROM credentials WHERE email = ?')->execute([$email]);
            $pdo->prepare('DELETE FROM passkeys WHERE email = ?')->execute([$email]);
        }
        Audit::log('reader:' . $p['reader']['id'], null, 'account.delete');
        Response::json(200, ['status' => 'ok']);
    }
}
