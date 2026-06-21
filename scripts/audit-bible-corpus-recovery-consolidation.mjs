#!/usr/bin/env node
import fs from 'node:fs';

const consolidationPath = "data/bible/registry/bible-corpus-recovery-consolidation.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";

const consolidation = JSON.parse(fs.readFileSync(consolidationPath, 'utf8'));
const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));

const failures = [];

if (consolidation.schema !== 'bible-corpus-recovery-consolidation-v1') {
  failures.push({ type: 'schema-mismatch' });
}

if (consolidation.status !== 'consolidated_not_globally_trusted') {
  failures.push({ type: 'unsafe-consolidation-status', actual: consolidation.status });
}

for (const [lane, expected] of Object.entries(consolidation.lanes || {})) {
  const actual = status.lanes?.[lane]?.status || null;
  if (actual !== expected.expectedStatus) {
    failures.push({ type: 'lane-status-mismatch', lane, expected: expected.expectedStatus, actual });
  }
}

for (const [lane, markers] of Object.entries(consolidation.requiredMarkers || {})) {
  const actualMarkers = status.lanes?.[lane]?.completedRemediations || [];
  for (const marker of markers) {
    if (!Array.isArray(actualMarkers) || !actualMarkers.includes(marker)) {
      failures.push({ type: 'missing-remediation-marker', lane, marker });
    }
  }
}

for (const blocked of [
  'entire_biblical_corpus_trusted',
  'canonical_ot_fully_trusted',
  'psalms_textually_trusted',
  'deuterocanon_complete',
  'broader_canon_complete',
  'vulgate_remediation_complete'
]) {
  if (!Array.isArray(consolidation.blockedClaims) || !consolidation.blockedClaims.includes(blocked)) {
    failures.push({ type: 'missing-blocked-claim', blocked });
  }
}

const unsafeTrusted = Object.entries(status.lanes || {}).filter(([lane, info]) => {
  if (lane === 'canonical_nt') return false;
  return typeof info?.status === 'string' && !info.status.startsWith('not_trusted') && info.status !== 'excluded_active_work';
});

if (unsafeTrusted.length) {
  failures.push({ type: 'unsafe-non-nt-trust-status', lanes: unsafeTrusted.map(([lane, info]) => ({ lane, status: info.status })) });
}

const report = {
  audit: 'bible-corpus-recovery-consolidation',
  status: failures.length ? 'failed' : 'passed',
  laneStatuses: Object.fromEntries(Object.entries(status.lanes || {}).map(([lane, info]) => [lane, info.status])),
  blockedClaims: consolidation.blockedClaims,
  nextAllowedTargets: consolidation.nextAllowedTargets,
  failures
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review Bible corpus recovery consolidation failures.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Bible corpus recovery state is consolidated; Vulgate active work may resume with protected status checks.');
}
