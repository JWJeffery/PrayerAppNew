# The Universal Office — UI Redesign Handoff

**For:** an implementing agent working in `JWJeffery/PrayerAppNew` @ `main`
**Revision:** 2026-09-12, final. Merges the September design proposal, its own revision, and the
governance corrections. Supersedes both earlier versions.
**Screens:** `handoff/screens/*.png` — the visual reference, added separately (binaries are not
carried in the patch that introduced this file).

**Relationship to the two existing design documents, stated rather than assumed:**

- `documentation/universal-office-navigation-architecture.md` (2026-06-05, marked *canonical
  app-wide design direction*) is **upheld on navigation and contradicted on surface.** Its drawer
  rule — every office drawer in every mode headed "Office Settings", not open to local naming, with
  local language allowed for controls inside — is carried into §3.1 of this document verbatim in
  effect. But it also fixes the shared visual language as the parchment surface (its §1 and §45) and
  its own next steps propagate that shell further, to the Book of Needs and the Admin Dashboard.
  **Phase 6 of this document retires the parchment pass.** That is a direct conflict with a
  document marked canonical, and it is recorded here for deliberate resolution rather than
  overridden silently. It needs Josh's call before Phase 6 — not before Phase 1, which touches
  nothing.
- `documentation/universal-office-visual-design-refactor-brief.md` states the thesis this design
  serves — *beauty serves structure, structure governs beauty* — with the Bible Browser as its pilot.
  Nothing here contradicts it. This document is the office-shell application of that thesis; the
  Bible Browser and the Book of Needs remain on their own track.

Where a screen and this document disagree, **this document wins**; every such case is listed in §8
with its reason, so nothing is changed silently.

---

## 0. What this is

A redesign of the app *shell* — entry, office reading view, and settings. It changes no resolver,
calendar engine, corpus, or rubric. Every lane keeps its own resolver, calendar logic, rank logic,
vocabulary, and structure exactly as `documentation/UNIVERSAL_OFFICE_CORE_CONTRACT.md` requires.
What changes is how the resolved office is presented.

**The idea in one sentence:** one canon — *rail · page · margin* — used by every tradition, lit
differently by the hour being prayed, with everything that is not prayed aloud moved out of the
text column and into the margin.

The current UI has drifted into two competing systems: the original Gothic/Vespers theme (`:root`
in `css/office.css`) and a later parchment app-shell pass. Measured: 4,241 lines in
`css/office.css`, 496 `--app-*` hits, 306 `body.office-active` hits. The redesign resolves that in
favour of a single system.

**Why this design and not a prettier one.** The Core Contract already binds this project to three
rules — no flattening, no cross-tradition fill, borrowed material always attributed. Those rules
are true in the data and invisible on screen. Rail · page · margin exists to make them visible: the
rail shows each tradition's own structure in its own words, the page carries only what is prayed,
and the margin is where provenance, borrowing and honest gaps live where a person can see them. If
an implementation choice would hide any of the three, it is the wrong choice.

---

## 1. The three columns

| Region | Width | Contents |
|---|---|---|
| Rail | 236px | The office's ordered blocks, lane-native labels, current block lit |
| Page | fluid | The prayed text only — nothing else |
| Margin | 268px | Rubric, provenance, diagnostics, silence notes, depth control |

A 64px ordo line at top (app name · liturgical day · tradition/rite) and a 46px keeping-place bar at
the bottom.

**Rail.** 5px dim dot + 19px label for inactive; 9px gold dot with a soft glow + 17px `Cinzel` label
for the current block. Foot of the rail carries position only — "III of VIII". No time estimate: the
app cannot honestly say how long an office takes.

**Page.** Centred `Cinzel` 44px office title, uppercase, letterspaced 0.12em; italic 20px epigraph
beneath; `✦ ✦ ✦` ornament. Body is a two-column grid — a 70px right-aligned mono gutter label and the
text at 25px/1.72. Psalm half-verses indent 2.2em. Verse numbers are 13px gold superscripts. The
bottom of the page column fades to the ground so text dissolves rather than clipping.

**Margin.** At most **two** cards visible at once; additional ones collapse to a quiet line ("2 more
notes") that expands on click. The margin does not explain itself — the explanatory paragraph at the
head of the margin in screen 1a is removed. A margin that needs a caption has failed.

**Keeping-place bar.** One line of keyboard hints at left (`↑ ↓ move by block · space holds the
place`), and at right a single entry: **Office Settings**.

---

## 2. What the shell reads: the resolved-office envelope

The rail and margin need structure the UI does not currently receive. `js/office-ui.js` builds
`innerHTML` strings per lane (35 sites), so by the time content reaches the DOM there is no way to
ask "which block is this", "what is its native label", "is this an overlay", "is this a diagnostic".

So the render path must consume the resolved-office envelope specified in
`UNIVERSAL_OFFICE_CORE_CONTRACT.md` §4. **That envelope is a specification, not an implementation —
no lane emits it today.** Writing the first emitter is real work, not wiring.

| Envelope field | Contract § | UI |
|---|---|---|
| `tradition`, `officeFamily` | §5 | Right of the ordo line — e.g. `ANGLICAN · BCP 1979 · RITE II`. Framing and labelling only; never used to select behaviour |
| `context.calendarSummary` | §4 | Centre of the ordo line, verbatim. The shell does not parse season or rank out of it |
| `context.rankSummary` | §4 | Margin "Rank" card, in lanes that supply one. Absent in lanes that don't — no card, not an empty card |
| `blocks[].label` | §6 | Rail item text — verbatim, lane-native, never translated |
| `blocks[].role` | §7 | Generic render treatment only. The taxonomy is **closed by governance**: 13 roles, `creed` and `doxology` added by the 2026-09-04 amendment. The shell handles exactly these and `other`; it never invents a treatment for a role that does not exist, and a lane never overloads a role to smuggle in tradition-specific meaning |
| `blocks[].units[].citation` | §8 | The 70px mono gutter label, where the unit has one |
| `blocks[].units[].kind` | §8 | The gutter label where there is no citation — this is what `RUBRIC` and `ANTIPHON` in screen 1a actually are. `kind` describes the unit; `role` describes its structural position. Do not conflate them |
| `blocks[].units[].source` | §8 | Provenance. Shown in the margin when non-native |
| `overlays[]` | §9 | Margin card, red left-bar, "Overlay · borrowed" heading, real tradition named, anchor respected, never relabelled |
| `diagnostics[]` | §11 | Margin card, gold left-bar. **All three real codes**, each with its own wording |

**Diagnostics wording.** §11 defines three states, not one:

- `not-yet-mapped` → "No proper is appointed for this day in the corpus. Nothing has been substituted."
- `source-blocked` → "This exists in scope but cannot yet be shown. [recorded reason]"
- `coverage-gap` → "A known gap, stated rather than hidden."

An envelope with empty `blocks` and one diagnostic must render as a dignified page, not an error
(§4 rule 5). Silence, where a tradition's own structure means silence, is correct and is not a gap
at all (§11 rule 3) — the East Syriac lane already models this and the margin note on screen 2c is
right as drawn.

---

## 3. Governance the shell must not break

Settled decisions. Not design questions, not reopened here.

1. **Sidebar and drawer headings are uniformly "Office Settings."** Local language is permitted for
   control labels *inside*. The keeping-place bar entry reads **Office Settings**; "The Ordo" —
   a good phrase — becomes the heading of section I inside it, not the name of the drawer.
2. **Every screen carries a dark-mode toggle**, wired through the `data-app-dark-toggle` attribute
   selector, never a hardcoded id list. See §4 for how it reconciles with the two themes.
3. **In-office tradition selectors are forbidden.** Section III of the drawer offers rite, officiant
   and psalter — *local variation within a tradition* (§10), allowed. Changing tradition happens only
   by returning to the threshold.
4. **The "I'm not sure" entry option routes to Anglican, intentionally.** It survives the threshold
   redesign.
5. **Entry honours the stored profile.** `profile.entryPageDefault` is `ask` | `tradition` |
   `universal`, resolved through `resolveEntryTraditionRoute()`. The threshold is the **`ask`** state
   only. A user with a default tradition goes straight to it; a user who chose the Universal Office
   still gets it.
6. **The splash profile panel survives intact.** `#user-profile-defaults` carries five controls —
   entry default, tradition default, Book of Needs scope, ministry role, OOR sub-tradition — plus the
   ACOE/ACE sub-selector. None live in the four sidebars, so "every setting reachable in the old
   sidebars" does not cover them. Name them individually in the Phase 4 criteria.
7. **BCP Only Mode has a precise contract, fixed 2026-09-03 after a real content audit.** It hides
   `ecumenical-devotions-section` wholly and force-unchecks exactly seven named ecumenical toggles
   (`toggle-angelus`, `toggle-trisagion`, `toggle-east-syriac-hours`, `toggle-agpeya-opening`,
   `toggle-prayer-before-reading`, `toggle-examen`, `toggle-kyrie-pantocrator`) by hiding their own
   `<label>` rows — leaving every genuine BCP control visible and adjustable. An earlier build hid
   whole containers and took real BCP settings with them. Do not regress that. "Borrowed devotions"
   in the drawer and the margin's overlay cards read that same state: one thing shown twice, never
   two states.
8. **Anglican content is 1979 BCP only.** Not RCL, not ACNA 2019, not the 1928 BCP, not Satucket, not
   any other witness. LFF 2024 controls Anglican sanctoral dates.
9. **The Roman lane is the Breviary 1960/1962** (contract §12). The Liturgy of the Hours lane was
   abandoned on licensing. The threshold does not list "Roman · Liturgy of the Hours", and does not
   list the Roman lane at all until it lands.
10. **Explanatory depth is Charter §11 and it is CLOSED.** Three depths across all four traditions,
    depth 1 on by default, 2 and 3 user-selectable. It lives in the margin, next to the content it
    affects. It is *not* a "full / incipits only" control — see §8.3.

---

## 4. Light and dark

**A three-state control: Auto · Light · Dark.** Auto is the shipped default. Light and Dark persist
until changed. A two-state toggle cannot express "go back to following the hour" once touched, which
is the state most people will want back.

**Auto is keyed to the office, not the clock.** Morning Prayer and the Sixth Hour are day; Evening
Prayer, Compline, Vespers and Ramsha are night. Evening Prayer said at 5pm in June still renders
dark — the office is the thing being prayed, and Auto should be legible rather than clever. A
clock-keyed variant may exist later as an explicit setting; it is never the default.

The control appears on every screen (§3.2) through the `data-app-dark-toggle` attribute selector.

---

## 5. The threshold, the drawer, and the two other surfaces

### The threshold
Replaces the five-button mode grid, as the `ask` state of §3.5.

The app answers "what should I pray now" in one line — timestamp, "It is the hour of", the office
name at 88px, a one-sentence description. A primary **Begin**, a secondary **Another office**, and a
quiet third option **I'm not sure**, routing to Anglican (§3.4). The Book of Needs is reachable here
as a quiet secondary entry, never from inside an office.

**Resume** ("You left off at Psalm 4 last night") is deferred — it needs persisted position, which
does not exist. Until it does the line is absent, not plausible. **The hydration race**
(`admin.todos → hydration-race-condition`) surfaces here: "not ready" is a visible state. Never a
half-office.

**The list of traditions is cut.** In the mockup it renders as overlapping two-column text and is
the busiest element on an otherwise still screen. "Another office" already carries the function.

### Office Settings
430px. The current 300px checkbox sidebar, reorganised into the order a person actually asks.
Heading: **Office Settings** (§3.1).

- **I · The Ordo** — date stepper, liturgical day line, seasonal dot (§6).
- **II · Which office** — 2×2 grid of the day's hours.
- **III · How you keep it** — rite, officiant, psalter, then borrowed devotions with a count and a
  plain-language list. Lane-supplied. No tradition selector (§3.3).
- **BCP only** at the foot as a single toggle, §3.7 contract intact.

### The Book of Needs — out of scope
`#individual-prayers-section` stays on the old skin through Phase 6 and gets its own design pass
afterward. It is not an hour: no ordered blocks, no liturgical day, no rail to draw — forcing it into
rail · page · margin would misrepresent what it is. Keep it outside `body.shell-v2` entirely; its
dark toggle, tradition filtering and role gating continue unchanged.

### Universal Office mode
The same canon, one level up. **The rail becomes the lanes** rather than one office's blocks: it
lists the traditions praying this hour, current lane lit the same way a current block is. The page
shows the selected lane's office, rendered exactly as in 1a–2c. The margin carries the comparison —
what each lane appoints at this point, and where they diverge — which is the whole reason a person is
in Universal mode. Switching lanes in the rail changes the page; it never merges two lanes into one
page, and there is still no universal resolver behind it.

---

## 6. The seasonal dot

A single dot beside the day in the ordo line, never a wash over the page.

**Anglican: already built, read it.** `data/season/*.json` carries a populated `liturgicalColor`
field — 397 days across green, white, red, purple, rose and `none`. The shell reads that field. No
mapping needs building.

**One provenance note, for the corpus rather than the shell:** the 1979 BCP prescribes no liturgical
colours at all — zero occurrences of "color" or "colour" across the whole in-repo text. TEC colour
usage is customary, not rubrical. The existing field is therefore not BCP-sourced and wants a
`ruleSource` naming whatever witness it does rest on. That is a corpus task, not a blocker here.

**Eastern lanes emit their own traditional colours — as sourced content, with the same discipline as
any other content in this project.** This is not a shell task and must not be done from general
knowledge:

- **Byzantine** colour practice is customary and varies by jurisdiction (Russian, Greek and
  Antiochian usage differ). It needs a named witness for the jurisdiction this lane actually follows
  — the project's Slavic/OCA baseline.
- **Coptic** usage is thinner and less codified than the Western sequence; it needs its own witness.
- **East Syriac** has essentially no developed colour sequence. **No dot is the likely correct
  result**, and is honest silence (§11 rule 3), not a gap to be filled.

Until a lane supplies a sourced colour, that lane shows no dot. An invented colour is a fabrication
like any other, and it would be one placed in the ordo line — the most authoritative-looking strip on
the screen.

Palette, where a lane does supply one: green `#4a7c59`, red `#9b2335`, purple `#6b3070`, rose
`#a04060`, white `#c9a84c`.

---

## 7. Design tokens

Two themes only. Retire every `--app-*` parchment token and the `body.office-active` overrides.

```
NIGHT (Compline, Evening Prayer, Vespers, Ramsha)   DAY (Morning Prayer, Sixth Hour)
ground        #08070c / #0b0912                     ground        #f2ebdf / #f4ece0
ink           #e6dcc4                               ink           #2a2118 / #2b2118
ink-quiet     rgba(230,220,196,0.62)                ink-quiet     rgba(42,33,24,0.7)
gold          #c9a84c                               bronze        #8a6a24
rubric        #c0392b                               rubric        #8b1a10 / #9b2335
hairline      rgba(201,168,76,0.12)                 hairline      rgba(103,58,31,0.14)
```

**Type:** `Cinzel` for titles, rail-active labels, and small-caps UI; `Cormorant Garamond` for all
prayed text (25px/1.72 body, 26–27px for canticles and hymns); `IBM Plex Mono` 10–11px, letterspaced
0.12–0.2em, for gutter labels and machine facts only. `IM Fell English` is retired.

*New dependency, not currently loaded:* Cormorant Garamond and IBM Plex Mono. Both OFL, so no
licensing issue, but they are two additional render-blocking families — self-host and subset them
rather than pulling full families from a CDN.

**Rules:** no rounded cards, no drop shadows on the page, no borders around prayer. Hairlines and
light do the separating. Minimum body size 25px on the office page.

**Imagery.** All grounds sit under a heavy veil at 0.4–0.55 opacity as texture, never as wallpaper,
and text never sits on unveiled glass. Do not reuse the Western Gothic images (`canterbury`,
`chartres-rose`, `york-lancets`, `rood-screen`) behind Eastern lanes.

**Rublev's *Trinity* is not to be used.** An icon is a venerated object, not a texture; dimming one
to 0.4 and running prayer text across it is the wrong relationship to the image, and it puts a face
under body copy — bad typographically and worse theologically for the users most likely to recognise
it. Use ornament and manuscript instead: a Byzantine horologion or typikon leaf, headpiece ornament,
or architectural stonework. The Coptic liturgical codex leaf and the 18th-century East Syriac Thaksa
page are fine as proposed — manuscript pages, not images of persons.

---

## 8. Corrections to the September proposal, with reasons

Each changes something an earlier version or a screen specifies. None is a matter of taste.

1. **"R reads aloud" removed from the keeping-place bar.** There is no read-aloud feature. Do not
   advertise one in the chrome.
2. **"About 7 min remain" removed from the rail foot.** A guessed duration is a fabrication in the
   one place this design exists to prevent them. Cut rather than computed.
3. **"The existing display-depth control as 'full / incipits only'" does not exist and must not be
   built.** The Horologion's incipit state is a *coverage state* — full psalm text is deferred in
   `js/horologion-engine.js` and the incipit is emitted as a rubric. It is a `coverage-gap`
   diagnostic belonging in the margin, not a preference belonging in the drawer. Presenting a gap as
   a user choice is precisely what §11 forbids, and it would make the gap invisible by making it look
   chosen. The real depth control is Charter §11 (§3.10).
4. **Cathedral / Monastic is removed from the East Syriac margin (screen 2c) and stays hidden until
   the question is settled.** The control is live in code — `isEastSyriacCathedralMode()` has five
   call sites — but the *content axis* was deliberately deleted from `rubrics.json` because Maclean
   does not describe two parallel forms of each hour, and it remains an open research question. It
   does not appear in the new drawer either. The honest-silence note on that screen stays; it is
   right.
5. **"Roman · Liturgy of the Hours" removed from the threshold.** §3.9.
6. **The drawer is named "Office Settings", not "The Ordo Drawer".** §3.1.
7. **A three-state Auto/Light/Dark control is added to every screen.** §3.2, §4.
8. **"I'm not sure" restored to the threshold; entry-default routing honoured.** §3.4, §3.5.
9. **Phase 5 is repriced for Horologion.** `js/horologion-engine.js` already emits
   `{tradition, officeKey, date, title, status, sections, diagnostics}` and ships a validator that
   hard-requires those seven fields. Close to the contract envelope but not it — `sections` against
   `blocks`, no `overlays`, no `context`. Porting that lane is a reconciliation between two payload
   shapes, one validated in code, not "an emitter plus native labels". It goes last.
10. **Phase 4 acceptance criteria extended** to name the five splash profile controls and the
    ACOE/ACE sub-selector individually. §3.6.
11. **Margin limited to two visible cards**, and its self-explaining paragraph removed. §1.
12. **The threshold's tradition list is cut.** §5.
13. **Gutter label mapped to `kind` as well as `citation`.** §2.
14. **Resume-where-you-left-off deferred.** §5.
15. **Seasonal dot is lane-supplied and sourced, or absent.** §6.

---

## 9. Build plan

Each phase ships independently and is reversible. Do not start a phase before its predecessor's
acceptance criteria pass. Every commit follows the project's standing rules: patches via
`git format-patch`, `AUDIT_GOVERNANCE_LEDGER.md` / `audit-ledger.html` / `SEED_VERSION` updated in
the same commit, cache-bust `?v=NNN` bumped by hand for every touched JS file.

### Phase 1 — Flagged shell stylesheet
Add `css/office-shell.css`, loaded *after* `css/office.css`, scoped entirely under `body.shell-v2`.
Add a hidden dev toggle that sets the class. No existing rule is edited.
*Accept:* flag off → app byte-identical in behaviour; flag on → nothing crashes.

### Phase 2 — The three-column shell
Under `body.shell-v2`, replace `#main-content`'s centred `.office-container` with the rail/page/margin
grid and the two bars. Apply both themes, the type scale, and the Auto/Light/Dark control.
*Accept:* 1a and 1b reproducible at 1360×940; sidebar toggle still works; contrast ≥4.5:1 on every
text element including anything over imagery; the three-state control present, defaulting to Auto,
persisting a manual choice, and returnable to Auto on every screen.

### Phase 3 — Anglican lane emits the envelope
The **first** envelope emitter. Render `blocks[]` from it, replacing the string concatenation in
`renderOffice()` for that lane only. Build DOM nodes, not strings — this removes the XSS surface in
the same move (`admin.todos → innerHTML-architecture`). Other lanes stay on the legacy path.
*Accept:* Morning Prayer, Noonday, Evening Prayer and Compline render for at least a fortnight of
dates including Holy Cross Day and a Sunday, all from the 1979 BCP (§3.8); the Hudra Prayer for
Understanding appears as a marked overlay with East Syriac provenance, never as native Anglican
content; a deliberately unmapped proper renders a `not-yet-mapped` diagnostic rather than a
fabrication or a blank; all three diagnostic codes render with their own wording; the seasonal dot
reads the existing `liturgicalColor` field.

### Phase 4 — Threshold and Office Settings
Replace `#mode-selection` with the threshold, and the four sidebars (`#settings-panel`,
`#east-syriac-settings`, `#generic-settings`, `#coptic-settings`) with one drawer whose section III
is lane-supplied.
*Accept:* every setting reachable in the old sidebars is still reachable; the five
`#user-profile-defaults` controls and the ACOE/ACE sub-selector each individually reachable (§3.6);
`toggleBcpOnly()`'s exact contract holds, seven toggles and no more (§3.7); "I'm not sure" routes to
Anglican; all three `entryPageDefault` routes behave; a cold load with no persisted position shows no
resume line rather than a plausible one; the Book of Needs is reachable from the threshold and
unaffected by the flag.

### Phase 5 — Port the remaining lanes
One lane per PR: Coptic, East Syriac, Horologion (last, §8.9), then Roman when it lands. Eastern
seasonal colours are sourced per lane in this phase or deferred, per §6 — never invented.
*Accept per lane:* every block label is the tradition's own word; no role overloaded; gaps are
diagnostics; no lane invents a top-level role.

### Phase 6 — Delete the old skin
Remove the `--app-*` pass, the `body.office-active` overrides, `.office-container`'s frame and corner
ornaments, and the legacy render path. Unscope `office-shell.css` and drop the flag. The Book of
Needs keeps its own skin and gets its pass after this.
*Accept:* `css/office.css` no longer contains two competing systems; print output regenerated and
verified.

---

## 10. Hazards, specific to this repo

1. **The parchment pass will fight you** until Phase 6. Keep the new shell fully scoped under
   `body.shell-v2` and let the two coexist rather than interleaving edits.
2. **`.innerHTML` string building** is what Phase 3 replaces. 35 sites in `js/office-ui.js`.
3. **Hydration race.** "Not ready" is a visible state, shown at the threshold. Never a half-office.
4. **Print styles** (two `@media print` blocks) target the old structure. Rewrite for the grid in
   Phase 2 or printed offices regress silently. The page column prints; the rail does not.
   **Provenance prints:** overlay attribution and diagnostics render as footnotes beneath the page
   column — a printed office carrying a borrowed prayer with its attribution stripped breaks the
   governance rule on paper, where it cannot be recovered. Rubrics stay inline where they already
   are. Everything else in the margin — depth control, rank summary, UI affordances — does not print.
5. **Mobile.** The `@media (max-width: 768px)` block encodes hard-won stacking behaviour including
   the Horologion repair. Under the new shell: **rail collapses to a top strip**, margin moves inline
   beneath its block, page stays full width. Rewrite deliberately; do not port the old rules. If the
   strip proves hard to reach one-handed at Compline, a bottom sheet is the fallback — but try the
   strip first, it is closer to the desktop canon.
6. **Duplicate ids in `data/saints/sanctoral.json`.** 44 remain. Any shell code keying a
   commemoration on `id` alone will collide. Key on `(id, month, day)`.

---

## 11. What must not change

- No universal resolver. Ever. The shell reads the envelope and nothing behind it.
- No flattening: a Marmitha is not a Kathisma is not the Twelve Psalms, even though all three occupy
  the same rail slot with `role: psalmody`.
- No cross-tradition fill. A gap is a diagnostic. Silence, where a tradition's own structure means
  silence, is correct and is not an error.
- Borrowed material is always marked, always attributed to its real tradition, never relabelled.
- Nothing on screen may be invented to look complete — not a duration, not a colour, not a resume
  position, not a setting standing in for a gap.
