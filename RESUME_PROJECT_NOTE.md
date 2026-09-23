# RESUME_PROJECT_NOTE.md

**Paste this at the start of a new conversation.** It is a handoff document, not a history. The
permanent record of every decision lives in `AUDIT_GOVERNANCE_LEDGER.md`; the classification of what
blocks each open item lives in `documentation/OPEN_ITEMS_FIXABILITY.md`. **Where this note and the
repo disagree, the repo wins** — it may have moved since this was written.

**FIRST MOVE, EVERY SESSION, NO EXCEPTIONS.** `git clone` fresh, then `git log --oneline -10` and
check `SEED_VERSION` in `audit-ledger.html`. Josh runs at least two Claude accounts against this repo
concurrently, so never trust this note's HEAD, SEED_VERSION or "what's open" at face value. Cache-bust
params likewise: read them out of `index.html` rather than trusting a number written here.

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

| Phase | State |
|---|---|
| 1 — flagged stylesheet + dev toggle | **done** (`?shell=v2` on, `?shell=v1` off, sticky per browser) |
| 2 — three-column shell, both themes, Auto/Light/Dark | **done and confirmed in the browser** |
| 3 — Anglican lane emits the envelope | **done and confirmed in the browser (2026-09-20)** — see below |
| 4 — threshold and Office Settings | **in progress** — threshold rebuilt in the correct place (`#mode-selection`) matching the real design source; ask-state `#tradition-entry` reverted untouched; all four drawers regrouped I/II/III; consolidation and the other 3 lanes' threshold text still open, see §0 item 2 |
| 5 — the other three lanes | not started |
| 6 — delete the old skin | **partly brought forward**, see the demolition note below |

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

**TWO OPEN QUESTIONS FOR JOSH, NOT DECIDED:**
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

**THREE ROWS LEFT UNMARKED, NEEDING A DECISION:** `saint-abraham-of-carrhae`,
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
