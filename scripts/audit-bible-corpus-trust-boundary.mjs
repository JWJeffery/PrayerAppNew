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
  checks.topLevelStatus = status.status;

  const requiredLanes = [
    'canonical_nt',
    'canonical_ot',
    'psalms',
    'deuterocanon',
    'broader_canon',
    'vulgate',
  ];

  for (const lane of requiredLanes) {
    if (!status.lanes || !status.lanes[lane]) {
      failures.push({ type: 'missing-lane', lane });
    }
  }

  const mustNotBeTrusted = [
    'canonical_ot',
    'psalms',
    'deuterocanon',
    'broader_canon',
  ];

  for (const lane of mustNotBeTrusted) {
    const laneStatus = status.lanes?.[lane]?.status || '';
    checks[`${lane}_status`] = laneStatus;
    if (/trusted|complete|clean|ok/i.test(laneStatus) && !/^not_trusted/i.test(laneStatus)) {
      failures.push({
        type: 'unsafe-trust-claim',
        lane,
        status: laneStatus,
      });
    }
  }

  const ntStatus = status.lanes?.canonical_nt?.status || '';
  checks.canonical_nt_status = ntStatus;
  if (ntStatus !== 'named_defect_tranche_complete') {
    failures.push({
      type: 'unexpected-nt-status',
      expected: 'named_defect_tranche_complete',
      actual: ntStatus,
    });
  }

  const vulgateStatus = status.lanes?.vulgate?.status || '';
  checks.vulgate_status = vulgateStatus;
  if (vulgateStatus !== 'excluded_active_work') {
    failures.push({
      type: 'unexpected-vulgate-status',
      expected: 'excluded_active_work',
      actual: vulgateStatus,
    });
  }

  const forbidden = status.forbiddenClaims || [];
  for (const claim of [
    'whole_bible_corpus_clean',
    'entire_biblical_corpus_trusted',
    'ot_textually_ok',
    'deuterocanon_complete',
    'psalms_normalized',
    'broader_canon_complete',
  ]) {
    if (!forbidden.includes(claim)) {
      failures.push({ type: 'missing-forbidden-claim', claim });
    }
  }
}

const activeBoundary = runNode('scripts/audit-bible-active-corpus-boundary.mjs');
const schemaContainer = runNode('scripts/audit-bible-schema-container-contract.mjs');
const namedDefects = runNode('scripts/audit-bible-canonical-nt-named-defects.mjs');

checks.activeBoundary = activeBoundary;
checks.schemaContainer = schemaContainer;
checks.namedDefects = namedDefects;

for (const [name, result] of Object.entries({
  activeBoundary,
  schemaContainer,
  namedDefects,
})) {
  if (result.returncode !== 0 || !result.stdout.includes('ALL PASSED')) {
    failures.push({ type: 'required-audit-failed', audit: name });
  }
}

const protectedStatus = run([
  'git',
  'status',
  '--short',
  '--untracked-files=all',
  '--',
  'data/bible/translations/vulgate-clementine',
  'data/bible/translations/vulgate-psalter',
  'scripts/import-roman-breviary-1960-catholicbible-vulgate-pilot.mjs',
]);

const report = {
  audit: 'bible-corpus-trust-boundary',
  status: failures.length ? 'failed' : 'passed',
  note: 'Passing means the repo has an explicit trust boundary. It does not mean the whole biblical corpus is textually clean.',
  checks,
  failures,
  protectedVulgateStatusLineCount: protectedStatus.stdout.length,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review trust-boundary failures. Do not claim whole-corpus trust.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Whole-corpus trust boundary is active; proceed to OT/deuterocanon/Psalms remediation planning.');
}
