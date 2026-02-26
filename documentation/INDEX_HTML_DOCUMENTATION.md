# INDEX.HTML — PRODUCTION DOCUMENTATION

## Overview

This is the single-page application entry point for **The Universal Office**. It serves as the UI layer only — all calendar logic, date calculation, and scripture fetching have been extracted into separate modules. The file handles DOM rendering, user settings, and office output assembly.

**Production Status:** ✅ OPERATIONAL  
**Last Updated:** February 24, 2026  
**Current Line Count:** ~1,175 lines  
**Dependencies:** `js/calendar-engine.js`, `js/calendar-ethiopian.js`, `js/scripture-resolver.js`, `js/office-ui.js`, `js/prayers.js`, `js/tooltip.js`  
**Architecture Role:** UI layer only — no business logic

---

## Application Modes

| Mode | Selector Call | Description |
|---|---|---|
| **Daily Office** | `selectMode('daily')` | Full BCP liturgical office (Morning Prayer, Evening Prayer, Noonday, Compline) with sidebar |
| **Individual Prayers** | `selectMode('prayers')` | Single component lookup and display |
| **Ethiopian Sa'atat** | `selectMode('ethiopian-saatat')` | Ethiopian Orthodox Tewahedo canonical hours — nine watches, time-resolved, Senkessar commemoration, dedicated sidebar |

Mode stored in `selectedMode` variable. Controls which HTML section is visible.

---

## Script Load Order

Scripts must be loaded in this order — `calendar-ethiopian.js` must precede `office-ui.js` because `EthiopianCalendar` is called synchronously within `renderOffice()`:

```html
<script src="js/calendar-engine.js"></script>
<script src="js/calendar-ethiopian.js"></script>
<script src="js/scripture-resolver.js"></script>
<script src="js/office-ui.js"></script>
<script src="js/prayers.js"></script>
<script src="js/tooltip.js"></script>
```

---

## HTML Structure

### Three Main Sections

```
#mode-selection              → Splash screen with mode buttons
#daily-office-section        → Full office layout (sidebar + content) — used by both Daily Office AND Ethiopian Sa'atat
#individual-prayers-section  → Single prayer lookup UI
```

### Mode Selection Buttons

Three buttons on the splash screen, in order:

| Button Label | Class | Action |
|---|---|---|
| The Daily Office | `mode-btn` | `selectMode('daily')` |
| The Book of Needs | `mode-btn` | `selectMode('prayers')` |
| The Ethiopian Sa'atat (Book of Hours) | `ethiopian-btn` | `selectMode('ethiopian-saatat')` |

### Daily Office Layout

```
#sidebar-toggle (fixed 24px vertical strip, z-index 101)
    └── Clicking toggles sidebar visibility

#settings-panel (fixed left sidebar, 300px wide, z-index 100) — BCP ONLY
    ├── Back to Modes button
    ├── Liturgical Ordo (date display + Prev/Today/Next + date picker)
    ├── Time of Day (radio: Morning / Noonday / Evening / Compline)
    ├── Appearance (Dark Mode, BCP Only Mode)
    ├── Liturgical Settings
    │   ├── Language & Rite (Rite I / Rite II)
    │   ├── Officiant (Priest / Layperson)
    │   ├── Creed (Apostles' / Nicene)
    │   └── Lectionary (Gospel placement, 30-Day Psalter)
    ├── Opening Devotions  [id: ecumenical-devotions-section]
    │   ├── Agpeya Opening (Coptic Orthodox)
    │   ├── Prayer of the Hours / Hudra (Church of the East)
    │   └── Marian Element (BCP Antiphon / Theotokion / Both + Before/After position)
    ├── During the Office  [id: during-office-section]
    │   ├── Gloria Patri (after Psalm)
    │   ├── Angelus (Catholic, before Invitatory)
    │   ├── Trisagion (Byzantine, after Absolution)
    │   └── Prayer Before Reading (Orthodox, before OT Lesson)
    └── After the Office  [id: closing-devotions-section]
        ├── The Examen (Ignatian, Compline only)
        ├── Kyrie Pantocrator (Byzantine, after Collect — MP/EP only)
        ├── Suffrages
        ├── The Great Litany
        ├── General Thanksgiving
        └── Prayer of St. Chrysostom

#ethiopian-settings (fixed left sidebar, 300px wide) — ETHIOPIAN SA'ATAT ONLY
    ├── Back to Modes button
    └── [Ethiopian-specific settings — future phases]

#main-content (scrollable, margin-left: 300px; shifts to 24px when sidebar hidden)
    ├── #date-header (liturgical title bar — hidden in Ethiopian Sa'atat mode)
    └── #office-display (rendered office HTML)
```

> **Ethiopian Sa'atat note:** When `selectMode('ethiopian-saatat')` is called, `#daily-office-section` is reused. `#settings-panel` (BCP) is hidden and `#ethiopian-settings` is shown instead. `#sidebar-toggle` remains available. The main `<h1>` header is hidden. The Commemorations footer (`#date-header`, `#saint-display`) is suppressed — all commemoration content is handled inline by the `eth-saints-commemoration` sequence slot via the full Senkessar pipeline.

---

## Sidebar Collapse

A `#sidebar-toggle` strip — 24px wide, full viewport height — sits flush against the right edge of the active sidebar.

- **Visible:** Reads "Settings" in small rotated gold text, positioned at `left: 300px`
- **Collapsed:** Sidebar slides off-screen via `translateX(-300px)`, strip moves to `left: 0`, main content shifts to `margin-left: 24px`
- **Animation:** All transitions `0.3s ease`
- **Z-index:** Toggle strip is `101`, settings panel is `100` — strip always remains clickable

**CSS classes toggled by `toggleSidebar()`:**

| Element | Class Added | Effect |
|---|---|---|
| `#settings-panel` / `#ethiopian-settings` | `sidebar-hidden` | `transform: translateX(-300px); pointer-events: none` |
| `#sidebar-toggle` | `sidebar-hidden` | `left: 0` |
| `#main-content` | `sidebar-hidden` | `margin-left: 24px` |

---

## BCP Only Mode

Toggled by `toggle-bcp-only` checkbox. When enabled:

1. All three ecumenical sidebar sections receive `bcp-only-hidden` CSS class → collapses via `max-height: 0; opacity: 0`
2. These seven ecumenical toggles are force-unchecked: `toggle-angelus`, `toggle-trisagion`, `toggle-east-syriac-hours`, `toggle-agpeya-opening`, `toggle-prayer-before-reading`, `toggle-examen`, `toggle-kyrie-pantocrator`
3. `renderOffice()` is called

When disabled, sections un-collapse but toggles remain unchecked (user re-enables manually).

> **Adding new ecumenical elements:** New toggle IDs must be added to the force-uncheck array in `toggleBcpOnly()`. New section IDs must be added to both the sections array in `toggleBcpOnly()` and the CSS `.bcp-only-hidden` selector block.

> **BCP Only Mode and Ethiopian Sa'atat:** BCP Only mode has no effect on the Sa'atat — the Sa'atat's `#settings-panel` is not visible and all BCP-specific blocks are already suppressed unconditionally via `isEthiopianSaatat`.

---

## CSS Architecture

### CSS Custom Properties (Theming)

| Variable | Light Mode | Dark Mode | Purpose |
|---|---|---|---|
| `--bg-color` | `#f4f1ea` | `#121212` | Page background |
| `--text-color` | `#2c3e50` | `#e0e0e0` | Body text |
| `--container-bg` | `#ffffff` | `#1e1e1e` | Card/panel backgrounds |
| `--accent` | `#8e44ad` | dynamic | Season color (updated by JS) |
| `--gold` | `#d4af37` | `#d4af37` | Headings, borders, UI labels |
| `--sidebar-bg` | `#1a1a1a` | `#000000` | Settings panel background |

### Seasonal Accent Color

`--accent` is updated by `updateSeasonalTheme()` from `dailyData.liturgicalColor`:

| Value | Hex | Season |
|---|---|---|
| `purple` | `#6b3070` | Advent, Lent |
| `rose` | `#a04060` | Gaudete, Laetare Sundays |
| `white` | `#c9a84c` | Christmas, Epiphany, feasts |
| `red` | `#9b2335` | Pentecost, martyrs, Holy Week |
| `green` | `#4a7c59` | Ordinary Time (default) |

### Ethiopian Button Style

`.ethiopian-btn` — distinct from `.mode-btn`:

- Transparent background, `#c9a84c` border and text color
- `font-family: 'Cinzel', serif`, `letter-spacing: 0.14em`, `text-transform: uppercase`
- Hover: `rgba(201, 168, 76, 0.12)` background wash, border and text shift to `#e8d090`

### Ethiopian Rubric Aesthetic (`.ethiopian-theme`)

Applied to `body` when `selectMode('ethiopian-saatat')` is called. Activates the Metsehafe Tselot visual system:

- `.ethiopian-theme .rubric-text` — crimson (`#C0392B`), italic, light-weight, left-barred with `☩` glyph prefix. Overrides BCP small-caps and dotted underline.
- `.ethiopian-theme .component-text` — `font-weight: 500` (heavier than rubric, the dominant voice)
- Design principle: **Red = what you DO (rubric). Black = what you SAY (prayer text).**

### Office Content Typography

- `.rubric-text` — Section headings in small-caps gold. Border-bottom: `0.5px dotted var(--gold)` (BCP theme)
- `.component-text` — Body text of liturgical content
- `.component-text i` — Italic for antiphons and Marian texts
- Examen, Theotokion, and Ethiopian block prayers render in `<div class="component-text">` (not `<span>`) to support paragraph breaks via `white-space:normal`

---

## JavaScript Variables

| Variable | Type | Purpose |
|---|---|---|
| `appData` | Object/null | Loaded `components` + `rubrics` + Senkessar cache after `init()` |
| `currentDate` | Date | Currently displayed date |
| `selectedMode` | String/null | `'daily'`, `'prayers'`, or `'ethiopian-saatat'` |
| `monthNames` | Array | Month name strings for saints file loading |
| `psalterCycle` | Array | 31-entry array for 30-day BCP Psalter |
| `window._forcedOfficeId` | String/undefined | Set to `'ethiopian-saatat'` by `selectMode()` when no radio input exists for that tradition; read by `renderOffice()` |
| `window._temporalOverride` | Object/undefined | Set in browser console to force a specific Ethiopian canonical hour for testing |

---

## Function Reference

### `init()` — async
Bootstraps the app. Fetches `data/rubrics.json`, then concatenates Ethiopian rubrics from `components/traditions/ethiopian/rubrics.json`, then loads all five component shards, calls `CalendarEngine.init()`, and `renderOffice()`.

### `selectMode(mode)` — sync
Accepts `'daily'`, `'prayers'`, or `'ethiopian-saatat'`.

- `'daily'`: shows `#settings-panel`, loads settings, calls `init()` or `renderOffice()`
- `'prayers'`: shows individual prayers section, hides sidebars
- `'ethiopian-saatat'`: reuses `#daily-office-section`, hides `#settings-panel`, shows `#ethiopian-settings`, applies `.ethiopian-theme` to body, hides main `<h1>`, sets `window._forcedOfficeId = 'ethiopian-saatat'`, calls `init()` or `renderOffice()`

### `toggleSidebar()` — sync
Toggles `sidebar-hidden` class on the active panel, the strip, and main content.

### `toggleBcpOnly()` — sync
Collapses/expands ecumenical sidebar sections and force-unchecks ecumenical toggles when enabling BCP Only. Calls `renderOffice()`.

### `renderOffice()` — async
**The core rendering function.** Called on every date or settings change. See `OFFICE_UI_DOCUMENTATION.md` for full execution flow.

---

## Saints Integration

Saints data loaded from `data/saints/saints-{month}.json`. Cached in `appData.saints` / `appData.saintsMonth`.

**BCP offices:** Displays all commemorations for the current date below the office in `#saint-display`.

**Ethiopian Sa'atat:** `#date-header` and `#saint-display` are emptied and hidden. The `eth-saints-commemoration` slot runs the full Senkessar pipeline (Ethiopian calendar date → `senkessar-index.json` → per-day narrative), falling back to an Oriental Orthodox saints filter, then to a generic intercession for the Oriental Orthodox Communion.

---

## External Module Dependencies

**CalendarEngine** (`js/calendar-engine.js`):
- `CalendarEngine.init()`
- `CalendarEngine.fetchLectionaryData(date)`
- `CalendarEngine.getSeasonAndFile(date)`
- `CalendarEngine.getLiturgicalYear(date)`

**EthiopianCalendar** (`js/calendar-ethiopian.js`):
- `EthiopianCalendar.getEthiopianDate(date)` — called in `eth-saints-commemoration` for Senkessar date resolution
- `EthiopianCalendar.formatEthiopianDate(date)` — available for Phase 8.5 Ge'ez date display; not yet wired to UI

**Scripture Resolver** (`js/scripture-resolver.js`):
- `getScriptureText(citation)` — global function

---

## Known Issues and Limitations

- **Gospel placement fallback:** Defaults to `'evening'`. Gospel never appears at Morning Prayer unless user selects it.
- **Antiphon schema support:** Checks both `dailyData.antiphon` (v1) and `antiphon_mp`/`antiphon_ep` (v2). Both paths active.
- **Marian season matching:** Null/undefined season causes silent failure.
- **Ethiopian Sa'atat date navigation:** The Sa'atat has no date controls — it always reflects the current system date and clock. Adding date navigation would require exposing date controls in the `#ethiopian-settings` sidebar.
- **Ethiopian Sa'atat and BCP Only Mode:** The BCP Only toggle has no effect on the Sa'atat view and is not visible there — this is correct behavior.
- **`window._forcedOfficeId` not cleared on `backToSplash()`:** Safe at present. If future development adds mode-to-mode navigation without a page reload, `backToSplash()` must add `window._forcedOfficeId = undefined` and `document.body.classList.remove('ethiopian-theme')`.

---

## Validation Checklist

Before deploying changes to `index.html`:

- [ ] Script load order: `calendar-engine.js` → `calendar-ethiopian.js` → `scripture-resolver.js` → `office-ui.js`
- [ ] All `CalendarEngine.*` calls use correct method names
- [ ] `renderOffice()` guards against null `appData`
- [ ] `saveSettings()` and `loadSettings()` keys are in sync
- [ ] New ecumenical toggles added to `toggleBcpOnly()` force-uncheck array
- [ ] New ecumenical section IDs added to `toggleBcpOnly()` sections array
- [ ] New ecumenical section IDs added to CSS `.bcp-only-hidden` multi-selector
- [ ] Dark mode toggle applies/removes `dark-mode` class from `body`
- [ ] Date picker syncs with `currentDate` after navigation
- [ ] No duplicates of CalendarEngine logic in index.html
- [ ] `monthNames` constant present and correct
- [ ] `#ethiopian-settings` panel present in DOM; shown by `selectMode('ethiopian-saatat')`, hidden otherwise
- [ ] `.ethiopian-theme` class removed from `body` in `backToSplash()`
- [ ] `window._forcedOfficeId` cleared in `backToSplash()` if Sa'atat navigation without page reload is ever added

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| 6.4 | ✅ Complete | Ecumenical devotions with positional placement |
| 6.5 | ✅ Complete | Modularization — office-ui.js extracted from index.html |
| 7.1 | ✅ Complete | Ethiopian Sa'atat entry point, Nigatu/Matins hour, mode isolation |
| 7.2 | ✅ Complete | Mese'rk and Lika hours; UI polish |
| 7.3 | ✅ Complete | Full 24-hour cycle (Tese'at, Serkh, Nime, Le'lit, Mahlet); saints preload fix; Commemorations header guard |
| 7.4 | ✅ Complete | `js/calendar-ethiopian.js` added to script load order; `EthiopianCalendar` available globally |
| 8.1–8.2 | ✅ Complete | Senkessar pipeline fully operational; all 13 months complete |
| v2.6.1 | ✅ Complete | Tselote Meweta, Metsehafe Tselot CSS, Sixth Hour sentence, legibility fixes |
| 8.5 | 📋 Planned | Ge'ez date display in Sa'atat UI — `formatEthiopianDate()` ready; requires UI element in `#ethiopian-settings` or header |
| 7.5 | 📋 Planned | Coptic Agpeya as standalone tradition entry point |
| 9.0 | 📋 Planned | Mobile app |

---

## Credits

**Application:** The Universal Office  
**Liturgical Source:** 1979 Book of Common Prayer (The Episcopal Church), public domain  
**Ethiopian Liturgical Source:** Ethiopian Orthodox Tewahedo Sa'atat (Book of Hours)  
**UI Framework:** Vanilla JavaScript, no external dependencies

---

*For office rendering logic see `OFFICE_UI_DOCUMENTATION.md`. For calendar and date logic see `CALENDAR_ENGINE_DOCUMENTATION.md`. For scripture fetching see `SCRIPTURE_RESOLVER_DOCUMENTATION.md`. For Ethiopian Sa'atat architecture see `ETHIOPIAN_SAATAT_DOCUMENTATION.md`.*