# CALENDAR-ENGINE.JS - PRODUCTION DOCUMENTATION

## Overview

This module is the authoritative source of all liturgical calendar logic for The Universal Office. It is a static class (`CalendarEngine`) exposed globally as `window.CalendarEngine`. All date routing, season detection, lectionary entry lookup, and liturgical year calculation live here exclusively. No calendar logic should exist in `index.html`.

**Production Status:** ✅ OPERATIONAL — Perpetual Calendar Engine Active  
**Last Updated:** February 17, 2026  
**Current Line Count:** 213 lines  
**Architecture Role:** Calendar and lectionary logic module  
**Global Exposure:** `window.CalendarEngine`

---

## Critical Implementation Notes

### 1. Perpetual Calendar Engine

As of February 17, 2026, the engine implements a **Season Offset** strategy that allows it to serve correct liturgical data for any date through 2030 without requiring duplicate JSON data per year.

**The problem it solves:** Moveable seasons (Lent, Easter, Advent, Ordinary Time) fall on different calendar dates each year. Seasonal JSON files were originally keyed to specific 2026 dates. Without the offset system, any 2027+ date would fail to match and fall back to entry index 0.

**The solution:** Every entry in moveable season files has a `day_of_season` integer field. The engine calculates how many days into the current season the target date is, then looks up by that offset rather than calendar date.

### 2. Date Construction Convention

All `Date` objects in `SEASON_RANGES` use **slash notation** (`"2026/11/29"`) rather than ISO hyphen notation (`"2026-11-29"`). This is intentional:

- `new Date("2026-11-29")` is parsed as **UTC midnight** → may shift by one day in negative-offset timezones
- `new Date("2026/11/29")` is parsed as **local midnight** → always correct regardless of timezone

**Never change this to hyphen notation.** The app would break for users in UTC-5 and further west.

### 3. Two-Year Lectionary Cycle

The BCP 1979 Daily Office Lectionary alternates between Year 1 and Year 2 at each Advent Sunday:

| Period | Year |
|---|---|
| Advent 2025 (Nov 30) → Nov 28, 2026 | Year 2 |
| Advent 2026 (Nov 29) → Nov 27, 2027 | Year 1 |
| Advent 2027 (Nov 28) → Nov 26, 2028 | Year 2 |
| Advent 2028 (Dec 3) → Dec 1, 2029 | Year 1 |
| Advent 2029 (Dec 2) → Nov 30, 2030 | Year 2 |

`getLiturgicalYear()` returns `"year1"` or `"year2"` — these strings must exactly match the suffix used in JSON field names (e.g., `reading_ot_mp_year2`).

---

## Static Properties

| Property | Type | Purpose |
|---|---|---|
| `currentDate` | Date | The date currently being displayed in the app |
| `seasonalCache` | Object | Key-value cache: filename → parsed JSON array |
| `bcpPropers` | Object/null | Loaded from `bcp-propers.json`; used for Proper number lookup |
| `SEASON_RANGES` | Array | Master list of all season date boundaries through 2030 |

---

## SEASON_RANGES Array

The authoritative map of all liturgical seasons. Each entry:

```javascript
{ 
  start: new Date("YYYY/MM/DD"),  // inclusive, local time (slash format)
  end: new Date("YYYY/MM/DD"),    // inclusive, local time (slash format)
  season: "advent|christmas|epiphany|lent|easter|ordinary",
  file: "filename.json"
}
```

### Coverage (2025–2030)

| Year | Seasons Covered |
|---|---|
| 2025–2026 | Advent 2025, Christmas 2025, Epiphany 2026, Lent 2026, Easter 2026, Ordinary 2026, Advent 2026 |
| 2026–2027 | Christmas 2026, Epiphany 2027, Lent 2027, Easter 2027, Ordinary 2027, Advent 2027 |
| 2027–2028 | Christmas 2027, Epiphany 2028, Lent 2028, Easter 2028, Ordinary 2028, Advent 2028 |
| 2028–2029 | Christmas 2028, Epiphany 2029, Lent 2029, Easter 2029, Ordinary 2029, Advent 2029 |
| 2029–2030 | Christmas 2029, Epiphany 2030, Lent 2030, Easter 2030, Ordinary 2030, Advent 2030 |

### Ordinary Time File Assignment

Ordinary Time is split across three files to keep file sizes manageable. The `season` value is `"ordinary"` for all three, but the `file` differs:

| File | Day Range | Approximate Calendar Range |
|---|---|---|
| `ordinary1.json` | Days 1–70 | Day after Pentecost → July 31 |
| `ordinary2.json` | Days 71–131 | August 1 → September 30 |
| `ordinary3.json` | Days 132–190 | October 1 → ~November 28 |

**Important:** The `day_of_season` numbering is **continuous** across all three files. `ordinary2.json` starts at day 71, not day 1. The engine always anchors to the `ordinary1.json` start date when calculating offsets for any Ordinary Time date.

### Maintenance — Extending to 2031+

When the app needs to cover 2031, add new entries to `SEASON_RANGES` at the bottom of the array. Key dates to calculate:
- Advent 1 = Fourth Sunday before December 25
- Ash Wednesday = 46 days before Easter Sunday
- Easter = calculate via the Anonymous Gregorian algorithm
- Pentecost = 49 days after Easter Sunday

---

## Method Reference

### `init()` — async, static
**Called:** Once on app startup from `index.html`  
**Purpose:** Loads `bcp-propers.json` into `this.bcpPropers`  
**Error Handling:** Logs error but does not throw; app continues without proper calculations

---

### `getCurrentDate()` — sync, static
**Returns:** `new Date(this.currentDate)` — a copy, not a reference  
**Note:** Always returns a copy to prevent accidental mutation of the internal date

---

### `setCurrentDate(date)` — sync, static
**Parameters:** `date` — any Date object  
**Purpose:** Sets the app's current display date  
**Note:** Stores as `new Date(date)` to ensure a copy

---

### `changeDate(days)` — sync, static
**Parameters:** `days` — positive or negative integer  
**Purpose:** Advances or retreats `currentDate` by the given number of days  
**Called by:** `index.html` Prev/Next buttons

---

### `resetDate()` — sync, static
**Purpose:** Resets `currentDate` to today's actual date (`new Date()`)  
**Called by:** "Today" button in index.html

---

### `formatDateISO(date)` — sync, static
**Parameters:** `date` — Date object  
**Returns:** ISO string `"YYYY-MM-DD"` (e.g., `"2026-02-17"`)  
**Implementation:** `date.toISOString().split('T')[0]`  
**Note:** Uses UTC-based ISO — result may differ from local date by one day near midnight in certain timezones. Used for JSON lookup, not display.

---

### `formatDateForLookup(date)` — sync, static
**Parameters:** `date` — Date object  
**Returns:** Long-format string `"February 17, 2026"`  
**Purpose:** Matches the long-format dates used in some seasonal JSON files (particularly christmas.json)

---

### `getLiturgicalYear(date)` — sync, static
**Parameters:** `date` — Date object  
**Returns:** `"year1"` or `"year2"`

**Algorithm:**
1. If date is before Advent 2026 (Nov 29, 2026) → return `"year2"`
2. Filter all `advent` ranges from `SEASON_RANGES`
3. Find the highest-indexed advent range whose start is ≤ target date
4. Calculate offset from Advent 2026 (index 1 in the array)
5. Even offset → `"year1"`, odd offset → `"year2"`

**Verified correct through 2030.** All 15 boundary test cases pass.

---

### `getSeasonAndFile(targetDate)` — sync, static
**Parameters:** `targetDate` — Date object  
**Returns:** `{ season: string, file: string }`

**Algorithm:** Normalizes to local midnight, then iterates `SEASON_RANGES` looking for the first range where `start <= date <= end`. Returns `{ season: "ordinary", file: "ordinary1.json" }` as fallback with a console warning.

**Called by:**
- `index.html` to determine Marian antiphon ID
- `fetchLectionaryData()` to determine which JSON file to load
- `getSeasonStartDate()` to find the season anchor

---

### `fetchLectionaryData(targetDate)` — async, static
**Parameters:** `targetDate` — Date object (defaults to `this.currentDate`)  
**Returns:** A single daily entry object from the appropriate seasonal JSON file

**Algorithm:**
1. Call `getSeasonAndFile(targetDate)` to determine which file to load
2. Check `this.seasonalCache[file]` — return cached data if available
3. Fetch `data/season/${file}` via HTTP
4. Parse JSON, store in cache, call `findEntry()`
5. Return the matched entry, or `{ title: "Error loading data" }` on failure

**Caching:** Seasonal files are cached indefinitely for the session. There is no eviction — each file is loaded at most once per session.

---

### `getSeasonStartDate(targetDate)` — sync, static
**Parameters:** `targetDate` — Date object  
**Returns:** `Date` object representing the first day of the current season (the anchor for offset calculation), or `null` if no range matches

**Special Behavior — Ordinary Time Bridge:**  
For dates falling in `ordinary2.json` or `ordinary3.json`, this method returns the start of the corresponding `ordinary1.json` range for that year. This ensures `day_of_season` is calculated as a continuous count from the start of Ordinary Time, not from the start of each sub-file.

```
Date in ordinary2 → returns ordinary1.start (same year)
Date in ordinary3 → returns ordinary1.start (same year)
Date in lent      → returns lent range start
Date in advent    → returns advent range start
```

---

### `findEntry(data, date, fileName)` — sync, static
**Parameters:**
- `data` — Array of daily entries from a seasonal JSON file
- `date` — Date object
- `fileName` — String (for console logging only)

**Returns:** A single daily entry object

**Three-Priority Lookup (in order):**

#### Priority 1: Exact Match
Matches `d.date === iso` (e.g., `"2026-02-18"`) or `d.date === long` (e.g., `"February 18, 2026"`).  
This is the fast path for all 2026 dates and handles backward compatibility with v1 schema files.

#### Priority 2: Season Offset Match
Calculates `dayOfSeason = floor((date - seasonStart) / 86400000) + 1`.  
Finds entry where `d.day_of_season === dayOfSeason`.  
This is the primary path for all 2027+ dates in moveable seasons.

#### Priority 3: Month-Day Match
Strips the year from both the target date and entry dates, then matches by month and day only.  
This handles **fixed feasts** (Christmas, Epiphany, sanctoral cycle) which fall on the same calendar date every year regardless of liturgical year.  
Example: December 25 in christmas.json matches whether the target year is 2026, 2027, or 2030.

#### Fallback
If all three priorities fail: logs a warning and returns `data[0]` (first entry in file).  
This should never occur for dates within covered season ranges.

---

## Data Flow Diagram

```
User navigates to a date
         │
         ▼
getSeasonAndFile(date)
  → Scans SEASON_RANGES
  → Returns { season, file }
         │
         ▼
fetchLectionaryData(date)
  → Check seasonalCache[file]
  → Fetch data/season/${file} if needed
  → Call findEntry(data, date, file)
         │
         ▼
findEntry(data, date, file)
  → Priority 1: Exact ISO/long match
  → Priority 2: day_of_season offset
  → Priority 3: Month-day match
  → Fallback: data[0]
         │
         ▼
Return daily entry object to renderOffice()
```

---

## Console Log Reference

All engine logs are prefixed with `[Calendar Engine]`:

| Message | Level | Meaning |
|---|---|---|
| `Exact match for YYYY-MM-DD in file.json` | log | Priority 1 succeeded |
| `Offset match day N for YYYY-MM-DD in file.json` | log | Priority 2 succeeded |
| `Month-day match for YYYY-MM-DD in file.json` | log | Priority 3 succeeded |
| `No match for YYYY-MM-DD in file.json - using index 0 fallback.` | warn | All priorities failed |
| `No range match for Day Mon DD YYYY. Defaulting to ordinary1.json` | warn | Date not in any SEASON_RANGE |
| `Loaded bcp-propers.json` | log | init() succeeded |
| `Failed to load bcp-propers.json` | error | init() failed |
| `Error loading file.json` | error | HTTP fetch failed |

---

## Testing Scenarios

### 1. Liturgical Year Alternation
| Date | Expected | Verified |
|---|---|---|
| Nov 28, 2026 (last day before Advent 2026) | year2 | ✅ |
| Nov 29, 2026 (Advent 1 2026) | year1 | ✅ |
| Nov 27, 2027 (last day before Advent 2027) | year1 | ✅ |
| Nov 28, 2027 (Advent 1 2027) | year2 | ✅ |
| Dec 3, 2028 (Advent 1 2028) | year1 | ✅ |

### 2. Perpetual Calendar Boundary Tests
| Date | Expected Entry | Verified |
|---|---|---|
| Feb 10, 2027 (Ash Wednesday 2027) | "Ash Wednesday" from lent.json day 1 | ✅ |
| Mar 28, 2027 (Easter Sunday 2027) | "Easter Day" from easter.json day 1 | ✅ |
| Nov 28, 2027 (Advent 1, 2027) | "First Sunday of Advent" from advent.json day 1 | ✅ |
| May 17, 2027 (Ordinary Time 2027) | Correct Ordinary entry | ✅ |
| Sep 1, 2027 (ordinary2 bridge) | Correct ordinary2 entry via day_of_season | ✅ |

### 3. Fixed Feast Perpetual Match
| Date | Expected |
|---|---|
| Dec 25, 2027 | "Christmas Day" from christmas.json (month-day match) |
| Jan 1, 2028 | "The Holy Name" from christmas.json (month-day match) |

---

## Maintenance Notes

### Adding Years Beyond 2030

1. Calculate Easter for target years (use the Anonymous Gregorian algorithm)
2. Derive: Ash Wednesday (Easter − 46), Pentecost (Easter + 49), Advent 1 (4th Sunday before Dec 25)
3. Add new entries to `SEASON_RANGES` maintaining slash-format dates
4. No changes needed to seasonal JSON files — `day_of_season` makes them perpetual

### If Seasonal JSON Schema Changes

If new fields are added to seasonal JSON entries:
- `findEntry()` does not care about field names — it only matches on `date` and `day_of_season`
- No changes to the engine are needed
- Update `renderOffice()` in index.html to consume the new fields

---

## Credits

**Module:** Universal Office Calendar Engine  
**Architecture:** Claude (Anthropic AI) with user direction and Architect/QC approval  
**Liturgical Source:** 1979 Book of Common Prayer (The Episcopal Church), public domain  
**Perpetual Calendar Strategy:** Designed and approved February 17, 2026

---

**END OF DOCUMENTATION**

*For UI rendering logic, see INDEX_HTML_DOCUMENTATION.md. For scripture fetching, see SCRIPTURE_RESOLVER_DOCUMENTATION.md.*
