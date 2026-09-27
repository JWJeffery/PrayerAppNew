import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

// Replaces the CatholicBible.online bounded pilot (scripts/import-roman-breviary-1960-
// catholicbible-vulgate-pilot.mjs, now superseded -- see the header note added there) with a
// properly provenanced source: seven1m/open-bibles, a public-domain, actively-maintained
// aggregator whose Latin file traces to the well-known Vulsearch/Tweedale Clementine Vulgate
// Project (the same lineage BibleGet-I-O/Clementine-Vulgate and most other Vulgate-JSON projects
// draw from). Pinned commit, not a live branch pull -- same discipline as the Divinum Officium pin.

const ROOT = process.cwd();
const REPO = 'seven1m/open-bibles';
const PIN = 'f257a3559025c3f873b48a75019f53a9354ed7de';
const USFX_URL = `https://raw.githubusercontent.com/${REPO}/${PIN}/lat-clementine.usfx.xml`;
const USFX_CACHE = path.join(ROOT, 'data', 'roman-breviary-1960-1962', 'source', 'open-bibles', 'lat-clementine.usfx.xml');

// Full books, not just the cited chapters -- the whole point of this pass is to stop being
// bounded to exactly whatever the one-day dev slice happens to cite today.
const BOOKS = [
  {
    usfxId: 'JOB',
    bookId: 'JOB',
    book: 'job',
    bookTitle: 'Liber Job',
    shortTitle: 'Job',
    targetFile: 'data/bible/translations/vulgate-clementine/raw/job.json'
  },
  {
    usfxId: '1CO',
    bookId: '1_CORINTHIANS',
    book: '1-corinthians',
    bookTitle: 'Epistola Beati Pauli Apostoli Ad Corinthios Prima',
    shortTitle: '1 Corinthians',
    targetFile: 'data/bible/translations/vulgate-clementine/raw/1-corinthians.json'
  }
];

const PSALTER = {
  usfxId: 'PSA',
  bookId: 'PSALMS',
  book: 'psalms',
  bookTitle: 'Liber Psalmorum',
  shortTitle: 'Psalms',
  targetFile: 'data/bible/translations/vulgate-psalter/raw/psalms.json'
};

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode} for ${url}`)); return; }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function stripTags(s) {
  return s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function extractBook(usfxText, usfxId) {
  const startMarker = `<book id="${usfxId}">`;
  const startIdx = usfxText.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Book ${usfxId} not found in USFX source`);
  const afterStart = startIdx + startMarker.length;
  const nextBookIdx = usfxText.indexOf('<book id="', afterStart);
  const closeIdx = usfxText.indexOf('</book>', afterStart);
  let end = usfxText.length;
  if (nextBookIdx !== -1) end = Math.min(end, nextBookIdx);
  if (closeIdx !== -1) end = Math.min(end, closeIdx);
  return usfxText.slice(afterStart, end);
}

function parseChapters(bookXml) {
  // Chapters are marked by self-closing <c id="N"/>; verses by <v id="M"/>...<ve/>.
  const chapterChunks = bookXml.split(/<c id="(\d+)"\/>/).slice(1); // [id, text, id, text, ...]
  const chapters = [];
  for (let i = 0; i < chapterChunks.length; i += 2) {
    const chapterNum = Number(chapterChunks[i]);
    const chapterXml = chapterChunks[i + 1];
    const verseChunks = chapterXml.split(/<v id="(\d+)"\/>/).slice(1);
    const verses = [];
    for (let j = 0; j < verseChunks.length; j += 2) {
      const verseNum = Number(verseChunks[j]);
      const rawText = verseChunks[j + 1].split('<ve/>')[0];
      const text = stripTags(rawText);
      if (text) verses.push({ verse: verseNum, text });
    }
    if (verses.length) chapters.push({ chapter: chapterNum, source_url: USFX_URL, verses });
  }
  return chapters;
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

async function main() {
  console.log(`Fetching pinned lat-clementine.usfx.xml (${REPO}@${PIN.slice(0, 12)})`);
  const usfxText = await fetchText(USFX_URL);
  fs.mkdirSync(path.dirname(USFX_CACHE), { recursive: true });
  fs.writeFileSync(USFX_CACHE, usfxText, 'utf8');
  console.log(`Cached full source at ${path.relative(ROOT, USFX_CACHE)} (${usfxText.length} bytes)`);

  const sourceBlock = {
    name: 'seven1m/open-bibles -- lat-clementine.usfx.xml',
    repo: REPO,
    commit: PIN,
    upstream_provenance: 'Vulsearch / Tweedale Clementine Vulgate Project (vulsearch.sourceforge.net), public domain',
    license: 'Public Domain',
    cached_at: path.relative(ROOT, USFX_CACHE)
  };

  for (const b of BOOKS) {
    const bookXml = extractBook(usfxText, b.usfxId);
    const chapters = parseChapters(bookXml);
    const out = {
      book: b.book,
      book_id: b.bookId,
      book_title: b.bookTitle,
      short_title: b.shortTitle,
      source: sourceBlock,
      chapters
    };
    writeJson(path.join(ROOT, b.targetFile), out);
    console.log(`Wrote ${b.targetFile}: ${chapters.length} chapters, ${chapters.reduce((n, c) => n + c.verses.length, 0)} verses`);
  }

  const psalterXml = extractBook(usfxText, PSALTER.usfxId);
  const psalterChapters = parseChapters(psalterXml);
  const psalterOut = {
    book: PSALTER.book,
    book_id: PSALTER.bookId,
    book_title: PSALTER.bookTitle,
    short_title: PSALTER.shortTitle,
    numbering: 'vulgate_gallican -- native Roman Breviary psalm numbering, no conversion needed',
    source: sourceBlock,
    chapters: psalterChapters
  };
  writeJson(path.join(ROOT, PSALTER.targetFile), psalterOut);
  console.log(`Wrote ${PSALTER.targetFile}: ${psalterChapters.length} psalms, ${psalterChapters.reduce((n, c) => n + c.verses.length, 0)} verses`);
}

main().catch(e => { console.error(e); process.exitCode = 1; });
