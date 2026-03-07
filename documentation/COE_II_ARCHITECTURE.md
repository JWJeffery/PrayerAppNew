# COE-II — Church of the East Calendar Architecture (Internal)

**Status:** COE-IIA complete. COE-IIB audit complete. Source-data corrections applied. Layer 3 display remains silenced.  
**Last Realigned:** 2026-03-06  
**Canonical constraint:** CoE is not a daily saint-grid calendar. The app must not imply that every weekday has an assigned individual saint.

---

## 1. Objective

Deliver a deterministic CoE calendar engine that returns an **Observance Set**:
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

**Layer 2 — Fixed Feasts (partially implemented — COE-IIA)**
- `getDayClass()` now returns a `commemorations[]` array alongside season data
- Currently includes:
  - Friday Commemoration of the Martyrs during Sawma Rabbā (every Sauma Friday)
  - Commemoration of the Faithful Departed (Friday immediately before Sawma)
- Basis: `structure.json` friday_logic note; `structure.json` coe_calendar_model.
  Both entries are corporate, not individual. No rotating named saint.
- Further Layer 2 entries (major fixed feasts from the Hudra calendar) deferred to COE-IIC

**Layer 3 — Sparse Saints / Commemorations (source-data corrected — display remains silenced)**
- `js/coe-eligibility.js` defines the explicit allowlist of eligible identity IDs
- COE-IIB audit performed 2026-03-06; see `documentation/COE_IIB_AUDIT.md`
- Source-data corrections applied 2026-03-06: 129 unique identity IDs (132 rows)
  had COE tags removed from `commemorations.json`; monthly caches regenerated.
  Post-correction: 243 COE rows, 185 unique IDs remain.
- Layer 3 display is intentionally silenced pending:
  1. ✅ Source data corrections — complete
  2. Duplicate identity consolidation (saints-cleanup-queue.md Phase 4)
  3. NEEDS_REVIEW entries resolved (13 entries; external Hudra evidence required)

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
- Must be called before any Layer 3 saint record is rendered for COE

---

## 4. UI framing constraints

- The "Commemorations" panel may be empty; this is liturgically correct for COE weekdays.
- Do not render a "Saint of the Day" slot for COE.
- `renderEastSyriac()` is commemoration-first: Layer 2 output from `getDayClass()` renders
  before any Layer 3 saint lookup.
- The saint section (`#saint-display`, `.saint-section`) remains hidden pending Layer 3
  data correction.

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
| REMOVE_COE_TAG | ~143 |
| NEEDS_REVIEW | ~13 |

Approximately 46% of the 314 COE-tagged identity IDs should have the COE tag removed.
A further 21% belong in Layer 2 or the season engine.

---

## 6. Remaining work

| Item | Status |
|---|---|
| Layer 1 season engine | ✅ Complete (v2.8.x) |
| Layer 2 Sawma Friday commemorations | ✅ Complete (COE-IIA) |
| COE-IIB saint-tag audit | ✅ Complete (COE-IIB) |
| COE eligibility filter (`coe-eligibility.js`) | ✅ Complete (COE-IIB) |
| REMOVE_COE_TAG: 129 IDs (132 rows) removed from `commemorations.json` | ✅ Complete (COE-IIB source-data pass) |
| Monthly caches regenerated (`npm run saints:regen`) | ✅ Complete (COE-IIB source-data pass) |
| Duplicate identity consolidation (cleanup-queue Phase 4) | ❌ Not done — blocks Layer 3 |
| NEEDS_REVIEW resolution (13 entries) | ❌ Not done — blocks Layer 3 |
| Layer 3 display re-enabled in `renderEastSyriac()` | ❌ Blocked on above two items |
| Layer 2 expanded (major Hudra feasts: Denha, Sleeba, etc.) | ❌ Deferred to COE-IIC |

---

## 7. Governance note

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
