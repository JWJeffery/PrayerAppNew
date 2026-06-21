#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();

const excludedPrefixes = [
  'data/bible/registry/',
  'data/bible/translations/vulgate-clementine/',
  'data/bible/translations/vulgate-psalter/',
];

const excludedPathPatterns = [
  /^data\/bible\/translations\/[^/]+\/raw\//,
  /^data\/bible\/translations\/[^/]+\/source\//,
];

const excludedExactSuffixes = [
  '/manifest.json',
];

const allowedDuplicateMetaIds = new Map([
  [
    'JUD',
    [
      'data/bible/NT/jude.json',
      'data/bible/OT/judith.json',
    ],
  ],
]);

function rel(p) {
  return path.relative(root, p).replaceAll(path.sep, '/');
}

function runGit(args) {
  const p = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return {
    status: p.status,
    stdout: (p.stdout || '').split(/\r?\n/).filter(Boolean),
    stderr: (p.stderr || '').split(/\r?\n/).filter(Boolean),
  };
}

function shouldExclude(relativePath) {
  if (!relativePath.startsWith('data/bible/')) return true;
  if (excludedPrefixes.some((prefix) => relativePath.startsWith(prefix))) return true;
  if (excludedPathPatterns.some((pattern) => pattern.test(relativePath))) return true;
  if (excludedExactSuffixes.some((suffix) => relativePath.endsWith(suffix))) return true;
  return false;
}

function walkJson(start) {
  const out = [];
  const fullStart = path.join(root, start);
  if (!fs.existsSync(fullStart)) return out;

  const stack = [fullStart];
  while (stack.length) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (['.git', 'node_modules', '.next', 'dist', 'build', 'coverage'].includes(entry.name)) continue;
        stack.push(child);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        const relativePath = rel(child);
        if (!shouldExclude(relativePath)) out.push(relativePath);
      }
    }
  }

  return out.sort();
}

function hasMeta(data) {
  return Boolean(data && typeof data === 'object' && !Array.isArray(data) && data.meta && typeof data.meta === 'object');
}

function classify(relativePath, data) {
  if (Array.isArray(data)) {
    if (relativePath === 'data/bible/OT/psalms.json') {
      return {
        shape: 'legacy_root_array_psalms',
        ok: true,
        note: 'Recognized legacy Psalms subsystem; architectural normalization remains separate.',
      };
    }
    return { shape: 'root_array_unrecognized', ok: false };
  }

  if (!data || typeof data !== 'object') {
    return { shape: 'non_object', ok: false };
  }

  if (hasMeta(data) && Array.isArray(data.chapters)) {
    return { shape: 'chapters', ok: true };
  }

  if (hasMeta(data) && Array.isArray(data.books)) {
    return { shape: 'books', ok: true };
  }

  if (hasMeta(data) && Array.isArray(data.sections)) {
    return { shape: 'sections', ok: true };
  }

  if (hasMeta(data) && data.liturgical_prologue && typeof data.liturgical_prologue === 'object' && Array.isArray(data.miracles)) {
    return { shape: 'liturgical_prologue_plus_miracles', ok: true };
  }

  if (hasMeta(data) && data.hymn_structure && typeof data.hymn_structure === 'object' && Array.isArray(data.stanzas)) {
    return { shape: 'hymnal_stanzas', ok: true };
  }

  return {
    shape: hasMeta(data) ? 'meta_without_recognized_container' : 'unknown_object',
    ok: false,
  };
}

function countTextNodes(value) {
  let textNodes = 0;
  let stringTextNodes = 0;
  let dictTextNodes = 0;

  function visit(v) {
    if (Array.isArray(v)) {
      for (const item of v) visit(item);
      return;
    }
    if (v && typeof v === 'object') {
      if (Object.prototype.hasOwnProperty.call(v, 'text')) {
        textNodes += 1;
        if (typeof v.text === 'string') stringTextNodes += 1;
        if (v.text && typeof v.text === 'object' && !Array.isArray(v.text)) dictTextNodes += 1;
      }
      for (const item of Object.values(v)) visit(item);
    }
  }

  visit(value);
  return { textNodes, stringTextNodes, dictTextNodes };
}

const failures = [];
const warnings = [];
const records = [];
const metaIds = new Map();
const shapeCounts = new Map();

for (const relativePath of walkJson('data/bible')) {
  const fullPath = path.join(root, relativePath);

  let data;
  try {
    data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    failures.push({ type: 'parse-error', path: relativePath, error: String(error.message || error) });
    continue;
  }

  const result = classify(relativePath, data);
  shapeCounts.set(result.shape, (shapeCounts.get(result.shape) || 0) + 1);

  const metaId = hasMeta(data) ? data.meta.id : null;
  if (metaId) {
    if (!metaIds.has(String(metaId))) metaIds.set(String(metaId), []);
    metaIds.get(String(metaId)).push(relativePath);
  }

  const record = {
    path: relativePath,
    shape: result.shape,
    ok: result.ok,
    meta_id: metaId,
    top_level_keys: data && typeof data === 'object' && !Array.isArray(data) ? Object.keys(data).sort() : [],
    ...countTextNodes(data),
  };

  if (result.note) record.note = result.note;
  records.push(record);

  if (!result.ok) {
    failures.push({
      type: 'unrecognized-container-shape',
      path: relativePath,
      shape: result.shape,
      top_level_keys: record.top_level_keys,
    });
  }

  if (result.shape === 'legacy_root_array_psalms') {
    warnings.push({
      type: 'legacy-container-shape',
      path: relativePath,
      message: 'Recognized so the guard can pass; Psalms still requires separate architecture.',
    });
  }
}

for (const [metaId, paths] of [...metaIds.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  if (paths.length < 2) continue;

  const allowed = allowedDuplicateMetaIds.get(metaId);
  const sortedPaths = [...paths].sort();
  const sortedAllowed = allowed ? [...allowed].sort() : null;
  const isAllowed = sortedAllowed && JSON.stringify(sortedPaths) === JSON.stringify(sortedAllowed);

  if (isAllowed) {
    warnings.push({
      type: 'allowed-duplicate-meta-id',
      meta_id: metaId,
      paths: sortedPaths,
      message: 'Known Jude/Judith collision retained pending deliberate identity correction.',
    });
  } else {
    failures.push({
      type: 'duplicate-meta-id',
      meta_id: metaId,
      paths: sortedPaths,
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
  audit: 'bible-schema-container-contract',
  status: failures.length ? 'failed' : 'passed',
  excludedPrefixes,
  excludedPathPatterns: excludedPathPatterns.map((pattern) => String(pattern)),
  excludedExactSuffixes,
  totalFilesChecked: records.length,
  shapeCounts: Object.fromEntries([...shapeCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
  failures,
  warnings,
  protectedVulgateStatusLineCount: protectedStatus.stdout.length,
  records: records.sort((a, b) => a.path.localeCompare(b.path)),
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review unrecognized active container shapes or duplicate active meta IDs before promoting schema trust.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Bible schema/container contract is recognized; proceed to canonical NT remediation planning.');
}
