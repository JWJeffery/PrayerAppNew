# OFFICE-UI.JS — PRODUCTION DOCUMENTATION

## Overview

`office-ui.js` is the core application logic module for **The Universal Office**. It handles all UI state, settings persistence, office rendering, and DOM assembly. All calendar logic, lectionary resolution, and scripture fetching have been extracted into separate modules.

**Production Status:** ✅ OPERATIONAL  
**Last Updated:** February 22, 2026  
**Architecture Role:** UI and rendering layer — no calendar or scripture logic  
**Dependencies:** `js/calendar-engine.js`, `js/scripture-resolver.js`, `data/rubrics.json`, `components/*.json`  
**Global Exposure:** All functions are global (no class or module wrapper)

---

## Module Architecture

```
office-ui.js
├── State variables         (appData, currentDate, selectedMode)
├── Constants               (monthNames, psalterCycle)
├── init()                  Bootstraps app: loads shards + rubrics, calls CalendarEngine
├── selectMode()            Switches between Daily Office and Individual Prayers views
├── Date controls           changeDate(), resetDate(), setCustomDate(), updateDatePicker()
├── Sidebar                 toggleSidebar(), updateSidebarForOffice()
├── BCP Only Mode           toggleBcpOnly()
├── Appearance              updateUI()
├── Settings persistence    saveSettings(), loadSettings()
├── Text formatters         formatScriptureAsFlow(), formatPsalmAsPoetry()
├── Helpers                 resolveText(), applyParagraphBreaks()
├── renderOffice()          Core async renderer — assembles full office HTML
└── backToSplash()          Navigation back to mode selection
```

---

## Data Loading (`init()`)

### Component Shards

Components are loaded from five shard files in `components/`. Each shard is fetched independently, parsed, and concatenated into `appData.components`:

```javascript
const shards = ['common', 'anglican', 'coptic', 'ecumenical', 'ethiopian'];
for (const shard of shards) {
    const res = await fetch(`components/${shard}.json`);
    // ...safe parse with try/catch and empty-file guard...
    appData.components = appData.components.concat(shardData);
}
```

**Shard load order and counts (as of February 2026):**

| Shard | Path | Components | Notes |
|---|---|---|---|
| `common` | `components/common.json` | 5 | Creeds, Lord's Prayer, Kyrie, Gloria Patri |
| `anglican` | `components/anglican.json` | 179 | All BCP components — collects, canticles, absolutions, etc. |
| `coptic` | `components/coptic.json` | 2 | Agpeya Opening, Theotokion |
| `ecumenical` | `components/ecumenical.json` | 9 | Angelus, Trisagion, Examen, etc. |
| `ethiopian` | `components/ethiopian.json` | 0 | Reserved — file exists but is currently empty |
| **Total** | | **195** | |

**Empty file handling:** `ethiopian.json` returns HTTP 200 but contains no data. The loader fetches as text first, checks `text.trim()`, and skips gracefully if empty. This prevents the `SyntaxError: Unexpected end of JSON input` that would otherwise crash `init()`.

> ⚠️ `data/components.json` is a **stale pre-modularization monolith** (195 entries, incomplete). Do not load from this path. The live data is exclusively in `components/*.json`.

### Rubrics

```javascript
const rubricsRes = await fetch('data/rubrics.json');
appData.rubrics = await rubricsRes.json();
```

`data/rubrics.json` contains four office definitions (`morning-office`, `evening-office`, `noonday-office`, `compline-office`), each with a `sequence` array that drives `renderOffice()`.

---

## Global State

| Variable | Type | Purpose |
|---|---|---|
| `appData` | Object/null | `{ components: [], rubrics: [] }` — populated by `init()` |
| `currentDate` | Date | The date currently being rendered |
| `selectedMode` | String/null | `'daily'` or `'prayers'` |
| `monthNames` | Array | Month name strings for saints file path construction |
| `psalterCycle` | Array | 31-entry BCP 30-Day Psalter (BCP 1979, p. 935) |

---

## Function Reference

### `init()` — async
Bootstraps the application. Fetches `data/rubrics.json`, then all five component shards from `components/`, then calls `CalendarEngine.init()`, `CalendarEngine.fetchLectionaryData()`, and `renderOffice()`.

Called by `selectMode('daily')` only if `appData` is not yet populated.

### `selectMode(mode)` — sync
Accepts `'daily'` or `'prayers'`. Controls which HTML section is visible and calls `init()` if components haven't been loaded yet.

### `renderOffice()` — async
**The core rendering function.** Assembles complete office HTML and writes it to `#office-display`. Called on every date or settings change.

**Execution flow:**
1. Guard: return early with loading message if `appData` not populated
2. Read all settings from DOM (rite, minister, creed, office, toggles)
3. Call `CalendarEngine.getSeasonAndFile(currentDate)` → `{ season, liturgicalColor, litYear }`
4. Call `CalendarEngine.fetchLectionaryData(currentDate)` → `dailyData`
5. Update `#calendar-info` and `#display-date`
6. Update seasonal accent via `updateSeasonalTheme(liturgicalColor)`
7. Determine psalm source (30-day psalter or lectionary)
8. Look up Marian components if enabled
9. Resolve reading chains for MP and EP independently
10. Render pre-sequence ecumenical devotions (Agpeya, East Syriac, Marian-before)
11. Walk `activeRubric.sequence` — for each item, resolve slots then dispatch to handler
12. Render post-sequence Marian element if position = `after`
13. Write assembled HTML to `#office-display`
14. Load and display saints/commemorations for current date

### `changeDate(days)` / `resetDate()` / `setCustomDate(dateStr)` — sync
Date navigation. All update `currentDate` and call `renderOffice()`.

### `updateDatePicker()` — sync
Syncs the `#date-picker` input value to `currentDate` using zero-padded YYYY-MM-DD format.

### `toggleSidebar()` — sync
Toggles `sidebar-hidden` class on `#settings-panel`, `#sidebar-toggle`, and `#main-content`. Adjusts toggle opacity.

### `updateSidebarForOffice()` — sync
Shows/hides sidebar toggles based on which office is selected. Called when office radio buttons change. Hides irrelevant options (e.g., Examen outside Compline, Suffrages outside MP/EP) and force-unchecks hidden toggles.

### `toggleBcpOnly()` — sync
Enables/disables BCP Only Mode. When enabled: applies `bcp-only-hidden` CSS class to `#ecumenical-devotions-section`, `#during-office-section`, `#closing-devotions-section` and force-unchecks all ecumenical toggles. Calls `renderOffice()`.

> **Adding new ecumenical toggles:** Add the toggle ID to the force-uncheck array inside `toggleBcpOnly()`. Add the section ID to both the sections array and the CSS `.bcp-only-hidden` multi-selector.

### `updateUI()` — sync
Applies or removes `dark-mode` / `light-mode` class from `document.body`.

### `updateSeasonalTheme(color)` — sync
Updates `--accent` CSS custom property:

| Value | Hex | Season |
|---|---|---|
| `purple` | `#6b3070` | Advent, Lent |
| `rose` | `#a04060` | Gaudete, Laetare |
| `white` | `#c9a84c` | Christmas, Epiphany, feasts |
| `red` | `#9b2335` | Pentecost, martyrs, Holy Week |
| `green` | `#4a7c59` | Ordinary Time (default) |

### `saveSettings()` / `loadSettings()` — sync
Persist and restore all settings to/from `localStorage` under key `universalOfficeSettings`. Both functions fail silently with `console.warn` if localStorage is unavailable.

### `formatScriptureAsFlow(rawText)` — sync
Strips verse numbers, splits on double newlines, wraps paragraphs in `<p>` tags. Used for prose readings (OT, Epistle, Gospel).

### `formatPsalmAsPoetry(rawText)` — sync
Strips verse numbers, splits on `*` to produce half-verse spans. Returns `<span class="psalm-stanza">` structure for CSS poetry layout.

### `resolveText(comp, rite)` — sync
Helper: extracts rite-aware text from a component. Returns `comp.text[rite]`, falling back to `rite2`, then `rite1`, then the raw string if `text` is not an object.

### `applyParagraphBreaks(text)` — sync
Helper: converts `\n\n` to `<br><br>` for block text that needs paragraph breaks (Examen, Theotokion). Used with `white-space:normal` container divs.

### `backToSplash()` — sync
Hides all office sections, restores splash screen and mode selector.

---

## Persisted Settings

`localStorage` key: `universalOfficeSettings`

| Key | Default | Values |
|---|---|---|
| `darkMode` | `false` | boolean |
| `bcpOnly` | `false` | boolean |
| `officeTime` | `'morning-office'` | `morning-office` / `evening-office` / `noonday-office` / `compline-office` |
| `rite` | `'rite2'` | `rite1` / `rite2` |
| `minister` | `'lay'` | `lay` / `priest` |
| `marianElement` | `'none'` | `none` / `antiphon` / `theotokion` / `both` |
| `marianPos` | `'before'` | `before` / `after` |
| `gloriaPatri` | `false` | boolean |
| `angelus` | `false` | boolean |
| `trisagion` | `false` | boolean |
| `eastSyriacHours` | `false` | boolean |
| `agpeyaOpening` | `false` | boolean |
| `creedType` | `'comm-creed-apostles'` | component ID |
| `gospelPlacement` | `'evening'` | `morning` / `evening` / `both` |
| `litany` | `false` | boolean |
| `suffrages` | `false` | boolean |
| `psalter30Day` | `false` | boolean |
| `generalThanksgiving` | `false` | boolean |
| `chrysostom` | `false` | boolean |
| `prayerBeforeReading` | `false` | boolean |
| `examen` | `false` | boolean |
| `kyriePantocrator` | `false` | boolean |

> **Creed ID note:** `creedType` stores a component ID. The correct values are `comm-creed-apostles` and `comm-creed-nicene` (from `components/common.json`). The stale IDs `bcp-creed-apostles` / `bcp-creed-nicene` exist only in the obsolete `data/components.json` monolith — do not use them.

---

## Rubric Sequence Resolution

`renderOffice()` walks `activeRubric.sequence` — an ordered array of strings from `data/rubrics.json`. Each item is either a `VARIABLE_` token, a slot placeholder, or a direct component ID.

### Full Sequences by Office

**Morning Prayer:**
`VARIABLE_OPENING` → `bcp-confession-[rite]` → `bcp-absolution-slot` → `bcp-invitatory-full` → `VARIABLE_ANTIPHON` → `VARIABLE_PSALM` → `VARIABLE_READING_OT` → `VARIABLE_CANTICLE1` → `VARIABLE_READING_EPISTLE` → `VARIABLE_CANTICLE2` → `VARIABLE_READING_GOSPEL` → `comm-creed-slot` → `bcp-salutation` → `comm-lords-prayer` → `bcp-suffrages-slot` → `VARIABLE_COLLECT` → `VARIABLE_WEEKDAY_COLLECT` → `VARIABLE_MISSION_PRAYER` → `bcp-litany` → `bcp-general-thanksgiving` → `bcp-chrysostom` → `bcp-closing`

**Evening Prayer:** Same as Morning Prayer with `bcp-phos-hilaron` inserted after `bcp-invitatory-full`.

**Noonday Prayer:** `bcp-invitatory-full` → `VARIABLE_PSALM` → `VARIABLE_READING_OT` → `comm-kyrie` → `comm-lords-prayer` → `VARIABLE_COLLECT` → `bcp-closing`

**Compline:** `bcp-opening-blessing` → `bcp-confession-[rite]` → `bcp-absolution-slot` → `bcp-invitatory-full` → `VARIABLE_PSALM` → `VARIABLE_READING_OT` → `bcp-versicles-before-prayers` → `comm-kyrie` → `comm-lords-prayer` → `VARIABLE_COLLECT` → `bcp-nunc-dimittis` → `bcp-closing`

### Slot Placeholders

Resolved before entering the handler dispatch:

| Sequence Item | Resolution | Notes |
|---|---|---|
| `bcp-confession-[rite]` | `bcp-confession-rite1` or `bcp-confession-rite2` | `[rite]` interpolation via `.replace('[rite]', rite)` |
| `bcp-absolution-slot` | `bcp-absolution-r1-priest`, `bcp-absolution-r2-lay`, etc. | Uses `ritePrefix` (`r1`/`r2`) + minister — separate from `[rite]` |
| `comm-creed-slot` | `comm-creed-apostles` or `comm-creed-nicene` | Reads from `creedSelection` DOM value |
| `bcp-suffrages-slot` | `bcp-suffrages-rite1` or `bcp-suffrages-rite2` | Skipped entirely (`continue`) if toggle is off |
| `bcp-litany` | `bcp-litany` (direct ID) | Skipped entirely if `greatLitanyChecked` is false |

> **Slot naming note:** The creed slot in the rubric sequence is `comm-creed-slot` (not `bcp-creed-slot`). The `[rite]` interpolation for confessions produces `bcp-confession-rite1`/`bcp-confession-rite2` — these are the IDs in the data. The ritePrefix `r1`/`r2` is used exclusively for absolutions and must not be confused with the `rite1`/`rite2` suffix pattern.

### VARIABLE_ Token Handlers

Each `VARIABLE_` token has a dedicated `if`-block in the loop that ends with `continue`:

| Token | Handler Logic |
|---|---|
| `VARIABLE_OPENING` | Looks up `bcp-opening-{season}`, falls back to `bcp-opening-general` |
| `VARIABLE_ANTIPHON` | Reads `dailyData.antiphon_mp` / `antiphon_ep` / `antiphon`; skips silently if empty |
| `VARIABLE_PSALM` | Fetches each psalm via `getScriptureText()`, renders with `formatPsalmAsPoetry()`, appends Gloria Patri if toggled |
| `VARIABLE_READING_OT` | Injects Prayer Before Reading if toggled; fetches and renders OT lesson |
| `VARIABLE_READING_EPISTLE` | Fetches and renders Epistle |
| `VARIABLE_READING_GOSPEL` | Fetches and renders Gospel (may be empty string if placement excludes current office) |
| `VARIABLE_CANTICLE1` | Morning → `bcp-te-deum`; Evening → `bcp-magnificat`; rite-aware via `resolveText()` |
| `VARIABLE_CANTICLE2` | Morning → `bcp-benedictus`; Evening → `bcp-nunc-dimittis`; rite-aware via `resolveText()` |
| `VARIABLE_COLLECT` | Looks up `dailyData.collect` in `appData.components`; manual ID map applied (see below); appends Examen (Compline) or Kyrie Pantocrator (MP/EP) if toggled |
| `VARIABLE_WEEKDAY_COLLECT` | Priority 1: `dailyData.collect_weekday`; Priority 2: `bcp-collect-grace` (MP) / `bcp-collect-peace` (EP); Priority 3: skip with `console.warn` |
| `VARIABLE_MISSION_PRAYER` | Fixed map to `bcp-mission-prayer-1` |

### Manual Component ID Map

Applied inside `VARIABLE_COLLECT` to correct lectionary naming discrepancies:

| Lectionary ID | Actual Component ID |
|---|---|
| `bcp-collect-transfiguration` | `bcp-collect-the-transfiguration-of-our-lord` |

### Generic Fallback Lookup

After all named handlers, any item that reaches the bottom of the loop is looked up directly in `appData.components` by `compId`. Before rendering, the `DISPLAY_LABELS` map is checked to produce a clean heading:

| Component ID | Display Label |
|---|---|
| `bcp-confession-rite1` / `bcp-confession-rite2` | Confession of Sin |
| `bcp-absolution-r{x}-priest` | Absolution |
| `bcp-absolution-r{x}-lay` | Prayer for Forgiveness |
| `bcp-suffrages-rite1` / `bcp-suffrages-rite2` | The Suffrages |
| `bcp-phos-hilaron` | O Gracious Light |
| `bcp-collect-grace` | A Collect for Grace |
| `bcp-collect-peace` | A Collect for Peace |
| `bcp-collect-compline-1` | A Collect for the Evening |
| `bcp-mission-prayer-1` | A Prayer for Mission |
| `bcp-versicles-before-prayers-compline` | Versicles |
| `bcp-opening-blessing-compline` | Opening Blessing |
| `bcp-nunc-dimittis` | Nunc Dimittis |
| `bcp-benedictus` | The Benedictus |
| `bcp-magnificat` | The Magnificat |
| `bcp-te-deum` | Te Deum Laudamus |

Any component not in `DISPLAY_LABELS` falls through to `comp.title`.

---

## Ecumenical Devotions — Render Order

All ecumenical elements are suppressed in BCP Only Mode.

### Pre-Sequence (before rubric loop)

| Element | Component ID | Toggle |
|---|---|---|
| Agpeya Opening | `cop-agpeya-opening` | `toggle-agpeya-opening` |
| Prayer of the Hours | `ecu-east-syriac-hours` | `toggle-east-syriac-hours` |
| Marian Antiphon | `bcp-marian-antiphon-{season}` (fallback: `bcp-marian-antiphon-ordinary`) | `marian-element` ≠ `none`, position = `before` |
| Theotokion | `cop-theotokion-{season}` (fallback: `cop-theotokion`) | `marian-element` includes `theotokion`, position = `before` |

### During the Loop

| Trigger Point | Element | Component ID | Gate |
|---|---|---|---|
| After `bcp-absolution-slot` renders | Trisagion | `ecu-trisagion` | `toggle-trisagion` |
| At `bcp-invitatory-full`, before invitatory text | Angelus | `ecu-angelus` | `toggle-angelus` AND not Compline |
| Inside `VARIABLE_PSALM`, after each psalm | Gloria Patri | `comm-gloria-patri` | `toggle-gloria-patri` |
| Inside `VARIABLE_READING_OT`, before lesson | Prayer Before Reading | `ecu-prayer-before-reading` | `toggle-prayer-before-reading` |

### Post-Collect (inside VARIABLE_COLLECT)

| Element | Component ID | Gate |
|---|---|---|
| The Examen | `ecu-examen` | `toggle-examen` AND `isCompline` |
| Kyrie Pantocrator | `ecu-kyrie-pantocrator` | `toggle-kyrie-pantocrator` AND not Compline AND not Noonday |

### Post-Sequence (after rubric loop)

| Element | Gate |
|---|---|
| Marian Antiphon / Theotokion | `marian-element` ≠ `none` AND `marianPos === 'after'` |

### Theotokion and Examen Formatting

Both use `applyParagraphBreaks()` which converts `\n\n` → `<br><br>`, rendered inside a `<div class="component-text" style="white-space:normal">` to support multi-paragraph flow.

---

## Invitatory Seasonal Canticle Logic

Inside the `bcp-invitatory-full` handler (Morning and Evening Prayer only):

| Condition | Canticle Rendered |
|---|---|
| Easter season | `bcp-pascha-nostrum` (Christ Our Passover) |
| Lent + Friday | Psalm 95 (fetched via `getScriptureText()`) |
| Lent (non-Friday) | `bcp-jubilate` |
| All other seasons | `bcp-venite` |

---

## Psalm Handling

**Lectionary psalms (default):** `dailyData.psalms_mp` / `dailyData.psalms_ep` (with fallbacks). Multiple psalms are comma-separated; each is fetched and rendered individually.

**30-Day BCP Psalter:** Enabled by `toggle-30day-psalter`. Reads from `psalterCycle` array by `currentDate.getDate()`. Day 31 maps to a separate entry.

---

## Saints / Commemorations

Saints data loaded from `data/saints/saints-{month}.json` (e.g., `saints-february.json`). Cached in `appData.saints` / `appData.saintsMonth` — only re-fetched when the month changes. Filtered by `s.day` containing `todayKeyShort` (e.g., `"February 22"`).

---

## Console Logging Reference

| Message | Level | Meaning |
|---|---|---|
| `[init] Loaded components/X.json — N components` | log | Shard loaded successfully |
| `[init] Skipping empty optional shard: components/ethiopian.json` | log | Ethiopian shard exists but is empty — expected |
| `[init] Required shard missing: components/X.json` | warn | Required shard returned non-200 |
| `[init] Total components loaded: N` | log | All shards processed; N should be 195 |
| `[renderOffice] VARIABLE_CANTICLE1: component not found — X` | warn | Canticle ID not in loaded components |
| `[renderOffice] VARIABLE_WEEKDAY_COLLECT: no collect resolved — skipping` | warn | Neither seasonal nor fallback collect found |
| `[renderOffice] VARIABLE_MISSION_PRAYER: bcp-mission-prayer-1 not found` | warn | Mission prayer missing from components |
| `[renderOffice] Generic lookup failed for resolved ID: X (from: Y)` | warn | Slot resolved to ID not found in components |
| `[renderOffice] Generic lookup failed for: X` | warn | Direct component ID not found |

---

## External Module Dependencies

**`CalendarEngine`** (`js/calendar-engine.js`):

| Method | Used For |
|---|---|
| `CalendarEngine.init()` | Load `bcp-propers.json` on startup |
| `CalendarEngine.getSeasonAndFile(date)` | Returns `{ season, liturgicalColor, litYear }` |
| `CalendarEngine.fetchLectionaryData(date)` | Returns the full `dailyData` object |

**Scripture Resolver** (`js/scripture-resolver.js`):

| Function | Used For |
|---|---|
| `getScriptureText(citation)` | Fetches psalm and reading text by BCP citation string |

---

## Validation Checklist

Before deploying changes to `office-ui.js`:

- [ ] Component shards loaded from `components/*.json` (not `data/components.json`)
- [ ] `init()` guards against empty shard files using text-before-parse pattern
- [ ] `renderOffice()` guards against null `appData` at entry
- [ ] `saveSettings()` and `loadSettings()` keys are identical and in sync
- [ ] Creed default is `comm-creed-apostles` (not `bcp-creed-apostles`)
- [ ] `[rite]` interpolation produces `rite1`/`rite2` suffix — not `r1`/`r2`
- [ ] `bcp-absolution-slot` uses `ritePrefix` (`r1`/`r2`) — separate from `[rite]`
- [ ] `VARIABLE_CANTICLE1` / `VARIABLE_CANTICLE2` use `resolveText(comp, rite)` for rite selection
- [ ] `bcp-litany` gated behind `greatLitanyChecked`
- [ ] New ecumenical toggles added to `toggleBcpOnly()` force-uncheck array
- [ ] New ecumenical section IDs added to `toggleBcpOnly()` sections array
- [ ] Verbose component titles overridden in `DISPLAY_LABELS` (not by editing JSON)
- [ ] `VARIABLE_COLLECT` applies manual ID map for `collect-transfiguration`
- [ ] `applyParagraphBreaks()` used for Examen and Theotokion (not inline `.replace()`)
- [ ] `updateDatePicker()` called after any `currentDate` mutation

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| 6.4 | ✅ Complete | Ecumenical devotions with positional placement |
| 6.5 | ✅ Complete | Modularization — office-ui.js extracted from index.html |
| 6.6 | ✅ Complete | VARIABLE_CANTICLE1/2, VARIABLE_WEEKDAY_COLLECT, VARIABLE_MISSION_PRAYER handlers; bcp-litany gate; Theotokion formatting; display label map |
| 7.0 | 📋 Planned | Full Eastern canonical hours |

**Phase 7.0 traditions:** Byzantine Orthodox, Coptic Agpeya, Church of the East (Hudra), Ethiopian/Eritrean (Ge'ez). Architecture: separate rubric files per tradition, same component lookup system, expanded mode selector on splash screen.

---

## Credits

**Application:** The Universal Office  
**Liturgical Source:** 1979 Book of Common Prayer (The Episcopal Church), public domain  
**UI Framework:** Vanilla JavaScript, no external dependencies  

---

*For calendar and lectionary logic see `CALENDAR_ENGINE_DOCUMENTATION.md`. For scripture fetching see `SCRIPTURE_RESOLVER_DOCUMENTATION.md`. For component text data see `COMPONENTS_JSON_DOCUMENTATION.md`.*
