
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

- **Ordinary Time Sunday entries — 24 of 24 fixed, 2026-07-08.** The last remaining content gap in the Ordinary Time files (Sunday/Proper entries, never part of the 150-weekday rebuild). Extracted the BCP's Propers Sunday rows (pp.964, 969-994, both years) with correct Year1/Year2 tagging verified via page footers, then rebuilt all 24 entries: Trinity Sunday (Year One was blank entirely, now restored) plus Propers 5-23, 25, 27-29. Same scrambled-content pattern as the weekdays had, now corrected. Verified idempotently (reapplying the fix script produces zero further changes).

  Two open scope questions investigated and resolved without needing a content fix: (1) "The Day of Pentecost" duplicate entry in ordinary1.json is confirmed DEAD DATA — traced js/calendar-engine.js's date-range file selector, that date always resolves to easter.json, this copy is never read by any live code path. (2) "Shrove Tuesday" (Feb 17, ordinary1.json) is confirmed LIVE, not dead as previously unclear — it falls in the real "brief Ordinary Time between Epiphany and Ash Wednesday" date range. Its content has NOT been separately verified (would need the correct Proper-cycle mapping worked out for this edge-case stretch) — flagged as a real remaining item, not guessed at.

  Dashboard: Ordinary 2 and Ordinary 3 flip to fully green (nothing else outstanding in those files). Ordinary 1 stays red for the one remaining Shrove Tuesday content-verification item.

- **Both remaining schema questions resolved, 2026-07-08 — Josh's call: add real fields/toggles for both.**

  **Lent/Easter's AM/PM structure (Good Friday, Holy Saturday, Easter Day):** investigated before fixing, and found the defect was worse than the earlier "flagged, not forced" framing suggested. The old 3-slot-times-2-year schema had no true AM/PM concept, so for these three days, in any given liturgical year, ONE of the two offices (whichever didn't match the field-name/year alignment) silently showed a BLANK reading -- a real, live bug, not just a missing feature. Fixed by adding plain, non-year "_mp"/"_ep" fields for the content that's genuinely AM/PM rather than Year1/Year2 (reading_epistle_mp, reading_gospel_mp, reading_gospel_ep for Good Friday; reading_epistle_mp, reading_epistle_ep for Holy Saturday, which has no Gospel at all; reading_gospel_mp, reading_ot_ep, reading_gospel_ep for Easter Day), with a new fallback tier in js/office-ui.js's reading-chain computation so these are picked up correctly regardless of which liturgical year is active, while the genuinely year-dependent OT reading on Good Friday/Holy Saturday keeps its existing year1/year2 fields untouched. Two BCP "or" alternates (Good Friday's Year-One-only evening OT option, Genesis 22:1-14; Easter Day's alternate evening Gospel, John 20:19-23) are stored but not wired to a toggle -- documented, not forced, matching how other single "or" alternates have been handled elsewhere in this project. Lent and Easter both flip to fully green -- nothing else open in either season.

  **Invitatory Psalm's Easter-extension toggle:** Pascha Nostrum was previously shown every day of the 49-day Easter season, but BCP only requires it for Easter Week (day_of_season 1-7); the rest of the season permits it but also permits the normal Venite/Jubilate rotation. New default: falls back to the normal rotation after Easter Week, matching how every other season behaves. New "Pascha Nostrum All Easter Season" toggle (unchecked by default) lets someone keep it every day through Pentecost if they prefer.

  This closes out every open item from the DOL/schema side of the audit that didn't require new content -- what's left project-wide is Shrove Tuesday's unverified content and the canticle precedence field.

- **Both remaining project items resolved, 2026-07-08 — plus a real self-correction along the way.**

  **Investigating Shrove Tuesday led to finding I'd been WRONG in the previous tranche.** I had told Josh "Shrove Tuesday is confirmed LIVE" based on reading calendar-engine.js's code. That was incorrect. Actually simulating the date arithmetic for 2026 (Ash Wednesday = Feb 18) shows Epiphany's own date range already extends through Feb 17 directly, and the "brief Ordinary Time" branch's guard condition can never be true given how `epiphanyEnd` is defined one line earlier -- that branch is dead code, never executes. So "Tuesday before Ash Wednesday (Shrove Tuesday)" in `ordinary1.json` is ALSO dead data, exactly like the Pentecost duplicate -- the live entry for this date is "Tuesday in the Week of Last Epiphany" in `epiphany.json`, already fixed. Corrected the record rather than letting the earlier wrong claim stand. **Lesson applied going forward: simulate date arithmetic directly (Node one-liner) rather than reasoning from reading the code alone, when a conclusion depends on exact date math.**

  **While re-checking that area, found a real, separate gap:** the original Epiphany fix (several tranches back) corrected readings for Feb 16-17 but never touched their psalms -- Feb16 showed "106:1-18/106:19-48" (Monday-in-2-Easter's psalms, wrongly duplicated here) and Feb17 showed "121,122,123/124,125,126" (matching nothing at all). Fixed both against source ("25/9,15" and "26,28/36,39"). Epiphany stays green, but the dashboard note now says so honestly.

  **The canticle precedence field (Josh's decision: implement it) is done.** BCP's "Feasts of our Lord and other Major Feasts" override row turned out to be simple once looked up directly: on these days, canticles are always Benedictus Dominus/Te Deum (Morning) or Magnificat/Nunc Dimittis (Evening), regardless of season or weekday -- literally the same fixed pair every time, no branching needed. Rather than building the full 5-tier `precedence` enum across all 366 calendar-day entries (as the original governance note recommended as a "best practice, worth designing once, broadly"), scoped it down: added a lightweight `precedence: "major-feast"` field to exactly the 33 entries that need it for this fix -- the 7 Principal Feasts and the Holy Days already fixed in the batched Holy Days pass. `office-ui.js`'s VARIABLE_CANTICLE1/2 handlers check this field first, before the day-of-week/season branching, and use the fixed Major-Feast pair when it's set. The finer "Feast of our Lord" vs. "Other Major Feast" sub-split the original note suggested (for other future rank-sensitive logic like Sunday-transfer rules) was NOT built -- deliberately narrower scope than the full recommendation, since both sub-categories get identical canticle treatment and nothing else currently needs the distinction. Worth knowing if a future task needs that finer split.

  This closes every item on record from this session's audit-then-fix work.

- **Nunc Dimittis antiphon, Closing Blessing rotation, Opening Sentences (partial) — 2026-07-08.** Fixed 3 of the 4 items Josh asked for in the time available: Compline's missing Nunc Dimittis antiphon (BCP p.133-134) added and wired both sides of the canticle; Morning/Evening's Closing Blessing now rotates among all 3 BCP-authorized options (was showing only the first, always) via a new toggle; Christmas and Epiphany opening sentences added (zero code changes needed — the lookup already keys by season string, these two just didn't exist yet). **Not done, deliberately scoped out given time:** Holy Week/Trinity Sunday/All Saints opening sentences (each needs a title-specific override, same category as the precedence field, not yet built), and the Invitatory Antiphon fix (a 190-entry content-removal decision across Ordinary Time, too large and judgment-laden to attempt under time pressure — needs its own dedicated pass).

- **The two remaining items finished, 2026-07-08 — after being called out for treating a reset budget as still tight.** Neither actually needed a decision, on reflection: (1) the Invitatory Antiphon's "content-removal decision" framing was overstated — the content being removed was simply wrong (91% showed Lent's antiphon during Ordinary Time; the rest was invented), not a judgment call between valid options. Removed the fabricated antiphon_mp/antiphon_ep fields from all 189 affected entries across the 3 Ordinary Time files; the renderer already skips cleanly when the field is empty, so this needed no code change. (2) The remaining Opening Sentences gap (Holy Week, Trinity Sunday, All Saints) just needed more implementation, not a decision — added a title-based override field (opening_sentence_override), same pattern as the canticle precedence field, plus the 3 new BCP texts. Caught and corrected two more of my own initial Rite II guesses (Trinity Sunday, All Saints) against source before committing — both were subtly wrong on the first pass, same lesson as Christmas's Rite II text earlier. This closes every item raised this session.

- **Suffrages B + a dashboard-sync catch, 2026-07-08.** Found while scanning for remaining red items: the "Appointed Psalms," "Psalms" (Evening), and "Lessons with Canticles" (Evening) dashboard rows were all stale, still saying "nothing fixed yet" after the DOL psalm/reading fixes had actually landed across this whole session's tranches — corrected. Also implemented Suffrages B (BCP p.54/96), a second complete authorized form that didn't exist at all before — added and wired to rotate daily with Suffrages A, same convention as Venite/Jubilate. Caught myself reintroducing the corrected Shrove Tuesday finding as "confirmed live" again while writing the Appointed Psalms note (pure copy-paste error, not a new investigation) — fixed before committing.

- **Noonday's closing sentence + 2 small cleanups, 2026-07-08.** Checked Noonday's own source (BCP p.107) directly rather than assuming it matched Morning/Evening's structure — it doesn't. Noonday has no closing-blessing anthology at all; the service just ends "Let us bless the Lord / Thanks be to God," nothing more. It had been silently reusing the shared bcp-closing component built for Morning/Evening, which wrongly appended an extra blessing sentence that doesn't belong at Noonday. Added bcp-closing-noonday (versicle only) and rewired just Noonday's sequence. Also: removed the confirmed-dead bcp-opening-evening orphaned component (zero references anywhere), and added the Easter-season "Alleluia, alleluia, alleluia" addition to the Nunc Dimittis antiphon (BCP p.134), which had been flagged as skipped in the prior tranche.

**Process note for whoever picks this up:** mid-session, a `git reset --hard origin/main` at the start of a new turn silently discarded a fully-committed, verified fix (Suffrages B) that hadn't been pushed yet, because the reset command runs before checking whether local work is unpushed. Recovered it from `git reflog` and rebuilt the commit sequence in the correct order before it was lost for good. Going forward: before any `git reset --hard origin/main`, check `git log --oneline -5` first for local commits not yet confirmed pushed by Josh, and don't discard them.

- **Evening Opening Sentences dashboard row was stale, 2026-07-08 (Josh caught it by inspection).** Said red and "still open"/"still not removed" for two things already fixed in the prior tranche. Corrected to green.

## STATUS: Anglican/BCP Daily Office — DONE, with two known, documented, non-error gaps

Josh confirmed this session's Anglican/BCP Daily Office audit-then-fix work as complete. Every dashboard row for this tradition is green except the 5 unrelated Ethiopian/Byzantine rows (Sa'atat, Senkessar-Ginbot, Menaion, Triodion, Pentecostarion — separate traditions, never in scope this session, still their own large unfinished projects).

**Two acknowledged "not fullest implementation" spots, not errors, no fix pending unless asked:**
1. Opening Sentences: within a covered BCP category, the app hardcodes one verse where BCP offers 2-3 alternatives — no rotation built for this, unlike Second Collect/Suffrages/Venite-Jubilate.
2. Two stored-but-unwired BCP "or" alternates: Good Friday's Year-One-only evening OT option (Genesis 22:1-14, `reading_ot_ep_alt_year1`) and Easter Day's alternate evening Gospel (John 20:19-23, `reading_gospel_ep_alt`).

**One acknowledged rigor gap, not an implementation gap:** the Invitatory Antiphon's fabricated content was removed, but the seasons where BCP genuinely provides one (Advent, Christmas, Epiphany, Lent, Easter-to-Pentecost) were only checked for plausible category, never verified word-for-word the way everything else this session was.

**If picking this up fresh:** the Anglican/BCP Daily Office needs no further work unless Josh specifically asks for one of the three items above, or for the Byzantine/Ethiopian traditions (a different, much larger project — read their own dashboard rows and any existing research-queue.json before starting).

## Session, 2026-07-09 — Ordinary Time DOL: bracketed-verse convention decided, 13 citations fixed; one new gap found

**Convention decided by Josh:** the settled psalm-bracket policy ("bracketed alternatives are not optional — always use the fuller reading") now applies to scripture readings too, not just psalms. This reverses the "drop optional parenthetical verses" normalization applied during the 2026-07-08 Ordinary Time DOL rebuild (`35d9734`).

**Fixed, verified directly against `book_of_common_prayer.pdf` pp.966-994 (page images, not just OCR text):** 13 weekday reading citations across `ordinary1/2/3.json` where the BCP source had a bracketed verse extension that had been dropped rather than merged in. All are simple range-merges (bracket immediately extends or prefixes the stored range); house style (full book name, plain hyphen for spans, `Book C:V-C:V` for cross-chapter, `; ` for split ranges) confirmed against existing unrelated entries before applying, not assumed.

| Entry | Field | Was | Now |
|---|---|---|---|
| Fri, Proper 3, Y1 | Gospel | Luke 16:10-17 | Luke 16:10-18 |
| Fri, Proper 3, Y2 | Epistle | 1 Timothy 5:17-22 | 1 Timothy 5:17-25 |
| Tue, Proper 4, Y1 | Epistle | 2 Corinthians 6:3-13 | 2 Corinthians 6:3-7:1 |
| Wed, Proper 6, Y2 | OT | Numbers 11:24-33 | Numbers 11:24-35 |
| Tue, Proper 18, Y1 | Gospel | Mark 16:1-8 | Mark 16:1-20 |
| Mon, Proper 23, Y1 | Epistle | 1 Corinthians 13:4-13 | 1 Corinthians 13:1-13 |
| Tue, Proper 24, Y1 | OT | Lamentations 1:1-5, 10-12 | Lamentations 1:1-12 |
| Sat, Proper 25, Y1 | Epistle | Revelation 7:9-17 | Revelation 7:4-17 |
| Thu, Proper 26, Y1 | OT | Ezra 7:11-26 | Ezra 7:1-26 |
| Mon, Proper 27, Y1 | OT | Nehemiah 9:1-15 | Nehemiah 9:1-25 |
| Tue, Proper 27, Y2 | OT | Joel 1:15-2:2 | Joel 1:15-2:11 |
| Sat, Proper 27, Y2 | Gospel | Luke 16:10-17 | Luke 16:10-18 |
| Tue, Proper 28, Y2 | OT | Habakkuk 3:1-10, 16-18 | Habakkuk 3:1-18 |

Diff is exactly 13 insertions/13 deletions across the three files — only these fields touched, nothing else. Psalms were not affected (already correct/untouched by the original rebuild).

**New gap found while checking this — not fixed, needs its own pass:** while locating one of the 13 candidates (the Esther/Luke citation), discovered **Monday in the Week of Proper 20 (2026-09-21) does not exist anywhere in `ordinary2.json`.** The calendar jumps straight from "Twentieth Sunday after Pentecost" (day_of_season 121) to "Tuesday in the Week of Proper 20" (day_of_season 123) — day 122 is simply absent, not a citation error but a missing calendar-day entry. Confirmed via BCP source (pp.984-985) what belongs there:
- **Year One:** OT 2 Kings 5:1-19, Epistle 1 Corinthians 4:8-21, Gospel Matthew 5:21-26.
- **Year Two:** OT Esther 4:4-17 (with the "Judith may be read in place of Esther" footnote — same unresolved single-citation-per-field issue as the rest of the Esther track), Epistle Acts 18:1-11, Gospel Luke 1:1-4; 3:1-14 (bracket already merged per the new convention).
- **Psalms (shared both years):** MP Psalm 80; EP Psalm 77, Psalm 79 (BCP brackets Psalm 79 as optional — per the existing psalm policy, include it).

**Correction, 2026-07-09 (later same day) — the "missing entry" above was wrong.** Checked properly this time by listing every entry in `ordinary2.json` around Sept 20-22 rather than trusting a title-string search: 2026-09-21 is not missing. It's present as "Saint Matthew, Apostle and Evangelist" — a fixed Holy Day that correctly overrides the regular "Monday in the Week of Proper 20" DOL slot for this date, same pattern as the already-confirmed Dec-24/Christmas-Eve and Presentation-Day overrides. Checked its content directly against the BCP's Holy Days table (p.998): Psalm 119:41-64 / 19,112, Isaiah 8:11-20, Romans 10:1-15, Job 28:12-28, Matthew 13:44-52 — all four readings present and correct, no brackets involved, nothing to fix. **There is no gap here and no insertion needed.** The earlier "missing calendar day" claim was a real research error (concluded from an incomplete title search, not from checking what was actually there) — corrected rather than left standing.

**Also flagged, not yet acted on:** Josh's decision applies the fuller-reading convention project-wide, so the five seasons already marked "done" (Advent, Christmas, Epiphany, Lent, Easter) likely have the same dropped-bracket pattern in their reading citations and haven't been checked against this convention yet — only Ordinary Time has been swept for it so far.

## Session, 2026-07-09 continued — swept Advent/Christmas/Epiphany/Lent/Easter for the same pattern; 10 more fixed, one Sunday caught in Ordinary Time too

Per the note above, checked all five remaining seasons directly against `book_of_common_prayer.pdf` pp.936-965 (the Advent-through-Pentecost DOL table) for the same dropped-bracket pattern, using the same page-parity method (even page = Year One, odd = Year Two, confirmed by footer text on every page checked, consistent with the Propers table).

**Result: most of these seasons were already correct.** The majority of candidate citations found in the source table turned out to already be fully merged in the app — this rebuild/fix predates the Ordinary Time one and appears to have handled the bracket convention correctly the first time in most cases. Real drops were rare:

**Fixed (9 citations):**
| Season | Entry | Field | Was | Now |
|---|---|---|---|---|
| Lent | Monday, 2 Lent, Y2 | Epistle | 1 Corinthians 4:8-20 | 1 Corinthians 4:8-21 |
| Lent | Monday, 5 Lent, Y2 | OT | Exodus 4:10-20, 27-31 | Exodus 4:10-31 |
| Easter | Tuesday in Easter Week, Y1 | Epistle | Acts 2:36-41 | Acts 2:36-47 |
| Easter | Wednesday in Easter Week, Y2 | Epistle | 1 Corinthians 15:30-41 | 1 Corinthians 15:29-41 |
| Easter | Saturday in Easter Week, Y1 | Epistle | Acts 4:13-21 | Acts 4:13-31 |
| Easter | Monday, 2 Easter, Y1 | Gospel | John 14:8-17 | John 14:1-17 |
| Easter | Tuesday, 4 Easter, Y2 | Epistle | Colossians 3:18-4:6 | Colossians 3:18-4:18 |
| Easter | Saturday, 4 Easter, Y1 | Gospel | Luke 7:18-28, 31-35 | Luke 7:18-35 |
| Ordinary (Trinity Sunday) | Trinity Sunday, Y1 | OT | Ecclesiasticus 43:1-12 | Ecclesiasticus 43:1-12, 27-33 |

That last one is a Sunday/Major-Feast entry, technically inside the "40 Sunday/feast/apostle-day entries not yet audited" gap from the original Ordinary Time tranche — caught incidentally while sweeping the source table's Trinity Sunday row, not from a systematic Sunday-entries pass. Its bracket was non-contiguous (`43:1-12(27-33)` skips 13-26 entirely), so it's recorded comma-joined rather than collapsed into a single range, matching the app's existing house style for genuinely discontinuous verses (e.g. `Ezek. 7:10-15, 23b-27`).

**Checked and confirmed already correct, no change needed:** Advent (2 candidates, both already merged or superseded by a same-date "Dec. 24" override — see note below), Christmas (0 candidates found), Epiphany (8 candidates checked; the ones not found in the app turned out to be for Epiphany weeks 6-8, which don't occur in the 2026 calendar since Easter is early that year — not a gap), 1 John 5:13-21 (already merged), Matthew 1:1-17; 3:1-6 (already merged), Colossians 3:18-4:18 for Monday-5-Easter (already merged), Wisdom 10:1-21 for Tuesday-5-Easter (already merged).

**Worth knowing for future sessions:** Advent's DOL table has both weekday-of-week rows (e.g. "Thursday, Week of 4 Advent") *and* separate fixed-date rows for Dec. 17-24, and whichever a given civil year's Dec. 24 falls on, the dated row overrides the weekday row for that date — the app is already doing this correctly (confirmed 2026-12-24 uses the "Dec. 24" row's content, not "Thursday, Week of 4 Advent"'s). Don't mistake this for a defect if it comes up again; it's the same category as the already-known "dated day overrides weekday-in-week" behavior documented for Epiphany's Baptism-of-Our-Lord transition.

Diff for this sweep: 9 insertions/9 deletions across `easter.json`, `lent.json`, `ordinary1.json`, plus documentation updates here and in the governance ledger. Combined with the first Ordinary Time pass, 22 total citations fixed today.

**Not done:** a full systematic sweep of the ~40 Sunday/named-feast/apostle-day entries (across Ordinary Time and the other five seasons) for the same bracket pattern — only Trinity Sunday was checked, incidentally. That remains open scope, same as it was flagged in the original 2026-07-08 tranche.

## Session, 2026-07-09 continued — Sunday/named-feast/Holy Day sweep completed (item 2)

Systematically checked every Sunday and Holy Day across all six DOL season files against the BCP source for the same bracket pattern.

**Ordinary Time Sundays (Propers 3-29):** checked all 27 Sunday reading lines against `book_of_common_prayer.pdf` pp.966-994. Found 3 with a variant of the same problem — not dropped, but left as fragmented comma-separated pieces instead of collapsed into a continuous range once the bracket was included, breaking house style:

| Entry | Field | Was | Now |
|---|---|---|---|
| Eighth Sunday after Pentecost (Proper 8), Y2 | Epistle | Acts 17:12-21, 22-34 | Acts 17:12-34 |
| Seventeenth Sunday after Pentecost (Proper 17), Y1 | OT | 1 Kings 8:22-30, 31-40 | 1 Kings 8:22-40 |
| Twenty-seventh Sunday after Pentecost (Proper 28), Y2 | OT | Habakkuk 1:1-4, 5-11, 12-2:1 | Habakkuk 1:1-2:1 |

**Advent/Christmas/Epiphany/Lent/Easter Sundays:** already covered by the earlier 2026-07-09 five-season sweep (that pass's day-matching included Sunday rows; zero bracket candidates turned up there).

**The Holy Days table (pp.996-1000, the canonical table all ~25 fixed-date Holy Days across every season file draw from):** extracted and checked in full — a single bracket in the entire table, and it's on a psalm citation (Annunciation's EP psalm, `110:1-5(6-7)`), not a reading. Already correctly stored as `Psalm 110:1-7, 132` — psalms already follow the established bracket policy, so this needed no fix. **Zero reading-citation bracket defects anywhere in the Holy Days table.**

**Item 2 is now complete.** Combined with the Trinity Sunday catch from earlier today, that's 4 Sunday-level fixes plus a clean Holy Days table — full coverage of the bracket-extension convention across every Sunday and Holy Day entry in the DOL, not just weekdays.

**Note — this does NOT touch the separate, larger, already-flagged Holy Days project:** the Holy Days table being clean of *bracket* defects says nothing about the "wrong lectionary track" / 3-vs-4-reading schema defects documented earlier in this note and the governance ledger (only St. Andrew was found genuinely correct across all readings in that audit). That remains its own priority, untouched by today's work.

**Running total for 2026-07-09: 26 citations extended/cleaned to their fuller BCP form** (13 Ordinary Time weekdays + 9 from the five-season sweep + 1 Trinity Sunday catch + 3 Ordinary Time Sundays), plus one corrected research error (the false "missing Monday, Proper 20" claim) and one confirmed-clean table (Holy Days).

## Session, 2026-07-09 continued — Holy Days lectionary-track audit: the old "only St. Andrew correct" claim is badly stale

Josh asked to tackle the Holy Days DOL fix, flagged in prior sessions as the next major priority based on a much older finding ("of 25 Holy Days checked, only St. Andrew is genuinely correct — every other one pulls Eucharistic Proper readings instead of the DOL"). Re-audited from scratch against the actual BCP Holy Days table (pp.995-1000, the single shared table every fixed-date Holy Day across all six season files draws from) rather than trusting that old claim.

**The old claim was badly out of date. 24 of 27 locatable Holy Days are already fully correct** — all four DOL readings (MP Psalm/OT/Epistle, EP Psalm/OT/Gospel) verified word-for-word against source. This appears to be the result of "the batched Holy Days pass" mentioned in earlier entries in this note, which was never followed up with a corrected top-line claim. **Correcting the record here:** the Holy Days table is in much better shape than prior sessions believed. Green (no changes needed): St. Andrew (content, not schema — see below), St. Thomas, St. Stephen, St. John, Holy Innocents, Confession of St. Peter, Conversion of St. Paul, The Presentation, St. Joseph, Annunciation, St. Mark, SS. Philip & James, Nativity of St. John the Baptist, SS. Peter & Paul, St. Mary Magdalene, St. James, The Transfiguration, St. Bartholomew, Holy Cross Day, St. Matthew, St. Luke, St. James of Jerusalem, SS. Simon & Jude, All Saints.

**Fixed, 2026-07-09:**

1. **St. Andrew was missing its Evening Prayer OT reading field entirely** (`reading_ot_ep_year1`/`year2`) — the one entry the *old* audit called "genuinely correct" turned out to be the one still missing the 4-reading schema fix applied to everyone else. Added `Isaiah 55:1-5` to both year fields, verified against BCP p.995.

2. **The Visitation (May 31) had been completely absorbed into "Trinity Sunday / The Visitation" and lost its own content.** Trinity Sunday is a Principal Feast (BCP p.15, Table of Precedence tier 1); the Visitation is a Holy Day ("Other Feast of our Lord," tier 3). Per the BCP's own transfer rule (p.15): *"All other Feasts of our Lord... when they occur on a Sunday, are normally transferred to the first convenient open day within the week."* 2026-05-31 is a Sunday (Trinity Sunday); the combined entry showed only Trinity Sunday's readings, and the Visitation's own DOL content didn't exist anywhere in the app. Fixed by BCP rule, not guesswork:
   - Renamed the May 31 entry back to plain "Trinity Sunday" (its stored content was already correct Trinity Sunday material — verified again against p.995's "Job 38:1-11; 42:1-5" / "Ecclesiasticus 43:1-12, 27-33" Year One/Two OT split).
   - Built a new entry on 2026-06-01 (the next open day — was just "Monday in the Week of Proper 4," now superseded, same pattern as every other Holy-Day-displaces-weekday case already in the app) titled "The Visitation of the Blessed Virgin Mary," with its correct BCP content: Psalm 72 (MP) / 146, 147 (EP); 1 Samuel 1:1-20; Hebrews 3:1-6; Zechariah 2:10-13; John 3:25-30.
   - **The Visitation's Collect didn't exist in `components/anglican.json` at all** — added `bcp-collect-visitation` (BCP p.240/appx, both rites) since the entry needed it to render properly, not just the DOL readings.

**Implemented, 2026-07-09 (later same day) — Josh's decision: offer both as a toggle, same pattern as Noonday/Compline.** Built a general data-driven mechanism rather than hardcoding these two days: any calendar entry can now carry an `alt_ep_toggle_id` field; if set, `office-ui.js`'s Evening Prayer psalm/OT/Gospel resolution checks `toggle-{id}-alt` and prefers `psalms_ep_alt` / `reading_ot_ep_alt_year1/2` / `reading_gospel_ep_alt_year1/2` when checked, falling back to the primary fields exactly as before when unchecked (default). Wired up for both flagged days:
- **Saint Mary the Virgin** (`alt_ep_toggle_id: "mary-virgin"`, checkbox `toggle-mary-virgin-alt`): alternates are Psalm 138,149; Zechariah 2:10-13; John 19:23-27.
- **Saint Michael and All Angels** (`alt_ep_toggle_id: "michaelmas"`, checkbox `toggle-michaelmas-alt`): alternates are Psalm 104; 2 Kings 6:8-17; Revelation 5:1-14.

Both checkboxes added to the settings panel in `index.html` with `info-btn` tooltips explaining the BCP source and default. **Not wired into `saveSettings`/`loadSettings`** — checked first, and most of the other 2026-07-08 decision toggles (Noonday/Compline lesson toggles, rotate-suffrages, rotate-closing-blessing, rotate-invitatory-psalm, pascha-nostrum-all-season, etc.) aren't persisted either; adding it just for these two would be inconsistent with that existing majority pattern rather than fixing a real gap. If Josh wants toggle persistence generally, that's its own project-wide task, not specific to these two.

The general mechanism (`alt_ep_toggle_id` + `_alt` fields) is reusable — worth remembering next time an "or" alternative like this needs a toggle, rather than one-off code per day.

**Confirmed missing entirely — genuine Holy Days, not optional civic days (correcting my own assumption mid-session):** checked the BCP's actual Table of Precedence (p.16) rather than assuming — Independence Day and Thanksgiving Day are listed under "Other Major Feasts," the same precedence tier as St. Stephen and the Holy Innocents, *not* under "Days of Optional Observance" (tier 5). So along with St. Matthias and St. Barnabas (both "All feasts of Apostles," same tier), all four of these are real gaps, not deliberate omissions:

| Holy Day | Date | MP: Psalm / OT / Epistle | EP: Psalm / OT / Gospel |
|---|---|---|---|
| St. Matthias | Feb 24 | 80 / 1 Samuel 16:1-13 / 1 John 2:18-25 | 33 / 1 Samuel 12:1-5 / Acts 20:17-35 |
| St. Barnabas | June 11 | 15, 67 / Ecclesiasticus 31:3-11 / Acts 4:32-37 | 19, 146 / Job 29:1-16 / Acts 9:26-31 |
| Independence Day | July 4 | 33 / Ecclesiasticus 10:1-8, 12-18 / James 5:7-10 | 107:1-32 / Micah 4:1-5 / Revelation 21:1-7 |
| Thanksgiving Day | 4th Thursday of Nov. | 147 / Deuteronomy 26:1-11 / John 6:26-35 | 145 / Joel 2:21-27 / 1 Thessalonians 5:12-24 |

Collects (both rites) sourced and ready, not yet added as components:
- **St. Matthias** — Rite I: "O Almighty God, who into the place of Judas didst choose thy faithful servant Matthias to be of the number of the Twelve: Grant that thy Church, being delivered from false apostles, may always be ordered and guided by faithful and true pastors; through Jesus Christ our Lord, who liveth and reigneth with thee, in the unity of the Holy Spirit, one God, now and for ever. Amen." Rite II: same, modernized ("Almighty God, who in the place of Judas chose your faithful servant Matthias...").
- **St. Barnabas** — Rite I: "Grant, O God, that we may follow the example of thy faithful servant Barnabas, who, seeking not his own renown but the well-being of thy Church, gave generously of his life and substance for the relief of the poor and the spread of the Gospel; through Jesus Christ our Lord, who liveth and reigneth with thee and the Holy Spirit, one God, for ever and ever. Amen." Rite II: modernized equivalent.
- **Independence Day** — Rite I: "Lord God Almighty, in whose Name the founders of this country won liberty for themselves and for us, and lit the torch of freedom for nations then unborn: Grant, we beseech thee, that we and all the people of this land may have grace to maintain these liberties in righteousness and peace; through Jesus Christ our Lord, who liveth and reigneth with thee and the Holy Spirit, one God, for ever and ever. Amen." (BCP notes "The Collect 'For the Nation,' page 207/258, may be used instead" — an authorized alternate, same pattern as the other flagged decisions.) Rite II modernized equivalent also in source.
- **Thanksgiving Day** — Rite I: "Almighty and gracious Father, we give thee thanks for the fruits of the earth in their season and for the labors of those who harvest them. Make us, we beseech thee, faithful stewards of thy great bounty, for the provision of our necessities and the relief of all who are in need, to the glory of thy Name; through Jesus Christ our Lord, who liveth and reigneth with thee and the Holy Spirit, one God, now and for ever. Amen." Rite II modernized equivalent also in source.

**Why these weren't built this session:** St. Matthias and St. Barnabas are straightforward (fixed dates, no complications) and could be added the same way the Visitation was. Independence Day is similarly fixed-date but always falls inside an existing Ordinary Time weekday, same displacement pattern as everywhere else. **Thanksgiving Day is structurally different** — the BCP gives no fixed calendar date (it's "the fourth Thursday of November" by U.S. civil custom, not a BCP-dated Holy Day the way the other three are), so it needs date-computation logic per year rather than a single fixed `date` field, unlike every other entry in this file format. That's a different kind of work than a data fix and deserves its own design decision, not a rushed fit into the existing fixed-date schema.

**Not touched, still open:** building St. Matthias/St. Barnabas/Independence Day (data is ready, just needs the same treatment as the Visitation); designing Thanksgiving Day's moveable-date handling.

## Session, 2026-07-10 — gaps filled (Matthias/Barnabas/Independence Day/Thanksgiving Day built), then a full engine survey found three severe, previously-undiscovered defects

Per Josh's direction: built the three straightforward missing Holy Days, designed and built Thanksgiving Day's moveable-date logic, verified Shrove Tuesday — then, per Josh's follow-up correction that the project needs the *engines* audited, not just content, conducted a full survey of every BCP-touching engine (calendar-engine.js, scripture-resolver.js, saints-resolver.js, office-ui.js's core rendering logic), reading each in full and testing empirically rather than by inspection alone. That survey found two severe, previously-undiscovered defects, and finishing the original Shrove Tuesday check surfaced a third, related one.

### Gaps filled

**Saint Matthias (Feb 24), Saint Barnabas (June 11), Independence Day (July 4)** — built following the exact pattern established for the Visitation: readings and psalms verified against BCP pp.995-1000, both-rite Collects transcribed and verified against BCP pp.188/241 (Matthias), pp.187/240 (Barnabas), pp.193/244 (Independence Day), each replacing the regular weekday entry it displaces (Tuesday in 1 Lent; Thursday/Saturday in the Week of Proper 5/8 respectively). Independence Day's liturgical color: initially guessed red, then corrected to white before committing — BCP doesn't actually assign colors (that's supplementary-chart territory), and white matches this app's existing pattern for non-martyr Major Feasts more defensibly than an unjustified red guess.

**Thanksgiving Day** — genuinely different from the other three: no fixed BCP date (4th Thursday of November, U.S. civil custom). Built properly rather than forced into the fixed-date schema: added `_getThanksgivingDay(year)`/`_isThanksgivingDay(date)` to `calendar-engine.js`, mirroring the existing `_getAdventSunday` algorithmic pattern, tested against 2024-2030 (matches known public dates). Added a new Priority 0 check to `findEntry()` (runs before all three existing priorities) that catches this specific computed date and routes to a dedicated entry carrying a `moveable_id: "thanksgiving-day"` marker instead of a `date`/`day_of_season` field — deliberately NOT overwriting the existing Nov 26 weekday entry, so that entry still correctly serves other years via its own unaltered `day_of_season` (unlike the fixed-date Holy Days, which do overwrite their weekday slot — see the engine survey below for why that distinction turned out to matter).

**Shrove Tuesday — verified, independently, not just re-trusted.** Re-confirmed empirically (not from the prior session's note) that Feb 17, 2026 never routes to `ordinary1.json` at all — `getSeasonAndFile()` returns `epiphany.json` for that date, confirming the "brief Ordinary Time between Epiphany and Ash Wednesday" branch in `_generateSeasonRanges()` is provably dead code (its guard condition, `briefOrdStart < ashWednesday`, can never be true given how `epiphanyEnd`/`briefOrdStart` are defined one line earlier — they're mathematically always equal). "Tuesday in the Week of Last Epiphany" in `epiphany.json` is confirmed live and already correct (fixed in an earlier tranche). This closes the item cleanly. **But investigating it surfaced a new, serious, related defect — see below.**

### Engine survey (Josh's direction: audit the code, not just the content)

Read `calendar-engine.js`, `scripture-resolver.js`, and `saints-resolver.js` in full; surveyed `office-ui.js`'s structure (5,050 lines, 129 functions) and deep-read the Daily Office reading/psalm/canticle resolution chain plus every date-math and rotation function in the file. Tested empirically throughout — including against the (stale) `CALENDAR_ENGINE_DOCUMENTATION.md`'s own claimed-verified test cases, which is how the first defect below was caught: the doc claims things work that the current, much-evolved code doesn't actually guarantee.

**Defect 1 — `findEntry()`'s Priority 2 (day_of_season offset) runs before Priority 3 (month-day match), silently breaking every fixed-date Holy Day sitting inside a moveable season, in every year but 2026.** Reproduced directly: `Nov 30, 2027` (Saint Andrew) returns `"Tuesday in the Week of 1 Advent"` instead. Root cause: Advent/Lent/Easter/Ordinary Time populate `day_of_season` on every entry (correctly — that's what makes season *boundaries* perpetual), but since those seasons themselves start on a moveable date, a fixed Holy Day's month/day lands at a different offset every year, and the offset-match (checked first) always finds *something* before the month-day fallback ever runs. Christmas/Epiphany are unaffected because those files don't populate `day_of_season` at all. Affects roughly 20 pre-existing Holy Days (St. Andrew through All Saints) plus the 3 built today plus the Visitation transfer from the prior session. Not fixed — touches the core matching priority order, deserves a deliberate design decision rather than a rushed patch.

**Defect 2 — `getScriptureText()`'s live code path mishandles cross-chapter citations, and it's the only path the Daily Office actually uses.** `extractBookRange()`'s `range.split(':')` produces 3 parts for a "C:V-C:V" string (e.g. `"6:3-7:1"` → `["6","3-7","1"]`), silently discards the trailing verse number, and treats the middle piece as an end-verse within the *starting* chapter only. Verified against real data (`2corinthians.json`): "2 Corinthians 6:3-7:1" renders as just 5 of its intended ~17 verses, nothing from chapter 7 at all. A separate, genuinely correct parser (`_parseSubrange` → `_normalizeCitationToSegments` → `resolveScripturePericope`) already exists in the same file but is dead code as far as the Office is concerned — `office-ui.js` never calls it. **Scope: 172 reading citations in this format across `data/season/*.json`** — this is very likely the single highest-impact defect found in this whole project. Not fixed.

**Defect 3 — found while closing out Shrove Tuesday: `ordinary1.json`'s `day_of_season` numbering is off by exactly 2 for the entire season, in every year but 2026.** The dead Shrove Tuesday entry (day_of_season=1) and the already-known-dead "Day of Pentecost" duplicate (day_of_season=2) are squatting on the first two offset slots — real content doesn't start until day_of_season=3 ("Monday in the Week of Proper 3"). Directly tested: for May 25, 2026 (the actual day after Pentecost), the engine's own `getSeasonStartDate()` + offset math computes `day_of_season = 1`, but the stored data has that date tagged `3`. 2026 is shielded by Priority 1's exact-date match, but the misalignment propagates through `ordinary2.json` and `ordinary3.json` via the continuous cross-file numbering (confirmed: `ordinary2.json`'s first entry is stored as day 71, computed as day 69) — meaning roughly the entire ~190-day Ordinary Time season would show each day's content 2 days off from correct in any year relying on offset matching. This is likely the largest-scope defect of the three, even though its mechanism is simple (two dead entries never should have been assigned real `day_of_season` values once identified as dead).

**None of these three are fixed yet.** All are well-understood and empirically confirmed, not guessed at, but each touches core matching logic used by hundreds of entries — they deserve Josh's direction on approach before any patch, not a rushed fix bundled into this session.

## Session, 2026-07-10 continued — Defect 3 fixed (day_of_season off-by-2), verified across multiple years

Josh's chosen order: Defect 3 first (simplest, and a prerequisite for cleanly testing Defect 1 across years), then Defect 1, then Defect 2. Resume note written after each engine's fix lands, per Josh's instruction, rather than batched at the end.

**Root cause, confirmed:** two dead entries were occupying `day_of_season` 1 and 2 in `ordinary1.json` — the already-known-dead "Day of Pentecost" duplicate (re-verified independently this session: `getSeasonAndFile()` routes May 24, 2026 to `easter.json`, never `ordinary1.json`; the real entry lives correctly in `easter.json`) and the Shrove Tuesday entry closed out earlier today (also confirmed dead: Feb 17, 2026 routes to `epiphany.json`). Real content didn't start until `day_of_season: 3`.

**Fix:** removed both dead entries from `ordinary1.json` entirely (they served no purpose and actively caused the bug), then shifted every remaining `day_of_season` value down by 2 across all three files — `ordinary1.json` (68 real entries after removal), `ordinary2.json` (61 entries), `ordinary3.json` (60 entries) — done via a script, not by hand, given the scale (188 single-field changes). Diff verified clean: exactly one changed line per entry plus the two full removals, no incidental reformatting.

**Verification, not just inspection:**
- Full-corpus scan comparing every entry's stored `day_of_season` against the engine's own live-computed value (`getSeasonStartDate()` + offset math): **zero mismatches across all 188 entries**, before this fix there would have been essentially all of them (anything not shielded by an exact 2026 date match).
- Tested the actual day-after-Pentecost resolution for 2027, 2028, and 2029 (three different Pentecost dates, since Easter moves) — all three correctly resolve to "Monday in the Week of Proper 3," the true first day of Ordinary Time, via offset matching. Confirms the fix holds across years, not just for 2026's own numbers.

**Defect 3 is closed.** Two defects remain: Defect 1 (findEntry's priority order breaking fixed-date Holy Days in moveable seasons) and Defect 2 (the scripture-resolver cross-chapter citation bug) — full detail on both in the entry above.

### Dashboard updated

Added two new sections to `audit-ledger.html`: "Engines & Rendering Logic — the BCP Daily Office" (the 4 engines above: calendar-engine.js and scripture-resolver.js red with the findings above; saints-resolver.js green, clean; office-ui.js's core rendering amber, partially surveyed) and "Engines & Rendering Logic — other traditions (flagged, not audited)" (all 10 other-tradition engine files — Ethiopian, East Syriac, Eastern Orthodox, Byzantine/Horologion/Menaion/Octoechos, Roman Breviary — marked amber per Josh's explicit instruction that this session's scope was BCP-only). `SEED_VERSION` bumped, script block re-validated with `node --check` before committing. The St. Mary the Virgin / St. Michael and All Angels alternate-readings toggles are now implemented — see above, in this same entry.


## Session, 2026-07-09 continued — St. Mary the Virgin / St. Michael and All Angels alt-EP toggle: built, applied, confirmed pushed

Implemented Josh's decision to offer both BCP alternatives as a toggle (same pattern as Noonday/Compline), not just flag it. Built a general, reusable mechanism: any calendar entry can carry `alt_ep_toggle_id`; `office-ui.js`'s Evening Prayer psalm/OT/Gospel resolution checks `toggle-{id}-alt` and prefers `_alt` fields when checked, else falls back to primary fields unchanged (default behavior untouched). Wired up for both:
- Saint Mary the Virgin (`mary-virgin` / `toggle-mary-virgin-alt`): Psalm 138,149 / Zechariah 2:10-13 / John 19:23-27 (BCP p.997).
- Saint Michael and All Angels (`michaelmas` / `toggle-michaelmas-alt`): Psalm 104 / 2 Kings 6:8-17 / Revelation 5:1-14 (BCP p.999).

Checkboxes added to `index.html` settings panel with source-citing tooltips. Not wired into `saveSettings`/`loadSettings` -- most sibling toggles from the 2026-07-08 tranche aren't persisted either, checked first rather than assumed.

**What actually happened with the first delivery attempt, for the record:** the first patch failed `git am` on Josh's end. Initial theory (committer-date hash drift, benign) was checked directly against a tree diff and ruled out -- it wasn't that. **Real cause: the preceding Holy Days lectionary-track fix patch had been presented but never actually applied by Josh**, so this toggle patch's context (the Visitation rename, St. Andrew's new field, the new Collect component) didn't exist in Josh's real repo yet. Rebuilt both commits (Holy Days fix, then this toggle feature) directly against Josh's actual pushed `HEAD`, verified `git am` succeeded against a fresh clone of the real `origin/main` before handing off, and Josh confirmed both applied and pushed. **Standing lesson, same one this project keeps re-learning: when something fails, verify the actual cause before reaching for the reassuring explanation.**

Confirmed via fresh clone, 2026-07-10: `origin/main` has all of this (Holy Days fix + toggle feature + docs) as of commit `e5dcfea`.

**Still separately open from the Holy Days audit:** building St. Matthias, St. Barnabas, and Independence Day entries (BCP readings and both-rite Collects already sourced, above); designing Thanksgiving Day's moveable-date (4th Thursday of November) handling, which needs different schema treatment than every other fixed-date entry in this file format.
