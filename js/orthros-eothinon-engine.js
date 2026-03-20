// ── js/orthros-eothinon-engine.js ─────────────────────────────────────────
//
// OrthrosEothinonEngine
// Architecture layer: HELPER / INDEX ENGINE (not UI, not orchestration)
//
// This module owns:
//   - Computing which Eothinon (1–11) of the 11-week Byzantine cycle
//     is appointed for a given Sunday date.
//   - Detecting suppression conditions: Holy Week, Bright Week, Pascha.
//   - Exposing a clean, typed return contract consumed by HorologionEngine
//     and any future Orthros Exapostilarion resolver.
//
// This module does NOT own:
//   - Pascha computation — that belongs to js/byzantine-paschalion.js
//     (window.ByzantinePaschalion), which must be loaded first.
//   - The Eothinon text corpus (separate data file / corpus module).
//   - Exapostilarion rubric resolution (HorologionEngine Orthros pass).
//   - Tone computation (HorologionEngine is authoritative for tone).
//   - Calendar UI logic (office-ui.js).
//
// Dependency: window.ByzantinePaschalion must be present at call time.
// Load order: byzantine-paschalion.js → orthros-eothinon-engine.js
//             → horologion-engine.js
//
// Exposed globally as: window.OrthrosEothinonEngine
//
// ── Design: Suppression Detection — Two-Pass Strategy ──────────────────────
//
// Suppression (holy-week, bright-week, pascha) must be checked against the
// *upcoming* Pascha's windows, not the preceding one. Palm Sunday falls 7 days
// before its own Pascha; at that point the current civil year's Pascha is still
// in the future, so _findRelevantPascha (which returns the preceding Pascha)
// would compute the wrong holy-week window. Therefore:
//
//   Pass 1 — Suppression check: use _findNearestFuturePascha(localDate), which
//     returns the current civil year's Pascha if it is >= localDate, otherwise
//     the next year's Pascha. Compute holy-week and bright-week windows from
//     this upcoming Pascha and test localDate against them.
//
//   Pass 2 — Cycle indexing: use _findRelevantPascha(localDate), which returns
//     the preceding Pascha (<= localDate). Compute Thomas Sunday and
//     weeksFromAnchor from this. Correctly handles ordinary Sundays in the
//     pre-Lenten portion of the liturgical year.
//
// ── Design: Eothinon Cycle ──────────────────────────────────────────────────
//
// The eleven Eothina (Morning Gospels) are sung at Sunday Orthros on an
// 11-week repeating cycle. The cycle begins on Thomas Sunday (Pascha + 7 days)
// with Eothinon 1.
//
// Suppression rules (priority order):
//   1. PASCHA SUNDAY itself:                                reason: 'pascha'
//   2. BRIGHT WEEK (Mon-Sat Pascha+1..Pascha+6):           reason: 'bright-week'
//      (caught by 'not-sunday' first for those days)
//   3. HOLY WEEK (Palm Sunday P-7 through Great Sat P-1):  reason: 'holy-week'
//   4. NOT A SUNDAY:                                        reason: 'not-sunday'
//   5. INVALID INPUT:                                       reason: 'unsupported-date'
//
// ── anchorSunday semantics ───────────────────────────────────────────────────
//
// anchorSunday is the ISO date (YYYY-MM-DD) of Thomas Sunday of the relevant
// Pascha year — the actual cycle origin from which eothinonNumber and
// weeksFromAnchor are derived. It is NOT the input Sunday.
//
// ── v1.0 ────────────────────────────────────────────────────────────────────
//   Depends on: window.ByzantinePaschalion (js/byzantine-paschalion.js)
//
// ────────────────────────────────────────────────────────────────────────────

(function (global) {
    'use strict';

    // ── Constants ────────────────────────────────────────────────────────────

    const MS_PER_DAY            = 86400000;
    const EOTHINON_CYCLE_LENGTH = 11;


    // ── Internal: Pascha access ───────────────────────────────────────────────
    //
    // All Pascha computation is delegated to window.ByzantinePaschalion.
    // This module holds no Pascha algorithm of its own.

    function _getOrthodoxPascha(year) {
        return global.ByzantinePaschalion.getOrthodoxPascha(year);
    }


    // ── Internal: date utilities ─────────────────────────────────────────────

    function _localMidnight(d) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    function _formatISO(d) {
        const y  = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const da = String(d.getDate()).padStart(2, '0');
        return `${y}-${mo}-${da}`;
    }

    function _addDays(d, n) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    }


    // ── Internal: Pascha finders ─────────────────────────────────────────────

    // Returns the most recent Pascha <= localDate. Used for cycle indexing.
    function _findRelevantPascha(localDate) {
        const year   = localDate.getFullYear();
        let   pascha = _getOrthodoxPascha(year);
        if (pascha > localDate) {
            pascha = _getOrthodoxPascha(year - 1);
        }
        return pascha;
    }

    // Returns the nearest Pascha >= localDate. Used for suppression detection.
    // Required so that Palm Sunday (which precedes its own Pascha) is caught
    // by the holy-week guard even though _findRelevantPascha would point to
    // the prior year's Pascha for such dates.
    function _findNearestFuturePascha(localDate) {
        const year   = localDate.getFullYear();
        let   pascha = _getOrthodoxPascha(year);
        if (pascha < localDate) {
            pascha = _getOrthodoxPascha(year + 1);
        }
        return pascha;
    }


    // ── Internal: core index computation ────────────────────────────────────

    // _computeEothinonForSunday(localDate, precedingPascha)
    //
    // Assumes localDate has passed all suppression guards.
    // precedingPascha is the result of _findRelevantPascha(localDate).
    //
    // Returns:
    //   eothinonNumber : 1-11
    //   weeksFromAnchor: 0-based integer (0 = Thomas Sunday itself)
    //   anchorSunday   : 'YYYY-MM-DD' of Thomas Sunday (cycle origin)

    function _computeEothinonForSunday(localDate, precedingPascha) {
        const thomasSunday = _addDays(precedingPascha, 7);

        // Math.round absorbs any sub-millisecond DST drift near midnight.
        const dayDiff         = Math.round((localDate.getTime() - thomasSunday.getTime()) / MS_PER_DAY);
        const weeksFromAnchor = Math.floor(dayDiff / 7);

        const eothinonIndex  = ((weeksFromAnchor % EOTHINON_CYCLE_LENGTH) + EOTHINON_CYCLE_LENGTH) % EOTHINON_CYCLE_LENGTH;
        const eothinonNumber = eothinonIndex + 1; // 1-11

        return {
            eothinonNumber,
            weeksFromAnchor,
            anchorSunday: _formatISO(thomasSunday)  // Thomas Sunday = cycle anchor
        };
    }


    // ── Public API ───────────────────────────────────────────────────────────

    // getSundayEothinon(dateObj)
    //
    // Main entry point. Accepts any JS Date object.
    //
    // Return contract:
    // {
    //   applicable:      true | false,
    //   eothinonNumber:  1-11 | null,
    //   cycle:           'eothinon' | null,
    //   reason:          null | 'not-sunday' | 'bright-week' | 'holy-week'
    //                         | 'pascha' | 'unsupported-date',
    //   anchorSunday:    'YYYY-MM-DD' | null,   <- Thomas Sunday of relevant Pascha year
    //   weeksFromAnchor: integer | null          <- 0 = Thomas Sunday itself
    // }

    function getSundayEothinon(dateObj) {

        // Guard: valid Date
        if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
            return _notApplicable('unsupported-date');
        }

        const localDate = _localMidnight(dateObj);

        // Guard: must be Sunday
        if (localDate.getDay() !== 0) {
            return _notApplicable('not-sunday');
        }

        // ── Pass 1: suppression detection (upcoming Pascha) ──────────────────

        const upPascha        = _findNearestFuturePascha(localDate);
        const upHolyWeekStart = _addDays(upPascha, -7); // Palm Sunday
        const upHolyWeekEnd   = _addDays(upPascha, -1); // Great Saturday
        const upBrightWeekEnd = _addDays(upPascha,  6); // Thomas Saturday

        if (localDate.getTime() === upPascha.getTime()) {
            return _notApplicable('pascha');
        }

        if (localDate > upPascha && localDate <= upBrightWeekEnd) {
            return _notApplicable('bright-week');
        }

        if (localDate >= upHolyWeekStart && localDate <= upHolyWeekEnd) {
            return _notApplicable('holy-week');
        }

        // ── Pass 2: Eothinon cycle indexing (preceding Pascha) ───────────────

        const precedingPascha = _findRelevantPascha(localDate);

        // Defensive: edge case where both finders converge on the same date.
        if (localDate.getTime() === precedingPascha.getTime()) {
            return _notApplicable('pascha');
        }

        const result = _computeEothinonForSunday(localDate, precedingPascha);

        return {
            applicable:      true,
            eothinonNumber:  result.eothinonNumber,
            cycle:           'eothinon',
            reason:          null,
            anchorSunday:    result.anchorSunday,
            weeksFromAnchor: result.weeksFromAnchor
        };
    }


    // getSundayEothinonByISO(isoDateString)
    //
    // Convenience wrapper. Accepts 'YYYY-MM-DD'. Parsed as local midnight to
    // avoid UTC-shift bugs from new Date('YYYY-MM-DD').

    function getSundayEothinonByISO(isoDateString) {
        if (typeof isoDateString !== 'string') {
            return _notApplicable('unsupported-date');
        }
        const parts = isoDateString.trim().split('-');
        if (parts.length !== 3) {
            return _notApplicable('unsupported-date');
        }
        const y  = parseInt(parts[0], 10);
        const mo = parseInt(parts[1], 10) - 1;
        const da = parseInt(parts[2], 10);
        if (isNaN(y) || isNaN(mo) || isNaN(da)) {
            return _notApplicable('unsupported-date');
        }
        const d = new Date(y, mo, da);
        if (isNaN(d.getTime())) {
            return _notApplicable('unsupported-date');
        }
        return getSundayEothinon(d);
    }


    // ── Internal: result factory ─────────────────────────────────────────────

    function _notApplicable(reason) {
        return {
            applicable:      false,
            eothinonNumber:  null,
            cycle:           null,
            reason:          reason,
            anchorSunday:    null,
            weeksFromAnchor: null
        };
    }


    // ── Expose on window ─────────────────────────────────────────────────────

    global.OrthrosEothinonEngine = {
        getSundayEothinon,
        getSundayEothinonByISO
    };

}(typeof window !== 'undefined' ? window : this));