# structure.json Hygiene Pass — Implementation Note
## v2.8.9 — 2026-03-06

One file changed: `structure.json`. No code, no source data, no other docs.

---

## Sections corrected

| Section | What was stale | What it says now |
|---|---|---|
| `known_outstanding_issues.saints_schema_refactor` | Said Phase 4 "not started"; said COE audit "deferred to COE-II" | Both complete; only normalized-source adapter remains |
| `saints_model.unfinished_work` | Listed Phase 4 as "not started" | Removed; only adapter item remains |
| `saints_model.status_note` | Did not reflect Phase 4 completion | Notes last regen at v2.8.8 (Phase 4); 1,228 identities |
| `active_modules[js/office-ui.js].status` | `Current — v2.8.6` | `Current — v2.8.9 (COE Layer 3 re-enabled via CoeEligibility.filter())` |
| `active_modules[js/calendar-east-syriac.js].public_methods` | Listed `getSeason` only | All 6 public API members listed (see below) |
| `known_outstanding_issues.coe_calendar_model.three_layer_model.layer_3_individual_saints.status` | Said "re-enabled v2.8.9" | Corrected to "re-enabled v2.8.7" (actual re-enable version) |
| `project_manifest.audit_findings.architectural_debt[3]` | Listed Phase 4 and COE audit as remaining | Both noted complete; only adapter remains |
| `admin.todos` — `saints-schema-refactor` | Title and description still listed Phase 4 as outstanding | Title and description updated; only adapter remains |

---

## Final wording — required deliverables

### `known_outstanding_issues.saints_schema_refactor`

```
severity: "LOW"

description: "Saints resolver boundary complete as of v2.8.6.
js/saints-resolver.js (SaintsResolver) is the sole monthly-cache owner.
office-ui.js resolveCommemorations() is a pure delegation wrapper.
OOR inline fallback filters route through SaintsResolver.filterCachedByTradition().
admin.html routes through SaintsResolver.loadSaintsForDate().
No appData.saints usage or direct saints-cache fetches remain outside saints-resolver.js.
Duplicate identity consolidation (saints-cleanup-queue.md Phase 4) complete as of v2.8.8:
46 duplicate identity pairs resolved; identities.json reduced from 1,274 to 1,228 records;
all 12 monthly caches regenerated.
COE saint-tag audit and governance complete as of v2.8.9
(see known_outstanding_issues.coe_calendar_model).
Remaining internal work: normalized-source runtime adapter only — SaintsResolver currently
reads generated monthly cache files at runtime rather than querying identities.json +
commemorations.json directly."

action: "Implement normalized-source runtime adapter in saints-resolver.js."

files: [
  "js/saints-resolver.js",
  "data/saints/identities.json",
  "data/saints/commemorations.json"
]
```

---

### `saints_model.unfinished_work`

```json
[
  "Normalized-source runtime adapter: SaintsResolver reads generated cache files at runtime.
   A true adapter would query identities.json + commemorations.json directly."
]
```

(One item. Phase 4 and COE audit entries removed — both complete.)

---

### `active_modules["js/calendar-east-syriac.js"].public_methods`

```json
[
  "getSeason(date) — returns { season, weekInSeason, cycle, weekLabel, seasonLabel, easter }",
  "getDayClass(date) — returns full day-classification object including isFriday, isLenten, isNinevehFast, dayClass, commemorations[], and all getSeason fields",
  "getEaster(gregorianYear) — returns Date (Gregorian JS Date of d'Qyamta for that year)",
  "getLiturgicalYear(date) — returns { subaraStart, easter, seasons, nextSubara }",
  "getFixedCommemorationsForDate(date) — returns commemoration records for Layer 2 fixed observances",
  "SEASON_META — read-only season metadata object"
]
```

(Previously listed `getSeason` only. All six confirmed from the module's own export block.)

---

## Stale strings eliminated

| String | Was present in | Now present |
|---|---|---|
| `"not started"` | `saints_model.unfinished_work`, `saints_schema_refactor`, `architectural_debt[3]`, admin todo | Nowhere |
| `"deferred to COE-II"` | `saints_schema_refactor` description | Nowhere |
| Layer 3 "re-enabled v2.8.9" | `layer_3_individual_saints.status` | Corrected to v2.8.7 |

---

## What was not changed

- All COE governance sections (closed correctly in the prior pass)
- All non-saints-schema known_outstanding_issues entries
- All non-COE admin todos
- `roadmap_summary` (already correct from prior pass)
- `recent_logic_changes` (already correct from prior pass)
- All code files
- All source data files
