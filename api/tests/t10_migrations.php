<?php
section('Migrations');
t('first run applied 001_init and the later migrations', $applied === ['001_init', '002_parish_pages', '003_admins'], json_encode($applied));
$tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
foreach (['schema_migrations', 'parishes', 'staff', 'login_codes', 'sessions', 'approval_tokens', 'intentions', 'rate_limits', 'audit_log'] as $tbl) {
    t("table exists: $tbl", in_array($tbl, $tables, true));
}
t('second run applies nothing (idempotent)', Migrator::run($pdo, "$apiDir/migrations") === []);
t('version recorded once', (int)$pdo->query("SELECT COUNT(*) FROM schema_migrations WHERE version='001_init'")->fetchColumn() === 1);
t('statement splitter drops comments', Migrator::statements("-- hi;\nSELECT 1; -- tail\nSELECT 2;") === ['SELECT 1', 'SELECT 2']);
$cs = $pdo->query("SELECT TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'intentions'")->fetchColumn();
t('tables are utf8mb4', is_string($cs) && strpos($cs, 'utf8mb4') === 0, (string)$cs);
