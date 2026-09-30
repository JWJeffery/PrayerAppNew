<?php
// API bootstrap: load classes, install the error handler, build the router, dispatch.
if (!defined('UO_API')) { exit; }

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Request.php';
require_once __DIR__ . '/Router.php';
require_once __DIR__ . '/Db.php';

/**
 * Append a line to the API error log. Reason/class names only -- never request
 * bodies, codes, tokens, emails or intention text (spec 6.5).
 */
function uo_log(string $line): void
{
    $dir = null;
    try { $dir = Config::logDir(); } catch (Throwable $e) { /* config not loaded yet */ }
    $msg = gmdate('Y-m-d\TH:i:s\Z') . ' ' . $line . "\n";
    if ($dir !== null && (is_dir($dir) || @mkdir($dir, 0700, true))) {
        @file_put_contents($dir . '/api-error.log', $msg, FILE_APPEND | LOCK_EX);
    } else {
        error_log(trim($msg));
    }
}

function uo_fail_closed(string $reason): void
{
    uo_log('fatal: ' . $reason);
    if (!headers_sent()) {
        Response::error(500, 'server_error', 'The service is temporarily unavailable.');
    }
}

function uo_build_router(): Router
{
    $r = new Router();
    // Health check: proves the front controller, config and routing work. No DB, no data.
    $r->add('GET', '/health', function (): void {
        Response::json(200, ['status' => 'ok']);
    });
    return $r;
}

function uo_api_run(): void
{
    set_exception_handler(function (Throwable $e): void {
        uo_fail_closed(get_class($e));
    });
    try {
        Config::load();
    } catch (RuntimeException $e) {
        uo_fail_closed($e->getMessage());
        return;
    }
    $path = Request::path();
    if ($path === null) {
        Response::error(404, 'not_found', 'Not found.');
        return;
    }
    $res = uo_build_router()->resolve(Request::method(), $path);
    if ($res['status'] === 404) {
        Response::error(404, 'not_found', 'Not found.');
    } elseif ($res['status'] === 405) {
        header('Allow: ' . implode(', ', $res['allow']));
        Response::error(405, 'method_not_allowed', 'Method not allowed.');
    } else {
        ($res['handler'])($res['params']);
    }
}
