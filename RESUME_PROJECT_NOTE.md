# RESUME_PROJECT_NOTE.md

**Paste this at the start of a new conversation.** It is a handoff document, not a history. The
permanent record of every decision lives in `AUDIT_GOVERNANCE_LEDGER.md`; the classification of what
blocks each open item lives in `documentation/OPEN_ITEMS_FIXABILITY.md`. **Where this note and the
repo disagree, the repo wins** — it may have moved since this was written.

This note was rewritten 2026-09-07 (twice — once at session end, once more here after a further
short continuation). The previous version (2026-09-04 rewrite) had accumulated a long, now
largely-resolved narrative about the sanctoral confirmation effort. The whole of that old note is
preserved verbatim at `documentation/RESUME_NOTE_ARCHIVE_2026-09-07.md`. Nothing was discarded.

**State as of 2026-09-07 (Claude Sonnet account):** `SEED_VERSION v266-2026-09-07-oor-gap-sweep-parmouti-pashons-checked-1-added`.
**Josh's direction, 2026-09-07: do two Coptic months at a time from here** -- individual months were
adding too little per pass to be worth a separate patch each.
**As always, the repo may have moved past this by the time you read it — Josh runs (at least) two
Claude accounts against this repo concurrently.** Never trust this note's SEED_VERSION, HEAD, or
"what's open" section at face value — `git clone` fresh and check `audit-ledger.html`'s own
`SEED_VERSION` const and `git log --oneline -6` before doing anything else, every session, no
exceptions.

Cache-bust params as of this account's own last commit (unchanged this continuation — no JS was
touched): `office-ui.js?v=221`, `explanations.js?v=220`, `prayers.js?v=221`,
`saints-resolver.js?v=248` — re-check these too, every session; do not assume they're still current
just because they match here.

---

## 0. Immediate next task, requested by Josh at end of session

**Check the entire coptic.io saint registry directly and import whatever major figures are genuinely
missing from OOR.** Josh's own words: "We will be done with it once you check the entire registry
and do any other imports that are needed."

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
Saint Timon the Apostle, one of the Seven Deacons (5 November); and **Saint Mercurius of Caesarea,
Abu Seifein (7 November) -- one of the most widely venerated martyrs in the whole Coptic Church, the
single most significant gap found by either sweep so far.** Two findings left open: a Hilarion date
twelve days off the corpus's existing 21 October entries (3 November in the Coptic source), and a
Dionysius reference at 2 November that one mirror source rendered as a broken, unreadable link --
nothing added on unreadable text.

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

**Remaining: May-June and August-December for EOR (7 months); Paoni, Epip, Mesori plus the
intercalary Pi Kogi Enavot for OOR (3 Coptic months + the short intercalary month left).** This is a genuine multi-session undertaking
-- do not attempt to rush it or skip the cross-check-against-corpus step to save time. When resuming,
check `git log` and the ledger for the actual last-completed month before continuing -- do not trust
any single note's tally of progress at face value, including this one.

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
