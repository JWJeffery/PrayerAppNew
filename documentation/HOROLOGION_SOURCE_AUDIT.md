# Horologion Full Audit — Phase 1: Resources and Scope

**Status: resource-gathering complete, INCLUDING the Midnight Office/Small Compline gap (§4) —
Josh supplied the missing source same-day. Line-by-line audit not yet started.** Written 2026-09-25 at
Josh's direct request: "I want a full audit of the horologion. Start with determining what ought to
be there. Let's pull together all of the resources that we need in order to do this correctly." This
is that first phase. Nothing in the shipped Horologion content has been changed by this document.

Why this matters now specifically: the Byzantine Horologion is currently **unwired from testers**
(`RESUME_PROJECT_NOTE.md`, "BYZANTINE HOROLOGION TEMPORARILY UNWIRED", 2026-09-25) precisely because
Josh judged it not yet fully audited. This document is the first real step toward being able to
reverse that gate honestly, rather than on a guess.

---

## 1. What "the Horologion" actually is, and what this app has already decided about it

The Horologion (Ὡρολόγιον, "Book of Hours") is the Byzantine Rite's book of the fixed daily-cycle
offices — as distinct from the Octoechos (hymnography by tone), the Menaion (fixed-date saints), the
Triodion/Pentecostarion (the movable Lent-to-Pentecost cycle), and the Divine Liturgy itself (a
separate book). This project's own governing documents have already made two load-bearing decisions
that scope everything below:

- **Recension**: the Slavic (Russian) recension is the implemented baseline (`architectural_charter.md`
  §9), not Greek or Antiochian usage — those are named as *future* profiles, not the current target.
- **Structure vs. hymnography are different questions with different governing sources** (already
  established 2026-09-04, `documentation/HOROLOGION_TESTING_PROTOCOL.md`): Isabel Hapgood's *Service
  Book* (1906/1922) governs office **structure**; Isaac Lambertsen's *Octoechos* translation governs
  the **hymn texts** themselves. A hymn collection cannot answer "how is this office assembled," and a
  service book with its own explanatory apparatus can. This split is correct and this audit keeps it.

### The daily-cycle offices a complete Slavic-recension Horologion contains

Confirmed directly against Hapgood's own book structure (§2 below), cross-checked against ordinary
Byzantine liturgical knowledge, not assumed from memory:

1. **Vespers** (Hesperinos) — Great Vespers (festal/Saturday) and ordinary weekday Vespers. *Little
   (Small) Vespers is a third, rarer form, used before an All-Night Vigil on a great feast.*
2. **Compline** (Apodeipnon) — **Great Compline** (Lenten weekdays, certain vigils) and **Small
   Compline** (ordinary nights) are two distinct offices, not two lengths of the same text.
3. **Midnight Office** (Mesonyktikon / Polunoshtchnitza) — has its own daily, Saturday, and Sunday
   (Paschal) forms.
4. **Matins/Orthros** — ordinary, festal, and (combined with Vespers) the All-Night Vigil form Hapgood
   actually presents.
5. **The (Little) Hours** — First, Third, Sixth, Ninth, each with an **Interhour** (Mesorion)
   supplement said in some uses between the Hours.
6. **Typika** (Obednitsa) — said in place of the Divine Liturgy when none is celebrated.
7. **Fixed hymnody threaded through all of the above** — troparia/kontakia of the day, the weekly
   Octoechos cycle (tones 1–8), theotokia, prokeimena — these are cross-cutting corpora, not offices
   of their own, but every office above depends on them.

*Not part of the Horologion proper, out of scope for this audit*: the Divine Liturgy itself (own
book), the Menaion/Triodion/Pentecostarion as corpora (already have their own `data/` directories and
their own governance), and the Octoechos as a corpus (already governed by the Lambertsen approval
above).

---

## 2. The governing structural source, now fully in hand

**Isabel Florence Hapgood, *Service Book of the Holy Orthodox-Catholic Apostolic (Greco-Russian)
Church*, revised edition (Association Press, New York, 1922; endorsed by Patriarch Tikhon; text
unchanged in substance from the 1906 first edition per her own front matter).** Public domain.
Approved as this lane's governing structural source by Josh 2026-09-04 (see
`documentation/HOROLOGION_TESTING_PROTOCOL.md` and `data/explanations/byzantine.json`'s
`_provenanceNote`).

**This was previously only ever consulted in fragments** (an archive.org text stream that truncated
before Appendix B, plus one manually-uploaded excerpt of pp.592–615). As of this session, the
**complete, verbatim 658-page text is downloaded and saved in the repo**:

- `data/kalendar/source-witnesses/hapgood-service-book-1922.txt` — 44,029 lines, the full OCR text,
  fetched directly from the Internet Archive item `03510459.emory.edu` (Emory University's scan) via
  `curl`, confirmed complete against the archive.org metadata's own stated file size — **not** via
  `WebFetch`, whose "processes the content with a small, fast model" summarization step was
  independently confirmed this session to silently truncate a document this size to roughly its first
  50–75 pages, which is exactly the failure mode this project has hit before with Maclean's
  djvu-stream truncation. Direct download bypasses that.
- `data/kalendar/source-witnesses/hapgood-service-book-1922-section-map.json` — a **machine-extracted**
  (not hand-typed, so not subject to transcription error) map of every running header in the book to
  its page number and line number in the text file, built by pattern-matching the book's own printed
  page headers. Covers pp.5–571 (it stops before Appendix B, which uses a different heading
  convention not yet mapped). Confirmed page numbers for the offices this audit cares about:

  | Office | Page |
  |---|---|
  | Great Vespers | 5 |
  | The All-Night Vigil Service (Vespers + Matins combined) | 6–38 |
  | The First Hour | 39–42 |
  | The Third Hour | 43–47 |
  | The Sixth Hour | 48–52 |
  | The Ninth Hour | 53–58 |
  | The Typical Psalms (Typika) | 59–64 |
  | The Divine Liturgy (Chrysostom/Basil) | 65–132 |
  | The Divine Liturgy of the Presanctified | 133–147 |
  | The Office of Grand Compline | 148–164 |
  | Explanation (Appendix B) | ~591 onward (per the book's own alphabetical Contents; not yet in the machine-extracted map) |

  Both entries are registered in `data/kalendar/source-witnesses/source-index.json` under key
  `HAPGOOD1922`, matching the registry pattern already used for the Anglican-lane sources there.

### The confirmed gap, from the source's own words — not inferred

Hapgood's Preface (p.ix of this file) states outright: *"I have omitted even the skeleton of such
services as the Midnight Service (Polunosktchnitza), Little Vespers, the Blessing of a Ship..."* —
independently confirmed against the section map: **no running header for Midnight Office, Little
Vespers, or Small/Little Compline exists anywhere in the 571 pages the map covers.** Grand Compline
*is* fully present (pp.148–164) as real service text, so it was worth checking specifically rather
than assumed absent by association.

**This means Hapgood cannot be the structural source for three of the offices this app currently
builds: the Midnight Office, Small Compline, and (if ever built) Little Vespers.** Something else
must be — see §4.

---

## 3. The other sources already in play, and their real status (checked fresh, not from memory)

| Source | Governs | Status |
|---|---|---|
| **Lambertsen, *The Octoechos*** (trans. Isaac Lambertsen, St. John of Kronstadt Press) | The tone hymnography itself (troparia, canons, stichera, aposticha, theotokia by tone) | **In copyright.** Consultable and citable, not reproducible wholesale. The Lambertsen Foundation (Damascene Press) has publicly stated an intention to release it under a free public license alongside a 2026 print edition, targeted for "early 2026." **Checked fresh this session (2026-09-25, via damascenepress.org directly): still described only as "in the process of developing" — not landed.** No change from the 2026-09-04 status. Re-check before assuming otherwise. |
| **"Jordanville Horologion (2008 edition)"** — cited in numerous `data/horologion/*.json` files for weekday troparion tables, Psalter/kathisma groupings, prokeimena, and Typikon tables | Various structural/rubrical *tables* (which day gets which kathisma, prokeimenon, etc.) — not full hymn texts, based on how it's cited | **Identified precisely this session, not previously pinned down**: this is almost certainly Holy Trinity Publications' ***The Unabbreviated Horologion or Book of the Hours*** (Holy Trinity Monastery, Jordanville, NY; ISBN 978-0-88465-371-4). In copyright, modern edition — no free full text exists online. **We do not have a copy of this in the repo or (as far as this search found) in Josh's Google Drive.** Every citation to it in the current corpus is therefore currently unverifiable against the primary source; it's cited but not actually in hand. As an *unabbreviated* Horologion, this book almost certainly *does* contain the Midnight Office and Small Compline in full — making it the natural candidate to close the gap in §2, if Josh can supply pages, the same way Maclean and O'Leary were supplied for the East Syriac lane. |

---

## 4. The gap, and how it was closed the same day

**No named, defensible source had ever been recorded for the Midnight Office's structure.**
`data/horologion/midnight-office.json`'s own description said only "the structure presented here is
the ordinary... Midnight Office of the Constantinopolitan Horologion" — no edition, no citation. Given
Hapgood (the lane's approved governing structural source) explicitly and confirmedly omits this
office, and this project's own standing rule is no reconstruction/no synthesis for transcription work
(`HOROLOGION_TESTING_PROTOCOL.md`), this was exactly the kind of gap a real audit exists to surface.
Whether the current Midnight Office / Small Compline structure was drawn from a real source that
simply went uncited, or was reconstructed without one, is **still not established** — that
determination is the first item of the line-by-line audit, not answered here.

**Closed same session**: Josh supplied a copy. **Rassaphor-monk Laurence (Laurence Campbell), *The
Unabbreviated Horologion or Book of the Hours*, Holy Trinity Monastery (Jordanville, NY), Second
Edition, Second Printing, 1997** (in copyright, ISBN 978-0-88465-371-4) — 412 pages, a clean Adobe
Acrobat OCR text layer, spot-checked at three independent points before being relied on. Saved at
`data/kalendar/source-witnesses/the-unabbreviated-horologion-or-book-of-the-hours-...pdf`, with a
full plain-text extraction (`unabbreviated-horologion-1997.txt`, 15,325 lines) and a page map
transcribed from the book's own Table of Contents (`unabbreviated-horologion-1997-section-map.json`,
`pdfPage = printedPage + 4`, verified against three independent section starts). Registered in
`source-index.json` as `UNABHOR1997`.

**It contains all three Midnight Office forms** (Weekday, Saturday, and Sunday — more granular than
what this app currently builds), **plus Small Compline (p.238)** — the exact gap. It also independently
covers Matins, all four Hours with their Inter-Hours, Typica, Vespers, and Great Compline, meaning it
now serves as a **second, cross-checking witness** alongside Hapgood for every office in §1, not just
the two it was fetched for.

**One discrepancy disclosed, not yet resolved**: several existing `data/horologion/*.json` files cite
a vague "Jordanville Horologion (2008 edition)." This is a 1997 printing. Whether a genuinely distinct
2008 edition exists and differs from this one is unknown — treat those existing citations as
unverified against this specific text until checked page-by-page during the audit itself, not as
automatically confirmed just because a Jordanville source has now arrived.

---

## 5. What's already built — the current inventory, for reference against §1 and §2

Office keys the resolver (`js/horologion-engine.js`, `resolveOffice()`) currently routes to a
dedicated resolver function, confirmed by reading the routing switch directly, not assumed from a
stale doc-comment (the file's own header comment claims "v1: vespers... planned: orthros, midnight-
office..." — that comment is out of date; the real routing table is longer):

`vespers` (default/fallback route) · `small-compline` · `first-hour` · `third-hour` · `sixth-hour` ·
`ninth-hour` · `orthros` · `midnight-office` · `great-compline` · `typika` · `interhour-first` ·
`interhour-third` · `interhour-sixth` · `interhour-ninth`

That's 10 distinct offices plus 4 interhours — every office named in §1 has *some* wired resolver
already, including Midnight Office and Small Compline (the two with no confirmed structural source).
**Having a resolver wired says nothing about whether its content is actually sourced, complete, or
correct** — that is precisely what the line-by-line audit phase exists to test, office by office,
exactly as this session's engine-audit sweep did for the calendar/tone engines. `structure.json`'s own
`governance.byzantine_release_roadmap.critical_path_offices` list, which one might expect to already
answer this, turns out to cover only 6 items (Great Compline, Typika, and the four Interhours) — it is
not a comprehensive structural inventory and should not be read as one.

---

## 6. Proposed next step

Audit one office at a time against both sources now in hand (Hapgood + the Unabbreviated Horologion,
cross-checking one against the other wherever both cover the same office), following the same
discipline as this session's engine-audit sweep: every claim reproduced and verified directly against
the actual file and the actual source text, not inferred or trusted from a prior comment. Every office
in §1 is now sourced — no more blocked items. Suggested order, cheapest/highest-confidence first:
**Vespers → Grand Compline → the four Hours → Typika → Orthros/Matins → Midnight Office → Small
Compline.**

Not started yet.
