# OFFICE-UI.JS — INTERNAL ARCHITECTURE DOCUMENTATION

**Status:** Production-stable with known structural risks  
**Last Realigned:** 2026-03-03  
**Role:** UI + rendering + settings persistence. No calendar math; no scripture resolution.

## 1. Responsibilities

`office-ui.js` owns:

- global UI state (`appData`, `currentDate`, `selectedMode`)
- settings persistence (local storage)
- mode selection + navigation
- DOM assembly and render orchestration (`renderOffice()`)

It must not own:

- calendar boundary logic (belongs to calendar engines)
- lectionary resolution (engine/resolver layer)
- scripture fetching/parsing (scripture resolver)

## 2. Boot and hydration contract

The application has a known architectural risk:

- **Hydration race condition**: global state hydration must be gated before `renderOffice()` can fire. This is tracked as `admin.todos → hydration-race-condition`.

Internal requirement (governance-aligned):
- “Not ready” is a visible state.
- Do not silently proceed with partial `appData`.

## 3. Known architectural debt (documented, not ignored)

- `.innerHTML` string-building is prevalent and creates maintainability + XSS risk. Tracked as `admin.todos → innerHTML-architecture`.
- `[rite]` placeholder interpolation fragility in rubrics. Tracked as `admin.todos → rite-placeholder-fragility`.
- Fragment duplication (Gloria Patri/Kyrie). Tracked as `admin.todos → gloria-patri-normalization`.

## 4. Dependencies

Hard dependencies:
- `js/calendar-engine.js`
- tradition engines (e.g., `js/calendar-ethiopian.js`, `js/calendar-east-syriac.js`)
- `js/scripture-resolver.js`
- `data/rubrics.json`
- `components/*.json`

Soft dependencies must not fail silently unless explicitly justified by governance (mechanical honesty).
If a dependency is optional, UI must surface that it is optional.

## 5. Boundary rule

Renderers receive a canonical “day snapshot” from an engine:
- season label + liturgical color token + liturgical year markers
- observance/commemoration list (may be empty)

The UI formats and displays. It does not infer season boundaries or “invent” commemorations.

## 6. Operational notes

- Global exposure: functions are currently global (no module wrapper). This is acceptable under the “no build step” architecture but increases coupling risk.
- Any future modularization must be contract-first (documented function signatures) and must not introduce implicit side effects.
