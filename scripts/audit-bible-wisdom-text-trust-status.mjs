#!/usr/bin/env node
import fs from 'node:fs';

const statusPath = 'data/bible/registry/wisdom-text-trust-status.json';
const resultPath = 'data/bible/registry/wisdom-bound-source-exact-collation-result.json';
const reportPath = process.env.WISDOM_TEXT_TRUST_STATUS_REPORT || null;
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
  checks.push(check('status.schema', status.schema, 'wisdom-text-trust-status-v1'));
  checks.push(check('status.status', status.status, 'partial_trust_ready_nrsv_unresolved'));
  checks.push(check('status.activeRows', status.activeRows, 442));
  checks.push(check('result.status', result.status, 'partial_pass_kjv_nabre_drb_exact_nrsv_unresolved'));
  checks.push(check('result.KJV', result.trustedScopes?.KJV?.status, 'trusted_exact_source_collated_source_address_policy'));
  checks.push(check('result.NABRE', result.trustedScopes?.NABRE?.status, 'trusted_exact_source_collated_source_address_policy'));
  checks.push(check('result.DRB', result.trustedScopes?.DRB?.status, 'trusted_exact_source_collated'));
  checks.push(check('result.KJV.rows', result.trustedScopes?.KJV?.activeRows, 436));
  checks.push(check('result.NABRE.rows', result.trustedScopes?.NABRE?.activeRows, 403));
  checks.push(check('result.DRB.rows', result.trustedScopes?.DRB?.activeRows, 439));
  checks.push(check('status.KJV', status.trustedClaims?.KJV, 'trusted_exact_source_collated_source_address_policy'));
  checks.push(check('status.NABRE', status.trustedClaims?.NABRE, 'trusted_exact_source_collated_source_address_policy'));
  checks.push(check('status.DRB', status.trustedClaims?.DRB, 'trusted_exact_source_collated'));
  checks.push(check('status.NRSV', status.unresolved?.NRSV?.status, 'pending_approved_source_witness_or_policy'));
  checks.push(check('status.NRSV.rows', status.unresolved?.NRSV?.activeRows, 115));
  checks.push(check('status.Rotherham.rows', status.unresolved?.Rotherham?.activeRows, 0));
  checks.push(check('status.rawText.rows', status.unresolved?.rawText?.activeRows, 0));
}

const report = {
  audit: 'wisdom-text-trust-status',
  status: failures.length ? 'failed' : 'passed',
  bibleTextMutation: false,
  scope: 'Validate Wisdom partial text trust status after strict source collation.',
  statusPath,
  resultPath,
  checks,
  failures
};

if (reportPath) fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Wisdom text trust status audit failed. Review failures.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Wisdom partial trust boundary is recorded. Keep full Wisdom trust blocked pending NRSV resolution.');
}
