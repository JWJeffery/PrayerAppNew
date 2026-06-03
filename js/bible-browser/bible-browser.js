(function () {
    "use strict";

    const STORE_KEYS = {
        lastState: "uo.bibleBrowser.lastState.v1",
        annotations: "uo.bibleBrowser.annotations.v1"
    };

    const bookCache = new Map();
    let currentResolved = [];
    let currentTranslation = "NRSV";
    let parallelEnabled = false;
    let parallelTranslation = "Rotherham";
    let pendingSelection = null;
    let pendingPassageRanges = [];
    let pendingSelectionRect = null;
    let lastContextAnchorRect = null;
    let activeAnnotationId = null;

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

    function getBooks() {
        return window.UniversalOfficeBibleReferenceParser?.BIBLE_BOOKS || [];
    }

    function getBook(bookKey) {
        return window.UniversalOfficeBibleReferenceParser?.getBook(bookKey) || null;
    }

    async function loadBook(bookKey) {
        if (bookCache.has(bookKey)) return bookCache.get(bookKey);

        const book = getBook(bookKey);
        if (!book) throw new Error(`Unknown Bible book: ${bookKey}`);

        const bookUrl = book.path.startsWith("/") ? book.path : `/${book.path}`;
        const response = await fetch(bookUrl);
        if (!response.ok) {
            throw new Error(`Unable to load ${book.name} from ${bookUrl} (HTTP ${response.status}).`);
        }

        const data = await response.json();
        bookCache.set(bookKey, data);
        return data;
    }

    function chapterMap(bookData) {
        const map = new Map();
        for (const chapter of bookData.chapters || []) {
            map.set(Number(chapter.num), chapter);
        }
        return map;
    }

    function verseMap(chapter) {
        const map = new Map();
        for (const verse of chapter.verses || []) {
            map.set(Number(verse.num), verse);
        }
        return map;
    }

    function getVerseText(verse, translation) {
        if (!verse) return "";
        if (typeof verse.text === "string") return verse.text;
        if (verse.text && typeof verse.text === "object") {
            if (verse.text[translation]) return verse.text[translation];
            if (verse.text.NRSV) return verse.text.NRSV;
            const first = Object.values(verse.text).find(Boolean);
            return first || "";
        }
        return "";
    }

    function getVerseTextExact(verse, translation) {
        if (!verse) return { available: false, text: "" };

        if (typeof verse.text === "string") {
            return { available: true, text: verse.text };
        }

        if (verse.text && typeof verse.text === "object" && verse.text[translation]) {
            return { available: true, text: verse.text[translation] };
        }

        return {
            available: false,
            text: `${translation} text is not available for this verse.`
        };
    }

    function getAvailableTranslations(bookData) {
        const fromMeta = Object.keys(bookData?.meta?.translations || {});
        if (fromMeta.length) return fromMeta;

        const found = new Set();
        for (const chapter of bookData?.chapters || []) {
            for (const verse of chapter.verses || []) {
                if (verse.text && typeof verse.text === "object") {
                    Object.keys(verse.text).forEach(key => found.add(key));
                }
            }
        }
        return Array.from(found).sort();
    }

    function getTranslationLabel(bookData, translation) {
        return bookData?.meta?.translations?.[translation]?.label || translation;
    }

    function getParallelTranslationKeys(bookData) {
        const available = getAvailableTranslations(bookData);
        if (!available.length) return [currentTranslation];

        if (!available.includes(currentTranslation)) {
            currentTranslation = bookData?.meta?.defaultTranslation || available[0];
        }

        if (!parallelTranslation || !available.includes(parallelTranslation) || parallelTranslation === currentTranslation) {
            parallelTranslation = available.find(value => value !== currentTranslation) || available[0];
        }

        if (!parallelEnabled || parallelTranslation === currentTranslation) return [currentTranslation];
        return [currentTranslation, parallelTranslation];
    }

    function syncParallelControlsEnabled() {
        const toggle = $("bible-parallel-toggle");
        const select = $("bible-parallel-select");

        if (toggle) toggle.checked = parallelEnabled;
        if (select) select.disabled = !parallelEnabled;
    }


    function formatReferenceLabel(bookName, ref) {
        const start = ref.startVerse === null
            ? `${ref.startChapter}`
            : `${ref.startChapter}:${ref.startVerse}`;
        const end = ref.endVerse === null
            ? `${ref.endChapter}`
            : `${ref.endChapter}:${ref.endVerse}`;
        return start === end ? `${bookName} ${start}` : `${bookName} ${start}-${end}`;
    }

    function formatMissingVerseWarning(bookName, chapter, startVerse, endVerse) {
        if (startVerse === endVerse) {
            return `${bookName} ${chapter}:${startVerse} is not available in the loaded corpus.`;
        }
        return `${bookName} ${chapter}:${startVerse}-${endVerse} are not available in the loaded corpus.`;
    }

    function addUniqueWarning(target, warning) {
        if (!target.includes(warning)) target.push(warning);
    }

    async function resolveReference(parsed) {
        const resolved = [];
        const warnings = [];
        const requestedSegments = [];
        let segmentIndex = 0;

        for (const ref of parsed.references) {
            const book = getBook(ref.bookKey);
            if (!book) throw new Error(`Unknown book key: ${ref.bookKey}`);

            const bookData = await loadBook(ref.bookKey);
            const chapters = chapterMap(bookData);
            const bookName = bookData?.meta?.name || book.name;
            const segmentLabel = formatReferenceLabel(bookName, ref);
            const segment = {
                index: segmentIndex,
                label: segmentLabel,
                requestedRaw: ref.raw,
                bookKey: ref.bookKey,
                status: "unresolved",
                resolvedCount: 0,
                requestedCount: 0,
                missingCount: 0,
                warnings: []
            };
            requestedSegments.push(segment);

            if (ref.endChapter < ref.startChapter) {
                throw new Error(`Reference ends before it starts: ${book.name} ${ref.raw}`);
            }

            for (let ch = ref.startChapter; ch <= ref.endChapter; ch++) {
                const chapter = chapters.get(ch);
                if (!chapter) {
                    const warning = `${bookName} ${ch} does not exist in the loaded corpus.`;
                    addUniqueWarning(warnings, warning);
                    addUniqueWarning(segment.warnings, warning);
                    continue;
                }

                const verses = chapter.verses || [];
                const vmap = verseMap(chapter);

                let startVerse = null;
                let endVerse = null;

                if (ref.startVerse === null && ref.endVerse === null) {
                    startVerse = verses.length ? Number(verses[0].num) : 1;
                    endVerse = verses.length ? Number(verses[verses.length - 1].num) : 1;
                } else if (ch === ref.startChapter && ch === ref.endChapter) {
                    startVerse = ref.startVerse;
                    endVerse = ref.endVerse;
                } else if (ch === ref.startChapter) {
                    startVerse = ref.startVerse;
                    endVerse = verses.length ? Number(verses[verses.length - 1].num) : ref.startVerse;
                } else if (ch === ref.endChapter) {
                    startVerse = verses.length ? Number(verses[0].num) : 1;
                    endVerse = ref.endVerse;
                } else {
                    startVerse = verses.length ? Number(verses[0].num) : 1;
                    endVerse = verses.length ? Number(verses[verses.length - 1].num) : 1;
                }

                let missingStart = null;
                let missingEnd = null;

                const flushMissingRange = () => {
                    if (missingStart === null) return;
                    const warning = formatMissingVerseWarning(bookName, ch, missingStart, missingEnd);
                    addUniqueWarning(warnings, warning);
                    addUniqueWarning(segment.warnings, warning);
                    missingStart = null;
                    missingEnd = null;
                };

                for (let v = startVerse; v <= endVerse; v++) {
                    segment.requestedCount += 1;
                    const verse = vmap.get(v);

                    if (!verse) {
                        segment.missingCount += 1;
                        if (missingStart === null) missingStart = v;
                        missingEnd = v;
                        continue;
                    }

                    flushMissingRange();

                    resolved.push({
                        bookKey: ref.bookKey,
                        bookName,
                        corpus: book.corpus,
                        chapter: ch,
                        verse: v,
                        verseData: verse,
                        bookData,
                        segmentIndex,
                        segmentLabel
                    });
                    segment.resolvedCount += 1;
                }

                flushMissingRange();
            }

            segment.status = segment.resolvedCount === 0
                ? "unresolved"
                : segment.missingCount > 0 || segment.warnings.length
                    ? "partial"
                    : "resolved";

            if (segment.resolvedCount === 0 && !segment.warnings.length) {
                const warning = `${segmentLabel} resolved no verses.`;
                addUniqueWarning(warnings, warning);
                addUniqueWarning(segment.warnings, warning);
            }

            segmentIndex += 1;
        }

        resolved.warnings = Array.from(new Set(warnings));
        resolved.requestedSegments = requestedSegments;
        return resolved;
    }

    function loadLastState() {
        try {
            return JSON.parse(localStorage.getItem(STORE_KEYS.lastState) || "{}");
        } catch {
            return {};
        }
    }

    function saveLastState(extra = {}) {
        const state = {
            citation: $("bible-reference-input")?.value || "",
            translation: currentTranslation,
            parallelEnabled,
            parallelTranslation,
            scope: $("bible-search-scope")?.value || "ALL",
            bookKey: $("bible-book-select")?.value || "",
            chapter: $("bible-chapter-select")?.value || "",
            scrollTop: $("bible-results")?.scrollTop || 0,
            ...extra
        };
        localStorage.setItem(STORE_KEYS.lastState, JSON.stringify(state));
    }

    function loadAnnotations() {
        try {
            const data = JSON.parse(localStorage.getItem(STORE_KEYS.annotations) || "[]");
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function saveAnnotations(annotations) {
        localStorage.setItem(STORE_KEYS.annotations, JSON.stringify(annotations));
    }

    function annotationKey(item) {
        return `${item.bookKey}.${item.chapter}.${item.verse}.${currentTranslation}`;
    }

    function annotationsForVerse(item) {
        const key = annotationKey(item);
        return loadAnnotations()
            .filter(ann => ann.anchorKey === key)
            .sort((a, b) => a.startOffset - b.startOffset);
    }

    function escapeRegExp(value) {
        return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function normalizeSearchNeedles(searchNeedles) {
        if (!searchNeedles) return [];
        if (Array.isArray(searchNeedles)) {
            return searchNeedles
                .map(value => String(value || "").trim())
                .filter(Boolean)
                .sort((a, b) => b.length - a.length);
        }
        const single = String(searchNeedles || "").trim();
        return single ? [single] : [];
    }

    function renderSearchHighlightedText(text, searchNeedles) {
        const source = String(text || "");
        const needles = normalizeSearchNeedles(searchNeedles);
        if (!needles.length) return escapeHtml(source);

        const pattern = new RegExp(needles.map(escapeRegExp).join("|"), "gi");
        let cursor = 0;
        let html = "";
        let match;

        while ((match = pattern.exec(source)) !== null) {
            if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
            html += escapeHtml(source.slice(cursor, match.index));
            html += `<mark class="bible-search-match">${escapeHtml(match[0])}</mark>`;
            cursor = match.index + match[0].length;
        }

        html += escapeHtml(source.slice(cursor));
        return html;
    }

    function renderAnnotatedText(text, annotations, searchTerm = "") {
        if (!annotations.length) return renderSearchHighlightedText(text, searchTerm);

        let cursor = 0;
        let html = "";
        for (const ann of annotations) {
            const start = Math.max(0, Math.min(Number(ann.startOffset), text.length));
            const end = Math.max(start, Math.min(Number(ann.endOffset), text.length));
            if (start < cursor || end <= start) continue;

            html += renderSearchHighlightedText(text.slice(cursor, start), searchTerm);
            const cls = ann.comment ? "bible-highlight has-comment" : "bible-highlight";
            html += `<mark class="${cls}" data-annotation-id="${escapeHtml(ann.id)}" title="${escapeHtml(ann.comment || "Highlight")}">${escapeHtml(text.slice(start, end))}</mark>`;
            cursor = end;
        }
        html += renderSearchHighlightedText(text.slice(cursor), searchTerm);
        return html;
    }

    function renderPassageSummary(items) {
        const summary = $("bible-passage-summary");
        if (!summary) return;

        const segments = items?.requestedSegments || [];
        if (!segments.length) {
            summary.innerHTML = "";
            summary.style.display = "none";
            return;
        }

        const warningList = Array.from(new Set(items.warnings || []));
        const resolvedSegments = segments.filter(segment => segment.status === "resolved").length;
        const partialSegments = segments.filter(segment => segment.status === "partial").length;
        const unresolvedSegments = segments.filter(segment => segment.status === "unresolved").length;

        const segmentRows = segments.map(segment => {
            const statusLabel = segment.status === "resolved"
                ? "resolved"
                : segment.status === "partial"
                    ? "partially resolved"
                    : "not found";
            const warningHtml = segment.warnings?.length
                ? `<ul class="bible-segment-warnings">${segment.warnings.map(w => `<li>${escapeHtml(w)}</li>`).join("")}</ul>`
                : "";
            const scopeHtml = segment.scopeLabel
                ? `<div class="bible-segment-scope">${escapeHtml(segment.scopeLabel)}</div>`
                : "";
            const grammarHtml = segment.searchGrammar
                ? `<div class="bible-segment-grammar">${escapeHtml(segment.searchGrammar)}</div>`
                : "";
            const countText = segment.requestedCount && segment.missingCount
                ? `${segment.resolvedCount} of ${segment.requestedCount} requested verses shown · ${segment.missingCount} unavailable`
                : `${segment.resolvedCount} verse${segment.resolvedCount === 1 ? "" : "s"} shown`;
            return `
                <li class="bible-segment-summary bible-segment-${escapeHtml(segment.status)}">
                    <span class="bible-segment-summary-label">${escapeHtml(segment.label)}</span>
                    <span class="bible-segment-summary-status">${escapeHtml(statusLabel)} · ${escapeHtml(countText)}</span>
                    ${scopeHtml}
                    ${grammarHtml}
                    ${warningHtml}
                </li>
            `;
        }).join("");

        summary.style.display = "block";
        summary.innerHTML = `
            <div class="bible-summary-line">
                ${items.length} verse${items.length === 1 ? "" : "s"} resolved across ${segments.length} requested segment${segments.length === 1 ? "" : "s"}.
                <span>${resolvedSegments} complete · ${partialSegments} partial · ${unresolvedSegments} not found</span>
            </div>
            <ol class="bible-segment-summary-list">${segmentRows}</ol>
        `;
    }

    function renderVerseDisplay(item, searchTerm = "") {
        const translations = getParallelTranslationKeys(item.bookData);
        const annotations = annotationsForVerse(item);

        if (translations.length < 2) {
            const text = getVerseText(item.verseData, currentTranslation);
            return `
                <p class="bible-verse"
                   data-book-key="${escapeHtml(item.bookKey)}"
                   data-chapter="${item.chapter}"
                   data-verse="${item.verse}"
                   data-translation="${escapeHtml(currentTranslation)}">
                    <sup>${item.verse}</sup>
                    <span class="bible-verse-text">${renderAnnotatedText(text, annotations, searchTerm)}</span>
                </p>
            `;
        }

        const primary = getVerseTextExact(item.verseData, currentTranslation);
        const secondary = getVerseTextExact(item.verseData, parallelTranslation);
        const primaryLabel = getTranslationLabel(item.bookData, currentTranslation);
        const secondaryLabel = getTranslationLabel(item.bookData, parallelTranslation);

        return `
            <p class="bible-verse bible-verse-parallel"
               data-book-key="${escapeHtml(item.bookKey)}"
               data-chapter="${item.chapter}"
               data-verse="${item.verse}"
               data-translation="${escapeHtml(currentTranslation)}">
                <sup>${item.verse}</sup>
                <span class="bible-parallel-columns">
                    <span class="bible-parallel-column bible-parallel-primary">
                        <span class="bible-parallel-label">${escapeHtml(primaryLabel)}</span>
                        <span class="bible-verse-text ${primary.available ? "" : "bible-translation-unavailable"}">${renderAnnotatedText(primary.text, annotations, searchTerm)}</span>
                    </span>
                    <span class="bible-parallel-column bible-parallel-secondary">
                        <span class="bible-parallel-label">${escapeHtml(secondaryLabel)}</span>
                        <span class="bible-parallel-text ${secondary.available ? "" : "bible-translation-unavailable"}">${renderSearchHighlightedText(secondary.text, searchTerm)}</span>
                    </span>
                </span>
            </p>
        `;
    }

    function renderResults(items, options = {}) {
        currentResolved = items;
        const output = $("bible-results");
        if (!output) return;

        renderPassageSummary(items);

        if (!items.length) {
            output.innerHTML = `<div class="bible-empty">No verses to display.</div>`;
            renderCurrentNotesList();
            return;
        }

        const segmentMetaByIndex = new Map((items.requestedSegments || []).map(segment => [segment.index, segment]));
        const segmentGroups = [];
        const segmentMap = new Map();

        for (const item of items) {
            const segmentIndex = Number.isFinite(item.segmentIndex) ? item.segmentIndex : 0;
            if (!segmentMap.has(segmentIndex)) {
                const meta = segmentMetaByIndex.get(segmentIndex);
                const segmentGroup = {
                    index: segmentIndex,
                    label: meta?.label || item.segmentLabel || "Search Results",
                    chapters: [],
                    chapterMap: new Map()
                };
                segmentMap.set(segmentIndex, segmentGroup);
                segmentGroups.push(segmentGroup);
            }

            const segmentGroup = segmentMap.get(segmentIndex);
            const chapterKey = `${item.bookKey}.${item.chapter}`;
            if (!segmentGroup.chapterMap.has(chapterKey)) {
                const chapterGroup = {
                    key: chapterKey,
                    bookName: item.bookName,
                    chapter: item.chapter,
                    verses: []
                };
                segmentGroup.chapterMap.set(chapterKey, chapterGroup);
                segmentGroup.chapters.push(chapterGroup);
            }

            segmentGroup.chapterMap.get(chapterKey).verses.push(item);
        }

        output.innerHTML = segmentGroups.map(segment => `
            <section class="bible-segment-block" data-segment-index="${segment.index}">
                <div class="bible-segment-label">${escapeHtml(segment.label)}</div>
                ${segment.chapters.map(group => `
                    <section class="bible-chapter-block">
                        <h3>${escapeHtml(group.bookName)} ${group.chapter}</h3>
                        ${group.verses.map(item => renderVerseDisplay(item, items.searchTerms || items.searchTerm || "")).join("")}
                    </section>
                `).join("")}
            </section>
        `).join("");

        output.querySelectorAll(".bible-highlight").forEach(mark => {
            mark.addEventListener("click", event => {
                event.stopPropagation();
                editAnnotation(mark.dataset.annotationId);
            });
        });

        renderCurrentNotesList();

        if (options.restoreScroll) {
            const state = loadLastState();
            output.scrollTop = Number(state.scrollTop || 0);
        }
    }

    async function syncTranslationSelect(items) {
        const select = $("bible-translation-select");
        const parallelSelect = $("bible-parallel-select");
        if (!items.length) {
            syncParallelControlsEnabled();
            return;
        }

        const bookData = items[0].bookData;
        const translations = getAvailableTranslations(bookData);
        if (!translations.length) {
            syncParallelControlsEnabled();
            return;
        }

        if (!translations.includes(currentTranslation)) {
            currentTranslation = bookData?.meta?.defaultTranslation || translations[0];
        }

        if (!parallelTranslation || !translations.includes(parallelTranslation) || parallelTranslation === currentTranslation) {
            parallelTranslation = translations.find(value => value !== currentTranslation) || translations[0];
        }

        const optionsHtml = translations
            .map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
            .join("");

        if (select) {
            select.innerHTML = optionsHtml;
            select.value = currentTranslation;
        }

        if (parallelSelect) {
            parallelSelect.innerHTML = optionsHtml;
            parallelSelect.value = parallelTranslation;
        }

        syncParallelControlsEnabled();
    }

    async function displayCitation(options = {}) {
        const input = $("bible-reference-input");
        const status = $("bible-status");
        if (!input) return;

        try {
            if (status) status.textContent = "Resolving reference…";
            const parsed = window.UniversalOfficeBibleReferenceParser.parseReference(input.value);
            const resolved = await resolveReference(parsed);
            await syncNavigationControlsFromItems(resolved);
            await syncTranslationSelect(resolved);
            renderResults(resolved, options);
            saveLastState({ citation: input.value });
            if (status) {
                const warningText = resolved.warnings?.length
                    ? ` Warning: ${resolved.warnings.slice(0, 3).join(" ")}`
                    : "";
                status.textContent = `${resolved.length} verse${resolved.length === 1 ? "" : "s"} resolved.${warningText}`;
            }
            history.replaceState(null, "", "/tools/bible");
        } catch (error) {
            if (status) status.textContent = error.message;
            const output = $("bible-results");
            if (output) {
                output.innerHTML = `<div class="bible-error">${escapeHtml(error.message)}</div>`;
            }
        }
    }

    function populateBookSelect() {
        const select = $("bible-book-select");
        if (!select) return;

        const books = getBooks();
        const groups = new Map();
        for (const book of books) {
            if (!groups.has(book.corpus)) groups.set(book.corpus, []);
            groups.get(book.corpus).push(book);
        }

        select.innerHTML = `<option value="">— Book —</option>` + Array.from(groups.entries()).map(([corpus, group]) => `
            <optgroup label="${escapeHtml(corpus)}">
                ${group.map(book => `<option value="${escapeHtml(book.key)}">${escapeHtml(book.name)}</option>`).join("")}
            </optgroup>
        `).join("");
    }

    function populateScopeSelect() {
        const select = $("bible-search-scope");
        if (!select) return;

        const corpora = Array.from(new Set(getBooks().map(book => book.corpus))).sort();
        select.innerHTML = [
            `<option value="ALL">All available Bible books</option>`,
            ...corpora.map(corpus => `<option value="${escapeHtml(corpus)}">${escapeHtml(corpus)}</option>`),
            `<option value="BOOK">Selected book</option>`
        ].join("");
    }

    async function populateChapterSelect(bookKey, selectedChapter = "") {
        const select = $("bible-chapter-select");
        if (!select) return;

        select.innerHTML = `<option value="">— Chapter —</option>`;
        if (!bookKey) return;

        try {
            const bookData = await loadBook(bookKey);
            const chapters = (bookData.chapters || []).map(chapter => Number(chapter.num)).filter(Boolean);
            select.innerHTML = chapters
                .map(chapter => `<option value="${chapter}">${chapter}</option>`)
                .join("");

            const desired = selectedChapter ? Number(selectedChapter) : chapters[0];
            if (chapters.includes(desired)) {
                select.value = String(desired);
            } else if (chapters.length) {
                select.value = String(chapters[0]);
            }
        } catch (error) {
            const status = $("bible-status");
            if (status) status.textContent = error.message;
        }
    }

    async function syncNavigationControlsFromItems(items) {
        if (!items?.length) return;

        const first = items[0];
        const bookSelect = $("bible-book-select");
        if (bookSelect) bookSelect.value = first.bookKey;

        await populateChapterSelect(first.bookKey, first.chapter);
        saveLastState({
            bookKey: first.bookKey,
            chapter: String(first.chapter)
        });
    }

    function tokenizeSearchQuery(query) {
        const source = String(query || "");
        const tokens = [];
        const warnings = [];
        let cursor = 0;

        while (cursor < source.length) {
            const char = source[cursor];

            if (/\s/.test(char)) {
                cursor += 1;
                continue;
            }

            if (char === '"') {
                let end = cursor + 1;
                let phrase = "";
                let closed = false;

                while (end < source.length) {
                    if (source[end] === '"') {
                        closed = true;
                        break;
                    }
                    phrase += source[end];
                    end += 1;
                }

                const value = phrase.trim();
                if (value) tokens.push({ type: "TERM", value, quoted: true });

                if (!closed) {
                    warnings.push("Your search has an unmatched quotation mark; treating the rest as a phrase.");
                    cursor = source.length;
                } else {
                    cursor = end + 1;
                }
                continue;
            }

            let end = cursor;
            while (end < source.length && !/\s/.test(source[end])) end += 1;
            const raw = source.slice(cursor, end);
            const upper = raw.toUpperCase();

            if (upper === "AND" || upper === "OR" || upper === "NOT") {
                tokens.push({ type: upper, value: upper });
            } else {
                tokens.push({ type: "TERM", value: raw, quoted: false });
            }

            cursor = end;
        }

        return { tokens, warnings };
    }

    function parseSearchQuery(query) {
        const { tokens, warnings } = tokenizeSearchQuery(query);
        const groups = [];
        let currentGroup = { required: [], excluded: [] };
        let pending = "AND";

        function pushGroupIfUsed() {
            if (currentGroup.required.length || currentGroup.excluded.length) {
                groups.push(currentGroup);
            }
            currentGroup = { required: [], excluded: [] };
        }

        for (const token of tokens) {
            if (token.type === "OR") {
                pushGroupIfUsed();
                pending = "AND";
                continue;
            }

            if (token.type === "AND") {
                pending = "AND";
                continue;
            }

            if (token.type === "NOT") {
                pending = "NOT";
                continue;
            }

            if (token.type === "TERM") {
                if (pending === "NOT") {
                    currentGroup.excluded.push(token.value);
                } else {
                    currentGroup.required.push(token.value);
                }
                pending = "AND";
            }
        }

        pushGroupIfUsed();

        if (!groups.length) {
            const fallback = String(query || "").trim();
            if (fallback) groups.push({ required: [fallback], excluded: [] });
        }

        const positiveTerms = Array.from(new Set(groups.flatMap(group => group.required)));
        const excludedTerms = Array.from(new Set(groups.flatMap(group => group.excluded)));
        const highlightTerms = positiveTerms.slice();

        const operators = Array.from(new Set(tokens.filter(token => token.type !== "TERM").map(token => token.type)));
        const hasQuotedPhrase = tokens.some(token => token.quoted);
        const grammarLabelParts = [];

        if (hasQuotedPhrase) grammarLabelParts.push("quoted phrase");
        if (operators.includes("AND")) grammarLabelParts.push("AND");
        if (operators.includes("OR")) grammarLabelParts.push("OR");
        if (operators.includes("NOT")) grammarLabelParts.push("NOT");
        if (!grammarLabelParts.length && positiveTerms.length > 1) grammarLabelParts.push("implicit AND");
        if (!grammarLabelParts.length) grammarLabelParts.push("simple term");

        return {
            raw: String(query || ""),
            groups,
            positiveTerms,
            excludedTerms,
            highlightTerms,
            warnings,
            grammarLabel: grammarLabelParts.join(" · ")
        };
    }

    function textMatchesSearchGrammar(text, grammar) {
        const haystack = String(text || "").toLowerCase();

        return grammar.groups.some(group => {
            const requiredOk = group.required.every(term => haystack.includes(String(term).toLowerCase()));
            if (!requiredOk) return false;

            const excludedHit = group.excluded.some(term => haystack.includes(String(term).toLowerCase()));
            return !excludedHit;
        });
    }

    function describeSearchGrammar(grammar) {
        const included = grammar.positiveTerms.length
            ? `include: ${grammar.positiveTerms.map(term => `“${term}”`).join(", ")}`
            : "include: —";
        const excluded = grammar.excludedTerms.length
            ? `exclude: ${grammar.excludedTerms.map(term => `“${term}”`).join(", ")}`
            : "";
        return [grammar.grammarLabel, included, excluded].filter(Boolean).join(" · ");
    }

    function describeSearchScope(scope, selectedBookKey = "") {
        if (scope === "ALL") return "All available Bible books";
        if (scope === "BOOK") {
            const book = getBook(selectedBookKey);
            return book ? `Selected book: ${book.name}` : "Selected book";
        }
        return `Section: ${scope}`;
    }

    function attachSearchMetadata(results, query, scope, selectedBookKey, capped = false, grammar = null) {
        const scopeLabel = describeSearchScope(scope, selectedBookKey);
        const warnings = [
            ...(grammar?.warnings || []),
            ...(capped ? [`Showing first 200 matches for “${query}”. Narrow the scope or search phrase for more specific results.`] : [])
        ];
        results.searchTerm = query;
        results.searchTerms = grammar?.highlightTerms || [query];
        results.searchGrammar = grammar ? describeSearchGrammar(grammar) : "simple term";
        results.warnings = warnings;
        results.requestedSegments = [{
            index: 0,
            label: `Search: “${query}”`,
            requestedRaw: query,
            bookKey: selectedBookKey || "",
            status: results.length ? (capped ? "partial" : "resolved") : "unresolved",
            resolvedCount: results.length,
            requestedCount: results.length,
            missingCount: 0,
            warnings,
            scopeLabel,
            searchGrammar: results.searchGrammar
        }];
        return results;
    }

    async function openSelectedBook() {
        const bookKey = $("bible-book-select")?.value;
        const status = $("bible-status");
        if (!bookKey) {
            if (status) status.textContent = "Choose a book first.";
            return;
        }

        const bookData = await loadBook(bookKey);
        const firstChapter = bookData?.chapters?.[0]?.num || 1;
        const selectedChapter = Number($("bible-chapter-select")?.value || firstChapter);
        const book = getBook(bookKey);

        $("bible-reference-input").value = `${book.name} ${selectedChapter}`;
        await displayCitation();
    }

    async function changeBibleChapter(delta) {
        const bookKey = $("bible-book-select")?.value || currentResolved?.[0]?.bookKey;
        const status = $("bible-status");
        if (!bookKey) {
            if (status) status.textContent = "Choose a book first.";
            return;
        }

        const bookData = await loadBook(bookKey);
        const chapters = (bookData.chapters || []).map(chapter => Number(chapter.num)).filter(Boolean);
        if (!chapters.length) {
            if (status) status.textContent = "No chapters available for selected book.";
            return;
        }

        const chapterSelect = $("bible-chapter-select");
        const activeChapter = Number(chapterSelect?.value || currentResolved?.[0]?.chapter || chapters[0]);
        const activeIndex = Math.max(0, chapters.indexOf(activeChapter));
        const nextIndex = Math.min(chapters.length - 1, Math.max(0, activeIndex + delta));
        const nextChapter = chapters[nextIndex];

        if (chapterSelect) chapterSelect.value = String(nextChapter);

        const book = getBook(bookKey);
        $("bible-reference-input").value = `${book.name} ${nextChapter}`;
        await displayCitation();
    }

    function getSelectionOffsets(container, range) {
        const before = document.createRange();
        before.selectNodeContents(container);
        before.setEnd(range.startContainer, range.startOffset);
        const start = before.toString().length;

        const selected = document.createRange();
        selected.selectNodeContents(container);
        selected.setEnd(range.endContainer, range.endOffset);
        const end = selected.toString().length;

        return { start, end };
    }

    function getAnnotationReferenceLabel(annotation) {
        const book = getBook(annotation.bookKey);
        const bookName = book?.name || annotation.bookKey || "Unknown";
        return `${bookName} ${annotation.chapter}:${annotation.verse}`;
    }

    function annotationsInCurrentView() {
        const visibleKeys = new Set((currentResolved || []).map(item => annotationKey(item)));
        return loadAnnotations()
            .filter(annotation => visibleKeys.has(annotation.anchorKey))
            .sort((a, b) => {
                const aLabel = getAnnotationReferenceLabel(a);
                const bLabel = getAnnotationReferenceLabel(b);
                if (aLabel !== bLabel) return aLabel.localeCompare(bLabel);
                return Number(a.startOffset || 0) - Number(b.startOffset || 0);
            });
    }

    function renderCurrentNotesList() {
        const container = $("bible-current-notes");
        if (!container) return;

        const annotations = annotationsInCurrentView();
        if (!annotations.length) {
            container.innerHTML = `<div class="bible-notes-empty">No highlights or comments in this view.</div>`;
            return;
        }

        container.innerHTML = annotations.map(annotation => {
            const label = getAnnotationReferenceLabel(annotation);
            const excerpt = annotation.selectedText || "Highlight";
            const comment = annotation.comment?.trim()
                ? `<div class="bible-note-comment">${escapeHtml(annotation.comment.trim())}</div>`
                : `<div class="bible-note-comment bible-note-comment-empty">No comment.</div>`;

            return `
                <button class="bible-note-card" type="button" data-annotation-open="${escapeHtml(annotation.id)}">
                    <span class="bible-note-ref">${escapeHtml(label)}</span>
                    <span class="bible-note-excerpt">${escapeHtml(excerpt)}</span>
                    ${comment}
                </button>
            `;
        }).join("");

        container.querySelectorAll("[data-annotation-open]").forEach(button => {
            button.addEventListener("click", () => {
                jumpToAnnotation(button.dataset.annotationOpen);
                openAnnotationEditor(button.dataset.annotationOpen);
            });
        });
    }

    function jumpToAnnotation(annotationId) {
        const annotation = loadAnnotations().find(item => item.id === annotationId);
        if (!annotation) return;

        const verse = Array.from(document.querySelectorAll(".bible-verse")).find(el =>
            el.dataset.bookKey === annotation.bookKey &&
            Number(el.dataset.chapter) === Number(annotation.chapter) &&
            Number(el.dataset.verse) === Number(annotation.verse) &&
            el.dataset.translation === annotation.translation
        );

        if (verse) {
            verse.scrollIntoView({ behavior: "smooth", block: "center" });
            verse.classList.add("bible-verse-focus");
            window.setTimeout(() => verse.classList.remove("bible-verse-focus"), 1200);
        }
    }

    function openAnnotationEditor(annotationId) {
        const annotation = loadAnnotations().find(item => item.id === annotationId);
        if (!annotation) return;

        activeAnnotationId = annotationId;
        const label = `${getAnnotationReferenceLabel(annotation)} · ${annotation.selectedText || "Highlight"}`;
        const anchorRect = lastContextAnchorRect || getAnnotationAnchorRect(annotation);

        const body = showContextPanel({
            title: "Add a note",
            anchorRect,
            html: `
                <div class="bible-context-note-label">${escapeHtml(label)}</div>
                <textarea id="bible-context-note-comment" class="bible-context-note-comment" rows="6" placeholder="Add or edit your note.">${escapeHtml(annotation.comment || "")}</textarea>
                <div class="bible-context-actions">
                    <button class="bible-tool-btn" id="bible-context-save-note" type="button">Save Note</button>
                    <button class="bible-tool-btn" id="bible-context-delete-note" type="button">Delete</button>
                    <button class="bible-tool-btn" id="bible-context-close-note" type="button">Close</button>
                </div>
            `
        });

        body?.querySelector("#bible-context-save-note")?.addEventListener("click", saveAnnotationEditor);
        body?.querySelector("#bible-context-delete-note")?.addEventListener("click", deleteAnnotationEditor);
        body?.querySelector("#bible-context-close-note")?.addEventListener("click", closeAnnotationEditor);
        window.setTimeout(() => body?.querySelector("#bible-context-note-comment")?.focus(), 0);
    }

    function closeAnnotationEditor() {
        const editor = $("bible-annotation-editor");
        if (editor) editor.hidden = true;
        closeContextPanel();
        activeAnnotationId = null;
    }

    function saveAnnotationEditor() {
        if (!activeAnnotationId) return;

        const annotations = loadAnnotations();
        const idx = annotations.findIndex(item => item.id === activeAnnotationId);
        if (idx === -1) {
            closeAnnotationEditor();
            return;
        }

        annotations[idx] = {
            ...annotations[idx],
            comment: $("bible-context-note-comment")?.value ?? $("bible-annotation-comment")?.value ?? "",
            updatedAt: new Date().toISOString()
        };
        saveAnnotations(annotations);
        renderResults(currentResolved);
        openAnnotationEditor(activeAnnotationId);
    }

    function deleteAnnotationEditor() {
        if (!activeAnnotationId) return;

        const annotation = loadAnnotations().find(item => item.id === activeAnnotationId);
        const label = annotation ? getAnnotationReferenceLabel(annotation) : "this highlight";
        if (!window.confirm(`Delete highlight/comment for ${label}?`)) return;

        const annotations = loadAnnotations().filter(item => item.id !== activeAnnotationId);
        saveAnnotations(annotations);
        closeAnnotationEditor();
        renderResults(currentResolved);
    }

    function storedRectFromDomRect(rect) {
        if (!rect) return null;
        return {
            left: Number(rect.left),
            right: Number(rect.right),
            top: Number(rect.top),
            bottom: Number(rect.bottom),
            width: Number(rect.width),
            height: Number(rect.height)
        };
    }

    function positionContextPanel(anchorRect = lastContextAnchorRect) {
        const panel = $("bible-context-panel");
        if (!panel) return;

        const margin = 12;
        const gap = 10;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 768;
        const panelWidth = Math.min(440, Math.max(280, viewportWidth - (margin * 2)));

        panel.style.width = `${panelWidth}px`;
        panel.hidden = false;

        const panelRect = panel.getBoundingClientRect();
        const panelHeight = Math.min(panelRect.height || 320, viewportHeight - (margin * 2));
        const anchor = anchorRect || {
            left: viewportWidth / 2 - 40,
            right: viewportWidth / 2 + 40,
            top: viewportHeight / 2 - 20,
            bottom: viewportHeight / 2 + 20,
            width: 80,
            height: 40
        };

        const canPlaceRight = anchor.right + gap + panelWidth <= viewportWidth - margin;
        const canPlaceLeft = anchor.left - gap - panelWidth >= margin;
        const canPlaceBelow = anchor.bottom + gap + panelHeight <= viewportHeight - margin;

        let left;
        let top;

        if (canPlaceRight) {
            left = anchor.right + gap;
            top = Math.min(Math.max(margin, anchor.top), viewportHeight - panelHeight - margin);
        } else if (canPlaceLeft) {
            left = anchor.left - gap - panelWidth;
            top = Math.min(Math.max(margin, anchor.top), viewportHeight - panelHeight - margin);
        } else {
            left = Math.min(Math.max(margin, anchor.left), viewportWidth - panelWidth - margin);
            if (canPlaceBelow) {
                top = anchor.bottom + gap;
            } else {
                top = Math.max(margin, anchor.top - gap - panelHeight);
            }
        }

        panel.style.left = `${Math.round(left)}px`;
        panel.style.top = `${Math.round(top)}px`;
        panel.style.maxHeight = `${Math.max(240, viewportHeight - (margin * 2))}px`;
    }

    function showContextPanel({ title, html, anchorRect = lastContextAnchorRect }) {
        const panel = $("bible-context-panel");
        const titleEl = $("bible-context-panel-title");
        const body = $("bible-context-panel-body");
        if (!panel || !body) return null;

        if (titleEl) titleEl.textContent = title || "Study Help";
        body.innerHTML = html || "";
        panel.hidden = false;
        lastContextAnchorRect = anchorRect || lastContextAnchorRect;
        window.requestAnimationFrame(() => positionContextPanel(lastContextAnchorRect));
        return body;
    }

    function closeContextPanel() {
        const panel = $("bible-context-panel");
        const body = $("bible-context-panel-body");
        if (body?.querySelector("#bible-context-note-comment")) {
            activeAnnotationId = null;
        }
        if (body) body.innerHTML = "";
        if (panel) panel.hidden = true;
    }

    function getAnnotationAnchorRect(annotation) {
        const verse = Array.from(document.querySelectorAll(".bible-verse")).find(el =>
            el.dataset.bookKey === annotation.bookKey &&
            Number(el.dataset.chapter) === Number(annotation.chapter) &&
            Number(el.dataset.verse) === Number(annotation.verse) &&
            el.dataset.translation === annotation.translation
        );
        return storedRectFromDomRect(verse?.getBoundingClientRect?.());
    }

    function hideSelectionToolbar() {
        const toolbar = $("bible-selection-toolbar");
        if (toolbar) toolbar.style.display = "none";
        pendingSelection = null;
        pendingPassageRanges = [];
        pendingSelectionRect = null;
    }

    function encodeVerseLocation(chapter, verse) {
        return Number(chapter) * 1000000 + Number(verse);
    }

    function formatSelectionRangeLabel(range) {
        if (range.startChapter === range.endChapter && range.startVerse === range.endVerse) {
            return `${range.bookName} ${range.startChapter}:${range.startVerse}`;
        }
        if (range.startChapter === range.endChapter) {
            return `${range.bookName} ${range.startChapter}:${range.startVerse}-${range.endVerse}`;
        }
        return `${range.bookName} ${range.startChapter}:${range.startVerse}-${range.endChapter}:${range.endVerse}`;
    }

    function selectedVerseElements(range) {
        const output = $("bible-results");
        if (!output) return [];

        return Array.from(output.querySelectorAll(".bible-verse"))
            .filter(verseEl => {
                try {
                    return range.intersectsNode(verseEl);
                } catch {
                    return false;
                }
            })
            .sort((a, b) => {
                const aLoc = encodeVerseLocation(a.dataset.chapter, a.dataset.verse);
                const bLoc = encodeVerseLocation(b.dataset.chapter, b.dataset.verse);
                if (a.dataset.bookKey !== b.dataset.bookKey) {
                    return String(a.dataset.bookKey).localeCompare(String(b.dataset.bookKey));
                }
                return aLoc - bLoc;
            });
    }

    function rangesFromSelectedVerses(verseEls) {
        const byBook = new Map();

        for (const verseEl of verseEls) {
            const bookKey = verseEl.dataset.bookKey;
            const chapter = Number(verseEl.dataset.chapter);
            const verse = Number(verseEl.dataset.verse);
            const location = encodeVerseLocation(chapter, verse);
            const book = getBook(bookKey);
            const bookName = book?.name || bookKey;

            if (!byBook.has(bookKey)) {
                byBook.set(bookKey, {
                    book: bookKey,
                    bookName,
                    startChapter: chapter,
                    startVerse: verse,
                    endChapter: chapter,
                    endVerse: verse,
                    startLocation: location,
                    endLocation: location,
                    verseCount: 0
                });
            }

            const range = byBook.get(bookKey);
            range.verseCount += 1;

            if (location < range.startLocation) {
                range.startLocation = location;
                range.startChapter = chapter;
                range.startVerse = verse;
            }

            if (location > range.endLocation) {
                range.endLocation = location;
                range.endChapter = chapter;
                range.endVerse = verse;
            }
        }

        return Array.from(byBook.values()).map(range => ({
            ...range,
            label: formatSelectionRangeLabel(range)
        }));
    }

    function setSelectionToolbarMode({ allowAnnotation }) {
        const highlight = $("bible-highlight-btn");
        const comment = $("bible-comment-btn");
        const fathers = $("bible-fathers-selection-btn");

        if (highlight) {
            highlight.disabled = !allowAnnotation;
            highlight.title = allowAnnotation ? "Highlight selected verse text" : "Highlighting currently supports one verse at a time";
        }

        if (comment) {
            comment.disabled = !allowAnnotation;
            comment.title = allowAnnotation ? "Comment on selected verse text" : "Commenting currently supports one verse at a time";
        }

        if (fathers) {
            fathers.disabled = !pendingPassageRanges.length;
            fathers.title = pendingPassageRanges.length
                ? "Search patristic witnesses for the selected passage"
                : "Select Bible text first";
        }
    }

    function handleSelection() {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            hideSelectionToolbar();
            return;
        }

        const range = selection.getRangeAt(0);
        const browser = $("bible-browser-section");
        const output = $("bible-results");

        if (!browser || !output || !browser.contains(range.commonAncestorContainer)) {
            hideSelectionToolbar();
            return;
        }

        const verseEls = selectedVerseElements(range);
        if (!verseEls.length) {
            hideSelectionToolbar();
            return;
        }

        pendingPassageRanges = rangesFromSelectedVerses(verseEls);
        pendingSelection = null;

        const verseEl = verseEls.length === 1 ? verseEls[0] : null;
        const textEl = verseEl?.querySelector(".bible-verse-text") || null;
        let allowAnnotation = false;

        if (verseEl && textEl && textEl.contains(range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement)) {
            const offsets = getSelectionOffsets(textEl, range);
            if (offsets.end > offsets.start) {
                pendingSelection = {
                    anchorKey: `${verseEl.dataset.bookKey}.${verseEl.dataset.chapter}.${verseEl.dataset.verse}.${verseEl.dataset.translation}`,
                    bookKey: verseEl.dataset.bookKey,
                    chapter: Number(verseEl.dataset.chapter),
                    verse: Number(verseEl.dataset.verse),
                    translation: verseEl.dataset.translation,
                    startOffset: offsets.start,
                    endOffset: offsets.end,
                    selectedText: selection.toString()
                };
                allowAnnotation = true;
            }
        }

        const rect = range.getBoundingClientRect();
        pendingSelectionRect = storedRectFromDomRect(rect);
        lastContextAnchorRect = pendingSelectionRect || lastContextAnchorRect;

        const toolbar = $("bible-selection-toolbar");
        if (toolbar) {
            setSelectionToolbarMode({ allowAnnotation });
            toolbar.style.display = "flex";
            toolbar.style.left = `${Math.max(12, rect.left + window.scrollX)}px`;
            toolbar.style.top = `${Math.max(12, rect.top + window.scrollY - 42)}px`;
        }
    }

    function addAnnotation(withComment) {
        if (!pendingSelection) {
            const status = $("bible-status");
            if (status) status.textContent = "Highlighting and notes currently work with one selected verse at a time.";
            return;
        }

        const anchorRect = pendingSelectionRect || lastContextAnchorRect;
        const annotationId = `ann-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const annotations = loadAnnotations();
        annotations.push({
            id: annotationId,
            ...pendingSelection,
            comment: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        saveAnnotations(annotations);
        lastContextAnchorRect = anchorRect || lastContextAnchorRect;
        hideSelectionToolbar();
        window.getSelection()?.removeAllRanges();
        renderResults(currentResolved);
        saveLastState();

        if (withComment) {
            openAnnotationEditor(annotationId);
        }
    }

    function editAnnotation(annotationId) {
        openAnnotationEditor(annotationId);
    }

    async function loadFathersForSelection() {
        const status = $("bible-status");
        if (!pendingPassageRanges.length) {
            if (status) status.textContent = "Select Bible text before asking what the Fathers say.";
            return;
        }

        const ranges = pendingPassageRanges.slice();
        const anchorRect = pendingSelectionRect || lastContextAnchorRect;
        lastContextAnchorRect = anchorRect || lastContextAnchorRect;

        hideSelectionToolbar();
        window.getSelection()?.removeAllRanges();

        if (!window.UniversalOfficePassageGuide?.loadFathersForRanges) {
            if (status) status.textContent = "Study Helps are not available yet.";
            return;
        }

        const label = ranges.map(range => range.label).join("; ");
        const body = showContextPanel({
            title: "What the Fathers Say",
            anchorRect,
            html: `<div class="bible-guide-empty">Looking up Church Fathers commentary for ${escapeHtml(label)}…</div>`
        });

        if (status) status.textContent = `Looking up Church Fathers commentary for ${label}…`;
        await window.UniversalOfficePassageGuide.loadFathersForRanges(ranges, "selected passage", { targetElement: body });
        if (status) status.textContent = `Loaded Church Fathers commentary for ${label}.`;
    }

    async function searchBible() {
        const query = $("bible-search-input")?.value?.trim() || "";
        const status = $("bible-status");
        if (!query) {
            if (status) status.textContent = "Enter words to search for."; 
            return;
        }

        const scope = $("bible-search-scope")?.value || "ALL";
        const selectedBook = $("bible-book-select")?.value || "";
        const books = getBooks().filter(book => {
            if (scope === "ALL") return true;
            if (scope === "BOOK") return book.key === selectedBook;
            return book.corpus === scope;
        });

        if (!books.length) {
            if (status) status.textContent = "No books match where you chose to search.";
            const empty = attachSearchMetadata([], query, scope, selectedBook, false);
            renderResults(empty);
            return;
        }

        const grammar = parseSearchQuery(query);
        const results = [];
        let capped = false;
        if (status) status.textContent = `Searching ${books.length} book${books.length === 1 ? "" : "s"}…`;

        for (const book of books) {
            try {
                const data = await loadBook(book.key);
                for (const chapter of data.chapters || []) {
                    for (const verse of chapter.verses || []) {
                        const text = getVerseText(verse, currentTranslation);
                        if (textMatchesSearchGrammar(text, grammar)) {
                            results.push({
                                bookKey: book.key,
                                bookName: data?.meta?.name || book.name,
                                corpus: book.corpus,
                                chapter: Number(chapter.num),
                                verse: Number(verse.num),
                                verseData: verse,
                                bookData: data,
                                segmentIndex: 0,
                                segmentLabel: `Search: “${query}”`
                            });
                            if (results.length >= 200) {
                                capped = true;
                                break;
                            }
                        }
                    }
                    if (capped) break;
                }
            } catch (error) {
                console.warn("[bible-search] skipping book:", book.key, error);
            }
            if (capped) break;
        }

        attachSearchMetadata(results, query, scope, selectedBook, capped, grammar);
        await syncTranslationSelect(results);
        renderResults(results);
        if (status) {
            status.textContent = capped
                ? `Showing first 200 matches for “${query}”.`
                : `${results.length} search result${results.length === 1 ? "" : "s"} for “${query}”.`;
        }
        saveLastState({
            scope,
            bookKey: selectedBook
        });
    }

    function exportAnnotations() {
        const blob = new Blob([JSON.stringify(loadAnnotations(), null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "universal-office-bible-annotations.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function importAnnotationsFromFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(String(reader.result || "[]"));
                if (!Array.isArray(data)) throw new Error("Annotation import must be a JSON array.");

                const normalized = data.map((annotation, index) => {
                    if (!annotation || typeof annotation !== "object") {
                        throw new Error(`Annotation import item ${index + 1} is not an object.`);
                    }
                    if (!annotation.anchorKey || !annotation.bookKey || !annotation.chapter || !annotation.verse) {
                        throw new Error(`Annotation import item ${index + 1} is missing required anchor fields.`);
                    }
                    return {
                        id: annotation.id || `ann-import-${Date.now()}-${index}`,
                        type: annotation.type || "highlight",
                        anchorKey: String(annotation.anchorKey),
                        bookKey: String(annotation.bookKey),
                        chapter: Number(annotation.chapter),
                        verse: Number(annotation.verse),
                        translation: String(annotation.translation || currentTranslation),
                        startOffset: Number(annotation.startOffset || 0),
                        endOffset: Number(annotation.endOffset || 0),
                        selectedText: String(annotation.selectedText || ""),
                        comment: String(annotation.comment || ""),
                        createdAt: annotation.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                });

                saveAnnotations(normalized);
                closeAnnotationEditor();
                renderResults(currentResolved);
                $("bible-status").textContent = `Imported ${normalized.length} annotation${normalized.length === 1 ? "" : "s"}.`;
            } catch (error) {
                $("bible-status").textContent = error.message;
            }
        };
        reader.readAsText(file);
    }

    async function initializeBibleBrowser() {
        populateBookSelect();
        populateScopeSelect();

        $("bible-reference-go")?.addEventListener("click", () => displayCitation());
        $("bible-reference-input")?.addEventListener("keydown", event => {
            if (event.key === "Enter") displayCitation();
        });
        $("bible-translation-select")?.addEventListener("change", event => {
            currentTranslation = event.target.value;
            if (parallelTranslation === currentTranslation && currentResolved?.[0]?.bookData) {
                const alternatives = getAvailableTranslations(currentResolved[0].bookData).filter(value => value !== currentTranslation);
                parallelTranslation = alternatives[0] || parallelTranslation;
            }
            syncTranslationSelect(currentResolved);
            renderResults(currentResolved);
            saveLastState();
        });
        $("bible-parallel-toggle")?.addEventListener("change", event => {
            parallelEnabled = event.target.checked;
            syncTranslationSelect(currentResolved);
            renderResults(currentResolved);
            saveLastState();
        });
        $("bible-parallel-select")?.addEventListener("change", event => {
            parallelTranslation = event.target.value;
            renderResults(currentResolved);
            saveLastState();
        });
        $("bible-book-select")?.addEventListener("change", async event => {
            await populateChapterSelect(event.target.value);
            saveLastState();
        });
        $("bible-chapter-select")?.addEventListener("change", () => {
            saveLastState();
        });
        $("bible-book-open")?.addEventListener("click", openSelectedBook);
        $("bible-prev-chapter")?.addEventListener("click", () => changeBibleChapter(-1));
        $("bible-next-chapter")?.addEventListener("click", () => changeBibleChapter(1));
        $("bible-search-go")?.addEventListener("click", searchBible);
        $("bible-search-input")?.addEventListener("keydown", event => {
            if (event.key === "Enter") searchBible();
        });
        $("bible-highlight-btn")?.addEventListener("click", () => addAnnotation(false));
        $("bible-comment-btn")?.addEventListener("click", () => addAnnotation(true));
        $("bible-fathers-selection-btn")?.addEventListener("click", loadFathersForSelection);
        $("bible-export-annotations")?.addEventListener("click", exportAnnotations);
        $("bible-import-annotations")?.addEventListener("change", event => importAnnotationsFromFile(event.target.files?.[0]));
        $("bible-save-annotation")?.addEventListener("click", saveAnnotationEditor);
        $("bible-delete-annotation")?.addEventListener("click", deleteAnnotationEditor);
        $("bible-close-annotation")?.addEventListener("click", closeAnnotationEditor);
        $("bible-context-panel-close")?.addEventListener("click", closeContextPanel);

        $("bible-results")?.addEventListener("scroll", () => saveLastState());
        document.addEventListener("mouseup", () => setTimeout(handleSelection, 0));

        const state = loadLastState();
        if (state.translation) currentTranslation = state.translation;
        if (typeof state.parallelEnabled === "boolean") parallelEnabled = state.parallelEnabled;
        if (state.parallelTranslation) parallelTranslation = state.parallelTranslation;
        syncParallelControlsEnabled();
        if (state.citation && $("bible-reference-input")) $("bible-reference-input").value = state.citation;
        if (state.scope && $("bible-search-scope")) $("bible-search-scope").value = state.scope;
        if (state.bookKey && $("bible-book-select")) {
            $("bible-book-select").value = state.bookKey;
            await populateChapterSelect(state.bookKey, state.chapter || "");
        }

        if (location.pathname === "/tools/bible") {
            openBibleBrowser({ restore: true });
        }
    }

    function openBibleBrowser(options = {}) {
        const splash = $("splash-bg");
        const modeSelection = $("mode-selection");
        const daily = $("daily-office-section");
        const prayers = $("individual-prayers-section");
        const bible = $("bible-browser-section");

        if (splash) splash.style.display = "none";
        if (modeSelection) modeSelection.style.display = "none";
        if (daily) daily.style.display = "none";
        if (prayers) prayers.style.display = "none";
        if (bible) bible.style.display = "flex";

        document.body.classList.add("office-active");
        document.body.classList.remove("ethiopian-theme");

        const state = loadLastState();
        const input = $("bible-reference-input");
        if (input && !input.value.trim()) {
            input.value = state.citation || "Hebrews 2:15-3:8; 4:16";
        }

        history.replaceState(null, "", "/tools/bible");
        displayCitation({ restoreScroll: options.restore });
    }

    function closeBibleBrowser() {
        const bible = $("bible-browser-section");
        const splash = $("splash-bg");
        const modeSelection = $("mode-selection");

        saveLastState();
        if (bible) bible.style.display = "none";
        if (splash) splash.style.display = "";
        if (modeSelection) modeSelection.style.display = "";
        document.body.classList.remove("office-active");
        hideSelectionToolbar();
        history.replaceState(null, "", "/");
    }

    window.openBibleBrowser = openBibleBrowser;
    window.closeBibleBrowser = closeBibleBrowser;
    window.UniversalOfficeBibleBrowser = {
        open: openBibleBrowser,
        close: closeBibleBrowser,
        displayCitation,
        openSelectedBook,
        changeBibleChapter,
        searchBible,
        parseSearchQuery,
        getCurrentResolved() {
            return currentResolved || [];
        },
        getPendingPassageRanges() {
            return pendingPassageRanges || [];
        },
        openContextPanel: showContextPanel,
        closeContextPanel,
        loadFathersForSelection,
        setParallelReader(enabled, translation = parallelTranslation) {
            parallelEnabled = Boolean(enabled);
            parallelTranslation = translation || parallelTranslation;
            syncTranslationSelect(currentResolved);
            renderResults(currentResolved);
            saveLastState();
        },
        exportAnnotations,
        loadAnnotations,
        renderCurrentNotesList,
        openAnnotationEditor
    };

    document.addEventListener("DOMContentLoaded", initializeBibleBrowser);
})();
