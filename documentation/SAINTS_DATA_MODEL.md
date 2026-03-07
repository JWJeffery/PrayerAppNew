# Saints Data Model (Internal)

**Status:** Active  
**Last Realigned:** 2026-03-06  
**Source of truth:** `data/saints/identities.json` + `data/saints/commemorations.json` (declared in `structure.json`)

---

## 1. Core principle

A saint is not a calendar entry.

We separate:

- **Identity** (`identities.json`) — who is this person or entity?
- **Commemoration** (`commemorations.json`) — when and in which tradition is this identity observed?

The UI must never filter raw identity records by tradition strings. It must resolve
commemorations for a date and tradition via the canonical read path (see §5).

---

## 2. Identity record (`identities.json`)

Required fields:

- `id` — stable slug; immutable. Never rename an existing id. If a record must be replaced, create a new identity and migrate its commemorations explicitly.
- `name` — canonical display name. Tradition-neutral. No honorific prefixes; no devotional phrasing packed into the name.
- `description` — short, factual, tradition-neutral. Not a hagiography.
- `type` — stable historical category. Current values in use: `saint`, `martyr`, `bishop`, `monastic`, `confessor`, `apostle`, `prophet`, `virgin`, `feast`, `commemoration`, `marian_feast`. Do not collapse these into a single generic value. `type` describes what the identity *is*, not how it is celebrated.

Optional fields:

- `verification_status` — `verified` | `needs_review` | `conflict` | `provisional`
- `notes` — internal only; not rendered
- `alt_names` — array of alternative name forms

Rules:

- Do not encode commemoration date in identity records.
- ECU (ecumenical) is a derived property computed at cache generation time when all five tradition codes are present. It is not stored as a claim on the identity.
- `type` distinctions (saint / feast / commemoration / apostle / prophet / marian_feast) must be preserved at every layer — source, generated cache, and UI rendering. Do not flatten.

---

## 3. Commemoration record (`commemorations.json`)

Each record binds an identity to a liturgical observance context.

Required fields:

- `identity_id` — FK into `identities.json`
- `tradition` — one of: `ANG`, `LAT`, `EOR`, `OOR`, `COE`
- `calendar` — must be `"gregorian"` (only supported calendar at this time)
- `date` — `{ month: <number 1–12>, day: <number 1–31> }`

Optional fields:

- `rank` — commemoration rank/precedence (reserved; not yet enforced by engine)
- `scope` — `universal_within_tradition` | `regional` | `local` | `monastic`
- `notes` — observance-specific notes; not identity metadata

Rules:

- Commemorations may legitimately be absent for a given day/tradition. Absence is not an error.
- Multiple commemorations may exist on one day; precedence rules belong to the engine, not the data file.
- Commemorations do not redefine identity-level metadata.

---

## 4. Generator and generated cache files

**Current state:** All 12 monthly cache files are present (`saints-january.json` through `saints-december.json`). These are generated artifacts produced from `identities.json` + `commemorations.json` via `tools/build_saints_cache.js`. The migration that was initiated with March is complete across all months as of v2.8.2.

Generated cache records have this shape:

```json
{
  "id": "saint-polycarp-of-smyrna",
  "day": "February 23",
  "name": "Polycarp of Smyrna",
  "description": "Bishop of Smyrna and martyr.",
  "type": "martyr",
  "tags": ["ANG", "EOR", "LAT"]
}
```

Rules:

- **Never edit generated monthly files manually.**
- Regenerate using: `npm run saints:regen`
- The generator runs with no arguments to rebuild all months, or with a month name to rebuild one: `node tools/build_saints_cache.js march`
- Commit modified source files and all regenerated monthly files together.
- CI will fail if committed cache files do not match a clean rebuild from source.

---

## 5. Canonical UI read path

### What is implemented (v2.8.5)

`resolveCommemorations(date, tradition, opts)` is implemented in `office-ui.js` as an **interim cache-backed boundary**. It is the single point through which the UI fetches and filters saints data. It encapsulates:

- fetch and per-session caching of the monthly cache file (`saints-<month>.json`) into `appData.saints`
- date matching via `saintOccursOnDate()`
- tradition and ECU filtering via `saintAppliesToContext()`

All three main renderers route saints loading through it:

- `renderBcpOffice()` — calls `resolveCommemorations(currentDate, 'ANG')` to warm the cache before the sequence loop, then calls it again to populate `#saint-display`
- `renderEthiopianSaatat()` — calls `resolveCommemorations(currentDate, 'OOR')` to warm the cache before the sequence loop; the OOR fallback filter in the loop reads `appData.saints` directly (correct: cache is pre-warmed by the resolver call)
- `renderEastSyriac()` — calls `resolveCommemorations(currentDate, 'COE')` to warm the cache; `#saint-display` is silenced pending COE-II

Function signature:

```js
/**
 * Interim cache-backed saints boundary.
 * Fetches and caches the monthly saints file, then returns records
 * matching the given date and tradition.
 * Does not flatten type distinctions.
 *
 * @param {Date}   date
 * @param {string} tradition             - 'ANG' | 'LAT' | 'EOR' | 'OOR' | 'COE'
 * @param {object} [opts]
 * @param {boolean} [opts.includeEcumenical=true]
 * @returns {Promise<CachedRecord[]>}
 */
async function resolveCommemorations(date, tradition, opts = {})
```

### What is not yet implemented

**`admin.html`** still has two direct `fetch()` sites against `saints-<month>.json`:

1. The EOR day-snapshot path — fetches monthly file, filters inline, passes `comms` to `renderEORDayResult()`
2. The BCP/COE day-snapshot path — same pattern, passes `comms` to `renderDaySnapshotResult()`

`resolveCommemorations` lives in `office-ui.js` and is not available to `admin.html`. Routing admin requires either extracting the resolver to a shared module or reimplementing the boundary inline in admin. See `saints-schema-refactor` todo.

**Normalized-source adapter:** `resolveCommemorations` currently reads generated cache files at runtime, not `identities.json` + `commemorations.json` directly. A true adapter would remove the generated monthly files as a runtime dependency. That work is not yet scoped.

---

## 6. Remaining work

| Item | Status |
|---|---|
| All 12 monthly cache files present | ✅ Done (v2.8.2) |
| `identities.json` + `commemorations.json` as canonical source | ✅ Done |
| `saintOccursOnDate()` implemented | ✅ Done |
| `saintAppliesToContext()` implemented | ✅ Done |
| `resolveCommemorations(date, tradition)` implemented | ✅ Done (v2.8.5) |
| Three renderers routed through resolver | ✅ Done (v2.8.5) |
| `admin.html` routed through resolver | ❌ Not done |
| OOR inline fallback filters formally behind resolver | ❌ Not done (functional; cache pre-warmed) |
| Normalized-source adapter (bypass generated cache at runtime) | ❌ Not done |
| Duplicate identity consolidation (saints-cleanup-queue.md Phase 4) | ❌ Not done |
| COE tags audit against Hudra evidence | ❌ Deferred to COE-II |
