#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const reportPath = process.env.GREEK_DANIEL_BOUND_ADDITION_SHAPES_REPORT || null;
const failures = [];

const activePath = 'data/bible/OT/danielGK.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/daniel.json';
const historicalRef = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';

const historicalPaths = {
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Daniel.json',
  KJV_DANIEL: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Daniel.json',
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

function countRows(book) {
  if (!book?.chapters) return 0;
  return book.chapters.reduce((sum, chapter) => sum + (Array.isArray(chapter?.verses) ? chapter.verses.length : 0), 0);
}

function firstLast(rows) {
  return {
    count: rows.length,
    first: rows[0] ? { num: rows[0].num ?? rows[0].verse ?? null, preview: String(rows[0].text ?? '').slice(0, 120) } : null,
    last: rows.at(-1) ? { num: rows.at(-1).num ?? rows.at(-1).verse ?? null, preview: String(rows.at(-1).text ?? '').slice(0, 120) } : null
  };
}

const active = readJson(activePath);
const drb = readJson(drbPath);
const nabre = readHistoricalJson(historicalRef, historicalPaths.NABRE);
const kjvDaniel = readHistoricalJson(historicalRef, historicalPaths.KJV_DANIEL);
const kjvPrayer = readHistoricalJson(historicalRef, historicalPaths.KJV_PRAYER);
const kjvSusanna = readHistoricalJson(historicalRef, historicalPaths.KJV_SUSANNA);
const kjvBel = readHistoricalJson(historicalRef, historicalPaths.KJV_BEL);

const activeDaniel3 = rowsInChapter(active, 3);
const activePrayerSong = activeDaniel3.filter((row) => Number(row?.num ?? row?.verse) >= 24 && Number(row?.num ?? row?.verse) <= 90);
const activeDaniel3PostInsertion = activeDaniel3.filter((row) => Number(row?.num ?? row?.verse) >= 91 && Number(row?.num ?? row?.verse) <= 97);
const activeSusanna = rowsInChapter(active, 13);
const activeBel = rowsInChapter(active, 14);

const report = {
  audit: 'greek-daniel-bound-addition-source-shapes',
  status: failures.length ? 'failed' : 'passed',
  bibleTextMutation: false,
  scope: 'Count and locate bound DRB/NABRE/KJV Daniel addition source shapes against active Greek Daniel addition placements. No text comparison or mutation.',
  active: {
    path: activePath,
    totalRows: countRows(active),
    prayerSongPlacement: {
      chapter: 3,
      verseRange: '24-90',
      ...firstLast(activePrayerSong)
    },
    ordinaryDanielPostInsertionPlacement: {
      chapter: 3,
      verseRange: '91-97',
      ...firstLast(activeDaniel3PostInsertion)
    },
    susannaPlacement: {
      chapter: 13,
      ...firstLast(activeSusanna)
    },
    belAndDragonPlacement: {
      chapter: 14,
      ...firstLast(activeBel)
    }
  },
  DRB: {
    sourceRef: 'main/current',
    path: drbPath,
    totalRows: countRows(drb),
    chapter3: firstLast(rowsInChapter(drb, 3)),
    chapter13: firstLast(rowsInChapter(drb, 13)),
    chapter14: firstLast(rowsInChapter(drb, 14))
  },
  NABRE: {
    sourceRef: historicalRef,
    path: historicalPaths.NABRE,
    totalRows: countRows(nabre),
    chapter3: firstLast(rowsInChapter(nabre, 3)),
    chapter13: firstLast(rowsInChapter(nabre, 13)),
    chapter14: firstLast(rowsInChapter(nabre, 14))
  },
  KJV: {
    sourceRef: historicalRef,
    sources: {
      ordinaryDaniel: {
        path: historicalPaths.KJV_DANIEL,
        totalRows: countRows(kjvDaniel),
        chapter3: firstLast(rowsInChapter(kjvDaniel, 3))
      },
      prayerOfAzariah: {
        path: historicalPaths.KJV_PRAYER,
        totalRows: countRows(kjvPrayer),
        chapter1: firstLast(rowsInChapter(kjvPrayer, 1))
      },
      susanna: {
        path: historicalPaths.KJV_SUSANNA,
        totalRows: countRows(kjvSusanna),
        chapter1: firstLast(rowsInChapter(kjvSusanna, 1))
      },
      belAndDragon: {
        path: historicalPaths.KJV_BEL,
        totalRows: countRows(kjvBel),
        chapter1: firstLast(rowsInChapter(kjvBel, 1))
      }
    }
  },
  expectedNextClassification: [
    'active_prayer_song_rows_can_be_compared_to_bound_sources_after_source_address_policy',
    'active_susanna_rows_can_be_compared_to_bound_sources_after_source_address_policy',
    'active_bel_and_dragon_rows_can_be_compared_to_bound_sources_after_source_address_policy'
  ],
  failures
};

if (reportPath) {
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Source-shape inventory failed. Review failures before mapping additions.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record source-shape inventory and define address mapping for DRB/NABRE/KJV Daniel additions.');
}
