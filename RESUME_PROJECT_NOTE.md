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
  `id` alone.** 40 duplicate `id` values remain as of 2026-09-28 (down from the 58 first found
  2026-09-07, after that count was finally investigated rather than just re-checked for size — see
  §7). All 40 are the corpus's normal same-figure/different-tradition-date pattern, re-confirmed to
  have zero exact (id, date) collisions; two genuine identity collisions found in the same pass
  (`saint-boniface`, `mar-michael`) were fixed by id split. A blind id-keyed write silently clobbered
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
| **coptic.io** (OOR, Coptic) | **REMOVED 2026-09-28, per Josh's direct instruction: the `coptic_mcp_server.py` wrapper (both the repo-root copy and the `scripts/coptic-mcp-server.py` copy it had silently diverged from -- see the scripts/-audit entry below for that finding) was built specifically to support the Coptic Agpeya build; now that the Agpeya is finished, it is no longer needed, and both files were deleted.** It had also seen secondary use as an OOR sanctoral-sweep verification tool (§7's "paused, not active" gap sweep) -- flagged to Josh at removal time in case that affects resuming that work, but the removal stands as instructed. If OOR sourcing work resumes and a coptic.io connector is wanted again, it would need to be rebuilt from scratch; the old build's own documented gotchas (the `mcp[cli]<2.0.0` pin, matching interpreter paths) are preserved in `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-07 entries even though the code is gone. Fallback, unaffected by the removal: Wikipedia's per-Coptic-day pages, sourced from copticchurch.net/st-takla.org. |

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

**NEW TODO, added 2026-09-28 per Josh's direct instruction — the profile/user system.** Josh: "Create
the profile / user system that we have talked about multiple times" — this has apparently come up
repeatedly in prior conversation, not previously written down as a tracked item; recording it now so
it stops being lost. Requirements, as given directly, not yet elaborated or designed by any session:

- **Track, per profile:** the tradition the person selected, and any sub-tradition within it (Josh's
  own example: Ancient Church of the East vs. Assyrian Church of the East — presumably the existing
  Church of the East split already wired elsewhere in this app, see COE-era architecture docs, not a
  new distinction to invent).
- **Track:** whether the person is ordained, and at what level (deacon/priest/bishop, presumably — not
  specified further), OR whether they hold a minor order / lay ministry role instead. This almost
  certainly should reuse the existing role vocabulary already built for the Book of Needs role ladder
  (`profile-ministry-role` / `book-of-needs-role-access-governance.json` — lay, reader, subdeacon,
  deacon, priest, bishop, monastic, research/reference, all — see §9's Book of Needs role ladder item)
  rather than inventing a second, parallel role taxonomy; confirm with Josh whether this profile system
  and that existing role ladder are meant to be the same underlying data or two different things before
  building.
- **First-time open:** the profile should already show whatever tradition/entry info the person has
  already provided through the app's existing entry flow (the tradition-entry/mode-selection screens,
  `getUserEntryDefault()` etc. — see §0a/§0b), not ask for it again from scratch, then prompt for name
  and role type.
- **Super-user flag:** a way to mark a profile as a super-user (Josh's own account, explicitly —
  "record a super-user (ME)"). Critically, **only an existing super-user can designate a new one** —
  not self-assignable by an ordinary visitor. Needs a real design answer for how the very first
  super-user gets created (a bootstrap problem inherent to this rule), and for whether "super-user" can
  be enforced with any real integrity given this app currently has no server-side auth or account
  system at all — everything client-side today is `localStorage`-based user-profile data (see
  `user-profile-defaults` in `index.html`), which any visitor can edit directly in their own browser's
  devtools. **Flagging this explicitly, not deciding it:** a purely client-side "super-user" checkbox
  would not actually gate anything against a visitor who simply flips it themselves; whoever picks this
  up should research what level of real enforcement this app's architecture can support (a server-side
  component, a shared secret/passphrase, or accepting that this is a soft/cosmetic gate for a
  single-maintainer app rather than genuine access control) before building, per this project's own
  standing practice of researching an architecture question before writing code for it.
- **Access control:** only super-users should have access to the Bible Browser. Checked this session:
  the Bible Browser tool button (`index.html`, `openBibleBrowser()`) currently carries NO
  `app-advanced-only`/`data-advanced-only` gating at all — it's a plain, unrestricted button, unlike the
  adjacent Admin Console button right next to it, which already uses that exact gating pattern. So this
  is a genuine net-new restriction, not tightening something partially gated already; the existing
  `app-advanced-only` mechanism (already used for the Admin Console and the Local Browser Defaults
  panel) is the obvious pattern to extend to a real super-user check, once that check exists.
- **Diocese / Parish affiliation — added 2026-09-28 (continued), per Josh's direct follow-up.** The
  profile needs a way for the person to select which Diocese and Parish they belong to. Purpose, given
  directly by Josh: this feeds the "authorized intercessions" item immediately below — TEC's own
  Communion / Provincial / Diocesan / Parish cycles of prayer are each scoped to a specific
  jurisdiction, so the app needs to know which diocese/parish a person belongs to before it can show
  the right diocesan- and parish-level cycle content (the Communion- and Province-wide cycles are the
  same for everyone and don't need this, but Diocesan and Parish do). Not designed further than that:
  no diocese/parish reference data exists anywhere in this repo yet (checked, zero hits for "cycle of
  prayer" or "Diocesan Cycle" in any `.json`/`.md` file) — a future session will need to research where
  authoritative Diocese/Parish lists come from (TEC's own directory, if machine-readable) before
  building a selector, not invent one.

Not designed, not scoped into phases, not estimated — this is Josh's request recorded as given, for a
future session to plan properly (research existing patterns in this codebase first, per standing
practice) before any code is written.

**NEW TODO, added 2026-09-28 (continued) per Josh's direct instruction — Authorized Intercessions
content, after A Prayer for Mission in BCP Morning/Evening Prayer.** Josh: "Add the 'authorized
intercessions' after the Prayer for Mission that I asked for yesterday." **The insertion point already
exists and is not new work** — `e6b301c` ("Add the authorized-intercessions rubric space to BCP
Morning/Evening Prayer") already built the placeholder: a new fixed component
`bcp-hymn-anthem-intercessions-rubric` (`components/anglican.json`) reading "Here may be sung a hymn or
anthem.\nAuthorized intercessions and thanksgivings may follow.", inserted into both the Morning and
Evening Prayer sequences immediately after "A Prayer for Mission" via `bcpEmitBare()` (so it correctly
gets no rail entry, as a procedural rubric rather than a titled prayer). That commit's own message is
explicit that it was deliberately the rubric space ONLY, "no intercession texts, which he'll supply in
a future session" — **this TODO is that future session's work: add the actual Authorized Intercessions
prayer text(s) at that same slot**, not rebuild the slot itself.

**Directly tied to the Diocese/Parish item above:** per Josh's own framing, "authorized intercessions"
in TEC practice are the Communion / Provincial / Diocesan / Parish cycles of prayer, which is why the
profile system needs to know a person's Diocese/Parish before it can render the diocesan- and
parish-level tiers correctly — the Communion-wide and Province-wide tiers presumably don't vary by
person and could ship without the profile work, but the Diocesan/Parish tiers cannot. Whoever picks
this up should decide (with Josh) whether to ship the Communion/Province tiers first as static content
independent of the profile system, or wait and do all four tiers together once Diocese/Parish selection
exists. No source text for any tier gathered yet — Josh said he'll supply it.

**A screenshot of the Venite app (Forward Movement's Episcopal daily office app) was shown 2026-09-28
(continued) as a location reference, NOT a design to copy — confirmed explicitly by Josh: "I know that
Venite does not fill it with prayer text. But that is where I want it."** In Venite, immediately after
the same two rubric lines this project already has ("Here may be sung a hymn or anthem." / "Authorized
intercessions and thanksgivings may follow."), it shows a "PRAYERS AND THANKSGIVINGS" link and a
"MEDITATE FOR [N] minutes" timer control — that is Venite's own choice for how to fill this rubric slot
and is explicitly NOT what this project should build. **What Josh wants at this exact slot (same
location, after "A Prayer for Mission," same two rubric lines already in place) is actual prayer
text** — the Diocese/Parish-driven Communion/Provincial/Diocesan/Parish cycle-of-prayer content
described above, not a link or a timer. The screenshot's only purpose was to confirm the insertion
point, which this project already has correct.

**NEW TODO, added 2026-09-28 (continued) per Josh's direct instruction — make the Google Drive
"Anglican Synaxarium" decision file the controlling TEC commemoration calendar.** Josh: "For TEC
saints / commemoration, incorporate the decision file in Google Drive (Anglican Synaxarium) and make
that data the controlling commemoration calendar for TEC in the app." **Located, not yet read or
incorporated** — a Google Drive search this session found a whole "Anglican Synaxarium" production
project, not a single file, in a Drive folder (`1MKGp9HIUS_y3y5LnSvcG3dlqjRvn1RAu`) owned by
`josh@jwjeffery.org`:
- **`synaxarium-decisions-2026-09-07-cleaned.json`** (~600KB, created 2026-09-08, last modified
  2026-09-07) — the most likely candidate for "the decision file" Josh means; a cleaned JSON export,
  presumably of actual decided (not pending) commemorations.
- **"An Anglican Synaxarium — Editorial Rules"** (Google Doc) and **"An Anglican Synaxarium —
  Production Workflow"** (Google Doc) — read these FIRST, before touching the decisions file itself;
  they almost certainly explain the methodology behind how those decisions were reached and what the
  data actually represents.
- **"An Anglican Synaxarium — November 2026 Production Tracker"** (Google Sheet) — likely tracks
  in-progress/ongoing production status, separate from the finished decisions file.
- An `instructions.txt` and further per-date working documents (e.g. "November 10–12 — Commission and
  QC") also exist in and around this folder — this looks like an actively-maintained external
  production pipeline, not a one-off export.

**This appears to be a separate, more developed effort than `synaxarium-review/`'s own candidate CSVs
(§7 below) — relationship between the two not yet established.** Both concern TEC/Anglican sanctoral
data; whether the Drive project supersedes, feeds, or is entirely independent of the
`synaxarium-review/` tool's candidate-matrix review needs to be understood before building an
incorporation, not assumed. **Not started:** no file content read, no schema comparison against this
app's own `data/saints/sanctoral.json` ANG rows, no plan for how "controlling calendar" should actually
be implemented (replace ANG-tagged sanctoral rows outright, layer on top via `traditionObservance`-style
override, or something else). Whoever picks this up should read the Editorial Rules and Production
Workflow docs first, then the decisions JSON, before writing any code.

**Documentation/governance cleanup — SCOPE REDUCED 2026-09-28 (continued), per Josh's direct
instruction: "AUDIT_GOVERNANCE_LEDGER.md (23,500+ lines), AUDIT_SOURCE_VERIFICATION.md can be skipped
as part of this."** Scattered continuity/status documents (this note's own prior sprawl, dated archive
files, ad hoc structure snapshots) are being consolidated into `documentation/project-history/` — see
its `INDEX.md`. This note has been rewritten repeatedly as part of that effort. **Within the reduced
scope, both remaining pieces are now handled:** `project_roadmap.json`'s governance questions were
inventoried this session (3 stale `blocks_beta` questions removed outright, see above); the
`data/bible/registry/bible-corpus-remediation-ledger.md` stale-vs-"fully done" contradiction is already
resolved — §8 below already states the Bible-corpus translation audit is DONE, confirmed by Josh
directly 2026-09-28, and that any document suggesting otherwise (this ledger file included) is stale
and not to be treated as current. **Do not line-by-line reconcile that 1,031-line file against the
audit** — the outcome is already settled by Josh's own direct word; reconciling it further would just
be re-litigating a closed question. `AUDIT_GOVERNANCE_LEDGER.md` and `AUDIT_SOURCE_VERIFICATION.md`
remain explicitly out of scope for this cleanup effort — do not audit them as part of this without
Josh separately asking for that.

**`scripts/` audit for Lucy-era dead validation scripts — DONE, not "not yet started."** This note had
it wrong. `eb94c0c` ("Remove 107 dead Bible-corpus-audit scripts from the Lucy era") already did the
real work: built a transitive reachability graph from package.json's actual npm-script entry points
(92 of 223 files genuinely reachable), verified with `node --check` and by actually running a
reachable script post-deletion, then deleted only the 107 unreachable files that were also
unambiguously Bible-corpus-audit-specific — the exact category Josh named. Five categories of
unreachable-but-not-obviously-dead files were deliberately excluded pending individual judgment
rather than swept blind; see that commit's own message for the full list (Vulgate/Roman-Breviary
boundary scripts, `scripts/saints/*`, `scripts/coe-calendar/*`, Roman Breviary build/import scripts,
`scripts/explanations/verify_explanations.js`). **Both remaining loose ends from that list closed out
2026-09-28 (continued):** `scripts/parse-officium-html.mjs` ("no clear closed subsystem, left for
individual review") is confirmed live — imported directly by `scripts/build-roman-breviary-full-sweep.mjs`
and `scripts/build-roman-breviary-oracle-blocks.mjs`, documented as core Roman Breviary tooling in
`documentation/ROMAN_BREVIARY_1960_1962_BUILDOUT.md` and multiple ledger entries. Nothing to delete.
`scripts/coptic-mcp-server.py` vs. root `coptic_mcp_server.py` ("a likely stale duplicate, not deleted
without confirming which one Josh actually runs") turned out not to be a stale-duplicate cleanup
question at all — the two copies had genuinely diverged in content (see this note's own git history
for that finding). Moot now regardless: Josh confirmed both were built specifically for the Coptic
Agpeya build and, with the Agpeya finished, had both deleted 2026-09-28 — see the coptic.io row in the
source-reachability table above (the root copy, `coptic_mcp_server.py`, was never part of the
`scripts/` count). 115 files remain in `scripts/`, all now accounted for.

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

**MISSING FROM THIS LIST UNTIL NOW, per Josh's direct catch 2026-09-28 (continued): the file-system
refactor — `whole-app-json-to-database-migration`.** **GATED, per Josh's explicit instruction the same
day: this must be done LAST, after everything else on this list, and ONLY when Josh directly authorizes
it starting — not picked up proactively, not started because it happens to be next in some ordering, no
exceptions. Reason given: it will probably take a lot of tokens.** Do not begin any part of this item
(not even the inventory/scoping step below) without that direct authorization, however open-ended a
session's remaining time or however tempting the size of this todo looks. Surfaced in `structure.json`
the same day this note was last rewritten but never carried into this §7 list, so a session reading
only this note (not also `structure.json` directly) would have missed it entirely. Josh's own words,
recorded there: "the
refactor needs to cover the whole thing not just the scriptures" — the only prior written record
(`documentation/BIBLE_REGISTRY_ARCHITECTURE.md`) was Bible-corpus-scoped only; the actual intent is
broader — migrate `data/bible/`, `data/saints/`, `data/menaion/`, `data/horologion/`, `data/kalendar/`,
`components/`, and every other JSON corpus in the app off flat JSON files to a database-backed storage
model, since JSON is not an efficient use of space for this project generally. **NOT STARTED. Nothing
chosen yet** — no database technology, no timeline, no migration plan, for any domain. Before scoping
begins: (1) confirm with Josh whether the Bible registry doc's conceptual model (book identity / text
form / canon profile / translation witness / versification / reference map / resolver contract) is the
template every domain should mirror, or each domain gets its own; (2) inventory every JSON corpus under
`data/` and `components/` with rough size/entry-count first. Full detail in `structure.json`'s
`known_outstanding_issues` (id `whole-app-json-to-database-migration`, severity MEDIUM) — read that
entry directly rather than just this summary before starting any work on it.

**`project_roadmap.json` — the 3 `blocks_beta: true` questions REMOVED outright 2026-09-28
(continued), per Josh's direct instruction ("Remove all of this trash").** `bcp-public-hardening`,
`ethiopian-release-scope`, and `hudra-release-scope` — all three orphaned (owned by "Lucy" and/or
"Marissa," neither an active role) — are deleted from `governance_questions`, not marked superseded.
Nothing left open in that file requiring an owner who no longer exists. 8 governance questions remain
in the file, none `blocks_beta: true` and open (the rest are `superseded`, `deferred`, or `answered` —
see the file itself, not re-summarized here). Phase plan: phase_3 (Roman Catholic Divine Office private
control corpus) is `active`; phases 4-8 (EO Russian/Slavic closeout, OO Ethiopian closeout, Church of
the East Hudra closeout, cross-family hardening, final beta gate) are all `not_started`.

**Live UI bug queue (the ad hoc "Task #N" reports Josh sends during sessions) — as of the last entries
in `documentation/project-history/VOLUME-4-2026-09-07-to-09-28.md`:**
- Task #14 — tradition-selector naming: one real bug fixed (stale LOTH text). The broader
  naming-consistency question is **mostly resolved 2026-09-28 (continued), Josh's direct call on each
  pair.** Anglican ("Anglican" / "Daily Office"), Catholic ("Catholic" / "Roman Breviary 1960/1962"),
  and Oriental Orthodoxy ("Oriental Orthodoxy" / "Coptic Agpeya") are fine as-is, no change. Eastern
  Orthodoxy's mode-grid card renamed "Eastern Orthodoxy" → **"Horologion"** (`index.html`, done). **Church
  of the East is the one still open:** Josh proposed renaming its mode-grid card to "the Ramsha" but
  wrote it with a question mark; flagged back rather than applied, since the card's own subtitle already
  names the actual office-book as "Hudra" ("The East Syriac Hudra office stream...") and Ramsha is one
  specific office (Evening Prayer) within the Hudra, not the whole-book name every other renamed card
  uses — possible he meant "Hudra," or he genuinely wants a specific-hour name here unlike every other
  lane. **Needs Josh to confirm which before this gets touched.**
- Task #15 — **stale row, actually CLOSED.** This note had it as "not yet picked back up," but
  `4e0f6d0` ("Fix task #15 for real...") already shipped the outer-budget `max-height` fix to
  `css/office-shell.css` and is already on `main` (an ancestor of the mobile-audit merge, `97a0374`).
  Re-verified live 2026-09-28 (continued): zero body-level scroll on `#uo-threshold-grid` at
  1512×900, zero console errors. Nothing left to do here.
- All other numbered tasks (#2, #9, #10, #11) from that queue are closed as of 2026-09-28 — see Volume
  4 for evidence per item.

**Sanctoral (EOR/OOR) sweep — CORRECTED 2026-09-28 (continued), by Josh's direct question. This was
three different things bundled under one "paused, not active" label, and that label was wrong for the
biggest of the three.** Checked directly against the corpus, not against prose claims, after finding
the ledger's own detailed record of this had a gap (no session headers at all between 2026-06-30 and
2026-09-23 anywhere in `AUDIT_GOVERNANCE_LEDGER.md` — git history has the same gap, nothing committed
in that whole window; `07dd77f`, 2026-09-23, is a full repo restore, not organic history).

1. **The core 13-month gap-fill sweep (find commemorations missing from all 12 Coptic months plus the
   intercalary Pi Kogi Enavot, add them) — ACTUALLY DONE, 2026-09-11. Not open.** An older version of
   this note said so explicitly ("OOR 13-month gap sweep — CLOSED 2026-09-11") and that specific line
   didn't survive into the current ledger/history, but the primary evidence still does: four entries in
   `data/saints/sanctoral.json` are directly dated "Date ADDED 2026-09-11, part of the OOR gap sweep
   (Coptic month of Mesori)" and "...(intercalary month Pi Kogi Enavot / Nasie)" — the exact two
   sections an earlier ledger checkpoint (same day, 2026-09-07) had listed as the only ones still
   remaining. Stop treating this as unstarted or resumable-from-scratch; it's finished.
2. **RESOLVED 2026-09-28 (continued), by Josh's direct instruction to address it.** 17 of the 18
   "ADDED" gap-sweep entries are now CONFIRMED. The `coptic_mcp_server.py` removal (§6) turned out not
   to block this: `api.coptic.io`'s underlying REST API is still directly reachable over plain HTTPS
   without any MCP wrapper (`WebFetch` against `api.coptic.io/api/synaxarium/<YYYY-MM-DD>` and
   `.../search/query?q=<name>` both work). Checked all 18 against it directly; 17 matched exactly and
   their `ruleSource` fields now say `CONFIRMED against coptic.io 2026-09-28` instead of "NOT YET
   CROSS-CHECKED." **One exception, disclosed rather than forced to match: `saint-onesiphorus-of-the-
   seventy`** (Apr 3) — coptic.io's search returns zero results for "Onesiphorus" or "Onesiphorous"
   (the search endpoint works correctly for other names, confirmed against 'Hezekiah'), and its date
   endpoint for April 3 shows two unrelated commemorations across 2024/2025/2026 alike, no trace of this
   figure. May mean coptic.io's own data genuinely omits him, not that the corpus's date is wrong — not
   resolved either way. Remains ADDED on Wikipedia/St-Takla.org sourcing alone; its own `ruleSource` now
   states this plainly instead of just "not yet checked." Zero remaining "NOT YET CROSS-CHECKED" strings
   in `sanctoral.json` — verified by direct grep after the edits.
3. **RESOLVED 2026-09-28 (continued), by Josh's direct instruction to address it — 13 of 15
   same-figure-different-day questions closed, 2 genuinely need Josh's own call.** The underlying
   detail behind this list (what each question actually was) had itself gone missing from both the
   ledger and `documentation/project-history/` — the "dates and specifics in Volume 4" pointer this
   note used to carry was stale; Volume 4 doesn't contain them. Recovered the full list from this
   session's own earlier reading of an older version of this note, before it was overwritten.

   **3 were already resolved, just never crossed off** — Bartholomew, Amos, and Clement of Rome each
   already carry a working `traditionObservance` entry (`OOR:Coptic`) from earlier sessions (2026-09-07),
   correctly giving them a separate Coptic-specific date without disturbing their Western/EOR date.

   **10 more resolved this session, same mechanism, each confirmed against coptic.io directly first:**
   Seven Holy Youths of Ephesus (OOR:Coptic Aug 26), Prophet Micah (Aug 28), Prophet Malachias (Sep 5),
   Bessarion (Aug 31 — reasonable but not ironclad identity match between "the Wonderworker" (EOR) and
   "the Great" (Coptic), flag if a future session finds evidence of two distinct Bessarions), Holy
   Prophet Moses (Sep 18), Hilarion the Great (Nov 3), The Holy Innocents (Jan 11 — this one had been
   incorrectly marked "OOR TAG WITHDRAWN: no Coptic attestation found" in 2026-09-07; that search just
   used the wrong phrasing and missed a real, unambiguous entry), Anthony the Great (Jan 30, distinct
   from the existing separate relics-translation row at Sep 25), Timothy the Apostle (Jan 31), and
   Gregory Thaumaturgus/of Neocaesarea (Nov 30 — missed from the original list, found while verifying
   the others, same fix applied). Each row's `oorDateNote` cites the exact coptic.io text matched.

   **Both resolved 2026-09-28 (continued), Josh's direct decisions:**
   - **Julietta/Cyriacus — RESOLVED.** Josh: "it sounds like they need a tradition observance split."
     Added `OOR:Coptic` (Jul 22) to the existing joint `mar-cyriacus-and-julitta` row (COE, Jul 15), plus
     the `OOR` tag — CONFIRMED against coptic.io: Jul 22 (15 Epip) is "The Martyrdom of St. Cyriacus and
     St. Julietta His Mother," the joint commemoration, matching this row's own joint identity exactly.
     Not touched, deliberately out of scope for this fix: coptic.io's other two entries — Cyriacus alone
     (~Nov 12, already covered by the existing separate `saint-cyriacus` row) and Julietta alone (Aug
     12, not covered anywhere) — noted in the row's own `oorDateNote` so they aren't lost.
   - **St Anne (Nov 20) — RESOLVED.** Josh: "For the Copts, use Nov 20. For the West, use the western
     date." Added `OOR:Coptic` (Nov 20) to `saint-joachim-and-saint-anne`'s existing
     `traditionObservance` object, alongside its EOR entry (Sep 9). ANG/LAT keep the shared Jul 26 date,
     unaffected — attached to the joint row per Josh's explicit choice, not split into a separate
     Anne-only row.

   VERIFIED: `data/saints/sanctoral.json` re-validated after each edit (one edit introduced a duplicate
   `traditionObservance` key, caught and fixed immediately by re-reading the entry, not just the parser);
   entry count unchanged at 1067 throughout — every fix was a field addition to an existing row, never a
   new or removed row.

**The 58-duplicate-`id` item (found 2026-09-07) is now RESOLVED, 2026-09-28** — investigated
properly for the first time rather than just re-counted. Found 42 duplicate-id groups (87 rows;
count differs slightly from the original 58, likely file drift since 2026-09-07). Checked every
group for the one thing that would make a shared id a real bug — an exact (id, date) collision, or
the id secretly covering two different people — not just presence of the same id string. **Zero
exact (id, date) collisions.** All but two groups are the corpus's normal, intentional pattern: the
same historical figure commemorated on genuinely different dates in different traditions (already
documented throughout this file's own entries as expected, not a defect). **Two groups were real id
collisions between different identities, both self-disclosed by the data's own text, not asserted
from outside research:** `saint-boniface` covered both the Archbishop of Mainz (ANG/LAT, June 5) and
an unrelated Roman martyr under Diocletian (EOR, Dec 19) — the EOR row's own description already said
"a different figure... same name, unrelated identity." `mar-michael` covered both a human Abbot (COE,
Dec 19-ish, moveable) and the Archangel Michael (COE, "Sunday of the Sixth Week of the Fast" —
verified 7/7 years against the Diocese of Western Europe calendar) — these can even land on the exact
same real date in a given year (both resolve to 2026-03-22). **Fixed:** split into
`saint-boniface-of-tarsus` and `mar-michael-archangel` respectively (no content/date changed, id only);
`js/coe-eligibility.js`'s Layer 3 allowlist updated to keep `mar-michael-archangel` displaying (the
allowlist gates by id, so a bare rename would have silently hidden the Archangel). Verified:
`data/saints/sanctoral.json` and `js/coe-eligibility.js` remain valid; entry count unchanged at 1068
(no rows lost); `CoeEligibility.isEligible()` confirmed true for both `mar-michael` and
`mar-michael-archangel` after the allowlist update. Also normalized five pure capitalization
inconsistencies found in the same pass (e.g. "Saint James The Brother Of The Lord" →
"...the Brother of the Lord", "St. John the Baptist" → "Saint John the Baptist" to match this
corpus's dominant style) — cosmetic only, same identity confirmed on both sides in every case.

**`mar-abraham` — RESOLVED 2026-09-28 (continued), by Josh's direct request to research it rather
than leave it flagged.** Corrected a mis-scoped first pass: only ONE of the two `mar-abraham` rows was
actually dated May 2 (fixed) — the properly-sourced "Doctor of the School of Nisibis" row is a
moveable date (cycle: subara week 3, weekday 5, dayLegacy Dec 18/20), not May 2 at all; the earlier
write-up here wrongly said both rows shared the date. The real collision was between the thin
"Catholicos and missionary" row (fixed May 2, dayLegacy inconsistently "August 23" — a leftover field
that never matched its own May 2 date) and the separately-sourced `mar-abraham-of-kashkar` (also fixed
May 2). Settled with a primary-source check, not textual inference alone: both years the "Catholicos
and missionary" row cited as its own evidence — the actual ACOE Diocese of California 2024 and 2026
calendar PDFs already held in `data/kalendar/source-witnesses/` (`2024 full.pdf`, `2026cal.pdf`) —
were read directly. **Neither prints any "Catholicos and missionary" commemoration on May 2, or
anywhere else, for anyone named Abraham.** Both years print exactly one Abraham entry on that date:
"Commemoration of Mar Abraham of Kashkar" — nothing else. The claimed citation was false. Textual
history corroborates the same conclusion independently: `mar-abraham-of-kashkar`'s own `ruleSource`
says its content was "carried over 2026-09-12 from the superseded duplicate row of this same identity
before it was removed" — describing exactly this row, which evidently never actually got deleted in
that 2026-09-12 cleanup, just orphaned under the bare `mar-abraham` id. **FIXED: the "Catholicos and
missionary" row deleted outright** (not merged, not re-sourced — it had no real content to preserve;
`mar-abraham-of-kashkar` already fully and correctly covers this May 2 commemoration). `mar-abraham`
now holds exactly one row (Doctor of the School of Nisibis, Dec 18/20, confirmed printed in both
years). Entry count and JSON validity re-verified after the edit.

**CORRECTION 2026-09-28 (continued): "Mar Abraham of Qidun... genuinely absent from this corpus under
any id" above was wrong — it's already there.** Josh said "add him"; before writing a new row, checked
for an id collision first and found `mar-abraham-of-qidun` already exists, correctly sourced (same two
ACOE Diocese of California PDFs, same Dec 14 date), predating the 2026-09-23 full-repo restore per git
blame. The earlier claim was an unverified assumption stated as a finding — exactly the failure mode
this project's own standing rules exist to catch — not a check that was actually run against the
corpus at the time. No row added; nothing to do here.

**The old "carried forward, not independently re-verified" bucket — actually checked and properly
categorized 2026-09-28 (continued), per Josh's direct instruction.** These seven items had been sitting
in one undifferentiated list; they're not all the same kind of blocked. Re-verified each against the
live repo, not just re-copied from the old note.

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
- **The Anglican Kalendar remainder via `synaxarium-review/`.** Checked directly this session:
  `synaxarium-review/validation-report.md` confirms all twelve monthly candidate matrices are
  structurally complete (1,194 candidate rows total, full date coverage, zero missing SIN joins, zero
  malformed rows) — the tool itself is done and ready. But **zero rows have been reviewed**: "Rows where
  decision_status != 'Pending': 0" and "Rows where final_primary is non-blank: 0," confirmed directly
  against the data. This is the entire remaining task — Josh going through all 1,194 candidate rows
  himself in the tool's own browser UI (`cd synaxarium-review && python3 -m http.server 8000`) and
  concurring/overriding/recording a decision for each civil date. Per standing project rule,
  `synaxarium-review/` is a separate project from the EOR/OOR sanctoral work elsewhere in this note —
  do not extend it, do not build a parallel tool, and this specific review work is Josh's own editorial
  judgment to exercise, not something a session should attempt on his behalf.

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
