# First Six Months SIN and Rank-1 Audit

## Scope

This audit covers the first six completed Kalendar v0.1 months: July, August, September, October, November, and December.

The audit controls the rank-1 daily identity for each date and assigns a Universal Office Saint Identification Number (SIN) to each controlled rank-1 identity. The monthly candidate matrices remain pre-decisional.

## SIN result

- Total rank-1 daily slots audited: 184.
- Total distinct SINs assigned in this tranche: 181.
- Shared SINs were intentionally used where one identity appears as rank-1 on more than one date or where the date is under harmonization.

Shared rank-1 SINs in this tranche:

- `UO-SIN-000003` — Thomas the Apostle: July 3 and December 21.
- `UO-SIN-000175` — Thomas Becket: December 23 and December 29.
- `UO-SIN-000181` — Frances Joseph-Gaudet: December 30 and December 31.

## Rank status

No final primary selections were governed. Rank-1 was preserved as the current editorial recommendation for each date, subject to the review flags already present in the monthly matrices and SIN maps.

Several rank-1 entries remain explicitly non-final because they are feasts, civic observances, ecclesial events, group commemorations, Protestant or non-Anglican receptions, modern figures, legendary-material cases, or date-harmonization cases.

## Normalization notes

The SIN files normalize the daily rank-1 identity without erasing source-form complexity.

Examples:

- `Thomas the Apostle` shares one SIN across July 3 and December 21 because the issue is date harmonization, not identity confusion.
- `Thomas Becket` shares one SIN across December 23 and December 29 for the same reason.
- `Frances Joseph-Gaudet` shares one SIN across December 30 and December 31 while current LFF and BCP date forms are being reconciled.
- Group commemorations receive their own group SINs when the source form is itself a group, for example `Joachim and Anne`, `The Martyrs of New Guinea`, and `Hugh Latimer, Nicholas Ridley, and Thomas Cranmer`.
- Feasts and observances receive SINs in this tranche because the Universal Office needs stable identity keys for all daily rank-1 commemorations, not only individual persons.

## Outstanding limitation

Alternate candidate rows have not yet received SINs. This is intentional, not a completion claim. The next identity-control pass should assign SINs to alternate candidates, with priority given to duplicate/date-harmonization rows in `data/kalendar/kalendar-v0.1-cross-date-harmonization.csv`.

## Files created

- `data/kalendar/sin/README.md`
- `data/kalendar/sin/rank1/july-rank1-sins.csv`
- `data/kalendar/sin/rank1/august-rank1-sins.csv`
- `data/kalendar/sin/rank1/september-rank1-sins.csv`
- `data/kalendar/sin/rank1/october-rank1-sins.csv`
- `data/kalendar/sin/rank1/november-rank1-sins.csv`
- `data/kalendar/sin/rank1/december-rank1-sins.csv`
