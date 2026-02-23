/**
 * CALENDAR-ETHIOPIAN.JS
 * Ethiopian (Ge'ez / Alexandrian) Calendar Engine for The Universal Office.
 *
 * Provides:
 *   EthiopianCalendar.getEthiopianDate(gregorianDate)
 *     → { day: number, month: string, monthIndex: number, year: number }
 *   EthiopianCalendar.formatEthiopianDate(gregorianDate)
 *     → "15 Yekatit 2018"
 *   EthiopianCalendar.getCopticDate(gregorianDate)
 *     → { day, month, monthIndex, year }  (same algorithm, Coptic names & era)
 *   EthiopianCalendar.isEthiopianLeapYear(ethiopianYear)
 *     → boolean
 *
 * Method: Julian Day Number (JDN) approach.
 *   Converts the Gregorian date to a JDN, then applies the Alexandrian
 *   algorithm. This handles Pagume correctly (5 days normally, 6 in a
 *   leap year) and is valid across all historical and future dates.
 *
 * Epoch:
 *   1 Meskerem 1 EC = JDN 1724221 = 29 August 8 AD (Julian)
 *   The Ethiopian era (Amete Mihret) is approx 7-8 years behind Gregorian.
 *
 * Leap year rule:
 *   Ethiopian year is leap if (year % 4 === 3).
 *   Within the 4-year JDN cycle (year4+1 thru year4+4), the THIRD year is
 *   the leap year:
 *     year4+1: 365 days  (n: 0..364)
 *     year4+2: 365 days  (n: 365..729)
 *     year4+3: 366 days  <- LEAP  (n: 730..1095)
 *     year4+4: 365 days  (n: 1096..1460)
 *
 * Verified reference points:
 *   2026-02-22 -> 15 Yekatit 2018
 *   2025-09-11 -> 1 Meskerem 2018  (Ethiopian New Year)
 *   2025-09-10 -> 5 Pagume 2017    (last day, non-leap year)
 *   2024-09-11 -> 1 Meskerem 2017
 *   2022-09-11 -> 1 Meskerem 2015  (leap year start)
 *   2023-09-11 -> 6 Pagume 2015    (last day of leap year)
 *   2023-09-12 -> 1 Meskerem 2016
 *   2026-09-11 -> 1 Meskerem 2019  (next leap year)
 *
 * Architecture note: Isolated utility for reuse by the Coptic calendar
 * (same Alexandrian base, different month names and 276-year era offset).
 *
 * Phase 7.4 - Ethiopian liturgical calendar integration.
 */

const EthiopianCalendar = (() => {

    // Ethiopian (Ge'ez) month names
    const MONTH_NAMES = [
        'Meskerem',  // 1  (approx Sep 11/12)
        'Tikimt',    // 2  (approx Oct 11/12)
        'Hidar',     // 3  (approx Nov 10/11)
        'Tahsas',    // 4  (approx Dec 10/11)
        'Tir',       // 5  (approx Jan  9/10)
        'Yekatit',   // 6  (approx Feb  8/ 9)
        'Megabit',   // 7  (approx Mar 10/11)
        'Miyazya',   // 8  (approx Apr  9/10)
        'Ginbot',    // 9  (approx May  9/10)
        'Sene',      // 10 (approx Jun  8/ 9)
        'Hamle',     // 11 (approx Jul  8/ 9)
        'Nehase',    // 12 (approx Aug  7/ 8)
        'Pagume',    // 13 (approx Sep  6-11, 5 or 6 days)
    ];

    // Coptic month names (same calendar system, Coptic tradition)
    const COPTIC_MONTH_NAMES = [
        'Thout',          'Paopi',    'Hathor',    'Koiak',
        'Tobi',           'Meshir',   'Paremhat',  'Parmouti',
        'Pashons',        'Paoni',    'Epip',      'Mesori',
        'Pi Kogi Enavot',
    ];

    /**
     * Convert a Gregorian calendar date to a Julian Day Number.
     * Uses the proleptic Gregorian calendar; valid for all dates.
     */
    function gregorianToJDN(year, month, day) {
        const a = Math.floor((14 - month) / 12);
        const y = year + 4800 - a;
        const m = month + 12 * a - 3;
        return day
            + Math.floor((153 * m + 2) / 5)
            + 365 * y
            + Math.floor(y / 4)
            - Math.floor(y / 100)
            + Math.floor(y / 400)
            - 32045;
    }

    /**
     * Convert a Julian Day Number to an Ethiopian date.
     *
     * The 4-year cycle (1461 days) layout:
     *   Positions 0-364:    year+1, non-leap (365 days)
     *   Positions 365-729:  year+2, non-leap (365 days)
     *   Positions 730-1095: year+3, LEAP     (366 days, Pagume = 6 days)
     *   Positions 1096-1460:year+4, non-leap (365 days)
     *
     * Each year: months 1-12 have 30 days each (360 days total),
     * then Pagume adds 5 days (or 6 in leap years).
     */
    function jdnToEthiopian(jdn) {
        const EPOCH_JDN = 1724221; // JDN of 1 Meskerem 1 EC

        const r     = jdn - EPOCH_JDN;
        const n     = r % 1461;                    // position in 4-year cycle
        const year4 = Math.floor(r / 1461) * 4;   // base year (0-indexed era years)

        let year, dayOfYear;
        if (n <= 364) {
            year      = year4 + 1;
            dayOfYear = n;
        } else if (n <= 729) {
            year      = year4 + 2;
            dayOfYear = n - 365;
        } else if (n <= 1095) {
            year      = year4 + 3;  // LEAP YEAR (year % 4 === 3)
            dayOfYear = n - 730;
        } else {
            year      = year4 + 4;
            dayOfYear = n - 1096;
        }

        // dayOfYear 0..359 = months 1-12 (30 days each)
        // dayOfYear 360+   = Pagume
        let monthIndex, day;
        if (dayOfYear < 360) {
            monthIndex = Math.floor(dayOfYear / 30);
            day        = (dayOfYear % 30) + 1;
        } else {
            monthIndex = 12;            // Pagume
            day        = dayOfYear - 359;
        }

        return { day, monthIndex, year };
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Convert a Gregorian JS Date to an Ethiopian (Amete Mihret) date.
     *
     * @param  {Date} gregorianDate
     * @return {{ day: number, month: string, monthIndex: number, year: number }}
     *   day        - Day of the Ethiopian month (1-30; 1-5 or 1-6 for Pagume)
     *   month      - Ethiopian month name (e.g. "Yekatit")
     *   monthIndex - 0-based index (0=Meskerem, 12=Pagume)
     *   year       - Ethiopian year in the Amete Mihret era
     */
    function getEthiopianDate(gregorianDate) {
        const jdn = gregorianToJDN(
            gregorianDate.getFullYear(),
            gregorianDate.getMonth() + 1,
            gregorianDate.getDate()
        );
        const eth = jdnToEthiopian(jdn);
        return {
            day:        eth.day,
            month:      MONTH_NAMES[eth.monthIndex],
            monthIndex: eth.monthIndex,
            year:       eth.year,
        };
    }

    /**
     * Convert a Gregorian JS Date to a Coptic (Anno Martyrum) date.
     * Same Alexandrian algorithm; Coptic month names and year era (EC - 276).
     *
     * @param  {Date} gregorianDate
     * @return {{ day: number, month: string, monthIndex: number, year: number }}
     */
    function getCopticDate(gregorianDate) {
        const jdn = gregorianToJDN(
            gregorianDate.getFullYear(),
            gregorianDate.getMonth() + 1,
            gregorianDate.getDate()
        );
        const eth = jdnToEthiopian(jdn);
        return {
            day:        eth.day,
            month:      COPTIC_MONTH_NAMES[eth.monthIndex],
            monthIndex: eth.monthIndex,
            year:       eth.year - 276,
        };
    }

    /**
     * Format an Ethiopian date as a display string.
     * @param  {Date}   gregorianDate
     * @return {string} e.g. "15 Yekatit 2018"
     */
    function formatEthiopianDate(gregorianDate) {
        const eth = getEthiopianDate(gregorianDate);
        return `${eth.day} ${eth.month} ${eth.year}`;
    }

    /**
     * Test whether a given Ethiopian year is a leap year.
     * Leap years have Pagume with 6 days (instead of 5).
     * @param  {number}  ethiopianYear
     * @return {boolean}
     */
    function isEthiopianLeapYear(ethiopianYear) {
        return (ethiopianYear % 4) === 3;
    }

    // Self-test on load
    (function selfTest() {
        const cases = [
            [2026,  2, 22,  15, 5, 2018],
            [2025,  9, 11,   1, 0, 2018],
            [2025,  9, 10,   5,12, 2017],
            [2024,  9, 11,   1, 0, 2017],
            [2024,  1,  1,  22, 3, 2016],
            [2022,  9, 11,   1, 0, 2015],
            [2023,  9, 11,   6,12, 2015],
            [2023,  9, 12,   1, 0, 2016],
            [2026,  9, 11,   1, 0, 2019],
        ];
        let pass = 0, fail = 0;
        cases.forEach(([gy, gm, gd, ed, emi, ey]) => {
            const r = getEthiopianDate(new Date(gy, gm - 1, gd));
            if (r.day === ed && r.monthIndex === emi && r.year === ey) {
                pass++;
            } else {
                fail++;
                console.warn(`[EthiopianCalendar] FAIL ${gy}-${gm}-${gd}: expected ${ed} ${MONTH_NAMES[emi]} ${ey}, got ${r.day} ${r.month} ${r.year}`);
            }
        });
        if (fail === 0) {
            console.log(`[EthiopianCalendar] All ${pass} self-tests passed.`);
        } else {
            console.error(`[EthiopianCalendar] ${fail} self-test(s) FAILED.`);
        }
    })();

    return {
        getEthiopianDate,
        getCopticDate,
        formatEthiopianDate,
        isEthiopianLeapYear,
        MONTH_NAMES,
        COPTIC_MONTH_NAMES,
    };

})();