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
- [ ] First Tuesday (pp.23-29)
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
