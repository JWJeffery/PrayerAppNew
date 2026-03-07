# COE Governance Closure — Implementation Note
## v2.8.9 — 2026-03-06

---

## What was done

This pass closes all open internal COE work in `structure.json`,
`documentation/COE_II_ARCHITECTURE.md`, and `js/coe-eligibility.js`.
No source data was changed. No non-COE systems were touched.

---

## Files updated

| File | Nature of change |
|---|---|
| `structure.json` | Version bump; operational_status; coe_calendar_model closed; admin todo closed; roadmap updated; recent_logic_changes prepended; saints_model.unfinished_work cleaned |
| `documentation/COE_II_ARCHITECTURE.md` | Status header updated; §2 layer statuses updated; §5 bucket counts updated; §6 implementation table updated; §7 Augustine holdout section added; §8 governance note preserved |
| `js/coe-eligibility.js` | Header comment updated: governance status, holdout note, Layer 3 active call sequence documented |

---

## Exact final status of COE governance

**All internal COE work is complete.**

| Layer | Status |
|---|---|
| Layer 1 — Season engine | ✅ Complete |
| Layer 2 — Fixed feasts (Sawma Fridays, Faithful Departed) | ✅ Complete — COE-IIA |
| Layer 2 — Expanded feasts (Denha, Sleeba, etc.) — COE-IIC | 🔵 Optional future — not scheduled |
| Layer 3 — Source-data audit (COE-IIB) | ✅ Complete — 133 IDs removed |
| Layer 3 — Final five adjudication | ✅ Complete — 3 removed, 2 holdouts |
| Layer 3 — CoeEligibility.filter() gate | ✅ Complete — active and mandatory |
| Layer 3 — Display re-enabled | ✅ Complete — v2.8.7 |
| External-research holdout | ⏳ Not a repo-internal task |

---

## Exact wording used for the Augustine holdout

In `structure.json` (`known_outstanding_issues.coe_calendar_model.three_layer_model.layer_3_individual_saints.action`):

> "No further internal action required. One external-research holdout remains:
> mar-augustine / mar-augustine-commemoration — excluded from Layer 3 by the
> eligibility gate. Do not alter on internal evidence alone. Resolution requires
> external Syriac manuscript evidence (Budge Book of the Governors, Wright
> Catalogue, Encyclopaedia Iranica COE calendar). If a matching Hudra figure is
> confirmed: correct feast dates, merge identity records, add to allowlist. If no
> figure is found: REMOVE_COE_TAG from both records."

In `documentation/COE_II_ARCHITECTURE.md` (§7):

> "Do not alter these records further on internal evidence alone."

In `js/coe-eligibility.js` (header comment):

> "One external-research holdout remains: mar-augustine / mar-augustine-commemoration
> [...] Do not alter them on internal evidence alone. Resolution requires external
> Syriac manuscript research (Budge, Wright, Encyclopaedia Iranica)."

---

## What changed in structure.json

- `project_manifest.version`: `2.8.6` → `2.8.9`
- `project_manifest.last_updated`: `2026-03-03` → `2026-03-06`
- `project_manifest.operational_status`: updated to reflect COE governance complete
- `project_manifest.audit_findings.architectural_debt[4]`: marked `[CLOSED — v2.8.9]`
- `known_outstanding_issues.coe_calendar_model.severity`: `HIGH` → `CLOSED`
- `known_outstanding_issues.coe_calendar_model` description and three_layer_model status fields: updated to reflect completion
- `known_outstanding_issues.coe_calendar_model.action`: replaced with completion + optional COE-IIC note
- `admin.todos` — `coe-calendar-rebuild`: `status: open` → `status: done`; description updated
- `roadmap_summary.completed`: COE-II appended
- `roadmap_summary.next_required`: COE-II removed as first item; optional COE-IIC and Augustine external note added
- `roadmap_summary.future`: `COE-II` entry replaced with `COE-IIC` (optional Layer 2 expansion only)
- `saints_model.unfinished_work`: COE audit entry removed (complete)
- `recent_logic_changes`: three entries prepended (v2.8.9 governance, v2.8.8 final five, v2.8.7 Layer 3 re-enable)

---

## What did not change

- `data/saints/commemorations.json` — unchanged (source data changes were in the prior pass)
- `data/saints/identities.json` — unchanged
- All monthly saints cache files — unchanged
- `js/office-ui.js` — unchanged
- All non-COE systems — unchanged
- The `coe-eligibility.js` allowlist (KEEP_IDS) — unchanged; only the header comment was updated

---

## Remaining COE work after this pass

| Item | Type | Status |
|---|---|---|
| mar-augustine / mar-augustine-commemoration | External research | ⏳ Awaiting Syriac manuscript evidence — not a repo-internal task |
| COE-IIC: Layer 2 Denha/Sleeba/Annunciation/All Saints | Optional future | 🔵 Not scheduled |

There is no open internal COE refactor work.
