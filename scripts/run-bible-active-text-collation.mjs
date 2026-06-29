#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { collectActiveTextInventory } from './bible-collation/active-text-inventory.mjs';
import { classifyInventory } from './bible-collation/collation-classifier.mjs';
import { buildCompactReport } from './bible-collation/compact-report.mjs';
import { loadSourceRegistry } from './bible-collation/source-registry.mjs';

function readOutPath(argv) {
  const arg = argv.find(item => item.startsWith('--out='));
  return arg ? arg.slice('--out='.length) : '/tmp/bible-active-text-collation-report.json';
}

const repoRoot = process.cwd();
const outPath = readOutPath(process.argv.slice(2));
const registry = loadSourceRegistry({ repoRoot });
const inventory = collectActiveTextInventory({ repoRoot });
const classified = classifyInventory(inventory, registry);
const compact = buildCompactReport({ inventory, classified, registry });
const fullReport = {
  ...compact,
  reportPathPolicy: 'Full generated reports are runtime artifacts and should remain outside the repository unless explicitly approved.',
  records: classified.records
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(fullReport, null, 2) + '\n', 'utf8');

console.log(JSON.stringify(compact, null, 2));
console.log(`Report written to ${outPath}`);
console.log('Bible text mutated: false');
