# COE — Final Five Adjudication Pass
## Implementation Note

**Date:** 2026-03-06  
**Scope:** Final disposition of the 5 remaining STILL_UNRESOLVED COE identities  
**Files changed:** `data/saints/commemorations.json`, `data/saints/saints-february.json`, `data/saints/saints-october.json`, `data/saints/saints-december.json`  
**Files unchanged:** `js/coe-eligibility.js`, `js/office-ui.js`, `data/saints/identities.json`, all other monthly caches

---

## Disposition of each of the five

### `saint-ignatius-of-antioch` — REMOVE_COE_TAG

**COE rows removed: 2** (COE 10/17, COE 12/20)

The decisive evidence is the two-date pattern itself. Ignatius carries COE tags on *both* principal feast dates used by other traditions — October 17 (the current Latin feast) and December 20 (the Eastern Orthodox/Anglican feast). This is precisely the signature of mechanical tag application: the COE tag followed LAT on 10/17 and followed EOR/OOR on 12/20 independently. No figure genuinely in the Hudra would appear on two different Western/Eastern feast dates simultaneously with no COE-internal feast date of its own.

On the historical question: Antioch, where Ignatius served as bishop, was the patriarchal seat of the Syriac Orthodox (Miaphysite) tradition, not the Church of the East. The COE's apostolic lineage runs through Addai and Mari to Seleucia-Ctesiphon, not through Antioch. The Syriac recension of Ignatius's letters demonstrates Syriac cultural reception, not Hudra commemoration. Pre-schism universality does not confer COE standing under the project's governance criteria, which require *confirmed* Hudra presence.

Non-COE rows (LAT 10/17, ANG/EOR/LAT/OOR 12/20) are preserved.

---

### `saint-nicholas-of-myra` — REMOVE_COE_TAG

**COE row removed: 1** (COE 12/6)

The identity's own description reads "celebrated across all traditions." The five-tradition tag pattern (ANG + COE + EOR + LAT + OOR, same date) is the canonical signal of a universal-sweep application, not of documented Hudra presence. Myra is in Lycia (western Turkey), geographically distant from the COE's Mesopotamian and Persian heartland. Nicholas has no Mar- prefix, no Persian or Mesopotamian connection, no Hudra-specific documentation in the project record. The audit criteria explicitly exclude saints retained only because they are "early enough" or universally known. The description's own "all traditions" phrasing was almost certainly the source of the tag.

Non-COE rows (ANG/EOR/LAT/OOR 12/6) are preserved.

---

### `saint-abraham-of-carrhae` — REMOVE_COE_TAG

**COE row removed: 1** (COE 2/14)

Carrhae (Harran) is west of the Euphrates in what was Roman/Byzantine territory. The Church of the East's canonical heartland lies east of the Tigris — Seleucia-Ctesiphon, Nisibis, Beth Garmi, Beth Lapat. A bishop of Harran in the 5th century served under the Antiochene patriarchate (Syriac Orthodox jurisdiction), not under the Catholicos of Seleucia-Ctesiphon. The figure known as Abraham of Carrhae appears in Syriac martyrologies of the Syriac Orthodox tradition; his presence there does not imply a Hudra commemoration. The COE tag here follows OOR mechanically (same date, COE+OOR pattern). The description "Syrian bishop" contains no COE-specific evidence. The Syriac cultural zone and the Church of the East are not coextensive.

The single OOR row (OOR 2/14) is preserved.

---

### `mar-augustine` and `mar-augustine-commemoration` — STILL_UNRESOLVED

**COE rows retained: 3** (COE 8/12, COE 9/19, COE 7/27)

This is explicitly a data-quality problem *as well as* a liturgical judgment problem, and the data-quality problem must be resolved before the liturgical judgment can be made.

**The data-quality problem:** Two identity records (`mar-augustine` and `mar-augustine-commemoration`) together carry three COE rows on three different dates: July 27, August 12, and September 19. Three distinct feast dates across two identity records for what appears to be a single figure is architecturally abnormal in this dataset. Even major COE figures rarely carry more than a primary feast and one secondary commemoration. The dates do not correspond to a recognizable Hudra pattern (they are not 40 days apart, not octave-related, not seasonal anchors). The secondary identity (`mar-augustine-commemoration`) is structurally intended to hold a secondary feast for a figure whose primary is in `mar-augustine` — but `mar-augustine` itself already holds two rows, making the total structure self-contradictory.

**The name question:** "Mar Augustine" (Awgustin in Syriac transliteration) is phonetically similar to "Mar Augin" (Awgin, from Eugene). Mar Augin is a confirmed KEEP_CANDIDATE in the allowlist, with four identity records already in the data (`mar-augin`, `mar-augin-saint-eugene`, `mar-augin-commemoration`, `mar-awgin-and-his-disciples`). If `mar-augustine` is a transliteration variant or data-entry duplicate of Mar Augin, the correct resolution is merging, not retention. The dates, however, do not align with the Mar Augin cluster dates (Sep 27, Aug 5, Jul 7, Nov 9), so this hypothesis cannot be confirmed without external evidence.

**Why not REMOVE_COE_TAG:** The Mar- prefix is a genuine East Syriac honorific and provides real positive evidence that a COE-native figure underlies this data. Removing the COE tag on the basis of data disorganisation alone would be wrong if a real Hudra figure exists here. The conservative posture is to hold, not to remove.

**Resolution path:** Determine from external Syriac sources (Budge's *Book of the Governors*, Wright's *Catalogue of Syriac Manuscripts*, the *Encyclopaedia Iranica* entry on the Church of the East calendar) whether any figure with a name approximating "Mar Augustine / Awgustin" appears in the Hudra. If yes: correct the dates, merge or retire the duplicate identity, add to the allowlist. If no figure is found: REMOVE_COE_TAG from both records.

---

## Summary counts

| Case | Final disposition | COE rows removed | Added to allowlist |
|---|---|---|---|
| `saint-ignatius-of-antioch` | REMOVE_COE_TAG | 2 | No |
| `saint-nicholas-of-myra` | REMOVE_COE_TAG | 1 | No |
| `saint-abraham-of-carrhae` | REMOVE_COE_TAG | 1 | No |
| `mar-augustine` | STILL_UNRESOLVED | 0 | No |
| `mar-augustine-commemoration` | STILL_UNRESOLVED | 0 | No |
| **Total** | | **4** | |

`commemorations.json`: 1,808 → 1,804 rows  
`identities.json`: unchanged  
`js/coe-eligibility.js`: unchanged (no new KEEP_CANDIDATEs)

---

## Did visible COE Layer 3 output change?

**No change to visible output.** All five identities remained excluded from the
`CoeEligibility` allowlist throughout this pass. Removing the COE tags from the
three `REMOVE_COE_TAG` cases means they will no longer appear in `resolveCommemorations(currentDate, 'COE')` results — but since they were not in the allowlist, `CoeEligibility.filter()` would have excluded them anyway. The filter output for any given date is identical before and after this pass.

The two `STILL_UNRESOLVED` cases (`mar-augustine`, `mar-augustine-commemoration`) retain their COE tags and remain excluded from the allowlist. They will continue to be filtered out by `CoeEligibility.filter()`.

---

## What remains after this pass

The COE data cleanup is now **complete** for all cases that can be decided with
available evidence. The COE calendar system stands as:

| Layer | Status |
|---|---|
| Layer 1 — season engine | ✅ Complete |
| Layer 2 — fixed/corporate commemorations | ✅ Complete |
| Layer 3 — sparse individual saints (via allowlist) | ✅ Active |
| All clearly resolvable NEEDS_REVIEW cases | ✅ Resolved |
| `mar-augustine` / `mar-augustine-commemoration` | ⏳ Awaiting external Syriac source evidence |

The single remaining open item is the `mar-augustine` cluster. It cannot be
resolved from within the project's existing data. It does not block Layer 3
display — the allowlist gate handles it correctly.

---

## Suggested `structure.json` update

Bump version to `2.8.9` (or next available) and add:

> "COE final five adjudication (v2.8.9): saint-ignatius-of-antioch (2 rows),
> saint-nicholas-of-myra (1 row), and saint-abraham-of-carrhae (1 row) removed
> from COE tags in commemorations.json — mechanical application confirmed.
> mar-augustine and mar-augustine-commemoration remain STILL_UNRESOLVED pending
> external Syriac source evidence on feast date and identity. COE Layer 3 output
> unchanged (none of the five were in the allowlist). Monthly caches: February,
> October, December regenerated."

---

## Deployment

Replace in repo:
```
data/saints/commemorations.json    (4 COE rows removed)
data/saints/saints-february.json   (saint-abraham-of-carrhae: COE tag removed)
data/saints/saints-october.json    (saint-ignatius-of-antioch: COE 10/17 removed)
data/saints/saints-december.json   (saint-ignatius-of-antioch: COE 12/20 removed;
                                    saint-nicholas-of-myra: COE 12/6 removed)
```

All other monthly caches, `js/coe-eligibility.js`, `js/office-ui.js`, and
`data/saints/identities.json` are unchanged and do not need redeployment.
