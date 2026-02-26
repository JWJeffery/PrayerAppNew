# ETHIOPIAN SA'ATAT — PRODUCTION DOCUMENTATION

## Overview

The Ethiopian Sa'atat (ሰዓታት, *Saatat* — "The Hours") is the canonical Book of Hours of the **Ethiopian Orthodox Tewahedo Church**, one of the ancient Oriental Orthodox churches. It structures the liturgical day into nine canonical watches, each beginning with a mandatory introductory sequence (Tselote Meweta), followed by appointed prayer texts, psalms, a closing Marian hymn, and a daily Senkessar (Synaxarium) reading keyed to the Ethiopian calendar date. This mode is implemented as a fully isolated tradition within The Universal Office, sharing the DOM shell of the Daily Office section but suppressing all BCP-specific logic.

**Production Status:** ✅ OPERATIONAL — v2.6.1 complete  
**Last Updated:** February 24, 2026  
**Architecture:** Isolated tradition mode — separate rubrics file, separate component namespace, no BCP rendering  
**Entry Point:** `selectMode('ethiopian-saatat')` from splash screen  
**Time Resolution:** Automatic — hour determined by local system clock at render time  
**Calendar Resolution:** `EthiopianCalendar.getEthiopianDate()` (`js/calendar-ethiopian.js`) — JDN-based Alexandrian algorithm

---

## Canonical Hour Cycle

The Sa'atat divides the 24-hour day into nine canonical watches. The night is divided into three separate watches (First Night Watch, Midnight, and Pre-dawn Vigil) rather than one continuous block.

| Watch | Ge'ez Name | Time Window | Liturgical Theme |
|---|---|---|---|
| Matins | **Nigatu** (ንጋቱ) | 06:00–09:00 | The light of the risen day; 1 Clement reading |
| Third Hour | **Mese'rk** (መሠርቅ) | 09:00–12:00 | Descent of the Holy Spirit at Pentecost |
| Sixth Hour | **Lika** (ሊካ) | 12:00–15:00 | The Crucifixion of Christ |
| Ninth Hour | **Tese'at** (ተሰዓት) | 15:00–17:00 | The Death of Christ on the Cross |
| Eleventh Hour / Vespers | **Serkh** (ሠርክ) | 17:00–18:00 | The setting sun; evening thanksgiving |
| Compline | **Nime** (ኖሜ) | 18:00–21:00 | Thanksgiving at the close of day |
| First Night Watch | **Le'lit** (ሌሊት) | 21:00–00:00 | The Agony in Gethsemane; Hermas reading |
| Midnight | **Le'lit** (ሌሊት) | 00:00–03:00 | Resurrection vigil; Hermas reading |
| Pre-dawn Vigil | **Mahlet** (ማህሌት) | 03:00–06:00 | Hymns of the night's end before dawn |

The two Le'lit entries share the same `hourId`, `hourName`, and psalm appointments. They are separate entries in the JS `hourMap` to handle the midnight boundary (00:00 must not accidentally match the 21:00–24:00 range).

---

## Architecture Overview

```
Entry point
└── selectMode('ethiopian-saatat')        js/office-ui.js
    ├── Sets window._forcedOfficeId        Overrides radio-based office selection
    ├── Applies .ethiopian-theme           Body class — activates Metsehafe Tselot CSS
    ├── Shows #ethiopian-settings panel    Ethiopian-specific sidebar
    ├── Hides #settings-panel (BCP)        BCP sidebar fully suppressed
    ├── Hides main <h1>                    Removes "The Universal Office" header
    └── Calls init() or renderOffice()

Rubric resolution
└── resolvedOfficeId = 'ethiopian-saatat'
    └── activeRubric ← components/traditions/ethiopian/rubrics.json

Hour resolution
└── getEthiopianHourInfo()                 Maps local clock to canonical hour entry
    └── Returns { hourId, hourName, uiLabel, psalms, etReading }

Ethiopian calendar
└── EthiopianCalendar.getEthiopianDate()   js/calendar-ethiopian.js
    └── Converts Gregorian date → { day, month, monthIndex, year }
    └── Drives Senkessar date resolution in eth-saints-commemoration

Sequence rendering (v2.6.1 current)
├── eth-introduction-to-every-hour        Tselote Meweta: prostration rubric + Lord's Prayer + Ps 50/51
├── eth-basalios-prayer                   St. Basil's foundational prayer
├── eth-saatat-hour-slot                  Canonical hour text (time-resolved)
│                                         └── Sixth Hour: prepends commemorative sentence
├── eth-mazmur-slot                       Appointed psalms + Anqaşa Birhān closing hymn
├── VARIABLE_READING_ET                   ET scripture (Nigatu: 1 Clement; Le'lit: Hermas; others: skipped)
├── eth-saints-commemoration              Full Senkessar pipeline → Oriental saints → intercession fallback
└── comm-lords-prayer                     Lord's Prayer (shared common component)

Senkessar pipeline (within eth-saints-commemoration handler)
├── EthiopianCalendar.getEthiopianDate(currentDate) → { day, month }
├── MONTH_SLUG_MAP: normalise month name → folder slug (handles miyazya→miazia)
├── Lazy-load + cache appData.senkessarIndex (senkessar-index.json)
├── Find today's entry in index months[] → days[]
├── Fetch + cache appData.senkessarCache["{slug}-{day}"] per-day narrative
├── Render: title (gold) + narrative (applyParagraphBreaks)
└── Fallbacks: Oriental saints in Gregorian data → generic intercession text
```

---

## The Tselote Meweta — Introduction to Every Hour

As of v2.6.1, every canonical hour opens with the **Tselote Meweta** (ጸሎተ ምዕዋታ — Introduction to Every Hour). This is the traditional Ethiopian Orthodox opening used before each watch, mandatory in standard layperson's practice.

The `eth-introduction-to-every-hour` component contains:

1. **`rubric_before` field** — rendered as a `.rubric-text` rubric label:  
   *"Make the sign of the cross. Prostrate (metsehaf) three times, saying: In the name of the Father, and of the Son, and of the Holy Spirit. One God. Amen."*
2. **The Lord's Prayer** — traditional form
3. **Prayer of Thanksgiving** — hour-generic form
4. **Psalm 50/51 (Miserere)** — all verses, with Gloria Patri

**Design principle (Metsehafe Tselot aesthetic):** Red = what you DO (rubric, `.rubric-text`). Black = what you SAY (prayer text, `.component-text`). This makes the documentation scannable for the diaspora user who needs to know quickly what action is required versus what words to pray.

> `eth-prayer-thanksgiving` was the previous sequence opener. Its content is fully subsumed by `eth-introduction-to-every-hour` as of v2.6.1 and has been removed from the active sequence. The component is retained in `ethiopian.json` but should not be added back to the sequence.

---

## File Inventory

### `components/traditions/ethiopian/rubrics.json`

Defines the `ethiopian-saatat` office. Loaded in `init()` and concatenated onto `appData.rubrics` after `data/rubrics.json`.

**Current sequence (v2.6.1):**
```json
{
  "id": "ethiopian-saatat",
  "officeName": "The Ethiopian Sa'atat",
  "tradition": "Ethiopian Orthodox Tewahedo",
  "sequence": [
    "eth-introduction-to-every-hour",
    "eth-basalios-prayer",
    "eth-saatat-hour-slot",
    "eth-mazmur-slot",
    "VARIABLE_READING_ET",
    "eth-saints-commemoration",
    "comm-lords-prayer"
  ]
}
```

The `slots` object within this file is documentation metadata only — it does not drive rendering. All slot resolution logic lives in `renderOffice()`.

### `components/ethiopian.json`

All Ethiopian-tradition liturgical text components. Namespace prefix: `eth-`.

| Component ID | Purpose | Status |
|---|---|---|
| `eth-introduction-to-every-hour` | Tselote Meweta mandatory opening: prostration rubric, Lord's Prayer, Thanksgiving, Psalm 50/51 | **Active — v2.6.1** |
| `eth-basalios-prayer` | St. Basil's foundational prayer for all hours | Active |
| `eth-prayer-thanksgiving` | Standard introductory thanksgiving | **Retired from sequence v2.6.1** — content subsumed; retained for reference |
| `eth-anqasa-birhan` | Anqaşa Birhān — Gate of Light; Marian closing hymn appended after Mazmur every hour | Active |
| `eth-nigatu-hour-text` | Canonical prayer for Matins (06:00–09:00) | Active |
| `eth-meserk-hour-text` | Canonical prayer for Third Hour / Mese'rk (09:00–12:00) | Active |
| `eth-lika-hour-text` | Canonical prayer for Sixth Hour / Lika (12:00–15:00). Crucifixion hour. | Active |
| `eth-terk-hour-text` | Canonical prayer for Ninth Hour / Tese'at (15:00–17:00). Death of Christ. | Active |
| `eth-serkh-hour-text` | Canonical prayer for Eleventh Hour / Vespers / Serkh (17:00–18:00) | Active |
| `eth-nome-hour-text` | Canonical prayer for Compline / Nime (18:00–21:00) | Active |
| `eth-hour-7` | Canonical prayer for First Night Watch / Le'lit (21:00–00:00) | Active |
| `eth-lelit-hour-text` | Canonical prayer for Midnight / Le'lit (00:00–03:00) | Active |
| `eth-mahlet-hour-text` | Canonical prayer for Pre-dawn Vigil / Mahlet (03:00–06:00). ⚠️ Text sparse/provisional — see Known Issues. | Active |
| `eth-mazmur-tuat` | Psalm reference metadata — not directly rendered | Metadata only |
| `eth-leke-haile-chant` | 12-fold Leke Haile doxology | Full edition only |
| `eth-41-kyrie` | 41-fold Kyrie (Igzee'o Tesahalene) | Full edition only |
| `eth-saints-commemoration` | Scaffold text; actual rendering handled by the slot handler's Senkessar pipeline | Active (as scaffold) |
| `eth-synaxarium-reading` | Senkessar reading scaffold — actual rendering handled within eth-saints-commemoration handler | Active (as scaffold) |
| `eth-weddase-{day}` | Weddase Maryam — Praises of Mary for each day of the week (7 components) | Active |

---

## `getEthiopianHourInfo()` — Full Reference

**Location:** `js/office-ui.js`, immediately before `renderOffice()`  
**Called by:** `renderOffice()` when `isEthiopianSaatat` is true  
**Returns:** `{ hourId, hourName, uiLabel, psalms, etReading }`

```javascript
function getEthiopianHourInfo() {
    // Temporal override for testing — set window._temporalOverride = { hourId, ... }
    if (window._temporalOverride?.hourId) return window._temporalOverride;

    const now          = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();

    const hourMap = [
        { from:  6*60, to:  9*60, hourId: 'eth-nigatu-hour-text',  hourName: 'Nigatu — ንጋቱ (Matins)',              uiLabel: 'Matins',        psalms: ['3','63','133'],    etReading: '1CLEM_ET 1:1-20'  },
        { from:  9*60, to: 12*60, hourId: 'eth-meserk-hour-text',  hourName: "Mese'rk — መሠርቅ (Third Hour)",        uiLabel: 'Third Hour',    psalms: ['16','17','18'],    etReading: null               },
        { from: 12*60, to: 15*60, hourId: 'eth-lika-hour-text',    hourName: 'Lika — ሊካ (Sixth Hour)',              uiLabel: 'Sixth Hour',    psalms: ['22','23','24'],    etReading: null               },
        { from: 15*60, to: 17*60, hourId: 'eth-terk-hour-text',    hourName: "Tese'at — ተሰዓት (Ninth Hour)",         uiLabel: 'Ninth Hour',    psalms: ['69','70','71'],    etReading: null               },
        { from: 17*60, to: 18*60, hourId: 'eth-serkh-hour-text',   hourName: 'Serkh — ሠርክ (Eleventh Hour)',         uiLabel: 'Eleventh Hour', psalms: ['141','142','143'], etReading: null               },
        { from: 18*60, to: 21*60, hourId: 'eth-nome-hour-text',    hourName: 'Nime — ኖሜ (Compline)',                uiLabel: 'Compline',      psalms: ['4','6','13'],      etReading: null               },
        { from: 21*60, to: 24*60, hourId: 'eth-hour-7',            hourName: "Le'lit — First Night Watch",          uiLabel: 'Night Watch',   psalms: ['4','6','13'],      etReading: 'HERM_ET 1:1-10'   },
        { from:  0*60, to:  3*60, hourId: 'eth-lelit-hour-text',   hourName: "Le'lit — ሌሊት (Midnight)",             uiLabel: 'Midnight',      psalms: ['4','6','13'],      etReading: 'HERM_ET 1:1-10'   },
        { from:  3*60, to:  6*60, hourId: 'eth-mahlet-hour-text',  hourName: 'Mahlet — ማህሌት (Pre-dawn Vigil)',      uiLabel: 'Pre-dawn Vigil',psalms: ['3','63','133'],    etReading: null               },
    ];

    for (const entry of hourMap) {
        if (totalMinutes >= entry.from && totalMinutes < entry.to) return entry;
    }
    return hourMap[0]; // unreachable under normal conditions
}
```

**`etReading`:** Used by `VARIABLE_READING_ET`. `null` means no ET-tradition scripture for that watch. Nigatu (Matins) uses 1 Clement; both Le'lit watches use Shepherd of Hermas.

**`window._temporalOverride`:** Paste `window._temporalOverride = { hourId: 'eth-lika-hour-text', hourName: 'Lika — ሊካ (Sixth Hour)', uiLabel: 'Sixth Hour', psalms: ['22','23','24'], etReading: null }` in the browser console to force a specific hour for testing without waiting for the clock.

**Map coverage:** All 1440 minutes covered without gaps. The fallback is unreachable under normal conditions.

---

## Sequence Slot Handlers — Full Reference

### `eth-introduction-to-every-hour` *(added v2.6.1)*

Renders the Tselote Meweta mandatory opening for every hour.

```javascript
if (item === 'eth-introduction-to-every-hour') {
    const introComp = appData.components.find(c => c.id === 'eth-introduction-to-every-hour');
    if (introComp) {
        if (introComp.rubric_before) {
            officeHtml += `<span class="rubric-text">${introComp.rubric_before}</span>`;
        }
        officeHtml += `<div class="component-text" style="white-space:normal">
                       ${applyParagraphBreaks(introComp.text)}</div>`;
    } else {
        console.warn('[renderOffice] eth-introduction-to-every-hour: component not found');
    }
    continue;
}
```

- `rubric_before` is a field on the component (distinct from `text`) — rendered as a `.rubric-text` span with Metsehafe Tselot styling (crimson, italic, left-barred ☩ glyph)
- Full text (Lord's Prayer + Thanksgiving + Psalm 50/51) rendered with `applyParagraphBreaks()`

### `eth-saatat-hour-slot`

Renders the canonical prayer text for the current canonical watch. Injects a commemorative sentence for the Sixth Hour.

```javascript
if (item === 'eth-saatat-hour-slot') {
    if (ethHourInfo) {
        if (ethHourInfo.hourId === 'eth-lika-hour-text') {
            officeHtml += `<div class="component-text" style="white-space:normal">
                           <i>The Sixth Hour — the hour of the Crucifixion. Bow your head.</i></div>`;
        }
        const hourComp = appData.components.find(c => c.id === ethHourInfo.hourId);
        if (hourComp) {
            officeHtml += `<span class="rubric-text">${ethHourInfo.hourName}</span>`;
            officeHtml += `<div class="component-text" style="white-space:normal">
                           ${applyParagraphBreaks(hourComp.text)}</div>`;
        } else {
            console.warn(`[renderOffice] eth-saatat-hour-slot: component not found — ${ethHourInfo.hourId}`);
        }
    }
    continue;
}
```

### `eth-mazmur-slot`

Renders the three appointed psalms for the current watch, followed by the Anqaşa Birhān hymn.

```javascript
if (item === 'eth-mazmur-slot') {
    officeHtml += `<span class="rubric-text">Mazmur (Appointed Psalms)</span>`;
    for (const psNum of ethHourInfo.psalms) {
        const fullText = await getScriptureText('PSALM ' + psNum);
        officeHtml += `<h4 class="passage-reference">Psalm ${psNum}</h4>`;
        officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
    }
    const anqasa = appData.components.find(c => c.id === 'eth-anqasa-birhan');
    if (anqasa) {
        officeHtml += `<span class="rubric-text">Anqaşa Birhān — Gate of Light</span>`;
        officeHtml += `<div class="component-text" style="white-space:normal">
                       <i>${applyParagraphBreaks(anqasa.text)}</i></div>`;
    }
    continue;
}
```

- Psalms fetched via `getScriptureText()` — same resolver as BCP offices
- Rendered via `formatPsalmAsPoetry()` — half-verse span structure for CSS poetry layout
- Anqaşa Birhān always appended — the standard Marian closing for every watch

### `VARIABLE_READING_ET`

Renders the appointed ET-tradition scripture reading for hours that have one. Silently skipped when `etReading` is null.

```javascript
if (item === 'VARIABLE_READING_ET') {
    if (isEthiopianSaatat && ethHourInfo && ethHourInfo.etReading) {
        const citation = ethHourInfo.etReading;
        const text     = await getScriptureText(citation);
        if (text) {
            const readingLabel = (ethHourInfo.hourId === 'eth-nigatu-hour-text')
                ? 'The Nigatu Reading — 1 Clement'
                : "The Le'lit Reading — The Shepherd of Hermas";
            officeHtml += `<span class="rubric-text">${readingLabel}</span>`;
            officeHtml += `<h4 class="passage-reference">${citation}</h4>`;
            officeHtml += `<div class="reading-text">${formatScriptureAsFlow(text)}</div>`;
            officeHtml += '<div class="ornamental-divider">...</div>';
        }
    }
    continue;
}
```

Active hours: Nigatu (1 Clement 1:1-20) and both Le'lit watches (Shepherd of Hermas 1:1-10). All other hours: silently skipped via `continue`.

### `eth-saints-commemoration` — Full Senkessar Pipeline

This slot handles the complete Senkessar (Ethiopian Synaxarium) lookup, fetch, and render pipeline.

```javascript
if (item === 'eth-saints-commemoration') {
    // 1. Resolve Ethiopian date
    const ethDate = EthiopianCalendar.getEthiopianDate(currentDate);

    // 2. Normalise month name → folder slug
    const MONTH_SLUG_MAP = {
        'meskerem': 'meskerem', 'teqemt': 'tiqimt', 'hidar': 'hidar',
        'tahsas': 'tahsas', 'tir': 'tir', 'yekatit': 'yekatit',
        'megabit': 'megabit', 'miyazya': 'miazia', 'ginbot': 'ginbot',
        'sene': 'sene', 'hamle': 'hamle', 'nehase': 'nehase', 'pagume': 'pagume'
    };
    const monthSlug = MONTH_SLUG_MAP[ethDate.month.toLowerCase()] || ethDate.month.toLowerCase();

    // 3. Lazy-load + cache senkessar-index.json
    if (!appData.senkessarIndex) { /* fetch and cache */ }

    // 4. Find today's entry in index
    // 5. Fetch + cache per-day narrative from data/synaxarium/ethiopian/{slug}/{day}.json
    // 6. Render → or fall back to Oriental saints filter → or generic intercession
}
```

**Three-tier fallback:**
1. Senkessar index entry found → fetch `data/synaxarium/ethiopian/{monthSlug}/{day}.json` → render title + narrative
2. No index entry → filter `appData.saints` for `tradition` containing `'ethiopian'` or `'oriental'` (case-insensitive) matching `todayKeyShort`
3. No matching saints → render generic intercession for the Oriental Orthodox Communion

**Caching:** `appData.senkessarIndex` and `appData.senkessarCache["{slug}-{day}"]` prevent redundant fetches.

**`MONTH_SLUG_MAP`:** `EthiopianCalendar` outputs `'Miyazya'` for month 8, but the data folder is `miazia`. The map handles this and the `teqemt`→`tiqimt` alias. A separate `MONTH_NAME_ALIASES` object handles the same normalisation when searching the index.

---

## The Senkessar (Ethiopian Synaxarium)

### Overview

The Senkessar is the Ethiopian hagiographical lectionary — a narrative reading for each day of the 13-month Ethiopian calendar. In The Universal Office it renders as the Commemoration of the Day for all canonical hours.

### Data Architecture

```
data/synaxarium/ethiopian/
├── senkessar-index.json        Master index — 13 months, 385 day entries (all validated)
├── meskerem/1.json … 30.json   ✅ Complete
├── tiqimt/1.json … 30.json     ✅ Complete
├── hidar/1.json … 30.json      ✅ Complete
├── tahsas/1.json … 30.json     ✅ Complete
├── tir/1.json … 30.json        ✅ Complete (Phase 8.1 — Timqat arc)
├── yekatit/1.json … 30.json    ✅ Complete
├── megabit/1.json … 30.json    ✅ Complete
├── miazia/1.json … 30.json     ✅ Complete  ← folder slug 'miazia'; index slug 'miyazya' — resolved by MONTH_SLUG_MAP
├── ginbot/1.json … 30.json     ✅ Complete
├── sene/1.json … 30.json       ✅ Complete
├── hamle/1.json … 30.json      ✅ Complete (verified February 24, 2026)
├── nehase/1.json … 30.json     ✅ Complete
└── pagumen/1.json … 5.json     ✅ Complete (5 days; 6 in Ethiopian leap years)
```

All 13 months are complete. The Senkessar is fully operational for every day of the Ethiopian liturgical year.

### Index Schema (`senkessar-index.json`)

```json
{
  "months": [
    {
      "month": "meskerem",
      "ge_ez": "መስከረም",
      "month_number": 1,
      "total_days": 30,
      "thematic_summary": "...",
      "key_feasts": ["..."],
      "days": [
        { "day": 1, "id": "senkessar-meskerem-1", "title": "..." }
      ]
    }
  ]
}
```

**Key schema notes:**
- `months` is a top-level **array** — search with `.find(m => m.month.toLowerCase() === slug)`
- Field is `ge_ez` (not `ge'ez`) — apostrophe removed for JSON parser compatibility
- `days` is always an **array** — corrected from `entries{}` object format in 2026-02-23 audit
- ID pattern: `senkessar-{month-slug}-{day}`

### Narrative File Schema (`{month}/{day}.json`)

```json
{
  "id": "senkessar-tir-11",
  "title": "11 Tir — Timqat: The Feast of the Epiphany",
  "narrative": "Paragraph one.\n\nParagraph two.\n\nParagraph three.\n\nParagraph four."
}
```

`narrative` uses `\n\n` for paragraph breaks. The renderer normalises escaped sequences before calling `applyParagraphBreaks()`:
```javascript
const normalizedNarrative = dayData.narrative.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');
officeHtml += `<div ...>${applyParagraphBreaks(normalizedNarrative)}</div>`;
```

**Narrative style:** Deep Assembly — high-liturgical English; 4-paragraph woven structure: (1) primary monthly commemoration in theological arc, (2) name-etymology saints, (3) patristic/historical anchor, (4) theological seal connecting to the month's apex feast.

---

## `EthiopianCalendar` — Calendar Engine Reference

**File:** `js/calendar-ethiopian.js`  
**Loaded:** Before `office-ui.js` in `index.html` script load order  
**Pattern:** IIFE — globally accessible as `EthiopianCalendar`  
**Called:** In `eth-saints-commemoration` handler: `EthiopianCalendar.getEthiopianDate(currentDate)`

| Method | Returns | Notes |
|---|---|---|
| `getEthiopianDate(date)` | `{ day, month, monthIndex, year }` | Amete Mihret era. Called every render. |
| `getCopticDate(date)` | `{ day, month, monthIndex, year }` | Same algorithm, Coptic names, EC-276 era offset |
| `formatEthiopianDate(date)` | `"15 Yekatit 2018"` | Display string — ready for Phase 8.5 Ge'ez header |
| `isEthiopianLeapYear(year)` | boolean | `year % 4 === 3`; Pagume has 6 days in leap years |
| `MONTH_NAMES` | Array\[13\] | Ge'ez month name strings exported for reuse |

**Algorithm:** Julian Day Number (JDN) Alexandrian method. Epoch: 1 Meskerem 1 EC = JDN 1724221. Valid for all historical and future dates. A 9-case self-test suite runs on every page load.

See `CALENDAR_ENGINE_DOCUMENTATION.md` for the full `EthiopianCalendar` module reference.

---

## CSS — Metsehafe Tselot Rubric Aesthetic

The `.ethiopian-theme` body class enables a distinct visual hierarchy separating rubrics (instructions) from prayer text:

```css
/* Principle: Red = what you DO. Black = what you SAY. */

.ethiopian-theme .rubric-text {
    color: #C0392B;                          /* Crimson — legible on dark parchment */
    font-size: 0.85em;
    font-weight: 300;                        /* Light — rubric is a guide, not the voice */
    font-style: italic;
    font-family: 'IM Fell English', Georgia, serif;
    font-variant: normal;                    /* Overrides BCP small-caps */
    border-left: 2px solid #C0392B;
    padding-left: 10px;
    border-bottom: none;                     /* Overrides BCP dotted underline */
    text-shadow: none;
    width: auto;
}
.ethiopian-theme .rubric-text::before {
    content: '☩ ';                           /* Ethiopian cross glyph */
}
.ethiopian-theme .component-text {
    font-weight: 500;                        /* Heavier than rubric — the dominant voice */
}
@media print {
    .ethiopian-theme .rubric-text {
        border-left: none;
        padding-left: 0;
    }
}
```

**Color note:** `#C0392B` is used instead of `#8B0000` (traditional Qay dried-blood ink) because `#8B0000` is illegible against the dark parchment background (`#1e1608`). `#C0392B` matches the existing `--rubric` dark mode CSS variable. A `body.light-mode .ethiopian-theme .rubric-text { color: #8B0000; }` override is a known future enhancement.

---

## BCP Isolation — Complete List

When `isEthiopianSaatat` is true, the following are unconditionally suppressed:

| What | Where | How |
|---|---|---|
| Agpeya Opening | Pre-sequence | `if (!isEthiopianSaatat && toggle-agpeya-opening.checked)` |
| East Syriac Hours | Pre-sequence | `if (!isEthiopianSaatat && toggle-east-syriac-hours.checked)` |
| Marian Antiphon/Theotokion (before) | Pre-sequence | `if (!isEthiopianSaatat && marianElement !== 'none' && marianPos === 'before')` |
| Marian Antiphon/Theotokion (after) | Post-sequence | `if (!isEthiopianSaatat && marianElement !== 'none' && marianPos === 'after')` |
| Commemorations header text | Finalise DOM | `date-header.innerText` assignment inside `if (!isEthiopianSaatat)` |
| `date-header` visibility | Finalise DOM | `date-header.style.display = 'none'` in else branch |
| `saint-display` BCP content | Finalise DOM | `saint-display.innerHTML` assignment inside `if (!isEthiopianSaatat)` |
| `saint-display` cleared | Finalise DOM | `saint-display.innerHTML = ''` in else branch |
| BCP settings panel | `selectMode()` | `#settings-panel` hidden; `#ethiopian-settings` shown instead |
| Main `<h1>` | `selectMode()` | `mainH1.style.display = 'none'` at mode entry |

---

## `window._forcedOfficeId` Pattern

The Ethiopian Sa'atat has no radio button. `renderOffice()` ordinarily reads the office from `input[name="office-time"]:checked`, which defaults to `morning-office`.

`selectMode('ethiopian-saatat')` sets:
```javascript
window._forcedOfficeId = 'ethiopian-saatat';
```

`renderOffice()` then reads:
```javascript
const officeId         = document.querySelector('input[name="office-time"]:checked')?.value || 'morning-office';
const resolvedOfficeId = window._forcedOfficeId || officeId;
```

All subsequent flags and rendering blocks use `resolvedOfficeId`.

**Note:** `window._forcedOfficeId` is not cleared in `backToSplash()`. Safe at present. If future development adds mode-to-mode navigation without a full page reload, `backToSplash()` should add:
```javascript
window._forcedOfficeId = undefined;
document.body.classList.remove('ethiopian-theme');
```

---

## Theological Notes

**Psalm appointments:** The psalms assigned per hour follow the common Tewahedo office tradition. Some manuscripts differ; the appointments used here represent a standard received form.

**Anqaşa Birhān:** "Gate of Light" — a Marian hymn sung at the close of each canonical watch. The current implementation uses a single component for all hours; some hours traditionally use variant texts (future Phase 7.6 target).

**The Lord's Prayer:** `comm-lords-prayer` is the shared BCP English component. The traditional Ethiopian form is "Abba, Abbatachin." A dedicated `eth-lords-prayer` component providing this form is a future Phase 7.6 target.

**Trisagion:** The Sa'atat traditionally begins each hour with the Trisagion ("Holy God, Holy Mighty, Holy Immortal, have mercy on us"). This is a future Phase 7.6 target. A dedicated `eth-trisagion` component at the sequence head would precede `eth-introduction-to-every-hour`.

---

## Known Issues

| Issue | Severity | Action |
|---|---|---|
| `eth-mahlet-hour-text` text is sparse | LOW | Pre-dawn vigil (03:00–06:00) text drawn from SAATAT_FULL ch.1 — appropriate but thin. Full text should be sourced from a qualified Ethiopian Orthodox liturgical scholar. |
| Ethiopian rubric color in light mode | LOW | `#C0392B` is correct for dark mode. `#8B0000` (traditional Qay ink) should be added under `body.light-mode .ethiopian-theme .rubric-text` when light-mode Ethiopian styling is addressed. |

---

## Validation Checklist

Before deploying changes to the Ethiopian Sa'atat:

- [ ] `components/traditions/ethiopian/rubrics.json` valid JSON; sequence begins with `eth-introduction-to-every-hour`
- [ ] `components/ethiopian.json` valid JSON; contains `eth-introduction-to-every-hour` with `rubric_before` field
- [ ] All `hourId` values in `getEthiopianHourInfo()` hourMap have matching components in `ethiopian.json`
- [ ] `getEthiopianHourInfo()` hourMap covers all 1440 minutes without gaps or overlaps
- [ ] `EthiopianCalendar` self-test suite passes on page load (check browser console)
- [ ] `EthiopianCalendar.getEthiopianDate(currentDate)` called in `eth-saints-commemoration` handler
- [ ] `senkessar-index.json` parses; `months` is an array; each month has a `days[]` array
- [ ] `MONTH_SLUG_MAP` entries cover all 13 months including `miyazya`→`miazia`
- [ ] Senkessar narrative files follow `{ id, title, narrative }` schema; `narrative` uses `\n\n`
- [ ] `applyParagraphBreaks()` applied after `\\n\\n` → `\n\n` normalisation on narrative
- [ ] `appData.senkessarIndex` and `appData.senkessarCache` populate correctly after first render
- [ ] `VARIABLE_READING_ET` silently skips hours where `etReading` is null
- [ ] Saints preload block appears before the rubric sequence loop in `renderOffice()`
- [ ] `window._forcedOfficeId` set to `'ethiopian-saatat'` in `selectMode()`
- [ ] `resolvedOfficeId` (not `officeId`) used for all `isEthiopianSaatat` tests and rubric lookup
- [ ] `#date-header` and `#saint-display` suppressed in finalise DOM block
- [ ] `.ethiopian-theme` applied to `body` at mode entry; `#ethiopian-settings` shown; `#settings-panel` hidden
- [ ] No BCP ecumenical blocks fire when `isEthiopianSaatat` is true
- [ ] Console warning emitted if `eth-introduction-to-every-hour` or `eth-saatat-hour-slot` component not found

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| 7.1 | ✅ Complete | Entry point, Nigatu/Matins hour, BCP isolation, resolvedOfficeId pattern |
| 7.2 | ✅ Complete | Mese'rk (Third Hour) and Lika (Sixth Hour); saints filter; Oriental fallback intercession |
| 7.3 | ✅ Complete | Full 24-hour cycle (Tese'at, Serkh, Nime, Le'lit, Mahlet); saints preload fix; header guard |
| 7.4 | ✅ Complete | `js/calendar-ethiopian.js` — JDN Alexandrian engine; `EthiopianCalendar.getEthiopianDate()` wired into `eth-saints-commemoration` for Senkessar date resolution |
| 8.1 | ✅ Complete | Senkessar index corrected and validated (13 months, 385 entries); Tir narrative corpus complete (30 days, full Timqat arc) |
| 8.2 | ✅ Complete | Full Senkessar pipeline operational: EthiopianCalendar → index lookup → per-day fetch → three-tier fallback; all 13 months complete including Hamle (verified 2026-02-24) |
| v2.6.1 | ✅ Complete | `eth-introduction-to-every-hour` (Tselote Meweta) mandatory opening; Metsehafe Tselot rubric aesthetic (CSS); Sixth Hour commemorative sentence; `#8B0000`→`#C0392B` legibility fix; `eth-liku`→`eth-lika` ID corrected; `eth-prayer-thanksgiving` retired from sequence |
| 8.5 | 📋 Planned | Ge'ez date display in Sa'atat UI header — `EthiopianCalendar.formatEthiopianDate()` is already available; UI-only change |
| 7.5 | 📋 Planned | Coptic Agpeya as standalone tradition entry point (parallel architecture to Sa'atat) |
| 7.6 | 📋 Planned | Dedicated `eth-trisagion` and `eth-lords-prayer` components; hour-variant Anqaşa Birhān texts |

---

## Credits

**Liturgical Source:** Ethiopian Orthodox Tewahedo Church Sa'atat (Book of Hours); Senkessar (Synaxarium)  
**Calendar Algorithm:** Alexandrian JDN method (Ge'ez / Coptic Alexandrian calendar)  
**Application:** The Universal Office  
**Last Updated:** February 24, 2026

---

*For application entry point and mode selection see `INDEX_HTML_DOCUMENTATION.md`. For rendering engine see `OFFICE_UI_DOCUMENTATION.md`. For calendar modules see `CALENDAR_ENGINE_DOCUMENTATION.md`.*