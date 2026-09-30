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
}
