
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

### Holy Days lectionary table — audited, the clearest systemic finding of the whole audit

Of 25 Holy Days checked across all 8 season files, **only St. Andrew is genuinely correct.** Every other one pulls its Eucharistic Proper readings instead of the Daily Office Lectionary — the same "wrong lectionary track" bug first spotted on St. Thomas (Advent) and St. Stephen/John/Holy Innocents (Christmas), now confirmed as the *default* condition for nearly every fixed Holy Day in the app, not an isolated incident.

Structural confirmation: the BCP's Holy Days table has no Year One/Year Two split at all (same content every year) and assigns exactly 4 readings (MP: OT + Epistle; EP: OT + Gospel). The app's 3-reading schema is specifically missing **Evening Prayer's own OT reading** — the same gap, every time. The Year1/Year2 duplication in the app's Holy Day entries is harmless (source is identical either way) but worth reconsidering as an unnecessary schema artifact in the fix phase.

### Morning Prayer audit: COMPLETE

Every component checked at least once: Opening Sentences, Confession, Invitatory, Invitatory Psalm, Apostles' Creed, Lord's Prayer, Suffrages, Collects, Mission Prayer, General Thanksgiving/Chrysostom, and the closing sentence are all verified correct. Appointed Psalms and Lessons with Canticles remain amber only because real defects were found and not yet fixed (not because anything is unchecked). Per finish-what-we-start, Morning Prayer is done as an audited unit.

### Evening Prayer — audited, complete

Its own unique parts (everything else shared with Morning Prayer, already covered):
- **Opening Sentence — CORRECTED, this is shared with Morning Prayer, no new defect.** Original finding (below, struck through) was based on checking `bcp-opening-evening`'s text without confirming it's ever actually rendered — it isn't. `data/rubrics.json` shows both offices use the identical `VARIABLE_OPENING` slot, resolving to the same seasonal components already verified under Morning Prayer. `bcp-opening-evening` is dead, orphaned data (confirmed fabricated text, but never referenced anywhere in the rendering code) — a minor cleanup item, not a live defect.
- **Phos Hilaron — confirmed minor defect, stands.** `bcp-phos-hilaron` is hardcoded directly into the Evening Prayer sequence (genuinely live, unlike the Opening Sentence). Rite1 has "glorified **though** all the worlds," should be "**through**." One-word typo, rite2 is correct.
- **Confession — confirmed correct**, properly shared with Morning Prayer's already-verified component (BCP uses identical confession text for both offices).

**Standing lesson:** checking a component's content against source isn't enough — confirm it's actually reachable by the rendering engine (rubric sequence / resolver code) before recording a live defect, the same way engine investigations already check *how* a value is used.

Evening Prayer is now fully audited — its unique parts checked here, everything else already covered by Morning Prayer.

### Noonday Prayer and Compline — next, entirely unaudited

Neither has been touched at all — every row defaults to amber with no note. Per finish-what-we-start, these are next before any fix-phase work begins.

### Noonday Prayer and Compline audit: COMPLETE

**Noonday Prayer — one confirmed missing-content defect, plus two open decisions (corrected 2026-07-07).** Opening versicle and Gloria Patri correct. **Confirmed missing: the versicle "Lord, hear our prayer / And let our cry come to you" (p.105-106) doesn't exist anywhere in the app.** Collect mechanism and Short Lesson were originally waved through as "BCP-permitted, not a defect" — **wrong framing, corrected**: the BCP names multiple real options (4 proper Noonday collects + the Day's Collect; 3 suggested Short Lesson texts + "or some other passage"), and the app silently implements only one path for each, never as a deliberate choice. Both reclassified as open decisions needing Josh's actual input, same category as the Major Feast canticle override.

**Standing rule, applies everywhere in this project:** when source material authorizes multiple options, the app must either offer all real options or have an actual recorded decision selecting one — never just whatever the code happens to default to because only one path was ever built. Apply this retroactively wherever this audit concluded "not a defect, the BCP allows this" without confirming a real choice was made.

**Settled 2026-07-07 — all three: offer both as a toggle.** Noonday's Collect (4 proper Noonday collects vs. the Day's Collect), Noonday's Short Lesson (3 suggested texts vs. the DOL reading), and Compline's Short Lesson (4 suggested texts vs. the DOL reading) all get a toggle, not a single silent path. This is now a confirmed defect (missing toggle), same category as the Holy Days schema gap — decided, not yet implemented, deferred to the fix phase.

**Compline — three confirmed real defects:**
1. Wrong Confession (uses Morning/Evening Prayer's, not Compline's own distinct shorter one).
2. "Our help is in the Name of the Lord" opening versicle missing entirely — not present anywhere in the data.
3. Collect always shows the calendar day's Collect — traced in `office-ui.js`, no Compline-specific branch exists. Unlike Noonday, BCP doesn't authorize this substitution for Compline; its own proper collects are the only correct set. An authored `bcp-collect-compline-1` component exists but is never referenced anywhere in the rendering code — orphaned, same pattern as the Evening Prayer Opening Sentence correction.

Confirmed correct: Kyrie, opening blessing, versicles-before-prayers, closing blessing, Nunc Dimittis text.

**With this, every office — Morning Prayer, Evening Prayer, Noonday Prayer, Compline — is now fully audited at least once. The entire audit phase (every office, every season, the Holy Days table) is complete. Nothing has been fixed anywhere. Next phase is remediation, wherever directed.**

True scope of "live" DOL content (366 date entries, ~732 psalm-appointment values, ~2,196 reading values across `data/season/*.json`) — audit now covers all of it, plus the Holy Days lectionary table. Remaining open item: the Shrove Tuesday scope question above.

**Fix phase has not started for any season** — per the audit-then-fix workflow, the whole audit (DOL + Holy Days) is now done; the next phase is systematic remediation, season by season, starting wherever you direct — but only after Evening Prayer's own remaining parts are audited too.

### 5. Invitatory Psalm selection logic — confirmed defect, no BCP basis (2026-07-07)

Josh pushed back on calling the Venite/Jubilate/Pascha Nostrum pattern "sound" without actually checking it against the BCP. Correct to push back — it wasn't grounded, and this has now been independently verified from the primary source (not taken on the strength of a prior session's note).

**The actual BCP rule** (checked in both `book_of_common_prayer.pdf`'s traditional-language Morning Prayer, p.42/45, and contemporary-language Morning Prayer, p.83+): "Then follows one of the Invitatory Psalms, Venite or Jubilate" — a genuinely free daily choice with **zero** seasonal restriction. The only seasonal rule anywhere governing the Invitatory is: "In Easter Week, in place of an Invitatory Psalm, [Pascha Nostrum] is sung or said. It may also be used daily until the Day of Pentecost" — mandatory for Easter Week, optional through the rest of Eastertide.

**`js/office-ui.js` hardcodes a rule with no textual basis at all**: Lent → always Jubilate; Lent Fridays → raw Psalm 95 instead of either Invitatory Psalm; every other day → Venite. There is no rubric anywhere in the BCP associating Jubilate with Lent, or calling for unabridged Psalm 95 on Lenten Fridays specifically. This is invented content dressed up as a rule, not a sourced BCP practice — the same fabrication pattern already found in the LFF collects, the Ethiopian Senkessar, and the fabricated Evening Prayer Opening Sentence.

The Easter branch (`isEaster` → Pascha Nostrum) **is** correctly grounded and correctly computed (`season === 'easter'` matches `CalendarEngine`'s actual lowercase output — no case-mismatch bug), but per the standing rule below, it still silently picks one BCP-permitted path (always Pascha Nostrum through the whole season) over the equally legitimate alternative (plain Venite/Jubilate) for the optional-extension period (Easter 2 onward), without ever making that an actual decision. Flagged for the same toggle-or-decide treatment as the Noonday/Compline questions, but lower priority since the content itself is correct.

**Dashboard corrected:** "Invitatory Psalm" reclassified from green to red — the texts are fine, but the selection rule isn't, and the prior green rating only checked text, not the logic governing which text displays when. Same standing lesson as Evening Prayer's Opening Sentence: checking a component's content isn't the whole audit; the rule for *when* it's chosen needs independent verification too.

### 6. Sanctoral Calendar (Anglican-tagged saints) — duplicate-date defect FIXED in data; broader content audit not started

Per Josh's direction: the Daily Office audit can't be called complete without also checking the rubric/selection logic (done, see above) and the Anglican-tagged saints calendar, since the calendar engine resolves Holy Days from this data. For this specific defect, Josh directed an actual fix rather than record-only — "determine the correct dates," "remove the Anglican tag if you cannot find them in the TEC or Anglican national calendars" — so this is now fixed in `data/saints/commemorations.json`, not just documented.

**Data model** (`data/saints/readme.md`): `identities.json` (one record per person/event, date-free) + `commemorations.json` (one record per tradition × date × identity) generate the `saints-{month}.json` cache files used at runtime.

**Defect: 27 identities had multiple, conflicting ANG-tagged dates. Now fixed.** 376 total ANG records across 348 distinct identities; 27 had 2 or 3 dates on file simultaneously. All 27 checked against `lesser_feasts_and_fasts_-_2024__final_.pdf` (TEC), `book_holy_women_holy_men_for_web.pdf` (predecessor TEC calendar), and — per Josh's instruction to check Anglican national calendars more broadly — the Church of England's Common Worship calendar:

- **21 resolved via LFF 2024 alone** — one date confirmed correct, the other(s) deleted.
- **2 where neither on-file date was correct — true dates added, since absent from the data under either original duplicate:** Cornelius the Centurion (Oct 20) and Robert Grosseteste (Oct 9 — the old Oct 8 was off by exactly one day).
- **2 absent from TEC entirely but confirmed via the Church of England calendar — kept the already-correct on-file date, deleted the other:** Edward the Confessor (Oct 13), Cyril of Alexandria (Jun 27).
- **2 confirmed absent from all three sources checked — ANG tag removed entirely, per instruction:** John of Beverley (no other tradition tag, now absent from every generated cache file) and Vincent Ferrer (retains his separate, untouched LAT/Roman Catholic tag at Apr 5 — only the unsupported ANG tag was removed).

**Important nuance, and an open architecture question Josh raised:** 4 identities — Richard of Chichester, Thomas Ken, Catherine of Alexandria, Monica — turned out to have BOTH on-file dates independently legitimate, one per calendar (TEC vs. Church of England), not "one right, one wrong":

| Identity | TEC (LFF 2024) | Church of England |
|---|---|---|
| Richard of Chichester | Apr 3 | Jun 16 |
| Thomas Ken | Mar 21 | Jun 8 |
| Catherine of Alexandria | Nov 24 | Nov 25 |
| Monica | May 4 | Aug 27 |

Kept TEC's date in each case (this project's established primary authority) and deleted the Church of England alternate — but this was a judgment call under the schema's current constraint, not a claim that the deleted date was ever wrong. **Josh's response:** worth considering a schema change so `commemorations.json` can record communion, tradition, *and* jurisdiction/province separately, rather than collapsing "Anglican" into one `ANG` slot that can't hold more than one province's date for the same person. Not decided or implemented — recorded here as a live architecture question for whenever schema work is next in scope, alongside the already-deferred Common of Saints and Quinquagesima/Sexagesima items.

**Applied and regenerated:** 32 records deleted, 2 added in `data/saints/commemorations.json`. Ran `node tools/build_saints_cache.js` (all months) to regenerate all 12 cache files from the corrected source. Spot-checked the October cache directly (Grosseteste, Edward, Cornelius all correct); confirmed John of Beverley and Vincent Ferrer's ANG tag is gone from every cache file. Before: 376 ANG records / 348 identities, 27 duplicated. After: 346 ANG records / 346 identities, **zero duplicates** — confirmed programmatically. Full before/after table in the ledger.

**Still not done:** the full text-content audit (identity description, rank, associated collect) for all 346 remaining ANG identities has not been attempted — this fix covered only the date-duplication defect. The other four tradition codes (LAT, EOR, OOR, COE) haven't been checked for the same duplicate-date pattern.

Full correct/spurious table for all 27 is in the ledger.

**Remaining scope, genuinely not started:** the full text-content audit (identity description, rank, associated collect where one exists) against LFF 2024 and BCP1979 for all 348 ANG identities — the work above resolved only the date-duplication defect, not a content-accuracy pass; and the other four traditions (LAT/EOR/OOR/COE) in the same `commemorations.json` haven't been checked for the same duplicate-date pattern at all.

### 7. Deferred features — not started, queued behind items 2 and 3

- **Common of Saints collects** — no existing ID/schema convention; needs its own architecture decision before any content work starts.
- **Quinquagesima/Sexagesima/Septuagesima** as opt-in historical add-ons — also needs its own architecture (settings toggle vs. calendar overlay; sourced rigorously from 1662 BCP or similar; never blended silently into 1979 output).
- **Sanctoral schema: record communion/tradition/jurisdiction separately (Josh, 2026-07-07)** — `commemorations.json`'s single `ANG` slot per identity can't represent genuine multi-province Anglican dates (see the Richard of Chichester / Thomas Ken / Catherine of Alexandria / Monica finding, section 6 above). Needs its own design before implementation; the current TEC-priority resolution for those 4 identities is provisional pending this.
- Standing instruction: flag (don't discard) any other pre-1979 content encountered in future audit work as a candidate for the same opt-in treatment.

### Push-early discipline

Commit and push (or hand off a patch) after each individually-verified finding or season, not batched across a whole audit — the prior session's work survived only because its patches were manually retrieved from an expiring sandbox before it was torn down. Don't rely on that happening again.

### Recovered, 2026-07-07 — three sweep findings that never made it to origin

A prior instance's systematic sweep for silent option-picking found three more real gaps beyond the Noonday/Compline toggle items — generated as a patch, never pushed before a token-limit handoff, and confirmed lost (dashboard still showed all three green). Re-recorded now, not re-investigated:

- **Suffrages B is missing entirely** — app only has Suffrages A; BCP offers both as equal alternatives (pp.54/96).
- **Concluding Sentence: only 1 of 3 authorized options exists** — previously waved off as "completeness, not an error," that framing is retracted.
- **Seasonal Opening Sentences: only 4 of many BCP categories implemented** (Advent/Lent/Easter/General only) — largest of the gaps found, not fully scoped.

All three reclassified red in the dashboard, not yet decided (same "offer all options or make a deliberate choice" treatment as everywhere else).

### Sanctoral duplicate-dates: confirmed systemic across all 5 traditions, not just Anglican

Ran the same duplicate-date check used for ANG against LAT, EOR, OOR, COE:

| Tradition | Entries | Duplicated identities |
|---|---|---|
| LAT | 404 | 8 |
| EOR | 412 | 8 |
| OOR | 368 | 15 |
| COE | 235 | **35** |

COE is by far the worst — roughly 1 in 7 entries affected, with **Mar Narsai and Mar Babai the Great each carrying 5 different dates** on file simultaneously.

**Not resolved.** The ANG fix worked because two authoritative sources (LFF 2024, Common Worship) were readily available for 27 identities. These 66 identities need the equivalent authoritative calendars for Eastern Orthodox, Oriental Orthodox, Church of the East, and Roman Rite — none in hand this session. Confirmed and quantified as a real defect of the same class (worse in COE's case), but resolving it needs its own sourcing effort before attempting the same fix-in-place approach.

### Non-ANG identities checked against Anglican sources — real gaps found, including a likely regression

Per Josh's direction, checked every identity not currently ANG-tagged against LFF 2024 (284 calendar entries parsed, matched at high confidence only).

**Likely regression:** "Fabian, Bishop and Martyr" is genuinely in LFF 2024 at Jan 20 — the earlier session's removal of `saint-fabian`'s ANG tag (believing it fabricated/absent from TEC) appears to have been wrong. Needs restoring.

**13 identities matched to a real LFF entry with no ANG tag at all**, including Confession of Saint Peter (Jan 18 — already a confirmed live BCP1979 Holy Day elsewhere in this audit, currently only tagged EOR), David of Wales, Basil of Caesarea, Ignatius of Loyola, Herman of Alaska, and 8 others.

**9 identities have an ANG tag at the wrong date** vs. LFF 2024 — Harriet Bedell, Martyrs of Japan, Emily Malbone Morgan, Vincent de Paul (biggest gap: on-file Sep 27 vs. LFF's Mar 15 — needs care, could be a legitimate separate/joint commemoration rather than a simple error), John Keble, John Cassian, Cyprian of Carthage, Hilda of Whitby, Nicholas Ferrar.

**One naming mismatch, not a date problem:** Aug 15 is correctly ANG-tagged but under `dormition-or-assumption-of-the-virgin-mary` rather than a dedicated Mary-the-Virgin identity.

**Not resolved — needs the same careful per-case judgment as the original 27 duplicates**, not a blind fix. Common Worship (Church of England) wasn't cross-checked this session, only TEC/LFF 2024.

### Fix applied, 2026-07-07 — all 24 findings resolved in data

Per finish-what-we-start: Fabian's regression reverted (ANG restored at Jan 20); 13 identities added at their LFF 2024 date; 9 corrected to the LFF 2024 date; Vincent de Paul resolved as a genuine joint commemoration with Louise de Marillac at March 15 (not just a date fix — the old Sep 27 date was copying the Roman solo date, and Louise had no ANG tag at all before this). All 24 verified present at the correct date; saints cache regenerated for all 12 months; January cache spot-checked directly.

**Still open:** Common Worship cross-check for these same identities not attempted. Full text-content audit (descriptions/ranks/collects) for all ANG identities not started. By-tradition duplicate-date work (LAT/EOR/OOR/COE) paused per Josh's direction, not abandoned.

### Standing workflow: audit-then-investigate-then-resume

When the record-only DOL audit surfaces evidence of a possible underlying engine bug (not just a wrong data value), pause the audit at that point, trace it to root cause, record the finding, then resume auditing. This is an extension of the audit itself, not a separate fix-phase step — and it is not the same as fixing the bug, which still waits for the fix phase per audit-then-fix.

### Git state

**Corrected 2026-07-07:** the prior version of this section was stale — it claimed nothing had been pushed, but everything through the Noonday/Compline toggle decision (commit `19e98e1`, "Record settled decision: offer a toggle for all three open questions...") **is confirmed pushed and live on `origin/main`**, verified by cloning fresh and checking `git log origin/main` directly rather than trusting this note's own prior claim. The session that did that work ran out of tokens partway through a follow-up investigation (Venite/Jubilate rubric check, sanctoral calendar check) — that specific follow-up work was never committed or pushed, and is not recoverable from this sandbox (a different Claude account's sandbox, now inaccessible). It has been redone from scratch in this session; see the new sections below.

This session's own new findings (Invitatory Psalm selection-logic defect, Sanctoral duplicate-date finding) are prepared as patches, verified via `git am` against a fresh clone of the actual current `main` (`19e98e1`). Not yet pushed — this sandbox also has no push credentials.
