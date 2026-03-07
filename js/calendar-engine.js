/**
 * CALENDAR ENGINE MODULE - Audited Class Version
 */
class CalendarEngine {
    static currentDate = new Date();
    static seasonalCache = {};
    static bcpPropers = null;

    // ── Algorithmic BCP Season Calculator ────────────────────────────────────
    //
    // Computes Western Gregorian Easter for any year using the Anonymous
    // Gregorian algorithm (O'Beirne / Meeus), then derives all season boundaries
    // from that anchor plus Advent Sunday. Valid for any year indefinitely.
    //
    // SEASON_RANGES is retained as a computed getter for backward compatibility
    // with any code that references it directly, but is now generated on demand
    // rather than hardcoded.

    static _seasonCache = {};   // keyed by calendar year, stores generated ranges

    static _getEaster(year) {
        // Anonymous Gregorian algorithm
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
        const day   = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(year, month - 1, day);
    }

    static _getAdventSunday(year) {
        // Advent Sunday = the Sunday on or after November 27
        // (equivalent to the Sunday nearest November 30)
        const nov27 = new Date(year, 10, 27); // month is 0-indexed
        const dow   = nov27.getDay();          // 0=Sun
        const daysUntilSunday = (7 - dow) % 7;
        return new Date(year, 10, 27 + daysUntilSunday);
    }

    static _addDays(date, n) {
        const d = new Date(date);
        d.setDate(d.getDate() + n);
        return d;
    }

    static _generateSeasonRanges(year) {
        // Generates all season ranges for the liturgical year that begins in
        // November/December of `year` and ends in late November/December of `year+1`.
        // Called once per unique year encountered; result is cached in _seasonCache.

        const adventStart   = this._getAdventSunday(year);
        const christmas     = new Date(year, 11, 25);            // Dec 25
        const epiphany      = new Date(year + 1, 0, 6);         // Jan 6
        const easter        = this._getEaster(year + 1);
        const ashWednesday  = this._addDays(easter, -46);
        const epiphanyEnd   = this._addDays(ashWednesday, -1);   // day before Ash Wednesday
        const lentEnd       = this._addDays(easter, -1);        // Holy Saturday
        const easterEnd     = this._addDays(easter, 49);        // Pentecost
        const nextAdvent    = this._getAdventSunday(year + 1);
        const nextAdventEve = this._addDays(nextAdvent, -1);

        // Ordinary Time after Pentecost is split into three files matching
        // the existing data/season/ file structure:
        //   ordinary1: day after Pentecost through July 31
        //   ordinary2: Aug 1 through Sep 30
        //   ordinary3: Oct 1 through day before next Advent Sunday
        const ordinaryStart  = this._addDays(easterEnd, 1);
        const ordinary1End   = new Date(year + 1, 6, 31);       // Jul 31
        const ordinary2Start = new Date(year + 1, 7, 1);        // Aug 1
        const ordinary2End   = new Date(year + 1, 8, 30);       // Sep 30
        const ordinary3Start = new Date(year + 1, 9, 1);        // Oct 1

        const ranges = [];

        // Advent
        ranges.push({ start: adventStart,    end: new Date(year, 11, 24),    season: "advent",    file: "advent.json",    liturgicalColor: "purple" });
        // Christmas
        ranges.push({ start: christmas,      end: new Date(year + 1, 0, 5),  season: "christmas", file: "christmas.json", liturgicalColor: "white"  });
        // Epiphany
        ranges.push({ start: epiphany,       end: epiphanyEnd,               season: "epiphany",  file: "epiphany.json",  liturgicalColor: "white"  });

        // Brief Ordinary Time between Epiphany and Ash Wednesday.
        // In very early Easter years this window can be zero or negative — skip it if so.
        const briefOrdStart = this._addDays(epiphanyEnd, 1);
        if (briefOrdStart < ashWednesday) {
            ranges.push({ start: briefOrdStart, end: this._addDays(ashWednesday, -1), season: "ordinary", file: "ordinary1.json", liturgicalColor: "green" });
        }

        // Lent
        ranges.push({ start: ashWednesday,   end: lentEnd,                   season: "lent",      file: "lent.json",      liturgicalColor: "purple" });
        // Easter
        ranges.push({ start: easter,         end: easterEnd,                 season: "easter",    file: "easter.json",    liturgicalColor: "white"  });
        // Ordinary Time (three file blocks)
        ranges.push({ start: ordinaryStart,  end: ordinary1End,              season: "ordinary",  file: "ordinary1.json", liturgicalColor: "green"  });
        ranges.push({ start: ordinary2Start, end: ordinary2End,              season: "ordinary",  file: "ordinary2.json", liturgicalColor: "green"  });
        ranges.push({ start: ordinary3Start, end: nextAdventEve,             season: "ordinary",  file: "ordinary3.json", liturgicalColor: "green"  });

        return ranges;
    }

    static _getRangesForDate(date) {
        // Returns the generated ranges for the liturgical year that contains `date`.
        // Checks the prior calendar year first because Advent begins in Nov/Dec
        // of the year before the liturgical year it opens.
        const y = date.getFullYear();
        for (const candidateYear of [y - 1, y]) {
            if (!this._seasonCache[candidateYear]) {
                this._seasonCache[candidateYear] = this._generateSeasonRanges(candidateYear);
            }
            const ranges = this._seasonCache[candidateYear];
            for (const r of ranges) {
                if (date >= r.start && date <= r.end) return ranges;
            }
        }
        // Fallback: generate for current calendar year (handles edge cases)
        if (!this._seasonCache[y]) {
            this._seasonCache[y] = this._generateSeasonRanges(y);
        }
        return this._seasonCache[y];
    }

    // Computed getter retained for backward compatibility with any code that
    // references CalendarEngine.SEASON_RANGES directly.
    static get SEASON_RANGES() {
        const y = new Date().getFullYear();
        if (!this._seasonCache[y - 1]) this._seasonCache[y - 1] = this._generateSeasonRanges(y - 1);
        if (!this._seasonCache[y])     this._seasonCache[y]     = this._generateSeasonRanges(y);
        return [...this._seasonCache[y - 1], ...this._seasonCache[y]];
    }

    static async init() {
        try {
            const res = await fetch('../data/season/bcp-propers.json');
            if (res.ok) {
                this.bcpPropers = await res.json();
                console.log('[Calendar Engine] Loaded bcp-propers.json');
            }
        } catch (err) {
            console.error('[Calendar Engine] Failed to load bcp-propers.json:', err);
        }
    }

    static getCurrentDate() { return new Date(this.currentDate); }
    static setCurrentDate(date) { this.currentDate = new Date(date); }
    static resetDate() { this.currentDate = new Date(); }
    static changeDate(days) { this.currentDate.setDate(this.currentDate.getDate() + days); }

    static formatDateISO(date) {
        return date.toISOString().split('T')[0];
    }

    static formatDateForLookup(date) {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    static getLiturgicalYear(date) {
        // BCP two-year daily office cycle. Year 2 began Advent 2025.
        // Find the Advent Sunday that governs `date`, then count how many
        // Advent cycles have elapsed since the 2025 anchor.
        // Odd count = Year 2, even count = Year 1.
        const ANCHOR_YEAR = 2025; // Advent 2025 → Year 2
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // The governing Advent is this year's Advent Sunday if date falls on or
        // after it; otherwise it is last year's Advent Sunday.
        let governingAdvent = this._getAdventSunday(d.getFullYear());
        if (d < governingAdvent) {
            governingAdvent = this._getAdventSunday(d.getFullYear() - 1);
        }

        const diff = governingAdvent.getFullYear() - ANCHOR_YEAR;

        // diff=0 → 2025 Advent → Year 2
        // diff=1 → 2026 Advent → Year 1
        // diff=2 → 2027 Advent → Year 2 ... perpetual
        return (diff % 2 === 0) ? "year2" : "year1";
    }

    /**
     * Returns season, file, liturgicalColor, AND litYear for the given date.
     * This is the single source of truth consumed by office-ui.js.
     */
    static getSeasonAndFile(targetDate) {
        const date = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

        const ranges = this._getRangesForDate(date);
        for (const range of ranges) {
            if (date >= range.start && date <= range.end) {
                return {
                    season: range.season,
                    file: range.file,
                    liturgicalColor: range.liturgicalColor || 'green',
                    litYear: this.getLiturgicalYear(date)
                };
            }
        }

        console.warn(`[Calendar Engine] No season range match for ${date.toDateString()}. Defaulting to ordinary1.json`);
        return {
            _isFallback: true,
            season: "ordinary",
            file: "ordinary1.json",
            liturgicalColor: "green",
            litYear: this.getLiturgicalYear(date)
        };
    }

    static async fetchLectionaryData(targetDate = this.currentDate) {
        const { file } = this.getSeasonAndFile(targetDate);

        if (this.seasonalCache[file]) {
            return this.findEntry(this.seasonalCache[file], targetDate, file);
        }

        try {
            const response = await fetch(`data/season/${file}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            this.seasonalCache[file] = data;
            return this.findEntry(data, targetDate, file);
        } catch (err) {
            console.error(`[Calendar Engine] Error loading ${file}:`, err);
            return { title: "Error loading data" };
        }
    }

    static getSeasonStartDate(targetDate) {
        const date = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const ranges = this._getRangesForDate(date);
        for (const range of ranges) {
            if (date >= range.start && date <= range.end) {
                // For ordinary2 and ordinary3, return the start of ordinary1 for that year
                // so that day_of_season is continuous across all three ordinary files.
                if (range.file === 'ordinary2.json' || range.file === 'ordinary3.json') {
                    const ordinary1 = ranges.find(r =>
                        r.file === 'ordinary1.json' &&
                        r.start.getFullYear() === range.start.getFullYear()
                    );
                    return ordinary1 ? ordinary1.start : range.start;
                }
                return range.start;
            }
        }
        return null;
    }

    static findEntry(data, date, fileName) {
        const iso = this.formatDateISO(date);
        const long = this.formatDateForLookup(date);

        // Priority 1: Exact ISO or long-format match
        let entry = data.find(d => d.date === iso || d.date === long);
        if (entry) {
            console.log(`[Calendar Engine] Exact match for ${iso} in ${fileName}`);
            return entry;
        }

        // Priority 2: day_of_season offset match (perpetual moveable seasons)
        const seasonStart = this.getSeasonStartDate(date);
        if (seasonStart) {
            const dayOfSeason = Math.floor((date - seasonStart) / 86400000) + 1;
            entry = data.find(d => d.day_of_season === dayOfSeason);
            if (entry) {
                console.log(`[Calendar Engine] Offset match day ${dayOfSeason} for ${iso} in ${fileName}`);
                return entry;
            }
        }

        // Priority 3: Month-day match (fixed feasts — christmas, epiphany, sanctoral)
        const mmdd = iso.slice(5);
        const longNoYear = long.replace(/,\s*\d{4}$/, '').trim();
        entry = data.find(d => {
            if (!d.date) return false;
            const dIso = d.date.length === 10 ? d.date.slice(5) : null;
            const dLong = d.date.replace(/,\s*\d{4}$/, '').trim();
            return dIso === mmdd || dLong === longNoYear;
        });
        if (entry) {
            console.log(`[Calendar Engine] Month-day match for ${iso} in ${fileName}`);
            return entry;
        }

        console.warn(`[Calendar Engine] No match for ${iso} in ${fileName} - returning fallback sentinel.`);
        return {
            _isFallback: true,
            title: `[No lectionary entry for ${iso}]`,
            date: iso,
            morning_reading_1: '',
            morning_reading_2: '',
            evening_reading_1: '',
            evening_reading_2: '',
            psalms_morning: '',
            psalms_evening: ''
        };
    }

    // ── Eastern Orthodox calendar support ─────────────────────────────────────
    //
    // getEOSeasonRanges() and its helpers implement the fixed-feast placement
    // half of the EO old/new calendar mode contract described in admin/readme.md.
    //
    // The movable-feast half (Pascha and all P±N observances) is handled entirely
    // by calendar-eastern-orthodox.js via EasternOrthodoxCalendar.getYearSnapshot().
    // Pascha itself always follows the Julian Paschalion regardless of eoMode;
    // eoMode only governs where fixed feasts (Christmas, Theophany) land on the
    // civil calendar.
    //
    // new_calendar (Revised Julian / New Calendar parishes):
    //   Fixed feasts = Gregorian civil date. Christmas = Dec 25, Theophany = Jan 6.
    //
    // old_calendar (Julian / Old Calendar parishes):
    //   Fixed feasts = Julian date expressed as a Gregorian civil date by adding
    //   the century-based Julian↔Gregorian offset (13 days in 20th–21st century).
    //   Christmas = Jan 7, Theophany = Jan 19.

    /**
     * Century-based Julian→Gregorian day offset.
     * Julian civil date + offset = Gregorian civil date.
     * Valid from 1600 AD through 2199 AD.
     *
     * @param  {number} year - The Gregorian civil year
     * @return {number} Number of days to add to a Julian date to get its Gregorian civil equivalent
     */
    static _julianToGregorianOffset(year) {
        if (year >= 2100) return 14;
        if (year >= 1900) return 13; // current century
        if (year >= 1800) return 12;
        if (year >= 1700) return 11;
        return 10;
    }

    /**
     * Format a Date object as a YYYY-MM-DD string (local time, no UTC shift).
     * Private helper used by getEOSeasonRanges() to avoid depending on
     * formatDateISO() which calls toISOString() and can shift by timezone.
     *
     * @param  {Date} date
     * @return {string} "YYYY-MM-DD"
     */
    static _isoFromDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    /**
     * getEOSeasonRanges(year, eoMode)
     *
     * Returns the Eastern Orthodox liturgical season ranges for the given civil
     * year, with fixed feasts placed according to eoMode.
     *
     * This function implements the open MEDIUM task "EO old/new calendar mode
     * implementation" documented in structure.json → admin.todos.
     *
     * Return shape:
     * {
     *   seasons:     [ { key, label, colorToken, startDate, endDate } ]  // civil YYYY-MM-DD
     *   fixedFeasts: { christmas, theophany }                            // civil YYYY-MM-DD
     *   eoMode:      'new_calendar' | 'old_calendar'
     *   _diagnostics: { julianOffset, paschaAlgorithm }
     * }
     *
     * On missing module, returns: { _notImplemented: true, reason: string }
     * This preserves the explicit-error contract described in admin/readme.md.
     *
     * @param  {number} year    - Civil year (e.g. 2026)
     * @param  {string} eoMode  - 'new_calendar' (default) or 'old_calendar'
     * @return {object}
     */
    static getEOSeasonRanges(year, eoMode = 'new_calendar') {
        if (eoMode !== 'new_calendar' && eoMode !== 'old_calendar') {
            throw new Error(
                `[CalendarEngine] getEOSeasonRanges: unknown eoMode "${eoMode}". ` +
                'Must be "new_calendar" or "old_calendar".'
            );
        }

        // Guard: EasternOrthodoxCalendar must be loaded.
        // Do NOT coerce to new_calendar — surface the failure explicitly.
        if (typeof EasternOrthodoxCalendar === 'undefined') {
            return {
                _notImplemented: true,
                reason: 'EasternOrthodoxCalendar module not loaded. ' +
                        'Ensure js/calendar-eastern-orthodox.js is included before this file.'
            };
        }

        // ── Fixed-feast civil dates ──────────────────────────────────────
        //
        // Christmas and Theophany (Epiphany) are fixed in the Julian or
        // Revised-Julian calendar depending on eoMode.
        //
        // new_calendar: Revised Julian fixed dates coincide with Gregorian.
        //   Christmas  = Dec 25 of `year`   (civil Dec 25)
        //   Theophany  = Jan  6 of `year+1` (civil Jan  6)
        //
        // old_calendar: Julian fixed dates, converted to Gregorian civil dates.
        //   Julian Dec 25 + 13 days = Gregorian Jan  7 of `year+1`
        //   Julian Jan  6 + 13 days = Gregorian Jan 19 of `year+1`
        //   (offset = 13 for years 1900–2099; see _julianToGregorianOffset)

        const offset = this._julianToGregorianOffset(year);

        let christmas, theophany;

        if (eoMode === 'new_calendar') {
            christmas = new Date(year,     11, 25); // Dec 25 of this year
            theophany = new Date(year + 1,  0,  6); // Jan  6 of next year
        } else {
            // Julian Dec 25 → add offset days → Gregorian civil date
            // Julian Dec 25 + 13 = Dec 38 → rolls to Jan 7 of year+1
            // Expressed cleanly: new Date(year+1, 0, offset - 6)
            //   offset=13 → Jan 7  ✓
            //   offset=14 → Jan 8  ✓ (post-2100)
            // Julian Jan  6 → add offset days → Gregorian civil date
            //   new Date(year+1, 0, 6 + offset)
            //   offset=13 → Jan 19 ✓
            christmas = new Date(year + 1,  0, offset - 6);  // Jan 7 when offset=13
            theophany = new Date(year + 1,  0,  6 + offset); // Jan 19 when offset=13
        }

        // ── Movable feasts from EasternOrthodoxCalendar ─────────────────
        //
        // Pascha always uses the Julian Paschalion regardless of eoMode.
        // Its civil date (Gregorian) is already correct in both modes because
        // calendar-eastern-orthodox.js converts Julian Pascha → Gregorian civil.
        // eoMode is passed through to allow future fixed-feast extensions inside
        // the Orthodox module if needed.

        const snap = EasternOrthodoxCalendar.getYearSnapshot(year, { eoMode });

        // Normalize season start/end to YYYY-MM-DD strings.
        // The EasternOrthodoxCalendar module returns start/end as Date objects.
        const seasons = snap.seasons.map(function(s) {
            return {
                key:        s.key,
                label:      s.label,
                colorToken: s.colorToken,
                startDate:  CalendarEngine._isoFromDate(
                                s.start instanceof Date ? s.start : new Date(s.start)
                            ),
                endDate:    CalendarEngine._isoFromDate(
                                s.end instanceof Date ? s.end : new Date(s.end)
                            ),
            };
        });

        console.log(
            `[CalendarEngine] getEOSeasonRanges(${year}, "${eoMode}"):`,
            `Christmas=${this._isoFromDate(christmas)},`,
            `Theophany=${this._isoFromDate(theophany)},`,
            `Pascha=${snap.anchors.pascha}`
        );

        return {
            seasons,
            fixedFeasts: {
                christmas: this._isoFromDate(christmas),
                theophany: this._isoFromDate(theophany),
            },
            eoMode,
            _diagnostics: {
                julianOffset:    (eoMode === 'old_calendar') ? offset : 0,
                paschaAlgorithm: 'julian_paschalion',
                paschaISO:       snap.anchors.pascha,
            },
        };
    }
}

window.CalendarEngine = CalendarEngine;