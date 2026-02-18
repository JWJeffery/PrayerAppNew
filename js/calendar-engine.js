/**
 * CALENDAR ENGINE MODULE - Audited Class Version
 */
class CalendarEngine {
    static currentDate = new Date();
    static seasonalCache = {};
    static bcpPropers = null;

    static SEASON_RANGES = [
        { start: new Date("2025-11-30"), end: new Date("2025-12-24"), season: "advent", file: "advent.json" },
        { start: new Date("2025-12-25"), end: new Date("2026-01-05"), season: "christmas", file: "christmas.json" },
        { start: new Date("2026-01-06"), end: new Date("2026-02-16"), season: "epiphany", file: "epiphany.json" },
        { start: new Date("2026-02-17"), end: new Date("2026-02-17"), season: "ordinary", file: "ordinary1.json" },
        { start: new Date("2026-02-18"), end: new Date("2026-04-04"), season: "lent", file: "lent.json" },
        { start: new Date("2026-04-05"), end: new Date("2026-05-23"), season: "easter", file: "easter.json" },
        { start: new Date("2026-05-24"), end: new Date("2026-11-28"), season: "ordinary", file: "ordinary1.json" },
        { start: new Date("2026-11-29"), end: new Date("2026-12-24"), season: "advent", file: "advent.json" }
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
        // Simple 2026 Logic for now: Advent Sunday 2026 starts Year 1
        const advent2026 = new Date("2026-11-29");
        return (date >= advent2026) ? 1 : 2;
    }

    static getSeasonAndFile(targetDate) {
        const date = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        for (const range of this.SEASON_RANGES) {
            if (date >= range.start && date <= range.end) {
                let file = range.file;
                if (range.season === "ordinary") file = this.getOrdinaryFile(date);
                return { season: range.season, file: file };
            }
        }
        return { season: "ordinary", file: "ordinary1.json" };
    }

    static getOrdinaryFile(date) {
        const mmdd = (date.getMonth() + 1) * 100 + date.getDate();
        if (mmdd >= 525 && mmdd <= 731) return "ordinary1.json";
        if (mmdd >= 801 && mmdd <= 930) return "ordinary2.json";
        if (mmdd >= 1001 && mmdd <= 1128) return "ordinary3.json";
        return "ordinary1.json";
    }

    static async fetchLectionaryData(targetDate = this.currentDate) {
        const { file } = this.getSeasonAndFile(targetDate);
        if (this.seasonalCache[file]) return this.findEntry(this.seasonalCache[file], targetDate);
        
        try {
            const response = await fetch(`data/season/${file}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            this.seasonalCache[file] = data;
            return this.findEntry(data, targetDate);
        } catch (err) {
            console.error(`[Calendar Engine] Error:`, err);
            return { title: "Error loading data" };
        }
    }

    static findEntry(data, date) {
        const iso = this.formatDateISO(date);
        const long = this.formatDateForLookup(date);
        return data.find(d => d.date === iso || d.date === long) || data[0];
    }
}

// Expose to window for index.html access
window.CalendarEngine = CalendarEngine;