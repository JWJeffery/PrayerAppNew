#!/usr/bin/env node
import fs from 'node:fs';

const failures = [];
let checks = 0;

function read(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (_error) {
    failures.push(`missing file: ${path}`);
    return '';
  }
}

function check(label, condition) {
  checks += 1;
  if (!condition) failures.push(label);
}

const css = read('css/office.css');
const officeUi = read('js/office-ui.js');
const pkg = JSON.parse(read('package.json') || '{}');

check(
  'Daily Office commemoration readability CSS pass exists',
  css.includes('Daily Office commemoration card readability pass')
);

check(
  'commemoration card is styled as parchment, not legacy dark card',
  css.includes('#main-content .saint-section:not([hidden]) #saint-display > *') &&
  css.includes('background:') &&
  css.includes('rgba(255, 253, 248') &&
  css.includes('color: var(--app-ink')
);

check(
  'commemoration card descendant text is forced readable',
  css.includes('#main-content .saint-section:not([hidden]) #saint-display > * *') &&
  css.includes('opacity: 1 !important') &&
  css.includes('text-shadow: none !important')
);

check(
  'commemoration card width and grid are bounded',
  css.includes('grid-template-columns: repeat(auto-fit, minmax(280px, 420px))') &&
  css.includes('max-width: 420px !important')
);

check(
  'runtime normalizer exists for fused tradition labels',
  officeUi.includes('function normalizeCommemorationCardReadability()') &&
  officeUi.includes('app-commemoration-card') &&
  officeUi.includes('MutationObserver') &&
  officeUi.includes("ANG|EO|OO|COE|LC")
);

check(
  'commemoration normalizer cannot self-trigger a characterData mutation loop',
  officeUi.includes('if (normalized !== text.nodeValue)') &&
  officeUi.includes('observer.observe(display, { childList: true, subtree: true });') &&
  !officeUi.includes('characterData: true')
);

check(
  'package exposes commemoration readability audit',
  pkg.scripts?.['audit:commemoration-card-readability'] === 'node scripts/audit-commemoration-card-readability.mjs'
);

if (failures.length) {
  console.error(`FAIL commemoration card readability audit: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS commemoration card readability audit: ${checks} check(s) passed.`);
