# The Universal Office — UI Redesign Handoff

**For:** an implementing agent (Claude Code) working in `JWJeffery/PrayerAppNew` @ `main`
**From:** design proposal, September 2026
**Screens:** `handoff/screens/*.png` — attach these alongside this document.

---

## 0. What this is

A redesign of the app *shell* — entry, office reading view, and settings. It does **not** change
any resolver, calendar engine, corpus, or rubric. Every lane keeps its own resolver, calendar
logic, rank logic, vocabulary, and structure exactly as `documentation/UNIVERSAL_OFFICE_CORE_CONTRACT.md`
requires. What changes is how the resolved office is presented.

**The idea in one sentence:** one canon — *rail · page · margin* — used by every tradition, lit
differently by the hour being prayed, with everything that is not prayed aloud moved out of the
text column and into the margin.

The current UI has drifted into two competing systems: the original Gothic/Vespers theme
(`:root` in `css/office.css`) and a later "parchment app shell propagation pass" that wraps prayer
in 26px rounded cards with Georgia type. The redesign resolves that in favour of a single system.

---

## 1. Screens

### 1a — Compline, after dark (`screens/1a-compline.png`)
The reference implementation of the reading view. Three columns:

| Region | Width | Contents |
|---|---|---|
| Rail | 236px | The office's ordered blocks, lane-native labels, current block lit |
| Page | fluid | The prayed text only — nothing else |
| Margin | 268px | Rubrics, overlays with provenance, diagnostics, silence notes |

Plus a 64px ordo line at top (app name · liturgical day · tradition/rite) and a 58px keeping-place
bar at the bottom (keyboard hints left; "The Ordo" and "Settings" entries right).

Rail items: 5px dim dot + 19px label for inactive; 9px gold dot with a soft glow + 17px Cinzel
label for the current block. Foot of the rail carries position ("III of VIII") and time remaining.

Page: centred `Cinzel` 44px office title, uppercase, letterspaced 0.12em; italic 20px epigraph
beneath; `✦ ✦ ✦` ornament. Body is a 2-column grid — a 70px right-aligned mono gutter label
(`PSALM 4`, `RUBRIC`, `ANTIPHON`) and the text at 25px/1.72. Psalm half-verses indent 2.2em.
Verse numbers are 13px gold superscripts.

Bottom of the page column carries a fade to the ground so text dissolves rather than clipping.

### 1b — Morning Prayer, basilica light (`screens/1b-morning-prayer.png`)
Identical skeleton, light theme. A stained-glass clerestory band sits *below* the 64px header
under a heavy veil (this matters — text must never sit on the glass). Adds a skewed light shaft,
a `Cinzel` drop cap on the lesson, and justified reading text with 1.8em paragraph indents.

### 1c — The threshold and the ordo drawer (`screens/1c-threshold-ordo-drawer.png`)
Replaces the five-button mode grid.

**Threshold (left):** the app answers "what should I pray now" in one line — timestamp, "It is the
hour of", the office name at 88px, and a resume line ("You left off at Psalm 4 last night"). A
primary *Begin* and a secondary *Another office*. Beneath, a quiet single-line list of the
traditions being prayed tonight: Anglican · BCP; Roman · Liturgy of the Hours; Russian / Slavic ·
Horologion; Coptic · Agpeya; East Syriac · Hudra.

**Ordo drawer (right, 430px):** the current 300px checkbox sidebar, reorganised into the order a
person actually asks: **I. Which day** (date stepper + liturgical day line), **II. Which office**
(2×2 grid of the day's hours), **III. How you keep it** (rite, officiant, psalter, then borrowed
devotions with a count and a plain-language list). "BCP only" sits at the foot as a single toggle.

### 2a / 2b / 2c — the canon across lanes
`screens/2a-coptic-agpeya-sixth-hour.png`, `2b-byzantine-vespers.png`, `2c-hudra-ramsha.png`.

Same three columns, same metrics, three different lights and three different vocabularies:

- **Coptic Agpeya, Sixth Hour** — noon white. Rail: The Introduction · The Twelve Psalms · The
  Gospel · The Litanies · Kyrie eleison ×41 · The Absolution · Conclusion. The ×41 is a real UI
  moment: a typographic block with a counter, not a numbered list. Red is what you do, black is
  what you say.
- **Russian / Slavic Horologion, Vespers** — violet dusk. Rail: Proemial Psalm 103 · Great Litany ·
  Kathisma · Lord, I Have Cried · Phos Hilaron · Prokeimenon · Aposticha · Nunc dimittis · Troparia
  & Dismissal. The margin carries *rank arbitration* ("Menaion ranks above the weekday; Octoechos
  stichera reduced from six to three") and the existing display-depth control as "full / incipits only".
- **East Syriac Hudra, Ramsha** — lamp bronze. Rail: Qanona d-Ramsha · Marmitha · Onitha d-Ramsha ·
  Lakhu Mara · Trisagion · Qale d-Shahra · Karozutha · Huttama. The margin carries use
  (Cathedral / Monastic) and the honest-silence note: no commemoration falls today, nothing shown,
  nothing invented.

---

## 2. Design tokens

Two themes only. Retire every `--app-*` parchment token and the `body.office-active` overrides
that go with them.

```
NIGHT (Compline, Vespers, Ramsha)        DAY (Morning Prayer, Sixth Hour)
ground        #08070c / #0b0912          ground        #f2ebdf / #f4ece0
ink           #e6dcc4                    ink           #2a2118 / #2b2118
ink-quiet     rgba(230,220,196,0.62)     ink-quiet     rgba(42,33,24,0.7)
gold          #c9a84c                    bronze        #8a6a24
rubric        #c0392b                    rubric        #8b1a10 / #9b2335
hairline      rgba(201,168,76,0.12)      hairline      rgba(103,58,31,0.14)
```

Seasonal colour stays a single dot beside the day in the ordo line — green `#4a7c59`,
red `#9b2335`, purple `#6b3070`, rose `#a04060`, white `#c9a84c` — not a wash over the page.

**Type:** `Cinzel` for titles, rail-active labels, and small-caps UI; `Cormorant Garamond` for all
prayed text (25px/1.72 body, 26–27px for canticles and hymns); `IBM Plex Mono` 10–11px,
letterspaced 0.12–0.2em, for gutter labels and machine facts only. `IM Fell English` is retired —
Cormorant holds the manuscript feeling at screen sizes without the legibility cost.

**Rules:** no rounded cards, no drop shadows on the page, no borders around prayer. Hairlines and
light do the separating. Minimum body size 25px on the office page.

---

## 3. The one real dependency

The rail and the margin need structure the UI does not currently receive. `js/office-ui.js` builds
`innerHTML` strings per lane, so by the time content reaches the DOM there is no way to ask "which
block is this", "what is its native label", "is this an overlay", "is this a diagnostic".

So the render path must consume the **resolved-office envelope** already specified in
`documentation/UNIVERSAL_OFFICE_CORE_CONTRACT.md` §4. Mapping:

| Envelope field | UI |
|---|---|
| `blocks[].label` | Rail item text — verbatim, lane-native, never translated |
| `blocks[].role` | Generic render treatment (psalmody indents, reading justification, rubric styling) |
| `blocks[].units[].citation` | The 70px mono gutter label beside the text |
| `blocks[].units[].source` | Provenance, shown in the margin when non-native |
| `overlays[]` | Margin card, red left-bar, "Overlay · borrowed" heading, real tradition named, anchor respected |
| `diagnostics[]` | Margin card, gold left-bar, honest wording (`not-yet-mapped` → "Nothing has been substituted") |
| `context.calendarSummary` | The ordo line, verbatim |
| `context.rankSummary` | Margin "Rank" card in lanes that have one |

An envelope with empty `blocks` and one diagnostic must render as a dignified page, not an error.

---

## 4. Build plan

Each phase ships independently and is reversible. Do not start a phase before its predecessor's
acceptance criteria pass.

### Phase 1 — Flagged shell stylesheet
Add `css/office-shell.css`, loaded *after* `css/office.css`, scoped entirely under `body.shell-v2`.
Add a hidden dev toggle that sets the class. No existing rule is edited yet.
*Accept:* flag off → app is byte-identical in behaviour; flag on → nothing crashes.

### Phase 2 — The three-column shell
Under `body.shell-v2`, replace `#main-content`'s centred `.office-container` with the
rail/page/margin grid and the top and bottom bars. Apply the two themes and the type scale.
Rail is populated with placeholder items; margin is empty.
*Accept:* 1a and 1b are reproducible at 1360×940; sidebar toggle still works; contrast ≥4.5:1 on
every text element including anything over imagery.

### Phase 3 — Anglican lane emits the envelope
Give the Anglican lane an envelope emitter and render `blocks[]` from it, replacing the string
concatenation in `renderOffice()` for that lane only. Other lanes continue down the legacy path.
Rail, gutter labels, margin overlays and diagnostics all light up from real data.
*Accept:* Morning Prayer, Noonday, Evening Prayer and Compline render for at least a fortnight of
dates including Holy Cross Day and a Sunday; the Hudra Prayer for Understanding appears as a marked
overlay with East Syriac provenance, never as native Anglican content; a deliberately unmapped
proper renders a diagnostic rather than a fabrication or a blank.

### Phase 4 — Threshold and ordo drawer
Replace `#mode-selection` with the threshold, and the four parallel sidebars
(`#settings-panel`, `#east-syriac-settings`, `#generic-settings`, `#coptic-settings`) with one
drawer whose section III is lane-supplied. Keep `toggleBcpOnly()`'s contract intact.
*Accept:* every setting reachable in the old sidebars is still reachable; BCP-only still
force-unchecks its seven toggles; resume-where-you-left-off works from a cold load.

### Phase 5 — Port the remaining lanes
One lane per PR: Coptic, Horologion, East Syriac, then Roman when it lands. Each is an envelope
emitter plus native labels — no UI work.
*Accept per lane:* every block label is the tradition's own word; no block role is overloaded to
smuggle in tradition-specific meaning; gaps are diagnostics.

### Phase 6 — Delete the old skin
Remove the `--app-*` parchment pass, the `body.office-active` overrides, `.office-container`'s
frame and corner ornaments, and the legacy render path. Unscope `office-shell.css` and drop the flag.
*Accept:* `css/office.css` no longer contains two competing systems; print output is regenerated
and verified.

---

## 5. Hazards, specific to this repo

1. **The parchment pass will fight you** until Phase 6 — it restyles `.office-container`,
   `#main-content`, every sidebar, and the splash under `body.office-active`. Keep the new shell
   fully scoped under `body.shell-v2` and let the two coexist rather than interleaving edits.
2. **`.innerHTML` string building** (tracked as `admin.todos → innerHTML-architecture`) is the thing
   Phase 3 actually replaces. Build DOM nodes, not strings — it removes the XSS surface in the same move.
3. **Hydration race** (`admin.todos → hydration-race-condition`): "not ready" is a visible state.
   The threshold screen is the natural place to show it honestly — do not let it render a half-office.
4. **Print styles** in `css/office.css` target the old structure. They must be rewritten for the grid
   in Phase 2, or printed offices regress silently. Rail and margin should not print; the page column should.
5. **Mobile.** The `@media (max-width: 768px)` block encodes a lot of hard-won stacking behaviour,
   including the Horologion repair. Under the new shell: rail collapses to a top strip, margin moves
   inline beneath its block, page stays full width. Rewrite it deliberately; do not port the old rules.
6. **Imagery.** Do not reuse the Western Gothic images (`canterbury`, `chartres-rose`, `york-lancets`,
   `rood-screen`) behind Eastern lanes. Lane-appropriate public-domain grounds are already selected:
   a Coptic liturgical codex leaf, Rublev's *Trinity*, and an 18th-century East Syriac Thaksa page.
   All three sit under a heavy veil at 0.4–0.55 opacity as texture, never as wallpaper.

---

## 6. What must not change

- No universal resolver. Ever. The shell reads the envelope and nothing behind it.
- No flattening: a Marmitha is not a Kathisma is not the Twelve Psalms, even though all three
  occupy the same rail slot with `role: psalmody`.
- No cross-tradition fill. A gap is a diagnostic. Silence, where a tradition's own structure means
  silence, is correct and is not an error.
- Borrowed material is always marked, always attributed to its real tradition, never relabelled.

The design exists to make those three rules *visible* to the person praying. If an implementation
choice would hide them, it is the wrong choice.
