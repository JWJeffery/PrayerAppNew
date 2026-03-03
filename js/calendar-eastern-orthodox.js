/**
 * calendar-eastern-orthodox.js
 * Eastern Orthodox movable feast engine for The Universal Office.
 *
 * Exposes: window.EasternOrthodoxCalendar = {
 *   getYearSnapshot,
 *   getDaySnapshot,
 *   _verifyPascha
 * }
 *
 * Algorithm: Julian Paschalion (Meeus/standard Orthodox method),
 * then Julian→Gregorian conversion by adding the century-based offset.
 *
 * NO private engine calls. Zero dependencies on other calendar modules.
 *
 * Canonical offsets from Pascha (P):
 *
 *  TRIODION  P-77  Zacchaeus Sunday (Triodion opens)
 *            P-70  Publican & Pharisee Sunday
 *            P-63  Prodigal Son Sunday
 *            P-56  Meatfare Sunday (Last Judgment)
 *            P-55  Cheesefare Week begins (Monday)
 *            P-49  Cheesefare Sunday / end of Cheesefare Week
 *  GREAT LENT
 *            P-48  Clean Monday (Lent begins)
 *            P-42  Sunday of Orthodoxy (1st Sunday of Lent)
 *            P-35  St Gregory Palamas (2nd Sunday)
 *            P-28  Veneration of the Cross (3rd Sunday)
 *            P-21  St John Climacus (4th Sunday)
 *            P-14  St Mary of Egypt (5th Sunday)
 *            P-8   Lazarus Saturday
 *            P-7   Palm Sunday
 *  HOLY WEEK P-6   Holy Monday … P-1  Holy Saturday
 *  PENTECOSTARION
 *            P+0   Pascha (Bright Sunday)
 *            P+1…P+6  Bright Week (Mon–Sat)
 *            P+7   Thomas Sunday (Antipascha)
 *            P+14  Myrrhbearers Sunday
 *            P+21  Paralytic Sunday
 *            P+25  Mid-Pentecost (Wednesday)
 *            P+28  Samaritan Woman Sunday
 *            P+35  Blind Man Sunday
 *            P+39  Ascension (Thursday)
 *            P+42  Fathers of 1st Ecumenical Council
 *            P+49  Pentecost
 *  AFTER PENTECOST
 *            P+50  Monday after Pentecost (season starts)
 *            P+56  All Saints Sunday
 *            [end] day before next year's Triodion start (P_next - 77 - 1)
 */

(function (global) {
  'use strict';

  // ── Julian→Gregorian offset ──────────────────────────────────────────────
  function julianToGregorianOffset(julianYear) {
    if (julianYear >= 2100) return 14;
    if (julianYear >= 1900) return 13;
    if (julianYear >= 1800) return 12;
    if (julianYear >= 1700) return 11;
    if (julianYear >= 1600) return 10;
    return 10;
  }

  // ── Core: Julian Paschalion ──────────────────────────────────────────────
  /**
   * Compute Orthodox Pascha for a given Gregorian civil year.
   * Returns a plain JS Date (civil/Gregorian, midnight local).
   */
  function computeOrthodoxPascha(gregorianYear) {
    const y = gregorianYear;
    // Meeus Julian Easter algorithm
    const a = y % 4;
    const b = y % 7;
    const c = y % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const f = Math.floor((d + e + 114) / 31); // 3=March, 4=April
    const g = ((d + e + 114) % 31) + 1;

    const offset   = julianToGregorianOffset(y);
    const julianMs = julianDateToMs(y, f, g);
    const gregMs   = julianMs + offset * 86400000;
    const raw      = new Date(gregMs);
    // Return clean local midnight
    return new Date(raw.getFullYear(), raw.getMonth(), raw.getDate());
  }

  /**
   * Julian calendar date → Unix milliseconds (using Julian Day Numbers).
   */
  function julianDateToMs(year, month, day) {
    let y = year;
    let m = month;
    if (m < 3) { y -= 1; m += 12; }
    const JDN = Math.floor(365.25 * (y + 4716))
              + Math.floor(30.6001 * (m + 1))
              + day - 1524.5;
    return (JDN - 2440587.5) * 86400000;
  }

  // ── Date helpers ─────────────────────────────────────────────────────────
  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  }

  function toISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function fromISO(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  /** Midnight-normalized copy */
  function midnight(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /** Compare two dates by calendar day (ignores time) */
  function dateLE(a, b) { return midnight(a) <= midnight(b); }
  function dateGE(a, b) { return midnight(a) >= midnight(b); }
  function dateLT(a, b) { return midnight(a) <  midnight(b); }
  function dateEq(a, b) { return midnight(a).getTime() === midnight(b).getTime(); }

  // ── Known Pascha dates for validation ───────────────────────────────────
  const KNOWN_PASCHA_DATES = [
    { year: 2015, iso: '2015-04-12' },
    { year: 2016, iso: '2016-05-01' },
    { year: 2017, iso: '2017-04-16' },
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
    { year: 2029, iso: '2029-04-08' },
    { year: 2030, iso: '2030-04-28' },
  ];

  function verifyPascha() {
    console.group('[EasternOrthodoxCalendar] Pascha verification');
    let passed = 0, failed = 0;
    KNOWN_PASCHA_DATES.forEach(({ year, iso }) => {
      const computed = toISO(computeOrthodoxPascha(year));
      const ok = computed === iso;
      if (ok) { console.log(`  ✓ ${year}: ${computed}`); passed++; }
      else     { console.warn(`  ✗ ${year}: expected ${iso}, got ${computed}`); failed++; }
    });
    console.log(`Result: ${passed} passed, ${failed} failed`);
    console.groupEnd();
    return { passed, failed };
  }

  // ── Anchor + season + observance builder ────────────────────────────────
  /**
   * Build the full calendar structure for a given Pascha date.
   * afterPentecostEnd may be null when called for the current year in isolation;
   * the public API always resolves it by computing next year's Triodion start.
   */
  function buildCalendar(year, eoMode) {
    const P         = midnight(computeOrthodoxPascha(year));
    const P_next    = midnight(computeOrthodoxPascha(year + 1));

    // ── Anchors ────────────────────────────────────────────────────────────
    const zacchaeus         = addDays(P, -77);
    const publicanSunday    = addDays(P, -70);
    const prodigalSunday    = addDays(P, -63);
    const meatfareSunday    = addDays(P, -56);
    const cheesefareMon     = addDays(P, -55);
    const cheesefareSunday  = addDays(P, -49); // = Forgiveness Sunday
    const cleanMonday       = addDays(P, -48);
    const orthodoxySunday   = addDays(P, -42);
    const palamasSunday     = addDays(P, -35);
    const crossSunday       = addDays(P, -28);
    const climacusSunday    = addDays(P, -21);
    const egyptSunday       = addDays(P, -14);
    const lazarusSat        = addDays(P, -8);
    const palmSunday        = addDays(P, -7);
    const holyMonday        = addDays(P, -6);
    const holySaturday      = addDays(P, -1);
    const brightSatEnd      = addDays(P, +6);
    const thomasSunday      = addDays(P, +7);
    const myrrhbearers      = addDays(P, +14);
    const paralytic         = addDays(P, +21);
    const midPentecost      = addDays(P, +25); // Wednesday
    const samaritanWoman    = addDays(P, +28);
    const blindMan          = addDays(P, +35);
    const ascension         = addDays(P, +39);
    const fathersCouncil    = addDays(P, +42);
    const pentecost         = addDays(P, +49);
    const allSaints         = addDays(P, +56);
    const afterPentStart    = addDays(P, +50);

    // AFTER_PENTECOST ends the day before next year's Triodion (P_next - 77)
    const nextTriodionStart = addDays(P_next, -77);
    const afterPentEnd      = addDays(nextTriodionStart, -1);

    const anchors = {
      pascha:           P,
      cleanMonday:      cleanMonday,
      lazarusSaturday:  lazarusSat,
      palmSunday:       palmSunday,
      ascension:        ascension,
      pentecost:        pentecost,
      allSaints:        allSaints,
      nextTriodionStart: nextTriodionStart,
    };

    // ── Seasons ────────────────────────────────────────────────────────────
    const seasons = [
      {
        key:        'TRIODION',
        label:      'Triodion',
        start:      zacchaeus,
        end:        addDays(cleanMonday, -1),  // Sunday of Cheesefare = P-49
        colorToken: 'purple',
        subSeasons: [
          {
            key:        'CHEESEFARE_WEEK',
            label:      'Cheesefare Week',
            start:      cheesefareMon,
            end:        cheesefareSunday,
            colorToken: 'purple',
          }
        ],
      },
      {
        key:        'GREAT_LENT',
        label:      'Great Lent',
        start:      cleanMonday,
        end:        addDays(holyMonday, -1),   // Sunday = Palm Sunday = P-7
        colorToken: 'purple',
      },
      {
        key:        'HOLY_WEEK',
        label:      'Holy Week',
        start:      holyMonday,
        end:        holySaturday,
        colorToken: 'purple',
      },
      {
        key:        'PENTECOSTARION',
        label:      'Pentecostarion',
        start:      P,
        end:        pentecost,
        colorToken: 'white',
      },
      {
        key:        'AFTER_PENTECOST',
        label:      'After Pentecost',
        start:      afterPentStart,
        end:        afterPentEnd,
        colorToken: 'green',
      },
    ];

    // ── Observances ────────────────────────────────────────────────────────
    // kind: "sunday" | "feast" | "weekday" | "marker"
    const observances = [
      // Pre-Lent / Triodion Sundays
      { key: 'ZACCHAEUS',         label: 'Zacchaeus Sunday',                         date: zacchaeus,        kind: 'sunday',  colorToken: 'purple' },
      { key: 'PUBLICAN',          label: 'Publican & Pharisee Sunday',                date: publicanSunday,   kind: 'sunday',  colorToken: 'purple' },
      { key: 'PRODIGAL',          label: 'Prodigal Son Sunday',                       date: prodigalSunday,   kind: 'sunday',  colorToken: 'purple' },
      { key: 'MEATFARE',          label: 'Meatfare Sunday (Last Judgment)',            date: meatfareSunday,   kind: 'sunday',  colorToken: 'purple' },
      { key: 'CHEESEFARE',        label: 'Cheesefare Sunday (Forgiveness Sunday)',     date: cheesefareSunday, kind: 'sunday',  colorToken: 'purple' },

      // Great Lent weekday/Saturday markers
      { key: 'CLEAN_MONDAY',      label: 'Clean Monday',                              date: cleanMonday,      kind: 'weekday', colorToken: 'purple' },

      // Lenten Sundays
      { key: 'ORTHODOXY',         label: 'Sunday of Orthodoxy',                       date: orthodoxySunday,  kind: 'sunday',  colorToken: 'purple' },
      { key: 'PALAMAS',           label: 'St Gregory Palamas Sunday',                 date: palamasSunday,    kind: 'sunday',  colorToken: 'purple' },
      { key: 'CROSS',             label: 'Veneration of the Holy Cross',              date: crossSunday,      kind: 'sunday',  colorToken: 'purple' },
      { key: 'CLIMACUS',          label: 'St John Climacus Sunday',                   date: climacusSunday,   kind: 'sunday',  colorToken: 'purple' },
      { key: 'EGYPT',             label: 'St Mary of Egypt Sunday',                   date: egyptSunday,      kind: 'sunday',  colorToken: 'purple' },
      { key: 'LAZARUS',           label: 'Lazarus Saturday',                          date: lazarusSat,       kind: 'weekday', colorToken: 'white'  },
      { key: 'PALM_SUNDAY',       label: 'Palm Sunday (Entry into Jerusalem)',         date: palmSunday,       kind: 'feast',   colorToken: 'white'  },

      // Holy Week days
      { key: 'HOLY_MONDAY',       label: 'Holy Monday',                               date: holyMonday,               kind: 'weekday', colorToken: 'purple' },
      { key: 'HOLY_TUESDAY',      label: 'Holy Tuesday',                              date: addDays(P, -5),           kind: 'weekday', colorToken: 'purple' },
      { key: 'HOLY_WEDNESDAY',    label: 'Holy Wednesday',                            date: addDays(P, -4),           kind: 'weekday', colorToken: 'purple' },
      { key: 'HOLY_THURSDAY',     label: 'Holy Thursday (Great Thursday)',             date: addDays(P, -3),           kind: 'weekday', colorToken: 'purple' },
      { key: 'HOLY_FRIDAY',       label: 'Holy Friday (Great Friday)',                 date: addDays(P, -2),           kind: 'weekday', colorToken: 'purple' },
      { key: 'HOLY_SATURDAY',     label: 'Holy Saturday (Great Saturday)',             date: holySaturday,             kind: 'weekday', colorToken: 'purple' },

      // Pascha and Pentecostarion
      { key: 'PASCHA',            label: 'Holy Pascha (Orthodox Easter)',              date: P,                kind: 'feast',   colorToken: 'white'  },
      { key: 'THOMAS',            label: 'Thomas Sunday (Antipascha)',                 date: thomasSunday,     kind: 'sunday',  colorToken: 'white'  },
      { key: 'MYRRHBEARERS',      label: 'Sunday of the Myrrhbearers',                date: myrrhbearers,     kind: 'sunday',  colorToken: 'white'  },
      { key: 'PARALYTIC',         label: 'Sunday of the Paralytic',                   date: paralytic,        kind: 'sunday',  colorToken: 'white'  },
      { key: 'MID_PENTECOST',     label: 'Mid-Pentecost (Wednesday)',                  date: midPentecost,     kind: 'marker',  colorToken: 'white'  },
      { key: 'SAMARITAN',         label: 'Sunday of the Samaritan Woman',              date: samaritanWoman,   kind: 'sunday',  colorToken: 'white'  },
      { key: 'BLIND_MAN',         label: 'Sunday of the Blind Man',                   date: blindMan,         kind: 'sunday',  colorToken: 'white'  },
      { key: 'ASCENSION',         label: 'Ascension of Our Lord',                     date: ascension,        kind: 'feast',   colorToken: 'white'  },
      { key: 'FATHERS_COUNCIL',   label: 'Fathers of the First Ecumenical Council',   date: fathersCouncil,   kind: 'sunday',  colorToken: 'white'  },
      { key: 'PENTECOST',         label: 'Holy Pentecost (Trinity Sunday)',            date: pentecost,        kind: 'feast',   colorToken: 'white'  },
      { key: 'ALL_SAINTS',        label: 'All Saints Sunday',                         date: allSaints,        kind: 'sunday',  colorToken: 'white'  },
    ];

    return { anchors, seasons, observances, pascha: P };
  }

  // ── Season lookup helper ─────────────────────────────────────────────────
  /**
   * Given a date and a built calendar, find which season the date falls in.
   * Returns the season object (with colorToken), or null if none match.
   */
  function findSeason(date, seasons) {
    const d = midnight(date);
    for (const s of seasons) {
      if (dateGE(d, s.start) && dateLE(d, s.end)) return s;
    }
    return null;
  }

  /**
   * Determine which liturgical week a date belongs to within a season.
   * Returns { key, label } or null.
   */
  function findWeek(date, anchors, pascha) {
    const P  = anchors.pascha;
    const d  = midnight(date);

    // Bright Week: Pascha Monday through Bright Saturday
    const brightStart = addDays(P, 1);
    const brightEnd   = addDays(P, 6);
    if (dateGE(d, brightStart) && dateLE(d, brightEnd)) {
      return { key: 'BRIGHT_WEEK', label: 'Bright Week' };
    }

    // Holy Week
    const holyStart = addDays(P, -6);
    const holyEnd   = addDays(P, -1);
    if (dateGE(d, holyStart) && dateLE(d, holyEnd)) {
      return { key: 'HOLY_WEEK', label: 'Holy Week' };
    }

    // Cheesefare Week
    const cheeseStart = addDays(P, -55);
    const cheeseEnd   = addDays(P, -49);
    if (dateGE(d, cheeseStart) && dateLE(d, cheeseEnd)) {
      return { key: 'CHEESEFARE_WEEK', label: 'Cheesefare Week' };
    }

    // Lenten weeks (numbered Mon–Sat)
    const lentStart = anchors.cleanMonday;
    const palmSun   = anchors.palmSunday;
    if (dateGE(d, lentStart) && dateLT(d, holyStart)) {
      // Which week of Lent? Week 1 = Clean Monday to following Saturday
      const dayOffset = Math.floor((d - midnight(lentStart)) / 86400000);
      const weekNum   = Math.floor(dayOffset / 7) + 1;
      const weekNames = [
        'First Week of Great Lent',
        'Second Week of Great Lent',
        'Third Week of Great Lent',
        'Fourth Week of Great Lent',
        'Fifth Week of Great Lent',
        'Sixth Week of Great Lent',
      ];
      const label = weekNames[weekNum - 1] || `Week ${weekNum} of Great Lent`;
      return { key: `LENT_WEEK_${weekNum}`, label };
    }

    // Triodion weeks — name them by the defining Sunday
    const trioStart = addDays(P, -77);
    const trioEnd   = addDays(lentStart, -1);
    if (dateGE(d, trioStart) && dateLE(d, trioEnd)) {
      // Find which Triodion Sunday week we're in (Zacchaeus, Publican, etc.)
      const sundays = [
        { dayOff: -77, label: 'Week of Zacchaeus' },
        { dayOff: -70, label: 'Week of the Publican & Pharisee' },
        { dayOff: -63, label: 'Week of the Prodigal Son' },
        { dayOff: -56, label: 'Week of the Last Judgment (Meatfare)' },
        { dayOff: -49, label: 'Cheesefare Week' },
      ];
      for (let i = sundays.length - 1; i >= 0; i--) {
        const weekStart = addDays(P, sundays[i].dayOff);
        if (dateGE(d, weekStart)) {
          return { key: `TRIODION_WEEK_${i + 1}`, label: sundays[i].label };
        }
      }
    }

    // Pentecostarion weeks (after Bright Week, through Pentecost)
    const pAftBright = addDays(P, 7);
    if (dateGE(d, pAftBright) && dateLE(d, anchors.pentecost)) {
      const sundays = [
        { dayOff: 7,  label: 'Thomas Week (Antipascha Week)' },
        { dayOff: 14, label: 'Week of the Myrrhbearers' },
        { dayOff: 21, label: 'Week of the Paralytic' },
        { dayOff: 28, label: 'Week of the Samaritan Woman' },
        { dayOff: 35, label: 'Week of the Blind Man' },
        { dayOff: 42, label: 'Week of the Fathers of the First Council' },
      ];
      for (let i = sundays.length - 1; i >= 0; i--) {
        const weekStart = addDays(P, sundays[i].dayOff);
        if (dateGE(d, weekStart)) {
          return { key: `PENT_WEEK_${i + 1}`, label: sundays[i].label };
        }
      }
    }

    // After Pentecost — numbered Sundays after Pentecost
    const afterStart = addDays(P, 50);
    if (dateGE(d, afterStart)) {
      const dayOffset = Math.floor((d - midnight(afterStart)) / 86400000);
      const weekNum   = Math.floor(dayOffset / 7) + 1;
      return { key: `AFTER_PENT_WEEK_${weekNum}`, label: `Week ${weekNum} After Pentecost` };
    }

    return null;
  }

  /**
   * Find all observances on a given date. Returns [] if none match.
   */
  function findObservances(date, observances) {
    const d = midnight(date);
    return observances.filter(o => dateEq(d, o.date));
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * getYearSnapshot(year, { eoMode })
   *
   * Returns:
   * {
   *   anchors:     { pascha, cleanMonday, ascension, pentecost, allSaints, … } (ISO strings)
   *   seasons:     [ { key, label, start, end, colorToken, subSeasons? } ]
   *   observances: [ { key, label, date, kind, colorToken } ]
   *   diagnostics: { paschaAlgorithm, eoModeReceived }
   * }
   *
   * All dates on anchors and observances are ISO strings.
   * Season start/end are Date objects (admin adapter normalizes them).
   */
  function getYearSnapshot(year, options) {
    options = options || {};
    const eoMode = options.eoMode || 'new_calendar';

    const cal = buildCalendar(year, eoMode);

    // Convert anchor Dates → ISO strings
    const anchorsISO = {};
    for (const [k, v] of Object.entries(cal.anchors)) {
      anchorsISO[k] = toISO(v);
    }

    // Convert observance dates → ISO strings
    const observancesOut = cal.observances.map(o => ({
      key:        o.key,
      label:      o.label,
      date:       toISO(o.date),
      kind:       o.kind,
      colorToken: o.colorToken,
    }));

    // Seasons: keep start/end as Dates (admin buildEORSnapshot does toISO on them)
    // but also surface colorToken (not just color) for full compatibility.
    const seasonsOut = cal.seasons.map(s => ({
      key:        s.key,
      label:      s.label,
      start:      s.start,
      end:        s.end,
      colorToken: s.colorToken,
      color:      s.colorToken, // legacy compat — admin reads s.color || EOR_COLORS[s.key]
      subSeasons: (s.subSeasons || []).map(ss => ({
        key:        ss.key,
        label:      ss.label,
        start:      ss.start,
        end:        ss.end,
        colorToken: ss.colorToken,
        color:      ss.colorToken,
      })),
    }));

    return {
      anchors:     anchorsISO,
      seasons:     seasonsOut,
      observances: observancesOut,
      diagnostics: {
        paschaAlgorithm: 'julian_paschalion',
        eoModeReceived:  eoMode,
      },
    };
  }

  /**
   * getDaySnapshot(dateOrISO, { eoMode })
   *
   * Returns:
   * {
   *   date:        "YYYY-MM-DD",
   *   season:      { key, label, colorToken },
   *   week:        { key, label } | null,
   *   observances: [ { key, label, kind, colorToken } ]   <- array, never null
   *   anchors:     { pascha, cleanMonday, ascension, pentecost, allSaints, ... } // ISO
   * }
   */
  function getDaySnapshot(dateOrISO, options) {
    options = options || {};
    const eoMode = options.eoMode || 'new_calendar';

    const date = (typeof dateOrISO === 'string') ? fromISO(dateOrISO) : midnight(dateOrISO);
    const year = date.getFullYear();

    // Build calendar for this year; also build prev/next year for boundary dates.
    // A date in Jan/Feb may fall in the previous year's After Pentecost or Triodion.
    // A date in Nov/Dec may fall in next year's Triodion.
    const calPrev = buildCalendar(year - 1, eoMode);
    const calCurr = buildCalendar(year,     eoMode);
    const calNext = buildCalendar(year + 1, eoMode);

    // Try current year first, then prev, then next
    let season = findSeason(date, calCurr.seasons)
              || findSeason(date, calPrev.seasons)
              || findSeason(date, calNext.seasons);

    // Pick which calendar's anchors/observances to use for week/observance lookup.
    // Use the one whose Pascha year produced the matched season.
    let chosenCal = calCurr;
    if (!findSeason(date, calCurr.seasons)) {
      if (findSeason(date, calPrev.seasons)) chosenCal = calPrev;
      else if (findSeason(date, calNext.seasons)) chosenCal = calNext;
    }

    const week       = findWeek(date, chosenCal.anchors, chosenCal.pascha);
    const obsMatches = findObservances(date, chosenCal.observances);

    // Anchors as ISO
    const anchorsISO = {};
    for (const [k, v] of Object.entries(chosenCal.anchors)) {
      anchorsISO[k] = toISO(v);
    }

    // Default season if date falls outside all computed ranges
    const seasonOut = season
      ? { key: season.key, label: season.label, colorToken: season.colorToken }
      : { key: 'AFTER_PENTECOST', label: 'After Pentecost', colorToken: 'green' };

    const observancesOut = obsMatches.map(function(o) {
      return { key: o.key, label: o.label, kind: o.kind, colorToken: o.colorToken };
    });

    return {
      date:        toISO(date),
      season:      seasonOut,
      week:        week,
      observances: observancesOut,
      anchors:     anchorsISO,
    };
  }

  // ── Export ───────────────────────────────────────────────────────────────
  global.EasternOrthodoxCalendar = {
    getYearSnapshot,
    getDaySnapshot,
    _verifyPascha:          verifyPascha,
    _computeOrthodoxPascha: computeOrthodoxPascha,
  };

}(window));