# SCRIPTURE-RESOLVER.JS - PRODUCTION DOCUMENTATION

## Overview

This module handles all Bible text fetching and extraction for The Universal Office. It is a collection of global functions (not a class) responsible for parsing BCP-style scripture citations, loading the correct JSON Bible book files, and extracting the requested verse ranges.

**Production Status:** ✅ OPERATIONAL  
**Last Updated:** February 22, 2026  
**Current Line Count:** 124 lines  
**Architecture Role:** Scripture fetching and text extraction module  
**Global Exposure:** `getScriptureText()` (primary entry point)

---

## Critical Implementation Notes

### 1. LRU Cache for Bible Books

Bible book JSON files are large (100KB–2MB each). The module implements a simple LRU (Least Recently Used) cache limited to 20 books:

```javascript
const bibleCache = { books: {}, accessOrder: [], MAX_CACHED_BOOKS: 20 }
```

- When a 21st book is loaded, the oldest access is evicted from `bibleCache.books`
- This prevents memory bloat on mobile devices
- Cache is session-scoped — cleared on page reload

### 2. Multi-Citation Parsing

BCP-style citations can include multiple books or discontinuous passages separated by commas. The parser must distinguish between:

- `"Jeremiah 4:9, 19"` — comma separating verses **within the same chapter** (not a new book)
- `"Psalm 42, Psalm 43"` — comma separating **two distinct books/psalms**
- `"Isaiah 58:1-9, Romans 12:1-8"` — comma separating **two distinct books**

**The smart split regex:** `/,(?=\s*[a-zA-Z])/`  
Only splits on commas that are **followed by a letter**. This correctly handles `"Jeremiah 4:9, 19"` (the `19` has no letter) as one citation while splitting `"Psalm 42, Psalm 43"` correctly.

### 3. Verse Number Stripping

The final output strips verse numbers from the text:
```javascript
return extractedText.replace(/\d+:\d+ /g, '').trim();
```
This produces clean liturgical reading text without `"4:9 The heart of the king..."` prefixes. Users see prose, not a verse-annotated reference.

---

## Global Variables

| Variable | Type | Purpose |
|---|---|---|
| `bibleCache` | Object | LRU cache: `{books: {}, accessOrder: [], MAX_CACHED_BOOKS: 20}` |
| `NT_BOOKS` | Array | List of New Testament filenames (without `.json`) for folder routing |
| `BOOK_ALIASES` | Object | Maps variant book names to canonical filenames |

---

## Book Alias Table

The `BOOK_ALIASES` object maps common alternate names to canonical JSON filenames:

| Alias (normalized) | Canonical File |
|---|---|
| `ecclesiasticus` | `sirach` |
| `wisdomofsolomon` | `wisdom` |
| `songofthreeyoungmen` | `daniel` |
| `songofthreeholychildren` | `daniel` |
| `belandthedragon` | `daniel` |
| `bel` | `daniel` |
| `susanna` | `daniel` |
| `prayerofazariah` | `daniel` |
| `therestofesther` | `estherGK` |
| `additionstoesther` | `estherGK` |
| `therestofdaniel` | `danielGK` |
| `additionstodaniel` | `danielGK` |
| `songsofsolomon` | `songofsolomon` |
| `canticles` | `songofsolomon` |
| `canticleofcanticles` | `songofsolomon` |

**Normalization process:** Book names are lowercased and all whitespace removed before alias lookup:
```javascript
bookName = book.toLowerCase().replace(/\s/g, '')
```

---

## Function Reference

### `getScriptureText(citation)` — async
**The primary public entry point.** Called from `office-ui.js` `renderOffice()` for every psalm and scripture reading.

**Parameters:** `citation` — BCP-style citation string (e.g., `"Isaiah 40:1-11"`)  
**Returns:** Plain text string of the requested scripture, verses stripped of numbers

**Algorithm:**
1. Guard: return `'No reference provided.'` if citation is empty
2. Smart-split on `/,(?=\s*[a-zA-Z])/` to separate multi-book citations
3. For each part, match against `/^(.+?)\s*(\d+.*)$/` to extract book name and chapter/verse range
4. If no book name in the part (e.g., trailing `"19"` in `"Jeremiah 4:9, 19"`), inherit the last seen book name via `currentBook`
5. Call `extractFromBook()` for each resolved book + range pair
6. Join all results with `\n\n` and return

**Example Inputs:**
```
"Isaiah 40:12-23"                    → single chapter range
"Psalm 119:105-112"                  → psalm with verse range
"Psalm 42, Psalm 43"                 → two distinct psalms
"Joel 2:1-2, 12-17"                  → non-contiguous verses, same chapter
"Jeremiah 4:9, 19"                   → non-contiguous verses, same chapter (no new book)
"1 Corinthians 13:1-13"              → numbered book
"Ecclesiasticus 3:3-9"               → alias (→ sirach.json)
```

---

### `extractFromBook(book, ranges)` — async
**Internal routing function.** Determines the correct JSON file and folder, manages cache, and dispatches to the appropriate extraction function.

**Parameters:**
- `book` — Book name string (may be unnormalized)
- `ranges` — Array of verse range strings (e.g., `["1-11", "15-22"]`)

**Returns:** Extracted text string (verse numbers stripped)

**Routing Logic:**
```
Is book name "psalm*"?
  → isPsalm = true → filename = "psalms.json" → folder = "OT"
  → call extractPsalmRange() for each range

Otherwise:
  → normalize bookName (lowercase, no spaces)
  → apply BOOK_ALIASES if applicable
  → filename = bookName + ".json"
  → folder = NT_BOOKS.includes(bookName) ? "NT" : "OT"
  → call extractBookRange() for each range
```

**Fetch Path:** `data/bible/${folder}/${filename}`

**Cache Behavior:**
1. Check `bibleCache.books[filename]`
2. If miss: fetch, parse, store in cache, update `accessOrder`
3. If cache exceeds 20 books: `delete bibleCache.books[accessOrder.shift()]`
4. On fetch error: return `[Scripture unavailable: ${book}]`

---

### `extractPsalmRange(psalmsData, range)` — async
**Extracts verses from the Psalms JSON structure.**

**Parameters:**
- `psalmsData` — Parsed psalms.json content
- `range` — String like `"42"`, `"119:105-112"`, or `"95"`

**Range Parsing:**
- With colon: `"119:105-112"` → psalmNum=119, verseStart=105, verseEnd=112
- Without colon: `"42"` → psalmNum=42, verseStart=1, verseEnd=Infinity (full psalm)

**Psalm Lookup:** Searches for entry with `id === "PSALM N"` (uppercase)

**Verse Extraction:** Iterates `psalm.text.NRSV` line by line, including lines where verse number is within the requested range

**Returns:** Text block ending with `\n\n`

---

### `extractBookRange(bookData, bookName, range)` — sync
**Extracts verses from a standard Bible book JSON structure.**

**Parameters:**
- `bookData` — Parsed book JSON (the first element if the file is an array)
- `bookName` — Original book name string (for error messages)
- `range` — String like `"1-11"` or `"3:1-15"`

**Range Parsing:**
- With colon: `"3:1-15"` → chapter 3, verses 1-15
- Without colon: `"1-11"` → uses `window.lastChapter` (persistent cross-range state), verses 1-11

**`window.lastChapter` — Cross-Range State:**  
When `extractFromBook()` processes a citation like `"Joel 2:1-2, 12-17"`, the range `"12-17"` has no chapter number. The function stores the last chapter seen in `window.lastChapter` so the next sub-range can inherit it.

⚠️ **Note:** `window.lastChapter` is a global variable. If multiple scripture fetches happen concurrently (which they can in async contexts), this could theoretically cause a race condition. In practice this has not been observed as an issue.

**Verse Extraction:** Finds the chapter by `ch.num === chNum`, then iterates `chapter.verses` collecting those with `v.num >= vStart && v.num <= vEnd`

**Output Format:** `"${chNum}:${v.num} ${v.text}\n"` per verse — chapter:verse prefix is then stripped by `getScriptureText()`

---

## Bible Library Structure

Files are organized in `data/bible/` with subdirectories:

| Folder | Contents |
|---|---|
| `NT/` | 27 canonical New Testament books + apocryphal NT texts |
| `OT/` | 39 canonical OT books + Deuterocanon + apocryphal texts |
| `ET/` | Ethiopian Orthodox broader canon (Enoch, Jubilees, Clement series, etc.) |
| `SY/` | Syriac tradition texts (2 Baruch, Letter of Baruch, Odes of Solomon, etc.) |
| `AR/` | Armenian tradition texts (3 Corinthians, Prayer of Apollonius, etc.) |
| `ODES/` | Biblical canticles and odes from multiple traditions |

### JSON File Structure — Standard Books

```json
[
  {
    "book": "Isaiah",
    "chapters": [
      {
        "num": 1,
        "verses": [
          { "num": 1, "text": "The vision of Isaiah son of Amoz..." },
          { "num": 2, "text": "..." }
        ]
      }
    ]
  }
]
```

Note: Standard book files are arrays with one element. `extractFromBook()` handles this:
```javascript
const bookData = (!isPsalm && Array.isArray(bibleCache.books[filename])) 
  ? bibleCache.books[filename][0] 
  : bibleCache.books[filename];
```

### JSON File Structure — Psalms

```json
[
  {
    "id": "PSALM 1",
    "text": {
      "NRSV": "1:1 Happy are those who do not follow...\n1:2 but their delight is in the law of the LORD..."
    }
  }
]
```

Psalm text uses the format `"chapter:verse text"` per line in a single string. `extractPsalmRange()` splits on newlines and parses each line.

---

## Edge Cases and Known Limitations

### 1. Non-Contiguous Verses in Same Chapter
`"Joel 2:1-2, 12-17"` works correctly via the `window.lastChapter` mechanism. The smart split regex preserves `"12-17"` as part of the Joel citation since `12` is not preceded by a letter.

### 2. Semicolons in Citations
BCP citations sometimes use semicolons for multi-chapter passages: `"Isaiah 58:1-9; 9b-12"`. The current parser does **not** split on semicolons. Such citations may not resolve correctly.
- **Workaround:** The app uses the full extended reading `"58:1-12"` in this case per project policy.

### 3. BCP Optional Endings — `()`
Some BCP citations include optional verses in parentheses: `"Isaiah 58:1-9a(9b-12)"`. The parser does not handle parenthetical extensions. These should be resolved to full readings in the JSON data before storage.

### 4. Books Outside NT and OT Folders
Books in `ET/`, `SY/`, `AR/`, and `ODES/` folders cannot currently be fetched by this resolver — it only routes to `NT/` and `OT/`. Fetching from broader canon books would require extending the routing logic.

### 5. Greek Additions to Daniel and Esther
The aliases `danielGK` and `estherGK` correctly route to `data/bible/OT/danielGK.json` and `data/bible/OT/estherGK.json`. These files must exist with the standard chapter/verse structure.

---

## Validation Checklist

- [ ] `NT_BOOKS` array is current — all NT filenames (without `.json`) are listed
- [ ] `BOOK_ALIASES` covers all alternate names used in seasonal lectionary JSON files
- [ ] `bibleCache.MAX_CACHED_BOOKS` is set to 20 (prevents mobile memory issues)
- [ ] `window.lastChapter` does not persist incorrectly across unrelated scripture calls
- [ ] Verse number stripping regex `\d+:\d+ ` does not accidentally strip content text
- [ ] `extractPsalmRange()` handles full psalm (no colon) and verse range (with colon) correctly

---

## Testing Scenarios

### 1. Simple Book Citation
**Input:** `"Romans 8:1-11"`  
**Expected:** Text of Romans 8:1-11, no verse prefixes

### 2. Full Psalm
**Input:** `"Psalm 23"`  
**Expected:** All 6 verses of Psalm 23, no verse prefixes

### 3. Psalm Verse Range
**Input:** `"Psalm 119:105-112"`  
**Expected:** Psalm 119 verses 105-112 only

### 4. Multiple Psalms
**Input:** `"Psalm 42, Psalm 43"`  
**Expected:** Full text of Psalm 42 followed by full text of Psalm 43

### 5. Discontinuous Verses
**Input:** `"Joel 2:1-2, 12-17"`  
**Expected:** Joel 2:1-2 then Joel 2:12-17, no gap text, no verse prefixes

### 6. Book Alias
**Input:** `"Ecclesiasticus 3:3-9"`  
**Expected:** Text from sirach.json chapter 3 verses 3-9

### 7. Cache Eviction
Load 21 different Bible books in sequence. Verify the first book loaded is no longer in `bibleCache.books` after the 21st load.

---

## Credits

**Module:** Universal Office Scripture Resolver  
**Architecture:** Claude (Anthropic AI) with user direction  
**Bible Text Source:** NRSV and traditional liturgical translations  
**Cache Strategy:** LRU eviction, max 20 books

---

**END OF DOCUMENTATION**

*For calendar logic, see CALENDAR_ENGINE_DOCUMENTATION.md. For UI rendering, see INDEX_HTML_DOCUMENTATION.md.*



================================================
FILE: data/documentation/STATIC_OFFICES_DOCUMENTATION.md
