#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";

function git(args) {
  return spawnSync('git', args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 30 });
}

function broaderCandidates() {
  const canonicalOt = new Set([
    'genesis','exodus','leviticus','numbers','deuteronomy','joshua','judges','ruth',
    '1samuel','2samuel','1kings','2kings','1chronicles','2chronicles','ezra','nehemiah',
    'esther','job','psalms','proverbs','ecclesiastes','songofsolomon','isaiah','jeremiah',
    'lamentations','ezekiel','daniel','hosea','joel','amos','obadiah','jonah','micah',
    'nahum','habakkuk','zephaniah','haggai','zechariah','malachi'
  ]);

  const nt = new Set([
    'matthew','mark','luke','john','acts','romans','1corinthians','2corinthians','galatians',
    'ephesians','philippians','colossians','1thessalonians','2thessalonians','1timothy',
    '2timothy','titus','philemon','hebrews','james','1peter','2peter','1john','2john',
    '3john','jude','revelation'
  ]);

  const deuterocanonGoverned = new Set([
    'tobit','judith','wisdom','sirach','baruch','letterofjeremiah','1maccabees','2maccabees',
    '3maccabees','4maccabees','danielGK','estherGK','prayerofmanasseh','1esdras','2esdras'
  ]);

  const allBibleJson = git(['ls-files', 'data/bible']).stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .filter(p => p.endsWith('.json'))
    .filter(p => !p.includes('/translations/'))
    .filter(p => !p.includes('/registry/'));

  const candidates = [];

  for (const path of allBibleJson) {
    const parts = path.split('/');
    const file = parts[parts.length - 1].replace(/\.json$/, '');
    const bucket = parts[2] || '';

    const isCanonicalOt = bucket === 'OT' && canonicalOt.has(file);
    const isNt = bucket === 'NT' && nt.has(file);
    const isGovernedDeutero = bucket === 'OT' && deuterocanonGoverned.has(file);

    if (!isCanonicalOt && !isNt && !isGovernedDeutero) candidates.push(path);
  }

  return candidates.sort();
}

const failures = [];
const governance = JSON.parse(fs.readFileSync(governancePath, 'utf8'));
const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
const actualCandidates = broaderCandidates();

if (governance.schema !== 'broader-canon-governance-v1') {
  failures.push({ type: 'schema-mismatch' });
}

if (governance.status !== 'not_trusted_broader_canon_governed') {
  failures.push({ type: 'governance-status-mismatch', actual: governance.status });
}

if (governance.candidateCount !== governance.candidatePaths.length) {
  failures.push({ type: 'candidate-count-self-mismatch' });
}

if (governance.candidatePaths.join('\n') !== actualCandidates.join('\n')) {
  failures.push({
    type: 'candidate-paths-changed',
    expectedCount: governance.candidatePaths.length,
    actualCount: actualCandidates.length,
    added: actualCandidates.filter(x => !governance.candidatePaths.includes(x)).slice(0, 20),
    removed: governance.candidatePaths.filter(x => !actualCandidates.includes(x)).slice(0, 20)
  });
}

for (const blocked of [
  'broader_canon_complete',
  'broader_canon_textually_trusted',
  'broader_canon_normalized',
  'zero_row_files_complete',
  'raw_text_files_source_verified'
]) {
  if (!Array.isArray(governance.blockedClaims) || !governance.blockedClaims.includes(blocked)) {
    failures.push({ type: 'missing-blocked-claim', blocked });
  }
}

const lane = status.lanes?.broader_canon;
if (!lane || lane.status !== 'not_trusted_broader_canon_policy_closed_text_trust_blocked') {
  failures.push({ type: 'broader-canon-status-mismatch', actual: lane?.status || null });
}

if (!Array.isArray(lane?.completedRemediations) || !lane.completedRemediations.includes('broader_canon_governance_1')) {
  failures.push({ type: 'missing-completed-remediation-marker' });
}

const report = {
  audit: 'broader-canon-governance',
  status: failures.length ? 'failed' : 'passed',
  candidateCount: governance.candidateCount,
  zeroRowCount: governance.zeroRowPaths.length,
  rawTextOnlyCount: governance.rawTextOnlyPaths.length,
  failures
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review broader-canon governance failures.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Broader canon raw corpus is governed and remains not trusted.');
}
