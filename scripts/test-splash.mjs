// Opening screen test (js/splash.js, css/splash.css): plays about five seconds, then waits for a tap and never
// leaves by itself; once per browser session; a tap moves past it at any time; automated browsers skip it unless ?splash=force; a still version for reduced motion.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }
const port = 3800 + Math.floor(Math.random() * 90);
const server = spawn('node', ['scripts/dev-spa-server.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const base = `http://localhost:${port}/`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
let bad = 0;
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${msg}`); if (!ok) bad++; };
const present = (page) => page.locator('#uo-splash').count().then((n) => n > 0);
const NOT_AUTOMATED = () => Object.defineProperty(navigator, 'webdriver', { get: () => false });

// Forced: name shown at once, still there at 4.5 s, gone by 6 s.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
  const page = await ctx.newPage();
  const t0 = Date.now();
  await page.goto(base + '?splash=force');
  check(await present(page), 'the opening screen shows');
  check((await page.locator('#uo-splash').getAttribute('aria-label')) === 'The Universal Office', 'it is named "The Universal Office" for screen readers');
  check(/Universal/.test(await page.locator('.uo-sp-name').textContent()) && /Office/.test(await page.locator('.uo-sp-name').textContent()), 'it displays the name of the app');
  const text = await page.locator('.uo-sp-lines').textContent();
  check(['Anglican', 'Roman', 'Coptic', 'Byzantine', 'Church of the East'].every((w) => text.includes(w)), 'it names the five traditions');
  const box = await page.locator('#uo-splash').boundingBox();
  check(box.width === 390 && box.height === 800, 'it fills the screen');
  await page.waitForTimeout(Math.max(0, 6500 - (Date.now() - t0)));
  check(await present(page), 'still showing at 6.5 seconds: it does not move on by itself');
  check(await page.locator('.uo-sp-hint').evaluate((e) => Number(getComputedStyle(e).opacity) > 0.4), '"Tap to continue" is showing by then');
  await page.waitForTimeout(Math.max(0, 11000 - (Date.now() - t0)));
  check(await present(page), 'still waiting at 11 seconds');
  await page.locator('#uo-splash').click();
  await page.waitForTimeout(1000);
  check(!(await present(page)), 'a tap then moves past it');
  check(!(await page.evaluate(() => document.documentElement.classList.contains('uo-splash-on'))), 'scrolling is unlocked afterwards');
  await ctx.close();
}
// Automated browsers skip it unless forced.
{
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.goto(base); await page.waitForTimeout(500);
  check(!(await present(page)), 'an automated browser does not show it (tests are not held up)');
  await ctx.close();
}
// Once per session: shown on the first load, not on a reload in the same tab.
{
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.addInitScript(NOT_AUTOMATED);
  await page.goto(base);
  check(await present(page), 'a real browser shows it on the first load');
  await page.reload(); await page.waitForTimeout(500);
  check(!(await present(page)), '...and not again when the page is reloaded in the same session');
  await ctx.close();
}
// A tap moves past it.
{
  const ctx = await browser.newContext({ hasTouch: true }); const page = await ctx.newPage();
  await page.addInitScript(NOT_AUTOMATED);
  await page.goto(base);
  await page.waitForTimeout(800);
  await page.locator('#uo-splash').click();
  await page.waitForTimeout(1000);
  check(!(await present(page)), 'a tap moves past it');
  await ctx.close();
}
// Keyboard: Escape.
{
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.addInitScript(NOT_AUTOMATED);
  await page.goto(base);
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  check(!(await present(page)), 'Escape moves past it');
  await ctx.close();
}
// Reduced motion: shown, with the whole picture visible at once.
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce' }); const page = await ctx.newPage();
  await page.goto(base + '?splash=force'); await page.waitForTimeout(300);
  const ops = await page.evaluate(() => ['.uo-sp-main', '.uo-sp-lines', '.uo-sp-cross'].map((q) => getComputedStyle(document.querySelector(q)).opacity));
  check(ops.every((o) => o === '1'), 'with reduced motion the name, traditions and cross are all visible at once');
  await ctx.close();
}
// The app underneath still works after it.
{
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '?splash=force'); await page.waitForTimeout(800);
  await page.locator('#uo-splash').click(); await page.waitForTimeout(1200);
  check((await page.locator('#tradition-entry, #app-body').count()) > 0 && errors.length === 0, 'the app is there afterwards, with no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await ctx.close();
}
await browser.close(); server.kill();
console.log(bad === 0 ? 'PASS splash' : `FAIL splash (${bad})`);
process.exit(bad === 0 ? 0 : 1);
