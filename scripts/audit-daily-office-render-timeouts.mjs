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

const officeUi = read('js/office-ui.js');
const scripture = read('js/scripture-resolver.js');
const pkg = JSON.parse(read('package.json') || '{}');

check(
  'scripture resolver has bounded JSON fetch helper',
  scripture.includes('const SCRIPTURE_FETCH_TIMEOUT_MS = 6500') &&
  scripture.includes('async function _fetchJsonWithTimeout') &&
  scripture.includes('controller.abort()') &&
  scripture.includes('bibleCache.books[source.cacheKey] = await _fetchJsonWithTimeout(source.path);')
);

check(
  'Daily Office has generic timeout helper',
  officeUi.includes('async function withDailyOfficeTimeout') &&
  officeUi.includes('Promise.race([promise, timeout])') &&
  officeUi.includes('[daily-office]')
);

check(
  'Daily Office season and lectionary lookup are timeout guarded',
  officeUi.includes('Daily Office season lookup') &&
  officeUi.includes('Daily Office lectionary lookup') &&
  officeUi.includes('Daily Office Render Timeout')
);

check(
  'Daily Office Bible prefetch is abortable',
  officeUi.includes('async function fetchDailyOfficeResource') &&
  officeUi.includes('fetchDailyOfficeResource(`data/bible/${folder}/${filename}`)')
);

check(
  'Daily Office commemoration preload cannot block render indefinitely',
  officeUi.includes('async function preloadDailyOfficeCommemorations') &&
  officeUi.includes('DAILY_OFFICE_COMMENORATION_TIMEOUT_MS = 2500') &&
  officeUi.includes("await preloadDailyOfficeCommemorations(currentDate, 'ANG');")
);

check(
  'package exposes Daily Office render timeout audit',
  pkg.scripts?.['audit:daily-office-render-timeouts'] === 'node scripts/audit-daily-office-render-timeouts.mjs'
);

if (failures.length) {
  console.error(`FAIL Daily Office render timeout audit: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS Daily Office render timeout audit: ${checks} check(s) passed.`);
