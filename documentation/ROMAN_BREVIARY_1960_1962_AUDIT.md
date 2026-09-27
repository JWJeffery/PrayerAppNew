# Roman Breviary 1960/1962 — Narrow Audit Findings

**Status:** ACTIVE — first pass, 2026-09-27.
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
| 5 | Envelope conformance | **FAIL** — 16 blocks use roles outside the closed taxonomy; disclosed, not yet fixed |

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
- **Honest disclosure, not fabrication.** The report's `lane_status` correctly shows
  `vulgate_clementine: "missing"` and `vulgate_psalter: "missing"` rather than inventing Latin
  scripture bodies, and every psalm appointment's `numbering_status` is explicitly
  `"roman_breviary_source_appointment_numbering_not_yet_normalized"` rather than guessing a modern
  vs. Vulgate psalm number. This is the correct posture per architecture §13 ("honest degradation
  over fabrication").

---

## Check 5 — Envelope conformance: FAIL, disclosed, not fixed this pass

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

**Not fixed, not silently accepted either** — tracked here and re-checked automatically by
`scripts/audit-roman-breviary-1960-narrow-checks.mjs`'s check 5 on every future run, so it cannot go
stale the way other findings in this repo have (`documentation/OPEN_ITEMS_FIXABILITY.md`'s own
"Standing lessons" section is the precedent for why an automated re-check beats a note that says
"still open" from memory).

---

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
