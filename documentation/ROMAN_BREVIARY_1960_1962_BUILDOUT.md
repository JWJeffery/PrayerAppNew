# Roman Breviary 1960/1962 — Full Build-Out (Minimum Shippable Floor)

**Status:** MINIMUM SHIPPABLE FLOOR REACHED — all 6 phases complete, 2026-09-27. All 8 hours, the
Roman general calendar, Rubrics 1960/1962, Latin, full calendar years 2026 and 2027, precomputed.
**Authorization:** Josh: "Yes I want to build out the whole thing" — the full minimum shippable
floor per `ROMAN_BREVIARY_1960_1962_ARCHITECTURE.md` §10: all 8 hours, the Roman general calendar,
Rubrics 1960/1962, Latin only, current+next year precomputed.

This document tracks the build-out itself (a construction project), distinct from
`ROMAN_BREVIARY_1960_1962_FULL_AUDIT.md` (a content audit of what already existed) and
`ROMAN_BREVIARY_1960_1962_AUDIT.md` (the original narrow-check audit). Where this build-out finds
and fixes a defect in already-shipped content, the fix is recorded in both this document and the
audit doc that originally covered that finding — cross-referenced, not duplicated as the primary
account.

---

## The unlock: Divinum Officium's own Perl engine runs offline

Confirmed this session: `web/cgi-bin/horas/officium.pl`, the primary DivinumOfficium source repo's
own rubrical engine, runs from the command line with no live server and no network access — the
same real, rubrically-correct output the public site produces, for any date/hour/rubric-version:

```
PERL5LIB="web/cgi-bin:web/DivinumOfficium" perl web/cgi-bin/horas/officium.pl \
  "version=Rubrics 1960" "command=prayMatutinum" "date=11-2-2026" \
  "lang2=Latin" "dioecesis=Generale"
```

Dependencies (`libcgi-pm-perl` and related) installed via `apt-get` in this environment. Runs in
~0.27s/call — 2 years × 8 hours ≈ 5,840 calls ≈ 25 minutes single-threaded, trivially parallelizable.
Confirmed to handle real occurrence/concurrence/precedence transparently (tested Christmas Vespers
and an ordinary weekday with a rank conflict; both rendered correctly with zero code on our side).

This is architecture §9's "hybrid Divinum-oracle manifest strategy" as originally designed — Divinum's
own build-time output as the resolver oracle — just not previously implemented that way. The prior
approach (hand-tracing `specmatins.pl`/`orationes.pl` etc. into JS, one rubric at a time) does not
scale to 8 hours × ~730 days and is superseded by this pipeline going forward.

## Governance-gate decisions (architecture §16)

Confirmed with Josh, 2026-09-27:

1. **Source pin**: stays `0ce8747d7dba3276fc05937635e02360b49a60a6` (unchanged from the existing
   pin). The separate engine clone used to run the oracle (`/home/user/divinumofficium/divinum-
   officium`, outside this repo) is checked out to this exact commit before any oracle run, so the
   oracle's output is provably from the same source already mirrored and audited here.
2. **Unit-key convention**: **content-addressed** — `key = "rb1960.la.unit." + sha1(kind + "|" +
   citation + "|" + text)`. Replaces the prior day-scoped slug convention
   (`rb1960.la.sancti.11-02.oratio-matutinum`) for all newly-generated content going forward.
   Identical content appearing on many different days/hours automatically collapses to one stored
   unit.
3. **Year range**: full calendar years **2026 and 2027** (2026-01-01 through 2027-12-31, 730 days),
   not just from-today-forward.

## Pipeline

- `scripts/roman-breviary-oracle-run.mjs` — verifies the engine clone is at the pinned commit
  (throws if not), shells out to `officium.pl` for a given `(isoDate, hourKey)`, strips the
  `Set-Cookie`/`Content-type` header lines, returns the HTML body. Hour-key → Divinum command-name
  mapping: matins→Matutinum, lauds→Laudes, prime→Prima, terce→Tertia, sext→Sexta, none→Nona,
  vespers→Vespera, compline→Completorium (same names `regress/scripts/util.sh`'s own
  `hour_command()` uses).
- `scripts/parse-officium-html.mjs` — parses the HTML into an ordered list of sections
  (`{label, annotation, nocturn, lines[], rubricNotes[], omitted}`), tracking running
  section/nocturn state across the page's per-position `<TR><TD>` blocks (each such block is one
  numbered position in Divinum's own rendering, e.g. `Matutinum1`, `Matutinum2`, ...). Recognizes:
  bold-italic section headers (optionally with a `{...}` appointment-source annotation, or
  `{omittitur}` marking a genuinely-omitted section — an honest empty result per Core Contract §11,
  not an error); antiphon/versicle/response lines; verse-numbered psalm/lesson lines; a psalm-number
  citation line; a `Nocturnus N` label; drop-cap-styled paragraph lines (orations, hymns, the
  Invitatorium's Venite, the Pater Noster body); and small-red plain-rubric lines (e.g. "Pater Noster
  dicitur totum secreto"), which open their own short-lived rubric section and then resume the
  interrupted section afterward.
- `scripts/build-roman-breviary-oracle-blocks.mjs` — maps each parsed section to a Core Contract §7
  role (reusing the same mapping already established for the hand-built Matins content:
  Invitatorium→opening, Psalmi→psalmody, Lectio N→reading, Oratio→prayer, Conclusio→dismissal,
  rubric sections→rubric), flattens each section's lines into one text block, and content-addresses
  it into a unit per the key convention above.

## Phase 1 validation (against the already-audited Nov 2 Matins content)

Ran the pipeline for `2026-11-02`/`matins` and compared the oracle's real text against every fact
already established this session:

- **Job 7:16 lesson text** — exact match, word for word ("Parce mihi, Dómine; nihil enim sunt dies
  mei..." through "...non subsístam"), including the independently-confirmed absent leading
  conjunction.
- **1 Cor 15:12 lesson text** — exact match, including "Si Christus prædicátur..." with no "autem"
  (the specific wording this session spent significant effort sourcing a printed proper to confirm).
- **Oratio Matutinum** — exact match: the versicle pair ("Dómine, exáudi..."/"Et clamor meus..."),
  "Orémus.", the Fidelium collect, "Qui vivis..." conclusion, "Amen." — confirms the earlier
  Oratio Matutinum fix (found by reading `orationes.pl` directly) was correct.
- **Invitatorium antiphon and Nocturn I antiphons** — exact match against the hand-built units.
- **Antiphon-doubling** (finding 8 of the full audit) — confirmed present in the real oracle output
  (each antiphon shown before *and* after its psalm), matching that finding's own "disclosed, minor,
  presentational" characterization.

**One real defect found and fixed in already-shipped content**: the Conclusio's `&Gloria` macro had
been resolved to the standard Gloria Patri text in an earlier pass. The oracle's real output has no
Gloria Patri at all — `sub Gloria` in `horasscripts.pl` substitutes the Requiem text whenever the
office's own `[Rule]` contains `Requiem gloria` (which `Sancti/11-02.txt`'s does). Fixed; full
account in `ROMAN_BREVIARY_1960_1962_FULL_AUDIT.md` finding 1's correction. This is exactly the
failure mode building an independent oracle is meant to catch — a second hand-trace of the same
rubric text would not have caught it, since the same "Gloria Patri is universal" assumption could
easily have been made again.

**Phase 1 verdict: the oracle pipeline is trustworthy.** Proceeding to Phase 2 (hardening the parser
against the full diversity of content across all 8 hours and varied calendar days) per the plan.

## Phase 2 — parser hardened against content diversity, complete

Ran the oracle across 6 dates × all 8 hours (48 combinations): an ordinary weekday (2026-06-15), a
Sunday (2026-01-04), Christmas (2026-12-25, I. classis), the Octave Day of the Nativity
(2027-01-01), Good Friday (2026-04-03), and Easter Sunday (2026-04-05, covering the Triduum's own
special forms). Found and fixed three real parser bugs, none of which affected the Nov 2 Matins
case Phase 1 validated against (which is exactly why a deliberately varied sample matters — a
single already-known-good case can't surface these):

1. **Footnote-suffix breaking psalm-citation recognition.** Every `Psalmus N` citation line also
   carries a trailing `<FONT SIZE='-1' > [k]</FONT>` footnote-index marker on the same line (e.g.
   `Psalmus 46 [1]`). The citation-only regex required the whole line to end at `</FONT>` with only
   whitespace after, so this trailing marker silently broke the match on every single psalm citation
   outside the one Requiem case Phase 1 happened to check less rigorously — the citation fell
   through to a generic text line instead of being recognized as `Ps. 46`. Fixed by stripping the
   footnote suffix before line classification.
2. **Rank-line color varies by rank and was hardcoded to one color.** The day's rank/title line
   (`<P ALIGN=CENTER><FONT COLOR="...">...</FONT></P>`) uses `grey` for the Requiem case Phase 1
   validated against, `green` for ordinary ranked days, and **no color attribute at all** for the
   highest-ranked days (Easter: `<FONT >Dominica Resurrectionis ~ I. classis</FONT>`). Fixed by
   matching any `<FONT...>` opening tag rather than one specific color.
3. **Untitled sections needed content-aware role classification, not just label-based.** Content
   that appears before any bold-italic section header at all (explanatory rubric notes on Easter
   about the Vigil superseding Matins; Good Friday's entire "Completorium singulare" — a once-a-year
   special Compline form that never uses the normal header convention) both parse as a labelless
   "(untitled)" section. These need different roles: pure prose notes are genuinely `rubric`
   content; Good Friday's special Compline contains real psalmody/canticle/prayer text and would be
   mislabeled by calling it a rubric. Fixed by classifying untitled sections on their actual line
   content (any verse/antiphon/response/versicle line present → `other`, not `rubric`) rather than
   on the absent label alone.

**Not further sub-divided in this pass, disclosed rather than fixed**: Good Friday's "Completorium
singulare" is captured completely and correctly as one large `other`-role block (all its psalmody,
Nunc Dimittis, Pater Noster, and collect are present, verified by direct inspection), but not split
into separately-typed psalmody/canticle/prayer blocks the way an ordinary day's Compline would be,
since it doesn't use the normal section-header convention this parser keys on. A once-a-year office
gets lower priority for finer-grained splitting than the other 364 days; revisit if it turns out to
matter for rendering. Also disclosed: a `(Gloria omittitur)` rubric annotation (styled identically
to a verse-number marker, appearing after certain psalms in Passiontide) is currently dropped rather
than captured as its own diagnostic — harmless to the actual prayer text (an empty string is
filtered out, nothing wrong is shown) but the rubric note itself isn't surfaced.

**Verified**: all 48 combinations run with zero crashes and zero role-taxonomy violations (every
block's role is a member of Core Contract §7's closed 13-role set).

## Phase 3 — full sweep, complete

Ran the full pipeline for both full calendar years: 2026-01-01 through 2027-12-31 (730 days) × all
8 hours (5,840 office-hours), against the pinned commit, `dioecesis=Generale`, `version=Rubrics
1960`, Latin. **0 errors.** 3,937 unique content-addressed units for 2026, 3,982 for 2027 — a large
reduction from 2920 office-hours' worth of blocks per year, confirming the content-addressing
decision (§16 gate 2) does what it was chosen for: the weekly psalter cycle, common antiphons, fixed
prayers, and ordinary-time ferial content collapse into shared units instead of being duplicated
per day.

**A real performance bug found and fixed along the way**: the first sweep attempt used
`execFileSync` inside an async worker pool, intending 16-way concurrency. `execFileSync` blocks
Node's single thread while the child process runs, so every "concurrent" call was actually
serialized — the pool provided zero real parallelism. Confirmed by observing only 1-2 Perl
processes ever running simultaneously regardless of the configured concurrency, and by direct
timing (16 supposedly-concurrent calls taking as long as 16 sequential ones would). Fixed by adding
`runOracleAsync` (promisified `execFile`) to `scripts/roman-breviary-oracle-run.mjs` for the pool to
use, keeping the sync `runOracle` for the single-call Phase 1/2 scripts. Cut the full 2-year sweep
from an estimated ~30 minutes to ~5 minutes (confirmed: 16 real concurrent calls completed in
~0.97s, matching single-call latency, not 16× it).

**Output**: `manifests/2026.json`/`manifests/2027.json` (year-keyed `days[date].hours[hourKey]`,
matching the pre-existing convention) and content-addressed `units/2026.json`/`units/2027.json`.

## Phase 4 — mirror completion and audit extension, complete

Mirrored the Roman-general 1960-relevant Latin subset from the pinned commit via `git archive`:
full `Tempora`, `Sancti`, `Commune`, the remaining `Psalterium` common-text files (`Special`,
`Psalmi`, `Invitatorium.txt`, `Doxologies.txt`, `Benedictions.txt`, `Mariaant.txt` — the Psalter
body text itself, `Psalmorum`, was already mirrored in an earlier pass), `Martyrologium1960`, and
`Appendix` — ~1,800 files, ~10MB. **Deliberately excluded**, per architecture §11's "no monastic or
Dominican variants": `TemporaM`/`SanctiM`/`CommuneM`, `TemporaCist`/`SanctiCist`/`CommuneCist`,
`TemporaOP`/`SanctiOP`/`CommuneOP`, the pre-1955/1960 `Martyrologium1570`/`Martyrologium1955R`
editions, `Regula` (Benedictine Rule readings, monastic-only), and `Necrologium`. `source-pin.json`
updated with the new declared subset and full rationale.

Extended `scripts/audit-roman-breviary-1960-narrow-checks.mjs`: iterates every `manifests/<year>.json`
file found on disk rather than one hardcoded year; added a new sub-check verifying each manifest's
own recorded `source_pin.commit` matches `source-pin.json` (catches the exact class of error Phase 0
found — an oracle run against a drifted engine clone); scaled checks 2/3/5 to the full corpus.
**Result: 0 failing, 7 warnings** (all warnings are the expected "not-exhaustive spot-check sample"
notices for the bulk-mirrored directories — the same disclosed sampling policy this audit has used
since the original narrow-check pass, not a new gap).

## Phase 5 — UI wiring and verification, complete

`js/roman-breviary-1960-1962-dev-slice.js`: `resolveDevSliceOffice` now fetches `units/<year>.json`
(content-addressed, matching Phase 3's output) instead of the superseded `units/dev-vertical-
slice.json` (left on disk as a historical artifact — still referenced by the original bible-binding
report scripts as their own frozen input, not deleted). Removed the now-false hardcoded diagnostic
claiming "Full Roman Breviary 2026/2027 manifests are not generated yet." Added a lightweight
date/hour navigator (a plain `<input type=date>` + `<select>` + button, re-rendering in place) so
the full 730-day × 8-hour range is actually reachable from the UI, not just present in the data —
proportionate to this route's own "dev slice" framing, not a full calendar-picker feature. Reconciled
`context` field naming a step further toward Core Contract §4's illustrative `calendarSummary`/
`rankSummary` (best-effort split of the lane's own single rank line, since Divinum Officium's
rendered output doesn't produce those as two separate strings — the shell still receives the lane's
own vocabulary verbatim, per §4 rule 1, not a re-interpretation of it).

**Verified in headless Chromium**: default view (2026-11-02 Matins) renders with the corrected
Requiem-substitute doxology inline in the Conclusio block, zero console errors. Date/hour navigation
tested live (typed 2026-12-25 into the date field, selected Vespers, clicked Go) — correctly
re-rendered "In Nativitate Domini ~ I. classis" with real Christmas Vespers content (Psalm 109,
proper antiphons), zero console errors.

## Phase 6 — documentation and commits, complete

This document, `ROMAN_BREVIARY_1960_1962_FULL_AUDIT.md`'s finding 1 correction,
`ROMAN_BREVIARY_1960_1962_ARCHITECTURE.md` §16's gates marked cleared, `AUDIT_GOVERNANCE_LEDGER.md`
entries at each phase boundary, and `RESUME_PROJECT_NOTE.md` all updated. Commits made incrementally
by phase and pushed to PR #39's branch (`claude/resume-note-catholic-audit-7hbtx6`), matching this
repo's existing commit granularity — not one giant commit for the whole build-out.

## What this build-out does not claim

Per architecture §10's own explicit non-goals: no English layer, no chant layer, no local
calendars, no monastic or Dominican variants. Per §11: this lane sits alongside `roman_loth` and
does not replace it. Reaching the minimum shippable floor is not a claim that every rubric edge case
across 730 days has been individually human-reviewed the way the original one-day Matins prototype
was — it is a claim that the oracle pipeline producing this corpus has itself been validated (Phase
1: against every previously-audited fact, including one real bug caught and fixed; Phase 2: against
a deliberately diverse sample including the Triduum's special forms) and ran cleanly with 0 errors
across the full range. Any future finding of a genuine defect in a specific day's content should be
traced to either the parser (fixable once, benefits every day) or an upstream Divinum Officium
question (out of this lane's own scope to adjudicate, per architecture §7's hybrid-oracle strategy
trusting Divinum's own rubrical computation).
