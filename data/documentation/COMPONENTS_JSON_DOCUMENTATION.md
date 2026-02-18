# COMPONENTS.JSON - PRODUCTION DOCUMENTATION

## Overview

This file is the **liturgical text library** for The Universal Office. It stores every static and semi-static text component used in the Daily Office — collects, canticles, antiphons, versicles, creeds, prayers, absolutions, and opening sentences. The rendering engine (`index.html`) looks up components by their `id` field to assemble the office output.

**Production Status:** ✅ FULLY POPULATED  
**Last Updated:** February 17, 2026  
**Total Components:** 224  
**Source:** 1979 Book of Common Prayer (The Episcopal Church), public domain  
**Loaded By:** `init()` in index.html via `fetch('data/components.json')`

---

## Critical Implementation Notes

### 1. Rite I vs. Rite II

Many components exist in two liturgical registers: **Rite I** (traditional, Elizabethan English) and **Rite II** (contemporary English). These are handled in two ways:

**Pattern A — Separate IDs:**  
Two distinct components share a conceptual function but have separate IDs:
```json
{ "id": "bcp-confession-rite1", ... }
{ "id": "bcp-confession-rite2", ... }
```
The rubric uses a `[rite]` placeholder that `renderOffice()` substitutes at runtime:
```javascript
compId = item.replace('[rite]', rite);
// "bcp-confession-[rite]" → "bcp-confession-rite2"
```

**Pattern B — Single ID with Object Text:**  
One component holds both rite variants under a single ID, with `text` as an object:
```json
{
  "id": "collect-advent-1",
  "text": {
    "rite1": "Almighty God, give us grace...(traditional)",
    "rite2": "Almighty God, give us grace...(contemporary)"
  }
}
```
`renderOffice()` resolves this as:
```javascript
comp.text[rite] || comp.text['rite2'] || comp.text['rite1'] || comp.text
```

**Parser Rule:** Always check whether `text` is a string or an object before rendering. Never assume it is a plain string.

### 2. Collect Lookup from Daily Data

Collects are not embedded in the seasonal JSON files. Instead, the seasonal entry contains a `collect` field with an ID string (e.g., `"collect-advent-1"`). The renderer looks this up in `components.json` at runtime:

```javascript
const collectComp = appData.components.find(c => c.id === dailyData.collect);
```

If the collect ID is not found, nothing is rendered and a console warning fires. All 224 components include every collect ID referenced by the seasonal JSON files through 2026.

### 3. Slot Resolution

Some rubric sequence entries are **slots** — abstract placeholders resolved at render time rather than direct component IDs. The renderer in `index.html` handles these before the component lookup:

| Slot | Resolution |
|---|---|
| `bcp-absolution-slot` | `bcp-absolution-r1-priest`, `bcp-absolution-r2-lay`, etc. |
| `bcp-creed-slot` | `bcp-creed-apostles` or `bcp-creed-nicene` (user setting) |
| `bcp-suffrages-slot` | `bcp-suffrages-rite1` or `bcp-suffrages-rite2` (skipped if toggle off) |

---

## Schema

Every component has the following structure:

### Standard Component (plain text)
```json
{
  "id": "bcp-venite",
  "title": "Venite",
  "text": "Come, let us sing to the Lord...",
  "type": "Canticle"
}
```

### Rite-Aware Component (object text)
```json
{
  "id": "collect-advent-1",
  "title": "First Sunday of Advent",
  "text": {
    "rite1": "Almighty God, give us grace that we may cast away...",
    "rite2": "Almighty God, give us grace to cast away..."
  },
  "type": "Collect"
}
```

### Untyped Component
Five components have no `type` field (type resolves to `undefined`). These are tradition-specific devotional additions:
- `angelus`
- `jesus-prayer`
- `assyrian-blessing`
- `agpeya-opening`
- `collect-jan24-florence-li-tim-oi`

These are not BCP components and are clearly marked as optional devotional enhancements.

---

## Component Inventory by Type

### Summary

| Type | Count |
|---|---|
| Collect | 159 |
| Antiphon | 19 |
| Opening | 8 |
| Versicle | 8 |
| Canticle | 8 |
| Absolution | 4 |
| Prayer | 4 |
| Hymn | 2 |
| Creed | 2 |
| Penitential | 2 |
| Litany | 1 |
| Doxology | 1 |
| Closing | 1 |
| *(untyped)* | 5 |
| **Total** | **224** |

---

## Type Reference

### Antiphon (19)

Invitatory antiphons displayed before the Psalms of the Day. Split into two groups:

**Seasonal Invitatory Antiphons (9)** — Selected by season string from `getSeasonAndFile()`:

| ID | Season | Text (opening) |
|---|---|---|
| `ant-advent` | advent | "Our King and Savior now draws near..." |
| `ant-christmas` | christmas | "Alleluia, to us a child is born..." |
| `ant-epiphany` | epiphany | "The Lord has shown forth his glory..." |
| `ant-lent` | lent | "The Lord is full of compassion and mercy..." |
| `ant-easter` | easter | "Alleluia. The Lord is risen indeed..." |
| `ant-ascension` | — | "Alleluia. Christ the Lord has ascended..." |
| `ant-pentecost` | — | "Alleluia. The Spirit of the Lord renews..." |
| `ant-trinity` | — | "Father, Son, and Holy Spirit, one God..." |
| `ant-default` | ordinary | "The earth is the Lord's for he made it..." |

⚠️ **Note:** `ant-ascension`, `ant-pentecost`, and `ant-trinity` appear twice in the inventory (duplicated IDs). This is a data integrity issue. The parser will use the first occurrence found. These should be deduplicated in a future cleanup pass.

**Marian Antiphons (6) + Latin variant (1):**  
Seasonal Marian antiphons are selected by `bcp-marian-antiphon-${season}`:

| ID | Season |
|---|---|
| `bcp-marian-antiphon-advent` | advent |
| `bcp-marian-antiphon-christmas` | christmas |
| `bcp-marian-antiphon-epiphany` | epiphany |
| `bcp-marian-antiphon-lent` | lent |
| `bcp-marian-antiphon-easter` | easter |
| `bcp-marian-antiphon-ordinary` | ordinary |
| `latin-marian-alma` | — (Latin, tradition devotion) |

Marian antiphons use **Pattern B** (rite-aware object text) for Rite I/Rite II variants.

---

### Opening (8)

Seasonal and general opening sentences displayed at the start of the office. Selected by `bcp-opening-${season}` with fallback to `bcp-opening-general`:

| ID | Used For |
|---|---|
| `bcp-opening-advent` | Advent season |
| `bcp-opening-lent` | Lent season |
| `bcp-opening-easter` | Easter season |
| `bcp-opening-general` | Ordinary Time, Epiphany, fallback |
| `bcp-opening-evening` | Evening Prayer (any season) |
| `bcp-opening-blessing-compline` | Compline opening blessing |
| `bcp-opening-1` | Alternative general opening |
| `bcp-opening-rite1` | Rite I traditional opening ("The Lord is in his holy temple...") |

Opening components use **Pattern B** (rite-aware object text).

---

### Versicle (8)

Short call-and-response exchanges between officiant and people:

| ID | Purpose |
|---|---|
| `bcp-invitatory` | "Lord, open our lips / And our mouth shall proclaim your praise." |
| `bcp-invitatory-full-mp` | Full invitatory text for Morning Prayer (rite-aware) |
| `bcp-invitatory-full-ep-noon-compline` | Full invitatory for EP / Noonday / Compline (rite-aware) |
| `bcp-suffrages-rite1` | Rite I suffrages (V. and R. exchanges) |
| `bcp-suffrages-rite2` | Rite II suffrages |
| `bcp-kyrie` | "Lord, have mercy / Christ, have mercy / Lord, have mercy" |
| `bcp-salutation` | "The Lord be with you / And also with you" |
| `bcp-versicles-before-prayers-compline` | Compline versicles before the collect |

---

### Canticle (8)

Major liturgical songs of the office:

| ID | Name | Usage |
|---|---|---|
| `bcp-venite` | Venite (Psalm 95) | Morning Prayer Invitatory |
| `bcp-jubilate` | Jubilate (Psalm 100) | Morning Prayer alternate Invitatory |
| `bcp-phos-hilaron` | Phos Hilaron | Evening Prayer lamp-lighting hymn |
| `bcp-te-deum` | Te Deum Laudamus | Morning Prayer canticle |
| `bcp-benedictus-es` | Benedictus es, Domine | Song of the Three Young Men |
| `bcp-benedictus` | Benedictus (Song of Zechariah) | Morning Prayer canticle |
| `bcp-magnificat` | Magnificat (Song of Mary) | Evening Prayer canticle |
| `bcp-nunc-dimittis` | Nunc Dimittis (Song of Simeon) | Compline / Evening Prayer canticle |

---

### Absolution (4)

Absolution pronouncements, varying by rite and minister:

| ID | Rite | Minister |
|---|---|---|
| `bcp-absolution-r1-priest` | Rite I | Priest |
| `bcp-absolution-r1-lay` | Rite I | Lay reader |
| `bcp-absolution-r2-priest` | Rite II | Priest |
| `bcp-absolution-r2-lay` | Rite II | Lay reader |

Selected via `bcp-absolution-slot` resolution in `renderOffice()`.

---

### Penitential (2)

General Confessions of Sin:

| ID | Rite |
|---|---|
| `bcp-confession-rite1` | Rite I (traditional) |
| `bcp-confession-rite2` | Rite II (contemporary) |

---

### Creed (2)

| ID | Name |
|---|---|
| `bcp-creed-apostles` | Apostles' Creed |
| `bcp-creed-nicene` | Nicene Creed |

Selected via `bcp-creed-slot` resolution based on user's `creed-type` setting.

---

### Prayer (4)

| ID | Name | Usage |
|---|---|---|
| `bcp-lords-prayer` | The Lord's Prayer | All offices |
| `bcp-mission-prayer-1` | A Prayer for Mission | Morning / Evening Prayer |
| `bcp-general-thanksgiving` | General Thanksgiving | Optional (toggle) |
| `bcp-chrysostom` | Prayer of St. John Chrysostom | Optional (toggle) |

---

### Doxology (1)

| ID | Name |
|---|---|
| `bcp-gloria-patri` | Gloria Patri ("Glory be to the Father...") |

---

### Closing (1)

| ID | Purpose |
|---|---|
| `bcp-closing` | Closing versicle / dismissal |

---

### Litany (1)

| ID | Name |
|---|---|
| `bcp-litany` | The Great Litany (optional, toggle-controlled) |

---

### Hymn (2)

Non-BCP tradition hymns, available as optional devotions:

| ID | Tradition | Name |
|---|---|---|
| `trisagion-byzantine` | Eastern Orthodox | Trisagion ("Holy God, Holy and Mighty...") |
| `coptic-theotokion` | Coptic Orthodox | Theotokion (hymn to the Mother of God) |

---

## Collect Inventory

All 159 collects are organized by liturgical period. Collects use **Pattern B** (rite-aware object text) with `rite1` and `rite2` keys.

### Default

| ID | Usage |
|---|---|
| `collect-default-ferial` | Fallback for any unmatched weekday |

### Advent (5)

| ID | Usage |
|---|---|
| `collect-advent-1` | First Sunday of Advent |
| `collect-advent-2` | Second Sunday of Advent |
| `collect-advent-3` | Third Sunday of Advent (Gaudete) |
| `collect-advent-4` | Fourth Sunday of Advent |
| `collect-advent-ferial` | Advent weekdays |

### Christmas (2)

| ID | Usage |
|---|---|
| `collect-christmas` | Christmas Day and weekdays in Christmas octave |
| `collect-christmas-2` | Second Sunday after Christmas |

### Epiphany (10)

| ID | Usage |
|---|---|
| `collect-epiphany` | The Epiphany (January 6) |
| `collect-epiphany-1` | First Week after Epiphany |
| `collect-baptism-of-our-lord` | Baptism of Our Lord (First Sunday after Epiphany) |
| `collect-epiphany-2` through `collect-epiphany-6` | Sundays 2–6 after Epiphany |
| `collect-presentation` | The Presentation (February 2) |
| `collect-last-epiphany` | Last Sunday after Epiphany (Transfiguration) |
| `collect-transfiguration` | The Transfiguration (August 6) |

### Lent and Holy Week (12)

| ID | Usage |
|---|---|
| `collect-ash-wednesday` | Ash Wednesday |
| `collect-lent-ferial` | Lenten weekdays |
| `collect-lent-1` through `collect-lent-5` | Sundays 1–5 in Lent |
| `collect-palm-sunday` | Palm Sunday |
| `collect-holy-monday` | Monday in Holy Week |
| `collect-holy-tuesday` | Tuesday in Holy Week |
| `collect-holy-wednesday` | Wednesday in Holy Week |
| `collect-maundy-thursday` | Maundy Thursday |
| `collect-good-friday` | Good Friday |
| `collect-holy-saturday` | Holy Saturday |

### Easter (9)

| ID | Usage |
|---|---|
| `collect-easter-day` | Easter Day |
| `collect-easter-monday` | Easter Monday |
| `collect-easter-tuesday` | Easter Tuesday |
| `collect-easter-2` through `collect-easter-7` | Sundays 2–7 of Easter |
| `collect-ascension` | Ascension Day |
| `collect-pentecost` | Day of Pentecost |

⚠️ **Note:** `collect-easter-day` and `collect-easter-monday` each appear three times in the inventory (triplicated IDs). This is a data integrity issue — the parser uses the first occurrence. These should be deduplicated in a future cleanup pass.

### Ordinary Time — Numbered Sundays (29)

| ID | Usage |
|---|---|
| `collect-ordinary-1` through `collect-ordinary-29` | Sundays 1–29 in Ordinary Time |
| `collect-trinity` | Trinity Sunday |
| `collect-ordinary-ferial` | Ordinary Time weekdays |

### Ordinary Time — BCP Propers (27)

The BCP 1979 also refers to Ordinary Time Sundays by "Proper" number. Both naming conventions are supported:

| ID | Usage |
|---|---|
| `collect-proper-3` through `collect-proper-29` | Proper 3–29 (BCP Sunday naming) |

⚠️ **Note:** `collect-proper-13` through `collect-proper-29` each appear **twice** in the inventory (duplicated IDs). This is a known data integrity issue — the parser uses the first occurrence. These should be deduplicated in a future cleanup pass.

### Fixed Feasts — Sanctoral (37)

Collects for fixed feasts of saints and major observances:

| ID | Feast | Date |
|---|---|---|
| `collect-holy-name` | The Holy Name of Our Lord | January 1 |
| `collect-st-paul-conversion` | Conversion of St. Paul | January 25 |
| `collect-st-peter-confession` | Confession of St. Peter | January 18 |
| `collect-presentation` | The Presentation | February 2 |
| `collect-st-joseph` | Saint Joseph | March 19 |
| `collect-annunciation` | The Annunciation | March 25 |
| `collect-st-mark` | Saint Mark | April 25 |
| `collect-philip-james` | SS Philip and James | May 1 |
| `collect-nativity-john-baptist` | Nativity of John the Baptist | June 24 |
| `collect-peter-paul` | SS Peter and Paul | June 29 |
| `collect-mary-magdalene` | Saint Mary Magdalene | July 22 |
| `collect-james-apostle` | Saint James the Apostle | July 25 |
| `collect-transfiguration` | The Transfiguration | August 6 |
| `collect-mary-virgin` | The Virgin Mary | August 15 |
| `collect-bartholomew` | Saint Bartholomew | August 24 |
| `collect-holy-cross` | Holy Cross Day | September 14 |
| `collect-matthew` | Saint Matthew | September 21 |
| `collect-michael-all-angels` | Michael and All Angels | September 29 |
| `collect-luke` | Saint Luke | October 18 |
| `collect-james-jerusalem` | James of Jerusalem | October 23 |
| `collect-simon-jude` | SS Simon and Jude | October 28 |
| `collect-all-saints` | All Saints' Day | November 1 |
| `collect-st-andrew` | Saint Andrew | November 30 |
| `collect-st-thomas` | Saint Thomas | December 21 |
| `collect-st-stephen` | Saint Stephen | December 26 |
| `collect-st-john` | Saint John the Evangelist | December 27 |
| `collect-holy-innocents` | The Holy Innocents | December 28 |

### Daily Office Collects (3)

| ID | Usage |
|---|---|
| `bcp-collect-grace` | Collect for Grace (Morning Prayer closing) |
| `bcp-collect-peace` | Collect for Peace (Evening Prayer closing) |
| `bcp-collect-compline-1` | Compline collect |

### January Saints (6)

| ID | Usage |
|---|---|
| `collect-jan19-epiphany-week2` | January 19 |
| `collect-jan20-fabian` | Saint Fabian (January 20) |
| `collect-jan21-agnes` | Saint Agnes (January 21) |
| `collect-jan22-vincent` | Saint Vincent (January 22) |
| `collect-jan23-phillips-brooks` | Phillips Brooks (January 23) |
| `collect-jan25-conversion-paul` | Conversion of Paul (January 25, duplicate path) |
| `collect-january-27` | January 27 |
| `collect-epiphany-6-thursday` | Thursday in Epiphany Week 6 |
| `collect-jan24-florence-li-tim-oi` | Florence Li Tim-Oi (January 24) — untyped |

---

## Data Integrity Issues (Known)

The following duplicate IDs exist in the current file. The JSON array remains valid (arrays allow duplicate object content), but `Array.find()` will always return the **first** occurrence, silently ignoring the duplicates.

| Duplicate ID | Count | Action Required |
|---|---|---|
| `ant-ascension` | 2 | Deduplicate — keep first |
| `ant-pentecost` | 2 | Deduplicate — keep first |
| `ant-trinity` | 2 | Deduplicate — keep first |
| `collect-easter-day` | 3 | Deduplicate — keep first, verify text matches |
| `collect-easter-monday` | 3 | Deduplicate — keep first, verify text matches |
| `collect-proper-13` through `collect-proper-29` | 2 each | Deduplicate — keep first, verify text matches |

**Impact:** None currently — all duplicates are functionally identical to their first occurrence. The app renders correctly. However, the file is unnecessarily large and should be cleaned.

---

## Validation Checklist

Before deploying changes to components.json:

- [ ] JSON is valid (no trailing commas, properly closed brackets)
- [ ] All `collect-*` IDs referenced in seasonal JSON files resolve to an entry here
- [ ] All rite-aware components have both `rite1` and `rite2` keys in their `text` object
- [ ] No new duplicate IDs introduced
- [ ] `type` field present on all BCP components
- [ ] Text field is never `null` — use `""` for intentionally empty components

---

## Integration Notes

### Loading

`components.json` is loaded once during `init()` and stored in `appData.components`:
```javascript
const [compRes, rubRes] = await Promise.all([
    fetch('data/components.json'),
    fetch('data/rubrics.json')
]);
appData.components = await compRes.json();
```

### Lookup Pattern

```javascript
// By exact ID
const comp = appData.components.find(c => c.id === targetId);

// Rite-aware text extraction
const text = (typeof comp.text === 'object')
    ? (comp.text[rite] || comp.text['rite2'] || comp.text['rite1'])
    : comp.text;
```

### Adding New Components

1. Add the JSON object to the array (position does not matter — lookup is by `id`)
2. Assign a unique `id` following existing naming conventions
3. Set the `type` field to one of the established types
4. For rite-aware text, use the `{ "rite1": "...", "rite2": "..." }` object pattern
5. If the component is referenced from a seasonal JSON `collect` field, verify the ID matches exactly

---

## Naming Conventions

| Prefix | Type | Example |
|---|---|---|
| `bcp-` | Core BCP liturgical element | `bcp-venite`, `bcp-confession-rite2` |
| `collect-` | Any collect | `collect-advent-1`, `collect-proper-12` |
| `ant-` | Invitatory antiphon | `ant-advent`, `ant-default` |
| `bcp-marian-antiphon-` | Seasonal Marian antiphon | `bcp-marian-antiphon-lent` |
| `latin-` | Latin-language text | `latin-marian-alma` |
| `trisagion-` | Eastern trisagion | `trisagion-byzantine` |
| `coptic-` | Coptic tradition element | `coptic-theotokion` |

---

## Maintenance Notes

### Annual Updates

No annual updates required for the core BCP components. Fixed feast collects are perpetual. If new saints are added to the sanctoral calendar, add new `collect-*` entries following the pattern of existing feast day collects.

### Adding a New Feast Day Collect

1. Identify the feast day date and verify the collect text from the BCP or LFF
2. Create a new entry with both `rite1` and `rite2` texts
3. Use the naming convention `collect-[saint-name]` (lowercase, hyphens)
4. Add the corresponding `"collect": "collect-[saint-name]"` field to the saints' JSON entry
5. Verify in the app that no "Collect ID not found" warning appears for that date

---

## Credits and Licensing

**Source Text:** 1979 Book of Common Prayer (The Episcopal Church)  
**Public Domain Status:** The 1979 BCP text is in the public domain in the United States  
**Data Compilation:** Claude (Anthropic AI) with liturgical expertise consultation  
**Component Count:** 224 (199 original + 25 feast day collects added February 17, 2026)

**Usage Rights:** This file may be freely used in liturgical apps, church websites, and Daily Office software. Attribution appreciated but not required.

**Disclaimer:** While every effort has been made to ensure accuracy of liturgical texts, users should verify critical texts against a printed 1979 BCP for authoritative reference.

---

**END OF DOCUMENTATION**

*This file is the text library only. For how components are assembled into an office, see INDEX_HTML_DOCUMENTATION.md. For seasonal collect IDs, see the relevant seasonal documentation (LENT_DOCUMENTATION.md, EASTER_DOCUMENTATION.md, etc.).*
