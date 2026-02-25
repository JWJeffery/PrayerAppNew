# OFFICE-UI.JS — PRODUCTION DOCUMENTATION

## Overview

`office-ui.js` is the core application logic module for **The Universal Office**. It handles all UI state, settings persistence, office rendering, and DOM assembly. All calendar logic, lectionary resolution, and scripture fetching have been extracted into separate modules.

**Production Status:** ✅ OPERATIONAL  
**Last Updated:** February 24, 2026  
**Architecture Role:** UI and rendering layer — no calendar or scripture logic  
**Dependencies:** `js/calendar-engine.js`, `js/calendar-ethiopian.js`, `js/scripture-resolver.js`, `data/rubrics.json`, `components/*.json`, `components/traditions/ethiopian/rubrics.json`  
**Global Exposure:** All functions are global (no class or module wrapper)

---

## Module Architecture

```
office-ui.js
├── State variables         (appData, currentDate, selectedMode)
├── Constants               (monthNames, psalterCycle)
├── init()                  Bootstraps app: loads rubrics (BCP + Ethiopian), loads shards, calls CalendarEngine
├── selectMode()            Switches between Daily Office, Individual Prayers, and Ethiopian Sa'atat
├── Date controls           changeDate(), resetDate(), setCustomDate(), updateDatePicker()
├── Sidebar                 toggleSidebar(), updateSidebarForOffice()
├── BCP Only Mode           toggleBcpOnly()
├── Appearance              updateUI()
├── Settings persistence    saveSettings(), loadSettings()
├── Text formatters         formatScriptureAsFlow(), formatPsalmAsPoetry()
├── Helpers                 resolveText(), applyParagraphBreaks()
├── getEthiopianHourInfo()  Resolves current canonical hour from local clock
├── renderOffice()          Core async renderer — assembles full office HTML
└── backToSplash()          Navigation back to mode selection
```

---

## Data Loading (`init()`)

### Rubrics

Two rubric sources are loaded and merged:

```javascript
// 1. BCP offices
const rubricsRes = await fetch('data/rubrics.json');
appData.rubrics = await rubricsRes.json();

// 2. Ethiopian Sa'atat (concatenated onto BCP rubrics)
const ethRubricsRes = await fetch('components/traditions/ethiopian/rubrics.json');
appData.rubrics = appData.rubrics.concat(ethRubrics);
```

`data/rubrics.json` contains four BCP office definitions (`morning-office`, `evening-office`, `noonday-office`, `compline-office`). `components/traditions/ethiopian/rubrics.json` adds `ethiopian-saatat`. The Ethiopian rubric load is wrapped in try/catch and fails silently if missing.

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

**Shard load order and counts (as of February 24, 2026):**

| Shard | Path | Components | Notes |
|---|---|---|---|
| `common` | `components/common.json` | 5 | Creeds, Lord's Prayer, Kyrie, Gloria Patri |
| `anglican` | `components/anglican.json` | 179 | All BCP components — collects, canticles, absolutions, etc. |
| `coptic` | `components/coptic.json` | 2 | Agpeya Opening, Theotokion |
| `ecumenical` | `components/ecumenical.json` | 9 | Angelus, Trisagion, Examen, etc. |
| `ethiopian` | `components/ethiopian.json` | ~19 | Sa'atat hour texts, Tselote Meweta, Weddase Maryam (×7), Senkessar scaffolds, Mazmur metadata, Anqaşa Birhān, saints scaffold |
| **Total** | | **~214** | |

> ⚠️ `data/components.json` is a **stale pre-modularization monolith**. Do not load from this path. The live data is exclusively in `components/*.json`.

---

## Global State

| Variable | Type | Purpose |
|---|---|---|
| `appData` | Object/null | `{ components: [], rubrics: [], senkessarIndex: null, senkessarCache: {} }` — populated by `init()` |
| `currentDate` | Date | The date currently being rendered |
| `selectedMode` | String/null | `'daily'`, `'prayers'`, or `'ethiopian-saatat'` |
| `monthNames` | Array | Month name strings for saints file path construction |
| `psalterCycle` | Array | 31-entry BCP 30-Day Psalter (BCP 1979, p. 935) |
| `window._forcedOfficeId` | String/undefined | Set to `'ethiopian-saatat'` by `selectMode()` when no radio input exists for the tradition |
| `window._temporalOverride` | Object/undefined | Set in browser console to force a specific Ethiopian canonical hour for testing |

---

## Function Reference

### `init()` — async
Bootstraps the application. Fetches `data/rubrics.json`, then the Ethiopian rubrics extension, then all five component shards, then calls `CalendarEngine.init()`, `CalendarEngine.fetchLectionaryData()`, and `renderOffice()`.

Called by `selectMode()` only if `appData` is not yet populated.

### `selectMode(mode)` — sync
Accepts `'daily'`, `'prayers'`, or `'ethiopian-saatat'`.

- `'daily'`: shows BCP sidebar and settings panel, calls `loadSettings()`, `updateSidebarForOffice()`, `renderOffice()`
- `'prayers'`: shows individual prayers section, hides sidebar and settings
- `'ethiopian-saatat'`: reuses `#daily-office-section`, hides `#settings-panel` (BCP) and shows `#ethiopian-settings`, applies `.ethiopian-theme` to `body`, hides main `<h1>`, sets `window._forcedOfficeId = 'ethiopian-saatat'`, calls `init()` or `renderOffice()`

### `getEthiopianHourInfo()` — sync
Returns the canonical hour entry matching the current local time. Checks `window._temporalOverride` first (testing hook). Consults an exhaustive `hourMap` covering all nine canonical watches. Returns `{ hourId, hourName, uiLabel, psalms, etReading }`.

**Hour map:**

| Window | hourId | hourName | Psalms | etReading |
|---|---|---|---|---|
| 06:00–09:00 | `eth-nigatu-hour-text` | Nigatu — ንጋቱ (Matins) | 3, 63, 133 | 1 Clement |
| 09:00–12:00 | `eth-meserk-hour-text` | Mese'rk — መሠርቅ (Third Hour) | 16, 17, 18 | — |
| 12:00–15:00 | `eth-lika-hour-text` | Lika — ሊካ (Sixth Hour) | 22, 23, 24 | — |
| 15:00–17:00 | `eth-terk-hour-text` | Tese'at — ተሰዓት (Ninth Hour) | 69, 70, 71 | — |
| 17:00–18:00 | `eth-serkh-hour-text` | Serkh — ሠርክ (Eleventh Hour) | 141, 142, 143 | — |
| 18:00–21:00 | `eth-nome-hour-text` | Nime — ኖሜ (Compline) | 4, 6, 13 | — |
| 21:00–00:00 | `eth-hour-7` | Le'lit — First Night Watch | 4, 6, 13 | Hermas |
| 00:00–03:00 | `eth-lelit-hour-text` | Le'lit — ሌሊት (Midnight) | 4, 6, 13 | Hermas |
| 03:00–06:00 | `eth-mahlet-hour-text` | Mahlet — ማህሌት (Pre-dawn Vigil) | 3, 63, 133 | — |

Map is exhaustive (all 1440 minutes covered). Fallback returns Nigatu and should never be reached.

### `renderOffice()` — async
**The core rendering function.** Assembles complete office HTML and writes it to `#office-display`. Called on every date or settings change.

**Execution flow:**
1. Guard: return early with loading message if `appData` not populated
2. Read all settings from DOM (rite, minister, creed, office, toggles)
3. Resolve `resolvedOfficeId = window._forcedOfficeId || officeId` — used for all subsequent flags and rubric lookup
4. Set `isEthiopianSaatat = resolvedOfficeId === 'ethiopian-saatat'`
5. Call `CalendarEngine.getSeasonAndFile(currentDate)` → `{ season, liturgicalColor, litYear }`
6. Call `CalendarEngine.fetchLectionaryData(currentDate)` → `dailyData`
7. Look up `activeRubric` from `appData.rubrics` using `resolvedOfficeId`
8. If `isEthiopianSaatat`: call `getEthiopianHourInfo()` → `ethHourInfo`
9. Update `#calendar-info` and `#display-date`
10. Update seasonal accent via `updateSeasonalTheme(liturgicalColor)`
11. Determine psalm source (30-day psalter or lectionary)
12. Preload saints data for current month (before sequence loop)
13. Look up Marian components if enabled (BCP only)
14. Resolve independent reading chains for MP and EP
15. Render pre-sequence ecumenical devotions if `!isEthiopianSaatat` (Agpeya, East Syriac, Marian-before)
16. Walk `activeRubric.sequence` — for each item, resolve slots then dispatch to handler
17. Render post-sequence Marian element if `!isEthiopianSaatat` and position = `after`
18. Write assembled HTML to `#office-display`
19. If `!isEthiopianSaatat`: set Commemorations header and populate `#saint-display`
20. If `isEthiopianSaatat`: clear `#saint-display` and hide `#date-header`

### `changeDate(days)` / `resetDate()` / `setCustomDate(dateStr)` — sync
Date navigation. All update `currentDate` and call `renderOffice()`. Not exposed in Ethiopian Sa'atat UI.

### `updateDatePicker()` — sync
Syncs the `#date-picker` input value to `currentDate` using zero-padded YYYY-MM-DD format.

### `toggleSidebar()` — sync
Toggles `sidebar-hidden` class on `#settings-panel`, `#sidebar-toggle`, and `#main-content`. Adjusts toggle opacity.

### `updateSidebarForOffice()` — sync
Shows/hides sidebar toggles based on which office is selected. Hides irrelevant options and force-unchecks hidden toggles. Not called in Ethiopian Sa'atat mode (no BCP sidebar).

### `toggleBcpOnly()` — sync
Enables/disables BCP Only Mode. When enabled: applies `bcp-only-hidden` CSS class to all three ecumenical sections and force-unchecks all ecumenical toggles. Calls `renderOffice()`. Has no effect on Ethiopian Sa'atat.

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
Persist and restore all settings to/from `localStorage` under key `universalOfficeSettings`. Ethiopian Sa'atat has no user-configurable settings and does not interact with this persistence layer.

### `formatScriptureAsFlow(rawText)` — sync
Strips verse numbers, splits on double newlines, wraps paragraphs in `<p>` tags. Used for prose readings (OT, Epistle, Gospel, ET scripture readings).

### `formatPsalmAsPoetry(rawText)` — sync
Strips verse numbers, splits on `*` to produce half-verse spans. Returns `<span class="psalm-stanza">` structure for CSS poetry layout. Used by both BCP psalm handler and `eth-mazmur-slot`.

### `resolveText(comp, rite)` — sync
Helper: extracts rite-aware text from a component. Returns `comp.text[rite]`, falling back to `rite2`, then `rite1`, then the raw string if `text` is not an object.

### `applyParagraphBreaks(text)` — sync
Helper: converts `\n\n` to `<br><br>` for block text that needs paragraph breaks. Used with `white-space:normal` container divs. Used by Examen, Theotokion, all Ethiopian hour texts, and Senkessar narratives.

### `backToSplash()` — sync
Hides all office sections, restores splash screen and mode selector.

---

## Persisted Settings

All settings persisted via `localStorage` key `universalOfficeSettings`:

| Key | Default | Control |
|---|---|---|
| `darkMode` | `false` | `toggle-dark` |
| `bcpOnly` | `false` | `toggle-bcp-only` |
| `officeTime` | `'morning-office'` | `input[name="office-time"]` |
| `rite` | `'rite2'` | `input[name="rite"]` |
| `minister` | `'lay'` | `input[name="minister"]` |
| `marianElement` | `'none'` | `input[name="marian-element"]` |
| `marianPos` | `'before'` | `input[name="marian-antiphon-pos"]` |
| `gloriaPatri` | `false` | `toggle-gloria-patri` |
| `angelus` | `false` | `toggle-angelus` |
| `trisagion` | `false` | `toggle-trisagion` |
| `eastSyriacHours` | `false` | `toggle-east-syriac-hours` |
| `agpeyaOpening` | `false` | `toggle-agpeya-opening` |
| `creedType` | `'comm-creed-apostles'` | `creed-type` select |
| `gospelPlacement` | `'evening'` | `input[name="gospel-placement"]` |
| `litany` | `false` | `toggle-litany` |
| `suffrages` | `false` | `toggle-suffrages` |
| `psalter30Day` | `false` | `toggle-30day-psalter` |
| `generalThanksgiving` | `false` | `toggle-general-thanksgiving` |
| `chrysostom` | `false` | `toggle-chrysostom` |
| `prayerBeforeReading` | `false` | `toggle-prayer-before-reading` |
| `examen` | `false` | `toggle-examen` |
| `kyriePantocrator` | `false` | `toggle-kyrie-pantocrator` |

---

## Rubric Sequence Handlers

### Slot Resolution (before all handlers)

| Slot in Sequence | Resolved To |
|---|---|
| `bcp-confession-[rite]` | `bcp-confession-rite1` or `bcp-confession-rite2` |
| `bcp-absolution-slot` | `bcp-absolution-r{1\|2}-{priest\|lay}` |
| `comm-creed-slot` | Value of `creed-type` select |
| `bcp-suffrages-slot` | `bcp-suffrages-rite1` or `bcp-suffrages-rite2` (skipped if unchecked) |

### VARIABLE_ Token Handlers (BCP offices)

| Token | Resolved Content |
|---|---|
| `VARIABLE_OPENING` | Seasonal opening sentence (`bcp-opening-{season}`, fallback `bcp-opening-general`) |
| `VARIABLE_ANTIPHON` | `dailyData.antiphon_mp` or `antiphon_ep` |
| `VARIABLE_PSALM` | Psalm text (lectionary or 30-day psalter), with optional Gloria Patri |
| `VARIABLE_READING_OT` | Old Testament lesson (independent MP/EP chain) |
| `VARIABLE_READING_EPISTLE` | Epistle (independent MP/EP chain) |
| `VARIABLE_READING_GOSPEL` | Gospel (subject to `gospelPlacement` setting) |
| `VARIABLE_CANTICLE1` | Te Deum (MP) / Magnificat (EP) — rite-aware |
| `VARIABLE_CANTICLE2` | Benedictus (MP) / Nunc Dimittis (EP) — rite-aware |
| `VARIABLE_COLLECT` | Daily collect with manual ID map; triggers Examen and Kyrie Pantocrator |
| `VARIABLE_WEEKDAY_COLLECT` | Tiered: `dailyData.collect_weekday` → `bcp-collect-grace`/`peace` → skip |
| `VARIABLE_MISSION_PRAYER` | `bcp-mission-prayer-1` |

### Ethiopian Slot Handlers

| Slot | Behavior |
|---|---|
| `eth-introduction-to-every-hour` | Renders `introComp.rubric_before` as `.rubric-text` span, then full Tselote Meweta text (Lord's Prayer + Thanksgiving + Psalm 50/51) via `applyParagraphBreaks()`. Console warning if component missing. |
| `eth-saatat-hour-slot` | Looks up `ethHourInfo.hourId` in `appData.components`; prepends Sixth Hour commemorative sentence when `hourId === 'eth-lika-hour-text'`; renders hour text with `applyParagraphBreaks()` |
| `VARIABLE_READING_ET` | Fetches `ethHourInfo.etReading` citation via `getScriptureText()`; active for Nigatu (1 Clement) and both Le'lit watches (Hermas); silently skipped (`continue`) for all other hours where `etReading` is null |
| `eth-mazmur-slot` | Loops `ethHourInfo.psalms`; fetches each via `getScriptureText()`; renders with `formatPsalmAsPoetry()`; appends `eth-anqasa-birhan` (Anqaşa Birhān — Gate of Light) |
| `eth-saints-commemoration` | Full Senkessar pipeline: calls `EthiopianCalendar.getEthiopianDate()`, normalises via `MONTH_SLUG_MAP`, lazy-loads and caches `senkessar-index.json`, fetches and caches per-day narrative from `data/synaxarium/ethiopian/{slug}/{day}.json`, renders title + narrative; falls back to Oriental saints filter, then generic intercession |

### Named Component Handlers

| Item | Special Handling |
|---|---|
| `bcp-invitatory-full` | Optional Angelus injection; selects MP vs EP invitatory variant; seasonal canticle (Venite / Jubilate / Ps 95 / Pascha Nostrum) |
| `comm-lords-prayer` | Rite-aware via `resolveText()` |
| `comm-kyrie` | Rite-aware via `resolveText()` |
| `bcp-litany` | Gated behind `greatLitanyChecked` toggle |

### DISPLAY_LABELS Map

Overrides verbose component `title` fields for rendered rubric headings:

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

## Ecumenical Devotions — Render Order (BCP offices only)

All ecumenical blocks are gated behind `!isEthiopianSaatat` in addition to their individual toggles.

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
| Marian Antiphon / Theotokion | `!isEthiopianSaatat` AND `marian-element` ≠ `none` AND `marianPos === 'after'` |

---

## Ethiopian Sa'atat — BCP Isolation

The following blocks are unconditionally suppressed when `isEthiopianSaatat` is true:

| Block | Location | Reason |
|---|---|---|
| Agpeya Opening | Pre-sequence | BCP ecumenical only |
| East Syriac Hours | Pre-sequence | BCP ecumenical only |
| Marian Antiphon / Theotokion (before) | Pre-sequence | BCP ecumenical only |
| Marian Antiphon / Theotokion (after) | Post-sequence | BCP ecumenical only |
| `#date-header` text and visibility | Finalise DOM | Replaced by Sa'atat inline Senkessar commemoration |
| `#saint-display` content | Finalise DOM | Handled by `eth-saints-commemoration` slot |

---

## Invitatory Seasonal Canticle Logic

Inside the `bcp-invitatory-full` handler (Morning and Evening Prayer only, not Ethiopian Sa'atat):

| Condition | Canticle Rendered |
|---|---|
| Easter season | `bcp-pascha-nostrum` (Christ Our Passover) |
| Lent + Friday | Psalm 95 (fetched via `getScriptureText()`) |
| Lent (non-Friday) | `bcp-jubilate` |
| All other seasons | `bcp-venite` |

---

## Psalm Handling

**Lectionary psalms (default):** `dailyData.psalms_mp` / `dailyData.psalms_ep` (with fallbacks). Multiple psalms are comma-separated; each is fetched and rendered individually. Used by BCP offices.

**30-Day BCP Psalter:** Enabled by `toggle-30day-psalter`. Reads from `psalterCycle` array by `currentDate.getDate()`. Day 31 maps to a separate entry. BCP offices only.

**Ethiopian Mazmur:** Appointed psalms come from `ethHourInfo.psalms` — a fixed array per canonical hour defined in `getEthiopianHourInfo()`. Fetched individually via `getScriptureText()`. Rendered via `formatPsalmAsPoetry()`. Closed by the Anqaşa Birhān hymn (`eth-anqasa-birhan`).

---

## Saints / Commemorations

Saints data loaded from `data/saints/saints-{month}.json`. Cached in `appData.saints` / `appData.saintsMonth` — only re-fetched when the month changes.

**Critical:** Saints are preloaded **before** the rubric sequence loop so that `eth-saints-commemoration` has access on first render.

**BCP offices:** All saints matching `todayKeyShort` are shown in `#saint-display` below the office.

**Ethiopian Sa'atat:** The `eth-saints-commemoration` handler runs the full Senkessar pipeline first (Ethiopian calendar date → `senkessar-index.json` → per-day narrative fetch). If no Senkessar entry is found, it falls back to filtering `appData.saints` for `tradition` containing `'ethiopian'` or `'oriental'` (case-insensitive). If still no match, a generic intercession for the Oriental Orthodox Communion is rendered. `#saint-display` is cleared and `#date-header` is hidden.

---

## Console Logging Reference

| Message | Level | Meaning |
|---|---|---|
| `[init] Loaded components/X.json — N components` | log | Shard loaded successfully |
| `[init] Loaded Ethiopian rubrics — N offices` | log | Ethiopian rubrics concatenated |
| `[init] Could not load Ethiopian rubrics: ...` | warn | Ethiopian rubrics file missing or malformed |
| `[init] Required shard missing: components/X.json` | warn | Required shard returned non-200 |
| `[init] Total components loaded: N` | log | All shards processed; N should be ~214 |
| `[renderOffice] eth-introduction-to-every-hour: component not found` | warn | Tselote Meweta component missing from ethiopian.json |
| `[renderOffice] eth-saatat-hour-slot: component not found — X` | warn | Hour component ID not in loaded components |
| `[eth-saints-commemoration] Senkessar index load failed: ...` | warn | senkessar-index.json missing or malformed |
| `[eth-saints-commemoration] Day file load failed: X/Y.json` | warn | Per-day Senkessar narrative file missing |
| `[eth-saints-commemoration] No day file found for X/Y` | warn | Narrative fetched but empty |
| `[renderOffice] VARIABLE_CANTICLE1: component not found — X` | warn | Canticle ID not in loaded components |
| `[renderOffice] VARIABLE_WEEKDAY_COLLECT: no collect resolved — skipping` | warn | Neither seasonal nor fallback collect found |
| `[renderOffice] VARIABLE_MISSION_PRAYER: bcp-mission-prayer-1 not found` | warn | Mission prayer missing from components |
| `[renderOffice] Generic lookup failed for resolved ID: X (from: Y)` | warn | Slot resolved to ID not found in components |
| `[renderOffice] Generic lookup failed for: X` | warn | Direct component ID not found |
| `[EthiopianCalendar] All N self-tests passed.` | log | Calendar engine self-test on load — expected on every page load |

---

## External Module Dependencies

**`CalendarEngine`** (`js/calendar-engine.js`):

| Method | Used For |
|---|---|
| `CalendarEngine.init()` | Load `bcp-propers.json` on startup |
| `CalendarEngine.getSeasonAndFile(date)` | Returns `{ season, liturgicalColor, litYear }` |
| `CalendarEngine.fetchLectionaryData(date)` | Returns the full `dailyData` object |

**`EthiopianCalendar`** (`js/calendar-ethiopian.js`):

| Method | Used For |
|---|---|
| `EthiopianCalendar.getEthiopianDate(date)` | Converts Gregorian date → `{ day, month, monthIndex, year }` for Senkessar lookup |
| `EthiopianCalendar.formatEthiopianDate(date)` | Returns display string (Phase 8.5 Ge'ez header — not yet wired to UI) |

**Scripture Resolver** (`js/scripture-resolver.js`):

| Function | Used For |
|---|---|
| `getScriptureText(citation)` | Fetches psalm and reading text — used by BCP offices, Ethiopian Mazmur slot, and VARIABLE_READING_ET |

---

## Validation Checklist

Before deploying changes to `office-ui.js`:

- [ ] Component shards loaded from `components/*.json` (not `data/components.json`)
- [ ] Ethiopian rubrics loaded and concatenated before BCP rubrics are used
- [ ] `init()` guards against empty shard files using text-before-parse pattern
- [ ] `renderOffice()` guards against null `appData` at entry
- [ ] `resolvedOfficeId = window._forcedOfficeId || officeId` declared immediately after `officeId`
- [ ] `isEthiopianSaatat` derived from `resolvedOfficeId`, not `officeId`
- [ ] `activeRubric` lookup uses `resolvedOfficeId`
- [ ] Saints preloaded before the rubric sequence loop
- [ ] `saveSettings()` and `loadSettings()` keys are identical and in sync
- [ ] Creed default is `comm-creed-apostles` (not `bcp-creed-apostles`)
- [ ] `[rite]` interpolation produces `rite1`/`rite2` suffix — not `r1`/`r2`
- [ ] `bcp-absolution-slot` uses `ritePrefix` (`r1`/`r2`) — separate from `[rite]`
- [ ] `VARIABLE_CANTICLE1` / `VARIABLE_CANTICLE2` use `resolveText(comp, rite)` for rite selection
- [ ] `bcp-litany` gated behind `greatLitanyChecked`
- [ ] All BCP ecumenical pre/post-sequence blocks gated behind `!isEthiopianSaatat`
- [ ] `#date-header` and `#saint-display` suppressed in Ethiopian Sa'atat finalise block
- [ ] New ecumenical toggles added to `toggleBcpOnly()` force-uncheck array
- [ ] Verbose component titles overridden in `DISPLAY_LABELS` (not by editing JSON)
- [ ] `VARIABLE_COLLECT` applies manual ID map for `collect-transfiguration`
- [ ] `applyParagraphBreaks()` used for Examen, Theotokion, Ethiopian hour texts, and Senkessar narratives
- [ ] `updateDatePicker()` called after any `currentDate` mutation
- [ ] `EthiopianCalendar` self-test passes on load (check console for `[EthiopianCalendar] All N self-tests passed`)

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| 6.4 | ✅ Complete | Ecumenical devotions with positional placement |
| 6.5 | ✅ Complete | Modularization — office-ui.js extracted from index.html |
| 6.6 | ✅ Complete | VARIABLE_CANTICLE1/2, VARIABLE_WEEKDAY_COLLECT, VARIABLE_MISSION_PRAYER handlers; bcp-litany gate; Theotokion formatting; display label map |
| 7.1 | ✅ Complete | Ethiopian Sa'atat entry point; Nigatu/Matins hour; mode isolation; resolvedOfficeId pattern; Ethiopian rubrics loader |
| 7.2 | ✅ Complete | Mese'rk (Third Hour) and Lika (Sixth Hour); UI polish; saints filter; Oriental fallback intercession |
| 7.3 | ✅ Complete | Full 24-hour cycle (Tese'at, Serkh, Nime, Le'lit, Mahlet); saints preload before sequence loop; Commemorations header guard |
| 7.4 | ✅ Complete | `js/calendar-ethiopian.js` — JDN Alexandrian calendar engine; `EthiopianCalendar.getEthiopianDate()` wired into `eth-saints-commemoration` for live Senkessar date resolution |
| 8.1 | ✅ Complete | Senkessar index corrected and validated; Tir corpus complete; full pipeline wired |
| 8.2 | ✅ Complete | All 13 Senkessar months complete (Hamle verified 2026-02-24); three-tier fallback operational |
| v2.6.1 | ✅ Complete | `eth-introduction-to-every-hour` (Tselote Meweta); Metsehafe Tselot CSS; Sixth Hour sentence; CSS legibility fix; ID corrections |
| 8.5 | 📋 Planned | Ge'ez date display in Sa'atat UI header — `EthiopianCalendar.formatEthiopianDate()` ready; UI change only |
| 7.5 | 📋 Planned | Coptic Agpeya as standalone tradition entry point |
| 9.0 | 📋 Planned | Mobile app |

---

## Credits

**Application:** The Universal Office  
**Liturgical Source:** 1979 Book of Common Prayer (The Episcopal Church), public domain  
**Ethiopian Liturgical Source:** Ethiopian Orthodox Tewahedo Sa'atat (Book of Hours); Senkessar (Synaxarium)  
**Calendar Algorithm:** Alexandrian JDN method (`js/calendar-ethiopian.js`)  
**UI Framework:** Vanilla JavaScript, no external dependencies  

---

*For HTML structure and mode selection see `INDEX_HTML_DOCUMENTATION.md`. For calendar and lectionary logic see `CALENDAR_ENGINE_DOCUMENTATION.md`. For scripture fetching see `SCRIPTURE_RESOLVER_DOCUMENTATION.md`. For Ethiopian Sa'atat architecture see `ETHIOPIAN_SAATAT_DOCUMENTATION.md`.*