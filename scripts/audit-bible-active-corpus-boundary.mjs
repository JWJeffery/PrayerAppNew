#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();

function rel(p) {
  return path.relative(root, p).replaceAll(path.sep, '/');
}

function runGit(args) {
  const p = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return {
    args,
    status: p.status,
    stdout: (p.stdout || '').split(/\r?\n/).filter(Boolean),
    stderr: (p.stderr || '').split(/\r?\n/).filter(Boolean),
  };
}

function existsDir(relativePath) {
  try {
    return fs.statSync(path.join(root, relativePath)).isDirectory();
  } catch {
    return false;
  }
}

function walkDirs(start) {
  const out = [];
  const full = path.join(root, start);
  if (!fs.existsSync(full)) return out;
  const stack = [full];
  while (stack.length) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const child = path.join(current, entry.name);
      out.push(rel(child));
      stack.push(child);
    }
  }
  return out.sort();
}

function collectManifestPathHits() {
  const manifest = path.join(root, 'web-release/DEPLOYMENT_MANIFEST.json');
  const hits = [];
  if (!fs.existsSync(manifest)) return hits;

  let data;
  try {
    data = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  } catch (error) {
    hits.push({ type: 'manifest-parse-error', error: String(error.message || error) });
    return hits;
  }

  const forbiddenFragments = [
    'data/bible/translations/kjv-1611/source/',
    'data/bible/translations/nabre-internal-source-lane/source/',
    'aruljohn-bible-kjv-1611',
  ];

  function visit(value, pointer) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${pointer}/${index}`));
      return;
    }
    if (value && typeof value === 'object') {
      if (typeof value.path === 'string') {
        for (const fragment of forbiddenFragments) {
          if (value.path.includes(fragment)) {
            hits.push({ type: 'manifest-path-hit', pointer, fragment, path: value.path });
          }
        }
      }
      for (const [key, item] of Object.entries(value)) {
        visit(item, `${pointer}/${key}`);
      }
    }
  }

  visit(data, '');
  return hits;
}

const failures = [];
const warnings = [];

const exactForbiddenDirs = [
  'data/bible/translations/kjv-1611/source',
  'data/bible/translations/nabre-internal-source-lane/source',
];

for (const dir of exactForbiddenDirs) {
  if (existsDir(dir)) failures.push({ type: 'forbidden-dir-exists', path: dir });
}

const translationDirs = walkDirs('data/bible/translations');
const sourceDirs = translationDirs.filter((dir) => /\/source$/.test(dir));
const allowedSourceDirs = [];
for (const dir of sourceDirs) {
  if (!allowedSourceDirs.includes(dir)) {
    failures.push({ type: 'unexpected-source-dir', path: dir });
  }
}

const tracked = runGit(['ls-files']);
const trackedSourceMirrorFiles = tracked.stdout.filter((file) =>
  file.startsWith('data/bible/translations/kjv-1611/source/') ||
  file.startsWith('data/bible/translations/nabre-internal-source-lane/source/')
);
if (trackedSourceMirrorFiles.length) {
  failures.push({
    type: 'tracked-forbidden-source-files',
    count: trackedSourceMirrorFiles.length,
    sample: trackedSourceMirrorFiles.slice(0, 20),
  });
}

const untracked = runGit(['status', '--short', '--untracked-files=all']);
const untrackedSourceMirrorLines = untracked.stdout.filter((line) =>
  line.includes('data/bible/translations/kjv-1611/source/') ||
  line.includes('data/bible/translations/nabre-internal-source-lane/source/')
);
if (untrackedSourceMirrorLines.length) {
  failures.push({
    type: 'status-forbidden-source-lines',
    count: untrackedSourceMirrorLines.length,
    sample: untrackedSourceMirrorLines.slice(0, 20),
  });
}

const manifestHits = collectManifestPathHits();
if (manifestHits.length) {
  failures.push({
    type: 'deployment-manifest-forbidden-source-hits',
    count: manifestHits.length,
    sample: manifestHits.slice(0, 20),
  });
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
  audit: 'bible-active-corpus-boundary',
  status: failures.length ? 'failed' : 'passed',
  failures,
  warnings,
  checked: {
    exactForbiddenDirs,
    unexpectedTranslationSourceDirs: sourceDirs,
    trackedForbiddenSourceFileCount: trackedSourceMirrorFiles.length,
    manifestForbiddenHitCount: manifestHits.length,
    protectedVulgateStatusLineCount: protectedStatus.stdout.length,
  },
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review the report above; stale source mirrors or manifest references have reentered active corpus space.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Active corpus boundary is clean; proceed to schema/container contract planning.');
}
