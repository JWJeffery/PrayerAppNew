# COE-II — Church of the East Calendar Architecture (Internal)

**Status:** Design Spec (Not Implemented)  
**Last Realigned:** 2026-03-03  
**Canonical constraint:** CoE is not a daily saint-grid calendar. The app must not imply that every weekday has an assigned individual saint.

## 1. Objective

Deliver a deterministic CoE calendar engine that returns an **Observance Set**:
- seasonal backbone (primary)
- fixed feasts layer (secondary)
- sparse individual commemorations (tertiary)

The UI renders observances; it does not “fill empty days” with other-tradition saints.

## 2. Three-layer model

Layer 1 — Season Engine (exists)
- compute season/week/day class keys
- compute liturgical color tokens
- provide day labels (weekLabel/cycle etc.)

Layer 2 — Fixed Feasts (to implement)
- a curated table of major feasts, fasts, and universally-attested observances within CoE usage in scope for this project
- deterministic matching by date or rule

Layer 3 — Sparse Saints / Commemorations (to implement)
- optional layer: individual saints where attested
- must support “none today” as a correct output

## 3. Required engine API

`getDayClass(dateISO) -> DayClass`
- returns a stable classification used by UI framing and observance resolution
- must not default to “ordinary” silently

`resolveObservances(dateISO) -> ObservanceSet`
- returns:
  - season metadata
  - `observances[]` (feasts/commemorations)
  - diagnostics when an item is “not implemented”

## 4. UI framing constraints

- The “Commemorations” panel may be empty and must display an explicit empty-state (“No commemorations loaded for this date.” already exists in admin panel logic).
- Do not render a “Saint of the Day” slot for COE.

## 5. Governance note

COE-II must not begin until architectural review is complete (see `structure.json → admin.todos`).
