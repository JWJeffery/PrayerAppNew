(function () {
    "use strict";

    const RUNTIME_MANIFEST_PATH = "/data/commentary/patristic-witness-runtime/manifest.json";
    const runtimeManifestCache = { value: null };
    const runtimeBookCache = new Map();

    function $(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function encodeLocation(chapter, verse) {
        return Number(chapter) * 1000000 + Number(verse);
    }

    async function fetchJson(path) {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Unable to load ${path} (HTTP ${response.status}).`);
        }
        return response.json();
    }

    async function loadRuntimeManifest() {
        if (runtimeManifestCache.value) return runtimeManifestCache.value;
        runtimeManifestCache.value = await fetchJson(RUNTIME_MANIFEST_PATH);
        return runtimeManifestCache.value;
    }

    async function loadRuntimeBook(bookKey) {
        if (runtimeBookCache.has(bookKey)) return runtimeBookCache.get(bookKey);

        const manifest = await loadRuntimeManifest();
        const record = manifest.books.find(book => book.book === bookKey);
        if (!record) {
            return null;
        }

        const shard = await fetchJson(`/${record.path}`);
        runtimeBookCache.set(bookKey, shard);
        return shard;
    }

    function currentPassageRanges() {
        const resolved = window.UniversalOfficeBibleBrowser?.getCurrentResolved?.() || [];
        const byBook = new Map();

        for (const item of resolved) {
            const bookKey = item.bookKey;
            const location = encodeLocation(item.chapter, item.verse);
            if (!byBook.has(bookKey)) {
                byBook.set(bookKey, {
                    book: bookKey,
                    bookName: item.bookName || bookKey,
                    startChapter: Number(item.chapter),
                    startVerse: Number(item.verse),
                    endChapter: Number(item.chapter),
                    endVerse: Number(item.verse),
                    startLocation: location,
                    endLocation: location,
                    verseCount: 0,
                });
            }

            const range = byBook.get(bookKey);
            range.verseCount += 1;

            if (location < range.startLocation) {
                range.startLocation = location;
                range.startChapter = Number(item.chapter);
                range.startVerse = Number(item.verse);
            }

            if (location > range.endLocation) {
                range.endLocation = location;
                range.endChapter = Number(item.chapter);
                range.endVerse = Number(item.verse);
            }
        }

        return Array.from(byBook.values()).map(range => ({
            ...range,
            label: formatRangeLabel(range),
        }));
    }

    function formatRangeLabel(range) {
        if (range.startChapter === range.endChapter && range.startVerse === range.endVerse) {
            return `${range.bookName} ${range.startChapter}:${range.startVerse}`;
        }
        if (range.startChapter === range.endChapter) {
            return `${range.bookName} ${range.startChapter}:${range.startVerse}-${range.endVerse}`;
        }
        return `${range.bookName} ${range.startChapter}:${range.startVerse}-${range.endChapter}:${range.endVerse}`;
    }

    function witnessOverlapsRange(entry, range) {
        const locationStart = Number(entry.range?.locationStart || 0);
        const locationEnd = Number(entry.range?.locationEnd || 0);
        return locationStart <= range.endLocation && locationEnd >= range.startLocation;
    }

    async function queryFathersForRanges(ranges) {
        const results = [];
        const unsupportedBooks = [];

        for (const range of ranges) {
            const shard = await loadRuntimeBook(range.book);
            if (!shard) {
                unsupportedBooks.push(range.bookName || range.book);
                continue;
            }

            for (const entry of shard.entries || []) {
                if (witnessOverlapsRange(entry, range)) {
                    results.push({
                        ...entry,
                        matchedRange: range,
                    });
                }
            }
        }

        results.sort((a, b) => {
            const loc = Number(a.range.locationStart) - Number(b.range.locationStart);
            if (loc) return loc;
            const time = Number(a.time || 9999999) - Number(b.time || 9999999);
            if (time) return time;
            return String(a.fatherName).localeCompare(String(b.fatherName));
        });

        return { results, unsupportedBooks };
    }

    function renderWitnesses(results, ranges, unsupportedBooks = []) {
        const output = $("bible-passage-guide-results");
        const status = $("bible-passage-guide-status");
        if (!output || !status) return;

        const rangeLabel = ranges.map(range => range.label).join("; ");
        const unsupported = unsupportedBooks.length
            ? ` Runtime witness shard not yet built for: ${unsupportedBooks.join(", ")}.`
            : "";

        status.textContent = `${results.length} patristic witness${results.length === 1 ? "" : "es"} for ${rangeLabel}.${unsupported}`;

        if (!results.length) {
            output.innerHTML = `<div class="bible-guide-empty">No patristic witnesses found in the current runtime slice.</div>`;
            return;
        }

        const limit = 50;
        const visible = results.slice(0, limit);
        const overflow = results.length > limit
            ? `<div class="bible-guide-overflow">Showing first ${limit} of ${results.length}. Narrow the passage for a smaller witness set.</div>`
            : "";

        output.innerHTML = `
            ${overflow}
            ${visible.map(entry => renderWitnessCard(entry)).join("")}
        `;
    }

    function renderWitnessCard(entry) {
        const date = Number.isFinite(Number(entry.time)) ? ` · AD ${entry.time}` : "";
        const source = entry.sourceTitle
            ? `<div class="bible-guide-source">${escapeHtml(entry.sourceTitle)}</div>`
            : `<div class="bible-guide-source bible-guide-source-missing">Source title not supplied.</div>`;
        const link = entry.sourceUrl
            ? `<a class="bible-guide-source-link" href="${escapeHtml(entry.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open source</a>`
            : "";
        const quote = escapeHtml(entry.quote);

        return `
            <article class="bible-guide-card" data-witness-id="${escapeHtml(entry.id)}">
                <div class="bible-guide-card-head">
                    <span class="bible-guide-father">${escapeHtml(entry.authorDisplay || entry.fatherName)}</span>
                    <span class="bible-guide-date">${escapeHtml(date)}</span>
                </div>
                <div class="bible-guide-range">${escapeHtml(entry.range?.label || "")}</div>
                ${source}
                <blockquote>${quote}</blockquote>
                ${link}
            </article>
        `;
    }

    async function loadFathersForCurrentPassage() {
        const status = $("bible-passage-guide-status");
        const output = $("bible-passage-guide-results");
        const ranges = currentPassageRanges();

        if (!ranges.length) {
            if (status) status.textContent = "Open a passage before loading patristic witnesses.";
            if (output) output.innerHTML = "";
            return;
        }

        try {
            if (status) status.textContent = "Loading patristic witnesses…";
            const { results, unsupportedBooks } = await queryFathersForRanges(ranges);
            renderWitnesses(results, ranges, unsupportedBooks);
        } catch (error) {
            if (status) status.textContent = error.message;
            if (output) output.innerHTML = `<div class="bible-guide-error">${escapeHtml(error.message)}</div>`;
        }
    }

    function initializePassageGuide() {
        $("bible-guide-fathers-current")?.addEventListener("click", loadFathersForCurrentPassage);
    }

    window.UniversalOfficePassageGuide = {
        currentPassageRanges,
        queryFathersForRanges,
        loadFathersForCurrentPassage,
    };

    document.addEventListener("DOMContentLoaded", initializePassageGuide);
})();
