// Differential test: JS-rendered hour cells vs the pinned Perl engine's own HTML (Rubrics 1960, Latin).
// Usage: node scripts/test-roman-breviary-render.mjs --from 2026-01-01 --to 2026-12-31 --hora Laudes,Vespera [--show 3] [--chunk 40]
import { createRequire } from 'node:module';
import { runScripts } from './roman-breviary-oracle-script.mjs';
const require = createRequire(import.meta.url);
require('../js/roman-breviary/date.js');
for (const f of ['store', 'directorium', 'setupstring', 'occurrence', 'matins', 'hours', 'expand']) require(`../js/roman-breviary/${f}.js`);
const RB = globalThis.RomanBreviary;
const { createNodeStore } = require('../js/roman-breviary/store-node.js');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const from = arg('from', '2026-01-01'), to = arg('to', '2026-12-31');
const horas = arg('hora', 'Laudes').split(',');
const chunk = Number(arg('chunk', '30'));
const language = arg('lang', 'Latin');
const show = Number(arg('show', '3'));

function* dates(a, b) { const d = new Date(a + 'T00:00:00Z'), e = new Date(b + 'T00:00:00Z'); while (d <= e) { yield d.toISOString().slice(0, 10); d.setUTCDate(d.getUTCDate() + 1); } }
const all = [...dates(from, to)];

const cal = RB.createCalendar(createNodeStore());
cal.ctx.lang1 = cal.ctx.lang2 = language;
if (process.env.DO_VERSION) cal.ctx.version = process.env.DO_VERSION; // e.g. 'Rubrics 1960 - 2020 USA'
const hours = RB.createHours(cal);
const renderer = RB.createRenderer(hours);
const stripWrap = (h) => h.slice(h.indexOf('<TR>'), h.lastIndexOf('</TABLE>'));
let records = 0, bad = 0, shown = 0;
for (let i = 0; i < all.length; i += chunk) {
  const rows = runScripts(all.slice(i, i + chunk), horas, { html: true, language });
  for (const o of rows) {
    records++;
    let js;
    try { js = renderer.render(o.date, o.hora).html; } catch (e) { js = 'ERROR ' + e.stack; }
    const want = stripWrap(o.html);
    if (js !== want) {
      bad++;
      if (shown++ < show) {
        let k = 0; while (k < want.length && want[k] === js[k]) k++;
        console.log(`DIFF ${o.date} ${o.hora} at ${k}\n  perl: ${JSON.stringify(want.slice(Math.max(0, k - 100), k + 200))}\n  js:   ${JSON.stringify(js.slice(Math.max(0, k - 100), k + 200))}`);
      }
    }
  }
}
console.log(`${horas.join(',')} ${from}..${to}: records ${records}, with a difference ${bad}`);
process.exit(bad ? 1 : 0);
