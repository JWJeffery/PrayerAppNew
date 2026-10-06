<?php
// Lazy PDO connection. Prepared statements only (no emulation), exceptions on error.
if (!defined('UO_API')) { exit; }

final class Db
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (self::$pdo === null) {
            $c = Config::get('db');
            $dsn = 'mysql:host=' . $c['host'] . ';dbname=' . $c['name'] . ';charset=utf8mb4';
            self::$pdo = new PDO($dsn, $c['user'], $c['pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            // All stored timestamps are UTC (spec section 5).
            self::$pdo->exec("SET time_zone = '+00:00'");
        }
        return self::$pdo;
    }
}
