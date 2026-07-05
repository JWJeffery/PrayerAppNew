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
