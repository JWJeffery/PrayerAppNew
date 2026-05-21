# Admin Dashboard
**Route:** `admin/admin.html` (open directly in browser, no build step required)

This is a development-only tool. It is not linked from the main application.

---

## Overview

The admin dashboard is a release-governance cockpit and diagnostic tool.

Current state:
- **Universal Beta Roadmap source of truth** — `project_roadmap.json`; created in Phase 0.1. Dashboard rendering from this file is pending Phase 1.
- **Legacy Byzantine Release-Governance Cockpit** — post-Pentecost stabilization / EO production-readiness status, critical-path office status, monastic-first rationale, and readiness/deferred items; currently sourced from `structure.json → governance.byzantine_release_roadmap`
- **Release Status panel** — roadmap summary (next required / next planned), open bugs, and open architectural debt; sourced from `structure.json → roadmap_summary` and `project_manifest.audit_findings`
- **Active Governance & Open Work panel** — priority open todos and active governance decisions; sourced from `structure.json → admin.todos` and `governance.decisions`
- **Top 5 Open To-Dos panel** — open tasks ranked by severity; `done` todos remain in the ledger as history but are hidden from this panel; sourced from `structure.json → admin.todos`
- **YearSnapshot panel** — computed season timeline for any year and tradition, with anchor dates (Easter, Advent, etc.)
- **DaySnapshot panel** — pick any date, see season, liturgical color, and commemorations

The Beta Release roadmap is no longer governed by the Byzantine lane alone. `project_roadmap.json` is the canonical roadmap source for the BCP-facing Universal Office beta, including major-family representation requirements and release blockers.

---

## Universal Beta Roadmap and Legacy Release-Governance Cockpit

`project_roadmap.json` is now the canonical roadmap source for Beta Release architecture. It governs release identity, major tradition-family representation, beta blockers, phase/tranche sequencing, governance questions, and the future Admin Dashboard roadmap visualization.

The current dashboard still contains the existing Byzantine Release-Governance Cockpit. That panel tracks post-Pentecost stabilization and EO production-readiness only. Western Pentecost 2026 is preserved as the prior aspirational gate, not the current active release target.

Until Phase 1 dashboard wiring is complete, the existing release panel data is still sourced from `structure.json` under `governance.byzantine_release_roadmap`. The dashboard reads that section at page load and does not hard-code roadmap content. If a field is absent, the panel shows graceful fallback text rather than an error.

**Fields consumed:**

| Field | Purpose |
|---|---|
| `release_gate` | Gate name displayed in the panel header |
| `release_gate_date` | ISO date (YYYY-MM-DD) used to compute the countdown |
| `monastic_first` | Boolean — shows the monastic-first rationale block when true |
| `monastic_first_rationale` | Short governance rationale shown under the gate block |
| `critical_path_offices` | Array of offices with `title`, `status`, `engine_key`, and `note` |
| `non_blocking_open` | Array of items explicitly deferred from current public-beta readiness |

**Countdown behavior:**
- If the gate date is in the future, the panel shows the number of days remaining.
- If the gate date is today, it shows "TODAY."
- If the gate date has passed, it shows "✓ Release gate date passed" in green. Negative days are never displayed.

**Deferred/readiness label:** The readiness/deferred items section distinguishes public-beta blockers from items intentionally deferred beyond the current readiness gate. EO production-path integration (`eo-calendar-modes`) is no longer documented as non-blocking under the retired Western Pentecost target.

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

Canonical Beta Release roadmap data now lives in `project_roadmap.json`.

Use `project_roadmap.json` for:
- release identity
- major tradition-family representation
- beta blockers
- phase/tranche planning
- governance questions
- dashboard roadmap views

The older Byzantine roadmap remains in `structure.json → governance.byzantine_release_roadmap` for the existing Byzantine cockpit until Phase 1 dashboard wiring is complete. Do not use the Byzantine roadmap as the whole-project release roadmap.

For the existing Byzantine cockpit only, add a critical-path office by appending an object to `critical_path_offices`:

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
"my-item-id — Short description of why this is deferred from current public-beta readiness."
```

---

## Eastern Orthodox calendar mode

The EO mode selector (old_calendar / new_calendar) first appeared in the YearSnapshot panel as admin/devtool diagnostics. `CalendarEngine.getEOSeasonRanges(year, eoMode)` and `EasternOrthodoxCalendar.getYearSnapshot()` continue to provide admin coverage. As of v7.1 (2026-05-16), EO calendar mode is also exposed on the main-app Horologion production path: `js/calendar-eastern-orthodox.js` is loaded in the production script chain, a calendar mode selector (`#hor-eo-calendar-select`) appears in the Horologion sidebar, and `HorologionEngine.resolveOffice()` consumes `eoMode` for all fixed-date Menaion and Typika lookups. Movable-cycle behavior (Pascha, Bright Week, Great Lent, Holy Week, after-Pentecost ordinale) remains governed by the Julian Paschalion and is unaffected by eoMode. The `eo-calendar-modes` todo is closed as the main-app production bridge is complete. Annual Typikon collision policy for fixed vs movable cycle overlaps remains a separate deferred item.

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

interface ProjectRoadmap {
  schema_version:             string;
  roadmap_version:            string;
  last_updated:               string;  // YYYY-MM-DD
  status:                     'active' | 'draft' | 'archived';
  name:                       string;
  purpose:                    string;
  release_identity:           object;
  release_doctrine:           object;
  major_tradition_families:   MajorTraditionFamily[];
  phase_plan:                 RoadmapPhase[];
  tranche_plan:               RoadmapTranche[];
  governance_questions:       GovernanceQuestion[];
  dashboard_views:            DashboardView[];
}

interface MajorTraditionFamily {
  id:                 string;
  family:             string;
  first_release_lane: string;
  public_beta_role:   string;
  current_status:     string;
  beta_status:        string;
  blocks_beta:        boolean;
  blocker_reason?:    string | null;
}

interface RoadmapPhase {
  id:          string;
  title:       string;
  status:      'not_started' | 'in_progress' | 'blocked' | 'done' | 'deferred';
  blocks_beta: boolean;
  purpose:     string;
  exit_gate:   string;
}

interface RoadmapTranche {
  id:            string;
  phase_id:      string;
  title:         string;
  status:        'not_started' | 'in_progress' | 'blocked' | 'done' | 'deferred';
  tranche_size:  'micro' | 'standard' | 'campaign' | 'governance';
  files:         string[];
  purpose:       string;
  qc:            string[];
}

interface GovernanceQuestion {
  id:          string;
  category:    string;
  question:    string;
  status:      'open' | 'decided' | 'deferred';
  blocks_beta: boolean;
  blocks_v1?:  boolean;
  owner:       string;
}

interface DashboardView {
  id:          string;
  title:       string;
  data_source: string;
  purpose:     string;
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