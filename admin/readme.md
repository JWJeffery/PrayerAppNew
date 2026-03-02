# Admin Dashboard

**Route:** `admin/admin.html` (open directly in browser, no build step required)

This is a development-only tool. It is not linked from the main application.

---

## Overview

The admin dashboard provides:

- **YearSnapshot panel** — computed season timeline for any year and tradition, with anchor dates (Easter, Advent, etc.)
- **DaySnapshot panel** — pick any date, see season, liturgical color, and commemorations
- **Top 5 To-Dos panel** — open tasks ranked by severity, sourced from `structure.json`

---

## How to add a new To-Do

Open `structure.json` in the project root and add an object to the `admin.todos` array:

```json
{
  "id":          "my-unique-id",
  "title":       "Short title shown in dashboard",
  "description": "Full description of the task.",
  "severity":    "HIGH",
  "status":      "open",
  "area":        "js/relevant-file.js"
}
```

**severity** values: `HIGH` | `MEDIUM` | `LOW`  
**status** values: `open` | `in-progress` | `done`

The dashboard renders the top 5 open/in-progress todos by severity. `done` todos are hidden.

---

## Eastern Orthodox calendar mode

The EO mode selector (old_calendar / new_calendar) is **scaffolded but not yet implemented.**

- `new_calendar` — Revised Julian calendar (most Orthodox churches in the West). Season boundaries computed the same as the Western Gregorian calendar for fixed feasts; Easter follows Julian calculation.
- `old_calendar` — Julian calendar (Russian Orthodox, Serbian, Georgian, etc.). All dates, including fixed feasts, follow the Julian calendar (+13 days in the modern era).

**Current behavior:** The dashboard displays an explicit `⚠ Not implemented` notice when EO old-calendar mode is selected. It does not silently fall back to Western dates.

To implement: add `getEOSeasonRanges(year, eoMode)` to `js/calendar-engine.js` using Julian Easter (the algorithm already exists in `calendar-east-syriac.js`) and wire it into the `getYearSnapshot` contract.

---

## TypeScript contracts (documented here; project is vanilla JS)

```typescript
type SeasonColorToken = 'purple' | 'white' | 'green' | 'red' | 'rose' | 'gold';

interface SeasonRange {
  key:        string;           // stable season key e.g. "advent", "lent"
  label:      string;           // display name e.g. "Advent"
  colorToken: SeasonColorToken;
  startDate:  string;           // civil YYYY-MM-DD
  endDate:    string;           // civil YYYY-MM-DD
}

interface YearSnapshot {
  tradition:    string;
  year:         number;
  anchors: {
    easter?:      string;   // YYYY-MM-DD
    advent?:      string;
    [key: string]: string | undefined;
  };
  seasons:      SeasonRange[];
}

interface DaySnapshot {
  date:         string;   // YYYY-MM-DD
  tradition:    string;
  season:       SeasonRange;
  litYear?:     string;   // "year1" | "year2" (BCP only)
  commemorations: Array<{ name: string; type: string; tags: string[] }>;
}

interface AdminTodo {
  id:          string;
  title:       string;
  description: string;
  severity:    'HIGH' | 'MEDIUM' | 'LOW';
  status:      'open' | 'in-progress' | 'done';
  area:        string;
  phase?:      string;
}

type CalendarSystem   = 'gregorian' | 'julian' | 'revised_julian';
type EoMode           = 'old_calendar' | 'new_calendar';

interface CalendarConfig {
  tradition:      string;
  calendarSystem: CalendarSystem;
  eoMode?:        EoMode;   // only applicable when tradition === 'EOR'
}
```
