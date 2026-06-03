(function () {
    "use strict";

    const STORE_KEY = "uo.bibleBrowser.readingPlan.v1";
    const DAYS_IN_PLAN = 365;

    const CHAPTER_COUNTS = {
        genesis: 50, exodus: 40, leviticus: 27, numbers: 36, deuteronomy: 34,
        joshua: 24, judges: 21, ruth: 4, "1samuel": 31, "2samuel": 24,
        "1kings": 22, "2kings": 25, "1chronicles": 29, "2chronicles": 36,
        ezra: 10, nehemiah: 13, esther: 10, job: 42, psalms: 150,
        proverbs: 31, ecclesiastes: 12, songofsolomon: 8, isaiah: 66,
        jeremiah: 52, lamentations: 5, ezekiel: 48, daniel: 12,
        hosea: 14, joel: 3, amos: 9, obadiah: 1, jonah: 4, micah: 7,
        nahum: 3, habakkuk: 3, zephaniah: 3, haggai: 2, zechariah: 14,
        malachi: 4,

        tobit: 14, judith: 16, wisdom: 19, sirach: 51, baruch: 6,
        "1maccabees": 16, "2maccabees": 15, "3maccabees": 7, "4maccabees": 18,

        matthew: 28, mark: 16, luke: 24, john: 21, acts: 28, romans: 16,
        "1corinthians": 16, "2corinthians": 13, galatians: 6, ephesians: 6,
        philippians: 4, colossians: 4, "1thessalonians": 5, "2thessalonians": 3,
        "1timothy": 6, "2timothy": 4, titus: 3, philemon: 1, hebrews: 13,
        james: 5, "1peter": 5, "2peter": 3, "1john": 5, "2john": 1,
        "3john": 1, jude: 1, revelation: 22
    };

    const BROAD_CHRONOLOGICAL_ORDER = [
        "genesis", "job",
        "exodus", "leviticus", "numbers", "deuteronomy",
        "joshua", "judges", "ruth",
        "1samuel", "2samuel", "1chronicles", "psalms",
        "1kings", "proverbs", "ecclesiastes", "songofsolomon",
        "2chronicles", "2kings",
        "jonah", "amos", "hosea", "micah", "isaiah", "nahum",
        "zephaniah", "habakkuk", "jeremiah", "lamentations",
        "obadiah", "ezekiel", "daniel",
        "tobit", "judith", "baruch", "wisdom", "sirach",
        "ezra", "haggai", "zechariah", "esther", "nehemiah", "malachi",
        "1maccabees", "2maccabees", "3maccabees", "4maccabees",
        "luke", "matthew", "mark", "john", "acts",
        "james", "galatians", "1thessalonians", "2thessalonians",
        "1corinthians", "2corinthians", "romans",
        "ephesians", "philippians", "colossians", "philemon",
        "1timothy", "titus", "2timothy",
        "hebrews", "1peter", "2peter",
        "1john", "2john", "3john", "jude", "revelation"
    ];

    function $(id) {
        return document.getElementById(id);
    }

    function todayIso() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    }

    function parseLocalDate(value) {
        if (!value) return null;
        const [year, month, day] = String(value).split("-").map(Number);
        if (!year || !month || !day) return null;
        return new Date(year, month - 1, day);
    }

    function addDaysIso(value, days) {
        const date = parseLocalDate(value) || parseLocalDate(todayIso());
        date.setDate(date.getDate() + Number(days || 0));
        return date.toISOString().slice(0, 10);
    }

    function diffDays(startIso, activeIso) {
        const start = parseLocalDate(startIso);
        const active = parseLocalDate(activeIso);
        if (!start || !active) return 0;
        const ms = Date.UTC(active.getFullYear(), active.getMonth(), active.getDate()) -
            Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
        return Math.floor(ms / 86400000);
    }

    function loadState() {
        try {
            const state = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
            return {
                startDate: state.startDate || todayIso(),
                activeDate: state.activeDate || todayIso(),
                completedDays: state.completedDays && typeof state.completedDays === "object" ? state.completedDays : {}
            };
        } catch {
            return { startDate: todayIso(), activeDate: todayIso(), completedDays: {} };
        }
    }

    function saveState(state) {
        localStorage.setItem(STORE_KEY, JSON.stringify({
            startDate: state.startDate || todayIso(),
            activeDate: state.activeDate || todayIso(),
            completedDays: state.completedDays && typeof state.completedDays === "object" ? state.completedDays : {}
        }));
    }

    function getBookName(bookKey) {
        const books = window.UniversalOfficeBibleReferenceParser?.BIBLE_BOOKS || [];
        return books.find(book => book.key === bookKey)?.name || bookKey;
    }

    function buildChapterUnits() {
        const availableKeys = new Set((window.UniversalOfficeBibleReferenceParser?.BIBLE_BOOKS || []).map(book => book.key));
        const units = [];

        for (const bookKey of BROAD_CHRONOLOGICAL_ORDER) {
            if (!availableKeys.has(bookKey)) continue;
            const count = CHAPTER_COUNTS[bookKey] || 0;
            for (let chapter = 1; chapter <= count; chapter += 1) {
                units.push({ bookKey, bookName: getBookName(bookKey), chapter });
            }
        }

        return units;
    }

    function collapseUnitsToReferences(units) {
        const refs = [];
        let group = null;

        function flush() {
            if (!group) return;
            refs.push(group.start === group.end
                ? `${group.bookName} ${group.start}`
                : `${group.bookName} ${group.start}-${group.end}`);
            group = null;
        }

        for (const unit of units) {
            if (!group) {
                group = { bookKey: unit.bookKey, bookName: unit.bookName, start: unit.chapter, end: unit.chapter };
                continue;
            }

            if (group.bookKey === unit.bookKey && unit.chapter === group.end + 1) {
                group.end = unit.chapter;
            } else {
                flush();
                group = { bookKey: unit.bookKey, bookName: unit.bookName, start: unit.chapter, end: unit.chapter };
            }
        }

        flush();
        return refs;
    }

    function buildPlan() {
        const units = buildChapterUnits();
        const plan = [];

        for (let day = 1; day <= DAYS_IN_PLAN; day += 1) {
            const start = Math.floor((day - 1) * units.length / DAYS_IN_PLAN);
            const end = Math.max(start + 1, Math.floor(day * units.length / DAYS_IN_PLAN));
            const references = collapseUnitsToReferences(units.slice(start, end));
            plan.push({ day, references, referenceText: references.join("; ") });
        }

        return plan;
    }

    function getPlanDay(startDate, activeDate) {
        const offset = diffDays(startDate, activeDate);
        return Math.max(1, Math.min(DAYS_IN_PLAN, offset + 1));
    }

    function completedCount(state) {
        return Object.values(state.completedDays || {}).filter(Boolean).length;
    }

    function renderReadingPlan() {
        const startInput = $("bible-plan-start-date");
        const activeInput = $("bible-plan-active-date");
        const status = $("bible-plan-status");
        const progress = $("bible-plan-progress");
        const reading = $("bible-plan-reading");
        const toggle = $("bible-plan-toggle-complete");
        if (!startInput || !activeInput || !status || !progress || !reading) return;

        const state = loadState();
        const startDate = startInput.value || state.startDate || todayIso();
        const activeDate = activeInput.value || state.activeDate || todayIso();
        const day = getPlanDay(startDate, activeDate);
        const plan = buildPlan();
        const item = plan[day - 1];
        const completedDays = state.completedDays || {};
        const isComplete = !!completedDays[String(day)];

        startInput.value = startDate;
        activeInput.value = activeDate;

        const nextState = { startDate, activeDate, completedDays };
        saveState(nextState);

        status.textContent = `Day ${day} of ${DAYS_IN_PLAN} · ${activeDate}${isComplete ? " · Complete" : ""}`;
        progress.textContent = `${completedCount(nextState)} of ${DAYS_IN_PLAN} days complete.`;

        reading.innerHTML = `
            <div class="bible-plan-reading-title">Today’s Reading</div>
            <div class="bible-plan-reading-ref">${item.referenceText}</div>
            <div class="bible-plan-reading-note">This chronological plan begins on the start date you choose. Mark a day complete when you have finished the reading.</div>
        `;

        if (toggle) {
            toggle.textContent = isComplete ? "Mark Incomplete" : "Mark Complete";
            toggle.setAttribute("aria-pressed", isComplete ? "true" : "false");
        }
    }

    function openCurrentReading() {
        const state = loadState();
        const startDate = $("bible-plan-start-date")?.value || state.startDate || todayIso();
        const activeDate = $("bible-plan-active-date")?.value || state.activeDate || todayIso();
        const day = getPlanDay(startDate, activeDate);
        const item = buildPlan()[day - 1];
        const input = $("bible-reference-input");
        if (!input || !item?.referenceText) return;

        input.value = item.referenceText;
        $("bible-reference-go")?.click();
    }

    function toggleCurrentDayComplete() {
        const state = loadState();
        const startDate = $("bible-plan-start-date")?.value || state.startDate || todayIso();
        const activeDate = $("bible-plan-active-date")?.value || state.activeDate || todayIso();
        const day = getPlanDay(startDate, activeDate);
        const completedDays = { ...(state.completedDays || {}) };

        if (completedDays[String(day)]) {
            delete completedDays[String(day)];
        } else {
            completedDays[String(day)] = true;
        }

        saveState({ startDate, activeDate, completedDays });
        renderReadingPlan();
    }

    function shiftActiveDay(delta) {
        const activeInput = $("bible-plan-active-date");
        if (!activeInput) return;
        activeInput.value = addDaysIso(activeInput.value || todayIso(), delta);
        renderReadingPlan();
    }

    function initializeReadingPlan() {
        const startInput = $("bible-plan-start-date");
        const activeInput = $("bible-plan-active-date");
        if (!startInput || !activeInput) return;

        const state = loadState();
        startInput.value = state.startDate || todayIso();
        activeInput.value = state.activeDate || todayIso();

        startInput.addEventListener("change", renderReadingPlan);
        activeInput.addEventListener("change", renderReadingPlan);
        $("bible-plan-open-reading")?.addEventListener("click", openCurrentReading);
        $("bible-plan-toggle-complete")?.addEventListener("click", toggleCurrentDayComplete);
        $("bible-plan-prev-day")?.addEventListener("click", () => shiftActiveDay(-1));
        $("bible-plan-next-day")?.addEventListener("click", () => shiftActiveDay(1));

        renderReadingPlan();
    }

    window.UniversalOfficeBibleReadingPlans = {
        buildPlan,
        getPlanDay,
        openCurrentReading,
        renderReadingPlan,
        toggleCurrentDayComplete
    };

    window.addEventListener("DOMContentLoaded", initializeReadingPlan);
})();
