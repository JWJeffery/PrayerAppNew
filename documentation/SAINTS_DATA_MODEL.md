# Saints Data Model (Internal)

**Status:** Active  
**Last Realigned:** 2026-03-03  
**Source of truth:** `data/saints/identities.json` + `data/saints/commemorations.json` (declared in `structure.json`)

## 1. Core principle

A saint is not a calendar entry.

We separate:
A) Identity (who)  
B) Commemoration (when/how within a tradition)  

The UI must never filter raw identity records by “tradition strings”. It must resolve commemorations for a date and tradition.

## 2. Identity record (identities.json)

Required:
- `id` (stable slug/uuid; never changes)
- `name` (display)
- `tags` (array; tradition tags and/or ECU as a derived presentation tag)
- `verification_status` (e.g., `verified`, `needs_review`, `conflict`, `provisional`)
- `sources` (array of citations/URLs/notes; internal acceptable)

Recommended:
- `alt_names` (array)
- `life` (string or object)
- `summary` (short)
- `notes` (internal)

Rules:
- Do not encode “commemoration date” in identities.
- ECU is derived, not stored as an identity truth claim unless the identity is genuinely ecumenical in the project’s definition.

## 3. Commemoration record (commemorations.json)

Each record binds an identity to a liturgical observance context.

Required:
- `saint_id` (FK to identities)
- `tradition` (e.g., `ANG`, `LAT`, `EOR`, `ORO`, `COE`, `ETH`)
- `when` (fixed date or rule; schema depends on engine)
- `type` (`saint`, `feast`, `commemoration`, `synaxis`, etc.)
- `rank` (optional now, but reserve the field)
- `scope` (`universal_within_tradition`, `regional`, `local`, `monastic`, etc.)
- `sources`

Rules:
- Commemorations may legitimately be absent for a given day/tradition.
- Multiple commemorations may exist on one day; precedence rules belong to the engine, not the data file.

## 4. Generator and caches

If monthly caches exist (e.g., `data/saints/saints-march.json`), they are **generated artifacts** and must not be edited manually.
The generator is declared in `structure.json` and should be the single path to regenerate caches.

## 5. Required UI contract (future-facing)

Define (and then enforce):
`resolveCommemorations(dateISO, tradition) -> Commemoration[]`

Until implemented everywhere, any UI fallback must be explicit and visibly marked as provisional (“not implemented”).
