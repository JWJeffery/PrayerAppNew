#!/usr/bin/env node
// Static audit for the Parish Intercessions feature (spec section 13, item 11 and 20).
// Run:  npm run audit:parish-intentions
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const failures = [];
let checks = 0;
function check(label, ok, detail = '') {
  checks += 1;
  if (!ok) failures.push(detail ? `${label} -- ${detail}` : label);
}
function read(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { failures.push(`missing file: ${p}`); return ''; }
}
function stripJsComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
}
function stripPhpComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])(\/\/|#)[^\n]*/g, '$1');
}
/** Body of `function name(...) { ... }` by brace matching (comments already stripped). */
function functionBody(src, name) {
  const m = new RegExp(`function\\s+${name}\\s*\\(`).exec(src);
  if (!m) return null;
  const open = src.indexOf('{', m.index);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(open, i + 1); }
  }
  return null;
}

// ---- 1. Text safety: nothing that turns text into markup or code touches prayer text ----------------
const UNSAFE = /\binnerHTML\b|\bouterHTML\b|insertAdjacentHTML|document\.write|\beval\s*\(|new\s+Function\s*\(|setAttribute\(\s*['"]on|createContextualFragment|srcdoc|\bbcpEmitBare\b|\bbcpMakeSpan\b/;
const parishJs = fs.readdirSync('parish').filter((f) => f.endsWith('.js') && f !== 'dioceses.js').map((f) => `parish/${f}`);
for (const f of ['js/parish-intentions.js', 'js/account-core.js', 'js/account-ui.js', ...parishJs]) {
  check(`no unsafe text-to-markup API in ${f}`, !UNSAFE.test(stripJsComments(read(f))));
}
const officeUi = stripJsComments(read('js/office-ui.js'));
const OFFICE_FUNCTIONS = [
  'bcpEmitPlainText', 'renderParishIntentionsLine', 'populateParishIntentionsControls', 'updateParishFollowUi',
  'setParishIntentionsNote', 'setParishIntentionsJoinBoxVisible', 'followParishIntentions', 'joinSelectedParishIntentions',
  'refreshParishIntentionsForProfile', 'setUserProfileParishIntentions', 'clearUserProfileParishIntentions',
  'loadRegisteredParishes', 'chooseRegisteredParish', 'syncFollowToSelectedParish', 'stopFollowingQuietly',
  '_populateOneCycleOfPrayerParishSelect', 'saveProfileTextFieldsNow',
];
for (const fn of OFFICE_FUNCTIONS) {
  const body = functionBody(officeUi, fn);
  check(`office-ui.js ${fn}() exists`, body !== null);
  if (body !== null) check(`office-ui.js ${fn}() uses no unsafe text-to-markup API`, !UNSAFE.test(body));
}
check('the office renders request text through bcpEmitPlainText', /bcpEmitPlainText\(container, item\.text\)/.test(officeUi));

// ---- 2. Parish pages: no inline script/style/handlers; CSP present -----------------------------------
for (const f of fs.readdirSync('parish').filter((x) => x.endsWith('.html'))) {
  const html = read(`parish/${f}`);
  const inlineScript = /<script(?![^>]*\bsrc=)[^>]*>\s*\S/i.test(html);
  check(`parish/${f} has no inline script, inline style or on* handlers`,
    !inlineScript && !/<style[\s>]/i.test(html) && !/\son[a-z]+\s*=/i.test(html) && !/\sstyle\s*=/i.test(html));
}
const parishHtaccess = read('parish/.htaccess');
check('parish/.htaccess sets a strict Content-Security-Policy',
  /script-src 'self'/.test(parishHtaccess) && /default-src 'self'/.test(parishHtaccess) && /frame-ancestors 'none'/.test(parishHtaccess));

// ---- 3. API: guards, blocked folders, no cookies/CORS, no text in logs -----------------------------
for (const f of fs.readdirSync('api/src').filter((x) => x.endsWith('.php')).map((x) => `api/src/${x}`)
  .concat(fs.readdirSync('api/src/Handlers').map((x) => `api/src/Handlers/${x}`))) {
  check(`${f} refuses direct execution (UO_API guard)`, /if \(!defined\('UO_API'\)\)\s*\{\s*exit;\s*\}/.test(read(f)) || f.endsWith('bootstrap.php'));
}
for (const f of fs.readdirSync('api/cron').filter((x) => x.endsWith('.php'))) {
  check(`api/cron/${f} refuses to run outside the command line`, /PHP_SAPI !== 'cli'/.test(read(`api/cron/${f}`)));
}
const apiHt = read('api/.htaccess');
check('api/.htaccess blocks src, lib, migrations, cron, cli, tests and dev', /\^\(src\|lib\|migrations\|cron\|cli\|tests\|dev\)/.test(apiHt));
check('api/.htaccess forces HTTPS', /https/i.test(apiHt) && /RewriteRule/.test(apiHt));
const allPhp = ['api/src', 'api/src/Handlers', 'api/cron'].flatMap((d) => fs.readdirSync(d).filter((x) => x.endsWith('.php')).map((x) => `${d}/${x}`));
for (const f of allPhp) {
  const code = stripPhpComments(read(f));
  check(`${f} sets no cookies and sends no CORS header`, !/setcookie\s*\(|Access-Control-Allow/i.test(code));
  check(`${f} never logs request text, emails or codes`, !/uo_log\([^;]*(\$body|\$email|\$code|\$text|\['body'\])/.test(code));
  check(`${f} builds no SQL from variables outside prepared statements`, !/->(query|exec)\(\s*["'][^"']*(\$_(GET|POST|REQUEST)|\$body\b|\$b\[)/.test(code));
}
check('the reader cache header is the only cacheable response',
  /private, max-age=60/.test(read('api/src/Handlers/Public.php')) && !/max-age/.test(read('api/src/Response.php').replace(/\$cache[^\n]*/g, '')));

// ---- 4. OpenAPI covers every route in bootstrap.php ------------------------------------------------
const boot = read('api/src/bootstrap.php');
const routes = [...boot.matchAll(/\$r->add\('([A-Z]+)', '([^']+)'/g)].map((m) => [m[1].toLowerCase(), m[2]]);
const spec = read('api/openapi.yaml');
const specPaths = {};
let cur = null;
for (const line of spec.split('\n')) {
  const p = /^  (\/[^\s:]*):\s*$/.exec(line);
  if (p) { cur = p[1]; specPaths[cur] = new Set(); continue; }
  const mth = /^    (get|post|patch|put|delete):\s*$/.exec(line);
  if (mth && cur) specPaths[cur].add(mth[1]);
  if (/^\S/.test(line)) cur = null;
}
check('the route table was read from bootstrap.php', routes.length > 25, `${routes.length} routes`);
for (const [method, route] of routes) {
  check(`openapi.yaml documents ${method.toUpperCase()} ${route}`, !!specPaths[route] && specPaths[route].has(method));
}
const inSpec = Object.entries(specPaths).flatMap(([p, ms]) => [...ms].map((m) => `${m} ${p}`));
const inCode = new Set(routes.map(([m, r]) => `${m} ${r}`));
check('openapi.yaml documents no route that does not exist', inSpec.every((x) => inCode.has(x)), inSpec.filter((x) => !inCode.has(x)).join(', '));

// ---- 5. Release: parish backend ships, secrets/tests/dev do not --------------------------------------
const prep = read('scripts/prepare-web-release.mjs');
check('the web release includes api/ and parish/', /['"]api['"]/.test(prep) && /['"]parish['"]/.test(prep));
const zipPath = 'parish-backend.zip';
if (fs.existsSync(zipPath)) {
  let names = [];
  try {
    names = execFileSync('python3', ['-c', 'import sys,zipfile;print("\\n".join(zipfile.ZipFile(sys.argv[1]).namelist()))', zipPath]).toString().split('\n').filter(Boolean);
  } catch { failures.push('could not read parish-backend.zip'); }
  check('parish-backend.zip holds only api/ and parish/', names.length > 0 && names.every((n) => n.startsWith('api/') || n.startsWith('parish/')));
  check('parish-backend.zip contains the front controller and the dashboard', names.includes('api/index.php') && names.includes('parish/index.html'));
  check('parish-backend.zip contains the cron scripts', ['api/cron/daily.php', 'api/cron/daily.sh', 'api/cron/backup.sh'].every((n) => names.includes(n)));
  const bad = names.filter((n) => /(^|\/)(tests|dev|\.tmp|\.external)\//.test(n) || /(^|\/)config(-[a-z]+)?\.php$/.test(n) && !/config\.example\.php$/.test(n) || /\.(cnf|log|gz|zip)$/.test(n) || /(^|\/)\.env/.test(n));
  check('parish-backend.zip contains no tests, dev files, config, credentials, logs or backups', bad.length === 0, bad.join(', '));
} else {
  console.log('  note: parish-backend.zip not built here; run npm run release:parish-backend to include the zip checks.');
}

// ---- 6. No secrets in tracked files ----------------------------------------------------------------
const tracked = execFileSync('git', ['ls-files'], { maxBuffer: 64 * 1024 * 1024 }).toString().split('\n').filter(Boolean);
const scanFiles = tracked.filter((f) => /^(api|parish)\//.test(f) && !/^api\/(tests|lib)\//.test(f) && !f.endsWith('config.example.php') && !/\.(png|jpg|gif|zip|gz)$/.test(f));
const SECRET_PATTERNS = [
  [/'pepper'\s*=>\s*'[0-9a-fA-F]{32,}'/, 'a real pepper'],
  [/'box_key'\s*=>\s*'[A-Za-z0-9+\/=]{40,}'/, 'a real box key'],
  [/'(pass|password)'\s*=>\s*'(?!CHANGE_ME)[^']{6,}'/, 'a hard-coded password'],
  [/(SMTP|MAIL|DB)_?PASS(WORD)?\s*=\s*['"][^\s'"$]{6,}['"]/i, 'a password assignment'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'a private key'],
];
for (const f of scanFiles) {
  const text = read(f);
  for (const [re, what] of SECRET_PATTERNS) {
    if (re.test(text)) check(`${f} contains no secret`, false, `looks like ${what}`);
  }
}
check('no secret-looking files are tracked', !tracked.some((f) => /(^|\/)(config\.php|backup\.cnf|\.env)$/.test(f) || /^\.external\//.test(f)));
check('config.example.php holds only placeholders', /CHANGE_ME/.test(read('api/config.example.php')));

// ---- 7. Docs and project notes ----------------------------------------------------------------------
check('the operator runbook exists', read('documentation/PARISH_INTENTIONS.md').includes('Part 3b'));
check('package.json exposes audit:parish-intentions and release:parish-backend',
  /"audit:parish-intentions"/.test(read('package.json')) && /"release:parish-backend"/.test(read('package.json')));

if (failures.length) {
  console.error(`FAIL parish intentions audit: ${failures.length} failure(s) of ${checks} checks`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log(`PASS parish intentions audit: ${checks} checks`);
