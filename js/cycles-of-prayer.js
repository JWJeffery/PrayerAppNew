/**
 * Diocesan Cycle of Prayer -- loads and resolves the per-diocese weekly
 * prayer-rotation corpus in data/cycles-of-prayer/. See that directory's own
 * schema.json for the file shape and governing rules; this module does not
 * duplicate that documentation, only implements against it.
 *
 * Loaded (deferred) before js/office-ui.js, which calls into it from the
 * profile setters and from the BCP "authorized intercessions" render hook.
 */

// Which dioceses are selectable in the profile UI. Kept in sync BY HAND with
// the files actually present in data/cycles-of-prayer/ -- mirrors the same
// small hand-maintained registry pattern js/office-ui.js already uses for
// UNIVERSAL_OFFICE_PARISH_DEDICATION_VALUES. `bodySlug`/`dioceseShort` match
// that directory's schema.json field names exactly; a diocese's identity
// here is NOT year-scoped (the year-specific file is resolved separately, at
// query time, against whatever year is actually being asked about), so a
// user's saved diocese choice does not go stale every January the way a
// year-embedded id would.
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

function isValidCycleOfPrayerDioceseKey(key) {
    if (typeof key !== 'string') return false;
    return CYCLES_OF_PRAYER_DIOCESES.some(d => cycleOfPrayerDioceseKey(d.bodySlug, d.dioceseShort) === key);
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
