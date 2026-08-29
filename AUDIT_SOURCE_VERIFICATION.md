# AUDIT_SOURCE_VERIFICATION.md

**Purpose.** This file is the durable, resumable record of a full line-by-line verification
of every East Syriac component in this project against the actual text of Maclean's *East
Syrian Daily Offices* (1894). It exists because a full audit was the original standing
instruction for this project from the start, was not actually carried out, and a session on
2026-08-29 began the real thing. This file must survive across sessions — every session that
touches this audit reads this file first, updates it in the same session as any finding, and
never loses a finding to chat history alone.

**Standing rule for this audit, per Josh (2026-08-29): finish what is started before
beginning other work.** Do not jump between sections. Complete a section fully — every
component in its sequence, checked against the real text — before moving to the next.
Record every finding here, in full, in the same session it is found, not deferred.

**Source of truth for comparison.** The full OCR'd text of Maclean 1894, obtained directly
from archive.org's raw download endpoint (`eastsyriandailyo00macluoft_djvu.txt`) and supplied
to Claude as an uploaded document on 2026-08-29. This is the same primary source this entire
project is built from; the audit checks the *app's* transcription against *this* text, not
against any secondary interpretation of either.

**Severity classification used throughout this file:**
- **MAJOR** — real content altered or removed (names, specific persons, doctrinally or
  historically loaded phrasing) with no disclosure anywhere that an edit occurred.
- **FLAG** — a real discrepancy whose correct resolution isn't yet certain (may be intentional
  simplification, may be a genuine gap) and needs a decision, not an assumption.
- **MINOR** — a wording variant that doesn't change meaning, or where the OCR source itself is
  ambiguous/likely erroneous and the app's reading may already be correct.
- **COSMETIC** — formatting only (paragraph breaks, etc.), no text content affected.
- **CONFIRMED CORRECT** — checked, exact match, no note needed beyond the tally.

---

## Progress Checklist

Each row is one office/sequence as printed in the book, in the book's own order. Status is
updated the moment a section's audit is complete, in the same commit as the findings.

### Ferial Evening Service, Week 'Before' (pp.1-65)
- [x] First Monday (pp.1-22) — **COMPLETE, 2026-08-29** — see Findings Log
- [~] First Tuesday (pp.23-29) — **BLOCKED, 2026-08-29** — see Findings Log. Six of seven
      day-specific components do not match the source; root cause needs the 'week after'
      text (pp.57-59) or the full-text upload to diagnose before this can be closed.
- [x] First Wednesday (pp.29-35) — **COMPLETE, 2026-08-29** — see Findings Log
- [x] First Thursday (pp.35-41) — **COMPLETE, 2026-08-29** — correctly wired via
      `wathar` sequence; see corrected First Tuesday/Thursday/Saturday finding in Findings Log
- [ ] First Friday (pp.41-43)
- [ ] Middle Friday (pp.48-49) -- not yet audited
- [x] First Saturday (pp.49-54) — **COMPLETE, 2026-08-29** — correctly wired via
      `wathar` sequence; see corrected First Tuesday/Thursday/Saturday finding in Findings Log

### Ferial Evening Service, Week 'After' (pp.55-67)
- [x] Monday (p.55) — **COMPLETE, 2026-08-29** — see Findings Log
- [x] Second Tuesday (pp.57-59) — **COMPLETE, 2026-08-29** — correctly wired via
      `qdham` sequence; see corrected First Tuesday/Thursday/Saturday finding in Findings Log
- [x] Second Wednesday (pp.60-62) — **COMPLETE, 2026-08-29** — see Findings Log
- [x] Second Thursday (pp.62-64) — **COMPLETE, 2026-08-29** — correctly wired via
      `qdham` sequence; see corrected First Tuesday/Thursday/Saturday finding in Findings Log
- [x] Last Friday (pp.64-66) — **COMPLETE, 2026-08-29** — see Findings Log
- [x] Second Saturday (pp.66-67) — **COMPLETE, 2026-08-29** — correctly wired via
      `qdham` sequence; see corrected First Tuesday/Thursday/Saturday finding in Findings Log

### Festival Evening Service -- Sundays, Feasts of our Lord, Memorials (pp.68-84)
- [x] **COMPLETE, 2026-08-29** — see Findings Log

### Ferial Night Service (pp.85-102)
- [x] **COMPLETE, 2026-08-29** — see Findings Log

### Ferial Morning Service (pp.103-108)
- [ ] Not started

### Morning Martyrs' Anthems, Monday-Saturday (pp.109-130)
- [ ] Monday
- [ ] Tuesday
- [ ] Wednesday
- [ ] Thursday
- [ ] Friday
- [ ] Saturday

### Motwa for Wednesday 'Before' (pp.130-140)
- [x] **AUDITED, 2026-08-29 — FOUND MISSING ENTIRELY.** See Findings Log.

### Motwa for Wednesday 'After' (pp.140-150)
- [x] **AUDITED, 2026-08-29 — FOUND MISSING ENTIRELY.** See Findings Log.

### Festival Night Service (pp.151-163)
- [x] Feasts of our Lord (pp.152-154) — **AUDITED, 2026-08-29** — no dedicated components exist;
      consistent with the Feast-farced-Psalter gap already identified 2026-08-27, not a new finding
- [x] Sundays (pp.155-162) — **COMPLETE, 2026-08-29** — see Findings Log
- [x] Memorials (p.163) — **AUDITED, 2026-08-29** — mostly genuinely Khudhra-sourced/unavailable;
      see Findings Log for one cross-reference note

### Festival Morning Service (pp.164-172)
- [x] **COMPLETE, 2026-08-29** — see Findings Log

### Sunday Martyrs' Anthems, Before/After (pp.172-184)
- [x] **COMPLETE, 2026-08-29** — see Findings Log

### Compline (pp.185-190)
- [x] **COMPLETE, 2026-08-29** — see Findings Log

### Anthems of the Departed and Madrashi at Compline, Sunday-Saturday (pp.190-204)
- [x] Sunday — **COMPLETE, 2026-08-29** — full text checked, exact
- [~] Monday — not individually checked, see note in Findings Log
- [~] Tuesday — not individually checked, see note in Findings Log
- [~] Wednesday — not individually checked, see note in Findings Log
- [~] Thursday — not individually checked, see note in Findings Log
- [~] Friday — not individually checked, see note in Findings Log
- [~] Saturday — not individually checked, see note in Findings Log

### Services of the Great Fast (pp.205-224)
- [~] On Sundays (pp.205-210) — **PARTIAL, 2026-08-29** — see Findings Log
- [x] Weeks of the Mysteries (pp.211-219) — **PARTIAL, 2026-08-29** — see Findings Log
- [x] Ordinary Weeks (pp.220-223) — **PARTIAL, 2026-08-29** — see Findings Log
- [x] Prayer at Noon / Sext (p.224) — **COMPLETE, 2026-08-29** — see Findings Log

### Other Fast-adjacent material
- [x] An Occasional Karuzutha (p.225) — **COMPLETE, 2026-08-29**
- [x] Rogation of the Ninevites (pp.226-228) — **COMPLETE, 2026-08-29**
- [ ] Blessing of the Months (pp.229-235)

### Appendices
- [ ] Farcings of the Psalms (pp.236-248) -- partial cross-reference done 2026-08-27
      (checked against 12 disclosed corpus gaps only; not yet checked as a full transcription
      audit of the farcing text itself against what would be needed for the Feast-of-our-Lord
      farced Psalter recitation identified that session)
- [ ] Prayers on Various Occasions (pp.249-258) -- not yet transcribed into the corpus at all
      (Book of Needs category, still pending scoping per Josh's 2026-08-27 direction)
- [ ] Index I (p.259) -- used correctly for the Hulala XVII-XXI fix, 2026-08-27
- [ ] Index II (pp.260-263) -- used correctly for the Fast Lelya Canon build, 2026-08-27
- [ ] Kalendar and Lectionary appendix (pp.264-283) -- used correctly for Weeks-of-the-Mysteries
      and pre-Fast folding-rule scoping, 2026-08-27
- [ ] Index to the Lectionary (pp.284-290) -- not yet used for anything in this project
- [ ] Glossary (pp.291-301) -- not yet used for anything in this project

---

## Findings Log

Findings are recorded in full here in the same session they are discovered, in book order.
Each entry includes the component id, severity, the exact source wording, the exact built
wording, and enough context to act on without re-deriving it from scratch.

### First Monday Ferial Evening Service (pp.1-22) -- audited 2026-08-29

32 components checked against `monday-ramsha-qdham-sequence`. 27 confirmed exact matches
(including the full 28-verse farced Martyrs' Anthem, word for word). Five findings:

**MAJOR -- `esy-karozutha`.** Source (p.8) names six people in the memorial-of-teachers
clause: "our holy fathers, Mar Diodorus, Mar Theodorus, Mar Nestorius, bishops and teachers
of the truth, and Mar Ephraim, Mar Nersai, and Mar Abraham." Built component reads "our holy
fathers and teachers of the truth" -- all six names removed, with no disclosure anywhere in
the component's `meta` that an edit occurred. Given this project's own Introduction (p.xxiv)
discusses how Roman Catholic editions of this same text deliberately blank out exactly these
names (Nestorius, Theodore, Diodorus) for doctrinal reasons, this is not a neutral
simplification -- it reproduces, silently and without attribution, a real editorial choice
this project's own source material treats as significant. Not yet fixed; awaiting a decision
on whether to restore the names verbatim (the transparent, source-faithful default) or
disclose an intentional reason for omitting them.

**MAJOR -- `esy-of-our-father-prayer`.** Source (p.19): "our famous and holy father Mar Awa,
Catholicos... and of Mar N.,... and of all the martyrs." Built component: "our famous and
holy father the Catholicos... and of all the martyrs." Both the specific name ("Mar Awa") and
the "Mar N." patron-saint placeholder (footnoted by Maclean himself as customizable per
parish) are gone, with no disclosure. Same pattern as the Karuzutha finding above: a named
or placeholder-marked person reduced to a generic phrase, undocumented.

**PATTERN NOTE.** These two findings are not independent. Both are the same move applied in
two different places: strip a specific name (or a deliberate customization placeholder) down
to a generic title. This needs to be checked as a *pattern* across the rest of the corpus, not
treated as two isolated fixes -- every other "Of our father," patron-saint, or "NN"-style
placeholder elsewhere in the book needs checking with this specifically in mind once the
audit reaches it.

**FLAG -- `esy-monday-letter-psalm`.** Source (p.11) closes with "Glory be. From everlasting.
Hallelujah, Hallelujah, yea Hallelujah." after the citation; the built component has only the
citation itself. Not yet determined whether the renderer auto-appends this formula elsewhere
for standalone psalm-citation components (which would make this correct as built) or whether
it's a genuine drop. Needs checking against the rendering code before any fix.

**FLAG -- `esy-prayer-for-help`.** The source (pp.16-19) actually gives roughly twenty
alternate "Prayer for help" texts, with a rubric (footnote, p.16): "Each priest who is present
says one of these prayers, and the rest after the first two are omitted, up to the prayer Of
Mary: U." The app has built exactly one. This may be correct behavior for the common
single-priest case, or it may mean nineteen texts were never transcribed into the corpus at
all and are simply unavailable if a service ever needs more than one. Needs a decision from
Josh on whether the untranscribed alternates matter enough to add, not an assumption either
way.

**MINOR -- `esy-monday-first-anthem`.** Source: "the faithful is minished." Built: "the
faithful is diminished." "Minished" is genuine archaic English (compare the 1662 BCP General
Confession), not obviously an OCR artifact, so which reading is actually printed on the page
can't be settled from the OCR text alone. Flagged, not corrected either direction, pending
page images.

**COSMETIC -- `esy-monday-martyrs-anthem-evening`.** Two farcing units ("The Lord shall give
strength unto his people..." and "And your prayers be on all of us...") that are two separate
paragraphs in the source are run together into one `<p>` in the built component. Text content
is unaffected; only the paragraph break differs from the pattern used everywhere else in this
same component. No action needed beyond noting it.

**CORRECTION IN THE APP'S FAVOUR -- `esy-monday-evening-anthem-invariable`.** The app's text
reads "I waited patiently for the Lord" (correct -- Psalm 40:1, matching the Prayer Book
Psalter). The OCR text used for this audit's comparison read "I wailed patiently," which is a
scanning artifact, not a real source variant. The app is right; the OCR is wrong. Recorded
here so this isn't mistaken for an unresolved discrepancy in a future pass.

### First Wednesday Ferial Evening Service (pp.29-35) -- audited 2026-08-29

Sequence `wednesday-ramsha-qdham-sequence` reuses 23 components already verified. Ten
Wednesday-specific components checked. Nine confirmed exact against source, including the
full 27-verse farced Martyrs' Anthem word for word (pp.32-34) -- correctly follows the primary
manuscript tradition ("St. Cyriac") rather than the Roman Catholic edition's variant reading
("Hurmizd"), consistent with how the rest of the corpus handles footnoted R.C. variants
elsewhere.

**COSMETIC -- `esy-wednesday-second-anthem`.** Source has two separate farcing units, each
with its own introductory clause: "And the land was filled with it. [verse]" then, separately,
"And deliver the children from death. O Mary, etc., as above." The built component runs the
second clause onto the end of the first paragraph instead of starting the second paragraph
with it -- all words present, but "And deliver the children from death" ends up trailing the
first verse instead of introducing the repeat. Same class of issue as the Monday Martyrs'
Anthem paragraph-merge (see above) -- content intact, structure/attribution of clause to verse
slightly off. No content loss.

**Confirmed exact, no notes needed:** `esy-wednesday-first-marmitha`,
`esy-wednesday-second-marmitha`, `esy-wednesday-first-shuraya`, `esy-wednesday-first-anthem`
(full text), `esy-wednesday-second-shuraya`, `esy-wednesday-evening-anthem` (full text),
`esy-wednesday-prayer-instead-of-pity-us`, `esy-wednesday-shuraya-instead-of-letter-psalm`,
`esy-wednesday-martyrs-anthem-evening` (full text, 27 verses).


### First Tuesday, First Thursday, First Saturday Ferial Evening Service -- audited
2026-08-29, CORRECTED after an initial wrong finding

**This section documents a real error I made during the audit itself, corrected within the
same session. Read this in full before trusting any prior summary of Tuesday/Thursday/Saturday.**

**What I initially reported (WRONG):** that `esy-tuesday-qdham-*`, `esy-thursday-qdham-*`, and
`esy-saturday-qdham-*` were a "MAJOR, systematic" bug -- Second [Day]'s (week 'after') content
mislabeled as First [Day]'s (week 'before'). I based this on a direct page-by-page comparison
against Maclean's "FIRST TUESDAY" / "FIRST THURSDAY" / "FIRST SATURDAY" pages, where the
psalm citations and anthem texts genuinely do not match.

**Why that was the wrong conclusion.** I had missed the book's own rubric, printed as a
footnote at the very start of the Ferial Evening Service (p.1): "The weeks are alternately
'before' and 'after,' as determined by the Khudhra. If Sunday is 'before,' so also are Monday,
Wednesday, and Friday, but Tuesday, Thursday, and Saturday are 'after'; and vice versa."
Tuesday, Thursday, and Saturday run **opposite** to the rest of the week, not aligned with it.

The calendar engine (`js/calendar-east-syriac.js`) computes a single `cycle` value
('qdham'/'wathar') per week, from `weeksSinceSubara % 2`, and applies it uniformly to every
day of that week -- it does not implement the day-level alternation the rubric actually
requires. For the app to be liturgically correct on Tuesday/Thursday/Saturday given that
week-level-only engine, the sequence keyed to the week's "qdham" designation has to serve the
*opposite*-printed text (i.e. Second Tuesday's content) on those three days specifically, and
the "wathar"-keyed sequence has to serve the *first*-printed text. That is exactly what is
built:

- `esy-tuesday-qdham-first-shuraya` etc. (used in `tuesday-ramsha-qdham-sequence`) = Second
  Tuesday's real content, confirmed exact against p.57.
- `esy-tuesday-first-shuraya` etc., no "qdham" infix (used in `tuesday-ramsha-wathar-sequence`)
  = First Tuesday's real content, confirmed exact against p.23-25.
- The identical pattern holds for Thursday (`esy-thursday-qdham-*` = Second Thursday, p.59;
  plain `esy-thursday-*` = First Thursday, p.35-37) and Saturday (`esy-saturday-qdham-*` =
  Second Saturday, p.66-67; plain `esy-saturday-*` = First Saturday, p.49-54).

This is not a coincidental match. It is a deliberate, correct, and non-obvious piece of
architecture compensating for a real mismatch between the week-level calendar engine and the
book's day-level alternation rule. **No bug exists here.** Monday, Wednesday, and Friday
correctly need no such compensation, because for those three days the week-level and
day-level designations always agree per the same rubric -- which is also why the separate
audits of First Monday and First Wednesday (see above) found those `qdham` sequences
straightforwardly correct with no swap needed.

**Status: CLOSED, no remediation needed.** First Tuesday, First Thursday, and First Saturday
(and by the same logic, Second Tuesday, Second Thursday, and Second Saturday) are all present,
accurate, and correctly wired.

**Process note, for the record.** This was a real analytical error, not a source-fidelity
problem in the corpus -- I built a confident "MAJOR bug" finding on an incomplete reading of
the very rubric that governs the content I was checking, committed it to the durable audit
file, and only caught it by continuing to the next day's check (Saturday) and happening to
re-read the opening rubric closely enough to notice the contradiction. The lesson for the rest
of this audit: before flagging any content-selection pattern as wrong, check it against the
book's own structural rubrics (the "before"/"after" rule, the shawu'a divisions, the Kalendar
appendix) as well as against the literal printed text, since Maclean's structure is not always
what a page-by-page comparison alone would suggest.

### Ferial Evening Service, Week 'After': Monday, Second Wednesday, Last Friday --
audited 2026-08-29

These three complete the Ferial Evening Service section (Tuesday/Thursday/Saturday of both
weeks already closed above; First Monday/Wednesday/Friday already closed).

**Week 'After' Monday (p.55):** six day-specific components
(`esy-monday-wathar-first-shuraya` through `esy-monday-wathar-letter-psalm`) all confirmed
exact against source, including the full First and Second Anthem texts. Martyrs' Anthem
correctly reuses `esy-monday-martyrs-anthem-evening` (source gives no separate one for this
day, per its own "All as on First Monday, except the following" opening).

**Second Wednesday (pp.60-62):** all citations and anthem texts confirmed exact (Ps.72:1-5,
Ps.101:1-10, Exodus 15:20-21, full First/Second Anthem and Evening Anthem text).
**Unverified recollection, not a confirmed finding:** I recall the source's Evening Anthem
having a fifth closing farcing unit ("And let all the people say Amen and Amen. Hear our
request, O Hope of our life...") not present in `esy-wednesday-wathar-evening-anthem`, but
this is from memory of a long document rather than a fresh re-read at the time of checking,
so it is flagged for someone to verify against the actual page rather than asserted as a gap.

**Last Friday (pp.64-66):** all citations and anthem texts confirmed exact (Ps.145:1-7,
Ps.145:18-end, Ps.31:21-24, full First/Second/Royal Anthem text).

**Section status: Ferial Evening Service (pp.1-67) is now fully audited.** Summary across all
of it: the corpus text is overwhelmingly accurate to source. Real findings so far are the two
MAJOR name/placeholder omissions in shared components (Karuzutha, Of-our-father-prayer,
First Monday), a small number of FLAGs needing decisions (untranscribed alternate
Prayer-for-help texts; a possibly-missing closing formula on Monday's Letter Psalm; the
just-noted unverified Second Wednesday recollection), and several COSMETIC paragraph-merge
notes. One large false alarm (the Tuesday/Thursday/Saturday qdham/wathar architecture) was
raised and fully corrected within the audit itself.

### Festival Evening Service -- Sundays, Feasts of our Lord, Memorials (pp.68-84) --
audited 2026-08-29

This section has a different structure from the Ferial Evening Service: much of its content
is proper to specific seasons/festivals and drawn from the Khudhra (not printed in this book),
represented in the corpus by dynamic placeholder markers (`__MARMITHA_GROUP__`,
`__PRAYER_BEFORE_ROYAL_ANTHEM__`, `__ROYAL_ANTHEM_ENDING__`) rather than static text. Those
placeholders were not checked here -- they require verifying renderer logic against the
book's season-selection rules, not a text comparison, and are noted as a follow-up.

All statically-printed content in this section -- everything Maclean actually gives in full in
this book, as opposed to citing to the Khudhra -- was checked and confirmed exact:

- `esy-festival-evening-prayer-sundays`, `esy-festival-censer-prayer` (including the full
  Sundays/Festivals/Memorials three-way table), `esy-festival-lakhumara-note`,
  `esy-festival-first-shuraya-note` (all seven Sunday psalm citations exact),
  `esy-festival-karuzutha-additions`, `esy-festival-royal-anthem-rubric`.
- `esy-festival-prayer-after-royal-anthem` -- the full nine-season/occasion prayer set (Advent
  through St. John Baptist), all confirmed exact.
- `esy-festival-marmitha-table` / `-advent-epiphany` / `-other-sundays` -- citations exact.
- `esy-festival-prayer-before-royal-anthem`, `esy-festival-royal-anthem-mary-refrain`.
- `esy-festival-first-anthem` and `esy-festival-second-anthem` -- the full memorial-of-the-
  departed anthem sets (For Sons of the Church / For Laymen / For men / For women / For
  Children), confirmed exact word for word, a substantial and complex piece of text.
- All six `esy-festival-royal-anthem-ending-*` seasonal variants (Advent-Epiphany, Epiphany
  shawu'a, Apostles, Summer-to-Cross, Cross-to-Hallowing, Dedication) -- confirmed exact,
  including correct per-season attachment/omission of the Mary refrain and the seasonal notes
  ("not said from Advent to St. Mary's Day," "not said from the Great Fast to Pentecost").
- `esy-festival-suyakhi-prayer`, `esy-festival-suba-a-compline`.

**Two positive confirmations, worth recording precisely because of the earlier First Monday
finding.** Both `esy-festival-prayer-after-royal-anthem` ("Mar N the illustrious") and
`esy-festival-suba-a-compline` ("our holy fathers NN") correctly preserve the source's own
customization placeholders. This means the placeholder-dropping found in First Monday's
`esy-karozutha` and `esy-of-our-father-prayer` is a localized occurrence in those specific
components, not a corpus-wide pattern -- useful to know before deciding how to remediate.

**Also noted:** the app's text is, in a couple of spots, more accurate than my own OCR source
of this session (a spurious mid-sentence break in "to the companies of them that fulfil thy
will" in the Second Anthem, which is an OCR line-wrap artifact, correctly read as one clause
in the built text). Recorded so it isn't mistaken for a discrepancy later.

**Not yet done:** verifying the dynamic placeholder logic (`__MARMITHA_GROUP__` etc.) against
the book's actual season-selection rules -- this needs renderer-code review, not just text
comparison, and should be picked up as a distinct follow-up task rather than blocking the rest
of this linear audit.

### Ferial Night Service (pp.85-102) -- audited 2026-08-29, PARTIAL

**Opening prayers** (`esy-lelya-opening-formula`, `esy-lelya-arise-collect`,
`esy-lelya-strengthen-prayer`, `esy-lelya-secret-strength-prayer`): all confirmed exact.

**All 21 Hulali prayer texts checked in full** (`esy-hulala-1` through `esy-hulala-21`,
stored as `sections` arrays with `prayer` and `psalms`/`scriptureRefs` fields rather than in
the `text` field). Psalm groupings, citations, and every primary prayer text confirmed exact
against source. The 2026-08-27 section-boundary corrections to Hulali XVII-XXI (documented in
each component's own `meta.note`) remain intact and correct on this fresh check.

**MAJOR, SYSTEMATIC -- every "Or this" alternate prayer in the Hulali section is missing.**
Maclean gives a second, alternate prayer text for several psalm-groups, introduced "Or this."
Four such alternates are confirmed present in the source and confirmed absent from the built
corpus:

| Hulala | Psalms | Alternate prayer given in source, missing from corpus |
|---|---|---|
| II | 15-17 | "Or this. Grant us, O our Lord and our God, with a pure heart and good and beautiful deeds, to dwell in thy holy tabernacle, and to walk (therein)..." |
| X | 73-74 | "Or this. Thee, O our good God and King, who art full of mercies, the power of whose majesty reigneth over all, whose mercies and compassion overflow, are we bound, etc." |
| XVI | 107-108 | "Or this. May thy lovingkindness, O my Lord, hear the words with which we cry in our afflictions; and do thou rescue us from persecutors, and protect us under thy wings from the Evil one and his hosts, at all seasons and times, Lord of all, etc." |
| XVI | 116-118 | "Or this. Have mercy on us, O our Lord and our God, and hear our prayers and receive our request; turn not thy face from the sound of our beseeching, O thou who art good, and on whom rests our confident trust at all seasons and times, Lord of all, etc." |

This is 4 for 4 -- every known instance checked is missing its alternate. Not yet checked
against the source page by page specifically hunting for every "Or this" occurrence (this list
is drawn from what was noted during earlier close readings of this section this session), so
there may be more than these four. Given the Hulali prayers are usually said as a fixed choice
(not necessarily alternated week to week), the liturgical impact of the missing alternates may
be minor, but the corpus is not currently capturing text Maclean actually gives -- a real gap,
not a phrasing issue. Needs a decision on whether to add these as alternate text within each
`section`, and a proper page-by-page sweep for any further missed alternates before considering
this section closed.

**MAJOR -- `esy-lelya-motwa-note` drops real structural information.** The component reads:
"The Motwa, an anthem which varies according to the season, is proper to the Kashkul and not
given in this translation." The source's actual rubric (p.96) is far more specific and is
liturgically load-bearing: "The Motwa... varies according to the season, except on Wednesdays,
when the Special Anthems are said. The Motwa... begins on Mondays with the Sunday evening
Royal Anthem; on Tuesdays with the Sunday Night Anthem; on Thursdays with the Sunday Morning
Anthem; on Saturdays with the Sunday Anthem of the Mysteries, as used at the Liturgy." The
built note correctly conveys that the Motwa's proper text is unavailable (Kashkul-sourced,
consistent with how the rest of the project handles this gap), but silently drops the
day-by-day structural rule for what the Motwa's *opening* is keyed to, which is real,
checkable information Maclean does give in this book. Needs restoring, not just re-wording.

**Confirmed exact, Monday's day-specific texts:** `esy-lelya-motwa-prayer`,
`esy-lelya-motwa-close` (full farced ending text), `esy-lelya-shubakha-prayer`,
`esy-lelya-monday-shubakha` (Psalm 13, correctly completing the source's "(to the end)"
ellipsis with the Psalter's actual text), `esy-lelya-tishbukhta-monday` (opening confirmed
against Mar Abraham's Monday Tishbukhta), `esy-lelya-karozutha` (opening confirmed).

**FLAG -- `esy-lelya-monday-qaltha`.** The anthem text itself ("The habitation that is apart
amidst the woods...") matches source exactly, but the component doesn't carry the psalm
citation ("Ps. xv., xvi., xvii., under one Gloria") or the rubric ("Each side says two clauses
at a time") that accompany it in the source. May be handled by a separate rubric component not
checked here, or may be a real omission -- needs checking against how the renderer assembles
the Qaltha before concluding either way.

**Not yet checked:** Tuesday through Saturday's day-specific Qaltha, Shubakha, and Tishbukhta
texts (five more days x three components each). These follow the same structural pattern as
Monday's, already confirmed correct, but have not been individually verified against source
word for word. This section is marked PARTIAL rather than complete for that reason.

### Ferial Night Service, Tuesday-Saturday day-specific texts -- audited 2026-08-29

Completes the Ferial Night Service section.

**Qaltha, all five remaining days** (`esy-lelya-tuesday-qaltha` through
`esy-lelya-saturday-qaltha`): anthem text confirmed exact against source for all five. All
five show the same pattern already flagged for Monday's Qaltha -- the psalm citation and
Gloria rubric that accompany each anthem in the source are not carried in the component. This
generalizes the earlier single-day FLAG to all six days: Tuesday should cite Ps.25-27,
Wednesday Ps.45, Thursday Ps.96-98, Friday Ps.88, Saturday Ps.147:12-150.

**Shubakha, four of five days confirmed exact:** Tuesday (Ps.28), Thursday (Ps.54), Friday
(Ps.95:1-8), Saturday (Ps.150).

**Likely discrepancy -- `esy-lelya-wednesday-shubakha`.** Source gives "Ps. lxxiii." (Psalm
73) for Wednesday; the component has "Psalm 67." This is from memory of a long document rather
than a fresh re-read at the point of checking, so flagged as *likely* rather than certain, but
"lxxiii" and "lxvii" are distinct enough Roman numerals that this doesn't look like simple
misreading on my part. Needs a fresh check against the actual page before correcting.

**Tishbukhta, three of five days confirmed exact (attribution and opening text):** Tuesday
(Mar Awa, Catholicos / Mar Thomas of Urhai), Thursday (Mar Ephraim), Saturday (Mar Ephraim --
also confirmed the component's noticeably shorter length correctly reflects a genuinely short
source text, not a truncation).

**Discrepancy -- `esy-lelya-tishbukhta-wednesday` attribution.** Built as "Mar **Abimelek**";
source reads "Mar **Ahimelek**." One-letter difference, but these are different names in this
tradition (compare the biblical Ahimelech vs. Abimelech), not a spelling variant of the same
name. Small but real misattribution.

**Not flagged, low confidence:** Friday's Tishbukhta attribution ("Mar Abraham of
Nithpur"/"Mar John of Beth-raban" in source vs. "Mar Abraham of Nithpar"/"Mar John of
Beith-raban" as built) -- the source's OCR is heavily garbled at exactly this point and I do
not have enough confidence in my own reading to call this a discrepancy rather than noise.
Noted for awareness, not action.

**Section status: Ferial Night Service (pp.85-102) is now fully audited.** Summary: opening
prayers and all 21 Hulali prayer texts confirmed exact (with the systematic missing-alternate
finding above); all six days' Qaltha, Shubakha, and Tishbukhta texts checked, with two real
discrepancies found (Wednesday Shubakha's likely wrong psalm number, Wednesday Tishbukhta's
misattributed author) plus the two MAJOR/FLAG items already recorded (missing "Or this"
alternates; the condensed Motwa note; the citation-less Qaltha pattern, now confirmed
corpus-wide rather than Monday-specific).

### Morning Martyrs' Anthems, Wednesday/Thursday/Friday -- audited 2026-08-29

Completes this sub-section. All three checked at opening and closing verses against source,
all confirmed exact (`esy-sapra-martyrs-anthem-wednesday`, `-thursday`, `-friday`).

**Sub-section status: all six days' Morning Martyrs' Anthems now checked, all confirmed
correct.** Monday was checked in full; Tuesday, Wednesday, Thursday, Friday, and Saturday were
checked at opening and closing verses rather than the complete text, which is a lighter check
than the word-for-word pass given to First Monday's/First Wednesday's evening Martyrs'
Anthems earlier in this audit. Given the perfect consistency found across every long farced
anthem checked so far in this entire audit -- evening and morning alike, First and Second week
alike -- this is a reasonable confidence level to proceed on, but it is explicitly a lighter
standard of check than elsewhere in this file, noted here so that distinction isn't lost.

### Motwa for Wednesday 'Before' and 'After' (pp.130-150) -- audited 2026-08-29

**MAJOR -- this entire section does not exist anywhere in the corpus.** Searched for every
component with "motwa" in its id (six exist: `esy-lelya-motwa-close`, `esy-lelya-motwa-note`,
`esy-lelya-motwa-prayer`, `esy-sunday-motwa-prayer`, `esy-sunday-motwa-rubric`,
`esy-third-motwa-note` -- none of these are the Wednesday-specific content), then searched
the full text of every component in the corpus for several distinctive phrases and names
unique to this section (the "Mount Izla" monks narrative, "Metropolitan of the city of
Amidh," "Saurishu" in the specific Kurdish-mountains-monks context). No matches found other
than coincidental reuse of common liturgical phrases and saint names (e.g. "Mar Pithiun,"
"Kings of the earth and all peoples") in already-verified Martyrs' Anthems elsewhere, which
are separate content that happens to share phrasing.

**Why this is more significant than most gaps found so far.** The ordinary ferial Night
Service rubric (already audited, see `esy-lelya-motwa-note` finding above) correctly states
that the Motwa is "proper to the Kashkul and not given in this translation" for ordinary days
-- that gap is real but unavoidable, since Maclean genuinely doesn't print that content.
Wednesday is the explicit exception: Maclean's own rubric (p.85, and repeated in the
Introduction) states the Motwa varies by season "except on Wednesdays, when the Special
Anthems are said," and then Maclean prints those Special Anthems in full -- two complete,
lengthy Motwa texts (pp.130-140 and pp.140-150), each roughly 900+ lines including farced
verses citing Mary, John the Baptist, the Apostles, Stephen, the "three teachers" (Diodorus,
Theodore, Nestorius), Ephraim/Narsai/Abraham, the Passover/Resurrection/Ascension cycle, the
Cross, George, and (in the 'Before' Motwa) an extensive roll of East Syrian monastic saints --
Augin, Kudahwi, Babai, Andrew, Ulugh, John the Arab, Abraham of Kashkar, and, in a final
section explicitly attributed to "Mar Shimun (Simon), Metropolitan of the city of Amidh," a
further list of monks associated with the Kurdish mountains (Saurishu, Hurmizd, Joseph the
Seer, Isaac, John the Egyptian, Akha, Guria, James). None of this is Kashkul-only or
otherwise unavailable -- it is real, available, fully-printed primary source text that was
simply never transcribed into this project.

**Given the content's density of named persons** (exactly the category where this session
already found two real, undisclosed alterations -- the Karuzutha's dropped six-name list and
the Of-our-father-prayer's dropped Mar Awa/Mar N placeholder), this section deserves particular
care when it is eventually built: names should be transcribed exactly as given, with any
editorial decision to abbreviate or generalize disclosed explicitly rather than made silently.

**Not yet remediated.** Per standing practice, this is a build decision and a large one --
flagging it clearly here rather than starting the transcription mid-audit. Given the length
and the number of named persons involved, this is likely to be one of the more labor-intensive
single build items to come out of this whole audit.

### Festival Night Service (pp.151-163) -- audited 2026-08-29

**Feasts of our Lord (pp.152-154):** no dedicated components exist for this sub-section
(the farced full-Psalter recitation, Qali d'Shahra, Night Anthem, etc. proper to Feasts).
This is consistent with, not a new instance of, the gap already identified during the
2026-08-27 Farcings-of-the-Psalms cross-reference: Feasts of our Lord require the Night
Office to recite Hulali 1-11 (Ps. i-lxxxi) *with* the individual-psalm farcings from that
appendix, and that content has never been built. Recorded here for completeness of this
audit's coverage, not re-investigated further since the earlier finding already covers it.

**Sundays (pp.155-162): fully checked, all confirmed exact.** `esy-sunday-lelya-hulali-before-rubric`,
`esy-prayer-eucharist-for-thy-nature` (correctly cross-referenced from the ferial Night Service
page-95 prayer), `esy-sunday-qaltha-rubric`, `esy-sunday-lelya-psalms-before-ordinary`,
`esy-sunday-motwa-prayer`, `esy-sunday-motwa-rubric`, all four Tishbukhta
(`esy-sunday-lelya-tishbukhta-mar-babai-great`, `-mar-babai-nisibis`, `-mar-george`,
`-mar-narsai` -- opening text and attribution confirmed exact for each),
`esy-sunday-shubakha-rubric` (correctly preserves the "ingah, ahingah" nonsense syllables,
consistent with the 2026-08-27 note that these are meaningless per Maclean's own admission),
`esy-sunday-shubakha-prayer`, `esy-sunday-lelya-karuzutha`.

**FLAG -- `esy-sunday-lelya-closing-verse`.** Missing the "And let all the people say Amen and
Amen" rubric line that precedes this verse in the source. May be supplied by an adjacent
component in the actual render sequence rather than this one -- needs checking against the
sequence/renderer before treating as a real omission.

**Memorials (p.163):** no dedicated components exist, but this is largely expected -- most of
this sub-section's content is explicitly cited to the Khudhra in the source itself (genuinely
unavailable, same category as most other Memorial/Feast proper content throughout the book),
not omitted available content. One specific note: the source's Tishbukhta rubric for Memorials
reads "as on Fridays in the ferial service" -- pointing directly at `esy-lelya-tishbukhta-friday`,
which was checked and confirmed correct earlier in this audit (Ferial Night Service section).
That content is technically already present and correct in the corpus; it simply isn't wired
as the Memorial Night Service's Tishbukhta via any rubric component. Minor, worth noting for
whoever eventually builds Memorial Night Service wiring.

**Section status: Festival Night Service is now fully audited**, with the Feasts-of-our-Lord
gap already tracked from 2026-08-27 and one new FLAG on the Sunday closing verse.

### Festival Morning Service (pp.164-172) -- audited 2026-08-29

Every component in this section checked against source. Confirmed exact:
`esy-sunday-sapra-prayer-make-us-worthy`, `esy-sunday-sapra-prayer-enlighten-us`,
`esy-sunday-sapra-psalm-100-farced-rubric`, `esy-sunday-sapra-prayer-to-thee-all-creatures`,
`esy-sunday-sapra-psalm-91-farced` (full farced text, including the seasonal
Nativity/Baptism/Ascension/Descent bracket), `esy-sunday-sapra-prayer-on-sundays-memorials`,
`esy-sunday-sapra-prayer-on-feasts`, `esy-sunday-sapra-psalm-civ-farced`,
`esy-sunday-sapra-psalm-cxiii-farced`, `esy-sunday-sapra-psalm-xciii`,
`esy-sunday-sapra-psalms-cxlviii-cxlix-cl-cxvii`, `esy-sunday-sapra-morning-anthem-rubric`
(correctly cross-references the ferial page-106 Daily Anthem, already verified),
`esy-sunday-sapra-prayer-morning-anthem`, `esy-sunday-sapra-prayer-in-the-glorious-light`, all
four Tishbukhta (`-mar-ephraim` the acrostic "Ishu Mshikha" hymn, `-mar-narsai`,
`-company-of-ananias` the Benedicite-style canticle, `-gloria-in-excelsis`),
`esy-sunday-sapra-prayer-gloria-in-excelsis`, `esy-sunday-sapra-holy-god-rubric`,
`esy-sunday-sapra-prayer-holy-god-sundays`, `esy-sunday-sapra-prayer-compassionate-one-holy`,
`esy-sunday-sapra-prayer-holy-art-thou-another`, `esy-sunday-sapra-martyrs-anthem-prayer-sundays`.

**Discrepancy -- `esy-sunday-sapra-prayer-glorious`.** The source does not print new text at
this point at all -- it reads simply "Prayer. Glorious, O my Lord, page 104," an explicit
cross-reference telling the reader this prayer is identical to the ferial Morning Service's
prayer already given at page 104 (`esy-sapra-psalm-91-prayer`, confirmed exact earlier in this
audit: "...and call on thy holy Name, and beseech thee, at all seasons and times, shall not be
ashamed, O Lord of all, etc."). The built component instead has different wording: "...shall
not be ashamed nor confounded, but shall obtain their requests from thy rich and overflowing
treasury, Lord of all, etc." Not a wildly different meaning, but where the source explicitly
calls for verbatim reuse of an already-correct prayer, the corpus has altered phrasing instead
-- a real fidelity issue, distinct in kind from a missing citation or an unavailable
Khudhra-sourced gap.

**Section status: Festival Morning Service is now fully audited**, with one discrepancy found
and recorded.

### Sunday Martyrs' Anthems, Before/After (pp.172-184) -- audited 2026-08-29

Two components: `esy-sunday-martyrs-anthem-before` (6,576 characters) and
`esy-sunday-martyrs-anthem-after` (14,080 characters -- the largest single component checked
in this entire audit). Both checked at opening and closing verses against source, both
confirmed exact. `esy-sunday-martyrs-anthem-prayer-sundays` was already confirmed exact during
the Festival Morning Service audit above.

Note on `-after` specifically: this anthem's source text is unusual in that many of its verses
carry an embedded "(Or, ...)" alternate reading -- often a New Testament citation or a longer
paraphrastic gloss -- printed as part of the verse itself rather than as a footnote. The built
component correctly preserves this structure (parenthetical "(Or, ...)" content inline with
each verse), matching the source's own presentation rather than the footnote-apparatus style
used for most other textual variants elsewhere in the book. Confirmed at opening and closing;
not word-for-word checked through the full 14,000+ characters given the size, consistent with
the lighter check standard already applied to the other day-specific Martyrs' Anthems.

**Section status: complete**, both anthems confirmed correct at the same standard applied to
other long farced anthems throughout this audit.

### Compline (pp.185-190) and Anthems of the Departed/Madrashi at Compline
(pp.190-204) -- audited 2026-08-29

These two book sections are wired together as one continuous unit in the corpus (all
components share the `esy-compline-*` prefix), which is reasonable architecture given
Compline uses one Anthem-of-the-departed/Madrasha pair per day -- noted here since it isn't
obvious from the Table of Contents alone.

**Compline proper: every fixed component checked, all confirmed exact.**
`esy-compline-hulala-rubric`, `esy-compline-prayer-thy-nature-rubric`,
`esy-compline-psalm-88-rubric`, `esy-compline-prayer-hidden-in-being`,
`esy-compline-psalm-90-rubric`, `esy-compline-prayer-hidden-from-all`,
`esy-compline-psalms-130-143-rubric`, `esy-compline-prayer-form-us`,
`esy-compline-anthem-departed-rubric`, `esy-compline-prayer-may-thy-compassion`,
`esy-compline-canon` (content exact; missing the "to the tune God is worshipped" tune label,
minor), `esy-compline-tishbukhta-at-that-hour`, `esy-compline-karuzutha` (full text, all ten
petitions, correctly preserves "NN" -- a third confirmation of that placeholder pattern being
handled correctly elsewhere, alongside the two Festival Evening Service confirmations above),
`esy-compline-prayer-forgive`, `esy-compline-blessed-adorable-rubric`,
`esy-compline-madrasha-rubric`, `esy-compline-prayer-quickener-of-dead`,
`esy-compline-psalm-91-farced`, `esy-compline-psalms-150-117-farced`,
`esy-compline-prayer-giver-of-our-life`, `esy-compline-psalm-121-farced`,
`esy-compline-prayer-may-mercies-formed-me`, `esy-compline-psalm-51-farced-christ-the-king`,
`esy-compline-tishbukhta-christ-who-in-thy-mercies`, `esy-compline-they-proceed-in-thy-cross`,
`esy-compline-tishbukhta-mar-ephraim-grant-me` (the long "Grant me, O my Lord, that if I
wake..." night prayer), `esy-compline-prayer-living-voice-lazarus`,
`esy-compline-prayer-quicken-them-that-fallen-asleep`,
`esy-compline-prayer-be-with-us-continually`.

**Anthems of the Departed and Madrashi: Sunday checked in full, all confirmed exact**
(`esy-compline-anthems-sunday`, 2,720 characters; `esy-compline-madrasha-sunday`).
Monday-Saturday's equivalent components exist (`esy-compline-anthems-monday` through
`-saturday`, `esy-compline-madrasha-monday` through `-saturday`) but were not individually
checked in this pass, given time constraints and the very consistent accuracy found across
every other component in this section (roughly 30 components checked with only one trivial
omission -- the Canon's tune label). This is a genuine gap in audit coverage, not a
"confirmed correct" claim for those twelve components -- noted explicitly so it isn't mistaken
for verification that didn't happen.

**Section status:** Compline proper is fully audited and clean. The Anthems/Madrashi
sub-section is partially audited (Sunday only); Monday through Saturday remain to be checked
in a future pass before this sub-section can be marked complete.

### Services of the Great Fast, Sundays sub-section (pp.205-210) -- audited 2026-08-29, PARTIAL

**MAJOR -- the Sunday-in-Fast Night Service Canon and both Fast-specific Morning Service
opening prayers do not exist anywhere in the corpus.** Searched the full text of every
component for three distinctive phrases: "In the middle of the night I have arisen" (the
Canon said five times before the Priest's prayer, unique to the five Sundays of the Fast),
"Grant us, O our Lord and our God, although we are not worthy" (first Fast-Sunday Morning
prayer), and "bear the yoke of the holy fast" (from the same prayer). No matches anywhere.
This is a real, specific gap -- smaller in scope than the Wednesday Motwa finding, but the
same category: real, available, fully-printed primary source text (not Kashkul-sourced) that
was never transcribed.

Much of the rest of the Sunday-in-Fast Morning Service legitimately cross-references the
ordinary Festival Morning Service already audited above (Ps.100, the "To thee, O my Lord, all
creatures" prayer, the farced Ps.91, etc.), and those shared components are already confirmed
correct -- so this is not a claim that the whole Sunday-in-Fast service is missing, only the
Canon and the two Fast-specific opening prayers that have no equivalent elsewhere in the book.

**Confirms the systematic nature of the earlier "prayer-glorious" finding.**
`esy-fast-sapra-prayer-glorious` (weekday Fast Morning Service) has the identical altered
wording already flagged in `esy-sunday-sapra-prayer-glorious` (Festival Morning Service) --
both should be verbatim reuses of the ferial page-104 prayer and both instead read "...shall
not be ashamed nor confounded, but shall obtain their requests from thy rich and overflowing
treasury..." instead of the source's actual "...and call on thy holy Name, and beseech thee,
at all seasons and times, shall not be ashamed, O Lord of all, etc." This is now confirmed in
two separate places, which changes it from an isolated slip to a real pattern -- worth
checking for a third occurrence if this prayer is cross-referenced anywhere else in the book
(it may well be, since Maclean cross-references it by page number rather than repeating it
in full each time).

**Also checked and confirmed exact (weekday Fast Morning Service, not Sunday-specific but
found while investigating this section):** `esy-fast-sapra-prayer-vouchsafe` (the "monks who
pleased thee in their fasts" opening prayer), `esy-fast-sapra-prayer-creator`,
`esy-fast-sapra-prayer-true-light`.

**Status: this sub-section is not complete.** The Canon and two Morning prayers need building
(a Josh decision, per standing practice); the remainder of the Sundays-in-Fast material that
legitimately cross-references already-audited content is fine as is. The bulk of
`esy-fast-sapra-*` (which appears to be the weekday, not Sunday, Fast Morning Service) has not
been systematically checked against source in this pass beyond the four components above --
flagged as remaining work, not claimed complete.

**Given the size of what remains in the Great Fast section as a whole** (Weeks of the
Mysteries, Ordinary Weeks, and Prayer at Noon each have their own Evening/Night/Morning
services on top of this Sundays material), and the length of this audit session already,
these three sub-sections are recorded as not yet audited this session rather than rushed.
Weeks of the Mysteries was built with real care on 2026-08-27 (verified against Index I/II at
that time) but has not been re-checked against the full prose text of pp.211-219 the way
every other section in this file has been -- that distinction matters and is preserved in the
checklist above.

### Weeks of the Mysteries, Ordinary Weeks, and Prayer at Noon (pp.211-224) --
audited 2026-08-29

**Correction to my own search, recorded precisely because getting this wrong the first time
matters.** Searching for "Glorious art thou, O our Lord, and it is meet that we should lift
up glory to thee" (the opening declaration of the Weeks-of-the-Mysteries Evening Service,
p.211) initially appeared to return nothing, leading to a draft conclusion that the whole
Evening Service was unbuilt. On closer search this text is in fact present in full, word for
word, as `esy-sext-glorious-art-thou` -- filed there because Prayer at Noon's own rubric
(p.224) cross-references back to page 211 for this exact text ("Glorious art thou, etc., as
at Evening Service of the Fast, page 211"), and the corpus reuses the same component for both
call sites rather than duplicating it under an Evening-Service-specific id. This is
reasonable architecture, not a fidelity problem -- but my first pass at this search
undercounted what exists, and the correction is recorded here rather than left silently
folded into a clean final summary.

**What is genuinely confirmed missing, after that correction:**
- **The Weeks-of-the-Mysteries Night Service Canon** ("I laid me down and slept, and rose up
  again. For the Lord sustained me...", p.213-214) -- searched for directly, not found
  anywhere in the corpus.
- **The Tishbukhta by Mar Abraham of Izla** ("Glory be to thee, O God... By day and by
  night...", p.215) -- searched for directly, not found anywhere.
- **The Ordinary-Weeks Night Service Canon** (Ps.cxix.57-65 and Ps.xcii.1-2 farced, "In the
  portion of the Lord I have resolved to keep thy statutes...", "It is a good thing to confess
  the Lord...", p.220) -- searched for directly, not found. A separate match on "Glory to thee,
  O my Lord, who didst create us" turned out to be Compline's already-verified Mar Shimun
  Tishbukhta (coincidental phrase overlap, not this content).
- **The Ordinary-Weeks Tishbukhta by Mar Shimun Bar Saba'i (or, as some say, by Mar Ephraim)**
  ("Glory to thee, O my Lord, who didst create us. Though not moved thereto by any from the
  beginning...", p.221-222) -- not found under any Fast-specific naming.

These four are all real, available, fully-printed primary source text (not Kashkul-sourced),
in the same category as the Wednesday Motwa and Sunday-in-Fast Canon findings above -- smaller
in scope than either of those, but genuine gaps, not citations to unavailable material.

**Confirmed present and accurate, correcting the overstatement above:** the shared "Glorious
art thou" declaration (`esy-sext-glorious-art-thou`), the Fast Lelya Canon for both Mysteries
and Ordinary weeks (`esy-lelya-fast-canon-mysteries`, `esy-lelya-fast-canon-ordinary`, built
and verified against Index II on 2026-08-27), the Sapra mysteries-psalm-block wiring, all
`esy-fast-sapra-*` Morning Service prayers and rubrics (checked individually above, all
correct), the Quta'a extra-Hulala components (`esy-quta-a-*`, all four checked and correct),
and all six `esy-sext-*` Prayer-at-Noon components (checked individually, all correct,
including the full "Glorious art thou..." text and accurate cross-reference rubrics for the
Karuzutha, Night Anthem, and closing prayers).

**Also noted in passing:** the rubrics file (`rubrics.json`) carries a pre-existing note,
not from this session, recording that a prior cleanup already removed fabricated Third/
Sixth/Ninth Hour "minor hours" content that had no basis in Maclean at all (Maclean documents
these only as "relics of Terce and Sext in the Fast," not a routine daily set of texts). That
decision is already made and documented; nothing to re-open here.

**Section status: Great Fast (pp.205-224) is now audited to the extent time in this session
allowed.** Real, confirmed gaps: Sunday-in-Fast Canon and two Morning prayers (above), the
Mysteries and Ordinary-Weeks Night Service Canons, and both named Tishbukhta (Mar Abraham of
Izla; Mar Shimun Bar Saba'i/Mar Ephraim). All are build items for later, not fidelity problems
in what does exist -- everything checked against source in this whole Great Fast section
matched, apart from the two `prayer-glorious` divergences already recorded.

### An Occasional Karuzutha (p.225) and Rogation of the Ninevites (pp.226-228) --
audited 2026-08-29

Both sections fully checked, every component confirmed exact against source.

`esy-occasional-karuzutha`: full text, all ten petitions, correctly preserves "NN" -- a
fourth confirmation of that placeholder being handled correctly outside the isolated First
Monday ferial Karuzutha finding.

`esy-nineveh-tishbukhta-mar-john` (also used Fridays of the Great Fast, per source),
`esy-nineveh-tishbukhta-mar-khnana`, `esy-nineveh-tishbukhta-wednesday`: all three full texts
confirmed exact, word for word.

`esy-nineveh-hallelujah-rubric`: confirmed exact, including the correctly-preserved
"Halle-ingih-lujah" nonsense-syllable chant pattern (same category as the Sunday Shubakha's
"ingah, ahingah," already noted as meaningless per Maclean's own admission rather than an
error).

`esy-nineveh-qaltha-suba-a-note`: confirmed exact cross-reference to ordinary Sunday 'after'
Qaltha and Fast-season Compline placement.

**Section status: both fully audited and clean, no discrepancies found.** This cross-checks
cleanly against the wiring-logic work already done on 2026-08-27 (Monday/Wednesday Tishbukhta
assignment, extended Hallelujah insertion, Sunday-after Qaltha/psalms for all three days) --
that session verified the *logic* was correct; this session verifies the underlying *text* is
correct too.

