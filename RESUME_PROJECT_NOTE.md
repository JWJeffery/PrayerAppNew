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

**PARTIALLY DONE, LIVE-CONFIRMED, 2026-09-24 (latest): per-lane veiled ground imagery built —
Anglican done, Coptic/East Syriac/Byzantine blocked on real images, not guessed at.** This is the
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

**Anglican (ANG) is the only lane wired with a real image** — the two already in this repo,
already established elsewhere in this exact app (`rood-screen.png` for `#uo-threshold`'s own
"night-prayer aesthetic"; `chartres-rose.png` behind the entry screen). Night offices get the
rood-screen archway; day offices (`body.uo-day`) get the Chartres rose window, matching HANDOFF.md
1b's own description of a stained-glass band for Morning Prayer. **One real tuning bug caught live,
not shipped blind**: the rose window at the same blur/opacity as the rood-screen read as wallpaper,
not texture — exactly what the source document warns against — because it is a much busier, more
saturated image. Given its own heavier blur (9px vs 3px) and lower opacity (0.22 vs 0.48),
confirmed by screenshot before shipping.

**Coptic (OOR) and East Syriac (COE) have NO image — confirmed as flat `--uo-ground`, not a broken
image or a placeholder.** Blocked on a real constraint, disclosed rather than worked around:
this sandbox's network egress proxy returns 403 for `commons.wikimedia.org` AND
`upload.wikimedia.org` (checked both directly, WebFetch and raw `curl`), so no real, licence-
verifiable public-domain image could be sourced this session for either lane — and HANDOFF.md's
own rule ("do not reuse the Western Gothic images... behind Eastern lanes") explicitly forbids
covering the gap with what's already on hand. **Needs one of two things from Josh**: widen this
session's network access to reach an image source (Wikimedia Commons was the obvious candidate —
`Liturgical codex Louvre E10094.jpg` looked like a real, well-licensed candidate for the Coptic
leaf before the block was hit), or supply the images directly, the same way he's supplied primary
source text pages before. Byzantine (`EOR`/Horologion) has no lane built yet at all (Phase 5 lane
3) so is correctly out of scope for this pass, but the SAME blocker will apply when that lane is
built — HANDOFF.md's corrected guidance (`UI_REDESIGN_HANDOFF.md`, not the original proposal)
explicitly vetoes Rublev's *Trinity* for this slot and calls for "a Byzantine horologion or
typikon leaf, headpiece ornament, or architectural stonework" instead.

**Verified live**: screenshots of Anglican night (Compline/Evening Prayer) and day (Morning
Prayer), confirming the veil is genuinely subtle and text stays fully legible in both; Coptic
confirmed flat with zero console errors and zero broken-image artifacts; `?shell=v1`/no-flag
confirmed completely unaffected (`data-uo-tradition` is never set — `applyTraditionGround()` is
only called from `watchEnvelope()`, itself gated on `shellOn()`). Cache-bust `office-shell.css`
300 → 301, `office-shell.js` 295 → 296. Full detail: `AUDIT_GOVERNANCE_LEDGER.md`, key
`ui:per-lane-ground-imagery`.

**Phase 5 (Horologion, lane 3 of 3) is still next once Coptic/East Syriac imagery is unblocked or
explicitly deferred by Josh** — see the "What that leaves" paragraph further below.

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

**What that leaves, concretely, for the next session — Phase 5, lane 3 of 3, Horologion, last per
§9's own ordering (§8.9 repriced it as a payload reconciliation rather than a fresh emitter):**
- Horologion is next (`ui:phase5-horologion-lane-envelope-and-day-line`) -- includes building the
  still-missing lane-native day-summary line for the drawer, real content/engine work belonging to
  this lane's own Phase 5 slice, not a drawer fix.
- Eastern seasonal-colour sourcing (§6) — Byzantine and Coptic each need a named jurisdiction-
  specific witness; East Syriac's likely "no dot" needs a deliberate recorded decision, not silent
  omission. A corpus task, not shell work, and must not be done from general knowledge per §6's own
  warning.
- Phase 6 (deleting the old skin app-wide, plus the Book of Needs' own design pass after) is
  untouched and correctly blocked on Phase 5 finishing first, per the build order in §9. The
  navigation-architecture governance conflict that used to sit in front of Phase 6 is already
  resolved (Josh's 2026-09-21 ruling) — nothing else is blocking it once Phase 5 closes.

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
