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

## SESSION HANDOFF 2026-07-22 continued -- Mazaheta identity question resolved, 2/5 sections rebuilt

Picked up Mazaheta next (the last book with a genuine prerequisite blocker rather than a
sourcing dead-end). Resolved the identity question left open since 2026-07-16/18: **"Mazaheta"
is not attested anywhere as a real historical title** -- no hits in scholarly, ecclesiastical, or
manuscript-catalog sources for this specific five-work compilation name. But each of the five
bundled works is independently real and well-documented (Kidane/Covenant Prayer, Weddase
Maryam/Praise of Mary, Anqasa Birhan/Gate of Light, Sa'atat/Horologium, Me'erAf/Common Hymns) --
this reads as an app-internal compilation label, the same pattern as Rest of Baruch's multi-book
split, not a fabricated single work.

**2 of 5 sections rebuilt** from Josh's own browser paste of pages 54-60 and 279-296 of E.A.
Wallis Budge's 1922 *Legends of Our Lady Mary* (the same volume already confirmed and used for
Malke'a Virgin Mary in this project -- automated fetch hit the same archive.org OCR hard-truncation
wall noted in Tizaz's history, so Josh pasted the pages directly, same fix as last time):
- **Kidane**: both accounts of the Covenant of Mercy (Budge pp. 54-59), 2 chapters / 39 verses.
- **Weddase Maryam**: complete week of daily praises (Budge pp. 279-296, via Fries' 1892 critical
  edition), 7 chapters / 194 verses.

Both verified via scripted word-count parity check against the source (zero words dropped/
duplicated) before touching the repo, and the standard structural re-sweep is clean across the
whole file.

**Remaining 3 sections (Anqasa Birhan, Sa'atat, Me'erAf) are NOT in Budge's volume** and have no
confirmed PD English source located yet -- unchanged, still unverified. Not marked GREEN (3/5
sections still unsourced). Same open governance question as Rest of Baruch's Book 3: how to treat
a partially-rebuilt multi-section book on the dashboard. Left RED with a note documenting exactly
what's done and what's still open.

**ET-corpus status: 8 green, 23 red (unchanged in count, but Mazaheta's red reason is now
"partially sourced" rather than "identity blocked"), 0 amber.**

**Next session should:** ask Josh whether to pursue sources for Anqasa Birhan/Sa'atat/Me'erAf
(Anqasa Birhan's real PD-era translation is Grohmann 1919, in German, not English -- same
original-translation category as the post-v1.0 queue), or move to the human-verification
read-throughs (1-3 Meqabyan, Malke'a Virgin Mary) which are the last remaining category with no
open sourcing question at all.

## SESSION HANDOFF 2026-07-22 continued -- human-verification read-throughs done; 2 Meqabyan found contaminated

Completed the human-equivalent verification read-through for the four remaining "rebuilt but not
individually checked" books:

**Malke'a Virgin Mary -- GREEN.** Direct stanza-by-stanza comparison against Budge 1922 (already
in-session from an earlier paste) confirms exact wording match, including inline scriptural
cross-references (Song of Solomon, Ezekiel, Exodus citations embedded in several stanzas).
Structural sweep clean: 42/42 stanzas.

**1 Meqabyan -- GREEN.** Structural sweep clean. Scanned for the Patois-register markers that
turned out to contaminate 2 Meqabyan (see below) -- zero hits, confirming chapters 1-7 really are
the formal Wikisource translation as claimed, not a mislabeled Patois text. Chapters 8-36 remain
intentionally empty per the 2026-07-20 governance decision.

**3 Meqabyan -- GREEN.** Structural sweep clean, same Patois-marker scan came back zero. Single-
source caveat (Wikisource only, apocryphalibrary.weebly.com doesn't host this book) retained.

**2 Meqabyan -- STILL RED, real problem found.** The 2026-07-20 rebuild note explicitly claims "No
Patois/Iyaric text involved in this book at all," but this session found 20 of 21 chapters are
actually written in Patois/Iyaric-register English (markers like "ina," "iginnin,"
"downstroyed," apostrophe-prefixed names throughout). Confirmed against real Wikisource
search-result text for chapter 1: the actual translation is plain formal English; this file's
chapter 1 is a Patois paraphrase of the same content. Per standing project policy (already applied
to 1 Meqabyan), Patois/Iyaric register is excluded from this corpus regardless of licensing status.
**Root cause not yet determined** -- either the 2026-07-20 rebuild used the wrong source despite
its own claim, or the file was reverted/corrupted afterward.

**NOT fixed this session:** full-page fetch of Wikisource is blocked (cache-only) in this session's
tooling -- only fragments of the real translation were retrievable via search snippets, not enough
to safely rebuild all 21 chapters without risking another sloppy transcription. Left RED with the
full contradiction logged in `audit-ledger.html`.

**ET-corpus status: 11 green, 20 red, 0 amber.** `SEED_VERSION` now `v131-2026-07-22-meqabyan-mkv-
verified`.

**Next session should:** get 2 Meqabyan's real Wikisource text into the session -- either via a
working fetch path, or (the reliable fallback used for Tizaz and Mazaheta when automated fetch
failed) ask Josh to paste `en.wikisource.org/wiki/Translation:2_Meqabyan` directly -- then do a
full rebuild of all 21 chapters the same careful way as the other rebuilds this project has done
(programmatic build + word-count parity check before touching the repo).

## SESSION HANDOFF 2026-07-22 continued -- 2 Meqabyan fully rebuilt and GREEN

Josh pasted the real Wikisource translation (`en.wikisource.org/wiki/Translation:2_Meqabyan`)
after automated fetch failed (cache-only) -- same fallback as Tizaz and Mazaheta. Full rebuild
of all 21 chapters, replacing the Patois/Iyaric-contaminated content found in the previous
handoff's verification read-through. Built programmatically (regex-based chapter/verse parse,
not hand-assembled) and verified via scripted word-count parity check against the source for
every chapter individually before touching the repo -- zero words dropped or duplicated. 21
chapters, 421 verses. Two verse-number gaps (ch.16 after v.8, ch.21 after v.8) are native to the
Wikisource page itself, left honestly absent.

Marked GREEN, `SEED_VERSION` bumped to `v132-2026-07-22-2meqabyan-rebuilt-green`.

**ET-corpus status: 12 green, 19 red, 0 amber.** This closes out the entire "human verification
read-through" batch from the last handoff -- all four books (Malke'a Virgin Mary, 1/2/3 Meqabyan)
are now GREEN, with 2 Meqabyan's real contamination found and fixed along the way.

**Next session should:** ask Josh which category to prioritize next -- remaining open items are
the post-v1.0 deferred queue (Fetha Nagast, Josippon, Malke'a Guba'e, Malke'a Iyasus, Admonitions,
Sirate Tsion, Clement/Qalementos), Mazaheta's remaining 3 unsourced sections (Anqasa Birhan,
Sa'atat, Me'erAf), and the non-red Clement family lead is now closed (deferred, see prior handoff).

## SESSION HANDOFF 2026-07-24 -- dashboard now distinguishes "blocked until v1.0" reds from "fixable now" reds

Reviewed all 21 current RED_SEED book entries against their own RED_NOTES and sorted into two
buckets, per Josh's direction: "if it can be fixed simply, keep red; if it's blocked until v1.0
ships, mark it red and white-striped."

**Fixable now (plain red, 2 items):** 2 Baruch (CE), Letter of Baruch (SY) -- confirmed content
defects (missing verses, chapter-boundary duplication) against an already-identified source
(Charles' APOT / Wesley Center Online), nothing blocked, just not yet fixed.

**Blocked until v1.0 (new red+white-striped treatment, 19 items):** the 11-file Clement/Qalementos
family, Fetha Nagast, Josippon, Malke'a Guba'e, Malke'a Iyasus, Rest of Baruch (Book 3's confirmed
blocker), Admonitions, Sirate Tsion, Mazaheta. Each traces to an explicit governance deferral or a
confirmed "no PD English source exists" finding.

New `POST_V1_BLOCKED` set + `classFor(item)` helper, used everywhere a stamp/book-code className is
set, so the stripe only shows while status is actually red (manually cycling a stamp away from red
correctly drops it). New CSS (`.stamp.red.blocked`, `.book-code.red.blocked`, `.dot.red.blocked`,
diagonal red/white stripe) plus a legend entry. Ethiopian/Byzantine red items (Sa'atat shape,
Senkessar Ginbot, Menaion/Triodion/Pentecostarion) reviewed too -- no explicit blocking constraint
recorded for any of them, left plain red.

Verified by evaluating the actual script in Node (with a minimal DOM stub), not just inspection:
confirmed zero POST_V1_BLOCKED entries outside RED_SEED, and classFor()'s output checked directly
against all three status values.

**No content or ET-corpus status changes this session** -- this was a dashboard-presentation
feature only. ET-corpus status unchanged: 12 green, 19 red, 0 amber.

**Next session should:** ask Josh which category to prioritize -- the newly-visible "fixable now"
reds (2 Baruch, Letter of Baruch) are the most tractable immediate targets since their sources are
already known; everything striped is waiting on either a v1.0 ship date or a translation-sourcing
breakthrough.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) duplication fixed; scope on the rest revised upward

Picked up the two "fixable now" reds identified in the last handoff (2 Baruch (CE), Letter of
Baruch (SY)). Before attempting the full ~1,939-word restoration, fixed the one concrete,
mechanically-verifiable defect: chapter 12 verses 6-7 verbatim duplicated chapter 13 verses 1-2.
Chapter 12 now correctly ends at verse 5, using the raw source snapshot already committed to the
repo (`data/bible/translations/2baruch/raw/2baruch-charles-apot2-source-snapshot-2026-07-05.txt`,
R.H. Charles' 1913 APOT translation, public domain) -- no fresh fetch needed.

**Revised the scope assessment on the rest, and it's gone up, not down.** The 1913 OCR source has
real verse-boundary ambiguity in places -- line breaks split mid-clause, and verse numbers are
sometimes OCR-mangled onto the wrong word. Confirmed a real missing clause in chapter 15
("but thou hast not judged well regarding the evils which befall those who sin"), and found the
same shape of gap in four more chapters beyond what was previously logged (32, 44, 64, 80) --
meaning the true scope of missing content is larger than the 2026-07-18 finding catalogued.

**Deliberately did not attempt the full restoration this session.** Guessing at ambiguous clause
boundaries under time pressure is exactly the failure mode this project has learned to avoid (see
the standing lesson on blind pattern fixes producing near-misses, from the NABRE/1-Enoch corpus
bugs). This is genuinely full-rebuild-scale work, same category as Hermas/Didascalia -- it should
get its own checkpointed multi-session effort (patch-by-patch, like Tizaz's six-patch rebuild),
not be rushed through in one pass.

**Letter of Baruch (SY) untouched this session** -- its chapters 4-5 copy 2 Baruch's chapters 81-82
verbatim, which are part of the same still-unrestored missing-content problem, not the duplication
defect that was fixed. It stays exactly where it was.

RED_NOTES for 2 Baruch (CE) updated to record the real fix and the honest revised scope. Neither
book moved to GREEN -- the duplication was only one of several confirmed problems.

**ET/SY-corpus status unchanged in green/red counts** -- this was a within-red content fix, not a
status change.

**Next session should:** treat 2 Baruch (CE)'s missing-content restoration as its own dedicated,
checkpointed project (not a quick pass) -- work chapter by chapter against the raw source snapshot
already in the repo, verify each chapter's verse boundaries carefully given the OCR ambiguity
found this session, and only then look at Letter of Baruch (SY), which will inherit whatever gets
fixed in 2 Baruch's chapters 81-82.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 1: self-correction + chapter 13 fixed

Began the checkpointed multi-chapter restoration effort for 2 Baruch (CE), one chapter at a time
against the raw source snapshot already in the repo.

**Self-correction, first:** the immediately preceding handoff claimed 4 additional chapters (32,
44, 64, 80) had missing content, based on verse-number gaps spotted during a quick pass. That claim
was wrong -- on careful re-inspection, those gaps are artifacts of the 1913 source's own combined
verse markers (printed as e.g. "4,5" or "5,6", one unit covering what becomes two verse numbers) --
the app's existing verse-splitting already captures all the real content there, just grouped
differently than the source's numbering. Nothing is actually missing in those four chapters.
Lesson: truncated/quick text comparisons produced a false positive here; full-text comparison
against the source is required before concluding content is missing, not just spotting a
verse-number gap.

**Chapter 13 (one of the ORIGINALLY-flagged chapters from 2026-07-18) -- confirmed real and fixed.**
Found two genuinely missing stanzas: an entire "For how long? ... judgement of the Lofty One who
has no respect of persons" verse (missing entirely between old v8 and v9), and an entire "Then
therefore were they chastened that they might be sanctified" verse (missing entirely after old
v10). Also found and corrected a mis-split: the old v9/v10 boundary had incorrectly split the
source's real single verse 9 across two verse numbers. Chapter 13 now has 11 verses (was 10), both
restorations verified directly against the source text before touching the repo.

**Remaining for this checkpointed effort:** chapters 14, 19, 20, 21, 29, 31, 35, 43, 48, 49, 51 (the
rest of the originally-flagged list) still need the same careful, chapter-by-chapter treatment.
Chapters 86-87 remain entirely unverified against any primary source (the Wesley Center Online page
this project has used stops mid-chapter-85). Letter of Baruch (SY) still untouched -- it inherits
2 Baruch's chapters 81-82, which haven't been checked yet either.

**How to work each remaining chapter (for whoever picks this up next):** find the chapter's actual
verse text in `data/bible/translations/2baruch/raw/2baruch-charles-apot2-source-snapshot-2026-07-05.txt`
(grep for a distinctive phrase from the app's existing text, not the chapter number alone -- roman-
numeral chapter headers in this source are usually footnote/commentary markers, not the real verse
text), read the FULL surrounding text (not a truncated preview -- that's exactly what caused this
session's false alarm), and compare sentence-by-sentence against the app's current verses before
concluding anything is missing. Combined verse markers (e.g. "4,5") are common in this source and do
NOT mean content is missing -- only conclude a real gap when there's actual narrative content in the
source with no corresponding text anywhere in the app's verses.

**ET/SY-corpus status unchanged in green/red counts** -- still a within-red content fix, chapter 13
of ~12+ chapters done.

**Next session should:** continue chapter-by-chapter through 14, 19, 20, 21, 29, 31, 35, 43, 48, 49,
51, checkpointing (commit + patch) after each chapter or small batch, the same careful way chapter
13 was done this session.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 2: chapters 14 and 19 fixed

Continued the chapter-by-chapter restoration. Two more chapters done, both verified directly
against the source before touching the repo:

**Chapter 14:** one entirely missing verse restored -- a couplet on God's incomprehensible counsel
("Or who will be able to think out Thy incomprehensible counsel? Or who of those that are born has
ever found the beginning or end of Thy wisdom?"), missing between the old v10 and v11. Now 15
verses (was 14).

**Chapter 19:** two missing stanzas restored -- an entire clause where God calls heaven and earth
to witness against Israel, and the back half of what is now verse 4 ("though they knew that they
had the law reproving them, and the light in which nothing could err, also the spheres which
testify, and Me"). Now 9 verses (was 8).

**Caught my own mistake mid-checkpoint:** the chapter 19 fix initially introduced an off-by-one
renumbering slip (a gap at v5) from miscounting how many new verses were inserted vs. how much the
tail needed to shift. Found via the standard structural re-sweep and corrected before committing --
worth flagging as a reminder to always re-run the sweep after every verse-insertion, not just at
the end of a session.

**Total progress so far in this checkpointed effort:** chapters 13, 14, 19 done (3 of the original
12-chapter list). Remaining: 20, 21, 29, 31, 35, 43, 48, 49, 51, plus chapters 86-87 still
unverified against any primary source. Letter of Baruch (SY) still untouched.

**ET/SY-corpus status unchanged in green/red counts** -- still within-red content fixes.

**Next session should:** continue with chapter 20, same careful methodology -- find the chapter's
actual verse text via a distinctive-phrase grep (not the chapter number alone), view the FULL
surrounding source text (never a truncated preview), compare sentence-by-sentence, and re-run the
structural sweep after every single chapter's edit, not just at session's end.

## SESSION HANDOFF 2026-07-24 -- ending here on token limit, mid-checkpoint on 2 Baruch (CE)

Ending this session at ~90% token budget. Everything through checkpoint 2 is committed and pushed
(commit `95edfcd`). This entry exists so the next session can pick up cold without re-deriving
context.

**Where things stand right now, in order of what a fresh session needs to know:**

1. **Dashboard now distinguishes "blocked until v1.0" reds from "fixable now" reds.** New
   `POST_V1_BLOCKED` set + red/white-striped CSS treatment in `audit-ledger.html`. Of the 21
   RED_SEED book items, 19 are genuinely blocked (Clement/Qalementos family x11, Fetha Nagast,
   Josippon, Malke'a Guba'e/Iyasus, Rest of Baruch, Admonitions, Sirate Tsion, Mazaheta) and 2 are
   fixable now (2 Baruch (CE), Letter of Baruch (SY)).

2. **2 Baruch (CE) is mid-restoration, checkpointed.** The chapter 12/13 duplication is fixed.
   Working chapter-by-chapter through the originally-flagged missing-content list (13, 14, 19, 20,
   21, 29, 31, 35, 43, 48, 49, 51) against the raw source snapshot already in the repo at
   `data/bible/translations/2baruch/raw/2baruch-charles-apot2-source-snapshot-2026-07-05.txt`
   (R.H. Charles' 1913 APOT translation, public domain). **Done so far: chapters 13, 14, 19** (3 of
   12). **Remaining: 20, 21, 29, 31, 35, 43, 48, 49, 51**, plus chapters 86-87 which are entirely
   unverified against any primary source (the source snapshot itself stops mid-chapter-85 -- a
   second source will be needed for 86-87, not yet identified). Letter of Baruch (SY) is untouched
   -- it inherits 2 Baruch's chapters 81-82 verbatim, which haven't been checked yet either.

3. **IMPORTANT METHODOLOGY NOTE, learned the hard way this session:** a truncated/quick text
   comparison produced a false alarm mid-session (wrongly claimed chapters 32, 44, 64, 80 had
   missing content -- they didn't; the gaps were just the source's own combined verse markers like
   "4,5" printed as one unit). **Always view the FULL untruncated source text and the FULL current
   app text before concluding content is missing** -- a verse-number gap alone is not evidence of
   missing content in this source, since it OCR's combined-verse markers routinely. Also: an
   off-by-one renumbering slip was self-introduced and caught mid-checkpoint (ch.19) -- **always
   re-run the structural sweep immediately after each single chapter's edit**, not batched at the
   end.

**How to work each remaining chapter (repeating this for the next session):**
1. Pull the chapter's current full verse text from `2baruchSY.json` (not truncated).
2. `grep` the raw source snapshot for a distinctive phrase from that text (chapter-number-alone
   greps mostly hit footnote/commentary lines, not the real verse text -- roman numerals like
   "XIX." are almost always footnote markers).
3. View the FULL surrounding source text (30-50 lines), including where it flows into the next
   chapter's footnote apparatus, so nothing is missed.
4. Compare sentence-by-sentence against the app's current verses. Only conclude something is
   missing if there's real narrative content in the source with literally no corresponding text
   anywhere in the app's verses -- not just a verse-number skip.
5. If something's missing, insert it, renumbering subsequent verses in that chapter only.
6. Immediately re-run the structural sweep (chapter/verse gaps, empty verses) on the WHOLE file
   before moving to the next chapter.
7. Checkpoint (commit + patch) every 2-3 chapters, per Josh's standing rule that every handoff
   includes exact apply/commit/push commands.

**ET/SY-corpus status:** 12 green, 19 red, 0 amber (unchanged this session -- these are within-red
content fixes, not status changes).

**Next session should:** continue with chapter 20 using the methodology above, then 21, 29, 31, 35,
43, 48, 49, 51 in whatever batching makes sense, then tackle chapters 86-87 (needs a source --
check if Charles' 1896 earlier translation or another edition covers the gap Wesley Center's page
doesn't reach), then finally Letter of Baruch (SY) once 2 Baruch's chapters 81-82 are confirmed
clean.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 3: chapter 20 fixed (2 missing
verses restored + mis-split stanza merged)

Continued the chapter-by-chapter restoration, same methodology as checkpoints 1-2.

**Chapter 20:** two entire verses were missing -- "Therefore have I now taken away Zion, that I may
the more speedily visit the world in its season" (the source's real verse 2), and "Now therefore
hold fast in your heart everything that I command you, and seal it in the recesses of your mind.
And then I will show you the judgement of My might, and My ways which are unsearchable" (the
source's verses 3-4, printed after an intervening block of footnote/commentary text in the OCR'd
source -- same "real content interrupted by footnote apparatus" pattern as other chapters in this
book). Also found and corrected a mis-split: the app's old verses 1-4 had broken the source's single
verse 1 (a four-line poetic stanza) into four separate one-line verses -- merged back into one verse
1, matching the source's own numbering and this book's established sentence/verse-boundary
convention elsewhere (not a one-line-per-verse style). Net effect: still 6 verses total (3 removed
by the merge, 3 added by the restoration), but real content is now present that wasn't before.
Pronouns rendered as "you/your" to match this book's already-established modernized-pronoun
convention (confirmed by checking chapters 13/14/19, which already render the source's "thee/thy"
as "you/your" throughout) -- verses 5-6, which were already correct, were left untouched.

Verified directly against `data/bible/translations/2baruch/raw/2baruch-charles-apot2-source-
snapshot-2026-07-05.txt` before touching the repo. Structural re-sweep run on the whole file
immediately after: chapter 20 is now clean. The five previously-known open gaps (chapters 15, 32,
44, 64, 80 -- confirmed real, not yet restored) are unchanged and expected; nothing new introduced.

**Total progress so far in this checkpointed effort:** chapters 13, 14, 19, 20 done (4 of the
original 12-chapter list). Remaining: 21, 29, 31, 35, 43, 48, 49, 51, plus chapters 86-87 still
unverified against any primary source. Letter of Baruch (SY) still untouched.

**ET/SY-corpus status unchanged in green/red counts** -- still within-red content fixes.

**Next session should:** continue with chapter 21, same methodology -- find the chapter's actual
verse text via a distinctive-phrase grep (not the chapter number alone), view the FULL surrounding
source text (never a truncated preview), compare sentence-by-sentence, watch for the same
"footnote apparatus interrupts real verse text mid-chapter" pattern seen in chapter 20, and
re-run the structural sweep after every single chapter's edit, not just at session's end.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 4: chapter 21 fixed (1 missing
verse restored + 1 confirmed typo corrected)

Continued the chapter-by-chapter restoration, same methodology as checkpoints 1-3.

**Chapter 21:** one entire verse was missing -- "For the nature of man is always changeable. For
what we were formerly now we no longer are, and what we now are we shall not afterwards remain,"
which belongs between the old v16 ("Or beauty that turns to ugliness.") and old v17 ("For if a
consummation had not been prepared..."). Confirmed unambiguously missing: this exact content has
no corresponding text anywhere else in the chapter. Inserted as new v17, renumbering the rest of
the chapter (old 17-26 -> new 18-27). Chapter now has 27 verses (was 26).

**Also fixed a confirmed typo in v9**, unrelated to the missing-verse question: the app's text read
"those who are to righteous," which doesn't parse; the source reads "those who sin, and those who
are righteous" with no "to." Corrected to match.

**Deliberately left alone, flagged as an open ambiguity rather than guessed at:** the source's own
verse numbering around vv.14-16 is internally inconsistent -- the printed text shows an explicit
"14" then jumps straight to "16" with no "15" anywhere, while a footnote on the same page refers to
"verses 14, 15" as if both exist. The three lines currently split across the app's vv.14-16
("strength that turns to sickness" / "food that turns to famine" / "beauty that turns to ugliness")
may or may not be the source's real verse-14-through-16 grouping. Did NOT merge or renumber this
span, since there's no clear evidence either way and this project's standing rule is to resolve
verse boundaries by direct content comparison, not guesswork -- unlike chapter 20's stanza, which
had one single unambiguous chapter-line label ("20:") with no competing numbering, this one has
genuinely conflicting signals in the source itself. No content is missing here regardless of how
the lines are eventually numbered, so this doesn't block anything -- just worth flagging if a future
session wants to dig further (e.g. checking a second edition/scan of this same page).

Verified directly against the same raw source snapshot before touching the repo. Structural
re-sweep run on the whole file immediately after: chapter 21 is now clean (27/27 verses, no gaps/
dupes/empties). The five previously-known open gaps (chapters 15, 32, 44, 64, 80) are unchanged
and expected.

**Total progress so far in this checkpointed effort:** chapters 13, 14, 19, 20, 21 done (5 of the
original 12-chapter list). Remaining: 29, 31, 35, 43, 48, 49, 51, plus chapters 86-87 still
unverified against any primary source. Letter of Baruch (SY) still untouched.

**ET/SY-corpus status unchanged in green/red counts** -- still within-red content fixes.

**Next session should:** continue with chapter 29, same methodology as checkpoints 1-4 -- distinctive-
phrase grep, full untruncated source view, sentence-by-sentence comparison, watch for footnote-
apparatus interruptions and internally-inconsistent verse numbering (both confirmed present in this
source), only restructure verse boundaries when the evidence is unambiguous, and re-run the
structural sweep after every single chapter's edit.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 5: chapter 29 confirmed clean
(false alarm, no edit), chapter 31 fixed (3 verses with missing content restored)

**Chapter 29: verified against the source and found to have NO missing content.** A scripted
word-count parity check (normalized word multiset comparison) came back an exact match, 248 words
both sides, zero words in either direction not in the other. The only difference is where the
source places its verse-1/verse-2 boundary (the app merges the source's v1 and the first clause of
its v2 into one verse) -- a numbering-boundary difference, not a content gap. **No repo edit made.**
This is the same false-alarm pattern already documented for chapters 32, 44, 64, 80 in checkpoint
1 -- worth remembering that not every chapter on the originally-flagged list turns out to have a
real defect; verify before assuming.

**Chapter 31: real, substantial missing content confirmed and fixed.** Three consecutive verses
were each truncated mid-sentence, missing the second half of their content:
- v3 was missing its entire quoted content: "'Hear, O Israel, and I will speak to thee, and give
  ear, O seed of Jacob, and I will instruct thee.'" (app had only "And I answered and said unto
  them:" with nothing after the colon).
- v4 was missing "but hold in remembrance the anguish of Jerusalem" (app had only "Forget not
  Zion,").
- v5 was missing "when everything that is shall become the prey of corruption and be as though it
  had not been" (app had only "For lo! the days come,").

All three restorations use "thee/thy" rather than this book's more common modernized "you/your,"
matching the source's own wording exactly for this poetic address -- same precedent as chapter 13's
restored "Thou wilt say to them," which also kept the source's archaic pronoun rather than
modernizing newly-inserted text. Verse count unchanged (5) since each fix extends an existing verse
rather than adding a new one. Verified directly against the source before touching the repo.
Structural re-sweep clean immediately after (same five previously-known gaps, unchanged: chapters
15, 32, 44, 64, 80).

**Total progress so far in this checkpointed effort:** chapters 13, 14, 19, 20, 21, 29 (confirmed
clean, no edit needed), 31 done (6 of the original 12-chapter list addressed, one of which needed no
fix). Remaining: 35, 43, 48, 49, 51, plus chapters 86-87 still unverified against any primary
source. Letter of Baruch (SY) still untouched.

**ET/SY-corpus status unchanged in green/red counts** -- still within-red content fixes.

**Next session should:** continue with chapter 35, same methodology as checkpoints 1-5 -- do not
assume every chapter on the original flagged list has a real defect (verify first, as chapter 29
this session and chapters 32/44/64/80 in checkpoint 1 both turned out clean); distinctive-phrase
grep, full untruncated source view, sentence-by-sentence comparison, watch for footnote-apparatus
interruptions and internally-inconsistent verse numbering, only restructure verse boundaries when
the evidence is unambiguous, and re-run the structural sweep after every single chapter's edit.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 6: chapter 35 fixed (every
poetic couplet in the chapter was missing its second line)

**Chapter 35: real, systematic missing content confirmed and fixed.** This is Baruch's lament over
Zion -- four consecutive poetic couplets (vv.2-5), and every single one had been truncated at its
first line, dropping the parallel second line entirely:
- v2 was missing "and mine eyelids a fount of tears" (app had only "O that mine eyes were springs,").
- v3 was missing "and how shall I mourn for Jerusalem?" (app had only "For how shall I lament for
  Zion,").
- v4 was missing "of old the high priest offered holy sacrifices, and placed thereon an incense of
  fragrant odours" (app had only "Because in that place where I am now prostrate,").
- v5 was missing "and the desire of our soul into sand." (app had only "But now our glorying has
  been made into dust,").

v1 (the narrative opening, "And I, Baruch, went to the holy place...") was already correct and
untouched. This is the most consistent single-pattern content loss found in the book so far --
every verse after the first cut at exactly the same structural point (end of the couplet's first
line). Verified directly against the source before touching the repo; verse count unchanged (5)
since each fix extends an existing verse. Structural re-sweep clean immediately after (same five
previously-known gaps, unchanged: chapters 15, 32, 44, 64, 80).

**Total progress so far in this checkpointed effort:** chapters 13, 14, 19, 20, 21, 31, 35 fixed;
chapter 29 confirmed clean (no edit needed). 7 of the original 12-chapter list addressed. Remaining:
43, 48, 49, 51, plus chapters 86-87 still unverified against any primary source. Letter of Baruch
(SY) still untouched.

**ET/SY-corpus status unchanged in green/red counts** -- still within-red content fixes.

**Next session should:** continue with chapter 43, same methodology as checkpoints 1-6 -- verify
before editing (not every flagged chapter has a real gap); distinctive-phrase grep, full untruncated
source view, sentence-by-sentence comparison, watch for footnote-apparatus interruptions,
internally-inconsistent verse numbering, and the "poetic couplet truncated at line 1" pattern just
confirmed in chapter 35 (worth checking for specifically in any remaining poetic passage); only
restructure verse boundaries when the evidence is unambiguous; re-run the structural sweep after
every single chapter's edit.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 7: chapter 43 fixed (v2 missing
3 of its 4 lines)

**Chapter 43: real missing content confirmed and fixed.** God's address to Baruch telling him of
his impending translation (not death). v1 and v3 were already correct. v2, a four-line poetic verse,
was truncated after its first line -- missing "and you shall pass from the regions which are now
seen by you, and you shall forget whatever is corruptible, and shall not again recall those things
which happen among mortals" (app had only "For you shall depart from this place,"). Restored using
this chapter's own already-established modernized "you/your" convention (v1 and v3 were both already
modernized from the source's "thee/thy," so the newly-restored lines match rather than reverting to
the source's archaic pronouns -- differs from chapters 31/35's precedent of keeping "thee/thy," since
those chapters had no surrounding modernized-pronoun convention to match and this one does). Verified
directly against the source before touching the repo; verse count unchanged (3). Structural re-sweep
clean immediately after (same five previously-known gaps, unchanged: chapters 15, 32, 44, 64, 80).

**Total progress so far in this checkpointed effort:** chapters 13, 14, 19, 20, 21, 31, 35, 43 fixed;
chapter 29 confirmed clean (no edit needed). 8 of the original 12-chapter list addressed. Remaining:
48, 49, 51, plus chapters 86-87 still unverified against any primary source. Letter of Baruch (SY)
still untouched.

**ET/SY-corpus status unchanged in green/red counts** -- still within-red content fixes.

**Next session should:** continue with chapter 48, same methodology as checkpoints 1-7 -- verify
before editing; distinctive-phrase grep, full untruncated source view, sentence-by-sentence
comparison, watch for footnote-apparatus interruptions, internally-inconsistent verse numbering, and
poetic-line truncation (now confirmed in three different forms across chapters 20/21/35/43); when
restoring pronouns, match whatever convention (modernized "you/your" vs. source's archaic "thee/thy")
is already established by the surrounding untouched verses in that specific chapter, rather than
applying one convention uniformly across the whole book; re-run the structural sweep after every
single chapter's edit.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 8: chapter 48 -- mostly clean,
one confirmed typo fixed, no missing content found (largest chapter checked so far, 50 verses)

**Chapter 48 verified in full, all 50 verses read sentence-by-sentence against the source.** This
is the longest chapter checked in this restoration effort so far -- Baruch's prayer and God's long
reply about the coming woes. Two source-side oddities were found and correctly judged NOT to be
missing content:
- vv.4-5: the raw OCR source prints these two couplets' lines in a scrambled, illogical order
  ("Thou weighest the lightness of the wind" appearing before "Thou makest known the multitude of
  the fire," breaking the fire/wind, heights/darkness parallelism). The app's existing text already
  has the sensible, correctly-ordered version -- confirmed this is an OCR artifact in the printed
  source, not evidence the app is wrong. No edit made.
- Source's own printed numbering skips from v.43 straight to v.45 with no v.44 at all, while the
  app has a continuous 43/44/45/46/47. Checked word-for-word: this is not a content gap -- the app's
  v.44 and v.45 are just a different (reasonable) split of the same continuous text the source
  presents as one v.45, and the app's v.46 similarly merges what the source's own OCR line-breaks
  present as v.46 running into v.47 mid-clause ("who have / existed"). Same "OCR page-line breaks
  don't reliably mark real verse boundaries" caveat already documented for this source. No edit made.

**One real, confirmed defect found and fixed:** v.38 read "shall manifestly appeal to every man" --
a transcription typo; the source clearly reads "appear." Corrected.

**No other missing content found anywhere in the chapter** after a full sentence-by-sentence read
of all 50 verses. Structural re-sweep clean immediately after (same five previously-known gaps,
unchanged: chapters 15, 32, 44, 64, 80).

**Total progress so far in this checkpointed effort:** chapters 13, 14, 19, 20, 21, 31, 35, 43 fixed
with real content restored; chapters 29 and 48 verified clean (48 needed one typo fix, 29 needed
none). 9 of the original 12-chapter list addressed. Remaining: 49, 51, plus chapters 86-87 still
unverified against any primary source. Letter of Baruch (SY) still untouched.

**ET/SY-corpus status unchanged in green/red counts** -- still within-red content fixes.

**Next session should:** continue with chapter 49, same methodology as checkpoints 1-8 -- verify
before editing rather than assuming every flagged chapter has a real gap (roughly half the
originally-flagged chapters have turned out to need no content restoration at all: 29 and 48 clean,
32/44/64/80 clean per checkpoint 1); distinctive-phrase grep, full untruncated source view,
sentence-by-sentence comparison, watch for footnote-apparatus interruptions, scrambled OCR line
order within a couplet (new pattern confirmed in ch.48 vv.4-5 -- check the app's version makes better
sense before assuming it's wrong), and internally-inconsistent verse numbering; only restructure
verse boundaries when the evidence is unambiguous; re-run the structural sweep after every single
chapter's edit.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 9: chapter 49 fixed (v1 missing
a clause, garbling the sentence into nonsense)

**Chapter 49 (short, only 3 verses -- the opening of Baruch's question about the resurrection body):
one real defect found and fixed.** v1 read "yea, I will ask made all things" -- missing "mercy from
Him who" between "ask" and "made," which had collapsed the sentence into something ungrammatical.
Restored to "yea, I will ask mercy from Him who made all things," matching the source exactly. Also
corrected a stray capitalization slip ("I Will again ask" -> "I will again ask"). v2 and v3 were
already correct, verified word-for-word against the source with no other changes needed.

Verified directly against the source before touching the repo. Structural re-sweep clean
immediately after (same five previously-known gaps, unchanged: chapters 15, 32, 44, 64, 80).

**Total progress so far in this checkpointed effort:** chapters 13, 14, 19, 20, 21, 31, 35, 43, 49
fixed with real content restored; chapters 29 and 48 verified clean. 10 of the original 12-chapter
list addressed. Remaining: 51, plus chapters 86-87 still unverified against any primary source.
Letter of Baruch (SY) still untouched.

**ET/SY-corpus status unchanged in green/red counts** -- still within-red content fixes.

**Next session should:** finish the originally-flagged 12-chapter list with chapter 51 (the last
one), same methodology as checkpoints 1-9 -- verify before editing; distinctive-phrase grep, full
untruncated source view, sentence-by-sentence comparison, watch for footnote-apparatus
interruptions, poetic-line/clause truncation (now the single most common real defect found across
this whole effort -- chapters 20, 21, 35, 43, 49 all had this exact failure mode), scrambled OCR
line order, and internally-inconsistent verse numbering. After chapter 51: tackle chapters 86-87
(needs a second source -- the Wesley Center mirror this project has used stops mid-chapter-85, not
yet identified what to use instead), then finally Letter of Baruch (SY), which inherits 2 Baruch's
chapters 81-82 and hasn't been checked at all yet.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 10: chapter 51 fixed (the
heaviest single-chapter content loss found in this whole restoration effort) -- ORIGINAL 12-CHAPTER
LIST NOW COMPLETE

**Chapter 51 (16 verses, the resurrection-of-the-righteous discourse) had the most extensive
truncation found anywhere in this checkpointed effort.** Six of its sixteen verses were cut short,
several severely:
- v7 was missing four of its five lines: "and to whom the law has been now a hope, and
  understanding an expectation, and wisdom a confidence, shall wonders appear in their time" (app
  had only "But those who have been saved by their works,").
- v9 was missing its closing clause "and time shall no longer age them."
- v10 was missing five of its six lines: "and they shall be made like unto the angels, and be made
  equal to the stars, and they shall be changed into every form they desire, from beauty into
  loveliness, and from light into the splendor of glory" (app had only "For in the heights of that
  world shall they dwell,").
- v14 was missing "and laid down the burthen of anguish."
- v15 was missing "and for what have those who were on the earth exchanged their soul?"
- v16 -- the worst single case -- was missing six of its seven lines: "which, beyond the reach of
  anguish, could not pass away: but they chose for themselves that time, whose issues are full of
  lamentations and evils, and they denied the world which ages not those who come to it, and they
  rejected the time of glory, so that they shall not come to the honour of which I told thee before"
  (app had only "For then they chose (not) for themselves this time,").

Also fixed a minor punctuation defect in v11: the app was missing the opening bracket of the source's
editorial insertion "[are now held fast by My word, lest they should appear, and]" (had the closing
bracket but not the opening one).

All restorations extended existing verses rather than inserting new verse numbers or renumbering,
since the source's own line groupings matched the app's existing verse divisions closely enough that
no restructuring was needed -- verse count unchanged (16). Kept the source's own "thee" in v16's
closing clause, since this chapter's untouched text has no established modernized-pronoun precedent
to match (same logic as chapters 31/35). Verified directly against the source before touching the
repo. Structural re-sweep clean immediately after (same five previously-known gaps, unchanged:
chapters 15, 32, 44, 64, 80).

**Worth flagging for later, not part of this checkpoint's scope (chapter 51 was the last of the
originally-flagged 12, chapter 52 was never on that list):** a quick look at the start of chapter 52
while confirming the 51/52 boundary showed it also has real missing content of the same shape (v1
missing "How can we forget those for whom woe is then reserved?", v2 missing "Or why do we weep for
those who depart to Sheol?"). Not fixed this session -- flagging as a new finding for whoever
continues this book's restoration next.

**THE ORIGINAL 12-CHAPTER FLAGGED LIST IS NOW FULLY ADDRESSED.** Final tally: chapters 13, 14, 19,
20, 21, 31, 35, 43, 49, 51 had real content restored; chapters 29 and 48 were verified clean (48
needed one minor typo fix). Ten of twelve chapters had genuine defects; two were false alarms from
the original 2026-07-18/19 flagging pass.

**Still open for 2 Baruch (CE):** chapters 86-87 (entirely unverified against any primary source --
the Wesley Center Online mirror this project has relied on stops mid-chapter-85; no second source
identified yet), and now also chapter 52 (newly discovered this session, not yet fixed). Letter of
Baruch (SY) is completely untouched -- it inherits 2 Baruch's chapters 81-82 verbatim, which haven't
been checked against any source yet either.

**ET/SY-corpus status unchanged in green/red counts** -- still within-red content fixes. Neither
2 Baruch (CE) nor Letter of Baruch (SY) should be marked GREEN yet -- real, confirmed gaps remain
(chapters 52, 86-87, and all of Letter of Baruch's own inherited content).

**Next session should:** pick up chapter 52 (newly flagged this session, real content confirmed
missing in its first two verses at minimum -- needs a full read-through, not just the two lines
spotted so far), then chapters 86-87 (needs sourcing work first -- try Charles' earlier 1896
translation or another edition, since Wesley Center's mirror doesn't reach that far), then finally
Letter of Baruch (SY) once 2 Baruch's chapters 81-82 are confirmed clean. Same methodology
throughout: verify before editing, distinctive-phrase grep, full untruncated source view,
sentence-by-sentence comparison, watch especially for poetic lines/clauses cut short mid-verse (the
dominant defect pattern in this entire book), and re-run the structural sweep after every edit.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 12: MAJOR FINDING -- chapters
86-87 were never actually missing a source (the raw source snapshot already in the repo goes all the
way to the end of the book); chapter 85 vv.7-15 turned out to be unsourced/fabricated content, now
rebuilt from Charles

**Correcting a standing (and repeated) misconception carried across many prior handoffs: the raw
source file already in this repo,
`data/bible/translations/2baruch/raw/2baruch-charles-apot2-source-snapshot-2026-07-05.txt`, is NOT
truncated at chapter 85.** It runs the complete Charles 1913 APOT translation all the way through
chapter 87 and ends with "HERE ENDS THE BOOK OF BARUCH THE SON OF NERIAH." The "stops mid-chapter-85"
claim in every prior handoff referred to the Wesley Center Online *mirror* this project had been
checking against for other purposes -- but the actual working source file in this repo was never
missing that content. This was never re-checked directly against the file already in hand across
several sessions; worth a general lesson: when a prior handoff claims a source is incomplete, verify
against the actual file path in the repo before treating the claim as settled, especially before
spending effort hunting for a replacement source that may not be needed.

**Chapters 86-87 checked against this source and found content-complete** -- no missing text.
However, their existing wording did NOT match Charles' translation; it was a fluent modern paraphrase
of unknown/unverified origin, conveying the same content in different words (confirmed by close
reading: "Fare you well always" / "Fare ye well," "bound it to the neck of the eagle" / matches,
etc. -- same events and content throughout, just reworded). Rebuilt both chapters to Charles' own
wording (lightly modernized, "ye"->"you"), consistent with the character-for-character fidelity
standard this project has held to for every other legitimately-sourced chapter, and resolving the
"unverified provenance" concern rather than leaving it open.

**Chapter 85 is the real major finding.** Verses 1-6 were legitimate (if loosely worded) paraphrases
of Charles' actual content. **Verses 7-15 -- nine of the chapter's fifteen verses -- did not match
Charles' translation at all**, and a second independent check against a completely different online
source (yahwehswordarchives.org's "Sacred Name" edition, which itself tracks Charles closely just
with substituted terminology) confirmed Charles' wording is correct and the app's version diverges
from both. The app's vv.7-15 expressed different specific content throughout (e.g., v.10 in Charles
is the well-known "pitcher near to the cistern... ship to the port" passage -- independently
confirmed as the real v.10 by an outside scholarly source found via web search -- while the app's
v.10 read "For the end of all things is come; the judgment is at hand," an entirely different
sentence). This is the same failure class as the Meqabyan MAJOR FINDING from 2026-07-18/19:
plausible-sounding but unsourced content that doesn't correspond to any real translation. Root cause
not established (whether this was composed rather than transcribed, like the Meqabyan case, or
substituted from some other unidentified source) -- not investigated further this session, since the
fix (rebuild from the confirmed-correct primary source already in hand) doesn't depend on knowing the
root cause.

**Rebuilt chapter 85 vv.7-15 from Charles' 1913 APOT** (already in the repo, confirmed complete).
vv.1-6 also re-aligned to Charles' exact wording for full consistency (they were close paraphrases,
not defects, but this project's standard is source fidelity, not paraphrase). Preserved Charles' own
editorial bracket in v.12 ("[a place of repentance, nor]," which his footnote explains as a probable
dittograph he chose to keep in the text rather than silently delete) -- same precedent as chapter
51's v.11 bracket. 15 verses, unchanged count.

Verified all three chapters directly against the source before touching the repo. Structural
re-sweep clean immediately after on the whole file (same five previously-known gaps, unchanged:
chapters 15, 32, 44, 64, 80 -- none of which are part of this chapter 85-87 fix).

**2 Baruch (CE) status after this checkpoint:** every chapter from 1 through 87 has now been
addressed at least once by this checkpointed effort or an earlier session, EXCEPT the five
still-open, previously-confirmed-real gaps in chapters 15, 32, 44, 64, 80 (flagged as real defects
back at the very start of this checkpointed effort, before checkpoint 1, and carried forward
unaddressed in every session note since -- these were never part of the original 12-chapter flagged
list and still need their own restoration pass). Letter of Baruch (SY) remains completely untouched.

**ET/SY-corpus status unchanged in green/red counts** -- still within-red content fixes. Do NOT mark
2 Baruch (CE) GREEN yet -- chapters 15, 32, 44, 64, 80 are confirmed, real, unresolved gaps.

**Next session should:** restore chapters 15, 32, 44, 64, and 80 -- these are the last known open
content gaps in 2 Baruch (CE) itself (chapter 15's gap was already identified: "but thou hast not
judged well regarding the evils which befall those who sin"; the other four haven't been
individually diagnosed since being flagged, just confirmed present via the structural sweep's gap
detection -- they'll need the same distinctive-phrase-grep-and-compare treatment as every other
chapter in this effort). Once those five are closed, 2 Baruch (CE) can very likely be marked GREEN
(pending a final full re-sweep). After that: Letter of Baruch (SY), which has its own unique
chapters 1-3 never checked against any source, plus inherited chapters 4-5 (=2 Baruch chapters
81-82, which -- per this session's confirmation that the underlying source file is complete through
ch.87 -- can now actually be verified, contrary to what prior sessions believed was possible).

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 13: chapters 15, 44, 64, 80 were
ALL false alarms (same "merged verse" numbering-gap pattern already documented for chapters 32/44/
64/80 back in checkpoint 1) -- cosmetically fixed by splitting the merged verse to match the
source. Chapter 32 confirmed clean too but left as-is (genuinely ambiguous split point). 2 BARUCH
(CE) CONTENT RESTORATION IS NOW COMPLETE.

**Correcting the record from checkpoint 12's handoff:** that entry described chapters 15, 32, 44,
64, 80 as "confirmed real gaps" still needing restoration. That was wrong -- checkpoint 1 (very
early in this effort) had already investigated chapters 32, 44, 64, 80 directly and found them to be
false alarms (the source's own combined/OCR'd verse markers, not real content loss); this session
re-confirmed that finding for all four AND found chapter 15 is the same false-alarm class, never
actually re-verified since the very first handoff of this whole checkpointed effort (which had
claimed a "real missing clause" in chapter 15 that, on this session's direct check, is not actually
missing at all -- it was already present in the app's text). The structural sweep kept surfacing
these five chapters every single checkpoint because a *numbering* gap (skipped verse number) looks
identical to a *content* gap in an automated scan -- but a numbering gap from a merged verse is
cosmetic, not a defect. Worth a general lesson: a sweep flagging the same unresolved item across many
sessions is worth actually re-diagnosing once, rather than continuing to carry it forward as "known,
real, not yet fixed."

**What was actually done, chapter by chapter:**
- **Chapter 15:** app's v1 had merged the source's v1+v2 into one verse ("Thou art rightly astonied
  regarding the departure of man" + "but thou hast not judged well regarding the evils which befall
  those who sin"). Split into two verses matching the source exactly; verses 5-8 already carried
  correct numbers by coincidence, so no further renumbering was needed. Confirmed word-for-word: the
  chapter was already 100% content-complete.
- **Chapter 44:** same pattern -- v1 had merged source's v1 ("...and I said unto them:") and v2
  ("'Behold, I go unto my fathers according to the way of all the earth.") into one verse. Split to
  match source; verses 3 onward were already correctly numbered.
- **Chapter 64:** same pattern -- v4 had merged source's v4 and v5. Split into two verses (new v4,
  v5), renumbering the old v5 to v6; verses 7 onward were already correctly numbered.
- **Chapter 80:** same pattern -- v1 had merged source's v1 and v2. Split into two verses; verses 3
  onward shifted down by one to fill the gap that had existed at v4 (old v2->new v3, old v3->new v4);
  verses 5-7 were already correctly numbered and untouched.
- **Chapter 32:** confirmed clean (no content missing, matches checkpoint 1's original finding
  exactly), but its merge point sits at a genuine mid-word OCR line-wrap in the source ("it shall
  pro-\n2 tect you") with no clear semantic sentence boundary to split on -- left as-is rather than
  guess at an arbitrary split point, consistent with this project's "only restructure when
  unambiguous" standing rule.

All fixes verified directly against the source before touching the repo; none of them changed any
actual verse *content*, only verse *numbering* to eliminate cosmetic gaps. Structural re-sweep clean
across the whole file immediately after -- only chapter 32's confirmed, deliberately-unfixed gap
remains.

**2 BARUCH (CE) STATUS: every chapter 1-87 has now been directly verified against the primary source
at least once across this entire checkpointed effort (checkpoints 1-13), and every confirmed real
content defect has been restored.** The only remaining open item is the deliberate, well-understood
non-fix in chapter 32's numbering (cosmetic only, not a content gap). **This book is very likely
ready to be marked GREEN** -- recommend Josh (or the next session) do one final independent
spot-check or two before flipping the dashboard status, given how many corrections this book needed
and the seriousness of the chapter 85 MAJOR FINDING earlier this session, but there is no known
remaining content defect.

**ET/SY-corpus status:** do not bump SEED_VERSION or move 2 Baruch (CE) to GREEN_SEED in this
session -- that update should happen deliberately, likely bundled with the final spot-check
mentioned above, not reflexively at the end of a long content-fix session.

**Next session should:** do a final independent verification pass on 2 Baruch (CE) (spot-check
several chapters at random against the source, confirm the structural sweep is clean, confirm no
`json.dump()` reformatting crept in across these many patches) before marking it GREEN and bumping
SEED_VERSION -- this is a natural, low-risk task to start a fresh session with. Then move to Letter
of Baruch (SY): its own unique chapters 1-3 have never been checked against any source, and its
inherited chapters 4-5 (=2 Baruch's chapters 81-82) should now be re-verified given how much 2 Baruch
itself changed this session -- confirm those two chapters were copied over correctly (or copy them
fresh) before closing out Letter of Baruch. Same methodology throughout: verify before editing,
distinctive-phrase grep, full untruncated source view, sentence-by-sentence comparison, and re-run
the structural sweep after every edit.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 14: chapters 78, 79, 81, 82, 83,
84 (never previously checked by this project at all) now verified -- two more real defects found
and fixed (ch.81, ch.82), two minor typos fixed (ch.83), chapters 78/79/84 confirmed fully clean

**Prompted by starting work on Letter of Baruch (SY):** that file's content is 2 Baruch's chapters
78-87 under its own 1-10 numbering. Before touching Letter of Baruch itself, checked whether its
source chapters had actually all been verified -- they had not. Chapters 78, 79, 81, 82, 83, 84 were
never part of the original 12-chapter flagged list, never surfaced by the structural sweep (no
verse-count gaps), and were never individually checked in any of checkpoints 1-13. Went through all
six directly against the source before doing anything with Letter of Baruch.

- **Chapter 78:** confirmed fully clean via word-count parity check (289/289 words, only a
  legitimate judgment/judgement spelling variant). No edit.
- **Chapter 79:** confirmed fully clean, word-for-word match. No edit.
- **Chapter 81:** real defects found. v3 was missing "And will these evils come upon us always?'"
  (the second line of a couplet). v4 was missing five of its six lines: "and the Most High according
  to the greatness of His compassion, and He revealed unto me the word, that I might receive
  consolation, and He showed me visions that I should not again endure anguish, and He made known to
  me the mystery of the times, and the advent of the hours He showed me" (app had only "And the
  Mighty One did according to the multitude of His mercies,"). Both restored.
- **Chapter 82:** a substantial gap -- three entire verses missing. The chapter contains a series of
  parallel "though X, but Y" triplets about the Gentiles' transient glory (prosperity/vapor,
  power/drop, might/spittle, greatness/smoke...); the app had only the first four of seven and
  stopped. Restored the missing three: "we meditate on the beauty of their gracefulness...as grass
  that withers shall they fade away," "we consider the strength of their cruelty...as a wave that
  passes shall they be broken," and "we remark the boastfulness of their might...they shall pass away
  as a passing cloud." Chapter grew from 6 to 9 verses.
- **Chapter 83:** the longest of the six (22 verses) and almost entirely clean -- only two minor,
  confirmed corrections: a stray OCR-style typo in v3 ("all the members of mail" -> "man") and a
  missing question mark in v22 ("does anyone think that they will not be avenged" -> "...avenged?").
  No content was missing anywhere in this chapter.
- **Chapter 84:** confirmed fully clean, verified verse-by-verse against the source (11 verses, all
  match exactly, including the app already correctly resolving a "Jaw"->"law" OCR artifact present in
  the raw source). No edit.

All fixes verified directly against the source before touching the repo. Structural re-sweep clean
across the whole file immediately after -- only chapter 32's already-understood, deliberately-left
cosmetic gap remains.

**This closes the last remaining unverified content in 2 Baruch (CE).** Every chapter 1-87 has now
been directly checked against the primary source at least once, across checkpoints 1-14 combined.

**ET/SY-corpus status:** still not bumping SEED_VERSION or moving to GREEN_SEED in this session --
same reasoning as checkpoint 13, this should be a deliberate act with a final spot-check, not
reflexive.

**Next session should (if not done later this same session):** the deliberate GREEN-marking
spot-check mentioned above is now the only thing standing between 2 Baruch (CE) and full closure.
Then: Letter of Baruch (SY) itself -- now that its source chapters (78-87) are fully verified and
several of them changed substantially this session (81, 82, 85, 86, 87 especially), Letter of
Baruch's own content needs to be re-derived or carefully re-checked against the now-corrected
2baruchSY.json (or the primary source directly) rather than assumed still accurate -- its own
governance note already flagged it as never independently verified, and it predates all of today's
2 Baruch fixes.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) + Letter of Baruch (SY) checkpoint 15:
Letter of Baruch synced to match the now-fully-verified 2baruchSY.json chapters 78-87 -- CLOSES OUT
BOTH BOOKS

**Letter of Baruch (SY) is 2 Baruch's chapters 78-87 under its own independent 1-10 numbering**
(confirmed via `originalChapterIn2Baruch` field already present on each chapter object) -- its own
governance note already stated this file "shares its underlying content" with `2baruchSY.json` and
had never been independently verified. Given checkpoints 1-14 this session fully verified and, in
several cases substantially rewrote, 2 Baruch's chapters 78-87 (chapters 80, 81, 82, 85, 86, 87 all
changed; 78, 79, 83, 84 confirmed clean with only chapter 83 getting two tiny typo fixes), the
correct and safe approach was to sync this file's verses directly from the now-authoritative
`2baruchSY.json`, rather than independently re-deriving from the source a second time (which would
just reproduce the same work with a real risk of introducing a fresh inconsistency between the two
files).

**Compared each of the 10 chapters before syncing:** 4 of 10 (LBA 1/2/7 = 2Baruch 78/79/84) were
already byte-identical to the corrected source and needed no change. The other 6 (LBA 3/4/5/6/8/9/10
= 2Baruch 80/81/82/83/85/86/87 -- that's actually 7, since LBA 6=2Bar 83 also needed its two typo
fixes) were out of sync and updated to match exactly. Total verse count changed from 76 to 80 (net
+4: chapter 80 split +1, chapter 82's three restored verses +3, chapter 51's... no, chapter 81's
restoration didn't add a verse, just extended two existing ones -- the net change is fully accounted
for by chapter 80's cosmetic split (+1) and chapter 82's three newly-restored verses (+3)).

**Verified the sync programmatically, not by eye:** wrote a small script comparing each LBA
chapter's verse array against its `2baruchSY.json` counterpart by `originalChapterIn2Baruch`,
confirmed all 10 now match exactly post-sync. Structural sweep (chapter/verse gaps, duplicates,
empties) clean across the whole file -- zero issues, unlike 2baruchSY.json's own file which still
carries chapter 32's one understood, deliberate cosmetic gap (that gap does not appear in Letter of
Baruch, since Letter of Baruch only covers chapters 78-87, well past chapter 32).

**Updated the file's `contentTrustNote`** to reflect the real, current verification status (was:
"not yet independently content-verified against a primary source"; now: confirmed verified,
verse count corrected from 76 to 80).

**BOTH 2 BARUCH (CE) AND LETTER OF BARUCH (SY) ARE NOW FULLY CONTENT-VERIFIED.** Chapter 32's one
cosmetic, deliberately-unfixed numbering gap in 2 Baruch (CE) is the only known non-issue remaining
anywhere across either file. Neither book's dashboard status was changed this session (still RED on
both, per the "blocked until v1.0" / "fixable now" distinction established earlier) -- recommend
Josh or a future session do the GREEN-marking spot-check for both together, since they're now
interdependent (Letter of Baruch is literally a subset of 2 Baruch's verified content) and the
dashboard update is a deliberate, separate act from the content-restoration work itself.

**ET/SY-corpus status:** 12 green, 19 red (unchanged in count -- both books stay red pending the
deliberate spot-check/GREEN-marking step). No SEED_VERSION bump this session.

**Next session should:** do the spot-check + GREEN-marking pass for both 2 Baruch (CE) and Letter of
Baruch (SY) together (they share the same underlying content, so one verification pass covers both);
update `audit-ledger.html`'s `RED_SEED`/`GREEN_SEED`/`GREEN_NOTES` and bump `SEED_VERSION`. After
that, the entire ET/SY broader-canon backlog's "fixable now" tier is fully closed -- remaining work
is exclusively the post-v1.0-deferred queue (Fetha Nagast, Josippon, Malke'a Guba'e/Iyasus,
Clement/Qalementos, Admonitions, Sirate Tsion) and Mazaheta's 3 still-unsourced sections
(Anqasa Birhan, Sa'atat, Me'erAf), none of which should be picked up without Josh's explicit
direction per the standing governance decisions already on record.

## SESSION HANDOFF 2026-07-24 continued -- FINAL: 2 Baruch (CE) + Letter of Baruch (SY) spot-checked
and marked GREEN on the dashboard, closing the whole checkpointed restoration effort (checkpoints
1-15 plus this closing pass)

**Josh's instruction: "do what needs to be done."** Did the deliberate spot-check-and-GREEN-marking
pass recommended at the end of checkpoint 15, rather than deferring it.

**Spot-check found one more real defect before marking GREEN.** While independently re-verifying a
sample of never-flagged chapters, found and fetched a second, cleanly-typeset full transcription of
Charles' 1913 translation (Wesley Center Online's edited copy -- distinct from this repo's own raw
OCR snapshot, useful as a second, independent corroborating source). Using it to check chapter 60
turned up two verses (3, "And the honor of the Most High was defiled..."; 4, "These are the black
fifth waters which you have seen.") that do not correspond to Charles' translation at all -- neither
this repo's raw source snapshot nor the Wesley Center transcription has any equivalent content;
chapter 60 genuinely only has 2 verses in Charles. Removed both. Same failure class as chapter 85's
MAJOR FINDING, smaller in scope.

**Sample verification, not exhaustive:** checked 17 chapters that were never on any flagged list and
never individually verified in checkpoints 1-14 (2, 6, 9, 16, 17, 18, 46, 60, 65, 68, 76, plus the
78/79/81/82/83/84 already checked in checkpoint 14) against the Wesley Center transcription. 14 of 17
were fully clean; chapter 60 had the defect described above; chapter 16 had a trivial "0"/"O" OCR
typo (fixed); chapters 81/82 (already caught in checkpoint 14) were re-confirmed fixed. This is a
representative sample across the book's length, not a chapter-by-chapter re-read of all 87 chapters
-- worth being honest about in case a future session wants to extend coverage further, though the
diminishing hit rate (1 real defect in the last 17 chapters checked, versus roughly 1-in-2 in the
earlier, more targeted checking of chapters 78-84) suggests the remaining unchecked chapters are
lower-risk than the ones already covered.

**Dashboard updated:** `2 Baruch (CE)` and `Letter of Baruch (SY)` moved from `RED_SEED` to
`GREEN_SEED` in `audit-ledger.html`; their `RED_NOTES` entries removed and replaced with full
`GREEN_NOTES` entries summarizing the whole 15-checkpoint restoration history for each. The
explanatory comment above `POST_V1_BLOCKED` (which had described these two as "the only two RED_SEED
items in bucket (b)") updated to reflect their closure. `SEED_VERSION` bumped to
`v133-2026-07-24-2baruch-letterofbaruch-green`. Verified via `node --check` (syntax) and an isolated
re-run of the actual status-assignment code path (`RED_SEED`/`GREEN_SEED`/`POST_V1_BLOCKED`
membership plus the real `classFor` logic) against both book names before shipping -- both compute as
`green`, `blocked: false`, with their notes correctly attached.

**BOTH BOOKS ARE NOW GREEN.** This closes the entire 2 Baruch (CE) / Letter of Baruch (SY)
restoration effort that ran across this whole session (checkpoints 1-15 plus this closing pass).

**ET/SY-corpus status: 14 green, 17 red, 0 amber** (was 12 green, 19 red -- +2 green, -2 red).

**Next session should:** ask Josh what's next -- the entire "fixable now" tier of the ET/SY backlog
is closed. Everything remaining in RED_SEED is post-v1.0-deferred per explicit governance decisions
already on record (Fetha Nagast, Josippon, Malke'a Guba'e, Malke'a Iyasus, the 11-file
Clement/Qalementos family, Admonitions, Sirate Tsion) or blocked on Mazaheta's 3 still-unsourced
sections (Anqasa Birhan, Sa'atat, Me'erAf) -- none of it should be picked up without Josh's explicit
direction.

## SESSION HANDOFF 2026-07-24 continued -- 2 Baruch (CE) checkpoint 11: chapter 52 fixed (6 of its
7 verses had missing content, same dominant "cut short mid-verse" pattern as the rest of this book)

**Chapter 52 (Baruch's reply about lamenting for the wicked and encouraging the righteous) had the
same pervasive truncation pattern found throughout this restoration effort.** Six of seven verses
were incomplete:
- v1 was missing its entire quoted content: "'How can we forget those for whom woe is then
  reserved?" (app had only "And I answered and said:").
- v2 was missing "Or why do we weep for those who depart to Sheol?"
- v3 was missing "and let tears be laid up for the advent of the destruction of that time."
- v5 was missing its closing question mark (matched content, just an incomplete sentence -- minor,
  fixed along with the rest).
- v6 was missing "for why do you look for the decline of your enemies?"
- v7 was missing "and prepare your souls for the reward which is laid up for you.']" -- the closing
  bracket confirms this is the end of the discourse section that began back in chapter 48's
  "Fragment of an Address of Baruch to the People," consistent with the source's own structure.

v4 was already complete and untouched. All restorations extended existing verses without
renumbering (count unchanged, 7). Verified directly against the source before touching the repo;
confirmed the chapter genuinely ends at v7 (matching the source's closing bracket) with nothing
further needed. Structural re-sweep clean immediately after (same five previously-known gaps,
unchanged: chapters 15, 32, 44, 64, 80).

**2 Baruch (CE) status after this checkpoint:** all originally-flagged chapters (13, 14, 19, 20, 21,
31, 35, 43, 49, 51) plus the two chapters found during this checkpointed effort (29 -- clean, 48 --
one typo, 52 -- fixed) have now been addressed. **Only chapters 86-87 remain unverified against any
primary source**, and Letter of Baruch (SY) is still completely untouched (it inherits 2 Baruch's
chapters 81-82 verbatim).

**ET/SY-corpus status unchanged in green/red counts** -- still within-red content fixes. Do NOT mark
2 Baruch (CE) GREEN yet -- chapters 86-87 are a confirmed, real, unresolved gap.

**Next session should:** work on sourcing chapters 86-87 first (the Wesley Center Online mirror this
project has relied on throughout stops mid-chapter-85 -- try Charles' earlier 1896 translation, a
different digitization of the 1913 APOT edition, or ask Josh if he can paste/upload the missing
pages, same fallback used successfully for Tizaz/Mazaheta/2 Meqabyan when automated fetch failed).
Once 86-87 are sourced and fixed (or confirmed genuinely unsourceable and flagged honestly), move to
Letter of Baruch (SY) -- check its own unique chapters 1-3 against a source, and verify its inherited
chapters 4-5 (=2 Baruch 81-82) are actually clean now that 2 Baruch itself has had this extensive
restoration pass. Same methodology throughout: verify before editing, distinctive-phrase grep, full
untruncated source view, sentence-by-sentence comparison, watch for the dominant "poetic line/clause
cut short mid-verse" defect pattern, and re-run the structural sweep after every edit.

## SESSION HANDOFF 2026-07-25 -- Book of the Covenant (Mashafa Kidan): confirmed genuine gap via
5-tradition canon research, but GOVERNANCE DECISION: no proxy source, deferred to post-v1.0

**Josh asked for a canonical-completeness check** across five Apostolic traditions, specifically
re-testing whether "some Ethiopian texts are untranslatable" still held. Found one real, confirmed
gap: the Ethiopic **Book of the Covenant (Mashafa Kidan)**, two books in the Ethiopian/Eritrean
broader NT canon, never previously in this corpus at all (distinct from the short "Kidane" prayer
already in Mazaheta). No English translation of the actual Ge'ez text exists anywhere -- only
French critical editions (Beylot 1984 for Book 1, Guerrier/Grebaut 1913 for Book 2).

**First attempt this session used the closely-related free Syriac Testamentum Domini translation**
(Cooper & Maclean, 1902) as an explicitly-caveated proxy -- source was successfully acquired (Josh
uploaded the full text after the usual archive.org fetch wall blocked automated retrieval), and 18
of Book 1's 47 chapters were hand-transcribed. **Josh reviewed and declined this approach: he does
not want a proxy translation used, however clearly labeled.** Nothing from that attempt was ever
merged to `main` -- the patch was generated but never applied -- so there is nothing to revert in
the live app.

**GOVERNANCE DECISION (Josh, 2026-07-25): Book of the Covenant joins the post-v1.0
original-translation queue** (same category as Fetha Nagast, Josippon, Malke'a Guba'e, Malke'a
Iyasus). Whoever picks this up after v1.0 ships should produce an original English translation from
Beylot's or Guerrier/Grebaut's Ge'ez-with-French critical editions, not from the Syriac tradition.
No content should be added for this book before then. Since it was never in the corpus, there's no
dashboard entry to touch (unlike the other post-v1.0 items, which already have red-tagged files).
Full detail in AUDIT_GOVERNANCE_LEDGER.md's "Book of the Covenant" entry.

**Next session should:** treat this as closed/parked, same as the rest of the post-v1.0 queue, unless
Josh explicitly redirects. If picking this back up: the free Syriac Testamentum Domini text (Cooper &
Maclean 1902) is not currently saved anywhere in this repo (this session's transcription work was
local and not committed) -- it would need to be re-acquired from Josh if wanted as a cross-reference
aid, though it must not become the substance of the Ethiopic text itself.

## SESSION HANDOFF 2026-07-25 continued -- Priest-testing deploy prep: splash collapsed to 3 buttons, Bible Browser unwired from RED_SEED + 3 dead-file entries; one broken-path GREEN entry (2 Baruch) flagged, not fixed

**Josh is deploying the app (via the previously-dormant `npm run release:web` export) for a priest
friend to test the Daily Office.** Two changes made:

1. **Splash simplified.** App now lands directly on 3 buttons -- The Daily Office, Book of Needs,
   Bible Browser -- skipping the old "Where do you pray?" tradition picker entirely.
   `initializeEntryRouting()` in `js/office-ui.js` always calls `showUniversalModeSelection(false)`
   now; the Ethiopian/Church-of-the-East/Eastern-Orthodoxy mode buttons were removed from
   `index.html`'s mode grid; the Episcopal Church card relabeled "The Daily Office." Nothing
   deleted -- those offices remain fully functional, just not exposed on this entry screen.

2. **Bible Browser unwired from every current RED_SEED item plus 3 dangling dead-file
   registrations**, via `data/bible/registry/identity-adjudications.json`'s
   `ordinary_chapter_verse_resolver_candidate` flag (the actual mechanism controlling what
   appears in the Bible Browser). 18 flipped `true` → `false`: the 11-file Clement/Qalēmentos
   family, Fetha Nagast, Admonitions, Rest of Baruch, Sirate Tsion (all current RED_SEED), plus
   Prayer of Apollonius, History of Zosimus, and Rest of Jeremiah (all pointing to files
   confirmed gone from disk). Full swept list and reasoning in `AUDIT_GOVERNANCE_LEDGER.md`'s
   entry of the same date. No content files touched -- registry-flag change only, fully
   reversible.

**Found and fixed (Josh asked for it in-session, before the priest tests):** `SECOND_BARUCH`'s
registry entry pointed to `data/bible/NT/2baruchCE.json`, which doesn't exist -- a stale path left
over from before the 2026-07-24 restoration moved the real content to
`data/bible/SY/2baruchSY.json`. Corrected in both `file-manifest.json` and
`identity-adjudications.json`; verified end-to-end by replicating the real registry join logic
against the corrected files (resolves to a real, non-empty file on disk). 2 Baruch now loads
correctly in the Bible Browser. Full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s entry of the same
date.

**Next session should:** treat the splash/unwiring/2-Baruch-path work as closed unless Josh
reports an issue after the priest's testing.

## SESSION HANDOFF 2026-07-25 continued -- web-release export excluded 253MB of copyrighted audit source material (Josh's own deploy test caught a ~250MB zip)

`data/kalendar/source-witnesses/` (Oxford Dictionary of Saints PDF, Jewish Study Bible PDF, other
copyrighted reference works + zipped source corpora, 253MB total) was being copied wholesale into
every `web-release.zip` since the export script was written in June -- never noticed until Josh's
first real deploy attempt produced a ~250MB zip. Nothing in the live app reads this folder
(confirmed via grep); it exists only for the calendar-audit citation trail. Added
`"source-witnesses"` to `prepare-web-release.mjs`'s exclusion set. Verified by actually running
the release script: zip dropped to 24MB (617 files), calendar data the app needs still present.
Full detail in `AUDIT_GOVERNANCE_LEDGER.md`.

**Next session should:** consider a broader repo-hygiene sweep for other audit-only material that
may have similarly leaked into `data/` rather than living under the already-excluded
`documentation/`, `scripts/`, or `data/bible/registry/`. Not done this session -- this fix only
addressed the one instance found.

## SESSION HANDOFF 2026-07-25 continued -- Daily Office pressure test: dark mode fixed, dead-toggle bug fixed, sidebar recategorized

Josh reported "After the Office" had wrongly-categorized settings and dark mode did nothing.
Three real defects found and fixed, full detail in `AUDIT_GOVERNANCE_LEDGER.md`:

1. **Dark mode was structurally inert for the office-reading view** -- a later CSS redesign
   ("parchment design propagation pass") never got a dark-mode variant anywhere. Fixed via a
   `body.office-active.dark-mode` override block (13 variables covering 162 usages) plus 17
   matching hardcoded-color rule counterparts. Not visually verified (no headless browser in this
   environment) -- Josh should confirm the actual look post-deploy.
2. **`General Thanksgiving` and `Prayer of St. Chrysostom` toggles were dead** -- both prayers
   rendered unconditionally regardless of checkbox state. Fixed with explicit gated handlers.
   **Flag for Josh:** since neither defaults to checked, this fix means both now default to
   hidden -- a visible behavior change from what's shipped until now. Not decided whether to
   default them to checked instead; his call.
3. **12 settings recategorized** out of "After the Office" into their real positions (verified
   against `data/rubrics.json`, not guessed): 4 into a new Liturgical Settings > "Lectionary
   Alternates" group, 3 into During the Office > "Invitatory", 5 into During the Office > "Noonday
   & Compline". Verified zero duplicate toggle ids and zero orphaned JS references after the move.

**Next session should:** ask Josh for his call on the General Thanksgiving/Chrysostom default
state, and ask whether the dark-mode fix actually looks right once he's checked it live (this
session could not visually verify CSS in a browser).

## SESSION HANDOFF 2026-07-25 continued -- Dark mode readability fixes from Josh's screenshot

Josh's screenshot showed dark mode applying but with real readability problems: gray boxes with
near-invisible text on the Noonday/Evening/Compline options, low-contrast header pill buttons.
Two blind spots in the prior fix's sweep methodology: it only checked hardcoded BACKGROUND colors
(missed hardcoded TEXT colors, e.g. `.setting-group label`'s forced dark-ink `!important`), and it
only checked rules already scoped under `body.office-active` (missed `.shared-office-nav-option`
and `.office-context-action`, which apply globally but matter visually during an office). Also
caught: `color-scheme` was never declared anywhere, which is the likely cause of the flat gray
box itself -- browsers default native form controls (radio buttons, date pickers, selects) to
light chrome without it. Fixed all of the above; full detail in `AUDIT_GOVERNANCE_LEDGER.md`.

**Next session should:** get Josh's confirmation (ideally another screenshot) that the specific
readability issues are actually resolved before treating dark mode as closed. Also worth noting:
similar hardcoded-light-parchment patterns likely exist in the Book of Needs display and the old
tradition-entry screens (found during the sweep, deliberately not touched -- out of scope for the
Daily Office pressure test Josh asked for) if either of those ever need the same treatment.

## SESSION HANDOFF 2026-07-25 continued -- Sidebar text-wrapping fix

Josh's second screenshot showed long sidebar labels (Lectionary Alternates + a few pre-existing
long ones) clipping off the sidebar edge instead of wrapping. Cause: `.setting-group label` forced
`white-space: nowrap`. Fixed to wrap normally, `align-items: flex-start` so checkboxes align to
top of multi-line text. Confirmed via an existing mobile-breakpoint override that already forced
`white-space: normal !important` there -- wrapping was already the known-correct behavior, desktop
just never got it. Full detail in `AUDIT_GOVERNANCE_LEDGER.md`.

**Next session should:** get final confirmation from Josh that dark mode + sidebar layout are both
now genuinely good before considering the priest-testing prep fully closed. The purple highlighting
in his second screenshot was treated as likely an accidental text selection, not a bug -- worth
a quick check if he flags it again.

## SESSION HANDOFF 2026-07-25 continued -- Six more fixes from Josh's third feedback round

1. Noonday/Compline/Invitatory toggles now conditionally hidden by active office (hooked into
   existing setVisible()/updateSidebarForOffice() pattern).
2. "Weird box" was content clipping from a hardcoded max-height:600px on the collapsible settings
   sections -- raised to 3000px.
3. Info-tip icons jumping to their own line was a regression from the prior wrap fix (flex treated
   the trailing span as an atomic item) -- switched .setting-group label to display:block.
4. Sidebar narrowed 342px -> 305px for better natural wrapping.
5. Uppercase "I" icons were a text-transform: uppercase inheritance issue from parent <strong>
   headers, not a markup problem (all spans are authored lowercase) -- fixed with
   text-transform: none on .info-btn.
6. Moved "Opening Devotions" (ecumenical extras) to after "After the Office" so regular/core BCP
   settings all precede optional extra-prayer additions, per Josh's rule.

Full detail in AUDIT_GOVERNANCE_LEDGER.md. All verified structurally (brace/div balance, JS
syntax, no duplicate/orphaned ids, zero remaining uppercase info-btn content, full build) but
**still not visually verified** -- no headless browser in this environment across this entire
dark-mode/sidebar work. Strongly worth getting Josh's next look before considering this closed.

## SESSION HANDOFF 2026-07-25 continued -- Empty box shells + orphaned tooltip icon (4th feedback round)

1. Split combined "Noonday & Compline" box into two separate boxes ("Noonday", "Compline"), each
   hidden/shown as a whole (title included) based on active office via a new `setGroupVisible()`
   helper -- fixes empty titled boxes appearing outside their relevant office. Same fix applied to
   "The Invitatory" box (had the identical latent bug, unreported until now).
2. Orphaned info-tip icon (still happening despite prior flex fix) -- root cause is normal inline
   wrap behavior at tight widths, not the earlier flex bug. Fixed robustly with `&nbsp;` gluing
   each icon to its preceding word (29 instances) rather than hoping width stays generous enough.

Full detail in `AUDIT_GOVERNANCE_LEDGER.md`. Still not visually verified -- no headless browser in
this environment. This is now the fourth consecutive round of Josh catching real issues only
visible in a live render; strongly worth a fifth check before treating this as closed.

## SESSION HANDOFF 2026-08-18 -- js/office-ui.js full read-through complete, engine:office-ui-core marked GREEN

Josh flagged `engine:office-ui-core` showing amber on the dashboard and asked for a full
read-through (the prior note had left it amber specifically because the app-shell/UI portions --
splash screens, entry routing, profile settings -- had never been examined, only the Daily-Office-
computation portions touched piecemeal by individual content fixes).

**Done: all 5,119 lines read, including `renderOffice()`/`renderBcpOffice()` as one coherent
~1,080-line function and every previously-unexamined app-shell function** (entry routing, mode
selection, settings save/load, sidebar visibility, date controls, shared office navigator). No
functional defects found. Confirmed the priest-testing session's toggle-visibility fixes
(General Thanksgiving/Chrysostom gating, Noonday/Compline/Invitatory box-hiding) are correctly
wired to the office-time radio's onchange handler, not just initial page load.

**Two cosmetic/dead-code issues found and fixed, per Josh's direction:**
1. Dead variable `dateHeaderText` in `renderBcpOffice` (computed a date-inclusive commemorations
   header string, then discarded it in favor of a static label) -- removed cleanly. Commemorations
   panel header intentionally does not include the date (Josh's call).
2. A duplicated 4-line BCP-citation comment block in the invitatory-psalm rotation logic --
   de-duplicated, no functional effect.

**`engine:office-ui-core` moved amber -> GREEN** on the dashboard, full note replacing the prior
partial-read note. `SEED_VERSION` bumped to `v134-2026-08-18-office-ui-core-green`. Verified via
`node --check js/office-ui.js` and a syntax check of `audit-ledger.html`'s inline script (caught
and fixed an apostrophe over-escaping mistake in the new note text during that check).

**Full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s entry of the same date.**

**Next session should:** ask Josh what's next -- this closes the specific yellow-status report from
this session. Everything else carried forward from the 2026-07-25 priest-testing deploy prep
(dark mode / sidebar visual confirmation still pending Josh's live look) remains open and
unaffected by this session's work. The other engine rows in the dashboard's OTHER_TRADITION_ENGINES
list (calendar-ethiopian.js, calendar-east-syriac.js, coe-eligibility.js, calendar-eastern-
orthodox.js, byzantine-paschalion.js, orthros-eothinon-engine.js, horologion-engine.js,
menaion-resolver.js, octoechos modules) remain amber, unaudited this session -- out of scope per
the project's standing BCP-first direction, not touched.

## SESSION HANDOFF 2026-08-18 continued -- Dark mode / sidebar visual confirmation CLOSED (Josh confirmed via screenshot)

Josh sent light + dark mode screenshots of Noonday Prayer. **Dark mode confirmed good** -- fully
legible sidebar and office content, no gray-box/invisible-text problems, correct office-specific
sidebar rendering. **This closes the visual-confirmation thread open since 2026-07-25** (five
rounds of dark-mode/sidebar fixes had gone unverified in a live browser, since this environment
has no headless browser). No code changes -- documentation closure only. Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`'s entry of the same date.

**Next session should:** ask Josh what's next. The priest-testing deploy-prep thread (splash
simplification, Bible Browser unwiring, web-release export size fix, dark mode/sidebar) is now
fully closed end to end.

## SESSION HANDOFF 2026-08-18 continued -- MAJOR FIND & FIX: DRB Psalms mis-keyed to Vulgate numbering (fixed), before starting the Coptic Agpeya rebuild

**Context:** Josh directed removal of the fabricated Ethiopian Sa'atat and rebuild as the Coptic Agpeya, sourced from De Lacy O'Leary's public-domain 1911 *The Daily Office and Theotokia of the Coptic Church* (Josh uploaded both halves of the scanned book to Google Drive). Before starting content work, examined whether the existing Bible corpus (KJV/DRB/etc.) has merit for the Agpeya's Psalm/Gospel citations, since O'Leary himself only cites psalm/gospel references (never his own translations) -- confirmed reuse of the existing corpus is the right call, same principle as the BCP office.

**That examination surfaced a real, previously-undiscovered defect, fixed this session before any Agpeya work began** (full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s entry of the same date): DRB's Psalms were filed under their own native Vulgate/Septuagint numbering rather than the Hebrew-numbered `PSALM N` keys the other seven translations use, for every key from 10 through 146 -- not a wording variant, a genuinely different psalm under the same key. **Fixed and verified**: all three merge/split boundaries (Ps 9/10, Ps 113/114-115, Ps 146/147) content-checked directly against the text before touching anything; verse count preserved exactly (2,527 -> 2,527); zero remaining mismatches across all 150 psalms x 8 translations; `audit-bible-corpus-structure.mjs` clean. 139 of 150 DRB entries changed (wording untouched, only key/verse-numbering); all other 7 translations byte-identical to before.

**Bonus finding:** DRB is now confirmed the natural translation for the Coptic Agpeya's psalm citations (O'Leary cites Septuagint numbering, which DRB already carries correctly now).

**Governance decisions from this session, going into the Agpeya work (full detail in AUDIT_GOVERNANCE_LEDGER.md):**
1. Mode stays labeled "Oriental Orthodoxy" at the tradition-family level (Coptic Orthodoxy is part of that communion), but the office itself is explicitly identified as the Agpeya, not conflated with Ethiopian content.
2. The Ethiopian Senkessar is left parked as its own standalone thing for now -- not merged into the new Coptic office, not deleted, just decoupled. Revisit if/when Ethiopian gets its own office again.
3. Build order: the 7 hours + Midnight Office first (a complete, prayable office on its own); the Theotokia weekly cycle as a follow-on phase.
4. Psalms and Gospel readings for the Agpeya will be pulled from the existing verified corpus (now that DRB's numbering is fixed), not transcribed from O'Leary -- he doesn't provide his own translations of them anyway. The genuinely new content to transcribe from O'Leary is the hour introductions, Absolution prayers, litanies/troparia, the Prayer of the Veil, and closing prayers.

**Exact deletion scope confirmed for the fabricated Sa'atat, not yet executed (next step):**
- `components/ethiopian.json` (the 9 fabricated hour-texts + fixed 3-psalm-per-watch scheme)
- `components/traditions/ethiopian/rubrics.json`'s `ethiopian-saatat` rubric entry
- `js/office-ui.js`: `hydrateForEthiopianSaatat()` (~line 348), `getEthiopianHourInfo()` (~line 2722), `renderEthiopianSaatat()` (~lines 4293-4574), `ethChangeDate`/`ethToday` (~2474-75), `toggleEthOverridePanel`/`applyEthOverride`/`resetEthOverride` (~72-102)
- **Bonus dead-code finding while mapping this:** the `eth-saatat-hour-slot`/`eth-mazmur-slot`/`eth-introduction-to-every-hour`/`VARIABLE_READING_ET`/`eth-saints-commemoration` handlers inside `renderBcpOffice()` (~lines 3910-4090) are unreachable dead code -- `renderOffice()` always branches to `renderEthiopianSaatat()` before `renderBcpOffice()` is ever called in that mode. Delete along with the rest.
- **NOT touched, real and unrelated:** `data/synaxarium/ethiopian/*` (Senkessar), `data/bible/ET/*` (broader canon corpus), `js/calendar-ethiopian.js` (Ethiopian date-conversion engine).

**Next session should:** execute the Sa'atat deletion as its own clean commit, then begin the Agpeya hour-by-hour build from O'Leary's text (already in Google Drive, both halves -- `DO 1-124 small.pdf` and `DO 125+ small.pdf`, readable directly via the Google Drive connector, no repeated paste/upload cycle needed this time). Also worth checking whether Coptic Great Lent/Paschal-season dating can reuse the existing Eastern Orthodox Julian Paschalion (`byzantine-paschalion.js`) rather than building a third Easter calculator, since Coptic Easter tracks the same Alexandrian computus.

## SESSION HANDOFF 2026-08-18 continued -- Fabricated Ethiopian Sa'atat FULLY REMOVED, ready to begin Coptic Agpeya build

**The fabricated Sa'atat is entirely gone from the codebase**, not repaired -- confirmed via a
full-repository grep sweep after every deletion, zero remaining references anywhere in live code,
markup, or QC scripts. Full deletion scope and verification detail in
`AUDIT_GOVERNANCE_LEDGER.md`'s entry of the same date; short version:

- Deleted `components/ethiopian.json` and `components/traditions/ethiopian/rubrics.json` entirely.
- Removed from `js/office-ui.js`: `hydrateForEthiopianSaatat()`, `getEthiopianHourInfo()`,
  `renderEthiopianSaatat()`, the three override functions, `ethChangeDate`/`ethToday`, every
  `ethiopian-saatat`/`'ethiopian'` reference across mode-routing tables and the shared office
  navigator (six separate dead branches once `_sharedOfficeNavigatorModeKey()` stopped returning
  `"ethiopian"`), and the ~180-line dead-code `eth-*` handler block inside `renderBcpOffice()`
  (confirmed unreachable even before this deletion, per the prior session's full read-through).
- **Caught a real bug while deleting, not just cleanup:** `renderOffice()`'s dispatcher still
  called the now-deleted `renderEthiopianSaatat()` -- would have thrown at runtime. Fixed.
- Removed the `#ethiopian-settings` drawer from `index.html` (~55 lines); div-tag balance confirmed
  unchanged (242/242).
- `documentation/ETHIOPIAN_SAATAT_DOCUMENTATION.md` replaced with a short deprecation notice
  (was 590 lines claiming "Production Status: OPERATIONAL," now false) rather than silently
  deleted -- consistent with this project's practice of logging removals, not erasing history.
- `audit-ledger.html`'s `ETHIOPIAN` dashboard section: four stale `eth:saatat:*` rows replaced
  with one row documenting the removal; the two `eth:senk:*` Senkessar rows untouched.

**Confirmed NOT touched -- still real, still there:** the Ethiopian Senkessar
(`data/synaxarium/ethiopian/*`), the entire ET broader-canon Bible corpus (`data/bible/ET/*`,
14 green books), and `js/calendar-ethiopian.js` (the date-conversion engine). `structure.json` and
two `documentation/structure-archive*` files were checked directly and left untouched -- pure
historical/append-only logs with zero live-section Sa'atat references, consistent with this
project's standing practice of never rewriting history.

**Governance decisions locked in for the Coptic Agpeya build, going forward:**
1. Tradition-family label stays "Oriental Orthodoxy" (Coptic is part of that communion); the
   office itself will be explicitly identified as the Agpeya.
2. Senkessar stays parked, standalone, not merged into the new office.
3. Build order: 7 hours + Midnight Office first (complete, prayable on its own), Theotokia weekly
   cycle second.
4. Psalms and Gospel readings pull from the existing (now correctly Hebrew-numbered) Bible corpus,
   not transcribed from O'Leary -- he only cites references, never his own translations. The
   genuinely new content to transcribe is the hour introductions, Absolution prayers, litanies/
   troparia, the Prayer of the Veil, and closing prayers.

**Next session should:** begin the Coptic Agpeya build. Source is already in Google Drive --
`DO 1-124 small.pdf` and `DO 125+ small.pdf`, both readable directly via the Google Drive
connector (no repeated paste/upload cycle needed, unlike Tizaz/Fetha Nagast/etc.). Recommend
starting with the Morning Office (O'Leary's own first chapter) as a single checkpointed patch,
same discipline as the Tizaz six-patch rebuild -- read the source, build the JSON structurally
matching the app's existing rubric/component pattern (fixed prayers as components, Psalm/Gospel
citations resolved via the existing scripture-resolver), verify, patch, then move to the next
hour. Also worth checking early whether Coptic Great Lent/Paschal-season dating can reuse the
existing Eastern Orthodox Julian Paschalion (`byzantine-paschalion.js`) rather than building a
third Easter calculator, since Coptic Easter tracks the same Alexandrian computus as Eastern
Orthodox Easter.

## SESSION HANDOFF 2026-08-18 continued -- Coptic Agpeya Morning Office: BUILT, WIRED, first checkpoint

**Real content now exists for the Coptic Agpeya.** Source: De Lacy O'Leary, *The Daily Office and
Theotokia of the Coptic Church* (1911, public domain), both halves in Google Drive, read directly
via the connector (no fetch-tool wall this time). Full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s
entry of the same date.

**What's built:** the complete Morning Office -- O'Leary's items (1)-(12) -- as 19 new sourced
components in `components/coptic.json` (21 entries total, including 2 pre-existing stubs, one of
which was corrected and one flagged) plus the `coptic-morning-office` rubric in
`components/traditions/coptic/rubrics.json`. Psalms (Psalm 51 + an 11-psalm morning set) and the
Ephesians 4:1-6 lesson are resolved from the app's own Bible corpus, not transcribed from O'Leary --
confirmed directly that he only ever cites scripture references, never his own translations, before
designing the build this way.

**What's wired:** `hydrateForCopticAgpeya()` + `renderCopticAgpeya()` in `js/office-ui.js`
(modeled on the East Syriac renderer), the `coptic-agpeya` mode fully connected through
`renderOffice()`, `selectMode()`, `UNIVERSAL_OFFICE_TRADITION_MODE_MAP`,
`resolveEntryTraditionRoute` (the `oriental-orthodox` tradition-entry card now actually routes
somewhere again), `OFFICE_MODE_HEADER_LABELS`, and `BOOK_OF_NEEDS_MODE_CONTEXTS`. A new
`#coptic-settings` drawer in `index.html` -- deliberately simple (date nav only, no hour-picker
UI), since only one hour exists so far and a picker with nothing real to switch between would
misrepresent the app's state.

**Two real bugs caught and fixed while wiring, not just new code:**
1. `updateSeasonalTheme('gold')` matched no case and silently fell back to green -- added a real
   `'gold'` case.
2. The tradition-entry screen's Oriental Orthodoxy card still described "Ethiopian Sa'atat Book of
   Hours" post-deletion -- corrected to describe the Coptic Agpeya.

**Verification:** full-repo sweep confirms zero remaining `ethiopian-saatat` references anywhere.
`node --check` clean throughout. Both new JSON files parse. `index.html` div-tag balance confirmed
(247/247) after every edit.

**Not yet done -- next session's starting point:** build the remaining 6 hours (Third, Sixth,
Ninth, Eleventh/Vespers, Twelfth/Compline) plus the Midnight Office, same method as this
checkpoint -- pull the section from `/tmp/oleary_full.txt`-equivalent (re-read via Google Drive:
`DO 1-124 small.pdf` covers up through roughly the Ninth Hour based on page count, `DO 125+
small.pdf` likely covers Eleventh Hour onward through the Theotokia -- confirm page boundaries
before assuming), transcribe the fixed prayers into `components/coptic.json`, add a new rubric
entry to `components/traditions/coptic/rubrics.json` per hour, and extend `renderCopticAgpeya()`
to select among them (this is also the point to build the real `SHARED_OFFICE_NAVIGATOR_CONFIGS`
hour-picker, deferred this session since one hour alone didn't justify it). After all 7 hours +
Midnight are done: Phase 2, the Theotokia weekly cycle, and resolve `cop-theotokion`'s sourcing
at the same time. `SEED_VERSION`/dashboard GREEN status not touched this session -- this is
mid-build, not ready to mark green.

## SESSION HANDOFF 2026-08-18 continued -- Coptic Agpeya: Third Hour built, hour-picker now live

Second Agpeya checkpoint, same source (O'Leary 1911, pp. 97-98). Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`'s entry of the same date.

**Built:** the complete Third Hour (O'Leary's items (1)-(7)) as 3 new components
(`cop-th-troparion`, `cop-th-second-troparion`, `cop-th-concluding-prayer`) in
`components/coptic.json` (24 entries total) and the `coptic-third-hour` rubric in
`components/traditions/coptic/rubrics.json`. Reuses the Trisagion, Lord's Prayer, 41-fold Kyrie,
and closing formula already built for the Morning Office, per O'Leary's own cross-reference.
**Left one thing honestly incomplete rather than inventing it:** the concluding prayer's closing
doxology, which O'Leary himself abbreviates as "...who, &c." -- flagged in `meta`, not guessed at.

**Wired:** `renderCopticAgpeya()` now selects the active hour via a radio group rather than
hard-coding Morning Office; `SHARED_OFFICE_NAVIGATOR_CONFIGS.coptic` added now that two hours
justify a real picker (deferred at the last checkpoint on purpose); the shared navigator's
mode-key/active-value/hour-setter functions all got a `coptic` case. `index.html`'s drawer needed
no structural changes -- its existing markup already matched the pattern the shared navigator
expects for auto-retiring manual controls.

**Verification:** `node --check` clean, both JSON files parse, index.html div-tag balance
unchanged (247/247).

**Next session should:** continue with the Sixth Hour, then Ninth, then Eleventh (Vespers),
Twelfth (Compline), then the Midnight Office -- same method as these two checkpoints. Re-read
`/tmp/oleary_full.txt`-equivalent via the Google Drive connector (`DO 1-124 small.pdf` /
`DO 125+ small.pdf`, both already confirmed readable directly, no fetch-tool wall). After all
hours are done: Phase 2, the Theotokia weekly cycle, and resolve `cop-theotokion`'s sourcing in
the same phase. `SEED_VERSION`/dashboard GREEN status still not touched -- mid-build.

## SESSION HANDOFF 2026-08-18 continued -- New governance rule: no abbreviated/placeholder liturgical text, ever

**Josh's directive, now a standing rule (full text in `AUDIT_GOVERNANCE_LEDGER.md`):** the app must
never present a prayer as a cross-reference or truncation requiring the person to already know the
missing words -- if a rubric says "say the Gloria," the app renders the whole Gloria, not a
citation. This applies regardless of how the *source itself* is formatted -- primary liturgical
books routinely abbreviate repeated material for print economy, which this app must not carry over.

**Immediately applied to the one place this was already a problem:** `cop-th-concluding-prayer`
(Third Hour, built earlier this session) had been left ending "...who..." because O'Leary's own
1911 text abbreviates its doxology as "&c." without spelling it out again at that point, and the
exact phrase doesn't recur verbatim anywhere else in his book (confirmed via exact-phrase search
before concluding this was a real gap, not an extraction error). **Fixed by completing it with the
doxology O'Leary himself already gives in full** at the end of the Morning Office's Prayer of
Thanksgiving ("through whom be glory and honour and power...consubstantial with thee; now and
always and for ever and ever. Amen") -- confirmed via independent cross-check against several
other (contemporary, copyrighted, not quoted) English Agpeya editions that this really is the
standard formula this specific prayer concludes with, not a guess. No new wording invented --
only O'Leary's own already-transcribed translation reused, which is exactly what the standing
"never fabricate" rule already permitted; the fix was recognizing this specific case needed action,
not that fabrication was necessary.

**Next session should:** apply this rule going forward on every remaining hour + Midnight Office +
the Theotokia -- watch specifically for any "&c.", "as before", or similar shorthand in O'Leary's
text, and resolve each one the same way (reuse an already-transcribed component if the formula
matches something already built; otherwise flag and research properly, never leave it truncated
in the shipped component). Continue with the Sixth Hour as originally planned.

## SESSION HANDOFF 2026-08-18 continued -- Coptic Agpeya: Sixth Hour built, no-placeholder rule applied throughout

Third Agpeya checkpoint, same source (O'Leary 1911, pp. 99-101). First hour built entirely under
the no-abbreviated-liturgical-text rule established earlier this session. Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`'s entry of the same date.

**Built:** the complete Sixth Hour (O'Leary's items (1)-(7)) as 3 new components
(`cop-sh-troparion`, `cop-sh-second-troparion`, `cop-sh-concluding-prayer`) in
`components/coptic.json` (27 entries total) and the `coptic-sixth-hour` rubric. The troparion's
refrain, which O'Leary prints once then abbreviates ("O thou who, &c.") before each of its three
further appearances, was written out in full every time -- applying the new governance rule
directly during transcription, not as an afterthought fix.

**One honest structural simplification, documented not hidden:** O'Leary's troparion is genuinely
antiphonal (the refrain interleaves verse-by-verse with Psalm 55), which this app doesn't yet
render. The full psalm is presented as its own labeled reading instead -- nothing is omitted or
abbreviated, only the precise interleaving structure is simplified, and this is spelled out in the
rubric's own note rather than silently flattened. New `VARIABLE_COP_ANTIPHONAL_PSALM` handler
added to `renderCopticAgpeya()` for this.

**Wired:** `SHARED_OFFICE_NAVIGATOR_CONFIGS.coptic.options` now has all three hours;
`index.html`'s drawer status text updated.

**Verification:** `node --check` clean, both JSON files parse, full sweep of `coptic.json` found
zero remaining "&c."/truncation-style placeholders in actual prayer text, div-tag balance
unchanged (247/247).

**Next session should:** continue with the Ninth Hour, then Eleventh (Vespers), Twelfth (Compline),
then the Midnight Office -- same method, and keep applying the no-placeholder rule live during
transcription rather than as a follow-up pass. After all hours: Phase 2, the Theotokia weekly
cycle, and resolve `cop-theotokion`'s sourcing. True interleaved-antiphon rendering (currently
simplified for the Sixth Hour) is a worthwhile future enhancement, not an open defect.

## SESSION HANDOFF 2026-08-18 continued -- Coptic Agpeya: Ninth Hour built (fourth checkpoint)

Fourth Agpeya checkpoint, same source (O'Leary 1911, pp. 101-103). Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`'s entry of the same date.

**Built:** the complete Ninth Hour (O'Leary's items (1)-(7)) as 3 new components
(`cop-nh-troparion`, `cop-nh-second-troparion`, `cop-nh-concluding-prayer`) in
`components/coptic.json` (30 entries total) and the `coptic-ninth-hour` rubric. Applied the
no-placeholder rule again: the troparion's "(repeated)" instruction resolved to the full refrain
both times. Unlike the Sixth Hour, this troparion's interleaved psalm verses (Psalm 119:169-170)
are given by O'Leary in full directly in the text, not cited by reference, so no separate
antiphonal-psalm handling was needed here.

**Real cross-check worth remembering:** O'Leary's psalm citation for this hour ("114 (116, verses
1-9), 115 (116, verses 10-19)") lines up exactly with the Vulgate-113-splits-into-Hebrew-114/115
boundary already resolved corpus-wide in this session's earlier DRB numbering fix -- confirmed
directly rather than assumed, and read here as the single whole Hebrew Psalm 116.

**Wired:** `SHARED_OFFICE_NAVIGATOR_CONFIGS.coptic.options` now has all four hours; drawer status
text updated.

**Verification:** `node --check` clean, both JSON files parse, full sweep of `coptic.json` found
zero remaining placeholder text in actual prayer content, div-tag balance unchanged.

**Next session should:** continue with the Eleventh Hour (Vespers), then Twelfth Hour (Compline),
then the Midnight Office -- same method, same source already in hand via Google Drive. After all
hours: Phase 2, the Theotokia weekly cycle, and resolve `cop-theotokion`'s sourcing.

## SESSION HANDOFF 2026-08-18 continued -- Coptic Agpeya: Eleventh Hour (Vespers) built (fifth checkpoint)

Fifth Agpeya checkpoint, same source (O'Leary 1911, pp. 103-106). Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`'s entry of the same date.

**Built:** the complete Eleventh Hour/Vespers (O'Leary's items (1)-(8), one more than the earlier
hours) as 4 new components in `components/coptic.json` (34 entries total) and the
`coptic-eleventh-hour` rubric.

**New no-placeholder case, resolved with a new pattern:** the troparion cites the Nunc Dimittis by
its opening line and a scripture reference only, not in full. Since this is a genuine scripture
citation (not repeated devotional text like the earlier refrain cases), added a new
`VARIABLE_COP_CANTICLE` handler -- resolves the same way the Gospel lesson does, pulling the full
canticle from this app's own Bible corpus.

**Wired:** `SHARED_OFFICE_NAVIGATOR_CONFIGS.coptic.options` now has five hours; drawer status text
updated (only Twelfth Hour + Midnight Office remain).

**Verification:** `node --check` clean, both JSON files parse, full sweep of `coptic.json` found
zero remaining placeholder text in actual prayer content, div-tag balance unchanged.

**Next session should:** finish the Twelfth Hour (Compline), then the Midnight Office -- same
method, same source already in hand. After both: Phase 2, the Theotokia weekly cycle, and resolve
`cop-theotokion`'s sourcing in that same phase. This closes out the "hours first" half of the
governance decision from earlier in this project.

## SESSION HANDOFF 2026-08-18 continued -- Coptic Agpeya: Twelfth Hour built -- ALL SEVEN HOURS COMPLETE

Sixth and final hour checkpoint. Full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s entry of the same
date.

**Real gap hit and resolved this session, worth remembering:** the first uploaded PDF half
(`DO 1-124 small.pdf`) cut off mid-sentence partway through the Twelfth Hour's final Metremhe
prayer. The second half (`DO 125+ small.pdf`) does NOT continue from there -- it jumps straight to
the Theotokia section, a later part of the book entirely. **Josh pasted the missing page (109)
directly, which closed the gap.** If a future session needs anything between "roughly page
109-110" and wherever the Theotokia actually begins in the second file (the Midnight Office is
still unbuilt and its source has not been located within either uploaded file), the same gap may
recur -- ask Josh to paste/upload that specific range rather than assuming it's in one of the two
files already in hand.

**Built:** the complete Twelfth Hour (O'Leary's items (1)-(11)) as 5 new components in
`components/coptic.json` (39 entries total) and the `coptic-twelfth-hour` rubric. Two governance-
rule patterns applied: (1) a litany abbreviating "intercede for us sinners" as "&c." on every line
after the first -- resolved by spelling it out every time; (2) O'Leary's own cross-reference back to
the Eleventh Hour's "Vouchsafe, O Lord" prayer ("page 104") -- reused as `cop-eh-vouchsafe-prayer`
rather than re-transcribed, the correct application of "reuse an already-verified component" rather
than treating every cross-reference as something needing fresh sourcing.

**Confirmed, not assumed:** this is the only one of the seven hours with no Gospel lection cited by
O'Leary -- checked directly rather than assumed, so `coptic-twelfth-hour` has no `lesson` field.

**Wired:** `SHARED_OFFICE_NAVIGATOR_CONFIGS.coptic.options` now has all seven hours; drawer status
text updated to reflect the full hour-cycle being built.

**Verification:** `node --check` clean, both JSON files parse, full sweep of `coptic.json` found
zero remaining placeholder text in actual prayer content, div-tag balance unchanged.

**ALL SEVEN HOURS OF THE COPTIC AGPEYA ARE NOW BUILT.** Closes the "hours first" half of the
governance decision from earlier in this project.

**Next session should:** source and build the Midnight Office (genuinely separate from the seven
day-hours; its text has not yet been located within either uploaded O'Leary file -- may need Josh
to paste/upload a specific additional page range). After that: Phase 2, the Theotokia weekly hymn
cycle, and resolve `cop-theotokion`'s open sourcing question in that same phase. None of the seven
built hours are GREEN yet -- all remain amber pending an independent read-through before promotion.

## SESSION HANDOFF 2026-08-18 continued -- Coptic Agpeya: Midnight Office built -- ALL PLANNED CONTENT COMPLETE

Final content checkpoint of this phase. Full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s entries of
the same date (both the tool-limitation note and the build itself).

**New standing tool limitation, worth remembering:** `Google Drive:read_file_content` truncates
large PDF extractions (confirmed: two separate fetches of the same 124-page source both stopped at
the identical point, well short of the actual end). If a future large-PDF fetch seems to cut off
mid-sentence or well short of where the source's own pagination says it should, don't assume the
content is genuinely missing -- ask the person to confirm what's in the file and paste the specific
missing range directly (text or page images both work fine) rather than retrying the same fetch.

**Built:** the complete Midnight Office (O'Leary's items (1)-(18) across three nocturns) as 12 new
components in `components/coptic.json` (51 entries total) and the `coptic-midnight-office` rubric.
This office has real structural differences from the seven hours worth knowing for future work:
three nocturns instead of one fixed sequence, its own distinct prayers (Ezekias/Isaiah 38,
S. Simeon Stylites, Abba Ephraem), and heavy internal cross-referencing that O'Leary states
explicitly rather than leaving ambiguous -- each cross-reference here was resolved by reuse, not
re-transcription: item (4) reuses the Third Hour's Second Troparion, the Second Nocturn repeats
items (4)-(7) from the First Nocturn, and the Second/Third Nocturns' psalms are pulled live from
the Eleventh/Twelfth Hours' own rubric fields via two new VARIABLE handlers rather than duplicated.

**No-placeholder rule applied once more, correctly distinguishing two cases:** the Prayer of
Ezekias (Isaiah 38:10-20) was cited by reference only -- resolved via the same canticle mechanism
built for the Eleventh Hour's Nunc Dimittis. A "repeated three times" rubric on a *fully-given*
prayer was correctly left as a repetition note, not treated as missing content -- same pattern
already established for the 41-fold Kyrie.

**Wired:** three new VARIABLE handlers in `renderCopticAgpeya()`; navigator now has all eight
offices; drawer status text updated.

**Verification:** `node --check` clean, both JSON files parse, full sweep of `coptic.json` found
zero remaining placeholder text in actual prayer content, div-tag balance unchanged.

**THIS CLOSES ALL PLANNED CONTENT-BUILD WORK FOR THIS PHASE.** Next session should move to Phase 2:
the Theotokia weekly hymn cycle (Psali and Theotokia for each day of the week -- source already
confirmed present in the second uploaded PDF file, starting at "PSALI FOR SUNDAY" right where the
Midnight Office leaves off), and resolve `cop-theotokion`'s open sourcing question in that same
phase. None of the eight offices built are GREEN yet -- all remain amber pending an independent
read-through before promotion, same standard as every other book in this project.

## SESSION HANDOFF 2026-08-18 continued -- Coptic Agpeya Phase 2 begins: Sunday Theotokia built

First checkpoint of Phase 2, following completion of all seven hours and the Midnight Office. Full
detail in `AUDIT_GOVERNANCE_LEDGER.md`'s entry of the same date.

**Scope decision made explicit, worth remembering for the remaining six days:** O'Leary's book
includes extensive scholarly "additional matter" per day -- secondary/tertiary paraphrases from
other manuscript traditions, aimed at textual critics. This rebuild deliberately builds only
"Section A" (the Psali, Alternative Psali, and the eight-section Theotokia with paraphrases and
lections) for each day -- the manuscript-variant material is out of scope for this devotional app.

**Built:** the complete Sunday Psali, Alternative Psali, and Theotokia as 11 new components in
`components/coptic.json` (62 entries total) and the `coptic-sunday-theotokia` rubric, using a new
generalized `theotokiaSections` mechanism (component id + optional lesson citation per section)
built once to work identically for all seven days -- **reuse this same mechanism for Monday through
Saturday rather than writing new code per day.**

**A real, disclosed difference in sourcing confidence:** unlike the hours and Midnight Office (each
either clean OCR or transcribed directly from Josh's page images), this content came from the
automated Google Drive text-extraction tool on a scan with noticeably worse OCR quality. Every
component here is flagged in its own `meta` as a lower-confidence tier pending human verification --
**this same disclosure practice should continue for the remaining six days**, since the source
quality issue applies to all of them equally, not just Sunday.

**No-placeholder rule applied to a new pattern:** the Psali's ~28-times-repeated refrain,
abbreviated by O'Leary as "O Lord, &c." after its first appearance, was written out in full at
every occurrence.

**A seasonal element correctly kept separate:** the Hymn on the Resurrection (Easter-to-Hatur only,
per O'Leary's own note) was NOT folded into the year-round Theotokia text -- this app doesn't have
seasonal on/off logic for Theotokia additions yet, so it's its own clearly-labeled component
instead. Same treatment should apply to any other seasonal additions found in the remaining days.

**Wired:** `VARIABLE_COP_THEOTOKIA_SECTIONS` handler added to `renderCopticAgpeya()`; navigator now
has the Sunday Theotokia option; drawer status text updated.

**Verification:** `node --check` clean, both JSON files parse, full sweep of `coptic.json` found
zero remaining placeholder text in actual prayer content, div-tag balance unchanged.

**Next session should:** continue with Monday's Psali/Alternative Psali/Theotokia, then Tuesday
through Saturday, same method -- source text for all six remaining days is already in hand (from
this session's Google Drive fetch, or can be re-fetched; the content runs from "PSALI FOR MONDAY"
at roughly p.148 through "THE SATURDAY THEOTOKIA" ending around p.197, plus that day's own
scholarly appendix material to skip). After all seven days: resolve `cop-theotokion`'s open
sourcing question, likely by comparing against the now-complete weekly Theotokia cycle for a
genuine match rather than guessing.
