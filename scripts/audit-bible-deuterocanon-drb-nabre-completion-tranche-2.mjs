#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const sourceCommit = "d0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6";
const targets = [
  {
    "key": "tobit",
    "activePath": "data/bible/OT/tobit.json",
    "drbPath": "data/bible/translations/drb-original-douay-rheims/raw/tobias.json",
    "nabrePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Tobit.json",
    "drbOptions": {
      "minChapter": 1
    },
    "nabreOptions": {}
  },
  {
    "key": "sirach",
    "activePath": "data/bible/OT/sirach.json",
    "drbPath": "data/bible/translations/drb-original-douay-rheims/raw/ecclesiasticus.json",
    "nabrePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Sirach.json",
    "drbOptions": {},
    "nabreOptions": {}
  },
  {
    "key": "letterofjeremiah",
    "activePath": "data/bible/OT/letterofjeremiah.json",
    "drbPath": "data/bible/translations/drb-original-douay-rheims/raw/baruch.json",
    "nabrePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Baruch.json",
    "drbOptions": {
      "sourceChapter": 6,
      "targetChapter": 1
    },
    "nabreOptions": {
      "sourceChapter": 6,
      "targetChapter": 1
    }
  }
];

function git(args) {
  const p = spawnSync('git', args, { encoding: 'utf8' });
  return { status: p.status, stdout: p.stdout || '', stderr: p.stderr || '' };
}

function asInt(v) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function readHistorical(path) {
  const blob = git(['show', `${sourceCommit}:${path}`]);
  if (blob.status !== 0) throw new Error(`missing historical source ${path}`);
  return JSON.parse(blob.stdout);
}

function chapterNumber(ch, i) {
  for (const k of ['number', 'num', 'chapter', 'chapterNum', 'chapter_number']) {
    if (ch && typeof ch === 'object' && Object.prototype.hasOwnProperty.call(ch, k)) {
      const n = asInt(ch[k]);
      if (n !== null) return n;
    }
  }
  return i + 1;
}

function verseNumber(vs, i) {
  for (const k of ['number', 'num', 'verse', 'verseNum', 'verse_number', 'v']) {
    if (vs && typeof vs === 'object' && Object.prototype.hasOwnProperty.call(vs, k)) {
      const n = asInt(vs[k]);
      if (n !== null) return n;
    }
  }
  return i + 1;
}

function textOf(row) {
  if (typeof row === 'string') return row;
  if (!row || typeof row !== 'object') return '';
  if (typeof row.text === 'string') return row.text;
  if (row.text && typeof row.text === 'object' && !Array.isArray(row.text)) {
    for (const key of ['DRB', 'NABRE', 'rawText', 'text', 'value', 'KJV', 'NRSV']) {
      if (typeof row.text[key] === 'string') return row.text[key];
    }
  }
  for (const key of ['content', 'value', 'verse_text']) {
    if (typeof row[key] === 'string') return row[key];
  }
  return '';
}

function rows(data, options = {}) {
  const out = [];
  if (!Array.isArray(data?.chapters)) return out;

  data.chapters.forEach((ch, ci) => {
    const sourceChapter = chapterNumber(ch, ci);
    if (options.sourceChapter && sourceChapter !== options.sourceChapter) return;
    if (options.minChapter && sourceChapter < options.minChapter) return;
    if (options.maxChapter && sourceChapter > options.maxChapter) return;

    const targetChapter = options.targetChapter || sourceChapter;
    const verses = ch?.verses;

    if (Array.isArray(verses)) {
      verses.forEach((v, vi) => {
        const n = verseNumber(v, vi);
        out.push({ sourceRef: `${sourceChapter}:${n}`, ref: `${targetChapter}:${n}`, row: v, text: textOf(v) });
      });
    } else if (verses && typeof verses === 'object') {
      for (const [vn, v] of Object.entries(verses)) {
        const n = asInt(vn);
        if (n !== null) out.push({ sourceRef: `${sourceChapter}:${n}`, ref: `${targetChapter}:${n}`, row: v, text: textOf(v) });
      }
    }
  });

  return out;
}

function activeLaneMap(data, lane) {
  const map = new Map();
  for (const r of rows(data)) {
    const text = r.row?.text;
    if (text && typeof text === 'object' && typeof text[lane] === 'string' && text[lane].trim()) {
      map.set(r.ref, text[lane]);
    }
  }
  return map;
}

const failures = [];
const findings = [];

for (const target of targets) {
  const active = readJson(target.activePath);
  const drb = readJson(target.drbPath);
  const nabre = readHistorical(target.nabrePath);

  const drbSource = new Map(rows(drb, target.drbOptions).filter(x => x.text && x.text.trim()).map(x => [x.ref, x.text]));
  const nabreSource = new Map(rows(nabre, target.nabreOptions).filter(x => x.text && x.text.trim()).map(x => [x.ref, x.text]));
  const activeDrb = activeLaneMap(active, 'DRB');
  const activeNabre = activeLaneMap(active, 'NABRE');

  const missingDrb = [];
  const mismatchDrb = [];
  const missingNabre = [];
  const mismatchNabre = [];

  for (const [ref, sourceText] of drbSource.entries()) {
    const activeText = activeDrb.get(ref);
    if (!activeText) missingDrb.push(ref);
    else if (activeText !== sourceText) mismatchDrb.push(ref);
  }

  for (const [ref, sourceText] of nabreSource.entries()) {
    const activeText = activeNabre.get(ref);
    if (!activeText) missingNabre.push(ref);
    else if (activeText !== sourceText) mismatchNabre.push(ref);
  }

  const finding = {
    key: target.key,
    drbSourceRows: drbSource.size,
    activeDrbRows: activeDrb.size,
    nabreSourceRows: nabreSource.size,
    activeNabreRows: activeNabre.size,
    missingDrbCount: missingDrb.length,
    mismatchDrbCount: mismatchDrb.length,
    missingNabreCount: missingNabre.length,
    mismatchNabreCount: mismatchNabre.length,
    missingDrbSamples: missingDrb.slice(0, 12),
    mismatchDrbSamples: mismatchDrb.slice(0, 12),
    missingNabreSamples: missingNabre.slice(0, 12),
    mismatchNabreSamples: mismatchNabre.slice(0, 12)
  };

  findings.push(finding);

  if (missingDrb.length) failures.push({ type: 'missing-drb-rows', key: target.key, count: missingDrb.length, samples: missingDrb.slice(0, 12) });
  if (mismatchDrb.length) failures.push({ type: 'drb-text-mismatch', key: target.key, count: mismatchDrb.length, samples: mismatchDrb.slice(0, 12) });
  if (missingNabre.length) failures.push({ type: 'missing-nabre-rows', key: target.key, count: missingNabre.length, samples: missingNabre.slice(0, 12) });
  if (mismatchNabre.length) failures.push({ type: 'nabre-text-mismatch', key: target.key, count: mismatchNabre.length, samples: mismatchNabre.slice(0, 12) });
}

const report = {
  audit: 'deuterocanon-drb-nabre-completion-tranche-2',
  status: failures.length ? 'failed' : 'passed',
  findings,
  failures
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review deuterocanon DRB/NABRE tranche 2 failures.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Deuterocanon DRB/NABRE tranche 2 is guarded.');
}
