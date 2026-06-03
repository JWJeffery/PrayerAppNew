(function () {
    "use strict";

    const STORE_KEYS = {
        lastState: "uo.bibleBrowser.lastState.v1",
        annotations: "uo.bibleBrowser.annotations.v1"
    };

    const bookCache = new Map();
    let currentResolved = [];
    let currentTranslation = "NRSV";
    let pendingSelection = null;

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

    function formatReferenceLabel(bookName, ref) {
        const start = ref.startVerse === null
            ? `${ref.startChapter}`
            : `${ref.startChapter}:${ref.startVerse}`;
        const end = ref.endVerse === null
            ? `${ref.endChapter}`
            : `${ref.endChapter}:${ref.endVerse}`;
        return start === end ? `${bookName} ${start}` : `${bookName} ${start}-${end}`;
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
                warnings: []
            };
            requestedSegments.push(segment);

            if (ref.endChapter < ref.startChapter) {
                throw new Error(`Reference ends before it starts: ${book.name} ${ref.raw}`);
            }

            let segmentResolved = 0;

            for (let ch = ref.startChapter; ch <= ref.endChapter; ch++) {
                const chapter = chapters.get(ch);
                if (!chapter) {
                    const warning = `${bookName} ${ch} does not exist in the loaded corpus.`;
                    warnings.push(warning);
                    segment.warnings.push(warning);
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

                for (let v = startVerse; v <= endVerse; v++) {
                    const verse = vmap.get(v);
                    if (!verse) {
                        const warning = `${bookName} ${ch}:${v} does not exist in the loaded corpus.`;
                        warnings.push(warning);
                        segment.warnings.push(warning);
                        continue;
                    }

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
                    segmentResolved += 1;
                }
            }

            segment.resolvedCount = segmentResolved;
            segment.status = segmentResolved === 0
                ? "unresolved"
                : segment.warnings.length
                    ? "partial"
                    : "resolved";

            if (segmentResolved === 0) {
                const warning = `${segmentLabel} resolved no verses.`;
                warnings.push(warning);
                segment.warnings.push(warning);
            }

            segmentIndex += 1;
        }

        if (!resolved.length) {
            throw new Error(warnings[0] || "Reference parsed, but no verses were resolved.");
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

    function renderSearchHighlightedText(text, searchTerm) {
        const source = String(text || "");
        const needle = String(searchTerm || "").trim();
        if (!needle) return escapeHtml(source);

        const pattern = new RegExp(escapeRegExp(needle), "gi");
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

            html += escapeHtml(text.slice(cursor, start));
            const cls = ann.comment ? "bible-highlight has-comment" : "bible-highlight";
            html += `<mark class="${cls}" data-annotation-id="${escapeHtml(ann.id)}" title="${escapeHtml(ann.comment || "Highlight")}">${escapeHtml(text.slice(start, end))}</mark>`;
            cursor = end;
        }
        html += escapeHtml(text.slice(cursor));
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
            return `
                <li class="bible-segment-summary bible-segment-${escapeHtml(segment.status)}">
                    <span class="bible-segment-summary-label">${escapeHtml(segment.label)}</span>
                    <span class="bible-segment-summary-status">${escapeHtml(statusLabel)} · ${segment.resolvedCount} verse${segment.resolvedCount === 1 ? "" : "s"}</span>
                    ${scopeHtml}
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

    function renderResults(items, options = {}) {
        currentResolved = items;
        const output = $("bible-results");
        if (!output) return;

        renderPassageSummary(items);

        if (!items.length) {
            output.innerHTML = `<div class="bible-empty">No verses to display.</div>`;
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
                        ${group.verses.map(item => {
                            const text = getVerseText(item.verseData, currentTranslation);
                            const annotations = annotationsForVerse(item);
                            return `
                                <p class="bible-verse"
                                   data-book-key="${escapeHtml(item.bookKey)}"
                                   data-chapter="${item.chapter}"
                                   data-verse="${item.verse}"
                                   data-translation="${escapeHtml(currentTranslation)}">
                                    <sup>${item.verse}</sup>
                                    <span class="bible-verse-text">${renderAnnotatedText(text, annotations, items.searchTerm || "")}</span>
                                </p>
                            `;
                        }).join("")}
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

        if (options.restoreScroll) {
            const state = loadLastState();
            output.scrollTop = Number(state.scrollTop || 0);
        }
    }

    async function syncTranslationSelect(items) {
        const select = $("bible-translation-select");
        if (!select || !items.length) return;

        const bookData = items[0].bookData;
        const translations = getAvailableTranslations(bookData);
        if (!translations.length) return;

        if (!translations.includes(currentTranslation)) {
            currentTranslation = bookData?.meta?.defaultTranslation || translations[0];
        }

        select.innerHTML = translations
            .map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
            .join("");
        select.value = currentTranslation;
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
            `<option value="ALL">All corpora in browser registry</option>`,
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

    function describeSearchScope(scope, selectedBookKey = "") {
        if (scope === "ALL") return "All corpora in browser registry";
        if (scope === "BOOK") {
            const book = getBook(selectedBookKey);
            return book ? `Selected book: ${book.name}` : "Selected book";
        }
        return `Corpus: ${scope}`;
    }

    function attachSearchMetadata(results, query, scope, selectedBookKey, capped = false) {
        const scopeLabel = describeSearchScope(scope, selectedBookKey);
        const warnings = capped
            ? [`Showing first 200 matches for “${query}”. Narrow the scope or search phrase for more specific results.`]
            : [];
        results.searchTerm = query;
        results.warnings = warnings;
        results.requestedSegments = [{
            index: 0,
            label: `Search: “${query}”`,
            requestedRaw: query,
            bookKey: selectedBookKey || "",
            status: results.length ? (capped ? "partial" : "resolved") : "unresolved",
            resolvedCount: results.length,
            warnings,
            scopeLabel
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

    function hideSelectionToolbar() {
        const toolbar = $("bible-selection-toolbar");
        if (toolbar) toolbar.style.display = "none";
        pendingSelection = null;
    }

    function handleSelection() {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            hideSelectionToolbar();
            return;
        }

        const range = selection.getRangeAt(0);
        const verseEl = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
            ? range.commonAncestorContainer.closest?.(".bible-verse")
            : range.commonAncestorContainer.parentElement?.closest?.(".bible-verse");

        if (!verseEl || !$("bible-browser-section")?.contains(verseEl)) {
            hideSelectionToolbar();
            return;
        }

        const textEl = verseEl.querySelector(".bible-verse-text");
        if (!textEl) {
            hideSelectionToolbar();
            return;
        }

        const offsets = getSelectionOffsets(textEl, range);
        if (offsets.end <= offsets.start) {
            hideSelectionToolbar();
            return;
        }

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

        const rect = range.getBoundingClientRect();
        const toolbar = $("bible-selection-toolbar");
        if (toolbar) {
            toolbar.style.display = "flex";
            toolbar.style.left = `${Math.max(12, rect.left + window.scrollX)}px`;
            toolbar.style.top = `${Math.max(12, rect.top + window.scrollY - 42)}px`;
        }
    }

    function addAnnotation(withComment) {
        if (!pendingSelection) return;

        const comment = withComment ? window.prompt("Comment for this highlight:", "") : "";
        if (withComment && comment === null) return;

        const annotations = loadAnnotations();
        annotations.push({
            id: `ann-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            ...pendingSelection,
            comment: comment || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        saveAnnotations(annotations);
        hideSelectionToolbar();
        window.getSelection()?.removeAllRanges();
        renderResults(currentResolved);
        saveLastState();
    }

    function editAnnotation(annotationId) {
        const annotations = loadAnnotations();
        const idx = annotations.findIndex(ann => ann.id === annotationId);
        if (idx === -1) return;

        const ann = annotations[idx];
        const next = window.prompt("Edit comment. Type DELETE to remove this highlight.", ann.comment || "");
        if (next === null) return;

        if (next.trim().toUpperCase() === "DELETE") {
            annotations.splice(idx, 1);
        } else {
            annotations[idx] = {
                ...ann,
                comment: next,
                updatedAt: new Date().toISOString()
            };
        }

        saveAnnotations(annotations);
        renderResults(currentResolved);
    }

    async function searchBible() {
        const query = $("bible-search-input")?.value?.trim() || "";
        const status = $("bible-status");
        if (!query) {
            if (status) status.textContent = "Enter search text.";
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
            if (status) status.textContent = "No books match the selected search scope.";
            const empty = attachSearchMetadata([], query, scope, selectedBook, false);
            renderResults(empty);
            return;
        }

        const needle = query.toLowerCase();
        const results = [];
        let capped = false;
        if (status) status.textContent = `Searching ${books.length} book${books.length === 1 ? "" : "s"}…`;

        for (const book of books) {
            try {
                const data = await loadBook(book.key);
                for (const chapter of data.chapters || []) {
                    for (const verse of chapter.verses || []) {
                        const text = getVerseText(verse, currentTranslation);
                        if (String(text).toLowerCase().includes(needle)) {
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

        attachSearchMetadata(results, query, scope, selectedBook, capped);
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
                saveAnnotations(data);
                renderResults(currentResolved);
                $("bible-status").textContent = `Imported ${data.length} annotation${data.length === 1 ? "" : "s"}.`;
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
        $("bible-export-annotations")?.addEventListener("click", exportAnnotations);
        $("bible-import-annotations")?.addEventListener("change", event => importAnnotationsFromFile(event.target.files?.[0]));

        $("bible-results")?.addEventListener("scroll", () => saveLastState());
        document.addEventListener("mouseup", () => setTimeout(handleSelection, 0));

        const state = loadLastState();
        if (state.translation) currentTranslation = state.translation;
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
            input.value = state.citation || "Hebrews 2:15-3:8; 8:16";
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
        exportAnnotations,
        loadAnnotations
    };

    document.addEventListener("DOMContentLoaded", initializeBibleBrowser);
})();
