#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const activePath = 'data/bible/OT/estherGK.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/esther.json';
const reportPath = process.env.GREEK_ESTHER_BOUND_SOURCE_LANE_REPAIR_REPORT || null;
const historicalRef = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';
const sourcePaths = {
  KJV: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Esther.json',
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Esther.json'
};
const failures = [];
const conversions = [];
const insertedRows = [];
const laneWrites = [];

function readJson(path) {
  try { return JSON.parse(fs.readFileSync(path, 'utf8')); }
  catch (error) { failures.push({ type: 'read-json-failed', path, error: String(error.message || error) }); return null; }
}

function readHistoricalJson(ref, path) {
  const result = spawnSync('git', ['show', `${ref}:${path}`], { encoding: 'utf8' });
  if (result.status !== 0) {
    failures.push({ type: 'git-show-failed', ref, path, stderr: String(result.stderr || '').trim() });
    return null;
  }
  try { return JSON.parse(result.stdout); }
  catch (error) { failures.push({ type: 'historical-json-parse-failed', ref, path, error: String(error.message || error) }); return null; }
}

function chapterId(chapter) { return String(chapter?.num ?? chapter?.chapter ?? chapter?.id ?? 'UNKNOWN'); }
function rowsInChapter(book, chapterKey) {
  const key = String(chapterKey);
  const chapter = book?.chapters?.find((row) => chapterId(row) === key);
  return Array.isArray(chapter?.verses) ? chapter.verses : [];
}
function getChapter(book, chapterKey) {
  const key = String(chapterKey);
  return book?.chapters?.find((row) => chapterId(row) === key) || null;
}
function getVerse(book, chapterKey, verseNumber) {
  return rowsInChapter(book, chapterKey).find((row) => Number(row?.num ?? row?.verse) === Number(verseNumber)) || null;
}
function getSourceText(book, chapterKey, verseNumber) {
  const row = getVerse(book, chapterKey, verseNumber);
  return typeof row?.text === 'string' ? row.text : null;
}

function convertAllStringsToNRSV(active) {
  for (const chapter of active?.chapters || []) {
    for (const verse of chapter?.verses || []) {
      if (typeof verse?.text === 'string') {
        conversions.push({ activeRef: `${chapterId(chapter)}:${verse.num ?? verse.verse}` });
        verse.text = { NRSV: verse.text };
      }
    }
  }
}

function ensureActiveVerse(active, chapterKey, verseNumber) {
  const chapter = getChapter(active, chapterKey);
  if (!chapter) {
    failures.push({ type: 'active-chapter-missing', activeChapter: String(chapterKey) });
    return null;
  }
  let row = getVerse(active, chapterKey, verseNumber);
  if (!row) {
    row = { num: Number(verseNumber), text: {} };
    chapter.verses.push(row);
    chapter.verses.sort((a, b) => Number(a.num ?? a.verse) - Number(b.num ?? b.verse));
    insertedRows.push({ activeRef: `${chapterId(chapter)}:${verseNumber}` });
  }
  if (typeof row.text === 'string') row.text = { NRSV: row.text };
  if (!row.text || typeof row.text !== 'object' || Array.isArray(row.text)) {
    failures.push({ type: 'active-text-not-object', activeRef: `${chapterKey}:${verseNumber}` });
    return null;
  }
  return row;
}

function writeLane(active, translation, activeChapter, activeVerse, sourceBook, sourceChapter, sourceVerse, unit) {
  const activeRow = ensureActiveVerse(active, activeChapter, activeVerse);
  const sourceText = getSourceText(sourceBook, sourceChapter, sourceVerse);
  if (!activeRow) return;
  if (sourceText === null) {
    failures.push({ type: 'source-text-missing', translation, unit, sourceRef: `${sourceChapter}:${sourceVerse}`, activeRef: `${activeChapter}:${activeVerse}` });
    return;
  }
  if (activeRow.text[translation] !== sourceText) {
    activeRow.text[translation] = sourceText;
    laneWrites.push({ translation, unit, activeRef: `${activeChapter}:${activeVerse}`, sourceRef: `${sourceChapter}:${sourceVerse}` });
  }
}

const active = readJson(activePath);
const drb = readJson(drbPath);
const kjv = readHistoricalJson(historicalRef, sourcePaths.KJV);
const nabre = readHistoricalJson(historicalRef, sourcePaths.NABRE);

if (active && drb && kjv && nabre) {
  active.meta = active.meta || {};
  active.meta.defaultTranslation = active.meta.defaultTranslation || 'NRSV';
  active.meta.translations = {
    ...(active.meta.translations || {}),
    NRSV: {
      label: 'New Revised Standard Version',
      sourceType: 'existing_active_corpus_explicit_lane_unverified_pending_source',
      rights: active.meta.copyright || 'New Revised Standard Version Bible, copyright © 1989 National Council of the Churches of Christ in the United States of America. Used by permission. All rights reserved worldwide.'
    },
    KJV: { label: 'King James Version 1611', sourceType: 'historical_kjv_1611_source_witness', rights: 'Public Domain', sourceRef: historicalRef },
    NABRE: { label: 'New American Bible Revised Edition', sourceType: 'historical_internal_source_lane', rights: 'USCCB source witness; project-internal historical source lane', sourceRef: historicalRef },
    DRB: { label: 'Douay-Rheims Bible', sourceType: 'drb_original_douay_rheims_raw_source', rights: 'Public Domain', sourceRef: 'main/current' }
  };

  convertAllStringsToNRSV(active);

  for (const translation of ['KJV', 'NABRE']) {
    const source = translation === 'KJV' ? kjv : nabre;
    for (let chapter = 1; chapter <= 10; chapter += 1) {
      const rows = rowsInChapter(source, chapter);
      for (const verse of rows) writeLane(active, translation, chapter, Number(verse.num ?? verse.verse), source, chapter, Number(verse.num ?? verse.verse), 'ordinary_esther');
    }
  }

  for (const chapter of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    for (const verse of rowsInChapter(drb, chapter)) writeLane(active, 'DRB', chapter, Number(verse.num ?? verse.verse), drb, chapter, Number(verse.num ?? verse.verse), 'drb_ordinary_esther');
  }
  for (let n = 1; n <= 3; n += 1) writeLane(active, 'DRB', 10, n, drb, 10, n, 'drb_ordinary_esther');

  for (let n = 1; n <= 11; n += 1) writeLane(active, 'DRB', 'Addition A', n, drb, 11, n + 1, 'drb_addition_a');
  for (let n = 12; n <= 17; n += 1) writeLane(active, 'DRB', 'Addition A', n, drb, 12, n - 11, 'drb_addition_a');
  for (let n = 1; n <= 7; n += 1) writeLane(active, 'DRB', 'Addition B', n, drb, 13, n, 'drb_addition_b');
  for (let n = 1; n <= 11; n += 1) writeLane(active, 'DRB', 'Addition C', n, drb, 13, n + 7, 'drb_addition_c');
  for (let n = 12; n <= 30; n += 1) writeLane(active, 'DRB', 'Addition C', n, drb, 14, n - 11, 'drb_addition_c');
  for (let n = 1; n <= 16; n += 1) writeLane(active, 'DRB', 'Addition D', n, drb, 15, n + 3, 'drb_addition_d');
  for (let n = 1; n <= 24; n += 1) writeLane(active, 'DRB', 'Addition E', n, drb, 16, n, 'drb_addition_e');
  for (let n = 1; n <= 10; n += 1) writeLane(active, 'DRB', 'Addition F', n, drb, 10, n + 3, 'drb_addition_f');
  writeLane(active, 'DRB', 'Addition F', 11, drb, 11, 1, 'drb_addition_f');
}

if (!failures.length && active) fs.writeFileSync(activePath, `${JSON.stringify(active, null, 2)}\n`);

const report = {
  repair: 'greek-esther-bound-source-lanes',
  status: failures.length ? 'failed' : 'repaired',
  activePath,
  bibleTextMutation: true,
  mutationScope: 'Convert active Esther strings to text.NRSV objects, populate KJV/NABRE ordinary Esther lanes, populate DRB ordinary/addition lanes under source-address policy, and insert Esther 8:13-17 as source-address rows without NRSV.',
  conversionsCount: conversions.length,
  insertedRowsCount: insertedRows.length,
  insertedRows,
  laneWriteCount: laneWrites.length,
  laneWriteSummary: laneWrites.reduce((acc, row) => { const key = `${row.translation}:${row.unit}`; acc[key] = (acc[key] || 0) + 1; return acc; }, {}),
  laneWriteSample: laneWrites.slice(0, 80),
  intentionallyInactiveSourceRows: [
    { translation: 'DRB', sourceRef: '15:1-3', reason: 'source-present transition block not mapped under current active named-addition grid policy' }
  ],
  failures
};

if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Greek Esther lane repair failed. Review failures; active file was not written if failures occurred.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Run Greek Esther exact source collation audit.');
}
