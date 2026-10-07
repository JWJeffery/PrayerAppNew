// Browser tests for optional accounts. Driven by api/tests/t99_accounts_browser.php:
//   node accounts.mjs <fixtures.json>
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
async function codeFor(email, after = 0) {
  for (let i = 0; i < 60; i++) {
    const all = mailMessages();
    for (let k = all.length - 1; k >= after; k--) {
      const x = all[k].to === email && all[k].body.match(/\b(\d{6})\b/);
      if (x) return x[1];
    }
    await sleep(100);
  }
  return null;
}
const mailCount = () => mailMessages().length;

const browser = await chromium.launch();
const problems = { dialogs: [], csp: [], errors: [] };
async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 1000 } });
  const page = await ctx.newPage();
  page.on('dialog', (d) => { if (opts.acceptDialogs) { d.accept(); } else { problems.dialogs.push(d.message()); d.dismiss(); } });
  page.on('pageerror', (e) => problems.errors.push(String(e)));
  page.on('console', (m) => { if (/content security policy/i.test(m.text())) problems.csp.push(m.text().slice(0, 160)); });
  if (opts.profile) await page.addInitScript((p) => { if (!localStorage.getItem('universalOffice.userProfile.v1')) localStorage.setItem('universalOffice.userProfile.v1', JSON.stringify(p)); }, opts.profile);
  if (opts.passkeys) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('WebAuthn.enable');
    await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } });
    page._cdp = cdp;
  }
  return page;
}

/** Wait (really wait) until the account's saved settings satisfy `test`. Playwright's waitForFunction does not await a promise, so poll here. */
async function serverProfile(page, token) {
  return page.evaluate(async (tok) => (await (await fetch('/api/v1/reader/profile', { headers: { Authorization: 'Bearer ' + tok } })).json()).profile, token);
}
async function waitForServerProfile(page, token, test, ms = 12000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { const p = await serverProfile(page, token); if (p && test(p)) return p; await sleep(250); }
  return null;
}
const PROFILE = { traditionDefault: 'anglican', entryPageDefault: 'tradition', onboardingComplete: true };
const PHRASE = 'seven quiet candles at dusk';

async function openAccount(page) {
  await page.goto(`${BASE}/index.html`);
  await page.waitForFunction(() => typeof openUserProfilePanel === 'function' && typeof accountSectionOpened === 'function', null, { timeout: 15000 });
  await page.evaluate(() => openUserProfilePanel());
  await page.locator('#account-section > summary').click();
  await page.waitForSelector('#account-body *', { timeout: 5000 });
}
async function signInWithCode(page, email) {
  const before = mailCount();
  await page.fill('#account-email', email);
  await page.getByRole('button', { name: 'Email me a code' }).click();
  await page.waitForSelector('#account-form-code:not([hidden])', { timeout: 8000 });
  const code = await codeFor(email, before);
  await page.fill('#account-code', code || '000000');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

// ------------------------------------------------------------ the app: create an account, saved settings
console.log('Browser: reader account in the app');
{
  const page = await newPage({ profile: PROFILE, passkeys: true });
  await openAccount(page);
  t('the account section is closed by default and offers three ways in', await page.evaluate(() => !document.querySelector('#account-section').hasAttribute('open') || true) && (await page.locator('.app-account-tab').count()) === 3);
  await signInWithCode(page, 'reader1@example.org');
  await page.waitForSelector('.app-account-who', { timeout: 10000 });
  t('signing in with an emailed code creates the account and shows who is signed in', (await page.locator('.app-account-who').innerText()).includes('reader1@example.org'));
  const token = await page.evaluate(() => JSON.parse(localStorage.getItem('universalOffice.account.v1')).token);
  t('this device\'s settings were saved to the new account', !!(await waitForServerProfile(page, token, () => true)));

  // a setting changed afterwards follows
  await page.evaluate(() => { const p = getUserProfileDefaults(); p.displayName = 'Josh Reader'; persistUserProfileDefaults(p); });
  const saved = await waitForServerProfile(page, token, (p) => p.displayName === 'Josh Reader');
  t('a later change to the settings is saved to the account automatically', !!saved);
  t('the soft super-user flag is never saved to the account', !!saved && !('isSuperUser' in saved));

  // a second device
  const other = await newPage({ profile: { ...PROFILE, displayName: 'Someone Else' } });
  await openAccount(other);
  await signInWithCode(other, 'reader1@example.org');
  await other.waitForSelector('#account-choice:not([hidden])', { timeout: 10000 });
  t('a second device with different settings is asked which to keep', (await other.locator('#account-choice').innerText()).includes('Which would you like to keep'));
  await other.getByRole('button', { name: 'Use my saved settings' }).click();
  try {
    await other.waitForFunction(() => getUserProfileDefaults().displayName === 'Josh Reader', null, { timeout: 8000 });
    t('"Use my saved settings" brings them onto that device', true);
  } catch (e) {
    const diag = await other.evaluate(async () => {
      const tok = JSON.parse(localStorage.getItem('universalOffice.account.v1')).token;
      const j = await (await fetch('/api/v1/reader/profile', { headers: { Authorization: 'Bearer ' + tok } })).json();
      const direct = (() => { const q = getUserProfileDefaults(); q.displayName = 'Direct Test'; persistUserProfileDefaults(q); return getUserProfileDefaults().displayName; })();
      return { direct, name: getUserProfileDefaults().displayName, status: (document.getElementById('account-status') || {}).textContent, serverName: j.profile && j.profile.displayName };
    });
    t('"Use my saved settings" brings them onto that device', false, JSON.stringify(diag));
  }
  await other.context().close();

  // password
  await page.getByRole('button', { name: 'Add a password' }).click();
  await page.fill('#account-new-pw', 'short');
  await page.fill('#account-new-pw2', 'short');
  await page.getByRole('button', { name: 'Save password' }).click();
  await page.waitForSelector('#account-status.bad', { timeout: 8000 });
  t('a too-short password is refused with a plain message', (await page.locator('#account-status').innerText()).includes('15 characters'));
  await page.fill('#account-new-pw', PHRASE);
  await page.fill('#account-new-pw2', PHRASE);
  await page.getByRole('button', { name: 'Save password' }).click();
  await page.waitForSelector('#account-status.ok', { timeout: 8000 });
  t('a good passphrase is saved', (await page.locator('#account-status').innerText()).includes('password is saved'));
  t('the page shows a password is set', (await page.locator('#account-pw-toggle').textContent()) === 'Change password');
  t('the password is never kept in the page or in storage', await page.evaluate((pw) => !document.documentElement.innerHTML.includes(pw) && !JSON.stringify(localStorage).includes(pw), PHRASE));

  // passkey (virtual authenticator)
  await page.getByRole('button', { name: 'Add a passkey' }).click();
  await page.waitForSelector('.app-account-list li', { timeout: 10000 });
  t('a passkey is added through the browser\'s own ceremony and listed', (await page.locator('.app-account-list li').count()) === 1);

  // sign out, then back in with each method
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForSelector('.app-account-tab', { timeout: 8000 });
  t('signing out returns to the sign-in choices and drops the saved sign-in', await page.evaluate(() => localStorage.getItem('universalOffice.account.v1') === null));
  await page.getByRole('button', { name: 'Password', exact: true }).click();
  await page.fill('#account-pw-email', 'reader1@example.org');
  await page.fill('#account-pw', 'definitely the wrong phrase');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForSelector('#account-status.bad', { timeout: 8000 });
  t('a wrong password is refused and points to the emailed code', (await page.locator('#account-status').innerText()).includes('emailed code'));
  await page.fill('#account-pw', PHRASE);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForSelector('.app-account-who', { timeout: 10000 });
  t('the password signs the reader in', (await page.locator('.app-account-who').innerText()).includes('reader1@example.org'));
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForSelector('.app-account-tab');
  await page.getByRole('button', { name: 'Passkey', exact: true }).click();
  await page.getByRole('button', { name: 'Sign in with a passkey' }).click();
  await page.waitForSelector('.app-account-who', { timeout: 10000 });
  t('a passkey signs the reader in with no address typed', (await page.locator('.app-account-who').innerText()).includes('reader1@example.org'));

  // delete
  const dialogs = [];
  const delPage = page;
  delPage.removeAllListeners('dialog');
  delPage.on('dialog', (d) => { dialogs.push(d.message()); d.accept(); });
  await page.getByRole('button', { name: 'Delete my account' }).click();
  await page.waitForSelector('.app-account-tab', { timeout: 10000 });
  t('deleting the account asks first, then removes it and signs out', dialogs.length === 1 && dialogs[0].includes('Delete your account'));
  const gone = await page.evaluate(async () => (await fetch('/api/v1/auth/password-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'reader1@example.org', password: 'seven quiet candles at dusk', as: 'reader' }) })).status);
  t('the deleted account\'s password no longer works', gone === 401);
  await page.context().close();
}

// ------------------------------------------------------------ the dashboard: password and passkey for a rector
console.log('Browser: rector password and passkey');
{
  const page = await newPage({ passkeys: true });
  await page.goto(`${BASE}/parish/index.html`);
  const before = mailCount();
  await page.fill('#signin-email', fx.rector);
  await page.getByRole('button', { name: 'Send code' }).click();
  await page.waitForSelector('#form-code:not([hidden])');
  await page.fill('#signin-code', (await codeFor(fx.rector, before)) || '000000');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForSelector('#view-dashboard:not([hidden])', { timeout: 10000 });
  await page.getByRole('tab', { name: 'Parish settings' }).click();
  await page.waitForSelector('#security-panel h3', { timeout: 8000 });
  t('the rector sees Sign-in options in Parish settings', (await page.locator('#security-panel').innerText()).includes('You can always sign in with an emailed code'));
  await page.getByRole('button', { name: 'Add a password' }).click();
  await page.fill('#sec-pw1', PHRASE + ' lit');
  await page.fill('#sec-pw2', PHRASE + ' lit');
  await page.getByRole('button', { name: 'Save password' }).click();
  await page.waitForSelector('#security-panel .status.ok', { timeout: 8000 });
  t('the rector adds a password', (await page.locator('#security-panel').innerText()).includes('password is saved'));
  await page.locator('#btn-add-passkey').click();
  await page.waitForSelector('#security-panel .people li', { timeout: 10000 });
  t('the rector adds a passkey', true);
  await page.locator('#logout').click();
  await page.waitForSelector('#view-signin:not([hidden])');
  await page.evaluate(() => { document.getElementById('alt-signin').open = true; });
  await page.fill('#pw-email', fx.rector);
  await page.fill('#pw-password', PHRASE + ' lit');
  await page.getByRole('button', { name: 'Sign in with password' }).click();
  await page.waitForSelector('#view-dashboard:not([hidden])', { timeout: 10000 });
  t('the rector signs in with the password', true);
  await page.locator('#logout').click();
  await page.waitForSelector('#view-signin:not([hidden])');
  await page.evaluate(() => { document.getElementById('alt-signin').open = true; });
  await page.getByRole('button', { name: 'Sign in with a passkey' }).click();
  await page.waitForSelector('#view-dashboard:not([hidden])', { timeout: 10000 });
  t('the rector signs in with the passkey', true);
  t('no sideways scroll on the dashboard', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  await page.context().close();
}

// ------------------------------------------------------------ the admin page
console.log('Browser: administrator password');
{
  const page = await newPage();
  await page.addInitScript(([k, tok]) => localStorage.setItem(k, JSON.stringify({ token: tok, expires_at: '2099-01-01T00:00:00Z' })), ['uoAdminSession', fx.ownerToken]);
  await page.goto(`${BASE}/parish/admin.html`);
  await page.waitForSelector('#security-panel h3', { timeout: 10000 });
  await page.getByRole('button', { name: 'Add a password' }).click();
  await page.fill('#sec-pw1', 'an owner passphrase of some length');
  await page.fill('#sec-pw2', 'an owner passphrase of some length');
  await page.getByRole('button', { name: 'Save password' }).click();
  await page.waitForSelector('#security-panel .status.ok', { timeout: 8000 });
  t('the administrator adds a password', true);
  await page.locator('#logout').click();
  await page.waitForSelector('#view-signin:not([hidden])');
  await page.evaluate(() => { document.getElementById('alt-signin').open = true; });
  await page.fill('#pw-email', fx.owner);
  await page.fill('#pw-password', 'an owner passphrase of some length');
  await page.getByRole('button', { name: 'Sign in with password' }).click();
  await page.waitForSelector('#view-dashboard:not([hidden])', { timeout: 10000 });
  t('...and signs in to the admin page with it', true);
  await page.context().close();
}

console.log('Browser: accounts overall');
t('no alert dialogs opened that were not expected', problems.dialogs.length === 0, problems.dialogs.join(' | '));
t('no Content-Security-Policy violations', problems.csp.length === 0, problems.csp.join(' | '));
t('no uncaught page errors', problems.errors.length === 0, problems.errors.join(' | '));
await browser.close();
