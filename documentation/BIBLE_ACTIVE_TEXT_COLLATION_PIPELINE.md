# Bible Active Text Collation Pipeline

This pipeline is read-only for Bible corpus text.

## Phase 1

Phase 1 added an inventory scaffold: registry loading, active text crawling, shallow lane-label classification, compact reporting, and a CLI runner.

`registered_text` means only that a lane label is known to the registry. It does not mean the cell has been checked against an external witness or approved for a wider trust claim.

## Phase 2

Phase 2 ingests existing governed collation/status records and allows the active-text report to classify cells as `exact_source_collated` only when an existing result record covers the active file/lane and the observed row count matches the governed record count.

This phase does not run new live source comparison. It inherits already-recorded evidence from existing registry records and keeps unresolved/policy-blocked lanes blocked or registered-only.

The compact report includes these flags:

- `phase: "source_collation_record_ingestion"`
- `trustAssertionsMade: false`
- `bibleTextMutated: false`
- `sourceCollationPerformed: false`
- `sourceCollationEvidenceIngested: true`

## Phase 3

Phase 3 keeps the pipeline read-only and tightens classification hygiene. Generic `text` fields and fallback text leaves are classified as `active_text_untyped` instead of `unregistered_source:text`.

That keeps `unregistered_source` reserved for actual source or lane labels that need registry decisions, while still surfacing untyped active text as unresolved inventory work.

## Phase 4

Phase 4 keeps the pipeline read-only and adds bounded triage breakdowns to the compact report.

The report now includes top unresolved files, top untyped text files, top untyped source shapes, top blocked files, and top missing-source files. These are review aids only. They do not mutate text, create source claims, or replace the full runtime report.

## Phase 5

Phase 5 keeps the pipeline read-only and adds corpus-root/file-scope breakdowns under `classificationBreakdowns.fileScopeBreakdowns`.

These breakdowns separate `data/bible/ET`, `data/bible/OT`, `data/bible/NT`, and other Bible inventory roots so untyped active text can be triaged as Eastern single-text inventory, OT/broader-canon inventory, NT/Christian-witness inventory, or other inventory before any source, shape, or placement decision is made.

## Phase 6

Phase 6 keeps the pipeline read-only and adds top-file lists grouped by file scope under `classificationBreakdowns.fileScopeBreakdowns`.

The grouped lists show top untyped and unresolved files separately for Eastern single-text inventory, OT/broader-canon inventory, NT/Christian-witness inventory, and other Bible inventory. These lists are review aids only and do not authorize text repair, source claims, or placement changes.

## Phase 7

Phase 7 keeps the pipeline read-only and adds `releasePostureSummary` to the compact report.

The summary maps report classifications into triage-only release posture buckets: source-collated evidence, registered but not collated, blocked source or license, missing source, untyped active text, and other unresolved. This is not a trust assertion and does not authorize public release.

## Phase 8

Phase 8 keeps the pipeline read-only and extends `releasePostureSummary` with file-scope breakdowns.

The summary now includes `countsByFileScope` and `fileScopesByPosture`, showing how release posture is distributed across Eastern single-text inventory, OT/broader-canon inventory, NT/Christian-witness inventory, and other Bible inventory. These are triage aids only and do not change text, trust, or release status.

## Phase 9

Phase 9 keeps the pipeline read-only and adds `collationEvidenceRecordSummary` to the compact report.

The summary groups active cells by the existing governed collation/status record that supplied inherited evidence. It shows evidence-record counts, classifications by evidence record, release postures by evidence record, and top files by evidence record. This is inherited evidence only; the report still does not perform live source collation or authorize new trust claims.

## Phase 10

Phase 10 keeps the pipeline read-only and adds `coverageSummary` to the compact report.

The summary compares active cells with inherited governed record evidence against active cells still outside inherited evidence coverage. It reports coverage totals, classification and posture splits, and top files without inherited evidence. This is triage-only and does not change text, trust, or release status.

## Phase 11

Phase 11 keeps the pipeline read-only and extends `coverageSummary` with file-scope coverage splits.

The summary now shows active cells with and without inherited evidence by file scope, and top files without inherited evidence grouped by file scope. This makes later source-collation planning more precise without changing text, trust, release status, or placement decisions.

## Phase 12

Phase 12 keeps the pipeline read-only and extends `coverageSummary` with lane/source-label coverage splits.

The summary now shows active cells without inherited evidence by lane, registered active cells without inherited evidence by lane, and top registered files without inherited evidence grouped by lane. This makes later source-collation planning more precise without changing text, trust, release status, or placement decisions.

## Phase 13

Phase 13 keeps the pipeline read-only and extends `coverageSummary` with registered lane/source-label coverage cross-tabs by file scope.

The summary now shows registered active cells without inherited evidence by file scope and lane, and by lane and file scope. This makes later source-collation planning more precise without changing text, trust, release status, or placement decisions.

## Runtime reports

Full generated reports should stay outside the repository. The default output path is:

```bash
/tmp/bible-active-text-collation-report.json
```

Run the report with:

```bash
npm run bible:active-text:collate -- --out=/tmp/bible-active-text-collation-report.json
```

## Current evidence source

Phase 2 uses `data/bible/registry/active-text-collation-record-index.json` to point at existing governed records for Tobit, Judith, Wisdom, Greek Esther, and Greek Daniel.

The record index is not a Bible text source and does not authorize new claims. It only tells the report which previously governed records may be consulted.

## Later phases

A later phase should add new live source comparison for still-unresolved lanes and safe mechanical repair planning. That later phase must still avoid hand-repairing the next book and must keep full generated reports outside the repository unless explicitly approved.
