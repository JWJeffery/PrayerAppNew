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
