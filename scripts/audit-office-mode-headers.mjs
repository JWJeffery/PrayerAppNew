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
const ui = read('js/office-ui.js');
const css = read('css/office.css');
const pkg = JSON.parse(read('package.json') || '{}');

check(
  'office-mode-title appears exactly once on main office shell',
  (index.match(/id="office-mode-title"/g) || []).length === 1 &&
  /<div id="main-content" class="app-primary-canvas">[\s\S]*?<h1 id="office-mode-title">The Universal Office<\/h1>/.test(index)
);

check(
  'top shell labels are tradition-family headers only',
  ui.includes("daily: 'The Episcopal Church'") &&
  ui.includes("'ethiopian-saatat': 'Ethiopian Orthodoxy'") &&
  ui.includes("'east-syriac': 'Church of the East'") &&
  ui.includes("horologion: 'Eastern Orthodoxy'")
);

check(
  'top shell labels do not mix office names with tradition names',
  !ui.includes("daily: 'The Daily Office of the Episcopal Church'") &&
  !ui.includes("'ethiopian-saatat': \"The Ethiopian Sa'atat\"") &&
  !ui.includes("horologion: 'The Horologion'")
);

check(
  'selectMode updates top shell header',
  ui.includes('updateOfficeModeHeader(mode);')
);

check(
  'daily body header remains active office with liturgical day subtitle',
  ui.includes('officeHtml += `<h2>${officeTitle}</h2>`;') &&
  ui.includes('officeHtml += `<p class="liturgical-title">${officeSubtitle}</p>`;')
);

check(
  'ethiopian body header is active watch with date subtitle',
  ui.includes('ethHourInfo?.hourName || "The Ethiopian Sa\'atat"') &&
  ui.includes('officeHtml += `<p class="liturgical-title">${ethSidebarDate}</p>`;') &&
  !ui.includes('<p class="liturgical-title">The Ethiopian Book of Hours</p>')
);

check(
  'church of the east body header is active hour with date subtitle',
  ui.includes('officeHtml += `<p class="liturgical-title">${currentDate.toLocaleDateString') &&
  !ui.includes('<p class="liturgical-title">Church of the East</p>')
);

check(
  'horologion body header remains active office with date subtitle',
  ui.includes('html += `<h2>${payload.title}</h2>`;') &&
  ui.includes('html += `<p class="liturgical-title">${dateLabel}</p>`;')
);

check(
  'duplicate office-family body titles are absent',
  !ui.includes('<p class="office-family-title">The Daily Office of the Episcopal Church</p>') &&
  !ui.includes('<p class="office-family-title">The Horologion</p>')
);

check(
  'unused office-family-title CSS is absent',
  !css.includes('.office-family-title')
);

check(
  'top shell header size is bounded',
  css.includes('Uniform office shell header hierarchy pass') &&
  css.includes('#main-content > #office-mode-title') &&
  css.includes('font-size: clamp(2.15rem, 4.1vw, 4.2rem)')
);

check(
  'package exposes office mode header audit',
  pkg.scripts?.['audit:office-mode-headers'] === 'node scripts/audit-office-mode-headers.mjs'
);

if (failures.length) {
  console.error(`FAIL office mode headers audit: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS office mode headers audit: ${checks} check(s) passed.`);
