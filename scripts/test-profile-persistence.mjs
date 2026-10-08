// Profile persistence test: the saved profile must survive closing and reopening the browser, and must not be lost
// when the startup availability file fails to load. Serves the repo with the dev server and drives Chromium.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }
const port = 4000 + Math.floor(Math.random() * 90);
const server = spawn('node', ['scripts/dev-spa-server.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const base = `http://localhost:${port}/`;
const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
let bad = 0;
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${msg}`); if (!ok) bad++; };
const profileOf = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('universalOffice.userProfile.v1') || 'null'));

// 1. Close and reopen the browser (a real restart of the app): nothing is lost.
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uo-persist-'));
  const open = () => chromium.launchPersistentContext(dir, { executablePath: exe, viewport: { width: 390, height: 850 }, isMobile: true, hasTouch: true });
  let ctx = await open(); let page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(base); await page.waitForTimeout(2000);
  await page.locator('[data-entry-family="western"]').click();
  await page.locator('[data-entry-tradition="anglican"]').first().click();
  await page.waitForTimeout(2000);
  await page.evaluate(() => { setUserProfileDisplayName('Bernie'); setUserProfileMinistryRole('reader'); });
  await page.waitForTimeout(500);
  await ctx.close();
  ctx = await open(); page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(base); await page.waitForTimeout(2500);
  const p = await profileOf(page);
  check(p && p.displayName === 'Bernie' && p.ministryRole === 'reader' && p.traditionDefault === 'anglican', 'name, role and tradition survive closing and reopening the browser');
  check(await page.locator('#tradition-entry').evaluate((e) => getComputedStyle(e).display === 'none'), '...and the app opens straight into the office, not "Where do you pray?"');
  await page.evaluate(() => openUserProfilePanel());
  const note = await page.locator('#profile-storage-note').textContent();
  check(/saved on this device since/.test(note), 'the profile panel says how long the settings have been kept on this device: ' + note.trim());
  await ctx.close();
  fs.rmSync(dir, { recursive: true, force: true });
}

// 2. A failed availability file at launch must not delete the profile (it used to, for Eastern Orthodox readers).
for (const mode of ['abort', 'timeout']) {
  const browser = await chromium.launch({ executablePath: exe });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 850 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { if (!localStorage.getItem('universalOffice.userProfile.v1')) localStorage.setItem('universalOffice.userProfile.v1', JSON.stringify({ version: 1, entryPageDefault: 'tradition', traditionDefault: 'eastern-orthodox', displayName: 'Bernie', onboardingComplete: true })); });
  await page.route('**/data/tradition-availability.json', (r) => mode === 'abort' ? r.abort() : new Promise(() => {}));
  await page.goto(base); await page.waitForTimeout(4000);
  const p = await profileOf(page);
  check(p && p.displayName === 'Bernie' && p.traditionDefault === 'eastern-orthodox', `an Eastern Orthodox profile survives the availability file failing to load (${mode})`);
  await browser.close();
}

// 3. A tradition the admin has really paused: only the opening tradition is forgotten, the rest of the profile stays.
{
  const browser = await chromium.launch({ executablePath: exe });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 850 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { if (!localStorage.getItem('universalOffice.userProfile.v1')) localStorage.setItem('universalOffice.userProfile.v1', JSON.stringify({ version: 1, entryPageDefault: 'tradition', traditionDefault: 'eastern-orthodox', displayName: 'Bernie', ministryRole: 'reader', onboardingComplete: true })); });
  await page.route('**/data/tradition-availability.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ traditions: { 'eastern-orthodox': { available: false, reason: 'Paused' }, anglican: { available: true } } }) }));
  await page.goto(base); await page.waitForTimeout(2500);
  const p = await profileOf(page);
  check(p && p.displayName === 'Bernie' && p.ministryRole === 'reader' && p.traditionDefault === null, 'a paused tradition is forgotten as the opening choice, but the name and role are kept');
  check(await page.locator('#tradition-entry').evaluate((e) => getComputedStyle(e).display !== 'none'), '...and the reader is asked where they pray');
  await browser.close();
}

// 4. The browser clears localStorage but leaves IndexedDB: the backup copy puts the profile back at launch.
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uo-backup-'));
  const open = () => chromium.launchPersistentContext(dir, { executablePath: exe, viewport: { width: 390, height: 850 }, isMobile: true, hasTouch: true });
  let ctx = await open(); let page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(base); await page.waitForTimeout(2000);
  await page.locator('[data-entry-family="western"]').click();
  await page.locator('[data-entry-tradition="anglican"]').first().click();
  await page.waitForTimeout(2000);
  await page.evaluate(() => { setUserProfileDisplayName('Bernie'); setUserProfileMinistryRole('reader'); });
  await page.waitForTimeout(1200);
  // What a clean-up on the phone does: the app is not running, localStorage is emptied, IndexedDB is left alone.
  await page.goto('about:blank');
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Storage.clearDataForOrigin', { origin: new URL(base).origin, storageTypes: 'local_storage' });
  await page.goto(base); await page.waitForTimeout(2500);
  const p = await profileOf(page);
  check(p && p.displayName === 'Bernie' && p.ministryRole === 'reader' && p.traditionDefault === 'anglican', 'the backup copy restores the profile when localStorage comes up empty');
  check(await page.locator('#tradition-entry').evaluate((e) => getComputedStyle(e).display === 'none'), '...and the app opens straight into the office');
  await page.evaluate(() => openUserProfilePanel());
  check(/Restored from a backup copy/.test(await page.locator('#profile-storage-note').textContent()), '...and the profile panel says it was restored');
  // A deliberate reset must not be undone by the backup.
  await page.evaluate(() => resetUniversalOfficeUserProfile());
  await page.waitForTimeout(1200);
  await page.goto('about:blank');
  await cdp.send('Storage.clearDataForOrigin', { origin: new URL(base).origin, storageTypes: 'local_storage' });
  await page.goto(base); await page.waitForTimeout(2500);
  check((await profileOf(page)) === null || !(await profileOf(page)).displayName, 'after "Reset local defaults" the backup does not bring the profile back');
  check(await page.locator('#tradition-entry').evaluate((e) => getComputedStyle(e).display !== 'none'), '...the reader is asked where they pray');
  await ctx.close();
  fs.rmSync(dir, { recursive: true, force: true });
}
server.kill();
console.log(bad === 0 ? 'PASS profile persistence' : `FAIL profile persistence (${bad})`);
process.exit(bad === 0 ? 0 : 1);
