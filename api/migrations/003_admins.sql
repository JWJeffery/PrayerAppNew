-- Global administrators designated inside the app (2026-10-06). The addresses listed under admin_emails in
-- the private config are the OWNERS and always work; rows here are administrators an owner added on the
-- admin page. Idempotent: safe to run more than once, and safe to paste into phpMyAdmin.

CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  added_by VARCHAR(254) NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations (version, applied_at) VALUES ('003_admins', UTC_TIMESTAMP());
