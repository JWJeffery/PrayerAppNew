<?php
// Router for `php -S` (development only, never deployed). Serves static files from
// the repo root, sends /api/... to api/index.php, and mimics the production
// .htaccess deny rules so the same checks can be tested locally.
$root = dirname(__DIR__, 2);
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$uri = rawurldecode($uri);

if (strpos($uri, "\0") !== false || strpos($uri, '..') !== false) { http_response_code(400); exit; }

if (preg_match('#^/api(/|$)#', $uri)) {
    $rel = substr($uri, 5);
    if (preg_match('#^(src|lib|migrations|cron|cli|tests|dev)(/|$)#', $rel)
        || preg_match('#(^|/)config[^/]*\.(php|json|ini)$#', $rel)
        || preg_match('#(^|/)[^/]*\.(cnf|sql|gz|log)$#', $rel)
        || (preg_match('#\.php$#', $rel) && $rel !== 'index.php')) {
        http_response_code(403);
        exit;
    }
    if ($rel === 'openapi.yaml' && is_file("$root/api/openapi.yaml")) {
        header('Content-Type: text/yaml');
        readfile("$root/api/openapi.yaml");
        return true;
    }
    $_SERVER['SCRIPT_NAME'] = '/api/index.php';
    require "$root/api/index.php";
    return true;
}
// Mirror parish/.htaccess so local pages run under the same Content-Security-Policy as production
// (no inline script or style, same-origin connections only) -- a page that only works locally
// because the dev server was more forgiving would be a nasty surprise after upload.
if (preg_match('#^/parish(/|$)#', $uri)) {
    $file = realpath($root . ($uri === '/parish/' || $uri === '/parish' ? '/parish/index.html' : $uri));
    $base = realpath($root . '/parish');
    if ($file === false || $base === false || strpos($file, $base . DIRECTORY_SEPARATOR) !== 0 || !is_file($file)) { http_response_code(404); exit; }
    $types = ['html' => 'text/html; charset=utf-8', 'js' => 'application/javascript; charset=utf-8', 'css' => 'text/css; charset=utf-8'];
    header('Content-Type: ' . ($types[pathinfo($file, PATHINFO_EXTENSION)] ?? 'application/octet-stream'));
    header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    readfile($file);
    return true;
}
return false; // let the built-in server serve static files from the docroot
