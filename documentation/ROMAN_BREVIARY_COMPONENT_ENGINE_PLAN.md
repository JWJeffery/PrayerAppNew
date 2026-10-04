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

## 8. Decisions (Josh, 2026-10-03)

1. **Rubric scope: one set, "Rubrics 1960".** Research finding: Divinum has no separate 1962 Office
   rubric set. The Code of Rubrics (1960) was incorporated into the 1961 typical Breviary and the
   1962 typical Missal; the "1962" label comes from the Missal. Divinum states it maintains its
   "Rubrics 1960" version "substantially harmonious with the 1962 typical edition". The engine
   implements that one version. The "Rubrics 1960 - 2020 USA" variant (US propers, recent saints)
   is out of scope unless Josh later asks.
2. **Languages: Latin and English** (components exist in both).
3. **Divergence policy:** where the engine disagrees with Divinum and the rubrics support the
   engine, the engine wins; each such case is logged.
4. **Perl and `libcgi-pm-perl`:** approved and installed in the session environment (2026-10-03)
   to generate extra test years.

## 9. What "variance we don't need" means

Divinum Officium is one program serving many historical versions of the Office, selected at run
time. The version list in `RunTimeOptions.pm` and the calendar files in `web/www/Tabulae/Kalendaria/`
include: Tridentine 1570 and 1888/1906/1910; Divino Afflatu 1939 and 1954; Reduced 1955; Rubrics
1960 (and a 2020 USA variant); Monastic (1617, 1930, 1963); Cistercian; Ordo Praedicatorum 1962.
Throughout the Perl code, rules branch on the version (for example `horascommon.pl` tests
`$version =~ /1955|Monastic.*Divino|1963/`). We only need the 1960 branches. The data mirror
already excludes the monastic, Dominican and Cistercian directories (`source-pin.json`).

## 10. Other apps for the traditional Breviary (what I could verify)

- **Breviarium Meum** (Giovanni Manelli; iOS, Android): traditional Latin Breviary "1962 or earlier",
  with Divino Afflatu and Trent versions, parallel translation in nine languages. Its store
  description says texts can be downloaded "up to a week in advance" for offline use. That
  suggests pre-generated days fetched in short windows, but how it generates them is not stated
  and I could not confirm what data source it uses.
- **Ordo Mobile App** (Romanitas Press): a calendar guide for the 1962 Missal and Breviary that
  "automatically applies the general rubrics", works offline after download; its data comes from
  the publisher's printed Ordo (in print since 1979). It applies rubrics but is a calendar, not
  the full text of the hours.
- **Divinum Officium** itself (web, MIT licence) is the open data source most projects in this
  area can legitimately build on. Whether any particular app uses it is not verified.

## 11. The "Rubrics 1960 - 2020 USA" variant (researched 2026-10-03; not in scope unless Josh says)

Divinum's own description (`web/www/horas/Help/versions.html`, upstream): the version "adapts the
1960 Code of Rubrics to the local propers of the United States of America and implements some new
saints per the decree *Cum Sanctissima*" (CDF, 22 February 2020). It is the 1960 rubrics with a
changed calendar, not a different rule set. Offices not found in the Extraordinary Form are built
from the Common of Saints; memorials are 3rd-class offices; feasts are treated as 2nd class,
solemnities as 1st class; if two saints share a day the newer one wins and the 1960 saint is
commemorated.
- Upstream shows 30 `n`-suffixed Sancti files (e.g. `05-13n.txt`, `09-23n.txt`) and a calendar delta
  file `Tabulae/Kalendaria/NC.txt` with about 31 non-comment lines. Examples in that file: Our Lady of
  Fatima (05-13), Padre Pio (09-23), Our Lady of Guadalupe (12-12), St Juan Diego (12-09), Maria
  Goretti (07-06), Martin de Porres (11-03), Cabrini (11-13), Teresa Benedicta (08-09).
- Divinum notes the variant cannot handle seasonal feasts moved to Sundays or external solemnities.
- The pinned mirror already includes the 30 `n` files. It does **not** include the
  `Tabulae/` calendar and transfer tables at all (not `1960.txt`, not `NC.txt`). The engine needs
  `Tabulae` for the 1960 calendar too, so adding it to the mirror is part of phase 1.
- Cost to add later if wanted: small (a calendar overlay and one rule), because it layers on the
  1960 engine. It is a separate decision because the Extraordinary Form proper does not contain
  these saints.

**Decision (Josh, 2026-10-03): the 2020 USA variant is a planned add-on.** Sequence: finish the
Rubrics 1960 engine and match it to the audited output first; then add the variant as a calendar
overlay (`Tabulae/Kalendaria/NC.txt`, the `n`-suffixed Sancti files, its transfer tables) with its
own diff report. It is recorded in `RESUME_PROJECT_NOTE.md` section 5.

## 12. Phase 1 result (2026-10-03)

**Done: components exist and are proven lossless. No engine yet, no app change.**

1. **Mirror completed.** Traced the Perl engine with `strace` at the pinned commit for Rubrics 1960
   (24 sample dates x 8 hours x Latin/English): it opens **559 distinct data files**; 44 were missing
   from the mirror. Added from the pinned commit: `Tabulae/` (15 calendar files including `NC.txt`,
   `Tempora`, `data.txt`, 43 Transfer + 43 Stransfer tables; diocese subfolders excluded), the six
   `horas/Ordinarium` hour templates, the rest of Latin and English `Psalterium`,
   `Latin/Martyrologium/Mobile.txt`, `horas.setup`, `horas.dialog`. All 559 traced files are
   byte-identical to the pinned commit. The traced list is `source/engine-read-set-2026-10-03.txt`;
   `source-pin.json` records the additions. A 24-date sample is not exhaustive: later phases may find
   more files, and the audit rule is to add them the same way.
2. **Converter:** `scripts/build-roman-breviary-components.mjs` writes
   `data/roman-breviary-1960-1962/components/{la,en,shared}/<group>.json` (17 bundles, 3,823 files,
   about 13 MB, deterministic). Sectioned files keep `[Section] (condition)` headers, section bodies
   and any preamble; flat files (psalm texts, Ordinarium, Tabulae tables) keep their text verbatim.
   Each entry records source path, byte length and sha256. Nothing is edited or interpreted.
3. **Audit:** `npm run audit:roman-breviary-components` rebuilds every file from its JSON and
   compares bytes. Current result: 3,823 of 3,823 round-trip (2,530 sectioned files with 26,189
   sections, 1,293 flat), no orphans either way, all 559 traced files covered. Negative-tested:
   removing one accent from one component makes the audit fail on that file.

### Findings that shape phases 2-4

- **Versions inherit through a chain**, set in `Tabulae/data.txt`: Rubrics 1960 -> Reduced 1955 ->
  Divino Afflatu 1954 -> Divino Afflatu 1939 -> Tridentine 1906 -> 1888 -> 1570. The calendar files
  are overlays (`1960.txt` says it "only notes the changes to Reduced - 1955"). So the 1960 engine
  must still load and compose the older calendar files; "1960 only" removes the rules for other
  versions, not their data in this chain.
- **The text-assembly DSL is small.** Across all Latin/English components (177,806 lines):
  1,503 stand-alone conditional lines, of which about 76% test `rubrica`; 5,575 `@` includes;
  2,311 `&` function calls but only **15 distinct functions** (`Gloria`, `teDeum`, `psalm`,
  `special`, `Dominus_vobiscum`, `Benedicamus_Domino`, `Alleluia`, ...); 2,307 `$` prayer references.
  Counts are line-start only; inline conditionals were not counted. Conditional subjects seen
  include `rubrica`, `tempore`, `feria`, `communi`, `die`, `commune`, `officio`, `ad`, `dioecesis`,
  `mense`. The grammar is defined in upstream `SetupString.pl` (stopwords `sed/vero/atque/attamen/
  si/deinde`, scopes line/chunk/nest), which phase 3 must reimplement exactly.
- **The hard part remains the occurrence/precedence/hour-assembly logic in Perl**, not the data.
- Section-header conditions: 90 distinct strings (the most common: `(rubrica cisterciensis)`, `(communi
  Summorum Pontificum)`, `(rubrica 196)`).

### Next (phase 2, needs Josh's go-ahead)

Calendar core: Easter and the temporal cycle, the kalendar composition through the version chain, 1960
rank and precedence, occurrence only; tested day-by-day against the audited oracle `rank` field for the
730 stored days, plus extra years generated from the pinned Perl engine (now runnable in the session).

## 13. Phase 2 result (2026-10-03): the calendar core matches the Perl engine

**Done: a JavaScript port of "which office is said today" (occurrence) for every hour except Vespers
and Compline, verified against the pinned Perl engine. No change to the app yet.**

New modules in `js/roman-breviary/` (browser and Node, no dependencies): `date.js` (Easter, temporal
week, month-week, leap-day handling), `store.js` / `store-node.js` (serves the JSON components),
`directorium.js` (Tabulae tables through the version chain, transfers), `setupstring.js` (the data
files' mini-language: conditionals and scopes, `@file:Section` includes with substitutions,
`officestring`), `occurrence.js` (`occurrence()`, `precedence()` for the non-Vespers view and its
helpers). They are ports kept close to the Perl so the two can be diffed.

**Verification (all against a Perl engine at the pinned commit; zero differences in every run):**

| Layer | Test | Result |
|---|---|---|
| Dates | `npm run test:roman-breviary-date`: 13 years, every day, 8 functions | 4,763 records, 0 mismatches |
| Tables | `test:roman-breviary-directorium`: 10 years, every day, 9 lookups | 3,653 days, 0 mismatches |
| Data-file reader | `test:roman-breviary-reader`: 1,436 Latin files x 15 dates x 3 read modes, per-section md5 | 64,620 comparisons, 0 mismatches |
| Calendar core | `test:roman-breviary-calendar`: winner, commemoration, scriptura, commune, rank, rule, day names, Lauds scheme and 20 more fields per day | Laudes 1962-2100 (about 50,800 days), Matutinum 1990-2060 (25,933 days), Prima/Tertia/Sexta/Nona 2026-2027: 0 differences |
| Independent check | 156 dates (earliest and latest Easters in range: 2008-03-23, 2035-03-25, 2038-04-25, 2095-04-24 and nine days around each, plus 120 random days), each in its own fresh Perl process | 0 differences |

The tests are sensitive: changing one comparison in `occurrence.js` made 9 days of 2026-2027 fail,
and the original passes.

**What was learned along the way (all handled in the port):**
- The data language relies on Perl regex behaviour JavaScript lacks: `$` matches before a final newline,
  `\w` matches accented letters, replacements use `\n`, `\u`, `\L`, `\1`. Each was caught by the
  reader test and fixed (`perlRegExp` / `perlSubstitute` in `setupstring.js`).
- Roman files include text from monastic/Cistercian/Dominican folders; 67 such files (transitive
  closure) were added to the mirror (`source/include-closure-2026-10-03.txt`).
- The Perl engine keeps state between calls that a fresh request would not have (a leftover
  `cvespera`, the parsed-file cache with date conditions already evaluated, a global `monthday`).
  The oracle resets them, and the reset was proved against 146 plus 156 fresh-process runs.
- Perl oddities reproduced on purpose: `extract_common` always assigns (a list in boolean context is
  always true); a misspelt variable (`$tommorow`) makes one condition always true; one loop in
  `transfered()` is dead code (an out-of-scope hash) and is not ported.
- Nothing disagrees with Divinum yet, so nothing is logged under the "engine wins" policy.
  Matching Divinum is not a proof the rubrics are applied correctly; that remains the audit's job.

**Not done (later phases):** concurrence (Vespers and Compline, which also decides the commemoration
carried from the day before), votive offices, diocesan calendars, the Matins/Lauds text assembly,
English columns. `precedence()` throws if asked for Vespers or Compline.

**Reproducing the tests:** `npm run roman-breviary:engine:setup` rebuilds the pinned Perl engine
clone outside the repo (Perl is needed only for tests; the app never uses it).

**Next (phase 3, needs Josh's go-ahead):** per-hour assembly for Lauds first, then Matins and the
little hours, diffed against the audited stored output in `units/` and `manifests/` (and the Perl
engine's own output for other years). Vespers and Compline follow concurrence (phase 4).

## 14. Phase 3, stage A result (2026-10-04): all eight hours fill their templates like the Perl engine

**Done: a JavaScript port of "fill the hour's template with the day's content" (`specials()` and the
modules it calls) for Matins, Lauds, Prime, Terce, Sext, None, Vespers and Compline, verified against
the pinned Perl engine. The prayer texts themselves are not expanded yet (see below).**

What "stage A" produces: for a date and hour, the hour's *script*: an array of lines such as
`#Psalmi{Psalmi & antiphonae ex Psalterio secundum diem}`, the antiphons, `&psalm(62)`,
`$Pater noster`, the chosen chapter, hymn, collect with its commemorations, and so on. References
(`&psalm(n)`, `$Prayer`, `&lectio(n)`, `&Gloria`) are still unexpanded; expanding them and turning the
result into display blocks is stage B.

New files: `js/roman-breviary/hours.js` (specials, psalmody, chapters, hymns, canticles, preces, collects
and commemorations, suffragium, Prime and Compline pieces, the martyrology with its lunar date),
`js/roman-breviary/matins.js` (invitatory, hymn, nocturns, absolutions and blessings, and `lectio()`),
concurrence added to `js/roman-breviary/occurrence.js`; `scripts/roman-breviary-oracle-script.mjs` and
`scripts/test-roman-breviary-script.mjs` (`npm run test:roman-breviary-script`).

**Verification (script arrays compared line for line; zero differences in every run):**

| Hour(s) | Dates | Records |
|---|---|---|
| Lauds | every day 1962-2011, 2026-2030 | 20,000+ |
| Matins, Lauds, Prime, Terce, Sext, None, Vespers, Compline | every day of 2008 (earliest Easter) and 2038 (latest) | 5,848 |
| Matins | every day of 2026-2027 | 730 |
| Vespers, Compline | every day of 2026-2027 | 1,460 |
| Prime | 2026-2027, plus spot years 1900, 1905, 1965, 2045, 2100, 2150 (the martyrology's date quirks) | 730+ |
| Terce, Sext, None | every day of 2026-2027 | 2,190 |

**Oracle artifacts found and fixed (the Perl engine is built for one request per process):**
- With several dates in one process, `horas()` sometimes calls `precedence()` with no date, which then
  reads the CGI "date" parameter (the first date on the command line); the oracle now sets it per date.
- `my $ant, $ant2;` and `my $ant, $duplexf;` declare only the first variable; the second is a package
  global that carries over between hours. The oracle resets them.
- Parsed-file caches have date-dependent conditionals already evaluated, so both the oracle and the JS
  clear them for each date.

**Perl quirks reproduced on purpose (each would otherwise cause a mismatch):** `"v."` in some regexes
means "v plus any character"; hash keys made from floats use 15 significant digits; `split` drops
trailing empty fields; `prevdayl1()` assigns `$day = 0`; one line empties the working hash with an
undeclared `%w1`; the day-of-year used by the martyrology is 0-based for 1970-2038 and 1-based outside it.

**Not done:** stage B, the expansion of `&psalm`, `$Prayer`, `&lectio`, `&Gloria`, `&teDeum`... into text
and the conversion into the app's blocks; the English column (stage A already works from Latin only;
English needs the English components in the same paths); the 2020 USA add-on; wiring the engine into the
app and retiring `units/` and `manifests/`.

**Next (needs Josh's go-ahead): stage B.** Port `resolve_refs()`/`expand()` and the script functions
(`psalm`, `lectio` text, `Gloria`, `teDeum`, ...), then compare the resulting blocks with the audited
stored units for 2026-2027 and with the Perl engine's own HTML for other years.
