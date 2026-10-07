-- Optional accounts (2026-10-07): reader accounts that keep a person's settings, an optional password for
-- anyone who signs in (reader, rector, helper, administrator), and passkeys. Emailed codes keep working.
-- Idempotent: safe to run more than once, and safe to paste into phpMyAdmin.
-- Maintainers: cli/migrate.php strips comments and splits on the statement terminator,
-- so keep semicolons and double dashes out of string literals.

CREATE TABLE IF NOT EXISTS readers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  profile_enc VARBINARY(20000) NULL,
  profile_updated_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  last_login_at DATETIME NULL,
  UNIQUE KEY uq_readers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One password per email address, whatever roles that address holds. Only a salted hash is stored.
CREATE TABLE IF NOT EXISTS credentials (
  email VARCHAR(254) NOT NULL PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS passkeys (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  credential_id VARBINARY(512) NOT NULL,
  public_key TEXT NOT NULL,
  sign_count INT UNSIGNED NOT NULL DEFAULT 0,
  label VARCHAR(80) NULL,
  created_at DATETIME NOT NULL,
  last_used_at DATETIME NULL,
  UNIQUE KEY uq_passkeys_credential (credential_id),
  KEY idx_passkeys_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One-time challenges for passkey registration and sign-in. Deleted when used or expired.
CREATE TABLE IF NOT EXISTS webauthn_challenges (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  token_hash CHAR(64) NOT NULL,
  purpose ENUM('register','login') NOT NULL,
  email VARCHAR(254) NULL,
  challenge VARBINARY(64) NOT NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  UNIQUE KEY uq_webauthn_token (token_hash),
  KEY idx_webauthn_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE login_codes MODIFY purpose ENUM('login','register','admin','reader','reauth') NOT NULL;
ALTER TABLE sessions MODIFY principal ENUM('staff','admin','reader') NOT NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS reader_id BIGINT UNSIGNED NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS reauth_at DATETIME NULL;
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_reader FOREIGN KEY IF NOT EXISTS (reader_id) REFERENCES readers(id) ON DELETE CASCADE;

INSERT IGNORE INTO schema_migrations (version, applied_at) VALUES ('004_accounts', UTC_TIMESTAMP());
