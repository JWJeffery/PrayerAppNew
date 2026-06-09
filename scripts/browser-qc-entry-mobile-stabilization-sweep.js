(function () {
    "use strict";

    const STORE_KEYS = [
        "universalOffice.entry.default.v1",
        "universalOffice.userProfile.v1",
        "universalOfficeSettings"
    ];

    const wait = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));
    const $ = selector => document.querySelector(selector);
    const $$ = selector => Array.from(document.querySelectorAll(selector));

    function assert(condition, message) {
        if (!condition) throw new Error(message);
    }

    function backupLocalStorage() {
        const snapshot = new Map();
        for (const key of STORE_KEYS) snapshot.set(key, localStorage.getItem(key));
        return snapshot;
    }

    function restoreLocalStorage(snapshot) {
        for (const key of STORE_KEYS) {
            const value = snapshot.get(key);
            if (value === null || typeof value === "undefined") localStorage.removeItem(key);
            else localStorage.setItem(key, value);
        }
    }

    function isVisible(element) {
        if (!element) return false;
        const style = getComputedStyle(element);
        return style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0" &&
            (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
    }

    function viewport() {
        return {
            width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        };
    }

    function rectWithinViewport(element, tolerance = 2) {
        const rect = element.getBoundingClientRect();
        const size = viewport();
        return rect.left >= -tolerance &&
            rect.top >= -tolerance &&
            rect.right <= size.width + tolerance &&
            rect.bottom <= size.height + tolerance;
    }

    function assertRectWithinViewport(element, label) {
        const rect = element.getBoundingClientRect();
        const size = viewport();
        assert(rectWithinViewport(element, 2), label + ": rect escaped viewport " + JSON.stringify({
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            right: Math.round(rect.right),
            bottom: Math.round(rect.bottom),
            viewportWidth: size.width,
            viewportHeight: size.height
        }));
    }

    async function waitFor(predicate, timeoutMs = 8000, intervalMs = 60) {
        const started = Date.now();
        while (Date.now() - started < timeoutMs) {
            try {
                if (predicate()) return true;
            } catch {
                // keep waiting
            }
            await wait(intervalMs);
        }
        throw new Error("Timed out waiting for expected page state.");
    }

    function text(selector) {
        return ($(selector)?.textContent || "").replace(/\s+/g, " ").trim();
    }

    function officeText() {
        return text("#office-display");
    }

    const MODE_CASES = [
        { label: "BCP Daily Office", mode: "daily", panelId: "settings-panel", navKey: "daily" },
        { label: "Oriental Orthodoxy / Ethiopian Sa'atat", mode: "ethiopian-saatat", panelId: "ethiopian-settings", navKey: "ethiopian" },
        { label: "Church of the East", mode: "east-syriac", panelId: "east-syriac-settings", navKey: "eastSyriac" },
        { label: "Eastern Orthodoxy / Horologion", mode: "horologion", panelId: "generic-settings", navKey: "horologion" }
    ];

    function assertExclusiveOfficeDrawer(test) {
        for (const item of MODE_CASES) {
            const panel = $("#" + item.panelId);
            assert(panel, test.label + ": missing drawer panel " + item.panelId + ".");

            if (item.panelId === test.panelId) {
                assert(!panel.classList.contains("mode-hidden"), test.label + ": active drawer is mode-hidden.");
                assert(!panel.classList.contains("sidebar-hidden"), test.label + ": active drawer is sidebar-hidden.");
                assert(isVisible(panel), test.label + ": active drawer is not visible.");
            } else {
                assert(panel.classList.contains("mode-hidden"), test.label + ": stale drawer remained active: " + item.panelId + ".");
                assert(panel.classList.contains("sidebar-hidden"), test.label + ": stale drawer remained open: " + item.panelId + ".");
            }
        }

        return true;
    }

    async function enterMode(test) {
        assert(typeof window.selectMode === "function", "Missing selectMode(). Run from the Universal Office root page.");

        await window.selectMode(test.mode);

        await waitFor(() => {
            const panel = $("#" + test.panelId);
            return panel &&
                !panel.classList.contains("mode-hidden") &&
                !panel.classList.contains("sidebar-hidden") &&
                isVisible(panel) &&
                MODE_CASES.every(item => {
                    const candidate = $("#" + item.panelId);
                    if (!candidate) return false;
                    if (item.panelId === test.panelId) return true;
                    return candidate.classList.contains("mode-hidden") &&
                        candidate.classList.contains("sidebar-hidden");
                }) &&
                officeText().length > 40;
        }, 12000);

        assertExclusiveOfficeDrawer(test);
        return $("#" + test.panelId);
    }

    async function verifyEntrySurfaces() {
        assert($("#tradition-entry"), "Missing tradition entry panel.");
        assert($("#mode-selection"), "Missing universal selector panel.");

        if (typeof window.showUniversalModeSelection === "function") {
            window.showUniversalModeSelection(false);
            await waitFor(() => isVisible($("#mode-selection")), 3000);
        }

        assert(isVisible($("#mode-selection")), "Universal selector did not become visible.");

        const admin = $('[data-advanced-only="true"].app-mode-card-admin');
        const defaults = $("#user-profile-defaults");
        assert(admin, "Missing advanced-only Admin Console card.");
        assert(defaults, "Missing advanced-only Local Browser Defaults section.");
        assert(admin.hidden || admin.getAttribute("aria-hidden") === "true" || !isVisible(admin), "Admin card visible without advanced flag.");
        assert(defaults.hidden || defaults.getAttribute("aria-hidden") === "true" || !isVisible(defaults), "Local Browser Defaults visible without advanced flag.");

        assert(typeof window.syncUniversalOfficeAdvancedToolsVisibility === "function", "Missing advanced-tools visibility sync function.");
        window.syncUniversalOfficeAdvancedToolsVisibility(true);
        await waitFor(() => isVisible(admin) && isVisible(defaults), 3000);

        window.syncUniversalOfficeAdvancedToolsVisibility(false);
        await waitFor(() => !isVisible(admin) && !isVisible(defaults), 3000);

        return "Universal selector and advanced-tools gate passed";
    }

    async function verifySidebarToggle(test) {
        const panel = await enterMode(test);
        const toggle = $("#sidebar-toggle");

        assert(toggle && isVisible(toggle), test.label + ": missing visible sidebar toggle/close rail.");
        assertRectWithinViewport(toggle, test.label + ": sidebar toggle/close rail");

        toggle.click();
        await waitFor(() => panel.classList.contains("sidebar-hidden"), 4000);

        toggle.click();
        await waitFor(() => !panel.classList.contains("sidebar-hidden") && isVisible(panel), 4000);

        return test.label + ": sidebar close/restore passed";
    }

    async function verifySharedSelectorOverflow(test) {
        const panel = await enterMode(test);
        const nav = panel.querySelector('.shared-office-nav[data-shared-office-nav="' + test.navKey + '"]');
        if (!nav) return test.label + ": no shared selector present; skipped";

        const candidates = [
            nav,
            nav.querySelector(".shared-office-nav-card"),
            nav.querySelector(".shared-office-nav-hour-card"),
            nav.querySelector(".shared-office-nav-options")
        ].filter(Boolean);

        for (const element of candidates) {
            const style = getComputedStyle(element);
            assert(style.overflowY === "visible" || element.scrollHeight <= element.clientHeight + 2,
                test.label + ": internal vertical scroll remains on ." + Array.from(element.classList).join("."));
        }

        return test.label + ": shared selector overflow passed";
    }

    async function verifyTooltipContainment() {
        await enterMode(MODE_CASES[0]);

        const tooltip = $("#uo-tooltip");
        assert(tooltip, "Missing #uo-tooltip.");

        const button = $("#settings-panel .info-btn[data-tip]");
        assert(button, "Missing BCP info button with data-tip.");

        button.click();
        await waitFor(() => isVisible(tooltip) && tooltip.textContent.trim().length > 12, 3000);

        assertRectWithinViewport(tooltip, "BCP info tooltip");

        document.body.click();
        await waitFor(() => !isVisible(tooltip), 3000);

        button.click();
        await waitFor(() => isVisible(tooltip), 3000);
        window.dispatchEvent(new Event("resize"));
        await wait(120);
        assertRectWithinViewport(tooltip, "BCP info tooltip after resize");

        document.dispatchEvent(new Event("scroll", { bubbles: true }));
        await wait(120);

        return "BCP tooltip containment and dismissal passed";
    }

    async function verifyMobileLabelBounds() {
        await enterMode(MODE_CASES[0]);

        const labelsToCheck = [
            "Rite II (Contemporary)",
            "Rite I (Traditional)",
            "Gospel in Evening",
            "Gospel in Morning",
            "Vespers Mode (Dark)",
            "BCP Only Mode"
        ];

        const results = [];

        for (const phrase of labelsToCheck) {
            const label = $$("#settings-panel label").find(item => item.textContent.replace(/\s+/g, " ").trim().includes(phrase));
            assert(label, "Missing label: " + phrase);

            const container = label.closest(".nested-group, .setting-group") || $("#settings-panel");
            const labelRect = label.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            assert(labelRect.left >= containerRect.left - 3, phrase + ": label escapes left boundary.");
            assert(labelRect.right <= containerRect.right + 3, phrase + ": label escapes right boundary.");
            assert(label.scrollWidth <= label.clientWidth + 3 || getComputedStyle(label).whiteSpace !== "nowrap",
                phrase + ": label still appears horizontally constrained incorrectly.");

            results.push(phrase);
        }

        return "BCP label bounds passed: " + results.join(", ");
    }

    async function runEntryMobileStabilizationSweep(options = {}) {
        const restoreState = options.restoreState !== false;
        const snapshot = backupLocalStorage();
        const results = [];

        console.info("[Entry/Mobile QC] Starting entry/mobile stabilization sweep…");

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
            assert($("#daily-office-section"), "Missing Daily Office shell.");
            assert($("#mode-selection"), "This sweep must run from the Universal Office root page.");

            await runCheck("Entry surfaces and advanced-tools gate", verifyEntrySurfaces);
            await runCheck("BCP tooltip containment", verifyTooltipContainment);
            await runCheck("BCP mobile label bounds", verifyMobileLabelBounds);

            for (const test of MODE_CASES) {
                await runCheck(test.label + ": sidebar close/restore", () => verifySidebarToggle(test));
                await runCheck(test.label + ": shared selector overflow", () => verifySharedSelectorOverflow(test));
            }
        } finally {
            if (restoreState) restoreLocalStorage(snapshot);
        }

        const failed = results.filter(result => !result.pass);

        console.table(results);
        if (failed.length) {
            console.error("[Entry/Mobile QC] FAIL: " + failed.length + " failing check(s).", failed);
        } else {
            console.info("[Entry/Mobile QC] PASS: " + results.length + " check(s) passed.");
        }

        window.__lastEntryMobileStabilizationSweep = {
            passed: failed.length === 0,
            failed,
            results,
            restoreState
        };

        return window.__lastEntryMobileStabilizationSweep;
    }

    window.runEntryMobileStabilizationSweep = runEntryMobileStabilizationSweep;

    runEntryMobileStabilizationSweep().catch(error => {
        console.error("[Entry/Mobile QC] Fatal sweep error:", error);
        window.__lastEntryMobileStabilizationSweep = {
            passed: false,
            failed: [{ check: "fatal", pass: false, detail: error.message || String(error) }],
            results: [],
            restoreState: true
        };
    });
})();
