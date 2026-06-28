#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const reportPath = process.env.GREEK_ESTHER_BOUND_SOURCE_SHAPES_REPORT || null;
const activePath = 'data/bible/OT/estherGK.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/esther.json';
const historicalRef = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';
const historicalPaths = {
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Esther.json',
  KJV: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Esther.json'
};

const failures = [];

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

function chapterId(chapter) {
  return String(chapter?.num ?? chapter?.chapter ?? chapter?.id ?? 'UNKNOWN');
}

function chapterRows(book) {
  return (book?.chapters || []).map((chapter) => ({
    chapter: chapterId(chapter),
    rowCount: Array.isArray(chapter?.verses) ? chapter.verses.length : 0,
    firstVerse: chapter?.verses?.[0] ? Number(chapter.verses[0].num ?? chapter.verses[0].verse) : null,
    lastVerse: chapter?.verses?.at(-1) ? Number(chapter.verses.at(-1).num ?? chapter.verses.at(-1).verse) : null
  }));
}

function totalRows(book) {
  return chapterRows(book).reduce((sum, chapter) => sum + chapter.rowCount, 0);
}

function textShape(book) {
  let stringRows = 0;
  let objectRows = 0;
  let otherRows = 0;
  for (const chapter of book?.chapters || []) {
    for (const verse of chapter?.verses || []) {
      if (typeof verse?.text === 'string') stringRows += 1;
      else if (verse?.text && typeof verse.text === 'object' && !Array.isArray(verse.text)) objectRows += 1;
      else otherRows += 1;
    }
  }
  return { stringRows, objectRows, otherRows };
}

const active = readJson(activePath);
const drb = readJson(drbPath);
const nabre = readHistoricalJson(historicalRef, historicalPaths.NABRE);
const kjv = readHistoricalJson(historicalRef, historicalPaths.KJV);

const report = {
  audit: 'greek-esther-bound-source-shapes',
  status: failures.length ? 'failed' : 'passed',
  bibleTextMutation: false,
  scope: 'Inventory active Greek Esther and bound DRB/NABRE/KJV Esther source shapes. No address mapping, text comparison, or mutation.',
  active: {
    path: activePath,
    metaName: active?.meta?.name || null,
    metaId: active?.meta?.id || null,
    totalRows: totalRows(active),
    textShape: textShape(active),
    chapters: chapterRows(active)
  },
  DRB: {
    sourceRef: 'main/current',
    path: drbPath,
    totalRows: totalRows(drb),
    textShape: textShape(drb),
    chapters: chapterRows(drb)
  },
  NABRE: {
    sourceRef: historicalRef,
    path: historicalPaths.NABRE,
    totalRows: totalRows(nabre),
    textShape: textShape(nabre),
    chapters: chapterRows(nabre)
  },
  KJV: {
    sourceRef: historicalRef,
    path: historicalPaths.KJV,
    totalRows: totalRows(kjv),
    textShape: textShape(kjv),
    chapters: chapterRows(kjv)
  },
  expectedNextClassification: [
    'active_estherGK_is_named_additions_plus_ordinary_chapters',
    'bound_sources_have_different_esther_forms',
    'address_mapping_policy_required_before_lane_expansion_or_collation'
  ],
  failures
};

if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Greek Esther source-shape inventory failed. Review failures before mapping.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record Greek Esther source-shape inventory, then define address-mapping policy before any text mutation.');
}
