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

const officeUi = read('js/office-ui.js');
const officeCss = read('css/office.css');
const packageJson = JSON.parse(read('package.json') || '{}');

check('legacy hider remains panel/config based', /function _sharedOfficeNavigatorHideLegacy\\(panel, config\\)/.test(officeUi));
check('legacy restorer helper exists', /function _sharedOfficeNavigatorRestoreLegacyElement/.test(officeUi));
check('legacy retirement helper exists', /function _sharedOfficeNavigatorRetireLegacyElement/.test(officeUi));
check('legacy controls receive retired class', officeUi.includes('shared-office-nav-legacy-hidden'));
check('legacy controls receive aria-hidden', officeUi.includes('setAttribute("aria-hidden", "true")'));
check('legacy controls receive retirement data attribute', officeUi.includes('setAttribute("data-shared-office-nav-retired", "true")'));
check('legacy controls receive dataset retirement marker', officeUi.includes('sharedOfficeNavRetired'));
check('legacy controls use inert where supported', /\\.inert\\s*=\\s*true/.test(officeUi));
check('legacy controls are removed from tab order', /tabIndex\\s*=\\s*-1/.test(officeUi));
check('legacy controls are disabled where applicable', /disabled\\s*=\\s*true/.test(officeUi));
check('legacy display state is restorable', officeUi.includes('sharedOfficeLegacyDisplay') && officeUi.includes('style.removeProperty("display")'));
check('legacy tab state is restorable', officeUi.includes('sharedOfficeLegacyTabIndex'));
check('shared nav css polish marker exists', officeCss.includes('Shared office navigation polish retirement tranche'));
check('shared nav card density is tightened', /\\.shared-office-nav-card\\s*\\{[\\s\\S]*?padding:\\s*12px 13px/.test(officeCss));
check('shared nav current line is smaller', /\\.shared-office-nav-current\\s*\\{[\\s\\S]*?font-size:\\s*0\\.82rem/.test(officeCss));
check('shared nav buttons are compact', /\\.shared-office-nav-actions button\\s*\\{[\\s\\S]*?min-height:\\s*30px/.test(officeCss));
check('shared nav date picker is compact', /\\.shared-office-nav-date-picker input\\[type="date"\\]\\s*\\{[\\s\\S]*?min-height:\\s*30px/.test(officeCss));
check('shared nav option list is scroll constrained', /\\.shared-office-nav-options\\s*\\{[\\s\\S]*?max-height:/.test(officeCss));
check('shared nav option label is smaller', /\\.shared-office-nav-option-label\\s*\\{[\\s\\S]*?font-size:\\s*0\\.84rem/.test(officeCss));
check('retired controls are hidden and non-interactive in css', /shared-office-nav-legacy-hidden[\\s\\S]*?pointer-events:\\s*none\\s*!important/.test(officeCss));
check('package exposes polish audit', packageJson.scripts?.['audit:shared-office-navigation-polish'] === 'node scripts/audit-shared-office-navigation-polish.mjs');

if (failures.length) {
    console.error(`FAIL shared office navigation polish audit: ${failures.length} failure(s)`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log(`PASS shared office navigation polish audit: ${checks} check(s) passed.`);
