# RESUME_PROJECT_NOTE.md

**Paste this at the start of a new conversation.** It is a handoff document, not a history — it
holds only what's currently true and currently open. The permanent narrative record of every past
decision and completed session lives in `documentation/project-history/` (start at its `INDEX.md`)
and `AUDIT_GOVERNANCE_LEDGER.md`. **Where this note and the repo disagree, the repo wins** — it may
have moved since this was written.

**Rewritten 2026-09-28**, consolidating what had again become an unwieldy, mixed current/historical
file (5507 lines) back down to just current material, per Josh's explicit direction that session —
this is at least the third time this note has needed this treatment (2026-07-17, 2026-09-04,
2026-09-28). If a future session finds this file growing past a few hundred lines of dated session
narrative again, that is itself a signal to split it into `documentation/project-history/` proactively,
not wait for Josh to ask a fourth time.

**FIRST MOVE, EVERY SESSION, NO EXCEPTIONS.** `git clone` fresh, then `git log --oneline -10` and
check `SEED_VERSION` in `audit-ledger.html`. Josh runs multiple Claude accounts/sessions against this
repo concurrently, so never trust this note's HEAD, SEED_VERSION, or "what's open" at face value —
verify against the live repo. Cache-bust params likewise: read them out of `index.html` rather than
trusting a number written here. Check for open, unmerged PRs before assuming your assigned branch is
the only work in flight — a branch has piled up unmerged before (2026-09-26) purely from not checking.

---

## Defaults/Modes consolidation and Interhour gating — CLOSED 2026-09-28 (continued)

**Branch-tracking gap, worth flagging so it doesn't happen again:** the session that built this
(commits `eb2aa9c`/`85c96ad`) worked on `claude/prayerappnew-project-4mvez9`. That branch was never
opened as a PR and was not merged into `main` before a *different*, parallel same-day session (the
mobile prayer-window audit, `97a0374`) merged straight to `main`. So for a few hours `main` and this
note disagreed about what was actually done — Josh asked about it and had to be walked through the
history to find the unmerged branch. **Fixed this session**: `claude/prayerappnew-project-4mvez9` was
fast-forward-merged into the current session branch (no conflicts — it already contained `main`'s tip
as an ancestor), so both pieces of work are now together on top of `main`. **Lesson for future
sessions**: before telling Josh something is "done and pushed," confirm it's pushed to a branch that
either *is* `main` or has an open PR against it — a push to an orphan feature branch with no PR is
easy to lose track of.

**Both fixes from Josh's screenshot of the Byzantine office picker are now fully done and verified:**

1. **Interhours hidden when not appointed.** `HorologionEngine.isInterhourAppointed(dateObj)`
   (`js/horologion-engine.js`) + `js/office-ui.js`'s `_updateHorologionOfficeButtons()` hide/disable
   the four Interhour rows on ordinary days, falling back to
   `_defaultHorologionOfficeForCurrentTime()` if the hidden office was selected. Live-verified:
   hidden 2026-09-28, visible 2026-06-08 (Apostles' Fast day 1), correctly re-hides and falls back
   when navigating back.

2. **"Defaults" removed, "Back to Modes" renamed to "Explore other Offices," hidden by default,
   toggled from Office Settings.** `office-profile-defaults-button` is gone from the DOM entirely.
   The single global button (`#app-mode-return-button`) is renamed and hidden unless
   `isExploreOtherOfficesVisible()` (localStorage key `uoExploreOtherOfficesVisible`) is true, via a
   checkbox row in `js/office-drawer.js`'s `buildKeep()` wired to `#toggle-explore-other-offices` in
   `index.html`. **The one previously-unverified step — opening the Office Settings drawer and
   actually clicking the new checkbox — was completed this session** (headless Chromium against
   `npm run start:spa`, script at `/tmp/.../scratchpad/verify-explore-toggle.mjs`, session-local):
   confirmed the drawer row renders, toggling it on both flips the hidden checkbox and makes the
   button visible with the correct label, clicking the button correctly returns to the mode-selection
   splash, the setting persists across leaving and re-entering an office, and toggling back off hides
   the button again. No console errors beyond the pre-existing, already-documented sandbox-proxy
   `ERR_CERT_AUTHORITY_INVALID`. Nothing left open on either fix.

Still not acted on: `scripts/browser-qc-user-profile-defaults-sweep.js` had its now-obsolete
Defaults-button check removed; a handful of *other* `scripts/audit-*.mjs` files
(`audit-shared-mode-navigation-grammar`, `audit-app-navigation-architecture`,
`audit-shared-office-sidebars`) were run to confirm no *new* regressions from this change — they do
have pre-existing, unrelated failures (stale `ethiopian-saatat` mode references, missing CSS
markers) that predate this session and were not touched or investigated further.

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
Byzantine (Horologion). Roman Breviary 1960/1962 is in active buildout (see §7).

A prior assistant, **Lucy**, was dismissed for falsely certifying content as accurate — the standing
comparison point for what NOT to do. All Lucy-era certifications are void and must be independently
re-derived. Nothing in this repo's own docs or `structure.json` counts as evidence on its own; verify
against primary sources. The Lucy-era saints generator/CI-gate architecture (identities.json,
commemorations.json, the whole build/import/validate toolchain) was removed entirely 2026-09-02 —
`js/saints-resolver.js` now reads `data/saints/saints-{month}.json` directly, no generation layer.
A broader audit of Lucy-era one-off validation scripts under `scripts/` is in progress (see §7).

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
- **Always work from the verified current state of the target branch.** Fetch/pull first and check
  `git log --oneline -1` before building on top of it.
- **Never use a bulk JSON dump (`json.dump()` or equivalent) on a huge file without version-controlled
  review** — prefer targeted edits. **Validate JSON before writing**, not after
  (`node -e "JSON.parse(...)"` is cheap insurance).
- **When scripting a bulk edit against `data/saints/sanctoral.json`, key on `(id, month, day)`, never
  `id` alone.** At least 58 duplicate `id` values existed in the file as of 2026-09-07 (status not
  re-verified since — check before assuming resolved). A blind id-keyed write silently clobbered
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
  row's own `observance.type` is even the right shape for what it's trying to represent.
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
| **coptic.io** (OOR, Coptic) | MCP tools `search_saints` / `get_day` / `get_day_coptic`, same flakiness pattern -- `coptic_mcp_server.py` (repo root) is a live wrapper Josh must keep running and port-forwarded (Public) in his Codespace for this connector to work at all. Not persistent. Last known status: broken as of 2026-09-11 (Josh has a support reference code), not rechecked since. Fallback: Wikipedia's per-Coptic-day pages, sourced from copticchurch.net/st-takla.org. |

**Any item needing Maclean past p.45 is blocked on Josh supplying pages.** Retrying will not change
it.

---

## 7. What is open — verified 2026-09-28, sourced per item

**PRIORITY 1 — Menaion hymn-family corpus transcription (Orthros).** Full detail and evidence in
`structure.json`'s `menaion-hymn-corpus-transcription` todo. Branch classification (honest-rubric vs.
deferred) for sessional hymns, praises, exapostilarion, feast Theotokion is done, verified directly
against `js/horologion-engine.js`. The actual corpus text for every one of those branches is
confirmed absent — every branch currently renders "not yet text-backed"/"is deferred." Only troparion
+ targeted kontakion has real resolved text (27 kontakia, frozen since the 2026-04-25 census). Source
decision made 2026-09-28: Hapgood only, public domain — which (per §6) cannot actually supply
sessional hymns/praises/canon-troparia/exapostilarion for any feast, only a fuller Kontakion/Ikos and
partial Vespers stichera. **Next action, not yet started:** confirm with Josh how to proceed given
that constraint (see the live conversation this note was written from) before transcribing anything.

**Documentation/governance cleanup, in progress as of 2026-09-28** (Josh's direction, same session as
the Menaion work above): scattered continuity/status documents (this note's own prior sprawl, dated
archive files, ad hoc structure snapshots) are being consolidated into `documentation/project-history/`
— see its `INDEX.md`. This note has just been rewritten as part of that effort. **Not yet done:** a
full line-by-line inventory of every todo across `AUDIT_GOVERNANCE_LEDGER.md` (23,523 lines),
`AUDIT_SOURCE_VERIFICATION.md`, `project_roadmap.json`'s governance questions, and
`data/bible/registry/bible-corpus-remediation-ledger.md` (already known stale, contradicted by a later
"fully done" claim — not yet reconciled). What's below is what's been verified so far, not a claim of
full coverage.

**`scripts/` audit for Lucy-era dead validation scripts — not yet started** (Josh's third instruction,
same session). 223 files under `scripts/`, ~100+ `audit:*` npm scripts in `package.json`. Needs
cross-referencing against actual recent use before anything is deleted.

**`structure.json`'s other open todos** (re-verified 2026-09-28, continued — see the file itself for
full evidence): the **Gloria Patri/Kyrie "duplication" item is now CLOSED, not open** — the prior
"still accurate" re-verification only checked that the phrase existed in multiple files, not what it
actually said. Direct text comparison found each tradition's wording is genuinely distinct and
source-cited (BCP vs. Maclean-1894-East-Syriac vs. O'Leary-1911-Coptic), and `comm-gloria-patri`/
`comm-kyrie` in `common.json` are not dead — both are live-referenced by `js/office-ui.js` (line 5097
and 5501) for the BCP lane's optional after-psalm doxology and short Kyrie versicle. There is no
cross-tradition duplication to normalize; doing so would have meant overwriting tradition-correct
translations with one, which is not a fix. `js/office-ui.js` innerHTML string-building (33 raw
writes) — still open, unaddressed. Two other todos (`rite-placeholder-fragility`,
`saints-schema-refactor`) were closed 2026-09-28 as already-fixed/obsolete respectively.

**`project_roadmap.json` — verified 2026-09-28:** 3 of 11 governance questions still open, all
`blocks_beta: true` — `bcp-public-hardening` (what defects remain in the BCP public-beta path),
`ethiopian-release-scope` (what Sa'atat depth is required), `hudra-release-scope` (what East Syriac
Hudra depth is required). Phase plan: phase_3 (Roman Catholic Divine Office private control corpus) is
`active`; phases 4-8 (EO Russian/Slavic closeout, OO Ethiopian closeout, Church of the East Hudra
closeout, cross-family hardening, final beta gate) are all `not_started`.

**Live UI bug queue (the ad hoc "Task #N" reports Josh sends during sessions) — as of the last entries
in `documentation/project-history/VOLUME-4-2026-09-07-to-09-28.md`:**
- Task #14 — tradition-selector naming: one real bug fixed (stale LOTH text). A broader question is
  still open and explicitly left for Josh: the entry-card screen and the mode-grid name three of five
  traditions differently for the same lane (e.g. entry-card "Catholic" vs. mode-grid "Roman Breviary
  1960/1962") — whether to unify, and which name should win, is Josh's editorial call.
- Task #15 — **stale row, actually CLOSED.** This note had it as "not yet picked back up," but
  `4e0f6d0` ("Fix task #15 for real...") already shipped the outer-budget `max-height` fix to
  `css/office-shell.css` and is already on `main` (an ancestor of the mobile-audit merge, `97a0374`).
  Re-verified live 2026-09-28 (continued): zero body-level scroll on `#uo-threshold-grid` at
  1512×900, zero console errors. Nothing left to do here.
- All other numbered tasks (#2, #9, #10, #11) from that queue are closed as of 2026-09-28 — see Volume
  4 for evidence per item.

**Sanctoral (EOR/OOR) confirmation-and-gap-sweep — paused, not active, since 2026-09-12** (the project
moved to UI redesign work and hasn't returned). Genuinely still-open items (never resolved, not
re-checked since first flagged — see `documentation/project-history/VOLUME-4-2026-09-07-to-09-28.md`
for the full per-item list): a set of same-figure-different-day editorial questions (Seven Holy Youths
of Ephesus, Prophet Micah, Prophet Malachias, Bessarion, Amos, Julietta/Cyriacus, Bartholomew, Moses,
Hilarion, St Anne, Clement of Rome, Gregory Thaumaturgus, Holy Innocents, Anthony the Great, Timothy
the Apostle — dates and specifics in Volume 4); the `coptic.io` connector's broken status (§6); at
least 58 duplicate `id` values in `data/saints/sanctoral.json` (found 2026-09-07, not yet resolved).

**Carried forward, not independently re-verified this session** — Formation prose editor-name strip,
Education-layer coverage extension, Royal Anthem sourcing (genuinely unsourced after four leads across
two sessions — do not re-research the same ones without a new lead), Cathedral/Monastic content axis
(control is live, content question open, see `documentation/OPEN_ITEMS_FIXABILITY.md`), Coptic Prayer
of the Veil, Horologion splash wiring, the Anglican Kalendar remainder via `synaxarium-review/`. Full
detail on each in `documentation/project-history/` Volumes 3-4.

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
  2026-09-11/12 respectively — see §7 for what's still open within the broader sanctoral effort.
- **The Bible-corpus translation audit (KJV/KJVA, DRB, NRSV, NABRE, Rotherham across the canon) is
  DONE** — confirmed by Josh directly, 2026-09-28. Any document (there were several: a "HISTORICAL"
  note, `SESSION_START_SCRIPT.md`) suggesting otherwise or implying it's still in progress is stale;
  do not resume it without Josh explicitly reopening it.
- **The ordinary-cycle Horologion office audit (Vespers, Grand Compline, the four Hours, Typika,
  Orthros's skeleton, Midnight Office, Small Compline, the four Interhours — 14 offices) is DONE**,
  verified line-by-line against Maclean-equivalent primary sources as of 2026-09-26. **"Horologion" has
  two referents that must never be conflated without saying so explicitly: (1) the physical book,
  containing only the ordinary weekly cycle — what the "complete" claim above covers; (2)
  `js/horologion-engine.js`, the engine file that also renders every Menaion (feast-specific)
  integration point. The Menaion hymn corpus was never part of the "complete" claim and is not done —
  see §7, Priority 1.** This distinction, and the accountability failure that came from not stating it
  plainly when asked, is recorded in full in this file's git history (2026-09-28 commit) and in
  `documentation/project-history/VOLUME-4-2026-09-07-to-09-28.md`'s terminology-correction entry.

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
- **For old narrative detail this note used to carry**, start at
  `documentation/project-history/INDEX.md` — four chronological volumes, 2026-07-06 through
  2026-09-28, plus two point-in-time `structure.json` snapshots.
