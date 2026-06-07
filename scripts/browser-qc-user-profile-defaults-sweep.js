(function () {
    "use strict";

    const STORE_KEYS = [
        "universalOfficeSettings",
        "universalOffice.entry.default.v1",
        "universalOffice.userProfile.v1"
    ];

    const PROFILE_KEY = "universalOffice.userProfile.v1";
    const LEGACY_ENTRY_KEY = "universalOffice.entry.default.v1";

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

    async function waitFor(predicate, timeoutMs = 10000, intervalMs = 80) {
        const start = Date.now();

        while (Date.now() - start < timeoutMs) {
            try {
                if (predicate()) return true;
            } catch {
                // keep waiting
            }

            await wait(intervalMs);
        }

        throw new Error("Timed out waiting for expected user-profile QC state.");
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

    function storedProfile() {
        const raw = localStorage.getItem(PROFILE_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function visiblePrayerCount() {
        return $$(".prayer-option").filter(option => !option.hidden && option.getAttribute("aria-hidden") !== "true").length;
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

    async function waitForBookOfNeedsContext(context) {
        await waitFor(() => {
            const list = $("#prayer-select-list");
            const section = $("#individual-prayers-section");

            return isVisible(section) &&
                list &&
                list.dataset.activeTradition === context &&
                text("#book-needs-context-label").length > 0;
        }, 12000);

        return {
            context: $("#prayer-select-list")?.dataset.activeTradition || "",
            label: text("#book-needs-context-label"),
            returnText: text("#book-needs-return-button"),
            visibleCount: visiblePrayerCount()
        };
    }

    async function enterOfficeMode(mode, expectedHeader) {
        assert(typeof window.selectMode === "function", "Missing global selectMode().");

        await window.selectMode(mode);

        await waitFor(() => {
            return isVisible($("#daily-office-section")) &&
                text("#office-mode-title").includes(expectedHeader) &&
                isVisible($("#office-context-actions .office-context-action"));
        }, 16000);

        return text("#office-mode-title");
    }

    async function openOfficeBookOfNeeds(mode, expectedHeader, expectedContext) {
        await enterOfficeMode(mode, expectedHeader);

        assert(typeof window.openBookOfNeedsForActiveOffice === "function", "Missing openBookOfNeedsForActiveOffice().");
        window.openBookOfNeedsForActiveOffice();

        return await waitForBookOfNeedsContext(expectedContext);
    }

    async function verifyProfileApiAndControls() {
        const requiredGlobals = [
            "getUniversalOfficeUserProfile",
            "setUserProfileEntryPageDefault",
            "setUserProfileTraditionDefault",
            "setUserProfileBookOfNeedsScope",
            "resetUniversalOfficeUserProfile"
        ];

        for (const name of requiredGlobals) {
            assert(typeof window[name] === "function", `Missing profile global ${name}().`);
        }

        assert($("#user-profile-defaults"), "Missing local profile defaults panel.");
        assert($("#profile-entry-default"), "Missing profile entry default control.");
        assert($("#profile-tradition-default"), "Missing profile tradition default control.");
        assert($("#profile-book-needs-scope"), "Missing profile Book of Needs scope control.");
        assert($("#profile-defaults-summary"), "Missing profile summary output.");

        return "Profile API and controls are present";
    }

    async function verifyOfficeDefaultsActionOpensPanel() {
        await enterOfficeMode("daily", "The Episcopal Church");

        const button = $("#office-profile-defaults-button");
        assert(button, "Missing office-page Defaults action.");
        assert(typeof window.openLocalProfileDefaultsFromOffice === "function", "Missing openLocalProfileDefaultsFromOffice().");

        button.click();

        await waitFor(() => {
            return isVisible($("#mode-selection")) &&
                isVisible($("#user-profile-defaults")) &&
                !document.body.classList.contains("office-active");
        }, 12000);

        assert(text("#user-profile-defaults-title").includes("Defaults for this browser"), "Office Defaults action did not reveal the local defaults panel.");

        await waitFor(() => document.activeElement === $("#profile-entry-default"), 3000, 50);

        return "Office Defaults action opens and focuses the local browser defaults panel";
    }

    async function verifyUniversalDefaultPersists() {
        window.resetUniversalOfficeUserProfile();
        await wait(50);

        window.setUserProfileEntryPageDefault("universal");

        const profile = window.getUniversalOfficeUserProfile();
        const stored = storedProfile();

        assert(profile.entryPageDefault === "universal", `Expected runtime entryPageDefault universal, got ${profile.entryPageDefault}.`);
        assert(stored?.entryPageDefault === "universal", "Stored profile did not persist universal entry default.");
        assert(localStorage.getItem(LEGACY_ENTRY_KEY) === "universal", "Legacy entry default key did not preserve universal default.");
        assert($("#profile-entry-default")?.value === "universal", "Profile entry select did not sync to universal.");
        assert(/Universal Office selector/i.test(text("#profile-defaults-summary")), "Profile summary does not mention Universal Office selector.");

        return "Universal selector default persisted and controls synced";
    }

    async function verifyTraditionDefaultPersists() {
        window.resetUniversalOfficeUserProfile();
        await wait(50);

        window.setUserProfileTraditionDefault("eastern-orthodox");

        const profile = window.getUniversalOfficeUserProfile();
        const stored = storedProfile();

        assert(profile.entryPageDefault === "tradition", `Expected runtime entryPageDefault tradition, got ${profile.entryPageDefault}.`);
        assert(profile.traditionDefault === "eastern-orthodox", `Expected runtime tradition eastern-orthodox, got ${profile.traditionDefault}.`);
        assert(stored?.entryPageDefault === "tradition", "Stored profile did not persist tradition entry default.");
        assert(stored?.traditionDefault === "eastern-orthodox", "Stored profile did not persist Eastern Orthodox default.");
        assert(localStorage.getItem(LEGACY_ENTRY_KEY) === "eastern-orthodox", "Legacy entry default key did not preserve Eastern Orthodox default.");
        assert($("#profile-tradition-default")?.value === "eastern-orthodox", "Profile tradition select did not sync to Eastern Orthodox.");
        assert(/Eastern Orthodoxy/i.test(text("#profile-defaults-summary")), "Profile summary does not mention Eastern Orthodoxy.");

        return "Eastern Orthodox tradition default persisted without changing public first-screen choices";
    }

    async function verifyBookOfNeedsUniversalScopeOverride() {
        window.resetUniversalOfficeUserProfile();
        await wait(50);

        window.setUserProfileBookOfNeedsScope("universal");

        const profile = window.getUniversalOfficeUserProfile();
        assert(profile.bookOfNeedsScope === "universal", `Expected Book of Needs scope universal, got ${profile.bookOfNeedsScope}.`);

        const state = await openOfficeBookOfNeeds("daily", "The Episcopal Church", "UNIVERSAL");

        assert(state.returnText === "Back to Office", `Expected contextual Back to Office, got ${state.returnText || "blank"}.`);
        assert(state.visibleCount >= 20, `Expected all-prayers override to show broad list, saw ${state.visibleCount}.`);
        assert(isPrayerOptionVisible("prayer-humble-access"), "All-prayers override should show Anglican prayer-humble-access.");
        assert(isPrayerOptionVisible("minister-journey-orthodox"), "All-prayers override should show Orthodox minister-journey-orthodox.");
        assert(isPrayerOptionVisible("thanksgiving-aquinas"), "All-prayers override should show Latin thanksgiving-aquinas.");

        $("#book-needs-return-button")?.click();

        await waitFor(() => {
            return isVisible($("#daily-office-section")) &&
                !isVisible($("#individual-prayers-section")) &&
                text("#office-mode-title").includes("The Episcopal Church");
        }, 12000);

        return `Book of Needs all-prayers override showed ${state.visibleCount} prayers from Daily Office access`;
    }

    async function verifyBookOfNeedsTraditionScopeRestored() {
        window.setUserProfileBookOfNeedsScope("tradition");

        const profile = window.getUniversalOfficeUserProfile();
        assert(profile.bookOfNeedsScope === "tradition", `Expected Book of Needs scope tradition, got ${profile.bookOfNeedsScope}.`);

        const state = await openOfficeBookOfNeeds("daily", "The Episcopal Church", "ANG");

        assert(state.visibleCount > 0, "Tradition-filtered Book of Needs should show Anglican prayers.");
        assert(isPrayerOptionVisible("prayer-humble-access"), "Tradition-filtered Daily Office Book of Needs should show Anglican prayer-humble-access.");
        assert(isPrayerOptionHidden("minister-journey-orthodox"), "Tradition-filtered Daily Office Book of Needs should hide Orthodox minister-journey-orthodox.");
        assert(isPrayerOptionHidden("thanksgiving-aquinas"), "Tradition-filtered Daily Office Book of Needs should hide Latin thanksgiving-aquinas.");

        $("#book-needs-return-button")?.click();

        await waitFor(() => {
            return isVisible($("#daily-office-section")) &&
                !isVisible($("#individual-prayers-section")) &&
                text("#office-mode-title").includes("The Episcopal Church");
        }, 12000);

        return `Book of Needs tradition scope restored with ${state.visibleCount} Anglican prayers`;
    }

    async function verifyProfileResetClearsLocalDefaults() {
        window.setUserProfileEntryPageDefault("universal");
        window.setUserProfileBookOfNeedsScope("universal");

        window.resetUniversalOfficeUserProfile();
        await wait(80);

        const profile = window.getUniversalOfficeUserProfile();

        assert(localStorage.getItem(PROFILE_KEY) === null, "Profile reset should remove stored profile key.");
        assert(localStorage.getItem(LEGACY_ENTRY_KEY) === null, "Profile reset should remove legacy entry default key.");
        assert(profile.entryPageDefault === "ask", `Reset runtime profile should return to ask, got ${profile.entryPageDefault}.`);
        assert(profile.traditionDefault === null, `Reset runtime tradition should be null, got ${profile.traditionDefault}.`);
        assert(profile.bookOfNeedsScope === "tradition", `Reset runtime Book of Needs scope should be tradition, got ${profile.bookOfNeedsScope}.`);
        assert($("#profile-entry-default")?.value === "ask", "Profile entry select did not reset to ask.");
        assert($("#profile-book-needs-scope")?.value === "tradition", "Profile Book of Needs select did not reset to tradition.");

        return "Profile reset cleared local defaults and restored ask/tradition-filtered baseline";
    }

    async function runUserProfileDefaultsSweep(options = {}) {
        const restoreState = options.restoreState !== false;
        const snapshot = backupLocalStorage();
        const results = [];

        console.info("[Profile QC] Starting user profile defaults sweep…");

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
            await runCheck("Profile API and controls exist", verifyProfileApiAndControls);
            await runCheck("Office Defaults action opens local defaults panel", verifyOfficeDefaultsActionOpensPanel);
            await runCheck("Universal selector default persists", verifyUniversalDefaultPersists);
            await runCheck("Tradition office default persists", verifyTraditionDefaultPersists);
            await runCheck("Book of Needs all-prayers profile override works", verifyBookOfNeedsUniversalScopeOverride);
            await runCheck("Book of Needs tradition-filtered scope still works", verifyBookOfNeedsTraditionScopeRestored);
            await runCheck("Profile reset clears local defaults", verifyProfileResetClearsLocalDefaults);
        } finally {
            if (restoreState) {
                restoreLocalStorage(snapshot);

                if (typeof window.syncUserProfileControls === "function") {
                    window.syncUserProfileControls();
                }
            }
        }

        const failed = results.filter(result => !result.pass);

        console.table(results);

        if (failed.length) {
            console.error(`[Profile QC] FAIL: ${failed.length} failing check(s).`, failed);
        } else {
            console.info(`[Profile QC] PASS: ${results.length} check(s) passed.`);
        }

        window.__lastUserProfileDefaultsSweep = {
            passed: failed.length === 0,
            failed,
            results,
            restoreState
        };

        return window.__lastUserProfileDefaultsSweep;
    }

    window.runUserProfileDefaultsSweep = runUserProfileDefaultsSweep;

    runUserProfileDefaultsSweep().catch(error => {
        console.error("[Profile QC] Fatal user profile defaults sweep error:", error);
        window.__lastUserProfileDefaultsSweep = {
            passed: false,
            failed: [{ check: "fatal", pass: false, detail: error.message || String(error) }],
            results: [],
            restoreState: true
        };
    });
})();
