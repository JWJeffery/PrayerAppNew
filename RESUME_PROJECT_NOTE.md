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

## Session 2026-07-18 — Fetha Nagast: copyright conclusion re-verified (holds), Guidi source CONFIRMED ACCESSIBLE

Josh pushed back hard on the prior session's copyright conclusion and the "no free English translation"
framing, and was right to demand it actually be re-checked rather than carried forward on trust — this
project's own governance rule is never to treat a prior claim as ground truth. Re-verified from scratch
via fresh web research, not by re-reading the prior session's notes.

**Copyright conclusion holds, but is now actually confirmed rather than asserted.** Every independent
source checked (Wikipedia, WorldCat, Stanford/Berkeley law library catalog records, the book's own
front matter, multiple academic citations) agrees: Tzadua/Strauss (1968, Faculty of Law, Haile
Sellassie I University) is the only complete English translation ever made. All later printings —
a 2002 Frontline Books reprint and the 2009 Carolina Academic Press second printing — are the same
translation. The 2009 printing's front matter carries an explicit, current copyright notice
("Copyright (c) 2009 by the Faculty of Law, Addis Ababa University. All rights reserved"), and it is
still commercially sold. This is a real, actively-asserted right, not a stale/ambiguous case.

**But the canonicity question was never actually in dispute — worth being explicit about that.** The
Phase 0 ET canonicity survey already categorized Fetha Nagast as belonging in the corpus (broader-canon-
adjacent Church Order text, same category as Kebra Nagast, historically Ethiopia's constitution). It
was never flagged for removal. The open problem has only ever been sourcing a rebuild, not whether the
book stays.

**Real, concrete good news: Guidi's 1897/1899 Italian edition is confirmed freely and fully accessible**
— not locked behind an access-control wall the way Miracles of Mary's source was. Both volumes are on
HathiTrust, full public view, digitized from the University of Michigan copy:
- Vol. 1 (1897): https://babel.hathitrust.org/cgi/pt?id=mdp.35112104546785
- Vol. 2 (1899): https://babel.hathitrust.org/cgi/pt?id=mdp.35112104546793

Well past any copyright question at the source. Guidi's translation is independently described in the
scholarship as the most authoritative edition to date and is the edition Tzadua's own translation was
principally based on. **Honest caveat carried forward:** these are page images, not machine-readable
text — OCR/transcription will be needed before translation work can start, the same shape of labor gap
that Miracles of Mary had. Not yet checked whether HathiTrust exposes a plain-text layer for this item.

**Explicitly deferred, Josh's call: Fetha Nagast work — OCR, translation, everything — is on hold until
after the app ships.** Do not pick this up proactively in a future session; wait for Josh to reopen it.
When resumed: OCR/transcribe Guidi's Italian from the two HathiTrust volumes above, then translate
chapter by chapter into English, flagging every passage with real uncertainty in ecclesiastical or
Ethiopian civil/criminal legal terminology rather than smoothing over it (same "honest empty over
fabricated content" standard as the Pashhur gap). Stay amber until a second reader who can check
against the Italian (or ideally the Ge'ez) has reviewed it — this is not a book Claude can self-certify
the way a straight transcription-and-compare job can be.

**Governance lesson, added as a standing rule below given how this session went:** a "no free source
exists" or "this is copyrighted" conclusion is exactly the kind of claim this project's core rule
already covers — never trust it just because a prior session (including this Claude) already reached
it. When Josh pushes back on a conclusion like this, the right response is to re-verify from primary
research immediately, not to defend the prior conclusion or hedge with lawyerly caveats before doing
the actual work of checking. Treat "I already looked into this" as a reason to look harder, not a
reason to hold the line.

## Session 2026-07-18 continued -- SY corpus audit: real, substantial defects found in 2 Baruch / Letter of Baruch

Audited the three SY-tagged files: `2baruchSY.json`, `letterofbaruchSY.json`, and `odesofsolomonSY.json`
(already GREEN from a prior session, not re-audited, confirmed still present).

**Real finding, not yet remediated:** `2baruchSY.json` has ~1,939 words of content confirmed missing
(vs. the Charles/APOT 1913 translation, verified via Wesley Center Online's transcription) across a
dozen-plus chapters, plus a confirmed real duplication defect (ch.12 vv.6-7 verbatim duplicate ch.13
vv.1-2), plus ~447 words of unexplained extra content, plus ~373 words of direct wording mismatches
whose cause (paraphrase vs. 1896-vs-1913 Charles edition mixing) isn't yet resolved. `letterofbaruchSY.
json` inherits the same defects one-for-one in its chapters 4-5 (= 2 Baruch chs. 81-82), since it was
built by copying that range verbatim. Full detail, including the discovery that the Wesley Center
source page itself is genuinely incomplete (stops mid-ch.85, not a fetch-tool wall), is in
`AUDIT_GOVERNANCE_LEDGER.md`'s "Syriac (SY) corpus audit, session 2026-07-18" entry.

**Assessment: full-rebuild-scale, same category as Hermas/Didascalia's earlier discoveries.** Not
fixed this session -- flagged to Josh for a direction before starting reconstruction, per the project's
established pattern for findings at this scale.

**Next session, if resumed:** verify chapters 86-87 against a primary source (yahwehswordarchives.org
confirmed the content is real/substantive but not yet checked character-for-character); resolve the
1896-vs-1913 Charles wording question (archive.org has the 1896 `theapocalypseofb00charuoft` scan for
comparison); triage the ~447 "extra" words individually; then rebuild both files from a confirmed-
complete source.

## Session 2026-07-18 continued -- ET broader-canon audit: MAJOR FINDING, 1-3 Meqabyan wrong content

Worked through the remaining unaudited ET items from the 2026-07-17 Phase 2 triage. Full detail in
`AUDIT_GOVERNANCE_LEDGER.md`'s "ET broader-canon audit, session 2026-07-18 continued" entry.

**Headline finding: 1-3 Meqabyan's content doesn't match the real text** -- confirmed via Wikisource's
free community translations plus an independent Wikipedia summary (both agreeing with each other, both
disagreeing with the app). The app invents a villain ("Tsur, king of the Chaldeans" instead of the real
Tsirutsaydan, king of Midian/Moab), gives the martyr three sons instead of five, and -- most
seriously -- turns "Meqa'abyan" (the book's own title, cognate to "Maccabees") into a fabricated
recurring personal/dynastic name across all three books, which the real narrative doesn't have at all.
Chapter counts happen to match the real books exactly, a reminder that structural completeness (already
confirmed clean in the Phase 1 sweep) says nothing about content accuracy. Same fabrication-class defect
as Prayer of Apollonius and pre-rebuild Didascalia, but these three ARE genuinely canonical (core
81-book canon per Phase 0), so this is a rebuild target, not a removal candidate. Real free source now
in hand (Wikisource's Translation:1/2/3_Meqabyan, cross-checkable against apocryphalibrary.weebly.com).
**Not yet rebuilt this session.**

**Also confirmed, condensation pattern (same class as Hermas/Didascalia pre-rebuild), sourcing still
partly blocked:** Guba'ekana (23 verses total for the Creed + canons + proceedings -- real source
exists at CCEL's NPNF2-14 for either the plain-20 or expanded-84 Nicene canon tradition, need to
determine which the app is loosely tracking before rebuilding); the Sinodos family (Sirate Tsion, Tizaz,
Admonitions, Abtilis -- 14-23 verses each, sourcing/mapping still needs digging per the 2026-07-17
triage); the non-red Clement/Qalementos files (2, 4, 5, 6, 8 Clement, Book of Rolls, Visionary,
Statutes -- 4-40 verses each, sourcing likely still needs Josh per that same triage, though R.H.
Charles' free APOT hasn't yet been checked for Clementine fragments).

**Real source found, not yet used:** Malke'a Virgin Mary -- Budge's "Legends of Our Lady Mary" (1922)
has "Salutations to the Members of the body of the Virgin Mary" at pp. 202-235, confirmed present via
archive.org's full copy. Not yet fetched/compared.

**Unchanged from prior sessions:** Malke'a Guba'e and Malke'a Iyasus (same genre as Malke'a Virgin Mary,
no source found yet, likely needs academic-literature search); Mazaheta (blocked on its own unresolved
title/identity question); Josippon (confirmed no free-or-paid complete English translation of the real
Ethiopian-recension text exists anywhere).

**Dashboard not yet updated for any of this** -- pending Josh's confirmation before flipping any
RED_SEED/GREEN_SEED entries, per the practice just established for the SY corpus earlier this session.

**Next session, if resumed:** rebuild 1-3 Meqabyan from Wikisource (highest-value target, real source
in hand, severe confirmed defect); fetch and compare Malke'a Virgin Mary against Budge; determine which
Nicene-canon tradition Guba'ekana should track and rebuild; continue digging on Sinodos/Clement sourcing
or take that question to Josh.
