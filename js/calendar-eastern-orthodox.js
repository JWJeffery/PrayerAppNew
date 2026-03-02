/**
 * calendar-eastern-orthodox.js
 * Eastern Orthodox movable feast engine for The Universal Office.
 *
 * Exposes: window.EasternOrthodoxCalendar = { getYearSnapshot }
 *
 * Algorithm: Julian Paschalion (Meeus/standard Orthodox method),
 * then Julian→Gregorian conversion by adding the century-based offset.
 *
 * NO private engine calls. Zero dependencies on other calendar modules.
 */

(function (global) {
  'use strict';

  // ── Julian→Gregorian offset table ───────────────────────────────────────
  // For years 1900–2099 the Julian calendar runs 13 days behind Gregorian.
  // For earlier centuries we extend the table for completeness, but the app
  // targets roughly 1800–2100.
  function julianToGregorianOffset(julianYear) {
    if (julianYear >= 2100) return 14;
    if (julianYear >= 1900) return 13;
    if (julianYear >= 1800) return 12;
    if (julianYear >= 1700) return 11;
    if (julianYear >= 1600) return 10;
    return 10; // conservative fallback for earlier centuries
  }

  // ── Core: Julian Paschalion ──────────────────────────────────────────────
  /**
   * Compute Orthodox Pascha for a given Gregorian civil year.
   *
   * Steps:
   *   1. Find the Julian calendar year whose Easter corresponds to the given
   *      Gregorian year. (We iterate on years that differ by the offset.)
   *   2. Apply the Meeus Julian Easter algorithm to get a Julian calendar date.
   *   3. Convert Julian date → Gregorian civil date by adding the offset.
   *
   * Returns a plain JS Date (civil/Gregorian).
   */
  function computeOrthodoxPascha(gregorianYear) {
    // Orthodox Pascha is calculated on the Julian calendar.
    // The Julian year roughly equals the Gregorian year for the spring months,
    // but the result date is then offset forward to Gregorian civil.
    //
    // We compute the Julian Easter in the JULIAN year == gregorianYear,
    // then shift it to Gregorian. This is the standard approach.

    const y = gregorianYear;

    // Meeus Algorithm (Julian calendar Easter):
    const a = y % 4;
    const b = y % 7;
    const c = y % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const f = Math.floor((d + e + 114) / 31); // month: 3=March, 4=April
    const g = ((d + e + 114) % 31) + 1;       // day of that Julian month

    // Julian date: year y, month f, day g
    // Convert Julian → Gregorian by adding offset
    const offset = julianToGregorianOffset(y);
    const julianMs = julianDateToMs(y, f, g);
    const gregorianMs = julianMs + offset * 86400000;
    return new Date(gregorianMs);
  }

  /**
   * Convert a proleptic Julian calendar date to a JS timestamp (ms since epoch).
   * We use the Julian Day Number approach for precision.
   */
  function julianDateToMs(year, month, day) {
    // Julian Day Number for a Julian calendar date (Meeus, ch. 7)
    let y = year;
    let m = month;
    if (m < 3) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    // Julian JDN (no Gregorian correction):
    const JDN = Math.floor(365.25 * (y + 4716))
              + Math.floor(30.6001 * (m + 1))
              + day - 1524.5;
    // Julian epoch offset: JDN 0 = Jan 1, 4713 BC noon
    // Unix epoch (Jan 1 1970) = JDN 2440587.5
    const msSinceUnix = (JDN - 2440587.5) * 86400000;
    return msSinceUnix;
  }

  // ── Date arithmetic ──────────────────────────────────────────────────────
  function addDays(date, n) {
    const d = new Date(date.getTime());
    d.setDate(d.getDate() + n);
    return d;
  }

  function dateFromCivil(date) {
    // Return a clean midnight Date from an existing Date
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  // ── Known Pascha dates for validation ───────────────────────────────────
  // Source: standard Orthodox Paschalion tables.
  const KNOWN_PASCHA_DATES = [
    { year: 2018, iso: '2018-04-08' },
    { year: 2019, iso: '2019-04-28' },
    { year: 2020, iso: '2020-04-19' },
    { year: 2021, iso: '2021-05-02' },
    { year: 2022, iso: '2022-04-24' },
    { year: 2023, iso: '2023-04-16' },
    { year: 2024, iso: '2024-05-05' },
    { year: 2025, iso: '2025-04-20' },
    { year: 2026, iso: '2026-04-12' },
    { year: 2027, iso: '2027-05-02' },
    { year: 2028, iso: '2028-04-16' },
  ];

  function toISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Runs console verification of computed Pascha against known table.
   * Call EasternOrthodoxCalendar._verifyPascha() from browser console.
   */
  function verifyPascha() {
    console.group('[EasternOrthodoxCalendar] Pascha verification');
    let passed = 0;
    let failed = 0;
    KNOWN_PASCHA_DATES.forEach(({ year, iso }) => {
      const computed = toISO(computeOrthodoxPascha(year));
      const ok = computed === iso;
      if (ok) {
        console.log(`  ✓ ${year}: ${computed}`);
        passed++;
      } else {
        console.warn(`  ✗ ${year}: expected ${iso}, got ${computed}`);
        failed++;
      }
    });
    console.log(`Result: ${passed} passed, ${failed} failed`);
    console.groupEnd();
    return { passed, failed };
  }

  // ── Season builder ───────────────────────────────────────────────────────
  function buildSeasons(pascha) {
    const P = dateFromCivil(pascha);

    const cleanMonday  = addDays(P, -48);
    const holyMonday   = addDays(P, -6);
    const ascension    = addDays(P, 39);
    const pentecost    = addDays(P, 49);
    const allSaints    = addDays(P, 56);

    const trioStart    = addDays(P, -70);
    const trioEnd      = addDays(cleanMonday, -1);

    const cheeseStart  = addDays(P, -55);
    const cheeseEnd    = addDays(P, -49);

    const lentEnd      = addDays(P, -9);

    const penteEnd     = addDays(P, 49);   // == pentecost day itself
    const afterPentStart = addDays(P, 50);

    const seasons = [
      {
        key:   'TRIODION',
        label: 'Triodion (Pre-Lent)',
        start: trioStart,
        end:   trioEnd,
        color: 'purple',
        subSeasons: [
          {
            key:   'CHEESEFARE_WEEK',
            label: 'Cheesefare Week (Maslenitsa)',
            start: cheeseStart,
            end:   cheeseEnd,
            color: 'purple',
          }
        ]
      },
      {
        key:   'GREAT_LENT',
        label: 'Great Lent',
        start: cleanMonday,
        end:   lentEnd,
        color: 'purple',
      },
      {
        key:   'HOLY_WEEK',
        label: 'Holy Week',
        start: holyMonday,
        end:   addDays(P, -1),
        color: 'purple',
      },
      {
        key:   'PENTECOSTARION',
        label: 'Pentecostarion (Bright Season)',
        start: P,
        end:   penteEnd,
        color: 'white',
      },
      {
        key:   'AFTER_PENTECOST',
        label: 'After Pentecost',
        start: afterPentStart,
        end:   null, // open-ended; see _notImplemented note below
        color: 'green',
      },
    ];

    return {
      anchors: {
        pascha:      P,
        cleanMonday: cleanMonday,
        ascension:   ascension,
        pentecost:   pentecost,
        allSaints:   allSaints,
      },
      seasons,
    };
  }

  // ── Public API ───────────────────────────────────────────────────────────
  /**
   * getYearSnapshot(year, options)
   *
   * @param {number} year  - Civil/Gregorian year (e.g. 2026)
   * @param {object} options
   * @param {string} [options.eoMode] - Accepted, ignored for now.
   *
   * @returns {object} Snapshot with shape:
   *   {
   *     anchors: { pascha, cleanMonday, ascension, pentecost, allSaints },
   *     seasons: [ { key, label, start, end, color, subSeasons? } ],
   *     diagnostics: { paschaAlgorithm }
   *   }
   */
  function getYearSnapshot(year, options) {
    options = options || {};
    // eoMode accepted but ignored per spec
    const pascha = computeOrthodoxPascha(year);
    const { anchors, seasons } = buildSeasons(pascha);

    // AFTER_PENTECOST end: the spec says "no need to compute end yet".
    // We leave it null and flag it so the UI can handle gracefully
    // rather than silently failing.
    const afterPentecost = seasons.find(s => s.key === 'AFTER_PENTECOST');
    if (afterPentecost && afterPentecost.end === null) {
      afterPentecost._endNotImplemented = true;
      // Supply a safe placeholder end (Dec 31 of the year) so rendering code
      // that expects a Date doesn't blow up. The flag above is the contract signal.
      afterPentecost.end = new Date(year, 11, 31);
    }

    return {
      anchors,
      seasons,
      diagnostics: {
        paschaAlgorithm: 'julian_paschalion',
      }
    };
  }

  // ── Export ───────────────────────────────────────────────────────────────
  global.EasternOrthodoxCalendar = {
    getYearSnapshot,
    // Exposed for console diagnostics — not called by UI
    _verifyPascha:        verifyPascha,
    _computeOrthodoxPascha: computeOrthodoxPascha,
  };

}(window));