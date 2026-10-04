// Offline test: builds nothing itself -- run `npm run release:web` first. Serves web-release/, lets the
// service worker install, then cuts the network and checks that each tradition still opens and that no
// same-origin request fails. Needs Playwright with Chromium (PLAYWRIGHT_BROWSERS_PATH is set in the cloud
// environment; locally, `npx playwright install chromium`).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }

const ROOT = path.resolve('web-release');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(ROOT, 'index.html');
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(0);
const port = server.address().port;
const base = `http://localhost:${port}`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const context = await browser.newContext();
const page = await context.newPage();
const failures = [];
page.on('requestfailed', (r) => { if (r.url().startsWith(base) && !(r.failure() && /ABORTED/.test(r.failure().errorText))) { failures.push(r.url().replace(base, '')); if (process.env.DEBUG_OFFLINE) console.log('  failed:', r.url().replace(base, ''), r.failure() && r.failure().errorText, 'sw:', !!r.serviceWorker?.()); } });
page.on('response', (r) => { if (r.url().startsWith(base) && r.status() >= 400 && !r.url().endsWith('favicon.ico')) failures.push(`${r.status()} ${r.url().replace(base, '')}`); });

let bad = 0;
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${msg}`); if (!ok) bad++; };

await page.goto(base + '/');
// wait for the precache to finish
let precached = 0;
for (let i = 0; i < 180; i++) {
  precached = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg || !reg.active || reg.installing) return 0;
    const names = await caches.keys();
    const pc = names.find((n) => n.includes('precache'));
    return pc ? (await (await caches.open(pc)).keys()).length : 0;
  });
  if (precached >= 600) break;
  await page.waitForTimeout(1000);
}
check(precached >= 600, `service worker installed and precached ${precached} files`);
await page.reload();
await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 20000 });

// Orthodox side, online first: the saint icons download once in the background (js/offline-packs.js)
await page.goto(base + '/');
await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
await page.goto(base + '/');
await page.waitForTimeout(1500);
await page.evaluate(() => { const f = document.querySelector('[data-entry-family="eastern"]'); f && f.click(); });
await page.waitForTimeout(500);
await page.evaluate(() => { const b = document.querySelector('[data-entry-tradition="eastern-orthodox"]'); b && b.click(); });
await page.waitForTimeout(1500);
await page.evaluate(() => { const el = [...document.querySelectorAll('button, a')].find((e) => e.offsetParent !== null && /^\s*begin/i.test(e.innerText)); el && el.click(); });
let icons = 0;
for (let i = 0; i < 120 && icons < 200; i++) {
  icons = await page.evaluate(async () => (await (await caches.open('uo-icons')).keys()).length);
  if (icons < 200) await page.waitForTimeout(1000);
}
check(icons >= 200, `saint icons downloaded on first Orthodox entry: ${icons} in the icon cache`);

failures.length = 0;
await context.setOffline(true);

async function clickText(re) {
  return page.evaluate((src) => {
    const rx = new RegExp(src, 'i');
    const el = [...document.querySelectorAll('button, a, [role=button]')].find((e) => e.offsetParent !== null && rx.test(e.innerText));
    if (el) el.click();
    return !!el;
  }, re.source);
}
async function tradition(name, familyButton, waitText, steps = []) {
  await page.goto(base + '/');
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
  await page.goto(base + '/');
  await page.waitForTimeout(1500);
  if (familyButton) await page.evaluate((f) => { const b = document.querySelector(`[data-entry-family="${f}"]`); b && b.click(); }, familyButton);
  await page.waitForTimeout(500);
  await page.evaluate((t) => { const b = document.querySelector(`[data-entry-tradition="${t}"]`); b && b.click(); }, name);
  for (const step of steps) { await page.waitForTimeout(1500); await clickText(step); }
  await page.waitForTimeout(6000);
  const txt = await page.evaluate(() => (document.getElementById('office-display') || {}).innerText || '');
  if (process.env.DEBUG_OFFLINE) console.log('  body:', (await page.evaluate(() => document.body.innerText)).slice(0, 300).replace(/\s+/g, ' '));
  check(txt.length > 300 && waitText.test(txt), `${name} offline: ${txt.slice(0, 70).replace(/\s+/g, ' ')}...`);
}
await tradition('latin-catholic', 'western', /Roman Breviary|Matutinum|Laudes|Deus/);
await tradition('anglican', 'western', /Psalm|Lord|Morning|Evening|Prayer/);
await tradition('eastern-orthodox', 'eastern', /Lord|Glory|Amen|Psalm|Trisagion|Holy/, [/^\s*begin/]);
await tradition('church-of-the-east', 'eastern', /Lord|Glory|Amen|Psalm|Ramsha|Holy/, [/Assyrian Church/, /^\s*begin/]);
await tradition('oriental-orthodox', 'eastern', /Lord|Glory|Amen|Psalm|Holy|Prayer/, [/^\s*begin/]);

const iconOk = await page.evaluate(async () => { try { const r = await fetch('/images/icons/anthony-great.jpg'); return r.ok; } catch (e) { return false; } });
check(iconOk, 'a saint icon is served offline');

// a second Breviary date, to prove the engine runs offline for dates that were never opened
const rb = await page.evaluate(async () => {
  try { const e = await RomanBreviary1960DevSlice.resolveDevSliceOffice({ date: '2033-05-17', hour: 'vespers', language: 'en' }); return e.blocks.length; } catch (err) { return 'ERR ' + err.message; }
});
check(typeof rb === 'number' && rb > 3, `Roman Breviary for a never-opened date (2033-05-17, English): ${rb} blocks`);

const unique = [...new Set(failures)].filter((u) => !u.includes('/images/'));
check(unique.length === 0, `no failed same-origin requests while offline${unique.length ? ': ' + unique.slice(0, 8).join(', ') : ''}`);
const imgFails = [...new Set(failures)].filter((u) => u.includes('/images/'));
if (imgFails.length) console.log(`note: ${imgFails.length} image(s) not cached offline (expected for images never viewed): ${imgFails.slice(0, 3).join(', ')}`);

await browser.close();
server.close();
process.exit(bad ? 1 : 0);
