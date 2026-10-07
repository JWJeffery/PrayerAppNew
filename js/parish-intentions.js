/**
 * Parish Intercessions -- reader-side client for the parish prayer-request API
 * (see api/openapi.yaml and documentation/PARISH_INTENTIONS.md). ADDED 2026-09-30.
 *
 * Loaded (deferred) before js/office-ui.js, which calls into it from the profile panel and from the
 * BCP "authorized intercessions" render hook. Same shape as js/cycles-of-prayer.js: plain script (no
 * modules), global functions, a synchronous cache-only read for the render path, and a separate
 * fire-and-forget refresh that repaints when data arrives.
 *
 * THREE RULES this file keeps (each one is a security or privacy decision, not a style choice):
 *  1. It never writes text into the page. Prayer text is user-supplied by a rector; the only thing this
 *     file does with it is hand plain strings to js/office-ui.js, which places them with textContent.
 *     (Never bcpEmitBare/bcpMakeSpan -- those set innerHTML.)
 *  2. It never throws into the office render. Every network or storage failure degrades to "no
 *     intentions", exactly like the Cycle of Prayer tiers -- a parish's list never blocks the office.
 *  3. Offline copies never show expired items: getCachedParishIntentions filters by the device clock at
 *     read time, so a cache written on Monday cannot show Monday's expired requests on Friday.
 *
 * Readers have no account and nothing about them is stored server-side. The only per-reader state is
 * the followed parish slug and (for join-code parishes) a "pass" from POST .../join, both kept in the
 * local profile by js/office-ui.js, plus the small cache below.
 */

const PARISH_INTENTIONS_API_BASE = '/api/v1';
const PARISH_INTENTIONS_CACHE_KEY = 'universalOfficeParishIntentionsCache';
const PARISH_INTENTIONS_TIMEOUT_MS = 6000;
const PARISH_INTENTIONS_CATEGORIES = Object.freeze(['individual', 'family', 'situation', 'institution']);

// The most recent successful read, held in memory as well as in localStorage so the synchronous render
// path does not re-parse JSON on every repaint.
let parishIntentionsMemoryCache = null;

function parishIntentionsIsValidSlug(slug) {
    return typeof slug === 'string' && /^[a-z0-9-]{1,80}$/.test(slug);
}

// Mirrors fetchDailyOfficeResource in js/office-ui.js: an AbortController timeout so a slow or dead
// server can never hang the office. credentials 'omit' -- nothing identifying is ever sent.
async function parishIntentionsFetch(path, options) {
    // Offline: do not even start the request (the parish list loads whenever a diocese picker draws, and a failed
    // request per load is noise). Every caller already treats a throw as "network trouble" and falls back to its cache.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new Error('offline');
    const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), PARISH_INTENTIONS_TIMEOUT_MS) : null;
    try {
        const init = Object.assign({ credentials: 'omit' }, options || {});
        if (controller) init.signal = controller.signal;
        return await fetch(PARISH_INTENTIONS_API_BASE + path, init);
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

/**
 * Approved parishes, optionally limited to one diocese key ("episcopal/western-oregon"). Resolves to an
 * array of { slug, name, dioceseKey, corpusParishSlug, visibility }, or null on any failure (the caller
 * shows its own "none yet" message either way).
 */
async function listApprovedParishes(dioceseKey) {
    try {
        let path = '/parishes';
        if (typeof dioceseKey === 'string' && /^[a-z0-9-]{1,40}\/[a-z0-9-]{1,80}$/.test(dioceseKey)) {
            path += '?diocese=' + encodeURIComponent(dioceseKey);
        }
        const response = await parishIntentionsFetch(path);
        if (!response.ok) return null;
        const data = await response.json();
        if (!data || !Array.isArray(data.parishes)) return null;
        return data.parishes
            .filter(p => p && parishIntentionsIsValidSlug(p.slug) && typeof p.name === 'string'
                && (p.visibility === 'public' || p.visibility === 'code'))
            .map(p => ({
                slug: p.slug,
                name: p.name,
                dioceseKey: typeof p.diocese_key === 'string' ? p.diocese_key : null,
                corpusParishSlug: typeof p.corpus_parish_slug === 'string' ? p.corpus_parish_slug : null,
                visibility: p.visibility
            }));
    } catch (_error) {
        return null;
    }
}

/**
 * Exchange a parish's join code for a pass. Resolves to { ok: true, pass, parish } or
 * { ok: false, reason } where reason is 'wrong-code' | 'rate-limited' | 'not-found' | 'network'.
 */
async function joinParish(slug, code) {
    if (!parishIntentionsIsValidSlug(slug)) return { ok: false, reason: 'not-found' };
    try {
        const response = await parishIntentionsFetch('/parishes/' + slug + '/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: String(code || '') })
        });
        if (response.status === 403) return { ok: false, reason: 'wrong-code' };
        if (response.status === 429) return { ok: false, reason: 'rate-limited' };
        if (response.status === 404) return { ok: false, reason: 'not-found' };
        if (!response.ok) return { ok: false, reason: 'network' };
        const data = await response.json();
        if (!data || typeof data.pass !== 'string' || !data.pass || data.pass.length > 400) return { ok: false, reason: 'network' };
        return { ok: true, pass: data.pass, parish: data.parish || null };
    } catch (_error) {
        return { ok: false, reason: 'network' };
    }
}

// Accept only well-formed items; anything else in a response (or in a tampered cache) is dropped rather
// than trusted. Text length matches the server's own 200-character limit.
function parishIntentionsSanitizeItems(rawItems) {
    if (!Array.isArray(rawItems)) return [];
    const items = [];
    for (const item of rawItems) {
        if (!item || typeof item.text !== 'string' || !item.text || item.text.length > 200) continue;
        if (!PARISH_INTENTIONS_CATEGORIES.includes(item.category)) continue;
        if (typeof item.expires_at !== 'string' || !Number.isFinite(Date.parse(item.expires_at))) continue;
        items.push({
            id: Number.isFinite(item.id) ? item.id : 0,
            category: item.category,
            text: item.text,
            expires_at: item.expires_at
        });
    }
    return items;
}

function parishIntentionsWriteCache(entry) {
    parishIntentionsMemoryCache = entry;
    try {
        localStorage.setItem(PARISH_INTENTIONS_CACHE_KEY, JSON.stringify(entry));
    } catch (_error) {
        // Storage blocked or full: the in-memory copy still serves this session.
    }
}

function parishIntentionsReadStoredCache() {
    try {
        const stored = localStorage.getItem(PARISH_INTENTIONS_CACHE_KEY);
        if (!stored) return null;
        const entry = JSON.parse(stored);
        if (!entry || !parishIntentionsIsValidSlug(entry.slug) || !Array.isArray(entry.intentions)) return null;
        return {
            slug: entry.slug,
            fetchedAt: typeof entry.fetchedAt === 'string' ? entry.fetchedAt : '',
            parish: entry.parish && typeof entry.parish.name === 'string' ? { slug: entry.slug, name: entry.parish.name } : null,
            intentions: parishIntentionsSanitizeItems(entry.intentions)
        };
    } catch (_error) {
        return null;
    }
}

function clearParishIntentionsCache() {
    parishIntentionsMemoryCache = null;
    try {
        localStorage.removeItem(PARISH_INTENTIONS_CACHE_KEY);
    } catch (_error) {
        // Nothing to do.
    }
}

/**
 * Fetch the parish's current intentions and cache them (memory and localStorage). `pass` is sent as
 * X-Parish-Pass when present. Resolves to { status } -- never throws:
 *   'ok'            fresh data cached
 *   'code-required' the server wants a (new) join code -- the caller clears the stored pass and asks again
 *   'not-found'     the parish is gone, suspended, or pending -- its cache is dropped
 *   'error'         network/server trouble -- whatever is cached stays as it was
 */
async function refreshParishIntentions(slug, pass) {
    if (!parishIntentionsIsValidSlug(slug)) return { status: 'error' };
    try {
        const headers = { 'Accept': 'application/json' };
        if (typeof pass === 'string' && pass) headers['X-Parish-Pass'] = pass;
        const response = await parishIntentionsFetch('/parishes/' + slug + '/intentions', { headers: headers });
        if (response.status === 401) return { status: 'code-required' };
        if (response.status === 404) {
            if (parishIntentionsMemoryCache && parishIntentionsMemoryCache.slug === slug) clearParishIntentionsCache();
            return { status: 'not-found' };
        }
        if (!response.ok) return { status: 'error' };
        const data = await response.json();
        if (!data || !Array.isArray(data.intentions)) return { status: 'error' };
        parishIntentionsWriteCache({
            slug: slug,
            fetchedAt: new Date().toISOString(),
            parish: data.parish && typeof data.parish.name === 'string' ? { slug: slug, name: data.parish.name } : null,
            intentions: parishIntentionsSanitizeItems(data.intentions)
        });
        return { status: 'ok' };
    } catch (_error) {
        return { status: 'error' };
    }
}

/**
 * SYNCHRONOUS, cache-only (the same contract as getCachedCycleOfPrayerWeek): the followed parish's
 * intentions that have not yet expired by THIS device's clock, in the server's order. Returns null when
 * nothing is cached for that slug, [] when something is cached but every item has expired.
 */
function getCachedParishIntentions(slug) {
    if (!parishIntentionsIsValidSlug(slug)) return null;
    let entry = parishIntentionsMemoryCache;
    if (!entry || entry.slug !== slug) {
        entry = parishIntentionsReadStoredCache();
        if (entry) parishIntentionsMemoryCache = entry;
    }
    if (!entry || entry.slug !== slug) return null;
    const now = Date.now();
    return entry.intentions.filter(item => Date.parse(item.expires_at) > now);
}

/** When the cache for `slug` was last refreshed (ms since epoch), or 0 when there is none. */
function getParishIntentionsFetchedAt(slug) {
    getCachedParishIntentions(slug); // makes sure the memory copy is loaded
    const entry = parishIntentionsMemoryCache;
    if (!entry || entry.slug !== slug) return 0;
    const t = Date.parse(entry.fetchedAt);
    return Number.isFinite(t) ? t : 0;
}

/**
 * ADDED 2026-10-06. The parish home page (parish/home.html) cannot safely rewrite the whole local
 * profile, which belongs to js/office-ui.js, so when a reader presses Follow / Stop following (or joins
 * with a code) there it leaves one small request in localStorage instead. The app calls this once at
 * startup and applies what it returns. Returns { slug, pass } (slug null = stop following) or null when
 * there is no valid request. The request is always removed, valid or not, so a bad one cannot stick.
 */
const PARISH_FOLLOW_REQUEST_KEY = 'universalOffice.parishFollowRequest.v1';

function consumePendingParishFollowRequest() {
    let request = null;
    try {
        const stored = localStorage.getItem(PARISH_FOLLOW_REQUEST_KEY);
        if (!stored) return null;
        localStorage.removeItem(PARISH_FOLLOW_REQUEST_KEY);
        request = JSON.parse(stored);
    } catch (_error) {
        return null;
    }
    if (!request || typeof request !== 'object') return null;
    if (request.slug === null) return { slug: null, pass: null };
    if (!parishIntentionsIsValidSlug(request.slug)) return null;
    const pass = (typeof request.pass === 'string' && request.pass && request.pass.length <= 400) ? request.pass : null;
    return { slug: request.slug, pass: pass };
}
