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
    /**
     * The observance rule that applies to `entry` for a given tradition.
     *
     * ADDED 2026-09-05. One identity is frequently kept on DIFFERENT DAYS by
     * different traditions -- Benedict of Nursia is 11 July for the Episcopal
     * Church and 14 March in the East; Basil the Great is 1 January in the East
     * and 14 June for Anglicans. The schema already let one row carry several
     * tradition tags but gave it only ONE date, which forced a false choice:
     * either state a date that is wrong for some of its own tags, or split the
     * identity across duplicate rows.
     *
     * `traditionObservance` resolves that. It is an optional map of tradition
     * code to observance rule; when the caller asks on behalf of a tradition
     * that has an entry there, that rule is used instead of the shared
     * `observance`. Rows without the field behave exactly as before, so this is
     * additive and every existing entry keeps working untouched.
     *
     * EXTENDED 2026-09-12 to sub-tradition keys, at Josh's direction. One
     * tradition code is not always one practice: OOR spans Coptic, Armenian,
     * Syriac and Ethiopian, and they do not agree on dates. The Dormition is
     * the worked example -- Coptic keeps the Assumption of the Body on 22 Aug
     * (with the Dormition proper on 29 Jan, a separate feast seven months
     * earlier), Armenian keeps it on the Sunday nearest 15 Aug, and Syriac
     * keeps it on 15 Aug itself. A single `OOR` key cannot express three dates,
     * and Josh has stated more sub-traditions are coming.
     *
     * A key may therefore be either a bare tradition code ('OOR') or a
     * tradition:subtradition pair ('OOR:Coptic'). Resolution runs most-specific
     * first: 'OOR:Coptic' beats 'OOR', which beats the shared `observance`.
     * Keys are plain strings and no existing row contains a colon, so every
     * current entry resolves exactly as it did before this change.
     */
    function observanceFor(entry, tradition, subtradition) {
        const map = entry.traditionObservance;
        if (tradition && map) {
            if (subtradition) {
                const scoped = map[tradition + ':' + subtradition];
                if (scoped) return scoped;
            }
            if (map[tradition]) return map[tradition];
        }
        return entry.observance;
    }

    /**
     * Shared tail of 'relative' resolution: given an already-resolved anchor
     * date, does `date` match `obs`'s weekday/offset/bounded-window rule?
     * ADDED 2026-09-07, factored out so the three anchor branches ('easter',
     * 'epiphany', 'christmas', 'orthodoxEaster') don't each duplicate it.
     */
    function _resolveRelativeAgainstAnchor(entry, obs, date, anchor) {
        // BOUNDED WINDOW WITH FALLBACK. Needed for "the Sunday that falls on
        // or immediately after Dec 26; when there is no Sunday within this
        // period [through the 31st], we celebrate on the 26th" (GOARCH's own
        // stated rule for Joseph the Betrothed, David and James) -- the
        // ordinary forward weekday search below has no way to stop before
        // spilling into January, which happens in the one case this rule
        // exists for: the year Christmas itself falls on a Sunday. The
        // fallback date is NOT required to be obs.weekday -- Dec 26 is a
        // Monday in that case -- so this branch does its own full-date
        // comparison rather than the plain weekday pre-check below.
        if (obs.maxOffsetDays !== undefined) {
            const startOffset = obs.offsetDays || 0;
            let found = null;
            for (let i = startOffset; i <= obs.maxOffsetDays; i++) {
                const t = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + i);
                if (obs.weekday === null || obs.weekday === undefined || t.getDay() === obs.weekday) {
                    found = t;
                    break;
                }
            }
            const target = found || new Date(anchor.getFullYear(), anchor.getMonth(),
                anchor.getDate() + (obs.fallbackOffsetDays !== undefined ? obs.fallbackOffsetDays : startOffset));
            return target.getFullYear() === date.getFullYear()
                && target.getMonth() === date.getMonth()
                && target.getDate() === date.getDate();
        }

        if (obs.weekday !== null && obs.weekday !== undefined
            && date.getDay() !== obs.weekday) return false;

        // A pure day-offset from the anchor, with no weekday to land on.
        if (obs.weekday === null || obs.weekday === undefined) {
            const t = new Date(anchor.getFullYear(), anchor.getMonth(),
                               anchor.getDate() + (obs.offsetDays || 0));
            return t.getFullYear() === date.getFullYear()
                && t.getMonth() === date.getMonth()
                && t.getDate() === date.getDate();
        }
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
    }

    function occursOn(entry, date, opts) {
        if (!entry || !(date instanceof Date)) return false;
        const obs = observanceFor(entry, opts && opts.tradition, opts && opts.subtradition);
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
        //
        // ANCHOR 'orthodoxEaster' ADDED 2026-09-07, deliberately NOT folded
        // into the existing 'easter' anchor above. This resolver's own
        // default for COE's 'easter' anchor is easterMode: 'gregorian' (i.e.
        // WESTERN Easter -- see _eastSyriacOptions above), not the Julian/
        // Orthodox Paschalion. Reusing the 'easter' name for a Byzantine/
        // Coptic moveable date would have meant that on any page loading
        // BOTH engines (index.html loads both calendar-east-syriac.js and
        // byzantine-paschalion.js), a silent Paschalion substitution could
        // occur in one direction or the other depending on load order --
        // wrong for COE's Mar Addai/Mar Papa if this code preferred
        // ByzantinePaschalion, or wrong for EOR/OOR's own moveable dates if
        // it preferred the COE engine's Gregorian-mode default. A distinct
        // anchor name removes the ambiguity entirely: 'easter' keeps
        // meaning exactly what it always has (COE's configured Paschalion,
        // untouched code path below), and 'orthodoxEaster' always means the
        // Julian/Alexandrian Paschalion that Byzantine and Coptic tradition
        // actually use, regardless of what else happens to be loaded.
        // Needed for Great Lent's start (OOR, Pascha - 55 days).
        if (obs.type === 'relative' && (obs.anchor === 'orthodoxEaster')) {
            let anchor = null;
            const paschalion = global.ByzantinePaschalion || global.EasternOrthodoxCalendar;
            if (paschalion) {
                if (typeof paschalion.getOrthodoxPascha === 'function') {
                    anchor = paschalion.getOrthodoxPascha(date.getFullYear());
                } else if (typeof paschalion.computeOrthodoxPascha === 'function') {
                    anchor = paschalion.computeOrthodoxPascha(date.getFullYear());
                }
            }
            if (!anchor) {
                // Explicitly request Julian mode here -- NOT this module's
                // default -- since the whole point of this anchor is the
                // Julian/Orthodox Paschalion regardless of _eastSyriacOptions.
                const cal = global.EastSyriacCalendar;
                if (cal && typeof cal.getSeason === 'function') {
                    try {
                        anchor = cal.getSeason(date, { easterMode: 'julian' }).easter;
                    } catch (err) { /* fall through to legacy below */ }
                }
            }
            if (!anchor) return saintOccursOnDate(entry.dayLegacy || entry.day, date);
            return _resolveRelativeAgainstAnchor(entry, obs, date, anchor);
        }

        if (obs.type === 'relative') {
            const anchorName = obs.anchor || 'epiphany';
            let anchor = null;

            if (anchorName === 'christmas') {
                // Fixed civil date (Dec 25 of the same Gregorian year) --
                // ADDED 2026-09-07, no calendar engine needed at all. Needed
                // for the "Sunday after Nativity" feast of Joseph the
                // Betrothed, David and James (EOR) -- anchored to a fixed
                // civil date, not a movable feast, so no Paschalion of any
                // kind applies here.
                anchor = new Date(date.getFullYear(), 11, 25);
                return _resolveRelativeAgainstAnchor(entry, obs, date, anchor);
            }

            // 'easter' / 'epiphany' (default) -- UNCHANGED Church of the East
            // path, byte-for-byte as before this session's additions.
            const cal = global.EastSyriacCalendar;
            if (!cal || typeof cal.getSeason !== 'function') {
                return saintOccursOnDate(entry.dayLegacy || entry.day, date);
            }
            try {
                const o = (opts && opts.eastSyriacOptions) || _eastSyriacOptions;
                const season = cal.getSeason(date, o);
                anchor = anchorName === 'easter' ? season.easter : season.epiphanyGreg;
            } catch (err) {
                console.error('[SaintsResolver] relative resolution failed for', entry.id, err);
                return false;
            }
            if (!anchor) return false;
            return _resolveRelativeAgainstAnchor(entry, obs, date, anchor);
        }

        // "monthlyCoptic": a fixed day-of-month IN THE COPTIC CALENDAR,
        // recurring every Coptic month. ADDED 2026-09-07. Needed for the
        // Coptic Synaxis of Archangel Michael, kept the 12th of EVERY Coptic
        // month (confirmed across all twelve, coptic.io) -- a genuinely
        // recurring commemoration, not a single annual date, which none of
        // fixed/ordinal/relative/cycle can represent. Uses the same
        // Alexandrian calendar engine already shared with the Ethiopian
        // Sa'atat cycle (js/calendar-ethiopian.js), since Coptic and Ethiopian
        // dates share one calendar structure.
        if (obs.type === 'monthlyCoptic') {
            const cal = global.EthiopianCalendar;
            if (!cal || typeof cal.getCopticDate !== 'function') {
                return saintOccursOnDate(entry.dayLegacy || entry.day, date);
            }
            try {
                const c = cal.getCopticDate(date);
                return c.day === obs.day;
            } catch (err) {
                console.error('[SaintsResolver] monthlyCoptic resolution failed for', entry.id, err);
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
     * Does `saint` survive the caller's OOR sub-tradition scope?
     *
     * ADDED 2026-09-12. `oorSubtradition` existed in the data from 2026-09-07
     * but was read by NO CODE ANYWHERE -- it was pure documentation, and every
     * scoped row rendered for every OOR user regardless of their practice.
     *
     * CORRECTED SEMANTICS, established against the data 2026-09-12: the
     * `sanctoral.json` top-level note said an ABSENT `oorSubtradition` means
     * Coptic. That is wrong, and a filter built on it would hide Epiphany, the
     * Circumcision, Basil the Great, Matthias and the Forty Martyrs of Sebaste
     * from Armenian users -- 62 unscoped OOR rows are shared with other
     * traditions and are pan-Christian, not Coptic-specific. The rule that
     * actually holds: the field marks a row EXCLUSIVE to one sub-tradition;
     * absence means "not sub-tradition-specific", i.e. applies to all of them.
     * The genuinely Coptic-only rows were explicitly marked `Coptic` in the
     * same commit as this change, so absence now means what it says.
     *
     * A caller that names no sub-tradition sees everything, which is exactly
     * the behaviour before this change -- so this is additive and no existing
     * user loses a row they were seeing.
     */
    function appliesToSubtradition(saint, label, ctx) {
        if (label !== 'OOR') return true;         // scope is OOR-specific only
        const scope = saint.oorSubtradition;
        if (!scope) return true;                  // not sub-tradition-specific
        if (!ctx || !ctx.subtradition) return true;  // caller didn't narrow
        return scope === ctx.subtradition;
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
        if (tags.includes(ctx.tradition)) {
            if (!appliesToSubtradition(saint, ctx.tradition, ctx)) {
                return { ok: false, label: null, isEcu };
            }
            return { ok: true, label: ctx.tradition, isEcu };
        }

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
        const subtradition = (opts && opts.subtradition) || null;
        const entries = await _loadSanctoral();
        const ctx = { tradition, includeEcumenical, subtradition };
        // FIXED 2026-09-12: `tradition` must be threaded into the DATE rule, not
        // only into the tag filter below. Callers pass it as the second
        // positional argument (resolveCommemorations(date, 'EOR', {...})), not
        // inside opts, so passing bare `opts` to _entriesOn left
        // observanceFor() with tradition === undefined on every single call --
        // which meant `traditionObservance` was silently INERT through this
        // path, the canonical read path used by every office renderer in
        // js/office-ui.js. 55 rows carry overrides and 60 of those override
        // entries resolve to a different day than the shared rule, so each was
        // rendering on another tradition's date in the live app while the data
        // itself was correct. filterCachedByTradition() below already did this
        // correctly, so the two public read paths disagreed with each other --
        // that disagreement is how this was found. Verified against
        // prophet-joel (EOR Oct 19 via override vs Oct 31 shared) before and
        // after.
        return _entriesOn(entries, date, Object.assign({}, opts, { tradition, subtradition }))
            .filter(s => saintAppliesToContext(s, ctx).ok);
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
            // every rule this row can resolve under, shared and per-tradition,
            // so a month view never drops a row kept in this month by only one
            // of its traditions
            const rules = [e.observance].concat(
                e.traditionObservance ? Object.keys(e.traditionObservance).map(k => e.traditionObservance[k]) : []
            ).filter(Boolean);
            if (!rules.length) return saintOccursOnDate(e.day || e.dayLegacy, new Date(2000, idx, 1)) || true;
            if (rules.some(o => o.type === 'fixed'   && o.dates.some(x => x.month === m))) return true;
            if (rules.some(o => o.type === 'ordinal' && o.month === m)) return true;
            const obs = e.observance || rules[0];
            if (obs.type === 'fixed' || obs.type === 'ordinal') return false;
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
        const subtradition = (opts && opts.subtradition) || null;
        const ctx = { tradition, includeEcumenical, subtradition };
        // tradition is threaded into the date rule too, so a row kept on a
        // different day by this tradition resolves on ITS day, not the shared one
        return _entriesOn(entries, date, Object.assign({}, opts, { tradition, subtradition }))
            .filter(s => saintAppliesToContext(s, ctx).ok);
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
        observanceFor,
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