#!/usr/bin/env node
import fs from 'node:fs';

const manifestPath = 'data/bible/translations/nrsv-canonical-nt-internal-source/manifest.json';

const canonical = [
  ['matthew', 'data/bible/NT/matthew.json'],
  ['mark', 'data/bible/NT/mark.json'],
  ['luke', 'data/bible/NT/luke.json'],
  ['john', 'data/bible/NT/john.json'],
  ['acts', 'data/bible/NT/acts.json'],
  ['romans', 'data/bible/NT/romans.json'],
  ['1corinthians', 'data/bible/NT/1corinthians.json'],
  ['2corinthians', 'data/bible/NT/2corinthians.json'],
  ['galatians', 'data/bible/NT/galatians.json'],
  ['ephesians', 'data/bible/NT/ephesians.json'],
  ['philippians', 'data/bible/NT/philippians.json'],
  ['colossians', 'data/bible/NT/colossians.json'],
  ['1thessalonians', 'data/bible/NT/1thessalonians.json'],
  ['2thessalonians', 'data/bible/NT/2thessalonians.json'],
  ['1timothy', 'data/bible/NT/1timothy.json'],
  ['2timothy', 'data/bible/NT/2timothy.json'],
  ['titus', 'data/bible/NT/titus.json'],
  ['philemon', 'data/bible/NT/philemon.json'],
  ['hebrews', 'data/bible/NT/hebrews.json'],
  ['james', 'data/bible/NT/james.json'],
  ['1peter', 'data/bible/NT/1peter.json'],
  ['2peter', 'data/bible/NT/2peter.json'],
  ['1john', 'data/bible/NT/1john.json'],
  ['2john', 'data/bible/NT/2john.json'],
  ['3john', 'data/bible/NT/3john.json'],
  ['jude', 'data/bible/NT/jude.json'],
  ['revelation', 'data/bible/NT/revelation.json']
];

function cnum(ch, index) {
  return Number(ch?.num ?? ch?.number ?? ch?.chapter ?? ch?.chapterNumber ?? index + 1);
}

function vnum(row, index) {
  return Number(row?.num ?? row?.number ?? row?.verse ?? row?.verseNumber ?? index + 1);
}

function collectActiveRows(book) {
  const rows = new Map();

  for (const [ci, ch] of (book.chapters || []).entries()) {
    const chapter = cnum(ch, ci);

    for (const [vi, row] of (ch.verses || []).entries()) {
      const verse = vnum(row, vi);

      if (row?.text && typeof row.text === 'object' && typeof row.text.NRSV === 'string') {
        rows.set(`${chapter}:${verse}`, row.text.NRSV);
      }
    }
  }

  return rows;
}

function collectSourceRows(sourceBook) {
  const rows = new Map();

  for (const row of sourceBook.rows || []) {
    rows.set(`${row.chapter}:${row.verse}`, row.text);
  }

  return rows;
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const failures = [];
const summaries = [];

for (const [bookKey, activePath] of canonical) {
  const manifestBook = manifest.books.find(item => item.bookKey === bookKey);

  if (!manifestBook) {
    failures.push({ bookKey, activePath, reason: 'missing_manifest_book' });
    continue;
  }

  const active = JSON.parse(fs.readFileSync(activePath, 'utf8'));
  const source = JSON.parse(fs.readFileSync(manifestBook.rawPath, 'utf8'));

  const activeRows = collectActiveRows(active);
  const sourceRows = collectSourceRows(source);

  const mismatches = [];
  const missingActive = [];
  const missingSource = [];

  for (const [ref, sourceText] of sourceRows.entries()) {
    if (!activeRows.has(ref)) missingActive.push(ref);
    else if (activeRows.get(ref) !== sourceText) {
      mismatches.push({
        ref,
        activeSample: activeRows.get(ref).slice(0, 120),
        sourceSample: sourceText.slice(0, 120)
      });
    }
  }

  for (const ref of activeRows.keys()) {
    if (!sourceRows.has(ref)) missingSource.push(ref);
  }

  const failed = mismatches.length || missingActive.length || missingSource.length;

  if (failed) {
    failures.push({
      bookKey,
      activePath,
      rawPath: manifestBook.rawPath,
      mismatches: mismatches.slice(0, 12),
      missingActive: missingActive.slice(0, 12),
      missingSource: missingSource.slice(0, 12)
    });
  }

  summaries.push({
    bookKey,
    activePath,
    rawPath: manifestBook.rawPath,
    activeRows: activeRows.size,
    sourceRows: sourceRows.size,
    mismatches: mismatches.length,
    missingActive: missingActive.length,
    missingSource: missingSource.length
  });
}

const totals = {
  activeRows: summaries.reduce((sum, item) => sum + item.activeRows, 0),
  sourceRows: summaries.reduce((sum, item) => sum + item.sourceRows, 0),
  mismatches: summaries.reduce((sum, item) => sum + item.mismatches, 0),
  missingActive: summaries.reduce((sum, item) => sum + item.missingActive, 0),
  missingSource: summaries.reduce((sum, item) => sum + item.missingSource, 0)
};

const result = {
  audit: 'canonical-nt-nrsv-source-lane',
  status: failures.length ? 'failed' : 'passed',
  certificationRule: 'All NRSV text must be present in active text.NRSV rows and exactly match the controlled internal source witness.',
  manifestPath,
  manifestStatus: manifest.status,
  manifestSourceType: manifest.sourceType,
  bookCount: summaries.length,
  totals,
  failures,
  summaries
};

console.log(JSON.stringify(result, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Inspect NRSV source lane failures before proceeding.');
  process.exit(1);
}

console.log('ALL PASSED');
console.log('NEXT: Canonical NT NRSV source lane matches active text exactly.');
