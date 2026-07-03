# Universal Office Saint Identification Numbers (SINs)

This directory holds the first controlled SIN metadata for Kalendar v0.1.

## SIN format

`UO-SIN-######`

The number is intentionally non-semantic. It does not encode rank, holiness, tradition, month, feast class, or final inclusion. It is only a stable identity key for Universal Office and Synaxarium metadata.

## Entity coverage

The first completed SIN tranche covers all candidate rows currently present in the first six completed monthly matrices: July, August, September, October, November, and December. This includes persons, groups, feasts, observances, commemorations, and ecclesial events because the working Kalendar contains more than individual saints. The `entity_type` field therefore distinguishes:

- `person`
- `group`
- `feast`
- `observance`
- `commemoration`
- `event`

## Governance rule

A SIN assignment is not a final kalendar decision. It means only that the identity has been normalized enough to avoid confusion with similarly named persons, groups, feasts, or source-form variants.

Monthly candidate matrices remain pre-decisional unless Josh governs otherwise: `decision_status=Pending` and `final_primary` blank.

## Current files

Rank-1 maps:

- `rank1/july-rank1-sins.csv`
- `rank1/august-rank1-sins.csv`
- `rank1/september-rank1-sins.csv`
- `rank1/october-rank1-sins.csv`
- `rank1/november-rank1-sins.csv`
- `rank1/december-rank1-sins.csv`

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

This tranche controls identities for the candidate rows currently present in the July-December candidate matrices. If a monthly candidate matrix is later revised, added to, split, or merged, the corresponding SIN map must be updated in the same commit or a clearly linked follow-up commit.

The first six-month SIN space currently runs through `UO-SIN-000616`.
