#!/usr/bin/env node
import fs from 'node:fs';

const statusPath = 'data/bible/registry/judith-text-trust-status.json';
const resultPath = 'data/bible/registry/judith-bound-source-exact-collation-result.json';
const reportPath = process.env.JUDITH_TEXT_TRUST_STATUS_REPORT || null;
const failures = [];
function read(path) {
  try { return JSON.parse(fs.readFileSync(path, 'utf8')); }
  catch (error) { failures.push({ type: 'read-failed', path, error: String(error.message || error) }); return null; }
}
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures.push({ type: 'check-failed', label, actual, expected });
  return { label, actual, expected, status: ok ? 'passed' : 'failed' };
}
const status = read(statusPath);
const result = read(resultPath);
const checks = [];
if (status && result) {
  checks.push(check('status.schema', status.schema, 'judith-text-trust-status-v1'));
  checks.push(check('status.status', status.status, 'partial_trust_ready_nrsv_unresolved'));
  checks.push(check('status.activeRows', status.activeRows, 359));
  checks.push(check('result.status', result.status, 'partial_pass_kjv_nabre_drb_exact_nrsv_unresolved'));
  checks.push(check('result.KJV', result.trustedScopes?.KJV?.status, 'trusted_exact_source_collated_source_address_policy'));
  checks.push(check('result.NABRE', result.trustedScopes?.NABRE?.status, 'trusted_exact_source_collated_source_address_policy'));
  checks.push(check('result.DRB', result.trustedScopes?.DRB?.status, 'trusted_exact_source_collated'));
  checks.push(check('result.KJV.rows', result.trustedScopes?.KJV?.activeRows, 339));
  checks.push(check('result.NABRE.rows', result.trustedScopes?.NABRE?.activeRows, 340));
  checks.push(check('result.DRB.rows', result.trustedScopes?.DRB?.activeRows, 346));
  checks.push(check('status.KJV', status.trustedClaims?.KJV, 'trusted_exact_source_collated_source_address_policy'));
  checks.push(check('status.NABRE', status.trustedClaims?.NABRE, 'trusted_exact_source_collated_source_address_policy'));
  checks.push(check('status.DRB', status.trustedClaims?.DRB, 'trusted_exact_source_collated'));
  checks.push(check('status.NRSV', status.blockedClaims?.NRSV?.status, 'blocked_pending_approved_source_witness_or_policy'));
  checks.push(check('status.NRSV.rows', status.blockedClaims?.NRSV?.activeRows, 147));
  checks.push(check('status.fullJudithAllLanes', status.blockedClaims?.fullJudithAllLanes?.status, 'blocked_by_nrsv_resolution'));
}
const report = {
  audit: 'judith-text-trust-status',
  status: failures.length ? 'failed' : 'passed',
  bibleTextMutation: false,
  scope: 'Validate Judith partial text trust status after strict source collation.',
  statusPath,
  resultPath,
  checks,
  failures
};
if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Judith text trust status audit failed. Review failures.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Judith partial trust boundary is recorded. Keep full Judith trust blocked pending NRSV resolution.');
}
