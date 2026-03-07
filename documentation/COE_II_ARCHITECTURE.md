# COE-II — Church of the East Calendar Architecture (Internal)

**Status:** COMPLETE — v2.8.9. All three layers implemented. Internal COE governance closed.
**Last Realigned:** 2026-03-06
**Canonical constraint:** COE is not a daily saint-grid calendar. The app must not imply that every weekday has an assigned individual saint.

---

## 1. Objective

Deliver a deterministic COE calendar engine that returns an **Observance Set**:
- seasonal backbone (primary)
- fixed feasts layer (secondary)
- sparse individual commemorations (tertiary)

The UI renders observances; it does not "fill empty days" with other-tradition saints.

---

## 2. Three-layer model

**Layer 1 — Season Engine (complete)**
- `calendar-east-syriac.js` — `getSeason()`, `getDayClass()`
- Computes season/week/day class keys, liturgical colour tokens, cycle labels,
  fasting character, anaphora assignment, Nineveh fast window

**Layer 2 — Fixed Feasts (complete — COE-IIA)**
- `getDayClass()` returns a `commemorations[]` array alongside season data
- Currently includes:
  - Friday Commemoration of the Martyrs during Sawma Rabbā (every Sauma Friday)
  - Commemoration of the Faithful Departed (Friday immediately before Sawma)
- Both entries are corporate, not individual. No rotating named saint.
- Optional future expansion (COE-IIC): major Hudra fixed feasts — Denha (Epiphany),
  Sleeba (Exaltation of the Cross), Annunciation, All Saints. Not currently scheduled.

**Layer 3 — Sparse Saints / Commemorations (complete — COE-IIB)**
- `js/coe-eligibility.js` defines the explicit allowlist of eligible identity IDs
- COE-IIB audit performed 2026-03-06: 133 unique identity IDs (136 rows) had COE tags
  removed from `commemorations.json`; monthly caches regenerated.
  Post-correction: 1,804 total commemoration rows.
- Final five adjudication complete 2026-03-06:
  - `saint-ignatius-of-antioch` — REMOVE_COE_TAG (2 rows removed)
  - `saint-nicholas-of-myra` — REMOVE_COE_TAG (1 row removed)
  - `saint-abraham-of-carrhae` — REMOVE_COE_TAG (1 row removed)
  - `mar-augustine` / `mar-augustine-commemoration` — external-research holdout (see §7)
- Layer 3 display re-enabled in `renderEastSyriac()` via `CoeEligibility.filter()` gate (v2.8.7)

---

## 3. Engine API

**`getDayClass(gregorianDate) → DayClass`** (implemented, COE-IIA)
- Returns stable classification used by UI framing and observance resolution
- Fields: `season`, `seasonLabel`, `seasonColor`, `weekLabel`, `weekInSeason`,
  `cycle`, `cycleLabel`, `fastCharacter`, `fastLabel`, `anaphora`, `anaphoraLabel`,
  `isFriday`, `isSunday`, `isLenten`, `isNinevehFast`, `dayClass`,
  `commemorations[]`, `commemorationType`, `commemorationName`,
  `easter`, `subaraStart`, `ninevehFast`

**`CoeEligibility.filter(saintsArray) → eligibleSaints`** (implemented, COE-IIB)
- Explicit allowlist gate for Layer 3 individual saint display
- **Must be called before any Layer 3 saint record is rendered for COE**
- Do not replace with a "filter all COE-tagged entries" approach

---

## 4. UI framing constraints

- The "Commemorations" panel may be empty; this is liturgically correct for COE weekdays.
- Do not render a "Saint of the Day" slot for COE.
- `renderEastSyriac()` is commemoration-first: Layer 2 output from `getDayClass()` renders
  before any Layer 3 saint lookup.
- The saint section (`#saint-display`, `.saint-section`) is shown only when `CoeEligibility.filter()`
  returns at least one eligible record. Silence when empty is correct — no fallback.

---

## 5. COE-IIB audit findings (summary)

Source: `documentation/COE_IIB_AUDIT.md`

| Bucket | Unique identity IDs |
|---|---|
| KEEP_CANDIDATE (COE-native figures) | ~65 |
| KEEP_CANDIDATE (apostles/biblical) | ~27 |
| LAYER2_NOT_LAYER3 (universal feasts) | ~24 |
| LAYER2_NOT_LAYER3 (secondary observances) | ~22 |
| LAYER2_NOT_LAYER3 (calendar structure entries) | ~20 |
| REMOVE_COE_TAG | ~147 |
| External-research holdout | 2 |

Approximately 46% of the original 314 COE-tagged identity IDs had the COE tag removed.
A further 21% belong in Layer 2 or the season engine.

---

## 6. Implementation status

| Item | Status |
|---|---|
| Layer 1 season engine | ✅ Complete (v2.8.x) |
| Layer 2 Sawma Friday commemorations | ✅ Complete (COE-IIA) |
| Layer 2 pre-Sawma Faithful Departed | ✅ Complete (COE-IIA) |
| COE-IIB saint-tag audit | ✅ Complete (COE-IIB) |
| COE eligibility filter (`coe-eligibility.js`) | ✅ Complete (COE-IIB) |
| REMOVE_COE_TAG: 133 IDs (136 rows) removed from `commemorations.json` | ✅ Complete |
| Final five adjudication (3 removals + 2 holdouts) | ✅ Complete (v2.8.8) |
| Monthly caches regenerated | ✅ Complete |
| Layer 3 display re-enabled in `renderEastSyriac()` | ✅ Complete (v2.8.7) |
| External-research holdout (mar-augustine cluster) | ⏳ Awaiting external Syriac source evidence — not a repo-internal task |
| Layer 2 expanded (Denha, Sleeba, etc.) — COE-IIC | 🔵 Optional future work — not scheduled |

---

## 7. External-research holdout — mar-augustine cluster

**Identities:** `mar-augustine`, `mar-augustine-commemoration`
**COE rows retained:** COE 8/12, COE 9/19, COE 7/27

These two records cannot be adjudicated on internal evidence alone. The Mar- prefix
is a genuine East Syriac honorific and provides positive evidence that a COE-native
figure may underlie this data. However, the three-date structure across two identity
records is architecturally abnormal, and the feast dates do not match any recognizable
Hudra pattern.

**Current state:** Both records are excluded from visible Layer 3 output by `CoeEligibility.filter()`
(neither is in the allowlist). This is the correct holding position.

**Do not alter these records further on internal evidence alone.**

Resolution requires external Syriac manuscript evidence:
- Budge, *Book of the Governors* (Historia Monastica)
- Wright, *Catalogue of Syriac Manuscripts*, British Museum
- *Encyclopaedia Iranica* — Church of the East calendar entries

If a Hudra figure named Mar Awgustin (or similar) is confirmed:
correct feast dates, merge or retire the duplicate identity, add to allowlist.
If no such figure is found: REMOVE_COE_TAG from both records.

---

## 8. Governance note

Changes to the `CoeEligibility` allowlist require justification against at least one of:
- Hudra manuscript evidence
- Explicit East Syriac identity (Mar- prefix, Persian martyrs, COE patriarchs)
- Apostolic / biblical figures with COE liturgical standing
- Pre-schism universal saints with confirmed Hudra presence

Do not add saints to the allowlist on the basis of:
- "Early enough"
- Presence in EOR or OOR
- Generic "shared commemoration" framing in the identity description
- Western saints regardless of date
- Syriac cultural zone membership (≠ Church of the East jurisdiction)
