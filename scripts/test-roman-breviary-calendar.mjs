// Differential test: JS occurrence/precedence vs the pinned Perl engine's state, day by day.
// Usage: node scripts/test-roman-breviary-calendar.mjs --from 2026-01-01 --to 2027-12-31 [--hora Laudes] [--verbose]
import { createRequire } from 'node:module';
import { runStateRange } from './roman-breviary-oracle-state.mjs';
const require = createRequire(import.meta.url);
const RB = require('../js/roman-breviary/date.js');
for (const f of ['store', 'directorium', 'setupstring', 'occurrence']) require(`../js/roman-breviary/${f}.js`);
const { createNodeStore } = require('../js/roman-breviary/store-node.js');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const from = arg('from', '2026-01-01'), to = arg('to', '2027-12-31'), hora = arg('hora', 'Laudes');
const verbose = process.argv.includes('--verbose');

const same = (a, b) => {
  const sa = a === undefined || a === null ? '' : String(a), sb = b === undefined || b === null ? '' : String(b);
  if (sa === sb) return true;
  const na = Number(sa), nb = Number(sb);
  return sa !== '' && sb !== '' && Number.isFinite(na) && Number.isFinite(nb) && na === nb;
};
const sameArr = (a, b) => {
  a = a || []; b = b || [];
  return a.length === b.length && a.every((x, i) => same(x, b[i]));
};

const oracle = runStateRange(from, to, hora);
const cal = RB.createCalendar(createNodeStore());
if (process.env.DO_VERSION) cal.ctx.version = process.env.DO_VERSION; // e.g. 'Rubrics 1960 - 2020 USA'
const scalar = ['winner', 'commemoratio', 'commemoratio1', 'scriptura', 'commune', 'communetype', 'rank', 'comrank', 'duplex', 'laudes', 'vespera', 'svesp', 'tvesp', 'tname', 'sname', 'transfervigil', 'rule', 'communerule', 'dayofweek'];
const arrays = ['trank', 'srank', 'commemoentries'];
let bad = 0, daysBad = 0;
const byField = {};
const samples = [];
for (const r of oracle) {
  const [y, m, d] = r.iso.split('-').map(Number);
  cal.ctx.hora = hora;
  let c;
  try { c = cal.precedence(`${m}-${d}-${y}`); } catch (e) { daysBad++; bad++; byField.EXCEPTION = (byField.EXCEPTION || 0) + 1; if (samples.length < 20) samples.push(`${r.iso} EXCEPTION ${e.message}`); continue; }
  const diffs = [];
  for (const k of scalar) if (!same(c[k], r[k])) diffs.push([k, r[k], c[k]]);
  for (const k of arrays) if (!sameArr(c[k], r[k])) diffs.push([k, JSON.stringify(r[k]), JSON.stringify(c[k])]);
  for (let i = 0; i < 3; i++) if (!same(c.dayname[i], r.dayname[i])) diffs.push([`dayname[${i}]`, r.dayname[i], c.dayname[i]]);
  if (!same(c.winnerHash.get('Rank'), r.winner_rank)) diffs.push(['winner_rank', r.winner_rank, c.winnerHash.get('Rank')]);
  if (diffs.length) {
    daysBad++;
    for (const [k] of diffs) { byField[k] = (byField[k] || 0) + 1; bad++; }
    if (samples.length < (verbose ? 60 : 20)) samples.push(`${r.iso}  ` + diffs.slice(0, 3).map(([k, p, j]) => `${k}: perl=${JSON.stringify(p)?.slice(0, 90)} js=${JSON.stringify(j)?.slice(0, 90)}`).join('  |  '));
  }
}
console.log(`${hora}: days ${oracle.length}, days with a difference ${daysBad}, field differences ${bad}`, byField);
for (const s of samples) console.log('  ' + s);
process.exit(daysBad ? 1 : 0);
