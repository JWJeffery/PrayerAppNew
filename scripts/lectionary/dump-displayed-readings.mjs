// Drives the real app and records, for every day in a range, what Morning and Evening Prayer actually
// DISPLAY: the day's title, every psalm and reading reference, and any gap markers. Step 1 of the
// lectionary audit; step 2 is audit_lectionary.py, which checks the dump against the 1979 BCP.
//
//   node scripts/lectionary/dump-displayed-readings.mjs --from 2025-01-01 --to 2031-12-31 \
//        --out /tmp/displayed.json [--placement evening|morning|both]
//
// Needs Playwright with Chromium (PLAYWRIGHT_BROWSERS_PATH is set in the cloud environment; locally
// `npx playwright install chromium`). Serves the repo itself on a random port; no network needed.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const FROM = arg('from', '2025-01-01'), TO = arg('to', '2031-12-31'), OUT = arg('out', 'displayed.json');
const PLACEMENT = arg('placement', 'evening');

const ROOT = process.cwd();
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
await page.goto(base + '/index.html', { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.evaluate(() => { selectMode('daily'); });
await page.waitForTimeout(3500);

const days = [];
for (let d = new Date(FROM + 'T12:00:00'); d <= new Date(TO + 'T12:00:00'); d.setDate(d.getDate() + 1)) days.push(d.toISOString().slice(0, 10));

const out = {};
const CHUNK = 60;
for (let i = 0; i < days.length; i += CHUNK) {
  const part = await page.evaluate(async ({ days, placement }) => {
    const res = {};
    const quiet = console.log; console.log = () => {}; console.warn = () => {};
    const gp = document.querySelector(`input[name="gospel-placement"][value="${placement}"]`);
    if (gp) gp.checked = true;
    for (const iso of days) {
      const [y, m, d] = iso.split('-').map(Number);
      currentDate = new Date(y, m - 1, d);
      const rec = {};
      for (const [key, office] of [['morning', 'morning-office'], ['evening', 'evening-office']]) {
        document.querySelector(`input[name="office-time"][value="${office}"]`).checked = true;
        let err = null;
        try { await renderOffice(); } catch (e) { err = String(e && e.message || e); }
        const el = document.getElementById('office-display');
        const text = el ? el.innerText : '';
        rec[key] = {
          title: (el.querySelector('.liturgical-title') || {}).textContent ? el.querySelector('.liturgical-title').textContent.trim() : '',
          refs: [...el.querySelectorAll('.passage-reference')].map(x => x.textContent.trim()),
          gap: /Lectionary Gap/.test(text),
          noCollect: /No collect appointed/.test(text),
          unavailable: (text.match(/\[[^\]]*unavailable[^\]]*\]/g) || []),
          blankBrackets: /\[\s*\]/.test(text),
          err,
        };
      }
      res[iso] = rec;
    }
    console.log = quiet;
    return res;
  }, { days: days.slice(i, i + CHUNK), placement: PLACEMENT });
  Object.assign(out, part);
  process.stderr.write(`\r${days[Math.min(i + CHUNK, days.length) - 1]}`);
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`\nwrote ${Object.keys(out).length} days to ${OUT}`);
await browser.close();
server.close();
