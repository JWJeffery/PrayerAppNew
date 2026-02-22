# ETHIOPIAN SA'ATAT — PRODUCTION DOCUMENTATION

## Overview

The Ethiopian Sa'atat (ሰዓታት, *Saatat* — "The Hours") is the canonical Book of Hours of the **Ethiopian Orthodox Tewahedo Church**, one of the ancient Oriental Orthodox churches. It structures the liturgical day into six canonical watches, each with appointed prayer texts, psalms, and a closing Marian hymn. This mode is implemented as a fully isolated tradition within The Universal Office, sharing the DOM shell of the Daily Office section but suppressing all BCP-specific logic.

**Production Status:** ✅ OPERATIONAL — Phase 7.3 complete  
**Last Updated:** February 22, 2026  
**Architecture:** Isolated tradition mode — separate rubrics file, separate component namespace, no BCP rendering  
**Entry Point:** `selectMode('ethiopian-saatat')` from splash screen  
**Time Resolution:** Automatic — hour determined by local system clock at render time

---

## Canonical Hour Cycle

The Sa'atat divides the 24-hour day into six canonical watches of three hours each. Each watch has a distinct liturgical focus, appointed psalms, and a canonical prayer text.

| Watch | Ge'ez Name | Time Window | Liturgical Theme |
|---|---|---|---|
| Morning Watch | **Tuat** (ጡዋት) | 06:00–09:00 | Praise at the dawn of the day |
| Third Hour | **Meserkh** (ሠርክ) | 09:00–12:00 | Descent of the Holy Spirit at Pentecost |
| Sixth Hour | **Liku** (ልክ) | 12:00–15:00 | The Crucifixion of Christ |
| Ninth Hour | **Serkh** (ሠርከ) | 15:00–18:00 | The Death of Christ on the Cross |
| Vespers | **Nimeat** (ንሜዓት) | 18:00–21:00 | Thanksgiving at the close of day |
| Night Watch | **Lelit** (ሌሊት) | 21:00–06:00 | The Agony in Gethsemane; resurrection vigil |

The Night Watch spans midnight, covering both 21:00–24:00 and 00:00–06:00. This is handled by two entries in the `hourMap` array in `getEthiopianHourInfo()`.

---

## Architecture Overview

```
Entry point
└── selectMode('ethiopian-saatat')        js/office-ui.js
    ├── Sets window._forcedOfficeId        Overrides radio-based office selection
    ├── Applies .ethiopian-theme           Body class for potential future CSS theming
    ├── Hides sidebar + settings panel     Sa'atat has no user-configurable settings
    ├── Hides main <h1>                    Removes "The Universal Office" header
    └── Calls init() or renderOffice()

Rubric resolution
└── resolvedOfficeId = 'ethiopian-saatat'
    └── activeRubric ← components/traditions/ethiopian/rubrics.json

Hour resolution
└── getEthiopianHourInfo()                 Maps local clock to canonical hour entry
    └── Returns { hourId, hourName, uiLabel, psalms }

Sequence rendering
├── eth-basalios-prayer                    St. Basil's foundational prayer
├── eth-prayer-thanksgiving                Opening thanksgiving
├── eth-saatat-hour-slot                   Canonical hour text (time-resolved)
├── eth-mazmur-slot                        Appointed psalms + Anqaşa Birhān
├── eth-saints-commemoration               Oriental Orthodox saints / intercession
└── comm-lords-prayer                      Lord's Prayer (shared common component)

Commemorations (inline, not in footer)
└── eth-saints-commemoration slot
    ├── Filter: tradition contains 'ethiopian' or 'oriental'
    └── Fallback: generic intercession for the Oriental Orthodox Communion
```

---

## File Inventory

### `components/traditions/ethiopian/rubrics.json`

Defines the `ethiopian-saatat` office. Loaded in `init()` and concatenated onto `appData.rubrics` after `data/rubrics.json`.

**Structure:**
```json
[
  {
    "id": "ethiopian-saatat",
    "officeName": "The Ethiopian Sa'atat",
    "tradition": "Ethiopian Orthodox Tewahedo",
    "sequence": [
      "eth-basalios-prayer",
      "eth-prayer-thanksgiving",
      "eth-saatat-hour-slot",
      "eth-mazmur-slot",
      "eth-saints-commemoration",
      "comm-lords-prayer"
    ],
    "slots": {
      "eth-saatat-hour-slot": { ... time_map documentation ... },
      "eth-mazmur-slot": { ... time_map documentation ... }
    }
  }
]
```

The `slots` object is documentation metadata only — it does not drive rendering. All slot resolution logic lives in `renderOffice()`.

### `components/ethiopian.json`

All Ethiopian-tradition liturgical text components. Namespace prefix: `eth-`.

| Component ID | Title | Purpose |
|---|---|---|
| `eth-basalios-prayer` | Prayer of Saint Basil | Foundational opening prayer for all hours (St. Basil's text) |
| `eth-prayer-thanksgiving` | Prayer of Thanksgiving | Standard introductory thanksgiving |
| `eth-anqasa-birhan` | Anqaşa Birhān — Gate of Light | Theotokos hymn; appended after Mazmur in every hour |
| `eth-tuat-hour-text` | The Morning Watch (Tuat) | Canonical prayer for 06:00–09:00 |
| `eth-meserkh-hour-text` | The Third Hour (Meserkh) | Canonical prayer for 09:00–12:00 |
| `eth-liku-hour-text` | The Sixth Hour (Liku) | Canonical prayer for 12:00–15:00 |
| `eth-serkh-hour-text` | The Ninth Hour (Serkh) | Canonical prayer for 15:00–18:00 |
| `eth-nimeat-hour-text` | Vespers (Nimeat) | Canonical prayer for 18:00–21:00 |
| `eth-night-hour-text` | The Night Watch (Lelit) | Canonical prayer for 21:00–06:00 |
| `eth-mazmur-tuat` | Mazmur metadata for Tuat | Psalm reference metadata (Psalms 3, 63, 133) |
| `eth-saints-commemoration` | Commemoration of Saints | Scaffold text for the saints slot |

> **Note on `eth-mazmur-tuat`:** This is a metadata component only. The actual psalm texts are fetched at render time via `getScriptureText()` using the psalm numbers from `ethHourInfo.psalms`. The metadata component is not directly rendered.

---

## `getEthiopianHourInfo()` — Full Reference

**Location:** `js/office-ui.js`, immediately before `renderOffice()`  
**Called by:** `renderOffice()` when `isEthiopianSaatat` is true  
**Returns:** `{ hourId, hourName, uiLabel, psalms }`

```javascript
function getEthiopianHourInfo() {
    const now          = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();

    const hourMap = [
        { from:  6*60, to:  9*60, hourId: 'eth-tuat-hour-text',    hourName: 'Tuat — The Morning Watch', psalms: ['3','63','133'] },
        { from:  9*60, to: 12*60, hourId: 'eth-meserkh-hour-text', hourName: 'Meserkh — The Third Hour',  psalms: ['16','17','18'] },
        { from: 12*60, to: 15*60, hourId: 'eth-liku-hour-text',    hourName: 'Liku — The Sixth Hour',     psalms: ['22','23','24'] },
        { from: 15*60, to: 18*60, hourId: 'eth-serkh-hour-text',   hourName: 'Serkh — The Ninth Hour',    psalms: ['69','70','71'] },
        { from: 18*60, to: 21*60, hourId: 'eth-nimeat-hour-text',  hourName: 'Nimeat — Vespers',          psalms: ['141','142','143'] },
        { from: 21*60, to: 24*60, hourId: 'eth-night-hour-text',   hourName: 'Lelit — The Night Watch',   psalms: ['4','6','13'] },
        { from:  0*60, to:  6*60, hourId: 'eth-night-hour-text',   hourName: 'Lelit — The Night Watch',   psalms: ['4','6','13'] },
    ];

    for (const entry of hourMap) {
        if (totalMinutes >= entry.from && totalMinutes < entry.to) return entry;
    }
    return { hourId: 'eth-tuat-hour-text', hourName: 'Tuat — The Morning Watch', psalms: ['3','63','133'] };
}
```

**Night watch logic:** Lelit appears twice in the array — once for 21:00–24:00 and once for 00:00–06:00. The loop finds the first matching entry. At midnight (totalMinutes = 0), the 21:00–24:00 entry does not match (0 < 1260 but 0 is not ≥ 1260), so the 00:00–06:00 entry matches correctly.

**Fallback:** The map is exhaustive and the fallback is unreachable under normal conditions. Tuat is the canonical default if the logic ever fails.

---

## Sequence Slot Handlers — Full Reference

### `eth-saatat-hour-slot`

Renders the canonical prayer text for the current canonical watch.

```javascript
if (item === 'eth-saatat-hour-slot') {
    if (ethHourInfo) {
        const hourComp = appData.components.find(c => c.id === ethHourInfo.hourId);
        if (hourComp) {
            officeHtml += `<span class="rubric-text">${ethHourInfo.hourName}</span>`;
            officeHtml += `<div class="component-text" style="white-space:normal">
                           ${applyParagraphBreaks(hourComp.text)}</div>`;
        }
    }
    continue;
}
```

- Rubric label: `ethHourInfo.hourName` (e.g., "Tuat — The Morning Watch")
- Text rendered in a `<div>` with `white-space:normal` to support `<br><br>` paragraph breaks
- `applyParagraphBreaks()` converts `\n\n` → `<br><br>` in the source text

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

- Psalms fetched via `getScriptureText()` — same scripture resolver used for BCP offices
- Rendered via `formatPsalmAsPoetry()` — half-verse span structure for CSS poetry layout
- Anqaşa Birhān is always appended regardless of hour — it is the standard Marian closing for every watch
- Anqaşa Birhān text is rendered in italic inside `<i>` tags

### `eth-saints-commemoration`

Filters the saints dataset for Oriental Orthodox commemorations and renders them inline.

```javascript
if (item === 'eth-saints-commemoration') {
    if (appData.saints) {
        const orientalSaints = appData.saints.filter(s => {
            if (!s.day || !s.day.toLowerCase().includes(todayKeyShort.toLowerCase())) return false;
            const t = (s.tradition || '').toLowerCase();
            return t.includes('ethiopian') || t.includes('oriental');
        });
        if (orientalSaints.length > 0) {
            officeHtml += `<span class="rubric-text">Commemorations of the Oriental Orthodox</span>`;
            orientalSaints.forEach(s => {
                officeHtml += `<div class="component-text"><strong>${s.name || 'Unknown'}</strong>
                               ${s.description ? ' — ' + s.description : ''}</div>`;
            });
        } else {
            officeHtml += `<span class="rubric-text">Intercession for the Oriental Orthodox Communion</span>`;
            officeHtml += `<div class="component-text">Let us pray for the holy Oriental Orthodox Churches: 
                           the Ethiopian Tewahedo, the Coptic, the Syriac, the Armenian, the Malankara, 
                           and the Eritrean; that the Lord may preserve them in the true faith, strengthen 
                           them under persecution, and unite all Christians in the one holy catholic and 
                           apostolic Church.</div>`;
        }
    }
    continue;
}
```

**Filter logic:**
- `s.day` must contain `todayKeyShort` (e.g., `"February 22"`) — same matching used by BCP offices
- `s.tradition` must contain `'ethiopian'` or `'oriental'` (case-insensitive)
- Both conditions must be true

**Fallback intercession:** Rendered when no matching saints are found for the day. Names all six Oriental Orthodox churches by tradition.

**Preload requirement:** `appData.saints` must be loaded before the sequence loop executes. This is guaranteed by the saints preload block immediately before the loop in `renderOffice()`.

---

## BCP Isolation — Complete List

When `isEthiopianSaatat` is true, the following are suppressed:

| What | Where | How |
|---|---|---|
| Agpeya Opening | Pre-sequence | `if (!isEthiopianSaatat && toggle-agpeya-opening.checked)` |
| East Syriac Hours | Pre-sequence | `if (!isEthiopianSaatat && toggle-east-syriac-hours.checked)` |
| Marian Antiphon/Theotokion (before) | Pre-sequence | `if (!isEthiopianSaatat && marianElement !== 'none' && marianPos === 'before')` |
| Marian Antiphon/Theotokion (after) | Post-sequence | `if (!isEthiopianSaatat && marianElement !== 'none' && marianPos === 'after')` |
| Commemorations header text | Finalise DOM | Entire `date-header.innerText` assignment inside `if (!isEthiopianSaatat)` |
| `date-header` visibility | Finalise DOM | `date-header.style.display = 'none'` in else branch |
| `saint-display` BCP content | Finalise DOM | Entire `saint-display.innerHTML` assignment inside `if (!isEthiopianSaatat)` |
| `saint-display` cleared | Finalise DOM | `saint-display.innerHTML = ''` in else branch |
| Sidebar | `selectMode()` | `sidebar-toggle` and `settings-panel` hidden at mode entry |
| Settings panel | `selectMode()` | `settings-panel.style.display = 'none'` at mode entry |
| Main `<h1>` | `selectMode()` | `mainH1.style.display = 'none'` at mode entry |

---

## `window._forcedOfficeId` Pattern

The Ethiopian Sa'atat has no radio button in the sidebar (the sidebar is hidden). `renderOffice()` ordinarily reads the active office from `input[name="office-time"]:checked`, which would return `morning-office` by default.

To override this without adding a hidden radio or modifying the DOM, `selectMode('ethiopian-saatat')` sets:

```javascript
window._forcedOfficeId = 'ethiopian-saatat';
```

`renderOffice()` then reads:

```javascript
const officeId         = document.querySelector('input[name="office-time"]:checked')?.value || 'morning-office';
const resolvedOfficeId = window._forcedOfficeId || officeId;
```

All subsequent flags (`isMorning`, `isEvening`, `isCompline`, `isEthiopianSaatat`, `activeRubric`) and all conditional rendering blocks use `resolvedOfficeId`, not `officeId`.

**Important:** `window._forcedOfficeId` is currently not cleared in `backToSplash()`. This is safe because `selectMode('daily')` sets `resolvedOfficeId` correctly via the radio button and `_forcedOfficeId` is only consulted as a fallback when it is set. However, if future development adds the ability to navigate between modes without a full page reload, `backToSplash()` should clear it:

```javascript
window._forcedOfficeId = undefined;
document.body.classList.remove('ethiopian-theme');
```

---

## Theological Notes

These notes are provided to ensure accurate future liturgical expansion.

**Trisagion in the Sa'atat:** The Ethiopian Sa'atat traditionally begins each hour with the Trisagion ("Holy God, Holy Mighty, Holy Immortal, have mercy on us"). This is currently rendered via the BCP `comm-kyrie` (Lord's Prayer) at the end of the sequence. A dedicated `eth-trisagion` component and sequence position should be added in a future phase.

**Psalm appointments:** The psalms assigned per hour in this implementation follow the common Tewahedo office tradition. Some manuscripts differ; the appointments used here represent a standard received form.

**Anqaşa Birhān:** Translates literally as "Gate of Light." It is a Marian hymn sung at the close of each canonical watch in the Ethiopian tradition. The current implementation uses a single component for all hours; some hours traditionally use variant texts.

**The Lord's Prayer placement:** `comm-lords-prayer` is a shared common component. Its Ge'ez/Ethiopian form is "Abba, Abbatachin" — the current implementation uses the BCP English text. A future `eth-lords-prayer` component should provide the traditional Ethiopian form.

---

## Saints Data — Oriental Orthodox Coverage

Saints filtering relies on `data/saints/saints-{month}.json`. The current saints dataset was compiled primarily for BCP and Western traditions. Coverage of Ethiopian and Oriental Orthodox commemorations is limited.

The fallback intercession ensures that the slot always renders something meaningful regardless of saints data coverage. As Oriental Orthodox entries are added to the saints dataset, they will surface automatically provided their `tradition` field contains `'ethiopian'` or `'oriental'`.

**Expected `tradition` field values for match:**
- `"Ethiopian Orthodox Tewahedo"` ✅
- `"Oriental Orthodox"` ✅
- `"Coptic Orthodox"` ✅ (contains 'oriental' via 'Oriental Orthodox' if that field is used)
- `"Eastern Orthodox"` ❌ (does not contain 'ethiopian' or 'oriental')

---

## Validation Checklist

Before deploying changes to the Ethiopian Sa'atat:

- [ ] `components/traditions/ethiopian/rubrics.json` is valid JSON and contains `ethiopian-saatat` entry
- [ ] `components/ethiopian.json` is valid JSON and contains all 11 expected components
- [ ] All six `eth-*-hour-text` component IDs match those in `getEthiopianHourInfo()` hourMap
- [ ] `eth-anqasa-birhan` present in `components/ethiopian.json`
- [ ] `getEthiopianHourInfo()` hourMap covers all minutes 0–1439 without gaps
- [ ] Night watch covers both 21:00–24:00 and 00:00–06:00
- [ ] Saints preload block appears before the rubric sequence loop in `renderOffice()`
- [ ] `eth-saints-commemoration` slot does not attempt to render if `appData.saints` is null
- [ ] `window._forcedOfficeId` set to `'ethiopian-saatat'` in `selectMode()`
- [ ] `resolvedOfficeId` used (not `officeId`) for `activeRubric` lookup and all `isEthiopianSaatat` tests
- [ ] `#date-header` and `#saint-display` suppressed in finalise DOM block
- [ ] `.ethiopian-theme` class applied to `body` at mode entry
- [ ] No BCP ecumenical blocks fire when `isEthiopianSaatat` is true
- [ ] Console warning emitted if `eth-saatat-hour-slot` component not found

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| 7.1 | ✅ Complete | Entry point, Tuat hour, BCP isolation, resolvedOfficeId pattern |
| 7.2 | ✅ Complete | Meserkh and Liku hours; saints filter; Oriental fallback intercession |
| 7.3 | ✅ Complete | Full 24-hour cycle (Serkh, Nimeat, Lelit); saints preload fix; header guard |
| 7.4 | 📋 Planned | Ethiopian liturgical calendar: Ge'ez date display, Ethiopian fasting season detection (Tsome Nebiyat, Tsome Apostolat, Tsome Filseta, etc.) |
| 7.5 | 📋 Planned | Coptic Agpeya as standalone tradition entry (parallel architecture to Sa'atat) |
| 7.6 | 📋 Planned | Dedicated `eth-trisagion` and `eth-lords-prayer` components; hour-variant Anqaşa Birhān texts |
| 7.7 | 📋 Planned | Expanded Oriental Orthodox saints dataset (Synaxarium integration) |

---

## Credits

**Liturgical Source:** Ethiopian Orthodox Tewahedo Church Sa'atat (Book of Hours)  
**Translation Basis:** Standard English translations of the Tewahedo canonical hours  
**Application:** The Universal Office  

---

*For application entry point and mode selection see `INDEX_HTML_DOCUMENTATION.md`. For rendering engine see `OFFICE_UI_DOCUMENTATION.md`.*
