#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const sourceCommit = "d0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6";
const mappings = [
  {
    "book": "1chronicles",
    "activePath": "data/bible/OT/1chronicles.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/1Chronicles.json",
    "source": "6:64",
    "active": "6:73"
  },
  {
    "book": "1chronicles",
    "activePath": "data/bible/OT/1chronicles.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/1Chronicles.json",
    "source": "6:66",
    "active": "6:75"
  },
  {
    "book": "nehemiah",
    "activePath": "data/bible/OT/nehemiah.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Nehemiah.json",
    "source": "4:13",
    "active": "4:19"
  },
  {
    "book": "nehemiah",
    "activePath": "data/bible/OT/nehemiah.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Nehemiah.json",
    "source": "4:14",
    "active": "4:20"
  }
];

function git(args) {
  const p = spawnSync('git', args, { encoding: 'utf8' });
  return { status: p.status, stdout: p.stdout || '', stderr: p.stderr || '' };
}

function parseRef(ref) {
  const [chapter, verse] = ref.split(':').map((x) => Number.parseInt(x, 10));
  return { chapter, verse };
}

function asInt(v) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

function chapterNumber(ch, i) {
  for (const k of ['num', 'number', 'chapter', 'chapterNum', 'chapter_number']) {
    if (ch && typeof ch === 'object' && Object.prototype.hasOwnProperty.call(ch, k)) {
      const n = asInt(ch[k]);
      if (n !== null) return n;
    }
  }
  return i + 1;
}

function verseNumber(vs, i) {
  for (const k of ['num', 'number', 'verse', 'verseNum', 'verse_number', 'v']) {
    if (vs && typeof vs === 'object' && Object.prototype.hasOwnProperty.call(vs, k)) {
      const n = asInt(vs[k]);
      if (n !== null) return n;
    }
  }
  return i + 1;
}

function verseMap(data) {
  const out = new Map();
  const chapters = data && data.chapters;
  if (Array.isArray(chapters)) {
    chapters.forEach((ch, ci) => {
      const c = chapterNumber(ch, ci);
      const verses = ch && ch.verses;
      if (Array.isArray(verses)) {
        verses.forEach((vs, vi) => out.set(`${c}:${verseNumber(vs, vi)}`, vs));
      }
    });
  }
  return out;
}

function textDict(node) {
  return node && node.text && typeof node.text === 'object' && !Array.isArray(node.text) ? node.text : {};
}

function nodeText(node) {
  if (typeof node === 'string') return node;
  if (!node || typeof node !== 'object') return '';
  if (typeof node.text === 'string') return node.text;
  if (node.text && typeof node.text === 'object') {
    for (const k of ['NABRE', 'nabre', 'text', 'value']) {
      if (typeof node.text[k] === 'string') return node.text[k];
    }
  }
  for (const k of ['content', 'value', 'verse_text']) {
    if (typeof node[k] === 'string') return node[k];
  }
  return '';
}

function overlayText(data, c, v) {
  const value = data?.translationOverlays?.NABRE?.[String(c)]?.[String(v)];
  return typeof value === 'string' ? value : '';
}

const failures = [];
const findings = [];

for (const item of mappings) {
  const active = JSON.parse(fs.readFileSync(item.activePath, 'utf8'));
  const sourceBlob = git(['show', `${sourceCommit}:${item.sourcePath}`]);

  if (sourceBlob.status !== 0) {
    failures.push({ type: 'source-unavailable', item });
    continue;
  }

  const source = JSON.parse(sourceBlob.stdout);
  const activeRows = verseMap(active);
  const sourceRows = verseMap(source);
  const sref = parseRef(item.source);
  const aref = parseRef(item.active);
  const sourceText = nodeText(sourceRows.get(`${sref.chapter}:${sref.verse}`));
  const activeNode = activeRows.get(`${aref.chapter}:${aref.verse}`);
  const main = textDict(activeNode).NABRE;
  const overlay = overlayText(active, aref.chapter, aref.verse);

  const finding = {
    book: item.book,
    source: item.source,
    active: item.active,
    source_present: !!sourceText.trim(),
    active_row_present: !!activeNode,
    main_nabre_present: typeof main === 'string' && !!main.trim(),
    overlay_present: !!overlay.trim(),
    overlay_matches_source: overlay === sourceText
  };

  findings.push(finding);

  if (!finding.source_present) failures.push({ type: 'missing-source', item });
  if (!finding.active_row_present) failures.push({ type: 'missing-active-target', item });
  if (finding.main_nabre_present) failures.push({ type: 'unexpected-main-nabre-insertion', item });
  if (!finding.overlay_present) failures.push({ type: 'missing-overlay', item });
  if (!finding.overlay_matches_source) failures.push({ type: 'overlay-source-mismatch', item });
}

const report = {
  audit: 'canonical-ot-historical-nabre-strong-overlays',
  status: failures.length ? 'failed' : 'passed',
  sourceCommit,
  mappingCount: mappings.length,
  failures,
  findings
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review historical NABRE overlay failures. Do not claim OT trust.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Historical NABRE strong overlay batch is guarded; canonical OT remains untrusted pending remaining missing-row and versification work.');
}
