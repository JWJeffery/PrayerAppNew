
## Immediate pending work (as of end of session, 2026-07-05, resumed)

The 8 Holy Days collect fixes previously pending here, plus the Holy Cross Day entry, have been applied to `components/anglican.json`, re-verified character-for-character against `book_of_common_prayer.pdf` at application time (see AUDIT_GOVERNANCE_LEDGER.md, "Session, 2026-07-05 (resumed) — Holy Days collects batch 3, applied," for the full list and an important method-correction finding: several of the originally-drafted fixes understated the actual scope of error).

**Per the finish-what-we-start rule, Morning Prayer Collects are still not complete.** Remaining work before Morning Prayer as a whole can be marked done:

1. **Common of Saints collects (the generic Martyr/Missionary/Pastor/Theologian/Monastic/"Of a Saint" formularies)** — confirmed 2026-07-06 these do not exist anywhere in the codebase and nothing currently references them, so this is new-build work needing its own architecture/schema decision (ID convention, file location, calendar-engine fallback behavior), not a targeted repair. **Deliberately scheduled for after items 2 and 3 below, not before** — see governance ledger, "Deferred, 2026-07-06."
2. **Collects vs. Lesser Feasts and Fasts 2024** — a separate, already-opened body of work (see governance ledger, "Confirmed systemic finding, 2026-07-05"). 3 of 6 checked modern-saint collects sourced from LFF were found to be fully composed/fabricated, not paraphrases. Every remaining LFF-sourced collect must be treated as unverified.
3. The ~70 collects flagged by the earlier anchor-based automated sweep still need manual triage (method produces false positives from page-break/page-number artifacts — not a re-run candidate).

Once these are done: continue to the full Canticle set beyond Te Deum (also still open per the Morning Prayer dashboard status), then Morning Prayer can be marked complete and Evening Prayer begun. Only then take up item 1.
