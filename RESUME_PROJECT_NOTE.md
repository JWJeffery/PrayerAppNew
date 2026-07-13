> ## ⚠️ CRITICAL — READ THIS FIRST, EVERY TIME
>
> **This file is currently 700+ lines. Your `view` tool truncates from the middle at ~16,000
> characters. If you use `view` on this file without an explicit full-range check, you WILL get
> a truncated/summarized version and WILL miss content — this has already caused real mistakes
> in this project (a resume note was twice characterized as stale or current based on only
> reading its head or a partial view, and both times the characterization was wrong).**
>
> **Before saying anything about this file's contents, staleness, or what's "left to do,"
> actually read the whole thing:**
> ```
> wc -l RESUME_PROJECT_NOTE.md
> ```
> then read it in full via `sed -n 'START,ENDp' RESUME_PROJECT_NOTE.md` in chunks (e.g. 150-200
> lines at a time) via the bash tool, covering every line from 1 to the total — not the `view`
> tool on this file, and not just the first chunk. Confirm you've reached the actual last line
> before concluding anything.
>
> **This file is a chronological, append-only log, not a single current-status snapshot.**
> Earlier sections (including ones that say "DONE" or "COMPLETE") were true when written but may
> have been superseded by later corrections — this file corrects its own earlier claims in place
> more than once. **The LAST dated section is always the authoritative current status.** Don't
> stop reading partway through and assume an earlier "DONE" is still the whole truth — always
> read to the actual end.
>
> **Before trusting any commit hash, `SEED_VERSION`, or "current state" claim anywhere in this
> file — including in this critical note by the time you're reading it — run `git log --oneline
> -5` against a fresh clone and check what's *actually* on `origin/main`.** Patches described as
> "delivered" or "pending" in this file may or may not have actually been applied by the time you
> read this; never assume.

---

## Project resume log (chronological — Anglican/BCP Daily Office work 2026-07-06 through 2026-07-10, Biblical Corpus remediation 2026-07-10 onward)

For full session history and consolidated workflow practices, see `AUDIT_GOVERNANCE_LEDGER.md` — particularly "Standing Workflow Practices," "Recovery, 2026-07-06," and the DOL-related entries from that date. This note covers what's actually left to do, plus enough historical detail to avoid re-deriving already-settled findings — but per the critical note above, always read to the actual end for current status, don't stop at an early "COMPLETE."

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

## Session, 2026-07-10 continued — Defect 1 fixed (findEntry priority order), verified across 11 years; one deeper, pre-existing gap surfaced and left honest rather than papered over

**The fix, precisely:** a naive "just swap Priority 2 and 3" would have broken every regular weekday entry (they also carry literal 2026 date fields whose month-day portion would spuriously match in other years). Instead: added an explicit `fixed_month_day: true` marker to the 23 genuine fixed-civil-date Holy Days across `advent.json`, `lent.json`, `easter.json`, `ordinary1/2/3.json` — deliberately excluding Easter Day, Ascension Day, the Day of Pentecost, and Trinity Sunday (genuinely Easter-relative, already handled correctly) and the Visitation (discovered mid-fix to be a *third*, harder category — see below, not fixed). Added a new Priority 1.5 check in `findEntry()` that matches these 23 by month-day before the offset check runs, and excluded them from Priority 2's offset search entirely.

**That exclusion turned out to matter for a second, independent reason**, confirmed empirically before assuming the simpler fix was enough: without it, a Holy Day's own `day_of_season` value (correct only for the year it was written against) can "leak" and incorrectly match an unrelated date in another year — confirmed directly: before the fix, June 26 2027 (not July 4) incorrectly showed Independence Day's content, because that date's offset for 2027 happened to equal Independence Day's stored `day_of_season`. Also found and fixed the same problem lurking in the *old* Priority 3 (month-day fallback): once Priority 2 stopped claiming these dates, Priority 3 started incorrectly matching regular weekday entries by coincidental date-string collision (e.g. "Friday in the Week of Proper 7," which literally happens to sit on 2026-06-26, showing up for 2027-06-26 even though it's not actually correct for that year's offset). Restricted Priority 3 to only fire for `fixed_month_day` entries or entries with no `day_of_season` at all (Christmas/Epiphany) — closing that leak too.

**A real implementation bug found and fixed mid-task:** the first version of the Priority 1.5 check required `date.length === 10` (strict ISO format), which silently excluded Lent's three Holy Days (`lent.json` uses "February 24, 2026"-style text dates, not ISO) — caught by the comprehensive test sweep below, not by inspection. Fixed by handling both date formats, matching the technique Priority 3 already used.

**Verification:** built a test harness checking all 23 fixed Holy Days against their real dates across 2025-2035 (253 test cases) — 0 failures after the date-format fix (25 failures before it, all in `lent.json`, which is exactly how the bug was caught). Re-ran the original failing case (Nov 30, 2027 → now correctly Saint Andrew) and the leak case (June 26, 2027 → now an honest fallback, not wrong content). Full 2026 regression check across all six season files (310 entries) — zero unintended changes; the one flagged "mismatch" (Nov 26, 2026 correctly showing Thanksgiving Day instead of the regular weekday) is the intended Priority 0 behavior, not a regression.

**A deeper, pre-existing gap this fix surfaced rather than created — left honest, not papered over.** Building any of these 23 Holy Days (by me today, and historically by every prior session that added one) worked by *replacing* the regular weekday entry that used to occupy that `day_of_season` slot. That regular content is gone — there's no record of what a normal, non-Holy-Day date at that same offset should contain. Before this fix, that gap was invisible because Priority 2 or the old Priority 3 would silently paper over it with *something* (either the Holy Day itself on the wrong date, or a coincidentally-matched regular weekday from a different offset) — both actively wrong. After this fix, the app is honest about it instead: dates where the offset used to belong to a now-overwritten Holy Day slot, in years where the Holy Day's real civil date doesn't land there, correctly fall through to the existing "no lectionary entry for this date" sentinel rather than showing fabricated content. This is a real improvement (no longer lying) but not a complete fix (still doesn't have the right content to show). Recovering it would mean re-deriving what BCP actually assigns to each of those ~23 numbered offset positions independent of any year's Holy Day collision — a real research task, not something to guess at. Flagged here rather than left silently discovered-and-ignored.

**Defect 1 is closed for its stated purpose.** The Visitation's conditional-transfer problem (a third category, harder than simple fixed-date matching) and the 23-slot regular-weekday content gap above remain open, separate items. Defect 2 (scripture-resolver cross-chapter citations) is next.

## Session, 2026-07-10 continued — Defect 2 fixed (cross-chapter citations); a fourth, separate defect found while testing it

**The fix, precisely:** `extractBookRange()` in `js/scripture-resolver.js` — the only code path the Daily Office actually calls for every reading — only ever fetched a single chapter (`bookData.chapters.find(ch => ch.num === chNum)`), then iterated verses within it. Added a new branch, checked before the existing single-chapter logic, that detects genuine cross-chapter format (`^(\d+):(\d+)-(\d+):(\d+)$`) and loops across every chapter from start to end, gathering the correct verse range in each: all of the start chapter from its start verse onward, every verse of any chapters in between, and the end chapter up to its end verse. The existing single-chapter and chapterless-subrange logic (which threads `lastChapter` across a citation's comma-separated pieces) is untouched — the new branch only activates for the specific format that was broken.

**Verification:** re-tested the original failing case (2 Corinthians 6:3-7:1) directly against the modified live file — now correctly returns all 17 verses (6:3 through 6:18, then 7:1), spanning both chapters, versus 5 before the fix. Regression-tested plain single-chapter citations and chapterless sub-ranges (the `lastChapter`-threading mechanism) — both unaffected. Built a full sweep of all 130 unique cross-chapter citations actually used across `data/season/*.json`, tested against real Bible data files (not synthetic data): **124/130 fully correct** (right verse count, right first verse, right last verse, spanning the correct chapters).

**The remaining 6 — Baruch, Ecclesiasticus, and Wisdom citations — are not failures of this fix.** Traced precisely: all three books' JSON files have every `chapter.num` set to `null` instead of an actual chapter number, so `bookData.chapters.find(ch => ch.num === chNum)` can never match *anything* from these books — cross-chapter or single-chapter, old code or new. Confirmed directly: a plain "Wisdom 1:1-11" citation (nothing to do with cross-chapter parsing) also returns "[Wisdom 1 unavailable]," and the pre-fix code would have failed identically for the cross-chapter cases too. **This is a fourth, separate, previously-undiscovered defect** — every single reading from Wisdom, Baruch, and Ecclesiasticus/Sirach across the entire Daily Office (all three books, every chapter, confirmed by direct inspection: Wisdom's 19 chapters, Baruch's 5, Sirach's 51 all have `num: null`) is currently rendering as an unavailability message, not scripture text. Not fixed here — it's a data-structure problem in three source files, not a resolver-logic problem, and deserves its own scoped fix rather than being folded into this one. Flagged clearly rather than left silently discovered.

**Defect 2 is closed for its stated scope** (the resolver's cross-chapter parsing logic, which is what was originally found and reported). The newly-found Wisdom/Baruch/Ecclesiasticus chapter-numbering defect is a distinct, open item.

## Session, 2026-07-10 continued — items 1-4 from the open-items list: #3 and #1 done (bigger than scoped); #2 investigated and found much larger than expected, not fixed; #4 confirmed already complete

Josh asked to take care of the four remaining open items from the engine survey. Resume note written after each one, per Josh's standing instruction.

### #3 — Wisdom/Baruch/Ecclesiasticus chapter-numbering: fixed, and much bigger than the 3 books originally found

Traced the root cause precisely: these three books' JSON files use `chapter.num`/`verse.num` as `number` instead — a schema mismatch against every other book in the corpus (confirmed against a working file, `2corinthians.json`, which correctly uses `num`). A scoped, full-corpus scan for this exact pattern found **11 books affected, not 3**: 1 Esdras, 1 Maccabees, 2 Esdras, 2 Maccabees, Baruch, Judith, Letter of Jeremiah, Prayer of Manasseh, Sirach, Tobit, and Wisdom — all Deuterocanonical/Apocryphal books, evidently imported as a batch with a different convention than the rest of the corpus. Checked the remaining Apocrypha (3/4 Maccabees, 1 Enoch) — correctly unaffected.

Fixed by renaming `number` → `num` at both chapter and verse level in all 11 files, preserving field position and leaving everything else untouched. Verified: the full 130-citation cross-chapter sweep from the Defect 2 fix now passes 130/130 (was 124/130, with the 6 failures being exactly these books); a second sweep of all 62 citations from these 11 books actually used across the DOL corpus (including comma-separated sub-ranges, testing the full `getScriptureText`-style splitting logic) — 62/62 pass. Every reading from these 11 books across the entire Daily Office was rendering as "[Book N unavailable]" before this fix; none should now.

Dashboard: Wisdom, Sirach, Baruch escalated from amber to red in the biblical-corpus tracking grid (the other 8 affected books aren't yet in that grid's tracked list, worth adding if the corpus audit resumes there).

### #1 — The Visitation's conditional transfer: fixed properly, harder than it looked

The Visitation has a genuine fixed BCP date (May 31) but transfers to the next day when it collides with Trinity Sunday (a Principal Feast, which always wins) — a *third* category, distinct from both the simple fixed-date Holy Days (Defect 1's fix) and the no-fixed-date Thanksgiving Day.

Added `_getVisitationDate(year)`/`_isVisitationDate(date)` to `calendar-engine.js`: computes Trinity Sunday (Easter + 56) for the given year, checks whether it lands on May 31, and returns June 1 (transferred) if so, or May 31 directly otherwise.

**Found a real complication before wiring anything in, not after:** checked whether May 31 always falls in the same season across years, since `findEntry` only ever sees whichever single file `getSeasonAndFile()` already selected. It doesn't — tested 12 years, and 5 of them (2025, 2028, 2030, 2031, 2033) have May 31 naturally falling in Easter season, not Ordinary Time, depending on how late Easter is that year. This meant the Visitation intercept couldn't live inside `findEntry` (like Thanksgiving Day's does) — it had to run in `fetchLectionaryData`, *before* file selection, so it works regardless of which season May 31 naturally belongs to that year. Implemented there: checks `_isVisitationDate()` first, and if true, loads `ordinary1.json` specifically (where the Visitation's data entry lives) regardless of what the normal routing would have picked.

Converted the Visitation's data entry from a literal `"date": "2026-06-01"` (2026-only) to a `moveable_id: "visitation"` marker, matching the Thanksgiving Day pattern — reachable only through the new intercept, never through the normal date-matching priorities.

**Also recovered the regular weekday content the Visitation had been sitting on top of.** Its `day_of_season: 8` slot had been silently orphaned since the entry was originally built (same class of gap as Defect 1's residual finding) — removing the literal date/day_of_season fields would have left it empty. Recovered the exact original "Monday in the Week of Proper 4" content from git history (`git show 9774b41~1`, the commit immediately before the Visitation was first built) and restored it as its own entry at the correct post-Defect-3 offset.

**Verified thoroughly:** all 5 scenarios tested end-to-end through the real `fetchLectionaryData` (not a simulation) — June 1 2026 (collision year, transferred) → Visitation; May 31 2026 (Trinity Sunday, correctly unaffected) → Trinity Sunday; May 31 2027 (non-collision, Ordinary Time) → Visitation; May 31 2025 (non-collision, but naturally Easter season) → Visitation, confirming the cross-season intercept works; June 1 2027 (an ordinary day) → the correct regular weekday, no false positive. Checked for duplicate/missing `day_of_season` values in `ordinary1.json` after the change — clean, 1-68, no gaps. Full 2026 regression across all six season files (310 entries, via the real `fetchLectionaryData`) — zero unintended changes; the two flagged "mismatches" are June 1 2026 and Nov 26 2026 correctly showing their superseding observance, the same expected pattern as Defect 1's Thanksgiving Day case.

### #4 — confirmed already complete, no work needed

St. Matthias, St. Barnabas, Independence Day, and Thanksgiving Day were all built in an earlier session (2026-07-10, before the engine survey). Listed as "still open" in a later summary by mistake — corrected here.

### #2 — investigated, found to be much larger than scoped, NOT fixed, needs Josh's direction before proceeding

Before recovering content for the other ~22 orphaned Holy-Day slots the same way the Visitation's was just recovered, checked whether that approach actually makes sense — i.e., whether a slot's `day_of_season` offset reliably corresponds to the same "Proper N, weekday" identity across different years. **It does not, and the problem is much bigger than the 23 Holy Day slots.**

Tested directly against BCP's own date rule ("Proper 4: Week of the Sunday closest to May 25") across six years: "Monday in the Week of Proper 4" computes to `day_of_season` 37, 1, 8, 44, 8, and 37 in 2025-2030 respectively — not a fixed number at all. Confirmed this is systematic, not a one-off, by testing two more Propers (10 and 20) across four more years each — same pervasive drift every time. Root cause: BCP deliberately anchors Propers to *fixed civil dates* (so the continuous Old Testament reading track stays aligned with the calendar year, independent of when Easter falls), while the app's `day_of_season` numbering is anchored to *Pentecost* (a moveable date) — two different reference systems that only happen to coincide by construction for 2026, the year the data was built against.

**Checked whether this affects Advent/Lent/Easter too, since it would change the scope enormously if so — it doesn't.** Those seasons label weeks relative to their own moveable start (Advent Sunday, Ash Wednesday, Easter Day itself), which *is* the same anchor `day_of_season` uses, so they're naturally consistent: tested "Monday in 2 Lent" across five years and got the same offset (13) every time, confirming Lent-family season labeling is safe.

**So the defect is precisely bounded to Ordinary Time specifically, but within that scope it's not "23 orphaned slots" — it's potentially all ~165 regular (non-Holy-Day) Ordinary Time weekday entries too, since the same broken offset-to-Proper mapping applies uniformly to every entry in `ordinary1/2/3.json`, not just the ones a Holy Day happens to sit on top of.** This is a foundational addressing-scheme problem, not a data-recovery task — properly fixing it would likely mean re-deriving each Ordinary Time entry's *actual* correct BCP-anchored date for a given year (computing "Sunday closest to [Proper N's civil date]" fresh, the way `_getVisitationDate` and `_getThanksgivingDay` already do for their own cases) rather than relying on a simple sequential day-count from Pentecost. That's a real architectural redesign, not a patch, and touches the majority of the Daily Office's actual displayed content across every year but 2026. **Not attempted without Josh's explicit direction on approach, given the scale.**

### Dashboard updated

Added two new sections to `audit-ledger.html`: "Engines & Rendering Logic — the BCP Daily Office" (the 4 engines above: calendar-engine.js and scripture-resolver.js red with the findings above; saints-resolver.js green, clean; office-ui.js's core rendering amber, partially surveyed) and "Engines & Rendering Logic — other traditions (flagged, not audited)" (all 10 other-tradition engine files — Ethiopian, East Syriac, Eastern Orthodox, Byzantine/Horologion/Menaion/Octoechos, Roman Breviary — marked amber per Josh's explicit instruction that this session's scope was BCP-only). `SEED_VERSION` bumped, script block re-validated with `node --check` before committing.

*(A stale, duplicate copy of the 2026-07-09 toggle-feature session entry was found appended after this point, left over from an earlier file-copy mishap between working directories. Removed 2026-07-10 — the correct copy of that entry is earlier in this file, unaffected.)*

## Session, 2026-07-10 continued — the Ordinary Time redesign, done properly

Josh: "If we need to redesign it to work properly, do so."

### The real BCP rule, found and verified precisely before writing any code

Fetched BCP's actual rubric (p.158, "Concerning the Proper of the Church Year") rather than continue inferring from symptoms: *"The Proper to be used on each of the Sundays after Pentecost (except for Trinity Sunday) is determined by the calendar date of that Sunday... in any year, the Proper for the Sunday after Trinity Sunday... is the numbered Proper (number 3 through number 8), the calendar date of which falls on that Sunday, or is closest to it... Thereafter, the Propers are used consecutively."* Then found BCP's own authoritative lookup table (pp.884-885, "A Table to Find Movable Feasts and Holy Days") mapping every possible Easter date to the correct starting Proper — transcribed directly into `calendar-engine.js` as `EASTER_TO_STARTING_PROPER`, not re-derived or approximated.

**Verified this understanding against the app's own known-correct 2026 data before trusting it**, since getting this wrong would mean rebuilding on a wrong foundation: checked that "Monday in the Week of Proper 3" (May 25, Pentecost week) and "Monday in the Week of Proper 4" (June 1, Trinity week) — both already correct in the app — match the general pattern in BCP's own worked example ("Propers 1 and 2 being used on the weekdays of Pentecost and Trinity weeks" when starting Proper is 3, generalizing to "the two Propers immediately before the starting one"). They did, exactly. This confirmed the *existing 2026 content* was never the problem — only the matching logic that couldn't generalize it.

### The algorithm

Added `_getStartingProper(year)` and `_getProperWeekInfo(date)` to `calendar-engine.js`. Given a date, computes: Easter → Pentecost → Trinity Sunday → the starting Proper (via the table) → Pentecost week uses (starting−2), Trinity week uses (starting−1), and every week from "the Sunday after Trinity Sunday" onward uses consecutive Proper numbers up to Advent Sunday. Tested exhaustively before trusting it: all 7 of 2026's own known-correct dates; a starting-Proper-3 year (2035) exercising the low end (Propers 1 and 2); a starting-Proper-8 year (2038) exercising the high end; confirmed the boundary always lands exactly on Proper 29 the Sunday before Advent, across 17 different years; confirmed Advent/Lent/Easter do NOT share this problem (their week-labels anchor to their own moveable season start, the same anchor `day_of_season` already uses correctly — "Monday in 2 Lent" = offset 13 in all 5 tested years).

### Data: tagged existing entries, found and filled real gaps

Added explicit `proper_number`/`weekday` fields to all 171 regular Ordinary Time entries (parsed from their existing, already-correct 2026 titles/collects — clean parse, zero ambiguity, one special case handled: "Christ the King — Last Sunday after Pentecost" is Proper 29's Sunday).

**Building the actual matching logic surfaced that 16 (Proper, weekday) combinations were completely missing from the data** — not a matching-logic problem, an actual content gap. Checked git history (`git show 35d9734`, the original "150 of 150" Ordinary Time rebuild) to see whether these were recoverable: only 2 of the 16 had ever existed (both later overwritten by Holy Days built in earlier sessions — "Thursday in the Week of Proper 5" by St. Barnabas, "Saturday in the Week of Proper 8" by today's Independence Day). **The other 14 were never built at all**, evidently because 2026 always happened to have a Holy Day sitting on that exact date, so nobody noticed the underlying weekday content didn't exist. Sourced all 16 fresh from BCP pp.972-991 (Propers 7, 8, 11, 13, 14, 16, 19, 20, 21, 24, 25, 26), applying the same bracket-extension and house-style conventions as the rest of this session's work. Full coverage confirmed: **all 201 required (Proper, weekday) combinations (Propers 1-2 weekday-only, 3-29 with Sunday) now exist, zero gaps, zero duplicates.**

### Matching logic, and a real bug in it caught by testing, not inspection

Added the new routing to `fetchLectionaryData()`: Ordinary Time dates now resolve via computed Proper/weekday identity, searched across all three Ordinary Time files (a Proper's data doesn't necessarily live in the file `getSeasonAndFile()`'s civil-date split would naturally pick for a given year).

**Testing this exhaustively (2,778 days across 15 years) surfaced a second, independent gap**, not caused by today's work but exposed by finally testing broadly enough to hit it: fixed-date Holy Days near a moveable season boundary (St. Andrew, Nov 30, sits right at the Advent/Ordinary-Time line; St. Matthias, Feb 24, sits near the Epiphany/Lent line) weren't found when their date fell in the "wrong" season that year, because the existing Holy Day check only ever looked in whichever single file `getSeasonAndFile()` happened to pick. Fixed with `_findFixedMonthDayEntry()`, a general cross-file search (all 8 season files, cached after first use) that runs before any season-specific routing — the same technique already used for the Visitation, generalized.

### Full verification, not spot-checks

- **2026 regression** (all six season files, 310 entries): 1 "mismatch" — June 1 correctly showing the Visitation, the same expected supersession as before. Zero unintended changes.
- **30-year Ordinary Time sweep** (2024-2053, every single day): 5,556 days tested, **0 fallbacks, 0 errors.**
- **13-year Holy Days sweep** (298 date/year combinations): 298/298 correct.

### One real bug found, and *fixed* -- flagged plainly, then properly resolved (2026-07-10)

The cross-file Holy Day fix has a side effect worth being honest about: **Annunciation (fixed March 25) can coincide with Easter Day itself** in years where Easter falls on March 25 -- confirmed via `_getEaster`: 2035, 2046, 2103 (3 times in 100 years, genuinely rare). ~~Currently the fixed-date check runs before Easter's own resolution, so Annunciation "wins" that collision~~ -- **Fixed 2026-07-10.** Turned out to be far more common than the "3x/100yr" framing above suggested: found BCP's actual rule (p.17, "Feasts appointed on fixed days... are not observed on the days of Holy Week or of Easter Week... transferred to the week following the Second Sunday of Easter, in the order of their occurrence"), then swept all 29 fixed-date Holy Days in the app against the one window that could ever matter (Easter's valid range is fixed at March 22-April 25, so the danger window is always within March 15-May 1) -- found exactly four ever at risk: Saint Joseph (Mar 19), the Annunciation (Mar 25, colliding in 39 of 100 years, not 3), Saint Mark (Apr 25), and Saints Philip & James (May 1). Implemented a general transfer mechanism in `calendar-engine.js` (stacks colliding feasts chronologically onto the week after 2 Easter Sunday, since more than one can collide the same year), verified with a 100-year sweep (282 checks, 0 errors). See `AUDIT_GOVERNANCE_LEDGER.md`'s calendar-engine.js entry for full detail.

### What's now closed vs. still open

**Closed:** the core architectural defect (Ordinary Time addressing is now genuinely correct for any year, not just 2026), all 16 data gaps it surfaced, and the Holy Day season-boundary gap it also surfaced.

**Closed 2026-07-10:** the Annunciation/Easter Day collision, and the broader question of whether any other fixed-date Holy Day needed a similar conditional-transfer rule -- both resolved together (see the "One real bug found, and *fixed*" entry above). Checked systematically this time, not incidentally: exactly four of the app's 29 fixed-date Holy Days can ever collide with Holy Week/Easter Week (Saint Joseph, the Annunciation, Saint Mark, Saints Philip & James), and all four now transfer correctly per BCP p.17.

## Backlog item, added 2026-07-10, closed 2026-07-10 — the ordinary1/2/3.json file split, investigated and merged

Josh's instruction: once every other correction to the 1979 BCP Daily Office is complete, investigate whether the current `ordinary1.json`/`ordinary2.json`/`ordinary3.json` three-way split is still the best way to serve this data.

**Findings:** file size was never a real constraint for current tooling (each file was 40-60KB, trivially small); the civil-date split (Aug 1/Oct 1) no longer maps to anything under the Proper-anchored addressing scheme built earlier the same day, which is exactly why the Proper-routing loop already searched across all three files on every lookup. But the split was more entangled in the code than just that loop -- nine call sites across `calendar-engine.js` touched it, including the season-boundary generator itself (`_generateSeasonRanges`) and the `day_of_season` continuity logic that stitched the three files back together.

**Decision (Josh): merge to a single file.** Executed as its own careful tranche:
- Merged the three JSON arrays into `data/season/ordinary.json` (220 entries) -- checked first for any (Proper, weekday), `day_of_season`, or `moveable_id` collisions across the merge; found none.
- Collapsed `_generateSeasonRanges`'s three civil-date sub-ranges into one continuous range for the whole season, all pointing to the single file.
- Removed the now-unnecessary `day_of_season` continuity special-casing in `getSeasonStartDate` (was needed only to stitch `ordinary2`/`ordinary3` back to `ordinary1`'s start date; moot with one file).
- Updated every other hardcoded reference: the fixed-month-day cross-file search list, the Visitation lookup, the Ordinary Time Proper-routing loop (now a single file load, no loop needed), and the "no season match" fallback default.
- Deleted `ordinary1.json`/`ordinary2.json`/`ordinary3.json`.

**Verified by snapshot diff, not just by re-running the existing test suites:** captured `fetchLectionaryData`'s output (title, date, day_of_season, proper_number, weekday, moveable_id, psalms) for all 10,958 dates from 2024-2053 *before* touching any code, made the changes, then re-captured the identical range and diffed. **Zero differences.** This confirms the merge is a true behavior-preserving refactor, not just "no errors" -- every single date resolves to exactly the same content as before.

Dashboard: the three "Ordinary 1/2/3" rows consolidated into one "Ordinary Time" row. `SEED_VERSION` bumped to v81.

## Session, 2026-07-10 continued — Good Friday MP alt and Easter Day EP alts wired (commit 040f085)

Two BCP-genuine "or" alternatives that existed as data but were never actually reachable through any toggle:

- **Good Friday** (BCP p.956): the Year-One-only alternate Morning Prayer OT reading (Wisdom 1:16-2:1,12-22, *or* Genesis 22:1-14) had been misfiled as an evening-alt field (`reading_ot_ep_alt_year1`) and wasn't wired to anything. Moved to `reading_ot_mp_alt_year1`; added a general `alt_mp_toggle_id` mechanism to `js/office-ui.js` (mirrors the existing EP-alt pattern) with a new checkbox `toggle-good-friday-mp-alt`. Deliberately no cross-year fallback — Year Two's Lamentations reading has no BCP alternate at all.
- **Easter Day** (BCP pp.958-959): two real alternatives — the Evening Gospel (Luke 24:13-35 *or* John 20:19-23) and the Evening Psalms (113 & 114, *or* 118 alone). The Gospel alt was stored under a bare key office-ui.js's lookup never matched; renamed to `reading_gospel_ep_alt_year1/year2`. The Psalms had been flattened into one list of all three numbers, losing the alternative structure — split into primary (113, 114) and `psalms_ep_alt` (118). Both wired to a new `alt_ep_toggle_id` (`easter-day-ep`), reusing the mechanism already built for St. Mary the Virgin/Michaelmas, with checkbox `toggle-easter-day-ep-alt`.

Verified with an isolated logic simulation before/after: toggle off preserves prior default exactly; toggle on surfaces the correct alternate(s); Good Friday's Year Two confirmed unaffected either way. Dashboard notes (Lent, Easter rows) updated. `SEED_VERSION` bumped to v78.

## Session, 2026-07-10 continued — Wisdom/Baruch/Sirach dashboard status corrected: they resolve fine now (commit c68480d)

The dashboard's `scripture-resolver.js` row was still amber over the `chapter.num`-is-null defect documented earlier this session. Re-checked directly against current data rather than trusting the old note: `chapter.num` is populated correctly in all three files (19/19 Wisdom, 51/51 Sirach, 5/5 Baruch chapters — this was fixed as part of the broader 11-book `number`→`num` schema fix earlier the same day, commit `9557ce5`, but the dashboard row was never updated to reflect it). Live resolver test against the previously-failing citations (Wisdom 1:1-15, Ecclesiasticus 43:1-12,27-33, Baruch 3:24-37) returns correct text for all three. Row moved to green. `SEED_VERSION` bumped to v80.

**Note: this does NOT mean Wisdom/Sirach/Baruch's *content* has been verified against source** — it means the resolver can now reach and return their text at all. The Biblical Corpus dashboard grid (`audit-ledger.html`, section I) still shows them RED with the stale null-chapter note, which needs updating separately — that grid tracks content accuracy, not resolver reachability, and hasn't been touched by this fix.

## Where things actually stand right now, 2026-07-10 — end of session

**The Daily Office (1979 BCP) engine work is done.** All three severe defects found in the 07-10 engine survey are fixed (findEntry priority order, cross-chapter citation parsing, day_of_season off-by-2). The Ordinary Time addressing scheme has been rebuilt properly (Proper-anchored, correct for any year). The three-file split is gone — single `data/season/ordinary.json`. The Holy Week/Easter Week fixed-Holy-Day transfer rule is implemented and verified across 100 years. Good Friday and Easter Day's BCP-genuine reading alternatives are wired as toggles. `HEAD` is `1fda4ae`, pushed to `origin/main`.

**Next assigned work: the biblical corpus, character-for-character remediation, Genesis through Revelation, one book at a time, all translations together — then ET/AR/SY/Odes corpora, then re-verify NT.** This follows Lucy's 2026-07-05 dismissal for falsely certifying biblical corpora as accurate; all her certifications (the `data/bible/registry/*trust-certification*` files and everything upstream of them) are void and untrusted until independently re-verified from primary sources.

**Correction, 2026-07-11:** the paragraph above (written earlier the same day) said no biblical-corpus audit work existed outside git and would need to be confirmed with Josh. That's now superseded — Josh delivered five completed audit installments (12-16, dated 2026-07-10) that had been produced in a prior session but never committed. Recovered, independently spot-verified (5 load-bearing claims checked directly against live data, all confirmed exact), and committed to `AUDIT_GOVERNANCE_LEDGER.md` and `audit-ledger.html` on 2026-07-11. Full detail in the ledger's "Biblical Corpus Installments 12-16 recovered" entry. **Headline: NT is clean (27/27 books, 2 genuine gaps: Acts 23:26, James 1:8); OT protocanon+Psalms structurally clean per this new audit; deuterocanon content-clean but ungoverned (10/13 books); Wisdom/Sirach/Baruch confirmed resolved by two independent methods now (dashboard updated to green); broader-canon (46 files) structurally clean except 2 corrupted verses (3/7 Clement ET, embedded Korean character) and an open Clement/Qalēmentos provenance question; Odes subsystem is 4-of-5 genuinely incomplete (~6%); canon-profiles registry exists and is clean except one stale index count.**

**The single highest-priority open item, found by this recovery, not yet resolved:** Installment 12 claims zero content defects across all 38 protocanon books — this directly contradicts the dashboard's pre-existing red flags for Genesis/Deuteronomy/2 Kings/Jeremiah ("gaps predate recoverable git history") and 2 Chronicles/Isaiah (specific verse-sequence claims). Left unresolved and red on the dashboard deliberately, not overwritten either direction — see the ledger entry for the reasoning. **This needs to be reconciled before character-for-character remediation starts on any of those six books**, since the two audits may have been checking for genuinely different failure modes and it isn't yet known which claim (if either) is right.

**Audit sequence after biblical remediation, per governance:** Daily Office (1979 BCP — now DONE per above) → Ethiopian → Church of the East → Byzantine → Book of Needs → Roman Breviary.

## Genesis character-for-character remediation — session 2026-07-11, in progress

First real word-for-word verification work (distinct from Installments 12-16's structural auditing). Full detail in `AUDIT_GOVERNANCE_LEDGER.md`. Headline:

- **KJV: fully verified, genuinely clean.** 1,529/1,533 verses exact against the true 1611 source; remaining 4 are a reference-file artifact, not app errors. **But the prefix-pollution defect Lucy certified fixed on 2026-06-21 is confirmed still present and unfixed** across all 1,533 verses — a formatting bug, not a content-accuracy problem; the underlying words are correct.
- **NABRE heading-pollution** — same story, same false certification, still unfixed in 49/50 chapters.
- **DRB — fully verified, genuinely clean.** All 1,530 verses match the complete original 1610 Douay-Rheims (`janvier-s/original-douay-rheims` on GitHub, cross-checked against `originaldouayrheims.com` first). Zero real mismatches.
- **NRSV — FIXED.** The chapters 24-41 contamination, the isolated 42:34 substitution, and chapter 50's straight-quote anomaly are all resolved. Josh's direction: "I don't care how it happens, I just want it accurate" — so rather than diagnosing the contamination mechanism or hand-patching each flagged verse, the entire NRSV column was replaced with verified-correct text from a second trustworthy source (`NRSV-CI.SQLite3`, 1989 American, no structural corruption per its own audit), converted to the app's own established conventions (Lord not LORD, curly quotes) so the whole book reads consistently. **389 of 1,533 verses corrected, 1,144 already-correct verses left untouched.** Re-verified at zero remaining mismatches after the fix. `git diff --stat` confirms a surgical edit — exactly 389 lines changed, nothing else in the file touched.

- **NABRE — FIXED.** The exact defect Lucy certified fixed on 2026-06-21 was confirmed still broken, and turned out worse than documented: the source Josh supplied (`nabre.json`, same header pollution baked in as app's own data, but useful for pattern-deriving and content-verification) revealed **19 additional bare section-title pollutions with no "Chapter N" prefix** beyond the known chapter-opener pattern (e.g. "Warning of the Flood." at 6:5), plus a separate, previously-undiscovered **stray-space bug** ("Lord ’s" instead of "Lord's"). Fixed via full replacement (same strategy as NRSV): **85 verses corrected, plus the `translationOverlays` NABRE entry at 31:55.** Three false positives in the extraction script (genuine biblical name-list content misidentified as section titles) caught and excluded before writing anything — verified directly against app's own correct text first. Zero remaining mismatches or heading markers after the fix.

- **Rotherham — independently verified, already correct.** A Josh-supplied XML source appeared to show 1,183 mismatches, but investigation found the XML itself is a degraded OCR transcription: it's missing Rotherham's signature emphasis-dashes throughout (confirmed against 3 independent sources that the real 1902 text has them — dropping them isn't a minor variant, it's losing the defining feature of the "Emphasized" Bible), plus scattered scanning errors like "in the each in these days" for "in the earth in those days" at 6:4 (confirmed against the Hebrew and every major translation). **The app's existing text was correct all along — no fix needed.**

**Genesis is now fully character-for-character verified and corrected across all five translations: KJV, DRB, NRSV, NABRE, and Rotherham.** The KJV reference-prefix defect (the exact one Lucy falsely certified fixed) has now been actually fixed and re-verified clean — all 1,533 verses stripped, `git diff --stat` confirmed exactly 1,533 lines changed, re-verified against the confirmed-clean 1611 source at 1,529/1,533 exact (same 4 harmless artifact as before). **Josh's correction, now reflected properly: "if there is any type of problem in Genesis, then it's not green."** Genesis is moved to green on the dashboard — this required the book to have zero known open defects, not just full verification coverage with a documented-but-unfixed issue. That distinction matters and should be the standard going forward for every future book.

**A pattern worth carrying into every future book:** this corpus consistently uses original/historical editions (1611 KJV, 1610 Douay-Rheims, 1989 NRSV base) rather than modern revisions. Three near-miss wrong-edition comparisons happened this session alone (DRC instead of original Douay-Rheims; NRSVue instead of 1989 NRSV) before being caught on a landmark-verse check. **Always verify edition identity on a distinctive verse before trusting any diff** — assuming the "obvious" modern edition is wrong by default for this project.

**Immediate next steps:** Genesis is closed, zero known open defects. Move to the next book in sequence (Exodus). Note: Lucy is separately converting Alexander Campbell's "The Living Oracles" from XML to JSON as a side project, into separate files for review before incorporation — treat with the same verify-before-trust discipline as everything else in this ledger when it arrives.

**Standing rule going forward, from Josh directly:** a book does not count as "done" or "green" while any known problem — however minor, however well-documented — remains unfixed. Full verification coverage with an open item is not the same as clean.

**Verify before trusting the "Genesis is closed" claim above.** As of this note being written, `origin/main` was confirmed (via fresh clone) to be at commit `59aaa82`, which does NOT yet include the KJV prefix fix or Genesis's move to green — that work is committed locally and delivered to Josh as a patch, but not yet confirmed applied. **Run `git log --oneline -5` against a fresh clone before assuming Genesis is actually green on the live repo.** If the KJV-fix commit isn't there, that patch (or a freshly regenerated equivalent, using the ledger's "KJV prefix-pollution — fixed" entry as the specification) is the very next thing to apply.

## Session, 2026-07-11/12 — KJV corpus-wide edition switch: 1611 → 1769 KJVA, in progress

**Critical context for whoever picks this up:** Josh explicitly reversed the prior convention. The KJV column across the ENTIRE corpus is switching from the 1611 original-spelling edition to the **1769 modern-spelling (Blayney-standard) edition**, sourced from **KJVA** (`scrollmapper/bible_databases`, `formats/json/KJVA.json`, Sword Project provenance, MIT license, 80 books incl. 14 traditional KJV Apocrypha books). This was Josh's decision, not something inferred from existing data — see `documentation/kjva-source-witness-intake.json` and `BIBLICAL_REMEDIATION_METHODOLOGY.md` §1/§2/§10 for full provenance and the efficiency-lessons framing that preceded this.

**Verify before trusting any of the below: run `git log --oneline -5` on a fresh clone.** As of this note, confirmed pushed and on `origin/main`: `da49ddd` (Genesis), `e0ecadf` (76-book mechanical tranche), `94e8347` (Esther Additions + standalone Daniel/Esther-addition files), `3733a42` (Judith complete).

**Done and verified, all at zero mismatches against KJVA:**
- Genesis (redone under new source), plus 74 other straightforward-mapping books (all protocanon OT+NT, most Apocrypha) — full-column replacement, ~32,151 verses.
- `danielGK.json` — all 14 chapters incl. the Prayer of Azariah insertion (3:24-91) and Susanna/Bel-and-the-Dragon (ch.13/14). Real find: active 3:52 merges KJVA's Azariah verses 29+30 into one verse — a naive constant-offset mapping silently produces wrong content past that point despite reporting zero "missing," caught only by content-level verification.
- `estherGK.json` — ordinary Esther + Additions A-F, all re-collated (Additions' KJV text was previously entirely absent, not previously-trusted-then-overwritten — confirmed via `greek-esther-bound-source-exact-collation-result.json`).
- New standalone files, per Josh's decision (mirror KJVA's own book divisions for Anglican/Protestant searchability, while `danielGK.json`/`estherGK.json` stay as the merged Catholic/Orthodox forms): `susanna.json` (64v), `belandthedragon.json` (42v), `prayerofazariah.json` (67v), `additionstoesther.json` (6 lettered chapters, 105v).
- `baruch.json` (ch.1-5) and `letterofjeremiah.json` (= KJVA's Baruch ch.6, exact 73-verse match).
- **Judith — fully done, all 375 verse addresses independently re-verified, zero mismatches.** Most of its apparent "extra" verses (chapters 3,4,5,9,13) turned out to be DRB-only Vulgate additions already correctly blank for NRSV too (same `allowedAbsence` pattern as Daniel 13:65) — no fix needed. Chapters 15/16 had a real, serious problem: the app's chapter 15/16 boundary sits one verse earlier than KJVA's, which had caused the ORIGINAL mechanical bulk-replacement pass to silently write WRONG KJV content into active 16:1-9 (not merely leave them "missing" — a genuinely dangerous failure mode, since "0 missing" alone would have looked clean). Also found and fixed a genuine verse split at 16:7/8 (KJVA's single v.8 divided across two active verses). **Standing lesson reinforced: chapter/verse count matching between active and source is not sufficient verification — content must be checked at multiple points per chapter, not just start/end, since matching totals can mask internal drift.**

**Correction issued mid-session:** an earlier commit (`42c952d`) wrongly characterized Susanna's active Daniel 13:65 and Baruch 3:38 as "stray empty verse bugs." They are NOT bugs — `greek-daniel-drb-addition-source-address-policy.json` (already existing, dated 2026-06-28) documents Daniel 13:65 as a deliberate, policy-governed DRB-only address (real content in DRB; NRSV/KJV/NABRE correctly absent pending an approved NRSV source witness). Corrected in the next commit (`94e8347`). Baruch 3:38 has NOT been independently re-checked against an equivalent policy file — don't assume it's a defect without checking first.

**Major discovery, real follow-up work, not yet done:** this project already has extensive 2026-06-28 registry documentation (`data/bible/registry/greek-daniel-*`, `greek-esther-*`, `judith-bound-source-exact-collation-result.json`, `tobit-bound-source-exact-collation-result.json`, `wisdom-bound-source-exact-collation-result.json`) recording detailed, carefully-derived KJV address mappings — but against the OLD 1611 source. The 1769 switch is correct per Josh's decision, but it makes these specific registry files' KJV trust claims stale. `data/bible/registry/kjv-1769-edition-switch-registry-supersession-note.json` records this and lists what's confirmed stale (Judith's collation, now itself superseded by the fresh 2026-07-11/12 Judith work) vs. not yet individually confirmed (Tobit, Sirach, and possibly others — check for a `<book>-bound-source-exact-collation-result.json` or `<book>-source-address-policy.json` before assuming a book's mismatches are simple).

**Triage run across the remaining flagged books (2026-07-12), chapter-by-chapter verse-count comparison against KJVA:**
- **Small, tractable (1-5 chapters differ, by 1-3 verses each) — next up:** 1 Esdras (ch.2, ch.9), 2 Esdras (ch.4,11,12,14,15), 1 Maccabees (ch.1,12,13), 2 Maccabees (ch.2,12,15), Wisdom (ch.2,5,6,9,11).
- **One self-contained oddity:** Prayer of Manasseh — KJVA stores the ENTIRE prayer as a single unsegmented verse; the app splits it into 15. Needs one full-text split (short, bounded).
- **Much larger scope, deliberately deferred, needs its own dedicated session:** **Sirach (49 of 51 chapters differ)** and **Tobit (all 13 populated chapters differ)**. Not a few local quirks — likely reflects real underlying-text-tradition differences (Sirach's famously unstable transmission-history versification; Tobit's two substantially different ancient Greek recensions, which may differ in actual content, not just numbering). Do NOT attempt to fold these into the "small batch" — triage them with fresh attention, likely needing a different strategy than simple boundary-remapping.
- **5 single-verse NT cases, not yet resolved:** 3 John 1:15, Acts 10:49, John 6:72, Mark 8:39, Revelation 12:18. Revelation 12:18 is confirmed to be the same chapter-boundary-shift pattern as Judith 15/16 (= KJVA's 13:1) — the other four not yet checked, but likely the same category.

**Small batch — COMPLETE, 2026-07-12 (commits `5c1d01f`, `00eb5c0`, confirmed on `origin/main`).** 1 Esdras, 2 Esdras, 1 Maccabees, 2 Maccabees, and Wisdom all needed **zero KJV changes** — every chapter-count difference the triage flagged turned out to be either an already-correctly-blank trailing verse (same `allowedAbsence` pattern as Daniel 13:65), a numbering gap in the app's own schema unrelated to translation content (2 Esdras ch.4/11/12/15 skip a verse number outright), or a single extra KJVA verse the active file has no slot for at all (2 Esdras ch.14). The original mechanical bulk-replacement pass had already gotten all of these right; none had Judith ch.16's hidden-drift problem. Prayer of Manasses needed one genuine fix: KJVA stores the whole prayer as a single unsegmented verse, split into the app's existing 15-verse structure at content-verified boundaries (exact round-trip check confirmed, no words lost/duplicated).

**5 flagged NT single-verse cases — COMPLETE, 2026-07-12 (commit `00eb5c0`).** 3 John 1:15, Acts 10:49, John 6:72, Mark 8:39: all confirmed genuinely absent from KJVA, no hidden chapter-boundary shift (checked each case's next-chapter opening verse; none matched, unlike Judith's case) — already correctly left blank, no changes needed. Revelation 12:18/13:1: KJVA merges what NRSV treats as two distinct verses into one continuous KJV verse — split at the matching clause boundary. **Worth flagging honestly: the first attempt at this wrote the full merged KJVA text into BOTH active verses (a real duplication error), caught only by re-reading the written result before committing, not by any automated check.** Standing lesson reinforced yet again: always re-read what was actually written, not just trust that a script ran without error.

**Sirach and Tobit — COMPLETE, 2026-07-12 (commit `52eeb0d`), turned out NOT to need the dedicated deep-dive this note previously predicted.** The "49 of 51 chapters differ" (Sirach) and "all 13 populated chapters differ" (Tobit) figures were raw chapter/verse-COUNT comparisons only, made before checking content — the same mistake the small-batch triage had already taught us to avoid for the other five books, temporarily forgotten because these two books' raw counts looked categorically worse. Direct verse-by-verse content comparison at offset 0 across every chapter of both books found **zero non-blank mismatches anywhere** — every apparent difference was a benign, already-correctly-blank trailing verse (KJVA's Apocrypha is measurably shorter than this corpus's NRSV base in both books). Neither book had anything resembling Judith's chapter 16 hidden-drift problem. One unrelated real defect found and fixed along the way: Sirach 44:23 (an address KJVA has no equivalent for) still carried stale, never-touched content from before this whole KJVA migration — the old unstripped `"44:23 "` prefix bug plus 1611-era spelling, missed by every previous pass because no KJVA key ever existed there to trigger an overwrite. Blanked to match the same allowedAbsence convention used everywhere else.

**This closes out the entire corpus-wide KJV 1769 edition-switch effort.** Every book across OT, Apocrypha, and NT has now been individually content-verified against KJVA, not just mechanically replaced. Full effort summary: Genesis (redone), 74 straightforward books, Baruch, Letter of Jeremiah, danielGK.json (+3 new standalone files), estherGK.json (+1 new standalone file), Judith (real hidden-drift fix), the small batch of 5 books (all needed nothing) + Prayer of Manasses (real split), 5 NT single-verse cases (1 real fix — Revelation 12:18/13:1), and finally Tobit + Sirach (both needed nothing beyond one stray defect). `documentation/kjva-source-witness-intake.json` and `documentation/BIBLICAL_REMEDIATION_METHODOLOGY.md` §1/§2/§10 hold full provenance and methodology; `data/bible/registry/kjv-1769-edition-switch-registry-supersession-note.json` records which pre-existing 1611-based registry files are now stale.

**Standing lesson from this whole effort, worth internalizing for every future book/translation:** chapter/verse-count mismatches against a reference source range from "nothing to do, already correct" (most books this effort touched) to "silently wrote wrong content, would have gone undetected without content-level re-verification" (Judith ch.16, Revelation 12:18 first-attempt). Never trust a count match OR a count mismatch at face value in either direction, and never trust a script's own "changed: N, missing: 0" self-report — always independently re-verify the written output against source content at multiple points. An automated proportional/word-count alignment approach was tried and explicitly rejected mid-session (piloted on Tobit ch.1, found to silently drift by one verse-position almost immediately) — this class of shortcut is not safe for scripture text at this project's accuracy bar; every fix in this whole effort was ultimately confirmed by direct content comparison, never by automated inference alone.

## Architecting the next decision, 2026-07-12 — read this before picking a next task

**What this KJV effort actually changed about the remaining scope, worth internalizing:** the original plan was "one book at a time, all five translations together" (Genesis → Exodus → ...). This cross-cutting KJV project inverted that — one translation, the whole corpus at once — and the practical effect is that **KJV is now pre-solved for nearly every book already in the corpus** (OT protocanon, most Apocrypha, all NT). That means future per-book passes (Exodus and onward) have a meaningfully smaller remaining scope than Genesis's own session implied: NRSV/DRB/NABRE/Rotherham verification per book, not five translations from scratch. Worth confirming with Josh whether that changes how future books should be scoped/estimated.

**Two live options for what comes next, not yet decided — needs Josh's direction, not a unilateral pick:**

1. **Resume the original sequence: Exodus, full multi-translation remediation** (KJV already done as of this effort — just needs NRSV/DRB/NABRE/Rotherham verified against source, same method as Genesis). Lowest-risk, keeps momentum on the original plan, but doesn't yet know whether Exodus will surface a similarly large cross-cutting opportunity for another translation.

2. **Run one more cross-cutting pass on a different translation before returning to book-by-book** — the KJV effort's own numbers make a real case for this: most books needed *zero* fixes once a good source existed and was checked properly, meaning a similar audit-only pass (check first, fix only where real problems surface, per §10's triage-before-fixing discipline) on DRB, NABRE, or Rotherham across the whole corpus could plausibly reveal the same thing — most of it already fine, with the real remaining work concentrated in a handful of specific books/chapters, the same shape this KJV effort turned out to have. This is speculative until actually tried, but the KJV precedent is a real, current-session data point suggesting it's worth trying before assuming book-by-book is the efficient path.

**If cross-cutting is chosen, apply everything learned this session from the start, not re-derived click by click:**
- Confirm source edition identity on a landmark verse before trusting anything (§1).
- Triage by raw count first, but never stop there — content-check at offset 0 before assuming a count mismatch means real work is needed (this session's single biggest efficiency-vs-accuracy lesson: 6 of 8 flagged books across the whole effort needed nothing at all once content was actually checked).
- Watch specifically for the Judith ch.16 failure mode: a chapter/section boundary placed differently between source and active file, which can make an automated pass silently write *wrong* content while self-reporting clean. Spot-check multiple points per chapter, not just start/end.
- Do not use automated proportional/statistical alignment for verse-boundary splits — rejected this session as unsafe for scripture text; every real split (Daniel's Azariah merge, Judith 16:7/8, Revelation 12:18/13:1, Prayer of Manasses) was solved by direct content comparison.
- Watch for stale leftover content at addresses a new source doesn't cover (Sirach 44:23's case) — these can hide older un-related bugs (like the KJV prefix-pollution defect) that never got touched because no source key ever triggered a rewrite.
- Standalone-file splitting (Daniel's Susanna/Bel/Azariah, Esther's Additions) is a one-time architecture decision already made and executed — confirmed via direct search that no other combined-canon files in the corpus need the same treatment, so this isn't recurring work.

**Immediate next action for whoever picks this up:** ask Josh which of the two options above he wants, rather than assuming either one.

## Assessment for "the other account," 2026-07-12 — should DRB/Rotherham get the same corpus-wide treatment as KJV?

Josh asked whether the other public-domain translations warrant the same cross-cutting audit KJV just got. Checked both sources directly before recommending:

**DRB (Douay-Rheims)** — the source already in active use project-wide, `janvier-s/original-douay-rheims` (77 books, complete Vulgate canon incl. all deuterocanon), is comprehensive and its edition was already correctly identified early in this project (genuine 1610 original, not the Challoner/DRC revision). Registry files surfaced *during this session's own investigation* (`judith-bound-source-exact-collation-result.json`, `greek-daniel-drb-addition-source-address-policy.json`, Esther's collation result) already show DRB as `trusted_exact_source_collated` for Judith, Daniel, and Esther from 2026-06-28 work — meaning a fresh corpus-wide DRB pass is worth doing but likely has a **smaller expected payoff than KJV's did**: there's no equivalent forcing-function defect (like KJV's stuck-on-1611-spelling problem) driving it, and it may turn out to look more like Tobit/Sirach (mostly already fine) than like the real fixes KJV needed.

**Rotherham — a genuine find, worth prioritizing.** The XML Josh supplied (`Rotherhams Emphasized Bible (1902).xml`, in `data/kalendar/source-witnesses/`) was already confirmed OCR-degraded earlier this session (missing the emphasis-dashes that are this translation's whole defining feature). But `scrollmapper/bible_databases`'s `formats/json/Rotherham.json` — same clean Sword Project provenance as KJVA — **does** have the emphasis-dashes intact, confirmed directly (Genesis 1:2: `"darkness,—but, the Spirit of God, was brooding"`, correctly punctuated). This is a real upgrade over the ad-hoc web-verification (studylight.org/studybible.info) Rotherham has relied on so far. Scope-bounded: 66 protocanonical books only, Rotherham never covered the Apocrypha historically, so this can only ever touch a fixed, known set of files.

**Recommendation, ACTIONED 2026-07-12 (commit `981ad2d`, confirmed on `origin/main` at `37be704`).** Rotherham done, corpus-wide, all 65 mapped protocanonical books (Rotherham never covered the Apocrypha historically — 66-book scope is complete as-is). Triage first, same discipline as everywhere else this session: raw comparison showed 6,215 "mismatches" across 65 of 66 books, but direct inspection found 98.4% (6,117) was pure leading/trailing whitespace noise, not real content — only 98 genuine differences existed. Applied full-column replacement anyway (worth doing, unlike Tobit/Sirach's no-op, since real differences existed in a meaningful minority of verses): 6,233 verses updated, zero mismatches on independent re-verification. The 5 known boundary-quirk NT addresses (3 John 1:15, Acts 10:49, John 6:72, Mark 8:39, Revelation 12:18) were checked directly against Rotherham's own chapter structure — no hidden problem like KJV's Revelation case, correctly left blank.

**DRB — SURVEYED 2026-07-12, real fix work needed, NOT yet actioned (budget ran out this session).** Pulled `janvier-s/original-douay-rheims` fresh (77 USFM files, full Vulgate canon incl. all deuterocanon — mapping table for whoever continues: `1-kings`=1 Samuel, `2-kings`=2 Samuel, `3-kings`=1 Kings, `4-kings`=2 Kings, `1/2-paralipomenon`=1/2 Chronicles, `1-esdras`=Ezra, `2-esdras`=Nehemiah, `3/4-esdras`=the apocryphal books KJV calls 1/2 Esdras, `abdias`=Obadiah, `aggeus`=Haggai, `osee`=Hosea, `micheas`=Micah, `habacuc`=Habakkuk, `sophonias`=Zephaniah, `zacharias`=Zechariah, `malachie`=Malachi, `isaie`=Isaiah, `jeremie`=Jeremiah, `ezechiel`=Ezekiel, `josue`=Joshua, `jonas`=Jonah, `canticle-of-canticles`=Song of Solomon, `apocalypse`=Revelation, `ecclesiasticus`=Sirach, `tobias`=Tobit).

**USFM parsing note for whoever continues:** must strip `\f + ... \f*` (footnotes), `\x + ... \x*` (cross-refs), `\sc...\sc*` (small-caps markup), and `<alt>...</alt>` tags before comparing — a first-pass survey that only stripped footnotes/cross-refs found 1,722 "mismatches," which dropped to 447 once `\sc`/`<alt>` stripping was added. **This is the same noise-vs-defect lesson as Rotherham's whitespace issue and Tobit/Sirach's count-only triage — don't trust a raw diff count without confirming what's actually causing each flagged difference first.**

**Real, remaining 447 mismatches after proper normalization — genuinely concentrated in the NT** (Luke 59, Romans 59, Matthew 55, Acts 53, Hebrews 50, Mark 25, 1 Corinthians 20, John 17, 2 Corinthians 12, 1 Peter 10, Galatians 9 — plus smaller OT outliers: Haggai 23, Song of Solomon 12, Jonah 10, Hosea 9). This tracks with the registry finding earlier this session that DRB's OT/deuterocanon books (Judith, Daniel, Esther) were already `trusted_exact_source_collated` from 2026-06-28 work — the NT apparently never got the same treatment. **Not yet spot-checked for content vs. further noise** (e.g., possible remaining unstripped markup, or a genuine wording-variant pattern like Genesis's DRC-vs-original-DRB near-miss) — that's the very next step before any fix, per this whole session's standing lesson: characterize what's actually different before writing anything.

**If picking this up fresh:** the parser and mapping table above are ready to reuse directly (don't re-derive). Characterize a handful of the NT mismatches by content first (same method as the John 1:1/1:14 spot-check that caught the `\sc`/`<alt>` issue) before assuming this needs the same corpus-wide full-column-replacement treatment as KJV/Rotherham — it might, but confirm the diagnosis before treating it as a known quantity.

**Status as of this note: KJV and Rotherham are both fully corpus-wide verified. DRB's triage is done (447 real mismatches found, concentrated in NT) but the fix itself is not yet done — that, plus Exodus's full remediation (or another cross-cutting pass), are the live next-steps. Still needs Josh's direction on which to pick up first.**

## Session, 2026-07-12 continued — DRB: the 447 figure was investigated, does not reproduce, corrected to zero. Josh chose DRB first.

**HANDOFF — read this first if picking up fresh.** DRB is now CLOSED, zero fix needed. Full detail and verification method in `AUDIT_GOVERNANCE_LEDGER.md`'s "DRB corpus-wide fix, session 2026-07-12" entry — read that before assuming anything about DRB's state.

Per the two live options in the section above, Josh chose DRB. Per this project's own standing rule (never start a fix from a carried-forward count without re-deriving it), the very first step was rebuilding the comparison from scratch rather than trusting the 447 figure — and it didn't reproduce. **Zero real mismatches across all 27 NT books; the reported 447 was a parser artifact** (a marker-stripping bug — demonstrated, not just suspected, by deliberately reproducing the bug shape and getting 183/110 false mismatches in Luke/Romans alone from it). The 58 real mismatches found elsewhere (Haggai, Song of Solomon, Jonah, Hosea) are all clean, complete Vulgate-vs-modern chapter-boundary shifts — the same failure class as Judith 15/16 and Revelation 12:18 in the KJV effort — with every word accounted for on both sides. **DRB needs no fix anywhere in this survey's scope.**

`AUDIT_GOVERNANCE_LEDGER.md` and `audit-ledger.html` updated to reflect this (SEED_VERSION bumped to `v90-2026-07-12-drb-447-mismatch-figure-corrected-to-zero`, dashboard script `node --check`ed clean, `git diff --stat` confirms only the ledger + dashboard changed — no bible data files touched, since none needed it).

**Immediate next action for whoever picks this up:** DRB is closed. The remaining live choice is the same one Josh hasn't picked yet between: (1) resume Exodus's full multi-translation remediation (KJV already done corpus-wide; NRSV/NABRE/Rotherham verification needed per the Genesis method; DRB now also pre-cleared corpus-wide, same as KJV/Rotherham — so Exodus's remaining scope is smaller than Genesis's was), or (2) some other cross-cutting pass. Ask Josh before starting either.

**Standing lesson reinforced this session, worth repeating for whoever reads this next:** a resume note's own numeric claims are not ground truth, even when specific and precise-looking (447, broken down by book, is a very convincing-looking number). Re-derive before fixing, every time — this cost nothing this session and caught a real, would-have-been-wasted-effort error before any bible data was touched.

**Source locations for whoever implements this:**
- Rotherham: `scrollmapper/bible_databases`, `formats/json/Rotherham.json` — same sparse-checkout technique as KJVA (`git clone --filter=blob:none --no-checkout`, then `git sparse-checkout init --no-cone` with the exact path in `.git/info/sparse-checkout`, then `git checkout` — a plain clone or cone-mode sparse-checkout of this repo will time out, confirmed twice this session).
- DRB: already cloneable directly, `janvier-s/original-douay-rheims`, USFM format, one file per book (Vulgate naming — e.g. `1-paralipomenon.usfm` = 1 Chronicles, `4-kings.usfm` = 2 Kings, `3-esdras.usfm`/`4-esdras.usfm` = the books KJV calls 1/2 Esdras).

## Session, 2026-07-12 continued — Exodus: KJV/DRB/Rotherham clean, NRSV fixed, and a corpus-wide NABRE finding much bigger than one book

**HANDOFF — read this first if picking up fresh.** Exodus is NOT closed. Four of five translations are clean; NABRE is confirmed still broken, same as it was before this tranche. More importantly, **this tranche surfaced a corpus-wide finding affecting up to 29 OT books, not just Exodus** — read the next paragraph before doing anything with NABRE on any book.

Josh chose Exodus over the wider NABRE investigation initially, then — once Exodus's own NABRE defect turned out to trace to the same 2026-06-21 Lucy commit as Genesis's — chose to widen the check rather than stay narrowly scoped. That was the right call: **29 of the 37 OT books touched by that commit still carry live chapter-heading pollution**, and the `bible-corpus-trust-status.json` registry's claim that this was mechanically cleaned (certified 2026-07-04, one day before Lucy's dismissal) is now independently disproven, not just presumed void by governance policy. Full list of affected books, method, and the registry annotation are in `AUDIT_GOVERNANCE_LEDGER.md`'s "Exodus remediation, session 2026-07-12" entry — read that in full before touching NABRE on any book, since the fix method (dash-anchored title extraction against `nabre.json`, false-positive-exclusion discipline) is already proven and shouldn't be re-derived.

**What's actually done this tranche:**
- Exodus KJV: verified clean against KJVA, zero mismatches.
- Exodus Rotherham: verified clean against scrollmapper source, zero mismatches.
- Exodus DRB: verified clean against original-douay-rheims, zero mismatches (one benign pre-existing blank-verse pair at 40:37-38, confirmed intentional).
- Exodus NRSV: **fixed**, 108 of 1213 verses corrected against `NRSV-CI.SQLite3` (now committed to the repo, no longer sandbox-local — check `data/kalendar/source-witnesses/NRSV-CI.zip` before assuming Josh needs to re-supply it). Two of this session's own parsing bugs caught before trusting results: `<t>` poetic-line tags were being stripped along with their content (manufactured 20 false mismatches across the whole Song of the Sea, Exodus 15:2-17); nested-quote spacing was flagged as content difference across dozens of verses. **Also caught: Exodus 22:1-4 initially looked like 4 mismatches but the app was already correct** — NRSV-CI stores that specific well-documented passage in an internal Hebrew-verse sub-order with its own footnote apparatus, not the published English order; confirmed via three independent published NRSV sources before excluding it from the fix. A naive full-column replacement would have corrupted an already-correct passage.
- Exodus NABRE: confirmed still broken (same defect as Genesis's pre-fix state), not yet fixed — deliberately left for the wider decision below rather than fixed in isolation.

**What's NOT done, and needs Josh's direction:** whether to fix all 29 confirmed-polluted books as one cross-cutting NABRE-heading pass (closer in shape to the KJV 1769 effort than to book-by-book), or fix Exodus's NABRE now and continue book-by-book, deferring the other 28. Either way, the 8 books with no detected chapter-opener pattern (Amos, Habakkuk, Joel, Lamentations, Micah, Obadiah, Proverbs, Zephaniah) still need a bare-title-pollution check (Genesis's "Warning of the Flood." pattern) before being called clean — they are unchecked for that pattern, not confirmed clean.

**Standing lesson reinforced twice this tranche:** both major catches this session (the Song-of-Sea `<t>`-tag bug and the 22:1-4 reordering) were found by querying the raw source directly and cross-checking against independent published text rather than trusting a diff's first output. Neither would have been caught by re-running the same comparison twice — they required looking at the actual source data, not just the diff summary.

## Session, 2026-07-12 continued — NABRE cross-cutting pass: 617 verses fixed, 125 residual, three regex bugs caught before committing

**HANDOFF — read this first if picking up fresh.** Josh chose the cross-cutting NABRE pass over book-by-book. It's NOT complete — 617 verses across 36 files are fixed and verified, but a genuinely different, harder pollution shape affects 125 more verses across 27 books (Isaiah worst at 42) that this session deliberately did not attempt, because it lacks the reliable punctuation anchor (a literal dash) that made the first two rounds safe. Read `AUDIT_GOVERNANCE_LEDGER.md`'s "NABRE cross-cutting header fix" entry in full before touching NABRE again — it documents three successive "final" patterns, each one caught with a real bug by verification before being trusted, and the residual scope this leaves.

**Why this took three rounds, worth internalizing before extending this work:** the first pattern (proven on Genesis) required a period between an optional Roman-numeral division title and "Chapter N" — but most titles run straight into "Chapter N" with no such period, so the first pass silently under-fixed nearly every book it touched, something only caught by a broader validation check run *before* writing up documentation, not after. The second attempt over-corrected by matching the first hyphen anywhere after "Chapter N," which grabbed hyphens inside compound words and number ranges (corrupting Isaiah 7:1's "Syro-Ephraimite" mid-word). The third attempt anchored strictly on `" - "` (space-hyphen-space) and additionally learned to consume an optional subtitle-with-its-own-period after the dash — this one passed five separate structural checks (short-result, exact-prefix, sane-leading-character, no-leftover-subtitle) and is what actually got applied.

**What's fixed and verified:** 617 verses across 36 files, zero non-NABRE lines touched (confirmed via `git diff --numstat`: exactly 617/617, and via grep that every changed line contains `"NABRE"`).

**What's NOT fixed, on purpose:** 125 verses across 27 books using a third pollution shape with no dash separator at all (e.g. `"Chapter 2 And Hannah prayed..."`, `"II. The History of David Genealogy of Saul. Jeiel..."`). Without a punctuation anchor, distinguishing a genuine short editorial title from an ordinary short sentence requires either much more sophisticated heuristics or manual review — the same false-positive risk already demonstrated twice this session (a naive attempt flagged Habakkuk 1:8's genuine verse text, "Swifter than leopards are their horses...", as a fake header candidate). **Do not reuse either of this session's two working patterns on this residual set — they won't match it, and a naive extension is likely to repeat the over/under-matching mistakes already caught here.**

**No book is fully NABRE-clean except Genesis.** Exodus specifically: 40 of 44 detected instances fixed, 4 residual (2:23, 7:8, and 2 more) — closer to done than most, but not closed.

**Immediate next action for whoever picks this up:** decide whether to (a) attempt the harder, dash-less residual pattern with much more careful per-verse validation (likely needs individual review, not a single regex), (b) return to book-by-book sequence (Exodus's own remaining 4 verses, or move to a new book, leaving the residual NABRE pollution as a known gap), or (c) something else. This is a real decision, not a default — ask Josh.

## Session, 2026-07-12 continued — NABRE residual CLOSED, all 125 verses resolved, corpus-wide zero pollution

**HANDOFF — read this first if picking up fresh.** Josh said to proceed rather than stop at the residual. It's done: **NABRE cross-cutting project is fully closed.** 742 verses corrected total (617 + 125), zero remaining chapter-heading/section-title pollution anywhere in the 37 OT books this touched, confirmed by the same comprehensive scan that found the original 125. **Exodus is now fully clean across all five translations** and moved to green on the dashboard — the same "zero known open defects" standard Genesis uses.

**What actually happened with the "residual":** it turned out not to be a genuinely different, unanchored pollution shape after all — it was two straightforward gaps in the already-correct dash-anchored approach. (1) Some section-break headers have no "Chapter N" marker at all (pure Roman-numeral mid-chapter divisions), and the pattern required that literal string. (2) Some chapter-opener titles sit directly between "Chapter N" and the dash with no Roman-numeral prefix, a shape the pattern's structure didn't allow for. Generalizing to require only "Roman numeral OR Chapter N (or both)" before the mandatory `" - "` anchor resolved 94 of 125 immediately, then loosening further (allowing Roman-numeral-only headers) resolved 28 more. The same five structural checks used throughout this whole project (short-result, exact-prefix, sane-leading-character, no-leftover-subtitle) were run after every attempt — one flagged case (Habakkuk 3:1) turned out to be a correct result the check was too cautious about, and worth verifying by hand rather than assuming the check is always right in either direction.

**The last 3 verses (1 Samuel 2:1, Isaiah 66:1, Jeremiah 4:1) caught a genuine bug in the generalized pattern** — its optional subtitle-consumption over-matched onto real verse content that happened to be short and end in a period (e.g. "And Hannah prayed: 'My heart exults in the LORD...God.'" is real narrative, not a title). The exact-prefix check caught this before anything was applied — the extracted header didn't match the app's text because of an unrelated LORD/Lord casing difference, and chasing that mismatch down surfaced the real bug. Fixed with a simpler no-subtitle pattern for just these three, re-verified, applied.

**Used `bible.usccb.org` (the actual official NABRE host) as a cross-reference early in this session**, fetching a couple of chapter pages to confirm the header/content boundary structure independently before trusting the existing `nabre.json`-derived approach further — this wasn't needed for the actual fix (the existing polluted-but-dash-consistent source was sufficient once properly generalized), but it was valuable for building confidence before committing to keep extending the same method rather than switching to a slower per-verse fetch campaign.

**Final numbers:** `git diff --numstat` for this residual pass: 125 insertions / 125 deletions across 27 files, matching exactly. Zero non-NABRE lines touched anywhere across the whole NABRE effort (both sessions), confirmed by grep. All touched files re-validated as JSON. `bible-corpus-trust-status.json` updated again — the originally-false certification claim is now, separately and for real, true, and the registry records both facts rather than erasing the history.

**What's actually left in the project now:** the two live choices are the same as before this whole NABRE detour started — (1) resume Exodus... except Exodus is now closed, so this becomes "move to the next book in the Genesis-through-Revelation sequence" (Leviticus), or (2) something else Josh directs. Ask before assuming.

## Session, 2026-07-12 continued — Leviticus: all five translations verified and fixed, book fully clean

**HANDOFF — read this first if picking up fresh.** Leviticus is CLOSED, same standard as Genesis and Exodus (zero known open defects across all five translations). Next book in sequence is Numbers.

**What happened, briefly (full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s "Leviticus remediation" entry):** KJV, Rotherham, DRB all confirmed clean (zero mismatches). NABRE headers were already clean from the corpus-wide 742-verse effort, but a full content-level re-check (not just headers) found the same "Lord 's" stray-space bug from Genesis recurring here — 18 instances, plus one em-dash-spacing variant, fixed by direct pattern substitution. NRSV had 149 real content differences against NRSV-CI, verified against two independent published sources before trusting the pattern, then fixed via targeted per-verse replacement.

**Pattern worth carrying into every remaining book:** all three completed books so far (Genesis, Exodus, Leviticus) show the same shape — KJV/Rotherham/DRB are a formality (already clean from the corpus-wide passes), NRSV is the real content-fix workload every time (Genesis 389, Exodus 108, Leviticus 149 verses), and NABRE needs a full content-level check, not just a header-pollution check, since the stray-space bug isn't Genesis-only — it just hasn't been checked for elsewhere yet. **Recommend explicitly checking every future book's NABRE column for the "Lord 's" / stray-space-before-punctuation pattern, not just chapter headers**, since this session found it silently sitting in a book that had already passed the header check clean.

**Immediate next action for whoever picks this up:** Numbers is next in sequence, following the exact same five-translation method. No open decision needed unless Josh wants to redirect.

## Session, 2026-07-12 continued — Numbers: all five translations verified and fixed, book fully clean; one real mistake self-caught along the way

**HANDOFF — read this first if picking up fresh.** Numbers is CLOSED, same standard as Genesis, Exodus, and Leviticus. Next book in sequence is Deuteronomy — worth knowing before starting: Deuteronomy is already flagged red on the dashboard from an earlier, unrelated audit ("unresolved tension" re: Installment 12's zero-mismatches claim), so it may need extra care reconciling that old flag with fresh five-translation verification, not just a repeat of the last four books' method.

**What happened, briefly (full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s "Numbers remediation" entry):** KJV and Rotherham clean as usual. DRB clean, with a genuinely useful discovery — this project already has a 2026-07-02 governance registry (`canonical-ot-drb-active-row-source-shape-blockers.json`) that documents, project-wide, exactly the situation found in three Numbers chapters (13, 20, 30): real DRB content with no active-grid address at all. The registry's Numbers entry lists the identical three addresses independently found this session. **Worth checking this registry directly for every future book before treating a DRB chapter-count mismatch as a new finding** — it may already be catalogued.

**A real mistake happened and was caught, worth being honest about.** While fixing NABRE stray-space variants, a regex was applied across the whole file without checking each match against source individually first — it briefly "fixed" a verse (21:18) that wasn't actually broken (the source has a deliberate space at that exact spot). Caught by going back and verifying all four latest changes individually against source before moving on, and reverted before anything was committed. **Standing lesson: pattern-matching a fix across a whole file without per-instance verification is exactly the mistake this project's whole discipline exists to prevent, and it can still happen on a small scale even after it's worked correctly dozens of times in a row.**

**NRSV had an unusually large fix this time — 555 of 1288 verses, the biggest single-book NRSV correction so far.** This got extra scrutiny before trusting it (checked chapter distribution for a parsing-bug signature, found none — differences were spread evenly, not concentrated like Genesis's contamination range) and traced to two real causes: a formulaic census-list phrase repeated for every tribe across multiple census chapters ("their lineage, in their clans" vs. the app's "their lineages, by their clans"), and a separate spurious-trailing-quote-mark bug in chapter 33's itinerary list. **A large change count is not itself a red flag — the right response is to characterize it, not shrink from it.**

**Immediate next action for whoever picks this up:** Deuteronomy is next, but check its existing red-flag history in the ledger/dashboard before assuming a clean start — it may need reconciling with the earlier Installment 12 tension noted for it, not just a fresh five-translation pass.

## Governance decision, 2026-07-12 — Living Oracles integration timing, decided by Josh

**Decided:** Living Oracles will be integrated into the active Bible corpus as a selectable translation, but not yet. Integration is deferred until the current book-by-book audit-and-fix effort (Genesis → Revelation, currently at Numbers, next up Deuteronomy) is complete across the whole existing five-translation corpus (KJV/DRB/NRSV/NABRE/Rotherham).

**Why this sequencing, for whoever picks this up:** the verification already done (see the "Living Oracles standalone corpus" entry above and in `AUDIT_GOVERNANCE_LEDGER.md`) confirms the corpus itself is credible — that work does not need to be repeated. What's being deferred is the *integration* work specifically: schema changes, resolver wiring, translation registry updates, and UI selector changes, plus whatever new verse-boundary/versification questions a sixth translation column will surface (this project's standing experience with KJV/DRB/Rotherham/NABRE all found real, translation-specific versification quirks — Living Oracles should be expected to have its own, not assumed clean just because the text itself checked out). Doing that integration work now, mid-audit, would mean auditing a sixth column for every remaining book on top of the existing five — better to finish stabilizing the five-translation baseline first, then add Living Oracles as its own dedicated pass afterward, with the same book-by-book discipline already proven on Genesis/Exodus/Leviticus/Numbers.

**Trigger condition for picking this up:** when the Genesis-through-Revelation five-translation remediation reaches its end (all OT + NT books green, or Josh redirects the project to treat it as "done enough"), Living Oracles integration becomes the next real body of work — not before, and not by default without Josh's go-ahead at that point either, since the exact integration approach (new schema field vs. new file structure, how it's exposed in the UI, whether it needs its own versification-alignment pass against the existing shared verse grid) still needs its own scoping conversation when the time comes.

## Session, 2026-07-12 continued — Living Oracles standalone corpus: independently verified, credible

Per Josh's direction, verified Lucy's delivered `Living-Oracles-NT-Standalone-Corpus.zip` (per the standing "verify before trust" instruction). Full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s "Living Oracles standalone corpus" entry. **Short version: this one holds up.** All structural claims (27 books, 260 chapters, 7,957 verses, zero gaps/duplicates/empty verses/markup leakage) independently re-derived from scratch, not trusted from her own audit report — all confirmed. Edition identity checked against two independent sources (documented distinctive Living Oracles readings, plus a second independent digitization at studybible.info) across 17 verses in 5 books — 17 of 17 exact matches, including an unusual grammatical quirk reproduced identically in both sources, which a fabrication would be unlikely to replicate. Not yet integrated into the live app (`activeBibleCorpusModified: false` in its own manifest) — nothing here changed any live data. **Whether/how to integrate this as a selectable translation is a separate, undecided architectural question** — ask Josh before starting that work, it needs its own scoping (schema, resolver, translation registry, UI).

## Session, 2026-07-13 — Deuteronomy: all five translations verified and fixed, old dashboard flag resolved

**HANDOFF — read this first if picking up fresh.** Deuteronomy is CLOSED, same standard as Genesis, Exodus, Leviticus, and Numbers. This also resolves the old dashboard red-flag ("same unresolved tension as Genesis-tier books") — the resolution came from doing the real audit, not from trusting either the old claim or the old doubt about it, same pattern as Genesis.

**What happened, briefly (full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s "Deuteronomy remediation" entry):** KJV, Rotherham clean as usual. DRB fully clean — notably, for the first time in this whole sequence, zero chapter-count differences at all, not even the usual benign trailing-blank pattern. NABRE had 7 more instances of the familiar stray-space bug (its fourth confirmed book), each individually re-verified against source before applying, per the lesson learned the hard way in Numbers. NRSV had 54 real content differences, spot-verified against five independent published sources before trusting the pattern.

**Next book in sequence: Joshua.** No open decisions carried forward — same five-translation method applies. Worth checking Joshua's dashboard history too before starting, the way Deuteronomy's was checked, in case it carries its own old flag needing reconciliation.

## Session, 2026-07-13 continued — Joshua: all five translations verified and fixed

**HANDOFF — read this first if picking up fresh.** Joshua is CLOSED, same standard as Genesis, Exodus, Leviticus, Numbers, and Deuteronomy. No pre-existing dashboard flag on this one either way.

**One naming gotcha worth carrying forward for every remaining book:** the DRB source repo (`janvier-s/original-douay-rheims`) files some books under their Vulgate names, not their common English names. Joshua is `josue.usfm`. Others already known from the file listing: 1/2/3/4 Kings uses the Vulgate 4-book scheme (`1-kings.usfm` through `4-kings.usfm` — note 1-2 Kings there actually correspond to what's commonly called 1-2 Samuel, and 3-4 Kings correspond to common 1-2 Kings), `1-paralipomenon.usfm`/`2-paralipomenon.usfm` for 1-2 Chronicles, `isaie.usfm` for Isaiah, `jeremie.usfm` for Jeremiah, `ezechiel.usfm` for Ezekiel, `osee.usfm` for Hosea, `abdias.usfm` for Obadiah, `micheas.usfm` for Micah, `nahum.usfm` (same), `habacuc.usfm` for Habakkuk, `sophonias.usfm` for Zephaniah, `aggeus.usfm` for Haggai, `zacharias.usfm` for Zechariah, `malachie.usfm` for Malachi, `ecclesiasticus.usfm` for Sirach, `apocalypse.usfm` for Revelation. **Check the full `ls usfm/` listing before assuming any book is "missing" from this source.**

**What happened, briefly (full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s "Joshua remediation" entry):** KJV, Rotherham clean. DRB clean, with two already-governed exceptions reconfirmed exact-match against the pre-existing registry (same as Numbers). NABRE had 3 more instances of the stray-space bug (its fifth confirmed book). NRSV had 24 real differences, including a genuinely meaningful one — chapter 12's 16-verse list of defeated kings was missing its em-dash separators entirely, turning a formatted list into a confusing run-on. Verified against an independent citation before trusting the fix.

**Next book in sequence: Judges.** No open decisions carried forward.

## Session, 2026-07-13 continued — Judges: all five translations verified and fixed

**HANDOFF — read this first if picking up fresh.** Judges is CLOSED, same standard as every prior book. No pre-existing dashboard flag on this one.

**What happened, briefly (full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s "Judges remediation" entry):** KJV, Rotherham clean. DRB clean, with two already-governed exceptions reconfirmed exact-match against the pre-existing registry, same pattern as Numbers and Joshua. NABRE had one instance of a new stray-space sub-variant (space after an opening quote mark this time, not before an apostrophe). **NRSV had a genuinely striking find**: Judges 5:7, part of the Song of Deborah, read "The peasants ceased in Israel" where the real NRSV says "The peasantry prospered in Israel" — confirmed against 8+ independent sources. Worth noting for future books: the app's wrong text happened to match how *several other* translations render this famously difficult Hebrew line, suggesting the NRSV column picked up cross-contamination from elsewhere at some point, not a random error. If a similar pattern shows up again (app's "wrong" NRSV text matching a different translation's wording too closely), it may be worth checking whether that's a recurring contamination vector rather than independent one-off drift.

**Next book in sequence: Ruth.** No open decisions carried forward.

## Session, 2026-07-13 continued — batch mode: Ruth, a real correction to Exodus, and 1 Samuel

**HANDOFF — read this first if picking up fresh.** Per direction, now batching multiple books per session rather than one at a time — full per-book rigor is unchanged, just more books processed per sitting. Ruth and 1 Samuel are newly CLOSED. **Exodus required a real correction** — it was declared fully clean on 2026-07-12, but wasn't. Read on before assuming any "FULLY CLEAN" declaration in this file or the ledger is permanently settled.

**What happened, and why it matters for every future session:** building reusable audit tooling for batch processing led to re-running the NABRE check more carefully, and — critically — re-running it against every *already-closed* book, not just the new one. That surfaced two real, previously-missed defects in Exodus (3:1 missing a whole sentence, 6:1 still carrying a literal "Chapter 6" prefix), both traced via `git blame` to this project's own earlier NABRE cross-cutting commit. The bug: when a chapter-opening verse had no short subtitle, the original header-stripping pattern over-matched onto the real narrative sentence that followed and stripped it too — the exact failure mode this project already knew about and guarded against in *later* rounds of that same effort, but this instance predated those safeguards and the contemporaneous verification pass used the same flawed logic on both sides of the comparison, so it couldn't see its own error.

**A full re-check of all 8 previously-closed books for this exact bug was run before continuing to new books.** Building the right check took real care — a naive "is app's text a suffix of source's text" check has a blind spot (a truncated suffix still satisfies "is a suffix," so over-stripping is invisible to it). The check that worked measured the length of the specific stripped prefix itself: every genuine editorial title found across this whole project has been under ~35 characters, so a much longer stripped prefix is a reliable red flag. Genesis was flagged 20 times by a looser check first; every one was individually confirmed to be a false positive (the header-shape used in Genesis — "Preamble." and other non-numbered major divisions — just wasn't handled by that particular check's regex, but the actual app data has zero raw markup remaining and is genuinely clean). **Only Exodus had the real bug.** Leviticus, Numbers, Deuteronomy, Joshua, Judges, and Ruth were all confirmed clean of it.

**The correction is recorded in place in both the ledger and the dashboard note, not silently overwritten** — the original 2026-07-12 declaration is preserved with a dated correction prepended, consistent with this project's standing practice.

**Also worth carrying forward: reusable audit tooling now exists** at (in the working sandbox, not yet committed to the repo — consider whether this should live in the repo itself for future sessions) `audit_book.py`, with functions for KJV/Rotherham comparison, DRB comparison via USFM parsing, NABRE header/content comparison, and NRSV comparison against NRSV-CI. This significantly sped up Ruth and 1 Samuel's audits. **Book naming gotchas confirmed this session:** KJVA/Rotherham source uses "I Samuel" / "II Samuel" (Roman numerals), not "1 Samuel".

**What's fixed:** Ruth (7 verses: 6 NRSV + 1 NABRE), Exodus correction (22 verses: 2 real content restorations + 9 stray-space, one of those 9 briefly wrong and reverted before shipping — same class of mistake as the Numbers 21:18 incident, caught the same way), 1 Samuel (250 verses: 224 NRSV + 26 NABRE, one of those 26 also briefly wrong and reverted). Every blind regex application in this whole project has now caused at least one near-miss — the lesson bears repeating because it keeps almost happening again: **never trust a pattern-based fix across a whole file without individually re-verifying every single change against source afterward, no matter how many times that pattern has already worked correctly in a row.**

**Next book in sequence: 2 Samuel.** No open decisions carried forward, but per this session's finding, worth periodically re-running the improved NABRE check against older closed books if the tooling improves further.

## Session, 2026-07-13 continued — 2 Samuel, 1 Kings, 2 Kings (three books in one pass)

**HANDOFF — read this first if picking up fresh.** 2 Samuel, 1 Kings, and 2 Kings are all newly CLOSED. Continuing to batch multiple books per session; full per-book rigor unchanged.

**What happened, briefly (full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s "2 Samuel, 1 Kings, 2 Kings" entry):**
- **2 Samuel**: fully clean, no surprises. 95 verses changed (86 NRSV + 9 NABRE).
- **1 Kings**: fully clean. 231 verses changed (212 NRSV + 19 NABRE). One more blind-regex near-miss caught and reverted (14:10 — the third such incident after Numbers 21:18 and Exodus 15:17, same pattern: a stray-space "fix" that wasn't actually needed because the source genuinely has that space).
- **2 Kings**: fully clean, resolved another old unnamed dashboard flag the same way Deuteronomy's was resolved. 264 verses changed (226 NRSV + 38 NABRE). **Found a third instance of the self-inflicted NABRE content-loss bug** (24:1, missing a whole sentence) — same root cause as Exodus and 1 Samuel, same origin commit.

**Running tally on the self-inflicted content-loss bug, worth tracking explicitly going forward:** confirmed in Exodus (2×), 1 Samuel (1×), 2 Kings (1×) — 4 total instances found and fixed so far. Confirmed absent (checked and clean) in Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 2 Samuel, and 1 Kings. Genesis remains confirmed clean (the 20 initial flags there were all false positives from a regex limitation, not the real bug). **Every future book's NABRE audit should include this check** — measure the length of whatever gets stripped from the front of chapter-opening verses; if it's much longer than the ~35-character ceiling every genuine title in this source has stayed under, investigate before trusting it.

**Next book in sequence: 1 Chronicles.** No open decisions carried forward. Per the naming-gotcha notes in `scripts/bible-audit/README.md`, DRB source likely files this as `1-paralipomenon.usfm` — confirm before assuming it's missing.

## Session, 2026-07-13 continued — 1 Chronicles: all five translations verified and fixed

**HANDOFF — read this first if picking up fresh.** 1 Chronicles is CLOSED, same standard as every prior book (zero known open defects across all five translations). Commit `38ec07f` (patch delivered to Josh, verified applying cleanly against a fresh clone of `origin/main` before handoff — confirm via `git log --oneline -5` whether it's landed on the live repo yet, per this file's own standing instruction not to trust a hash without checking).

**What happened, briefly:**
- **KJV, Rotherham** — clean against KJVA/Rotherham (scrollmapper), zero mismatches, no surprises.
- **DRB** — clean against `1-paralipomenon.usfm` (confirmed via `ls usfm/` before assuming, per the standing naming-gotcha note — it was there as predicted). Two chapter-count diffs (11:47, 20:8) were already catalogued in `data/bible/registry/canonical-ot-drb-active-row-source-shape-blockers.json` — confirmed the active rows are correctly blank, matching the governed entry exactly rather than treating it as a new finding.
- **NABRE** — 12 verses fixed. Three were the self-inflicted chapter-opening content-loss bug (9:1, 16:1, 20:1) — same commit-`2e46ca3` lineage as Exodus/1 Samuel/2 Kings, each individually re-verified (stripped prefix was just "Chapter N - " in each case, well under the ~35-char ceiling; missing content ranged 60-190 characters). One `"[ sic ]"` spacing artifact (5:26). One stray-space-after-opening-quote instance (13:6). Seven instances of the standing "Lord 's" stray-space bug. **Running tally on the self-inflicted content-loss bug, updated:** now confirmed in Exodus (2×), 1 Samuel (1×), 2 Kings (1×), 1 Chronicles (3×) — 7 total instances found and fixed. Still confirmed absent in Genesis, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 2 Samuel, 1 Kings.
- **NRSV** — 255 of 942 verses corrected against `NRSV-CI.SQLite3`. Spread across all 29 chapters (no contamination-range signature — checked explicitly before trusting a change count this large, per standing practice). Largest concentration in chapter 6 (30 changes), mostly the standard NRSV genealogical elision pattern ("X became the father of Y, Y of Z" rather than repeating "became the father of"). Independently spot-verified 1 Chr 6:4-14 against two published NRSV sources (Bible Society UK, CCEL) before trusting the pattern — exact match, including the verse 10 parenthetical.

**Diff is exactly 267 insertions/267 deletions (12 NABRE + 255 NRSV), nothing else touched** — confirmed via `git diff --stat`, and the patch was verified applying cleanly against a truly fresh clone of `origin/main` before delivery, per standing workflow.

**Staleness cleanup done this session:** `SESSION_START_SCRIPT.md`'s "Where things stand" section was still dated 2026-07-11 and said Genesis was the only book done with Exodus next — six books stale. Updated to reflect Genesis through 1 Chronicles all closed, next book 2 Chronicles, and pointed to this file for full detail rather than duplicating it.

**Next book in sequence: 2 Chronicles.** No open decisions carried forward. Per the naming-gotcha notes, DRB source likely files it as `2-paralipomenon.usfm` — confirm via `ls usfm/` before assuming.

## Session, 2026-07-13 continued — 2 Chronicles: all five translations verified and fixed

**HANDOFF — read this first if picking up fresh.** 2 Chronicles is CLOSED, same standard as every prior book. Commit `d1dd3b1` (patch delivered to Josh — confirm via `git log --oneline -5` against a fresh clone whether it's landed before trusting this hash).

**What happened, briefly:**
- **KJV, Rotherham** — clean, zero mismatches.
- **DRB** — clean against `2-paralipomenon.usfm`, zero content mismatches and, notably, zero chapter-count diffs at all — the first book since Deuteronomy without even the usual benign trailing-blank pattern.
- **NABRE** — 52 verses fixed. One was the self-inflicted chapter-opening content-loss bug (21:1 — running tally now 8 confirmed instances: Exodus 2×, 1 Samuel 1×, 2 Kings 1×, 1 Chronicles 3×, 2 Chronicles 1×). Ran a full systematic sweep of every chapter-opening verse's stripped-prefix length across the whole book (not just what the audit tool's own regex flagged) to check for anything the pattern-matching might have missed — none found; chapters 1 and 10 have long but genuine Roman-numeral-division-plus-subtitle headers (55 and 79 chars), correctly stripped. The other 51 fixes were the standard "Lord 's" stray-space family. Every one of the 52 was independently re-derived against raw source using a second, differently-written extraction method (not reusing the audit tool's own logic) before trusting it.
- **NRSV** — 283 of 822 verses corrected, spread across all 36 chapters (checked for a contamination signature — none found, this scale is consistent with prior large single-book NRSV corrections like Numbers's 555). **Worth flagging for future books:** the diff included a "temple"→"house" pattern at 2:4-9 that happens to be exactly the kind of place NRSVue (2021) diverges from the 1989 NRSV this project uses — checked against three independent published NRSV sources before trusting it, confirmed genuine 1989 NRSV wording, not an edition mix-up. Worth this same extra landmark-check whenever a "temple"/"house" or similarly NRSVue-flavored difference shows up in a future book's diff.

**Diff is exactly 335 insertions/335 deletions (52 NABRE + 283 NRSV), nothing else touched.** All five translations re-audited after the fix: zero mismatches across the board.

**Next book in sequence: Ezra.** No open decisions carried forward.

## Session, 2026-07-13 continued — Ezra, Nehemiah (batch): a major NABRE versification finding

**HANDOFF — read this first if picking up fresh.** Ezra and Nehemiah are both newly CLOSED. Commits `2dc94ce` (Ezra), `cfd4ee8` (Nehemiah). Nehemiah's fix includes a genuinely new class of finding — read the detail below before assuming any future book's NABRE audit is routine.

**Ezra — straightforward.** KJV/Rotherham/DRB (`1-esdras.usfm`, the Vulgate name for common Ezra) all clean. NABRE: 4 verses fixed, all the standard "Lord 's" stray-space bug — ran the full chapter-opening sweep across all 10 chapters, no content-loss instances. NRSV: 2 of 280 verses fixed — 8:26 was missing NRSV's genuine textual-gap ellipsis ("worth . . . talents"), confirmed against four independent published sources as a real, well-known textual crux, not a formatting artifact; 8:33 had a "Uriiah"→"Uriah" typo.

**Nehemiah — a real structural finding, not just text bugs.** KJV/Rotherham clean. DRB clean; its two chapter-count diffs (3:32, 12:47) were already catalogued in the shape-blockers registry — confirmed matching, not new. NRSV: 1 of 406 verses fixed (5:17, "beside"→"besides").

**NABRE required real investigation.** `audit_nabre` flagged 4 mismatches at (4,15), (4,16), (4,17) that turned out to be self-duplicating garbage, and content at (4,1)-(4,14) that *looked* clean to the tool but wasn't — the tool can't detect a chapter-boundary shift when both sides use the same (wrong) address. Investigated by hand: **NABRE's own official chapter numbering genuinely diverges from the common numbering every other translation uses, at the Nehemiah 3/4 boundary.** Confirmed directly against `bible.usccb.org` (the official NABRE host, fetched live): NABRE's own Nehemiah 3:33-38 is what everyone else calls Nehemiah 4:1-6. NABRE's own "chapter 4" begins at common 4:7, with a clean constant +6 offset for the rest of the chapter (17 raw verses covering common 4:7-23, verified content-for-content). Someone in an earlier population pass had copied NABRE's raw chapter-4 verse-N straight into the app's common-numbered verse-N slot with no offset correction — wrong content at 4:1-14, and 4:15-20 padded out with a duplicate copy of 4:9-14 rather than being properly sourced or left blank. **Rebuilt all 23 verses of chapter 4 from source with the correct mapping** (common 1-6 = NABRE's own 3:33-38, common 7-23 = NABRE's own 4:1-17) — this fits the existing schema exactly (6+17=23, matching the app's own 23-verse allocation), no schema change needed. Re-stripped the chapter-opening header at its true position (common address 7, not 1). Ran the standard chapter-opening sweep across all 13 chapters afterward — no further instances of this or the content-loss bug found.

**Standing lesson, added to `scripts/bible-audit/README.md`:** NABRE's own chapter/verse boundaries can genuinely differ from the common numbering this app's grid uses. If a future book's content at consecutive addresses reads like two spliced-together scenes, or a chapter's raw verse count doesn't match how many common-numbering verses it should span, check for this specifically — verify against `bible.usccb.org` directly before assuming it's just the usual stray-space or over-stripping bugs. After this fix, `audit_nabre`'s own tool will still report "mismatches" at Nehemiah 4:1-17 forever, by design — it's comparing the app's now-correctly-shifted content against NABRE's own same-numbered but differently-scoped source addresses. That's expected, not a regression; don't re-fix it.

**Diffs:** Ezra exactly 6/6 lines (4 NABRE + 2 NRSV). Nehemiah exactly 16/16 lines (14 chapter-4 remap + 1 stray-space + 1 NRSV). Nothing else touched in either file.

**Next book in sequence: Tobit** (confirmed via USCCB's own canonical order: ...Nehemiah, Tobit, Judith, Esther, 1-2 Maccabees...). No open decisions carried forward.

## Session, 2026-07-13 continued — Tobit: resolves a years-old blocked NRSV/rawText status, all five applicable translations verified and fixed

**HANDOFF — read this first if picking up fresh.** Tobit is CLOSED. Commit `37cec14`. This book had extensive pre-existing tooling and registry files (dated 2026-06-28) that explicitly left NRSV and a "rawText" anomaly blocked — resolved here, not from scratch: read `data/bible/registry/tobit-source-address-policy.json`, `tobit-bound-source-exact-collation-result.json`, and `tobit-text-trust-status.json` (now updated to reflect resolution) before doing anything with a future deuterocanonical book that has similar prior tooling.

**KJV, DRB — clean**, using the already-governed DRB source-address policy (chapter 0 inactive title material; 10:14 has no bound DRB source row, already correctly blank). **Rotherham correctly absent** (never covered the Apocrypha).

**NABRE — 15 verses fixed, a book-specific gap in the earlier corpus-wide effort.** Tobit's NABRE column still had the same chapter-heading pollution bug fixed corpus-wide for the 37 protocanon books — this deuterocanonical book was outside that effort's scope and had never been touched. One address (3:1) needed a manual correction: the audit tool's own regex over-stripped real narrative content ("Then sad at heart, I groaned and wept aloud.") as if it were part of the chapter title — caught by checking the raw source directly rather than trusting the tool's computed value, same discipline as every prior over-stripping catch in this project.

**NRSV — the major finding. Previously explicitly blocked, now resolved.** 168 of 242 verses corrected against NRSV-CI. Dominated by a genuine section-header-pollution pattern specific to this book's NRSV column (editorial subtitles baked into verse text) — confirmed as pollution, not real content, via four independent published NRSV sources showing clean text. Also fixed two literal placeholder-string bugs (1:1, 2:1 held just "1" and "2").

**Two addresses required real judgment, not blind pattern-application — worth internalizing for every future deuterocanonical book:**
- **9:3/9:4** — NRSV-CI's own raw text stores this in an alternate witness's verse order, with a translator's own footnote ("In other ancient authorities verse 3 precedes verse 4") confirming this is a documented textual-tradition feature, not an error. Deliberately excluded from the fix, same precedent as Exodus 22:1-4 — the app's existing standard-order text was left untouched. **This is exactly the kind of case Josh flagged: don't flatten a genuine textual/versification distinction into one "corrected" reading.**
- **10:14 (the old "rawText" dashboard flag from Installment 12)** — confirmed via three independent lines of evidence (KJVA's own chapter 10 ends at v12; NRSV-CI has no row past v13; a pre-existing registry file already classified this address as outside the NRSVA source grid) that no translation has genuine content here — it was a near-duplicate of verse 12's already-correct text. Removed rather than reattributed to a translation name.

**Diff:** 202 insertions/210 deletions across three files (tobit.json itself: 185/186, asymmetric because of the 10:14 field removal). All applicable translations re-audited after the fix: zero real mismatches.

**Standing lesson, not yet generalized:** the NRSV section-header-pollution pattern has only been confirmed in Tobit so far. Check every future deuterocanonical book's NRSV column independently — don't assume this was isolated or that it necessarily recurs.

**Next book in sequence: Judith.** No open decisions carried forward.

## Session, 2026-07-13 continued — Judith: resolves blocked NRSV status, confirms Tobit's header-pollution pattern recurs

**HANDOFF — read this first if picking up fresh.** Judith is CLOSED. Commit `9a9ad29`. Second deuterocanonical book with extensive prior 2026-06-28 tooling — read `judith-source-address-policy.json`, `judith-bound-source-exact-collation-result.json`, `judith-text-trust-status.json` (now updated) before starting a future deuterocanonical book.

**KJV — re-confirmed clean, with an important versification note preserved from the 2026-07-12 KJVA switch (commit 3733a42).** KJVA's own official chapter/verse numbering genuinely diverges from the common numbering (shared by DRB/NABRE/NRSV and this app's grid) at the chapter 15/16 boundary — a naive same-address check against KJVA will always show 9 "mismatches" here (15:14, 16:1-8), and that's expected, not a regression. Verified by hand: the app's content is correct at the shared-grid addresses; all four other translations agree with the placement. **This is exactly the kind of thing to watch for — I almost flagged this as a new bug before checking the git history and confirming it was a deliberate, already-correct fix.**

**Rotherham — correctly absent.** **DRB — clean**, with several chapters (1,2,7,8,10,11,14) showing well-documented Vulgate/Greek recension-length differences, all already correctly blank.

**NABRE — 17 verses fixed**, the same chapter-heading-pollution bug independently confirmed in Tobit — this book was likewise outside the corpus-wide protocanon fix's scope. Checked every address against raw source directly (not just the tool's computed value) per the lesson from Tobit's one over-stripping near-miss — none found here.

**NRSV — 150 of 340 rows corrected, resolving another previously-blocked lane.** Confirms the section-header-pollution pattern first found in Tobit **recurs** — this is now confirmed in two books, though still not assumed universal for the rest of the deuterocanon. One placeholder-string bug (11:1 = bare "11") also fixed. Scanned the full changes list for any Tobit-9:3/9:4-style documented order exceptions before applying in bulk — none found this time.

**Diff:** exactly 167/167 lines (150 NRSV + 17 NABRE). All translations re-audited: zero real mismatches.

**Next book in sequence: Esther / Esther (Greek).** No open decisions carried forward. Given the pattern so far, check for existing prior-tooling registry files before starting, and check the NRSV column for the same header-pollution pattern independently rather than assuming it.

## Session, 2026-07-14 — Esther: plain Esther closed; Esther-with-Additions partially done, NRSV deliberately deferred

**HANDOFF — read this first if picking up fresh. ESTHER IS NOT FULLY CLOSED — do not mark it green.** Commit `fc81c3d`. Three related active files this book: `esther.json` (plain Hebrew, 10 chapters), `estherGK.json` (merged Catholic/Orthodox form, Additions A-F interspersed), `additionstoesther.json` (standalone Additions book, mirrors KJVA's own division). Extensive prior tooling specific to Greek Esther already existed (`greek-esther-source-address-policy.json`, `greek-esther-text-trust-status.json`, `greek-esther-bound-source-exact-collation-result.json`, `deutero-02-greek-esther-tail-nrsv-repair.json`) — read those first.

**`esther.json` — FULLY CLOSED.** KJV, Rotherham, DRB, NABRE all clean. NRSV: 40 of 167 verses fixed (ordinary wording differences, not header pollution this time — spot-verified 5:9 against a dozen sources).

**`estherGK.json` — KJV/NABRE/DRB confirmed clean; NRSV deliberately NOT attempted.** NABRE: 19 verses fixed (same ordinary-chapter header-pollution bug as Tobit/Judith — this deuterocanonical file was outside the corpus-wide protocanon fix). KJV and DRB both re-verified clean using the established Addition-lane mappings.

**Real methodology catch worth internalizing:** verifying Addition D's KJV content, I initially reused DRB's own established offset (+3, since DRB's chapter 15 has a 3-verse preamble before the "third day" scene) — that produced 16 false "mismatches" against KJVA. KJVA's own "Additions to Esther" book does NOT have that same preamble at its own chapter 15; a zero-offset mapping matched perfectly. **The app's data was already correct — my own verification method's assumption was the bug**, from blindly reusing one translation's established mapping for a different translation. Exactly the kind of mistake to keep watching for.

**Why NRSV is deferred, not just slow-walked:** NRSV-CI's own "Additions to Esther" structure (book_number 192) uses a *third* distinct convention — different from DRB's separate appended chapters and KJVA's separate standalone book. It interleaves each Addition directly into the *same* chapter number as its narrative insertion point, using continuous verse numbers. Additions A, B, C, E, F all cleanly append to the end of their host chapter (confirmed by exact verse-count arithmetic). **Addition D does not cleanly append — it *replaces/merges* with chapter 5's own opening two verses**, since both are the same "third day" scene told at different lengths (NRSV's chapter 5 only uses the expanded Greek telling, not both versions side by side). Reconciling this correctly needs careful, dedicated verse-by-verse work, not a formulaic offset. Attempting it under time pressure risked exactly the flattening error this project has been explicitly warned against — deferred to a focused follow-up instead.

**`additionstoesther.json` — not yet started at all.** Needs its own full five-lane audit: KJV/NRSV against KJVA's/NRSV-CI's own "Additions to Esther" books, DRB against `esther.usfm` chapters 11-16, NABRE likely absent (matching the policy already established for `estherGK.json`'s Additions).

**Diffs this session:** `esther.json` 40/40 lines, `estherGK.json` 19/19 lines. Both independently verified.

**Next step: finish Esther before moving to any new book** — specifically, `estherGK.json`'s NRSV (Addition D needs careful dedicated reconciliation; A/B/C/E/F should append cleanly once mapped), then all five lanes of `additionstoesther.json`. Do not mark Esther green until all three files are done.

## Session, 2026-07-14 continued — estherGK.json ordinary-chapter NRSV fixed; Additions' NRSV mapping is more complex than first assumed

**IMPORTANT — the "A/B/C/E/F append cleanly" assumption above was WRONG. Read this before touching the Additions' NRSV lane.** Commit `1cb0e0a`. Fixed the ordinary-chapter (1-10) NRSV lane in `estherGK.json` (40 verses) by copying directly from plain `esther.json`'s already-verified text — safe, since it's the same underlying narrative and same NRSV source.

**Investigating the Additions' NRSV mapping revealed real complexity, caught before any fix was written:**
- **Addition A is a prologue, not a trailing append.** NRSV-CI's chapter 1 places Addition A's 17 verses (Mordecai's dream) FIRST (v1-17), with ordinary chapter 1 content following at v18-39 — the reverse of what a naive "ordinary content, then addition" assumption would produce. Caught by reading the actual verse text (Mordecai's dream vs. Vashti's feast), not by trusting verse-count arithmetic.
- **Addition B is inserted mid-chapter, not appended at the end.** NRSV-CI's chapter 3: v1-13 ordinary, v14-20 Addition B's decree text, v21-22 two more ordinary verses following the decree.
- **Addition E (chapter 8) shows a similar interleaved shape** on initial inspection — not yet fully resolved, doesn't cleanly match the assumed count boundary.
- **Addition C (chapter 4) does appear to be a clean end-of-chapter append**, content-confirmed (v1-17 ordinary matching plain Esther exactly, v18-47 Mordecai's and Esther's prayers).
- **Addition F (chapter 10) not yet content-confirmed**, only arithmetic-checked so far.

**This is the second time this session a formulaic-mapping assumption would have produced wrong content if not caught by reading actual text** (the first was the KJV Addition-D offset false-alarm). Given the real, demonstrated risk, completing the Additions' NRSV mapping is deferred to focused, unhurried follow-up work — each Addition needs its own individual content-verified boundary, not a reused formula.

**Diff this session:** exactly 40/40 lines (ordinary chapters only). No Addition-lane NRSV text touched.

**Next step, unchanged in substance but now more precisely scoped:** for `estherGK.json`, individually content-verify and fix each Addition's NRSV boundary (A, B, definitely need care; C looks safe; D, E, F need confirming) — then move to `additionstoesther.json`'s full five-lane audit. Do not mark Esther green until all of this is done.

## Session, 2026-07-14 continued — ESTHER FULLY CLOSED

**HANDOFF — Esther is now fully closed across all three files.** Commits `9d66376` (estherGK.json Additions NRSV), `7d895f7` (additionstoesther.json). No time pressure this round, so each Addition got the careful, individual verification it needed rather than a deferred/formulaic shortcut.

**estherGK.json's six Additions, each verified by reading actual content, not arithmetic:**
- **Addition A**: NRSV-CI's own row 1 is blank (markup only); real content starts at row 2. Row 12 combines two sentences that the app correctly splits into two verses (11, 12) — preserved that split, supplied correct wording for each half.
- **Addition B**: confirmed genuinely mid-chapter (not a trailing append) — chapter 3 rows 1-13 ordinary, 14-20 Addition B's decree, 21-22 ordinary again.
- **Addition C**: clean append (rows 18-47). The app's entire prior text used archaic "thou/thee/thy" — never actually verified against modern NRSV before now. All 23 needed updating.
- **Addition D**: rows 1-16 directly, as already established last session.
- **Addition E**: rows 13-36 (not 13-37) — row 37 has no equivalent anywhere in DRB's own independently-collated chapter 16 either (confirmed by checking), so this is a genuine minor NRSV-specific granularity difference not represented in the shared 24-verse grid, documented rather than invented a 25th verse.
- **Addition F**: rows 4-14, a clean append, content-confirmed (not just arithmetic-assumed, given the lessons from A and B).

Independently cross-checked the whole reconstruction against a completely different published "Additions to Esther" standalone numbering (Bible Study Tools' NRSA presentation) — zero contradictions despite that source grouping chapters entirely differently.

**additionstoesther.json**: identical structure and content to estherGK.json's Additions (same lettering, same verse counts). KJV and DRB verified clean using the same established mappings. NABRE correctly absent throughout. NRSV: copied the now-verified text directly from estherGK.json rather than re-deriving independently — confirmed both files held the same underlying pre-fix text before copying.

**Esther is now fully clean across all three files — zero known open defects.** Ready to move to the next book (Judith→Esther was the sequence; next up per USCCB's canonical order is **1 Maccabees**). Mark Esther green on the dashboard.

## Session, 2026-07-14 continued — 1 Maccabees, 2 Maccabees (batch): both fully closed

**HANDOFF — read this first if picking up fresh.** Both books CLOSED. Commits `ac3a659` (1 Maccabees), `2845371` (2 Maccabees). Neither book had dedicated prior tooling like Tobit/Judith/Esther — both were simply on the KJVA-edition-switch supersession note's "likely stale, not yet individually confirmed" list, re-verified fresh with current tooling.

**1 Maccabees.** KJV, DRB, Rotherham(absent) all clean. NABRE: 17 verses fixed — the by-now-familiar chapter-heading-pollution bug (this deuterocanonical book was outside the corpus-wide protocanon fix). NRSV: 320 of 924 verses corrected — **third consecutive deuterocanonical book confirming the section-header-pollution pattern** (after Tobit and Judith), plus the same literal placeholder-string bug (1:1 held bare "1"). Independently verified via multiple sources.

**2 Maccabees.** Same clean picture. NABRE: 19 verses fixed — one address (8:11) was a minor stray-space-around-an-em-dash issue, not a header strip, worth noting since it shows the same NABRE audit occasionally catches small formatting bugs alongside the header pollution. NRSV: 201 of 555 verses corrected — **fourth consecutive deuterocanonical book confirming the pattern.** With four-for-four now, this is essentially the expected default for any remaining deuterocanonical book's NRSV column, though each still deserves its own independent check rather than blind assumption.

**Diffs:** 1 Maccabees 338/337 (harmless 1-line JSON-formatting asymmetry, content-verified at zero mismatches); 2 Maccabees exactly 220/220.

## Session, 2026-07-13 — Job: fully closed, two new major structural findings (DRB and NABRE chapter-boundary shifts in the Behemoth/Leviathan section, not previously catalogued anywhere)

**HANDOFF — Job is now fully closed. Not yet committed to origin/main — no push credentials in this session's environment; a patch is being handed to Josh for `git am` application, per the established workflow.**

**KJV, Rotherham:** zero mismatches, both clean as found.

**DRB — MAJOR FINDING, same class of defect as Nehemiah's NABRE chapter-boundary shift, but this time in DRB and specific to the Behemoth/Leviathan section (Job 39:31–41:34 in common numbering).** The Vulgate/DRB source (`original-douay-rheims`) divides this material differently than the common numbering every other translation (and this app's grid) uses: Vulgate ch.39 runs 5 verses longer (through what is common Job 40:1-5, the brief LORD/Job exchange before the second speech), Vulgate ch.40 covers what's common 40:6-24 (Behemoth) *and* common 41:1-9 (the opening of the Leviathan description), and Vulgate ch.41 covers common 41:10-34. The app's data had Vulgate's raw, unshifted verse numbers copied directly into the common-numbered address grid — meaning common 40:1-5 was entirely missing, and everything from common 40:6 onward was systematically mislabeled by a shifting offset (9 verses out of alignment by the end of ch.41). Confirmed content-for-content, not by arithmetic alone: verified the Behemoth-to-Leviathan transition point ("Canst thou draw out leviathan" / DRB's "Canst thou draw out the Leviathan with a hook") sits at Vulgate 40:20, which is common 41:1 — matches exactly against the app's own already-correct KJV column at that address. Rebuilt all 58 verses of common Job 40-41 from a single contiguous Vulgate span (39:31 through 41:25), re-split at the correct common-numbering boundaries (40:1-5, 40:6-24, 41:1-9, 41:10-34) — a clean re-shuffle, no content gap (58 Vulgate verses in, 58 common verses out). Chapter 42's Vulgate/common one-verse difference (16 vs. 17) is *not* a defect — confirmed as a genuine, already-correctly-handled DRB source-shape absence (Vulgate has no equivalent to common 42:17, "So Job died, being old and full of days"), the same "blank by design" pattern already governed for other books, not something requiring a fix. `audit_drb`'s naive same-address chapter-count-diff flag (16, 39, 40, 41, 42) is now expected and will keep showing after this fix, same as the Nehemiah NABRE precedent — it's a structural signature of the (now-corrected) versification difference, not a live defect indicator.

**NABRE — a second, independent chapter-boundary shift, different split point than DRB's.** NABRE's own official chapter break falls 8 verses later than common numbering in this same Behemoth/Leviathan section: NABRE ch.40 runs 32 verses (through what's common 41:1-8), and NABRE ch.41 covers common 41:9-34 (26 verses). The app's data had the same raw-copy defect as DRB, compounded by an 8-verse internal duplication (common 41:16-23's content was repeated verbatim at 41:24-31, overwriting what should have been unique content continuing to 41:34). A set of `translationOverlays.NABRE` entries for six of the affected verses (27, 29, 30, 31, 32, 34) were found holding what turned out to be the *correct* final values — but confirmed via direct code inspection (`js/scripture-resolver.js`) that the app's overlay-reading logic only ever consumes `translationOverlays.Rotherham`, never NABRE — so these were dead, non-functional data, not a live partial fix. Rebuilt all 34 verses of common ch.41 directly from NABRE's own source (`nabre.json`, chapter 40 verses 25-32 + chapter 41 verses 1-26), removed the now-fully-redundant dead `translationOverlays.NABRE` block entirely rather than leaving stale data that could mislead a future audit. One of the rebuilt verses (41:9) still carried a literal `"Chapter 41 - "` heading-pollution prefix from the raw source at NABRE's own actual chapter break — stripped using the same established pattern already used corpus-wide. Also fixed one ordinary stray-space instance (34:16, "you —understand" → "you—understand").

**NRSV:** 180 of 1070 verses corrected against NRSV-CI — checked for a contamination-range or header-pollution signature before trusting the volume (Job is protocanonical, not deuterocanonical, so the four-for-four deuterocanonical header-pollution pattern doesn't apply here by default, and indeed wasn't found); changes are spread evenly across nearly every chapter, consistent with ordinary genuine wording differences rather than a systemic bug. One correction (41:11) was substantial enough in wording to warrant independent verification beyond the primary source — confirmed via three additional independent sources (Bible Study Tools, Werner Bible Commentary, an RSV/NRSV parallel-text site) that the app's prior text ("Who has given to me, that I should repay him? Whatever is under the whole heaven is mine.") was actually the *RSV* rendering, left over and never updated to NRSV's deliberately different 1989 wording ("Who can confront it and be safe? —under the whole heaven, who?") — a genuine, real translation change, not a typo or corruption, and independently corroborated before applying.

**Job is now fully clean across all five applicable translations — zero known open defects.** `audit_drb` and `audit_nabre`'s continued chapter-count/mismatch flags in the 39-42 range are expected artifacts of the (correctly resolved) versification differences, not open work — do not re-investigate them as if new. Mark Job green on the dashboard.

**Next book in sequence (per this project's established Genesis→Revelation-through-OT-directory order, deuterocanon interspersed): ~~Psalms~~ — superseded same day, see 2026-07-13 governance decision below: Psalms is deferred to last (Josh's explicit direction). Next book is Proverbs.** No open decisions carried forward. **Not yet committed — awaiting Josh's plain-English review and `git am` application of the handed-off patch**, per the standing approval-gate workflow.

## Governance decision, 2026-07-13 — Psalms deferred to last

**Josh's explicit direction: Psalms will be done LAST, not next after Job.** The app's own canonical book order places Psalms immediately after Job (`Job, Psalms, Proverbs, Ecclesiastes, Song of Songs, Isaiah...`), but that ordering is superseded for sequencing purposes by this decision. With Psalms skipped, the next book in the existing order is **Proverbs**. This note doesn't resolve whether "last" means last of the whole OT-directory phase or last of the entire remediation effort (OT + ET/AR/SY/Odes + NT) — the practical effect is identical either way for the immediate next step (skip to Proverbs now), so this wasn't asked as a blocking question; it only matters much later, when everything else is otherwise done and Psalms is the only book left. Revisit and confirm scope with Josh at that point rather than assuming.

## Session, 2026-07-13 continued — Proverbs: fully closed, clean book, no structural surprises

**HANDOFF — Proverbs is now fully closed. Not yet committed to origin/main** — same no-push-credentials situation as Job; handed off as a patch for `git am`.

**KJV, Rotherham, DRB:** all zero mismatches, zero chapter-count differences — the cleanest book so far in this remediation effort, no versification shifts or structural findings of any kind.

**NABRE:** FIXED — 6 verses, all the familiar stray-space bug (the "Lord ’s" pattern at 5:21, 10:22, 21:31, 22:14, plus a trailing-space-before-closing-bracket variant at the two editorial-bracket verses 1:16 and 8:11).

**NRSV:** FIXED — 171 of 915 verses corrected against NRSV-CI, spread evenly across all 31 chapters (no contamination-range signature). One change (17:2, "clever servant"/"a son" → "a slave who deals wisely"/"a child") looked substantial enough on a random spot-check to warrant independent corroboration before trusting — confirmed via five further independent NRSV sources (Spark Bible, YouVersion, Bible Society UK, Bible History NRSVCE, CourseBible NRSVCE), all in exact agreement with NRSV-CI's text. The app's prior wording was an older paraphrase, not the genuine 1989 NRSV.

**Proverbs is now fully clean across all five applicable translations — zero known open defects.** Mark Proverbs green on the dashboard.

**Next book in sequence: Ecclesiastes** (per the app's own canonical order, continuing to skip Psalms per the governance decision above). No open decisions carried forward.

## Session, 2026-07-13 continued — Ecclesiastes: fully closed, third instance of the chapter-boundary-shift defect class (this time affecting both DRB and NABRE together, at the same split points, in a different part of the book than Job's)

**HANDOFF — Ecclesiastes is now fully closed. Not yet committed to origin/main** — handed off as a patch for `git am`, same as the two prior books.

**KJV, Rotherham:** zero mismatches.

**DRB and NABRE both — the same defect class as Job (see 2026-07-13 Job entry above), but this time both translations share the identical shift, and it sits in a different location: the boundary between common Ecclesiastes 4/5 and, for DRB only, a second boundary at 6/7.** Confirmed content-for-content: Vulgate/DRB and NABRE both place common Ecclesiastes 5:1 ("Guard/Keep thy foot when thou goest to the house of God...") as the *final* verse of their own chapter 4, one verse longer than the common numbering's chapter 4. Both then continue with what's common 5:2 as their own chapter 5, verse 1 — a single combined sentence ("Be not hasty in your utterance...God is in heaven...therefore let your words be few") that the app's own KJV column *already* treats as one verse (5:2), confirming no further splitting was needed once the chapter offset was corrected. **DRB's shift continues one chapter further than NABRE's**: DRB doesn't resync until the common 6/7 boundary (Vulgate ch.6 ends at common 6:11, and Vulgate ch.7 v.1 = common 6:12, with Vulgate 7:2-30 = common 7:1-29), while NABRE resyncs immediately at chapter 6 (NABRE's own ch.6 already has all 12 of common ch.6's verses, unshifted). Rebuilt all 20 verses of common ch.5 for both translations, plus common 6:12 and all 29 verses of common ch.7 for DRB only. One legitimate mid-chapter section subtitle in NABRE's source ("Vanity of Many Words." at the verse that became common 5:1) was deliberately *kept*, not stripped — confirmed against the established convention (already visible elsewhere in this same chapter, e.g. "Companions and Successors." at 4:7) that only true chapter-start headers ("Chapter N - Title.") get stripped, not internal section subtitles.

**NRSV:** FIXED — 45 of 222 verses corrected against NRSV-CI; confirmed NRSV itself has no chapter-count divergence anywhere in this book (checked directly against the source database's own per-chapter counts before assuming NRSV was affected by the same shift as DRB/NABRE — it wasn't). Changes spread across all 12 chapters, no contamination signature. One change (10:16, "king is a lad" → "king is a servant") looked like a meaningful shift in sense rather than a minor variant, so independently corroborated against five further published NRSV sources before trusting — all five confirmed "servant" is NRSV's own deliberate rendering (with a footnote offering "or a child" as an alternative), not a corruption.

**Ecclesiastes is now fully clean across all five applicable translations — zero known open defects.** `audit_drb` and `audit_nabre`'s continued flags in the 4-7 chapter range (DRB chapter-count diffs; NABRE same-address mismatches through ch.5) are expected, permanent artifacts of the correctly-resolved shift, not open work. Mark Ecclesiastes green on the dashboard.

**Standing pattern, now three data points (Nehemiah's NABRE-only shift, Job's two-independent-shifts, Ecclesiastes' two-translations-sharing-one-shift): chapter-boundary versification shifts are common enough in this corpus that any DRB chapter-count diff or clustered NABRE mismatch run should be checked for this specifically, per the standing rule already recorded in the Job ledger entry — read the actual text at the suspected boundary against the app's own already-correct KJV column, don't trust the tools' symptom-level output alone.**

**Next book in sequence: Song of Songs** (continuing to skip Psalms). No open decisions carried forward.

## Session, 2026-07-13 continued — Song of Songs: fully closed, fourth instance of the chapter-boundary-shift defect class, this time affecting an entire chapter's addressing from verse 1 (not just a tail), plus a second independent shift in NABRE at a different boundary than DRB's

**HANDOFF — Song of Songs is now fully closed. Not yet committed to origin/main** — handed off as a patch, same workflow as the prior three books.

**KJV, Rotherham:** zero mismatches.

**DRB — two separate findings in this one book.** (1) This particular Douay-Rheims source has no separate title verse for "The Song of songs, which is Solomon's" (common 1:1) — its own chapter 1 begins directly with what is common 1:2's content ("Let him kiss me with the kiss of his mouth..."). This is a genuine structural absence, not a bug (same class as Job 42:17 and, closer to home, the DRB registry's other already-governed source-shape gaps) — common 1:1 is correctly blank in DRB. Caught this by checking the *whole* chapter content-for-content against KJV, not just the tail where the chapter-count diff showed up — an early partial fix based on only checking the tail would have left verses 1-15 silently shifted by one the whole way through; corrected before finalizing. Common 1:2-17 = this source's own 1:1-16. (2) A second, independent shift at the common 5/6 boundary: common 6:1 ("Whither is thy beloved gone...") is this source's own chapter 5's extra 17th verse, with common 6:2-13 = the source's own chapter 6:1-12. Both findings verified content-for-content against the app's own already-correct KJV column at every boundary before writing anything.

**NABRE — a separate, independent shift at yet a different boundary (common 6/7), unrelated to either of DRB's two shift points.** NABRE's own chapter 7 begins one verse earlier than common numbering: common 6:13 ("Return, return, O Shulamite...") is NABRE's own chapter 7 v.1 (with its own "Chapter 7 The Beauty of the Beloved -" heading, stripped per the established convention), and common 7:1-13 = NABRE's own 7:2-14. Also fixed two smaller, unrelated defects while in this book: a stray-space bug at 1:5 (extra space around an em-dash) and a genuine content-loss defect at 5:1 (the app was missing the entire first sentence of the verse, "I have come to my garden, my sister, my bride..."), plus a missing-space formatting artifact at 7:9 where a speaker-label letter ("W") had run together with the following word ("Wthat" → "W that") — this book's NABRE text visibly retains internal single-letter speaker-part markers (W/M/D?) as literal text throughout, consistent with the app's existing convention for this book, so these were left in place, not stripped.

**NRSV:** FIXED — 21 of 117 verses corrected against NRSV-CI; confirmed no chapter-count divergence anywhere in this book for NRSV specifically before assuming it shared either the DRB or NABRE shift — it doesn't. Ordinary wording differences throughout, no contamination signature, nothing needed independent corroboration beyond the primary source this time.

**Song of Songs is now fully clean across all five applicable translations — zero known open defects.** The continued `audit_drb` chapter-count diffs (1, 5, 6) and `audit_nabre` same-address mismatches (13, all in ch.7) are expected, permanent artifacts of the two independently-resolved shifts, not open work. Mark Song of Songs green on the dashboard.

**Standing lesson reinforced from this book specifically: when a chapter-count diff or mismatch cluster is found, check the ENTIRE chapter's content against the app's own KJV column, not just the verse(s) nearest the reported diff.** This book's DRB chapter 1 defect was invisible from the tail alone — an early fix based only on the last verse or two would have left the chapter silently misaligned from verse 1 onward. Always read outward from a found shift to confirm where it actually starts and ends, don't assume the boundary is where the tool's symptom-level diff happens to point.

**Next book in sequence: Isaiah** (continuing to skip Psalms). No open decisions carried forward.

## Session, 2026-07-13 continued — Isaiah: fully closed, resolves a long-standing red-flag tension (Installment 12 vs. pre-existing dashboard claim), no chapter-boundary shift this time (first clean-on-that-front book since Proverbs)

**HANDOFF — Isaiah is now fully closed. Not yet committed to origin/main** — handed off as a patch, same workflow as the prior four books.

**Resolves the long-standing dashboard tension for this book specifically** (the same class of "Installment 12 claims zero mismatches vs. pre-existing red flag" tension already resolved for Genesis and 2 Chronicles, but explicitly *not* assumed to extend to Isaiah per the dashboard's own RED_NOTES caveat). The specific claim under dispute was "ch.25 missing v9 + extra terminal v13." **Directly checked: chapter 25 has all 12 verses, v9 present and correct, no verse 13 of any kind.** KJV and Rotherham both confirm zero mismatches and zero chapter-count differences for the whole book — the old red-flag claim doesn't hold up against live data. Moved from red to green.

**KJV, Rotherham, DRB:** all zero mismatches, zero chapter-count differences — no chapter-boundary shift defect in this book (first clean-on-that-front book since Proverbs; the last three books in a row all had at least one). Confirms the DRB source for this book files under its Vulgate name, `isaie.usfm`, not `isaiah.usfm` — consistent with the naming pattern already flagged when this repo was first surveyed (worth checking for every remaining OT book).

**NABRE:** FIXED — 18 flagged, 17 genuine (16 were the familiar LORD-casing-plus-stray-space bug, already-established house style converts "LORD" to "Lord"; two of those were actual content-loss defects with entire leading sentences missing, at 57:1 and 65:1). Learned mid-fix: **don't hand-retype source text from a truncated print — pull the exact string programmatically.** An early attempt at manually reconstructing several of the longer verses from truncated terminal output introduced real inaccuracies (wrong end punctuation, invented phrasing) caught before committing by redoing the whole batch from the source JSON directly. The 18th flagged mismatch (66:1) was a tool false positive — the audit script's own header-stripping regex over-matched past "Chapter 66 True and False Worship - " into consuming the start of the verse's actual content ("Thus says the LORD: The heavens are my throne..."), a known failure mode already documented in this ledger from the original NABRE header-pollution project (the "Round 2" over-matching issue). Confirmed the app's existing content at 66:1 was already correct before leaving it untouched.

**NRSV:** FIXED — 277 of 1292 verses corrected against NRSV-CI, the largest single-book NRSV correction batch in this remediation effort so far; confirmed zero chapter-count divergence before trusting the volume, and the changes spread across nearly every one of the 66 chapters with no contamination-range signature. Ordinary genuine wording differences throughout (e.g. "watchman"→"sentinel," reflecting NRSV's known gender-neutral-language updates; "crown"→"garland"; "tambourines"→"timbrels").

**Isaiah is now fully clean across all five applicable translations — zero known open defects.** Mark Isaiah green on the dashboard, superseding the old red-flag note entirely (not just adding a caveat to it — the specific claim was checked and found false).

**Next book in sequence: Jeremiah.** Jeremiah carries the same class of unresolved red-flag tension as Isaiah did (see dashboard RED_NOTES) — check it the same way, don't assume Isaiah's resolution extends to it.

## Governance decision, 2026-07-13 continued — Jeremiah deferred, pivoting to the minor prophets

Josh's direction, made for practical context-budget reasons partway through this session (77% token usage reached right after Isaiah's push): **Jeremiah is deferred, not skipped outright** — it's one of the largest books in the whole corpus (52 chapters) and a poor fit for whatever's left of this session's working context, especially given it *also* carries the same unresolved Installment-12-vs-red-flag tension Isaiah did, which took real investigation to resolve properly and shouldn't be rushed. **Next book in sequence is now Hosea**, the first of the minor prophets block in the app's own canonical order (`Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi`) — these are all short books, a better fit for available context, and there's no reason they can't be done before returning to Jeremiah. **Jeremiah remains open and red on the dashboard, unresolved, exactly where it was before this session** — nothing about this pivot should be read as having made any progress on it. Return to Jeremiah after the minor prophets block (or sooner, at Josh's direction), and apply the same red-flag-verification discipline used for Isaiah rather than assuming anything about Jeremiah's specific claim.

## Session, 2026-07-13 continued — Hosea: fully closed, first minor prophet done; fifth and sixth instances of the chapter-boundary-shift class (DRB at ch.13/14, NABRE at ch.1/2, both independent), plus a new sub-pattern: a within-chapter verse-split (not a boundary crossing) confirmed by comparing directly to KJV's own combining

**HANDOFF — Hosea is now fully closed. Not yet committed to origin/main** — handed off as a patch, same workflow as prior books. DRB source confirmed filed under its Vulgate name, `osee.usfm`.

**KJV, Rotherham:** zero mismatches.

**DRB — two findings.** (1) A genuine chapter-boundary shift at common 13/14: common 13:16 ("Let Samaria perish...") is this source's own chapter 14, verse 1 — common 14:1-9 = the source's own 14:2-10. Confirmed content-for-content against KJV before rebuilding. (2) A different kind of finding this time, not a boundary crossing: within common chapter 2, this source splits into two verses (23 and 24) what KJV/common numbering keeps as a single verse (2:23) — confirmed by directly comparing KJV's own v.23 wording, which visibly combines both halves ("...I will have mercy upon her that had not obtained mercy; and I will say to them which were not my people, Thou art my people..."). Rather than leaving the source's extra verse 24 orphaned with no address to hold it (which would have silently dropped real content), merged both halves into the single common 2:23 slot, mirroring how KJV itself already handles the same underlying text. This is a new variant of the defect class worth remembering: **not every "extra verse" chapter-count diff is a boundary-crossing shift — some are simple within-chapter split differences, resolved by merging into the single common-numbered slot rather than searching for a chapter boundary that isn't actually there.**

**NABRE — a separate, independent shift at yet a different boundary (common 1/2) than either of DRB's two findings.** NABRE's own chapter 1 ends two verses earlier than common numbering: common 1:10-11 are NABRE's own chapter 2, verses 1-2, with common 2:1-23 = NABRE's own 2:3-25. Confirmed content-for-content against KJV (common 1:10's "sand of the sea" imagery matches NABRE's own 2:1 exactly) before rebuilding both chapters. Also fixed: a genuine content-loss defect at 7:1 (missing the entire opening clause, "When I would have restored the fortunes of my people, when I would have healed Israel..."), and four ordinary instances of the established LORD-casing-plus-stray-space bug (2:18, 2:23 — both later superseded by the full chapter-2 rebuild — 9:3, 9:5).

**NRSV:** FIXED — 40 of 197 verses corrected against NRSV-CI; confirmed zero chapter-count divergence for NRSV specifically before trusting the volume. One change (12:10, "gave parables" → "I will bring destruction") looked substantial enough to warrant independent verification — confirmed via multiple further sources, including a published translators' handbook explicitly discussing NRSV's unusual, deliberate departure from other translations at this exact verse (the Hebrew root can support either "resemble/parable" or "destroy," and NRSV chose the latter).

**Hosea is now fully clean across all five applicable translations — zero known open defects.** Mark Hosea green on the dashboard. Sixth data point overall for the chapter-boundary-shift defect class (Nehemiah, Job, Ecclesiastes, Song of Songs ×2, Isaiah-none, Hosea ×2) — worth noting Isaiah broke the streak of every recent book having at least one, so this isn't universal, but common enough to keep checking for by default.

**Next book in sequence: Joel** (continuing through the minor prophets in the app's own canonical order: Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi). Jeremiah remains deferred and red, unchanged from the prior session's decision.

## Session, 2026-07-13 continued — Joel: fully closed, clean book, no structural surprises

**HANDOFF — Joel is now fully closed. Not yet committed to origin/main** — handed off as a patch. DRB source uses standard naming (`joel.usfm`, not a Vulgate alternate) this time.

**KJV, Rotherham, DRB:** all zero mismatches, zero chapter-count differences — no chapter-boundary shift, no structural findings, the second clean-on-that-front book after Isaiah.

**NABRE:** FIXED — 1 verse (2:12), the familiar LORD-casing-plus-stray-space bug.

**NRSV:** FIXED — 11 of 73 verses corrected against NRSV-CI, zero chapter-count divergence, ordinary wording differences throughout, nothing needed independent corroboration.

**Joel is now fully clean across all five applicable translations — zero known open defects.** Mark Joel green on the dashboard.

**Next book in sequence: Amos.** Jeremiah remains deferred and red, unchanged.

## Session, 2026-07-13 continued — Amos: fully closed; second confirmed instance of the within-chapter-split sub-pattern (Hosea 2:23's class, not a boundary crossing), caught by checking the whole chapter per the Song of Songs standing lesson

**HANDOFF — Amos is now fully closed. Not yet committed to origin/main** — handed off as a patch. DRB source uses standard naming (`amos.usfm`).

**KJV, Rotherham:** zero mismatches.

**DRB — one finding, chapter 6.** `audit_drb`'s chapter-count diff (14 vs. 15) pointed to the tail, but per the Song of Songs standing lesson, checked the *whole* chapter against KJV rather than assuming the tail was the only affected region — found the actual divergence starts at v.10/11, not at the very end. This source splits into two verses (6:10 and 6:11) what KJV/common numbering keeps as a single verse (6:10) — the same within-chapter-split sub-pattern first identified at Hosea 2:23, not a boundary crossing into another chapter. Confirmed by KJV's own v.10 wording, which visibly runs both halves together ("...Is there yet any with thee? and he shall say, No. Then shall he say, Hold thy tongue..."). Merged the source's two verses into the single common 6:10 slot, then shifted the remaining tail (common 6:11-14 = source's own 6:12-15) down by one to restore alignment through the end of the chapter.

**NABRE:** FIXED — 6 verses, all the established LORD/GOD-casing-plus-stray-space bug (this book's first instance of the "Lord GOD" → "Lord God" variant of the same normalization, at 7:1, 8:9, 8:11 — confirmed against already-clean verses elsewhere in the book that GOD gets the same title-case treatment as LORD).

**NRSV:** FIXED — 17 of 146 verses corrected against NRSV-CI, zero chapter-count divergence, ordinary wording differences throughout, nothing needed independent corroboration.

**Amos is now fully clean across all five applicable translations — zero known open defects.** Mark Amos green on the dashboard.

**Next book in sequence: Obadiah.** Jeremiah remains deferred and red, unchanged.

## Session, 2026-07-13 continued — Obadiah and Jonah: both fully closed

**HANDOFF — both books fully closed. Not yet committed to origin/main.** DRB filenames: Obadiah is `abdias.usfm`, Jonah is `jonas.usfm` (Vulgate names).

**Obadiah** (single-chapter book): KJV, Rotherham, DRB all zero mismatches, no chapter-boundary shift. NABRE: 2 verses fixed (1:8, 1:21), established LORD-casing/stray-space bug. NRSV: 7 of 21 verses corrected against NRSV-CI, ordinary wording differences.

**Jonah:** KJV, Rotherham, NABRE all zero mismatches. DRB: one chapter-boundary shift, common 1/2 — common 1:17 (the "great fish" verse) is this source's own chapter 2, verse 1; common 2:1-10 = the source's own 2:2-11. Confirmed content-for-content against KJV before rebuilding. NRSV: 6 of 48 verses corrected against NRSV-CI, zero chapter-count divergence, ordinary wording differences.

**Both books now fully clean across all five applicable translations — zero known open defects.** Mark both green on the dashboard.

**Next book in sequence: Micah.** Jeremiah remains deferred and red, unchanged.

## Standing rule, added 2026-07-13 — always give exact terminal commands with a handoff

**Josh's rule, restated because it was missed once:** every patch handoff must include the
exact terminal commands to apply, commit, and push, in order — not just the patch file. Josh
does not want a prose walkthrough; he wants a copy-pasteable command block. If `git am` fails
partway, remind him the standard fix is `rm -rf .git/rebase-apply` then `git status` to confirm
clean before retrying. This applies to every future handoff without exception.

## Session, 2026-07-13 continued — Micah: fully closed

**HANDOFF — Micah is now fully closed. Not yet committed to origin/main** — handed off as a
patch, commands included this time. DRB source uses standard naming (`micheas.usfm`).

**KJV, Rotherham:** zero mismatches.

**DRB:** zero mismatches. One pre-existing catalogued gap at 5:15 (see
`canonical-ot-drb-active-row-source-shape-blockers.json`) — confirmed genuinely absent in this
DRB edition, not a new defect: DRB's own v13/v14 already carry the content common numbering
splits into v14/v15 (confirmed against KJV wording), so there's simply no separate DRB verse
for common 5:15. Correctly represented as a null in the app already.

**NABRE:** FIXED — 5 verses (4:1, 4:2, 4:6, 5:9, 6:2), the established LORD-casing-plus-stray-
space bug.

**NRSV:** FIXED — 31 of 105 verses corrected against NRSV-CI, zero chapter-count divergence,
ordinary wording differences throughout.

**Micah is now fully clean across all five applicable translations — zero known open defects.**
Mark Micah green on the dashboard.

**Also corrected this session:** `SESSION_START_SCRIPT.md`'s "where things stand" section was
stale (said Job was next; actual state per this log was Micah) — needs a refresh pass. Same
file's claim that NRSV-CI.zip/nabre.json are sandbox-only and won't persist is also outdated —
both are committed in this repo at `data/kalendar/source-witnesses/` (commit `b9ba9d5`) and
usable directly from a fresh clone.

**Next book in sequence: Nahum.** Jeremiah remains deferred and red, unchanged. Pace note: Josh
has asked to batch more books per session going forward rather than one at a time.
