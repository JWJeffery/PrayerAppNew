(function () {
    "use strict";

    const STORE_KEYS = [
        "universalOfficeSettings"
    ];

    const wait = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));
    const $ = selector => document.querySelector(selector);
    const $$ = selector => Array.from(document.querySelectorAll(selector));

    function assert(condition, message) {
        if (!condition) throw new Error(message);
    }

    function cssEscape(value) {
        if (window.CSS?.escape) return CSS.escape(String(value));
        return String(value).replace(/"/g, '\\"');
    }

    function isVisible(element) {
        if (!element) return false;
        const style = getComputedStyle(element);
        return style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0" &&
            (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
    }

    function textContent(selector) {
        return ($(selector)?.textContent || "").trim();
    }

    function officeText() {
        return textContent("#office-display").replace(/\s+/g, " ").trim();
    }

    async function waitFor(predicate, timeoutMs = 7000, intervalMs = 60) {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            try {
                if (predicate()) return true;
            } catch {
                // keep waiting
            }
            await wait(intervalMs);
        }
        throw new Error("Timed out waiting for expected page state.");
    }

    function isoDate(offsetDays = 0) {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        return [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0"),
            String(d.getDate()).padStart(2, "0")
        ].join("-");
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

    function setInputValue(element, value) {
        assert(element, "Missing input element.");
        element.value = value;
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function expectedDailyOffice(now = new Date()) {
        const hour = now.getHours();
        if (hour >= 5 && hour < 11) return "morning-office";
        if (hour >= 11 && hour < 15) return "noonday-office";
        if (hour >= 15 && hour < 21) return "evening-office";
        return "compline-office";
    }

    function expectedHorologionOffice(now = new Date()) {
        const hour = now.getHours();
        if (hour >= 0 && hour < 3) return "midnight-office";
        if (hour >= 3 && hour < 5) return "orthros";
        if (hour >= 5 && hour < 7) return "first-hour";
        if (hour >= 7 && hour < 11) return "third-hour";
        if (hour >= 11 && hour < 15) return "sixth-hour";
        if (hour >= 15 && hour < 17) return "ninth-hour";
        if (hour >= 17 && hour < 21) return "vespers";
        return "small-compline";
    }

    function expectedEthiopianHour(now = new Date()) {
        if (typeof window.getEthiopianHourInfo === "function") {
            const info = window.getEthiopianHourInfo();
            if (info?.hourId) return info.hourId;
        }

        const minutes = now.getHours() * 60 + now.getMinutes();
        const hourMap = [
            { from: 6 * 60, to: 9 * 60, value: "eth-nigatu-hour-text" },
            { from: 9 * 60, to: 12 * 60, value: "eth-meserk-hour-text" },
            { from: 12 * 60, to: 15 * 60, value: "eth-lika-hour-text" },
            { from: 15 * 60, to: 17 * 60, value: "eth-terk-hour-text" },
            { from: 17 * 60, to: 18 * 60, value: "eth-serkh-hour-text" },
            { from: 18 * 60, to: 21 * 60, value: "eth-nome-hour-text" },
            { from: 21 * 60, to: 24 * 60, value: "eth-hour-7" },
            { from: 0 * 60, to: 3 * 60, value: "eth-lelit-hour-text" },
            { from: 3 * 60, to: 6 * 60, value: "eth-mahlet-hour-text" }
        ];
        return hourMap.find(item => minutes >= item.from && minutes < item.to)?.value || "eth-nigatu-hour-text";
    }

    function expectedEastSyriacHour(now = new Date()) {
        if (typeof window.getEastSyriacHourInfo === "function") {
            const info = window.getEastSyriacHourInfo();
            if (info?.value) return info.value;
        }

        const minutes = now.getHours() * 60 + now.getMinutes();
        const hourMap = [
            { from: 6 * 60, to: 9 * 60, value: "sapra" },
            { from: 9 * 60, to: 12 * 60, value: "qutaa" },
            { from: 12 * 60, to: 15 * 60, value: "endana" },
            { from: 15 * 60, to: 18 * 60, value: "dtsha-sain" },
            { from: 18 * 60, to: 21 * 60, value: "ramsha" },
            { from: 21 * 60, to: 24 * 60, value: "lelya" },
            { from: 0 * 60, to: 3 * 60, value: "lelya" },
            { from: 3 * 60, to: 6 * 60, value: "subaa" }
        ];
        return hourMap.find(item => minutes >= item.from && minutes < item.to)?.value || "sapra";
    }

    const MODE_CASES = [
        {
            label: "Daily Office",
            selectModeArg: "daily",
            navKey: "daily",
            panelId: "settings-panel",
            expectedActive: expectedDailyOffice,
            alternateValue: active => active === "morning-office" ? "evening-office" : "morning-office"
        },
        {
            label: "Ethiopian Sa'atat",
            selectModeArg: "ethiopian-saatat",
            navKey: "ethiopian",
            panelId: "ethiopian-settings",
            expectedActive: expectedEthiopianHour,
            alternateValue: active => active === "eth-nigatu-hour-text" ? "eth-lika-hour-text" : "eth-nigatu-hour-text"
        },
        {
            label: "Church of the East",
            selectModeArg: "east-syriac",
            navKey: "eastSyriac",
            panelId: "east-syriac-settings",
            expectedActive: expectedEastSyriacHour,
            alternateValue: active => active === "sapra" ? "ramsha" : "sapra"
        },
        {
            label: "Horologion",
            selectModeArg: "horologion",
            navKey: "horologion",
            panelId: "generic-settings",
            expectedActive: expectedHorologionOffice,
            alternateValue: active => active === "vespers" ? "orthros" : "vespers"
        }
    ];

    function activePanel(test) {
        return document.getElementById(test.panelId);
    }

    function activeNav(test) {
        return document.querySelector(`.shared-office-nav[data-shared-office-nav="${test.navKey}"]`);
    }

    function navDateInput(test) {
        return activeNav(test)?.querySelector('.shared-office-nav-date-picker input[type="date"]');
    }

    function selectedNavValue(test) {
        return activeNav(test)?.querySelector(`input[name="shared-office-nav-${test.navKey}"]:checked`)?.value || "";
    }

    function findNavButton(test, label) {
        return Array.from(activeNav(test)?.querySelectorAll(".shared-office-nav-actions button") || [])
            .find(button => button.textContent.trim().toLowerCase() === label.toLowerCase());
    }

    async function enterMode(test) {
        assert(typeof window.selectMode === "function", "Missing global selectMode(). Run this on the Universal Office root page.");
        await window.selectMode(test.selectModeArg);

        await waitFor(() => {
            const panel = activePanel(test);
            const nav = activeNav(test);
            const dateInput = navDateInput(test);
            return panel &&
                nav &&
                dateInput &&
                isVisible(panel) &&
                isVisible(nav) &&
                !panel.classList.contains("mode-hidden") &&
                !panel.classList.contains("sidebar-hidden") &&
                !document.getElementById("main-content")?.classList.contains("sidebar-hidden") &&
                !/loading/i.test(nav.textContent || "") &&
                officeText().length > 60;
        }, 10000);

        return activeNav(test);
    }

    async function verifyModeDefaults(test) {
        await enterMode(test);

        const panel = activePanel(test);
        assert(panel, `${test.label}: missing active sidebar panel.`);
        assert(!panel.classList.contains("mode-hidden"), `${test.label}: sidebar panel is mode-hidden.`);
        assert(!panel.classList.contains("sidebar-hidden"), `${test.label}: sidebar panel defaulted closed.`);
        assert(isVisible(panel), `${test.label}: sidebar panel is not visible.`);

        const dateInput = navDateInput(test);
        assert(dateInput?.value === isoDate(0), `${test.label}: expected today's date ${isoDate(0)}, got ${dateInput?.value || "none"}.`);

        const expected = test.expectedActive();
        const active = selectedNavValue(test);
        assert(active === expected, `${test.label}: expected current local-time selection ${expected}, got ${active || "none"}.`);

        // The default-open contract is already proved by the visible/not-hidden
        // assertions above. Do not close and reopen the sidebar inside this
        // default-state check; chained browser sweeps can be in a transient
        // app-shell state, and sidebar toggle behavior is not part of this check.
        return `${test.label}: today=${dateInput.value}, active=${active}, sidebar=open`;
    }

    async function waitForDateAndOfficeContent(test, expectedIso) {
        await waitFor(() => navDateInput(test)?.value === expectedIso, 7000);
        await waitFor(() => {
            const text = officeText();
            return text.length > 60 && !/loading|preparing/i.test(text);
        }, 10000);
    }

    async function verifyDateControls(test) {
        await enterMode(test);

        const prev = findNavButton(test, "Prev");
        const today = findNavButton(test, "Today");
        const next = findNavButton(test, "Next");
        assert(prev && today && next, `${test.label}: missing Prev/Today/Next buttons.`);

        prev.click();
        await waitForDateAndOfficeContent(test, isoDate(-1));

        next.click();
        await waitForDateAndOfficeContent(test, isoDate(0));

        setInputValue(navDateInput(test), isoDate(-2));
        await waitForDateAndOfficeContent(test, isoDate(-2));

        today.click();
        await waitForDateAndOfficeContent(test, isoDate(0));

        return `${test.label}: Prev/Next/manual date/Today controls passed`;
    }

    async function verifyHourSelectionChangesContent(test) {
        await enterMode(test);

        const beforeActive = selectedNavValue(test);
        const alternate = test.alternateValue(beforeActive);
        const beforeText = officeText();

        const radio = activeNav(test)?.querySelector(`input[value="${cssEscape(alternate)}"]`);
        assert(radio, `${test.label}: missing alternate navigation option ${alternate}.`);

        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));

        await waitFor(() => selectedNavValue(test) === alternate, 5000);
        await waitFor(() => {
            const afterText = officeText();
            return afterText.length > 60 && afterText !== beforeText;
        }, 10000);

        return `${test.label}: changed ${beforeActive} -> ${alternate} and rendered different content`;
    }

    async function runOfficeNavigationFeatureSweep(options = {}) {
        const restoreState = options.restoreState !== false;
        const snapshot = backupLocalStorage();
        const results = [];

        console.info("[Office Nav QC] Starting office navigation feature sweep…");

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
            assert(document.getElementById("mode-selection"), "This sweep must be run from the Universal Office root page, not a tool sub-route.");

            for (const test of MODE_CASES) {
                await runCheck(`${test.label}: defaults to today/current office and sidebar open`, () => verifyModeDefaults(test));
                await runCheck(`${test.label}: shared date controls work`, () => verifyDateControls(test));
                await runCheck(`${test.label}: hour/office selector changes rendered content`, () => verifyHourSelectionChangesContent(test));
            }
        } finally {
            if (restoreState) restoreLocalStorage(snapshot);
        }

        const failed = results.filter(result => !result.pass);

        console.table(results);
        if (failed.length) {
            console.error(`[Office Nav QC] FAIL: ${failed.length} failing check(s).`, failed);
        } else {
            console.info(`[Office Nav QC] PASS: ${results.length} check(s) passed.`);
        }

        window.__lastOfficeNavigationFeatureSweep = {
            passed: failed.length === 0,
            failed,
            results,
            restoreState
        };

        return window.__lastOfficeNavigationFeatureSweep;
    }

    window.runOfficeNavigationFeatureSweep = runOfficeNavigationFeatureSweep;

    runOfficeNavigationFeatureSweep().catch(error => {
        console.error("[Office Nav QC] Fatal feature sweep error:", error);
        window.__lastOfficeNavigationFeatureSweep = {
            passed: false,
            failed: [{ check: "fatal", pass: false, detail: error.message || String(error) }],
            results: [],
            restoreState: true
        };
    });
})();
