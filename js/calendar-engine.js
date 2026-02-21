/**
 * CALENDAR ENGINE MODULE - Audited Class Version
 */
class CalendarEngine {
    static currentDate = new Date();
    static seasonalCache = {};
    static bcpPropers = null;

    // Standardized with slashes to ensure local time parsing and avoid the UTC "dead zone"
    static SEASON_RANGES = [
        { start: new Date("2025/11/30"), end: new Date("2025/12/24"), season: "advent",   file: "advent.json",    liturgicalColor: "purple" },
        { start: new Date("2025/12/25"), end: new Date("2026/01/05"), season: "christmas", file: "christmas.json", liturgicalColor: "white"  },
        { start: new Date("2026/01/06"), end: new Date("2026/02/16"), season: "epiphany",  file: "epiphany.json",  liturgicalColor: "white"  },
        { start: new Date("2026/02/17"), end: new Date("2026/02/17"), season: "ordinary",  file: "ordinary1.json", liturgicalColor: "green"  },
        { start: new Date("2026/02/18"), end: new Date("2026/04/04"), season: "lent",      file: "lent.json",      liturgicalColor: "purple" },
        { start: new Date("2026/04/05"), end: new Date("2026/05/23"), season: "easter",    file: "easter.json",    liturgicalColor: "white"  },
        { start: new Date("2026/05/24"), end: new Date("2026/07/31"), season: "ordinary",  file: "ordinary1.json", liturgicalColor: "green"  },
        { start: new Date("2026/08/01"), end: new Date("2026/09/30"), season: "ordinary",  file: "ordinary2.json", liturgicalColor: "green"  },
        { start: new Date("2026/10/01"), end: new Date("2026/11/28"), season: "ordinary",  file: "ordinary3.json", liturgicalColor: "green"  },
        { start: new Date("2026/11/29"), end: new Date("2026/12/24"), season: "advent",    file: "advent.json",    liturgicalColor: "purple" },
        { start: new Date("2026/12/25"), end: new Date("2027/01/05"), season: "christmas", file: "christmas.json", liturgicalColor: "white"  },
        { start: new Date("2027/01/06"), end: new Date("2027/02/09"), season: "epiphany",  file: "epiphany.json",  liturgicalColor: "white"  },
        { start: new Date("2027/02/10"), end: new Date("2027/03/27"), season: "lent",      file: "lent.json",      liturgicalColor: "purple" },
        { start: new Date("2027/03/28"), end: new Date("2027/05/15"), season: "easter",    file: "easter.json",    liturgicalColor: "white"  },
        { start: new Date("2027/05/16"), end: new Date("2027/07/31"), season: "ordinary",  file: "ordinary1.json", liturgicalColor: "green"  },
        { start: new Date("2027/08/01"), end: new Date("2027/09/30"), season: "ordinary",  file: "ordinary2.json", liturgicalColor: "green"  },
        { start: new Date("2027/10/01"), end: new Date("2027/11/27"), season: "ordinary",  file: "ordinary3.json", liturgicalColor: "green"  },
        { start: new Date("2027/11/28"), end: new Date("2027/12/24"), season: "advent",    file: "advent.json",    liturgicalColor: "purple" },
        { start: new Date("2027/12/25"), end: new Date("2028/01/05"), season: "christmas", file: "christmas.json", liturgicalColor: "white"  },
        { start: new Date("2028/01/06"), end: new Date("2028/02/28"), season: "epiphany",  file: "epiphany.json",  liturgicalColor: "white"  },
        { start: new Date("2028/02/29"), end: new Date("2028/04/15"), season: "lent",      file: "lent.json",      liturgicalColor: "purple" },
        { start: new Date("2028/04/16"), end: new Date("2028/06/03"), season: "easter",    file: "easter.json",    liturgicalColor: "white"  },
        { start: new Date("2028/06/04"), end: new Date("2028/07/31"), season: "ordinary",  file: "ordinary1.json", liturgicalColor: "green"  },
        { start: new Date("2028/08/01"), end: new Date("2028/09/30"), season: "ordinary",  file: "ordinary2.json", liturgicalColor: "green"  },
        { start: new Date("2028/10/01"), end: new Date("2028/12/02"), season: "ordinary",  file: "ordinary3.json", liturgicalColor: "green"  },
        { start: new Date("2028/12/03"), end: new Date("2028/12/24"), season: "advent",    file: "advent.json",    liturgicalColor: "purple" },
        { start: new Date("2028/12/25"), end: new Date("2029/01/05"), season: "christmas", file: "christmas.json", liturgicalColor: "white"  },
        { start: new Date("2029/01/06"), end: new Date("2029/02/13"), season: "epiphany",  file: "epiphany.json",  liturgicalColor: "white"  },
        { start: new Date("2029/02/14"), end: new Date("2029/03/31"), season: "lent",      file: "lent.json",      liturgicalColor: "purple" },
        { start: new Date("2029/04/01"), end: new Date("2029/05/19"), season: "easter",    file: "easter.json",    liturgicalColor: "white"  },
        { start: new Date("2029/05/20"), end: new Date("2029/07/31"), season: "ordinary",  file: "ordinary1.json", liturgicalColor: "green"  },
        { start: new Date("2029/08/01"), end: new Date("2029/09/30"), season: "ordinary",  file: "ordinary2.json", liturgicalColor: "green"  },
        { start: new Date("2029/10/01"), end: new Date("2029/12/01"), season: "ordinary",  file: "ordinary3.json", liturgicalColor: "green"  },
        { start: new Date("2029/12/02"), end: new Date("2029/12/24"), season: "advent",    file: "advent.json",    liturgicalColor: "purple" },
        { start: new Date("2029/12/25"), end: new Date("2030/01/05"), season: "christmas", file: "christmas.json", liturgicalColor: "white"  },
        { start: new Date("2030/01/06"), end: new Date("2030/03/05"), season: "epiphany",  file: "epiphany.json",  liturgicalColor: "white"  },
        { start: new Date("2030/03/06"), end: new Date("2030/04/20"), season: "lent",      file: "lent.json",      liturgicalColor: "purple" },
        { start: new Date("2030/04/21"), end: new Date("2030/06/08"), season: "easter",    file: "easter.json",    liturgicalColor: "white"  },
        { start: new Date("2030/06/09"), end: new Date("2030/07/31"), season: "ordinary",  file: "ordinary1.json", liturgicalColor: "green"  },
        { start: new Date("2030/08/01"), end: new Date("2030/09/30"), season: "ordinary",  file: "ordinary2.json", liturgicalColor: "green"  },
        { start: new Date("2030/10/01"), end: new Date("2030/11/30"), season: "ordinary",  file: "ordinary3.json", liturgicalColor: "green"  },
        { start: new Date("2030/12/01"), end: new Date("2030/12/24"), season: "advent",    file: "advent.json",    liturgicalColor: "purple" }
    ];

    static async init() {
        try {
            const res = await fetch('data/season/bcp-propers.json');
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
        // BCP two-year daily office cycle, anchored to Advent Sunday:
        //   Advent 2025 (Nov 30 2025) → Year 2
        //   Advent 2026 (Nov 29 2026) → Year 1
        //   Advent 2027 (Nov 28 2027) → Year 2  ...alternates.
        //
        // Count how many Advent seasons have started on or before `date`.
        // NOTE: deliberately does NOT call getSeasonAndFile to avoid circular calls.
        const adventRanges = this.SEASON_RANGES.filter(r => r.season === "advent");
        let adventsPassed = 0;
        for (const r of adventRanges) {
            if (date >= r.start) adventsPassed++;
        }
        // 1 Advent passed (2025) → year2
        // 2 Advents passed (2026) → year1
        // 3 Advents passed (2027) → year2 ... odd = year2, even = year1
        return (adventsPassed % 2 === 0) ? "year1" : "year2";
    }

    /**
     * Returns season, file, liturgicalColor, AND litYear for the given date.
     * This is the single source of truth consumed by office-ui.js.
     */
    static getSeasonAndFile(targetDate) {
        const date = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

        for (const range of this.SEASON_RANGES) {
            if (date >= range.start && date <= range.end) {
                return {
                    season: range.season,
                    file: range.file,
                    liturgicalColor: range.liturgicalColor || 'green',
                    litYear: this.getLiturgicalYear(date)
                };
            }
        }

        console.warn(`[Calendar Engine] No range match for ${date.toDateString()}. Defaulting to ordinary1.json`);
        return {
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
        for (const range of this.SEASON_RANGES) {
            if (date >= range.start && date <= range.end) {
                // For ordinary2 and ordinary3, return the start of ordinary1 for that year
                // so that day_of_season is continuous across all three ordinary files.
                if (range.file === 'ordinary2.json' || range.file === 'ordinary3.json') {
                    const ordinary1 = this.SEASON_RANGES.find(r =>
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

        console.warn(`[Calendar Engine] No match for ${iso} in ${fileName} - using index 0 fallback.`);
        return data[0];
    }
}

window.CalendarEngine = CalendarEngine;