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
const officeUi = read('js/office-ui.js');
const prayersJs = read('js/prayers.js');
const css = read('css/office.css');
const pkg = JSON.parse(read('package.json') || '{}');

const retiredCommonCode = String.fromCharCode(69, 67, 85);
const optionIds = [...index.matchAll(/class="prayer-option" data-value="([^"]+)"/g)].map(match => match[1]);

check(
  'office page has Book of Needs action',
  index.includes('id="office-context-actions"') &&
  index.includes('openBookOfNeedsForActiveOffice()')
);

check(
  'Universal selector opens all-context Book of Needs',
  index.includes('openUniversalBookOfNeeds()') &&
  !index.includes('onclick="selectMode(\'prayers\')"')
);

check(
  'Book of Needs has contextual label and scope note',
  index.includes('id="book-needs-context-label"') &&
  index.includes('id="book-needs-scope-note"')
);

check(
  'Book of Needs return action is contextual',
  index.includes('id="book-needs-return-button"') &&
  index.includes('backFromBookOfNeeds()')
);

check(
  'Universal Book of Needs Back performs full splash teardown',
  officeUi.includes('function backFromBookOfNeeds()') &&
  officeUi.includes('backToSplash();') &&
  officeUi.includes("document.getElementById('individual-prayers-section').style.display = 'none';")
);

check(
  'office-ui defines Book of Needs mode contexts',
  officeUi.includes('const BOOK_OF_NEEDS_MODE_CONTEXTS = {') &&
  officeUi.includes("daily: 'ANG'") &&
  officeUi.includes("horologion: 'EO'")
);

check(
  'office-ui exposes Book of Needs route helpers',
  officeUi.includes('window.openBookOfNeedsForActiveOffice') &&
  officeUi.includes('window.openUniversalBookOfNeeds') &&
  officeUi.includes('window.backFromBookOfNeeds')
);

check(
  'selectMode applies Book of Needs context',
  officeUi.includes('window.applyBookOfNeedsContext(window._bookOfNeedsContextTradition);')
);

check(
  'prayers.js defines strict context labels and empty states',
  prayersJs.includes('const BOOK_OF_NEEDS_CONTEXTS = {') &&
  prayersJs.includes('Oriental Orthodoxy') &&
  prayersJs.includes('Church of the East') &&
  prayersJs.includes('No Church of the East prayers are available in this section yet.')
);

check(
  'Book of Needs return label follows origin, not only filter context',
  prayersJs.includes('const returnMode = window._bookOfNeedsReturnMode;') &&
  prayersJs.includes("const isOfficeOrigin = returnMode && returnMode !== 'universal' && returnMode !== 'prayers';") &&
  prayersJs.includes("returnButton.textContent = isOfficeOrigin ? 'Back to Office' : config.returnText;")
);


check(
  'prayers.js defines option tradition map',
  prayersJs.includes('const BOOK_OF_NEEDS_OPTION_TRADITIONS = {')
);

check(
  'every hardcoded prayer option has a tradition mapping entry',
  optionIds.length > 0 &&
  optionIds.every(id => prayersJs.includes(`'${id}': [`))
);

check(
  'tradition filtering is strict',
  prayersJs.includes('function prayerOptionAppliesToContext') &&
  prayersJs.includes('return traditions.includes(context);')
);

check(
  'Book of Needs prayer filtering contains no retired common bucket code',
  !prayersJs.includes(retiredCommonCode)
);

check(
  'Latin Catholic prayers are not silently treated as Anglican',
  prayersJs.includes("'thanksgiving-aquinas': ['LC']") &&
  prayersJs.includes("'o-salutaris': ['LC']") &&
  prayersJs.includes("'tantum-ergo': ['LC']")
);

check(
  'general intercessions have no tradition assignment',
  prayersJs.includes("'prayer-for-the-sick': []") &&
  prayersJs.includes("'prayer-for-the-world': []")
);

check(
  'Book of Needs empty state and disabled display button are guarded',
  index.includes('id="book-needs-empty-state"') &&
  index.includes('id="book-needs-display-button"') &&
  prayersJs.includes('book-needs-empty-state') &&
  prayersJs.includes('displayButton.disabled = visibleCount === 0')
);

check(
  'hidden prayer options are suppressed in CSS',
  css.includes('Book of Needs tradition-context access pass') &&
  css.includes('.prayer-option[hidden]')
);

check(
  'empty state CSS exists',
  css.includes('.book-needs-empty-state') &&
  css.includes('#book-needs-display-button:disabled')
);

check(
  'package exposes Book of Needs tradition-context audit',
  pkg.scripts?.['audit:book-of-needs-tradition-context'] === 'node scripts/audit-book-of-needs-tradition-context.mjs'
);

if (failures.length) {
  console.error(`FAIL Book of Needs tradition-context audit: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS Book of Needs tradition-context audit: ${checks} check(s) passed.`);
