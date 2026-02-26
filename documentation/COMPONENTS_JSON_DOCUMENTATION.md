# COMPONENTS — PRODUCTION DOCUMENTATION

## Overview

Liturgical component text data for **The Universal Office** is stored across five shard files in `components/`. These files collectively form the liturgical text library — every static and semi-static text used in the Daily Office: collects, canticles, antiphons, versicles, creeds, prayers, absolutions, and opening sentences.

**Production Status:** ✅ OPERATIONAL  
**Last Updated:** February 22, 2026  
**Total Components:** 195 (across all shards)  
**Source:** 1979 Book of Common Prayer (The Episcopal Church), public domain  
**Loaded By:** `init()` in `office-ui.js` via `fetch('components/{shard}.json')`

> ⚠️ `data/components.json` is a **stale pre-modularization monolith**. It is not loaded by the application. All live data is in `components/*.json`.

---

## Shard Architecture

Components are split into five files by tradition. `init()` fetches each independently, parses, and concatenates into `appData.components`:

| File | Components | Types Covered |
|---|---|---|
| `components/common.json` | 5 | Lord's Prayer, Gloria Patri, Apostles' Creed, Nicene Creed, Kyrie |
| `components/anglican.json` | 179 | All BCP 1979 components: opening sentences, invitatories, antiphons, canticles, penitential rite, absolutions, suffrages, litany, collects (seasonal + propers + saints), mission prayers, general thanksgiving, Chrysostom, closing |
| `components/coptic.json` | 2 | Agpeya Opening, Theotokion |
| `components/ecumenical.json` | 9 | Angelus, Trisagion, Examen, Jesus Prayer, Prayer Before Reading, East Syriac Hours, Kyrie Pantocrator, Alma Redemptoris Mater, Ave Regina Caelorum |
| `components/ethiopian.json` | 0 | Reserved — file exists on disk but is currently empty |
| **Total** | **195** | |

---

## Critical Implementation Notes

### 1. Rite I vs. Rite II

Many components exist in two liturgical registers: **Rite I** (traditional, Elizabethan English) and **Rite II** (contemporary English). These are handled in two ways:

**Pattern A — Separate IDs:**  
Two distinct components share a conceptual function but carry separate IDs. The rubric sequence uses a `[rite]` placeholder that `renderOffice()` substitutes at runtime:

```json
{ "id": "bcp-confession-rite1", ... }
{ "id": "bcp-confession-rite2", ... }
```

```javascript
compId = item.replace('[rite]', rite);
// "bcp-confession-[rite]" → "bcp-confession-rite2"
```

**Pattern B — Single ID with object text:**  
One component holds both rite variants under a single ID, with `text` as an object keyed by rite:

```json
{
  "id": "comm-creed-apostles",
  "title": "The Apostles' Creed",
  "text": {
    "rite1": "I believe in God, the Father Almighty...",
    "rite2": "I believe in God, the Father almighty..."
  },
  "type": "Creed"
}
```

`renderOffice()` resolves this via the `resolveText(comp, rite)` helper:

```javascript
function resolveText(comp, rite) {
    const t = comp.text;
    if (typeof t === 'object' && t !== null) {
        return t[rite] || t['rite2'] || t['rite1'] || null;
    }
    return t || null;
}
```

**Parser Rule:** Always use `resolveText()` — never assume `comp.text` is a plain string. Object text is common across collects, creeds, canticles, and the penitential rite.

### 2. Collect Lookup from Daily Data

Collects are not embedded in the seasonal JSON files. The seasonal entry contains a `collect` field with an ID string (e.g., `"collect-lent-1"`). The renderer prefixes `bcp-` if not already present, then looks up in `appData.components`:

```javascript
let rawId = dailyData.collect || 'collect-default-ferial';
let cId = rawId.startsWith('bcp-') ? rawId : 'bcp-' + rawId;
const comp = appData.components.find(c => c.id === cId);
```

A manual ID map corrects known lectionary naming discrepancies before lookup:

| Lectionary `collect` Value | Resolved Component ID |
|---|---|
| `collect-transfiguration` | `bcp-collect-the-transfiguration-of-our-lord` |

If the resolved ID is not found, `console.warn` fires and "No collect appointed" is rendered.

### 3. Slot Resolution

Rubric sequence entries that are **slots** — abstract placeholders resolved at render time — each map to specific component IDs:

| Slot | Resolved Component ID |
|---|---|
| `bcp-confession-[rite]` | `bcp-confession-rite1` or `bcp-confession-rite2` |
| `bcp-absolution-slot` | `bcp-absolution-r1-priest`, `bcp-absolution-r2-lay`, etc. |
| `comm-creed-slot` | `comm-creed-apostles` or `comm-creed-nicene` |
| `bcp-suffrages-slot` | `bcp-suffrages-rite1` or `bcp-suffrages-rite2` |

> The creed slot in the rubric is `comm-creed-slot`. The resolved component IDs are `comm-creed-apostles` and `comm-creed-nicene` — both in `components/common.json`. The stale IDs `bcp-creed-apostles` / `bcp-creed-nicene` exist only in the obsolete `data/components.json` monolith.

### 4. Display Label Override

The `title` field in many components contains parenthetical metadata useful for data management but inappropriate for liturgical display (e.g., `"Prayer for Forgiveness (Rite II, Lay)"`). `renderOffice()` overrides these in a `DISPLAY_LABELS` map before rendering — the JSON data is never modified. See `OFFICE_UI_DOCUMENTATION.md` for the full map.

---

## Schema

Every component has the following structure:

### Standard Component (plain text)
```json
{
  "id": "bcp-venite",
  "title": "Venite",
  "text": "O come, let us sing unto the Lord...",
  "type": "Canticle"
}
```

### Rite-Aware Component (object text)
```json
{
  "id": "comm-creed-apostles",
  "title": "The Apostles' Creed",
  "text": {
    "rite1": "I believe in God, the Father Almighty...",
    "rite2": "I believe in God, the Father almighty..."
  },
  "type": "Creed"
}
```

### Fields

| Field | Required | Notes |
|---|---|---|
| `id` | ✅ | Unique string key. Naming convention: `{tradition}-{name}[-{variant}]` |
| `title` | ✅ | Human-readable name. May include parenthetical metadata — see Display Label Override above |
| `text` | ✅ | Either a plain string or a `{ rite1, rite2 }` object |
| `type` | ✅ | Category string (see Component Inventory below) |

---

## Component Inventory by Shard

### `components/common.json` — 5 components

Ecumenical liturgical standards shared across all rites and traditions.

| ID | Title | Type |
|---|---|---|
| `comm-lords-prayer` | The Lord's Prayer | Prayer |
| `comm-gloria-patri` | Gloria Patri | Doxology |
| `comm-creed-apostles` | The Apostles' Creed | Creed |
| `comm-creed-nicene` | The Nicene Creed | Creed |
| `comm-kyrie` | Kyrie | Versicle |

All five have `{ rite1, rite2 }` object text.

### `components/anglican.json` — 179 components

All BCP 1979 content. Type breakdown:

| Type | Count | Examples |
|---|---|---|
| Collect | 133 | Seasonal, proper, sanctoral collects through 2026 |
| Antiphon | 12 | Seasonal antiphons (`bcp-ant-{season}`) + Marian antiphons |
| Opening | 8 | `bcp-opening-{season}` + `bcp-opening-general`, `bcp-opening-evening` |
| Canticle | 8 | Te Deum, Benedictus, Magnificat, Nunc Dimittis, Venite, Jubilate, Pascha Nostrum, Phos Hilaron |
| Versicle | 7 | Invitatories, salutation, suffrages, versicles |
| Absolution | 4 | `bcp-absolution-r{1|2}-{priest|lay}` |
| Penitential | 2 | `bcp-confession-rite1`, `bcp-confession-rite2` |
| Prayer | 3 | Mission prayer, General Thanksgiving, Prayer of St. Chrysostom |
| Litany | 1 | `bcp-litany` |
| Closing | 1 | `bcp-closing` |

### `components/coptic.json` — 2 components

| ID | Title | Type |
|---|---|---|
| `cop-agpeya-opening` | Agpeya Opening | Hymn |
| `cop-theotokion` | Theotokion | Hymn |

Both are single-rite plain text. A seasonal variant lookup is attempted first (`cop-theotokion-{season}`) with `cop-theotokion` as fallback.

### `components/ecumenical.json` — 9 components

| ID | Title | Type |
|---|---|---|
| `ecu-angelus` | The Angelus | Antiphon |
| `ecu-trisagion` | Trisagion | Prayer |
| `ecu-examen` | The Examen | Prayer |
| `ecu-jesus-prayer` | Jesus Prayer | Prayer |
| `ecu-prayer-before-reading` | Prayer Before Reading | Versicle |
| `ecu-east-syriac-hours` | Prayer of the Hours | Hymn |
| `ecu-kyrie-pantocrator` | Kyrie Pantocrator | Antiphon |
| `ecu-alma-redemptoris` | Alma Redemptoris Mater | Antiphon |
| `ecu-ave-regina` | Ave Regina Caelorum | Antiphon |

### `components/ethiopian.json` — 0 components

File exists on disk and is fetched by `init()`, but is currently empty. The loader checks `text.trim()` before calling `JSON.parse()` and skips gracefully. Populating this file with Ethiopian/Eritrean liturgical content will be picked up automatically on next page load — no code changes required.

---

## Key Component IDs Referenced Directly by `office-ui.js`

| Component ID | Purpose | Shard |
|---|---|---|
| `bcp-opening-{season}` | Seasonal opening sentence | anglican |
| `bcp-opening-general` | Opening sentence fallback | anglican |
| `bcp-invitatory-full-mp` | Morning Prayer invitatory | anglican |
| `bcp-invitatory-full-ep-noon-compline` | EP/Noonday/Compline invitatory | anglican |
| `bcp-venite` | Ordinary season invitatory canticle | anglican |
| `bcp-jubilate` | Lent invitatory canticle | anglican |
| `bcp-pascha-nostrum` | Easter invitatory canticle | anglican |
| `bcp-confession-rite1` / `bcp-confession-rite2` | Penitential rite | anglican |
| `bcp-absolution-r{1\|2}-{priest\|lay}` | Absolution (4 variants) | anglican |
| `bcp-te-deum` | Canticle 1 — Morning Prayer | anglican |
| `bcp-benedictus` | Canticle 2 — Morning Prayer | anglican |
| `bcp-magnificat` | Canticle 1 — Evening Prayer | anglican |
| `bcp-nunc-dimittis` | Canticle 2 — Evening Prayer / Compline | anglican |
| `bcp-phos-hilaron` | Evening Prayer hymn | anglican |
| `bcp-salutation` | Versicle before prayers | anglican |
| `bcp-suffrages-rite1` / `bcp-suffrages-rite2` | Suffrages | anglican |
| `bcp-litany` | The Great Litany | anglican |
| `bcp-collect-grace` | Weekday collect fallback — Morning | anglican |
| `bcp-collect-peace` | Weekday collect fallback — Evening | anglican |
| `bcp-mission-prayer-1` | Fixed mission prayer | anglican |
| `bcp-general-thanksgiving` | General Thanksgiving | anglican |
| `bcp-chrysostom` | Prayer of St. Chrysostom | anglican |
| `bcp-closing` | Closing blessing | anglican |
| `bcp-marian-antiphon-{season}` | Seasonal Marian antiphon | anglican |
| `bcp-marian-antiphon-ordinary` | Marian antiphon fallback | anglican |
| `comm-lords-prayer` | Lord's Prayer | common |
| `comm-gloria-patri` | Gloria Patri | common |
| `comm-creed-apostles` | Apostles' Creed | common |
| `comm-creed-nicene` | Nicene Creed | common |
| `comm-kyrie` | Kyrie | common |
| `cop-agpeya-opening` | Agpeya Opening | coptic |
| `cop-theotokion` | Theotokion | coptic |
| `ecu-angelus` | The Angelus | ecumenical |
| `ecu-trisagion` | Trisagion | ecumenical |
| `ecu-examen` | The Ignatian Examen | ecumenical |
| `ecu-prayer-before-reading` | Prayer Before Reading | ecumenical |
| `ecu-east-syriac-hours` | East Syriac Prayer of the Hours | ecumenical |
| `ecu-kyrie-pantocrator` | Kyrie Pantocrator | ecumenical |

---

## Adding New Components

1. Add the entry to the appropriate shard file under `components/`
2. Use the tradition prefix: `bcp-`, `comm-`, `cop-`, `ecu-`
3. If the component title contains parenthetical metadata, add a `DISPLAY_LABELS` entry in `office-ui.js` — do not alter the title in the JSON
4. If the component has rite variants, use `{ "rite1": "...", "rite2": "..." }` object text
5. Verify `resolveText()` handles the component correctly before wiring it into a rubric sequence

---

*For rendering logic that consumes these components see `OFFICE_UI_DOCUMENTATION.md`. For rubric sequences that reference component IDs see `data/rubrics.json` and `OFFICE_UI_DOCUMENTATION.md`.*
