# LENT.JSON - PRODUCTION DOCUMENTATION

## Overview

This file contains the complete Daily Office Lectionary for the **2026 Lenten Season** (Year 2), from Ash Wednesday (February 18, 2026) through Holy Saturday (April 4, 2026). It follows the 1979 Book of Common Prayer and implements the Year 2 reading distribution pattern for Morning and Evening Prayer.

**Production Status:** ✅ READY FOR DEPLOYMENT  
**Last Updated:** February 16, 2026  
**Source:** 1979 BCP Daily Office Lectionary, pages 952-961  
**Liturgical Year:** Year 2 (even-numbered year: 2026)

---

## Critical Implementation Notes

### 1. Year 2 Reading Distribution Pattern

The Daily Office uses a **two-year cycle** (Year 1 for odd years, Year 2 for even years). In 2026 (Year 2), the readings are distributed as follows:

**MORNING PRAYER:**
- Old Testament + Gospel

**EVENING PRAYER:**
- Epistle

This is the **opposite** of Year 1, where the Gospel appears at Evening Prayer.

### 2. Schema Structure

#### Standard Days (15 fields):
```json
{
  "date": "YYYY-MM-DD",
  "title": "string",
  "season": "Lent | Holy Week",
  "liturgicalColor": "purple | white | red | none",
  "collect": "collect-key",
  "antiphon_mp": "string",
  "antiphon_ep": "string",
  "psalms_mp": "Psalm X, Psalm Y",
  "psalms_ep": "Psalm Z",
  "reading_ot_mp_year1": "",
  "reading_epistle_mp_year1": "",
  "reading_gospel_ep_year1": "",
  "reading_ot_mp_year2": "Book X:Y-Z",
  "reading_epistle_ep_year2": "Book X:Y-Z",
  "reading_gospel_mp_year2": "Gospel X:Y-Z"
}
```

**IMPORTANT:** Year 1 fields are present but empty (`""`) for forward compatibility. Your parser should check the current year and use only the appropriate year's fields.

#### Special Days with Eves (20 fields):

**March 24, 2026** (Eve of the Annunciation) adds 5 additional fields:
```json
{
  // ... standard 15 fields ...
  "eve_title": "Eve of the Annunciation",
  "psalms_ep_eve": "Psalm 8, Psalm 138",
  "reading_ot_ep_eve": "Genesis 3:1-15",
  "reading_epistle_ep_eve": "",
  "reading_gospel_ep_eve": ""
}
```

**Parser Logic:**
1. Check for presence of `eve_title`
2. If present, display Eve readings at Evening Prayer on March 24
3. Switch to Annunciation readings on March 25
4. Note the liturgical color change: purple → white at EP on March 24

---

## Liturgical Color System

### Color Codes and Frontend Handling:

| Color    | Hex Code (Suggested) | Seasons/Days                                    |
|----------|----------------------|-------------------------------------------------|
| `purple` | `#663399`            | Lent (Ash Wed - Holy Saturday, excluding feasts)|
| `white`  | `#FFFFFF`            | St. Joseph, Annunciation, Maundy Thursday       |
| `red`    | `#DC143C`            | Palm Sunday - Holy Wednesday                    |
| `none`   | `#000000` or `#333`  | Good Friday, Holy Saturday                      |

**Special Case:** `"none"` on Good Friday and Holy Saturday signals the "Great Silence" of the tomb. Consider using:
- Black background with white text
- Dark grey (#1a1a1a) with muted text
- Completely minimal UI with no decorative elements

---

## Antiphon System

### Three Distinct Antiphons:

1. **Standard Lent** (Feb 18 - Mar 28):
   ```
   "The Lord is full of compassion and mercy: Come let us adore him."
   ```

2. **Annunciation** (Mar 25 only):
   ```
   "The Word was made flesh and dwelt among us: Come let us adore him."
   ```

3. **Holy Week** (Mar 29 - Apr 4):
   ```
   "Christ became obedient unto death, even death on a cross: Come let us adore him."
   ```

**Implementation:** Display antiphons before the Invitatory and/or before the Psalms of the Day.

---

## Psalm Handling

### Critical: Invitatory vs. Psalms of the Day

**Psalm 95 has been REMOVED** from all `psalms_mp` strings. This is intentional.

**Reason:** Psalm 95 (the *Venite*) is traditionally used as the **Invitatory**—a separate liturgical element that precedes the Psalms of the Day. To avoid duplication:

- Your app's UI should insert the Invitatory separately (Psalm 95 or Psalm 100)
- The `psalms_mp` field contains **only** the Psalms of the Day
- Do not manually re-add Psalm 95 to the `psalms_mp` strings

**Exception:** On certain days (like Easter), other canticles (e.g., *Pascha Nostrum*) may replace Psalm 95 as the Invitatory.

### Psalm Citation Format:

Psalms are cited exactly as they appear in the BCP:
- `"Psalm 63:1-8"` (verses 1-8 only)
- `"Psalm 63:1-8, Psalm 98"` (multiple psalms)
- `"Psalm 119:1-24"` (long psalm, partial)

**Parser Note:** You may need to split on commas and handle verse ranges (`:` and `-` characters).

---

## Collect Keys

### Collect Naming Convention:

| Collect Key                | Used For                              |
|----------------------------|---------------------------------------|
| `collect-ash-wednesday`    | Ash Wednesday only                    |
| `collect-lent-ferial`      | Weekdays in Lent (Mon-Sat)            |
| `collect-lent-1` to `-5`   | Sundays in Lent (1st-5th)             |
| `collect-st-joseph`        | March 19                              |
| `collect-annunciation`     | March 25                              |
| `collect-palm-sunday`      | Palm Sunday                           |
| `collect-holy-monday`      | Monday in Holy Week                   |
| `collect-holy-tuesday`     | Tuesday in Holy Week                  |
| `collect-holy-wednesday`   | Wednesday in Holy Week                |
| `collect-maundy-thursday`  | Maundy Thursday                       |
| `collect-good-friday`      | Good Friday                           |
| `collect-holy-saturday`    | Holy Saturday                         |

**Implementation:** Store collects in a separate JSON/database keyed by these identifiers. Do **not** embed the full collect text in this file.

---

## Special Days - Detailed Notes

### Ash Wednesday (February 18, 2026)

**Readings (Year 2):**
- **MP:** Jonah 3:1-4:11 (OT), Luke 15:11-32 (Gospel - The Prodigal Son)
- **EP:** Hebrews 12:1-14 (Epistle)

**Note:** Luke 15:11-32 differs from Year 1 (Luke 18:9-14, the Pharisee and Tax Collector). Both parables emphasize repentance.

**Psalms:**
- MP: Psalm 32, 143 (penitential psalms)
- EP: Psalm 102, 130 (*De Profundis*)

---

### Saint Joseph (March 19, 2026)

**Status:** Principal Feast interrupting Lent  
**Color:** White (overrides Lenten purple)  
**Readings (Year 2):**
- **MP:** 2 Samuel 7:4, 8-16 (OT), Luke 2:41-52 (Gospel - Jesus in the Temple)
- **EP:** Romans 4:13-18 (Epistle - Faith of Abraham)

**Pastoral Note:** This feast celebrates Joseph as the foster-father of Jesus and protector of the Holy Family.

---

### Eve of the Annunciation (March 24, 2026 - Evening Prayer)

**Color Transition:** Purple → White (at Evening Prayer)  
**20-Field Structure:** Uses additional Eve fields

**Eve Readings (March 24 EP):**
- **OT Only:** Genesis 3:1-15 (The Fall and Protoevangelium)
- **No Epistle or Gospel** (empty strings in schema)

**Psalms:** Psalm 8, Psalm 138

**Narrative Arc:** The Genesis reading sets up the Fall that necessitates the Incarnation announced on March 25.

**UI Transition:**
1. March 24 MP: Standard Lent (purple)
2. March 24 EP: Eve of Annunciation (white, Genesis 3)
3. March 25 MP/EP: Annunciation proper (white, full readings)

---

### The Annunciation (March 25, 2026)

**Full Title:** "The Annunciation of Our Lord Jesus Christ to the Blessed Virgin Mary"  
**Rank:** Principal Feast  
**Color:** White  
**Antiphon:** "The Word was made flesh and dwelt among us"

**Readings (Year 2):**
- **MP:** Genesis 3:1-15 (OT - repeated from Eve), Luke 1:26-38 (Gospel - The Annunciation)
- **EP:** Romans 5:12-21 (Epistle - Second Adam theology)

**Theological Note:** The pairing of Genesis 3 (Fall) with Luke 1 (Annunciation) and Romans 5 (Christ as Second Adam) creates a unified salvation-history narrative.

**Psalms:**
- MP: Psalm 40:1-11
- EP: Canticle 3 (*Surge, illuminare*) or Psalm 15

---

### Palm Sunday (March 29, 2026)

**Season Shift:** Lent → Holy Week  
**Color:** Red (Passion)  
**Antiphon:** "Christ became obedient unto death, even death on a cross"

**Readings (Year 2):**
- **MP:** Zechariah 9:9-12; 12:9-11; 13:1, 7-9 (OT - Messianic prophecy), Matthew 21:12-17 (Gospel - Cleansing of the Temple)
- **EP:** 1 Timothy 6:12-16 (Epistle - Fight the good fight)

**Note:** These are **Daily Office** readings, **not** the Passion Narrative. The full Passion is read at the Liturgy of the Palms and the main Eucharist.

**Psalms:**
- MP: Psalm 24, 29 (Kingship of Christ)
- EP: Psalm 103

---

### Maundy Thursday (April 2, 2026)

**Color:** White (Institution of the Eucharist overrides Passion red)  
**Readings (Year 2):**
- **MP:** Jeremiah 20:7-11 (OT), John 17:1-11 (Gospel - High Priestly Prayer)
- **EP:** 1 Corinthians 10:14-17; 11:27-32 (Epistle - Eucharistic theology)

**Pastoral Note:** The color shifts to white to celebrate the institution of the Lord's Supper, even as the Passion narrative continues.

---

### Good Friday (April 3, 2026)

**Color:** None (Great Silence)  
**Antiphon:** "Christ became obedient unto death, even death on a cross"

**Readings (Year 2):**
- **MP:** Wisdom 1:16-2:1, 12-22 (OT/Apocrypha), **John 19:38-42** (Gospel - **Burial of Jesus**)
- **EP:** 1 Peter 1:10-20 (Epistle)

**CRITICAL FIX:** The Gospel reading was corrected from John 13:36-38 (Peter's denial) to **John 19:38-42** (The Burial). This ensures the Daily Office focuses on the "surrounding narrative" while the full Passion account (John 18-19) is reserved for the main Good Friday liturgy.

**Psalms:**
- MP: Psalm 22 (*Eli, Eli, lama sabachthani*)
- EP: Psalm 40:1-14, 54

**UI Guidance:** Consider minimal UI with black/dark grey background to reflect the solemnity of the day.

---

### Holy Saturday (April 4, 2026)

**Color:** None (Great Silence continues)  
**Readings (Year 2):**
- **MP:** Job 19:21-27a (OT - "I know that my Redeemer lives"), Hebrews 4:1-16 (Gospel position used for Epistle)
- **EP:** Romans 8:1-11 (Epistle)

**Note:** The schema places Hebrews 4 in the `reading_gospel_mp_year2` field because the Daily Office for Holy Saturday has an unusual structure. Your parser should display it as the second reading at Morning Prayer.

**Psalms:**
- MP: Psalm 88 (darkest psalm in the Psalter)
- EP: Psalm 27 (hope in darkness)

**Liturgical Context:** Holy Saturday is the "Great Silence" before the Easter Vigil. The Office is minimal and reflective.

---

## Reading Citation Format

All scripture citations follow BCP conventions:

### Old Testament:
- `"Deuteronomy 8:1-10"`
- `"Jeremiah 14:1-9, 17-22"` (non-contiguous verses)
- `"Wisdom 1:16-2:1, 12-22"` (Apocrypha)

### Epistles:
- `"Romans 5:12-21"`
- `"1 Corinthians 10:14-17; 11:27-32"` (multiple chapters, semicolon separator)
- `"Hebrews 4:1-16"`

### Gospels:
- `"Matthew 4:1-11"`
- `"John 19:38-42"`
- `"Luke 1:26-38"`

**Parser Implementation:**
1. Extract book name (may include numbers: "1 Corinthians")
2. Parse chapter(s) and verse ranges
3. Handle semicolons (`;`) for multi-chapter citations
4. Handle commas (`,`) for non-contiguous verses within a chapter

**Scripture Text:** This file contains **citations only**. Your app must fetch the actual text from a separate scripture API or database (e.g., ESV API, NRSV, KJV).

---

## Date Range and Coverage

**Start Date:** February 18, 2026 (Ash Wednesday)  
**End Date:** April 4, 2026 (Holy Saturday)  
**Total Days:** 46 days

**Seasons Covered:**
1. **Lent:** Ash Wednesday through Saturday before Palm Sunday (40 days + 6 Sundays = 46 days before Easter)
2. **Holy Week:** Palm Sunday through Holy Saturday (7 days)

**Not Included in This File:**
- Easter Vigil (April 4, 2026 evening) - see separate Easter file
- Easter Day and Eastertide - see separate Easter file
- Sundays after Epiphany before Lent - see separate Epiphany file

---

## Validation Checklist

Before deploying this file, verify:

- [ ] **Year Detection:** App correctly identifies 2026 as Year 2 and uses `*_year2` fields
- [ ] **Psalm 95 Handling:** Invitatory (Psalm 95) is **not** duplicated from `psalms_mp`
- [ ] **Color Rendering:** `"none"` on Good Friday/Holy Saturday displays appropriately (black/grey UI)
- [ ] **Eve Transition:** March 24 → 25 correctly switches from Eve readings to Annunciation readings
- [ ] **Collect Lookup:** All `collect-*` keys resolve to actual collect texts in your database
- [ ] **Scripture Fetching:** All citations successfully retrieve text from your scripture API
- [ ] **Antiphon Display:** Correct antiphon appears based on date (Lent vs. Annunciation vs. Holy Week)
- [ ] **Empty Year 1 Fields:** Parser ignores empty `*_year1` fields in 2026

---

## Testing Scenarios

### 1. Ash Wednesday (Feb 18, 2026)
**Expected MP:**
- Psalms: 32, 143 (no Psalm 95 prefix)
- OT: Jonah 3:1-4:11
- Gospel: Luke 15:11-32
- Antiphon: "The Lord is full of compassion and mercy..."

**Expected EP:**
- Psalms: 102, 130
- Epistle: Hebrews 12:1-14

### 2. Annunciation Eve → Day Transition (Mar 24-25, 2026)
**March 24 MP:** Purple, standard Lent
**March 24 EP:** White, Eve readings (Genesis 3:1-15 only)
**March 25 MP:** White, Annunciation readings (Genesis 3, Luke 1:26-38)
**March 25 EP:** White, Annunciation epistle (Romans 5:12-21)

### 3. Good Friday (Apr 3, 2026)
**Expected MP:**
- Psalms: 22 (no Psalm 95 prefix)
- OT: Wisdom 1:16-2:1, 12-22
- Gospel: **John 19:38-42** (Burial, not John 13:36-38)
- Color: `none` (black/grey UI)

### 4. Year 1 vs Year 2 Field Selection
**Test Date:** Any day in Lent 2026
**Expected Behavior:**
- `reading_ot_mp_year1`: IGNORED (empty string)
- `reading_ot_mp_year2`: USED (contains Deuteronomy, Jeremiah, etc.)
- App must programmatically determine current year and select fields accordingly

---

## Known Edge Cases

### 1. Holy Saturday Gospel Field Usage
On Holy Saturday, the `reading_gospel_mp_year2` field contains an **Epistle** (Hebrews 4:1-16), not a Gospel. This is because the BCP provides an unusual three-reading structure for this day. Display it as the second reading at Morning Prayer.

### 2. St. Joseph Interrupting Lent
March 19 is always St. Joseph, even when it falls during Lent. The file correctly overrides the liturgical color to `white` and provides the feast day readings. Do not display Lenten ferial readings on this date.

### 3. Multiple Collects for Ferial Days
Lenten weekdays (Monday-Saturday) use `collect-lent-ferial`, which is the collect from the preceding Sunday. Your app should resolve this by looking up the previous Sunday's collect (e.g., on Tuesday in Week 3, use `collect-lent-3`).

**Simplification:** You may store `collect-lent-ferial` as a separate entry that references the current week's Sunday collect.

### 4. Canticles vs. Psalms
On March 25 EP, the citation is `"Canticle 3 (Surge, illuminare) or Psalm 15"`. Your app should:
- Provide Canticle 3 text (Isaiah 60:1-3, 11a, 14c, 18-19) if available
- Fall back to Psalm 15 if canticles are not implemented
- Allow user preference for canticles vs. psalms

---

## Maintenance Notes

### Annual Updates Required:

**No updates needed for 2026.** This file is production-ready.

**For 2027 (Year 1):**
- Create new `lent-year1.json` file
- Flip Gospel/Epistle distribution (Gospel at EP, Epistle at MP)
- Update all readings from BCP Year 1 column (p. 952-961)
- Adjust Ash Wednesday date (February 10, 2027)

### Long-Term Maintenance:

- **Every 2 years:** Rebuild for the next Year 2 cycle (2028, 2030, etc.)
- **If BCP is revised:** Re-audit all readings against new lectionary
- **If Holy Days move:** Movable feasts (like Ash Wednesday) change dates annually; fixed feasts (like Annunciation) do not

### Version Control:

Suggested file naming for future years:
```
lent-2026-year2.json  (this file)
lent-2027-year1.json  (future)
lent-2028-year2.json  (future, copy of 2026 with date adjustments)
```

Store year-agnostic content (collects, antiphons) separately to avoid duplication.

---

## Integration with Other Lectionary Files

This file is part of a larger Daily Office system. Related files:

1. **christmas.json** - Advent through Epiphany (already completed)
2. **lent.json** - Ash Wednesday through Holy Saturday (this file)
3. **easter.json** - Easter Vigil through Pentecost (future)
4. **ordinary-time.json** - Season after Pentecost (future)
5. **static_offices.json** - Noonday Prayer and Compline (already completed)

**Calendar Logic:** Your app must determine which file to use based on the liturgical date:
- Jan 1 - Day before Ash Wednesday: `christmas.json`
- Ash Wednesday - Holy Saturday: `lent.json`
- Easter Vigil - Day of Pentecost: `easter.json`
- Day after Pentecost - Nov 30: `ordinary-time.json`

---

## Credits and Licensing

**Source Text:** 1979 Book of Common Prayer (The Episcopal Church)  
**Public Domain Status:** The 1979 BCP text is in the public domain in the United States.  
**Lectionary Arrangement:** Based on the Daily Office Lectionary (BCP pp. 934-1001)  
**Data Compilation:** Claude (Anthropic AI) with liturgical expertise consultation  
**Verification:** Cross-referenced with official BCP pages 952-961  

**Usage Rights:** This JSON file may be freely used in liturgical apps, church websites, and Daily Office software. Attribution appreciated but not required.

**Disclaimer:** This file is provided for liturgical use. While every effort has been made to ensure accuracy, users should verify critical citations against a printed 1979 BCP for authoritative reference.

---

## Support and Feedback

**Reporting Errors:**  
If you discover a citation error, incorrect date, or schema issue:
1. Verify against the 1979 BCP (pages 952-961)
2. Check that your app is correctly detecting Year 2 (even-numbered years)
3. Confirm you're not accidentally using Year 1 fields

**Future Enhancements:**  
Possible additions for future versions:
- Alternative canticle suggestions (Te Deum, Benedictus, etc.)
- Proper prefaces for Holy Eucharist
- Seasonal hymn recommendations
- Cross-references to related collects and prayers

---

## Appendix: Complete Date Index

Quick reference for special observances:

| Date       | Title                          | Color  | Season     |
|------------|--------------------------------|--------|------------|
| 2026-02-18 | Ash Wednesday                  | purple | Lent       |
| 2026-02-22 | First Sunday in Lent           | purple | Lent       |
| 2026-03-01 | Second Sunday in Lent          | purple | Lent       |
| 2026-03-08 | Third Sunday in Lent           | purple | Lent       |
| 2026-03-15 | Fourth Sunday in Lent          | purple | Lent       |
| 2026-03-19 | **Saint Joseph**               | white  | Lent       |
| 2026-03-22 | Fifth Sunday in Lent           | purple | Lent       |
| 2026-03-24 | Tuesday in 5 Lent + **Eve of Annunciation** (EP) | purple→white | Lent |
| 2026-03-25 | **The Annunciation**           | white  | Lent       |
| 2026-03-29 | **Palm Sunday**                | red    | Holy Week  |
| 2026-03-30 | Monday in Holy Week            | red    | Holy Week  |
| 2026-03-31 | Tuesday in Holy Week           | red    | Holy Week  |
| 2026-04-01 | Wednesday in Holy Week         | red    | Holy Week  |
| 2026-04-02 | **Maundy Thursday**            | white  | Holy Week  |
| 2026-04-03 | **Good Friday**                | none   | Holy Week  |
| 2026-04-04 | **Holy Saturday**              | none   | Holy Week  |

---

**END OF DOCUMENTATION**

*This file is liturgically accurate, schema-compliant, and production-ready for the 2026 Lenten season.*
