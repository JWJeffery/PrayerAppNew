/**
 * ============================================================================
 * JIT MODULAR ARCHITECTURE — CORRECTED PATCH v2
 * Phase 9.1 — Tradition-Aware Ingestion
 *
 * WHAT WAS WRONG IN THE ARCHITECT'S REVIEW (AND WHAT WAS RIGHT)
 * ==============================================================
 *
 * POINT 1 — "Ethiopian path fetches coptic.json and ecumenical.json" — FALSE.
 *   The original patch's hydrateForEthiopianSaatat() fetches exactly two files:
 *   components/ethiopian.json and components/traditions/ethiopian/rubrics.json.
 *   Coptic and ecumenical shards appear only inside hydrateForDailyOffice().
 *   This point was a misreading of the patch. No correction was needed here,
 *   but the code below makes the isolation even more explicit for clarity.
 *
 * POINT 2 — "init() wrapper auto-triggers Anglican load" — PARTIALLY VALID.
 *   index.html does NOT call init() on page load (verified: no onload,
 *   DOMContentLoaded, or bare init() call exists in the HTML). The concern
 *   about auto-firing does not apply to this codebase. However, the architect
 *   is correct that a legacy init() wrapper that delegates to
 *   hydrateForDailyOffice() is semantically misleading and could cause
 *   confusion for future maintainers. The correction: init() now calls
 *   loadKernel() only and logs a deprecation notice, as the architect suggested.
 *   This is the one valid structural improvement in the review.
 *
 * POINT 3 — "Missing hydrateForBookOfNeeds() / prayers.json gate" — INCORRECT.
 *   prayers.js already implements a null-guarded lazy fetch of data/prayers.json
 *   inside showSinglePrayer(). It runs on the first prayer request and caches
 *   the result in the module-level `prayersData` variable. Adding a SECOND
 *   fetch in selectMode() would:
 *     a) Double-load prayers.json on first Book of Needs entry.
 *     b) Store the result in appData.prayers, which nothing in the codebase
 *        ever reads — it would be dead memory.
 *     c) Fail to prevent the prayers.js fetch anyway, since prayersData and
 *        appData.prayers are separate variables.
 *   The Book of Needs path in selectMode() is correctly data-free. No change.
 *
 * POINT 4 — "Promise.all is the right approach" — CORRECT AND ACCEPTED.
 *   This was already present in the original patch and is preserved here.
 *
 * FATAL FLAW IN THE ARCHITECT'S PROPOSED CODE (NOT APPLIED)
 * ----------------------------------------------------------
 * The architect's sample code initialises appData.components as a plain object:
 *   appData = { components: {}, rubrics: {} }
 * and merges shards with object spread:
 *   appData.components = { ...appData.components, ...ethShard }
 *
 * This would immediately crash the application. Every single component and
 * rubric lookup in renderOffice() uses Array methods:
 *   appData.components.find(...)
 *   appData.rubrics.find(...)
 *   appData.components.concat(...)
 * Plain JavaScript objects do not have .find() or .concat(). The first call
 * to renderOffice() after the architect's kernel loaded would throw:
 *   TypeError: appData.components.find is not a function
 *
 * Additionally, spreading an array with object spread ({...myArray}) produces
 * an index-keyed object ({0: item0, 1: item1, ...}), not a merged array, so
 * even if .find() were somehow available it would not traverse the items.
 *
 * appData.components and appData.rubrics must remain plain JavaScript Arrays.
 * ============================================================================
 */


// ── State ─────────────────────────────────────────────────────────────────────
let appData = null;
let currentDate = new Date();
let selectedMode = null;
let isHydrationComplete = false;

// ── Ethiopian Temporal Override ───────────────────────────────────────────────
window._temporalOverride = { active: false, date: null, hourId: null };

// ── App Settings ──────────────────────────────────────────────────────────────
const appSettings = {
    studyMode: false
};

function toggleEthOverridePanel(e) {
    e.preventDefault();
    const panel = document.getElementById('eth-override-panel');
    if (!panel) return;
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
        const picker = document.getElementById('eth-override-date');
        if (picker) {
            const y  = currentDate.getFullYear();
            const mo = String(currentDate.getMonth() + 1).padStart(2, '0');
            const d  = String(currentDate.getDate()).padStart(2, '0');
            picker.value = `${y}-${mo}-${d}`;
        }
    }
}

function applyEthOverride() {
    const dateVal  = document.getElementById('eth-override-date')?.value;
    const radioVal = document.querySelector('input[name="eth-watch-override"]:checked')?.value;
    if (!dateVal && !radioVal) return;
    window._temporalOverride.active = true;
    if (dateVal) {
        const [y, mo, d] = dateVal.split('-');
        window._temporalOverride.date = new Date(parseInt(y), parseInt(mo) - 1, parseInt(d));
    }
    window._temporalOverride.hourId = radioVal || null;
    renderOffice();
}

function resetEthOverride() {
    window._temporalOverride = { active: false, date: null, hourId: null };
    document.querySelectorAll('input[name="eth-watch-override"]').forEach(r => r.checked = false);
    const panel = document.getElementById('eth-override-panel');
    if (panel) panel.style.display = 'none';
    renderOffice();
}

const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];

// ── 30-Day Psalter Cycle (BCP 1979, p. 935) ──────────────────────────────────
const psalterCycle = [
    {day: 1,  morning: '1,2,3,4,5',              evening: '6,7,8'},
    {day: 2,  morning: '9,10,11',                 evening: '12,13,14'},
    {day: 3,  morning: '15,16,17',                evening: '18'},
    {day: 4,  morning: '19,20,21',                evening: '22,23'},
    {day: 5,  morning: '24,25,26',                evening: '27,28,29'},
    {day: 6,  morning: '30,31',                   evening: '32,33,34'},
    {day: 7,  morning: '35,36',                   evening: '37'},
    {day: 8,  morning: '38,39,40',                evening: '41,42,43'},
    {day: 9,  morning: '44,45,46',                evening: '47,48,49'},
    {day: 10, morning: '50,51,52',                evening: '53,54,55'},
    {day: 11, morning: '56,57,58',                evening: '59,60,61'},
    {day: 12, morning: '62,63,64',                evening: '65,66,67'},
    {day: 13, morning: '68',                      evening: '69,70'},
    {day: 14, morning: '71,72',                   evening: '73,74'},
    {day: 15, morning: '75,76,77',                evening: '78'},
    {day: 16, morning: '79,80,81',                evening: '82,83,84,85'},
    {day: 17, morning: '86,87,88',                evening: '89'},
    {day: 18, morning: '90,91,92',                evening: '93,94'},
    {day: 19, morning: '95,96,97',                evening: '98,99,100,101'},
    {day: 20, morning: '102,103',                 evening: '104'},
    {day: 21, morning: '105',                     evening: '106'},
    {day: 22, morning: '107',                     evening: '108,109'},
    {day: 23, morning: '110,111,112,113',         evening: '114,115'},
    {day: 24, morning: '116,117,118',             evening: '119:1-32'},
    {day: 25, morning: '119:33-72',               evening: '119:73-104'},
    {day: 26, morning: '119:105-144',             evening: '119:145-176'},
    {day: 27, morning: '120,121,122,123,124,125', evening: '126,127,128,129,130,131'},
    {day: 28, morning: '132,133,134,135',         evening: '136,137,138'},
    {day: 29, morning: '139,140,141',             evening: '142,143,144'},
    {day: 30, morning: '145,146,147',             evening: '148,149,150'},
    {day: 31, morning: '139,140',                 evening: '141,142,143'}
];

// ── Seasonal Theme ───────────────────────────────────────────────────────────
function updateSeasonalTheme(color) {
    let hex = '#4a7c59';
    if (color === 'purple') hex = '#6b3070';
    if (color === 'rose')   hex = '#a04060';
    if (color === 'white')  hex = '#c9a84c';
    if (color === 'green')  hex = '#4a7c59';
    if (color === 'red')    hex = '#9b2335';
    document.documentElement.style.setProperty('--accent', hex);
}

// ── MICRO-KERNEL LOADER ───────────────────────────────────────────────────────
//
// loadKernel() bootstraps the minimum shared state that every tradition needs.
// It fetches two files in parallel:
//
//   data/rubrics.json      — the four BCP office sequence definitions
//                            (morning, evening, noonday, compline). Required.
//   components/common.json — the five universal components shared by all
//                            traditions: Lord's Prayer, Gloria Patri, Apostles'
//                            Creed, Nicene Creed, and Kyrie. Required.
//
// Both appData.components and appData.rubrics are initialised as empty Arrays
// because every downstream consumer (renderOffice, etc.) calls Array methods
// (.find, .concat) on them. They must never be plain objects.
//
// The _loadedTraditions Set tracks which tradition-specific shards have been
// added so that re-entering a mode does not trigger redundant network requests.
//
// The isKernelLoaded flag on appData mirrors the Set approach so both styles
// of guard check are supported.
//
// loadKernel() is idempotent: if appData is already non-null, it returns
// immediately. It is always called first by the hydration functions and never
// needs to be called directly by application code.
//
async function loadKernel() {
    if (appData) return;

    appData = {
        components:        [],   // Array — consumers call .find() and .concat()
        rubrics:           [],   // Array — consumers call .find() and .concat()
        _loadedTraditions: new Set(),
        isKernelLoaded:    false,
        senkessarIndex:    null, // Lazy-loaded on first Ethiopian saints render
        senkessarCache:    {}    // Keyed by month slug; populated on first access per month
    };

    try {
        const [rubricsRes, commonRes] = await Promise.all([
            fetch('data/rubrics.json'),
            fetch('components/common.json')
        ]);

        if (!rubricsRes.ok) throw new Error('Kernel failure: data/rubrics.json not found.');
        appData.rubrics = await rubricsRes.json();
        console.log('[kernel] Loaded data/rubrics.json');

        if (commonRes.ok) {
            const commonText = await commonRes.text();
            if (commonText.trim()) {
                const commonData = JSON.parse(commonText);
                appData.components = appData.components.concat(commonData);
                console.log(`[kernel] Loaded components/common.json — ${commonData.length} components`);
            }
        } else {
            console.warn('[kernel] components/common.json missing — Lord\'s Prayer and Creeds unavailable.');
        }

        appData.isKernelLoaded = true;
        updateUI();

    } catch (err) {
        appData = null; // Reset so a retry attempt can succeed.
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>System Error</h3><p>${err.message}</p></div>`;
        console.error('[kernel] Fatal load failure:', err);
        throw err;
    }
}


// ── DAILY OFFICE HYDRATION ────────────────────────────────────────────────────
//
// hydrateForDailyOffice() adds the three shards required by the BCP Daily
// Office to the shared component registry:
//
//   components/anglican.json   — 179 components: all BCP collects, canticles,
//                                antiphons, opening sentences, penitential rite,
//                                absolutions, suffrages, litany, and closing.
//                                Marked required — the Daily Office cannot render
//                                without it.
//   components/coptic.json     — 2 components: Agpeya Opening and Theotokion.
//                                Optional — failure is logged but not fatal.
//   components/ecumenical.json — 9 components: Angelus, Trisagion, Examen, etc.
//                                Optional — failure is logged but not fatal.
//
// All three fetches run in parallel via Promise.all. Each is wrapped in its own
// try/catch so a parse failure in one shard does not abort the others.
//
// CalendarEngine.init() is called after the shards resolve. It loads
// bcp-propers.json, which getCurrentProper() requires for Ordinary Time Sunday
// naming. This is sequential after the shard fetch — it is a separate service
// with its own caching — but it is a small file and its failure is non-fatal.
//
// The function is idempotent via _loadedTraditions. Re-entering the Daily
// Office mode from another tradition does not re-download any shards. Because
// hydration only ever adds to appData.components (never replaces), the registry
// accumulates cleanly: a user who visits both Daily Office and Sa'atat in one
// session ends up with all shards loaded, which is correct and efficient.
//
async function hydrateForDailyOffice() {
    await loadKernel();
    if (!appData) return;

    if (appData._loadedTraditions.has('daily')) {
        console.log('[hydrate:daily] Already loaded — skipping.');
        return;
    }

    console.log('[hydrate:daily] Fetching Anglican, Coptic, and Ecumenical shards in parallel...');

    const shardDefs = [
        { name: 'anglican',   required: true  },
        { name: 'coptic',     required: false },
        { name: 'ecumenical', required: false }
    ];

    const shardPromises = shardDefs.map(async ({ name, required }) => {
        try {
            const res = await fetch(`components/${name}.json`);
            if (!res.ok) {
                if (required) console.warn(`[hydrate:daily] Required shard missing: components/${name}.json`);
                return;
            }
            const text = await res.text();
            if (!text.trim()) {
                if (required) console.warn(`[hydrate:daily] Required shard is empty: components/${name}.json`);
                return;
            }
            const data = JSON.parse(text);
            appData.components = appData.components.concat(data);
            console.log(`[hydrate:daily] Loaded components/${name}.json — ${data.length} components`);
        } catch (e) {
            if (required) console.warn(`[hydrate:daily] Failed to parse ${name}.json:`, e.message);
            else          console.log(`[hydrate:daily] Skipping unparseable optional shard: ${name}.json`);
        }
    });

    await Promise.all(shardPromises);
    console.log(`[hydrate:daily] Total components in registry: ${appData.components.length}`);

    await CalendarEngine.init();

    appData._loadedTraditions.add('daily');
    console.log('[hydrate:daily] Daily Office hydration complete.');
}


// ── ETHIOPIAN SA'ATAT HYDRATION ───────────────────────────────────────────────
//
// hydrateForEthiopianSaatat() adds exactly two files to the shared registry:
//
//   components/ethiopian.json
//       The Ethiopian component shard. Contains the nine canonical hour texts
//       (eth-nigatu-hour-text through eth-mahlet-hour-text), the Tselote Meweta
//       (introduction to every hour), Weddase Maryam variants for each day of
//       the week, Senkessar scaffolding, Leke Haile chant, and Anqasa Birhan.
//       Treated as optional with a warning on failure — the Sa'atat panel will
//       open but hour texts will be absent rather than crashing.
//
//   components/traditions/ethiopian/rubrics.json
//       The rubric extension for the 'ethiopian-saatat' office. Concatenated
//       onto appData.rubrics so that renderOffice() can find the rubric by id.
//       Without this, renderOffice() falls through to activeRubric === undefined
//       and produces a blank, untitled office.
//
// Neither Anglican, Coptic, nor Ecumenical shards are fetched here. The
// isEthiopianSaatat flag in renderOffice() gates all BCP-specific code paths
// so unloaded Anglican components are simply not looked up.
//
// The Senkessar index (senkessar-index.json) is NOT fetched here. It remains a
// lazy load triggered inside the eth-saints-commemoration handler when the date
// is resolved and the handler actually runs. Fetching it here would load a large
// index file that may never be needed during a short Sa'atat session.
//
// Both fetches run in parallel via Promise.allSettled, which allows each
// result to be handled independently — a failure in the rubric fetch does not
// prevent the component shard from being processed, and vice versa.
//
// This function is idempotent via _loadedTraditions.
//
async function hydrateForEthiopianSaatat() {
    await loadKernel();
    if (!appData) return;

    if (appData._loadedTraditions.has('ethiopian')) {
        console.log('[hydrate:ethiopian] Already loaded — skipping.');
        return;
    }

    console.log('[hydrate:ethiopian] Fetching Ethiopian shard and rubric extension in parallel...');

    const [shardResult, rubricsResult] = await Promise.allSettled([
        fetch('components/ethiopian.json'),
        fetch('components/traditions/ethiopian/rubrics.json')
    ]);

    if (shardResult.status === 'fulfilled') {
        const res = shardResult.value;
        if (res.ok) {
            try {
                const text = await res.text();
                if (text.trim()) {
                    const data = JSON.parse(text);
                    appData.components = appData.components.concat(data);
                    console.log(`[hydrate:ethiopian] Loaded components/ethiopian.json — ${data.length} components`);
                } else {
                    console.log('[hydrate:ethiopian] components/ethiopian.json is present but empty — skipping.');
                }
            } catch (e) {
                console.warn('[hydrate:ethiopian] Failed to parse components/ethiopian.json:', e.message);
            }
        } else {
            console.warn(`[hydrate:ethiopian] components/ethiopian.json not found (HTTP ${res.status}).`);
        }
    } else {
        console.warn('[hydrate:ethiopian] Network error fetching components/ethiopian.json:', shardResult.reason);
    }

    if (rubricsResult.status === 'fulfilled') {
        const res = rubricsResult.value;
        if (res.ok) {
            try {
                const ethRubrics = await res.json();
                appData.rubrics = appData.rubrics.concat(ethRubrics);
                console.log(`[hydrate:ethiopian] Loaded Ethiopian rubric extension — ${ethRubrics.length} office(s) added.`);
            } catch (e) {
                console.warn('[hydrate:ethiopian] Failed to parse Ethiopian rubrics.json:', e.message);
            }
        } else {
            console.warn(`[hydrate:ethiopian] Ethiopian rubrics.json not found — 'ethiopian-saatat' rubric will be absent.`);
        }
    } else {
        console.warn('[hydrate:ethiopian] Network error fetching Ethiopian rubrics.json:', rubricsResult.reason);
    }

    console.log(`[hydrate:ethiopian] Total components in registry: ${appData.components.length}`);
    appData._loadedTraditions.add('ethiopian');
    console.log('[hydrate:ethiopian] Ethiopian Sa\'atat hydration complete.');
}


// ── EAST SYRIAC RAMSHA HYDRATION ──────────────────────────────────────────────
async function hydrateForEastSyriac() {
    await loadKernel();
    if (!appData) return;

    if (appData._loadedTraditions.has('east-syriac')) {
        console.log('[hydrate:east-syriac] Already loaded — skipping.');
        return;
    }

    console.log('[hydrate:east-syriac] Fetching East Syriac shard and rubrics in parallel...');

    const [shardResult, rubricsResult] = await Promise.allSettled([
        fetch('components/east-syriac.json'),
        fetch('components/traditions/east-syriac/rubrics.json')
    ]);

    if (shardResult.status === 'fulfilled') {
        const res = shardResult.value;
        if (res.ok) {
            try {
                const text = await res.text();
                if (text.trim()) {
                    const data = JSON.parse(text);
                    appData.components = appData.components.concat(data);
                    console.log(`[hydrate:east-syriac] Loaded components/east-syriac.json — ${data.length} components`);
                } else {
                    console.warn('[hydrate:east-syriac] components/east-syriac.json is present but empty.');
                }
            } catch (e) {
                console.warn('[hydrate:east-syriac] Failed to parse east-syriac.json:', e.message);
            }
        } else {
            console.warn(`[hydrate:east-syriac] components/east-syriac.json not found (HTTP ${res.status}).`);
        }
    } else {
        console.warn('[hydrate:east-syriac] Network error fetching components/east-syriac.json:', shardResult.reason);
    }

    if (rubricsResult.status === 'fulfilled') {
        const res = rubricsResult.value;
        if (res.ok) {
            try {
                const rubrics = await res.json();
                appData.eastSyriacRubrics = rubrics;
                console.log('[hydrate:east-syriac] Loaded East Syriac rubrics.json.');
            } catch (e) {
                console.warn('[hydrate:east-syriac] Failed to parse East Syriac rubrics.json:', e.message);
            }
        } else {
            console.warn('[hydrate:east-syriac] East Syriac rubrics.json not found — Ramsha sequence will be absent.');
        }
    } else {
        console.warn('[hydrate:east-syriac] Network error fetching East Syriac rubrics.json:', rubricsResult.reason);
    }

    console.log(`[hydrate:east-syriac] Total components in registry: ${appData.components.length}`);
    appData._loadedTraditions.add('east-syriac');
    console.log('[hydrate:east-syriac] East Syriac hydration complete.');
}


// ── REVISED selectMode() ──────────────────────────────────────────────────────
//
// selectMode() is now async so it can await the correct hydration function
// before calling renderOffice(). All DOM manipulation is identical to the
// original. The three data-loading changes are:
//
//   'prayers'          — No data fetch. prayers.js already handles lazy loading
//                        of data/prayers.json inside showSinglePrayer() with its
//                        own null guard on the module-level prayersData variable.
//                        Adding a fetch here would create a parallel duplicate
//                        load stored in a dead key (appData.prayers) that nothing
//                        in the codebase reads. The DOM-only behaviour is correct.
//
//   'ethiopian-saatat' — Awaits hydrateForEthiopianSaatat() before rendering.
//                        First entry: fetches 2 files in parallel (~one round
//                        trip). Subsequent entries: returns immediately.
//
//   'daily' (default)  — Awaits hydrateForDailyOffice() before rendering.
//                        First entry: fetches 3 shards + bcp-propers in
//                        parallel. Subsequent entries: returns immediately.
//                        loadSettings() and updateSidebarForOffice() are called
//                        after hydration and before renderOffice(), matching the
//                        sequence in the original init() call chain.
//
async function selectMode(mode) {
    selectedMode = mode;

    document.getElementById('splash-bg').style.display      = 'none';
    document.getElementById('mode-selection').style.display = 'none';

    document.body.style.display        = '';
    document.body.style.alignItems     = '';
    document.body.style.justifyContent = '';
    document.body.style.height         = '';
    document.body.style.overflowY      = '';
    document.body.classList.add('office-active');

    document.body.classList.remove('ethiopian-theme');
    window._forcedOfficeId = undefined;

    const settingsPanel = document.getElementById('settings-panel');
    const ethSettings   = document.getElementById('ethiopian-settings');
    const mainContent   = document.getElementById('main-content');

    if (mode === 'prayers') {
        // ── Book of Needs ─────────────────────────────────────────────────────
        // Data loading is handled entirely within prayers.js. showSinglePrayer()
        // fetches data/prayers.json on first use and caches it in that module's
        // own prayersData variable. No action needed here.
        document.getElementById('daily-office-section').style.display       = 'none';
        document.getElementById('individual-prayers-section').style.display = 'flex';

    } else if (mode === 'ethiopian-saatat') {
        // ── Ethiopian Sa'atat ─────────────────────────────────────────────────
        document.getElementById('individual-prayers-section').style.display = 'none';
        document.getElementById('daily-office-section').style.display       = 'flex';

        document.body.classList.add('ethiopian-theme');
        window._forcedOfficeId = 'ethiopian-saatat';

        if (settingsPanel) {
            settingsPanel.classList.add('sidebar-hidden');
            settingsPanel.classList.add('mode-hidden');
        }
        if (ethSettings) {
            ethSettings.classList.remove('mode-hidden');
            ethSettings.classList.add('sidebar-hidden');
        }
        mainContent.classList.add('sidebar-hidden');

        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Preparing the Sa'atat...</h3><p>Loading the Ethiopian Book of Hours.</p></div>`;

        await hydrateForEthiopianSaatat();
        isHydrationComplete = true;
        renderOffice();

    } else if (mode === 'east-syriac') {
        // ── Church of the East ────────────────────────────────────────────────
        document.getElementById('individual-prayers-section').style.display = 'none';
        document.getElementById('daily-office-section').style.display       = 'flex';

        const esySettings = document.getElementById('east-syriac-settings');

        if (settingsPanel) {
            settingsPanel.classList.add('sidebar-hidden');
            settingsPanel.classList.add('mode-hidden');
        }
        if (ethSettings) {
            ethSettings.classList.add('sidebar-hidden');
            ethSettings.classList.add('mode-hidden');
        }
        if (esySettings) {
            esySettings.classList.remove('sidebar-hidden');
            esySettings.classList.remove('mode-hidden');
        }
        mainContent.classList.remove('sidebar-hidden');

        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Preparing Ramsha...</h3><p>Loading the Church of the East Evening Prayer.</p></div>`;

        await hydrateForEastSyriac();
        isHydrationComplete = true;
        renderOffice();

    } else {
        // ── Daily Office (default) ────────────────────────────────────────────
        document.getElementById('individual-prayers-section').style.display = 'none';
        document.getElementById('daily-office-section').style.display       = 'flex';

        if (ethSettings) {
            ethSettings.classList.add('sidebar-hidden');
            ethSettings.classList.add('mode-hidden');
        }
        if (settingsPanel) {
            settingsPanel.classList.remove('mode-hidden');
            settingsPanel.classList.remove('sidebar-hidden');
        }
        mainContent.classList.remove('sidebar-hidden');

        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Loading...</h3><p>Preparing your daily office...</p></div>`;

        await hydrateForDailyOffice();
        loadSettings();
        updateSidebarForOffice();
        isHydrationComplete = true;
        renderOffice();
    }
}


// ── LEGACY init() — KERNEL-ONLY WRAPPER ──────────────────────────────────────
//
// The architect correctly identified that a legacy init() which delegates to
// hydrateForDailyOffice() would be semantically misleading — a future developer
// or a console call to init() should not silently trigger an Anglican-only load.
//
// The correction: init() now calls loadKernel() only. It prepares the shared
// foundation without committing to any tradition. Actual tradition hydration
// happens when the user selects a mode. A deprecation notice in the console
// signals that direct calls to init() should be migrated to selectMode().
//
// In normal application flow init() is never called — selectMode() orchestrates
// everything. This wrapper exists solely for backward compatibility with any
// external callers (browser console, future code not yet updated).
//
async function init() {
    console.warn('[init] Direct call to init() is deprecated. Use selectMode() instead. Loading kernel only.');
    try {
        await loadKernel();
    } catch (err) {
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>System Error</h3><p>${err.message}</p></div>`;
        console.error('[init] Kernel load failed:', err);
    }
}
function toggleSidebar() {
    const bcpPanel = document.getElementById('settings-panel');
    const ethPanel = document.getElementById('ethiopian-settings');
    const esyPanel = document.getElementById('east-syriac-settings');
    const main     = document.getElementById('main-content');
    const toggle   = document.getElementById('sidebar-toggle');

    // Detect active panel by which one is NOT mode-hidden
    let activePanel;
    if (esyPanel && !esyPanel.classList.contains('mode-hidden')) {
        activePanel = esyPanel;
    } else if (ethPanel && !ethPanel.classList.contains('mode-hidden')) {
        activePanel = ethPanel;
    } else {
        activePanel = bcpPanel;
    }

    const isHidden = activePanel.classList.toggle('sidebar-hidden');
    main.classList.toggle('sidebar-hidden', isHidden);
    if (toggle) toggle.style.opacity = isHidden ? '0.65' : '0.5';
}

// ── Date Controls ────────────────────────────────────────────────────────────
function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    updateDatePicker();
    renderOffice();
}
function resetDate() {
    currentDate = new Date();
    updateDatePicker();
    renderOffice();
}
function updateDatePicker() {
    const year  = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day   = String(currentDate.getDate()).padStart(2, '0');
    const picker = document.getElementById('date-picker');
    if (picker) picker.value = `${year}-${month}-${day}`;
}
function setCustomDate(dateStr) {
    if (dateStr) {
        const [year, month, day] = dateStr.split('-');
        currentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    updateDatePicker();
    renderOffice();
}

function updateSidebarForOffice() {
    const officeId   = document.querySelector('input[name="office-time"]:checked')?.value || 'morning-office';
    const isMorning  = officeId === 'morning-office';
    const isEvening  = officeId === 'evening-office';
    const isNoonday  = officeId === 'noonday-office';
    const isCompline  = officeId === 'compline-office';
    const isMpEp      = isMorning || isEvening;
    const isEthSaatat = officeId === 'ethiopian-saatat';

    function setVisible(id, visible) {
        const el = document.getElementById(id);
        if (!el) return;
        const row = el.closest('label') || el.closest('.nested-group') || el.parentElement;
        if (row) row.style.display = visible ? '' : 'none';
        if (!visible) el.checked = false;
    }

    setVisible('toggle-angelus',               !isCompline);
    setVisible('toggle-trisagion',             isMpEp);
    setVisible('toggle-prayer-before-reading', isMpEp);
    setVisible('toggle-examen',                isCompline);
    setVisible('toggle-kyrie-pantocrator',     isMpEp);
    setVisible('toggle-suffrages',             isMpEp);
    setVisible('toggle-litany',                isMpEp);
    setVisible('toggle-general-thanksgiving',  isMpEp);
    setVisible('toggle-chrysostom',            isMpEp);
}

function toggleBcpOnly() {
    const bcpOnly  = document.getElementById('toggle-bcp-only')?.checked || false;
    const sections = ['ecumenical-devotions-section','during-office-section','closing-devotions-section']
        .map(id => document.getElementById(id)).filter(Boolean);

    if (bcpOnly) {
        sections.forEach(s => s.classList.add('bcp-only-hidden'));
        ['toggle-angelus','toggle-trisagion','toggle-east-syriac-hours','toggle-agpeya-opening',
         'toggle-prayer-before-reading','toggle-examen','toggle-kyrie-pantocrator'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.checked = false;
        });
    } else {
        sections.forEach(s => s.classList.remove('bcp-only-hidden'));
    }
    renderOffice();
}

// ── Appearance ───────────────────────────────────────────────────────────────
function updateUI() {
    const isDark = document.getElementById('toggle-dark')?.checked !== false;
    if (isDark) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
}

// ── Settings Persistence ─────────────────────────────────────────────────────
function saveSettings() {
    const settings = {
        darkMode:            document.getElementById('toggle-dark')?.checked || false,
        bcpOnly:             document.getElementById('toggle-bcp-only')?.checked || false,
        officeTime:          document.querySelector('input[name="office-time"]:checked')?.value || 'morning-office',
        rite:                document.querySelector('input[name="rite"]:checked')?.value || 'rite2',
        minister:            document.querySelector('input[name="minister"]:checked')?.value || 'lay',
        marianElement:       document.querySelector('input[name="marian-element"]:checked')?.value || 'none',
        marianPos:           document.querySelector('input[name="marian-antiphon-pos"]:checked')?.value || 'before',
        gloriaPatri:         document.getElementById('toggle-gloria-patri')?.checked || false,
        angelus:             document.getElementById('toggle-angelus')?.checked || false,
        trisagion:           document.getElementById('toggle-trisagion')?.checked || false,
        eastSyriacHours:     document.getElementById('toggle-east-syriac-hours')?.checked || false,
        agpeyaOpening:       document.getElementById('toggle-agpeya-opening')?.checked || false,
        creedType:           document.getElementById('creed-type')?.value || 'comm-creed-apostles',
        gospelPlacement:     document.querySelector('input[name="gospel-placement"]:checked')?.value || 'evening',
        litany:              document.getElementById('toggle-litany')?.checked || false,
        suffrages:           document.getElementById('toggle-suffrages')?.checked || false,
        psalter30Day:        document.getElementById('toggle-30day-psalter')?.checked || false,
        generalThanksgiving: document.getElementById('toggle-general-thanksgiving')?.checked || false,
        chrysostom:          document.getElementById('toggle-chrysostom')?.checked || false,
        prayerBeforeReading: document.getElementById('toggle-prayer-before-reading')?.checked || false,
        examen:              document.getElementById('toggle-examen')?.checked || false,
        kyriePantocrator:    document.getElementById('toggle-kyrie-pantocrator')?.checked || false,
        studyMode:           appSettings.studyMode
    };
    try {
        localStorage.setItem('universalOfficeSettings', JSON.stringify(settings));
        console.log('Settings saved');
    } catch (e) {
        console.warn('Could not save settings to localStorage:', e);
    }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem('universalOfficeSettings');
        if (!saved) return;
        const s = JSON.parse(saved);

        if (document.getElementById('toggle-dark')) {
            document.getElementById('toggle-dark').checked = s.darkMode;
            updateUI();
        }
        if (s.bcpOnly && document.getElementById('toggle-bcp-only')) {
            document.getElementById('toggle-bcp-only').checked = true;
            toggleBcpOnly();
        }

        const pick = (name, val) => {
            const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
            if (el) el.checked = true;
        };
        pick('office-time',         s.officeTime);
        pick('rite',                s.rite);
        pick('minister',            s.minister);
        pick('marian-element',      s.marianElement);
        pick('marian-antiphon-pos', s.marianPos);
        pick('gospel-placement',    s.gospelPlacement);

        const setChk = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
        setChk('toggle-gloria-patri',          s.gloriaPatri);
        setChk('toggle-angelus',               s.angelus);
        setChk('toggle-trisagion',             s.trisagion);
        setChk('toggle-east-syriac-hours',     s.eastSyriacHours);
        setChk('toggle-agpeya-opening',        s.agpeyaOpening);
        setChk('toggle-litany',                s.litany);
        setChk('toggle-suffrages',             s.suffrages);
        setChk('toggle-30day-psalter',         s.psalter30Day);
        setChk('toggle-general-thanksgiving',  s.generalThanksgiving);
        setChk('toggle-chrysostom',            s.chrysostom);
        setChk('toggle-prayer-before-reading', s.prayerBeforeReading);
        setChk('toggle-examen',                s.examen);
        setChk('toggle-kyrie-pantocrator',     s.kyriePantocrator);

        if (typeof s.studyMode === 'boolean') {
            appSettings.studyMode = s.studyMode;
        }

        if (document.getElementById('creed-type'))
            document.getElementById('creed-type').value = s.creedType;

        console.log('Settings loaded');
    } catch (e) {
        console.warn('Could not load settings from localStorage:', e);
    }
}

// ── Text Formatters ──────────────────────────────────────────────────────────
function formatScriptureAsFlow(rawText) {
    if (!rawText) return '';
    let cleaned = rawText.replace(/^\d+:\d+\s/gm, '').trim();
    let paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim());
    return paragraphs.map(para => {
        let flowing = para.split('\n').map(l => l.trim()).filter(l => l).join(' ');
        return `<p>${flowing}</p>`;
    }).join('');
}

function formatPsalmAsPoetry(rawText) {
    if (!rawText) return '';
    let cleaned = rawText.replace(/^\d+:\d+\s/gm, '').trim();
    let lines = cleaned.split('\n').filter(l => l.trim());
    let html = '';
    for (let line of lines) {
        const halves = line.split(/\s*[*]\s*/);
        if (halves.length > 1) {
            html += `<span class="psalm-stanza">`;
            html += `<span class="psalm-half-verse">${halves[0].trim()}</span>`;
            html += `<span class="psalm-half-verse">${halves[1].trim()}</span>`;
            html += `</span>`;
        } else {
            html += `<span class="psalm-stanza"><span class="psalm-half-verse">${line.trim()}</span></span>`;
        }
    }
    return html;
}

// ── Helper: resolve rite-aware text from a component ─────────────────────────
function resolveText(comp, rite) {
    if (!comp) return null;
    const t = comp.text;
    if (typeof t === 'object' && t !== null) {
        return t[rite] || t['rite2'] || t['rite1'] || null;
    }
    return t || null;
}

// ── Helper: apply paragraph-break formatting for block text ──────────────────
function applyParagraphBreaks(text) {
    if (!text) return '';
    return text.replace(/\n\n/g, '<br><br>');
}

// ── Ethiopian Hour Resolver ───────────────────────────────────────────────────
function getEthiopianHourInfo() {
    const now          = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();

    const hourMap = [
        { from:  6 * 60, to:  9 * 60, hourId: 'eth-nigatu-hour-text',  hourName: 'Nigatu — ንጋቱ (Matins)',              uiLabel: 'Matins',             psalms: ['3', '63', '133'],    etReading: '1CLEM_ET 1:1-20' },
        { from:  9 * 60, to: 12 * 60, hourId: 'eth-meserk-hour-text',  hourName: "Mese'rk — መሠርቅ (Third Hour)",        uiLabel: 'Third Hour',         psalms: ['16', '17', '18'],    etReading: null },
        { from: 12 * 60, to: 15 * 60, hourId: 'eth-lika-hour-text',    hourName: 'Lika — ሊካ (Sixth Hour)',              uiLabel: 'Sixth Hour',         psalms: ['22', '23', '24'],    etReading: null },
        { from: 15 * 60, to: 17 * 60, hourId: 'eth-terk-hour-text',    hourName: "Tese'at — ተሰዓት (Ninth Hour)",         uiLabel: 'Ninth Hour',         psalms: ['69', '70', '71'],    etReading: null },
        { from: 17 * 60, to: 18 * 60, hourId: 'eth-serkh-hour-text',   hourName: 'Serkh — ሠርክ (Eleventh Hour)',         uiLabel: 'Vespers',            psalms: ['141', '142', '143'], etReading: null },
        { from: 18 * 60, to: 21 * 60, hourId: 'eth-nome-hour-text',    hourName: 'Nime — ኖሜ (Compline)',                uiLabel: 'Compline',           psalms: ['4', '6', '13'],      etReading: null },
        { from: 21 * 60, to: 24 * 60, hourId: 'eth-hour-7',            hourName: "Le'lit — First Night Watch",          uiLabel: 'First Night Watch',  psalms: ['4', '6', '13'],      etReading: 'HERM_ET 1:1-10' },
        { from:  0 * 60, to:  3 * 60, hourId: 'eth-lelit-hour-text',   hourName: "Le'lit — ሌሊት (Midnight)",             uiLabel: 'Midnight Office',    psalms: ['4', '6', '13'],      etReading: 'HERM_ET 1:1-10' },
        { from:  3 * 60, to:  6 * 60, hourId: 'eth-mahlet-hour-text',  hourName: 'Mahlet — ማህሌት (Pre-dawn Vigil)',      uiLabel: 'Pre-dawn Vigil',     psalms: ['3', '63', '133'],    etReading: null },
    ];

    for (const entry of hourMap) {
        if (totalMinutes >= entry.from && totalMinutes < entry.to) return entry;
    }
    return { hourId: 'eth-nigatu-hour-text', hourName: 'Nigatu — ንጋቱ (Matins)', uiLabel: 'Matins', psalms: ['3', '63', '133'], etReading: '1CLEM_ET 1:1-20' };
}

// ── Office Renderer ──────────────────────────────────────────────────────────
function renderOffice() {
    if (!isHydrationComplete) return;

    if (selectedMode === 'ethiopian-saatat') {
        renderEthiopianSaatat();
    } else if (selectedMode === 'east-syriac') {
        renderEastSyriac();
    } else {
        renderBcpOffice();
    }
}

async function renderBcpOffice() {
    if (!isHydrationComplete) {
        return;
    }
    if (!appData || !appData.rubrics || !Array.isArray(appData.rubrics)) {
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Loading...</h3><p>Data still loading.</p></div>`;
        return;
    }
    document.getElementById('office-display').innerHTML =
        `<div class="office-container"><h3>Loading Office...</h3><p>Fetching readings...</p></div>`;

    const todayKey      = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const todayKeyShort = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    // ── Office & Rite state ──────────────────────────────────────────────────
    const officeId          = document.querySelector('input[name="office-time"]:checked')?.value || 'morning-office';
    const resolvedOfficeId  = window._forcedOfficeId || officeId;
    const isMorning         = resolvedOfficeId === 'morning-office';
    const isEvening         = resolvedOfficeId === 'evening-office';
    const isNoonday         = resolvedOfficeId === 'noonday-office';
    const isCompline        = resolvedOfficeId === 'compline-office';

    const rite               = document.querySelector('input[name="rite"]:checked')?.value || 'rite2';
    const minister           = document.querySelector('input[name="minister"]:checked')?.value || 'lay';
    const creedSelection     = document.getElementById('creed-type')?.value || 'comm-creed-apostles';
    const gospelPlacement    = document.querySelector('input[name="gospel-placement"]:checked')?.value || 'evening';
    const marianElement      = document.querySelector('input[name="marian-element"]:checked')?.value || 'none';
    const marianPos          = document.querySelector('input[name="marian-antiphon-pos"]:checked')?.value || 'before';
    const suffragesChecked   = document.getElementById('toggle-suffrages')?.checked || false;
    const greatLitanyChecked = document.getElementById('toggle-litany')?.checked || false;
    const use30Day           = document.getElementById('toggle-30day-psalter')?.checked || false;

    // ── Calendar ─────────────────────────────────────────────────────────────
    const { season, liturgicalColor, litYear } = await CalendarEngine.getSeasonAndFile(currentDate);
    updateSeasonalTheme(liturgicalColor || 'green');

    const dailyData         = await CalendarEngine.fetchLectionaryData(currentDate);
    const activeRubric = appData.rubrics.find(r => r.id === resolvedOfficeId);

    // If the calendar engine returned a fallback sentinel (no entry found for this date),
    // render a visible notice rather than silently producing a broken or blank office.
    if (dailyData?._isFallback) {
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3 style="color:var(--rubric)">Lectionary Gap</h3>` +
            `<p class="component-text">${dailyData.title}</p>` +
            `<p class="component-text" style="font-size:0.85em; opacity:0.7;">` +
            `No lectionary entry exists in the data files for this date. ` +
            `The season file may need to be extended.</p></div>`;
        return;
    }


    const calendarInfo = document.getElementById('calendar-info');
    if (calendarInfo && dailyData) {
        const litYearLabel = litYear === 'year1' ? 'Year I' : 'Year II';
        calendarInfo.textContent = `${dailyData.title || ''} · ${litYearLabel}`;
    }
    const displayDate = document.getElementById('display-date');
    if (displayDate) displayDate.textContent = todayKey;

    // ── Psalm selection ───────────────────────────────────────────────────────
    let psalms = '';
    if (use30Day) {
        const dayOfMonth = currentDate.getDate();
        const psalmEntry = psalterCycle.find(p => p.day === dayOfMonth);
        if (psalmEntry) psalms = isMorning ? psalmEntry.morning : psalmEntry.evening;
    } else {
        psalms = dailyData?.psalms_mp || dailyData?.psalms_morning || dailyData?.psalms || '';
        if (isEvening || isCompline || isNoonday) {
            psalms = dailyData?.psalms_ep || dailyData?.psalms_evening || dailyData?.psalms || '';
        }
    }

    // ── Marian components ─────────────────────────────────────────────────────
    let marianComp = null, theotokionComp = null;
    if (marianElement !== 'none') {
        const marianId = `bcp-marian-antiphon-${season}`;
        marianComp     = appData.components.find(c => c.id === marianId)
                      || appData.components.find(c => c.id === 'bcp-marian-antiphon-ordinary');
        theotokionComp = appData.components.find(c => c.id === `cop-theotokion-${season}`)
                      || appData.components.find(c => c.id === 'cop-theotokion');
    }

    // ── Reading chains ────────────────────────────────────────────────────────
    const otherYear = litYear === 'year1' ? 'year2' : 'year1';
    let morningOT      = dailyData[`reading_ot_mp_${litYear}`]      || dailyData[`reading_ot_mp_${otherYear}`]      || dailyData['reading_ot']      || '';
    let morningEpistle = dailyData[`reading_epistle_mp_${litYear}`]  || dailyData[`reading_epistle_mp_${otherYear}`]  || dailyData['reading_epistle']  || '';
    let morningGospel  = (gospelPlacement === 'morning' || gospelPlacement === 'both')
                         ? (dailyData[`reading_gospel_mp_${litYear}`] || dailyData[`reading_gospel_mp_${otherYear}`] || dailyData['reading_gospel'] || '') : '';

    let eveningOT      = dailyData[`reading_ot_ep_${litYear}`]      || dailyData[`reading_ot_ep_${otherYear}`]      || dailyData['reading_ot']      || '';
    let eveningEpistle = dailyData[`reading_epistle_ep_${litYear}`]  || dailyData[`reading_epistle_ep_${otherYear}`]  || dailyData['reading_epistle']  || '';
    let eveningGospel  = (gospelPlacement === 'evening' || gospelPlacement === 'both')
                         ? (dailyData[`reading_gospel_ep_${litYear}`] || dailyData[`reading_gospel_ep_${otherYear}`] || dailyData['reading_gospel'] || '') : '';

    if (!isMorning) { morningOT = ''; morningEpistle = ''; morningGospel = ''; }
    if (!isEvening && !isCompline && !isNoonday) { eveningOT = ''; eveningEpistle = ''; eveningGospel = ''; }

    // ── Begin HTML assembly ───────────────────────────────────────────────────
    const officeTitle    = activeRubric?.officeName || 'Office';
    const officeSubtitle = dailyData.title || 'Day Title';

    let officeHtml = `<div class="office-container"><h2>${officeTitle}</h2>`;
    officeHtml += `<p class="liturgical-title">${officeSubtitle}</p>`;

    // Pre-sequence ecumenical devotions (BCP offices only)
    if (document.getElementById('toggle-agpeya-opening')?.checked) {
        const agpeyaComp = appData.components.find(c => c.id === 'cop-agpeya-opening');
        if (agpeyaComp) officeHtml += `<span class="rubric-text">Agpeya Opening</span><span class="component-text">${agpeyaComp.text}</span>`;
    }
    if (document.getElementById('toggle-east-syriac-hours')?.checked) {
        const esComp = appData.components.find(c => c.id === 'ecu-east-syriac-hours');
        if (esComp) officeHtml += `<span class="rubric-text">Prayer of the Hours</span><span class="component-text">${esComp.text}</span>`;
    }

    // Pre-sequence Marian (before position — BCP offices only)
    if (marianElement !== 'none' && marianPos === 'before') {
        if ((marianElement === 'antiphon' || marianElement === 'both') && marianComp) {
            const t = resolveText(marianComp, rite) || 'Text not found';
            officeHtml += `<span class="rubric-text">Marian Antiphon</span><span class="component-text"><i>${t}</i></span>`;
        }
        if ((marianElement === 'theotokion' || marianElement === 'both') && theotokionComp) {
            const raw = resolveText(theotokionComp, rite) || theotokionComp.text || '';
            officeHtml += `<span class="rubric-text">Theotokion</span><div class="component-text" style="white-space:normal"><i>${applyParagraphBreaks(raw)}</i></div>`;
        }
    }
// ── Bible book pre-fetch (parallel) ──────────────────────────────────────
    {
        const toPrefetch = new Set();

        const addCitation = (citation) => {
            if (!citation || !citation.trim()) return;
            const parts = citation.split(/,(?=\s*[a-zA-Z])/);
            for (let part of parts) {
                part = part.trim();
                if (!part) continue;
                const match = part.match(/^(.+?)\s*\d/);
                if (!match) continue;
                let bookName = match[1].trim().toLowerCase().replace(/\s/g, '');
                if (BOOK_ALIASES[bookName]) bookName = BOOK_ALIASES[bookName];
                const isPsalm = bookName.startsWith('psalm');
                const filename = isPsalm ? 'psalms.json' : bookName + '.json';
                if (!bibleCache.books[filename]) toPrefetch.add(filename);
            }
        };

        if (psalms) psalms.split(',').forEach(p => addCitation('PSALM ' + p.trim()));

        [morningOT, morningEpistle, morningGospel,
         eveningOT, eveningEpistle, eveningGospel].forEach(addCitation);

        addCitation('PSALM 95');

        if (toPrefetch.size > 0) {
            await Promise.allSettled([...toPrefetch].map(async (filename) => {
                const folder = NT_BOOKS.includes(filename.replace('.json', '')) ? 'NT' : 'OT';
                try {
                    const res = await fetch(`data/bible/${folder}/${filename}`);
                    if (res.ok) {
                        bibleCache.books[filename] = await res.json();
                        bibleCache.accessOrder.push(filename);
                        if (bibleCache.accessOrder.length > bibleCache.MAX_CACHED_BOOKS) {
                            delete bibleCache.books[bibleCache.accessOrder.shift()];
                        }
                    }
                } catch (e) { /* silent — extractFromBook handles missing books */ }
            }));
        }
    }
    // ── End pre-fetch ─────────────────────────────────────────────────────────
    // ── Saints preload (must precede sequence loop for eth-saints-commemoration) ─
    const mIdx  = currentDate.getMonth();
    const month = monthNames[mIdx];
    if (!appData.saints || appData.saintsMonth !== month) {
        try {
            const res = await fetch(`data/saints/saints-${month.toLowerCase()}.json`);
            if (res.ok) { appData.saints = await res.json(); appData.saintsMonth = month; }
        } catch (err) { console.error('Saints load failed:', err); }
    }

    // ── Main Rubric Sequence Loop ─────────────────────────────────────────────
    for (let item of (activeRubric?.sequence || [])) {
        item = item.trim();

        let compId = item.replace('[rite]', rite);

        if (compId === 'bcp-absolution-slot') {
            const ritePrefix = rite === 'rite1' ? 'r1' : 'r2';
            compId = `bcp-absolution-${ritePrefix}-${minister}`;
        } else if (compId === 'comm-creed-slot') {
            compId = creedSelection;
        } else if (compId === 'bcp-suffrages-slot') {
            if (suffragesChecked) { compId = `bcp-suffrages-${rite}`; } else { continue; }
        }

        // VARIABLE_OPENING — seasonal opening sentence
        if (item === 'VARIABLE_OPENING') {
            const comp = appData.components.find(c => c.id === `bcp-opening-${season}`)
                      || appData.components.find(c => c.id === 'bcp-opening-general');
            const t = comp ? (resolveText(comp, rite) || 'Text not found') : 'Text not found';
            officeHtml += `<span class="rubric-text">Opening Sentence</span><span class="component-text">${t}</span>`;
            continue;
        }

        // VARIABLE_ANTIPHON — appointed antiphon from lectionary data
        if (item === 'VARIABLE_ANTIPHON') {
            const antText = isMorning
                ? (dailyData?.antiphon_mp || dailyData?.antiphon || '')
                : (dailyData?.antiphon_ep || dailyData?.antiphon || '');
            if (antText) officeHtml += `<span class="rubric-text">Antiphon</span><span class="component-text"><i>${antText}</i></span>`;
            continue;
        }

        // VARIABLE_PSALM — appointed psalms with optional Gloria Patri
        if (item === 'VARIABLE_PSALM') {
            if (psalms) {
                const psalmRefs = psalms.split(',').map(p => p.trim());
                officeHtml += `<span class="rubric-text">${psalmRefs.length > 1 ? 'The Psalms' : 'The Psalm'}</span>`;
                for (const psalm of psalmRefs) {
                    const psalmId  = 'PSALM ' + psalm.replace(/^psalm\s+/i, '').trim().toUpperCase();
                    const fullText = await getScriptureText(psalmId);
                    officeHtml += `<h4 class="passage-reference">Psalm ${psalmId.replace(/^PSALM\s+/i, '')}</h4>`;
                    officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
                    if (document.getElementById('toggle-gloria-patri')?.checked) {
                        const gloria = appData.components.find(c => c.id === 'comm-gloria-patri');
                        const gt = gloria ? (resolveText(gloria, rite) || '') : '';
                        officeHtml += `<span class="component-text"><i>${gt}</i></span>`;
                    }
                }
            }
            continue;
        }

        // VARIABLE_READING_OT / _EPISTLE / _GOSPEL — scripture lessons
        if (item === 'VARIABLE_READING_OT' || item === 'VARIABLE_READING_EPISTLE' || item === 'VARIABLE_READING_GOSPEL') {
            if (item === 'VARIABLE_READING_OT' && document.getElementById('toggle-prayer-before-reading')?.checked) {
                const pbr = appData.components.find(c => c.id === 'ecu-prayer-before-reading');
                if (pbr) officeHtml += `<span class="rubric-text">Prayer Before Reading</span><span class="component-text">${pbr.text}</span>`;
            }
            let reading = '', title = '';
            if (item === 'VARIABLE_READING_OT')      { reading = isMorning ? morningOT      : eveningOT;      title = 'The Old Testament Lesson'; }
            if (item === 'VARIABLE_READING_EPISTLE')  { reading = isMorning ? morningEpistle : eveningEpistle; title = 'The Epistle'; }
            if (item === 'VARIABLE_READING_GOSPEL')   { reading = isMorning ? morningGospel  : eveningGospel;  title = 'The Holy Gospel'; }
            if (reading) {
                officeHtml += `<span class="rubric-text">${title}</span><h4 class="passage-reference">${reading}</h4>`;
                const text = await getScriptureText(reading);
                officeHtml += `<div class="reading-text">${formatScriptureAsFlow(text)}</div>`;
                officeHtml += '<div class="ornamental-divider"><div class="div-line-left"></div><span class="ornamental-divider-glyph">✦ ✝ ✦</span><div class="div-line-right"></div></div>';
            }
            continue;
        }

        // VARIABLE_CANTICLE1 — Te Deum (Morning) / Magnificat (Evening)
        if (item === 'VARIABLE_CANTICLE1') {
            let canticleId = null;
            let canticleLabel = '';
            if (isMorning) {
                canticleId    = 'bcp-te-deum';
                canticleLabel = 'Te Deum Laudamus';
            } else if (isEvening) {
                canticleId    = 'bcp-magnificat';
                canticleLabel = 'The Magnificat';
            }
            if (canticleId) {
                const comp = appData.components.find(c => c.id === canticleId);
                if (comp) {
                    const t = resolveText(comp, rite) || 'Text not found';
                    officeHtml += `<span class="rubric-text">${canticleLabel}</span><span class="component-text">${t}</span>`;
                } else {
                    console.warn(`[renderOffice] VARIABLE_CANTICLE1: component not found — ${canticleId}`);
                }
            }
            continue;
        }

        // VARIABLE_CANTICLE2 — Benedictus (Morning) / Nunc Dimittis (Evening)
        if (item === 'VARIABLE_CANTICLE2') {
            let canticleId = null;
            let canticleLabel = '';
            if (isMorning) {
                canticleId    = 'bcp-benedictus';
                canticleLabel = 'The Benedictus';
            } else if (isEvening) {
                canticleId    = 'bcp-nunc-dimittis';
                canticleLabel = 'Nunc Dimittis';
            }
            if (canticleId) {
                const comp = appData.components.find(c => c.id === canticleId);
                if (comp) {
                    const t = resolveText(comp, rite) || 'Text not found';
                    officeHtml += `<span class="rubric-text">${canticleLabel}</span><span class="component-text">${t}</span>`;
                } else {
                    console.warn(`[renderOffice] VARIABLE_CANTICLE2: component not found — ${canticleId}`);
                }
            }
            continue;
        }

        // VARIABLE_COLLECT — principal daily collect with manual ID mappings
        if (item === 'VARIABLE_COLLECT') {
            officeHtml += `<span class="rubric-text">The Collect</span>`;
            let rawId = dailyData.collect || 'collect-default-ferial';
            let cId   = rawId.startsWith('bcp-') ? rawId : 'bcp-' + rawId;
            if (cId === 'bcp-collect-transfiguration') cId = 'bcp-collect-the-transfiguration-of-our-lord';

            const comp = appData.components.find(c => c.id === cId);
            const t    = comp ? (resolveText(comp, rite) || 'No collect appointed') : 'No collect appointed';
            officeHtml += `<span class="component-text">${t}</span>`;
            officeHtml += '<div class="ornamental-divider"><div class="div-line-left"></div><span class="ornamental-divider-glyph">✦ ✝ ✦</span><div class="div-line-right"></div></div>';

            if (isCompline && document.getElementById('toggle-examen')?.checked) {
                const ex = appData.components.find(c => c.id === 'ecu-examen');
                if (ex) {
                    officeHtml += `<span class="rubric-text">The Examen</span><div class="component-text" style="white-space:normal">${applyParagraphBreaks(ex.text)}</div>`;
                }
            }
            if (!isCompline && !isNoonday && document.getElementById('toggle-kyrie-pantocrator')?.checked) {
                const kp = appData.components.find(c => c.id === 'ecu-kyrie-pantocrator');
                if (kp) officeHtml += `<span class="rubric-text">Kyrie Pantocrator</span><span class="component-text">${kp.text}</span>`;
            }
            continue;
        }

        // VARIABLE_WEEKDAY_COLLECT — ferial/weekday supplementary collect
        if (item === 'VARIABLE_WEEKDAY_COLLECT') {
            let wkComp = null;
            if (dailyData.collect_weekday) {
                const wkId = dailyData.collect_weekday.startsWith('bcp-')
                    ? dailyData.collect_weekday
                    : 'bcp-' + dailyData.collect_weekday;
                wkComp = appData.components.find(c => c.id === wkId);
            }
            if (!wkComp) {
                const fallbackId = isMorning ? 'bcp-collect-grace' : 'bcp-collect-peace';
                wkComp = appData.components.find(c => c.id === fallbackId);
            }
            if (wkComp) {
                const t = resolveText(wkComp, rite) || wkComp.text || '';
                officeHtml += `<span class="rubric-text">A Collect</span><span class="component-text">${t}</span>`;
            } else {
                console.warn('[renderOffice] VARIABLE_WEEKDAY_COLLECT: no collect resolved — skipping');
            }
            continue;
        }

        // VARIABLE_MISSION_PRAYER — fixed mission prayer
        if (item === 'VARIABLE_MISSION_PRAYER') {
            const comp = appData.components.find(c => c.id === 'bcp-mission-prayer-1');
            if (comp) {
                const t = resolveText(comp, rite) || comp.text || '';
                officeHtml += `<span class="rubric-text">A Prayer for Mission</span><span class="component-text">${t}</span>`;
            } else {
                console.warn('[renderOffice] VARIABLE_MISSION_PRAYER: bcp-mission-prayer-1 not found');
            }
            continue;
        }

        // bcp-invitatory-full — invitatory with Angelus injection and seasonal canticle
        if (item === 'bcp-invitatory-full') {
            if (document.getElementById('toggle-angelus')?.checked && !isCompline) {
                const angelusComp = appData.components.find(c => c.id === 'ecu-angelus');
                if (angelusComp) {
                    const t = resolveText(angelusComp, rite) || angelusComp.text || '';
                    officeHtml += `<span class="rubric-text">The Angelus</span><span class="component-text">${t}</span>`;
                }
            }
            const invitId = isMorning ? 'bcp-invitatory-full-mp' : 'bcp-invitatory-full-ep-noon-compline';
            const invComp = appData.components.find(c => c.id === invitId);
            const invText = invComp ? (resolveText(invComp, rite) || 'Text not found') : 'Text not found';
            officeHtml += `<span class="rubric-text">The Invitatory</span><span class="component-text">${invText}</span>`;

            if (isMorning || isEvening) {
                const isLent   = season === 'lent';
                const isEaster = season === 'easter';
                const isFriday = currentDate.getDay() === 5;
                if (isEaster) {
                    const pasch = appData.components.find(c => c.id === 'bcp-pascha-nostrum');
                    if (pasch) {
                        const pt = resolveText(pasch, rite) || pasch.text || '';
                        officeHtml += `<span class="rubric-text">Christ Our Passover</span><span class="component-text">${pt}</span>`;
                    }
                } else if (isLent && isFriday) {
                    const ps95 = await getScriptureText('Psalm 95');
                    officeHtml += `<span class="rubric-text">Psalm 95</span><div class="psalm-block">${formatPsalmAsPoetry(ps95)}</div>`;
                } else if (isLent) {
                    const jub = appData.components.find(c => c.id === 'bcp-jubilate');
                    if (jub) {
                        const jt = resolveText(jub, rite) || jub.text || '';
                        officeHtml += `<span class="rubric-text">Jubilate</span><span class="component-text">${jt}</span>`;
                    }
                } else {
                    const ven = appData.components.find(c => c.id === 'bcp-venite');
                    if (ven) {
                        const vt = resolveText(ven, rite) || ven.text || '';
                        officeHtml += `<span class="rubric-text">Venite</span><span class="component-text">${vt}</span>`;
                    }
                }
            }
            continue;
        }

 // eth-introduction-to-every-hour — mandatory Tselote Meweta opening
        if (item === 'eth-introduction-to-every-hour') {
            const introComp = appData.components.find(c => c.id === 'eth-introduction-to-every-hour');
            if (introComp) {
                // Prostration rubric
                if (introComp.rubric_before) {
                    officeHtml += `<span class="rubric-text"><i>${introComp.rubric_before}</i></span>`;
                }
                // The Lord's Prayer, Thanksgiving, and Psalm 50 are all embedded
                // in the single component text, so we render it in three labelled
                // sections by splitting on the double-newline paragraph boundaries.
                // The component text is structured: [Lord's Prayer] \n\n [Thanksgiving (2 paras)] \n\n [Psalm 50 verses...]
                // We use the full text with a single rubric label for clean liturgical flow.
                officeHtml += `<span class="rubric-text">Introduction to Every Hour — Tselote Meweta</span>`;
                officeHtml += `<div class="component-text" style="white-space:normal">${applyParagraphBreaks(introComp.text)}</div>`;
            } else {
                console.warn('[renderOffice] eth-introduction-to-every-hour: component not found in appData — check ethiopian.json');
            }
            continue;
        }

        // eth-saatat-hour-slot — resolves to the canonical hour text keyed by local clock
        if (item === 'eth-saatat-hour-slot') {
    if (ethHourInfo) {
        const hourComp = appData.components.find(c => c.id === ethHourInfo.hourId);
        if (hourComp) {
            // Uniform naming check
            const displayName = ethHourInfo.hourName;
            officeHtml += `<span class="rubric-text">${displayName}</span>`;
            if (ethHourInfo.hourId === 'eth-lika-hour-text') {
                officeHtml += `<div class="component-text" style="white-space:normal"><i>This is the Sixth Hour, the hour of the Crucifixion of Our Lord Jesus Christ, who was nailed to the Holy Cross for the salvation of the world.</i></div>`;
            }
            officeHtml += `<div class="component-text" style="white-space:normal">${applyParagraphBreaks(hourComp.text)}</div>`;
        }
    }
    continue;
}

        // eth-mazmur-slot — renders appointed Psalms for the active hour, closes with Anqaşa Birhān
        if (item === 'eth-mazmur-slot') {
            const ethLength = document.getElementById('eth-length-select')?.value || 'abbreviated';
            if (ethLength === 'full') {
                const lekeHaileComp = appData.components.find(c => c.id === 'eth-leke-haile-chant');
                if (lekeHaileComp) {
                    officeHtml += `<span class="rubric-text">Leke Haile — The 12-Fold Glory</span>`;
                    officeHtml += `<div class="component-text" style="white-space:normal">`;
                    for (let i = 1; i <= 12; i++) {
                        officeHtml += `<p style="margin:0.4em 0;"><span style="color:var(--gold); font-family:'Cinzel',serif; font-size:0.78em; margin-right:6px;">${i}.</span><i>${lekeHaileComp.text}</i></p>`;
                    }
                    officeHtml += `</div>`;
                }
            }
            if (ethHourInfo && ethHourInfo.psalms && ethHourInfo.psalms.length > 0) {
                officeHtml += `<span class="rubric-text">Mazmur (Appointed Psalms)</span>`;
                for (const psNum of ethHourInfo.psalms) {
                    const fullText = await getScriptureText('PSALM ' + psNum);
                    officeHtml += `<h4 class="passage-reference">Psalm ${psNum}</h4>`;
                    officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
                }
                const anqasa = appData.components.find(c => c.id === 'eth-anqasa-birhan');
                if (anqasa) {
                    officeHtml += `<span class="rubric-text">Anqaşa Birhān — Gate of Light</span>`;
                    officeHtml += `<div class="component-text" style="white-space:normal"><i>${applyParagraphBreaks(anqasa.text)}</i></div>`;
                }
            }
            continue;
        }

        // VARIABLE_READING_ET — skipped in BCP renderer
        if (item === 'VARIABLE_READING_ET') {
            continue;
        }

        // eth-saints-commemoration — Senkessar lookup keyed to Ethiopian calendar date
        if (item === 'eth-saints-commemoration') {
            // 1. Resolve the Ethiopian calendar date
            const ethDate = EthiopianCalendar.getEthiopianDate(currentDate);
            const ethDateLabel = `${ethDate.month} ${ethDate.day}`;

            // Month name → folder slug map (handles the one irregular spelling: Miyazya → miazia)
            const MONTH_SLUG_MAP = {
                'meskerem': 'meskerem', 'teqemt': 'tiqimt', 'hidar': 'hidar',
                'tahsas': 'tahsas', 'tir': 'tir', 'yekatit': 'yekatit',
                'megabit': 'megabit', 'miyazya': 'miazia', 'ginbot': 'ginbot',
                'sene': 'sene', 'hamle': 'hamle', 'nehase': 'nehase', 'pagume': 'pagume'
            };
            const monthSlug = MONTH_SLUG_MAP[ethDate.month.toLowerCase()] || ethDate.month.toLowerCase();

            // 2. Lazy-load and cache the Senkessar index
            if (!appData.senkessarIndex) {
                try {
                    const idxRes = await fetch('data/synaxarium/ethiopian/senkessar-index.json');
                    if (idxRes.ok) appData.senkessarIndex = await idxRes.json();
                } catch (err) {
                    console.warn('[eth-saints-commemoration] Senkessar index load failed:', err);
                }
            }

            // 3. Find today's entry in the index (months is an array, not a keyed object)
            let indexEntry = null;
            if (appData.senkessarIndex?.months) {
                const MONTH_NAME_ALIASES = { 'teqemt': 'tiqimt' };
                const normalizedMonth = MONTH_NAME_ALIASES[ethDate.month.toLowerCase()] || ethDate.month.toLowerCase();
                const monthData = appData.senkessarIndex.months.find(
                    m => m.month.toLowerCase() === normalizedMonth
                );
                if (monthData?.days) {
                    indexEntry = monthData.days.find(d => d.day === ethDate.day) || null;
                }
            }

            // 4. Render header
            officeHtml += `<span class="rubric-text">The Senkessar: ${ethDateLabel}</span>`;

            if (indexEntry) {
                // 5. Fetch the monthly narrative file (cached in appData.senkessarCache by monthSlug)
                if (!appData.senkessarCache[monthSlug]) {
                    try {
                        const monthRes = await fetch(`data/synaxarium/ethiopian/${monthSlug}.json`);
                        if (monthRes.ok) appData.senkessarCache[monthSlug] = await monthRes.json();
                    } catch (err) {
                        console.warn(`[eth-saints-commemoration] Month file load failed: ${monthSlug}.json`, err);
                    }
                }
                const dayData = appData.senkessarCache[monthSlug]
                    ? appData.senkessarCache[monthSlug][ethDate.day]
                    : null;

                if (dayData) {
                    // Render title and narrative from the monthly file
                    officeHtml += `<div class="component-text"><strong style="color:#d4af37">${dayData.title || indexEntry.title}</strong></div>`;
                    if (dayData.narrative) {
                        const normalizedNarrative = dayData.narrative.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');
                        officeHtml += `<div class="component-text" style="white-space:normal">${applyParagraphBreaks(normalizedNarrative)}</div>`;
                    }
                } else {
                    // Day entry missing — fall back to the index title alone
                    officeHtml += `<div class="component-text"><strong style="color:#d4af37">${indexEntry.title}</strong></div>`;
                    console.warn(`[eth-saints-commemoration] No entry for day ${ethDate.day} in ${monthSlug}.json`);
                }
            } else {
                // 6. No index entry — secondary check: Oriental/Ethiopian saints in Gregorian saints data
                const orientalSaints = (appData.saints || []).filter(s => {
                    if (!s.day || !s.day.toLowerCase().includes(todayKeyShort.toLowerCase())) return false;
                    const t = (s.tradition || '').toLowerCase();
                    return t.includes('ethiopian') || t.includes('oriental');
                });

                if (orientalSaints.length > 0) {
                    orientalSaints.forEach(s => {
                        officeHtml += `<div class="component-text"><strong style="color:#d4af37">${s.name || 'Unknown'}</strong>`;
                        if (s.description || s.narrative) {
                            officeHtml += `<br>${applyParagraphBreaks(s.description || s.narrative)}`;
                        }
                        officeHtml += `</div>`;
                    });
                } else {
                    // 7. Final fallback intercession
                    officeHtml += `<div class="component-text">Let us pray for the holy Oriental Orthodox Churches: the Ethiopian Tewahedo, the Coptic, the Syriac, the Armenian, the Malankara, and the Eritrean; that the Lord may preserve them in the true faith, strengthen them under persecution, and unite all Christians in the one holy catholic and apostolic Church.</div>`;
                }
            }
            continue;
        }

        // comm-lords-prayer — rite-aware
        if (item === 'comm-lords-prayer') {
            const comp = appData.components.find(c => c.id === 'comm-lords-prayer');
            const t = comp ? (resolveText(comp, rite) || "Lord's Prayer not found") : "Lord's Prayer not found";
            officeHtml += `<span class="rubric-text">The Lord's Prayer</span><span class="component-text">${t}</span>`;
            continue;
        }

        // comm-kyrie — rite-aware
        if (item === 'comm-kyrie') {
            const comp = appData.components.find(c => c.id === 'comm-kyrie');
            const t = comp ? (resolveText(comp, rite) || 'Kyrie not found') : 'Kyrie not found';
            officeHtml += `<span class="rubric-text">Kyrie</span><span class="component-text">${t}</span>`;
            continue;
        }

        // bcp-litany — gated behind Great Litany toggle
        if (item === 'bcp-litany') {
            if (greatLitanyChecked) {
                const comp = appData.components.find(c => c.id === 'bcp-litany');
                if (comp) {
                    const t = resolveText(comp, rite) || comp.text || '';
                    officeHtml += `<span class="rubric-text">${comp.title || 'The Great Litany'}</span><span class="component-text">${t}</span>`;
                } else {
                    console.warn('[renderOffice] bcp-litany: component not found');
                }
            }
            continue;
        }

        // ── Generic component lookup ──────────────────────────────────────────
        const DISPLAY_LABELS = {
            'bcp-confession-rite1':           'Confession of Sin',
            'bcp-confession-rite2':           'Confession of Sin',
            'bcp-absolution-r1-priest':       'Absolution',
            'bcp-absolution-r1-lay':          'Prayer for Forgiveness',
            'bcp-absolution-r2-priest':       'Absolution',
            'bcp-absolution-r2-lay':          'Prayer for Forgiveness',
            'bcp-suffrages-rite1':            'The Suffrages',
            'bcp-suffrages-rite2':            'The Suffrages',
            'bcp-phos-hilaron':               'O Gracious Light',
            'bcp-collect-grace':              'A Collect for Grace',
            'bcp-collect-peace':              'A Collect for Peace',
            'bcp-collect-compline-1':         'A Collect for the Evening',
            'bcp-mission-prayer-1':           'A Prayer for Mission',
            'bcp-versicles-before-prayers-compline': 'Versicles',
            'bcp-opening-blessing-compline':  'Opening Blessing',
            'bcp-nunc-dimittis':              'Nunc Dimittis',
            'bcp-benedictus':                 'The Benedictus',
            'bcp-magnificat':                 'The Magnificat',
            'bcp-te-deum':                    'Te Deum Laudamus',
        };
        const comp = appData.components.find(c => c.id === compId);
        if (comp) {
            const t = resolveText(comp, rite) || comp.text || '';
            const label = DISPLAY_LABELS[compId] || comp.title || compId;
            officeHtml += `<span class="rubric-text">${label}</span><span class="component-text">${t}</span>`;
        } else if (compId && !compId.startsWith('VARIABLE_') && compId !== item) {
            console.warn(`[renderOffice] Generic lookup failed for resolved ID: ${compId} (from: ${item})`);
        } else if (compId && !compId.startsWith('VARIABLE_')) {
            console.warn(`[renderOffice] Generic lookup failed for: ${compId}`);
        }

        // Trisagion injection — after absolution, if toggled
        if (item === 'bcp-absolution-slot' && document.getElementById('toggle-trisagion')?.checked) {
            const tris = appData.components.find(c => c.id === 'ecu-trisagion');
            if (tris) officeHtml += `<span class="rubric-text">Trisagion</span><span class="component-text">${tris.text}</span>`;
        }
    }

    // Post-sequence Marian (after position — BCP offices only)
    if (marianElement !== 'none' && marianPos === 'after') {
        if ((marianElement === 'antiphon' || marianElement === 'both') && marianComp) {
            const t = resolveText(marianComp, rite) || 'Text not found';
            officeHtml += `<span class="rubric-text">Marian Antiphon</span><span class="component-text"><i>${t}</i></span>`;
        }
        if ((marianElement === 'theotokion' || marianElement === 'both') && theotokionComp) {
            const raw = resolveText(theotokionComp, rite) || theotokionComp.text || '';
            officeHtml += `<span class="rubric-text">Theotokion</span><div class="component-text" style="white-space:normal"><i>${applyParagraphBreaks(raw)}</i></div>`;
        }
    }

    // ── Finalise DOM ──────────────────────────────────────────────────────────
    document.getElementById('office-display').innerHTML = officeHtml + `</div>`;

    // ── PHASE 8.5: Dual-date header (Gregorian + Ge'ez) ─────────────────────
    let dateHeaderText = `Commemorations for ${todayKey}`;
    try {
        const geezDateStr = EthiopianCalendar.formatEthiopianDate(currentDate);
        dateHeaderText += ` | ${geezDateStr}`;
    } catch (e) {
        console.warn('[Phase 8.5] Ge\'ez date unavailable:', e.message);
    }
    document.getElementById('date-header').innerText = dateHeaderText;
    document.getElementById('date-header').style.display = '';
    const saintSection = document.querySelector('.saint-section');
    if (saintSection) saintSection.style.display = '';

    document.getElementById('saint-display').innerHTML = appData.saints
        ?.filter(s => s.day && s.day.toLowerCase().includes(todayKeyShort.toLowerCase()))
        .map(s => `<div class="saint-box"><small style="color:var(--accent); font-weight:bold; text-transform:uppercase;">${s.tradition || 'Unknown'}</small><strong>${s.name || 'Unknown'}</strong><p>${s.description || 'No description'}</p></div>`)
        .join('') || '<p>No commemorations.</p>';
}

// ── ETHIOPIAN SA'ATAT RENDERER ────────────────────────────────────────────────
async function renderEthiopianSaatat() {
    if (!appData || !appData.rubrics || !Array.isArray(appData.rubrics)) {
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Loading...</h3><p>Data still loading.</p></div>`;
        return;
    }

    const todayKey      = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const todayKeyShort = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const rite          = document.querySelector('input[name="rite"]:checked')?.value || 'rite2';

    const { season, liturgicalColor } = await CalendarEngine.getSeasonAndFile(currentDate);
    updateSeasonalTheme(liturgicalColor || 'green');

    // Apply temporal override if active
    if (window._temporalOverride.active && window._temporalOverride.date) {
        currentDate = window._temporalOverride.date;
    }

    // Resolve hour info
    let ethHourInfo;
    if (window._temporalOverride.active && window._temporalOverride.hourId) {
        const overrideHourMap = [
            { from:  6*60, to:  9*60, hourId: 'eth-nigatu-hour-text',  hourName: 'Nigatu — ንጋቱ (Matins)',             uiLabel: 'Matins',            psalms: ['3','63','133'],    etReading: '1CLEM_ET 1:1-20' },
            { from:  9*60, to: 12*60, hourId: 'eth-meserk-hour-text',  hourName: "Mese'rk — መሠርቅ (Third Hour)",       uiLabel: 'Third Hour',        psalms: ['16','17','18'],    etReading: null },
            { from: 12*60, to: 15*60, hourId: 'eth-lika-hour-text',    hourName: 'Lika — ሊካ (Sixth Hour)',             uiLabel: 'Sixth Hour',        psalms: ['22','23','24'],    etReading: null },
            { from: 15*60, to: 17*60, hourId: 'eth-terk-hour-text',    hourName: "Tese'at — ተሰዓት (Ninth Hour)",        uiLabel: 'Ninth Hour',        psalms: ['69','70','71'],    etReading: null },
            { from: 17*60, to: 18*60, hourId: 'eth-serkh-hour-text',   hourName: 'Serkh — ሠርክ (Eleventh Hour)',        uiLabel: 'Vespers',           psalms: ['141','142','143'], etReading: null },
            { from: 18*60, to: 21*60, hourId: 'eth-nome-hour-text',    hourName: 'Nime — ኖሜ (Compline)',               uiLabel: 'Compline',          psalms: ['4','6','13'],      etReading: null },
            { from: 21*60, to: 24*60, hourId: 'eth-hour-7',            hourName: "Le'lit — First Night Watch",         uiLabel: 'First Night Watch', psalms: ['4','6','13'],      etReading: 'HERM_ET 1:1-10' },
            { from:  0*60, to:  3*60, hourId: 'eth-lelit-hour-text',   hourName: "Le'lit — ሌሊት (Midnight)",            uiLabel: 'Midnight Office',   psalms: ['4','6','13'],      etReading: 'HERM_ET 1:1-10' },
            { from:  3*60, to:  6*60, hourId: 'eth-mahlet-hour-text',  hourName: 'Mahlet — ማህሌት (Pre-dawn Vigil)',     uiLabel: 'Pre-dawn Vigil',    psalms: ['3','63','133'],    etReading: null },
        ];
        ethHourInfo = overrideHourMap.find(e => e.hourId === window._temporalOverride.hourId) || getEthiopianHourInfo();
    } else {
        ethHourInfo = getEthiopianHourInfo();
    }

    // Update sidebar Active Watch display
    const watchLabel = document.getElementById('eth-active-watch-label');
    const dateLabel  = document.getElementById('eth-active-date-label');
    if (watchLabel) watchLabel.textContent = ethHourInfo.hourName;
    let ethSidebarDate = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    try {
        const geezDateStr = EthiopianCalendar.formatEthiopianDate(currentDate);
        ethSidebarDate += ` | ${geezDateStr}`;
    } catch (e) {
        console.warn('[renderEthiopianSaatat] Ge\'ez date unavailable:', e.message);
    }
    if (dateLabel) dateLabel.textContent = ethSidebarDate + (window._temporalOverride.active ? ' ✦ override' : '');

    const activeRubric = appData.rubrics.find(r => r.id === 'ethiopian-saatat');

    // Saints preload
    const mIdx  = currentDate.getMonth();
    const month = monthNames[mIdx];
    if (!appData.saints || appData.saintsMonth !== month) {
        try {
            const res = await fetch(`data/saints/saints-${month.toLowerCase()}.json`);
            if (res.ok) { appData.saints = await res.json(); appData.saintsMonth = month; }
        } catch (err) { console.error('Saints load failed:', err); }
    }

    let officeHtml = `<div class="office-container"><h2>The Ethiopian Sa'atat</h2>`;
    officeHtml += `<p class="liturgical-title">${ethHourInfo?.hourName || 'The Book of Hours'}</p>`;

    for (let item of activeRubric?.sequence || []) {
        item = item.trim();

        // eth-introduction-to-every-hour
        if (item === 'eth-introduction-to-every-hour') {
            const introComp = appData.components.find(c => c.id === 'eth-introduction-to-every-hour');
            if (introComp) {
                if (introComp.rubric_before) {
                    officeHtml += `<span class="rubric-text"><i>${introComp.rubric_before}</i></span>`;
                }
                officeHtml += `<span class="rubric-text">Introduction to Every Hour — Tselote Meweta</span>`;
                officeHtml += `<div class="component-text" style="white-space:normal">${applyParagraphBreaks(introComp.text)}</div>`;
            } else {
                console.warn('[renderEthiopianSaatat] eth-introduction-to-every-hour: component not found');
            }
            continue;
        }

        // eth-saatat-hour-slot
        if (item === 'eth-saatat-hour-slot') {
            if (ethHourInfo) {
                const hourComp = appData.components.find(c => c.id === ethHourInfo.hourId);
                if (hourComp) {
                    officeHtml += `<span class="rubric-text">${ethHourInfo.hourName}</span>`;
                    if (ethHourInfo.hourId === 'eth-lika-hour-text') {
                        officeHtml += `<div class="component-text" style="white-space:normal"><i>This is the Sixth Hour, the hour of the Crucifixion of Our Lord Jesus Christ, who was nailed to the Holy Cross for the salvation of the world.</i></div>`;
                    }
                    officeHtml += `<div class="component-text" style="white-space:normal">${applyParagraphBreaks(hourComp.text)}</div>`;
                }
            }
            continue;
        }

        // eth-mazmur-slot
        if (item === 'eth-mazmur-slot') {
            const ethLength = document.getElementById('eth-length-select')?.value || 'abbreviated';
            if (ethLength === 'full') {
                const lekeHaileComp = appData.components.find(c => c.id === 'eth-leke-haile-chant');
                if (lekeHaileComp) {
                    officeHtml += `<span class="rubric-text">Leke Haile — The 12-Fold Glory</span>`;
                    officeHtml += `<div class="component-text" style="white-space:normal">`;
                    for (let i = 1; i <= 12; i++) {
                        officeHtml += `<p style="margin:0.4em 0;"><span style="color:var(--gold); font-family:'Cinzel',serif; font-size:0.78em; margin-right:6px;">${i}.</span><i>${lekeHaileComp.text}</i></p>`;
                    }
                    officeHtml += `</div>`;
                }
            }
            if (ethHourInfo && ethHourInfo.psalms && ethHourInfo.psalms.length > 0) {
                officeHtml += `<span class="rubric-text">Mazmur (Appointed Psalms)</span>`;
                for (const psNum of ethHourInfo.psalms) {
                    const fullText = await getScriptureText('PSALM ' + psNum);
                    officeHtml += `<h4 class="passage-reference">Psalm ${psNum}</h4>`;
                    officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
                }
                const anqasa = appData.components.find(c => c.id === 'eth-anqasa-birhan');
                if (anqasa) {
                    officeHtml += `<span class="rubric-text">Anqaşa Birhān — Gate of Light</span>`;
                    officeHtml += `<div class="component-text" style="white-space:normal"><i>${applyParagraphBreaks(anqasa.text)}</i></div>`;
                }
            }
            continue;
        }

        // VARIABLE_READING_ET
        if (item === 'VARIABLE_READING_ET') {
            if (ethHourInfo && ethHourInfo.etReading) {
                const citation = ethHourInfo.etReading;
                const text     = await getScriptureText(citation);
                if (text) {
                    const readingLabel = (ethHourInfo.hourId === 'eth-nigatu-hour-text')
                        ? 'The Nigatu Reading — 1 Clement'
                        : "The Le'lit Reading — The Shepherd of Hermas";
                    officeHtml += `<span class="rubric-text">${readingLabel}</span>`;
                    officeHtml += `<h4 class="passage-reference">${citation}</h4>`;
                    officeHtml += `<div class="reading-text">${formatScriptureAsFlow(text)}</div>`;
                    officeHtml += '<div class="ornamental-divider"><div class="div-line-left"></div><span class="ornamental-divider-glyph">✦ ✝ ✦</span><div class="div-line-right"></div></div>';
                } else {
                    console.warn(`[renderEthiopianSaatat] VARIABLE_READING_ET: no text for ${citation}`);
                }
            }
            continue;
        }

        // eth-saints-commemoration
        if (item === 'eth-saints-commemoration') {
            const ethDate = EthiopianCalendar.getEthiopianDate(currentDate);
            const ethDateLabel = `${ethDate.month} ${ethDate.day}`;
            const MONTH_SLUG_MAP = {
                'meskerem': 'meskerem', 'teqemt': 'tiqimt', 'hidar': 'hidar',
                'tahsas': 'tahsas', 'tir': 'tir', 'yekatit': 'yekatit',
                'megabit': 'megabit', 'miyazya': 'miazia', 'ginbot': 'ginbot',
                'sene': 'sene', 'hamle': 'hamle', 'nehase': 'nehase', 'pagume': 'pagume'
            };
            const monthSlug = MONTH_SLUG_MAP[ethDate.month.toLowerCase()] || ethDate.month.toLowerCase();

            if (!appData.senkessarIndex) {
                try {
                    const idxRes = await fetch('data/synaxarium/ethiopian/senkessar-index.json');
                    if (idxRes.ok) appData.senkessarIndex = await idxRes.json();
                } catch (err) {
                    console.warn('[renderEthiopianSaatat] Senkessar index load failed:', err);
                }
            }

            let indexEntry = null;
            if (appData.senkessarIndex?.months) {
                const MONTH_NAME_ALIASES = { 'teqemt': 'tiqimt' };
                const normalizedMonth = MONTH_NAME_ALIASES[ethDate.month.toLowerCase()] || ethDate.month.toLowerCase();
                const monthData = appData.senkessarIndex.months.find(m => m.month.toLowerCase() === normalizedMonth);
                if (monthData?.days) {
                    indexEntry = monthData.days.find(d => d.day === ethDate.day) || null;
                }
            }

            officeHtml += `<span class="rubric-text">The Senkessar: ${ethDateLabel}</span>`;

            if (indexEntry) {
                if (!appData.senkessarCache[monthSlug]) {
                    try {
                        const monthRes = await fetch(`data/synaxarium/ethiopian/${monthSlug}.json`);
                        if (monthRes.ok) appData.senkessarCache[monthSlug] = await monthRes.json();
                    } catch (err) {
                        console.warn(`[renderEthiopianSaatat] Month file load failed: ${monthSlug}.json`, err);
                    }
                }
                const dayData = appData.senkessarCache[monthSlug]
                    ? appData.senkessarCache[monthSlug][ethDate.day]
                    : null;
                if (dayData) {
                    officeHtml += `<div class="component-text"><strong style="color:#d4af37">${dayData.title || indexEntry.title}</strong></div>`;
                    if (dayData.narrative) {
                        const normalizedNarrative = dayData.narrative.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');
                        officeHtml += `<div class="component-text" style="white-space:normal">${applyParagraphBreaks(normalizedNarrative)}</div>`;
                    }
                } else {
                    officeHtml += `<div class="component-text"><strong style="color:#d4af37">${indexEntry.title}</strong></div>`;
                    console.warn(`[renderEthiopianSaatat] No entry for day ${ethDate.day} in ${monthSlug}.json`);
                }
            } else {
                const orientalSaints = (appData.saints || []).filter(s => {
                    if (!s.day || !s.day.toLowerCase().includes(todayKeyShort.toLowerCase())) return false;
                    const t = (s.tradition || '').toLowerCase();
                    return t.includes('ethiopian') || t.includes('oriental');
                });
                if (orientalSaints.length > 0) {
                    orientalSaints.forEach(s => {
                        officeHtml += `<div class="component-text"><strong style="color:#d4af37">${s.name || 'Unknown'}</strong>`;
                        if (s.description || s.narrative) {
                            officeHtml += `<br>${applyParagraphBreaks(s.description || s.narrative)}`;
                        }
                        officeHtml += `</div>`;
                    });
                } else {
                    officeHtml += `<div class="component-text">Let us pray for the holy Oriental Orthodox Churches: the Ethiopian Tewahedo, the Coptic, the Syriac, the Armenian, the Malankara, and the Eritrean; that the Lord may preserve them in the true faith, strengthen them under persecution, and unite all Christians in the one holy catholic and apostolic Church.</div>`;
                }
            }
            continue;
        }

        // comm-lords-prayer
        if (item === 'comm-lords-prayer') {
            const comp = appData.components.find(c => c.id === 'comm-lords-prayer');
            const t = comp ? (resolveText(comp, rite) || "Lord's Prayer not found") : "Lord's Prayer not found";
            officeHtml += `<span class="rubric-text">The Lord's Prayer</span><span class="component-text">${t}</span>`;
            continue;
        }

        // Generic component lookup
        const comp = appData.components.find(c => c.id === item);
        if (comp) {
            const t = resolveText(comp, rite) || comp.text || '';
            officeHtml += `<span class="rubric-text">${comp.title || item}</span><span class="component-text">${t}</span>`;
        } else {
            console.warn(`[renderEthiopianSaatat] Component not found: ${item}`);
        }
    }

    // Full mode: 41-Fold Kyrie & weekly Weddase Maryam
    const ethLength = document.getElementById('eth-length-select')?.value || 'abbreviated';
    if (ethLength === 'full') {
        const kyrieComp = appData.components.find(c => c.id === 'eth-41-kyrie');
        if (kyrieComp) {
            officeHtml += `<span class="rubric-text">Igzee-'o Tesahalene — Lord Have Mercy (41-fold)</span>`;
            officeHtml += `<div class="component-text" style="white-space:normal">${applyParagraphBreaks(kyrieComp.text)}</div>`;
        }
    }
    const includeMarianCheck = document.getElementById('eth-include-marian')?.checked;
    if (includeMarianCheck) {
        const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
        const activeDay = currentDate.getDay();
        const weddaseId = `eth-weddase-${dayNames[activeDay]}`;
        const weddaseComp = appData.components.find(c => c.id === weddaseId)
                         || appData.components.find(c => c.id === 'eth-weddase-sunday');
        if (weddaseComp) {
            officeHtml += `<span class="rubric-text">Weddase Maryam — ${dayNames[activeDay].charAt(0).toUpperCase() + dayNames[activeDay].slice(1)}</span>`;
            officeHtml += `<div class="component-text" style="white-space:normal"><i>${applyParagraphBreaks(weddaseComp.text)}</i></div>`;
        }
    }

    document.getElementById('office-display').innerHTML = officeHtml + `</div>`;
    document.getElementById('saint-display').innerHTML = '';
    document.getElementById('date-header').style.display = 'none';
    const saintSection = document.querySelector('.saint-section');
    if (saintSection) saintSection.style.display = 'none';
}


// ── EAST SYRIAC RAMSHA RENDERER ───────────────────────────────────────────────
async function renderEastSyriac() {
    if (!appData || !appData.eastSyriacRubrics) {
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Loading...</h3><p>East Syriac data still loading.</p></div>`;
        return;
    }

    const rite          = document.querySelector('input[name="rite"]:checked')?.value || 'rite2';
    const selectedTime  = document.querySelector('input[name="esy-time"]:checked')?.value;

    const officeMode = document.querySelector('input[name="esy-mode"]:checked')?.value || 'cathedral';

    let sequence, officeTitle;
    if (selectedTime === 'lelya') {
        sequence    = officeMode === 'monastic'
                        ? (appData.eastSyriacRubrics?.['monastic-lelya-sequence'] || [])
                        : (appData.eastSyriacRubrics?.['lelya-sequence'] || []);
        officeTitle = 'Lelya — Night Office';
    } else if (selectedTime === 'sapra') {
        sequence    = officeMode === 'monastic'
                        ? (appData.eastSyriacRubrics?.['monastic-sapra-sequence'] || [])
                        : (appData.eastSyriacRubrics?.['cathedral-sapra-sequence'] || []);
        officeTitle = 'Sapra — Morning Prayer';
    } else if (selectedTime === 'qutaa') {
        sequence    = officeMode === 'monastic'
                        ? (appData.eastSyriacRubrics?.['monastic-qutaa-sequence'] || [])
                        : (appData.eastSyriacRubrics?.['cathedral-qutaa-sequence'] || []);
        officeTitle = "Quta'a — Third Hour";
    } else if (selectedTime === 'endana') {
        sequence    = officeMode === 'monastic'
                        ? (appData.eastSyriacRubrics?.['monastic-endana-sequence'] || [])
                        : (appData.eastSyriacRubrics?.['cathedral-endana-sequence'] || []);
        officeTitle = 'Endana — Sixth Hour';
    } else if (selectedTime === 'dtsha-sain') {
        sequence    = officeMode === 'monastic'
                        ? (appData.eastSyriacRubrics?.['monastic-dtsha-sain-sequence'] || [])
                        : (appData.eastSyriacRubrics?.['cathedral-dtsha-sain-sequence'] || []);
        officeTitle = "D-tsha' Sa'in — Ninth Hour";
    } else if (selectedTime === 'subaa') {
        sequence    = officeMode === 'monastic'
                        ? (appData.eastSyriacRubrics?.['monastic-subaa-sequence'] || [])
                        : (appData.eastSyriacRubrics?.['cathedral-subaa-sequence'] || []);
        officeTitle = "Suba'a — Compline";
    } else {
        // Default: Ramsha
        sequence    = officeMode === 'monastic'
                        ? (appData.eastSyriacRubrics?.['monastic-ramsha-sequence'] || [])
                        : (appData.eastSyriacRubrics?.['cathedral-ramsha-sequence'] || []);
        officeTitle = 'Ramsha — Evening Prayer';
    }

    // Use the East Syriac calendar module for season, cycle, and liturgical colour.
    // This replaces the old ISO-week getWeekNumber() hack and the CalendarEngine
    // call — the Church of the East operates on its own nine-season year, not
    // the BCP calendar. Qdham/Wathar parity is now anchored to Subara Sunday.
    const esyData    = EastSyriacCalendar.getSeason(currentDate);
    const season     = esyData.season;
    const cycle      = esyData.cycle;
    const cycleLabel = esyData.cycleLabel;
    updateSeasonalTheme(esyData.seasonColor || 'green');

    const esyCycleDisplay = document.getElementById('esy-cycle-box');
    if (esyCycleDisplay) esyCycleDisplay.textContent = cycleLabel;

    const marmithaMap = {
        'qdham': {
            0: ['1',  '2',  '3'],
            1: ['4',  '5',  '6'],
            2: ['7',  '8',  '9'],
            3: ['10', '11', '12'],
            4: ['13', '14', '15'],
            5: ['16', '17', '18'],
            6: ['19', '20', '21']
        },
        'wathar': {
            0: ['22', '23', '24'],
            1: ['25', '26', '27'],
            2: ['28', '29', '30'],
            3: ['31', '32', '33'],
            4: ['34', '35', '36'],
            5: ['37', '38', '39'],
            6: ['40', '41', '42']
        }
    };

    const hulaliMap = {
        'qdham': {
            0: ['1', '2', '3', '4', '5'],
            1: ['18', '19', '20', '21'],
            2: ['37', '38', '39', '40'],
            3: ['51', '52', '53', '54'],
            4: ['69', '70', '71', '72'],
            5: ['82', '83', '84', '85'],
            6: ['94', '95', '96', '97']
        },
        'wathar': {
            0: ['105', '106', '107'],
            1: ['110', '111', '112', '113'],
            2: ['119'],
            3: ['120', '121', '122', '123'],
            4: ['135', '136', '137', '138'],
            5: ['140', '141', '142'],
            6: ['145', '146', '147']
        }
    };

    let officeHtml = `<div class="office-container"><h2>Church of the East</h2>`;
    officeHtml += `<p class="liturgical-title">${officeTitle}</p>`;

    for (let item of sequence) {
        item = item.trim();

        if (item === 'esy-variable-seasonal-onitha') {
            // season comes from EastSyriacCalendar.getSeason() — use East Syriac names
            const onithaId = season === 'sauma'   ? 'esy-onitha-lent'
                           : season === 'qyamta'  ? 'esy-onitha-easter'
                           :                        'esy-onitha-ordinary';
            const onithaComp = appData.components.find(c => c.id === onithaId);
            if (onithaComp) {
                const t = resolveText(onithaComp, rite) || onithaComp.text || '';
                officeHtml += `<span class="rubric-text">${onithaComp.title || 'Onitha'}</span><span class="component-text">${t}</span>`;
            } else {
                console.warn(`[renderEastSyriac] Seasonal Onitha not found: ${onithaId}`);
            }
            continue;
        }

        if (item === 'esy-variable-sapra-psalms') {
            const sapraPsalms = ['100', '91', '148', '150'];
            officeHtml += `<span class="rubric-text">The Appointed Psalms of the Morning</span>`;
            for (const psNum of sapraPsalms) {
                const fullText = await getScriptureText('PSALM ' + psNum);
                officeHtml += `<h4 class="passage-reference">Psalm ${psNum}</h4>`;
                officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
            }
            continue;
        }if (item === 'esy-variable-qutaa-psalms') {
            const qutaaPsalms = ['19', '24', '25'];
            officeHtml += `<span class="rubric-text">The Appointed Psalms of the Third Hour</span>`;
            for (const psNum of qutaaPsalms) {
                const fullText = await getScriptureText('PSALM ' + psNum);
                officeHtml += `<h4 class="passage-reference">Psalm ${psNum}</h4>`;
                officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
            }
            continue;
        }

        if (item === 'esy-variable-endana-psalms') {
            const endanaPsalms = ['119:1-32', '121', '122'];
            officeHtml += `<span class="rubric-text">The Appointed Psalms of the Sixth Hour</span>`;
            for (const psRef of endanaPsalms) {
                const fullText = await getScriptureText('PSALM ' + psRef);
                // Extract the display label (psalm number only, strip verse range)
                const displayNum = psRef.split(':')[0];
                officeHtml += `<h4 class="passage-reference">Psalm ${psRef}</h4>`;
                officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
            }
            continue;
        }

        if (item === 'esy-variable-dtsha-sain-psalms') {
            const dtshaPsalms = ['84', '116', '117'];
            officeHtml += `<span class="rubric-text">The Appointed Psalms of the Ninth Hour</span>`;
            for (const psNum of dtshaPsalms) {
                const fullText = await getScriptureText('PSALM ' + psNum);
                officeHtml += `<h4 class="passage-reference">Psalm ${psNum}</h4>`;
                officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
            }
            continue;
        }

        if (item === 'esy-variable-subaa-psalms') {
            const subaaPsalms = ['4', '91', '134'];
            officeHtml += `<span class="rubric-text">The Appointed Psalms of Compline</span>`;
            for (const psNum of subaaPsalms) {
                const fullText = await getScriptureText('PSALM ' + psNum);
                officeHtml += `<h4 class="passage-reference">Psalm ${psNum}</h4>`;
                officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
            }
            continue;
        }

        if (item === 'esy-variable-marmitha') {
            const dayOfWeek = currentDate.getDay();
            const psalmNums = marmithaMap[cycle][dayOfWeek] || marmithaMap[cycle][0];

            officeHtml += `<span class="rubric-text">The Marmitha (Appointed Psalms — ${cycleLabel} Week)</span>`;

            for (const psNum of psalmNums) {
                const fullText = await getScriptureText('PSALM ' + psNum);
                officeHtml += `<h4 class="passage-reference">Psalm ${psNum}</h4>`;
                officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
            }
            continue;
        }

        if (item === 'esy-variable-hulali') {
            const dayOfWeek = currentDate.getDay();
            const psalmNums = hulaliMap[cycle][dayOfWeek] || hulaliMap[cycle][0];

            officeHtml += `<span class="rubric-text">The Appointed Hulali (Night Psalms — ${cycleLabel} Week)</span>`;

            for (const psNum of psalmNums) {
                const fullText = await getScriptureText('PSALM ' + psNum);
                officeHtml += `<h4 class="passage-reference">Psalm ${psNum}</h4>`;
                officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
            }
            continue;
        }

        if (item === 'esy-variable-qanona') {
            // Hour-specific Qanona (Sapra/Ramsha/Lelya frame) rendered first if present
            const hourQanonaMap = { sapra: 'esy-qanona-sapra', ramsha: 'esy-qanona-ramsha', lelya: 'esy-qanona-lelya' };
            const hourQanonaId  = hourQanonaMap[selectedTime];
            const hourComp      = hourQanonaId ? appData.components.find(c => c.id === hourQanonaId) : null;
            if (hourComp) {
                const t = resolveText(hourComp, rite) || hourComp.text || '';
                officeHtml += `<span class="rubric-text">${hourComp.title || 'Qanona'}</span><span class="component-text">${t}</span>`;
            }
            // Seasonal Qanona (season + cycle content) rendered second
            const qanonaId = `esy-qanona-${season}-${cycle}`;
            const comp = appData.components.find(c => c.id === qanonaId)
                      || appData.components.find(c => c.id === 'esy-qanona-ordinary');
            if (comp) {
                const t = resolveText(comp, rite) || comp.text || '';
                officeHtml += `<span class="rubric-text">${comp.title || 'Qanona'}</span><span class="component-text">${t}</span>`;
            } else {
                console.warn(`[renderEastSyriac] Seasonal Qanona not found: ${qanonaId}`);
            }
            continue;
        }

        if (item === 'esy-variable-onitha-with-qala') {
            const qalaId   = `esy-qala-${season}-${cycle}`;
            const onithaId = season === 'sauma'  ? 'esy-onitha-lent'
                           : season === 'qyamta' ? 'esy-onitha-easter'
                           :                       'esy-onitha-ordinary';
            const qalaComp   = appData.components.find(c => c.id === qalaId);
            const onithaComp = appData.components.find(c => c.id === onithaId);
            if (qalaComp) {
                officeHtml += `<span class="rubric-text"><i>Tone: ${qalaComp.text || ''}</i></span>`;
            }
            if (onithaComp) {
                const t = resolveText(onithaComp, rite) || onithaComp.text || '';
                officeHtml += `<span class="rubric-text">${onithaComp.title || "'Onitha"}</span><span class="component-text">${t}</span>`;
            } else {
                console.warn(`[renderEastSyriac] Onitha not found: ${onithaId}`);
            }
            continue;
        }

        if (item === 'esy-variable-barekmar-intercessions') {
            const dayNames   = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
            const dayName    = dayNames[currentDate.getDay()];
            const barekmarId = season === 'sauma'
                                ? 'esy-barekmar-sauma'
                                : `esy-barekmar-${dayName}`;
            const comp = appData.components.find(c => c.id === barekmarId)
                      || appData.components.find(c => c.id === 'esy-barekmar-general');
            if (comp) {
                const t = resolveText(comp, rite) || comp.text || '';
                officeHtml += `<span class="rubric-text">${comp.title || 'Barekmar Intercessions'}</span><div class="component-text" style="white-space:normal">${applyParagraphBreaks(t)}</div>`;
            } else {
                console.warn(`[renderEastSyriac] Barekmar not found: ${barekmarId} — add esy-barekmar-general to east-syriac.json`);
            }
            continue;
        }

        const comp = appData.components.find(c => c.id === item);
        if (comp) {
            const t = resolveText(comp, rite) || comp.text || '';
            officeHtml += `<span class="rubric-text">${comp.title || item}</span><span class="component-text">${t}</span>`;
        } else {
            console.warn(`[renderEastSyriac] Component not found: ${item}`);
        }
    }

    document.getElementById('office-display').innerHTML = officeHtml + `</div>`;
    document.getElementById('saint-display').innerHTML = '';
    document.getElementById('date-header').style.display = 'none';
    const saintSection = document.querySelector('.saint-section');
    if (saintSection) saintSection.style.display = 'none';
}