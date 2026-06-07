(function () {
    "use strict";

    const STORE_KEYS = [
        "universalOfficeSettings",
        "universalOffice.entry.default.v1",
        "universalOffice.userProfile.v1"
    ];

    const wait = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));
    const $ = selector => document.querySelector(selector);
    const $$ = selector => Array.from(document.querySelectorAll(selector));

    function assert(condition, message) {
        if (!condition) throw new Error(message);
    }

    function isVisible(element) {
        if (!element) return false;
        if (element.hidden) return false;
        const style = getComputedStyle(element);
        return style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0" &&
            (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
    }

    function text(selector) {
        return ($(selector)?.textContent || "").replace(/\s+/g, " ").trim();
    }

    async function waitFor(predicate, timeoutMs = 8000, intervalMs = 60) {
        const start = Date.now();

        while (Date.now() - start < timeoutMs) {
            try {
                if (predicate()) return true;
            } catch {
                // keep waiting
            }

            await wait(intervalMs);
        }

        throw new Error("Timed out waiting for expected Book of Needs state.");
    }

    function backupLocalStorage() {
        const snapshot = new Map();

        for (const key of STORE_KEYS) {
            snapshot.set(key, localStorage.getItem(key));
        }

        return snapshot;
    }

    function restoreLocalStorage(snapshot) {
        for (const key of STORE_KEYS) {
            const value = snapshot.get(key);

            if (value === null || typeof value === "undefined") {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, value);
            }
        }
    }

    function bookNeedsSection() {
        return $("#individual-prayers-section");
    }

    function dailyOfficeSection() {
        return $("#daily-office-section");
    }

    function prayerList() {
        return $("#prayer-select-list");
    }

    function prayerOption(id) {
        return $(`.prayer-option[data-value="${id}"]`);
    }

    function isPrayerOptionVisible(id) {
        const option = prayerOption(id);
        return Boolean(option && !option.hidden && option.getAttribute("aria-hidden") !== "true");
    }

    function isPrayerOptionHidden(id) {
        const option = prayerOption(id);
        return Boolean(option && (option.hidden || option.getAttribute("aria-hidden") === "true"));
    }

    function visiblePrayerCount() {
        return $$(".prayer-option").filter(option => !option.hidden && option.getAttribute("aria-hidden") !== "true").length;
    }

    async function waitForBookOfNeedsContext(context) {
        await waitFor(() => {
            const section = bookNeedsSection();
            const list = prayerList();

            return isVisible(section) &&
                list &&
                list.dataset.activeTradition === context &&
                text("#book-needs-context-label").length > 0;
        });

        return {
            context: prayerList()?.dataset.activeTradition || "",
            label: text("#book-needs-context-label"),
            note: text("#book-needs-scope-note"),
            returnText: text("#book-needs-return-button"),
            visibleCount: visiblePrayerCount()
        };
    }

    async function enterOfficeMode(mode, expectedHeader) {
        assert(typeof window.selectMode === "function", "Missing global selectMode(). Run this on the Universal Office root page.");

        await window.selectMode(mode);

        await waitFor(() => {
            const action = $("#office-context-actions .office-context-action");
            return isVisible(dailyOfficeSection()) &&
                isVisible(action) &&
                text("#office-mode-title").includes(expectedHeader);
        }, 12000);

        return text("#office-mode-title");
    }

    async function openBookOfNeedsFromOffice(mode, expectedOfficeHeader, expectedContext) {
        assert(typeof window.openBookOfNeedsForActiveOffice === "function", "Missing openBookOfNeedsForActiveOffice().");

        await enterOfficeMode(mode, expectedOfficeHeader);

        const button = $("#office-context-actions .office-context-action");
        assert(button, `${expectedOfficeHeader}: missing Book of Needs office action.`);
        assert(/Book of Needs/i.test(button.textContent || ""), `${expectedOfficeHeader}: office action is not Book of Needs.`);

        button.click();

        const state = await waitForBookOfNeedsContext(expectedContext);

        assert(window._bookOfNeedsReturnMode === mode, `${expectedOfficeHeader}: return mode was ${window._bookOfNeedsReturnMode || "unset"}, expected ${mode}.`);
        assert(window._bookOfNeedsContextTradition === expectedContext, `${expectedOfficeHeader}: Book of Needs context was ${window._bookOfNeedsContextTradition || "unset"}, expected ${expectedContext}.`);
        assert(state.returnText === "Back to Office", `${expectedOfficeHeader}: expected Back to Office, got ${state.returnText || "blank"}.`);

        return state;
    }

    async function clickBookNeedsBackAndWaitForOffice(expectedHeader) {
        const button = $("#book-needs-return-button");
        assert(button, "Missing Book of Needs return button.");

        button.click();

        await waitFor(() => {
            return isVisible(dailyOfficeSection()) &&
                !isVisible(bookNeedsSection()) &&
                text("#office-mode-title").includes(expectedHeader);
        }, 12000);

        return `returned to ${text("#office-mode-title")}`;
    }

    async function verifyUniversalBookOfNeedsPath() {
        assert(typeof window.openUniversalBookOfNeeds === "function", "Missing openUniversalBookOfNeeds().");
        assert(typeof window.backFromBookOfNeeds === "function", "Missing backFromBookOfNeeds().");

        window.openUniversalBookOfNeeds();

        const state = await waitForBookOfNeedsContext("UNIVERSAL");

        assert(state.label === "Universal Office Selector", `Universal Book of Needs label was ${state.label || "blank"}.`);
        assert(state.returnText === "Back to Modes", `Universal Book of Needs return text was ${state.returnText || "blank"}.`);
        assert(state.visibleCount >= 20, `Universal Book of Needs expected broad all-prayers access, found ${state.visibleCount} visible prayers.`);
        assert(isPrayerOptionVisible("prayer-humble-access"), "Universal Book of Needs should show Anglican prayer-humble-access.");
        assert(isPrayerOptionVisible("minister-journey-orthodox"), "Universal Book of Needs should show Orthodox minister-journey-orthodox.");
        assert(isPrayerOptionVisible("thanksgiving-aquinas"), "Universal Book of Needs should show Latin thanksgiving-aquinas.");

        $("#book-needs-return-button").click();

        await waitFor(() => {
            return isVisible($("#mode-selection")) &&
                !isVisible(bookNeedsSection()) &&
                !document.body.classList.contains("office-active");
        }, 8000);

        return `Universal context showed ${state.visibleCount} visible prayers and Back returned to selector`;
    }

    async function verifyDailyOfficeBookOfNeedsPath() {
        const state = await openBookOfNeedsFromOffice("daily", "The Episcopal Church", "ANG");

        assert(state.label === "The Episcopal Church", `Daily Office Book of Needs label was ${state.label || "blank"}.`);
        assert(state.visibleCount > 0, "Daily Office Book of Needs should show at least one Anglican/Episcopal prayer.");
        assert(isPrayerOptionVisible("prayer-humble-access"), "Daily Office Book of Needs should show prayer-humble-access.");
        assert(isPrayerOptionHidden("thanksgiving-aquinas"), "Daily Office Book of Needs should hide Latin thanksgiving-aquinas.");
        assert(isPrayerOptionHidden("minister-journey-orthodox"), "Daily Office Book of Needs should hide Orthodox minister-journey-orthodox.");

        const backDetail = await clickBookNeedsBackAndWaitForOffice("The Episcopal Church");

        return `ANG context showed ${state.visibleCount} visible prayers and ${backDetail}`;
    }

    async function verifyHorologionBookOfNeedsPath() {
        const state = await openBookOfNeedsFromOffice("horologion", "Eastern Orthodoxy", "EO");

        assert(state.label === "Eastern Orthodoxy", `Horologion Book of Needs label was ${state.label || "blank"}.`);
        assert(state.visibleCount > 0, "Horologion Book of Needs should show at least one Eastern Orthodox prayer.");
        assert(isPrayerOptionVisible("minister-journey-orthodox"), "Horologion Book of Needs should show minister-journey-orthodox.");
        assert(isPrayerOptionVisible("vesting-orthodox-full"), "Horologion Book of Needs should show vesting-orthodox-full.");
        assert(isPrayerOptionHidden("prayer-humble-access"), "Horologion Book of Needs should hide Anglican prayer-humble-access.");
        assert(isPrayerOptionHidden("thanksgiving-aquinas"), "Horologion Book of Needs should hide Latin thanksgiving-aquinas.");

        const backDetail = await clickBookNeedsBackAndWaitForOffice("Eastern Orthodoxy");

        return `EO context showed ${state.visibleCount} visible prayers and ${backDetail}`;
    }

    async function runBookOfNeedsRoutingSweep(options = {}) {
        const restoreState = options.restoreState !== false;
        const snapshot = backupLocalStorage();
        const results = [];

        console.info("[Book Needs QC] Starting Book of Needs routing sweep…");

        async function runCheck(check, fn) {
            const started = performance.now();

            try {
                const detail = await fn();
                results.push({
                    check,
                    pass: true,
                    ms: Math.round(performance.now() - started),
                    detail: detail || "OK"
                });
            } catch (error) {
                results.push({
                    check,
                    pass: false,
                    ms: Math.round(performance.now() - started),
                    detail: error?.message || String(error)
                });
            }
        }

        try {
            assert(document.getElementById("mode-selection"), "This sweep must be run from the Universal Office root page.");
            assert(document.getElementById("individual-prayers-section"), "Missing Book of Needs section.");
            assert(document.getElementById("prayer-select-list"), "Missing Book of Needs prayer list.");

            await runCheck("Universal selector: Book of Needs shows all prayers and Back returns to selector", verifyUniversalBookOfNeedsPath);
            await runCheck("Daily Office: Book of Needs filters Anglican/Episcopal and Back returns to office", verifyDailyOfficeBookOfNeedsPath);
            await runCheck("Horologion: Book of Needs filters Eastern Orthodox and Back returns to office", verifyHorologionBookOfNeedsPath);
        } finally {
            if (restoreState) restoreLocalStorage(snapshot);
        }

        const failed = results.filter(result => !result.pass);

        console.table(results);

        if (failed.length) {
            console.error(`[Book Needs QC] FAIL: ${failed.length} failing check(s).`, failed);
        } else {
            console.info(`[Book Needs QC] PASS: ${results.length} check(s) passed.`);
        }

        window.__lastBookOfNeedsRoutingSweep = {
            passed: failed.length === 0,
            failed,
            results,
            restoreState
        };

        return window.__lastBookOfNeedsRoutingSweep;
    }

    window.runBookOfNeedsRoutingSweep = runBookOfNeedsRoutingSweep;

    runBookOfNeedsRoutingSweep().catch(error => {
        console.error("[Book Needs QC] Fatal routing sweep error:", error);
        window.__lastBookOfNeedsRoutingSweep = {
            passed: false,
            failed: [{ check: "fatal", pass: false, detail: error.message || String(error) }],
            results: [],
            restoreState: true
        };
    });
})();
