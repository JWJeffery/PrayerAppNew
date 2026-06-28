#!/usr/bin/env node
import fs from 'node:fs';

const activePath = 'data/bible/OT/danielGK.json';
const baselinePath = 'data/bible/OT/daniel.json';
const reportPath = process.env.GREEK_DANIEL_NRSV_BASELINE_REPORT || null;

const failures = [];

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    failures.push({ type: 'read-json-failed', path, error: String(error.message || error) });
    return null;
  }
}

const active = readJson(activePath);
const baseline = readJson(baselinePath);

function textOfActiveVerse(chapterIndex, verseIndex) {
  const verse = active?.chapters?.[chapterIndex]?.verses?.[verseIndex];
  return typeof verse?.text === 'string' ? verse.text : null;
}

function textOfBaselineVerse(chapterIndex, verseIndex) {
  const verse = baseline?.chapters?.[chapterIndex]?.verses?.[verseIndex];
  return typeof verse?.text?.NRSV === 'string' ? verse.text.NRSV : null;
}

const checked = [];
const mismatches = [];

if (active && baseline) {
  for (let chapterIndex = 0; chapterIndex < 12; chapterIndex += 1) {
    const chapterNumber = chapterIndex + 1;
    const activeVerses = active.chapters?.[chapterIndex]?.verses || [];
    const baselineVerses = baseline.chapters?.[chapterIndex]?.verses || [];
    const max = Math.max(activeVerses.length, baselineVerses.length);

    for (let verseIndex = 0; verseIndex < max; verseIndex += 1) {
      const verseNumber = verseIndex + 1;
      const activeText = textOfActiveVerse(chapterIndex, verseIndex);
      const baselineText = textOfBaselineVerse(chapterIndex, verseIndex);

      checked.push(`${chapterNumber}:${verseNumber}`);

      if (activeText !== baselineText) {
        mismatches.push({
          ref: `${chapterNumber}:${verseNumber}`,
          activePresent: activeText !== null,
          baselinePresent: baselineText !== null,
          activePreview: activeText ? activeText.slice(0, 160) : null,
          baselinePreview: baselineText ? baselineText.slice(0, 160) : null
        });
      }
    }
  }
}

const report = {
  audit: 'greek-daniel-nrsv-internal-baseline',
  status: failures.length ? 'failed' : mismatches.length ? 'mismatched' : 'passed',
  scope: 'Compare active Greek Daniel ordinary chapters 1-12 against canonical Daniel text.NRSV only.',
  activePath,
  baselinePath,
  bibleTextMutation: false,
  checkedRefsCount: checked.length,
  mismatchCount: mismatches.length,
  mismatchSample: mismatches.slice(0, 50),
  failures
};

if (reportPath) {
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Fix audit input/read failure. No Bible text was mutated.');
  process.exitCode = 1;
} else if (mismatches.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Greek Daniel ordinary chapters 1-12 do not exactly match canonical Daniel NRSV. Review mismatchSample before any mutation.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record Greek Daniel ordinary chapters 1-12 as internally consistent with canonical Daniel NRSV, then proceed to Daniel additions source extraction.');
}
