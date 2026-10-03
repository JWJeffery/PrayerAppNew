// Differential test: JS calendar tables vs the pinned Perl engine, for every day of the given years.
import { createRequire } from 'node:module';
import { runDir } from './roman-breviary-oracle-dir.mjs';
const require = createRequire(import.meta.url);
require('../js/roman-breviary/date.js');
const RB = require('../js/roman-breviary/store.js');
require('../js/roman-breviary/directorium.js');
const { createNodeStore } = require('../js/roman-breviary/store-node.js');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const years = arg('years', '2024,2025,2026,2027,2028,2029,2030,2035,2038,2040').split(',').map(Number);
const dir = RB.createDirectorium(createNodeStore());
const D = RB.date;
const V = 'Rubrics 1960 - 1960';
const rows = runDir(years).map((r) => ({ ...r, y: Number(r.y), m: Number(r.m), d: Number(r.d) }));
let bad = 0;
const byField = {};
const samples = [];
for (const r of rows) {
  const got = {
    kal: dir.get_from_directorium('kalendar', V, r.sday),
    perm: dir.get_from_directorium('tempora', V, r.sday, 0),
    tr: dir.get_from_directorium('transfer', V, r.sday, r.y),
    str: dir.get_from_directorium('stransfer', V, r.sday, r.y),
    ttr: dir.get_from_directorium('transfer', V, r.tday, r.y),
    tperm: dir.get_from_directorium('tempora', V, r.tday, 0),
    trd_s: dir.transfered('Sancti/' + r.sday, r.y, V),
    trd_t: dir.transfered(r.tday, r.y, V),
    nextday: D.nextday(r.m, r.d, r.y)
  };
  for (const k of Object.keys(got)) {
    if (String(got[k] ?? '') !== String(r[k] ?? '')) {
      bad++; byField[k] = (byField[k] || 0) + 1;
      if (samples.length < 15) samples.push(`${r.y}-${r.m}-${r.d} ${k}: perl=${JSON.stringify(r[k])} js=${JSON.stringify(got[k])}`);
    }
  }
}
console.log(`days ${rows.length} (${years.join(',')}); field mismatches ${bad}`, byField);
for (const s of samples) console.log('  ' + s);
process.exit(bad ? 1 : 0);
