// Compares blocks built from the JS engine's own cells with the audited stored manifests/units
// (data/roman-breviary-1960-1962/manifests/<year>.json, built earlier from the Perl engine's HTML).
// Usage: node scripts/test-roman-breviary-blocks.mjs --year 2026 [--hora Laudes,...] [--show 5]
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { parseOfficiumHtml } from './parse-officium-html.mjs';
import { buildBlocksAndUnits } from './build-roman-breviary-oracle-blocks.mjs';
const require = createRequire(import.meta.url);
require('../js/roman-breviary/date.js');
for (const f of ['store', 'directorium', 'setupstring', 'occurrence', 'matins', 'hours', 'expand']) require(`../js/roman-breviary/${f}.js`);
const RB = globalThis.RomanBreviary;
const { createNodeStore } = require('../js/roman-breviary/store-node.js');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const year = arg('year', '2026');
const from = arg('from', `${year}-01-01`), to = arg('to', `${year}-12-31`);
const KEY = { Matutinum: 'matins', Laudes: 'lauds', Prima: 'prime', Tertia: 'terce', Sexta: 'sext', Nona: 'none', Vespera: 'vespers', Completorium: 'compline' };
const horas = arg('hora', Object.keys(KEY).join(',')).split(',');
const show = Number(arg('show', '5'));
const manifest = JSON.parse(fs.readFileSync(`data/roman-breviary-1960-1962/manifests/${year}.json`, 'utf8'));

const renderer = RB.createRenderer(RB.createHours(RB.createCalendar(createNodeStore())));
const toO = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${m}-${d}-${y}`; };
function* dates(a, b) { const d = new Date(a + 'T00:00:00Z'), e = new Date(b + 'T00:00:00Z'); while (d <= e) { yield d.toISOString().slice(0, 10); d.setUTCDate(d.getUTCDate() + 1); } }

let hours = 0, same = 0, shown = 0;
const kinds = {};
for (const iso of dates(from, to)) {
  for (const hora of horas) {
    const stored = manifest.days[iso]?.hours?.[KEY[hora]];
    if (!stored) continue;
    hours++;
    const { html } = renderer.render(toO(iso), hora);
    const { sections } = parseOfficiumHtml(html);
    const { blocks } = buildBlocksAndUnits(sections, {}, 'la');
    const a = JSON.stringify(stored.blocks), b = JSON.stringify(blocks);
    if (a === b) { same++; continue; }
    // classify: same non-omitted blocks, only omitted placeholders differ?
    const strip = (bl) => bl.filter((x) => !x.omitted);
    const onlyOmitted = JSON.stringify(strip(stored.blocks)) === JSON.stringify(strip(blocks));
    const k = onlyOmitted ? 'only omitted-placeholder blocks differ' : 'content differs';
    kinds[k] = (kinds[k] || 0) + 1;
    if (!onlyOmitted && shown++ < show) {
      const n = Math.max(stored.blocks.length, blocks.length);
      for (let i = 0; i < n; i++) {
        if (JSON.stringify(stored.blocks[i]) !== JSON.stringify(blocks[i])) {
          console.log(`DIFF ${iso} ${hora} block ${i}\n  stored: ${JSON.stringify(stored.blocks[i])}\n  js:     ${JSON.stringify(blocks[i])}`);
          break;
        }
      }
    }
  }
}
console.log(`hours compared ${hours}, identical blocks ${same}`, kinds);
