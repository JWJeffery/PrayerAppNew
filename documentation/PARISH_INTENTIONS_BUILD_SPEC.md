# Parish Intercessions — Architecture & Build Spec for Claude Code

**Project:** The Universal Office (`JWJeffery/PrayerAppNew`, live at https://theuniversaloffice.com)
**Feature:** Rector-managed parish intercessory prayer lists with expiry dates, served to readers who follow a parish.
**Audience for this file:** Claude Code, building this feature in Josh's GitHub Codespace.
**Status:** Design approved by Josh. Build order is in §14. Read this entire file before writing any code.

---

## 0. Operating rules (read first)

1. **Josh is not a coder.** He works in GitHub Codespaces and pushes commits himself. Whenever Josh must run something, give him the **exact copy-paste terminal command**, in order, with what he should see if it worked. Never ask him to hand-edit code. If a config value must be typed, tell him the exact file, and show enough surrounding lines that he can find the spot without ambiguity (a lone bracket or brace is never a sufficient landmark).
2. **Git workflow.** All work happens on the branch `feature/parish-intentions`, which Josh has already created from an up-to-date `main` (this spec file is its first commit, or is staged in it). At the start of every session run `git fetch origin`, `git checkout feature/parish-intentions`, and `git status`. If `origin/main` has moved on, bring the branch up to date with `git merge origin/main` (never with a rebase or force-push, and **never `git reset --hard` while on the feature branch** — it would destroy unpushed milestone commits). Commit in the milestone units in §14. Josh reviews, merges and deploys. **Commit signing:** Josh's Codespace may reject signed commits with the error `error signing commit ... 403 | Author is invalid`. If a commit fails that way, do not retry blindly and do not change global settings on your own; tell Josh, and offer the fix he has been given (correct `git config user.name` / `user.email` to match his GitHub profile, or `git config --local commit.gpgsign false` for this repository only).
3. **No new paid services, no third-party SaaS, no external APIs.** Everything runs on Josh's existing Spaceship shared hosting (PHP + MariaDB + cron) and his existing paid mailbox. If you believe something needs a paid or third-party service, stop and ask; do not add it.
4. **Never trust and never invent.** Do not guess Josh's server paths, SMTP settings, database names or credentials. Ask for them at the milestone that needs them (§16). Every third-party dependency must be pinned to an exact version and verified against its official release page.
5. **Secrets never enter git.** No database password, SMTP password, HMAC pepper, encryption key, or real config file may be committed. Only `config.example.php` with obvious placeholders. Add the ignore rules in §12.
6. **Follow the existing repo's conventions.** The front end is plain JavaScript (no framework, no build step for the site itself), heavily commented with dated rationale. Match that commenting style for anything you add to `js/office-ui.js`. Do not "trust" `structure.json` or old documentation as ground truth. Do not modify `project_roadmap.json`, `structure.json`, or `AUDIT_GOVERNANCE_LEDGER.md` (those govern the corpus audit). Add a short dated entry to `RESUME_PROJECT_NOTE.md` at the end.
7. **Scope guardrail — v1 is rector-posted intentions only.** Community (registered-reader) posting is explicitly *out of scope* for this build; do not scaffold user accounts for readers. Readers have no accounts and nothing about them is stored server-side.
8. **Run the existing audits** (`npm run audit:repo-hygiene`, `npm run audit:user-profile-defaults-skeleton`, `npm run audit:admin-release-support`, and any others touched by your changes). If a new file legitimately trips an existing audit's expectations, adjust that audit minimally and explain why in the commit message.

### Three traps to design around (each has bitten similar projects)

- **`bcpEmitBare` → `bcpMakeSpan` in `js/office-ui.js` assigns text with `innerHTML`.** Prayer text entered by a rector is user-supplied. It must **never** go through `bcpEmitBare`, `bcpMakeSpan` or anything else that uses `innerHTML`. Build DOM nodes with `textContent` (see §11.2).
- **Email link scanners auto-open links.** Any emailed link that performs an action on `GET` will be "clicked" by corporate/mail scanners. The admin approval link must open a page that requires a button press (POST). Login uses an emailed **code**, not a link, for exactly this reason.
- **Config and code must not be web-readable.** Shared hosting serves everything under the web root. Secrets live outside it (§4.3); PHP source under `api/` gets a deny rule *and* a runtime guard.

---

## 1. Goal and non-goals

**Goal.** A rector (or authorized delegate) of a registered parish logs in with an emailed code, adds intercessory requests (individuals, families, situations, institutions) each with an expiry date, extends or removes them, and manages who can help. Readers who follow that parish see the current, unexpired intentions in the Daily Office (BCP "authorized intercessions" space), on the web now and in a future native app.

**Non-goals for v1.** Reader accounts; reader-submitted requests; push notifications; analytics or tracking of any kind; payment; multi-parish staff (one email = one parish in v1); non-Anglican UI (the API is tradition-neutral but the v1 profile UI is gated to Anglican like the existing parish fields); the native app itself.

---

## 2. Decisions already made by Josh (do not relitigate)

| # | Decision |
|---|---|
| D1 | First release: rector-posted intentions only. |
| D2 | Each parish chooses **public** or **join-code-required**. Default for new parishes: **code-required**. |
| D3 | Hallow-style following: a reader can follow a parish without being a member. |
| D4 | Rector login is passwordless by **emailed 6-digit code** (not a link). |
| D5 | Parish registration is **approved by Josh** before it goes live. |
| D6 | Backend runs on existing Spaceship shared hosting: PHP + MariaDB + cron. No new paid services. |
| D7 | Mail is sent through Josh's own paid mailbox **admin@theuniversaloffice.com** over SMTP using PHPMailer. |
| D8 | Default lifetime **21 days (3 weeks)**; extensions are capped at **45 days** per extension; reminder 3 days before expiry; expired items hard-deleted 7 days after expiry. |
| D9 | Item text ≤ 200 characters; ≤ 100 active items per parish. |
| D10 | Sessions last 30 days. |
| D11 | The site must later become a **real native app** (Expo/React Native). The API is therefore standalone, versioned (`/api/v1`), JSON-only, token-authenticated (no cookies), and documented in `api/openapi.yaml`. |

---

## 3. Environment facts

**Verified (from Spaceship's own pages, 2026):**
- Shared hosting offers PHP 7.x–8.x, Node.js, Python, MariaDB, cPanel Cron Jobs, phpMyAdmin, jailed SSH, and a per-plan MySQL database allowance. PHP versions on shared servers are selectable in cPanel (PHP Tweaks / Hosting Manager → Manage → Advanced → Development tools → PHP).
- Free SSL is included; the site is HTTPS.
- **AutoBackup is a paid add-on** (from about $5.88/mo; off-server; 6 daily / 4 weekly / 1 monthly). Spaceship's terms say the customer remains responsible for their own backups. We therefore ship our own free backup job (§10).
- **PHPMailer** is actively maintained; latest release seen at design time was **7.1.1** (May 2026); it supports SMTP auth over SMTPS and STARTTLS and PHP 5.5 through 8.5. Old versions had critical CVEs (CVE-2016-10033/10045, CVE-2018-19296): **never copy an old PHPMailer from anywhere; use the current official release and re-verify the version on the official GitHub releases page when you build.**
- Apple (Guideline 5.1.1(v), since 2022) and Google Play (since 2024) require in-app account deletion when an app supports account creation. Rector accounts count. Hence the deletion endpoints in §8.

**Unverified — check, don't assume:**
- Which PHP version Josh's plan is currently set to (require ≥ 8.1; target 8.2+).
- Whether Composer exists on the host (assume **no**; vendor PHPMailer's source files into the repo instead).
- Whether `mysqldump` works inside the jailed SSH shell.
- The server's cron time zone.
- The SMTP host, port, encryption and password for admin@theuniversaloffice.com (Josh will supply them).
- SPF / DKIM / DMARC status for theuniversaloffice.com (see §9.3).

---

## 4. Architecture

### 4.1 Overview

```
 Browser (theuniversaloffice.com)               Future native app (Expo)
   ├─ Office UI  (js/office-ui.js) ── reads ───┐        │
   ├─ /parish/   rector dashboard ── read/write┼────────┤   HTTPS + JSON
   └─ /parish/admin.html  (Josh) ──────────────┘        │
                                                         ▼
                                         /api/v1/…   (PHP front controller, api/index.php)
                                                         │  PDO (prepared statements)
                                                         ▼
                                                  MariaDB (cPanel database)
                                                         ▲
                        cron (cPanel) → api/cron/daily.php   (reminders, purge)
                        cron (cPanel) → api/cron/backup.sh   (mysqldump, rotate)
                                                         │
                                       PHPMailer → SMTP → admin@theuniversaloffice.com mailbox
```

The existing site stays a static site. The only new server-side pieces are `api/`, and two static front-end pieces (`parish/`, `js/parish-intentions.js`).

### 4.2 Principles

1. **Small surface.** ~25 endpoints, one front controller, no framework, no ORM.
2. **The server decides who you are and which parish you belong to.** No parish id from the client is ever trusted for staff operations; staff operations derive the parish from the session.
3. **Expiry is enforced on the server** at query time (`expires_at > UTC_TIMESTAMP()`), and *also* filtered on the client for offline caches.
4. **Store the minimum.** Readers: nothing stored. Staff: email, optional display name, role. No IP addresses stored in the clear (hash with the pepper for rate-limiting only, purge after 2 days). Never log request bodies, codes, tokens, emails or intention text.
5. **Use platform crypto, never invent crypto.** `random_bytes`, `random_int`, `hash_hmac`, `hash_equals`, `password_hash`/`password_verify` where appropriate, libsodium `sodium_crypto_secretbox` for the one reversible secret.
6. **Fail closed.** Missing/placeholder config → HTTP 500 with a generic body, and log the reason server-side.

### 4.3 Server file layout (production)

```
/home/<cpanel-user>/
  uo-private/                     ← OUTSIDE the web root; never uploaded by the site release
    config.php                    ← real secrets (created by Josh from config.example.php)
    backup.cnf                    ← mysqldump credentials, chmod 600
    backups/                      ← nightly dumps, chmod 700 dir
    logs/                         ← api-error.log (no PII)
  public_html/  (or the domain's own docroot — confirm with Josh)
    index.html, js/, css/, data/, …           ← existing site
    api/                          ← NEW (deployed by the site release)
      .htaccess
      index.php                   ← front controller (only PHP file directly reachable)
      src/…  lib/…  migrations/…  cron/…  cli/…
    parish/                       ← NEW static rector + admin UI
```

`config.php` is located by, in order: the `UO_CONFIG_PATH` environment variable (used in dev/tests), then `dirname($_SERVER['DOCUMENT_ROOT']) . '/uo-private/config.php'`. If neither resolves, fail closed.

### 4.4 Repo layout to create

```
api/
  .htaccess                 route all → index.php; deny src/ lib/ migrations/ cron/ cli/ tests/ dev/
  index.php                 front controller (defines UO_API, loads src/bootstrap.php)
  config.example.php        placeholders only; documents every key
  openapi.yaml              hand-maintained API contract (for the future native app)
  src/
    bootstrap.php           config load, error handler, headers, DB, router
    Router.php  Request.php  Response.php  Db.php  Config.php
    Auth.php                codes, sessions, principal resolution
    RateLimit.php  Crypto.php  Mailer.php  Validate.php  Audit.php
    Handlers/
      Public.php            parishes list, intentions read, join
      AuthHandlers.php      request-code, verify-code, logout, me
      Register.php          register, register/verify
      Staff.php             intentions CRUD, delegates, parish settings, deletion
      Admin.php             admin session endpoints, approval
  lib/PHPMailer/            vendored, pinned; VERSION + SHA-256 recorded in lib/PHPMailer/README-UO.md
  migrations/001_init.sql   idempotent DDL (CREATE TABLE IF NOT EXISTS)
  cron/daily.php  cron/backup.sh
  cli/preflight.php  cli/gen-secrets.php  cli/send-test-mail.php  cli/migrate.php
  dev/router.php  dev/serve.sh
  tests/run.php  tests/…    plain-PHP tests (no Composer needed)
parish/
  index.html  parish.js  parish.css        rector dashboard
  admin.html  admin.js                      Josh's admin page
  approve.html  approve.js                  approval confirmation page
  privacy.html                              plain-language data notice
js/parish-intentions.js                     reader-side client (loaded before office-ui.js)
scripts/audit-parish-intentions.mjs         static audit; npm script audit:parish-intentions
documentation/PARISH_INTENTIONS.md          operator documentation
```

Every PHP file under `api/src`, `api/lib` (project-owned files), `api/cron`, `api/cli` begins with a guard: `src/`, `lib/` project files exit immediately unless `defined('UO_API')`; `cron/` and `cli/` exit unless `PHP_SAPI === 'cli'`.

---

## 5. Data model (`api/migrations/001_init.sql`)

MariaDB 10.x, InnoDB, `utf8mb4` / `utf8mb4_unicode_ci`, all timestamps stored **UTC** as `DATETIME` and written with `UTC_TIMESTAMP()`. Migrations are idempotent so Josh can paste them into phpMyAdmin if the CLI is unavailable. Track applied migrations in `schema_migrations`.

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(40) NOT NULL PRIMARY KEY,
  applied_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parishes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(80) NOT NULL,
  name VARCHAR(160) NOT NULL,
  tradition VARCHAR(40) NOT NULL DEFAULT 'anglican',
  diocese_key VARCHAR(120) NULL,              -- e.g. 'episcopal/western-oregon' (matches js/cycles-of-prayer.js key)
  corpus_parish_slug VARCHAR(80) NULL,        -- e.g. 'st-bede' (matches cycleOfPrayerParishSlug), optional
  visibility ENUM('public','code') NOT NULL DEFAULT 'code',
  join_code_enc VARBINARY(255) NULL,          -- libsodium secretbox (nonce||ciphertext); NULL when visibility='public'
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
  email VARCHAR(254) NOT NULL,                -- stored lowercased, trimmed
  display_name VARCHAR(120) NULL,
  role ENUM('rector','delegate') NOT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uq_staff_email (email),          -- v1: one email = one parish
  KEY idx_staff_parish (parish_id),
  CONSTRAINT fk_staff_parish FOREIGN KEY (parish_id) REFERENCES parishes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_codes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  purpose ENUM('login','register','admin') NOT NULL,
  email VARCHAR(254) NOT NULL,
  code_hash CHAR(64) NOT NULL,                -- HMAC-SHA256(pepper, purpose|email|code), hex
  payload TEXT NULL,                          -- register: JSON of the pending registration
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  KEY idx_login_codes_lookup (email, purpose, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  token_hash CHAR(64) NOT NULL,               -- SHA-256(token), hex; the raw token is never stored
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
  actor VARCHAR(40) NOT NULL,                 -- 'staff:12', 'admin', 'system'
  parish_id BIGINT UNSIGNED NULL,
  action VARCHAR(60) NOT NULL,                -- e.g. 'intention.add', 'parish.approve'
  detail VARCHAR(255) NULL,                   -- NEVER intention text, emails, codes or tokens
  KEY idx_audit_at (at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Notes:
- **Rate-limit upsert must be atomic.** Use a single statement; in MariaDB the `SET` clauses evaluate left to right, so update `hits` before `window_start`:
  `INSERT INTO rate_limits (bucket, window_start, hits) VALUES (:b, :now, 1) ON DUPLICATE KEY UPDATE hits = IF(window_start < :cutoff, 1, hits + 1), window_start = IF(window_start < :cutoff, :now, window_start)` then `SELECT hits`. Add a test that proves the reset-after-window behaviour.
- `diocese_key` uses the same `bodySlug/dioceseShort` format that `js/cycles-of-prayer.js` already uses, so a reader's existing profile diocese lines up with registered parishes. Validate with `^[a-z0-9-]{1,40}/[a-z0-9-]{1,80}$`.
- Deleting a parish cascades to staff, sessions, approval tokens and intentions.

---

## 6. Security requirements

### 6.1 Authentication (staff and admin)

- **Code generation:** 6 digits from `random_int(0, 999999)`, zero-padded. Store only `hash_hmac('sha256', purpose.'|'.email.'|'.code, pepper)`. Compare with `hash_equals`.
- **Lifetime and guesses:** expires 10 minutes after issue; max **5** wrong guesses per code, then the code is dead. A new request invalidates any earlier unconsumed code for that email+purpose. A code works once (set `consumed_at`).
- **Enumeration resistance:** `POST /auth/request-code` returns the *same* 200 body and takes roughly the same time whether or not the email is authorized. Send mail only when the email belongs to staff of an **approved** parish (or is in `admin_emails` for the admin flow). Do the send after responding where feasible, or add a small randomized delay, so timing does not leak.
- **Sessions:** on successful verify, issue `bin2hex(random_bytes(32))` as a bearer token; store only its SHA-256. Absolute 30-day expiry (no sliding). Accept the token only in `Authorization: Bearer …` — **never cookies** (native-app friendly, no CSRF surface). `POST /auth/logout` deletes the session. Invalidate all of a person's sessions when their staff row is deleted (FK cascade) or their parish is suspended (check parish status on every authenticated request).
- **Admin principal:** an email listed in `config['admin_emails']` may complete the `admin` code flow and receive an `admin` session (`staff_id` NULL). Admin endpoints require `principal = 'admin'`; staff sessions must get 403 there.
- **Email normalization:** trim, lowercase, validate with `filter_var(FILTER_VALIDATE_EMAIL)`, max 254 chars, **reject any CR/LF** anywhere in user-supplied header-bound strings (header injection).

### 6.2 Reader access (join codes)

- Join codes are 8 characters from an unambiguous alphabet (`ABCDEFGHJKMNPQRSTUVWXYZ23456789`), displayed as `ABCD-EFGH`. Normalize input (uppercase, strip spaces/hyphens).
- Stored **encrypted** with `sodium_crypto_secretbox` (key from config), never plaintext and never merely hashed, so the rector can re-display the code later but a leaked database dump does not reveal it. Verify with decrypt + `hash_equals`.
- `POST …/join` on success returns a **stateless pass**: `base64url(parishId.version.issuedAt) . '.' . base64url(HMAC-SHA256(pepper, thatString))`. The server accepts it via header `X-Parish-Pass`, checks the HMAC, that `version` equals the parish's current `join_code_version`, and `issuedAt` is within 365 days. **Rotating the code increments `join_code_version`**, instantly invalidating every pass.
- Public parishes need no pass. A parish that is `pending` or `suspended` serves nothing and is absent from listings.

### 6.3 Rate limits (per bucket, fixed window; all HMAC-hashed keys, never raw IPs/emails)

| Action | Limit |
|---|---|
| `auth/request-code` per email | 5 / hour |
| `auth/request-code` per IP | 20 / hour |
| `auth/verify-code` per email | 10 / hour (in addition to the 5-guess per-code cap) |
| `register` per IP | 5 / hour; per email 3 / hour |
| `join` per IP+parish | 10 / hour |
| reader `intentions` GET per IP | 300 / hour (generous; exists to stop scraping) |
| staff writes per session | 60 / hour |

On exceed: HTTP 429, generic body, `Retry-After`. Use `REMOTE_ADDR` only; do not trust `X-Forwarded-For` unless `config['trust_proxy']` is true.

### 6.4 Input handling

- JSON bodies only for POST/PATCH (`Content-Type: application/json`), body ≤ 8 KB, strict method allow-list per route, unknown fields ignored, unknown routes → 404 JSON.
- **All SQL through PDO prepared statements** (`ATTR_EMULATE_PREPARES=false`, `ERRMODE_EXCEPTION`). No string-built SQL anywhere.
- Intention text: trim; collapse internal runs of whitespace to single spaces; reject control characters and anything outside 1–200 characters (`mb_strlen`); category must be in the enum. **Do not rely on stripping angle brackets for safety** — safety comes from output handling (`textContent`), not input scrubbing. (Do not silently alter names.)
- `days` for create/extend: integer 1–45. Create default 21. Extend sets `expires_at = GREATEST(expires_at, UTC_TIMESTAMP()) + INTERVAL :days DAY`, increments `extension_count`, resets `reminder_sent_at` to NULL.
- Active-item cap 100 per parish → 409 `limit_reached`.
- Slugs: server-generated from the parish name (lowercase, a–z 0–9 hyphen, max 80), unique with numeric suffix on collision. If the client supplies `corpus_parish_slug`, validate `^[a-z0-9-]{1,80}$`.

### 6.5 Response hygiene

- Always `Content-Type: application/json; charset=utf-8`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`. `Cache-Control: no-store` on everything except the reader intentions GET (`private, max-age=60`).
- **No CORS headers by default** (same-origin site; native apps are not subject to CORS). Config key `allowed_origins` (default empty) exists only so local dev on another port can work.
- Generic error bodies: `{"error":"<code>","message":"<human text>"}`. Never leak stack traces, SQL, file paths or which of "email/code" was wrong. Server errors log to `uo-private/logs/api-error.log` with a timestamp and error class only — **no request bodies, codes, tokens, emails or intention text**.
- Enforce HTTPS in `api/.htaccess` (redirect http→https).
- Strict CSP for the `/parish/` pages via `.htaccess` header: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`. No inline scripts or `on*=` handlers in `/parish/` pages.

### 6.6 Privacy and pastoral safeguards

- The entry form displays a persistent reminder (exact wording, shown above the text field on both the add and edit forms, and repeated in `parish/privacy.html`): "Add names only with the person's or family's permission — first names or initials are fine. Please don't share overly sensitive information, such as detailed medical, legal, financial or family details. When in doubt, keep it general."
- **Reminder emails never contain intention text** — counts and dates only.
- Expired items are hard-deleted 7 days after expiry; removal by staff is a hard delete. No soft-delete, no history of prayer text. `audit_log` holds actions and ids only and is purged after 180 days.
- Ship `parish/privacy.html` (plain language: what is stored — staff email/name/role, intention text, hashed IP for rate limiting; retention; deletion; contact admin@theuniversaloffice.com). Josh reviews it; note in the file that it is not legal advice.

---

## 7. Common conventions

- Base path `/api/v1`. All timestamps ISO-8601 UTC with `Z` (`2026-10-30T16:00:00Z`).
- Success: HTTP 200/201 + JSON. Errors: 400 `bad_request`, 401 `unauthorized`, 403 `forbidden`, 404 `not_found`, 409 `conflict`/`limit_reached`, 422 `invalid_input`, 429 `rate_limited`, 500 `server_error`. Include a `fields` object on 422 mapping field → message.
- Staff/admin endpoints require `Authorization: Bearer <token>`.
- Keep `api/openapi.yaml` in sync with the code; it is the contract the native app will be written against.

---

## 8. API specification

### 8.1 Public / reader

| Method & path | Auth | Purpose |
|---|---|---|
| `GET /parishes?diocese=<key>` | none | Approved parishes → `{parishes:[{slug,name,diocese_key,visibility}]}`. Without `diocese`, returns all approved (max 200, alphabetical). Pending/suspended never listed. |
| `GET /parishes/{slug}/intentions` | `X-Parish-Pass` if `visibility=code` | → `{parish:{slug,name}, intentions:[{id,category,text,expires_at}], generated_at}`. Only rows with `expires_at > UTC_TIMESTAMP()`. Order: category (individual, family, situation, institution) then `created_at`. If code required and pass missing/invalid → 401 `{"error":"code_required"}`. |
| `POST /parishes/{slug}/join` | none | `{code}` → `{pass, parish:{slug,name}}`. Rate-limited. Wrong code → 403 generic. |

### 8.2 Registration (a parish asking to join)

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /register` | none | `{parish_name, diocese_key?, corpus_parish_slug?, contact_name, email, visibility?}`. Validates, stores a `login_codes` row (`purpose=register`, payload JSON), emails a 6-digit verification code to `email`. Always returns the same 200 (no account enumeration). If the email already belongs to staff, send nothing. |
| `POST /register/verify` | none | `{email, code}`. On success: create parish (`status=pending`, `visibility` default `code`, generate join code), create the rector `staff` row, create an `approval_tokens` row (32 random bytes, 7-day expiry, SHA-256 stored), and email the **admin** the approval notification (§9). Returns 200 `{status:"pending_approval"}`. |

### 8.3 Staff authentication

| Method & path | Purpose |
|---|---|
| `POST /auth/request-code` `{email}` | Generic 200. Staff login only (`purpose=login`). Admin codes use the separate `POST /admin/auth/request-code` (see 8.5) so the two flows never mix. |
| `POST /auth/verify-code` `{email, code}` | → `{token, expires_at, staff:{id,role,display_name}, parish:{slug,name,visibility,status}}` or generic 401. |
| `POST /auth/logout` | Deletes the current session. |
| `GET /me` | Current principal (staff+parish, or admin). |

### 8.4 Staff (rector or delegate) — parish derived from session

| Method & path | Role | Purpose |
|---|---|---|
| `GET /staff/intentions` | any | All of the parish's intentions including those that expired in the last 7 days (flagged `expired:true`), with `expires_at`, `extension_count`, `created_at`. |
| `POST /staff/intentions` | any | `{category, text, days?}` → 201 with the item. Enforces caps. |
| `PATCH /staff/intentions/{id}` | any | Edit `text` and/or `category`. Must belong to the session's parish or 404. |
| `POST /staff/intentions/{id}/extend` | any | `{days}` per §6.4. |
| `DELETE /staff/intentions/{id}` | any | Hard delete. |
| `GET /staff/delegates` | rector | List staff of the parish. |
| `POST /staff/delegates` | rector | `{email, display_name?}` → creates a `delegate` staff row (email must not already exist anywhere → 409 generic). Max 5 delegates. |
| `DELETE /staff/delegates/{id}` | rector | Removes a delegate (not self, not another rector). |
| `PATCH /staff/parish` | rector | `{visibility}`. Switching to `code` generates a code if none exists; switching to `public` clears `join_code_enc`. |
| `GET /staff/parish/join-code` | rector | Returns the decrypted code for display (only when `visibility=code`). |
| `POST /staff/parish/join-code/rotate` | rector | New code, `join_code_version + 1`, returns new code. |
| `DELETE /staff/me` | any | Deletes the caller's staff row and sessions. A rector may do this only if another rector exists; otherwise 409 with instructions to delete the parish. |
| `DELETE /staff/parish` | rector | Body `{confirm:"DELETE <slug>"}`. Deletes the parish and all its data (cascade). |

All staff endpoints re-check on every call that the session is unexpired and the parish is `approved`.

### 8.5 Admin (Josh)

| Method & path | Purpose |
|---|---|
| `POST /admin/auth/request-code` `{email}` / `POST /admin/auth/verify-code` `{email, code}` | Same rules as §6.1, for emails in `admin_emails` only; generic 200 for everything else. Issues an `admin` session. |
| `GET /admin/parishes` | All parishes with status, counts of staff and active intentions, created/approved dates. No intention text. |
| `POST /admin/approve` | `{token}` (from the approval email) → sets parish `approved`, stamps `approved_at`, marks token used, emails the rector "You're approved". Token single-use, expiry enforced. Requires an admin session **or** the valid unused token itself (the token *is* the authorization; still POST-only). |
| `POST /admin/parishes/{id}/suspend` · `…/unsuspend` | Toggle `suspended`. |
| `DELETE /admin/parishes/{id}` | Cascade delete. |

**Approval page flow:** the email contains `https://theuniversaloffice.com/parish/approve.html#<token>`. The token is in the URL **fragment** (never sent to the server, not in logs or referrers). `approve.html` shows the parish name (fetched via a token-authenticated read endpoint `POST /admin/approval-info {token}` that returns only parish name/diocese), and an **Approve** button that POSTs `/admin/approve`. A scanner opening the link changes nothing.

---

## 9. Email

### 9.1 Sending

- Use the vendored PHPMailer 7.x over SMTP with the credentials in `config['mail']` (host, port, `encryption` = `tls`/`ssl`, username, password). From: `admin@theuniversaloffice.com`, name "The Universal Office". Plain-text bodies (a minimal HTML alternative is optional). `CharSet = UTF-8`. Never build headers from user input without the CR/LF rejection in §6.1.
- `mail.driver` may be `smtp` or `log`. In dev and tests use `log` (append the rendered message to a local file; never send).
- Wrap sending in try/catch; on failure log the exception class only (no addresses) and return the normal generic response so a failure never reveals whether an address exists.

### 9.2 Messages (exact intents; keep them short and plain)

1. **Login/registration/admin code.** Subject: `Your Universal Office code`. Body: the 6-digit code, "It expires in 10 minutes. If you didn't ask for this, you can ignore this message." No links, no parish names.
2. **Admin approval request.** Subject: `Parish awaiting approval: <parish name>`. Body: parish name, diocese key, contact name, contact email, and the approval URL (fragment form above). Expires in 7 days.
3. **Approved notice to rector.** Subject: `Your parish is approved`. Body: how to log in at `https://theuniversaloffice.com/parish/`.
4. **Expiry reminder digest** (daily job). One email per parish per day to each `rector`: "N prayer intentions will expire on <date(s)>. Log in to extend or remove them." **No intention text.**

### 9.3 Deliverability checklist (deploy step for Josh)

The API cannot check DNS. Add to the runbook: confirm SPF, DKIM and DMARC records exist for `theuniversaloffice.com` in the mailbox provider's documentation; send the `cli/send-test-mail.php` test to a Gmail address and confirm in "Show original" that SPF, DKIM and DMARC show PASS. If DMARC is absent, start with a `p=none` policy and monitor.

---

## 10. Scheduled jobs (cPanel Cron Jobs)

### 10.1 `api/cron/daily.php` (CLI only)

Runs once a day. Suggested schedule: 16:00 UTC (about 8–9 am Pacific); **first verify the server's cron time zone** with `date` and adjust.

1. **Reminders.** Find intentions with `expires_at` between now and now + 3 days, `reminder_sent_at IS NULL`, on approved parishes. Send one digest per parish (§9.2 #4) to each rector; then set `reminder_sent_at`. If mail fails, leave `reminder_sent_at` NULL so tomorrow retries.
2. **Purge.** Delete intentions with `expires_at < UTC_TIMESTAMP() - INTERVAL 7 DAY`; `login_codes` expired > 1 day; `sessions` expired; `rate_limits` older than 2 days; `audit_log` older than 180 days; `approval_tokens` expired > 30 days.
3. Log a one-line summary of counts (no PII) to `uo-private/logs/api-error.log`-style file `cron.log`.

### 10.2 `api/cron/backup.sh`

- `mysqldump --defaults-extra-file="$HOME/uo-private/backup.cnf" --single-transaction --no-tablespaces <dbname> | gzip > "$HOME/uo-private/backups/uo-YYYYMMDD.sql.gz"`, `chmod 600`, keep the newest 14, delete the rest. Credentials live in `backup.cnf` (chmod 600), never on the command line. Fail loudly (non-zero exit) if the dump is empty.
- Suggested schedule: 10:30 UTC daily.
- **Backups contain prayer text in plain form — treat them as sensitive.** In the runbook tell Josh to download one monthly copy via cPanel → Backup (or File Manager) and store it securely. Because the dump sits on the same server, it does not protect against losing the hosting account; say so plainly in the docs. (Spaceship's paid AutoBackup is the optional upgrade; do not assume it.)
- The join code is encrypted in the database, so dumps do not reveal it.

---

## 11. Front end

The site is plain JS with no build step. Match that. Read the following existing code first and mirror its patterns rather than inventing new ones: `js/cycles-of-prayer.js` (loader + cache + "prefetch then repaint" pattern), the profile code in `js/office-ui.js` (the defaults object ending with `cycleOfPrayerParishOther: null` near line 759; the normalization block near lines 1190–1220; `refreshCycleOfPrayerForCurrentYear` near line 1563), `renderCycleOfPrayerLine` and its three tier functions near line 5611, the BCP hook that calls it (search for `bcp-hymn-anthem-intercessions-rubric`, near line 6676), startup warming in `initializeEntryRouting` (near line 2525), and the profile panel markup in `index.html` (`#user-profile-defaults`, the `profile-cycle-of-prayer-parish` field near line 1083). Line numbers drift; search by name.

### 11.1 Reader client: `js/parish-intentions.js`

Load it the same way `js/cycles-of-prayer.js` is loaded (deferred, before `js/office-ui.js`; check `index.html` script tags). It must be a plain script (no modules), define global functions in the existing style, and contain **no DOM writes of user text**. Provide:

- `listApprovedParishes(dioceseKey|null)` → `GET /api/v1/parishes[?diocese=…]`.
- `joinParish(slug, code)` → `POST …/join`, returns the pass.
- `refreshParishIntentions(slug, pass)` → `GET …/intentions` with `X-Parish-Pass` when a pass exists; on success write the response to memory **and** to `localStorage` key `universalOfficeParishIntentionsCache` as `{slug, fetchedAt, parish, intentions}`; on 401 `code_required`, clear the stored pass and signal the UI to re-prompt.
- `getCachedParishIntentions(slug)` → **synchronous**, cache-only read (same contract as `getCachedCycleOfPrayerWeek`), returning only items whose `expires_at` is still in the future by the device clock. This guarantees offline copies never show expired items.
- Network calls use an `AbortController` timeout (mirror `fetchDailyOfficeResource`), and every failure degrades silently to "no intentions" (never blocks or throws into the office render).

### 11.2 Rendering in the Daily Office

Add `renderParishIntentionsLine(container, env, date)` in `js/office-ui.js`, and call it at the end of `renderCycleOfPrayerLine` (after `renderParishCycleOfPrayerLine`). Behavior:

- Gate on the profile field `parishIntentionsSlug` (§11.3). No slug → render nothing.
- Read from `getCachedParishIntentions`; empty → render nothing (same "no data yet" convention as the other tiers). Use **the real current time** for expiry, not the office's `date` (intentions are "now" lists, unlike the dated cycles).
- Heading via `bcpEmitRubricHeading(container, env, 'Parish Intercessions')` — that helper uses `textContent` and adds the sidebar rail entry like the other tiers.
- **Item text must not pass through `bcpEmitBare`/`bcpMakeSpan`** (they set `innerHTML`). Add a small new helper, e.g. `bcpEmitPlainText(container, text, opts)`, that builds the node with `document.createElement` + **`textContent`** and places it with the existing `bcpWrapInGutter`. Group by category with a plain-text label ("Individuals", "Families", "Situations", "Institutions"); one intention per line.
- Repaint when data arrives using the same mechanism `refreshCycleOfPrayerForCurrentYear` uses. Read that function and copy its approach.
- Warm the cache on startup: in `initializeEntryRouting`, after the Cycle-of-Prayer warming, if the profile has `parishIntentionsSlug`, call `refreshParishIntentions` (fire-and-forget) and repaint.

### 11.3 Profile changes

Add to the profile defaults object and to the normalization block (mirror how `cycleOfPrayerParishOther` is handled, including its comment style):

- `parishIntentionsSlug: null` — must match `^[a-z0-9-]{1,80}$` or be nulled.
- `parishIntentionsPass: null` — string ≤ 400 characters or null; forced to null whenever the slug is null.

Add setters in the existing style (e.g. `setUserProfileParishIntentions(slug)`, `clearUserProfileParishIntentions()`), and make sure "reset/clear profile" flows clear both fields. Update `scripts/audit-user-profile-defaults-skeleton.mjs` so it expects the new fields.

Profile panel UI (new field group inside `#user-profile-defaults`, next to the existing Cycle of Prayer parish fields; keep the same `data-tradition-field="anglican"` gating and `hidden`/`aria-hidden` handling as the sibling fields):

- Heading "Parish prayer intentions".
- A `<select>` populated from `listApprovedParishes(profile.cycleOfPrayerDiocese)`; if that diocese has none, fall back to all approved parishes, and if there are none at all show: "No parishes are using prayer intentions yet."
- If the profile's `cycleOfPrayerParish` matches a listed parish's `corpus_parish_slug`, **suggest** it (pre-highlight) but never follow silently.
- Selecting a `visibility=code` parish reveals a code input and "Join" button; a wrong code shows a plain message; success stores the pass in the profile.
- A "Stop following" button.
- Reuse existing CSS classes (`app-profile-default-field` etc.). Match dark-mode behavior.

### 11.4 Rector dashboard: `parish/index.html` (+ `parish.js`, `parish.css`)

Plain HTML/JS/CSS, no framework, no inline script or handlers, **all dynamic text via `textContent`**, CSP per §6.5. Screens:

1. **Sign in:** email field → "Send code" → 6-digit code field → session token stored in `localStorage` key `uoParishSession` (document why: same-origin, CSP-locked page, explicit Log out; the native app will use secure storage instead). Generic messages only.
2. **Intentions list:** sorted by `expires_at` ascending; badge "Expires in N days" (highlight ≤ 3), "Expired" section for the last 7 days; buttons: Extend (7 / 21 / 45 days), Edit, Remove (confirm dialog). Add form: category, text with a live 200-character counter, days (default 21, maximum 45). Persistent privacy reminder (§6.6).
3. **Parish settings (rector only):** visibility toggle; join code display (with "Copy") and "Rotate code" (explain that rotating logs everyone out of the code-protected view until they re-enter it); delegate list with add/remove; "Delete my membership"; "Delete parish and all data" (typed confirmation).
4. **Log out** always visible.
5. **Register a parish** page (linked from sign-in): name, diocese (dropdown built from the same diocese directory the profile uses; expose it via a tiny shared JS data file or reuse `TEC_DIOCESE_DIRECTORY` if it can be loaded safely), contact name, email, visibility → verification code step → "Thanks — awaiting approval".

### 11.5 Admin pages

- `parish/admin.html`: admin email-code sign-in; table of parishes (status, staff count, active-intention count, created); actions Approve / Suspend / Unsuspend / Delete (typed confirmation). No intention text is ever shown here.
- `parish/approve.html`: reads `location.hash`, shows the parish name/diocese from `POST /admin/approval-info`, an **Approve** button that POSTs, and a clear success/failure message. Clear the hash from the address bar after reading it.

---

## 12. Repository, release and config changes

1. **`.gitignore`:** add `api/config.php`, `uo-private/`, `*.cnf`, `api/tests/.tmp/`, `*.sql.gz`.
2. **`scripts/prepare-web-release.mjs`:** add `api` and `parish` to `includeEntries`. Make sure dotfiles (`api/.htaccess`) are copied. Exclude `api/tests`, `api/dev`, and any `config.php`/`*.cnf`/`*.sql.gz` (use the existing deny-list mechanism). Update `scripts/audit-admin-release-support.mjs` and any other audit whose expectations change. The release must never contain secrets; add an assertion for that.
3. **`api/config.example.php`** (placeholders only):

```php
<?php
// Copy to <home>/uo-private/config.php and fill in. NEVER commit the real file.
return [
  'db' => ['host' => 'localhost', 'name' => 'CHANGE_ME', 'user' => 'CHANGE_ME', 'pass' => 'CHANGE_ME'],
  'mail' => [
    'driver' => 'smtp',                       // 'smtp' or 'log'
    'host' => 'CHANGE_ME', 'port' => 587, 'encryption' => 'tls', // 'tls' (STARTTLS) or 'ssl' (SMTPS)
    'username' => 'admin@theuniversaloffice.com', 'password' => 'CHANGE_ME',
    'from_email' => 'admin@theuniversaloffice.com', 'from_name' => 'The Universal Office',
  ],
  'secrets' => [
    'pepper' => 'CHANGE_ME_64_HEX',           // HMAC key for codes, IP hashes, reader passes
    'box_key' => 'CHANGE_ME_BASE64_32_BYTES', // libsodium secretbox key for join codes
  ],
  'admin_emails' => ['admin@theuniversaloffice.com'],  // may be changed to Josh's personal address
  'site_url' => 'https://theuniversaloffice.com',
  'allowed_origins' => [],                    // dev only, e.g. ['http://localhost:8080']
  'trust_proxy' => false,
  'log_dir' => null,                          // default: <config dir>/logs
];
```
   Preflight must **refuse** to pass while any value is still `CHANGE_ME…`.
4. **`api/cli/gen-secrets.php`:** prints a fresh 64-hex pepper and a base64 32-byte box key for Josh to paste. It must not write files.
5. **Local development (Codespaces):** `api/dev/serve.sh` runs `php -S 0.0.0.0:8080 api/dev/router.php` with a router that serves static files from the repo root and routes `/api/…` to `api/index.php`, with `UO_CONFIG_PATH` pointing at a dev config under `.external/uo-private/` (already git-ignored) using `mail.driver = log` and a local MariaDB. Document the one-time install (`php-cli`, `php-mysql`, `php-mbstring`, MariaDB server; confirm `php -m` shows `sodium`, `pdo_mysql`, `mbstring`, `openssl`).
6. **Vendoring PHPMailer:** download the current official release from `https://github.com/PHPMailer/PHPMailer/releases`, copy only `src/PHPMailer.php`, `src/SMTP.php`, `src/Exception.php` into `api/lib/PHPMailer/`, and record the exact version, source URL and SHA-256 of each file in `api/lib/PHPMailer/README-UO.md`. Load with explicit `require_once` (no Composer).

---

## 13. Testing and acceptance criteria

Write tests as plain PHP (`api/tests/run.php`, tiny assert helpers, a throwaway test database created and dropped by the runner) plus HTTP-level tests against the built-in dev server. Add `scripts/audit-parish-intentions.mjs` (+ npm script `audit:parish-intentions`) for static checks. **The feature is not done until every item below passes.**

**Isolation and authorization**
1. Staff of parish A cannot list, read, edit, extend or delete parish B's intentions by guessing or altering ids (expect 404).
2. A staff session cannot call any `/admin/*` endpoint (expect 403). A delegate cannot call rector-only endpoints (403).
3. `pending` and `suspended` parishes: not listed, intentions not served, staff cannot log in or use an existing session.
4. Reader pass for parish A is rejected for parish B; rotating the join code invalidates all previously issued passes; a pass older than 365 days is rejected.

**Auth**
5. `request-code` returns byte-identical bodies for authorized and unauthorized emails; no mail is sent to unauthorized addresses.
6. A code expires at 10 minutes, dies after 5 wrong guesses, works once, and a new code kills the previous one.
7. Rate limits from §6.3 trigger 429 (test at least request-code per email, join per IP+parish, register per IP), and the fixed-window reset works.
8. Logout invalidates the token; expired sessions are rejected; session tokens are never stored in raw form (inspect the table).

**Data handling**
9. Expired items are never returned by the reader endpoint, even when the row still exists.
10. Item caps: 201-character text → 422; 101st active item → 409; `days` 0 or 46 → 422; a create with no `days` gets a 21-day expiry; extend resets `reminder_sent_at` and increments `extension_count`.
11. **XSS:** store `<img src=x onerror=alert(1)>` and `<script>alert(1)</script>` as intention text; verify it renders inert (literal text) in the Daily Office **and** the dashboard. The audit script must fail the build if `bcpEmitBare`/`bcpMakeSpan`/`innerHTML` is used with intention text anywhere in the new code.
12. **SQL injection** strings (`' OR 1=1 --`, stacked queries) in every string field are stored/handled as plain text or rejected, never executed.
13. **Header injection:** an email containing `\r\n` is rejected; no mail is sent.
14. Direct requests to `api/src/…`, `api/lib/…`, `api/migrations/…`, `api/cron/…`, `api/cli/…`, `api/config*.php` return 403/404 — never PHP source, never a config. Verify with an HTTP test in dev and list the same `curl` checks in the deploy runbook for production.
15. A request to any `/api/v1/…` path over plain HTTP redirects to HTTPS in production (runbook check).

**Approval flow**
16. The approval link opened with GET (simulating a scanner) changes nothing; only the POST approves; a token works once and expires after 7 days.

**Jobs**
17. `daily.php`: reminder digest sent once per parish per day, only for items expiring within 3 days, contains **no intention text**; a failed send leaves items eligible for retry; purge removes items expired > 7 days and stale login codes/sessions/rate-limit rows/audit rows per §10.1.
18. `backup.sh` produces a non-empty, gzip-valid dump, `chmod 600`, keeps only the newest 14, and fails loudly on an empty dump.

**Account deletion (app-store requirement)**
19. `DELETE /staff/me`, `DELETE /staff/parish` and admin delete remove all associated rows (verify by table counts), and sessions die immediately.

**Repo hygiene**
20. `npm run audit:repo-hygiene`, `audit:user-profile-defaults-skeleton`, `audit:admin-release-support`, and the new `audit:parish-intentions` all pass. The release zip contains `api/` and `parish/` but no secrets, tests, or dev files. `git grep` for the SMTP password, pepper and DB password patterns finds nothing.

---

## 14. Build order (one milestone = one or more commits; stop and report after each)

Nothing user-facing changes until **M6**, so the backend can be deployed to production early without affecting current users.

- **M0 — Scaffolding & preflight.** Directory layout, `.gitignore` rules, `config.example.php`, `bootstrap.php`, `Router`, `Response`, `Db`, `Config`, `cli/preflight.php`, `cli/gen-secrets.php`, `dev/serve.sh`, `.htaccess`, test runner skeleton. *Report:* how Josh runs the dev server and preflight. **Ask Josh** for the output of `pwd`, `php -v`, `php -m | grep -E "sodium|pdo_mysql|mbstring|openssl"` and `which php` from the cPanel Terminal (write out the exact steps for opening it), and the docroot folder for theuniversaloffice.com.
- **M1 — Database + reader read path.** Migration 001, `cli/migrate.php`, `GET /parishes`, `GET /parishes/{slug}/intentions`, `POST …/join`, `Crypto.php`, rate limiting, tests 1, 3, 4, 9. Add a dev seed script that inserts one sample parish (`slug=st-bede`, `diocese_key=episcopal/western-oregon`, `corpus_parish_slug=st-bede`).
- **M2 — Email and staff login.** `Mailer.php` (+ vendored PHPMailer), `cli/send-test-mail.php`, code request/verify, sessions, `/me`, logout, tests 5–8, 13. **Ask Josh** for the SMTP host, port and encryption for admin@theuniversaloffice.com and to create the config file (exact steps).
- **M3 — Staff API.** Intentions CRUD/extend, delegates, parish settings, join-code view/rotate, deletion endpoints. Tests 1, 2, 10, 12, 19.
- **M4 — Registration and admin.** Register/verify, approval token, admin login, approve/suspend/delete, `approve.html`. Tests 3, 16. Deploy the backend to production at this point (runbook §12) and run the production `curl` checks.
- **M5 — Rector dashboard and admin pages.** `parish/*` with CSP and privacy page. Test 11 for the dashboard.
- **M6 — Reader integration.** `js/parish-intentions.js`, profile fields and UI, `renderParishIntentionsLine`, startup warm, audit updates. Test 11 for the office. **This is the first user-visible change.**
- **M7 — Jobs.** `cron/daily.php`, `cron/backup.sh`, cPanel cron entries (exact fields for Josh to paste), tests 17–18.
- **M8 — Docs, audits, release.** `documentation/PARISH_INTENTIONS.md` (operator runbook with every deploy step and command, in the order Josh performs them), `api/openapi.yaml`, `scripts/audit-parish-intentions.mjs`, release-script changes, `RESUME_PROJECT_NOTE.md` entry, test 20, and the full acceptance run.

**Pilot:** after M8, register St. Bede's Episcopal Church as the first parish (`diocese_key = episcopal/western-oregon`, `corpus_parish_slug = st-bede`, matching `data/cycles-of-prayer/episcopal-western-oregon-st-bede.json`) with the rector's email, approve it, and follow it from a test profile end to end.

---

## 15. Native-app readiness (design now, build later)

- The API is already standalone, versioned, JSON-only, bearer-token, and CORS-independent. Do not add cookie sessions, server-rendered pages, or web-only conveniences to `/api/v1`.
- Keep `api/openapi.yaml` accurate; the future Expo/React Native app is written against it.
- The account-deletion endpoints (§8.4) exist now to satisfy Apple 5.1.1(v) and Google Play policy when the app ships. `parish/privacy.html` is the seed of the store privacy policy.
- The reader client's "cache-only synchronous read + background refresh + client-side expiry filter" pattern ports directly to the native app.
- **Later phase, not now:** registered readers who post their own requests (parish-moderated: off by default, or rector approves each request). This will additionally require report/block/moderation and published contact details under App Store Guideline 1.2 — do not build any of it in this pass.

---

## 16. Information Claude Code must obtain from Josh (never guess)

1. Docroot folder for theuniversaloffice.com and the cPanel username/home path (M0).
2. `php -v`, `which php`, and the loaded-extension check output from the cPanel Terminal (M0).
3. The cPanel-created database name, database user and password (M2) — Josh types these into `config.php` himself; never ask him to paste passwords into chat, and never commit them.
4. SMTP host, port and encryption for admin@theuniversaloffice.com and the mailbox password, likewise entered only into `config.php` (M2).
5. Where admin codes should go (default: admin@theuniversaloffice.com; Josh may prefer a personal address) (M4).
6. Preferred cron time and the server's time zone (M7).
7. The rector's email address for the St. Bede's pilot (after M8).

---

## 17. Definition of done

All acceptance items in §13 pass; the release zip is clean; Josh has deployed the backend and completed the deliverability check in §9.3; St. Bede's is registered, approved, and shows its live intentions in the Daily Office for a test reader who follows it; expired items disappear on schedule; the nightly backup is running; and the runbook in `documentation/PARISH_INTENTIONS.md` lets Josh redo any deploy step from scratch without asking anyone.
