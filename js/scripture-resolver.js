/**
 * SCRIPTURE RESOLVER - QC FIXED VERSION 2026-02-17
 */
const bibleCache = { books: {}, accessOrder: [], MAX_CACHED_BOOKS: 20 };
const DEFAULT_BIBLE_TRANSLATION = 'NRSV';
const NT_BOOKS = ['1corinthians', '1john', '1peter', '1thessalonians', '1timothy', '2corinthians', '2john', '2peter', '2thessalonians', '2timothy', '3john', 'acts', 'colossians', 'ephesians', 'galatians', 'hebrews', 'james', 'john', 'jude', 'luke', 'mark', 'matthew', 'philemon', 'philippians', 'revelation', 'romans', 'titus'];
const BOOK_ALIASES = { 'ecclesiasticus': 'sirach', 'wisdomofsolomon': 'wisdom', 'songofthreeyoungmen': 'daniel', 'songofthreeholychildren': 'daniel', 'belandthedragon': 'daniel', 'bel': 'daniel', 'susanna': 'daniel', 'prayerofazariah': 'daniel', 'therestofesther': 'estherGK', 'additionstoesther': 'estherGK', 'therestofdaniel': 'danielGK', 'additionstodaniel': 'danielGK', 'songsofsolomon': 'songofsolomon', 'canticles': 'songofsolomon', 'canticleofcanticles': 'songofsolomon' };

const SCRIPTURE_FETCH_TIMEOUT_MS = 6500;

async function _fetchJsonWithTimeout(url, timeoutMs = SCRIPTURE_FETCH_TIMEOUT_MS) {
    const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    const timeoutId = controller
        ? setTimeout(() => controller.abort(), timeoutMs)
        : null;

    try {
        const options = controller ? { signal: controller.signal } : undefined;
        const res = await fetch(url, options);

        if (res && res.ok === false) {
            throw new Error(`Unable to load scripture source: ${url}`);
        }

        return await res.json();
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

const ETHIOPIAN_CANON_BOOKS = {
    // Ethiopian canonical scripture resources. These are routed through the
    // ET scripture corpus rather than the general OT/NT corpus.
    '1clemet': {
        canonicalId: '1CLEM_ET',
        path: 'data/bible/ET/1clementET.json'
    },
    '1clementet': {
        canonicalId: '1CLEM_ET',
        path: 'data/bible/ET/1clementET.json'
    },
    'firstclementet': {
        canonicalId: '1CLEM_ET',
        path: 'data/bible/ET/1clementET.json'
    },
    'qalementos': {
        canonicalId: '1CLEM_ET',
        path: 'data/bible/ET/1clementET.json'
    },
    'qalementos1': {
        canonicalId: '1CLEM_ET',
        path: 'data/bible/ET/1clementET.json'
    },
    'hermet': {
        canonicalId: 'HERM_ET',
        path: 'data/bible/ET/hermastheshepherdET.json'
    },
    'hermaset': {
        canonicalId: 'HERM_ET',
        path: 'data/bible/ET/hermastheshepherdET.json'
    },
    'shepherdofhermaset': {
        canonicalId: 'HERM_ET',
        path: 'data/bible/ET/hermastheshepherdET.json'
    },
    'hermastheshepherdet': {
        canonicalId: 'HERM_ET',
        path: 'data/bible/ET/hermastheshepherdET.json'
    }
};

function _normalizeBibleBookKey(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[’']/g, '')
        .replace(/[^a-z0-9]/g, '');
}

async function _resolveBibleBookSource(book, isPsalm = false) {
    let bookName = String(book || '').toLowerCase().replace(/\s/g, '');
    if (BOOK_ALIASES[bookName]) bookName = BOOK_ALIASES[bookName];

    const etSource = ETHIOPIAN_CANON_BOOKS[_normalizeBibleBookKey(bookName)]
        || ETHIOPIAN_CANON_BOOKS[_normalizeBibleBookKey(book)];

    if (etSource) {
        return {
            bookName,
            canonicalId: etSource.canonicalId,
            path: etSource.path,
            filename: etSource.path.split('/').pop(),
            folder: 'ET',
            cacheKey: etSource.path,
            registryMatched: false
        };
    }

    const registryAdapter = window.UniversalOfficeBibleRegistryAdapter;
    if (registryAdapter && typeof registryAdapter.findBookRecord === 'function') {
        try {
            const registryRecord = await registryAdapter.findBookRecord(book);
            if (registryRecord && registryRecord.path) {
                return {
                    bookName: registryRecord.key || bookName,
                    canonicalId: registryRecord.registry && registryRecord.registry.identityId
                        ? registryRecord.registry.identityId
                        : null,
                    path: registryRecord.path,
                    filename: registryRecord.path.split('/').pop(),
                    folder: registryRecord.corpus || (registryRecord.path.split('/').slice(-2, -1)[0]) || null,
                    cacheKey: registryRecord.path,
                    registryMatched: true
                };
            }
        } catch (error) {
            console.warn('Bible registry source lookup failed; using legacy scripture resolver route.', error);
        }
    }

    const filename = isPsalm ? 'psalms.json' : bookName + '.json';
    const folder = NT_BOOKS.includes(filename.replace('.json', '')) ? 'NT' : 'OT';

    return {
        bookName,
        canonicalId: null,
        path: `data/bible/${folder}/${filename}`,
        filename,
        folder,
        cacheKey: `${folder}/${filename}`,
        registryMatched: false
    };
}


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
    const source = await _resolveBibleBookSource(book, isPsalm);
    const bookName = source.bookName;
    
    if (!bibleCache.books[source.cacheKey]) {
        try {
            bibleCache.books[source.cacheKey] = await _fetchJsonWithTimeout(source.path);
            bibleCache.accessOrder.push(source.cacheKey);
            if (bibleCache.accessOrder.length > bibleCache.MAX_CACHED_BOOKS) {
                delete bibleCache.books[bibleCache.accessOrder.shift()];
            }
        } catch (err) { return `[Scripture unavailable: ${book}]`; }
    }
    
    const bookData = (!isPsalm && Array.isArray(bibleCache.books[source.cacheKey])) ? bibleCache.books[source.cacheKey][0] : bibleCache.books[source.cacheKey];
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
    const source = await _resolveBibleBookSource(book, false);
    if (!bibleCache.books[source.cacheKey]) {
        try {
            const res = await fetch(source.path);
            if (res && res.ok === false) {
                throw new Error(`Unable to load scripture source: ${source.path}`);
            }
            bibleCache.books[source.cacheKey] = await res.json();
            bibleCache.accessOrder.push(source.cacheKey);
            if (bibleCache.accessOrder.length > bibleCache.MAX_CACHED_BOOKS) {
                delete bibleCache.books[bibleCache.accessOrder.shift()];
            }
        } catch (err) { throw new Error('Cannot load book data for ' + book); }
    }
    const bookData = Array.isArray(bibleCache.books[source.cacheKey])
        ? bibleCache.books[source.cacheKey][0] : bibleCache.books[source.cacheKey];
    const ch = bookData.chapters.find(c => c.num === chapter);
    if (!ch || !ch.verses || ch.verses.length === 0) throw new Error('Chapter ' + chapter + ' not found in ' + book);
    return Math.max(...ch.verses.map(v => v.num));
}

async function _normalizeCitationToSegments(citation) {
    const segments = [];
    const semiParts = citation.split(';').map(s => s.trim()).filter(Boolean);
    let inheritedBook = null;
    for (const semiPart of semiParts) {
        const bookMatch = semiPart.match(/^((?:[1-3]\s+)?[A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)*)\s+(\d.*)$/);
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

// BEGIN ROTHERHAM TRANSLATION OVERLAY SUPPORT
(function installRotherhamTranslationOverlaySupport() {
  if (typeof getScriptureText !== 'function') {
    return;
  }

  const originalGetScriptureTextForRotherhamOverlay = getScriptureText;
  const rotherhamOverlayBookCache = new Map();

  const rotherhamOverlayBookFiles = {
    'matthew': 'data/bible/NT/matthew.json',
    'matt': 'data/bible/NT/matthew.json',
    'mt': 'data/bible/NT/matthew.json',
    'mark': 'data/bible/NT/mark.json',
    'mk': 'data/bible/NT/mark.json',
    'luke': 'data/bible/NT/luke.json',
    'lk': 'data/bible/NT/luke.json',
    'john': 'data/bible/NT/john.json',
    'jn': 'data/bible/NT/john.json',
    'acts': 'data/bible/NT/acts.json',
    'romans': 'data/bible/NT/romans.json',
    'rom': 'data/bible/NT/romans.json',
    'ii corinthians': 'data/bible/NT/2corinthians.json',
    '2 corinthians': 'data/bible/NT/2corinthians.json',
    'second corinthians': 'data/bible/NT/2corinthians.json',
    '2corinthians': 'data/bible/NT/2corinthians.json',
    'james': 'data/bible/NT/james.json',
    'jas': 'data/bible/NT/james.json',
    'iii john': 'data/bible/NT/3john.json',
    '3 john': 'data/bible/NT/3john.json',
    'third john': 'data/bible/NT/3john.json',
    '3john': 'data/bible/NT/3john.json',
    'revelation': 'data/bible/NT/revelation.json',
    'revelation of john': 'data/bible/NT/revelation.json',
    'rev': 'data/bible/NT/revelation.json',
    'apocalypse': 'data/bible/NT/revelation.json'
  };

  function normalizeRotherhamOverlayBookName(value) {
    return String(value || '')
      .trim()
      .replace(/\./g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  function parseRotherhamOverlayReference(reference) {
    const match = String(reference || '').trim().match(/^(.+?)\s+(\d+):(\d+)(?:\s*[-–]\s*(\d+))?$/);
    if (!match) {
      return null;
    }

    const path = rotherhamOverlayBookFiles[normalizeRotherhamOverlayBookName(match[1])];
    if (!path) {
      return null;
    }

    const chapter = Number.parseInt(match[2], 10);
    const startVerse = Number.parseInt(match[3], 10);
    const endVerse = match[4] ? Number.parseInt(match[4], 10) : startVerse;

    if (!Number.isInteger(chapter) || !Number.isInteger(startVerse) || !Number.isInteger(endVerse) || endVerse < startVerse) {
      return null;
    }

    return { path, chapter, startVerse, endVerse };
  }

  async function loadRotherhamOverlayBook(path) {
    if (!rotherhamOverlayBookCache.has(path)) {
      rotherhamOverlayBookCache.set(path, fetch(path).then(response => {
        if (response && response.ok === false) {
          throw new Error(`Unable to load Bible book for Rotherham overlay: ${path}`);
        }
        return response.json();
      }));
    }
    return rotherhamOverlayBookCache.get(path);
  }

  function getRotherhamOverlayText(book, chapterNum, verseNum) {
    const chapter = Array.isArray(book.chapters)
      ? book.chapters.find(candidate => candidate && candidate.num === chapterNum)
      : null;

    const overlay = book.translationOverlays
      && book.translationOverlays.Rotherham
      && book.translationOverlays.Rotherham[String(chapterNum)];

    if (overlay && typeof overlay[String(verseNum)] === 'string' && overlay[String(verseNum)].trim()) {
      return overlay[String(verseNum)];
    }

    if (chapter) {
      const verse = Array.isArray(chapter.verses)
        ? chapter.verses.find(candidate => candidate && candidate.num === verseNum)
        : null;

      if (verse && verse.text && typeof verse.text === 'object' && typeof verse.text.Rotherham === 'string' && verse.text.Rotherham.trim()) {
        return verse.text.Rotherham;
      }
    }

    return null;
  }

  async function resolveRotherhamOverlayReference(reference) {
    const parsed = parseRotherhamOverlayReference(reference);
    if (!parsed) {
      return null;
    }

    const book = await loadRotherhamOverlayBook(parsed.path);
    const pieces = [];

    for (let verseNum = parsed.startVerse; verseNum <= parsed.endVerse; verseNum += 1) {
      const text = getRotherhamOverlayText(book, parsed.chapter, verseNum);
      if (!text) {
        return null;
      }

      pieces.push(parsed.startVerse === parsed.endVerse ? text : `${verseNum} ${text}`);
    }

    return pieces.join('\n');
  }

  getScriptureText = async function getScriptureTextWithRotherhamOverlay(reference, options = {}) {
    const requestedTranslation = options && options.translation;
    if (requestedTranslation === 'Rotherham') {
      const overlayResult = await resolveRotherhamOverlayReference(reference);
      if (overlayResult) {
        return overlayResult;
      }
    }

    return originalGetScriptureTextForRotherhamOverlay.apply(this, arguments);
  };
})();
// END ROTHERHAM TRANSLATION OVERLAY SUPPORT
