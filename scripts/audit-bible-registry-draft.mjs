#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const reportPath = process.env.BIBLE_REGISTRY_AUDIT_REPORT || `/tmp/prayerappnew_bible_registry_draft_audit_${Date.now()}.json`;
const failures = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    failures.push(`${file}: ${error.message}`);
    return null;
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const rows = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (p.startsWith('data/bible/registry' + path.sep)) continue;
    if (entry.isDirectory()) rows.push(...walk(p));
    else if (entry.isFile() && entry.name.endsWith('.json')) rows.push(p.replaceAll(path.sep, '/'));
  }
  return rows.sort();
}

const required = [
  'documentation/BIBLE_REGISTRY_ARCHITECTURE.md',
  'data/bible/registry/canon-status-vocabulary.json',
  'data/bible/registry/file-manifest.json',
  'data/bible/registry/book-identities.draft.json'
];

for (const file of required) {
  if (!fs.existsSync(file)) failures.push(`${file}: missing`);
}

const vocab = readJson('data/bible/registry/canon-status-vocabulary.json');
const manifest = readJson('data/bible/registry/file-manifest.json');
const identities = readJson('data/bible/registry/book-identities.draft.json');
const currentFiles = walk('data/bible');

if (vocab) {
  if (Object.keys(vocab.canonical_statuses || {}).includes('extra_books')) failures.push('vocabulary: extra_books must not be a canonical status');
  for (const key of ['protocanonical', 'deuterocanonical', 'anagignoskomena', 'antilegomena', 'broader_canon', 'appendix', 'liturgical_reading', 'witness_only', 'excluded']) {
    if (!vocab.canonical_statuses?.[key]) failures.push(`vocabulary: missing status ${key}`);
  }
  for (const key of ['read_in_church', 'read_devotionally', 'study_only', 'not_in_profile']) {
    if (!vocab.use_classes?.[key]) failures.push(`vocabulary: missing use class ${key}`);
  }
}

if (manifest) {
  const listed = (manifest.files || []).map(row => row.path).sort();
  if (manifest.schema !== 'universal_office_bible_file_manifest_v1') failures.push('file-manifest: bad schema');
  if (listed.length !== currentFiles.length) failures.push(`file-manifest: expected ${currentFiles.length} files, got ${listed.length}`);

  const listedSet = new Set(listed);
  for (const file of currentFiles) {
    if (!listedSet.has(file)) failures.push(`file-manifest: missing ${file}`);
  }
}

if (identities) {
  const rows = identities.identities || [];
  if (identities.schema !== 'universal_office_bible_book_identities_draft_v1') failures.push('book-identities: bad schema');
  if (rows.length !== currentFiles.length) failures.push(`book-identities: expected ${currentFiles.length} identities, got ${rows.length}`);

  const ids = new Set();
  for (const row of rows) {
    if (!row.draft_identity_id) failures.push('book-identities: identity without draft_identity_id');
    if (ids.has(row.draft_identity_id)) failures.push(`book-identities: duplicate ${row.draft_identity_id}`);
    ids.add(row.draft_identity_id);
    if (!row.source_path) failures.push(`book-identities: ${row.draft_identity_id || '(missing id)'} has no source_path`);
  }
}

const report = {
  generated_at: new Date().toISOString(),
  result: failures.length ? 'FAIL' : 'OK',
  failure_count: failures.length,
  failures,
  current_bible_json_file_count: currentFiles.length
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  failureCount: report.failure_count,
  currentBibleJsonFileCount: report.current_bible_json_file_count,
  reportPath
}, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log(`NEXT: inspect ${reportPath}`);
} else {
  console.log('ALL PASSED');
  console.log('NEXT: inspect registry draft, then adjudicate identities/text forms/canon profiles before resolver rewiring.');
}
