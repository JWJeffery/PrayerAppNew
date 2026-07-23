> ## ⚠️ CRITICAL — READ THIS FIRST, EVERY TIME
>
> **This file was trimmed on 2026-07-17.** It used to be 2620+ lines and got unwieldy; the
> detailed, book-by-book narrative of the Anglican/BCP Daily Office work and the full OT/NT
> biblical corpus remediation (2026-07-06 through 2026-07-16) has been moved verbatim to
> `RESUME_PROJECT_NOTE_HISTORICAL.md`. That work is all DONE — nothing was lost, only relocated.
> This file now keeps a short summary of that completed work plus the full, unabridged detail of
> everything from the ET-AR-SY/Odes broader-canon phase onward (2026-07-14 onward), since that
> work is current and still in progress.
>
> **Your `view` tool truncates from the middle at ~16,000 characters.** If you use `view` on this
> file without an explicit full-range check, you WILL get a truncated/summarized version and WILL
> miss content — this has already caused real mistakes in this project (a resume note was twice
> characterized as stale or current based on only reading its head or a partial view, and both
> times the characterization was wrong).
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
>
> **For detail on any completed work referenced only briefly below (individual OT/NT book fixes,
> BCP Daily Office lectionary work, etc.), see `RESUME_PROJECT_NOTE_HISTORICAL.md`.**

---

## Project resume log (chronological — Anglican/BCP Daily Office work 2026-07-06 through 2026-07-10, Biblical Corpus remediation 2026-07-10 onward)

## COMPLETED WORK SUMMARY — full detail moved to RESUME_PROJECT_NOTE_HISTORICAL.md, 2026-07-17

**Anglican/BCP Daily Office work (2026-07-06 through 2026-07-10) — DONE**, with two known,
documented, non-error gaps (the Invitatory Antiphon's unsupported seasons, and Easter Day's
AM/PM schema mismatch — both are real content-representation limits, not defects, and remain
exactly as documented in the historical archive). Covered: Ordinary Time DOL rebuild (150 weekday
entries, both years, re-extracted from the BCP PDF), Advent/Christmas/Epiphany/Lent/Easter sweeps,
Holy Days lectionary-track audit, a full engine survey that found and fixed four severe defects
(day_of_season off-by-two, findEntry priority order, cross-chapter citations, a fixed-civil-date
matching bug), and the Ordinary Time redesign. See the historical archive's sessions dated
2026-07-06 through 2026-07-10 for the complete narrative.

**Biblical Corpus remediation (2026-07-10 through 2026-07-16) — DONE, entire OT + NT + Psalms
closed.** Every Old Testament book (Genesis through Malachi, plus the full deuterocanon/Apocrypha:
Tobit, Judith, Esther-with-Additions, 1-4 Maccabees, Wisdom, Sirach, Baruch, Letter of Jeremiah,
Prayer of Manasseh, 1-2 Esdras, Daniel-with-Additions, Lamentations) and all 27 New Testament books
were independently verified character-for-character across all applicable translation lanes (KJV,
DRB, Rotherham, NABRE, NRSV) and closed clean. Psalms — the largest and most complex single-book
effort in the project (9 translation lanes, non-standard schema) — closed last, including a real
false-certification catch in Grail1963 (the same failure class as 1 Enoch's) and a genuine content
recovery via a second AI agent after a hard fetch-tool truncation wall. 1 Enoch was independently,
exhaustively verified chapter-by-chapter against real primary sources (not diff-flagged spot
checks) per Josh's standing instruction, finding 70 real defects including the corpus-wide
"that"→"the" corruption bug class that later proved relevant to Jubilees too. A corpus-wide NABRE
chapter-heading fix (742 verses, 37 books) and several independent discoveries of a recurring
"chapter-boundary shift" defect class (DRB and NABRE both drifting a chapter division by one verse
in several different books) were also closed. Governance rules established during this phase and
still in force: never trust existing data files as ground truth; all content traces to primary
BCP 1979 sources only (Daily Office) or confirmed primary-source translations (biblical corpus);
Psalms deferred to the very end (completed); all Lucy-era certifications (anything dated before
2026-07-05) are void and independently re-derived. Full book-by-book narrative for all of this is
in `RESUME_PROJECT_NOTE_HISTORICAL.md`; per-book outcomes are also in `AUDIT_GOVERNANCE_LEDGER.md`'s
`GREEN_NOTES` and the dashboard's `GREEN_SEED`.

**Standing rule, still in force:** whenever Claude produces a patch or commit for Josh to apply,
always surface the exact terminal commands ready to copy-paste (`git am <patch>` / `git push origin
main`), with no explanation or walkthrough needed alongside them. Josh has had to ask for this
multiple times — don't make him ask again.

**Standing rule, added 2026-07-17 after the Shepherd of Hermas session generated three separate
patches for one piece of work (Josh called this out — rightly, it was ridiculous):** one logical
unit of work is one patch, even when it spans content + governance-ledger + dashboard + resume-note
updates. Only split into multiple patches/round-trips when there's a genuine decision point in the
middle that actually needs Josh's input before the rest can proceed (e.g. the Lightfoot-vs-modern-
chapter-numbering question that session) — never split just because the work happened to touch
several files or came together in stages. Batch everything else into the single commit that
follows the decision.

**Standing methodology, distilled from the OT/NT remediation phase, still applies to any future
character-for-character audit (including the ET/AR/SY/Odes backlog now underway):**
- Confirm source edition identity on a landmark verse before trusting anything — don't assume a
  fetched translation is the right edition just because the title matches.
- Triage by raw diff/mismatch count first, but never stop there — content-check at offset 0 before
  assuming a count mismatch means real work is needed. Across the OT/NT effort, most flagged
  "mismatches" turned out to be whitespace noise, OCR artifacts, or already-correct
  translation-structure verse-merges, not real defects.
- Watch for the chapter/section-boundary-shift failure mode: a boundary placed differently between
  source and active file can make an automated pass silently write *wrong* content while
  self-reporting clean. Spot-check multiple points per chapter, not just start/end.
- Never use automated proportional/statistical alignment for verse-boundary splits — always
  resolve by direct content comparison.
- A translation-structure verse-merge (one translation legitimately combining what another treats
  as two verses) is not a defect — confirm by reading the surrounding content before "fixing" a
  count mismatch.
- When a corruption bug or defect class is found once, run at least two sweep passes with an
  expanding pattern/word list before considering a book clean — the first "complete" pass has
  repeatedly missed real instances in this project (Jubilees' that/the sweep found new instances
  on a second pass after the first was already treated as done).
- When someone reports one instance of a bug, check the whole relevant list programmatically for
  the same bug class before fixing just the reported instance (the dashboard abbreviation
  collision fix is the most recent example).

---

## Session, 2026-07-14 continued — Corpus filing correction: Laodiceans removed, Zosimus/2 Baruch relocated

**HANDOFF — read this first if picking up fresh.** Not a content-remediation session — Josh
caught a dashboard filing bug: three non-canonical texts ("Epistle of the Laodiceans", "History
of Zosimus", "2 Baruch (CE)") had been silently appended to the end of `NT_BOOKS` in
audit-ledger.html, sitting alongside the real 27 New Testament books with no disclosure.

**Epistle to the Laodiceans is now fully removed** — Josh's explicit decision, since it isn't
canonical Scripture in any Christian tradition. File deleted, dashboard entries removed. Full
detail and the registry closure note's location in `AUDIT_GOVERNANCE_LEDGER.md`'s "Corpus filing
correction" entry above.

**History of Zosimus and 2 Baruch are now correctly filed under Syriac tradition** — moved from
`data/bible/NT/` to `data/bible/SY/`, renamed to match the established naming convention
(`historyofzosimusSY.json`, `2baruchSY.json`), and moved from `NT_BOOKS` to `SY_BOOKS` on the
dashboard.

**Worth carrying forward: 2 Baruch's own content is flagged in its governance registry as not yet
rebuilt from source** (`textTrustPromotion: false`, candidate confirmed not exact APOT wording as
of 2026-07-05) — a real, separate, still-open item whenever this text's own remediation comes up.
Not touched this session, out of scope for a filing correction.

Confirmed via grep before moving anything: no `.js` file in the live app references any of these
three books by name or path, so this correction carries zero live-app risk.

### What's still open
Same as before this correction: Psalms's patch status needs reconciling, and whether "Psalms
deferred to the end" means end-of-OT or end-of-whole-project is still unresolved. The New
Testament's 27 real books remain fully closed regardless of this filing correction — nothing
about their content changed.

## Session [today's date] — ET-AR-SY/Odes Phase 0 canonicity survey + Jubilees audit (started, not yet committed)

**Phase 0 canonicity survey completed for the ET section (32 texts).** Unlike the AR/SY/Odes
survey (Laodiceans, Apollonius, stub Odes — all removed), nothing in the ET backlog is
fabricated. Every text maps to a real, attested category:
- Core 81-book canon: Book of Jubilees, 1-3 Meqabyan, Rest of Baruch, Rest of Jeremiah
  (together = 4 Baruch/Paralipomena of Jeremiah), Josippon
- The 9 broader-canon books: 11 Clement/Qalēmentos files (= single canonical "Ethiopic
  Clement," 7-8 parts), Didaskalia, and the complete Sinodos (Sirate Tsion, Tizaz,
  Admonitions [self-identifies internally as "Gitsiw"], Abtilis)
- Broader-canon-adjacent Church Order text: Fetha Nagast (legal code, not scripture,
  historically Ethiopia's constitution — same category as Kebra Nagast)
- Guba'e Kana = the Council of Nicaea proceedings/canons (self-identified in its own
  metadata — name was misleading)
- Ascension of Isaiah, Shepherd of Hermas: historically claimed canonical, not in the
  current strict 81-book list per modern scholarship (Cowley 1974) — Josh's call: KEEP,
  labeled honestly, same precedent as Odes of Solomon
- Devotional/liturgical, not scripture: Miracles of Mary (Ta'amra Maryam), 3 Malke'a hymns,
  Mazaheta (title not yet independently confirmed — flag for Phase 2)

Open item NOT resolved by Phase 0: the Clement/Qalēmentos *category* is real, but whether
*this specific corpus content* is authentic is still a separate open question (already red
on the dashboard).

Josh's decision: fold this canonicity determination into the same commit as the first real
content fix, rather than committing it standalone.

**Jubilees audit — in progress, not yet applied to the file:**
- Confirmed missing chapters 6, 7, 8, 9, 26, 27, 28, 29, 30 (file jumps 5→10→25→31→50).
  All 9 confirmed to genuinely exist in Charles's translation via
  messianiclearning.org/commentary/apocrypha/jubilees/charles/jubNN.html (clean,
  verse-numbered R.H. Charles text, confirmed reliable and fetchable this session).
- Confirmed the same "that"→"the" corruption bug already fixed in 1 Enoch is ALSO present
  in Jubilees' existing chapters — ~74 candidate instances found via regex
  (`\bthe (he|she|it|they|we|I|you|was|were|...)\b`), e.g. 5:20 "the Lord said the He would
  destroy everything the was upon the earth" → should be "that He would destroy...that was."
  Each instance still needs individual verification against source before fixing (per
  standing rule), but the sample checked so far all look like genuine hits, no false
  positives spotted.
- Chapter 6 full text (38 verses) was successfully re-fetched and confirmed this session.
  Chapters 7, 8, 9, 26, 27, 28, 29, 30 were fetched earlier in this session but that content
  was lost when it aged out of context before it got written to disk — NEEDS RE-FETCHING
  next session from the same confirmed-working source.
- Known source-side wrinkle to resolve: chapter 8 on the messianiclearning mirror has a
  verse-numbering glitch (duplicate "17," missing "16") — needs reconciling against standard
  Jubilees versification (ch. 8 has 30 verses) when rebuilding that chapter, likely just a
  renumbering of that mirror's HTML, not a real gap.
- NOTHING has been written to the actual repo file yet. No commit, no push. This is all still
  pending.

**Sequencing plan agreed with Josh for the full ET-AR-SY/Odes backlog** (established before
the Jubilees deep-dive): Phase 0 canonicity (done, above) → Phase 1 cheap mechanical sweeps
across all 34 texts (structural completeness + the "that"→"the" regex, no sourcing needed) →
Phase 2 source-availability triage (tractable / needs digging / likely needs Josh) → Phase 3
full audits, tractable tier first → Phase 4 punt list back to Josh for anything unsourceable.

**Next session should:** re-fetch Jubilees chapters 7-9 and 26-30 from
messianiclearning.org/commentary/apocrypha/jubilees/charles/, resolve the chapter 8
verse-numbering wrinkle, verify and apply the ~74 "that"→"the" corrections, insert all 9
chapters in order, then commit the full Jubilees fix together with the Phase 0 canonicity
write-up (per Josh's instruction to fold them into one commit) — updating
AUDIT_GOVERNANCE_LEDGER.md and the dashboard GREEN_SEED in the same commit. After that, move
to Phase 1 sweeps across the remaining 30+ texts.

## Session 2026-07-16 — Jubilees: 77 that/the corruptions fixed + chapters 6-9 inserted, COMMITTED (`66b4428`)

**Picked up the prior session's Jubilees work and closed most of it out.** Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`'s "Jubilees remediation, session 2026-07-16" entry — summary here
for quick orientation.

- **that/the corruption sweep, existing chapters — DONE.** Not ~74 as previously estimated; 77
  genuine instances found and fixed, each individually verified in context (not fixed on regex
  match alone). Two matches ("the will of Him," "the rule of the sun") confirmed as legitimate
  English and deliberately left unchanged — same false-positive class as 1 Enoch's "the might."
  **Lesson for future sweeps of this bug on a new book:** the first "clean" pass is not
  reliable — two more genuine instances turned up on a second, broader pass after the first
  pass had already been treated as complete. Run at least two passes with an expanding word
  list before considering a book's sweep finished.
- **Chapters 6, 7, 8, 9 — DONE, inserted (122 verses).** Sourced from messianiclearning.org,
  each chapter swept clean before insertion. Chapter 8's source-page verse-numbering defect
  (duplicate "17," missing "16") resolved by cross-checking a second source
  (yahwehswordarchives.org) and renumbering correctly before insertion — not a real content gap,
  just a source-side HTML labeling error.
- **Formatting lesson, worth remembering for any future edit to this file (or similarly
  formatted files):** never use `json.dump()`/full re-serialization to make edits — it reformats
  the *entire* file (compact one-line verses become multi-line), turning a handful of real
  changes into a multi-thousand-line diff. This happened once this session and was reverted.
  The working method: read the raw file as text, build the exact replacement text matching the
  file's existing compact style, and do targeted string replacement (`str.replace()` on an
  exact, uniqueness-checked substring, or Python's `json.dumps()` on just the *value* being
  swapped in, not the whole file).
- **Committed and pushed:** commit `66b4428`, `git am` + `git push` applied successfully by
  Josh. `AUDIT_GOVERNANCE_LEDGER.md` updated in a follow-up step (this note + the ledger entry
  above were written after the code commit, not folded into it — differs from the original
  Phase-0-plus-content-fix single-commit plan, since the Phase 0 canonicity write-up from the
  prior session is STILL not yet folded in — see below).

**Still open — chapters 26-30 (Jacob obtains the blessing of the firstborn, through the rape of
Dinah/Shechem).** messianiclearning.org's chapter-26 page did not surface via web search this
session. Two possible next steps, neither yet tried to completion:
1. Try direct guesses at the messianiclearning URL pattern
   (`.../charles/jub26.html`, `jub27.html`, etc.) via `web_fetch` once a URL in that
   pattern has appeared in *any* search result this session (the fetch tool requires a URL to
   have appeared in a prior search/fetch result before it can be fetched directly).
2. sacred-texts.com carries the same Charles 1917 translation and did surface in search this
   session, but under a different, non-chapter-aligned URL/paging scheme — file names like
   `jub57.htm` don't map 1:1 to chapter numbers. Would need a mapping session before trusting
   any verse numbering pulled from it, similar to (but more involved than) the chapter 8
   cross-check done this session.

**Also still open from the prior session, not addressed this session:** the Phase 0 ET-section
canonicity survey write-up (32 texts categorized, see above) has still not been folded into a
commit. Josh's original instruction was to commit it together with the first real Jubilees
content fix — that didn't happen this session (Jubilees was committed alone). Worth deciding
next session whether to still fold it in with the chapters 26-30 closure commit, or commit it
separately now that the "fold together" moment has already passed once.

**Dashboard/GREEN_SEED:** correctly NOT touched — Jubilees remains incomplete (missing chapters
26-30), so it should not be marked green yet. No SEED_VERSION bump needed for this session's
work.

## Session 2026-07-16 continued -- Jubilees CLOSED: chapters 26-30 inserted, book complete, marked GREEN

Picked back up immediately after the prior note in this file (77 fixes + chapters 6-9,
committed as `66b4428`). Josh's instruction: find a working source for chapters 26-30 and finish.

**The chapter-26 fetch blocker from the last note was a tool-usage problem, not a sourcing
problem.** Solution: fetch the book's own chapter-index page
(`messianiclearning.org/commentary/apocrypha/jubilees/charles/jub_1.html`) first -- its internal
navigation links to every chapter 1-50 directly. Once those links appear in a fetched page's
content, each chapter becomes fetchable on its own. No new/different source was ever needed.
**Lesson for any future "can't fetch this specific page" situation with this fetch tool:** try
fetching the parent index/table-of-contents page first -- its own links often unlock the pages
that wouldn't fetch directly via search.

**Chapters 26-30 fetched, swept clean, inserted (163 verses).** Same method as chapters 6-9:
targeted raw-text insertion matching exact compact formatting, never full-file `json.dump()`.
Committed as `ee8d9e3`.

**Jubilees is now COMPLETE: 51 chapters (0-50), 1235 verses, zero known open defects.** Final
full-book corruption re-sweep after all insertions found only the one previously-confirmed false
positive (21:3, "the will of Him"). Marked GREEN on the dashboard -- added to `GREEN_SEED`, full
`GREEN_NOTES` entry written, `SEED_VERSION` bumped to `v119-2026-07-16-jubilees-complete`.
Committed as `14ac6f5`. Full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s "Jubilees remediation CLOSED"
entry.

**Still genuinely open, not addressed this session:** the Phase 0 ET-section canonicity survey
write-up (32 texts categorized across two sessions ago) has still not been folded into any commit.
Worth deciding next session how to handle this -- it's been carried forward across three sessions
now without landing anywhere.

**Next session, per the agreed ET-AR-SY/Odes sequencing plan:** Phase 1 -- cheap mechanical sweeps
(structural completeness check + the that/the corruption regex, no sourcing/fetching needed) across
the remaining ~30 texts in the ET/AR/SY/Odes backlog. This phase doesn't require finding sources
or doing content verification yet, just identifying which of the remaining texts have the same
"the" corruption pattern or obvious structural gaps, to prioritize which need real audits first.

## Session 2026-07-16 continued — Governance write-up landed, Phase 1 mechanical sweeps complete

The Phase 0 ET canonicity survey write-up (32 texts, analysis from an earlier session) had been
carried forward undone for three sessions — finally committed on its own (`620ab0e`), since the
original plan to fold it into the first Jubilees content commit had long since passed. No
removals resulted; every ET text maps to a real, attested category (core 81-book canon items, the
9 broader-canon books, Fetha Nagast as a legal code not scripture, Guba'ekana identified as the
Council of Nicaea's proceedings, Ascension of Isaiah/Shepherd of Hermas kept per Josh's decision
despite not being in the strict 81-book list, devotional/liturgical texts with Mazaheta flagged
pending title confirmation). Registry:
`data/bible/registry/broader-canon-et-phase0-canonicity-survey-2026-07-16.json`.

**Phase 1 — cheap mechanical sweeps (structural completeness + the that/the corruption regex, no
sourcing needed) — run across the full remaining ET/AR/SY backlog (30 files), committed `03035a5`.**
Zero genuine corruption found anywhere; the only hits were already-known false-positive patterns
("the will," "the might" — legitimate English). No structural gaps in any file. **Real finding
worth remembering:** five ET files use non-standard JSON schemas (Josippon nests one level deeper;
three Malke'a hymn files use a flat `stanzas` array; Mazaheta uses `sections`; Miracles of Mary
uses a `miracles` array) that a schema-specific sweep script would have silently skipped — used a
recursive text-field collector instead to avoid a false-clean result. This is NOT a
content-accuracy certification for any of these 30 files — only confirms freedom from the one known
bug class and structural completeness. Phase 3 (full character-for-character audits) remains fully
open for all of them except the two closed below.

## Session 2026-07-17 — Phase 2 source-availability triage, real research-based (29 texts sorted)

Sorted the remaining ET/SY backlog by how findable a genuine primary source looks, based on actual
web research (not background knowledge). Registry:
`data/bible/registry/broader-canon-et-sy-phase2-source-triage-2026-07-17.json`. Committed `169d783`.

- **Tractable (6, real free source in hand):** Ascension of Isaiah (now CLOSED, see below),
  Shepherd of Hermas, Rest of Baruch + Rest of Jeremiah (now CLOSED, see below), Didaskalia,
  Fetha Nagast, Miracles of Mary.
- **Tractable-leaning (3, plausible source found, needs confirming):** Guba'ekana, Malke'a Virgin
  Mary, 1-2 Meqabyan.
- **Needs digging (4):** 3 Meqabyan, the Statutes-of-Apostles/Sinodos mapping question, Malke'a
  Guba'e + Malke'a Iyasus, Mazaheta (blocked on its own unresolved title question from Phase 0).
- **Likely needs Josh (3 families, no free source found):** Josippon (confirmed — no complete
  English translation of the actual Ethiopian-recension text exists anywhere, free or paid); the 8
  non-red Clement/Qalementos files (only a purchase-only translation identified; R.H. Charles'
  free APOT may cover fragments, not checked); 3 of 4 Sinodos books (Sirate Tsion, Tizaz,
  Admonitions, Abtilis — best identified edition is purchase-only).

**Important correction discovered mid-Phase-3 (see Rest of Baruch entry below):** the Phase 2
triage above was WRONG about Rest of Baruch/Jeremiah being simply "tractable" — it conflated
general availability of a Greek-tradition translation with the real Ethiopic-structure text's
availability, which turned out not to exist freely anywhere. Worth remembering when trusting any
Phase 2 categorization at face value — verify structure, not just "a translation exists," before
calling something tractable.

## Session 2026-07-17 continued — Ascension of Isaiah: provenance mystery solved, CLOSED (GREEN)

Started as a Phase 3 verification and turned into a real investigation. Initial concern: app has
140 verses across 11 chapters vs. ~296 in an online Charles 1900 mirror — looked like massive
content loss. **Resolved as a hybrid-source book, not a defect.** Chapters 1-5 (Martyrdom of
Isaiah) closely track R.H. Charles' 1900 translation. Chapters 6-11 (Vision of Isaiah) track a
completely different, much more recent source: the modern critical Perrone-Norelli Ethiopic
edition (*Ascensio Isaiae: Textus*, CCSA 7, 1995) as represented in Brown & Butts' translation in
*The Cambridge Edition of Early Christian Writings* — confirmed via exact verse-by-verse content
correspondence and a verbatim match on "angels without number" (9:1/9:6) that neither Charles
source has (both say "angels innumerable" instead). No content was ever missing — the verse-count
gap is fully explained by the two traditions' different chapter/verse divisions. `meta.version`
corrected to describe the real hybrid sourcing. Marked GREEN (`39f30dc`); dashboard `SEED_VERSION`
bumped to `v120`.

**Lesson for future provenance questions:** when a book's wording doesn't match any single known
translation, consider that different SECTIONS of a composite work may trace to entirely different
sources — don't assume one book = one translator just because the file has one `meta.version`
field.

## Session 2026-07-17 continued — Rest of Baruch/Jeremiah: rebuilt as unified synthesis, honest gap left open

Started as a Phase 3 "tractable" verification; became a full rebuild after finding (1) the app's
existing content was a heavily condensed modern summary (a single sentence standing in for pages
of real dialogue), and (2) the real Ethiopic canonical text (per Cowley 1974 and the Ethiopian
Orthodox Bible Project's own structural breakdown) is ONE continuous 11-chapter work — Lamentations
1-5, then the Epistle of Jeremiah as ch.6, then a unique 5-verse Prophecy against Pashhur, then
4 Baruch/Paralipomena of Jeremiah as chs.7:6-11:63 — not the app's prior two-separate-files split,
and no free translation matching that exact structure exists anywhere (confirmed directly by the
Ethiopian Orthodox Bible Project, whose own solution is a purchase-only modern synthesis).

**Josh's decision: Option 2 — assemble an equivalent synthesis independently, for free, rather than
buy their edition.** Rebuilt (`430bd24`) as four labeled sub-books (using the same `books` schema
this app already uses for Josippon):
1. **Lamentations** (5ch/154v) — DRB, reused directly from this app's own already-verified
   `OT/lamentations.json`. No new fetching needed.
2. **Epistle of Jeremiah** (1ch/72v) — DRB, reused from `OT/letterofjeremiah.json`.
3. **Prophecy against Pashhur** (1ch/0v) — **left honestly EMPTY and flagged**
   (`contentStatus: "unsourced_pending"`), not fabricated. No free English translation of this
   5-verse fragment could be found anywhere — it survives only in Dillmann's 1866 Latin/Ge'ez
   edition, never translated to English except by the one purchase-only edition.
4. **Paralipomena of Jeremiah/4 Baruch** (9ch/196v) — Kraft & Purintun's public-domain translation
   (SBL 1971/1972 Longer Version), fetched from ccat.sas.upenn.edu and transcribed in full.
   Chapter/verse numbers are Kraft's own — NOT remapped to Dillmann's Ethiopic divisions (not
   accessible this session), to avoid fabricating an unverified structure.

422 verses total. `restofjeremiahET.json` retired (`git rm`); `ET_BOOKS` registry updated.
**NOT marked GREEN** — stays amber given the one honestly-unsourced sub-book. If the Pashhur gap
is ever closed, candidates are: acquire the paid edition after all, or attempt a direct translation
from Dillmann's 1866 Latin (archive.org has an untranscribed page-image scan,
`chrestomathiaaet00dilluoft`).

## Session 2026-07-17 continued — Dashboard abbreviation collisions fixed (Josh caught "Boo" for Jubilees)

Josh spotted "Boo" as Book of Jubilees' dashboard code — traced to `codeFor()` falling through to
a naive first-three-letters default whenever a book has no explicit `BOOK_CODES` entry. Checked
the *entire* book list programmatically for the same bug class rather than just patching the one
report: found 9 real collisions, not one — all 11 Clement (ET) variants collapsed to "Cle," all 3
Meqabyan to "Meq," all 3 Malke'a texts to "Mal," Josippon collided with Joshua on "Jos," 2 Baruch
(CE) collided with OT Baruch on "Bar," Sirate Tsion collided with Sirach on "Sir." Added explicit
distinct codes for all of them; verified zero collisions across the full 117-book list before
committing (`de1117a`). Display-only fix, no `SEED_VERSION` bump needed.

**Lesson:** when a person reports one instance of a bug class, check the whole list for the same
class before fixing just the reported instance — this project has hit that pattern more than once
now (the that/the corruption sweeps needed multiple passes for the same reason).

## Where things stand now, end of session 2026-07-17

**Closed this session:** ET Phase 0 write-up (finally committed), Phase 1 (clean sweep, zero
corruption), Phase 2 (29 texts triaged), Ascension of Isaiah (GREEN), Rest of Baruch/Jeremiah
(rebuilt, honest partial), dashboard abbreviation bug (9 collisions fixed).

**Next up, per the Phase 2 triage:** the remaining tractable-list items — Shepherd of Hermas,
Didaskalia, Fetha Nagast, Miracles of Mary — all have real free sources already identified and
ready for Phase 3 verification with no further sourcing work needed. After those, the
tractable-leaning items (Guba'ekana, Malke'a Virgin Mary, 1-2 Meqabyan) need a quick confirming
check before their own Phase 3 work. The "needs digging" and "likely needs Josh" tiers remain
genuinely blocked on sourcing, not verification — see the Phase 2 registry file for full detail
before spending time on those.

## Session 2026-07-17 continued — Shepherd of Hermas: full rebuild from Lightfoot, CLOSED (GREEN)

Picked up the Phase 3 tractable-list item flagged earlier this session as a real content gap, not
just a sweep target: the app's Shepherd of Hermas file was a heavy condensation (27 "chapters,"
~99 verses) of the real text, not the full Lightfoot translation it claimed to be. Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`'s "Shepherd of Hermas remediation, session 2026-07-17" entry.

**Rebuilt complete from J.B. Lightfoot's Apostolic Fathers translation** (public domain, via CCEL
and earlychristianwritings.com, cross-checked against each other) — Vision 1-5, Mandate 1-12,
Similitude 1-10, verbatim. **27 chapters, 722 verses**, up from 99 — confirms the earlier estimate
that real Similitude 9 alone (196 verses) is longer than most other books in this backlog.

**Schema decision, Josh's explicit call:** kept the app's existing per-section chapter structure
(one chapter per Vision/Mandate/Similitude, matching how Lightfoot himself presents the text) —
NOT the standard modern 114-chapter scholarly citation numbering that had been the earlier
recommendation. Worth remembering as precedent for any future rebuild of a similarly-structured
text: follow the translator's own presentation by default, don't impose an external modern
citation convention, unless Josh says otherwise.

Marked GREEN, `SEED_VERSION` bumped to `v121-2026-07-17-hermas-shepherd-complete`. Committed and
pushed by Josh across two patches (`5123815`, `97a6659`).

**Lesson on tooling, worth remembering:** both earlychristianwritings.com and CCEL hit an identical
hard fetch-tool truncation wall partway through Similitude 6, regardless of how large a token
limit was requested — this is the same class of wall documented for Psalms/Grail1963. When a
fetch tool truncates a page at a similar point across multiple independent sources, that's a
tool-side limit, not a source gap — don't conclude the source is incomplete. In this case Josh
supplied the full text directly (pasted from his own browser), which is what actually unblocked
completion.

**Still open, same Phase 2 tractable list:** Fetha Nagast, Didaskalia, Miracles of Mary — sources
already identified, none touched yet.

## Session 2026-07-17 continued further -- Didascalia: full rebuild, CLOSED (GREEN)

Second rebuild this session, same session as Shepherd of Hermas above. The app's Didascalia file
turned out to be a different failure mode than Hermas: not a condensation of the real J.M. Harden
1920 translation, but fabricated text with no wording overlap to the source at all. Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`'s two Didascalia entries.

**Rebuilt complete from Harden 1920** (public domain) as 43 chapters, 43 verses -- one verse per
chapter, matching how the source site (bible.ertale.com) presents it: Harden's prose has no
intrinsic verse divisions. Most of the content came from Josh pasting chapters directly from his
browser after the fetch tool hit both a per-domain cap and the familiar archive.org truncation
wall; a handful of chapters fetched successfully earlier were cross-checked word-for-word against
Josh's later paste of the same chapters with no discrepancies, confirming the reconstruction was
sound.

**Process lesson from this session, worth internalizing for future rebuilds:** when the fetch tool
is blocked and the person offers to paste source text directly, that's a fully legitimate and
often more reliable path than fighting the tool -- verbatim browser copy-paste from the person is
at least as trustworthy as a fetch, and sometimes the only way through. Don't treat "the fetch tool
won't cooperate" as a reason to stall; ask for a paste and keep building.

Also -- a process correction happened mid-session worth remembering: sending three separate patches
for one piece of Hermas work (content, governance, resume note) was flagged as excessive. New
standing rule added directly above in the "Standing rule, still in force" section of this file:
one logical unit of work is one patch, batch everything into the commit that follows a real
decision point, don't split just because work touched multiple files or came together in stages.

**Still open, same Phase 2 tractable list:** Fetha Nagast (the identified free source has unusably
bad OCR; needs a better source found before rebuild can start), Miracles of Mary (confirmed genuine
paraphrase of real Budge content, not fabricated -- open question is edition completeness, 100
miracles in the app vs. Budge's fuller 1933 "110 Miracles" compilation; untouched).

## Session 2026-07-17 continued further -- Miracles of Mary: rebuild IN PROGRESS (amber, not closed)

Third book this session, after Shepherd of Hermas and Didascalia. This one is NOT closed out --
deliberately left amber pending a proofreading pass Josh plans to do in a follow-up session. Full
detail in `AUDIT_GOVERNANCE_LEDGER.md`'s "Miracles of Mary remediation" entry.

**Key finding, worth remembering for this whole corpus area:** there is no single canonical
Ta'ammera Maryam (Miracles of Mary) -- it's a library tradition of 1000+ stories with no fixed set
or order across manuscripts (confirmed via Princeton's PEMM project, the leading academic source).
Rebuilt specifically to match Budge's 1923/1933 "110 Miracles" edition as a defined, citable source
instead, and logged a deferred governance item in `structure.json` to revisit this corpus's real
liturgical function post-v1.0 rather than treating any single edition as final.

**Result: 109 of 110 stories transcribed from raw OCR** (Josh supplied the actual PDF after
HathiTrust/archive.org/Google Books all blocked bulk access despite the text being confirmed public
domain -- a real and recurring problem with legitimately PD texts locked behind access-control
readers). One story boundary not yet located; OCR has real word-level errors throughout, unproofread.
Marked amber on purpose -- do not promote to green until the proofreading pass happens.

**Still open, same Phase 2 tractable list:** Fetha Nagast -- the only English translation (Tzadua
1968) has an unresolved copyright question of its own; untouched this session.

## Session 2026-07-17 continued much further -- Miracles of Mary: corpus-wide remediation, 110/110

Major continuation of the Miracles of Mary work from earlier in this same session. Two important
corrections to record:

1. **The "content complete at 109" conclusion recorded earlier this session was wrong.** Found and
   fixed a genuinely missed story (the 110th story, "The Virgin Mary, the Hunter and the Dog-Face",
   had been merged into an adjacent story's body during initial extraction rather than being absent).
   Split it into its own entry and closed up the numbering -- the file now has a clean 110 entries,
   numbered 1-110, no gaps. Full detail in `AUDIT_GOVERNANCE_LEDGER.md`.

2. **A much more widespread contamination problem than the original 17 flagged stories was found and
   fixed**: roughly 90 of 110 stories had some form of cross-story leakage (mostly next-story titles
   and citations bleeding into the current story's tail). Fixed via a combination of pattern-based
   bulk truncation, a title-fingerprint detector, and individual fresh page-image re-scans
   (tesseract) for the harder cases.

**Process lesson from a real mistake made and caught this session:** an early bulk-fix pass truncated
every story at its first occurrence of the word "Plate," assuming captions only ever trail a story.
That was wrong for 13 stories where a plate was inserted mid-story with real narrative continuing
after it -- the bulk fix silently deleted real content. Caught by diffing against the pre-session git
history before committing. Lesson for future bulk text-mutation work: check how much content sits
after the match point before trusting a pattern-based fix is safe, don't assume safety from a few
manual samples.

**Final verified state:** 110 stories, numbered 1-110, zero remaining instances (per automated sweep)
of hyphen-break scrambling, duplicate consecutive words, plate-caption leakage, or leaked titles.
Still amber -- this is extensive pattern-based and page-image-assisted correction, not a human
word-for-word read, which remains the bar for GREEN.

**Still open, same Phase 2 tractable list:** Fetha Nagast -- the only English translation (Tzadua
1968) has an unresolved copyright question; untouched this session.

## Session 2026-07-17, Miracles of Mary FINAL closure -- marked GREEN

Closing out the Miracles of Mary work from this very long session. After Josh corrected the standard
being applied (this corpus has always been verified by Claude doing character-for-character checks
directly, not a deferred "human read"), worked through all 110 stories in page order: rendered each
story's actual source pages fresh, OCR'd independently, and compared word-for-word against stored
text. Every story needed at least a minor fix; most needed substantial reconstruction. Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`'s closing entry.

**Key structural finding this pass:** story 77 turned out to contain two merged stories (missed during
original extraction); split into two proper entries, bringing the total from an apparent 109 to a
correct, gap-free 110 -- matching Budge's own stated count. The earlier session's "numbering quirk"
theory is superseded by this: it was a missed boundary, not a real quirk in the source.

**Marked GREEN.** This is now a fully verified book in the corpus. The only remaining open item
specific to this book is the deferred post-v1.0 liturgical-function review already logged in
`structure.json`'s `liturgical_research_governance` entries -- not a data-quality concern, a scope
question about which stories in the broader Ta'ammera Maryam tradition are actually in living
devotional use.

**Still open, same Phase 2 tractable list:** Fetha Nagast -- the only English translation (Tzadua 1968)
has an unresolved copyright question; untouched this session.

## Session 2026-07-17, Fetha Nagast copyright question RESOLVED (confirmed, not cleared)

Picked this up as the next item on the tractable list. The "unresolved copyright question" noted in
earlier entries above is now resolved -- confirmed, not cleared:

**The Tzadua/Strauss 1968 English translation is not public domain.** The 2009 Carolina Academic Press
second printing carries an explicit, active copyright notice ("Copyright (c) 2009 by the Faculty of
Law, Addis Ababa University. All rights reserved"), and it is still commercially sold today with an
ISBN. This is a real, currently-asserted copyright, not a stale or ambiguous case like the 1900s/1920s
sources used for Hermas, Didascalia, and Miracles of Mary earlier this session.

**More importantly: the app's existing 34 chapters of Fetha Nagast appear to already be built from
this copyrighted translation.** The badly-OCR'd source identified in earlier sessions
(`ethiopianorthodox.org/biography/01thelawofkings.pdf`) is the exact same file Wikipedia cites as a
copy of the Tzadua/Strauss translation. That site appears to be hosting the copyrighted text without
authorization. This means the app's existing Fetha Nagast content is a likely rights problem in its
own right, not just a data-quality one -- a different and more serious situation than any other book
audited this session.

**Underlying work (the Fetha Nagast itself -- the 13th-century Arabic compilation, the Ge'ez text, the
legal content) is centuries old and clearly public domain.** Only Tzadua's specific 1968 English
wording is under copyright. Two genuinely public-domain alternatives exist for building an English
version: Ignazio Guidi's 1899 Italian translation (commissioned by the Italian General Staff), or the
fragmentary Latin translations by Arnold (1841) and Bachmann (1889). Either would require an original
translation into English (by Claude, from Italian or Latin) rather than transcription/verification of
an existing English source -- a fundamentally different kind of task than every other book handled
this session.

**No content work done this session.** This was flagged to Josh directly rather than proceeding, given
the existing app content may itself need review. Next session should pick up here with Josh's decision
on how to proceed: (a) start a fresh Guidi-based translation, (b) review/replace the existing 34
chapters given the rights concern, or (c) shelve this book entirely. Do not use
`ethiopianorthodox.org/biography/01thelawofkings.pdf` or any other copy of the Tzadua/Strauss text as a
source going forward.

## Session 2026-07-18/19 -- SY + ET broader-canon audits, three major rebuilds. Consolidated summary
(replaces five separate same-session entries; full blow-by-blow detail for each item lives permanently
in AUDIT_GOVERNANCE_LEDGER.md under its own dated heading -- this is the quick-pickup version.)

**Fetha Nagast: copyright conclusion re-verified and holds, real source confirmed, deferred by Josh.**
Josh pushed back on the prior session's "no free translation exists" conclusion; re-verified from fresh
primary research rather than trusted. Tzadua/Strauss (1968) remains the only complete English
translation, actively copyrighted (explicit 2009 notice, still sold) -- conclusion confirmed, not just
repeated. Real path forward found: Guidi's 1897/99 Italian edition (the edition Tzadua was principally
based on) is freely viewable on HathiTrust, full public view:
Vol.1 https://babel.hathitrust.org/cgi/pt?id=mdp.35112104546785 ,
Vol.2 https://babel.hathitrust.org/cgi/pt?id=mdp.35112104546793 -- page images only, needs OCR before
translation work. **Explicitly on hold until after the app ships, per Josh -- do not pick up
proactively.** Standing governance lesson from this: a prior "no source exists" conclusion is exactly
the kind of claim to re-verify on pushback, not defend.

**SY corpus audit: real, substantial defects found in 2 Baruch / Letter of Baruch, NOT YET rebuilt.**
`2baruchSY.json` has ~1,939 words confirmed missing (vs. Charles/APOT 1913, verified via Wesley Center
Online) across a dozen-plus chapters, a real duplication (ch.12 vv.6-7 = ch.13 vv.1-2 verbatim), ~447
words of unexplained extra content, ~373 words of unresolved wording mismatches. `letterofbaruchSY.json`
inherits the same defects in its chs. 4-5 (=2 Baruch 81-82). Wesley's own source page turned out to be
genuinely incomplete (stops mid-ch.85) -- a real source gap, not a fetch-tool wall. Dashboard: both
marked RED with detail notes. **Still needs:** verifying chs.86-87 against a primary source, resolving
the 1896-vs-1913 Charles edition question, then a full rebuild -- full-rebuild scale, same class as
Hermas/Didascalia's earlier discoveries.

**ET broader-canon audit: MAJOR FINDING, 1-3 Meqabyan fabricated -- REBUILT this session.** Confirmed via
Wikisource + independent Wikipedia summary that the app's 1-3 Meqabyan content didn't match the real
text at all: invented villain, wrong number of sons, and "Meqa'abyan" (the book's own title) turned into
a fabricated recurring character name across all three books -- chapter counts matched the real books
exactly while content didn't, a reminder that structural checks alone don't catch this. Same fabrication
class as Prayer of Apollonius/pre-rebuild Didascalia, but genuinely canonical, so rebuilt rather than
removed. **Now rebuilt and committed:** 1 Meqabyan fully clean (36 ch., 738 verses, no gaps/dupes) from
apocryphalibrary.weebly.com, cross-checked against Wikisource. 2 Meqabyan rebuilt (21 ch., 479 verses)
with chs.6-7 sourced from Wikisource instead (apocryphalibrary's own pages for those two are genuinely
incomplete on the site's end) and two small honest gaps left open (ch.16 v.4, ch.21 v.4). 3 Meqabyan
(10 ch., 208 verses) Wikisource-only, still single-source amber. Getting the raw source data required
Josh running two scraper scripts locally across many rounds (this session's fetch tool can't reach
either site) -- real bugs found and fixed against actual failing pages: inconsistent verse-number
markup across at least three different conventions, genuine duplicate verse renderings within a single
chapter (resolved by keeping the longer/more complete rendering), and a recurring ~5,331-character
leftover-content block that turned out to be site-side residue embedded identically across unrelated
pages on different books, not a scraper bug. Dashboard: all three marked RED with rebuild-status notes
(deliberately not GREEN -- no human read-through against source has happened yet).

**Malke'a Virgin Mary: REBUILT this session from confirmed real source.** Prior 14-stanza file covered
roughly a third of the real litany and used a different opening formula than the source ("Peace be unto"
vs. the real "Salutation to"), suggesting independent composition rather than a trimmed translation.
Rebuilt as the complete 42-stanza litany from Budge's *Legends of Our Lady Mary* (1922, pp.235-244,
confirmed public domain), including three minor OCR-artifact corrections (a misread numeral, two
numerals with stray internal spaces, one mangled drop-cap) all confirmed against surrounding context.
Hit the same kind of fetch-tool wall on archive.org that showed up elsewhere this session (Wesley's 2
Baruch, Wikisource) -- resolved the same way, Josh downloaded the source file directly and provided it.
Dashboard now updated to reflect this: RED with a rebuild-status note, same as the Meqabyan books.

**Cross-cutting technical notes worth remembering:** (1) At least three separate real "hosted source is
itself incomplete" discoveries this session (Wesley's 2 Baruch page, Wikisource's 1 Meqabyan page,
apocryphalibrary's 2 Meqabyan chs.6-7) -- a pattern worth expecting, not a fluke. (2) This session's
fetch tool hit hard, non-negotiable content-length walls on at least two large public-domain sources
(archive.org full-text streams) -- identical truncation regardless of token limit requested; Josh
downloading and providing the file directly is the reliable fix. (3) apocryphalibrary.weebly.com's raw
HTML is genuinely inconsistent page-to-page (at least four different verse-marking conventions found
across ~50 chapters) -- expect more surprises if this source gets used again.

**STILL OPEN, unchanged from before this session:** Malke'a Guba'e and Malke'a Iyasus (same body-
salutation genre as Malke'a Virgin Mary, no source identified yet -- likely needs academic-literature
search, e.g. Habtemichael Kidane's work on Ethiopian hymnody, rather than general web search); Guba'ekana
(real source exists at CCEL's NPNF2-14, but need to determine whether the app is loosely tracking the
plain-20 or expanded-84 Nicene canon tradition before rebuilding); the Sinodos family -- Sirate Tsion,
Tizaz, Admonitions, Abtilis (14-23 verses each, condensation pattern confirmed, sourcing/mapping still
needs digging); the non-red Clement/Qalementos files -- 2,4,5,6,8 Clement, Book of Rolls, Visionary,
Statutes (4-40 verses each, same pattern, sourcing likely needs Josh, though Charles' free APOT hasn't
been checked yet for Clementine fragments); Mazaheta (blocked on its own unresolved title/identity
question); Josippon (confirmed no free-or-paid complete English translation of the real text exists
anywhere).

**Next session, if resumed:** human verification read-through of the 1-3 Meqabyan and Malke'a Virgin
Mary rebuilds (or at least spot-checks) before any of them can move from amber to GREEN; then continue
down the still-open ET list above, or return to the SY corpus rebuild, or take the Sinodos/Clement/
Mazaheta/Josippon sourcing questions to Josh for a decision.

## Session 2026-07-20 -- Meqabyan copyright correction (1 & 2), 2 Meqabyan structural corruption fix

**Trigger:** Josh reported copyrighted material had been added to the corpus during the previous session.
Investigation confirmed and expanded on this.

**1 Meqabyan:** the "formal register" text used across chapters 1,2,3,4,5,6,7,8,9,10,11,12,13,19,22,31
(some from an earlier session, some merged this session before the correction) turned out to be D.P.
Curtin's 2018 copyrighted translation, mislabeled Public Domain. Chapters 1-7 replaced with Wikisource's
WikiProject Wiki Bible translation (confirmed public domain, matching formal register) -- CLEAN. Wikisource's
page doesn't extend past chapter 7. Separately, the file's "Patois" chapters (15-18,20,21,23-30,32-36,
labeled "Wikisource Jamaican Patois translation") turned out to be Feqade Selassie's self-published,
still-copyright-asserting Iyaric translation -- confirmed by exact text match against a copy Josh provided.
Chapter 14 was a mixed case: verses 1-4 Curtin, verses 5-23 Selassie/Patois. Josh gave a standing instruction
this session that Patois/Iyaric register is excluded from this corpus regardless of licensing status, so
this text wasn't usable even setting the copyright question aside. **Resolution: chapters 8-36 (29 of 36
chapters) emptied to `"verses": []`.** Only chapters 1-7 currently have text. A fresh formal-register
translation is needed for the rest -- no free, non-Patois source currently exists. Sources checked and
ruled out: Wikisource (covers only ch.1-7), apocryphalibrary/Curtin (copyrighted), UBS/Woldemariam
(licensed-use, not free), Selassie/Iyaric (copyrighted and excluded by register preference anyway).

**2 Meqabyan:** all 21 chapters except 6-7 were the UBS/Haileyesus Woldemariam translation via
apocryphalibrary.weebly.com, mislabeled Public Domain -- that translation is displayed on UBS's own
platform under a permission grant to UBS, not a public release. While investigating this, found an
undiagnosed structural bug predating this session: chapter 21's ending verses were duplicated onto the
tail of several other chapters (1, 12, 16, 20, confirmed; likely more), and chapter 1 also carried a large
misplaced block of chapter 21's own content under its own chapter number. **Resolution: full rebuild, all
21 chapters, from Wikisource's WikiProject Wiki Bible / community translation (CC BY-SA 4.0), verified
chapter-by-chapter.** Corruption resolved as a byproduct. Two verse-number gaps (ch.16 v.9, ch.21 v.4) are
native to the Wikisource source itself, left honestly absent. No Patois involved in this book at all --
Wikisource's 2 Meqabyan text is standard English.

**Process note:** three patches this session (1 Meqabyan ch.1-7 fix, 2 Meqabyan full rebuild, 1 Meqabyan
ch.8-36 strip), each `git am` + `git push origin main`'d successfully by Josh, confirmed on origin/main.
`audit-ledger.html` updated (RED_NOTES for both books rewritten, SEED_VERSION bumped to
`v125-2026-07-20-meqabyan-copyright-correction`) and `AUDIT_GOVERNANCE_LEDGER.md` updated with full detail
in the same session but as separate follow-up work after Josh asked whether the resume note and dashboard
had been written -- they had not been, at first; this entry and the dashboard/ledger updates were written
afterward to close that gap.

**Governance lesson, worth remembering:** the 2026-07-18/19 Meqabyan rebuilds were marked "REBUILT,
superseding the MAJOR FINDING" on the dashboard -- the content-fabrication problem they fixed was real
and stayed fixed, but the replacement sourcing's copyright/license status was never separately verified,
and turned out to be wrong for both books. Matching the real text's content and being freely readable
online are both necessary but not sufficient for a source to be safely reusable -- license status needs
its own explicit, separate check before a chapter is marked clean, not an inference from "the content is
right" or "it's posted online."

**Next session, if resumed:** 1 Meqabyan chapters 8-36 need a decision from Josh on how to proceed (fresh
translation, licensing Curtin properly, or continued search for another free formal-register source) before
any further work on that book. Otherwise, the "Next session" list from the 2026-07-19 entry above (Malke'a
Guba'e/Iyasus, Guba'ekana, Sinodos family, non-red Clement files, Mazaheta, Josippon, human verification
read-throughs) remains open and unaffected by this session's work.

## Session 2026-07-20 continued -- Guba'e Kana investigation + Abtilis REBUILT (Schodde 1885)

**Guba'e Kana (Council of Nicaea):** Josh chose the expanded 84-canon Arabic/Coptic-lineage tradition over
the plain 20 (NPNF2-14). Confirmed this tradition has **no free English translation anywhere** -- the only
critical edition (da Leonessa 1942) is in Italian, in a limited academic journal, still in copyright.
NPNF2-14 itself only gives one-line captions for the 84, not full text. **Not rebuilt, not sourceable as of
this session.** Revisit if a free English source ever surfaces, or reconsider the plain-20 tradition (which
*is* fully and freely available).

**Big find while digging:** an existing companion project, bible.ertale.com (specifically its
/sources/ page), has already done serious public-domain-sourcing legwork across the Ethiopian broader
canon. It resolved two of the four Sinodos family books that were stuck in "needs digging" since the
2026-07-17 triage:
- **Tizaz** = Horner 1904, *Statutes of the Apostles* (pp. 127-232 of that volume). NOT yet rebuilt --
  confirmed the current file's content is completely wrong (Didache "Two Ways" material, not the real
  ordination/liturgical church-order text), but the real source is ~100 pages of dense canon-law text.
  Large-finding-scale job, same tier as Jubilees or the Meqabyan rebuilds. **Next session priority.**
- **Abtilis** = Schodde 1885 JBL article, 57 canons. **REBUILT this session, full detail in
  AUDIT_GOVERNANCE_LEDGER.md's "Abtilis rebuild" entry.** Prior content was fabricated prose bearing no
  relation to the real text -- same failure class as the Meqabyan MAJOR FINDING. There's an unresolved,
  flagged-not-fixed identity question (a conflicting secondary source claims Schodde's text is actually
  Gessew/Admonitions, not Abtilis) -- see ledger for the reasoning on why Abtilis was judged the better fit.
- Sirate Tsion and Admonitions/Gitsew remain unsourced -- no free English translation known for either.
- Also worth chasing later: M.R. James's 1924 *Apocryphal New Testament* has a public-domain English
  translation of the Ethiopic Apocalypse of Peter, corresponding to book 2 of Qalementos/Ethiopic Clement --
  a lead for one of the non-red Clement files, not yet actioned.

**Not yet done:** dashboard/SEED_VERSION bump for Abtilis (batching per Josh's one-patch-per-logical-unit
rule); Tizaz rebuild; the Guba'e Kana plain-20-vs-expanded-84 tension (Josh may want to revisit given the
84-canon tradition's total unsourceability); the Sirate Tsion/Admonitions/Clement/Mazaheta/Josippon items
carried forward from 2026-07-19 remain open and unaffected.

**Patch this session:** one patch covering the Abtilis rebuild + this resume-note entry + the ledger entry
above, per the "one logical unit, one patch" standing rule.

## Session 2026-07-20 continued -- Tizaz rebuild started (Horner 1904, Statutes 1-20 of 72)

Josh pasted the full text of Horner's 1904 edition, resolving the fetch-tool wall documented
earlier this session. Rebuilt and patched Statutes 1-20 (of 72) as a checkpoint, per Josh's
request to land this before continuing -- full detail in AUDIT_GOVERNANCE_LEDGER.md's "Tizaz
rebuild ... Part 1" entry.

**Next session (or later this session): Statutes 21-72.** This covers the bulk of the book --
baptismal liturgy, consecration prayers for oil/chrism/water, the full ordination-of-bishop rite,
the Oblation/Kiddas, hours of prayer, the calendar of non-working days, and the closing chapters
on Church order and grades of ministry. Continue transcribing from the same source (already in
hand, no further fetching needed) in the same chapter-by-chapter method. Do not mark Tizaz GREEN
or bump SEED_VERSION until all 72 Statutes are in.

## SESSION HANDOFF 2026-07-20 (end of session, context window closing) -- read this first if picking up fresh

**Session summary, in order:**
1. Meqabyan copyright correction (see earlier entry above) -- DONE, committed, on main.
2. Guba'e Kana (Council of Nicaea) investigated per Josh's decision for the expanded 84-canon
   Arabic/Coptic tradition. **Confirmed unsourceable -- no free English translation exists
   anywhere** (only critical edition is da Leonessa 1942, Italian, in-copyright). Plain-20
   tradition (NPNF2-14) IS freely available if Josh wants to revisit that choice. **Not rebuilt,
   not actionable without a source that doesn't currently exist.**
3. **Abtilis: REBUILT and CLOSED this session.** Full rebuild from George H. Schodde's 1885 JBL
   translation (Apostolic Canons, 57 canons, public domain). Prior content was fabricated prose
   unrelated to the real text. Committed and pushed. One open, flagged-not-fixed identity question:
   a secondary source disputes whether Schodde's text is really Abtilis vs. Gessew/Admonitions --
   see the "Abtilis rebuild" ledger entry for the reasoning that favored Abtilis.
4. **Tizaz: REBUILD IN PROGRESS, 40 of 72 Statutes done and landed on main across 3 patches.**
   Source: George Horner, *The Statutes of the Apostles* (1904), "Translation of the Ethiopic
   Text," pp. 127-232, public domain. Prior content was Didache "Two Ways" material, confirmed
   unrelated to the real text (which is ordination/liturgical church order). Statutes 1-40 cover:
   the opening moral-instruction section, ordination canons for bishop/reader/deacon/widow, the
   full bishop-ordination rite with its consecration and Oblation/Kiddas prayers (Statute 22, the
   longest section so far), presbyter/deacon ordination, confessors, readers/virgins/subdeacons,
   catechumen occupation rules, and -- the biggest piece -- the complete baptismal liturgy
   (Statute 35: renunciation, creed, trine immersion, chrismation, milk-and-honey communion) and
   the water/oil/chrism consecration prayers (Statute 40). Wording is unaltered from Horner's
   translation throughout; verse divisions follow natural sentence/paragraph breaks in the source.
   Full detail in AUDIT_GOVERNANCE_LEDGER.md's three "Tizaz rebuild ... Part N" entries.

**CRITICAL DEPENDENCY FOR CONTINUING TIZAZ -- read before attempting Statutes 41-72:**
The Horner 1904 source text was obtained this session because **Josh pasted the full text directly
into the chat** -- this was the resolution to a hard fetch-tool wall on archive.org that blocked
every attempt to retrieve this specific source automatically (documented earlier in this file and
in the ledger; same failure class as Wesley's 2 Baruch and the Wikisource Meqabyan pages). That
pasted text is NOT saved anywhere in the repo or on disk that a fresh session can access -- it only
existed in this chat's context. **A fresh Claude session will NOT be able to fetch this source
itself and should not waste time retrying archive.org.** Ask Josh to re-paste the remaining portion
of the text (Statutes 41-72, i.e. from "Statute 41" onward in Horner's translation, roughly pages
178-232 of the original), or ask if he saved a local copy of the file he can upload directly.

**Next session should:** continue the Tizaz rebuild from Statute 41 onward using the same method --
transcribe faithfully into `data/bible/ET/tizazET.json` chapters, one manageable chunk (~10
statutes) per patch, always surfacing `git am` + `git push origin main` commands, always updating
`AUDIT_GOVERNANCE_LEDGER.md` with a detail entry per chunk. Do NOT mark Tizaz GREEN or bump
SEED_VERSION until all 72 Statutes are in and the book has had a full re-sweep. Remaining content in
Statutes 41-72 includes: fruit blessing, fasting rules, hours of prayer, sealing of the forehead,
a substantial section on the fixed limits between grades of ministry (bishop/presbyter/deacon
cannot do each other's functions), first-fruits and tithes, and closing chapters on apostolic
succession and the Order of the Priesthood.

**Also still open, unaffected by this session:** Sirate Tsion and Admonitions/Gitsew remain
unsourced (no free English translation identified for either); the non-red Clement/Qalementos
files, Malke'a Guba'e/Iyasus, Mazaheta, and Josippon items carried forward from 2026-07-19 remain
open; human verification read-throughs of the 1-3 Meqabyan and Malke'a Virgin Mary rebuilds are
still pending before those move from amber to GREEN.

## SESSION HANDOFF 2026-07-20 continued -- Tizaz Statutes 41-50 landed

**Tizaz: 50 of 72 Statutes now done and landed (this patch), up from 40.** Source for this patch:
Josh uploaded the full Google Books OCR scan (RTF) of Horner's 1904 volume, resolving the same
archive.org fetch wall documented in the prior handoff entry -- this let this session confirm the
whole remaining source range (Statutes 41-72, pp. 178-232) in one file rather than needing repeated
re-pastes. That RTF is NOT saved anywhere in the repo or on disk a fresh session can access -- same
caveat as before, it only exists in this chat's uploads for this session.

Statutes 41-50 cover: fasting rules for Pascha, deacon/bishop visitation of the sick, daily prayer
and instruction, receiving the Eucharist fasting, careful guarding of the Reserved Sacrament, daily
assembly of clergy, burial of the poor, the long hours-of-prayer discourse plus sealing of the
forehead (Statute 48), the long grace/miracles discourse (Statute 49), and the opening of the
grades-of-ministry section (Statute 50). Full detail in AUDIT_GOVERNANCE_LEDGER.md's "Tizaz rebuild
... Part 4" entry.

**Next session should:** continue from Statute 51 onward using the same method -- the same source
range is still available if Josh re-uploads/re-pastes it (see above), same target file
`data/bible/ET/tizazET.json`, one manageable chunk (~10 statutes) per patch, always surfacing
`git am` + `git push origin main` commands, always updating AUDIT_GOVERNANCE_LEDGER.md. Do NOT mark
Tizaz GREEN or bump SEED_VERSION until all 72 Statutes are in. Note from this session's source
review: Statute 72 (the final one) is longer than a typical closing chapter -- it includes a block
of intercessory prayers (congregation, Papas/Patriarch, sick, travellers) before the source ends at
p. 232 -- budget accordingly for the last patch.

**Also still open, unaffected by this session:** same list as the previous handoff entry (Guba'e
Kana unsourceable; Sirate Tsion and Admonitions/Gitsew unsourced; non-red Clement/Qalementos files,
Malke'a Guba'e/Iyasus, Mazaheta, and Josippon items carried forward; human verification read-throughs
of 1-3 Meqabyan and Malke'a Virgin Mary rebuilds still pending).

## SESSION HANDOFF 2026-07-20 continued -- Tizaz Statutes 51-61 landed

**Tizaz: 61 of 72 Statutes now done and landed (this patch), up from 50.** Same source as the
previous handoff entry (Josh's uploaded Google Books OCR scan of Horner 1904); this session used the
already-extracted text for pp. 191-215 without needing a fresh upload.

Statutes 51-61 cover: true/false prophets and the long OT-examples discourse against boasting in
prophetic gifts (Statute 52, 19 verses), the full bishop-ordination rite and Oblation/Kuerban
liturgy (Statute 53), presbyter/deacon/deaconess ordination cross-references, confessors, virgins
and widows, the two-bishops-minimum rule for valid ordination, the distinct blessing/ordaining/
deposing powers of bishop/presbyter/deacon, deaconesses' door-keeping role, first-fruits and tithes,
and the Eulogia distribution formula. Full detail in AUDIT_GOVERNANCE_LEDGER.md's "Tizaz rebuild
... Part 5" entry.

**Next session should:** finish the book with Statutes 62-72 -- this is the FINAL patch for Tizaz.
Same method, same target file `data/bible/ET/tizazET.json`. Budget extra room for Statute 72, which
per the Part 4 handoff note is longer than a typical closing chapter (includes a block of
intercessory prayers). Once 62-72 land: mark Tizaz GREEN, bump SEED_VERSION, and do the full re-sweep
before closing the book out, per standing practice. Source text (same OCR scan) should still be
re-obtainable from Josh if a fresh session needs it re-uploaded; the archive.org fetch wall for this
specific source remains unresolved for automated retrieval.

**Also still open, unaffected by this session:** same list as the previous handoff entries.

## SESSION HANDOFF 2026-07-20 continued -- Tizaz COMPLETE (Statutes 62-72 landed, 72/72)

**Tizaz is now content-complete: all 72 of 72 Statutes landed (this patch adds 62-72, up from 61).**
Same source as the last two handoff entries (Josh's uploaded Google Books OCR scan of Horner 1904),
using the already-extracted text through the confirmed end of the Ethiopic-text section (p. 232,
ending "PRAYER FOR THE PAPAS ... Amen" immediately before the Arabic translation begins).

Statutes 62-72 cover: examination before receiving the Mystery, the long trades-and-occupations
statute (63, incompatible livelihoods and practices), concubinage and lay teaching, hand-washing and
servants, the sabbath/Lord's-Day rest with its full theological grounding (66), the calendar of
non-working feast days, the daily hours of prayer restated, praying at home / not praying with
catechumens or heretics, the memorial of the departed, persecution for the Faith and the
grades-of-ministry discourse (Korah/Uzziah/Saul), and the closing Statute 72 (36 verses) covering
apostolic warrant for the threefold ministry plus a full appended set of intercessory prayers
(morning, sick, travellers, rain, fruit of the earth, rivers, the king, offerings, catechumens, the
departed, peace, the congregation, the Papas). Full detail in AUDIT_GOVERNANCE_LEDGER.md's "Tizaz
rebuild ... Part 6" entry, marked BOOK COMPLETE.

**IMPORTANT -- explicit next step, not done this session:** per standing project practice, Tizaz is
NOT yet marked GREEN and SEED_VERSION has NOT been bumped. This session only edited
`data/bible/ET/tizazET.json` itself (content + its own `meta.rebuildNote`); it deliberately did not
touch whatever registry/dashboard file(s) track GREEN status and SEED_VERSION, since the exact
mechanism for that wasn't reviewed this session and guessing at an unfamiliar governance-file schema
seemed riskier than flagging it clearly. **Next session (or later this session, if resumed) should:**
locate the correct file(s) for the GREEN/SEED_VERSION bump (the admin dashboard's Byzantine Release
Roadmap panel and related registry files may be the right place to look, per pattern from other
books), do the full re-sweep of all 72 Statutes that standing practice calls for before closing a
book out, and then mark Tizaz GREEN and bump SEED_VERSION as its own dedicated patch.

**Also still open, unaffected by this session:** same list as the previous handoff entries (Guba'e
Kana unsourceable; Sirate Tsion and Admonitions/Gitsew unsourced; non-red Clement/Qalementos files,
Malke'a Guba'e/Iyasus, Mazaheta, and Josippon items carried forward; human verification read-throughs
of 1-3 Meqabyan and Malke'a Virgin Mary rebuilds still pending).

## SESSION HANDOFF 2026-07-20 continued -- Tizaz marked GREEN, SEED_VERSION bumped -- FULLY CLOSED

Follow-up to the "Tizaz COMPLETE" handoff above. Did the standing full re-sweep (structural check:
72/72 chapters, no gaps/duplicates, 309 verses, zero empty or duplicate verse content -- all
confirmed programmatically), then found and used the dashboard's actual GREEN/SEED_VERSION mechanism
in `audit-ledger.html` (a `GREEN_SEED` set + `GREEN_NOTES` dict feeding `makeBooks()`, gated by a
client-side `SEED_VERSION` bump that forces a one-time storage reset so the new status actually
reaches users). Added Tizaz to `GREEN_SEED`, wrote its `GREEN_NOTES` entry, bumped `SEED_VERSION` to
`v126-2026-07-20-tizaz-green`. Verified via `node --check` and an isolated re-run of the relevant
constants/function that Tizaz now computes as green with its note attached, before shipping.

**TIZAZ IS FULLY CLOSED.** No further Tizaz work is needed unless a future session finds a defect.

**Also still open, unaffected by this session:** same list as the previous handoff entries (Guba'e
Kana unsourceable; Sirate Tsion and Admonitions/Gitsew unsourced; non-red Clement/Qalementos files,
Malke'a Guba'e/Iyasus, Mazaheta, and Josippon items carried forward; human verification read-throughs
of 1-3 Meqabyan and Malke'a Virgin Mary rebuilds still pending). Next book/task: wherever Josh
redirects -- ask before assuming.

## SESSION HANDOFF 2026-07-21 -- Abtilis GREEN, four governance decisions recorded

Follow-up to Tizaz closing GREEN. Investigated the remaining amber ET backlog and got explicit
direction from Josh on four blocked books, plus resolved Abtilis's open identity question.

**Abtilis: RESOLVED and marked GREEN.** Schodde 1885 = Abtelis, confirmed via bible.ertale.com's own
sources page (explicit statement, plus the independent fact that Gessew has no PD English
translation at all -- both point the same way). SEED_VERSION now `v127-2026-07-21-abtilis-green`.

**Four governance decisions recorded (see AUDIT_GOVERNANCE_LEDGER.md's "Governance decisions,
session 2026-07-21" entry for full detail on each):**
- **Fetha Nagast:** fresh translation from Guidi's 1899 Italian, scheduled for AFTER v1.0 ships.
  Existing 34 (copyright-tainted) chapters left in place unchanged until then.
- **Rest of Baruch:** Books 1, 2, 4 (already sourced -- Book 4's Kraft/Purintun source confirmed
  genuinely public domain this session, a real rights-holder PD dedication, not a Tzadua-style
  problem) ship as-is. Book 3 (Prophecy against Pashhur, no PD source exists) now shows an honest
  "Coming soon..." placeholder verse instead of an empty verses array. NOT marked GREEN -- open
  question for Josh: does a book with one deliberately-placeholdered sub-book count as green, amber,
  or need its own status? Left amber for now.
- **Josippon:** same as Fetha Nagast, deferred to post-v1.0. New finding: existing 93-verse content
  looks like the same "plausible fabrication" pattern as Meqabyan/Abtilis, but no accessible English
  source for the Ethiopic Zena Ayhud exists (only a 1938 German translation by Kamil) -- an original
  translation will be needed when this is picked up.
- **Malke'a Guba'e / Malke'a Iyasus:** Budge lead checked and came back negative for these two
  specific books (found a real Budge 1922 PD source, but it covers Malke'a Hanna and Malke'a Maryam,
  not Guba'e or Iyasus). Same as Fetha Nagast, deferred to post-v1.0.

**Bonus lead for later, not actioned:** that same Budge 1922 volume (*Legends of Our Lady Mary*) is
a real, usable source for the already-RED "Malke'a Virgin Mary" file -- its "Salutations to the
Members of the Body of the Virgin Mary" (pp. 236-244) very likely IS that book's real text. Worth
picking up whenever Malke'a Virgin Mary's pending human-verification review happens.

**Next session should:** ask Josh what's next -- the post-v1.0-deferred items (Fetha Nagast,
Josippon, Malke'a Guba'e/Iyasus) are intentionally parked, not available to pick up early without
his say-so. Everything else on the carried-forward list is unchanged from prior handoffs (Guba'e
Kana unsourceable; Sirate Tsion and Admonitions/Gitsew unsourced; human verification read-throughs of
1-3 Meqabyan and Malke'a Virgin Mary rebuilds still pending).

## SESSION HANDOFF 2026-07-21 continued -- dashboard semantics corrected: audited-blocked books are RED, not amber

Josh caught that Fetha Nagast, Josippon, Malke'a Guba'e, Malke'a Iyasus, and Rest of Baruch -- all
investigated this session with real findings and decisions recorded -- were sitting in amber, which
looks identical to "never looked at." That's wrong and hides the audit work. **Corrected: all five
moved to RED_SEED with full RED_NOTES entries** explaining exactly what's blocked (copyright,
missing source, or partial gap) and what the recorded decision is. `SEED_VERSION` now
`v128-2026-07-21-audited-blocked-books-red`.

**Standing rule going forward, worth internalizing for any future session touching this dashboard:**
amber = genuinely not yet audited. The moment a book has been investigated -- even if the conclusion
is "blocked, decision deferred" rather than "fixed" -- it must move to red (or green, if it turns out
clean) with a RED_NOTES/GREEN_NOTES entry explaining the finding. Never leave an audited book in
amber.

**Corrected ET-corpus status: 7 green (Abtilis, Ascension of Isaiah, Book of Jubilees, Didaskalia,
Hermas, Miracles of Mary, Tizaz), 12 red (1/3/7 Clement, 1/2/3 Meqabyan, Malke'a Virgin Mary, Fetha
Nagast, Josippon, Malke'a Guba'e, Malke'a Iyasus, Rest of Baruch), 12 amber -- genuinely untouched:
2/4/5/8 Clement (ET), Clement Book of Rolls/Visionary/6/Statutes, Admonitions, Guba'ekana, Sirate
Tsion, Mazaheta.**

**Next session should:** pick up one of the 12 genuinely-untouched amber books if continuing this
backlog (Mazaheta or the non-red Clement-family files are probably the most tractable starting
points), or whatever else Josh redirects to.

## SESSION HANDOFF 2026-07-21 continued -- entire ET corpus now correctly shows red/green, zero amber

Before picking a "next unaudited book" per Josh's instruction, checked ledger history for the 12
still-amber books and found ALL of them already had documented findings from the 2026-07-16/18/20
sessions -- the dashboard just was never updated. Same class of error as the five just corrected,
caught before repeating it by actually reading the history instead of trusting the dashboard's amber
label. All 12 moved to RED_SEED with notes: 2/4/5/8 Clement + Clement Book of Rolls/Visionary/6/
Statutes (confirmed thin, non-fabrication content-completeness finding), Admonitions and Sirate Tsion
(confirmed unsourceable -- checked directly against bible.ertale.com, neither Gessew nor Ser'ata Seyon
has a PD English translation), Guba'ekana (misidentified title + condensed, but has a real concrete
source lead: CCEL's NPNF2-14 Nicene canons volume), and Mazaheta (blocked on an unresolved title/
identity question). `SEED_VERSION` now `v129-2026-07-21-et-corpus-fully-audited-red`.

**Final ET-corpus status: 7 green, 24 red, 0 amber.** There is no more "unaudited" book to pick up --
every ET book has been looked at at least once. Real next-step categories going forward:
1. **Rebuild targets with a source lead in hand:** Guba'ekana (CCEL NPNF2-14, most tractable),
   non-red Clement family (R.H. Charles' APOT, unconfirmed whether it actually covers this material).
2. **Confirmed-unsourceable, parked for post-v1.0 original translation:** Fetha Nagast, Josippon,
   Malke'a Guba'e, Malke'a Iyasus, Admonitions, Sirate Tsion.
3. **Blocked on a prerequisite identity question:** Mazaheta.
4. **Rebuilt, awaiting a human verification read-through to go green:** 1-3 Meqabyan, Malke'a Virgin
   Mary (Abtilis and Tizaz also lack a line-by-line human check but were independently confirmed clean
   via structural re-sweep and cross-source corroboration this session, hence green not red).

**Next session should:** given the above, Guba'ekana is the clearest actionable rebuild target left
in the ET corpus (real CCEL source, just needs the plain-20-vs-expanded-Arabic-canons edition
question confirmed before transcribing). Otherwise, ask Josh which category to prioritize.

## SESSION HANDOFF 2026-07-21 continued -- Guba'ekana rebuild STARTED but NOT COMPLETED, no repo changes this session

Picked Guba'ekana as the next rebuild target (per its own RED_NOTES entry: misidentified title,
severely condensed, but with a real concrete public-domain source lead). This session confirmed the
source and gathered the real text, but hit repeated tool-call failures partway through assembling the
rebuild and did not finish it. **No commits were made this session -- `data/bible/ET/guba'ekanaET.json`
on main is unchanged, still the old fabricated 9-chapter/23-verse content.** Nothing to `git am` or
push from this session.

**Source confirmed and already fetched, ready for the next session to use directly (no need to
re-search or re-fetch):** Henry R. Percival's translation in Philip Schaff's *Nicene and Post-Nicene
Fathers*, Series 2, Vol. 14, *The Seven Ecumenical Councils* (NPNF2-14), public domain, hosted at
CCEL. Confirmed this is the plain-20-canon tradition (not the expanded 84-canon Arabic/Ethiopic
tradition) -- the app's existing content doesn't reference the Ethiopian-patriarchate-specific canon,
consistent with the plain tradition.

**MAJOR FINDING confirmed this session, not previously known:** the app's existing chapter 1 ("The
Confession of the 318 Holy Fathers") is not actually the 325 Nicene Creed at all -- it's the *later*
381 Niceno-Constantinopolitan Creed (it includes "the Holy Spirit, the Lord and Giver of Life, who
proceedeth from the Father," language that postdates Nicaea by 56 years and belongs to the Council of
Constantinople instead). The real 325 Creed, confirmed directly from CCEL, is shorter and ends in an
anathema clause against Arian formulas that the app's version omits entirely. This is a second,
independent confirmation (beyond the "9 chapters/23 verses" thinness already logged) that this file's
content is invented rather than transcribed.

**Real source text for the full rebuild, fetched and confirmed this session (URLs below still work,
re-fetch is cheap if needed, but the text is also reproduced in this session's transcript):**
- The real 325 Creed with its anathema: `https://www.ccel.org/ccel/schaff/npnf214.vii.iii.html`
- Canon I: `npnf214.vii.vi.i.html`, Canon II: `.iii.html`, Canon III: `.iv.html`, Canon IV: `.v.html`,
  Canon V: `.vi.html`, Canon VI: `.viii.html`, Canon VII: `.x.html`, Canon VIII: `.xii.html`,
  Canon IX: `.xiv.html`, Canon X: `.xv.html`, Canon XI: `.xvi.html`, Canon XII: `.xviii.html`,
  Canon XIII: `.xix.html`, Canon XIV: `.xxi.html`, Canon XV: `.xxii.html`, Canon XVI: `.xxiv.html`,
  Canon XVII: `.xxv.html`, Canon XVIII: `.xxvii.html`, Canon XIX: `.xxviii.html`, Canon XX: `.xxx.html`
  (all under the `ccel.org/ccel/schaff/` path; the irregular jump in numbering is because CCEL
  interleaves each canon with its own separate "Notes"/commentary page in the site's own pagination,
  which is not part of the canon text itself and should not be transcribed).
- Each canon page contains the real canon text followed by "Notes." and then extensive Ancient-
  Epitome/Balsamon/Hefele/etc. scholarly commentary -- **only the text before "Notes." is the actual
  canon; the commentary is Percival's own apparatus and should be excluded from the transcription**,
  same principle as stripping Horner's/Schodde's footnotes for Tizaz/Abtilis.

**Planned rebuild structure (not yet built):** Chapter 1 = the real Nicene Creed (2 verses: creed
text, then the anathema clause). Chapters 2-21 = Canons I through XX, one canon per chapter, verse
divisions at natural sentence breaks the same way as every other rebuild this project has done. This
replaces the current fabricated content (a paraphrased "confession," an invented "Unity of the
Godhead" chapter with no correspondence to any real Nicene canon, canons that don't match the real
20 canons' actual content or order, and an invented "Final Blessing" -- none of this exists in the
real source).

**Next session should:** build the chapters JSON from the text already gathered (in this session's
transcript and/or by re-fetching the URLs above, which are cheap single-page fetches), insert via the
same string-replacement method used for Tizaz/Abtilis, update `meta` to cite Percival/NPNF2-14 as the
source, do the standard structural re-sweep, write the ledger entry, generate the `git format-patch`
file, and surface the `git am` + `git push origin main` commands -- the full checkpoint discipline
this project uses, none of which happened this session because the rebuild itself was never
finished. Recommend building it in 2-3 smaller patches (e.g., Creed + Canons I-X, then XI-XX) rather
than attempting the whole file in one shot, given this session's difficulty assembling one large
tool call.

## SESSION HANDOFF 2026-07-22 -- Guba'ekana rebuild COMPLETE, marked GREEN

Picked up the in-progress Guba'ekana rebuild from the prior session (source already
confirmed/fetched, no repo changes had been made yet). Diagnosed the prior session's repeated
tool-call failures as most likely from trying to fetch ccel.org directly via the sandbox's bash
network egress, which doesn't have ccel.org on its allowlist -- switched to the `web_fetch` tool
(routes server-side) for all retrieval, and additionally found a single-page plain-text mirror of
the whole Creed+20-canons document at New Advent (`newadvent.org/fathers/3801.htm`, same Percival
1900 translation, revised for New Advent by Kevin Knight) instead of hitting CCEL's paginated
reader 21 separate times -- cut this from ~40 round trips to one fetch.

**Built programmatically, not by hand:** wrote a small Python script to strip the page's inline
encyclopedia cross-reference links, split Creed/Canons into chapters, and divide each canon into
verses at sentence breaks -- then did a scripted word-count parity check per canon against the raw
fetched source (all 21 units matched exactly, zero words dropped or duplicated) before touching the
repo file, rather than trusting a hand-assembled JSON blob.

**Result:** `data/bible/ET/guba'ekanaET.json` rebuilt as 21 chapters / 52 verses -- Chapter 1 = the
real 325 Nicene Creed (2 verses: creed statement, then its anathema clause against Arian formulas),
Chapters 2-21 = Canons I-XX one per chapter. Replaces content that was confirmed fabricated on two
independent grounds (chapter 1 was actually the 381 Creed, not 325; severe thinness/invented
material throughout). Wording unaltered from Percival's 1900 translation. Standard structural
re-sweep clean: no chapter/verse gaps or duplicates, zero empty verses.

Dashboard updated in the same commit per standing rule: Guba'ekana moved RED_SEED -> GREEN_SEED with
a GREEN_NOTES entry. `SEED_VERSION` now `v130-2026-07-22-gubaekana-green`.

**Commands to apply, commit, and push (already committed locally as `279b2ff` on this session's
working clone -- if applying the exported patch to a fresh clone instead):**
```bash
git am 0001-Rebuild-Guba-ekana-from-Percival-s-1900-Nicaea-trans.patch
git push origin main
```

**ET-corpus status update: 8 green, 23 red, 0 amber.** Remaining categories unchanged from the prior
handoff except Guba'ekana moving from category 1 (rebuild target with source lead) to done:
1. Non-red Clement family (R.H. Charles' APOT, unconfirmed whether it covers this material) --
   the next most tractable rebuild target if continuing this backlog.
2. Confirmed-unsourceable, parked for post-v1.0 original translation: Fetha Nagast, Josippon,
   Malke'a Guba'e, Malke'a Iyasus, Admonitions, Sirate Tsion.
3. Blocked on a prerequisite identity question: Mazaheta.
4. Rebuilt, awaiting a human verification read-through to go green: 1-3 Meqabyan, Malke'a Virgin
   Mary.

**Next session should:** ask Josh which category to prioritize, or pick up the Clement-family lead
if continuing unassisted.

## SESSION HANDOFF 2026-07-22 continued -- Clement/Qalementos governance call made, deferred to post-v1.0

Investigated the "non-red Clement family via R.H. Charles' APOT" lead flagged in the prior handoff
before starting any rebuild. **APOT does not cover this material** -- all 11 Clement-family files
(1-8 Clement, Book of Rolls, Visionary, Statutes) self-identify internally as the Ethiopic
Qalementos (Peter's revelations to Clement of Rome), an unrelated New-Testament-era work; APOT is
Old Testament pseudepigrapha. Real PD source is S. Grebaut's French translation (Revue de l'Orient
Chretien, 1907-1917) -- French, not English. Modern critical edition (Bausi) is Italian, in
copyright. A 2025 English translation exists (Lumpkin) but is commercial, not PD.

**GOVERNANCE DECISION (Josh, 2026-07-22): Clement/Qalementos deferred to post-v1.0**, same queue as
Fetha Nagast/Josippon/Malke'a Guba'e/Iyasus/Admonitions/Sirate Tsion. Logged in
AUDIT_GOVERNANCE_LEDGER.md and the shared "2 Clement (ET)" anchor note in audit-ledger.html. No
content changes to the 11 files -- scheduling decision only.

**Separately fixed:** the two confirmed stray Korean-character artifacts (3 Clement 2:4, 7 Clement
3:1, both '그' -> 'that'). Mechanical fix only -- does not resolve the underlying no-source problem,
just removes a non-English character from otherwise-English prose. RED_NOTES updated on both.

**ET-corpus status unchanged from prior handoff except this closes an open question:** 8 green, 23
red, 0 amber. Deferred-to-post-v1.0 queue now: Fetha Nagast, Josippon, Malke'a Guba'e, Malke'a
Iyasus, Admonitions, Sirate Tsion, and now Clement/Qalementos (11 files, one queue item). Remaining
open items: Mazaheta (identity question), 1-3 Meqabyan + Malke'a Virgin Mary (awaiting human
verification read-through).

**Next session should:** ask Josh which category to prioritize -- there is no more untouched
"rebuild target with a source lead in hand" left in the ET corpus; everything remaining either needs
an original translation (post-v1.0, parked), a human read-through, or Mazaheta's identity question
resolved first.
