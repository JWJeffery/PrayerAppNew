# Bible Active Text Collation Pipeline — Phase 1

This branch adds a small Phase 1 inventory scaffold.

Phase 1 adds a registry, inventory crawler, compact classifier, report builder, and CLI runner. It is read-only for Bible corpus text.

## Scope flags

The compact report includes these flags:

- `phase: "inventory_scaffold"`
- `trustAssertionsMade: false`
- `bibleTextMutated: false`
- `sourceCollationPerformed: false`

`registered_text` means only that a lane label is known to the registry. It does not mean the cell has been checked against an external witness or approved for a wider trust claim.

## Runtime reports

Full generated reports should stay outside the repository. The default output path is:

```bash
/tmp/bible-active-text-collation-report.json
```

Run the scaffold with:

```bash
npm run bible:active-text:collate -- --out=/tmp/bible-active-text-collation-report.json
```

## Next phase

A later phase should add real comparison classes such as exact match, prefix-only difference, source-address gap, active-only row, source-only row, true mismatch, missing source, policy absence, versification mapping needed, and unresolved source blocker.
