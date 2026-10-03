# Anglican Synaxarium -- approved correction proposal: IMPLEMENTED (2026-10-02)

**Status: IMPLEMENTED in the Universal Office repository on 2026-10-02 per the curator's final decisions (Josh Jeffery).** This document replaces the earlier proposal: the remaining options in it were superseded by the approved table below. The Synaxarium-side (Drive) record is described in section G.

Sources (all in `data/kalendar/source-witnesses/`): LFF 2024 calendar (LFF), Holy Women Holy Men (HWHM), A Great Cloud of Witnesses (GCW), For All the Saints (FAS), Scottish Episcopal Church calendar CSV (SEC), An Anglican Martyrology for the British Isles (AM; a personal compilation, not a provincial calendar), Oxford Dictionary of Saints (ODS), Book of Saints (BoS). The candidate matrix's own rankings and witness claims are machine-generated and are not treated as evidence.

## A. Approved assignments and what was done

| Date | Primary | Treatment applied |
|---|---|---|
| 05-03 | Elisabeth Cruciger | Huntington's 05-03 copy removed (duplicate; retired UO-SIN-000999). Huntington remains the 11-25 primary, UO-SIN-000148. Evidence: LFF 2024 prints Cruciger on 3 May. |
| 05-09 | Gregory of Nazianzus | Zinzendorf replaced. Evidence: LFF, HWHM, GCW print Gregory on 9 May. |
| 05-10 | Nicolaus Ludwig von Zinzendorf | Moved here as primary (matrix row re-dated; SIN UO-SIN-001010 kept). Comgall of Bangor retained as an alternate. Evidence: HWHM and GCW (Prophetic Witness, 1760); AM 10 May. |
| 08-09 | Edith Stein | Retained as primary. Mary Sumner added as an alternate (AM, 9 August, Alresford 1921; SIN UO-SIN-000050 kept). |
| 08-19 | John Eudes | Replaces Sumner (AM, 19 August; matrix rank 1 after Sumner's move; SIN UO-SIN-000282). |
| 11-24 | Catherine, Barbara and Margaret | Primary group (LFF) retained; Lucy Menzies retained as an alternate (SEC calendar and AM). |
| 12-11 | Frederick Howden Jr. | Replaces Menzies (LFF 2024 prints Howden on 11 December). Menzies's 12-11 assignment removed (her SIN UO-SIN-000541 stays on 11-24). |
| 12-18 | Charles Wesley | Individual primary retained as the curator's deliberate birthday observance (see section B). |
| 12-29 | Thomas Becket | Replaces "David of London" (see section C). |

**Preserved:** the joint Basil and Gregory commemoration on 01-02 (AM p.5, FAS calendar PDF p.25 and entry PDF p.40, Common Worship) and Basil's 06-14 primary; John and Charles Wesley on 03-03. Gregory on 05-09 and Charles on 12-18 are intentional additional observances. All four overlaps are recorded in the harmonization register (`data/kalendar/kalendar-v0.1-cross-date-harmonization.csv`) and in the candidates' notes.

## B. Charles Wesley (12-18) -- attribution corrected
Apparatus (outside the devotional script), recorded on the 12-18 and 03-03 matrix rows, the harmonization register and `decisions.json`:
> Charles Wesley is individually commemorated on December 18 by the curator's deliberate birthday observance. The received joint commemoration with John remains on March 3.

- The unsupported claim "HWHM/GCW date variant?" is removed. LFF, HWHM, GCW (and FAS, SEC) support the **joint** March 3 observance, which is Charles's ecclesial reception.
- LFF 2024 supplies the **birthday** in the March 3 biography (printed p.124; PDF p.132: "John was born on June 17, 1703, and Charles on December 18, 1707"). It does not supply a December 18 feast.
- The editorial basis (birthday) is kept distinct from the reception evidence: the row's `source_tier` is "Editorial selection (curator) on a received joint commemoration" and `angDateBasis` in `sanctoral.json` reads "editorial: the curator's deliberate birthday observance".

## C. "David of London" (12-29) -- identity error kept on record
No David of London is attested in any held source. The AM entry for 29 December is "the commemoration of the prophet Nathan and King David", followed by Thomas Becket; the likely cause is a confusion with King David. The assignment is removed and **UO-SIN-000610 is retired and not repurposed** for King David or Thomas Becket (`data/kalendar/sin/retired-sins.csv`). Thomas Becket (LFF, HWHM, GCW; UO-SIN-000175) is the primary.

## D. Supported assignments preserved; citations repaired
| Date | Subject | Evidence recorded |
|---|---|---|
| 02-29 | Oswald of Worcester | Worcester Cathedral Sunday News 18 Feb 2024, PDF p.5: "The Feast of St Oswald is on Thursday 29 February" (https://www.worcestercathedral.org.uk/media/brtevqbd/2024-february-18.pdf; verified by download), and "Services and Music Feb/Mar 2024": "Thursday 29th: Oswald, Bishop of Worcester, 992". The held books (AM) print 28 February; recorded as a distinct leap-year observance. |
| 04-06 | Celestine I | Book of Saints printed p.134 (PDF p.147), left column, "6 April" (page rendered and read). |
| 05-06 | John before the Latin Gate | ODS John the Evangelist entry ("in the West, 27 December and 6 May, the Dedication of the church of St. John before the Latin Gate"); Butler, 6 May (cited by the curator; not held). Unverified AM attribution removed. |
| 05-16 | Brendan the Navigator | AM p.58, 16 May (Brendan of Clonfert). |
| 05-17 | Restituta of Carthage | Book of Saints printed p.638 (PDF p.651), right column, "17 May", martyr of Carthage. |
| 07-03 | Joshua son of Nun | Deliberate Great Church supplementation; Coptic Orthodox Synaxarium, Paona 26. |
| 07-10 | Anthony and Theodosius of the Kyiv Caves | AM 10 July, "Antony Pechersky and Theodosius Pechersky". |
| 07-15 | Vladimir of Kyiv | AM 15 July ("In 1015, St. Vladimir of Kiev"); the 11 July mention is within Olga's entry. |
| 10-27 | Odran of Iona | AM 27 October as "Otteran"; ODS "ODRAN (Otteran) OF IONA (d. c.563)". |
| 12-20 | Ammon and Companions | AM 20 December, "St. Ammon and companions". Label reconciled from "Ammonius and Companions" (UO-SIN-000598 kept; unrelated to Ammonius the hermit, 8 Nov). BoS gives the group on 1 June and is not cited for 20 December. |
| 12-22 | Chaeremon of Nilopolis and Companions | Book of Saints printed p.135 (PDF p.148), right column, "22 December". |
| 12-23 | Thorlak of Iceland | AM 23 December as "Thorlac". |
| 12-30 | Egwin of Worcester | AM (entry under 10 September): "In the Middle Ages St Egwin was commemorated on 30 December: September 10 is the day of the translation of his relics in 1039"; ODS: "Feast: 30 December; translation feasts 10 September and 11 January". |

## E. Verified evidence behind the changes (all read from the held books)
12-18, 05-03, 05-09, 08-19, 12-11, 12-29 and their destinations 03-03, 11-25, 05-10, 08-09, 11-24: see `ANGLICAN_SYNAXARIUM_FINDINGS.md` (second pass and tables) -- e.g. HWHM/GCW 05-10 "Nicolaus Ludwig von Zinzendorf, Prophetic Witness, 1760"; LFF 11-25 Huntington; LFF 05-03 Elisabeth Cruciger; LFF 12-11 Frederick Howden, Jr.; LFF/HWHM/GCW 12-29 Thomas Becket; AM 08-09 Mary Sumner; AM and SEC 11-24 Lucy Menzies.

## F. Files changed (Universal Office repository)
- Matrix: `data/kalendar/{february,april,may,july,august,october,december,january,march,june}/kalendar-v0.1-<month>-candidates.csv` (moves, removals, rank renumbering, citation repairs, apparatus notes).
- SIN tables: `data/kalendar/sin/rank1/august-rank1-sins.csv`; `data/kalendar/sin/alternate/{may,august,december}-alternate-sins.csv`; new `data/kalendar/sin/retired-sins.csv`.
- Harmonization register: `data/kalendar/kalendar-v0.1-cross-date-harmonization.csv` (two entries updated, five added).
- Review tool data regenerated with `synaxarium-review/build_data_v3.py`: `synaxarium-review/data/kalendar-data.json`, `synaxarium-review/validation-report.md` (0 hard failures; 366 rank-1 SINs; 825 alternate SINs; 0 missing joins).
- Corrected decisions export (Drive-export format): `synaxarium-review/data/synaxarium-decisions-2026-10-02-corrected.json`.
- App data: `data/kalendar/synaxarium/decisions.json` (primary + alternates, `date_basis`, `source_notes`, `curator_correction`), `data/saints/sanctoral.json` (ANG rows: primaries/alternates with `angRole`, `angDateBasis`, `angCorrection`, `synaxariumSin`).
- Scripts: `scripts/saints/apply-curatorial-corrections.py`, `build-corrected-decisions-export.py`, `apply-synaxarium-decisions.py` (extended), `verify-synaxarium-calendar.py`, `parse-printed-calendars.py`.
- No readings, collects, biography links or other saint-specific records exist in the repository for these saints (a repository-wide search found only unrelated place names such as Huntington, W. Va.), so no further dependent records needed moving.
- The matrix rows keep `decision_status = Pending`: the build validator requires a pre-review matrix, so the decisions live in the decisions export and `decisions.json` (the documented merge-into-CSV pathway was deliberately not run).

## G. Drive (Synaxarium project) -- what could and could not be changed
The Drive connector can create files but its update call changes only a file's title or location, not its contents, so existing Drive files could not be edited in place. No file titled "Calendar and Admission Decisions" exists in the project folder; the decisions export (`synaxarium-decisions-2026-09-07-cleaned.json`) is the de facto record. Added next to it: a Google Doc "Calendar and Admission Decisions -- Corrections of 2026-10-02" and a JSON delta "synaxarium-decisions-corrections-2026-10-02.json" (the 9 changed-date records in export format; the 13 citation repairs are listed in the Doc and carried in full in the repository export). The complete corrected export is in the repository (section F) and can be uploaded to replace the original. The twelve approved hagiographies concern 1-12 November and Brigid (1 Feb): none involves a changed date.

## H. Checks run
`scripts/saints/verify-synaxarium-calendar.py` (96 checks, 0 failed: 366-day coverage, every approved primary and alternate on its date, superseded Huntington/Zinzendorf/Sumner/Menzies/"David of London" assignments removed, overlaps documented, 13 citations repaired, SIN consistency and retired SINs); `synaxarium-review/build_data_v3.py` (0 hard failures); `scripts/saints/verify_sanctoral.js` (unchanged: 117/124 Church of the East matches; Elijah 2038 known gap); `scripts/explanations/verify_explanations.js` (81/81); `scripts/audit-repo-hygiene.mjs` (pass); browser check of the Anglican saint panel on all nine corrected dates.
