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

const index = read('index.html');
const officeUi = read('js/office-ui.js');
const css = read('css/office.css');
const pkg = JSON.parse(read('package.json') || '{}');

check(
  'commemoration section remains present in shell',
  index.includes('class="saint-section"') &&
  index.includes('id="saint-display"')
);

check(
  'commemoration scoping helper exists',
  officeUi.includes('function updateCommemorationVisibilityForMode(mode)')
);

check(
  'selectMode applies commemoration scoping',
  officeUi.includes('updateCommemorationVisibilityForMode(mode);')
);

check(
  'non-Daily modes hide commemoration section',
  officeUi.includes("const shouldShow = mode === 'daily';") &&
  officeUi.includes('saintSection.hidden = !shouldShow')
);

check(
  'non-Daily modes clear stale saint content',
  officeUi.includes('if (dateHeader) dateHeader.textContent =') &&
  officeUi.includes('if (saintDisplay) saintDisplay.innerHTML =')
);

check(
  'CSS suppresses hidden commemoration section',
  css.includes('Commemoration tradition scoping pass') &&
  css.includes('.saint-section.tradition-commemorations-hidden') &&
  css.includes('.saint-section[hidden]')
);

check(
  'package exposes commemoration scoping audit',
  pkg.scripts?.['audit:commemoration-tradition-scope'] === 'node scripts/audit-commemoration-tradition-scope.mjs'
);

if (failures.length) {
  console.error(`FAIL commemoration tradition scope audit: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS commemoration tradition scope audit: ${checks} check(s) passed.`);
