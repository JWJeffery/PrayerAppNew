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
