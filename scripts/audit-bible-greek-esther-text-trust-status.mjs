#!/usr/bin/env node
import fs from 'node:fs';

const statusPath = 'data/bible/registry/greek-esther-text-trust-status.json';
const bindingPath = 'data/bible/registry/greek-additions-source-witness-binding.json';
const reportPath = process.env.GREEK_ESTHER_TEXT_TRUST_STATUS_REPORT || null;
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
  checks.push(check('status.schema', status.schema, 'greek-esther-text-trust-status-v1'));
  checks.push(check('status.status', status.status, 'partial_trust_ready_nrsv_blocked'));
  checks.push(check('status.activeRows', status.activeRows, 272));
  checks.push(check('ordinaryKJV', status.trustedClaims?.ordinaryKJV?.status, 'trusted_exact_source_collated'));
  checks.push(check('ordinaryNABRE', status.trustedClaims?.ordinaryNABRE?.status, 'trusted_exact_source_collated'));
  checks.push(check('ordinaryAndAdditionDRB', status.trustedClaims?.ordinaryAndAdditionDRB?.status, 'trusted_exact_source_collated_source_address_policy'));
  checks.push(check('activeNRSV', status.blockedClaims?.activeNRSV?.status, 'blocked_pending_approved_source_witness'));
  checks.push(check('fullGreekEstherAllLanes', status.blockedClaims?.fullGreekEstherAllLanes?.status, 'blocked_by_nrsv_source_absence'));
  checks.push(check('binding.status', binding.status, 'source_witnesses_bound_partial_text_collation_complete_nrsv_external_source_required'));
  checks.push(check('binding.estherGK.rows', binding.activeFiles?.estherGK?.activeRows, 272));
  checks.push(check('binding.estherGK.status', binding.activeFiles?.estherGK?.status, 'partial_text_collation_complete_nrsv_blocked'));
  checks.push(check('binding.KJV', binding.sourceWitnesses?.estherGK?.KJV?.status, 'ordinary_lanes_exact_source_collated'));
  checks.push(check('binding.NABRE', binding.sourceWitnesses?.estherGK?.NABRE?.status, 'ordinary_lanes_exact_source_collated'));
  checks.push(check('binding.DRB', binding.sourceWitnesses?.estherGK?.DRB?.status, 'ordinary_and_addition_lanes_exact_source_collated'));
  checks.push(check('binding.NRSV', binding.sourceWitnesses?.estherGK?.NRSV?.status, 'active_text_unverified_pending_approved_source_witness'));
}

const report = {
  audit: 'greek-esther-text-trust-status',
  status: failures.length ? 'failed' : 'passed',
  bibleTextMutation: false,
  scope: 'Validate Greek Esther text trust status and source-witness binding boundary.',
  statusPath,
  bindingPath,
  checks,
  failures
};

if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Greek Esther status boundary audit failed. Review failures before proceeding.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Greek Esther partial trust boundary is recorded. Proceed to NRSV source acquisition/status or broader non-Protestant canon status update.');
}
