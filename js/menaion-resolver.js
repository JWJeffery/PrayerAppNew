// ── js/menaion-resolver.js ─────────────────────────────────────────────────
//
// MenaionResolver v1.1
// Architecture layer: DATA RESOLVER (not UI, not calendar, not engine)
//
// This module owns:
//   - Loading and caching Menaion monthly data files from data/menaion/
//   - Answering single-date queries: queryTroparion(mmdd) → result object
//   - Applying the minimal rank/priority model for weekday troparion selection
//   - Returning honest status codes when data is absent or not yet imported
//
// This module does NOT own:
//   - Rendering HTML
//   - Octoechos tone computation
//   - Calendar arithmetic (Julian/Gregorian, Paschalion, etc.)
//   - Office structure (vespers.json slots)
//   - Liturgical logic beyond: "for this MM-DD, what troparion is appointed?"
//
// Exposed globally as: window.MenaionResolver
//
// DATA NAMESPACE: data/menaion/<monthname>.json (12 files planned; pilot: november.json)
// SCHEMA CONTRACT: data/menaion/schema.json
//
// RESOLUTION STATUS CODES:
//   'menaion-resolved'              — troparion text returned; use it.
//   'menaion-not-imported'          — month file not in corpus yet; render rubric.
//   'menaion-no-ranked-commemoration' — date in corpus but no troparion found; weekday theme applies.
//   'menaion-text-unavailable'      — commemoration known but text not yet in corpus; render rubric.
//   'menaion-load-error'            — data file could not be fetched; degrade gracefully.
//
// RANK MODEL (v1):
//   rank 1 — Great Feast / Feast of the Theotokos  (always takes troparion slot exclusively)
//   rank 2 — Polyeleos feast                        (troparion used; Octoechos not sung)
//   rank 3 — Six-stichera / Doxology feast          (troparion used)
//   rank 4 — Simple commemoration                   (troparion used after Octoechos weekday theme)
//
//   When multiple commemorations share a date:
//     - Highest rank wins the troparion slot.
//     - Among equal ranks, the first entry in the commemorations array wins
//       (traditional liturgical precedence order as recorded in data file).
//
// CALENDAR STYLE:
//   All v1 data is new-calendar (Revised Julian / Gregorian). The resolver
//   uses the civil date's MM-DD directly. Old-calendar offset is not applied
//   in this version; that is a future engine-level concern.
//
// ──────────────────────────────────────────────────────────────────────────

const MenaionResolver = (() => {

    // ── Month file map ─────────────────────────────────────────────────────
    // Keys: month number (1–12). Values: filename stem.
    // Add entries here as monthly files are imported.
    const MONTH_FILES = {
    1:  'january',    // FULL CORPUS — all 30 dates (2026-03-07)
    2:  'february',   // FULL CORPUS — all 28 dates (2026-03-07)
    3:  'march',      // FULL CORPUS — all 31 dates (2026-03-07)
    4:  'april',      // FULL CORPUS — all 30 dates (2026-03-07)
    5:  'may',        // FULL CORPUS — all 31 dates (2026-03-07)
    6:  'june',       // FULL CORPUS — all 30 dates (2026-03-07)
    7:  'july',       // FULL CORPUS — all 31 dates (2026-03-07)
    8:  'august',     // FULL CORPUS — all 31 dates (2026-03-07)
    9:  'september',  // FULL CORPUS — all 30 dates (2026-03-07)
    10: 'october',    // FULL CORPUS — all 31 dates (2026-03-07)
    11: 'november',   // FULL CORPUS — all 30 dates, tranche 2 (2026-03-08)
    12: 'december',   // FULL CORPUS — all 31 dates, tranche 2 (2026-03-08)
};

    // ── Data base URL ──────────────────────────────────────────────────────
    const DATA_BASE = 'data/menaion/';

    // ── In-memory cache keyed by month number ──────────────────────────────
    // Values: { loaded: bool, error: bool, data: object|null }
    const _monthCache = {};

    // ── Internal: load a monthly data file ────────────────────────────────
    // Non-throwing. Sets _monthCache[monthNum] on completion.
    async function _loadMonth(monthNum) {
        // Already loaded or attempted
        if (_monthCache[monthNum]) return _monthCache[monthNum];

        const stem = MONTH_FILES[monthNum];
        if (!stem) {
            // Month not in MONTH_FILES — not imported yet
            _monthCache[monthNum] = { loaded: false, error: false, data: null, notImported: true };
            return _monthCache[monthNum];
        }

        try {
            const url = `${DATA_BASE}${stem}.json`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching ${url}`);
            const data = await resp.json();
            _monthCache[monthNum] = { loaded: true, error: false, data };
        } catch (e) {
            console.warn(`[MenaionResolver] Failed to load month ${monthNum} (${stem}):`, e.message);
            _monthCache[monthNum] = { loaded: false, error: true, data: null };
        }
        return _monthCache[monthNum];
    }

    // ── Internal: select best troparion from a date's commemoration array ──
    // Returns the commemoration object with the highest rank (lowest rank number),
    // or the first entry on ties. Skips any entry without a resolved troparion.
    function _selectBestCommemoration(commemorations) {
        if (!Array.isArray(commemorations) || commemorations.length === 0) return null;

        let best = null;
        let bestRank = 999;

        for (const c of commemorations) {
            const rank = typeof c.rank === 'number' ? c.rank : 99;
            if (rank < bestRank) {
                bestRank = rank;
                best = c;
            }
        }
        return best;
    }

    // ── Public API ─────────────────────────────────────────────────────────

    /**
     * queryTroparion(mmdd)
     *
     * Given a zero-padded MM-DD string (e.g. '11-08', '03-25'),
     * returns a result object describing the troparion appointment
     * for that fixed calendar date.
     *
     * Returns: Promise<ResultObject>
     *
     * ResultObject shape:
     * {
     *   status:   string  — one of the RESOLUTION STATUS CODES above
     *   mmdd:     string  — echo of the input
     *   name:     string|null   — commemorand name (when resolved)
     *   tone:     integer|null  — troparion tone (when resolved)
     *   title:    string|null   — troparion title (when resolved)
     *   text:     string|null   — troparion text (when resolved)
     *   rank:     integer|null  — rank of the selected commemoration
     *   note:     string|null   — liturgical note for the rubric (when not resolved)
     * }
     */
    async function queryTroparion(mmdd) {
        if (typeof mmdd !== 'string' || !/^\d{2}-\d{2}$/.test(mmdd)) {
            return {
                status: 'menaion-load-error',
                mmdd,
                name: null, tone: null, title: null, text: null, rank: null,
                note: `MenaionResolver: invalid mmdd format '${mmdd}' — expected MM-DD`
            };
        }

        const monthNum = parseInt(mmdd.split('-')[0], 10);
        const monthState = await _loadMonth(monthNum);

        // Month not in MONTH_FILES (not yet imported)
        if (monthState.notImported) {
            return {
                status: 'menaion-not-imported',
                mmdd,
                name: null, tone: null, title: null, text: null, rank: null,
                note: `Menaion data for month ${monthNum} has not yet been imported into this corpus. The weekday liturgical theme applies.`
            };
        }

        // File load error
        if (monthState.error || !monthState.loaded) {
            return {
                status: 'menaion-load-error',
                mmdd,
                name: null, tone: null, title: null, text: null, rank: null,
                note: `Menaion data for month ${monthNum} could not be loaded. The weekday liturgical theme applies.`
            };
        }

        const monthData = monthState.data;
        const dateEntry = monthData && monthData.dates && monthData.dates[mmdd];

        // Date key absent from imported file — not imported (could be legitimate gap or gap in coverage)
        if (!dateEntry || !Array.isArray(dateEntry.commemorations) || dateEntry.commemorations.length === 0) {
            return {
                status: 'menaion-no-ranked-commemoration',
                mmdd,
                name: null, tone: null, title: null, text: null, rank: null,
                note: `No ranked Menaion commemoration is recorded for ${mmdd} in this corpus. The weekday liturgical theme applies.`
            };
        }

        const best = _selectBestCommemoration(dateEntry.commemorations);
        if (!best) {
            return {
                status: 'menaion-no-ranked-commemoration',
                mmdd,
                name: null, tone: null, title: null, text: null, rank: null,
                note: `No commemoration with a valid rank found for ${mmdd}. The weekday liturgical theme applies.`
            };
        }

        // Commemoration found but troparion text not in corpus
        if (!best.troparion || best.troparion_status === 'text-unavailable' || !best.troparion.text) {
            return {
                status: 'menaion-text-unavailable',
                mmdd,
                name: best.name || null,
                tone: best.troparion_tone || null,
                title: null,
                text: null,
                rank: best.rank || null,
                note: `A Menaion commemoration (${best.name || mmdd}) is recorded for this date but the troparion text has not yet been imported into this corpus.`
            };
        }

        // Resolved
        return {
            status: 'menaion-resolved',
            mmdd,
            name: best.name,
            tone: best.troparion.tone,
            title: best.troparion.title,
            text: best.troparion.text,
            rank: best.rank,
            note: null
        };
    }

    /**
     * isMonthImported(monthNum)
     * Returns true if this month has an entry in MONTH_FILES.
     * Does not guarantee the file loaded successfully.
     */
    function isMonthImported(monthNum) {
        return Object.prototype.hasOwnProperty.call(MONTH_FILES, monthNum);
    }

    /**
     * importedMonths()
     * Returns an array of month numbers (1–12) currently in the corpus.
     */
    function importedMonths() {
        return Object.keys(MONTH_FILES).map(Number);
    }

    // ── Expose public interface ────────────────────────────────────────────
    return {
        queryTroparion,
        isMonthImported,
        importedMonths
    };

})();

// Make available globally
window.MenaionResolver = MenaionResolver;
