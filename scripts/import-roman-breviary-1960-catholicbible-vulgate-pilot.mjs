import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const ROOT = process.cwd();
const BASE_URL = 'https://catholicbible.online/vulgate';

const SCRIPTURE_TARGETS = [
  {
    bookId: 'JOB',
    book: 'job',
    bookTitle: 'Liber Job',
    shortTitle: 'Job',
    biblePartNo: 1,
    bookNo: 20,
    targetFile: 'data/bible/translations/vulgate-clementine/raw/job.json',
    chapters: [
      {
        chapter: 7,
        probes: ['Parce mihi', 'nihil enim sunt dies mei'],
        requiredVerses: [16, 17, 18, 19, 20, 21]
      },
      {
        chapter: 14,
        probes: ['Homo natus de muliere', 'Breves dies hominis'],
        requiredVerses: [1, 2, 3, 4, 5, 6]
      },
      {
        chapter: 19,
        probes: ['Pelli meae', 'Scio enim quod redemptor meus vivit'],
        requiredVerses: [20, 21, 22, 23, 24, 25, 26, 27]
      }
    ]
  },
  {
    bookId: '1_CORINTHIANS',
    book: '1-corinthians',
    bookTitle: 'Epistola Ad Corinthios Prima',
    shortTitle: '1 Corinthians',
    biblePartNo: 2,
    bookNo: 7,
    targetFile: 'data/bible/translations/vulgate-clementine/raw/1-corinthians.json',
    chapters: [
      {
        chapter: 15,
        probes: ['Si autem Christus praedicatur', 'in momento in ictu oculi', 'Absorpta est mors'],
        requiredVerses: [
          12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
          35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
          51, 52, 53, 54, 55, 56, 57, 58
        ]
      }
    ]
  }
];

const PSALTER_TARGET = {
  bookId: 'PSALMS',
  book: 'psalms',
  bookTitle: 'Liber Psalmorum',
  shortTitle: 'Psalms',
  biblePartNo: 1,
  bookNo: 21,
  targetFile: 'data/bible/translations/vulgate-psalter/raw/psalms.json',
  chapters: [
    { chapter: 5, probes: ['Verba mea auribus percipe', 'Dirige in conspectu tuo'], requiredVerses: [] },
    { chapter: 6, probes: ['Domine ne in furore tuo', 'Miserere mei Domine'], requiredVerses: [] },
    { chapter: 7, probes: ['Domine Deus meus in te speravi', 'Salvum me fac'], requiredVerses: [] },
    { chapter: 22, probes: ['Dominus regit me', 'In loco pascuae'], requiredVerses: [] },
    { chapter: 24, probes: ['Ad te Domine levavi', 'Delicta juventutis'], requiredVerses: [] },
    { chapter: 26, probes: ['Dominus illuminatio mea', 'Credo videre bona Domini'], requiredVerses: [] },
    { chapter: 39, probes: ['Domine ad adjuvandum me respice'], requiredVerses: [] },
    { chapter: 40, probes: ['Beatus qui intelligit', 'Sana animam meam'], requiredVerses: [] },
    { chapter: 41, probes: ['Quemadmodum desiderat cervus', 'Sitivit anima mea'], requiredVerses: [] }
  ]
};

function targetUrl(target, chapter) {
  return `${BASE_URL}?bible_part_no=${target.biblePartNo}&book_no=${target.bookNo}&chapter_no=${chapter}`;
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'PrayerAppNew Roman Breviary CatholicBible Vulgate pilot importer'
      }
    }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          return;
        }
        resolve({
          url,
          finalUrl: response.responseUrl || url,
          status: response.statusCode,
          body
        });
      });
    });
    request.setTimeout(20000, () => {
      request.destroy(new Error(`Timeout fetching ${url}`));
    });
    request.on('error', reject);
  });
}

function htmlTextChunks(html) {
  let body = String(html || '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|td|h1|h2|h3|h4|span|a)>/gi, '\n$&');

  body = body
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#230;/g, 'æ')
    .replace(/&#198;/g, 'Æ')
    .replace(/&#339;/g, 'œ')
    .replace(/&#338;/g, 'Œ');

  return body
    .split(/\r?\n/)
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function stripAccents(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function norm(value) {
  return stripAccents(value)
    .replace(/\u00a0/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isNumericLine(line) {
  return /^\d{1,3}$/.test(String(line || '').trim());
}

function isStopLine(line) {
  const cleaned = String(line || '').trim();
  if (!cleaned) return true;
  if (cleaned === '|' || cleaned === '< prev' || cleaned === 'next >') return true;
  if (/^(Vulgate|Douay-Rheims|Knox Bible|Side-by-Side|OT|NT)$/i.test(cleaned)) return true;
  if (/^(Genesis|Exodus|Leviticus|Numeri|Deuteronomium|Josue|Judicum|Ruth|Psalmi)$/i.test(cleaned)) return true;
  if (/^Psalmus\s+\d+/i.test(cleaned)) return true;
  if (/^Caput\s+\d+/i.test(cleaned)) return true;
  if (/^Chapter\s+\d+/i.test(cleaned)) return true;
  return false;
}

function collectRowsFromNumericMarkers(lines) {
  const rows = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!isNumericLine(lines[i])) continue;
    const verse = Number(lines[i]);
    if (!Number.isFinite(verse) || verse < 1 || verse > 200) continue;

    const pieces = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      if (isNumericLine(lines[j])) break;
      if (isStopLine(lines[j]) && pieces.length > 0) break;
      if (isStopLine(lines[j]) && pieces.length === 0) continue;
      pieces.push(lines[j]);
    }

    const text = pieces.join(' ').replace(/\s+/g, ' ').trim();
    if (text.length < 2) continue;
    rows.push({ verse, text, lineIndex: i });
  }
  return rows;
}

function groupConsecutiveRows(rows) {
  const groups = [];
  for (let i = 0; i < rows.length; i += 1) {
    const group = [rows[i]];
    let expected = rows[i].verse + 1;
    for (let j = i + 1; j < rows.length; j += 1) {
      if (rows[j].verse === expected) {
        group.push(rows[j]);
        expected += 1;
        continue;
      }
      if (rows[j].verse <= rows[j - 1].verse) break;
      if (rows[j].verse > expected + 2) break;
    }
    groups.push(group);
  }
  return groups;
}

function scoreGroup(group, targetChapter) {
  const joined = norm(group.map(row => row.text).join(' '));
  let score = group.length;
  for (const probe of targetChapter.probes || []) {
    if (joined.includes(norm(probe))) score += 30;
  }
  for (const verse of targetChapter.requiredVerses || []) {
    if (group.some(row => row.verse === verse)) score += 5;
  }
  if (group[0]?.verse === 1) score += 10;
  return score;
}

function extractVerses(lines, targetChapter) {
  const rows = collectRowsFromNumericMarkers(lines);
  const groups = groupConsecutiveRows(rows);
  if (!groups.length) {
    throw new Error(`No verse groups found for chapter ${targetChapter.chapter}`);
  }

  groups.sort((a, b) => scoreGroup(b, targetChapter) - scoreGroup(a, targetChapter));
  const best = groups[0];

  const required = new Set(targetChapter.requiredVerses || []);
  const present = new Set(best.map(row => row.verse));
  const missing = [...required].filter(verse => !present.has(verse));

  if (missing.length) {
    throw new Error(`Missing required verses for chapter ${targetChapter.chapter}: ${missing.join(', ')}`);
  }

  const joined = norm(best.map(row => row.text).join(' '));
  const hitCount = (targetChapter.probes || []).filter(probe => joined.includes(norm(probe))).length;
  if ((targetChapter.probes || []).length && hitCount === 0) {
    throw new Error(`No probe hit for chapter ${targetChapter.chapter}`);
  }

  return best.map(row => ({
    verse: row.verse,
    text: row.text
  }));
}

async function buildBook(target) {
  const chapters = [];
  const sourcePages = [];

  for (const chapterTarget of target.chapters) {
    const url = targetUrl(target, chapterTarget.chapter);
    const fetched = await fetchText(url);
    const chunks = htmlTextChunks(fetched.body);
    const verses = extractVerses(chunks, chapterTarget);

    chapters.push({
      chapter: chapterTarget.chapter,
      source_url: fetched.finalUrl,
      verses
    });

    sourcePages.push({
      chapter: chapterTarget.chapter,
      url: fetched.finalUrl,
      status: fetched.status,
      verse_count: verses.length,
      required_verses: chapterTarget.requiredVerses,
      required_coverage_ok: (chapterTarget.requiredVerses || []).every(verse => verses.some(row => row.verse === verse))
    });
  }

  chapters.sort((a, b) => a.chapter - b.chapter);

  return {
    book: target.book,
    book_id: target.bookId,
    book_title: target.bookTitle,
    short_title: target.shortTitle,
    source: {
      name: 'CatholicBible.online Vulgate',
      base_url: BASE_URL,
      status: 'pilot_machine_text_import',
      pages: sourcePages
    },
    chapters
  };
}

function writeJson(relPath, data) {
  const outPath = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function countBook(book) {
  const chapterCount = book.chapters.length;
  const verseCount = book.chapters.reduce((sum, chapter) => sum + chapter.verses.length, 0);
  return { chapterCount, verseCount };
}

function updateManifest(relPath, patch) {
  const fullPath = path.join(ROOT, relPath);
  const manifest = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const next = {
    ...manifest,
    ...patch
  };
  fs.writeFileSync(fullPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
}

const importedBooks = [];
for (const target of SCRIPTURE_TARGETS) {
  const book = await buildBook(target);
  writeJson(target.targetFile, book);
  importedBooks.push({ target, book, counts: countBook(book) });
}

const psalterBook = await buildBook(PSALTER_TARGET);
writeJson(PSALTER_TARGET.targetFile, psalterBook);
const psalterCounts = countBook(psalterBook);

const scriptureChapterCount = importedBooks.reduce((sum, item) => sum + item.counts.chapterCount, 0);
const scriptureVerseCount = importedBooks.reduce((sum, item) => sum + item.counts.verseCount, 0);

updateManifest('data/bible/translations/vulgate-clementine/manifest.json', {
  source_name: 'CatholicBible.online Vulgate',
  source_status: 'pilot_source_selected_pending_full_clementine_adjudication',
  source_repo: null,
  source_path: BASE_URL,
  status: 'pilot_imported_bounded_source_lane',
  note: 'Bounded pilot import for Roman Breviary scripture binding only. This lane is not yet a complete Vulgate Bible corpus.',
  imported_at: new Date().toISOString(),
  book_count: importedBooks.length,
  total_chapter_count: scriptureChapterCount,
  total_verse_count: scriptureVerseCount,
  books: importedBooks.map(item => ({
    file: item.target.targetFile.replace('data/bible/translations/vulgate-clementine/', ''),
    source_path: BASE_URL,
    chapter_count: item.counts.chapterCount,
    verse_count: item.counts.verseCount,
    imported_chapters: item.book.chapters.map(chapter => chapter.chapter)
  }))
});

updateManifest('data/bible/translations/vulgate-psalter/manifest.json', {
  source_name: 'CatholicBible.online Vulgate Psalter',
  source_status: 'pilot_source_selected_pending_full_psalter_adjudication',
  source_repo: null,
  source_path: BASE_URL,
  status: 'pilot_imported_bounded_source_lane',
  note: 'Bounded pilot import for Roman Breviary psalm appointment binding only. This lane is not yet a complete Vulgate Psalter corpus.',
  imported_at: new Date().toISOString(),
  book_count: 1,
  total_chapter_count: psalterCounts.chapterCount,
  total_verse_count: psalterCounts.verseCount,
  books: [
    {
      file: PSALTER_TARGET.targetFile.replace('data/bible/translations/vulgate-psalter/', ''),
      source_path: BASE_URL,
      chapter_count: psalterCounts.chapterCount,
      verse_count: psalterCounts.verseCount,
      imported_chapters: psalterBook.chapters.map(chapter => chapter.chapter)
    }
  ]
});

for (const relPath of [
  'data/bible/translations/vulgate-clementine/raw/.gitkeep',
  'data/bible/translations/vulgate-psalter/raw/.gitkeep'
]) {
  const fullPath = path.join(ROOT, relPath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

console.log(JSON.stringify({
  result: 'OK',
  scripture_books: importedBooks.map(item => ({
    book_id: item.book.book_id,
    chapters: item.book.chapters.map(chapter => chapter.chapter),
    verse_count: item.counts.verseCount
  })),
  psalter: {
    book_id: psalterBook.book_id,
    chapters: psalterBook.chapters.map(chapter => chapter.chapter),
    verse_count: psalterCounts.verseCount
  }
}, null, 2));
