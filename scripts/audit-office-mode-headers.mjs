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
  ui.includes("'ethiopian-saatat': 'Oriental Orthodoxy'") &&
  ui.includes("'east-syriac': 'Church of the East'") &&
  ui.includes("horologion: 'Eastern Orthodoxy'")
);

check(
  'top shell labels do not mix office-corpus names with tradition names',
  !ui.includes("daily: 'The Daily Office of the Episcopal Church'") &&
  !ui.includes("'ethiopian-saatat': \"The Ethiopian Sa'atat\"") &&
  !ui.includes("horologion: 'The Horologion'")
);

check(
  'selectMode updates top shell header',
  ui.includes('updateOfficeModeHeader(mode);')
);

check(
  'all office bodies name the office corpus in the same position',
  ui.includes('<p class="office-book-title">The Daily Office</p>') &&
  ui.includes('<p class="office-book-title">The Ethiopian Sa\'atat</p>') &&
  ui.includes('<p class="office-book-title">The Hudra</p>') &&
  ui.includes('<p class="office-book-title">The Horologion</p>')
);

check(
  'daily body hierarchy is corpus then active office then liturgical day',
  ui.includes('officeHtml += `<p class="office-book-title">The Daily Office</p>`;') &&
  ui.includes('officeHtml += `<h2>${officeTitle}</h2>`;') &&
  ui.includes('officeHtml += `<p class="liturgical-title">${officeSubtitle}</p>`;')
);

check(
  'ethiopian body hierarchy is corpus then active watch then date',
  ui.includes('officeHtml += `<p class="office-book-title">The Ethiopian Sa\'atat</p>`;') &&
  ui.includes('officeHtml += `<h2>${ethHourInfo?.hourName || "The Ethiopian Sa\'atat"}</h2>`;') &&
  ui.includes('officeHtml += `<p class="liturgical-title">${ethSidebarDate}</p>`;')
);

check(
  'church of the east body hierarchy is corpus then active hour then date',
  ui.includes('officeHtml += `<p class="office-book-title">The Hudra</p>`;') &&
  ui.includes('officeHtml += `<h2>${officeTitle}</h2>`;') &&
  ui.includes('officeHtml += `<p class="liturgical-title">${currentDate.toLocaleDateString')
);

check(
  'horologion body hierarchy is corpus then active office then date',
  ui.includes('html += `<p class="office-book-title">The Horologion</p>`;') &&
  ui.includes('html += `<h2>${payload.title}</h2>`;') &&
  ui.includes('html += `<p class="liturgical-title">${dateLabel}</p>`;')
);

check(
  'old duplicate body family title class remains retired',
  !ui.includes('office-family-title') &&
  !css.includes('.office-family-title')
);

check(
  'top shell header size is bounded for long TEC label',
  css.includes('Uniform office shell header hierarchy pass') &&
  css.includes('#main-content > #office-mode-title') &&
  css.includes('font-size: clamp(2rem, 3.7vw, 3.55rem)')
);

check(
  'office corpus title CSS exists',
  css.includes('.office-book-title') &&
  css.includes('font-variant: small-caps')
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
