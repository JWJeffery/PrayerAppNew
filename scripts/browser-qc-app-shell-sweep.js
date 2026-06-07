(function () {
    "use strict";

    const SWEEP_TIMEOUT_MS = 90000;

    const wait = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));
    const $ = selector => document.querySelector(selector);

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

    function setInputValue(input, value) {
        assert(input, "Missing input while setting app-shell QC value.");

        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) {
            setter.call(input, value);
        } else {
            input.value = value;
        }

        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function activeSharedDateInput() {
        const visibleInputs = Array.from(document.querySelectorAll(".shared-office-nav-date-picker input, input[type=\"date\"]"))
            .filter(input => isVisible(input));

        return visibleInputs[0] || document.getElementById("shared-office-date-input") || document.getElementById("date-picker");
    }

    async function waitForOfficeTextReady(timeoutMs = 20000) {
        await waitFor(() => {
            const officeText = document.getElementById("office-display")?.textContent || "";
            return officeText.trim().length > 80 && !/Loading Office|Fetching readings|Data still loading/i.test(officeText);
        }, timeoutMs);
    }

    async function setActiveOfficeDate(isoDate) {
        const input = activeSharedDateInput();
        setInputValue(input, isoDate);

        await waitFor(() => activeSharedDateInput()?.value === isoDate, 8000);
        await waitForOfficeTextReady();
    }

    async function waitFor(predicate, timeoutMs = 12000, intervalMs = 80) {
        const start = Date.now();

        while (Date.now() - start < timeoutMs) {
            try {
                if (predicate()) return true;
            } catch {
                // keep waiting
            }

            await wait(intervalMs);
        }

        throw new Error("Timed out waiting for expected app-shell QC state.");
    }

    function resetPriorSweepResult(resultName) {
        try {
            delete window[resultName];
        } catch {
            window[resultName] = undefined;
        }
    }

    function loadBrowserSweepScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `${src}?appShellQc=${Date.now()}-${Math.random().toString(16).slice(2)}`;
            script.async = true;
            script.onload = () => resolve(script.src);
            script.onerror = () => reject(new Error(`Unable to load ${src}`));
            document.head.appendChild(script);
        });
    }

    async function waitForSweepResult(resultName, timeoutMs = SWEEP_TIMEOUT_MS) {
        const start = Date.now();

        while (Date.now() - start < timeoutMs) {
            const result = window[resultName];

            if (result && Array.isArray(result.results)) {
                return result;
            }

            await wait(150);
        }

        throw new Error(`Timed out waiting for ${resultName}.`);
    }

    async function runExternalSweep(label, src, resultName) {
        resetPriorSweepResult(resultName);

        await loadBrowserSweepScript(src);
        const result = await waitForSweepResult(resultName);

        assert(result.passed === true, `${label} failed: ${JSON.stringify(result.failed || [])}`);

        return `${label}: ${result.results.length} check(s) passed`;
    }

    async function verifyCommemorationScopeAndReadability() {
        assert(typeof window.selectMode === "function", "Missing global selectMode(). Run this from the Universal Office root page.");
        assert(typeof window.normalizeCommemorationCardReadability === "function", "Missing commemoration readability normalizer.");

        await window.selectMode("daily");
        await waitForOfficeTextReady();

        const dailySection = $(".saint-section");
        const dailyDisplay = $("#saint-display");

        assert(dailySection, "Missing commemoration section.");
        assert(dailyDisplay, "Missing commemoration display.");

        dailySection.hidden = false;
        dailySection.setAttribute("aria-hidden", "false");
        dailySection.classList.remove("tradition-commemorations-hidden");

        dailyDisplay.innerHTML = "<div><span>ANGSaint App Shell Sentinel</span></div>";
        window.normalizeCommemorationCardReadability();

        const normalizedText = dailyDisplay.textContent.replace(/\s+/g, " ").trim();
        const dailyCards = Array.from(dailyDisplay.children);

        assert(normalizedText.includes("ANG Saint App Shell Sentinel"), "Daily Office commemoration normalizer did not separate fused ANG saint label.");
        assert(dailyCards.length > 0, "Daily Office commemoration sentinel card was not present.");
        assert(dailyCards.some(card => card.classList.contains("app-commemoration-card")), "Daily Office commemoration card readability class was not applied.");

        await window.selectMode("horologion");
        await waitForOfficeTextReady();

        await waitFor(() => {
            return text("#office-mode-title").includes("Eastern Orthodoxy") &&
                isVisible($("#daily-office-section"));
        }, 20000);

        const horSection = $(".saint-section");
        const horDisplay = $("#saint-display");
        const horText = horDisplay?.textContent?.replace(/\s+/g, " ").trim() || "";

        assert(horSection.hidden || !isVisible(horSection), "Horologion should not visibly show the Anglican commemoration section.");
        assert(horText.length === 0, "Horologion should clear stale Anglican commemoration content.");

        return "Daily Office commemoration normalizer verified; Horologion commemoration hidden and cleared";
    }

    async function runAppShellBrowserQc(options = {}) {
        const results = [];

        console.info("[App Shell QC] Starting app-shell browser QC sweep…");

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

        await runCheck(
            "Office navigation browser sweep",
            () => runExternalSweep(
                "Office navigation",
                "/scripts/browser-qc-office-navigation-feature-sweep.js",
                "__lastOfficeNavigationFeatureSweep"
            )
        );

        await runCheck(
            "Book of Needs browser routing sweep",
            () => runExternalSweep(
                "Book of Needs routing",
                "/scripts/browser-qc-book-of-needs-routing-sweep.js",
                "__lastBookOfNeedsRoutingSweep"
            )
        );

        await runCheck(
            "Commemoration scope and readability browser check",
            verifyCommemorationScopeAndReadability
        );

        const failed = results.filter(result => !result.pass);

        console.table(results);

        if (failed.length) {
            console.error(`[App Shell QC] FAIL: ${failed.length} failing check(s).`, failed);
        } else {
            console.info(`[App Shell QC] PASS: ${results.length} check(s) passed.`);
        }

        window.__lastAppShellBrowserQc = {
            passed: failed.length === 0,
            failed,
            results,
            options
        };

        return window.__lastAppShellBrowserQc;
    }

    window.runAppShellBrowserQc = runAppShellBrowserQc;

    runAppShellBrowserQc().catch(error => {
        console.error("[App Shell QC] Fatal app-shell browser QC error:", error);
        window.__lastAppShellBrowserQc = {
            passed: false,
            failed: [{ check: "fatal", pass: false, detail: error.message || String(error) }],
            results: []
        };
    });
})();
