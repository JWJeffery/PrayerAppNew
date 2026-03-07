# COE-IIB — NEEDS_REVIEW Resolution Pass
## Implementation Note

**Date:** 2026-03-06  
**Scope:** Remaining 10 COE NEEDS_REVIEW cases from COE_IIB_AUDIT.md §2G  
**Files changed:** `commemorations.json`, all 12 `saints-<month>.json` caches, `js/coe-eligibility.js`, `documentation/COE_IIB_AUDIT.md`, `documentation/COE_II_ARCHITECTURE.md`

---

## Disposition of each NEEDS_REVIEW case

### REMOVE_COE_TAG (4)

**`saint-arethas`** (COE 10/24 removed)  
Arethas was martyred at Najran, Arabia, in 523 AD. The Najran Christian community was Miaphysite — connected to the Alexandrian/Antiochene tradition via the Ghassanid and Ethiopian churches, not to the Church of the East. The COE's Arabian mission was centered on eastern Arabia (Beth Qatraye), geographically and theologically distinct from Najran. The COE tag followed the OOR row mechanically. No defensible COE basis.

**`saints-sergius-and-bacchus`** (COE 10/7 removed — this was their only comm row; they now have no comms and are absent from the monthly caches)  
Martyred at Resafa (Sergiopolis), in Roman Syria, on the western bank of the Euphrates. Their cult was Roman/Byzantine in origin and character. They are venerated in EOR/OOR/LAT but this identity record carried only a COE tag — anomalous and unexplained. No Mar- prefix, not Persian, not Mesopotamian. No defensible COE basis.

**`apostles-herodion-and-agabus`** (COE 4/8 removed)  
Members of the Seventy Apostles. The identity description itself states veneration "in Eastern Orthodox and Oriental Orthodox traditions" — not COE. The Seventy are not individually commemorated in the Hudra. COE tag followed EOR/OOR mechanically.

**`saint-philip-the-deacon`** (COE 10/11 removed)  
One of the Seven Deacons (Acts 6, 8). Not one of the Twelve. The COE shlihe (apostolic) season focuses on the Twelve and Thomas; Philip the Deacon carries no specific East Syriac liturgical standing. No Hudra evidence. COE tag followed OOR mechanically.

---

### STILL_UNRESOLVED (5) — COE tags retained; no data change

**`saint-ignatius-of-antioch`**  
Pre-schism Bishop of Antioch, martyred c. 107. His letters circulated in a Syriac recension and Antioch is the mother church of the Syriac tradition. The COE case is the strongest of the five unresolved entries. However: he carries COE rows on both 10/17 (the EOR feast date) and 12/20 (the Roman/Anglican date), which is a pattern consistent with mechanical tag application. No confirmed Hudra manuscript evidence. Governance rule requires confirmed presence, not plausible presence. Retain STILL_UNRESOLVED.

**`saint-nicholas-of-myra`**  
Universally venerated pre-schism bishop. Myra (Lycia, western Turkey) is far from the COE heartland. The identity description notes universal celebration but contains no COE-specific evidence. The COE_IIB_AUDIT noted "possible Hudra presence — cannot confirm or deny." No Hudra confirmation. Retain STILL_UNRESOLVED.

**`saint-abraham-of-carrhae`**  
Syrian bishop from Harran (Carrhae). Harran is in the Syriac cultural zone but on the western (Roman-Byzantine) side of the Euphrates, outside the COE's core Mesopotamian heartland. Description is minimal: "Syrian bishop." No Hudra evidence. Retain STILL_UNRESOLVED.

**`mar-augustine`**  
Mar- prefix is genuine East Syriac evidence; this is not Augustine of Hippo. However: two COE commemoration rows on different dates (8/12 and 9/19) for the same identity, plus a secondary `mar-augustine-commemoration` on 7/27 — three different dates total across two records. This data quality concern (possible duplication or errors in source dates) must be resolved before the identity can be confirmed as KEEP_CANDIDATE. Description "Monk and teacher" is too vague to resolve without Hudra evidence. Retain STILL_UNRESOLVED.

**`mar-augustine-commemoration`**  
Secondary observance of the unresolved `mar-augustine` primary. Resolution is contingent on `mar-augustine`. Retain STILL_UNRESOLVED.

---

### Already resolved — stale entry (1)

**`saint-cyril-of-jerusalem`**  
No COE row was present in `commemorations.json`. The COE tag was removed in the prior COE-IIB source-data pass. The NEEDS_REVIEW entry in the audit document was stale. No action required in this pass.

---

## Summary counts

| Disposition | Count | Identities |
|---|---|---|
| REMOVE_COE_TAG (this pass) | 4 | saint-arethas, saints-sergius-and-bacchus, apostles-herodion-and-agabus, saint-philip-the-deacon |
| STILL_UNRESOLVED | 5 | saint-ignatius-of-antioch, saint-nicholas-of-myra, saint-abraham-of-carrhae, mar-augustine, mar-augustine-commemoration |
| Already resolved (stale) | 1 | saint-cyril-of-jerusalem |
| **Total** | **10** | |

COE comm rows removed this pass: **4**  
Comms before: 1,808 → after: 1,804  
Identities.json: unchanged

---

## Layer 3 status: **REMAINS SILENCED**

Conditions for re-enabling Layer 3 (from COE_II_ARCHITECTURE.md §4):

| Condition | Status |
|---|---|
| Source data corrections complete | ✅ |
| Duplicate identity consolidation (Phase 4) | ✅ Complete |
| NEEDS_REVIEW entries resolved | ❌ 5 remain STILL_UNRESOLVED |
| KEEP_CANDIDATE set unambiguously trustworthy | ❌ Blocked by above |

Layer 3 cannot be re-enabled while 5 unresolved entries remain. The STILL_UNRESOLVED entries cannot be safely included in or excluded from the allowlist without external Hudra manuscript evidence. Resolving them speculatively would undermine the COE-IIB integrity standard.

---

## What still blocks COE Layer 3

The single remaining blocker is the 5 STILL_UNRESOLVED entries. They require:

- For `saint-ignatius-of-antioch`: confirmation (or denial) of Hudra manuscript presence; clarification of why COE appears on both 10/17 and 12/20
- For `saint-nicholas-of-myra`: confirmation (or denial) of Hudra presence
- For `saint-abraham-of-carrhae`: Hudra evidence, or a determination that Harran falls outside the COE geographical scope
- For `mar-augustine` / `mar-augustine-commemoration`: resolution of the three-date discrepancy across two identity records, plus Hudra confirmation of the primary feast date

If all 5 are ultimately classified REMOVE_COE_TAG (the conservative outcome), Layer 3 can be re-enabled immediately from the existing KEEP_CANDIDATE set. If any are confirmed KEEP_CANDIDATE, they should be added to `coe-eligibility.js` before re-enabling.

---

## Deployment

Replace in repo:
```
data/saints/commemorations.json        (4 COE rows removed)
data/saints/saints-april.json          (apostles-herodion-and-agabus: COE tag removed)
data/saints/saints-october.json        (saint-arethas, saints-sergius-and-bacchus, saint-philip-the-deacon: COE tags removed)
js/coe-eligibility.js                  (header updated with full NEEDS_REVIEW resolution status)
documentation/COE_IIB_AUDIT.md        (§2G updated; §3 summary counts updated)
documentation/COE_II_ARCHITECTURE.md  (§6 remaining work updated)
```

`identities.json` and remaining 10 monthly cache files are unchanged.

Run `npm run saints:validate` after deployment to confirm integrity.

---

## Suggested structure.json update

Update `version` to `2.8.8` and add to `resolved_in_this_version`:

> "COE-IIB NEEDS_REVIEW resolution pass (v2.8.8): 4 of 10 remaining NEEDS_REVIEW cases resolved as REMOVE_COE_TAG (saint-arethas, saints-sergius-and-bacchus, apostles-herodion-and-agabus, saint-philip-the-deacon). 1 confirmed already resolved (saint-cyril-of-jerusalem). 5 remain STILL_UNRESOLVED pending external Hudra evidence. Layer 3 remains silenced."
