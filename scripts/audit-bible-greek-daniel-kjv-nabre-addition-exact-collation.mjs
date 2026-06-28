#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const reportPath = process.env.GREEK_DANIEL_KJV_NABRE_EXACT_COLLATION_REPORT || null;
const activePath = 'data/bible/OT/danielGK.json';
const historicalRef = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';
const failures = [];

const sourcePaths = {
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Daniel.json',
  KJV_PRAYER: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Prayer of Azariah.json',
  KJV_SUSANNA: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Susanna.json',
  KJV_BEL: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Bel and the Dragon.json'
};

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    failures.push({ type: 'read-json-failed', path, error: String(error.message || error) });
    return null;
  }
}

function readHistoricalJson(ref, path) {
  const result = spawnSync('git', ['show', `${ref}:${path}`], { encoding: 'utf8' });
  if (result.status !== 0) {
    failures.push({ type: 'git-show-failed', ref, path, stderr: String(result.stderr || '').trim() });
    return null;
  }
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    failures.push({ type: 'historical-json-parse-failed', ref, path, error: String(error.message || error) });
    return null;
  }
}

function rowsInChapter(book, chapterNumber) {
  const chapter = book?.chapters?.find((row) => Number(row?.num ?? row?.chapter) === chapterNumber);
  return Array.isArray(chapter?.verses) ? chapter.verses : [];
}

function getVerse(book, chapterNumber, verseNumber) {
  return rowsInChapter(book, chapterNumber).find((row) => Number(row?.num ?? row?.verse) === verseNumber) || null;
}

function getSourceText(book, chapterNumber, verseNumber) {
  const row = getVerse(book, chapterNumber, verseNumber);
  return typeof row?.text === 'string' ? row.text : null;
}

function getActiveLaneText(book, chapterNumber, verseNumber, translation) {
  const row = getVerse(book, chapterNumber, verseNumber);
  if (!row || !row.text || typeof row.text !== 'object' || Array.isArray(row.text)) return null;
  return typeof row.text[translation] === 'string' ? row.text[translation] : null;
}

const comparisons = [];

function addComparison(translation, unit, activeChapter, activeVerse, sourceBook, sourceChapter, sourceVerse) {
  comparisons.push({ translation, unit, activeChapter, activeVerse, sourceBook, sourceChapter, sourceVerse });
}

const active = readJson(activePath);
const nabre = readHistoricalJson(historicalRef, sourcePaths.NABRE);
const kjvPrayer = readHistoricalJson(historicalRef, sourcePaths.KJV_PRAYER);
const kjvSusanna = readHistoricalJson(historicalRef, sourcePaths.KJV_SUSANNA);
const kjvBel = readHistoricalJson(historicalRef, sourcePaths.KJV_BEL);

if (active && nabre && kjvPrayer && kjvSusanna && kjvBel) {
  for (let n = 1; n <= 67; n += 1) addComparison('KJV', 'prayer_song', 3, n + 23, kjvPrayer, 1, n);
  for (let n = 1; n <= 64; n += 1) addComparison('KJV', 'susanna', 13, n, kjvSusanna, 1, n);
  for (let n = 1; n <= 42; n += 1) addComparison('KJV', 'bel_and_dragon', 14, n, kjvBel, 1, n);

  for (let n = 24; n <= 90; n += 1) addComparison('NABRE', 'prayer_song', 3, n, nabre, 3, n);
  for (let n = 1; n <= 64; n += 1) addComparison('NABRE', 'susanna', 13, n, nabre, 13, n);
  for (let n = 1; n <= 42; n += 1) addComparison('NABRE', 'bel_and_dragon', 14, n, nabre, 14, n);
}

const exactMatches = [];
const mismatches = [];
const missing = [];

for (const comparison of comparisons) {
  const activeText = getActiveLaneText(active, comparison.activeChapter, comparison.activeVerse, comparison.translation);
  const sourceText = getSourceText(comparison.sourceBook, comparison.sourceChapter, comparison.sourceVerse);
  const base = {
    translation: comparison.translation,
    unit: comparison.unit,
    activeRef: `${comparison.activeChapter}:${comparison.activeVerse}`,
    sourceRef: `${comparison.sourceChapter}:${comparison.sourceVerse}`
  };

  if (activeText === null || sourceText === null) {
    missing.push({
      ...base,
      activePresent: activeText !== null,
      sourcePresent: sourceText !== null
    });
  } else if (activeText === sourceText) {
    exactMatches.push(base);
  } else {
    mismatches.push({
      ...base,
      activeLength: activeText.length,
      sourceLength: sourceText.length
    });
  }
}

const byUnit = {};
for (const row of [...exactMatches, ...mismatches, ...missing]) {
  const key = `${row.translation}:${row.unit}`;
  byUnit[key] = byUnit[key] || { checked: 0, exact: 0, mismatched: 0, missing: 0 };
  byUnit[key].checked += 1;
}
for (const row of exactMatches) byUnit[`${row.translation}:${row.unit}`].exact += 1;
for (const row of mismatches) byUnit[`${row.translation}:${row.unit}`].mismatched += 1;
for (const row of missing) byUnit[`${row.translation}:${row.unit}`].missing += 1;

const report = {
  audit: 'greek-daniel-kjv-nabre-addition-exact-collation',
  status: failures.length ? 'failed' : missing.length || mismatches.length ? 'mismatched' : 'passed',
  bibleTextMutation: false,
  scope: 'Exact source collation for active Greek Daniel KJV/NABRE addition lanes only. Does not print copyrighted or source text.',
  activePath,
  sourceRef: historicalRef,
  checkedRefsCount: comparisons.length,
  exactMatchCount: exactMatches.length,
  mismatchCount: mismatches.length,
  missingCount: missing.length,
  byUnit,
  mismatchRefs: mismatches.slice(0, 100),
  missingRefs: missing.slice(0, 100),
  failures
};

if (reportPath) {
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Exact collation audit failed due to input/read failure. Review failures.');
  process.exitCode = 1;
} else if (missing.length || mismatches.length) {
  console.log('ALL FAILED');
  console.log('NEXT: KJV/NABRE active addition lanes do not exactly match bound sources. Review mismatchRefs/missingRefs before mutation.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record KJV/NABRE Greek Daniel additions as exact-source-collated, then commit lane expansion and result records.');
}
