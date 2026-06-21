#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const sourceCommit = "d0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6";
const mappings = [
  {
    "book": "genesis",
    "activePath": "data/bible/OT/genesis.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Genesis.json",
    "source": "32:1",
    "active": "31:55"
  },
  {
    "book": "exodus",
    "activePath": "data/bible/OT/exodus.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Exodus.json",
    "source": "8:25",
    "active": "8:29"
  },
  {
    "book": "exodus",
    "activePath": "data/bible/OT/exodus.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Exodus.json",
    "source": "8:26",
    "active": "8:30"
  },
  {
    "book": "exodus",
    "activePath": "data/bible/OT/exodus.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Exodus.json",
    "source": "8:27",
    "active": "8:31"
  },
  {
    "book": "exodus",
    "activePath": "data/bible/OT/exodus.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Exodus.json",
    "source": "8:28",
    "active": "8:32"
  },
  {
    "book": "exodus",
    "activePath": "data/bible/OT/exodus.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Exodus.json",
    "source": "22:30",
    "active": "22:31"
  },
  {
    "book": "leviticus",
    "activePath": "data/bible/OT/leviticus.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Leviticus.json",
    "source": "6:17",
    "active": "6:24"
  },
  {
    "book": "leviticus",
    "activePath": "data/bible/OT/leviticus.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Leviticus.json",
    "source": "6:18",
    "active": "6:25"
  },
  {
    "book": "leviticus",
    "activePath": "data/bible/OT/leviticus.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Leviticus.json",
    "source": "6:19",
    "active": "6:26"
  },
  {
    "book": "leviticus",
    "activePath": "data/bible/OT/leviticus.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Leviticus.json",
    "source": "6:20",
    "active": "6:27"
  },
  {
    "book": "leviticus",
    "activePath": "data/bible/OT/leviticus.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Leviticus.json",
    "source": "6:21",
    "active": "6:28"
  },
  {
    "book": "leviticus",
    "activePath": "data/bible/OT/leviticus.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Leviticus.json",
    "source": "6:22",
    "active": "6:29"
  },
  {
    "book": "leviticus",
    "activePath": "data/bible/OT/leviticus.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Leviticus.json",
    "source": "6:23",
    "active": "6:30"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:1",
    "active": "16:36"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:2",
    "active": "16:37"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:3",
    "active": "16:38"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:4",
    "active": "16:39"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:5",
    "active": "16:40"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:6",
    "active": "16:41"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:7",
    "active": "16:42"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:8",
    "active": "16:43"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:9",
    "active": "16:44"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:10",
    "active": "16:45"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:11",
    "active": "16:46"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:12",
    "active": "16:47"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:13",
    "active": "16:48"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:14",
    "active": "16:49"
  },
  {
    "book": "numbers",
    "activePath": "data/bible/OT/numbers.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Numbers.json",
    "source": "17:15",
    "active": "16:50"
  },
  {
    "book": "deuteronomy",
    "activePath": "data/bible/OT/deuteronomy.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Deuteronomy.json",
    "source": "13:1",
    "active": "12:32"
  },
  {
    "book": "deuteronomy",
    "activePath": "data/bible/OT/deuteronomy.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Deuteronomy.json",
    "source": "23:1",
    "active": "22:30"
  }
];

function runGit(args) {
  const p = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return { status: p.status, stdout: p.stdout || '', stderr: p.stderr || '' };
}

function parseRef(ref) {
  const [chapter, verse] = ref.split(':').map((x) => Number.parseInt(x, 10));
  return { chapter, verse };
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

function activeMainText(node, translation) {
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
const sourceCache = new Map();
const activeCache = new Map();

function loadSource(sourcePath) {
  if (sourceCache.has(sourcePath)) return sourceCache.get(sourcePath);
  const proc = runGit(['show', `${sourceCommit}:${sourcePath}`]);
  if (proc.status !== 0) {
    const value = { error: `source unavailable: ${proc.stderr}` };
    sourceCache.set(sourcePath, value);
    return value;
  }
  try {
    const value = JSON.parse(proc.stdout);
    sourceCache.set(sourcePath, value);
    return value;
  } catch (error) {
    const value = { error: `source parse error: ${String(error.message || error)}` };
    sourceCache.set(sourcePath, value);
    return value;
  }
}

function loadActive(activePath) {
  if (activeCache.has(activePath)) return activeCache.get(activePath);
  try {
    const value = JSON.parse(fs.readFileSync(path.join(root, activePath), 'utf8'));
    activeCache.set(activePath, value);
    return value;
  } catch (error) {
    const value = { error: `active parse error: ${String(error.message || error)}` };
    activeCache.set(activePath, value);
    return value;
  }
}

for (const item of mappings) {
  const source = loadSource(item.sourcePath);
  const active = loadActive(item.activePath);

  if (source.error) {
    failures.push({ type: 'source-load-error', item, error: source.error });
    continue;
  }

  if (active.error) {
    failures.push({ type: 'active-load-error', item, error: active.error });
    continue;
  }

  const sref = parseRef(item.source);
  const aref = parseRef(item.active);
  const sourceRows = verseMap(source);
  const activeRows = verseMap(active);
  const sourceText = textFromNode(sourceRows.get(`${sref.chapter}:${sref.verse}`));
  const activeNode = activeRows.get(`${aref.chapter}:${aref.verse}`) || null;
  const mainNabre = activeMainText(activeNode, 'NABRE');
  const overlay = overlayText(active, 'NABRE', aref.chapter, aref.verse);

  const finding = {
    book: item.book,
    source: item.source,
    active: item.active,
    source_present: typeof sourceText === 'string' && sourceText.trim().length > 0,
    active_row_present: activeNode !== null,
    main_nabre_present: typeof mainNabre === 'string' && mainNabre.trim().length > 0,
    overlay_present: typeof overlay === 'string' && overlay.trim().length > 0,
    overlay_matches_source: typeof sourceText === 'string' && overlay === sourceText
  };

  findings.push(finding);

  if (!finding.source_present) failures.push({ type: 'missing-source', item });
  if (!finding.active_row_present) failures.push({ type: 'missing-active-target', item });
  if (finding.main_nabre_present) failures.push({ type: 'unexpected-main-nabre-insertion', item });
  if (!finding.overlay_present) failures.push({ type: 'missing-overlay', item });
  if (!finding.overlay_matches_source) failures.push({ type: 'overlay-source-mismatch', item });
}

const report = {
  audit: 'canonical-ot-pentateuch-nabre-overlays',
  status: failures.length ? 'failed' : 'passed',
  sourceCommit,
  mappingCount: mappings.length,
  failures,
  findings
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review Pentateuch NABRE overlay failures. Do not claim OT trust.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Pentateuch NABRE overlay batch is guarded; canonical OT remains untrusted pending remaining missing-row and versification work.');
}
