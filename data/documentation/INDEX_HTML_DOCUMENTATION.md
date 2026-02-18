# INDEX.HTML - PRODUCTION DOCUMENTATION

## Overview

This is the single-page application entry point for **The Universal Office**. It serves as the UI layer only — all calendar logic, date calculation, and scripture fetching have been extracted into separate modules. The file handles DOM rendering, user settings, and office output assembly.

**Production Status:** ✅ OPERATIONAL  
**Last Updated:** February 17, 2026  
**Current Line Count:** 983 lines  
**Dependencies:** `js/calendar-engine.js`, `js/scripture-resolver.js`  
**Architecture Role:** UI layer only — no business logic

---

## Application Modes

The app has two primary modes selected at the splash screen:

| Mode | Description |
|---|---|
| **Daily Office** | Full liturgical office (Morning Prayer, Evening Prayer, Noonday, Compline) |
| **Individual Prayers** | Single component lookup and display |

Mode is stored in the `selectedMode` variable and controls which HTML section is displayed.

---

## HTML Structure

### Three Main Sections

```
#mode-selection        → Splash screen with mode buttons
#daily-office-section  → Full office layout (sidebar + content)
#individual-prayers-section → Single prayer lookup UI
```

### Daily Office Layout

```
#settings-panel (fixed left sidebar, 300px)
    └── Office Settings (time, rite, minister, devotions, appearance)
#office-content (main scrollable area, left-margin 300px)
    ├── #calendar-info (liturgical title bar)
    ├── #date-navigation (Prev / Today / Next buttons + date picker)
    └── #office-display (rendered office HTML)
```

---

## CSS Architecture

### CSS Custom Properties (Theming)

All colors are defined as CSS variables on `:root` and overridden in `body.dark-mode`:

| Variable | Light Mode | Dark Mode | Purpose |
|---|---|---|---|
| `--bg-color` | `#f4f1ea` | `#121212` | Page background |
| `--text-color` | `#2c3e50` | `#e0e0e0` | Body text |
| `--container-bg` | `#ffffff` | `#1e1e1e` | Card/panel backgrounds |
| `--accent` | `#8e44ad` | dynamic | Season color (updated by JS) |
| `--gold` | `#d4af37` | `#d4af37` | Headings, borders, labels |
| `--sidebar-bg` | `#1a1a1a` | `#000000` | Settings panel background |

### Seasonal Accent Color

The `--accent` variable is dynamically updated by `updateSeasonalTheme()` based on the current day's `liturgicalColor` field:

| `liturgicalColor` | Hex | Season |
|---|---|---|
| `purple` | `#8e44ad` | Advent, Lent |
| `rose` | `#e74c3c` | Gaudete, Laetare Sundays |
| `white` | `#f0f0f0` | Christmas, Epiphany, feasts |
| `red` | `#c0392b` | Pentecost, martyrs, Holy Week |
| `green` | `#27ae60` | Ordinary Time (default) |

### Office Content Typography

Office content is rendered using two CSS classes applied to `<span>` elements:

- `.rubric-text` — Section headings in small-caps gold (e.g., "Opening Sentence", "Collect")
- `.component-text` — Body text of liturgical content
- `.component-text i` — Italic for antiphons, Marian texts

---

## JavaScript Variables

Declared at the top of the `<script>` block:

| Variable | Type | Purpose |
|---|---|---|
| `appData` | Object/null | Holds loaded `components`, `rubrics` after `init()` |
| `currentDate` | Date | The date currently being displayed |
| `selectedMode` | String/null | `'daily'` or `'individual'` |
| `monthNames` | Array | Full month name strings for saints file loading |
| `psalterCycle` | Array | 31-entry array for 30-day BCP Psalter rotation |

---

## Function Reference

### `init()` — async
**Called:** On page load via `window.onload`  
**Purpose:** Bootstraps the entire application  
**Actions:**
1. Fetches `data/components.json` and `data/rubrics.json` in parallel
2. Calls `CalendarEngine.init()` to load `bcp-propers.json`
3. Calls `loadSettings()` to restore user preferences from localStorage
4. Pre-warms the lectionary cache by calling `CalendarEngine.fetchLectionaryData()`
5. Updates the date picker UI

---

### `selectMode(mode)` — sync
**Called:** When user clicks a mode button on splash screen  
**Parameters:** `mode` — `'daily'` or `'individual'`  
**Actions:** Shows the appropriate section, hides others, calls `renderOffice()` if daily mode

---

### `renderOffice()` — async
**The core rendering function.** Called whenever the date or any setting changes.

**Execution flow:**
1. Guards against calling before `appData` is loaded
2. Reads all current settings from DOM (rite, minister, marian position, creed, devotions, etc.)
3. Gets current season via `CalendarEngine.getSeasonAndFile(currentDate)`
4. Fetches daily lectionary entry via `CalendarEngine.fetchLectionaryData(currentDate)`
5. Updates calendar title and seasonal accent color
6. Determines reading distribution (Morning/Evening/Noonday/Compline)
7. Gets liturgical year via `CalendarEngine.getLiturgicalYear(currentDate)`
8. Selects correct year-track readings (`reading_ot_mp_year1` vs `reading_ot_mp_year2`)
9. Walks the active rubric's `sequence` array, resolving each component:
   - Slot IDs (`bcp-absolution-slot`, `bcp-creed-slot`, `bcp-suffrages-slot`) are resolved dynamically
   - Variable placeholders (`VARIABLE_OPENING`, `VARIABLE_PSALM`, `VARIABLE_READING_OT`, etc.) are resolved
   - Scripture citations are fetched via `getScriptureText()`
   - Components are looked up in `appData.components` by ID
10. Assembles final HTML string and sets `#office-display.innerHTML`
11. Loads saints data for current month if not already cached

**Reading Priority Logic:**
```javascript
// Priority 1: Year-specific keys
dailyData[`reading_ot_mp_${litYear}`]   // e.g., reading_ot_mp_year2
// Priority 2: Standard fallback keys
dailyData['reading_ot']
```

---

### `updateSeasonalTheme(color)` — sync
**Called:** By `renderOffice()` after fetching daily data  
**Purpose:** Updates the `--accent` CSS variable to match the liturgical season color  
**Parameters:** `color` — value from `dailyData.liturgicalColor`

---

### `changeDate(days)` — sync
**Called:** By Prev/Next navigation buttons  
**Parameters:** `days` — integer (+1 or -1)  
**Actions:** Calls `CalendarEngine.changeDate(days)`, updates `currentDate`, calls `renderOffice()`

---

### `resetDate()` — sync
**Called:** By "Today" button  
**Actions:** Calls `CalendarEngine.resetDate()`, resets `currentDate` to `new Date()`, calls `renderOffice()`

---

### `updateDatePicker()` — sync
**Called:** After any date change  
**Purpose:** Syncs the `<input type="date">` value with `currentDate`

---

### `setCustomDate(dateStr)` — sync
**Called:** When user selects a date from the date picker  
**Parameters:** `dateStr` — YYYY-MM-DD string from input  
**Actions:** Parses to local Date, sets `CalendarEngine.currentDate`, calls `renderOffice()`

---

### `updateUI()` — sync
**Called:** When dark mode or other appearance settings change  
**Purpose:** Applies/removes `dark-mode` class from `body`

---

### `saveSettings()` — sync
**Called:** On every settings change event  
**Storage Key:** `universalOfficeSettings` in localStorage  
**Persisted Settings:**

| Setting | Default | Type |
|---|---|---|
| `darkMode` | false | boolean |
| `officeTime` | `morning-office` | string |
| `rite` | `rite2` | `rite1` / `rite2` |
| `minister` | `lay` | `lay` / `priest` |
| `marianAntiphon` | `none` | `none` / `before` / `after` |
| `gloriaPatri` | false | boolean |
| `angelus` | false | boolean |
| `trisagion` | false | boolean |
| `theotokion` | false | boolean |
| `jesusPrayer` | false | boolean |
| `assyrianBlessing` | false | boolean |
| `agpeyaOpening` | false | boolean |
| `creedType` | `bcp-creed-apostles` | string |
| `gospelPlacement` | `evening` | `morning` / `evening` / `both` |
| `litany` | false | boolean |
| `suffrages` | false | boolean |
| `psalter30Day` | false | boolean |
| `generalThanksgiving` | false | boolean |
| `chrysostom` | false | boolean |

---

### `loadSettings()` — sync
**Called:** During `init()`  
**Purpose:** Restores all persisted settings from localStorage and applies them to DOM elements  
**Error Handling:** Wrapped in try/catch; silently fails if localStorage unavailable

---

### `showSinglePrayer()` — sync
**Called:** In Individual Prayers mode when user selects a prayer  
**Purpose:** Renders a single component from `appData.components` by ID

---

### `backToPrayerDropdown()` / `backToSplash()` — sync
**Navigation helpers** — show/hide sections to return to previous views

---

## Rubric Sequence Resolution

The rubric `sequence` array contains a mix of static component IDs and dynamic placeholders. `renderOffice()` resolves each item in order:

### Static Component IDs
Looked up directly in `appData.components`. If the component has a `text` object (rite-specific), the correct rite variant is selected:
```javascript
comp.text[rite] || comp.text
```

### Slot Placeholders

| Slot ID | Resolves To |
|---|---|
| `bcp-absolution-slot` | `bcp-absolution-r1-priest`, `bcp-absolution-r2-lay`, etc. |
| `bcp-creed-slot` | `bcp-creed-apostles` or `bcp-creed-nicene` (user setting) |
| `bcp-suffrages-slot` | `bcp-suffrages-rite1` or `bcp-suffrages-rite2` (skipped if unchecked) |
| `bcp-great-litany-slot` | `bcp-litany` (skipped if unchecked) |

### Variable Placeholders

| Placeholder | Resolved Content |
|---|---|
| `VARIABLE_OPENING` | Seasonal opening sentence (`bcp-opening-advent`, `bcp-opening-lent`, etc.) |
| `VARIABLE_PSALM` | Psalm text fetched via `getScriptureText()`, from daily data or 30-day psalter |
| `VARIABLE_READING_OT` | Old Testament reading text |
| `VARIABLE_READING_EPISTLE` | Epistle reading text |
| `VARIABLE_READING_GOSPEL` | Gospel reading text |
| `VARIABLE_COLLECT` | Daily collect from `dailyData.collect`, looked up in `appData.components` |
| `VARIABLE_ANTIPHON` | Seasonal antiphon from `dailyData.antiphon_mp` or `antiphon_ep` |

---

## Psalm Handling

### Two Psalm Sources

**1. Lectionary Psalms (default)**
- Pulled from `dailyData.psalms_mp` (morning) or `dailms_ep` (evening)
- Fetched via `getScriptureText()`

**2. 30-Day BCP Psalter (optional)**
- Enabled by the `toggle-30day-psalter` checkbox
- Uses `psalterCycle` array (31 entries indexed by day of month)
- Formula: `(dayOfMonth % 30) || 30`
- Each entry has `morning` and `evening` comma-separated psalm lists

---

## Saints Integration

At the end of `renderOffice()`, the app dynamically loads the saints file for the current month:

```javascript
const month = monthNames[monthIndex];
const file = `saints-${month.toLowerCase()}.json`;
```

- Cached in `appData.saints` with `appData.saintsMonth` tracking which month is loaded
- Displays commemorations for the current date below the office

---

## External Module Dependencies

```html
<script src="js/calendar-engine.js"></script>
<script src="js/scripture-resolver.js"></script>
```

**CalendarEngine methods called from index.html:**
- `CalendarEngine.init()`
- `CalendarEngine.fetchLectionaryData(date)`
- `CalendarEngine.getSeasonAndFile(date)`
- `CalendarEngine.getLiturgicalYear(date)`
- `CalendarEngine.changeDate(days)`
- `CalendarEngine.resetDate()`
- `CalendarEngine.getCurrentDate()`

**Scripture resolver called from index.html:**
- `getScriptureText(citation)` — global function from scripture-resolver.js

---

## Known Issues and Limitations

- **Gospel placement fallback:** If `gospelPlacement` is not set, defaults to `'evening'`. This means the Gospel never appears at Morning Prayer unless user explicitly selects it.
- **Antiphon field check:** `renderOffice()` checks for `dailyData.antiphon` (v1 schema) as well as `antiphon_mp`/`antiphon_ep` (v2 schema). Both paths are active.
- **Marian antiphon season matching:** Uses `bcp-marian-antiphon-${season}` — season string must match exactly (`advent`, `christmas`, `epiphany`, `lent`, `easter`, `ordinary`). If season is `null` or undefined, Marian antiphon silently fails.
- **Individual Prayers mode:** Less thoroughly developed than Daily Office mode. Single prayer display is functional but lacks the seasonal theming applied in the office view.

---

## Validation Checklist

Before deploying changes to index.html:

- [ ] All `CalendarEngine.*` calls use correct method names
- [ ] `renderOffice()` guards against null `appData`
- [ ] `saveSettings()` and `loadSettings()` keys are in sync
- [ ] Dark mode toggle applies/removes `dark-mode` class from `body` element
- [ ] Date picker syncs with `currentDate` after navigation
- [ ] No local duplicates of CalendarEngine logic remain
- [ ] `monthNames` constant present and in correct order

---

## Credits and Licensing

**Application:** The Universal Office  
**Architecture:** Claude (Anthropic AI) with user direction  
**Liturgical Source:** 1979 Book of Common Prayer (The Episcopal Church), public domain  
**UI Framework:** Vanilla JavaScript, no external dependencies  

---

**END OF DOCUMENTATION**

*index.html is the UI layer only. For calendar and date logic, see CALENDAR_ENGINE_DOCUMENTATION.md. For scripture fetching, see SCRIPTURE_RESOLVER_DOCUMENTATION.md.*
