<?php
section('Config');
$ph = Config::placeholders(['a' => 'CHANGE_ME', 'b' => ['c' => 'CHANGE_ME_64_HEX', 'd' => 'fine'], 'e' => 5]);
t('detects nested placeholders', $ph === ['a', 'b.c'], json_encode($ph));
t('no false positive', Config::placeholders(['a' => 'x', 'b' => ['c' => 'y']]) === []);
t('example config is an array', is_array(include "$apiDir/config.example.php"));
$threw = false;
try { Config::load('/nonexistent/config.php'); } catch (Throwable $e) { $threw = true; }
Config::load($cfgFile); // restore the test config after the failed load above
t('missing config fails closed', $threw);

section('Router');
t('literal match', Router::match('/health', '/health') === []);
t('param capture', Router::match('/parishes/{slug}/intentions', '/parishes/st-bede/intentions') === ['slug' => 'st-bede']);
t('segment count mismatch', Router::match('/a/{x}', '/a/b/c') === null);
t('unsafe param rejected', Router::match('/a/{x}', '/a/b%20c') === null);
$r = new Router();
$r->add('GET', '/x', fn() => 1);
t('resolve 200', $r->resolve('GET', '/x')['status'] === 200);
t('resolve 405 lists Allow', ($m = $r->resolve('POST', '/x'))['status'] === 405 && $m['allow'] === ['GET']);
t('resolve 404', $r->resolve('GET', '/nope')['status'] === 404);

section('HTTP basics (dev server)');
[$s, $b, $h] = http('GET', '/api/v1/health');
t('health 200 + JSON', $s === 200 && jbody($b) === ['status' => 'ok'], "$s $b");
t('security headers set', ($h['x-content-type-options'] ?? '') === 'nosniff' && ($h['referrer-policy'] ?? '') === 'no-referrer'
    && ($h['cache-control'] ?? '') === 'no-store' && strpos($h['content-type'] ?? '', 'application/json') === 0);
t('no CORS header by default', !isset($h['access-control-allow-origin']));
[$s, $b] = http('GET', '/api/v1/nope');
t('unknown route -> 404 JSON', $s === 404 && (jbody($b)['error'] ?? '') === 'not_found', "$s $b");
[$s, $b, $h] = http('POST', '/api/v1/health');
t('wrong method -> 405 + Allow', $s === 405 && ($h['allow'] ?? '') === 'GET', "$s");
foreach (['/api/src/bootstrap.php', '/api/lib/x.php', '/api/migrations/001_init.sql', '/api/cron/daily.php',
          '/api/cli/preflight.php', '/api/config.example.php', '/api/config.php', '/api/tests/run.php', '/api/dev/router.php'] as $p) {
    [$s, $b] = http('GET', $p);
    t("blocked: $p", in_array($s, [403, 404], true) && strpos($b, '<?php') === false && strpos($b, 'CHANGE_ME') === false, (string)$s);
}
[$s] = http('GET', '/index.html');
t('static site still served', $s === 200, (string)$s);

$missingCfg = "$tmp/does-not-exist.php";
$port2 = $port + 1;
$proc2 = start_server($port2, $missingCfg, $apiDir);
[$s, $b] = http('GET', '/api/v1/health', [], null, $port2);
t('missing config -> generic 500', $s === 500 && (jbody($b)['error'] ?? '') === 'server_error' && strpos($b, 'config') === false, "$s $b");
proc_terminate($proc2); proc_close($proc2);
