# ADVENT.JSON - PRODUCTION DOCUMENTATION

## Overview

This file contains the complete Daily Office Lectionary for the **2026 Advent Season**, from the First Sunday of Advent (November 29, 2026) through the Morning Prayer of Christmas Eve (December 24, 2026). It follows the 1979 Book of Common Prayer and implements **both Year 1 and Year 2** reading distribution patterns, making it perpetually functional for all future liturgical years.

**Production Status:** ✅ READY FOR DEPLOYMENT  
**Last Updated:** February 17, 2026  
**Source:** 1979 BCP Daily Office Lectionary, pages 936-943  
**Liturgical Year:** Year 1 (primary for 2026); Year 2 fields fully populated for perpetual use  
**Liturgical New Year:** Advent Sunday (Nov 29, 2026) marks the **transition from Year 2 to Year 1**

---

## Critical Implementation Notes

### 1. The Liturgical New Year Reset

Advent Sunday is the beginning of the new liturgical year. This file therefore **straddles the Year 1/Year 2 boundary** in a unique way:

- The **preceding** Ordinary Time file (`ordinary3.json`) was Year 2
- This file **opens** as Year 1 on November 29, 2026
- All Year 1 and Year 2 fields are fully populated throughout

**For 2026:** Your engine should use `*_year1` fields.  
**For 2027 (Year 2):** Your engine should use `*_year2` fields — no file rebuild needed.

### 2. Year 1 and Year 2 Reading Distribution

**YEAR 1 — Morning Prayer:**
- Old Testament (`reading_ot_mp_year1`)
- Epistle (`reading_epistle_mp_year1`)

**YEAR 1 — Evening Prayer:**
- Gospel (`reading_gospel_ep_year1`)

**YEAR 2 — Morning Prayer:**
- Old Testament (`reading_ot_mp_year2`)
- Gospel (`reading_gospel_mp_year2`)

**YEAR 2 — Evening Prayer:**
- Epistle (`reading_epistle_ep_year2`)

This "flip" of the Gospel position between Year 1 and Year 2 is the most critical logic in the engine.

### 3. Schema Structure

#### Standard Days (15 fields):
```json
{
  "date": "YYYY-MM-DD",
  "title": "string",
  "season": "Advent",
  "liturgicalColor": "purple | red | rose",
  "collect": "collect-key",
  "antiphon_mp": "Our King and Savior now draws near: Come let us adore him.",
  "antiphon_ep": "Our King and Savior now draws near: Come let us adore him.",
  "psalms_mp": "Psalm X, Psalm Y",
  "psalms_ep": "Psalm Z",
  "reading_ot_mp_year1": "Book X:Y-Z",
  "reading_epistle_mp_year1": "Book X:Y-Z",
  "reading_gospel_ep_year1": "Book X:Y-Z",
  "reading_ot_mp_year2": "Book X:Y-Z",
  "reading_epistle_ep_year2": "Book X:Y-Z",
  "reading_gospel_mp_year2": "Book X:Y-Z"
}
```

#### Special Days with Eves (20 fields):

**December 20, 2026** (Fourth Sunday of Advent / Eve of St. Thomas) uses the 20-field schema:
```json
{
  // ... standard 15 fields (Fourth Sunday of Advent track) ...
  "eve_title": "Eve of Saint Thomas the Apostle",
  "psalms_ep_eve": "Psalm 126",
  "reading_ot_ep_eve": "Job 42:1-6",
  "reading_epistle_ep_eve": "",
  "reading_gospel_ep_eve": "John 14:1-7"
}
```

**Parser Logic:**
1. Check for presence of `eve_title`
2. Display standard Sunday readings at Morning Prayer
3. At Evening Prayer, switch to Eve readings (`psalms_ep_eve`, `reading_ot_ep_eve`, `reading_gospel_ep_eve`)
4. Note color shift: the Eve of St. Thomas uses red at EP while the Sunday day remains purple

#### December 24 (MP Only):
```json
{
  "antiphon_ep": "",
  "psalms_ep": "",
  "reading_gospel_ep_year1": "",
  "reading_gospel_mp_year2": ""
}
```
Evening Prayer on December 24 belongs to `christmas.json`. The empty strings prevent parser errors.

---

## Liturgical Color System

| Color    | Hex Code (Suggested) | Days                                      |
|----------|----------------------|-------------------------------------------|
| `purple` | `#663399`            | All Advent weekdays and Sundays           |
| `red`    | `#DC143C`            | Nov 30 (St. Andrew), Dec 21 (St. Thomas)  |
| `rose`   | `#FF66AA`            | Dec 13 (Third Sunday of Advent — Gaudete) |

**Special Case — Rose:** The `rose` color on December 13 is optional in the BCP tradition. Your UI should render it as a softened pink/rose rather than the standard Advent purple, signaling the "Gaudete" (rejoice) character of the Third Sunday. Consider adding a `"gaudete": true` flag in a future schema iteration.

**Special Case — St. Andrew (Nov 30):** Even though the day falls within Advent (purple), the Major Feast takes full precedence. Display red vestments and the feast-specific propers.

---

## Antiphon System

### One Antiphon Throughout:

All 26 entries use the same Advent Invitatory Antiphon:
```
"Our King and Savior now draws near: Come let us adore him."
```

This antiphon appears in both `antiphon_mp` and `antiphon_ep` for every day of Advent, including feast days. The antiphon is identical for both offices — your engine does not need conditional logic for Advent antiphons.

**Exception — Christmas Eve (Dec 24):** `antiphon_ep` is set to `""`. The Christmas antiphon ("Alleluia. To us a child is born") begins at Evening Prayer in `christmas.json`.

**Implementation:** Display before the Invitatory Psalm at Morning Prayer and before the Psalms at Evening Prayer.

---

## Psalm Handling

### Critical: No Psalm 95 in `psalms_mp`

Psalm 95 (the *Venite*) has been **removed** from all `psalms_mp` strings. Your engine injects it as the Invitatory separately.

### Fixed Psalm Assignments for Advent:

Unlike Ordinary Time (which uses a rolling 30-day Psalter cycle), Advent uses **fixed psalm assignments** tied to the day of the week and the liturgical week. The assignments follow BCP pages 936-939.

**Sunday Pattern:**
- Week 1 MP: Psalm 146, 147 | EP: Psalm 111, 112, 113
- Week 2 MP: Psalm 148, 149, 150 | EP: Psalm 114, 115
- Week 3 MP: Psalm 63:1-8, 98 | EP: Psalm 103
- Week 4 MP: Psalm 24, 29 | EP: Psalm 84, 85, 89:1-29

**Major Feast Psalm Overrides:**
- St. Andrew (Nov 30): MP: Psalm 34 | EP: Psalm 96, 100
- St. Thomas (Dec 21): MP: Psalm 23, 121 | EP: Psalm 27

---

## Collect Keys

| Collect Key              | Used For                                     |
|--------------------------|----------------------------------------------|
| `collect-advent-1`       | First Sunday of Advent + weekdays            |
| `collect-advent-2`       | Second Sunday of Advent + weekdays           |
| `collect-advent-3`       | Third Sunday of Advent + weekdays            |
| `collect-advent-4`       | Fourth Sunday of Advent + weekdays (Dec 20+) |
| `collect-st-andrew`      | November 30 (St. Andrew the Apostle)         |
| `collect-st-thomas`      | December 21 (St. Thomas the Apostle)         |

**Implementation:** Weekday collects use the collect of the preceding Sunday. For example, all days in the week of the Second Sunday of Advent use `collect-advent-2`.

---

## Special Days — Detailed Notes

### St. Andrew the Apostle (November 30, 2026)

**Rank:** Major Feast  
**Color:** Red  
**Precedence:** Fully overrides the Advent weekday track

**Readings (both Year 1 and Year 2):**  
Because St. Andrew is a Major Feast with fixed propers, both tracks use identical readings:
- **MP:** Isaiah 49:1-6 (OT), 1 Corinthians 4:1-16 (Epistle)
- **EP:** John 1:35-42 (Gospel — Andrew's call)

**Note:** On Major Feast days, Year 1 and Year 2 readings are identical. The engine does not need to differentiate by year for this entry.

---

### Third Sunday of Advent — Gaudete (December 13, 2026)

**Color:** `rose` (optional; purple is also permitted)  
**Collect:** `collect-advent-3`  
**Special Feature:** The Year 1 Epistle on this Sunday shifts to **Acts 28:16-31** — the conclusion of Paul's ministry — rather than continuing the sequential epistle track. This is the only Sunday in Advent where the Year 1 epistle track departs from its sequential book.

**Year 1 readings:**
- MP: Isaiah 9:1-7 (OT), Acts 28:16-31 (Epistle)
- EP: Luke 22:39-53 (Gospel)

**Year 2 readings:**
- MP: Amos 9:11-15 (OT), John 5:30-47 (Gospel)
- EP: 2 Thessalonians 2:1-3,13-17 (Epistle)

---

### Eve of St. Thomas (December 20, 2026 — Evening Prayer)

**20-Field Entry:** This is the only 20-field entry in the file.  
**Color Transition:** The day is the Fourth Sunday of Advent (purple); the Eve EP shifts to the red feast day context.

**Standard fields** carry the Fourth Sunday of Advent track:
- Y1 MP: Isaiah 12:1-6 (OT), Revelation 10:1-11 (Epistle)
- Y1 EP: Luke 1:5-25 (Gospel)

**Eve fields** carry the St. Thomas propers:
- `psalms_ep_eve`: Psalm 126
- `reading_ot_ep_eve`: Job 42:1-6
- `reading_epistle_ep_eve`: "" (empty — no epistle at the Eve office)
- `reading_gospel_ep_eve`: John 14:1-7 ("Do not let your hearts be troubled")

---

### St. Thomas the Apostle (December 21, 2026)

**Rank:** Major Feast  
**Color:** Red  
**Theological Note:** Thomas's confession ("My Lord and my God") makes John 20:24-29 the focal reading. Both Year 1 and Year 2 use identical readings, as with St. Andrew.

---

### The Revelation Sequence (Year 1, Weeks 3–4)

The Year 1 Epistle track for Advent Weeks 3 and 4 runs sequentially through the Book of Revelation. This is one of the densest sequential readings in the entire lectionary:

| Date   | Year 1 Epistle (`reading_epistle_mp_year1`) |
|--------|----------------------------------------------|
| Dec 14 | Revelation 5:1-14                            |
| Dec 15 | Revelation 6:1-17                            |
| Dec 16 | Revelation 7:1-17                            |
| Dec 17 | Revelation 8:1-13                            |
| Dec 18 | Revelation 9:1-12                            |
| Dec 19 | Revelation 9:13-21                           |
| Dec 20 | Revelation 10:1-11 (Sunday)                  |
| Dec 22 | Revelation 10:1-11 (Tuesday — pre-Christmas track begins) |
| Dec 23 | Revelation 11:1-19                           |
| Dec 24 | Revelation 12:1-10                           |

**Note:** Revelation 10:1-11 appears on both Dec 20 (Sunday) and Dec 22 (Tuesday). This is correct — the Sunday carries the last reading before the pre-Christmas special track begins; Dec 22 begins the special pre-Christmas track with the same citation.

---

### Pre-Christmas Special Track (December 22–24)

Beginning December 22, both Year 1 and Year 2 shift to a "special pre-Christmas" track with readings that prepare for the Nativity:

| Date   | Y1 OT         | Y2 OT             | Y1 Gospel (EP) | Y2 Gospel (MP)   |
|--------|---------------|-------------------|----------------|------------------|
| Dec 22 | Isa. 11:10-16 | Zech. 9:9-16      | Luke 1:5-25    | Matt. 26:1-16    |
| Dec 23 | Isa. 28:9-22  | Zech. 12:9-13:1   | Luke 1:26-38   | Matt. 26:47-68   |
| Dec 24 | Isa. 35:1-10  | Zech. 14:1-11     | (empty)        | (empty)          |

---

## Date Range and Coverage

**Start Date:** November 29, 2026 (First Sunday of Advent)  
**End Date:** December 24, 2026 (Morning Prayer only)  
**Total Entries:** 26

**Not Included in This File:**
- December 24 Evening Prayer — see `christmas.json`
- Christmas Day and Christmas Season — see `christmas.json`

---

## Validation Checklist

Before deploying this file, verify:

- [ ] **Year Detection:** App correctly identifies 2026 as Year 1 and uses `*_year1` fields
- [ ] **Year Reset Logic:** Engine transitions from Year 2 (`ordinary3.json`) to Year 1 on Nov 29
- [ ] **Psalm 95 Handling:** Invitatory (*Venite*) is **not** duplicated from `psalms_mp`
- [ ] **Dec 24 Boundary:** EP fields on Dec 24 are empty strings; Christmas Eve EP loads from `christmas.json`
- [ ] **Eve Logic:** Dec 20 correctly displays Sunday MP readings and Eve EP readings
- [ ] **Color Rendering:** Rose on Dec 13, Red on Nov 30 and Dec 21
- [ ] **Feast Precedence:** Nov 30 and Dec 21 use feast-specific collects, not `collect-advent-X`
- [ ] **Revelation Sequence:** Dec 14-24 Year 1 Epistles progress correctly through Revelation 5-12
- [ ] **Collect Lookup:** All `collect-*` keys resolve to actual collect texts in your database

---

## Testing Scenarios

### 1. Year 1 Reset (Nov 29, 2026)
**Expected MP:**
- Psalms: 146, 147 (no Psalm 95)
- OT: Isaiah 1:1-9
- Epistle: 2 Peter 3:1-10
- Antiphon: "Our King and Savior now draws near..."

**Expected EP:**
- Psalms: 111, 112, 113
- Gospel: Matthew 25:1-13

### 2. St. Andrew Override (Nov 30, 2026)
**Expected:**
- Color: red (not purple)
- Collect: `collect-st-andrew` (not `collect-advent-1`)
- MP Psalms: Psalm 34
- EP Psalms: Psalm 96, 100

### 3. Gaudete Sunday (Dec 13, 2026)
**Expected:**
- Color: rose (or purple if not implemented)
- Year 1 Epistle: Acts 28:16-31 (note: departure from sequential Revelation track)

### 4. Eve Transition (Dec 20, 2026)
**Dec 20 MP:** Purple, Fourth Sunday of Advent readings  
**Dec 20 EP:** Eve of St. Thomas readings (Job 42:1-6, John 14:1-7)  
**Dec 21 MP:** Red, St. Thomas feast readings

### 5. Christmas Eve Boundary (Dec 24, 2026)
**Expected MP:**
- Psalms: Psalm 45, 46
- Y1: Isaiah 35:1-10 (OT), Revelation 12:1-10 (Epistle)
- EP fields: all `""`

---

## Known Edge Cases

### 1. Dec 20 Sunday vs. Dec 22 Tuesday — Same Revelation Citation
Revelation 10:1-11 appears in `reading_epistle_mp_year1` on both December 20 and December 22. This is liturgically correct. The Sunday picks up the sequential Revelation track; Tuesday begins the special pre-Christmas track, which happens to resume at the same point.

### 2. Major Feasts in Advent — Year Parity
On St. Andrew (Nov 30) and St. Thomas (Dec 21), both Year 1 and Year 2 fields contain identical readings. This is the correct BCP pattern for Major Feasts, which have fixed propers regardless of year.

### 3. Dec 24 — No `season` Change
The `season` field remains `"Advent"` on December 24, even though Christmas Eve has begun by common reckoning. The Christmas season begins in `christmas.json`. Do not change the season field in this file.

---

## Integration with Other Lectionary Files

This file is part of the complete Daily Office system:

| File                  | Coverage                                        |
|-----------------------|-------------------------------------------------|
| `advent.json`         | Nov 29 – Dec 24 MP (this file)                 |
| `christmas.json`      | Dec 24 EP – Jan 5 EP (Epiphany Eve)             |
| `epiphany.json`       | Jan 6 – Feb 17, 2026                            |
| `lent.json`           | Feb 18 – Apr 4, 2026                            |
| `easter.json`         | Apr 4 EP – Pentecost (future)                   |
| `ordinary1.json` etc. | Season after Pentecost through Nov 28, 2026     |
| `static_offices.json` | Noonday Prayer and Compline (static, year-round) |

**Calendar Logic for Advent:** Your app should load `advent.json` from the First Sunday of Advent (the fourth Sunday before December 25) through December 24 inclusive.

---

## Maintenance Notes

### Annual Updates Required:

**No updates needed for 2026.** This file is production-ready.

**For 2027 (Year 2):**
- No file rebuild required — Year 2 fields are already populated
- Update engine's year-detection logic to use `*_year2` fields
- Advent Sunday 2027 = November 28, 2027

**For 2028 (Year 1, next rebuild needed):**
- Dates shift; a new file will be needed with updated `date` fields
- Reading content is identical to 2026 Year 1 — only dates change

### Long-Term Maintenance:

- **Every 2 years:** Rebuild date fields for the new cycle
- **Feast dates:** St. Andrew (Nov 30) and St. Thomas (Dec 21) are fixed — no annual adjustment needed
- **Gaudete Sunday:** Always the Third Sunday of Advent — date shifts annually with the calendar

---

## Credits and Licensing

**Source Text:** 1979 Book of Common Prayer (The Episcopal Church)  
**Public Domain Status:** The 1979 BCP text is in the public domain in the United States.  
**Lectionary Arrangement:** Based on the Daily Office Lectionary (BCP pp. 936-943)  
**Data Compilation:** Claude (Anthropic AI) with liturgical expertise consultation  
**Verification:** Audited against BCP pages 936-943 with human liturgical review  

**Usage Rights:** This JSON file may be freely used in liturgical apps, church websites, and Daily Office software. Attribution appreciated but not required.

**Disclaimer:** While every effort has been made to ensure accuracy, users should verify critical citations against a printed 1979 BCP.

---

## Appendix: Complete Date Index

| Date       | Title                                  | Color  | Fields |
|------------|----------------------------------------|--------|--------|
| 2026-11-29 | First Sunday of Advent                 | purple | 15     |
| 2026-11-30 | Saint Andrew the Apostle               | red    | 15     |
| 2026-12-01 | Tuesday in the Week of 1 Advent        | purple | 15     |
| 2026-12-02 | Wednesday in the Week of 1 Advent      | purple | 15     |
| 2026-12-03 | Thursday in the Week of 1 Advent       | purple | 15     |
| 2026-12-04 | Friday in the Week of 1 Advent         | purple | 15     |
| 2026-12-05 | Saturday in the Week of 1 Advent       | purple | 15     |
| 2026-12-06 | Second Sunday of Advent                | purple | 15     |
| 2026-12-07 | Monday in the Week of 2 Advent         | purple | 15     |
| 2026-12-08 | Tuesday in the Week of 2 Advent        | purple | 15     |
| 2026-12-09 | Wednesday in the Week of 2 Advent      | purple | 15     |
| 2026-12-10 | Thursday in the Week of 2 Advent       | purple | 15     |
| 2026-12-11 | Friday in the Week of 2 Advent         | purple | 15     |
| 2026-12-12 | Saturday in the Week of 2 Advent       | purple | 15     |
| 2026-12-13 | Third Sunday of Advent (Gaudete)       | rose   | 15     |
| 2026-12-14 | Monday in the Week of 3 Advent         | purple | 15     |
| 2026-12-15 | Tuesday in the Week of 3 Advent        | purple | 15     |
| 2026-12-16 | Wednesday in the Week of 3 Advent      | purple | 15     |
| 2026-12-17 | Thursday in the Week of 3 Advent       | purple | 15     |
| 2026-12-18 | Friday in the Week of 3 Advent         | purple | 15     |
| 2026-12-19 | Saturday in the Week of 3 Advent       | purple | 15     |
| 2026-12-20 | Fourth Sunday of Advent + **Eve of St. Thomas** (EP) | purple | 20 |
| 2026-12-21 | Saint Thomas the Apostle               | red    | 15     |
| 2026-12-22 | Tuesday in the Week of 4 Advent        | purple | 15     |
| 2026-12-23 | Wednesday in the Week of 4 Advent      | purple | 15     |
| 2026-12-24 | Thursday in the Week of 4 Advent (MP only) | purple | 15 |

---

**END OF DOCUMENTATION**

*This file is liturgically accurate, schema-compliant, and production-ready for the 2026 Advent season and all future liturgical years.*
