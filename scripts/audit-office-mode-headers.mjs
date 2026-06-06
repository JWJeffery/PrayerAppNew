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
const css = read('css/office.css');
const pkg = JSON.parse(read('package.json') || '{}');

check('main office shell title has stable id', index.includes('<h1 id="office-mode-title">The Universal Office</h1>'));
check('office mode header label map exists', officeUi.includes('const OFFICE_MODE_HEADER_LABELS = {'));
check('daily office shell names Episcopal Church daily office', officeUi.includes("daily: 'The Daily Office of the Episcopal Church'"));
check('ethiopian shell title is mapped', officeUi.includes("'ethiopian-saatat': \"The Ethiopian Sa'atat\""));
check('church of the east shell title is mapped', officeUi.includes("'east-syriac': 'Church of the East'"));
check('horologion shell title is mapped', officeUi.includes("horologion: 'The Horologion'"));
check('selectMode updates office shell header', officeUi.includes('updateOfficeModeHeader(mode);'));
check('BCP rendered office body names the Daily Office of the Episcopal Church', officeUi.includes('<p class="office-family-title">The Daily Office of the Episcopal Church</p>'));
check('Horologion rendered office body names the Horologion', officeUi.includes('<p class="office-family-title">The Horologion</p>'));
check('office family title CSS exists', css.includes('Office mode header normalization pass') && css.includes('.office-family-title'));
check('package exposes office mode header audit', pkg.scripts?.['audit:office-mode-headers'] === 'node scripts/audit-office-mode-headers.mjs');

if (failures.length) {
    console.error(`FAIL office mode headers audit: ${failures.length} failure(s)`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log(`PASS office mode headers audit: ${checks} check(s) passed.`);
