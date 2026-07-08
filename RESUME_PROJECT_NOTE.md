
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

### Common Worship cross-check done — confirms most fixes, flags one new issue

Checked the just-applied 24 fixes against the Church of England's Common Worship calendar. Vincent of Saragossa, David of Wales, and Ignatius of Loyola match exactly across both TEC and CofE — good corroboration. Basil the Great and Francis de Sales have different dates in each calendar (expected — genuine provincial differences, not errors, matches the TEC-priority convention already in use).

**New flag, not resolved: `saint-george-of-lydda` (May 6, just tagged ANG) may be the same person as the pre-existing `saint-george` (April 23, already ANG-tagged) split into two identity records.** May 6 is the Oriental Orthodox/Julian-shifted date for the same historical St. George, not a separate saint. If true, this re-introduces a split version of the exact defect just fixed — needs real editorial judgment (merge vs. genuinely separate), not a quick mechanical correction. Left as-is pending that decision.

### George/George of Lydda resolved

LFF 2024 has exactly one entry for this saint (the bracketed May 6 one) — no April 23 entry exists in TEC's calendar at all. Removed `saint-george`'s unsupported `ANG` tag at April 23 (its EOR/LAT/OOR tags there are untouched). `saint-george-of-lydda` keeps the sole ANG tag at May 6. Cache regenerated and verified.

### The 91 flagged identities, checked against a third source (HWHM 2010) — 36 of 91 confirmed legitimate, method limits discovered

Common Worship confirmed 25. Holy Women, Holy Men 2010 (TEC's predecessor calendar) confirms 11 more at the same date: Andrei Rublev, Fanny Crosby, Charles Freer Andrews, John Roberts, Innocent of Alaska, Molly Brant, Samson Occom, Charles Grafton, Gregorio Aglipay, Richard Rolle, Samuel Ajayi Crowther. **No changes needed for these 36 — they're genuine, just absent from LFF 2024's exact headline list.**

**Real limitation found:** `saint-lawrence` still showed as "unsupported" by the automated method, but HWHM 2010 clearly has him ("Laurence") at the identical date — the matcher just failed on the British/American spelling variant. **This means the automated approach cannot safely confirm the remaining ~55 are actually wrong** — it's demonstrated a real false-negative mode at this granularity. No further changes made this session. Resolving the rest needs manual, name-by-name verification, not more of the same automated matching — treat as its own bounded task if revisited.

### Two more sources checked, then 28 of 31 fixed, then final 3 removed — this thread is closed

For All the Saints (Canadian) and A Great Cloud of Witnesses confirmed 2 more (Saint Lawrence, Junia) — 39 of 91 total confirmed legitimate, no changes needed. 28 of the remaining 31 removed from ANG after exhausting all 5 sources. **The final 3 exceptions (Damasus, Saint Sylvester I, Saint Victor I) also removed per Josh's ruling** — `damasus` and `saint-victor-i` had only the ANG record and are now gone from the dataset entirely; `saint-sylvester-i` retains its EOR/LAT/OOR tags. Cache regenerated and verified.

**This closes the entire 91-identity thread.** Final tally: 39 confirmed legitimate (unchanged), 31 removed as unsupported by all 5 checked sources, plus the original 24 fixes and the George/George of Lydda resolution. **Genuinely open, separate from this thread:** the full text-content audit for remaining ANG identities, and the paused by-tradition duplicate work (LAT/EOR/OOR/COE), deliberately deferred until those offices are reached.

### Standing workflow: audit-then-investigate-then-resume

When the record-only DOL audit surfaces evidence of a possible underlying engine bug (not just a wrong data value), pause the audit at that point, trace it to root cause, record the finding, then resume auditing. This is an extension of the audit itself, not a separate fix-phase step — and it is not the same as fixing the bug, which still waits for the fix phase per audit-then-fix.

### Rubrics/logic sweep, continued, 2026-07-07 — two more confirmed defects

Per Josh's direction to keep auditing without pausing to ask — text corpus, rubrics, logic, engines — continued the systematic sweep for silent single-path selections. Started from `VARIABLE_ANTIPHON` in `js/office-ui.js`, which hadn't been checked by name in any prior session.

**Invitatory Antiphon: unsupported across the entire Season after Pentecost.** BCP p.42-43/79-80 provides antiphons for exactly six named windows (Advent, Twelve Days of Christmas, Epiphany-through-Baptism/Transfiguration/Holy Cross, Lent, Easter-to-Ascension, Ascension-to-Pentecost) — confirmed exhaustive by a cross-reference elsewhere in the BCP pointing back to these same six, nothing else provided anywhere. Nothing exists for Trinity Sunday or any day of Propers 1-29 — most of the church year. All 190 entries across `ordinary1/2/3.json` (both `antiphon_mp`/`antiphon_ep`) are unsupported: 173 of 190 (91%) show Lent's specific text verbatim ("The Lord is full of compassion and mercy") in a season nowhere near Lent — a data-population default, not a live code bug (no generator script, no hardcoded fallback). The other 17 show fixed texts for apparently notable days (Trinity Sunday, saints' days, Christ the King) that don't exist anywhere in BCP1979 either — invented content, same pattern as the LFF collects. Not fixed — most plausible remedy is no fixed antiphon at all for that season, but this is a content-removal decision across 190 entries, recorded for Josh rather than acted on unilaterally. The 5 seasons inside a valid BCP window have only been checked for category plausibility, not word-for-word — that remains open.

**Evening Prayer shows both an Invitatory Psalm AND Phos Hilaron, when the BCP frames them as alternatives.** BCP p.63/117 ("The Invitatory and Psalter"): after the fixed opening versicle, "The following, or some other suitable hymn, or an Invitatory Psalm, may be sung or said" — Phos Hilaron, another hymn, or an Invitatory Psalm (Venite/Jubilate) are three alternatives, pick one. `data/rubrics.json`'s Evening Prayer sequence renders `bcp-invitatory-full` (which unconditionally continues into the same Venite/Jubilate/Psalm-95/Pascha-Nostrum logic already flagged as defective for Morning Prayer — `isEvening` is explicitly included in that branch's condition) immediately followed by `bcp-phos-hilaron`, unconditionally. Every Evening Prayer currently shows both, not one. Confirmed NOT to affect Noonday Prayer or Compline (correctly excluded from that branch). This corrects and substantially extends the earlier "Phos Hilaron — confirmed minor defect, stands" note, which only checked Phos Hilaron's text (a one-word typo, still stands separately) without checking whether it's structurally correct to render unconditionally. Not fixed — remedy is an open decision (default to Phos Hilaron only, or offer a toggle), same category as Noonday/Compline.

Both added to the dashboard (new "Invitatory Antiphon" row; "Invitatory (O God, make speed to save us / Phos Hilaron)" row updated).

### "Audit the audit," 2026-07-07 — Josh's direct challenge: did we actually audit all of it?

Josh asked pointedly: did we audit all of the Daily Office in the '79 BCP? Have we gone through the rendering logic with a fine tooth comb? What are we missing? Answered by checking the audit's scope against BCP1979's own table of contents for "The Daily Office" (pp.37-148), and inventorying every single item in every office's `data/rubrics.json` sequence — not trusting the "every office fully audited" claim already on record without re-checking it against the source's own structure.

**Two entire BCP1979 services were never in scope at all, and don't exist in the codebase:** Order of Worship for the Evening (the Service of Light, p.108-114) and Daily Devotions for Individuals and Families (p.137-140). Not "audited and fine" — simply never considered part of the office inventory in any prior session. Whether to build them is a feature question for Josh, separate from this being an audit gap.

**The Great Litany is severely truncated — confirmed missing roughly 75-80% of its actual text.** `bcp-litany` exists, is correctly toggleable, and what's there (2,034 characters) is word-for-word correct — but the real BCP Litany spans 8 full pages (~9,000+ characters), and the stored text cuts off after the very first of at least 19 "We beseech thee to hear us, good Lord" responses. Confirmed only one component exists; nothing holds the rest.

**The biggest finding: Morning and Evening Prayer's second Collect is a whole anthology in the BCP, the app hardcodes one path each — and Evening Prayer's path uses the wrong text entirely.** BCP p.55-57/98-99 (Morning) and p.68-70/123-124ish (Evening): "one or more of the following Collects" — 7 named options for Morning (Sundays, Fridays, Saturdays, Renewal of Life, Peace, Grace, plus the Day's Collect), 8 for Evening (Sundays, Fridays, Saturdays, Peace, Aid against Perils, Protection, Presence of Christ, plus the Day's Collect). The app implements exactly 2 (Grace and Peace), and **the "Peace" text used for Evening Prayer is actually Morning Prayer's Collect for Peace** — Evening's own, textually different Collect for Peace doesn't exist anywhere in the data. Only Grace was previously verified (as part of the 92-collect audit); this whole gap was invisible to that audit because it was scoped to the seasonal/Proper collects, a different corpus entirely.

**Follow-up check, same session:** applied this same "start from the BCP's own rubric text" method to Noonday Prayer and Compline's own collect anthologies, since the same gap seemed possible there. Result: both were already fully and correctly characterized by the existing dashboard entries (Noonday: 4 collects + the Day's Collect; Compline: 5 collects + 2 additional optional prayers) — a useful negative result confirming that earlier work holds up, unlike the Morning/Evening Prayer second collect, which had never been checked this way before.

**What this changes:** the prior "every office is fully audited, the entire audit phase is complete" claim should be read as covering DOL-adjacent content and previously-inventoried rubric slots, not as "every BCP-specified element has been checked for existence and completeness." The component-by-component method that produced that claim structurally cannot catch content that was never built, or a component that silently stops partway through the source text — only starting from the source's own structure catches those. All four new findings recorded in the ledger and dashboard; none fixed. The Litany truncation is a mechanical fix once the fix phase begins. The second-collect anthology needs the same anthology-vs-single-path decision as Noonday/Compline, plus a mechanical correction to Evening's wrong Peace text independent of that decision.

### Systematic option-language sweep, same session, 2026-07-07 — one more real defect found, rest confirmed clean

Followed up "audit the audit" with a full grep of every "one or more of the following" / equivalent option-language pattern across the entire Daily Office section (pp.37-155) — 24 hits total. 22 were already accounted for by existing findings. Two were not, and both are the same real defect:

**Noonday Prayer and Compline both silently show the wrong Psalms — every day, not occasionally.** `js/office-ui.js` computes Noonday's and Compline's psalms from `dailyData.psalms_ep` (the DOL's Evening Prayer psalm for that date) — no dedicated logic for either office exists. BCP appoints Noonday its own fixed set (Psalm 119 vv.105-112, Psalm 121, Psalm 126) and Compline its own (Psalm 4, 31 vv.1-5, 91, 134 — the classic Compline psalms in nearly every Western breviary tradition), neither related to the DOL cycle at all. Compline's dashboard row already had the right label ("4, 31:1-6, 91, or 134") from an earlier session — the label was correct, the code was just never wired to use it. Recorded, not fixed.

This closes out the systematic sweep with a useful negative result on the rest: nothing else of this shape (BCP naming real options, app silently picking one) remains unaudited in the four core offices.

### Daily Devotions for Individuals and Families — built, 2026-07-07

Per Josh's direction: mirrors the existing Church of the East full/short-form pattern (`esy-mode`, Cathedral/Monastic) rather than a new fifth office. New "Office Mode" toggle (`ang-office-mode`, Full/Devotion) in the sidebar, right after the existing Time of Day selector. Each of the 4 existing offices (`morning-office`, `evening-office`, `noonday-office`, `compline-office`) gets a `devotionSequence` array alongside its `sequence` array in `data/rubrics.json`; the render loop picks whichever the toggle selects.

**Provenance correction, stated plainly:** the 12 content components and 4 `devotionSequence` arrays were found already sitting in this sandbox's uncommitted working tree before this session wrote any code — initially reported to Josh as pre-existing verified work, which was wrong. `git log --all` confirms this content is not in git history anywhere; it was uncommitted local state, most plausibly (not confirmed) from earlier untracked work in this same long conversation that never got committed because every commit in this session used a targeted `git add <files>`, not `git add -A`. The content was independently re-verified byte-for-byte against BCP1979.pdf pp.136-140 before being trusted and wired in — all 12 components check out exactly. The UI toggle and rendering logic are new work from this session.

Traced every devotion-sequence item through the render loop by hand before considering this done (no collisions with existing dedicated handlers; everything falls through correctly to either its own handler or the generic catch-all). `node --check` clean, both touched JSON files valid. Not yet tested in an actual browser — no browser available in this sandbox; this is a code-level correctness check only.

### Git state

**Corrected again, 2026-07-07:** `origin/main` is at `cf9315c` (the Noonday/Compline Psalm finding). This session's Daily Devotions build is recorded in the ledger, not yet committed to a patch as of this note's writing.

### Fix phase — begun 2026-07-08, in progress, updated after each tranche per Josh's direction

**HANDOFF — read this first if picking up fresh.** The Holy Days lectionary fix (below) is now done. Check `git log` for the actual current head rather than trusting a hash written here — this note gets updated per-tranche but hashes go stale fast.

**Big discovery this tranche, worth knowing:** the "3-slot-vs-4-reading schema gap" Holy Days supposedly needed was never actually a code limitation. `js/office-ui.js` already computes the evening Old Testament reading from `dailyData['reading_ot_ep_' + litYear]` with graceful fallback — that field was already fully wired into the rendering engine, just never populated in any Holy Day's JSON. No schema decision was needed; this was purely a data-population gap. Worth remembering before assuming a "gap" needs an architecture decision — check the actual render code first, as this tranche did before writing any fix.

**What's actually left, per Josh's own summary:**
1. **40 Sunday/named-feast/apostle-day entries inside the Ordinary Time files, plus "The Day of Pentecost" and "Shrove Tuesday" entries in those same files** — still untouched. Check whether "The Day of Pentecost" here duplicates the entry already fixed in `easter.json` before fixing it twice, and resolve the open Shrove-Tuesday scope question.
2. **Decided-but-unimplemented items**, per Josh: Noonday/Compline short-lesson toggles, the second-collect anthologies (including Evening Prayer's wrong Peace text), and the canticle-selection precedence field. Check `AUDIT_GOVERNANCE_LEDGER.md` and this note's earlier tranches before assuming these are still fully outstanding.
3. Two flagged schema questions, still undecided — these genuinely do need an architecture decision, unlike the Holy Days case above: the Lent/Easter AM/PM-vs-year1/year2 mismatch (Good Friday, Holy Saturday, Easter Day), and the Invitatory Psalm's Easter-extension toggle (lower priority).
4. **Count discrepancy worth resolving:** the original audit said "25 Holy Days checked" and "19 Holy Days in Ordinary Time files." A direct scan this tranche found exactly 24 Holy Day entries total across all 8 season files (14 of them in Ordinary Time: 4+6+4 across the three files). Every entry found is now fixed; if the original counts were right and some entries are missing from the app's data entirely, that's a separate, unaddressed gap worth a fresh look.

**Standing workflow, confirmed working across 10+ tranches and two different sessions now — keep doing this:**
1. Pick one bounded scope (one season file, or one confirmed defect).
2. Extract the relevant `book_of_common_prayer.pdf` pages directly (pdfplumber, or page-image rasterization for OCR-suspect passages) rather than trusting memory or the prior audit note — multiple times this session the prior audit note itself was wrong, and only direct source-checking caught it.
3. **Before assuming something needs a schema/architecture change, check the actual rendering code first.** The Holy Days "schema gap" turned out not to exist — don't defer a fix as an architecture question without verifying the code actually can't do it.
4. Build the fix as a small script, print a diff of what changed, validate JSON, verify idempotency where possible, cross-check against independently-known-good data if available.
5. **Before treating any `audit-ledger.html` edit as done: extract the `<script>` block and run `node --check` against it, not just eyeball it.** The double-escaped-apostrophe bug (`\\'` instead of `\'`) has now hit at least 6 times across two different accounts. Never skip the check. Also: when editing a dashboard row's note via a partial-string replace, double-check the surrounding object structure afterward — a partial match can leave a duplicated/malformed `{ key: ... }` header (happened once this tranche, caught by the same syntax check).
6. Update the dashboard row's note + status, bump `SEED_VERSION`, **in the same commit as the content fix, not a follow-up.**
7. Commit with a full explanatory message (what was wrong, what source page proves it, what's still not fixed and why).
8. `git format-patch` from the **last commit Josh actually confirmed pushed** — check his most recent `git push` output for the real hash, don't assume local HEAD matches origin.
9. Verify the patch applies cleanly against a **fresh clone of the real `origin/main`** before handing it to Josh, and actually call `present_files` on it.
10. Update this HANDOFF section in the same commit as the fix. If a different account/session did the prior work, read their commit message carefully and reconcile it with this note.

The rest of this section (below) is the historical log of tranches completed — kept for detail and provenance, not something that needs re-doing.

- **Second Collect anthology — rotation implemented, 2026-07-08.** Josh's decision: rotate rather than build a manual pick UI, same convention as Mission Prayer/Compline Collect rotation. Added all missing collect texts (Morning: Sundays, Fridays, Saturdays, Renewal of Life, Guidance; Evening: Sundays, Fridays, Saturdays, Aid against Perils, Protection, Presence of Christ), verified against BCP p.55-57/98-99 (Morning) and p.68-70/122-124 (Evening). New "Rotate Second Collect Daily" toggle (checked by default); unchecked preserves the old single-path behavior. Correction to the original audit while sourcing this: Morning actually has 8 options, not 7 — "A Collect for Guidance" (BCP p.57/99) was missed by the 2026-07-07 audit, now included.

- **Evening Prayer's Collect for Peace — fixed 2026-07-08.** Josh asked specifically for items reused across more than one office as the next low-hanging fruit. `bcp-collect-peace` (used only by Evening Prayer's weekday-collect fallback, confirmed by grep — Morning never references it) held Morning Prayer's actual Collect for Peace verbatim, not Evening's own, textually distinct one. Replaced with Evening's real text, verified against BCP p.69 (Rite I) and p.123 (Rite II). Morning's real Collect for Peace, which existed nowhere else in the data, was preserved as a new component (`bcp-collect-peace-morning`) rather than lost — not currently wired into any office, since Morning only offers Grace today, but ready whenever the larger anthology decision below gets made. **Not fixed:** the anthology-vs-single-path decision itself (Morning has 7 BCP-authorized second-collect options, Evening has 8; the app silently shows only one each, every day) — that's Josh's call, same category as the Noonday/Compline toggle questions, not something to decide unilaterally.

**Non-DOL fixes (Evening Prayer, Compline, Noonday, Morning Prayer) — all pushed:**
1. Evening Prayer Phos Hilaron typo ("though" -> "through," rite1).
2. Compline's missing opening versicle ("Our help is in the Name of the Lord") added.
3. Compline's confession and absolution replaced with its own BCP p.126-127 text (was silently reusing Morning/Evening's).
4. Compline's Collect fixed: was showing the calendar day's Collect (never BCP-authorized there) — now uses Compline's own 5 collects (4 general + Saturday-specific) plus the 2 optional "may be added" night-prayers, all newly added. Also added the missing pre-Collect versicle ("Lord, hear our prayer").
5. Noonday's Collect: implemented Josh's settled decision (toggle between Noonday's own 4 collects and the Day's Collect, neither silently chosen). Same missing "Lord, hear our prayer" versicle added here too (renamed to a shared component since it's identical text at both offices).
6. Fabricated Invitatory Psalm Lent rule removed (no BCP basis) — replaced with a genuine Venite/Jubilate rotation. Fixed the related Evening Prayer structural defect: Phos Hilaron and the Invitatory Psalm are two of three BCP-authorized alternatives, not both-every-day — new toggle picks one.
7. Great Litany's missing ~75% restored (was cutting off after the first petition-response) — transcribed from BCP pp.148-153, verified character-for-character against the source PDF (whitespace-normalized diff), not just by eye.

Housekeeping: added `.gitignore` (previously existed only locally, uncommitted, and self-referentially excluded itself from git — fixed both problems) with a `*.patch` entry so applied patch files stop accumulating in the repo root.

**DOL fixes (season files) — in progress, one season at a time:**

- **Christmas — 9 of 12 entries fixed.** The Year One/Year Two swap found in the 2026-07-06 audit was confirmed real (cross-checked against BCP's actual Year One/Year Two tables, pp.940-941) and corrected: for each reading type, swapped the *value* between the year1-keyed and year2-keyed fields, leaving field names untouched. Confirmed in the process that the app's MP/EP-by-year field-naming convention was already correct all along (it implements BCP p.933's own suggested rule) — almost mis-flagged this as a bug before checking source. **Not fixed:** the 3 Holy Days (St. Stephen, St. John, Holy Innocents) — separate, larger defect (wrong lectionary track entirely), deferred to the Holy Days fix below.

- **Advent — 13 of 26 entries fixed** (this tranche). Nov 29's Year One Gospel verse-range restored; Dec 5's two incomplete psalm citations completed per the bracket policy; Dec 13-19 (all 7 days) had Year One readings replaced with correct content — confirmed the corruption pattern was a one-day-forward content shift compounding across the week (each wrong value matched the *following* day's true reading), not simply missing data; Dec 17 and Dec 19 psalm citations corrected to the bracketed full-Psalter option; Dec 20/22/23/24 (both years wrong, plus a confirmed cross-day duplication bug matching the same pattern found repeatedly in the Collects audit) fully replaced, both years, all fields. Every corrected value cross-checked against the BCP's own Year One (pp.936-938) and Year Two (pp.936-938) Daily Office Lectionary tables. **Not fixed, on purpose:** St. Andrew and St. Thomas (Holy Days — same deferred wrong-lectionary-track/4-reading-schema-gap defect as Christmas's 3 Holy Days), and Dec 20's `eve_*` fields (Eve of St. Thomas content, same reason).

- **Epiphany — 40 of 43 entries fixed.** By far the most complex season so far: not a simple year-swap, but four distinct bug patterns confirmed and corrected together. (1) The dated-day/Sunday transition bug — Jan 11 (Baptism of Our Lord) now uses Week-of-1-Epiphany-Sunday's citation instead of the dated "Jan. 11" one, per the BCP's own footnote that dated days apply only until the following Saturday evening. (2) The psalm-cycle "wrong week" pattern (Jan 8-10, Jan 12/13/16, Feb 1) plus two confirmed morning/evening psalm swaps (Feb 5, Feb 11), all corrected against source. (3) Named-Sunday Eucharistic-Proper-psalm substitution fixed at Epiphany Day, Baptism of Our Lord, and the Transfiguration/Last Epiphany (Feb 15). (4) The one-day-forward reading shift at the season's tail end — turned out to run Feb 14 through Feb 17, one day longer than the original audit's estimate, confirmed by each day's wrong content exactly matching the *following* day's true reading, with Feb 17 left holding orphaned content matching nothing (the end of the shift chain). Feb 10's wrong-lectionary content (a Luke citation in an otherwise all-Mark lane) also corrected. Verified idempotently: reapplying the fix script against the corrected file produces zero further changes. **Not fixed, on purpose:** the Confession of St. Peter, Conversion of St. Paul, and the Presentation — all 3 Holy Days, same deferred defect as everywhere else.

- **Lent — 41 of 44 non-Holy-Day entries fixed.** 37 entries (all 5 full weeks, Palm Sunday, Holy Week Mon-Wed) were a clean Year One/Year Two swap exactly like Christmas — fixed the same way, spot-checked several afterward against source. 4 entries (Ash Wednesday and the 3 days following it) turned out NOT to be a simple swap on closer inspection — **this corrects the 2026-07-07 audit note's own claim** that these 3 days "show identical, correct content for both years": in fact Year One's true content was missing entirely, with Year Two's content duplicated into both fields. Corrected with real Year One readings transcribed from source. Maundy Thursday was also a clean swap (no AM/PM structure on that particular day, unlike its neighbors, despite the 2026-07-07 audit grouping it with them) — fixed the same way. Good Friday and Holy Saturday: fixed the OT reading (the part that cleanly fits the existing year1/year2 schema); left the AM/PM-vs-year1/year2 field mismatch itself unfixed and flagged as a schema question — BCP appoints one morning and one evening reading, identical across both years, which the app's 3-slot-times-2-year schema can't represent without a "gospel" field holding an epistle. Same treatment as the Holy Days 4-reading gap: flagged, not forced. St. Joseph and the Annunciation (Holy Days) deferred as usual.

**Standing lesson from this tranche:** the double-escaped-apostrophe bug (see the Epiphany entry above) recurred a *third* time in this same session, in the Lent dashboard note — caught and fixed before committing both times, but worth being honest that the "new standing step" noted after Epiphany didn't stop it from happening again, only from shipping broken. Something about how these notes get written is producing this error reliably; catching it before every commit remains necessary, not just a one-time fix.

- **Easter — 48 of 48 non-Holy-Day entries fixed.** The most defect-dense season in the whole audit, several distinct bug types all fixed together: Easter Week (Mon-Sat) had Year Two as a straight duplicate of Year One (not a swap — an outright copy) with the wrong Gospel Tue-Fri; Week of 2 Easter had the classic full swap; Week of 4 Easter's Year Two had a one-day-forward shift; Ascension Day's Old Testament reading was duplicated (Year One showing Year Two's content); Pentecost's Year One reading was missing entirely, replaced by a duplicate of Year Two. Weeks 3, 5, 6, and 7 were largely already correct per the prior audit — confirmed by reapplying full source values and finding most days needed no change. **Easter Day itself is the one entry not fully resolved:** its true BCP structure is AM/PM, with no Epistle at all and no Year-split — the same category of schema mismatch as Good Friday/Holy Saturday in Lent. Fixed what maps onto the existing schema (the morning Old Testament/Gospel, one evening Gospel option), left the Epistle fields empty rather than inventing content, and flagged the unrepresentable pieces (the evening's alternate Old Testament reading and alternate Gospel) rather than forcing them into a wrong shape. The double-escaped-apostrophe bug appeared a fourth time in this tranche's note — caught before committing, same as every time before.

**Standing lesson from this tranche, worth carrying forward:** twice today a dashboard note was written with a double-escaped apostrophe (`\\'` instead of `\'`) inside a single-quoted JS string, which is a real syntax error — a literal backslash followed by an unescaped quote that terminates the string early and breaks the entire inline `<script>` block, taking down the whole dashboard page. This had been silently broken since the Noonday Collect tranche several commits back; it went uncaught because validation only ever checked JSON files and `office-ui.js`, never `audit-ledger.html`'s own script. **New standing step, every dashboard edit from here on:** extract the `<script>` block and run `node --check` against it directly before committing, not just eyeball it.

- **Ordinary Time (Propers 3-29, all 3 files) — 150 of 150 weekday entries fixed** (ordinary1: 55, ordinary2: 46, ordinary3: 49). The most severe DOL finding, and not a simple swap. In the front half (Propers 3-12) the `year2` fields held the true Year One content while the `year1` fields held unrelated scattered citations and the true Year Two content was absent everywhere; in the back half (Proper 13 Friday onward) the `year2` fields were *themselves* corrupt — running roughly a day behind and pulling in citations from unrelated books (e.g. 2 Corinthians surfacing in Proper 19). Because neither year's content survived intact across the whole range, **both years were rebuilt entirely from source** rather than swapped. Method: the complete BCP Daily Office Lectionary Propers table (all 29 Propers, both years, Sunday-Saturday) was re-extracted from `book_of_common_prayer.pdf` (pp.966-994, Year One on odd pages, Year Two on even, two Propers per page) with a column-aware parser (scripts committed alongside: `extract_bcp_propers.py`, `normalize_and_crosscheck.py`, `apply_ordinary_dol_fix.py`, plus the extracted table `bcp_propers_raw.json`). Six OCR/column artifacts were caught by structural + character scans and each read directly off a 300-400 DPI page image before correcting: P5 Y1 Fri Epistle (`2 Cor. 12:11-21`, tilde artifact), P8 Y2 Wed OT (`Numbers 22:41-23:12`, spurious `&` from the em-dash glyph), P21 Y1 Tue OT (`2 Chronicles 29:1-3; 30:1, 10-27`, the lone wrapped-continuation line in the whole section), P9 Y2 Mon Gospel (`Matthew 23:1-12`, OCR `Mark.`→`Matt.`), P13 Y1 Tue Gospel (`Mark 8:22-33`, spurious period), and P23 Y1 Thu (a column mis-split that pulled the `1` of `1 Corinthians` into the OT cell — resolved to `Jeremiah 38:1-13` / `1 Corinthians 14:26-33a, 37-40`). Citations normalized to the app's house style (book abbreviations expanded, em-dash chapter-spans collapsed to a hyphen, optional parenthetical verses dropped, Esther's `*` footnote marker dropped). **Independent validation:** the normalized Year One table was cross-checked against the existing `year2` fields (which the 2026-07-06 audit had identified as holding true Year One content) — the front half (Propers 3-12) matched with **zero** mismatches, confirming the extraction and normalization reproduce known-good data character-for-character; every back-half mismatch was traced to the documented corruption and verified against the raw PDF, so the rebuilt table (not the existing data) is the authority. Applied by byte-preserving in-place value replacement: the diff is exactly 895 insertions / 895 deletions, every changed line one of the six reading fields, no formatting/psalm/collect/title/Sunday/feast lines touched; reapplying the script produces zero further changes; all three files remain valid JSON; end-to-end spot-checks across the range and both years all match the BCP PDF. Psalms, antiphons, and collects were confirmed correct in the audit and left untouched. **Not in scope this tranche (flagged for follow-up):** the 40 Sunday / named-feast / apostle-day entries in these files, "The Day of Pentecost" (possible duplicate of the easter.json entry; Holy-Day lectionary treatment), and "Tuesday before Ash Wednesday (Shrove Tuesday)" (open scope question). **One convention to revisit:** dropping optional parenthetical verses in readings matches every other season in the app but diverges from the settled *psalm* bracket policy (which includes bracketed verses) — matched app-wide for consistency, but worth a deliberate global decision. Esther's "Judith may be read in place of Esther" alternative is not stored (the schema holds one citation per field).

**All DOL season files are now fixed** (Advent, Christmas, Epiphany, Lent, Easter, Ordinary 1/2/3). What remains on the DOL side is **not** any season's weekday/Sunday cycle but: (1) the Holy Days lectionary-table fix — 24 of 25 Holy Days pulling the wrong lectionary track, plus the 3-slot-vs-4-reading schema gap affecting every Holy Day across every season — deliberately deferred as its own batched fix rather than patched piecemeal, per Josh's ruling when the gap was first found; (2) the Sunday/feast/Pentecost/Shrove-Tuesday entries inside the Ordinary Time files, never part of the "150 weekday" audit; and (3) the decided-but-unimplemented items (Noonday/Compline Short-Lesson toggles, the Morning/Evening second-collect anthologies incl. Evening's wrong Peace text, the `precedence` field, the Good Friday/Holy Saturday/Easter Day AM/PM schema question).

**Git state:** confirmed landed and pushed as `35d9734`. See the HANDOFF section at the top of this fix-phase log for the current authoritative state and next steps — this line is kept as historical record of the tranche sequence, not a live pointer.



- **Noonday/Compline Short Lesson toggles — implemented 2026-07-08.** Josh's settled decision from 2026-07-07 (offer both as a toggle) had been recorded but never coded. Added "Use the Day's Lectionary Reading at Noonday" and "...at Compline" toggles, both unchecked by default -- default now rotates among the BCP's own suggested Short Lesson texts (Noonday: Romans 5:5 / 2 Corinthians 5:17-18 / Malachi 1:11; Compline: Jeremiah 14:9,22 / Matthew 11:28-30 / Hebrews 13:20-21 / 1 Peter 5:8-9a) by calendar date, same rotation convention used elsewhere. No new components needed -- these are plain scripture references, resolved through the existing getScriptureText() resolver already used for every other reading in the app. Caught and fixed a labeling issue before it shipped: several of the BCP's own suggested texts are New Testament, so the reading is labeled "A Reading" rather than "The Old Testament Lesson" when showing them.
