# RESUME_PROJECT_NOTE.md

**Paste this at the start of a new conversation.** It is a handoff document, not a history — it
holds only what's currently true and currently open. The permanent narrative record of every past
decision and completed session lives in `documentation/project-history/` (start at its `INDEX.md`)
and `AUDIT_GOVERNANCE_LEDGER.md`. **Where this note and the repo disagree, the repo wins** — it may
have moved since this was written.

**Rewritten 2026-09-28, again, same day — this is the FOURTH time this note has needed this exact
treatment (2026-07-17, 2026-09-04, 2026-09-28 morning, 2026-09-28 afternoon).** The morning rewrite
brought it to ~300 lines of current material; by the time a five-diocese ingestion batch and its own
documentation were added on top — without anything closed being split back out — it had grown to 879
lines again. A fresh session asked to "open the resume note" surfaced one buried, months-old-sounding
TODO line as if it were the whole answer, because there was no longer a clean current-state summary
to find underneath all the re-accumulated session narrative. Split everything closed/historical out
to `documentation/project-history/VOLUME-5-2026-09-28-session-log.md` this pass (see its own header
for exactly what it contains). **The lesson, stated plainly this time so it actually generalizes:
adding new material to this note is not "done" until any closed material it displaces is also moved
out. A net-growth commit to this file is itself a defect, not just eventually-a-problem — check the
line count before finishing any session that touched this file, and split proactively rather than
waiting to be asked a fifth time.**

**Split again 2026-10-01 (901 -> ~480 lines):** the closed 2026-09-29/30 Cycle of Prayer and UI material moved verbatim to
`documentation/project-history/VOLUME-6-2026-09-29-to-09-30-cycle-of-prayer-and-ui.md`. Same rule applies: check
the line count before finishing any session that touched this file.

**FIRST MOVE, EVERY SESSION, NO EXCEPTIONS.** `git clone` fresh, then `git log --oneline -10` and
check `SEED_VERSION` in `audit-ledger.html`. Josh runs multiple Claude accounts/sessions against this
repo concurrently, so never trust this note's HEAD, SEED_VERSION, or "what's open" at face value —
verify against the live repo. Cache-bust params likewise: read them out of `index.html` rather than
trusting a number written here.

**Run this exact check before reading or editing anything else in this file — not "consider checking
for unmerged PRs," run the command:**
```
git fetch origin main <your-branch> && git merge-base --is-ancestor <your-branch> origin/main
```
If it does NOT print success (i.e. your branch is missing commits from `main`), **merge `origin/main`
in and reconcile before doing anything else** — do not audit, edit, or trust a single line of this
note until your branch actually contains all of `main`. This exact failure happened twice
(2026-09-26, and again 2026-09-28 when two separate "audit the note" passes both checked the note's
internal consistency but never checked whether the branch itself was 40 commits behind `main` — real
shipped work, including things this note was tracking as still-open TODOs, was invisible the whole
time). A prose reminder to "check for unmerged PRs" was not enough to actually stop this from
recurring; a literal command is.

---

## 1. First thing to do, every session

**Read the full repo and the governance documentation before any analysis or build work.** This is
the most consistently enforced rule on the project and prior instances have repeatedly failed it. In
particular read `AUDIT_GOVERNANCE_LEDGER.md`, `documentation/OPEN_ITEMS_FIXABILITY.md`, and
`documentation/UNIVERSAL_OFFICE_CORE_CONTRACT.md`.

**Do not trust this note, or any stored memory, about whether something is blocked.** Check
`OPEN_ITEMS_FIXABILITY.md` first — **and check it against the ledger**, since the fixability file has
gone stale relative to the ledger before. It records what blocks an item; it is not proof the item is
still open.

**When a document's claimed status and the live code disagree, the live code wins — always verify
directly before repeating a "done"/"complete" claim.** Multiple stale or ambiguous status claims
(a Bible-audit note that hadn't been updated in ~2.5 months; a "Horologion audit complete" claim
that got read as broader than it was — see §5 and §8) caused real, avoidable friction this session.
Read the actual file/code, not just the doc that describes it, before asserting current status to
Josh.

---

## 2. Who and what

Josh (GitHub `JWJeffery`) owns **PrayerAppNew** / "The Universal Office" — a free, non-commercial
multi-tradition liturgical prayer web app at theuniversaloffice.com. He is not a coder. Four
traditions currently live: Anglican (BCP 1979), Coptic (Agpeya), Church of the East (East Syriac),
Byzantine (Horologion). A fifth, Roman Breviary 1960/1962 (the "Catholic" card), is also SHIPPED and
live — see §7.

A prior assistant, **Lucy**, was dismissed for falsely certifying content as accurate — the standing
comparison point for what NOT to do. All Lucy-era certifications are void and must be independently
re-derived. Nothing in this repo's own docs or `structure.json` counts as evidence on its own; verify
against primary sources. The Lucy-era saints generator/CI-gate architecture (identities.json,
commemorations.json, the whole build/import/validate toolchain) was removed entirely 2026-09-02 —
`js/saints-resolver.js` now reads `data/saints/saints-{month}.json` directly, no generation layer.
A broader audit of Lucy-era one-off validation scripts under `scripts/` is **DONE and CLOSED** — 107
dead files removed, all remaining loose ends closed 2026-09-28; full detail in
`AUDIT_GOVERNANCE_LEDGER.md` and `documentation/project-history/VOLUME-5-2026-09-28-session-log.md`,
not repeated here.

**`synaxarium-review/` is a separate project — do not touch it, do not extend it, do not build
anything parallel to it either without asking first.** It is a review UI (data build script, browser
concur/override/custom-decision workflow, disk persistence, a merge-back script) built for the
**Anglican Kalendar v0.1 candidate matrices** specifically (`data/kalendar/*-candidates.csv`,
SIN-keyed). Confirmed explicitly by Josh, 2026-09-07: this is a different project than the EOR/OOR
sanctoral work described in §7, even though both are "review a candidate against a source and
decide." To start it: `cd synaxarium-review && python3 -m http.server 8000`, then open
`http://localhost:8000`.

---

## 3. Workflow — non-negotiable

**Claude works on an assigned git branch, commits directly, and pushes with `git push -u origin
<branch>`.** Confirmed directly by Josh, 2026-09-28: the older `git format-patch`/`git am` workflow
(standing instruction through at least 2026-09-07, where Claude committed but never pushed and Josh
applied the patch himself) belonged to a different product — Claude Chat/Work — not Claude Code, which
is what's actually being used now and pushes directly as part of its normal operation. It is not a
stricter-vs-looser policy choice to revisit; it's a different tool with a different mechanism. Don't
re-flag this as a contradiction or ask before pushing to your assigned branch — just push. (Pushing to
`main` itself, force-pushing, or anything else genuinely destructive is a separate question and still
warrants asking first, per Claude Code's own standing judgment on risky actions.)

- **Every commit that's meant to land gets pushed in the same turn it's made — no exceptions.** The
  old-workflow version of this rule was violated once, 2026-09-07 (six commits made and reported
  "committed" with no patch ever surfaced, caught only when Josh asked directly and was, rightly,
  furious). The lesson generalizes regardless of push mechanism: committing is not done until the
  work is actually in Josh's or the remote's hands, not just sitting in a local sandbox.
- **A push to an orphan feature branch with no PR is easy to lose track of — before telling Josh
  something is "done and pushed," confirm it's pushed to a branch that either *is* `main` or has an
  open PR against it, and actually open/merge that PR the same session.** This happened concretely
  more than once (a branch-tracking gap in the Defaults/Modes work, and again with this very note's
  own diocese-batch branch sitting unmerged until Josh asked directly "so where is the resume? on
  main?") — full detail in `documentation/project-history/VOLUME-5-2026-09-28-session-log.md`.
- **Always work from the verified current state of the target branch.** Fetch/pull first and check
  `git log --oneline -1` before building on top of it.
- **Never use a bulk JSON dump (`json.dump()` or equivalent) on a huge file without version-controlled
  review** — prefer targeted edits. **Validate JSON before writing**, not after
  (`node -e "JSON.parse(...)"` is cheap insurance).
- **When scripting a bulk edit against `data/saints/sanctoral.json`, key on `(id, month, day)`, never
  `id` alone.** Duplicate `id` values are the corpus's normal same-figure/different-tradition-date
  pattern (each historical figure commemorated on genuinely different dates in different traditions),
  not automatically a defect — but two real identity collisions have been found and fixed by id-split
  in the past (`saint-boniface-of-tarsus`/`mar-michael-archangel`); re-verify the current duplicate
  count directly (`node`, group `data.entries` by `id`, filter length > 1) and check each group for an
  exact `(id, date)` collision before assuming it's fine. A blind id-keyed write silently clobbered
  unrelated rows once already; full-file backup before any bulk sanctoral edit, and re-verify with a
  fresh read after, every time.
- Cache-bust params in `index.html` (`?v=NNN`) must be **bumped manually** whenever the corresponding
  JS file changes.
- `AUDIT_GOVERNANCE_LEDGER.md`, this note (when something current changes), `audit-ledger.html`, and
  `SEED_VERSION` are updated **in the same commit** as the fix, never batched later. Check
  `SEED_VERSION` against the actual latest commit's content every time you're about to write a ledger
  entry — don't assume it's current.
- **When staging or committing, review what's actually included** (`git status` after a broad `git
  add`) — an unrelated batch of untracked files got swept into an unrelated commit once already by an
  overbroad `git add -A`. Name exact paths.
- **When you extend this note, check its line count before ending the session.** If it's crept past a
  few hundred lines of dated session narrative again, split the closed material into a new
  `documentation/project-history/` volume in the same session — see the header above. This is now the
  fourth time this specific instruction has had to be added; a fifth time should not happen.

---

## 4. Standing content rules

- Every component cites a specific source page. Gaps are **disclosed** in component metadata and on
  the dashboard, never filled by guessing.
- **Sweep the class, don't fix the instance.** When one instance of a bug is found, check every
  sibling programmatically.
- **But do not sweep on assumption.** The Wednesday Evening Anthem is the standing counter-example in
  this project's history: it genuinely differs from every other weekday. Verify before generalizing.
- Reused components are verified by direct text comparison, never assumed from title similarity.
- Node simulation against real dates before committing any calendar or engine logic.
- Scope and architectural decisions are Josh's. Record conflicts for deliberate resolution rather
  than overriding them silently.
- Work continues until finished. Do not treat content-complete as done while defects remain. **A book
  or subsystem is not green/done while any known problem remains, however minor** (Josh's explicit
  rule).
- **A structural mismatch is not the same as a data mismatch, and needs a different fix.** When a row
  is stored as `fixed` but the underlying commemoration is genuinely moveable (Pascha-relative,
  Christmas-relative, or a true recurring monthly date), no lookup will ever correct it — it needs an
  actual engine rule. Don't assume "no match found" always means "no source" — check whether the
  row's own `observance.type` is even the right shape for what it's trying to represent. The same
  lesson applies outside the saints corpus too: the Cycles of Prayer schema (§7) needed an analogous
  fix (a `cycleType` field) when Arkansas's own source turned out to be a day-of-month recurring cycle
  rather than a dated one — check whether a source's actual shape fits the schema before forcing it in.
- **Source-governance is required before inserting any new liturgical text — texts must not be
  fabricated, and the specific source/edition must be confirmed before transcription begins,** same
  discipline as the Bible-corpus translation registry. Applies to the Menaion corpus buildout (see
  §7) exactly as it applied to Bible translations.

---

## 5. Communication

Josh is extremely direct. Correct errors immediately, without softening or justification. No
walkthroughs of commands he already knows — check the repo/README for the answer before asking him to
repeat something that's already documented. **Ask directly and specifically for what you need** — his
words: *"I don't provide shit I'm not asked for. I'm not a mind reader."* Read pushback as an
instruction to work harder, but also as a genuine signal to stop and actually listen rather than push
the same thread forward.

**When Josh asks a direct, point-blank scope/status question, answer it directly and plainly in the
conversation — right then.** Do not let the answer exist only as an implicit note filed in a doc
somewhere and later point to that as if it constituted having told him. This is not a minor style
preference: on 2026-09-28, Josh asked directly whether "Horologion" meant the whole EO office or just
the specific book, in response to a "Horologion audit complete" claim. The distinction existed only as
scope notes in `project_roadmap.json` and this note, not as a direct answer to his direct question —
he called this the same category of dishonesty-by-omission that got Lucy fired, correctly. See §8 for
the substantive terminology rule this produced. The general lesson: a scope clarification filed in a
doc is not an answer to a person asking a direct question. When in doubt about whether something
already exists or is already finished, check before asserting it, and say plainly what you checked.

---

## 6. Source reachability — probed, not assumed

| Source | Reach |
|---|---|
| **Maclean 1894** via Drive `read_file_content` | Front matter through printed **p.34** only |
| Maclean via ACOE mirror / archive.org | ~p.45 / hard wall. **Do not retry either.** |
| **O'Leary 1911** via Drive `read_file_content` | Full. `download_file_content` is unusable (10MB cap, 40MB file) |
| **Hapgood 1906** (*Service Book of the Holy Orthodox-Catholic Apostolic Church*) | Full raw OCR text reachable via `archive.org/download/ServiceBookOfHolyOrthodoxChurchByHapgood/Service_Book_Orthodox_Church_Hapgood_djvu.txt` (verified 2026-09-28, contra the old note below — front matter is NOT all that's reachable). **Coverage confirmed 2026-09-28, checked against the actual raw text, not summarized:** covers all 9 fixed-date Great Feasts (pp.164-266ish) but each entry is abbreviated — Vespers "Lord I have cried" stichera (partial), one Litiya stanza, Troparion, Kontakion, and a Canon that gives ONLY the Irmosi (theme-songs) of each ode, not the full troparia. **Zero sessional hymns, praises/ainoi stichera, or exapostilaria anywhere in the book for the Great Feasts** — confirmed by full-text search. Not usable as a source for those branches of the Menaion corpus buildout (§7); usable for a fuller Kontakion/Ikos pairing and partial Vespers stichera only. Appendix B previously came from Josh directly. |
| **BCP 1979** | In repo, complete |
| **ODCC** | In repo but **no text layer at all**. Do not re-propose. |
| **Lambertsen Octoechos** | In copyright to ~2087; citable, not reproducible |
| **orthocal.info** (EOR, Slavic/OCA + Greek/Antiochian beta) | Direct MCP tools `search_saints` / `get_day` -- connector has been flaky across sessions, sometimes simply absent from the tool list for a whole turn with no error beyond "not available in this turn." When that happens: do not retry in the same turn; fall back to Wikipedia's compiled "Month Day (Eastern Orthodox liturgics)" pages rather than stalling. |
| **coptic.io** (OOR, Coptic) | **REMOVED 2026-09-28, per Josh's direct instruction: the `coptic_mcp_server.py` wrapper (both the repo-root copy and the `scripts/coptic-mcp-server.py` copy it had silently diverged from) was built specifically to support the Coptic Agpeya build; now that the Agpeya is finished, it is no longer needed, and both files were deleted.** If OOR sourcing work resumes and a coptic.io connector is wanted again, it would need to be rebuilt from scratch; the old build's own documented gotchas (the `mcp[cli]<2.0.0` pin, matching interpreter paths) are preserved in `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-07 entries even though the code is gone. **`api.coptic.io`'s underlying REST API is still directly reachable over plain HTTPS without any MCP wrapper** (`WebFetch` against `api.coptic.io/api/synaxarium/<YYYY-MM-DD>` and `.../search/query?q=<name>` both work) — use that directly rather than rebuilding the wrapper unless an MCP-specific need arises. Fallback if that's also unavailable: Wikipedia's per-Coptic-day pages, sourced from copticchurch.net/st-takla.org. |

**Any item needing Maclean past p.45 is blocked on Josh supplying pages.** Retrying will not change
it.

---

## 7. What is open — re-verified and condensed 2026-09-28, sourced per item

**Full evidence and step-by-step narrative for anything marked DONE/CLOSED/RESOLVED below lives in
`AUDIT_GOVERNANCE_LEDGER.md`'s dated entries and `documentation/project-history/VOLUME-5-2026-09-28-
session-log.md` — this section states current status only, not the story of how it got there.**

**`project_roadmap.json` (v0.1.44, updated 2026-10-01) now matches reality:** phases 0-3 done (phase_3
= Roman Breviary shipped); phases 4-8 (EO Russian/Slavic closeout, OO Coptic closeout, Church of the
East closeout, cross-family hardening, final beta gate) `not_started`. Oriental Orthodox's lane is the
Coptic Agpeya, not the removed Ethiopian Sa'atat. The three Roman LOTH governance questions are
`superseded`; the roadmap's old LOTH tranche history is retained but marked superseded/abandoned.

**Closed work from 2026-09-29/30 (five rounds of UI fixes; the profile/user system; the full Cycle of
Prayer ingestion; the Communion, Diocesan and Parish tiers) now lives in
`documentation/project-history/VOLUME-6-2026-09-29-to-09-30-cycle-of-prayer-and-ui.md`.** Current state
in one paragraph: all 92 Cycle of Prayer files validate (`npm run audit:cycles-of-prayer`); all three
tiers (Communion, Diocesan, Parish) render in BCP Morning/Evening Prayer after "A Prayer for Mission"
with their own rubric headings and sidebar entries; the profile (diocese + parish picker, "Other"
fallback, onboarding prompt) is built and live. Only ~18 jurisdictions with no located source remain
un-ingested (`tecDioceseRoster.noSourceFound` in `data/cycles-of-prayer/schema.json`), and dioceses
whose source is a rolling/partial window (West Missouri, Springfield, Easton, and similar) plus every
diocese's 2027 cycle need periodic re-checking. **The Parish tier DOES render (corrected 2026-10-01 -- an
earlier session wrongly reported it unwired): PR #90 / `84803f0` added it** (`CYCLES_OF_PRAYER_PARISHES`,
`loadCycleOfPrayerParishMonth` in `js/cycles-of-prayer.js`; render/refresh in `js/office-ui.js`). The only parish-tier file is St. Bede's, Forest Grove
(Western Oregon); a household-level "this is my family's day" surface is an undecided product question.

**Roman Breviary 1960/1962 is SHIPPED and live (corrected 2026-10-01 -- earlier versions of this note wrongly said "in active buildout").** All 8 hours, Roman general
calendar, Rubrics 1960/1962, calendar years 2026 and 2027 precomputed in Latin AND English
(`data/roman-breviary-1960-1962/manifests|units/{,en/}{2026,2027}.json`), generated from Divinum
Officium's own engine at a pinned commit; reachable from the main entry screen ("Catholic" card →
`latin-catholic` → `roman-breviary-dev` mode), tradition-availability `true`. See
`documentation/ROMAN_BREVIARY_1960_1962_BUILDOUT.md`. The modern Liturgy of the Hours lane (`roman_loth`,
JWJeffery/LOTH) was abandoned by Josh on 2026-09-27 and is superseded in `project_roadmap.json`. Open
Breviary follow-ups, if any, are Josh's to name — none are tracked here.

**PRIORITY 1 — Menaion hymn-family corpus transcription (Orthros). SOURCE SEARCH DONE 2026-10-01 —
Josh's decisions recorded below; nothing transcribed yet.** Full evidence in `structure.json`'s
`menaion-hymn-corpus-transcription` todo; branch classification is done (every sessional hymn / praises /
exapostilarion / feast Theotokion branch renders "not yet text-backed"/"is deferred"; only troparion +
27 kontakia have text). Result of the 2026-10-01 search for English, free-to-reuse sources of these
families: **no reachable, verifiably licensed source exists for feast-PROPER hymnography.** What exists:
- **Orloff, *The General Menaion* (London 1899; from the Slavonic 16th ed. of 1862) — public domain,
  Commons only.** CCEL (`ccel.org/ccel/anonymous/menaion/menaion.i.html`) is reachable; archive.org
  text downloads are blocked from the sandbox. Covers the Commons (Lord, Theotokos, Apostles, Martyrs,
  Hierarchs, Venerable...) — usable for rank 3/4 saints through a NEW `common-of-<type>` layer
  (`data/menaion` is keyed `MM-DD`, so this needs a schema extension and a type->common mapping); does
  NOT supply Great Feast propers. Cite the 1899 edition, not the 1969 AMS reprint. CCEL's own site terms
  not yet checked.
- **Hapgood 1906** — already audited; Kontakion/Ikos and partial Vespers stichera only.
- **Excluded (copyrighted / uncleared):** Festal Menaion (Mother Mary & Ware), HTM Menaion, Lambertsen
  (also the `typiconman/english-md` repo — its MIT license covers the markdown, not the translation),
  `brianglass/anastasis` (Ephrem Lash; permission still pending), OCA liturgics (all rights reserved),
  MCI Online Menaion, Saint Kosmas pages, Orthodox Wiki (share-alike, mostly quoted troparia).
- **Orthocal MCP** supplies feasts/readings/lives only — zero hymnography.
- **Unverified, not usable yet:** GOARCH Digital Chant Stand / AGES (`ocmc-olw`) — structurally the best
  fit, but Greek lane and license unconfirmed (believed non-commercial/no-derivatives; github.com is
  403 from the sandbox, so the license file could not be read).
**JOSH'S DECISIONS, 2026-10-01:**
1. **Use Orloff 1899 (CCEL)** for rank 3/4 saints via a new `common-of-<type>` data layer (needs a schema
   extension + a commemoration `type` -> common mapping; cite the 1899 edition, per-component provenance).
2. **"Free for non-commercial use" IS acceptable** as a license class, and **Greek-lane AGES texts MAY
   serve the Russian/Slavic lane** -- for the large gaps that remain after the Commons. Caveat: a
   no-derivatives clause (believed, unverified, to be on AGES) could still forbid restructuring the
   text into this app's data shape -- read the actual license before ingesting anything.
3. **Great Feast propers stay deferred** (no permission requests to be sent); keep the honest
   "not yet text-backed" rubrics.
4. **AGES LICENSES READ, 2026-10-01 -- two different AGES repos, two licenses (Josh supplied both).**
   `AGES-Initiatives/ages-alwb-templates` (the repo this note first pointed Josh to) carries "(c) Fr.
   Seraphim Dedes ... CC BY-NC-SA 4.0" (Josh pasted the full text). **`AGES-Initiatives/alwb-library-en-us-goadedes`
   -- "Translations by Fr. Seraphim Dedes for the Greek Orthodox Archdiocese of America", text under
   `alwb.library_en_US_goadedes/` -- is shown by GitHub as CC0-1.0 (public-domain dedication), per Josh's
   screenshot.** The texts we want live in the library repo, so CC0 is the governing license for them;
   Josh was asked to open its `LICENSE.md` to confirm the first lines. Standing policy until that is
   confirmed: voluntarily comply with the stricter BY-NC-SA terms (credit Fr. Seraphim Dedes + AGES in
   the app, keep the app non-commercial, do not imply AGES endorsement); ShareAlike is NOT treated as
   binding on the data files if CC0 is confirmed. The earlier 2026-09-28 "no copyrighted material" rule
   is amended by Josh's 2026-10-01 decision to allow free-for-non-commercial licenses. **Still not
   obtained: the texts themselves** -- GitHub is 403 from the sandbox; Josh was asked to download the
   library repo ZIP and put it in a Drive folder. CONTENT caveat (not a license one): AGES is Greek
   Archdiocese usage, so feast hymnography will not always match Russian/Slavic usage -- disclose that
   wherever used, and prefer Orloff (Slavonic-derived) wherever it applies.
**DONE 2026-10-01 -- Orloff Commons ingested and wired: 71 rank-3 saints (Orthros sessional hymns 1-2, canon,
exapostilarion, praises; Vespers stichera, aposticha) and 203 rank-4 saints (Vespers stichera only, Josh's decision)**;
live-verified across all 2026 dates. Record, scripts, mapping rules, limits: `documentation/MENAION_COMMONS_ORLOFF.md`.
**DONE 2026-10-01 -- Orthodox day data (Josh's "provide content" plan, items 2 and 3):** the day's FAST and the appointed
READINGS (Vespers paroemias, Matins Gospel, Epistle, Gospel incl. each saint's) for 2026-2027 from orthocal.info, shown by
`js/orthodox-day.js` in Vespers/Orthros/Typika. **Finding for Josh:** the engine's own Typika Epistle/Gospel table disagrees with the
published lectionary on ~half the days (166 of 338 compared); the new data replaces it for 2026-2027 -- see
`documentation/ORTHODOX_DAY.md`. Outside 2026-2027 the old engine logic still runs. **DONE 2026-10-01 -- item 1, batch 1: original short lives for the rank-3 commemorations** (77 published in
`data/menaion/lives/lives.json`, from research subagents using 2+ sources each; merged by `scripts/menaion/merge-lives.py`; shown as
"Commemorated Today" in Vespers/Orthros/Typika by `js/orthodox-day.js`, 2026-2027 new-calendar only). **The calendar/identity mismatches the research found were ALL FIXED the same day** (Jul 7 Thomas of Maleon; Apr 16 Agape/Irene/Chionia; May 5 Great Martyr Irene;
Jan 14 Nina only + Leavetaking of Theophany moved there; Tikhon -> 08-13, Innocent of Irkutsk -> 02-09, Royal Martyrs -> 07-04 so Menaion files are keyed by the Menaion date); evidence and resolution:
`documentation/MENAION_DATA_FINDINGS.md`. **DONE 2026-10-01 -- item 1, rank-4 batches:** lives for the rank-4 entries (now 300+ published in `data/menaion/lives/lives.json`). Entries the calendar
did not support got NO life and are listed with evidence in `documentation/MENAION_DATA_FINDINGS.md` (6 fixed by moving/renaming; ~10 still need Josh's
decision: move, rename or delete). **Next:** lives for the 45 rank 1-2 feasts/saints; then plan items 4-8.
**Open:** 8 rank-3 feasts stay unmapped (feast-name-template Commons); rank-4 Orthros not done; rank 1-2 feasts deferred.
**Data question for Josh:** the app lists 04-30 as "Apostle James, Brother of the Lord", but the AGES hymns (and the
calendar tradition) for Apr 30 are James the son of Zebedee -- please confirm which the app's entry should be.

**AGES (CC0 library, Fr. Seraphim Dedes) -- ingested and wired 2026-10-01 (partial by design).** Its day files mix the saint
with forefeast/afterfeast hymns, so every rank-3 day was read hymn by hymn: 36 saints use it for slots approved by rule or
by reading (Vespers stichera/aposticha, Orthros praises/exapostilarion/one sessional); everything else uses the Orloff
Common. Full record, rejections, limits: `documentation/MENAION_AGES.md`. The ZIP is NOT in the repo (re-ingest needs Josh
to re-supply it). **Open:** AGES for rank-4 days (not reviewed); rank 1-2 feasts untouched (Great Feast propers deferred).

**License status of sources not used:** CLEARLY copyrighted/not-granted -- Festal Menaion, HTM Menaion,
Lambertsen, OCA liturgics, Saint Kosmas pages ("All Rights Reserved"). UNCLEAR (no usable license
found, so unusable until clarified) -- Ponomar project texts
(site says free/credit/share-alike but hymn-text provenance unverified), MCI Online Menaion (no
license shown, mixed translations), Anastasis/Lash texts (repo says permission still being sought),
Orthodox Wiki (CC BY-SA, but hymn texts are mostly quoted from copyrighted books).

**NEW TODO, added 2026-09-28 per Josh's direct instruction — make the Google Drive "Anglican
Synaxarium" decision file the controlling TEC commemoration calendar.** Josh: "For TEC saints /
commemoration, incorporate the decision file in Google Drive (Anglican Synaxarium) and make that data
the controlling commemoration calendar for TEC in the app." **Located, not yet read or incorporated**
— a whole "Anglican Synaxarium" production project (not a single file) in Drive folder
`1MKGp9HIUS_y3y5LnSvcG3dlqjRvn1RAu`, owned by `josh@jwjeffery.org`:
- **`synaxarium-decisions-2026-09-07-cleaned.json`** (~600KB) — most likely candidate for "the
  decision file" Josh means; a cleaned JSON export, presumably of actual decided commemorations.
- **"An Anglican Synaxarium — Editorial Rules"** and **"— Production Workflow"** (Google Docs) — read
  these FIRST, before the decisions file itself.
- **"An Anglican Synaxarium — November 2026 Production Tracker"** (Google Sheet) — likely tracks
  in-progress status separately from the finished decisions file.
- Further per-date working documents also exist in/around this folder — an actively-maintained
  external pipeline, not a one-off export.

**Relationship to `synaxarium-review/`'s own candidate CSVs (see the bottom of this section) not yet
established** — both concern TEC/Anglican sanctoral data; whether the Drive project supersedes, feeds,
or is independent of that tool's candidate-matrix review needs to be understood before building an
incorporation. **Not started:** no file content read, no schema comparison against `data/saints/
sanctoral.json` ANG rows, no plan for how "controlling calendar" should be implemented. Read the
Editorial Rules and Production Workflow docs first, then the decisions JSON, before writing any code.

**Documentation/governance cleanup — scope is explicitly reduced, per Josh's direct instruction:
`AUDIT_GOVERNANCE_LEDGER.md` and `AUDIT_SOURCE_VERIFICATION.md` are OUT OF SCOPE for this cleanup
effort — do not audit either of them as part of it without Josh separately asking.** Everything else
in scope (scattered continuity/status documents, dated archive files, ad hoc structure snapshots) is
already consolidated into `documentation/project-history/` — see its `INDEX.md`.

**`structure.json`'s remaining open todo: `js/office-ui.js`'s innerHTML string-building (33 raw
writes) — still open, unaddressed.** (Its other listed todos are closed — see Volume 5 if the history
matters.)

**`whole-app-json-to-database-migration` — GATED, per Josh's explicit instruction: this must be done
LAST, after everything else on this list, and ONLY when Josh directly authorizes it starting — not
picked up proactively, not started because it happens to be next in some ordering, no exceptions.
Reason given: it will probably take a lot of tokens.** Do not begin any part of this item (not even
the inventory/scoping step below) without that direct authorization. Josh's own words, recorded in
`structure.json`: "the refactor needs to cover the whole thing not just the scriptures" — migrate
`data/bible/`, `data/saints/`, `data/menaion/`, `data/horologion/`, `data/kalendar/`, `components/`,
and every other JSON corpus off flat JSON files to a database-backed storage model. **NOT STARTED.
Nothing chosen yet** — no database technology, no timeline, no migration plan, for any domain. Before
scoping begins: (1) confirm with Josh whether the Bible registry doc's conceptual model (book
identity / text form / canon profile / translation witness / versification / reference map / resolver
contract) is the template every domain should mirror, or each domain gets its own; (2) inventory every
JSON corpus under `data/` and `components/` with rough size/entry-count first. Full detail in
`structure.json`'s `known_outstanding_issues` (id `whole-app-json-to-database-migration`, severity
MEDIUM) — read that entry directly before starting any work on it.

**Still not acted on, pre-existing and unrelated to any of the above:** `scripts/audit-shared-mode-
navigation-grammar`, `scripts/audit-app-navigation-architecture`, and `scripts/audit-shared-office-
sidebars` have pre-existing failures (stale `ethiopian-saatat` mode references, missing CSS markers)
that predate recent sessions and have not been investigated.

**The old "carried forward, not independently re-verified" bucket — checked and properly categorized
2026-09-28, per Josh's direct instruction.** These items are not all the same kind of blocked:

*Genuinely unblocked — need no research and no decision, can be started any session, per
`documentation/OPEN_ITEMS_FIXABILITY.md` Part 4:*
- **Formation prose: strip the editor's name from the explanation-layer prose.** Josh's own direction
  (2026-09-05): sources must not appear in the user-facing education text at all — the underlying fact
  should survive, the attribution shouldn't. Confirmed still present and unfixed: at least 23 exact
  instances of the pattern ("Hapgood explains," "O'Leary records," "Maclean's table shows," etc.) remain
  across `data/explanations/byzantine.json` (15), `coptic.json` (7), `east-syriac.json` (1) — the true
  count is likely higher, since this only caught a few exact phrasings, not every way an editor's name
  could appear. Purely mechanical rewriting, not blocked on anything.
- **Education-layer coverage extension.** Coverage currently ~49% of Coptic titles to ~57% of East
  Syriac components (last measured 2026-09-05/09-12, not re-measured this session). Deliberately
  excludes generic section headings and individual psalm citations. Content work within sources already
  held in the repo — no new source needed.

*Blocked on Josh's decision, not research:*
- **Royal Anthem sourcing.** Copyright. Two live options, neither authorized: an OIRSI/Moolan
  permission request, or a disclosed machine translation from Bedjan's public-domain Syriac. Genuinely
  unsourced after four leads across two sessions — do not re-research the same two routes without a new
  lead; this needs Josh to pick one, not more searching.

*Blocked on research (not a decision, not a missing page — a real unanswered historical question):*
- **Cathedral/Monastic content axis.** The **control** is live and working
  (`isEastSyriacCathedralMode()`, five call sites) — do not report this as broken. The **content**
  question is separate and open: `rubrics.json` itself records that the old two-parallel-hour-forms
  content axis was deliberately deleted because Maclean doesn't actually describe East Syriac hours that
  way (he describes one ferial form, separately from festival/Sunday/memorial forms) — rebuilding it
  needs that distinction actually researched, not assumed back into existence.

*Blocked on source availability — none identified yet:*
- **Coptic Prayer of the Veil.** O'Leary's seven-hour Coptic Agpeya translation (this project's main
  Coptic source) does not contain it. Needs a different Coptic liturgical edition; none found so far.

*Vague and likely stale — needs re-scoping before any work starts, not ready to pick up as-is:*
- **Horologion splash wiring.** The only record found: "Josh: needs a full audit, not there yet"
  (2026-09-04). No further detail exists anywhere in the ledger or project history. The splash/threshold
  screen has been substantially rebuilt since then (the `#uo-threshold` system dates to 2026-09-22-23,
  weeks after this was flagged) — whatever prompted this note may no longer apply to the current UI at
  all. Whoever picks this up should re-establish what "full audit" was even supposed to cover before
  starting, likely by asking Josh directly, not by guessing from this thin a record.

*Not Claude's work at all — a separate, already-built tool waiting on Josh's own hands-on review:*
- **The Anglican Kalendar remainder via `synaxarium-review/`.** The tool itself is done and ready
  (`synaxarium-review/validation-report.md`: 1,194 candidate rows total, full date coverage, zero
  missing SIN joins, zero malformed rows) — but **zero rows have been reviewed**. This is the entire
  remaining task — Josh going through all 1,194 candidate rows himself in the tool's own browser UI
  (`cd synaxarium-review && python3 -m http.server 8000`) and concurring/overriding/recording a
  decision for each civil date. Per standing project rule, `synaxarium-review/` is a separate project
  from the EOR/OOR sanctoral work above; do not extend it or build a parallel tool, and this review
  work is Josh's own editorial judgment to exercise, not something a session should attempt for him.

---

## 8. Settled — do not reopen

- **Charter §11 is CLOSED.** All four traditions carry all three explanatory depths, no scaffolds.
- **Depth default:** depth 1 on, higher depths user-selectable. Already shipped.
- **Middle Friday = the Friday of the FOURTH week of the Great Fast.** Wired.
- **Fast Evening Service is built** and renders correctly.
- **Coptic disclosure:** every Coptic depth-3 statement is explicitly about monastic use.
- Sidebar headings are uniformly "Office Settings". All screens have a dark-mode toggle. The "I'm not
  sure" splash option routing to Anglican is intentional. In-office tradition selectors are forbidden.
- **Do not use git authorship as provenance evidence** in this repo — Josh applies/authors every
  change regardless of what git shows.
- **`synaxarium-review/` is a separate project from the EOR/OOR sanctoral work** — see §2.
- **The EOR fifth pass (2026-09-07) fixed mismatches rather than leaving them flagged** — the standing
  expectation for a future EOR/OOR row with a wrong stored date is to FIX it, not just document it.
- **The full OOR calendar-year sweep (Jan-Dec) and the EOR calendar-year sweep are both CLOSED** as of
  2026-09-11/12 respectively, and the entire subsequent EOR/OOR sweep effort described in §7 above is
  also now fully closed as of 2026-09-28.
- **The Bible-corpus translation audit (KJV/KJVA, DRB, NRSV, NABRE, Rotherham across the canon) is
  DONE** — confirmed by Josh directly, 2026-09-28. Any document (there were several: a "HISTORICAL"
  note, `SESSION_START_SCRIPT.md`) suggesting otherwise or implying it's still in progress is stale;
  do not resume it without Josh explicitly reopening it.
- **Mobile prayer-reading window maximized, 2026-09-28** — `.uo-page` now takes ~73% of a 390×844
  mobile viewport instead of ~38%, prayer text visible on the first screen. Verified live across all
  five traditions; desktop unaffected. Full detail: Volume 5.
- **The ordinary-cycle Horologion office audit (14 offices) is DONE**, verified line-by-line against
  Maclean-equivalent primary sources as of 2026-09-26. **"Horologion" has two referents that must never
  be conflated without saying so explicitly: (1) the physical book, containing only the ordinary
  weekly cycle — what the "complete" claim above covers; (2) `js/horologion-engine.js`, the engine
  file that also renders every Menaion (feast-specific) integration point. The Menaion hymn corpus was
  never part of the "complete" claim and is not done — see §7, Priority 1.**
- **Defaults/Modes consolidation and Interhour gating are CLOSED, 2026-09-28** (Interhours correctly
  hidden/shown per `HorologionEngine.isInterhourAppointed()`; "Defaults" button removed, "Explore other
  Offices" toggle built and verified). Full detail: Volume 5.
- **Task #14 (tradition-selector naming) is fully CLOSED** — all five traditions (Anglican Communion,
  Catholic Church, Church of the East, Eastern Orthodox Church, Oriental Orthodox Church) read
  identically across every surface in the app: entry card, mode grid, profile dropdown, profile-summary
  sentence, office header, Book of Needs, admin panel, and the education-layer `traditionLabel` fields.
  Full detail (the several wrong intermediate states this went through before landing here): Volume 5.
- **`structure.json`'s Gloria Patri/Kyrie "duplication" item is CLOSED** — each tradition's wording is
  genuinely distinct and source-cited; there is no cross-tradition duplication to normalize.

---

## 9. Useful specifics

- Fresh clone: `git clone https://github.com/JWJeffery/PrayerAppNew.git`
- Explanations harness: `node scripts/explanations/verify_explanations.js` (needs
  `npm install jsdom --no-save`; remove `node_modules` and restore `package-lock.json` before
  committing).
- Integrity check worth running after any sequence edit: zero dangling component refs, all JSON
  valid, `node --check js/office-ui.js` and `node --check js/saints-resolver.js`.
- **Regression-testing `js/saints-resolver.js` changes**: it's a plain IIFE attaching
  `global.SaintsResolver`; `require` it directly in Node after setting `global.window = global` and
  stubbing whatever engine globals (`EthiopianCalendar`, `EastSyriacCalendar`, `ByzantinePaschalion`)
  the change touches. Build a small test harness, run it against a range of years (especially
  edge-case years for any weekday-search logic), and compare with/without each optional engine loaded
  before trusting a change to code this central.
- The Fast Ramsha sequences use placeholders resolved in `js/office-ui.js` by substring match against
  the day's own ordinary ramsha sequence -- not a hardcoded map. An unresolvable marker fails loudly
  by design.
- **Web release: `npm run release:web`** (`scripts/prepare-web-release.mjs`) builds a deployable static
  export for Josh to manually upload to theuniversaloffice.com -- there is no auto-deploy pipeline, this
  is the closest thing to one. As of 2026-09-28, it automatically splits into 3 independent zips
  (Roman Breviary data / remaining data / app shell) whenever the combined zip exceeds the ~30MB
  delivery-channel cap, instead of that being a manual step. Last run 2026-09-28: 4,308 files, 44.3MB
  combined, delivered as 3 zips (18.1/13.4/12.9MB) directly to Josh via the session's file-delivery
  tool.
- **For old narrative detail this note used to carry**, start at
  `documentation/project-history/INDEX.md` — six chronological volumes, 2026-07-06 through
  2026-09-30 (Volume 6 = the Cycle of Prayer/UI work), plus two point-in-time `structure.json` snapshots.
