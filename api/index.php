<?php
// Universal Office API front controller. This is the ONLY PHP file that is
// directly reachable over HTTP; .htaccess routes every /api/v1/... request here.
define('UO_API', true);
require __DIR__ . '/src/bootstrap.php';
uo_api_run();
