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

- Acts 15:18;
- Acts 23:26;
- James 1:8;
- 2 Corinthians 13:14 KJV;
- Hebrews 5:9-14 DRB;
- 3 John DRB metadata/content mismatch;
- Matthew Rotherham ledger label;
- KJV `&thorn;` artifacts.

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
