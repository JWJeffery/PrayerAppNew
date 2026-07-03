# Kalendar v0.1 QC Notes

## Scope

These notes govern quality control for the Kalendar v0.1 ranked candidate matrices. They were written after comparing the July and August ranked studies, then extended during the September tranche, the July-August-September crosswise QC pass, the July-August-September-October cross-sectional QC pass, the July-August-September-October-November cross-sectional QC pass, and the July-through-December cross-sectional QC pass.

The candidate CSV files remain pre-decisional. A rank is an editorial recommendation for review, not a final primary selection. `decision_status` should remain `Pending` and `final_primary` should remain blank until Josh governs the day.

## Lessons learned from July through December

1. Source hierarchy and holiness fit must both be visible.

BCP and LFF authority matter strongly, but a candidate with strong official-source presence may still require review if the case is mainly civic, artistic, political, reformist, or broadly historical. Conversely, a provincial or Great Church candidate may rank higher on a thin or contested day when its holiness/prayability fit is stronger.

2. Do not conflate variant source forms.

If different Anglican sources preserve different forms of the same commemoration, especially different group membership, the forms should be split into separate rows or clearly explained. This arose on July 20: LFF 2024 gives Elizabeth Cady Stanton, Amelia Bloomer, and Sojourner Truth; older/other Anglican sources also include Harriet Ross Tubman. Tubman must not be absorbed into a social-reformer group without her separate holiness rationale.

3. Non-sanctoral and borderline-Christian entries must be flagged more strictly.

Historical events, civic observances, non-Christian group memorials, and threshold-Christian figures may be historically or devotionally significant, but they should not quietly remain ordinary `Review` candidates. They should be marked `Exclude from primary consideration` when they cannot satisfy the Christian-sanctoral test for Kalendar v0.1.

4. Great Church supplementation must be explicit.

Rows drawn from Roman Catholic, Eastern Orthodox, Oriental Orthodox, Church of the East, or broader catholic witnesses must remain clearly labeled. Candidate rows should not pretend that a Great Church supplement is Anglican. This is especially important for sparse Anglican days.

5. Duplicate and transfer dates need whole-year harmonization.

A candidate appearing on more than one date should carry a date-harmonization flag until the full 366-day Kalendar is visible. Examples already found include Thomas the Apostle, Stephen, Moses the Black, Wilberforce, Joseph of Arimathea, Cuthbert, Cyprian, John Chrysostom, Pusey, Andrewes, Richard Rolle, Declan, Blane, John Bunyan, Grundtvig, Albert of Jerusalem, Remigius, Gregory the Enlightener, Thomas Cantilupe, Thomas Traherne, Kenneth/Canice, Thecla, John Hus, Clare of Montefalco, Herman of Alaska, Martin de Porres, Sojourner Truth, Margaret/Marina of Antioch, George Whitefield, Hilda, Elizabeth of Hungary, Charles Simeon, Columbanus, Cecilia, Catherine of Alexandria, Isaac Watts, Nicholas Ferrar, Birinus, Osmund of Salisbury, Barbara of Nicomedia, Charles Garnier, Jane de Chantal, Lucy Menzies, John of the Cross, Samuel Johnson, Frances Joseph-Gaudet, Thomas Becket, and others.

6. Appendix material should not be treated as equal to calendar material.

HWHM or GCW appendix entries may be valuable, especially for Anglican bishops or monastics, but appendix status must remain visible in `source_tier` and `review_flags`.

7. Group commemorations require special caution.

Groups can be retained as candidates, but the ranking rationale must state whether the group is coherent hagiographically or merely historical/representational. If one member of the group has a stronger holiness case than the group itself, that should be noted for later separation.

8. Artist, writer, composer, reformer, and public-intellectual entries require doxological or discipleship framing.

These candidates are not excluded by default, but their entries must teach prayer, holiness, and discipleship rather than admiration for genius, activism, or cultural importance.

9. Year-specific provincial calendars must not be mistaken for fixed-date kalendars.

The Scottish Episcopal master calendar CSV is useful, but it includes year-specific transfers when a feast is displaced by Sunday or another higher observance. A transferred entry may prove that the candidate is in the SEC calendar, but the transferred civil date must not be treated as the saint’s fixed date for Kalendar v0.1. When a SEC entry is visibly transferred, mark that fact in `review_flags` or `notes` and defer date resolution to whole-year harmonization.

10. Current LFF source-forms should generally outrank older TEC secondary forms when the same date preserves variant group membership.

This does not make LFF infallible, but it keeps the working candidate matrix aligned with the current Episcopal source form. Older BCP/HWHM/GCW forms should remain visible as separate rows when they materially differ, especially for group commemorations.

11. Cross-month duplicate tracking now requires a central ledger.

As more months are added, bidirectional row edits become brittle. Candidate rows should still carry obvious local harmonization flags, but the cross-date harmonization ledger is the central audit surface for duplicates, transferred dates, variant source forms, and future-month dependencies.

12. Every new month must be checked directly against the current LFF calendar before cross-sectional comparison.

The initial December file exposed a workflow failure: several entries were given current LFF authority or first rank even though LFF 2024 placed them elsewhere or did not list them on that date. December was repaired against the LFF 2024 calendar before cross-month harmonization was updated.

## QC actions taken

- Revised July 5 to remove `SEC-adjacent` as if it were a source witness. Palladius is now marked as AM only pending provincial-calendar verification.
- Split the July 20 social-reformer row into current LFF 2024 form and older four-person Anglican-source form including Harriet Ross Tubman.
- Revised August 2 to add GCW as a witness for Samuel Ferguson.
- Revised August 5 to make explicit why the Dürer/Grünewald/Cranach artist group remains below Oswald despite higher TEC-secondary source presence.
- Revised August 24 to mark Simone Weil as `Exclude from primary consideration`, not ordinary `Review`, because of ecclesial-status mismatch for the Christian-sanctoral primary calendar.
- Added September candidate rows using the SEC calendar only with transfer caution where year-specific transfer artifacts were visible.

## Crosswise QC actions after comparing July, August, and September

- Added explicit date-harmonization flags for Declan of Ardmore on July 23 and July 24.
- Added explicit date-harmonization flags for Blane on August 10 and August 12.
- Added explicit date-harmonization flag for John Bunyan on August 29, matching the existing August 30 duplicate warning.
- Added explicit date-harmonization flag for Grundtvig on September 2, matching the September 8 duplicate warning.
- Added explicit date-harmonization flag for Albert of Jerusalem on September 14, matching the September 17 duplicate warning.
- Revised September 20 and September 27 SEC language from `fixed-date witness via transfer note` to `SEC transfer witness`, so year-specific transfer evidence is not mistaken for fixed-date evidence.

## Cross-sectional QC actions after comparing July, August, September, and October

- Revised October 1 Gregory the Enlightener source wording from `SEC transfer/fixed witness` to `SEC witness requiring fixed-date verification`, so the October SEC evidence is not overstated.
- Promoted the current LFF October 16 Reformation Martyrs form, Hugh Latimer, Nicholas Ridley, and Thomas Cranmer, above the older BCP/HWHM two-bishop form while retaining both source-forms as separate rows.
- Confirmed that October already carried date-harmonization flags for Remigius, Gregory the Enlightener, Thomas Cantilupe, Thomas Traherne, Kenneth/Canice, Thecla, John Hus, Clare of Montefalco, and Martin Luther.
- Confirmed that October continues the standing treatment of SEC year-specific transfers for Luke, Henry Martyn, Kenneth/Canice, and other affected rows.

## Cross-sectional QC actions after comparing July through November

- Created `data/kalendar/kalendar-v0.1-cross-date-harmonization.csv` as the central audit ledger for cross-month duplicate/date issues.
- Added cross-month ledger entries for November conflicts and dependencies including Herman of Alaska, Martin de Porres, Sojourner Truth, Margaret/Marina of Antioch, Richard Rolle and the English mystics, Søren Kierkegaard, George Whitefield, Hilda of Whitby, Elizabeth of Hungary, Charles Simeon, Columbanus, Cecilia, Catherine of Alexandria, Isaac Watts, and others.
- Confirmed November preserves current LFF source-forms while retaining date variants and older/provincial forms as separate candidate rows where needed.
- Confirmed November continues the standing exclusion discipline for non-sanctoral historical remembrances, including Kristallnacht and Armistice Day.

## Cross-sectional QC actions after comparing July through December

- Repaired December against the current LFF 2024 calendar before final cross-month comparison.
- Corrected December 1: Charles de Foucauld is now first-ranked as the current LFF entry; Nicholas Ferrar remains visible as a BCP/older-date variant.
- Corrected December 8: Nicholas Ferrar is now first-ranked as the current LFF entry; Richard Baxter was downgraded to TEC-secondary/Anglican martyrology review status.
- Added or promoted current LFF December entries that were missing or under-ranked: Frederick Howden Jr. on December 11, Francis de Sales and Jane de Chantal on December 12, Nino of Georgia on December 15, Dorothy L. Sayers on December 17, and Frances Joseph-Gaudet on December 31.
- Removed false current-LFF authority from Juan Diego, Thomas Merton, Our Lady of Guadalupe, Cram/Upjohn/La Farge, Garrison/Stewart, Lillian Trasher, Charlotte Digges Moon, Samuel Ajayi Crowther, and other December rows where the authority was HWHM/GCW/AM/provincial rather than LFF 2024.
- Updated the cross-date harmonization ledger with December conflicts including Nicholas Ferrar, Birinus, Osmund, Barbara, Charles Garnier, Jane de Chantal, Lucy Menzies, John of the Cross, Samuel Johnson, Frances Joseph-Gaudet, Thomas Becket, Stephen, and Samuel Ajayi Crowther.

## Continuing QC rule

Each future monthly tranche should be checked against current LFF first, then against earlier months for source-form consistency, duplicate/date harmonization, status-language consistency, year-specific transfer artifacts, and whether the ranking reflects the project rules: holiness over significance, social impact as evidence rather than proof, Anglican-centered source hierarchy, Great Church supplementation only when properly labeled, and the final test of prayability and discipleship.
