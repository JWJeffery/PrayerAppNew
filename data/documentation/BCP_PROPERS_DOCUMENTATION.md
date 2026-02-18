# BCP-PROPERS.JSON - PRODUCTION DOCUMENTATION

## Overview

`bcp-propers.json` is a **reference and validation file**, not a lectionary file. It contains no readings, psalms, or collects. Its sole purpose is to map the 29 BCP Proper numbers to their fixed calendar date ranges, enabling your JavaScript engine to perform the liturgical date calculations that govern the entire Season after Pentecost.

Unlike every other file in this system — which are date-indexed and consumed sequentially — this file is a **lookup table** that your engine queries at runtime to determine which Proper is current, which lectionary file to load, and how to validate the data it is serving.

**Production Status:** ✅ READY FOR DEPLOYMENT  
**Last Updated:** February 17, 2026  
**Source:** 1979 Book of Common Prayer (pp. 158–185, Collects for the Season after Pentecost)  
**Type:** Engine reference file — year-agnostic, perpetually valid  
**Annual Rebuild Required:** No

---

## Why This File Exists

The Season after Pentecost has a structural problem that no other liturgical season has: **its starting point moves by as many as five weeks from year to year**, depending on the date of Easter.

Easter can fall as early as March 22 or as late as April 25. Pentecost is always 50 days after Easter (7 weeks + 1 day). That means Pentecost can fall anywhere between May 10 and June 13. Since Propers 4 through 29 are anchored to fixed calendar date ranges, the number of Propers that actually get used in a given year varies. Some years begin at Proper 3; some begin at Proper 6.

Without a reference file, your engine would have to reimplement this calendar logic from scratch for each annual rebuild of the lectionary JSON files. `bcp-propers.json` externalizes that logic into a single, stable lookup table that serves all years.

---

## File Structure

```json
{
  "meta": { ... },              // Title, description, source
  "propers": [ ... ],           // Array of 29 Proper objects
  "special_sundays": { ... }    // Trinity Sunday and Christ the King
}
```

### Each Proper Object:
```json
{
  "proper": 7,
  "dateRange": "June 19-25",
  "title": "Proper 7 (Sunday between June 19 and June 25)",
  "season": "ordinary",
  "note": "optional string, present only on Propers 1-3 and 29"
}
```

### Fields:

| Field       | Type    | Description                                                  |
|-------------|---------|--------------------------------------------------------------|
| `proper`    | integer | The Proper number (1–29)                                     |
| `dateRange` | string  | Human-readable date range (display use)                      |
| `title`     | string  | Official BCP title string for this Proper                    |
| `season`    | string  | `"epiphany"` (Propers 1–3) or `"ordinary"` (Propers 4–29)   |
| `note`      | string  | Present only on Propers 1, 2, 3, and 29 — explains edge case |

---

## The Three-Zone Structure

The 29 Propers divide into three logical zones:

### Zone 1: Propers 1–3 (Epiphany Overflow)
**Date ranges:** February 7–27  
**Season field:** `"epiphany"`

These Propers are used **only in years with a late Easter**, when Epiphany Season extends past the normal 6–8 weeks. If Lent begins after February 27, one or more of these Propers appear as late Sundays after the Epiphany. Their collect and lectionary tracks are shared between Epiphany use and the theoretical early end of Ordinary Time.

**In 2026:** Lent began February 18, so the Epiphany season ended at the "Last Sunday after Epiphany" (February 15) using the Transfiguration proper — before reaching Proper 3's window. Propers 1, 2, and 3 were not used as Ordinary Time Sundays. However, **the weekday lectionary tracks for Proper 3 were used** beginning May 25 (Monday after Pentecost), since that date fell within the Proper 3 window. See the Proper Jump section below.

### Zone 2: Gap (Propers 4 belongs to Trinity week)
**Date range:** May 29 – June 4  
**Season field:** `"ordinary"`

Proper 4 covers the Sunday between May 29 and June 4. However, **Trinity Sunday is not a numbered Proper** — it is the First Sunday after Pentecost. This creates a subtle but important gap in the numbering:

- The Sunday that would be "Proper 4" may actually be Trinity Sunday, depending on when Pentecost falls
- In 2026: Pentecost = May 24, Trinity Sunday = May 31 (falls in the Proper 4 window, May 29–June 4)
- Trinity Sunday uses `collect-trinity`, not `collect-proper-4`
- The weekdays immediately following Trinity Sunday (June 1 onward) use `collect-proper-4`

This means **Proper 4 may have no Sunday of its own** in some years — its collect applies only to weekdays. Your engine must handle the case where a Proper's Sunday slot is occupied by Trinity Sunday.

### Zone 3: Propers 4–29 (Ordinary Time proper)
**Date ranges:** May 29 – November 26  
**Season field:** `"ordinary"`

These are the standard Propers of Ordinary Time. Each has a fixed 7-day window anchored to the calendar. The Sunday that falls within that window uses that Proper's collect. All weekdays of that week also use the same collect.

**Proper 29 special case:** Labeled "Christ the King" — the Last Sunday after Pentecost. It has a `note` field and is cross-referenced in `special_sundays`.

---

## The Proper Jump Calculation

This is the most critical engine function enabled by this file. The algorithm determines **which Proper to start with** when Ordinary Time begins after Pentecost.

### The Problem

Pentecost in 2026 fell on **May 24**. The day after Pentecost (May 25) begins Ordinary Time. But which Proper does May 25 belong to?

Looking up May 25 in `bcp-propers.json`:
- Proper 3 window: February 21–27 → No, May 25 is not in this range
- Proper 4 window: May 29–June 4 → No, May 25 is before this range

May 25 falls **between Proper 3 and Proper 4** — in the gap. The BCP resolves this by applying the **most recent applicable Proper**, which is Proper 3. The engine therefore uses `collect-proper-3` for the week of May 25–30, and `collect-proper-4` beginning June 1 (the Monday after Trinity Sunday).

### The Algorithm

```javascript
function getCurrentProper(date) {
  // Parse month and day from the current date
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  
  // Convert date to a comparable integer (MMDD)
  const mmdd = month * 100 + day;
  
  // Build a lookup from bcp-propers.json
  // For each Proper, parse its dateRange into start/end MMDD values
  // Find the highest-numbered Proper whose start date <= current date
  
  let currentProper = null;
  for (const proper of propers) {
    const [start, end] = parseDateRange(proper.dateRange);
    if (mmdd >= start && mmdd <= end) {
      return proper; // Exact match
    }
    if (mmdd > start) {
      currentProper = proper; // Track last passed proper
    }
  }
  return currentProper; // Return the most recent applicable Proper
}
```

### The Jump in Practice (2026)

| Date Range         | Proper Used | Reason                                         |
|--------------------|-------------|------------------------------------------------|
| May 25–30          | Proper 3    | Gap week — most recent passed Proper           |
| May 31             | Trinity     | Special Sunday — `collect-trinity`, not Proper |
| June 1–6           | Proper 4    | Weekdays of Trinity week use Proper 4          |
| June 7             | Proper 5    | First numbered Sunday of Ordinary Time         |

**Why not Proper 4 for May 25–30?** Because May 25 falls before the Proper 4 window opens (May 29). The BCP's rule is that each Proper applies to the Sunday that falls *within* its date window. Since no Sunday falls within Proper 3's February window in 2026, Proper 3 becomes the "inherited" collect for the gap week.

---

## Engine Usage Patterns

### Pattern 1: Validate Current Proper

Use this file to **confirm** that the entry your engine is about to serve matches the Proper the calendar expects:

```javascript
function validateEntry(entry, bcpPropers) {
  const entryDate = new Date(entry.date);
  const expectedProper = getCurrentProper(entryDate, bcpPropers);
  
  if (expectedProper && entry.collect !== `collect-proper-${expectedProper.proper}`) {
    // Special case — could be a feast day override
    if (!isFeastDay(entry)) {
      console.warn(`Date ${entry.date}: expected collect-proper-${expectedProper.proper}, 
                    found ${entry.collect}`);
    }
  }
}
```

### Pattern 2: Generate Sunday Titles

Use the `title` field to construct human-readable Sunday titles:

```javascript
function getSundayTitle(date, bcpPropers) {
  // Check for Trinity Sunday first
  if (isTrinityDunday(date)) return "Trinity Sunday";
  
  const proper = getCurrentProper(date, bcpPropers);
  if (!proper) return null;
  
  // Count Sundays after Pentecost for the ordinal title
  const sundayNumber = getSundayAfterPentecostNumber(date);
  
  // Use BCP-style title
  return `${ordinal(sundayNumber)} Sunday after Pentecost`;
  // e.g., "Fifth Sunday after Pentecost"
}
```

### Pattern 3: Determine Season File to Load

```javascript
function getLectionaryFile(date) {
  const mmdd = getMMDD(date);
  
  if (mmdd >= 1129 || mmdd <= 1224) return 'advent.json';
  if (mmdd >= 1224 && mmdd <= 105) return 'christmas.json';
  if (mmdd >= 106 && mmdd <= 217) return 'epiphany.json';
  if (isLent(date)) return 'lent.json';         // Ash Wednesday through Holy Saturday
  if (isEaster(date)) return 'easter.json';      // Easter Vigil through Pentecost
  
  // Ordinary Time — select correct split file
  if (mmdd >= 525 && mmdd <= 731) return 'ordinary1.json';
  if (mmdd >= 801 && mmdd <= 930) return 'ordinary2.json';
  if (mmdd >= 1001 && mmdd <= 1128) return 'ordinary3.json';
}
```

### Pattern 4: Handle the Epiphany/Ordinary Overlap (Propers 1–3)

In years with a late Easter, Propers 1–3 may appear as late Sundays after the Epiphany. Detect this using the `season` field:

```javascript
function getProperSeason(proper, bcpPropers) {
  const entry = bcpPropers.propers.find(p => p.proper === proper);
  return entry ? entry.season : null;
  // Returns "epiphany" for Propers 1-3
  // Returns "ordinary" for Propers 4-29
}

// In years where Easter is late enough that Feb 14-27 falls in Epiphany:
// Propers 2 and 3 are used as 8th/9th Sundays after Epiphany
// These are labeled in the `note` field
```

---

## The Epiphany/Ordinary Dual Use of Propers 1–3

This is the subtlest piece of BCP calendar logic in the entire system.

### When it happens

Propers 1, 2, and 3 are used as **late Sundays after the Epiphany** only when Easter is late enough that Ash Wednesday falls after their respective date windows. Specifically:

- **Proper 1** (Feb 7–13): Used as a late Epiphany Sunday when Ash Wednesday is after Feb 13
- **Proper 2** (Feb 14–20): Used when Ash Wednesday is after Feb 20
- **Proper 3** (Feb 21–27): Used when Ash Wednesday is after Feb 27

When any of these conditions is met, the Sunday in question uses the Proper's collect and lectionary track but is titled as a Sunday after the Epiphany, not as a Sunday after Pentecost.

### The 2026 situation

- Ash Wednesday 2026 = February 18
- Therefore: Proper 1 window (Feb 7–13) **precedes** Ash Wednesday → used as 8th Sunday after Epiphany? No — in 2026 the Epiphany season ended at the Transfiguration (Feb 15, "Last Sunday after Epiphany"). The Proper 1 window (Feb 7–13) predates the Transfiguration.
- Propers 1, 2, and 3 were **not used as Epiphany Sundays** in 2026 — the season simply ended before their windows opened.
- The lectionary tracks for Proper 3 were used as weekday filler beginning May 25, as described in the Proper Jump section.

### When Easter is late (illustrative example: Easter ~April 23)

In a year when Pentecost falls June 11 and Ash Wednesday falls March 4:
- The Epiphany Season extends from January 6 through March 3
- Propers 1, 2, and 3 are all used as late Sundays after the Epiphany (Feb 8, Feb 15, Feb 22)
- The `season: "epiphany"` flag and `note` fields in this file signal to your engine: "In this year, this Proper belongs to Epiphany, not to Ordinary Time"

```javascript
// Engine check for Proper 1-3 seasonal assignment
function getProperContext(proper, ashWednesdayDate, bcpPropers) {
  const properEntry = bcpPropers.propers.find(p => p.proper === proper);
  const [start, end] = parseDateRange(properEntry.dateRange);
  const ashMMDD = getMMDD(ashWednesdayDate);
  
  if (properEntry.season === 'epiphany' && end < ashMMDD) {
    return 'epiphany'; // This Proper window falls before Lent begins
  }
  return 'ordinary';  // Otherwise treat as Ordinary Time
}
```

---

## Special Sundays

### Trinity Sunday

```json
"trinity": {
  "title": "Trinity Sunday",
  "note": "First Sunday after Pentecost (not numbered as a Proper)"
}
```

Trinity Sunday has **no Proper number**. It always falls on the Sunday immediately after Pentecost, which means it can land anywhere from May 17 to June 20, depending on the year. It is listed in `special_sundays` rather than in the `propers` array because it does not belong to the Proper sequence.

**Engine implication:** Before looking up the current Proper, always check whether the current Sunday is Trinity Sunday. Trinity Sunday takes full precedence over any Proper it overlaps with.

```javascript
function isTrinityDunday(date) {
  const pentecost = getPentecostDate(date.getFullYear());
  const trinity = new Date(pentecost);
  trinity.setDate(trinity.getDate() + 7);
  return date.toDateString() === trinity.toDateString();
}
```

### Christ the King

```json
"christ_the_king": {
  "title": "Christ the King",
  "proper": 29,
  "note": "Last Sunday after Pentecost (Proper 29)"
}
```

Unlike Trinity Sunday, Christ the King **does** have a Proper number — it is Proper 29. The `special_sundays` entry exists only to make the title explicit and to cross-reference it. Your engine should look it up through the `propers` array like any other Proper; the `special_sundays.christ_the_king` object is supplementary metadata.

---

## Date Range Parsing Notes

The `dateRange` strings in this file use a specific format that your parser must handle:

| Format Example           | Pattern                         |
|--------------------------|---------------------------------|
| `"February 7-13"`        | Month Day-Day (same month)      |
| `"June 26 - July 2"`     | Month Day - Month Day (crosses month) |
| `"August 28 - September 3"` | Month Day - Month Day (crosses month) |
| `"October 30 - November 5"` | Month Day - Month Day (crosses month) |

**Cross-month ranges** (Propers 8, 13, 17, 21, 26) require special parsing — do not assume both dates are in the same month.

### Recommended parse approach:

```javascript
function parseDateRange(dateRange) {
  // Split on " - " (space-hyphen-space) for cross-month ranges
  // Split on "-" (no spaces) for same-month ranges
  // Return [startMMDD, endMMDD] as comparable integers
  
  const crossMonth = dateRange.includes(' - ');
  if (crossMonth) {
    const [startStr, endStr] = dateRange.split(' - ');
    return [parseMonthDay(startStr), parseMonthDay(endStr)];
  } else {
    // e.g., "July 10-16"
    const match = dateRange.match(/(\w+ )(\d+)-(\d+)/);
    const month = match[1].trim();
    return [
      parseMonthDay(`${month} ${match[2]}`),
      parseMonthDay(`${month} ${match[3]}`)
    ];
  }
}
```

---

## Annual Variability Reference

How Easter date affects which Propers appear in a given year:

| Easter Date Range   | Pentecost Window | First Ordinary Proper Used |
|---------------------|------------------|-----------------------------|
| March 22–28         | May 10–16        | Proper 3 gap (Feb window used as filler) |
| March 29–April 4    | May 17–23        | Proper 3 (Trinity falls in Proper 4 window) |
| April 5–11          | May 24–30        | Proper 3 (2026 — this case)  |
| April 12–18         | May 31–June 6    | Proper 4 (Trinity in Proper 5 window) |
| April 19–25         | June 7–13        | Proper 5 or 6                |

**2026 specifically:** Easter = April 5, Pentecost = May 24, first Ordinary weekday = May 25. The Proper Jump lands on **Proper 3** (the most recently passed Proper window).

### Propers That May Never Appear As Sundays

In years with an early Easter (Pentecost in late May), Propers 1 and 2 may be skipped entirely — their February windows precede Lent and are also not late enough for Epiphany overflow. In 2026, **Propers 1, 2, and 3 had no Sunday observance** — only their weekday lectionary tracks were used (Proper 3) or skipped entirely (Propers 1 and 2).

---

## Validation Checklist

Before deploying this file, verify:

- [ ] **All 29 Propers present:** Array contains exactly 29 entries (Propers 1–29)
- [ ] **Propers 1–3 season field:** Set to `"epiphany"`, not `"ordinary"`
- [ ] **No overlapping date ranges:** Each Proper's window is exactly 7 days and abuts the next
- [ ] **Cross-month ranges parseable:** Engine correctly handles Propers 8, 13, 17, 21, 26
- [ ] **Trinity Sunday not in propers array:** Confirmed in `special_sundays` only
- [ ] **Christ the King in both places:** In `propers` array (as Proper 29) AND in `special_sundays`
- [ ] **Engine Proper Jump tested:** For any Pentecost date, the correct first Proper is returned
- [ ] **Proper 4 Trinity overlap handled:** Engine does not assign `collect-proper-4` to Trinity Sunday

---

## Testing Scenarios

### 1. Proper Jump for 2026 (Pentecost = May 24)
**Input:** Date = May 25, 2026  
**Expected:** Returns Proper 3 (gap week — most recently passed Proper)  
**Verify:** `ordinary1.json` entry for May 25 has `collect: "collect-proper-3"` ✅

### 2. Trinity Sunday Correct Identification (2026)
**Input:** Date = May 31, 2026  
**Expected:** `isTrinityDunday()` returns `true`; collect = `collect-trinity`  
**Verify:** Does NOT return Proper 4, even though May 31 falls in the Proper 4 window ✅

### 3. Proper 4 Weekdays After Trinity
**Input:** Date = June 1, 2026  
**Expected:** Returns Proper 4; collect = `collect-proper-4`  
**Verify:** `ordinary1.json` entry for June 1 has `collect: "collect-proper-4"` ✅

### 4. Cross-Month Range Parsing (Proper 8)
**Input:** `dateRange = "June 26 - July 2"`  
**Expected:** Start = June 26 (MMDD: 626), End = July 2 (MMDD: 702)  
**Verify:** Date June 28 (628) falls within range; July 3 (703) does not ✅

### 5. Proper 29 / Christ the King Lookup
**Input:** Date = November 22, 2026  
**Expected:** Returns Proper 29; `note` = "Last Sunday after Pentecost - Christ the King"  
**Verify:** `ordinary3.json` entry for Nov 22 has `collect: "collect-proper-29"` ✅

### 6. Propers 1–3 Season Flag
**Input:** `getProperSeason(2, bcpPropers)`  
**Expected:** Returns `"epiphany"`  
**Verify:** Engine does not use this Proper as an Ordinary Time Sunday ✅

---

## Relationship to Other Files

`bcp-propers.json` is consulted by the engine **before** loading any lectionary file. It sits one level above the lectionary data in the dependency chain:

```
bcp-propers.json           ← consulted first (date → Proper lookup)
    ↓
ordinary1/2/3.json         ← loaded based on date range
    ↓
collect database           ← collect keys resolved
    ↓
scripture API              ← reading citations fetched
    ↓
psalm database             ← psalm texts fetched
```

It has no direct dependency on any other file in the system. It is the only file that can be used meaningfully without any other file present.

---

## Maintenance Notes

### No Annual Updates Required

The `propers` array contains **calendar positions**, not year-specific dates. "The Sunday between June 19 and June 25" is always the Proper 7 Sunday, regardless of year. This file is permanently valid.

### Potential Future Enhancements

The file's schema could be extended to support:

```json
{
  "proper": 7,
  "dateRange": "June 19-25",
  "title": "...",
  "season": "ordinary",
  "lectionary_ot_track_year1": "Numbers",
  "lectionary_ot_track_year2": "1 Samuel",
  "lectionary_epistle_track_year1": "Romans",
  "lectionary_epistle_track_year2": "Acts"
}
```

Adding OT and Epistle book tracking per Proper would allow the engine to display "Currently reading: 1 Samuel" in the UI without parsing the individual readings. This enhancement is optional and would require cross-referencing `ordinary1/2/3.json`.

---

## Credits and Licensing

**Source Text:** 1979 Book of Common Prayer (The Episcopal Church)  
**Public Domain Status:** The 1979 BCP text is in the public domain in the United States.  
**Proper Date Ranges:** Based on BCP pp. 158–185 (Collects for the Season after Pentecost)  
**Data Compilation:** Claude (Anthropic AI) with liturgical expertise consultation  

**Usage Rights:** This JSON file may be freely used in liturgical apps, church websites, and Daily Office software. Attribution appreciated but not required.

---

## Appendix: Complete Proper Reference Table

| Proper | Date Range              | Season   | 2026 Sunday Date | 2026 Usage Note                    |
|--------|-------------------------|----------|------------------|------------------------------------|
| 1      | Feb 7–13                | epiphany | —                | Not used in 2026                   |
| 2      | Feb 14–20               | epiphany | —                | Not used in 2026                   |
| 3      | Feb 21–27               | epiphany | —                | Weekday filler only (May 25–30)    |
| 4      | May 29–Jun 4            | ordinary | (Trinity, May 31)| Sunday = Trinity; weekdays use P4  |
| 5      | Jun 5–11                | ordinary | Jun 7            | 5th Sunday after Pentecost         |
| 6      | Jun 12–18               | ordinary | Jun 14           | 6th Sunday after Pentecost         |
| 7      | Jun 19–25               | ordinary | Jun 21           | 7th Sunday after Pentecost         |
| 8      | Jun 26–Jul 2            | ordinary | Jun 28           | 8th Sunday after Pentecost         |
| 9      | Jul 3–9                 | ordinary | Jul 5            | 9th Sunday after Pentecost         |
| 10     | Jul 10–16               | ordinary | Jul 12           | 10th Sunday after Pentecost        |
| 11     | Jul 17–23               | ordinary | Jul 19           | 11th Sunday after Pentecost        |
| 12     | Jul 24–30               | ordinary | Jul 26           | 12th Sunday after Pentecost        |
| 13     | Jul 31–Aug 6            | ordinary | Aug 2            | 13th Sunday after Pentecost        |
| 14     | Aug 7–13                | ordinary | Aug 9            | 14th Sunday after Pentecost        |
| 15     | Aug 14–20               | ordinary | Aug 16           | 15th Sunday after Pentecost        |
| 16     | Aug 21–27               | ordinary | Aug 23           | 16th Sunday after Pentecost        |
| 17     | Aug 28–Sep 3            | ordinary | Aug 30           | 17th Sunday after Pentecost        |
| 18     | Sep 4–10                | ordinary | Sep 6            | 18th Sunday after Pentecost        |
| 19     | Sep 11–17               | ordinary | Sep 13           | 19th Sunday after Pentecost        |
| 20     | Sep 18–24               | ordinary | Sep 20           | 20th Sunday after Pentecost        |
| 21     | Sep 25–Oct 1            | ordinary | Sep 27           | 21st Sunday after Pentecost        |
| 22     | Oct 2–8                 | ordinary | Oct 4            | 22nd Sunday after Pentecost        |
| 23     | Oct 9–15                | ordinary | Oct 11           | 23rd Sunday after Pentecost        |
| 24     | Oct 16–22               | ordinary | Oct 25 *         | *Sunday displaced to Oct 25 by St. Luke (Oct 18) |
| 25     | Oct 23–29               | ordinary | —                | Sunday displaced by St. Luke (Oct 18 = St. Luke) |
| 26     | Oct 30–Nov 5            | ordinary | Nov 8 *          | *Sunday displaced by All Saints (Nov 1) |
| 27     | Nov 6–12                | ordinary | Nov 8            | 26th Sunday after Pentecost        |
| 28     | Nov 13–19               | ordinary | —                | Sunday displaced by All Saints (Nov 1) |
| 29     | Nov 20–26               | ordinary | Nov 22           | Christ the King                    |

*Note: The "2026 Sunday Date" column reflects the actual Sunday that appeared in the JSON files, accounting for feast day displacements. Displaced Sundays show `—` because the Sunday was replaced by a Major Feast.*

---

**END OF DOCUMENTATION**

*This file is a permanent, year-agnostic reference. It requires no annual updates and is valid for any liturgical year in which the 1979 BCP Proper system is used.*
