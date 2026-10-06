<?php
// Sends one test email using the mail settings in your config.php, so you can confirm
// the SMTP details work before anything depends on them.
// Run:  php api/cli/send-test-mail.php you@example.org
// (With mail.driver = 'log' it writes the message to the outbox log instead of sending.)
if (PHP_SAPI !== 'cli') { exit; }
define('UO_API', true);
foreach (['Config', 'Response', 'Request', 'Router', 'Db', 'Mailer'] as $c) { require_once __DIR__ . "/../src/$c.php"; }
require_once __DIR__ . '/../src/bootstrap.php';

$to = $argv[1] ?? '';
if ($to === '') { fwrite(STDERR, "Usage: php api/cli/send-test-mail.php you@example.org\n"); exit(1); }
try { Config::load(); } catch (Throwable $e) { fwrite(STDERR, "Config problem: " . $e->getMessage() . "\n"); exit(1); }

$driver = Config::get('mail.driver');
echo "Mail driver: $driver\n";
$ok = Mailer::send($to, 'Universal Office test message',
    "This is a test message from The Universal Office.\n\nIf you can read this, the mail settings work.\nSent " . gmdate('Y-m-d H:i:s') . " UTC.\n");
if ($ok) {
    echo $driver === 'log' ? "Written to the outbox log (nothing was sent).\n" : "Sent. Check the inbox (and spam folder) of $to.\n";
    exit(0);
}
fwrite(STDERR, "FAILED: " . (Mailer::$lastError ?? 'unknown') . "\n");
exit(1);
