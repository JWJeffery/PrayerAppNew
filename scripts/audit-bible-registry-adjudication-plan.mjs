#!/usr/bin/env node
import fs from 'node:fs';

const reportPath = process.env.BIBLE_REGISTRY_ADJUDICATION_AUDIT_REPORT || `/tmp/prayerappnew_bible_registry_adjudication_plan_audit_${Date.now()}.json`;
const failures = [];

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    failures.push(`${path}: ${String(error.message || error)}`);
    return null;
  }
}

const planPath = 'data/bible/registry/adjudication-buckets.json';
const docPath = 'documentation/BIBLE_REGISTRY_ADJUDICATION_PLAN.md';
const manifestPath = 'data/bible/registry/file-manifest.json';

const plan = readJson(planPath);
const manifest = readJson(manifestPath);

if (!fs.existsSync(docPath)) failures.push(`${docPath}: missing`);

const requiredBuckets = [
  'legacy_ot_nt_runtime_candidates',
  'outside_legacy_resolver_route',
  'text_form_variant_candidates',
  'non_ordinary_shape_collection_witnesses',
  'filename_hygiene_mixed_case',
  'filename_hygiene_curly_apostrophe',
  'known_misclassification_review_candidates'
];

if (plan) {
  if (plan.schema !== 'universal_office_bible_registry_adjudication_buckets_v1') {
    failures.push('adjudication-buckets: bad schema');
  }

  for (const bucket of requiredBuckets) {
    if (!Array.isArray(plan.buckets?.[bucket])) failures.push(`adjudication-buckets: missing bucket ${bucket}`);
    if (!plan.bucket_actions?.[bucket]) failures.push(`adjudication-buckets: missing action for ${bucket}`);
  }

  const flattened = new Set();
  for (const bucket of ['legacy_ot_nt_runtime_candidates', 'outside_legacy_resolver_route']) {
    for (const row of plan.buckets?.[bucket] || []) {
      flattened.add(row.path);
    }
  }

  const manifestCount = Array.isArray(manifest?.files) ? manifest.files.length : null;
  if (manifestCount !== null && flattened.size !== manifestCount) {
    failures.push(`adjudication-buckets: legacy/outside route buckets cover ${flattened.size}, expected ${manifestCount}`);
  }

  const doc = fs.existsSync(docPath) ? fs.readFileSync(docPath, 'utf8') : '';
  if (/extra books/i.test(doc.replace(/Do not use “extra books” as a governing category\./g, ''))) {
    failures.push('documentation: avoid using extra books as ordinary category language');
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
  console.log('NEXT: commit adjudication plan or proceed to identity/text-form adjudication.');
}
