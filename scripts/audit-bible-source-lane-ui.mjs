import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const adapter = require('../js/bible-browser/bible-source-lane-adapter.js');

const reportPath = process.env.BIBLE_SOURCE_LANE_UI_AUDIT_REPORT || '/tmp/bible-source-lane-ui-audit.json';

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = `${dir}/${name}`;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!['.git', 'node_modules'].includes(name)) walk(full, out);
    } else if (name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const htmlFiles = walk('.').filter(file => fs.readFileSync(file, 'utf8').includes('bible-source-lane-ui-hook.js'));

const samples = [
  { laneId: 'DRB_ORIGINAL', bookId: 'JOHN', chapter: 1, verse: 1 },
  { laneId: 'NABRE_INTERNAL', bookId: 'JOHN', chapter: 1, verse: 1 },
  { laneId: 'DRB_ORIGINAL', bookId: 'WISDOM', chapter: 1, verse: 1 },
  { laneId: 'NABRE_INTERNAL', bookId: 'WISDOM', chapter: 1, verse: 1 }
];

const report = {
  result: 'OK',
  uiHookPath: 'js/bible-browser/bible-source-lane-ui-hook.js',
  htmlUiFileCount: htmlFiles.length,
  htmlUiFiles: htmlFiles,
  laneCount: adapter.listLanes().length,
  sampleCount: samples.length,
  passCount: 0,
  failCount: 0,
  failures: []
};

if (!fs.existsSync(report.uiHookPath)) report.failures.push('UI hook file missing');
if (htmlFiles.length === 0) report.failures.push('No HTML entrypoint loads source-lane UI hook');

for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const adapterIndex = text.indexOf('bible-source-lane-adapter.js');
  const browserHookIndex = text.indexOf('bible-source-lane-browser-hook.js');
  const uiIndex = text.indexOf('bible-source-lane-ui-hook.js');

  if (adapterIndex < 0) report.failures.push(`${file}: missing adapter script`);
  if (browserHookIndex < 0) report.failures.push(`${file}: missing browser hook script`);
  if (uiIndex < 0) report.failures.push(`${file}: missing UI hook script`);
  if (adapterIndex >= 0 && browserHookIndex >= 0 && uiIndex >= 0 && !(adapterIndex < browserHookIndex && browserHookIndex < uiIndex)) {
    report.failures.push(`${file}: script order must be adapter -> browser hook -> UI hook`);
  }
}

for (const sample of samples) {
  try {
    const resolved = await adapter.resolvePassage(sample, { readJson });
    if (resolved.text && resolved.text.trim().length > 5) report.passCount += 1;
    else {
      report.failCount += 1;
      report.failures.push(`${sample.laneId} ${sample.bookId} ${sample.chapter}:${sample.verse}: no usable text`);
    }
  } catch (error) {
    report.failCount += 1;
    report.failures.push(`${sample.laneId} ${sample.bookId} ${sample.chapter}:${sample.verse}: ${error.message}`);
  }
}

if (report.failures.length || report.failCount > 0) report.result = 'FAIL';

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  htmlUiFileCount: report.htmlUiFileCount,
  laneCount: report.laneCount,
  sampleCount: report.sampleCount,
  passCount: report.passCount,
  failCount: report.failCount,
  firstFailures: report.failures.slice(0, 10),
  reportPath
}, null, 2));

console.log(report.result === 'OK' ? 'ALL PASSED' : 'ALL FAILED');
console.log(report.result === 'OK'
  ? 'NEXT: Bible browser exposes internal source-lane UI and resolves DRB/NABRE samples.'
  : `NEXT: inspect ${reportPath}`);

if (report.result !== 'OK') process.exitCode = 1;
