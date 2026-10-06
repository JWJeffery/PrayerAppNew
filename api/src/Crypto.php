<?php
// Crypto helpers built only on platform primitives: random_int / random_bytes,
// hash_hmac, hash_equals, and libsodium secretbox. No invented crypto.
if (!defined('UO_API')) { exit; }

final class Crypto
{
    /** Unambiguous alphabet (no I, L, O, 0, 1) -- spec 6.2. */
    public const JOIN_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    public const PASS_MAX_AGE = 365 * 86400;

    private static function pepper(): string
    {
        $hex = (string)Config::get('secrets.pepper', '');
        if (!preg_match('/^[0-9a-f]{64}$/', $hex)) { throw new RuntimeException('bad_pepper'); }
        return hex2bin($hex);
    }

    private static function boxKey(): string
    {
        $key = base64_decode((string)Config::get('secrets.box_key', ''), true);
        if ($key === false || strlen($key) !== SODIUM_CRYPTO_SECRETBOX_KEYBYTES) { throw new RuntimeException('bad_box_key'); }
        return $key;
    }

    /** HMAC-SHA256 with the pepper, hex. Used for IP/email rate-limit keys and (later) login codes. */
    public static function hmac(string $data): string
    {
        return hash_hmac('sha256', $data, self::pepper());
    }

    // ---- Join codes ---------------------------------------------------------

    /** 8 random characters from the unambiguous alphabet, e.g. "K7TQ2MXA". */
    public static function generateJoinCode(): string
    {
        $max = strlen(self::JOIN_ALPHABET) - 1;
        $code = '';
        for ($i = 0; $i < 8; $i++) { $code .= self::JOIN_ALPHABET[random_int(0, $max)]; }
        return $code;
    }

    /** Uppercase, strip spaces/hyphens; null unless exactly 8 valid characters. */
    public static function normalizeJoinCode($input): ?string
    {
        if (!is_string($input) || strlen($input) > 32) { return null; }
        $code = strtoupper(str_replace([' ', '-'], '', $input));
        $re = '/^[' . self::JOIN_ALPHABET . ']{8}$/';
        return preg_match($re, $code) === 1 ? $code : null;
    }

    /** "K7TQ2MXA" -> "K7TQ-2MXA" for display. */
    public static function formatJoinCode(string $normalized): string
    {
        return substr($normalized, 0, 4) . '-' . substr($normalized, 4);
    }

    /** secretbox: nonce || ciphertext. Reversible so the rector can re-display the code. */
    public static function encryptJoinCode(string $normalized): string
    {
        $key = self::boxKey();
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $blob = $nonce . sodium_crypto_secretbox($normalized, $nonce, $key);
        sodium_memzero($key);
        return $blob;
    }

    public static function decryptJoinCode(?string $blob): ?string
    {
        if ($blob === null || strlen($blob) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES) { return null; }
        $key = self::boxKey();
        $nonce = substr($blob, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $plain = sodium_crypto_secretbox_open(substr($blob, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES), $nonce, $key);
        sodium_memzero($key);
        return $plain === false ? null : $plain;
    }

    /** Decrypt-and-compare (constant time) a reader-supplied code against the stored one. */
    public static function verifyJoinCode($input, ?string $blob): bool
    {
        $given = self::normalizeJoinCode($input);
        $real = self::decryptJoinCode($blob);
        return $given !== null && $real !== null && hash_equals($real, $given);
    }

    // ---- Reader passes (stateless) -----------------------------------------

    private static function b64u(string $raw): string
    {
        return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    }

    private static function unb64u(string $s): ?string
    {
        $r = base64_decode(strtr($s, '-_', '+/'), true);
        return $r === false ? null : $r;
    }

    /** base64url("parishId.version.issuedAt") . "." . base64url(HMAC-SHA256(pepper, "parishId.version.issuedAt")). */
    public static function makePass(int $parishId, int $version, ?int $issuedAt = null): string
    {
        $payload = $parishId . '.' . $version . '.' . ($issuedAt ?? time());
        return self::b64u($payload) . '.' . self::b64u(hash_hmac('sha256', $payload, self::pepper(), true));
    }

    /** True only for a well-formed, correctly signed, unexpired pass for this parish and code version. */
    public static function verifyPass($pass, int $parishId, int $currentVersion, ?int $now = null): bool
    {
        if (!is_string($pass) || strlen($pass) > 400) { return false; }
        $parts = explode('.', $pass);
        if (count($parts) !== 2) { return false; }
        $payload = self::unb64u($parts[0]);
        $sig = self::unb64u($parts[1]);
        if ($payload === null || $sig === null) { return false; }
        if (!hash_equals(hash_hmac('sha256', $payload, self::pepper(), true), $sig)) { return false; }
        if (!preg_match('/^(\d+)\.(\d+)\.(\d+)$/', $payload, $m)) { return false; }
        $now = $now ?? time();
        $issued = (int)$m[3];
        return (int)$m[1] === $parishId
            && (int)$m[2] === $currentVersion
            && $issued <= $now + 300
            && ($now - $issued) <= self::PASS_MAX_AGE;
    }
}
