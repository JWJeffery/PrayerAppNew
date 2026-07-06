
## Pending work (as of end of session, 2026-07-06)

For full session history and consolidated workflow practices, see `AUDIT_GOVERNANCE_LEDGER.md`, sections "Standing Workflow Practices (consolidated, 2026-07-06)" and "Session history recap, 2026-07-06." This note covers only what's actually left to do.

### 1. Collects audit — in progress, next in queue

Of 133 total collect entries, 92 are confirmed live (referenced somewhere real in the codebase — check via full-repo grep, not just `data/season/*.json`) and 41 are confirmed dead. **68 of the 92 live collects are verified** against `book_of_common_prayer.pdf` directly. **24 remain completely unchecked:**

- Propers 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29 (11 entries)
- All Saints
- Annunciation
- Presentation
- Holy Innocents
- Holy Name
- Peter & Paul
- Mary Magdalene
- Luke
- Matthew
- Simon & Jude
- St. Stephen
- Confession of St. Peter
- `default-ferial`

Method that's been working: pull each collect's current text, find the exact corresponding page in `book_of_common_prayer.pdf` (both traditional and contemporary language), compare directly, fix what's wrong, confirm what's right. This pass has found real misassignments (not just wording drift) at a meaningfully high rate — treat every unchecked entry as a real candidate for a serious problem, not a formality.

### 2. Canticle selection logic — not started

The full Canticle 1–21 text set now exists and is verified, but the Table of Suggested Canticles (BCP p. 143–144 — which canticle pairs with which day/season/reading) has not been audited, and neither has the lectionary lesson-selection logic generally. Having the right text is not the same as the app choosing the right text on a given day.

### 3. Deferred features — not started, intentionally queued behind items 1 and 2

- **Common of Saints collects** (generic Martyr/Missionary/Pastor/Theologian/Monastic/"Of a Saint" formularies) — no existing ID/schema convention anywhere in the codebase; needs its own architecture decision before any content work starts.
- **Quinquagesima/Sexagesima/Septuagesima** as clearly-labeled, opt-in historical add-ons on top of the 1979 base — also needs its own architecture (settings toggle vs. calendar overlay; sourcing rigorously from 1662 BCP or similar; never blended silently into 1979 output).
- Standing instruction: flag (don't discard) any other pre-1979 content encountered in future audit work as a candidate for the same opt-in treatment.

### Sequencing

Once item 1 (Collects) and item 2 (Canticle selection) are done: Morning Prayer can be marked complete and Evening Prayer audit begun. Only then take up item 3.

### Git state

Everything through this session is merged to `main` (currently at `1800237`). Nothing is pending application.
