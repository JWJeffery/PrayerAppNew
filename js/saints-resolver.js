/**
 * js/saints-resolver.js
 *
 * Shared saints boundary module — usable by office-ui.js and admin/admin.html.
 *
 * Provides:
 *   SaintsResolver.loadSaintsForDate(date)
 *     Fetch and cache the monthly saints file, return all records whose `day`
 *     field matches `date`. No tradition filter applied. Used by the admin
 *     dashboard, which displays all traditions for a date.
 *
 *   SaintsResolver.resolveCommemorations(date, tradition, opts)
 *     Same fetch/cache path, then filters to records that apply to the given
 *     tradition (or ECU when opts.includeEcumenical is true). Used by the
 *     main office renderers.
 *
 *   SaintsResolver.saintOccursOnDate(saintDayField, dateObj)
 *   SaintsResolver.saintAppliesToContext(saint, ctx)
 *   SaintsResolver.isDerivedEcumenical(tags)
 *     Helper functions; exposed so callers that already use them inline
 *     can migrate without duplicating logic.
 *
 * Cache model:
 *   One monthly file is held in memory at a time. Cache is keyed by month
 *   name string. On a month boundary the previous month's data is evicted
 *   automatically.
 *
 * Path convention:
 *   DATA_BASE_PATH defaults to 'data/saints/' (correct relative path from
 *   the project root, i.e. from office-ui.js). Admin sets it to
 *   '../data/saints/' via SaintsResolver.configure() because admin.html lives
 *   one directory level deeper.
 *
 * Does not flatten type distinctions (saint / feast / commemoration /
 * apostle / prophet / marian_feast). Callers must not flatten them either.
 */

'use strict';

(function (global) {

    // ── Configuration ─────────────────────────────────────────────────────────

    let _dataBasePath = 'data/saints/';

    // ── Month helpers ─────────────────────────────────────────────────────────

    const MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const TRADITION_CODES = ['ANG', 'LAT', 'EOR', 'OOR', 'COE'];

    // ── Per-session cache ─────────────────────────────────────────────────────
    // Holds the most recently loaded monthly file.
    // Shape: { month: string, records: Array } | null

    let _cache = null;

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Exact day match. Handles multi-day fields ("February 2, February 3"),
     * semicolon separators, and normalises leading zeros ("February 02" → "February 2").
     */
    function saintOccursOnDate(saintDayField, dateObj) {
        if (!saintDayField || !(dateObj instanceof Date)) return false;

        const target = dateObj
            .toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
            .toLowerCase()
            .trim();

        const parts = String(saintDayField)
            .split(/[;,]/)
            .map(s => s.trim().toLowerCase())
            .filter(Boolean);

        const normalize = (s) => s.replace(/\b(\w+)\s+0+(\d{1,2})\b/, '$1 $2').trim();

        return parts.some(p => normalize(p) === target);
    }

    function isDerivedEcumenical(tags) {
        return TRADITION_CODES.every(c => tags.includes(c));
    }

    /**
     * ctx = { tradition: 'ANG', includeEcumenical: true }
     * Returns { ok, label, isEcu }.
     */
    function saintAppliesToContext(saint, ctx) {
        const tags = Array.isArray(saint.tags) ? saint.tags : [];
        if (!ctx || !ctx.tradition) return { ok: false, label: null, isEcu: false };

        const isEcu = isDerivedEcumenical(tags);

        if (ctx.includeEcumenical && isEcu) return { ok: true, label: 'ECU', isEcu };
        if (tags.includes(ctx.tradition))  return { ok: true, label: ctx.tradition, isEcu };

        return { ok: false, label: null, isEcu };
    }

    // ── Fetch / cache ─────────────────────────────────────────────────────────

    async function _loadMonth(month) {
        if (_cache && _cache.month === month) return _cache.records;

        try {
            const url = `${_dataBasePath}saints-${month.toLowerCase()}.json`;
            const res = await fetch(url);
            const records = res.ok ? await res.json() : [];
            _cache = { month, records: Array.isArray(records) ? records : [] };
        } catch (err) {
            console.error('[SaintsResolver] Failed to load saints for', month, err);
            _cache = { month, records: [] };
        }

        return _cache.records;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Return all cache records whose `day` matches `date`, regardless of tradition.
     * This is the correct entry point for the admin dashboard, which displays
     * all traditions simultaneously.
     *
     * @param {Date} date
     * @returns {Promise<Array>}
     */
    async function loadSaintsForDate(date) {
        const month = MONTH_NAMES[date.getMonth()];
        const records = await _loadMonth(month);
        return records.filter(s => saintOccursOnDate(s.day, date));
    }

    /**
     * Return cache records matching `date` that apply to `tradition`.
     * ECU records are included when opts.includeEcumenical is true (default).
     *
     * This is the correct entry point for the main office renderers.
     *
     * @param {Date}   date
     * @param {string} tradition  - 'ANG' | 'LAT' | 'EOR' | 'OOR' | 'COE'
     * @param {object} [opts]
     * @param {boolean} [opts.includeEcumenical=true]
     * @returns {Promise<Array>}
     */
    async function resolveCommemorations(date, tradition, opts) {
        const includeEcumenical = (opts && opts.includeEcumenical === false) ? false : true;
        const month = MONTH_NAMES[date.getMonth()];
        const records = await _loadMonth(month);
        const ctx = { tradition, includeEcumenical };
        return records.filter(s => {
            if (!saintOccursOnDate(s.day, date)) return false;
            return saintAppliesToContext(s, ctx).ok;
        });
    }

    /**
     * Return the full cached records array for `month` if it is already in the
     * internal cache, otherwise return null.
     *
     * This is a synchronous read — it never triggers a fetch. It is intended
     * for callers that have already called resolveCommemorations() or
     * loadSaintsForDate() for the same month and need the complete unfiltered
     * array (e.g. to seed a secondary cache such as appData.saints).
     *
     * @param {string} month  - e.g. 'March' (capitalised, matches MONTH_NAMES)
     * @returns {Array|null}
     */
    function getMonthRecords(month) {
        if (_cache && _cache.month === month) return _cache.records;
        return null;
    }

    /**
     * Override the base path used for fetch URLs.
     * Call before any load if the file is served from a non-root path.
     * Example: SaintsResolver.configure({ dataBasePath: '../data/saints/' })
     *
     * @param {object} opts
     * @param {string} [opts.dataBasePath]
     */
    function configure(opts) {
        if (opts && typeof opts.dataBasePath === 'string') {
            _dataBasePath = opts.dataBasePath;
        }
    }

    // ── Export ────────────────────────────────────────────────────────────────

    global.SaintsResolver = {
        configure,
        loadSaintsForDate,
        resolveCommemorations,
        getMonthRecords,
        // Helpers exposed for callers that use them directly
        saintOccursOnDate,
        saintAppliesToContext,
        isDerivedEcumenical,
    };

}(typeof globalThis !== 'undefined' ? globalThis : window));