#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const activePath = 'data/bible/OT/estherGK.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/esther.json';
const reportPath = process.env.GREEK_ESTHER_BOUND_SOURCE_EXACT_COLLATION_REPORT || null;
const historicalRef = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';
const sourcePaths = {
  KJV: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Esther.json',
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Esther.json'
};
const failures = [];
const comparisons = [];

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
function getVerse(book, chapterKey, verseNumber) {
  return rowsInChapter(book, chapterKey).find((row) => Number(row?.num ?? row?.verse) === Number(verseNumber)) || null;
}
function getSourceText(book, chapterKey, verseNumber) {
  const row = getVerse(book, chapterKey, verseNumber);
  return typeof row?.text === 'string' ? row.text : null;
}
function getActiveLaneText(book, chapterKey, verseNumber, translation) {
  const row = getVerse(book, chapterKey, verseNumber);
  if (!row || !row.text || typeof row.text !== 'object' || Array.isArray(row.text)) return null;
  return typeof row.text[translation] === 'string' ? row.text[translation] : null;
}
function hasActiveLane(book, chapterKey, verseNumber, translation) {
  return getActiveLaneText(book, chapterKey, verseNumber, translation) !== null;
}
function addComparison(translation, unit, activeChapter, activeVerse, sourceBook, sourceChapter, sourceVerse) {
  comparisons.push({ translation, unit, activeChapter, activeVerse, sourceBook, sourceChapter, sourceVerse });
}

const active = readJson(activePath);
const drb = readJson(drbPath);
const kjv = readHistoricalJson(historicalRef, sourcePaths.KJV);
const nabre = readHistoricalJson(historicalRef, sourcePaths.NABRE);

if (active && drb && kjv && nabre) {
  for (const translation of ['KJV', 'NABRE']) {
    const source = translation === 'KJV' ? kjv : nabre;
    for (let chapter = 1; chapter <= 10; chapter += 1) {
      for (const verse of rowsInChapter(source, chapter)) {
        const n = Number(verse.num ?? verse.verse);
        addComparison(translation, 'ordinary_esther', chapter, n, source, chapter, n);
      }
    }
  }

  for (const chapter of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    for (const verse of rowsInChapter(drb, chapter)) {
      const n = Number(verse.num ?? verse.verse);
      addComparison('DRB', 'drb_ordinary_esther', chapter, n, drb, chapter, n);
    }
  }
  for (let n = 1; n <= 3; n += 1) addComparison('DRB', 'drb_ordinary_esther', 10, n, drb, 10, n);

  for (let n = 1; n <= 11; n += 1) addComparison('DRB', 'drb_addition_a', 'Addition A', n, drb, 11, n + 1);
  for (let n = 12; n <= 17; n += 1) addComparison('DRB', 'drb_addition_a', 'Addition A', n, drb, 12, n - 11);
  for (let n = 1; n <= 7; n += 1) addComparison('DRB', 'drb_addition_b', 'Addition B', n, drb, 13, n);
  for (let n = 1; n <= 11; n += 1) addComparison('DRB', 'drb_addition_c', 'Addition C', n, drb, 13, n + 7);
  for (let n = 12; n <= 30; n += 1) addComparison('DRB', 'drb_addition_c', 'Addition C', n, drb, 14, n - 11);
  for (let n = 1; n <= 16; n += 1) addComparison('DRB', 'drb_addition_d', 'Addition D', n, drb, 15, n + 3);
  for (let n = 1; n <= 24; n += 1) addComparison('DRB', 'drb_addition_e', 'Addition E', n, drb, 16, n);
  for (let n = 1; n <= 10; n += 1) addComparison('DRB', 'drb_addition_f', 'Addition F', n, drb, 10, n + 3);
  addComparison('DRB', 'drb_addition_f', 'Addition F', 11, drb, 11, 1);
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
  if (activeText === null || sourceText === null) missing.push({ ...base, activePresent: activeText !== null, sourcePresent: sourceText !== null });
  else if (activeText === sourceText) exactMatches.push(base);
  else mismatches.push({ ...base, activeLength: activeText.length, sourceLength: sourceText.length });
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

const absenceChecks = [];
for (let n = 13; n <= 17; n += 1) {
  const present = active ? hasActiveLane(active, 8, n, 'NRSV') : false;
  absenceChecks.push({ translation: 'NRSV', activeRef: `8:${n}`, expectedPresent: false, actualPresent: present, status: present ? 'failed' : 'passed' });
  if (present) failures.push({ type: 'unexpected-nrsv-at-source-address-row', activeRef: `8:${n}` });
}
for (const translation of ['KJV', 'NABRE']) {
  for (const activeChapter of ['Addition A', 'Addition B', 'Addition C', 'Addition D', 'Addition E', 'Addition F']) {
    const presentCount = rowsInChapter(active, activeChapter).filter((row) => hasActiveLane(active, activeChapter, Number(row.num ?? row.verse), translation)).length;
    absenceChecks.push({ translation, activeChapter, expectedPresentCount: 0, actualPresentCount: presentCount, status: presentCount === 0 ? 'passed' : 'failed' });
    if (presentCount !== 0) failures.push({ type: 'unexpected-addition-lane', translation, activeChapter, presentCount });
  }
}

const report = {
  audit: 'greek-esther-bound-source-exact-collation',
  status: failures.length ? 'failed' : missing.length || mismatches.length ? 'mismatched' : 'passed',
  bibleTextMutation: false,
  scope: 'Exact source collation for active Greek Esther KJV/NABRE ordinary lanes and DRB ordinary/addition lanes under source-address policy. Does not verify NRSV.',
  activePath,
  policy: 'data/bible/registry/greek-esther-source-address-policy.json',
  checkedRefsCount: comparisons.length,
  exactMatchCount: exactMatches.length,
  mismatchCount: mismatches.length,
  missingCount: missing.length,
  byUnit,
  absenceChecks,
  mismatchRefs: mismatches.slice(0, 100),
  missingRefs: missing.slice(0, 100),
  failures
};

if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Greek Esther exact collation audit failed due to policy/input failure. Review failures.');
  process.exitCode = 1;
} else if (missing.length || mismatches.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Greek Esther bound lanes do not exactly match bound sources. Review mismatchRefs/missingRefs before mutation.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record Greek Esther KJV/NABRE ordinary lanes and DRB ordinary/addition lanes as exact-source-collated, then commit lane expansion and result records.');
}
