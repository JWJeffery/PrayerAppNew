#!/usr/bin/env node
import fs from 'node:fs';

const manifestPath = 'data/bible/registry/file-manifest.json';
const outPath = 'data/bible/registry/adjudication-buckets.json';
const docPath = 'documentation/BIBLE_REGISTRY_ADJUDICATION_PLAN.md';

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    return { error: String(error.message || error) };
  }
}

function hasReason(row, reason) {
  return Array.isArray(row?.adjudication?.reasons) && row.adjudication.reasons.includes(reason);
}

function compactRow(row) {
  return {
    path: row.path,
    title: row.title,
    legacy_folder: row.legacy_folder,
    shape: row.shape,
    candidate_role: row.candidate_role,
    resolver_status: row.resolver_status,
    reasons: row.adjudication?.reasons || []
  };
}

function stableGeneratedAt(outPath) {
  try {
    const existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    if (typeof existing.generated_at === 'string' && existing.generated_at) return existing.generated_at;
  } catch {}
  return new Date().toISOString();
}

const manifest = readJson(manifestPath);
const files = Array.isArray(manifest.files) ? manifest.files : [];

const buckets = {
  legacy_ot_nt_runtime_candidates: files
    .filter(row => row.resolver_status === 'legacy_resolver_candidate')
    .map(compactRow),

  outside_legacy_resolver_route: files
    .filter(row => row.resolver_status === 'not_routed_by_legacy_resolver')
    .map(compactRow),

  text_form_variant_candidates: files
    .filter(row => row.candidate_role === 'ordinary_book_text_form_variant')
    .map(compactRow),

  non_ordinary_shape_collection_witnesses: files
    .filter(row => hasReason(row, 'non_ordinary_book_shape'))
    .map(compactRow),

  filename_hygiene_mixed_case: files
    .filter(row => hasReason(row, 'mixed_case_filename'))
    .map(compactRow),

  filename_hygiene_curly_apostrophe: files
    .filter(row => hasReason(row, 'curly_apostrophe_in_path'))
    .map(compactRow),

  known_misclassification_review_candidates: files
    .filter(row => [
      'data/bible/NT/2baruchCE.json',
      'data/bible/NT/historyofzosimus.json',
      'data/bible/ET/bookofjubileesET.json',
      'data/bible/OT/1enoch.json'
    ].includes(row.path))
    .map(compactRow)
};

const bucketActions = {
  legacy_ot_nt_runtime_candidates: {
    action: 'Retain as legacy resolver candidates for now; later bind through registry instead of NT/OT guessing.',
    runtime_change_now: false
  },
  outside_legacy_resolver_route: {
    action: 'Do not move files. Add registry routing and canon-profile membership before Bible Browser exposes them.',
    runtime_change_now: false
  },
  text_form_variant_candidates: {
    action: 'Bind as text-form candidates such as Greek Esther / Greek Daniel rather than treating them as independent accidental books.',
    runtime_change_now: false
  },
  non_ordinary_shape_collection_witnesses: {
    action: 'Do not send these through ordinary chapter/verse resolver until a collection-specific schema adapter exists.',
    runtime_change_now: false
  },
  filename_hygiene_mixed_case: {
    action: 'Do not rename during resolver work. Use registry paths as shield; schedule a later path-hygiene migration only if needed.',
    runtime_change_now: false
  },
  filename_hygiene_curly_apostrophe: {
    action: 'Do not rename during resolver work. Registry must preserve current exact paths and expose ASCII aliases.',
    runtime_change_now: false
  },
  known_misclassification_review_candidates: {
    action: 'Human adjudication required. Do not move files yet; correct identity/profile classification first.',
    runtime_change_now: false
  }
};

const summary = Object.fromEntries(
  Object.entries(buckets).map(([key, rows]) => [key, rows.length])
);

const result = {
  schema: 'universal_office_bible_registry_adjudication_buckets_v1',
  status: 'draft',
  generated_at: stableGeneratedAt(outPath),
  rule: 'This plan classifies registry adjudication work. It does not move files and does not change resolver behavior.',
  source_manifest: manifestPath,
  summary,
  bucket_actions: bucketActions,
  buckets
};

fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');

const md = `# Bible Registry Adjudication Plan

## Status

Draft adjudication plan generated from \`${manifestPath}\`.

This plan does not move Bible files and does not change resolver behavior.

## Summary

${Object.entries(summary).map(([key, value]) => `- \`${key}\`: ${value}`).join('\n')}

## Architectural Reading

The current corpus has two different problems that must not be confused.

First, some books are unavailable in the Bible Browser because the legacy resolver does not route outside \`OT/\` and \`NT/\`.

Second, some books are unavailable in a given translation because no single English translation covers the whole received corpus universe.

The registry must distinguish these problems.

## Bucket Actions

${Object.entries(bucketActions).map(([key, value]) => `### ${key}

${value.action}

Runtime change now: \`${value.runtime_change_now}\`
`).join('\n')}

## Next Work

1. Human-adjudicate book identities and text forms.
2. Create canon-profile drafts from adjudicated identities.
3. Create translation-witness coverage records.
4. Rewire Bible Browser catalog generation to read the registry.
5. Rewire scripture resolver to ask the registry for source paths instead of guessing \`OT/\` or \`NT/\`.

## Rule

Do not use “extra books” as a governing category.

Use profile-relative statuses such as \`protocanonical\`, \`deuterocanonical\`, \`anagignoskomena\`, \`antilegomena\`, \`broader_canon\`, \`appendix\`, \`liturgical_reading\`, \`witness_only\`, and \`excluded\`.
`;

fs.writeFileSync(docPath, md + '\n');

console.log(JSON.stringify({
  result: 'OK',
  outPath,
  docPath,
  summary
}, null, 2));
console.log('ALL PASSED');
console.log('NEXT: run npm run audit:bible-registry-adjudication-plan');
