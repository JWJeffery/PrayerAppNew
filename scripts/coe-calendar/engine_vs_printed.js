/**
 * scripts/coe-calendar/engine_vs_printed.js
 *
 * Compares js/calendar-east-syriac.js against the week structure actually
 * printed in the Assyrian Church of the East, Diocese of Western Europe
 * ecclesiastical calendars for 2020-2026.
 *
 * Run from the repo root:  node scripts/coe-calendar/engine_vs_printed.js
 *
 * WHY THIS EXISTS: the engine's own 30 self-tests all passed while it disagreed
 * with the published calendars on a third of the year, because those tests were
 * written from the engine's assumptions rather than from the printed source.
 * This script checks the engine against the primary source instead. Any change
 * to season boundary logic should be measured with it.
 *
 * Week tables are in printed-week-tables.json, hand-transcribed from the PDFs.
 * OCR of those files interleaves four languages per row and cannot be parsed
 * reliably, so the transcription is deliberate rather than automated.
 */
'use strict';
const path = require('path');
global.window = {};
require(path.join(__dirname, '../../js/calendar-east-syriac.js'));
const E = global.window.EastSyriacCalendar;
const W = require('./printed-week-tables.json');

// Printed season name -> engine season id
const MAP = { epiphany:'denkha', fast:'sauma', resurrection:'qyamta', apostles:'shlihe',
  summer:'qayta', elijah:'eliya-sliwa', moses:'muse', hallowing:'qudash-idta',
  annunciation:'subara' };

// The diocese uses GREGORIAN Easter; its printed Easter dates are 12 Apr 2020,
// 4 Apr 2021, 17 Apr 2022, 9 Apr 2023, 31 Mar 2024, 20 Apr 2025, 5 Apr 2026.
const OPTS = { easterMode: 'gregorian' };

const bySeason = {};
let tot = 0, agree = 0;
for (const [yr, rows] of Object.entries(W)) {
  for (const [d, cycle, wk] of rows) {
    if (!MAP[cycle]) continue;               // nativity / after-ascension: not 1:1
    const [y, m, dd] = d.split('-').map(Number);
    const s = E.getSeason(new Date(y, m - 1, dd), OPTS);
    const ok = (s.season === MAP[cycle] && s.weekInSeason === wk);
    tot++; if (ok) agree++;
    bySeason[cycle] = bySeason[cycle] || { ok: 0, n: 0, ex: [] };
    bySeason[cycle].n++; if (ok) bySeason[cycle].ok++;
    else if (bySeason[cycle].ex.length < 2)
      bySeason[cycle].ex.push(`${d}: printed ${cycle} wk${wk} / engine ${s.season} wk${s.weekInSeason}`);
  }
}
console.log('\nWEEK-BY-WEEK');
console.log('season'.padEnd(14), 'agree'.padEnd(8), 'examples');
console.log('-'.repeat(92));
for (const [k, v] of Object.entries(bySeason))
  console.log(k.padEnd(14), `${v.ok}/${v.n}`.padEnd(8), v.ex.join(' | '));
console.log('-'.repeat(92));
console.log(`week-by-week agreement: ${agree}/${tot} (${(100 * agree / tot).toFixed(1)}%)`);

// Season STARTS are the structural test. Week-number drift after a compressed
// row is the diocese's own editorial compression, which cannot be computed
// forward from Easter; a wrong START is a genuine engine boundary error.
let sok = 0, sn = 0; const bad = [];
for (const [yr, rows] of Object.entries(W)) {
  const seen = new Set();
  for (const [d, cycle] of rows) {
    if (!MAP[cycle] || seen.has(cycle)) continue;
    seen.add(cycle);
    const [y, m, dd] = d.split('-').map(Number);
    const s = E.getSeason(new Date(y, m - 1, dd), OPTS);
    sn++;
    if (s.season === MAP[cycle]) sok++;
    else bad.push(`  ${d}: printed ${cycle} start / engine ${s.season} wk${s.weekInSeason}`);
  }
}
console.log(`\nSEASON STARTS (the structural test): ${sok}/${sn}`);
bad.forEach(b => console.log(b));
console.log('');
