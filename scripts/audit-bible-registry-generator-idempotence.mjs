#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';

const reportPath = process.env.BIBLE_REGISTRY_IDEMPOTENCE_AUDIT_REPORT || `/tmp/prayerappnew_bible_registry_generator_idempotence_audit_${Date.now()}.json`;

const artifactPaths = [
  'data/bible/registry/file-manifest.json',
  'data/bible/registry/book-identities.draft.json',
  'data/bible/registry/adjudication-buckets.json',
  'data/bible/registry/canon-profiles/index.draft.json',
  'data/bible/registry/canon-profiles/eastern-orthodox.draft.json',
  'data/bible/registry/canon-profiles/ethiopian-orthodox-broader.draft.json',
  'data/bible/registry/canon-profiles/roman-catholic.draft.json',
  'data/bible/registry/canon-profiles/study-witness.draft.json',
  'documentation/BIBLE_REGISTRY_ADJUDICATION_PLAN.md'
];

const commands = [
  ['npm', ['run', 'bible:registry:draft']],
  ['npm', ['run', 'bible:registry:adjudication-plan']],
  ['npm', ['run', 'bible:registry:canon-profile-scaffolds']]
];

const failures = [];
const commandSummaries = [];

function hashFile(file) {
  if (!fs.existsSync(file)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function hashAll() {
  return Object.fromEntries(artifactPaths.map(file => [file, hashFile(file)]));
}

const before = hashAll();

for (const [cmd, args] of commands) {
  const run = spawnSync(cmd, args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024
  });

  commandSummaries.push({
    command: [cmd, ...args].join(' '),
    status: run.status,
    stdout_tail: String(run.stdout || '').split('\n').slice(-20).join('\n'),
    stderr_tail: String(run.stderr || '').split('\n').slice(-20).join('\n')
  });

  if (run.status !== 0) {
    failures.push(`command returned ${run.status}: ${cmd} ${args.join(' ')}`);
  }
}

const after = hashAll();
const changedArtifacts = [];

for (const file of artifactPaths) {
  if (before[file] !== after[file]) {
    changedArtifacts.push({
      file,
      before: before[file],
      after: after[file]
    });
  }
}

if (changedArtifacts.length) {
  failures.push(`generator rerun changed ${changedArtifacts.length} registry artifact(s)`);
}

const report = {
  generated_at: new Date().toISOString(),
  result: failures.length ? 'FAIL' : 'OK',
  failure_count: failures.length,
  failures,
  changedArtifacts,
  commandSummaries,
  reportPath
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  failureCount: report.failure_count,
  changedArtifactCount: changedArtifacts.length,
  reportPath
}, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log(`NEXT: inspect ${reportPath}`);
} else {
  console.log('ALL PASSED');
  console.log('NEXT: commit generator idempotence hardening.');
}
