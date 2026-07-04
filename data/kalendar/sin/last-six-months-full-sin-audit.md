# Last Six Months Full SIN Audit

## Scope

This audit completes the January-through-June SIN boundary as the monthly matrices currently exist.

- January has a full candidate-row matrix, so both rank-1 and alternate-row SIN maps are required.
- February, March, April, May, and June currently exist as rank-1 control-pass matrices, so their rank-1 SIN maps cover every row presently in those files.

The candidate matrices remain pre-decisional: `decision_status=Pending` and `final_primary` remains blank until Josh governs a final primary selection.

## Result

The January-through-June candidate rows currently present in the repository now have SIN coverage:

Rank-1 maps:

- `rank1/january-rank1-sins.csv`
- `rank1/february-rank1-sins.csv`
- `rank1/march-rank1-sins.csv`
- `rank1/april-rank1-sins.csv`
- `rank1/may-rank1-sins.csv`
- `rank1/june-rank1-sins.csv`

Alternate-row maps:

- `alternate/january-alternate-sins.csv`

The January alternate-row pass adds SINs through `UO-SIN-000838`, while reusing previously assigned SINs where the same identity had already been controlled.

## January alternate-row coverage

The January alternate map controls all non-rank-1 rows currently present in `data/kalendar/january/kalendar-v0.1-january-candidates.csv`.

Important reuse and normalization decisions include:

- `UO-SIN-000094` — Remigius of Rheims, reused from October.
- `UO-SIN-000348` — John Chrysostom, reused from September and January rank-1.
- `UO-SIN-000368` — Cadoc, reused from September.
- `UO-SIN-000391` — Richard Rolle, reused from September individual-date form.
- `UO-SIN-000584` — John Horden, reused from December.
- `UO-SIN-000630` — Richard Meux Benson and Charles Gore, reused from the January rank-1 source form.
- `UO-SIN-000634` — The Confession of Saint Peter, reused for the SEC transfer row.
- `UO-SIN-000681` — Gregory of Nyssa, reused from March.

## Identity decisions

1. Group source-forms remain distinct from individual persons.

`Basil the Great and Gregory of Nazianzus`, `Timothy, Titus, and Silas`, `Lydia, Dorcas, and Phoebe`, and other group source-forms receive group identity treatment unless an individual row requires a separate SIN.

2. Similar names are not automatic identity evidence.

The January alternate pass keeps `Priscilla of Rome` and `Prisca of Rome` separately controlled pending source identity review. It also preserves `Macrina the Elder` as distinct from `Macrina of Caesarea`.

3. Variant date rows reuse the same SIN when the identity is already controlled.

Examples include `Macarius of Egypt / Macarius the Great`, `Richard Meux Benson and Charles Gore`, `The Confession of Saint Peter`, `Remigius of Rheims`, and `John Horden`.

4. Governed exclusions remain absent.

The formerly present January 15 / April 4 governed-out figure is not present in the January alternate map and receives no shadow SIN treatment.

## Boundary

As of this audit, January through June are controlled for all candidate rows presently in the monthly matrices. If February, March, April, May, or June are later expanded from rank-1 control-pass matrices into full alternate-row matrices, those newly added rows must receive corresponding alternate SIN maps.

The SIN space currently runs through `UO-SIN-000838`.
