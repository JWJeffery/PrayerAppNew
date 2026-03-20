// ── js/byzantine-paschalion.js ────────────────────────────────────────────
//
// ByzantinePaschalion
// Architecture layer: SHARED UTILITY (calendar primitive)
//
// Single source of truth for Orthodox (New Calendar / Julian) Pascha
// computation within the Universal Office project.
//
// This module was extracted from js/horologion-engine.js (v1.3), where the
// algorithm existed as a private IIFE-scoped function with a comment noting
// it was a duplicate of js/calendar-eastern-orthodox.js and should eventually
// be replaced with a delegation call. That delegation is now enacted here.
//
// Consumers:
//   - js/horologion-engine.js   (replaces internal _computeOrthodoxPascha /
//                                 _getOrthodoxPascha / _paschaCache)
//   - js/orthros-eothinon-engine.js
//
// Must be loaded before any of the above. See index.html script order.
//
// Exposed globally as: window.ByzantinePaschalion
//
// ── Algorithm ───────────────────────────────────────────────────────────────
//
// Meeus Julian Paschalion (Jean Meeus, "Astronomical Algorithms", Ch. 9).
// Returns the Gregorian date of Orthodox Pascha for a given year.
//
// Julian-to-Gregorian offset: +13 days.
// Correct for all dates 1900–2099 — the operational range of this application.
//
// ── Public API ───────────────────────────────────────────────────────────────
//
//   ByzantinePaschalion.computeOrthodoxPascha(gregorianYear)
//     → JS Date at local midnight (Gregorian). Not cached.
//
//   ByzantinePaschalion.getOrthodoxPascha(gregorianYear)
//     → Same, but result is cached by year for the session lifetime.
//
// ── v1.0 ────────────────────────────────────────────────────────────────────

(function (global) {
    'use strict';

    const MS_PER_DAY = 86400000;
    const JULIAN_TO_GREGORIAN_OFFSET_DAYS = 13; // correct 1900–2099

    // Session-lifetime cache: { '2026': Date, ... }
    const _cache = {};

    // computeOrthodoxPascha(gregorianYear)
    //
    // Uncached. Computes and returns Orthodox Pascha as a JS Date at local
    // midnight. Algorithm: Meeus Julian Paschalion.
    function computeOrthodoxPascha(gregorianYear) {
        const y = gregorianYear;
        const a = y % 4;
        const b = y % 7;
        const c = y % 19;
        const d = (19 * c + 15) % 30;
        const e = (2 * a + 4 * b - d + 34) % 7;
        const f = Math.floor((d + e + 114) / 31); // 3 = March, 4 = April (Julian)
        const g = ((d + e + 114) % 31) + 1;       // day of month (Julian)

        // Julian → Gregorian: add 13 days.
        // JS Date constructor handles month/day overflow automatically.
        const julianDay = new Date(y, f - 1, g);
        const gregMs    = julianDay.getTime() + JULIAN_TO_GREGORIAN_OFFSET_DAYS * MS_PER_DAY;
        const raw       = new Date(gregMs);
        return new Date(raw.getFullYear(), raw.getMonth(), raw.getDate()); // local midnight
    }

    // getOrthodoxPascha(gregorianYear)
    //
    // Cached wrapper. Safe to call repeatedly within a session.
    function getOrthodoxPascha(gregorianYear) {
        const key = String(gregorianYear);
        if (!_cache[key]) {
            _cache[key] = computeOrthodoxPascha(gregorianYear);
        }
        return _cache[key];
    }

    global.ByzantinePaschalion = {
        computeOrthodoxPascha,
        getOrthodoxPascha
    };

}(typeof window !== 'undefined' ? window : this));