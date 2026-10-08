# RESUME_PROJECT_NOTE.md

**Paste this at the start of a new conversation.** It is a handoff, not a history: current rules,
current state, and the short list of things that are actually open. Everything closed lives in
`documentation/project-history/` (start at `INDEX.md`) and `AUDIT_GOVERNANCE_LEDGER.md`; anything
there is HISTORICAL and is marked so. **Where this note and the repo disagree, the repo wins.**

**Cleaned and pruned 2026-10-03** at Josh's request (~510 -> ~220 lines); **refreshed 2026-10-06 (after PR #120) and again 2026-10-07 (after PR #125; parish and accounts sections rewritten and stale-scanned)**: every file path, count and status claim in this note was
checked against the repo that day (all held except the "active direction" heading, now condensed). The retired sections went
verbatim to `documentation/project-history/VOLUME-7-2026-10-03-resume-note-retired-sections.md`.
**Keep it this way:** if you add something to this note, move whatever it displaces into a
history volume in the same session, and do not list an item as "open" unless it is either (a) a
decision only Josh can make, (b) gated on his explicit go-ahead, or (c) something a session can
start right now with no investigation. Check the line count before you finish.

**First move, every session:** `git fetch origin main`, then
`git merge-base --is-ancestor <your-branch> origin/main`. If it does not succeed, merge
`origin/main` in before reading or editing anything else. Then `git log --oneline -10` and read
`SEED_VERSION` and cache-bust params out of the live files (`audit-ledger.html`, `index.html`),
never from this note. Josh runs several sessions against this repo.

---

## 1. Who and what

Josh (GitHub `JWJeffery`) owns **PrayerAppNew** / "The Universal Office", a free, non-commercial
multi-tradition liturgical prayer web app (theuniversaloffice.com). He is not a coder. Traditions
live: Anglican (BCP 1979), Coptic (Agpeya), Church of the East (East Syriac), Byzantine
(Horologion), and Roman Breviary 1960/1962 (the "Catholic" card). He also owns the Drive project
"An Anglican Synaxarium" (folder `1MKGp9HIUS_y3y5LnSvcG3dlqjRvn1RAu`).

A prior assistant, **Lucy**, was dismissed for falsely certifying content as accurate. All
Lucy-era certifications are void; nothing in this repo's docs or `structure.json` counts as
evidence by itself. Verify against primary sources.

`synaxarium-review/` is a separate project (review UI for the Anglican Kalendar candidate
matrices). Do not extend it or build anything parallel to it without asking. It is not run in a
way that stamps decisions into the CSVs: stamping "Decided" makes `build_data_v3.py` hard-fail
(it validates pre-review state). Decisions live in the exports under `synaxarium-review/data/`.

## 2. Workflow rules

- Work on the assigned branch, commit, and push with `git push -u origin <branch>` in the same turn.
  Do not open a PR unless asked. **Merging to `main` only on Josh's explicit word.** Recent merges
  (PRs #114-#125) were GitHub PR merge commits, opened and merged when he said "Open a PR and
  merge"; after a merge, restart the branch from `origin/main` (same name) before new work.
- Fetch and check `git log --oneline -1` before building on a branch.
- Validate JSON before writing; prefer targeted edits to bulk dumps. For bulk edits to
  `data/saints/sanctoral.json` key on `(id, month, day)`, never `id` alone; back up first.
- Bump `?v=NNN` cache-bust params in `index.html` whenever the matching JS **or CSS** changes. This
  was missed on 2026-10-06 (PR #118 shipped without it) and had to be fixed after the merge: without
  it a browser that cached the old file may keep serving it.
- Ledger/`SEED_VERSION` entries go in the same commit as the fix.
- Name exact paths when staging; do not `git add -A` blindly.
- Josh does not see background-task notifications: work synchronously and report plainly.
- Josh's preferences: no licensing lectures; specific per-source evidence; never fabricate
  liturgical text; give unambiguous landmarks for any edit he must make by hand; Daily Office
  lectionary only from the 1979 BCP (bcponline.org or justus.anglican.org PDF).
- Whole-app JSON-to-database migration: only scoped, not started; JSON stays the source of truth (section 5, item 2).
- Josh asked repeatedly for stale notes to be caught. Before listing anything as open, grep the code and
  `AUDIT_GOVERNANCE_LEDGER.md` to confirm it is not already built (the Book of Needs role ladder sat here
  as "open" for weeks though built 2026-08-30). The 2026-10-06 scan found nothing else stale.
- Do not wait on a test with `until ! pgrep -f <name>`: the loop matches itself and never ends. Read the
  output file instead.

## 3. Content rules

- Every component cites a specific source page. Gaps are disclosed, never filled by guessing.
- Sweep the class when you find a bug, but verify before generalizing.
- Reused components are verified by text comparison, not title similarity.
- Simulate calendar/engine logic in Node against real dates before committing.
- Scope and architecture decisions are Josh's; record conflicts, do not override.
- A subsystem is not done while any known problem remains, however minor.
- A `fixed` row that is really moveable needs an engine rule, not a lookup.
- No new liturgical text without confirming the specific source and edition first.
- Licence policy (Josh, 2026-10-01): free-for-non-commercial sources are acceptable; AGES texts
  may serve the Slavic lane with the Greek-usage disclosure. Excluded as copyrighted or uncleared:
  Festal Menaion, HTM Menaion, Lambertsen, OCA liturgics, Saint Kosmas pages, Anastasis/Lash
  (permission pending), MCI Online Menaion, Orthodox Wiki hymn texts.

## 4. Communication

Josh is direct. Correct errors immediately, without softening. Do not ask for things already
documented. Answer a point-blank scope or status question in the conversation, right then; a note
filed in a doc is not an answer. When unsure whether something exists or is finished, check first
and say what you checked.

## 5. What is open

**Decisions only Josh can make** (no work possible until he picks):
- **Royal Anthem (East Syriac):** copyright. Either an OIRSI/Moolan permission request, or a
  disclosed machine translation from Bedjan's public-domain Syriac. Four leads already exhausted.
- **East Syriac minor hours:** keep them out of scope (as Maclean does) or find a separate source
  for monastic minor-hour texts.
- **Navigation headings:** uniform headings versus the navigation doc's allowance for local naming. Josh wants to DISCUSS this (2026-10-06); do not decide it for him; start the discussion by asking which headings he means.

**Josh's direction of 2026-10-03 is done, apart from what is gated on him.** (1) Roman Breviary rebuild: components plus
JS rubrics engine, any year 1900-2100, Latin and English, with a Calendar setting for Rubrics 1960 or Rubrics 1960 -
2020 USA (PR #120, 2026-10-06); plan and results: `documentation/ROMAN_BREVIARY_COMPONENT_ENGINE_PLAN.md` sections 12-18.
(2) Offline delivery: installable offline website built 2026-10-04 (`npm run release:web`, `npm run test:offline`).
**Not done (an earlier note recorded "web only", but Josh says he never asked for that; Google Play is OPEN, he is planning a beta and asking about Play closed testing):** Capacitor iOS/Android apps;
password-protected hosting can block the manifest/service worker (plan doc section 17). JSON stays the source of
truth; a database is only scoped (`documentation/JSON_TO_DATABASE_SCOPING.md`). Scripture in the public app is limited
to passages cited in the prayers (Bible browser stays admin-only); Josh judges the NRSV discrete-passage use
licensed (his call, not verified by us).

**Parish features and optional accounts: built, merged to `main`, and LIVE (2026-10-07).** Parish home page, rector announcements, events,
the diocesan page, global-administrator viewing and in-app administrator management, parish-page restyle, and optional accounts (readers keep
settings across devices; password and/or passkey optional for everyone; emailed codes still work; Apple/Google/Facebook seam exists, no provider
on). Migrations 002, 003 and 004 are imported on production (19 tables) and Josh confirmed emailed-code sign-in works. Both zips (`parish-backend.zip`
and `web-release-app-shell.zip`, strict SQL mode plus a "database is missing updates" warning on the admin page) are deployed; PR #125 put
everything on `main`. Read `documentation/ACCOUNTS_AND_SIGN_IN.md` and `documentation/PARISH_INTENTIONS.md` Part 3c. **An earlier note recorded "web only" as Josh's decision; he says he never asked for that, so Play/store apps are OPEN:** (Google Play needs a 12-tester, 14-day test for personal accounts; organization accounts need a D-U-N-S number); no Capacitor/Play/App Store apps
unless Josh revisits. **Diocese sign-in: built 2026-10-07, on the branch and NOT yet merged or deployed** (migration `005_diocese_staff.sql`; Josh designates an editor per diocese on the admin page; they sign in at `parish/diocese-admin.html`; `documentation/ACCOUNTS_AND_SIGN_IN.md`). Deploy: import 005, upload `parish-backend.zip`. **Still open, held by Josh:** "this Sunday's Collect and readings" beside the service times (needs the calendar engine; no date
deep-link exists). Original todo: history Volume 9.

**Josh's own hands** (install icon done 2026-10-07: his gold cross, open book and Episcopal shield artwork is in `images/app/`; ships with the next `release:web` app-shell zip):
- Deploys are by hand: cPanel File Manager for zips, phpMyAdmin for migrations (click the database name first, then Import). Upload
  `parish-backend.zip` AND `web-release-app-shell.zip` together; an older app-shell zip overwrites newer parish files. All
  the `web-release-*` zips from the 2026-10-06 release are uploaded (Josh, 2026-10-07).
- Drive:
- (Done 2026-10-06: Josh deleted the superseded "Corrections of 2026-10-02" Google Doc, the one with the incorrect 22-record count; the replacement stays.)
- Optionally upload `synaxarium-review/data/synaxarium-decisions-2026-10-02-corrected.json` to
  Drive. The connector cannot overwrite existing Drive files, so Drive's own
  `synaxarium-decisions-2026-09-07-cleaned.json` still shows the pre-correction decisions until he
  does.

**Roadmap:** `project_roadmap.json` phases 4-8 (EO Russian/Slavic closeout, OO Coptic closeout,
Church of the East closeout, cross-family hardening, final beta gate) are `not_started`. Phases 0-3
are done.

**Known limits, nothing to do (do not re-investigate):**
- Three Menaion commemorations have no public-domain icon on Commons (Placing of the Robe at
  Moscow, Eupsychios of Caesarea, Acepsimas of Persia). Searched by name 2026-10-02.
- Elijah in 2038 (Church of the East `prophet-elias-elijah`): no occurrence that year; no source
  gives a rule, so none is invented. `verify_sanctoral.js` lists it as a KNOWN GAP.
- Five Church of the East California-calendar acceptance misses (Mar Mushi, Jacob the Recluse,
  Sabrisho, Tahmazgard, Daniel the Physician) cannot yet be expressed as rules. Documented in each
  entry's `ruleSource`.
- Coptic Prayer of the Veil: not in O'Leary; no other edition found.
- Church of the East Cathedral/Monastic content axis: the control works; the content axis was
  deleted because Maclean describes one ferial form, not two. Rebuilding needs new research and
  nobody has scheduled it.
- Menaion by design: Great Feast propers stay deferred (Josh, 2026-10-01); rank-4 Orthros and
  aposticha are not done (the Typikon keeps the Octoechos); Repose of Anna, Mandylion and the
  Leavetaking of the Entrance stay unmapped.
- Maclean 1894 past printed p.45 is unreachable. Josh must supply pages. Do not retry.
- The ~18 Cycle of Prayer jurisdictions with no located source
  (`tecDioceseRoster.noSourceFound` in `data/cycles-of-prayer/schema.json`), rolling-window
  dioceses and 2027 cycles need periodic re-checks.

## 6. Current state, one paragraph each

**Menaion / Byzantine day layer (complete as planned, 2026-10-02).** All 360 commemorations have short lives, and the
day's fast, readings, "About Today" panel, education layer, commentary and icons (212) show in Vespers/Orthros/Typika
for 2026-2027, New and Old Calendar. Orloff Commons and AGES propers are wired. Records: `documentation/ORTHODOX_DAY.md`,
`MENAION_COMMONS_ORLOFF.md`, `MENAION_AGES.md`, `MENAION_DATA_FINDINGS.md`. The AGES ZIP is not in the repo; re-ingesting
needs Josh to re-supply it.

**Anglican Synaxarium (merged to `main`, 2026-10-02/03).** All 366 dates decided and applied (candidate matrix, SIN
tables, `data/kalendar/synaxarium/decisions.json`, `data/saints/sanctoral.json`, review-tool data). Records:
`documentation/ANGLICAN_SYNAXARIUM_CORRECTION_PROPOSAL.md`, `ANGLICAN_SYNAXARIUM_FINDINGS.md`. Check:
`python3 scripts/saints/verify-synaxarium-calendar.py` (96 checks). Hagiographies are deliberately not in the repo.

**Cycles of Prayer.** All 92 files validate (`npm run audit:cycles-of-prayer`); Communion, Diocesan and Parish tiers render
in BCP Morning/Evening Prayer; the profile (diocese and parish picker) is live. The only parish file is St. Bede's, Forest Grove.

**Roman Breviary 1960/1962** runs on the in-browser engine (all 8 hours, Latin and English, 1900-2100, from Divinum
Officium at a pinned commit), with the Calendar setting above. To test the 2020 USA variant set
`DO_VERSION="Rubrics 1960 - 2020 USA"` before `npm run test:roman-breviary-calendar|render` (unset means 1960); the
Perl engine clone comes from `npm run roman-breviary:engine:setup`. Verified zero differences: all 8 hours for 2026
(Latin, English), 2027 (Latin, English), 2031, 2038, 1999 (Latin). See `ROMAN_BREVIARY_1960_1962_BUILDOUT.md`.
The modern Liturgy of the Hours lane was abandoned by Josh on 2026-09-27.

**Parish Prayer Requests (separate live system, on `main` and in production).** A PHP/MariaDB backend (`api/`, versioned `/api/v1`) plus
`parish/` pages. Checks: `php api/tests/run.php` (941 passed; needs MariaDB running) and `npm run audit:parish-intentions` (249 checks). Readers' pages:
`parish/home.html?p=<slug>`, `parish/diocese.html?d=<key>`; following from the page works through a request key the app consumes at startup
(`applyPendingParishFollowRequest` in `js/office-ui.js`). Rectors sign in at `theuniversaloffice.com/parish/` (emailed 6-digit code; password and
passkey are optional extras) and read the join code under "Who can follow your parish"; `/parish/admin.html` is the administrator sign-in, not the
rector's. Global administrators (owners in `uo-private/config.php` `admin_emails`, plus others owners add on the admin page) see every parish page.
Join codes live encrypted in the production database, not in any repo file. The first FAQ page,
`faq/index.html` (rector join-code question), exists but is deliberately not linked from the app;
wiring it in is Josh's call. Add further questions there.

**Naming in the UI (Josh, 2026-10-06; supersedes the 2026-09-28/29 labels).** Three different
things must not be mixed: the *tradition* (picker label), the *church* (named in descriptions), and
the *office* (page title). The Anglican lane's tradition label is **"Anglican"**; The Episcopal Church
is the church within it and appears only in text such as "The Episcopal Church: 1979 Book of Common
Prayer Daily Office." Never "Anglican Communion". The page title at the top of an office is the
**office name**: The Daily Office, The Coptic Agpeya, The Hudra (Church of the East), The Horologion,
The Roman Breviary (`OFFICE_MODE_HEADER_LABELS` in `js/office-ui.js`); Book of Needs stays "The Book
of Needs". The other four tradition labels (Oriental Orthodox Church, Church of the East, Eastern
Orthodox Church, Catholic Church) were not questioned and were left alone. The header "Book of Needs"
button is an outline in every state (no tap fill). The profile modal fits phone widths (checked at
360px, 16-344px, no sideways scroll); only long dropdown text truncates inside its box.
Not yet seen on a real phone: the live site only changes when Josh uploads a new `release:web` build.

**Housekeeping.** `AUDIT_GOVERNANCE_LEDGER.md` and `AUDIT_SOURCE_VERIFICATION.md` are out of scope for any
documentation cleanup unless Josh asks. `structure.json`'s innerHTML item is mitigated (audited 2026-10-02). Stale audit
scripts are in `scripts/retired-audits/`. Of the 25 Maclean Church of the East prayers added to the Book of Needs menu
(PR #110), only one was browser-tested.

## 7. Source reachability (probed, not assumed)

| Source | Reach |
|---|---|
| Maclean 1894 (Drive `read_file_content`) | Front matter to printed p.34 only; mirrors hit a wall near p.45. Do not retry. |
| O'Leary 1911 (Drive `read_file_content`) | Full. `download_file_content` unusable (10MB cap). |
| Hapgood 1906 | Full OCR via `archive.org/download/ServiceBookOfHolyOrthodoxChurchByHapgood/Service_Book_Orthodox_Church_Hapgood_djvu.txt`. Great Feasts only, abbreviated: no sessional hymns, praises or exapostilaria. Usable for fuller Kontakion/Ikos and partial Vespers stichera. |
| BCP 1979 | In repo, complete. |
| ODCC | In repo, no text layer. Do not re-propose. |
| Lambertsen Octoechos | Copyright to ~2087; citable, not reproducible. |
| orthocal.info | MCP `search_saints` / `get_day`; flaky. If absent, use Wikipedia's "Month Day (Eastern Orthodox liturgics)" pages. |
| api.coptic.io | Direct HTTPS works (`/api/synaxarium/<YYYY-MM-DD>`, `/search/query?q=`). The old MCP wrapper was deleted 2026-09-28. |
| Anglican books for the Synaxarium | In `data/kalendar/source-witnesses/` (LFF 2024, HWHM, GCW, For All the Saints, Anglican Martyrology, ODS, Book of Saints, BCP). Page numbers cited are PDF pages unless marked "printed". |
| Wikimedia Commons | API works; image downloads are rate-limited (HTTP 429). Use 500px thumbnails, a descriptive User-Agent and long back-offs. |

## 8. Settled, do not reopen

- The in-browser `scripts/browser-qc-*.js` sweeps were removed (Josh, 2026-10-05: they served no purpose). Lectionary correctness is checked by `scripts/lectionary/audit_lectionary.py` instead.
- Orthodox hymn-text gaps (Octoechos, Triodion/Holy Week, Menaion canons, Paschal Hours) are documented gaps with no licensed source: Lambertsen is personal-use only, Hapgood has none of it. Re-verified 2026-10-05; do not build without a new source decision.

- Charter section 11 is closed: all four original traditions carry all three explanatory depths.
- Depth 1 on by default; higher depths user-selectable. Middle Friday is the Friday of the fourth
  week of the Great Fast. The Fast Evening Service is built.
- Sidebar headings are "Office Settings"; every screen has a dark-mode toggle; the "I'm not sure"
  option routing to Anglican is intentional; in-office tradition selectors are forbidden.
- Do not use git authorship as provenance evidence.
- The EOR and OOR calendar sweeps are closed. Fix wrong stored dates; do not just flag them.
- The Bible-corpus translation audit (KJV/KJVA, DRB, NRSV, NABRE, Rotherham) is done.
- The ordinary-cycle Horologion office audit (14 offices) is done. "Horologion" means two things:
  the physical book (ordinary weekly cycle, the "complete" claim) and `js/horologion-engine.js`
  (which also renders Menaion integration points). Never conflate them without saying so.
- Defaults/Modes consolidation and Interhour gating are closed. Tradition-selector naming: the
  same five labels everywhere (profile dropdown, entry cards, selector, Book of Needs scope), but see
  the 2026-10-06 rule in section 6 for what each label names. The Gloria Patri/Kyrie "duplication" item
  is closed.
- Mobile prayer-reading window maximized (2026-09-28).
- Curatorial decisions recorded 2026-10-02 and not to be revisited: Charles Wesley's 12-18 is a
  deliberate birthday observance (the received joint commemoration with John stays on 03-03);
  Basil+Gregory on 01-02 with Gregory on 05-09 and Basil on 06-14 as additional observances;
  Joshua the Prophet on 07-03 is a deliberate Great Church supplementation (Coptic Synaxarium,
  Paona 26); 09-14 Holy Cross with Albert of Jerusalem and 04-30 James son of Zebedee are
  intentional.

## 9. Useful specifics

- Fresh clone: `git clone https://github.com/JWJeffery/PrayerAppNew.git`
- Dev server: `node scripts/dev-spa-server.mjs` (port 3000). Playwright is available for browser
  checks.
- Explanations harness: `node scripts/explanations/verify_explanations.js` (needs
  `npm install jsdom --no-save`; remove `node_modules` changes and restore `package-lock.json`
  before committing).
- Sanctoral harness: `node scripts/saints/verify_sanctoral.js` (117/124 Church of the East
  acceptance matches is the known baseline).
- After any sequence edit: zero dangling component refs, all JSON valid, `node --check
  js/office-ui.js` and `node --check js/saints-resolver.js`.
- Regression-testing `js/saints-resolver.js`: it is an IIFE attaching `global.SaintsResolver`;
  `require` it in Node after `global.window = global` and stub the engine globals it touches
  (`EthiopianCalendar`, `EastSyriacCalendar`, `ByzantinePaschalion`); test across edge-case years.
- Fast Ramsha placeholders are resolved in `js/office-ui.js` by substring match against the day's
  ordinary ramsha sequence; an unresolvable marker fails loudly by design.
- Install banner (2026-10-07): `js/install-prompt.js` + `css/install-prompt.css`; a dismissible banner for phone browsers (second visit on, device-specific steps; Android uses the browser's own Install button), plus an always-on "Install this app" section in the profile panel. The `/parish/` reader pages (home, diocese) show a "Get the app" header link to phones only (`parish/get-app.js`), which opens the app at `?install=1` to show the steps. Test: `npm run test:install-prompt`. A phone keeps showing the OLD icon/manifest until its old service worker updates (accept "Update now", reopen); the zips are not the cause.
- Opening screen (2026-10-07): `css/splash.css` + `js/splash.js` + the `#uo-splash` markup at the top of `index.html`; "The Universal Office" plays ~5 seconds, then shows "Tap to continue" and waits (it never auto-advances; Josh asked for this), once per browser session (tap, Enter, Space or Escape moves on; still version for reduced motion; skipped in automated browsers unless `?splash=force`). Test: `npm run test:splash`. The brief big-icon flash before it is Android's own launch screen (icon on the manifest `background_color`, now deep navy); it cannot be replaced.
- The cross is drawn after the Canterbury cross in Josh's icon (flared horned arms, a cream triangle and triquetra in each arm). The Western and Eastern cards on the tradition-entry screen show a Latin and an Orthodox (slanted footrest) cross.
Web release: `npm run release:web` builds a static export that Josh uploads by hand (it splits
  into four zips when over ~30MB: Breviary data, other data, saint icons, app shell). There is no auto-deploy.
- Old narrative detail: `documentation/project-history/INDEX.md`, nine HISTORICAL volumes
  (2026-07-06 to 2026-10-06).
