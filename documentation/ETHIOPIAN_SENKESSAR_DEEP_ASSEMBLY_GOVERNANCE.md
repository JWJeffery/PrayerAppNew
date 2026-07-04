# Governance Memo: Ethiopian Senkessar Deep Assembly Corpus

**Authorized by:** Josh  
**Status:** Accepted governance clarification  
**Scope:** Ethiopian Sa'atat; Ethiopian Senkessar / Synaxarium; runtime saint-commemoration slot; legacy AI-generated hagiographical prose  
**Decision type:** Retroactive rationale and pre-shipment review rule  
**Recorded:** 2026-07-04

## 1. Governing clarification

The Ethiopian Senkessar / Synaxarium "Deep Assembly" corpus was created to complete a runtime liturgical slot in the Ethiopian Sa'atat lane.

It was not created as an Anglican Synaxarium corpus, nor as a general collection of detachable saint biographies. The Sa'atat renderer already contained an `eth-saints-commemoration` slot designed to resolve the Ethiopian calendar date and render the appointed Senkessar reading for that day. Before the Deep Assembly work, that slot was structurally present but functionally underfilled: the app had a place for the daily Ethiopian synaxarial reading, but lacked a complete per-day Senkessar corpus to render.

The Deep Assembly project filled that gap across the Ethiopian year, including the thirteen Ethiopian months. Its purpose was to prevent the Ethiopian Sa'atat from shipping with a daily saint-commemoration slot that regularly fell back to generic Oriental Orthodox intercession or placeholder behavior.

## 2. Nature of the Deep Assembly method

The "Deep Assembly" method should be understood as a production method for creating daily, office-readable Senkessar prose.

The method appears to have used multiple witnesses per day and woven them into a concise liturgical narrative. This was a practical and editorial solution once the decision had been made that the Ethiopian lane should contain daily Senkessar readings rather than generic fallback text.

The corpus therefore belongs first to the Ethiopian Sa'atat implementation as office-embedded synaxarial material.

## 3. Category distinction

The Ethiopian Senkessar corpus must not be confused with the Anglican Synaxarium project.

For governance purposes, these are distinct categories:

- **Ethiopian Sa'atat Senkessar reading** — tradition-specific office-embedded synaxarial material.
- **Anglican Synaxarium hagiography** — Anglican-governed hagiographical prose written under the Anglican Synaxarium criteria.
- **Research dossier / source packet** — source apparatus, witnesses, variants, disputed facts, and inclusion rationale.
- **Podcast or audio script** — compressed devotional narration, distinct from either full hagiography or office-embedded liturgical reading.

No Ethiopian Senkessar Deep Assembly entry should be automatically migrated into An Anglican Synaxarium. If an Ethiopian saint is later included in the Anglican Synaxarium, the Ethiopian Senkessar text may be consulted as a source witness or comparative hagiographical model, but the Anglican entry must be newly governed under Anglican Synaxarium criteria.

## 4. Pre-shipment review requirement

Because the Deep Assembly corpus was produced under an earlier AI/model period, it must be reviewed before shipment.

This review should be non-destructive at first. The initial pass should classify every entry, not rewrite it.

Each entry should be evaluated for:

- source fidelity;
- whether the prose is translation, paraphrase, condensation, original synthesis, or devotional reconstruction;
- hagiographical quality;
- faithfulness to Ethiopian Orthodox devotional grammar;
- treatment of miracle, asceticism, martyrdom, repentance, intercession, angels, demons, relics, and other traditional hagiographical elements;
- avoidance of embarrassed rationalism or modern flattening;
- avoidance of hallucinated specificity;
- oral readability inside the office;
- length and daily-use suitability;
- whether the entry should remain full-length, receive a shorter office form, be lightly edited, be fully rewritten, be source-checked, or be retained only as archive material.

## 5. Review classifications

Each daily Senkessar entry should receive one of the following statuses:

- `ship_ready`
- `light_edit_needed`
- `hagiographical_review_needed`
- `source_check_needed`
- `length_review_needed`
- `full_rewrite_needed`
- `archive_only`
- `unknown_status`

These statuses should be recorded in a manifest before any broad rewrite pass begins.

## 6. Required manifest

Create or update a manifest for the Ethiopian Senkessar corpus with, at minimum:

- Ethiopian month;
- day;
- file path;
- title / feast / saint names;
- whether the entry is referenced by `senkessar-index.json`;
- current runtime status;
- approximate word count;
- suspected prose origin, if known;
- Deep Assembly status, if known;
- review classification;
- notes on source, length, or theological/hagiographical concerns.

The manifest should also identify gaps, duplicates, missing index links, suspiciously short entries, suspiciously long entries, and any entries that appear to be generic fallback prose rather than real Senkessar material.

## 7. Editorial principle

The Ethiopian Senkessar material should be reviewed as hagiography, not as encyclopedia prose.

The review should preserve the spiritual and literary instincts of traditional Christian hagiography. Miracles, ascetic struggle, martyrdom, demonic opposition, angelic assistance, relics, repentance, monastic obedience, royal conversion, episcopal witness, and intercession should not be stripped out merely because they are unfamiliar to modern Western readers.

At the same time, the corpus must not make unsupported claims, invent details, or conceal uncertainty where the source base is weak. Reverence does not excuse inaccuracy.

## 8. Implementation posture

Do not begin by rewriting the full corpus.

1. First step: inventory and classify.
2. Second step: pilot review one Ethiopian month, preferably the month whose Deep Assembly thread has already been recovered.
3. Third step: refine the review rubric based on the pilot.
4. Fourth step: proceed month by month.

Any model-assisted rewrite must preserve a clear distinction between:

- source-derived Ethiopian synaxarial material;
- editorial condensation;
- devotional reconstruction;
- app-specific office reading form.

## 9. Governing formula

The Deep Assembly corpus completed a liturgical promise already made by the Ethiopian Sa'atat renderer: that the daily office would include the day's Ethiopian Senkessar remembrance. It is therefore a runtime office corpus, not a free-standing Anglican hagiography corpus. It should be reviewed before shipment with the seriousness due to office-embedded synaxarial material.
