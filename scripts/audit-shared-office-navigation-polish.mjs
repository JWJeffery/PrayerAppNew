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

/* CORRECTED (Phase 6, sidebar-deletion refactor): this audit used to check
   for _sharedOfficeNavigatorHideLegacy() and its two helpers -- machinery
   that retired old sibling markup inside each mode's own legacy sidebar so
   it wouldn't visually clash with the freshly-built nav next to it. That
   legacy markup (and the sidebars themselves) is being deleted as part of
   this refactor, so there is nothing left for that machinery to retire; it
   and the CSS rule that hid retired elements were deleted outright. See
   audit-ledger.html's ui:phase6-retire-old-skin row for the full account. */
check(
    'single neutral shared-office-nav host exists',
    officeUi.includes('const SHARED_OFFICE_NAV_HOST_ID = "legacy-office-controls";')
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
    'package exposes polish audit',
    packageJson.scripts?.['audit:shared-office-navigation-polish'] === 'node scripts/audit-shared-office-navigation-polish.mjs'
);

if (failures.length) {
    console.error(`FAIL shared office navigation polish audit: ${failures.length} failure(s)`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log(`PASS shared office navigation polish audit: ${checks} check(s) passed.`);
