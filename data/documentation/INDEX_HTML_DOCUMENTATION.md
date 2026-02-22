# INDEX.HTML — PRODUCTION DOCUMENTATION

## Overview

This is the single-page application entry point for **The Universal Office**. It serves as the UI layer only — all calendar logic, date calculation, and scripture fetching have been extracted into separate modules. The file handles DOM rendering, user settings, and office output assembly.

**Production Status:** ✅ OPERATIONAL  
**Last Updated:** February 22, 2026  
**Current Line Count:** ~1,175 lines  
**Dependencies:** `js/calendar-engine.js`, `js/scripture-resolver.js`, `js/office-ui.js`, `js/prayers.js`, `js/tooltip.js`  
**Architecture Role:** UI layer only — no business logic

---

## Application Modes

| Mode | Selector Call | Description |
|---|---|---|
| **Daily Office** | `selectMode('daily')` | Full BCP liturgical office (Morning Prayer, Evening Prayer, Noonday, Compline) with sidebar |
| **Individual Prayers** | `selectMode('prayers')` | Single component lookup and display |
| **Ethiopian Sa'atat** | `selectMode('ethiopian-saatat')` | Ethiopian Orthodox Tewahedo canonical hours — full-screen, no sidebar, time-resolved |

Mode stored in `selectedMode` variable. Controls which HTML section is visible.

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

#settings-panel (fixed left sidebar, 300px wide, z-index 100)
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

#main-content (scrollable, margin-left: 300px; shifts to 24px when sidebar hidden)
    ├── #date-header (liturgical title bar — hidden in Ethiopian Sa'atat mode)
    └── #office-display (rendered office HTML)
```

> **Ethiopian Sa'atat note:** When `selectMode('ethiopian-saatat')` is called, `#daily-office-section` is reused but `#sidebar-toggle` and `#settings-panel` are hidden. The main `<h1>` header is hidden. The Commemorations footer (`#date-header`, `#saint-display`) is suppressed — all saint rendering is handled inline by the `eth-saints-commemoration` sequence slot.

---

## Sidebar Collapse

A `#sidebar-toggle` strip — 24px wide, full viewport height — sits flush against the right edge of the sidebar.

- **Visible:** Reads "Settings" in small rotated gold text, positioned at `left: 300px`
- **Collapsed:** Sidebar slides off-screen via `translateX(-300px)`, strip moves to `left: 0`, main content shifts to `margin-left: 24px`
- **Animation:** All transitions `0.3s ease`
- **Z-index:** Toggle strip is `101`, settings panel is `100` — strip always remains clickable

**CSS classes toggled by `toggleSidebar()`:**

| Element | Class Added | Effect |
|---|---|---|
| `#settings-panel` | `sidebar-hidden` | `transform: translateX(-300px); pointer-events: none` |
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

> **BCP Only Mode and Ethiopian Sa'atat:** The BCP Only mode has no effect on the Sa'atat — the Sa'atat has no sidebar and all BCP-specific blocks are already suppressed unconditionally via `isEthiopianSaatat`.

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

### Office Content Typography

- `.rubric-text` — Section headings in small-caps gold. Border-bottom: `0.5px dotted var(--gold)`
- `.component-text` — Body text of liturgical content (used on `<span>` elements)
- `.component-text i` — Italic for antiphons and Marian texts
- Examen and block prayers render in a `<div class="component-text">` (not span) to support paragraph breaks

---

## JavaScript Variables

| Variable | Type | Purpose |
|---|---|---|
| `appData` | Object/null | Loaded `components` + `rubrics` after `init()` |
| `currentDate` | Date | Currently displayed date |
| `selectedMode` | String/null | `'daily'`, `'prayers'`, or `'ethiopian-saatat'` |
| `monthNames` | Array | Month name strings for saints file loading |
| `psalterCycle` | Array | 31-entry array for 30-day BCP Psalter |
| `window._forcedOfficeId` | String/undefined | Set to `'ethiopian-saatat'` by `selectMode()` when no radio input exists for that tradition; read by `renderOffice()` |

---

## Function Reference

### `init()` — async
Bootstraps the app. Fetches `data/rubrics.json`, then concatenates Ethiopian rubrics from `components/traditions/ethiopian/rubrics.json`, then loads all five component shards, calls `CalendarEngine.init()`, and `renderOffice()`.

### `selectMode(mode)` — sync
Accepts `'daily'`, `'prayers'`, or `'ethiopian-saatat'`.

- `'daily'`: shows sidebar, loads settings, calls `init()` or `renderOffice()`
- `'prayers'`: shows individual prayers section, hides sidebar
- `'ethiopian-saatat'`: reuses `#daily-office-section`, hides sidebar and settings, applies `.ethiopian-theme` to body, hides main `<h1>`, sets `window._forcedOfficeId = 'ethiopian-saatat'`, calls `init()` or `renderOffice()`

### `toggleSidebar()` — sync
Toggles `sidebar-hidden` class on panel, strip, and main content.

### `toggleBcpOnly()` — sync
Collapses/expands ecumenical sidebar sections and force-unchecks ecumenical toggles when enabling BCP Only. Calls `renderOffice()`.

### `renderOffice()` — async
**The core rendering function.** Called on every date or settings change. See `OFFICE_UI_DOCUMENTATION.md` for full execution flow.

---

## Saints Integration

Saints data loaded from `data/saints/saints-{month}.json`. Cached in `appData.saints` / `appData.saintsMonth`.

**BCP offices:** Displays all commemorations for the current date below the office in `#saint-display`.

**Ethiopian Sa'atat:** `#date-header` and `#saint-display` are both emptied and hidden. Saints filtering is handled inline within the `eth-saints-commemoration` sequence slot — only saints with `tradition` containing `'ethiopian'` or `'oriental'` are shown; if none, a generic intercession for the Oriental Orthodox Communion is rendered.

---

## External Module Dependencies

**CalendarEngine** (`js/calendar-engine.js`):
- `CalendarEngine.init()`
- `CalendarEngine.fetchLectionaryData(date)`
- `CalendarEngine.getSeasonAndFile(date)`
- `CalendarEngine.getLiturgicalYear(date)`

**Scripture Resolver** (`js/scripture-resolver.js`):
- `getScriptureText(citation)` — global function

---

## Known Issues and Limitations

- **Gospel placement fallback:** Defaults to `'evening'`. Gospel never appears at Morning Prayer unless user selects it.
- **Antiphon schema support:** Checks both `dailyData.antiphon` (v1) and `antiphon_mp`/`antiphon_ep` (v2). Both paths active.
- **Marian season matching:** Null/undefined season causes silent failure.
- **Ethiopian Sa'atat date navigation:** The Sa'atat has no date controls — it always reflects the current system date and clock. Adding date navigation would require exposing date controls in the Sa'atat layout.
- **Ethiopian Sa'atat and BCP Only Mode:** The BCP Only toggle has no effect on the Sa'atat view and is not visible there — this is correct behavior.

---

## Validation Checklist

Before deploying changes to `index.html`:

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
- [ ] `window._forcedOfficeId` cleared in `backToSplash()` if Ethiopian Sa'atat navigation is added
- [ ] `.ethiopian-theme` class removed from `body` in `backToSplash()`

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| 6.4 | ✅ Complete | Ecumenical devotions with positional placement |
| 6.5 | ✅ Complete | Modularization — office-ui.js extracted from index.html |
| 7.1 | ✅ Complete | Ethiopian Sa'atat entry point, Tuat hour, mode isolation |
| 7.2 | ✅ Complete | Meserkh and Liku hours; UI polish |
| 7.3 | ✅ Complete | Full 24-hour cycle (Serkh, Nimeat, Lelit); saints preload fix; Commemorations header guard |
| 7.4 | 📋 Planned | Ethiopian liturgical calendar (Ge'ez date display, fasting seasons) |
| 7.5 | 📋 Planned | Coptic Agpeya as standalone tradition entry point |
| 8.0 | 📋 Planned | Mobile app |

---

## Credits

**Application:** The Universal Office  
**Liturgical Source:** 1979 Book of Common Prayer (The Episcopal Church), public domain  
**Ethiopian Liturgical Source:** Ethiopian Orthodox Tewahedo Sa'atat (Book of Hours)  
**UI Framework:** Vanilla JavaScript, no external dependencies  

---

*For office rendering logic see `OFFICE_UI_DOCUMENTATION.md`. For calendar and date logic see `CALENDAR_ENGINE_DOCUMENTATION.md`. For scripture fetching see `SCRIPTURE_RESOLVER_DOCUMENTATION.md`. For Ethiopian Sa'atat architecture see `ETHIOPIAN_SAATAT_DOCUMENTATION.md`.*