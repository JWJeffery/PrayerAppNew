# Roman Breviary 1960/1962 — Narrow Audit Findings

**Status:** ACTIVE — first pass 2026-09-27, sourcing addendum 2026-09-27 continued, Check 5 fixed
2026-09-27 continued further.
**Scope discipline:** `documentation/ROMAN_BREVIARY_1960_1962_ARCHITECTURE.md` §15 is explicit that this
lane "runs no broad audit campaign." Audits here are limited to the five named narrow checks:
import integrity, JSON validity, manifest validity, reference resolution, and envelope conformance.
This document only covers those five. It is **not** a line-by-line liturgical-content audit like
`HOROLOGION_AUDIT_FINDINGS.md` — that kind of campaign is out of scope for this lane by its own
governing document, because the content is mirrored/normalized from Divinum Officium's own build-time
oracle, not natively authored here (§9, §14).

**Audited against:** the dev vertical slice only — one day (2026-11-02, All Souls), one hour
(Matins) — since that is the entire corpus that exists for this lane so far. This is the lane's
"Roman Breviary dev" mode, currently `hidden`/`app-advanced-only` in `index.html` and not shown to
testers.

**Re-run this audit** with `node scripts/audit-roman-breviary-1960-narrow-checks.mjs`. All five
checks are scripted and re-runnable as the slice grows past one day/one hour.

---

## Result summary

| # | Check (§15) | Result |
|---|---|---|
| 1 | Import integrity | **PASS**, after one fix (below) |
| 2 | JSON validity | **PASS** — all 5 JSON files parse clean |
| 3 | Manifest validity | **PASS** — 26/26 `unit_refs` resolve, no orphans |
| 4 | Reference resolution | **PASS** — all bible-binding path/existence/verse-count claims verified |
| 5 | Envelope conformance | **PASS** — was FAIL (16 non-conformant blocks), fixed 2026-09-27 continued further (below) |

---

## Check 1 — Import integrity: FIXED

**Method.** Fetched both files the lane actually mirrors
(`web/www/horas/Latin/Sancti/11-02.txt`, `web/www/horas/Latin/Commune/C9.txt`) from
`raw.githubusercontent.com/DivinumOfficium/divinum-officium` at the pinned commit
(`0ce8747d7dba3276fc05937635e02360b49a60a6`) and diffed byte-for-byte against the local mirror.
**Both are byte-identical to the pinned commit.** No drift.

**Real finding, fixed.** `source/divinum-officium/source-pin.json`'s own `mirrored_files` list
named only `Sancti/11-02.txt`. `Commune/C9.txt` is also mirrored on disk and is the file most of the
dev slice's own content actually comes from (`11-02.txt` is mostly a rubric/reference file that
points `@Commune/C9` for the bulk of its readings and responsories — see Check 5 below for the
detail) — but it was never added to the declared list. Corrected `mirrored_files` to include both
files, then regenerated `units/dev-vertical-slice.json` and `manifests/2026.json` by re-running
`scripts/build-roman-breviary-1960-dev-slice.mjs` (both files embed a copy of `source_pin` at build
time, so hand-editing them separately would have risked drift from the one script that is the real
source of truth). The regeneration touched only the `mirrored_files` array in both files — confirmed
by diff before committing.

---

## Check 2 — JSON validity: PASS

All five JSON files under `data/roman-breviary-1960-1962/` parse cleanly:
`source/divinum-officium/source-pin.json`, `units/dev-vertical-slice.json`, `manifests/2026.json`,
`bible-bindings/dev-vertical-slice.json`, `bible-bindings/vulgate-source-lane-plan.json`.

---

## Check 3 — Manifest validity: PASS

Every `unit_refs` entry anywhere in `manifests/2026.json` (walked recursively through nested
`blocks`) resolves to a real key in `units/dev-vertical-slice.json`: 26 of 26. No unit is defined
and never referenced (no orphans).

---

## Check 4 — Reference resolution: PASS

`bible-bindings/dev-vertical-slice.json` makes concrete, checkable claims about scripture citations.
All were verified directly, not taken on trust:

- **File-existence claims.** All 6 distinct file paths it claims `exists: true` for
  (`data/bible/OT/job.json`, `data/bible/translations/drb-original-douay-rheims/raw/job.json`,
  `data/bible/NT/1corinthians.json`, `.../1-corinthians.json`, `data/bible/OT/psalms.json`,
  `.../psalms.json`) really exist.
- **Verse-count arithmetic.** For every scripture reading, `verse_end - verse_start + 1` was checked
  against the report's own `verses_present` claim: Job 7:16-21 (6), Job 14:1-6 (6), Job 19:20-27 (8),
  1 Cor 15:12-22 (11), 1 Cor 15:35-44 (10), 1 Cor 15:51-58 (8) — all match.
- **Chapter length sanity.** Independently confirmed 1 Corinthians 15 actually has 58 verses in the
  shared corpus (`data/bible/NT/1corinthians.json`), so the 15:51-58 citation is not reaching past the
  end of the chapter.
- **Latin text fidelity, spot-checked against the mirrored source directly** (beyond what the
  bible-binding report itself claims, but relevant to the same "does this reference actually
  resolve" question): `lectio1`/`lectio2`/`lectio3`'s `source.path`/`section` point at
  `Commune/C9.txt`'s `[Lectio1]`/`[Lectio5]`/`[Lectio8]` respectively — an odd-looking mismatch (why
  does the app's lectio2 point at C9's *Lectio5*?) until read against `Sancti/11-02.txt` itself:
  its own `[Lectio2]` section is nothing but `@Commune/C9:Lectio5` — a pointer, in Divinum
  Officium's own file format, saying "use C9's Lectio5 here." The unit correctly followed the
  upstream's own indirection rather than assuming a naive 1-to-1 mapping. Text was compared
  word-for-word against the mirrored source for all six `lectioN` units (1, 2, 3, 7, 8, 9) —
  exact matches, no truncation, no misattribution.
- **Honest disclosure, not fabrication — at the time of this first pass.** The report's
  `lane_status` at this point in the pass still showed `vulgate_clementine: "missing"` and
  `vulgate_psalter: "missing"` — not inventing Latin scripture bodies in their place — and every
  psalm appointment's `numbering_status` was explicitly `"...not_yet_normalized"` rather than
  guessing a modern vs. Vulgate psalm number. Correct posture per architecture §13 ("honest
  degradation over fabrication"), even though (see the addendum below) `"missing"` itself turned
  out to be a report bug rather than the true state of those two lanes.

---

## Check 5 — Envelope conformance: FIXED 2026-09-27 continued further

**FIXED — see the "Fix, 2026-09-27 continued further" section below for what actually changed.**
The account immediately below is preserved exactly as originally written when the defect was found
and disclosed, not yet fixed, so the record shows what was actually found versus what was later
done about it — same discipline `HOROLOGION_AUDIT_FINDINGS.md` uses for its own corrections.

### Original finding, disclosed 2026-09-27, not fixed at the time

**The defect.** `manifests/2026.json`'s Matins blocks use four `role` values that are **not**
members of the Core Contract's closed block-role taxonomy
(`UNIVERSAL_OFFICE_CORE_CONTRACT.md` §7: `opening`, `psalmody`, `reading`, `canticle`, `hymn`,
`creed`, `doxology`, `prayer`, `intercession`, `antiphon`, `rubric`, `dismissal`, `other`):

| Invented role | Count | Label example |
|---|---|---|
| `invitatory` | 1 | "Invitatorium" |
| `nocturn` | 3 | "Nocturnus I/II/III" (a structural container, not a liturgical unit) |
| `versicle` | 3 | "Versiculum" |
| `responsory` | 9 | "Responsorium I–IX" |

13 blocks (`psalmody` ×3, `reading` ×9, `dismissal` ×1) are already conformant.

**This is not a new mistake — it is a known anti-pattern reproduced independently.**
`js/office-ui.js` (~line 3556, comment dated 2026-09-24) records that `js/anglican-envelope.js`'s
own `ROLE_BY_LABEL` table was *already found* to contain several non-compliant role strings,
**including literally `invitatory`** (also `penitential`, `collect`, `lords-prayer`, `thanksgiving`,
`suffrages`) — flagged there as "a pre-existing Anglican discrepancy, out of scope to fix here, but
not one to copy into a new lane." The Roman Breviary dev slice copied it into a new lane anyway,
independently, presumably because "Invitatorium" reads naturally as "the invitatory block" without
anyone re-checking it against §7's actual closed list.

**The fix pattern already exists in this repo and should be reused, not reinvented.** The same
comment block describes how the Horologion lane (Phase 5, `HOR_ROLE_BY_TYPE`) solved the identical
two problems:

1. **Non-fitting roles → `other`, never a stretched or invented role.** Per §7 rule 3: "If it does
   not fit, it is `other` plus a native label, not a stretched role." `versicle` and `responsory`
   do not match any existing category (they are not `antiphon`, not `reading`, not `prayer`) and
   should become `other` with their existing native `label` kept as-is. `invitatory` has an exact,
   non-stretched fit already in the taxonomy's own stated definition — `opening`: "Invitatory /
   opening versicles / introductory material" — and should be remapped there, not to `other`.
2. **Structural containers do not get a role/block of their own.** The Horologion lane's own
   comment: "a sequence is structural grouping, not a liturgical unit; each child already gets its
   own block at the same granularity every other item type uses." `nocturn` is exactly this case —
   it groups psalmody/versicle/reading/responsory children but is not itself one of the twelve
   structural categories. The correct shape is almost certainly to drop the `nocturn` block level
   entirely and either (a) fold the nocturn number into each child's native `label` (e.g. "Psalmi et
   antiphonae — Nocturnus I"), or (b) carry it as a lane-native passthrough field on each child
   rather than as a `role`. Either preserves the information a user needs without inventing a role.

**Why this was disclosed rather than fixed in this same pass.** Fixing it means restructuring the
manifest's nesting (dropping/reshaping the `nocturn` level) and updating the one place that
currently depends on the exact string `'nocturn'` for CSS: `js/roman-breviary-1960-1962-dev-slice.js`
line 87 (`block.role==='nocturn'?'rb1960-block rb1960-nocturn':'rb1960-block'`). That is real
structural/rendering work, not a "narrow check," and rushing it risks introducing a new defect on top
of disclosing this one. Per architecture §13, an honest disclosed gap is preferable to a hasty fix.
This finding is the concrete next task for this lane.

**At the time of disclosure**: tracked here and re-checked automatically by
`scripts/audit-roman-breviary-1960-narrow-checks.mjs`'s check 5 on every future run, so it couldn't
go stale the way other findings in this repo have (`documentation/OPEN_ITEMS_FIXABILITY.md`'s own
"Standing lessons" section is the precedent for why an automated re-check beats a note that says
"still open" from memory).

### Fix, 2026-09-27 continued further — Josh: "go fix the Check 5 role-taxonomy finding"

Applied exactly the plan disclosed above, no changes to its reasoning:

- **`scripts/build-roman-breviary-1960-dev-slice.mjs`** (the manifest generator — fixed at the
  source, not by hand-editing the generated JSON, same discipline as Check 1's fix): `invitatory` →
  `opening`; `versicle` and `responsory` → `other` with their native `label`s kept unchanged
  ("Versiculum", "Responsorium I"–"IX"). The `nocturn` container block is gone entirely — each of
  its former children (`psalmody`, the now-`other` versicle, `reading` ×3, the now-`other`
  responsory ×3) instead carries two new lane-native passthrough fields, `nocturn` (1/2/3) and
  `nocturnLabel` ("Nocturnus I/II/III"), exactly option (b) from the disclosed plan — a plain field
  the shell passes through untouched (Core Contract §6), not a role. `manifests/2026.json` and
  `units/dev-vertical-slice.json` regenerated from this script, not hand-edited.
- **`js/roman-breviary-1960-1962-dev-slice.js`**: removed the `block.role==='nocturn'` CSS-class
  check (dead now — no block ever carries that role again). Added `groupByNocturn()`, which groups
  the now-flat block list by consecutive `nocturn` value and renders one `<h3>` "Nocturnus N"
  heading per group in a `.rb1960-nocturn-group` wrapper, with that group's own blocks rendered one
  level down (`<h4>`) — the exact same two-level heading hierarchy the old nested-block rendering
  produced, just driven by the passthrough field instead of a role. Ungrouped blocks (Invitatorium,
  Conclusio) render unchanged, at the top level (`<h3>`).
- **`css/office.css`**: renamed `.rb1960-nocturn` → `.rb1960-nocturn-group` / `.rb1960-nocturn-
  heading` to match, no change to the actual rules (same border, spacing, uppercase letter-spacing,
  gold `h4` sub-heading styling as before). Cache-bust `office.css v227 → v228`.

**Verified, not just asserted:**
- `node --check` clean on both touched JS files.
- Re-ran `scripts/audit-roman-breviary-1960-narrow-checks.mjs`: **0 failing, 2 warning** (the 2
  warnings are Check 1's already-expected "sample, not exhaustive" disclosures, unrelated to this
  fix) — all five checks pass for the first time this lane has had five to pass.
- **Live-verified in headless Chromium**, not just Node: served the repo, loaded
  `index.html?entry=roman-breviary-dev`, inspected the rendered DOM directly. Confirmed: 26 total
  blocks (1 `opening` + 24 nocturn-grouped + 1 `dismissal`, down from 29 — the 3 removed `nocturn`
  container blocks, nothing else); exactly 3 `.rb1960-nocturn-group` elements labeled "Nocturnus
  I"/"II"/"III"; every grouped block's heading renders as `<h4>` and both ungrouped blocks
  (Invitatorium, Conclusio) render as `<h3>`, matching the pre-fix visual hierarchy exactly; zero
  console errors beyond the pre-existing sandboxed font-CDN failure this project already documents
  elsewhere as unrelated. Screenshot confirmed the "NOCTURNUS I" heading, gold sub-headings, and
  hairline separator all render identically to the intended design — the taxonomy fix produced no
  visible regression.
- Re-ran `scripts/build-roman-breviary-1960-bible-binding-report.mjs` afterward: still resolves
  cleanly (`block_label` lookups walk the now-flat manifest the same way; nothing there depended on
  the old nesting).

This closes the last open narrow-check finding from this lane's first audit pass. All five checks
now pass against the dev vertical slice.

---

## Addendum, 2026-09-27 continued — sourcing pass: "have every source in place before we begin"

Josh, before continuing the audit: identify what sources exist for this lane, on the premise that
other open-source Divinum-Officium-based apps might supply content or fixes this lane is missing.
Findings below; decisions confirmed with Josh via `AskUserQuestion` before importing anything.

### What was actually found

**No independent "apps" — the Divinum Officium forks are just forks.** A search turned up several
GitHub repos named `divinum-officium` (ofrades, JorgeRaimundo, ntvangoor, mpdc-p, FAJ-Munich,
dimon-CH-GE, gustavo-depaula, jjh-servi). All are plain forks/mirrors of the primary repository —
no independent content, nothing to add to §5's triage. `2br-2b/Open-Breviary` was already correctly
rejected there.

**A real bug, not a real gap: the bible-binding report hardcoded two lanes as "missing."**
`scripts/build-roman-breviary-1960-bible-binding-report.mjs` had `vulgate_clementine: 'missing'`
and `vulgate_psalter: 'missing'` as **literal string constants** (lines 244-245 as found) — never
an `exists(...)` check, unlike the `drb_original` line right beside them which correctly checks the
filesystem. Both lanes already existed: `data/bible/translations/vulgate-clementine/` and
`.../vulgate-psalter/`, imported 2026-06-21, populated with exactly the passages the dev slice cites.
Fixed: both are now computed with the same `exists(...)` check `drb_original` already used.

**Those existing lanes were real but thin, and said so themselves.** Their manifests carried
`"source_status": "pilot_source_selected_pending_full_..._adjudication"` — a bounded scrape of
`https://catholicbible.online/vulgate` (2 books, 4 chapters, 130 verses for Job/1 Corinthians; 9
individual psalms for the Psalter), explicitly bounded to only the verses the dev slice happened to
cite. Not something to build a growing audit on.

**Adopted `seven1m/open-bibles`** (public domain, actively maintained, pinned commit
`f257a3559025c3f873b48a75019f53a9354ed7de`) as the new source for both lanes, per Josh's
confirmation. Its `lat-clementine.usfx.xml` is the full 73-book Clementine Vulgate, tracing to the
Vulsearch/Tweedale Clementine Vulgate Project — recorded in `ROMAN_BREVIARY_1960_1962_
ARCHITECTURE.md` §5. New script `scripts/import-bible-translation-open-bibles-vulgate.mjs` fetches
the pinned XML, caches it verbatim at `data/roman-breviary-1960-1962/source/open-bibles/lat-
clementine.usfx.xml`, and extracts:

- **Full Job** (42 chapters, 1070 verses) and **full 1 Corinthians** (16 chapters, 437 verses) into
  `vulgate-clementine/raw/` — not just the cited chapters, so the lane doesn't need re-sourcing the
  next time the dev slice grows to a new day.
- **Full Psalms** (150 psalms, 2527 verses) into `vulgate-psalter/raw/psalms.json` — likewise not
  just the 9 psalms currently appointed.

Spot-checked the extraction directly against the raw XML for Job 7:16-21 and Psalm 5 (word for word,
including verse 1's inscription/title line) — exact. The old CatholicBible.online-sourced importer,
`scripts/import-roman-breviary-1960-catholicbible-vulgate-pilot.mjs`, is marked superseded in a
header comment (kept for history, not deleted, not to be re-run).

**Mirrored Divinum Officium's own Latin + English Psalter** (per Josh's confirmation) — it was
already sitting in the pinned primary source, unmirrored: `web/www/horas/Latin/Psalterium/
Psalmorum/` and the parallel `.../English/Psalterium/Psalmorum/` (150 psalms each, 202 files
apiece counting Ps.118's subdivided sections), verse-aligned Latin/English, already in the
Breviary's own native numbering. Extracted via `git archive <pinned commit>` from an authenticated
fetch of that exact commit SHA (not a raw-HTTP scrape), so content integrity is already covered by
git's own object hashing. `source-pin.json` gained a new `mirrored_directories` field (bulk mirrors
don't fit a flat `mirrored_files` list well at 202 files apiece) and the narrow-check script's
Check 1 was extended to handle it: directory existence, a file-count, and a bounded byte-for-byte
sample (5 files) against the pinned commit, explicitly logged as a sample, not exhaustive.

**A real, useful side effect: the psalm-numbering question is now genuinely checkable, not just
assumed.** `vulgate-psalter/manifest.json` records the confirmation directly: Psalm 5 verse 1 is the
Latin inscription/title ("In finem, pro ea quae haereditatem consequitur. Psalmus David."), verse 2
onward is the numbered body, and verse 2 ("Verba mea auribus percipe, Domine...") matches Nocturnus
I's own appointed antiphon verbatim — Vulgate/Gallican numbering **is** the Breviary's native
numbering, no Hebrew/modern-numbering conversion needed for this pre-Vatican-II lane. The
bible-binding-report script now runs a real check for this per appointment (matching the antiphon's
opening words against the Vulgate psalter's own text, not just asserting it): 7 of 9 current
appointments verify this way; the other 2 don't match this specific incipit-substring check because
their antiphons paraphrase/recombine psalm phrases rather than quoting the opening verse
contiguously (confirmed by inspection, not a numbering problem) — those 2 correctly keep the
`not_yet_normalized` status rather than being force-marked resolved.

**A real content question, disclosed per Josh's third confirmed decision — do not rule on it without
a real printed source.** Diffed all 6 scripture-reading units in the dev slice against the newly
full Vulgate text, verse-range by verse-range:

| Unit | Result |
|---|---|
| `lectio1` (Job 7:16-21) | **Differs** — DO's text opens directly with "Parce mihi, Domine..."; the full Vulgate verse 16 opens "Desperavi: nequaquam ultra jam vivam: parce mihi..." — DO's Matins lesson appears to start mid-verse. |
| `lectio2` (Job 14:1-6) | Differs only by "nunquam" vs "numquam" — an orthographic variant of the same word, not a substantive difference. |
| `lectio3` (Job 19:20-27) | Identical. |
| `lectio7` (1 Cor 15:12-22) | **Differs** — verse 12 in DO reads "Si Christus praedicatur..."; the full Vulgate has "Si autem Christus praedicatur..." — DO's text is missing the connective "autem." |
| `lectio8` (1 Cor 15:35-44) | **Differs** — verse 38 has a variant ("et"/"ut" and different punctuation), and DO's lesson ends at "...surget corpus spiritale," where the full Vulgate verse 44 continues "Si est corpus animale, est et spiritale, sicut scriptum est:" — DO's Matins lesson appears to end mid-verse. |
| `lectio9` (1 Cor 15:51-58) | Identical. |

**Read together, `lectio1` and `lectio8` look like the same, unremarkable pattern**: Roman Breviary
Matins lessons are traditionally excerpted to a sensible clause boundary, not mechanically bound to
the full text of whichever verses their citation names — starting or ending mid-verse to complete a
thought is normal liturgical practice, not necessarily an error in either source. `lectio7`'s single
missing "autem" looks more like an isolated transcription variant between two different digitizations
of the Clementine Vulgate. **None of this was adjudicated here** — per Josh's explicit instruction,
resolving which reading is authentically what the 1960/1962 Breviary prints needs a real printed
edition to check against (the same discipline the Horologion audit uses for Maclean/UNABHOR1997),
not a guess from two competing digital sources. Recorded here as a disclosed, open question for
whoever runs the actual line-by-line content audit this lane's architecture doc otherwise defers.

**A third stale report, found while regenerating the second.** `bible-bindings/vulgate-source-lane-
plan.json` (generated by `scripts/build-roman-breviary-1960-vulgate-lane-plan.mjs`) also claimed
`vulgate_clementine_available: false` / `vulgate_psalter_available: false` and listed both as
`required_missing_lane_ids` — but its own generator reads `js/bible-browser/bible-source-lane-
adapter.js` directly, and that adapter has carried both `VULGATE_CLEMENTINE` and `VULGATE_PSALTER`
lane entries since the original 2026-06-21 pilot import. Not a hardcoded-string bug like the other
two — just never regenerated after the adapter changed. Re-ran the generator; it now correctly shows
both lanes available, zero missing, and (since it reads the bible-binding report) picked up the
psalm-numbering verification improvement automatically.

**Re-ran the full narrow-check suite after all of the above**: checks 1-4 still pass clean (now
against the real sources, not the thin pilot); check 5's disclosed finding is unchanged (still 16
non-conformant blocks — this pass didn't touch that).

## What this pass deliberately did not do

- **No broad liturgical-content audit.** Per architecture §15, that campaign is explicitly out of
  scope for this lane. The Latin text itself was spot-checked only as far as needed to verify Check
  4's citation claims (word-for-word against the mirrored source) — that is verification the citation
  *resolves correctly*, not a liturgical-correctness review of the Breviary content as such.
- **No attempt to clear governance gates for a fuller corpus.** `ROMAN_BREVIARY_1960_1962_
  PREIMPORT_GATES.md`'s five gates are already recorded as decided; this pass did not revisit them.
- **No dashboard/`SEED_VERSION` update in `audit-ledger.html`.** That dashboard tracks the broad,
  cross-tradition liturgical audit campaign (Horologion, East Syriac, Coptic, Ethiopian, etc.) that
  this lane's own architecture document explicitly exempts itself from. Adding a row there would
  misrepresent this lane as part of a campaign it is deliberately not part of. This document, plus
  the dated entry in `AUDIT_GOVERNANCE_LEDGER.md`, is this lane's own record instead.
