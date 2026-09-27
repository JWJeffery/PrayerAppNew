# Roman Breviary 1960/1962 — Full Build-Out (Minimum Shippable Floor)

**Status:** IN PROGRESS — Phase 1 complete and validated, 2026-09-27.
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

## Remaining phases (see the session's plan for full detail; summarized here for continuity)

- **Phase 2** — run the oracle across a deliberately varied sample (ordinary weekday, Sunday,
  first-class feast, octave day, commemoration, occurrence conflict, Triduum, a Little Hour and
  Compline) across all 8 hours; harden the parser until all round-trip cleanly.
- **Phase 3** — full sweep: 2026-01-01 through 2027-12-31 × all 8 hours, emit
  `manifests/2026.json`/`manifests/2027.json` and content-addressed `units/2026.json`/`units/
  2027.json`.
- **Phase 4** — mirror the Roman-general 1960-relevant Latin subset (Tempora/Sancti/Commune/
  Psalterium/Martyrologium+Martyrologium1960/Appendix, excluding monastic/Dominican/Cistercian
  variants) into the repo; extend the narrow-check audit to the larger corpus.
- **Phase 5** — generalize the UI beyond the hardcoded 2026-11-02 default; live-verify a
  representative sample in headless Chromium; reconcile envelope field naming with Core Contract
  §4/§5.
- **Phase 6** — documentation, ledger entries, incremental commits.
