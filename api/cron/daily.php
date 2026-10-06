<?php
// Daily job (spec 10.1): expiry reminders, then purge. Run from cPanel cron through daily.sh.
//   php api/cron/daily.php            silent on success; prints to stderr and exits 1 on failure
//   php api/cron/daily.php --verbose  also prints the one-line summary
// Silence on success matters: cPanel emails whatever a cron job prints, so only trouble gets mailed.
if (PHP_SAPI !== 'cli') { exit; }
define('UO_API', true);
foreach (['Config', 'Response', 'Request', 'Router', 'Db', 'Validate', 'Crypto', 'RateLimit'] as $c) { require_once __DIR__ . "/../src/$c.php"; }
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/Jobs.php';

$verbose = in_array('--verbose', $argv, true);
if (PHP_VERSION_ID < 80100) { fwrite(STDERR, "daily.php needs PHP 8.1 or newer (this is " . PHP_VERSION . ").\n"); exit(1); }

try {
    Config::load();
    $pdo = Db::pdo();
    // Never run two at once (a slow mail server plus the next scheduled run).
    if ((int)$pdo->query("SELECT GET_LOCK('uo_daily_job', 0)")->fetchColumn() !== 1) {
        fwrite(STDERR, "Another daily job is still running; this run was skipped.\n");
        exit(1);
    }
    $rem = Jobs::reminders();
    $purged = Jobs::purge();
    $line = 'daily job ok: reminders parishes=' . $rem['parishes'] . ' items=' . $rem['items']
          . ' sent=' . $rem['mails_sent'] . ' failed=' . $rem['mails_failed'] . ' no_rector=' . $rem['no_rector']
          . ' | purged ' . implode(' ', array_map(fn($k, $v) => "$k=$v", array_keys($purged), $purged));
    $dir = Config::logDir();
    if ($dir !== null && (is_dir($dir) || @mkdir($dir, 0700, true))) {
        @file_put_contents($dir . '/cron.log', gmdate('Y-m-d\TH:i:s\Z') . ' ' . $line . "\n", FILE_APPEND | LOCK_EX);
        @chmod($dir . '/cron.log', 0600);
    }
    if ($verbose) { echo $line . "\n"; }
    // Mail trouble is worth hearing about: exit non-zero so cPanel mails the output once.
    if ($rem['mails_failed'] > 0) { fwrite(STDERR, "Some reminder emails failed to send; they will be retried tomorrow.\n"); exit(1); }
} catch (Throwable $e) {
    fwrite(STDERR, 'Daily job failed (' . get_class($e) . ").\n");
    uo_log('daily job failed: ' . get_class($e));
    exit(1);
}
