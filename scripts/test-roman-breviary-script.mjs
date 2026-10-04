// Differential test: JS hour assembly (specials) vs the pinned Perl engine, as script arrays.
// Usage: node scripts/test-roman-breviary-script.mjs --from 2026-01-01 --to 2027-12-31 --hora Laudes [--verbose] [--chunk 40]
import { createRequire } from 'node:module';
import { runScripts } from './roman-breviary-oracle-script.mjs';
const require = createRequire(import.meta.url);
require('../js/roman-breviary/date.js');
for (const f of ['store', 'directorium', 'setupstring', 'occurrence', 'hours']) require(`../js/roman-breviary/${f}.js`);
const RB = globalThis.RomanBreviary;
const { createNodeStore } = require('../js/roman-breviary/store-node.js');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const from = arg('from', '2026-01-01'), to = arg('to', '2026-12-31');
const horas = arg('hora', 'Laudes').split(',');
const chunk = Number(arg('chunk', '40'));
const verbose = process.argv.includes('--verbose');

function* dates(a, b) { const d = new Date(a + 'T00:00:00Z'), e = new Date(b + 'T00:00:00Z'); while (d <= e) { yield d.toISOString().slice(0, 10); d.setUTCDate(d.getUTCDate() + 1); } }
const all = [...dates(from, to)];
const toO = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${m}-${d}-${y}`; };

// split a script into [{head, lines}] at '#...' lines
function segments(arr) {
  const out = []; let cur = { head: '(start)', lines: [] }; out.push(cur);
  for (const l of arr) {
    if (/^\s*#/.test(l)) { cur = { head: l.replace(/\{.*$/s, '').trim(), full: l, lines: [l] }; out.push(cur); } else cur.lines.push(l);
  }
  return out;
}

const cal = RB.createCalendar(createNodeStore());
const hours = RB.createHours(cal);
let days = 0, daysBad = 0, unported = {}, segBad = {}, segTotal = {}, samples = [];
for (let i = 0; i < all.length; i += chunk) {
  const part = all.slice(i, i + chunk);
  const rows = runScripts(part, horas);
  for (const r of rows) {
    days++;
    const iso = part.find((x) => toO(x) === r.date);
    let js;
    try { js = hours.script(r.date, r.hora); } catch (e) { const k = e.message.slice(0, 60); unported[k] = (unported[k] || 0) + 1; daysBad++; continue; }
    const same = JSON.stringify(js) === JSON.stringify(r.script);
    for (const sg of segments(r.script)) segTotal[sg.head] = (segTotal[sg.head] || 0) + 1;
    if (!same) {
      daysBad++;
      const a = segments(r.script), b = segments(js);
      const n = Math.max(a.length, b.length);
      let reported = false;
      for (let k = 0; k < n; k++) {
        const x = JSON.stringify(a[k]?.lines), y = JSON.stringify(b[k]?.lines);
        if (x !== y) {
          const head = a[k]?.head || b[k]?.head;
          segBad[head] = (segBad[head] || 0) + 1;
          if (!reported && samples.length < (verbose ? 40 : 12)) {
            const A = a[k]?.lines || [], B = b[k]?.lines || [];
            let j = 0; while (j < Math.max(A.length, B.length) && JSON.stringify(A[j]) === JSON.stringify(B[j])) j++;
            const cut = (v) => { const t = JSON.stringify(v) || 'undefined'; return t; };
            let p0 = cut(A[j]), q0 = cut(B[j]); let c = 0; while (c < Math.min(p0.length, q0.length) && p0[c] === q0[c]) c++;
            const win = (t) => t.slice(Math.max(0, c - 40), c + 140);
            samples.push(`${iso} ${r.hora} segment "${head}" line ${j} (perl ${A.length} lines, js ${B.length})\n    perl: ...${win(p0)}\n    js  : ...${win(q0)}`);
            reported = true;
          }
        }
      }
    }
  }
}
console.log(`${horas.join(',')} ${from}..${to}: records ${days}, with a difference ${daysBad}`);
if (Object.keys(unported).length) console.log('not ported / threw:', unported);
if (Object.keys(segBad).length) console.log('segments differing:', segBad);
for (const s of samples) console.log('  ' + s);
process.exit(daysBad ? 1 : 0);
