(function () {
    "use strict";

    const STORE_KEYS = [
        "uo.bibleBrowser.lastState.v1",
        "uo.bibleBrowser.annotations.v1",
        "uo.bibleBrowser.fathersNotebook.v1",
        "uo.bibleBrowser.readingPlan.v1"
    ];

    class BibleQcSkip extends Error {
        constructor(message) {
            super(message);
            this.name = "BibleQcSkip";
        }
    }

    const wait = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));
    const $ = selector => document.querySelector(selector);
    const $$ = selector => Array.from(document.querySelectorAll(selector));

    function assert(condition, message) {
        if (!condition) throw new Error(message);
    }

    function skip(message) {
        throw new BibleQcSkip(message);
    }

    function textContent(selector) {
        return ($(selector)?.textContent || "").trim();
    }

    function isVisible(element) {
        if (!element) return false;
        const style = getComputedStyle(element);
        return style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0" &&
            (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
    }

    async function waitFor(predicate, timeoutMs = 5000, intervalMs = 50) {
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

    function clearBibleQcState() {
        localStorage.removeItem("uo.bibleBrowser.annotations.v1");
        localStorage.removeItem("uo.bibleBrowser.fathersNotebook.v1");
        localStorage.removeItem("uo.bibleBrowser.readingPlan.v1");
    }

    function readAnnotations() {
        try {
            const data = JSON.parse(localStorage.getItem("uo.bibleBrowser.annotations.v1") || "[]");
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function readFathersNotebook() {
        try {
            const data = JSON.parse(localStorage.getItem("uo.bibleBrowser.fathersNotebook.v1") || "[]");
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function readReadingPlanState() {
        try {
            return JSON.parse(localStorage.getItem("uo.bibleBrowser.readingPlan.v1") || "{}");
        } catch {
            return {};
        }
    }

    function setInputValue(element, value) {
        assert(element, "Missing input element.");
        element.value = value;
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
    }

    async function openPassage(reference, expectedText) {
        const input = $("#bible-reference-input");
        const button = $("#bible-reference-go");
        assert(input && button, "Missing passage input or open button.");
        setInputValue(input, reference);
        button.click();

        await waitFor(() => {
            const api = window.UniversalOfficeBibleBrowser;
            const resolved = api?.getCurrentResolved?.() || [];
            return resolved.length > 0 &&
                textContent("#bible-results").toLowerCase().includes(String(expectedText).toLowerCase());
        }, 7000);

        return `${reference} opened.`;
    }

    function firstTextNode(element) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node && !node.textContent.trim()) {
            node = walker.nextNode();
        }
        return node;
    }

    async function selectVerseFragment(bookKey, chapter, verse, length = 46) {
        const textEl = $(`.bible-verse[data-book-key="${bookKey}"][data-chapter="${chapter}"][data-verse="${verse}"] .bible-verse-text`);
        assert(textEl, `Missing verse text for ${bookKey} ${chapter}:${verse}.`);

        const node = firstTextNode(textEl);
        assert(node, `Missing selectable text node for ${bookKey} ${chapter}:${verse}.`);

        const end = Math.min(node.textContent.length, Math.max(2, length));
        const range = document.createRange();
        range.setStart(node, 0);
        range.setEnd(node, end);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        await waitFor(() => isVisible($("#bible-selection-toolbar")), 2000);

        return range.toString();
    }

    async function selectVerseRange(bookKey, startChapter, startVerse, endChapter, endVerse) {
        const startEl = $(`.bible-verse[data-book-key="${bookKey}"][data-chapter="${startChapter}"][data-verse="${startVerse}"] .bible-verse-text`);
        const endEl = $(`.bible-verse[data-book-key="${bookKey}"][data-chapter="${endChapter}"][data-verse="${endVerse}"] .bible-verse-text`);
        assert(startEl && endEl, `Missing verse range ${bookKey} ${startChapter}:${startVerse}-${endChapter}:${endVerse}.`);

        const startNode = firstTextNode(startEl);
        const endNode = firstTextNode(endEl);
        assert(startNode && endNode, "Missing selectable text node in verse range.");

        const range = document.createRange();
        range.setStart(startNode, 0);
        range.setEnd(endNode, Math.min(endNode.textContent.length, 55));

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        await waitFor(() => isVisible($("#bible-selection-toolbar")), 2000);

        return range.toString();
    }

    async function makeHighlight(bookKey, chapter, verse, color) {
        const before = readAnnotations().length;
        await selectVerseFragment(bookKey, chapter, verse);

        const swatch = $(`#bible-selection-toolbar [data-highlight-color="${color}"]`);
        assert(swatch, `Missing ${color} toolbar swatch.`);
        swatch.click();

        $("#bible-highlight-btn")?.click();

        await waitFor(() => readAnnotations().length > before, 3000);
        await wait(80);

        const annotation = readAnnotations().at(-1);
        assert(annotation?.highlightColor === color, `Expected ${color} annotation; got ${annotation?.highlightColor}.`);
        assert($(`.bible-highlight-${color}`), `Expected rendered ${color} highlight mark.`);

        return annotation;
    }

    async function makeMultiVerseHighlight(color = "green") {
        const before = readAnnotations().length;
        await selectVerseRange("hebrews", 3, 1, 3, 2);

        const swatch = $(`#bible-selection-toolbar [data-highlight-color="${color}"]`);
        assert(swatch, `Missing ${color} toolbar swatch.`);
        swatch.click();

        $("#bible-highlight-btn")?.click();

        await waitFor(() => readAnnotations().length > before, 3000);
        await wait(80);

        const annotation = readAnnotations().at(-1);
        assert((annotation?.segments || []).length > 1, "Expected multi-verse annotation segments.");
        return annotation;
    }

    async function runStep(results, name, fn, options = {}) {
        const start = performance.now();
        try {
            const detail = await fn();
            results.push({
                check: name,
                pass: true,
                skipped: false,
                ms: Math.round(performance.now() - start),
                detail: detail || "OK"
            });
        } catch (error) {
            if (error instanceof BibleQcSkip || options.optional) {
                results.push({
                    check: name,
                    pass: true,
                    skipped: true,
                    ms: Math.round(performance.now() - start),
                    detail: error.message || "Skipped"
                });
            } else {
                results.push({
                    check: name,
                    pass: false,
                    skipped: false,
                    ms: Math.round(performance.now() - start),
                    detail: error.message || String(error)
                });
            }
        }
    }

    async function runBibleFeatureSweep(options = {}) {
        const restoreState = options.restoreState !== false;
        const includeFathers = options.includeFathers !== false;
        const snapshot = backupLocalStorage();
        const results = [];

        console.clear();
        console.info("[Bible QC] Starting Bible Browser feature sweep…");

        try {
            await waitFor(() =>
                window.UniversalOfficeBibleBrowser &&
                document.getElementById("bible-reference-input") &&
                document.getElementById("bible-results")
            , 7000);

            const api = window.UniversalOfficeBibleBrowser;

            if (location.pathname !== "/tools/bible") {
                api.open?.({ restore: false });
                await wait(150);
            }

            clearBibleQcState();
            api.closeContextPanel?.();
            api.renderCurrentNotesList?.();

            await runStep(results, "reload guard: no empty Study Help panel", async () => {
                api.closeContextPanel?.();
                api.reflowContextPanel?.();
                await wait(120);

                const panel = $("#bible-context-panel");
                const body = $("#bible-context-panel-body");
                assert(panel, "Missing context panel.");
                assert(panel.hidden || !!body?.innerHTML.trim(), "Empty Study Help panel opened during reflow.");
            });

            await runStep(results, "open passage: Hebrews 1", async () => {
                return openPassage("Hebrews 1", "Hebrews 1");
            });

            await runStep(results, "open passage: Jubilees 1", async () => {
                return openPassage("Jubilees 1", "Book of Jubilees");
            });

            await runStep(results, "open passage: Hebrews working range", async () => {
                return openPassage("Hebrews 2:15-3:8; 4:16", "Hebrews 2");
            });

            await runStep(results, "compare translations toggle", async () => {
                const toggle = $("#bible-parallel-toggle");
                const select = $("#bible-parallel-select");
                assert(toggle && select, "Missing compare controls.");

                toggle.checked = true;
                toggle.dispatchEvent(new Event("change", { bubbles: true }));
                await wait(150);
                assert(isVisible(select), "Second translation selector did not become visible.");

                toggle.checked = false;
                toggle.dispatchEvent(new Event("change", { bubbles: true }));
                await wait(150);
                assert(!isVisible(select), "Second translation selector did not hide.");
            });

            await runStep(results, "browse by book opens chapter", async () => {
                const details = $("#bible-book-select")?.closest("details");
                if (details) details.open = true;

                const book = $("#bible-book-select");
                const chapter = $("#bible-chapter-select");
                assert(book && chapter, "Missing browse controls.");

                setInputValue(book, "hebrews");
                await waitFor(() => chapter.options.length > 1, 3000);
                setInputValue(chapter, "1");

                $("#bible-book-open")?.click();
                await waitFor(() => textContent("#bible-results").includes("Hebrews 1"), 5000);
            });

            await runStep(results, "advanced search returns results", async () => {
                const details = $("#bible-search-input")?.closest("details");
                if (details) details.open = true;

                setInputValue($("#bible-search-input"), "faithful");
                $("#bible-search-go")?.click();

                await waitFor(() => {
                    const text = textContent("#bible-results").toLowerCase();
                    return text.includes("faithful") && !text.includes("enter words to search");
                }, 7000);
            });

            await runStep(results, "highlight colors render and save", async () => {
                await openPassage("Hebrews 2:15-3:8; 4:16", "Hebrews 2");

                const targets = [
                    [2, 15, "yellow"],
                    [2, 16, "pink"],
                    [2, 17, "green"],
                    [2, 18, "blue"],
                    [3, 1, "purple"]
                ];

                for (const [chapter, verse, color] of targets) {
                    await makeHighlight("hebrews", chapter, verse, color);
                }

                const colors = new Set(readAnnotations().map(item => item.highlightColor));
                for (const color of ["yellow", "pink", "green", "blue", "purple"]) {
                    assert(colors.has(color), `Missing saved ${color} annotation.`);
                }

                return "Five colors saved.";
            });

            let multiAnnotationId = null;

            await runStep(results, "multi-verse highlight stores segments", async () => {
                await openPassage("Hebrews 2:15-3:8; 4:16", "Hebrews 2");
                const annotation = await makeMultiVerseHighlight("green");
                multiAnnotationId = annotation.id;
                return `${annotation.segments.length} segments.`;
            });

            await runStep(results, "existing highlight color changes by swatch", async () => {
                assert(multiAnnotationId, "Missing multi-verse annotation id.");

                api.openAnnotationActions?.(multiAnnotationId);
                await waitFor(() => $("#bible-context-panel-body [data-context-highlight-color='blue']"), 2000);

                $("#bible-context-panel-body [data-context-highlight-color='blue']").click();
                await waitFor(() => {
                    const annotation = readAnnotations().find(item => item.id === multiAnnotationId);
                    return annotation?.highlightColor === "blue";
                }, 3000);

                assert($(".bible-highlight-blue"), "Expected a blue highlight after color change.");
            });

            await runStep(results, "add and save note", async () => {
                assert(multiAnnotationId, "Missing annotation id for note test.");

                api.openAnnotationEditor?.(multiAnnotationId);
                await waitFor(() => $("#bible-context-note-comment"), 2000);

                setInputValue($("#bible-context-note-comment"), "QC note: highlight note save path works.");
                $("#bible-context-save-note")?.click();

                await waitFor(() => {
                    const annotation = readAnnotations().find(item => item.id === multiAnnotationId);
                    return annotation?.comment?.includes("QC note");
                }, 3000);
            });

            if (includeFathers) {
                await runStep(results, "What the Fathers Say panel loads", async () => {
                    assert(multiAnnotationId, "Missing annotation id for Fathers test.");

                    api.openAnnotationActions?.(multiAnnotationId);
                    await waitFor(() => $("#bible-context-fathers-highlight"), 2000);
                    $("#bible-context-fathers-highlight").click();

                    await waitFor(() => {
                        const body = $("#bible-context-panel-body");
                        const text = body?.textContent || "";
                        return body &&
                            !text.includes("Looking up Church Fathers commentary") &&
                            (body.querySelector(".bible-guide-card") ||
                                body.querySelector(".bible-guide-empty") ||
                                body.querySelector(".bible-guide-error"));
                    }, 10000);

                    assert(!$("#bible-context-panel")?.hidden, "Fathers panel did not stay open.");
                    return textContent("#bible-context-panel-body").slice(0, 90);
                }, { optional: true });

                await runStep(results, "Save Fathers card to notebook", async () => {
                    const saveButton = $("#bible-context-panel-body [data-save-witness-notebook]");
                    if (!saveButton) skip("No Fathers card available to save in this passage.");

                    const before = readFathersNotebook().length;
                    saveButton.click();

                    await waitFor(() => readFathersNotebook().length > before, 3000);
                    return `${readFathersNotebook().length} notebook item(s).`;
                }, { optional: true });

                await runStep(results, "Add Fathers card to existing note", async () => {
                    const addButton = $("#bible-context-panel-body [data-add-witness-note]");
                    if (!addButton) skip("No Fathers add-to-note button available in this passage.");

                    addButton.click();

                    await waitFor(() => {
                        const annotation = readAnnotations().find(item => item.id === multiAnnotationId);
                        return annotation?.comment?.includes("From the Fathers");
                    }, 3000);

                    return "Fathers appendix added to note.";
                }, { optional: true });
            }

            await runStep(results, "Notes and Highlights drawer renders saved items", async () => {
                const details = $(".bible-notes-details");
                assert(details, "Missing Notes and Highlights drawer.");
                details.open = true;
                api.renderCurrentNotesList?.();

                await waitFor(() =>
                    $("#bible-current-notes .bible-note-card") ||
                    $("#bible-research-index .bible-research-card")
                , 3000);
            });

            await runStep(results, "Reading Plan marks complete", async () => {
                const details = $(".bible-reading-plan-details");
                assert(details, "Missing Reading Plan drawer.");
                details.open = true;

                const start = $("#bible-plan-start-date");
                const active = $("#bible-plan-active-date");
                const toggle = $("#bible-plan-toggle-complete");
                assert(start && active && toggle, "Missing reading plan controls.");

                setInputValue(start, "2026-01-01");
                setInputValue(active, "2026-01-01");
                await wait(100);

                const before = JSON.stringify(readReadingPlanState().completedDays || {});
                toggle.click();

                await waitFor(() => {
                    const after = JSON.stringify(readReadingPlanState().completedDays || {});
                    return after !== before && after.includes("1");
                }, 3000);

                return textContent("#bible-plan-progress");
            });

            await runStep(results, "Research Markdown export creates download", async () => {
                const button = $("#bible-export-research-markdown");
                assert(button, "Missing research Markdown export button.");

                let downloadName = "";
                let blobType = "";
                const originalCreateObjectURL = URL.createObjectURL;
                const originalRevokeObjectURL = URL.revokeObjectURL;
                const originalClick = HTMLAnchorElement.prototype.click;

                try {
                    URL.createObjectURL = function (blob) {
                        blobType = blob?.type || "";
                        return "blob:universal-office-qc";
                    };
                    URL.revokeObjectURL = function () {};
                    HTMLAnchorElement.prototype.click = function () {
                        downloadName = this.download || "";
                    };

                    button.click();
                } finally {
                    URL.createObjectURL = originalCreateObjectURL;
                    URL.revokeObjectURL = originalRevokeObjectURL;
                    HTMLAnchorElement.prototype.click = originalClick;
                }

                assert(downloadName.endsWith(".md"), `Expected Markdown download, got ${downloadName || "none"}.`);
                assert(blobType.includes("markdown"), `Expected markdown blob, got ${blobType || "none"}.`);
                return downloadName;
            });

        } finally {
            if (restoreState) {
                restoreLocalStorage(snapshot);
            }
        }

        const failed = results.filter(result => !result.pass);
        const skipped = results.filter(result => result.skipped);

        console.table(results);
        if (failed.length) {
            console.error(`[Bible QC] FAIL: ${failed.length} failing check(s).`, failed);
        } else {
            console.info(`[Bible QC] PASS: ${results.length - skipped.length} check(s) passed; ${skipped.length} optional check(s) skipped.`);
        }

        window.__lastBibleFeatureSweep = {
            passed: failed.length === 0,
            failed,
            skipped,
            results,
            restoreState
        };

        return window.__lastBibleFeatureSweep;
    }

    window.runBibleFeatureSweep = runBibleFeatureSweep;

    runBibleFeatureSweep().catch(error => {
        console.error("[Bible QC] Fatal feature sweep error:", error);
        window.__lastBibleFeatureSweep = {
            passed: false,
            failed: [{ check: "fatal", pass: false, detail: error.message || String(error) }],
            skipped: [],
            results: [],
            restoreState: true
        };
    });
})();
