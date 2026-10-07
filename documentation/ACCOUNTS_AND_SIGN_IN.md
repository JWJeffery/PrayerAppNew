# Accounts and sign-in

Written 2026-10-07. This is the working reference for optional accounts: what exists, how it is secured, how to
turn it on, and how to add Apple, Google or Facebook sign-in later. It **supersedes** the build spec's old rule
that readers have no accounts (`PARISH_INTENTIONS_BUILD_SPEC.md`, section 0 item 7), by Josh's decision of
2026-10-07: accounts are optional, never required.

## What exists

| Who | Ways to sign in | Where |
|---|---|---|
| **Reader** (anyone using the app) | emailed code, optional password, optional passkey | the app: Profile → *Your account (optional)* |
| **Rector / helper** | emailed code, optional password, optional passkey | `/parish/` → Parish settings → *Sign-in options* |
| **Administrator** | emailed code, optional password, optional passkey | `/parish/admin.html` → *Sign-in options* |
| **Diocese editor** (designated by an administrator for one diocese) | emailed code, optional password, optional passkey | `/parish/diocese-admin.html` → *Sign-in options* |

- **Emailed code always works.** It is also how someone who forgets a password gets back in, and how a new password is set.
- A reader account exists only after the first correct emailed code. It keeps the person's **settings** (the same
  profile the app already keeps in the browser: name, tradition, diocese, followed parish and so on) so they follow the
  person to every device. The soft "super user" flag is never saved.
- One **password** per email address, shared by whatever roles that address holds (reader, rector, administrator).
- **Passkeys** are sign-in without typing: Face ID, a fingerprint or a device PIN. Sign-in is usernameless (the browser
  offers the passkeys it holds for this site), so nothing is typed and nothing reveals which addresses exist.

## Diocese sign-in (added 2026-10-07)

A diocese keeps its own page (bishop, website, convention dates, the bishop's prayer list) through a **diocese editor**.

- **Nobody can claim a diocese.** A global administrator designates an editor on `/parish/admin.html` → *Diocesan pages* → choose the
  diocese → *Who keeps this page* → *Add editor*. The person is emailed the sign-in address. Removing them ends their sign-in at once.
- **One address keeps at most one diocese** (`diocese_staff.email` is unique). The administrators and owners can still edit any diocese.
- **The diocese comes from the server's record, never the request.** An editor's writes go to `PUT /diocese/page`, `POST /diocese/prayers`
  and `DELETE /diocese/prayers/{id}`; a diocese named in the body or URL is ignored or refused. Editors cannot reach any administrator,
  parish or reader endpoint, and cannot list or add editors.
- Sign-in is the same as everyone else's: emailed code (`/diocese/auth/request-code`, `/diocese/auth/verify-code`), optional password and
  passkey (`as: 'diocese'`), the same 15-minute fresh-confirmation rule, the same rate limits and no-enumeration answers. One password
  and one set of passkeys per email address, shared by every role that address holds.
- Migration `005_diocese_staff.sql` adds the `diocese_staff` table (20 tables in all), the `diocese` session kind and its code purpose.

## Security decisions (and why)

- **Passwords follow NIST SP 800-63B-4:** at least 15 characters, up to 128, any characters including spaces, **no
  composition rules**, refused if on a short list of common choices or if they contain the email address.
- **Stored as** Argon2id (memory 19 MiB, 2 passes, 1 thread: OWASP's minimum, sized for shared hosting; bcrypt cost 12 where
  Argon2 is missing) of an HMAC of the password keyed with the server's secret pepper. A stolen database alone cannot be
  used to test guesses.
- **No enumeration:** every failure of a password sign-in is the same 401, and an address with no password costs the same
  time to check as one with a password. Code requests answer identically for every address.
- **Rate limits:** 10 password tries per address per hour, 40 per network address; 5 code requests per address per hour.
- **Changing how someone signs in needs fresh proof.** Adding or changing a password, adding or removing a passkey, and
  deleting an account need the person to have signed in, or confirmed with an emailed code, in the last 15 minutes, or to
  give their current password. Otherwise the server answers `403 reauth_required` and the page offers an emailed code.
- **Changing or removing a password signs out every other session** for that address, in every role.
- **Passkeys:** vendored `report-uri/passkeys-php` v2.0.0 (`api/lib/Passkeys/README-UO.md`). Resident key and user
  verification are required, attestation is "none", a challenge is single-use and lasts 5 minutes, the signature counter
  is checked, and a passkey is only accepted for the roles its address holds.
- **Saved settings are stored encrypted** (libsodium secretbox, the same as join codes).
- **Administrators are re-checked on every request** (config owners plus the `admins` table).

## Deploying

1. In phpMyAdmin, with `lwmpzdytfh_uo` selected, import `api/migrations/004_accounts.sql` (adds `readers`, `credentials`,
   `passkeys`, `webauthn_challenges`, `identities`, and two columns on `sessions`; safe to run twice). You should then
   have 19 tables.
2. Upload and extract **both** `parish-backend.zip` (server code and parish pages) **and** `web-release-app-shell.zip`
   (the app, and `js/account-core.js`, which the parish pages also load).
3. PHP needs the `openssl` and `mbstring` extensions and either `sodium` or OpenSSL Ed25519. `/admin/status` lists them.
4. Passkeys need the site on **https** (the browser requires it). The relying-party id is the host of `site_url` in the
   private config (`theuniversaloffice.com`). A passkey made there does not work on another host.

## Adding Apple, Google or Facebook sign-in later

The seam is built and tested; **no provider is switched on**. Accounts are keyed by email address, and a provider only
proves "this person owns this address". To add one:

1. Write a class implementing `SocialVerifier` (`api/src/Social.php`): `verify($idToken)` checks the provider's token
   (signature against the provider's published keys, issuer, audience = our client id, expiry) and returns
   `['subject' => stable id, 'email' => ..., 'email_verified' => bool]`, or null.
2. Add it to `Social::PROVIDERS` and `require_once` it in `bootstrap.php`.
3. Put the provider's client id(s) in the private config and set `social.<name>.enabled` to `true`.
4. In the app, get an ID token with the provider's own SDK (on iOS and Android, through Capacitor) and `POST /auth/social`.

`POST /auth/social` already does the rest: a returning identity signs in to its account; a first-time identity is linked
**only if the provider verified the address**; the role is checked exactly as for passwords; every failure is one 401.
Apple's "hide my email" gives a private relay address: it simply becomes its own account.
`api/dev/router.php` registers a stand-in provider for the tests only (`UO_TEST_SOCIAL=1`); it is never deployed.

**Store rules that matter here**
- Apple's guideline 4.8 requires Sign in with Apple when an app **exclusively** uses a third-party or social login. Universal
  Office has its own accounts (emailed code, password, passkey), so it is not exclusive; still, add Sign in with Apple
  alongside Google or Facebook to be safe and because iPhone users expect it
  ([Apple developer forums on 4.8](https://developer.apple.com/forums/thread/765145)).
- Google: a new **personal** Play developer account must run a closed test with at least 12 testers for 14 days before it
  can publish. Organization accounts are exempt.

## Tests

`php api/tests/run.php` covers all of this: `t98_accounts.php` (reader sign-in, saved settings, passwords, confirming,
passkey endpoints, the social seam, deleting an account) and, in a real browser with Chromium's virtual authenticator,
`t99a_diocese_staff.php` (diocese sign-in: designating, code and password sign-in, one-diocese scoping, removal) and, in a real browser with
Chromium's virtual authenticator, `t99_accounts_browser.php` (the full passkey ceremony for a reader and a rector, password sign-in for a reader, a rector
and an administrator, the second-device choice, deleting the account).

## What is not built (decisions for later)

- Pwned-password checking against an external service (the project rule is no third-party services); the short built-in list
  and the 15-character minimum are the defence for now.
- Account recovery beyond the emailed code (there is no password reset link by design: signing in by code and setting a new
  password is the reset).
- Syncing anything except the profile (for example, which offices were prayed) between devices.
