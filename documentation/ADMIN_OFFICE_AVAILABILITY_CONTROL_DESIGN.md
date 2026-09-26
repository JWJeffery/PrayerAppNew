# Admin Office/Tradition Availability Control — Design Note

**Status: BUILT 2026-09-25, live-verified, per Josh's "proceed" after reviewing this note.**
Originally written for review before any code was touched, per his own note in
`RESUME_PROJECT_NOTE.md`: "TODO, next session — admin control panel for taking offices offline...
Not started; scope/design not yet discussed with Josh." Section 5 below records what was actually
built and how it was verified; sections 1-4 are the design as proposed and approved, unchanged.

**Scope confirmed with Josh:** whole traditions only (not individual offices within a tradition,
not individual pages). A JSON data file read by production code, edited through a new admin panel.

---

## 1. The problem this replaces

Today (2026-09-25), pausing a tradition from testers is a **manual, three-file, hand-edited
process** — done once already for the Byzantine Horologion pause:

1. `index.html` — the entry-card `<button>` gets `class="... is-disabled"`, `disabled`,
   `aria-disabled="true"` added by hand.
2. `index.html` — the matching `<option>` in the profile "Default tradition" dropdown gets
   `disabled` added by hand.
3. `js/office-ui.js` — `initializeEntryRouting()` gets a hand-written `if` block that clears a
   stale stored default for that one tradition key and falls through to the entry screen.

This works, but it's real, verified, and **easy to get wrong or forget a spot next time** (Josh's
own words). It also has no admin-facing UI at all — every toggle is a code change.

## 2. What's being proposed

Replace the three hard-coded edits with **one data file**, read by the same three call sites, plus
**one new admin panel** to edit that file.

### 2.1 The data file: `data/tradition-availability.json`

```json
{
  "schema_version": "1.0",
  "traditions": {
    "anglican":            { "available": true },
    "roman-catholic":       { "available": false, "reason": "Liturgy of the Hours is not implemented yet.", "permanent": true },
    "church-of-the-east":   { "available": true },
    "eastern-orthodox":     { "available": false, "reason": "Byzantine Horologion is paused for a content audit.", "since": "2026-09-25" },
    "oriental-orthodox":    { "available": true },
    "roman-breviary-dev":   { "available": true }
  }
}
```

- Keys match the existing `data-entry-tradition` / stored-default values already used throughout
  `index.html` and `js/office-ui.js` — no renaming of anything live.
- `reason` is shown as the entry card's subtitle text when `available: false` (exactly the pattern
  already used for both Catholic and the Horologion pause today).
- `permanent: true` marks a tradition that isn't paused, but simply doesn't exist yet (Catholic) —
  kept in the same file for one single source of truth, but excluded from anything the admin panel
  presents as a "click to restore" toggle (restoring Catholic isn't a click, it's building it).
- `since` is informational only (shown in the admin panel), not read by production code.

### 2.2 Production code changes (the read side)

All three existing gates become **data-driven instead of hand-written**, same behavior, same three
surfaces — nothing new is gated that isn't gated today:

1. **Entry cards** (`index.html`): on load, a small script reads `tradition-availability.json` and
   applies `is-disabled`/`disabled`/`aria-disabled` (or removes them) to each
   `[data-entry-tradition]` / `[data-entry-coe-step]` card based on its `available` flag, and sets
   the subtitle `<small>` text from `reason` when unavailable. Replaces today's hard-coded
   `is-disabled` classes on the Catholic and Eastern Orthodoxy buttons.
2. **Profile dropdown** (`index.html`): same fetch, same loop, sets/clears `disabled` on the
   matching `<option>` and appends `— {reason}` to its label when unavailable.
3. **`initializeEntryRouting()`** (`js/office-ui.js`): the current single hard-coded `if
   (storedDefault === 'eastern-orthodox')` block becomes a lookup — if
   `!availability[storedDefault].available`, clear the stored default and fall through to the
   entry screen, for **any** tradition marked unavailable, not just Horologion. This is the one
   genuinely new piece of production logic (small, and it directly generalizes work already
   written and live-verified once this session).

Fetched once at load (same pattern the admin dashboard already uses for `project_roadmap.json` —
fetch, graceful fallback to "everything available" if the file is missing or malformed, never
crash the entry screen).

### 2.3 Admin panel (the write side)

A new panel in `admin/admin.html` (which is already the established pattern for this kind of
control surface — see `admin/readme.md`: JSON-driven panels, fetched client-side, no build step).

- One row per tradition key in the JSON, each with a toggle switch and its current `reason`/`since`
  shown inline.
- Toggling flips `available` in an in-memory copy of the JSON and re-renders the row (immediate
  visual feedback in the admin page itself).
- **No backend exists in this app, and building one is out of scope for this note** (that would be
  new infrastructure, not this feature). So a toggle in the admin page **cannot, by itself, change
  what testers see** — there is nothing for it to write to. The panel's actual output is a
  **"Copy updated JSON" button**: it serializes the current in-memory state back to the exact
  `tradition-availability.json` shape, and Josh pastes that over the real file and commits it (or
  hands it to me to commit) the same way every other content/data change in this app already
  reaches testers — through the existing web-release build and deploy step.
- This means "one click" becomes: **one click in the admin panel, then the same
  save-commit-redeploy step every other change in this app already requires.** That's a real,
  meaningful improvement over today (one file to edit instead of three, a UI instead of hand-edited
  HTML, impossible to forget a spot since all three surfaces read the same file) — but it is not
  instant, live, no-redeploy toggling for testers already using the app, because this app has no
  server to push that to. Flagging this explicitly so it isn't assumed to be more than it is.

## 3. Migration plan

1. Build the JSON file, seeded with today's real state (Catholic permanently unavailable,
   Eastern Orthodoxy paused, everything else available) — this is a **content-neutral snapshot** of
   what's already true in production, not a new decision.
2. Wire the three read sites to the JSON, **remove** the three hand-written gates they replace.
3. Live-verify (headless Chromium, same method used for the original Horologion unwire) that
   behavior is byte-for-byte identical to today: Catholic still shows disabled with its exact
   subtitle, Eastern Orthodoxy still shows disabled with its exact subtitle and reason, the
   returning-tester-with-stale-stored-default case still correctly falls through to the entry
   screen, and every *available* tradition is completely unaffected.
4. Build the admin panel (read + toggle + copy-JSON) last, once the read side is proven correct
   independently of it.
5. Document in `AUDIT_GOVERNANCE_LEDGER.md`/`RESUME_PROJECT_NOTE.md`/`audit-ledger.html` per the
   usual pattern, fold into the next web-release redeploy per Josh's instruction.

## 4. What this note is explicitly NOT proposing

- Not per-office granularity (Vespers vs. Orthros within Byzantine) — scoped out by Josh.
- Not a live backend/API for instant toggling without a redeploy — no such infrastructure exists
  today; building one is a much larger, separate decision.
- Not a change to *which* traditions are currently available — this is a mechanical refactor of
  *how* that state is expressed and edited, seeded from today's real state.

## 5. What was actually built, 2026-09-25

Built exactly per the plan above, migration steps 1-4. Key names corrected from this note's
original draft to match the codebase's real, already-live tradition keys (confirmed by reading
`resolveEntryTraditionRoute()` in `js/office-ui.js` and the profile dropdown's existing `option`
values, not assumed): `latin-catholic`, not `roman-catholic`.

**`data/tradition-availability.json`** — seeded with today's real, committed state: `anglican`,
`church-of-the-east`, `oriental-orthodox` available; `eastern-orthodox` paused (same reason/date as
the existing manual gate); `latin-catholic` unavailable and `permanent: true`.

**`index.html`** — every card this system manages (`anglican`, the Church of the East step-in card
plus both its ACOE/Ancient sub-cards, `oriental-orthodox`, `eastern-orthodox`, `latin-catholic`) got
a `data-entry-tradition` key (the three previously-ungated ones already had it; `eastern-orthodox`
and `latin-catholic` did not, since neither ever needed to route anywhere while hard-disabled) plus
a `data-available-subtitle` attribute holding the exact text to restore if the admin later marks it
available again -- for `eastern-orthodox` this is `"Byzantine Horologion offices."`, recovered from
`git show` of the original pre-pause commit rather than guessed. The five profile-dropdown
`<option>`s got matching `data-available-label` attributes. The static `disabled`/`is-disabled`/
`aria-disabled` markup on the `eastern-orthodox` and `latin-catholic` cards, and the `disabled`
attribute on their two dropdown options, was deliberately **kept as-is** -- see the fail-safe note
below.

**`js/office-ui.js`** — added `loadTraditionAvailability()` (fetches the JSON with a 1.5s timeout,
returns `null` on any failure), `applyTraditionAvailabilityToDOM()` (walks every
`[data-entry-tradition]` card and the profile dropdown, syncing disabled state and subtitle/label
text to the fetched data -- a no-op if the fetch failed), and `isTraditionAvailable()`.
`initializeEntryRouting()` is now `async`: it `await`s the fetch before doing anything else, safe
because the entry/mode screens are already hidden-by-default until this function decides which one
to show (the same pattern that already guards against a different flash-of-wrong-state bug Josh
caught 2026-09-22). The old single hard-coded `if (storedDefault === 'eastern-orthodox')` guard is
now a generic check against the fetched availability map for *any* stored default.

**Fail-safe, explicitly kept:** if `data/tradition-availability.json` can't be fetched (bad deploy,
offline load, a timeout), `applyTraditionAvailabilityToDOM()` does nothing and the entry
cards/dropdown simply keep whatever `index.html` shipped with -- which is always today's real state,
since the HTML markup itself was never changed to "available" for the two currently-paused
traditions. Separately, `isTraditionAvailable()` falls back to a small hard-coded
`TRADITION_AVAILABILITY_FETCH_FAILURE_FALLBACK` set (currently just `eastern-orthodox`) for the
stale-stored-default routing guard specifically, so a returning tester with Horologion saved as
their default still can't skip straight into it even if the JSON is completely unreachable. This
means the system can only ever fail toward *more* traditions staying gated than the JSON says, never
fewer -- it cannot accidentally leak a paused tradition to testers through a fetch failure.

**Admin panel** (`admin/admin.html`, new "Tradition Availability" panel, `.ta-*` CSS, sourced from
`../data/tradition-availability.json`) — one row per tradition with a status badge, its reason (if
paused), and a Pause/Restore button; pausing prompts for a reason and stamps today's date;
permanently-unavailable traditions (`latin-catholic`) show a disabled button, not a toggle. Below
the rows, a live-updating read-only textarea holds the exact JSON to paste back into the real file,
with a "Copy updated JSON" button and explicit on-panel text that toggling here has no effect on
testers until that JSON is committed and redeployed -- so the panel can't be mistaken for a live
switch.

**Verified live, headless Chromium**, mirroring the original manual Horologion-unwire's own
verification method: (1) fresh load — `eastern-orthodox` and `latin-catholic` cards/dropdown options
disabled with their correct reason text, `anglican` unaffected, zero console errors; (2) a returning
tester with a stale `eastern-orthodox` stored default — cleared correctly, entry screen shown,
`office-active` stays false; (3) a returning tester with a valid `anglican` stored default —
correctly *not* cleared, routes straight in as before; (4) the JSON fetch forced to fail
(`page.route(...).abort()`) — the stale `eastern-orthodox` default is *still* cleared via the
hard-coded fallback, proving the fail-safe actually works and not just in theory; (5) the admin
panel — loads and renders all five rows correctly, pausing Anglican via the toggle (auto-accepting
the native reason prompt) updates the row and produces valid, correctly-shaped JSON in the textarea,
restoring it reverts the row, and the permanent Latin Catholic row's button is confirmed disabled.

Cache-bust `js/office-ui.js v314 -> v315`. `data/tradition-availability.json` and `admin/admin.html`
carry no cache-bust param in this codebase's existing convention (data files and the admin tool
aren't versioned that way elsewhere either).
