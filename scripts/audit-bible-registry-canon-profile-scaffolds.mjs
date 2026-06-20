#!/usr/bin/env node
import fs from 'node:fs';

const reportPath = process.env.BIBLE_REGISTRY_CANON_PROFILE_AUDIT_REPORT || `/tmp/prayerappnew_bible_registry_canon_profile_scaffolds_audit_${Date.now()}.json`;
const failures = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    failures.push(`${file}: ${String(error.message || error)}`);
    return null;
  }
}

const identityPath = 'data/bible/registry/identity-adjudications.json';
const vocabularyPath = 'data/bible/registry/canon-status-vocabulary.json';
const indexPath = 'data/bible/registry/canon-profiles/index.draft.json';

const identities = readJson(identityPath);
const vocabulary = readJson(vocabularyPath);
const index = readJson(indexPath);

const adjudicatedPaths = new Set((identities?.adjudications || []).map(row => row.source_path));
const validStatuses = new Set(Object.keys(vocabulary?.canonical_statuses || {}));
const validUseClasses = new Set(Object.keys(vocabulary?.use_classes || {}));

const requiredProfileKeys = [
  'armenian_apostolic_witness',
  'coptic_orthodox_liturgical',
  'eastern_orthodox',
  'ethiopian_orthodox_broader',
  'roman_catholic',
  'study_witness',
  'syriac_christian_witness'
];

if (index) {
  if (index.schema !== 'universal_office_bible_canon_profile_index_draft_v1') {
    failures.push('canon-profile index: bad schema');
  }

  const profileKeys = new Set((index.profiles || []).map(row => row.profile_key));
  for (const key of requiredProfileKeys) {
    if (!profileKeys.has(key)) failures.push(`canon-profile index: missing ${key}`);
  }

  for (const profileRef of index.profiles || []) {
    const profile = readJson(profileRef.path);
    if (!profile) continue;

    if (profile.schema !== 'universal_office_bible_canon_profile_draft_v1') {
      failures.push(`${profileRef.path}: bad schema`);
    }

    if (profile.status !== 'draft_incomplete_scaffold') {
      failures.push(`${profileRef.path}: profile must remain draft_incomplete_scaffold`);
    }

    if (!String(profile.completeness || '').includes('incomplete')) {
      failures.push(`${profileRef.path}: completeness must remain explicitly incomplete`);
    }

    for (const entry of profile.entries || []) {
      if (!entry.source_path) failures.push(`${profileRef.path}: entry missing source_path`);
      if (entry.source_path && !adjudicatedPaths.has(entry.source_path)) {
        failures.push(`${profileRef.path}: ${entry.source_path} not in identity adjudications`);
      }

      if (!validStatuses.has(entry.canonical_status)) {
        failures.push(`${profileRef.path}: invalid canonical_status ${entry.canonical_status}`);
      }

      if (!validUseClasses.has(entry.use_class)) {
        failures.push(`${profileRef.path}: invalid use_class ${entry.use_class}`);
      }

      if (String(entry.canonical_status).toLowerCase().includes('extra')) {
        failures.push(`${profileRef.path}: forbidden extra-books style status`);
      }

      if (entry.ordinary_chapter_verse_resolver_candidate === false && !entry.adapter_required) {
        failures.push(`${profileRef.path}: ${entry.source_path} needs adapter_required`);
      }
    }
  }
}

const report = {
  generated_at: new Date().toISOString(),
  result: failures.length ? 'FAIL' : 'OK',
  failure_count: failures.length,
  failures,
  reportPath
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  failureCount: failures.length,
  reportPath
}, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log(`NEXT: inspect ${reportPath}`);
} else {
  console.log('ALL PASSED');
  console.log('NEXT: commit canon-profile scaffolds or decide the next adjudication tranche.');
}
