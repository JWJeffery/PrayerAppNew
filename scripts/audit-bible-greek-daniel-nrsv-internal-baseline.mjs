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

function textOfActive(chapterNumber, verseNumber) {
  const verse = active?.chapters?.[chapterNumber - 1]?.verses?.find((row) => Number(row?.num ?? row?.verse) === verseNumber);
  return typeof verse?.text === 'string' ? verse.text : null;
}

function textOfBaseline(chapterNumber, verseNumber) {
  const verse = baseline?.chapters?.[chapterNumber - 1]?.verses?.find((row) => Number(row?.num ?? row?.verse) === verseNumber);
  return typeof verse?.text?.NRSV === 'string' ? verse.text.NRSV : null;
}

function compactText(value) {
  return String(value ?? '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[\s\u00a0]+/g, '')
    .replace(/["']/g, '')
    .trim();
}

function compareKind(activeText, baselineText) {
  if (activeText === baselineText) return 'exact';
  if (activeText === null || baselineText === null) return 'presence_mismatch';
  if (compactText(activeText) === compactText(baselineText)) return 'spacing_quote_only';
  return 'substantive';
}

const comparisons = [];

function addDirectChapter(chapterNumber) {
  const baselineVerses = baseline?.chapters?.[chapterNumber - 1]?.verses || [];
  for (const verse of baselineVerses) {
    const verseNumber = Number(verse?.num ?? verse?.verse);
    if (!Number.isInteger(verseNumber)) continue;
    comparisons.push({
      baselineRef: `${chapterNumber}:${verseNumber}`,
      activeRef: `${chapterNumber}:${verseNumber}`,
      baselineChapter: chapterNumber,
      baselineVerse: verseNumber,
      activeChapter: chapterNumber,
      activeVerse: verseNumber,
      mapping: 'direct'
    });
  }
}

if (active && baseline) {
  addDirectChapter(1);
  addDirectChapter(2);

  for (let verseNumber = 1; verseNumber <= 23; verseNumber += 1) {
    comparisons.push({
      baselineRef: `3:${verseNumber}`,
      activeRef: `3:${verseNumber}`,
      baselineChapter: 3,
      baselineVerse: verseNumber,
      activeChapter: 3,
      activeVerse: verseNumber,
      mapping: 'daniel_3_before_prayer_song_direct'
    });
  }

  for (let verseNumber = 24; verseNumber <= 30; verseNumber += 1) {
    comparisons.push({
      baselineRef: `3:${verseNumber}`,
      activeRef: `3:${verseNumber + 67}`,
      baselineChapter: 3,
      baselineVerse: verseNumber,
      activeChapter: 3,
      activeVerse: verseNumber + 67,
      mapping: 'daniel_3_after_prayer_song_shifted_plus_67'
    });
  }

  for (let chapterNumber = 4; chapterNumber <= 12; chapterNumber += 1) {
    addDirectChapter(chapterNumber);
  }
}

const checked = [];
const exactMatches = [];
const spacingQuoteOnlyMismatches = [];
const substantiveMismatches = [];
const presenceMismatches = [];

for (const comparison of comparisons) {
  const activeText = textOfActive(comparison.activeChapter, comparison.activeVerse);
  const baselineText = textOfBaseline(comparison.baselineChapter, comparison.baselineVerse);
  const kind = compareKind(activeText, baselineText);

  checked.push({
    baselineRef: comparison.baselineRef,
    activeRef: comparison.activeRef,
    mapping: comparison.mapping,
    kind
  });

  const record = {
    baselineRef: comparison.baselineRef,
    activeRef: comparison.activeRef,
    mapping: comparison.mapping,
    activePresent: activeText !== null,
    baselinePresent: baselineText !== null,
    activePreview: activeText ? activeText.slice(0, 200) : null,
    baselinePreview: baselineText ? baselineText.slice(0, 200) : null
  };

  if (kind === 'exact') exactMatches.push(record);
  else if (kind === 'spacing_quote_only') spacingQuoteOnlyMismatches.push(record);
  else if (kind === 'presence_mismatch') presenceMismatches.push(record);
  else substantiveMismatches.push(record);
}

const exactMismatchCount = spacingQuoteOnlyMismatches.length + substantiveMismatches.length + presenceMismatches.length;
const status = failures.length
  ? 'failed'
  : substantiveMismatches.length || presenceMismatches.length
    ? 'substantive_mismatch'
    : spacingQuoteOnlyMismatches.length
      ? 'formatting_only_mismatch'
      : 'passed';

const report = {
  audit: 'greek-daniel-nrsv-internal-baseline',
  status,
  scope: 'Compare active Greek Daniel ordinary chapters 1-12 against canonical Daniel text.NRSV using Greek Daniel chapter 3 insertion mapping.',
  activePath,
  baselinePath,
  bibleTextMutation: false,
  mappingPolicy: {
    'Daniel 1-2': 'direct chapter:verse comparison',
    'Daniel 3:1-23': 'direct chapter:verse comparison before Prayer/Song insertion',
    'Daniel 3:24-30': 'compare canonical Daniel 3:24-30 to active Greek Daniel 3:91-97 after Prayer/Song insertion',
    'Daniel 4-12': 'direct chapter:verse comparison'
  },
  checkedRefsCount: checked.length,
  exactMatchCount: exactMatches.length,
  exactMismatchCount,
  spacingQuoteOnlyMismatchCount: spacingQuoteOnlyMismatches.length,
  substantiveMismatchCount: substantiveMismatches.length,
  presenceMismatchCount: presenceMismatches.length,
  spacingQuoteOnlyMismatchSample: spacingQuoteOnlyMismatches.slice(0, 50),
  substantiveMismatchSample: substantiveMismatches.slice(0, 50),
  presenceMismatchSample: presenceMismatches.slice(0, 50),
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
} else if (substantiveMismatches.length || presenceMismatches.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Greek Daniel ordinary chapters 1-12 has substantive or presence mismatches. Review substantiveMismatchSample and presenceMismatchSample before any mutation.');
  process.exitCode = 1;
} else if (spacingQuoteOnlyMismatches.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Greek Daniel ordinary chapters 1-12 has spacing/quote-only exact-text defects. Repair active formatting from canonical Daniel NRSV before promotion.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record Greek Daniel ordinary chapters 1-12 as internally consistent with canonical Daniel NRSV under the Greek Daniel insertion mapping, then proceed to Daniel additions source extraction.');
}
