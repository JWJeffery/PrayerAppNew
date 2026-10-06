# Parish Intentions -- Operator Runbook

This is the working manual for the Parish Intentions feature (the backend in `api/`, the pages in
`parish/`). It is written for Josh: every step says exactly what to click or paste, and what you
should see when it worked. The build plan behind it is `PARISH_INTENTIONS_BUILD_SPEC.md`.

**Status:** complete (milestones M0-M8): backend, rector dashboard and admin pages, reader integration
in the Daily Office, scheduled jobs, and this manual. The remaining step is the St. Bede's pilot (Part 5).
Other references: the API contract is `api/openapi.yaml`; the automated checks are
`php api/tests/run.php` (tests) and `npm run audit:parish-intentions` (static audit).

Where things live:

| What | Where |
|---|---|
| Your Codespace | `/workspaces/PrayerAppNew` |
| The live site's folder (cPanel) | `/home/lwmpzdytfh/theuniversaloffice.com` |
| The private folder (cPanel), never web-visible | `/home/lwmpzdytfh/uo-private` |
| Live config file (secrets) | `/home/lwmpzdytfh/uo-private/config.php` |
| Live error log (no personal data in it) | `/home/lwmpzdytfh/uo-private/logs/api-error.log` |

---

## Part 1 -- Setting up a Codespace for development (only if you make a new one)

A brand-new Codespace has PHP without the database driver, and no database. Do these once:

```
sudo apt-get update
sudo apt-get install -y mariadb-server php8.3-cli php8.3-mysql php8.3-mbstring
sudo mysqld_safe --user=mysql >/dev/null 2>&1 &
```

Wait ten seconds, then create the development database and let the test runner make throwaway
databases (paste as one command, exactly, including the quote marks):

```
sudo mysql -e 'CREATE DATABASE IF NOT EXISTS uo_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS "uo_dev"@"127.0.0.1" IDENTIFIED BY "uo_dev_local_only"; CREATE USER IF NOT EXISTS "uo_dev"@"localhost" IDENTIFIED BY "uo_dev_local_only"; GRANT ALL ON `uo\_%`.* TO "uo_dev"@"127.0.0.1"; GRANT ALL ON `uo\_%`.* TO "uo_dev"@"localhost"; FLUSH PRIVILEGES;'
```

Make `php` mean PHP 8.3 in your terminal:

```
echo "alias php=/usr/bin/php8.3" >> ~/.zshrc
```

Then close the terminal tab and open a new one. Check with `php -v` (should say 8.3).

**Every time the Codespace wakes up**, MariaDB is stopped. Start it again:

```
sudo mysqld_safe --user=mysql >/dev/null 2>&1 &
```

Run the tests any time (they build and delete their own temporary database):

```
php api/tests/run.php
```

The last line should say `... passed, 0 failed`.

Run the site and API locally: `bash api/dev/serve.sh` (leave it running), then in a second tab
`curl -s localhost:8080/api/v1/health` should print `{"status":"ok"}`.

---

## Part 2 -- Putting the backend on the live server (milestone M4)

**Safety:** this only *adds* two new folders (`api` and `parish`) to your site's folder. It does not
change or replace any existing site file. To undo everything, delete those two folders in File
Manager (and, if you like, the `uo-private` folder and the database).

You will need: your cPanel login, your Spacemail password for admin@theuniversaloffice.com, and
about 30 minutes. **Have a place to save a password** (a password manager) for the database password.

### Step A -- Build the upload file (Codespace)

```
git pull origin claude/determined-einstein-kny5ms
php api/tests/run.php
npm run release:parish-backend
```

The tests must end `0 failed`. The last line of the build should be
`PASS release:parish-backend: upload parish-backend.zip ...`. The file `parish-backend.zip` now
sits in the file list at the top level of the Codespace. Right-click it -> **Download...**

### Step B -- Create the database (cPanel)

1. In cPanel, search for **Database Wizard** and open it. (If you don't have it, **Manage My
   Databases** does the same three things: create a database, create a user, give the user all
   privileges.)
2. **Step 1, Create A Database:** type `uo` -> **Next Step**. cPanel adds your account prefix, so
   the real name will be `lwmpzdytfh_uo`.
3. **Step 2, Create Database Users:** username `uo`, then a long random password (use the
   **Password Generator** button and **save the password in your password manager now**) ->
   **Create User**.
4. **Step 3, Add User to the Database:** tick **ALL PRIVILEGES** -> **Next Step**.
5. Write down the two full names it shows: the database (`lwmpzdytfh_uo`) and the user
   (`lwmpzdytfh_uo`). You will type them in Step D.

### Step C -- Make the private folder (cPanel)

1. Open **File Manager**. In the left-hand tree, click the top line `(/home/lwmpzdytfh)` so the
   right-hand list shows your home folder (you should see `theuniversaloffice.com`, `public_html`,
   `ssl`, `tmp` ...).
2. Click **+ Folder** (top-left toolbar). In **New Folder Name** type `uo-private`. Check that
   **Create New Folder in** says `/` (not `/public_html`). Click **Create New Folder**.
3. Right-click `uo-private` -> **Change Permissions**. Set the numbers to **700** (tick Read,
   Write and Execute under *User* only) -> **Change Permissions**.

### Step D -- Make the live config file (Codespace, then cPanel)

In the Codespace terminal:

```
php api/cli/make-prod-config.php
```

It asks questions. Type or press Enter as follows (typing is hidden for passwords):

| Question | Answer |
|---|---|
| Database name | the full name from Step B, e.g. `lwmpzdytfh_uo` |
| Database username | the full user name from Step B |
| Database password | the password from Step B |
| Database host | just press Enter (`localhost`) |
| Mailbox / username | Enter (`admin@theuniversaloffice.com`) |
| Mailbox password | your Spacemail password |
| SMTP server / port / Encryption | Enter, Enter, Enter |
| Admin email | Enter (`josh@jwjeffery.org`) |
| Site address | Enter (`https://theuniversaloffice.com`) |

You should see `Written: .../.external/uo-private/config-production.php`.

Now move it to the server:

1. In the Codespace file list (Explorer, left side) open the folder `.external` -> `uo-private`.
   Right-click `config-production.php` -> **Download...**
2. In cPanel File Manager, open the `uo-private` folder (double-click it). Click **Upload**, choose
   the downloaded file, wait for it to finish, then click **Go Back to /home/lwmpzdytfh/uo-private**.
3. Right-click the uploaded `config-production.php` -> **Rename** -> new name `config.php` ->
   **Rename File**.
4. Right-click `config.php` -> **Change Permissions** -> **600** (Read + Write under *User* only).
5. **Keep a private copy** of the downloaded file in your password manager (or another private
   place). The file contains two generated secrets. If they are ever lost or regenerated after
   go-live, every parish's join code and every reader's access stops working. Then delete the copy
   in your Downloads folder.

### Step E -- Upload the backend (cPanel)

1. In File Manager, open the **`theuniversaloffice.com`** folder (your site's folder -- the one that
   already contains `index.html`, `js`, `css`, `data`).
2. Click **Upload**, choose `parish-backend.zip`, wait for 100 %, click **Go Back to ...**.
3. Click the `parish-backend.zip` line once to select it, then click **Extract** in the top toolbar
   -> **Extract File(s)** -> **Close**. Two new folders appear: `api` and `parish`.
4. Select `parish-backend.zip` again and click **Delete** (tick "Skip the trash" if offered).
5. To confirm the hidden rules file arrived: click **Settings** (top right), tick **Show Hidden
   Files (dotfiles)**, **Save**, then open the `api` folder. You should see a file named `.htaccess`.

### Step F -- Create the tables (phpMyAdmin)

1. In the Codespace file list open `api` -> `migrations`, right-click `001_init.sql` -> **Download...**
2. In cPanel, open **phpMyAdmin**. In the left column click the database `lwmpzdytfh_uo`.
3. Click the **Import** tab (top). Under **File to import** click **Choose File**, pick
   `001_init.sql`, scroll to the bottom and click **Import**.
4. You should see a green message "Import has been successfully finished". In the left column,
   under `lwmpzdytfh_uo`, you should now see 9 tables: `approval_tokens`, `audit_log`,
   `intentions`, `login_codes`, `parishes`, `rate_limits`, `schema_migrations`, `sessions`, `staff`.

(Later database changes are delivered as new numbered files, imported the same way: `002_parish_pages.sql`
is described in Part 3c.)

### Step G -- Check it from the outside (Codespace)

```
bash api/dev/check-production.sh https://theuniversaloffice.com
```

**If your site is behind the hosting-level password (the browser asks for a username and password
before showing the site), add your site username in front, and type the password when it asks:**

```
CHECK_USER=yourusername bash api/dev/check-production.sh https://theuniversaloffice.com
```

The password is kept only in a temporary private file that is deleted when the check ends. Note that
the `api` folder is deliberately **exempt** from the site password (its `.htaccess` says so): the API
uses the same `Authorization` header for its own login tokens, so the two cannot coexist, and the
future phone app cannot answer a password prompt. The rest of the site, including `/parish/`, stays
locked until you launch.

Every line should say `PASS`, ending with `ALL CHECKS PASSED`. This checks that the API answers,
that your source code, config and migration files are **not** downloadable, that plain `http`
redirects to `https`, and that opening the approval link cannot approve anything.

If something says `FAIL`, copy the whole output to me. If `health` fails or shows an error page,
open File Manager -> `uo-private` -> `logs` -> `api-error.log`, click **View**, and send me the last
few lines (they never contain personal data).

### Step H -- Sign in as admin and check the deployment (Codespace)

```
php api/cli/remote-admin.php https://theuniversaloffice.com
```

1. Press Enter for the admin email (`josh@jwjeffery.org`).
2. Open your email. A message "Your Universal Office code" arrives within a minute. Type its
   6-digit code.
3. At the menu choose `1` (Deployment status). You should see `"php": "8.2..."`, all four
   extensions `true`, `"database": true`, `"migrations": ["001_init"]`, and `"mail_driver": "smtp"`.
4. Choose `0` to quit.

### Step I -- The full registration test (Codespace and your inbox)

This creates a test parish and approves it, exactly as a real one would go. It uses your own email
as the "rector". Paste (change nothing):

```
curl -s -X POST -H 'Content-Type: application/json' -d '{"parish_name":"Test Parish","contact_name":"Josh Jeffery","email":"josh@jwjeffery.org","diocese_key":"episcopal/western-oregon"}' https://theuniversaloffice.com/api/v1/register
```

You should see `{"status":"ok",...}` and receive an email with a 6-digit code. Then, replacing
`123456` with that code:

```
curl -s -X POST -H 'Content-Type: application/json' -d '{"email":"josh@jwjeffery.org","code":"123456"}' https://theuniversaloffice.com/api/v1/register/verify
```

You should see `{"status":"pending_approval"}` and, in your inbox, a second email: **Parish awaiting
approval: Test Parish**. Open the link in that email in your browser. You should see a page titled
**Approve a parish** showing "Test Parish" and a button. **Nothing is approved yet** -- that is the
point. Press **Approve this parish**. You should see "Approved. The rector has been emailed", and an
email "Your parish is approved" arrives.

Check it is live: `curl -s https://theuniversaloffice.com/api/v1/parishes` should list Test Parish.

Clean up the test: run `php api/cli/remote-admin.php https://theuniversaloffice.com`, sign in,
choose `2` to see the parish's number, then `6` to delete it (you'll type the parish's short name,
`test-parish`, to confirm).

---

## Part 3 -- The parish pages (milestone M5)

The pages live in the `parish` folder of the site. They are uploaded in the same `parish-backend.zip`
as the backend (Part 2, Steps A and E), so to update them you rebuild and re-upload that one zip.

| Page | Address | Who uses it |
|---|---|---|
| Rector dashboard | `https://theuniversaloffice.com/parish/` | Rectors and their helpers: sign in with an emailed code, add / edit / extend / remove prayer requests, choose public or join-code, see and change the join code, add helpers, leave or delete the parish. **Register your parish** is a link on the sign-in page. |
| Admin page | `https://theuniversaloffice.com/parish/admin.html` | You: sign in with a code sent to josh@jwjeffery.org; approve, suspend, restore or delete parishes. Prayer text is never shown. This replaces `remote-admin.php` for day-to-day use. |
| Approval page | opened from the link in the "Parish awaiting approval" email | You: shows the parish and an **Approve** button; opening it approves nothing. |
| Privacy notice | `https://theuniversaloffice.com/parish/privacy.html` | Everyone. Read it once and tell me if any sentence is not true for how you want this to run. It is not legal advice. |

While the pre-launch site password is on, the pages ask for it before showing; the API behind them
does not (see Part 2, Step G).

**Promises the privacy notice makes** that the scheduled jobs (milestone M7) must keep: expired requests
deleted 7 days after they expire, hashed network addresses deleted within 2 days, action logs deleted
after 180 days, and backups kept for a short fixed period.

**Testing the pages in a real browser** (needs Playwright; the ordinary test run does this
automatically when it is installed): `php api/tests/run.php` includes about 70 checks that drive
Chromium through sign-in, adding / extending / editing / removing requests, settings, registration, the
approval link and the admin page, and that hostile text (script tags, broken HTML) shows as plain
text and runs nothing.

---

## Part 3c -- Parish page, events, announcements and the diocesan page (2026-10-06)

Four features built on the same backend. **Before they work on the live site you must import one new
database file, `002_parish_pages.sql`** (same way as Part 2, Step F: Codespace -> `api` -> `migrations` ->
right-click `002_parish_pages.sql` -> Download; phpMyAdmin -> your database -> Import -> Choose File ->
Import). It only adds columns and four new tables; it changes no existing data, and importing it twice is
harmless. After it, the left column of phpMyAdmin shows 13 tables. Then rebuild and upload `parish-backend.zip`
(Part 2, Steps A and E), and upload the next `release:web` build so the app has the profile link.

| What | Where readers see it | Who keeps it |
|---|---|---|
| **Parish home page**: service times, rector, address, website, Follow / Join | `https://theuniversaloffice.com/parish/home.html?p=<parish short name>`; the profile in the app links to it once a parish is followed | The rector: dashboard -> **Parish page** tab -> *About your parish* |
| **Rector's announcements**: short note pinned at the top of the parish page, 1-45 days (7 by default), up to 5 at once | the parish page | Rector or helpers: **Parish page** tab -> *Announcements* |
| **Parish events**: vestry meetings, funerals, the parish supper, feast-day services | the parish page ("Coming up") | Rector or helpers: **Parish page** tab -> *Coming events* |
| **Diocesan page**: bishop, convention dates, the bishop's prayer list, the diocese's parishes, "pray for a parish today" | `https://theuniversaloffice.com/parish/diocese.html?d=episcopal/western-oregon` | **You**, on the admin page, under *Diocesan pages* (a diocese has no sign-in of its own yet) |

How they behave, so nothing surprises you:

- **Same privacy rule as prayer requests.** A parish that needs a join code shows nothing but a code box until the
  reader enters the code; the join code is never in any page. A pending or suspended parish serves nothing.
- **Following.** The parish page's *Follow this parish* button (or entering a join code there) leaves a small note in
  the reader's browser; the app applies it the next time it opens. *Stop following* works the same way.
- **Events** use the parish's own date and time; the server never converts them. An event stays on the page through
  the day after its date, and is deleted a week later by the daily job. Up to 60 upcoming.
- **Announcements** disappear on their own at the expiry date and are deleted a week later. They can be extended.
- **"Pray for a parish today"** has two separate sources: the diocese's parishes taken in turn, one per day; and, only
  when the diocese's own dated Cycle of Prayer names a parish that has a page, that parish with a link. Dioceses whose
  cycle is not dated (monthly, weekly and so on) show only the rotation.
- **The bishop's prayer list** is text you enter; it expires like other requests (21 days unless you choose 1-45).
- Everything a rector or you type is shown as plain text; markup does nothing. The automated browser checks
  (`php api/tests/run.php`, files `t95` and `t96`) prove it.

**Not built (your call):** a Collect and readings beside each service time ("this Sunday's Collect"). The app works
those out in the browser from its liturgical calendar engine and has no way to open a given date from a link, so it
needs its own piece of work.

---

## Part 3b -- Daily job and backups (milestone M7)

Two scheduled jobs run from cPanel **Cron Jobs**. Both are set to run **every hour**; each one checks the
Pacific clock itself and really acts only once a day (daily job: first tick at or after 8:00 a.m. Pacific;
backup: first tick at or after 3:00 a.m. Pacific). A missed day catches up at the next hourly tick, and the
server's own time zone does not matter.

**Cron Jobs page (cPanel -> Advanced -> Cron Jobs):**

1. Under **Cron Email**, enter your email and click **Update Email**. cPanel mails you whatever a job prints.
   Both jobs print nothing when they succeed, so you only ever hear about trouble.
2. Under **Add New Cron Job**, set **Common Settings** to **Once Per Hour (0 * * * *)**. The five boxes become
   `0 * * * *`.
3. In **Command** paste the daily-job line, then click **Add New Cron Job**:

   `bash /home/lwmpzdytfh/theuniversaloffice.com/api/cron/daily.sh`

4. Repeat steps 2-3 with the backup line:

   `bash /home/lwmpzdytfh/theuniversaloffice.com/api/cron/backup.sh`

**What the daily job does:** emails each rector one digest per parish when requests will expire within 3
days (counts and dates only, never the request text); deletes requests 7 days after expiry, login codes
1 day after expiry, expired sessions, rate-limit records older than 2 days, audit entries older than 180
days and approval tokens 30 days after expiry. A one-line counts-only summary is appended to
`uo-private/logs/cron.log`.

**What the backup does:** writes `uo-private/backups/uo-YYYYMMDD.sql.gz` (file mode 600, folder 700) and
keeps the newest 14. It builds `uo-private/backup.cnf` itself from `config.php`, so the database password is
never typed on a command line. An empty or damaged dump fails loudly (you get an email) and leaves no file.

**Backups contain prayer text in plain form -- treat them as sensitive.** They sit on the same server, so
they do not protect you if the hosting account itself is lost. About once a month, download one copy
(cPanel -> File Manager -> `uo-private/backups`, right-click -> Download) and keep it somewhere private.
Spaceship's paid AutoBackup is an optional off-server upgrade; nothing here assumes it.

To run either job by hand right now (skipping the clock gate), use the same command with `UO_FORCE=1` in
front, e.g. in a cron line scheduled for one minute from now:
`UO_FORCE=1 bash /home/lwmpzdytfh/theuniversaloffice.com/api/cron/backup.sh` -- then delete that extra cron line.

## Part 4 -- If something goes wrong

| Symptom | What it usually means | What to do |
|---|---|---|
| `check-production` says health fails, page shows an error | Config missing or wrong | View `uo-private/logs/api-error.log`; `config_not_found` means the file is not at `/home/lwmpzdytfh/uo-private/config.php` |
| Log says `PDOException` | Database name, user or password mistyped | Re-run Step D carefully and upload again |
| Parish list fails but health is fine | Tables missing | Repeat Step F |
| A `BLOCKED` check says REACHABLE | The rules file did not arrive | Repeat Step E5 and tell me |
| Email never arrives | Mail settings or spam | Check spam; run `php api/cli/setup-mail.php` then `send-test-mail.php` from Part 1 style commands and tell me the `FAILED:` text |

Never paste passwords, the config file, join codes or login tokens into chat.

## Part 5 -- Pilot: St. Bede's Episcopal Church

1. On the live site open `https://theuniversaloffice.com/parish/` and choose **Register your parish**.
2. Use: parish name as the rector wants it shown; diocese **Western Oregon**; home parish in the diocese's
   list (this sets `corpus_parish_slug` so the parish is offered as the reader's home parish); the rector's own
   email address (a code is sent there). Choose **join code** or **public** visibility.
3. You receive the approval email; open the link and press **Approve**. The rector signs in at
   `/parish/` with an emailed code and adds the first requests.
4. As a reader: open the app, choose the Episcopal Church, open **Your Profile**, pick the parish under
   **Parish prayer intentions** (enter the join code if there is one), and open Morning or Evening Prayer.
   "Parish Intercessions" appears after the Diocesan Cycle of Prayer.
5. Delete any test parishes: admin page, the parish's **Delete** button, type `DELETE <slug>`.

## Part 6 -- Checks to run after any deploy

```
CHECK_USER=Admin bash api/dev/check-production.sh https://theuniversaloffice.com
```

Expected: `ALL CHECKS PASSED` (type the site password carefully -- it is hidden). Also in a Codespace:
`sudo mysqld_safe --user=mysql >/dev/null 2>&1 &` then `php api/tests/run.php` and
`npm run audit:parish-intentions`.

**At launch:** remove the pre-launch site password (Spaceship hosting manager), then re-run the check
without `CHECK_USER`.
