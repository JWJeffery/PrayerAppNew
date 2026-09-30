#!/usr/bin/env node
import fs from 'node:fs';

const failures = [];
let checks = 0;

function read(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (_error) {
    failures.push(`missing file: ${path}`);
    return '';
  }
}

function check(label, condition) {
  checks += 1;
  if (!condition) failures.push(label);
}

const index = read('index.html');
const css = read('css/office.css');
const officeUi = read('js/office-ui.js');
const bookNeedsQc = read('scripts/browser-qc-book-of-needs-routing-sweep.js');
const pkg = JSON.parse(read('package.json') || '{}');

check(
  'local profile defaults panel exists in internal selector',
  index.includes('id="user-profile-defaults"') &&
  index.includes('Your Profile') &&
  index.includes('profile-entry-default') &&
  index.includes('profile-tradition-default') &&
  index.includes('profile-book-needs-scope')
);

check(
  'profile controls preserve public first screen scope',
  index.includes('id="user-profile-defaults"') &&
  index.indexOf('id="user-profile-defaults"') > index.indexOf('id="mode-selection"') &&
  !index.includes('app-entry-universal-link')
);

check(
  'profile controls expose required defaults',
  index.includes('<option value="ask">Ask me to choose a tradition</option>') &&
  index.includes('<option value="tradition">Open my tradition office</option>') &&
  index.includes('<option value="universal">Open the Universal Office selector</option>') &&
  index.includes('<option value="universal">Show all prayers</option>')
);

check(
  'Catholic profile default is visibly pending',
  index.includes('value="latin-catholic" disabled') &&
  index.includes('Latin Catholic — Liturgy of the Hours pending')
);

// UPDATED 2026-09-29, per Josh's direct (furious) report: this panel's copy used to say it was
// "advanced local settings... not part of... the full profile system" -- actively telling users
// this ISN'T the profile, when by this point it IS (name/role/diocese/parish all live here per
// the 2026-09-28 "profile/user system" build). Copy now says what it actually is.
check(
  'profile panel copy identifies itself as the actual profile, not a stale "not the real thing yet" disclaimer',
  index.includes('Your Profile') &&
  index.includes('Reset local defaults') &&
  !index.includes('not part of the first-user tradition flow') &&
  !index.includes('can later migrate into the full profile system') &&
  !index.includes('How should this browser open?') &&
  !index.includes('Local Profile Defaults')
);

// UPDATED 2026-09-29: rewritten as a true standalone modal (see
// .app-profile-modal-backdrop) with a solid, high-contrast card, replacing the
// original translucent-gradient-on-the-splash-screen version -- the comment
// marker below moved with it.
check(
  'profile CSS is present and scoped',
  css.includes('REDESIGNED 2026-09-29') &&
  css.includes('.app-profile-modal-backdrop') &&
  css.includes('.app-profile-defaults') &&
  css.includes('.app-profile-defaults-grid') &&
  css.includes('.app-profile-default-field select')
);

check(
  'profile storage key and defaults exist',
  officeUi.includes("UNIVERSAL_OFFICE_USER_PROFILE_KEY = 'universalOffice.userProfile.v1'") &&
  officeUi.includes('UNIVERSAL_OFFICE_USER_PROFILE_DEFAULTS') &&
  officeUi.includes("entryPageDefault: 'ask'") &&
  officeUi.includes("bookOfNeedsScope: 'tradition'")
);

check(
  'legacy entry default key is preserved for migration',
  officeUi.includes("UNIVERSAL_OFFICE_ENTRY_DEFAULT_KEY = 'universalOffice.entry.default.v1'") &&
  officeUi.includes('function readLegacyEntryDefault()') &&
  officeUi.includes('function writeLegacyEntryDefault(value)') &&
  officeUi.includes('deriveProfileFromLegacyEntryDefault')
);

check(
  'profile API is exposed globally for the skeleton UI',
  officeUi.includes('window.getUniversalOfficeUserProfile = getUserProfileDefaults') &&
  officeUi.includes('window.setUserProfileEntryPageDefault = setUserProfileEntryPageDefault') &&
  officeUi.includes('window.setUserProfileTraditionDefault = setUserProfileTraditionDefault') &&
  officeUi.includes('window.setUserProfileBookOfNeedsScope = setUserProfileBookOfNeedsScope') &&
  officeUi.includes('window.resetUniversalOfficeUserProfile = resetUniversalOfficeUserProfile') &&
  officeUi.includes('window.openLocalProfileDefaultsFromOffice = openLocalProfileDefaultsFromOffice') &&
  officeUi.includes('window.focusLocalProfileDefaultsPanel = focusLocalProfileDefaultsPanel')
);


check(
  'office pages expose local defaults without changing public first screen',
  index.includes('id="office-profile-defaults-button"') &&
  index.includes('openLocalProfileDefaultsFromOffice()') &&
  index.includes('Defaults</button>') &&
  officeUi.includes('function openLocalProfileDefaultsFromOffice()') &&
  officeUi.includes('focusLocalProfileDefaultsPanel()') &&
  officeUi.includes('window.openLocalProfileDefaultsFromOffice = openLocalProfileDefaultsFromOffice') &&
  !index.includes('app-entry-universal-link')
);


check(
  'focus helper retries profile entry focus',
  officeUi.includes('const focusProfileTarget = () => {') &&
  officeUi.includes('focusTarget.focus({ preventScroll: true });') &&
  officeUi.includes('requestAnimationFrame(focusProfileTarget);') &&
  officeUi.includes('setTimeout(focusProfileTarget, 80);')
);

check(
  'profile entry routing supports ask tradition and universal defaults',
  officeUi.includes('function getUserEntryDefault()') &&
  officeUi.includes("if (profile.entryPageDefault === 'universal') return 'universal';") &&
  officeUi.includes("if (profile.entryPageDefault === 'tradition') return profile.traditionDefault || null;") &&
  officeUi.includes('showTraditionEntry();')
);

check(
  'tradition selection persists through profile defaults',
  officeUi.includes('function setUserTraditionDefault(tradition)') &&
  officeUi.includes('persistUserEntryDefault(route.storedDefault);') &&
  officeUi.includes('resolveEntryTraditionRoute')
);

check(
  'profile Book of Needs all-prayers override exists',
  officeUi.includes('function getBookOfNeedsContextForMode(mode)') &&
  officeUi.includes("profile.bookOfNeedsScope === 'universal'") &&
  officeUi.includes("return 'UNIVERSAL';") &&
  officeUi.includes('BOOK_OF_NEEDS_MODE_CONTEXTS')
);

check(
  'profile controls sync on initialization',
  officeUi.includes('function syncUserProfileControls') &&
  officeUi.includes('profile-defaults-summary') &&
  officeUi.includes('syncUserProfileControls();') &&
  officeUi.includes("document.addEventListener('DOMContentLoaded', initializeEntryRouting);")
);

check(
  'Book of Needs browser QC backs up new profile key',
  bookNeedsQc.includes('"universalOffice.userProfile.v1"')
);

check(
  'package exposes profile defaults skeleton audit',
  pkg.scripts?.['audit:user-profile-defaults-skeleton'] === 'node scripts/audit-user-profile-defaults-skeleton.mjs'
);

check(
  'profile carries the parish-intentions fields, normalized and clearable',
  officeUi.includes('parishIntentionsSlug: null') &&
  officeUi.includes('parishIntentionsPass: null') &&
  officeUi.includes('function setUserProfileParishIntentions') &&
  officeUi.includes('function clearUserProfileParishIntentions') &&
  index.includes('id="profile-parish-intentions-select"') &&
  index.includes('js/parish-intentions.js')
);

if (failures.length) {
  console.error(`FAIL user profile defaults skeleton audit: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS user profile defaults skeleton audit: ${checks} check(s) passed.`);
