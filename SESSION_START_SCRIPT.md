# SESSION START SCRIPT — read this before doing anything else

This is a compact "start here" checklist, separate from `RESUME_PROJECT_NOTE.md` (the full
narrative log — still read that in full too, per its own critical note; this file is faster
orientation, not a replacement).

## 1. Orient before acting

```bash
git clone -q https://github.com/jwjeffery/PrayerAppNew.git /tmp/check && cd /tmp/check
git log --oneline -5
wc -l RESUME_PROJECT_NOTE.md   # then read it in FULL via sed chunks, not the view tool
```

Never trust a hash, `SEED_VERSION`, or "done" claim in any file's prose without checking it
against a fresh clone first. Files describe intent; `git log` on a fresh clone is ground truth.

## 2. Where things stand (written 2026-07-13 — verify this is still current)

Genesis through Nehemiah, plus Tobit, are all fully done: all five translations
(KJV/KJVA, DRB, NRSV, NABRE, Rotherham where applicable) character-for-character
verified, zero known open defects, dashboard green. Also: KJV switched
corpus-wide from 1611 to the 1769 KJVA edition (closed), and both Rotherham and
DRB have had corpus-wide audit passes. Tobit resolved a years-old blocked
NRSV/rawText status (see `data/bible/registry/tobit-text-trust-status.json`) and
surfaced a book-specific NABRE header-pollution gap plus an NRSV
section-header-pollution pattern not yet checked in any other deuterocanonical
book — see `scripts/bible-audit/README.md`'s known-bug-classes list, and note
the standing caution: versification differences are translation-specific, not
tradition-wide, and every documented internal-order exception (like Tobit
9:3/9:4, or Exodus 22:1-4 before it) must be preserved, not flattened into a
single "corrected" reading. Next book in sequence: Judith (or wherever Josh
redirects — confirm before assuming). Full detail: `RESUME_PROJECT_NOTE.md`.

## 3. Translation source registry — what exists, and its real limitations

**KJV** — `aruljohn/Bible-kjv-1611` (GitHub, public, `git clone` it directly). Genuine 1611
original-spelling edition. Confirmed clean, no limitations found. Reusable for any book, no
need to re-ask Josh.

**DRB** — `janvier-s/original-douay-rheims` (GitHub, public, USFM format). Genuine original 1610
Douay-Rheims (not the later Challoner/DRC revision — that's a *different, wrong* edition, a
near-miss already made once). Confirmed clean. Reusable directly.

**Rotherham** — witness recorded at `documentation/rotherham-source-witness-intake.json`.
**A Josh-supplied XML (`Rotherhams_Emphasized_Bible__1902_.xml`) exists but is NOT usable as a
diff source** — confirmed to be a degraded OCR transcription: missing the emphasis-dashes that
define this translation, plus real scanning errors (verified against independent sources). If
re-verifying Rotherham for a future book, check the app's text directly against independent web
sources (studylight.org, studybible.info) rather than reusing that XML file.

**NRSV** — no legitimate public source (copyrighted). Two Josh-supplied SQLite files exist,
**both are full-Bible databases, not Genesis-only** (confirmed: `book_number`-keyed `verses`
table covering all books) — but **they live only in whichever sandbox session received them,
not in this repo, and will NOT persist to a new session.** Josh will need to re-supply them.
When he does:
  - `NRSV-CI.SQLite3` ("Catholic Interconfessional," 1989, American spelling) — **use this one
    for actual diffing.** Matches the app's own conventions closely; its own bundled audit table
    confirms no structural corruption.
  - `NRSVACE.SQLite3` (Anglicised Catholic Edition) — has its own real Catholic-edition
    editorial layer plus British spelling/idiom on top. **Do not use for full diffing** — it
    generates large false-positive noise. Useful only for landmark-verse cross-confirmation.

**NABRE** — no legitimate public source (copyrighted). A Josh-supplied `nabre.json` exists,
**confirmed a full 73-book file, not Genesis-only** — but again, **sandbox-local, will not
persist.** Josh will need to re-supply it. Real limitation when using it: **it has the same
chapter/section-heading pollution baked in as the app's own data** (same processing origin,
evidently) — not directly diffable verse-for-verse, but useful for deriving a heading-strip
pattern (it kept a dash marker the app's data dropped) and for content-verification once headers
are stripped from both sides. Don't expect a clean direct diff the way KJV/DRB/NRSV-CI give you.

**Alexander Campbell's "The Living Oracles"** — Lucy is converting this from XML to JSON as a
side project (Josh's initiative), into separate files, not yet delivered as of this writing.
When it arrives: full verify-before-trust, same as everything else — she has a real history of
false certifications on this exact corpus (the KJV/NABRE prefix defect this session fixed was
hers, certified fixed, confirmed still broken).

## 4. Standing rules, easy to forget mid-task

- **Verify edition identity on a landmark, distinctive verse before trusting any diff.** This
  corpus consistently uses original historical editions (1611 KJV, 1610 DRB, 1989-base NRSV),
  not modern ones. Multiple wrong-edition near-misses happened before this became automatic.
- **A newly-supplied source is not automatically better than what's already there.** Check
  quality before assuming a diff's mismatches mean the app is wrong — the Rotherham XML was the
  deficient side, not the app.
- **A book is not green/done while any known problem remains, however minor.** (Josh's rule,
  2026-07-11.) Finish mechanical fixes before calling a book complete.
- **Patch workflow, every time:** verify against a *fresh* clone before delivering a patch;
  `node --check` the dashboard's extracted `<script>` block after any edit to it; `git diff
  --stat` sanity-check that the changed-line count matches what you intended, nothing more.
- **When handing Josh a patch:** tell him to confirm the real filename via `ls *.patch` (or
  `ls scripts/*.patch` if that's where they land) rather than retyping names by hand. If `git am`
  fails partway, the fix is almost always `rm -rf .git/rebase-apply` then `git status` to confirm
  clean before retrying — don't let him guess at git surgery mid-failure.

See `documentation/BIBLICAL_REMEDIATION_METHODOLOGY.md` for the full detail behind every rule
above, and `AUDIT_GOVERNANCE_LEDGER.md` for the complete session-by-session history.
