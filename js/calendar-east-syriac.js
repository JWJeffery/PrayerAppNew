/**
 * CALENDAR-EAST-SYRIAC.JS
 * Church of the East Liturgical Calendar for The Universal Office.
 *
 * Provides:
 *   EastSyriacCalendar.getSeason(gregorianDate)
 *     → { season, weekInSeason, cycle, weekLabel, seasonLabel, easter }
 *   EastSyriacCalendar.getEaster(gregorianYear)
 *     → Date  (Gregorian JS Date of d'Qyamta for that year)
 *   EastSyriacCalendar.getLiturgicalYear(gregorianDate)
 *     → { subaraStart, easter, seasons, nextSubara }
 *
 * The Nine Seasons of the Church of the East:
 *   1. Subara      (Annunciation/Advent)  — Sunday ≥ Nov 28, variable length
 *   2. Denkha      (Epiphany)             — Sunday ≥ Jan 19, variable length
 *   3. Sauma       (Great Fast/Lent)      — 7 weeks before Easter, fixed 7 wks
 *   4. Qyamta      (Resurrection)         — Easter Sunday, fixed 7 weeks
 *   5. Shlihe      (Apostles)             — Pentecost, fixed 7 weeks
 *   6. Qayta       (Summer)               — 14 weeks after Easter, fixed 7 wks
 *   7. Eliya-Sliwa (Elijah & Cross)       — after Qayta, variable length
 *   8. Muse        (Moses)                — Cross Sunday, variable (can be 0)
 *   9. Qudash 'Idta (Dedication)          — 1st Sunday of October, variable
 *
 * Easter Calculation:
 *   The Church of the East observes d'Qyamta using the Julian calendar.
 *   This module uses the Meeus algorithm for Julian Easter, then converts
 *   the resulting Julian date to a Gregorian Date object via JDN.
 *   For modern dates (1900–2099), the Julian calendar runs 13 days behind
 *   Gregorian; the JDN conversion handles this exactly.
 *
 * Qdham/Wathar Cycle (the seam fix):
 *   The even/odd Psalter cycle is anchored to weeks elapsed since Subara
 *   Sunday, not to the ISO calendar week. This correctly resets to Qdham
 *   (week 1, odd) at the start of every liturgical year, regardless of
 *   whether the year contains 52 or 53 weeks.
 *   Verified reference: 2027/28 is a 53-week year — the ISO-week approach
 *   would silently produce the wrong cycle for the first week of Subara 2028.
 *
 * Fixed feasts used as anchors (all Julian → Gregorian +13 days, modern era):
 *   Denkha  (Epiphany):  Jan  6 Julian = Jan 19 Gregorian
 *   Elijah feast:        Jul 20 Julian = Aug  2 Gregorian (not a hard boundary)
 *   Holy Cross (Sliwa):  Sep 14 Julian = Sep 27 Gregorian
 *   Qudash 'Idta:        First Sunday of October
 *
 * Season length variability (verified 2024–2028):
 *   Subara:       7–8 weeks
 *   Denkha:       4–8 weeks
 *   Eliya-Sliwa:  1–3 weeks (0 in extreme Easter years)
 *   Muse:         0–1 weeks
 *   Qudash 'Idta: 8–9 weeks
 *
 * Architecture: Standalone IIFE module following calendar-ethiopian.js
 * pattern. Does not touch CalendarEngine or any BCP logic.
 *
 * Phase 8.1 — Church of the East liturgical calendar.
 */

const EastSyriacCalendar = (() => {

    // ── Season identifiers and display names ─────────────────────────────────

    const SEASON_META = {
        'subara':      { label: 'Subara',       labelSyriac: 'ܣܘܒܪܐ',      color: 'purple' },
        'denkha':      { label: 'Denkha',       labelSyriac: 'ܕܢܚܐ',       color: 'white'  },
        'sauma':       { label: 'Sauma',        labelSyriac: 'ܨܘܡܐ',       color: 'purple' },
        'qyamta':      { label: 'Qyamta',       labelSyriac: 'ܩܝܡܬܐ',      color: 'white'  },
        'shlihe':      { label: 'Shlihe',       labelSyriac: 'ܫܠܝ̈ܚܐ',      color: 'red'    },
        'qayta':       { label: 'Qayta',        labelSyriac: 'ܩܝܛܐ',       color: 'green'  },
        'eliya-sliwa': { label: 'Eliya-Sliwa',  labelSyriac: 'ܐܠܝܐ ܘܨܠܝܒܐ', color: 'green'  },
        'muse':        { label: 'Muse',         labelSyriac: 'ܡܘܫܐ',       color: 'green'  },
        'qudash-idta': { label: "Qudash 'Idta", labelSyriac: 'ܩܘܕܫ ܥܕܬܐ',  color: 'white'  },
    };

    const ORDINALS = [
        '', 'First', 'Second', 'Third', 'Fourth', 'Fifth',
        'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
    ];

    // ── Date utilities ────────────────────────────────────────────────────────

    /**
     * Strip time component; return a new Date at midnight local.
     * @param  {Date} date
     * @return {Date}
     */
    function toMidnight(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    /**
     * Return a new Date offset by n days.
     * @param  {Date}   date
     * @param  {number} n  — may be negative
     * @return {Date}
     */
    function addDays(date, n) {
        const d = toMidnight(date);
        d.setDate(d.getDate() + n);
        return d;
    }

    /**
     * Return the Sunday on or after the given date.
     * If the date is already Sunday, returns that date.
     * @param  {Date} date
     * @return {Date}
     */
    function nextSundayOnOrAfter(date) {
        const d = toMidnight(date);
        const dow = d.getDay(); // 0 = Sunday
        if (dow !== 0) d.setDate(d.getDate() + (7 - dow));
        return d;
    }

    /**
     * Whole weeks elapsed from start to date (floor).
     * Used to calculate weekInSeason and Qdham/Wathar parity.
     * @param  {Date} start  — must be a Sunday
     * @param  {Date} date
     * @return {number}
     */
    function weeksSince(start, date) {
        // Use UTC day-number arithmetic rather than raw ms subtraction.
        // Raw ms subtraction is vulnerable to DST transitions: a spring-forward
        // boundary (-1 hr) between start and date reduces the interval by 3 600 000 ms,
        // which is enough to make Math.floor() return one week fewer than the true count.
        // That single-week error flips Qdham/Wathar parity for every date beyond the
        // DST boundary. Using Date.UTC() for both operands strips local timezone offsets
        // and DST shifts entirely, giving a pure day count.
        const s = toMidnight(start);
        const d = toMidnight(date);
        const dayDiff = Math.round(
            (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) -
             Date.UTC(s.getFullYear(), s.getMonth(), s.getDate()))
            / 86400000
        );
        return Math.floor(dayDiff / 7);
    }

    // ── Julian Easter (Meeus algorithm) ──────────────────────────────────────

    /**
     * Calculate the Julian calendar date of Easter for a given year.
     * Uses the Meeus/Jones/Butcher algorithm for the Julian calendar.
     * Returns an object { year, month, day } in the Julian calendar.
     *
     * @param  {number} year  — Gregorian/Julian year (they share year numbers)
     * @return {{ year: number, month: number, day: number }}
     */
    function julianEasterDate(year) {
        const a = year % 4;
        const b = year % 7;
        const c = year % 19;
        const d = (19 * c + 15) % 30;
        const e = (2 * a + 4 * b - d + 34) % 7;
        const f = Math.floor((d + e + 114) / 31);   // month (3=March, 4=April)
        const g = ((d + e + 114) % 31) + 1;          // day of month
        return { year, month: f, day: g };
    }

    /**
     * Convert a Julian calendar date to a Gregorian JS Date via Julian Day
     * Number (JDN). Valid for all historical and future dates.
     *
     * Julian JDN formula (positive for all dates ≥ 4713 BC):
     *   JDN = day + ⌊(153m + 2)/5⌋ + 365y + ⌊y/4⌋ − 32083
     *   where a = ⌊(14−month)/12⌋,  y = year + 4800 − a,  m = month + 12a − 3
     *
     * Gregorian date from JDN (Richards algorithm):
     *   Standard algorithm as used in calendar-ethiopian.js.
     *
     * @param  {number} jYear
     * @param  {number} jMonth  — 1-indexed
     * @param  {number} jDay
     * @return {Date}           — Gregorian JS Date at local midnight
     */
    function julianToGregorian(jYear, jMonth, jDay) {
        // Step 1: Julian date → JDN
        const a = Math.floor((14 - jMonth) / 12);
        const y = jYear + 4800 - a;
        const m = jMonth + 12 * a - 3;
        const jdn = jDay
            + Math.floor((153 * m + 2) / 5)
            + 365 * y
            + Math.floor(y / 4)
            - 32083;

        // Step 2: JDN → Gregorian (Richards algorithm)
        const l  = jdn + 68569;
        const n  = Math.floor(4 * l / 146097);
        const ll = l - Math.floor((146097 * n + 3) / 4);
        const i  = Math.floor(4000 * (ll + 1) / 1461001);
        const lll = ll - Math.floor(1461 * i / 4) + 31;
        const j  = Math.floor(80 * lll / 2447);
        const day   = lll - Math.floor(2447 * j / 80);
        const k    = Math.floor(j / 11);
        const month = j + 2 - 12 * k;     // 1-indexed
        const year  = 100 * (n - 49) + i + k;

        return new Date(year, month - 1, day);  // month − 1 for JS 0-indexed
    }

    /**
     * Return the Gregorian JS Date of the Western/Gregorian Easter for a
     * given Gregorian year. Anonymous Gregorian algorithm (Meeus,
     * "Astronomical Algorithms", Ch. 8) -- the standard algorithm used by
     * Western/Catholic/Protestant churches, and confirmed 2026-08-30 to be
     * what the ACOTE Diocese of Western Europe's own published 2026
     * Ecclesiastical Calendar actually uses for d'Qyamta (its April 5, 2026
     * entry is Gregorian Easter, not the April 12, 2026 Julian Easter this
     * engine's own getEaster() computes by default).
     *
     * @param  {number} year — Gregorian year
     * @return {Date}
     */
    function computeGregorianEaster(year) {
        const y = year;
        const a = y % 19;
        const b = Math.floor(y / 100);
        const c = y % 100;
        const d2 = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d2 - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
        const day   = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(y, month - 1, day);
    }

    /**
     * Return the Gregorian JS Date of d'Qyamta (East Syriac Easter)
     * for a given Gregorian year.
     *
     * @param  {number} year  — Gregorian year
     * @param  {'julian'|'gregorian'} [easterMode='julian'] — which Easter
     *   algorithm to use. Defaults to 'julian', this engine's original and
     *   still-primary basis (matches Maclean 1894 and every date this
     *   engine's self-tests were originally verified against). 'gregorian'
     *   matches current practice in at least the ACOTE Diocese of Western
     *   Europe (confirmed 2026-08-30, see documentation/AUDIT_GOVERNANCE_LEDGER.md).
     *   Real ACOE practice on this point is genuinely split, the same shape
     *   of disclosed variation already noted for Nativity elsewhere in this
     *   file -- this parameter exists so both can be modeled rather than
     *   forcing one, exactly as js/calendar-eastern-orthodox.js's eoMode
     *   already does for its own (different, fixed-feast-only) Julian/
     *   Gregorian split.
     * @return {Date}
     */
    function getEaster(year, easterMode) {
        const mode = (easterMode === 'gregorian') ? 'gregorian' : 'julian';
        if (mode === 'gregorian') {
            return computeGregorianEaster(year);
        }
        const jE = julianEasterDate(year);
        return julianToGregorian(jE.year, jE.month, jE.day);
    }

    // ── Liturgical year construction ──────────────────────────────────────────

    /**
     * Build the full season boundary map for the liturgical year that contains
     * the given date. The year runs from Subara Sunday through the Saturday
     * before the following Subara Sunday.
     *
     * Each season entry: { start: Date, end: Date }
     * Season order follows the Church of the East Hudra cycle.
     *
     * @param  {Date} date
     * @return {{
     *   subaraStart: Date,
     *   easter:      Date,
     *   nextSubara:  Date,
     *   seasons:     Array<{ name: string, start: Date, end: Date }>
     * }}
     */
    function getLiturgicalYear(date, options) {
        const easterMode = (options && options.easterMode === 'gregorian') ? 'gregorian' : 'julian';
        const d = toMidnight(date);

        // Find the Subara Sunday that opens the liturgical year containing `date`.
        // Subara starts on the Sunday on or after Nov 28.
        // The year may belong to Subara of year Y (if d ≥ Subara of Y) or
        // Subara of Y-1 (if d < Subara of Y).
        //
        // Strategy: check the Subara that starts in d.getFullYear() - 1,
        // then the one in d.getFullYear(), and pick the correct bracket.

        function subaraSundayFor(y) {
            return nextSundayOnOrAfter(new Date(y, 10, 28)); // Nov 28
        }

        let subaraYear = d.getFullYear();
        let subaraStart = subaraSundayFor(subaraYear);

        // If `date` is before this year's Subara Sunday, step back one year
        if (d < subaraStart) {
            subaraYear  -= 1;
            subaraStart  = subaraSundayFor(subaraYear);
        }

        // Easter falls in the year after Subara starts
        const easterYear = subaraYear + 1;
        const easter     = getEaster(easterYear, easterMode);

        // Next Subara (= end boundary, exclusive)
        const nextSubara = subaraSundayFor(subaraYear + 1);

        // ── Fixed-offset seasons ─────────────────────────────────────────────
        //
        // Denkha: Sunday on or after Jan 19 (= Julian Epiphany Jan 6 +13)
        const denkhaStart = nextSundayOnOrAfter(new Date(easterYear, 0, 19));

        // Sauma: exactly 7 weeks (49 days) before Easter — always a Sunday
        const saumaStart = addDays(easter, -49);

        // Qyamta: Easter Sunday itself
        const qyamtaStart = toMidnight(easter);

        // Shlihe: Pentecost = 7 weeks (49 days) after Easter
        const shliheStart = addDays(easter, 49);

        // Qayta: 14 weeks (98 days) after Easter
        const qaytaStart = addDays(easter, 98);

        // ── Variable seasons ─────────────────────────────────────────────────
        //
        // Eliya-Sliwa: 7 fixed weeks of Qayta, then runs until Cross Sunday
        // The Holy Cross feast (Sliwa) is Sep 14 Julian = Sep 27 Gregorian.
        // The season begins the Sunday that opens the week of Sep 27.
        const eliyaSliwaStart = addDays(qaytaStart, 49); // 7 × 7

        const crossDay    = new Date(easterYear, 8, 27); // Sep 27 Gregorian
        const crossSunday = nextSundayOnOrAfter(crossDay);

        // Muse: begins on the Cross Sunday.
        // In years where Cross Sunday falls on or after the first Sunday of
        // October, Muse has 0 weeks — those days are absorbed by Qudash 'Idta.
        const museStart = crossSunday;

        // Qudash 'Idta: first Sunday of October
        const oct1             = new Date(easterYear, 9, 1);
        const qudashIdtaStart  = nextSundayOnOrAfter(oct1);

        // ── Build season list in calendar order ──────────────────────────────
        //
        // Note: if Muse start === Qudash 'Idta start (Cross Sunday IS the
        // first Oct Sunday, or Cross Sunday falls after it), Muse is omitted.
        const useMuse = museStart < qudashIdtaStart;

        const seasons = [
            { name: 'subara',      start: subaraStart,    end: addDays(denkhaStart,    -1) },
            { name: 'denkha',      start: denkhaStart,    end: addDays(saumaStart,     -1) },
            { name: 'sauma',       start: saumaStart,     end: addDays(qyamtaStart,    -1) },
            { name: 'qyamta',      start: qyamtaStart,    end: addDays(shliheStart,    -1) },
            { name: 'shlihe',      start: shliheStart,    end: addDays(qaytaStart,     -1) },
            { name: 'qayta',       start: qaytaStart,     end: addDays(eliyaSliwaStart,-1) },
            { name: 'eliya-sliwa', start: eliyaSliwaStart,end: addDays(museStart,      -1) },
        ];

        if (useMuse) {
            seasons.push({ name: 'muse',       start: museStart,      end: addDays(qudashIdtaStart, -1) });
        }

        seasons.push(  { name: 'qudash-idta', start: qudashIdtaStart, end: addDays(nextSubara,      -1) });

        return { subaraStart, saumaStart, easter, nextSubara, seasons, crossDay };
    }

    // ── Public: getSeason ─────────────────────────────────────────────────────

    /**
     * Return the full liturgical context for a given Gregorian date.
     *
     * @param  {Date} gregorianDate
     * @return {{
     *   season:       string,   — e.g. 'sauma', 'qyamta'
     *   seasonLabel:  string,   — e.g. 'Sauma', "Qudash 'Idta"
     *   seasonColor:  string,   — liturgical colour: 'purple'|'white'|'red'|'green'
     *   weekInSeason: number,   — 1-based week number within the current season
     *   weekLabel:    string,   — e.g. 'Third Sunday of Sauma'
     *   cycle:        string,   — 'qdham' | 'wathar'
     *   cycleLabel:   string,   — 'Qdham (Before)' | 'Wathar (After)'
     *   easter:       Date,     — d'Qyamta for this liturgical year
     *   subaraStart:  Date,     — first day of current liturgical year
     * }}
     */
    function getSeason(gregorianDate, options) {
        const d = toMidnight(gregorianDate);
        const { subaraStart, saumaStart, easter, seasons } = getLiturgicalYear(d, options);
        // Find which season contains this date
        let currentSeason = null;
        for (const s of seasons) {
            if (d >= s.start && d <= s.end) {
                currentSeason = s;
                break;
            }
        }

        // Fallback: if somehow outside all ranges (shouldn't happen),
        // assign to the nearest boundary
        if (!currentSeason) {
            console.warn(`[EastSyriacCalendar] ${d.toDateString()} fell outside all season ranges; defaulting to qudash-idta.`);
            currentSeason = seasons[seasons.length - 1];
        }

        const meta = SEASON_META[currentSeason.name] || { label: currentSeason.name, color: 'green' };

        // Week within season (1-based, counting from the season's start Sunday)
        const weekInSeason = weeksSince(currentSeason.start, d) + 1;

        // Ordinal label (cap at ORDINALS array length; beyond that use number)
        const ordinal = weekInSeason < ORDINALS.length
            ? ORDINALS[weekInSeason]
            : `${weekInSeason}th`;
        const weekLabel = `${ordinal} Sunday of ${meta.label}`;

        // Qdham/Wathar: anchored to weeks since Subara Sunday (0-based count).
        // Week 0 of the liturgical year = Qdham.
        // This resets correctly at every Subara regardless of year length.
        const weeksSinceSubara = weeksSince(subaraStart, d);
        const cycle      = weeksSinceSubara % 2 === 0 ? 'qdham' : 'wathar';
        const cycleLabel = cycle === 'qdham' ? 'Qdham (Before)' : 'Wathar (After)';

        // ── Nineveh Fast ──────────────────────────────────────────────────────
        // Ba'utha d'Ninwaye: Monday–Wednesday of the week three weeks before Sauma.
        // saumaStart is always a Sunday; subtracting 20 days lands on the Monday
        // of the Nineveh week.
        const ninevehMonday = addDays(saumaStart, -20);
        const ninevehWed    = addDays(ninevehMonday, 2);
        const ninevehFast   = { start: ninevehMonday, end: ninevehWed };

        // ── Fasting character ─────────────────────────────────────────────────
        const pentecost = addDays(easter, 49);
        let fastCharacter, fastLabel;

        if (d >= ninevehMonday && d <= ninevehWed) {
            fastCharacter = 'nineveh-fast';
            fastLabel     = "Ba\'utha d\'Ninwaye — Nineveh Fast";
        } else if (d >= saumaStart && d < easter) {
            fastCharacter = 'great-fast';
            fastLabel     = 'Sauma — the Great Fast';
        } else if (d >= easter && d < pentecost) {
            fastCharacter = 'feast';
            fastLabel     = 'Season of Qyamta — fasting suspended';
        } else if (d.getMonth() === 0 && d.getDate() === 18) {
            // Jan 18 Gregorian = Eve of Denkha (Julian Epiphany Jan 6 + 13)
            fastCharacter = 'fast';
            fastLabel     = 'Eve of Denkha — Fast';
        } else if (d.getDay() === 3) {
            // Wednesday
            fastCharacter = 'fast';
            fastLabel     = 'Wednesday — Station Fast';
        } else if (d.getDay() === 5) {
            // Friday
            fastCharacter = 'fast';
            fastLabel     = 'Friday — Station Fast';
        } else {
            fastCharacter = 'ordinary';
            fastLabel     = 'Ordinary Day';
        }

        // ── Anaphora appointment ──────────────────────────────────────────────
        // Three anaphoras of the Church of the East:
        //   Nestorius:  Epiphany (Jan 19 Greg), Palm Sunday, Maundy Thursday,
        //               Easter (d'Qyamta), Pentecost (Shlihe Sunday)
        //   Theodore:   Feast days of Apostles, Martyrs, and Doctors;
        //               weekday Masses during Sauma
        //   Addai-Mari: All other occasions (the ordinary anaphora)
        const palmSunday    = addDays(easter, -7);
        const maundyThurs   = addDays(easter, -3);
        const epiphanyGreg  = new Date(d.getFullYear(), 0, 19); // Jan 19

        let anaphora, anaphoraLabel;
        const isNestoriusFeast = (
            (d.getMonth() === 0 && d.getDate() === 19) || // Epiphany
            d.getTime() === palmSunday.getTime()         ||
            d.getTime() === maundyThurs.getTime()        ||
            d.getTime() === easter.getTime()             ||
            d.getTime() === pentecost.getTime()
        );
        const isTheodoreFeast = (
            (d >= saumaStart && d < easter && d.getDay() !== 0) // Sauma weekdays
        );

        if (isNestoriusFeast) {
            anaphora      = 'nestorius';
            anaphoraLabel = 'Anaphora of Mar Nestorius';
        } else if (isTheodoreFeast) {
            anaphora      = 'theodore';
            anaphoraLabel = 'Anaphora of Theodore of Mopsuestia';
        } else {
            anaphora      = 'addai-mari';
            anaphoraLabel = 'Anaphora of Addai and Mari';
        }

        return {
            season:       currentSeason.name,
            seasonLabel:  meta.label,
            seasonColor:  meta.color,
            weekInSeason,
            weekLabel,
            cycle,
            cycleLabel,
            easter,
            subaraStart,
            ninevehFast,
            fastCharacter,
            fastLabel,
            anaphora,
            anaphoraLabel,
            palmSunday,
            epiphanyGreg,
        };
    }

    // ── Self-test ─────────────────────────────────────────────────────────────

    (function selfTest() {
        // Test cases: [gregorianDate, expectedSeason, expectedCycle, note]
        //
        // Easter reference dates (Gregorian):
        //   2024: May 5   2025: Apr 20   2026: Apr 12   2027: May 2
        //
        // Subara start dates:
        //   2024 year: Dec 1 2024   2025 year: Nov 30 2025
        //   2026 year: Nov 29 2026  2027 year: Nov 28 2027
        // Cycle values verified by counting weeks since Subara anchor.
        // Qdham = even weeks-since-Subara (0, 2, 4…); Wathar = odd (1, 3, 5…).
        // e.g. Subara 2024 starts Dec 1: wk0=Qdham, wk1=Wathar, wk7=Wathar, etc.
        const cases = [
            // ── d'Qyamta (Easter) should be Qyamta week 1 ──
            // 2025: Subara Dec 1 2024; Easter Apr 20 2025 = week 20 from Subara = Qdham
            { date: new Date(2025,  3, 20), season: 'qyamta',      cycle: 'qdham',  note: "2025 Easter Sunday (wk20 from Subara = Qdham)" },
            // 2026: Subara Nov 30 2025; Easter Apr 12 2026 = week 19 from Subara = Wathar
            { date: new Date(2026,  3, 12), season: 'qyamta',      cycle: 'wathar', note: "2026 Easter Sunday (wk19 from Subara = Wathar)" },

            // ── Sauma: 7 weeks before Easter ──
            // 2025 Sauma start Mar 2 = week 13 from Subara Dec 1 2024 = Wathar (odd)
            { date: new Date(2025,  2,  2), season: 'sauma',       cycle: 'wathar', note: "2025 Sauma start (wk13 = Wathar)" },
            // Holy Week Apr 13 2025 = week 19 from Subara = Wathar
            { date: new Date(2025,  3, 13), season: 'sauma',       cycle: 'wathar', note: "2025 Holy Week (wk19 = Wathar)" },

            // ── Shlihe: Pentecost ──
            // 2025 Pentecost Jun 8 = week 27 from Subara = Wathar (odd)
            { date: new Date(2025,  5,  8), season: 'shlihe',      cycle: 'wathar', note: "2025 Pentecost (wk27 = Wathar)" },

            // ── Qayta ──
            // 2025 Qayta Jul 27 = week 34 from Subara = Qdham (even)
            { date: new Date(2025,  6, 27), season: 'qayta',       cycle: 'qdham',  note: "2025 Qayta start (wk34 = Qdham)" },

            // ── Subara parity pattern (anchor = week 0 = Qdham) ──
            { date: new Date(2024, 11,  1), season: 'subara',      cycle: 'qdham',  note: "Subara Dec 1 2024 wk0 = Qdham" },
            { date: new Date(2024, 11,  8), season: 'subara',      cycle: 'wathar', note: "Subara Dec 8 2024 wk1 = Wathar" },
            { date: new Date(2024, 11, 15), season: 'subara',      cycle: 'qdham',  note: "Subara Dec 15 2024 wk2 = Qdham" },
            { date: new Date(2024, 11, 22), season: 'subara',      cycle: 'wathar', note: "Subara Dec 22 2024 wk3 = Wathar" },

            // ── Seam test: 52-week year (2024/25) ──
            // Week 51 (last week) from Subara Dec 1 2024 = Nov 23 2025 = Wathar (odd)
            // Week  0 of new year Subara Nov 30 2025 = Qdham (anchor reset)
            { date: new Date(2025, 10, 23), season: 'qudash-idta', cycle: 'wathar', note: "Wk51 before Subara 2025 = Wathar (seam test)" },
            { date: new Date(2025, 10, 30), season: 'subara',      cycle: 'qdham',  note: "Subara Nov 30 2025 = wk0 = Qdham (seam test)" },

            // ── Seam test: 53-week year (2027/28) ──
            // Without anchor-reset, ISO-week method would give wrong parity here.
            { date: new Date(2027, 10, 28), season: 'subara',      cycle: 'qdham',  note: "Subara Nov 28 2027 = wk0 = Qdham (53-wk year seam)" },

            // ── Denkha: week 7 from Subara Dec 1 2024 = Wathar ──
            { date: new Date(2025,  0, 19), season: 'denkha',      cycle: 'wathar', note: "2025 Denkha start Jan 19 (wk7 = Wathar)" },

            // ── Qudash 'Idta: week 44 from Subara Nov 30 2025 = Qdham ──
            { date: new Date(2025,  9,  5), season: 'qudash-idta', cycle: 'qdham',  note: "2025 Qudash 'Idta start Oct 5 (wk44 = Qdham)" },
        ];

        let pass = 0, fail = 0;

        cases.forEach(({ date, season: expSeason, cycle: expCycle, note }) => {
            const result = getSeason(date);
            const seasonOk = result.season === expSeason;
            const cycleOk  = result.cycle  === expCycle;

            if (seasonOk && cycleOk) {
                pass++;
            } else {
                fail++;
                const seasonStr = seasonOk ? '' : ` season: expected '${expSeason}' got '${result.season}'`;
                const cycleStr  = cycleOk  ? '' : ` cycle: expected '${expCycle}' got '${result.cycle}'`;
                console.warn(`[EastSyriacCalendar] FAIL [${note}] ${date.toDateString()}:${seasonStr}${cycleStr}`);
            }
        });

        // Easter calculation spot-checks (Gregorian output)
        const easterChecks = [
            { year: 2024, expected: '2024-05-05', note: "2024 Easter" },
            { year: 2025, expected: '2025-04-20', note: "2025 Easter" },
            { year: 2026, expected: '2026-04-12', note: "2026 Easter" },
            { year: 2027, expected: '2027-05-02', note: "2027 Easter" },
            { year: 2028, expected: '2028-04-16', note: "2028 Easter" },
        ];

        easterChecks.forEach(({ year, expected, note }) => {
            const e   = getEaster(year);
            const got = e.toISOString().slice(0, 10);
            if (got === expected) {
                pass++;
            } else {
                fail++;
                console.warn(`[EastSyriacCalendar] FAIL [${note}]: expected ${expected}, got ${got}`);
            }
        });

        // Gregorian-mode Easter spot-checks -- added 2026-08-30 alongside the
        // easterMode parameter. Confirms getEaster(year, 'gregorian') returns
        // real Western/Gregorian Easter, distinct from the Julian default
        // above, and that omitting the mode still defaults to Julian
        // (backward compatibility with every already-shipped call site).
        const gregorianEasterChecks = [
            { year: 2024, expected: '2024-03-31', note: "2024 Gregorian Easter" },
            { year: 2025, expected: '2025-04-20', note: "2025 Gregorian Easter (coincides with Julian this year)" },
            { year: 2026, expected: '2026-04-05', note: "2026 Gregorian Easter" },
            { year: 2027, expected: '2027-03-28', note: "2027 Gregorian Easter" },
            { year: 2028, expected: '2028-04-16', note: "2028 Gregorian Easter (coincides with Julian this year)" },
        ];
        gregorianEasterChecks.forEach(({ year, expected, note }) => {
            const e   = getEaster(year, 'gregorian');
            const got = e.toISOString().slice(0, 10);
            if (got === expected) {
                pass++;
            } else {
                fail++;
                console.warn(`[EastSyriacCalendar] FAIL [${note}]: expected ${expected}, got ${got}`);
            }
        });
        // Default (no mode argument) must still equal explicit 'julian'.
        [2024, 2025, 2026, 2027, 2028].forEach(year => {
            const withDefault = getEaster(year).getTime();
            const withJulian  = getEaster(year, 'julian').getTime();
            if (withDefault === withJulian) {
                pass++;
            } else {
                fail++;
                console.warn(`[EastSyriacCalendar] FAIL [${year} default-mode regression]: getEaster(year) no longer matches getEaster(year, 'julian')`);
            }
        });

        if (fail === 0) {
            console.log(`[EastSyriacCalendar] All ${pass} self-tests passed.`);
        } else {
            console.error(`[EastSyriacCalendar] ${fail} self-test(s) FAILED — see warnings above.`);
        }
    })();

    // ── COE-IIA: Fixed-feast / corporate-commemoration layer ─────────────────
    //
    // Scope: Layer 2 of the three-layer COE model (season engine / fixed feasts
    // & corporate commemorations / individual saints). This layer is intentionally
    // small and explicit. It derives observances deterministically from the
    // existing season engine. No saint identities are involved here.
    //
    // Returned observance objects are typed as 'feast' or 'commemoration', never
    // 'saint', to preserve the COE framing distinction.

    /**
     * Return any fixed or corporate commemorations applicable to the given date,
     * derived from the season engine data already computed by getSeason().
     *
     * @param  {Date}   date        — the date to check (midnight-normalised is fine)
     * @param  {object} seasonData  — result of getSeason(date)
     * @return {Array<{
     *   type:  'feast' | 'commemoration',
     *   key:   string,
     *   label: string,
     *   note:  string,
     * }>}
     */
    function getFixedCommemorationsForDate(date, seasonData, options) {
        const d          = toMidnight(date);
        const season     = seasonData.season;
        const isFriday   = d.getDay() === 5;
        const isLenten   = (season === 'sauma');
        const results    = [];

        // ── Friday Commemoration of the Martyrs (Sawma Rabba / Great Fast) ────
        // During the Great Fast (Sauma), every Friday is a corporate
        // commemoration of the Martyrs. This is a structural liturgical class,
        // not a named-saint slot.
        if (isFriday && isLenten) {
            results.push({
                type:  'commemoration',
                key:   'COE_FRIDAY_MARTYRS_SAUMA',
                label: 'Friday Commemoration of the Martyrs',
                note:  'Corporate martyrial commemoration during Sawma Rabba. No individual saint assigned.',
            });
        }

        // ── Commemoration of the Faithful Departed ────────────────────────────
        // The Church of the East observes a Commemoration of All the Faithful
        // Departed on the Friday immediately before Sauma begins (i.e. the Friday
        // of the last full week of Denkha). Sauma always starts on a Sunday, so
        // the Friday two days prior is saumaStart − 2.
        // This is a fixed structural observance anchored to the season boundary;
        // it takes priority over the generic Great Fast Friday label on that date.
        const { saumaStart } = getLiturgicalYear(d, options);
        const commemorationOfDead = addDays(saumaStart, -2);
        if (d.getTime() === commemorationOfDead.getTime()) {
            results.unshift({
                type:  'commemoration',
                key:   'COE_COMMEMORATION_OF_DEAD',
                label: 'Commemoration of the Faithful Departed',
                note:  'Friday before Sauma. General Commemoration of the Dead in the East Syriac tradition.',
            });
        }

        // ── Fixed Feasts of our Lord ────────────────────────────────────────
        // A new tracking layer, added 2026-08-21 at Josh's direction, after
        // noticing this engine had no fixed-date Feast-of-our-Lord tracking
        // at all (the pre-existing fastCharacter === 'feast' only marks the
        // whole Qyamta season as fast-free, not any specific Feast day).
        //
        // Every date below follows the SAME convention already established
        // and tested in this engine for Denkha/Epiphany (Julian Jan 6 = Greg
        // Jan 19) and Holy Cross Day (Julian Sep 14 = Greg Sep 27): a fixed
        // +13-day Julian-to-Gregorian offset, for internal consistency
        // across the whole calendar engine -- not because every ACOE parish
        // observes these dates this way today. Real practice varies (most
        // Assyrians now keep Nativity on plain Gregorian Dec 25; a smaller
        // number keep the Julian-offset Jan 7 -- confirmed by search this
        // session, not assumed), so every label below states BOTH the
        // traditional Julian calendar date and the actual Gregorian date
        // this engine computes, rather than showing only one and leaving
        // the other to be inferred.
        //
        // This list is NOT claimed to be exhaustive -- only feasts verified
        // against a real source this session are included. Movable feasts
        // (Resurrection, Ascension, Pentecost) need no Julian/Gregorian
        // translation at all, since they are computed directly from Easter
        // itself, which this engine already computes on the Gregorian
        // calendar throughout.
        const { crossDay } = getLiturgicalYear(d, options);
        const { easter, epiphanyGreg } = seasonData;
        const ascensionDay  = addDays(easter, 39);  // Thursday, 40th day counting Easter as day 1
        const pentecostDay  = addDays(easter, 49);
        const nativityGreg      = new Date(d.getFullYear(), 0, 7);   // Julian Dec 25 + 13 = Greg Jan 7
        const transfigurationGreg = new Date(d.getFullYear(), 7, 19); // Julian Aug 6 + 13 = Greg Aug 19

        const fixedFeasts = [
            { date: nativityGreg,        key: 'COE_FEAST_NATIVITY',       label: 'Nativity of our Lord',
              note: "Julian Dec. 25 = Gregorian Jan. 7, per this engine's established Julian+13 convention. Many parishes today keep Gregorian Dec. 25 directly instead -- see project notes." },
            { date: epiphanyGreg,        key: 'COE_FEAST_EPIPHANY',       label: 'Epiphany (Denkha)',
              note: 'Julian Jan. 6 = Gregorian Jan. 19. Marks the fixed Feast day itself, distinct from the Denkha season, which begins the following Sunday.' },
            { date: easter,              key: 'COE_FEAST_RESURRECTION',   label: 'Resurrection of our Lord (Qyamta)',
              note: 'Movable; computed directly from the Easter date already used throughout this engine. No Julian/Gregorian translation applies.' },
            { date: ascensionDay,        key: 'COE_FEAST_ASCENSION',      label: 'Ascension of our Lord',
              note: 'Movable: Thursday of the sixth week after Easter (Easter + 39 days). No Julian/Gregorian translation applies.' },
            { date: pentecostDay,        key: 'COE_FEAST_PENTECOST',      label: 'Pentecost',
              note: 'Movable: Easter + 49 days, already computed elsewhere in this engine as the start of Shlihe season. No Julian/Gregorian translation applies.' },
            { date: transfigurationGreg, key: 'COE_FEAST_TRANSFIGURATION',label: 'Transfiguration of our Lord',
              note: 'Julian Aug. 6 = Gregorian Aug. 19, per this engine\u2019s established Julian+13 convention.' },
            { date: crossDay,            key: 'COE_FEAST_HOLY_CROSS',     label: 'Holy Cross Day',
              note: 'Julian Sep. 14 = Gregorian Sep. 27, already computed elsewhere in this engine as the boundary marking the start of Muse season.' },
        ];
        for (const feast of fixedFeasts) {
            if (d.getTime() === toMidnight(feast.date).getTime()) {
                results.push({ type: 'feast', key: feast.key, label: feast.label, note: feast.note });
            }
        }

        return results;
    }

    // ── COE-IIA: getDayClass ──────────────────────────────────────────────────

    /**
     * Return a structured day-classification object for the given date, built
     * on top of the existing season engine. This is the primary entry point for
     * renderEastSyriac() to determine commemoration rendering before any Layer 3
     * saint logic is consulted.
     *
     * All fields are present and non-null; boolean flags use false rather than
     * undefined when not applicable. commemorations is always an array (may be
     * empty).
     *
     * @param  {Date} gregorianDate
     * @return {{
     *   // ── Date character ─────────────────────────────────────────────────
     *   isFriday:          boolean,
     *   isSunday:          boolean,
     *   isLenten:          boolean,   — true when season === 'sauma'
     *   isNinevehFast:     boolean,
     *   // ── Day class ──────────────────────────────────────────────────────
     *   dayClass:          string,    — 'feast' | 'commemoration' | 'fast' | 'ordinary'
     *   // ── Season passthrough (from getSeason) ────────────────────────────
     *   season:            string,
     *   seasonLabel:       string,
     *   seasonColor:       string,
     *   weekLabel:         string,
     *   weekInSeason:      number,
     *   cycle:             string,
     *   cycleLabel:        string,
     *   fastCharacter:     string,
     *   fastLabel:         string,
     *   anaphora:          string,
     *   anaphoraLabel:     string,
     *   easter:            Date,
     *   subaraStart:       Date,
     *   ninevehFast:       { start: Date, end: Date },
     *   // ── Layer 2 commemorations ─────────────────────────────────────────
     *   commemorations:    Array<{ type, key, label, note }>,
     *   // ── Primary commemoration shorthand (first in array, or null) ──────
     *   commemorationType: string | null,
     *   commemorationName: string | null,
     * }}
     */
    function getDayClass(gregorianDate, options) {
        const d          = toMidnight(gregorianDate);
        const seasonData = getSeason(d, options);
        const isFriday   = d.getDay() === 5;
        const isSunday   = d.getDay() === 0;
        const isLenten   = seasonData.season === 'sauma';
        const isNineveh  = seasonData.fastCharacter === 'nineveh-fast';

        const commemorations = getFixedCommemorationsForDate(d, seasonData, options);

        // dayClass: if any feast-typed commemoration exists, elevate to 'feast';
        // if any commemoration-typed exists, 'commemoration'; otherwise fall back
        // to the fast character.
        let dayClass;
        if (commemorations.some(c => c.type === 'feast')) {
            dayClass = 'feast';
        } else if (commemorations.length > 0) {
            dayClass = 'commemoration';
        } else if (seasonData.fastCharacter === 'great-fast' || seasonData.fastCharacter === 'nineveh-fast' || seasonData.fastCharacter === 'fast') {
            dayClass = 'fast';
        } else if (seasonData.fastCharacter === 'feast') {
            dayClass = 'feast';
        } else {
            dayClass = 'ordinary';
        }

        const primary = commemorations[0] || null;

        return {
            isFriday,
            isSunday,
            isLenten,
            isPalmSunday:      d.getTime() === seasonData.palmSunday.getTime(),
            isNinevehFast:     isNineveh,
            dayClass,

            // Season passthrough
            season:            seasonData.season,
            seasonLabel:       seasonData.seasonLabel,
            seasonColor:       seasonData.seasonColor,
            weekLabel:         seasonData.weekLabel,
            weekInSeason:      seasonData.weekInSeason,
            cycle:             seasonData.cycle,
            cycleLabel:        seasonData.cycleLabel,
            fastCharacter:     seasonData.fastCharacter,
            fastLabel:         seasonData.fastLabel,
            anaphora:          seasonData.anaphora,
            anaphoraLabel:     seasonData.anaphoraLabel,
            easter:            seasonData.easter,
            subaraStart:       seasonData.subaraStart,
            ninevehFast:       seasonData.ninevehFast,
            palmSunday:        seasonData.palmSunday,

            // Layer 2
            commemorations,
            commemorationType: primary ? primary.type  : null,
            commemorationName: primary ? primary.label : null,
        };
    }

    // ── COE-IIB: Pre-Fast Sunday folding rule (Kalendar appendix, p.270 footnote) ──

    /**
     * DATA-LAYER ONLY, NOT WIRED INTO ANY RENDER PATH. Flagged 2026-08-27, built
     * 2026-08-30 as structured groundwork for a future lectionary-display feature.
     * No rendered prayer or office text depends on this function; nothing calls it
     * from renderEastSyriac() or anywhere else in js/office-ui.js.
     *
     * Maclean's Kalendar appendix (pp.266-270) lists eight named Fridays of
     * commemoration across the Denkha (Epiphany) season, one per week, followed by
     * "Sunday before [lit. entering] the Great Fast." A footnote attached to that
     * Sunday (p.270) states the compression rule verbatim:
     *
     *   "This Sunday is always fifty days before Easter. If there are eight
     *   Sundays after Epiphany, the above order is followed; if seven, the
     *   Memorial of the Forty Martyrs is dropped; if six, the Evangelists and
     *   St. Peter and St. Paul are joined together; if five, also the Greek and
     *   Syrian Doctors; if four, also St. Stephen and Mar Awa; the service being
     *   partly of the one and partly of the other. The Sundays are joined in the
     *   same way."
     *
     * This engine's own Denkha season is already documented and verified (2024-
     * 2028) to run 4-8 weeks, matching Maclean's stated range exactly -- because
     * Denkha begins the Sunday on/after Jan 19 and runs until the Sunday before
     * the Fast (saumaStart), the number of weeks in Denkha for a given liturgical
     * year IS the "number of Sundays after Epiphany" the footnote counts. No new
     * date arithmetic was needed to find N; it falls straight out of the season
     * boundaries already computed in getLiturgicalYear().
     *
     * @param  {Date} gregorianDate — any date; only its liturgical year matters
     * @return {{
     *   sundaysAfterEpiphany: number,       — N, 4-8 (Denkha's week count)
     *   fridays: Array<{ weekInSeason: number, label: string, note?: string }>,
     *   sundayBeforeTheFast: { date: Date, label: string },
     * }}
     */
    function getPreFastSundayFoldSchedule(gregorianDate, options) {
        const d = toMidnight(gregorianDate);
        const { seasons, saumaStart } = getLiturgicalYear(d, options);
        const denkha = seasons.find(s => s.name === 'denkha');
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const n = Math.round((toMidnight(saumaStart) - toMidnight(denkha.start)) / msPerWeek);

        // The eight base commemorations, in Maclean's own printed order (p.266-269).
        // Each carries the week number (1-8) of the Sunday whose Friday it falls on,
        // used only to build the fold below -- not a claim about which Gregorian
        // Sunday it lands on in a given year, since that's exactly what folds away.
        const base = [
            { week: 1, label: 'SS. Peter and Paul (Patrus-Polus)' },
            { week: 2, label: 'The Four Evangelists', note: 'Also, in some sources, the memorial of the 150 Bishops who excommunicated Macedonius.' },
            { week: 3, label: 'St. Stephen (Mar Istaphanus)' },
            { week: 4, label: 'The Greek Doctors', note: 'Especially Diodorus of Tarsus, Nestorius, and Theodore the Interpreter.' },
            { week: 5, label: 'The Syrian Doctors', note: 'Mar Ephraim and Mar Narsai. Also, Memorial of Mar Saurishu of Beith Garmai. This Friday closes the week of the Rogation of the Ninevites (Mon-Thu of the same week).' },
            { week: 6, label: "Mar Awa, Catholicos, or \u2018One Person\u2019 (the Patron Saint)" },
            { week: 7, label: 'The Forty Martyrs of Sebaste, who were frozen to death' },
            { week: 8, label: 'Friday of the Departed', note: 'The Sunday itself also carries, in some sources, the Memorial of all the Eastern (Syrian) Catholici.' },
        ];

        let schedule;
        if (n >= 8) {
            schedule = base.slice();
        } else if (n === 7) {
            schedule = base.filter(c => c.week !== 7); // Forty Martyrs dropped entirely
        } else if (n === 6) {
            const withoutMartyrs = base.filter(c => c.week !== 7);
            schedule = mergeByWeek(withoutMartyrs, [1, 2]); // Peter&Paul + Evangelists joined
        } else if (n === 5) {
            const withoutMartyrs = base.filter(c => c.week !== 7);
            let merged = mergeByWeek(withoutMartyrs, [1, 2]);
            merged = mergeByWeek(merged, [4, 5]); // also Greek + Syrian Doctors joined
            schedule = merged;
        } else if (n === 4) {
            const withoutMartyrs = base.filter(c => c.week !== 7);
            let merged = mergeByWeek(withoutMartyrs, [1, 2]);
            merged = mergeByWeek(merged, [4, 5]);
            merged = mergeByWeek(merged, [3, 6]); // also St. Stephen + Mar Awa joined
            schedule = merged;
        } else {
            // Outside Maclean's documented 4-8 range and this engine's own verified
            // Denkha length range. Disclosed rather than guessed at: return the
            // unfolded base list with a flag, since no rule covers this case.
            schedule = base.slice();
        }

        // Helper: merge two week-numbered entries in `list` into a single slot,
        // per the footnote's "joined together... partly of the one and partly of
        // the other" instruction. Assumes both weeks are present in `list`.
        function mergeByWeek(list, weeks) {
            const [wa, wb] = weeks;
            const a = list.find(c => c.week === wa);
            const b = list.find(c => c.week === wb);
            if (!a || !b) return list; // already merged/absent from a prior fold step
            const combined = {
                week: wa,
                label: `${a.label} (joined with ${b.label})`,
                note: 'Joined per Maclean\u2019s own fold rule (p.270 footnote): "the service being partly of the one and partly of the other." This engine does not attempt to split which parts of the office belong to which commemoration -- that split is not stated in the source.',
            };
            return list.filter(c => c.week !== wa && c.week !== wb).concat([combined])
                       .sort((x, y) => x.week - y.week);
        }

        return {
            sundaysAfterEpiphany: n,
            fridays: schedule.map(c => ({ weekInSeason: c.week, label: c.label, note: c.note || null })),
            sundayBeforeTheFast: {
                date: toMidnight(saumaStart),
                label: 'Sunday before (entering) the Great Fast',
            },
        };
    }

    // ── Public API ────────────────────────────────────────────────────────────

    return {
        getSeason,
        getEaster,
        computeGregorianEaster,
        getLiturgicalYear,
        getDayClass,
        getFixedCommemorationsForDate,
        getPreFastSundayFoldSchedule,
        SEASON_META,
    };

})();

window.EastSyriacCalendar = EastSyriacCalendar;