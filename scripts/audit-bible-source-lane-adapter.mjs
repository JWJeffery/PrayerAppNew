import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const adapter = require('../js/bible-browser/bible-source-lane-adapter.js');

const reportPath = process.env.BIBLE_SOURCE_LANE_ADAPTER_AUDIT_REPORT || '/tmp/bible-source-lane-adapter-audit.json';

const samples = [
  { laneId: 'DRB_ORIGINAL', bookId: 'GENESIS', chapter: 1, verse: 1 },
  { laneId: 'DRB_ORIGINAL', bookId: 'PSALMS', chapter: 23, verse: 1 },
  { laneId: 'DRB_ORIGINAL', bookId: 'MATTHEW', chapter: 1, verse: 1 },
  { laneId: 'DRB_ORIGINAL', bookId: '1_MACCABEES', chapter: 1, verse: 1 },
  { laneId: 'NABRE_INTERNAL', bookId: 'GENESIS', chapter: 1, verse: 1 },
  { laneId: 'NABRE_INTERNAL', bookId: 'PSALMS', chapter: 23, verse: 1 },
  { laneId: 'NABRE_INTERNAL', bookId: 'MATTHEW', chapter: 1, verse: 1 },
  { laneId: 'NABRE_INTERNAL', bookId: '1_MACCABEES', chapter: 1, verse: 1 }
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const report = {
  result: 'OK',
  adapterPath: 'js/bible-browser/bible-source-lane-adapter.js',
  laneCount: adapter.listLanes().length,
  sampleCount: samples.length,
  passCount: 0,
  failCount: 0,
  failures: [],
  samples: []
};

for (const lane of adapter.listLanes()) {
  if (lane.use !== 'internal_bible_browser') {
    report.failures.push(`${lane.id}: use must be internal_bible_browser`);
  }
}

for (const sample of samples) {
  const item = { ...sample, status: 'FAIL', sourcePath: null, textLength: 0, error: null };

  try {
    const resolved = await adapter.resolvePassage(sample, { readJson });
    item.sourcePath = resolved.sourcePath;
    item.textLength = resolved.text.length;

    if (!fs.existsSync(resolved.sourcePath)) {
      item.error = `source path missing: ${resolved.sourcePath}`;
    } else if (!resolved.text || resolved.text.trim().length < 5) {
      item.error = 'resolved text too short';
    } else {
      item.status = 'PASS';
    }
  } catch (error) {
    item.error = error.message;
  }

  if (item.status === 'PASS') report.passCount += 1;
  else {
    report.failCount += 1;
    report.failures.push(`${sample.laneId} ${sample.bookId} ${sample.chapter}:${sample.verse} ${item.error || 'failed'}`);
  }

  report.samples.push(item);
}

const requiredLaneManifests = [
  'data/bible/translations/drb-original-douay-rheims/manifest.json',
  'data/bible/translations/nabre-internal-source-lane/manifest.json'
];

for (const manifestPath of requiredLaneManifests) {
  if (!fs.existsSync(manifestPath)) {
    report.failures.push(`manifest missing: ${manifestPath}`);
  }
}

if (report.failures.length || report.failCount > 0) report.result = 'FAIL';

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  laneCount: report.laneCount,
  sampleCount: report.sampleCount,
  passCount: report.passCount,
  failCount: report.failCount,
  firstFailures: report.failures.slice(0, 10),
  reportPath
}, null, 2));

console.log(report.result === 'OK' ? 'ALL PASSED' : 'ALL FAILED');
console.log(report.result === 'OK'
  ? 'NEXT: Internal Bible source-lane adapter resolves DRB and NABRE samples.'
  : `NEXT: inspect ${reportPath}`);

if (report.result !== 'OK') process.exitCode = 1;
