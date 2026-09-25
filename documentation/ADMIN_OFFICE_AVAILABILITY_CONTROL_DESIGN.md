# Admin Office/Tradition Availability Control — Design Note

**Status: proposed, not built.** Written 2026-09-25 for Josh's review before any code is touched,
per his own note in `RESUME_PROJECT_NOTE.md`: "TODO, next session — admin control panel for taking
offices offline... Not started; scope/design not yet discussed with Josh."

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
