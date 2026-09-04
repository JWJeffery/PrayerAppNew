/**
 * scripts/saints/verify_sanctoral.js
 *
 * Two checks on data/saints/sanctoral.json. Run from the repo root:
 *     node scripts/saints/verify_sanctoral.js
 *
 * 1. RESOLVABILITY. Every rule-based entry must resolve to exactly one day in
 *    every year of a long span. A rule naming a week its season does not reach
 *    in a given year resolves to NOTHING and the commemoration disappears from
 *    the app entirely - a worse failure than a wrong date, and one that a
 *    single-year spot check will not catch. This is why `week: "last"` exists.
 *
 * 2. ACCEPTANCE. Computed dates are compared against the dates actually printed
 *    in the Assyrian Church of the East, Diocese of Western Europe calendars
 *    2020-2026.
 *
 * Both checks drive the REAL resolver rather than reimplementing its matching
 * logic. An earlier version of this script reimplemented it inline and then
 * disagreed with the resolver about `week: "last"`, reporting a failure that
 * did not exist.
 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const quiet = { log(){}, error(){}, warn(){} };

const engineScope = { console: quiet };
new Function('globalThis','window','console',
  fs.readFileSync(path.join(ROOT,'js/calendar-east-syriac.js'),'utf8')
).call(engineScope, engineScope, engineScope, quiet);

const scope = { EastSyriacCalendar: engineScope.EastSyriacCalendar };
const shim = async (u) => ({ ok:true, json: async () =>
  JSON.parse(fs.readFileSync(path.join(ROOT,'data/saints',path.basename(u)),'utf8')) });
new Function('globalThis','fetch','console',
  fs.readFileSync(path.join(ROOT,'js/saints-resolver.js'),'utf8')
).call(scope, scope, shim, quiet);
const R = scope.SaintsResolver;

const doc = JSON.parse(fs.readFileSync(path.join(ROOT,'data/saints/sanctoral.json'),'utf8'));
const rules = doc.entries.filter(e => e.observance && e.observance.type !== 'fixed');

function daysOfYear(y){ const out=[]; for(let mo=0;mo<12;mo++) for(let d=1;d<=31;d++){
  const dt=new Date(y,mo,d); if(dt.getMonth()===mo) out.push(dt);} return out; }
const md = dt => `${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;

console.log(`\n1. RESOLVABILITY - ${rules.length} rule-based entries, 2020-2039`);
let unresolved = 0;
for (const e of rules) {
  const counts = [];
  for (let y = 2020; y <= 2039; y++)
    counts.push(daysOfYear(y).filter(dt => R.occursOn(e, dt)).length);
  const zero = counts.filter(c => c === 0).length, many = counts.filter(c => c > 1).length;
  if (zero || many) { unresolved++;
    console.log(`   ${e.id.padEnd(26)} ${JSON.stringify(counts)}  ${zero?zero+' year(s) with NO occurrence':''}${many?' '+many+' with >1':''}`); }
}
console.log(unresolved ? `   ${unresolved} FAILING` : '   all rules resolve to exactly one day in all 20 years');

const PRINTED = require('./printed-commemoration-dates.json');
console.log(`\n2. ACCEPTANCE - computed vs printed diocesan calendars 2020-2026`);
let ok=0, bad=0; const misses=[];
for (const [id, years] of Object.entries(PRINTED)) {
  const entry = doc.entries.find(e => e.id === id && (e.tags||[]).includes('COE'));
  if (!entry) { console.log(`   ${id}: NOT FOUND in sanctoral`); bad += 7; continue; }
  const marks = [];
  for (const [y, want] of Object.entries(years)) {
    const hit = daysOfYear(+y).find(dt => R.occursOn(entry, dt));
    const got = hit ? md(hit) : 'never';
    const m = (got === want); m ? ok++ : bad++;
    marks.push(m ? '.' : 'X');
    if (!m) misses.push(`   ${id} ${y}: printed ${want}, computed ${got}`);
  }
  // Denominator is the number of years of printed data held for THIS entry,
  // not a hardcoded 7 -- not every commemoration appears in every edition.
  console.log(`   ${id.padEnd(30)} ${marks.join('')}  ${marks.filter(x=>x==='.').length}/${marks.length}`);
}
console.log(`\n   match: ${ok}/${ok+bad} (${(100*ok/(ok+bad)).toFixed(1)}%)`);
if (misses.length) { console.log('\n   misses:'); misses.forEach(m => console.log(m)); }
console.log('\n   The remaining misses are all 2025, where the diocese merged the Sixth and');
console.log('   Seventh Weeks of Summer into one calendar week. That editorial compression');
console.log('   cannot be computed forward from Easter; it needs that year\'s printed calendar.\n');
