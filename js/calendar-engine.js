/**
 * CALENDAR ENGINE MODULE - Audited Class Version
 */
class CalendarEngine {
    static currentDate = new Date();
    static seasonalCache = {};
    static bcpPropers = null;

    // Standardized with slashes to ensure local time parsing and avoid the UTC "dead zone"
    static SEASON_RANGES = [
        { start: new Date("2025/11/30"), end: new Date("2025/12/24"), season: "advent", file: "advent.json" },
        { start: new Date("2025/12/25"), end: new Date("2026/01/05"), season: "christmas", file: "christmas.json" },
        { start: new Date("2026/01/06"), end: new Date("2026/02/16"), season: "epiphany", file: "epiphany.json" },
        { start: new Date("2026/02/17"), end: new Date("2026/02/17"), season: "ordinary", file: "ordinary1.json" },
        { start: new Date("2026/02/18"), end: new Date("2026/04/04"), season: "lent", file: "lent.json" },
        { start: new Date("2026/04/05"), end: new Date("2026/05/23"), season: "easter", file: "easter.json" },
        { start: new Date("2026/05/24"), end: new Date("2026/07/31"), season: "ordinary", file: "ordinary1.json" },
        { start: new Date("2026/08/01"), end: new Date("2026/09/30"), season: "ordinary", file: "ordinary2.json" },
        { start: new Date("2026/10/01"), end: new Date("2026/11/28"), season: "ordinary", file: "ordinary3.json" },
        { start: new Date("2026/11/29"), end: new Date("2026/12/24"), season: "advent", file: "advent.json" },
        { start: new Date("2026/11/29"), end: new Date("2026/12/24"), season: "advent", file: "advent.json" },
        { start: new Date("2026/12/25"), end: new Date("2027/01/05"), season: "christmas", file: "christmas.json" },
        { start: new Date("2027/01/06"), end: new Date("2027/02/09"), season: "epiphany", file: "epiphany.json" },
        { start: new Date("2027/02/10"), end: new Date("2027/03/27"), season: "lent", file: "lent.json" },
        { start: new Date("2027/03/28"), end: new Date("2027/05/15"), season: "easter", file: "easter.json" },
        { start: new Date("2027/05/16"), end: new Date("2027/07/31"), season: "ordinary", file: "ordinary1.json" },
        { start: new Date("2027/08/01"), end: new Date("2027/09/30"), season: "ordinary", file: "ordinary2.json" },
        { start: new Date("2027/10/01"), end: new Date("2027/11/27"), season: "ordinary", file: "ordinary3.json" },
        { start: new Date("2027/11/28"), end: new Date("2027/12/24"), season: "advent", file: "advent.json" },
        { start: new Date("2027/12/25"), end: new Date("2028/01/05"), season: "christmas", file: "christmas.json" },
        { start: new Date("2028/01/06"), end: new Date("2028/02/28"), season: "epiphany", file: "epiphany.json" },
        { start: new Date("2028/02/29"), end: new Date("2028/04/15"), season: "lent", file: "lent.json" },
        { start: new Date("2028/04/16"), end: new Date("2028/06/03"), season: "easter", file: "easter.json" },
        { start: new Date("2028/06/04"), end: new Date("2028/07/31"), season: "ordinary", file: "ordinary1.json" },
        { start: new Date("2028/08/01"), end: new Date("2028/09/30"), season: "ordinary", file: "ordinary2.json" },
        { start: new Date("2028/10/01"), end: new Date("2028/12/02"), season: "ordinary", file: "ordinary3.json" },
        { start: new Date("2028/12/03"), end: new Date("2028/12/24"), season: "advent", file: "advent.json" },
        { start: new Date("2028/12/25"), end: new Date("2029/01/05"), season: "christmas", file: "christmas.json" },
        { start: new Date("2029/01/06"), end: new Date("2029/02/13"), season: "epiphany", file: "epiphany.json" },
        { start: new Date("2029/02/14"), end: new Date("2029/03/31"), season: "lent", file: "lent.json" },
        { start: new Date("2029/04/01"), end: new Date("2029/05/19"), season: "easter", file: "easter.json" },
        { start: new Date("2029/05/20"), end: new Date("2029/07/31"), season: "ordinary", file: "ordinary1.json" },
        { start: new Date("2029/08/01"), end: new Date("2029/09/30"), season: "ordinary", file: "ordinary2.json" },
        { start: new Date("2029/10/01"), end: new Date("2029/12/01"), season: "ordinary", file: "ordinary3.json" },
        { start: new Date("2029/12/02"), end: new Date("2029/12/24"), season: "advent", file: "advent.json" },
        { start: new Date("2029/12/25"), end: new Date("2030/01/05"), season: "christmas", file: "christmas.json" },
        { start: new Date("2030/01/06"), end: new Date("2030/03/05"), season: "epiphany", file: "epiphany.json" },
        { start: new Date("2030/03/06"), end: new Date("2030/04/20"), season: "lent", file: "lent.json" },
        { start: new Date("2030/04/21"), end: new Date("2030/06/08"), season: "easter", file: "easter.json" },
        { start: new Date("2030/06/09"), end: new Date("2030/07/31"), season: "ordinary", file: "ordinary1.json" },
        { start: new Date("2030/08/01"), end: new Date("2030/09/30"), season: "ordinary", file: "ordinary2.json" },
        { start: new Date("2030/10/01"), end: new Date("2030/11/30"), season: "ordinary", file: "ordinary3.json" },
        { start: new Date("2030/12/01"), end: new Date("2030/12/24"), season: "advent", file: "advent.json" }
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
        const advent2026 = new Date("2026/11/29");
        return (date >= advent2026) ? "year1" : "year2";
    }

    /**
     * Unified logic: This now trusts the SEASON_RANGES array exclusively.
     * The redundant 'getOrdinaryFile' override has been removed.
     */
    static getSeasonAndFile(targetDate) {
        const date = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        
        for (const range of this.SEASON_RANGES) {
            if (date >= range.start && date <= range.end) {
                return { season: range.season, file: range.file };
            }
        }
        
        console.warn(`[Calendar Engine] No range match for ${date.toDateString()}. Defaulting to ordinary1.json`);
        return { season: "ordinary", file: "ordinary1.json" };
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

    static findEntry(data, date, fileName) {
        const iso = this.formatDateISO(date);
        const long = this.formatDateForLookup(date);

        // First try exact match (ISO or long format)
        let entry = data.find(d => d.date === iso || d.date === long);

        // If no exact match, try month-day only (perpetual calendar fallback)
        // This allows christmas.json, advent.json etc. to serve any year
        if (!entry) {
            const mmdd = iso.slice(5); // "MM-DD"
            const longNoYear = long.replace(/,\s*\d{4}$/, '').trim(); // "December 25"
            entry = data.find(d => {
                if (!d.date) return false;
                const dIso = d.date.length === 10 ? d.date.slice(5) : null;
                const dLong = d.date.replace(/,\s*\d{4}$/, '').trim();
                return dIso === mmdd || dLong === longNoYear;
            });
        }

        if (entry) {
            console.log(`[Calendar Engine] Found match for ${iso} in ${fileName}`);
            return entry;
        } else {
            console.warn(`[Calendar Engine] No match for ${iso} in ${fileName} - using index 0 fallback.`);
            return data[0];
        }
    }
}

window.CalendarEngine = CalendarEngine;