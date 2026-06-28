#!/usr/bin/env node
import fs from 'node:fs';

const activePath = 'data/bible/OT/danielGK.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/daniel.json';
const reportPath = process.env.GREEK_DANIEL_DRB_EXACT_COLLATION_REPORT || null;

const failures = [];

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

function hasActiveLane(book, chapterNumber, verseNumber, translation) {
  return getActiveLaneText(book, chapterNumber, verseNumber, translation) !== null;
}

const active = readJson(activePath);
const drb = readJson(drbPath);
const comparisons = [];

function addComparison(unit, chapterNumber, verseNumber) {
  comparisons.push({ unit, chapterNumber, verseNumber });
}

if (active && drb) {
  for (let n = 24; n <= 90; n += 1) addComparison('prayer_song', 3, n);
  for (let n = 1; n <= 65; n += 1) addComparison('susanna_and_transition', 13, n);
  for (let n = 1; n <= 42; n += 1) addComparison('bel_and_dragon', 14, n);
}

const exactMatches = [];
const mismatches = [];
const missing = [];

for (const comparison of comparisons) {
  const activeText = getActiveLaneText(active, comparison.chapterNumber, comparison.verseNumber, 'DRB');
  const sourceText = getSourceText(drb, comparison.chapterNumber, comparison.verseNumber);
  const base = {
    unit: comparison.unit,
    activeRef: `${comparison.chapterNumber}:${comparison.verseNumber}`,
    sourceRef: `${comparison.chapterNumber}:${comparison.verseNumber}`
  };

  if (activeText === null || sourceText === null) {
    missing.push({ ...base, activePresent: activeText !== null, sourcePresent: sourceText !== null });
  } else if (activeText === sourceText) {
    exactMatches.push(base);
  } else {
    mismatches.push({ ...base, activeLength: activeText.length, sourceLength: sourceText.length });
  }
}

const disallowedLaneChecks = [];
for (const translation of ['NRSV', 'KJV', 'NABRE']) {
  const present = active ? hasActiveLane(active, 13, 65, translation) : false;
  disallowedLaneChecks.push({ translation, activeRef: '13:65', expectedPresent: false, actualPresent: present, status: present ? 'failed' : 'passed' });
  if (present) failures.push({ type: 'unexpected-active-lane-at-drb-only-row', translation, activeRef: '13:65' });
}

const byUnit = {};
for (const row of [...exactMatches, ...mismatches, ...missing]) {
  byUnit[row.unit] = byUnit[row.unit] || { checked: 0, exact: 0, mismatched: 0, missing: 0 };
  byUnit[row.unit].checked += 1;
}
for (const row of exactMatches) byUnit[row.unit].exact += 1;
for (const row of mismatches) byUnit[row.unit].mismatched += 1;
for (const row of missing) byUnit[row.unit].missing += 1;

const report = {
  audit: 'greek-daniel-drb-addition-exact-collation',
  status: failures.length ? 'failed' : missing.length || mismatches.length ? 'mismatched' : 'passed',
  bibleTextMutation: false,
  scope: 'Exact source collation for active Greek Daniel DRB addition/source-address lanes only. Does not print source text.',
  activePath,
  drbPath,
  policy: 'data/bible/registry/greek-daniel-drb-addition-source-address-policy.json',
  checkedRefsCount: comparisons.length,
  exactMatchCount: exactMatches.length,
  mismatchCount: mismatches.length,
  missingCount: missing.length,
  byUnit,
  drbOnlyRow13_65Checks: disallowedLaneChecks,
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
  console.log('NEXT: DRB exact collation audit failed due to policy/input failure. Review failures.');
  process.exitCode = 1;
} else if (missing.length || mismatches.length) {
  console.log('ALL FAILED');
  console.log('NEXT: DRB active addition lanes do not exactly match bound DRB source. Review mismatchRefs/missingRefs before mutation.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record DRB Greek Daniel additions as exact-source-collated, then commit DRB lane expansion and result records.');
}
