# JSON-to-Database Migration: Scoping (2026-10-03)

Status: **scoping only, authorized by Josh 2026-10-03.** No technology chosen, nothing built.
Tracks `structure.json` id `whole-app-json-to-database-migration`.

## 1. Inventory (measured from the repo today)

Shipped runtime data (everything under `data/` except `source-witnesses/`, which `release:web`
already excludes): **~155 MB raw JSON, 721 JSON files repo-wide.**

| Corpus | Raw size | Files | Gzip size | Notes |
|---|---|---|---|---|
| `data/roman-breviary-1960-1962` | 85 MB | 12 | ~10 MB (58 MB measured subset) | Generated artefact. `units/` + `manifests/`, per year (2026, 2027) and per language (la/en): the same structure stored four times. |
| `data/bible` | 52 MB | 391 | ~10 MB | One file per book; each verse object carries every translation in a `text{}` map (e.g. `psalms.json` is an array of `{id, text:{NRSV:…}}`). |
| `data/commentary` | 5 MB | 5 | ~1 MB | `hebrews.json` alone is 3.9 MB. |
| `data/menaion` | 4 MB | 91 | <1 MB | 12 month files plus `lives/`. |
| `data/cycles-of-prayer` | 2.5 MB | 93 | small | 92 validated files. |
| `data/synaxarium`, `saints`, `kalendar` (non-witness), `orthodox-day`, `horologion`, `season`, `explanations`, `icons`, triodion/pentecostarion, `components/` | ~7 MB total | ~170 | small | `saints/sanctoral.json` is 1.4 MB. |

Runtime loaders (all plain `fetch()` of static JSON): 18 files under `js/`; fixed-path loads include
`components/{common,coptic,east-syriac}.json`, `data/season/*.json`, `data/menaion/<Month>.json`,
`data/saints/sanctoral.json`, `data/commentary/readings/<year>.json`, `data/icons/…`. The Bible
browser goes through `js/bible-browser/bible-registry-adapter.js`, which is the one place already
abstracted behind a registry.

## 2. What the data says about the real problem

Josh's stated reason: JSON is not an efficient use of space. Measured:

- **Over the wire, it is already smaller than it looks.** Text-heavy JSON gzips about 5:1
  (breviary and Bible both ~10 MB per 50-60 MB). Whether the live host actually serves gzip/brotli
  for `.json` is **unverified**. If it does not, switching it on is a no-code win.
- **The storage waste is structural, not a JSON problem.** The breviary stores four near-duplicate
  generated copies (year x language); the Bible repeats `id`/key text per verse and keeps all
  translations in one object per verse. A database would normalize these, but so would reshaping
  the JSON.
- **Most of the app is small.** ~10 MB of non-breviary, non-Bible data. A database buys little
  there except consistent querying and one place to enforce integrity.

So the honest framing is: a database is justified for **query and integrity** needs, and for the
**two big corpora** (Bible, breviary). It is a poor fit for the small hand-curated files, which are
read whole and are diffable in git today.

## 3. Constraints that decide the design

1. **Hosting is static with hand uploads** (`npm run release:web` zips, Josh uploads; no auto-deploy).
   The live site also runs a PHP/MySQL backend for Parish Prayer Requests (branch
   `claude/determined-einstein-kny5ms`, `api/`, `api/migrations/001_init.sql`), so a PHP+MySQL host
   exists. Whether it can serve the public prayer content from MySQL, and at what traffic cost, is
   a decision, not a given.
2. **Offline/reliability:** a prayer app people open at 5 a.m. on poor connections favors
   everything-works-from-cache. A server-side DB adds an availability dependency the static site
   does not have today.
3. **Content integrity:** the repo's JSON is diffable, audited and git-versioned (the audit and
   verification scripts read it directly). Any DB must keep JSON (or SQL dumps) as the reviewed
   source of truth with the DB as a **build output**, or the whole audit regime has to be rebuilt.
4. **Scale of change:** 18 loader files, plus resolvers and engines, plus ~dozens of
   `scripts/` readers, all assume file paths.

## 4. Options (best practice and existing open-source building blocks)

Not reinventing: all of these are established, maintained projects. I have not re-checked current
versions or licences in this session; verify before adopting.

**A. Keep JSON, fix the shape (lowest risk).** Enable gzip/brotli; split the breviary by
office/day instead of whole-year blobs; deduplicate la/en and manifests; move Bible to one
translation per file or a compact array form. Needs no new runtime and keeps every audit script.
Likely captures most of the space benefit.

**B. Build-time SQLite, queried in the browser (recommended for the big corpora).** Compile JSON
into one `.sqlite` file at release time; the browser loads it with **sql.js** or the official
**SQLite WASM** build, and for files too big to download whole, **sql.js-httpvfs** (phiresky)
fetches only the pages a query touches over plain HTTP range requests. Works on the current static
host, no server, still cacheable by a service worker. JSON stays source of truth; DB is generated.

**C. Server-side MySQL behind PHP API.** Reuses the existing parish stack. Smallest client, but
adds a server dependency, hosting load, and an API to build and secure; weakest offline story.

**D. IndexedDB (via Dexie or similar).** Client-side cache of fetched JSON. Helps repeat-load speed
and offline; does not reduce first-download size or fix the repo's storage shape.

## 5. Recommendation

Phase it, cheapest-first, and stop when the goal is met:

1. **Measure and fix delivery (A, part 1):** confirm the host serves compressed JSON; record real
   transfer sizes for a typical first load and a typical Bible/breviary read.
2. **Reshape the two big corpora (A, part 2):** breviary dedupe and per-day split; Bible
   per-translation layout. Re-run the existing audits against the new shape.
3. **Decide on B only if needed:** if search, cross-reference or cross-translation queries are
   wanted, build the SQLite output for Bible first (it already has a registry layer to hang it on),
   keep JSON as the audited source.
4. **Leave the ~10 MB of small curated files as JSON** unless a concrete query need appears.

Option C is not recommended unless Josh wants server-side features (accounts, per-user data, live
edits), which the parish backend already covers separately.

## 6. Decisions needed from Josh

1. Is the goal **smaller download/storage**, **faster/better queries** (search, cross-reference),
   or **easier editing/admin** (a content database behind a UI)? The answer picks A, B or C.
2. Must the app keep working **offline / on a static host**? (Rules C out if yes.)
3. The note's original open question: is the Bible registry model (book identity / text form /
   canon profile / translation witness / versification / reference map / resolver contract) the
   **template for other domains**, or does each domain get its own schema? Suggested answer: Bible
   keeps it; other domains get light schemas.
4. Is **JSON-in-git the permanent source of truth**, with any database a generated build output?
   (Strongly recommended; otherwise the audit scripts and the review workflow must be rebuilt.)

## 7. Not done / unverified

- Live-host compression settings and real page-weight numbers.
- Current versions and licences of sql.js, SQLite WASM, sql.js-httpvfs.
- Count and shape of `scripts/` readers that would need updating.
- No schemas drafted, no prototype built.
