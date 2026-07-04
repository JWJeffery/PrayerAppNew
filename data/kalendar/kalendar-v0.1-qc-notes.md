# Kalendar v0.1 QC Notes

## Scope

These notes govern quality control for the Kalendar v0.1 ranked candidate matrices. They were written after comparing the July and August ranked studies, then extended during the September tranche, the July-August-September crosswise QC pass, the July-August-September-October cross-sectional QC pass, the July-August-September-October-November cross-sectional QC pass, the July-through-December cross-sectional QC pass, the July-through-January cross-sectional QC pass, the July-through-March cross-sectional QC pass, and the July-through-April cross-sectional QC pass.

The candidate CSV files remain pre-decisional. A rank is an editorial recommendation for review, not a final primary selection. `decision_status` should remain `Pending` and `final_primary` should remain blank until Josh governs the day.

## Lessons learned from July through April

1. Source hierarchy and holiness fit must both be visible.

BCP and LFF authority matter strongly, but a candidate with strong official-source presence may still require review if the case is mainly civic, artistic, political, reformist, or broadly historical. Conversely, a provincial or Great Church candidate may rank higher on a thin or contested day when its holiness/prayability fit is stronger.

2. Do not conflate variant source forms.

If different Anglican sources preserve different forms of the same commemoration, especially different group membership, the forms should be split into separate rows or clearly explained. This arose on July 20: LFF 2024 gives Elizabeth Cady Stanton, Amelia Bloomer, and Sojourner Truth; older/other Anglican sources also include Harriet Ross Tubman. Tubman must not be absorbed into a social-reformer group without her separate holiness rationale. March 10 now gives Tubman a separate current-LFF row, but the Tubman contrast rule still governs the entry.

3. Non-sanctoral and borderline-Christian entries must be flagged more strictly.

Historical events, civic observances, non-Christian group memorials, and threshold-Christian figures may be historically or devotionally significant, but they should not quietly remain ordinary `Review` candidates. They should be marked `Exclude from primary consideration` when they cannot satisfy the Christian-sanctoral test for Kalendar v0.1.

4. Great Church supplementation must be explicit.

Rows drawn from Roman Catholic, Eastern Orthodox, Oriental Orthodox, Church of the East, or broader catholic witnesses must remain clearly labeled. Candidate rows should not pretend that a Great Church supplement is Anglican. This is especially important for sparse Anglican days.

5. Duplicate and transfer dates need whole-year harmonization.

A candidate appearing on more than one date should carry a date-harmonization flag until the full 366-day Kalendar is visible. Examples already found include Thomas the Apostle, Stephen, Moses the Black, Wilberforce, Joseph of Arimathea, Cuthbert, Cyprian, John Chrysostom, Pusey, Andrewes, Richard Rolle, Declan, Blane, John Bunyan, Grundtvig, Albert of Jerusalem, Remigius, Gregory the Enlightener/Illuminator, Thomas Cantilupe, Thomas Traherne, Kenneth/Canice, Thecla, John Hus, Clare of Montefalco, Herman of Alaska, Martin de Porres, Sojourner Truth, Harriet Tubman source forms, Margaret/Marina of Antioch, George Whitefield, Hilda, Elizabeth of Hungary, Charles Simeon, Columbanus, Cecilia, Catherine of Alexandria, Isaac Watts, Nicholas Ferrar, Birinus, Osmund of Salisbury, Barbara of Nicomedia, Charles Garnier, Jane de Chantal, Lucy Menzies, John of the Cross, Samuel Johnson, Frances Joseph-Gaudet, Thomas Becket, Basil and Gregory, Macarius of Egypt/Macarius the Great, Hilary of Poitiers, Richard Meux Benson and Charles Gore, the Confession of Peter, Timothy/Titus/Silas, Francis de Sales, John Horden, Brigid, Cornelius, the Martyrs of Japan, Thomas Bray, Colman of Lindisfarne, Emily Malbone Morgan, John Cassian, John and Charles Wesley, Gregory of Nyssa, Gregory the Great, James Theodore Holly, Vincent de Paul and Louise de Marillac, Thomas Ken, John Keble, Kateri Tekakwitha, Dietrich Bonhoeffer, Christina Rossetti, George of Lydda, William Augustus Muhlenberg and Anne Ayres, and others.

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

13. Distinguish true transfers from ordinary provincial date variants.

January exposed a smaller but important source-discipline issue. The SEC master calendar sometimes marks a transfer explicitly, but sometimes simply gives a different fixed provincial date. Candidate rows must not call a provincial date variant a transfer unless the source itself marks it as transferred.

14. When a figure is deliberately excluded by governance, remove the row and its identity scaffolding.

The removal of Martin Luther from February and from the October alternate SIN map is the controlling precedent. A rejected candidate should not remain in the harmonization ledger or SIN maps merely because a source witness exists.

15. Person-event distinction must be preserved.

John Keble / Oxford Movement is the current test case. March has John Keble as priest and poet; July has an Oxford Movement / Assize Sermon event connected to Keble. These should not share a SIN or be treated as the same entity merely because the same person is involved.

16. Alternates named in monthly notes still need harmonization when they overlap prior or future work.

April exposed this especially clearly. Dietrich Bonhoeffer, George of Lydda, Christina Rossetti, William Augustus Muhlenberg and Anne Ayres, and Albert Ernest Laurie are not all rank-1 April candidates, but the April notes create future or prior-month dependencies that belong in the central ledger.

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
- Confirmed that October already carried date-harmonization flags for Remigius, Gregory the Enlightener, Thomas Cantilupe, Thomas Traherne, Kenneth/Canice, Thecla, John Hus, and Clare of Montefalco.
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

## Cross-sectional QC actions after comparing July through January

- Rechecked January against current LFF 2024 before cross-month comparison.
- Normalized January 5 to the current LFF source form: `Sarah, Theodora, and Syncletica of Egypt`.
- Removed an unverified SEC witness marker from Aelred of Rievaulx on January 12.
- Corrected Hilary of Poitiers: SEC January 14 is now treated as a provincial date variant, not as an unverified transfer.
- Corrected Kentigern / Mungo by removing the incorrect January 14 transfer/harmonization note; SEC 2026 lists Kentigern on January 13.
- Added explicit January harmonization notes for Macarius of Egypt / Macarius the Great, Richard Rolle, Cecilia, Francis de Sales, John Horden, Timothy/Titus/Silas, Lydia/Dorcas/Phoebe, and other overlapping forms.
- Updated the cross-date harmonization ledger with January conflicts and future dependencies including Basil and Gregory, Gregory of Nyssa, David I, Hilary, Benson/Gore, MLK, the Confession of Peter, Timothy/Titus/Silas, John Chrysostom, Agnes Tsao Kou Ying, and others.

## Cross-sectional QC actions after comparing July through March

- Rechecked March against current LFF 2024 before cross-month comparison.
- Corrected March 1 David of Wales to say SEC 2026 transfers David from March 1 to March 5; the earlier note wrongly described a David/Bride transfer sequence.
- Corrected March 12 Gregory the Great by replacing the vague `SEC date likely elsewhere` language with the actual SEC September 3 date variant and adding ledger harmonization.
- Clarified March 21 Thomas Ken source forms: current LFF/BCP use March 21, HWHM/GCW use March 20, FAS/SEC use March 22, and SEC 2026 transfers Thomas Ken to March 23.
- Preserved Harriet Ross Tubman as a separate March 10 current-LFF row while recording date/source-form harmonization with the older July 20 group form.
- Updated the cross-date harmonization ledger with February and March conflicts not yet recorded, including Brigid, Cornelius, the Martyrs of Japan, Thomas Bray, Colman of Lindisfarne, Emily Malbone Morgan, John Cassian, Charles Wesley / John and Charles Wesley, Gregory of Nyssa, Gregory the Great, James Theodore Holly, Vincent de Paul and Louise de Marillac, Cuthbert, Thomas Ken, Gregory the Illuminator, and John Keble / the Oxford Movement event.
- Confirmed that Martin Luther remains removed from the working Kalendar files and no longer appears in the cross-date harmonization ledger.

## Cross-sectional QC actions after comparing July through April

- Rechecked April against current LFF 2024 before cross-month comparison.
- Added explicit harmonization language to April 4 Martin Luther King Jr., tying the current April date to the January 15 alternate date while preserving the project caution rule.
- Added April 9 Dietrich Bonhoeffer harmonization with the August paired Bonhoeffer-Kolbe source form and kept him as a Protestant exception candidate rather than automatic inclusion.
- Confirmed April 17 Kateri Tekakwitha as the current LFF controlling date while adding ledger harmonization with the July 14 date variant.
- Added April 23 George of Lydda future-May dependency because George appears as an April alternate and is expected as a May bracketed LFF/source-form issue.
- Added April 27 Christina Rossetti harmonization with the December date-variant row.
- Added April ledger entries for William Augustus Muhlenberg and Anne Ayres source-form harmonization and Albert Ernest Laurie SEC transfer/source verification.
- Strengthened April 24 Genocide Remembrance language so it remains outside the primary saint slot unless governed as event/observance apparatus.

## Continuing QC rule

Each future monthly tranche should be checked against current LFF first, then against earlier months for source-form consistency, duplicate/date harmonization, status-language consistency, year-specific transfer artifacts, and whether the ranking reflects the project rules: holiness over significance, social impact as evidence rather than proof, Anglican-centered source hierarchy, Great Church supplementation only when properly labeled, and the final test of prayability and discipleship.
