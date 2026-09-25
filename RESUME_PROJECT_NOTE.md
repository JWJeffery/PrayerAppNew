# RESUME_PROJECT_NOTE.md

**Paste this at the start of a new conversation.** It is a handoff document, not a history. The
permanent record of every decision lives in `AUDIT_GOVERNANCE_LEDGER.md`; the classification of what
blocks each open item lives in `documentation/OPEN_ITEMS_FIXABILITY.md`. **Where this note and the
repo disagree, the repo wins** — it may have moved since this was written.

**FIRST MOVE, EVERY SESSION, NO EXCEPTIONS.** `git clone` fresh, then `git log --oneline -10` and
check `SEED_VERSION` in `audit-ledger.html`. Josh runs at least two Claude accounts against this repo
concurrently, so never trust this note's HEAD, SEED_VERSION or "what's open" at face value. Cache-bust
params likewise: read them out of `index.html` rather than trusting a number written here.

**THE DESIGN MOCKUP IS IN THE REPO. `documentation/design/screens/*.png` (6 files) +
`documentation/design/DESIGN_HANDOFF_SOURCE.md`. Josh has supplied this zip multiple times over
two weeks because it kept getting lost between sessions. If asked to compare the UI against "the
model" or judge whether something "looks elegant," open these PNGs directly — do not ask Josh to
re-upload, re-describe, or re-locate them, and do not rely on `UI_REDESIGN_HANDOFF.md`'s prose
alone when the actual pixels are sitting right there. `1c-threshold-ordo-drawer.png` is
specifically the settings-drawer target.**

**SUPERSEDED 2026-09-24: the claim immediately above that Phase 4's drawer "has never been
started" is no longer true — see the entry directly below. Left here only so the correction is
visible in place; do not re-cite the old claim.**

**ADMIN TRADITION-AVAILABILITY CONTROL PANEL, BUILT 2026-09-25.** Resolves the "TODO, next
session" note below (kept here, struck through in spirit, for history). Design confirmed with
Josh first (whole traditions only, JSON-backed, admin UI) via `AskUserQuestion`, written up in
`documentation/ADMIN_OFFICE_AVAILABILITY_CONTROL_DESIGN.md`, then built after Josh said "proceed."
New `data/tradition-availability.json` (seeded with today's real state) replaces the three
hand-edited gates from the original Horologion unwire with one file, read by `index.html`'s entry
cards + profile dropdown and by `js/office-ui.js`'s now-`async initializeEntryRouting()`. The
original hard-coded `eastern-orthodox`/`latin-catholic` disabled markup in `index.html` was
deliberately **kept**, not removed — it's the fail-safe: if the JSON can't be fetched, the entry
screen simply keeps shipping today's real state, and a hard-coded fallback set still protects the
stale-stored-default routing guard (the case Josh called "the one that actually mattered") even
then. New "Tradition Availability" panel in `admin/admin.html` lets Josh toggle a tradition
paused/available (prompting for a reason) and copy out updated JSON to paste back into the real
file — **there is no backend**, so this cannot push changes to testers by itself; the panel says so
on-screen. Verified live in headless Chromium: fresh load, a stale-EO-default returning tester
(cleared correctly), a valid-Anglican-default returning tester (correctly not cleared), the JSON
fetch forced to fail (fallback still protects EO), and the admin panel's toggle/restore/JSON-output
round-trip. Cache-bust `office-ui.js v314 -> v315`. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`,
entry dated 2026-09-25 continued (admin tradition-availability control panel), SEED_VERSION
v368 → v369.

**"THE ORDER" RAIL SCROLL, FIXED 2026-09-25.** Resolves the flag below (kept for history). Root
cause confirmed live before fixing: `.uo-rail` shares a CSS grid row with `.uo-page`, and never got
the `overflow-y: auto` + `min-height: 0` pair `.uo-page` already uses to scroll its own overflow
within `#main-content`'s fixed, non-scrolling height — `.uo-rail` still had the grid default
`min-height: auto`, so a long order (33 items measured on Church of the East Ramsha) just got
clipped by `#main-content`'s own `overflow-y: hidden` with no scrollbar reachable at all. Same fix
applied (`css/office-shell.css`). Also, per Josh's own wording ("scroll *with* the content," not
just "be scrollable"): `updateRailCurrent()` (`js/office-shell.js`) now auto-scrolls the rail to
keep the highlighted "current" item visible as the reader scrolls the office, only when it actually
changes so it never fights a reader manually browsing the rail by hand. Verified live in headless
Chromium: the 33-item rail now scrolls, the highlighted item follows page scroll into view within
the rail, and a short rail (Anglican, 16 items, everything already fits) shows no regression.
Cache-bust `office-shell.css v327 → v328`, `office-shell.js v300 → v301`. Full detail:
`AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-25 continued ("The Order" rail fixed),
SEED_VERSION v369 → v370.

**FLAGGED BY JOSH, NOT YET INVESTIGATED — "The Order" rail doesn't scroll with the office content,
2026-09-25.** (Original note, kept for history:) Josh, explicitly "to fix later": on Church of the
East (screenshot showed Wathar Friday), the left "THE ORDER" rail lists more items than fit in the
visible rail height, and the rail itself does not scroll — "The order....is longer than this....it
needs to scroll with the content on the right."

**"WHAT THE FATHERS SAY" — INVESTIGATED, CONFIRMED NOT A BUG (a real scope gap, awaiting Josh's
direction), 2026-09-25.** Follow-up asked Josh directly what specifically looked wrong (position,
or content); his answer: "The content is missing. It should not be. It used to work..." — a content
question, not the positioning question I'd first guessed at. Investigated both:

*Positioning*: reproduced live, confirmed the top-right floating placement is deliberate, working
`mode: "study"` code in `positionContextPanel()` (`js/bible-browser/bible-browser.js`) — not an
accidental `position:absolute`-escapes-its-ancestor bug like the other floating-panel fixes this
session. No change made; nothing was actually wrong here.

*Missing content*: root-caused via `data/commentary/patristic-witness-runtime/manifest.json`, whose
own `runtimePolicy` discloses `"includedBooks": ["hebrews"]` — **only Hebrews has ever been in the
browser runtime**, out of 81,644 entries held in the full local source-intake output
(`.external/generated/patristic-witness`, gitignored, not present in a fresh clone). Confirmed via
`git log --follow`: `scripts/build-patristic-witness-runtime.mjs`'s `runtimeBooks` array was
hardcoded to `["hebrews"]` from its very first commit (2026-06-03), with the script's own generated
comment "initial proof slice; expand book set intentionally" and the manifest's own stated reason
("Do not ship the full 170MB+ patristic source-intake output into web-release until paging/indexing
is designed") — this was **never a regression**. Live-verified both sides directly through
`UniversalOfficePassageGuide.loadFathersForRanges()`: Hebrews 1:1-14 correctly returns 188 real
entries (Clement of Alexandria first, cards render correctly); Genesis 42:1-4 correctly returns 0
with the honest "has not been added yet" disclosure — exactly the coded, intended behavior for any
book outside the one-book runtime slice. Josh's "it used to work" almost certainly reflects testing
on Hebrews previously, not a regression on Genesis. **Expanding book coverage is a real, scoped
content decision (which books, how much size to add to the web-release bundle, whether the
`.external` source-intake needs re-fetching), not a quick fix — asked Josh which books/how much
before touching anything.** Nothing changed in code for this item.

**Josh's decision, same session**: leave it exactly as-is for now (Hebrews-only, current "has not
been added yet" message unchanged) — "We will return to this later." Do not expand book coverage,
do not touch the UI message, without Josh raising this again.

**THE ENGINE AUDIT SWEEP, 2026-09-25 continued yet further still still still.** Josh said
"Proceed with the rest of the que[ue]" -- resuming item 5 of his own original ordered plan, the last
unstarted phase. Audited (CODE, not content) the 9 engine/calendar files the dashboard had carried as
amber "not engine-audited this session" since 2026-07-10: `calendar-eastern-orthodox.js`,
`calendar-east-syriac.js`, `calendar-ethiopian.js`, `horologion-engine.js`, `menaion-resolver.js`,
`orthros-eothinon-engine.js`, `coe-eligibility.js`, `byzantine-paschalion.js`, plus one file from
`js/octoechos/*`. Used 6 parallel background subagents (each required to reproduce every claimed bug
by actually running the code, not just reading it), then independently re-verified every finding
myself before fixing anything. **Four real bugs fixed**: (1) Eastern Orthodox Pascha computed 13 days
too late -- a double-counted Julian/Gregorian offset (`_verifyPascha()` self-check went 0/16 -> 16/16)
-- severe but currently unreachable live, since `getEOSeasonRanges()`, its only caller, is itself
never called anywhere. (2) East Syriac Eliya-Sliwa season overlapped Qudash 'Idta by up to ~21 days
in some years -- an unclamped season-end date. (3) East Syriac Holy Cross Day was one day off
(Sep 13 instead of the file's own documented Sep 14 Julian), resolving that feast a day early. (4)
Horologion Saturday Orthros was silently rendered with next week's tone instead of its own -- the
Vespers-only "Saturday anticipates Sunday" rule was being applied to Orthros too. Also fixed a minor
`rank:0`-coerced-to-null inconsistency in `menaion-resolver.js` (currently inert, no rank-0 entries
exist yet). **Investigated and correctly determined NOT a bug**: a subagent flagged
`_finalizeOrthrosReleaseHonestyPatch` (Horologion) as discarding a "complete" Sunday sessional-hymns
corpus -- checked the underlying data file myself, which discloses its own texts as "provisional...
pending source confirmation," so the override is this project's own unsourced-content rule working
correctly, not a defect. Implementing the agent's suggested fix would have been a real regression.
Confirmed clean: `byzantine-paschalion.js`, `coe-eligibility.js`, `orthros-eothinon-engine.js`'s core
arithmetic. Two low-priority, currently-dead-code findings left unfixed and disclosed on the
dashboard rather than silently ignored. None of the 5 touched files carry a cache-bust param, so none
needed bumping. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-25 continued (the
engine audit sweep), SEED_VERSION v367 -> v368. This closes out the last item of Josh's original
ordered plan. **REDEPLOYED 2026-09-25 continued further still** -- `npm run release:web` rebuilt
and sent to Josh, folded together with the admin tradition-availability panel and the "Order" rail
scroll fix (both built after this entry was originally written; see their own entries above).
`npm run audit:admin-release-support` and `npm run audit:bible-browser-smoke` both passed against
the rebuild; `data/tradition-availability.json` and the updated `admin/admin.html` confirmed present
in `web-release/`. Horologion remains gated (unaffected by this batch -- still pending its own
content audit per Josh's "temporary unwire" instruction).

**BIBLE READER: HIGHLIGHT COLORS AND A GENUINELY UNREACHABLE HEADER, 2026-09-25 continued yet
further still still.** Josh sent a screenshot, then "Highlighting colors....all brown?"
**Colors**: all 5 highlight swatches (yellow/pink/green/blue/purple) rendered identically brown —
`#bible-selection-toolbar button` (an ID+type selector, meant to bronze-style the Highlight/Note/
Fathers action buttons) beat the swatch color classes on specificity regardless of source order,
since the swatches are themselves `<button>` elements in that same toolbar. Fixed with
`:not(.bible-highlight-swatch)`. **Header**: investigating the Dark Mode toggle's own odd floating
position surfaced a much bigger, real, pre-existing bug — the ENTIRE Bible Reader header (title,
translation/search controls, the toggle, Back to Modes) was silently unreachable on every load, not
merely misplaced. Root cause: the base `body{}` CSS rule unconditionally centers its flex child
and hides overflow, with no override for `.office-active`; the real office sections dodge this by
being `position:fixed` (removed from body's layout entirely), but `#bible-browser-section` never
got that treatment, so any passage taller than one viewport got vertically centered with its top
half — the whole header — pushed above `y:0`, unreachable since a page can't scroll negative.
Confirmed via a screenshot at `scrollY:0` before touching any code: header already invisible on
the very first render. Fixed by giving `openBibleBrowser()`/`closeBibleBrowser()` the same kind of
body-style reset `selectMode()` already does for every real office. **Verified live**: full header
now visible and reachable on open; normal scrolling still works; the Dark Mode toggle sits
correctly in-flow (same root cause already fixed once this session on Book of Needs' identical
control) and works; close/reopen correctly restores the splash's own centering. Cache-bust
`office.css v226 → v227`. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-25
continued (Bible Reader highlight colors and header reachability), SEED_VERSION v366 → v367.

**RAIL DOT FOLLOW-UP: TWO REAL BUGS THE FIRST PASS MISSED, 2026-09-25 continued yet further
still.** Josh redeployed the batch below and found, live, that the rail-dot fix was genuinely
broken on two of three lanes plus a real edge case on the third. **(1)** "You didn't fix the
scrolling ball on the left on the Agpeya" / "its super bugggy in the church of the east" — root
cause: the explanation-tooltip layer nests a small "i" icon span INSIDE many `.rubric-text`
elements, so `computeRailWaypoints()`'s exact-text match against the plain rail label failed for
almost every tooltipped item (most of Coptic Agpeya's and East Syriac's), silently inheriting a
neighbor's position instead of getting its own. Fixed with `ownText()` — reads only a rubric's own
direct text nodes, ignoring any nested element. **(2)** BCP Noonday Prayer stuck on "The Collect"
at the absolute bottom of scroll, with "Closing (Noonday)" clearly on screen — root cause: a short
final block's own waypoint sat further down than the maximum reachable `scrollTop + threshold`
could ever reach. Fixed: `updateRailCurrent()` now snaps to the last item outright once the page
is scrolled to its true bottom. **Verified live across the full scroll range on all three lanes** —
BCP Noonday now correctly reaches "Closing (Noonday)" (VIII of 8); Coptic Agpeya and East Syriac
both progress smoothly through every distinct item to their real final one. **Separately**, removed
the threshold splash's hardcoded "PRAYING IN" tradition list — Josh asked why it was still there;
it was disconnected from what's actually available (never reflected the Horologion unwire) and
redundant with the "Another office" grid right below it; asked rather than assumed, Josh chose to
remove it. Cache-bust `office-shell.js v299 → v300`. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`,
entry dated 2026-09-25 continued (rail dot follow-up), SEED_VERSION v365 → v366.

**OFFICE SHELL / DRAWER / BOOK OF NEEDS UI BATCH -- EIGHT REAL FIXES, 2026-09-25 continued yet
further.** Josh sent a batch of live screenshots; asked for the whole batch fixed
before redeploying ("When all the UI issues are resolved, resurface a web deployment" — not
redeployed yet as of this entry, more items were still incoming). Each investigated to a real root
cause:
1. **Keeping-bar hint text removed** — turned out to describe a keyboard "move by block" feature
   that was never actually built (grepped the whole app for key handlers, found none).
2. **Rail dot now tracks real scroll position** — was hardcoded to item 0 forever, "I of N" footer
   likewise frozen at "I". Built real waypoint tracking (`computeRailWaypoints()`/
   `updateRailCurrent()`, `js/office-shell.js`) matching rail labels to `.rubric-text` spans by
   text, since the rail and the rendered page don't correspond 1:1 by DOM position.
3. **Book of Needs Dark Mode toggle: two separate real bugs.** Position — the shared corner-pin CSS
   had no positioning context to pin to on this redesigned screen, so it escaped to the full
   viewport corner; taken out of absolute positioning, placed in-flow. "Does not work" — (a) the
   checkbox's own checked state was never synced to the actual theme, AND (b) a genuine "two
   systems fighting" bug: `js/office-shell.js`'s global click listener (built for Horologion
   office-change tracking) was silently reverting the checkbox's own theme change within one tick,
   since Book of Needs carries `body.office-active` the same as any real office. Fixed by excluding
   `.app-dark-toggle` clicks from that listener.
4. **Commemoration card now follows dark mode** — its background was hardcoded to a fixed light
   gradient with `!important`, ignoring the `--app-surface`/`--app-surface-strong` variables this
   same file already defines correctly for dark mode; only the text color was ever theme-aware.
5/8. **Drawer: "How you keep it" renamed to "Options" and moved before "Which office"** — per
   Josh's own reasoning, Options can change what Which Office even shows (East Syriac's Cathedral/
   Monastic choice).
6. **"Borrowed Devotions" renamed to "Additional Devotions," each item now shows its tradition** —
   sourced from `components/ecumenical.json`/`coptic.json` where recorded (Ignatian, Byzantine
   Orthodox — including a 2026-09-21 correction carried forward, not the misleading toggle id);
   Angelus/Trisagion flagged in-code as common-knowledge attribution, not yet a citation this
   project has verified itself.
7. **"Further Prayer Book Choices" reordered** — daily-applicable options now precede the
   single-day alternate-reading toggles, not the reverse.

All eight verified live in headless Chromium, zero console errors beyond the pre-existing
sandboxed font-CDN failure. Cache-bust `office.css v225→v226`, `prayers.js v221→v222`,
`office-shell.js v298→v299`, `office-drawer.js v6→v7`. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`,
entry dated 2026-09-25 continued (office shell/drawer/Book of Needs UI batch), SEED_VERSION v364 →
v365.

**REAL LIVE BUG: STALE `uo-day` CLASS MADE THE ENTRY SCREENS NEARLY ILLEGIBLE, 2026-09-25
continued still further.** Josh sent a live screenshot of theuniversaloffice.com's
"Universal Office Selector" grid with every heading and card barely visible — "Holdup! This is a
problem!" — then confirmed "Its doing it in the codespace as well" once asked, ruling out a stale-
deployment theory before it was even proposed (both environments run this same repo). Root-caused:
`js/office-shell.js`'s `applyTheme()` only ever ADDS the `uo-day` class to `<body>` while
`office-active` is present, but nothing ever REMOVED it on the way back out — and `:root`'s
`body.uo-day` rule sets the DAY theme's dark ink colors unconditionally, not scoped to
`office-active`, while the entry/threshold/mode-selection screens are *always* dark by design. So
visiting any day-themed office and then returning to those screens left near-black day-ink text
painted over a screen that never stops being dark — reproduced pixel-identical to Josh's own
screenshot before touching any code. **Fixed**: `document.body.classList.remove('uo-day')` added
to all three functions that already remove `office-active` on exit — `backToSplash()`,
`showTraditionEntry()`, `showUniversalModeSelection()` (`js/office-ui.js`). Live-verified, 5
checks: an active day office still correctly keeps both classes together; all three exit paths
now leave full-contrast text; re-entering an office afterward still works normally. Cache-bust
`office-ui.js v313 -> v314`. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-25
(this session, `ui:stale-uo-day-class-fixed`), SEED_VERSION v363 → v364.

**RESOLVED — see "ADMIN TRADITION-AVAILABILITY CONTROL PANEL, BUILT 2026-09-25" near the top of
this file.** (Original note, kept for history:) Josh: "we need to build an admin control panel that
allows us to take certain offices or whole offices offline with a click." Today's Horologion unwire
(entry below) was done by hand across three files (`index.html` ×2, `js/office-ui.js`) — real,
verified, but manual and easy to get wrong or forget a spot next time.

**BYZANTINE HOROLOGION TEMPORARILY UNWIRED FROM TESTERS, 2026-09-25 continued still further.**
Josh, moved to top of queue mid-session: "I am not providing my testers with access
to The Horologion, because it has not been fully audited and corrected... gray it out like you do
with 'Catholic'... then resurface the web." Found and gated THREE reachable paths, not one: (1)
the entry-card picker (`index.html`) — "Eastern Orthodoxy" now `is-disabled`/`disabled`/
`aria-disabled`, same pattern as "Catholic"; (2) the profile "Default tradition" dropdown — its
`eastern-orthodox` `<option>` now `disabled`; (3) **the one that actually mattered** — a
returning tester whose browser already had `eastern-orthodox` saved as their entry default would
otherwise skip the entry screen entirely and land straight in Horologion every time
(`getUserEntryDefault()` auto-routes past the picker for a stored default). Added a guard in
`initializeEntryRouting()` (`js/office-ui.js`) that clears that stale stored default and falls
through to the normal (now-disabled-card) entry screen instead. Confirmed the "Another office"
grid never had a Horologion card to begin with, and no `?entry=`/`?mode=` URL shortcut exists for
it — no fourth gate needed. **Live-verified in headless Chromium, including the returning-user
case specifically** (pre-seeded `eastern-orthodox` into localStorage, reloaded, confirmed
`office-active` false / `selectedMode` null / entry screen shown / stale profile cleared) — zero
console errors. UI-level pause only, no Byzantine content or code touched — dashboard section VI
carries a note marking exactly what to reverse and where. Cache-bust `office-ui.js?v=312 -> v313`.
Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-25 continued (Byzantine Horologion
temporarily unwired from testers), SEED_VERSION v362 → v363.

**BOOK OF NEEDS DASHBOARD ROWS CLARIFIED, 2026-09-25 continued yet further.** Fourth item
of Josh's ordered plan: figure out what the two stale "unclear whether content exists" dashboard
rows actually refer to. They were section VII, "The Book of Needs" -- simply never updated since
an early point when only governance scaffolding existed, even as the feature grew into a fully-
built, role-gated, imaged 103-prayer corpus. Ran all 10 `audit:book-of-needs-*` scripts live: 7
pass clean, 3 fail, all three tracing to one root cause -- 25 `coe-maclean-*` (East Syriac,
Maclean-sourced) prayers exist in `data/prayers.json` with real taxonomy in `js/prayers.js`, but
were never given an `<option>` in `index.html`'s picker (so a user can never see or select them,
regardless of role) and were never added to the source-governance provenance inventory either.
Replaced the 2 vague rows with 9 accurate per-script rows. **Not fixed this pass** — Josh's plan
treats "figure out what these refer to" as its own step; the 25-prayer gap is now a well-scoped,
visible red item, not a mystery. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-25
continued (what needs:content/needs:governance actually refer to), SEED_VERSION v361 → v362.

**ETHIOPIAN SENKESSAR: FULL 13-MONTH REAUDIT, 2026-09-25 continued yet further.** Third
item of Josh's ordered plan. Previously only Ginbot days 1-17 had been checked against the
project's Budge source PDF, finding hallucinated and displaced saints; the other 12 months (plus
the intercalary Pagumen) were flagged amber, "not yet audited." **Built the full 366-day source
manifest first** (blocker-doc step 1, `documentation/ETHIOPIAN_SENKESSAR_DEEP_ASSEMBLY_
PROVENANCE_AUDIT_BLOCKER.md`) — installed poppler-utils (not previously in the container),
extracted all 773 pages of `data/kalendar/source-witnesses/ethiopian-synaxarium.pdf` with
`pdftotext -layout`, verified the extraction against the PDF's own printed table of contents,
parsed it into a genuine day-indexed manifest covering all 366 days with zero gaps or
duplicates. **Then cross-checked every named figure in every day's title across all 12 ordinary
months** (360 days) against the correct day's Budge text — fuzzy-matched to absorb ordinary
spelling variance without losing precision, and with the corpus's own `senkessar-index.json`
`key_feasts` days (Michael, Mary, the Cross, etc. — a separate, non-Budge liturgical convention)
excluded rather than judged. **Result, considerably worse than Ginbot 1-17 alone suggested**: of
518 ordinary-day names checked, only 67 (13.9%) are attested by Budge on their claimed day; 192
(37%) are real Budge figures on the WRONG day; 223 (43%) can't be found anywhere in the full
366-day source at all — present in every one of the 12 months, not isolated to Ginbot. **A second,
distinct finding**: the corpus's own apparent day-of-month recurring fillers contradict
themselves across different months (e.g. day 2 is "Job the Patriarch" in five months but "John
the Baptist" in Meskerem and Senne; day 13 is "Basalide" in four months but "Arsenius (Monthly)"
in three others; day 22's "Isaac of Nineveh" appears in eight months, two of them explicitly
tagged "(Monthly)," but is simply absent in four more) — strong evidence these were generated
per-month rather than drawn from one real, consistent monthly-commemoration source. **Hand-
verified, not automation alone**: Hedar days 2-5 read directly against Budge's text confirm zero
overlap between the corpus's claimed saints (Job, Zechariah, John the Apostle, Philip the
Apostle) and Budge's actual figures for those four days (Abba Sanitius & Abba Peter, Saint
Cyriacus, Saints Epimachus & Azarianus, Saint Longinus); Tekemt day 1 likewise confirms the
corpus's claimed Adam and Kyriakos are absent from Budge's real day-1 text (Anastasia — correctly
present in the corpus — plus Haritan/Cheriton, Susannah, and Mary the sister of Lazarus, none of
whom made it into the corpus entry). **Pagumen (13th month) is a notable exception** — checked by
hand given its small size, meaningfully better sourced than the other 12 (Titus the Apostle,
Archangel Raphael, and Abba Benjamin all exact matches to Budge). **Disclosed, not faked**: this
is a name-level cross-check across the whole corpus, not the full per-paragraph classification
taxonomy the blocker doc's resolution sequence calls for; the fixed-monthly-feast days were
excluded rather than judged, since no named source for that separate calendar exists in this
project yet; no remediation was performed — confirmed via grep that this corpus remains parked,
not wired into any live-rendering UI, so there is no current production exposure. The blocker
doc's own scheduling rule (defer active remediation until the Catholic offices are complete) is
unchanged; only the audit's completeness and severity assessment is updated. Dashboard
`eth:senk:other` moved amber → red, matching `eth:senk:ginbot`. Full detail:
`AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-25 continued (Ethiopian Senkessar full
reaudit), SEED_VERSION v360 → v361.

**EASTERN SEASONAL-COLOUR SOURCING, 2026-09-25 continued further still.** First item of
Josh's explicit ordered plan ("Eastern seasonal-colour sourcing — Yes, please conduct this. Once
this is done, I want to use the web deploy feature... Then, we will reaudit the Ethiopian
Synaxarium... Then you will figure out needs:content/needs:governance... Then the engine audit
sweep."). Two governance decisions Josh made directly, via `AskUserQuestion`, before any building
began: Coptic gets the non-canonical white/red/purple folk custom built anyway despite having no
codified scheme ("Build the loose 3-color folk custom anyway"), and Byzantine gets full rigorous
scope, not a partial dot ("Full scope: build the feast-category classifier first"). **Byzantine**:
sourced a real named witness — Bulgakov's *Reference Book for Priestly Church Servers*
(Russian Synodal-era) for the standard 6-color Slavic/Byzantine scheme (gold/blue/red/purple/
green/white). Classified all 381 EOR-tagged `data/saints/sanctoral.json` entries via the Orthocal
MCP tool (`search_saints`'s `full_name` field carries reliable classification signal, e.g.
"Bishop of X" = hierarch), writing new `liturgicalColorEOR`/`liturgicalColorEORSource` fields
rather than overwriting the pre-existing ANG-only `liturgicalColor`/`liturgicalColorSource` pair
(30 entries already carried that field from CPG sourcing — a real schema collision, resolved by
namespacing rather than clobbering). Final distribution: 147 red / 133 gold / 72 green / 21 blue /
4 white / 2 purple, 42 left uncorroborated rather than guessed. Great Lent's season-level purple
fallback (for days with no color-bearing commemoration) required a new `getLiturgicalSeason()`
export from `js/horologion-engine.js`, built on the engine's existing internal
`_computeLiturgicalSeason()`. Wired live into `renderHorologionOffice()` (`js/office-ui.js`) as a
small colored dot next to the date, same visual mechanism the Anglican BCP lane already used.
**Coptic**: research confirmed — not merely failed to find — that Coptic practice has no codified
per-feast color scheme beyond "the tunic must be white" (a named tasbeha.org researcher's finding);
built the folk custom Josh approved anyway from 140 of 173 OOR-tagged entries (Coptic and
null-subtradition only — the 33 Armenian/Syriac/Ethiopian-subtradition entries deliberately
excluded, out of scope), wired white/red into `renderCopticAgpeya()`. Purple/fasting days are
**not** wired — disclosed rather than faked, because no Coptic fasting-calendar engine exists yet
to drive it. Live-verified extensively in headless Chromium: Great Lent with/without a
color-bearing commemoration, a martyr day, a Theotokos feast, Coptic default and martyr days, a
full four-lane regression sweep, and the `?shell=v1` variant — all clean, zero console errors.
Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-25 continued (Eastern seasonal-colour
sourcing), SEED_VERSION v359 → v360.

**BOOK OF NEEDS GETS A REAL GROUND IMAGE, 2026-09-25 continued further still.** Josh:
"We've been adding muted graphics behind everything. Let's do that here as well. However, we need
to do imagery that is more or less ecumenical across the apostolic traditions." The design pass
had deliberately shipped none — its own CSS comment said Book of Needs "has no one tradition of
its own to veil a ground image for," correct reasoning for a lane-specific image, but not a block
on one that genuinely serves every tradition. Proposed candidates before sourcing anything (Chi-Rho
monogram / plain geometric interlace / generic parchment texture); Josh chose the Chi-Rho. **Hit a
real network-policy block** (`commons.wikimedia.org`/`upload.wikimedia.org` both denied outright —
the same restriction a prior session hit sourcing the other lanes' images); disclosed rather than
retried, Josh widened the environment's network access. Searched Commons' own API rather than
guessing a filename; chose a mosaic from the Christian catacombs of Sousse (Tunisia) over a lower-
resolution alternative — genuinely **paleochristian**, predating the Church of the East's 431
separation, Oriental Orthodoxy's 451 separation from Chalcedon, and the 1054 Great Schism, so it's
shared heritage rather than a later Western or Eastern stylization. CC BY-SA 3.0, single-author
attribution, cropped locally to remove the museum mount/plaque/wall (`images/chi-rho-sousse.jpg`).
Built the same `::before`-layer technique as the office shell's own per-lane ground imagery in
`css/office.css`, with Book of Needs' three direct children (`#prayer-selection`/`#prayer-display`/
`#prayer-back-bar`) explicitly promoted to `position:relative` for the same stacking-order reason
the office shell's rail/page/margin/keeping areas needed it. **Tuned by measurement, first pass —
no multi-round correction needed** (unlike Coptic/Byzantine's own history): started from those
images' own converged filter values; measured WCAG contrast against `--bon-ink` from live
screenshots — night median 11.56:1, day median 9.71:1, both clear of AAA's 7:1 at every percentile
checked. Confirmed visually too, not contrast numbers alone (the project's own "just looks like a
blur" lesson) — the mosaic and the Chi-Rho itself are genuinely recognizable as texture in both
themes. Live-verified in headless Chromium across both themes and the single-prayer display view,
zero console errors beyond the pre-existing sandboxed font-CDN failure; `images/CREDITS.md`
updated; both Book-of-Needs audit scripts still pass. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`,
entry dated 2026-09-25 continued, SEED_VERSION v358 → v359.

**BOOK OF NEEDS "FOR MINISTERS" PRAYERS WIRED INTO THE EXISTING ROLE LADDER, 2026-09-25 continued
further.** Josh, live in the app: unchecked "Show prayers for other ministries," no
ordained role set, Anglican-scoped Book of Needs — and could still see "Vesting: The Stole
(Priest)." Real gap, not a bug in the toggle: `BOOK_OF_NEEDS_OPTION_MINIMUM_TIER`
(`js/prayers.js`) held only 13 entries, all Church-of-the-East/Maclean-sourced — zero of the
Anglican/Orthodox "For Ministers" vesting/serving prayers (18 options total) had ever been added
to it, so they all showed regardless of role or the toggle. **Fixed**: order-specific vestments
(Stole (Deacon) → `deacon`, Stole (Priest)/Chasuble/Orthodox Epitrachelion/Phailonion → `priest`,
plus "For a Deacon Before the Liturgy" → `deacon`, found while reading the full list) gated to
their exact order, per Josh's direct confirmation; the genuinely ambiguous rest (servers/acolytes
are lay in many traditions — Amice, Alb, Cincture, Journey/Entering/Before-Serving/After-Serving,
the Full Orthodox Sequence) gated to `reader`, the lowest minor-order rank. **The
self-identification mechanism Josh asked for ("let the person specify a minor order") already
existed** — `#profile-ministry-role` already offers "I am a reader (minor order)" / "I am a
subdeacon (minor order)," wired to the full 8-role ladder built 2026-08-30
(`documentation/book-of-needs-role-access-governance.json`). This work only connected 18 prayers
to a ladder that was already built and already selectable. Live-verified in headless Chromium
across lay/reader/priest profiles and the toggle, both on and off — every combination behaves
exactly as the rank ordering predicts. A separate question raised in the same conversation
(whether the toggle's *label* should reference traditions instead of ministries) was investigated
and found to be based on a misunderstanding — the label is accurate to what the control does —
and Josh confirmed directly: leave it as-is. Settled, not open.
Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-25 continued, SEED_VERSION v357 →
v358.

**TWO HOUSEKEEPING ITEMS PROPERLY ROOT-CAUSED AND FIXED, 2026-09-25 continued.** Josh
reported the dashboard displaying incorrectly on a fresh GitHub Codespaces checkout of this branch
(headings/notes rendering, every book/office stamp grid missing, in both light and dark mode —
toggling theme changed nothing). Traced by reproducing commit `3345abc~1` locally and comparing
screenshots pixel-for-pixel against Josh's own — exact match. **Root cause: the codespace was six
commits behind** (`git fetch` showed `8290726d..8efe271a`); `git pull` fixed it immediately — not a
code defect. While investigating, picked up the two items the entry below had left "for next
session": **`checkSeedVersion`'s TypeError, properly root-caused this time** — `window.storage`
(`get`/`set`/`list`/`delete`, used throughout this file) has never been a real browser API, confirmed
exhaustively (grepped the whole repo, used nowhere else, never assigned anywhere, unchanged since
this file's very first commit `35f9e11`). Nobody caught it in months of real use because the true
source of truth for every stamp has always been the hardcoded `status:`/`note:` fields committed by
hand each session — `window.storage` only ever backed a secondary feature (clicking a stamp
in-browser to override it locally), silently dead since day one, invisible because every call was
try/catch-swallowed back to the correct committed defaults. **Fixed**: replaced with real
`localStorage`, namespaced under a new `audit-ledger:` prefix (can't collide with the dark-mode
toggle's own working `uo-ledger-dark` key, the model this fix follows). Live-verified: zero console
errors, a manual stamp click now genuinely persists across reload, reset-all still works correctly.
**And the pre-existing `audit-book-of-needs-tradition-context.mjs` "tradition filtering is strict"
failure, properly re-verified** — the prior session's `git stash` check only reverted uncommitted
changes, not that session's own ~40 prior commits, so it was rightly flagged "provisional." Re-checked
against the actual last commit before that whole session began (`438a1fa`, via a clean `git
worktree`) — same failure, now genuinely confirmed pre-existing. Root-caused further: it's a stale
test assertion (a literal string match against old code phrasing), not a real filtering bug — the
real `prayerOptionAppliesToContext()` filters correctly, just phrased differently since a legitimate
later addition (role-gating) was stacked on top. **Fixed the assertion**; 21/21 checks now pass. Full
detail: `AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-25 continued, SEED_VERSION v356 → v357.
**SUPERSEDED 2026-09-25 continued further — BACKFILLED, on Josh's direct instruction.** The gap
above (`AUDIT_GOVERNANCE_LEDGER.md`'s tail stopped at v338 despite `SEED_VERSION` reaching v356) is
now closed: seven entries covering v339 through v356 added, reconstructed directly from
`audit-ledger.html`'s own contemporaneous dashboard rows (extracted via a safe `node -e` eval of the
live array, not regex against escaped quotes) plus git history for the one version boundary
(`v342`→`v343`) no row's own text stated explicitly. Every transition confirmed directly against
`git show <hash>:audit-ledger.html` across the real commit range, not inferred from row order.
Disclosed plainly at the top of the backfilled block: this is reconstruction from the existing
record, not fresh live re-verification — it restates what each session already verified live, per
that session's own account, not a new check performed now. `AUDIT_GOVERNANCE_LEDGER.md` now reads
continuously from v337 through the current v357 with no gap.

**BOOK OF NEEDS GOT ITS OWN DESIGN PASS, 2026-09-25 — AND TWO REAL JS SYNTAX BUGS IN
`audit-ledger.html` WERE FOUND AND FIXED ALONG THE WAY.** After Phase 6 closed (entry directly
below), Josh said "Give Book of Needs its own design pass now too." Researched first, per standing
practice: confirmed via full-repo search that **no design source for Book of Needs exists anywhere**
— the six PNGs in `documentation/design/screens/` and `DESIGN_HANDOFF_SOURCE.md` cover only the
office/entry/threshold screens, and the handoff's own stated reason survives: *"It is not an hour:
no ordered blocks, no liturgical day, no rail to draw."* Asked Josh how to proceed rather than
guessing; he chose "propose a design grounded in the existing shell system." Wrote a full proposal
(saved as a plan, approved via ExitPlanMode) before writing any code, then implemented it in full:

- **One consolidated CSS block** (`css/office.css`, headed `BOOK OF NEEDS -- its own design pass,
  2026-09-25`) replaced roughly a dozen scattered old-skin rules (dark base layer + a later
  "parchment app shell" override, cream/gold gradients, heavy shadows, rounded corners). New block
  defines `--bon-*` custom properties under `#individual-prayers-section` with the **same literal
  values** as the shell's `--uo-*` tokens (ground/ink/accent/rubric/hairline, both night and day),
  reuses `--uo-face-title` (Cinzel) for titles and `--uo-face-prayed` (Cormorant Garamond) at the
  office's own body size/leading for prayer text, and `--uo-face-machine` (IBM Plex Mono) for
  kickers/group headers — no new visual ideas, everything copied from an already-approved rule.
- **Theme mechanism deliberately kept separate, not merged into the shell's.** `js/office-shell.js`'s
  `applyTheme()` is explicitly scoped to `body.office-active` only, with its own comment calling
  this a hard-won fix after "six patches in a row." Wiring Book of Needs into the shell's Auto/
  Light/Dark control would have undone that deliberate boundary. Instead Book of Needs keeps its own
  existing Dark Mode toggle and `body.dark-mode`/`body.light-mode` classes exactly as before —
  same look, independently driven.
- **The prayer picker (103 prayers/23 groups) was reskinned, not rebuilt**, by reusing the settings
  drawer's own row/group visual language (`.uo-drawer-section-head`/`.uo-drawer-office`'s
  hairline-separated rows) — zero DOM/JS changes to the picker's own dropdown code.
- **Two real pre-existing bugs found and fixed while assembling the new CSS, not caused by it**:
  two `!important`-heavy selector lists incorrectly combined `#individual-prayers-section
  .app-mode-return` with `.admin-app-shell .app-mode-return`, which would have silently overridden
  all new Book of Needs button styling regardless of specificity — removed only the Book-of-Needs
  fragment, left Admin's copy untouched; and a fully redundant later-in-file duplicate of
  `.app-book-needs-show-all` at the same specificity, which would have won the source-order tie and
  silently restored the old parchment colors — deleted, its explanatory comment preserved on the
  new rule.
- `js/prayers.js`'s `showSinglePrayer()` had a large inline `style="font-family:'Cinzel',serif;..."`
  attribute on the source-citation `<p>` that would have beaten the new stylesheet rule regardless
  of specificity (inline always wins) — removed, now styled purely by CSS.
- Verified via `getComputedStyle` + screenshots across dark/light × 3 viewports, tradition-scoping
  functional check (78→4→78 visible prayers through the filter chain), and a full regression sweep.
  `scripts/audit-book-of-needs-design-shell.mjs` had its stale "parchment app shell" marker updated
  to match and passes. **Flagged, not fixed, and not fully verified pre-existing**:
  `scripts/audit-book-of-needs-tradition-context.mjs` fails on "tradition filtering is strict" —
  believed unrelated to this pass, but the check used (`git stash`) only reverts uncommitted
  changes, not this session's many prior commits, so this is provisional, not confirmed. Re-verify
  against a true pre-session commit before treating it as settled.

**While updating `audit-ledger.html`'s ledger row for this work, found the ledger's own giant
`UI_REDESIGN` script had been silently broken since earlier this session** — three separate
instances of a real, repeatable bug I had introduced myself in earlier commits: using literal
double quotes to set off a short quoted phrase *inside* an already double-quoted JS string literal
(e.g. `name:"...its stale "Phase 4 deletes it" comment..."`), which silently truncates the string
early and turns the rest into invalid bare tokens — and a single syntax error anywhere in a
`<script>` block prevents the *entire* block from executing, not just the broken line. Found via a
custom Python scanner plus `node --check` on the extracted script (NOT caught by the `grep -c`
substring checks used after earlier edits this session — a real gap in verification discipline;
any future `audit-ledger.html` edit should be validated with `node --check`, not substring presence
alone). All three fixed (inner double quotes → single quotes, matching the file's own convention
elsewhere); confirmed via `node --check` (exit 0) and a live Playwright load (`UI_REDESIGN rows: 21`
— the array now loads and executes). Committed as `3345abc`.

**SUPERSEDED 2026-09-25 continued: FIXED — see the top entry.** loading `audit-ledger.html` live
threw `TypeError: Cannot read properties of undefined (reading 'list') at checkSeedVersion
(audit-ledger.html:890:39) at init (:917:9)`, logged as "seed version reseed failed — dashboard may
show stale data until this succeeds." This was masked by the syntax errors above until they were
fixed. Root cause turned out to be much older than this session: `window.storage` was never a real
API, present unchanged since this file's first-ever commit. Left here only so the original finding
stays visible in place; do not re-cite it as still open.

**PHASE 6 IS NOW COMPLETE, 2026-09-25.** Josh asked directly whether the UI refactoring
was done; the honest answer was no — Phases 1–5 were done, but Phase 6 still had three disclosed
remaining items and Book of Needs hadn't been touched. He said "Proceed with six." Researched all
three via three parallel Explore agents before touching anything, since this exact file has already
caused real reverts from confident-but-wrong reasoning. All three findings changed the shape of the
work:

**The "third ~170-line mobile-repair CSS block" was not legacy cruft — it's load-bearing.**
`css/office.css:2091–2189` (99 lines today, already partly trimmed by an earlier stage). Of eleven
selector groups, only **one** was confirmed dead (a `body.mobile-sidebar-open
#daily-office-section::after` dim overlay — zero JS anywhere sets that class). Everything else is
live, and the `html, body`/`#main-content` `overflow-x:hidden` rules appear to be the **sole
mechanism** preventing horizontal scroll at mobile widths on both Daily Office and Book of Needs —
`office-shell.css` has zero `html`/`body` selectors and never references `#daily-office-section` at
all. The "genuinely unclear whether the new shell supersedes it" question is resolved: it does not.
Deleted only the one dead rule; verified `scrollWidth === innerWidth` at 375/390px on both screens,
identical before and after (the deleted rule was never reachable).

**The legacy print block had real dead code mixed with rules shared by Book of Needs.**
`css/office.css`'s two `@media print` blocks, split apart rather than treated as one unit:
- Confirmed dead, deleted: the `.ethiopian-theme .rubric-text` rule (same basis as this project's
  earlier full removal of `.ethiopian-theme` — the class is never applied anywhere); `.psalm-verse`/
  `.verse-num` (nothing renders these classes — the live psalm renderer uses `.psalm-block`/
  `.psalm-stanza`/`.psalm-half-verse` instead, leftovers from a superseded approach).
- Removed as redundant, not dead: `.ordo-control`/`.setting-group` from the print `display:none`
  list — the classes ARE used (they're the "moved legacy controls"), but already hidden by their
  own always-on ancestor `#legacy-office-controls`'s inline `display:none`, confirmed via a direct
  hidden-ancestor DOM walk, so this print-specific rule was pure redundancy.
- **Kept, confirmed load-bearing and shared with Book of Needs**: `.office-container` and
  `.component-text` — `js/prayers.js` directly renders both for the real single-prayer print path,
  and `office-shell.css` has no print rule for either at all, so office.css's rule is the *only*
  thing governing their print appearance. Deleting either would have been the exact regression a
  prior session's own comment warned about when it left this block untouched.
- Corrected two `office-shell.css` comments citing this block (one stale line number, one citing
  the now-deleted `.psalm-verse` as a reason to stay screen-only-scoped) and removed the matching
  dead `.office-container .psalm-verse` selector from `office-shell.css`'s own typography rule while
  in the area — one small addition beyond originally planned comment-only scope for that file,
  disclosed rather than left as a second copy of the same dead weight.

**No print-preview baseline ever existed to "regenerate" against.** Confirmed via full-repo search:
zero print-emulation test tooling anywhere, zero captured baseline artifacts — the "pre-Phase-6
baseline" mentioned three times in this note was aspirational, never real. Printing has no in-app
affordance at all (no Print button anywhere; purely Ctrl/Cmd+P). Josh chose ephemeral verification
over permanent committed tooling. Built a throwaway Playwright print-emulation check covering all
seven printable states (five office lanes, Book of Needs, Bible Browser, plus the open settings
drawer), captured honestly as a "before this cleanup" reference rather than a fictional snapshot of
the past. Two property diffs after the edit were investigated, not dismissed: the two redundant
selectors' own `display` flipped from `none` to `block` as expected (still invisible via their
hidden ancestor); `body` background/color showed small RGB jitter that reproduced identically on a
same-code rerun, proving pre-existing headless-Chromium print-rendering noise, not a regression.
Screenshot pixel-diff: **0/8 nonzero across every printable state.** Full regression sweep clean.

**Phase 6 — "delete the old skin outright" — is now fully closed.** Everything disclosed as
remaining across this whole project's Phase-6 work is done. The one thing still explicitly out of
scope is Book of Needs' own design pass, deferred to "after" Phase 6 from the very start — not a
Phase 6 gap, never claimed to be done here.

**DONE, LIVE-CONFIRMED, 2026-09-25: the remaining ~187 `body.shell-v2` occurrences in
`css/office-shell.css` are unscoped — the broader unscoping work deferred at the end of the
entry-screen work below.** Executed the plan from the entry below's three-agent audit, in 8 staged
commits, each verified against the *immediately preceding* stage (not Stage 0) with a 4-lane ×
6-viewport `getComputedStyle` sweep plus pixel-diffed screenshots.

**Two real specificity gaps found and fixed beyond what the original audit caught** — the audit
was thorough but not exhaustive, and both were caught only by directly re-verifying which rule
actually wins after a naive strip, not by trusting the audit's own specificity table:
1. **Stage 4**: the base `.office-container` rule (and its reappearance in the `p, li` selector
   list) would land at an *exact specificity tie* with office.css's own bare `.office-container`
   (background/max-width/width/margin/padding/border-radius/box-shadow/color — nearly the same
   property set) once fully unscoped. The audit had only computed this tie for the `::before`/
   `::after` variant. Fixed the same way: kept `.office-active` for a real specificity margin
   instead of a load-order-only tie. Confirmed via direct `document.styleSheets` rule inspection
   (not just computed values, which can tie at the same value from a different source) that the
   shell's rule is now the sole winner, with a margin.
2. **Stage 8**: a final whole-file grep caught `.uo-drawer-open` and its hover/focus states still
   scoped — missed in Stage 2 because that stage's edit range started at `dialog.uo-drawer`'s line
   number, and `.uo-drawer-open` (the ordo-line button that opens the drawer, a different element)
   sits just before it in the file. Fixed the same way as the rest of Stage 2, after confirming
   zero office.css competitor.

**Stage 3** fixed the one risk the audit itself flagged in advance: `.uo-drawer-moved strong`/
`label`/`input[checkbox]` would land at an exact tie (`strong`/`label`) or an outright **loss**
(`input[checkbox]` — office.css's `.setting-group label input[checkbox]` is one selector-chain
element ahead, which would have silently reverted `margin-right` from 8px to 6px) against still-live
office.css `.setting-group` rules. Fixed by anchoring on `dialog.uo-drawer` (a real, already-used
selector, not invented for this) instead of `body.shell-v2`, giving a genuine margin instead of a
load-order tie. Also, mid-stage, discovered BCP/Horologion's clock-driven default office was
drifting between captures during this long session (Sixth Hour → Ninth Hour between two runs,
confirmed by comparing rendered titles, not assumed) — added office-pinning to the verification
script for the remaining stages.

**Stage 5**, the highest-stakes stage: unscoped the `#main-content.app-primary-canvas` grid trio
(base + its mobile and print `@media` overrides) together, in lockstep, preserving the
equal-specificity/source-order-decides relationship the mobile-grid hotfix (entry below) had just
built — splitting them across stages would have changed a deliberate tie into an outright win, same
visual result today but a more fragile mechanism than what the hotfix established. Zero diffs
across all 24 lane/viewport checks; print emulation confirmed `display:block` still applies.

**Stages 1, 2, 6, 7** unscoped, respectively: the root `--uo-*` token blocks (zero collisions
anywhere in the repo, confirmed by grep); the drawer's bulk chrome (~72 selectors, zero office.css
`dialog` selectors exist anywhere); the remaining `#main-content` standalone rules (background
variant, ground-image `::before`, z-index group, back-button, 8 per-tradition decorative rules) plus
the `office-active` padding override (independently re-confirmed its "office.css:2270/2274" citation
was already stale — that region is unrelated Roman Breviary content today — before relying on it);
and the ordo line plus the full rail family (verified the mobile rail height cap, 34vh from the
earlier hotfix, still applies correctly on both long-rail lanes).

**Flagged, then fixed the same day**: `.shared-office-nav-appearance-card` (found while reading
Stage 6's range, left scoped at the time since it wasn't in the three-agent audit's scope). Its own
comment claimed "Phase 4 deletes these sidebars and this rule goes with them" — stale: the four
legacy sidebars *are* deleted, but this rule is unrelated to them. It hides the shared office
navigator's *own* built-in "Appearance" card (`js/office-ui.js`'s `renderSharedOfficeNavigation()`,
rendered whenever a lane config sets `showAppearanceToggle: true` — still true for three lane
configs today, confirmed by grep, so the card genuinely still renders with its own legacy Dark Mode
checkbox, superseded by the shell's own Auto/Light/Dark control same as the sidebars' copy was, but
a distinct element — still needed, not dead). Josh asked for it directly afterward ("fix
`.shared-office-nav-appearance-card` now too"); confirmed office.css has zero rules for this class
at all, so nothing to compete with regardless of specificity — unscoped outright, comment corrected.
Verified the card still renders and still computes `display:none` in all three lane configs that
set the toggle; 24-way check + 24 screenshots zero diffs; **whole-file grep now confirms
`office-shell.css` carries zero real `body.shell-v2` selectors anywhere** — the unscoping work is
closed in full, not partial.

Full regression sweep (migration-check, migration-functional, stage1-check, stage1-bon-check,
cross-lane-stress, mobile-check) re-run clean after all nine changes. Cache-bust `office-shell.css`
314 (from the hotfix below) → 326 across the sequence. SEED_VERSION v352 → v354.

**Remaining, disclosed, not done — outside this pass's scope entirely**: the legacy print block
cleanup, the third ~170-line mobile-repair CSS block, and print-preview regeneration.

**DONE, LIVE-CONFIRMED, 2026-09-25: entry-screen hairline modernized; a real, currently-live
mobile/print grid bug found and fixed, along with a second bug it exposed.** Josh: settle the
hairline color question, then unscope the rest of `office-shell.css` and do the audit that needs.
**Hairline (settled)**: the family-grid/tradition-panel/mode-grid `border-top` — left as the literal
brown per the entry below's finding 2 — modernized to `var(--uo-hairline)` (gold on this
always-night-palette screen), matching every other hairline there. Verified via `getComputedStyle`
and a pixel/JSON diff showing only the two `borderTopColor` values changed. Commit `70b77f3`.

**Audit (started, redirected)**: began the ~186-occurrence unscoping audit via three parallel Explore
agents (root tokens, `.office-container`, `#main-content` shell grid; the `uo-ordo`/rail/page/margin/
keeping internals; the `.uo-drawer-*` drawer). Two real risks surfaced for the eventual unscoping
plan (not yet acted on): unscoping `.uo-drawer-moved input[type="checkbox"]` would lose
`margin-right` outright to a still-live `office.css` rule (not a tie — a real loss); two more
`.uo-drawer-moved` selectors would become exact specificity ties with `office.css` rivals, saved only
by stylesheet load order.

While verifying one agent's claim, found a **real, currently-live production bug unrelated to
unscoping**: `office-shell.css`'s mobile (`@media max-width:768px`, line 1021) and print
(`@media print`, line 1076) `#main-content` overrides were written without `.app-primary-canvas` —
one class short of the always-on base rule's specificity — so both have been dead code since
written. Confirmed live: at 375px, `getComputedStyle(#main-content).gridTemplateColumns` read
`"236px 0px 268px"` — the desktop 3-column grid, never the intended mobile single column — with the
actual prayer-text column squeezed to 0px and `#main-content`'s real width (1128px) silently
overflowing the 375px viewport, clipped rather than scrollable. `mobile-check.mjs` never caught this
because it only checks for console errors, never computed grid geometry. Disclosed to Josh rather
than folded silently into the unscoping plan or deferred past it; he chose to fix it now, as its own
hotfix, before the unscoping plan continues.

**Fixed**: added `.app-primary-canvas` to both selectors (matches the base rule's specificity so the
later, narrower-media rule wins by source order; confirmed no property overlap with `office.css`'s
own mobile/print `#main-content` rules, so no new cross-file conflict). This exposed a **second**
bug, caught before shipping rather than after: `.uo-rail` had no height cap for its "top strip"
mobile layout, so a long office (East Syriac: 33 steps; Horologion) grew the rail to 1300px+ and
squeezed the prayer text to ~0px again, on the other axis — tested across four traditions (Daily:
unaffected, no rail; Coptic Agpeya 10 items; East Syriac 33; Horologion) before Josh chose to fix
this in the same hotfix. Capped `.uo-rail` at `max-height:34vh` with its own `overflow-y:auto`,
matching how `.uo-page` already scrolls its own overflow rather than growing past its grid row.
Verified: single-column layout now genuinely applies at ≤768px and `display:block` under print;
prayer text gets 270–520px instead of 0px on every long-rail tradition tested; zero pixel diff and
identical grid geometry at 1440/1024/820px width (above the 768px threshold — no desktop regression);
full regression sweep clean. Cache-bust `office-shell.css` 314→316. Commit `cd0df5a`.

**Remaining**: the broader unscoping plan itself — not yet written, now that the code it will touch
is actually correct — covering the root tokens/`.office-container`/shell-grid findings, the two
`.uo-drawer-moved` risks above, and everything else the three research agents mapped.

**DONE, LIVE-CONFIRMED, 2026-09-25: the sidebar-control migration Phase 6 stage 4 found
missing — done.** Josh, directly: "Migrate the remaining sidebar controls into the drawer." This is
exactly the prerequisite stage 4's own note named as real, unattempted work: every control
`radioRow()`/`checkboxRow()`/`selectRow()` surfaces via a synthetic drawer row reads its real
`<input>`/`<select>` in place rather than moving it, and every "which office" control is written
back to by the existing shared-office-nav mechanism — both patterns need the real element to
exist *somewhere*, but neither cares *where*, since `document.querySelector`/`getElementById` find
an element regardless of its position in the tree. That's the whole migration: physically relocate
(via `appendChild`, a real DOM move, not a clone) every remaining real control into a new,
permanently-hidden host in the drawer's own DOM — `hosts.legacyState` in `js/office-drawer.js` —
so the four legacy sidebars can eventually be deleted without breaking anything reading these
elements from their old location.

**Read every remaining control's exact markup first** (all four sidebars, in full) rather than
guess boundaries, then moved the smallest container that holds exactly one setting and nothing
load-bearing else — 11 groups in total: BCP's "Which office" (`office-time`), "Office Mode"
(`ang-office-mode`), "Liturgical Settings" (`rite`, `minister`, `creed-type`, `gospel-placement` +
the 30-Day Psalter toggle — the Lectionary Alternates sub-group inside this same container was
already moved by the existing `moveRealControls()`, confirmed it wouldn't be double-moved since a
real DOM move leaves nothing behind to move again), and "Marian Element" (`marian-element`,
`marian-antiphon-pos`); Coptic's "Active Hour" (`cop-hour`); East Syriac's override panel
(`esy-hour-override`, `esy-override-date`), the already-`display:none` `esy-time` radio wrapper,
and "Office Mode" (`esy-mode`); Horologion's 14-office list (`horologion-office`), "Calendar Mode"
(`hor-eo-calendar-select`), and "Display Depth" (`hor-depth-select`).

**Two controls deliberately left behind, confirmed unread anywhere else**: `toggle-dark` (BCP's old
"Appearance" Dark Mode checkbox — a prior session already replaced every read of it with an
attribute-based selector, confirmed by its own code comment; superseded by the shell's independent
Auto/Light/Dark control) and `hor-btn-diag` (Horologion's dev-only Diagnostics toggle button — reads
its own id only to update its own label text, nothing else depends on it). Also left behind, out of
scope for a *control* migration: East Syriac's three read-only display boxes (Current Cycle/Fasting
Character/Anaphora — written to, never read from) and the plain date-picker inputs.

**Verified live, thoroughly, not just "it didn't crash"**: confirmed all 11 groups actually landed
inside the new hidden host across all four lanes (`hostChildCount: 11` every time, every named
control found `true` inside it); then ran real functional tests, not just presence checks — toggled
Rite via the drawer's synthetic select and confirmed the real radio flips; toggled Marian Element to
Theotokion and confirmed it sticks; clicked Coptic's "Third Hour" in the drawer's own office grid and
confirmed both the rendered title AND the underlying `cop-hour` radio actually changed; toggled East
Syriac Cathedral→Monastic via the drawer and confirmed it took; toggled Horologion's Display Depth
and switched its office via the drawer's grid, both confirmed. Full four-lane envelope sweep, Book of
Needs, both entry screens, and the stage-2 lane-switch fix all re-verified — every screenshot
pixel-identical to its pre-migration baseline (0 nonzero pixels), zero console errors throughout.
Screenshotted the open drawer itself too: no stray or duplicate old-skin controls leaked into view —
the moved elements are genuinely invisible, exactly as intended.

**What this unlocked, now also DONE**: the four legacy sidebars' remaining content was, at that
point, either already-moved, moved by that session's work, or confirmed safe to leave behind. See
the entry immediately below for the sidebar HTML deletion itself, done later the same day.

**DONE, LIVE-CONFIRMED, 2026-09-25 (latest): the four legacy sidebars and `#sidebar-toggle` are
deleted outright — not just hidden.** Josh, directly: "Now delete the legacy sidebar HTML and their
hiding rules." Investigating first (same discipline as every other Phase 6 stage) found this was
**not** the mechanical deletion the original plan assumed. Two real blockers, confirmed by reading
the actual code, not guessed:

1. **The four sidebar divs are the app's only "which tradition is active" state.** `selectMode()`/
   `toggleSidebar()`/`backToSplash()` track the active lane purely by toggling a `mode-hidden` class
   on these exact elements. Two *other* files independently re-derive the same thing from the DOM —
   `js/office-shell.js`'s `currentLane()` and `js/office-drawer.js`'s `currentModeKey()` — both
   because `window.selectedMode` doesn't exist: `js/office-ui.js`'s `let selectedMode` is a bare
   top-level `let`, never a `window` property, a bug class `AUDIT_GOVERNANCE_LEDGER.md` already
   recorded once.
2. **The CURRENT, live "which office" picker is injected as a literal child of whichever sidebar
   matches the active mode**, not old dead UI sitting near it. `renderSharedOfficeNavigation()`
   (`js/office-ui.js`) does `document.getElementById(config.panelId)` and appends the real,
   working navigator into it.

Deleting the divs as originally planned would have broken tradition-switching and the office picker
outright. Disclosed this to Josh; he chose the full refactor over leaving the sidebars in place
permanently. Planned in `EnterPlanMode`, with a Plan agent independently verifying the investigation
and catching two real gaps before any code was written: exposing `selectedMode` as a **mirrored
variable** (rather than a function) would have gone stale the instant it was reassigned by bare
identifier, reintroducing the exact bug class above; and a `MutationObserver` in
`office-drawer.js`'s `init()` also iterated the array shape about to be restructured.

**Five staged, independently-committed, independently-verified stages** (each with its own real
verification, not just "should work"):
- **Stage 1**: exposed `js/office-ui.js`'s existing `selectedMode`→`modeKey` mapper on `window` (a
  function, never a mirrored variable); rewrote `currentLane()`/`currentOfficeId()`/
  `currentModeKey()` to use it. Caught and fixed a second real bug while doing it, unrelated to the
  plan — `office-shell.js`'s `watchLaneChanges()` iterated the same array shape being restructured,
  would have crashed. New `cross-lane-stress.mjs` (load → Coptic → East Syriac → Horologion → BCP,
  one session) confirmed correct mode detection and zero cross-lane office-grid contamination — the
  one scenario nothing existing tested, and exactly the mechanism being changed.
- **Stage 2**: pointed `renderSharedOfficeNavigation()` at one new neutral host
  (`#legacy-office-controls`) instead of the active sidebar; deleted ~150 lines of legacy-hiding
  machinery that existed only to keep the live navigator from clashing with old sidebar content next
  to it. Found and updated one now-obsolete audit script; found two others already broken for
  unrelated pre-existing reasons (stale Ethiopian-mode markers, an assertion the sidebars are
  visible — untrue since `shell-v2` became unconditional, well before this session) — left alone,
  disclosed rather than silently patched or ignored.
- **Stage 3a**: extended `moveLegacyStateControls()` to cover five real gaps a full cross-reference
  surfaced — most importantly `#ecumenical-devotions-section`, whose `bcp-only-hidden` class is
  still read by `buildKeep()`'s Marian-rows gate; leaving it unmoved would have shown Marian settings
  even under BCP Only Mode. Reproduced and confirmed fixed.
- **Stage 3b**: physically moved the remaining real markup of all four sidebars into
  `#legacy-office-controls` as static HTML — every id/name/onchange handler preserved exactly, only
  decorative chrome dropped. Confirmed the simplified markup doesn't break `borrowedSummary()`'s
  `childNodes[1]`-based label extraction.
- **Stage 4**: deleted the four sidebar divs, `#sidebar-toggle`, `toggleSidebar()`, and every
  confirmed-dead CSS block this unblocked — trimmed from mixed selector lists where real, still-live
  rules (`#main-content`, `.shared-office-nav`, `.mode-btn`, etc.) shared the same block, not deleted
  wholesale.
- **Stage 5**: removed the now-dead `getElementById(panelId)`-plus-`classList` bookkeeping left in
  `selectMode()`/`backToSplash()`.

Two apparent regressions in office-switch tests (East Syriac, Horologion "before" matching "after")
were investigated rather than dismissed — both confirmed to be real wall-clock time already matching
the live time-of-day default, not test flakiness, confirmed by switching to a guaranteed-different
office and watching the title actually change. Full accumulated script suite stayed clean at every
stage boundary, zero console errors; entry-screen, open-drawer, and 390px-mobile screenshots
pixel-consistent throughout. Cache-bust `office-ui.js` 308→312 (across stages), `office-shell.js`
(the JS file) 297→298, `office-drawer.js` 3→6, `office-shell.css` (the CSS file — distinct from
`office-shell.js` above) 308→309, `office.css` 219→220. SEED_VERSION v349 → v350.

**Remaining, disclosed, not done (as of that entry — see the entry directly below for what's since
closed)**: `office-shell.css` unscoping (the original Phase 6 stage 5, attempted and reverted once
already), the deferred entry-screen CSS split, the legacy print block cleanup, the third ~170-line
mobile-repair CSS block whose relationship to the new shell's own mobile CSS is still genuinely
unresolved, and print-preview regeneration against a pre-Phase-6 baseline.

**DONE, LIVE-CONFIRMED, 2026-09-25 (latest): the entry/threshold screens' old parchment CSS is
deleted and `office-shell.css`'s corresponding block is unscoped — the two coupled deferred items
above, closed together.** Josh chose to do both together, given the entry below records both prior
attempts at pieces of this were reverted for the same root cause: `office-shell.css` only ever
recolored `#tradition-entry` ("Where do you pray?") and `#mode-selection`/`#uo-threshold-grid`
("Choose a tradition") — it never rebuilt their actual grid layout or viewport-centering math, so
deleting `office.css`'s rules broke real behavior, and unscoping `office-shell.css` (which relied on
extra `.shell-v2` specificity to beat still-live `office.css` rules) broke it a second way.

**This time: port every missing declaration into `office-shell.css` first, verify it reproduces
today's exact appearance, only then delete the `office.css` originals and unscope.** Researched via
an Explore agent (full selector map, exact line numbers) and a Plan agent (staged sequence from that
map) — both used as a starting draft, neither trusted blindly. Reviewing both against the actual
files directly caught two real transcription errors before they could cause a third revert:

1. `border-radius: 22px` in `office.css`'s two `max-width:760px` overrides is provably dead code
   today — `office-shell.css`'s unconditional `border-radius:0` (specificity (0,1,2,1)) already beats
   it (0,1,1,0) regardless of viewport, confirmed live via `getComputedStyle` reading `"0px"` at
   every one of 6 tested viewports including mobile. Omitted from the port rather than reviving
   dead-code-turned-live rounded corners.
2. The family-grid/tradition-panel/mode-grid hairline (`rgba(103,58,31,0.12)`, the old parchment
   brown) has no `office-shell.css` override at all — confirmed live it's still rendering in that
   brown today — and `var(--uo-hairline)` on this always-night-palette screen resolves to a visibly
   different **gold** (`rgba(201,168,76,0.12)`). Porting the token would have been a real, if subtle,
   unrequested visual change disguised as a neutral refactor. Ported the literal brown value instead;
   flagged the one remaining old-palette color on an otherwise fully-restyled screen as a separate,
   undecided design question for Josh — **not resolved in this pass.**

Given both of the above, execution discipline for the six stages was explicit: every declaration
ported was copied via `Read` directly from the cited `office.css` line range at edit time, never
retyped from the plan or agent output.

**Six stages, each independently committed and verified** (screenshots at 6 viewports — the 3-col/
2-col grids, the 861px/761px collapses, the 1100×760 desktop variant, combined narrow+short — *plus*
`getComputedStyle` spot-checks, since a pixel diff alone isn't guaranteed to surface a subtle
single-property miss): **Stage 1** ported typography. **Stage 2** ported card-grid and icon layout —
the gap that caused the *first* prior revert (the family grid collapsing into an unstyled row).
**Stage 3** ported container sizing and the three viewport-stabilization breakpoints — `office.css`
declares `#tradition-entry`'s sizing *twice* (a base rule, then a later same-specificity rule that
wins for every property it redeclares); only the winning, later values were ported, confirmed live at
every viewport including the 1100×760 and sub-760-height combinations nothing else in the matrix
exercises. **Stage 4** deleted `office.css`'s old rules, preserving every `[hidden]`/`display:none`
visibility and drill-down step-routing gate, `#splash-bg`'s own rules, and `.app-sponsor-link`. While
investigating this deletion, found and verified safe a **third** thing neither research pass caught:
a much older, pre-redesign bare `#mode-selection`/`#mode-selection h1`/`#mode-selection p` rule
predating the `.app-mode-shell` system entirely — confirmed by hand and then via direct CSS-rule
inspection that every property it sets is still outranked by a still-live, higher-specificity
`.app-mode-shell`-qualified rule, so it stays exactly as dead as it always was. Stage 4's own
verification also caught a **real bug this session introduced in Stage 2**: the icon port dropped
`border-radius:999px`, turning the drill-down icons from circular to square — caught because the
screenshot diff showed an identical 1152-pixel diff across every viewport regardless of size (unlike
the established ~50-pixel clock-noise pattern), investigated immediately, and fixed forward in the
same Stage 2 block (already pushed; per this repo's own convention, never amend pushed history) with
the gap disclosed in Stage 4's own commit message. New `entry-routing-check.mjs` drove the actual
drill-down flow, confirming the visibility gates still route correctly, not just look right in a
screenshot. **Stage 5** confirmed via direct CSS-rule inspection (not just computed-style values,
which can tie at the same value from a different source) that the two specificity-fight rules from
the second prior revert now have zero competitors. **Stage 6** mechanically stripped `.shell-v2` from
the remaining ~45 pre-existing selectors, safe by construction now that Stage 4 removed what they
needed the extra specificity to beat — verified against Stage 4 (pre-unscope), not Stage 0
specifically, to catch a rule dropping from tied-but-winning to losing, the exact failure shape of
the original revert.

Full app-wide regression sweep re-run clean after all six stages, zero console errors; Book of Needs
screenshotted directly and confirmed completely unaffected (the `.mode-btn` base class it shares with
the entry screens was never touched, only entry-screen-specific classes). Cache-bust
`office-shell.css` 309→313 (across stages), `office.css` 220→221. SEED_VERSION v350 → v351.

**Remaining, disclosed, not done**: unscoping the rest of `office-shell.css` (~186 of ~231 total
`body.shell-v2` occurrences — the `.office-container` recolor, the three-column uo-ordo/rail/page/
margin/keeping shell internals, the `.uo-drawer-*` Office Settings drawer — none audited against the
rest of `office.css` in this pass, a separately-scoped task of comparable size to what was just done),
the legacy print block cleanup, the third ~170-line mobile-repair CSS block, print-preview
regeneration, and the hairline-color design question flagged above.

**DONE (attempted, reverted), LIVE-CONFIRMED, 2026-09-24: Phase 6 stage 5 — unscoping
`css/office-shell.css` found to be unsafe while stage 3's deferred office.css cleanup is still
outstanding; comment corrections kept, the actual selector change reverted.** Wrote a script to
mechanically strip the now-permanent `.shell-v2` class token from every selector in the file
(matching stage 3's own tinycss2-based approach), reasoning that removing the same token uniformly
from every rule would preserve each rule's specificity *relative to every other rule in this same
file*. That reasoning was correct but incomplete — it says nothing about specificity *relative to
still-existing `css/office.css` rules*, several of which this file's own rules were deliberately
given extra `.shell-v2` weight to beat (the exact same pattern documented in this file's own
`#main-content.app-primary-canvas` specificity comment). Applied the change, ran the full
verification sweep, and found a real regression: `#tradition-entry`'s card background rendered
with a visibly different gradient. Root-caused, not just reverted blind: `body.shell-v2
#tradition-entry.app-tradition-entry` (specificity with two classes) stripped down to `body
#tradition-entry.app-tradition-entry` (one class) — weak enough to newly lose against `office.css`'s
still-live `body.dark-mode #tradition-entry.app-tradition-entry` rule, which stage 3 could not
delete for the same reason it couldn't delete the rest of that screen's CSS (see stage 3's own
deferral: office-shell.css only recolors those cards, it never rebuilt their layout, so the base
rules are still load-bearing). Confirmed empirically, not just theorized: swapped between the two
CSS versions at the same real moment (a git-show of the pre-stage-5 file vs. the stripped one) and
diffed — 397,828 of 1,278,400 pixels differed under the stripped version, 0 under the original.

**Reverted the selector change; kept the (accurate, low-risk) documentation corrections.** Restored
`css/office-shell.css` to its stage-4 committed content, then re-applied two comment rewrites on
top: the file's own header (previously said "Phase 1 only" and "unscoped in Phase 6" as future-tense
claims, both now wrong) now explains plainly that this file's selectors remain scoped under
`.shell-v2` **on purpose**, not as an oversight, and names exactly why (the entry-screen specificity
dependency just found) and what unscoping safely requires first (finishing the office.css cleanup
stage 3 deferred). The `#main-content.app-primary-canvas` specificity comment was updated too: that
*specific* historical fight really is over (confirmed by grep — both competing office.css rules from
that comment's own account are gone, deleted in stage 3) and says so, while explaining why the extra
specificity weight was left in place anyway rather than trimmed rule-by-rule now. Verified live after
reverting: both entry screens pixel-identical to their pre-stage-5 baseline (0 nonzero pixels); full
four-lane sweep, Book of Needs, and drawer functionality (Rite toggle spot-checked end to end) all
clean. Zero parse errors. Cache-bust `office-shell.css` 307 → 308 (content changed — comments only).

**Net effect of stage 5: no functional CSS change shipped, real documentation improvement shipped,
and a second confirmed reason (on top of stage 3's own finding) that "unscope this file" and "delete
the entry-screen's old CSS" are the same piece of work, not two independent ones — whichever session
does one should plan to do both together.**

**DONE, LIVE-CONFIRMED, 2026-09-24 (latest): Phase 6, stage 4 — real scope correction found and
acted on, not a straight execution of the plan as written.** The plan (and `css/office-shell.css`'s
own prior comment) said Stage 4 would delete the four legacy settings sidebars
(`#settings-panel`/`#coptic-settings`/`#east-syriac-settings`/`#generic-settings`) and their two
`display:none` hiding rules outright. Attempting it — reading `js/office-drawer.js`'s own
`radioRow()`/`checkboxRow()`/`selectRow()` functions before touching anything, per this session's
standing discipline — found that claim was wrong. Those three functions build synthetic drawer
controls that **read from and write back to the real, still-in-place `<input>`/`<select>` elements**
(their own comments say so plainly: "read, never moved"); they never move the originals into the
drawer's own DOM the way `moveRealControls()`'s wholesale-move sections do for the borrowed
devotions and BCP's "further" section. This covers Rite, Officiant, the 30-Day Psalter, Creed,
Gospel placement, Marian element/position, East Syriac's Cathedral/Monastic use, and both of
Horologion's calendar/display-depth selects — real, currently-working liturgical settings, not
cosmetic ones. On top of that, every "which office" control (the actual hour/office picker for all
four lanes) is read the same way, via the existing shared-office-nav mechanism
(`setSharedOfficeNavHour()` in `js/office-ui.js`), which also writes back to these same real
elements. Deleting the sidebar markup without first moving every one of these controls into the
drawer's own DOM would have silently broken real office rendering (wrong Rite, wrong Gospel
placement, etc.), not just made a setting temporarily unreachable. **That fuller migration was not
done and is not part of what shipped today** — it's real, additional, unattempted work for a future
session, not a quick fix.

**What actually shipped**: the two mobile-repair mechanisms of the same name ("UO MOBILE DRAWER
REPAIR") that Stage 3's own deferral note had already flagged as safe once the sidebars were
confirmed permanently hidden — this stage confirmed that and deleted both. The JS block
(`js/office-ui.js`, was ~117 lines) patched `selectMode()`/`toggleSidebar()` to manage
`mobile-sidebar-open`/`sidebar-hidden` classes on the legacy sidebars and `#sidebar-toggle`; since
`#sidebar-toggle` is now permanently `display:none !important` and unclickable, and
`#main-content.sidebar-hidden` has zero rules anywhere in `css/office-shell.css` (confirmed by grep),
this was pure dead weight. Separately, a genuinely distinct CSS block also found this session and
NOT part of the original plan's inventory — `css/office.css`'s own "Horologion mobile stacked shell
repair" (`#daily-office-section:has(#generic-settings:not(.mode-hidden))`, ~58 lines) — was confirmed
dead the same way (its target is permanently invisible) and deleted too. A second, larger CSS block
sharing the same "UO MOBILE DRAWER REPAIR" name (`css/office.css`, ~170 lines) turned out to set
foundational mobile viewport positioning for `#daily-office-section`/`html`/`body`, not just sidebar
classes — genuinely unclear whether the new shell's own mobile CSS fully supersedes it or still
depends on it. Left untouched rather than guessed at; disclosed here rather than silently skipped.

**Corrected the misleading comment** in `css/office-shell.css` (the "Phase 6 deletes the sidebars"
line) to state the real, verified finding, with the full reasoning inline so a future session doesn't
repeat the same wrong assumption. Verified live: all four lanes still render and publish correctly;
Book of Needs and the drawer's synthetic controls (spot-checked: Rite toggle actually flips the real
underlying radio) are unaffected; the pre-existing lane-switch fix from stage 2 still holds; mobile
layout at 390px width screenshotted and compared directly against the pre-stage-4 commit in a
throwaway git worktree — identical, including a pre-existing title-overflow cosmetic issue confirmed
NOT caused by this stage. Zero console errors. Cache-bust `office.css` 218 → 219, `office-ui.js`
307 → 308.

**DONE, LIVE-CONFIRMED, 2026-09-24 (latest): two dashboard rows corrected for staleness, plus one
real orphaned-content gap found and wired.** Josh asked "What is open and not blocked?", got a
ledger audit back, then asked directly about two of the surfaced amber/red rows: **"What remains?
You told me this was complete"** (`coe:rebuild:milestone`, an amber row dated 2026-08-19 reading
"REBUILD IN PROGRESS") and **"Wire it"** (`coe:festival-evening:content-built-not-wired`, amber,
also dated 2026-08-19). Both rows turned out to be milestone markers from the very first day of
their respective work, never updated despite substantial real progress in later sessions —
confirmed live, not assumed: Sunday and Feast-of-our-Lord Ramsha/Lelya/Sapra all render real
Festival content today (`sunday-ramsha-qdham/wathar-sequence` and `sunday-sapra-qdham/wathar-
sequence` already reference the 20 `esy-festival-*` components the 08-19 note describes, resolved
through placeholder-resolution code already in `js/office-ui.js`, wired in later 2026-08-27/08-29
sessions that never updated this row). Both rows corrected to green with the real history restored.

**One real gap found while verifying, not assumed away: `memorials-lelya-sequence` — a complete,
ready-to-route 17-item sequence built the same 2026-08-19 session — had ZERO references anywhere
in `js/office-ui.js`, confirmed by grep. Fully built content sitting orphaned since the day it was
written.** Wired via a new `isMemorialDay` check (`EastSyriacCalendar.getDayClass().dayClass ===
'commemoration'`, an existing engine classification, previously unused in this file), routing
Lelya to it on a real non-Sunday, non-Feast, non-Fast commemoration day, at lower priority than the
existing Feast-Lelya and Fast-Lelya branches. Verified live against a real date (Friday, February
13, 2026 — "Commemoration of the Faithful Departed", found by scanning four years of dates): the
body now correctly shows "Memorials of Saints / No Qaltha / Hulali 12, 13, 14" instead of the
ordinary ferial Friday office. A real first-pass bug caught before landing on the right date: the
initial date scan omitted `easterMode`, silently using a different Paschalion than the app's own
default and finding the wrong Friday — caught by the render unexpectedly showing Fast content for
what should have been a non-Lenten date, re-scanned correctly rather than assumed right.

**Explicitly NOT solved, disclosed rather than guessed at: Ramsha and Sapra have no Memorial-
specific sequence built at all** — unlike Lelya, there is no pre-assembled sequence waiting to be
pointed at; the four commemoration-of-the-departed First/Second Anthem forms and the Suba'a-append
exist only as loose components, and picking which of the four forms applies needs a per-
commemoration class/state field this project's calendar layer doesn't carry. Also disclosed: the
Layer-2 commemorations array driving `isMemorialDay` is narrow by design (1-8 named days a year,
confirmed by a live 4-year scan) and is NOT the same system as the much larger individual-saint
Layer 3 sanctoral calendar tracked elsewhere on this dashboard (`coe:layer3:week-anchoring-
discovered`) — that layer is not wired into `getDayClass()` at all, and this fix does not touch it.

Cache-bust `office-ui.js` 304 → 305. Full four-lane UI sweep and the Sunday/weekday regression
check both re-run clean, zero console errors. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, keys
`coe:rebuild:milestone` and `coe:festival-evening:content-built-not-wired`.

**DONE, LIVE-CONFIRMED, 2026-09-24 (latest): Phase 5, lane 3 of 3 — Horologion envelope port.
Phase 5 is now COMPLETE, all three lanes (Coptic, East Syriac, Horologion) plus the original
Anglican port.** Josh: *"Move on to the Horologion now."* Read `renderHorologionOffice()`,
`_renderHorologionItem()`, `_renderHorologionDiagnostics()`, the display-depth reduction system,
and `js/horologion-engine.js`'s `resolveOffice()`/`_computeBaselineTone()`/
`_computeLiturgicalSeason()` end to end before touching anything, same discipline as lanes 1-2.
Two real findings from that reading, both acted on:
1. **`TRADITION = 'BYZC'`, not `'EOR'`.** The ground-imagery work two sessions ago had already
   shipped `[data-uo-tradition="EOR"]` in `css/office-shell.css` plus matching references in
   `images/CREDITS.md`, copying the general ANG/LAT/EOR/OOR/COE sanctoral-calendar tagging
   convention used elsewhere in this project — but `HorologionEngine`'s own authoritative constant
   is `BYZC`. That CSS rule would never have matched a real envelope. Fixed everywhere (CSS
   selector, `images/CREDITS.md`, this note) — the sanctoral calendar's own separate `EOR` tag
   (a different subsystem entirely, confirmed 2026-09-07 to be a different project) was left alone.
2. **No fasting-character data exists anywhere in the engine** (confirmed by grep — zero hits) —
   only tone (`_computeBaselineTone`) and season/Holy-Week-day (`_computeLiturgicalSeason`). The
   new `context.calendarSummary` composer (`HorologionEngine.getCalendarSummary()`, new exported
   function) only claims what those two actually provide: "Tone N" ordinarily, "Great Lent — Tone
   N" in Great Lent, a named Holy Week day ("Great and Holy Thursday") in Holy Week, and the
   existing "Bright Week (Paschal Tone)" label in Bright Week. Verified live: "Tone 7" on an
   ordinary date, "Great Lent — Tone 6" on March 8, 2026.

**Built**: the item-type → role mapping is fresh, not reused from `js/anglican-envelope.js`'s
`ROLE_BY_LABEL` table — that table was found (reading it end to end) to already contain several
non-contract-compliant role strings of its own (`penitential`, `invitatory`, `collect`,
`lords-prayer`, `thanksgiving`, `suffrages`) — a pre-existing Anglican discrepancy, disclosed here,
left alone as out of scope for this lane. `item.type` maps far more directly onto the contract's
closed 13-role taxonomy anyway: `psalm`/`kathisma` → `psalmody`, `stichera` → `hymn`, `litany` →
`intercession`, `rubric` → `rubric`, everything else → `other`. `sequence` items (recursive
containers) get no block of their own — structural grouping, not a liturgical unit — each child
contributes its own block at the same granularity every other item type uses.
`_renderHorologionItem()`'s own HTML-string output is untouched (a known-good, already-tested
render), now wrapped in a real DOM node instead of a raw `innerHTML` assignment, matching the
"DOM node, not string" precedent lanes 1-2 set; a new parallel `_pushHorologionEnvelopeEntries()`
walks the same items and builds `env.blocks`/`env.diagnostics` alongside, so the visible render is
byte-for-byte what it was before this port.

**Placeholder/unresolved items now get a real `coverage-gap` diagnostic**, per the explicit
governance ruling already on record (`UI_REDESIGN_HANDOFF.md` §8 item 3: the Horologion's
incipit-only/deferred-psalm-text state is a stated gap, never framed as a user preference and
never silently dropped) — the pre-port code rendered these as visible dashed blocks but never
recorded them in any diagnostics contract; this closes that gap too. Verified live against a real
placeholder date (Orthros, March 8 2026, Great Lent): 3 unresolved kathisma slots produced 3
real `coverage-gap` diagnostics, each with the contract's own wording ("A known gap, stated rather
than hidden."), alongside the pre-existing public-beta banner, which is unchanged.

**A second real bug found and fixed as a direct result of finally being able to check the
Byzantine ground image against real Horologion text, not a BCP stand-in**: the image's night-mode
tuning (verified two sessions ago) held up fine, but the exact same darkened-image numbers,
composited over the day theme's near-white ground instead of the night theme's near-black one,
compressed into a flat wash — contrast against live text still measured safely (6.8:1 median, real
screenshot), so this would NOT have been caught by contrast alone, only by looking at the
screenshot, the same lesson from the "just looks like a blur" correction two sessions ago, now
caught proactively instead of by Josh a third time. Fixed with a day-mode-specific override,
the same move Anglican's own day override already made for the rose window: raise brightness
back toward the source image instead of darkening it further, lower opacity instead. Re-verified
by screenshot — the headpiece's interlace and the two peacocks are now recognizable in both
themes.

**SUPERSEDED same day — Josh asked directly: "Check if Coptic and East Syriac have the same
day-mode gap." They did.** Coptic was the worse of the two: its real day office (the Morning
Office/Prime) measured only 4.87:1 median contrast (uncomfortably close to AA's 4.5:1 floor, not
the 12.4:1 the night-mode tuning cites) and the manuscript was essentially invisible on screen —
the exact "just a blur" failure, never caught before because this lane had only ever been verified
against its own night offices. East Syriac was milder: its day office (Sapra) measured a safer
8.36:1 median and the cross ornament stayed faintly perceptible, but noticeably fainter than this
same image's own night-mode rendering. Fixed both with the identical day-mode-override pattern
Byzantine just got: brightness raised toward the source image instead of darkened, opacity
adjusted, blur unchanged. Re-verified by screenshot for both: Coptic's manuscript text columns and
East Syriac's cross ornament are now genuinely visible, matching each lane's own night-mode
quality. Re-verified contrast stayed safe after tuning (Coptic 7.23:1 median, East Syriac 12.59:1
median). Confirmed both real day offices via their actual radio controls
(`cop-hour`=`coptic-morning-office`, `esy-time`=`sapra`), not forced attributes. Full four-lane
sweep and `?shell=v1` re-run clean, zero console errors. Cache-bust `office-shell.css` 306 → 307.

**Verified live in headless Chromium**: all Horologion offices with real resolvers (Vespers,
Orthros, First/Third/Sixth/Ninth Hour, Small Compline, Great Compline, Typika, Midnight Office,
an Interhour) across multiple dates, including a genuine "not appointed today" state (Great
Compline outside its appointed days — correctly one rubric block, not a bug) and the real
placeholder date above. Zero console errors. Also re-ran the full four-lane sweep (Anglican,
Coptic, East Syriac, Horologion) and the existing `?shell=v1` regression check — all unaffected.
Cache-bust `office-ui.js` 303 → 304, `office-shell.css` 304 → 305 → 306 (EOR→BYZC fix, then the
day-mode fix). `js/horologion-engine.js` has no cache-bust param in `index.html` (loaded
unversioned). Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, key
`ui:phase5-horologion-lane-envelope-and-day-line`.

**DONE, LIVE-CONFIRMED, 2026-09-24: per-lane veiled ground imagery — all four lanes now have a
real, sourced, measured image (Byzantine's own numbers were provisional at the time; re-verified
against real Horologion text once that lane shipped — see the entry above).** This is the
THIRD time Josh raised this — read that as: earlier sessions (including this one, on the first
pass) checked the design docs' PROSE but never actually looked at the design's own PNG screenshots
pixel-by-pixel against a live render. Josh supplied 4 of the actual mockup images directly in chat
and asked squarely: *"What is the point of uploading the file if you aren't even going to examine
what is in it to ensure that you are building out what you were asked to build out instead of just
a shell of it?"* Fair, and the finding was real: `#main-content`'s computed background under
shell-v2 was a flat solid colour, `rgb(8,7,12)`, checked directly — no image, anywhere, on any
lane, despite HANDOFF.md §6 (Imagery) stating plainly: *"Lane-appropriate... grounds... under a
heavy veil at 0.4–0.55 opacity as texture, never as wallpaper."* Phases 1–5 all shipped without
this. Not tracked anywhere in the ledger before now — genuinely undiscovered, not a known/deferred
gap.

**Built**: `applyTraditionGround()` in `js/office-shell.js`, hooked into the existing
`watchEnvelope()` handler (same place rail/ordo/margin already render from the envelope) — sets
`data-uo-tradition` on `#main-content` from `env.tradition`, never guessed from the rendered page.
`css/office-shell.css` keys a new `::before` layer off that attribute: a separate absolutely-
positioned pseudo-element (removed from grid flow automatically, so it cannot disturb the ordo/
rail/page/margin/keeping grid areas), holding only the background-image + blur/opacity — NOT
`filter:blur()` on `#main-content` itself, which would blur the prayer text too, not just the
ground behind it.

**Anglican (ANG)** — the two Western Gothic images already in this repo (`rood-screen.png` night,
`chartres-rose.png` day, matching HANDOFF.md 1b's stained-glass description for Morning Prayer).
**One real tuning bug caught live, not shipped blind**: the rose window at the rood-screen's own
blur/opacity read as wallpaper, not texture — it's far busier and more saturated. Given its own
heavier blur (9px vs 3px) and lower opacity (0.22 vs 0.48), confirmed by screenshot.

**Coptic (OOR), East Syriac (COE), and Byzantine (BYZC) — session continued once network access was
widened and Josh supplied the Coptic image directly.** A real correction along the way, worth
recording plainly: the Coptic image was first attributed as "Walters W.592, 1684 Arabic Gospels,
CC0" — both wrong. **Reading the file's own embedded XMP/IPTC metadata** (not the verbal
description that came with it) showed it is actually **Walters W.739, fol. 1r, an 8th-century
Coptic parchment fragment of the Book of Exodus**, licensed **CC BY-NC-SA 3.0**, not CC0. Fine for
this non-commercial app with attribution, but a real catch — verify the artifact itself, not the
label. East Syriac sourced from Wikimedia Commons ("File:East Syriac Script Thaksa.jpg," an
18th-century Thaksa, Chaldean Syrian Church, Thrissur) — license confirmed directly from the live
Commons page's own category tags (`CC-PD-Mark` + `PD-old-70-expired`), genuine public domain.
Byzantine sourced from Walters W.528 fol. 188r — an *ornamented headpiece and zoomorphic initial*
opening the Gospel of John, deliberately NOT the manuscript's one surviving miniature (an Evangelist
portrait) — per `UI_REDESIGN_HANDOFF.md`'s own correction to the original proposal, an icon "is a
venerated object, not a texture," so only ornament-and-text pages were candidates. Confirmed by
looking at the actual page before cropping: geometric interlace, floral ornament, two peacocks,
incipit text — nothing figural. All three cropped locally with Pillow to remove black photography
backgrounds and scan-edge artifacts, checked by looking at the cropped result, not file size.

**Coptic and East Syriac tuned by MEASUREMENT, not eyeballed — and the first attempt was wrong in
the other direction.** A Playwright script screenshots the live rendered page at 2x scale, samples
a 4px grid, excludes pixels near `--uo-ink`/`--uo-rubric` (real text, not background), and computes
real WCAG relative luminance/contrast on what's left. First Coptic pass (blur 14px, opacity 0.24)
measured 14:1 — very safe, and **the image was essentially invisible**, defeating the entire point
of having it. Raised twice, re-measured each time: final Coptic settings measure 10.1:1 at the
median, 8.6:1 at p95 (both still clear WCAG AAA's 7:1), 5.3:1 at p99 (clears AA's 4.5:1) — visibly
present texture, not wallpaper, not invisible either. East Syriac measured 8.2:1 median, 7.3:1 p95,
6.97:1 p99 on its own first real attempt. Byzantine's numbers are a starting estimate only (11.9:1
median against a stand-in office, since Horologion doesn't exist yet to test against) — flagged in
the CSS itself as needing the same real measurement once that lane ships.

**Verified live in all four lanes, plus old-skin regression**: Anglican night/day, Coptic, and East
Syriac all screenshotted from the real running app; Byzantine previewed by forcing the attribute
(no real lane to render into yet); `?shell=v1`/no-flag confirmed completely unaffected — computed
`::before` background-image is literally `none` there, `data-uo-tradition` never set. Zero console
errors beyond the known sandboxed Google Fonts failure. Cache-bust `office-shell.css` 300 → 303,
`office-shell.js` 295 → 296. **New file**: `images/CREDITS.md` — shelfmark, source URL, and license
for every image, including the Coptic correction recorded plainly rather than quietly fixed. Full
detail: `AUDIT_GOVERNANCE_LEDGER.md`, key `ui:per-lane-ground-imagery`.

**CORRECTED, same day, on Josh's direct feedback: "Agpeya just looks like a blur... so does that
last daily office screen."** He was right, and it's a real lesson, not just a number to re-tune:
Coptic and Byzantine had both been measured for contrast correctly, twice each, and STILL failed
the actual goal — a passing contrast ratio proves text stays readable, it says nothing about
whether the image itself is recognizable as anything. Coptic's first pass (14:1 contrast) was
essentially invisible; the second pass (10.1:1) was more visible but still read as an
undifferentiated brown wash, not manuscript texture — both were "safe" and both still looked like
nothing. The actual fix was dropping blur sharply (Coptic 16px → 6px, Byzantine 14px → 6px) rather
than adjusting opacity or brightness further — confirmed by looking at the resulting screenshot,
not the contrast number, which is the same discipline Josh asked for the first time and which
should have caught this before he had to say so a second time. Both still measure safely (Coptic
12.4:1 median / 6.2:1 p99; Byzantine 11.8:1 median / 4.0:1 p99 against its stand-in text) — the
fix was never in tension with legibility, it was simply the wrong knob being turned. Coptic's
manuscript text columns and Byzantine's interlace pattern and peacocks are now genuinely visible.
Cache-bust `office-shell.css` 303 → 304.

**SUPERSEDED 2026-09-24: Phase 5 (Horologion, lane 3 of 3) is DONE — see the entry near the top of
this note.** Left here only so the correction is visible in place; do not re-cite "is next."

**DONE, LIVE-CONFIRMED, 2026-09-24 (latest, out-of-band entry — interrupted Phase 5 work on
Josh's direct request): the entry screens redesigned and regrouped, off the Phase 5 build order.**
Josh: *"I would like the entry screen redesigned before we move on to the Horologion... the
current button locations do not make much sense."* Clarified twice before building (this note's
own standing practice — do not guess on a design request that could waste real work): which
screen, and what specifically felt wrong. His answer named the actual problem precisely: *"the
bible browser and book of needs do not answer the 'where do you pray' question... it needs to be
regrouped. It also looks very different from everything we've redesigned, so it looks very much
out of place."* Investigation found the complaint pointed at `#uo-threshold-grid` ("Another
office," reached from the universal threshold), not `#tradition-entry` ("Where do you pray?")
which Josh had picked in the first clarifying question — that screen has no Book of Needs/Bible
Browser button anywhere in it. Surfaced the mismatch with screenshots rather than silently
overriding his answer or silently guessing which screen he meant.

**Two real, disclosed findings, not assumptions:**
1. `#uo-threshold-grid` mixed Book of Needs and Bible Browser (tools) into the same 5-card grid as
   Daily Office/Coptic Agpeya/Church of the East (prayer traditions) — confirmed directly in
   `index.html`, not inferred from the screenshot alone.
2. Both `#tradition-entry` and `#uo-threshold-grid` had never been touched by this entire redesign
   project — confirmed against `documentation/design/DESIGN_HANDOFF_SOURCE.md` and
   `UI_REDESIGN_HANDOFF.md`, neither of which mentions either screen at all — so they still used
   the pre-redesign parchment card system (rounded cards, drop shadows, gold-gradient icon
   circles) while the actual office view has been dark/flat/hairline for months. This IS the "off
   the office screen nothing changes" boundary the DEMOLITION comment in `css/office-shell.css`
   documents — Phase 1-5 deliberately never crossed it. **This work deliberately widens that
   boundary for these two screens only, on Josh's direct instruction** — nothing else outside the
   office screen (splash proper, Book of Needs, Bible Browser, admin) was touched.

**Built, reusing the already-established component language rather than inventing a new one**:
handoff §7's own governing rule — *"no rounded cards, no drop shadows on the page, no borders
around prayer. Hairlines and light do the separating"* — is exactly the flat, gold-hairline-bordered
button style `.uo-drawer-office` already uses in the Office Settings drawer's "II · Which office."
Both screens restyled to match it, scoped `body.shell-v2` in `css/office-shell.css`, using the
existing `--uo-*` tokens (no new colors invented). `#uo-threshold-grid` regrouped in `index.html`:
a "Choose a tradition" grid (Daily Office, Coptic Agpeya, Church of the East — Roman Breviary dev
stays with them, still hidden) and a visibly smaller, separate "Not a tradition — tools" row (Book
of Needs, Bible Browser — Admin Console stays with them, still hidden) below a hairline. Every
existing `onclick`/id kept exactly as-is — moved, never rebuilt, same discipline as every other
markup change in this project. `#tradition-entry`'s own family/tradition drill-down logic (Western
→ Anglican/Catholic, Eastern → COE/EO/OO, COE → ACOE/ACE) is completely untouched, restyled only;
its separate "Dark Mode" checkbox is hidden under shell-v2 (not deleted — `?shell=v1` keeps it),
since the screen now always renders in the night palette — the same choice already made and
Josh-approved for `#uo-threshold` itself ("a control that visibly does nothing is worse than no
control," 2026-09-22). `#splash-bg` forced to a darker treatment under shell-v2 to match, with
`!important` to beat the mobile breakpoint's own `!important` rule in `css/office.css`.

**A real regression caught and fixed before shipping, not after**: the `index.html` markup change
reaches BOTH shell versions (only the CSS is flag-scoped), so `?shell=v1`/no-flag briefly rendered
the new "tools row" with no styling at all — unstyled fallback buttons, a real visual break to the
old skin, which this project holds to a strict "flag off = untouched" bar. **Caught by testing all
three states, not just the one being changed.** Fixed by adding matching (light-parchment) CSS for
the same new classes directly in `css/office.css`, reusing the exact same `--app-*` tokens
`.mode-btn.app-mode-card` already uses — old skin now renders the regrouped tools row properly, in
its own established visual language, not broken and not silently left broken.

**Verified live in headless Chromium, all three states** (`?shell=v2`, `?shell=v1`, no flag):
screenshots of `#tradition-entry`, its Western/Eastern drill-down panels, `#uo-threshold`
(untouched, already correct), and the regrouped `#uo-threshold-grid`, for each state. Confirmed
functionally, not just visually: clicking a tradition card still fires its real, unchanged
`onclick` (`showLaneThreshold('coptic-agpeya')`, confirmed via `js/office-ui.js:1412` — correctly
shows that lane's own threshold screen, not a direct office jump, exactly as before); clicking a
tool button (`openUniversalBookOfNeeds()`) correctly opens Book of Needs
(`#individual-prayers-section` → `flex`, `#daily-office-section` → `none`). Zero console errors
across all three states beyond the known sandboxed font-CDN cert failure. Cache-bust
`office-shell.css` 299 → 300. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-24,
key `ui:entry-screens-redesigned-regrouped`. SEED_VERSION v339 → v340.

**Phase 5 resumes where it left off — Horologion, lane 3 of 3 — nothing about this detour changes
that scope**, see the "What that leaves" paragraph below this one.

**State as of 2026-09-24. HEAD before this commit was `44d295e5`.** Phase 4's drawer itself
(`documentation/design/screens/1c-threshold-ordo-drawer.png`) built for real, and a real,
independently-confirmed engine bug fixed in the same session. **This environment turned out to
have a working headless Chromium the whole time** (`playwright`, pre-installed browser binary at
`/opt/pw-browsers/chromium-1194`) — prior sessions' repeated "no browser here" / "not
screen-confirmed" caveats were wrong. Every claim below was exercised in a real rendered page, not
inferred from source.

**Built: `js/office-drawer.js` (new file), a single Office Settings drawer replacing all four
legacy sidebars under `body.shell-v2`.** Native `<dialog>` + `showModal()` — focus trap, Esc-close,
inert background and focus return for free, no dependency. It keeps NO state of its own: Sections
I (`The Ordo`) and II (`Which office`) drive the app's existing lane-neutral navigator API
(`changeSharedOfficeNavDate`, `todaySharedOfficeNavDate`, `setSharedOfficeNavDate`,
`setSharedOfficeNavHour` — all pre-existing in `js/office-ui.js`, not new). Section III's compact
value rows (Rite, Officiant, Psalter, Creed, Gospel, Marian element, per-lane rows for Coptic/East
Syriac/Horologion) are `<select>`s that `.click()` the real legacy `<input>` they represent, so
that control's own existing `onchange` handler runs exactly as if Josh had clicked it in the old
sidebar — nothing was reimplemented. Everything else — the 7 borrowed-devotion toggles
(consolidated behind a "Borrowed devotions — N on" summary with a plain-language list, matching
1c's own "Kyrie Pantocrator · Hudra Prayer for Understanding. Each keeps its own name and its own
tradition." copy), the remaining native BCP choices (behind a second, separate "Further Prayer
Book choices" expander), and BCP Only Mode (a real toggle switch at the foot, §3.7) — is **MOVED
into the drawer, same DOM nodes, same ids, same handlers, never rebuilt.** `css/office-shell.css`
gained the drawer's stylesheet plus two small override blocks needed to beat two pre-existing
`!important` rules in `css/office.css` (the old 340px sidebar-clearance padding, and the parchment
pass's light rounded `<select>`/`<input type=date>` styling) — both identified by reading the
actual winning rule first, not guessed at. `index.html` loads the new script after
`office-shell.js`; `css/office-shell.css` bumped to `?v=299`.

**Verified live, in this order, with zero console/page errors throughout:** opened the drawer from
Compline; switched to Evening Prayer via the II grid and confirmed the real `office-time` radio and
the page title both updated; changed Rite/30-Day Psalter/Creed via III and confirmed each real
legacy control changed; expanded "Choose borrowed devotions," checked Kyrie Pantocrator, confirmed
the drawer's own count, the legacy `#borrowed-devotions-count` line, and the margin's own overlay
card all agreed; added Theotokion via the Marian Element row and confirmed the count and list both
updated; toggled BCP Only and confirmed all 7 borrowed toggles came back unchecked, the drawer's
own expander correctly disappeared (nothing left to show), and genuine BCP controls (Gloria Patri
etc.) stayed visible — the exact contract §3.7 requires; stepped the date forward and back to
Today; pressed Esc and confirmed the dialog closed and focus returned to the opening button;
**reloaded the page and confirmed every changed setting survived** (Rite, 30-Day Psalter, Kyrie
Pantocrator, Theotokion). Then repeated the open/II-grid/III-rows sequence in all three other
lanes (Coptic, East Syriac, Horologion) and confirmed each shows its own lane-correct office grid
and its own lane-correct III rows (Cathedral/Monastic + Explanations for East Syriac; Calendar
Mode/Display Depth/Diagnostics + Explanations for Horologion). **Also confirmed, directly on the
untouched pre-session code (`git stash` before testing), that flag-off behaviour
(`?shell=v1` / no flag) is byte-for-byte identical to before this session** — the drawer script is
fully inert without `body.shell-v2`.

**Two of Josh's three governance calls from the end of the prior session, both applied:**

1. **Cathedral/Monastic stays VISIBLE in the East Syriac drawer**, overriding
   `UI_REDESIGN_HANDOFF.md` §8.4's instruction to hide it. Recorded as the deliberate resolution in
   `audit-ledger.html` (`engine:suffrages-venite-compline-uncheck-bug-fixed`'s neighbor entry,
   `ui:phase4-drawer-built`) — §8.4 itself is NOT edited, since the handoff doc is a record of the
   original design correction and should stay as written; this note and the ledger are where a
   deliberate override belongs.
2. **A real, independently-confirmed engine bug found and fixed, not just a drawer-porting
   question:** `updateSidebarForOffice()`'s `setVisible()` helper unchecked (and, via
   `saveSettings()`, permanently persisted as unchecked) every BCP toggle it hid for the
   current office — so visiting Compline silently and permanently turned off Suffrages and
   "Rotate Venite/Jubilate Daily" everywhere, including back at Morning/Evening Prayer, where both
   default to checked. **Confirmed present on the untouched pre-session code with the shell flag
   OFF** — this is not a drawer bug, it predates this session's work entirely and was simply never
   caught before. **Fixed**: `setVisible()` now only hides the row; it no longer touches
   `.checked`. Confirmed safe before shipping — every control this function hides is read by
   `renderOffice()` only inside the office-specific branch that actually uses it (e.g.
   `suffragesChecked` feeds only the Morning/Evening Prayer branch), so a stale `checked` value
   while a control sits hidden for an unrelated office never reaches that office's own rendered
   output. Live-verified: visited Compline, then Evening Prayer, both toggles remained on.
   `js/office-ui.js` cache-bust bumped `300 -> 301`.

**Still open from the prior session's third item — Horologion's drawer day line.** The prior
session left it blank rather than show a mislabeled reading (its only text names the calendar
MODE, not the liturgical day). Josh's direction this session was "we should fix that," meaning
build a real one, not just suppress the wrong one — **not done yet.** `js/horologion-engine.js`'s
own resolved payload (`{tradition, officeKey, date, title, status, sections, diagnostics}`,
UI_REDESIGN_HANDOFF.md §8.9) has no lane-native day-summary string of the kind the Anglican
envelope's `context.calendarSummary` supplies — the tone/week/fast information exists
(`_computeBaselineTone()` and neighbors in `js/horologion-engine.js`) but nothing yet composes it
into one line the way BCP's own day line does. Building that is real content/engine work belonging
to Phase 5 (porting the Horologion lane), not a drawer fix — the drawer can only surface a day line
once the lane actually has one to hand it.

**DONE, 2026-09-24 (later still): Phase 5 lane 1 of 3 -- the Coptic Agpeya renderer now emits the
real envelope, live-confirmed.** `renderCopticAgpeya()` (~190 lines, 8 sequence-item shapes)
converted from string-concatenated `officeHtml` to real DOM nodes plus `blocks[]`/`overlays[]`/
`diagnostics[]` built at the moment of emission -- the same move `renderBcpOffice()`'s own Phase 3
refactor made. Reuses the Anglican lane's own `bcpEmitBlock`/`bcpEmitPsalmBlock`/`bcpWrapInGutter`/
`bcpRoleFor`/`bcpPushDiagnostic` directly (confirmed nothing in them is Anglican-specific) rather
than duplicating them. One genuine shape mismatch found and handled with a small new
`copEmitReading()`: `bcpEmitReading()` always adds an ornamental divider, and this lane has never
had one anywhere. Envelope tradition `'OOR'`; `overlays[]` stays empty (this lane borrows nothing);
no seasonal dot (no Coptic colour witness sourced yet). Verified two ways: a 27-assertion jsdom
harness against the real extracted functions (all shapes), and live in this sandbox's own headless
Chromium under `?shell=v2` across five hours chosen to exercise every shape with real content
(Morning Office, Sixth Hour, Eleventh Hour, Twelfth Hour, Midnight Office, the day's Theotokia) --
zero dividers, zero diagnostics, zero non-environmental console errors throughout; the rail now
shows real Coptic labels where it was confirmed empty as recently as 2026-09-19. Cache-bust
`office-ui.js` 301 → 302. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-24
continued ("Phase 5, lane 1"), SEED_VERSION v337 → v338.

**INVESTIGATED, NOT BUILT, 2026-09-24 continued: `renderEastSyriac()` (js/office-ui.js:5413-6419,
~1000 lines) read end to end before touching anything, per this note's own instruction.** No code
changed this pass -- this is the scoping the Coptic port's own handoff called for, written down so
it isn't re-derived cold. ~850 of the ~1000 lines are date/season/cycle logic that builds a
`sequence` array of component ids (Qdham/Wathar alternation, Great Fast branches, Rogation of the
Ninevites, feast-name substitution) and need NO change. The emission itself is a ~90-line loop
(6280-6369) plus a separate early-return fallback (6256-6278) and an unrelated commemorations block
after it (6374-6419). Confirmed against `js/office-shell.js:385`: that commemorations block is
already out of scope for this port -- the shell just moves `.saint-section` into `.uo-page` as a
live node, it was never part of the envelope contract, so it can stay untouched exactly as the
Coptic port left its own equivalent.

**Real shape mismatches found, none of which let the Anglican/Coptic helpers drop in unchanged:**
1. No existing reading helper fits. `bcpEmitReading`/`copEmitReading` always render flowing prose
   (`formatScriptureAsFlow`, class `reading-text`). East Syriac renders EVERY scripture citation --
   psalms, and even its one non-psalm citation (`comp.scriptureRef`, e.g. an Exodus canticle) -- as
   poetry (`formatPsalmAsPoetry`, class `psalm-block`). A new emitter is needed; there is no
   "poetry-formatted, non-psalm-numbered citation" helper anywhere yet.
2. Hulala sections (`comp.sections`, the 21 Hulali) have no analog: an array of `{prayer, psalms}`
   pairs, each section's own short prayer followed by its psalms, each psalm its own "Psalm N" +
   poetry block, no divider, and critically NO leading label for the set -- unlike
   `bcpEmitPsalmBlock`, which always emits one. Needs its own small helper, not a reuse.
3. Title+text+psalms is currently ADDITIVE, not either/or: every sequence item always gets a plain
   title/text span pair emitted first, and *then*, if that same component also carries
   `comp.psalms`/`comp.psalmRef`/`comp.scriptureRef`, extra psalm blocks are appended after it with
   no additional label of their own. `bcpEmitPsalmBlock` assumes it supplies the only label. This is
   a real design decision (a label-less psalm-block variant, or two separate `env.blocks` pushes
   sharing one gutter row?), not something to infer -- flagging rather than picking.
4. No dividers anywhere in this renderer (confirmed by inspection, same finding as Coptic) -- any
   reading-style helper built for this lane must not call `bcpEmitDivider`.
5. `rite` is computed at the top of the function (`js/office-ui.js:5420`) but never referenced again
   -- confirmed dead by grep. Unlike BCP/Coptic's `resolveText(comp, rite)`, East Syriac components
   have no rite-variant text; `comp.text` is used directly.
6. No gutter vocabulary agreed for this lane yet (Shuraya/Qaltha/Marmitha/Motwa/Tishbukhta/Hulala
   don't match `BCP_GUTTER_KIND_BY_LABEL`) -- safe by default (empty gutter cell, same as Coptic got),
   named here so it isn't mistaken for an oversight later.
7. The "not yet rebuilt" / "Endana outside the Fast" fallback (6256-6278) bypasses the loop entirely
   and returns before touching `env` or publishing an envelope at all. Whether shell-v2 should get an
   envelope here too (empty blocks + a diagnostic) versus the old skin's static message is an open
   question -- not decided here, flagged for Josh's call before it's built either way.

Incidental, unrelated to the port itself: Hulala components' own `meta.note` states "the Gloria said
after each [section]" (confirmed via `components/east-syriac.json`, e.g. `esy-hulala-1`), but neither
the current sequence data (checked `monday-lelya-sequence` directly -- no Gloria-Patri-shaped id
anywhere near the Hulali) nor the render loop ever emits one. A pre-existing disclosed-style content
gap, not something this conversion should silently fix or silently carry forward unflagged.

Full detail (identical wording): `AUDIT_GOVERNANCE_LEDGER.md`, `ui:phase5-east-syriac-lane-envelope`
row, updated 2026-09-24.

**DONE, LIVE-CONFIRMED, 2026-09-24 continued further: the two flagged decisions resolved and
`renderEastSyriac()` ported, same session.** Josh's answers: (1) "The goal is consistency unless a
tradition requires otherwise" -- (yes). Resolved as: every scripture/psalm citation still gets its
own gutter row and its own `unit` in the envelope (nothing hidden), but folds into the ONE
`env.blocks` entry its parent component's title already opened, rather than a redundant second rail
row repeating the same label -- confirmed against the real data (`components/east-syriac.json`)
that titles like "First Marmitha"/"Second Shuraya"/"Letter Psalm" already ARE the citation-bearing
label, not placeholders needing a separate heading. Same granularity `bcpEmitPsalmBlock`'s own
contract already states (§8: "one psalm is the smallest attributable piece" is a UNIT, not a BLOCK),
applied consistently rather than invented fresh here. (2) "I really don't know enough to make a
decision" -- correctly a mechanism question, not a devotional one, so decided directly rather than
pushed back a second time: "not yet rebuilt" (a genuine, disclosed gap) now publishes ONE block +
ONE diagnostic (code `not-yet-mapped`, reusing BCP's own exact wording -- a precise match); "Endana
outside the Great Fast" (correct, by-design absence per the primary source) publishes ONE block and
deliberately NO diagnostic -- preserving the distinction the pre-port function already drew between
the two states, not collapsed into one generic "nothing here."

Built: one new lane-specific helper, `esyEmitCitation()` (mirrors `copEmitReading`'s own precedent --
small, local, no divider -- but poetry-formatted via `formatPsalmAsPoetry`/class `psalm-block`, since
this lane never uses flowing prose). The main loop calls `bcpEmitBlock()` unchanged for each
component's title+body, then folds every citation from `comp.sections`/`psalms`/`psalmRef`/
`scriptureRef` into that same block's `units`. Both fallback states are now DOM-built (matching every
other state, and the already-live BCP Phase 3 precedent of building DOM unconditionally while gating
only `.publish()` on shell-v2) and use `bcpEmitBlock`/`bcpPushDiagnostic` per decision 2.

**Verified live, not just read**: this sandbox's own headless Chromium against
`scripts/dev-spa-server.mjs`, eight real scenarios covering every shape found during scoping --
Monday Ramsha (Marmitha/Shuraya units folding correctly), Sunday Lelya (Festival), Monday Lelya (the
real Hulala test: Hulala I/II/III each correctly show 9-11 psalm units under ONE rail block,
confirmed both in the raw envelope JSON and visually in a screenshot of the actual rail), Monday
Sapra, Monday Suba'a, Endana outside the Fast (1 block, 0 diagnostics, confirmed), Sapra during the
Great Fast (Mysteries-week fixed-psalm block), and Endana during the Great Fast (1 block, exactly 1
diagnostic with the expected wording, confirmed). Zero `.ornamental-divider` nodes across all eight.
Zero console errors beyond a Google Fonts cert failure already established as this sandbox's own
network egress restriction (same finding the Coptic port recorded) -- confirmed identical under both
`?shell=v2` and `?shell=v1`/no-flag; screenshots taken of both, old skin renders exactly as before
with no visual regression from the new DOM/gutter-grid structure. Cache-bust `office-ui.js` 302 →
303. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, entry dated 2026-09-24 continued further ("Phase 5,
lane 2"), SEED_VERSION v338 → v339.

**SUPERSEDED 2026-09-24 — Phase 5 is now fully closed (all three lanes: Coptic, East Syriac,
Horologion), see the entry near the top of this note. What that actually leaves, concretely, for
the next session:**
- Eastern seasonal-colour sourcing (§6) — Byzantine and Coptic each need a named jurisdiction-
  specific witness; East Syriac's likely "no dot" needs a deliberate recorded decision, not silent
  omission. A corpus task, not shell work, and must not be done from general knowledge per §6's own
  warning.
- Phase 6 (deleting the old skin app-wide, plus the Book of Needs' own design pass after) is
  untouched and now correctly unblocked — Phase 5 is complete, per the build order in §9. The
  navigation-architecture governance conflict that used to sit in front of Phase 6 is already
  resolved (Josh's 2026-09-21 ruling) — nothing else is blocking it now.

**State as of 2026-09-23, session end (11).** HEAD before this commit was `4ce699ed`. Built
the borrowed-devotions count and in-place `(borrowed)` labels -- the count half of Phase 4's
"consolidation with a count" item. Deliberately did NOT physically move the 8 toggles out of
their three current sections into one -- real DOM surgery this environment can't render-check,
left for a session where it can be verified on screen. Classification Josh already confirmed:
Angelus, Trisagion, Prayer Before Reading, The Examen, Kyrie Pantocrator, Agpeya Opening, Prayer
of the Hours, and Theotokion (counted under `both` too). `updateBorrowedDevotionsCount()` hooks
into the existing `saveSettings()`, which all 8 already call, so no individual `onchange`
touched. Balanced-tag counts and JS syntax confirmed; count logic tested against a mock DOM for
three cases. **Not screen-confirmed** -- no browser here. SEED_VERSION
`v334-2026-09-23-borrowed-devotions-count-built`.

**State as of 2026-09-23, session end (10).** HEAD before this commit was `bdb0ccdc`. The 35
(actually 41, after other fixes shifted the count) previously-ambiguous Lesser Feast dates worked
through individually with a token-based matcher. Two real bugs caught before calling it done: a
false match (Aelred of Rievaulx ≠ Aelred of Hexham, reverted -- the first revert didn't survive a
rerun, caught by re-checking the file, not trusting the script) and a tie-break bug that lost
several easy cases (Willibrord, Timothy and Titus, Louis) to "no clear winner" when they should
have simply preferred the ANG-tagged candidate, same as every earlier fix tonight. **27 resolved
and colored, verified against the real resolver. 21 are genuine corpus gaps** -- CPG names a real
TEC saint (Theodora Empress, Jackson Kemper, Zita of Tuscany, and 18 more) this corpus has no
entry for at all, not a naming or duplicate question -- new content work, not done this session.
**Jackson Kemper's absence sits on the same date as the existing `saint-david-of-scotland`
entry** -- worth checking whether that entry's own May 24 date is actually right against LFF,
since CPG doesn't mention David of Scotland there at all. All Souls' Day is not a real gap: CPG's
own file gives it no color at all. 209 sanctoral entries total now carry a sourced color.
SEED_VERSION `v333-2026-09-23-lesser-feast-gaps-resolved`.

**State as of 2026-09-23, session end (9).** HEAD before this commit was `8c4f0d44`. "White"
split into two real colors: a strong white (`#f5f1e4`) for ordinary white days, and a more
lustrous gold (`#d4af37`) scoped to exactly the two days `EASTER_DOCUMENTATION.md` documents as
"White (or Gold)" -- Easter Day and Ascension Day, checked directly, not extended to other
Principal Feasts that lack that note. Verified against the real engine: both named days resolve
gold, a plain white Sunday inside the Easter season resolves to the new strong white. SEED_VERSION
`v332-2026-09-23-white-gold-split`.

**State as of 2026-09-23, session end (8).** HEAD before this commit was `b550d23c`. Built the
seasonal dot itself (§6) -- the piece of Phase 4 this session sourced the data for earlier
tonight and then left unbuilt, which is exactly the "finish what we started" failure Josh named
directly. Placed beside `.liturgical-title` in the actual live skin (not the gated, non-default
shell-v2 rail), reusing the same color already resolved for the header theme so the two can never
disagree. Palette matches §6 exactly; `none`/unset colors correctly show no dot. **Not yet
screen-confirmed** -- no browser in this environment. Check it on a day where a Lesser Feast or
Holy Day's own color differs from the season default, to see the dot follow the more specific
color. SEED_VERSION `v331-2026-09-23-seasonal-dot-built`.

**State as of 2026-09-23, session end (7).** HEAD before this commit was `16d470e2`.
`saint-agnes` conformed to LFF 2024's actual Jan 21 entry per Josh's direct instruction: its own
`ruleSource` already quoted "Agnes and Cecilia of Rome, Martyrs, 304 and c. 230," but `name`/
`description` never matched it. Now read "Agnes and Cecilia of Rome" / "Virgins and martyrs, 304
and c. 230." -- LFF's own heading, verbatim, checked against the fuller entry (pp.49-50) before
writing it. `saint-agnes-of-rome` (LAT/OOR) deliberately untouched -- Rome observes Agnes and
Cecilia separately; this is a TEC/LFF-specific fix, not a universal one. SEED_VERSION
`v330-2026-09-23-agnes-cecilia-conformed-to-lff`.

**State as of 2026-09-23, session end (6).** HEAD before this commit was `8ae06304`. The 15
flagged same-person pairs checked individually against LFF 2024, not left as a number. **11 are
not bugs** -- each is one tradition's own wording for a shared figure, same design already used
elsewhere in this corpus. **4 were real: both rows carried the ANG tag on the same date**,
meaning both would render together in the live office. LFF settled each: kept
`saint-vincent-of-saragossa` (Jan 22), `gregory-the-great-gregory-the-dialogist` (Mar 12),
`saint-athanasius-the-great` (May 2), `saint-basil-of-caesarea` (Jun 14); the ANG-only duplicate
row on each date deleted, verified by (id, month, day), not id alone -- two other rows sharing
those same four ids at different dates (Sep 3 Gregory/LAT, Jan 1 Basil/EOR-LAT-OOR) directly
confirmed untouched. Entries 1072 -> 1068. **New, separate finding:** LFF's Jan 21 entry is a
joint "Agnes and Cecilia" commemoration; the corpus's Agnes row doesn't include Cecilia --
content gap, not a duplicate-row question, not fixed this session. SEED_VERSION
`v329-2026-09-23-ang-duplicate-identity-resolved`.

**State as of 2026-09-23, session end (5).** HEAD before this commit was `9d08ac38`. Two
things in the prior entry were wrong and are corrected here: the "138 collisions" were NOT the
already-closed "≥58 duplicate id" issue from 2026-09-12 (that was about same-id double-renders,
fixed and verified then); and the one CPG entry with no sanctoral match is Juana Inés de la Cruz
(Apr 18), not Óscar Romero (who IS in the corpus, Mar 24, mislabeled previously). The 138 are now
properly split: 87 resolved by matching CPG's own name against the day's candidates, cited; 15
flagged as likely the SAME PERSON under two different id/name forms -- a real, apparently
never-investigated content question, listed in the ledger, not touched; 35 remain genuinely
ambiguous, not touched. 180 sanctoral entries now carry a sourced color total. SEED_VERSION
`v328-2026-09-23-lesser-feast-collision-correction`.

**State as of 2026-09-23, session end (4).** HEAD before this commit was `a14cc76d`. Per
Josh's direct order (use CPG, stop asking), Dec 13 and Dec 26 both corrected and cited. Lesser
Feast color overlay investigated and partially wired: `renderBcpOffice()` now lets a day's
commemoration color outrank the season default, verified against the real `SaintsResolver.js`.
**Of 98 sanctoral entries colored, only 50 are ANG-tagged and actually live in the BCP office
today** -- 43 are LAT-only and currently reachable by no renderer (real data, not yet useful).
**138 dates were left untouched, not guessed through:** they have more than one ANG/LAT
sanctoral candidate on the same day, which may be duplicate-identity rows (matching the
already-flagged "≥58 id pairs" hazard) rather than a simple ambiguity to break blind. **1 CPG
entry (Óscar Romero, Apr 18) has no sanctoral match at all.** SEED_VERSION
`v327-2026-09-23-lesser-feast-color-partial`.

**State as of 2026-09-23, session end (3).** HEAD before this commit was `a33a4e2`. Josh
ruled: a fixed apostle's feast takes precedence over a coinciding Sunday. Resolves Jan 18
(Confession of Peter, corrected white), Jan 25 (Conversion of Paul, corrected white), Oct 18 and
Nov 1 (already correct, now cited) from the prior entry's 7 flagged dates. Separately, Josh
asked which source backed Bartholomew's stored `red` -- checked, and the answer was none: no
`ruleSource`, no citation of any kind. Corrected to CPG's `green`. **Two of the seven originally
flagged dates remain genuinely open, both real customary differences with a citation on each
side, not something to resolve by fiat:** Dec 13 (Advent 3, rose vs. CPG's plain purple/blue)
and Dec 26 (Stephen, red vs. CPG's white). No SEED_VERSION bump this entry -- only
`data/season/epiphany.json` and `data/season/ordinary.json` touched, no JS/HTML.

**State as of 2026-09-23, session end (2).** HEAD before this commit was `76fbe1c`. Josh's own
idea from a prior, lost session (check Forward Movement/Episcopal calendar vendors) led to
Church Pension Group's official 2026 Liturgical eCalendar, uploaded and used to source
`liturgicalColor`. Real bug found: the per-entry color already existed in `data/season/*.json`
(397 days) but `renderBcpOffice()` never read it, only a flat per-season default -- fixed in
`js/office-ui.js`. 3 genuine data corrections made (2 filled a real gap: Good Friday/Holy
Saturday had no color at all); 95 already-correct entries given a citation they lacked. 105/105
non-flagged Sundays/Holy Days now verified rendering CPG's color end-to-end via the real engine.
**7 dates deliberately left open, need Josh's call, see ledger for full detail:** Jan 18
(Confession of Peter) and Jan 25 (Conversion of Paul) each collide with a Sunday CPG also marks
for that date -- precedence AND color both open; Oct 18 (Luke) and Nov 1 (All Saints) have the
same collision but color itself is already fine; Aug 24 (Bartholomew, CPG says green vs. the
corpus's red) and Dec 26 (Stephen, CPG says white vs. the corpus's red) are genuine disagreements
between two real sources; Dec 13 (Advent 3, rose vs. CPG's plain purple/blue) is a customary
difference. **Lesser Feasts (238 entries) not touched at all** -- no `day_of_season` row of
their own, so wiring these would need the sanctoral overlay path investigated first, not done
this session. SEED_VERSION `v326-2026-09-23-liturgical-color-sourced`.

**State as of 2026-09-23, session end.** HEAD before this commit was `3e46632`. All four
threshold items from the previous entry are now confirmed on Josh's own screen: Coptic (Third
Hour) and East Syriac (Sapra) thresholds show correct office/description, reachable from the
grid's Coptic card, Begin opens the right office at the right hour, Another Office returns to
the grid. **One thing changed after Josh saw it rendered:** he reversed his own earlier framing
call -- Coptic and Horologion no longer say "It is the hour of" (his words: "just dumb", since
the office name already contains "Hour"). All four lanes now read "It is time for" uniformly.
Horologion itself wasn't separately screenshotted (no grid card for it -- see prior entry), but
shares the identical code path as the two lanes that were confirmed. SEED_VERSION
`v325-2026-09-23-lane-threshold-framing-unified`.

**State as of 2026-09-23 continued.** HEAD before this commit was `bfe85cc`. Coptic, East
Syriac, and Horologion now get the same threshold screen BCP has -- "It is the hour of X"
(Coptic, Horologion) or "It is time for X" (East Syriac) -- instead of dropping straight into
the office view. Built by generalizing BCP's existing `#uo-threshold` (`LANE_THRESHOLD_CONFIG`,
`showLaneThreshold()` in `js/office-ui.js`), not three new screens. **Not yet screen-confirmed
by Josh** -- no headless browser in the build environment, so only syntax and server-response
checks were done. **Still to confirm on screen, in order:** (1) picking Coptic, East Syriac, or
Horologion from "Where do you pray?" shows the threshold with the right office name/description
and framing line before dropping into the office view; (2) the "Another office" grid's Coptic
Agpeya card does the same; (3) "Begin" from each lane's threshold opens that lane's actual
office view, at the same office the threshold named; (4) "Another office" from a lane threshold
returns to the 5-card grid correctly. SEED_VERSION `v324-2026-09-23-lane-thresholds-wired`.

**State as of 2026-09-23.** HEAD before this commit was `2d80b3e`. Josh reached the threshold
with `?entry=universal` (this also saves it as his default opening screen) and screenshot-confirmed
the `•` separators. Two hardcoded strings in `#uo-threshold` fixed in `index.html`: "It is the hour
of" restored to Josh's 2026-09-21 correction **"It is time for"** (the 2026-09-22 rebuild had copied
the mockup's line and lost it), and "PRAYING TONIGHT IN" changed to **"PRAYING IN"** per Josh. The
"Praying in" block is a static hand-written list in the markup, copied from the mockup and trimmed
to three traditions. It is NOT CSS bleed-through, which is what the previous session wrongly told
Josh. **Still to confirm:** whether a hard refresh still flashes the old "Where do you pray?"
screen (the 2026-09-22 entry-flash fix). **Per-lane threshold descriptions are now in the repo**
(`COPTIC_/EAST_SYRIAC_/HOROLOGION_THRESHOLD_OFFICE_TEXT` in `js/office-ui.js`, Josh's text verbatim,
stored but not yet wired). They were agreed 2026-09-22 and lost because that session never encoded
them; encode Josh's decisions in the same turn he makes them. SEED_VERSION
`v323-2026-09-23-lane-threshold-text-recorded`.

**State as of 2026-09-22 continued (3), SESSION STOPPED HERE — 91% token budget.** HEAD is
`4728399` (entry-flash fix), pushed and confirmed live via fresh clone. Josh confirmed the
sponsor link is back, then reported a hard refresh briefly (~1/4 second) showing the old
"Where do you pray?" screen before the actual threshold appears. **Traced, confirmed
pre-existing — not something today's work introduced.** `#tradition-entry` has never carried a
`hidden` attribute in its raw markup, unlike `#mode-selection`, which already does; it paints on
first load for every visitor regardless of their stored routing default, until
`initializeEntryRouting()` (on `DOMContentLoaded`) hides it. **Fixed**: added
`hidden aria-hidden="true"` to `#tradition-entry`'s default markup, matching the pattern
`#mode-selection` already uses. Confirmed safe before making the change: `showTraditionEntry()`'s
fallback branch (the genuine first-time `ask` state, no stored default at all) already calls
`showEntrySurface(traditionEntry)` unconditionally, which explicitly clears both the `hidden`
attribute and any inline `display` — so first-time visitors see the screen appear at the same
JS-execution moment `#mode-selection` already does for everyone else; nothing about their
experience changes except that the wrong screen no longer flashes first. **Not yet re-confirmed
by screenshot** — this is the single most important thing for next session (or Josh's next
message) to do before treating any of today's threshold work as fully closed. SEED_VERSION
`v321-2026-09-22-entry-flash-fix` — trust none of these at face value; see the FIRST MOVE line
above.

**Everything else from today's threshold work, for quick orientation:** the threshold (§4 of the
real design source, not this repo's `UI_REDESIGN_HANDOFF.md` paraphrase) now lives correctly in
`#mode-selection` (the `universal` state), full-bleed `position:fixed`, matching the mockup's
actual CSS. Five real bugs were found and fixed across this session's back-and-forth with Josh,
each confirmed against the code before touching anything: (1) the rejected first build was in the
wrong screen entirely (`#tradition-entry` instead of `#mode-selection`) and used the wrong visual
style; (2) the threshold didn't fit in one viewport, requiring scroll; (3) `position:fixed` fixed
that but hid the "Sponsored by" credit link behind it; (4) "Another office" silently failed
because an inline `display:flex` on `#uo-threshold` was overriding the `[hidden]` attribute's
effect; (5) the Dark Mode toggle was removed rather than fabricated a fix for, since no light
variant of this screen exists in the source to wire it to. Full detail on each, in order, is in
the ledger entries dated 2026-09-22 and the state-as-of paragraphs below this one.

**State as of 2026-09-22 continued (2).** HEAD was `898f79b` (sponsor link restored). Josh
reported three things from live testing: (1) unchecking Dark Mode did nothing; (2) "Another
office" did nothing; (3) confusion about the "Praying tonight in" text, which read as
"Anglican · BCPCoptic · AgpeyaChurch of the East · Hudra" with no visible separation between
items. All three investigated against the actual code before touching anything, not guessed at.

**(2) was a real, well-understood bug**, found by reading `showUoThresholdGrid()`'s source
directly: `#uo-threshold` carries an inline `display:flex` (added for the vertical-centering
fix). Inline styles always beat the UA stylesheet's `[hidden] { display:none }` rule, so setting
`.hidden = true` alone never actually hid the fixed, full-viewport threshold — it stayed painted
over `#uo-threshold-grid` regardless of what the hidden attribute said. **Fixed**: both
`showUoThresholdGrid()` and `showUoThresholdDefault()` now also set `.style.display` directly.

**(1) traced to `applyDarkMode()`**: it only ever toggles `body.dark-mode`/`.light-mode` classes
and syncs `[data-app-dark-toggle]` checkboxes — it has no mechanism to affect inline styles, and
`#uo-threshold`'s entire palette is hardcoded inline, matching the design source's own rood-screen
night aesthetic (which shows no light variant at all). **Fixed by removing the toggle from this
screen**, rather than fabricating an ungrounded light-mode palette the source never specified — a
control that visibly does nothing is worse than no control. If a real light variant is wanted,
that's new design work for Josh to specify, not a missing wire-up to silently invent.

**(3) is not actually a rendering bug**: the three-item "praying tonight in" list relied on CSS
flex `gap` alone for spacing, which contributes zero actual whitespace when the text is copied or
extracted as plain text (exactly what Josh's quoted string shows) — the on-screen spacing was
almost certainly fine. **Fixed defensively anyway**: literal `&nbsp;&nbsp;•&nbsp;&nbsp;` separators
added as real text content between items, so the list reads correctly whether viewed or copied,
removing the ambiguity rather than leaving it to chance.

Not yet re-confirmed by screenshot. See §0/item 2. SEED_VERSION
`v320-2026-09-22-threshold-interaction-fixes` — trust none of these at face value; see the FIRST
MOVE line above.

**State as of 2026-09-22 continued.** HEAD was `e03fe60` (threshold moved to `position:fixed`).
Josh confirmed by screenshot: **the threshold now fits in one screen, no scrolling at all** —
timestamp through "Book of Needs" all visible together, matching the mockup's own "one still
moment" intent. But Josh caught a real regression the fixed-position fix introduced: the
"Sponsored by Musings, Ancient and Modern" credit link, which used to be visible by scrolling
`#mode-selection`, was now permanently hidden behind the threshold's opaque `position:fixed`
layer — not just scrolled past, genuinely unreachable, since the threshold now covers the whole
viewport for as long as it's showing. **Fixed in this commit**: the exact same sponsor link (same
`href`, same text — `https://musingsancientandmodern.substack.com/`, "Sponsored by Musings,
Ancient and Modern") added inside `#uo-threshold` itself, styled to match the threshold's own
dark palette rather than reusing `.app-sponsor-link`'s existing CSS as-is (that class is styled
for the old light/parchment skin — `var(--app-ink-soft)` etc — and would have rendered
low-contrast or illegible against the rood-screen background). The original sponsor link further
down in `#mode-selection` was left in place, not removed — it's still what a person sees if they
click "Another office" and the threshold's `display:none`s itself out of the way, exactly as
before any of today's changes. Not yet re-confirmed by screenshot. See §0/item 2. SEED_VERSION
`v319-2026-09-22-threshold-sponsor-link` — trust none of these at face value; see the FIRST MOVE
line above.

## The gutter citation is DONE — built, both bugs fixed, both live-confirmed, closed with measurement

The page column's two-column grid (handoff doc §1: "a 70px right-aligned mono gutter label and the
text") didn't exist before this session; Phase 2 only ever recoloured the old flat layout. Built in
`js/office-ui.js` (`bcpWrapInGutter()`, `BCP_GUTTER_KIND_BY_LABEL`) and `css/office-shell.css` (the grid
itself, screen-only — print and mobile both got deliberate handling). A double-labeling bug (Collect/
Canticle/Antiphon/Invitatory showing their kind word twice) was found in live review and fixed the same
session (`a28af0d`).

**Two live bugs were then found by Josh in screenshot review, missed by Claude on first pass** (a
confident-sounding but wrong non-answer was given twice before Josh had to spell out what was plainly
visible — worth remembering that "I looked at the screenshot" is not the same as examining it closely
enough to catch an overlap or a font mismatch). Both are now fixed and, critically, both were proven
with a real end-to-end scroll test rather than shipped on source-reading alone:

1. **The sticky keeping-place bar overlapping page content — fixed on the third attempt.** Attempt 1
   diagnosed the mechanism correctly (`#main-content`'s grid row was capped against a fixed container
   height) but fixed the wrong element — it grew `#main-content` itself, which fought
   `#daily-office-section`'s own `position:fixed; overflow:hidden` (the true outer viewport, pinned to
   the sidebar's slide-out clip by original design) and broke scrolling entirely. Josh: *"The prayer
   card refuses to scroll."* Reverted the same evening. **Attempt 3 (shipped)**: give `.uo-page` itself
   — the actual scrollable content — `overflow-y: auto; min-height: 0;`, and give `#main-content`
   `overflow-y: hidden` so the two stop competing for the same scroll. `#main-content`'s `height: 100vh`
   was deliberately left untouched. `min-height: 0` was the missing piece: a grid item's default
   `min-height: auto` blocks it from shrinking to its track's size, which `overflow-y: auto` needs in
   order to have anything to scroll. **Tested live by Josh before being shipped**: applied via console
   first, then a full Morning Prayer scrolled end-to-end, eleven screenshots confirming the ordo and
   keeping bars stay fixed top/bottom throughout with nothing cut off. Full history in
   `AUDIT_GOVERNANCE_LEDGER.md` — three consecutive 2026-09-20 entries ("Bug 1 ... FIXED", "REVERTED",
   "FIXED, LIVE-CONFIRMED") — read all three before touching this again; the middle one is exactly the
   mistake not to repeat.
   **Follow-up question raised alongside the fix, now closed by measurement**: since `#main-content` no
   longer scrolls at all, `.uo-rail` and `.uo-margin` — which have no overflow handling of their own —
   could in principle silently truncate. Checked directly: `.uo-rail`'s `scrollHeight` and
   `clientHeight` are identical for a full Morning Prayer (696 vs 696, nothing hidden), and its last
   item ("Let Us Bless the Lord") matches the office's real closing dismissal. **`.uo-margin` remains
   unmeasured** — only one overlay card has ever been exercised in any test — a theoretical risk for
   several stacked cards, not a confirmed one. Worth the same direct measurement if a multi-card margin
   state ever comes up; not chased further absent a reason to.
2. **Body prayer text rendered in two faces at two sizes — fixed, same session.** The shell's
   prayed-text rule matched `.office-container`, `p` and `li` only; every unit the Anglican lane
   actually emits is `.component-text` / `.reading-text` / `.psalm-block`, and `css/office.css:2378`
   sets face/size/line-height/colour on exactly those classes, which beats inheritance at any
   specificity. Fixed with a new `@media screen` rule in `css/office-shell.css`. Confirmed as part of
   the same eleven-screenshot scroll test above — text stayed uniform Cormorant Garamond throughout.

**Nothing further to do here.** The feature is done. If it ever regresses, read the three-attempt
history above before re-diagnosing from scratch — the wrong-element mistake (attempt 1) is an easy one
to repeat if this gets picked up cold.

---

## 0. Where the work actually stands

### The UI redesign, `documentation/UI_REDESIGN_HANDOFF.md`

An outside design proposal, verified against the repo, corrected in fifteen places for governance,
and adopted. One canon — **rail · page · margin** — with everything not prayed aloud moved out of the
text column into the margin. Six phases. **Phase 1, 2, and 3 are all done, including live
confirmation.**

**This table is stale (predates Phases 4-6's actual completion) — see the dated entries at the top
of this file for current state. Kept for historical context only, not re-cited.**

| Phase | State (AS OF 2026-09-20/21, SUPERSEDED — see top of file) |
|---|---|
| 1 — flagged stylesheet + dev toggle | **done** (`?shell=v2` on, `?shell=v1` off, sticky per browser) |
| 2 — three-column shell, both themes, Auto/Light/Dark | **done and confirmed in the browser** |
| 3 — Anglican lane emits the envelope | **done and confirmed in the browser (2026-09-20)** — see below |
| 4 — threshold and Office Settings | **in progress** — threshold rebuilt in the correct place (`#mode-selection`) matching the real design source; ask-state `#tradition-entry` reverted untouched; all four drawers regrouped I/II/III; consolidation and the other 3 lanes' threshold text still open, see §0 item 2 |
| 5 — the other three lanes | not started |
| 6 — delete the old skin | **NOW COMPLETE as of 2026-09-25** — see the top-of-file entry dated 2026-09-25 ("PHASE 6 IS NOW COMPLETE"); the demolition note below is historical context for why Phase 6 was brought forward early, not current status |

**PHASE 3 IS FULLY DONE (2026-09-20) — REFACTORED AND BROWSER-CONFIRMED.**
`renderBcpOffice()` (`js/office-ui.js`) no longer builds one `officeHtml` string and scrapes it
afterward. Every one of its ~90 emission sites now calls one of six small block-emission helpers
(`bcpEmitBlock`, `bcpEmitReading`, `bcpEmitPsalmBlock`, `bcpEmitBare`, plus `bcpEmitDivider` and
`bcpPushDiagnostic`) that build real DOM nodes directly into a `container` element AND push the same
structural knowledge into `blocks[]`/`overlays[]`/`diagnostics[]` in the same call — no second pass
reading labels back out of a finished HTML string. `js/anglican-envelope.js` gained `assemble(env,
context)`, which wraps that directly-built data in the envelope shape; the old regex-scraping
`emit()` function is kept, unchanged, as the reference implementation for lanes not yet converted
(Phase 5), but the Anglican lane no longer calls it. Every branch's decision logic — rotation, season
lookup, rite fallback, every BCP-alternative toggle — was verified line by line against the
pre-refactor original, not rewritten from memory; `node --check` passes on both files. **Two real
bugs were caught and fixed during the conversion, not introduced by it** — full account in
`AUDIT_GOVERNANCE_LEDGER.md`'s first 2026-09-20 entry (title: "The renderBcpOffice() refactor: Phase
3's actual remaining work, done").

**Confirmed live 2026-09-20** (second ledger entry that date): all four offices across two dates,
both themes correctly office-keyed, an overlay card (Agpeya Opening — sourced/anchored correctly),
and a `not-yet-mapped` diagnostic forced live by temporarily filtering a component out of `appData`
in the browser console, since the corpus has no naturally-occurring gap handy — no code or data file
changed, reverted by reload. **Two specific items from the handoff doc's acceptance list were flagged as NOT specifically
exercised. Both have now been followed up, 2026-09-20 continued — one closed, one reopened as
something bigger than a missing screenshot:**

1. **The "Prayer of the Hours" (Church of the East) overlay — live-confirmed by screenshot.**
   There is no component named "Prayer for Understanding" anywhere in the corpus; that name in the
   note's own prior wording doesn't match anything in `index.html` or `components/ecumenical.json`.
   The real toggle is `toggle-east-syriac-hours`, labeled "Prayer of the Hours" under the Church of
   the East heading, emitting `ecu-east-syriac-hours`. It is NOT the same code path as the Agpeya
   Opening test: `overlaySourceLabel()` (`js/office-ui.js:3845`) branches on `comp.tradition` first,
   falling back to a `cop-` id-prefix check only when that's absent. `cop-agpeya-opening` carries no
   `tradition` field and so only ever exercised the fallback branch; `ecu-east-syriac-hours` carries
   `tradition: 'Church of the East'` and takes the first branch — genuinely untested before now.
   Screenshot confirms it renders correctly: `Overlay · Borrowed` / "Prayer of the Hours — Church of
   the East. Anchored before the office." **Closed as a rendering question.**

2. **The seasonal dot's `liturgicalColor` reading was never checked because there is no dot to
   check — this is unbuilt, not untested, and the acceptance-list wording was wrong to call it a
   missed screenshot.** Traced the full path: `CalendarEngine` resolves `liturgicalColor` and
   `renderBcpOffice()` passes it to `updateSeasonalTheme()` (`js/office-ui.js:4151`), which sets only
   the OLD skin's `--accent` custom property. The shell's five `--uo-season-*` tokens
   (`css/office-shell.css:127-131`) have zero consumers anywhere in the repo — grep finds exactly
   five hits, all five being the declarations themselves. `buildShell()`'s ordo line
   (`js/office-shell.js:346-353`) is mark + day-line + theme control; no dot element exists to
   render one into. The envelope's `context` object carries only `calendarSummary` and a hardcoded
   `null` `rankSummary` (`js/anglican-envelope.js:270-273`) — no colour field reaches the shell at
   all. **This is real Phase 4/5 work, not a Phase 3 gap.** Re-file it there rather than leaving it
   looking like an oversight in an otherwise-closed acceptance list.

**A new finding surfaced while running item 1, more consequential than the test it came from —
NOT resolved, needs Josh's governance call before anything is touched:** the text under
`ecu-east-syriac-hours` — "Thou who at every season and every hour, in Heaven and on earth art
worshipped and glorified, O Christ God..." — reads as the Byzantine Horologion's Prayer of the Hour,
said at each Hour after the Kontakion and the forty Lord-have-mercies, not Church of the East /
Hudra content. This corpus's other two Byzantine ecumenical items
(`ecu-prayer-before-reading`, `ecu-kyrie-pantocrator`) are already tagged `tradition: 'Byzantine
Orthodox'`; this one is tagged `'Church of the East'` and shelved under a Hudra UI heading. If the
tag is wrong, the overlay card is currently printing a confident, wrong attribution in the exact
place the margin's disclosure cards exist to prevent it. **Not touched. A single secondary-source
wording match is not this project's standard for moving an attribution** — needs a real witness
check (Maclean's Hudra material already in the repo, weighed against an actual Horologion source)
before any row, label, or tag is changed. Flagged here and in the ledger; do not silently re-tag
either direction without that check.

**Two renderers deliberately untouched, correctly out of scope:** `renderEastSyriac()` and the Coptic
Agpeya renderer, further down `js/office-ui.js`, still build their own separate `officeHtml` strings
the old way. Porting them is Phase 5. Do not confuse "the refactor is done" with "every lane is
converted" — only the Anglican lane is.

**This session's patch (applied as `0012cdc`, read `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-16 entry for
the full account): `overlays[]` and `diagnostics[]` are no longer unconditionally empty.**
`renderBcpOffice()` now tells the emitter, at the exact moment it emits one of the eight
ecumenical/cross-tradition devotions, what it just emitted and where — real structural knowledge from
the same pass, not a guess made downstream from a label string. The emitter uses that to split
overlay blocks out of `blocks[]` correctly (contract §9) and to turn a known placeholder string
("Text not found", "No collect appointed") into a `not-yet-mapped` diagnostic. The margin — empty
since Phase 2 — now draws real cards from both. **Browser-confirmed 2026-09-19** (ledger entry of
that date): the Angelus toggle on BCP Noonday Prayer produced the correct null-source disclosure
card ("provenance not yet recorded in the corpus"), and adding Agpeya Opening alongside it produced
the correct sourced card ("Coptic Orthodox (Agpeya)") in the same margin, correctly ordered. The
Oriental Orthodoxy lane's own native Agpeya office was also checked and correctly shows an empty
margin — that lane still emits no envelope; it is a different thing from the BCP-lane "Agpeya
Opening" overlay toggle despite the shared name. Not exercised live: three-or-more overlays
collapsing behind a "N more notes" toggle — pure UI plumbing, already covered by the jsdom harness,
treated as adequately tested without a live screenshot for that specific case.

**Superseded 2026-09-20: the paragraph immediately above ("Finishing Phase 3 still means
refactoring...") described the refactor as not yet started. It has since been done — see "PHASE 3'S
REFACTOR IS DONE" above and the 2026-09-20 ledger entry.** Kept here only as the historical record of
what the `0012cdc` increment actually delivered at the time.

### The demolition — why Phase 6 was partly brought forward

Six consecutive patches went into keeping an office-keyed Auto alive alongside the old skin. Each was
correct; each sat downstream of the next thing that also owned the theme. **Two systems owning one
piece of global state cannot be reconciled by synchronising them harder.** Phase 1/2's premise —
build beside the old shell, touch nothing — was right for layout and wrong for theme.

So, for the office screen only: the shell owns the ground, the card and the theme outright.
`applyTheme()` sets ONE class (`uo-day`) plus `dark-mode`/`light-mode` by class, and **never calls
`applyDarkMode()`**. The parchment card no longer dresses the prayed text; overrides in
`css/office-shell.css` undo `css/office.css` 1611/1632/1648/1658/1665/1670 **by line**, so Phase 6 can
delete the originals rather than leave them scoped away forever.

**Off the office screen NOTHING changed** — splash, Book of Needs, Bible browser and admin keep the old
skin and old theme behaviour. That is what fixed the dark splash.

### Open, in rough priority order

1. ~~The `renderBcpOffice()` refactor~~ — **DONE and browser-confirmed, 2026-09-20 (continued).**
   See §0 above and the 2026-09-20 ledger entries. Of the two acceptance-list items flagged as
   unexercised: the "Prayer of the Hours" overlay is now live-confirmed by screenshot (closed); the
   seasonal dot was found to be unbuilt, not untested, and is re-filed under Phase 4/5 rather than
   here. **One new open item came out of closing the first**: the overlay's text reads as Byzantine
   Horologion content mistagged `tradition: 'Church of the East'` — needs a real witness check
   before any tag/label is touched. See §0 above for full detail.
1b. ~~`ecu-east-syriac-hours` mistagged as Church of the East~~ — **VERIFIED and FIXED,
   2026-09-21.** Checked properly rather than acted on the wording match alone: the text does not
   occur anywhere in `components/east-syriac.json`, this project's actual Maclean/Khudhra-sourced
   Church of the East corpus, and the component had never carried a `meta.source` field at all —
   unlike every properly-sourced component in this corpus, no source was ever recorded for the
   Church of the East claim in the first place. Checked against a named Byzantine witness: the OCA's
   own "Prayer of the Hours" page matches the stored text word for word, corroborated by the OCA's
   Horologion PDFs (Sixth Hour, Small Compline) and other Byzantine parish sources. **Fixed:**
   `tradition` changed to `'Byzantine Orthodox'` in `components/ecumenical.json`, with a
   `meta.source` citation added (the component's first). Moved out of the "Church of the East" UI
   group into its own "Byzantine Orthodox" group in Opening Devotions (`index.html`); tooltip
   corrected to describe the actual Horologion content and note the correction. **Left deliberately
   unchanged:** the component id `ecu-east-syriac-hours`, the DOM toggle id
   `toggle-east-syriac-hours`, and the `eastSyriacHours` settings key all still carry the old,
   now-inaccurate name. Renaming any of them would also require a settings-migration path — without
   one, Josh's existing saved toggle state (if this devotion is currently checked) would silently
   reset to unchecked on next load. The mismatch between the internal names and the corrected
   content is real but cosmetic and low-risk; worth a coordinated rename with a migration step if it
   ever bothers anyone, not urgent on its own.
1a. ~~The gutter citation~~ — **DONE, 2026-09-20.** Both known bugs fixed and live-confirmed
   (eleven-screenshot, full-office scroll test); the `.uo-rail` truncation question raised alongside the
   fix was checked directly and closed (`scrollHeight`/`clientHeight` identical, nothing hidden). See
   `AUDIT_GOVERNANCE_LEDGER.md`'s "FIXED, LIVE-CONFIRMED" entry and the "CLOSED" entry right after it.
   `.uo-margin` with several stacked cards remains untested (only one overlay card ever exercised) — a
   theoretical risk, not a confirmed one, worth a similar direct measurement if that scenario comes up.
2. **Phase 4** — threshold and Office Settings. **STARTED 2026-09-21, two slices so far.** Slice 1
   (BCP drawer): `<h3>Office Settings</h3>` heading, `I · The Ordo` / `II · Which Office` /
   `III · How You Keep It` markers, 2×2 office-hour grid (§5), BCP Only Mode moved to the drawer's
   foot. Slice 2, same session: **the same I/II/III heading pass done for the other three
   drawers** — Coptic, East Syriac, and Horologion/generic. Coptic's date-nav buttons moved ahead
   of its hour radios (no id, calls shared `changeDate()`/`resetDate()` by name — safe). East
   Syriac needed no moves at all; its existing order already matched I/II/III, so only headings
   were inserted, with the override panel's date+hour-choice UI kept together under II rather than
   artificially split, since it functions as one control there. Horologion's single "Liturgical
   Settings" container was split into two — Office (which hour) under II, Calendar Mode (Old/New
   reckoning) joined with Display under III — checked first that no JS queries `.setting-group`
   structurally, so the split carries no risk. **All four drawers now verified identical to the
   pre-Phase-4 baseline** on every `id=`, `name=`, `onchange=`, and `onclick=` in `index.html`, plus
   balanced `<div>` tags — checked as one sweep across the whole file, not per-drawer. **Still
   deliberately open, same reasons as before:** (a) borrowed-devotions consolidation with a count
   (real per-toggle content decision, not attempted); (b) the seasonal dot (unsourced, item 4);
   (c) **the threshold screen** (the five-button mode grid is untouched — its "hour of X" line
   still needs a real spec answer, not an inferred one); (d) the four sidebars still exist as
   separate panels — restructured internally, none deleted or merged into one shared drawer
   element.

   **Slice 3, 2026-09-21 continued: the threshold screen itself, built.** First established what
   was actually blocking it, and found the block was smaller than first thought: the app already
   has clock-to-hour resolution for every lane (`_defaultDailyOfficeForCurrentTime()`,
   `_defaultCopticHourForCurrentTime()`, `_defaultHorologionOfficeForCurrentTime()`, East Syriac's
   equivalent) — hour detection was never missing. What was genuinely open was only which lane's
   vocabulary the threshold speaks before a tradition is chosen, and that's not actually an open
   question either: §3 rule 4 already routes "I'm not sure" to Anglican, so BCP is already this
   app's governed default lane. The threshold just applies that one screen earlier, using BCP's
   own `_defaultDailyOfficeForCurrentTime()` and its existing label table
   (`SHARED_OFFICE_NAVIGATOR_CONFIGS.daily.options`) rather than inventing a new tradition-neutral
   scheme.

   Also discovered mid-build that the handoff doc's "five-button mode grid" description doesn't
   match the actual `ask`-state screen — verified directly against `initializeEntryRouting()`:
   `#tradition-entry` (the Western/Eastern family-tree picker) is the real `ask` state;
   `#mode-selection` (the true five-button grid) serves the separate `universal` state and was
   correctly left untouched.

   Built: a new `#uo-threshold` panel inside `#tradition-entry` — timestamp, framing line, the
   BCP office name at 88px, a one-sentence description, Begin, Another office, a quiet I'm not
   sure, and a quiet Book of Needs link (`openBookOfNeedsForActiveOffice()`, which already
   resolves the right tradition-scoped Book of Needs even with no office yet selected — reused,
   not rebuilt). The existing family-tree picker is NOT deleted: wrapped in
   `#uo-threshold-another-panel`, hidden by default, revealed only by "Another office" — every
   line of its existing routing (the single delegated `handleTraditionEntryClick` listener,
   `resolveEntryTraditionRoute()`, the ACOE/ACE split) keeps working exactly as before, untouched.

   **The framing line and four descriptions are real devotional copy, not an engineering call —
   drafted by Claude, reviewed and edited by Josh 2026-09-21 before being written into the code.**
   Josh corrected the first draft ("It is the hour of") to "It is time for" — Morning Prayer,
   Noonday Prayer, Evening Prayer, and Compline are BCP offices, not hours; "hour" is the other
   three lanes' vocabulary, not BCP's. Final text lives in `BCP_THRESHOLD_OFFICE_TEXT` in
   `js/office-ui.js`.

   One real bug caught before it shipped: an early version tried to force the opened office via
   `window._forcedOfficeId`, set right before calling `selectMode('daily')` — checked the source
   first and found `selectMode()` unconditionally resets that variable to `undefined` on entry,
   so it would have silently done nothing. Removed; also turned out unnecessary, since
   `selectMode('daily')` already recomputes the current hour itself via the same clock function
   the threshold uses to display it.

   Verified same as slices 1-2: every `id=`, `name=`, `onchange=` in `index.html` identical to
   the pre-Phase-4 baseline, zero duplicate ids among the seven new ones added, `onclick=` diff
   shows only the two new handlers with nothing missing, `<div>` tags balanced, `node --check`
   clean on `js/office-ui.js`. Also checked `css/office.css` for `[hidden]`-selector overrides
   that could have stopped the new wrapper from actually hiding — none apply to the new ids.

   **Phase 4's threshold work is now functionally complete for BCP.** Not done, and not
   attempted: the same threshold treatment for the other three lanes (each would need its own
   framing line and hour text, in that lane's own vocabulary — Coptic/East Syriac/Horologion all
   already have their own clock-to-hour functions, so the mechanism exists; the text does not,
   same authorship-boundary reasoning as above). "Resume" (last-position memory) is explicitly
   deferred per §5 itself — no persisted position exists yet.

   **CORRECTED 2026-09-22 — slice 3 was rejected and rebuilt in the right place.** Josh rejected
   the above on sight: wrong visual style (built without checking the real design source first),
   and wrong screen (naming a specific office as the first thing a true first-time visitor sees
   is presumptuous — his direct words, and correct). Josh then provided the actual original design
   proposal as a zip — `Universal Office Redesign.dc.html`, a working, pixel-precise HTML/CSS
   mockup, not just a picture. **Its §4 build plan states plainly: "Phase 4 — Replace
   `#mode-selection` with the threshold."** Not `#tradition-entry`. This repo's own
   `UI_REDESIGN_HANDOFF.md` — a paraphrase written by an earlier agent — had already drifted from
   that exact instruction by the time this session read it, the same way it mislabeled
   `#tradition-entry` as "the five-button mode grid" earlier this same session. **Lesson: for any
   further shell-v2 visual work, check the original zip directly — do not trust
   `UI_REDESIGN_HANDOFF.md`'s prose for specifics it could have drifted on.**

   Fixed: `#tradition-entry` reverted to its exact pre-slice-3 content — the family-tree picker is
   correct as-is for a first-time visitor and was never supposed to be touched. The threshold now
   lives in `#mode-selection` (the `universal` state) instead, where "it is the hour of Compline,
   praying tonight in three traditions" is honest context for someone who already opted into
   cross-tradition browsing, not a presumption sprung on a stranger. Visual style rebuilt from the
   mockup's actual CSS values, not approximated: full-bleed `images/rood-screen.png` (already
   sitting unused in this repo, confirmed byte-identical to the zip's copy via md5sum before
   slice 3 was even rejected), `blur(2px) saturate(0.75) brightness(0.5)` plus a radial-gradient
   dark overlay, Cinzel/Cormorant Garamond/IBM Plex Mono (the latter two newly added to the Google
   Fonts `<link>`), and a real bordered/glowing Begin button — the rejected version had reused
   `.app-entry-family-card`, a class built for an entirely different kind of card, and rendered as
   an empty flat gray box.

   The five-card grid (Daily Office / Book of Needs / Bible Browser / Coptic Agpeya / Church of
   the East) is fully preserved, every `onclick` untouched, now living in `#uo-threshold-grid`,
   revealed by the threshold's "Another office" button. "Praying tonight in" lists only the three
   traditions this app actually offers today (Anglican/BCP, Coptic/Agpeya, Church of the
   East/Hudra) — the mockup's own list included Roman/Liturgy of the Hours and Russian-Slavic/
   Horologion, neither of which this grid currently offers (Roman is explicitly excluded from
   listing until it lands, per governance rule 9; Horologion isn't a grid entry here) — so those
   two were left out rather than overclaimed.

   Verified against the TRUE pre-threshold baseline (`1bdd910`, before slice 3 ever touched
   anything) rather than against slice 3's own already-wrong baseline: every `id=`, `name=`,
   `onchange=`, `onclick=` in `index.html` and every top-level function in `js/office-ui.js`
   diffed identical, with only the five new ids and two new onclick handlers this fix actually
   adds showing up as new. `node --check` clean. Div tags balanced.

   Still open, unchanged: the same threshold treatment for Coptic, East Syriac, and Horologion —
   each needs its own framing line and description text, and now also its own correctly-placed
   screen once their own entry paths are worked out (`images/lane-coptic.webp`,
   `lane-byzantine.webp`, `lane-eastsyriac.webp` are already staged in this repo for exactly this,
   confirmed present alongside the rood-screen asset). Borrowed-devotions consolidation and the
   four-drawers-into-one-element merger remain open from earlier entries, untouched by this fix.
3. **Emitters for Coptic, East Syriac, Horologion.** Those three lanes still show the rail
   placeholder, which is correct and not a fault. Horologion goes LAST: it already emits
   `{tradition, officeKey, date, title, status, sections, diagnostics}` with a validator that
   hard-requires those seven fields, so porting it is a reconciliation of two payload shapes.
4. **`data/season/*.json`'s `liturgicalColor` needs a `ruleSource`.** It is populated on 397 days, but
   **the 1979 BCP prescribes no liturgical colours at all** — zero hits for "color"/"colour" across
   35,229 lines. So that field rests on something other than the BCP and nobody has said what.
5. **Eastern seasonal colours** are a SOURCED-CONTENT task with a named witness per tradition, not a
   shell task. For East Syriac, **no dot is the likely correct answer**.
6. **The dev server is slow and it is not from this work.** Every script loads in ~4.1–4.3s including
   files untouched all session, all landing within 200ms of each other — `scripts/dev-spa-server.mjs`
   serves sequentially with no-cache headers, plus the Codespaces proxy. Josh confirms it predates
   this work.
7. ~~`documentation/universal-office-navigation-architecture.md` marked CANONICAL, conflicting with
   Phase 6~~ — **RESOLVED, 2026-09-21. Josh's ruling: the redesign plan controls; Phase 6 proceeds
   as written.** The nav doc's surface section (§6, parchment-as-permanent-identity) is superseded;
   its navigation model (rail + "Office Settings" drawer, required mode parity) was never in
   conflict and remains in force, carried verbatim into `UI_REDESIGN_HANDOFF.md` §3.1. Header of the
   nav doc updated to record the supersession. Nothing was blocked on this — Phase 4 doesn't touch
   surface — so this only matters once Phase 6 actually starts.
8. ~~The app is defaulting to Dark instead of Auto under `?shell=v2`~~ — **RESOLVED 2026-09-20.**
   Neither candidate cause from the original flag was it. The real bug: `applyTheme()` wrote
   `uo-day`/`dark-mode`/`light-mode` onto `body` unconditionally whenever `shell-v2` was on, with
   no check for whether an office was actually active — so it reached the splash, the Book of Needs
   and the Bible browser too, contradicting this note's own §"demolition" claim that the shell
   already kept its hands off those screens. Confirmed live: Evening Prayer correctly dark, then
   Back to Modes left the splash dark too, because `currentOfficeId()`'s fallback read a stale,
   never-reset `office-time` radio left over from the office just exited, and `applyTheme()` had no
   guard to stop running at all once no office was active. Fix: both `applyTheme()` and
   `currentOfficeId()` now check `body.office-active` (added by `selectMode()`, removed by
   `backToSplash()` / `showTraditionEntry()` / `showUniversalModeSelection()`) and refuse to touch
   theme state, or report an office, when it's absent. Two manual-override red herrings surfaced and
   were cleared along the way, not part of the fix: a forgotten `traditionDefault: church-of-the-east`
   in the local profile from an earlier real click (`resetUserTraditionDefault()` clears it), and a
   forgotten explicit `LIGHT` click that had written `'light'` to `universalOfficeShellTheme`
   (cleared via `localStorage.removeItem`). **Live-confirmed the same day**: Evening Prayer → Back to
   Modes came back dark once more, but this time consistent with itself — the splash's own "DARK
   MODE" checkbox (old skin, unrelated to the shell) was checked, from forgotten browser testing days
   earlier, and unchecking it flipped the splash light immediately with no shell involvement either
   way. Before the fix, the same reproduction had produced a *mismatch* (checkbox unchecked, page
   dark anyway); checkbox and page state now agree, which is what this fix was for. See
   `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-20 entry for the full reproduction trail.

---

## 0a. Hard-won rules from the redesign. Read these before touching the shell.

These each cost at least one full patch to learn. They are not style preferences.

**SPECIFICITY.** `css/office.css` carries rules at (0,3,1) — e.g.
`body.office-active #main-content.app-primary-canvas { display: block; }` at line 2248. A plain
`body.shell-v2 #main-content` is (0,2,1) and **loses silently**. Any new structural rule against
`#main-content` must be written at (0,3,1) or heavier. A comment in `css/office-shell.css` says so.

**INLINE STYLES BEAT STYLESHEET RULES.** `index.html` writes `style="position:fixed"` and
`style="display:flex"` inline on elements the shell needs to move or hide. A CSS override without
`!important` cannot win. Clear the property **on the element** from JS, or target an ancestor that
carries no inline style.

**RE-RESOLVE ON THE RENDER, NOT THE CLICK.** `renderOffice()` is async. Any handler on `click` or
`change` reads the PREVIOUS office. A `MutationObserver` on `#office-display` is the signal that the
render landed. **Three separate bugs this session had this exact shape.**

**WHERE SOMETHING MUST ALWAYS BE TRUE OF APP-REBUILT DOM, STATE IT IN CSS.** The navigator and the
sidebars are rebuilt with `innerHTML` on every render, which wipes anything JS set. Imperative fixes
must win every render; a stylesheet rule states it once.

**`window.selectedMode` DOES NOT EXIST.** `office-ui.js` declares it with a top-level `let`, which
creates a global *lexical* binding and never becomes a window property. Read the lane from the DOM
instead: each settings drawer carries `mode-hidden` when inactive and exactly one does not.

**EVERY LANE'S RADIOS ARE IN THE DOM AND CHECKED AT ONCE**, and each lane names its hour several ways
(`esy-hour-override`, `esy-time`, `shared-office-nav-eastSyriac` are all the same choice). First-match
lookup over a shared DOM is not a lane resolver. Keep the per-lane candidate lists. The shared
navigator builds `name="shared-office-nav-${modeKey}"` at `office-ui.js:2393`, so those names never
appear in a grep.

**HARDCODED IDS ARE A RECURRING FAULT IN THIS FILE.** `getElementById('toggle-dark')` existed once, in
the BCP panel, so every other lane read a checkbox belonging to a different tradition — and
`undefined !== false` is TRUE, so a missing element resolved to DARK. Select by
`[data-app-dark-toggle]`. The comment inside `applyDarkMode()` already recorded this failure mode
twice before it happened a third time.

### On testing, which is where this session actually went wrong

**jsdom cannot see the cascade, an async render, or a computed style unless asked.** Three fixes this
session passed their tests and failed in the browser: a grid rule that lost on specificity, a theme
that never re-resolved, and a button that never moved. Each test asserted the wrong property —
DOM parentage instead of computed position, a resolver's answer instead of whether it was re-run.

**A harness that builds a fresh world per case cannot see a bug that only exists over time.** The
eleven-office Auto test proved the resolver correct eleven times while never once exercising
re-resolution, which was the broken part. **Mutate a live page.**

**ON ANY "IT DOESN'T DO WHAT YOU SAID": DUMP REAL STATE FIRST.** Josh's console dumps settled four
bugs that reasoning from the code had failed on — twice by what was MISSING from the output, since
`JSON.stringify` drops `undefined`. Two repo-checkable guesses in a row is the signal to stop
guessing. **Distrust any fix whose correctness cannot be exercised by a test.**

---

## 0b. Working with Josh on this

He applies every patch himself via `git am` and pushes. Cut `git format-patch`, surface the patch,
and give him the literal `git am` / `git push` lines **in the same turn as the commit**.

**Patches are authored as `JW Jeffery <josh@jwjeffery.org>`.** GitHub refuses to sign a commit whose
author is not a verified identity on his account, which broke `git am` on every container rebuild.
`.git/config` also held `you@example.com` as committer, which outranks global config; that was set
locally too, back when this was first fixed. **It recurred anyway, 2026-09-16, after a container
rebuild** — `git am` failed with `error signing commit: ... 403 | Author is invalid`. **It then
recurred TWICE MORE on 2026-09-19, in the SAME session, hours after `commit.gpgsign false` had
already been set and had already worked once.** This is a stronger signal than "doesn't survive a
rebuild": `commit.gpgsign false` (repo-local) is not reliably sticking at all in whatever this
Codespace is doing, for reasons not yet diagnosed. **Do not assume any fix to this is durable, even
within one sitting.** The recovery sequence that has worked every time so far, and should be tried
first on any future `git am` failure with this signature:
```
git config commit.gpgsign false
git am --abort
git am <patch>
git push origin main
```
`git am --abort` is safe even when nothing is actually mid-rebase — it no-ops harmlessly rather than
erroring, and has been needed almost every time because the failed `gpg` signing step leaves a stale
`.git/rebase-apply` behind. **Worth investigating properly next time this comes up, rather than just
re-running the workaround again**: check whether something in this specific Codespace (a devcontainer
setting, a global includeIf, an org policy) is force-re-enabling signing on each new shell, since
repo-local config alone has now failed to hold multiple times.

**Avoid a period in the patch filename** — it has caused "No such file or directory" on his end.

**He is a non-coder.** Landmarks in edit instructions must be unambiguous. But he reads output
closely and has caught more real defects from screenshots than the test suite has.

**His screenshots are the most reliable verification channel in this project.** When something is
wrong on screen, ask for one — and read it before theorising.

**Every commit carries the ledger entry, the resume-note update, `audit-ledger.html`'s SEED_VERSION,
and the cache-bust bump for every touched file, together.** A CSS param left behind while JS moves has
already served a stale stylesheet from cache twice.

---

**Session of 2026-09-12 ended here. Everything below was pushed and verified against a fresh
clone of origin, not just reported green locally. HEAD b35b55c, SEED_VERSION v269.**

### THE IMMEDIATE NEXT TASK: build the Dormition/Assumption cluster + the two COE Marian rows

All the research is done and recorded below. This is a DATA job on top of an engine that is now
ready for it. Content first as its own commit, then any engine wiring as a second — the pattern
used twice this session. Cut `git format-patch`, surface the patch and hand Josh the literal
`git am` / `git push` lines in the SAME turn as the commit. He applies these personally.

**Correct dates, each verified this session against a primary source — do not re-derive, but DO
open each row before editing it:**

| Tradition | Observance | Date | Corpus state |
|---|---|---|---|
| ANG / LAT | St Mary the Virgin / Assumption | Aug 15 | correct |
| EOR | Dormition of the Theotokos | Aug 15 | correct (confirmed live on orthocal, Major Feast Theotokos) |
| EOR | Leavetaking of Dormition | Aug 23 | **`afterfeast-of-the-assumption` is MIS-TAGGED OOR** — it is Byzantine content; confirmed live on orthocal |
| OOR:Coptic | Dormition proper (21 Tobi) | **Jan 29** | **MISSING ENTIRELY — new row needed** |
| OOR:Coptic | Assumption of the Body (16 Mesori) | Aug 22 | present and correct |
| OOR:Coptic | Last day, Fast of St Mary (15 Mesori) | Aug 21 | present as `vigil-of-the-assumption`; date right, **label wrong** — it is the fast's last day, not a bare eve |
| OOR:Armenian | Assumption (Verapokhumn) | **Sunday nearest Aug 15** | `dormition-of-the-theotokos` — stored as FIXED Aug 15, structural mismatch |
| OOR:Syriac | Dormition | Aug 15 | no row |
| COE | Dormition | **Aug 15 (Gregorian)** | **MISSING — new row needed** |
| COE | Protectress of the Harvest | **May 15** | see the May 15 question below |
| COE | Commemoration of Mary + St James | Friday before Epiphany | **ALREADY EXISTS** as `saint-james-the-brother-of-the-lord` |

**`dormition-of-the-theotokos` is NOT a duplicate row.** An earlier version of this note suggested
it might be. It is the Armenian row, correctly scoped `oorSubtradition: Armenian`. Do not merge or
delete it.

**The Armenian rule needs NO new engine machinery.** "Sunday nearest Aug 15" is identically "the
first Sunday on or after Aug 12" — verified across 2020–2050, zero mismatches, all seven weekday
cases exercised, window always Aug 12–18; 2026 resolves to Aug 16, matching the Armenian Prelacy's
actual observance that year. That is exactly the bounded-window shape already built for Joseph the
Betrothed (`maxOffsetDays`/`fallbackOffsetDays`). It needs one new fixed-date anchor branch in
`js/saints-resolver.js`, not new search logic.

**COE Aug 15 is GREGORIAN, confirmed 3/3** — ACOE Diocese of California 2024 and 2026, and ACOTE
Diocese of Western Europe 2026, all print it on plain Aug 15 against Gregorian grids (Transfiguration
at 8/6, not 8/19). It does NOT need `fixedFeastMode`. The 2024 California edition names it
explicitly: "Commemoration of the Falling Asleep (Dormition) of St. Mary the Blessed Virgin",
preceded by "Rogation of the Blessed Virgin Mary (August 1-15)". These are the printed calendars
already in `data/kalendar/source-witnesses/` (`2026cal.pdf`, `2024 full.pdf`, `English_2026_2.pdf`)
— read them with `pdftotext -layout`, they are the primary witness and need no web research.

**DO NOT cite `CGSC-CALENDAR-2026.pdf` as a Church of the East witness.** It is Christ the Good
Shepherd, Wakeley, Australia. Mar Mari Emmanuel was ordained in the Ancient Church of the East,
**excommunicated in 2014**, and founded that church as an INDEPENDENT East Syriac body in 2015. Its
calendar is Julian +13 throughout with a Gregorian Nativity (Epiphany Jan 19, Transfiguration Aug 19,
Dormition Aug 28) and it looks exactly like evidence of a Julian/Gregorian split. It is not ACOE or
ACE. What the Ancient Church of the East proper does for Aug 15 remains genuinely unestablished —
no ACE calendar is in the repo.

**BOTH QUESTIONS BELOW WERE CLOSED 2026-09-12** (ledger, Dormition-cluster entry): COE tag added
to `holy-virgin-mary-of-the-harvest`; the three unmarked OOR rows removed as Byzantine-only. Kept
only as history. Do not re-raise them.
1. **COE May 15.** Both California editions print "Commemoration of Mart Mariam the Blessed Virgin
   **(Protectress of the Harvest)**" — same date, same harvest epithet, same agricultural function as
   the Syriac Orthodox May 15 already in the corpus as `holy-virgin-mary-of-the-harvest`
   (`oorSubtradition: Syriac`). Recommendation was a COE tag on that existing row rather than a
   second row, since `oorSubtradition` scopes only the OOR side; the row's name and its "(Syriac)"
   description would want widening. Not done — Josh's call.
2. **The three unmarked OOR rows** (see below).

**A trap that already nearly caused a duplicate:** the first COE Marian commemoration ALREADY EXISTS.
California 2026 prints Jan 2 as "Commemoration of the Blessed Virgin Mary, **and of St. James the
Brother of our Lord**" — a joint commemoration. The corpus has `saint-james-the-brother-of-the-lord`
(COE, `relative`, anchor epiphany, weekday 5, n −1) — the James half, with Mary absent from its
identity. The rule is correct and validated (Jan 2 in 2026, Jan 5 in 2024, both matching the printed
editions; Western Europe independently prints Jan 2). This is a **naming/identity fix on an existing
row, not a new row.**

**CORRECTION ON RECORD:** earlier in the 2026-09-12 session Claude claimed the East Syriac rite keeps
no Dormition at all, on a single Wikipedia witness. That was WRONG and Josh caught it. Two ACOE
sources (William Toma, acoecalifornia.org; Rev. Tower Andrious, bethkokheh.assyrianchurch.org, citing
Darmo's Ḥudra) both state the Church of the East keeps THREE Marian commemorations. Wikipedia
contradicts itself on this point across two of its own articles. Do not rely on it here.

---

### What was fixed and pushed on 2026-09-12 (context for the above)

**1. `traditionObservance` was INERT in the canonical async read path.** `resolveCommemorations`
never threaded `tradition` into the date rule, so `observanceFor()` always fell through to the shared
`observance`. 55 rows carry overrides; **60 resolved to a different day than the shared rule and were
rendering on the wrong date in the live app** while the data was correct. `filterCachedByTradition`
already did it correctly — the two public read paths disagreed, and that disagreement is what
surfaced it. One-line fix. Commit `eee6589`.

**DUPLICATE ROWS: five removed 2026-09-12 (session 5), including a live double-render bug.** Abraham
of Kashkar, Sabrisho and Andrew each had a residue row left behind when the 2026-08-30 consolidation
moved a date instead of deleting the row; all three printed TWICE for COE users. Sweeping the class
through the real resolver found two more the static check missed -- Shimon Bar Sabbae and Qardagh,
each holding a California ordinal rule AND a Western Europe cycle rule, printing twice a year on two
different days. **Josh's call: follow California**; the better-attested Western Europe rule was
removed and that fact is disclosed on both surviving rows. Zero double-renders remain across
2025-2035. Duplicate ids 49 -> 44; the rest do not collide and are NOT being renamed (ids are
referenced from `js/coe-eligibility.js` and `scripts/saints/*.json`). See the ledger entry.

**2. `saint-andrew-the-apostle` duplicate-id bug, exposed by fixing #1.** The Dec 13 (4 Kiahk) Coptic
override had been written to the wrong row of a duplicate-id pair — the COE-only row, which has no
OOR tag, so it could never fire. Moved. **The duplicate-id hazard is real and only PARTLY resolved across
the file — 44 duplicate ids remain as of 2026-09-12, none of them colliding. Key bulk edits on (id, month, day), never id alone.** Flagged
but not fixed: that COE-only row still carries `dayLegacy: "May 17"` against an observance of Nov 30.

**3. Option B built: sub-tradition schema.** `traditionObservance` keys may now be `OOR:Coptic` style,
resolved most-specific-first. `oorSubtradition` is load-bearing — **it was read by no code at all
before this.** Wired via `profile.oorSubtradition` at the single `resolveCommemorations` wrapper in
`office-ui.js`. Non-destructive: no sub-tradition set = everything renders, exactly as before.

**THE SEMANTICS CORRECTION THAT MATTERED — do not undo it.** `sanctoral.json`'s own top-level note
says an absent `oorSubtradition` means Coptic. **It does not.** 62 of the 143 unscoped OOR rows are
shared with ANG/LAT/EOR/COE and are pan-Christian (Epiphany, the Circumcision, Basil the Great,
Matthias, the Forty Martyrs of Sebaste). Absence means *not sub-tradition-specific*. A filter built on
the note's wording would hide those from Armenian users. ~~**The top-level note in `sanctoral.json`
still contains the wrong wording.**~~ **CORRECTED 2026-09-12 (session 5)**, along with a second false
claim in the same note (a `tagsGap` field no row carries, and 170 empty-`tags` entries where there
are two). See the ledger entry.

Backfill applied: 78 Coptic-only rows explicitly marked `Coptic`; all 39 bare `OOR` override keys
re-keyed to `OOR:Coptic` (each was coptic.io/Synaxarium-confirmed in its own note, so under the bare
key Armenian and Syriac users were being served Coptic dates; they now fall through to the shared
date). Commits `092cf5b` and `b35b55c`.

**THREE ROWS LEFT UNMARKED (CLOSED 2026-09-12: all three removed as Byzantine-only):** `saint-abraham-of-carrhae`,
`saint-abraham-the-hermit` (both Feb 14) and `martyr-thespesios-of-cappadocia` (Jun 1) have NO
`ruleSource` of any kind and no Coptic attestation in their own fields. They read as Syriac/Byzantine
and may be stray OOR tags of the kind already cleaned up elsewhere in this project. Deliberately not
guessed at.

~~**NO UI PICKER EXISTS** for choosing a sub-tradition.~~ **BUILT 2026-09-12 (session 5).**
`#profile-oor-subtradition` now sits in the local profile defaults panel, after the Book of Needs
role control; `setUserProfileOorSubtradition()` in `js/office-ui.js`. The empty option maps to
`null`, never `'Coptic'`. Filter behaviour verified in a Node harness via `saintAppliesToContext`;
the DOM round-trip itself was not exercised in a browser and is disclosed as such in the ledger.

**Still open from before this session:** the EOR December confirmation pass (~33 EOR-effective rows,
not started); `st-pachomius-of-patmos` (needs the movable-date engine — his commemoration is Ascension
Day itself); `martyr-meletius-stratelates` (May 24, absent from orthocal under both traditions);
`saint-james-the-hermit` (Nov 27, no match under any phrasing). coptic.io connector still exposes zero
tools; Orthocal has been reliable every session — use it without hesitation.

---

## 0b. Original immediate-next-task text from the 2026-09-07 rewrite (superseded, kept for context)

**Check the entire coptic.io saint registry directly and import whatever major figures are genuinely
missing from OOR.** Josh's own words: "We will be done with it once you check the entire registry
and do any other imports that are needed." **This work is now DONE** — see section 7 below, "OOR
gap sweep CLOSED." The coptic.io-specific paragraphs immediately following this one are historical
context for why the sweep used Wikipedia/St-Takla.org instead of the live connector, and remain
accurate as history, not as a live task list.

**The coptic.io connector is per-Codespace infrastructure Josh runs and forwards locally
(`coptic_mcp_server.py`, repo root) — it is not reachable from a fresh Claude account/session with no
custom connector added, confirmed via `search_mcp_registry` returning nothing on 2026-09-07, not
assumed.** Ask Josh directly whether the server is running and port 8000 is forwarded as **Public**
in his Codespace's Ports tab before spending time on it; do not assume it will ever become available
without him doing that setup step first.

**Fallback in active use since 2026-09-07: Wikipedia's full-MONTH Coptic Synaxarium tables** —
better than the old per-day-page plan. One page per Coptic month
(`en.wikipedia.org/wiki/<MonthName>`, e.g. `Thout`, `Paopi`, `Hathor`...) carries the whole month's
commemorations in one table, citing CopticChurch.net, St-Takla.org and the printed 1995 Saint George
Coptic Orthodox Church Synaxarium — one fetch instead of ~30 day-page fetches. Use this for OOR
unless/until the connector comes up.

**Progress: Thout (11 Sept – 10 Oct) is the only month checked so far — 1 of 12 (see §7 for the four
open findings from it that still need a decision before acting). Paopi through Mesori, plus the
intercalary Pi Kogi Enavot, remain untouched.** Do not attempt the whole sweep in one pass — this was
explicit guidance after Thout alone surfaced four items needing individual judgment calls
(same-figure-different-reckoning questions, not simple absences).

---

## 1. First thing to do, every session

**Read the full repo and the governance documentation before any analysis or build work.** This is
the most consistently enforced rule on the project and prior instances have repeatedly failed it. In
particular read `AUDIT_GOVERNANCE_LEDGER.md`, `documentation/OPEN_ITEMS_FIXABILITY.md`, and
`documentation/UNIVERSAL_OFFICE_CORE_CONTRACT.md`.

**Do not trust this note, or any stored memory, about whether something is blocked.** Check
`OPEN_ITEMS_FIXABILITY.md` first — **and check it against the ledger**, since the fixability file has
gone stale relative to the ledger before. It records what blocks an item; it is not proof the item is
still open.

---

## 2. Who and what

Josh (GitHub `JWJeffery`) owns **PrayerAppNew** / "The Universal Office" — a free, non-commercial
multi-tradition liturgical prayer web app at theuniversaloffice.com. He is not a coder. Four
traditions: Anglican (BCP 1979), Coptic (Agpeya), Church of the East (East Syriac), Byzantine
(Horologion).

A prior assistant, **Lucy**, was dismissed for falsely certifying content as accurate. All Lucy-era
certifications are void and must be independently re-derived. Nothing in this repo's own docs or
`structure.json` counts as evidence; verify against primary sources.

**`synaxarium-review/` is a separate project — do not touch it, do not extend it, do not build
anything parallel to it either without asking first.** It is a review UI (data build script, browser
concur/override/custom-decision workflow, disk persistence, a merge-back script) built for the
**Anglican Kalendar v0.1 candidate matrices** specifically (`data/kalendar/*-candidates.csv`,
SIN-keyed). Confirmed explicitly by Josh, 2026-09-07: this is a different project than the EOR/OOR
sanctoral work described in §7, even though both are "review a candidate against a source and
decide." To start it: `cd synaxarium-review && python3 -m http.server 8000`, then open
`http://localhost:8000` — this is already in the tool's own README; check there before asking
Josh to repeat it.

---

## 3. Workflow — non-negotiable

- Claude generates patches with `git format-patch`; **Josh applies them.** Claude never pushes.
- **Every commit gets a patch surfaced (`present_files`) and the `git am` / `git push` lines given
  in the SAME turn as the commit — no exceptions, ever.** This was violated once, 2026-09-07: six
  commits were made and reported as "committed" with no patch ever surfaced, meaning real work sat
  uselessly in the sandbox with nothing for Josh to apply. Caught only when he asked directly and
  was, rightly, furious. All six were recovered and applied together, but the lesson stands on its
  own: committing is not done until the patch is in Josh's hands.
- Surface the two lines ready to copy-paste, with no walkthrough:
  ```
  git am <exact-patch-filename>
  git push origin main
  ```
- **Always build the patch against the verified current `origin/main`.** Clone fresh and check
  `git log --oneline -1` first.
- If `git am` fails, the usual cause is re-running an already-applied patch. Clear with
  `git am --abort 2>/dev/null; rm -rf .git/rebase-apply`, then check whether origin already has it.
  **If `git am` fails with "Patch format detection failed" on a patch that Claude confirms parses
  fine on its own end (`git apply --check` passes clean), the mbox envelope likely got mangled in
  transit, not the diff content.** Fall back to `git apply <patch>` (applies the diff without
  needing the mbox format) followed by a manual `git add` and `git commit` -- but scope the `git add`
  to exactly the files the patch touches (`git add data/saints/sanctoral.json`, not `git add -A`).
  This bit once, 2026-09-07: `git add -A` swept in an unrelated batch of untracked files sitting in
  the working directory (the live `coptic_mcp_server.py` connector and its data) into a commit that
  was only supposed to touch the sanctoral JSON. No data was lost, but always name the exact path(s).
- **Patch filenames with a period in them (e.g. containing "coptic.io") have caused "No such file or
  directory" errors on Josh's end** when applying — likely a download/transfer quirk, not something
  wrong with the patch itself. If a `git apply` fails with a missing-file error right after a patch
  was surfaced, have Josh run `ls *.patch` first to see the actual filename before assuming the patch
  wasn't delivered; re-surfacing under a short, period-free filename resolved it once already.
- **Never use `json.dump()` on a huge file without version-controlled review** — prefer targeted
  edits. **Validate JSON before writing**, not after.
- **When scripting a bulk edit against `data/saints/sanctoral.json`, key on `(id, month, day)`, never
  `id` alone.** At least 58 duplicate `id` values exist in the file (found 2026-09-07, not yet
  resolved — see §7). A blind id-keyed write bit this project's own tooling mid-session: two
  unrelated rows sharing an id with ones being fixed got silently clobbered, caught only by a
  full-file duplicate-id rescan before the batch was trusted. Full-file backup before any bulk
  sanctoral edit, and re-verify with a fresh read after, every time.
- Cache-bust params in `index.html` (`?v=NNN`) must be **bumped manually** whenever the
  corresponding JS file changes.
- `AUDIT_GOVERNANCE_LEDGER.md`, this note, `audit-ledger.html` and `SEED_VERSION` are updated **in
  the same commit** as the fix, never batched later. **This slipped twice in one session
  (2026-09-07)** — once for the entire OOR sweep, once for the engine additions and the start of the
  gap sweep — both caught only in a later cleanup pass. Check `SEED_VERSION` against the actual
  latest commit's content every time you're about to write a ledger entry; don't assume it's current.

---

## 4. Standing content rules

- Every component cites a specific source page. Gaps are **disclosed** in component metadata and on
  the dashboard, never filled by guessing.
- **Sweep the class, don't fix the instance.** When one instance of a bug is found, check every
  sibling programmatically.
- **But do not sweep on assumption.** The Wednesday Evening Anthem remains the standing
  counter-example: it genuinely differs from every other weekday.
- Reused components are verified by direct text comparison, never assumed from title similarity.
- Node simulation against real dates before committing any calendar or engine logic — this is how
  the three new moveable-date rules in §7 were verified before being wired into data, not after.
- Scope and architectural decisions are Josh's. Record conflicts for deliberate resolution rather
  than overriding them silently.
- Work continues until finished. Do not treat content-complete as done while defects remain.
- **A structural mismatch is not the same as a data mismatch, and needs a different fix.** When a row
  is stored as `fixed` but the underlying commemoration is genuinely moveable (Pascha-relative,
  Christmas-relative, or a true recurring monthly date), no lookup will ever correct it — it needs an
  actual engine rule. Three of these were found and built this session (see §7); at least one more
  (the general moveable-observance gap for e.g. Joseph the Betrothed's ANG/LAT dates) may still be
  lurking elsewhere in the corpus. Don't assume "no match found" always means "no source" — check
  whether the row's own `observance.type` is even the right shape for what it's trying to represent.

---

## 5. Communication

Josh is extremely direct. Correct errors immediately, without softening or justification. No
walkthroughs of commands he already knows — check the repo/README for the answer before asking him to
repeat something that's already documented. **Ask directly and specifically for what you need** —
his words: *"I don't provide shit I'm not asked for. I'm not a mind reader."* Read pushback as an
instruction to work harder, but also as a genuine signal to stop and actually listen rather than
push the same thread forward — conflating two different things Josh has ("there already is a decision
engine" != "please build a decision engine") produced real, deserved anger on 2026-09-07. When in
doubt about whether something already exists in the repo, check before assuming it needs building.

---

## 6. Source reachability — probed, not assumed

| Source | Reach |
|---|---|
| **Maclean 1894** via Drive `read_file_content` | Front matter through printed **p.34** only |
| Maclean via ACOE mirror / archive.org | ~p.45 / hard wall. **Do not retry either.** |
| **O'Leary 1911** via Drive `read_file_content` | Full. `download_file_content` is unusable (10MB cap, 40MB file) |
| **Hapgood 1906** | archive.org gives front matter only; Appendix B came from Josh |
| **BCP 1979** | In repo, complete |
| **ODCC** | In repo but **no text layer at all**. Do not re-propose. |
| **Lambertsen Octoechos** | In copyright to ~2087; citable, not reproducible |
| **orthocal.info** (EOR, Slavic/OCA + Greek/Antiochian beta) | Direct MCP tools `search_saints` / `get_day` -- **connector has been flaky across sessions**, sometimes simply absent from the tool list for a whole turn with no error beyond "not available in this turn." When that happens: do not retry in the same turn; fall back to Wikipedia's compiled "Month Day (Eastern Orthodox liturgics)" pages (see §7) rather than stalling. |
| **coptic.io** (OOR, Coptic) | MCP tools `search_saints` / `get_day` / `get_day_coptic`, same flakiness pattern as orthocal.info -- **and now understood why**: `coptic_mcp_server.py` (repo root) is a live wrapper Josh must keep running and port-forwarded in his Codespace for this connector to work at all (2026-09-07 correction -- an earlier version of this note wrongly called this wrapper "superseded"; it is not). Not persistent -- does not survive a Codespace restart on its own, and the forwarded port's visibility (must be Public) can reset too. If the tool drops mid-session, that is the first thing to check/ask about, not a reason to assume something is broken on Claude's end. Fallback when it's down: Wikipedia's per-Coptic-day pages (e.g. `Thout 18`, `Paremhat 21`), sourced from copticchurch.net/st-takla.org. |

**Any item needing Maclean past p.45 is blocked on Josh supplying pages.** Retrying will not change
it.

---

## 7. What is open

**The sanctoral (EOR/OOR) confirmation-and-gap-sweep effort is paused, not active — the project
moved to the UI redesign (see §0) on 2026-09-12 and hasn't returned to it since.** Full narrative
history of the sweep lives in `AUDIT_GOVERNANCE_LEDGER.md`; do not restate it here again. Three
things that were open as of the 2026-09-11 session are now CLOSED and should not be reopened or
re-flagged as pending:

- **EOR calendar-year sweep (Jan–Dec) — CLOSED 2026-09-12.** All twelve months re-verified against
  orthocal.info row by row; the three individually-flagged saints (Pachomius of Patmos, Meletius
  Stratelates, James the Hermit) were also resolved in this pass. Ledger: "December EOR sweep
  CLOSED."
- **OOR 13-month gap sweep (Thout through Mesori, plus Pi Kogi Enavot) — CLOSED 2026-09-11.**
- **Dormition/Assumption structural question — CLOSED 2026-09-12.** Built as a 3-row cluster (Coptic,
  Syriac, and COE Dormition identities), 2 label/tag fixes, and a new `august12` moveable-date
  engine anchor for the Armenian observance. All 11 resulting cases verified end-to-end. Ledger:
  "Dormition/Assumption cluster built."

**Genuinely still open — never resolved, not touched since first flagged:**
- Same-figure-different-day questions requiring an editorial call, not a mechanical fix: Seven Holy
  Youths of Ephesus (EOR Aug 4 vs. Coptic Misra 20), Prophet Micah (EOR Aug 14 vs. Coptic Misra 22),
  Prophet Malachias (EOR Jan 3 vs. Coptic Misra 30), Bessarion the Wonderworker (EOR Jun 6) vs.
  "Bessarion the Great" (Coptic Misra 25), Amos the Prophet (EOR+OOR Jun 15 vs. Coptic El-Nasi 5),
  Julietta (Coptic Misra 6) vs. `mar-cyriacus-and-julitta` (COE, Jul 15). Also still open from earlier
  in the sweep: Bartholomew's Coptic martyrdom date vs. his existing Western row; the Coptic Moses
  (Thout 8) vs. the EOR "Holy Prophet Moses" (Sep 4); a Hilarion date twelve days off the existing
  entry; St Anne's departure (Nov 20, a third Anne-related date); Clement of Rome's Coptic date
  (Dec 8); Gregory Thaumaturgus (Nov 30 vs. existing Nov 17 entry); the Holy Innocents' Coptic date
  (Jan 11); Anthony the Great's Coptic departure (Jan 30); Timothy the Apostle's Coptic martyrdom
  (Jan 31).
- **coptic.io connector**: last known status is broken (2026-09-11 — cycled through several
  correctly-diagnosed but unresolved fixes; Josh has a support reference code). Not rechecked since;
  do not re-diagnose without a new lead. All OOR-sweep additions from sessions where it was down
  remain ADDED, not CONFIRMED, pending a working session against it.
- Everything under the previous archived note that the 2026-09-07 rewrite didn't carry forward
  explicitly (Formation prose editor-name strip, Education-layer coverage extension, Royal Anthem
  sourcing, Cathedral/Monastic content axis — the control is live, only the content question is
  open, see `documentation/OPEN_ITEMS_FIXABILITY.md` — Coptic Prayer of the Veil, Horologion splash
  wiring, the Anglican Kalendar remainder via `synaxarium-review/`) — all still open, just not
  restated here in full; see `documentation/RESUME_NOTE_ARCHIVE_2026-09-07.md` for complete detail
  on each.

---

## 8. Settled -- do not reopen

- **Charter §11 is CLOSED.** All four traditions carry all three explanatory depths, no scaffolds.
- **Depth default:** depth 1 on, higher depths user-selectable. Already shipped.
- **Middle Friday = the Friday of the FOURTH week of the Great Fast.** Wired.
- **Fast Evening Service is built** and renders correctly.
- **Coptic disclosure:** every Coptic depth-3 statement is explicitly about monastic use.
- Sidebar headings are uniformly "Office Settings". All screens have a dark-mode toggle. The "I'm not
  sure" splash option routing to Anglican is intentional. In-office tradition selectors are
  forbidden.
- **Do not use git authorship as provenance evidence** in this repo -- Josh applies every change.
- **`synaxarium-review/` is a separate project from the EOR/OOR sanctoral work** -- see §2. Do not
  extend it, do not build a parallel tool for the gap sweep in §7 without asking first.
- **The EOR fifth pass (2026-09-07) fixed mismatches rather than leaving them flagged** -- Josh's
  explicit direction that session. If a future session finds an EOR/OOR row with a stored date that
  doesn't match its real one, the standing expectation is now to FIX it (direct move if the row's
  only tag, `traditionObservance` if shared), not just document the discrepancy for later.
- **The full OOR calendar-year sweep (Jan-Dec) is CLOSED** as of 2026-09-07 -- see §7 for the current
  confirmed count and what's still open within it.

---

## 9. Useful specifics

- Fresh clone: `git clone https://github.com/JWJeffery/PrayerAppNew.git`
- Explanations harness: `node scripts/explanations/verify_explanations.js` (needs
  `npm install jsdom --no-save`; remove `node_modules` and restore `package-lock.json` before
  committing).
- Integrity check worth running after any sequence edit: zero dangling component refs, all JSON
  valid, `node --check js/office-ui.js` and `node --check js/saints-resolver.js`.
- **Regression-testing `js/saints-resolver.js` changes**: it's a plain IIFE attaching
  `global.SaintsResolver`; `require` it directly in Node after setting `global.window = global` and
  stubbing whatever engine globals (`EthiopianCalendar`, `EastSyriacCalendar`, `ByzantinePaschalion`)
  the change touches. This is how the three new moveable-date rules in §7 were verified before being
  committed -- build a small test harness, run it against a range of years (especially edge-case
  years for any weekday-search logic), and compare with/without each optional engine loaded before
  trusting a change to code this central.
- The Fast Ramsha sequences use placeholders resolved in `js/office-ui.js` by substring match against
  the day's own ordinary ramsha sequence -- not a hardcoded map. An unresolvable marker fails loudly
  by design.
