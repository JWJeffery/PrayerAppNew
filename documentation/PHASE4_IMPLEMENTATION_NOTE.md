# Phase 4 — Duplicate Identity Consolidation
## Implementation Note

**Version bump:** v2.8.6 → v2.8.7  
**Date:** 2026-03-06  
**Files changed:** `identities.json`, `commemorations.json`, all 12 `saints-<month>.json` caches

---

## What was done

### Duplicate sets consolidated: 46 pairs → 46 retirements

**COE-blocking priority (3 pairs):**

| Retired | Canonical (kept) | Action |
|---|---|---|
| `saint-mar-babai-the-great` | `mar-babai-the-great` | 1 comm row repointed |
| `saint-james-the-brother-of-the-lord-james-the-just` | `saint-james-the-brother-of-the-lord` | 2 rows repointed, 3 duplicate rows dropped |
| `saint-matthias` | `saint-matthias-the-apostle` | 2 comm rows repointed |

**`saint-` prefix normalization (27 pairs):** `john-chrysostom`, `ignatius-of-antioch`, `basil-the-great`, `clement-of-rome`, `justin-martyr`, `kateri-tekakwitha`, `catherine-of-alexandria`, `gregory-of-nyssa`, `theodore-of-sykeon`, `martin-i`, `augustine-of-canterbury`, `macarius-the-egyptian`, `peter-chanel`, `francis-of-assisi`, `george-the-chozebite`, `hilary-of-poitiers`, `berard-and-companions`, `eutychius-of-constantinople`, `faustina-kowalska`, `felix-of-nola`, `innocent-of-alaska`, `jerome`, `john-bosco`, `john-of-god`, `julian-of-norwich`, `paul-of-the-cross`, `paul-the-first-hermit` — all retired into their `saint-` counterparts.

**Prefix-variant normalization (6 pairs):** `apostle-simon-the-zealot` → `saint-simon-the-zealot`; `apostle-timothy` → `saint-timothy`; `martyr-boniface` → `saint-boniface`; `martyr-polyeuctus-of-melitine` → `polyeuctus-of-melitine`; `saint-joel` → `prophet-joel`; `saint-hosea` → `prophet-hosea`.

**Bare form is canonical (7 pairs):** `saint-bede-the-venerable`, `saint-edward-the-confessor`, `saint-richard-of-chichester`, `saint-thomas-aquinas`, `saint-thomas-more`, `saint-vincent-de-paul`, `saint-teresa-of-avila` — all retired into their unprefixed counterparts.

**Vincent Ferrer (1 pair):** `vincent-ferrer` retired into `saint-vincent-ferrer`. Note: `vincent-ferrer` carried an ANG 3/15 comm row (anomalous — Vincent Ferrer's feast is universally April 5). That row has been repointed to `saint-vincent-ferrer`. The ANG 3/15 date should be reviewed separately and corrected or removed.

**Gregory cluster (2 pairs):** `gregory-the-great` retired into `gregory-the-great-gregory-the-dialogist` (its single ANG 3/12 row was a duplicate — dropped). `saint-gregory-the-dialogist` retired into `gregory-the-great-gregory-the-dialogist` (it had 0 comm rows — pure identity cleanup). `saint-gregory-the-great` (LAT 9/3) was **left alone** — it is on a different date (the pre-1969 Roman feast date of September 3, as distinct from the post-1969 Roman date of March 12) and may be intentional.

---

## Totals

| Metric | Count |
|---|---|
| Pairs consolidated | 46 |
| Identities retired | 46 |
| Identities before | 1,274 |
| Identities after | 1,228 |
| Comm rows repointed | 46 |
| Comm rows dropped (true duplicates) | 7 |
| Comms before | 1,808 |
| Comms after | 1,801 |
| Validation result | OK — no orphans, no duplicate IDs |

---

## COE NEEDS_REVIEW cases resolved

Three of the 13 NEEDS_REVIEW cases from COE_IIB_AUDIT.md §2G are now resolved:

| Identity | Resolution |
|---|---|
| `saint-mar-babai-the-great` | **Retired.** Comm repointed to `mar-babai-the-great`, which is KEEP_CANDIDATE (COE_IIB §2A). |
| `saint-james-the-brother-of-the-lord-james-the-just` | **Retired.** Comms merged into `saint-james-the-brother-of-the-lord`, which is KEEP_CANDIDATE (COE_IIB §2B). |
| `saint-matthias` | **Retired.** Comms repointed to `saint-matthias-the-apostle`, which is KEEP_CANDIDATE (COE_IIB §2B). |

The remaining 10 NEEDS_REVIEW cases require external Hudra evidence and are unchanged:
`saint-ignatius-of-antioch`, `saint-nicholas-of-myra`, `saint-arethas`, `saints-sergius-and-bacchus`, `saint-abraham-of-carrhae`, `mar-augustine`, `mar-augustine-commemoration`, `apostles-herodion-and-agabus`, `saint-philip-the-deacon`, `saint-cyril-of-jerusalem`.

---

## NOT merged (explicit decisions)

| Pair | Reason |
|---|---|
| `saint-meletius` / `martyr-meletius` | **Different people.** `saint-meletius` = Bishop (Meletius of Antioch). `martyr-meletius` = General and martyr with family. Do not merge. |
| `saint-gregory-the-great` (LAT 9/3) | Left alone. Different feast date from the March 12 Gregory cluster. |

---

## Layer 3 status

**COE Layer 3 remains silenced.**

Phase 4 resolved the three duplicate-dependent NEEDS_REVIEW blockers. The data is now cleaner, but the remaining blocker stands: 10 NEEDS_REVIEW entries still require external Hudra evidence before the Layer 3 KEEP_CANDIDATE set can be considered fully trustworthy for display.

---

## Deployment instructions

Replace the following files in your repo with the versions delivered here:

```
data/saints/identities.json
data/saints/commemorations.json
data/saints/saints-january.json
data/saints/saints-february.json
data/saints/saints-march.json
data/saints/saints-april.json
data/saints/saints-may.json
data/saints/saints-june.json
data/saints/saints-july.json
data/saints/saints-august.json
data/saints/saints-september.json
data/saints/saints-october.json
data/saints/saints-november.json
data/saints/saints-december.json
```

Then run `npm run saints:validate` to confirm integrity. No JS code changes are required.

---

## Suggested structure.json update

Update `version` to `2.8.7` and add to `resolved_in_this_version`:

> "Phase 4 duplicate identity consolidation (v2.8.7): 46 redundant identity records retired, 46 commemoration rows repointed, 7 duplicate rows dropped. Canonical IDs confirmed for all major pairs. Three COE NEEDS_REVIEW cases resolved (saint-mar-babai-the-great, saint-james-the-brother-of-the-lord-james-the-just, saint-matthias). Layer 3 remains silenced — 10 NEEDS_REVIEW entries still require external Hudra evidence."
