<?php
// Applies any pending database migrations. Safe to run repeatedly.
// Run:  php api/cli/migrate.php
// Uses the config found by UO_CONFIG_PATH or <home>/uo-private/config.php.
if (PHP_SAPI !== 'cli') { exit; }
define('UO_API', true);
foreach (['Config', 'Db', 'Migrator'] as $c) { require_once __DIR__ . "/../src/$c.php"; }

try {
    Config::load();
    $applied = Migrator::run(Db::pdo(), __DIR__ . '/../migrations');
} catch (Throwable $e) {
    fwrite(STDERR, "Migration failed (" . get_class($e) . "): " . $e->getMessage() . "\n");
    exit(1);
}
echo $applied === [] ? "Database is up to date.\n" : "Applied: " . implode(', ', $applied) . "\n";
