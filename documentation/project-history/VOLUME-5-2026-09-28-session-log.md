**HISTORICAL — NOT CURRENT STATE. Statements below may be superseded; current status is in the live `RESUME_PROJECT_NOTE.md`.**

<!-- Split out of the live RESUME_PROJECT_NOTE.md on 2026-09-28, same day, when the note had
re-bloated to 879 lines of mixed current/historical material -- the fourth time this has happened
(see documentation/project-history/INDEX.md and the live note's own header). Content below is
preserved verbatim from that file; only this banner and the section dividers between originally
non-contiguous ranges were added. See INDEX.md for what this volume covers. -->

# Volume 5 -- 2026-09-28, session-log detail split out of RESUME_PROJECT_NOTE.md

## Defaults/Modes consolidation and Interhour gating — CLOSED 2026-09-28 (continued)

**Branch-tracking gap, worth flagging so it doesn't happen again:** the session that built this
(commits `eb2aa9c`/`85c96ad`) worked on `claude/prayerappnew-project-4mvez9`. That branch was never
opened as a PR and was not merged into `main` before a *different*, parallel same-day session (the
mobile prayer-window audit, `97a0374`) merged straight to `main`. So for a few hours `main` and this
note disagreed about what was actually done — Josh asked about it and had to be walked through the
history to find the unmerged branch. **Fixed this session**: `claude/prayerappnew-project-4mvez9` was
fast-forward-merged into the current session branch (no conflicts — it already contained `main`'s tip
as an ancestor), so both pieces of work are now together on top of `main`. **Lesson for future
sessions**: before telling Josh something is "done and pushed," confirm it's pushed to a branch that
either *is* `main` or has an open PR against it — a push to an orphan feature branch with no PR is
easy to lose track of.

**Both fixes from Josh's screenshot of the Byzantine office picker are now fully done and verified:**

1. **Interhours hidden when not appointed.** `HorologionEngine.isInterhourAppointed(dateObj)`
   (`js/horologion-engine.js`) + `js/office-ui.js`'s `_updateHorologionOfficeButtons()` hide/disable
   the four Interhour rows on ordinary days, falling back to
   `_defaultHorologionOfficeForCurrentTime()` if the hidden office was selected. Live-verified:
   hidden 2026-09-28, visible 2026-06-08 (Apostles' Fast day 1), correctly re-hides and falls back
   when navigating back.

2. **"Defaults" removed, "Back to Modes" renamed to "Explore other Offices," hidden by default,
   toggled from Office Settings.** `office-profile-defaults-button` is gone from the DOM entirely.
   The single global button (`#app-mode-return-button`) is renamed and hidden unless
   `isExploreOtherOfficesVisible()` (localStorage key `uoExploreOtherOfficesVisible`) is true, via a
   checkbox row in `js/office-drawer.js`'s `buildKeep()` wired to `#toggle-explore-other-offices` in
   `index.html`. **The one previously-unverified step — opening the Office Settings drawer and
   actually clicking the new checkbox — was completed this session** (headless Chromium against
   `npm run start:spa`, script at `/tmp/.../scratchpad/verify-explore-toggle.mjs`, session-local):
   confirmed the drawer row renders, toggling it on both flips the hidden checkbox and makes the
   button visible with the correct label, clicking the button correctly returns to the mode-selection
   splash, the setting persists across leaving and re-entering an office, and toggling back off hides
   the button again. No console errors beyond the pre-existing, already-documented sandbox-proxy
   `ERR_CERT_AUTHORITY_INVALID`. Nothing left open on either fix.

Still not acted on: `scripts/browser-qc-user-profile-defaults-sweep.js` had its now-obsolete
Defaults-button check removed; a handful of *other* `scripts/audit-*.mjs` files
(`audit-shared-mode-navigation-grammar`, `audit-app-navigation-architecture`,
`audit-shared-office-sidebars`) were run to confirm no *new* regressions from this change — they do
have pre-existing, unrelated failures (stale `ethiopian-saatat` mode references, missing CSS
markers) that predate this session and were not touched or investigated further.

---

**THE PROFILE/USER SYSTEM — BUILT, 2026-09-28 continued yet again.** The TODO below (originally
"not designed, not scoped, not estimated") is now built and live-verified end to end, after Josh
answered its three open scoping questions directly: (1) role field reuses the EXISTING Book of
Needs role ladder (`ministryRole`) rather than a parallel taxonomy; (2) super-user is a soft/
cosmetic gate for now, real server-side auth explicitly deferred; (3) built as one pass, not phased.

**What actually shipped, all on `UNIVERSAL_OFFICE_USER_PROFILE_DEFAULTS`
(`js/office-ui.js`) — extending the existing per-browser profile, not a second parallel system:**
- **`displayName`** — free-text name, set via the onboarding prompt or the profile-defaults panel.
- **`isSuperUser`** — soft/cosmetic boolean, explicitly NOT real access control (this app has no
  server-side auth; localStorage is editable by any visitor). The toggle itself lives ONLY in the
  Admin Console (`admin/admin.html`'s new "Super-user Flag" panel — reads/writes the same
  `universalOffice.userProfile.v1` key directly, since that page doesn't load `js/office-ui.js`),
  never on the public onboarding/profile-defaults panel, so a casual visitor doesn't stumble into
  flipping it for themselves. Real enforcement is still explicitly future work, not solved here.
- **Bible Browser gated to `isSuperUser`** — it previously had NO gating at all, unlike the
  adjacent Admin Console button. The button (`#app-bible-browser-btn`) is now `hidden` by default
  and only shown when `isSuperUser` is true (`syncBibleBrowserSuperUserGate()`); `openBibleBrowser()`
  itself also refuses at its own entry point (covers the `/tools/bible` URL auto-restore path too,
  which never went through the button).
- **`cycleOfPrayerDiocese`/`cycleOfPrayerParish`** — diocese/parish selection, resolving against
  the `data/cycles-of-prayer/` corpus built earlier this session. Diocese picker + dynamically-
  populated parish picker in the profile-defaults panel (`js/cycles-of-prayer.js` handles
  load/cache/resolve — reused, not rebuilt, from an earlier same-session attempt that was correctly
  reverted for being unconfirmed at the time). Wired into the BCP "authorized intercessions" rubric
  (`renderCycleOfPrayerLine()`): when a diocese is set, the OFFICE's own displayed date (never
  "today") resolves that week's real subject(s) and renders them right after the static rubric
  line, with a "This is your own parish's week" note when the resolved week names the declared
  home parish. No diocese declared -> renders nothing extra, exactly today's prior behavior.
- **One-time onboarding prompt** (`#uo-onboarding-prompt`) — shown once per browser profile, after
  the existing tradition-entry routing has already decided where to land (never races it, never
  re-asks the tradition question). Echoes back whatever tradition is already on file, then asks
  name + role (the role `<select>` clones its own `<option>` list live from
  `#profile-ministry-role`'s real DOM, so it can never drift out of sync with it). `Save` and
  `Skip for now` both set `onboardingComplete: true`, so it never reappears on its own; the person
  can still edit name/role any time from the profile-defaults panel afterward.

**Verified live in headless Chromium, 19 checks + 4 admin-console checks, all passing, zero
console errors:** fresh-load onboarding prompt appears once and never again after submit/skip/
reload; name+role save and echo back correctly in the profile panel; diocese selection populates
exactly 63 real parishes; a real office date (Jan 4 2026) renders the real Cycle of Prayer line
("Albany, St. Alban") with the home-parish note; a *different* date (Jan 11 2026, Ashland Trinity)
renders correctly without falsely claiming the home-parish match; Bible Browser is hidden by
default, becomes visible and actually opens once `isSuperUser` is set, hides again and refuses a
direct `openBibleBrowser()` call once unset; the Admin Console toggle writes the same localStorage
key index.html reads, confirmed cross-page. `node --check` clean on every changed `.js` file.

**`scripts/audit-user-profile-browser-qc-runner.mjs` deleted, 2026-09-28 continued once more,
per Josh's explicit call after asking what it was for.** It never actually ran a browser test —
it opened `scripts/browser-qc-user-profile-defaults-sweep.js` (the real test, meant to be run in
an actual browser) as plain text and checked that certain phrases/code snippets were still present
in it, as a cheap proxy for "did someone quietly gut this test." It was flagging 4 markers
("Office Defaults action opens local defaults panel," etc.) referencing a button an unrelated,
earlier commit (`eb2aa9c`) had already correctly removed — so it was actively wrong, and checked
confirmed it wasn't wired into anything (no CI, no pre-commit hook, nothing else in this repo runs
it) — its failure had zero real consequence, only cost of upkeep every time the real test
legitimately changed. Removed the script and its `npm run audit:user-profile-browser-qc-runner`
entry in `package.json`; the real test file (`browser-qc-user-profile-defaults-sweep.js`) is
untouched and still exists to be run in an actual browser.

Files touched: `js/office-ui.js`, `js/cycles-of-prayer.js` (new), `js/bible-browser/bible-browser.js`,
`index.html`, `css/office.css`, `admin/admin.html`, `package.json`; `scripts/audit-user-profile-
browser-qc-runner.mjs` deleted.

---

**A screenshot of the Venite app (Forward Movement's Episcopal daily office app) was shown 2026-09-28
(continued) as a location reference, NOT a design to copy — confirmed explicitly by Josh: "I know that
Venite does not fill it with prayer text. But that is where I want it."** In Venite, immediately after
the same two rubric lines this project already has ("Here may be sung a hymn or anthem." / "Authorized
intercessions and thanksgivings may follow."), it shows a "PRAYERS AND THANKSGIVINGS" link and a
"MEDITATE FOR [N] minutes" timer control — that is Venite's own choice for how to fill this rubric slot
and is explicitly NOT what this project should build. **What Josh wants at this exact slot (same
location, after "A Prayer for Mission," same two rubric lines already in place) is actual prayer
text** — the Diocese/Parish-driven Communion/Provincial/Diocesan/Parish cycle-of-prayer content
described above, not a link or a timer. The screenshot's only purpose was to confirm the insertion
point, which this project already has correct.

---

**Documentation/governance cleanup — SCOPE REDUCED 2026-09-28 (continued), per Josh's direct
instruction: "AUDIT_GOVERNANCE_LEDGER.md (23,500+ lines), AUDIT_SOURCE_VERIFICATION.md can be skipped
as part of this."** Scattered continuity/status documents (this note's own prior sprawl, dated archive
files, ad hoc structure snapshots) are being consolidated into `documentation/project-history/` — see
its `INDEX.md`. This note has been rewritten repeatedly as part of that effort. **Within the reduced
scope, both remaining pieces are now handled:** `project_roadmap.json`'s governance questions were
inventoried this session (3 stale `blocks_beta` questions removed outright, see above); the
`data/bible/registry/bible-corpus-remediation-ledger.md` stale-vs-"fully done" contradiction is already
resolved — §8 below already states the Bible-corpus translation audit is DONE, confirmed by Josh
directly 2026-09-28, and that any document suggesting otherwise (this ledger file included) is stale
and not to be treated as current. **Do not line-by-line reconcile that 1,031-line file against the
audit** — the outcome is already settled by Josh's own direct word; reconciling it further would just
be re-litigating a closed question. `AUDIT_GOVERNANCE_LEDGER.md` and `AUDIT_SOURCE_VERIFICATION.md`
remain explicitly out of scope for this cleanup effort — do not audit them as part of this without
Josh separately asking for that.

---

**`scripts/` audit for Lucy-era dead validation scripts — DONE, not "not yet started."** This note had
it wrong. `eb94c0c` ("Remove 107 dead Bible-corpus-audit scripts from the Lucy era") already did the
real work: built a transitive reachability graph from package.json's actual npm-script entry points
(92 of 223 files genuinely reachable), verified with `node --check` and by actually running a
reachable script post-deletion, then deleted only the 107 unreachable files that were also
unambiguously Bible-corpus-audit-specific — the exact category Josh named. Five categories of
unreachable-but-not-obviously-dead files were deliberately excluded pending individual judgment
rather than swept blind; see that commit's own message for the full list (Vulgate/Roman-Breviary
boundary scripts, `scripts/saints/*`, `scripts/coe-calendar/*`, Roman Breviary build/import scripts,
`scripts/explanations/verify_explanations.js`). **Both remaining loose ends from that list closed out
2026-09-28 (continued):** `scripts/parse-officium-html.mjs` ("no clear closed subsystem, left for
individual review") is confirmed live — imported directly by `scripts/build-roman-breviary-full-sweep.mjs`
and `scripts/build-roman-breviary-oracle-blocks.mjs`, documented as core Roman Breviary tooling in
`documentation/ROMAN_BREVIARY_1960_1962_BUILDOUT.md` and multiple ledger entries. Nothing to delete.
`scripts/coptic-mcp-server.py` vs. root `coptic_mcp_server.py` ("a likely stale duplicate, not deleted
without confirming which one Josh actually runs") turned out not to be a stale-duplicate cleanup
question at all — the two copies had genuinely diverged in content (see this note's own git history
for that finding). Moot now regardless: Josh confirmed both were built specifically for the Coptic
Agpeya build and, with the Agpeya finished, had both deleted 2026-09-28 — see the coptic.io row in the
source-reachability table above (the root copy, `coptic_mcp_server.py`, was never part of the
`scripts/` count). 115 files remain in `scripts/`, all now accounted for.

---

**`structure.json`'s other open todos** (re-verified 2026-09-28, continued — see the file itself for
full evidence): the **Gloria Patri/Kyrie "duplication" item is now CLOSED, not open** — the prior
"still accurate" re-verification only checked that the phrase existed in multiple files, not what it
actually said. Direct text comparison found each tradition's wording is genuinely distinct and
source-cited (BCP vs. Maclean-1894-East-Syriac vs. O'Leary-1911-Coptic), and `comm-gloria-patri`/
`comm-kyrie` in `common.json` are not dead — both are live-referenced by `js/office-ui.js` (line 5097
and 5501) for the BCP lane's optional after-psalm doxology and short Kyrie versicle. There is no
cross-tradition duplication to normalize; doing so would have meant overwriting tradition-correct
translations with one, which is not a fix. `js/office-ui.js` innerHTML string-building (33 raw
writes) — still open, unaddressed. Two other todos (`rite-placeholder-fragility`,
`saints-schema-refactor`) were closed 2026-09-28 as already-fixed/obsolete respectively.

---

**`project_roadmap.json` — the 3 `blocks_beta: true` questions REMOVED outright 2026-09-28
(continued), per Josh's direct instruction ("Remove all of this trash").** `bcp-public-hardening`,
`ethiopian-release-scope`, and `hudra-release-scope` — all three orphaned (owned by "Lucy" and/or
"Marissa," neither an active role) — are deleted from `governance_questions`, not marked superseded.
Nothing left open in that file requiring an owner who no longer exists. 8 governance questions remain
in the file, none `blocks_beta: true` and open (the rest are `superseded`, `deferred`, or `answered` —
see the file itself, not re-summarized here). Phase plan: phase_3 (Roman Catholic Divine Office private
control corpus) is `active`; phases 4-8 (EO Russian/Slavic closeout, OO Ethiopian closeout, Church of
the East Hudra closeout, cross-family hardening, final beta gate) are all `not_started`.

---

**Live UI bug queue (the ad hoc "Task #N" reports Josh sends during sessions) — as of the last entries
in `documentation/project-history/VOLUME-4-2026-09-07-to-09-28.md`:**
- Task #14 — tradition-selector naming: **now genuinely, fully closed — final wording confirmed
  directly by Josh, all five lanes identical on both screens.** This went through several wrong
  intermediate states before landing here, worth recording so it doesn't get re-litigated: an
  earlier fix (`179e38f`) set mode-grid titles to the bare tradition name (Anglican, Oriental
  Orthodoxy, Catholic) while leaving Church of the East/Eastern Orthodoxy's mode-grid cards as
  "Hudra"/"Horologion" (office-book names, from a different concurrent session, still on
  `#tradition-entry` as "Church of the East"/"Eastern Orthodoxy") — a real, live mismatch that
  wasn't caught by that fix's own testing. Josh's actual final answer, given directly and applied
  now: full communion/church-body names, identical on **both** `#tradition-entry` and
  `#uo-threshold-grid`, for all five lanes —
  - **Anglican Communion** (was "Anglican")
  - **Catholic Church** (was "Catholic")
  - **Church of the East** (unchanged on the entry-card; mode-grid corrected back from "Hudra")
  - **Eastern Orthodox Church** (was "Eastern Orthodoxy" on the entry-card, "Horologion" on the
    mode-grid — both corrected to the same new name)
  - **Oriental Orthodox Church** (was "Oriental Orthodoxy" on both screens)
  Subtitles (the specific office/book name — "The Daily Office...", "Roman Breviary 1960/1962...",
  "Byzantine Horologion offices.", etc.) are unchanged; only the `<strong>`/`.app-mode-title` text
  changed on both screens.

  **First pass only fixed the two screens Josh had just been asked about and left a third,
  already-found inconsistency as a "flag it, don't fix it" note — correctly called out as
  burying a known problem instead of closing it.** Went back and grepped the entire repo (`.js`,
  `.html`, excluding historical ledger/audit-log prose, which is never rewritten) for every one of
  the old names, rather than trusting the two screens already checked were the only ones. Found and
  fixed **six more live, user-facing spots** carrying one of the old names:
  - `#profile-tradition-default` (`index.html`) — the "Default tradition" profile dropdown, the
    original buried finding. Had its own THIRD naming set ("The Episcopal Church," "Latin
    Catholic," "Oriental Orthodoxy," "Eastern Orthodoxy").
  - `UNIVERSAL_OFFICE_TRADITION_LABELS` (`js/office-ui.js`) — feeds the "This browser opens to
    &lt;X&gt;" profile-summary sentence.
  - `OFFICE_MODE_HEADER_LABELS` (`js/office-ui.js`) — the app shell's page title while an office is
    open (`#office-mode-title`).
  - `BOOK_OF_NEEDS_TRADITION_CODES` and `BOOK_OF_NEEDS_CONTEXTS`'s `label`/`note`/`empty` fields
    (`js/prayers.js`) — Book of Needs' own tradition-scoped headers and copy.
  - `TA_DISPLAY_NAMES` (`admin/admin.html`) — the admin Tradition Availability panel. Also fixed a
    second, independent staleness bug found in the same object while touching it: `latin-catholic`
    still said "(Liturgy of the Hours)," a lane abandoned 2026-09-27 in favor of the Roman Breviary
    1960/1962 (`project_roadmap.json`'s `catholic-first-profile` `superseded_note`) — left alone,
    this would have kept lying to whoever reads that admin panel next.
  - Four `scripts/browser-qc-*.js` files whose assertions hard-coded the old rendered strings —
    left as-is, these would have started failing (or worse, silently stopped testing what they
    claimed to) the next time anyone actually ran them against the renamed UI.

  **Josh overrode the "deliberately left alone" call above for `data/explanations/*.json`'s
  `traditionLabel` fields — correctly: a separate naming convention is still the same naming
  problem if a user can see two different names for their own tradition anywhere in this app.**
  Fixed all five: `anglican.json` "Anglican" → **Anglican Communion**; `byzantine.json` "Byzantine"
  → **Eastern Orthodox Church**; `coptic.json` "Coptic Orthodox" → **Oriental Orthodox Church**;
  `latin.json` "Latin Catholic" → **Catholic Church**; `east-syriac.json` already said "Church of
  the East", unchanged. The " — Office (detail)" suffix (e.g. "— The Horologion (Slavic
  recension)") is untouched; only the tradition-name prefix changed. Also normalized
  `js/prayers.js`'s Book of Needs prose that used the slash form "Anglican/Episcopal" to plain
  "Anglican", matching the adjectival pattern the other four traditions already used there.
  Verified live: `Explanations.load(code).traditionLabel` returns the new text for all five codes
  (ANG/BYZC/OOR-COP/COE/LAT), zero console errors. `data/explanations/{anglican,byzantine,coptic,
  latin}.json`, `js/prayers.js`, and `scripts/browser-qc-book-of-needs-routing-sweep.js` are the
  files touched in this pass.

  **Still deliberately left alone — stated here plainly, not buried, so it's a known, visible
  carve-out rather than a silently-skipped item:** `structure.json`/`project_roadmap.json`'s
  `browser_qc.covered` arrays (e.g. "Eastern Orthodoxy / Horologion sidebar close/restore") are
  frozen result logs of specific past QC runs, and `structure.json`'s top-level `decision` field
  is the original onboarding-design narrative — both are historical record of what was true/tested
  *at the time*, the same category as this ledger's own dated session entries, which this project's
  standing rule says are never rewritten after the fact. `project_roadmap.json`'s `roman_loth`
  section's `"ui_label": "Latin Catholic"` is dead metadata inside an already-`SUPERSEDED`/abandoned
  lane (see the `catholic-first-profile` governance question), never reached by any live code path.
  `data/saints/sanctoral.json`'s two `description` fields quote a Wikipedia infobox verbatim as
  sourcing evidence — not this app's own label. `data/cycles-of-prayer/*.json`'s `body`/`diocese`
  fields correctly record a real diocese's actual legal name, a different kind of field entirely.
  None of these are a user-facing tradition selector; if any should change anyway, that's a call
  for whoever reads this next to make explicitly, not infer from silence.

  Verified live in headless Chromium after every edit: both screens list the same five names in the
  same order; the profile dropdown, profile-summary sentence, and office header (`#office-mode-title`)
  all show the new names; `selectMode('daily')` still opens the Anglican office correctly; zero
  console errors. `node --check` clean on every changed `.js` file. `index.html`, `admin/admin.html`,
  `js/office-ui.js`, `js/prayers.js`, and four `scripts/browser-qc-*.js` files are the files touched.
- Task #15 — **stale row, actually CLOSED.** This note had it as "not yet picked back up," but
  `4e0f6d0` ("Fix task #15 for real...") already shipped the outer-budget `max-height` fix to
  `css/office-shell.css` and is already on `main` (an ancestor of the mobile-audit merge, `97a0374`).
  Re-verified live 2026-09-28 (continued): zero body-level scroll on `#uo-threshold-grid` at
  1512×900, zero console errors. Nothing left to do here.
- All other numbered tasks (#2, #9, #10, #11) from that queue are closed as of 2026-09-28 — see Volume
  4 for evidence per item.

---

**Sanctoral (EOR/OOR) sweep — CORRECTED 2026-09-28 (continued), by Josh's direct question. This was
three different things bundled under one "paused, not active" label, and that label was wrong for the
biggest of the three.** Checked directly against the corpus, not against prose claims, after finding
the ledger's own detailed record of this had a gap (no session headers at all between 2026-06-30 and
2026-09-23 anywhere in `AUDIT_GOVERNANCE_LEDGER.md` — git history has the same gap, nothing committed
in that whole window; `07dd77f`, 2026-09-23, is a full repo restore, not organic history).

1. **The core 13-month gap-fill sweep (find commemorations missing from all 12 Coptic months plus the
   intercalary Pi Kogi Enavot, add them) — ACTUALLY DONE, 2026-09-11. Not open.** An older version of
   this note said so explicitly ("OOR 13-month gap sweep — CLOSED 2026-09-11") and that specific line
   didn't survive into the current ledger/history, but the primary evidence still does: four entries in
   `data/saints/sanctoral.json` are directly dated "Date ADDED 2026-09-11, part of the OOR gap sweep
   (Coptic month of Mesori)" and "...(intercalary month Pi Kogi Enavot / Nasie)" — the exact two
   sections an earlier ledger checkpoint (same day, 2026-09-07) had listed as the only ones still
   remaining. Stop treating this as unstarted or resumable-from-scratch; it's finished.
2. **RESOLVED 2026-09-28 (continued), by Josh's direct instruction to address it.** 17 of the 18
   "ADDED" gap-sweep entries are now CONFIRMED. The `coptic_mcp_server.py` removal (§6) turned out not
   to block this: `api.coptic.io`'s underlying REST API is still directly reachable over plain HTTPS
   without any MCP wrapper (`WebFetch` against `api.coptic.io/api/synaxarium/<YYYY-MM-DD>` and
   `.../search/query?q=<name>` both work). Checked all 18 against it directly; 17 matched exactly and
   their `ruleSource` fields now say `CONFIRMED against coptic.io 2026-09-28` instead of "NOT YET
   CROSS-CHECKED." **One exception, disclosed rather than forced to match: `saint-onesiphorus-of-the-
   seventy`** (Apr 3) — coptic.io's search returns zero results for "Onesiphorus" or "Onesiphorous"
   (the search endpoint works correctly for other names, confirmed against 'Hezekiah'), and its date
   endpoint for April 3 shows two unrelated commemorations across 2024/2025/2026 alike, no trace of this
   figure. May mean coptic.io's own data genuinely omits him, not that the corpus's date is wrong — not
   resolved either way. Remains ADDED on Wikipedia/St-Takla.org sourcing alone; its own `ruleSource` now
   states this plainly instead of just "not yet checked." Zero remaining "NOT YET CROSS-CHECKED" strings
   in `sanctoral.json` — verified by direct grep after the edits.
3. **RESOLVED 2026-09-28 (continued), by Josh's direct instruction to address it — 13 of 15
   same-figure-different-day questions closed, 2 genuinely need Josh's own call.** The underlying
   detail behind this list (what each question actually was) had itself gone missing from both the
   ledger and `documentation/project-history/` — the "dates and specifics in Volume 4" pointer this
   note used to carry was stale; Volume 4 doesn't contain them. Recovered the full list from this
   session's own earlier reading of an older version of this note, before it was overwritten.

   **3 were already resolved, just never crossed off** — Bartholomew, Amos, and Clement of Rome each
   already carry a working `traditionObservance` entry (`OOR:Coptic`) from earlier sessions (2026-09-07),
   correctly giving them a separate Coptic-specific date without disturbing their Western/EOR date.

   **10 more resolved this session, same mechanism, each confirmed against coptic.io directly first:**
   Seven Holy Youths of Ephesus (OOR:Coptic Aug 26), Prophet Micah (Aug 28), Prophet Malachias (Sep 5),
   Bessarion (Aug 31 — reasonable but not ironclad identity match between "the Wonderworker" (EOR) and
   "the Great" (Coptic), flag if a future session finds evidence of two distinct Bessarions), Holy
   Prophet Moses (Sep 18), Hilarion the Great (Nov 3), The Holy Innocents (Jan 11 — this one had been
   incorrectly marked "OOR TAG WITHDRAWN: no Coptic attestation found" in 2026-09-07; that search just
   used the wrong phrasing and missed a real, unambiguous entry), Anthony the Great (Jan 30, distinct
   from the existing separate relics-translation row at Sep 25), Timothy the Apostle (Jan 31), and
   Gregory Thaumaturgus/of Neocaesarea (Nov 30 — missed from the original list, found while verifying
   the others, same fix applied). Each row's `oorDateNote` cites the exact coptic.io text matched.

   **Both resolved 2026-09-28 (continued), Josh's direct decisions:**
   - **Julietta/Cyriacus — RESOLVED.** Josh: "it sounds like they need a tradition observance split."
     Added `OOR:Coptic` (Jul 22) to the existing joint `mar-cyriacus-and-julitta` row (COE, Jul 15), plus
     the `OOR` tag — CONFIRMED against coptic.io: Jul 22 (15 Epip) is "The Martyrdom of St. Cyriacus and
     St. Julietta His Mother," the joint commemoration, matching this row's own joint identity exactly.
     Not touched, deliberately out of scope for this fix: coptic.io's other two entries — Cyriacus alone
     (~Nov 12, already covered by the existing separate `saint-cyriacus` row) and Julietta alone (Aug
     12, not covered anywhere) — noted in the row's own `oorDateNote` so they aren't lost.
   - **St Anne (Nov 20) — RESOLVED.** Josh: "For the Copts, use Nov 20. For the West, use the western
     date." Added `OOR:Coptic` (Nov 20) to `saint-joachim-and-saint-anne`'s existing
     `traditionObservance` object, alongside its EOR entry (Sep 9). ANG/LAT keep the shared Jul 26 date,
     unaffected — attached to the joint row per Josh's explicit choice, not split into a separate
     Anne-only row.

   VERIFIED: `data/saints/sanctoral.json` re-validated after each edit (one edit introduced a duplicate
   `traditionObservance` key, caught and fixed immediately by re-reading the entry, not just the parser);
   entry count unchanged at 1067 throughout — every fix was a field addition to an existing row, never a
   new or removed row.

**The 58-duplicate-`id` item (found 2026-09-07) is now RESOLVED, 2026-09-28** — investigated
properly for the first time rather than just re-counted. Found 42 duplicate-id groups (87 rows;
count differs slightly from the original 58, likely file drift since 2026-09-07). Checked every
group for the one thing that would make a shared id a real bug — an exact (id, date) collision, or
the id secretly covering two different people — not just presence of the same id string. **Zero
exact (id, date) collisions.** All but two groups are the corpus's normal, intentional pattern: the
same historical figure commemorated on genuinely different dates in different traditions (already
documented throughout this file's own entries as expected, not a defect). **Two groups were real id
collisions between different identities, both self-disclosed by the data's own text, not asserted
from outside research:** `saint-boniface` covered both the Archbishop of Mainz (ANG/LAT, June 5) and
an unrelated Roman martyr under Diocletian (EOR, Dec 19) — the EOR row's own description already said
"a different figure... same name, unrelated identity." `mar-michael` covered both a human Abbot (COE,
Dec 19-ish, moveable) and the Archangel Michael (COE, "Sunday of the Sixth Week of the Fast" —
verified 7/7 years against the Diocese of Western Europe calendar) — these can even land on the exact
same real date in a given year (both resolve to 2026-03-22). **Fixed:** split into
`saint-boniface-of-tarsus` and `mar-michael-archangel` respectively (no content/date changed, id only);
`js/coe-eligibility.js`'s Layer 3 allowlist updated to keep `mar-michael-archangel` displaying (the
allowlist gates by id, so a bare rename would have silently hidden the Archangel). Verified:
`data/saints/sanctoral.json` and `js/coe-eligibility.js` remain valid; entry count unchanged at 1068
(no rows lost); `CoeEligibility.isEligible()` confirmed true for both `mar-michael` and
`mar-michael-archangel` after the allowlist update. Also normalized five pure capitalization
inconsistencies found in the same pass (e.g. "Saint James The Brother Of The Lord" →
"...the Brother of the Lord", "St. John the Baptist" → "Saint John the Baptist" to match this
corpus's dominant style) — cosmetic only, same identity confirmed on both sides in every case.

**`mar-abraham` — RESOLVED 2026-09-28 (continued), by Josh's direct request to research it rather
than leave it flagged.** Corrected a mis-scoped first pass: only ONE of the two `mar-abraham` rows was
actually dated May 2 (fixed) — the properly-sourced "Doctor of the School of Nisibis" row is a
moveable date (cycle: subara week 3, weekday 5, dayLegacy Dec 18/20), not May 2 at all; the earlier
write-up here wrongly said both rows shared the date. The real collision was between the thin
"Catholicos and missionary" row (fixed May 2, dayLegacy inconsistently "August 23" — a leftover field
that never matched its own May 2 date) and the separately-sourced `mar-abraham-of-kashkar` (also fixed
May 2). Settled with a primary-source check, not textual inference alone: both years the "Catholicos
and missionary" row cited as its own evidence — the actual ACOE Diocese of California 2024 and 2026
calendar PDFs already held in `data/kalendar/source-witnesses/` (`2024 full.pdf`, `2026cal.pdf`) —
were read directly. **Neither prints any "Catholicos and missionary" commemoration on May 2, or
anywhere else, for anyone named Abraham.** Both years print exactly one Abraham entry on that date:
"Commemoration of Mar Abraham of Kashkar" — nothing else. The claimed citation was false. Textual
history corroborates the same conclusion independently: `mar-abraham-of-kashkar`'s own `ruleSource`
says its content was "carried over 2026-09-12 from the superseded duplicate row of this same identity
before it was removed" — describing exactly this row, which evidently never actually got deleted in
that 2026-09-12 cleanup, just orphaned under the bare `mar-abraham` id. **FIXED: the "Catholicos and
missionary" row deleted outright** (not merged, not re-sourced — it had no real content to preserve;
`mar-abraham-of-kashkar` already fully and correctly covers this May 2 commemoration). `mar-abraham`
now holds exactly one row (Doctor of the School of Nisibis, Dec 18/20, confirmed printed in both
years). Entry count and JSON validity re-verified after the edit.

**CORRECTION 2026-09-28 (continued): "Mar Abraham of Qidun... genuinely absent from this corpus under
any id" above was wrong — it's already there.** Josh said "add him"; before writing a new row, checked
for an id collision first and found `mar-abraham-of-qidun` already exists, correctly sourced (same two
ACOE Diocese of California PDFs, same Dec 14 date), predating the 2026-09-23 full-repo restore per git
blame. The earlier claim was an unverified assumption stated as a finding — exactly the failure mode
this project's own standing rules exist to catch — not a check that was actually run against the
corpus at the time. No row added; nothing to do here.
