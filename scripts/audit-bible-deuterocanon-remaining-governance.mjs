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

for (const blocked of [
  'greek_esther_simple_overlay',
  'greek_daniel_simple_overlay',
  '3maccabees_active_sparse_promotion',
  '4maccabees_active_sparse_promotion',
  'greek_esther_drb_full_overlay_without_form_policy',
  'greek_daniel_drb_full_overlay_without_form_policy',
  'ordinary_esther_promotion_to_greek_esther',
  'ordinary_daniel_promotion_to_greek_daniel',
  '3maccabees_claim_complete_without_source_witness',
  '4maccabees_claim_complete_without_source_gap_policy'
]) {
  if (!Array.isArray(governance.blockedPatches) || !governance.blockedPatches.includes(blocked)) {
    failures.push({ type: 'missing-blocked-patch', blocked });
  }
}

const lane = status.lanes?.deuterocanon;
if (!lane || lane.status !== 'not_trusted_underbuilt') {
  failures.push({ type: 'deuterocanon-trust-status-mismatch', actual: lane?.status || null });
}

for (const marker of [
  'deuterocanon_remaining_governance_1',
  'greek_esther_daniel_source_shape_review_1'
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
