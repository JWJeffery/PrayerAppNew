#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const reportPath = process.env.CANONICAL_NT_CERTIFICATION_REPORT || null;
const rotherhamSourceFile = process.env.ROTHERHAM_SOURCE_FILE || null;
const histRef = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';

const canonicalNtFiles = [
  'data/bible/NT/matthew.json',
  'data/bible/NT/mark.json',
  'data/bible/NT/luke.json',
  'data/bible/NT/john.json',
  'data/bible/NT/acts.json',
  'data/bible/NT/romans.json',
  'data/bible/NT/1corinthians.json',
  'data/bible/NT/2corinthians.json',
  'data/bible/NT/galatians.json',
  'data/bible/NT/ephesians.json',
  'data/bible/NT/philippians.json',
  'data/bible/NT/colossians.json',
  'data/bible/NT/1thessalonians.json',
  'data/bible/NT/2thessalonians.json',
  'data/bible/NT/1timothy.json',
  'data/bible/NT/2timothy.json',
  'data/bible/NT/titus.json',
  'data/bible/NT/philemon.json',
  'data/bible/NT/hebrews.json',
  'data/bible/NT/james.json',
  'data/bible/NT/1peter.json',
  'data/bible/NT/2peter.json',
  'data/bible/NT/1john.json',
  'data/bible/NT/2john.json',
  'data/bible/NT/3john.json',
  'data/bible/NT/jude.json',
  'data/bible/NT/revelation.json'
];

const requiredLanes = ['DRB', 'KJV', 'NABRE', 'NRSV', 'Rotherham'];

const rotherhamAliases = {
  matthew: ['Matthew'],
  mark: ['Mark'],
  luke: ['Luke'],
  john: ['John'],
  acts: ['Acts'],
  romans: ['Romans'],
  '1corinthians': ['I Corinthians', '1 Corinthians', 'First Corinthians'],
  '2corinthians': ['II Corinthians', '2 Corinthians', 'Second Corinthians'],
  galatians: ['Galatians'],
  ephesians: ['Ephesians'],
  philippians: ['Philippians'],
  colossians: ['Colossians'],
  '1thessalonians': ['I Thessalonians', '1 Thessalonians', 'First Thessalonians'],
  '2thessalonians': ['II Thessalonians', '2 Thessalonians', 'Second Thessalonians'],
  '1timothy': ['I Timothy', '1 Timothy', 'First Timothy'],
  '2timothy': ['II Timothy', '2 Timothy', 'Second Timothy'],
  titus: ['Titus'],
  philemon: ['Philemon'],
  hebrews: ['Hebrews'],
  james: ['James'],
  '1peter': ['I Peter', '1 Peter', 'First Peter'],
  '2peter': ['II Peter', '2 Peter', 'Second Peter'],
  '1john': ['I John', '1 John', 'First John'],
  '2john': ['II John', '2 John', 'Second John'],
  '3john': ['III John', '3 John', 'Third John'],
  jude: ['Jude'],
  revelation: ['Revelation of John', 'Revelation', 'Apocalypse']
};

function runGit(args) {
  const p = spawnSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 80
  });

  return { status: p.status, stdout: p.stdout || '', stderr: p.stderr || '' };
}

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b(the|gospel|according|to|saint|st|epistle|of|paul|apostle|letter)\b/g, '')
    .replace(/\bfirst\b/g, '1')
    .replace(/\bsecond\b/g, '2')
    .replace(/\bthird\b/g, '3')
    .replace(/\bi\b/g, '1')
    .replace(/\bii\b/g, '2')
    .replace(/\biii\b/g, '3')
    .replace(/[^a-z0-9]/g, '');
}

function cnum(ch, index) {
  return Number(ch?.num ?? ch?.number ?? ch?.chapter ?? ch?.chapterNumber ?? index + 1);
}

function vnum(row, index) {
  return Number(row?.num ?? row?.number ?? row?.verse ?? row?.verseNumber ?? index + 1);
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function normalizeForLane(lane, text) {
  let value = String(text);
  if (lane === 'KJV') value = value.replace(/&thorn;/g, 'þ').replace(/&THORN;/g, 'Þ');
  return value;
}

function activeLanes(book) {
  const lanes = new Set();

  for (const ch of book.chapters || []) {
    for (const row of ch.verses || []) {
      if (row?.text && typeof row.text === 'object' && !Array.isArray(row.text)) {
        for (const [lane, value] of Object.entries(row.text)) {
          if (typeof value === 'string' && value.length) lanes.add(lane);
        }
      }
    }
  }

  return [...lanes].sort();
}

function collectActiveRows(book, lane) {
  const rows = new Map();

  for (const [ci, ch] of (book.chapters || []).entries()) {
    const chapter = cnum(ch, ci);

    for (const [vi, row] of (ch.verses || []).entries()) {
      const verse = vnum(row, vi);

      if (row?.text && typeof row.text === 'object' && !Array.isArray(row.text) && typeof row.text[lane] === 'string') {
        rows.set(`${chapter}:${verse}`, normalizeForLane(lane, row.text[lane]));
      }
    }
  }

  return rows;
}

function collectSimpleSourceRows(book, lane, sourceLane) {
  const rows = new Map();

  for (const [ci, ch] of (book.chapters || []).entries()) {
    const chapter = cnum(ch, ci);

    for (const [vi, row] of (ch.verses || []).entries()) {
      const verse = vnum(row, vi);
      let text = null;

      if (sourceLane === 'text' && typeof row?.text === 'string') {
        text = row.text;
      } else if (row?.text && typeof row.text === 'object' && !Array.isArray(row.text) && typeof row.text[lane] === 'string') {
        text = row.text[lane];
      }

      if (typeof text === 'string') rows.set(`${chapter}:${verse}`, normalizeForLane(lane, text));
    }
  }

  return rows;
}

function collectNrsvSourceRows(sourceBook) {
  const rows = new Map();

  for (const row of sourceBook.rows || []) {
    rows.set(`${row.chapter}:${row.verse}`, normalizeForLane('NRSV', row.text));
  }

  return rows;
}

function bookName(book) {
  return book?.name || book?.book || book?.title || book?.bookName || book?.osis || '';
}

function chapterRows(book) {
  return asArray(book?.chapters || book?.chapter || book?.Chapters);
}

function verseRows(chapter) {
  return asArray(chapter?.verses || chapter?.verse || chapter?.Verses);
}

function verseText(row) {
  const candidates = [row?.text, row?.Text, row?.content, row?.verseText, row?.words];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') return candidate;
  }

  return null;
}

function collectGenericSourceRows(book, lane) {
  const rows = new Map();

  for (const [ci, ch] of chapterRows(book).entries()) {
    const chapter = cnum(ch, ci);

    for (const [vi, row] of verseRows(ch).entries()) {
      const verse = vnum(row, vi);
      const text = verseText(row);

      if (typeof text === 'string' && text.length > 0) {
        rows.set(`${chapter}:${verse}`, normalizeForLane(lane, text));
      }
    }
  }

  return rows;
}

function treeFiles(ref, root) {
  const p = runGit(['ls-tree', '-r', '--name-only', ref, root]);
  if (p.status !== 0) return [];
  return p.stdout.split(/\r?\n/).filter(Boolean).filter(file => file.endsWith('.json'));
}

function walkJson(root) {
  if (!fs.existsSync(root)) return [];
  const files = [];

  function walk(dir) {
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (full.endsWith('.json')) files.push(full);
    }
  }

  walk(root);
  return files;
}

function resolveByBook(files, bookNameValue, activePath, aliases = new Map()) {
  const activeStem = normalizeName(path.basename(activePath, '.json'));
  const bookNorm = normalizeName(bookNameValue);
  const aliasNorm = aliases.get(activeStem);

  const wanted = new Set([activeStem, bookNorm]);
  if (aliasNorm) wanted.add(aliasNorm);

  const scored = files.map(file => {
    const stem = normalizeName(path.basename(file, '.json'));
    let score = 0;

    for (const target of wanted) {
      if (stem === target) score += 100;
      if (stem.includes(target) || target.includes(stem)) score += 20;
    }

    return { file, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));

  return scored[0]?.file || null;
}

function readSource(def, sourcePath) {
  if (!sourcePath) return null;

  if (def.ref) {
    const raw = runGit(['show', `${def.ref}:${sourcePath}`]);
    if (raw.status !== 0) return null;
    return JSON.parse(raw.stdout);
  }

  if (!fs.existsSync(sourcePath)) return null;
  return JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
}

if (!rotherhamSourceFile || !fs.existsSync(rotherhamSourceFile)) {
  console.error('Missing ROTHERHAM_SOURCE_FILE');
  process.exit(1);
}

const rotherhamSource = JSON.parse(fs.readFileSync(rotherhamSourceFile, 'utf8'));
const rotherhamBooksByNorm = new Map();

for (const book of asArray(rotherhamSource.books)) {
  const name = bookName(book);
  if (name) rotherhamBooksByNorm.set(normalizeName(name), book);
}

const sourceDefs = {
  KJV: {
    type: 'historical_git_source',
    ref: histRef,
    sourceLane: 'text',
    files: treeFiles(histRef, 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611'),
    aliases: new Map()
  },
  NABRE: {
    type: 'historical_git_source',
    ref: histRef,
    sourceLane: 'text',
    files: treeFiles(histRef, 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books'),
    aliases: new Map()
  },
  DRB: {
    type: 'local_raw_source',
    ref: null,
    sourceLane: 'text',
    files: walkJson('data/bible/translations/drb-original-douay-rheims/raw'),
    aliases: new Map([['revelation', 'apocalypse']])
  },
  NRSV: {
    type: 'local_internal_source_witness',
    ref: null,
    sourceLane: 'rows',
    files: walkJson('data/bible/translations/nrsv-canonical-nt-internal-source/raw'),
    aliases: new Map()
  },
  Rotherham: {
    type: 'verified_tmp_source_witness',
    ref: null,
    sourceLane: 'generic',
    files: [],
    aliases: new Map()
  }
};

const pairs = [];
const failures = [];
const activeLaneCounts = {};

for (const activePath of canonicalNtFiles) {
  const active = JSON.parse(fs.readFileSync(activePath, 'utf8'));
  const bookNameValue = active?.meta?.name || path.basename(activePath, '.json');
  const activeStem = normalizeName(path.basename(activePath, '.json'));
  const lanes = activeLanes(active);

  for (const lane of lanes) {
    const activeRows = collectActiveRows(active, lane);
    activeLaneCounts[lane] = (activeLaneCounts[lane] || 0) + activeRows.size;

    const def = sourceDefs[lane];

    if (!def) {
      const item = {
        book: bookNameValue,
        lane,
        activePath,
        activeRefs: activeRows.size,
        status: 'failed_no_source_definition'
      };
      pairs.push(item);
      failures.push(item);
      continue;
    }

    let sourcePath = null;
    let source = null;
    let sourceRows = null;

    if (lane === 'Rotherham') {
      const names = rotherhamAliases[activeStem] || [bookNameValue];

      for (const candidateName of names) {
        const candidate = rotherhamBooksByNorm.get(normalizeName(candidateName));
        if (candidate) {
          source = candidate;
          sourcePath = `verified_tmp_source:${bookName(candidate)}`;
          break;
        }
      }

      if (source) sourceRows = collectGenericSourceRows(source, lane);
    } else {
      sourcePath = resolveByBook(def.files, bookNameValue, activePath, def.aliases);
      source = readSource(def, sourcePath);

      if (source) {
        sourceRows = lane === 'NRSV'
          ? collectNrsvSourceRows(source)
          : collectSimpleSourceRows(source, lane, def.sourceLane);
      }
    }

    if (!sourcePath || !source) {
      const item = {
        book: bookNameValue,
        lane,
        activePath,
        sourceType: def.type,
        sourceCandidateCount: def.files.length,
        activeRefs: activeRows.size,
        status: 'failed_source_path_not_resolved',
        sampleSourceCandidates: def.files.slice(0, 12)
      };
      pairs.push(item);
      failures.push(item);
      continue;
    }

    if (!sourceRows || sourceRows.size === 0) {
      const item = {
        book: bookNameValue,
        lane,
        activePath,
        sourcePath,
        sourceType: def.type,
        activeRefs: activeRows.size,
        status: 'failed_source_shape_unrecognized'
      };
      pairs.push(item);
      failures.push(item);
      continue;
    }

    const mismatches = [];
    const missingActive = [];
    const missingSource = [];

    for (const [ref, sourceText] of sourceRows.entries()) {
      if (!activeRows.has(ref)) missingActive.push(ref);
      else if (activeRows.get(ref) !== sourceText) {
        mismatches.push({
          ref,
          activeSample: activeRows.get(ref).slice(0, 120),
          sourceSample: sourceText.slice(0, 120)
        });
      }
    }

    for (const ref of activeRows.keys()) {
      if (!sourceRows.has(ref)) missingSource.push(ref);
    }

    const issueCount = mismatches.length + missingActive.length + missingSource.length;

    const item = {
      book: bookNameValue,
      lane,
      activePath,
      sourcePath,
      sourceType: def.type,
      activeRefs: activeRows.size,
      sourceRefs: sourceRows.size,
      status: issueCount ? 'failed_source_text_delta' : 'source_exact_pass',
      issueCount,
      mismatches: mismatches.length,
      missingActive: missingActive.length,
      missingSource: missingSource.length,
      sampleMismatches: mismatches.slice(0, 5),
      sampleMissingActive: missingActive.slice(0, 12),
      sampleMissingSource: missingSource.slice(0, 12)
    };

    pairs.push(item);

    if (issueCount) failures.push(item);
  }
}

const groupedPasses = {};

for (const item of pairs.filter(pair => pair.status === 'source_exact_pass')) {
  groupedPasses[item.lane] ||= {
    lane: item.lane,
    pairCount: 0,
    activeRefs: 0,
    sourceRefs: 0
  };
  groupedPasses[item.lane].pairCount += 1;
  groupedPasses[item.lane].activeRefs += item.activeRefs || 0;
  groupedPasses[item.lane].sourceRefs += item.sourceRefs || 0;
}

const requiredLaneFailures = [];

for (const lane of requiredLanes) {
  const pass = groupedPasses[lane];

  if (!pass) {
    requiredLaneFailures.push({ lane, reason: 'lane_has_no_source_exact_passes' });
    continue;
  }

  if (pass.pairCount !== 27) {
    requiredLaneFailures.push({ lane, reason: 'pair_count_not_27', pairCount: pass.pairCount });
  }

  if (pass.activeRefs !== pass.sourceRefs) {
    requiredLaneFailures.push({
      lane,
      reason: 'active_source_count_delta',
      activeRefs: pass.activeRefs,
      sourceRefs: pass.sourceRefs
    });
  }
}

const unexpectedLanes = Object.keys(activeLaneCounts).filter(lane => !requiredLanes.includes(lane));

for (const lane of unexpectedLanes) {
  requiredLaneFailures.push({ lane, reason: 'unexpected_active_lane_without_certification_policy' });
}

const certificationReady = failures.length === 0 && requiredLaneFailures.length === 0 && pairs.length === 135;

const report = {
  schema: 'canonical-nt-text-trust-certification-audit-v1',
  generatedAt: new Date().toISOString(),
  scope: 'canonical_nt_27_books_only_active_text_rows_only',
  certificationRule: 'All text must be present in active text rows and source-verifiable. Translation overlays do not count.',
  requiredLanes,
  activeLaneCounts,
  pairCount: pairs.length,
  sourceExactPassPairs: pairs.filter(pair => pair.status === 'source_exact_pass').length,
  failedPairs: failures.length,
  groupedPasses: Object.values(groupedPasses),
  requiredLaneFailures,
  certificationReady,
  nextRequiredWork: certificationReady
    ? 'Record Canonical NT text-trust certification.'
    : 'Do not certify Canonical NT; repair failed source-backed pairs or lane coverage.',
  failures,
  allPairs: pairs
};

if (reportPath) {
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify({
  schema: report.schema,
  scope: report.scope,
  certificationRule: report.certificationRule,
  requiredLanes: report.requiredLanes,
  activeLaneCounts: report.activeLaneCounts,
  pairCount: report.pairCount,
  sourceExactPassPairs: report.sourceExactPassPairs,
  failedPairs: report.failedPairs,
  groupedPasses: report.groupedPasses,
  requiredLaneFailures: report.requiredLaneFailures,
  certificationReady: report.certificationReady,
  nextRequiredWork: report.nextRequiredWork
}, null, 2));

if (!certificationReady) {
  console.log('ALL FAILED');
  console.log('NEXT: Do not record Canonical NT certification.');
  process.exit(1);
}

console.log('ALL PASSED');
console.log('NEXT: Canonical NT is ready for text-trust certification record.');
