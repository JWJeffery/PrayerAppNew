#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const reportPath = process.env.GREEK_DANIEL_KJV_NABRE_ADDITION_COLLATION_REPORT || null;
const failures = [];

const activePath = 'data/bible/OT/danielGK.json';
const mappingPath = 'data/bible/registry/greek-daniel-bound-addition-address-mapping.json';
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

function sourceCount(book, chapterNumber, firstVerse, lastVerse) {
  return rowsInChapter(book, chapterNumber).filter((row) => {
    const n = Number(row?.num ?? row?.verse);
    return Number.isInteger(n) && n >= firstVerse && n <= lastVerse;
  }).length;
}

function activeRows(active, chapterNumber, firstVerse, lastVerse) {
  return rowsInChapter(active, chapterNumber).filter((row) => {
    const n = Number(row?.num ?? row?.verse);
    return Number.isInteger(n) && n >= firstVerse && n <= lastVerse;
  });
}

function countActiveLane(rows, lane) {
  return rows.filter((row) => row?.text && typeof row.text === 'object' && typeof row.text[lane] === 'string').length;
}

function countActiveString(rows) {
  return rows.filter((row) => typeof row?.text === 'string').length;
}

function classifyUnit({ translation, unit, sourceRows, activeRowsForUnit }) {
  const activeLaneRows = countActiveLane(activeRowsForUnit, translation);
  const activeStringRows = countActiveString(activeRowsForUnit);
  const activeRowsCount = activeRowsForUnit.length;

  let status = 'unknown';
  if (sourceRows > 0 && activeLaneRows === sourceRows) status = 'active_lane_present_ready_for_exact_collation';
  else if (sourceRows > 0 && activeLaneRows === 0 && activeStringRows === activeRowsCount) status = 'source_present_active_translation_lane_absent_active_is_string_text';
  else if (sourceRows > 0 && activeLaneRows === 0) status = 'source_present_active_translation_lane_absent';
  else if (sourceRows === 0) status = 'source_absent';
  else status = 'partial_active_lane_present_requires_review';

  return {
    translation,
    unit,
    status,
    sourceRows,
    activeRows: activeRowsCount,
    activeStringRows,
    activeLaneRows
  };
}

const active = readJson(activePath);
const mapping = readJson(mappingPath);
const nabre = readHistoricalJson(historicalRef, historicalPaths.NABRE);
const kjvPrayer = readHistoricalJson(historicalRef, historicalPaths.KJV_PRAYER);
const kjvSusanna = readHistoricalJson(historicalRef, historicalPaths.KJV_SUSANNA);
const kjvBel = readHistoricalJson(historicalRef, historicalPaths.KJV_BEL);

const units = [];

if (active && mapping && nabre && kjvPrayer && kjvSusanna && kjvBel) {
  const activePrayerSong = activeRows(active, 3, 24, 90);
  const activeSusanna = activeRows(active, 13, 1, 64);
  const activeBel = activeRows(active, 14, 1, 42);

  units.push(classifyUnit({ translation: 'KJV', unit: 'prayer_song', sourceRows: sourceCount(kjvPrayer, 1, 1, 67), activeRowsForUnit: activePrayerSong }));
  units.push(classifyUnit({ translation: 'KJV', unit: 'susanna', sourceRows: sourceCount(kjvSusanna, 1, 1, 64), activeRowsForUnit: activeSusanna }));
  units.push(classifyUnit({ translation: 'KJV', unit: 'bel_and_dragon', sourceRows: sourceCount(kjvBel, 1, 1, 42), activeRowsForUnit: activeBel }));

  units.push(classifyUnit({ translation: 'NABRE', unit: 'prayer_song', sourceRows: sourceCount(nabre, 3, 24, 90), activeRowsForUnit: activePrayerSong }));
  units.push(classifyUnit({ translation: 'NABRE', unit: 'susanna', sourceRows: sourceCount(nabre, 13, 1, 64), activeRowsForUnit: activeSusanna }));
  units.push(classifyUnit({ translation: 'NABRE', unit: 'bel_and_dragon', sourceRows: sourceCount(nabre, 14, 1, 42), activeRowsForUnit: activeBel }));
}

const activeLanePresentCount = units.filter((unit) => unit.status === 'active_lane_present_ready_for_exact_collation').length;
const activeLaneAbsentCount = units.filter((unit) => unit.status.includes('active_translation_lane_absent')).length;

const report = {
  audit: 'greek-daniel-kjv-nabre-addition-collation-status',
  status: failures.length ? 'failed' : activeLaneAbsentCount ? 'source_present_active_lanes_absent' : 'ready_for_exact_collation',
  bibleTextMutation: false,
  scope: 'Classify KJV and NABRE Greek Daniel addition source rows against active danielGK translation-lane presence. No text comparison and no mutation.',
  activePath,
  mappingPath,
  sourceRef: historicalRef,
  summary: {
    unitCount: units.length,
    activeLanePresentCount,
    activeLaneAbsentCount
  },
  units,
  conclusion: activeLaneAbsentCount
    ? 'KJV and NABRE addition sources are bound and address-mapped, but active danielGK remains string-only NRSV for these addition rows. Exact KJV/NABRE collation cannot run until active translation lanes are created or a display/schema policy allows lane expansion.'
    : 'All KJV/NABRE addition units have active lanes present and can proceed to exact collation.',
  blockedActions: activeLaneAbsentCount ? [
    'claim_kjv_greek_daniel_additions_active_text_verified',
    'claim_nabre_greek_daniel_additions_active_text_verified',
    'run_exact_kjv_nabre_text_collation_against_missing_active_lanes'
  ] : [],
  nextRequiredWork: activeLaneAbsentCount ? [
    'Decide whether active Greek Daniel should expand from string-only NRSV to multi-translation text objects for addition rows.',
    'If yes, create a bounded lane-expansion repair from bound KJV/NABRE source witnesses after schema/display policy.',
    'If no, record KJV/NABRE as source-present but inactive/not displayed for Greek Daniel additions.'
  ] : [
    'Run exact KJV/NABRE source collation against active lanes.'
  ],
  failures
};

if (reportPath) {
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Collation-status audit failed. Review failures.');
  process.exitCode = 1;
} else if (activeLaneAbsentCount) {
  console.log('ALL FAILED');
  console.log('NEXT: KJV/NABRE sources are bound and mapped, but active lanes are absent in danielGK. Decide lane expansion or inactive-lane policy before exact KJV/NABRE collation.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Run exact KJV/NABRE collation against active Greek Daniel addition lanes.');
}
