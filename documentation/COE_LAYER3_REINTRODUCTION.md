# COE Layer 3 — Cautious Reintroduction Pass
## Implementation Note

**Date:** 2026-03-06  
**Scope:** `js/office-ui.js` — `renderEastSyriac()` tail only  
**Files changed:** `js/office-ui.js`  
**Files unchanged:** `js/coe-eligibility.js`, `js/calendar-east-syriac.js`, all source data

---

## Was COE Layer 3 re-enabled?

**Yes.** Layer 3 individual saint display is now active in `renderEastSyriac()`.

---

## Exactly how it is gated

Two changes were made to `renderEastSyriac()`, and nothing else was touched.

**Change 1 — Cache warm-up (4 lines added before office HTML assembly):**

```javascript
// Warms SaintsResolver monthly cache before the office body is assembled.
// Required so that the Layer 3 saint lookup below runs against the cached
// data without triggering an async fetch inside the saint-display block.
await resolveCommemorations(currentDate, 'COE');
```

This mirrors the existing pattern in `renderBcpOffice` (warms `'ANG'`) and
`renderEthiopianSaatat` (warms `'OOR'`).

**Change 2 — Silenced tail replaced with gated Layer 3 block:**

The old silenced block:
```javascript
document.getElementById('saint-display').innerHTML = '';
document.getElementById('date-header').style.display = 'none';
const saintSection = document.querySelector('.saint-section');
if (saintSection) saintSection.style.display = 'none';
```

Replaced with:
```javascript
const coeRaw      = await resolveCommemorations(currentDate, 'COE');
const coeEligible = (typeof CoeEligibility !== 'undefined')
    ? CoeEligibility.filter(coeRaw)
    : [];

if (coeEligible.length > 0) {
    // show saint section — "Commemorated Holy Figures"
} else {
    // hide saint section — no fallback
}
```

`CoeEligibility.filter()` is the **sole eligibility gate**. It enforces the
explicit allowlist in `js/coe-eligibility.js`. A saint is displayed in
`renderEastSyriac()` if and only if its identity id appears in that allowlist.
The `typeof CoeEligibility` guard means the block degrades silently to empty if
the file fails to load, rather than throwing.

---

## Are the unresolved 5 excluded from visible output?

**Yes, automatically.** None of the 5 STILL_UNRESOLVED identities are in the
`CoeEligibility` allowlist:

| Identity | In allowlist | Will display |
|---|---|---|
| `saint-ignatius-of-antioch` | No | No |
| `saint-nicholas-of-myra` | No | No |
| `saint-abraham-of-carrhae` | No | No |
| `mar-augustine` | No | No |
| `mar-augustine-commemoration` | No | No |

No special-case code excludes them. The allowlist simply does not contain
them. No future edit to `office-ui.js` is required if they are later resolved —
only `coe-eligibility.js` needs to be updated.

---

## Was any Layer 2 / Layer 3 collision rule added?

**No collision rule was needed.** The two layers are structurally separate:

- **Layer 2** (`esyComms`) is derived from `getDayClass()` and rendered before
  the prayer sequence in the office body. It contains typed structural
  observances (`type: 'feast' | 'commemoration'`). These are never passed
  through `CoeEligibility`.
- **Layer 3** (`coeEligible`) is resolved from the saints cache and rendered in
  the `#saint-display` panel after the office body. It contains only individual
  saints that passed the eligibility filter.

The two outputs go to different DOM locations and have no shared data path.
A Layer 2 corporate commemoration on a date does not suppress Layer 3 display,
and a Layer 3 eligible saint does not elevate or replace Layer 2 framing. Both
may appear on the same date without conflict. This is the intended model:
Layer 2 is primary, Layer 3 is secondary and additive.

---

## Rendering behaviour

**When an eligible Layer 3 saint exists:**
- `.saint-section` is shown
- `#date-header` is shown with text `"Commemorated Holy Figures"` — secondary,
  non-assertive framing; no "Saint of the Day" language
- Each saint renders in a `saint-box` with a `COE` badge, name, and description
- No cross-tradition badge logic; the COE renderer shows only `COE`

**When no eligible Layer 3 saint exists (the common case for COE weekdays):**
- `.saint-section` is hidden
- `#date-header` is hidden
- `#saint-display` is emptied
- No fallback text, no intercession placeholder, no grid

---

## What still remains after this pass

| Item | Status |
|---|---|
| COE Layer 1 season engine | ✅ Complete |
| COE Layer 2 fixed / corporate commemorations | ✅ Complete (COE-IIA) |
| COE Layer 3 display | ✅ **Re-enabled this pass** |
| STILL_UNRESOLVED identities (5) | ❌ Pending external Hudra evidence |
| COE-IIC: Layer 2 expansion (Denha, Sleeba, etc.) | ❌ Deferred |

The 5 STILL_UNRESOLVED identities remain the only outstanding COE data question.
When they are resolved, update `coe-eligibility.js` only — no changes to
`office-ui.js` are required.

---

## Deployment

Replace in repo:
```
js/office-ui.js    (two edits to renderEastSyriac() — tail block only)
```

No other files changed. `js/coe-eligibility.js` and
`js/calendar-east-syriac.js` are deployed as-is from previous passes.

Suggested `structure.json` version bump: `2.8.8 → 2.8.9` with note:
> "COE Layer 3 sparse individual saint display re-enabled in renderEastSyriac()
> via CoeEligibility.filter() gate. Unresolved 5 excluded automatically by
> allowlist. No fallback; empty is liturgically correct."
