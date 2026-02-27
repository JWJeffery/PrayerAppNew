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
     * Return the Gregorian JS Date of d'Qyamta (East Syriac Easter)
     * for a given Gregorian year.
     *
     * @param  {number} year  — Gregorian year
     * @return {Date}
     */
    function getEaster(year) {
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
    function getLiturgicalYear(date) {
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
        const easter     = getEaster(easterYear);

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

        return { subaraStart, easter, nextSubara, seasons };
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
    function getSeason(gregorianDate) {
        const d = toMidnight(gregorianDate);
        const { subaraStart, easter, seasons } = getLiturgicalYear(d);

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

        if (fail === 0) {
            console.log(`[EastSyriacCalendar] All ${pass} self-tests passed.`);
        } else {
            console.error(`[EastSyriacCalendar] ${fail} self-test(s) FAILED — see warnings above.`);
        }
    })();

    // ── Public API ────────────────────────────────────────────────────────────

    return {
        getSeason,
        getEaster,
        getLiturgicalYear,
        SEASON_META,
    };

})();

window.EastSyriacCalendar = EastSyriacCalendar;