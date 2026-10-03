# Roman Breviary 1960/1962: Component + Engine Rebuild (Plan)

Status: **PLAN ONLY (2026-10-03). No data or code changed.**
Authorization: Josh, 2026-10-03: do this before the offline-app work, because the Breviary should
follow the shape of the liturgy like the other traditions, not be a snapshot of another project's
output. This reverses the deferral in `ROMAN_BREVIARY_1960_1962_ARCHITECTURE.md` §8 (native JS
engine "deferred") and the Option 3 choice in §7. When work starts, record the supersession in
that document.

## 1. Problem

The shipped Breviary (`data/roman-breviary-1960-1962/units/`, `manifests/`) is the stored output of
Divinum Officium's Perl engine run once per date for **2026 and 2027 only**
(`ROMAN_BREVIARY_1960_1962_BUILDOUT.md`, "Minimum Shippable Floor"). Consequences:

1. Nothing renders for any date outside 2026-2027 until the Perl engine is re-run.
2. The stored shape is "a finished day", not the liturgy's own parts (psalter, temporal, sanctoral,
   commons, ordinary). This conflicts with Josh's standing rule that the shape of the liturgy
   controls the shape of the app; the Horologion already follows that rule.
3. Roughly 60 MB of the 85 MB is generated output, which would grow with every added year.

## 2. What already exists (measured)

- **The parts are already in the repo**, in Divinum's own text format, under
  `data/roman-breviary-1960-1962/source/divinum-officium/web/www/horas/`: Latin 2,026 files /
  10.9 MB and English 1,657 files / 9.1 MB. Latin includes `Tempora` (638 files), `Sancti` (489),
  `Commune` (63), `Psalterium` (Psalmorum, Special, Common, Invitatorium, Doxologies, Benedictions,
  Mariaant), `Appendix`, `Martyrologium1960`. Pinned commit `0ce8747d7dba3276fc05937635e02360b49a60a6`
  (`source-pin.json`). So `source/` is not waste: it is the component store, stored in Divinum's
  native format and still needing conversion to our JSON.
- Component files carry **rubric-conditional lines**, e.g. `[Rank] (rubrica 196)` and
  `(sed rubrica 1960 aut rubrica innovata omittuntur)`. The engine must evaluate these for the 1960
  rubric set.
- **Oracle output for 730 days** (2026-01-01 to 2027-12-31, all 8 hours, Latin and English) is
  already generated and audited in `units/` and `manifests/`. This is the test suite for a new engine.

## 3. Open source we do not need to reinvent

- **Divinum Officium** (MIT licence, github.com/DivinumOfficium/divinum-officium): source of both
  the texts and the rubrical logic. The rubric logic is procedural Perl. Measured in the current
  upstream (not the pinned commit): about **9,900 lines** in `web/cgi-bin/horas/` and
  `web/cgi-bin/DivinumOfficium/`, mainly `horascommon.pl` (2,344 lines: occurrence, precedence,
  calendar), `specmatins.pl` (1,864), `specials/orationes.pl` (1,220), `specials.pl` (818),
  `specials/psalmi.pl` (717), `specials/specprima.pl` (366). That total also covers monastic and
  other variants we do not need, so the 1960-relevant core is smaller.
- Divinum's upstream has a `regress/` tool and `t/` unit tests for comparing generated offices.
  These are Perl tools; their value to us is as a model for our own comparison harness.
- **OfficiumDivinum** (github.com/klsrqm/OfficiumDivinum): an earlier object-oriented Python rewrite
  with a JSON API. Not adopted here; noted as prior art only. Its completeness and licence have not
  been checked.
- I found no existing JavaScript port of the rubrics engine in a search. Not exhaustive.

## 4. Target design

Store once, assemble at runtime, like the Horologion.

- **Components (JSON, generated from the pinned mirror by a parser script):** psalter by day and
  hour; temporal propers by season, week and day; sanctoral by date; commons; ordinary texts
  (prayers, doxologies, benedictions, Marian antiphons, preces); psalm texts (Latin plus English).
  Each unit keeps its source file and section as its citation. No text is written by hand.
- **Rules (JS module):** 1960/1962 rank and precedence; occurrence and concurrence; transfers;
  commemorations; octaves and vigils; Matins and Vespers restrictions; per-hour assembly. Data
  tables (kalendar, transfer tables) stay data, not code.
- **Output:** the same resolved-office envelope the app renders today, so the UI changes little.
- **Date-independent:** any year, computed from Easter and the calendar rules.

## 5. Verification (the safeguard)

1. The oracle is not trusted blindly: the existing 730 days were audited
   (`ROMAN_BREVIARY_1960_1962_FULL_AUDIT.md`). Where the new engine and oracle disagree, resolve each
   case against the rubrics, not by making the engine copy the oracle.
2. **Day-by-day diff**: for each of 730 days x 8 hours, new engine output equals stored output.
   Target: zero unexplained differences; every difference listed and ruled on.
3. **More years for the hard cases:** regenerate the Perl output for extra years (needs `perl` plus
   `libcgi-pm-perl`, which are not installed in this environment today; the build-out doc records
   installing them). Priority years, to be chosen by computing them: the earliest and latest
   Easters between 2020 and 2100, leap years, years where the Annunciation or St Joseph falls in
   Holy Week, and Christmas on each weekday.
4. Component parse check: every source section maps to a unit; zero unmapped; zero text edits.

## 6. Phases (each ends with a diff report and Josh's go-ahead)

1. **Components.** Parser from the pinned mirror to JSON components, plus integrity audit. No engine.
2. **Calendar core.** Easter, the temporal cycle, the sanctoral kalendar, 1960 ranks and
   precedence, occurrence only. Test: day-level "which office wins" against the oracle's `rank`
   field for all 730 days.
3. **Per-hour assembly,** one hour at a time (Lauds and Vespers first, then Matins, minor hours,
   Compline), diffed to the oracle after each.
4. **Concurrence, commemorations, transfers, octaves, vigils,** with extra-year tests.
5. **Switch the UI** to the engine; keep the old data as a fallback until the diff is clean, then
   retire `units/` and `manifests/`.
6. **Pack for offline:** engine plus components only; no per-year data; drop `source/` from the
   release.

## 7. Risks

- The rubrics are the hard part, and the Perl code has accreted special cases over many years.
  Expect the long tail (rare transfers, Holy Week and octave edge cases) to take most of the effort.
- Matching Divinum is not the same as being rubrically correct; where Divinum is wrong, we should
  record the disagreement, not copy it.
- The pinned commit is old relative to upstream; new upstream fixes are not picked up unless the pin
  moves. Moving it is a separate, audited step.
- Not verified here: the exact count of 1960-only Perl lines, and whether CGI-free runs of the Perl
  engine are possible for generating extra test years.

## 8. Decisions for Josh before phase 1

1. Rubric scope: 1960 only, or 1960 and 1962 (the lane is named 1960/1962; Divinum treats them as
   close but not identical)?
2. English: keep the English layer in the first engine release, or Latin first? (The components
   already exist in both.)
3. Divergence policy: when the engine disagrees with Divinum and the rubrics support the engine,
   is the engine right? (Recommended: yes, logged.)
4. Is it acceptable to install `perl` and `libcgi-pm-perl` in the session environment to generate
   extra test years?
