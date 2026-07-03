# Kalendar v0.1 QC Notes

## Scope

These notes govern quality control for the Kalendar v0.1 ranked candidate matrices. They were written after comparing the July and August ranked studies.

The candidate CSV files remain pre-decisional. A rank is an editorial recommendation for review, not a final primary selection. `decision_status` should remain `Pending` and `final_primary` should remain blank until Josh governs the day.

## Lessons learned from July and August

1. Source hierarchy and holiness fit must both be visible.

BCP and LFF authority matter strongly, but a candidate with strong official-source presence may still require review if the case is mainly civic, artistic, political, reformist, or broadly historical. Conversely, a provincial or Great Church candidate may rank higher on a thin or contested day when its holiness/prayability fit is stronger.

2. Do not conflate variant source forms.

If different Anglican sources preserve different forms of the same commemoration, especially different group membership, the forms should be split into separate rows or clearly explained. This arose on July 20: LFF 2024 gives Elizabeth Cady Stanton, Amelia Bloomer, and Sojourner Truth; older/other Anglican sources also include Harriet Ross Tubman. Tubman must not be absorbed into a social-reformer group without her separate holiness rationale.

3. Non-sanctoral and borderline-Christian entries must be flagged more strictly.

Historical events, civic observances, non-Christian group memorials, and threshold-Christian figures may be historically or devotionally significant, but they should not quietly remain ordinary `Review` candidates. They should be marked `Exclude from primary consideration` when they cannot satisfy the Christian-sanctoral test for Kalendar v0.1.

4. Great Church supplementation must be explicit.

Rows drawn from Roman Catholic, Eastern Orthodox, Oriental Orthodox, Church of the East, or broader catholic witnesses must remain clearly labeled. Candidate rows should not pretend that a Great Church supplement is Anglican. This is especially important for sparse Anglican days.

5. Duplicate and transfer dates need whole-year harmonization.

A candidate appearing on more than one date should carry a date-harmonization flag until the full 366-day Kalendar is visible. Examples already found include Thomas the Apostle, Stephen, Moses the Black, Wilberforce, Joseph of Arimathea, Cuthbert, and others.

6. Appendix material should not be treated as equal to calendar material.

HWHM or GCW appendix entries may be valuable, especially for Anglican bishops or monastics, but appendix status must remain visible in `source_tier` and `review_flags`.

7. Group commemorations require special caution.

Groups can be retained as candidates, but the ranking rationale must state whether the group is coherent hagiographically or merely historical/representational. If one member of the group has a stronger holiness case than the group itself, that should be noted for later separation.

8. Artist, writer, composer, reformer, and public-intellectual entries require doxological or discipleship framing.

These candidates are not excluded by default, but their entries must teach prayer, holiness, and discipleship rather than admiration for genius, activism, or cultural importance.

## QC actions taken

- Revised July 5 to remove `SEC-adjacent` as if it were a source witness. Palladius is now marked as AM only pending provincial-calendar verification.
- Split the July 20 social-reformer row into current LFF 2024 form and older four-person Anglican-source form including Harriet Ross Tubman.
- Revised August 2 to add GCW as a witness for Samuel Ferguson.
- Revised August 5 to make explicit why the Dürer/Grünewald/Cranach artist group remains below Oswald despite higher TEC-secondary source presence.
- Revised August 24 to mark Simone Weil as `Exclude from primary consideration`, not ordinary `Review`, because of ecclesial-status mismatch for the Christian-sanctoral primary calendar.

## Continuing QC rule

Each future monthly tranche should be checked against all earlier months for source-form consistency, duplicate/date harmonization, status-language consistency, and whether the ranking reflects the project rules: holiness over significance, social impact as evidence rather than proof, Anglican-centered source hierarchy, Great Church supplementation only when properly labeled, and the final test of prayability and discipleship.
