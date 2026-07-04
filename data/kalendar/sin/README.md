# Universal Office Saint Identification Numbers (SINs)

This directory holds controlled SIN metadata for Kalendar v0.1.

## SIN format

`UO-SIN-######`

The number is intentionally non-semantic. It does not encode rank, holiness, tradition, month, feast class, or final inclusion. It is only a stable identity key for Universal Office and Synaxarium metadata.

## Current status

The full candidate-row SIN coverage now includes January through December as the matrices currently exist.

July through December were the first full candidate-row tranche. January was separately completed with rank-1 and alternate-row maps. February through June have now been expanded from rank-1 control passes into full ranked candidate matrices and have corresponding alternate-row SIN maps.

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
- `alternate/february-alternate-sins.csv`
- `alternate/march-alternate-sins.csv`
- `alternate/april-alternate-sins.csv`
- `alternate/may-alternate-sins.csv`
- `alternate/june-alternate-sins.csv`
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

The January-through-June repair expands February through June into full ranked candidate matrices and adds alternate-row SIN maps for each month. The SIN space currently runs through `UO-SIN-001105`.

If any monthly matrix is later revised, added to, split, or merged, the corresponding SIN map must be updated in the same commit or a clearly linked follow-up commit.
