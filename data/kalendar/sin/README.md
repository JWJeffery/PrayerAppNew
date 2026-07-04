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

The second completed tranche covers the January-through-June side as currently structured: all January candidate rows, plus the rank-1 daily control rows for February, March, April, May, and June, whose matrices currently exist as rank-1 control passes.

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
- `last-six-months-full-sin-audit.md`
- `first-six-months-rank1-audit.md`
- `first-six-months-full-sin-audit.md`

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

## Completion boundary

The July-through-December full candidate-row tranche controls identities for the candidate rows currently present in the July-December candidate matrices. If a monthly candidate matrix is later revised, added to, split, or merged, the corresponding SIN map must be updated in the same commit or a clearly linked follow-up commit.

The January-through-June tranche now controls all candidate rows currently present in those matrices: January has both rank-1 and alternate-row maps; February through June currently contain rank-1 control rows only and their rank-1 maps cover every row presently in those files. If February-through-June are later expanded into full alternate-row candidate matrices, create corresponding alternate SIN maps in the same commit or a clearly linked follow-up commit.

The SIN space currently runs through `UO-SIN-000838`.
