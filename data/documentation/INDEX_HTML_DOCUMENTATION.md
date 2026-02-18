# INDEX.HTML — PRODUCTION DOCUMENTATION

## Overview

This is the single-page application entry point for **The Universal Office**. It serves as the UI layer only — all calendar logic, date calculation, and scripture fetching have been extracted into separate modules. The file handles DOM rendering, user settings, and office output assembly.

**Production Status:** ✅ OPERATIONAL  
**Last Updated:** February 2026  
**Current Line Count:** ~1,151 lines  
**Dependencies:** `js/calendar-engine.js`, `js/scripture-resolver.js`, `data/components.json`, `data/rubrics.json`  
**Architecture Role:** UI layer only — no business logic

---

## Application Modes

| Mode | Description |
|---|---|
| **Daily Office** | Full liturgical office (Morning Prayer, Evening Prayer, Noonday, Compline) |
| **Individual Prayers** | Single component lookup and display |

Mode stored in `selectedMode` variable. Controls which HTML section is visible.

---

## HTML Structure

### Three Main Sections

```
#mode-selection              → Splash screen with mode buttons
#daily-office-section        → Full office layout (sidebar + content)
#individual-prayers-section  → Single prayer lookup UI
```

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
    ├── #date-header (liturgical title bar)
    └── #office-display (rendered office HTML)
```

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

> **Adding new ecumenical elements:** New toggle IDs must be added to the force-uncheck array in `toggleBcpOnly()`. New section IDs must be added to both the sections array in `toggleBcpOnly()` and the CSS `.bcp-only-hidden` selector block (currently lines 16–24 of the `<style>` block).

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
| `purple` | `#8e44ad` | Advent, Lent |
| `rose` | `#e74c3c` | Gaudete, Laetare Sundays |
| `white` | `#f0f0f0` | Christmas, Epiphany, feasts |
| `red` | `#c0392b` | Pentecost, martyrs, Holy Week |
| `green` | `#27ae60` | Ordinary Time (default) |

### Office Content Typography

- `.rubric-text` — Section headings in small-caps gold. Border-bottom: `0.5px dotted var(--gold)`
- `.component-text` — Body text of liturgical content (used on `<span>` elements)
- `.component-text i` — Italic for antiphons and Marian texts
- Examen renders in a `<div class="component-text">` (not span) to support paragraph breaks

### Gold Lines

Horizontal dividers between readings are injected inline:
```javascript
officeHtml += '<br><hr style="border: 0; border-top: 0.5px solid var(--gold); margin: 10px 0;">';
```
Intentionally hairline (`0.5px`). The scrollbar thumb is `rgba(212, 175, 55, 0.3)` at 4px wide.

---

## JavaScript Variables

| Variable | Type | Purpose |
|---|---|---|
| `appData` | Object/null | Loaded `components` + `rubrics` after `init()` |
| `currentDate` | Date | Currently displayed date |
| `selectedMode` | String/null | `'daily'` or `'individual'` |
| `monthNames` | Array | Month name strings for saints file loading |
| `psalterCycle` | Array | 31-entry array for 30-day BCP Psalter |

---

## Function Reference

### `init()` — async
Bootstraps the app. Fetches `components.json` and `rubrics.json` in parallel, calls `CalendarEngine.init()`, calls `loadSettings()`, pre-warms the lectionary cache.

### `selectMode(mode)` — sync
Shows the appropriate section for `'daily'` or `'individual'` mode.

### `toggleSidebar()` — sync
Toggles `sidebar-hidden` class on panel, strip, and main content.

### `toggleBcpOnly()` — sync
Collapses/expands ecumenical sidebar sections and force-unchecks ecumenical toggles when enabling BCP Only. Calls `renderOffice()`.

### `renderOffice()` — async
**The core rendering function.** Called on every date or settings change.

**Execution flow:**
1. Guard: return if `appData` not loaded
2. Read all settings from DOM
3. Get season via `CalendarEngine.getSeasonAndFile(currentDate)`
4. Fetch daily data via `CalendarEngine.fetchLectionaryData(currentDate)`
5. Update calendar title and seasonal accent color
6. Determine reading distribution by office (Morning/Evening/Noonday/Compline)
7. Get liturgical year via `CalendarEngine.getLiturgicalYear(currentDate)`
8. Select year-track readings (`reading_ot_mp_year1` vs `reading_ot_mp_year2`)
9. Render **pre-office** ecumenical devotions (Agpeya, Prayer of Hours, Marian if `before`)
10. Walk `activeRubric.sequence` array — for each item:
    - Capture `const originalItem = item` before slot resolution
    - Resolve slot IDs and `[rite]` placeholders into `compId`
    - Inject ecumenical elements at their trigger positions (see table below)
    - Fetch scripture via `getScriptureText()` for VARIABLE_ reading items
    - Look up component in `appData.components` by `compId`
11. Render **post-office** Marian element if position = `after`
12. Set `#office-display.innerHTML`
13. Load saints data for current month if not cached

**Reading priority:**
```javascript
dailyData[`reading_ot_mp_${litYear}`]  // year-specific first
dailyData['reading_ot']                 // fallback
```

### `updateSeasonalTheme(color)` — sync
Updates `--accent` CSS variable from `dailyData.liturgicalColor`.

### `changeDate(days)` / `resetDate()` / `setCustomDate(dateStr)` — sync
Date navigation. All update `currentDate` and call `renderOffice()`.

### `updateUI()` — sync
Applies/removes `dark-mode` class from `body`.

### `saveSettings()` — sync
Persists all settings to `localStorage` under key `universalOfficeSettings`.

### `loadSettings()` — sync
Restores settings from localStorage during `init()`. Silent fail if unavailable.

### `showSinglePrayer()` / `backToPrayerDropdown()` / `backToSplash()` — sync
Navigation helpers for Individual Prayers mode and splash screen.

---

## Persisted Settings (`saveSettings` / `loadSettings`)

| Key | Default | Notes |
|---|---|---|
| `darkMode` | `false` | |
| `bcpOnly` | `false` | BCP Only Mode |
| `officeTime` | `morning-office` | |
| `rite` | `rite2` | `rite1` or `rite2` |
| `minister` | `lay` | `lay` or `priest` |
| `marianElement` | `none` | `none` / `antiphon` / `theotokion` / `both` |
| `marianPos` | `before` | `before` or `after` |
| `gloriaPatri` | `false` | |
| `angelus` | `false` | |
| `trisagion` | `false` | |
| `eastSyriacHours` | `false` | Prayer of the Hours (Hudra) |
| `agpeyaOpening` | `false` | |
| `creedType` | `bcp-creed-apostles` | component ID |
| `gospelPlacement` | `evening` | `morning` / `evening` / `both` |
| `litany` | `false` | |
| `suffrages` | `false` | |
| `psalter30Day` | `false` | |
| `generalThanksgiving` | `false` | |
| `chrysostom` | `false` | |
| `prayerBeforeReading` | `false` | Orthodox epiklesis before OT Lesson |
| `examen` | `false` | Ignatian Examen, Compline only |
| `kyriePantocrator` | `false` | Byzantine Kyrie after Collect, MP/EP only |

---

## Rubric Sequence Resolution

### Slot Placeholders

| Slot ID | Resolves To |
|---|---|
| `bcp-absolution-slot` | `bcp-absolution-{r1|r2}-{priest|lay}` |
| `bcp-creed-slot` | `bcp-creed-apostles` or `bcp-creed-nicene` |
| `bcp-suffrages-slot` | `bcp-suffrages-rite1` or `bcp-suffrages-rite2` (skipped if unchecked) |
| `bcp-great-litany-slot` | `bcp-litany` (skipped if unchecked) |

### Variable Placeholders

| Placeholder | Resolved Content |
|---|---|
| `VARIABLE_OPENING` | Seasonal opening sentence |
| `VARIABLE_PSALM` | Psalm text (lectionary or 30-day psalter) |
| `VARIABLE_READING_OT` | Old Testament reading |
| `VARIABLE_READING_EPISTLE` | Epistle reading |
| `VARIABLE_READING_GOSPEL` | Gospel reading |
| `VARIABLE_COLLECT` | Daily collect (`collectComp`, not `comp`) |
| `VARIABLE_WEEKDAY_COLLECT` | `bcp-collect-grace` (MP) or `bcp-collect-peace` (EP) |
| `VARIABLE_ANTIPHON` | Seasonal antiphon |
| `VARIABLE_MISSION_PRAYER` | `bcp-mission-prayer-1` |

> **`VARIABLE_COLLECT` variable naming:** This handler uses `collectComp` instead of `comp` to avoid redeclaration conflict with the generic `let comp` at the bottom of the loop. All other handlers use `const comp` within their own block scope (each ends with `continue`).

---

## Ecumenical Devotions — Render Order

All ecumenical elements are suppressed in BCP Only Mode. Each fires only if its toggle is checked.

### Pre-Office (before rubric loop)

| # | Element | Component ID | Toggle |
|---|---|---|---|
| 1 | Agpeya Opening | `agpeya-opening` | `toggle-agpeya-opening` |
| 2 | Prayer of the Hours | `east-syriac-prayer-of-hours` | `toggle-east-syriac-hours` |
| 3 | Marian Antiphon and/or Theotokion | `bcp-marian-antiphon-{season}` / `coptic-theotokion-{season}` | `marian-element` ≠ none, position = `before` |

### During the Rubric Loop

| Trigger | Element | Component ID | Toggle / Gate |
|---|---|---|---|
| After `bcp-absolution-slot` renders | Trisagion | `trisagion-byzantine` | `toggle-trisagion` |
| Before `bcp-invitatory-full` renders | Angelus | `angelus` | `toggle-angelus`, not Compline |
| Inside `VARIABLE_PSALM`, after psalm renders | Gloria Patri | `bcp-gloria-patri` | `toggle-gloria-patri` |
| Inside `VARIABLE_READING_OT`, before lesson text | Prayer Before Reading | `orthodox-prayer-before-reading` | `toggle-prayer-before-reading` |

### Post-Collect (inside VARIABLE_COLLECT handler)

Rendered after collect text and `<hr>` divider, before `continue`:

| Element | Component ID | Gate |
|---|---|---|
| The Examen | `ignatian-examen` | `toggle-examen` AND `isCompline` |
| Kyrie Pantocrator | `eastern-kyrie-pantocrator` | `toggle-kyrie-pantocrator` AND `!isCompline && !isNoonday` |

### Post-Office (after rubric loop)

| Element | Gate |
|---|---|
| Marian Antiphon / Theotokion | `marian-element` ≠ none AND position = `after` |

### Examen Rendering Note

The `ignatian-examen` text uses `\n\n` paragraph breaks. These are converted before injection:
```javascript
const examenHtml = examenComp.text.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
officeHtml += `<span class="rubric-text">The Examen</span><div class="component-text" style="white-space:normal;">${examenHtml}</div>`;
```

---

## Psalm Handling

**Lectionary Psalms (default):** From `dailyData.psalms_mp` / `dailyData.psalms_ep`, fetched via `getScriptureText()`.

**30-Day BCP Psalter:** Enabled by `toggle-30day-psalter`. Uses `psalterCycle` array (31 entries). Formula: `(dayOfMonth % 30) || 30`. Each entry has `morning` and `evening` comma-separated psalm lists.

---

## Marian Element

| Value | Renders |
|---|---|
| `none` | Nothing |
| `antiphon` | BCP seasonal antiphon (`bcp-marian-antiphon-{season}`) |
| `theotokion` | Coptic Theotokion (`coptic-theotokion-{season}`) |
| `both` | Both |

Position: `before` or `after` the office body. Season must exactly match: `advent`, `christmas`, `epiphany`, `lent`, `easter`, `ordinary`.

---

## Saints Integration

```javascript
const month = monthNames[monthIndex];
const file = `saints-${month.toLowerCase()}.json`;
```

Cached in `appData.saints` / `appData.saintsMonth`. Displays commemorations for the current date below the office.

---

## External Module Dependencies

**CalendarEngine** (`js/calendar-engine.js`):
- `CalendarEngine.init()`
- `CalendarEngine.fetchLectionaryData(date)`
- `CalendarEngine.getSeasonAndFile(date)`
- `CalendarEngine.getLiturgicalYear(date)`
- `CalendarEngine.changeDate(days)`
- `CalendarEngine.resetDate()`
- `CalendarEngine.getCurrentDate()`

**Scripture Resolver** (`js/scripture-resolver.js`):
- `getScriptureText(citation)` — global function

---

## Components Referenced in Render Logic

`data/components.json` holds 227 components. Key IDs referenced directly:

| Component ID | Purpose |
|---|---|
| `agpeya-opening` | Pre-office Agpeya block |
| `east-syriac-prayer-of-hours` | Pre-office Prayer of the Hours |
| `bcp-marian-antiphon-{season}` | Marian Antiphon (6 variants) |
| `coptic-theotokion-{season}` | Coptic Theotokion (season variants) |
| `angelus` | Angelus (Catholic) |
| `trisagion-byzantine` | Trisagion (Byzantine) |
| `orthodox-prayer-before-reading` | Prayer Before Reading |
| `ignatian-examen` | The Examen |
| `eastern-kyrie-pantocrator` | Kyrie Pantocrator |
| `bcp-gloria-patri` | Gloria Patri |
| `bcp-phos-hilaron` | Phos Hilaron (EP) |
| `bcp-lords-prayer` | Lord's Prayer |
| `bcp-kyrie` | Kyrie (Western) |
| `bcp-salutation` | Salutation |
| `bcp-nunc-dimittis` | Nunc Dimittis (Compline) |
| `bcp-general-thanksgiving` | General Thanksgiving |
| `bcp-chrysostom` | Prayer of St. Chrysostom |
| `bcp-litany` | The Great Litany |
| `bcp-closing` | Closing blessing |

---

## Known Issues and Limitations

- **Gospel placement fallback:** Defaults to `'evening'`. Gospel never appears at Morning Prayer unless user selects it.
- **Antiphon schema support:** Checks both `dailyData.antiphon` (v1) and `antiphon_mp`/`antiphon_ep` (v2). Both paths active.
- **Marian season matching:** Null/undefined season causes silent failure.
- **Examen toggle visibility:** Toggle is visible at all offices but only renders at Compline. No UI feedback explains the gate.
- **Kyrie Pantocrator toggle visibility:** Toggle visible at all offices but only renders at MP/EP. Noonday and Compline excluded.
- **Individual Prayers mode:** Functional but less developed. Lacks seasonal theming.

---

## Validation Checklist

Before deploying changes to `index.html`:

- [ ] All `CalendarEngine.*` calls use correct method names
- [ ] `renderOffice()` guards against null `appData`
- [ ] `saveSettings()` and `loadSettings()` keys are in sync
- [ ] New ecumenical toggles added to `toggleBcpOnly()` force-uncheck array
- [ ] New ecumenical section IDs added to `toggleBcpOnly()` sections array
- [ ] New ecumenical section IDs added to CSS `.bcp-only-hidden` multi-selector (lines 16–24 of `<style>`)
- [ ] Dark mode toggle applies/removes `dark-mode` class from `body`
- [ ] Date picker syncs with `currentDate` after navigation
- [ ] No duplicates of CalendarEngine logic in index.html
- [ ] `monthNames` constant present and correct
- [ ] VARIABLE_COLLECT handler uses `collectComp` (not `comp`)
- [ ] All other `const comp` declarations are inside block-scoped `if (...) { ... continue; }` blocks

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| 6.4 | ✅ Complete | Ecumenical devotions with positional placement |
| 6.5 | ⏳ Pending | Performance and polish |
| 7.0 | 📋 Planned | Full Eastern canonical hours |

**Phase 7.0 traditions:** Byzantine Orthodox, Coptic Agpeya, Church of the East (Hudra), Ethiopian/Eritrean (Ge'ez). Architecture: separate rubric files per tradition, same component lookup system, expanded mode selector on splash screen.

---

## Credits

**Application:** The Universal Office  
**Liturgical Source:** 1979 Book of Common Prayer (The Episcopal Church), public domain  
**UI Framework:** Vanilla JavaScript, no external dependencies  

---

*For calendar and date logic see `CALENDAR_ENGINE_DOCUMENTATION.md`. For scripture fetching see `SCRIPTURE_RESOLVER_DOCUMENTATION.md`.*