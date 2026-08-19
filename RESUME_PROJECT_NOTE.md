# RESUME_PROJECT_NOTE.md

**Read this file in full via bash (not the view tool) before starting any work, and read to the
actual end -- not just until the first "DONE" marker.** Verify actual pushed state against a fresh
clone before beginning. Full historical detail for everything summarized below lives in
`RESUME_PROJECT_NOTE_HISTORICAL.md` -- this file was trimmed back down on 2026-08-19 (was 3200
lines) following the same practice used the last time it grew too large.

Session continuity for this project flows through this file and `AUDIT_GOVERNANCE_LEDGER.md`
(governance/audit history) plus `audit-ledger.html` (the live dashboard). These are authoritative;
memory across sessions is not.

---

## Session 2026-08-19 continued -- Lelya (Night Office) fully built and verified: all six ferial weekdays

Built out the Ferial Night Service using the full text obtained earlier this session (Maclean
p.85-102). 48 new components: fixed opening, all 21 Hulali (each with internal proper-prayer-then-
psalms sections -- new `sections` rendering path added), weekday Qaltha table, Motwa intro (a
documented, disclosed gap -- the Motwa proper lives in the out-of-scope Kashkul) plus its fixed
close, all 6 named per-weekday Tishbukhta (authorship exactly as source attributes it, including
manuscript-variant alternates), and the Night Service's own (shorter, distinct) Karuzutha.

**Confirmed from source before building anything:** the Qdham/Wathar cycle is specific to the Evening
Service per Maclean's own Introduction -- Lelya has no cycle variation, only per-weekday. Renderer
extended to look up sequences without a cycle suffix for non-Ramsha offices rather than inventing a
14-combination structure that doesn't exist in the source.

**A rubric followed rather than smoothed over:** Wednesday's Motwa close is explicitly NOT said per
Maclean (special anthems substitute) -- Wednesday's sequence correctly omits it, verified with a
dedicated Playwright check confirming genuine absence, not just a correct-looking sequence definition.

165 components total, 18 sequences (12 Ramsha + 6 Lelya). Verified end-to-end across a full week: all
6 ferial weekdays render (79,000-98,000 chars each, since each night recites ~1/3 of the entire
Psalter -- expected, not padding), both Sundays correctly "not yet rebuilt" (Festival, separate
scope), 12 spot-checks all passed. Full detail in `AUDIT_GOVERNANCE_LEDGER.md`.

`SEED_VERSION` bumped to `v153-2026-08-19-east-syriac-lelya-complete`. Two of three principal ferial
services (Ramsha, Lelya) now complete and verified. Sapra's opening is in hand but not yet built --
clear next phase.

---

## Session 2026-08-19 continued -- Ramsha 100% COMPLETE; full Lelya text and start of Sapra in hand

Josh supplied Maclean pp.65-105, closing both remaining Ramsha gaps (Friday-Wathar's tail,
Saturday-Qdham entirely) and delivering far more: the complete Ferial Night Service (Lelya) and the
opening of the Ferial Morning Service (Sapra).

**Ramsha is now complete for all 14 possible ferial day/cycle combinations.** 117 components, 12
sequences (no ferial Sunday Ramsha -- that's Festival, separate section/scope). One nuance worth
remembering: Second Saturday (Qdham) uses an actual Letter Psalm, unlike First Saturday (Wathar)
which uses a Shuraya substitute -- confirmed from source, not assumed symmetric. Verified end-to-end
with real Playwright across a full two-week span: all 12 ferial slots correct, both Sundays correctly
"not yet rebuilt", 11 spot-checks all passed. **This closes out the Evening Office entirely.**

**Full Lelya (Night Service) text now in hand** (Maclean p.85-102) but NOT YET BUILT: fixed opening,
all 21 Hulali with individual prayers (grouped Mon/Thu=1-7, Tue/Fri=8-14, Wed/Sat=15-21), weekday
Qaltha table, Motwa intro/close (close NOT said Wednesdays -- special anthems substitute), named
per-weekday Tishbukhta (Monday: Mar Abraham the Doctor; Tuesday: Mar Awa/Mar Thomas of Urhai;
Wednesday: Mar Abimelek; Thursday & Saturday: Mar Ephraim; Friday: Mar Abraham of Nithpar/Mar John of
Beith-raban), and the Night Karuzutha. This is the next phase of work.

**Start of Sapra (Morning Service) also in hand**, not yet built: farced Ps.100 opening, Ps.91,
Ps.104(1-16, farced), Ps.113(farced), four fixed psalms (93,148,149,150,117) under one Gloria,
Morning Lakhumara, Ps.51:1-18, start of the Morning Tishbukhta (Mar Ephraim/Mar Awa).

`SEED_VERSION` bumped to `v152-2026-08-19-east-syriac-ramsha-complete`. Clean resume point: Evening
Office done and verified; next is building Lelya (full text already in hand), then continuing Sapra.

---

## Session 2026-08-19 continued -- East Syriac rebuild Phase 3: Friday/Saturday complete, both cycles of Monday-Thursday done, a second attribution error caught

Josh supplied Maclean pp.41-65 directly (uploaded PDF) after every fetch route hit a hard truncation
wall right at that range. This closed the Friday gap and turned out to also contain the entire
"Week 'After'" section -- the alternate (opposite-cycle) forms of Monday through Friday -- plus
"First Saturday". Far more than the minimum needed.

**A second attribution error caught and corrected same-day.** Wednesday's replacement prayer
("Arm us, O our Lord and God...") had been assumed shared with Friday, based on reading Maclean's
general summary ("distinct ones for Wed. and Fri.") as implying a shared pair. Friday's actual text
gives a completely different prayer ("Quicken, O my Lord, our departed..."). Caught before Friday was
built, so no user-facing content was ever wrong -- but corrected the Wednesday component's id and
note rather than leave the mistaken assumption undocumented. Worth remembering: Maclean's
Introduction gives structural summaries that are sometimes too compressed to trust without checking
the actual per-day rubric -- confirmed twice now (the Qdham/Wathar alternation in Phase 2, this
prayer-sharing assumption in Phase 3).

**Built and verified: Friday (Qdham) complete including full Martyrs' Anthem, Saturday (Wathar)
complete (confirmed it explicitly reuses Friday's prayer and Martyrs' Anthem per source), and the
alternate cycle for Monday/Tuesday/Wednesday/Thursday** (Wathar-Monday, Qdham-Tuesday, Wathar-
Wednesday, Qdham-Thursday). 103 components total, 10 sequences covering 12 of 14 possible ferial
Ramsha day/cycle slots.

**A nuance preserved rather than smoothed over:** Wathar-Monday's source rubric doesn't redefine the
Marmitha (unlike every other alternate-cycle day) -- rather than assume this was an oversight, it
correctly reuses Qdham-Monday's Marmitha unchanged, confirmed by the end-to-end test.

**Added `scriptureRef` support** to the renderer for Wednesday-Wathar's Exodus 15:20-21 canticle
citation (not a psalm), resolving through the same `getScriptureText()` call already used for psalms.

**Verified with real Playwright across a full two-week span**: all 12 built combinations render
correctly with the right cycle label, the 2 still-missing combinations (Friday-Wathar, Saturday-
Qdham) correctly say so, and 27 spot-checked phrases all matched. Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`.

**Remaining gap:** Saturday-Qdham (no source text yet) and Friday-Wathar/"Last Friday" (text obtained
through the Evening Anthem but cuts off before the closing prayer/Shuraya/Martyrs' Anthem -- same
kind of truncation as before). Sunday's evening service is Festival, not ferial, and out of scope for
this phase (Maclean p.68 onward).

`SEED_VERSION` bumped to `v151-2026-08-19-east-syriac-rebuild-phase3`.

---

## Session 2026-08-19 continued -- East Syriac rebuild Phase 2: Tuesday-Thursday Ramsha; a real cycle-logic bug caught before shipping

Continued the Church of the East rebuild same-session per Josh's "get as much done as possible."
Found a much higher-bandwidth source route: the Assyrian Church of the East's own Diocese of
California hosts the full Maclean PDF directly
(acoecalifornia.org/files/East-Syrian-Daily-Offices---Maclean.pdf), which returned far more text per
fetch than archive.org's djvu.txt stream -- covered First Tuesday through most of First Friday in one
pass. Worth trying this route first in future sessions before falling back to archive.org.

**Real bug caught before shipping, not after:** re-examined Maclean's actual Qdham/Wathar
alternation rule before building Tuesday and realized Phase 1's cycle logic was wrong -- it applied
one label uniformly to a whole calendar week, when the real rule alternates BY WEEKDAY (Sun/Mon/Wed/
Fri share one designation, Tue/Thu/Sat share the opposite, flipping every week). Monday's Phase 1
build happened to look correct by coincidence (Monday always matches Sunday's own designation).
Rewrote the cycle computation to correctly compute the week's Sunday designation first, then apply
the per-weekday flip -- verified against the whole week with real Playwright before trusting it.

**Built and verified: Tuesday (Wathar), Wednesday (Qdham), Thursday (Wathar) Ramsha, complete.** 28
new components (61 total), each cited to a specific Maclean page. Confirmed two Wednesday/Friday-
specific rubric substitutions directly from source (a distinct post-Evening-Anthem prayer, and a
Shuraya instead of the Letter Psalm) rather than assuming Monday's pattern held.

**Deliberately did not build Friday**, despite having most of its text -- the fetch truncated
mid-Martyrs'-Anthem, and publishing an incomplete anthem would violate the no-placeholder-text rule.
Flagged for a follow-up fetch, not patched over.

**Verified end-to-end across the whole week** with real Playwright: every built day's cycle label
lands correctly per the alternation rule, unbuilt days (Fri/Sat/Sun) correctly say so with their own
correctly-computed cycle label, and 15 spot-checked phrases across the three new days all matched.
Full detail in `AUDIT_GOVERNANCE_LEDGER.md`.

`SEED_VERSION` bumped to `v150-2026-08-19-east-syriac-rebuild-phase2`.

---

## Session 2026-08-19 continued -- Church of the East: entire prior build deleted, rebuild started

Josh asked to evaluate the Church of the East's office content -- architect it in advance, find
reliable sources first, per his standing preference for researching before building. Found the same
fabrication pattern as prior traditions: zero source citations anywhere in the 76-component build,
and confirmed directly (not assumed) that the psalm assignments were mechanically invented -- the
deleted `marmithaMap` gave Monday's First Marmitha as Psalms 4,5,6 (a generic "sequential blocks of
3" pattern); the real source's actual Monday First Marmitha is Psalms 11-14.

**Primary source found and confirmed public domain:** A.J. Maclean, *East Syrian Daily Offices*
(1894) -- archive.org's own copyright review states `NOT_IN_COPYRIGHT` (item
`eastsyriandailyo00macluoft`). A complete scholarly translation of the ferial and festival daily
offices. Structural finding worth remembering: per Maclean's own Introduction (citing the Church of
the East's Book of Canon Law), the normal daily cycle is FOUR offices -- Evening, Compline, Night,
Morning -- not seven; the minor hours are monastic-only and appear in Maclean only as fragmentary
"relics" during the Great Fast. The deleted build's "seven hours in both Cathedral and Monastic
modes" framing has no basis in this source.

**Deleted, per Josh's explicit direction** (same full-replacement precedent as Coptic Agpeya /
Ethiopian Sa'atat): `components/east-syriac.json` and `components/traditions/east-syriac/rubrics.json`
in their entirety.

**Rebuilt, Phase 1: Monday (Qdham/"before" week) Ramsha, complete.** 33 new components, every one
cited to a specific Maclean page range, covering the REAL ~30-element ferial Evening Service
structure (Maclean's actual structure, not the deleted build's ~10-item skeleton) -- both Marmithas,
the Lakhumara, both Shuraya/Anthem pairs with real unique poetry transcribed verbatim, the full
Karuzutha litany (previously entirely absent), Monday's Martyrs' Anthem (~30 verses, previously
absent), the concluding-prayer pool, and the Nicene Creed in its actual East Syriac form. Rewrote
`renderEastSyriac()` entirely to look up an exact `{day}-{office}-{cycle}-sequence` key; anything not
yet built says so plainly instead of falling back to placeholder content, and it honours whatever
hour is actually selected rather than silently substituting Ramsha.

**Verified end-to-end with real Playwright browser automation:** loaded the live app, forced a
confirmed Monday/Qdham date, selected Ramsha, confirmed all 33 components render in order with every
psalm citation correctly resolved to real text from this app's own Bible corpus -- 36,726 characters
of correct output, zero console/page errors.

**Known gap, flagged not silently resolved:** `index.html`'s Cathedral/Monastic toggle is now a dead
control (new renderer doesn't read it) -- needs Josh's input on whether/how to rebuild that axis,
since Maclean's book doesn't actually describe two parallel Cathedral/Monastic forms the way the
deleted build assumed. Dashboard's `COE` section rewritten to reflect real current status.

**Scope ahead:** this rebuild will span many sessions -- Maclean is 380 pages (vs. O'Leary's ~190 for
Coptic), and the Qdham/Wathar week-cycle multiplication alone means 14 distinct Evening Service
variations before Night, Morning, and Compline are even started. Full remaining scope tracked in the
`_rebuild_todo` block inside the new rubrics.json and on the dashboard. `SEED_VERSION` bumped to
`v149-2026-08-19-east-syriac-rebuild-phase1`.

---

## Session 2026-08-19 continued -- Overcorrected the shift fix, then broke mobile fixing that; both resolved

Josh confirmed the shift-on-toggle was gone but the open sidebar now covered the content's left
edge -- caused by the previous fix's constant padding-left matching only the *collapsed* sidebar's
footprint, not the open one. Corrected the constant to reserve the full open-sidebar clearance
always (so it can never be covered, and still never shifts), and adjusted the paired width formula
to account for the box's own right padding.

**Caught before delivering:** the corrected rule, left unscoped, applied at mobile widths too, where
the sidebar-width variable gets redefined to nearly the full viewport for the off-canvas drawer
system -- reserving a full desktop sidebar's worth of padding there collapsed the content box to
~38px wide. Scoped both rules to `@media (min-width: 901px)`, leaving mobile's own already-correct
smaller padding untouched.

Verified with Playwright checking all three properties together this time (position, overlap, and
overflow, not just position): stable across sidebar open/closed at desktop width with zero overlap
and zero page overflow, and sane at 390px mobile width both before and after toggling. Full detail
and a sharpened standing lesson about verifying every dimension a constant-value fix touches, not
just the one that prompted it, in `AUDIT_GOVERNANCE_LEDGER.md`.

`SEED_VERSION` bumped to `v148-2026-08-19-coptic-sidebar-overlap-fix`; `css/office.css` cache-bust
bumped to `?v=148`.

---

## Session 2026-08-19 continued -- The real, final cause of the shift: two independent layout paradigms both reacting to .sidebar-hidden

After the getActiveOfficeDrawer() fix made #sidebar-toggle correctly identify and collapse
#coptic-settings, Josh confirmed the toggle works but the prayer box now visibly shifts on every
toggle -- and correctly recognized this as a bug class the project has hit before.

**Real root cause:** two independent layout systems both react to `.sidebar-hidden` on
`#main-content`. The old base `#main-content` rule reserves sidebar room via *padding*
(340px open / 80px closed). The newer `.app-primary-canvas` system (from earlier this session's
sidebar-CSS work) reserves it via *width* (a fixed calc(), unconditional regardless of open/closed).
Both were active at once -- `#main-content`'s own outer box never moved, but its padding-left kept
swinging 340px->80px on every toggle, and `.office-container` (centered via `margin: auto` inside
that padded box) re-centered every time, which is the visible "shift."

**Fixed:** pinned `#main-content.app-primary-canvas`'s `padding-left` to one constant value in both
open and `.sidebar-hidden` states. Verified with Playwright across 16 real interaction states,
including 4 repeated clicks on the actual toggle -- `.office-container`'s position is now
bit-for-bit identical every time. Also verified mobile (390px) layout stays sane. Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`, including a standing lesson about neutralizing *every* property an
older layout system touches when a newer one takes over the same state class, not just adding a
rule alongside it.

`SEED_VERSION` bumped to `v147-2026-08-19-coptic-canvas-padding-toggle-fix`; `css/office.css`
cache-bust bumped to `?v=147`.

---

## Session 2026-08-19 continued -- Found the real "sidebar shift" bug: #sidebar-toggle

After several rounds of investigation that ruled out caching, scroll position, and every control
inside the Agpeya Options panel itself (all verified correct), Josh identified the actual culprit
from a screenshot: `#sidebar-toggle`, the collapse/expand icon stack on the far-left edge of the
screen -- a completely different control than anything tested before.

**Playwright (real headless Chromium) is available in this environment and was used for direct
verification from this point on** -- a capability upgrade over jsdom, which only checks DOM
structure/JS logic, not real CSS layout. Confirmed with `sync_playwright()` that
`p.chromium.launch()` works with zero setup.

**Root cause:** the "UO MOBILE DRAWER REPAIR" end-of-file IIFE overrides `toggleSidebar()` at
runtime via `getActiveOfficeDrawer()`, which maintains its own hardcoded panel list -- and
`coptic-settings` was never added to it. In Coptic mode, every click fell through to the wrong,
hidden panel (`settings-panel`) while still unconditionally toggling `sidebar-hidden` on
`#main-content` (`padding-left: 80px`), producing exactly the alternating shift Josh described, with
the actual Coptic sidebar never opening or closing at all.

**Fixed:** added `coptic-settings` to `getActiveOfficeDrawer()`'s panel list (the function actually
in effect). Left the original, now fully-shadowed `toggleSidebar()` untouched, per this codebase's
own documented convention ("avoid brittle edits inside the legacy drawer code, use the override").
Verified directly with Playwright on both desktop (2380px) and mobile (390px) viewports: sidebar and
main-content classes now toggle correctly and in sync on every click, both platforms.

**Standing note:** grepped for every other hardcoded panel-ID list in the file to check for the same
gap elsewhere -- none found. But this is the second time this exact shape of bug has appeared
(after `setSharedOfficeNavDate` earlier this session). When adding a future tradition/mode, check
every function maintaining a panel-ID list, since these aren't centralized and each omission fails
silently to the wrong panel rather than erroring.

`js/office-ui.js` passes `node --check`. `SEED_VERSION` bumped to
`v145-2026-08-18-coptic-sidebar-toggle-fix`; cache-bust bumped to `?v=145`.

---

## Session 2026-08-19 continued -- Theotokia: fixed "Phase 2" label leak, made day auto-selected

Josh flagged two Theotokia problems: every weekday entry showed "Phase 2" as its label (internal
build-phase jargon leaked into user-facing text -- both the sidebar detail AND the actual page
title, since it was baked into `rubrics.json`'s `officeName` field), and the Theotokia should be
auto-selected by actual weekday, not manually picked.

Researched actual Coptic liturgical practice first: confirmed there's exactly one correct Theotokia
per weekday (not a preference like the canonical hours), and confirmed the Adam (Sun-Tue) / Batos
(Wed-Sat) melody split already referenced correctly elsewhere in this project's own rubric notes.

Collapsed the seven individual weekday Theotokia entries into a single `coptic-theotokia` entry
(both in the JS config and `index.html`'s legacy radios). Added `_copticTheotokiaIdForDate()` as the
single source of truth mapping the current date's weekday to the correct rubric id --
`renderCopticAgpeya()` now resolves the generic selection through this before lookup. Fixed all 7
`officeName` values in `rubrics.json` (removed the ", Phase 2" suffix). Bonus find: `Prev/Today/
Next` and the date picker did nothing at all in Coptic mode (`setSharedOfficeNavDate()` had no
`"coptic"` branch) -- fixed as part of the same patch, since the Theotokia redesign depends on
working date navigation.

Verified with two rounds of real-source jsdom simulation (19 + 7 checks, all passed), including
checking resolved `officeName` values directly against the real `rubrics.json`. Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`.

`SEED_VERSION` bumped to `v144-2026-08-18-coptic-theotokia-auto-select`; `js/office-ui.js` cache-bust
bumped to `?v=144`.

---

## Session 2026-08-19 continued -- "Sidebar still does not work" report: no code bug found, added cache-busting

Josh reported the sidebar "still does not work" after the toggle-position patch (screenshot at
7:24 PM showed no hour selected, light theme instead of dark). Ran a full end-to-end jsdom
simulation against a fresh clone of the exact live commit, reproducing the reported time and
sequence precisely (kernel-load theme application, mode selection, default-hour computation, and a
simulated hour click). All 12 checks passed -- the code is correct.

**Root cause is almost certainly a stale browser cache**, not a code bug: `js/office-ui.js` and
`css/office.css` were never served with any cache-busting query parameter, so a plain (non-hard)
browser reload can silently keep using a pre-patch cached copy indefinitely, especially over a
GitHub Codespaces dev-preview URL. Added `?v=143` cache-busting to both files' tags in `index.html`.

**New standing rule:** whenever a future patch touches `js/office-ui.js` or `css/office.css`, bump
this `?v=` query parameter to match the new `SEED_VERSION`, in the same patch -- this makes a plain
reload reliably pick up the change without Josh needing to hard-refresh every time. Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`.

If a similar "I applied the patch but nothing changed" report comes up again, check this first:
confirm the person did a hard refresh (Cmd+Shift+R / Ctrl+Shift+R) before assuming a regression.

`SEED_VERSION` bumped to `v143-2026-08-18-cache-busting-asset-versioning`.

---

## Session 2026-08-19 continued -- Moved the Coptic Dark Mode toggle under the date selector

Josh asked for the new Coptic "Dark Mode" toggle to sit at the top, under the date selector, rather
than below the hour list. This needed a code change rather than a markup move: the Date and Hour
cards are generated together as one HTML blob by `renderSharedOfficeNavigation()`, not two separate
static elements. Added a config-gated "Appearance" section to that generator (config-scoped to
Coptic only, via `showAppearanceToggle`/`appearanceToggleId` on `SHARED_OFFICE_NAVIGATOR_CONFIGS
.coptic`), positioned between the date section and the hour section, and removed the old static
block from `index.html`. Added matching checkbox styling alongside the existing radio-option CSS.

Verified with a full-source jsdom simulation (loaded the real `js/office-ui.js`, not a
reimplementation, with only the unrelated `SaintsResolver` dependency stubbed): 12/12 checks passed,
confirming DOM order is date -> appearance -> hour, the checkbox tracks the real theme state
correctly across renders, and the previous session's `cop-hour` fix is unaffected. Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`.

`SEED_VERSION` bumped to `v142-2026-08-18-coptic-appearance-toggle-position`.

---

## Session 2026-08-19 continued -- Color theme: renamed, added to Coptic sidebar, made time-based

After the hour-selection fix, Josh reported the app was "still opening in Vespers mode as far as
color is concerned." This turned out to be unrelated to the Coptic hour entirely: the app's single
dark/light theme toggle was labeled "Vespers Mode (Dark)" purely as flavor text, lived only in the
Daily Office sidebar (unreachable from Coptic), and was hardcoded to dark with no time-of-day logic
at all. Asked Josh to clarify what he wanted; he asked for all three: add the toggle to the Coptic
sidebar, rename the confusing label, and make the theme auto-switch with real time.

**Fixed:** renamed the label to "Dark Mode"; added a matching, synced checkbox to the Coptic
sidebar; added `applyDarkMode()`/`_defaultDarkModeForCurrentTime()` (light 06:00-18:00, dark
otherwise) and moved theme init to kernel-load time so it's correct regardless of which tradition
is opened first. **Design change worth knowing about:** stopped persisting the dark-mode preference
to `localStorage` -- it's now recomputed fresh from real time every load, the same pattern already
used for canonical-hour defaults, with a manual toggle acting as a same-session-only override. If
Josh would rather a manual choice stick across reloads instead, that's a small follow-up. Verified
with a 16-check jsdom simulation (all passed) plus `node --check`/`tinycss2` validation. Full detail
in `AUDIT_GOVERNANCE_LEDGER.md`.

`SEED_VERSION` bumped to `v141-2026-08-18-theme-time-based-coptic-toggle`.

---

## Session 2026-08-19 continued -- Coptic Agpeya hour selection was never wired up at all

Josh tested the previous fix live and reported two more problems: at 6:56 PM the app showed the
Morning Office instead of something evening-appropriate, and the sidebar's hour controls had no
effect when clicked.

**Root cause:** the Coptic Agpeya's hour selection relies on a hidden "legacy" `input[name="cop-
hour"]` radio group that the visible shared-nav UI proxies onto -- exactly the same pattern Daily
Office and Church of the East use. That legacy radio group genuinely exists for those two
traditions in `index.html`. **It never existed for Coptic at all**, despite `js/office-ui.js`'s own
code comments describing it as if it did. Every function that reads `input[name="cop-hour"]:checked`
found nothing and silently fell back to the hardcoded Morning Office default -- permanently,
regardless of clicks or time of day. Separately, `initializeOfficeDefaultsForCurrentDateTime()` had
no `coptic` branch at all (Daily/East Syriac/Horologion each have their own clock-time-to-hour
mapping; Coptic had none).

**Fixed:** added the missing 14-value `cop-hour` radio group to `index.html` (verified to exactly
match both `SHARED_OFFICE_NAVIGATOR_CONFIGS.coptic.options` and the 14 rubric ids in
`components/traditions/coptic/rubrics.json`), and added `_defaultCopticHourForCurrentTime()` plus a
`coptic` branch in `initializeOfficeDefaultsForCurrentDateTime()`, using the Agpeya's own
traditional hour-name time windows (Prime, Terce, Sext, None, the Eleventh Hour/Vespers, the
Twelfth Hour/Compline, Midnight Office).

**Verified with an isolated jsdom simulation**, not just read-through: loaded the actual sidebar
HTML fragment in a real DOM and confirmed the 6:56 PM default resolves to the Eleventh Hour, a
simulated sidebar click actually changes the active hour, exactly one radio is checked at a time,
and all 14 values remain correctly selectable after being disabled (which is what happens once the
visible shared-nav UI takes over). All four checks passed. Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`.

`SEED_VERSION` bumped to `v140-2026-08-18-coptic-hour-selection-fix`.

---

## Session 2026-08-19 continued -- Coptic Agpeya UI fixes

Two UI bugs reported and fixed this session, both purely front-end (no content/data changes):

1. **Splash screen missing an Agpeya entry point.** Added a fourth card to the "Universal Office
   Selector" (`#mode-selection` in `index.html`), matching the existing three cards, wired to
   `selectMode('coptic-agpeya')`.
2. **Agpeya settings sidebar rendering behind content / wrong proportions.** Root cause:
   `#coptic-settings` had never been added to `css/office.css`'s ~30 shared sidebar rule groups
   (base positioning, theming, the `.app-mode-drawer` width/padding layer, main-content width calc,
   two mobile breakpoints) that every other office sidebar has. It was only getting generic
   `.app-mode-drawer` class styling with no `position: fixed` or `z-index`. Fixed by adding
   `#coptic-settings` to every one of those groups, mirroring `#generic-settings`. Deliberately did
   *not* add it to the Horologion-only mobile "stacked full-page selector" pattern -- Coptic now
   gets the same off-canvas drawer behavior as Ethiopian/Church of the East on mobile, which is
   correct for a normal sidebar. Also fixed stale sidebar copy that predated the Agpeya's GREEN
   promotion. Full detail in `AUDIT_GOVERNANCE_LEDGER.md`, session 2026-08-19.

`SEED_VERSION` bumped to `v139-2026-08-18-coptic-sidebar-css-splash-fix`.

**If similar UI bugs turn up for other sidebars/modes in future:** the pattern to check first is
whether a given `#<mode>-settings` ID is actually present in *every* shared rule group in
`css/office.css`, not just some of them -- `grep -n "#generic-settings" css/office.css` and compare
counts against whichever ID is misbehaving.

---

## Where things stand right now (as of 2026-08-19)

**Biblical corpus (OT/NT, five translations):** fully remediated, zero known defects, closed.

**BCP Daily Office:** engine audit complete, multiple defects found and fixed (Ordinary Time
date-matching, Holy Days lectionary, Deuterocanon schema mismatch). `engine:office-ui-core` marked
GREEN after a full read-through of `js/office-ui.js`.

**Ethiopian broader-canon remediation:** ongoing, unrelated to the Coptic work below. See
`RESUME_PROJECT_NOTE_HISTORICAL.md` for full detail on Meqabyan, Jubilees, Malke'a Virgin Mary,
Tizaz, etc. Nothing in that lane changed this session.

**The Ethiopian Sa'atat was removed entirely** (not rebuilt) after no adequate free English source
for the real Giyorgis structure could be found. Its slot was rebuilt from scratch as **the Coptic
Agpeya** instead.

**The Coptic Agpeya is complete and GREEN.** This was this session's main work, across several
sub-sessions:
- Built from De Lacy O'Leary's 1911 *The Daily Office and Theotokia of the Coptic Church* (public
  domain). All seven hours (Morning, Third, Sixth, Ninth, Eleventh, Twelfth, and the Midnight
  Office with its three nocturns), plus the complete seven-day Theotokia hymn cycle (Sunday through
  Saturday, each with a Psali, Alternative Psali, and full Theotokia body). 87 components, 15
  selectable offices, all wired into `components/coptic.json` and
  `components/traditions/coptic/rubrics.json`.
- Every one of the 87 components was then checked against source line by line (not spot-checked).
  Found and fixed 5 real issues: four small wording errors in the Morning Office, and one inverted
  sentence in Sunday's Theotokia Section V -- the Section V fix required going back to the actual
  PDF page (via Google Drive + `pdftoppm`, since the automated OCR text extraction had genuinely
  garbled that one passage) rather than accepting the extraction as a ceiling.
- Josh reviewed this verification work and explicitly authorized promoting the whole thing to
  GREEN. All 16 `cop:agpeya:*` dashboard rows now show green.
- One item remains an honestly-disclosed judgement call rather than a confirmed exact source match:
  Saturday's two Theotokia Crown endings (backed by three independently-confirmed matching
  instances from the preceding days, but Saturday's own text abbreviates slightly differently) --
  noted in that component's own `meta`, not hidden by the GREEN status. Not blocking, no action
  needed unless a better source turns up.
- The dashboard was reorganized after this: the Coptic Agpeya's rows had been living inside the
  "Ethiopian Office" section (an artifact of reusing that slot) even though the two are different
  traditions. Fixed: new standalone "IV. The Coptic Agpeya" section, its own JS array
  (`COPTIC_AGPEYA`), its own render call. "III. The Ethiopian Office" now contains only the two
  real Senkessar rows. The old `eth:saatat:removed` dashboard row was deleted entirely (its history
  remains in `AUDIT_GOVERNANCE_LEDGER.md` and `documentation/ETHIOPIAN_SAATAT_DOCUMENTATION.md`,
  which is now a deprecation notice). Subsequent section numerals (Church of the East, Byzantine,
  Book of Needs, Roman Breviary) were bumped up by one accordingly.
- Current `SEED_VERSION` in `audit-ledger.html`: `v138-2026-08-18-dashboard-coptic-section-split`.

**No outstanding work remains on the Coptic Agpeya.** Treat it like any other GREEN book in this
project -- re-opening it needs a real reason (a reported error, a newly available source, a scope
change Josh requests), not routine re-litigation.

---

## Important correction made this session -- read this before citing GREEN-promotion criteria

A stored memory claimed this project has a standing rule: "never mark a file GREEN without
documented human verification against a named primary source." **Josh stated directly that this
was never an actual project requirement** -- it came from an inaccurate memory, not a real
decision. This has been recorded in a memory-edit correction (so future sessions shouldn't repeat
the claim), and the false assertion was fixed directly in the live dashboard notes and corrected
(not erased) in the governance ledger's historical entries.

**Do not assume any particular bar for GREEN promotion going forward -- ask Josh directly if it
comes up.** The Coptic Agpeya's promotion this session followed extensive AI self-verification plus
Josh's explicit authorization, which is the actual precedent now, not any rule about human
read-throughs.

Also corrected in the same conversation: Sammie (an AI theological-librarian agent on OpenAI) was
briefly and wrongly suggested as a source of "human verification" -- a category error independent
of the rule issue above. Sammie is an AI, not a human.

---

## Standing rules and lessons that apply project-wide, not just to Coptic

- **No abbreviated/placeholder liturgical text, ever.** If a source says "say the Gloria," render
  the whole Gloria. If a source abbreviates a refrain with "&c." after giving it once in full,
  write it out in full at every occurrence. Established during the Coptic build, applies to all
  future liturgical content work.
- **"Corroborate before completing" method** for genuine textual gaps (a source's own abbreviation
  with no full statement nearby): check whether the same formula is independently attested in full
  elsewhere in the same book before completing it, and disclose the completion as such in the
  component's own `meta` rather than presenting it as a verbatim match. Used multiple times
  successfully in the Coptic build (Third Hour, Tuesday's and Saturday's Theotokia Crowns).
- **When OCR/automated extraction seems inadequate for a specific passage, don't treat that as a
  ceiling.** This environment has `pdftoppm`/`pdfimages`/`pdftotext` available via bash.
  `Google Drive:download_file_content` has a hard 10MB cap (confirmed: both O'Leary PDFs, at 30MB
  and 40MB, exceed it) -- but `Google Drive:read_file_content` (the OCR text tool actually used to
  build all this content) has no such limit. When a specific passage needs direct verification and
  text extraction won't cut it, identify the exact page and ask Josh for just that one page
  (paste or screenshot) rather than presenting "needs a page image" as an unrecoverable dead end.
- **Never certify GREEN with outstanding known defects.** If any problem exists in a book, it's not
  green until every known issue is resolved.
- **Patch workflow (non-negotiable, raised many times):** work in a local clone, commit, export with
  `git format-patch -1 HEAD -o /mnt/user-data/outputs/`, present via `present_files`. **Before
  generating a patch, always check `git log origin/main..HEAD --oneline` to confirm you're only
  packaging commits Josh doesn't already have** -- this session had a real incident where two local
  commits were made but only the second was ever turned into a patch, so the first was silently
  missing when Josh tried to apply it. If more than one commit is ahead, use
  `git format-patch <last-known-good-commit>..HEAD` to get the full series, numbered so `git am`
  applies them in order. Surface the exact `git am ...` and `git push origin main` commands ready
  to copy-paste, without explanation, every time.
- **Never direct-push from Claude's environment.**
- **If `git am` fails with a leftover-state error** (e.g. "previous rebase directory .git/rebase-apply
  still exists"), the fix is `git am --abort` (or `rm -rf .git/rebase-apply` if that itself errors),
  then retry the `git am` command.
- **Every deliverable requires:** `node --check` syntax validation (for `.js` files),
  `audit-ledger.html`'s inline `<script>` validated the same way (extract and run through
  `new Function()`), a ledger update, dashboard `SEED_VERSION` bump, and resume note update in the
  same action as the fix.
- **Write the resume note after each completed engine fix**, not batched at the end. This file
  itself gets unwieldy if left to grow indefinitely -- when it does, archive wholesale into
  `RESUME_PROJECT_NOTE_HISTORICAL.md` and rewrite this file fresh with just current state, the way
  this entry did.

---

## Tools & resources (unchanged from before this session, still accurate)

- **Repository:** github.com/JWJeffery/PrayerAppNew (public); Josh works in GitHub Codespaces.
- **Governance files:** `RESUME_PROJECT_NOTE.md` (this file), `RESUME_PROJECT_NOTE_HISTORICAL.md`
  (full history), `AUDIT_GOVERNANCE_LEDGER.md`, `audit-ledger.html` (dashboard).
- **Repo access:** `curl -sL "https://codeload.github.com/JWJeffery/PrayerAppNew/tar.gz/refs/heads/main"`
  for tarball download (GitHub API rate-limits unauthenticated). `git clone` for actual patch work
  (tarball + git init produces new-file patches that fail on apply).
- **Source witnesses (fixed paths):** see `RESUME_PROJECT_NOTE_HISTORICAL.md` for the full list
  (KJVA/Rotherham, DRB USFM, NRSV SQLite, NABRE json paths, etc.) -- unchanged this session, not
  reproduced here to keep this file short.
- **Known tool limitations:** archive.org `_djvu.txt` hard truncation wall (have Josh upload
  directly); en.wikisource.org cache-only; `Google Drive:download_file_content` 10MB cap (use
  `Google Drive:read_file_content` for text, or ask for a specific page image when that's not
  enough); `create_file` unreliable for large appends (use bash `cat >> file << 'EOF'` instead).

---

## What's actually next

Nothing is currently in progress. The Coptic Agpeya rebuild is done, verified, GREEN, the dashboard
is clean, and this session's splash-screen/sidebar UI bugs are fixed and patched. Next steps depend
entirely on what Josh wants to pick up -- could be continuing the Ethiopian broader-canon backlog
(Tizaz, Fetha Nagast, remaining ET books), the 10 unaudited other-tradition engines, further UI
polish, or something new. Ask, don't assume.
