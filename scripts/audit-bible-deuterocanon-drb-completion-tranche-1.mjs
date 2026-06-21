#!/usr/bin/env node
import fs from 'node:fs';

const targets = [
  {
    "key": "judith",
    "activePath": "data/bible/OT/judith.json",
    "drbPath": "data/bible/translations/drb-original-douay-rheims/raw/judith.json",
    "options": {}
  },
  {
    "key": "wisdom",
    "activePath": "data/bible/OT/wisdom.json",
    "drbPath": "data/bible/translations/drb-original-douay-rheims/raw/wisdom.json",
    "options": {}
  },
  {
    "key": "baruch",
    "activePath": "data/bible/OT/baruch.json",
    "drbPath": "data/bible/translations/drb-original-douay-rheims/raw/baruch.json",
    "options": {
      "maxChapter": 5
    }
  },
  {
    "key": "1maccabees",
    "activePath": "data/bible/OT/1maccabees.json",
    "drbPath": "data/bible/translations/drb-original-douay-rheims/raw/1-machabees.json",
    "options": {}
  },
  {
    "key": "2maccabees",
    "activePath": "data/bible/OT/2maccabees.json",
    "drbPath": "data/bible/translations/drb-original-douay-rheims/raw/2-machabees.json",
    "options": {}
  },
  {
    "key": "prayerofmanasseh",
    "activePath": "data/bible/OT/prayerofmanasseh.json",
    "drbPath": "data/bible/translations/drb-original-douay-rheims/raw/prayer-of-manasseh.json",
    "options": {}
  },
  {
    "key": "1esdras",
    "activePath": "data/bible/OT/1esdras.json",
    "drbPath": "data/bible/translations/drb-original-douay-rheims/raw/3-esdras.json",
    "options": {}
  },
  {
    "key": "2esdras",
    "activePath": "data/bible/OT/2esdras.json",
    "drbPath": "data/bible/translations/drb-original-douay-rheims/raw/4-esdras.json",
    "options": {}
  }
];

function asInt(v) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
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
    for (const key of ['DRB', 'rawText', 'text', 'value', 'KJV', 'NRSV', 'NABRE']) {
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
    const c = chapterNumber(ch, ci);
    if (options.maxChapter && c > options.maxChapter) return;
    if (options.minChapter && c < options.minChapter) return;

    const verses = ch?.verses;
    if (Array.isArray(verses)) {
      verses.forEach((v, vi) => {
        const n = verseNumber(v, vi);
        out.push({ chapter: c, verse: n, ref: `${c}:${n}`, row: v, text: textOf(v) });
      });
    } else if (verses && typeof verses === 'object') {
      for (const [vn, v] of Object.entries(verses)) {
        const n = asInt(vn);
        if (n !== null) out.push({ chapter: c, verse: n, ref: `${c}:${n}`, row: v, text: textOf(v) });
      }
    }
  });

  return out;
}

function activeDrbMap(data) {
  const map = new Map();
  for (const r of rows(data)) {
    const text = r.row?.text;
    if (text && typeof text === 'object' && typeof text.DRB === 'string' && text.DRB.trim()) {
      map.set(r.ref, text.DRB);
    }
  }
  return map;
}

const failures = [];
const findings = [];

for (const target of targets) {
  const active = readJson(target.activePath);
  const drb = readJson(target.drbPath);

  const sourceRows = rows(drb, target.options).filter(x => x.text && x.text.trim());
  const sourceMap = new Map(sourceRows.map(x => [x.ref, x.text]));
  const activeMap = activeDrbMap(active);

  const missing = [];
  const mismatched = [];

  for (const [ref, sourceText] of sourceMap.entries()) {
    const activeText = activeMap.get(ref);
    if (!activeText) missing.push(ref);
    else if (activeText !== sourceText) mismatched.push(ref);
  }

  const finding = {
    key: target.key,
    activePath: target.activePath,
    drbPath: target.drbPath,
    sourceRows: sourceMap.size,
    activeDrbRows: activeMap.size,
    missingCount: missing.length,
    mismatchCount: mismatched.length,
    missingSamples: missing.slice(0, 12),
    mismatchSamples: mismatched.slice(0, 12)
  };

  findings.push(finding);

  if (missing.length) failures.push({ type: 'missing-drb-rows', key: target.key, count: missing.length, samples: missing.slice(0, 12) });
  if (mismatched.length) failures.push({ type: 'drb-text-mismatch', key: target.key, count: mismatched.length, samples: mismatched.slice(0, 12) });
}

const report = {
  audit: 'deuterocanon-drb-completion-tranche-1',
  status: failures.length ? 'failed' : 'passed',
  findings,
  failures
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review deuterocanon DRB completion tranche 1 failures.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Deuterocanon DRB completion tranche 1 is guarded.');
}
