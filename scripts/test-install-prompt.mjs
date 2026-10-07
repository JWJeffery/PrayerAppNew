// Install banner test (js/install-prompt.js). Serves the repo with the dev server and drives Chromium with
// phone user agents: nothing on a first visit; steps on iPhone and Android from the second visit; the
// browser's own Install button when Android offers one; "Not now" and "Don't show again" stick; nothing when
// already installed; nothing on a computer; the profile-panel section is always there.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }

const port = 3900 + Math.floor(Math.random() * 90);
const server = spawn('node', ['scripts/dev-spa-server.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const base = `http://localhost:${port}/`;
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const IPHONE_CHROME = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Mobile Safari/537.36';
const DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
let bad = 0;
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${msg}`); if (!ok) bad++; };
const errors = [];

async function phone(ua, { visits, standalone } = {}) {
  const ctx = await browser.newContext({ userAgent: ua, viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: !ua.includes('Macintosh') });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript(([v, sa]) => {
    try {
      if (v !== undefined && !localStorage.getItem('uoInstall.visits')) localStorage.setItem('uoInstall.visits', String(v));
      localStorage.setItem('universalOffice.onboarding', localStorage.getItem('universalOffice.onboarding') || '');
    } catch (e) {}
    if (sa) { const real = window.matchMedia.bind(window); window.matchMedia = (q) => /display-mode: standalone/.test(q) ? { matches: true, media: q, addEventListener() {}, removeEventListener() {} } : real(q); }
  }, [visits, standalone]);
  return { ctx, page };
}
const banner = (page) => page.locator('#uo-install-banner');
const waitBanner = (page, ms = 12000) => page.waitForSelector('#uo-install-banner', { timeout: ms }).then(() => true, () => false);

// First visit: nothing, even after the delay.
{
  const { ctx, page } = await phone(IPHONE);
  await page.goto(base); await page.waitForTimeout(8500);
  check((await banner(page).count()) === 0, 'no banner on a first visit');
  const t = await page.locator('#install-section').innerText();
  check(/Install this app/.test(t) && /Share/.test(t) && /Add to Home Screen/.test(t), 'the profile-panel section shows the iPhone steps even on a first visit');
  await ctx.close();
}
// Second visit on iPhone Safari: steps, no Install button.
{
  const { ctx, page } = await phone(IPHONE, { visits: 1 });
  await page.goto(base);
  check(await waitBanner(page), 'banner appears on the second visit (iPhone)');
  const t = await banner(page).innerText();
  check(/Share/.test(t) && /Add to Home Screen/.test(t) && /Add/.test(t), 'iPhone banner gives the Share / Add to Home Screen steps');
  check((await banner(page).getByRole('button', { name: 'Install', exact: true }).count()) === 0, 'iPhone banner has no fake Install button');
  check(!/Open this page in Safari/.test(t), 'no Safari hint when already in Safari');
  const box = await banner(page).boundingBox();
  check(box && box.x >= 0 && box.x + box.width <= 390 && box.y >= 0, 'banner fits a phone screen');
  await banner(page).getByRole('button', { name: 'Not now' }).click();
  check((await banner(page).count()) === 0, '"Not now" closes it');
  await page.reload(); await page.waitForTimeout(8500);
  check((await banner(page).count()) === 0, '...and it stays away on the next load (snoozed)');
  await ctx.close();
}
// iPhone in Chrome: Safari hint.
{
  const { ctx, page } = await phone(IPHONE_CHROME, { visits: 1 });
  await page.goto(base);
  await waitBanner(page);
  check(/Open this page in Safari/.test(await banner(page).innerText()), 'a non-Safari iPhone browser is told to try Safari if it does not see the option');
  await banner(page).getByRole('button', { name: /Don.t show again/ }).click();
  await page.reload(); await page.waitForTimeout(8500);
  check((await banner(page).count()) === 0, '"Don\'t show again" is permanent');
  await ctx.close();
}
// Android with the browser's own offer.
{
  const { ctx, page } = await phone(ANDROID, { visits: 1 });
  await page.addInitScript(() => {
    window.__prompted = 0;
    window.addEventListener('DOMContentLoaded', () => setTimeout(() => {
      const ev = new Event('beforeinstallprompt', { cancelable: true });
      ev.prompt = () => { window.__prompted++; return Promise.resolve(); };
      ev.userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(ev);
    }, 500));
  });
  await page.goto(base);
  check(await waitBanner(page), 'banner appears on Android');
  const install = banner(page).getByRole('button', { name: 'Install', exact: true });
  check((await install.count()) === 1, 'Android banner has an Install button when the browser offers one');
  await install.click();
  await page.waitForTimeout(500);
  check((await page.evaluate(() => window.__prompted)) === 1, 'tapping Install opens the browser\'s own install prompt');
  check((await banner(page).count()) === 0, 'the banner closes after an accepted install');
  await ctx.close();
}
// Android without an offer: menu steps.
{
  const { ctx, page } = await phone(ANDROID, { visits: 1 });
  await page.goto(base);
  check(await waitBanner(page, 15000), 'Android banner appears even when the browser makes no offer');
  const t = await banner(page).innerText();
  check(/three dots/.test(t) && /Install app|Add to Home screen/.test(t), '...showing the menu steps');
  await ctx.close();
}
// Already installed: nothing, and the section says so.
{
  const { ctx, page } = await phone(IPHONE, { visits: 5, standalone: true });
  await page.goto(base); await page.waitForTimeout(8500);
  check((await banner(page).count()) === 0, 'no banner when running as an installed app');
  check(/already has/.test(await page.locator('#install-section').innerText()), '...and the section says it is installed');
  await ctx.close();
}
// Computer: no banner, but the section explains.
{
  const { ctx, page } = await phone(DESKTOP, { visits: 5 });
  await page.goto(base); await page.waitForTimeout(8500);
  check((await banner(page).count()) === 0, 'no banner on a computer');
  check(/address bar/.test(await page.locator('#install-section').innerText()), '...but the profile-panel section explains how to install');
  await ctx.close();
}
check(errors.length === 0, 'no uncaught page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close();
server.kill();
console.log(bad === 0 ? 'PASS install prompt' : `FAIL install prompt (${bad})`);
process.exit(bad === 0 ? 0 : 1);
