#!/usr/bin/env node
import fs from 'node:fs';

const statusPath = 'data/bible/registry/nonprotestant-canon-current-text-trust-status.json';
const decisionPath = 'data/bible/registry/nonprotestant-canon-text-trust-decision.json';
const estherStatusPath = 'data/bible/registry/greek-esther-text-trust-status.json';
const danielStatusPath = 'data/bible/registry/greek-daniel-text-trust-status.json';
const tobitStatusPath = 'data/bible/registry/tobit-text-trust-status.json';
const reportPath = process.env.NONPROTESTANT_CANON_CURRENT_TEXT_TRUST_STATUS_REPORT || null;
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

function includes(label, values, expectedValue) {
  const passed = Array.isArray(values) && values.includes(expectedValue);
  if (!passed) failures.push({ type: 'missing-required-value', label, expectedValue, actual: values });
  return { label, expectedValue, status: passed ? 'passed' : 'failed' };
}

const status = readJson(statusPath);
const decision = readJson(decisionPath);
const esther = readJson(estherStatusPath);
const daniel = readJson(danielStatusPath);
const tobit = readJson(tobitStatusPath);
const checks = [];

if (status && decision && esther && daniel && tobit) {
  checks.push(check('status.schema', status.schema, 'nonprotestant-canon-current-text-trust-status-v1'));
  checks.push(check('status.status', status.status, 'not_trust_ready_partial_greek_additions_and_tobit_progress'));
  checks.push(check('decision.status', decision.status, 'accepted'));
  checks.push(includes('decision.blockedClaimsUntilMatrixPasses', decision.blockedClaimsUntilMatrixPasses, 'deuterocanon_complete'));
  checks.push(includes('decision.blockedClaimsUntilMatrixPasses', decision.blockedClaimsUntilMatrixPasses, 'nonprotestant_canon_textually_trusted'));
  checks.push(includes('status.blockedGlobalClaimsStillActive', status.blockedGlobalClaimsStillActive, 'entire_biblical_corpus_trusted'));
  checks.push(check('esther.statusRecord', esther.status, 'partial_trust_ready_nrsv_blocked'));
  checks.push(check('daniel.statusRecord', daniel.status, 'partial_trust_ready_nrsv_additions_blocked'));
  checks.push(check('tobit.statusRecord', tobit.status, 'partial_trust_ready_nrsv_rawtext_unresolved'));
  checks.push(check('status.esther.activeRows', status.greekAdditionsProgress?.estherGK?.activeRows, 272));
  checks.push(check('status.daniel.activeRows', status.greekAdditionsProgress?.danielGK?.activeRows, 531));
  checks.push(check('status.tobit.activeRows', status.deuterocanonProgress?.tobit?.activeRows, 299));
  checks.push(check('status.esther.status', status.greekAdditionsProgress?.estherGK?.status, 'partial_trust_ready_nrsv_blocked'));
  checks.push(check('status.daniel.status', status.greekAdditionsProgress?.danielGK?.status, 'partial_trust_ready_nrsv_additions_blocked'));
  checks.push(check('status.tobit.status', status.deuterocanonProgress?.tobit?.status, 'partial_trust_ready_nrsv_rawtext_unresolved'));
  checks.push(check('status.matrixStalenessNotice.status', status.matrixStalenessNotice?.status, 'prior_matrix_stale_for_greek_additions_and_tobit'));
  checks.push(includes('status.forbiddenClaims', status.forbiddenClaims, 'Non-Protestant canon is textually trusted.'));
  checks.push(includes('status.forbiddenClaims', status.forbiddenClaims, 'Greek Esther NRSV is source-verified.'));
  checks.push(includes('status.forbiddenClaims', status.forbiddenClaims, 'Greek Daniel NRSV additions are source-verified.'));
  checks.push(includes('status.forbiddenClaims', status.forbiddenClaims, 'Tobit is fully trusted.'));
  checks.push(includes('status.forbiddenClaims', status.forbiddenClaims, 'Tobit NRSV is source-verified.'));
  checks.push(includes('status.forbiddenClaims', status.forbiddenClaims, 'Tobit rawText is trusted or classified.'));
}

const report = {
  audit: 'nonprotestant-canon-current-text-trust-status',
  status: failures.length ? 'failed' : 'passed',
  bibleTextMutation: false,
  scope: 'Validate current non-Protestant canon text trust boundary after Greek additions and Tobit progress. This does not regenerate the full collation matrix.',
  statusPath,
  decisionPath,
  estherStatusPath,
  danielStatusPath,
  tobitStatusPath,
  checks,
  failures
};

if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Non-Protestant canon current trust status audit failed. Review failures before proceeding.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Non-Protestant canon remains not globally trusted. Proceed to the next remaining matrix backlog lane or resolve active NRSV/rawText source blocks.');
}
