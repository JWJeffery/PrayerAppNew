# Volume 7 — Resume-note material retired 2026-10-03 (HISTORICAL)

**HISTORICAL — NOT CURRENT STATE.** Everything below was split verbatim out of the live
`RESUME_PROJECT_NOTE.md` on 2026-10-03 when Josh asked for it to be cleaned up and pruned. It is
kept as a record of how things were decided and built, not as a statement of what is open. Many
statements inside are superseded (the Synaxarium "NEW TODO" below was completed 2026-10-02; the
innerHTML todo was audited and mitigated 2026-10-02; the three navigation audits were retired
2026-10-02; the "zero rows reviewed" line is stale; Menaion plan items 1-8 are all done). For
current status read the live note at the repo root.

---

## Part A — The live note's header narrative (rewrite history, 2026-07-17 to 2026-10-01)

**Rewritten 2026-09-28, again, same day — this is the FOURTH time this note has needed this exact
treatment (2026-07-17, 2026-09-04, 2026-09-28 morning, 2026-09-28 afternoon).** The morning rewrite
brought it to ~300 lines of current material; by the time a five-diocese ingestion batch and its own
documentation were added on top — without anything closed being split back out — it had grown to 879
lines again. A fresh session asked to "open the resume note" surfaced one buried, months-old-sounding
TODO line as if it were the whole answer, because there was no longer a clean current-state summary
to find underneath all the re-accumulated session narrative. Split everything closed/historical out
to `documentation/project-history/VOLUME-5-2026-09-28-session-log.md` this pass (see its own header
for exactly what it contains). **The lesson, stated plainly this time so it actually generalizes:
adding new material to this note is not "done" until any closed material it displaces is also moved
out. A net-growth commit to this file is itself a defect, not just eventually-a-problem — check the
line count before finishing any session that touched this file, and split proactively rather than
waiting to be asked a fifth time.**

**Split again 2026-10-01 (901 -> ~480 lines):** the closed 2026-09-29/30 Cycle of Prayer and UI material moved verbatim to
`documentation/project-history/VOLUME-6-2026-09-29-to-09-30-cycle-of-prayer-and-ui.md`. Same rule applies: check
the line count before finishing any session that touched this file.

---

## Part B — The live note's "What is open" section as it stood on 2026-10-02 (Menaion corpus work, Anglican Synaxarium, carried-forward items)

## 7. What is open — re-verified and condensed 2026-09-28, sourced per item

**Full evidence and step-by-step narrative for anything marked DONE/CLOSED/RESOLVED below lives in
`AUDIT_GOVERNANCE_LEDGER.md`'s dated entries and `documentation/project-history/VOLUME-5-2026-09-28-
session-log.md` — this section states current status only, not the story of how it got there.**

**`project_roadmap.json` (v0.1.44, updated 2026-10-01) now matches reality:** phases 0-3 done (phase_3
= Roman Breviary shipped); phases 4-8 (EO Russian/Slavic closeout, OO Coptic closeout, Church of the
East closeout, cross-family hardening, final beta gate) `not_started`. Oriental Orthodox's lane is the
Coptic Agpeya, not the removed Ethiopian Sa'atat. The three Roman LOTH governance questions are
`superseded`; the roadmap's old LOTH tranche history is retained but marked superseded/abandoned.

**Closed work from 2026-09-29/30 (five rounds of UI fixes; the profile/user system; the full Cycle of
Prayer ingestion; the Communion, Diocesan and Parish tiers) now lives in
`documentation/project-history/VOLUME-6-2026-09-29-to-09-30-cycle-of-prayer-and-ui.md`.** Current state
in one paragraph: all 92 Cycle of Prayer files validate (`npm run audit:cycles-of-prayer`); all three
tiers (Communion, Diocesan, Parish) render in BCP Morning/Evening Prayer after "A Prayer for Mission"
with their own rubric headings and sidebar entries; the profile (diocese + parish picker, "Other"
fallback, onboarding prompt) is built and live. Only ~18 jurisdictions with no located source remain
un-ingested (`tecDioceseRoster.noSourceFound` in `data/cycles-of-prayer/schema.json`), and dioceses
whose source is a rolling/partial window (West Missouri, Springfield, Easton, and similar) plus every
diocese's 2027 cycle need periodic re-checking. **The Parish tier DOES render (corrected 2026-10-01 -- an
earlier session wrongly reported it unwired): PR #90 / `84803f0` added it** (`CYCLES_OF_PRAYER_PARISHES`,
`loadCycleOfPrayerParishMonth` in `js/cycles-of-prayer.js`; render/refresh in `js/office-ui.js`). The only parish-tier file is St. Bede's, Forest Grove
(Western Oregon); a household-level "this is my family's day" surface is an undecided product question.

**Roman Breviary 1960/1962 is SHIPPED and live (corrected 2026-10-01 -- earlier versions of this note wrongly said "in active buildout").** All 8 hours, Roman general
calendar, Rubrics 1960/1962, calendar years 2026 and 2027 precomputed in Latin AND English
(`data/roman-breviary-1960-1962/manifests|units/{,en/}{2026,2027}.json`), generated from Divinum
Officium's own engine at a pinned commit; reachable from the main entry screen ("Catholic" card →
`latin-catholic` → `roman-breviary-dev` mode), tradition-availability `true`. See
`documentation/ROMAN_BREVIARY_1960_1962_BUILDOUT.md`. The modern Liturgy of the Hours lane (`roman_loth`,
JWJeffery/LOTH) was abandoned by Josh on 2026-09-27 and is superseded in `project_roadmap.json`. Open
Breviary follow-ups, if any, are Josh's to name — none are tracked here.

**PRIORITY 1 — Menaion hymn-family corpus transcription (Orthros). SOURCE SEARCH DONE 2026-10-01 —
Josh's decisions recorded below; nothing transcribed yet.** Full evidence in `structure.json`'s
`menaion-hymn-corpus-transcription` todo; branch classification is done (every sessional hymn / praises /
exapostilarion / feast Theotokion branch renders "not yet text-backed"/"is deferred"; only troparion +
27 kontakia have text). Result of the 2026-10-01 search for English, free-to-reuse sources of these
families: **no reachable, verifiably licensed source exists for feast-PROPER hymnography.** What exists:
- **Orloff, *The General Menaion* (London 1899; from the Slavonic 16th ed. of 1862) — public domain,
  Commons only.** CCEL (`ccel.org/ccel/anonymous/menaion/menaion.i.html`) is reachable; archive.org
  text downloads are blocked from the sandbox. Covers the Commons (Lord, Theotokos, Apostles, Martyrs,
  Hierarchs, Venerable...) — usable for rank 3/4 saints through a NEW `common-of-<type>` layer
  (`data/menaion` is keyed `MM-DD`, so this needs a schema extension and a type->common mapping); does
  NOT supply Great Feast propers. Cite the 1899 edition, not the 1969 AMS reprint. CCEL's own site terms
  not yet checked.
- **Hapgood 1906** — already audited; Kontakion/Ikos and partial Vespers stichera only.
- **Excluded (copyrighted / uncleared):** Festal Menaion (Mother Mary & Ware), HTM Menaion, Lambertsen
  (also the `typiconman/english-md` repo — its MIT license covers the markdown, not the translation),
  `brianglass/anastasis` (Ephrem Lash; permission still pending), OCA liturgics (all rights reserved),
  MCI Online Menaion, Saint Kosmas pages, Orthodox Wiki (share-alike, mostly quoted troparia).
- **Orthocal MCP** supplies feasts/readings/lives only — zero hymnography.
- **Unverified, not usable yet:** GOARCH Digital Chant Stand / AGES (`ocmc-olw`) — structurally the best
  fit, but Greek lane and license unconfirmed (believed non-commercial/no-derivatives; github.com is
  403 from the sandbox, so the license file could not be read).
**JOSH'S DECISIONS, 2026-10-01:**
1. **Use Orloff 1899 (CCEL)** for rank 3/4 saints via a new `common-of-<type>` data layer (needs a schema
   extension + a commemoration `type` -> common mapping; cite the 1899 edition, per-component provenance).
2. **"Free for non-commercial use" IS acceptable** as a license class, and **Greek-lane AGES texts MAY
   serve the Russian/Slavic lane** -- for the large gaps that remain after the Commons. Caveat: a
   no-derivatives clause (believed, unverified, to be on AGES) could still forbid restructuring the
   text into this app's data shape -- read the actual license before ingesting anything.
3. **Great Feast propers stay deferred** (no permission requests to be sent); keep the honest
   "not yet text-backed" rubrics.
4. **AGES LICENSES READ, 2026-10-01 -- two different AGES repos, two licenses (Josh supplied both).**
   `AGES-Initiatives/ages-alwb-templates` (the repo this note first pointed Josh to) carries "(c) Fr.
   Seraphim Dedes ... CC BY-NC-SA 4.0" (Josh pasted the full text). **`AGES-Initiatives/alwb-library-en-us-goadedes`
   -- "Translations by Fr. Seraphim Dedes for the Greek Orthodox Archdiocese of America", text under
   `alwb.library_en_US_goadedes/` -- is shown by GitHub as CC0-1.0 (public-domain dedication), per Josh's
   screenshot.** The texts we want live in the library repo, so CC0 is the governing license for them;
   Josh was asked to open its `LICENSE.md` to confirm the first lines. Standing policy until that is
   confirmed: voluntarily comply with the stricter BY-NC-SA terms (credit Fr. Seraphim Dedes + AGES in
   the app, keep the app non-commercial, do not imply AGES endorsement); ShareAlike is NOT treated as
   binding on the data files if CC0 is confirmed. The earlier 2026-09-28 "no copyrighted material" rule
   is amended by Josh's 2026-10-01 decision to allow free-for-non-commercial licenses. **Still not
   obtained: the texts themselves** -- GitHub is 403 from the sandbox; Josh was asked to download the
   library repo ZIP and put it in a Drive folder. CONTENT caveat (not a license one): AGES is Greek
   Archdiocese usage, so feast hymnography will not always match Russian/Slavic usage -- disclose that
   wherever used, and prefer Orloff (Slavonic-derived) wherever it applies.
**DONE 2026-10-01 -- Orloff Commons ingested and wired: 71 rank-3 saints (Orthros sessional hymns 1-2, canon,
exapostilarion, praises; Vespers stichera, aposticha) and 203 rank-4 saints (Vespers stichera only, Josh's decision)**;
live-verified across all 2026 dates. Record, scripts, mapping rules, limits: `documentation/MENAION_COMMONS_ORLOFF.md`.
**DONE 2026-10-01 -- Orthodox day data (Josh's "provide content" plan, items 2 and 3):** the day's FAST and the appointed
READINGS (Vespers paroemias, Matins Gospel, Epistle, Gospel incl. each saint's) for 2026-2027 from orthocal.info, shown by
`js/orthodox-day.js` in Vespers/Orthros/Typika. **Finding for Josh:** the engine's own Typika Epistle/Gospel table disagrees with the
published lectionary on ~half the days (166 of 338 compared); the new data replaces it for 2026-2027 -- see
`documentation/ORTHODOX_DAY.md`. Outside 2026-2027 the old engine logic still runs. **DONE 2026-10-01 -- item 1, batch 1: original short lives for the rank-3 commemorations** (77 published in
`data/menaion/lives/lives.json`, from research subagents using 2+ sources each; merged by `scripts/menaion/merge-lives.py`; shown as
"Commemorated Today" in Vespers/Orthros/Typika by `js/orthodox-day.js`, 2026-2027 new-calendar only). **The calendar/identity mismatches the research found were ALL FIXED the same day** (Jul 7 Thomas of Maleon; Apr 16 Agape/Irene/Chionia; May 5 Great Martyr Irene;
Jan 14 Nina only + Leavetaking of Theophany moved there; Tikhon -> 08-13, Innocent of Irkutsk -> 02-09, Royal Martyrs -> 07-04 so Menaion files are keyed by the Menaion date); evidence and resolution:
`documentation/MENAION_DATA_FINDINGS.md`. **DONE 2026-10-01 -- item 1 COMPLETE: every one of the 360 Menaion commemorations has an original short life** (`data/menaion/lives/lives.json`; research
subagents reading OCA + Orthocal per date; merged by `scripts/menaion/merge-lives.py`; shown as "Commemorated Today"). The pass found and fixed ~14 wrong-date/identity
entries and Josh had 9 unsupported entries deleted -- evidence in `documentation/MENAION_DATA_FINDINGS.md`. Lives are summaries, not liturgical text; confidence ("high"/"medium")
is stored per entry. **DONE 2026-10-01 -- plan item 4, hymn guide:** rank 1-2 feasts show tone/melody/count of the missing Menaion hymns from AGES metadata (`js/hymn-guide.js`, `documentation/MENAION_AGES.md`), labelled Greek usage. **DONE 2026-10-01 -- plan item 5, "About Today's Service" panel** (`js/day-guide.js`, `documentation/ORTHODOX_DAY.md`). **DONE -- plan item 6, education layer.** **DONE -- plan item 7, patristic commentary on readings** (`data/commentary/readings/`, `documentation/ORTHODOX_DAY.md`). **DONE -- plan item 8, public-domain icons** (`data/icons/`, `images/icons/`, `images/CREDITS.md`; 204 icons covering rank 1-4, ~160 commemorations have none; 2026-10-02: the 8 pending icons plus Protomartyr Stephen added (212 icons); 3 remain with no public-domain file (robe-placing Moscow, Eupsychios, Acepsimas) -- see `documentation/ORTHODOX_DAY.md` Icons section). **All 8 plan items complete.** **DONE 2026-10-02: Old Calendar mode now has the day panel/readings/lives/commentary/icons (`documentation/ORTHODOX_DAY.md`); three stale nav audits retired (`scripts/retired-audits/`); innerHTML audit done. Josh confirmed 2026-10-02: Apr 30 is James son of Zebedee.**
**DONE 2026-10-02:** 4 of the 8 unmapped rank-3 feasts mapped (3 stay unmapped on purpose; Nicaea entry gone), 58 rank-4 saints use AGES Vespers stichera, rank-4 Orthros/aposticha deliberately not done (Typikon keeps Octoechos) -- see `documentation/MENAION_COMMONS_ORLOFF.md`. Rank 1-2 feast propers stay deferred.
**Data question for Josh:** the app lists 04-30 as "Apostle James, Brother of the Lord", but the AGES hymns (and the
calendar tradition) for Apr 30 are James the son of Zebedee -- please confirm which the app's entry should be.

**AGES (CC0 library, Fr. Seraphim Dedes) -- ingested and wired 2026-10-01 (partial by design).** Its day files mix the saint
with forefeast/afterfeast hymns, so every rank-3 day was read hymn by hymn: 36 saints use it for slots approved by rule or
by reading (Vespers stichera/aposticha, Orthros praises/exapostilarion/one sessional); everything else uses the Orloff
Common. Full record, rejections, limits: `documentation/MENAION_AGES.md`. The ZIP is NOT in the repo (re-ingest needs Josh
to re-supply it). **AGES rank 4 done 2026-10-02 (Vespers stichera, 58 saints).** Rank 1-2 feasts untouched (Great Feast propers deferred).

**License status of sources not used:** CLEARLY copyrighted/not-granted -- Festal Menaion, HTM Menaion,
Lambertsen, OCA liturgics, Saint Kosmas pages ("All Rights Reserved"). UNCLEAR (no usable license
found, so unusable until clarified) -- Ponomar project texts
(site says free/credit/share-alike but hymn-text provenance unverified), MCI Online Menaion (no
license shown, mixed translations), Anastasis/Lash texts (repo says permission still being sought),
Orthodox Wiki (CC BY-SA, but hymn texts are mostly quoted from copyrighted books).

**EXAMINED 2026-10-02 -- see `documentation/ANGLICAN_SYNAXARIUM_FINDINGS.md`: the Drive decisions file is the EXPORT of `synaxarium-review/` and all 366 dates are already decided (the "zero rows reviewed" statement below is stale); 211 dates agree with the app, 62 differ, 93 have no ANG entry. **CORRECTED 2026-10-02: Josh's approved corrections are implemented (`documentation/ANGLICAN_SYNAXARIUM_CORRECTION_PROPOSAL.md`; `scripts/saints/verify-synaxarium-calendar.py`; corrected export `synaxarium-review/data/synaxarium-decisions-2026-10-02-corrected.json`). The Drive project's own files could not be edited in place (connector limit); a corrections doc and delta JSON were added there: Google Doc "Calendar and Admission Decisions" (the replacement; the first version, "...Corrections of 2026-10-02", says 22 records and is to be deleted by Josh) and `synaxarium-decisions-corrections-2026-10-02.json` (9 changed-date records). Josh still to upload the full corrected export to Drive if he wants Drive to carry it. All of this is merged to `main` (2026-10-03, dfc188b).** **INCORPORATED 2026-10-02 per Josh (primary plus alternates; conflicting rows dropped unless printed LFF/HWHM/GCW proves them; hagiographies NOT committed, decisions exported): see the "Applied" section of that doc.** *(Older text follows.)* **NEW TODO, added 2026-09-28 per Josh's direct instruction — make the Google Drive "Anglican
Synaxarium" decision file the controlling TEC commemoration calendar.** Josh: "For TEC saints /
commemoration, incorporate the decision file in Google Drive (Anglican Synaxarium) and make that data
the controlling commemoration calendar for TEC in the app." **Located, not yet read or incorporated**
— a whole "Anglican Synaxarium" production project (not a single file) in Drive folder
`1MKGp9HIUS_y3y5LnSvcG3dlqjRvn1RAu`, owned by `josh@jwjeffery.org`:
- **`synaxarium-decisions-2026-09-07-cleaned.json`** (~600KB) — most likely candidate for "the
  decision file" Josh means; a cleaned JSON export, presumably of actual decided commemorations.
- **"An Anglican Synaxarium — Editorial Rules"** and **"— Production Workflow"** (Google Docs) — read
  these FIRST, before the decisions file itself.
- **"An Anglican Synaxarium — November 2026 Production Tracker"** (Google Sheet) — likely tracks
  in-progress status separately from the finished decisions file.
- Further per-date working documents also exist in/around this folder — an actively-maintained
  external pipeline, not a one-off export.

**Relationship to `synaxarium-review/`'s own candidate CSVs (see the bottom of this section) not yet
established** — both concern TEC/Anglican sanctoral data; whether the Drive project supersedes, feeds,
or is independent of that tool's candidate-matrix review needs to be understood before building an
incorporation. **Not started:** no file content read, no schema comparison against `data/saints/
sanctoral.json` ANG rows, no plan for how "controlling calendar" should be implemented. Read the
Editorial Rules and Production Workflow docs first, then the decisions JSON, before writing any code.

**Documentation/governance cleanup — scope is explicitly reduced, per Josh's direct instruction:
`AUDIT_GOVERNANCE_LEDGER.md` and `AUDIT_SOURCE_VERIFICATION.md` are OUT OF SCOPE for this cleanup
effort — do not audit either of them as part of it without Josh separately asking.** Everything else
in scope (scattered continuity/status documents, dated archive files, ad hoc structure snapshots) is
already consolidated into `documentation/project-history/` — see its `INDEX.md`.

**`structure.json`'s remaining open todo: `js/office-ui.js`'s innerHTML string-building (33 raw
writes) — still open, unaddressed.** (Its other listed todos are closed — see Volume 5 if the history
matters.)

**`whole-app-json-to-database-migration` — GATED, per Josh's explicit instruction: this must be done
LAST, after everything else on this list, and ONLY when Josh directly authorizes it starting — not
picked up proactively, not started because it happens to be next in some ordering, no exceptions.
Reason given: it will probably take a lot of tokens.** Do not begin any part of this item (not even
the inventory/scoping step below) without that direct authorization. Josh's own words, recorded in
`structure.json`: "the refactor needs to cover the whole thing not just the scriptures" — migrate
`data/bible/`, `data/saints/`, `data/menaion/`, `data/horologion/`, `data/kalendar/`, `components/`,
and every other JSON corpus off flat JSON files to a database-backed storage model. **NOT STARTED.
Nothing chosen yet** — no database technology, no timeline, no migration plan, for any domain. Before
scoping begins: (1) confirm with Josh whether the Bible registry doc's conceptual model (book
identity / text form / canon profile / translation witness / versification / reference map / resolver
contract) is the template every domain should mirror, or each domain gets its own; (2) inventory every
JSON corpus under `data/` and `components/` with rough size/entry-count first. Full detail in
`structure.json`'s `known_outstanding_issues` (id `whole-app-json-to-database-migration`, severity
MEDIUM) — read that entry directly before starting any work on it.

**Still not acted on, pre-existing and unrelated to any of the above:** `scripts/audit-shared-mode-
navigation-grammar`, `scripts/audit-app-navigation-architecture`, and `scripts/audit-shared-office-
sidebars` have pre-existing failures (stale `ethiopian-saatat` mode references, missing CSS markers)
that predate recent sessions and have not been investigated.

**The old "carried forward, not independently re-verified" bucket — checked and properly categorized
2026-09-28, per Josh's direct instruction.** These items are not all the same kind of blocked:

- **Found 2026-10-02 while checking `verify_sanctoral.js` (pre-existing, not caused by the Anglican change -- output identical before and after):** (1) FIXED: `js/calendar-ethiopian.js` never exported `window.EthiopianCalendar`, so the Coptic `monthlyCoptic` rule (Synaxis of Archangel Michael, 12th of every Coptic month) never resolved in the app; now exported and the harness loads it. (2) KNOWN GAP, no source exists: COE `prophet-elias-elijah` (Friday of week 7 of Eliya-Sliwa) has no occurrence in 2038 -- the latest possible Gregorian Easter leaves Eliya only 6 weeks before Qudash 'Idta. Only 2038 in 2020-2039; the 2020-2026 printed calendars never show such a year and a web search found no rule, so none is invented (`verify_sanctoral.js` lists it as a KNOWN GAP). (3) KNOWN, documented in each entry's `ruleSource`: California-calendar acceptance misses for Mar Mushi, Jacob the Recluse, Sabrisho, Tahmazgard, Daniel the Physician (117/124 match); the correct rules cannot yet be expressed.

*Genuinely unblocked — need no research and no decision, can be started any session, per
`documentation/OPEN_ITEMS_FIXABILITY.md` Part 4:*
- **Formation prose: editor names stripped** from `data/explanations/*.json` prose (done 2026-10-01; citations in `source` fields kept).
- **Education-layer coverage extension: done 2026-10-01** (Coptic 78/87 titles, East Syriac 318/448, via matchLabels aliases to existing entries + one new Coptic `theotokia` entry; the remainder are individual psalms, generic prayers and proper hymn texts).

*Blocked on Josh's decision, not research:*
- **Royal Anthem sourcing.** Copyright. Two live options, neither authorized: an OIRSI/Moolan
  permission request, or a disclosed machine translation from Bedjan's public-domain Syriac. Genuinely
  unsourced after four leads across two sessions — do not re-research the same two routes without a new
  lead; this needs Josh to pick one, not more searching.

*Blocked on research (not a decision, not a missing page — a real unanswered historical question):*
- **Cathedral/Monastic content axis.** The **control** is live and working
  (`isEastSyriacCathedralMode()`, five call sites) — do not report this as broken. The **content**
  question is separate and open: `rubrics.json` itself records that the old two-parallel-hour-forms
  content axis was deliberately deleted because Maclean doesn't actually describe East Syriac hours that
  way (he describes one ferial form, separately from festival/Sunday/memorial forms) — rebuilding it
  needs that distinction actually researched, not assumed back into existence.

*Blocked on source availability — none identified yet:*
- **Coptic Prayer of the Veil.** O'Leary's seven-hour Coptic Agpeya translation (this project's main
  Coptic source) does not contain it. Needs a different Coptic liturgical edition; none found so far.

*Vague and likely stale — needs re-scoping before any work starts, not ready to pick up as-is:*
- **Horologion splash wiring.** The only record found: "Josh: needs a full audit, not there yet"
  (2026-09-04). No further detail exists anywhere in the ledger or project history. The splash/threshold
  screen has been substantially rebuilt since then (the `#uo-threshold` system dates to 2026-09-22-23,
  weeks after this was flagged) — whatever prompted this note may no longer apply to the current UI at
  all. Whoever picks this up should re-establish what "full audit" was even supposed to cover before
  starting, likely by asking Josh directly, not by guessing from this thin a record.

*Not Claude's work at all — a separate, already-built tool waiting on Josh's own hands-on review:*
- **The Anglican Kalendar remainder via `synaxarium-review/`.** The tool itself is done and ready
  (`synaxarium-review/validation-report.md`: 1,194 candidate rows total, full date coverage, zero
  missing SIN joins, zero malformed rows) — but **(STALE -- see 2026-10-02 finding above: all 366 dates were decided 2026-08-25 to 09-07)** zero rows had been reviewed. This was the entire
  remaining task — Josh going through all 1,194 candidate rows himself in the tool's own browser UI
  (`cd synaxarium-review && python3 -m http.server 8000`) and concurring/overriding/recording a
  decision for each civil date. Per standing project rule, `synaxarium-review/` is a separate project
  from the EOR/OOR sanctoral work above; do not extend it or build a parallel tool, and this review
  work is Josh's own editorial judgment to exercise, not something a session should attempt for him.
