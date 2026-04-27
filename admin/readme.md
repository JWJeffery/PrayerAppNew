# Admin Dashboard
**Route:** `admin/admin.html` (open directly in browser, no build step required)

This is a development-only tool. It is not linked from the main application.

---

## Overview

The admin dashboard is a release-governance cockpit and diagnostic tool. It provides:

- **Release-Governance Cockpit** — countdown to the Western Pentecost 2026 release gate, critical-path office status, monastic-first rationale, and non-blocking open items; sourced from `structure.json → governance.byzantine_release_roadmap`
- **Release Status panel** — roadmap summary (next required / next planned), open bugs, and open architectural debt; sourced from `structure.json → roadmap_summary` and `project_manifest.audit_findings`
- **Active Governance & Open Work panel** — priority open todos and active governance decisions; sourced from `structure.json → admin.todos` and `governance.decisions`
- **Top 5 Open To-Dos panel** — open tasks ranked by severity; `done` todos remain in the ledger as history but are hidden from this panel; sourced from `structure.json → admin.todos`
- **YearSnapshot panel** — computed season timeline for any year and tradition, with anchor dates (Easter, Advent, etc.)
- **DaySnapshot panel** — pick any date, see season, liturgical color, and commemorations

---

## Release-Governance Cockpit

The Release-Governance Cockpit is the primary panel for tracking the Western Pentecost 2026 release gate.

All release panel data is sourced from `structure.json` under `governance.byzantine_release_roadmap`. The dashboard reads that section at page load and does not hard-code roadmap content. If a field is absent, the panel shows graceful fallback text rather than an error.

**Fields consumed:**

| Field | Purpose |
|---|---|
| `release_gate` | Gate name displayed in the panel header |
| `release_gate_date` | ISO date (YYYY-MM-DD) used to compute the countdown |
| `monastic_first` | Boolean — shows the monastic-first rationale block when true |
| `monastic_first_rationale` | Short governance rationale shown under the gate block |
| `critical_path_offices` | Array of offices with `title`, `status`, `engine_key`, and `note` |
| `non_blocking_open` | Array of open items explicitly not required for this release gate |

**Countdown behavior:**
- If the gate date is in the future, the panel shows the number of days remaining.
- If the gate date is today, it shows "TODAY."
- If the gate date has passed, it shows "✓ Release gate date passed" in green. Negative days are never displayed.

**Non-blocking label:** The non-blocking open items section includes an explicit note that these items are not required for the Western Pentecost 2026 release gate. EO production-path integration (`eo-calendar-modes`) is recorded here and is non-blocking.

**Release-critical todo marker:** The Top 5 Open To-Dos panel marks items with a `⚑ RELEASE` badge when the todo has `severity: HIGH` and either its `phase` contains "Pentecost," or its `title` or `description` contains the word "release."

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
  "area":        "js/relevant-file.js",
  "phase":       "Pentecost roadmap"
}
```

**severity** values: `HIGH` | `MEDIUM` | `LOW`  
**status** values: `open` | `in-progress` | `done`

The Top 5 panel renders the top 5 open/in-progress todos by severity. `done` todos are hidden from the open panel but remain in the array as ledger history — do not delete them when closing work.

---

## How to update the release roadmap

All release roadmap data lives in `structure.json` under `governance.byzantine_release_roadmap`. Edit that section directly; the dashboard picks up changes on the next page load.

To add a critical-path office, append an object to `critical_path_offices`:

```json
{
  "id":         "my-office",
  "title":      "Office Display Name",
  "status":     "open",
  "engine_key": "my-office",
  "note":       "Short note on current state."
}
```

To add a non-blocking open item, append a string to `non_blocking_open`:

```json
"my-item-id — Short description of why this is deferred from the release gate."
```

---

## Eastern Orthodox calendar mode

The EO mode selector (old_calendar / new_calendar) is active in the YearSnapshot panel. Admin/devtool diagnostics use `CalendarEngine.getEOSeasonRanges(year, eoMode)` and `EasternOrthodoxCalendar.getYearSnapshot()`. This is admin-only coverage; the main application does not yet expose EO calendar mode on the production path. This is tracked as `eo-calendar-modes` in the todo ledger and is explicitly non-blocking for the Western Pentecost 2026 release gate.

---

## TypeScript contracts (documented here; project is vanilla JS)

```typescript
type SeasonColorToken = 'purple' | 'white' | 'green' | 'red' | 'rose' | 'gold';

interface SeasonRange {
  key:        string;
  label:      string;
  colorToken: SeasonColorToken;
  startDate:  string;   // YYYY-MM-DD
  endDate:    string;   // YYYY-MM-DD
}

interface YearSnapshot {
  tradition: string;
  year:      number;
  anchors:   { [key: string]: string | undefined };
  seasons:   SeasonRange[];
}

interface DaySnapshot {
  date:             string;
  tradition:        string;
  season:           SeasonRange;
  litYear?:         string;
  commemorations:   Array;
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

interface CriticalPathOffice {
  id:         string;
  title:      string;
  status:     'open' | 'in-progress' | 'done';
  engine_key: string;
  note:       string;
}

interface ByzantineReleaseRoadmap {
  release_gate:             string;
  release_gate_date?:       string;   // YYYY-MM-DD
  monastic_first:           boolean;
  monastic_first_rationale?: string;
  critical_path_offices:    CriticalPathOffice[];
  non_blocking_open:        string[];
}

type CalendarSystem = 'gregorian' | 'julian' | 'revised_julian';
type EoMode         = 'old_calendar' | 'new_calendar';

interface CalendarConfig {
  tradition:      string;
  calendarSystem: CalendarSystem;
  eoMode?:        EoMode;
}
```

---

**Note:** `structure.json` is the canonical governance ledger (also runtime-consumed by the Admin Dashboard). See `documentation/STRUCTURE_JSON_CONTRACT.md`.