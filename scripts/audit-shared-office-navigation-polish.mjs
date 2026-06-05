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
const packageText = read('package.json');

let packageJson = {};
try {
    packageJson = JSON.parse(packageText);
} catch (_error) {
    failures.push('package.json parses');
}

check(
    'legacy hider remains panel/config based',
    officeUi.includes('function _sharedOfficeNavigatorHideLegacy(panel, config) {')
);
check(
    'legacy restorer helper exists',
    officeUi.includes('function _sharedOfficeNavigatorRestoreLegacyElement(el) {')
);
check(
    'legacy retirement helper exists',
    officeUi.includes('function _sharedOfficeNavigatorRetireLegacyElement(el) {')
);
check(
    'legacy controls receive retired class',
    officeUi.includes('el.classList.add("shared-office-nav-legacy-hidden")')
);
check(
    'legacy controls receive aria-hidden',
    officeUi.includes('el.setAttribute("aria-hidden", "true")')
);
check(
    'legacy controls receive retirement data attribute',
    officeUi.includes('el.setAttribute("data-shared-office-nav-retired", "true")')
);
check(
    'legacy controls receive dataset retirement marker',
    officeUi.includes('el.dataset.sharedOfficeNavRetired = "true"')
);
check(
    'legacy controls use inert where supported',
    officeUi.includes('el.inert = true')
);
check(
    'legacy controls are removed from tab order',
    officeUi.includes('el.tabIndex = -1') && officeUi.includes('child.tabIndex = -1')
);
check(
    'legacy controls are disabled where applicable',
    officeUi.includes('el.disabled = true') && officeUi.includes('child.disabled = true')
);
check(
    'legacy display state is restorable',
    officeUi.includes('sharedOfficeLegacyDisplay') && officeUi.includes('el.style.removeProperty("display")')
);
check(
    'legacy tab state is restorable',
    officeUi.includes('sharedOfficeLegacyTabIndex')
);
check(
    'shared nav css polish marker exists',
    officeCss.includes('Shared office navigation polish retirement tranche')
);
check(
    'shared nav card density is tightened',
    officeCss.includes('.shared-office-nav-card {\n    padding: 12px 13px;')
);
check(
    'shared nav current line is smaller',
    officeCss.includes('.shared-office-nav-current {\n    margin-bottom: 9px;\n    font-size: 0.82rem;')
);
check(
    'shared nav buttons are compact',
    officeCss.includes('.shared-office-nav-actions button {\n    min-height: 30px;')
);
check(
    'shared nav date picker is compact',
    officeCss.includes('.shared-office-nav-date-picker input[type="date"] {\n    min-height: 30px !important;')
);
check(
    'shared nav option list is scroll constrained',
    officeCss.includes('.shared-office-nav-options {\n    max-height: min(42vh, 22rem);')
);
check(
    'shared nav option label is smaller',
    officeCss.includes('.shared-office-nav-option-label {\n    font-size: 0.84rem;')
);
check(
    'retired controls are hidden and non-interactive in css',
    officeCss.includes('[data-shared-office-nav-retired="true"] * {\n    display: none !important;\n    visibility: hidden !important;\n    pointer-events: none !important;')
);
check(
    'package exposes polish audit',
    packageJson.scripts?.['audit:shared-office-navigation-polish'] === 'node scripts/audit-shared-office-navigation-polish.mjs'
);

if (failures.length) {
    console.error(`FAIL shared office navigation polish audit: ${failures.length} failure(s)`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log(`PASS shared office navigation polish audit: ${checks} check(s) passed.`);
