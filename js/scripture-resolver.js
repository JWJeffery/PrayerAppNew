/**
 * SCRIPTURE RESOLVER - QC FIXED VERSION 2026-02-17
 */
const bibleCache = { books: {}, accessOrder: [], MAX_CACHED_BOOKS: 20 };
const NT_BOOKS = ['1corinthians', '1john', '1peter', '1thessalonians', '1timothy', '2corinthians', '2john', '2peter', '2thessalonians', '2timothy', '3john', 'acts', 'colossians', 'ephesians', 'galatians', 'hebrews', 'james', 'john', 'jude', 'luke', 'mark', 'matthew', 'philemon', 'philippians', 'revelation', 'romans', 'titus'];
const BOOK_ALIASES = { 'ecclesiasticus': 'sirach', 'wisdomofsolomon': 'wisdom', 'songofthreeyoungmen': 'daniel', 'songofthreeholychildren': 'daniel', 'belandthedragon': 'daniel', 'bel': 'daniel', 'susanna': 'daniel', 'prayerofazariah': 'daniel', 'therestofesther': 'estherGK', 'additionstoesther': 'estherGK', 'therestofdaniel': 'danielGK', 'additionstodaniel': 'danielGK', 'songsofsolomon': 'songofsolomon', 'canticles': 'songofsolomon', 'canticleofcanticles': 'songofsolomon' };

async function getScriptureText(citation) {
    if (!citation || citation === '') return 'No reference provided.';
    
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
            const text = await extractFromBook(currentBook, subRanges);
            texts.push(text);
        }
    }
    return texts.join('\n\n');
}

async function extractFromBook(book, ranges) {
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
    for (let range of ranges) {
        if (isPsalm) extractedText += await extractPsalmRange(bookData, range);
        else extractedText += extractBookRange(bookData, book, range);
    }
    return extractedText.replace(/\d+:\d+ /g, '').trim();
}

async function extractPsalmRange(psalmsData, range) {
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
    
    const lines = psalm.text.NRSV.split('\n');
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

function extractBookRange(bookData, bookName, range) {
    if (!range || typeof range !== 'string') return '';

    let chNum, vStart, vEnd;

    if (range.includes(':')) {
        const rParts = range.split(':');
        chNum = parseInt(rParts[0]);
        const vRange = rParts[1].split('-');
        vStart = parseInt(vRange[0]);
        vEnd = parseInt(vRange[1]) || Infinity;
        window.lastChapter = chNum; // Persistent storage for non-sequential verse support
    } else {
        chNum = window.lastChapter || 1; 
        const vRange = range.split('-');
        vStart = parseInt(vRange[0]);
        vEnd = parseInt(vRange[1]) || Infinity;
    }

    const chapter = bookData.chapters.find(ch => ch.num === chNum);
    if (!chapter) return `[${bookName} ${chNum} unavailable]`;
    
    let tempText = ''; // Corrected variable initialization
    chapter.verses.forEach(v => {
        if (v.num >= vStart && (vEnd === Infinity || v.num <= vEnd)) {
            tempText += `${chNum}:${v.num} ${v.text}\n`;
        }
    });
    return tempText + '\n\n';
}