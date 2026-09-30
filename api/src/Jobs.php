<?php
// Scheduled work (spec section 10.1): expiry-reminder digests and the purge of old rows.
// Called only from cron/daily.php. Nothing here ever reads or sends intention TEXT: the digest
// carries counts and dates only, and the log line carries counts only.
if (!defined('UO_API')) { exit; }

final class Jobs
{
    /** Reminders go out for items expiring within this many days. */
    public const REMIND_DAYS = 3;

    /**
     * One digest per parish to each rector, for unreminded items expiring soon on approved parishes.
     * Items are marked reminded only if at least one rector was actually mailed; a failed send leaves
     * them eligible for tomorrow's run. Returns counts.
     */
    public static function reminders(): array
    {
        $pdo = Db::pdo();
        $out = ['parishes' => 0, 'items' => 0, 'mails_sent' => 0, 'mails_failed' => 0, 'no_rector' => 0];
        $rows = $pdo->query(
            'SELECT i.id, i.parish_id, i.expires_at FROM intentions i
               JOIN parishes p ON p.id = i.parish_id AND p.status = \'approved\'
              WHERE i.reminder_sent_at IS NULL
                AND i.expires_at > UTC_TIMESTAMP()
                AND i.expires_at <= UTC_TIMESTAMP() + INTERVAL ' . (int)self::REMIND_DAYS . ' DAY
              ORDER BY i.parish_id, i.expires_at'
        )->fetchAll(PDO::FETCH_ASSOC);

        $byParish = [];
        foreach ($rows as $r) { $byParish[(int)$r['parish_id']][] = $r; }

        $tz = new DateTimeZone((string)Config::get('reminder_timezone', 'America/Los_Angeles'));
        $site = rtrim((string)Config::get('site_url', 'https://theuniversaloffice.com'), '/');
        foreach ($byParish as $parishId => $items) {
            $out['parishes']++;
            $p = $pdo->prepare('SELECT name FROM parishes WHERE id = ?');
            $p->execute([$parishId]);
            $parishName = (string)$p->fetchColumn();
            $s = $pdo->prepare("SELECT email FROM staff WHERE parish_id = ? AND role = 'rector'");
            $s->execute([$parishId]);
            $rectors = $s->fetchAll(PDO::FETCH_COLUMN);
            if ($rectors === []) { $out['no_rector']++; continue; }

            $dates = [];
            foreach ($items as $it) {
                $d = (new DateTimeImmutable($it['expires_at'], new DateTimeZone('UTC')))->setTimezone($tz);
                $dates[$d->format('Y-m-d')] = $d->format('l, F j');
            }
            ksort($dates);
            $n = count($items);
            $body = ($n === 1 ? '1 prayer intention' : "$n prayer intentions")
                  . ' for ' . $parishName . ($n === 1 ? ' will expire on ' : ' will expire on ')
                  . implode(' and ', array_values($dates)) . ".\n\n"
                  . "Log in to extend or remove " . ($n === 1 ? 'it' : 'them') . ": $site/parish/\n\n"
                  . "Expired requests stop appearing for readers automatically. This message contains no prayer text.\n";
            $anySent = false;
            foreach ($rectors as $email) {
                if (Mailer::send((string)$email, 'Prayer intentions expiring soon', $body)) { $anySent = true; $out['mails_sent']++; }
                else { $out['mails_failed']++; }
            }
            if ($anySent) {
                $ids = array_map(fn($it) => (int)$it['id'], $items);
                $in = implode(',', array_fill(0, count($ids), '?'));
                $pdo->prepare("UPDATE intentions SET reminder_sent_at = UTC_TIMESTAMP() WHERE reminder_sent_at IS NULL AND id IN ($in)")->execute($ids);
                $out['items'] += $n;
            }
        }
        return $out;
    }

    /** Deletes old rows per spec 10.1. Returns rows deleted per table. */
    public static function purge(): array
    {
        $pdo = Db::pdo();
        $rules = [
            'intentions'      => 'expires_at < UTC_TIMESTAMP() - INTERVAL 7 DAY',
            'login_codes'     => 'expires_at < UTC_TIMESTAMP() - INTERVAL 1 DAY',
            'sessions'        => 'expires_at < UTC_TIMESTAMP()',
            'rate_limits'     => 'window_start < UTC_TIMESTAMP() - INTERVAL 2 DAY',
            'audit_log'       => 'at < UTC_TIMESTAMP() - INTERVAL 180 DAY',
            'approval_tokens' => 'expires_at < UTC_TIMESTAMP() - INTERVAL 30 DAY',
        ];
        $out = [];
        foreach ($rules as $table => $where) {
            $out[$table] = $pdo->exec("DELETE FROM `$table` WHERE $where");
        }
        return $out;
    }
}
