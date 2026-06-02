/**
 * SCRIPTURE RESOLVER - QC FIXED VERSION 2026-02-17
 */
const bibleCache = { books: {}, accessOrder: [], MAX_CACHED_BOOKS: 20 };
const DEFAULT_BIBLE_TRANSLATION = 'NRSV';
const NT_BOOKS = ['1corinthians', '1john', '1peter', '1thessalonians', '1timothy', '2corinthians', '2john', '2peter', '2thessalonians', '2timothy', '3john', 'acts', 'colossians', 'ephesians', 'galatians', 'hebrews', 'james', 'john', 'jude', 'luke', 'mark', 'matthew', 'philemon', 'philippians', 'revelation', 'romans', 'titus'];
const BOOK_ALIASES = { 'ecclesiasticus': 'sirach', 'wisdomofsolomon': 'wisdom', 'songofthreeyoungmen': 'daniel', 'songofthreeholychildren': 'daniel', 'belandthedragon': 'daniel', 'bel': 'daniel', 'susanna': 'daniel', 'prayerofazariah': 'daniel', 'therestofesther': 'estherGK', 'additionstoesther': 'estherGK', 'therestofdaniel': 'danielGK', 'additionstodaniel': 'danielGK', 'songsofsolomon': 'songofsolomon', 'canticles': 'songofsolomon', 'canticleofcanticles': 'songofsolomon' };

function _normalizeBibleTranslation(value) {
    return (typeof value === 'string' && value.trim()) ? value.trim() : DEFAULT_BIBLE_TRANSLATION;
}

function _selectBibleText(textNode, translation = DEFAULT_BIBLE_TRANSLATION) {
    if (typeof textNode === 'string') return textNode;
    if (!textNode || typeof textNode !== 'object' || Array.isArray(textNode)) return '';

    const preferred = _normalizeBibleTranslation(translation);
    if (typeof textNode[preferred] === 'string') return textNode[preferred];
    if (preferred !== DEFAULT_BIBLE_TRANSLATION && typeof textNode[DEFAULT_BIBLE_TRANSLATION] === 'string') {
        return textNode[DEFAULT_BIBLE_TRANSLATION];
    }

    const firstKey = Object.keys(textNode).find(key => typeof textNode[key] === 'string');
    return firstKey ? textNode[firstKey] : '';
}

async function getScriptureText(citation, options = {}) {
    if (!citation || citation === '') return 'No reference provided.';
    const translation = _normalizeBibleTranslation(options && options.translation);
    
    // Smart split handles "Jeremiah 4:9, 19" by only splitting if a letter follows the comma
    const parts = citation.split(/,(?=\s*[a-zA-Z])/); 
    let texts = [];
    let currentBook = '';

    for (let part of parts) {
        part = part.trim();
        if (!part) continue;

        let range;
        const match = part.match(/^(.+?)\s*(\d+.*)$/);
        
        if (match) {
            currentBook = match[1].trim();
            range = match[2].trim();
        } else {
            // Inherits the book name from the previous part (e.g., handles the "19" in "Jeremiah 4:9, 19")
            range = part;
        }
        
        if (currentBook && range) {
            const rangeParts = range.split(',');
            let subRanges = rangeParts.map(r => r.trim());
            const text = await extractFromBook(currentBook, subRanges, { translation });
            texts.push(text);
        }
    }
    return texts.join('\n\n');
}

async function extractFromBook(book, ranges, options = {}) {
    const translation = _normalizeBibleTranslation(options && options.translation);
    const isPsalm = book.toLowerCase().startsWith('psalm');
    let bookName = book.toLowerCase().replace(/\s/g, '');
    if (BOOK_ALIASES[bookName]) bookName = BOOK_ALIASES[bookName];
    let filename = isPsalm ? 'psalms.json' : bookName + '.json';
    let folder = NT_BOOKS.includes(filename.replace('.json', '')) ? 'NT' : 'OT';
    
    if (!bibleCache.books[filename]) {
        try {
            const res = await fetch(`data/bible/${folder}/${filename}`);
            bibleCache.books[filename] = await res.json();
            bibleCache.accessOrder.push(filename);
            if (bibleCache.accessOrder.length > bibleCache.MAX_CACHED_BOOKS) {
                delete bibleCache.books[bibleCache.accessOrder.shift()];
            }
        } catch (err) { return `[Scripture unavailable: ${book}]`; }
    }
    
    const bookData = (!isPsalm && Array.isArray(bibleCache.books[filename])) ? bibleCache.books[filename][0] : bibleCache.books[filename];
    let extractedText = '';
    // lastChapter is scoped to this call chain — tracks chapter across sub-ranges
    // within a single book fetch, with no shared global state between concurrent calls.
    let lastChapter = null;
    for (let range of ranges) {
        if (isPsalm) {
            extractedText += await extractPsalmRange(bookData, range, translation);
        } else {
            const result = extractBookRange(bookData, book, range, lastChapter, translation);
            extractedText += result.text;
            lastChapter = result.lastChapter;
        }
    }
    return extractedText.replace(/\d+:\d+ /g, '').trim();
}

async function extractPsalmRange(psalmsData, range, translation = DEFAULT_BIBLE_TRANSLATION) {
    let psalmNum, verseStart, verseEnd;
    if (range.includes(':')) {
        const parts = range.split(':');
        psalmNum = parseInt(parts[0]);
        const vRange = parts[1].split('-');
        verseStart = parseInt(vRange[0]);
        verseEnd = parseInt(vRange[1]) || Infinity;
    } else { psalmNum = parseInt(range); verseStart = 1; verseEnd = Infinity; }
    
    const psalm = psalmsData.find(p => p.id === `PSALM ${psalmNum}`.toUpperCase());
    if (!psalm) return `[Psalm ${psalmNum} unavailable]`;
    
    const psalmText = _selectBibleText(psalm.text, translation);
    if (!psalmText) return `[Psalm ${psalmNum} unavailable in ${_normalizeBibleTranslation(translation)}]`;
    const lines = psalmText.split('\n');
    let tempText = '';
    for (let line of lines) {
        const vMatch = line.match(/^(\d+:\d+)\s*(.*)$/);
        if (vMatch) {
            const vNum = parseInt(vMatch[1].split(':')[1]);
            if (vNum >= verseStart && vNum <= verseEnd) tempText += line + '\n';
        }
    }
    return tempText + '\n\n';
}

// Returns { text, lastChapter } so callers can thread chapter context without global state.
function extractBookRange(bookData, bookName, range, lastChapter, translation = DEFAULT_BIBLE_TRANSLATION) {
    if (!range || typeof range !== 'string') return { text: '', lastChapter };

    let chNum, vStart, vEnd;

    if (range.includes(':')) {
        const rParts = range.split(':');
        chNum = parseInt(rParts[0]);
        const vRange = rParts[1].split('-');
        vStart = parseInt(vRange[0]);
        vEnd = parseInt(vRange[1]) || Infinity;
        lastChapter = chNum; // Update for subsequent chapterless sub-ranges in this call chain
    } else {
        chNum = lastChapter || 1;
        const vRange = range.split('-');
        vStart = parseInt(vRange[0]);
        vEnd = parseInt(vRange[1]) || Infinity;
    }

    const chapter = bookData.chapters.find(ch => ch.num === chNum);
    if (!chapter) return { text: `[${bookName} ${chNum} unavailable]`, lastChapter };
    
    let tempText = '';
    chapter.verses.forEach(v => {
        if (v.num >= vStart && (vEnd === Infinity || v.num <= vEnd)) {
            const verseText = _selectBibleText(v.text, translation);
            tempText += `${chNum}:${v.num} ${verseText}\n`;
        }
    });
    return { text: tempText + '\n\n', lastChapter };
}

// ─── resolveScripturePericope ────────────────────────────────────────────────
// Global helper: normalize and resolve a scripture citation or explicit segment
// array into a structured result. Does not modify getScriptureText() or callers.

function _parseSubrange(s, inheritedChapter) {
    // C1:V1-C2:V2
    let m = s.match(/^(\d+):(\d+)-(\d+):(\d+)$/);
    if (m) return { startChapter: +m[1], startVerse: +m[2], endChapter: +m[3], endVerse: +m[4] };
    // C:V-V
    m = s.match(/^(\d+):(\d+)-(\d+)$/);
    if (m) return { startChapter: +m[1], startVerse: +m[2], endChapter: +m[1], endVerse: +m[3] };
    // C:V  (single verse with chapter)
    m = s.match(/^(\d+):(\d+)$/);
    if (m) return { startChapter: +m[1], startVerse: +m[2], endChapter: +m[1], endVerse: +m[2] };
    // V-C:V  (inherits chapter, crosses to new chapter)
    m = s.match(/^(\d+)-(\d+):(\d+)$/);
    if (m) return { startChapter: inheritedChapter || 1, startVerse: +m[1], endChapter: +m[2], endVerse: +m[3] };
    // V-V  (inherits chapter, same chapter)
    m = s.match(/^(\d+)-(\d+)$/);
    if (m) return { startChapter: inheritedChapter || 1, startVerse: +m[1], endChapter: inheritedChapter || 1, endVerse: +m[2] };
    // V  (single verse, inherits chapter)
    m = s.match(/^(\d+)$/);
    if (m) { const ch = inheritedChapter || 1; const v = +m[1]; return { startChapter: ch, startVerse: v, endChapter: ch, endVerse: v }; }
    throw new Error('Cannot parse subrange: ' + s);
}

async function _getLastVerse(book, chapter) {
    let bookName = book.toLowerCase().replace(/\s/g, '');
    if (BOOK_ALIASES[bookName]) bookName = BOOK_ALIASES[bookName];
    const filename = bookName + '.json';
    const folder = NT_BOOKS.includes(bookName) ? 'NT' : 'OT';
    if (!bibleCache.books[filename]) {
        try {
            const res = await fetch(`data/bible/${folder}/${filename}`);
            bibleCache.books[filename] = await res.json();
            bibleCache.accessOrder.push(filename);
            if (bibleCache.accessOrder.length > bibleCache.MAX_CACHED_BOOKS) {
                delete bibleCache.books[bibleCache.accessOrder.shift()];
            }
        } catch (err) { throw new Error('Cannot load book data for ' + book); }
    }
    const bookData = Array.isArray(bibleCache.books[filename])
        ? bibleCache.books[filename][0] : bibleCache.books[filename];
    const ch = bookData.chapters.find(c => c.num === chapter);
    if (!ch || !ch.verses || ch.verses.length === 0) throw new Error('Chapter ' + chapter + ' not found in ' + book);
    return Math.max(...ch.verses.map(v => v.num));
}

async function _normalizeCitationToSegments(citation) {
    const segments = [];
    const semiParts = citation.split(';').map(s => s.trim()).filter(Boolean);
    let inheritedBook = null;
    for (const semiPart of semiParts) {
        const bookMatch = semiPart.match(/^((?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d.*)$/);
        let book, rangeBlock;
        if (bookMatch) {
            book = bookMatch[1].trim();
            inheritedBook = book;
            rangeBlock = bookMatch[2].trim();
        } else {
            book = inheritedBook;
            rangeBlock = semiPart;
        }
        if (!book) throw new Error('Cannot determine book name in: ' + semiPart);
        const commaSubranges = rangeBlock.split(',').map(s => s.trim()).filter(Boolean);
        let inheritedChapter = null;
        for (const sub of commaSubranges) {
            const p = _parseSubrange(sub, inheritedChapter);
            inheritedChapter = p.startChapter;
            if (p.endChapter > p.startChapter) {
                const lastV = await _getLastVerse(book, p.startChapter);
                segments.push(book + ' ' + p.startChapter + ':' + p.startVerse + '-' + lastV);
                for (let ch = p.startChapter + 1; ch < p.endChapter; ch++) {
                    const lv = await _getLastVerse(book, ch);
                    segments.push(book + ' ' + ch + ':1-' + lv);
                }
                segments.push(book + ' ' + p.endChapter + ':1-' + p.endVerse);
            } else {
                segments.push(book + ' ' + p.startChapter + ':' + p.startVerse + '-' + p.endVerse);
            }
        }
    }
    return segments;
}

async function _resolveSegmentList(segments, label, options = {}) {
    const texts = [];
    let unavailable = false;
    for (const seg of segments) {
        const t = await getScriptureText(seg, options);
        if (!t || t.includes('[Scripture unavailable:')) unavailable = true;
        texts.push(t || '');
    }
    return { text: texts.join('\n\n'), label, segments, unavailable, error: null };
}

async function resolveScripturePericope(refOrSegments, options = {}) {
    if (Array.isArray(refOrSegments)) {
        const label = refOrSegments.join('; ');
        return _resolveSegmentList(refOrSegments, label, options);
    }
    const label = String(refOrSegments);
    try {
        const segs = await _normalizeCitationToSegments(label);
        return _resolveSegmentList(segs, label, options);
    } catch (e) {
        return { text: '', label, segments: [], unavailable: true, error: e.message };
    }
}

window.resolveScripturePericope = resolveScripturePericope;
