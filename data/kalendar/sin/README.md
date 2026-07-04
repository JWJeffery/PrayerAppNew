# Universal Office Saint Identification Numbers (SINs)

This directory holds controlled SIN metadata for Kalendar v0.1.

## SIN format

`UO-SIN-######`

The number is intentionally non-semantic. It does not encode rank, holiness, tradition, month, feast class, or final inclusion. It is only a stable identity key for Universal Office and Synaxarium metadata.

## Current status

July through December have full candidate-row SIN coverage. January has full candidate-row SIN coverage. February through June require expansion before full candidate-row SIN coverage can be claimed.

## Governance rule

A SIN assignment is not a final kalendar decision. It means only that the identity has been normalized enough to avoid confusion with similarly named persons, groups, feasts, or source-form variants.

Monthly candidate matrices remain pre-decisional unless Josh governs otherwise: `decision_status=Pending` and `final_primary` blank.

## Current files

Rank-1 maps:

- `rank1/january-rank1-sins.csv`
- `rank1/february-rank1-sins.csv`
- `rank1/march-rank1-sins.csv`
- `rank1/april-rank1-sins.csv`
- `rank1/may-rank1-sins.csv`
- `rank1/june-rank1-sins.csv`
- `rank1/july-rank1-sins.csv`
- `rank1/august-rank1-sins.csv`
- `rank1/september-rank1-sins.csv`
- `rank1/october-rank1-sins.csv`
- `rank1/november-rank1-sins.csv`
- `rank1/december-rank1-sins.csv`

Alternate-row maps:

- `alternate/january-alternate-sins.csv`
- `alternate/july-alternate-sins.csv`
- `alternate/august-alternate-sins.csv`
- `alternate/september-alternate-sins-part1.csv`
- `alternate/september-alternate-sins-part2.csv`
- `alternate/october-alternate-sins-part1.csv`
- `alternate/october-alternate-sins-part2.csv`
- `alternate/november-alternate-sins-part1.csv`
- `alternate/november-alternate-sins-part2.csv`
- `alternate/december-alternate-sins.csv`

Audit notes:

- `last-six-months-rank1-audit.md`
- `last-six-months-full-sin-audit.md`
- `first-six-months-rank1-audit.md`
- `first-six-months-full-sin-audit.md`

## Completion boundary

The SIN space currently runs through `UO-SIN-000838`.
