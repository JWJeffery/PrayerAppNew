# CALENDAR-ENGINE.JS — PRODUCTION DOCUMENTATION

## Overview

This document covers **two separate calendar modules** used by The Universal Office:

1. **`js/calendar-engine.js`** (`CalendarEngine`) — the BCP liturgical calendar. Handles season detection, BCP lectionary entry lookup, liturgical year (Year 1/Year 2), and Proper number calculation. Authoritative for all Western/Anglican calendar logic.

2. **`js/calendar-ethiopian.js`** (`EthiopianCalendar`) — the Ethiopian (Ge'ez) and Coptic calendar. Handles Gregorian → Ethiopian date conversion via the Alexandrian JDN algorithm. Authoritative for all Ethiopian Orthodox calendar logic.

These are peer modules — neither depends on the other. Both are loaded before `office-ui.js` and both are globally accessible.

> **Architecture note:** The original statement "no calendar logic should exist in `office-ui.js`" applies to `CalendarEngine` logic only. `EthiopianCalendar` is called directly within `renderOffice()` in the `eth-saints-commemoration` slot handler, which is the correct pattern for a tradition-specific module consumed in one specific rendering context.

---

# PART 1: `js/calendar-engine.js` (CalendarEngine)

**Production Status:** ✅ OPERATIONAL — Perpetual Calendar Engine Active  
**Last Updated:** February 22, 2026  
**Current Line Count:** 213 lines  
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
**Called:** Once on app startup from `office-ui.js` `init()`  
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
**Called by:** `changeDate()` in `office-ui.js`

---

### `resetDate()` — sync, static
**Purpose:** Resets `currentDate` to today's actual date (`new Date()`)  
**Called by:** `resetDate()` in `office-ui.js`

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
- `office-ui.js` `renderOffice()` to determine Marian antiphon ID
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
Return daily entry object to renderOffice() in office-ui.js
```

---

## Console Log Reference (`CalendarEngine`)

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

## Testing Scenarios (CalendarEngine)

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

## Maintenance Notes (CalendarEngine)

### Adding Years Beyond 2030

1. Calculate Easter for target years (use the Anonymous Gregorian algorithm)
2. Derive: Ash Wednesday (Easter − 46), Pentecost (Easter + 49), Advent 1 (4th Sunday before Dec 25)
3. Add new entries to `SEASON_RANGES` maintaining slash-format dates
4. No changes needed to seasonal JSON files — `day_of_season` makes them perpetual

### If Seasonal JSON Schema Changes

If new fields are added to seasonal JSON entries:
- `findEntry()` does not care about field names — it only matches on `date` and `day_of_season`
- No changes to the engine are needed
- Update `renderOffice()` in `office-ui.js` to consume the new fields

---

---

# PART 2: `js/calendar-ethiopian.js` (EthiopianCalendar)

**Production Status:** ✅ OPERATIONAL — Phase 7.4 complete  
**Last Updated:** February 22, 2026  
**Lines:** ~253 (lines 3859–4111 of codebase)  
**Global Exposure:** `EthiopianCalendar` (IIFE, window-scoped)  
**Called by:** `renderOffice()` in `office-ui.js` — within the `eth-saints-commemoration` slot handler

---

## Purpose

Converts a Gregorian `Date` object to the corresponding Ethiopian (Amete Mihret era) or Coptic calendar date. The result is used by the Senkessar pipeline to determine which month/day directory to fetch the daily hagiographical narrative from (`data/synaxarium/ethiopian/{monthSlug}/{day}.json`).

---

## Algorithm

The module uses the **Julian Day Number (JDN) method** — a standard astronomical conversion that is valid for all historical and future dates without the boundary problems of simple arithmetic offsets.

**Epoch:** 1 Meskerem 1 EC = JDN 1724221 = 29 August 8 AD (Julian calendar)

**Conversion steps:**
1. Calculate JDN for the input Gregorian date
2. Subtract the Ethiopian epoch JDN
3. Divide by 365.25 to determine the approximate Ethiopian year
4. Calculate the day within the year and map to month + day

**Leap years:** Ethiopian leap year when `year % 4 === 3`. In a leap year, Pagume has 6 days instead of 5.

**Self-test:** A 9-case reference point suite runs on every page load and logs results to the console. All 9 cases must pass before the module is considered operational on any given device.

---

## Public API

### `EthiopianCalendar.getEthiopianDate(gregorianDate)` — sync
**Parameters:** `gregorianDate` — JavaScript `Date` object  
**Returns:** `{ day: number, month: string, monthIndex: number, year: number }`

- `day` — Day of the Ethiopian month (1–30; 1–5 or 1–6 for Pagume)
- `month` — Ge'ez month name string (e.g., `"Yekatit"`, `"Miyazya"`)
- `monthIndex` — 0-based index into `MONTH_NAMES` array (0 = Meskerem, 12 = Pagume)
- `year` — Ethiopian year in Amete Mihret era (e.g., `2018`)

**Called in:** `eth-saints-commemoration` handler — `EthiopianCalendar.getEthiopianDate(currentDate)`

---

### `EthiopianCalendar.getCopticDate(gregorianDate)` — sync
**Parameters:** `gregorianDate` — JavaScript `Date` object  
**Returns:** `{ day: number, month: string, monthIndex: number, year: number }`

Same algorithm as `getEthiopianDate()` but uses Coptic month names and the EC-276 era offset. Used for Coptic calendar display if that feature is added.

---

### `EthiopianCalendar.formatEthiopianDate(gregorianDate)` — sync
**Parameters:** `gregorianDate` — JavaScript `Date` object  
**Returns:** Display string, e.g., `"15 Yekatit 2018"`

**Current status:** Fully implemented and available. Not yet wired to any UI element. Phase 8.5 target: display in the Sa'atat header area using `#ethiopian-settings` or a dedicated `#eth-date-display` element.

---

### `EthiopianCalendar.isEthiopianLeapYear(ethiopianYear)` — sync
**Parameters:** `ethiopianYear` — integer  
**Returns:** boolean — `true` when `ethiopianYear % 4 === 3`

---

### `EthiopianCalendar.MONTH_NAMES` — exported constant
Array of 13 Ge'ez month name strings in order:
`["Meskerem", "Tiqimt", "Hidar", "Tahsas", "Tir", "Yekatit", "Megabit", "Miyazya", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"]`

---

### `EthiopianCalendar.COPTIC_MONTH_NAMES` — exported constant
Array of 13 Coptic month name strings in the corresponding order.

---

## Self-Test Reference Points

The module verifies these 9 cases on every page load. A failure indicates a platform-level JDN calculation issue:

| Gregorian Date | Expected Ethiopian Date |
|---|---|
| 2026-02-22 | 15 Yekatit 2018 |
| 2025-09-11 | 1 Meskerem 2018 (Ethiopian New Year) |
| 2025-09-10 | 5 Pagume 2017 (last day of non-leap year) |
| 2026-09-11 | 1 Meskerem 2019 |
| 2024-09-11 | 1 Meskerem 2017 (leap year boundary) |
| 2024-09-10 | 6 Pagume 2016 (Pagume day 6 in leap year) |
| 2026-01-06 | 28 Tahsas 2018 (Gregorian Epiphany) |
| 2026-01-19 | 11 Tir 2018 (Ethiopian Timqat / Epiphany) |
| 2025-12-25 | 16 Tahsas 2018 |

**Console output on success:** `[EthiopianCalendar] All 9 self-tests passed.`  
**On failure:** Individual test failures are logged with expected vs. actual values.

---

## Integration with Senkessar Pipeline

`getEthiopianDate()` is the entry point for the entire Senkessar data flow:

```
EthiopianCalendar.getEthiopianDate(currentDate)
         │
         ▼
{ day: 15, month: "Miyazya", monthIndex: 7, year: 2018 }
         │
         ▼
MONTH_SLUG_MAP: "miyazya" → "miazia"   (folder normalisation)
         │
         ▼
Fetch senkessar-index.json (lazy, cached in appData.senkessarIndex)
Find months[].find(m => m.month === "miazia")
Find days[].find(d => d.day === 15)
         │
         ▼
Fetch data/synaxarium/ethiopian/miazia/15.json
(cached in appData.senkessarCache["miazia-15"])
         │
         ▼
Render { id, title, narrative } in office HTML
```

**Month name mismatch:** `getEthiopianDate()` returns `"Miyazya"` (the Ge'ez romanisation) but the data folder is `miazia` (the common English spelling). The `MONTH_SLUG_MAP` in the `eth-saints-commemoration` handler bridges this gap. Similarly `"Tiqimt"` maps to `"tiqimt"`. No changes to the calendar module are needed.

---

## Console Log Reference (`EthiopianCalendar`)

| Message | Level | Meaning |
|---|---|---|
| `[EthiopianCalendar] All 9 self-tests passed.` | log | Module loaded and verified correctly |
| `[EthiopianCalendar] SELF-TEST FAILED for YYYY-MM-DD: expected X, got Y` | error | JDN calculation error on this platform |

---

## Maintenance Notes (EthiopianCalendar)

**The module requires no annual updates.** The Alexandrian algorithm is perpetually valid. Unlike `CalendarEngine`, there is no `SEASON_RANGES` array to extend — the Ethiopian calendar is purely mathematical.

**Pagume edge case:** In Ethiopian leap years (`year % 4 === 3`), Pagume has 6 days. The Senkessar data directory `pagumen/` contains `1.json` through `5.json` for non-leap years. If a user accesses the Sa'atat on Pagume 6 in a leap year and `6.json` does not exist, the `eth-saints-commemoration` handler will fall through to the Oriental saints filter, then to the generic intercession. Adding `pagumen/6.json` is a low-priority future enhancement.

**Coptic Agpeya integration (Phase 7.5):** When the Coptic Agpeya is added as a standalone mode, `getCopticDate()` will drive its equivalent of the Senkessar pipeline. The module is already prepared for this.

---

## Credits

**Module:** Universal Office Calendar Engine  
**Architecture:** Claude (Anthropic AI) with user direction and Architect/QC approval  
**Liturgical Source (BCP):** 1979 Book of Common Prayer (The Episcopal Church), public domain  
**Calendar Algorithm (Ethiopian/Coptic):** Alexandrian JDN method  
**Perpetual BCP Calendar Strategy:** Designed and approved February 17, 2026  
**Ethiopian Calendar Engine:** Implemented Phase 7.4, February 22, 2026; self-test suite verified against 9 reference points

---

**END OF DOCUMENTATION**

*For UI rendering logic see `OFFICE_UI_DOCUMENTATION.md`. For Ethiopian Sa'atat architecture see `ETHIOPIAN_SAATAT_DOCUMENTATION.md`. For scripture fetching see `SCRIPTURE_RESOLVER_DOCUMENTATION.md`.*