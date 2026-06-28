#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const reportPath = process.env.GREEK_DANIEL_BOUND_ADDITION_MAPPING_REPORT || null;
const failures = [];

const mappingPath = 'data/bible/registry/greek-daniel-bound-addition-address-mapping.json';
const activePath = 'data/bible/OT/danielGK.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/daniel.json';
const historicalRef = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';

const historicalPaths = {
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

function countRange(book, chapterNumber, firstVerse, lastVerse) {
  return rowsInChapter(book, chapterNumber).filter((row) => {
    const n = Number(row?.num ?? row?.verse);
    return Number.isInteger(n) && n >= firstVerse && n <= lastVerse;
  }).length;
}

function hasVerse(book, chapterNumber, verseNumber) {
  return rowsInChapter(book, chapterNumber).some((row) => Number(row?.num ?? row?.verse) === verseNumber);
}

function expectCount(label, actual, expected) {
  if (actual !== expected) {
    failures.push({ type: 'count-mismatch', label, expected, actual });
  }
  return { label, expected, actual, status: actual === expected ? 'passed' : 'failed' };
}

function expectPresent(label, present) {
  if (!present) {
    failures.push({ type: 'missing-verse', label });
  }
  return { label, expected: true, actual: present, status: present ? 'passed' : 'failed' };
}

const mapping = readJson(mappingPath);
const active = readJson(activePath);
const drb = readJson(drbPath);
const nabre = readHistoricalJson(historicalRef, historicalPaths.NABRE);
const kjvPrayer = readHistoricalJson(historicalRef, historicalPaths.KJV_PRAYER);
const kjvSusanna = readHistoricalJson(historicalRef, historicalPaths.KJV_SUSANNA);
const kjvBel = readHistoricalJson(historicalRef, historicalPaths.KJV_BEL);

const checks = [];

if (mapping && active && drb && nabre && kjvPrayer && kjvSusanna && kjvBel) {
  checks.push(expectCount('active prayer/song Daniel 3:24-90', countRange(active, 3, 24, 90), 67));
  checks.push(expectCount('active ordinary Daniel post-insertion 3:91-97', countRange(active, 3, 91, 97), 7));
  checks.push(expectCount('active Susanna Daniel 13:1-64', countRange(active, 13, 1, 64), 64));
  checks.push(expectCount('active Bel and Dragon Daniel 14:1-42', countRange(active, 14, 1, 42), 42));

  checks.push(expectCount('KJV Prayer of Azariah 1:1-67', countRange(kjvPrayer, 1, 1, 67), 67));
  checks.push(expectCount('KJV Susanna 1:1-64', countRange(kjvSusanna, 1, 1, 64), 64));
  checks.push(expectCount('KJV Bel and Dragon 1:1-42', countRange(kjvBel, 1, 1, 42), 42));

  checks.push(expectCount('NABRE prayer/song Daniel 3:24-90', countRange(nabre, 3, 24, 90), 67));
  checks.push(expectCount('NABRE Susanna Daniel 13:1-64', countRange(nabre, 13, 1, 64), 64));
  checks.push(expectCount('NABRE Bel and Dragon Daniel 14:1-42', countRange(nabre, 14, 1, 42), 42));

  checks.push(expectCount('DRB prayer/song Daniel 3:24-90', countRange(drb, 3, 24, 90), 67));
  checks.push(expectCount('DRB Susanna Daniel 13:1-64', countRange(drb, 13, 1, 64), 64));
  checks.push(expectPresent('DRB Bel transition Daniel 13:65', hasVerse(drb, 13, 65)));
  checks.push(expectCount('DRB Bel continuation Daniel 14:1-41', countRange(drb, 14, 1, 41), 41));
  checks.push(expectPresent('DRB Daniel 14:42 policy-extra source row', hasVerse(drb, 14, 42)));
}

const report = {
  audit: 'greek-daniel-bound-addition-address-mapping',
  status: failures.length ? 'failed' : 'passed',
  bibleTextMutation: false,
  scope: 'Validate row-count and address mapping for bound KJV, NABRE, and DRB Greek Daniel additions. No text comparison or mutation.',
  mappingPath,
  activePath,
  checks,
  drbPolicyBoundary: {
    status: 'policy_required_for_drb_daniel_14_42',
    rule: 'DRB Daniel 13:65 maps to active Daniel 14:1; DRB Daniel 14:1-41 map to active Daniel 14:2-42; DRB Daniel 14:42 remains a source-extra/policy row and must not be inserted without policy.'
  },
  failures
};

if (reportPath) {
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Address mapping validation failed. Review failures before source collation.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record mapping validation result, then create translation-specific collation reports for KJV and NABRE additions. DRB Bel remains policy-bound for Daniel 14:42.');
}
