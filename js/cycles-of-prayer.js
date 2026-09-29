/**
 * Diocesan Cycle of Prayer -- loads and resolves the per-diocese weekly
 * prayer-rotation corpus in data/cycles-of-prayer/. See that directory's own
 * schema.json for the file shape and governing rules; this module does not
 * duplicate that documentation, only implements against it.
 *
 * Loaded (deferred) before js/office-ui.js, which calls into it from the
 * profile setters and from the BCP "authorized intercessions" render hook.
 */

// Which dioceses this app actually has ingested Cycle of Prayer CONTENT for
// -- NOT the full list of what a user may declare in their profile (see
// TEC_DIOCESE_DIRECTORY below for that, added 2026-09-29; a diocese can be a
// valid profile choice with no entry here at all, meaning "declared, but
// this app has no cycle content to render for it yet"). Kept in sync BY HAND
// with the files actually present in data/cycles-of-prayer/ -- mirrors the
// same small hand-maintained registry pattern js/office-ui.js already uses
// for UNIVERSAL_OFFICE_PARISH_DEDICATION_VALUES. `bodySlug`/`dioceseShort`
// match that directory's schema.json field names exactly; a diocese's
// identity here is NOT year-scoped (the year-specific file is resolved
// separately, at query time, against whatever year is actually being asked
// about), so a user's saved diocese choice does not go stale every January
// the way a year-embedded id would.
// `cycleType` mirrors the same field in each diocese's own JSON file (see
// data/cycles-of-prayer/schema.json) -- 'dated' (the default, omitted below)
// for a file keyed by specific ISO calendar dates within a stated `year`,
// 'monthly-recurring' for a standing cycle keyed by bare day-of-month (1-31)
// with no year at all. Kept here too (duplicated with the file's own field)
// because this registry has to pick a load path and cache key BEFORE
// fetching the file -- see loadCycleOfPrayerYear/getCachedCycleOfPrayerWeek.
const CYCLES_OF_PRAYER_DIOCESES = Object.freeze([
    { bodySlug: 'episcopal', dioceseShort: 'western-oregon', label: 'The Episcopal Church in Western Oregon' },
    { bodySlug: 'episcopal', dioceseShort: 'alabama', label: 'The Episcopal Diocese of Alabama' },
    { bodySlug: 'episcopal', dioceseShort: 'alaska', label: 'The Episcopal Diocese of Alaska' },
    { bodySlug: 'episcopal', dioceseShort: 'albany', label: 'The Episcopal Diocese of Albany' },
    { bodySlug: 'episcopal', dioceseShort: 'arizona', label: 'The Episcopal Diocese of Arizona' },
    { bodySlug: 'episcopal', dioceseShort: 'arkansas', label: 'The Episcopal Diocese of Arkansas', cycleType: 'monthly-recurring' }
]);

function cycleOfPrayerDioceseKey(bodySlug, dioceseShort) {
    return bodySlug + '/' + dioceseShort;
}

/**
 * ADDED 2026-09-29, per Josh's direct instruction that the profile ask for a
 * user's real diocese/parish regardless of whether this app has ingested
 * that diocese's actual Cycle of Prayer content yet. Whether a key is
 * "valid" (may be saved to the profile at all) is now scoped to this much
 * larger name-only directory, NOT to CYCLES_OF_PRAYER_DIOCESES above (which
 * stays the much shorter "do we actually have a file to fetch" list --
 * findCycleOfPrayerDiocese/loadCycleOfPrayerYear still key off that one
 * unchanged, and already degrade to "no data" gracefully, with no fetch
 * attempted at all, when a directory-valid diocese isn't in it).
 */
const TEC_DIOCESE_DIRECTORY_BODY_SLUG = 'episcopal';

// Every TEC diocese/jurisdiction Josh's own roster spreadsheet names ("TEC
// Diocesan Cycles of Prayer 2026 - CURRENT 88 located.xlsx", Google Drive
// file id 1F5-ylNoYBx5ecfxvdmPNv4uZTTRPf6CR, checked 2026-09-28 -- see
// data/cycles-of-prayer/schema.json's own tecDioceseRoster block) -- 88 with
// a located current cycle plus 18 confirmed to have no verified current
// cycle as of that check, 106 total. `label` is the roster's own short name
// (e.g. "Western Oregon", "East Tennessee") -- Josh confirmed directly,
// 2026-09-29, that this short form is the wanted label, not a placeholder
// pending a fuller "The Episcopal Diocese of..." title, so this app doesn't
// invent one. Alphabetized, same convention as that registry.
const TEC_DIOCESE_DIRECTORY = Object.freeze([
    { dioceseShort: 'alabama', label: 'Alabama' },
    { dioceseShort: 'alaska', label: 'Alaska' },
    { dioceseShort: 'albany', label: 'Albany' },
    { dioceseShort: 'arizona', label: 'Arizona' },
    { dioceseShort: 'arkansas', label: 'Arkansas' },
    { dioceseShort: 'atlanta', label: 'Atlanta' },
    { dioceseShort: 'california', label: 'California' },
    { dioceseShort: 'central-florida', label: 'Central Florida' },
    { dioceseShort: 'central-gulf-coast', label: 'Central Gulf Coast' },
    { dioceseShort: 'central-new-york', label: 'Central New York' },
    { dioceseShort: 'chicago', label: 'Chicago' },
    { dioceseShort: 'colombia', label: 'Colombia' },
    { dioceseShort: 'colorado', label: 'Colorado' },
    { dioceseShort: 'connecticut', label: 'Connecticut' },
    { dioceseShort: 'cuba', label: 'Cuba' },
    { dioceseShort: 'dallas', label: 'Dallas' },
    { dioceseShort: 'delaware', label: 'Delaware' },
    { dioceseShort: 'dominican-republic', label: 'Dominican Republic' },
    { dioceseShort: 'east-carolina', label: 'East Carolina' },
    { dioceseShort: 'east-tennessee', label: 'East Tennessee' },
    { dioceseShort: 'eastern-oregon', label: 'Eastern Oregon' },
    { dioceseShort: 'easton', label: 'Easton' },
    { dioceseShort: 'ecuador-central', label: 'Ecuador Central' },
    { dioceseShort: 'ecuador-litoral', label: 'Ecuador Litoral' },
    { dioceseShort: 'el-camino-real', label: 'El Camino Real' },
    { dioceseShort: 'europe', label: 'Europe' },
    { dioceseShort: 'florida', label: 'Florida' },
    { dioceseShort: 'georgia', label: 'Georgia' },
    { dioceseShort: 'great-lakes', label: 'Great Lakes' },
    { dioceseShort: 'haiti', label: 'Haiti' },
    { dioceseShort: 'hawai-i', label: 'Hawaiʻi' },
    { dioceseShort: 'honduras', label: 'Honduras' },
    { dioceseShort: 'idaho', label: 'Idaho' },
    { dioceseShort: 'indianapolis', label: 'Indianapolis' },
    { dioceseShort: 'iowa', label: 'Iowa' },
    { dioceseShort: 'kansas', label: 'Kansas' },
    { dioceseShort: 'kentucky', label: 'Kentucky' },
    { dioceseShort: 'lexington', label: 'Lexington' },
    { dioceseShort: 'long-island', label: 'Long Island' },
    { dioceseShort: 'los-angeles', label: 'Los Angeles' },
    { dioceseShort: 'louisiana', label: 'Louisiana' },
    { dioceseShort: 'maine', label: 'Maine' },
    { dioceseShort: 'maryland', label: 'Maryland' },
    { dioceseShort: 'massachusetts', label: 'Massachusetts' },
    { dioceseShort: 'michigan', label: 'Michigan' },
    { dioceseShort: 'minnesota', label: 'Minnesota' },
    { dioceseShort: 'mississippi', label: 'Mississippi' },
    { dioceseShort: 'missouri', label: 'Missouri' },
    { dioceseShort: 'montana', label: 'Montana' },
    { dioceseShort: 'navajoland', label: 'Navajoland' },
    { dioceseShort: 'nebraska', label: 'Nebraska' },
    { dioceseShort: 'nevada', label: 'Nevada' },
    { dioceseShort: 'new-hampshire', label: 'New Hampshire' },
    { dioceseShort: 'new-jersey', label: 'New Jersey' },
    { dioceseShort: 'new-york', label: 'New York' },
    { dioceseShort: 'newark', label: 'Newark' },
    { dioceseShort: 'north-carolina', label: 'North Carolina' },
    { dioceseShort: 'north-dakota', label: 'North Dakota' },
    { dioceseShort: 'northern-california', label: 'Northern California' },
    { dioceseShort: 'northern-indiana', label: 'Northern Indiana' },
    { dioceseShort: 'northern-michigan', label: 'Northern Michigan' },
    { dioceseShort: 'northwest-texas', label: 'Northwest Texas' },
    { dioceseShort: 'northwestern-pennsylvania', label: 'Northwestern Pennsylvania' },
    { dioceseShort: 'ohio', label: 'Ohio' },
    { dioceseShort: 'oklahoma', label: 'Oklahoma' },
    { dioceseShort: 'olympia', label: 'Olympia' },
    { dioceseShort: 'pennsylvania', label: 'Pennsylvania' },
    { dioceseShort: 'pittsburgh', label: 'Pittsburgh' },
    { dioceseShort: 'puerto-rico', label: 'Puerto Rico' },
    { dioceseShort: 'rhode-island', label: 'Rhode Island' },
    { dioceseShort: 'rio-grande', label: 'Rio Grande' },
    { dioceseShort: 'rochester', label: 'Rochester' },
    { dioceseShort: 'san-diego', label: 'San Diego' },
    { dioceseShort: 'san-joaquin', label: 'San Joaquin' },
    { dioceseShort: 'south-carolina', label: 'South Carolina' },
    { dioceseShort: 'south-dakota', label: 'South Dakota' },
    { dioceseShort: 'southeast-florida', label: 'Southeast Florida' },
    { dioceseShort: 'southern-ohio', label: 'Southern Ohio' },
    { dioceseShort: 'southern-virginia', label: 'Southern Virginia' },
    { dioceseShort: 'southwest-florida', label: 'Southwest Florida' },
    { dioceseShort: 'southwestern-virginia', label: 'Southwestern Virginia' },
    { dioceseShort: 'spokane', label: 'Spokane' },
    { dioceseShort: 'springfield', label: 'Springfield' },
    { dioceseShort: 'susquehanna', label: 'Susquehanna' },
    { dioceseShort: 'taiwan', label: 'Taiwan' },
    { dioceseShort: 'tennessee', label: 'Tennessee' },
    { dioceseShort: 'texas', label: 'Texas' },
    { dioceseShort: 'upper-south-carolina', label: 'Upper South Carolina' },
    { dioceseShort: 'utah', label: 'Utah' },
    { dioceseShort: 'venezuela', label: 'Venezuela' },
    { dioceseShort: 'vermont', label: 'Vermont' },
    { dioceseShort: 'virgin-islands', label: 'Virgin Islands' },
    { dioceseShort: 'virginia', label: 'Virginia' },
    { dioceseShort: 'washington-dc', label: 'Washington (DC)' },
    { dioceseShort: 'west-missouri', label: 'West Missouri' },
    { dioceseShort: 'west-tennessee', label: 'West Tennessee' },
    { dioceseShort: 'west-texas', label: 'West Texas' },
    { dioceseShort: 'west-virginia', label: 'West Virginia' },
    { dioceseShort: 'western-kansas', label: 'Western Kansas' },
    { dioceseShort: 'western-louisiana', label: 'Western Louisiana' },
    { dioceseShort: 'western-massachusetts', label: 'Western Massachusetts' },
    { dioceseShort: 'western-new-york', label: 'Western New York' },
    { dioceseShort: 'western-north-carolina', label: 'Western North Carolina' },
    { dioceseShort: 'western-oregon', label: 'Western Oregon' },
    { dioceseShort: 'wisconsin', label: 'Wisconsin' },
    { dioceseShort: 'wyoming', label: 'Wyoming' },
]);

function findTecDioceseDirectoryEntry(key) {
    if (typeof key !== 'string') return null;
    const prefix = TEC_DIOCESE_DIRECTORY_BODY_SLUG + '/';
    if (!key.startsWith(prefix)) return null;
    const dioceseShort = key.slice(prefix.length);
    const entry = TEC_DIOCESE_DIRECTORY.find(d => d.dioceseShort === dioceseShort);
    return entry ? { dioceseShort: entry.dioceseShort, label: entry.label, key: key } : null;
}

function isValidCycleOfPrayerDioceseKey(key) {
    return findTecDioceseDirectoryEntry(key) !== null;
}

function findCycleOfPrayerDiocese(key) {
    return CYCLES_OF_PRAYER_DIOCESES.find(d => cycleOfPrayerDioceseKey(d.bodySlug, d.dioceseShort) === key) || null;
}

// Cache key is dioceseKey + ':' + year for a 'dated' diocese, or just
// dioceseKey for a 'monthly-recurring' one (its file has no year, so there
// is only ever one cache entry per diocese, not one per year). Value is the
// parsed JSON, or null if the file does not exist / failed to load. A miss
// (key not present at all) means "not requested yet or still loading" --
// render call sites must treat that as "nothing to show yet", never as
// "confirmed absent".
const _cyclesOfPrayerCache = new Map();

function cycleOfPrayerCacheKey(diocese, dioceseKey, year) {
    return diocese.cycleType === 'monthly-recurring' ? dioceseKey : (dioceseKey + ':' + year);
}

function cycleOfPrayerFilePath(diocese, year) {
    const base = 'data/cycles-of-prayer/' + diocese.bodySlug + '-' + diocese.dioceseShort;
    return diocese.cycleType === 'monthly-recurring' ? (base + '.json') : (base + '-' + year + '.json');
}

/**
 * Fetches (and caches) the diocese's cycle file. `year` is only meaningful
 * for a 'dated' diocese (ignored, but harmless to pass, for a
 * 'monthly-recurring' one, which has a single standing file with no year).
 * Returns null, never throws, when that file does not exist yet (a 'dated'
 * diocese with a 2026 file but no 2027 file yet is the expected, honest case
 * every January until next year's cycle is ingested -- not an error).
 */
async function loadCycleOfPrayerYear(dioceseKey, year) {
    const diocese = findCycleOfPrayerDiocese(dioceseKey);
    if (!diocese) return null;

    const cacheKey = cycleOfPrayerCacheKey(diocese, dioceseKey, year);
    if (_cyclesOfPrayerCache.has(cacheKey)) {
        return _cyclesOfPrayerCache.get(cacheKey);
    }

    const path = cycleOfPrayerFilePath(diocese, year);

    try {
        const response = await fetch(path);
        if (!response.ok) {
            _cyclesOfPrayerCache.set(cacheKey, null);
            return null;
        }
        const doc = await response.json();
        _cyclesOfPrayerCache.set(cacheKey, doc);
        return doc;
    } catch (_error) {
        // Network/parse failure: cache nothing, so a later retry (e.g. a
        // fresh call after connectivity returns) is not permanently blocked
        // by this one failed attempt.
        return null;
    }
}

/** Synchronous read of whatever is already cached -- never triggers a fetch. */
function getCachedCycleOfPrayerYear(dioceseKey, year) {
    const diocese = findCycleOfPrayerDiocese(dioceseKey);
    if (!diocese) return null;
    return _cyclesOfPrayerCache.get(cycleOfPrayerCacheKey(diocese, dioceseKey, year)) || null;
}

function toIsoDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

/**
 * Resolves "this week's" entry from an already-loaded corpus: the entry
 * whose date is the latest one on or before `date`. Relies on schema.json's
 * own ordering rule (entries strictly chronological) -- validated by
 * scripts/cycles-of-prayer/validate.mjs, not re-checked here.
 *
 * A date the corpus does not cover at all (before its first entry) returns
 * null rather than guessing. Callers pass a `date` already known to fall
 * inside the corpus's own declared `year` -- see getCachedCycleOfPrayerWeek,
 * the entry point that enforces that.
 */
function resolveCycleOfPrayerEntry(corpus, date) {
    if (!corpus || !Array.isArray(corpus.entries) || corpus.entries.length === 0) return null;

    const iso = toIsoDateString(date);
    let best = null;
    for (const entry of corpus.entries) {
        if (entry.date > iso) break;
        best = entry;
    }
    return best;
}

/**
 * Resolves "the current day-of-month's" entry from an already-loaded
 * 'monthly-recurring' corpus: the entry whose `day` is the latest one on or
 * before `date`'s day-of-month, wrapping around to the entry with the
 * highest `day` if `date` falls before the first entry (the cycle repeats
 * every month, so there is no "before the first entry" the way a dated,
 * non-repeating corpus has -- e.g. on the 1st, with no day-1 entry, the
 * correct subject is still whatever the end of last month's cycle was, not
 * nothing). Mirrors resolveCycleOfPrayerEntry's "latest on-or-before"
 * semantics for the dated case.
 */
function resolveMonthlyRecurringEntry(corpus, date) {
    if (!corpus || !Array.isArray(corpus.entries) || corpus.entries.length === 0) return null;

    const day = date.getDate();
    let best = null;
    for (const entry of corpus.entries) {
        if (entry.day > day) break;
        best = entry;
    }
    return best || corpus.entries[corpus.entries.length - 1];
}

/**
 * Synchronous, cache-only resolution of "this week's" (or, for a
 * 'monthly-recurring' diocese, "this day's") cycle-of-prayer entry for a
 * given diocese and date. Returns null when the relevant corpus isn't loaded
 * (or doesn't exist) yet -- callers render nothing in that case, the same
 * "null = not yet available, never substitute" convention used throughout
 * this app, and rely on prefetchCycleOfPrayerYear (below) having been
 * kicked off elsewhere to eventually populate the cache and trigger a
 * repaint.
 */
function getCachedCycleOfPrayerWeek(dioceseKey, date) {
    if (!isValidCycleOfPrayerDioceseKey(dioceseKey)) return null;
    const diocese = findCycleOfPrayerDiocese(dioceseKey);

    const corpus = getCachedCycleOfPrayerYear(dioceseKey, date.getFullYear());
    if (!corpus) return null;

    if (diocese.cycleType === 'monthly-recurring') {
        return resolveMonthlyRecurringEntry(corpus, date);
    }

    // The corpus's own declared year, not just the filename, gates use --
    // belt and suspenders against a future mis-filed file.
    if (corpus.year !== date.getFullYear()) return null;

    return resolveCycleOfPrayerEntry(corpus, date);
}

/**
 * All distinct parish subjects across every entry of an already-loaded
 * corpus, for populating the home-parish picker. Category subjects (e.g.
 * "Diocesan Staff") are deliberately excluded -- a user does not have a
 * "home parish" of Diocesan Staff. Sorted alphabetically by place then name
 * for a scannable picker; the underlying file stays chronological per its
 * own schema rule, this sort is presentation-only.
 */
function listCycleOfPrayerParishes(corpus) {
    if (!corpus || !Array.isArray(corpus.entries)) return [];

    const seen = new Set();
    const out = [];
    for (const entry of corpus.entries) {
        for (const subject of (entry.subjects || [])) {
            if (subject.type !== 'parish') continue;
            const slug = cycleOfPrayerParishSlug(subject);
            if (seen.has(slug)) continue;
            seen.add(slug);
            out.push({ slug: slug, place: subject.place, name: subject.name });
        }
    }
    out.sort((a, b) => (a.place + ', ' + a.name).localeCompare(b.place + ', ' + b.name));
    return out;
}

/**
 * Deterministic slug for a parish subject, derived from place+name since the
 * corpus's own schema does not assign subjects a stable id (see
 * data/cycles-of-prayer/schema.json). Used both to populate the parish
 * <select>'s option values and, at render time, to test whether the
 * currently-resolved week's subjects include the user's declared home
 * parish. Category subjects use their bare name (no place to combine).
 */
function cycleOfPrayerParishSlug(subject) {
    const raw = subject.type === 'parish' ? (subject.place + ' ' + subject.name) : subject.name;
    return raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── The worldwide Anglican Cycle of Prayer (scope 'communion') ─────────────
// ADDED 2026-09-29. Unlike CYCLES_OF_PRAYER_DIOCESES above, there is exactly
// ONE scope-'communion' file (see data/cycles-of-prayer/schema.json) -- it
// isn't scoped to any diocese a user picks, so it needs no per-diocese
// registry/lookup key, just its own bodySlug for building the file path. It
// applies to every user identically; callers never gate it on any profile
// field the way the diocese/parish tiers gate on cycleOfPrayerDiocese.
const COMMUNION_CYCLE_OF_PRAYER_BODY_SLUG = 'anglican-communion';

// Cache key is bare `year` (an integer), since there is only ever one file
// per year, unlike _cyclesOfPrayerCache's dioceseKey-qualified keys above.
const _communionCycleOfPrayerCache = new Map();

function communionCycleOfPrayerFilePath(year) {
    return 'data/cycles-of-prayer/' + COMMUNION_CYCLE_OF_PRAYER_BODY_SLUG + '-' + year + '.json';
}

/**
 * Fetches (and caches) the worldwide Communion cycle's file for `year`.
 * Mirrors loadCycleOfPrayerYear's contract exactly: returns null, never
 * throws, when that year's file does not exist yet -- the expected, honest
 * case every January until the next year's cycle is ingested, and also the
 * case for any date outside whatever partial-year range the current file
 * actually covers (e.g. anglican-communion-2026.json only covers
 * Sept-Dec 2026, so a Jan-Aug 2026 date still resolves this same file, but
 * getCachedCommunionCycleOfPrayerDay below correctly finds no entry for it).
 */
async function loadCommunionCycleOfPrayerYear(year) {
    if (_communionCycleOfPrayerCache.has(year)) {
        return _communionCycleOfPrayerCache.get(year);
    }

    const path = communionCycleOfPrayerFilePath(year);

    try {
        const response = await fetch(path);
        if (!response.ok) {
            _communionCycleOfPrayerCache.set(year, null);
            return null;
        }
        const doc = await response.json();
        _communionCycleOfPrayerCache.set(year, doc);
        return doc;
    } catch (_error) {
        // Network/parse failure: cache nothing, so a later retry is not
        // permanently blocked by this one failed attempt -- same convention
        // as loadCycleOfPrayerYear above.
        return null;
    }
}

/**
 * Synchronous, cache-only resolution of "this day's" Communion cycle entry
 * for a given date. Reuses resolveCycleOfPrayerEntry's "latest on-or-before"
 * semantics (this file's cycleType is 'dated', same as a diocese's own dated
 * file) against whatever year's corpus is already cached. Returns null when
 * that year isn't loaded yet, or the date falls before the corpus's own
 * first entry (e.g. a Jan-Aug 2026 date against a Sept-Dec-only file) --
 * never a fetch, never a guess; callers render nothing in that case, same
 * "null = not yet available or not covered" convention used throughout this
 * module.
 */
function getCachedCommunionCycleOfPrayerDay(date) {
    const corpus = _communionCycleOfPrayerCache.get(date.getFullYear()) || null;
    if (!corpus) return null;

    // The corpus's own declared year, not just the cache key, gates use --
    // belt and suspenders against a future mis-filed file, same check
    // getCachedCycleOfPrayerWeek makes for a diocese's own dated file.
    if (corpus.year !== date.getFullYear()) return null;

    return resolveCycleOfPrayerEntry(corpus, date);
}
