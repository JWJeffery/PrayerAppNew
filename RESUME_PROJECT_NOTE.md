
## Immediate pending work (as of end of session, 2026-07-05, resumed)

The 8 Holy Days collect fixes previously pending here, plus the Holy Cross Day entry, have been applied to `components/anglican.json`, re-verified character-for-character against `book_of_common_prayer.pdf` at application time (see AUDIT_GOVERNANCE_LEDGER.md, "Session, 2026-07-05 (resumed) — Holy Days collects batch 3, applied," for the full list and an important method-correction finding: several of the originally-drafted fixes understated the actual scope of error).

**Per the finish-what-we-start rule, Morning Prayer Collects are still not complete.** Remaining work before Morning Prayer as a whole can be marked done:

1. **Common of Saints collects (the generic Martyr/Missionary/Pastor/Theologian/Monastic/"Of a Saint" formularies)** — confirmed 2026-07-06 these do not exist anywhere in the codebase and nothing currently references them, so this is new-build work needing its own architecture/schema decision (ID convention, file location, calendar-engine fallback behavior), not a targeted repair. **Deliberately scheduled for after item 2 below, not before** — see governance ledger, "Deferred, 2026-07-06."
2. **The ~70 collects flagged by the earlier anchor-based automated sweep still need manual triage** (method produces false positives from page-break/page-number artifacts — not a re-run candidate). **This is next in the queue.**

Closed 2026-07-06: **Collects vs. Lesser Feasts and Fasts 2024.** Re-established the true scope first (2 of the assumed 8 candidates — Joseph, James of Jerusalem — turned out to be BCP1979 Major Feasts, not LFF, misclassified in an earlier session). All 6 genuine LFF entries verified correct against the actual PDF. Found and fixed one real remaining problem: **Fabian was still fully fabricated** despite an earlier session's note claiming the pattern was identified — the fix was never actually applied to the data. Also fixed real (not trivial) errors in James of Jerusalem rite1 and a trivial one in Joseph rite1, both found during re-verification. See governance ledger for full detail.

Once item 2 is done: continue to the full Canticle set beyond Te Deum (also still open per the Morning Prayer dashboard status), then Morning Prayer can be marked complete and Evening Prayer begun. Only then take up item 1.
