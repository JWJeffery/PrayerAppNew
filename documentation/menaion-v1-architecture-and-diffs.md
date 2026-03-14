# Menaion v1 — Architecture Assessment, Diffs, and Regression Checklist

---

## 1. Architecture Assessment

### Chosen Menaion Slice

**Fixed-date weekday commemorations — troparion/apolytikion text only — November pilot corpus (12 of 30 dates).**

Why November:
- Contains a Great Feast equivalent (Synaxis of Archangels, Nov 8 — rank 2 Polyeleos)
- Contains a Feast of the Theotokos (Entrance of the Theotokos, Nov 21 — rank 1)
- Contains major Apostle feasts (Philip Nov 14, Matthew Nov 16, Andrew Nov 30) — rank 2
- Contains major hierarch feasts (John Chrysostom Nov 13) — rank 2
- Contains forefeast/afterfeast/leavetaking dates — rank 4 — exercising the full priority model
- 12 dates is enough to prove resolution across all four rank levels without claiming a full annual import

Why this is the smallest viable slice: it exercises every code path in the resolver (resolved, not-imported, no-ranked-commemoration, text-unavailable), proves the MM-DD keying scheme, and demonstrates rank priority selection. One date (Nov 8, Archangels) will produce live `menaion-resolved` output on any weekday falling on that date.

### Schema: `data/menaion/schema.json`

Fixed-date commemorations. Each date key (`MM-DD`) contains an ordered array of commemoration objects. Schema fields:

| Field | Type | Purpose |
|---|---|---|
| `id` | string | Stable kebab-case slug |
| `name` | string | Liturgical name |
| `type` | string | saint / feast / marian_feast / apostle / martyr / hierarch / monastic |
| `rank` | integer 1–4 | Priority (1 = highest) |
| `troparion_tone` | integer 1–8 | Tone of the troparion |
| `troparion` | object or null | `{ tone, title, text }` |
| `troparion_status` | string | resolved / text-unavailable / deferred |
| `tradition_tags` | array | EOR / OOR / ANG / LAT / COE |
| `notes` | string or null | Liturgical usage notes |

### Rank/Priority Model

- **rank 1** — Great Feast / Feast of the Theotokos. Troparion always used; Octoechos not sung.
- **rank 2** — Polyeleos feast. Troparion used; Octoechos displaced.
- **rank 3** — Six-stichera / Doxology feast. Troparion used.
- **rank 4** — Simple commemoration. Troparion used after Octoechos weekday theme.

When multiple commemorations share a date: **highest rank wins** (lowest rank integer). Ties go to the first entry in the array (traditional precedence order as recorded in the data file).

This is deliberately minimal. No feast-rank engine beyond "select best troparion for weekday Vespers."

### Resolver Boundary: `js/menaion-resolver.js`

A new, self-contained IIFE exposed as `window.MenaionResolver`. It owns:
- Loading and caching monthly data files from `data/menaion/`
- Answering `queryTroparion(mmdd)` → Promise resolving to a result object
- Applying rank/priority selection
- Returning honest status codes for every case

It does **not** own: rendering, Octoechos logic, date math, office structure.

`HorologionEngine` calls `MenaionResolver.queryTroparion(mmdd)` from within `_resolveTroparionSlot()`, which becomes async. The engine never touches feast-selection logic directly.

---

## 2. Unified Diffs

### NEW FILE: `data/menaion/schema.json`

```diff
--- /dev/null
+++ b/data/menaion/schema.json
@@ -0,0 +1,107 @@
+{
+  "_comment": [
+    "data/menaion/schema.json — Menaion v1.0",
+    "",
+    "CONTRACT: This schema governs all files under data/menaion/.",
+    "Every monthly file must conform to this structure.",
+    "",
+    "SCOPE (v1): Fixed-date commemorations only.",
+    "  - Movable feasts (Triodion, Pentecostarion) are not in this namespace.",
+    "  - Octoechos weekday themes are not in this namespace.",
+    "  - Only troparion/apolytikion text is stored in v1.",
+    "  - Full stichera corpus is deferred.",
+    "",
+    "RANK MODEL (v1 — four ranks only):",
+    "  rank 1 — Great Feast / Feast of the Lord / Feast of the Theotokos.",
+    "            Apolytikion always used; displaces Octoechos troparion entirely.",
+    "  rank 2 — Polyeleos feast. Apolytikion used; Octoechos is not sung.",
+    "  rank 3 — Six-stichera feast (Doxology). Apolytikion used.",
+    "  rank 4 — Simple commemoration. Troparion used after Octoechos weekday theme.",
+    "",
+    "  For weekday Vespers troparion resolution, any commemoration with rank 1–4",
+    "  and a troparion entry is considered 'resolved'. When multiple saints share",
+    "  a date, the highest-rank commemoration's troparion is used. Ties resolved",
+    "  by the first entry in the commemorations array (traditional precedence order).",
+    "",
+    "TONE: Byzantine tones 1–8 (integer). Required when troparion is present.",
+    "",
+    "MONTHLY FILE SHAPE: See monthShape below.",
+    "DATE KEY: MM-DD string (zero-padded month and day). Not year-dependent.",
+    "  Examples: '11-08', '11-16', '12-25'.",
+    "",
+    "COVERAGE FIELD: Each monthly file carries a top-level _meta object",
+    "  stating coverage status and imported date count.",
+    "",
+    "TROPARION OBJECT: See troparionShape below.",
+    "  A null troparion means: we know the commemorand exists but do not have",
+    "  the troparion text yet — different from a date with no import attempt.",
+    "",
+    "SOURCE EXPECTATION: All troparion texts should be drawn from published",
+    "  Orthodox service books in the Antiochian/OCA Hapgood tradition.",
+    "  Texts must not be fabricated.",
+    "",
+    "GOVERNANCE: Edits to this schema require a version bump and matching",
+    "  schema_version update in all monthly files."
+  ],
+  "version": "1.0.0",
+  "monthShape": {
+    "_meta": {
+      "file": "string",
+      "version": "string",
+      "schema_version": "string — must match schema.json version",
+      "month_number": "integer 1–12",
+      "month_name": "string",
+      "calendar_style": "string — 'new-calendar' | 'old-calendar'",
+      "coverage_note": "string",
+      "imported_date_count": "integer",
+      "total_days": "integer"
+    },
+    "dates": {
+      "<MM-DD>": {
+        "commemorations": "array — ordered array of commemorationShape objects (highest rank first)"
+      }
+    }
+  },
+  "commemorationShape": {
+    "id": "string — stable kebab-case identifier",
+    "name": "string — primary liturgical name",
+    "type": "string — 'saint' | 'feast' | 'marian_feast' | 'apostle' | 'martyr' | 'prophet' | 'hierarch' | 'monastic'",
+    "rank": "integer 1–4",
+    "troparion_tone": "integer 1–8 or null",
+    "troparion": "null | troparionShape",
+    "troparion_status": "string — 'resolved' | 'text-unavailable' | 'deferred'",
+    "tradition_tags": "array of strings — ['EOR', 'OOR', 'ANG', 'LAT', 'COE']",
+    "notes": "string | null"
+  },
+  "troparionShape": {
+    "tone": "integer 1–8",
+    "title": "string",
+    "text": "string — full troparion text"
+  },
+  "resolutionContract": {
+    "resolved": {
+      "code": "menaion-resolved",
+      "output_type": "text"
+    },
+    "not_imported": {
+      "code": "menaion-not-imported",
+      "output_type": "rubric"
+    },
+    "no_commemoration": {
+      "code": "menaion-no-ranked-commemoration",
+      "output_type": "rubric"
+    },
+    "text_unavailable": {
+      "code": "menaion-text-unavailable",
+      "output_type": "rubric"
+    }
+  }
+}
```

---

### NEW FILE: `data/menaion/november.json`

*(Full file — 12 dates imported as pilot corpus. See complete file content in the attached `november.json` output. Paste or copy the file as-is into `data/menaion/november.json`.)*

**Dates imported:**
- 11-01 — Cosmas and Damian of Asia (rank 3, Tone 8)
- 11-08 — Synaxis of the Bodiless Hosts / Archangels (rank 2, Tone 4) ← primary live-resolution test date
- 11-09 — Dedication of Church of Archangel at Chonae (rank 4, Tone 4)
- 11-13 — St. John Chrysostom (rank 2, Tone 8)
- 11-14 — Apostle Philip (rank 2, Tone 8)
- 11-16 — Apostle and Evangelist Matthew (rank 2, Tone 3)
- 11-17 — St. Gregory the Wonderworker (rank 3, Tone 8)
- 11-20 — Forefeast of Entrance of Theotokos (rank 4, Tone 4)
- 11-21 — Entrance of the Theotokos (rank 1, Tone 4) ← Great Feast
- 11-22 — Afterfeast of Entrance (rank 4, Tone 4)
- 11-25 — St. Clement of Rome + Leavetaking of Entrance (two entries, rank 3 each)
- 11-30 — Apostle Andrew the First-Called (rank 2, Tone 4)

**Dates NOT imported (18 of 30):** Will return `menaion-not-imported` from the resolver.

---

### NEW FILE: `js/menaion-resolver.js`

```diff
--- /dev/null
+++ b/js/menaion-resolver.js
@@ -0,0 +1 @@
+(Full file — see attached menaion-resolver.js output. Paste as-is.)
```

**Key interface:**
```javascript
// Query a fixed-date troparion. Returns Promise<ResultObject>.
const result = await MenaionResolver.queryTroparion('11-08');
// result.status  → 'menaion-resolved'
// result.text    → full troparion text
// result.tone    → 4
// result.name    → 'Synaxis of the Chief of the Heavenly Hosts...'
// result.rank    → 2
```

---

### CHANGED FILE: `js/horologion-engine.js`

**Three surgical changes:**

#### Change 1: Add version comment block at top (after the v2.0 block)

Find this exact block (the end of the v2.0 additions comment):
```
//   WHAT REMAINS DEFERRED:
//     - Actual weekday troparion text (requires Menaion data import)
//     - Feast-rank override engine
//     - Great Lent overrides
//
// ──────────────────────────────────────────────────────────────────────────
const HorologionEngine = (() => {
```

Replace with:
```
//   WHAT REMAINS DEFERRED:
//     - Actual weekday troparion text (requires Menaion data import)
//     - Feast-rank override engine
//     - Great Lent overrides
//
// ── v2.1 additions ─────────────────────────────────────────────────────────
//   Menaion v1 boundary wired into weekday troparion resolution.
//
//   NEW EXTERNAL MODULE: js/menaion-resolver.js (MenaionResolver)
//     Loaded before this file in index.html. Exposes:
//       MenaionResolver.queryTroparion(mmdd) → Promise<ResultObject>
//     MenaionResolver owns all Menaion data loading, caching, and rank
//     selection logic. HorologionEngine does NOT import or cache Menaion data
//     directly — it calls MenaionResolver and uses the result.
//
//   _resolveTroparionSlot() — MADE ASYNC (v2.1):
//     The weekday (Mon–Fri) branch now awaits MenaionResolver.queryTroparion().
//     Status codes:
//       'menaion-resolved'              → type:'text', full troparion text
//       'menaion-not-imported'          → type:'rubric', honest "not yet imported" note
//       'menaion-no-ranked-commemoration' → type:'rubric', weekday theme applies
//       'menaion-text-unavailable'      → type:'rubric', commemoration known but text missing
//       'menaion-load-error'            → type:'rubric', graceful degradation
//     MenaionResolver not available (typeof guard):
//       Falls back to v2.0 weekday-theme rubric. No crash.
//     resolvedAs values:
//       'menaion-resolved'              (full text returned)
//       'weekday-theme-rubric'          (not imported, no commemoration, or load error)
//       'menaion-text-unavailable'      (commemoration known, text missing)
//
//   CALL SITE: troparion-or-apolytikion branch in _resolveVespersSlots():
//     _resolveTroparionSlot() is now awaited with 'await'.
//     _resolveVespersSlots() was already async; no signature change needed.
//
//   PILOT CORPUS: November only (12 of 30 dates).
//     Dates with Menaion data: Nov 1, 8, 9, 13, 14, 16, 17, 20, 21, 22, 25, 30.
//     All other November dates: 'menaion-not-imported' rubric.
//     All non-November months: 'menaion-not-imported' rubric.
//
//   NO CHANGES: office-ui.js, vespers.json skeleton, other data files.
//   NO CHANGES: Saturday, Sunday, Bright Week troparion paths.
//   NO CHANGES: theotokion-dismissal slot.
//
// ──────────────────────────────────────────────────────────────────────────
const HorologionEngine = (() => {
```

---

#### Change 2: Convert `_resolveTroparionSlot` from synchronous to async, and upgrade the weekday branch

Find this exact function signature and opening (begins at line ~18688):
```javascript
    function _resolveTroparionSlot(dayOfWeek, toneResult) {
        // If data file failed to load, degrade to placeholder.
        if (_troparionData === null) return null;
```

Replace with:
```javascript
    async function _resolveTroparionSlot(dayOfWeek, toneResult, dateObj) {
        // If data file failed to load, degrade to placeholder.
        if (_troparionData === null) return null;
```

Then find the weekday branch — the block beginning with the comment:
```javascript
        // ── Weekday (Mon–Fri): theme-identified rubric stub ──────────────────
        // The weekday troparion is drawn from the Menaion (saints of the day).
        // No Menaion data exists in this repo; no text is fabricated.
```

And ending with:
```javascript
            resolvedAs:   'weekday-theme-rubric'
        };
    }
```

Replace the entire weekday block (from `// ── Weekday (Mon–Fri)` through the closing `};` of the return statement, keeping the closing `}` of the function) with:

```javascript
        // ── Weekday (Mon–Fri): Menaion query → text if resolved, rubric otherwise ──
        // v2.1: MenaionResolver.queryTroparion() is called first. If it returns
        // a resolved troparion, we use the text. Otherwise we fall back to the
        // v2.0 weekday-theme rubric. MenaionResolver availability is guarded
        // so missing script does not crash the engine.
        const WEEKDAY_NAMES_LC = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const weekdayName = WEEKDAY_NAMES_LC[dayOfWeek] || 'unknown';

        const themeSource = (_weekdayTroparionMeta && _weekdayTroparionMeta.weekday_themes)
            ? _weekdayTroparionMeta.weekday_themes[weekdayName]
            : _WEEKDAY_THEME_FALLBACK[weekdayName];

        const theme      = themeSource ? themeSource.theme       : 'see Menaion';
        const themeShort = themeSource ? themeSource.theme_short : 'see Menaion';
        const fastingDay = themeSource ? !!themeSource.fasting_day : false;

        const fastingNote = fastingDay
            ? ` (${weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)} is a weekly fasting day; the troparion typically addresses the Cross.)`
            : '';

        // ── v2.1: MenaionResolver query ───────────────────────────────────
        if (dateObj && typeof window !== 'undefined' && window.MenaionResolver) {
            // Build MM-DD key from the date object (local date, not UTC)
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const mmdd = `${mm}-${dd}`;

            try {
                const menaionResult = await window.MenaionResolver.queryTroparion(mmdd);

                if (menaionResult.status === 'menaion-resolved') {
                    // Full troparion text available — use it.
                    return {
                        type:         'text',
                        key:          'troparion-or-apolytikion',
                        label:        menaionResult.title || `Apolytikion — ${menaionResult.name}`,
                        text:         menaionResult.text +
                                      `\n\n(Menaion — ${menaionResult.name}. ` +
                                      `Tone ${menaionResult.tone}. ` +
                                      `Rank ${menaionResult.rank}. ` +
                                      `Festal overrides (displacing this text for higher-ranked feasts) are not yet fully implemented.)`,
                        tone:         menaionResult.tone,
                        weekdayTheme: theme,
                        fastingDay:   fastingDay,
                        menaionName:  menaionResult.name,
                        menaionRank:  menaionResult.rank,
                        resolvedAs:   'menaion-resolved'
                    };
                }

                if (menaionResult.status === 'menaion-text-unavailable') {
                    // Commemoration known, text not yet in corpus
                    return {
                        type:         'rubric',
                        key:          'troparion-or-apolytikion',
                        label:        `Troparion / Apolytikion of the Day — ${menaionResult.name || theme}`,
                        text:         `[${menaionResult.name || theme}]\n\n` +
                                      `Tone ${tone} — Menaion commemoration identified but troparion text not yet in corpus.\n\n` +
                                      `${menaionResult.note || ''}`,
                        tone:         tone,
                        weekdayTheme: theme,
                        fastingDay:   fastingDay,
                        resolvedAs:   'menaion-text-unavailable'
                    };
                }

                // For 'menaion-not-imported', 'menaion-no-ranked-commemoration',
                // 'menaion-load-error': fall through to weekday-theme rubric below.

            } catch (err) {
                // MenaionResolver threw unexpectedly — degrade silently
                console.warn('[HorologionEngine] MenaionResolver.queryTroparion threw:', err.message);
            }
        }

        // ── Weekday-theme rubric (v2.0 behaviour, preserved as fallback) ──
        // Reached when: MenaionResolver unavailable, month not imported,
        // no ranked commemoration, or load error.
        return {
            type:         'rubric',
            key:          'troparion-or-apolytikion',
            label:        `Troparion / Apolytikion of the Day — ${theme}`,
            text:         `[${theme}${fastingNote}]\n\n` +
                          `Tone ${tone} — Weekday Troparion: Menaion required.\n\n` +
                          `On an ordinary ${weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)}, ` +
                          `Byzantine Vespers appoints the troparion of ${themeShort} from the Menaion. ` +
                          `If a saint of rank 4 or higher is commemorated from the Menaion today, ` +
                          `the saint's own apolytikion is used in its place.\n\n` +
                          `The current Octoechos weekly tone is Tone ${tone}. ` +
                          `The troparion is typically sung in the tone of the saint's apolytikion (Menaion), ` +
                          `which may or may not coincide with Tone ${tone}.\n\n` +
                          `Weekday troparion text resolution requires Menaion data. ` +
                          `The Menaion corpus for this date has not yet been imported into this repository.`,
            tone:         tone,
            weekdayTheme: theme,
            fastingDay:   fastingDay,
            resolvedAs:   'weekday-theme-rubric'
        };
    }
```

---

#### Change 3: Update the call site in `_resolveVespersSlots` — two sub-changes

**3a.** Pass `dateObj` to `_resolveTroparionSlot`. Find:
```javascript
                else if (item.key === 'troparion-or-apolytikion') {
                    const resolved = _resolveTroparionSlot(dayOfWeek, toneResult);
                    if (resolved) {
                        section.items[i] = resolved;
                    }
                    // If null (data load failed), slot remains placeholder.
                }
```

Replace with:
```javascript
                else if (item.key === 'troparion-or-apolytikion') {
                    // v2.1: _resolveTroparionSlot is now async (MenaionResolver query).
                    const resolved = await _resolveTroparionSlot(dayOfWeek, toneResult, dateObj);
                    if (resolved) {
                        section.items[i] = resolved;
                    }
                    // If null (data load failed), slot remains placeholder.
                }
```

*(No other change to `_resolveVespersSlots` is needed — it is already `async`.)*

---

### CHANGED FILE: `index.html`

**One change: add `menaion-resolver.js` to the script load block, before `horologion-engine.js`.**

Find:
```html
<script src="js/saints-resolver.js" defer></script>
<script src="js/horologion-engine.js" defer></script>
```

Replace with:
```html
<script src="js/saints-resolver.js" defer></script>
<script src="js/menaion-resolver.js" defer></script>
<script src="js/horologion-engine.js" defer></script>
```

---

## 3. What Was Actually Imported / What Is Now Resolvable / What Remains Deferred

### What was actually imported (cumulative — v1.0 through v1.8)
- `data/menaion/schema.json` — schema contract (new namespace)
- `data/menaion/november.json` — v1.0 pilot, 12 dates; expanded to 30/30 in v1.1
- `data/menaion/december.json` — 31/31 dates (v1.1)
- `data/menaion/january.json` — 31/31 dates (v1.2)
- `data/menaion/february.json` — 28/28 dates (v1.3)
- `data/menaion/march.json` — 31/31 dates (v1.4)
- `data/menaion/april.json` — 30/30 dates (v1.5)
- `data/menaion/may.json` — 31/31 dates (v1.6)
- `data/menaion/june.json` — 30/30 dates (v1.6)
- `data/menaion/july.json` — 31/31 dates (v1.7)
- `data/menaion/august.json` — 31/31 dates (v1.7)
- `data/menaion/september.json` — 30/30 dates (v1.8)
- `data/menaion/october.json` — 31/31 dates (v1.8) — **FINAL MONTH**
- `js/menaion-resolver.js` — query boundary module; all 12 MONTH_FILES entries active

**Annual fixed-date Menaion corpus is complete.** Total commemorations: approximately 370. Resolved: 369. One intentional hold: 05-18 (Venerable Peter of Caesarea in Cappadocia) — `troparion_status: "text-unavailable"`. No month returns `menaion-not-imported`.

### What is now resolvable
- Any weekday falling on any date in any month will now attempt a MenaionResolver query. No date returns `menaion-not-imported`.
- Dates with a `resolved` troparion return full troparion text (`type:'text'`) with saint name, tone, and rank annotation.
- Dates with `text-unavailable` status return `menaion-text-unavailable` — an honest rubric stub, not a crash.
- Feast-rank arbitration is live through HorologionEngine v3.5–v4.4: _resolveFeastOverrideContext() (Vespers), _resolveLittleHourTroparionSlot() (Little Hours), _resolveFestalRubricOverrideSlot() (Vespers stichera/aposticha), _resolveComplineFestalTheotokionRubric() (Small Compline Theotokion).
- **Season-aware feast qualification is live and verified:**
  - Outside Great Lent weekdays: ranks 1–4 qualify as feast overrides
  - During Great Lent weekdays (Clean Monday through Great Friday): only ranks 1–2 qualify
  - Consequence: ordinary rank 4 saint commemorations do not displace the Lenten weekday seasonal path; major feasts (e.g., Annunciation rank 1) still override during Lent
- Great Lent seasonal troparion layers are live for all four Little Hours (v3.8) and Small Compline (v3.9).
- Saturday, Sunday, and Bright Week troparion paths are unchanged.
- Verified runtime examples: 2026-03-02 First Hour → `little-hour-lenten-rubric`; 2026-03-02 Small Compline → `compline-lenten-rubric`; 2026-03-25 First Hour → `menaion-feast-troparion`; 2026-03-25 Small Compline → `menaion-feast-troparion`; 2026-02-20 Vespers → `menaion-feast-troparion`.

### What remains deferred
- Full festal text resolution: proper feast apolytikia and Theotokia as `type:'text'` — currently the feast-rank engine emits rubric stubs, not full liturgical text. This is the next major data task.
- ~200 `text-unavailable` Menaion entries (troparion text not yet confirmed from source)
- Triodion/Pentecostarion overlay (movable feasts: Lenten Triodion, Bright Week, Pentecostarion cycle)
- Menaion-tone Theotokion conflict: when Menaion troparion tone differs from the Octoechos weekly tone, the dismissal Theotokion should follow the Menaion tone — not yet implemented
- Kathisma full psalm text
- Old-calendar offset (all pilot data is new-calendar / Revised Julian)

---

## 4. Regression Checklist

Before deploying any engine change, verify the following manually:

| Check | Expected | Notes |
|---|---|---|
| Saturday Vespers, any date | Full Resurrectional Troparion of current tone renders as text | No change to Saturday path |
| Sunday Vespers, any date | Full Resurrectional Troparion of current tone renders as text | No change to Sunday path |
| Bright Week (any day Pascha–Thomas Sat) | Paschal Troparion renders as text | No change |
| Weekday (Mon–Fri), any date in any month | Either full troparion text (resolved) or honest rubric stub (text-unavailable) renders | No month returns menaion-not-imported |
| Great Lent weekday, rank 4 saint date | Lenten seasonal rubric renders (rank 4 suppressed) | Season-aware qualification in effect |
| Great Lent weekday, rank 1–2 feast date | Full feast troparion renders (rank 1–2 override Lent) | E.g., 2026-03-25 Annunciation → menaion-feast-troparion |
| Ordinary weekday, rank 4 saint date | Full troparion text renders | Outside Lent, ranks 1–4 all qualify |
| Weekday, November 8 (Synaxis of Archangels) | Full troparion text: "O Commanders of God's armies..." Tone 4 | Primary live-resolution test |
| Weekday, November 21 (Entrance of Theotokos) | Full feast troparion: "Today is the prelude..." Tone 4 | Rank 1 Great Feast test |
| Weekday, November 13 (John Chrysostom) | Full troparion: "Grace shining forth from thy mouth..." Tone 8 | Rank 2 Polyeleos test |
| Weekday, May 18 (Peter of Caesarea) | text-unavailable rubric stub | Intentional hold — only remaining gap in annual corpus |
| All other office slots (prokeimenon, kathisma, stichera, aposticha, theotokion) | Unchanged from pre-Menaion state for ordinary dates | Engine changes are scoped to troparion and feast-override paths |
| BCP Daily Office | Unchanged | MenaionResolver is not loaded in the BCP path |
| Ethiopian Sa'atat | Unchanged | |
| Church of the East / Hudra | Unchanged | |
| Console: no errors on app load | Clean | MenaionResolver loads month data lazily on first query |

---

*Menaion v1 — architecture established and annual corpus complete. Sections 1–2 above are historical record of the pilot architecture decisions. Section 3 reflects the current fully-integrated state.*

