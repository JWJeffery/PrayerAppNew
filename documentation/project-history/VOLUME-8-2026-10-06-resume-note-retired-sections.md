# Volume 8 — Resume-note material retired 2026-10-06, and that day's session log (HISTORICAL)

**HISTORICAL — NOT CURRENT STATE.** Split verbatim out of the live `RESUME_PROJECT_NOTE.md` on
2026-10-06 when the note was refreshed. For current status read the live note at the repo root.

## A. Passage retired from section 5, item 2 ("Offline delivery"), verbatim

2. **Offline delivery:** installable offline website first (service worker, manifest, generated data
   pack), then Capacitor iOS/Android apps once Josh has Apple/Google accounts (he has neither yet).
   **Offline website is built (2026-10-04):** `npm run release:web` now also writes `sw.js` (Workbox) that
   keeps the app and all text on the device (668 files, ~70 MB, versioned by hash; Roman Breviary engine data
   included); icons download once on first Orthodox entry (`js/offline-packs.js`); `manifest.webmanifest`
   makes it installable (placeholder cross icon in `images/app/`, Josh to replace). `npm run test:offline`
   (needs `npm run release:web` first) cuts the network and opens all five traditions. The release also now
   ships `assets/fonts` (they were missing before). **Roman Breviary now uses the shared Office Settings drawer** (date stepper, the eight hours, Language, Explanations) like every other lane; its own inline Date/Hour/Language form is gone (`renderRomanBreviary()` in `js/office-ui.js`). **Anglican saint panel** no longer shows catalogue metadata (tradition code, source witnesses); it shows the saint's name, description and designation/period. Richer saint biographies for the Anglican/Roman calendars do not exist in the data yet (only one-line descriptions); the Menaion lives are the model. **Update prompt (`js/update-prompt.js`):** when a new release has downloaded, a small notice offers
   "Update now" / "Later"; the app also checks for new releases on returning to the foreground and hourly. Not done: password-protected hosting can block the manifest/service worker, see
   documentation/ROMAN_BREVIARY_COMPONENT_ENGINE_PLAN.md section 17.
   All five traditions ship, with their **full text bundled** (works offline from first launch); **icons are not bundled**: they download on first use of the Orthodox side and are then kept for offline use (Josh, 2026-10-04; saint icons are ~27 MB). JSON stays the source of truth; a database is a later option only if
   measured. Scripture in the public app is limited to passages cited in the prayers (Bible browser
   stays admin-only); Josh judges the NRSV discrete-passage use licensed (his call, not verified by
   us). Record: `documentation/JSON_TO_DATABASE_SCOPING.md`.

## B. Session log, 2026-10-06 (PR #118 and its follow-up)

Josh sent five phone screenshots of the live site (12:19, 20:53, 20:54, 20:55, 20:56) with four
points: the top of an office should show the office name, not the church name; The Episcopal Church
is a church within a tradition, not the tradition; the Book of Needs button should not be backlit;
the profile panel extended past the frame.

- Found that the mobile pass (commit 3ee4735, 2026-10-05) had already fixed the profile overflow and
  the white Book of Needs pill; the earlier screenshots predated the deploy. Verified in Chromium at
  360px (light and dark): profile 16-344px, no horizontal scroll; Book of Needs background
  `rgba(0,0,0,0)` after a tap. Hardened the button anyway (focus/active/tap-highlight) in
  `css/office-shell.css`.
- Office header labels changed from church names to office names; tradition labels for the Anglican
  lane changed from "The Episcopal Church" to "Anglican" in `index.html`, `js/office-ui.js`,
  `js/prayers.js`, `documentation/book-of-needs-source-governance.json`.
- PR #118 merged (`96b80fd`). Quality control afterwards found three misses, fixed in the follow-up
  PR: cache-bust params not bumped (css/office-shell.css v329->330, js/office-ui.js v330->331,
  js/prayers.js v222->223); code comments above the label tables still said the label names The
  Episcopal Church; and the resume note itself was stale (said phase 6 was next, said merges were
  fast-forwards, called tradition naming closed).
- `npm run audit:book-of-needs-taxonomy`: 14 checks pass. `node --check` clean on the edited JS.
- Older 2026-10-04 details moved here from the note: the Roman Breviary now uses the shared Office
  Settings drawer (date stepper, the eight hours, Language, Explanations) like every other lane, its
  own inline Date/Hour/Language form is gone (`renderRomanBreviary()` in `js/office-ui.js`); the
  Anglican saint panel no longer shows catalogue metadata (tradition code, source witnesses) and
  shows the saint's name, description and designation/period; richer Anglican/Roman saint
  biographies do not exist in the data yet (one-line descriptions only), the Menaion lives are the
  model; the update prompt also checks for new releases on returning to the foreground and hourly.

## Retired from the live note on 2026-10-06 (end of day prune), verbatim

### Section 5, "Active direction" (before it was condensed)

**Active direction (Josh, 2026-10-03), in this order:**
1. **Roman Breviary rebuild** as liturgy-shaped components plus a JS rubrics engine (any year, Latin
   and English, Rubrics 1960 only, engine wins over Divinum when the rubrics support it). Plan and
   decisions: `documentation/ROMAN_BREVIARY_COMPONENT_ENGINE_PLAN.md`. **Phases 1-5 are done (2026-10-04):** pinned mirror
   completed; 3,890 files as lossless JSON in `data/roman-breviary-1960-1962/components/`
   (`npm run audit:roman-breviary-components`); `js/roman-breviary/` decides the office, fills and expands
   every hour (Latin and English) and the app now runs on it for any date 1900-2100. Verified against the
   Perl engine and the audited stored data (plan doc sections 12-16; tests `npm run test:roman-breviary-
   script|render|blocks`; engine clone for tests: `npm run roman-breviary:engine:setup`). Old
   `units/`/`manifests/` stay as fixtures and fallback, not shipped. **Phase 6 (offline data pack) is
   done, see item 2.** **The "Rubrics 1960 - 2020 USA" calendar variant is built (2026-10-06)** as a Calendar setting in the Roman
   Breviary drawer and profile, verified against the Perl engine (plan doc section 18).
2. **Offline delivery:** installable offline website is **built (2026-10-04)**: `npm run release:web`
   writes `sw.js` (Workbox, versioned by hash) so the app and all text work offline from first launch;
   icons (~27 MB) download once on first Orthodox entry (`js/offline-packs.js`) and are then kept;
   `manifest.webmanifest` makes it installable (placeholder icon, see Josh's own hands); `js/update-prompt.js` offers "Update now / Later" when a new release has downloaded.
   `npm run test:offline` (needs `npm run release:web` first) cuts the network and opens all five
   traditions. **Not done:** Capacitor iOS/Android apps (gated on Josh getting Apple/Google accounts,
   he has neither); password-protected hosting can block the manifest/service worker (plan doc
   section 17). JSON stays the source of truth; a database is a later option only if measured.
   Scripture in the public app is limited to passages cited in the prayers (Bible browser stays
   admin-only); Josh judges the NRSV discrete-passage use licensed (his call, not verified by us).
   Records: `documentation/JSON_TO_DATABASE_SCOPING.md`, `ROMAN_BREVIARY_COMPONENT_ENGINE_PLAN.md`.
   Smaller 2026-10-04 changes (Roman Breviary on the shared Office Settings drawer, Anglican saint
   panel without catalogue metadata, no Anglican/Roman saint biographies in the data yet) are in
   history Volume 8.

### Section 6, Menaion / Anglican Synaxarium / Cycles of Prayer paragraphs

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

### Section 6, Roman Breviary paragraph

**Roman Breviary 1960/1962** is shipped and runs on the in-browser engine (all 8 hours, Latin and English, any
date 1900-2100, generated from Divinum Officium at a pinned commit), with a Calendar setting for Rubrics 1960
or Rubrics 1960 - 2020 USA (PR #120, merged 2026-10-06). To test the variant: `DO_VERSION="Rubrics 1960 - 2020 USA"`
before `test:roman-breviary-calendar|render` (unset means 1960). All 8 hours verified for 2026 (Latin, English),
2027 (Latin, English), 2031, 2038, 1999 (Latin); calendar decisions for 1900-2100 samples. Plan doc section 18.
See `documentation/ROMAN_BREVIARY_1960_1962_BUILDOUT.md`.
The modern Liturgy of the Hours lane was abandoned by Josh on 2026-09-27.

### Section 6, Housekeeping paragraph

**Housekeeping.** `AUDIT_GOVERNANCE_LEDGER.md` and `AUDIT_SOURCE_VERIFICATION.md` are out of scope
for any documentation cleanup unless Josh asks. `structure.json`'s innerHTML item is mitigated
(audited 2026-10-02). The three stale navigation audit scripts were retired to
`scripts/retired-audits/`. PR #110 (merged 2026-10-03) removed 57 more stale audit scripts and the
source-lane adapter audit, and added the 25 Maclean Church of the East prayers to the Book of Needs
menu (only one of the 25 was browser-tested).
