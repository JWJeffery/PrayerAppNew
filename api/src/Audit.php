<?php
// Audit trail: actions and ids only. NEVER intention text, emails, codes or tokens (spec 6.6).
if (!defined('UO_API')) { exit; }

final class Audit
{
    public static function log(string $actor, ?int $parishId, string $action, ?string $detail = null): void
    {
        Db::pdo()->prepare('INSERT INTO audit_log (at, actor, parish_id, action, detail) VALUES (UTC_TIMESTAMP(), ?, ?, ?, ?)')
            ->execute([$actor, $parishId, $action, $detail]);
    }
}
