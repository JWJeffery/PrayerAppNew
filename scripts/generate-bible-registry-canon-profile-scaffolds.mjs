#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const identityPath = 'data/bible/registry/identity-adjudications.json';
const outDir = 'data/bible/registry/canon-profiles';

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return { error: String(error.message || error) };
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function stableGeneratedAt(outPath) {
  try {
    const existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    if (typeof existing.generated_at === 'string' && existing.generated_at) return existing.generated_at;
  } catch {}
  return new Date().toISOString();
}

function profileForHint(profileFamily) {
  if (profileFamily === 'ethiopian_orthodox') {
    return {
      key: 'ethiopian_orthodox_broader',
      filename: 'ethiopian-orthodox-broader.draft.json',
      display_name: 'Ethiopian Orthodox Broader Canon / Liturgical Witness Draft',
      tradition_family: 'oriental_orthodox',
      profile_kind: 'canon_profile_scaffold'
    };
  }

  if (profileFamily === 'catholic') {
    return {
      key: 'roman_catholic',
      filename: 'roman-catholic.draft.json',
      display_name: 'Roman Catholic Canon Draft',
      tradition_family: 'western_catholic',
      profile_kind: 'canon_profile_scaffold'
    };
  }

  if (profileFamily === 'eastern_orthodox') {
    return {
      key: 'eastern_orthodox',
      filename: 'eastern-orthodox.draft.json',
      display_name: 'Eastern Orthodox Canon / Anagignoskomena Draft',
      tradition_family: 'eastern_orthodox',
      profile_kind: 'canon_profile_scaffold'
    };
  }

  return {
    key: 'study_witness',
    filename: 'study-witness.draft.json',
    display_name: 'Study Witness / Non-Profile Witness Draft',
    tradition_family: 'cross_tradition',
    profile_kind: 'witness_profile_scaffold'
  };
}

function makeEntry(row, hint) {
  return {
    order: null,
    identity_id: row.identity_id,
    base_work_id: row.base_work_id || row.identity_id,
    text_form_id: row.text_form_id,
    source_path: row.source_path,
    preferred_title: row.preferred_title,
    work_type: row.work_type,
    canonical_status: hint.canonical_status,
    use_class: hint.use_class,
    ordinary_chapter_verse_resolver_candidate: row.ordinary_chapter_verse_resolver_candidate,
    adapter_required: row.adapter_required || null,
    notes: row.notes || []
  };
}

const identities = readJson(identityPath);
const rows = Array.isArray(identities.adjudications) ? identities.adjudications : [];
const profiles = new Map();

for (const row of rows) {
  for (const hint of row.profile_hints || []) {
    const meta = profileForHint(hint.profile_family);
    if (!profiles.has(meta.key)) {
      profiles.set(meta.key, {
        schema: 'universal_office_bible_canon_profile_draft_v1',
        status: 'draft_incomplete_scaffold',
        completeness: 'incomplete_tranche_1_identity_adjudications_only',
        generated_at: null,
        profile_key: meta.key,
        display_name: meta.display_name,
        tradition_family: meta.tradition_family,
        profile_kind: meta.profile_kind,
        rule: 'This is a canon/witness profile scaffold. It is not a final full canon and does not change resolver runtime behavior.',
        entries: []
      });
    }

    profiles.get(meta.key).entries.push(makeEntry(row, hint));
  }
}

ensureDir(outDir);

const writtenProfiles = [];

for (const [key, profile] of profiles.entries()) {
  profile.entries.sort((a, b) => {
    const t = String(a.preferred_title).localeCompare(String(b.preferred_title));
    if (t !== 0) return t;
    return String(a.text_form_id).localeCompare(String(b.text_form_id));
  });

  const meta = profileForHint(
    key === 'ethiopian_orthodox_broader' ? 'ethiopian_orthodox' :
    key === 'roman_catholic' ? 'catholic' :
    key === 'eastern_orthodox' ? 'eastern_orthodox' :
    'default'
  );

  const outPath = path.join(outDir, meta.filename).replaceAll(path.sep, '/');
  profile.generated_at = stableGeneratedAt(outPath);
  fs.writeFileSync(outPath, JSON.stringify(profile, null, 2) + '\n');

  writtenProfiles.push({
    profile_key: profile.profile_key,
    display_name: profile.display_name,
    path: outPath,
    entry_count: profile.entries.length,
    status: profile.status,
    completeness: profile.completeness
  });
}

const index = {
  schema: 'universal_office_bible_canon_profile_index_draft_v1',
  status: 'draft',
  generated_at: stableGeneratedAt(path.join(outDir, 'index.draft.json')),
  rule: 'Profile files listed here are incomplete scaffolds unless explicitly promoted later.',
  profiles: writtenProfiles.sort((a, b) => a.profile_key.localeCompare(b.profile_key))
};

fs.writeFileSync(path.join(outDir, 'index.draft.json'), JSON.stringify(index, null, 2) + '\n');

console.log(JSON.stringify({
  result: 'OK',
  profileCount: writtenProfiles.length,
  profiles: writtenProfiles
}, null, 2));
console.log('ALL PASSED');
console.log('NEXT: run npm run audit:bible-registry-canon-profile-scaffolds');
