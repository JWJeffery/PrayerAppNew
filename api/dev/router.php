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
return false; // let the built-in server serve static files from the docroot
