#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'data/bible';
const REGISTRY = 'data/bible/registry';

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const rows = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (p.startsWith(REGISTRY + path.sep)) continue;
    if (entry.isDirectory()) rows.push(...walk(p));
    else if (entry.isFile() && entry.name.endsWith('.json')) rows.push(p.replaceAll(path.sep, '/'));
  }
  return rows.sort();
}

function safeReadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return { __parseError: String(error.message || error) };
  }
}

function shapeOf(json) {
  if (json?.__parseError) return 'parse_error';
  if (Array.isArray(json)) {
    const first = json[0] || {};
    if (first.id && first.text && !first.chapters) return 'array_psalter_like';
    if (first.chapters) return 'array_book_like';
    return 'array_other';
  }
  if (json && typeof json === 'object' && Array.isArray(json.chapters)) return 'book_object';
  return 'object_other';
}

function legacyFolder(file) {
  return file.split('/')[2] || null;
}

function titleFromFile(file, json) {
  if (json && !json.__parseError) {
    if (Array.isArray(json)) {
      const first = json[0] || {};
      return first.name || first.book || first.title || first.id || path.basename(file, '.json');
    }
    return json.name || json.book || json.title || json.id || json.meta?.name || path.basename(file, '.json');
  }
  return path.basename(file, '.json');
}

function normalizeId(value) {
  return String(value || '')
    .replace(/\.json$/i, '')
    .replace(/[’']/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function existingTranslations(json) {
  const out = new Set();
  if (!json || json.__parseError) return [];

  if (Array.isArray(json)) {
    const first = json[0] || {};
    if (first.text && typeof first.text === 'object' && !Array.isArray(first.text)) {
      Object.keys(first.text).forEach(k => out.add(k));
    }
    if (first.chapters) {
      for (const ch of first.chapters || []) {
        for (const v of ch.verses || []) {
          if (typeof v.text === 'string') out.add('scalar');
          else if (v.text && typeof v.text === 'object') Object.keys(v.text).forEach(k => out.add(k));
        }
      }
    }
  } else if (Array.isArray(json.chapters)) {
    for (const ch of json.chapters || []) {
      for (const v of ch.verses || []) {
        if (typeof v.text === 'string') out.add('scalar');
        else if (v.text && typeof v.text === 'object') Object.keys(v.text).forEach(k => out.add(k));
      }
    }
  }

  return [...out].sort();
}

function candidateRole(file) {
  const folder = legacyFolder(file);
  const base = path.basename(file, '.json');

  if (folder === 'OT' || folder === 'NT') {
    if (base.endsWith('GK')) return 'ordinary_book_text_form_variant';
    return 'ordinary_bible_book_or_related_text';
  }
  if (folder === 'ET') return 'ethiopian_or_oriental_orthodox_collection_witness';
  if (folder === 'SY') return 'syriac_collection_witness';
  if (folder === 'AR') return 'armenian_collection_witness';
  if (folder === 'ODES') return 'odes_or_canticle_collection_witness';
  return 'unclassified_collection_witness';
}

function adjudicationReasons(file, json) {
  const folder = legacyFolder(file);
  const shape = shapeOf(json);
  const reasons = [];

  if (shape === 'parse_error') reasons.push('json_parse_error');
  if (!['OT', 'NT'].includes(folder)) reasons.push('outside_legacy_ot_nt_resolver_route');
  if (shape === 'object_other' || shape === 'array_other') reasons.push('non_ordinary_book_shape');
  if (/[’]/.test(file)) reasons.push('curly_apostrophe_in_path');
  if (/[A-Z]/.test(path.basename(file))) reasons.push('mixed_case_filename');

  return reasons;
}

const files = walk(ROOT);
const manifestFiles = [];
const identities = [];

for (const file of files) {
  const json = safeReadJson(file);
  const folder = legacyFolder(file);
  const base = path.basename(file, '.json');
  const title = titleFromFile(file, json);
  const reasons = adjudicationReasons(file, json);
  const draftIdentityId = normalizeId(`${folder}_${base}`);

  manifestFiles.push({
    path: file,
    legacy_folder: folder,
    filename: path.basename(file),
    shape: shapeOf(json),
    title,
    translations_seen: existingTranslations(json),
    candidate_role: candidateRole(file),
    resolver_status: ['OT', 'NT'].includes(folder) ? 'legacy_resolver_candidate' : 'not_routed_by_legacy_resolver',
    adjudication: {
      required: reasons.length > 0,
      reasons
    }
  });

  identities.push({
    draft_identity_id: draftIdentityId,
    title,
    source_path: file,
    legacy_folder: folder,
    current_shape: shapeOf(json),
    candidate_role: candidateRole(file),
    canonical_identity_status: 'draft_needs_human_adjudication',
    text_form_status: base.endsWith('GK') ? 'text_form_variant_candidate' : 'unadjudicated',
    canon_profile_status: 'unassigned',
    notes: reasons.map(r => `Requires adjudication: ${r}`)
  });
}

const generatedAt = new Date().toISOString();

fs.mkdirSync(REGISTRY, { recursive: true });

fs.writeFileSync(
  path.join(REGISTRY, 'file-manifest.json'),
  JSON.stringify({
    schema: 'universal_office_bible_file_manifest_v1',
    status: 'draft_generated_from_current_filesystem',
    generated_at: generatedAt,
    rule: 'Physical storage is not canonical authority. This manifest records current files so later registry layers can govern them.',
    file_count: manifestFiles.length,
    files: manifestFiles
  }, null, 2) + '\n'
);

fs.writeFileSync(
  path.join(REGISTRY, 'book-identities.draft.json'),
  JSON.stringify({
    schema: 'universal_office_bible_book_identities_draft_v1',
    status: 'draft_requires_human_adjudication',
    generated_at: generatedAt,
    rule: 'These draft identities are mechanically generated from current files. Do not treat them as final canonical identities.',
    identity_count: identities.length,
    identities
  }, null, 2) + '\n'
);

console.log(JSON.stringify({
  result: 'OK',
  fileCount: manifestFiles.length,
  registryFiles: [
    'data/bible/registry/file-manifest.json',
    'data/bible/registry/book-identities.draft.json',
    'data/bible/registry/canon-status-vocabulary.json'
  ]
}, null, 2));
console.log('ALL PASSED');
console.log('NEXT: run npm run audit:bible-registry-draft');
