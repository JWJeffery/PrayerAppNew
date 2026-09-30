// Browser tests for the parish pages (dashboard, admin, registration, approval). Driven by
// api/tests/run.php, which builds the fixtures and starts the throwaway server, then runs:
//   node api/tests/browser/pages.mjs <fixtures.json>
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function mailMessages() {
  let raw = '';
  try { raw = fs.readFileSync(fx.mailLog, 'utf8'); } catch (e) { return []; }
  return raw.split(/^=== END ===\n/m).map((c) => {
    const m = c.match(/^=== MAIL [^\n]*===\nTo: ([^\n]*)\nSubject: ([^\n]*)\n\n([\s\S]*)$/);
    return m ? { to: m[1], subject: m[2], body: m[3] } : null;
  }).filter(Boolean);
}
async function codeFor(email) {
  for (let i = 0; i < 40; i++) {
    for (const m of mailMessages().reverse()) {
      const x = m.to === email && m.body.match(/\b(\d{6})\b/);
      if (x) return x[1];
    }
    await sleep(100);
  }
  return null;
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
const problems = { dialogs: [], csp: [], errors: [] };
function watch(page) {
  page.on('dialog', (d) => { problems.dialogs.push(d.message()); d.dismiss(); });
  page.on('pageerror', (e) => problems.errors.push(String(e)));
  page.on('console', (m) => { if (/content security policy/i.test(m.text())) problems.csp.push(m.text().slice(0, 160)); });
}
async function withSession(storageKey, token, path) {
  // A fresh browser profile each time, so one test's stored session can never leak into another.
  const own = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await own.newPage(); watch(page);
  await page.addInitScript(([k, tok]) => {
    window.localStorage.setItem(k, JSON.stringify({ token: tok, expires_at: '2099-01-01T00:00:00Z' }));
  }, [storageKey, token]);
  await page.goto(BASE + path);
  return page;
}

// ---------------------------------------------------------------- hostile text is inert (spec test 11)
console.log('Browser: hostile text stays inert');
{
  const page = await withSession('uoParishSession', fx.xss.rectorToken, '/parish/index.html');
  await page.waitForSelector('#list-current .item', { timeout: 8000 });
  const scriptsBefore = await page.evaluate(() => document.querySelectorAll('script').length);
  await page.getByRole('tab', { name: 'Parish settings' }).click();
  await page.waitForSelector('#people li', { timeout: 8000 });
  await sleep(300);

  const texts = await page.$$eval('#list-current .item-text', (els) => els.map((e) => e.textContent));
  t('every hostile request appears as literal text', fx.xss.payloads.every((p) => texts.includes(p)), JSON.stringify(fx.xss.payloads.filter((p) => !texts.includes(p))));
  const injected = await page.evaluate(() => ({
    pwned: window.__pwned === undefined ? null : window.__pwned,
    img: document.querySelectorAll('img[src="x"]').length,
    svg: document.querySelectorAll('svg').length,
    scripts: document.querySelectorAll('script').length,
    inlineHandlers: [...document.querySelectorAll('*')].filter((e) => [...e.attributes].some((a) => a.name.startsWith('on'))).length,
  }));
  t('no script ran (window.__pwned was never set)', injected.pwned === null, String(injected.pwned));
  t('no injected <img>, <svg> or event-handler attributes exist', injected.img === 0 && injected.svg === 0 && injected.inlineHandlers === 0, JSON.stringify(injected));
  t('no extra <script> elements were created', injected.scripts === scriptsBefore, `${scriptsBefore} -> ${injected.scripts}`);
  t('no alert/confirm/prompt fired', problems.dialogs.length === 0, problems.dialogs.join('|'));
  const title = await page.textContent('#h-dash');
  t('the hostile parish name is shown as literal text in the heading', title === fx.xss.parishName, title);
  const people = await page.$$eval('#people li', (els) => els.map((e) => e.textContent).join('\n'));
  t('hostile staff names are shown as literal text', people.includes(fx.xss.staffName), people.slice(0, 200));
  t('no Content-Security-Policy violations were logged by the page', problems.csp.length === 0, problems.csp.join('|'));
  await page.close();

  const adminPage = await withSession('uoAdminSession', fx.admin.token, '/parish/admin.html');
  await adminPage.waitForSelector('#parish-rows tr', { timeout: 8000 });
  const rows = await adminPage.$$eval('#parish-rows tr', (els) => els.map((e) => e.textContent).join('\n'));
  t('admin page: hostile parish and staff names appear as literal text', rows.includes(fx.xss.parishName) && rows.includes(fx.xss.pendingName), rows.slice(0, 200));
  const adminInjected = await adminPage.evaluate(() => ({ pwned: window.__pwned === undefined, img: document.querySelectorAll('img[src="x"]').length, svg: document.querySelectorAll('svg').length }));
  t('admin page: nothing was injected or executed', adminInjected.pwned && adminInjected.img === 0 && adminInjected.svg === 0, JSON.stringify(adminInjected));
  t('admin page: prayer text never appears', !rows.includes(fx.xss.payloads[3]));
  t('admin page: no alert fired, no CSP violations', problems.dialogs.length === 0 && problems.csp.length === 0);
  await adminPage.close();
}

// ---------------------------------------------------------------- rector dashboard, through the UI
console.log('Browser: rector sign-in and dashboard');
{
  const page = await ctx.newPage(); watch(page);
  await page.goto(BASE + '/parish/index.html');
  t('the sign-in page shows first', await page.isVisible('#h-signin') && !(await page.isVisible('#view-dashboard')));
  await page.fill('#signin-email', fx.flow.email);
  await page.getByRole('button', { name: 'Send code' }).click();
  await page.waitForSelector('#form-code:not([hidden])');
  t('after "Send code" the code box appears', await page.isVisible('#signin-code'));
  await page.fill('#signin-code', '000000');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForSelector('#signin-status:not([hidden])');
  t('a wrong code shows a plain message and does not sign in', (await page.textContent('#signin-status')).includes('not accepted') && !(await page.isVisible('#view-dashboard')));
  const code = await codeFor(fx.flow.email);
  await page.fill('#signin-code', code);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForSelector('#view-dashboard:not([hidden])');
  t('the right code opens the dashboard with the parish name', (await page.textContent('#h-dash')) === fx.flow.parishName);
  t('the role and person are shown; Log out is visible', (await page.textContent('#dash-role')) === 'Rector' && await page.isVisible('#logout'));
  t('the privacy reminder is shown above the add form, word for word', (await page.textContent('#add-reminder')) === fx.reminder);
  t('the "nothing current" message is shown when only an expired request exists', await page.isVisible('#empty-current') && await page.isVisible('#expired-wrap'));
  const stored = await page.evaluate(() => window.localStorage.getItem('uoParishSession'));
  t('a session token is kept in localStorage (key uoParishSession)', /"token":"[0-9a-f]{64}"/.test(stored || ''));

  // add
  t('the days box defaults to 21', (await page.inputValue('#add-days')) === '21');
  await page.fill('#add-text', 'Margaret, recovering from surgery');
  t('the character counter updates live', (await page.textContent('#add-counter')) === '33 / 200');
  await page.selectOption('#add-category', 'family');
  await page.getByRole('button', { name: 'Add request' }).click();
  await page.waitForSelector('#list-current .item');
  const first = await page.textContent('#list-current .item-text');
  t('an added request appears with its text', first === 'Margaret, recovering from surgery');
  t('...its category chip and a 21-day expiry badge', (await page.textContent('#list-current .chip')) === 'Family' && /Expires in 21 days/.test(await page.textContent('#list-current .badge')));
  t('the text box is cleared and counted 0 again', (await page.inputValue('#add-text')) === '' && (await page.textContent('#add-counter')) === '0 / 200');
  await page.fill('#add-text', 'x'.repeat(190));
  t('the counter turns to a warning near the limit', (await page.getAttribute('#add-counter', 'class')).includes('warn'));
  await page.fill('#add-text', 'y'.repeat(260));
  t('the box will not accept more than 200 characters', (await page.textContent('#add-counter')) === '200 / 200');
  await page.fill('#add-text', '');
  await page.fill('#add-text', '   ');
  await page.getByRole('button', { name: 'Add request' }).click();
  t('an empty request is refused with a message', (await page.textContent('#add-status')).includes('write the request'));
  await page.fill('#add-text', 'Too long a stay'); await page.fill('#add-days', '46');
  await page.getByRole('button', { name: 'Add request' }).click();
  t('days over 45 are refused with a message', (await page.textContent('#add-status')).includes('1 to 45'));
  await page.fill('#add-days', '2'); await page.fill('#add-text', 'Short stay'); await page.selectOption('#add-category', 'situation');
  await page.getByRole('button', { name: 'Add request' }).click();
  await page.waitForFunction(() => document.querySelectorAll('#list-current .item').length === 2);
  const badges = await page.$$eval('#list-current .badge', (els) => els.map((e) => ({ t: e.textContent, c: e.className })));
  t('a request with 2 days left is highlighted as expiring soon and listed first (soonest expiry)', badges[0].c.includes('soon') && /Expires in 2 days/.test(badges[0].t) && !badges[1].c.includes('soon'), JSON.stringify(badges));

  // extend
  const margaret = page.locator('#list-current .item', { hasText: 'Margaret' });
  await margaret.getByRole('button', { name: 'Extend by 45 days' }).click();
  await page.waitForFunction(() => [...document.querySelectorAll('#list-current .item')].some((i) => /Expires in 66 days/.test(i.textContent)));
  t('extending by 45 days moves the expiry out (21 + 45 = 66 days)', true);
  t('...and records that it was extended once', (await margaret.textContent()).includes('Extended 1 time'));

  // edit
  await margaret.getByRole('button', { name: 'Edit' }).click();
  await page.waitForSelector('textarea[id^=edit-text-]');
  t('editing shows the privacy reminder again', (await page.locator('#list-current .reminder').first().textContent()) === fx.reminder);
  await page.fill('textarea[id^=edit-text-]', 'Margaret, now at home');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForFunction(() => [...document.querySelectorAll('#list-current .item-text')].some((e) => e.textContent === 'Margaret, now at home'));
  t('saving an edit updates the text', true);
  const stillExtended = await page.locator('#list-current .item', { hasText: 'now at home' }).textContent();
  t('...without changing the expiry', /Expires in 66 days/.test(stillExtended));

  // remove
  await page.locator('#list-current .item', { hasText: 'Short stay' }).getByRole('button', { name: 'Remove' }).click();
  await page.waitForSelector('dialog[open]');
  await page.getByRole('button', { name: 'Cancel' }).click();
  t('Cancel in the remove dialog keeps the request', (await page.locator('#list-current .item').count()) === 2);
  await page.locator('#list-current .item', { hasText: 'Short stay' }).getByRole('button', { name: 'Remove' }).click();
  await page.waitForSelector('dialog[open]');
  await page.locator('dialog[open]').getByRole('button', { name: 'Remove' }).click();
  await page.waitForFunction(() => document.querySelectorAll('#list-current .item').length === 1);
  t('confirming Remove deletes it', true);

  // recently expired section (fixture: one request that expired two days ago)
  t('a request that expired 2 days ago is in the "Recently expired" section, not in the current list',
    await page.isVisible('#expired-wrap') && (await page.textContent('#list-expired .item-text')) === 'Expired two days ago');
  t('...marked "Expired 2 days ago"', /Expired 2 days ago/.test(await page.textContent('#list-expired .badge')));
  await page.locator('#list-expired .item').getByRole('button', { name: 'Extend by 7 days' }).click();
  await page.waitForFunction(() => document.getElementById('expired-wrap').hidden && document.querySelectorAll('#list-current .item').length === 2);
  t('extending an expired request brings it back to the current list (7 days from now)',
    /Expires in 7 days/.test(await page.locator('#list-current .item', { hasText: 'Expired two days ago' }).textContent()));

  // settings
  await page.getByRole('tab', { name: 'Parish settings' }).click();
  await page.waitForFunction(() => /^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test((document.getElementById('join-code') || {}).textContent || ''));
  const code1 = await page.textContent('#join-code');
  t('the join code is shown, formatted ABCD-EFGH', /^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code1), code1);
  await page.getByRole('button', { name: 'Make a new code' }).click();
  await page.waitForSelector('dialog[open]');
  t('rotating explains that everyone is signed out until they re-enter it', (await page.textContent('dialog[open] p')).includes('signed out'));
  await page.locator('dialog[open]').getByRole('button', { name: 'Make a new code' }).click();
  await page.waitForFunction((old) => document.getElementById('join-code').textContent !== old, code1);
  t('a new, different join code is shown', (await page.textContent('#join-code')) !== code1);
  await page.locator('input[name=set-visibility][value=public]').check();
  await page.getByRole('button', { name: 'Save this setting' }).click();
  await page.waitForFunction(() => document.getElementById('code-wrap').hidden);
  t('switching to public hides the join code', true);
  await page.locator('input[name=set-visibility][value=code]').check();
  await page.getByRole('button', { name: 'Save this setting' }).click();
  await page.waitForFunction(() => !document.getElementById('code-wrap').hidden && /-/.test(document.getElementById('join-code').textContent));
  t('switching back shows a fresh join code', true);

  // helpers
  await page.fill('#del-email', 'helper@flow.org'); await page.fill('#del-name', 'Helper Hannah');
  await page.getByRole('button', { name: 'Add helper' }).click();
  await page.waitForFunction(() => /Helper Hannah/.test(document.getElementById('people').textContent));
  t('adding a helper lists them', true);
  await page.fill('#del-email', 'helper@flow.org');
  await page.getByRole('button', { name: 'Add helper' }).click();
  await page.waitForFunction(() => /cannot be added/.test(document.getElementById('people-status').textContent));
  t('adding the same address again is refused politely', true);
  await page.getByRole('button', { name: 'Remove Helper Hannah' }).click();
  await page.waitForSelector('dialog[open]');
  await page.locator('dialog[open]').getByRole('button', { name: 'Remove' }).click();
  await page.waitForFunction(() => !/Helper Hannah/.test(document.getElementById('people').textContent));
  t('removing a helper works', true);

  // deleting the parish needs the typed phrase
  await page.getByRole('button', { name: 'Delete my membership' }).click();
  await page.waitForSelector('dialog[open]'); await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Delete parish and all data' }).click();
  await page.waitForSelector('dialog[open]');
  const confirmBtn = page.locator('dialog[open]').getByRole('button', { name: 'Delete everything' });
  t('"Delete parish" stays disabled until the phrase is typed', await confirmBtn.isDisabled());
  await page.fill('dialog[open] input', 'DELETE wrong');
  t('...and stays disabled for a wrong phrase', await confirmBtn.isDisabled());
  await page.fill('dialog[open] input', 'DELETE ' + fx.flow.slug);
  t('...and enables only for the exact phrase', await confirmBtn.isEnabled());
  await page.getByRole('button', { name: 'Cancel' }).click();
  t('cancelling leaves the parish alone', await page.isVisible('#view-dashboard'));

  // narrow screen
  await page.setViewportSize({ width: 375, height: 800 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  t('at phone width (375px) there is no sideways scrolling', overflow <= 0, String(overflow));
  await page.setViewportSize({ width: 1100, height: 900 });

  // log out
  await page.getByRole('button', { name: 'Log out' }).click();
  await page.waitForSelector('#view-signin:not([hidden])');
  const after = await page.evaluate(() => window.localStorage.getItem('uoParishSession'));
  t('Log out returns to sign-in and forgets the token', after === null && !(await page.isVisible('#logout')));
  await page.reload();
  t('after a reload you are still signed out', await page.isVisible('#h-signin'));
  t('no alert fired and no page errors during the dashboard tests', problems.dialogs.length === 0 && problems.errors.length === 0, problems.errors.join('|'));
  t('no Content-Security-Policy violations during the dashboard tests', problems.csp.length === 0, problems.csp.join('|'));
  await page.close();
}

// an expired session must send you back to sign-in
console.log('Browser: sessions');
{
  const page = await withSession('uoParishSession', 'f'.repeat(64), '/parish/index.html');
  await page.waitForSelector('#view-signin:not([hidden])', { timeout: 8000 });
  t('a token the server does not recognise returns you to sign-in with an explanation', (await page.textContent('#signin-status')).includes('session has ended'));
  await page.close();
}

// ---------------------------------------------------------------- registration + approval + admin, through the UI
console.log('Browser: registration, approval link and admin page');
{
  const page = await ctx.newPage(); watch(page);
  await page.goto(BASE + '/parish/index.html');
  await page.getByRole('button', { name: 'Register your parish' }).click();
  t('the registration form opens', await page.isVisible('#h-register'));
  const options = await page.$$eval('#reg-diocese option', (o) => o.length);
  t('the diocese dropdown lists the site\'s dioceses (100+)', options > 100, String(options));
  await page.fill('#reg-parish', "St. Aidan's Chapel");
  await page.selectOption('#reg-diocese', 'episcopal/western-oregon');
  await page.fill('#reg-contact', 'Rev. Pat Example');
  await page.fill('#reg-email', fx.reg.email);
  t('code-required is the default visibility', await page.locator('input[name=reg-visibility][value=code]').isChecked());
  await page.getByRole('button', { name: 'Send my confirmation code' }).click();
  await page.waitForSelector('#form-register-code:not([hidden])');
  const rc = await codeFor(fx.reg.email);
  await page.fill('#reg-code', rc);
  await page.getByRole('button', { name: 'Confirm and submit' }).click();
  await page.waitForSelector('#reg-done:not([hidden])');
  t('the confirmed registration shows the "awaiting approval" thanks', (await page.textContent('#reg-done')).includes('awaiting approval'));
  await page.close();

  // the approval link, opened like a mail scanner first
  const adminMail = mailMessages().reverse().find((m) => /Parish awaiting approval: St\. Aidan/.test(m.subject));
  const token = adminMail && (adminMail.body.match(/#([0-9a-f]{64})/) || [])[1];
  t('the admin was emailed an approval link', !!token);
  const scan = await ctx.newPage(); watch(scan);
  await scan.goto(BASE + '/parish/approve.html#' + token);
  await scan.waitForSelector('#review:not([hidden])');
  t('the approval page shows the parish and a button, and the address bar no longer contains the token', (await scan.textContent('#parish-name')) === "St. Aidan's Chapel" && !scan.url().includes(token), scan.url());
  const listBefore = await (await fetch(BASE + '/api/v1/parishes')).json();
  t('merely opening the link approved nothing', !listBefore.parishes.some((p) => p.name === "St. Aidan's Chapel"));
  await scan.getByRole('button', { name: 'Approve this parish' }).click();
  await scan.waitForFunction(() => /Approved\./.test(document.getElementById('status').textContent));
  t('pressing the button approves it', true);
  const listAfter = await (await fetch(BASE + '/api/v1/parishes')).json();
  t('the parish is now listed publicly', listAfter.parishes.some((p) => p.name === "St. Aidan's Chapel"));
  await scan.reload();
  await scan.waitForSelector('#status:not([hidden])');
  t('reloading the used link (its token is gone) explains it is not valid', /incomplete|invalid/.test(await scan.textContent('#status')));
  await scan.close();

  // admin, through the UI
  const admin = await ctx.newPage(); watch(admin);
  await admin.goto(BASE + '/parish/admin.html');
  await admin.fill('#signin-email', fx.admin.email);
  await admin.getByRole('button', { name: 'Send code' }).click();
  await admin.waitForSelector('#form-code:not([hidden])');
  await admin.fill('#signin-code', await codeFor(fx.admin.email));
  await admin.getByRole('button', { name: 'Sign in' }).click();
  await admin.waitForSelector('#parish-rows tr');
  const cells = await admin.$$eval('#parish-rows tr', (els) => els.map((e) => e.textContent));
  t('the admin page lists parishes with status, staff and request counts', cells.some((c) => c.includes("St. Aidan's Chapel") && c.includes('approved')));
  const pendingRow = admin.locator('#parish-rows tr', { hasText: fx.xss.pendingName });
  t('a pending parish offers Approve and Delete; no prayer text is shown', await pendingRow.getByRole('button', { name: /^Approve/ }).count() === 1 && (await admin.textContent('#parish-rows')).indexOf(fx.xss.payloads[3]) === -1);
  await pendingRow.getByRole('button', { name: /^Approve/ }).click();
  await admin.waitForFunction((n) => [...document.querySelectorAll('#parish-rows tr')].some((r) => r.textContent.includes(n) && r.textContent.includes('approved')), fx.xss.pendingName);
  t('Approve turns a pending parish into an approved one', true);
  const row = admin.locator('#parish-rows tr', { hasText: "St. Aidan's Chapel" });
  await row.getByRole('button', { name: /^Suspend/ }).click();
  await admin.waitForFunction(() => [...document.querySelectorAll('#parish-rows tr')].some((r) => r.textContent.includes("St. Aidan's Chapel") && r.textContent.includes('suspended')));
  const pub = await (await fetch(BASE + '/api/v1/parishes')).json();
  t('Suspend hides the parish from the public list', !pub.parishes.some((p) => p.name === "St. Aidan's Chapel"));
  await row.getByRole('button', { name: /^Restore/ }).click();
  await admin.waitForFunction(() => [...document.querySelectorAll('#parish-rows tr')].some((r) => r.textContent.includes("St. Aidan's Chapel") && r.textContent.includes('approved')));
  t('Restore brings it back', true);
  await row.getByRole('button', { name: /^Delete/ }).click();
  await admin.waitForSelector('dialog[open]');
  const del = admin.locator('dialog[open]').getByRole('button', { name: 'Delete permanently' });
  t('deleting needs the exact typed phrase', await del.isDisabled());
  await admin.fill('dialog[open] input', 'DELETE st-aidans-chapel');
  await del.click();
  await admin.waitForFunction(() => ![...document.querySelectorAll('#parish-rows tr')].some((r) => r.textContent.includes("St. Aidan's Chapel")));
  t('the typed phrase deletes the parish', true);
  await admin.setViewportSize({ width: 375, height: 800 });
  const ov = await admin.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  t('the admin page has no sideways scrolling at phone width', ov <= 0, String(ov));
  await admin.getByRole('button', { name: 'Log out' }).click();
  await admin.waitForSelector('#view-signin:not([hidden])');
  t('admin Log out returns to sign-in', (await admin.evaluate(() => window.localStorage.getItem('uoAdminSession'))) === null);
  t('no alert fired, no page errors, no CSP violations in the admin/registration tests',
    problems.dialogs.length === 0 && problems.errors.length === 0 && problems.csp.length === 0, [...problems.errors, ...problems.csp].join('|'));
  await admin.close();
}

// a rector's session cannot drive the admin page
{
  const page = await withSession('uoAdminSession', fx.xss.rectorToken, '/parish/admin.html');
  await page.waitForSelector('#view-signin:not([hidden])', { timeout: 8000 });
  t('a rector\'s session on the admin page is turned away to sign-in', (await page.textContent('#signin-status')).includes('not an administrator'));
  await page.close();
}

// privacy page
{
  const page = await ctx.newPage(); watch(page);
  await page.goto(BASE + '/parish/privacy.html');
  const body = await page.textContent('body');
  t('the privacy page carries the exact reminder wording', body.replace(/\s+/g, ' ').includes(fx.reminder));
  t('...and says it is not legal advice and gives a contact', body.includes('not legal advice') && body.includes('admin@theuniversaloffice.com'));
  await page.close();
}

await browser.close();
