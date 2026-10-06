<?php
// API bootstrap: load classes, install the error handler, build the router, dispatch.
if (!defined('UO_API')) { exit; }

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Request.php';
require_once __DIR__ . '/Router.php';
require_once __DIR__ . '/Db.php';
require_once __DIR__ . '/Validate.php';
require_once __DIR__ . '/Crypto.php';
require_once __DIR__ . '/RateLimit.php';
require_once __DIR__ . '/Migrator.php';
require_once __DIR__ . '/Audit.php';
require_once __DIR__ . '/Deferred.php';
require_once __DIR__ . '/Mailer.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/Handlers/Public.php';
require_once __DIR__ . '/Handlers/AuthHandlers.php';
require_once __DIR__ . '/Handlers/Staff.php';
require_once __DIR__ . '/Handlers/Register.php';
require_once __DIR__ . '/Handlers/Admin.php';
require_once __DIR__ . '/Handlers/ParishPages.php';

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
    // Reader endpoints (spec 8.1).
    $r->add('GET', '/parishes', ['PublicApi', 'listParishes']);
    $r->add('GET', '/parishes/{slug}/intentions', ['PublicApi', 'intentions']);
    $r->add('POST', '/parishes/{slug}/join', ['PublicApi', 'join']);
    // Parish home page, events, announcements and the diocesan page (2026-10-06).
    $r->add('GET', '/parishes/{slug}', ['ParishPagesApi', 'home']);
    $r->add('GET', '/dioceses/{body}/{name}', ['ParishPagesApi', 'diocese']);
    // Staff authentication (spec 8.3).
    $r->add('POST', '/auth/request-code', ['AuthApi', 'requestCode']);
    $r->add('POST', '/auth/verify-code', ['AuthApi', 'verifyCode']);
    $r->add('POST', '/auth/logout', ['AuthApi', 'logout']);
    $r->add('GET', '/me', ['AuthApi', 'me']);
    // Staff endpoints (spec 8.4); the parish always comes from the session.
    $r->add('GET', '/staff/intentions', ['StaffApi', 'listIntentions']);
    $r->add('POST', '/staff/intentions', ['StaffApi', 'createIntention']);
    $r->add('PATCH', '/staff/intentions/{id}', ['StaffApi', 'editIntention']);
    $r->add('DELETE', '/staff/intentions/{id}', ['StaffApi', 'deleteIntention']);
    $r->add('POST', '/staff/intentions/{id}/extend', ['StaffApi', 'extendIntention']);
    $r->add('GET', '/staff/delegates', ['StaffApi', 'listDelegates']);
    $r->add('POST', '/staff/delegates', ['StaffApi', 'addDelegate']);
    $r->add('DELETE', '/staff/delegates/{id}', ['StaffApi', 'removeDelegate']);
    $r->add('PATCH', '/staff/parish', ['StaffApi', 'updateParish']);
    $r->add('DELETE', '/staff/parish', ['StaffApi', 'deleteParish']);
    $r->add('GET', '/staff/parish/join-code', ['StaffApi', 'getJoinCode']);
    $r->add('POST', '/staff/parish/join-code/rotate', ['StaffApi', 'rotateJoinCode']);
    $r->add('DELETE', '/staff/me', ['StaffApi', 'deleteMe']);
    $r->add('GET', '/staff/parish/profile', ['ParishPagesApi', 'getProfile']);
    $r->add('PUT', '/staff/parish/profile', ['ParishPagesApi', 'putProfile']);
    $r->add('GET', '/staff/events', ['ParishPagesApi', 'listEvents']);
    $r->add('POST', '/staff/events', ['ParishPagesApi', 'createEvent']);
    $r->add('PATCH', '/staff/events/{id}', ['ParishPagesApi', 'editEvent']);
    $r->add('DELETE', '/staff/events/{id}', ['ParishPagesApi', 'deleteEvent']);
    $r->add('GET', '/staff/announcements', ['ParishPagesApi', 'listAnnouncements']);
    $r->add('POST', '/staff/announcements', ['ParishPagesApi', 'createAnnouncement']);
    $r->add('POST', '/staff/announcements/{id}/extend', ['ParishPagesApi', 'extendAnnouncement']);
    $r->add('DELETE', '/staff/announcements/{id}', ['ParishPagesApi', 'deleteAnnouncement']);
    // Registration (spec 8.2).
    $r->add('POST', '/register', ['RegisterApi', 'register']);
    $r->add('POST', '/register/verify', ['RegisterApi', 'verify']);
    // Admin (spec 8.5).
    $r->add('POST', '/admin/auth/request-code', ['AdminApi', 'requestCode']);
    $r->add('POST', '/admin/auth/verify-code', ['AdminApi', 'verifyCode']);
    $r->add('POST', '/admin/approval-info', ['AdminApi', 'approvalInfo']);
    $r->add('POST', '/admin/approve', ['AdminApi', 'approve']);
    $r->add('GET', '/admin/parishes', ['AdminApi', 'listParishes']);
    $r->add('POST', '/admin/parishes/{id}/approve', ['AdminApi', 'approveById']);
    $r->add('POST', '/admin/parishes/{id}/suspend', ['AdminApi', 'suspend']);
    $r->add('POST', '/admin/parishes/{id}/unsuspend', ['AdminApi', 'unsuspend']);
    $r->add('DELETE', '/admin/parishes/{id}', ['AdminApi', 'delete']);
    $r->add('GET', '/admin/status', ['AdminApi', 'status']);
    $r->add('PUT', '/admin/dioceses/{body}/{name}', ['ParishPagesApi', 'adminPutDiocese']);
    $r->add('POST', '/admin/dioceses/{body}/{name}/prayers', ['ParishPagesApi', 'adminAddPrayer']);
    $r->add('DELETE', '/admin/dioceses/{body}/{name}/prayers/{id}', ['ParishPagesApi', 'adminDeletePrayer']);
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
        call_user_func($res['handler'], $res['params']);
    }
}
