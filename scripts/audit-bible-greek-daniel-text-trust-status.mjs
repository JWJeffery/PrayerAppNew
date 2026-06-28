#!/usr/bin/env node
import fs from 'node:fs';

const statusPath = 'data/bible/registry/greek-daniel-text-trust-status.json';
const bindingPath = 'data/bible/registry/greek-additions-source-witness-binding.json';
const reportPath = process.env.GREEK_DANIEL_TEXT_TRUST_STATUS_REPORT || null;
const failures = [];

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    failures.push({ type: 'read-json-failed', path, error: String(error.message || error) });
    return null;
  }
}

function check(label, actual, expected) {
  const passed = actual === expected;
  if (!passed) failures.push({ type: 'check-failed', label, expected, actual });
  return { label, expected, actual, status: passed ? 'passed' : 'failed' };
}

const status = readJson(statusPath);
const binding = readJson(bindingPath);
const checks = [];

if (status && binding) {
  checks.push(check('status.schema', status.schema, 'greek-daniel-text-trust-status-v1'));
  checks.push(check('status.status', status.status, 'partial_trust_ready_nrsv_additions_blocked'));
  checks.push(check('status.activeRows', status.activeRows, 531));
  checks.push(check('ordinaryDanielNRSV', status.trustedClaims?.ordinaryDanielNRSV?.status, 'trusted_internal_baseline'));
  checks.push(check('additionKJV', status.trustedClaims?.additionKJV?.status, 'trusted_exact_source_collated'));
  checks.push(check('additionNABRE', status.trustedClaims?.additionNABRE?.status, 'trusted_exact_source_collated'));
  checks.push(check('additionDRB', status.trustedClaims?.additionDRB?.status, 'trusted_exact_source_collated_source_address_policy'));
  checks.push(check('additionNRSV', status.blockedClaims?.additionNRSV?.status, 'blocked_pending_approved_source_witness'));
  checks.push(check('fullGreekDanielAllLanes', status.blockedClaims?.fullGreekDanielAllLanes?.status, 'blocked_by_nrsv_additions'));
  checks.push(check('binding.status', binding.status, 'source_witnesses_bound_partial_text_collation_complete_nrsv_external_source_required'));
  checks.push(check('binding.danielGK.rows', binding.activeFiles?.danielGK?.activeRows, 531));
  checks.push(check('binding.KJV', binding.sourceWitnesses?.danielGK?.KJV?.status, 'addition_lanes_exact_source_collated'));
  checks.push(check('binding.NABRE', binding.sourceWitnesses?.danielGK?.NABRE?.status, 'addition_lanes_exact_source_collated'));
  checks.push(check('binding.DRB', binding.sourceWitnesses?.danielGK?.DRB?.status, 'addition_lanes_exact_source_collated'));
  checks.push(check('binding.NRSV', binding.sourceWitnesses?.danielGK?.NRSV?.status, 'ordinary_daniel_internal_baseline_passed_additions_blocked_pending_approved_source'));
}

const report = {
  audit: 'greek-daniel-text-trust-status',
  status: failures.length ? 'failed' : 'passed',
  bibleTextMutation: false,
  scope: 'Validate Greek Daniel text trust status and source-witness binding boundary.',
  statusPath,
  bindingPath,
  checks,
  failures
};

if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Greek Daniel status boundary audit failed. Review failures before proceeding.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Greek Daniel partial trust boundary is recorded. Proceed to NRSV additions source acquisition or Greek Esther source mapping.');
}
