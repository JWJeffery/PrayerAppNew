# Bible Corpus Remediation Ledger

Status: active remediation ledger.
Created: 2026-06-20.
Owner: Lucy / architecture.
Scope: PrayerAppNew Bible corpus, excluding protected active Vulgate work.

## Non-negotiable trust rule

A Bible corpus is not trusted because a registry audit passes.

A Bible corpus is trusted only after it passes:

- active corpus boundary checks;
- schema/container contract checks;
- per-book chapter and verse cardinality;
- translation-column declaration checks;
- contamination and embedded-reference checks;
- versification and overlay reconciliation;
- named-defect closure from the forensic audit record.

## Protected active work

The following paths are active Vulgate work and are not part of this remediation tranche:

- `data/bible/translations/vulgate-clementine/**`
- `data/bible/translations/vulgate-psalter/**`
- `scripts/import-roman-breviary-1960-catholicbible-vulgate-pilot.mjs`

Do not modify, stage, commit, or normalize those paths in this Bible-corpus forensic cleanup thread.

## Closed finding: stale non-Vulgate source mirrors

Closed by commit `d3d1d49 Remove stale non-Vulgate Bible source mirrors`.

Removed from active corpus space:

- `data/bible/translations/kjv-1611/source/**`
- `data/bible/translations/nabre-internal-source-lane/source/**`

Scrubbed from:

- `web-release/DEPLOYMENT_MANIFEST.json`

Boundary rule going forward: non-Vulgate raw source mirrors must not live under `data/bible/translations/*/source/**` unless a later architecture decision creates an explicitly excluded, non-runtime source-witness lane.

## Forensic status by corpus family

### Canonical OT / protocanon

Trust status: quarantined.

Observed condition:

- structurally present;
- valid JSON;
- not text-trustworthy;
- NABRE alignment/versification problems across multiple chapters;
- Daniel has severe defects, including blank NABRE Daniel 11 and Greek material leakage concerns;
- Psalms is a separate subsystem and not normalized to the standard book/chapter/verse corpus contract.

Repair class:

- rule-based remap where text exists under a different verse/chapter address;
- true re-ingestion where source text is absent;
- canon-profile repair where Greek additions or alternate traditions leak into the wrong lane;
- separate Psalms architecture decision.

### Deuterocanon / apocrypha

Trust status: quarantined.

Observed condition:

- largely underbuilt;
- multiple severe stubs;
- 1 Maccabees is catastrophically underpopulated;
- several files need schema and governance decisions.

Repair class:

- rebuild or explicitly mark as scaffold/placeholder;
- do not surgically patch individual stubs as though the corpus is mostly complete.

### Canonical NT

Trust status: forensics closed, not repaired.

Observed condition:

- structurally healthier than OT;
- mature overlay mechanism exists and should inform OT repair strategy;
- KJV/NABRE pollution and metadata desync remain across the NT;
- bounded content defects remain.

Repair class:

- systemic cleanup for KJV/NABRE prefix and heading pollution;
- translation metadata declaration;
- overlay reconciliation;
- targeted content defects.

Named NT defects from audit record include:

- Acts 15:18 DRB — repaired as a main active row from DRB source;
- Acts 23:26 DRB — repaired as a main active row from DRB source;
- James 1:8 DRB — repaired as a main active row from DRB source;
- 2 Corinthians 13:14 KJV — repaired as a main active row from KJV source;
- Hebrews 5:9-14 DRB — repaired;
- 3 John DRB metadata/content mismatch;
- Matthew Rotherham ledger label;
- KJV `&thorn;` artifacts — repaired in active KJV lane text as Unicode thorn characters.

### Broader-canon corpus

Trust status: valid but incomplete.

Observed condition:

- JSON validity is clean across the audited tranche;
- dominant defect is incompleteness, not corruption;
- Odes subsystem is correctly identified but largely unpopulated;
- 3 and 4 Maccabees are severe stubs;
- Jubilees and Fetha Nagast have whole-chapter holes;
- Josippon and Miracles of Mary overstate synopsis-level content as full or unabridged;
- multiple non-standard container shapes need a formal contract.

Repair class:

- classify as usable prose, synopsis, scaffold, or source-required;
- correct overstated metadata;
- remove personal/source-intrusive text where identified;
- formalize container schema before browser promotion.

## Execution sequence

1. Add active-corpus boundary guard.
2. Add schema/container contract guard.
3. Repair canonical NT.
4. Prove canonical NT clean.
5. Design OT overlay/remap strategy.
6. Repair NABRE/OT.
7. Decide deuterocanon rebuild versus quarantine.
8. Decide broader-canon promotion targets.
9. Update `project_roadmap.json` and `structure.json` only after trust status changes are real.

## Current phase

Phase 0/1: ledger plus active-corpus boundary guard.

No Bible text repair is authorized in this phase.


## Phase 2: schema/container contract guard

Status: active guard added.

The Bible corpus currently recognizes these active container families outside registry/config files and protected Vulgate work:

- `chapters`
- `books`
- `sections`
- `liturgical_prologue_plus_miracles`
- `hymnal_stanzas`
- legacy root-array Psalms at `data/bible/OT/psalms.json`

Registry/config JSON and translation manifests are not Bible text containers and are excluded from this guard.

Known exception: `JUD` is duplicated by Jude and Judith pending deliberate identity correction. The guard records this as a warning, not a pass-by-forgetting.


### Phase 2 repair note

Translation `raw/**` and `source/**` lanes are excluded from the active schema/container guard. They are source or staging material, not normalized Bible-browser corpus containers.

This exclusion does not trust those files as complete or correct. It only prevents raw translation lanes, such as `data/bible/translations/drb-original-douay-rheims/raw/**`, from being misclassified as malformed active corpus.


## Phase 3A: canonical NT systemic contamination cleanup

Status: applied as bounded remediation.

Scope:

- canonical NT files only;
- KJV/NABRE leading verse-reference prefixes stripped where the prefix matched the current chapter and verse;
- KJV HTML `&thorn;` artifacts normalized to `þ`;
- actual NT translation columns declared in file metadata.

Not in scope:

- missing canonical NT verses;
- DRB missing-content defects;
- Rotherham overlay or ledger-label repair;
- NABRE heading extraction;
- broader OT, deuterocanon, Psalms, Odes, or Vulgate work.


## Phase 3B: canonical NT DRB bounded repair

Status: applied as bounded remediation.

Scope:

- `data/bible/NT/hebrews.json` DRB populated for Hebrews 5:9-14 from `data/bible/translations/drb-original-douay-rheims/raw/hebrews.json`.
- `data/bible/NT/3john.json` DRB populated where matching active verse rows and raw DRB source text exist from `data/bible/translations/drb-original-douay-rheims/raw/3-john.json`.

Not in scope:

- Acts 15:18;
- Acts 23:26;
- James 1:8;
- 2 Corinthians 13:14;
- Matthew Rotherham overlay label;
- any Vulgate work.


### Phase 3B correction: 3 John DRB versification

The DRB raw lane for 3 John supplies verses 1-14. Active `data/bible/NT/3john.json` contains an active verse 15 for other translations, but no raw DRB verse 15 exists in `data/bible/translations/drb-original-douay-rheims/raw/3-john.json`.

Therefore this tranche intentionally populates DRB for 3 John 1:1-14 only. 3 John 1:15 remains a versification/overlay decision, not a missing raw-text patch.


## Phase 3C: canonical NT named-defect guard

Status: active guard added.

This guard prevents a false “canonical NT clean” claim.

Resolved and guarded:

- Hebrews 5:9-14 DRB populated from the DRB raw lane.
- 3 John 1:1-14 DRB populated from the DRB raw lane.

Intentionally unresolved:

- Acts 15:18 active row missing.
- Acts 23:26 active row missing.
- James 1:8 active row missing.
- 2 Corinthians 13:14 active row missing.
- 3 John 1:15 DRB remains unpopulated because the DRB raw lane has no verse 15.

These unresolved items require a source/versification/overlay decision before any data patch.


## Phase 3D: DRB split-verse overlays for canonical NT

Status: applied as bounded remediation.

Decision:

- Acts 15:18, Acts 23:26, and James 1:8 remain unresolved as active main rows.
- DRB text for those references is present in the DRB raw lane and has been added as DRB translation overlays.
- Main-row insertion is not authorized because the surrounding NRSV, KJV, and NABRE rows reflect split/merge versification rather than a uniform missing-row defect.
- 2 Corinthians 13:14 remains unresolved. Active NRSV/NABRE place the final blessing at 13:13, DRB raw also ends at 13:13, and KJV needs a source-backed translation-specific overlay decision.

Scope:

- `data/bible/NT/acts.json` translation overlay for DRB Acts 15:18 and Acts 23:26.
- `data/bible/NT/james.json` translation overlay for DRB James 1:8.
- `scripts/audit-bible-canonical-nt-named-defects.mjs` updated to guard the overlay state.

Not in scope:

- KJV overlay for 2 Corinthians 13:14;
- main-row insertion for Acts 15:18, Acts 23:26, or James 1:8;
- any Vulgate work.


## Phase 3E: KJV overlay for 2 Corinthians 13:14

Status: applied as bounded remediation.

Decision:

- 2 Corinthians 13:14 is not inserted as an active main row.
- Active NRSV/NABRE place the final blessing at 13:13.
- DRB raw also ends at 13:13.
- KJV 1611 preserves a translation-specific 13:14 numbering.
- KJV 2 Corinthians 13:14 was recovered from the historical deleted KJV source mirror in repo history and added as a KJV translation overlay.

Source evidence:

- commit: `88f0b9811a83d55b976d08bbec5024b47a4b282e`
- path: `data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/2 Corinthians.json`

Scope:

- `data/bible/NT/2corinthians.json` translation overlay for KJV 13:14.
- `scripts/audit-bible-canonical-nt-named-defects.mjs` updated to guard the overlay state.

Not in scope:

- main-row insertion for 2 Corinthians 13:14;
- any Vulgate work.


## Phase 4A: whole-corpus trust boundary

Status: active.

Decision:

The canonical NT named-defect tranche is complete, but the whole biblical corpus is not textually trusted.

This phase records the difference between:

- structurally recognized corpus files;
- active boundary/schema guard success;
- canonical NT named-defect remediation;
- actual whole-corpus textual trust.

Current trust status:

- Canonical NT: named-defect tranche complete.
- Canonical OT: not trusted pending NABRE/versification remediation.
- Psalms: not trusted; legacy subsystem requiring separate architecture.
- Deuterocanon: not trusted; underbuilt files require rebuild, quarantine, or explicit scope declaration.
- Broader canon: not trusted; governance and completeness decisions pending.
- Vulgate: excluded active work in protected paths.

Forbidden claims until later remediation:

- whole Bible corpus clean;
- entire biblical corpus trusted;
- OT textually okay;
- deuterocanon complete;
- Psalms normalized;
- broader canon complete.


## Phase 4B: canonical OT NABRE prefix cleanup

Status: applied as bounded remediation.

Decision:

The canonical OT active files contained mechanical NABRE `chapter:verse` prefixes across all 38 books. This phase removes only those mechanical leading references from active NABRE text.

Scope:

- Canonical OT active files only.
- NABRE text only.
- Leading `chapter:verse` prefixes only when the prefix matches the active row coordinate.

Not in scope:

- missing NABRE rows;
- Daniel 11 NABRE absence;
- Malachi 4 NABRE absence;
- Esther Greek-extension row-grid decisions;
- OT versification/remap architecture;
- Psalms;
- deuterocanon and broader canon;
- any Vulgate work.

Trust status:

Canonical OT remains not trusted pending versification remediation.


## Phase 4C: Malachi NABRE versification overlay

Status: applied as bounded remediation.

Decision:

Malachi is repaired with a translation overlay, not by inserting active main rows.

Source evidence:

- NABRE historical source path: `data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Malachi.json`
- NABRE historical source commit: `d0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6`
- Source rows: Malachi 3:19-24
- Active rows: Malachi 4:1-6

Mapping:

- NABRE 3:19 -> active Malachi 4:1
- NABRE 3:20 -> active Malachi 4:2
- NABRE 3:21 -> active Malachi 4:3
- NABRE 3:22 -> active Malachi 4:4
- NABRE 3:23 -> active Malachi 4:5
- NABRE 3:24 -> active Malachi 4:6

Scope:

- `data/bible/OT/malachi.json`
- `translationOverlays.NABRE.4.1-6`
- no active main-row insertion for 3:19-24;
- no changes to KJV, NRSV, Rotherham, Psalms, deuterocanon, broader canon, or Vulgate.

Trust status:

Canonical OT remains not trusted pending broader missing-row and versification remediation.


## Phase 4D: minor prophet NABRE overlay batch 1

Status: applied as bounded remediation.

Decision:

A source-backed minor-prophet NABRE overlay batch was applied for only the inspected mappings where:

- the historical NABRE source row exists;
- the active target row exists;
- the active target row lacks main NABRE text.

Source evidence:

- source commit: `d0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6`
- source lane: `data/bible/translations/nabre-internal-source-lane/source/generated_data/books/*.json`

Applied overlay scope:

- Hosea 2:1 -> active 1:10
- Hosea 2:2 -> active 1:11
- Hosea 12:1 -> active 11:12
- Joel 3:1-5 -> active 2:28-32
- Joel 4:6-21 -> active 3:6-21
- Jonah 2:1 -> active 1:17
- Micah 5:14 -> active 5:15
- Nahum 2:1 -> active 1:15
- Zechariah 2:1-4 -> active 1:18-21

Explicitly not applied:

- Joel 4:1-5 -> active 3:1-5 because active main NABRE is already present.
- Hosea 14:10 because active Hosea 14:10 is not present.
- Micah 5:15 direct mapping because no source text was found.
- Hosea 13:16 because it was not source-mapped by this inspection.

Trust status:

Canonical OT remains not trusted pending remaining missing-row and versification remediation.


## Phase 4E: Pentateuch NABRE overlay batch 1

Status: applied as bounded remediation.

Decision:

A source-backed Pentateuch NABRE overlay batch was applied only for inspected mappings where the historical NABRE source row exists, the active target row exists, and the active target lacks main NABRE text.

Source evidence:

- source commit: `d0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6`
- source lane: `data/bible/translations/nabre-internal-source-lane/source/generated_data/books/*.json`

Applied overlay scope:

- Genesis 32:1 -> active 31:55
- Exodus 8:25-28 -> active 8:29-32
- Exodus 22:30 -> active 22:31
- Leviticus 6:17-23 -> active 6:24-30
- Numbers 17:1-15 -> active 16:36-50
- Deuteronomy 13:1 -> active 12:32
- Deuteronomy 23:1 -> active 22:30

Explicitly not applied:

- Numbers 30:16 because the inspection did not produce a clean usable mapping.
- Deuteronomy 29:29 because the source candidate evidence was weak.
- Any Daniel, Esther, Psalms, deuterocanon, broader canon, or Vulgate material.

Trust status:

Canonical OT remains not trusted pending remaining missing-row and versification remediation.


## Phase 4F: Historical NABRE strong overlay batch 1

Status: applied as bounded remediation.

Decision:

A source-backed historical-book NABRE overlay batch was applied only for the four strong mappings from the corrected historical inspection.

Source evidence:

- source commit: `d0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6`
- source lane: `data/bible/translations/nabre-internal-source-lane/source/generated_data/books/*.json`

Applied overlay scope:

- 1 Chronicles 6:64 -> active 6:73
- 1 Chronicles 6:66 -> active 6:75
- Nehemiah 4:13 -> active 4:19
- Nehemiah 4:14 -> active 4:20

Explicitly not applied:

- Medium and weak historical candidates.
- Any Daniel, Esther, Job, prophets outside existing bounded batches, Psalms, deuterocanon, broader canon, or Vulgate material.

Trust status:

Canonical OT remains not trusted pending remaining missing-row and versification remediation.


## Phase 4G: Daniel NABRE safe overlay batch 1

Status: applied as bounded remediation.

Decision:

Only the safe Daniel mappings identified by source inspection were applied.

Applied overlay scope:

- Daniel 4:32 -> active 4:35
- Daniel 4:33 -> active 4:36
- Daniel 4:34 -> active 4:37

Explicitly not applied:

- Daniel 5:31 because the best source candidate was weak.
- Daniel 11 because no Daniel 11 source rows were present in the NABRE source file.
- Daniel 3 Greek-addition material because that requires separate governance against DanielGK / Greek-addition handling.

Trust status:

Canonical OT remains not trusted pending remaining Daniel, historical, wisdom, prophetic, and singleton remediation.


## Phase 4H: Singleton NABRE strong overlay batch 1

Status: applied as bounded remediation.

Decision:

Only the strong singleton mappings identified by source inspection were applied.

Applied overlay scope:

- Deuteronomy 29:28 -> active 29:29
- Job 41:19 -> active 41:27
- Isaiah 9:20 -> active 9:21
- Jeremiah 9:25 -> active 9:26
- Hosea 14:1 -> active 13:16

Explicitly not applied:

- Medium and weak singleton candidates.
- Daniel 11.
- Greek-addition material.
- Psalms, deuterocanon, broader canon, or Vulgate material.

Trust status:

Canonical OT remains not trusted pending remaining unresolved rows and separate governance for Daniel / Greek-addition material.


## Phase 4I: Singleton NABRE medium overlay batch 1

Status: applied as bounded remediation.

Decision:

Eight manually reviewed medium-confidence singleton mappings were applied after source and active text comparison.

Applied overlay scope:

- 2 Chronicles 2:17 -> active 2:18
- 2 Chronicles 14:14 -> active 14:15
- Job 41:21 -> active 41:29
- Job 41:23 -> active 41:31
- Job 41:24 -> active 41:32
- Job 41:26 -> active 41:34
- Ecclesiastes 5:19 -> active 5:20
- Isaiah 64:11 -> active 64:12

Explicitly not applied:

- Song of Solomon 7:1 -> active 6:13 because the NABRE source row includes heading/speaker-marker residue.
- Weak singleton candidates.
- Daniel 11.
- Greek-addition material.
- Psalms, deuterocanon, broader canon, or Vulgate material.

Trust status:

Canonical OT remains not trusted pending remaining unresolved rows and separate governance for Daniel / Greek-addition material.


## Phase 4J: Non-Daniel special-case NABRE overlay batch 1

Status: applied as bounded remediation.

Decision:

Reviewed non-Daniel special-case mappings were applied where source and active text aligned and the source row did not carry obvious heading-only residue.

Applied overlay scope:

- Numbers 30:1 -> active 29:40
- 2 Samuel 19:1 -> active 18:33
- 1 Kings 5:2-5, 5:7-8, 5:10-13 -> active 4:22-25, 4:27-28, 4:30-33
- 1 Chronicles 6:52-57, 6:59, 6:61-66 -> active 6:67-72, 6:74, 6:76-81
- Nehemiah 4:15-17 -> active 4:21-23
- Job 41:22 -> active 41:30
- Ezekiel 21:2-5 -> active 20:46-49

Explicitly not applied:

- 1 Samuel 24:1 -> active 23:29 because the source row carries section-heading residue.
- 1 Kings 5:1, 5:6, 5:9, and 5:14 because the source rows carry section-heading residue.
- 2 Kings 12:1 -> active 11:21 because the source row carries heading residue.
- Nehemiah 10:1 -> active 9:38 because the source row carries heading residue.
- Song of Solomon 7:1 -> active 6:13 because the source row carries heading/speaker-marker residue.
- Ezekiel 22:17 -> active 20:45 because the candidate is formulaic and contextually wrong.
- Remaining weak/reject rows.
- Daniel 11.
- Greek-addition material.
- Psalms, deuterocanon, broader canon, or Vulgate material.

Trust status:

Canonical OT remains not trusted pending remaining unresolved rows and separate governance for Daniel / Greek-addition material.


## Phase 4K: Canonical OT NABRE residual classification

Status: classified, not resolved.

Decision:

The remaining canonical OT NABRE gaps were classified after the bounded overlay remediation batches. This does not insert Bible text and does not mark canonical OT trusted.

Classified residual count:

- Total: 59
- Non-Daniel: 13
- Daniel: 46

Classification summary:

- Source row has heading / section-heading / speaker-marker residue.
- Candidate rejected as context mismatch.
- Candidate requires split/partial-row review.
- Daniel 5:31 requires separate review.
- Daniel 11:1-45 has no source rows in the historical NABRE source file and must not be synthesized.

Trust status:

Canonical OT remains not trusted pending explicit governance over classified residuals, Daniel 11, and Greek-addition handling.


## Phase 4L: Daniel / Greek governance boundary

Status: governed, not textually resolved.

Decision:

Daniel standard-text repair and Greek/deuterocanonical Daniel material are separated by explicit governance.

Rules:

- Standard Daniel remains `data/bible/OT/daniel.json`.
- Greek Daniel remains `data/bible/OT/danielGK.json`.
- Do not import Greek-addition rows from the historical NABRE source into standard Daniel as a NABRE repair.
- Daniel 13 and 14 are not added to standard Daniel.
- Daniel 11:1-45 remains classified because the historical NABRE source file has no Daniel 11 rows.
- Daniel 5:31 remains classified pending separate review.
- DRB raw Daniel is not a source for NABRE overlays.

Trust status:

Canonical OT remains not trusted pending remaining unresolved-row policy, Psalms subsystem work, deuterocanon, and broader canon governance.


## Phase 4M: Psalms legacy subsystem governance

Status: governed, not textually trusted.

Decision:

Psalms are not a normal canonical OT chapter file. `data/bible/OT/psalms.json` remains a governed 155-record root-array psalter subsystem.

Observed shape:

- 155 records.
- Psalm IDs: `PSALM 1` through `PSALM 155`.
- Psalms 1-150 contain the main psalm translation lanes.
- Grail1963 has 151 records.
- Orthodox has Psalms 151-155.
- Existing repo consumers and audits expect the 155-record psalter array.

Rules:

- Do not convert Psalms to the standard canonical OT chapter schema in this tranche.
- Do not mark the NRSV Psalms lane trusted as Bible NRSV from this governance pass.
- Do not remove Psalms 151-155 as a side effect of canonical OT repair.
- Treat Grail1963 and Orthodox as psalter / appendix lanes requiring their own source adjudication.

Trust status:

Psalms are governed but remain not textually trusted pending provenance and translation-label adjudication. Trust-boundary status remains explicitly `not_trusted_*`; governance is not a trust claim.


## Phase 4N: Deuterocanon DRB completion tranche 1

Status: applied as bounded text remediation.

Decision:

Direct DRB source rows were used to complete DRB lanes for deuterocanonical books where the source identity is unambiguous and the target book can be expanded without resolving Greek/Daniel, Tobit/Tobias, Sirach, Letter of Jeremiah, or 3/4 Maccabees governance.

Applied scope:

- Judith from DRB raw Judith.
- Wisdom from DRB raw Wisdom.
- Baruch chapters 1-5 from DRB raw Baruch.
- 1 Maccabees from DRB raw 1 Machabees.
- 2 Maccabees from DRB raw 2 Machabees.
- Prayer of Manasseh from DRB raw Prayer of Manasseh.
- 1 Esdras from DRB raw 3 Esdras.
- 2 Esdras from DRB raw 4 Esdras.

Preservation rule:

Existing active translation lanes were preserved by reference where present. DRB was added from source rows; this tranche does not claim NABRE/KJV/NRSV completion.

Explicitly not applied:

- Tobit / Tobias, pending chapter-zero and source-shape handling.
- Sirach / Ecclesiasticus, pending versification/source-shape handling.
- Letter of Jeremiah, pending Baruch chapter 6 split handling.
- Daniel Greek and Esther Greek, pending Greek-book governance handling.
- 3 Maccabees and 4 Maccabees, because no direct source was identified in the local inventory.
- Vulgate active work.

Trust status:

Deuterocanon remains not trusted/underbuilt pending remaining books and translation-lane adjudication.


## Phase 4O: Deuterocanon DRB/NABRE completion tranche 2

Status: applied as bounded text remediation.

Decision:

Tobit, Sirach, and Letter of Jeremiah were expanded from reviewed direct source shapes.

Applied scope:

- Tobit: DRB from raw Tobias, excluding the chapter-zero title row; NABRE from historical Tobit source.
- Sirach: DRB from raw Ecclesiasticus; NABRE from historical Sirach source.
- Letter of Jeremiah: DRB and NABRE from Baruch chapter 6, split into active Letter of Jeremiah chapter 1.

Preservation rule:

Existing active translation lanes were preserved by reference where present. DRB and NABRE were added from source rows. This tranche does not claim KJV/NRSV completion.

Explicitly not applied:

- Daniel Greek and Esther Greek, pending Greek-book governance handling.
- 3 Maccabees and 4 Maccabees, because no direct source was identified in the local inventory.
- Vulgate active work.

Trust status:

Deuterocanon remains not trusted/underbuilt pending remaining books and translation-lane adjudication.


## Phase 4P: Deuterocanon remaining governance

Status: governed, not textually trusted.

Decision:

The remaining deuterocanonical problem set is now explicitly classified rather than silently patched.

Greek books:

- Greek Esther is not safe for simple full-source overlay. Active, DRB, and NABRE shapes differ materially.
- Greek Daniel is not safe for simple full-source overlay. Active, DRB, and NABRE shapes differ materially and must remain under Greek Daniel governance.

3/4 Maccabees:

- Active 3 Maccabees has 40 sparse raw-text rows.
- Active 4 Maccabees has 46 sparse raw-text rows.
- Repo-history candidates inspected so far do not provide a controlled full local source. The parseable historical active-path copies are identical to the current sparse files; other inspected candidates were not parseable in the current JSON inspection.
- Do not promote these sparse files as complete.

Blocked patches:

- No simple Greek Esther overlay.
- No simple Greek Daniel overlay.
- No 3 Maccabees sparse-file promotion.
- No 4 Maccabees sparse-file promotion.

Trust status:

Deuterocanon remains not trusted/underbuilt pending separate Greek-book adjudication and 3/4 Maccabees source acquisition or explicit exclusion governance.


## Phase 4Q: Broader canon governance

Status: governed, not textually trusted.

Decision:

Broader-canon files are now classified as a separate governed raw-text corpus lane. This is not a text repair and not a trust claim.

Observed scope:

- Candidate count: 38.
- Zero-row governed artifacts: 2.
- Raw-text-only governed artifacts: 36.

Rules:

- Do not promote broader-canon files into canonical OT, NT, Psalms, or deuterocanon completion.
- Do not mark broader-canon raw-text files as source-verified.
- Do not mark zero-row broader-canon artifacts as complete.
- Do not normalize broader-canon file shape in this tranche.
- Keep broader-canon status explicitly `not_trusted_governance_pending`.

Trust status:

Broader canon remains not trusted pending source/provenance adjudication and separate inclusion governance.


## Phase 4R: Bible corpus recovery consolidation

Status: consolidated, not globally trusted.

Decision:

This consolidation records the actual post-remediation state and prevents overclaiming.

Lane state:

- Canonical NT: named-defect tranche complete and guarded.
- Canonical OT: source-backed remediation and residual classification present, still not globally trusted.
- Psalms: governed legacy psalter subsystem, still not textually trusted.
- Deuterocanon: direct DRB/NABRE tranches applied where controlled; Greek books and 3/4 Maccabees remain governed unresolved work.
- Broader canon: governed raw-text corpus lane, not source-adjudicated.
- Vulgate: excluded active work.

Blocked claims:

- Do not claim the entire biblical corpus is trusted.
- Do not claim canonical OT, Psalms, Deuterocanon, Broader Canon, or Vulgate are complete beyond their explicit lane statuses.

Next work may return to Vulgate active-work recovery with protected dirty status preserved.
## Phase 4S: canonical OT residual checkpoint and range realignment

Status: consolidated checkpoint passed; canonical OT still not globally trusted.

Decision:

The canonical OT residual checkpoint after source-backed residual repair passed with:

- Ledger targets: 13 of 15 closed.
- Governed remaining: 2 of 15.
- Remaining governed blockers:
  - Nehemiah 7:73, split/partial-row review required.
  - Daniel 11:1-45, historical NABRE source chapter absent; no synthetic overlay authorized.

Closed residual ledger targets in this pass:

- 1 Samuel 23:29.
- 1 Kings 4:21.
- 1 Kings 4:26.
- 1 Kings 4:29.
- 1 Kings 4:34.
- 2 Kings 11:21.
- Nehemiah 9:38.
- Song of Solomon 6:13.
- Daniel 5:31.
- Nehemiah 4:18, closed through the broader Nehemiah 4:15-23 range realignment.
- Job 41:28, closed through the broader Job 41:24-34 range realignment.
- Job 41:33, closed through the broader Job 41:24-34 range realignment.
- Ezekiel 20:45, closed through the broader Ezekiel 20:45-49 range realignment.

Range realignments applied:

- Nehemiah 4:15-23 mapped to controlled NABRE source Nehemiah 4:9-17.
- Job 41:24-34 mapped to controlled NABRE source Job 41:16-26.
- Ezekiel 20:45-49 mapped to controlled NABRE source Ezekiel 21:1-5.

Important correction to earlier phases:

Earlier “not applied,” “weak,” “heading residue,” or “formulaic mismatch” classifications for the rows now listed as closed are superseded by the explicit source-backed repair commits in this pass. Those earlier classifications remain useful forensic history, but they are no longer the current state for the closed targets.

Trust status:

Canonical OT residual target remediation is checkpointed, but canonical OT is still not globally trusted. The remaining governed blockers, Psalms subsystem, deuterocanon, broader canon, and protected Vulgate work remain outside this closure claim.

Do not claim:

- whole Bible corpus trusted;
- canonical OT globally trusted;
- Psalms normalized;
- deuterocanon complete;
- broader canon complete;
- Vulgate recovered.

Next allowed work:

- Preserve protected active Vulgate dirty state unless Josh explicitly resumes Vulgate recovery.
- Treat Nehemiah 7:73 and Daniel 11:1-45 as governed blockers, not simple missing-row defects.
- If global Bible trust is pursued, run a new comprehensive corpus trust audit rather than relying on this residual checkpoint.

## Phase 4T: DRB Psalms active psalter lane

Status: applied as bounded psalter-lane remediation.

Decision:

The governed 155-record active psalter remains in place. DRB Psalm text was populated only for Psalms 1-150 from the preserved DRB raw source lane.

Source evidence:

- Source path: `data/bible/translations/drb-original-douay-rheims/raw/psalms.json`.
- Source manifest records 150 chapters and 2,527 verse rows.
- Active target: `data/bible/OT/psalms.json`.

Applied scope:

- DRB added to active Psalms 1-150.
- 2,527 DRB Psalm verse rows imported.
- Existing Rotherham Psalms 1-150 lane preserved.
- Psalms 151-155 remain outside DRB and Rotherham source scope.

Guard status:

- `scripts/audit-rotherham-psalms.mjs` passed.
- `scripts/audit-douay-rheims-psalms.mjs` passed after module-syntax repair.

Trust status:

This is not a global Psalms trust claim. Psalms remain a governed legacy psalter subsystem. The bounded claim is only that Rotherham and DRB Psalm lanes are populated and guarded for Psalms 1-150, while Psalms 151-155 remain extended/Orthodox-scope material requiring separate source adjudication.

## Phase 4U: Roman Breviary Vulgate pilot lanes

Status: applied as bounded source-lane pilot.

Decision:

The previously protected Vulgate active-work set has been validated, committed, and pushed as a bounded Roman Breviary Vulgate pilot lane. This converts the local dirty Vulgate tranche into committed source-lane data, but it does not make a full Vulgate trust claim.

Applied scope:

- Clementine Vulgate pilot source lane:
  - Job: 3 chapters, 72 verse rows.
  - 1 Corinthians: 1 chapter, 58 verse rows.
- Vulgate Psalter pilot source lane:
  - Psalms: 9 chapters, 128 verse rows.
- Importer committed: `scripts/import-roman-breviary-1960-catholicbible-vulgate-pilot.mjs`.

Source posture:

- Source witness: CatholicBible.online Vulgate.
- Clementine status: pilot source selected, pending full Clementine adjudication.
- Psalter status: pilot source selected, pending full Psalter adjudication.

Trust status:

This is not a full Vulgate corpus completion claim. The Vulgate lane remains not textually trusted pending full source adjudication, full corpus coverage decisions, and integration policy.

## Phase 4W: Canonical OT residual policy review

Status: governed policy review recorded; no Bible text mutated.

Decision:

The remaining canonical OT residual blockers are not safe single-row repairs. They remain governed policy items and do not justify synthetic NABRE text construction.

Remaining governed targets:

- Nehemiah 7:73:
  - Classification: governed split/partial review.
  - Active row contains transition material that overlaps the settlement close and the Nehemiah 8 opening transition.
  - Policy: do not synthesize a replacement without adapter/versification policy for split transition material.

- Daniel 11:1-45:
  - Classification: governed source absent / no synthetic overlay.
  - Historical controlled NABRE source lane does not supply Daniel 11 rows.
  - Policy: do not synthesize a NABRE overlay. Requires controlled source acquisition or explicit governed exclusion.

Trust status:

Canonical OT remains not trusted pending versification remediation. This phase records policy posture only and does not close canonical OT trust.

