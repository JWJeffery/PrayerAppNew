# Audit Governance Ledger

**Purpose:** This file is the durable record of every workflow, methodology, and governance decision made in the v1.0 audit-and-rebuild effort. It is not a memory aid for any AI assistant — it is the actual source of truth, read fresh at the start of every session, so that decisions do not have to be re-explained or re-enforced fifteen turns later.

**Standing rule:** Any new governance or workflow decision gets appended here in the same session it's made — not deferred, not left to be remembered.

**Standing rule for whoever (human or AI) resumes this work:** Read this file first. Do not trust the completeness or accuracy of any other documentation in this repo, including `structure.json`, until it has been independently verified against a primary source. Prior claims of "complete" or "certified accurate" carry no evidentiary weight on their own.

---

## Personnel / trust status

- **2026-07-05** — Lucy (prior project architect/QA lead) admitted to falsely certifying the OT, NT, Psalms, and Deuterocanon as "100% accurate" when they were not. Dismissed from the project. **All prior certifications by Lucy, regardless of subject matter, are voided** and must be independently re-verified — not assumed correct, not assumed "probably fine."

## Biblical corpus

- Audit/remediation scope explicitly **excludes nothing except by Josh's direct instruction** — currently the active top priority, assigned to Claude directly (not Lucy) for both diagnosis and correction, given Claude's demonstrated ability to make precise, well-anchored edits without full-file rewrites.
- **Sequencing:** Genesis → Revelation through the `data/bible/OT` directory first (one book at a time, all translations within that book checked together — chosen over translation-by-translation because files hold multiple translations internally, and cross-translation inconsistency is otherwise invisible until much later). Then the language-sorted corpora (Ethiopian/ET, Armenian/AR, Syriac/SY, Odes). Then NT.
- **Standard:** character-for-character verification against a named source. No sampling. No "checked every 15th word."
- **Copyright note:** verifying scripture text against a source is not a "displacive summary" problem — quoting the actual verse in full is the deliverable, not a caution case.

## Office audit — general

- **Sequence:** Daily Office (1979 BCP) → Ethiopian Office → Church of the East Office → Byzantine (Slavic) Divine Office → Book of Needs → Roman Breviary 1960/1962 (completed portion only).
- **Lectionary source restriction (hard rule, also set in userPreferences):** 1979 BCP only — bcponline.org or justus.anglican.org/resources/bcp/bcp79.pdf. Never RCL, USCCB, Satucket, ACNA 2019 BCP, or the 1928 BCP.
- **Method:** for each tradition, build an independent blueprint from primary sources/scholarship *before* reading this repo's existing documentation for that tradition. Existing docs are audited material, not foundation.
- **Code edit workflow:** Claude proposes edits with full surrounding context (never a single bracket as a landmark) — also set in userPreferences. As of 2026-07-05, working toward direct branch-based commits via a scoped GitHub token, with plain-English before/after content review by Josh (not code-diff review) as the approval gate before merge.
- **2026-07-05 — Zero EOW rule:** the current app build should contain ZERO Enriching Our Worship text anywhere in the Daily Office. Any EOW-sourced text found in `components/anglican.json` (or elsewhere) during audit is unauthorized contamination, not a legitimate labeled alternative — flag for removal, not for relabeling. A separate, later, explicit decision would be required to intentionally add EOW content back in as clearly-marked optional text.

## Source inventory (Episcopal Church liturgical works, added to project 2026-07-05)

- **BCP1979.pdf** — full text of the 1979 BCP (Church Publishing Inc.)
- **lesser_feasts_and_fasts_-_2024__final_.pdf** — current official TEC sanctoral calendar (GC 2024)
- **book_holy_women_holy_men_for_web.pdf** — predecessor sanctoral calendar (GC 2009/2010); superseded, useful for history/comparison only
- **lm_great_cloud_of_witnesses.pdf** — alternate commemorations calendar (2016); relationship to LFF 2024 not yet resolved
- **book_of_occasional_services_final.pdf** — Book of Occasional Services 2022 (GC 2022) — likely primary source for TEC's Book-of-Needs-equivalent content
- **enriching_our_worship_1_1.pdf** — EOW1: Morning/Evening Prayer, Great Litany, Holy Eucharist (1997/1998) — most relevant EOW volume to Daily Office, but see Zero EOW rule above
- **enriching_our_worship_2.pdf** — EOW2: Ministry with the Sick or Dying, Burial of a Child (2000)
- **enriching_our_worship_3.pdf** — EOW3: Burial Rites for Adults + Burial of a Child (2006/2007)
- **enriching_our_worship_4.pdf** — EOW4: Renewal of Ministry / Welcoming a New Rector (2006/2007)
- **enriching_our_worship_6.pdf** — EOW6: Rites for Blessing Relationships (GC 2018)
- **daily_prayer_all_seasons_eng_final_pages_0.pdf** — Daily Prayer for All Seasons (supplemental, not BCP)
- **weekday_eucharistic_propers_final_pages.pdf** — Weekday Eucharistic Propers 2015/2017
- Missing from the set: Enriching Our Worship 5 (childbearing/childbirth/loss) — not yet located.

## Naming / architecture corrections identified

- **"Horologion" is not the name of the whole Byzantine Divine Office** — it is one of four constituent books (fixed hours), alongside Menaion, Triodion, and Pentecostarion. Repo-wide naming (docs, file names, function names) likely still conflates the two and needs a rename pass. Flagged, not yet executed.
- **Byzantine build scope:** Slavic-first, with Greek, Antiochian, and other traditions planned for later. Not yet built.
- **Book of Needs is its own section** in the app, distinct from the Byzantine office. Needs full breakdown of every prayer it contains (likely the Trebnik/Great Book of Needs) — not yet researched.

## Known structural findings (not yet resolved)

- **Ethiopian Sa'atat:** the app's 9-watch/3-psalm-per-watch structure does not match the historically attested Sa'atat of Abba Giyorgis, which is lesson-based (four scripture lessons + responsorial psalm + always-gospel at Nocturns), organized as Nocturns + Eleventh Hour (Vespers) + Twelfth Hour (a separate Marian devotional office) — not nine fixed clock-time watches.
- **Ethiopian Senkessar:** Ginbot days 1–17 audited against Budge (1928); found hallucinated saints (quota-filling inventions with no source) and real saints displaced to the wrong calendar day. Pattern likely systemic; remaining 12 months unaudited.
- **Byzantine content:** Menaion and Triodion/Pentecostarion are acknowledged incomplete, not merely unverified (open research queues; Triodion and Pentecostarion each have only one file).

## Open questions / not yet decided

(none currently — see "Resolved" below for the most recent decision)

## Resolved

- **2026-07-05 — Byzantine complexity representation, confirmed by Josh:** two separate tracks, not one ledger row. (A) Content-completeness grids per book (Octoechos: tone × weekday; Menaion: month × day; etc.), same model as the Bible-book grid, just finer resolution. (B) A separate adversarial test-case suite for the *combination/concurrence engine* — specific real dates chosen to stress tone-of-week + fixed feast + movable season + rank rules, checked pass/fail against correct Typikon behavior. These are different failure modes (content vs. behavior) and must not be conflated into a single cell.
- **2026-07-05 — Fix workflow, confirmed by Josh:** two-tier, not per-item pre-approval and not full-audit-then-fix-everything.
  - **Mechanical corrections** (verified unambiguously against a primary source, one correct answer) — commit directly to the audit branch immediately upon verification. Do not wait for per-item sign-off; the source-verification step already is the rigor. Continue auditing forward without pausing.
  - **Judgment calls** (a decision is being made, not just a correction) — flag and hold for Josh's decision before touching anything. Do not block continued auditing elsewhere while a judgment call is pending.
  - Either way, nothing reaches `main` without Josh's review, batched by office/session, not by sentence.
  - **Dashboard currency rule:** the dashboard must be updated in the same action as any fix or finding — never described in chat and updated later. The dashboard has an auto-reseed mechanism (`SEED_VERSION` string in the HTML) — bump this string whenever seed data changes so stale browser-stored state doesn't mask new findings.
- **2026-07-05 — Finish-what-we-start rule, confirmed by Josh:** once a unit of work (an office, a book, a tradition) is started, it is not left until it is 100% audited and 100% confident — no partial coverage carried forward as "good enough for now." Since the fix-workflow is fix-as-you-find, this means: do not move to the next office/unit while known amber (unverified) items remain in the current one. Applies at the granularity of an office (e.g. "Morning Prayer"), not the whole Daily Office or the whole audit project.
- **2026-07-05 — Mission Prayer judgment call, resolved:** replaced the wrong (Evening Prayer) text with the 3 real Morning Prayer II mission prayers, configurable via a deterministic date-anchored daily rotation (`getDailyRotationIndex()` in js/office-ui.js — ISO ordinal day-of-year mod N, UTC-anchored to avoid timezone drift). Toggle: "Rotate Mission Prayer Daily" (default on).

## New finding, not yet resolved

- **2026-07-05:** `components/traditions/ethiopian/rubrics.json` directly referenced the Anglican `bcp-mission-prayer-1` component (now repointed to `bcp-mission-prayer-mp-a` so nothing broke). This means the Ethiopian Sa'atat rubric sequence borrows Anglican BCP content directly. Not yet reviewed for whether this cross-tradition borrowing is itself correct or intentional — flagged for the Ethiopian office audit phase.

## Resolved (continued)

- **2026-07-05 — Dashboard architecture, shared components:** the dashboard now has a `SHARED_COMPONENT_STATUS` object + `statusFor()` helper (audit-ledger.html). Any component genuinely shared by ID across multiple offices (verified in code, not assumed) is defined ONCE there, and every office's row pulls from it automatically. This prevents the specific staleness failure that occurred on 2026-07-05: a shared component (Lord's Prayer) was fixed once but tracked as N separate per-office dashboard rows, any of which could silently go stale on the next fix. Going forward: before adding a new item to a per-office status map, check whether it's actually a shared component first (grep the component ID across office render code) — if so, it belongs in SHARED_COMPONENT_STATUS, not duplicated per office.

## New findings, not yet resolved (2026-07-05, end of session)

- **bcp-collect-proper-5** is an exact duplicate of bcp-collect-proper-4's text (confirmed bug, needs real Proper 5 text sourced from BCP1979.pdf).
- **bcp-collect-jan20-fabian does not match Lesser Feasts and Fasts 2024's actual Fabian collect at all** — appears to be composed/paraphrased rather than sourced from LFF. This raises the same question for every other minor-saint collect sourced from LFF rather than the BCP (jan21-agnes, jan22-vincent, jan23-phillips-brooks, jan24-florence-li-tim-oi, january-27, james-jerusalem, luke, and likely more not yet checked). This is a new, separate body of work — auditing Collects against Lesser Feasts and Fasts 2024, not just against the BCP.
- Collects batch-verification method (2026-07-05): anchor-based automated text matching against BCP1979.pdf caught 59 exact matches and 2 real errors (both fixed) out of 133 total collect entries, but produces false positives on "mismatch"/"not found" results due to page-break/page-number artifacts in the extracted source text. The ~70 remaining flagged entries need manual triage, not automated re-runs of the same method.

## Session status (2026-07-05)

Session ended near context/turn limit, per Josh's instruction to continue auditing until then rather than stop early. Morning Prayer is NOT 100% complete — Collects (partially done, see above) and the full Canticle set beyond Te Deum remain. Per the finish-what-we-start rule, the next session should resume Morning Prayer here before moving to Evening Prayer.

## Self-correction, 2026-07-05

- **Claude's own error, corrected:** in the previous session, a wording fix was applied to `bcp-collect-proper-4` without first verifying the text was assigned to the correct Proper number. It was not — that text actually belonged to Proper 5. The fix entrenched a misassignment rather than catching it. Lesson: before fixing wording within an entry, confirm the entry itself is correctly identified/placed, not just that the wording sounds plausible.
- **Confirmed 1928 BCP violation, now removed:** `bcp-collect-proper-4.rite1` contained the traditional Quinquagesima Sunday collect from the 1928 BCP ("O God, who hast taught us that all our doings without charity are nothing worth..."), a source explicitly forbidden by standing rule. Quinquagesima does not exist as a named Sunday in the 1979 BCP at all. Replaced with the real, verified Proper 4 text (BCP1979.pdf p.177 Traditional, p.229 Contemporary).
- **Method caution:** an automated sweep for "content with zero trace in BCP1979.pdf" across all 133 collects returned 59 hits. This is NOT 59 confirmed violations — the method has demonstrated false positives (it flagged `bcp-collect-grace`, which was manually verified correct earlier in this same session) due to line-wrap/hyphenation artifacts in the extracted PDF text. Treat that list as a triage starting point requiring manual verification per item, not as a findings list. A broader, deliberate sweep for other possible 1928-BCP-sourced content is warranted given this confirmed instance, but has not been done — flagged as follow-up, scope and method not yet decided.

## Confirmed systemic finding, 2026-07-05

**Modern-saint collects sourced from Lesser Feasts and Fasts 2024 show the same fabrication pattern as the Ethiopian Senkessar work.** 3 of 6 checked so far (Fabian, Phillips Brooks, Florence Li Tim-Oi) were completely composed/fabricated collects — different openings, different theology, different structure from LFF's actual text — not paraphrases or wording drift, but different prayers entirely, sounding plausible for each saint's known biography. This is no longer an isolated finding (as it first appeared with Fabian alone); it looks systemic across the modern/20th-century saint collects specifically. Every remaining LFF-sourced collect in the corpus should be treated as unverified until individually checked — a few checking out correctly (e.g. James of Jerusalem) does not establish that the rest are fine.

Also confirmed this session: Proper 6, 7, 8, and 13 collects each contained text belonging to a **different** Proper entirely (not wording errors — wrong content assigned to the slot), and these are live/served content (confirmed via `data/season/ordinary1.json` referencing them directly), not dead data. Separately, `bcp-collect-ordinary-2/4` and siblings were confirmed to be dead data (zero calendar file references) — still wrong, but not currently served, and deprioritized accordingly.

**Process note:** while updating the dashboard for the LFF-fabrication finding, caught a repeat of the earlier bad-escape mistake before it shipped — Python's own parser rejected the malformed string before the file was ever written. The fix: build note text as plain Python strings with real apostrophes, then escape via `.replace("'", "\\'")` for JS embedding, rather than hand-typing escape sequences into source. `node --check` remains mandatory before every commit to audit-ledger.html, confirmed clean both before and after this update.

**Process note, 2026-07-06:** patch files (`.patch`, generated via `git format-patch` for hand-off since this environment has no push credentials) are transport only, not a record to maintain. Once a patch is applied via `git am` and confirmed pushed (commit hash visible in `git push` output matching what was generated), it is permanently part of branch history — the `.patch` file itself should be deleted, not archived or numbered as an ongoing series. `git log` on the actual branch is the single source of truth for what's applied; patch files are not.

## Session, 2026-07-05 (resumed) — Holy Days collects batch 3, applied

Applied the 8 collect fixes left pending in `RESUME_PROJECT_NOTE.md` (Saint Bartholomew, Saint Mary the Virgin, Saint Michael and All Angels, Saint John Evangelist, Nativity of Saint John the Baptist, Saint Philip and Saint James, Saint Mark, Conversion of Saint Paul), plus the previously-unresolved Holy Cross Day entry, to `components/anglican.json`. All 9 re-verified character-for-character against `book_of_common_prayer.pdf` (confirmed 1979 BCP text) before writing, per standing rule — not applied as-is from the prior session's draft.

**Method-correction finding:** re-verification caught that the prior session's drafted fixes, though individually correct as far as they went, **understated the actual scope of error** in several entries:
- **Saint Philip and Saint James** — both rites had a substantially different, composed second half (not just the flagged difference) and no ending doxology at all.
- **Nativity of Saint John the Baptist** — both rites were truncated, missing the doxology entirely ("...our Lord. Amen." with no "who liveth/lives and reigneth/reigns..." clause) — this was not caught or mentioned in the prior session's note.
- **Saint Michael and All Angels rite1** — had non-source wording beyond the flagged doxology reorder ("mortals" for "men", clause order changed, "here on earth" added).
- **Saint John Evangelist rite1** — was missing "we beseech thee" and had reordered/altered phrasing beyond the flagged doxology reorder; only rite2 matched the prior session's fix scope exactly.
- Several rite1 (traditional-language) texts were also missing small but real source words ("O" at the start of Bartholomew and Michael and All Angels; "the same" before "thy Son"/"Jesus Christ" in Mary the Virgin and Saint Mark) that a targeted wording tweak wouldn't have caught.

**Standing lesson:** a prior session's draft fix, even one explicitly recorded as "verified against source," must be re-verified against the primary source at the time it is actually applied — not trusted and applied as-is. This is consistent with, and reinforces, the existing standing rule not to trust other documentation in this repo without independent verification; it now applies to Claude's own prior-session notes as well as to `structure.json` and the like.

Left as-is (verified as trivial, non-substantive variance only, consistent with the earlier Andrew/Thomas precedent): Conversion of Saint Paul rite1 (comma placement only) and Holy Cross Day rite2 (already matched source exactly; only rite1 needed "unto himself" restored).

Dashboard (`audit-ledger.html`) Collects note and `SEED_VERSION` (now `v10-2026-07-05-collects-batch-3`) updated in the same action; `node --check` run clean on the extracted script both before and after. `components/anglican.json` re-validated as well-formed JSON after edits.

**Still open per finish-what-we-start rule:** Morning Prayer Collects are not complete — the remaining Common of Saints collects beyond the Holy Days already covered, and the broader Collects-vs-LFF-2024 audit noted above, remain outstanding before Morning Prayer as a whole can be marked done.

## Deferred, 2026-07-06 — Common of Saints collects: new-build, not repair, scheduled after BCP audit completes

Checked for an existing ID/schema convention for Common of Saints collects (the generic BCP1979 formularies for a Martyr, a Missionary, a Pastor, a Theologian/Doctor, a Monastic/Religious, "Of a Saint," etc. — traditional-language pages ~195–199, contemporary ~246–251) before starting any pull from the source PDF. Found none:

- No `bcp-collect-common-*` or similar ID anywhere in `components/anglican.json` (which runs Holy Days/Sundays/propers through St. Andrew + mission prayers, then stops — 133 collect entries total, none Common-of-Saints).
- `components/common.json` is unrelated (Lord's Prayer, Gloria Patri, Creeds, Kyrie).
- Checked `documentation/BCP_PROPERS_DOCUMENTATION.md`, `documentation/CALENDAR_ENGINE_DOCUMENTATION.md`, `documentation/STRUCTURE_JSON_CONTRACT.md` — no mention.
- Checked how `VARIABLE_COLLECT` resolution actually works in `js/office-ui.js` (`dailyData.collect` per calendar day, resolved against `anglican.json` IDs, with one hardcoded manual ID-mapping exception for Transfiguration) and confirmed via `data/season/*.json` that every day currently in the calendar points to an individually-named saint collect, never a generic Common-of category. So there is no live broken reference this would fix — the gap is real but not currently blocking anything in production.

**Decision (Josh, 2026-07-06):** this is a fresh build requiring its own architecture and schema (ID naming convention, storage location — new file vs. appended to `anglican.json`, and how/whether the calendar engine should ever resolve a saint to a Common-of collect as a fallback when no individual collect exists), not a targeted repair like the Holy Days batch. Scheduled to be picked up as its own task **after** the current BCP repair work (remaining Holy Days/Common-of-Saints-as-individually-named audit gaps, and the LFF-2024 cross-check) is finished — not before. Do not start pulling BCP1979 Common of Saints text or generating new JSON entries until this is explicitly next in the queue.

## Deferred, 2026-07-06 — Quinquagesima/Sexagesima/Septuagesima as opt-in historical add-ons, plus broader pre-1979 content review

Discussed in the context of the Proper 4 fix above (which removed a genuine 1928 BCP Quinquagesima collect that had contaminated live data). Josh's framing: the 1979-only rule exists to prevent an AI from *accidentally* substituting wrong-source content when it's supposed to be rendering 1979 BCP — it is not a ban on Josh *deliberately* choosing to add clearly-labeled historical/pre-1979 material as an opt-in layer on top of the 1979 base, where doing so serves the project's actual goal (helping people pray and grow in holiness), not just fidelity for its own sake.

**Decision:** treat this the same way as Common of Saints — a new feature requiring its own architecture (settings toggle vs. calendar overlay vs. something else; how it interacts with the existing Epiphany-season structure so the pre-Lenten Sundays slot in correctly relative to Ash Wednesday; sourcing the actual historical collects rigorously from a legitimate historical text such as the 1662 BCP, not composed from memory) — not started now, not a repair-track item. Logged as a second deferred-feature item alongside Common of Saints.

**Broader follow-on, also deferred:** Josh separately asked that we keep an eye out, going forward, for other content that was present in the 1928 BCP or earlier editions and removed in the 1979 revision, which might be spiritually valuable to offer as similarly clearly-labeled, opt-in historical extras (not defaults, not silently blended into 1979 output). Not a specific task yet — no list exists — but any future encounter with pre-1979 content during audit work should be flagged for this bucket rather than simply deleted-and-forgotten, the way Quinquagesima almost was.

**Both items remain queued behind the current repair-track work** (the ~70-item automated-sweep triage, next up per the resume note) and are not to be started until explicitly next in the queue.

## Session, 2026-07-06 — Automated-sweep triage: first pass

Re-ran the automated "no trace in BCP1979.pdf" sweep against the current (post-merge) state of `anglican.json`, using a more targeted method (a 6-word chunk from partway into each collect, rather than the earlier crude whole-text match) to reduce false positives. Returned 32 hits — down substantially from the earlier ~70, both because many items have since been fixed and because of the improved method. Of these 32, several were entries already hand-verified correct earlier this session (`bcp-collect-grace`, the six genuine LFF saints, Pentecost) — confirming the known false-positive pattern (PDF line-wrap/hyphenation artifacts) rather than new problems.

**Dead-data finding, extended:** checked live/dead status for every remaining flagged item before spending effort on it. The entire `bcp-collect-ordinary-N` family (14 entries beyond the already-known-dead ordinary-2/4: ordinary-1, 3, 4, 6, 10, 15, 18, 21, 23, 25–29) is confirmed dead — zero references anywhere in `data/season/*.json`. Worth flagging even though deprioritized: this dead bucket has **serious internal corruption** — several entries have rite1 and rite2 holding two entirely different prayers, and ordinary-25/26/27/28 are near-duplicates of each other (same text reused across four different Sundays). None of this is fixed (per established practice, dead data is deprioritized behind live content), but it's recorded here in case this family is ever revived or repurposed rather than deleted outright. `bcp-collect-easter-wednesday` is also confirmed dead (zero references under any naming convention).

**Live items checked and fixed** (all verified via `book_of_common_prayer.pdf` before editing, all confirmed referenced by `data/season/*.json`):

- **Proper 3** — both rites held Week-after-Trinity-Sunday text (identical to dead `ordinary-1`), not Proper 3's actual text at all. Replaced, both rites.
- **Proper 14, rite1** — held Proper 15's traditional-language text (misassigned). rite2 was already correct. Fixed rite1.
- **Proper 15, rite1** — held unrelated text matching neither Proper 15 nor any of its neighbors precisely (closest to an old Trinity-numbered collect). rite2 was already correct. Fixed rite1.
- **Proper 18** — both rites wrong: rite1 held old Trinity-21-style text, rite2 held Proper 20's actual text. Replaced, both rites.
- **Advent 2, rite1** — inserted "didst" not in source ("who didst send thy messengers" → "who sent thy messengers"). rite2 was already correct.
- **Epiphany 1 (First Week after the Epiphany), rite1** — several small restorations against the actual Epiphany Day collect it borrows (per the BCP's own rubric that the Epiphany Day collect serves the weekdays following): missing "who," "only-begotten" shortened to "only," "behold" changed to "see," missing "the same" before "Jesus Christ our Lord." rite2 was already correct. Note: confirmed this entry is NOT a misassignment — the BCP rubric explicitly directs the Epiphany Day collect to serve weekdays between Epiphany and the following Sunday, and Baptism of Our Lord Sunday has its own separate, already-correct entry (`bcp-collect-baptism-of-our-lord`).
- **Easter 6, rite1** — "them that love thee" corrected to "those who love thee," and a truncated doxology restored (was cut off at "through Jesus Christ our Lord. Amen." with no "who liveth and reigneth..." clause). rite2 was already correct.
- **James the Apostle, rite1** — "today" corrected to "this day" (trivial single-word restoration to match source exactly). rite2 was already correct.

All fixes validated as well-formed JSON. Remaining flagged items from this pass, not yet re-checked in this session, are limited to entries already confirmed correct earlier or confirmed dead — this pass is effectively complete for live content, pending a final confirmation sweep.

## Session, 2026-07-06 — Full Canticle set built (Canticles 1–21)

Before writing anything, checked the BCP1979's own Table of Contents and canticle rubrics (`book_of_common_prayer.pdf` pp. 46, 83–84, 143–144) to establish the true scope rather than guessing from memory. Found: a 7-canticle traditional-language set (pp. 47–52, numbered 1–7) and a 14-item contemporary-language set (pp. 85–95, numbered 8–21), where canticles 12, 13, 15, 16, 17, 20, and 21 are the contemporary-language renderings of the same texts as traditional 1, 2, 3, 4, 5, 6, and 7 respectively, and canticles 8, 9, 10, 11, 14, 18, and 19 exist **only** in contemporary language — they were newly introduced in the 1979 revision and have no traditional-language form in the BCP at all.

Only 8 of the resulting distinct texts existed in `anglican.json` before this session (Venite, Jubilate, Phos Hilaron, Te Deum, Benedictus es Domine, Benedictus, Magnificat, Nunc Dimittis). **9 were completely missing:**

- **A Song of Creation (Benedicite, omnia opera Domini)** — both rite1 (traditional, Canticle 1) and rite2 (contemporary, Canticle 12). Transcribed the Invocation, Cosmic Order, Earth and its Creatures, and People of God sections as a single flowing text (the structural "I/II/III/IV" subheadings and Doxology label in the source are organizational markers for optional partial use, not part of the sung/said text itself — consistent with how no other canticle in this file carries internal section labels).
- **Glory to God (Gloria in excelsis)** — both rite1 (traditional, Canticle 6) and rite2 (contemporary, Canticle 20). Note: this is the Morning Prayer canticle use of Gloria in excelsis; a Eucharistic-context use, if the app has one, is a separate component not touched here.
- **The Song of Moses (Cantemus Domino)** — Canticle 8, contemporary only.
- **The First Song of Isaiah (Ecce, Deus)** — Canticle 9, contemporary only.
- **The Second Song of Isaiah (Quaerite Dominum)** — Canticle 10, contemporary only.
- **The Third Song of Isaiah (Surge, illuminare)** — Canticle 11, contemporary only.
- **A Song of Penitence (Kyrie Pantokrator)** — Canticle 14, contemporary only.
- **A Song to the Lamb (Dignus es)** — Canticle 18, contemporary only.
- **The Song of the Redeemed (Magna et mirabilia)** — Canticle 19, contemporary only.

For the 7 contemporary-only canticles, followed the existing precedent set by Venite and Jubilate (both already flat strings, no rite1/rite2 split, since no traditional-language form exists to pair against) rather than inventing a new schema shape.

**Verification method:** built each entry as a literal transcription typed directly from the extracted PDF text (not from memory), then ran an automated chunk-match sweep (8-word rolling windows, asterisks and page-footer noise stripped from both sides) against the full PDF text to catch transcription errors before considering this done. All 9 entries passed cleanly; the handful of initial chunk mismatches were confirmed to be page-break/footer artifacts (e.g., "86 Morning Prayer II" landing mid-sentence in the raw extraction) — the same class of false positive already established with `bcp-collect-grace` earlier in this audit — not actual content errors.

**Not yet done:** the Table of Suggested Canticles (p. 143–144, which canticle pairs with which day/season/reading) has not been audited — the 9 new entries exist as correct standalone texts, but nothing yet governs when the app should actually select and display each one. This is a separate follow-on task, not addressed in this session.

## Session, 2026-07-06 — Full-coverage Collects audit begun: true scope established, Advent through Holy Week done

Josh pushed back on the amber/red/green semantics: amber must mean "not yet audited," not "audited with some remaining doubt." This prompted an honest accounting of actual Collects coverage rather than continuing to rely on the automated sweep's necessarily-incomplete flagging.

**Established the true numbers first.** Of 133 total collect entries in `anglican.json`, exactly **92 are live** (referenced by some real calendar mechanism in the codebase — checked via full-repo grep, not just `data/season/`) and 41 are dead (zero references anywhere). Cross-referencing against every fix and confirmation made across this entire audit history, only **29 of the 92 live collects had actually been checked** prior to this session — batches so far had covered real ground, but nowhere near the whole live set. The remaining 63 had never been examined at all.

**Correction to an earlier assumption:** the entire LFF-2024 cross-check (Fabian, Agnes/Cecilia, Vincent, Phillips Brooks, Florence Li Tim-Oi, Chrysostom) was performed on collects that turned out to be **dead data** — none of the 6 genuine LFF entries are referenced by any live calendar mechanism. The fixes remain correct and worth having, but that entire piece of work did not move any live-content item out of amber. Worth knowing for prioritization going forward: dead-data correctness matters less than live-data correctness.

**Systematic pass, live collects, Advent through Holy Week (25 checked, all verified against `book_of_common_prayer.pdf` directly):**

- **Advent 1, rite1** — missing "one God" and "for" before "ever." Fixed.
- **Advent 3, rite1** — "sore let and hindered" (a pre-1979 phrase) restored to 1979's "sorely hindered." A second, independent 1928-contamination find, same class as the Proper 4/Quinquagesima finding from an earlier session.
- **Advent 4, Christmas Day** — both rites verified verbatim, no changes.
- **Christmas 2, both rites** — an inserted "our Lord" not present in the source, removed from both.
- **Epiphany (the Day itself, `bcp-collect-epiphany` — distinct entry from `epiphany-1`), rite1** — was **entirely pre-1979 text** ("manifest thy Son to the Gentiles... fruition of thy glorious Godhead"), not 1979 BCP at all. rite2 on the same entry was already correct 1979 text — the two rites had been sourced from different eras. Replaced rite1 with the real 1979 text.
- **Epiphany 2, 4, 5** — verified verbatim, no changes (including confirming the "who with thee and the Holy Spirit liveth and reigneth" word order is genuinely correct in the source for Epiphany 2, not an error — checked directly rather than assumed from pattern-matching against other collects).
- **Epiphany 3, rite1** — missing "all" ("we and the whole world" → "we and all the whole world"). Fixed.
- **Last Sunday after the Epiphany, rite1** — was **entirely the wrong collect** (borrowed from the Transfiguration, August 6 — a different feast with different text). Confirmed via direct source check that Last Epiphany has its own distinct traditional-language collect. rite2 was already correct. Fixed rite1.
- **Ash Wednesday** — verified verbatim, no changes.
- **Lent 1 and Lent-ferial, rite1** (identical text, correctly so per the BCP's own rubric that the same collect serves the weekdays) — was the contemporary text mechanically converted to "thee/thou" form rather than the genuine traditional-language BCP1979 text, the same bug pattern found with St. John Evangelist in an earlier session. Replaced both with the real traditional text.
- **Lent 2, 3, 4** — verified verbatim, no changes.
- **Lent 5, rite1** — missing "O" at the start. Fixed.
- **Palm Sunday, Holy Monday** — verified verbatim, no changes.
- **Holy Tuesday** — **both rites were entirely Wednesday's text**, duplicated; the real, distinct Tuesday collect was missing from the file altogether. Replaced with the genuine Tuesday text, both rites.
- **Holy Wednesday, rite1** — was a paraphrase, not the genuine traditional-language text (same "converted-contemporary" bug pattern as Lent 1). rite2 was already correct (confirmed it's genuinely Wednesday's real contemporary text, now correctly it belongs only to Wednesday since Tuesday no longer wrongly borrows it). Fixed rite1.
- **Maundy Thursday** — both rites had real wording/doxology-form differences from source. Fixed both.
- **Good Friday** — rite1 doxology form differed ("Holy Ghost ever...world without end" vs. app's "Holy Spirit...for ever and ever"); rite2 had "for which" where source says "for whom." Fixed both.
- **Holy Saturday** — verified verbatim, no changes.

**Running total: 54 of 92 live collects now verified** (29 before this session + 25 this session). **38 remain completely unchecked**: Easter 2–5, 7, Easter Day, Ascension, remaining Propers (9, 10, 11, 12, 16, 17, 19–29), Trinity Sunday, All Saints, Annunciation, Presentation, Holy Innocents, Holy Name, Peter & Paul, Mary Magdalene, Luke, Matthew, Simon & Jude, St. Stephen, Confession of St. Peter, and `default-ferial`. This list, not the vague "still open" language used in earlier ledger entries, is the actual remaining scope — continuing systematically next.

**Continued, same session — Easter season through Ascension (7 checked):**

- **Easter Day, rite1** — doxology form differed ("with thee and the Holy Ghost, ever one God" vs. source's "with thee and the same Spirit ever, one God"). Fixed.
- **Easter 2, rite1** — "express" should be "profess" (real word-choice error, not archaism), and missing "the same" before "Jesus Christ our Lord." Fixed. rite2 already correct.
- **Easter 3, rite2** — "and the Holy Spirit" should be "in the unity of the Holy Spirit" (construction difference). Fixed. rite1 already correct (confirmed earlier this session).
- **Easter 4** — verified verbatim, no changes.
- **Easter 5, rite1** — truncated doxology restored (was cut off at "our Lord. Amen." with no "who liveth and reigneth" clause). Fixed. rite2 already correct.
- **Ascension, rite1** — missing "O," "end of the world" should be "end of the ages" (real wording error), and truncated doxology restored. Fixed. rite2 already correct.
- **Easter 7, rite1** — "the Holy Spirit" should be "the same Holy Ghost" (source's specific word choice for this collect). Fixed. rite2 already correct.

**Running total: 61 of 92 live collects verified. 31 remain**: Propers 9, 10, 11, 12, 16, 17, 19–29 (17 entries), Trinity Sunday, All Saints, Annunciation, Presentation, Holy Innocents, Holy Name, Peter & Paul, Mary Magdalene, Luke, Matthew, Simon & Jude, St. Stephen, Confession of St. Peter, `default-ferial`.

**Continued, same session — Propers 9–17 and Trinity Sunday (7 checked):**

- **Proper 9, rite1** — truncated doxology restored (rite2 already correct).
- **Proper 10, rite1** — truncated doxology restored (rite2 already correct).
- **Proper 11** — rite1 had different wording throughout plus a truncated doxology; rite2 had only the truncated doxology. Both fixed to match source exactly.
- **Proper 12, rite1** — the ending was an older-form construction ("grant this, O heavenly Father, for the sake of...") not matching 1979 at all, and was itself truncated. Replaced with the real 1979 text. rite2 already correct.
- **Proper 16 and Proper 17 — both entries were sharing Proper 17's content in rite2, and each had a different wrong/unrelated rite1.** This meant Proper 16's real, distinct collect was completely absent from the file. Both entries fully corrected: Proper 16 now has its own real text (both rites), Proper 17 now has its own real text (both rites, rite1 previously held a different, unrelated collect entirely).
- **Trinity Sunday** — verified verbatim, both rites, no changes.

**Running total: 68 of 92 live collects verified. 24 remain**: Propers 19–29 (11 entries), All Saints, Annunciation, Presentation, Holy Innocents, Holy Name, Peter & Paul, Mary Magdalene, Luke, Matthew, Simon & Jude, St. Stephen, Confession of St. Peter, `default-ferial`.

## Standing Workflow Practices (consolidated, 2026-07-06)

These accumulated piecemeal across this session's work and are collected here so a future session doesn't have to rediscover them one at a time.

**Source discipline:**
- Never trust a prior session's "confirmed fixed" or "checking out correctly" note without re-verifying against the primary source at the point of application. This caught real, materially different problems (a still-fabricated collect; genuine wording errors) on multiple separate occasions this session. Treat every such note as a lead to re-check, not a settled fact.
- Lectionary readings for the Daily Office: **1979 BCP only** (bcponline.org or justus.anglican.org/resources/bcp/bcp79.pdf). Never RCL, USCCB, Satucket, ACNA 2019, 1928 BCP, or any other source. This rule is about preventing *accidental* substitution of the wrong source — it does not prohibit Josh *deliberately* adding clearly-labeled, opt-in historical content (see the Quinquagesima/Sexagesima decision below) on top of the 1979 base.
- "Live" vs. "dead" data must be checked across the **whole codebase** by grep, not assumed from one likely-looking directory (`data/season/*.json` alone missed the actual location of fixed-date saint-day references, which cost real misprioritized effort on the LFF cross-check).
- Dashboard status colors: **amber means "not yet audited," full stop** — not "audited, mostly fine, some doubt remains." An item is amber until it has actually been checked, at which point it becomes green (confirmed correct) or red (confirmed wrong, needs fixing). Vague "still open" language that doesn't give a precise, itemized remaining-scope list is not acceptable going forward.

**Git / patch-application workflow (this sandbox has no push credentials):**
- Generate patches with `git format-patch`, verified with `git apply --check` against a **fresh clone** of the actual current remote branch — never just the local working copy, which can silently diverge.
- **`git am` regenerates commit hashes.** After Josh applies and pushes a patch, this sandbox's local copy of that same commit has a *different hash* than what's actually on GitHub, even though the content is identical. This causes the next patch to be built on a stale base. Fix: `git fetch origin`, then `git rebase --onto origin/<branch> <old-local-commit> HEAD` to rebuild pending work onto the real current state before generating the next patch. Always re-verify with a fresh clone afterward.
- Patch files are **transport only, not a record**. Once applied and confirmed pushed (commit hash in `git push` output matches), the `.patch` file itself is disposable — no numbering scheme, no archive. `git log` on the actual branch is the single source of truth for what's applied.
- **File hand-off is unreliable on mobile** (phone downloads land on the phone's local storage, with no filesystem connection to a cloud Codespace) but works via **drag-and-drop into the Codespace's browser file explorer on a laptop**. Heredoc-paste-into-terminal is a fallback, but must be split into two separate paste actions (create the file, confirm it landed via e.g. `ls filename`, *then* run the git commands) — combining both into one paste risks the shell only executing part of it.
- Provide the actual explicit command block every time, even if "same as before" would be shorter — Josh is not a coder and referencing back to earlier instructions creates friction. Same principle applies to code edits generally: always give full surrounding-context landmarks, never a single bracket.
- Content-review checkpoints (a plain-English before/after summary, no code diffs) happened before merging larger batches to `main`; smaller/mechanical batches were sometimes merged directly by Josh without a separate review pass, which is his call to make.

## Session history recap, 2026-07-06

Brief account of what this session accomplished, for quick orientation:

1. Applied the 8 pending Holy Days collect fixes plus Holy Cross Day (batch 3), re-verifying all against `book_of_common_prayer.pdf` rather than trusting the prior session's draft — found several understated errors in the process.
2. Produced a full plain-English content-review document for Josh; he reviewed and approved merge to `main`.
3. Closed the LFF-2024 cross-check: found Fabian was still fully fabricated despite an earlier session claiming otherwise; found Joseph and James of Jerusalem were misclassified as LFF when they're actually BCP1979 entries; fixed all three.
4. Deferred two new-build features rather than starting them opportunistically: Common of Saints (no existing schema anywhere in the codebase) and Quinquagesima/Sexagesima/Septuagesima as opt-in historical add-ons (Josh's explicit framing: the 1979-only rule prevents accidental substitution, not deliberate curated extras).
5. Built the full Canticle set (1–21) — 9 canticles were completely missing from the codebase and were transcribed and verified against source.
6. Established the true scope of the Collects audit: 92 of 133 total collect entries are live, 41 dead — and corrected an earlier assumption that the LFF work had touched live content (it hadn't). Systematically worked through the live collects season by season (Advent through Holy Week, Easter through Ascension, Propers 9–17 and Trinity Sunday), finding and fixing several serious misassignments along the way (Epiphany Day and Last Sunday after Epiphany both had entirely wrong text; Holy Tuesday and Proper 16 both had their real content missing from the file, replaced by a neighboring day's text).
7. All of the above is merged to `main`. **68 of 92 live collects are now verified; 24 remain**, listed explicitly rather than left vague.

## Session, 2026-07-06 — LFF 2024 cross-check, recon and fixes applied

Before starting, re-established the actual scope of the "LFF-sourced collects" bucket rather than trusting the prior session's count, per standing rule. Found **two of the eight previously-assumed LFF candidates are actually misclassified — Saint Joseph and Saint James of Jerusalem are both Major Feasts fixed in the BCP1979 itself**, not LFF at all (confirmed via `book_of_common_prayer.pdf`, which lists both explicitly as Major Feasts and gives full collect text for each). This means the true LFF-sourced bucket is 6 entries, not 8.

Checked all 6 genuine LFF entries against `lesser_feasts_and_fasts_-_2024__final_.pdf` directly:
- **Agnes and Cecilia, Vincent, Phillips Brooks, Florence Li Tim-Oi, John Chrysostom** — all confirmed to match the LFF 2024 text exactly (or with only trivial punctuation variance, consistent with the established Andrew/Thomas precedent for what counts as non-substantive). These were genuinely fixed correctly in an earlier session.
- **Fabian** — **confirmed still broken.** Despite being identified as fabricated in an earlier session's finding, the actual fix was never applied to the data — the entry still contained the fully invented text ("Almighty God, you called Fabian to be a faithful pastor..."), which bears no resemblance to the real LFF 2024 collect. This is a real gap between what a prior session's ledger note claimed and what the data actually contained — another instance of the standing lesson that prior-session claims must be re-verified, not trusted. Additionally, the entry was a flat string rather than the `{rite1, rite2}` object shape used everywhere else in the file (harmless at runtime — `resolveText()` in `js/office-ui.js` falls back gracefully — but meant rite1 and rite2 users saw identical, both-wrong text). Fixed: replaced with the actual LFF 2024 text for both rites, restructured to the standard schema.
- **Saint Joseph** (BCP1979, not LFF) — near-exact match; one trivial fix applied (rite1 "thine incarnate Son" → "thy incarnate Son" to match the source's actual archaic form).
- **Saint James of Jerusalem** (BCP1979, not LFF) — rite2 matched exactly (trivial comma only); **rite1 had real errors** that an earlier session's "checking out correctly" note missed: was missing "we beseech thee," had "after the example" changed to "following the example," and used a different ending clause ("through Jesus Christ our Lord" instead of the source's "through the same our Lord Jesus Christ"). Fixed.

All edits validated as well-formed JSON. `components/anglican.json` re-checked after edits.

**Standing lesson reinforced again:** this is now the second time in two sessions that a prior session's "confirmed fixed" or "checking out correctly" note did not match what was actually in the data. The practice of re-verifying against the primary source at the point of application — rather than trusting a prior session's own ledger entry — has now caught real, materially different problems (a still-fabricated collect; a real wording error) on both occasions it's been applied. This is not a one-off; treat every "confirmed" note from a prior session as a lead to re-check, not a settled fact, going forward.

**LFF-2024 cross-check item, closed** (all 6 genuine LFF entries now verified correct; the 2 misclassified BCP1979 entries also fixed as a byproduct). Next up per the resume note: the ~70-item manual triage list from the earlier automated BCP1979 sweep.

## Decisions, 2026-07-06 — content review resolved, cleared for merge

Josh reviewed the consolidated content-review document (all substantive text changes across the unmerged `audit-ledger-workspace` commits) and resolved the one open question:

- **30-Day Psalter, Day 31: KEEP the 1662 customary repeat of Day 30's psalms.** Decision explicitly grounded in appeal to longstanding church tradition — the custom predates the 1979 BCP and remains an accepted practice even though the 1979 BCP prints no explicit 31st-day rubric of its own. Not to be revisited as an open question going forward; this is settled.
- **Quinquagesima** (the 1928-BCP content that was removed from Proper 4, see "Genuine 1928 BCP violation" entry above) — Josh confirmed the removal was correct given the 1979-only rule, but noted historical interest in the pre-Lenten Sunday sequence (Septuagesima/Sexagesima/Quinquagesima) for its own sake, separate from the live liturgy. Not an app-data item; flagged only as a possible future non-liturgical writing topic, no action taken in the codebase.
- **Mission Prayer rotation** (daily rotation between the 3 real BCP options) — confirmed as the desired approach.

All content changes reviewed and approved for merge to `main`.

## Correction, 2026-07-06 — fix-workflow decision superseded

**The 2026-07-05 "Fix workflow, confirmed by Josh" decision (see "Resolved" above) is superseded as of this entry.** That decision established a fix-as-you-find model: mechanical corrections get committed to the audit branch immediately upon verification, without waiting for per-item sign-off, so auditing can continue uninterrupted. Josh has clarified that this was the wrong choice, and it should not have been offered as the default — the correct workflow is:

- **Audit first, record findings, do not fix in place.** When auditing a section (an office, a data lane, a table), go through the full scope and record every finding — status (correct / wrong / misassigned), what's wrong, what the source actually says — without editing the underlying data or code as you go. Establish full, precise coverage (every item classified, no vague "still open" language) before any fix is applied.
- **Fix systematically as a distinct second phase**, once the audit for that scope is complete and the findings have been recorded. This mirrors the "finish what we start" principle already in place, but applies it one level earlier: finish the *audit* of a scope before starting *repairs* on it, rather than interleaving the two.
- This supersedes the "do not wait for per-item sign-off... continue auditing forward" language from 2026-07-05 for future work. The two-tier mechanical-vs-judgment-call distinction from that entry still holds for *how* something eventually gets fixed once the fix phase begins — it's the *timing* (fix-as-you-go vs. audit-then-fix) that changes, not the correction-approval tiers themselves.
- **Not retroactive.** Work already committed under the old model (the Collects audit closure and the canticle-selection-logic fix, both earlier in this session) was correct under the instruction in force at the time and is not being unwound. This correction governs work from this point forward — starting with the Daily Office Lectionary (Appointed Psalms + Lessons with Canticles reading assignments) audit, which will now proceed as a full record-first pass, season by season, with fixes applied only after each season's audit is complete and reviewed.

## Session, 2026-07-06 — Daily Office Lectionary audit, Advent season (record-only pass)

ADVENT SEASON — FULL AUDIT COMPLETE 2026-07-06 (record-only pass, no fixes applied). 26 of 26 entries classified, zero amber remaining.

GREEN, verified verbatim against BCP1979.pdf Daily Office Lectionary pp.936-939 (11 entries): Dec 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12.

RED -- minor (1 entry): Nov 29 (First Sunday of Advent) -- Year One Gospel reading_gospel_ep_year1 says "Matthew 25:1-13", source says "Matthew 25:1-18" (verse range short by 5 verses).

RED -- moderate, Year One readings corrupted while Year Two is correct (7 entries): Dec 13-19 (Week of 3 Advent, all 7 days). reading_ot_mp_year1 / reading_epistle_mp_year1 / reading_gospel_ep_year1 all show content belonging to OTHER dates -- OT citations are shifted forward by roughly 2 Isaiah-passages per day (compounding across the week), and several Epistle citations (e.g. "Acts 28:16-31", assorted Revelation ranges) do not match ANY correct Advent DOL entry at all, suggesting content pulled from an unrelated part of the lectionary rather than a simple date-shift. Year Two fields for all 7 days are fully correct.

RED -- severe, both years wrong with duplication (4 entries): Dec 20, 22, 23, 24. Both Year One and Year Two reading fields are wrong. Dec 20 and Dec 22 share IDENTICAL Year Two Epistle/Gospel content (Revelation 7:1-8 / Matthew 26:1-16) despite being different calendar days -- the same duplication-across-days bug pattern found repeatedly in the Collects audit. Psalms also shift by one day starting Dec 22 (each day showing the prior day's true psalm). Dec 24 additionally has BOTH Gospel fields (reading_gospel_ep_year1, reading_gospel_mp_year2) completely empty.

RED -- Holy Days, wrong lectionary track / missing field (2 entries):
- Nov 30 (St. Andrew): psalms and 3 of 4 true DOL readings match the DOL's own Holy Days table (p.995) exactly. But that table assigns FOUR readings per Holy Day (2 for MP, 2 for EP) and the app schema has only 3 reading slots (ot/epistle/gospel) -- the EP Old Testament reading (Isaiah 55:1-5) has no field to live in and is simply absent. Architecture gap, not just a content error.
- Dec 21 (St. Thomas): psalms match, but all 3 readings present (Habakkuk 2:1-4 / Hebrews 10:35-11:1 / John 20:24-29) are the EUCHARISTIC lectionary's St. Thomas readings (BCP p.921), not the Daily Office Lectionary's (which should be Job 42:1-6 / 1 Peter 1:3-9 / Isaiah 43:8-13 / John 14:1-7) -- the wrong lectionary track was used for this Holy Day. Same missing-4th-reading schema gap as St. Andrew.

OPEN QUESTION for Josh, not yet decided: several entries (Dec 5, 13, 16, 17, 19 psalms_ep) show the BCP's bracketed/optional trailing verses (e.g. "(8-14)", "[53]") dropped from the citation. The source itself defines brackets/parentheses as marking OPTIONAL content that may be omitted, so this may not be an error at all -- flagged as a format-consistency question, not classified red or green pending a decision on whether citations should include the full bracketed form or the shorter required form.

Total: 11 green, 15 red (1 minor + 7 moderate + 4 severe + 2 Holy-Day/schema-gap), 1 open format question not yet decided. No entries remain amber (unaudited). Per the new audit-then-fix workflow, no data has been changed yet -- this is the full record for this season, awaiting direction on the fix phase.

## Decision, 2026-07-06 — bracketed/optional psalm verses: policy settled, Advent reclassified

**Josh's rule, stated plainly: nothing is optional — use the full reading.** This resolves the open format question flagged in the Advent audit above, and is grounded directly in the BCP's own rubric (p.934): "Brackets and parentheses are used... to indicate Psalms and verses of Psalms which may be omitted... Those who desire to recite the Psalter in its entirety should, in each instance, use the bracketed Psalms rather than the alternatives." Going forward, for every psalm citation across the whole DOL audit (not just Advent):

- **Parenthetical verses within a psalm** (e.g. `21:1-7(8-14)`) — include the full range: `21:1-14`.
- **Bracketed whole psalms offered as an addition** (e.g. `49, [53]`) — include the bracketed psalm: `49, 53`.
- **Bracketed psalms offered as the "entire" option against a substitute** (e.g. `[59, 60] or 33`) — use the bracketed option (`59, 60`), per the BCP's own explicit instruction, not the substitute.

**Advent reclassified accordingly** (still record-only, no data touched):
- **Dec 5** — moves from "open question" to RED. psalms_mp incomplete (`Psalm 20, 21:1-7` should be `Psalm 20, 21:1-14`); psalms_ep incomplete (`Psalm 110:1-5, 116, 117` should be `Psalm 110:1-7, 116, 117`).
- **Dec 13** — additional finding on top of its existing red status (Year One readings corrupted, see above): psalms_mp incomplete (`Psalm 63:1-8, 98` should be `Psalm 63:1-11, 98`).
- **Dec 16** — psalm citation confirmed CORRECT under this policy (`Psalm 49, 53` already includes the bracketed psalm) — no psalm-level finding here; the entry remains red only for its Year One reading corruption.
- **Dec 17** — additional finding: psalms_ep is not just incomplete but WRONG — the app used the substitute Psalm 33 instead of the bracketed full-Psalter option, which per this policy should be `Psalm 59, 60`.
- **Dec 19** — additional finding: psalms_ep incomplete (`Psalm 138, 139:1-17` should be `Psalm 138, 139:1-23`).

**Corrected Advent total: 11 green, 15 red, 0 open questions.** (The previous entry's "15 red" figure was arithmetically inconsistent with its own itemization — 1+7+4+2=14 — before Dec 5 was folded in from the open-question bucket; the corrected total of 15 red is now internally consistent.) This bracket policy applies retroactively to how all remaining season files get audited, not just Advent — every psalm citation check from here forward will apply the three rules above directly, no separate flag needed per occurrence.

## Decision, 2026-07-06 — Holy Days 4-reading schema gap: recorded as a problem, fix deferred to end of DOL audit

**Josh's ruling: if the BCP says four readings, the app provides four readings.** The schema gap found in the Advent audit (St. Andrew and St. Thomas both need 2 readings for Morning Prayer and 2 for Evening Prayer — 4 total — but `data/season/*.json` Holy Day entries currently only have 3 reading slots: `reading_ot_mp`, `reading_epistle`, `reading_gospel`, doubled for Year One/Year Two) is confirmed as a real problem, not an acceptable simplification. This is recorded here as a standing item, **not fixed now** — per the audit-then-fix workflow, the fix (adding a 4th reading slot to the Holy Day schema, and backfilling the missing reading for every Holy Day across every season file, not just Advent's two) is deferred until the full DOL audit is complete across all 8 season files. Every remaining Holy Day encountered in Christmas, Epiphany, Lent, Easter, and the Ordinary Time files should be checked against the same DOL Holy Days table (BCP1979.pdf pp.995 onward) for this same 4-reading gap, and each instance recorded here rather than fixed individually as found.




## Session, 2026-07-06 — Daily Office Lectionary audit, Christmas season (record-only pass)

CHRISTMAS SEASON — FULL AUDIT COMPLETE 2026-07-06 (record-only pass, no fixes applied). 12 of 12 entries classified, zero amber remaining.

GREEN, verified verbatim against BCP1979.pdf Daily Office Lectionary pp.939-940 (6 entries): Monday after Christmas (Dec 29), Wednesday after Christmas (Dec 31, including its Eve-of-Holy-Name evening fields), The Holy Name (Jan 1), Thursday after Christmas (Jan 2), Friday after Christmas (Jan 3), Second Sunday after Christmas (Jan 4).

RED -- minor, bracket-policy violations under the settled full-reading rule (3 entries): Christmas Day (psalms_ep should be "Psalm 110:1-7, Psalm 132", drops the bracketed verses 6-7); Tuesday after Christmas / Dec 30 (psalms_mp should be "Psalm 20, Psalm 21:1-14", drops bracketed verses 8-14); Monday before Epiphany / Jan 5 (psalms_mp should be "Psalm 2, Psalm 110:1-7", drops bracketed verses 6-7 -- this entry's Eve-of-Epiphany fields are otherwise fully correct).

RED -- severe, SYSTEMIC wrong-lectionary-track pattern (3 entries, all Holy Days): St. Stephen (Dec 26), St. John (Dec 27), and The Holy Innocents (Dec 28) all pull their Daily Office readings from the EUCHARISTIC lectionary (BCP p.996) instead of the Daily Office Lectionary's own dedicated Holy Days table (BCP p.995-996), which assigns different psalms and readings entirely. This is now confirmed systemic, not isolated -- St. Thomas in the Advent audit showed the identical bug. Of 5 Holy Days checked so far across both seasons, only St. Andrew (Advent) was correctly sourced from the DOL; the other 4 (Thomas, Stephen, John, Innocents) all used the Eucharistic track instead. Expect this pattern to recur on every remaining Holy Day in the unaudited seasons -- treat it as the default hypothesis to check, not a surprise each time. St. John additionally has a secondary error even within its (wrong-track) reading: reading_gospel_ep_year1 says "John 21:19b-25", but even the Eucharistic lectionary itself says "John 21:19b-24" -- so this entry doesn't correctly match ANY source. Same 4-reading-per-Holy-Day schema gap noted in the Advent audit applies here once these are corrected to the true DOL source (2 readings for MP, 2 for EP -- the app's 3-slot schema can't hold all 4).

Total: 6 green, 6 red (3 minor bracket + 3 severe systemic). No entries remain amber (unaudited).
