# Universal Office Saint Identification Numbers (SINs)

This directory holds the first controlled SIN metadata for Kalendar v0.1.

## SIN format

`UO-SIN-######`

The number is intentionally non-semantic. It does not encode rank, holiness, tradition, month, feast class, or final inclusion. It is only a stable identity key for Universal Office and Synaxarium metadata.

## Entity coverage

The first SIN tranche covers the rank-1 daily controlling candidates for July through December. This includes persons, groups, feasts, observances, commemorations, and ecclesial events because the working Kalendar contains more than individual saints. The `entity_type` field therefore distinguishes:

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

- `rank1/july-rank1-sins.csv`
- `rank1/august-rank1-sins.csv`
- `rank1/september-rank1-sins.csv`
- `rank1/october-rank1-sins.csv`
- `rank1/november-rank1-sins.csv`
- `rank1/december-rank1-sins.csv`

## Important limitation

This tranche controls the daily rank-1 identities for the first six completed months, July through December. Alternate candidate rows still need a second SIN pass before the whole-year governed Kalendar can be considered fully identity-controlled.
