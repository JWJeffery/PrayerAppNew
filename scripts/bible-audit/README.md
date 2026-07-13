# Bible audit tooling

Reusable Python functions for the five-translation (KJV/Rotherham/DRB/NABRE/NRSV)
book-by-book audit described in `AUDIT_GOVERNANCE_LEDGER.md` and `RESUME_PROJECT_NOTE.md`.

## Setup (each session, sources are not vendored into this repo)

```bash
# KJVA + Rotherham (sparse checkout, full clone times out)
git clone --filter=blob:none --no-checkout https://github.com/scrollmapper/bible_databases.git bible_databases_batch
cd bible_databases_batch
git sparse-checkout init --no-cone
echo "formats/json/KJVA.json" > .git/info/sparse-checkout
echo "formats/json/Rotherham.json" >> .git/info/sparse-checkout
git checkout
cd ..

# DRB source (USFM, Vulgate book naming -- see naming note below)
git clone https://github.com/janvier-s/original-douay-rheims.git

# NRSV-CI is already in this repo:
unzip -o data/kalendar/source-witnesses/NRSV-CI.zip -d nrsv_batch
```

Then adjust the hardcoded paths at the top of `audit_book.py` to match your
session's directory layout, or symlink `bible_databases_batch`,
`original-douay-rheims`, and `nrsv_batch` into `/home/claude/`.

## Usage

```python
from audit_book import *

kjv_mismatches, roth_mismatches = audit_kjv_rotherham(app_json_path, kjv_book_name)
drb_mismatches, drb_chapter_diffs = audit_drb(app_json_path, usfm_filename)
nabre_mismatches, err = audit_nabre(app_json_path, nabre_book_name)
nrsv_changes, n_tag_anomalies, total_source_rows = audit_nrsv(app_json_path, nrsv_book_number)
```

## Known naming gotchas (check before assuming a book is "missing")

- **KJVA/Rotherham** (scrollmapper): uses Roman numerals for split books --
  `"I Samuel"`, `"II Samuel"`, `"I Kings"`, `"II Kings"`, `"I Chronicles"`,
  `"II Chronicles"`, etc. Not `"1 Samuel"`.
- **DRB source** (janvier-s, USFM): uses Vulgate names/numbering for several
  books. Confirmed so far: `josue.usfm` (Joshua), `1-kings.usfm` through
  `4-kings.usfm` (Vulgate's 4-book Kings scheme -- 1-2 Kings there =
  common 1-2 Samuel, 3-4 Kings there = common 1-2 Kings),
  `1-paralipomenon.usfm`/`2-paralipomenon.usfm` (1-2 Chronicles),
  `isaie.usfm`, `jeremie.usfm`, `ezechiel.usfm`, `osee.usfm`, `abdias.usfm`,
  `micheas.usfm`, `habacuc.usfm`, `sophonias.usfm`, `aggeus.usfm`,
  `zacharias.usfm`, `malachie.usfm`, `ecclesiasticus.usfm` (Sirach),
  `apocalypse.usfm` (Revelation). Run `ls usfm/` in a fresh clone before
  assuming a book isn't there.
- **NABRE source** (`data/kalendar/source-witnesses/nabre.json`): standard
  English names as top-level `"book"` keys (`"1Samuel"`, no space).
- **NRSV-CI** (`data/kalendar/source-witnesses/NRSV-CI.zip`, SQLite):
  numeric `book_number` per book, query the `books` table by `long_name`
  to find it per book rather than hardcoding.

## Known bug classes to check for on every book (not just headers)

1. **NABRE chapter-heading pollution** -- corpus-wide pass closed
   2026-07-12 (742 verses), but always re-check each book directly rather
   than assuming coverage.
2. **NABRE stray-space bug** -- a family of formatting artifacts (`"Lord
   's"` instead of `"Lord's"`, stray space before/after em-dashes and
   curly quotes). Confirmed recurring in every book checked since Genesis.
   Always run a full content-level NABRE check, not just a header check.
3. **NABRE over-stripped content** -- confirmed in Exodus 2026-07-13: the
   original cross-cutting fix occasionally consumed real narrative content
   along with a chapter header when no short subtitle was present. Check
   for this by measuring the length of whatever gets stripped from the
   front of each chapter-opening verse -- genuine titles are consistently
   under ~35 characters; anything much longer is likely real content.
4. **DRB source-shape exceptions** -- check
   `data/bible/registry/canonical-ot-drb-active-row-source-shape-blockers.json`
   before treating any DRB chapter-count mismatch as a new defect. It may
   already be catalogued as a governed, intentional structural boundary.
5. **Blind regex fixes need per-instance re-verification.** Every
   pattern-based fix applied across a whole file in this project has, at
   least once, altered a verse that wasn't actually broken (Numbers 21:18,
   Exodus 15:17, and a third instance in 1 Samuel -- all caught before
   shipping by individually re-checking every change against source).
6. **NABRE chapter-boundary versification shifts** -- confirmed in
   Nehemiah 2026-07-13: NABRE's own official chapter numbering can
   genuinely differ from the common numbering every other translation
   (and this app's active grid) uses. Nehemiah 3:33-38 in NABRE's own
   numbering is common Nehemiah 4:1-6 -- NABRE's own chapter 4 begins at
   what everyone else calls 4:7. `audit_nabre`'s naive same-address
   comparison can't detect this: it will either report a long, confusing
   run of "mismatches" (if the app already has some other book's content
   misplaced there) or silently report zero mismatches while the app
   holds flatly wrong content, if a prior population pass copied NABRE's
   raw verse-N content into the app's verse-N slot without adjusting for
   the shift. Confirmed via `bible.usccb.org` (the official NABRE host)
   against the passage in question before touching anything -- always
   verify a suspected boundary shift against the official host, not just
   internal consistency. If a future book's audit turns up content at
   consecutive addresses that reads like two different scenes spliced
   together, or a chapter's `nabre.json` verse count doesn't match the
   number of common-numbering verses it should span, check for this
   specifically before assuming it's just another instance of the
   stray-space or over-stripping bugs.
