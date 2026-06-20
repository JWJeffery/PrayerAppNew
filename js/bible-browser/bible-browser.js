(function () {
    "use strict";

    const STORE_KEYS = {
        lastState: "uo.bibleBrowser.lastState.v1",
        annotations: "uo.bibleBrowser.annotations.v1",
        fathersNotebook: "uo.bibleBrowser.fathersNotebook.v1"
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
    let currentHighlightColor = "yellow";

    const HIGHLIGHT_COLORS = [
        { key: "yellow", label: "Yellow", cssClass: "bible-highlight-swatch-yellow" },
        { key: "pink", label: "Pink", cssClass: "bible-highlight-swatch-pink" },
        { key: "green", label: "Green", cssClass: "bible-highlight-swatch-green" },
        { key: "blue", label: "Blue", cssClass: "bible-highlight-swatch-blue" },
        { key: "purple", label: "Purple", cssClass: "bible-highlight-swatch-purple" }
    ];

    function highlightColorKey(value) {
        const key = String(value || "").toLowerCase();
        return HIGHLIGHT_COLORS.some(color => color.key === key) ? key : "yellow";
    }

    function renderHighlightColorOptions(selected = currentHighlightColor) {
        const active = highlightColorKey(selected);
        return HIGHLIGHT_COLORS
            .map(color => `<option value="${escapeHtml(color.key)}"${color.key === active ? " selected" : ""}>${escapeHtml(color.label)}</option>`)
            .join("");
    }

    function renderHighlightColorSwatches(selected = currentHighlightColor, dataAttribute = "data-highlight-color") {
        const active = highlightColorKey(selected);
        return HIGHLIGHT_COLORS
            .map(color => `
                <button
                    class="bible-highlight-swatch ${escapeHtml(color.cssClass)}${color.key === active ? " is-active" : ""}"
                    type="button"
                    ${dataAttribute}="${escapeHtml(color.key)}"
                    aria-label="${escapeHtml(color.label)} highlight"
                    aria-pressed="${color.key === active ? "true" : "false"}"
                    title="${escapeHtml(color.label)}">
                </button>
            `)
            .join("");
    }

    function syncHighlightColorControl() {
        const select = $("bible-highlight-color");
        if (select) select.value = currentHighlightColor;

        document.querySelectorAll("[data-highlight-color]").forEach(button => {
            const isActive = highlightColorKey(button.dataset.highlightColor) === currentHighlightColor;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
    }

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

    function getPsalterRecords(bookData) {
        if (Array.isArray(bookData)) return bookData;
        if (Array.isArray(bookData?.psalms)) return bookData.psalms;
        return [];
    }

    function psalterRecordNumber(record) {
        const match = String(record?.id || "").match(/^PSALMS?\s+(\d+)$/i);
        return match ? Number(match[1]) : null;
    }

    function splitPsalmVerseText(value, psalmNumber) {
        const verses = new Map();
        const lines = String(value || "")
            .split(/\n+/)
            .map(line => line.trim())
            .filter(Boolean);

        const markerPattern = new RegExp(`^(?:${psalmNumber}:)?(\\d+)\\s+(.+)$`);
        let currentVerseNum = null;

        for (const line of lines) {
            const match = line.match(markerPattern);

            if (match) {
                const verseNum = Number(match[1]);
                const verseText = String(match[2] || "").trim();

                if (Number.isFinite(verseNum) && verseText) {
                    verses.set(verseNum, verseText);
                    currentVerseNum = verseNum;
                }

                continue;
            }

            if (currentVerseNum !== null && verses.has(currentVerseNum)) {
                verses.set(currentVerseNum, `${verses.get(currentVerseNum)} ${line}`.trim());
            }
        }

        return verses;
    }

    function normalizePsalterRecord(record) {
        const psalmNumber = psalterRecordNumber(record);
        if (!psalmNumber) return null;

        const byVerse = new Map();
        const texts = record?.text && typeof record.text === "object"
            ? record.text
            : { NRSV: record?.text || "" };

        for (const [translation, value] of Object.entries(texts)) {
            for (const [verseNum, verseText] of splitPsalmVerseText(value, psalmNumber)) {
                if (!byVerse.has(verseNum)) {
                    byVerse.set(verseNum, { num: verseNum, text: {} });
                }

                byVerse.get(verseNum).text[translation] = verseText;
            }
        }

        return {
            id: record.id,
            num: psalmNumber,
            verses: Array.from(byVerse.values())
                .sort((a, b) => Number(a.num) - Number(b.num))
        };
    }

    function chapterMap(bookData) {
        const map = new Map();
        const psalterRecords = getPsalterRecords(bookData);

        if (psalterRecords.length) {
            for (const record of psalterRecords) {
                const chapter = normalizePsalterRecord(record);
                if (chapter) map.set(Number(chapter.num), chapter);
            }

            return map;
        }

        for (const chapter of bookData?.chapters || []) {
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
        const preferredOrder = [
            "NRSV",
            "Rotherham",
            "KJV",
            "DRV",
            "DRB",
            "NABRE",
            "Coverdale",
            "Grail1963",
            "JPS1985",
            "Orthodox"
        ];

        const found = new Set();

        Object.keys(bookData?.meta?.translations || {}).forEach(key => {
            if (key) found.add(key);
        });

        function collect(value) {
            if (!value) return;

            if (Array.isArray(value)) {
                value.forEach(collect);
                return;
            }

            if (typeof value !== "object") return;

            if (value.text && typeof value.text === "object" && !Array.isArray(value.text)) {
                Object.keys(value.text).forEach(key => {
                    if (key) found.add(key);
                });
            }

            Object.values(value).forEach(collect);
        }

        collect(bookData?.chapters);
        collect(bookData?.verses);

        if (bookData?.text && typeof bookData.text === "object" && !Array.isArray(bookData.text)) {
            Object.keys(bookData.text).forEach(key => {
                if (key) found.add(key);
            });
        }

        const ordered = preferredOrder.filter(key => found.has(key));
        const remaining = Array.from(found)
            .filter(key => !preferredOrder.includes(key))
            .sort((a, b) => a.localeCompare(b));

        return [...ordered, ...remaining];
    }

    function getTranslationLabel(bookData, translation) {
        return bookData?.meta?.translations?.[translation]?.label || translation;
    }

    function getParallelTranslationKeys(bookData) {
        return getAvailableTranslations(bookData);
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
            return `${bookName} ${chapter}:${startVerse} is not available in the available Bible text.`;
        }
        return `${bookName} ${chapter}:${startVerse}-${endVerse} are not available in the available Bible text.`;
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
                    const warning = `${bookName} ${ch} does not exist in the available Bible text.`;
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
            highlightColor: currentHighlightColor,
            scope: $("bible-search-scope")?.value || "ALL",
            bookKey: $("bible-book-select")?.value || "",
            chapter: $("bible-chapter-select")?.value || "",
            scrollTop: $("bible-results")?.scrollTop || 0,
            ...extra
        };
        localStorage.setItem(STORE_KEYS.lastState, JSON.stringify(state));
    }

    function segmentAnchorKey(segment) {
        return `${segment.bookKey}.${segment.chapter}.${segment.verse}.${segment.translation || currentTranslation}`;
    }

    function normalizeAnnotation(annotation, index = 0) {
        if (!annotation || typeof annotation !== "object") return null;

        const sourceSegments = Array.isArray(annotation.segments) && annotation.segments.length
            ? annotation.segments
            : [{
                anchorKey: annotation.anchorKey,
                bookKey: annotation.bookKey,
                chapter: annotation.chapter,
                verse: annotation.verse,
                translation: annotation.translation,
                startOffset: annotation.startOffset,
                endOffset: annotation.endOffset,
                selectedText: annotation.selectedText
            }];

        const segments = sourceSegments.map(segment => {
            const bookKey = String(segment.bookKey || annotation.bookKey || "");
            const chapter = Number(segment.chapter || annotation.chapter || 0);
            const verse = Number(segment.verse || annotation.verse || 0);
            const translation = String(segment.translation || annotation.translation || currentTranslation);
            const startOffset = Number(segment.startOffset ?? annotation.startOffset ?? 0);
            const endOffset = Number(segment.endOffset ?? annotation.endOffset ?? startOffset);
            const selectedText = String(segment.selectedText || "");

            if (!bookKey || !chapter || !verse || endOffset <= startOffset) return null;

            const normalized = {
                anchorKey: String(segment.anchorKey || `${bookKey}.${chapter}.${verse}.${translation}`),
                bookKey,
                chapter,
                verse,
                translation,
                startOffset,
                endOffset,
                selectedText
            };

            if (!normalized.anchorKey || normalized.anchorKey.includes("undefined")) {
                normalized.anchorKey = segmentAnchorKey(normalized);
            }

            return normalized;
        }).filter(Boolean);

        if (!segments.length) return null;

        segments.sort((a, b) => {
            if (a.bookKey !== b.bookKey) return a.bookKey.localeCompare(b.bookKey);
            const loc = encodeVerseLocation(a.chapter, a.verse) - encodeVerseLocation(b.chapter, b.verse);
            if (loc) return loc;
            return Number(a.startOffset || 0) - Number(b.startOffset || 0);
        });

        const first = segments[0];
        const selectedText = String(annotation.selectedText || segments.map(segment => segment.selectedText).filter(Boolean).join(" ")).trim();

        return {
            ...annotation,
            id: String(annotation.id || `ann-import-${Date.now()}-${index}`),
            type: annotation.type || "highlight",
            anchorKey: first.anchorKey,
            bookKey: first.bookKey,
            chapter: first.chapter,
            verse: first.verse,
            translation: first.translation,
            startOffset: first.startOffset,
            endOffset: first.endOffset,
            selectedText,
            comment: String(annotation.comment || ""),
            highlightColor: highlightColorKey(annotation.highlightColor || annotation.color),
            createdAt: annotation.createdAt || new Date().toISOString(),
            updatedAt: annotation.updatedAt || annotation.createdAt || new Date().toISOString(),
            segments
        };
    }

    function getAnnotationSegments(annotation) {
        return normalizeAnnotation(annotation)?.segments || [];
    }

    function loadAnnotations() {
        try {
            const data = JSON.parse(localStorage.getItem(STORE_KEYS.annotations) || "[]");
            return Array.isArray(data)
                ? data.map((annotation, index) => normalizeAnnotation(annotation, index)).filter(Boolean)
                : [];
        } catch {
            return [];
        }
    }

    function saveAnnotations(annotations) {
        const normalized = Array.isArray(annotations)
            ? annotations.map((annotation, index) => normalizeAnnotation(annotation, index)).filter(Boolean)
            : [];
        localStorage.setItem(STORE_KEYS.annotations, JSON.stringify(normalized));
    }

    function annotationKey(item) {
        return `${item.bookKey}.${item.chapter}.${item.verse}.${currentTranslation}`;
    }

    function annotationsForVerse(item) {
        const key = annotationKey(item);
        return loadAnnotations()
            .flatMap(annotation => annotation.segments
                .filter(segment => segment.anchorKey === key)
                .map(segment => ({
                    ...segment,
                    id: annotation.id,
                    parentAnnotationId: annotation.id,
                    comment: annotation.comment,
                    highlightColor: annotation.highlightColor,
                    selectedText: segment.selectedText || annotation.selectedText || ""
                }))
            )
            .sort((a, b) => Number(a.startOffset || 0) - Number(b.startOffset || 0));
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
            const color = highlightColorKey(ann.highlightColor);
            const cls = ann.comment
                ? `bible-highlight has-comment bible-highlight-${color}`
                : `bible-highlight bible-highlight-${color}`;
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

        const resolvedSegments = segments.filter(segment => segment.status === "resolved").length;
        const partialSegments = segments.filter(segment => segment.status === "partial").length;
        const unresolvedSegments = segments.filter(segment => segment.status === "unresolved").length;

        function plural(count, singular, pluralForm = `${singular}s`) {
            return `${count} ${count === 1 ? singular : pluralForm}`;
        }

        const segmentRows = segments.map(segment => {
            const statusLabel = segment.status === "resolved"
                ? "found"
                : segment.status === "partial"
                    ? "partly found"
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
                ? `${plural(segment.resolvedCount, "verse")} shown · ${plural(segment.missingCount, "verse")} unavailable`
                : `${plural(segment.resolvedCount, "verse")} shown`;
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

        const totalLine = `${plural(items.length, "verse")} found in ${plural(segments.length, "passage")}.`;
        const detailLine = [
            resolvedSegments ? `${plural(resolvedSegments, "passage")} found` : "",
            partialSegments ? `${plural(partialSegments, "passage")} partly found` : "",
            unresolvedSegments ? `${plural(unresolvedSegments, "passage")} not found` : ""
        ].filter(Boolean).join(" · ");

        summary.style.display = "block";
        summary.innerHTML = `
            <div class="bible-summary-line">
                ${escapeHtml(totalLine)}
                <span>${escapeHtml(detailLine || "Ready.")}</span>
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
                lastContextAnchorRect = storedRectFromDomRect(mark.getBoundingClientRect());
                openAnnotationActions(mark.dataset.annotationId, { anchorRect: lastContextAnchorRect });
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
                status.textContent = `${resolved.length} verse${resolved.length === 1 ? "" : "s"} shown.${warningText}`;
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

        if (hasQuotedPhrase) grammarLabelParts.push("exact phrase");
        if (operators.includes("AND")) grammarLabelParts.push("AND");
        if (operators.includes("OR")) grammarLabelParts.push("OR");
        if (operators.includes("NOT")) grammarLabelParts.push("NOT");
        if (!grammarLabelParts.length && positiveTerms.length > 1) grammarLabelParts.push("all words");
        if (!grammarLabelParts.length) grammarLabelParts.push("word search");

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
            ? `must include: ${grammar.positiveTerms.map(term => `“${term}”`).join(", ")}`
            : "include: —";
        const excluded = grammar.excludedTerms.length
            ? `leave out: ${grammar.excludedTerms.map(term => `“${term}”`).join(", ")}`
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
        const segments = getAnnotationSegments(annotation);
        const first = segments[0];
        const last = segments[segments.length - 1] || first;
        if (!first) return "Unknown passage";

        const book = getBook(first.bookKey);
        const bookName = book?.name || first.bookKey || "Unknown";

        if (first.bookKey === last.bookKey && first.chapter === last.chapter && first.verse === last.verse) {
            return `${bookName} ${first.chapter}:${first.verse}`;
        }

        if (first.bookKey === last.bookKey && first.chapter === last.chapter) {
            return `${bookName} ${first.chapter}:${first.verse}-${last.verse}`;
        }

        if (first.bookKey === last.bookKey) {
            return `${bookName} ${first.chapter}:${first.verse}-${last.chapter}:${last.verse}`;
        }

        const lastBook = getBook(last.bookKey);
        return `${bookName} ${first.chapter}:${first.verse} – ${(lastBook?.name || last.bookKey)} ${last.chapter}:${last.verse}`;
    }

    function loadFathersNotebook() {
        try {
            const data = JSON.parse(localStorage.getItem(STORE_KEYS.fathersNotebook) || "[]");
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function saveFathersNotebook(items) {
        localStorage.setItem(STORE_KEYS.fathersNotebook, JSON.stringify(Array.isArray(items) ? items : []));
    }

    function notebookItemResearchText(item) {
        return [
            item.passageLabel || "",
            item.rangeLabel || "",
            item.author || "",
            item.fatherName || "",
            item.sourceTitle || "",
            item.quote || "",
            item.createdAt || "",
            item.updatedAt || ""
        ].join(" ").toLowerCase();
    }

    function deleteNotebookItemById(itemId) {
        const item = loadFathersNotebook().find(saved => saved.id === itemId);
        if (!item) return;

        if (!window.confirm(`Remove saved Fathers note from ${item.author || "this author"}?`)) return;

        saveFathersNotebook(loadFathersNotebook().filter(saved => saved.id !== itemId));
        closeContextPanel();
        renderResearchIndex();

        const status = $("bible-status");
        if (status) status.textContent = "Saved Fathers note removed from notebook.";
    }

    function openNotebookItemActions(itemId) {
        const item = loadFathersNotebook().find(saved => saved.id === itemId);
        if (!item) return;

        const source = item.sourceTitle
            ? `<div class="bible-guide-source">${escapeHtml(item.sourceTitle)}</div>`
            : `<div class="bible-guide-source bible-guide-source-missing">Source title not supplied.</div>`;
        const link = item.sourceUrl
            ? `<a class="bible-guide-source-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open source</a>`
            : "";

        const body = showContextPanel({
            title: "Saved from the Fathers",
            anchorRect: lastContextAnchorRect,
            html: `
                <div class="bible-context-note-label">${escapeHtml(item.passageLabel || item.rangeLabel || "Saved commentary")}</div>
                <div class="bible-guide-card-head">
                    <span class="bible-guide-father">${escapeHtml(item.author || item.fatherName || "Church Father")}</span>
                    <span class="bible-guide-date">${item.time ? escapeHtml(` · AD ${item.time}`) : ""}</span>
                </div>
                ${source}
                <blockquote>${escapeHtml(item.quote || "")}</blockquote>
                <div class="bible-context-actions">
                    ${link}
                    <button class="bible-tool-btn" id="bible-context-remove-notebook-item" type="button">Remove from Notebook</button>
                    <button class="bible-tool-btn" id="bible-context-close-notebook-item" type="button">Close</button>
                </div>
            `
        });

        body?.querySelector("#bible-context-remove-notebook-item")?.addEventListener("click", () => deleteNotebookItemById(itemId));
        body?.querySelector("#bible-context-close-notebook-item")?.addEventListener("click", closeContextPanel);
    }

    function formatFathersNoteAppendix(item) {
        const author = item.author || item.fatherName || "Church Father";
        const date = item.time ? ` · AD ${item.time}` : "";
        const passage = item.passageLabel || item.rangeLabel || "Selected passage";
        const source = item.sourceTitle ? `\nSource: ${item.sourceTitle}` : "";
        const quote = String(item.quote || "").trim();

        return [
            `From the Fathers — ${author}${date}`,
            `${passage}${source}`,
            quote ? `“${quote}”` : ""
        ].filter(Boolean).join("\n");
    }

    function appendFathersCommentToAnnotation(annotationId, item) {
        if (!annotationId || !item) return false;

        const annotations = loadAnnotations();
        const idx = annotations.findIndex(annotation => annotation.id === annotationId);
        const status = $("bible-status");

        if (idx === -1) {
            if (status) status.textContent = "Could not find the note for that highlight.";
            return false;
        }

        const appendix = formatFathersNoteAppendix(item);
        const existing = String(annotations[idx].comment || "").trim();

        if (existing && item.quote && existing.includes(String(item.quote).slice(0, 80))) {
            if (status) status.textContent = "That Church Fathers comment already appears in this note.";
            return false;
        }

        annotations[idx] = {
            ...annotations[idx],
            comment: existing ? `${existing}\n\n${appendix}` : appendix,
            updatedAt: new Date().toISOString()
        };

        saveAnnotations(annotations);
        renderResults(currentResolved);
        renderCurrentNotesList();
        renderResearchIndex();

        if (status) status.textContent = `Added ${item.author || item.fatherName || "Church Father"} to the note.`;
        return true;
    }

    function annotationsInCurrentView() {
        const visibleKeys = new Set((currentResolved || []).map(item => annotationKey(item)));
        return loadAnnotations()
            .filter(annotation => annotation.segments.some(segment => visibleKeys.has(segment.anchorKey)))
            .sort((a, b) => {
                const aFirst = a.segments?.[0];
                const bFirst = b.segments?.[0];
                if (!aFirst || !bFirst) return 0;
                if (aFirst.bookKey !== bFirst.bookKey) return aFirst.bookKey.localeCompare(bFirst.bookKey);
                const loc = encodeVerseLocation(aFirst.chapter, aFirst.verse) - encodeVerseLocation(bFirst.chapter, bFirst.verse);
                if (loc) return loc;
                return Number(aFirst.startOffset || 0) - Number(bFirst.startOffset || 0);
            });
    }

    function renderCurrentNotesList() {
        const container = $("bible-current-notes");
        if (!container) return;

        const annotations = annotationsInCurrentView();
        if (!annotations.length) {
            container.innerHTML = `<div class="bible-notes-empty">No highlights or notes in this view.</div>`;
            renderResearchIndex();
            return;
        }

        container.innerHTML = annotations.map(annotation => {
            const label = getAnnotationReferenceLabel(annotation);
            const excerpt = annotation.selectedText || "Highlight";
            const comment = annotation.comment?.trim()
                ? `<div class="bible-note-comment">${escapeHtml(annotation.comment.trim())}</div>`
                : `<div class="bible-note-comment bible-note-comment-empty">No note.</div>`;

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
                openAnnotationActions(button.dataset.annotationOpen);
            });
        });

        renderResearchIndex();
    }

    function annotationHasNote(annotation) {
        return !!String(annotation?.comment || "").trim();
    }

    function annotationPrimaryBookKey(annotation) {
        return annotation?.segments?.[0]?.bookKey || annotation?.bookKey || "";
    }

    function annotationResearchText(annotation) {
        return [
            getAnnotationReferenceLabel(annotation),
            annotation.selectedText || "",
            annotation.comment || "",
            annotation.translation || "",
            annotation.updatedAt || "",
            annotation.createdAt || ""
        ].join(" ").toLowerCase();
    }

    function filteredResearchAnnotations() {
        const query = String($("bible-research-search")?.value || "").trim().toLowerCase();
        const filter = $("bible-research-filter")?.value || "ALL";
        const bookKey = $("bible-research-book")?.value || "";

        if (filter === "FATHERS") return [];

        return loadAnnotations()
            .filter(annotation => {
                if (bookKey && annotationPrimaryBookKey(annotation) !== bookKey) return false;
                if (filter === "WITH_NOTES" && !annotationHasNote(annotation)) return false;
                if (filter === "HIGHLIGHTS" && annotationHasNote(annotation)) return false;
                if (query && !annotationResearchText(annotation).includes(query)) return false;
                return true;
            })
            .sort((a, b) => {
                const aFirst = a.segments?.[0];
                const bFirst = b.segments?.[0];
                if (!aFirst || !bFirst) return 0;
                if (aFirst.bookKey !== bFirst.bookKey) return aFirst.bookKey.localeCompare(bFirst.bookKey);
                const loc = encodeVerseLocation(aFirst.chapter, aFirst.verse) - encodeVerseLocation(bFirst.chapter, bFirst.verse);
                if (loc) return loc;
                return String(a.updatedAt || "").localeCompare(String(b.updatedAt || ""));
            });
    }

    function filteredResearchNotebookItems() {
        const query = String($("bible-research-search")?.value || "").trim().toLowerCase();
        const filter = $("bible-research-filter")?.value || "ALL";
        const bookKey = $("bible-research-book")?.value || "";

        if (filter === "WITH_NOTES" || filter === "HIGHLIGHTS") return [];

        return loadFathersNotebook()
            .filter(item => {
                if (bookKey && item.bookKey !== bookKey) return false;
                if (query && !notebookItemResearchText(item).includes(query)) return false;
                return true;
            })
            .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
    }

    function renderResearchIndex() {
        const container = $("bible-research-index");
        if (!container) return;

        const annotations = filteredResearchAnnotations();
        const notebookItems = filteredResearchNotebookItems();
        const total = annotations.length + notebookItems.length;

        if (!total) {
            container.innerHTML = `<div class="bible-notes-empty">No saved notes, highlights, or Fathers comments match your filters.</div>`;
            return;
        }

        container.innerHTML = `
            <div class="bible-research-summary">${total} saved item${total === 1 ? "" : "s"} shown.</div>
            ${annotations.map(annotation => {
                const label = getAnnotationReferenceLabel(annotation);
                const excerpt = annotation.selectedText || "Highlight";
                const comment = annotationHasNote(annotation)
                    ? `<span class="bible-note-comment">${escapeHtml(annotation.comment.trim())}</span>`
                    : `<span class="bible-note-comment bible-note-comment-empty">Highlight only.</span>`;
                const meta = annotation.updatedAt
                    ? `Updated ${escapeHtml(String(annotation.updatedAt).slice(0, 10))}`
                    : "Saved highlight";

                return `
                    <button class="bible-note-card bible-research-card" type="button" data-research-annotation-open="${escapeHtml(annotation.id)}">
                        <span class="bible-note-ref">${escapeHtml(label)}</span>
                        <span class="bible-research-source-label">Your note or highlight</span>
                        <span class="bible-note-excerpt">${escapeHtml(excerpt)}</span>
                        ${comment}
                        <span class="bible-research-meta">${meta}</span>
                    </button>
                `;
            }).join("")}
            ${notebookItems.map(item => {
                const label = item.passageLabel || item.rangeLabel || "Saved commentary";
                const author = item.author || item.fatherName || "Church Father";
                const source = item.sourceTitle ? ` · ${item.sourceTitle}` : "";
                const meta = item.createdAt
                    ? `Saved ${escapeHtml(String(item.createdAt).slice(0, 10))}`
                    : "Saved from the Fathers";

                return `
                    <button class="bible-note-card bible-research-card bible-research-fathers-card" type="button" data-research-notebook-open="${escapeHtml(item.id)}">
                        <span class="bible-note-ref">${escapeHtml(label)}</span>
                        <span class="bible-research-source-label">Saved from the Fathers</span>
                        <span class="bible-note-excerpt">${escapeHtml(author)}${escapeHtml(source)}</span>
                        <span class="bible-note-comment">${escapeHtml(item.quote || "")}</span>
                        <span class="bible-research-meta">${meta}</span>
                    </button>
                `;
            }).join("")}
        `;

        container.querySelectorAll("[data-research-annotation-open]").forEach(button => {
            button.addEventListener("click", () => {
                jumpToAnnotation(button.dataset.researchAnnotationOpen);
                openAnnotationActions(button.dataset.researchAnnotationOpen);
            });
        });

        container.querySelectorAll("[data-research-notebook-open]").forEach(button => {
            button.addEventListener("click", () => openNotebookItemActions(button.dataset.researchNotebookOpen));
        });
    }

    function populateResearchBookFilter() {
        const select = $("bible-research-book");
        if (!select) return;

        const current = select.value || "";
        const seen = new Set();

        const options = getBooks()
            .filter(book => {
                if (seen.has(book.key)) return false;
                seen.add(book.key);
                return true;
            })
            .map(book => `<option value="${escapeHtml(book.key)}">${escapeHtml(book.name)}</option>`)
            .join("");

        select.innerHTML = `<option value="">All books</option>${options}`;
        if (current && seen.has(current)) select.value = current;
    }

    function buildResearchMarkdown(annotations = loadAnnotations(), notebookItems = loadFathersNotebook()) {
        const annotationItems = annotations.slice().sort((a, b) => getAnnotationReferenceLabel(a).localeCompare(getAnnotationReferenceLabel(b)));
        const fathersItems = notebookItems.slice().sort((a, b) => String(a.passageLabel || "").localeCompare(String(b.passageLabel || "")));
        const lines = [
            "# Universal Office Bible Research Notes",
            "",
            `Exported: ${new Date().toISOString()}`,
            "",
            `Items: ${annotationItems.length + fathersItems.length}`,
            ""
        ];

        if (annotationItems.length) {
            lines.push("# Your Notes and Highlights");
            lines.push("");
        }

        for (const annotation of annotationItems) {
            const label = getAnnotationReferenceLabel(annotation);
            lines.push(`## ${label}`);
            lines.push("");
            if (annotation.selectedText) {
                lines.push("> " + String(annotation.selectedText).replace(/\n+/g, " "));
                lines.push("");
            }
            if (annotation.comment?.trim()) {
                lines.push(annotation.comment.trim());
                lines.push("");
            } else {
                lines.push("_Highlight only._");
                lines.push("");
            }
            lines.push(`- Translation: ${annotation.translation || currentTranslation}`);
            if (annotation.updatedAt) lines.push(`- Updated: ${annotation.updatedAt}`);
            lines.push("");
        }

        if (fathersItems.length) {
            lines.push("# Saved Commentary from the Fathers");
            lines.push("");
        }

        for (const item of fathersItems) {
            const label = item.passageLabel || item.rangeLabel || "Saved commentary";
            const author = item.author || item.fatherName || "Church Father";
            lines.push(`## ${label} — ${author}`);
            lines.push("");
            if (item.quote) {
                lines.push("> " + String(item.quote).replace(/\n+/g, " "));
                lines.push("");
            }
            if (item.sourceTitle) lines.push(`- Source: ${item.sourceTitle}`);
            if (item.time) lines.push(`- Date: AD ${item.time}`);
            if (item.sourceUrl) lines.push(`- URL: ${item.sourceUrl}`);
            if (item.createdAt) lines.push(`- Saved: ${item.createdAt}`);
            lines.push("");
        }

        return lines.join("\n");
    }

    function exportResearchMarkdown() {
        const blob = new Blob([buildResearchMarkdown(loadAnnotations(), loadFathersNotebook())], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "universal-office-bible-research-notes.md";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function firstRenderedAnnotationMark(annotationId) {
        return Array.from(document.querySelectorAll(".bible-highlight"))
            .find(mark => mark.dataset.annotationId === annotationId) || null;
    }

    function firstRenderedAnnotationVerse(annotation) {
        const first = annotation?.segments?.[0];
        if (!first) return null;

        return Array.from(document.querySelectorAll(".bible-verse")).find(el =>
            el.dataset.bookKey === first.bookKey &&
            Number(el.dataset.chapter) === Number(first.chapter) &&
            Number(el.dataset.verse) === Number(first.verse) &&
            el.dataset.translation === first.translation
        ) || null;
    }

    function jumpToAnnotation(annotationId) {
        const annotation = loadAnnotations().find(item => item.id === annotationId);
        if (!annotation) return;

        const target = firstRenderedAnnotationMark(annotationId) || firstRenderedAnnotationVerse(annotation);

        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            target.classList.add("bible-verse-focus");
            window.setTimeout(() => target.classList.remove("bible-verse-focus"), 1200);
        }
    }

    function annotationToPassageRange(annotation) {
        const segments = getAnnotationSegments(annotation);
        const first = segments[0];
        const last = segments[segments.length - 1] || first;
        if (!first) return null;

        const book = getBook(first.bookKey);
        const bookName = book?.name || first.bookKey || "Unknown";
        const startLocation = encodeVerseLocation(first.chapter, first.verse);
        const endLocation = encodeVerseLocation(last.chapter, last.verse);
        const range = {
            book: first.bookKey,
            bookName,
            startChapter: Number(first.chapter),
            startVerse: Number(first.verse),
            endChapter: Number(last.chapter),
            endVerse: Number(last.verse),
            startLocation,
            endLocation,
            verseCount: segments.length
        };

        return {
            ...range,
            label: formatSelectionRangeLabel(range)
        };
    }

    async function loadFathersForAnnotation(annotationId) {
        const annotation = loadAnnotations().find(item => item.id === annotationId);
        const status = $("bible-status");
        if (!annotation) return;

        const anchorRect = getAnnotationAnchorRect(annotation) || lastContextAnchorRect;
        const range = annotationToPassageRange(annotation);
        if (!range) return;
        const body = showContextPanel({
            title: "What the Fathers Say",
            anchorRect,
            mode: "study",
            html: `<div class="bible-guide-empty">Looking up Church Fathers commentary for ${escapeHtml(range.label)}…</div>`
        });

        if (!window.UniversalOfficePassageGuide?.loadFathersForRanges) {
            if (body) body.innerHTML = `<div class="bible-guide-error">Study Helps are not available yet.</div>`;
            if (status) status.textContent = "Study Helps are not available yet.";
            return;
        }

        await window.UniversalOfficePassageGuide.loadFathersForRanges([range], "highlighted verse", {
            targetElement: body,
            annotationId
        });
        reflowContextPanel(anchorRect);
    }

    function deleteAnnotationById(annotationId, options = {}) {
        const { confirmDelete = true } = options;
        const annotation = loadAnnotations().find(item => item.id === annotationId);
        if (!annotation) return;

        const label = getAnnotationReferenceLabel(annotation);
        if (confirmDelete && !window.confirm(`Remove highlight or note for ${label}?`)) return;

        const annotations = loadAnnotations().filter(item => item.id !== annotationId);
        saveAnnotations(annotations);
        activeAnnotationId = null;
        closeContextPanel();
        renderResults(currentResolved);
        renderCurrentNotesList();
    }

    function openAnnotationActions(annotationId, options = {}) {
        const annotation = loadAnnotations().find(item => item.id === annotationId);
        if (!annotation) return;

        activeAnnotationId = null;
        const anchorRect = options.anchorRect || getAnnotationAnchorRect(annotation) || lastContextAnchorRect;
        lastContextAnchorRect = anchorRect || lastContextAnchorRect;

        const note = annotation.comment?.trim()
            ? `<div class="bible-context-note-preview">${escapeHtml(annotation.comment.trim())}</div>`
            : `<div class="bible-context-note-preview bible-note-comment-empty">No note has been saved for this highlight.</div>`;

        const body = showContextPanel({
            title: "Highlight Options",
            anchorRect,
            mode: "study",
            html: `
                <div class="bible-context-note-label">${escapeHtml(getAnnotationReferenceLabel(annotation))}</div>
                <div class="bible-context-selected-text">${escapeHtml(annotation.selectedText || "Highlighted text")}</div>
                <label class="bible-context-color-label" for="bible-context-highlight-color">Highlight Color</label>
                <select id="bible-context-highlight-color" class="bible-context-highlight-color bible-visually-hidden" aria-label="Highlight color">
                    ${renderHighlightColorOptions(annotation.highlightColor)}
                </select>
                <div class="bible-context-highlight-swatches" role="group" aria-label="Highlight color">
                    ${renderHighlightColorSwatches(annotation.highlightColor, "data-context-highlight-color")}
                </div>
                ${note}
                <div class="bible-context-actions">
                    <button class="bible-tool-btn" id="bible-context-edit-note" type="button">Add / Edit Note</button>
                    <button class="bible-tool-btn" id="bible-context-fathers-highlight" type="button">What the Fathers Say</button>
                    <button class="bible-tool-btn" id="bible-context-remove-highlight" type="button">Remove Highlight</button>
                    <button class="bible-tool-btn" id="bible-context-close-actions" type="button">Close</button>
                </div>
            `
        });

        body?.querySelector("#bible-context-highlight-color")?.addEventListener("change", event => {
            setAnnotationHighlightColor(annotationId, event.target.value);
        });
        body?.querySelectorAll("[data-context-highlight-color]").forEach(button => {
            button.addEventListener("click", () => setAnnotationHighlightColor(annotationId, button.dataset.contextHighlightColor));
        });
        body?.querySelector("#bible-context-edit-note")?.addEventListener("click", () => openAnnotationEditor(annotationId, { anchorRect }));
        body?.querySelector("#bible-context-fathers-highlight")?.addEventListener("click", () => loadFathersForAnnotation(annotationId));
        body?.querySelector("#bible-context-remove-highlight")?.addEventListener("click", () => deleteAnnotationById(annotationId));
        body?.querySelector("#bible-context-close-actions")?.addEventListener("click", closeContextPanel);
    }

    function setAnnotationHighlightColor(annotationId, color) {
        const annotations = loadAnnotations();
        const idx = annotations.findIndex(item => item.id === annotationId);
        if (idx === -1) return;

        const normalizedColor = highlightColorKey(color);
        annotations[idx] = {
            ...annotations[idx],
            highlightColor: normalizedColor,
            updatedAt: new Date().toISOString()
        };

        saveAnnotations(annotations);
        renderResults(currentResolved);
        renderCurrentNotesList();
        openAnnotationActions(annotationId);
    }

    function openAnnotationEditor(annotationId, options = {}) {
        const annotation = loadAnnotations().find(item => item.id === annotationId);
        if (!annotation) return;

        activeAnnotationId = annotationId;
        const label = `${getAnnotationReferenceLabel(annotation)} · ${annotation.selectedText || "Highlight"}`;
        const anchorRect = options.anchorRect || lastContextAnchorRect || getAnnotationAnchorRect(annotation);

        const body = showContextPanel({
            title: "Add a Note",
            anchorRect,
            mode: "study",
            html: `
                <div class="bible-context-note-label">${escapeHtml(label)}</div>
                <textarea id="bible-context-note-comment" class="bible-context-note-comment" rows="6" placeholder="Add or edit your note.">${escapeHtml(annotation.comment || "")}</textarea>
                <div class="bible-context-actions">
                    <button class="bible-tool-btn" id="bible-context-save-note" type="button">Save Note</button>
                    <button class="bible-tool-btn" id="bible-context-delete-note" type="button">Remove Highlight</button>
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

        const savedId = activeAnnotationId;
        annotations[idx] = {
            ...annotations[idx],
            comment: $("bible-context-note-comment")?.value ?? $("bible-annotation-comment")?.value ?? "",
            updatedAt: new Date().toISOString()
        };
        saveAnnotations(annotations);
        renderResults(currentResolved);
        renderCurrentNotesList();
        closeAnnotationEditor();

        const status = $("bible-status");
        if (status) status.textContent = "Note saved.";
        openAnnotationActions(savedId);
    }

    function deleteAnnotationEditor() {
        if (!activeAnnotationId) return;
        deleteAnnotationById(activeAnnotationId);
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

    function clampNumber(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function positionContextPanel(anchorRect = lastContextAnchorRect) {
        const panel = $("bible-context-panel");
        const body = $("bible-context-panel-body");
        if (!panel || !body) return;

        // Reflow must never open an empty Study Help shell.
        // showContextPanel() is the only function allowed to unhide the panel.
        if (panel.hidden || !body.innerHTML.trim()) return;

        const margin = 12;
        const gap = 12;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 768;
        const panelWidth = Math.min(440, Math.max(300, viewportWidth - (margin * 2)));
        const maxPanelHeight = Math.max(240, Math.min(520, viewportHeight - (margin * 2)));

        panel.style.width = `${panelWidth}px`;
        panel.style.maxHeight = `${maxPanelHeight}px`;
        panel.style.setProperty("--bible-context-max-height", `${maxPanelHeight}px`);
        if (panel.dataset.contextMode === "study") {
            const studyTop = Math.max(112, Math.min(190, Math.floor(viewportHeight * 0.16)));
            const studyWidth = Math.min(560, Math.max(320, viewportWidth - (margin * 2)));
            const studyMaxHeight = Math.max(
                260,
                Math.min(680, Math.floor(viewportHeight * 0.72), viewportHeight - studyTop - margin)
            );
            const studyLeft = clampNumber(viewportWidth - studyWidth - margin, margin, viewportWidth - studyWidth - margin);

            panel.style.width = `${studyWidth}px`;
            panel.style.maxHeight = `${studyMaxHeight}px`;
            panel.style.setProperty("--bible-context-max-height", `${studyMaxHeight}px`);
            panel.style.left = `${Math.round(studyLeft)}px`;
            panel.style.top = `${Math.round(studyTop)}px`;
            return;
        }

        const measuredHeight = panel.getBoundingClientRect().height || panel.scrollHeight || 320;
        const panelHeight = Math.min(measuredHeight, maxPanelHeight);
        const anchor = anchorRect || {
            left: viewportWidth / 2 - 40,
            right: viewportWidth / 2 + 40,
            top: viewportHeight / 2 - 20,
            bottom: viewportHeight / 2 + 20,
            width: 80,
            height: 40
        };

        const horizontalSide = anchor.right + gap + panelWidth <= viewportWidth - margin
            ? "right"
            : anchor.left - gap - panelWidth >= margin
                ? "left"
                : "overlap";

        let left;
        let top;

        if (horizontalSide === "right") {
            left = anchor.right + gap;
        } else if (horizontalSide === "left") {
            left = anchor.left - gap - panelWidth;
        } else {
            left = clampNumber(anchor.left, margin, viewportWidth - panelWidth - margin);
        }

        const roomBelow = viewportHeight - anchor.bottom - margin;
        const roomAbove = anchor.top - margin;
        const preferAbove = roomBelow < Math.min(panelHeight, 260) && roomAbove > roomBelow;

        if (horizontalSide === "overlap") {
            top = preferAbove
                ? anchor.top - gap - panelHeight
                : anchor.bottom + gap;
        } else {
            top = preferAbove
                ? Math.min(anchor.top - gap - panelHeight, viewportHeight - panelHeight - margin)
                : anchor.top;
        }

        top = clampNumber(top, margin, Math.max(margin, viewportHeight - panelHeight - margin));

        panel.style.left = `${Math.round(left)}px`;
        panel.style.top = `${Math.round(top)}px`;
    }

    function reflowContextPanel(anchorRect = lastContextAnchorRect) {
        window.requestAnimationFrame(() => {
            positionContextPanel(anchorRect);
            window.requestAnimationFrame(() => positionContextPanel(anchorRect));
        });
    }

    function showContextPanel({ title, html, anchorRect = lastContextAnchorRect, mode = "default" }) {
        const panel = $("bible-context-panel");
        const titleEl = $("bible-context-panel-title");
        const body = $("bible-context-panel-body");
        if (!panel || !body) return null;

        panel.dataset.contextMode = mode || "default";
        panel.classList.toggle("bible-context-panel-study", panel.dataset.contextMode === "study");

        if (titleEl) titleEl.textContent = title || "Study Help";
        body.innerHTML = html || "";
        panel.hidden = false;
        lastContextAnchorRect = anchorRect || lastContextAnchorRect;
        reflowContextPanel(lastContextAnchorRect);
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
        const mark = firstRenderedAnnotationMark(annotation?.id);
        if (mark) return storedRectFromDomRect(mark.getBoundingClientRect());

        const verse = firstRenderedAnnotationVerse(annotation);
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

    function textOffsetForBoundary(textEl, container, offset) {
        const textLength = textEl.textContent.length;
        const before = document.createRange();
        before.selectNodeContents(textEl);

        try {
            before.setEnd(container, offset);
            return Math.max(0, Math.min(before.toString().length, textLength));
        } catch {
            return 0;
        }
    }

    function selectionSegmentsFromRange(range, verseEls) {
        const segments = [];

        for (const verseEl of verseEls) {
            const textEl = verseEl.querySelector(".bible-verse-text");
            if (!textEl) continue;

            try {
                if (!range.intersectsNode(textEl)) continue;
            } catch {
                continue;
            }

            const text = textEl.textContent || "";
            const textLength = text.length;
            if (!textLength) continue;

            const textRange = document.createRange();
            textRange.selectNodeContents(textEl);

            let startOffset = 0;
            let endOffset = textLength;

            try {
                const selectionStartsAfterTextStart = range.compareBoundaryPoints(Range.START_TO_START, textRange) > 0;
                const selectionEndsBeforeTextEnd = range.compareBoundaryPoints(Range.END_TO_END, textRange) < 0;

                startOffset = selectionStartsAfterTextStart
                    ? textOffsetForBoundary(textEl, range.startContainer, range.startOffset)
                    : 0;

                endOffset = selectionEndsBeforeTextEnd
                    ? textOffsetForBoundary(textEl, range.endContainer, range.endOffset)
                    : textLength;
            } catch {
                startOffset = 0;
                endOffset = textLength;
            }

            startOffset = Math.max(0, Math.min(startOffset, textLength));
            endOffset = Math.max(startOffset, Math.min(endOffset, textLength));
            if (endOffset <= startOffset) continue;

            const segment = {
                bookKey: verseEl.dataset.bookKey,
                chapter: Number(verseEl.dataset.chapter),
                verse: Number(verseEl.dataset.verse),
                translation: verseEl.dataset.translation || currentTranslation,
                startOffset,
                endOffset,
                selectedText: text.slice(startOffset, endOffset)
            };
            segment.anchorKey = segmentAnchorKey(segment);
            segments.push(segment);
        }

        return segments;
    }

    function setSelectionToolbarMode({ allowAnnotation }) {
        const highlight = $("bible-highlight-btn");
        const comment = $("bible-comment-btn");
        const fathers = $("bible-fathers-selection-btn");

        if (highlight) {
            highlight.disabled = !allowAnnotation;
            highlight.title = allowAnnotation ? "Highlight selected Bible text" : "Select Bible text first";
        }

        if (comment) {
            comment.disabled = !allowAnnotation;
            comment.title = allowAnnotation ? "Add a note to selected Bible text" : "Select Bible text first";
        }

        if (fathers) {
            fathers.disabled = !pendingPassageRanges.length;
            fathers.title = pendingPassageRanges.length
                ? "Ask what the Fathers say about the selected passage"
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
        const segments = selectionSegmentsFromRange(range, verseEls);

        const first = segments[0] || null;
        pendingSelection = first ? {
            anchorKey: first.anchorKey,
            bookKey: first.bookKey,
            chapter: first.chapter,
            verse: first.verse,
            translation: first.translation,
            startOffset: first.startOffset,
            endOffset: first.endOffset,
            selectedText: segments.map(segment => segment.selectedText).filter(Boolean).join(" ").trim() || selection.toString().trim(),
            segments
        } : null;

        const rect = range.getBoundingClientRect();
        pendingSelectionRect = storedRectFromDomRect(rect);
        lastContextAnchorRect = pendingSelectionRect || lastContextAnchorRect;

        const toolbar = $("bible-selection-toolbar");
        if (toolbar) {
            setSelectionToolbarMode({ allowAnnotation: !!pendingSelection?.segments?.length });
            toolbar.style.display = "flex";
            toolbar.style.left = `${Math.max(12, rect.left + window.scrollX)}px`;
            toolbar.style.top = `${Math.max(12, rect.top + window.scrollY - 42)}px`;
        }
    }

    function addAnnotation(withComment) {
        if (!pendingSelection?.segments?.length) {
            const status = $("bible-status");
            if (status) status.textContent = "Select Bible text before highlighting or adding a note.";
            return;
        }

        const anchorRect = pendingSelectionRect || lastContextAnchorRect;
        const annotationId = `ann-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const annotations = loadAnnotations();
        annotations.push({
            id: annotationId,
            ...pendingSelection,
            type: "highlight",
            comment: "",
            highlightColor: currentHighlightColor,
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
        openAnnotationActions(annotationId);
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
            mode: "study",
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
                    const item = normalizeAnnotation(annotation, index);
                    if (!item) {
                        throw new Error(`Annotation import item ${index + 1} is missing usable highlight information.`);
                    }
                    return {
                        ...item,
                        updatedAt: new Date().toISOString()
                    };
                });

                saveAnnotations(normalized);
                closeAnnotationEditor();
                renderResults(currentResolved);
                renderCurrentNotesList();
                renderResearchIndex();
                $("bible-status").textContent = `Imported ${normalized.length} annotation${normalized.length === 1 ? "" : "s"}.`;
            } catch (error) {
                $("bible-status").textContent = error.message;
            }
        };
        reader.readAsText(file);
    }
    async function loadRegistryBookRecordsForParser() {
  const parser = window.UniversalOfficeBibleReferenceParser;
  const adapter = window.UniversalOfficeBibleRegistryAdapter;

  if (!parser || typeof parser.registerBookRecords !== "function") {
    console.warn("Bible registry adapter skipped: reference parser registerBookRecords() is unavailable.");
    return 0;
  }

  if (!adapter || typeof adapter.getOrdinaryChapterVerseRecords !== "function") {
    console.warn("Bible registry adapter skipped: UniversalOfficeBibleRegistryAdapter.getOrdinaryChapterVerseRecords() is unavailable.");
    return 0;
  }

  try {
    const records = await adapter.getOrdinaryChapterVerseRecords();
    return parser.registerBookRecords(records, { source: "bible-registry-adapter" });
  } catch (error) {
    console.warn("Bible registry adapter load failed; continuing with static parser book list.", error);
    return 0;
  }
}

async function initializeBibleBrowser() {
        await loadRegistryBookRecordsForParser();
        populateBookSelect();
        populateScopeSelect();
        populateResearchBookFilter();

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
        $("bible-highlight-color")?.addEventListener("change", event => {
            currentHighlightColor = highlightColorKey(event.target.value);
            syncHighlightColorControl();
            saveLastState();
        });
        document.querySelectorAll("[data-highlight-color]").forEach(button => {
            button.addEventListener("click", () => {
                currentHighlightColor = highlightColorKey(button.dataset.highlightColor);
                syncHighlightColorControl();
                saveLastState();
            });
        });
        $("bible-export-annotations")?.addEventListener("click", exportAnnotations);
        $("bible-export-research-markdown")?.addEventListener("click", exportResearchMarkdown);
        $("bible-import-annotations")?.addEventListener("change", event => importAnnotationsFromFile(event.target.files?.[0]));
        $("bible-research-search")?.addEventListener("input", renderResearchIndex);
        $("bible-research-filter")?.addEventListener("change", renderResearchIndex);
        $("bible-research-book")?.addEventListener("change", renderResearchIndex);
        window.addEventListener("universal-office:fathers-notebook-updated", renderResearchIndex);
        window.addEventListener("universal-office:fathers-add-to-note", event => {
            appendFathersCommentToAnnotation(event.detail?.annotationId, event.detail?.item);
        });
        $("bible-save-annotation")?.addEventListener("click", saveAnnotationEditor);
        $("bible-delete-annotation")?.addEventListener("click", deleteAnnotationEditor);
        $("bible-close-annotation")?.addEventListener("click", closeAnnotationEditor);
        $("bible-context-panel-close")?.addEventListener("click", closeContextPanel);
        window.addEventListener("resize", () => reflowContextPanel());
        window.addEventListener("universal-office:context-panel-reflow", () => reflowContextPanel());

        $("bible-results")?.addEventListener("scroll", () => saveLastState());
        document.addEventListener("mouseup", () => setTimeout(handleSelection, 0));

        const state = loadLastState();
        if (state.translation) currentTranslation = state.translation;
        if (typeof state.parallelEnabled === "boolean") parallelEnabled = state.parallelEnabled;
        if (state.parallelTranslation) parallelTranslation = state.parallelTranslation;
        if (state.highlightColor) currentHighlightColor = highlightColorKey(state.highlightColor);
        syncParallelControlsEnabled();
        syncHighlightColorControl();
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
        reflowContextPanel,
        closeContextPanel,
        openAnnotationActions,
        appendFathersCommentToAnnotation,
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
