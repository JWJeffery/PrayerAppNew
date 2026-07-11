# Biblical Corpus Remediation — Methodology and Source Registry

**Purpose:** this document exists so the next book doesn't have to re-derive what Genesis
already established. Read this before starting character-for-character remediation on any
new book. Update it when a new lesson is learned or a new source is confirmed.

**Established:** 2026-07-11, during Genesis remediation. **Status of Genesis:** fully clean — all five
translations (KJV, DRB, NRSV, NABRE, Rotherham) verified and, where needed, corrected, with zero known
open defects. Moved to green on the dashboard only once every identified issue was actually fixed, not
merely documented.

---

## 1. This corpus uses original/historical editions, not modern ones — verify this first, every time

Confirmed for three of five translations so far:

- **KJV** = the genuine **1611 original-spelling edition** (`"Heauen"`, `"seuen hundred
  seuentie"`), not the modern-spelling 1769 Blayney text most Bible tools default to.
- **DRB** = the genuine **original 1610 Douay-Rheims**, not the later 18th-century Challoner
  revision (commonly labeled "DRC"). Distinctive tell: the "Be [X] made" imperative
  construction (Genesis 1:3, 1:6) that Challoner revised away.
- **NRSV** = the **original 1989 NRSV**, not the 2021 NRSVue (Updated Edition), which changed
  some well-known verses (e.g. Genesis 1:1: NRSVue reads "When God began to create," 1989
  reads "In the beginning when God created").
- **Rotherham** — not yet independently re-derived this pass; an established witness exists at
  `documentation/rotherham-source-witness-intake.json`, but hasn't been re-checked against live
  data the way the other four were. Treat as unconfirmed until it has been.

**Three near-miss wrong-edition comparisons happened in one Genesis session** before this
rule was internalized — each one caught only because a landmark, edition-distinctive verse was
checked before trusting a full diff. **Do this check first, before running any diff, for every
translation, on every future book.** Do not assume the "obvious" modern edition is correct for
this project — assume it's wrong until a landmark verse proves otherwise.

## 2. Confirmed-good sources — reuse these directly, don't re-derive

| Translation | Source | Access | Notes |
|---|---|---|---|
| KJV | `aruljohn/Bible-kjv-1611` (GitHub) | `git clone`, one JSON file per book | Confirmed clean against Genesis, 1529/1533 exact (remaining 4 are a `&thorn;`-vs-þ encoding artifact in a *different* reference file used briefly before this one, not this source) |
| DRB | `janvier-s/original-douay-rheims` (GitHub) | `git clone`, USFM format, one file per book | Confirmed clean against Genesis, 1530/1530 exact. Strip `\f...\f*`, `\x...\x*`, `\sc`/`\sc*` markup |
| NRSV | User-supplied SQLite (`NRSV-CI.SQLite3`, "Catholic Interconfessional," 1989, American spelling) | Provided directly by Josh | **No public legitimate source exists — copyrighted.** This file's own known-issues audit found no structural corruption; issues are canon-mapping/source-shape only, not text defects. `NRSVACE.SQLite3` (Anglicised Catholic Edition) was tried first and works for landmark-verse confirmation but is NOT a clean diff source — its own Catholic-edition editorial layer plus British spelling/idiom created too much false-positive noise (traced and explained, but NRSV-CI is a better primary source going forward) |
| Rotherham | `documentation/rotherham-source-witness-intake.json` | URL + SHA256 witness already in this repo | Not yet used for an active diff this pass — do that first before trusting it further |
| NABRE | User-supplied JSON (`nabre.json`, 73-book file) | Provided directly by Josh | **No public legitimate source exists — copyrighted.** Unlike the NRSV sources, this one has the SAME chapter/section-heading pollution baked in as the app's own data — not directly diffable, but valuable for pattern-deriving (the source keeps a dash `"Chapter N - Title."` where the app dropped it, `"Chapter N Title."` — use the dash as an anchor to extract exact title text) and for content-verification once headers are stripped from both sides. Confirmed clean and complete for Genesis: no structural issues, real content once headers are stripped. |

**SQL/JSON extraction pattern for the two NRSV SQLite sources:** `verses` table, columns
`book_number, chapter, verse, text`. Strip inline markup before comparing: `<f>[n]</f>`
(footnote marker), `<pb/>` (paragraph break), `<e>...</e>` (editorial heading — drop entirely),
`</?t>` (poetic line breaks — app stores poetic verses as one continuous string, so join with a
single space, not a line break).

## 3. Normalization is necessary but must be checked, not assumed

Verse text will differ from a correct reference source in ways that are NOT defects:

- **Small-caps convention**: `LORD` (reference) vs `Lord` (this app's established style
  throughout). Normalize before comparing, but when *writing* a fix, convert back to `Lord` to
  match the app's own convention — don't introduce `LORD` where 1,100+ other correct verses
  already say `Lord`.
- **Quote-nesting convention**: American (`"..."` primary, `'...'` nested) vs British/Anglicised
  (`'...'` primary, `"..."` nested). Strip entirely for comparison; when writing a fix, convert
  straight or foreign-convention quotes to the app's own curly, American-primary style.
- **Straight vs curly apostrophes/quotes**: normalize for comparison, convert to curly when
  writing a fix.
- **Versification differences between translation traditions**: a "missing" verse in one
  translation is sometimes real content sitting at a different verse address in that
  translation's own numbering tradition (confirmed pattern: DRB folds some verses into the
  preceding number per its own Vulgate-based versification — Genesis 5:32/49:33/50:26 are not
  gaps, they're this). Check the surrounding verses' content before concluding "missing" means
  "wrong."

**The critical discipline: after normalizing expected noise, don't just count what's left —
locate it.** A real defect clusters (a specific chapter range, a specific verse, a specific
book section). Genuine residual edition-variance is scattered evenly throughout. The Genesis
24-41 NRSV contamination was nearly written off as "normal Anglicization noise" — what caught
it was mapping quote-style and spelling convention chapter-by-chapter and seeing 86% of all
remaining mismatches concentrated in one 18-chapter range. **Do this mapping by default for
every book**, not only when something feels off.

## 4. Fix strategy: full-column replacement beats verse-by-verse patching

Once a verified source exists for a translation, and Josh has authorized "don't care how,
just make it accurate" (his standing instruction as of the Genesis NRSV fix): **replace the
entire translation column for the book from the verified source, written in the app's own
established conventions, rather than hand-patching each individually-flagged verse.**

This is both faster and more reliable — it doesn't depend on the mismatch-detection pass having
caught every real defect, and it doesn't require understanding *why* a defect happened before
fixing it. Verify before writing (landmark check), verify after writing (re-diff at zero
mismatches, confirm `git diff --stat` shows only the expected number of changed lines, check for
edit artifacts — leftover markup, double-spacing, unbalanced quotes *within* a single verse
specifically, not across verses since dialogue legitimately spans verse boundaries).

## 5. When your own extraction/comparison tooling is doing pattern-matching, validate it against known-correct data before trusting its output

Building an automated header-stripper or content-cleaner is itself a source of error, not just the underlying data. During the NABRE fix, a title-detection regex (built to recognize "Title Case phrase ending in a period" as a section heading) correctly caught 19 previously-undiscovered real defects — but also misfired on three verses that are genuine content, not headers (biblical name lists like "Ophir, Havilah and Jobab." that happen to read like a title). These false positives were only caught because they showed up as "mismatches" against the app's own already-correct text — which is itself the safeguard: **any tool that both cleans a reference and diffs against live data will surface its own false positives as apparent defects**, so long as every flagged mismatch is manually reviewed before being written, not just pattern-counted. Never trust a cleaning/extraction script's output at scale without spot-verifying the edge cases it flags against a source you already know is correct.

## 6. Sources with the same defect as the app's own data are still useful — for pattern-deriving, not direct diffing

The NABRE source Josh supplied had the identical chapter/section-heading pollution baked in as the app's own data (both apparently derived from the same underlying processing pipeline at some point). This made it useless for a direct line-by-line diff, but valuable in a different way: the source preserved a formatting detail (a dash: `"Chapter N - Title."`) that the app's data had dropped (`"Chapter N Title."`), which made the title boundary unambiguous in the source and let it be used to derive an extraction pattern applicable to the app's own data. When a source shares a known defect, look for what it *does* preserve that the target lost, rather than discarding it as unusable.

## 7. A newly-supplied source is not automatically an upgrade — check quality before assuming it beats what's already there

When Rotherham's existing app text was checked against a newly-supplied XML, the XML showed 1,183 apparent mismatches — the reflexive assumption (established by every other translation this session) would be "the app is wrong, fix it from the new source." That assumption was wrong here. The XML was a degraded OCR transcription: it had dropped Rotherham's signature emphasis-dashes (the entire point of the "Emphasized Bible") and contained scattered scanning errors. The app's existing text was correct in every single spot-checked case. **The volume of a diff's mismatches says nothing about which side is right** — a large mismatch count is exactly as consistent with "the new source is bad" as "the existing data is bad," and both this session's earlier wrong-edition near-misses and this Rotherham case prove it. Before writing any fix, verify which side actually matches independent, authoritative sources — don't assume newer, user-supplied, or larger-looking evidence is automatically the correction.

## 8. A book is not "green" while any known problem remains unfixed — full verification is not the same as clean

Josh's direct correction, applied to Genesis on 2026-07-11: full character-for-character verification coverage across all translations, with a real defect documented but left open (the KJV prefix-pollution fix, tracked but not yet applied), is not the same as the book being done. "If there is any type of problem in Genesis, then it's not green." A dashboard status of green requires zero known open defects, not comprehensive audit coverage with an outstanding item, however well-understood or low-risk that item is. Apply this standard to every future book by default — finish the mechanical fixes before calling a book complete, don't leave known-good fixes queued as "next session's work."

## 9. Process notes

- Always fetch a **fresh clone** at the start of a work session before assuming local state —
  patches from a prior session may not have been applied yet, and re-cloning is cheap insurance
  against working from stale assumptions.
- When continuing work across multiple patches in one session, apply your own prior patch
  locally first so the next commit builds on accurate history, rather than starting fresh each
  time and losing track of what's actually pending vs. applied upstream.
- `git diff --stat` after any content fix is a cheap, valuable sanity check — the number of
  changed lines should match the number of verses you intended to change, no more, no less.
