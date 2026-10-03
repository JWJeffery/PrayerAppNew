**HISTORICAL — NOT CURRENT STATE. Statements below may be superseded; current status is in the live `RESUME_PROJECT_NOTE.md`.**

<!-- Split out of the live RESUME_PROJECT_NOTE.md on 2026-10-01 (the note had re-bloated to 901 lines).
Content below is preserved verbatim from that file's old section 7; only this banner and the section
headers were added. Everything here is CLOSED/HISTORICAL. -->

# Volume 6 -- 2026-09-29 to 2026-09-30, UI fixes + Cycle of Prayer ingestion, split out of RESUME_PROJECT_NOTE.md

**Statements in this volume that were later superseded (the repo wins -- verify before repeating any):**
- Wherever this volume says the **Parish tier "has no loader/registry" / is "still not wired"**, that was
  true when written but was fixed the same day: PR #90 (`84803f0`) added the Parish tier --
  `CYCLES_OF_PRAYER_PARISHES` + `findCycleOfPrayerParishEntry`/`loadCycleOfPrayerParishMonth` in
  `js/cycles-of-prayer.js`, and the render/refresh path in `js/office-ui.js`. All three tiers
  (Communion / Diocesan / Parish) render and have sidebar entries.
- The Cycle of Prayer roster is **complete** (92 files, validator PASS) -- the "Next:" / "IN PROGRESS"
  paragraphs about ingesting further batches are closed.

## A. Five rounds of UI fixes (2026-09-29)

**DONE 2026-09-29 — five rounds of small, real UI fixes, all reported live by Josh, all merged.** In
order: Audit Dashboard super-user-gated + Explore-other-Offices moved into the profile; Profile panel
un-gated from `?advanced=1`; "Reader/Subdeacon" stopped being called "a minor order" (wrong for TEC);
the Book of Needs role picker's options gated per-tradition; and finally Profile redesigned into a
true standalone modal (solid card, not the old translucent gradient — "less ugly and more readable"),
opened via a persistent per-office icon (`openUserProfilePanel()`/`closeUserProfilePanel()`,
`#app-profile-icon-btn`, moved into `.uo-ordo` by `office-shell.js` to avoid a branding-text collision)
plus a "Your Profile" Tools-row button, and "Anglican Communion" renamed to "The Episcopal Church"
everywhere it names this app's own tradition (not the separate, correctly-named worldwide-communion
Cycle of Prayer file, which is untouched). Full per-file, per-commit detail:
`AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-29 "five small UI fixes" entries.


## B. Profile/user system, Authorized Intercessions, Communion tier

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
meditation timer; Josh wants actual prayer text at that slot instead). **Communion tier INGESTED AND
WIRED IN, 2026-09-29.** `data/cycles-of-prayer/anglican-communion-2026.json` (`scope: "communion"`) is
the actual worldwide Anglican Cycle of Prayer, transcribed from "September 2026-December 2026 Anglican
Cycle of Prayer.pdf" in Josh's "TEC Cycle of Prayer" Drive folder (see below) — a daily rotation naming
one diocese+province (or, on Sundays, one whole province alone) at a time, Sept 1-Dec 31 2026 only (the
source itself is partial-year — disclosed in the file's own `notes`, not a gap in this work). Now
renders live: `js/cycles-of-prayer.js` gained `loadCommunionCycleOfPrayerYear`/
`getCachedCommunionCycleOfPrayerDay` (a bare-year cache, no diocese key, since there's exactly one
file); `js/office-ui.js` gained `renderCommunionCycleOfPrayerLine`/
`refreshCommunionCycleOfPrayerForCurrentYear`, called unconditionally (no profile gate, unlike the
diocese tier) right alongside the existing diocese-tier render/prefetch. Renders "Today, the Anglican
Cycle of Prayer asks us to pray for X." as its own line, appearing BEFORE the existing "This week, the
Diocesan Cycle of Prayer..." line, matching the Communion-then-Diocesan tier order (the Parish tier
still doesn't render anything; see below — the Provincial tier turned out not to exist, see below too).
**Live-verified in headless Chromium** (BCP Morning AND Evening Prayer,
Western Oregon diocese declared): 2026-10-05 correctly shows "The Diocese of Bukuru (The Church of
Nigeria (Anglican Communion))"; 2026-09-13 (a Sunday, `type: "province"` subject) correctly shows just
"The Anglican Church in Aotearoa, New Zealand and Polynesia" with no parenthetical; dates outside the
file's Sept-Dec coverage (2026-04-12, 2026-01-15) correctly show no Communion line at all while the
existing Diocesan line (including the "This is your own parish's week" note) is unaffected; zero new
console errors. `index.html`'s `js/office-ui.js` cache-bust bumped to `?v=319`. **Provincial tier
(TEC-wide, as distinct from the worldwide Communion cycle) — RESOLVED 2026-09-29, per Josh's own direct
observation: no such thing appears to exist.** TEC does not separately publish its own province-wide
cycle of prayer distinct from the worldwide Anglican Cycle of Prayer above (which already rotates
through TEC's own dioceses as part of its worldwide cycle, e.g. the Diocese of California entry above).
Not a gap in this work — there is nothing further to search for here. The four-tier framing in Josh's
original framing effectively collapses to three working tiers for this app: Communion, Diocesan, Parish.
Diocesan/Parish tiers: see the corpus entry below.


## C. Cycle of Prayer corpus, batches 1-15 and profile picker

**Cycle of Prayer corpus (`data/cycles-of-prayer/`) — storage/schema exist for all three tiers;
app-UI wiring exists for the diocese AND communion tiers, NOT the parish tier; content ingestion is
ongoing, most of the roster still to do.** `data/cycles-of-prayer/schema.json` (v1.2) is the governing
spec: file/entry/subject shapes; `cycleType` — `"dated"` for a weekly/daily cycle keyed by ISO date
within a stated `year`, `"monthly-recurring"` for a standing day-of-month cycle with no year (added
2026-09-28 when Arkansas's own source turned out not to be date-anchored at all); `scope` —
`"diocese"` (default) for a diocese's own cycle of its parishes, `"parish"` for one parish's own
internal cycle of its individual members/households, or `"communion"` for the single worldwide
Anglican cycle of dioceses/provinces (the latter two, plus subject types
`"household"`/`"diocese"`/`"province"`, all added 2026-09-29 — see the St. Bede's and Communion-tier
entries above). Read it before adding another diocese, parish, or touching the Communion file.
`scripts/cycles-of-prayer/validate.mjs` (`npm run audit:cycles-of-prayer`) validates every file across
all three scopes; `js/cycles-of-prayer.js`'s `CYCLES_OF_PRAYER_DIOCESES` registry and the profile
diocese `<select>` in `index.html` must both be hand-kept in sync with whatever diocese-level `.json`
files actually exist — **a file with no matching registry/UI entry silently does nothing** (true for
scope-`"parish"` files specifically — the parish tier still has no loader/registry at all; scope-
`"communion"` needed no such registry since there's only ever one file, referenced directly by its own
bodySlug).

**IN PROGRESS 2026-09-29, per Josh's direct instruction: ingesting the remaining diocese-level cycles
5 at a time, starting with the ones already sitting as files in Josh's "TEC Cycle of Prayer" Drive
folder, then moving to fetching each remaining diocese's own URL from the roster spreadsheet directly.
Anything unfetchable gets flagged in the roster (not endlessly retried) for Josh to pull himself.**
Batch 1 done: **Atlanta, Central Gulf Coast, Connecticut, East Carolina, Great Lakes**. Batch 2 done:
**Idaho, Kentucky, Lexington, Maine, Nebraska** — all `cycleType: "dated"`, all transcribed from the
actual rendered PDF/DOCX/spreadsheet content (not linearized text where that risked column-interleaving
errors, per the standing rule added 2026-09-29), all validated, none yet live-verified in a browser
(batch 1 was; batch 2 was validator-checked only — worth a spot check next session). Two notable
judgment calls in batch 2, both fully disclosed in each file's own `notes`: Idaho's source printed four
consecutive Sundays as June 5/12/19/26 that the Proper numbering and weekday math prove must be July
5/12/19/26 (corrected, not just flagged, per the project's standing "fix a verifiably wrong date" rule);
Kentucky's own source prints no calendar dates at all, only lectionary Sunday names, so its 2026 dates
were derived by cross-referencing the Diocese of Lexington's companion file (ingested in the same
batch), which prints explicit dates for the identical sequence of Sunday names under the same TEC
"Year A / Daily Office Year Two" lectionary. Full per-diocese transcription detail (every disclosed
judgment call, typo, ambiguous grouping) for both batches: `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-29
entries — not repeated here. Note: this session has no Google Drive/Sheets *write* tool, so "note it on
the spreadsheet" for an unfetchable roster URL (Josh's own instruction for that later phase) will need
to happen in this note/ledger instead, flagged to Josh — raise this with him before relying on it
silently.

**Batch 3 (New Jersey, Newark, Northern Indiana, Rio Grande, San Joaquin): FULLY DONE 2026-09-29 — built,
validated, registered, live-verified, all 5.** The 4 tractable dioceses were re-fetched fresh from Drive
(the prior session's own transcription reasoning had never been written to a file, so it was re-derived
against the live source rather than trusted from memory) and shipped as
`episcopal-newark-2026.json`, `episcopal-new-jersey-2026.json`, `episcopal-rio-grande-2026.json`,
`episcopal-san-joaquin-2026.json` — `cycleType: "dated"`, `year: 2026`. **Northern Indiana resolved same
day**: its source is a repeating 1-through-37 list with no calendar anchoring, fitting neither existing
`cycleType` — raised directly with Josh rather than guessed at, and his answer ("Cut it off after 31")
turned out not to need a new schema at all: dropping items 32-37 (all disclosed in the file's own
`notes`, not silently discarded) leaves exactly 31 items, which fits the EXISTING `"monthly-recurring"`
shape Arkansas already uses. Shipped as `episcopal-northern-indiana.json`. All 5 registered in
`CYCLES_OF_PRAYER_DIOCESES` (`js/cycles-of-prayer.js`). `npm run audit:cycles-of-prayer`: PASS, 23
files, 0 findings. Live-verified end to end in headless Chromium against the app's own actual runtime
(`loadCycleOfPrayerYear`/`getCachedCycleOfPrayerWeek`), not a standalone harness — including, for
Northern Indiana specifically, the February-28 short-month edge case a day-of-month cycle needs to get
right. Full per-diocese transcription detail (every disclosed judgment call): `AUDIT_GOVERNANCE_LEDGER.md`'s
2026-09-29 "Diocese ingestion batch 3" entries — not repeated here. New Jersey (365-entry full daily
cycle, the most structurally unusual file in the corpus so far) was built via a one-off Node parsing
script (scratch-only, not committed) rather than hand-listed, then spot-checked against the source at
every structurally ambiguous date before being trusted.

**Batch 4 (Southwestern Virginia, Western Massachusetts): DONE 2026-09-29 — the last two Drive-
identified dioceses, closing that entire phase.** Shipped as `episcopal-southwestern-virginia-2026.json`
(29 entries, June 7-Dec 20 2026 — the source's own header claims through Dec 27 but no such entry
actually exists in the text) and `episcopal-western-massachusetts-2026.json` (52 entries, all of Jan
4-Dec 27 2026). Both registered, both live-verified against the app's own runtime alongside batch 3's
four. `npm run audit:cycles-of-prayer`: PASS, 25 files, 0 findings. Full per-diocese detail:
`AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-29 "Diocese ingestion batch 4" entry.

**Every diocese-level source file already sitting in Josh's "TEC Cycle of Prayer" Drive folder is now
ingested — that phase is fully closed.**

**Batch 5/6 (California, Central Florida, Central New York, Chicago, Colorado, Florida): DONE
2026-09-29 — the first batch drawn from the roster spreadsheet's own diocesan URLs directly (not a
Drive file), 6 dioceses.** All `cycleType: "dated"`, `year: 2026`, registered, validated
(`npm run audit:cycles-of-prayer`: PASS, 31 files, 0 findings). Chicago is the largest/most complex file
in the corpus (52 entries, two structurally distinct halves — deanery-grouped domestic parishes for the
first ~33 weeks, institutional/thematic content with no named parishes for the rest). Central New York's
page was bot-protected (an `sgcaptcha` challenge page, not real content) — reported to Josh per his own
new standing instruction (*"Send me the link anytime you get blocked, and I'll fetch it"*) and he pasted
the real content directly; **this is now the standing procedure for any future blocked page, replacing
the old approach of working around or abandoning it.** Easton and El Camino Real were tried and set
aside as impractical (JS-generated PDF links; a 52-post blog archive respectively) in favor of cleaner
alternatives within the same batch — not formally logged as "unfetchable," worth a second look later if
time allows. Full per-diocese transcription detail: `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-29 "Diocese
ingestion batch 5/6" entry.

**Batch 7 (Delaware, Georgia, Hawai'i, Indianapolis, Iowa, Kansas, Long Island): DONE 2026-09-29 — 7
dioceses, the first batch built with parallel background `Agent` subagents** (Josh: *"Looks like we have
been given some credits. Please feel free to dispatch more than one agent to work on this more
quickly"*) — five agents ran concurrently, each scoped to write only its own diocese's file, never the
shared registry/ledger/git state. **Two brand-new cycleTypes added to the schema (v1.2 → v1.3), per
Josh's direct decision** (the same kind of call that added `monthly-recurring` for Arkansas):
`"annual-recurring"` (month+day, no year, repeats every calendar year including Feb 29 — for Long
Island's 366-entry annual cycle) and `"ordinal-sunday-monthly"` (month + which Sunday 1st–5th, no year,
no calendar date in the source at all — for Hawai'i's "3rd Sunday of March"-style cycle). Both got real
runtime resolution logic in `js/cycles-of-prayer.js` (`resolveAnnualRecurringEntry`,
`resolveOrdinalSundayMonthlyEntry`), not just data support — live-verified working, including the Feb 29
leap-day wraparound and the ordinal-Sunday-to-real-calendar-Sunday lookup. Delaware's own hosted cycle
(a JS-rendered Flipsnack flipbook) was unfetchable from this sandbox — reported the blocked link to Josh
per his own standing instruction, and he uploaded the actual PDF directly; its single Sept 2026–Aug 2027
source document was split into two files (`episcopal-delaware-2026.json`/`-2027.json`) at the calendar
year boundary, per this schema's own one-file-per-year rule, so the 2027 portion is actually reachable by
the app rather than silently dropped. **A slug-mismatch bug was caught by live verification before
shipping**: Hawai'i's new registry entry used `dioceseShort: 'hawaii'`, but the pre-existing
`TEC_DIOCESE_DIRECTORY` (the profile-picker roster) already had it as `'hawai-i'` — since
`getCachedCycleOfPrayerWeek` gates every lookup against that directory, the mismatch silently made
Hawai'i's content unreachable until caught and fixed (file renamed, `id`/`dioceseShort` corrected to
match). **Lesson for future batches: check a new diocese's slug against `TEC_DIOCESE_DIRECTORY` before
finalizing the registry entry**, not just after a live-verification failure surfaces it. Full per-diocese
transcription detail: `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-29 "Diocese ingestion batch 7" entry.

**Batch 8 (Louisiana, Maryland, Michigan, Missouri): DONE 2026-09-29 — 4 of 5 dioceses; Massachusetts
blocked, flagged to Josh, not yet retried.** Continued the parallel-`Agent` pattern from batch 7. Skipped
Mississippi and Navajoland (already flagged in `tecDioceseRoster` as non-dated shapes — week-numbered and
day-of-week respectively — worth their own dedicated look rather than folding into a routine batch).
Massachusetts's own page and PDF both sit behind a client-side bot-protection challenge; the agent
correctly declined two escalation paths the sandbox's own permission classifier blocked outright
(solving the anti-bot puzzle programmatically; routing through a public CORS proxy) and also correctly
declined to transcribe from AI-search-engine snippets after one same-looking search hit turned out, on
direct download, to be a different diocese entirely (Quebec) under a similarly-named file — a concrete
demonstration that a search "match" for this kind of document can't be trusted without a byte-level read.
Blocked URL reported to Josh per his standing instruction. **Slug cross-check against
`TEC_DIOCESE_DIRECTORY` done BEFORE registering this time** (the lesson from batch 7's Hawai'i mismatch)
— all four already matched, no renaming needed. Full per-diocese detail: `AUDIT_GOVERNANCE_LEDGER.md`'s
2026-09-29 "Diocese ingestion batch 8" entry.

**Batch 9 (Montana, Nevada, New Hampshire, New York, North Carolina): DONE 2026-09-29 — 5 of 5, no
blocks.** Continued the parallel-`Agent` pattern. Skipped Mississippi/Navajoland again (same reason as
batch 8). **New reusable technique found: for a diocese page that embeds a Google Calendar widget with
no static event data (Montana's case), check the page's own HTML for the embedded iframe's calendar ID
and try that calendar's public ICS export (`calendar.google.com/calendar/ical/<id>/public/basic.ics`)
before concluding the source is unfetchable** — this worked with no auth/JS-rendering needed and got
real first-hand data, not a summarized guess. New York's file is a full 365-entry DAILY cycle (like New
Jersey's), not weekly. North Carolina reused the Atlanta precedent (disclose-and-exclude a lopsided
lead-in of prior-year weeks) rather than Delaware's even-split precedent, choosing between the two
established patterns based on the actual balance of content. One apparent rendering anomaly (New York
showing "Manhattan, All Angels' Church" — place before name) was investigated and confirmed to be the
app's own pre-existing, long-standing rendering convention for every diocese's parish subjects, not a
bug — see `renderDiocesanCycleOfPrayerLine` in `js/office-ui.js`. Full per-diocese detail:
`AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-29 "Diocese ingestion batch 9" entry.

**Next:** continue the roster spreadsheet's remaining dioceses via their own URLs, 5-6 at a time (per
Josh's original instruction: flag anything unfetchable in this note/ledger, and send Josh the link
directly if blocked by bot protection, rather than endlessly retrying or working around it — there is
still no Drive/Sheets write tool to literally annotate the spreadsheet itself). Parallel background
`Agent` dispatch (one per diocese, each scoped to its own new file only) is now the established pattern
for a multi-diocese batch when the session has capacity for it — use it again rather than fetching
serially; **always cross-check each new diocese's chosen slug against `TEC_DIOCESE_DIRECTORY` before
registering, not after.** For a JS-only calendar-widget source, try the embedded-Google-Calendar ICS
trick (above) before giving up.

**Easton and Massachusetts: DONE 2026-09-29, both unblocked by Josh directly, per his own standing
"send me the link and I'll fetch it" offer.** Josh supplied both PDFs after being sent the exact blocked
URLs. `episcopal-easton-2026.json` (13 entries, July-Sept 2026 only — a quarterly document; "Recheck for
Q4" per the roster's own note, same pattern as Missouri/Springfield). `episcopal-massachusetts-2026.json`
(47 entries, Jan 4-Nov 22 2026 — a 52-week source spanning Advent 2025 through Pentecost 2026; the 5
weeks falling in calendar 2025 were disclosed-and-excluded per the Atlanta/North Carolina precedent, not
Delaware's even-split precedent, since the balance is heavily lopsided 5-vs-47). A genuine date-ordering
anomaly in the Massachusetts source itself (its printed "Sixth Sunday of Easter" week is dated AFTER its
"Seventh Sunday of Easter" week, and neither Sunday-after-Easter number matches the real 2026 calendar
for either date) was disclosed and the entry order corrected to satisfy this schema's chronological rule,
without touching either week's own printed content/label. **El Camino Real: REMOVED from
`TEC_DIOCESE_DIRECTORY` entirely, per Josh's direct instruction ("El Camino Real is historical only.
Remove it.")** — this diocese merged into the Diocese of California and no longer exists independently;
it is no longer a selectable profile option, not merely skipped for ingestion. Full detail:
`AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-29 "Easton, Massachusetts ingested; El Camino Real removed" entry.

**Batch 10 (North Dakota, Northern California, Northern Michigan, Northwest Texas, Northwestern
Pennsylvania, Ohio): DONE 2026-09-29 — 6 of 6, no blocks.** Northwest Texas, previously set aside
alongside Mississippi/Navajoland, turned out to genuinely fit the already-supported `monthly-recurring`
shape ("recurring days 1-31" per its own roster note) — included this batch rather than skipped;
Mississippi (week-numbered) and Navajoland (day-of-week) still don't fit any of the four cycleTypes and
remain set aside. **Two new reusable fetch workarounds found:** North Dakota's diocesan site returns
Cloudflare 403 to every direct fetch (including WebFetch) — worked around with the third-party reader
service `https://r.jina.ai/<url>`, which returns clean text without needing authentication or a real
browser (this means the raw PDF bytes were never obtained, so the file's own `notes` disclose that the
usual "render page images and visually cross-check" step could not be performed, with reasoning for why
the extraction is trusted anyway). Ohio's PDF, which the roster's own research tool had failed to fetch,
worked fine with a plain `curl` plus a standard user-agent string — worth trying before assuming a
"checker tool failed" note means the URL itself is dead. Full per-diocese detail:
`AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-29 "Diocese ingestion batch 10" entry.

**Batch 11 (Oklahoma, Olympia, Pennsylvania, Pittsburgh, Puerto Rico, Rhode Island): DONE 2026-09-29 —
6 of 6, no blocks.** Pennsylvania's source was an XLSX spreadsheet (not a PDF) — fetched directly and
parsed with `openpyxl`; turned out to be a genuine DAILY cycle (332 entries), with a stale prior-year
template block at the end of the sheet correctly identified and excluded (the roster's own note had
flagged this). Puerto Rico's source is a 30-page Spanish-language wall calendar, not a simple weekly
list — every subject transcribed in the source's own Spanish, never translated, per this corpus's
standing verbatim-preservation rule extended to language; its linearized PDF text extraction was found
to be actively corrupted (stray digits bleeding into date headers from an adjacent mini-calendar
graphic) and the file was re-transcribed entirely from rendered page images once that was caught.
Pittsburgh's PDF filename claimed September-December coverage but its own content said July-December —
confirmed from the content, not the filename. Full per-diocese detail:
`AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-29 "Diocese ingestion batch 11" entry.

**Batch 12 (San Diego, South Carolina, South Dakota, Southeast Florida, Southern Ohio): DONE 2026-09-29 —
5 of 6, Southern Virginia blocked.** South Dakota's source turned out to be a genuine DAILY cycle (328
entries, not weekly as the roster's own pre-fetch note assumed). Southeast Florida's source is the
diocese's own live Next.js web page (parsed from rendered HTML, not a PDF) and spans Sept 2026-Aug 2027,
split into two files per the established Delaware two-file-split precedent. San Diego's source had 11
entries with a verifiably wrong printed year (corrected per the established "verifiably wrong date" rule,
same class as Idaho). **Southern Virginia blocked**: SiteGround's own "Robot Challenge Screen" bot
protection defeated curl, WebFetch, AND the r.jina.ai reader-proxy workaround alike; no Drive mirror
exists for it. Full per-diocese detail: `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-29 "Diocese ingestion
batch 12" entry.

**Batch 13 (Southwest Florida, Springfield, Susquehanna, Tennessee, Texas, Upper South Carolina): DONE
2026-09-29 — 6 of 6, no blocks.** Southwest Florida's "quarterly repeating cycle" roster description
turned out ambiguous but resolvable: it's actually a genuine `dated` full-year file, just built from 14
subject groups each recurring on their own ~14-week rotation. Springfield's source is only published one
quarter at a time (92 daily entries, Jul-Sep 2026, same partial-year pattern as Missouri). **A real
app-level bug was found and fixed** while live-verifying Tennessee's own disclosed 2025 lead-in dates:
`getCachedCycleOfPrayerWeek` (`js/cycles-of-prayer.js`) could never resolve a lead-in date whose calendar
year differed from "today"'s, even when that date's entry was sitting in the already-loaded corpus for
the following year — a live, reachable bug (a user browsing to any past date hits this, not just "today"),
which also silently broke the already-shipped California and San Diego files' own 2025 lead-in dates the
same way. Fixed with a same-batch fallback lookup; retroactively verified California's and San Diego's
lead-in dates now resolve correctly too. Full per-diocese and bug-fix detail: `AUDIT_GOVERNANCE_LEDGER.md`'s
2026-09-29 "Diocese ingestion batch 13" entry.

**Batch 14 (Vermont, Virginia, Washington (DC), West Missouri, West Tennessee, West Texas): DONE
2026-09-29 — 6 of 6, no blocks.** West Missouri's roster-flagged "visitation schedule" was checked
directly and confirmed to be a genuine cycle of prayer (the diocese deliberately coincides its prayer
cycle with the bishop's visitations now) — only 8 entries exist since the diocese's page shows just a
rolling current+next-month window, not a stable full-year document. West Tennessee's source prints no
calendar dates at all; `date` values were computed from a verified 2026 liturgical calendar and disclosed
as computed. Vermont's, Washington's, and West Texas's own year-boundary lead-in dates were live-verified
to confirm batch 13's `getCachedCycleOfPrayerWeek` bug fix holds for new files generally, not just the
three it was originally written against. Full per-diocese detail: `AUDIT_GOVERNANCE_LEDGER.md`'s
2026-09-29 "Diocese ingestion batch 14" entry.

**Batch 15 (West Virginia, Western Kansas, Western Louisiana, Western New York, Western North Carolina,
Wisconsin, Wyoming, Europe): DONE 2026-09-30 — 8 of 8, no blocks. This closes out the roster
spreadsheet's ingestable dioceses.** Seven ordinary dioceses were dispatched first, exhausting the
roster's remaining state/regional dioceses. Western Louisiana confirmed the roster's own pre-flagged
day-of-month 1-31 recurring shape (built `monthly-recurring`, no year in the filename, per the Iowa
precedent). **While finalizing this batch's docs, `dioceseShort: 'europe'` was found sitting in
`TEC_DIOCESE_DIRECTORY` (added in an earlier session) with no corresponding file ever built** — the
Convocation of Episcopal Churches in Europe, a TEC jurisdiction with its own located, verified source
that no prior batch had actually picked up. Rather than ship a known gap, Europe was ingested as an
eighth diocese in this same batch (53 entries, Nov 2025-Nov 2026, `scope: "diocese"` since a convocation
plays the same local-cycle role here, not `scope: "communion"`). Full per-diocese detail:
`AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-30 "Diocese ingestion batch 15" entry.

**Roster status: FULLY DONE as of 2026-09-30 — zero exceptions remaining.** Every TEC diocese/
jurisdiction with a located, verified current cycle per Josh's own roster is now ingested into this
corpus. The two loose ends closed the same day: **Southern Virginia** (the one blocked link — Josh asked
to see it, was given the diosova.org URL and the reason it couldn't be fetched, a SiteGround bot-challenge
page, and supplied the source PDF directly; transcribed into two files, `episcopal-southern-virginia-2026
.json` + `-2027.json`, 26 entries each, split evenly across the source's own July 2026–June 2027 cycle).
**Mississippi and Navajoland** (the two shape-mismatched dioceses — Josh's own direct decision, on being
shown both links: "Accomodate them both, new schemas. For Mississippi, they will pray that all week."
Two more cycleTypes were added, the same kind of call that created `monthly-recurring`/`annual-recurring`/
`ordinal-sunday-monthly` earlier: `week-of-year-recurring` (Mississippi — 52 entries, one intention per
ISO week-of-year, no year) and `day-of-week-recurring` (Navajoland — 7 entries, one set of subjects per
weekday, repeating every week). Full detail: `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-30 "Two new
cycleTypes added" entry. Only the ~18 no-source-found jurisdictions remain outstanding (see
`tecDioceseRoster.noSourceFound` in schema.json) — those won't be addressed unless a source turns up.
Future work here is now purely periodic: a diocese whose source is only ever a rolling/partial window
(West Missouri, Springfield, and similar) will need periodic re-checking, and every diocese will need a
fresh file once it publishes its 2027 cycle.

**87 dioceses/jurisdictions with a located, verified current cycle per the roster (88 minus El Camino
Real, now historical) — all 87 are now ingested into this corpus, 0 remain** (separately, 18
dioceses/jurisdictions have no verified source at all per Josh's own research — see
`tecDioceseRoster.noSourceFound` in schema.json — those won't get ingested unless a source turns up).

**92 files currently in the corpus, all passing the validator:** 81 diocese-level, `cycleType: "dated"`
(78 dioceses; Delaware, Southeast Florida, and Southern Virginia each contribute 2 files, 2026+2027) —
Western Oregon, Alaska, Arizona, Albany, Alabama, Atlanta, California, Central Florida, Central Gulf
Coast, Central New York, Chicago, Connecticut, Delaware (2 files, 2026+2027), East Carolina, Easton,
Florida, Georgia, Great Lakes, Idaho, Indianapolis, Kansas, Kentucky, Lexington, Louisiana, Maine,
Maryland, Massachusetts, Michigan, Missouri, Montana, Nevada, New Hampshire, New York, North Carolina,
North Dakota, Northern California, Northern Michigan, Northwestern Pennsylvania, Ohio, Oklahoma, Olympia,
Pennsylvania, Pittsburgh, Puerto Rico, Rhode Island, San Diego, South Carolina, South Dakota, Southeast
Florida (2 files, 2026+2027), Southern Ohio, Southern Virginia (2 files, 2026+2027), Southwest Florida,
Springfield, Susquehanna, Tennessee, Texas, Upper South Carolina, Vermont, Virginia, Washington (DC),
West Missouri, West Tennessee, West Texas, West Virginia, Western Kansas, Western New York, Western
North Carolina, Wisconsin, Wyoming, Europe, Nebraska,
Newark, New Jersey, Rio Grande, San Joaquin, Southwestern
Virginia, Western Massachusetts, Colorado; 5 diocese-level, `cycleType:
"monthly-recurring"` — Arkansas, Northern Indiana, Iowa, Northwest Texas, Western Louisiana; 1
diocese-level, `cycleType: "annual-recurring"` — Long Island; 1 diocese-level, `cycleType:
"ordinal-sunday-monthly"` — Hawai'i (`episcopal-hawai-i.json`, dioceseShort `hawai-i` to match
`TEC_DIOCESE_DIRECTORY`); 1 diocese-level, `cycleType: "week-of-year-recurring"` — Mississippi; 1
diocese-level, `cycleType: "day-of-week-recurring"` — Navajoland — plus:
- `episcopal-western-oregon-st-bede.json` (St. Bede's own Congregational Cycle of Prayer — Josh's own
  parish, `scope: "parish"`, `"monthly-recurring"`, ingested 2026-09-29 from a Drive PDF Josh supplied).
  St. Bede's already separately appears as a diocese-level `"parish"` subject inside Western Oregon's
  own file (its week is 2026-04-12) — the two are not duplicates; see schema.json's own `rules` for why.
  **Still not wired into any UI or registry.** Surfacing a household's own "this is my family's day" the
  way the diocese tier surfaces "this is my parish's week" is a real, undecided product question (how
  would the app know which household is the user's?), not yet raised with Josh.
- `anglican-communion-2026.json` — see the Communion-tier paragraph above. **Wired in and live.**

**Profile diocese/parish picker overhauled 2026-09-29, per Josh's direct instruction, to cover the
full TEC roster rather than just the ~6 dioceses this app has cycle content for.** Previously the
diocese `<select>` only listed the handful of dioceses `CYCLES_OF_PRAYER_DIOCESES` had real files
for — a user in any of the other ~100 TEC dioceses simply couldn't declare one at all. Added
`TEC_DIOCESE_DIRECTORY` (`js/cycles-of-prayer.js`) — all 106 TEC dioceses/jurisdictions from Josh's own
roster (88 located + 18 no-verified-cycle) as it stood that day, name-only, independent of whether this
app has ingested that diocese's content — **now 105, since El Camino Real was removed entirely
2026-09-29 per Josh's direct instruction ("El Camino Real is historical only. Remove it.") — it merged
into the Diocese of California and is no longer a selectable profile option, not merely unfetched** —
and widened `isValidCycleOfPrayerDioceseKey` to validate against it instead of
the much shorter has-content list (which stays exactly as it was, still governing what actually gets
fetched/rendered). The diocese `<select>` in `index.html` is now populated at runtime from this
directory (`populateCycleOfPrayerDioceseSelect(s)`) rather than hand-listed in the markup, which would
have needed 106 hand-typed `<option>`s.

**Parish picker now has an "Other" fallback, per Josh's own spec: "a drop down box for that diocese if
we have a pair of cycle of prayer on file, otherwise 'other' and provide fill in the blank."** New
profile field `cycleOfPrayerParishOther` (mutually exclusive with `cycleOfPrayerParish` — setting one
always clears the other). `populateCycleOfPrayerParishSelect` now has three states: no diocese declared
("choose a diocese first"); diocese declared but this app has no ingested content for it (~100 of 106) —
skips straight to a disabled single-option "Other" select with the free-text field already visible,
never a permanent "Loading parishes..." for a fetch that will never happen; diocese has real content —
the actual parish list plus a trailing "Other (type below)" option, for a parish that diocese's own file
doesn't happen to list.

**Wired into BOTH the profile-defaults panel AND the one-time onboarding prompt, per Josh's direct
instruction** ("When they open their profile for the first time, it should ask them..."). The onboarding
prompt (`renderOnboardingPrompt`) now asks for diocese + parish, but ONLY when `traditionDefault ===
'anglican'` (this corpus is TEC-specific) — never shown for any other tradition. Both surfaces share the
exact same population functions (`populateCycleOfPrayerDioceseSelects`/`populateCycleOfPrayerParishSelect`,
looping over both surfaces' element ids) and the exact same setters
(`setUserProfileCycleOfPrayerDiocese`/`Parish`/`ParishOther`), so they can never drift into two different
diocese lists or disagree about state — saving on one surface immediately reflects on the other whenever
both happen to be mounted. The profile-defaults panel's own summary line now names the declared diocese
even when this app has no content for it yet (previously would have wrongly said "no diocese declared").

**Live-verified in headless Chromium:** onboarding diocese select has 107 options (106 + "Not
declared"); selecting Western Oregon (has content) populates 65 real parish options ending in "Other";
selecting St. Bede's and saving persists `episcopal/western-oregon` / `forest-grove-st-bede` correctly;
selecting Texas (no content) collapses the parish select to a single disabled "Other" option with the
text field already visible; typing a free-text name persists as `cycleOfPrayerParishOther` with `parish`
staying null; the profile-defaults panel, opened afterward, shows the identical state (diocese label,
disabled Other-only select, the typed text, and a summary line reading "diocese on file: Texas (parish:
St. Mark's, Anytown), but this app has no Cycle of Prayer content for it yet"); switching diocese in
either surface correctly clears both `cycleOfPrayerParish` and `cycleOfPrayerParishOther`; a non-Anglican
tradition's onboarding prompt correctly omits the diocese/parish fields entirely; zero console errors.
`index.html`'s `js/office-ui.js` cache-bust bumped to `?v=320`. Files touched: `js/cycles-of-prayer.js`,
`js/office-ui.js`, `index.html`.

Both new files were transcribed only after downloading the actual source PDF and reading its rendered
page layout rather than trusting Drive's own linearized text extraction, which interleaves multi-column
grids into one run-on line and silently misassigns entries to the wrong day/date if trusted as-is (see
schema.json's own `rules` for the concrete near-misses this caught in both files).

**LOCATED 2026-09-29: Josh's "TEC Cycle of Prayer" Drive folder actually holds ~24 raw files, not just
the roster spreadsheet** — the Communion-tier PDF and St. Bede's file above came from it, and so does
ready-to-transcribe (but NOT YET transcribed) source material for at least 15 more dioceses: New
Jersey, Newark, Western Massachusetts, Southwestern Virginia, Nebraska, Maine, Connecticut, Lexington,
Great Lakes, Atlanta, San Joaquin (tentative identification, not confirmed by an explicit diocese name
in the source — verify before ingesting), Central Gulf Coast, East Carolina, Kentucky, Rio Grande (two
files, a daily- and a weekly-cadence version of the same diocese — pick one, don't ingest both), Idaho,
and Northern Indiana. **83 of the 88 dioceses in the roster spreadsheet remain unresearched in the
older sense, but at least 15 of those 83 already have a source sitting unopened in this same Drive
folder** — whoever picks this up next should open the folder directly before re-researching any diocese
from scratch.

**Before searching for any of those 83 yourself, check the roster spreadsheet first — it already
pre-solves most of what you'd otherwise rediscover by hand.** Location and full per-diocese
breakdown: `data/cycles-of-prayer/schema.json`'s own `tecDioceseRoster` block (condensed) and
`AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-29 entry (complete detail) — not repeated here since this note
holds current status, not the research itself. In short: the roster already supplies a working
Drive-hosted fallback URL for ~20 dioceses whose own site blocks direct fetch (exactly the workaround
this corpus's own Arizona file needed, rediscovered by hand before this roster detail was read
closely); already flags 18 dioceses as having no verified source at all (don't re-search these from
scratch); flags 3 URLs across 2 dioceses as needing manual/login access Josh doesn't have; and already
flags several upcoming dioceses (Iowa, Long Island, Mississippi, Navajoland, Northern Indiana,
Northwest Texas, Western Louisiana) as standing/recurring cycles with no year — expect some of these
to need a genuinely new `cycleType` beyond `monthly-recurring` (Mississippi is week-numbered,
Navajoland is day-of-week — neither fits a day-of-month shape), and raise that to Josh rather than
forcing it in, the same way `monthly-recurring` itself got added for Arkansas.

Adding a diocese: transcribe directly from that diocese's own published document (never from memory),
check whether its source is actually date-anchored or a standing recurring cycle BEFORE picking a
`cycleType` (do not force one shape into the other), disclose anything ambiguous in the file's own
`notes`, run the validator, and add the registry/UI entries. Full per-diocese transcription detail
(what each one's source actually looked like, every disclosed
judgment call): `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-28 entry for this batch.


## D. Live UI bug queue and closed sanctoral work

**Live UI bug queue (the ad hoc "Task #N" reports Josh sends during sessions): nothing outstanding.**
Every numbered task through #15 is closed as of 2026-09-28 (naming consistency, mobile scroll,
others) — see `documentation/project-history/VOLUME-4-2026-09-07-to-09-28.md` and Volume 5 for
per-item evidence if a future report seems to contradict this. **Four more closed 2026-09-29, all
from live screenshots/reports, two of them in two rounds (Josh corrected the first fix's own
mechanism once it still wasn't quite right):**
- **Onboarding prompt trigger.** FINAL state: fires from exactly two places, both user-initiated,
  neither "before prayer" — `openUserProfilePanel()` (a first profile-button click, from either the
  per-office icon or the splash's "Your Profile" button) and `office-shell.js`'s `updateRailCurrent()`
  (the first time a reader scrolls to the very bottom of an office, Josh's own suggested trigger). It
  no longer auto-fires on page load OR right after a tradition is chosen — an intermediate same-day
  fix tried the latter, but Josh's own follow-up ("Not before prayer") ruled that out too.
- **Drop-cap line-wrap misalignment.** A floated `.component-text::first-letter` was causing a long
  paragraph's later lines to revert to a further-left, un-indented margin than the lines still
  wrapping beside the cap — fixed with a matched `padding-left`/negative-`margin-left` pair so every
  line's start position is governed by padding (which a float can never protrude past) rather than
  the float's own height. **Caveat for whoever picks this up next**: this session's sandbox cannot
  reach fonts.googleapis.com (confirmed via a console `ERR_CERT_AUTHORITY_INVALID`), so this could
  only be verified structurally (the padding/margin cancel out exactly by construction, proportionally,
  regardless of actual font metrics) plus a fallback-font screenshot showing no regression, not a real
  before/after against the app's actual fonts. Ask Josh to confirm live if this comes up again.
- **Cycle of Prayer sidebar entries.** The three tiers (Communion/Diocesan/Parish) render their own
  rubric headings (PR #90) but never got a matching sidebar ("The Order") entry, since
  `bcpEmitRubricHeading` never pushed to `env.blocks` — fixed by threading `env` through and pushing
  the same `{label, role, units:[]}` shape every other titled section already pushes.

Full per-fix detail for all four: `AUDIT_GOVERNANCE_LEDGER.md`'s 2026-09-29 entries.

**Sanctoral (EOR/OOR) work: fully closed as of 2026-09-28 — the 13-month Coptic gap sweep, the
18-entry coptic.io cross-check (17 confirmed, 1 disclosed exception — `saint-onesiphorus-of-the-
seventy`, Apr 3, no match found on coptic.io, kept on Wikipedia/St-Takla.org sourcing alone), the
15-question same-figure-different-day list (13 resolved, 2 needed and got Josh's direct call), the
duplicate-`id` audit (zero exact `(id, date)` collisions found; two genuine identity collisions fixed
by id-split), and the `mar-abraham`/`mar-abraham-of-qidun` id-collision cleanup.** Nothing open here;
full narrative in Volume 5 if a discrepancy is ever suspected.

