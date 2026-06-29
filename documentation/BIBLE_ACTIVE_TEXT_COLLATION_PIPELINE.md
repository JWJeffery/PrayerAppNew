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
