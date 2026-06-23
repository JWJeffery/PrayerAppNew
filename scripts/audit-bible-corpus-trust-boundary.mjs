#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const statusPath = path.join(root, 'data/bible/registry/bible-corpus-trust-status.json');

function run(args) {
  const p = spawnSync(args[0], args.slice(1), { cwd: root, encoding: 'utf8' });
  return {
    returncode: p.status,
    stdout: (p.stdout || '').split(/\r?\n/).filter(Boolean),
    stderr: (p.stderr || '').split(/\r?\n/).filter(Boolean),
  };
}

function runNode(script) {
  const full = path.join(root, script);
  if (!fs.existsSync(full)) {
    return { returncode: 127, stdout: [], stderr: [`missing ${script}`] };
  }
  return run(['node', script]);
}

const failures = [];
const checks = {};

let status = null;
try {
  status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
} catch (error) {
  failures.push({ type: 'missing-or-invalid-status-file', file: statusPath, error: String(error.message || error) });
}

if (status) {
  const requiredLanes = ['canonical_nt', 'canonical_ot', 'psalms', 'deuterocanon', 'broader_canon', 'vulgate'];

  for (const lane of requiredLanes) {
    const laneStatus = status.lanes?.[lane]?.status || null;
    checks[`${lane}_status`] = laneStatus;
    if (!laneStatus) failures.push({ type: 'missing-lane', lane });
  }

  for (const lane of ['canonical_ot', 'psalms', 'deuterocanon', 'broader_canon']) {
    const laneStatus = status.lanes?.[lane]?.status || '';
    if (!laneStatus.startsWith('not_trusted')) {
      failures.push({ type: 'unsafe-trust-claim', lane, status: laneStatus });
    }
  }

  if (status.lanes?.canonical_nt?.status !== 'named_defect_tranche_complete') {
    failures.push({ type: 'unexpected-nt-status', actual: status.lanes?.canonical_nt?.status || null });
  }

  const vulgateStatus = status.lanes?.vulgate?.status || '';
  checks.vulgate_status = vulgateStatus;
  if (vulgateStatus !== 'excluded_active_work' && !vulgateStatus.startsWith('not_trusted')) {
    failures.push({ type: 'unsafe-vulgate-status', actual: status.lanes?.vulgate?.status || null });
  }

  for (const claim of [
    'whole_bible_corpus_clean',
    'entire_biblical_corpus_trusted',
    'ot_textually_ok',
    'deuterocanon_complete',
    'psalms_normalized',
    'broader_canon_complete'
  ]) {
    if (!status.forbiddenClaims?.includes(claim)) {
      failures.push({ type: 'missing-forbidden-claim', claim });
    }
  }
}

const activeBoundary = runNode('scripts/audit-bible-active-corpus-boundary.mjs');
const schemaContainer = runNode('scripts/audit-bible-schema-container-contract.mjs');
const namedDefects = runNode('scripts/audit-bible-canonical-nt-named-defects.mjs');

checks.activeBoundaryPassed = activeBoundary.returncode === 0 && activeBoundary.stdout.includes('ALL PASSED');
checks.schemaContainerPassed = schemaContainer.returncode === 0 && schemaContainer.stdout.includes('ALL PASSED');
checks.namedDefectsPassed = namedDefects.returncode === 0 && namedDefects.stdout.includes('ALL PASSED');

for (const [name, passed] of Object.entries({
  activeBoundary: checks.activeBoundaryPassed,
  schemaContainer: checks.schemaContainerPassed,
  namedDefects: checks.namedDefectsPassed
})) {
  if (!passed) failures.push({ type: 'required-audit-failed', audit: name });
}

const protectedStatus = run([
  'git',
  'status',
  '--short',
  '--untracked-files=all',
  '--',
  'data/bible/translations/vulgate-clementine',
  'data/bible/translations/vulgate-psalter',
  'scripts/import-roman-breviary-1960-catholicbible-vulgate-pilot.mjs'
]);

const report = {
  audit: 'bible-corpus-trust-boundary',
  status: failures.length ? 'failed' : 'passed',
  note: 'Passing means the repo has an explicit trust boundary. It does not mean the whole biblical corpus is textually clean.',
  checks,
  failures,
  protectedVulgateStatusLineCount: protectedStatus.stdout.length
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review trust-boundary failures. Do not claim whole-corpus trust.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Whole-corpus trust boundary is active; proceed to OT/deuterocanon/Psalms remediation planning.');
}
