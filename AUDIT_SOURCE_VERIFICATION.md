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
- [ ] First Wednesday (pp.29-35)
- [ ] First Thursday (pp.35-41)
- [ ] First Friday (pp.41-43)
- [ ] Middle Friday (pp.48-49)
- [ ] First Saturday (pp.49-54)

### Ferial Evening Service, Week 'After' (pp.55-67)
- [ ] Monday (p.55)
- [ ] Second Tuesday (pp.57-59)
- [ ] Second Wednesday (pp.60-62)
- [ ] Second Thursday (pp.62-64)
- [ ] Last Friday (pp.64-66)
- [ ] Second Saturday (pp.66-67)

### Festival Evening Service -- Sundays, Feasts of our Lord, Memorials (pp.68-84)
- [ ] Not started

### Ferial Night Service (pp.85-102)
- [ ] Not started (Hulali 1-21 prayer texts already checked once during the 2026-08-27
      Hulala XVII-XXI fix, against Index I only, not against the full prose text here --
      still needs a full pass)

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
- [ ] Not started

### Motwa for Wednesday 'After' (pp.140-150)
- [ ] Not started

### Festival Night Service (pp.151-163)
- [ ] Feasts of our Lord (pp.152-154)
- [ ] Sundays (pp.155-162)
- [ ] Memorials (p.163)

### Festival Morning Service (pp.164-172)
- [ ] Not started

### Sunday Martyrs' Anthems, Before/After (pp.172-184)
- [ ] Not started

### Compline (pp.185-190)
- [ ] Not started

### Anthems of the Departed and Madrashi at Compline, Sunday-Saturday (pp.190-204)
- [ ] Sunday
- [ ] Monday
- [ ] Tuesday
- [ ] Wednesday
- [ ] Thursday
- [ ] Friday
- [ ] Saturday

### Services of the Great Fast (pp.205-224)
- [ ] On Sundays (pp.205-210)
- [ ] Weeks of the Mysteries (pp.211-219)
- [ ] Ordinary Weeks (pp.220-223)
- [ ] Prayer at Noon (p.224)

### Other Fast-adjacent material
- [ ] An Occasional Karuzutha (p.225)
- [ ] Rogation of the Ninevites (pp.226-228)
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

### First Tuesday Ferial Evening Service (pp.23-29) -- audited 2026-08-29, DIAGNOSED

Sequence `tuesday-ramsha-qdham-sequence` reuses 23 components already verified from First
Monday (opening formula, Lakhumara, Karuzutha, Trisagion, laying-on-of-hands, all the closing
prayers, Nicene Creed) -- not re-checked here, already covered. Nine components are
Tuesday-specific. Two (`esy-tuesday-first-marmitha`, `esy-tuesday-second-marmitha`) confirmed
exact against source ("Ps. xxv., xxvi., xxvii." = Psalms 25/26/27; "Ps. xxviii., xxix., xxx."
= Psalms 28/29/30). One (`esy-tuesday-martyrs-anthem-evening`) confirmed exact, full text,
against source pp.25-29.

**MAJOR, SYSTEMATIC -- six of the remaining seven Tuesday-specific components do not match
what Maclean's actual "FIRST TUESDAY" page (p.23-25) gives.** Not wording variants -- entirely
different psalm citations and entirely different anthem texts under different tune names:

| Component | Source (First Tuesday, p.23-25) | Built |
|---|---|---|
| `esy-tuesday-qdham-first-shuraya` | "Ps. xvii. 1-6" (Psalm 17:1-6) | "Psalm 67:1-6" |
| `esy-tuesday-qdham-first-anthem` | tune "Light and the Son of light" / "Hear, O God, and have mercy upon me..." | tune "its own tune" / "Show the light of thy countenance, and we shall be saved..." |
| `esy-tuesday-qdham-second-shuraya` | "Ps. xxi. 1-5" (Psalm 21:1-5) | "Psalm 40:16-20" |
| `esy-tuesday-qdham-second-anthem` | tune "Now is the night" / "Hear my prayer, O Lord..." | tune "O Compassionate one, whose (door) is open" / "Rescue me, and deliver me..." |
| `esy-tuesday-qdham-evening-anthem` | "Our help is in the Name of the Lord..." | tune "God the Word" / "Who can express the noble acts of the Lord?..." |
| `esy-tuesday-qdham-letter-psalm` | "cxix. 17-33" (Psalm 119:17-33) | "Psalm 119:113-129" |

**ROOT CAUSE CONFIRMED, 2026-08-29: this is a week-swap mislabeling, not fabrication.** The
full text Josh had already supplied earlier in the same session (and which was not re-checked
before this was first reported as blocked -- a real process failure, corrected the same
session) contains the "SECOND TUESDAY" page (p.57, week 'after'). Every one of the six
mismatched components is an exact match to Second Tuesday, not First Tuesday:

| Component | Built content | Matches Second Tuesday (p.57) |
|---|---|---|
| `esy-tuesday-qdham-first-shuraya` | "Psalm 67:1-6" | "Ps. lxvii. 1-6" -- exact |
| `esy-tuesday-qdham-first-anthem` | "to its own tune" / "Show the light of thy countenance..." | exact, including tune label |
| `esy-tuesday-qdham-second-shuraya` | "Psalm 40:16-20" | "Ps. xl. 16-20" -- exact |
| `esy-tuesday-qdham-second-anthem` | tune "O Compassionate one, whose (door) is open" / "Rescue me, and deliver me..." | exact |
| `esy-tuesday-qdham-evening-anthem` | tune "God the Word" / "Who can express the noble acts of the Lord?..." | exact |
| `esy-tuesday-qdham-letter-psalm` | "Psalm 119:113-129" | "cxix. 113-129" -- exact |

This also explains why the Martyrs' Anthem was correct: Second Tuesday's own rubric reads
"Martyrs' Anthem, as on First Tuesday" -- it is genuinely shared content, not a coincidental
match.

**Actual state of the corpus, now confirmed:**
- `esy-tuesday-qdham-*` (six components above) contain real, accurately-transcribed Maclean
  text -- but it is Second Tuesday's (week 'after') content, mislabeled as First Tuesday's
  (week 'before').
- First Tuesday's actual content -- "Ps. xvii. 1-6" First Shuraya, the "Hear, O God, and have
  mercy upon me" First Anthem (tune "Light and the Son of light"), "Ps. xxi. 1-5" Second
  Shuraya, the "Hear my prayer, O Lord" Second Anthem (tune "Now is the night"), the "Our help
  is in the Name of the Lord" Evening Anthem, and the "cxix. 17-33" Letter Psalm citation --
  does not exist anywhere in the corpus and needs to be built from scratch.
- `esy-tuesday-first-marmitha`, `esy-tuesday-second-marmitha`, and
  `esy-tuesday-martyrs-anthem-evening` are correctly First Tuesday content and unaffected.

**Not yet remediated.** This is now a build decision (create the missing First Tuesday
content; relabel or duplicate the existing mislabeled components as Second Tuesday's real
`wathar` sequence) rather than an open audit question, and per standing project practice that
decision and its build order belong to Josh, not to be made unilaterally. Holding here pending
direction before making any corpus changes.
