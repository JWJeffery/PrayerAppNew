#!/usr/bin/env node
import fs from 'node:fs';

const governancePath = "data/bible/registry/deuterocanon-remaining-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";

const failures = [];
const governance = JSON.parse(fs.readFileSync(governancePath, 'utf8'));
const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));

if (governance.schema !== 'deuterocanon-remaining-governance-v1') {
  failures.push({ type: 'schema-mismatch' });
}

if (governance.status !== 'not_trusted_remaining_deuterocanon_governed') {
  failures.push({ type: 'status-mismatch', actual: governance.status });
}

for (const key of ['estherGK', 'danielGK']) {
  const book = governance.inspectedGreekBooks?.[key];

  if (!book) {
    failures.push({ type: 'missing-greek-book-governance', key });
    continue;
  }

  if (!String(book.decision || '').startsWith('governance_only')) {
    failures.push({ type: 'unsafe-greek-book-decision', key, decision: book.decision });
  }

  if (book.sourceShapeReview?.status !== 'review_completed_governance_only_no_text_mutation') {
    failures.push({
      type: 'missing-source-shape-review',
      key,
      actual: book.sourceShapeReview?.status || null
    });
  }
}

const esther = governance.inspectedGreekBooks?.estherGK;
if (esther?.formPolicy?.status !== 'active_nrsv_addition_form_governed_no_text_mutation') {
  failures.push({ type: 'missing-greek-esther-form-policy', actual: esther?.formPolicy?.status || null });
}
if (esther?.activeForm !== 'nrsv_named_additions_plus_ordinary_esther_chapters') {
  failures.push({ type: 'greek-esther-active-form-mismatch', actual: esther?.activeForm || null });
}
for (const blocked of [
  'drb_numbered_extension_chapter_overlay',
  'ordinary_esther_chapter_only_promotion',
  'nabre_row_grid_overlay',
  'addition_letter_to_numbered_chapter_rewrite_without_migration_policy'
]) {
  if (!Array.isArray(esther?.formPolicy?.blockedTransforms) || !esther.formPolicy.blockedTransforms.includes(blocked)) {
    failures.push({ type: 'missing-greek-esther-blocked-transform', blocked });
  }
}

const daniel = governance.inspectedGreekBooks?.danielGK;
if (daniel?.formPolicy?.status !== 'active_nrsv_extended_daniel_form_governed_no_text_mutation') {
  failures.push({ type: 'missing-greek-daniel-form-policy', actual: daniel?.formPolicy?.status || null });
}
if (daniel?.activeForm !== 'nrsv_extended_daniel_single_book_chapters_1_14') {
  failures.push({ type: 'greek-daniel-active-form-mismatch', actual: daniel?.activeForm || null });
}
for (const blocked of [
  'drb_numbered_extension_chapter_overlay',
  'nabre_row_grid_overlay',
  'split_additions_into_separate_books_without_migration_policy',
  'chapter_3_addition_extraction_without_variant_policy',
  'susanna_bel_dragon_chapter_rewrite_without_migration_policy'
]) {
  if (!Array.isArray(daniel?.formPolicy?.blockedTransforms) || !daniel.formPolicy.blockedTransforms.includes(blocked)) {
    failures.push({ type: 'missing-greek-daniel-blocked-transform', blocked });
  }
}

for (const key of ['3maccabees', '4maccabees']) {
  const book = governance.inspectedMaccabees?.[key];
  if (!book) {
    failures.push({ type: 'missing-maccabees-governance', key });
    continue;
  }

  if (!String(book.decision || '').startsWith('source_backed_repaired')) {
    failures.push({ type: 'unsafe-maccabees-decision', key, decision: book.decision });
  }

  if (book.sourceWitness !== 'BibleGateway NRSVA') {
    failures.push({ type: 'maccabees-source-witness-mismatch', key, actual: book.sourceWitness || null });
  }

  if (book.repairStatus !== 'source_backed_repaired') {
    failures.push({ type: 'maccabees-repair-status-mismatch', key, actual: book.repairStatus || null });
  }
}

const fourMacc = governance.inspectedMaccabees?.['4maccabees'];
if (fourMacc?.knownSourceGapPolicy?.status !== 'variant_footnote_governed_no_active_row_insert') {
  failures.push({
    type: 'missing-4maccabees-known-source-gap-policy',
    actual: fourMacc?.knownSourceGapPolicy?.status || null
  });
}

for (const ref of ['10:4', '11:7', '11:8']) {
  if (!Array.isArray(fourMacc?.knownSourceGapPolicy?.refs) || !fourMacc.knownSourceGapPolicy.refs.includes(ref)) {
    failures.push({ type: 'missing-4maccabees-known-source-gap-ref', ref });
  }
}

for (const blocked of [
  'greek_esther_simple_overlay',
  'greek_daniel_simple_overlay',
  'greek_esther_drb_numbered_extension_overlay',
  'greek_esther_nabre_row_grid_overlay',
  'greek_esther_addition_form_rewrite_without_migration_policy',
  'greek_daniel_drb_numbered_extension_overlay',
  'greek_daniel_nabre_row_grid_overlay',
  'greek_daniel_addition_split_without_migration_policy',
  'greek_daniel_chapter_3_addition_extraction_without_variant_policy',
  '3maccabees_active_sparse_promotion',
  '4maccabees_active_sparse_promotion',
  'greek_esther_drb_full_overlay_without_form_policy',
  'greek_daniel_drb_full_overlay_without_form_policy',
  'ordinary_esther_promotion_to_greek_esther',
  'ordinary_daniel_promotion_to_greek_daniel',
  '3maccabees_claim_complete_without_source_witness',
  '4maccabees_claim_complete_without_source_gap_policy',
  '4maccabees_10_4_active_insert_without_variant_policy',
  '4maccabees_11_7_8_active_insert_without_variant_policy'
]) {
  if (!Array.isArray(governance.blockedPatches) || !governance.blockedPatches.includes(blocked)) {
    failures.push({ type: 'missing-blocked-patch', blocked });
  }
}

const lane = status.lanes?.deuterocanon;
const allowedLaneStatuses = [
  'not_trusted_deuterocanon_policy_closed_text_trust_blocked',
  'certified_textually_trusted_deuterocanon_with_governed_boundaries'
];

if (!lane || !allowedLaneStatuses.includes(lane.status)) {
  failures.push({ type: 'deuterocanon-trust-status-mismatch', actual: lane?.status || null });
}

if (lane?.status === 'certified_textually_trusted_deuterocanon_with_governed_boundaries') {
  if (lane.certificationRecord !== 'data/bible/registry/deuterocanon-text-trust-certification-2026-07-04.json') {
    failures.push({ type: 'missing-deuterocanon-certification-record', actual: lane.certificationRecord || null });
  }

  if (!Array.isArray(lane.completedRemediations) || !lane.completedRemediations.includes('deuterocanon_text_trust_certification_2026_07_04')) {
    failures.push({ type: 'missing-deuterocanon-certification-marker' });
  }
}

for (const marker of [
  'deuterocanon_remaining_governance_1',
  'greek_esther_daniel_source_shape_review_1',
  'greek_esther_form_policy_1',
  'greek_daniel_form_policy_1',
  'maccabees_3_4_source_backed_repair_recognized_1',
  'maccabees_4_variant_footnote_gap_policy_1'
]) {
  if (!Array.isArray(lane?.completedRemediations) || !lane.completedRemediations.includes(marker)) {
    failures.push({ type: 'missing-completed-remediation-marker', marker });
  }
}

const report = {
  audit: 'deuterocanon-remaining-governance',
  status: failures.length ? 'failed' : 'passed',
  greekBooks: governance.inspectedGreekBooks,
  maccabees: governance.inspectedMaccabees,
  failures
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review deuterocanon remaining governance failures.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Deuterocanon remaining unresolved lanes are governed.');
}
