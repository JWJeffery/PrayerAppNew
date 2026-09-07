# RESUME_PROJECT_NOTE.md

**Paste this at the start of a new conversation.** It is a handoff document, not a history. The
permanent record of every decision lives in `AUDIT_GOVERNANCE_LEDGER.md`; the classification of what
blocks each open item lives in `documentation/OPEN_ITEMS_FIXABILITY.md`. **Where this note and the
repo disagree, the repo wins** — it may have moved since this was written.

This note was rewritten on 2026-09-04. The previous version had accumulated 94 session entries over
~4,700 lines and had stopped being usable as a handoff. Its contents were checked against the ledger
before replacement: 59 entries existed **only** in the resume note, so the whole of the old note is
preserved verbatim at `documentation/RESUME_NOTE_ARCHIVE_2026-09-04.md`. Nothing was discarded.

**State as of 2026-09-07:** `SEED_VERSION v256-2026-09-07-eor-third-pass`, East Syriac corpus
448 components / 57 sequences, explanations harness 67 checks passing. **This header itself went stale
for three days** — it still read v236/2026-09-05 after the 09-06 COE-diocese-scoping and 09-07
Anglican-completion commits, even though the lower sections (§7/§8, the sanctoral table) were kept
current commit-by-commit the whole time. The header is not self-updating; check it against
`audit-ledger.html`'s own `SEED_VERSION` const, not against this note's memory of itself.
`SEED_VERSION` lives in **one place only** — a `const` near the
bottom of `audit-ledger.html` (search the file for `const SEED_VERSION`). It is not a standalone file
and not in `index.html`. The HEAD hash is deliberately not recorded here; it goes stale within a
session. Run `git log --oneline -1` against a fresh clone instead. Cache-bust params are currently
`office-ui.js?v=221`, `explanations.js?v=220`, `prayers.js?v=221`.

---

## 1. First thing to do, every session

**Read the full repo and the governance documentation before any analysis or build work.** This is
the most consistently enforced rule on the project and prior instances have repeatedly failed it. In
particular read `AUDIT_GOVERNANCE_LEDGER.md`, `documentation/OPEN_ITEMS_FIXABILITY.md`, and
`documentation/UNIVERSAL_OFFICE_CORE_CONTRACT.md`.

**Do not trust this note, or any stored memory, about whether something is blocked.** That question
was answered wrongly twice in one session from recollection. `OPEN_ITEMS_FIXABILITY.md` exists
because of it. Check there first — **and check it against the ledger.** On 2026-09-05 that file was
found carrying two rows as "blocked" which the ledger had closed five days earlier, and the
2026-09-04 rewrite of this note copied the error forward. The fixability file records what blocks an
item; it is not proof the item is still open.

---

## 2. Who and what

Josh (GitHub `JWJeffery`) owns **PrayerAppNew** / "The Universal Office" — a free, non-commercial
multi-tradition liturgical prayer web app at theuniversaloffice.com. He is not a coder. Four
traditions: Anglican (BCP 1979), Coptic (Agpeya), Church of the East (East Syriac), Byzantine
(Horologion).

A prior assistant, **Lucy**, was dismissed for falsely certifying content as accurate. All Lucy-era
certifications are void and must be independently re-derived. Nothing in this repo's own docs or
`structure.json` counts as evidence; verify against primary sources.

---

## 3. Workflow — non-negotiable

- Claude generates patches with `git format-patch`; **Josh applies them.** Claude never pushes.
- Surface the two lines ready to copy-paste, with no walkthrough:
  ```
  git am <exact-patch-filename>
  git push origin main
  ```
- **Always build the patch against the verified current `origin/main`.** Clone fresh and check
  `git log --oneline -1` first.
- If `git am` fails, the usual cause is re-running an already-applied patch. Clear with
  `git am --abort 2>/dev/null; rm -rf .git/rebase-apply`, then check whether origin already has it.
- **Never use `json.dump()`** — it reformats whole files. Targeted string replacement only.
  **Validate JSON before writing**, not after; a regex that stops at an escaped quote will corrupt a
  file otherwise.
- Cache-bust params in `index.html` (`?v=NNN`) must be **bumped manually** whenever
  `js/office-ui.js` or `js/prayers.js` changes. Currently `office-ui.js?v=217`, `prayers.js?v=206`.
- `AUDIT_GOVERNANCE_LEDGER.md`, this note, `audit-ledger.html` and `SEED_VERSION` are updated **in
  the same commit** as the fix, never batched later.

---

## 4. Standing content rules

- Every component cites a specific source page. Gaps are **disclosed** in component metadata and on
  the dashboard, never filled by guessing.
- **Sweep the class, don't fix the instance.** When one instance of a bug is found, check every
  sibling programmatically.
- **But do not sweep on assumption.** Twice this project has been saved by refusing to apply a rule
  to components whose pages were not held. The Wednesday Evening Anthem is the standing
  counter-example: it genuinely differs from every other weekday, so a blind sweep would have
  introduced an error into a correct component.
- Reused components are verified by direct text comparison, never assumed from title similarity.
- Node simulation against real dates before committing any calendar or engine logic.
- Scope and architectural decisions are Josh's. Record conflicts for deliberate resolution rather
  than overriding them silently.
- Work continues until finished. Do not treat content-complete as done while defects remain.

---

## 5. Communication

Josh is extremely direct. Correct errors immediately, without softening or justification. No
walkthroughs of commands he already knows. **Ask directly and specifically for what you need** — his
words: *"I don't provide shit I'm not asked for. I'm not a mind reader."* Naming an exact page range
gets it supplied, usually within minutes. Read pushback as an instruction to work harder.

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

**Any item needing Maclean past p.45 is blocked on Josh supplying pages.** Retrying will not change
it. Uploading works and is fast — pp.41–49, 103–108, 164–184, 211–224 and 264–283 were supplied this
way on 2026-09-04, and **pp.37–67 on 2026-09-05**; each unblocked real work the same day.

---

## 7. What is open

### Blocked on Maclean pages
**Nothing.** As of 2026-09-05 no open item is waiting on a Maclean page. Josh supplied pp.37–67 and
pp.96–98 / 206–211 / 236–248 the same day, which closed the last three rows. The one surviving
Farcings item — the Ps.100 "In the beginning" variant — needs the **Khudhra**, not Maclean, and
never was a Maclean question.

### Unblocked — startable now
- **Layer 3 East Syriac saints calendar.** The Kalendar appendix (pp.264–283) is now held. Josh's
  rule: any saint not verifiable through ACOE/ACE diocesan calendars or sanctoral books is to be
  **removed, not left bare**.
- **Pre-Fast Sunday folding rule — implementation.** The complete cascade is recorded in
  `components/traditions/east-syriac/rubrics.json` under `kalendar-rules-maclean-264-283`. Needs the
  count of Sundays after Epiphany per year plus Node simulation.
- **2038/2095 season overlap**; **`ordinary1/2/3.json` architecture review**.
  *(Dead `config.heading`, `#generic-tradition-label`, the untagged sanctoral rows and dark-mode
  parity were all cleared 2026-09-05 — see §8.)*
- **Formation prose: strip the editor's name from 88 fields / 91 sentences** (Byzantine, Coptic,
  East Syriac). Josh, 2026-09-05: sources must not appear in formation at all. The rendered output
  is already clean; the prose still says "Hapgood explains", "O'Leary records", "Maclean's table
  shows". Rewrite so the fact survives and the attribution goes.
- **Education-layer coverage extension** — currently ~49% of Coptic titles to ~57% of East Syriac
  components. Generic headings and individual psalm citations are deliberately unmatched.

### Blocked on something other than pages
- **Royal Anthem sourcing** — copyright. Two routes, neither authorised: OIRSI/Moolan permission, or
  disclosed machine translation from Bedjan's public-domain Syriac. **Josh's decision.** Note that
  Maclean p.49 prints a "Royal Anthem" but it is a *ferial* Middle Friday alternative whose name U.
  omits; it does **not** touch this item, which concerns the Sunday propers in the Khudhra.
- **Cathedral/Monastic axis** — needs research. `rubrics.json` records that the axis was **deleted**
  because Maclean does not describe two parallel forms of each hour. The Sunhadus material is about
  which offices are obligatory and at what length; it is **not** a per-hour variant axis and must not
  be used as one.
- **Coptic Prayer of the Veil** — absent from O'Leary; needs a different edition.
- **Horologion splash wiring** — Josh: needs a full audit, not there yet.
- ACE Denkha/Cross Gregorian question; Mar Daniel the Physician; Mar Mushi / St Jacob (pending
  zero-Moses-year).

### The sanctoral confirmation debt -- the largest open item on the project
1,154 entries; **576 carry a `ruleSource`**. **578 dates are still inherited and unconfirmed.**

**252 of the 309 rest on an Anglican witness.** 141 of those rows are ANG-only and are fully
settled; the other 111 also carry EOR/LAT/OOR tags, and an Anglican calendar does **not** confirm
that Rome or the Eastern churches keep that date. Read the per-tag table with that in mind.

**Dating authority (Josh, 2026-09-05): LFF IS CONTROLLING IN TEC.** Every other Anglican source —
the Prayer Book calendar, HWHM, GCW, FAS, SEC, the Anglican Martyrology — is a **secondary
witness**, admitted so as to include as many saints as possible, **never to override LFF**. Where LFF
carries an identity, LFF decides the date. Where LFF is silent, the secondary witnesses control.
Any new secondary-witness confirmation must be checked against LFF first — doing that
retrospectively on 2026-09-05 found three rows dated against LFF. The Prayer Book calendar in
`data/kalendar/source-witnesses/book_of_common_prayer.pdf` **is accurate** -- it is a later
reprint whose calendar carries General Convention's additions under a 2007 certificate. An earlier
session wrongly flagged it; do not re-raise that.

**Inclusion policy: figures such as Martin Luther are NOT admitted**, even where a witness carries
them (the Prayer Book calendar prints him at 18 February). Luther is not currently in the sanctoral.

| Tag | Confirmed | Remaining |
|---|---|---|
| ANG | 297 | **0 — complete** |
| COE | 87 | **0 — complete** |
| EOR | 314 | 89 |
| LAT | 134 | 269 |
| OOR | 128 | 240 |

**EOR status as of 2026-09-07, end of session — read this over any older note.** The table used to
show EOR at 266/146; that 266 counted every EOR-tagged row carrying *any* `ruleSource`, including
rows whose `ruleSource` only established the date via an Anglican witness (LFF, the Martyrology, the
Kalendar matrix) — which doesn't confirm an Orthodox date. Same "row is not the same as a claim" trap
the ANG-completion commit named for its own tag. True confirmed count at the start of today was 205.

**orthocal.info is now used via its MCP server, not raw `web_fetch`.** Josh added it as a custom
connector (`https://orthocal.info/mcp`) partway through today's session — this replaces the earlier
plan of Josh pulling pages by hand. Two tools: `search_saints(query, tradition)` returns the fixed
month/day a saint or feast is commemorated on; `get_day(day, month, year, calendar, tradition)`
returns everything for a single date. No fetch-restriction problems at all through this path — use
`search_saints` first for anything with a name, `get_day` to check what a specific date actually
holds. This is the way to keep working this list, not day-walking or raw fetches.

**coptic.io has the same MCP setup now, for OOR — but it needs a step orthocal.info didn't.**
orthocal.info runs its own public MCP server; coptic.io only exposes a plain REST API
(`api.coptic.io`), no MCP endpoint anywhere (checked thoroughly 2026-09-07 — not in its docs, repo,
blog post, or any MCP registry). So a wrapper was written: `scripts/coptic-mcp-server.py`, a small
Python MCP server that calls coptic.io's REST endpoints and exposes the same two-tool shape as
Orthocal (`search_saints`, `get_day`, plus `get_day_coptic` for a native Coptic-calendar date like
"7 Toba"). **Confirmed working end-to-end 2026-09-07**, run from Josh's Codespace and connected via
port-forward. Read the file's own docstring before touching it again — it documents a real `mcp<2`
version-pin gotcha and a multi-Python-environment gotcha that both actually happened and cost real
time to diagnose. Short version: **this process is not persistent.** It has to be running for the
connector to work, does not survive a Codespace restart on its own, and the forwarded port's
visibility (must be Public) can reset too. If coptic.io tools aren't responding in a future session,
check whether this needs restarting before assuming something else is wrong:
```
/workspaces/PrayerAppNew/.venv/bin/python -m pip install "mcp[cli]>=1.10.1,<2.0.0" httpx
/workspaces/PrayerAppNew/.venv/bin/python scripts/coptic-mcp-server.py
```
then re-forward port 8000 as Public and confirm the connector URL still ends in `/mcp` (not a typo
like `/mpc`, which happened once already). **Also note: coptic.io's Synaxarium data is sourced from
CopticChurch.net**, not from Coptic Reader (Southern US Metropolis) — the source this project
originally named as OOR's governing calendar. Same kind of source-identity question orthocal.info
raised for EOR (mirrors OCA/ROCOR rather than being OCA itself) — treat as authorized pending Josh's
explicit call the way orthocal.info was, not as automatically equivalent to Coptic Reader.

**This session's work, one pass through the 61 rows that had only an Anglican-sourced `ruleSource`,
plus a few incidental finds in the untouched 145:**
- **32 confirmed** — clean date match against orthocal.info, `ruleSource` extended (existing
  LFF/ANG text kept, EOR confirmation appended, not overwritten).
- **8 tags withdrawn** (`confession-of-saint-peter`, `saint-kateri-tekakwitha`, `saint-peter-chanel`,
  `saint-catherine-of-siena`, `saints-nereus-and-achilleus`, `saints-mary-martha-and-lazarus-of-bethany`,
  `all-saints`, `all-souls-commemoration-of-the-dead`) — no Orthodox attestation found under any
  phrasing tried; `tagNote` on each names what was checked. `all-saints`/`all-souls` specifically:
  Orthodox tradition keeps these as moveable feasts (Sunday of All Saints after Pentecost; several
  Soul Saturdays), not the fixed Nov 1/2 dates this schema requires — a schema-mismatch, not
  necessarily a real absence, worth remembering if a moveable-observance mechanism ever gets built.
- **19 rows left as genuine date mismatches, NOT edited — need your call, not mine:**
  `saints-cyril-and-methodius` (stored Feb 14, Orthodox's joint feast is May 11), `saint-matthias-the-apostle`
  (stored Feb 24, Orthodox keeps Aug 9 — and a separate untouched row for him already sits at Aug 9,
  now itself confirmed this session), `saints-perpetua-and-felicity` (stored Mar 7, Orthodox Feb 1),
  `saint-joseph-spouse-of-the-blessed-virgin-mary` (stored Mar 19 fixed; Orthodox keeps him on a
  moveable Sunday, doesn't fit a fixed-date row at all), `saint-ephrem-the-syrian` (stored Jun 9 —
  that's the Church of the East's date already confirmed for COE; Byzantine/EOR's is Jan 28),
  `saint-cyril-of-alexandria` (stored Jun 27, Orthodox Jan 18 jointly with Athanasius or Jun 9 alone),
  `saint-irenaeus-of-lyons` (stored Jun 28, Orthodox Aug 23), `saint-joachim-and-saint-anne` (stored
  Jul 26, Orthodox Sept 9), `saint-bartholomew-the-apostle` (stored Aug 24, Orthodox Jun 11 jointly
  with Barnabas or Aug 25 for the relics — the Aug 25 row already exists separately and is now
  confirmed), `saint-augustine-of-hippo` (stored Aug 28, Orthodox Jun 15, jointly with his mother
  Monica), `saint-matthew-the-apostle` (stored Sept 21, Orthodox Nov 16), `saints-simon-and-jude`
  (stored Oct 28, no Orthodox match found near that date at all), `saint-elizabeth` (stored Nov 5 —
  this is Elizabeth mother of the Forerunner, not Elizabeth of Hungary; Orthodox keeps her jointly
  with Zacharias on Sept 6), `saint-leo-the-great` (stored Nov 10, Orthodox Feb 18), `saint-martin-of-tours`
  (stored Nov 11, Orthodox Nov 12 — one day off, possibly a Julian/Gregorian artifact, not investigated
  further), `herman-of-alaska` (stored Nov 15, Orthodox keeps him Aug 9 for canonization or, mainly,
  Dec 13 for repose), `saint-clement-of-rome` (stored Nov 23; a second untouched row,
  `Hieromartyr Clement of Rome`, sits at Nov 24 — **orthocal.info's own saint index has no entry for
  Clement of Rome under any phrasing tried**, which is surprising given he's traditionally commemorated
  in Orthodoxy; treating this as a gap in orthocal's data, not as confirmed-absent — needs a different
  source, not a tag withdrawal), `saint-john-the-apostle` (stored Dec 27, Orthodox keeps him May 8 and
  Sept 26, not Dec 27), `the-holy-innocents` (stored Dec 28, Orthodox Dec 29 — a separate untouched row,
  `the-14-000-holy-infants`, already sits at Dec 29 and is now confirmed).

  **The repeated pattern above — a row sitting at the Western date while a separate, already-existing
  row sits at the correct Orthodox date for the same identity — showed up three times this session**
  (Matthias, Bartholomew, Holy Innocents) purely as a side effect of checking names. It's worth a
  deliberate pass rather than incidental discovery: there may be more duplicate identities like this
  hiding in the untouched 142.

**Separate discovery, not yet acted on: this corpus has at least 58 duplicate `id` values**, found
while trying to patch `saint-andrew-the-apostle` and `saint-matthias-the-apostle` (both collide with
a second, unrelated row using the identical id — different name, different date, different tags).
Confirmed via a full scan, not assumed: `saint-basil-the-great`, `saint-james-the-brother-of-the-lord`,
`saint-gregory-of-nyssa`, `saint-john-chrysostom`, `saint-isaac-the-syrian` and 53 others also collide.
This conflicts with this project's own stated integrity check ("zero duplicate ids") — either that
check hasn't caught these, or duplicate ids are being tolerated for genuinely-different rows that
share a slug. Not investigated further this session; flagging so it isn't lost. A str_replace-based
patch script needs `(id, month, day)` as the real key here, not `id` alone, until this is resolved.

Confirmed total after several sessions today: **314**, up from 205 at the start of the day. **89 EOR
rows remain.** New mismatches found in the third pass, not yet in the list above, needing the same
kind of governance call: Sylvester I (stored Dec 31, real date is Jan 2), Catherine of Alexandria
(stored Nov 25, real Nov 24 -- one day off), Marinus the Martyr (stored Oct 18, real Jul 6 or Aug 7),
Saint Innocent of Alaska (stored Mar 19 on the not-yet-confirmed row specifically, real Mar 31 or
Oct 6 -- note a second "Saint Innocent of Alaska" row at Mar 30 already carries a ruleSource from
earlier COE work; check before assuming these are the same claim). St. Pachomius of Patmos (May 21)
has a plausible but unconfirmed match: a "Holy New Martyr Pachomius (1730)" also appears on May 21,
described as buried on Patmos in the Church of St John the Theologian -- same person, most likely,
but the name/title doesn't match cleanly enough to write as CONFIRMED without a closer look. The
other four May 21 rows (Polyeuctus/Victorinus/Donatus, Agapitus of Markushev, Cassian the Greek,
Vladimir Icon) found no match on that date at all -- May 21 in this Orthodox calendar is Ascension
and Sts. Constantine & Helen, nothing resembling these four. No tag withdrawals done this pass
(lower confidence than the first session's withdrawals — this was a faster sweep under real time
pressure, so treat "no match found" here as provisional, not exhausted, until re-checked).

**Church of the East dates are DIOCESAN, not universal.** The Diocese of California and the Diocese
of Australia and New Zealand keep the same 2026 differently: fixed feasts are 13 days apart (Julian
reckoning at Wakeley — what `fixedFeastMode` in `js/calendar-east-syriac.js` exists for) and
week-anchored commemorations are 7 days apart. **California governs the COE tag**; Wakeley
(`CGSC-CALENDAR-2026.pdf`) is a comparative witness only. Never mix the two inside one derivation.

**A fixed date is a claim about the KIND of commemoration, not just its day.** The 150 untagged rows
looked unsourceable for weeks because they stored fixed dates for MOVEABLE commemorations — the
California calendars print Mar Abdisho across a four-week spread. Every matcher failed and the
failure was read as missing evidence. When a row will not match any calendar, check the rule type
before concluding there is no source.

**Parsed so far:** LFF 2024, the Prayer Book calendar, the Kalendar v0.1 candidate matrices, the six
OCA Desk Calendars, the Anglican Martyrology, the SEC master calendar.
**When a tradition's claim is exhausted, withdraw the TAG — delete the row only if that tradition
is its only tag.** Seven rows survived the 2026-09-06 Anglican purge because they also carry Latin or
Eastern tags, which are unconfirmed for want of a calendar rather than exhausted. Deleting them would
have taken Rome's and the East's commemorations with them.

**Test tag changes with `saintAppliesToContext`, not `occursOn`.** `occursOn` evaluates only the date
rule and knows nothing about tags; it will report a de-tagged row as still showing.

**Holy Women Holy Men is parsed** — its calendar is pdf pages 19-32 only, 233 days.
**Great Cloud of Witnesses and For All The Saints are PROSE, not calendars.** Running a calendar
parser over them produces 31 September and matches everything to 1 December. If they are ever needed,
they require name-index extraction, not a day grid.

**When citing the Anglican Martyrology, quote the passage that matched, never the day's opening.**
It prints many biographies under one date, so the opening usually names a different saint. That
mistake was made and corrected on 2026-09-05.

**Eves are derived, not cited** — an Eve is the day before its feast and no calendar prints them
separately. Deriving them found Bartholomew's Eve filed three days from its feast.
**When two Anglican rows resolve to one LFF day, LFF settles it — do not ask.** Seven duplicates
were deleted on 2026-09-05 that way. Two rows sharing an LFF day are only correct when they are two
different people (Vincent de Paul and Louise de Marillac; Rolle and Margery Kempe).

**24 identities are still duplicated across traditions purely to hold two dates** — Basil the
Great, Catherine of Alexandria, Mary of Egypt, Gregory of Nyssa and 20 more, 49 rows in total. They
**resolve correctly**; they are redundant, not broken. Merging them under `traditionObservance` is
an open improvement. Do NOT merge the 33 identities that involve an untagged row — those are
unsourced COE candidate dates and merging would assert one.

**Before moving any date, check the row's tags.** Moving a shared date on one tradition's authority
moves it for every tradition on that row. That happened once, to Elizabeth of Hungary, and was
caught and fixed the same day.

**One identity, different days per tradition: use `traditionObservance`.** Added to the schema
2026-09-05. A row may carry an optional map of tradition code to observance rule; the resolver uses
it when asked on behalf of that tradition, and the shared `observance` otherwise. **Never solve a
per-tradition date difference by duplicating the row** — that is the thing being deleted. And never
ask whether an ANG tag should come off a row because LFF disagrees with its date: give ANG its LFF
date.

**Dates come from communion and diocesan calendars** (Josh, 2026-09-05) -- the COE tranche is the
worked example. **The repo holds no Eastern Orthodox jurisdictional calendar, no Roman calendar or
martyrology, and for Oriental Orthodox only the Ethiopian Synaxarium.** ODS / ODCC / BOS are
reference works and are marked in `source-index.json` as *not* calendar authorities; Hapgood is
Byzantine explanatory apparatus, not a calendar. A Roman calendar plus one EOR jurisdictional
calendar would reach 528 rows directly. **Which jurisdiction controls for EOR, and which Roman
calendar, are Josh's decisions and are not yet made.**

**Governing calendars are set for every live tradition** (Josh, 2026-09-05):
ANG -> LFF 2024, then the other Anglican witnesses. COE -> ACOE diocesan calendars.
**EOR -> the Orthodox Church in America** (`oca.org/saints/lives`).
**OOR -> Coptic Reader** (Coptic Metropolis of the Southern US). The Coptic Church is the first
Oriental tradition; **the Ethiopian Synaxarium must not be used for OOR generally.**
**Rome is out of scope** — that lane is not built, so the 228 LAT rows are not a live question.

**EOR is unblocked.** Josh put six **OCA Desk Calendars (2021-2026)** in Google Drive at
`Agent/OCA Sanctoral`. They read cleanly through the Drive connector and carry the whole year.
January and February 2026 are done -- 45 rows confirmed. **The desk calendar is SELECTIVE**: one or
two commemorations a day, not the full synaxis, so it confirms a date when it names an identity but
its silence proves nothing. `oca.org/saints/lives` can adjudicate a single disputed day but not bulk.
**Ask: put the six PDFs in `data/kalendar/source-witnesses/`** so they can be processed directly
instead of one large Drive read at a time.

**orthocal.info authorized 2026-09-07 as a working EOR source, Josh's call, meant to last.** It
mirrors OCA (Slavic tradition)/ROCOR practice with clean per-date pages, a documented API, and per
Josh: "we will, at some point, expand into other Eastern Orthodox traditions" via its Greek
(Antiochian/GOA, beta) option — so this is not a one-off substitute, treat it as a first-class
witness going forward. The catch, found the same day: its arbitrary-date pages aren't freely
fetchable from inside this sandbox (see the corrected-EOR-count note above, by the confirmation
table) — only name-based searches reliably land on the right page. A bulk pull of the full year
by Josh himself (via the site's own `orthocal.info/api/` or by browsing) and pasting the result in
would unblock this far faster than continuing to search name-by-name from in here.

**OOR is still blocked on a file Josh holds and this repo does not:**
`coptic-synaxarium.json.txt`. **Do not repeat the "366 days, 702 entries" figure** — it came from a
ChatGPT message, was never verified here, and was wrongly written into this project's records on
2026-09-05. Nobody has opened that file. **This is a separate question from OOR sourcing generally**
— see the coptic.io MCP tool note earlier in this document (§ EOR status, 2026-09-07): a live,
queryable Synaxarium source now exists via `scripts/coptic-mcp-server.py`, independent of whether
that specific file ever surfaces. It doesn't resolve whatever that file was for, but it does mean OOR
confirmation work doesn't have to wait on it.

`Synaxarium-Constantinople.txt` was supplied 2026-09-05 and **is not the EOR baseline.** It is
Delehaye's 1902 Bollandist edition of a tenth-century Byzantine synaxarion — 82% Greek, rough OCR,
and a witness to what Constantinople kept then, not what the OCA keeps now. Josh's ruling: it is not a witness on this
project and is not to be registered as one. Do not re-add it. **Web-fetching OCA cannot carry
the bulk** — 356 EOR rows across 326 distinct days, one day per URL, and this environment refuses
any URL not already seen in a prior result, so arbitrary dates are only reachable by walking OCA's
own day-to-day links. Measured, not assumed. **Do not attempt a 326-fetch pass.**

**The instrument for the Anglican remainder is already built.** `data/kalendar/{month}/kalendar-v0.1-*-candidates.csv`
holds 1,194 ranked candidates across all 366 days, each with its SIN, source witnesses (BCP; LFF;
HWHM; GCW; FAS; SEC; AM) and source tier. `synaxarium-review/` is the review UI over it. Every row
is still `decision_status: Pending`. Use that, not another ad-hoc matcher.

**Rank in that matrix is precedence, not placement.** It orders which candidate wins a shared day;
it does not decide whether an identity belongs on the date. A rank-2 candidate is still placed
there by its witnesses. Rows whose `review_flags` mention date harmonization are the exception and
must be adjudicated individually — 9 are currently held back on exactly that.

### Awaiting Josh's decision
- **Whether to collapse the 27 multi-date untagged sanctoral identities.** Not a cleanup: 48 live
  tagged identities sit on multiple dates too, 41 across different traditions. Collapsing asserts a
  date.
- **Whether to separate "Options" from "Settings"** in the office drawer. Josh's shape,
  2026-09-05: it is **profile vs session**. Profile is asked once at the splash ("Where do you
  pray?" West/East/idk, then "layperson or ordained?", idk => lay, ordained => a decision tree) and
  shapes what is shown. Session is what you touch while praying. The first question is already
  built as `#tradition-entry`; the ordination question is not.
- **The Formation card's appearance in the drawer.** Josh: it looks awful. Not yet redesigned.
- **Book of Needs** — whether to extend to the full 8-role access ladder.

- **Minor hours scope (East Syriac)** — keep out of scope, matching Maclean, or find a separate
  source for full monastic minor-hour texts.
- **Fast display title** — in a fast office a component titled "Prayer before the Martyrs' Anthem"
  now sits next to a note saying that Anthem is not said in the Fast. That is what the source does,
  but it reads oddly. A fast-specific title is Josh's call; the existing title is correct in six of
  the eight places it appears.

---

## 8. Settled — do not reopen

- **Charter §11 is CLOSED.** All four traditions carry all three explanatory depths, no scaffolds:
  Anglican 23 entries (BCP 1979), Byzantine 38 (Hapgood 1906), East Syriac 30 (Maclean 1894), Coptic
  28 (O'Leary 1911).
- **Depth default:** depth 1 on, higher depths user-selectable. Already shipped. Confirmed by Josh.
- **Middle Friday = the Friday of the FOURTH week of the Great Fast** (Kalendar pp.270–272). Wired.
  No `NOT-YET-WIRED` sequence remains anywhere.
- **Fast Evening Service is built** (pp.211–213, 220) and renders p.212's order exactly.
- **Coptic disclosure:** O'Leary states the Coptic Office was never introduced into the parish
  churches. Every Coptic depth-3 statement is explicitly about **monastic** use.
- **GREEN promotion criteria:** Josh stated (2026-08-18) that "documented human verification against
  a named primary source" was never an actual requirement. If it comes up, **ask him** rather than
  asserting a rule.
- Sidebar headings are uniformly "Office Settings". All screens have a dark-mode toggle. The "I'm not
  sure" splash option routing to Anglican is intentional. In-office tradition selectors are
  forbidden.
- **Do not use git authorship as provenance evidence** in this repo — Josh applies every change, so
  authorship cannot discriminate.
- **Seasonal-rubric sweep is CLOSED** (2026-09-05). All seven remaining Evening Anthems carry
  Maclean's `[Varies ... the season.]` rubric, restored from pp.37–67 directly. **p.57 prints
  "Varies *according to* the season"** where the other six print "Varies *with*" — that is a real
  variant, kept verbatim; do not normalise it. Wednesday (pp.30-31) genuinely has no such rubric and
  stays without one.
- **p.49 and p.65 "Royal Anthem" do NOT unblock the Royal Anthem item.** Both are ferial weekday
  alternatives; the open item is the Sunday/festival Royal Anthems in the Khudhra, outside Maclean.
- **There is no separate Great Fast Sunday Evening Service.** Settled 2026-08-30, re-confirmed from
  the page 2026-09-05: p.211 opens "WEEKS OF THE MYSTERIES IN THE FAST **[On Week Days]**" straight
  after the Sunday Morning Service. Fast Sundays use the ordinary Festival Evening Service. Do not
  reopen this as a missing-content question.
- **The Farcings reference is verified.** `esy-farcings-of-the-psalms-reference` was checked end to
  end against a clean scan of pp.236–248 on 2026-09-05 — all 150 psalms, four canticles, twelve
  "Or" alternatives and all twenty-two Ps.119 clauses correct. Despite being transcribed in the same
  session as the fabrication incident, it is sound.
- **Dark mode is on every surface.** `index.html`, `admin/admin.html`, `audit-ledger.html` and
  `synaxarium-review/index.html` all carry a `data-app-dark-toggle` control. The three standalone
  pages cannot call `applyDarkMode()` and reproduce the 2026-09-03 boot rule inline. **Boot must
  never write to storage** — it passes `persist=false` so the OS preference is re-read each visit.
- **The 170 untagged sanctoral rows are deliberate, not debris.** Each carries a `tagsGap` field
  explaining it is a retained-but-unsourced Layer 3 identity. Do not sweep them.
- **A documented rule is not an enforced rule.** The Motwa close carried its own "except in the Fast
  and the Rogation of the Ninevites" note from the day it was built, and the Rogation half was
  enforced nowhere for months. When a component's metadata states a condition, check the renderer
  actually applies it.

---

## 9. Useful specifics

- Fresh clone: `git clone https://github.com/JWJeffery/PrayerAppNew.git`
- Explanations harness: `node scripts/explanations/verify_explanations.js` (needs
  `npm install jsdom --no-save`; remove `node_modules` and restore `package-lock.json` before
  committing).
- Integrity check worth running after any sequence edit: zero dangling component refs, zero duplicate
  ids, all JSON valid, `node --check js/office-ui.js`.
- The Fast Ramsha sequences use placeholders `__DAY_FIRST_SHURAYA__`, `__DAY_SECOND_SHURAYA__`,
  `__DAY_EVENING_ANTHEM__`, resolved in `js/office-ui.js` by **substring match against the day's own
  ordinary ramsha sequence** — not a hardcoded map, because per-day/per-cycle ids are not uniformly
  named. An unresolvable marker fails loudly by design.
