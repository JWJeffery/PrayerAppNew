// Audit for the Roman Breviary component bundles (engine rebuild, phase 1).
// Fails (exit 1) unless: every mirrored component-source file has exactly one entry; every entry
// has a mirrored source file; each entry rebuilds BYTE-FOR-BYTE to its source (sha256 compare);
// section counts equal header-line counts; every file the Perl engine read in the traced set is covered.
import fs from 'node:fs';
import path from 'node:path';
import { DATA_ROOT, WWW, OUT, SCHEMA_VERSION, classify, rebuildText, sha256 } from './build-roman-breviary-components.mjs';

const problems = [];
const fail = (m) => problems.push(m);

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const index = JSON.parse(fs.readFileSync(path.join(OUT, 'index.json'), 'utf8'));
if (index.schema_version !== SCHEMA_VERSION) fail(`index schema_version ${index.schema_version}`);
const pin = JSON.parse(fs.readFileSync(path.join(DATA_ROOT, 'source', 'divinum-officium', 'source-pin.json'), 'utf8'));
if (index.source_pin.commit !== pin.commit) fail('index commit differs from source-pin.json');

const entriesBySource = new Map();
let sections = 0, flat = 0, sectioned = 0;
const condVocab = new Map();
for (const b of index.bundles) {
  const doc = JSON.parse(fs.readFileSync(path.join(OUT, b.path), 'utf8'));
  if (doc.source_pin.commit !== pin.commit) fail(`${b.path}: wrong pin`);
  if (Object.keys(doc.files).length !== b.files) fail(`${b.path}: file count != index`);
  for (const [key, e] of Object.entries(doc.files)) {
    if (entriesBySource.has(e.source)) fail(`duplicate entry for ${e.source}`);
    entriesBySource.set(e.source, e);
    const abs = path.join(WWW, e.source.replace(/^web\/www\//, ''));
    if (!fs.existsSync(abs)) { fail(`${e.source}: no mirrored source file`); continue; }
    const buf = fs.readFileSync(abs);
    if (sha256(buf) !== e.sha256 || buf.length !== e.bytes) fail(`${e.source}: source bytes differ from recorded sha256`);
    const c = classify(e.source.replace(/^web\/www\//, ''));
    if (!c || `${c.lang}/${c.group}` !== b.id || c.key !== key) fail(`${e.source}: filed in wrong bundle/key (${b.id}/${key})`);
    const rebuilt = Buffer.from(rebuildText(e), 'utf8');
    if (!rebuilt.equals(buf)) fail(`${e.source}: ROUND-TRIP MISMATCH`);
    if (e.kind === 'sectioned') {
      sectioned++;
      sections += e.sections.length;
      const headers = buf.toString('utf8').split('\n').filter((l) => /^\[[^\]]*\]/.test(l)).length;
      if (headers !== e.sections.length) fail(`${e.source}: ${headers} header lines but ${e.sections.length} sections`);
      for (const s of e.sections) if (s.condition) condVocab.set(s.condition, (condVocab.get(s.condition) || 0) + 1);
    } else if (e.kind === 'flat') flat++;
    else fail(`${e.source}: unknown kind ${e.kind}`);
  }
}

let sources = 0;
for (const abs of walk(WWW)) {
  const rel = path.relative(WWW, abs).split(path.sep).join('/');
  if (!classify(rel)) continue;
  sources++;
  if (!entriesBySource.has(`web/www/${rel}`)) fail(`${rel}: mirrored source with no component entry`);
}
if (sources !== entriesBySource.size) fail(`sources ${sources} != entries ${entriesBySource.size}`);

const readSet = fs.readFileSync(path.join(DATA_ROOT, 'source', 'engine-read-set-2026-10-03.txt'), 'utf8').split('\n').filter(Boolean);
let uncovered = 0;
for (const f of readSet) if (!entriesBySource.has(f)) { uncovered++; fail(`engine read-set file not covered: ${f}`); }

console.log(`component sources: ${sources}   entries: ${entriesBySource.size}   sectioned: ${sectioned}   flat: ${flat}   sections: ${sections}`);
console.log(`distinct section-header conditions: ${condVocab.size}`);
console.log(`engine read-set files: ${readSet.length}, uncovered: ${uncovered}`);
if (problems.length) {
  console.error(`FAIL audit:roman-breviary-components: ${problems.length} problem(s)`);
  for (const p of problems.slice(0, 40)) console.error('  ' + p);
  process.exit(1);
}
console.log('PASS audit:roman-breviary-components: all files round-trip byte-for-byte');
