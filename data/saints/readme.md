# Saints Data Model

This directory holds two source-of-truth files (`identities.json`,
`commemorations.json`) plus the generated runtime cache files
(`saints-{month}.json`) consumed by `office-ui.js`.

---

## Two-file model

### `identities.json`

One entry per distinct person or liturgical event.  Identity records are
**date-free**; they capture who or what the entry is, not when it is observed.

```jsonc
{
  "id":          "saints-perpetua-and-felicity",   // slug key, must be unique
  "name":        "Saints Perpetua and Felicity",
  "description": "Martyrs at Carthage, 203 AD …",
  "type":        "saint",                          // saint | marian_feast | prophet | …
  "status":      "verified",                       // verified | needs_review
  "notes":       "Pre-schism martyrs; COE unclear" // optional
}
```

**Rules:**
- `id` is the stable primary key referenced by `commemorations.json`.
- Duplicate persons across traditions get **one** identity record, not one per
  tradition.
- `description` should be the most informative (non-"shared commemoration")
  wording; brief aliases or "shared commemoration" phrases belong only in
  transit, not in the source.

---

### `commemorations.json`

One entry per **tradition × date × identity** pairing.  These records say
*when* and *where* an identity is observed.

```jsonc
{
  "identity_id": "saints-perpetua-and-felicity",
  "tradition":   "ANG",              // ANG | LAT | EOR | OOR | COE
  "calendar":    "gregorian",        // gregorian | julian | ge'ez | …
  "date": { "month": 3, "day": 7 }, // numeric; avoids locale/DST string issues
  "rank":        "commemoration",    // commemoration | feast | solemnity | …
  "status":      "verified"          // verified | needs_review
}
```

**Tradition codes:**

| Code | Tradition |
|------|-----------|
| ANG  | Anglican Communion (BCP) |
| LAT  | Roman Catholic (Latin Rite) |
| EOR  | Eastern Orthodox |
| OOR  | Oriental Orthodox |
| COE  | Church of the East (East Syriac) |

---

## Date normalization

Dates are stored as numeric `{ month, day }` objects under the `"gregorian"`
calendar, which avoids locale-sensitive string parsing and is immune to DST
boundary issues that affect `new Date()` at midnight.

```jsonc
// "March 1" in the source cache → numeric form in commemorations:
{ "month": 3, "day": 1 }
```

The generator converts these back to the string form (`"March 1"`) expected
by `office-ui.js` at cache-generation time, not at runtime.

---

## Generating the cache files

The generator reads both source files and writes `saints-{month}.json` into
this directory.  It is deterministic: given the same inputs it always produces
the same output, sorted by day (ascending) then name (ascending).

**Generate only March** (required for this PR):

```bash
node tools/build_saints_cache.js march
# → data/saints/saints-march.json
```

**Generate multiple months:**

```bash
node tools/build_saints_cache.js march april may
```

**Generate every month present in `commemorations.json`:**

```bash
node tools/build_saints_cache.js
```

The script lives at `tools/build_saints_cache.js` (project root).

---

## Tag emission in generated cache (transitional)

`tags` are **not** stored in the source files.  The generator emits them into
the cache for runtime backward-compatibility:

- Each commemoration's `tradition` code is included in `tags`.
- When a single identity has commemorations in **all five** traditions on the
  same calendar date, the generator emits the full five-code set
  `["ANG","LAT","EOR","OOR","COE"]`; the runtime UI interprets this as an
  ecumenical (ECU) entry without any code changes.

---

## Adding new commemorations

1. Check whether the person/event already exists in `identities.json`.
   - If yes, reuse the existing `id`.
   - If no, add a new identity record.
2. Add one entry to `commemorations.json` per tradition that observes it.
3. Re-run the generator for the affected month(s):
   ```bash
   node tools/build_saints_cache.js march
   ```
4. Commit both source files **and** the regenerated cache file.