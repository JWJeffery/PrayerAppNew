#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const activePath = 'data/bible/OT/danielGK.json';
const reportPath = process.env.GREEK_DANIEL_KJV_NABRE_LANE_REPAIR_REPORT || null;
const historicalRef = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';

const sourcePaths = {
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Daniel.json',
  KJV_PRAYER: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Prayer of Azariah.json',
  KJV_SUSANNA: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Susanna.json',
  KJV_BEL: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Bel and the Dragon.json'
};

const failures = [];
const conversions = [];
const laneWrites = [];

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

function convertAllStringsToNRSV(active) {
  for (const chapter of active?.chapters || []) {
    for (const verse of chapter?.verses || []) {
      if (typeof verse?.text === 'string') {
        conversions.push({ ref: `${chapter.num}:${verse.num}` });
        verse.text = { NRSV: verse.text };
      }
    }
  }
}

function writeLane(active, translation, activeChapter, activeVerse, sourceBook, sourceChapter, sourceVerse, unit) {
  const activeRow = getVerse(active, activeChapter, activeVerse);
  const sourceText = getSourceText(sourceBook, sourceChapter, sourceVerse);

  if (!activeRow) {
    failures.push({ type: 'active-row-missing', translation, unit, activeRef: `${activeChapter}:${activeVerse}` });
    return;
  }

  if (!activeRow.text || typeof activeRow.text !== 'object' || Array.isArray(activeRow.text)) {
    failures.push({ type: 'active-text-not-object-after-conversion', translation, unit, activeRef: `${activeChapter}:${activeVerse}` });
    return;
  }

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
const nabre = readHistoricalJson(historicalRef, sourcePaths.NABRE);
const kjvPrayer = readHistoricalJson(historicalRef, sourcePaths.KJV_PRAYER);
const kjvSusanna = readHistoricalJson(historicalRef, sourcePaths.KJV_SUSANNA);
const kjvBel = readHistoricalJson(historicalRef, sourcePaths.KJV_BEL);

if (active && nabre && kjvPrayer && kjvSusanna && kjvBel) {
  active.meta = active.meta || {};
  active.meta.defaultTranslation = active.meta.defaultTranslation || 'NRSV';
  active.meta.translations = {
    ...(active.meta.translations || {}),
    NRSV: {
      label: 'New Revised Standard Version',
      sourceType: 'existing_active_corpus_explicit_lane',
      rights: active.meta.copyright || 'New Revised Standard Version Bible, copyright © 1989 National Council of the Churches of Christ in the United States of America. Used by permission. All rights reserved worldwide.'
    },
    KJV: {
      label: 'King James Version 1611 Apocrypha',
      sourceType: 'historical_kjv_1611_source_witness',
      rights: 'Public Domain',
      sourceRef: historicalRef
    },
    NABRE: {
      label: 'New American Bible Revised Edition',
      sourceType: 'historical_internal_source_lane',
      rights: 'USCCB source witness; project-internal historical source lane',
      sourceRef: historicalRef
    }
  };

  convertAllStringsToNRSV(active);

  for (let n = 1; n <= 67; n += 1) {
    writeLane(active, 'KJV', 3, n + 23, kjvPrayer, 1, n, 'prayer_song');
  }
  for (let n = 1; n <= 64; n += 1) {
    writeLane(active, 'KJV', 13, n, kjvSusanna, 1, n, 'susanna');
  }
  for (let n = 1; n <= 42; n += 1) {
    writeLane(active, 'KJV', 14, n, kjvBel, 1, n, 'bel_and_dragon');
  }

  for (let n = 24; n <= 90; n += 1) {
    writeLane(active, 'NABRE', 3, n, nabre, 3, n, 'prayer_song');
  }
  for (let n = 1; n <= 64; n += 1) {
    writeLane(active, 'NABRE', 13, n, nabre, 13, n, 'susanna');
  }
  for (let n = 1; n <= 42; n += 1) {
    writeLane(active, 'NABRE', 14, n, nabre, 14, n, 'bel_and_dragon');
  }
}

if (!failures.length && active) {
  fs.writeFileSync(activePath, `${JSON.stringify(active, null, 2)}\n`);
}

const report = {
  repair: 'greek-daniel-kjv-nabre-addition-lanes',
  status: failures.length ? 'failed' : 'repaired',
  activePath,
  bibleTextMutation: true,
  mutationScope: 'Convert all active danielGK string text to explicit text.NRSV objects, then populate KJV/NABRE only for mapped addition rows.',
  conversionsCount: conversions.length,
  laneWriteCount: laneWrites.length,
  laneWriteSummary: laneWrites.reduce((acc, row) => {
    const key = `${row.translation}:${row.unit}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
  laneWriteSample: laneWrites.slice(0, 60),
  failures
};

if (reportPath) {
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Lane expansion repair failed. Review failures; active file was not written if failures occurred.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Run Greek Daniel KJV/NABRE addition collation-status audit and exact source collation audit.');
}
