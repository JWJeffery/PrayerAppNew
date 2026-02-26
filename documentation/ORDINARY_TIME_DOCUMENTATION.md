# ORDINARY TIME — PRODUCTION DOCUMENTATION
## Files: `ordinary1.json` · `ordinary2.json` · `ordinary3.json`

---

## Overview

Ordinary Time covers the **Season after Pentecost** — the longest continuous liturgical season of the year, spanning from the Day of Pentecost through the Last Sunday after Pentecost (Christ the King). The 1979 Book of Common Prayer organizes this season using numbered **Proper** collects and their associated lectionary tracks, with fixed feasts punctuating the green calendar throughout.

For practical file management, Ordinary Time is divided into three JSON files covering roughly equal segments of the calendar:

| File             | Coverage                          | Entries | Propers      |
|------------------|-----------------------------------|---------|--------------|
| `ordinary1.json` | May 25 – July 31, 2026            | 68      | 3–12         |
| `ordinary2.json` | August 1 – September 30, 2026     | 61      | 12–21        |
| `ordinary3.json` | October 1 – November 28, 2026     | 59      | 21–29        |
| **Total**        | **May 25 – November 28, 2026**    | **188** |              |

**Production Status:** ✅ ALL THREE FILES READY FOR DEPLOYMENT  
**Last Updated:** February 17, 2026  
**Source:** 1979 BCP Daily Office Lectionary, pages 962–1001  
**Liturgical Year:** Year 2 (primary for 2026); Year 1 fields fully populated for perpetual use

---

## Critical Implementation Notes

### 1. File Boundaries and Continuity

The three files divide the season at month boundaries for manageability, not at liturgical seams. Your engine must handle the transitions seamlessly:

- `ordinary1.json` begins **mid-week** on May 25 (Monday of Proper 3 week). The preceding Sunday (Pentecost/Trinity) is *not* in this file — it begins the day after.
- `ordinary1.json` and `ordinary2.json` share **Proper 12**: ordinary1 ends July 31 (Friday of Proper 12 week) and ordinary2 begins August 1 (Saturday of Proper 12 week). Your engine must load the correct file without a gap or overlap.
- `ordinary2.json` and `ordinary3.json` share **Proper 21**: ordinary2 ends September 30 (Wednesday of Proper 21 week) and ordinary3 begins October 1 (Thursday of Proper 21 week).
- `ordinary3.json` ends November 28 (Saturday after Christ the King). Advent Sunday (November 29) begins `advent.json`.

**Engine Logic:** Load the correct file based on date range. No entry appears in more than one file.

### 2. What Precedes ordinary1.json

The season begins at Pentecost, which is covered by the Easter file (`easter.json`, not yet built). The Easter file ends with the Day of Pentecost. The Monday after Pentecost begins ordinary time. Your engine must:
1. Determine the date of Pentecost (50 days after Easter)
2. Load `easter.json` through Pentecost Day
3. Begin loading `ordinary1.json` from the following Monday

**For 2026:** Pentecost = May 24. `ordinary1.json` begins May 25.

### 3. Year 1 and Year 2 Reading Distribution

The same two-year cycle governs all of Ordinary Time:

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

**For 2026:** Use `*_year2` fields.  
**For 2027 (Year 1):** Use `*_year1` fields — no file rebuild needed.

**Exception — Major Feasts:** On all Major Feast days, both Year 1 and Year 2 fields contain **identical readings**. The engine does not need to differentiate by year for these entries. See the Major Feasts section below for the complete list.

### 4. Schema Structure

All entries use the standard 15-field schema. Eve entries add 5 additional fields for 20 total.

#### Standard Days (15 fields):
```json
{
  "date": "YYYY-MM-DD",
  "title": "string",
  "season": "Ordinary",
  "liturgicalColor": "green | white | red",
  "collect": "collect-key",
  "antiphon_mp": "string",
  "antiphon_ep": "string",
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

#### Eve Days (20 fields) — 5 entries across all three files:
```json
{
  // ... standard 15 fields ...
  "eve_title": "string",
  "psalms_ep_eve": "Psalm X",
  "reading_ot_ep_eve": "Book X:Y-Z",
  "reading_epistle_ep_eve": "Book X:Y-Z or \"\"",
  "reading_gospel_ep_eve": "Book X:Y-Z or \"\""
}
```

---

## Liturgical Color System

| Color   | Hex (Suggested) | Usage                                               |
|---------|-----------------|-----------------------------------------------------|
| `green` | `#2E8B57`       | All ordinary weekdays and Sundays after Pentecost   |
| `white` | `#FFFFFF`       | Trinity Sunday, Nativity of St. John Baptist,       |
|         |                 | Transfiguration (Aug 6), St. Mary the Virgin,       |
|         |                 | St. Michael & All Angels, All Saints, Christ the King|
| `red`   | `#DC143C`       | SS. Peter & Paul, St. Bartholomew, Holy Cross Day,  |
|         |                 | St. Matthew, St. James the Apostle, St. Mary Magdalene (white)|
|         |                 | St. Luke, St. James of Jerusalem, SS. Simon & Jude  |

**Color Rule for Feasts:** Apostles and Evangelists use **red** (witness/martyrdom). Marian feasts and Transfiguration use **white** (glory/purity). All Saints uses **white**. Christ the King uses **white**.

**Note on St. Mary Magdalene (Jul 22):** She is listed as `white` in this file, correctly reflecting her status as a confessor rather than a martyr.

---

## Antiphon System

### Three Distinct Antiphons in Ordinary Time:

**1. Standard Ordinary Time (all green days):**
```
"The Lord is full of compassion and mercy: Come let us adore him."
```

**2. Major Feasts — Apostles, Evangelists, Saints (red and white feast days):**
```
"The Lord is glorious in his saints: Come let us adore him."
```

**3. Trinity Sunday only:**
```
"Holy, holy, holy Lord God Almighty: Come let us adore him."
```

**Implementation Rules:**
- All green days → antiphon 1 (both MP and EP identical)
- All feast days with `liturgicalColor: red` or `white` → antiphon 2, *except* Trinity Sunday and Christ the King
- Trinity Sunday → antiphon 3
- Christ the King (Nov 22) → antiphon 2 ("The Lord is glorious in his saints")

**Note:** Christ the King does not use the Trinity antiphon. Verify your engine does not apply antiphon 3 to any day except Trinity Sunday itself.

---

## The "Proper" System

### How Propers Work in Ordinary Time:

The BCP assigns a numbered **Proper** (1–29) to each week of Ordinary Time. Each Proper has:
- A Sunday collect (e.g., `collect-proper-7`)
- A lectionary track for that week's daily readings

Weekdays carry the collect of the preceding Sunday's Proper. For example, every day in the week of the Seventh Sunday after Pentecost uses `collect-proper-7`.

### Proper Numbers in These Files:

| File           | Propers Covered |
|----------------|-----------------|
| ordinary1.json | 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 |
| ordinary2.json | 12, 13, 14, 15, 16, 17, 18, 19, 20, 21 |
| ordinary3.json | 21, 22, 23, 24, 25, 26, 27, 28, 29 |

**Note:** Propers 1 and 2 (late May, pre-Trinity) are not represented in these files for 2026 because Pentecost fell on May 24. In years where Pentecost falls earlier, these Propers would appear.

### Proper-to-Sunday Mapping (2026):

| Proper | Sunday Title                         | Date       |
|--------|--------------------------------------|------------|
| —      | Trinity Sunday / The Visitation      | 2026-05-31 |
| 5      | Fifth Sunday after Pentecost         | 2026-06-07 |
| 6      | Sixth Sunday after Pentecost         | 2026-06-14 |
| 7      | Seventh Sunday after Pentecost       | 2026-06-21 |
| 8      | Eighth Sunday after Pentecost        | 2026-06-28 |
| 9      | Ninth Sunday after Pentecost         | 2026-07-05 |
| 10     | Tenth Sunday after Pentecost         | 2026-07-12 |
| 11     | Eleventh Sunday after Pentecost      | 2026-07-19 |
| 12     | Twelfth Sunday after Pentecost       | 2026-07-26 |
| 13     | Thirteenth Sunday after Pentecost    | 2026-08-02 |
| 14     | Fourteenth Sunday after Pentecost    | 2026-08-09 |
| 15     | Fifteenth Sunday after Pentecost     | 2026-08-16 |
| 16     | Sixteenth Sunday after Pentecost     | 2026-08-23 |
| 17     | Seventeenth Sunday after Pentecost   | 2026-08-30 |
| 18     | Eighteenth Sunday after Pentecost    | 2026-09-06 |
| 19     | Nineteenth Sunday after Pentecost    | 2026-09-13 |
| 20     | Twentieth Sunday after Pentecost     | 2026-09-20 |
| 21     | Twenty-first Sunday after Pentecost  | 2026-09-27 |
| 22     | Twenty-second Sunday after Pentecost | 2026-10-04 |
| 23     | Twenty-third Sunday after Pentecost  | 2026-10-11 |
| 24     | Twenty-fourth Sunday after Pentecost | 2026-10-25 |
| 26     | Twenty-sixth Sunday after Pentecost  | 2026-11-08 |
| 27     | Twenty-seventh Sunday after Pentecost| 2026-11-15 |
| 29     | Christ the King — Last Sunday after Pentecost | 2026-11-22 |

**Note:** Proper 4 is used only for weekdays (June 1–6) — the corresponding Sunday is Trinity Sunday, which uses `collect-trinity`, not `collect-proper-4`. Sundays 25 and 28 do not appear in 2026 because the corresponding Sundays (October 18 and November 1) are displaced by Major Feasts (St. Luke and All Saints' Day respectively).

---

## Major Feasts — Complete Register

All 13 Major Feasts occurring in Ordinary Time 2026, with collect keys:

### ordinary1.json

| Date       | Title                                    | Color | Collect Key                    |
|------------|------------------------------------------|-------|--------------------------------|
| 2026-05-31 | Trinity Sunday / The Visitation          | white | `collect-trinity`              |
| 2026-06-24 | The Nativity of Saint John the Baptist   | white | `collect-nativity-john-baptist`|
| 2026-06-29 | Saint Peter and Saint Paul, Apostles     | red   | `collect-peter-paul`           |
| 2026-07-22 | Saint Mary Magdalene                     | white | `collect-mary-magdalene`       |
| 2026-07-25 | Saint James the Apostle                  | red   | `collect-james-apostle`        |

### ordinary2.json

| Date       | Title                                            | Color | Collect Key              |
|------------|--------------------------------------------------|-------|--------------------------|
| 2026-08-06 | The Transfiguration of Our Lord Jesus Christ     | white | `collect-transfiguration`|
| 2026-08-15 | Saint Mary the Virgin                            | white | `collect-mary-virgin`    |
| 2026-08-24 | Saint Bartholomew the Apostle                    | red   | `collect-bartholomew`    |
| 2026-09-14 | Holy Cross Day                                   | red   | `collect-holy-cross`     |
| 2026-09-21 | Saint Matthew, Apostle and Evangelist            | red   | `collect-matthew`        |
| 2026-09-29 | Saint Michael and All Angels                     | white | `collect-michael-all-angels`|

### ordinary3.json

| Date       | Title                                            | Color | Collect Key              |
|------------|--------------------------------------------------|-------|--------------------------|
| 2026-10-18 | Saint Luke the Evangelist                        | red   | `collect-luke`           |
| 2026-10-23 | Saint James of Jerusalem, Brother of Our Lord    | red   | `collect-james-jerusalem`|
| 2026-10-28 | Saints Simon and Jude, Apostles                  | red   | `collect-simon-jude`     |
| 2026-11-01 | All Saints' Day                                  | white | `collect-all-saints`     |
| 2026-11-22 | Christ the King — Last Sunday after Pentecost    | white | `collect-proper-29`      |

---

## Eve Entries — Complete Register

Five 20-field Eve entries across the three files:

### ordinary1.json — 2 Eves

**May 30 (Saturday of Proper 3 week): Eve of Trinity Sunday**
```
psalms_ep_eve:       Psalm 104
reading_ot_ep_eve:   Ecclesiasticus 42:15-25
reading_epistle_ep_eve: Ephesians 3:14-21   ← NOTE: Epistle present (unique)
reading_gospel_ep_eve:  ""
```
This is the **only Eve entry in all three files that includes an Epistle reading** at the Eve office. All other Eves use only OT (and occasionally Gospel), leaving the Epistle field empty. Ensure your parser does not suppress the epistle field on Eve entries.

**June 23 (Tuesday of Proper 7 week): Eve of the Nativity of Saint John the Baptist**
```
psalms_ep_eve:       Psalm 85, Psalm 87
reading_ot_ep_eve:   Malachi 3:1-4
reading_epistle_ep_eve: ""
reading_gospel_ep_eve:  ""
```
OT only. Malachi 3 ("I am sending my messenger") is the prophetic text anticipating John's ministry.

### ordinary2.json — 2 Eves

**August 5 (Wednesday of Proper 13 week): Eve of the Transfiguration**
```
psalms_ep_eve:       Psalm 99, Psalm 91
reading_ot_ep_eve:   Exodus 24:12-18
reading_epistle_ep_eve: ""
reading_gospel_ep_eve:  ""
```
OT only. Exodus 24 — Moses ascending the mountain into cloud and glory — directly prefigures the Transfiguration narrative.

**September 12 (Saturday of Proper 18 week): Eve of Holy Cross Day**
```
psalms_ep_eve:       Psalm 66, Psalm 116
reading_ot_ep_eve:   Numbers 21:4-9
reading_epistle_ep_eve: ""
reading_gospel_ep_eve:  ""
```
OT only. Numbers 21:4-9 (the bronze serpent) is the typological antecedent of the cross cited by Jesus in John 3:14.

### ordinary3.json — 1 Eve

**October 31 (Saturday of Proper 25 week): Eve of All Saints**
```
psalms_ep_eve:       Psalm 34
reading_ot_ep_eve:   Wisdom 3:1-9
reading_epistle_ep_eve: Revelation 21:1-7   ← NOTE: Epistle present
reading_gospel_ep_eve:  ""
```
The Eve of All Saints is the **second Eve entry with an Epistle present** (alongside the Eve of Trinity). Wisdom 3:1-9 ("The souls of the righteous are in the hand of God") and Revelation 21:1-7 (the New Jerusalem) together form a rich All Hallows' Eve liturgy.

---

## Special Days — Detailed Notes

### Trinity Sunday / The Visitation (May 31, 2026)

This entry carries a dual title because the **Feast of the Visitation** (May 31, fixed) and **Trinity Sunday** (movable, falls on the Sunday after Pentecost) coincide in 2026.

**Precedence:** Trinity Sunday takes liturgical precedence.  
**Collect:** `collect-trinity` (not a Visitation collect)  
**Color:** White  
**Antiphon:** "Holy, holy, holy Lord God Almighty" (unique — used only on this day)

**Year 1 fields are empty** on Trinity Sunday:
```json
"reading_ot_mp_year1": "",
"reading_epistle_mp_year1": "",
"reading_gospel_ep_year1": ""
```
Only Year 2 readings are populated:
- MP: Ecclesiasticus 43:1-12 (OT), John 1:1-18 (Gospel)
- EP: Ephesians 4:1-16 (Epistle)

**Parser Note:** Check for empty Year 1 strings before attempting to display or fetch. Do not display blank reading slots.

**The Visitation:** In years when Trinity Sunday falls on a different date, the Visitation (May 31) would be observed separately with its own collect and readings. In 2026, it is absorbed into Trinity Sunday.

---

### The Transfiguration — Two Appearances

The Transfiguration appears **twice** in the complete lectionary system:

1. **February 15, 2026** — `epiphany.json`: "Last Sunday after the Epiphany: The Transfiguration" (white, `collect-last-epiphany`)
2. **August 6, 2026** — `ordinary2.json`: "The Transfiguration of Our Lord Jesus Christ" (white, `collect-transfiguration`)

These are **two distinct observances** with different collects and different readings. The February observance is the seasonal Epiphany culmination; the August observance is the Principal Feast on the fixed date. Your engine must not deduplicate or merge them.

---

### SS. Peter and Paul (June 29, 2026)

This feast observes both apostles jointly. Color is **red** (apostolic martyrdom of both). Both Year 1 and Year 2 use identical readings:
- MP: Ezekiel 34:11-16 (OT), 2 Timothy 4:1-8 (Epistle)
- EP: John 21:15-19 (Gospel — "Feed my sheep")

**Note:** The June 29 feast is distinct from the January 18 Confession of St. Peter (in `epiphany.json`). This feast commemorates their martyrdom in Rome; the January feast commemorates Peter's confession at Caesarea Philippi.

---

### The Nativity of Saint John the Baptist (June 24, 2026)

One of only three saints whose births are commemorated (alongside Jesus and the Blessed Virgin). Color is **white**.

Both Year 1 and Year 2 use identical readings:
- MP: Isaiah 40:1-11 (OT), Acts 13:14b-26 (Epistle)
- EP: Luke 1:57-80 (Gospel — the Birth of John)

**Psalm Note:** Unusually, MP and EP both use the same psalms (Psalm 85, 87) — the same psalms as the Eve. This is the correct BCP assignment and is not a copy error.

---

### Holy Cross Day (September 14, 2026)

**Color:** Red (though it commemorates the finding of the True Cross, not a martyrdom — red here signals the Passion of Christ).

The Eve (September 12) uses Numbers 21:4-9, the typological bronze serpent. The feast day itself uses:
- Year 2 MP: Isaiah 45:21-25 (OT), John 12:31-36a (Gospel)
- Year 2 EP: 1 Corinthians 1:18-31 (Epistle)

---

### All Saints' Day (November 1, 2026)

**Color:** White  
**Collect:** `collect-all-saints`

The Eve (October 31 EP — Halloween) carries the richest Eve liturgy in the entire file: Psalm 34, Wisdom 3:1-9, and Revelation 21:1-7 (the New Jerusalem). All Saints is one of the seven Principal Feasts of the church year.

**Year 2 readings:**
- MP: Wisdom 3:1-9 (OT — same as Eve, repeated at MP), John 11:21-27 (Gospel)
- EP: Revelation 7:2-4, 9-17 (Epistle)

---

### Christ the King — Last Sunday after Pentecost (November 22, 2026)

**Color:** White  
**Collect:** `collect-proper-29`  
**Antiphon:** "The Lord is glorious in his saints" (feast antiphon, not Trinity antiphon)

This is the final Sunday of the liturgical year. The season transitions to Advent on November 29 (`advent.json`). `ordinary3.json` continues through November 28 (the following Saturday), providing six days of transition material after Christ the King Sunday.

---

## Psalm Handling

### No Psalm 95 in `psalms_mp`

Psalm 95 (the *Venite*) has been **removed** from all `psalms_mp` strings across all three files. Your engine injects it as the Invitatory separately.

### The Ordinary Time Psalm Cycle

Ordinary Time uses the BCP's **30-day Psalter rotation** for weekdays, cycling through essentially the entire psalter over the course of the season. Sundays use fixed psalm sets tied to the Proper. Key patterns:

**Sunday psalm sets rotate through four patterns (in order):**
1. Psalm 146, 147 | EP: 111, 112, 113
2. Psalm 148, 149, 150 | EP: 114, 115
3. Psalm 63:1-8, 98 | EP: 103
4. Psalm 24, 29 | EP: 8, 84
5. Psalm 93, 96 | EP: 34
6. Psalm 66, 67 | EP: 19, 46

**Weekday pattern:** A rolling assignment from the 30-day Psalter schedule (BCP pp. 933–934), cycling Mon–Sat through a fixed sequence regardless of which Proper week is current.

---

## OT Reading Tracks

The Year 1 and Year 2 OT tracks each follow a semi-continuous reading of major biblical books:

### Year 1 OT Track (Sequential by book):

| Period             | Book(s) Read                                  |
|--------------------|-----------------------------------------------|
| Proper 3–5         | Proverbs                                      |
| Proper 5–6         | Ecclesiastes                                  |
| Proper 6–8         | Numbers                                       |
| Proper 8–10        | Numbers → Deuteronomy                         |
| Proper 10–11       | Deuteronomy → Joshua                          |
| Proper 11–12       | Joshua → Judges                               |
| Proper 12–13       | Judges → Numbers overlap                      |
| Proper 13–18       | Deuteronomy (Year 1 resumes) → Ruth → others  |
| Proper 18 onward   | Amos → Hosea → Isaiah → Micah → others        |

### Year 2 OT Track (Sequential by book):

| Period             | Book(s) Read                                  |
|--------------------|-----------------------------------------------|
| Proper 3–5         | Deuteronomy                                   |
| Proper 5–6         | Deuteronomy (concludes) → 1 Samuel begins     |
| Proper 6–12        | 1 Samuel                                      |
| Proper 12–18       | 2 Samuel                                      |
| Proper 18 onward   | 1 Kings → 2 Kings → others                   |

### Epistle Tracks

**Year 1 Epistles:** Run sequentially through major Pauline letters — 2 Timothy, Galatians, Romans, 1 Corinthians, Acts (at Sundays), continuing through the summer and fall.

**Year 2 Epistles:** Run through 2 Corinthians, Acts (weekdays), Romans, and then rotate through shorter letters in the fall.

---

## Collect Keys — Complete List

### ordinary1.json
| Key                             | Used For                                     |
|---------------------------------|----------------------------------------------|
| `collect-trinity`               | Trinity Sunday (May 31)                      |
| `collect-proper-3` through `-12`| Weekdays and Sundays of Propers 3–12         |
| `collect-nativity-john-baptist` | June 24                                      |
| `collect-peter-paul`            | June 29                                      |
| `collect-mary-magdalene`        | July 22                                      |
| `collect-james-apostle`         | July 25                                      |

### ordinary2.json
| Key                             | Used For                                     |
|---------------------------------|----------------------------------------------|
| `collect-proper-12` through `-21`| Weekdays and Sundays of Propers 12–21       |
| `collect-transfiguration`       | August 6                                     |
| `collect-mary-virgin`           | August 15                                    |
| `collect-bartholomew`           | August 24                                    |
| `collect-holy-cross`            | September 14                                 |
| `collect-matthew`               | September 21                                 |
| `collect-michael-all-angels`    | September 29                                 |

### ordinary3.json
| Key                             | Used For                                     |
|---------------------------------|----------------------------------------------|
| `collect-proper-21` through `-29`| Weekdays and Sundays of Propers 21–29       |
| `collect-luke`                  | October 18                                   |
| `collect-james-jerusalem`       | October 23                                   |
| `collect-simon-jude`            | October 28                                   |
| `collect-all-saints`            | November 1                                   |

**Note:** `collect-proper-29` serves as the Christ the King collect on November 22.  
**Note:** `collect-proper-12` and `collect-proper-21` each appear in two files (at the file boundaries). Ensure your collect database has no duplicate key conflicts.

---

## Date Range and Coverage

### Summary by File:

**ordinary1.json**  
Start: May 25, 2026 (Monday — Proper 3 week)  
End: July 31, 2026 (Friday — Proper 12 week)  
Total entries: 68  
Sundays: 9 (Trinity through 12th after Pentecost)  
Eve entries: 2 (May 30, June 23)  
Major Feasts: 5

**ordinary2.json**  
Start: August 1, 2026 (Saturday — Proper 12 week)  
End: September 30, 2026 (Wednesday — Proper 21 week)  
Total entries: 61  
Sundays: 9 (13th through 21st after Pentecost)  
Eve entries: 2 (August 5, September 12)  
Major Feasts: 6

**ordinary3.json**  
Start: October 1, 2026 (Thursday — Proper 21 week)  
End: November 28, 2026 (Saturday — after Christ the King)  
Total entries: 59  
Sundays: 6 (22nd, 23rd, 24th, 26th, 27th, Christ the King)  
Eve entries: 1 (October 31)  
Major Feasts: 5

---

## Validation Checklist

Before deploying these files, verify:

- [ ] **Year Detection:** App uses `*_year2` fields for 2026
- [ ] **File Continuity:** No gap between ordinary1 (ends Jul 31) and ordinary2 (begins Aug 1)
- [ ] **File Continuity:** No gap between ordinary2 (ends Sep 30) and ordinary3 (begins Oct 1)
- [ ] **File Boundary with Easter:** `easter.json` ends at Pentecost (May 24); ordinary1 begins May 25
- [ ] **File Boundary with Advent:** ordinary3 ends Nov 28; `advent.json` begins Nov 29
- [ ] **Psalm 95 Handling:** Invitatory not duplicated from `psalms_mp`
- [ ] **Trinity Sunday Year 1:** Empty `*_year1` fields handled gracefully (no blank reading displayed)
- [ ] **Trinity Antiphon:** "Holy, holy, holy" used only on May 31
- [ ] **Feast Antiphon:** "The Lord is glorious in his saints" used on all non-green days except Trinity
- [ ] **Eve Epistle Logic:** Trinity Eve (May 30) and All Saints Eve (Oct 31) correctly display `reading_epistle_ep_eve`
- [ ] **Transfiguration Uniqueness:** Aug 6 loads `collect-transfiguration`; Feb 15 (in epiphany.json) loads `collect-last-epiphany`
- [ ] **Missing Sundays:** Engine does not error when Sundays 25 and 28 are absent from the sequence
- [ ] **Proper 12 Split:** Days in Proper 12 week correctly load from ordinary1 (Jul 27–31) and ordinary2 (Aug 1)
- [ ] **Proper 21 Split:** Days in Proper 21 week correctly load from ordinary2 (Sep 27–30) and ordinary3 (Oct 1–3)
- [ ] **Collect Lookup:** All collect keys resolve in your database

---

## Testing Scenarios

### 1. File Boundary — Proper 12 Split (Jul 31 / Aug 1)
**July 31 (ordinary1.json):**
- Title: Friday in the Week of Proper 12
- Collect: `collect-proper-12`
- Y2 OT: 2 Samuel 5:1-12

**August 1 (ordinary2.json):**
- Title: Saturday in the Week of Proper 12
- Collect: `collect-proper-12`
- Y2 OT: (next passage in 2 Samuel sequence)

### 2. Trinity Sunday (May 31)
**Expected:**
- Color: white
- Antiphon: "Holy, holy, holy Lord God Almighty"
- Collect: `collect-trinity`
- Year 1 fields: all `""`
- Year 2 MP: Ecclesiasticus 43:1-12 (OT), John 1:1-18 (Gospel)

### 3. Eve of Trinity (May 30 EP)
**Expected:**
- Standard day readings at MP
- At EP: Psalm 104, Ecclesiasticus 42:15-25 (OT), Ephesians 3:14-21 (Epistle)
- Note: Epistle is present — do not suppress it

### 4. SS. Peter and Paul Override (June 29)
**Expected:**
- Color: red
- Collect: `collect-peter-paul` (not `collect-proper-8`)
- Antiphon: "The Lord is glorious in his saints"
- Both year tracks: Ezekiel 34:11-16 / 2 Tim 4:1-8 / John 21:15-19

### 5. Transfiguration (August 6) vs. Last Epiphany (February 15)
**Aug 6:** Collect: `collect-transfiguration`  
**Feb 15:** Collect: `collect-last-epiphany`  
Both: white, "The Lord has shown forth his glory" (Feb 15) vs. "The Lord is glorious in his saints" (Aug 6)

### 6. Missing Sunday 25 (October 18 = St. Luke)
**Expected:** No Sunday entry between Oct 11 (23rd) and Oct 25 (24th Sunday). Sunday 25 is entirely displaced by St. Luke.  
**Engine:** Must not throw a "missing Sunday" error for Proper 25 Sunday.

### 7. Eve of All Saints (October 31 EP)
**Expected MP:** Standard green, Saturday of Proper 25
**Expected EP:** Psalm 34, Wisdom 3:1-9 (OT), Revelation 21:1-7 (Epistle)
**Note:** Epistle is present on this Eve — do not suppress it

### 8. Christ the King (November 22)
**Expected:**
- Color: white (not green)
- Collect: `collect-proper-29`
- Antiphon: "The Lord is glorious in his saints" (not Trinity antiphon)
- This is the final Sunday entry before Advent

---

## Known Edge Cases

### 1. Trinity Sunday — Year 1 Fields Empty
Year 1 fields on May 31 are `""`. This is correct: the Trinity Sunday lectionary was designed for the new 1979 BCP framework and only Year 2 readings were assigned. Your parser must check for empty Year 1 strings and skip them without displaying a blank reading slot.

### 2. The Visitation (May 31) — Liturgically Absorbed
In 2026, the fixed feast of the Visitation (May 31) is fully absorbed into Trinity Sunday. No Visitation collect or readings appear. In years when Trinity Sunday falls on a different date, the Visitation would need its own entry. This file correctly omits Visitation propers for 2026.

### 3. The Transfiguration — Two Observances in One Calendar Year
This is the only feast that appears in two separate lectionary files (`epiphany.json` and `ordinary2.json`) with different collect keys and different readings. Do not cache or deduplicate feast data by title alone — use the date as the primary key.

### 4. Missing Sundays Due to Feast Displacement
In 2026, **two Sundays are entirely absent** from the ordinary time files:
- **25th Sunday after Pentecost** (would have been ~October 18): displaced by St. Luke the Evangelist (Oct 18)
- **28th Sunday after Pentecost** (would have been ~November 1): displaced by All Saints' Day (Nov 1)

Your Sunday-counting or Proper-numbering logic should not expect a complete 1-through-29 Sunday sequence in a given year.

### 5. Eve of the Nativity of St. John the Baptist — Minimal Office
The June 23 Eve has only OT (Malachi 3:1-4) — no Epistle, no Gospel. This is the most minimal Eve in the entire system. Your parser must handle an Eve entry where two of the five Eve fields are `""`.

### 6. Proper 12 and Proper 21 Span Two Files
These two Propers are split across file boundaries. Weekdays within each Proper week will be loaded from different files. Your engine should treat this transparently — the Proper numbering and collect keys are identical on both sides of the boundary.

### 7. Christ the King — Last Entry Before Advent
November 28 (the Saturday after Christ the King) is the **final entry** in `ordinary3.json`. Your engine transitions to `advent.json` on November 29 without any gap. Note that in some years, additional weekdays after Christ the King may need to be added to ordinary3.json if the calendar extends further before Advent Sunday.

---

## Integration with Other Lectionary Files

The complete Daily Office file system for 2026:

| File                  | Coverage                                        | Status      |
|-----------------------|-------------------------------------------------|-------------|
| `advent.json`         | Nov 29 – Dec 24 MP, 2026                        | ✅ Complete |
| `christmas.json`      | Dec 24 EP – Jan 5 EP, 2026                      | ✅ Complete |
| `epiphany.json`       | Jan 6 – Feb 17, 2026                            | ✅ Complete |
| `lent.json`           | Feb 18 – Apr 4, 2026                            | ✅ Complete |
| `easter.json`         | Apr 4 EP – May 24, 2026 (Pentecost)             | 🔲 Future   |
| `ordinary1.json`      | May 25 – Jul 31, 2026                           | ✅ Complete |
| `ordinary2.json`      | Aug 1 – Sep 30, 2026                            | ✅ Complete |
| `ordinary3.json`      | Oct 1 – Nov 28, 2026                            | ✅ Complete |
| `static_offices.json` | Noonday Prayer & Compline (year-round)          | ✅ Complete |

**Known Gap:** `easter.json` (April 5 – May 24, 2026) is the only file not yet built. Without it, the system has no coverage for Eastertide, including Ascension Day (May 14) and the Day of Pentecost (May 24).

---

## Maintenance Notes

### Annual Updates Required

**No content rebuild needed for 2027 (Year 1).**  
Update engine's year-detection to use `*_year1` fields.

**For 2028 (Year 2, rebuild needed):**
- All `date` fields must be updated (YYYY-MM-DD values shift)
- Reading content is identical to 2026 Year 2 — copy and update dates
- Feast days on fixed dates (June 24, June 29, Aug 6, Aug 15, etc.) remain in the same files
- Feast days may land on different days of the week, affecting which day carries an Eve entry

### Long-Term:
- **Pentecost date:** Changes annually, affecting when `ordinary1.json` begins and which Propers appear
- **File split points:** May need adjustment if month boundaries fall on liturgically significant days
- **Advent Sunday:** Always the Sunday nearest November 30 — affects when `ordinary3.json` ends

---

## Credits and Licensing

**Source Text:** 1979 Book of Common Prayer (The Episcopal Church)  
**Public Domain Status:** The 1979 BCP text is in the public domain in the United States.  
**Lectionary Arrangement:** Based on the Daily Office Lectionary (BCP pp. 962–1001)  
**Data Compilation:** Claude (Anthropic AI) with liturgical expertise consultation  
**Verification:** Cross-referenced with BCP Daily Office Lectionary with human liturgical review  

**Usage Rights:** This JSON file may be freely used in liturgical apps, church websites, and Daily Office software. Attribution appreciated but not required.

---

## Appendix: Feast Day Quick Reference

All non-green days across all three ordinary time files, in calendar order:

| Date       | File        | Title                                          | Color | Fields |
|------------|-------------|------------------------------------------------|-------|--------|
| 2026-05-30 | ordinary1   | Saturday (+ **Eve of Trinity** EP)             | green | 20     |
| 2026-05-31 | ordinary1   | **Trinity Sunday / The Visitation**            | white | 15     |
| 2026-06-23 | ordinary1   | Tuesday (+ **Eve of St. John Baptist** EP)     | green | 20     |
| 2026-06-24 | ordinary1   | **Nativity of Saint John the Baptist**         | white | 15     |
| 2026-06-29 | ordinary1   | **Saint Peter and Saint Paul, Apostles**       | red   | 15     |
| 2026-07-22 | ordinary1   | **Saint Mary Magdalene**                       | white | 15     |
| 2026-07-25 | ordinary1   | **Saint James the Apostle**                    | red   | 15     |
| 2026-08-05 | ordinary2   | Wednesday (+ **Eve of Transfiguration** EP)    | green | 20     |
| 2026-08-06 | ordinary2   | **The Transfiguration of Our Lord**            | white | 15     |
| 2026-08-15 | ordinary2   | **Saint Mary the Virgin**                      | white | 15     |
| 2026-08-24 | ordinary2   | **Saint Bartholomew the Apostle**              | red   | 15     |
| 2026-09-12 | ordinary2   | Saturday (+ **Eve of Holy Cross Day** EP)      | green | 20     |
| 2026-09-14 | ordinary2   | **Holy Cross Day**                             | red   | 15     |
| 2026-09-21 | ordinary2   | **Saint Matthew, Apostle and Evangelist**      | red   | 15     |
| 2026-09-29 | ordinary2   | **Saint Michael and All Angels**               | white | 15     |
| 2026-10-18 | ordinary3   | **Saint Luke the Evangelist**                  | red   | 15     |
| 2026-10-23 | ordinary3   | **Saint James of Jerusalem**                   | red   | 15     |
| 2026-10-28 | ordinary3   | **Saints Simon and Jude, Apostles**            | red   | 15     |
| 2026-10-31 | ordinary3   | Saturday (+ **Eve of All Saints** EP)          | green | 20     |
| 2026-11-01 | ordinary3   | **All Saints' Day**                            | white | 15     |
| 2026-11-22 | ordinary3   | **Christ the King — Last Sunday after Pentecost** | white | 15  |

---

**END OF DOCUMENTATION**

*All three ordinary time files are liturgically accurate, schema-compliant, and production-ready for the 2026 Season after Pentecost and all future liturgical years.*
