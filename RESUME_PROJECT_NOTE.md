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
Byzantine (Horologion). Roman Breviary 1960/1962 is in active buildout — no dedicated §7 status item
exists for it; the only current pointer is `project_roadmap.json`'s phase plan (§7, phase_3 "active").

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

**PRIORITY 1 — Menaion hymn-family corpus transcription (Orthros).** Full detail and evidence in
`structure.json`'s `menaion-hymn-corpus-transcription` todo. Branch classification (honest-rubric vs.
deferred) for sessional hymns, praises, exapostilarion, feast Theotokion is done, verified directly
against `js/horologion-engine.js`. The actual corpus text for every one of those branches is
confirmed absent — every branch currently renders "not yet text-backed"/"is deferred." Only troparion
+ targeted kontakion has real resolved text (27 kontakia, frozen since the 2026-04-25 census). Source
decision made 2026-09-28: Hapgood only, public domain — which (per §6) cannot actually supply
sessional hymns/praises/canon-troparia/exapostilarion for any feast, only a fuller Kontakion/Ikos and
partial Vespers stichera. **Next action, not yet started:** confirm with Josh how to proceed given
that constraint before transcribing anything.

**The profile/user system is BUILT and live-verified end to end** (`displayName`, `isSuperUser` +
Bible Browser gating, `cycleOfPrayerDiocese`/`cycleOfPrayerParish`, one-time onboarding prompt — all
on the existing `UNIVERSAL_OFFICE_USER_PROFILE_DEFAULTS` in `js/office-ui.js`, not a second parallel
system). Nothing open here. Full build/verification detail: Volume 5.

**OPEN — Authorized Intercessions text, after "A Prayer for Mission" in BCP Morning/Evening Prayer.**
Josh: "Add the 'authorized intercessions' after the Prayer for Mission that I asked for yesterday."
**The rubric slot already exists and is not new work** — `e6b301c` built the placeholder (a fixed
component `bcp-hymn-anthem-intercessions-rubric` in `components/anglican.json`, "Here may be sung a
hymn or anthem." / "Authorized intercessions and thanksgivings may follow.", inserted into both
Morning and Evening Prayer immediately after "A Prayer for Mission") deliberately as rubric space
ONLY, no intercession text. **This TODO is filling that slot with the actual Authorized Intercessions
prayer text(s)** — per Josh's own framing, in TEC practice these are the Communion / Provincial /
Diocesan / Parish cycles of prayer, which is why the profile system above needed Diocese/Parish
selection before the diocesan/parish tiers could render — the Communion-wide and Province-wide tiers
presumably don't vary by person and could ship as static content independent of the profile system;
whoever picks this up should decide with Josh whether to ship those first or wait and do all four
tiers together. **A Venite-app screenshot Josh showed was a location reference only, not a design to
copy** — confirmed explicitly: "I know that Venite does not fill it with prayer text. But that is
where I want it" (Venite fills the same rubric slot with a "PRAYERS AND THANKSGIVINGS" link and a
meditation timer; Josh wants actual prayer text at that slot instead). **No source text for any tier
gathered yet — Josh said he'll supply it.**

**Diocesan Cycle of Prayer corpus (`data/cycles-of-prayer/`) — storage, schema, and app-UI wiring all
exist; content ingestion is ongoing, most of the roster still to do.** `data/cycles-of-prayer/
schema.json` is the governing spec (file/entry/subject shapes, `cycleType` — `"dated"` for a
weekly/daily cycle keyed by ISO date within a stated `year`, `"monthly-recurring"` for a standing
day-of-month cycle with no year, added 2026-09-28 when Arkansas's own source turned out not to be
date-anchored at all) — read it before adding another diocese. `scripts/cycles-of-prayer/validate.mjs`
(`npm run audit:cycles-of-prayer`) validates every file; `js/cycles-of-prayer.js`'s
`CYCLES_OF_PRAYER_DIOCESES` registry and the profile diocese `<select>` in `index.html` must both be
hand-kept in sync with whatever `.json` files actually exist — **a file with no matching registry/UI
entry silently does nothing.** **6 dioceses currently in the corpus, all passing the validator:**
Western Oregon, Alaska, Arizona, Albany, Alabama (all `cycleType: "dated"`), Arkansas
(`cycleType: "monthly-recurring"`). **83 of the 88 dioceses in Josh's Google Drive TEC roster
spreadsheet remain — not started.** Adding one: transcribe directly from that diocese's own published
document (never from memory), check whether its source is actually date-anchored or a standing
recurring cycle BEFORE picking a `cycleType` (do not force one shape into the other), disclose
anything ambiguous in the file's own `notes`, run the validator, and add the registry/UI entries.
Full per-diocese transcription detail (what each one's source actually looked like, every disclosed
judgment call): `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-28 entry for this batch.

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

**`project_roadmap.json` current phase-plan status:** phase_3 (Roman Catholic Divine Office private
control corpus) is `active`; phases 4-8 (EO Russian/Slavic closeout, OO Ethiopian closeout, Church of
the East Hudra closeout, cross-family hardening, final beta gate) are all `not_started`. 8 governance
questions remain in the file, none `blocks_beta: true` and open.

**Live UI bug queue (the ad hoc "Task #N" reports Josh sends during sessions): nothing outstanding.**
Every numbered task through #15 is closed as of 2026-09-28 (naming consistency, mobile scroll,
others) — see `documentation/project-history/VOLUME-4-2026-09-07-to-09-28.md` and Volume 5 for
per-item evidence if a future report seems to contradict this.

**Sanctoral (EOR/OOR) work: fully closed as of 2026-09-28 — the 13-month Coptic gap sweep, the
18-entry coptic.io cross-check (17 confirmed, 1 disclosed exception — `saint-onesiphorus-of-the-
seventy`, Apr 3, no match found on coptic.io, kept on Wikipedia/St-Takla.org sourcing alone), the
15-question same-figure-different-day list (13 resolved, 2 needed and got Josh's direct call), the
duplicate-`id` audit (zero exact `(id, date)` collisions found; two genuine identity collisions fixed
by id-split), and the `mar-abraham`/`mar-abraham-of-qidun` id-collision cleanup.** Nothing open here;
full narrative in Volume 5 if a discrepancy is ever suspected.

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
  `documentation/project-history/INDEX.md` — five chronological volumes, 2026-07-06 through
  2026-09-28 (twice, same day), plus two point-in-time `structure.json` snapshots.
