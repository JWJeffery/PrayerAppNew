# Last Six Months Rank-1 SIN Audit

## Scope

This audit controls the rank-1 daily entries for January through June in Kalendar v0.1: 182 civil dates, including the leap-day entry for February 29.

This is the companion tranche to the earlier July-through-December rank-1 SIN audit. It assigns or reuses Universal Office Saint Identification Numbers for every January-through-June daily controlling entry currently present in the rank-1 position.

The candidate matrices remain pre-decisional: `decision_status=Pending` and `final_primary` remains blank until Josh governs a final primary selection.

## Result

The January-through-June rank-1 daily controls now have SIN maps:

- `rank1/january-rank1-sins.csv`
- `rank1/february-rank1-sins.csv`
- `rank1/march-rank1-sins.csv`
- `rank1/april-rank1-sins.csv`
- `rank1/may-rank1-sins.csv`
- `rank1/june-rank1-sins.csv`

The last-six-month rank-1 tranche introduces new SINs through `UO-SIN-000786`, with previously assigned SINs reused where the same identity already appeared in the July-through-December tranche.

## Reused SINs

The audit reused earlier SINs rather than creating duplicate identities for:

- `UO-SIN-000023` — John Cassian
- `UO-SIN-000112` — Cornelius the Centurion
- `UO-SIN-000208` — Kateri Tekakwitha
- `UO-SIN-000220` — Adelaide Teague Case
- `UO-SIN-000249` — Lydia of Thyatira
- `UO-SIN-000261` — John Henry Newman
- `UO-SIN-000280` — Helena of Constantinople
- `UO-SIN-000301` — Monica / Monnica
- `UO-SIN-000318` — Gregory the Great
- `UO-SIN-000348` — John Chrysostom
- `UO-SIN-000393` — Gregory the Illuminator / Gregory the Enlightener
- `UO-SIN-000502` — James Theodore Holly

## Identity and normalization decisions

1. Group source forms remain distinct from individual identities.

Examples: `Agnes and Cecilia of Rome`, `Timothy and Titus`, `Vincent de Paul and Louise de Marillac`, `Martyrs of Uganda`, and `Peter and Paul` each receive group identities where the source form is a group. Those do not automatically collapse into every individual member's separate SIN.

2. Event, feast, observance, and commemoration entries remain non-person entities.

Examples: Holy Name, Epiphany, Confession of Peter, Conversion of Paul, Annunciation, Presentation, First Book of Common Prayer, Visitation, and the Nativity of John the Baptist are controlled with the proper entity type rather than being treated as ordinary persons.

3. Similar names are not identity evidence.

The audit preserves distinctions such as Marina the Monk versus Margaret/Marina of Antioch, Mechthild of Magdeburg versus Mechthilde of Hackeborn, and Basil/Gregory paired forms versus their individual feast forms.

4. Transfer context is not source witness for the occupying fixed date.

The June audit keeps the SEC-transferred Visitation as transfer context only on June 1. It does not count that transfer as a source witness for Justin. The same rule governs Irenaeus and other SEC 2026 transfer artifacts.

5. Governed exclusions do not receive shadow identity treatment.

The formerly present January 15 / April 4 governed-out figure remains removed from the last-six-month rank-1 SIN maps and from the cross-date ledger.

## Ranking audit notes

The last-six-month daily controls were preserved as rank-1 pending governance after cross-sectional QC, with these explicit cautions retained:

- Social-impact or public-policy caution remains for Frances Perkins, Thurgood Marshall, Frederick Douglass, Anna Julia Haywood Cooper, Josephine Butler, and similar modern public figures.
- Protestant/non-Anglican caution remains for Elisabeth Cruciger, Johann Arndt and Jacob Boehme, Dietrich Bonhoeffer, and Toyohiko Kagawa.
- Ruler-saint or ruler-family caution remains for Charles I, Liliʻuokalani, Helena, and Matilda.
- Event/observance genre caution remains for the First Book of Common Prayer and the Consecration of Barbara Clementine Harris.
- Legendary-material and source-identity caution remains for George of Lydda, Marina the Monk, Melangell, Alban variants, and related ancient or medieval material.

## Boundary

This audit controls the rank-1 daily entries for January through June.

The earlier January alternate-row limitation has been corrected in `last-six-months-full-sin-audit.md` and `alternate/january-alternate-sins.csv`. As of that follow-up, January through June are controlled for all candidate rows presently in the monthly matrices: January has full rank-1 and alternate-row SIN coverage, and February through June currently contain rank-1 control rows only.
