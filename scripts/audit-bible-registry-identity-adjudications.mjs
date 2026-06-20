#!/usr/bin/env node
import fs from 'node:fs';

const reportPath = process.env.BIBLE_REGISTRY_IDENTITY_AUDIT_REPORT || `/tmp/prayerappnew_bible_registry_identity_adjudications_audit_${Date.now()}.json`;
const failures = [];

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    failures.push(`${path}: ${String(error.message || error)}`);
    return null;
  }
}

const manifestPath = 'data/bible/registry/file-manifest.json';
const adjudicationsPath = 'data/bible/registry/identity-adjudications.json';
const docPath = 'documentation/BIBLE_REGISTRY_FIRST_ADJUDICATIONS.md';

const manifest = readJson(manifestPath);
const adjudications = readJson(adjudicationsPath);

if (!fs.existsSync(docPath)) failures.push(`${docPath}: missing`);

const manifestPaths = new Set((manifest?.files || []).map(row => row.path));
const rows = adjudications?.adjudications || [];

if (adjudications) {
  if (adjudications.schema !== 'universal_office_bible_registry_identity_adjudications_v1') {
    failures.push('identity-adjudications: bad schema');
  }

  if (rows.length < 31) {
    failures.push(`identity-adjudications: expected at least 31 adjudications after Qalementos tranche, got ${rows.length}`);
  }

  const requiredFields = [
    'source_path',
    'identity_id',
    'preferred_title',
    'work_type',
    'text_form_id',
    'ordinary_chapter_verse_resolver_candidate',
    'storage_note'
  ];

  const seenSourcePaths = new Set();
  const seenTextForms = new Set();

  for (const row of rows) {
    for (const field of requiredFields) {
      if (!(field in row)) failures.push(`${row.source_path || '(missing path)'}: missing ${field}`);
    }

    if (row.source_path && !manifestPaths.has(row.source_path)) {
      failures.push(`${row.source_path}: not found in file manifest`);
    }

    if (seenSourcePaths.has(row.source_path)) failures.push(`${row.source_path}: duplicate source_path`);
    seenSourcePaths.add(row.source_path);

    if (seenTextForms.has(row.text_form_id)) failures.push(`${row.text_form_id}: duplicate text_form_id`);
    seenTextForms.add(row.text_form_id);

    if (!Array.isArray(row.profile_hints) || row.profile_hints.length === 0) {
      failures.push(`${row.source_path}: missing profile_hints`);
    }

    if (row.source_path?.includes('danielGK') && row.identity_id !== 'DANIEL') {
      failures.push('danielGK must adjudicate to identity_id DANIEL');
    }

    if (row.source_path?.includes('estherGK') && row.identity_id !== 'ESTHER') {
      failures.push('estherGK must adjudicate to identity_id ESTHER');
    }

    if (row.source_path?.includes('/NT/2baruchCE') && row.identity_id === 'NEW_TESTAMENT') {
      failures.push('2baruchCE must not adjudicate as New Testament');
    }

    if (row.ordinary_chapter_verse_resolver_candidate === false && !row.adapter_required) {
      failures.push(`${row.source_path}: non-ordinary resolver candidate requires adapter_required`);
    }
  }
}

const report = {
  generated_at: new Date().toISOString(),
  result: failures.length ? 'FAIL' : 'OK',
  failure_count: failures.length,
  adjudication_count: rows.length,
  failures,
  reportPath
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  failureCount: failures.length,
  adjudicationCount: rows.length,
  reportPath
}, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log(`NEXT: inspect ${reportPath}`);
} else {
  console.log('ALL PASSED');
  console.log('NEXT: commit first identity adjudications or build canon-profile drafts.');
}
