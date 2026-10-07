<?php
// Passkeys (WebAuthn) for the optional accounts, on the vendored report-uri/passkeys-php library
// (api/lib/Passkeys). Sign-in is usernameless: the browser offers the passkeys it holds for this site, and
// the credential id says whose it is, so no address is typed and nothing reveals which addresses exist.
if (!defined('UO_API')) { exit; }

require_once __DIR__ . '/../lib/Passkeys/WebAuthn.php';

use ReportUri\Passkeys\WebAuthn;
use ReportUri\Passkeys\Binary\ByteBuffer;

final class Passkeys
{
    private const CHALLENGE_MINUTES = 5;
    public const MAX_PER_ACCOUNT = 10;

    private static function rpId(): string
    {
        $host = parse_url((string)Config::get('site_url', ''), PHP_URL_HOST);
        if (!is_string($host) || $host === '') { throw new RuntimeException('bad_site_url'); }
        return strtolower($host);
    }

    private static function server(): WebAuthn
    {
        return new WebAuthn('The Universal Office', self::rpId(), true);   // true: binary fields travel as base64url
    }

    private static function b64uDecode($s): ?string
    {
        if (!is_string($s) || $s === '' || strlen($s) > 8192 || preg_match('/^[A-Za-z0-9_-]+$/', $s) !== 1) { return null; }
        $raw = base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4), true);
        return $raw === false ? null : $raw;
    }

    /** Keep a challenge for one use; returns the token the browser sends back. */
    private static function storeChallenge(string $purpose, ?string $email, string $challenge): string
    {
        $token = bin2hex(random_bytes(24));
        Db::pdo()->prepare('INSERT INTO webauthn_challenges (token_hash, purpose, email, challenge, created_at, expires_at)
                            VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL ? MINUTE)')
            ->execute([hash('sha256', $token), $purpose, $email, $challenge, self::CHALLENGE_MINUTES]);
        return $token;
    }

    /** One-time use: the row is deleted as it is read, so a challenge can never be replayed. */
    private static function takeChallenge($token, string $purpose): ?array
    {
        if (!is_string($token) || preg_match('/^[0-9a-f]{48}$/', $token) !== 1) { return null; }
        $pdo = Db::pdo();
        $hash = hash('sha256', $token);
        $st = $pdo->prepare('SELECT id, email, challenge FROM webauthn_challenges
                             WHERE token_hash = ? AND purpose = ? AND expires_at > UTC_TIMESTAMP()');
        $st->execute([$hash, $purpose]);
        $row = $st->fetch();
        $del = $pdo->prepare('DELETE FROM webauthn_challenges WHERE token_hash = ?');
        $del->execute([$hash]);
        return ($row === false || $del->rowCount() !== 1) ? null : $row;
    }

    /** @return array{token:string, publicKey:object} what the browser needs for navigator.credentials.create */
    public static function registrationOptions(string $email): array
    {
        $ids = Db::pdo()->prepare('SELECT credential_id FROM passkeys WHERE email = ?');
        $ids->execute([$email]);
        $server = self::server();
        $userId = substr(hash('sha256', 'uo-passkey-user|' . $email, true), 0, 32);
        $args = $server->getCreateArgs($userId, $email, $email, 60, true, true, null, $ids->fetchAll(PDO::FETCH_COLUMN));
        $token = self::storeChallenge('register', $email, $server->getChallenge()->getBinaryString());
        return ['token' => $token, 'publicKey' => $args->publicKey];
    }

    /** @return array{ok:bool, id?:int, error?:string} */
    public static function finishRegistration(string $email, $token, $clientDataJSON, $attestationObject, $label): array
    {
        $ch = self::takeChallenge($token, 'register');
        $cd = self::b64uDecode($clientDataJSON);
        $ao = self::b64uDecode($attestationObject);
        if ($ch === null || $ch['email'] !== $email || $cd === null || $ao === null) { return ['ok' => false, 'error' => 'expired']; }
        try {
            $data = self::server()->processCreate($cd, $ao, $ch['challenge'], true, true);
        } catch (Throwable $e) {
            uo_log('passkey register failed: ' . get_class($e));
            return ['ok' => false, 'error' => 'rejected'];
        }
        [$name] = Validate::text($label, 80, false);
        $count = Db::pdo()->prepare('SELECT COUNT(*) FROM passkeys WHERE email = ?');
        $count->execute([$email]);
        if ((int)$count->fetchColumn() >= self::MAX_PER_ACCOUNT) { return ['ok' => false, 'error' => 'limit']; }
        try {
            Db::pdo()->prepare('INSERT INTO passkeys (email, credential_id, public_key, sign_count, label, created_at)
                                VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP())')
                ->execute([$email, $data->credentialId, $data->credentialPublicKey, (int)($data->signatureCounter ?? 0), $name]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') { return ['ok' => false, 'error' => 'duplicate']; }
            throw $e;
        }
        return ['ok' => true, 'id' => (int)Db::pdo()->lastInsertId()];
    }

    /** @return array{token:string, publicKey:object} what the browser needs for navigator.credentials.get */
    public static function loginOptions(): array
    {
        $server = self::server();
        $args = $server->getGetArgs([], 60, true, true, true, true, true, true);   // no ids: the device offers its own
        $token = self::storeChallenge('login', null, $server->getChallenge()->getBinaryString());
        return ['token' => $token, 'publicKey' => $args->publicKey];
    }

    /** @return string|null the account's email address when the sign-in is genuine, else null */
    public static function finishLogin($token, $id, $clientDataJSON, $authenticatorData, $signature): ?string
    {
        $ch = self::takeChallenge($token, 'login');
        $credId = self::b64uDecode($id);
        $cd = self::b64uDecode($clientDataJSON);
        $ad = self::b64uDecode($authenticatorData);
        $sig = self::b64uDecode($signature);
        if ($ch === null || $credId === null || $cd === null || $ad === null || $sig === null) { return null; }
        $st = Db::pdo()->prepare('SELECT id, email, public_key, sign_count FROM passkeys WHERE credential_id = ?');
        $st->execute([$credId]);
        $row = $st->fetch();
        if ($row === false) { return null; }
        try {
            $server = self::server();
            $server->processGet($cd, $ad, $sig, $row['public_key'], $ch['challenge'], (int)$row['sign_count'], true, true);
        } catch (Throwable $e) {
            uo_log('passkey login failed: ' . get_class($e));
            return null;
        }
        $new = $server->getSignatureCounter();
        Db::pdo()->prepare('UPDATE passkeys SET sign_count = ?, last_used_at = UTC_TIMESTAMP() WHERE id = ?')
            ->execute([$new === null ? (int)$row['sign_count'] : $new, (int)$row['id']]);
        return $row['email'];
    }
}
