# CHRISTMAS SEASON LECTIONARY - DOCUMENTATION
## 1979 Book of Common Prayer Daily Office

## FILES

### christmas.json
Contains all variable daily readings for the Christmas season (Dec 25 - Jan 5).

### static_offices.json
Contains fixed psalms and readings for Noonday Prayer and Compline that rotate using daily seed method.

---

## CHRISTMAS.JSON SCHEMA

### Standard Fields (All Days)
Every day contains exactly 15 fields:

1. `date` - ISO format date string
2. `title` - Liturgical day name
3. `season` - Always "christmas" for this file
4. `liturgicalColor` - "white" or "red" (for martyrs)
5. `collect` - Reference to collect key
6. `antiphon_mp` - Morning Prayer antiphon
7. `antiphon_ep` - Evening Prayer antiphon
8. `psalms_mp` - Morning Prayer psalms (comma-separated string)
9. `psalms_ep` - Evening Prayer psalms (comma-separated string, or "" if none)
10. `reading_ot_mp_year1` - Year 1 Old Testament at Morning Prayer
11. `reading_epistle_mp_year1` - Year 1 Epistle at Morning Prayer
12. `reading_gospel_ep_year1` - Year 1 Gospel at Evening Prayer
13. `reading_ot_mp_year2` - Year 2 Old Testament at Morning Prayer
14. `reading_epistle_ep_year2` - Year 2 Epistle at Evening Prayer
15. `reading_gospel_mp_year2` - Year 2 Gospel at Morning Prayer

### Additional Fields (Days with Eves: Dec 31, Jan 5)
These days add 5 more fields (20 total):

16. `eve_title` - Title of the Eve celebration
17. `psalms_ep_eve` - Eve psalms (replaces regular EP psalms)
18. `reading_ot_ep_eve` - Eve Old Testament reading
19. `reading_epistle_ep_eve` - Eve Epistle reading
20. `reading_gospel_ep_eve` - Eve Gospel reading (usually "")

---

## READING DISTRIBUTION PATTERN

Per BCP p.934, the Daily Office provides 3 readings per day distributed as follows:

### Year 1 (Odd-numbered years: 2025, 2027, etc.)
- **Morning Prayer**: Old Testament + Epistle
- **Evening Prayer**: Gospel

### Year 2 (Even-numbered years: 2026, 2028, etc.)
- **Morning Prayer**: Old Testament + Gospel  
- **Evening Prayer**: Epistle

### Exception: Holy Days (Dec 26-28)
Major Feasts use the same readings for both Year 1 and Year 2:
- All three readings appear in both year fields
- Distribution remains MP: OT + Epistle, EP: Gospel

---

## SPECIAL CASES

### December 31 - Eve of the Holy Name
Evening Prayer uses special "Eve" readings instead of the regular Wednesday after Christmas EP readings:
- Regular EP: empty (no psalms or readings listed in BCP)
- Eve EP: Psalm 90, Isaiah 65:15b-25, Revelation 21:1-6

### January 5 - Eve of the Epiphany
Evening Prayer uses special "Eve" readings instead of the regular Monday before Epiphany EP readings:
- Regular EP: empty (no psalms or readings listed in BCP)
- Eve EP: Psalm 29, 98; Isaiah 66:18-23, Romans 15:7-13

---

## COLLECTS

The `collect` field references these keys (defined elsewhere in your app):

- `collect-christmas` - Christmas Day and weekdays after
- `collect-st-stephen` - December 26
- `collect-st-john` - December 27
- `collect-holy-innocents` - December 28
- `collect-holy-name` - January 1
- `collect-christmas-2` - Second Sunday after Christmas
- `collect-epiphany` - January 5 (transitioning to Epiphany)

---

## STATIC_OFFICES.JSON STRUCTURE

### Noonday Prayer
- **Psalms**: 3 options (rotate daily)
  - Psalm 119:105-112 (primary option from BCP p.107)
  - Psalm 121
  - Psalm 126

- **Readings**: 5 options (rotate daily)
  - All citations from BCP p.107 suggested readings
  - Citations only (text fetched by scripture parser)

### Compline
- **Psalms**: 4 options (rotate weekly per BCP p.133)
  - Sunday: Psalm 4
  - Monday: Psalm 31:1-6
  - Tuesday-Saturday: Psalm 91, 134 (alternating)

- **Readings**: 5 options (rotate daily)
  - All citations from BCP p.134 suggested readings
  - Citations only (text fetched by scripture parser)

### Daily Seed Rotation
Use this algorithm for consistent daily rotation:

```javascript
const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
const psalmIndex = dayOfYear % psalms.length;
const readingIndex = dayOfYear % readings.length;
```

This ensures:
- All users see the same psalm/reading on the same day
- Readings rotate predictably
- Full rotation through all options over time

---

## DATA SOURCES

All readings verified from:
- **1979 BCP Daily Office Lectionary**, pages 934-941
  - Concerning the Daily Office Lectionary (p.934-935)
  - Christmas Season (p.940-941)
- **Daily Office Lectionary: Holy Days**, pages 996+
  - St. Stephen, St. John, Holy Innocents
- **Noonday Prayer**, pages 103-107
- **Compline**, pages 127-135

---

## YEAR DETERMINATION

The Daily Office uses a 2-year cycle:
- **Year 1**: Begins First Sunday of Advent before odd-numbered years
- **Year 2**: Begins First Sunday of Advent before even-numbered years

Example:
- First Sunday of Advent 2024 → Year 1 begins (2025 is odd)
- First Sunday of Advent 2025 → Year 2 begins (2026 is even)

To determine current year in code:
```javascript
const adventYear = (currentMonth >= 11) ? currentYear + 1 : currentYear;
const lectYear = (adventYear % 2 === 1) ? 1 : 2;
```

---

## IMPLEMENTATION NOTES

### Empty String Fields
When a field shows `""`, it means:
- No reading/psalm assigned for that office
- App should skip/hide that element in UI
- Common for Evening Prayer psalms on days with Eves

### Psalm Citation Format
Psalms are comma-separated strings:
- `"Psalm 2, Psalm 85"` - multiple psalms
- `"Psalm 110:1-5, Psalm 132"` - with verse ranges
- Parse by splitting on comma, trimming whitespace

### Reading Citation Format
All citations are direct BCP format:
- Book name followed by chapter:verse ranges
- Multiple ranges separated by commas or semicolons
- Example: `"Acts 6:8-7:2a,51c-60"`
- Your scripture parser should handle these directly

### Antiphon Usage
Antiphons are repeated before and after psalms/canticles:
- Sung or said at beginning and end of each psalm
- Or used as refrain after each verse/group
- Same antiphon for all psalms in that office
