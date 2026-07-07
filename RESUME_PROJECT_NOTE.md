
## Pending work (as of 2026-07-06, after DOL session recovery)

For full session history and consolidated workflow practices, see `AUDIT_GOVERNANCE_LEDGER.md` — particularly "Standing Workflow Practices," "Recovery, 2026-07-06," and the DOL-related entries from that date. This note covers only what's actually left to do.

### 1. Collects audit — COMPLETE

All 92 of 92 live collect entries verified against `book_of_common_prayer.pdf`. Nothing further to do here.

### 2. Canticle selection logic — code fix applied, one judgment call open

The hardcoded canticle selection in `js/office-ui.js` has been replaced with day-of-week + season-aware selection implementing BCP1979's Suggested Canticles table (pp.144-145) exactly, verified programmatically against every cell.

**Resolved, 2026-07-06:** add a `precedence` field to calendar-day entries, matching BCP1979's own 5-tier Table of Precedence (pp.14-17), with tier 3 ("Holy Days") split into its two named sub-categories ("Other Feasts of our Lord" vs. "Other Major Feasts") since the app needs both independently. Recorded as a governance decision + defect — **not implemented yet**, deferred to the fix phase alongside every other DOL-audit finding, per the audit-then-fix workflow.

### 3. Daily Office Lectionary (DOL) audit — in progress, audit-then-fix workflow now in effect

**Governance change:** the old fix-as-you-find model is superseded (not retroactively) — audit a full scope, record every finding without touching data, *then* fix as a separate second phase once that scope's audit is complete.

**Settled policy (applies to every remaining season):** bracketed alternative psalms — use the bracketed psalms, not the alternative, when reciting in full (per BCP1979 p.934's own rubric).

**Recorded, not yet fixed:** Holy Days schema gap — BCP assigns 4 readings per Holy Day, `data/season/*.json` only has 3 slots (`reading_ot_mp`, `reading_epistle`, `reading_gospel`, doubled for Year One/Year Two). Confirmed via Advent's St. Andrew and St. Thomas. Deferred until the full DOL audit is done across all 8 season files — check every remaining Holy Day for the same gap and record it, don't fix piecemeal.

**Season-by-season progress (record-only, nothing in `data/season/*.json` touched yet):**
- **Advent — audited, 11 green / 15 red, 0 open questions.**
- **Christmas — audited, 0 green / 12 red** (9 year-split entries all red due to a systematic Year One/Year Two label swap across the season boundary — content itself is accurate BCP text, just filed under the wrong year label; 3 Holy Days red for a wrong-lectionary-track bug, same pattern as St. Thomas in Advent).
- **Epiphany — audited, significant findings, all recorded:**
  - Confirmed the Baptism-of-Our-Lord/dated-day transition bug (Jan 11 should use Week-of-1-Epiphany-Sunday's citation, currently shows the dated Jan.11 citation instead).
  - Confirmed a **systemic psalm-cycle indexing defect** — several entries' psalms exactly match a *different* week's BCP citation (not just wrong, but identifiably shifted), plus 2 confirmed morning/evening psalm swaps. **Root cause traced (2026-07-07): this is a static data-entry error in `data/season/epiphany.json` itself, not a live engine bug** — `CalendarEngine.findEntry()` matches entries by literal date field with no computed cycle-position logic, and `office-ui.js` reads the psalm fields verbatim. Fix = re-populate the specific wrong fields against BCP source, not a code change.
  - Confirmed **named/major Sundays (Epiphany Day, Baptism of Our Lord, Transfiguration/Last Epiphany) show the Eucharistic Proper psalm instead of the Daily Office Lectionary psalm** — same root cause as above (hardcoded wrong values, no live cross-wiring between lectionary tracks). Worth checking if this recurs on other named Sundays year-round.
  - Confirmed a **one-day-forward reading shift** for at least the file's last 3 dated entries (Feb 14-15), plus unrelated wrong-lectionary content at Feb 10 (a Gospel citation from Luke that doesn't belong to this lane at all). **Root cause traced: also a static data error** (no internal duplication found that would explain a mechanical cascade) — each affected entry was individually populated with the wrong day's content. Extent not yet traced past this file's boundary into Lent.
  - The Confession of St. Peter, Conversion of St. Paul, and Presentation (Holy Days inside this range) were not checked — separate Holy Days lectionary table, not yet pulled.
- **Lent — audited, major finding: the Year One/Year Two swap found in Christmas recurs here at much larger scale.** Nearly every entry across all 5 weeks of Lent plus Ash Wednesday plus Holy Week has `year1`/`year2` reading fields swapped (accurate BCP content, wrong year label) — same bug class as Christmas, far bigger footprint. Maundy Thursday/Good Friday/Holy Saturday additionally show the AM/PM structure confused with Year1/Year2 fields; Holy Saturday has an epistle (Romans 8:1-11) stored in a Gospel field. Saint Joseph and the Annunciation (Holy Days in this range) not checked. One minor unrelated defect: Thursday after Ash Wednesday's OT reading missing bracketed verses for both years.
- **Easter — audited, most defect-dense season yet, several distinct bug types:**
  - **Easter Day: no Year One readings at all** (fields blank); Year Two fields show Eucharistic Proper content, not DOL content.
  - **Easter Week (Mon-Sat): Year Two is a straight duplicate of Year One**, not a swap — no real Year Two content exists there. Gospel field Tue-Fri also doesn't match the DOL for either year (looks like Eucharistic daily-Mass gospels).
  - **Week of 2 Easter: classic full Year One/Year Two swap**, same as Christmas/Lent.
  - **Week of 4 Easter, Year Two only (Apr 26-30): one-day-forward shift**, same bug class as Epiphany's tail-end shift.
  - **Ascension Day: OT reading duplicated** — Year One's field holds Year Two's content, Year One's real citation missing.
  - **Pentecost: same duplication, total** — both years show Year Two's content, Year One's real Pentecost reading missing entirely.
  - Saint Mark and Saints Philip & James (Holy Days in this range) not checked.
  - No fresh root-cause investigation run — all patterns above are recurrences of already-diagnosed defect classes (static data-entry errors), not new mechanisms.
- **Ordinary Time (Propers 1-29, all 3 files) — audited, the most severe finding of the entire audit:**
  - **All 150 of 150 checked weekday entries have real reading errors.** Not a clean swap: Year Two fields consistently hold the true Year One content (confirmed by direct trace), but Year One fields hold scattered citations from unrelated Propers/weekdays, not Year Two's content in exchange. Year One's true content for many days may not survive anywhere in the file.
  - Psalms are correct throughout — no psalm defects found here, unlike Epiphany.
  - Root cause: same as everywhere else — static data-entry error, no generator script, no live engine bug (confirmed via the same check used for Epiphany).
  - 19 Holy Days across the three files not checked (separate lectionary table).
  - **Unresolved scope question:** `ordinary1.json`'s first entry ("Tuesday before Ash Wednesday (Shrove Tuesday)," Feb 17) doesn't belong with the rest of the file's Pentecost-season content — needs a live-reference check to determine if it's dead data or a real scope question.
  - Full parsed BCP source table (all 29 Propers, both years, Monday-Saturday) was built this session and exists in working notes — reusable for the fix phase rather than needing re-transcription.

**DOL record-only pass is now COMPLETE for every season** (Advent, Christmas, Epiphany, Lent, Easter, Ordinary 1/2/3). Every single one has confirmed real defects — none have been fixed yet.

True scope of "live" DOL content (366 date entries, ~732 psalm-appointment values, ~2,196 reading values across `data/season/*.json`) — audit now covers all of it except the 19+ Holy Days across the year (separate lectionary table, not yet pulled) and the Shrove Tuesday scope question above.

**Fix phase has not started for any season** — per the audit-then-fix workflow, the whole DOL record-only pass is now done; the next phase is systematic remediation, season by season, starting wherever you direct.

### 4. Deferred features — not started, queued behind items 2 and 3

- **Common of Saints collects** — no existing ID/schema convention; needs its own architecture decision before any content work starts.
- **Quinquagesima/Sexagesima/Septuagesima** as opt-in historical add-ons — also needs its own architecture (settings toggle vs. calendar overlay; sourced rigorously from 1662 BCP or similar; never blended silently into 1979 output).
- Standing instruction: flag (don't discard) any other pre-1979 content encountered in future audit work as a candidate for the same opt-in treatment.

### Push-early discipline

Commit and push (or hand off a patch) after each individually-verified finding or season, not batched across a whole audit — the prior session's work survived only because its patches were manually retrieved from an expiring sandbox before it was torn down. Don't rely on that happening again.

### Standing workflow: audit-then-investigate-then-resume

When the record-only DOL audit surfaces evidence of a possible underlying engine bug (not just a wrong data value), pause the audit at that point, trace it to root cause, record the finding, then resume auditing. This is an extension of the audit itself, not a separate fix-phase step — and it is not the same as fixing the bug, which still waits for the fix phase per audit-then-fix.

### Git state

Everything above (canticle-selection fix through Christmas findings, plus this note) is prepared as a sequence of patches, verified to apply cleanly via `git am` against a fresh clone of current `main` (`e42960a`). Not yet pushed — this sandbox has no push credentials.
