# Parish Intentions -- Operator Runbook

This is the working manual for the Parish Intentions feature (the backend in `api/`, the pages in
`parish/`). It is written for Josh: every step says exactly what to click or paste, and what you
should see when it worked. The build plan behind it is `PARISH_INTENTIONS_BUILD_SPEC.md`.

**Status:** the backend (milestones M0-M4) is finished and tested. The rector dashboard, admin
page and reader integration (M5-M6), the scheduled jobs (M7) and the final documentation (M8)
come later; this file grows with each milestone.

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

(Future database changes will be delivered as new numbered files -- `002_...sql` and so on --
imported the same way.)

### Step G -- Check it from the outside (Codespace)

```
bash api/dev/check-production.sh https://theuniversaloffice.com
```

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

## Part 3 -- If something goes wrong

| Symptom | What it usually means | What to do |
|---|---|---|
| `check-production` says health fails, page shows an error | Config missing or wrong | View `uo-private/logs/api-error.log`; `config_not_found` means the file is not at `/home/lwmpzdytfh/uo-private/config.php` |
| Log says `PDOException` | Database name, user or password mistyped | Re-run Step D carefully and upload again |
| Parish list fails but health is fine | Tables missing | Repeat Step F |
| A `BLOCKED` check says REACHABLE | The rules file did not arrive | Repeat Step E5 and tell me |
| Email never arrives | Mail settings or spam | Check spam; run `php api/cli/setup-mail.php` then `send-test-mail.php` from Part 1 style commands and tell me the `FAILED:` text |

Never paste passwords, the config file, join codes or login tokens into chat.
