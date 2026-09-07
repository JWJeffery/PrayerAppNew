# RESUME_PROJECT_NOTE.md

**Paste this at the start of a new conversation.** It is a handoff document, not a history. The
permanent record of every decision lives in `AUDIT_GOVERNANCE_LEDGER.md`; the classification of what
blocks each open item lives in `documentation/OPEN_ITEMS_FIXABILITY.md`. **Where this note and the
repo disagree, the repo wins** — it may have moved since this was written.

This note was rewritten on 2026-09-07. The previous version (2026-09-04 rewrite) had accumulated a
long, now largely-resolved narrative about the sanctoral confirmation effort — the EOR and OOR
passes it described in progress are now essentially complete (see §7). The whole of the old note is
preserved verbatim at `documentation/RESUME_NOTE_ARCHIVE_2026-09-07.md`. Nothing was discarded.

**State as of 2026-09-07:** `SEED_VERSION v260-2026-09-07-eor-oor-gap-sweep-jan-mar`. Check this
against `audit-ledger.html`'s own `SEED_VERSION` const, not against this note's memory of itself —
this header is not self-updating and has gone stale before. Cache-bust params currently
`office-ui.js?v=221`, `explanations.js?v=220`, `prayers.js?v=221`, `saints-resolver.js?v=248`. The
HEAD hash is deliberately not recorded here; it goes stale within a session — run
`git log --oneline -1` against a fresh clone instead.

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
| **coptic.io** (OOR, Coptic) | Direct MCP tools `search_saints` / `get_day` / `get_day_coptic`, same flakiness pattern as orthocal.info. The old `scripts/coptic-mcp-server.py` wrapper is **superseded** -- the tool is now connected directly, no wrapper/Codespace-port-forwarding dance needed. Fallback when the tool drops: Wikipedia's per-Coptic-day pages (e.g. `Thout 18`, `Paremhat 21`), sourced from copticchurch.net/st-takla.org. |

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

**Clement of Rome, resolved across both passes**: flagged during the EOR pass as "likely a
coptic.io/orthocal.info source-gap, not a real absence" after a name search came up empty. During
the OOR pass, a broader search term found him after all (Dec 8, 29 Hator). If a search for a major,
universally-venerated figure comes up empty, that is real evidence to try alternate phrasings before
concluding absence -- Ephrem the Syrian's case in the OOR pass was judged the same way and has NOT
yet been re-attempted with a different term; worth revisiting.

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
widely-venerated figures only**, not a full synaxarion import -- a full daily synaxarion runs
10-20+ names per day, almost all hyper-local figures this curated corpus was never trying to include.

**Method**: batched web searches against Wikipedia's compiled "Month Day (Eastern Orthodox
liturgics)" pages (one per Gregorian day of the year, sourced from Pravoslavie.ru/Ecclesia.gr/OCA) --
search 4-5 consecutive days at a time; the snippets alone usually carry enough of each day's list
without a separate fetch per day. For OOR, the equivalent is Wikipedia's per-Coptic-day pages (e.g.
`Thout 18`, `Paremhat 21`) -- **not yet tested this session**, EOR was worked first.

**Progress: EOR January through March swept, clean/found as follows.** January: clean, no gaps.
February: 3 findings -- `prophet-azariah` RESTORED (wrongly deleted during the EOR pass on an
orthocal.info false negative -- Wikipedia's Feb 3 page, itself citing Pravoslavie.ru/Ecclesia.gr,
shows he's genuinely kept); `prophet-zechariah-minor-prophet` and `saint-photine-samaritan-woman`
ADDED (both genuinely absent under any identity -- Photine especially notable, a major Gospel figure
with no entry at all; her date was corrected from Wikipedia's Feb 26 to Mar 20 after checking OCA
directly, since Feb 26 is specifically Greek tradition and this project's governing EOR reckoning is
Slavic/OCA). March: 5 findings -- Dismas the Good Thief got his EOR tag restored (an earlier EOR-pass
withdrawal was incomplete checking); Aaron the High Priest, Eudokia of Heliopolis, Paul the Simple,
and Joseph the Fair (the Patriarch, distinct from Joseph the Betrothed) all ADDED as genuine absences.

Every new/restored row from this sweep is marked as needing direct orthocal.info/OCA confirmation
rather than fully CONFIRMED -- found via a compiled secondary source (Wikipedia), not checked
directly against the primary tool.

**Remaining: April through December for EOR (9 months), then the full 12-month OOR/Coptic sweep
using Wikipedia's per-Coptic-day pages.** This is a genuine multi-session undertaking -- do not
attempt to rush it or skip the cross-check-against-corpus step to save time.

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
