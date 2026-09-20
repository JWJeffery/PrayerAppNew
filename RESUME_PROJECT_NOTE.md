# RESUME_PROJECT_NOTE.md

**Paste this at the start of a new conversation.** It is a handoff document, not a history. The
permanent record of every decision lives in `AUDIT_GOVERNANCE_LEDGER.md`; the classification of what
blocks each open item lives in `documentation/OPEN_ITEMS_FIXABILITY.md`. **Where this note and the
repo disagree, the repo wins** — it may have moved since this was written.

**FIRST MOVE, EVERY SESSION, NO EXCEPTIONS.** `git clone` fresh, then `git log --oneline -10` and
check `SEED_VERSION` in `audit-ledger.html`. Josh runs at least two Claude accounts against this repo
concurrently, so never trust this note's HEAD, SEED_VERSION or "what's open" at face value. Cache-bust
params likewise: read them out of `index.html` rather than trusting a number written here.

**State as of 2026-09-20, end of session.** Fresh-clone HEAD is `8a4d776`, SEED_VERSION
`v304-2026-09-20-session-close-two-gutter-bugs-open` — trust neither at face value; see the FIRST
MOVE line above.

**The gutter citation** — the page column's two-column grid (handoff doc §1: "a 70px right-aligned
mono gutter label and the text") — genuinely didn't exist before this session; Phase 2 only ever
recoloured the old flat layout. Built in `js/office-ui.js` (new `bcpWrapInGutter()` helper, a
`BCP_GUTTER_KIND_BY_LABEL` lookup table for non-scripture blocks) and `css/office-shell.css` (the grid
itself, scoped to screen only — print and mobile both got deliberate handling). Label mapping was
confirmed with Josh before any code was written; a double-labeling bug (Collect/Canticle/Antiphon/
Invitatory showing their kind word twice — once as the old in-page heading, once in the new gutter)
was found in live review and fixed the same session (`a28af0d`).

**TWO CONFIRMED LIVE BUGS ARE STILL OPEN, NOT FIXED.** Found by Josh in the same screenshot review,
after the double-labeling fix. Full detail in `AUDIT_GOVERNANCE_LEDGER.md`'s session-close entry
(2026-09-20, last one) — summary:
1. **The sticky keeping-place bar overlaps page content** — the Invitatory block was half covered by
   the "↑ ↓ move by block" bar at the bottom of the viewport. Likely the `.uo-block` grid wrappers
   changed the page's height/flow in a way that broke whatever previously kept the sticky bar clear of
   content. NOT diagnosed. Start in devtools, not by reasoning from the CSS.
2. **Body prayer text renders in inconsistent fonts/sizes across the page** — the actual prayed text
   itself, not the gutter labels, confirmed by Josh across several screenshots. NOT localized to a
   specific element yet. Candidates listed in the ledger entry, none confirmed. Start by inspecting
   actual computed `font-family`/`font-size` on two visibly-different adjacent paragraphs in the
   browser.

**Both of these were missed by me in the prior review** — I looked at the screenshots without
actually examining them closely enough to catch an obvious overlap and an obvious font
inconsistency, and gave a confident-sounding but wrong non-answer twice before Josh had to spell out
what was plainly visible. Whoever picks this up next should re-verify anything I "confirmed" as
working in this session's screenshot reviews rather than trust it at face value — the standing rule
in this note ("never trust X at face value") applies to my own read of visual output too, not only to
HEAD/SEED_VERSION.

Do not mark the gutter citation feature as done until both of these are actually fixed and
re-confirmed live.

---

## 0. Where the work actually stands

### The UI redesign, `documentation/UI_REDESIGN_HANDOFF.md`

An outside design proposal, verified against the repo, corrected in fifteen places for governance,
and adopted. One canon — **rail · page · margin** — with everything not prayed aloud moved out of the
text column into the margin. Six phases. **Phase 1, 2, and 3 are all done, including live
confirmation.**

| Phase | State |
|---|---|
| 1 — flagged stylesheet + dev toggle | **done** (`?shell=v2` on, `?shell=v1` off, sticky per browser) |
| 2 — three-column shell, both themes, Auto/Light/Dark | **done and confirmed in the browser** |
| 3 — Anglican lane emits the envelope | **done and confirmed in the browser (2026-09-20)** — see below |
| 4 — threshold and Office Settings | not started |
| 5 — the other three lanes | not started |
| 6 — delete the old skin | **partly brought forward**, see the demolition note below |

**PHASE 3 IS FULLY DONE (2026-09-20) — REFACTORED AND BROWSER-CONFIRMED.**
`renderBcpOffice()` (`js/office-ui.js`) no longer builds one `officeHtml` string and scrapes it
afterward. Every one of its ~90 emission sites now calls one of six small block-emission helpers
(`bcpEmitBlock`, `bcpEmitReading`, `bcpEmitPsalmBlock`, `bcpEmitBare`, plus `bcpEmitDivider` and
`bcpPushDiagnostic`) that build real DOM nodes directly into a `container` element AND push the same
structural knowledge into `blocks[]`/`overlays[]`/`diagnostics[]` in the same call — no second pass
reading labels back out of a finished HTML string. `js/anglican-envelope.js` gained `assemble(env,
context)`, which wraps that directly-built data in the envelope shape; the old regex-scraping
`emit()` function is kept, unchanged, as the reference implementation for lanes not yet converted
(Phase 5), but the Anglican lane no longer calls it. Every branch's decision logic — rotation, season
lookup, rite fallback, every BCP-alternative toggle — was verified line by line against the
pre-refactor original, not rewritten from memory; `node --check` passes on both files. **Two real
bugs were caught and fixed during the conversion, not introduced by it** — full account in
`AUDIT_GOVERNANCE_LEDGER.md`'s first 2026-09-20 entry (title: "The renderBcpOffice() refactor: Phase
3's actual remaining work, done").

**Live-confirmed the same day** (second 2026-09-20 ledger entry): all four offices, both themes
correctly office-keyed, the Agpeya Opening overlay card (sourced and anchored correctly), and a
`not-yet-mapped` diagnostic forced live by temporarily filtering a component out of `appData` in the
browser console — no code or data file changed, reverted by reload. Two specific named items from
the acceptance list were not specifically exercised — see the next paragraph.

**Confirmed live 2026-09-20** (second ledger entry that date): all four offices across two dates and
both themes, an overlay card (Agpeya Opening — sourced/anchored correctly), and a `not-yet-mapped`
diagnostic (forced via a temporary console edit, since the corpus has no naturally-occurring gap
handy). **Two specific items from the handoff doc's acceptance list were NOT specifically
exercised** — say so precisely rather than claim full closure: the Hudra Prayer for Understanding
overlay by name (a different overlay toggle, Agpeya Opening, was tested instead — same code path,
same class of confirmation, but not that exact named case), and the seasonal dot's
`liturgicalColor` reading was not explicitly checked in any screenshot. Worth a quick look before
treating those two as covered.

**Two renderers deliberately untouched, correctly out of scope:** `renderEastSyriac()` and the Coptic
Agpeya renderer, further down `js/office-ui.js`, still build their own separate `officeHtml` strings
the old way. Porting them is Phase 5. Do not confuse "the refactor is done" with "every lane is
converted" — only the Anglican lane is.

**This session's patch (applied as `0012cdc`, read `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-16 entry for
the full account): `overlays[]` and `diagnostics[]` are no longer unconditionally empty.**
`renderBcpOffice()` now tells the emitter, at the exact moment it emits one of the eight
ecumenical/cross-tradition devotions, what it just emitted and where — real structural knowledge from
the same pass, not a guess made downstream from a label string. The emitter uses that to split
overlay blocks out of `blocks[]` correctly (contract §9) and to turn a known placeholder string
("Text not found", "No collect appointed") into a `not-yet-mapped` diagnostic. The margin — empty
since Phase 2 — now draws real cards from both. **Browser-confirmed 2026-09-19** (ledger entry of
that date): the Angelus toggle on BCP Noonday Prayer produced the correct null-source disclosure
card ("provenance not yet recorded in the corpus"), and adding Agpeya Opening alongside it produced
the correct sourced card ("Coptic Orthodox (Agpeya)") in the same margin, correctly ordered. The
Oriental Orthodoxy lane's own native Agpeya office was also checked and correctly shows an empty
margin — that lane still emits no envelope; it is a different thing from the BCP-lane "Agpeya
Opening" overlay toggle despite the shared name. Not exercised live: three-or-more overlays
collapsing behind a "N more notes" toggle — pure UI plumbing, already covered by the jsdom harness,
treated as adequately tested without a live screenshot for that specific case.

**Superseded 2026-09-20: the paragraph immediately above ("Finishing Phase 3 still means
refactoring...") described the refactor as not yet started. It has since been done — see "PHASE 3'S
REFACTOR IS DONE" above and the 2026-09-20 ledger entry.** Kept here only as the historical record of
what the `0012cdc` increment actually delivered at the time.

### The demolition — why Phase 6 was partly brought forward

Six consecutive patches went into keeping an office-keyed Auto alive alongside the old skin. Each was
correct; each sat downstream of the next thing that also owned the theme. **Two systems owning one
piece of global state cannot be reconciled by synchronising them harder.** Phase 1/2's premise —
build beside the old shell, touch nothing — was right for layout and wrong for theme.

So, for the office screen only: the shell owns the ground, the card and the theme outright.
`applyTheme()` sets ONE class (`uo-day`) plus `dark-mode`/`light-mode` by class, and **never calls
`applyDarkMode()`**. The parchment card no longer dresses the prayed text; overrides in
`css/office-shell.css` undo `css/office.css` 1611/1632/1648/1658/1665/1670 **by line**, so Phase 6 can
delete the originals rather than leave them scoped away forever.

**Off the office screen NOTHING changed** — splash, Book of Needs, Bible browser and admin keep the old
skin and old theme behaviour. That is what fixed the dark splash.

### Open, in rough priority order

1. ~~The `renderBcpOffice()` refactor~~ — **DONE and substantially browser-confirmed, 2026-09-20.**
   See §0 above and the first two 2026-09-20 ledger entries. Two named acceptance-list items weren't
   specifically exercised (the Hudra overlay by name, the seasonal dot's `liturgicalColor` reading —
   both noted precisely in §0, worth a quick check).
1a. **The gutter citation** — built, NOT done. Two confirmed live bugs still open (sticky bar
   overlapping content; inconsistent body-text fonts/sizes) — see §0 above and
   `AUDIT_GOVERNANCE_LEDGER.md`'s final 2026-09-20 entry. Next: fix both in devtools, then a full
   re-review of every screenshot from this session's earlier "looks fine" pass, since that pass
   missed both bugs and should not be trusted as-is.
2. **Phase 4** — threshold and Office Settings. Also deletes the four sidebars, and with them several
   stopgaps noted below.
3. **Emitters for Coptic, East Syriac, Horologion.** Those three lanes still show the rail
   placeholder, which is correct and not a fault. Horologion goes LAST: it already emits
   `{tradition, officeKey, date, title, status, sections, diagnostics}` with a validator that
   hard-requires those seven fields, so porting it is a reconciliation of two payload shapes.
4. **`data/season/*.json`'s `liturgicalColor` needs a `ruleSource`.** It is populated on 397 days, but
   **the 1979 BCP prescribes no liturgical colours at all** — zero hits for "color"/"colour" across
   35,229 lines. So that field rests on something other than the BCP and nobody has said what.
5. **Eastern seasonal colours** are a SOURCED-CONTENT task with a named witness per tradition, not a
   shell task. For East Syriac, **no dot is the likely correct answer**.
6. **The dev server is slow and it is not from this work.** Every script loads in ~4.1–4.3s including
   files untouched all session, all landing within 200ms of each other — `scripts/dev-spa-server.mjs`
   serves sequentially with no-cache headers, plus the Codespaces proxy. Josh confirms it predates
   this work.
7. **`documentation/universal-office-navigation-architecture.md` is marked CANONICAL and conflicts
   with Phase 6.** It fixes the parchment surface as the shared visual language and its own next steps
   propagate that shell further. **Needs Josh's decision before Phase 6.** Recorded, not overridden.
8. ~~The app is defaulting to Dark instead of Auto under `?shell=v2`~~ — **RESOLVED 2026-09-20.**
   Neither candidate cause from the original flag was it. The real bug: `applyTheme()` wrote
   `uo-day`/`dark-mode`/`light-mode` onto `body` unconditionally whenever `shell-v2` was on, with
   no check for whether an office was actually active — so it reached the splash, the Book of Needs
   and the Bible browser too, contradicting this note's own §"demolition" claim that the shell
   already kept its hands off those screens. Confirmed live: Evening Prayer correctly dark, then
   Back to Modes left the splash dark too, because `currentOfficeId()`'s fallback read a stale,
   never-reset `office-time` radio left over from the office just exited, and `applyTheme()` had no
   guard to stop running at all once no office was active. Fix: both `applyTheme()` and
   `currentOfficeId()` now check `body.office-active` (added by `selectMode()`, removed by
   `backToSplash()` / `showTraditionEntry()` / `showUniversalModeSelection()`) and refuse to touch
   theme state, or report an office, when it's absent. Two manual-override red herrings surfaced and
   were cleared along the way, not part of the fix: a forgotten `traditionDefault: church-of-the-east`
   in the local profile from an earlier real click (`resetUserTraditionDefault()` clears it), and a
   forgotten explicit `LIGHT` click that had written `'light'` to `universalOfficeShellTheme`
   (cleared via `localStorage.removeItem`). **Live-confirmed the same day**: Evening Prayer → Back to
   Modes came back dark once more, but this time consistent with itself — the splash's own "DARK
   MODE" checkbox (old skin, unrelated to the shell) was checked, from forgotten browser testing days
   earlier, and unchecking it flipped the splash light immediately with no shell involvement either
   way. Before the fix, the same reproduction had produced a *mismatch* (checkbox unchecked, page
   dark anyway); checkbox and page state now agree, which is what this fix was for. See
   `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-20 entry for the full reproduction trail.

---

## 0a. Hard-won rules from the redesign. Read these before touching the shell.

These each cost at least one full patch to learn. They are not style preferences.

**SPECIFICITY.** `css/office.css` carries rules at (0,3,1) — e.g.
`body.office-active #main-content.app-primary-canvas { display: block; }` at line 2248. A plain
`body.shell-v2 #main-content` is (0,2,1) and **loses silently**. Any new structural rule against
`#main-content` must be written at (0,3,1) or heavier. A comment in `css/office-shell.css` says so.

**INLINE STYLES BEAT STYLESHEET RULES.** `index.html` writes `style="position:fixed"` and
`style="display:flex"` inline on elements the shell needs to move or hide. A CSS override without
`!important` cannot win. Clear the property **on the element** from JS, or target an ancestor that
carries no inline style.

**RE-RESOLVE ON THE RENDER, NOT THE CLICK.** `renderOffice()` is async. Any handler on `click` or
`change` reads the PREVIOUS office. A `MutationObserver` on `#office-display` is the signal that the
render landed. **Three separate bugs this session had this exact shape.**

**WHERE SOMETHING MUST ALWAYS BE TRUE OF APP-REBUILT DOM, STATE IT IN CSS.** The navigator and the
sidebars are rebuilt with `innerHTML` on every render, which wipes anything JS set. Imperative fixes
must win every render; a stylesheet rule states it once.

**`window.selectedMode` DOES NOT EXIST.** `office-ui.js` declares it with a top-level `let`, which
creates a global *lexical* binding and never becomes a window property. Read the lane from the DOM
instead: each settings drawer carries `mode-hidden` when inactive and exactly one does not.

**EVERY LANE'S RADIOS ARE IN THE DOM AND CHECKED AT ONCE**, and each lane names its hour several ways
(`esy-hour-override`, `esy-time`, `shared-office-nav-eastSyriac` are all the same choice). First-match
lookup over a shared DOM is not a lane resolver. Keep the per-lane candidate lists. The shared
navigator builds `name="shared-office-nav-${modeKey}"` at `office-ui.js:2393`, so those names never
appear in a grep.

**HARDCODED IDS ARE A RECURRING FAULT IN THIS FILE.** `getElementById('toggle-dark')` existed once, in
the BCP panel, so every other lane read a checkbox belonging to a different tradition — and
`undefined !== false` is TRUE, so a missing element resolved to DARK. Select by
`[data-app-dark-toggle]`. The comment inside `applyDarkMode()` already recorded this failure mode
twice before it happened a third time.

### On testing, which is where this session actually went wrong

**jsdom cannot see the cascade, an async render, or a computed style unless asked.** Three fixes this
session passed their tests and failed in the browser: a grid rule that lost on specificity, a theme
that never re-resolved, and a button that never moved. Each test asserted the wrong property —
DOM parentage instead of computed position, a resolver's answer instead of whether it was re-run.

**A harness that builds a fresh world per case cannot see a bug that only exists over time.** The
eleven-office Auto test proved the resolver correct eleven times while never once exercising
re-resolution, which was the broken part. **Mutate a live page.**

**ON ANY "IT DOESN'T DO WHAT YOU SAID": DUMP REAL STATE FIRST.** Josh's console dumps settled four
bugs that reasoning from the code had failed on — twice by what was MISSING from the output, since
`JSON.stringify` drops `undefined`. Two repo-checkable guesses in a row is the signal to stop
guessing. **Distrust any fix whose correctness cannot be exercised by a test.**

---

## 0b. Working with Josh on this

He applies every patch himself via `git am` and pushes. Cut `git format-patch`, surface the patch,
and give him the literal `git am` / `git push` lines **in the same turn as the commit**.

**Patches are authored as `JW Jeffery <josh@jwjeffery.org>`.** GitHub refuses to sign a commit whose
author is not a verified identity on his account, which broke `git am` on every container rebuild.
`.git/config` also held `you@example.com` as committer, which outranks global config; that was set
locally too, back when this was first fixed. **It recurred anyway, 2026-09-16, after a container
rebuild** — `git am` failed with `error signing commit: ... 403 | Author is invalid`. **It then
recurred TWICE MORE on 2026-09-19, in the SAME session, hours after `commit.gpgsign false` had
already been set and had already worked once.** This is a stronger signal than "doesn't survive a
rebuild": `commit.gpgsign false` (repo-local) is not reliably sticking at all in whatever this
Codespace is doing, for reasons not yet diagnosed. **Do not assume any fix to this is durable, even
within one sitting.** The recovery sequence that has worked every time so far, and should be tried
first on any future `git am` failure with this signature:
```
git config commit.gpgsign false
git am --abort
git am <patch>
git push origin main
```
`git am --abort` is safe even when nothing is actually mid-rebase — it no-ops harmlessly rather than
erroring, and has been needed almost every time because the failed `gpg` signing step leaves a stale
`.git/rebase-apply` behind. **Worth investigating properly next time this comes up, rather than just
re-running the workaround again**: check whether something in this specific Codespace (a devcontainer
setting, a global includeIf, an org policy) is force-re-enabling signing on each new shell, since
repo-local config alone has now failed to hold multiple times.

**Avoid a period in the patch filename** — it has caused "No such file or directory" on his end.

**He is a non-coder.** Landmarks in edit instructions must be unambiguous. But he reads output
closely and has caught more real defects from screenshots than the test suite has.

**His screenshots are the most reliable verification channel in this project.** When something is
wrong on screen, ask for one — and read it before theorising.

**Every commit carries the ledger entry, the resume-note update, `audit-ledger.html`'s SEED_VERSION,
and the cache-bust bump for every touched file, together.** A CSS param left behind while JS moves has
already served a stale stylesheet from cache twice.

---

**Session of 2026-09-12 ended here. Everything below was pushed and verified against a fresh
clone of origin, not just reported green locally. HEAD b35b55c, SEED_VERSION v269.**

### THE IMMEDIATE NEXT TASK: build the Dormition/Assumption cluster + the two COE Marian rows

All the research is done and recorded below. This is a DATA job on top of an engine that is now
ready for it. Content first as its own commit, then any engine wiring as a second — the pattern
used twice this session. Cut `git format-patch`, surface the patch and hand Josh the literal
`git am` / `git push` lines in the SAME turn as the commit. He applies these personally.

**Correct dates, each verified this session against a primary source — do not re-derive, but DO
open each row before editing it:**

| Tradition | Observance | Date | Corpus state |
|---|---|---|---|
| ANG / LAT | St Mary the Virgin / Assumption | Aug 15 | correct |
| EOR | Dormition of the Theotokos | Aug 15 | correct (confirmed live on orthocal, Major Feast Theotokos) |
| EOR | Leavetaking of Dormition | Aug 23 | **`afterfeast-of-the-assumption` is MIS-TAGGED OOR** — it is Byzantine content; confirmed live on orthocal |
| OOR:Coptic | Dormition proper (21 Tobi) | **Jan 29** | **MISSING ENTIRELY — new row needed** |
| OOR:Coptic | Assumption of the Body (16 Mesori) | Aug 22 | present and correct |
| OOR:Coptic | Last day, Fast of St Mary (15 Mesori) | Aug 21 | present as `vigil-of-the-assumption`; date right, **label wrong** — it is the fast's last day, not a bare eve |
| OOR:Armenian | Assumption (Verapokhumn) | **Sunday nearest Aug 15** | `dormition-of-the-theotokos` — stored as FIXED Aug 15, structural mismatch |
| OOR:Syriac | Dormition | Aug 15 | no row |
| COE | Dormition | **Aug 15 (Gregorian)** | **MISSING — new row needed** |
| COE | Protectress of the Harvest | **May 15** | see the May 15 question below |
| COE | Commemoration of Mary + St James | Friday before Epiphany | **ALREADY EXISTS** as `saint-james-the-brother-of-the-lord` |

**`dormition-of-the-theotokos` is NOT a duplicate row.** An earlier version of this note suggested
it might be. It is the Armenian row, correctly scoped `oorSubtradition: Armenian`. Do not merge or
delete it.

**The Armenian rule needs NO new engine machinery.** "Sunday nearest Aug 15" is identically "the
first Sunday on or after Aug 12" — verified across 2020–2050, zero mismatches, all seven weekday
cases exercised, window always Aug 12–18; 2026 resolves to Aug 16, matching the Armenian Prelacy's
actual observance that year. That is exactly the bounded-window shape already built for Joseph the
Betrothed (`maxOffsetDays`/`fallbackOffsetDays`). It needs one new fixed-date anchor branch in
`js/saints-resolver.js`, not new search logic.

**COE Aug 15 is GREGORIAN, confirmed 3/3** — ACOE Diocese of California 2024 and 2026, and ACOTE
Diocese of Western Europe 2026, all print it on plain Aug 15 against Gregorian grids (Transfiguration
at 8/6, not 8/19). It does NOT need `fixedFeastMode`. The 2024 California edition names it
explicitly: "Commemoration of the Falling Asleep (Dormition) of St. Mary the Blessed Virgin",
preceded by "Rogation of the Blessed Virgin Mary (August 1-15)". These are the printed calendars
already in `data/kalendar/source-witnesses/` (`2026cal.pdf`, `2024 full.pdf`, `English_2026_2.pdf`)
— read them with `pdftotext -layout`, they are the primary witness and need no web research.

**DO NOT cite `CGSC-CALENDAR-2026.pdf` as a Church of the East witness.** It is Christ the Good
Shepherd, Wakeley, Australia. Mar Mari Emmanuel was ordained in the Ancient Church of the East,
**excommunicated in 2014**, and founded that church as an INDEPENDENT East Syriac body in 2015. Its
calendar is Julian +13 throughout with a Gregorian Nativity (Epiphany Jan 19, Transfiguration Aug 19,
Dormition Aug 28) and it looks exactly like evidence of a Julian/Gregorian split. It is not ACOE or
ACE. What the Ancient Church of the East proper does for Aug 15 remains genuinely unestablished —
no ACE calendar is in the repo.

**TWO OPEN QUESTIONS FOR JOSH, NOT DECIDED:**
1. **COE May 15.** Both California editions print "Commemoration of Mart Mariam the Blessed Virgin
   **(Protectress of the Harvest)**" — same date, same harvest epithet, same agricultural function as
   the Syriac Orthodox May 15 already in the corpus as `holy-virgin-mary-of-the-harvest`
   (`oorSubtradition: Syriac`). Recommendation was a COE tag on that existing row rather than a
   second row, since `oorSubtradition` scopes only the OOR side; the row's name and its "(Syriac)"
   description would want widening. Not done — Josh's call.
2. **The three unmarked OOR rows** (see below).

**A trap that already nearly caused a duplicate:** the first COE Marian commemoration ALREADY EXISTS.
California 2026 prints Jan 2 as "Commemoration of the Blessed Virgin Mary, **and of St. James the
Brother of our Lord**" — a joint commemoration. The corpus has `saint-james-the-brother-of-the-lord`
(COE, `relative`, anchor epiphany, weekday 5, n −1) — the James half, with Mary absent from its
identity. The rule is correct and validated (Jan 2 in 2026, Jan 5 in 2024, both matching the printed
editions; Western Europe independently prints Jan 2). This is a **naming/identity fix on an existing
row, not a new row.**

**CORRECTION ON RECORD:** earlier in the 2026-09-12 session Claude claimed the East Syriac rite keeps
no Dormition at all, on a single Wikipedia witness. That was WRONG and Josh caught it. Two ACOE
sources (William Toma, acoecalifornia.org; Rev. Tower Andrious, bethkokheh.assyrianchurch.org, citing
Darmo's Ḥudra) both state the Church of the East keeps THREE Marian commemorations. Wikipedia
contradicts itself on this point across two of its own articles. Do not rely on it here.

---

### What was fixed and pushed on 2026-09-12 (context for the above)

**1. `traditionObservance` was INERT in the canonical async read path.** `resolveCommemorations`
never threaded `tradition` into the date rule, so `observanceFor()` always fell through to the shared
`observance`. 55 rows carry overrides; **60 resolved to a different day than the shared rule and were
rendering on the wrong date in the live app** while the data was correct. `filterCachedByTradition`
already did it correctly — the two public read paths disagreed, and that disagreement is what
surfaced it. One-line fix. Commit `eee6589`.

**DUPLICATE ROWS: five removed 2026-09-12 (session 5), including a live double-render bug.** Abraham
of Kashkar, Sabrisho and Andrew each had a residue row left behind when the 2026-08-30 consolidation
moved a date instead of deleting the row; all three printed TWICE for COE users. Sweeping the class
through the real resolver found two more the static check missed -- Shimon Bar Sabbae and Qardagh,
each holding a California ordinal rule AND a Western Europe cycle rule, printing twice a year on two
different days. **Josh's call: follow California**; the better-attested Western Europe rule was
removed and that fact is disclosed on both surviving rows. Zero double-renders remain across
2025-2035. Duplicate ids 49 -> 44; the rest do not collide and are NOT being renamed (ids are
referenced from `js/coe-eligibility.js` and `scripts/saints/*.json`). See the ledger entry.

**2. `saint-andrew-the-apostle` duplicate-id bug, exposed by fixing #1.** The Dec 13 (4 Kiahk) Coptic
override had been written to the wrong row of a duplicate-id pair — the COE-only row, which has no
OOR tag, so it could never fire. Moved. **The duplicate-id hazard is real and only PARTLY resolved across
the file — 44 duplicate ids remain as of 2026-09-12, none of them colliding. Key bulk edits on (id, month, day), never id alone.** Flagged
but not fixed: that COE-only row still carries `dayLegacy: "May 17"` against an observance of Nov 30.

**3. Option B built: sub-tradition schema.** `traditionObservance` keys may now be `OOR:Coptic` style,
resolved most-specific-first. `oorSubtradition` is load-bearing — **it was read by no code at all
before this.** Wired via `profile.oorSubtradition` at the single `resolveCommemorations` wrapper in
`office-ui.js`. Non-destructive: no sub-tradition set = everything renders, exactly as before.

**THE SEMANTICS CORRECTION THAT MATTERED — do not undo it.** `sanctoral.json`'s own top-level note
says an absent `oorSubtradition` means Coptic. **It does not.** 62 of the 143 unscoped OOR rows are
shared with ANG/LAT/EOR/COE and are pan-Christian (Epiphany, the Circumcision, Basil the Great,
Matthias, the Forty Martyrs of Sebaste). Absence means *not sub-tradition-specific*. A filter built on
the note's wording would hide those from Armenian users. ~~**The top-level note in `sanctoral.json`
still contains the wrong wording.**~~ **CORRECTED 2026-09-12 (session 5)**, along with a second false
claim in the same note (a `tagsGap` field no row carries, and 170 empty-`tags` entries where there
are two). See the ledger entry.

Backfill applied: 78 Coptic-only rows explicitly marked `Coptic`; all 39 bare `OOR` override keys
re-keyed to `OOR:Coptic` (each was coptic.io/Synaxarium-confirmed in its own note, so under the bare
key Armenian and Syriac users were being served Coptic dates; they now fall through to the shared
date). Commits `092cf5b` and `b35b55c`.

**THREE ROWS LEFT UNMARKED, NEEDING A DECISION:** `saint-abraham-of-carrhae`,
`saint-abraham-the-hermit` (both Feb 14) and `martyr-thespesios-of-cappadocia` (Jun 1) have NO
`ruleSource` of any kind and no Coptic attestation in their own fields. They read as Syriac/Byzantine
and may be stray OOR tags of the kind already cleaned up elsewhere in this project. Deliberately not
guessed at.

~~**NO UI PICKER EXISTS** for choosing a sub-tradition.~~ **BUILT 2026-09-12 (session 5).**
`#profile-oor-subtradition` now sits in the local profile defaults panel, after the Book of Needs
role control; `setUserProfileOorSubtradition()` in `js/office-ui.js`. The empty option maps to
`null`, never `'Coptic'`. Filter behaviour verified in a Node harness via `saintAppliesToContext`;
the DOM round-trip itself was not exercised in a browser and is disclosed as such in the ledger.

**Still open from before this session:** the EOR December confirmation pass (~33 EOR-effective rows,
not started); `st-pachomius-of-patmos` (needs the movable-date engine — his commemoration is Ascension
Day itself); `martyr-meletius-stratelates` (May 24, absent from orthocal under both traditions);
`saint-james-the-hermit` (Nov 27, no match under any phrasing). coptic.io connector still exposes zero
tools; Orthocal has been reliable every session — use it without hesitation.

---

## 0b. Original immediate-next-task text from the 2026-09-07 rewrite (superseded, kept for context)

**Check the entire coptic.io saint registry directly and import whatever major figures are genuinely
missing from OOR.** Josh's own words: "We will be done with it once you check the entire registry
and do any other imports that are needed." **This work is now DONE** — see section 7 below, "OOR
gap sweep CLOSED." The coptic.io-specific paragraphs immediately following this one are historical
context for why the sweep used Wikipedia/St-Takla.org instead of the live connector, and remain
accurate as history, not as a live task list.

**The coptic.io connector is per-Codespace infrastructure Josh runs and forwards locally
(`coptic_mcp_server.py`, repo root) — it is not reachable from a fresh Claude account/session with no
custom connector added, confirmed via `search_mcp_registry` returning nothing on 2026-09-07, not
assumed.** Ask Josh directly whether the server is running and port 8000 is forwarded as **Public**
in his Codespace's Ports tab before spending time on it; do not assume it will ever become available
without him doing that setup step first.

**Fallback in active use since 2026-09-07: Wikipedia's full-MONTH Coptic Synaxarium tables** —
better than the old per-day-page plan. One page per Coptic month
(`en.wikipedia.org/wiki/<MonthName>`, e.g. `Thout`, `Paopi`, `Hathor`...) carries the whole month's
commemorations in one table, citing CopticChurch.net, St-Takla.org and the printed 1995 Saint George
Coptic Orthodox Church Synaxarium — one fetch instead of ~30 day-page fetches. Use this for OOR
unless/until the connector comes up.

**Progress: Thout (11 Sept – 10 Oct) is the only month checked so far — 1 of 12 (see §7 for the four
open findings from it that still need a decision before acting). Paopi through Mesori, plus the
intercalary Pi Kogi Enavot, remain untouched.** Do not attempt the whole sweep in one pass — this was
explicit guidance after Thout alone surfaced four items needing individual judgment calls
(same-figure-different-reckoning questions, not simple absences).

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

---

## 2. Who and what

Josh (GitHub `JWJeffery`) owns **PrayerAppNew** / "The Universal Office" — a free, non-commercial
multi-tradition liturgical prayer web app at theuniversaloffice.com. He is not a coder. Four
traditions: Anglican (BCP 1979), Coptic (Agpeya), Church of the East (East Syriac), Byzantine
(Horologion).

A prior assistant, **Lucy**, was dismissed for falsely certifying content as accurate. All Lucy-era
certifications are void and must be independently re-derived. Nothing in this repo's own docs or
`structure.json` counts as evidence; verify against primary sources.

**`synaxarium-review/` is a separate project — do not touch it, do not extend it, do not build
anything parallel to it either without asking first.** It is a review UI (data build script, browser
concur/override/custom-decision workflow, disk persistence, a merge-back script) built for the
**Anglican Kalendar v0.1 candidate matrices** specifically (`data/kalendar/*-candidates.csv`,
SIN-keyed). Confirmed explicitly by Josh, 2026-09-07: this is a different project than the EOR/OOR
sanctoral work described in §7, even though both are "review a candidate against a source and
decide." To start it: `cd synaxarium-review && python3 -m http.server 8000`, then open
`http://localhost:8000` — this is already in the tool's own README; check there before asking
Josh to repeat it.

---

## 3. Workflow — non-negotiable

- Claude generates patches with `git format-patch`; **Josh applies them.** Claude never pushes.
- **Every commit gets a patch surfaced (`present_files`) and the `git am` / `git push` lines given
  in the SAME turn as the commit — no exceptions, ever.** This was violated once, 2026-09-07: six
  commits were made and reported as "committed" with no patch ever surfaced, meaning real work sat
  uselessly in the sandbox with nothing for Josh to apply. Caught only when he asked directly and
  was, rightly, furious. All six were recovered and applied together, but the lesson stands on its
  own: committing is not done until the patch is in Josh's hands.
- Surface the two lines ready to copy-paste, with no walkthrough:
  ```
  git am <exact-patch-filename>
  git push origin main
  ```
- **Always build the patch against the verified current `origin/main`.** Clone fresh and check
  `git log --oneline -1` first.
- If `git am` fails, the usual cause is re-running an already-applied patch. Clear with
  `git am --abort 2>/dev/null; rm -rf .git/rebase-apply`, then check whether origin already has it.
  **If `git am` fails with "Patch format detection failed" on a patch that Claude confirms parses
  fine on its own end (`git apply --check` passes clean), the mbox envelope likely got mangled in
  transit, not the diff content.** Fall back to `git apply <patch>` (applies the diff without
  needing the mbox format) followed by a manual `git add` and `git commit` -- but scope the `git add`
  to exactly the files the patch touches (`git add data/saints/sanctoral.json`, not `git add -A`).
  This bit once, 2026-09-07: `git add -A` swept in an unrelated batch of untracked files sitting in
  the working directory (the live `coptic_mcp_server.py` connector and its data) into a commit that
  was only supposed to touch the sanctoral JSON. No data was lost, but always name the exact path(s).
- **Patch filenames with a period in them (e.g. containing "coptic.io") have caused "No such file or
  directory" errors on Josh's end** when applying — likely a download/transfer quirk, not something
  wrong with the patch itself. If a `git apply` fails with a missing-file error right after a patch
  was surfaced, have Josh run `ls *.patch` first to see the actual filename before assuming the patch
  wasn't delivered; re-surfacing under a short, period-free filename resolved it once already.
- **Never use `json.dump()` on a huge file without version-controlled review** — prefer targeted
  edits. **Validate JSON before writing**, not after.
- **When scripting a bulk edit against `data/saints/sanctoral.json`, key on `(id, month, day)`, never
  `id` alone.** At least 58 duplicate `id` values exist in the file (found 2026-09-07, not yet
  resolved — see §7). A blind id-keyed write bit this project's own tooling mid-session: two
  unrelated rows sharing an id with ones being fixed got silently clobbered, caught only by a
  full-file duplicate-id rescan before the batch was trusted. Full-file backup before any bulk
  sanctoral edit, and re-verify with a fresh read after, every time.
- Cache-bust params in `index.html` (`?v=NNN`) must be **bumped manually** whenever the
  corresponding JS file changes.
- `AUDIT_GOVERNANCE_LEDGER.md`, this note, `audit-ledger.html` and `SEED_VERSION` are updated **in
  the same commit** as the fix, never batched later. **This slipped twice in one session
  (2026-09-07)** — once for the entire OOR sweep, once for the engine additions and the start of the
  gap sweep — both caught only in a later cleanup pass. Check `SEED_VERSION` against the actual
  latest commit's content every time you're about to write a ledger entry; don't assume it's current.

---

## 4. Standing content rules

- Every component cites a specific source page. Gaps are **disclosed** in component metadata and on
  the dashboard, never filled by guessing.
- **Sweep the class, don't fix the instance.** When one instance of a bug is found, check every
  sibling programmatically.
- **But do not sweep on assumption.** The Wednesday Evening Anthem remains the standing
  counter-example: it genuinely differs from every other weekday.
- Reused components are verified by direct text comparison, never assumed from title similarity.
- Node simulation against real dates before committing any calendar or engine logic — this is how
  the three new moveable-date rules in §7 were verified before being wired into data, not after.
- Scope and architectural decisions are Josh's. Record conflicts for deliberate resolution rather
  than overriding them silently.
- Work continues until finished. Do not treat content-complete as done while defects remain.
- **A structural mismatch is not the same as a data mismatch, and needs a different fix.** When a row
  is stored as `fixed` but the underlying commemoration is genuinely moveable (Pascha-relative,
  Christmas-relative, or a true recurring monthly date), no lookup will ever correct it — it needs an
  actual engine rule. Three of these were found and built this session (see §7); at least one more
  (the general moveable-observance gap for e.g. Joseph the Betrothed's ANG/LAT dates) may still be
  lurking elsewhere in the corpus. Don't assume "no match found" always means "no source" — check
  whether the row's own `observance.type` is even the right shape for what it's trying to represent.

---

## 5. Communication

Josh is extremely direct. Correct errors immediately, without softening or justification. No
walkthroughs of commands he already knows — check the repo/README for the answer before asking him to
repeat something that's already documented. **Ask directly and specifically for what you need** —
his words: *"I don't provide shit I'm not asked for. I'm not a mind reader."* Read pushback as an
instruction to work harder, but also as a genuine signal to stop and actually listen rather than
push the same thread forward — conflating two different things Josh has ("there already is a decision
engine" != "please build a decision engine") produced real, deserved anger on 2026-09-07. When in
doubt about whether something already exists in the repo, check before assuming it needs building.

---

## 6. Source reachability — probed, not assumed

| Source | Reach |
|---|---|
| **Maclean 1894** via Drive `read_file_content` | Front matter through printed **p.34** only |
| Maclean via ACOE mirror / archive.org | ~p.45 / hard wall. **Do not retry either.** |
| **O'Leary 1911** via Drive `read_file_content` | Full. `download_file_content` is unusable (10MB cap, 40MB file) |
| **Hapgood 1906** | archive.org gives front matter only; Appendix B came from Josh |
| **BCP 1979** | In repo, complete |
| **ODCC** | In repo but **no text layer at all**. Do not re-propose. |
| **Lambertsen Octoechos** | In copyright to ~2087; citable, not reproducible |
| **orthocal.info** (EOR, Slavic/OCA + Greek/Antiochian beta) | Direct MCP tools `search_saints` / `get_day` -- **connector has been flaky across sessions**, sometimes simply absent from the tool list for a whole turn with no error beyond "not available in this turn." When that happens: do not retry in the same turn; fall back to Wikipedia's compiled "Month Day (Eastern Orthodox liturgics)" pages (see §7) rather than stalling. |
| **coptic.io** (OOR, Coptic) | MCP tools `search_saints` / `get_day` / `get_day_coptic`, same flakiness pattern as orthocal.info -- **and now understood why**: `coptic_mcp_server.py` (repo root) is a live wrapper Josh must keep running and port-forwarded in his Codespace for this connector to work at all (2026-09-07 correction -- an earlier version of this note wrongly called this wrapper "superseded"; it is not). Not persistent -- does not survive a Codespace restart on its own, and the forwarded port's visibility (must be Public) can reset too. If the tool drops mid-session, that is the first thing to check/ask about, not a reason to assume something is broken on Claude's end. Fallback when it's down: Wikipedia's per-Coptic-day pages (e.g. `Thout 18`, `Paremhat 21`), sourced from copticchurch.net/st-takla.org. |

**Any item needing Maclean past p.45 is blocked on Josh supplying pages.** Retrying will not change
it.

---

## 7. What is open

### The EOR and OOR sanctoral confirmation passes are essentially DONE. Read this before re-running either.

**EOR: 375 of 381 tagged rows confirmed.** The 6 remaining are each disclosed with a specific reason,
not silently unconfirmed: `saint-joseph-spouse-of-the-blessed-virgin-mary` (needs its own EOR
traditionObservance rule -- same shape as the Sunday-after-Nativity rule below, not yet done for this
specific row's Western-dated shared observance); `martyrs-polyeuctus-victorinus-and-donatus`,
`st-agapitus-of-markushev`, `vladimir-icon-of-the-mother-of-god` (May 21 cluster -- genuinely no
match found in orthocal.info under any phrasing, real gap or the wrong tradition entirely, not yet
resolved); the two Clement-of-Rome-adjacent items are actually now RESOLVED (see the OOR note below).

**OOR: 88 of 158 tagged rows confirmed**, down from 367 tagged at the start of the sweep -- most of
the shrinkage is legitimate cleanup (Byzantine/Slavic/Western content that had picked up a stray OOR
tag with no Coptic attestation, either withdrawn where other tags remained or deleted where OOR was
the row's only tag). New schema field **`oorSubtradition`** (documented in the file's own top-level
`note`) scopes 32 rows to Armenian/Syriac/Ethiopian content that coptic.io cannot and should not be
asked to confirm -- absent means Coptic (OOR's governing tradition), present names the real
sub-tradition. Josh, 2026-09-07: **more sub-traditions are coming**; don't assume Armenian/Syriac/
Ethiopian is the final list.

**A live duplicate-`id` bug was caught mid-sweep** (see §3) -- at least 58 duplicate ids exist across
the file, not yet systematically resolved. Treat any bulk script against this file as unsafe unless
it keys on `(id, month, day)`.

**A real content bug was found and fixed**: 5 rows (the pre-Fast Four Evangelists commemoration, plus
Stephen Protomartyr) were OOR-tagged despite their own descriptions explicitly citing the East Syriac
liturgical calendar and `calendar-east-syriac.js` -- genuine Church of the East content that had never
carried a COE tag at all. Fixed: OOR removed, COE added. If another row's own description names a
different tradition's engine/calendar than its tags claim, trust the description over the tags.

**Clement of Rome -- correction, 2026-09-07 (Hathor pass).** The claim just above (in an earlier
version of this note) that the OOR pass "found him after all (Dec 8, 29 Hator)" and resolved the
question **does not match the file**: checked directly during the Hathor gap-sweep pass, and no
Clement row exists at 8 December. The corpus's only confirmed Clement of Rome is 23 November
(ANG/EOR/LAT/OOR). Either that earlier finding was made and never actually written to
`sanctoral.json`, or the claim was wrong from the start -- not determined which, and not fixed here,
because the underlying question (one Coptic-specific date at 8 December distinct from 23 November,
or no such date at all) is still open either way. **Do not trust this note's claims about what was
"resolved" without checking the file directly -- this is the second time in one day a stale claim in
this note has been caught against the actual repo state** (see the April/July EOR-progress correction
above). The general lesson about trying alternate search phrasings before concluding absence still
stands, and Ephrem the Syrian's case (OOR pass, judged the same way, not yet re-attempted) is still
worth revisiting.

**ANOTHER STALE CLAIM CAUGHT, 2026-09-11: the "23 November" above is also wrong.** Checked directly
against `sanctoral.json`: `hieromartyr-clement-of-rome` is stored at **November 24**, tagged EOR only
(not ANG/EOR/LAT/OOR as claimed) -- there is a separate, different Catherine-of-Alexandria-adjacent
row cluster near that date that may be the source of the confusion. This is now the THIRD time a
specific date/tag claim in this note has been caught wrong against the actual file. The standing
lesson bears repeating in the strongest terms: **do not cite a date, tag list, or "resolved" status
from this note in place of opening the file** -- treat every claim above this line as a lead to verify,
never as fact.

**Orthocal connector confirmed WORKING, 2026-09-11 -- EOR confirmation work resumed.** Unlike
coptic.io, Orthocal loaded and answered correctly all session (`search_saints`, `get_day`; Slavic
default, Greek option, Julian/Gregorian both available). Three findings from this session, plus one
full month actually re-verified:

- **Clement of Rome fixed**: this row had genuinely NO ruleSource of any kind (not a stale-note issue,
  a real gap in the file). CONFIRMED 2026-09-11 against orthocal.info's Greek-tradition option: exact
  match at Nov 24. Disclosed rather than hidden: Slavic (this project's EOR baseline) returns no
  Clement-of-Rome match at all under any phrasing tried, at either Nov 24 or Nov 25, Julian or
  Gregorian -- this is a real Slavic/Greek practice difference (or a Slavic-side data gap in
  orthocal.info), not the OOR-style "working tool, genuinely empty" absence pattern, since the same
  tool's Greek option found him instantly. Left at Nov 24, matching both the prior stored value and
  the Greek confirmation.
- **Two rows that LOOKED unconfirmed by a crude file grep were already correctly resolved** by an
  earlier session and should NOT be touched again: `saint-catherine-of-alexandria` (EOR/LAT row) and
  `saint-sylvester-i` both carry their real EOR confirmation in `eorDateNote`/`traditionObservance`,
  not the generic `ruleSource` field -- a naive `ruleSource`-only check flags these as gaps when they
  are not. Check `eorDateNote` and `oorDateNote` too before treating any row as unconfirmed.
- **May 2026 (all 31 EOR-tagged rows) re-verified against live orthocal.info, one row at a time.**
  29 of 31 confirmed exactly correct as stored (a few needed a second search phrasing -- "Simon
  Zelotes" not "Simon the Zealot," "Thalelaeus" not "Thallelaios," "Epiphanius"/"Methodius" alone
  rather than the full paired name -- phrasing misses, not real gaps). TWO GENUINE FINDINGS, neither
  simply fixable with a date edit:
  - `st-pachomius-of-patmos` (New Martyr Pachomius) is stored as a FIXED May 21 date, but his real
    Orthodox commemoration is **Ascension Day itself** (a movable feast) -- confirmed via `get_day`:
    2026's Ascension happens to fall on May 21, which is almost certainly why he was filed as fixed
    in the first place. This needs the same movable-date engine machinery as the three rules built
    2026-09-07 (see below), not a plain date correction -- flagged for that engine work, not touched
    here.
  - `martyr-meletius-stratelates` (May 24) genuinely does not appear in orthocal.info under either
    Slavic or Greek tradition, under any phrasing tried ("Meletius," "Meletius Stratelates"), and does
    not appear in the live May 24, 2026 Gregorian `get_day` result either (that day's saints are Simeon
    the Stylite, Nikita the Stylite, and Vincent of Lerins). A real open gap -- not resolved, not
    removed; needs a different source or a Julian-offset check not yet tried.
  Remaining May work: none -- May is DONE (31 of 31 rows checked; 29 confirmed as-is, 2 real findings
  disclosed above, 0 rows needed a plain date correction this month).
- **June 2026 (all 32 EOR-tagged rows) re-verified against live orthocal.info, one row at a time.**
  ALL 32 confirmed exactly correct as stored -- the cleanest month checked so far, zero new fixes
  needed. A few phrasing misses along the way, not real gaps: "Lucillian" not "Loukilianos,"
  "Theodore Stratelates"/"the Commander" (his plain-English epithet wasn't matching, the Greek
  epithet was), "David of Thessalonica" not "...Thessaloniki." TWO ROWS FLAGGED BY MY OWN LISTING
  SCRIPT AS JUNE MISMATCHES TURNED OUT TO BE FALSE ALARMS -- the script printed only the
  `traditionObservance.EOR` override's DAY, not its MONTH, so a same-numbered day in a different
  month read as a June date: `saint-irenaeus-of-lyons` (already correctly Aug 23 via
  `traditionObservance`, confirmed again live) and `saint-ephrem-the-syrian` (already correctly Jan 28
  via `traditionObservance`, confirmed again live) are BOTH fine and were not touched. One real
  cross-tradition finding, left as-is rather than acted on: `Isaurus` (June 17) and `Barnabas`/
  `Bartholomew` pairing type patterns keep surfacing where Slavic search comes up empty but Greek
  finds the figure instantly (`Isaurus the Holy Martyr, June 17, Greek only`) -- same shape as
  Clement of Rome above; noted, not fixed, since the row's stored date already matches the Greek
  confirmation.
  Remaining June work: none -- June is DONE.
- **August 2026 (all 34 EOR-tagged rows) re-verified against live orthocal.info, one row at a time.**
  ALL 34 confirmed exactly correct as stored -- another clean month, zero date fixes needed. Several
  useful cross-tradition confirmations fell out of this pass: Prophet Micah's EOR date (Aug 14) is
  independently solid, settling the EOR half of the Mesori-sweep finding about his different Coptic
  date (Aug 28) -- both traditions' dates are now confirmed correct on their own terms, this is a
  real same-figure-different-tradition situation, not an error either side; Bessarion the
  Wonderworker's EOR date (already checked in June) and the Coptic "Bessarion the Great" question
  from the Mesori sweep remain a genuinely open identity question, not resolved by this; Pimen/Poemen
  the Great (Aug 27 here) is the same Desert Father as `abba-poemen-the-hermit`, added to the Coptic
  side during the Mesori sweep at a different date -- good independent cross-confirmation, not a
  conflict; Aug 28 also lists a Righteous Hezekiah, King of Judah independently, alongside Moses the
  Black -- confirms Hezekiah (added to the Coptic side that same sweep, at Aug 10) is a real,
  widely-attested figure, just on a different date in each tradition. A few phrasing misses resolved
  on retry or via `get_day`, not real gaps: "Maccabean Martyrs" -> "Maccabees"; "Pimen of the Kiev
  Caves" matched under his specific epithet "Pimen the Much-Ailing" (get_day confirmed same
  monastery); "Myron the Presbyter" needed `get_day` since my first search pulled an unrelated Myron
  of Crete; "Moses the Black" matched under Orthocal's own label "St Moses of Ethiopia" (confirmed
  same figure via the story text). Zero new open findings this month -- no Isaurus-shaped
  Greek-only-match cases turned up in August.
  Remaining August work: none -- August is DONE.
- **September 2026 (all 28 EOR-tagged rows) re-verified against live orthocal.info, one row at a
  time.** ALL 28 confirmed exactly correct as stored -- third clean month in a row, zero date fixes
  needed. One useful disambiguation confirmed rather than assumed: `prophet-zachariah` (Sep 5) could
  plausibly refer to either the OT minor prophet Zechariah or to Zachariah, father of John the
  Baptist -- checked the row's own stored description first ("Father of the Forerunner; martyred in
  the Temple"), which already correctly identifies the NT figure, and Orthocal's Sep 5 entry
  ("Prophet Zachariah and Elizabeth... Father of St John the Baptist") confirms it exactly. A few
  phrasing misses resolved via `get_day`, not real gaps: "Encaenia of the Temple of the Resurrection"
  and "Exaltation of the Holy Cross" are feast titles, not indexed as saints by `search_saints`, so
  needed `get_day` to confirm (Sep 13 and Sep 14 respectively); "Euphrosyne of Alexandria" likewise
  needed `get_day` (matched under "Our Righteous Mother Euphrosyne"); "Gregory of Armenia" needed
  `get_day` too (found as "Hieromartyr Gregory of Armenia," story text confirms he is indeed Gregory
  the Illuminator, Enlightener of Armenia). Noted for whenever July comes up, not acted on now: a
  second, unsourced `saint-phocas` row exists at July 23 (from the earlier no-ruleSource sweep),
  distinct from this month's confirmed `hieromartyr-phocas` at Sep 22 (Phocas, Bishop of Sinope) --
  may be the same historical Phocas venerated under two different feast days (martyrdom vs.
  translation), or two different Phocases; worth checking together when July is worked.
  Remaining September work: none -- September is DONE.
- **July 2026 (all 27 EOR-tagged rows) re-verified against live orthocal.info, one row at a time.**
  ALL 27 confirmed exactly correct -- fourth clean month in a row, zero date fixes needed.
  **The Phocas loose end from the September note is now RESOLVED, not just checked**: `saint-phocas`
  (July 23) was flagged by my crude no-`ruleSource` script as unsourced, same false-alarm shape as
  Irenaeus/Ephrem/Catherine/Sylvester earlier -- opened the actual row and found it was already fully
  resolved back on 2026-09-07: both EOR and OOR corrected via `traditionObservance` to Sep 22,
  confirmed against orthocal.info AND coptic.io as the same identity as `hieromartyr-phocas`
  ("Hieromartyr Phocas, Bishop of Sinope" and "Phocas the Gardener" both fall Sep 22). One and the
  same Phocas, already correctly unified -- nothing left open here. Same story for
  `saint-joachim-and-saint-anne` (July 26): already correctly resolved via `traditionObservance` to
  Sep 9, matching `holy-ancestors-joachim-and-anna`. Lesson restated again: **always open the actual
  row and check `eorDateNote`/`oorDateNote` before treating a bare `ruleSource` check as meaning
  anything -- it has now produced a false alarm in every single month checked so far.** A few
  ordinary phrasing misses along the way, not gaps: "Archangel Gabriel" alone found the July 13
  Synaxis directly; "Marina the Great Martyr" needed "Marina Margaret Antioch"; "Macrina the Younger"
  needed "Macrina" alone (correctly distinguished from her grandmother, also "Macrina," at May 30).
  Remaining July work: none -- July is DONE.
- **October 2026 (all 37 EOR-tagged rows) re-verified against live orthocal.info, one row at a time.**
  36 of 37 confirmed exactly correct. **ONE REAL FIX MADE**: `prophet-joel` was stored at Oct 31 for
  BOTH its EOR and OOR tags, but Oct 31 is only correct for OOR (Coptic, "Departure of Joel the
  Prophet," confirmed against coptic.io 2026-09-07) -- EOR's real date is **Oct 19** ("Holy Prophet
  Joel," confirmed against orthocal.info). The row's own `ruleSource` claimed "OOR is this row's only
  tag," which was stale: an EOR tag had been added to the row at some point without giving EOR its
  own date. Fixed via `traditionObservance.EOR` -> Oct 19, OOR's Oct 31 left untouched and correctly
  sourced. Two rows flagged by my listing script or a spelling miss turned out to already be
  correctly resolved from earlier sessions, not touched again: `saint-marinus-the-martyr` (Oct 18,
  Greek-tradition confirmation from 2026-09-07, same Slavic/Greek pattern as Clement of Rome) and
  `saint-terence-and-eunice` (Oct 28, a disclosed wife's-name variant -- Eunice vs. Neonila -- already
  flagged as unreconciled rather than silently picked one way). A few ordinary phrasing misses
  resolved via `get_day`, not gaps: "Demetrius the Myrrh-streamer" needed "Great Martyr Demetrius"
  (Orthocal renders the epithet as "Outpourer of Myrrh"); "Abramius the Recluse" and the "Stachys...
  Aristobulus" apostle group both needed `get_day` rather than a name search.
  Remaining October work: none -- October is DONE.
- **November 2026 (all 37 EOR-tagged rows, including the newly-discovered duplicate) re-verified
  against live orthocal.info, one row at a time.** **ONE SIGNIFICANT STRUCTURAL FIX MADE**: found that
  `saint-clement-of-rome` (Nov 23, ANG/EOR/LAT/OOR, LFF-sourced) and `hieromartyr-clement-of-rome`
  (Nov 24, EOR-only, confirmed via orthocal.info's Greek-tradition option back in May) are the SAME
  historical figure duplicated across two rows, both carrying an EOR tag. `saint-clement-of-rome`'s
  EOR tag had only ever inherited the shared ANG/LFF date (Nov 23) and was never separately
  confirmed -- its own `oorDateNote` already said as much ("unconfirmed"). Rather than add a
  `traditionObservance.EOR` override here (which would have shown him TWICE on Nov 24 in the EOR
  view), the EOR tag was removed from `saint-clement-of-rome` entirely; EOR observance for this
  identity is now solely and correctly owned by `hieromartyr-clement-of-rome`. ANG/LAT/OOR untouched.
  **Bonus: this also resolves a long-standing mystery from earlier in this note** -- the "Clement of
  Rome... Dec 8, 29 Hator" OOR finding that a prior session worried had been made but never written to
  the file. It WAS written -- to `saint-clement-of-rome`'s `traditionObservance.OOR`, just under a
  different row id than whoever went looking expected. That whole "second stale claim" mystery is now
  explained, not just re-flagged.
  ONE GENUINE OPEN FINDING, not forced into a match: `saint-james-the-hermit` (Nov 27, described in
  this corpus as "Syrian ascetic") does not match either figure orthocal.info actually lists for that
  day (Greatmartyr Jacob of Persia; James the Wonderworker, Bishop of Rostov) -- tried four phrasings,
  none hit. Left open rather than assigned to either wrong figure.
  Everything else confirmed clean, including several already-correct multi-tradition rows checked and
  left alone rather than re-touched: `saint-elizabeth` (EOR Sep 6), `saint-leo-the-great` (EOR Feb 18),
  `herman-of-alaska` (EOR Dec 13), `saint-martin-of-tours` (EOR Nov 12) -- all already properly
  resolved via `traditionObservance` from earlier sessions. A few ordinary phrasing misses resolved
  via `get_day`: "Plato and Romanus" needed "Platon and Roman"; "Philip the Apostle" needed `get_day`
  directly (to distinguish from the Oct 11 Philip-of-the-Seventy-Deacons, already correctly a separate
  row); "Amphilochius of Iconium" needed `get_day` ("Amphilocus").
  Remaining November work: none -- November is DONE.
- **December 2026 (all 33 EOR-tagged rows) re-verified against live orthocal.info, 2026-09-12 --
  THE FULL EOR CALENDAR-YEAR SWEEP (Jan-Dec) IS NOW CLOSED.** 31 of 33 confirmed exactly correct as
  stored. TWO REAL FIXES: `saint-boniface` (Dec 19) had the wrong name/description copy-pasted from
  the OTHER duplicate-id `saint-boniface` row (Mainz missionary, June 5) even though its own
  ruleSource already correctly identified "Martyr Boniface and Righteous Aglaida" -- corrected the
  visible identity, left the date alone. `saint-stephen-protomartyr`'s EOR date moved from Dec 26 to
  Dec 27 via `traditionObservance.EOR`: the old ruleSource rested on a single OCR'd desk-calendar
  edition that visibly runs two days' columns together; live orthocal.info confirms Stephen is the
  THIRD Day of the Nativity (Dec 27), with Dec 26 exclusively the Synaxis of the Theotokos. ANG/LAT
  (Dec 26) and COE's own separately-flagged movable date on that row are untouched. One false alarm,
  not touched: `saint-theodore-the-grapt` looked like a search-phrasing miss but its own ruleSource
  already correctly resolves it ("Theodore the Branded").
  **All three individually-flagged saints carried over from earlier sweeps are now resolved:**
  `st-pachomius-of-patmos` needed NO engine work after all -- the May finding conflated his
  HISTORICAL martyrdom on Ascension Day (1730) with his LITURGICAL commemoration; checked live in
  three different years (2023, 2025, 2026) with Ascension on three different dates, and he's fixed at
  May 21 every time. `martyr-meletius-stratelates` is genuinely absent from orthocal.info but fully
  confirmed via oca.org's own saints database, matching this row's identity and description exactly
  at May 24 -- a real coverage gap in orthocal.info, not a corpus error. `saint-james-the-hermit`
  moved from Nov 27 to Nov 26: the original match was a false positive (bare "James" token against an
  unrelated "Greatmartyr James of Persia"); the real figure is Saint James the Solitary, disciple of
  St Maron, confirmed directly against oca.org's dedicated Nov 26 page (matches this row's own
  "Syrian ascetic" description exactly).
  **Remaining EOR sweep work: none.** Full detail on all five findings in
  AUDIT_GOVERNANCE_LEDGER.md's 2026-09-12 December-sweep entry.

### Three real moveable-date engine rules were built and tested this session (2026-09-07)

Previously flagged as needing "a real engine rule, not a lookup" -- now actually built, in
`js/saints-resolver.js`, and regression-tested against the 12 pre-existing Church-of-the-East
`relative`-type rows both with and without `ByzantinePaschalion` also loaded (byte-identical
results in both cases -- the refactor changed nothing for COE):

- **`beginning-of-great-lent` (OOR)** -- new `orthodoxEaster` anchor (Pascha - 55 days, always a
  Monday by construction). Deliberately a NEW anchor name, not folded into the existing `easter`
  anchor, because this resolver's own default for COE's `easter` anchor is `easterMode: 'gregorian'`
  (Western Easter) -- reusing the name risked a silent Paschalion substitution on any page loading
  both engines. `orthodoxEaster` always means the Julian/Alexandrian Paschalion regardless of what
  else is loaded.
- **Joseph the Betrothed / David / James (EOR, `traditionObservance`)** -- new `christmas` anchor
  (fixed Dec 25, no engine needed) plus a new bounded-window-with-fallback extension to the
  `relative` type (`maxOffsetDays` / `fallbackOffsetDays`). Implements GOARCH's own stated rule
  exactly: the Sunday on or after Dec 26, falling back to Dec 26 itself in the one case (Christmas
  falls on a Sunday) where the naive search would spill into January. Verified against both years in
  2020-2035 where that edge case actually occurs (2022, 2033).
- **Archangel Michael's Coptic synaxis (OOR, `traditionObservance`)** -- new `monthlyCoptic`
  observance type (`{type: 'monthlyCoptic', day: 12}`), resolved through the existing
  `js/calendar-ethiopian.js` engine (`EthiopianCalendar.getCopticDate`, already shared with the
  Ethiopian Sa'atat cycle). Confirmed via coptic.io: Michael is kept the 12th of EVERY Coptic month,
  a genuinely recurring commemoration no other observance type could represent.

### New, actively in-progress: EOR/OOR major-figure gap sweep

Different question from the confirmation passes above -- not "is our stored date right" but "does
the source have people we don't have AT ALL." Scoped deliberately per Josh (2026-09-07) to **major,
widely-venerated figures only**, not a full synaxarion import.

**EOR method**: batched web searches against Wikipedia's compiled "Month Day (Eastern Orthodox
liturgics)" pages (one per Gregorian day, sourced from Pravoslavie.ru/Ecclesia.gr/OCA) -- 4-5
consecutive days at a time, snippets alone usually enough.

**EOR progress: January through APRIL swept** (correcting an earlier version of this note, which
undercounted this as "through March" -- always verify against `git log`, not this note's memory of
it). January clean. February: 3 findings (`prophet-azariah` restored on an orthocal.info false
negative; `prophet-zechariah-minor-prophet` and `saint-photine-samaritan-woman` added as genuine
absences -- Photine's date corrected Feb 26 -> Mar 20 to match this project's Slavic/OCA reckoning
rather than the Greek Feb 26). March: 5 findings (Dismas the Good Thief's EOR tag restored; Aaron the
High Priest, Eudokia of Heliopolis, Paul the Simple, Joseph the Fair all added). **April: clean of
missing figures, but a real identity-mislabeling bug was found and fixed** (see
`AUDIT_GOVERNANCE_LEDGER.md`, commit `0989f34`, for the specific figure/row).

Every new/restored EOR row is marked as needing direct orthocal.info/OCA confirmation rather than
fully CONFIRMED -- found via Wikipedia, not the primary tool.

**Note: `dbede86 Add Joshua the Prophet to July 3 kalendar` is NOT part of this systematic sweep** --
it is Josh's own commit, applying a patch from the separate, parallel Anglican-Kalendar work via
`synaxarium-review/` (see §2). Do not read it as evidence the EOR sweep has reached July; it hasn't.

**OOR method, started 2026-09-07**: Wikipedia's **full-month** Coptic Synaxarium tables
(`en.wikipedia.org/wiki/<MonthName>`, e.g. `Thout`) -- better than the per-day-page plan this note
originally proposed, since one fetch covers the whole month rather than ~30 day-pages.

**OOR progress: Thout and Paopi checked, 2 of 12 Coptic months.**

*Thout* (11 Sept - 10 Oct): one addition -- Isaiah the Prophet, Thout 6 / 16 September. Four findings
left open needing individual judgment: Bartholomew's Coptic martyrdom date (Thout 1) vs. the existing
Western-dated row; whether the Coptic Moses (Thout 8) and the existing EOR-tagged "Holy Prophet
Moses" (4 Sept) are the same figure on different reckonings; Zechariah's Coptic martyrdom (also
Thout 8), risking compounding an identity ambiguity already flagged elsewhere; Thecla's Coptic feast
(Thout 23) sitting close to but distinct from her existing ANG/EOR dates.

*Paopi* (11 Oct - 9 Nov): three additions -- Hannah the Prophetess, mother of Samuel (16 October);
Saint Timon the Apostle, one of the Seven Deacons (5 November); and Saint Mercurius's Paopi 28 (7
November) row, a real joint commemoration with St Marcian -- **but NOT his primary feast; see the
2026-09-11 correction below.** Two findings left open: a Hilarion date twelve days off the corpus's
existing 21 October entries (3 November in the Coptic source), and a Dionysius reference at 2
November that one mirror source rendered as a broken, unreadable link -- nothing added on unreadable
text.

**CORRECTION, 2026-09-11**: Mercurius's famous "Two Swords" (Abu Seifein) epithet belongs to his own
martyrdom at **Hator 25 / 4 December**, not the Paopi 28 pairing above -- that gap was in fact the
single most significant gap found by either sweep, just mis-dated. The `saint-mercurius-of-caesarea-
abu-seifein` row has been moved to December 4 accordingly; the Paopi 28/Nov 7 pairing with Marcian is
real and untouched, already independently carried by the `saint-marcian` row. Sourced from Wikipedia's
Hathor_25 page plus the Saint Mercurius article's own feast list (25 Hathor/4-5 Dec = Martyrdom, 9
Paoni/16-17 Jun = Translation of relics, 25 Epip/1-2 Aug = Feast) -- same witness set as the rest of
this sweep. **NOT YET CROSS-CHECKED against coptic.io directly** -- see "coptic.io connector down"
below.

*Hathor* (10 Nov - 9 Dec): one addition -- Saint Cleopas the Apostle, the Emmaus Road disciple (10
November). Three candidates checked and found ALREADY COVERED (worth knowing before re-checking
them): Michael's Coptic monthly synaxis (already served by the `monthlyCoptic` engine rule built
earlier this session -- first live confirmation it actually works on a real day); Peter of Alexandria
(exact match, 8 December, already OOR-confirmed); Anianus (exact match, 29 November, already present).
Three more same-figure-different-day findings left open: St Anne's departure (20 November, a third
Anne-related date alongside the existing 26 July and 9 December ones); Clement of Rome's Coptic date
(8 December -- see the correction elsewhere in this note, an earlier claim that this was already
resolved does NOT match the file); and Gregory Thaumaturgus/Neocaesarea (30 November, eleven days from
the existing 17 November entry).

**METHOD WARNING, learned the hard way this pass: a narrow phrase search returning nothing is NOT
proof of absence.** Before checking Meshir/Paremhat, two figures were nearly added as duplicates --
"Paul the First Hermit" and "Daniel the Prophet" -- because a first search missed them under different
word order ("Saint Paul of Thebes in Egypt"; "Prophet Daniel"). Daniel's existing row was not just the
same identity but an EXACT DATE MATCH to the Coptic source being checked. Always run a second, broader
search before concluding absence, not just the first phrase that comes to mind.

*Koiak + Tobi* (10 Dec - 7 Feb, done together): five additions -- King David the Prophet (1 January);
Entrance of St Mary into the Temple (12 December); **Saint Takla Haymanot, the Ethiopian (2 January,
tagged `oorSubtradition: 'Ethiopian'`)**; departure of Saint John the Evangelist (12 January --
surprisingly had NO entry under any name before this, despite being one of the Twelve and author of a
Gospel, three Epistles and Revelation); Obadiah the Prophet (23 January). Elijah, Theophany and
Michael's monthly synaxis all reconfirmed already covered. The Miracle at Cana (21 January)
deliberately NOT added -- it is an event, not a person, and the sweep's scope is major figures. Three
more same-figure-different-day findings left open: the Holy Innocents' Coptic date (11 January,
differs from the existing 28 December entry, which also lacks an OOR tag); Anthony the Great's
Coptic departure (30 January, thirteen days from the existing 17 January entry); Timothy the
Apostle's Coptic martyrdom (31 January, differs from the existing 22/26 January entries).

All additions from both months are ADDED, not CONFIRMED -- found via Wikipedia, pending direct
coptic.io cross-check. Full detail and reasoning for every open item is in
`AUDIT_GOVERNANCE_LEDGER.md`.

*Paoni + Epip* (8 Jun - 6 Aug, done together): two additions -- **Joshua, son of Nun** (3 July;
NOTE this is unrelated to the SIN Josh separately added for Joshua in the Anglican Kalendar matrix on
the same date -- two different systems, two independent justifications, see the ledger) and **Simon,
son of Clopas, Bishop of Jerusalem** (16 July, distinct from Simon Peter and Simon the Zealot). Bishoy
and Shenouda both EXACTLY matched their existing confirmed rows -- good independent validation.
The Ephrem the Syrian flag from 2026-09-03 was still open as of that finding: a martyred "Ephraem"
turned up paired with Mercurius (6 August) but is very likely a different person from Ephraim the
Syrian the hymnographer (28 January, EOR only) -- that finding did not resolve the flag.

**RESOLVED 2026-09-11**: a direct coptic.io session re-tried four search terms (Ephrem the Syrian,
Ephrem, Ephraim, Ephrem of Edessa) -- all four came back empty, in the same session where the same
tool found Mercurius instantly and richly. A working tool returning genuinely empty is real evidence
of absence, not a search failure. Ephrem the Syrian is now treated as genuinely absent from the
Coptic Synaxarium: the speculative OOR tag has been removed from `saint-ephrem-the-syrian`, and the
tagNotes on both `saint-ephrem-of-edessa` allowlist rows updated to match. This flag is now closed.

**coptic.io connector down, 2026-09-11**: the connector shows as connected in this session but
exposes zero callable tools -- it's the GitHub Codespace backing it (`jubilant-journey-...
.app.github.dev`), which almost certainly needs waking up on Josh's end (Codespaces sleep after
inactivity); nothing to fix on this side. The Mercurius Hator 25 correction and the Ephrem resolution
above were both made from Wikipedia sourcing per the established OOR methodology, since the primary
tool wasn't reachable this session -- both marked NOT YET CROSS-CHECKED / pending confirmation
accordingly. Confirm against coptic.io directly once the Codespace is awake, before treating either
as fully CONFIRMED.

*Parmouti + Pashons* (9 Apr - 7 Jun, done together): only ONE addition -- Saint Jason, one of the
Seventy, host of Paul and Silas at Thessalonica (11 May). Parmouti yielded nothing at all -- every
major figure checked already exists on a different day. Two more near-misses caught in Pashons (Job,
Junia both already present); a THIRD kind of near-miss appeared -- "Shenoute" already exists as
"Shenouda" (14 July, OOR), a spelling variant rather than a word-order variant. One name (a
"Christopher" in the Parmouti source) was deliberately left untouched rather than guessed at: the
corpus's only existing Christopher is a clearly different 20th-century martyr, and the source gives
no detail to tell which Christopher is meant -- when in doubt, leave the row alone rather than risk a
false duplicate or a false new identity.

*Meshir + Paremhat* (8 Feb - 8 Apr, done together): only ONE addition -- Saint Onesiphorus, one of
the Seventy (3 April). Everything else checked either turned out already covered (Cyril of Jerusalem,
Hosea, Polycarp all exact date matches to existing confirmed rows) or was a same-figure-different-day
finding left open (the Presentation/Candlemas feast sits 13 days after the existing 2 Feb entry -- the
same Julian/Gregorian offset pattern seen via the ACOE diocesan comparison earlier this session,
independently confirmed again here; also Agabus, Meletius/Malatius, Joseph of Arimathea, Macarius the
Great, Narcissus of Jerusalem).

**Remaining: May-June and August-December for EOR (7 months).** This is a genuine multi-session
undertaking -- do not attempt to rush it or skip the cross-check-against-corpus step to save time.
When resuming, check `git log` and the ledger for the actual last-completed month before continuing
-- do not trust any single note's tally of progress at face value, including this one.

**Mesori + Pi Kogi Enavot (intercalary), 2026-09-11 -- OOR SWEEP CLOSED.** Checked against
St-Takla.org's full-month Synaxarium tables (one fetch per month covers all ~30/6 days), the same
witness family used throughout. FOUR ADDITIONS, each confirmed absent under any spelling first:
Hezekiah the King (Misra 4 / 10 August) -- a major OT king with no prior entry at all; Saint John the
Soldier (Misra 5 / 11 August) -- also venerated Byzantine-side as John the Warrior, absent from this
corpus under any tradition; Abba Poemen the Hermit (El-Nasi 4 / 9 September) -- one of the most quoted
Desert Fathers in the Apophthegmata Patrum, a real gap in a major figure; Saint Barsoma "the Naked"
(El-Nasi 5 / 10 September). ONE THING CHECKED AND FOUND ALREADY CORRECT: the Coptic Transfiguration
date (Misra 13 / 19 August) turned out to already be fixed and coptic.io-CONFIRMED from 2026-09-07
(`transfiguration-of-the-lord`'s own `traditionObservance.OOR` + `oorDateNote`) -- checked directly
before doing any work, avoiding a duplicate fix. SEVERAL SAME-FIGURE-DIFFERENT-DAY FINDINGS LEFT OPEN,
the now-standard caution, not acted on: Seven Holy Youths of Ephesus (EOR-only 4 August; Coptic date
Misra 20 / 26 August, no OOR tag at either day); Prophet Micah (EOR-only 14 August; Coptic date Misra
22 / 28 August); Prophet Malachias (EOR-only 3 January; Coptic date Misra 30 / 5 September); Bessarion
the Wonderworker of Egypt (EOR-only 6 June) vs. "Bessarion the Great" departure at Misra 25 / 31
August -- possibly the same desert father, not determined; Amos the Prophet (already EOR+OOR at 15
June) vs. this source's Nasie date (El-Nasi 5 / 10 September) for the same prophet -- the existing OOR
tag's date is not re-verified here; Julietta (Misra 6 / 12 August) vs. the existing `mar-cyriacus-and-
julitta` row (COE, 15 July) -- possibly the same martyr-mother paired differently by tradition. A
STRUCTURAL FINDING FLAGGED FOR JOSH, NOT TOUCHED: the corpus's main Dormition/Assumption row
(`dormition-or-assumption-of-the-virgin-mary`) carries its OOR tag at the shared Western 15 August
date, while the Coptic Assumption is actually Misra 16 / 22 August -- and the corpus already has a
`vigil-of-the-assumption` (21 Aug) and `afterfeast-of-the-assumption` (23 Aug) correctly bracketing
22 August, with no primary-day OOR row at 22 August itself. There is also a separate `dormition-of-
the-theotokos` row, OOR-only, also at 15 August, raising a possible duplicate-row question. This
touches a major Marian feast and several existing rows at once -- too consequential to fix
unilaterally; needs Josh's governance call, the same standard applied to other major-feast
date/structure questions in this project. Numerous other Mesori/Nasie commemorations (numbered Popes
of Alexandria, local martyrs and priests) were checked and deliberately not added, consistent with
this sweep's whole-project standard of major/widely-venerated figures only, not every named figure a
source prints. **THE FULL 13-MONTH OOR GAP SWEEP (Thout through Mesori, plus Pi Kogi Enavot) IS NOW
CLOSED.** All additions from the whole sweep remain ADDED, not CONFIRMED, pending direct coptic.io
cross-check -- the connector was unreachable throughout this entire sweep (see the note below).

**coptic.io connector -- persistently broken, 2026-09-11, do not keep re-attempting without new
information.** Across this session the connector cycled through `needs_reconnect` -> reinstalled ->
port set to Private (a real, now-fixed cause) -> `isAuthless: false` despite the real public API
(api.coptic.io, confirmed via its own docs at coptic.io/docs) being genuinely authless -> URL field
briefly regressed to the bare Codespace URL instead of the port-forwarded one (also fixed) -> still
`needs_reconnect`, zero tools, after every fix. Something about this connector's setup is not
resolving cleanly across multiple distinct, independently-diagnosed problems; Josh has a support
reference code from the last failure. Do not spend further session time re-diagnosing this from the
Claude side without a specific new lead -- the fixes attempted so far were all correct for the
symptom they addressed and none resolved it.

### Other known gaps, not yet worked
- Check `data/saints/sanctoral.json` directly for any row still carrying an unresolved "needs your
  governance call" tagNote rather than trusting this note's memory of which ones remain; several
  were resolved in the 2026-09-07 EOR fifth pass but this note may not list all of them individually.
- Everything under the previous archived note that this rewrite didn't carry forward explicitly
  (Formation prose editor-name strip, Education-layer coverage extension, Royal Anthem sourcing,
  Cathedral/Monastic axis, Coptic Prayer of the Veil, Horologion splash wiring, the Anglican Kalendar
  remainder via `synaxarium-review/`) -- **all still open**, just not restated here in full; see
  `documentation/RESUME_NOTE_ARCHIVE_2026-09-07.md` for complete detail on each.

---

## 8. Settled -- do not reopen

- **Charter §11 is CLOSED.** All four traditions carry all three explanatory depths, no scaffolds.
- **Depth default:** depth 1 on, higher depths user-selectable. Already shipped.
- **Middle Friday = the Friday of the FOURTH week of the Great Fast.** Wired.
- **Fast Evening Service is built** and renders correctly.
- **Coptic disclosure:** every Coptic depth-3 statement is explicitly about monastic use.
- Sidebar headings are uniformly "Office Settings". All screens have a dark-mode toggle. The "I'm not
  sure" splash option routing to Anglican is intentional. In-office tradition selectors are
  forbidden.
- **Do not use git authorship as provenance evidence** in this repo -- Josh applies every change.
- **`synaxarium-review/` is a separate project from the EOR/OOR sanctoral work** -- see §2. Do not
  extend it, do not build a parallel tool for the gap sweep in §7 without asking first.
- **The EOR fifth pass (2026-09-07) fixed mismatches rather than leaving them flagged** -- Josh's
  explicit direction that session. If a future session finds an EOR/OOR row with a stored date that
  doesn't match its real one, the standing expectation is now to FIX it (direct move if the row's
  only tag, `traditionObservance` if shared), not just document the discrepancy for later.
- **The full OOR calendar-year sweep (Jan-Dec) is CLOSED** as of 2026-09-07 -- see §7 for the current
  confirmed count and what's still open within it.

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
  the change touches. This is how the three new moveable-date rules in §7 were verified before being
  committed -- build a small test harness, run it against a range of years (especially edge-case
  years for any weekday-search logic), and compare with/without each optional engine loaded before
  trusting a change to code this central.
- The Fast Ramsha sequences use placeholders resolved in `js/office-ui.js` by substring match against
  the day's own ordinary ramsha sequence -- not a hardcoded map. An unresolvable marker fails loudly
  by design.
