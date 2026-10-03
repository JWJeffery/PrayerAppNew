# RESUME_PROJECT_NOTE.md

**Paste this at the start of a new conversation.** It is a handoff, not a history: current rules,
current state, and the short list of things that are actually open. Everything closed lives in
`documentation/project-history/` (start at `INDEX.md`) and `AUDIT_GOVERNANCE_LEDGER.md`; anything
there is HISTORICAL and is marked so. **Where this note and the repo disagree, the repo wins.**

**Cleaned and pruned 2026-10-03** at Josh's request (~510 -> ~220 lines). The retired sections went
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
  Do not open a PR unless asked. **Merging to `main` only on Josh's explicit word** (he has said
  "merge to main" each time; the merges have been fast-forwards).
- Fetch and check `git log --oneline -1` before building on a branch.
- Validate JSON before writing; prefer targeted edits to bulk dumps. For bulk edits to
  `data/saints/sanctoral.json` key on `(id, month, day)`, never `id` alone; back up first.
- Bump `?v=NNN` cache-bust params in `index.html` whenever the matching JS changes.
- Ledger/`SEED_VERSION` entries go in the same commit as the fix.
- Name exact paths when staging; do not `git add -A` blindly.
- Josh does not see background-task notifications: work synchronously and report plainly.
- Josh's preferences: no licensing lectures; specific per-source evidence; never fabricate
  liturgical text; give unambiguous landmarks for any edit he must make by hand; Daily Office
  lectionary only from the 1979 BCP (bcponline.org or justus.anglican.org PDF).
- Whole-app JSON-to-database migration: scoped and approved in direction (see section 5); build only in the order Josh set there.

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
- **Book of Needs role ladder:** whether to extend to the 8-role access-tier ladder in
  `book-of-needs-role-access-governance.json`.
- **Navigation headings:** uniform headings versus the navigation doc's allowance for local naming.

**Active direction (Josh, 2026-10-03), in this order:**
1. **Roman Breviary rebuild** as liturgy-shaped components plus a JS rubrics engine (any year, Latin
   and English, Rubrics 1960 only, engine wins over Divinum when the rubrics support it). Plan and
   decisions: `documentation/ROMAN_BREVIARY_COMPONENT_ENGINE_PLAN.md`. **Phases 1-2 are done (2026-10-03):** pinned mirror
   completed, 3,890 files as lossless JSON under `data/roman-breviary-1960-1962/components/`
   (`npm run audit:roman-breviary-components`), and a JS port of "which office wins today" in
   `js/roman-breviary/` that matches the Perl engine on every field for about 50,800 days of Lauds
   (1962-2100) and other hours (`npm run test:roman-breviary-calendar`; engine clone setup:
   `npm run roman-breviary:engine:setup`). Vespers/Compline need concurrence (phase 4). Phase 3
   (per-hour text assembly) needs Josh's go-ahead; each phase ends with a diff report. **The "Rubrics 1960 - 2020 USA" calendar variant is a planned add-on, built
   only after the 1960 engine matches the audited output** (decided 2026-10-03).
2. **Offline delivery:** installable offline website first (service worker, manifest, generated data
   pack), then Capacitor iOS/Android apps once Josh has Apple/Google accounts (he has neither yet).
   All five traditions ship. JSON stays the source of truth; a database is a later option only if
   measured. Scripture in the public app is limited to passages cited in the prayers (Bible browser
   stays admin-only); Josh judges the NRSV discrete-passage use licensed (his call, not verified by
   us). Record: `documentation/JSON_TO_DATABASE_SCOPING.md`.

**Josh's own hands (Drive):**
- Delete the Google Doc "Calendar and Admission Decisions — Corrections of 2026-10-02" (it wrongly
  says the delta has 22 records). The replacement is "Calendar and Admission Decisions" in the same
  folder.
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

**Menaion / Byzantine day layer (complete as planned, 2026-10-02).** All 360 commemorations have
original short lives; the day's fast, appointed readings, "About Today" panel, education layer,
patristic commentary and icons (212) show in Vespers/Orthros/Typika for 2026-2027, New and Old
Calendar. Orloff Commons (71 rank-3 saints fully, 203 rank-4 Vespers stichera) and AGES (36 rank-3
saints; 58 rank-4 Vespers stichera) are wired. Records: `documentation/ORTHODOX_DAY.md`,
`MENAION_COMMONS_ORLOFF.md`, `MENAION_AGES.md`, `MENAION_DATA_FINDINGS.md`. The AGES ZIP is not in
the repo; re-ingesting needs Josh to re-supply it.

**Anglican Synaxarium (implemented and merged to `main`, 2026-10-02/03).** All 366 dates decided;
Josh's final approved corrections applied to the candidate matrix, SIN tables (retired SINs in
`data/kalendar/sin/retired-sins.csv`), `data/kalendar/synaxarium/decisions.json`,
`data/saints/sanctoral.json` (primary plus alternates; `angRole`, `angDateBasis`) and the review-tool
data. Records: `documentation/ANGLICAN_SYNAXARIUM_CORRECTION_PROPOSAL.md` (the implemented record)
and `ANGLICAN_SYNAXARIUM_FINDINGS.md`. Check: `python3 scripts/saints/verify-synaxarium-calendar.py`
(96 checks). Hagiographies are deliberately not in the repo.

**Cycles of Prayer.** All 92 files validate (`npm run audit:cycles-of-prayer`); Communion,
Diocesan and Parish tiers render in BCP Morning/Evening Prayer; the profile (diocese and parish
picker) is live. The only parish file is St. Bede's, Forest Grove.

**Roman Breviary 1960/1962** is shipped (all 8 hours, 2026 and 2027, Latin and English, generated
from Divinum Officium at a pinned commit, but as stored per-date output for 2026-2027 only; being rebuilt, see section 5).
See `documentation/ROMAN_BREVIARY_1960_1962_BUILDOUT.md`.
The modern Liturgy of the Hours lane was abandoned by Josh on 2026-09-27.

**Parish Prayer Requests (separate live system).** A PHP/MySQL backend plus `parish/` pages on the live
site, built on branch `claude/determined-einstein-kny5ms` (it is NOT on `main`; the repo's `main`
only has the per-parish Cycle of Prayer files above). Rectors sign in at
`theuniversaloffice.com/parish/` (emailed 6-digit code, no password) and read the join code under
"Who can follow your parish"; `/parish/admin.html` is the administrator sign-in, not the rector's.
Join codes live encrypted in the production database, not in any repo file. The first FAQ page,
`faq/index.html` (rector join-code question), exists but is deliberately not linked from the app;
wiring it in is Josh's call. Add further questions there.

**Housekeeping.** `AUDIT_GOVERNANCE_LEDGER.md` and `AUDIT_SOURCE_VERIFICATION.md` are out of scope
for any documentation cleanup unless Josh asks. `structure.json`'s innerHTML item is mitigated
(audited 2026-10-02). The three stale navigation audit scripts were retired to
`scripts/retired-audits/`. PR #110 (merged 2026-10-03) removed 57 more stale audit scripts and the
source-lane adapter audit, and added the 25 Maclean Church of the East prayers to the Book of Needs
menu (only one of the 25 was browser-tested).

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
- Defaults/Modes consolidation and Interhour gating are closed. Tradition-selector naming is
  closed (five traditions read identically everywhere). The Gloria Patri/Kyrie "duplication" item
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
- Web release: `npm run release:web` builds a static export that Josh uploads by hand (it splits
  into three zips when over ~30MB). There is no auto-deploy.
- Old narrative detail: `documentation/project-history/INDEX.md`, seven HISTORICAL volumes
  (2026-07-06 to 2026-10-03).
