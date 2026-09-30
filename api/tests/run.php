<?php
// Plain-PHP test runner (no Composer).  Run:  php api/tests/run.php
//
// Needs a local MariaDB (see documentation): connects with the dev credentials, creates a
// throwaway database "uo_test_<random>", runs the migrations into it, starts a throwaway
// `php -S` server pointed at it, runs every tests/t*.php file, then drops the database.
// Override the connection with UO_TEST_DB_HOST / UO_TEST_DB_USER / UO_TEST_DB_PASS.
if (PHP_SAPI !== 'cli') { exit; }
define('UO_API', true);
$apiDir = dirname(__DIR__);
foreach (['Config', 'Response', 'Request', 'Router', 'Db', 'Validate', 'Crypto', 'RateLimit', 'Migrator'] as $c) {
    require_once "$apiDir/src/$c.php";
}

$pass = 0; $fail = 0;
function t(string $name, bool $ok, string $detail = ''): void {
    global $pass, $fail;
    if ($ok) { $pass++; echo "  ok   $name\n"; }
    else { $fail++; echo "  FAIL $name" . ($detail !== '' ? " -- $detail" : '') . "\n"; }
}
function section(string $title): void { echo "$title\n"; }

/** HTTP request against the throwaway server. Returns [status, body, lower-cased headers]. */
function http(string $method, string $path, array $headers = [], ?array $json = null, ?int $port_override = null): array {
    global $port;
    $usePort = $port_override ?? $port;
    $h = $headers;
    $content = '';
    if ($json !== null) { $h[] = 'Content-Type: application/json'; $content = json_encode($json); }
    $ctx = stream_context_create(['http' => ['method' => $method, 'ignore_errors' => true, 'timeout' => 10,
                                             'header' => implode("\r\n", $h), 'content' => $content]]);
    $body = @file_get_contents("http://127.0.0.1:$usePort$path", false, $ctx);
    $status = 0; $hdr = [];
    foreach ($http_response_header ?? [] as $line) {
        if (preg_match('#^HTTP/\S+ (\d+)#', $line, $m)) { $status = (int)$m[1]; }
        elseif (strpos($line, ':') !== false) { [$k, $v] = explode(':', $line, 2); $hdr[strtolower($k)] = trim($v); }
    }
    return [$status, (string)$body, $hdr];
}
function jbody(string $body): array { $d = json_decode($body, true); return is_array($d) ? $d : []; }

function start_server(int $port, string $configPath, string $apiDir) {
    $env = array_merge(getenv(), ['UO_CONFIG_PATH' => $configPath]);
    $proc = proc_open([PHP_BINARY, '-S', "127.0.0.1:$port", '-t', dirname($apiDir), "$apiDir/dev/router.php"],
        [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']],
        $pipes, dirname($apiDir), $env);
    for ($i = 0; $i < 50; $i++) { if (@fsockopen('127.0.0.1', $port)) { break; } usleep(100000); }
    return $proc;
}

// ---- Test database ----------------------------------------------------------
$dbHost = getenv('UO_TEST_DB_HOST') ?: '127.0.0.1';
$dbUser = getenv('UO_TEST_DB_USER') ?: 'uo_dev';
$dbPass = getenv('UO_TEST_DB_PASS') ?: 'uo_dev_local_only';
$dbName = 'uo_test_' . bin2hex(random_bytes(4));
try {
    $admin = new PDO("mysql:host=$dbHost;charset=utf8mb4", $dbUser, $dbPass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $admin->exec("CREATE DATABASE `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
} catch (Throwable $e) {
    fwrite(STDERR, "Cannot create the test database (" . get_class($e) . ").\n"
        . "Is MariaDB running, and does the uo_dev user have rights on `uo_%` databases?\n"
        . "See documentation/PARISH_INTENTIONS.md (dev setup), or ask for the exact commands.\n");
    exit(2);
}
$tmp = "$apiDir/tests/.tmp";
@mkdir("$tmp/logs", 0700, true);
$cfgFile = "$tmp/config.php";
file_put_contents($cfgFile, "<?php\nreturn " . var_export([
    'db' => ['host' => $dbHost, 'name' => $dbName, 'user' => $dbUser, 'pass' => $dbPass],
    'mail' => ['driver' => 'log'],
    'secrets' => ['pepper' => bin2hex(random_bytes(32)), 'box_key' => base64_encode(random_bytes(32))],
    'admin_emails' => ['a@example.org'], 'site_url' => 'http://localhost',
    'allowed_origins' => [], 'trust_proxy' => false, 'log_dir' => null,
], true) . ";\n");
chmod($cfgFile, 0600);
Config::load($cfgFile);
$pdo = Db::pdo();
$applied = Migrator::run($pdo, "$apiDir/migrations");

$port = random_int(20000, 40000);
$proc = start_server($port, $cfgFile, $apiDir);
register_shutdown_function(function () use ($proc, $admin, $dbName) {
    if (is_resource($proc)) { proc_terminate($proc); proc_close($proc); }
    try { $admin->exec("DROP DATABASE IF EXISTS `$dbName`"); } catch (Throwable $e) { /* best effort */ }
});

// ---- Shared test helpers ------------------------------------------------------
function reset_state(): void {
    global $pdo;
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    foreach (['intentions', 'sessions', 'login_codes', 'approval_tokens', 'staff', 'parishes', 'rate_limits', 'audit_log'] as $tbl) {
        $pdo->exec("TRUNCATE TABLE `$tbl`");
    }
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
}
/** Insert a parish; returns [id, plaintextJoinCode]. */
function make_parish(string $slug, string $status = 'approved', string $visibility = 'code',
                     ?string $diocese = null, ?string $name = null): array {
    global $pdo;
    $code = Crypto::generateJoinCode();
    $pdo->prepare('INSERT INTO parishes (slug, name, diocese_key, visibility, join_code_enc, status, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())')
        ->execute([$slug, $name ?? ucfirst($slug), $diocese, $visibility,
                   $visibility === 'code' ? Crypto::encryptJoinCode($code) : null, $status]);
    return [(int)$pdo->lastInsertId(), $code];
}
function make_intention(int $parishId, string $category, string $body, int $expiresInSeconds): int {
    global $pdo;
    $pdo->prepare('INSERT INTO intentions (parish_id, category, body, created_at, expires_at)
                   VALUES (?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL ? SECOND)')
        ->execute([$parishId, $category, $body, $expiresInSeconds]);
    return (int)$pdo->lastInsertId();
}

// ---- Run test files -----------------------------------------------------------
$files = glob(__DIR__ . '/t*.php');
sort($files);
foreach ($files as $f) { require $f; }

echo "\n$pass passed, $fail failed\n";
exit($fail === 0 ? 0 : 1);
