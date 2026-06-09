#!/usr/bin/env node
import fs from 'node:fs';

const index = fs.readFileSync('index.html', 'utf8');
const officeUi = fs.readFileSync('js/office-ui.js', 'utf8');
const tooltipJs = fs.readFileSync('js/tooltip.js', 'utf8');
const css = fs.readFileSync('css/office.css', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const failures = [];
let checks = 0;

function check(label, condition) {
    checks += 1;
    if (!condition) failures.push(label);
}

check('tradition entry screen exists', index.includes('id="tradition-entry"') && index.includes('app-tradition-entry'));
check('universal selector is preserved outside public first screen', index.includes('id="mode-selection"') && index.includes('app-universal-selector') && index.includes('Universal Office Selector'));
check('universal selector does not claim all traditions/tools remain available on splash', !index.includes('All traditions and tools remain available here.'));
check('universal selector is not default visible in markup', index.includes('<div id="mode-selection" class="app-mode-shell app-universal-selector" style="display:none;" hidden aria-hidden="true">'));
check('western family choice exists', index.includes('data-entry-family="western"'));
check('family grid has stable id for first-screen hiding', index.includes('id="entry-family-grid"') && index.includes('aria-label="Choose Western, Eastern, or unknown"'));
check('eastern family choice exists', index.includes('data-entry-family="eastern"'));
check('unknown routes through default setter', index.includes('data-entry-tradition="unknown"'));
check('unknown entry copy is non-Anglican-forward', index.includes('<small>Help me begin.</small>') && !index.includes('Start with the Anglican Daily Office.') && !index.includes('Start with a stable default. You can change this later.'));
check('anglican option is enabled only in second-step western selector', index.includes('id="entry-western-options"') && index.includes('data-entry-back="true"') && index.includes('data-entry-tradition="anglican"') && index.includes('TEC 1979 Book of Common Prayer'));
check('catholic option is disabled until LOTH exists', index.includes('Catholic') && index.includes('disabled aria-disabled="true"') && index.includes('Liturgy of the Hours is not implemented yet'));
check('eastern options route to implemented offices only after family choice', index.includes('id="entry-eastern-options"') && index.includes('app-entry-secondary-selector" hidden aria-hidden="true"') && index.includes('data-entry-back="true"') && index.includes('data-entry-tradition="church-of-the-east"') && index.includes('data-entry-tradition="eastern-orthodox"') && index.includes('data-entry-tradition="oriental-orthodox"'));
check('public first screen does not expose universal selector control', !index.includes('Open the Universal Office selector instead') && !index.includes('<button class="app-entry-universal-link"') && !index.includes("onclick=\"setUserTraditionDefault('universal')\""));
check('entry preference key exists', officeUi.includes("UNIVERSAL_OFFICE_ENTRY_DEFAULT_KEY = 'universalOffice.entry.default.v1'"));
check('tradition route sends anglican to daily', officeUi.includes("case 'anglican':") && officeUi.includes("mode: 'daily'"));
check('tradition route sends unknown quietly to daily', officeUi.includes("case 'unknown':") && officeUi.includes("storedDefault: 'anglican'") && officeUi.includes("mode: 'daily'"));
check('tradition route sends church of the east to east syriac', officeUi.includes("case 'church-of-the-east':") && officeUi.includes("mode: 'east-syriac'"));
check('tradition route sends eastern orthodox to horologion', officeUi.includes("case 'eastern-orthodox':") && officeUi.includes("mode: 'horologion'"));
check('tradition route sends oriental orthodox to ethiopian sa atat', officeUi.includes("case 'oriental-orthodox':") && officeUi.includes("mode: 'ethiopian-saatat'"));
check('localStorage persistence is used', officeUi.includes('localStorage.setItem(UNIVERSAL_OFFICE_ENTRY_DEFAULT_KEY') && officeUi.includes('localStorage.getItem(UNIVERSAL_OFFICE_ENTRY_DEFAULT_KEY'));
check('universal selector remains available by stored default or explicit query override', officeUi.includes("'universal': 'universal'") && officeUi.includes("entryOverride === 'universal'"));
check('entry initialization runs on DOMContentLoaded', officeUi.includes("document.addEventListener('DOMContentLoaded', initializeEntryRouting);"));
check('selecting a family hides the first-screen family grid', officeUi.includes("const familyGrid = document.getElementById('entry-family-grid');") && officeUi.includes('familyGrid.hidden = isFamilyStep') && officeUi.includes("traditionEntry.dataset.entryStep"));
check('family reset restores neutral first screen', officeUi.includes("title.textContent = isWestern ? 'Western Christian' : isEastern ? 'Eastern Christian' : 'Where do you pray?'") && officeUi.includes("selectTraditionFamily(null)"));
check('entry click handler routes by data attributes', officeUi.includes('function handleTraditionEntryClick(event)') && officeUi.includes('button.dataset.entryFamily') && officeUi.includes('button.dataset.entryTradition') && officeUi.includes('bindTraditionEntryControls()'));
check('selectMode hides entry panels through focus-safe helper', officeUi.includes("const traditionEntry = document.getElementById('tradition-entry');") && officeUi.includes('hideEntrySurface(modeSelection);') && officeUi.includes('hideEntrySurface(traditionEntry);'));
check('backToSplash returns to universal selector', officeUi.includes('function showUniversalModeSelection') && officeUi.includes('showUniversalModeSelection();'));
check('entry CSS exists', css.includes('Tradition entry routing pass') && css.includes('#tradition-entry.app-tradition-entry'));
check('entry family grid CSS exists', css.includes('.app-entry-family-grid'));
check('disabled Catholic state CSS exists', css.includes('.app-entry-tradition-card.is-disabled'));
check('public first screen has no universal selector link CSS', !css.includes('.app-entry-universal-link'));
check('hidden secondary selectors are explicitly suppressed', css.includes('Entry first-screen scope repair') && css.includes('#tradition-entry .app-entry-secondary-selector[hidden]') && css.includes('#mode-selection.app-universal-selector[hidden]'));
check('family step separation CSS exists', css.includes('Entry family-step separation repair') && css.includes('#entry-family-grid[hidden]') && css.includes('#tradition-entry[data-entry-step="western"] .app-entry-family-grid'));
check('entry splash stained glass viewport stability CSS exists', css.includes('Entry splash stained-glass viewport stabilization pass') && css.includes('min-height: 100svh') && css.includes('min-height: 100dvh') && css.includes('overflow-y: auto !important') && css.includes('#splash-bg::before') && css.includes("url('/images/canterbury.png')"));
check('entry card no longer covers the stained glass composition by default', css.includes('width: min(860px, calc(100vw - 48px))') && css.includes('margin: clamp(82px, 13vh, 172px) auto') && css.includes('-webkit-backdrop-filter: blur(5px)'));
check('entry splash foreground safety guard exists', officeUi.includes('function ensureSplashForegroundVisible()') && officeUi.includes('Splash background was visible without a foreground panel') && officeUi.includes('scheduleSplashForegroundGuard();'));
check('package exposes audit script', pkg.scripts?.['audit:app-entry-routing'] === 'node scripts/audit-app-entry-routing.mjs');

check('universal selector advanced tools are hidden by default', index.includes('data-advanced-only="true" hidden aria-hidden="true" onclick="window.location.href=\'admin/admin.html\'"') && index.includes('id="user-profile-defaults" class="app-profile-defaults app-advanced-only" data-advanced-only="true" hidden aria-hidden="true"'));
check('universal selector advanced tools can be explicitly revealed without persistence', officeUi.includes("params.get('advanced')") && officeUi.includes("explicitAdvanced === '1' || explicitAdvanced === 'true'") && !officeUi.includes('UNIVERSAL_OFFICE_ADVANCED_TOOLS_KEY') && !officeUi.includes('localStorage.setItem(UNIVERSAL_OFFICE_ADVANCED_TOOLS_KEY') && officeUi.includes('syncUniversalOfficeAdvancedToolsVisibility();'));
check('universal selector advanced tools gate CSS exists', css.includes('Universal selector advanced-tools gate') && css.includes('#mode-selection.app-universal-selector:not(.app-entry-advanced-tools-visible) .app-advanced-only'));
check('shared office hour selector does not use internal scroll', css.includes('Shared office hour selector internal-scroll removal') && css.includes('.shared-office-nav-options') && css.includes('max-height: none !important') && css.includes('overflow-y: visible !important'));
check('tooltip engine clamps mobile viewport and supports tap dismissal', tooltipJs.includes('function positionTooltipFromPoint(clientX, clientY)') && tooltipJs.includes('viewportWidth() - 24') && tooltipJs.includes('clamp(left, margin') && tooltipJs.includes("document.addEventListener('click'") && tooltipJs.includes("document.addEventListener('scroll', hideTooltip, true)"));
check('mobile sidebar close rail remains visible above drawer', css.includes('Mobile sidebar close rail visibility') && css.includes('body.office-active #sidebar-toggle') && css.includes('position: fixed !important') && css.includes('z-index: 900 !important') && css.includes('left: 42px !important'));

check('mobile sidebar labels wrap inside nested cards', css.includes('Mobile sidebar label wrapping containment') && css.includes('body.office-active .app-mode-drawer label') && css.includes('display: flex !important') && css.includes('overflow-wrap: anywhere !important') && css.includes('white-space: normal !important'));

check('universal selector card order is traditions then book of needs then bible then admin', (() => {
    const selectorStart = index.indexOf('<div id="mode-selection"');
    const selectorEnd = index.indexOf('<a class="app-sponsor-link"', selectorStart);
    if (selectorStart < 0 || selectorEnd < 0) return false;

    const selector = index.slice(selectorStart, selectorEnd);
    const orderedNeedles = [
        "selectMode('daily')",
        "selectMode('ethiopian-saatat')",
        "selectMode('east-syriac')",
        "selectMode('horologion')",
        "openUniversalBookOfNeeds()",
        "openBibleBrowser()",
        "admin/admin.html"
    ];

    const positions = orderedNeedles.map(needle => selector.indexOf(needle));
    return positions.every(pos => pos >= 0) && positions.every((pos, i) => i === 0 || pos > positions[i - 1]);
})());

check('universal selector card titles are uniform and tradition-forward', (() => {
    const selectorStart = index.indexOf('<div id="mode-selection"');
    const selectorEnd = index.indexOf('<a class="app-sponsor-link"', selectorStart);
    if (selectorStart < 0 || selectorEnd < 0) return false;

    const selector = index.slice(selectorStart, selectorEnd);
    const requiredTitles = [
        '<span class="app-mode-title">The Episcopal Church</span>',
        '<span class="app-mode-title">Oriental Orthodoxy</span>',
        '<span class="app-mode-title">Church of the East</span>',
        '<span class="app-mode-title">Eastern Orthodoxy</span>',
        '<span class="app-mode-title">Book of Needs</span>',
        '<span class="app-mode-title">Bible Browser</span>',
        '<span class="app-mode-title">Admin Console</span>'
    ];

    const retiredTitles = [
        '<span class="app-mode-title">Daily Office</span>',
        '<span class="app-mode-title">Ethiopian Sa’atat</span>',
        '<span class="app-mode-title">Horologion</span>',
        '<span class="app-mode-title">The Book of Needs</span>',
        '<span class="app-mode-title">Bible Reader</span>',
        '<span class="app-mode-title">Admin Dashboard</span>'
    ];

    return requiredTitles.every(title => selector.includes(title)) &&
        retiredTitles.every(title => !selector.includes(title));
})());

check('entry panels are hidden with focus-safe helper', (() => {
    const helperStart = officeUi.indexOf('function hideEntrySurface(container)');
    if (helperStart < 0) return false;

    const helperEnd = officeUi.indexOf('function showEntrySurface(container)', helperStart);
    if (helperEnd < 0) return false;

    const helper = officeUi.slice(helperStart, helperEnd);
    return officeUi.includes('function safelyBlurFocusedDescendant(container)') &&
        helper.includes('safelyBlurFocusedDescendant(container);') &&
        helper.indexOf('safelyBlurFocusedDescendant(container);') < helper.indexOf("setAttribute('aria-hidden', 'true')") &&
        helper.includes("container.inert = true");
})());

check('entry routing uses shared show/hide helpers for entry panels', (() => {
    const entryRoutingStart = officeUi.indexOf('function showTraditionEntry()');
    const selectModeStart = officeUi.indexOf('async function selectMode(mode)');
    if (entryRoutingStart < 0 || selectModeStart < 0) return false;

    const entryRouting = officeUi.slice(entryRoutingStart, selectModeStart);
    const selectModeHeader = officeUi.slice(selectModeStart, officeUi.indexOf("document.body.style.display", selectModeStart));

    return entryRouting.includes('hideEntrySurface(modeSelection);') &&
        entryRouting.includes('hideEntrySurface(traditionEntry);') &&
        entryRouting.includes('showEntrySurface(modeSelection);') &&
        entryRouting.includes('showEntrySurface(traditionEntry);') &&
        selectModeHeader.includes('hideEntrySurface(modeSelection);') &&
        selectModeHeader.includes('hideEntrySurface(traditionEntry);');
})());

if (failures.length) {
    console.error(`FAIL app entry routing audit: ${failures.length} failure(s)`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log(`PASS app entry routing audit: ${checks} check(s) passed.`);
