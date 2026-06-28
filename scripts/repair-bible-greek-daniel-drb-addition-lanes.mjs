#!/usr/bin/env node
import fs from 'node:fs';

const activePath = 'data/bible/OT/danielGK.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/daniel.json';
const reportPath = process.env.GREEK_DANIEL_DRB_LANE_REPAIR_REPORT || null;

const failures = [];
const laneWrites = [];
const insertedRows = [];

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    failures.push({ type: 'read-json-failed', path, error: String(error.message || error) });
    return null;
  }
}

function rowsInChapter(book, chapterNumber) {
  const chapter = book?.chapters?.find((row) => Number(row?.num ?? row?.chapter) === chapterNumber);
  return Array.isArray(chapter?.verses) ? chapter.verses : [];
}

function getActiveChapter(active, chapterNumber) {
  return active?.chapters?.find((row) => Number(row?.num ?? row?.chapter) === chapterNumber) || null;
}

function getVerse(book, chapterNumber, verseNumber) {
  return rowsInChapter(book, chapterNumber).find((row) => Number(row?.num ?? row?.verse) === verseNumber) || null;
}

function getSourceText(book, chapterNumber, verseNumber) {
  const row = getVerse(book, chapterNumber, verseNumber);
  return typeof row?.text === 'string' ? row.text : null;
}

function ensureActiveVerse(active, chapterNumber, verseNumber) {
  const chapter = getActiveChapter(active, chapterNumber);
  if (!chapter) {
    failures.push({ type: 'active-chapter-missing', chapterNumber });
    return null;
  }

  let row = getVerse(active, chapterNumber, verseNumber);
  if (!row) {
    row = { num: verseNumber, text: {} };
    chapter.verses.push(row);
    chapter.verses.sort((a, b) => Number(a.num ?? a.verse) - Number(b.num ?? b.verse));
    insertedRows.push({ activeRef: `${chapterNumber}:${verseNumber}` });
  }

  if (typeof row.text === 'string') {
    row.text = { NRSV: row.text };
  }

  if (!row.text || typeof row.text !== 'object' || Array.isArray(row.text)) {
    failures.push({ type: 'active-text-not-object', activeRef: `${chapterNumber}:${verseNumber}` });
    return null;
  }

  return row;
}

function writeDrb(active, drb, chapterNumber, verseNumber, unit) {
  const activeRow = ensureActiveVerse(active, chapterNumber, verseNumber);
  const sourceText = getSourceText(drb, chapterNumber, verseNumber);

  if (!activeRow) return;
  if (sourceText === null) {
    failures.push({ type: 'source-text-missing', unit, sourceRef: `${chapterNumber}:${verseNumber}` });
    return;
  }

  if (activeRow.text.DRB !== sourceText) {
    activeRow.text.DRB = sourceText;
    laneWrites.push({ unit, activeRef: `${chapterNumber}:${verseNumber}`, sourceRef: `${chapterNumber}:${verseNumber}` });
  }
}

const active = readJson(activePath);
const drb = readJson(drbPath);

if (active && drb) {
  active.meta = active.meta || {};
  active.meta.defaultTranslation = active.meta.defaultTranslation || 'NRSV';
  active.meta.translations = {
    ...(active.meta.translations || {}),
    DRB: {
      label: 'Douay-Rheims Bible',
      sourceType: 'drb_original_douay_rheims_raw_source',
      rights: 'Public Domain',
      sourceRef: 'main/current'
    }
  };

  for (let n = 24; n <= 90; n += 1) writeDrb(active, drb, 3, n, 'prayer_song');
  for (let n = 1; n <= 65; n += 1) writeDrb(active, drb, 13, n, 'susanna_and_transition');
  for (let n = 1; n <= 42; n += 1) writeDrb(active, drb, 14, n, 'bel_and_dragon');
}

if (!failures.length && active) {
  fs.writeFileSync(activePath, `${JSON.stringify(active, null, 2)}\n`);
}

const report = {
  repair: 'greek-daniel-drb-addition-lanes',
  status: failures.length ? 'failed' : 'repaired',
  activePath,
  drbPath,
  bibleTextMutation: true,
  mutationScope: 'Populate DRB only for Greek Daniel addition/source-address rows: Daniel 3:24-90, Daniel 13:1-65, Daniel 14:1-42. Inserts active Daniel 13:65 as DRB-only when absent.',
  insertedRowsCount: insertedRows.length,
  insertedRows,
  laneWriteCount: laneWrites.length,
  laneWriteSummary: laneWrites.reduce((acc, row) => {
    acc[row.unit] = (acc[row.unit] || 0) + 1;
    return acc;
  }, {}),
  laneWriteSample: laneWrites.slice(0, 80),
  failures
};

if (reportPath) {
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: DRB addition lane repair failed. Review failures; active file was not written if failures occurred.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Run DRB exact source collation audit for Greek Daniel additions.');
}
