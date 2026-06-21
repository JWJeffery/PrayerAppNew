#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const sourceCommit = "d0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6";
const mappings = [
  {
    "book": "hosea",
    "activePath": "data/bible/OT/hosea.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Hosea.json",
    "source": "2:1",
    "active": "1:10"
  },
  {
    "book": "hosea",
    "activePath": "data/bible/OT/hosea.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Hosea.json",
    "source": "2:2",
    "active": "1:11"
  },
  {
    "book": "hosea",
    "activePath": "data/bible/OT/hosea.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Hosea.json",
    "source": "12:1",
    "active": "11:12"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "3:1",
    "active": "2:28"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "3:2",
    "active": "2:29"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "3:3",
    "active": "2:30"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "3:4",
    "active": "2:31"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "3:5",
    "active": "2:32"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:6",
    "active": "3:6"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:7",
    "active": "3:7"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:8",
    "active": "3:8"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:9",
    "active": "3:9"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:10",
    "active": "3:10"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:11",
    "active": "3:11"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:12",
    "active": "3:12"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:13",
    "active": "3:13"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:14",
    "active": "3:14"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:15",
    "active": "3:15"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:16",
    "active": "3:16"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:17",
    "active": "3:17"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:18",
    "active": "3:18"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:19",
    "active": "3:19"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:20",
    "active": "3:20"
  },
  {
    "book": "joel",
    "activePath": "data/bible/OT/joel.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Joel.json",
    "source": "4:21",
    "active": "3:21"
  },
  {
    "book": "jonah",
    "activePath": "data/bible/OT/jonah.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Jonah.json",
    "source": "2:1",
    "active": "1:17"
  },
  {
    "book": "micah",
    "activePath": "data/bible/OT/micah.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Micah.json",
    "source": "5:14",
    "active": "5:15"
  },
  {
    "book": "nahum",
    "activePath": "data/bible/OT/nahum.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Nahum.json",
    "source": "2:1",
    "active": "1:15"
  },
  {
    "book": "zechariah",
    "activePath": "data/bible/OT/zechariah.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Zechariah.json",
    "source": "2:1",
    "active": "1:18"
  },
  {
    "book": "zechariah",
    "activePath": "data/bible/OT/zechariah.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Zechariah.json",
    "source": "2:2",
    "active": "1:19"
  },
  {
    "book": "zechariah",
    "activePath": "data/bible/OT/zechariah.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Zechariah.json",
    "source": "2:3",
    "active": "1:20"
  },
  {
    "book": "zechariah",
    "activePath": "data/bible/OT/zechariah.json",
    "sourcePath": "data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Zechariah.json",
    "source": "2:4",
    "active": "1:21"
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

function textFromNode(node, preferred = null) {
  if (typeof node === 'string') return node;
  if (!node || typeof node !== 'object') return null;

  const text = node.text;
  if (typeof text === 'string') return text;
  if (text && typeof text === 'object' && !Array.isArray(text)) {
    const keys = [];
    if (preferred) keys.push(preferred);
    keys.push('NABRE', 'nabre', 'text', 'value');

    for (const key of keys) {
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

  const sourceText = textFromNode(sourceRows.get(`${sref.chapter}:${sref.verse}`), 'NABRE');
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
    overlay_matches_source: typeof sourceText === 'string' && overlay === sourceText,
    overlay_sample: typeof overlay === 'string' ? overlay.slice(0, 180) : '',
  };

  findings.push(finding);

  if (!finding.source_present) failures.push({ type: 'missing-source', item });
  if (!finding.active_row_present) failures.push({ type: 'missing-active-target', item });
  if (finding.main_nabre_present) failures.push({ type: 'unexpected-main-nabre-insertion', item });
  if (!finding.overlay_present) failures.push({ type: 'missing-overlay', item });
  if (!finding.overlay_matches_source) failures.push({ type: 'overlay-source-mismatch', item });
}

const report = {
  audit: 'canonical-ot-minor-prophet-nabre-overlays',
  status: failures.length ? 'failed' : 'passed',
  note: 'Passing means the bounded source-backed minor-prophet NABRE overlay batch is present and no active main-row NABRE insertion was used for those mapped targets.',
  sourceCommit,
  mappingCount: mappings.length,
  findings,
  failures,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review minor-prophet NABRE overlay failures. Do not claim OT trust.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Minor-prophet NABRE overlay batch is guarded; canonical OT remains untrusted pending remaining missing-row and versification work.');
}
