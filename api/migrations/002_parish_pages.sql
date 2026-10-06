-- Parish home page, parish events, rector announcements, diocesan page (2026-10-06).
-- Idempotent: safe to run more than once, and safe to paste into phpMyAdmin.
-- Maintainers: cli/migrate.php strips comments and splits on the statement terminator,
-- so keep semicolons and double dashes out of string literals.

ALTER TABLE parishes
  ADD COLUMN IF NOT EXISTS rector_name VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS address VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS website VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS service_times TEXT NULL;

-- Dates and times are the parish's own wall-clock values (a funeral at 11:00 is 11:00 where
-- the parish is). The server never converts them.
CREATE TABLE IF NOT EXISTS parish_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parish_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(120) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NULL,
  note VARCHAR(200) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  KEY idx_events_parish_date (parish_id, event_date),
  KEY idx_events_date (event_date),
  CONSTRAINT fk_events_parish FOREIGN KEY (parish_id) REFERENCES parishes(id) ON DELETE CASCADE,
  CONSTRAINT fk_events_creator FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parish_announcements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parish_id BIGINT UNSIGNED NOT NULL,
  body VARCHAR(300) NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  KEY idx_announcements_parish_expiry (parish_id, expires_at),
  KEY idx_announcements_expiry (expires_at),
  CONSTRAINT fk_announcements_parish FOREIGN KEY (parish_id) REFERENCES parishes(id) ON DELETE CASCADE,
  CONSTRAINT fk_announcements_creator FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Diocesan page. Kept by the site administrator (a diocese has no sign-in of its own yet).
CREATE TABLE IF NOT EXISTS dioceses (
  diocese_key VARCHAR(121) NOT NULL PRIMARY KEY,
  bishop_name VARCHAR(120) NULL,
  website VARCHAR(255) NULL,
  convention_dates TEXT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diocese_prayers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  diocese_key VARCHAR(121) NOT NULL,
  body VARCHAR(200) NOT NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  KEY idx_diocese_prayers_key_expiry (diocese_key, expires_at),
  KEY idx_diocese_prayers_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations (version, applied_at) VALUES ('002_parish_pages', UTC_TIMESTAMP());
