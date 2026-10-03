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

---

# Update 2026-10-03 (after Josh's answers): revised plan

## 8. Josh's answers (these supersede sections 5 and 6)

- **Goal:** platform stability, speed, reliability.
- **Delivery:** one website plus stand-alone iOS and Android apps. **Offline is required.**
- **Scripture:** the public app does not ship the Bible browser. It ships only scripture displayed
  inside the prayers. The browser stays admin-only (matches `scripture-display-licensing-rescope`).
- **Source of truth:** JSON stays.
- **Bible registry model:** authored by Lucy, so Josh cannot adjudicate it. Treated as unverified
  (Lucy-era work is void as evidence) and kept out of the public app. It stays in the admin/source
  tier only.

## 9. New findings from the repo

1. **Offline does not exist today.** There is no service worker and no web manifest
   (`index.html` has neither). Every page needs the network.
2. **Scripture is fetched at runtime a whole book at a time.** `js/scripture-resolver.js` downloads
   e.g. `data/bible/OT/psalms.json` (1.9 MB) or `jeremiah.json` (1.4 MB) to show a few verses, then
   extracts the range in the browser. A slow connection or a failed fetch (6.5 s timeout) means a
   missing reading. This is the biggest speed and reliability problem in the app, and a database
   would not fix it by itself.
3. **The public app needs far less scripture than the repo holds.** `data/bible/` is 52 MB across
   391 files (OT 24 MB, NT 6 MB, the Douay-Rheims translation folder 10 MB, plus source lanes). The
   offices cite a finite set of passages; the BCP Daily Office lectionary is a fixed two-year cycle.
4. **Licensing is a blocker for the NRSV pack.** The recorded NRSV permission is for devotional
   quotation of verses. Bundling the full set of Daily Office lessons into an app on the Apple and
   Google stores likely exceeds that. Josh needs written permission from the NRSV rights holder
   (the National Council of Churches) before the NRSV lessons ship in a store app. Not verified
   here. The Coverdale psalter in the BCP and public-domain texts are not affected.

## 10. Revised recommendation

**The answer to "stable, fast, offline, on web + iOS + Android" is mainly an offline-first build
pipeline, not a database.** SQLite stays an option for later, not a first step.

1. **One codebase, three delivery forms.** Make the site a PWA (manifest + service worker that
   precaches the app and data pack), then wrap the same build with **Capacitor** (open source,
   Ionic) to produce the iOS and Android apps. Capacitor bundles the web files inside the app, so
   offline works on first launch. This reuses the existing HTML/JS app instead of rewriting it.
2. **A generated "app data pack".** A build script reads the JSON source of truth and emits a
   compact, versioned pack: only passages the offices cite (resolved ahead of time, per
   translation), breviary data split per day instead of per year and language, and the small
   curated corpora as they are. The pack carries a version number so the app can update it safely
   and fall back to the last good copy.
3. **Remove runtime whole-book fetching** from the public path by pointing the resolver at the pack.
   Keep the old resolver for the admin Bible browser only.
4. **Size budget.** The stores limit package size (Google Play's base module and Apple's cellular
   download warning are both in the low hundreds of MB; I have not re-checked the current figures).
   The pack should target well under 50 MB. The breviary (85 MB raw) is the item to shrink first.
5. **Database later, only if measured need.** If the pack proves slow to query on a phone, add
   SQLite (Capacitor has a community SQLite plugin; sql.js works on web) as a build output of the
   same JSON.
6. **Tests that prove it:** a Playwright run with the network disabled that opens each office, and
   a check that every citation in the lectionary resolves from the pack.

## 11. Next decisions for Josh

1. **Approve this direction** (PWA + Capacitor + generated pack), or ask for alternatives.
2. **Developer accounts:** Apple Developer Program and Google Play Console are needed to publish.
   Do you have them, or should the first goal be a working PWA only?
3. **Which offices ship in the first offline release?** All five traditions would carry the full
   breviary and Menaion; a smaller first release is safer for size and for scripture licensing.
4. **NRSV permission:** are you willing to request written permission, or should the first release
   use public-domain scripture only (with NRSV added when permission arrives)?
