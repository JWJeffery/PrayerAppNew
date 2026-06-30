#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { runTextRepair } from './bible-repair/text-repair-engine.mjs';

function argValue(args, name) {
  const prefix = `--${name}=`;
  const found = args.find(arg => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function hasFlag(args, name) {
  return args.includes(`--${name}`);
}

function readTargets(args) {
  const targetPath = argValue(args, 'targets');
  if (targetPath) {
    return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  }

  const activePath = argValue(args, 'active');
  const sourcePath = argValue(args, 'source');
  const lane = argValue(args, 'lane');
  const sourceLane = argValue(args, 'source-lane') || 'text';

  if (!activePath || !sourcePath || !lane) {
    throw new Error('Provide --targets=/path/to/targets.json or --active=... --source=... --lane=...');
  }

  return [{
    id: argValue(args, 'id') || `${activePath}:${lane}`,
    activePath,
    sourcePath,
    lane,
    sourceLane,
    deleteOrphaned: hasFlag(args, 'delete-orphaned'),
    includeSourceChapterZero: hasFlag(args, 'include-source-chapter-zero')
  }];
}

const args = process.argv.slice(2);
const outPath = argValue(args, 'out') || '/tmp/bible-text-mass-repair-plan.json';
const apply = hasFlag(args, 'apply');

let report;
try {
  const targets = readTargets(args);
  report = runTextRepair(targets, { repoRoot: process.cwd(), apply });
} catch (error) {
  report = {
    schema: 'bible-text-mass-repair-v1',
    apply,
    bibleTextMutated: false,
    targetCount: 0,
    totals: {
      sourceRefs: 0,
      activeRefs: 0,
      plannedSetText: 0,
      plannedDeleteText: 0,
      appliedSetText: 0,
      appliedDeleteText: 0,
      residualCount: 0,
      failureCount: 1
    },
    targets: [],
    failures: [{ type: 'runner-failed', error: String(error.message || error) }]
  };
  process.exitCode = 1;
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  schema: report.schema,
  apply: report.apply,
  bibleTextMutated: report.bibleTextMutated,
  targetCount: report.targetCount,
  totals: report.totals,
  targetStatuses: report.targets.map(target => ({
    id: target.id,
    status: target.status,
    lane: target.lane,
    sourceRefs: target.sourceRefs,
    activeRefs: target.activeRefs,
    plannedSetText: target.plannedSetText,
    plannedDeleteText: target.plannedDeleteText,
    appliedSetText: target.appliedSetText,
    appliedDeleteText: target.appliedDeleteText,
    residualCount: target.residualCount,
    failureCount: target.failures.length
  })),
  outPath
}, null, 2));

if (report.totals.failureCount > 0) process.exitCode = 1;
