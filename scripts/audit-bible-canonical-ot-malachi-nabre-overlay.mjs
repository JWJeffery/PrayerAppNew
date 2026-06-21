#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const activePath = path.join(root, 'data/bible/OT/malachi.json');
const sourceCommit = "d0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6";
const sourcePath = "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Malachi.json";
const expectedMap = [
  {
    "sourceChapter": 3,
    "sourceVerse": 19,
    "activeChapter": 4,
    "activeVerse": 1
  },
  {
    "sourceChapter": 3,
    "sourceVerse": 20,
    "activeChapter": 4,
    "activeVerse": 2
  },
  {
    "sourceChapter": 3,
    "sourceVerse": 21,
    "activeChapter": 4,
    "activeVerse": 3
  },
  {
    "sourceChapter": 3,
    "sourceVerse": 22,
    "activeChapter": 4,
    "activeVerse": 4
  },
  {
    "sourceChapter": 3,
    "sourceVerse": 23,
    "activeChapter": 4,
    "activeVerse": 5
  },
  {
    "sourceChapter": 3,
    "sourceVerse": 24,
    "activeChapter": 4,
    "activeVerse": 6
  }
];

function runGit(args) {
  const p = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return {
    status: p.status,
    stdout: p.stdout || '',
    stderr: p.stderr || '',
  };
}

function asInt(value) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function chapterNumber(chapter, fallbackIndex = null) {
  if (chapter && typeof chapter === 'object') {
    for (const key of ['num', 'number', 'chapter', 'chapterNum', 'chapter_number']) {
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
    for (const key of ['num', 'number', 'verse', 'verseNum', 'verse_number', 'v']) {
      if (Object.prototype.hasOwnProperty.call(verse, key)) {
        const n = asInt(verse[key]);
        if (n !== null) return n;
      }
    }
  }
  return fallbackIndex === null ? null : fallbackIndex + 1;
}

function textFromNode(node) {
  if (typeof node === 'string') return node;
  if (!node || typeof node !== 'object') return null;

  const text = node.text;
  if (typeof text === 'string') return text;
  if (text && typeof text === 'object' && !Array.isArray(text)) {
    for (const key of ['NABRE', 'nabre', 'text', 'value']) {
      if (typeof text[key] === 'string') return text[key];
    }
  }

  for (const key of ['content', 'value', 'verse_text']) {
    if (typeof node[key] === 'string') return node[key];
  }

  return null;
}

function verseMap(data) {
  const out = new Map();
  const chapters = data && typeof data === 'object' ? data.chapters : null;

  if (Array.isArray(chapters)) {
    chapters.forEach((chapter, ci) => {
      const c = chapterNumber(chapter, ci);
      const verses = chapter && typeof chapter === 'object' ? chapter.verses : null;

      if (Array.isArray(verses)) {
        verses.forEach((verse, vi) => {
          const v = verseNumber(verse, vi);
          if (c !== null && v !== null) out.set(`${c}:${v}`, verse);
        });
      } else if (verses && typeof verses === 'object') {
        for (const [vk, verse] of Object.entries(verses)) {
          const v = asInt(vk) ?? verseNumber(verse);
          if (c !== null && v !== null) out.set(`${c}:${v}`, verse);
        }
      }
    });
  } else if (chapters && typeof chapters === 'object') {
    for (const [ck, chapter] of Object.entries(chapters)) {
      const c = asInt(ck) ?? chapterNumber(chapter);
      const verses = chapter && typeof chapter === 'object' ? chapter.verses : null;

      if (verses && typeof verses === 'object' && !Array.isArray(verses)) {
        for (const [vk, verse] of Object.entries(verses)) {
          const v = asInt(vk) ?? verseNumber(verse);
          if (c !== null && v !== null) out.set(`${c}:${v}`, verse);
        }
      } else if (Array.isArray(verses)) {
        verses.forEach((verse, vi) => {
          const v = verseNumber(verse, vi);
          if (c !== null && v !== null) out.set(`${c}:${v}`, verse);
        });
      }
    }
  }

  return out;
}

function activeTranslationText(node, translation) {
  const text = node && typeof node === 'object' ? node.text : null;
  if (!text || typeof text !== 'object' || Array.isArray(text)) return null;
  return typeof text[translation] === 'string' ? text[translation] : null;
}

function overlayText(data, translation, chapter, verse) {
  const overlays = data && typeof data === 'object' ? data.translationOverlays : null;
  const t = overlays && typeof overlays === 'object' ? overlays[translation] : null;
  const c = t && typeof t === 'object' ? t[String(chapter)] : null;
  const value = c && typeof c === 'object' ? c[String(verse)] : null;
  return typeof value === 'string' ? value : null;
}

const failures = [];
const findings = [];

let active;
try {
  active = JSON.parse(fs.readFileSync(activePath, 'utf8'));
} catch (error) {
  failures.push({ type: 'active-parse-error', file: activePath, error: String(error.message || error) });
}

const sourceProc = runGit(['show', `${sourceCommit}:${sourcePath}`]);
let source = null;
if (sourceProc.status !== 0) {
  failures.push({ type: 'source-blob-unavailable', sourceCommit, sourcePath, stderr: sourceProc.stderr });
} else {
  try {
    source = JSON.parse(sourceProc.stdout);
  } catch (error) {
    failures.push({ type: 'source-parse-error', sourceCommit, sourcePath, error: String(error.message || error) });
  }
}

const activeRows = active ? verseMap(active) : new Map();
const sourceRows = source ? verseMap(source) : new Map();

for (const item of expectedMap) {
  const sourceNode = sourceRows.get(`${item.sourceChapter}:${item.sourceVerse}`) || null;
  const sourceText = textFromNode(sourceNode);
  const activeNode = activeRows.get(`${item.activeChapter}:${item.activeVerse}`) || null;
  const absentMainSourceRow = !activeRows.has(`${item.sourceChapter}:${item.sourceVerse}`);
  const mainNabre = activeTranslationText(activeNode, 'NABRE');
  const overlay = active ? overlayText(active, 'NABRE', item.activeChapter, item.activeVerse) : null;

  const finding = {
    source: `${item.sourceChapter}:${item.sourceVerse}`,
    active: `${item.activeChapter}:${item.activeVerse}`,
    source_present: typeof sourceText === 'string' && sourceText.trim().length > 0,
    active_row_present: activeNode !== null,
    active_source_row_absent: absentMainSourceRow,
    main_nabre_present: typeof mainNabre === 'string' && mainNabre.trim().length > 0,
    overlay_present: typeof overlay === 'string' && overlay.trim().length > 0,
    overlay_matches_source: typeof sourceText === 'string' && overlay === sourceText,
    overlay_sample: typeof overlay === 'string' ? overlay.slice(0, 180) : '',
  };

  findings.push(finding);

  if (!finding.source_present) failures.push({ type: 'missing-source-row', source: finding.source });
  if (!finding.active_row_present) failures.push({ type: 'missing-active-target-row', active: finding.active });
  if (!finding.active_source_row_absent) failures.push({ type: 'unexpected-active-source-row-present', source: finding.source });
  if (finding.main_nabre_present) failures.push({ type: 'unexpected-main-row-nabre-insertion', active: finding.active });
  if (!finding.overlay_present) failures.push({ type: 'missing-overlay', active: finding.active });
  if (!finding.overlay_matches_source) failures.push({ type: 'overlay-source-mismatch', source: finding.source, active: finding.active });
}

const report = {
  audit: 'canonical-ot-malachi-nabre-overlay',
  status: failures.length ? 'failed' : 'passed',
  note: 'Passing means Malachi NABRE 3:19-24 is represented as active 4:1-6 translation overlays, without active main-row insertion.',
  sourceCommit,
  sourcePath,
  findings,
  failures,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review Malachi NABRE overlay failures. Do not claim OT trust.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Malachi NABRE overlay is guarded; canonical OT remains untrusted pending remaining missing-row and versification work.');
}
