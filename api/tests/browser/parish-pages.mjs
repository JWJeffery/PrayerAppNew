// Browser tests for the parish home page, the dashboard "Parish page" tab, the diocesan page and the admin
// diocese editor. Driven by api/tests/t96_pages_browser.php:  node parish-pages.mjs <fixtures.json>
// Prints "  ok   name" / "  FAIL name -- detail" lines that run.php folds into its totals.
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const fx = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const BASE = fx.base;

let playwright;
try { playwright = await import('playwright'); }
catch (e) {
  try { playwright = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright'); }
  catch (e2) { console.log('  SKIP browser tests (Playwright is not installed here)'); process.exit(0); }
}
const { chromium } = playwright.chromium ? playwright : playwright.default;

const t = (name, ok, detail = '') => console.log(ok ? `  ok   ${name}` : `  FAIL ${name}${detail ? ' -- ' + detail : ''}`);
const browser = await chromium.launch();
const problems = { dialogs: [], csp: [], errors: [] };
async function newPage(init) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } }); // phone width
  const page = await ctx.newPage();
  page.on('dialog', (d) => { problems.dialogs.push(d.message()); d.dismiss(); });
  page.on('pageerror', (e) => problems.errors.push(String(e)));
  page.on('console', (m) => { if (/content security policy/i.test(m.text())) problems.csp.push(m.text().slice(0, 160)); });
  if (init) await page.addInitScript(init[0], init[1]);
  return page;
}
const pwned = (page) => page.evaluate(() => window.__pwned === 1);
const noSideScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

// ------------------------------------------------------------ public parish page, hostile text inert
console.log('Browser: parish home page');
{
  const page = await newPage();
  await page.goto(`${BASE}/parish/home.html?p=${fx.open}`);
  await page.waitForSelector('#view-parish:not([hidden])', { timeout: 8000 });
  const text = await page.locator('#view-parish').innerText();
  t('home page shows the announcement, service times, event and address as literal text',
    text.includes('Funeral ' + fx.hostile) && text.includes('Wednesday 7:00 pm') && text.includes('Vestry ' + fx.hostile)
    && text.includes('1 <b>Main</b> St') && text.includes('Hall ' + fx.hostile));
  t('hostile markup created no elements and ran no script',
    (await page.locator('#view-parish img').count()) === 0 && (await page.locator('#view-parish b').count()) === 0 && !(await pwned(page)));
  t('the rector line is shown', (await page.locator('#parish-rector').innerText()).includes('Rector: '));
  t('the website is a safe external link', await page.evaluate(() => {
    const a = document.querySelector('#dd-website a');
    return !!a && a.href === 'https://open.example.org/' && /noopener/.test(a.rel) && a.target === '_blank';
  }));
  t('the diocese link points at the diocesan page', (await page.locator('#diocese-link').getAttribute('href')) === 'diocese.html?d=' + encodeURIComponent(fx.diocese));
  t('no sideways scroll at phone width', await noSideScroll(page));

  // Follow, then the app applies it.
  await page.getByRole('button', { name: 'Follow this parish' }).click();
  t('Follow leaves a follow request and swaps the buttons', await page.evaluate((slug) => {
    const r = JSON.parse(localStorage.getItem('universalOffice.parishFollowRequest.v1') || 'null');
    return !!r && r.slug === slug && document.getElementById('btn-follow').hidden && !document.getElementById('btn-unfollow').hidden;
  }, fx.open));
  await page.goto(`${BASE}/index.html`);
  await page.waitForFunction(() => {
    try { return JSON.parse(localStorage.getItem('universalOffice.userProfile.v1') || 'null').parishIntentionsSlug; } catch (e) { return false; }
  }, null, { timeout: 15000 }).catch(() => {});
  const applied = await page.evaluate(() => ({
    slug: (JSON.parse(localStorage.getItem('universalOffice.userProfile.v1') || 'null') || {}).parishIntentionsSlug || null,
    request: localStorage.getItem('universalOffice.parishFollowRequest.v1')
  }));
  t('the app applies the follow request at startup and removes it', applied.slug === fx.open && applied.request === null, JSON.stringify(applied));
  await page.goto(`${BASE}/parish/home.html?p=${fx.open}`);
  await page.waitForSelector('#view-parish:not([hidden])');
  t('the page now shows "Stop following" (read from the profile)', !(await page.locator('#btn-unfollow').isHidden()));
  await page.getByRole('button', { name: 'Stop following' }).click();
  await page.goto(`${BASE}/index.html`);
  await page.waitForFunction(() => localStorage.getItem('universalOffice.parishFollowRequest.v1') === null, null, { timeout: 15000 }).catch(() => {});
  t('stopping through the page clears the profile at the next app start', await page.evaluate(() =>
    ((JSON.parse(localStorage.getItem('universalOffice.userProfile.v1') || 'null') || {}).parishIntentionsSlug || null) === null));
  await page.context().close();
}

// ------------------------------------------------------------ code-only parish: join flow
console.log('Browser: join code on the parish page');
{
  const page = await newPage();
  await page.goto(`${BASE}/parish/home.html?p=${fx.coded}`);
  await page.waitForSelector('#view-code:not([hidden])', { timeout: 8000 });
  t('a code-only parish asks for the join code and shows nothing else', (await page.locator('#view-parish').isHidden()));
  await page.fill('#join-code', 'WRONG-CODE');
  await page.getByRole('button', { name: 'Join this parish' }).click();
  await page.waitForSelector('#join-status:not([hidden])');
  t('a wrong code is refused with a plain message', (await page.locator('#join-status').innerText()).includes('not accepted'));
  await page.fill('#join-code', fx.joinCode);
  await page.getByRole('button', { name: 'Join this parish' }).click();
  await page.waitForSelector('#view-parish:not([hidden])', { timeout: 8000 });
  t('the right code opens the page and the parish is followed', await page.evaluate((slug) => {
    const r = JSON.parse(localStorage.getItem('universalOffice.parishFollowRequest.v1') || 'null');
    return document.getElementById('h-parish').textContent === 'Grace Church' && !!r && r.slug === slug && typeof r.pass === 'string' && r.pass.length > 20;
  }, fx.coded));
  const missing = await newPage();
  await missing.goto(`${BASE}/parish/home.html?p=no-such-parish`);
  await missing.waitForSelector('#view-missing:not([hidden])', { timeout: 8000 });
  t('an unknown parish shows the "not available" page', true);
  await missing.goto(`${BASE}/parish/home.html?p=Bad_Slug!`);
  await missing.waitForSelector('#view-missing:not([hidden])', { timeout: 8000 });
  t('a malformed address shows the "not available" page', true);
  await page.context().close(); await missing.context().close();
}

// ------------------------------------------------------------ diocesan page
console.log('Browser: diocesan page');
{
  const page = await newPage();
  await page.goto(`${BASE}/parish/diocese.html?d=${fx.diocese}`);
  await page.waitForSelector('#view-diocese:not([hidden])', { timeout: 8000 });
  const text = await page.locator('#view-diocese').innerText();
  t('bishop, prayer list and dates show as literal text',
    text.includes('Bishop: Bishop ' + fx.hostile) && text.includes('For all clergy ' + fx.hostile) && text.includes('Convention <script>window.__pwned=1</script>'));
  t('hostile markup created no elements and ran no script',
    (await page.locator('#view-diocese img').count()) === 0 && (await page.locator('#view-diocese script').count()) === 0 && !(await pwned(page)));
  t('both registered parishes are listed with links to their pages', await page.evaluate(() =>
    [...document.querySelectorAll('#list-parishes a')].map((a) => a.getAttribute('href')).sort().join() === 'home.html?p=grace-pages,home.html?p=open-pages'));
  await page.waitForFunction(() => !document.getElementById('wrap-today').hidden, null, { timeout: 8000 }).catch(() => {});
  t('"pray for a parish today" names one of the diocese\'s parishes', await page.evaluate(() => {
    const name = document.getElementById('today-rotation-name').textContent;
    return !document.getElementById('today-rotation').hidden && ['Grace Church', 'Open Church'].includes(name)
      && /^home\.html\?p=(grace|open)-pages$/.test(document.getElementById('today-rotation-link').getAttribute('href'));
  }));
  t('no sideways scroll at phone width', await noSideScroll(page));
  const bad = await newPage();
  await bad.goto(`${BASE}/parish/diocese.html?d=nonsense`);
  await bad.waitForSelector('#view-missing:not([hidden])', { timeout: 8000 });
  t('a malformed diocese key shows the "not available" page', true);
  await page.context().close(); await bad.context().close();
}

// ------------------------------------------------------------ rector dashboard: Parish page tab
console.log('Browser: dashboard "Parish page" tab');
{
  const page = await newPage([(tok) => localStorage.setItem('uoParishSession', JSON.stringify({ token: tok, expires_at: '2099-01-01T00:00:00Z' })), fx.rectorToken]);
  await page.goto(`${BASE}/parish/index.html`);
  await page.getByRole('tab', { name: 'Parish page' }).click();
  await page.waitForSelector('#form-profile', { state: 'visible', timeout: 8000 });
  await page.fill('#prof-rector', 'The Rev. ' + fx.hostile);
  await page.fill('#prof-address', '5 <b>Elm</b> Rd');
  await page.fill('#prof-website', 'javascript:alert(1)');
  await page.fill('#prof-times', 'Sunday 8:00 am\n\nSunday 10:00 am');
  await page.getByRole('button', { name: 'Save parish details' }).click();
  await page.waitForSelector('#profile-status.bad', { timeout: 8000 });
  t('a javascript: website is refused with a plain message', (await page.locator('#profile-status').innerText()).toLowerCase().includes('web address'));
  await page.fill('#prof-website', 'https://grace.example.org');
  await page.getByRole('button', { name: 'Save parish details' }).click();
  await page.waitForSelector('#profile-status.ok', { timeout: 8000 });
  t('valid details save', true);

  await page.fill('#ann-text', 'Evensong moved to 6 pm ' + fx.hostile);
  await page.fill('#ann-days', '3');
  await page.getByRole('button', { name: 'Post announcement' }).click();
  await page.waitForSelector('#list-announce .item', { timeout: 8000 });
  t('the announcement is listed as literal text with its expiry',
    (await page.locator('#list-announce').innerText()).includes('Evensong moved to 6 pm ' + fx.hostile) && (await page.locator('#list-announce img').count()) === 0);

  await page.fill('#ev-title', 'Parish supper ' + fx.hostile);
  await page.fill('#ev-date', new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10));
  await page.fill('#ev-time', '18:30');
  await page.getByRole('button', { name: 'Add event' }).click();
  await page.waitForSelector('#list-events .item', { timeout: 8000 });
  t('the event is listed as literal text', (await page.locator('#list-events').innerText()).includes('Parish supper ' + fx.hostile) && (await page.locator('#list-events img').count()) === 0);

  await page.locator('#list-announce').getByRole('button', { name: 'Remove' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Remove' }).click();
  await page.waitForFunction(() => document.querySelectorAll('#list-announce .item').length === 0, null, { timeout: 8000 });
  t('removing an announcement asks first, then removes it', true);

  // The public link opens the page the reader sees.
  const href = await page.locator('#pages-public-link').getAttribute('href');
  t('the dashboard links to the parish\'s own public page', href === 'home.html?p=grace-pages', href);
  t('no sideways scroll at phone width', await noSideScroll(page));
  await page.context().close();
}

// ------------------------------------------------------------ admin: diocese editor
console.log('Browser: admin diocese editor');
{
  const page = await newPage([(tok) => localStorage.setItem('uoAdminSession', JSON.stringify({ token: tok, expires_at: '2099-01-01T00:00:00Z' })), fx.adminToken]);
  await page.goto(`${BASE}/parish/admin.html`);
  await page.waitForSelector('#dio-select', { state: 'visible', timeout: 8000 });
  await page.selectOption('#dio-select', fx.diocese);
  await page.waitForSelector('#dio-edit:not([hidden])');
  await page.waitForFunction(() => document.getElementById('dio-bishop').value.length > 0, null, { timeout: 8000 });
  t('choosing a diocese loads its saved fields', (await page.inputValue('#dio-bishop')).startsWith('Bishop '));
  await page.fill('#dio-bishop', 'The Rt. Rev. Diane Doe');
  await page.fill('#dio-dates', 'Convention: Oct 23-24, 2026\nStanding committee: Nov 5');
  await page.getByRole('button', { name: 'Save diocesan page' }).click();
  await page.waitForSelector('#dio-status.ok', { timeout: 8000 });
  await page.fill('#dp-text', 'For our new deacons');
  await page.getByRole('button', { name: 'Add to the list' }).click();
  await page.waitForFunction(() => [...document.querySelectorAll('#dp-list .item')].some((li) => li.textContent.includes('For our new deacons')), null, { timeout: 8000 });
  t('saving and adding a prayer item works through the page', true);
  const pub = await newPage();
  await pub.goto(`${BASE}/parish/diocese.html?d=${fx.diocese}`);
  await pub.waitForSelector('#view-diocese:not([hidden])');
  const text = await pub.locator('#view-diocese').innerText();
  t('readers see the administrator\'s changes', text.includes('The Rt. Rev. Diane Doe') && text.includes('Standing committee: Nov 5') && text.includes('For our new deacons'));
  await page.context().close(); await pub.context().close();
}

console.log('Browser: parish pages overall');
t('no alert dialogs opened', problems.dialogs.length === 0, problems.dialogs.join(' | '));
t('no Content-Security-Policy violations', problems.csp.length === 0, problems.csp.join(' | '));
t('no uncaught page errors', problems.errors.length === 0, problems.errors.join(' | '));
await browser.close();
