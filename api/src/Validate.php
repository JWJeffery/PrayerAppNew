<?php
// Small shared validators/formatters.
if (!defined('UO_API')) { exit; }

final class Validate
{
    /** Corpus-style diocese key, e.g. "episcopal/western-oregon" (spec section 5). */
    public static function dioceseKey($v): bool
    {
        return is_string($v) && preg_match('#^[a-z0-9-]{1,40}/[a-z0-9-]{1,80}$#', $v) === 1;
    }

    public static function slug($v): bool
    {
        return is_string($v) && preg_match('/^[a-z0-9-]{1,80}$/', $v) === 1;
    }

    /** "2026-10-30 16:00:00" (UTC, as stored) -> "2026-10-30T16:00:00Z". */
    public static function isoUtc(string $mysqlDatetime): string
    {
        return str_replace(' ', 'T', $mysqlDatetime) . 'Z';
    }

    public const CATEGORIES = ['individual', 'family', 'situation', 'institution'];

    /**
     * Intention/display text (spec 6.4): trimmed, whitespace runs collapsed to one space, 1..$max
     * characters, valid UTF-8, no control characters and no bidirectional-override characters
     * (which could make a name display misleadingly). Angle brackets are NOT stripped: safety
     * comes from output handling (textContent), never from input scrubbing.
     * @return array{0:?string,1:?string} [clean text, error message]
     */
    public static function text($v, int $max, bool $required = true): array
    {
        if ($v === null || $v === '') {
            return $required ? [null, 'Required.'] : [null, null];
        }
        if (!is_string($v) || !mb_check_encoding($v, 'UTF-8')) { return [null, 'Must be text.']; }
        if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]|[\x{202A}-\x{202E}\x{2066}-\x{2069}]/u', $v)) {
            return [null, 'Contains characters that are not allowed.'];
        }
        $clean = trim((string)preg_replace('/\s+/u', ' ', $v));
        if ($clean === '') { return $required ? [null, 'Required.'] : [null, null]; }
        if (mb_strlen($clean, 'UTF-8') > $max) { return [null, "Must be $max characters or fewer."]; }
        return [$clean, null];
    }

    /** Whole number of days 1..45 (JSON integers only). Null when absent and a default is allowed. */
    public static function days($v, ?int $default): array
    {
        if ($v === null) { return $default === null ? [null, 'Required.'] : [$default, null]; }
        if (!is_int($v) || $v < 1 || $v > 45) { return [null, 'Must be a whole number from 1 to 45.']; }
        return [$v, null];
    }

    /** URL slug from a parish name: a-z 0-9 hyphen, max 80. "St. Bede's Church" -> "st-bedes-church". */
    public static function slugify(string $name): string
    {
        $s = mb_strtolower($name, 'UTF-8');
        $s = strtr($s, ['à'=>'a','á'=>'a','â'=>'a','ã'=>'a','ä'=>'a','å'=>'a','æ'=>'ae','ç'=>'c','è'=>'e','é'=>'e','ê'=>'e','ë'=>'e',
                        'ì'=>'i','í'=>'i','î'=>'i','ï'=>'i','ñ'=>'n','ò'=>'o','ó'=>'o','ô'=>'o','õ'=>'o','ö'=>'o','ø'=>'o','œ'=>'oe',
                        'ù'=>'u','ú'=>'u','û'=>'u','ü'=>'u','ý'=>'y','ÿ'=>'y','ß'=>'ss']);
        $s = preg_replace("/['\x{2019}]/u", '', $s);         // drop apostrophes: bede's -> bedes
        $s = trim((string)preg_replace('/[^a-z0-9]+/', '-', $s), '-');
        $s = trim(substr($s, 0, 80), '-');
        return $s === '' ? 'parish' : $s;
    }
}
