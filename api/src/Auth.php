<?php
// Passwordless login: emailed 6-digit codes and bearer-token sessions (spec 6.1).
// Codes and tokens are stored only as hashes; tokens are accepted only in the
// Authorization header (never cookies, never the URL).
if (!defined('UO_API')) { exit; }

final class Auth
{
    public const CODE_TTL_MINUTES = 10;
    public const CODE_MAX_GUESSES = 5;
    public const SESSION_TTL_DAYS = 30;

    /** Trim, lowercase, validate. Null for anything malformed or containing CR/LF/NUL. */
    public static function normalizeEmail($v): ?string
    {
        if (!is_string($v)) { return null; }
        $e = strtolower(trim($v));
        if ($e === '' || strlen($e) > 254 || preg_match('/[\r\n\0]/', $e)) { return null; }
        return filter_var($e, FILTER_VALIDATE_EMAIL) === false ? null : $e;
    }

    /** A new code kills any earlier unconsumed code for the same email+purpose. Returns the plaintext code. */
    public static function issueCode(string $purpose, string $email, ?string $payload = null): string
    {
        $pdo = Db::pdo();
        $pdo->prepare('UPDATE login_codes SET consumed_at = UTC_TIMESTAMP() WHERE email = ? AND purpose = ? AND consumed_at IS NULL')
            ->execute([$email, $purpose]);
        $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $pdo->prepare('INSERT INTO login_codes (purpose, email, code_hash, payload, created_at, expires_at)
                       VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL ? MINUTE)')
            ->execute([$purpose, $email, self::codeHash($purpose, $email, $code), $payload, self::CODE_TTL_MINUTES]);
        return $code;
    }

    private static function codeHash(string $purpose, string $email, string $code): string
    {
        return Crypto::hmac($purpose . '|' . $email . '|' . $code);
    }

    /**
     * Check a code. Every check consumes one of the 5 guesses (atomically), so parallel
     * requests cannot exceed the cap. A correct code is consumed exactly once.
     * Returns the login_codes row (for its payload) on success, null on any failure.
     */
    public static function verifyCode(string $purpose, string $email, $given): ?array
    {
        $pdo = Db::pdo();
        $st = $pdo->prepare('SELECT id, code_hash, payload FROM login_codes
                             WHERE email = ? AND purpose = ? AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP()
                             ORDER BY id DESC LIMIT 1');
        $st->execute([$email, $purpose]);
        $row = $st->fetch();
        if ($row === false) { return null; }

        $use = $pdo->prepare('UPDATE login_codes SET attempts = attempts + 1
                              WHERE id = ? AND attempts < ? AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP()');
        $use->execute([$row['id'], self::CODE_MAX_GUESSES]);
        if ($use->rowCount() !== 1) { return null; } // dead: too many guesses, expired or already used

        $code = is_string($given) && preg_match('/^\d{6}$/', $given) === 1 ? $given : '------';
        if (!hash_equals($row['code_hash'], self::codeHash($purpose, $email, $code))) { return null; }

        $done = $pdo->prepare('UPDATE login_codes SET consumed_at = UTC_TIMESTAMP() WHERE id = ? AND consumed_at IS NULL');
        $done->execute([$row['id']]);
        return $done->rowCount() === 1 ? $row : null;
    }

    /** New session. The raw token is returned once and never stored (only its SHA-256). */
    public static function createSession(string $principal, ?int $staffId, ?string $adminEmail = null, ?int $readerId = null, ?int $dioceseStaffId = null): array
    {
        $token = bin2hex(random_bytes(32));
        $pdo = Db::pdo();
        $pdo->prepare('INSERT INTO sessions (token_hash, principal, staff_id, admin_email, reader_id, diocese_staff_id, created_at, expires_at)
                       VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL ? DAY)')
            ->execute([hash('sha256', $token), $principal, $staffId, $adminEmail, $readerId, $dioceseStaffId, self::SESSION_TTL_DAYS]);
        $exp = $pdo->query('SELECT expires_at FROM sessions WHERE id = ' . (int)$pdo->lastInsertId())->fetchColumn();
        return ['token' => $token, 'expires_at' => Validate::isoUtc($exp)];
    }

    /** Raw token from "Authorization: Bearer <64 hex>", else null. Cookies and query strings are ignored. */
    public static function bearerToken(): ?string
    {
        $h = Request::header('Authorization');
        return ($h !== null && preg_match('/^Bearer ([0-9a-f]{64})$/', $h, $m) === 1) ? $m[1] : null;
    }

    /**
     * Resolve the current session. Null when the token is missing, unknown, expired, or (for
     * staff) the parish is no longer approved -- checked on every call (spec 6.1, 8.4).
     */
    public static function principal(): ?array
    {
        $token = self::bearerToken();
        if ($token === null) { return null; }
        $st = Db::pdo()->prepare(
            'SELECT s.id AS session_id, s.principal, s.admin_email,
                    TIMESTAMPDIFF(SECOND, COALESCE(s.reauth_at, s.created_at), UTC_TIMESTAMP()) AS fresh_age,
                    st.id AS staff_id, st.email, st.display_name, st.role,
                    p.id AS parish_id, p.slug, p.name, p.visibility, p.status,
                    rd.id AS reader_id, rd.email AS reader_email,
                    ds.id AS diocese_staff_id, ds.email AS diocese_email, ds.diocese_key
             FROM sessions s
             LEFT JOIN staff st ON st.id = s.staff_id
             LEFT JOIN parishes p ON p.id = st.parish_id
             LEFT JOIN readers rd ON rd.id = s.reader_id
             LEFT JOIN diocese_staff ds ON ds.id = s.diocese_staff_id
             WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()'
        );
        $st->execute([hash('sha256', $token)]);
        $r = $st->fetch();
        if ($r === false) { return null; }
        $fresh = (int)$r['fresh_age'];   // seconds since this session was created or last confirmed by an emailed code
        if ($r['principal'] === 'admin') {
            return ['type' => 'admin', 'session_id' => (int)$r['session_id'], 'email' => $r['admin_email'], 'fresh_age' => $fresh];
        }
        if ($r['principal'] === 'reader') {
            if ($r['reader_id'] === null) { return null; }
            return ['type' => 'reader', 'session_id' => (int)$r['session_id'], 'fresh_age' => $fresh,
                    'reader' => ['id' => (int)$r['reader_id'], 'email' => $r['reader_email']]];
        }
        if ($r['principal'] === 'diocese') {
            // The editor row is re-read on every call: removing someone ends their access at once.
            if ($r['diocese_staff_id'] === null) { return null; }
            return ['type' => 'diocese', 'session_id' => (int)$r['session_id'], 'fresh_age' => $fresh,
                    'email' => $r['diocese_email'], 'diocese_staff_id' => (int)$r['diocese_staff_id'], 'diocese_key' => $r['diocese_key']];
        }
        if ($r['staff_id'] === null || $r['status'] !== 'approved') { return null; }
        return [
            'type' => 'staff',
            'session_id' => (int)$r['session_id'],
            'fresh_age' => $fresh,
            'staff' => ['id' => (int)$r['staff_id'], 'role' => $r['role'], 'display_name' => $r['display_name'], 'email' => $r['email']],
            'parish' => ['id' => (int)$r['parish_id'], 'slug' => $r['slug'], 'name' => $r['name'],
                         'visibility' => $r['visibility'], 'status' => $r['status']],
        ];
    }

    /** The email address behind any kind of session. */
    public static function emailOf(array $p): ?string
    {
        if ($p['type'] === 'staff') { return self::normalizeEmail($p['staff']['email'] ?? null); }
        if ($p['type'] === 'reader') { return self::normalizeEmail($p['reader']['email'] ?? null); }
        return self::normalizeEmail($p['email'] ?? null);
    }

    /** Principal or an emitted 401 (then null). */
    public static function require(): ?array
    {
        $p = self::principal();
        if ($p === null) { Response::error(401, 'unauthorized', 'Authentication required.'); }
        return $p;
    }

    public static function deleteSession(int $sessionId): void
    {
        Db::pdo()->prepare('DELETE FROM sessions WHERE id = ?')->execute([$sessionId]);
    }
}
