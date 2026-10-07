-- Diocesan sign-in (2026-10-07). A diocese editor is an address a global administrator has designated for ONE
-- diocese; they sign in (emailed code, optional password or passkey) and keep that diocese's page: the bishop,
-- website, convention dates and the bishop's prayer list. Idempotent: safe to run more than once, and safe to
-- paste into phpMyAdmin. Maintainers: cli/migrate.php strips comments and splits on the statement terminator,
-- so keep semicolons and double dashes out of string literals.

CREATE TABLE IF NOT EXISTS diocese_staff (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  diocese_key VARCHAR(121) NOT NULL,
  email VARCHAR(254) NOT NULL,
  added_by VARCHAR(254) NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uq_diocese_staff_email (email),
  KEY idx_diocese_staff_key (diocese_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE login_codes MODIFY purpose ENUM('login','register','admin','reader','reauth','diocese') NOT NULL;
ALTER TABLE sessions MODIFY principal ENUM('staff','admin','reader','diocese') NOT NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS diocese_staff_id BIGINT UNSIGNED NULL;
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_diocese_staff FOREIGN KEY IF NOT EXISTS (diocese_staff_id) REFERENCES diocese_staff(id) ON DELETE CASCADE;

INSERT IGNORE INTO schema_migrations (version, applied_at) VALUES ('005_diocese_staff', UTC_TIMESTAMP());
