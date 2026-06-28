#!/usr/bin/env node
import fs from 'node:fs';

const activePath = 'data/bible/OT/danielGK.json';
const baselinePath = 'data/bible/OT/daniel.json';
const reportPath = process.env.GREEK_DANIEL_NRSV_ORDINARY_REPAIR_REPORT || null;

const failures = [];
const repaired = [];

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    failures.push({ type: 'read-json-failed', path, error: String(error.message || error) });
    return null;
  }
}

function getActiveVerse(active, chapterNumber, verseNumber) {
  return active?.chapters?.[chapterNumber - 1]?.verses?.find((row) => Number(row?.num ?? row?.verse) === verseNumber) || null;
}

function getBaselineText(baseline, chapterNumber, verseNumber) {
  const row = baseline?.chapters?.[chapterNumber - 1]?.verses?.find((verse) => Number(verse?.num ?? verse?.verse) === verseNumber);
  return typeof row?.text?.NRSV === 'string' ? row.text.NRSV : null;
}

function setFromBaseline(active, baseline, baselineChapter, baselineVerse, activeChapter, activeVerse, mapping) {
  const activeRow = getActiveVerse(active, activeChapter, activeVerse);
  const baselineText = getBaselineText(baseline, baselineChapter, baselineVerse);

  if (!activeRow) {
    failures.push({ type: 'active-row-missing', baselineRef: `${baselineChapter}:${baselineVerse}`, activeRef: `${activeChapter}:${activeVerse}`, mapping });
    return;
  }

  if (baselineText === null) {
    failures.push({ type: 'baseline-text-missing', baselineRef: `${baselineChapter}:${baselineVerse}`, activeRef: `${activeChapter}:${activeVerse}`, mapping });
    return;
  }

  if (typeof activeRow.text !== 'string') {
    failures.push({ type: 'active-text-not-string', baselineRef: `${baselineChapter}:${baselineVerse}`, activeRef: `${activeChapter}:${activeVerse}`, mapping });
    return;
  }

  if (activeRow.text !== baselineText) {
    repaired.push({
      baselineRef: `${baselineChapter}:${baselineVerse}`,
      activeRef: `${activeChapter}:${activeVerse}`,
      mapping,
      beforePreview: activeRow.text.slice(0, 180),
      afterPreview: baselineText.slice(0, 180)
    });
    activeRow.text = baselineText;
  }
}

function repairDirectChapter(active, baseline, chapterNumber) {
  const baselineVerses = baseline?.chapters?.[chapterNumber - 1]?.verses || [];
  for (const verse of baselineVerses) {
    const verseNumber = Number(verse?.num ?? verse?.verse);
    if (!Number.isInteger(verseNumber)) continue;
    setFromBaseline(active, baseline, chapterNumber, verseNumber, chapterNumber, verseNumber, 'direct');
  }
}

const active = readJson(activePath);
const baseline = readJson(baselinePath);

if (active && baseline) {
  repairDirectChapter(active, baseline, 1);
  repairDirectChapter(active, baseline, 2);

  for (let verseNumber = 1; verseNumber <= 23; verseNumber += 1) {
    setFromBaseline(active, baseline, 3, verseNumber, 3, verseNumber, 'daniel_3_before_prayer_song_direct');
  }

  for (let verseNumber = 24; verseNumber <= 30; verseNumber += 1) {
    setFromBaseline(active, baseline, 3, verseNumber, 3, verseNumber + 67, 'daniel_3_after_prayer_song_shifted_plus_67');
  }

  for (let chapterNumber = 4; chapterNumber <= 12; chapterNumber += 1) {
    repairDirectChapter(active, baseline, chapterNumber);
  }
}

if (!failures.length && active) {
  fs.writeFileSync(activePath, `${JSON.stringify(active, null, 2)}\n`);
}

const report = {
  repair: 'greek-daniel-nrsv-ordinary-from-canonical',
  status: failures.length ? 'failed' : 'repaired',
  activePath,
  baselinePath,
  bibleTextMutation: true,
  mutationScope: 'Only active Greek Daniel ordinary Daniel 1-12 rows; Prayer/Song, Susanna, and Bel and the Dragon rows are not used as baseline sources and are not intentionally changed.',
  mappingPolicy: {
    'Daniel 1-2': 'direct chapter:verse repair from canonical Daniel text.NRSV',
    'Daniel 3:1-23': 'direct chapter:verse repair before Prayer/Song insertion',
    'Daniel 3:24-30': 'repair active Greek Daniel 3:91-97 from canonical Daniel 3:24-30',
    'Daniel 4-12': 'direct chapter:verse repair from canonical Daniel text.NRSV'
  },
  repairedCount: repaired.length,
  repairedSample: repaired.slice(0, 80),
  failures
};

if (reportPath) {
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Repair failed before writing active file. Review failures.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Run the Greek Daniel NRSV internal baseline audit, then inspect git diff for danielGK only.');
}
