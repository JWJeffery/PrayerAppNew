#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();

const unresolvedMissingRows = [
  {
    id: 'acts_15_18',
    file: 'data/bible/NT/acts.json',
    chapter: 15,
    verse: 18,
    status: 'main_row_unresolved_drb_overlay_present',
    expectedOverlay: { translation: 'DRB', chapter: 15, verse: 18 },
  },
  {
    id: 'acts_23_26',
    file: 'data/bible/NT/acts.json',
    chapter: 23,
    verse: 26,
    status: 'main_row_unresolved_drb_overlay_present',
    expectedOverlay: { translation: 'DRB', chapter: 23, verse: 26 },
  },
  {
    id: 'james_1_8',
    file: 'data/bible/NT/james.json',
    chapter: 1,
    verse: 8,
    status: 'main_row_unresolved_drb_overlay_present',
    expectedOverlay: { translation: 'DRB', chapter: 1, verse: 8 },
  },
  {
    id: '2corinthians_13_14',
    file: 'data/bible/NT/2corinthians.json',
    chapter: 13,
    verse: 14,
    status: 'unresolved_kjv_versification_decision',
  },
];

const requiredDrbRows = [
  {
    id: 'hebrews_5_9_14_drb',
    file: 'data/bible/NT/hebrews.json',
    chapter: 5,
    verses: [9, 10, 11, 12, 13, 14],
    translation: 'DRB',
    status: 'repaired',
  },
  {
    id: '3john_1_1_14_drb',
    file: 'data/bible/NT/3john.json',
    chapter: 1,
    verses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    translation: 'DRB',
    status: 'repaired',
  },
];

const expectedIntentionalTranslationGaps = [
  {
    id: '3john_1_15_drb',
    file: 'data/bible/NT/3john.json',
    chapter: 1,
    verse: 15,
    translation: 'DRB',
    status: 'intentional_gap_pending_versification_overlay',
    reason: 'DRB raw lane contains 3 John 1:1-14 only; active 1:15 has no raw DRB source row.',
  },
];

function runGit(args) {
  const p = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return {
    status: p.status,
    stdout: (p.stdout || '').split(/\r?\n/).filter(Boolean),
    stderr: (p.stderr || '').split(/\r?\n/).filter(Boolean),
  };
}

function loadJson(relativePath) {
  const full = path.join(root, relativePath);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function asInt(value) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function chapterNumber(chapter, fallbackIndex = null) {
  if (chapter && typeof chapter === 'object') {
    for (const key of ['num', 'number', 'chapter', 'chapterNum']) {
      if (Object.prototype.hasOwnProperty.call(chapter, key)) {
        const n = asInt(chapter[key]);
        if (n !== null) return n;
      }
    }
  }
  return fallbackIndex === null ? null : fallbackIndex + 1;
}

function verseNumber(verse, fallbackIndex = null) {
  if (verse && typeof verse === 'object') {
    for (const key of ['num', 'number', 'verse', 'verseNum']) {
      if (Object.prototype.hasOwnProperty.call(verse, key)) {
        const n = asInt(verse[key]);
        if (n !== null) return n;
      }
    }
  }
  return fallbackIndex === null ? null : fallbackIndex + 1;
}

function activeVerseMap(data) {
  const out = new Map();
  if (!data || typeof data !== 'object' || !Array.isArray(data.chapters)) return out;

  data.chapters.forEach((chapter, ci) => {
    const cnum = chapterNumber(chapter, ci);
    if (!chapter || typeof chapter !== 'object' || !Array.isArray(chapter.verses)) return;

    chapter.verses.forEach((verse, vi) => {
      const vnum = verseNumber(verse, vi);
      if (cnum !== null && vnum !== null) out.set(`${cnum}:${vnum}`, verse);
    });
  });

  return out;
}

function getTranslationText(verse, translation) {
  if (!verse || typeof verse !== 'object') return null;
  const text = verse.text;
  if (!text || typeof text !== 'object' || Array.isArray(text)) return null;
  const value = text[translation];
  return typeof value === 'string' ? value : null;
}

function getOverlayText(data, translation, chapter, verse) {
  if (!data || typeof data !== 'object') return null;
  const overlays = data.translationOverlays;
  if (!overlays || typeof overlays !== 'object') return null;
  const translationOverlay = overlays[translation];
  if (!translationOverlay || typeof translationOverlay !== 'object') return null;
  const chapterOverlay = translationOverlay[String(chapter)];
  if (!chapterOverlay || typeof chapterOverlay !== 'object') return null;
  const value = chapterOverlay[String(verse)];
  return typeof value === 'string' ? value : null;
}

const failures = [];
const findings = {
  unresolvedMissingRows: [],
  repairedDrbRows: [],
  intentionalTranslationGaps: [],
};

for (const target of unresolvedMissingRows) {
  let data;
  let verse = null;
  let overlayText = null;
  try {
    data = loadJson(target.file);
    verse = activeVerseMap(data).get(`${target.chapter}:${target.verse}`) || null;
    if (target.expectedOverlay) {
      overlayText = getOverlayText(data, target.expectedOverlay.translation, target.expectedOverlay.chapter, target.expectedOverlay.verse);
    }
  } catch (error) {
    failures.push({ type: 'parse-or-load-error', target: target.id, file: target.file, error: String(error.message || error) });
    continue;
  }

  const found = verse !== null;
  findings.unresolvedMissingRows.push({
    ...target,
    active_row_present: found,
    expected_overlay_present: target.expectedOverlay ? Boolean(overlayText && overlayText.trim()) : null,
    expected_overlay_sample: overlayText ? overlayText.slice(0, 120) : '',
  });

  if (found) {
    failures.push({
      type: 'unexpectedly-resolved-main-row-without-ledger-update',
      target: target.id,
      file: target.file,
      chapter: target.chapter,
      verse: target.verse,
      message: 'This named defect now has an active main row; update this audit and remediation ledger deliberately.',
    });
  }

  if (target.expectedOverlay && !(overlayText && overlayText.trim())) {
    failures.push({
      type: 'missing-expected-translation-overlay',
      target: target.id,
      file: target.file,
      translation: target.expectedOverlay.translation,
      chapter: target.expectedOverlay.chapter,
      verse: target.expectedOverlay.verse,
    });
  }
}

for (const group of requiredDrbRows) {
  let map;
  try {
    const data = loadJson(group.file);
    map = activeVerseMap(data);
  } catch (error) {
    failures.push({ type: 'parse-or-load-error', target: group.id, file: group.file, error: String(error.message || error) });
    continue;
  }

  for (const verseNum of group.verses) {
    const verse = map.get(`${group.chapter}:${verseNum}`) || null;
    const text = getTranslationText(verse, group.translation);
    const ok = typeof text === 'string' && text.trim().length > 0;

    findings.repairedDrbRows.push({
      id: group.id,
      file: group.file,
      chapter: group.chapter,
      verse: verseNum,
      translation: group.translation,
      present: ok,
      sample: ok ? text.slice(0, 120) : '',
    });

    if (!ok) {
      failures.push({
        type: 'missing-repaired-drb-row',
        target: group.id,
        file: group.file,
        chapter: group.chapter,
        verse: verseNum,
        translation: group.translation,
      });
    }
  }
}

for (const gap of expectedIntentionalTranslationGaps) {
  let text = null;
  let rowPresent = false;
  try {
    const data = loadJson(gap.file);
    const verse = activeVerseMap(data).get(`${gap.chapter}:${gap.verse}`) || null;
    rowPresent = verse !== null;
    text = getTranslationText(verse, gap.translation);
  } catch (error) {
    failures.push({ type: 'parse-or-load-error', target: gap.id, file: gap.file, error: String(error.message || error) });
    continue;
  }

  const translationPresent = typeof text === 'string' && text.trim().length > 0;
  findings.intentionalTranslationGaps.push({
    ...gap,
    active_row_present: rowPresent,
    translation_present: translationPresent,
  });

  if (!rowPresent) {
    failures.push({
      type: 'expected-active-row-missing',
      target: gap.id,
      file: gap.file,
      chapter: gap.chapter,
      verse: gap.verse,
    });
  }

  if (translationPresent) {
    failures.push({
      type: 'unexpectedly-populated-intentional-gap',
      target: gap.id,
      file: gap.file,
      chapter: gap.chapter,
      verse: gap.verse,
      translation: gap.translation,
      message: 'This gap was populated; update this audit and ledger deliberately with source/versification evidence.',
    });
  }
}

const protectedStatus = runGit([
  'status',
  '--short',
  '--untracked-files=all',
  '--',
  'data/bible/translations/vulgate-clementine',
  'data/bible/translations/vulgate-psalter',
  'scripts/import-roman-breviary-1960-catholicbible-vulgate-pilot.mjs',
]);

const report = {
  audit: 'canonical-nt-named-defects',
  status: failures.length ? 'failed' : 'passed',
  note: 'This audit tracks resolved and intentionally unresolved named NT defects. Passing does not mean the remaining source/versification defects are repaired.',
  findings,
  failures,
  protectedVulgateStatusLineCount: protectedStatus.stdout.length,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review named NT defect state; update data, audit, and ledger deliberately.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Named NT defect state is guarded; only 2 Corinthians 13:14 remains a KJV source/versification decision.');
}
