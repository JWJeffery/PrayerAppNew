-- Universal Office API -- initial schema (spec section 5).
-- Idempotent: safe to run more than once, and safe to paste into phpMyAdmin.
-- MariaDB 10.x, InnoDB, utf8mb4. All timestamps are UTC.
-- Note for maintainers: cli/migrate.php strips comments and splits on the
-- statement terminator, so keep semicolons and double dashes out of string literals.

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(40) NOT NULL PRIMARY KEY,
  applied_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parishes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(80) NOT NULL,
  name VARCHAR(160) NOT NULL,
  tradition VARCHAR(40) NOT NULL DEFAULT 'anglican',
  diocese_key VARCHAR(120) NULL,
  corpus_parish_slug VARCHAR(80) NULL,
  visibility ENUM('public','code') NOT NULL DEFAULT 'code',
  join_code_enc VARBINARY(255) NULL,
  join_code_version INT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('pending','approved','suspended') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL,
  approved_at DATETIME NULL,
  UNIQUE KEY uq_parishes_slug (slug),
  KEY idx_parishes_status_diocese (status, diocese_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parish_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(254) NOT NULL,
  display_name VARCHAR(120) NULL,
  role ENUM('rector','delegate') NOT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uq_staff_email (email),
  KEY idx_staff_parish (parish_id),
  CONSTRAINT fk_staff_parish FOREIGN KEY (parish_id) REFERENCES parishes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_codes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  purpose ENUM('login','register','admin') NOT NULL,
  email VARCHAR(254) NOT NULL,
  code_hash CHAR(64) NOT NULL,
  payload TEXT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  KEY idx_login_codes_lookup (email, purpose, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  token_hash CHAR(64) NOT NULL,
  principal ENUM('staff','admin') NOT NULL,
  staff_id BIGINT UNSIGNED NULL,
  admin_email VARCHAR(254) NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  last_used_at DATETIME NULL,
  UNIQUE KEY uq_sessions_token (token_hash),
  KEY idx_sessions_staff (staff_id),
  CONSTRAINT fk_sessions_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS approval_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  token_hash CHAR(64) NOT NULL,
  parish_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  UNIQUE KEY uq_approval_token (token_hash),
  CONSTRAINT fk_approval_parish FOREIGN KEY (parish_id) REFERENCES parishes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS intentions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parish_id BIGINT UNSIGNED NOT NULL,
  category ENUM('individual','family','situation','institution') NOT NULL,
  body VARCHAR(200) NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  extension_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  reminder_sent_at DATETIME NULL,
  KEY idx_intentions_parish_expiry (parish_id, expires_at),
  KEY idx_intentions_expiry (expires_at),
  CONSTRAINT fk_intentions_parish FOREIGN KEY (parish_id) REFERENCES parishes(id) ON DELETE CASCADE,
  CONSTRAINT fk_intentions_creator FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket VARCHAR(191) NOT NULL PRIMARY KEY,
  window_start DATETIME NOT NULL,
  hits INT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  at DATETIME NOT NULL,
  actor VARCHAR(40) NOT NULL,
  parish_id BIGINT UNSIGNED NULL,
  action VARCHAR(60) NOT NULL,
  detail VARCHAR(255) NULL,
  KEY idx_audit_at (at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Record this migration so that importing this file by hand (phpMyAdmin) leaves the same
-- bookkeeping as running cli/migrate.php. INSERT IGNORE keeps re-runs harmless.
INSERT IGNORE INTO schema_migrations (version, applied_at) VALUES ('001_init', UTC_TIMESTAMP());
