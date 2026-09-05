# Horologion Testing Protocol (v1 — post Great Compline tranche)

## Standard Validation Flow

1. Corpus Check
- window.GC_CANON_OCTOECHOS.tones[tone]
- must exist
- must include { label, text }

2. Resolver Check
- window.HorologionEngine.resolveOffice(date, 'great-compline')

3. Slot Identification
- locate gc-canon slot
- confirm:
  - resolvedAs === 'gc-canon-octoechos-text'
  - type === 'text'

4. Content Validation
- must include:
  - Ode I
  - Ode IX
  - tone-specific opening line

## Pass Conditions

- not rubric fallback
- full text present
- correct tone
- correct resolver path

## Critical Lessons Learned

- Engine: window.HorologionEngine
- Signature: resolveOffice(date, officeKey)
- Incorrect date ≠ broken corpus
- Tone-cycle scanning is required for validation
- Claude test scripts are unreliable — architect writes tests
- Do not paste large patches into chat (token waste)

## Source Rule Clarification — Great Compline Tranche

- Public-domain sources are preferred by default
- User-provided witnesses (including copyrighted editions such as Lambertsen) are valid for transcription work

Constraints:
- No paraphrase
- No reconstruction
- No synthesis

### Scope of those three constraints — clarified by Josh, 2026-09-04

**The no-paraphrase / no-reconstruction / no-synthesis constraints govern TRANSCRIPTION work only.
They do not govern educational content.** The Liturgical Education Layer (Architectural Charter
section 11) is by its nature paraphrase and synthesis — it is explanation written in the app's own
words — and is therefore outside these three constraints.

Two things this clarification does NOT change, recorded so the scope is not later over-read:

1. **It does not change copyright.** The rule above governs this project; it has no bearing on the
   rights in a source. Lambertsen's *The Octoechos* (trans. Isaac Lambertsen, St. John of Kronstadt
   Press, 1999-2000) is in copyright — the translator reposed in January 2017, and a translation is
   its own protected work. What makes educational use workable is not this clarification but the
   ordinary position that an explanation written in one's own words from a source is scholarship
   rather than reproduction. Lambertsen may be consulted and cited; he may not be reproduced.
2. **It does not make the Octoechos a structural source.** It is a hymn collection. It can support
   glosses about hymnography — what a sticheron is, how the tone cycle turns — but it does not
   describe how an office is assembled, so it cannot answer the education layer's depth-2 question.
   The governing source for Byzantine office STRUCTURE is Hapgood 1906 (see below).

### Governing source for Byzantine explanatory content — approved by Josh, 2026-09-04

**Isabel Florence Hapgood, *Service Book of the Holy Orthodox-Catholic Apostolic (Greco-Russian)
Church* (Houghton, Mifflin, 1906). Public domain.** Approved per Charter section 13 and
UNIVERSAL_OFFICE_CORE_CONTRACT.md section 15. Chosen because it is a service book carrying its own
rubrics plus, in Appendix B, a numbered explanation apparatus keyed to points in each service; and
because it is the Slavic recension, which Charter section 9 names as this project's implemented
baseline. Its two stated limits are recorded in `data/explanations/byzantine.json` and must not be
papered over: Hapgood's own Preface says she omitted even the skeleton of the Midnight Service and
of Little Vespers, and left Vespers largely in skeleton form. Appendix B accordingly explains the
All-Night Vigil, the Hours, the Typika and the Liturgies — and does **not** explain the Midnight
Office or either Compline.

**A live licensing development worth tracking, not yet confirmed.** The Lambertsen Foundation
(established 2021, publishing as Damascene Press, a 501(c)(3)) is steward of Lambertsen's complete
works and has stated it is developing a freely accessible electronic library of English liturgical
texts; in August 2025 it announced that, in parallel with a 2026 print edition of the Octoechos, it
intended to release the text under a free public license, with a date to be announced in early 2026.
Whether that has actually landed was NOT confirmed as of 2026-09-04. If it has, it changes the
standing of this project's entire Octoechos corpus. Contact route: damascenepress.org.