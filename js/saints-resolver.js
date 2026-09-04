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

    // Whole-file sanctoral cache. Shape: { entries: Array } | null
    // Replaces the month-keyed cache: a commemoration whose date moves between
    // months from year to year cannot live in a month-keyed file at all.
    let _sanctoral = null;

    // Reckoning used when resolving cycle-anchored (East Syriac) entries.
    // Defaults to the Assyrian Church of the East's current practice; override
    // via configure({ eastSyriacOptions: { easterMode: 'julian' } }) for the
    // Ancient Church of the East, which retains the Julian Paschalion.
    let _eastSyriacOptions = { easterMode: 'gregorian' };

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

    /**
     * Does `entry` fall on `date`, according to its observance rule?
     *
     * Three rule types (see data/saints/sanctoral.json and
     * scripts/saints/migrate_to_sanctoral.py):
     *   fixed   - one or more fixed Gregorian month/day pairs
     *   cycle   - a (cycle, week, weekday) slot in the East Syriac week
     *             structure, resolved through EastSyriacCalendar
     *   ordinal - the nth given weekday of a month
     *
     * Entries with no `observance` fall back to the legacy `day`/`dayLegacy`
     * string, so a partially migrated file still resolves rather than vanishing.
     */
    function occursOn(entry, date, opts) {
        if (!entry || !(date instanceof Date)) return false;
        const obs = entry.observance;
        if (!obs) return saintOccursOnDate(entry.day || entry.dayLegacy, date);

        if (obs.type === 'fixed') {
            const m = date.getMonth() + 1, d = date.getDate();
            return Array.isArray(obs.dates) && obs.dates.some(x => x.month === m && x.day === d);
        }

        if (obs.type === 'ordinal') {
            if ((date.getMonth() + 1) !== obs.month) return false;
            if (date.getDay() !== obs.weekday) return false;
            // Which occurrence of this weekday within the month is it?
            return Math.ceil(date.getDate() / 7) === obs.n;
        }

        // "relative": the Nth given weekday counted from a fixed feast plus an
        // offset. ADDED 2026-09-03. Needed because part of the Church of the
        // East sanctoral is anchored neither to a week of a season nor to an
        // ordinal weekday of a month, but to the Epiphany:
        //   Mar Zaia            - the Wednesday nearest 6 January
        //   St John the Baptist - the first Friday after 6 January
        //   Sts Peter and Paul  - the second Friday after 6 January
        // The Epiphany itself is read from the calendar engine so that it
        // follows the church body's fixed-feast reckoning rather than being
        // hardcoded to a Gregorian date.
        if (obs.type === 'relative') {
            if (date.getDay() !== obs.weekday) return false;
            const cal = global.EastSyriacCalendar;
            if (!cal || typeof cal.getSeason !== 'function') {
                return saintOccursOnDate(entry.dayLegacy || entry.day, date);
            }
            try {
                const o = (opts && opts.eastSyriacOptions) || _eastSyriacOptions;
                const anchor = cal.getSeason(date, o).epiphanyGreg;
                if (!anchor) return false;
                // n > 0: the Nth occurrence of the weekday on or after
                //        anchor + offsetDays (counting forward).
                // n < 0: the |n|th occurrence STRICTLY BEFORE the anchor
                //        (counting backward). Needed for commemorations kept on
                //        the Friday BEFORE the Epiphany, which cannot be
                //        expressed by counting forward from an offset without
                //        the count spilling past the feast in some years.
                const n = obs.n || 1;
                let d = new Date(anchor.getFullYear(), anchor.getMonth(),
                                 anchor.getDate() + (n < 0 ? 0 : (obs.offsetDays || 0)));
                if (n < 0) {
                    do { d.setDate(d.getDate() - 1); } while (d.getDay() !== obs.weekday);
                    d.setDate(d.getDate() - 7 * (Math.abs(n) - 1));
                } else {
                    while (d.getDay() !== obs.weekday) d.setDate(d.getDate() + 1);
                    d.setDate(d.getDate() + 7 * (n - 1));
                }
                return d.getFullYear() === date.getFullYear()
                    && d.getMonth() === date.getMonth()
                    && d.getDate() === date.getDate();
            } catch (err) {
                console.error('[SaintsResolver] relative resolution failed for', entry.id, err);
                return false;
            }
        }

        if (obs.type === 'cycle') {
            // Needs the East Syriac engine. If it is not loaded (for example on
            // the admin page), degrade to the legacy date rather than throwing
            // or silently dropping the commemoration.
            const cal = global.EastSyriacCalendar;
            if (!cal || typeof cal.getSeason !== 'function') {
                return saintOccursOnDate(entry.dayLegacy || entry.day, date);
            }
            if (date.getDay() !== obs.weekday) return false;
            try {
                const o = (opts && opts.eastSyriacOptions) || _eastSyriacOptions;
                const s = cal.getSeason(date, o);
                if (!s || s.season !== obs.cycle) return false;

                // week: "last" -- the final week of a season whose LENGTH VARIES
                // year to year. Needed because the diocese compresses Epiphany
                // ("Seventh and Eighth Weeks of Epiphany" on one row), so a rule
                // naming a fixed week number resolves to NOTHING in years where
                // the season never reaches it, and the commemoration disappears
                // from the app entirely. A date is in the final week when the
                // same weekday seven days later has left the season.
                if (obs.week === 'last') {
                    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
                    const sn = cal.getSeason(next, o);
                    return !sn || sn.season !== obs.cycle;
                }
                return s.weekInSeason === obs.week;
            } catch (err) {
                console.error('[SaintsResolver] cycle resolution failed for', entry.id, err);
                return false;
            }
        }

        return false;
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

    /**
     * Load the whole sanctoral once and hold it for the session.
     *
     * Replaced the previous per-month fetch on 2026-09-03. The month-keyed
     * layout could not house a commemoration whose Gregorian date moves between
     * months from year to year, and 11 of the 24 Church of the East
     * commemorations tested against the printed diocesan calendars do exactly
     * that. One file also means one fetch per session instead of one per month
     * navigated.
     */
    async function _loadSanctoral() {
        if (_sanctoral) return _sanctoral.entries;
        try {
            const res  = await fetch(`${_dataBasePath}sanctoral.json`);
            const doc  = res.ok ? await res.json() : null;
            const list = doc && Array.isArray(doc.entries) ? doc.entries : [];
            _sanctoral = { entries: list };
        } catch (err) {
            console.error('[SaintsResolver] Failed to load sanctoral.json', err);
            _sanctoral = { entries: [] };
        }
        return _sanctoral.entries;
    }

    /**
     * Entries falling on `date`, before any tradition filter.
     * Kept as the single place the observance rule is applied.
     */
    function _entriesOn(entries, date, opts) {
        return entries.filter(e => occursOn(e, date, opts));
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
        const entries = await _loadSanctoral();
        return _entriesOn(entries, date);
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
        const entries = await _loadSanctoral();
        const ctx = { tradition, includeEcumenical };
        return _entriesOn(entries, date, opts).filter(s => saintAppliesToContext(s, ctx).ok);
    }

    /**
     * Return the full cached records array for `month` if it is already in the
     * internal cache, otherwise return null.
     *
     * This is a synchronous read — it never triggers a fetch. It is intended
     * for callers that have already called resolveCommemorations() or
     * loadSaintsForDate() for the same month and need the complete unfiltered
     * array without any tradition filter.
     *
     * @param {string} month  - e.g. 'March' (capitalised, matches MONTH_NAMES)
     * @returns {Array|null}
     */
    function getMonthRecords(month) {
        if (!_sanctoral) return null;
        const idx = MONTH_NAMES.indexOf(month);
        if (idx < 0) return null;
        const m = idx + 1;
        return _sanctoral.entries.filter(e => {
            const obs = e.observance;
            if (!obs) return saintOccursOnDate(e.day || e.dayLegacy, new Date(2000, idx, 1)) || true;
            if (obs.type === 'fixed')   return obs.dates.some(x => x.month === m);
            if (obs.type === 'ordinal') return obs.month === m;
            // cycle-anchored: which month it lands in depends on the year, so it
            // cannot be excluded from any month on the strength of the rule alone.
            return true;
        });
    }

    /**
     * Synchronous tradition filter against the already-loaded monthly cache.
     * Never triggers a fetch. Returns an empty array if the month is not cached.
     *
     * Intended for use inside synchronous sequence loops that cannot await,
     * where the caller has already warmed the cache via resolveCommemorations()
     * or loadSaintsForDate() earlier in the same render pass.
     *
     * Semantics match resolveCommemorations() exactly:
     * - Records whose `day` matches `date`
     * - Records whose `tags` include `tradition` OR are derived ECU
     *   (when opts.includeEcumenical is true, which is the default)
     *
     * @param {Date}   date
     * @param {string} tradition  - 'ANG' | 'LAT' | 'EOR' | 'OOR' | 'COE'
     * @param {object} [opts]
     * @param {boolean} [opts.includeEcumenical=true]
     * @returns {Array}
     */
    function filterCachedByTradition(date, tradition, opts) {
        const entries = _sanctoral ? _sanctoral.entries : [];
        const includeEcumenical = (opts && opts.includeEcumenical === false) ? false : true;
        const ctx = { tradition, includeEcumenical };
        return _entriesOn(entries, date, opts).filter(s => saintAppliesToContext(s, ctx).ok);
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
        if (opts && opts.eastSyriacOptions && typeof opts.eastSyriacOptions === 'object') {
            _eastSyriacOptions = opts.eastSyriacOptions;
        }
    }

    // ── Export ────────────────────────────────────────────────────────────────

    global.SaintsResolver = {
        configure,
        loadSaintsForDate,
        resolveCommemorations,
        getMonthRecords,
        filterCachedByTradition,
        // Helpers exposed for callers that use them directly
        saintOccursOnDate,
        occursOn,
        saintAppliesToContext,
        isDerivedEcumenical,
    };

}(typeof globalThis !== 'undefined' ? globalThis : window));