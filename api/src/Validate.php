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

    /** Web address a reader may tap: http(s) only, no credentials in it, 1..255 characters. Null/'' = none. */
    public static function url($v): array
    {
        if ($v === null || $v === '') { return [null, null]; }
        if (!is_string($v) || !mb_check_encoding($v, 'UTF-8')) { return [null, 'Must be a web address.']; }
        $v = trim($v);
        if ($v === '') { return [null, null]; }
        if (strlen($v) > 255 || preg_match('/[\x00-\x20\x7F"<>\\^`{|}]/', $v)) { return [null, 'Enter a full web address such as https://example.org (255 characters at most).']; }
        $parts = parse_url($v);
        if ($parts === false || !isset($parts['scheme'], $parts['host'])
            || !in_array(strtolower($parts['scheme']), ['http', 'https'], true)
            || isset($parts['user']) || isset($parts['pass'])
            || strpos($parts['host'], '.') === false) {
            return [null, 'Enter a full web address that starts with https:// (or http://).'];
        }
        return [$v, null];
    }

    /**
     * A short list of text lines (service times, convention dates): up to $maxLines non-empty lines of
     * up to $maxLen characters each, each cleaned like Validate::text. Accepts an array of strings.
     * @return array{0:?array,1:?string} [list of lines or null when empty, error message]
     */
    public static function lines($v, int $maxLines, int $maxLen): array
    {
        if ($v === null || $v === '' || $v === []) { return [null, null]; }
        if (!is_array($v) || array_keys($v) !== range(0, count($v) - 1)) { return [null, 'Must be a list of lines.']; }
        $out = [];
        foreach ($v as $line) {
            if ($line === null || (is_string($line) && trim($line) === '')) { continue; }
            [$clean, $e] = self::text($line, $maxLen);
            if ($e !== null) { return [null, $e === 'Required.' ? 'Must be text.' : "Each line: $e"]; }
            $out[] = $clean;
        }
        if (count($out) > $maxLines) { return [null, "Use $maxLines lines or fewer."]; }
        return [$out === [] ? null : $out, null];
    }

    /** Calendar date "YYYY-MM-DD" that really exists. */
    public static function date($v): array
    {
        if (!is_string($v) || !preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $v, $m) || !checkdate((int)$m[2], (int)$m[3], (int)$m[1])) {
            return [null, 'Enter a date.'];
        }
        return [$v, null];
    }

    /** "HH:MM" 24-hour time, or null/'' for none. */
    public static function time($v): array
    {
        if ($v === null || $v === '') { return [null, null]; }
        if (!is_string($v) || !preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $v)) { return [null, 'Enter a time like 18:30.']; }
        return [$v, null];
    }

    /** Text lines stored as one newline-joined column value, and back. */
    public static function joinLines(?array $lines): ?string { return $lines === null ? null : implode("\n", $lines); }
    public static function splitLines(?string $stored): array { return ($stored === null || $stored === '') ? [] : explode("\n", $stored); }

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
