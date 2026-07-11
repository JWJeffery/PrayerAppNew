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

    static _getThanksgivingDay(year) {
        // U.S. civil Thanksgiving = the fourth Thursday of November.
        // Not a BCP-dated Holy Day (unlike Independence Day, which has a fixed
        // July 4), so it needs its own per-year computation rather than a
        // literal "date" field in the season data — see findEntry()'s Priority 0
        // check below, which is what actually routes to the dedicated entry.
        const nov1 = new Date(year, 10, 1); // month is 0-indexed
        const dow  = nov1.getDay();          // 0=Sun ... 4=Thu
        const daysUntilFirstThursday = (4 - dow + 7) % 7;
        const firstThursday = 1 + daysUntilFirstThursday;
        return new Date(year, 10, firstThursday + 21); // +3 weeks = 4th Thursday
    }

    static _isThanksgivingDay(date) {
        const t = this._getThanksgivingDay(date.getFullYear());
        return date.getFullYear() === t.getFullYear() &&
               date.getMonth()    === t.getMonth()    &&
               date.getDate()     === t.getDate();
    }

    static _getVisitationDate(year) {
        // The Visitation of the Blessed Virgin Mary has a genuine fixed BCP date,
        // May 31 -- but per BCP's transfer rule (p.15: "other Feasts of our Lord...
        // which occur on a Sunday are normally transferred to the first convenient
        // open day within the week"), when May 31 coincides with Trinity Sunday
        // (a Principal Feast, which always wins), the Visitation moves to the next
        // day instead. Trinity Sunday = the Sunday after Pentecost = Easter + 56.
        const easter = this._getEaster(year);
        const trinitySunday = this._addDays(easter, 56);
        const may31 = new Date(year, 4, 31); // month is 0-indexed
        const collides = trinitySunday.getFullYear() === may31.getFullYear() &&
                          trinitySunday.getMonth()    === may31.getMonth()    &&
                          trinitySunday.getDate()     === may31.getDate();
        return collides ? this._addDays(may31, 1) : may31;
    }

    static _isVisitationDate(date) {
        const v = this._getVisitationDate(date.getFullYear());
        return date.getFullYear() === v.getFullYear() &&
               date.getMonth()    === v.getMonth()    &&
               date.getDate()     === v.getDate();
    }

    // Transcribed directly from BCP pp.884-885, "A Table to Find Movable Feasts
    // and Holy Days" -- maps Easter Day's (month, day) to the numbered Proper
    // used on "the Sunday after Trinity Sunday" (BCP's own label for what this
    // table calls the "Numbered Proper of 2 Pentecost"). See _getProperWeekInfo
    // below for how this drives the whole Ordinary Time addressing scheme.
    static get EASTER_TO_STARTING_PROPER() {
        return { "3-22":3, "3-23":3, "3-24":3, "3-25":3, "3-26":3,
                  "3-27":4, "3-28":4, "3-29":4, "3-30":4, "3-31":4,
                  "4-1":4, "4-2":4,
                  "4-3":5, "4-4":5, "4-5":5, "4-6":5, "4-7":5, "4-8":5, "4-9":5,
                  "4-10":6, "4-11":6, "4-12":6, "4-13":6, "4-14":6, "4-15":6, "4-16":6,
                  "4-17":7, "4-18":7, "4-19":7, "4-20":7, "4-21":7, "4-22":7, "4-23":7,
                  "4-24":8, "4-25":8 };
    }

    static _getStartingProper(year) {
        const easter = this._getEaster(year);
        const key = (easter.getMonth() + 1) + '-' + easter.getDate();
        return this.EASTER_TO_STARTING_PROPER[key];
    }

    static _getProperWeekInfo(date) {
        // Determines which Proper number and weekday a date within Ordinary
        // Time's Proper-numbered system corresponds to -- the fix for the
        // architectural defect found 2026-07-10: BCP anchors Propers to fixed
        // civil dates (p.158: "the Proper for the Sunday after Trinity Sunday...
        // is the numbered Proper... the calendar date of which falls on that
        // Sunday, or is closest to it... Thereafter, the Propers are used
        // consecutively"), while this app's day_of_season is Pentecost-anchored
        // -- the two only coincide for 2026, the year the data was built
        // against. This computes the real BCP-correct Proper/weekday fresh for
        // any year, the same technique already used for Thanksgiving Day and
        // the Visitation. Returns { properNumber, weekday } or null if the
        // date falls outside the Proper-numbered system (before Pentecost+1,
        // on Trinity Sunday itself, or on/after Advent Sunday).
        const year = date.getFullYear();
        const easter = this._getEaster(year);
        const pentecost = this._addDays(easter, 49);
        const ordinaryStart = this._addDays(pentecost, 1); // Monday after Pentecost
        const trinitySunday = this._addDays(easter, 56);
        const firstProperSunday = this._addDays(trinitySunday, 7); // "Sunday after Trinity Sunday"
        const adventSunday = this._getAdventSunday(year);

        if (date < ordinaryStart || date >= adventSunday) return null;

        const startingProper = this.EASTER_TO_STARTING_PROPER[(easter.getMonth() + 1) + '-' + easter.getDate()];
        if (startingProper === undefined) return null;

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weekday = dayNames[date.getDay()];

        if (date < firstProperSunday) {
            // Pre-sequence weeks: BCP p.158's own example ("Propers 1 and 2
            // being used on the weekdays of Pentecost and Trinity weeks" when
            // the starting Proper is 3) generalizes to "the two Propers
            // immediately before the starting one" -- confirmed against this
            // app's own verified-correct 2026 data, which already does exactly
            // this (starting Proper 5 that year; Pentecost week weekdays use
            // Proper 3's real BCP readings, Trinity week uses Proper 4's).
            if (date.getTime() === trinitySunday.getTime()) return null; // Trinity Sunday itself, not part of this system
            if (date < trinitySunday) {
                return { properNumber: startingProper - 2, weekday };
            }
            return { properNumber: startingProper - 1, weekday };
        }

        const daysSince = Math.floor((date - firstProperSunday) / 86400000);
        const weeksSince = Math.floor(daysSince / 7);
        return { properNumber: startingProper + weeksSince, weekday };
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

    static async _loadSeasonFile(file) {
        if (this.seasonalCache[file]) return this.seasonalCache[file];
        try {
            const response = await fetch(`data/season/${file}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            this.seasonalCache[file] = data;
            return data;
        } catch (err) {
            console.error(`[Calendar Engine] Error loading ${file}:`, err);
            return null;
        }
    }

    static async _findFixedMonthDayEntry(targetDate) {
        // Fixed-civil-date Holy Days can fall in a DIFFERENT season than their
        // usual one depending on the year -- e.g. St. Andrew (Nov 30) sits right
        // at the Advent/Ordinary-Time boundary (Advent Sunday ranges Nov 27-Dec
        // 3), and St. Matthias (Feb 24) sits near the Epiphany/Lent boundary
        // (Ash Wednesday ranges Feb 4-March 10). getSeasonAndFile() picks a
        // single file based on the season boundary for THAT year, which may not
        // be the file the Holy Day's entry actually lives in. Found 2026-07-10
        // via exhaustive multi-year testing, not by inspection -- a gap in the
        // original Defect 1 fix, surfaced (not caused) by this session's testing.
        // Checks all season files; relies on _loadSeasonFile's cache so this is
        // only expensive on a cache-cold lookup.
        const iso = this.formatDateISO(targetDate);
        const mmdd = iso.slice(5);
        const longNoYear = this.formatDateForLookup(targetDate).replace(/,\s*\d{4}$/, '').trim();
        const filesToCheck = ['advent.json', 'christmas.json', 'epiphany.json', 'lent.json', 'easter.json',
                               'ordinary1.json', 'ordinary2.json', 'ordinary3.json'];
        for (const f of filesToCheck) {
            const data = await this._loadSeasonFile(f);
            if (!data) continue;
            const match = data.find(d => d.fixed_month_day && d.date &&
                ((d.date.length === 10 && d.date.slice(5) === mmdd) ||
                 d.date.replace(/,\s*\d{4}$/, '').trim() === longNoYear));
            if (match) return match;
        }
        return null;
    }

    static async fetchLectionaryData(targetDate = this.currentDate) {
        // The Visitation of the Blessed Virgin Mary (May 31, or June 1 in years
        // it collides with Trinity Sunday -- see _getVisitationDate) is checked
        // before normal season/file routing, because its date can fall in EITHER
        // Easter season or Ordinary Time depending on how early/late Easter is
        // that year (confirmed empirically: 5 of 12 tested years land in Easter
        // season, not Ordinary Time, where its data entry actually lives).
        // findEntry()'s own Priority checks can't help here, since they only ever
        // see whichever single file getSeasonAndFile() already picked.
        if (this._isVisitationDate(targetDate)) {
            const data = await this._loadSeasonFile('ordinary1.json');
            const visEntry = data && data.find(d => d.moveable_id === 'visitation');
            if (visEntry) {
                console.log(`[Calendar Engine] Visitation match for ${this.formatDateISO(targetDate)}`);
                return visEntry;
            }
        }

        // Fixed-date Holy Days, checked across all season files (see
        // _findFixedMonthDayEntry) before any season-specific routing, since
        // their actual file doesn't always match the one getSeasonAndFile picks
        // for their civil date in a given year.
        const holyDayMatch = await this._findFixedMonthDayEntry(targetDate);
        if (holyDayMatch) {
            console.log(`[Calendar Engine] Fixed-month-day match for ${this.formatDateISO(targetDate)}`);
            return holyDayMatch;
        }

        const { file, season } = this.getSeasonAndFile(targetDate);

        // Ordinary Time's regular Proper-numbered weekday content, fixed
        // 2026-07-10: BCP anchors Propers to fixed civil dates, so a given
        // Proper's actual position within Ordinary Time shifts every year --
        // the old day_of_season offset (Pentecost-anchored) only coincided
        // with the right Proper for 2026, the year the data was built against.
        // _getProperWeekInfo computes the real BCP-correct Proper/weekday for
        // any year; entries are matched by that identity instead of a
        // sequential day count, searched across all three Ordinary Time files
        // since a given year's Proper N doesn't necessarily live in whichever
        // file getSeasonAndFile's civil-date split happens to pick for it.
        if (season === 'ordinary') {
            const primaryData = await this._loadSeasonFile(file);
            if (primaryData) {
                const iso = this.formatDateISO(targetDate);
                const exactMatch = primaryData.find(d => d.date === iso || d.date === this.formatDateForLookup(targetDate));
                if (exactMatch) {
                    console.log(`[Calendar Engine] Exact match (via Ordinary Time Proper routing) for ${iso}`);
                    return exactMatch;
                }
            }

            const properInfo = this._getProperWeekInfo(targetDate);
            if (properInfo) {
                for (const f of ['ordinary1.json', 'ordinary2.json', 'ordinary3.json']) {
                    const data = await this._loadSeasonFile(f);
                    if (!data) continue;
                    const match = data.find(d => d.proper_number === properInfo.properNumber && d.weekday === properInfo.weekday);
                    if (match) {
                        console.log(`[Calendar Engine] Proper ${properInfo.properNumber} ${properInfo.weekday} match for ${this.formatDateISO(targetDate)}`);
                        return match;
                    }
                }
                console.warn(`[Calendar Engine] No entry found for Proper ${properInfo.properNumber} ${properInfo.weekday} (date ${this.formatDateISO(targetDate)}) -- falling through to legacy offset matching.`);
            }
        }

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

        // Priority 0: Thanksgiving Day (4th Thursday of November) — a genuine
        // moveable date with no fixed BCP date, so it can't be matched by a
        // literal "date" field the way every other Holy Day is. Computed
        // per-year via _isThanksgivingDay(); the matching data entry carries a
        // `moveable_id` marker instead of `date`/`day_of_season`, so it's
        // invisible to Priorities 1-2 and only ever reached here.
        if (this._isThanksgivingDay(date)) {
            const twEntry = data.find(d => d.moveable_id === 'thanksgiving-day');
            if (twEntry) {
                console.log(`[Calendar Engine] Thanksgiving Day match for ${iso} in ${fileName}`);
                return twEntry;
            }
        }

        // Priority 1: Exact ISO or long-format match
        let entry = data.find(d => d.date === iso || d.date === long);
        if (entry) {
            console.log(`[Calendar Engine] Exact match for ${iso} in ${fileName}`);
            return entry;
        }

        // Priority 1.5: Fixed-month-day Holy Days inside moveable seasons.
        // Advent/Lent/Easter/Ordinary Time populate day_of_season on every entry
        // (needed so season *boundaries* stay perpetual), but that means a Holy
        // Day with a genuine fixed civil date (e.g. Saint Andrew, Nov 30 every
        // year) lands at a *different* day_of_season offset each year, since the
        // season itself starts on a moveable date. Priority 2 below would always
        // find *something* first and never fall through to the month-day match
        // that's supposed to catch these. This check runs first, but only
        // considers entries explicitly marked `fixed_month_day: true` -- added
        // deliberately to the ~23 genuine fixed-date Holy Days in these files,
        // NOT to Easter/Ascension/Pentecost/Trinity Sunday (genuinely
        // Easter-relative, correctly handled by Priority 2 already) or the
        // Visitation (conditionally transferred depending on whether it collides
        // with Trinity Sunday that year -- a different, harder problem, not yet
        // fixed; see RESUME_PROJECT_NOTE.md).
        const mmddEarly = iso.slice(5);
        const longNoYearEarly = long.replace(/,\s*\d{4}$/, '').trim();
        entry = data.find(d => {
            if (!d.fixed_month_day || !d.date) return false;
            const dIso = d.date.length === 10 ? d.date.slice(5) : null;
            const dLong = d.date.replace(/,\s*\d{4}$/, '').trim();
            return dIso === mmddEarly || dLong === longNoYearEarly;
        });
        if (entry) {
            console.log(`[Calendar Engine] Fixed-month-day match for ${iso} in ${fileName}`);
            return entry;
        }

        // Priority 2: day_of_season offset match (perpetual moveable seasons).
        // Excludes fixed_month_day entries -- without this, a Holy Day's own
        // day_of_season value (valid only for the specific year it was written
        // against) can "leak" and incorrectly match an unrelated date in another
        // year whose offset happens to coincide with it. Confirmed empirically:
        // before this exclusion, June 26 2027 incorrectly matched Independence
        // Day's day_of_season slot, 8 days before the real July 4.
        const seasonStart = this.getSeasonStartDate(date);
        if (seasonStart) {
            const dayOfSeason = Math.floor((date - seasonStart) / 86400000) + 1;
            entry = data.find(d => d.day_of_season === dayOfSeason && !d.fixed_month_day);
            if (entry) {
                console.log(`[Calendar Engine] Offset match day ${dayOfSeason} for ${iso} in ${fileName}`);
                return entry;
            }
        }

        // Priority 3: Month-day match (fixed feasts — christmas, epiphany, sanctoral).
        // Restricted to entries that are either explicitly fixed_month_day (the 23
        // Advent/Lent/Easter/Ordinary-Time Holy Days above, already caught by
        // Priority 1.5 in practice, so this is mostly a safety net for them) or
        // have no day_of_season at all (Christmas/Epiphany, which never populate
        // it — every entry there is implicitly fixed by construction). Without
        // this restriction, a regular weekday entry's own literal 2026 date can
        // coincidentally month-day-match an unrelated date in another year and
        // return wrong content that isn't even the correct offset-based reading
        // for that year -- confirmed empirically: before this restriction, June
        // 26 2027 (day 33 of that year's Ordinary Time) matched "Friday in the
        // Week of Proper 7" purely because that title happened to sit on
        // 2026-06-26, not because it was actually correct for 2027.
        const mmdd = iso.slice(5);
        const longNoYear = long.replace(/,\s*\d{4}$/, '').trim();
        entry = data.find(d => {
            if (!d.date) return false;
            if (d.day_of_season !== undefined && !d.fixed_month_day) return false;
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