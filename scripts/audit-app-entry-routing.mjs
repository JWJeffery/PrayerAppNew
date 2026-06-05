#!/usr/bin/env node
import fs from 'node:fs';

const index = fs.readFileSync('index.html', 'utf8');
const officeUi = fs.readFileSync('js/office-ui.js', 'utf8');
const css = fs.readFileSync('css/office.css', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const failures = [];
let checks = 0;

function check(label, condition) {
    checks += 1;
    if (!condition) failures.push(label);
}

check('tradition entry screen exists', index.includes('id="tradition-entry"') && index.includes('app-tradition-entry'));
check('universal selector is preserved', index.includes('id="mode-selection"') && index.includes('Universal Office Selector'));
check('universal selector is not default visible in markup', index.includes('<div id="mode-selection" class="app-mode-shell" style="display:none;">'));
check('western family choice exists', index.includes("selectTraditionFamily('western')"));
check('eastern family choice exists', index.includes("selectTraditionFamily('eastern')"));
check('unknown routes through default setter', index.includes("setUserTraditionDefault('unknown')"));
check('anglican option is enabled', index.includes("setUserTraditionDefault('anglican')") && index.includes('TEC 1979 Book of Common Prayer'));
check('catholic option is disabled until LOTH exists', index.includes('Catholic') && index.includes('disabled aria-disabled="true"') && index.includes('Liturgy of the Hours is not implemented yet'));
check('eastern options route to implemented offices', index.includes("setUserTraditionDefault('church-of-the-east')") && index.includes("setUserTraditionDefault('eastern-orthodox')") && index.includes("setUserTraditionDefault('oriental-orthodox')"));
check('universal selector can be selected explicitly', index.includes("setUserTraditionDefault('universal')"));
check('entry preference key exists', officeUi.includes("UNIVERSAL_OFFICE_ENTRY_DEFAULT_KEY = 'universalOffice.entry.default.v1'"));
check('tradition map sends anglican to daily', officeUi.includes("'anglican': 'daily'"));
check('tradition map sends unknown to daily', officeUi.includes("'unknown': 'daily'"));
check('tradition map sends church of the east to east syriac', officeUi.includes("'church-of-the-east': 'east-syriac'"));
check('tradition map sends eastern orthodox to horologion', officeUi.includes("'eastern-orthodox': 'horologion'"));
check('tradition map sends oriental orthodox to ethiopian sa atat', officeUi.includes("'oriental-orthodox': 'ethiopian-saatat'"));
check('localStorage persistence is used', officeUi.includes('localStorage.setItem(UNIVERSAL_OFFICE_ENTRY_DEFAULT_KEY') && officeUi.includes('localStorage.getItem(UNIVERSAL_OFFICE_ENTRY_DEFAULT_KEY'));
check('entry initialization runs on DOMContentLoaded', officeUi.includes("document.addEventListener('DOMContentLoaded', initializeEntryRouting);"));
check('selectMode hides tradition entry', officeUi.includes("const traditionEntry = document.getElementById('tradition-entry');") && officeUi.includes("traditionEntry.style.display = 'none'"));
check('backToSplash returns to universal selector', officeUi.includes('function showUniversalModeSelection') && officeUi.includes('showUniversalModeSelection();'));
check('entry CSS exists', css.includes('Tradition entry routing pass') && css.includes('#tradition-entry.app-tradition-entry'));
check('entry family grid CSS exists', css.includes('.app-entry-family-grid'));
check('disabled Catholic state CSS exists', css.includes('.app-entry-tradition-card.is-disabled'));
check('package exposes audit script', pkg.scripts?.['audit:app-entry-routing'] === 'node scripts/audit-app-entry-routing.mjs');

if (failures.length) {
    console.error(`FAIL app entry routing audit: ${failures.length} failure(s)`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log(`PASS app entry routing audit: ${checks} check(s) passed.`);
