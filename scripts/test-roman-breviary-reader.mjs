// Differential test: JS data-file reader vs the pinned Perl engine's setupstring()/officestring().
// Usage: node scripts/test-roman-breviary-reader.mjs [--dates a,b,c] [--files prefix,prefix]
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import { runFiles } from './roman-breviary-oracle-files.mjs';
const require = createRequire(import.meta.url);
const RB = require('../js/roman-breviary/date.js');
require('../js/roman-breviary/store.js');
require('../js/roman-breviary/directorium.js');
require('../js/roman-breviary/setupstring.js');
const { createNodeStore } = require('../js/roman-breviary/store-node.js');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const dates = (arg('dates', '2026-01-03,2026-02-17,2026-03-25,2026-04-03,2026-05-14,2026-06-04,2026-08-15,2026-09-16,2026-10-03,2026-11-02,2026-11-20,2026-12-08,2026-12-24,2027-01-06,2028-02-29')).split(',');
const prefixes = (arg('files', 'Sancti/,Tempora/,Commune/,Psalterium/Comment')).split(',');

const store = createNodeStore();
const idx = JSON.parse((await import('node:fs')).readFileSync(new URL('../data/roman-breviary-1960-1962/components/index.json', import.meta.url)));
const files = [];
for (const b of idx.bundles.filter((x) => x.id.startsWith('la/'))) {
  const doc = JSON.parse((await import('node:fs')).readFileSync(new URL('../data/roman-breviary-1960-1962/components/' + b.path, import.meta.url)));
  for (const k of Object.keys(doc.files)) if (prefixes.some((p) => k.startsWith(p))) files.push(k);
}
console.log(`dates ${dates.length}, files ${files.length}`);

const md5 = (s) => crypto.createHash('md5').update(Buffer.from(s ?? '', 'utf8')).digest('hex');
const D = RB.date;
let n = 0, bad = 0;
const badByKind = {};
const samples = [];
const distinct = new Map();
for (const hora of ['Laudes']) {
  const rows = runFiles(dates, files, hora);
  const ctx = { version: 'Rubrics 1960 - 1960', hora, missa: 0, votive: 'Hodie', dioecesis: 'Generale', missanumber: undefined, winner: '', commemoratio: '', commune: '', winnerHash: new Map(), dayname: ['', '', ''] };
  const dir = RB.createDirectorium(store);
  const ss = RB.createSetupString(store, ctx, dir);
  let lastDate = null;
  for (const r of rows) {
    if (r.date !== lastDate) {
      lastDate = r.date;
      const [m, d, y] = r.date.split('-').map(Number);
      Object.assign(ctx, { month: m, day: d, year: y, dayofweek: D.day_of_week(d, m, y), monthday: undefined });
      ctx.dayname = [D.getweek(d, m, y, 0, 0), '', ''];
      ss.clearCache();
    }
    ctx.monthday = undefined;
    const o = r.kind === 'setup' ? ss.setupstring('Latin', r.file) : ss.officestring('Latin', r.file, r.kind === 'office1' ? 1 : 0);
    const found = o ? 1 : 0;
    const ok = [];
    if (found !== r.found) ok.push('found');
    if (o && r.found) {
      const keys = new Set(o.keys());
      const rk = new Set(Object.keys(r.sections));
      for (const k of keys) if (!rk.has(k)) ok.push('extra:' + k);
      for (const k of rk) if (!keys.has(k)) ok.push('missing:' + k);
      for (const k of keys) if (rk.has(k) && md5(o.get(k)) !== r.sections[k]) ok.push('text:' + k);
    }
    if ((r.monthday || null) !== (ctx.monthday || null) && r.kind !== 'setup') ok.push('monthday');
    n++;
    if (ok.length) {
      bad++;
      badByKind[r.kind] = (badByKind[r.kind] || 0) + 1;
      for (const x of ok) { const key = r.file + ' :: ' + x; if (!distinct.has(key)) distinct.set(key, new Set()); distinct.get(key).add(r.date + ' ' + r.kind); }
      if (samples.length < 25) samples.push(`${r.date} ${r.kind} ${r.file}: ${ok.slice(0, 4).join(', ')}`);
    }
  }
}
console.log(`compared ${n} records; mismatching ${bad}`, badByKind);
console.log('distinct (file :: problem):', distinct.size, ' distinct files:', new Set([...distinct.keys()].map((k) => k.split(' :: ')[0])).size);
for (const [k, v] of [...distinct].slice(0, 40)) console.log('  ' + k + '   x' + v.size);
process.exit(bad ? 1 : 0);
