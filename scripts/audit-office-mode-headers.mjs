#!/usr/bin/env node
import fs from 'node:fs';

const index = fs.readFileSync('index.html', 'utf8');
const ui = fs.readFileSync('js/office-ui.js', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const failures = [];
let checks = 0;
function check(label, condition) {
  checks++;
  if (!condition) failures.push(label);
}

check('office-mode-title appears exactly once', (index.match(/id="office-mode-title"/g) || []).length === 1);
check('office-mode-title is on main-content h1', /<div id="main-content" class="app-primary-canvas">[\s\S]*?<h1 id="office-mode-title">The Universal Office<\/h1>/.test(index));
check('header map exists', ui.includes('const OFFICE_MODE_HEADER_LABELS = {'));
check('daily shell title names Episcopal Daily Office', ui.includes("daily: 'The Daily Office of the Episcopal Church'"));
check('ethiopian shell title exists', ui.includes("'ethiopian-saatat': \"The Ethiopian Sa'atat\""));
check('coe shell title exists', ui.includes("'east-syriac': 'Church of the East'"));
check('horologion shell title exists', ui.includes("horologion: 'The Horologion'"));
check('selectMode updates shell title', ui.includes('updateOfficeModeHeader(mode);'));
check('no duplicate daily body family title', !ui.includes('<p class="office-family-title">The Daily Office of the Episcopal Church</p>'));
check('no duplicate horologion body family title', !ui.includes('<p class="office-family-title">The Horologion</p>'));
check('ethiopian body h2 is active hour', ui.includes('ethHourInfo?.hourName || "The Ethiopian Sa\'atat"'));
check('coe body h2 is active hour', ui.includes('<h2>${officeTitle}</h2>') && ui.includes('<p class="liturgical-title">Church of the East</p>'));
check('package exposes audit', pkg.scripts?.['audit:office-mode-headers'] === 'node scripts/audit-office-mode-headers.mjs');

if (failures.length) {
  console.error(`FAIL office mode headers audit: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`PASS office mode headers audit: ${checks} check(s) passed.`);
