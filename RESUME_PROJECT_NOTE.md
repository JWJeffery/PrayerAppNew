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
Byzantine (Horologion). Roman Breviary 1960/1962 is in active buildout — no dedicated §7 status item
exists for it; the only current pointer is `project_roadmap.json`'s phase plan (§7, phase_3 "active").

A prior assistant, **Lucy**, was dismissed for falsely certifying content as accurate — the standing
comparison point for what NOT to do. All Lucy-era certifications are void and must be independently
re-derived. Nothing in this repo's own docs or `structure.json` counts as evidence on its own; verify
against primary sources. The Lucy-era saints generator/CI-gate architecture (identities.json,
commemorations.json, the whole build/import/validate toolchain) was removed entirely 2026-09-02 —
`js/saints-resolver.js` now reads `data/saints/saints-{month}.json` directly, no generation layer.
A broader audit of Lucy-era one-off validation scripts under `scripts/` is DONE (see §7) — 107 dead
files removed, all remaining loose ends closed 2026-09-28.

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
  `id` alone.** 39 duplicate `id` values remain as of 2026-09-28, continued (down from 40 once the
  `mar-abraham` fix below removed one group entirely, down from the 58 first found 2026-09-07, after
  that count was finally investigated rather than just re-checked for size — see §7). All 39 are the
  corpus's normal same-figure/different-tradition-date pattern, re-confirmed to have zero exact (id,
  date) collisions; two genuine identity collisions found in the same pass (`saint-boniface`,
  `mar-michael`) were fixed by id split. Re-verify this count directly (`node`, group `data.entries` by
  `id`, filter length > 1) rather than trusting this number — it will drift again the next time
  sanctoral.json changes. A blind id-keyed write silently clobbered unrelated rows once already;
  full-file backup before any bulk sanctoral edit, and re-verify with a
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

**THE PROFILE/USER SYSTEM — BUILT, 2026-09-28 continued yet again.** The TODO below (originally
"not designed, not scoped, not estimated") is now built and live-verified end to end, after Josh
answered its three open scoping questions directly: (1) role field reuses the EXISTING Book of
Needs role ladder (`ministryRole`) rather than a parallel taxonomy; (2) super-user is a soft/
cosmetic gate for now, real server-side auth explicitly deferred; (3) built as one pass, not phased.

**What actually shipped, all on `UNIVERSAL_OFFICE_USER_PROFILE_DEFAULTS`
(`js/office-ui.js`) — extending the existing per-browser profile, not a second parallel system:**
- **`displayName`** — free-text name, set via the onboarding prompt or the profile-defaults panel.
- **`isSuperUser`** — soft/cosmetic boolean, explicitly NOT real access control (this app has no
  server-side auth; localStorage is editable by any visitor). The toggle itself lives ONLY in the
  Admin Console (`admin/admin.html`'s new "Super-user Flag" panel — reads/writes the same
  `universalOffice.userProfile.v1` key directly, since that page doesn't load `js/office-ui.js`),
  never on the public onboarding/profile-defaults panel, so a casual visitor doesn't stumble into
  flipping it for themselves. Real enforcement is still explicitly future work, not solved here.
- **Bible Browser gated to `isSuperUser`** — it previously had NO gating at all, unlike the
  adjacent Admin Console button. The button (`#app-bible-browser-btn`) is now `hidden` by default
  and only shown when `isSuperUser` is true (`syncBibleBrowserSuperUserGate()`); `openBibleBrowser()`
  itself also refuses at its own entry point (covers the `/tools/bible` URL auto-restore path too,
  which never went through the button).
- **`cycleOfPrayerDiocese`/`cycleOfPrayerParish`** — diocese/parish selection, resolving against
  the `data/cycles-of-prayer/` corpus built earlier this session. Diocese picker + dynamically-
  populated parish picker in the profile-defaults panel (`js/cycles-of-prayer.js` handles
  load/cache/resolve — reused, not rebuilt, from an earlier same-session attempt that was correctly
  reverted for being unconfirmed at the time). Wired into the BCP "authorized intercessions" rubric
  (`renderCycleOfPrayerLine()`): when a diocese is set, the OFFICE's own displayed date (never
  "today") resolves that week's real subject(s) and renders them right after the static rubric
  line, with a "This is your own parish's week" note when the resolved week names the declared
  home parish. No diocese declared -> renders nothing extra, exactly today's prior behavior.
- **One-time onboarding prompt** (`#uo-onboarding-prompt`) — shown once per browser profile, after
  the existing tradition-entry routing has already decided where to land (never races it, never
  re-asks the tradition question). Echoes back whatever tradition is already on file, then asks
  name + role (the role `<select>` clones its own `<option>` list live from
  `#profile-ministry-role`'s real DOM, so it can never drift out of sync with it). `Save` and
  `Skip for now` both set `onboardingComplete: true`, so it never reappears on its own; the person
  can still edit name/role any time from the profile-defaults panel afterward.

**Verified live in headless Chromium, 19 checks + 4 admin-console checks, all passing, zero
console errors:** fresh-load onboarding prompt appears once and never again after submit/skip/
reload; name+role save and echo back correctly in the profile panel; diocese selection populates
exactly 63 real parishes; a real office date (Jan 4 2026) renders the real Cycle of Prayer line
("Albany, St. Alban") with the home-parish note; a *different* date (Jan 11 2026, Ashland Trinity)
renders correctly without falsely claiming the home-parish match; Bible Browser is hidden by
default, becomes visible and actually opens once `isSuperUser` is set, hides again and refuses a
direct `openBibleBrowser()` call once unset; the Admin Console toggle writes the same localStorage
key index.html reads, confirmed cross-page. `node --check` clean on every changed `.js` file.

**`scripts/audit-user-profile-browser-qc-runner.mjs` deleted, 2026-09-28 continued once more,
per Josh's explicit call after asking what it was for.** It never actually ran a browser test —
it opened `scripts/browser-qc-user-profile-defaults-sweep.js` (the real test, meant to be run in
an actual browser) as plain text and checked that certain phrases/code snippets were still present
in it, as a cheap proxy for "did someone quietly gut this test." It was flagging 4 markers
("Office Defaults action opens local defaults panel," etc.) referencing a button an unrelated,
earlier commit (`eb2aa9c`) had already correctly removed — so it was actively wrong, and checked
confirmed it wasn't wired into anything (no CI, no pre-commit hook, nothing else in this repo runs
it) — its failure had zero real consequence, only cost of upkeep every time the real test
legitimately changed. Removed the script and its `npm run audit:user-profile-browser-qc-runner`
entry in `package.json`; the real test file (`browser-qc-user-profile-defaults-sweep.js`) is
untouched and still exists to be run in an actual browser.

Files touched: `js/office-ui.js`, `js/cycles-of-prayer.js` (new), `js/bible-browser/bible-browser.js`,
`index.html`, `css/office.css`, `admin/admin.html`, `package.json`; `scripts/audit-user-profile-
browser-qc-runner.mjs` deleted.

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

**Storage scheme for Diocesan-tier data exists AND is now wired into the app UI (see the PROFILE/USER
SYSTEM entry above) — this paragraph previously said "storage only, not wired in yet," which is now
stale; corrected 2026-09-28 (continued).** Josh uploaded The Episcopal Church in Western Oregon's own
2026 Diocesan Cycle of Prayer (a weekly rotation of parishes/missions/categories to pray for) and asked
for a general-purpose scheme to hold this kind of data from multiple dioceses — deliberately separate
from `project_roadmap.json`'s tradition-audit machinery, closer in kind to Book of Needs.
`data/cycles-of-prayer/schema.json` (file-shape and content rules, including "transcribe names exactly
as printed, disclose typos rather than fix them") and `scripts/cycles-of-prayer/validate.mjs`
(`npm run audit:cycles-of-prayer`, verified to actually catch injected errors before being trusted) are
the governing spec/tooling; the profile picker and BCP rubric rendering read the corpus through
`js/cycles-of-prayer.js`'s own `CYCLES_OF_PRAYER_DIOCESES` registry, which must be hand-kept in sync with
whatever diocese files actually exist under `data/cycles-of-prayer/` (a new file with no matching
registry entry, or vice versa, silently does nothing).

**Five more dioceses ingested 2026-09-28 (continued), from Josh's Google Drive TEC roster (a
spreadsheet listing 88 total dioceses; only these first five, alphabetically, were requested this
pass — the other 83 are a future task, not started):** Alaska, Arizona, Albany, Alabama, Arkansas.
Each transcribed directly from that diocese's own published source (never from memory), validated, and
live-verified via headless Chromium that `getCachedCycleOfPrayerWeek`/the profile parish picker resolve
real dates correctly against each file. All five, plus the original Western Oregon file, currently pass
`npm run audit:cycles-of-prayer` (6 files, 0 blocking findings).
- **Alaska, Arizona** — straightforward weekly-Sunday cycles, same shape as Western Oregon. Arizona's
  source spans Aug 2026-Aug 2027 as one continuous cycle; only the 2026 portion (22 weeks) is in this
  file, per the one-file-per-diocese-per-year rule — the Jan-Aug 2027 portion is deferred to a future
  `episcopal-arizona-2027.json`, not built yet.
- **Albany** — genuinely DAILY, not weekly (61 entries, Sept-Oct 2026 only, the only two months the
  diocese has published as of ingest) — disclosed in the file's own `notes`, since every other dated
  file in this corpus so far is weekly.
- **Alabama** — most complex of the five: two-column source PDF, cross-liturgical-year source (only the
  46 weeks landing in calendar 2026 are here; the ~5 weeks in late 2025 are deferred to a future
  `episcopal-alabama-2025.json`), a recurring "Companion Diocese of Honduras and their bishop, Lloyd"
  line woven into every single week (included as the first subject of every entry, by design, disclosed
  in `notes`), and one disclosed source misprint (27 June entry is dated as if a Sunday but 27 June 2026
  is actually a Saturday — preserved verbatim, not corrected, per this corpus's own governing rule).
- **Arkansas — required a real schema extension, not just a transcription.** Its own source is not
  date-anchored at all: headed "On the corresponding day of each month, pray for," entries numbered
  1-31, no year stated anywhere, repeating every month indefinitely (plus a separate, non-rotating
  "Pray daily for" preamble of 4 items, deliberately excluded from the day-keyed entries and disclosed
  instead in the file's own `notes`, since it applies every day regardless of which day-of-month entry
  is current). Raised to Josh directly rather than guessed at (options: extend the schema, force it into
  fabricated concrete dates, or defer) — **Josh chose to extend the schema.** `schema.json` gained a
  `cycleType` field (`"dated"`, the implicit default for every pre-existing file, vs.
  `"monthly-recurring"`); a monthly-recurring file has no `year` field, no year in its filename
  (`episcopal-arkansas.json`, not `episcopal-arkansas-2026.json`), and entries keyed by `day` (1-31)
  instead of `date`. `scripts/cycles-of-prayer/validate.mjs` now branches its filename/year/entry
  validation on `cycleType` (extracted a shared `validateSubjects()` helper so both branches validate
  subjects identically). `js/cycles-of-prayer.js` gained `resolveMonthlyRecurringEntry()` (same
  "latest on-or-before" semantics as the dated resolver, but wraps around to the highest `day` instead
  of returning null before the first entry, since the cycle repeats forever) and both
  `loadCycleOfPrayerYear`/`getCachedCycleOfPrayerWeek` now branch on the diocese's own `cycleType` —
  callers (`js/office-ui.js`) needed zero changes, since both functions keep their original signatures.
  **Other dioceses in the 88-diocese roster are noted (by the roster itself) to use this same
  standing/monthly/daily-recurring pattern, so this will recur** — the schema is now ready for that,
  not a one-off Arkansas special case.
- All five added to `CYCLES_OF_PRAYER_DIOCESES` (`js/cycles-of-prayer.js`) and the profile diocese
  `<select>` (`index.html`) — before this, a diocese file existing on disk with no matching registry/UI
  entry would have been silently unreachable from the app; this is why registering both matters as much
  as writing the JSON itself.

Whoever builds the Diocesan-tier Authorized Intercessions content, or ingests more of the 88-diocese
roster, should read `schema.json` first (both cycleType shapes) and use this as the source rather than
inventing a second storage pattern. Adding another diocese: transcribe directly from that diocese's own
published document, check whether its source is actually date-anchored or a standing recurring cycle
BEFORE choosing a cycleType (do not force one shape into the other), disclose anything ambiguous in
`notes`, run the validator, and add the registry/UI entries — a file with no registry entry does
nothing.

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
- Task #14 — tradition-selector naming: **now genuinely, fully closed — final wording confirmed
  directly by Josh, all five lanes identical on both screens.** This went through several wrong
  intermediate states before landing here, worth recording so it doesn't get re-litigated: an
  earlier fix (`179e38f`) set mode-grid titles to the bare tradition name (Anglican, Oriental
  Orthodoxy, Catholic) while leaving Church of the East/Eastern Orthodoxy's mode-grid cards as
  "Hudra"/"Horologion" (office-book names, from a different concurrent session, still on
  `#tradition-entry` as "Church of the East"/"Eastern Orthodoxy") — a real, live mismatch that
  wasn't caught by that fix's own testing. Josh's actual final answer, given directly and applied
  now: full communion/church-body names, identical on **both** `#tradition-entry` and
  `#uo-threshold-grid`, for all five lanes —
  - **Anglican Communion** (was "Anglican")
  - **Catholic Church** (was "Catholic")
  - **Church of the East** (unchanged on the entry-card; mode-grid corrected back from "Hudra")
  - **Eastern Orthodox Church** (was "Eastern Orthodoxy" on the entry-card, "Horologion" on the
    mode-grid — both corrected to the same new name)
  - **Oriental Orthodox Church** (was "Oriental Orthodoxy" on both screens)
  Subtitles (the specific office/book name — "The Daily Office...", "Roman Breviary 1960/1962...",
  "Byzantine Horologion offices.", etc.) are unchanged; only the `<strong>`/`.app-mode-title` text
  changed on both screens.

  **First pass only fixed the two screens Josh had just been asked about and left a third,
  already-found inconsistency as a "flag it, don't fix it" note — correctly called out as
  burying a known problem instead of closing it.** Went back and grepped the entire repo (`.js`,
  `.html`, excluding historical ledger/audit-log prose, which is never rewritten) for every one of
  the old names, rather than trusting the two screens already checked were the only ones. Found and
  fixed **six more live, user-facing spots** carrying one of the old names:
  - `#profile-tradition-default` (`index.html`) — the "Default tradition" profile dropdown, the
    original buried finding. Had its own THIRD naming set ("The Episcopal Church," "Latin
    Catholic," "Oriental Orthodoxy," "Eastern Orthodoxy").
  - `UNIVERSAL_OFFICE_TRADITION_LABELS` (`js/office-ui.js`) — feeds the "This browser opens to
    &lt;X&gt;" profile-summary sentence.
  - `OFFICE_MODE_HEADER_LABELS` (`js/office-ui.js`) — the app shell's page title while an office is
    open (`#office-mode-title`).
  - `BOOK_OF_NEEDS_TRADITION_CODES` and `BOOK_OF_NEEDS_CONTEXTS`'s `label`/`note`/`empty` fields
    (`js/prayers.js`) — Book of Needs' own tradition-scoped headers and copy.
  - `TA_DISPLAY_NAMES` (`admin/admin.html`) — the admin Tradition Availability panel. Also fixed a
    second, independent staleness bug found in the same object while touching it: `latin-catholic`
    still said "(Liturgy of the Hours)," a lane abandoned 2026-09-27 in favor of the Roman Breviary
    1960/1962 (`project_roadmap.json`'s `catholic-first-profile` `superseded_note`) — left alone,
    this would have kept lying to whoever reads that admin panel next.
  - Four `scripts/browser-qc-*.js` files whose assertions hard-coded the old rendered strings —
    left as-is, these would have started failing (or worse, silently stopped testing what they
    claimed to) the next time anyone actually ran them against the renamed UI.

  **Josh overrode the "deliberately left alone" call above for `data/explanations/*.json`'s
  `traditionLabel` fields — correctly: a separate naming convention is still the same naming
  problem if a user can see two different names for their own tradition anywhere in this app.**
  Fixed all five: `anglican.json` "Anglican" → **Anglican Communion**; `byzantine.json` "Byzantine"
  → **Eastern Orthodox Church**; `coptic.json` "Coptic Orthodox" → **Oriental Orthodox Church**;
  `latin.json` "Latin Catholic" → **Catholic Church**; `east-syriac.json` already said "Church of
  the East", unchanged. The " — Office (detail)" suffix (e.g. "— The Horologion (Slavic
  recension)") is untouched; only the tradition-name prefix changed. Also normalized
  `js/prayers.js`'s Book of Needs prose that used the slash form "Anglican/Episcopal" to plain
  "Anglican", matching the adjectival pattern the other four traditions already used there.
  Verified live: `Explanations.load(code).traditionLabel` returns the new text for all five codes
  (ANG/BYZC/OOR-COP/COE/LAT), zero console errors. `data/explanations/{anglican,byzantine,coptic,
  latin}.json`, `js/prayers.js`, and `scripts/browser-qc-book-of-needs-routing-sweep.js` are the
  files touched in this pass.

  **Still deliberately left alone — stated here plainly, not buried, so it's a known, visible
  carve-out rather than a silently-skipped item:** `structure.json`/`project_roadmap.json`'s
  `browser_qc.covered` arrays (e.g. "Eastern Orthodoxy / Horologion sidebar close/restore") are
  frozen result logs of specific past QC runs, and `structure.json`'s top-level `decision` field
  is the original onboarding-design narrative — both are historical record of what was true/tested
  *at the time*, the same category as this ledger's own dated session entries, which this project's
  standing rule says are never rewritten after the fact. `project_roadmap.json`'s `roman_loth`
  section's `"ui_label": "Latin Catholic"` is dead metadata inside an already-`SUPERSEDED`/abandoned
  lane (see the `catholic-first-profile` governance question), never reached by any live code path.
  `data/saints/sanctoral.json`'s two `description` fields quote a Wikipedia infobox verbatim as
  sourcing evidence — not this app's own label. `data/cycles-of-prayer/*.json`'s `body`/`diocese`
  fields correctly record a real diocese's actual legal name, a different kind of field entirely.
  None of these are a user-facing tradition selector; if any should change anyway, that's a call
  for whoever reads this next to make explicitly, not infer from silence.

  Verified live in headless Chromium after every edit: both screens list the same five names in the
  same order; the profile dropdown, profile-summary sentence, and office header (`#office-mode-title`)
  all show the new names; `selectMode('daily')` still opens the Anglican office correctly; zero
  console errors. `node --check` clean on every changed `.js` file. `index.html`, `admin/admin.html`,
  `js/office-ui.js`, `js/prayers.js`, and four `scripts/browser-qc-*.js` files are the files touched.
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
- **Mobile prayer-reading window maximized, 2026-09-28 (continued) — landed on `main`, merged into
  this branch after the fact.** Josh: "the area where the user could read the prayer and scroll through
  it was so tiny, no one would use it." Measured before touching anything on a real 390×844 viewport
  (BCP Morning Prayer): `.uo-rail` alone consumed 316px (37.4%), the header another 106px (12.6%),
  leaving only 322px (38.2%) for `.uo-page` — and the first screen was pure chrome, zero prayer text.
  Fixed so `.uo-page` now takes 614px/73% of the viewport, prayer text visible on the first screen.
  Verified live: rail toggle both directions, an earlier touch-scroll-trap fix still holds, long-list and
  empty-list edge cases both render correctly, Back to Modes stays reachable, all five traditions swept
  on mobile, desktop unaffected. `css/office-shell.css`, `js/office-shell.js` only files touched.
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
- **Web release: `npm run release:web`** (`scripts/prepare-web-release.mjs`) builds a deployable static
  export for Josh to manually upload to theuniversaloffice.com -- there is no auto-deploy pipeline, this
  is the closest thing to one. As of 2026-09-28, it automatically splits into 3 independent zips
  (Roman Breviary data / remaining data / app shell) whenever the combined zip exceeds the ~30MB
  delivery-channel cap, instead of that being a manual step. Last run 2026-09-28: 4,308 files, 44.3MB
  combined, delivered as 3 zips (18.1/13.4/12.9MB) directly to Josh via the session's file-delivery
  tool.
- **For old narrative detail this note used to carry**, start at
  `documentation/project-history/INDEX.md` — four chronological volumes, 2026-07-06 through
  2026-09-28, plus two point-in-time `structure.json` snapshots.
