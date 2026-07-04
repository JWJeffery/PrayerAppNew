# Universal Office Saint Identification Numbers (SINs)

This directory holds the first controlled SIN metadata for Kalendar v0.1.

## SIN format

`UO-SIN-######`

The number is intentionally non-semantic. It does not encode rank, holiness, tradition, month, feast class, or final inclusion. It is only a stable identity key for Universal Office and Synaxarium metadata.

## Entity coverage

The first completed full candidate-row SIN tranche covers all candidate rows currently present in the first six completed monthly matrices: July, August, September, October, November, and December. This includes persons, groups, feasts, observances, commemorations, and ecclesial events because the working Kalendar contains more than individual saints. The `entity_type` field therefore distinguishes:

- `person`
- `group`
- `feast`
- `observance`
- `commemoration`
- `event`

The second completed rank-1 tranche covers the daily controlling entries for January, February, March, April, May, and June.

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

Audit notes:

- `last-six-months-rank1-audit.md`
- `first-six-months-rank1-audit.md`
- `first-six-months-full-sin-audit.md`

Alternate-row maps:

- `alternate/july-alternate-sins.csv`
- `alternate/august-alternate-sins.csv`
- `alternate/september-alternate-sins-part1.csv`
- `alternate/september-alternate-sins-part2.csv`
- `alternate/october-alternate-sins-part1.csv`
- `alternate/october-alternate-sins-part2.csv`
- `alternate/november-alternate-sins-part1.csv`
- `alternate/november-alternate-sins-part2.csv`
- `alternate/december-alternate-sins.csv`

## Completion boundary

The July-through-December full candidate-row tranche controls identities for the candidate rows currently present in the July-December candidate matrices. If a monthly candidate matrix is later revised, added to, split, or merged, the corresponding SIN map must be updated in the same commit or a clearly linked follow-up commit.

The January-through-June rank-1 tranche controls the daily rank-1 entries for the remaining six months. January alternate candidate rows have not yet received a complete alternate-row SIN pass; if those alternates are retained at full candidate-row granularity, create January alternate maps before treating January as fully candidate-row controlled.

The SIN space currently runs through `UO-SIN-000786`.
