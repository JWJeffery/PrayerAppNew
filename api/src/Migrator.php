<?php
// Applies api/migrations/*.sql in filename order and records each in schema_migrations.
// MariaDB DDL auto-commits, so there is no transaction; migrations must be idempotent.
if (!defined('UO_API')) { exit; }

final class Migrator
{
    /** @return string[] versions applied by this call (empty when already up to date) */
    public static function run(PDO $pdo, string $dir): array
    {
        $pdo->exec('CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(40) NOT NULL PRIMARY KEY,
            applied_at DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

        $done = $pdo->query('SELECT version FROM schema_migrations')->fetchAll(PDO::FETCH_COLUMN);
        $files = glob(rtrim($dir, '/') . '/*.sql') ?: [];
        sort($files);
        $applied = [];
        foreach ($files as $file) {
            $version = basename($file, '.sql');
            if (in_array($version, $done, true)) { continue; }
            foreach (self::statements((string)file_get_contents($file)) as $sql) {
                $pdo->exec($sql);
            }
            $ins = $pdo->prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, UTC_TIMESTAMP())');
            $ins->execute([$version]);
            $applied[] = $version;
        }
        return $applied;
    }

    /** Strip "-- ..." comments, split on the statement terminator, drop empties. */
    public static function statements(string $sql): array
    {
        $sql = preg_replace('/(^|\s)--[^\n]*/', '$1', $sql);
        $out = [];
        foreach (explode(';', $sql) as $part) {
            $part = trim($part);
            if ($part !== '') { $out[] = $part; }
        }
        return $out;
    }
}
