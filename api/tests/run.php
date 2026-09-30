<?php
// Plain-PHP test runner (no Composer). Run:  php api/tests/run.php
// Unit tests run in-process; HTTP tests start a throwaway `php -S` server on a
// random port with a temporary config under api/tests/.tmp/ (git-ignored).
if (PHP_SAPI !== 'cli') { exit; }
define('UO_API', true);
$apiDir = dirname(__DIR__);
foreach (['Config', 'Response', 'Request', 'Router', 'Db'] as $c) { require_once "$apiDir/src/$c.php"; }

$pass = 0; $fail = 0;
function t(string $name, bool $ok, string $detail = ''): void {
    global $pass, $fail;
    if ($ok) { $pass++; echo "  ok   $name\n"; }
    else { $fail++; echo "  FAIL $name" . ($detail !== '' ? " -- $detail" : '') . "\n"; }
}

// ---- Unit: Config ----------------------------------------------------------
echo "Config\n";
$ph = Config::placeholders(['a' => 'CHANGE_ME', 'b' => ['c' => 'CHANGE_ME_64_HEX', 'd' => 'fine'], 'e' => 5]);
t('detects nested placeholders', $ph === ['a', 'b.c'], json_encode($ph));
t('no false positive', Config::placeholders(['a' => 'x', 'b' => ['c' => 'y']]) === []);
t('example config is all placeholders/valid array', is_array(include "$apiDir/config.example.php"));
$threw = false;
try { Config::load('/nonexistent/config.php'); } catch (Throwable $e) { $threw = true; }
t('missing config fails closed', $threw);

// ---- Unit: Router ----------------------------------------------------------
echo "Router\n";
t('literal match', Router::match('/health', '/health') === []);
t('param capture', Router::match('/parishes/{slug}/intentions', '/parishes/st-bede/intentions') === ['slug' => 'st-bede']);
t('segment count mismatch', Router::match('/a/{x}', '/a/b/c') === null);
t('unsafe param rejected', Router::match('/a/{x}', '/a/b%20c') === null);
$r = new Router();
$r->add('GET', '/x', fn() => 1);
t('resolve 200', $r->resolve('GET', '/x')['status'] === 200);
t('resolve 405 lists Allow', ($m = $r->resolve('POST', '/x'))['status'] === 405 && $m['allow'] === ['GET']);
t('resolve 404', $r->resolve('GET', '/nope')['status'] === 404);

// ---- HTTP: throwaway dev server ---------------------------------------------
echo "HTTP (dev server)\n";
$tmp = "$apiDir/tests/.tmp";
@mkdir("$tmp/logs", 0700, true);
$cfgFile = "$tmp/config.php";
file_put_contents($cfgFile, "<?php\nreturn [\n 'db' => ['host' => '127.0.0.1', 'name' => 't', 'user' => 't', 'pass' => 't'],\n"
    . " 'mail' => ['driver' => 'log'],\n 'secrets' => ['pepper' => '" . bin2hex(random_bytes(32)) . "', 'box_key' => '" . base64_encode(random_bytes(32)) . "'],\n"
    . " 'admin_emails' => ['a@example.org'], 'site_url' => 'http://localhost', 'allowed_origins' => [], 'trust_proxy' => false, 'log_dir' => null,\n];\n");
$port = random_int(20000, 40000);
$env = array_merge(getenv(), ['UO_CONFIG_PATH' => $cfgFile]);
$proc = proc_open([PHP_BINARY, '-S', "127.0.0.1:$port", '-t', dirname($apiDir), "$apiDir/dev/router.php"],
    [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, dirname($apiDir), $env);
for ($i = 0; $i < 50; $i++) { // wait for the server
    if (@fsockopen('127.0.0.1', $port)) { break; }
    usleep(100000);
}
function http(int $port, string $method, string $path): array {
    $ctx = stream_context_create(['http' => ['method' => $method, 'ignore_errors' => true, 'timeout' => 5]]);
    $body = @file_get_contents("http://127.0.0.1:$port$path", false, $ctx);
    $status = 0; $hdr = [];
    foreach ($http_response_header ?? [] as $h) {
        if (preg_match('#^HTTP/\S+ (\d+)#', $h, $m)) { $status = (int)$m[1]; }
        elseif (strpos($h, ':') !== false) { [$k, $v] = explode(':', $h, 2); $hdr[strtolower($k)] = trim($v); }
    }
    return [$status, (string)$body, $hdr];
}
[$s, $b, $h] = http($port, 'GET', '/api/v1/health');
t('health 200 + JSON', $s === 200 && json_decode($b, true) === ['status' => 'ok'], "$s $b");
t('security headers set', ($h['x-content-type-options'] ?? '') === 'nosniff' && ($h['referrer-policy'] ?? '') === 'no-referrer'
    && ($h['cache-control'] ?? '') === 'no-store' && strpos($h['content-type'] ?? '', 'application/json') === 0);
t('no CORS header by default', !isset($h['access-control-allow-origin']));
[$s, $b] = http($port, 'GET', '/api/v1/nope');
t('unknown route -> 404 JSON', $s === 404 && (json_decode($b, true)['error'] ?? '') === 'not_found', "$s $b");
[$s, $b, $h] = http($port, 'POST', '/api/v1/health');
t('wrong method -> 405 + Allow', $s === 405 && ($h['allow'] ?? '') === 'GET', "$s");
foreach (['/api/src/bootstrap.php', '/api/lib/x.php', '/api/migrations/001_init.sql', '/api/cron/daily.php',
          '/api/cli/preflight.php', '/api/config.example.php', '/api/config.php', '/api/tests/run.php', '/api/dev/router.php'] as $p) {
    [$s, $b] = http($port, 'GET', $p);
    t("blocked: $p", in_array($s, [403, 404], true) && strpos($b, '<?php') === false && strpos($b, 'CHANGE_ME') === false, (string)$s);
}
[$s] = http($port, 'GET', '/index.html');
t('static site still served', $s === 200, (string)$s);
proc_terminate($proc); proc_close($proc);

// Missing config must fail closed with a generic 500.
$env['UO_CONFIG_PATH'] = "$tmp/does-not-exist.php";
$port2 = $port + 1;
$proc = proc_open([PHP_BINARY, '-S', "127.0.0.1:$port2", '-t', dirname($apiDir), "$apiDir/dev/router.php"],
    [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, dirname($apiDir), $env);
for ($i = 0; $i < 50; $i++) { if (@fsockopen('127.0.0.1', $port2)) { break; } usleep(100000); }
[$s, $b] = http($port2, 'GET', '/api/v1/health');
t('missing config -> generic 500', $s === 500 && (json_decode($b, true)['error'] ?? '') === 'server_error' && strpos($b, 'config') === false, "$s $b");
proc_terminate($proc); proc_close($proc);

echo "\n$pass passed, $fail failed\n";
exit($fail === 0 ? 0 : 1);
