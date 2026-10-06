<?php
// Preflight: checks PHP, extensions, config and (optionally) the database.
// Run:  php api/cli/preflight.php            (full)
//       php api/cli/preflight.php --skip-db  (no database check)
// Exit code 0 = all required checks passed. Never prints secret values.
if (PHP_SAPI !== 'cli') { exit; }
define('UO_API', true);
require __DIR__ . '/../src/Config.php';

$fails = 0; $warns = 0;
function check(bool $ok, string $label, string $hint = ''): void {
    global $fails;
    echo ($ok ? '[ OK ] ' : '[FAIL] ') . $label . "\n";
    if (!$ok) { $fails++; if ($hint !== '') { echo '       -> ' . $hint . "\n"; } }
}
function warn(bool $ok, string $label, string $hint): void {
    global $warns;
    if ($ok) { echo '[ OK ] ' . $label . "\n"; return; }
    $warns++; echo '[WARN] ' . $label . "\n       -> " . $hint . "\n";
}

echo "Universal Office API preflight\n==============================\n";
check(version_compare(PHP_VERSION, '8.1.0', '>='), 'PHP version ' . PHP_VERSION . ' (need 8.1 or newer)',
      'Set a newer PHP version in cPanel (PHP Tweaks / Select PHP Version).');
warn(version_compare(PHP_VERSION, '8.2.0', '>='), 'PHP 8.2+ recommended', 'Consider selecting PHP 8.2 or newer.');
foreach (['sodium', 'pdo_mysql', 'mbstring', 'openssl'] as $ext) {
    check(extension_loaded($ext), "PHP extension: $ext", "Enable '$ext' for your PHP version in cPanel.");
}

$path = Config::locate();
check($path !== null, 'config.php found' . ($path ? ' (' . $path . ')' : ''),
      'Create <home>/uo-private/config.php from api/config.example.php, or set UO_CONFIG_PATH.');
$cfg = null;
if ($path !== null) {
    $perm = fileperms($path) & 0777;
    warn(($perm & 0077) === 0, 'config.php is private (mode ' . decoct($perm) . ')',
         'Run: chmod 600 "' . $path . '"');
    $docroot = $_SERVER['DOCUMENT_ROOT'] ?? '';
    if ($docroot !== '') {
        warn(strpos(realpath($path) ?: $path, realpath($docroot) ?: $docroot) !== 0,
             'config.php is outside the web root', 'Move it to <home>/uo-private/.');
    }
    $cfg = (static function (string $p) { return include $p; })($path);
    check(is_array($cfg), 'config.php returns an array', 'Recreate it from api/config.example.php.');
}
if (is_array($cfg)) {
    $bad = Config::placeholders($cfg);
    check($bad === [], 'no CHANGE_ME placeholders remain', $bad ? 'Still to fill in: ' . implode(', ', $bad) : '');
    $pepper = $cfg['secrets']['pepper'] ?? '';
    check(is_string($pepper) && preg_match('/^[0-9a-f]{64}$/', $pepper) === 1, 'secrets.pepper is 64 hex characters',
          'Generate one with: php api/cli/gen-secrets.php');
    $key = base64_decode((string)($cfg['secrets']['box_key'] ?? ''), true);
    check($key !== false && strlen($key) === 32, 'secrets.box_key decodes to 32 bytes',
          'Generate one with: php api/cli/gen-secrets.php');
    $driver = $cfg['mail']['driver'] ?? '';
    check(in_array($driver, ['smtp', 'log'], true), "mail.driver is 'smtp' or 'log' (is '$driver')", '');
    if ($driver === 'smtp') {
        check(in_array($cfg['mail']['encryption'] ?? '', ['tls', 'ssl'], true), "mail.encryption is 'tls' or 'ssl'", '');
        check(is_int($cfg['mail']['port'] ?? null), 'mail.port is a number', '');
    }
    $admins = $cfg['admin_emails'] ?? [];
    check(is_array($admins) && $admins !== [] && count(array_filter($admins, fn($e) => filter_var($e, FILTER_VALIDATE_EMAIL))) === count($admins),
          'admin_emails has valid address(es)', '');
    check(strpos((string)($cfg['site_url'] ?? ''), 'http') === 0, 'site_url is set', '');

    if (!in_array('--skip-db', $argv, true) && $bad === [] && extension_loaded('pdo_mysql')) {
        try {
            $d = $cfg['db'];
            $pdo = new PDO("mysql:host={$d['host']};dbname={$d['name']};charset=utf8mb4", $d['user'], $d['pass'],
                           [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $pdo->query('SELECT 1');
            check(true, 'database connection works');
        } catch (Throwable $e) {
            check(false, 'database connection works', 'Connection failed (' . get_class($e) . '). Check db.host/name/user/pass in config.php.');
        }
    } else {
        echo "[skip] database connection (--skip-db, placeholders, or missing driver)\n";
    }
}
echo "\n" . ($fails === 0 ? "PREFLIGHT PASSED" : "PREFLIGHT FAILED ($fails problem" . ($fails === 1 ? '' : 's') . ')')
   . ($warns ? " with $warns warning(s)" : '') . "\n";
exit($fails === 0 ? 0 : 1);
