<?php
// Optional passwords (2026-10-07). Rules follow NIST SP 800-63B-4: length over complexity, up to 128
// characters, any characters including spaces, no composition rules, and a check against common and
// obvious choices. Stored as a salted Argon2id hash (bcrypt where this PHP lacks Argon2) of an HMAC of the
// password, keyed with the server's secret pepper, so a stolen database alone cannot be used to test guesses.
if (!defined('UO_API')) { exit; }

final class Password
{
    public const MIN_LENGTH = 15;
    public const MAX_LENGTH = 128;

    // Hashes of a password nobody has, made with the SAME settings as real ones. Checking a login for an
    // address that has no password against these costs the same time as a real check, so response time does
    // not reveal which addresses have passwords.
    private const DUMMY_ARGON2ID = '$argon2id$v=19$m=19456,t=2,p=1$bFB4b1JxVDJLdi5VejZVSQ$+/pKVLZCjqjwW9iPg1DAbBI94foiNkSpOjCmxg0LfxE';
    private const DUMMY_BCRYPT = '$2y$12$0en0.8UfJDxl.QCPjNzUKeGka.xIM5VJ3imsx0gArU0kmquix5XDq';

    // Whole-password matches only (lower case, spaces removed). With a 15-character minimum most obvious
    // choices are already too short; these are the ones long enough to slip through.
    private const COMMON = [
        'passwordpassword', 'password1234567', 'password12345678', 'passwordpassword1', 'qwertyuiopasdfgh', 'qwertyuiop123456',
        '123456789012345', '1234567890123456', '12345678901234567890', 'abcdefghijklmnop', 'abcdefghijklmnopqrstuvwxyz',
        'iloveyouiloveyou', 'letmeinletmein1', 'welcomewelcome1', 'adminadminadmin1', 'changemechangeme', 'universaloffice',
        'theuniversaloffice', 'universaloffice1', 'theuniversaloffice1', 'thelordsprayer', 'ouroathertheartinheaven',
        'ourfatherwhoartinheaven', 'hailmaryfullofgrace', 'glorytothefatherandtotheson', 'amenamenamenamen', 'jesuschristjesuschrist',
        '111111111111111', '000000000000000', 'aaaaaaaaaaaaaaa', 'asdfghjklasdfghjkl', 'zxcvbnmasdfghjkl',
    ];

    /** @return string|null an error message for the person, or null when the password is acceptable */
    public static function problem($password, string $email): ?string
    {
        if (!is_string($password) || !mb_check_encoding($password, 'UTF-8')) { return 'Enter a password.'; }
        $len = mb_strlen($password, 'UTF-8');
        if ($len < self::MIN_LENGTH) {
            return 'Use at least ' . self::MIN_LENGTH . ' characters. A phrase of several words works well, and spaces are fine.';
        }
        if ($len > self::MAX_LENGTH) { return 'Use ' . self::MAX_LENGTH . ' characters or fewer.'; }
        if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $password)) { return 'That contains characters that are not allowed.'; }
        $flat = preg_replace('/\s+/u', '', mb_strtolower($password, 'UTF-8'));
        if (in_array($flat, self::COMMON, true)) { return 'That password is too common. Please choose a different one.'; }
        if (count(array_unique(preg_split('//u', $flat, -1, PREG_SPLIT_NO_EMPTY))) < 5) {
            return 'That password repeats too few different characters. Please choose a different one.';
        }
        $local = strtolower(strstr($email, '@', true) ?: '');
        if (strlen($local) >= 5 && strpos($flat, $local) !== false) { return 'Please do not use your email address in your password.'; }
        return null;
    }

    private static function prehash(string $password): string
    {
        return Crypto::hmac('pw|' . $password);   // 64 hex characters: safe for every hash algorithm below
    }

    public static function hash(string $password): string
    {
        $pre = self::prehash($password);
        if (defined('PASSWORD_ARGON2ID')) {
            return password_hash($pre, PASSWORD_ARGON2ID, ['memory_cost' => 19456, 'time_cost' => 2, 'threads' => 1]);
        }
        return password_hash($pre, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /** True when $given matches $storedHash. A null $storedHash (no password) still costs a full check, and is always false. */
    public static function verify($given, ?string $storedHash): bool
    {
        $given = is_string($given) ? $given : '';
        $dummy = defined('PASSWORD_ARGON2ID') ? self::DUMMY_ARGON2ID : self::DUMMY_BCRYPT;
        $ok = password_verify(self::prehash(mb_substr($given, 0, self::MAX_LENGTH * 2, 'UTF-8')), $storedHash ?? $dummy);
        return $storedHash !== null && $ok;
    }
}
