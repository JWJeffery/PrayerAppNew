let appData = null;
let currentDate = new Date();
let selectedMode = null;
let isHydrationComplete        = false;
let selectedHorologionOffice   = 'vespers'; // tracks active office within Horologion mode
let selectedEoMode = 'new_calendar'; // 'new_calendar' | 'old_calendar' — persisted in universalOfficeSettings

// ── v5.4: Horologion diagnostics toggle ──────────────────────────────────────
// Off by default. Enable via the sidebar toggle button or from the console:
//   toggleHorologionDiagnostics()
// When enabled, variable Horologion slots show a small inline diagnostics line
// with resolvedAs, type, tone, and source layer. Fixed/liturgical text is
// never annotated — diagnostics appear only on the slots that vary by date.
let _horDiagnosticsEnabled = false;
let selectedHorologionReductionProfile = 'full'; // 'full' | 'reader' | 'educational' — display-layer only, never passed to HorologionEngine

function toggleHorologionDiagnostics() {
    _horDiagnosticsEnabled = !_horDiagnosticsEnabled;
    const btn = document.getElementById('hor-btn-diag');
    if (btn) {
        btn.textContent      = _horDiagnosticsEnabled ? 'Diagnostics: ON' : 'Diagnostics: OFF';
        btn.style.borderColor = _horDiagnosticsEnabled
            ? 'rgba(100,200,100,0.8)'
            : 'rgba(201,168,76,0.3)';
        btn.style.color = _horDiagnosticsEnabled
            ? 'rgba(100,220,100,0.95)'
            : 'rgba(201,168,76,0.5)';
    }
    // Re-render immediately so the toggle is instant.
    if (selectedMode === 'horologion') requestRender();
}

// ── v7.1: EO calendar mode selector ───────────────────────────────────────────────
function selectEoMode(mode) {
    if (mode !== 'new_calendar' && mode !== 'old_calendar') {
        console.warn('[selectEoMode] Invalid mode:', mode, '— defaulting to new_calendar.');
        mode = 'new_calendar';
    }
    selectedEoMode = mode;
    // Sync selector DOM in case this was called programmatically
    const sel = document.getElementById('hor-eo-calendar-select');
    if (sel && sel.value !== mode) sel.value = mode;
    saveSettings();
    if (selectedMode === 'horologion') {
        _updateGenericCalendarInfo();
        requestRender();
    }
}

// Update #generic-calendar-info with the active EO calendar mode label.
// Replaces the old BCP-mirror behaviour for the Horologion sidebar.
function _updateGenericCalendarInfo() {
    const infoEl = document.getElementById('generic-calendar-info');
    if (!infoEl) return;
    const label = selectedEoMode === 'old_calendar'
        ? 'Old Calendar (Julian fixed feasts)'
        : 'New Calendar (Revised Julian fixed feasts)';
    infoEl.textContent = 'EO Calendar Mode: ' + label;
}
let activeRender = null;
let pendingRender = false;
let renderScheduled = false;

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
    requestRender();
}

function resetEthOverride() {
    window._temporalOverride = { active: false, date: null, hourId: null };
    document.querySelectorAll('input[name="eth-watch-override"]').forEach(r => r.checked = false);
    const panel = document.getElementById('eth-override-panel');
    if (panel) panel.style.display = 'none';
    requestRender();
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
    {day: 29, morning: '139,140',                 evening: '141,142,143'},
    {day: 30, morning: '144,145,146',             evening: '147,148,149,150'},
    // Day 31: the BCP Psalter (p.584-808) prints no explicit rubric for a 31st
    // day at all — the printed table ends at the Thirtieth Day. This repeats
    // the Thirtieth Day's psalms per long-standing Anglican custom (back to
    // 1662), but that convention is NOT printed in the 1979 BCP text itself.
    // FLAGGED for Josh: confirm whether an explicit source exists before
    // treating this as settled rather than a reasonable customary fallback.
    {day: 31, morning: '144,145,146',             evening: '147,148,149,150'}
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

// ── EAST SYRIAC TEMPORAL OVERRIDE ────────────────────────────────────────────

window._esyTemporalOverride = { active: false, date: null, hourId: null };

// Map clock time to the canonical East Syriac hour.
// Traditional time windows follow the ancient day-division used in the Hudra:
//   Sapra      06:00–09:00  (Morning Prayer)
//   Quta'a     09:00–12:00  (Third Hour)
//   Endana     12:00–15:00  (Sixth Hour)
//   D-tsha' Sa'in  15:00–18:00  (Ninth Hour)
//   Ramsha     18:00–21:00  (Evening Prayer)
//   Lelya      21:00–00:00  (Night Office)
//   Lelya      00:00–03:00  (Night Office, continued)
//   Suba'a     03:00–06:00  (Compline / Pre-dawn)
function getEastSyriacHourInfo() {
    const now          = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();

    const hourMap = [
        { from:  6 * 60, to:  9 * 60, value: 'sapra',     label: 'Sapra — Morning Prayer' },
        { from:  9 * 60, to: 12 * 60, value: 'qutaa',     label: "Quta\'a — Third Hour" },
        { from: 12 * 60, to: 15 * 60, value: 'endana',    label: 'Endana — Sixth Hour' },
        { from: 15 * 60, to: 18 * 60, value: 'dtsha-sain',label: "D-tsha\' Sa\'in — Ninth Hour" },
        { from: 18 * 60, to: 21 * 60, value: 'ramsha',    label: 'Ramsha — Evening Prayer' },
        { from: 21 * 60, to: 24 * 60, value: 'lelya',     label: 'Lelya — Night Office' },
        { from:  0 * 60, to:  3 * 60, value: 'lelya',     label: 'Lelya — Night Office' },
        { from:  3 * 60, to:  6 * 60, value: 'subaa',     label: "Suba\'a — Compline" },
    ];

    for (const entry of hourMap) {
        if (totalMinutes >= entry.from && totalMinutes < entry.to) return entry;
    }
    return { value: 'sapra', label: 'Sapra — Morning Prayer' };
}

function toggleEsyOverridePanel(e) {
    e.preventDefault();
    const panel = document.getElementById('esy-override-panel');
    if (!panel) return;
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
        const picker = document.getElementById('esy-override-date');
        if (picker) {
            const y  = currentDate.getFullYear();
            const mo = String(currentDate.getMonth() + 1).padStart(2, '0');
            const d  = String(currentDate.getDate()).padStart(2, '0');
            picker.value = `${y}-${mo}-${d}`;
        }
    }
}

function applyEsyOverride() {
    const dateVal  = document.getElementById('esy-override-date')?.value;
    const radioVal = document.querySelector('input[name="esy-hour-override"]:checked')?.value;
    if (!dateVal && !radioVal) return;
    window._esyTemporalOverride.active = true;
    if (dateVal) {
        const [y, mo, d] = dateVal.split('-');
        window._esyTemporalOverride.date = new Date(parseInt(y), parseInt(mo) - 1, parseInt(d));
        currentDate = window._esyTemporalOverride.date;
    }
    if (radioVal) {
        window._esyTemporalOverride.hourId = radioVal;
        // Sync the main hour radio to match the override
        const mainRadio = document.querySelector(`input[name="esy-time"][value="${radioVal}"]`);
        if (mainRadio) { mainRadio.checked = true; }
    }
    requestRender();
}

function resetEsyOverride() {
    window._esyTemporalOverride = { active: false, date: null, hourId: null };
    currentDate = new Date();
    document.querySelectorAll('input[name="esy-hour-override"]').forEach(r => r.checked = false);
    const panel = document.getElementById('esy-override-panel');
    if (panel) panel.style.display = 'none';
    // Restore main hour radio to auto-detected hour
    const autoHour = getEastSyriacHourInfo();
    const mainRadio = document.querySelector(`input[name="esy-time"][value="${autoHour.value}"]`);
    if (mainRadio) { mainRadio.checked = true; }
    requestRender();
}

function backToSplash() {
    // Reset hydration and mode state so the next selectMode() call
    // performs a full fresh load rather than re-using stale data.
    isHydrationComplete = false;
    selectedMode = null;

    // Hide all section panels
    document.getElementById('daily-office-section').style.display       = 'none';
    document.getElementById('individual-prayers-section').style.display = 'none';

    // Restore the splash screen
    showUniversalModeSelection();

    // Remove office-active so body returns to its splash flex-centering state
    document.body.classList.remove('office-active');
    document.body.classList.remove('ethiopian-theme');

    // Clear any forced office override
    window._forcedOfficeId = undefined;

    // Reset all settings panels to their default hidden states so the next
    // mode selection starts clean (avoids e.g. East Syriac settings panel
    // bleeding into a subsequent Daily Office load)
   const settingsPanel = document.getElementById('settings-panel');
    const ethSettings   = document.getElementById('ethiopian-settings');
    const esySettings   = document.getElementById('east-syriac-settings');
    const genSettings   = document.getElementById('generic-settings');
    const mainContent   = document.getElementById('main-content');

    // On splash, ALL panels are hidden. The next selectMode() call is solely
    // responsible for activating whichever panel is correct for that mode.
    // Do NOT restore #settings-panel here — that was the original splash
    // deformation bug. Splash has no sidebar at all.
    if (settingsPanel) {
        settingsPanel.classList.add('sidebar-hidden');
        settingsPanel.classList.add('mode-hidden');
    }
    if (ethSettings) {
        ethSettings.classList.add('sidebar-hidden');
        ethSettings.classList.add('mode-hidden');
    }
    if (esySettings) {
        esySettings.classList.add('sidebar-hidden');
        esySettings.classList.add('mode-hidden');
    }
    if (genSettings) {
        genSettings.classList.add('sidebar-hidden');
        genSettings.classList.add('mode-hidden');
    }
       if (mainContent) {
        mainContent.classList.remove('sidebar-hidden');
    }
}

// ── Entry Routing / Tradition Default ────────────────────────────────────────
// New public users begin with a Christian-family choice rather than the all-mode
// Universal Office selector. The selector remains available for advanced/project
// use and can be persisted as the default through the local profile skeleton.
const UNIVERSAL_OFFICE_ENTRY_DEFAULT_KEY = 'universalOffice.entry.default.v1';
const UNIVERSAL_OFFICE_USER_PROFILE_KEY = 'universalOffice.userProfile.v1';

const UNIVERSAL_OFFICE_USER_PROFILE_DEFAULTS = Object.freeze({
    version: 1,
    entryPageDefault: 'ask',
    traditionDefault: null,
    bookOfNeedsScope: 'tradition'
});

const UNIVERSAL_OFFICE_TRADITION_MODE_MAP = {
    'anglican': 'daily',
    'unknown': 'daily',
    'church-of-the-east': 'east-syriac',
    'eastern-orthodox': 'horologion',
    'oriental-orthodox': 'ethiopian-saatat',
    'universal': 'universal'
};

const UNIVERSAL_OFFICE_TRADITION_LABELS = {
    anglican: 'The Episcopal Church',
    'church-of-the-east': 'Church of the East',
    'eastern-orthodox': 'Eastern Orthodoxy',
    'oriental-orthodox': 'Oriental Orthodoxy',
    universal: 'Universal Office selector'
};

const UNIVERSAL_OFFICE_ENTRY_PAGE_VALUES = new Set(['ask', 'tradition', 'universal']);
const UNIVERSAL_OFFICE_BOOK_OF_NEEDS_SCOPE_VALUES = new Set(['tradition', 'universal']);


function isUniversalOfficeAdvancedToolsEnabled() {
    const params = new URLSearchParams(window.location.search);
    const explicitAdvanced = params.get('advanced');
    const entryOverride = params.get('entry');

    return explicitAdvanced === '1' ||
        explicitAdvanced === 'true' ||
        entryOverride === 'roman-breviary-dev';
}

function syncUniversalOfficeAdvancedToolsVisibility(enabled = isUniversalOfficeAdvancedToolsEnabled()) {
    const advancedTools = document.querySelectorAll('[data-advanced-only="true"]');
    const modeSelection = document.getElementById('mode-selection');

    if (modeSelection) {
        modeSelection.classList.toggle('app-entry-advanced-tools-visible', enabled);
    }

    for (const tool of advancedTools) {
        tool.hidden = !enabled;
        tool.setAttribute('aria-hidden', enabled ? 'false' : 'true');
    }
}

function readLegacyEntryDefault() {
    try {
        return localStorage.getItem(UNIVERSAL_OFFICE_ENTRY_DEFAULT_KEY);
    } catch (_error) {
        return null;
    }
}

function writeLegacyEntryDefault(value) {
    try {
        if (value) {
            localStorage.setItem(UNIVERSAL_OFFICE_ENTRY_DEFAULT_KEY, value);
        } else {
            localStorage.removeItem(UNIVERSAL_OFFICE_ENTRY_DEFAULT_KEY);
        }
    } catch (_error) {
        console.warn('[entry-routing] Could not write legacy entry default.');
    }
}

function normalizeUserProfileDefaults(raw) {
    const profile = {
        ...UNIVERSAL_OFFICE_USER_PROFILE_DEFAULTS,
        ...(raw && typeof raw === 'object' ? raw : {})
    };

    profile.version = 1;

    if (!UNIVERSAL_OFFICE_ENTRY_PAGE_VALUES.has(profile.entryPageDefault)) {
        profile.entryPageDefault = 'ask';
    }

    if (!UNIVERSAL_OFFICE_BOOK_OF_NEEDS_SCOPE_VALUES.has(profile.bookOfNeedsScope)) {
        profile.bookOfNeedsScope = 'tradition';
    }

    if (profile.traditionDefault && !UNIVERSAL_OFFICE_TRADITION_MODE_MAP[profile.traditionDefault]) {
        profile.traditionDefault = null;
    }

    if (profile.traditionDefault === 'unknown') {
        profile.traditionDefault = 'anglican';
    }

    return profile;
}

function applyEntryDefaultToProfile(profile, value) {
    const next = normalizeUserProfileDefaults(profile);

    if (!value) {
        next.entryPageDefault = 'ask';
        next.traditionDefault = null;
        return next;
    }

    const route = resolveEntryTraditionRoute(value);

    if (!route) {
        next.entryPageDefault = 'ask';
        return next;
    }

    if (route.mode === 'universal') {
        next.entryPageDefault = 'universal';
        return next;
    }

    next.entryPageDefault = 'tradition';
    next.traditionDefault = route.storedDefault;
    return next;
}

function deriveProfileFromLegacyEntryDefault(profile) {
    const legacyDefault = readLegacyEntryDefault();

    if (!legacyDefault) return profile;

    const route = resolveEntryTraditionRoute(legacyDefault);
    if (!route) return profile;

    if (route.mode === 'universal') {
        return {
            ...profile,
            entryPageDefault: 'universal'
        };
    }

    return {
        ...profile,
        entryPageDefault: 'tradition',
        traditionDefault: route.storedDefault
    };
}

function getUserProfileDefaults() {
    let parsed = null;
    let hadStoredProfile = false;

    try {
        const stored = localStorage.getItem(UNIVERSAL_OFFICE_USER_PROFILE_KEY);
        hadStoredProfile = Boolean(stored);
        parsed = stored ? JSON.parse(stored) : null;
    } catch (_error) {
        console.warn('[entry-routing] Could not read local profile defaults.');
    }

    let profile = normalizeUserProfileDefaults(parsed);

    if (!hadStoredProfile) {
        profile = normalizeUserProfileDefaults(deriveProfileFromLegacyEntryDefault(profile));
    }

    return profile;
}

function persistUserProfileDefaults(profile) {
    const normalized = normalizeUserProfileDefaults(profile);

    try {
        localStorage.setItem(UNIVERSAL_OFFICE_USER_PROFILE_KEY, JSON.stringify(normalized));
    } catch (_error) {
        console.warn('[entry-routing] Could not persist local profile defaults.');
    }

    const legacyValue = normalized.entryPageDefault === 'universal'
        ? 'universal'
        : normalized.entryPageDefault === 'tradition'
            ? normalized.traditionDefault
            : null;

    writeLegacyEntryDefault(legacyValue);
    syncUserProfileControls(normalized);
    return normalized;
}

function getUserEntryDefault() {
    const profile = getUserProfileDefaults();

    if (profile.entryPageDefault === 'universal') return 'universal';
    if (profile.entryPageDefault === 'tradition') return profile.traditionDefault || null;

    return null;
}

function persistUserEntryDefault(value) {
    persistUserProfileDefaults(
        applyEntryDefaultToProfile(getUserProfileDefaults(), value)
    );
}

function clearUserEntryDefault() {
    try {
        localStorage.removeItem(UNIVERSAL_OFFICE_USER_PROFILE_KEY);
        localStorage.removeItem(UNIVERSAL_OFFICE_ENTRY_DEFAULT_KEY);
    } catch (_error) {
        console.warn('[entry-routing] Could not clear local profile defaults.');
    }

    syncUserProfileControls(normalizeUserProfileDefaults(null));
}

function setUserProfileEntryPageDefault(value) {
    const profile = getUserProfileDefaults();

    if (value === 'universal') {
        profile.entryPageDefault = 'universal';
    } else if (value === 'tradition') {
        profile.entryPageDefault = profile.traditionDefault ? 'tradition' : 'ask';
    } else {
        profile.entryPageDefault = 'ask';
    }

    persistUserProfileDefaults(profile);
}

function setUserProfileTraditionDefault(value) {
    const profile = getUserProfileDefaults();

    if (!value) {
        profile.traditionDefault = null;
        if (profile.entryPageDefault === 'tradition') profile.entryPageDefault = 'ask';
        persistUserProfileDefaults(profile);
        return;
    }

    const route = resolveEntryTraditionRoute(value);

    if (!route || route.mode === 'universal') {
        console.warn('[entry-routing] Unsupported profile tradition default:', value);
        syncUserProfileControls(profile);
        return;
    }

    profile.traditionDefault = route.storedDefault;

    if (profile.entryPageDefault === 'ask') {
        profile.entryPageDefault = 'tradition';
    }

    persistUserProfileDefaults(profile);
}

function setUserProfileBookOfNeedsScope(value) {
    const profile = getUserProfileDefaults();
    profile.bookOfNeedsScope = UNIVERSAL_OFFICE_BOOK_OF_NEEDS_SCOPE_VALUES.has(value)
        ? value
        : 'tradition';

    persistUserProfileDefaults(profile);
}

function resetUniversalOfficeUserProfile() {
    clearUserEntryDefault();
    showTraditionEntry();
}

function focusLocalProfileDefaultsPanel() {
    const panel = document.getElementById('user-profile-defaults');
    if (!panel) return;

    const focusTarget = document.getElementById('profile-entry-default') ||
        panel.querySelector('select, button, input, [tabindex]:not([tabindex="-1"])');

    const focusProfileTarget = () => {
        if (focusTarget && typeof focusTarget.focus === 'function') {
            focusTarget.focus({ preventScroll: true });
        }
    };

    panel.scrollIntoView({ block: 'center', behavior: 'smooth' });
    focusProfileTarget();
    requestAnimationFrame(focusProfileTarget);
    setTimeout(focusProfileTarget, 80);
}

function openLocalProfileDefaultsFromOffice() {
    window._profileDefaultsReturnMode = selectedMode && selectedMode !== 'prayers'
        ? selectedMode
        : getActiveOfficeModeForBookOfNeeds();

    backToSplash();
    syncUserProfileControls();
    focusLocalProfileDefaultsPanel();
}

function syncUserProfileControls(profile = getUserProfileDefaults()) {
    const normalized = normalizeUserProfileDefaults(profile);
    const entrySelect = document.getElementById('profile-entry-default');
    const traditionSelect = document.getElementById('profile-tradition-default');
    const bookNeedsSelect = document.getElementById('profile-book-needs-scope');
    const summary = document.getElementById('profile-defaults-summary');

    if (entrySelect) {
        entrySelect.value = normalized.entryPageDefault;
    }

    if (traditionSelect) {
        traditionSelect.value = normalized.traditionDefault || '';
    }

    if (bookNeedsSelect) {
        bookNeedsSelect.value = normalized.bookOfNeedsScope;
    }

    if (summary) {
        const entryLabel = normalized.entryPageDefault === 'universal'
            ? 'opens to the Universal Office selector'
            : normalized.entryPageDefault === 'tradition' && normalized.traditionDefault
                ? `opens to ${UNIVERSAL_OFFICE_TRADITION_LABELS[normalized.traditionDefault] || 'the selected tradition'}`
                : 'asks for a tradition on entry';

        const bookNeedsLabel = normalized.bookOfNeedsScope === 'universal'
            ? 'Book of Needs office access shows all prayers'
            : 'Book of Needs office access stays tradition-filtered';

        summary.textContent = `This browser ${entryLabel}; ${bookNeedsLabel}.`;
    }
}

function selectTraditionFamily(family) {
    const traditionEntry = document.getElementById('tradition-entry');
    const title = document.getElementById('tradition-entry-title');
    const lede = document.querySelector('#tradition-entry .app-entry-lede');
    const familyGrid = document.getElementById('entry-family-grid');
    const western = document.getElementById('entry-western-options');
    const eastern = document.getElementById('entry-eastern-options');
    const isWestern = family === 'western';
    const isEastern = family === 'eastern';
    const isFamilyStep = isWestern || isEastern;

    if (traditionEntry) {
        traditionEntry.dataset.entryStep = isWestern ? 'western' : isEastern ? 'eastern' : 'family';
    }

    if (title) {
        title.textContent = isWestern ? 'Western Christian' : isEastern ? 'Eastern Christian' : 'Where do you pray?';
    }

    if (lede) {
        lede.textContent = isFamilyStep
            ? 'Choose the tradition you want to pray with.'
            : 'Choose the Christian family you pray within. The app will remember your path and open there by default.';
    }

    if (familyGrid) {
        familyGrid.hidden = isFamilyStep;
        familyGrid.setAttribute('aria-hidden', isFamilyStep ? 'true' : 'false');
    }

    if (western) {
        western.hidden = !isWestern;
        western.setAttribute('aria-hidden', isWestern ? 'false' : 'true');
    }

    if (eastern) {
        eastern.hidden = !isEastern;
        eastern.setAttribute('aria-hidden', isEastern ? 'false' : 'true');
    }
}

// ── Entry panel focus-safe visibility helpers ───────────────────────────────
// Before an entry panel is hidden with aria-hidden, blur any focused descendant.
// Otherwise Chrome correctly warns that a focused control is being hidden from
// assistive technology. inert is also applied where supported.
function safelyBlurFocusedDescendant(container) {
    if (!container) return;

    const active = document.activeElement;
    if (active && container.contains(active) && typeof active.blur === 'function') {
        active.blur();
    }
}

function hideEntrySurface(container) {
    if (!container) return;

    safelyBlurFocusedDescendant(container);

    if ('inert' in container) {
        container.inert = true;
    }

    container.hidden = true;
    container.setAttribute('aria-hidden', 'true');
    container.style.display = 'none';
}

function showEntrySurface(container) {
    if (!container) return;

    if ('inert' in container) {
        container.inert = false;
    }

    container.hidden = false;
    container.removeAttribute('aria-hidden');
    container.style.display = '';
}

function showTraditionEntry() {
    const splashBg = document.getElementById('splash-bg');
    const traditionEntry = document.getElementById('tradition-entry');
    const modeSelection = document.getElementById('mode-selection');

    if (splashBg) splashBg.style.display = '';
    showEntrySurface(traditionEntry);
    hideEntrySurface(modeSelection);

    document.body.classList.remove('office-active');
    document.body.classList.remove('ethiopian-theme');
    document.body.classList.remove('roman-breviary-dev-mode');

    selectTraditionFamily(null);
}

function showUniversalModeSelection(persistDefault = false) {
    if (persistDefault) persistUserEntryDefault('universal');
    syncUniversalOfficeAdvancedToolsVisibility();

    const splashBg = document.getElementById('splash-bg');
    const traditionEntry = document.getElementById('tradition-entry');
    const modeSelection = document.getElementById('mode-selection');

    if (splashBg) splashBg.style.display = '';
    hideEntrySurface(traditionEntry);
    showEntrySurface(modeSelection);

    document.body.classList.remove('office-active');
    document.body.classList.remove('ethiopian-theme');
    document.body.classList.remove('roman-breviary-dev-mode');
}


function isEntrySurfaceVisible(container) {
    if (!container || container.hidden) return false;

    const style = window.getComputedStyle(container);
    return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0';
}

function ensureSplashForegroundVisible() {
    const splashBg = document.getElementById('splash-bg');
    if (!splashBg || splashBg.style.display === 'none') return;
    if (document.body.classList.contains('office-active')) return;

    const traditionEntry = document.getElementById('tradition-entry');
    const modeSelection = document.getElementById('mode-selection');

    if (!isEntrySurfaceVisible(traditionEntry) && !isEntrySurfaceVisible(modeSelection)) {
        console.warn('[entry-routing] Splash background was visible without a foreground panel; restoring tradition entry.');
        showTraditionEntry();
    }
}

function scheduleSplashForegroundGuard() {
    window.setTimeout(ensureSplashForegroundVisible, 160);
    window.setTimeout(ensureSplashForegroundVisible, 850);
}

function resolveEntryTraditionRoute(tradition) {
    switch (tradition) {
        case 'unknown':
            return { storedDefault: 'anglican', mode: 'daily' };
        case 'anglican':
            return { storedDefault: 'anglican', mode: 'daily' };
        case 'church-of-the-east':
            return { storedDefault: 'church-of-the-east', mode: 'east-syriac' };
        case 'eastern-orthodox':
            return { storedDefault: 'eastern-orthodox', mode: 'horologion' };
        case 'oriental-orthodox':
            return { storedDefault: 'oriental-orthodox', mode: 'ethiopian-saatat' };
        case 'universal':
            return { storedDefault: 'universal', mode: 'universal' };
        default:
            return null;
    }
}

function setUserTraditionDefault(tradition) {
    const route = resolveEntryTraditionRoute(tradition);

    if (!route) {
        console.warn('[entry-routing] Unknown tradition default:', tradition);
        showTraditionEntry();
        return;
    }

    persistUserEntryDefault(route.storedDefault);

    if (route.mode === 'universal') {
        showUniversalModeSelection(false);
        return;
    }

    console.info('[entry-routing] Opening tradition route:', route.storedDefault, '→', route.mode);
    selectMode(route.mode);
}

function handleTraditionEntryClick(event) {
    const button = event.target.closest('button');
    const entry = document.getElementById('tradition-entry');

    if (!button || !entry || !entry.contains(button)) return;

    const family = button.dataset.entryFamily;
    const tradition = button.dataset.entryTradition;
    const isBack = button.dataset.entryBack === 'true';

    if (!family && !tradition && !isBack) return;

    event.preventDefault();
    event.stopPropagation();

    if (isBack) {
        selectTraditionFamily(null);
        return;
    }

    if (family) {
        selectTraditionFamily(family);
        return;
    }

    if (tradition) {
        setUserTraditionDefault(tradition);
    }
}

function bindTraditionEntryControls() {
    const entry = document.getElementById('tradition-entry');
    if (!entry || entry.dataset.entryControlsBound === 'true') return;

    entry.addEventListener('click', handleTraditionEntryClick);
    entry.dataset.entryControlsBound = 'true';
}

function resetUserTraditionDefault() {
    clearUserEntryDefault();
    showTraditionEntry();
}

function initializeEntryRouting() {
    bindTraditionEntryControls();
    syncUserProfileControls();
    syncUniversalOfficeAdvancedToolsVisibility();
    scheduleSplashForegroundGuard();

    const entryOverride = new URLSearchParams(window.location.search).get('entry');

    if (entryOverride === 'roman-breviary-dev') {
        showUniversalModeSelection(false);
        selectMode('roman-breviary-dev');
        return;
    }

    if (entryOverride === 'universal') {
        persistUserEntryDefault('universal');
        showUniversalModeSelection(false);
        return;
    }

    const storedDefault = getUserEntryDefault();
    const mode = UNIVERSAL_OFFICE_TRADITION_MODE_MAP[storedDefault];

    if (mode === 'universal') {
        showUniversalModeSelection(false);
        return;
    }

    if (mode) {
        selectMode(mode);
        return;
    }

    showTraditionEntry();
}

window.selectTraditionFamily = selectTraditionFamily;
window.setUserTraditionDefault = setUserTraditionDefault;
window.resetUserTraditionDefault = resetUserTraditionDefault;
window.showTraditionEntry = showTraditionEntry;
window.showUniversalModeSelection = showUniversalModeSelection;
window.getUniversalOfficeUserProfile = getUserProfileDefaults;
window.setUserProfileEntryPageDefault = setUserProfileEntryPageDefault;
window.setUserProfileTraditionDefault = setUserProfileTraditionDefault;
window.setUserProfileBookOfNeedsScope = setUserProfileBookOfNeedsScope;
window.resetUniversalOfficeUserProfile = resetUniversalOfficeUserProfile;
window.openLocalProfileDefaultsFromOffice = openLocalProfileDefaultsFromOffice;
window.focusLocalProfileDefaultsPanel = focusLocalProfileDefaultsPanel;
window.syncUniversalOfficeAdvancedToolsVisibility = syncUniversalOfficeAdvancedToolsVisibility;

document.addEventListener('DOMContentLoaded', initializeEntryRouting);


// ── Office mode headers ──────────────────────────────────────────────────────
// The app shell must name the active office family. "The Universal Office" is
// the selector/project shell, not the title of every tradition page.
const OFFICE_MODE_HEADER_LABELS = {
    daily: 'The Episcopal Church',
    'ethiopian-saatat': 'Oriental Orthodoxy',
    'east-syriac': 'Church of the East',
    horologion: 'Eastern Orthodoxy',
    'roman-breviary-dev': 'Roman Breviary 1960/1962',
    prayers: 'The Book of Needs'
};

function updateOfficeModeHeader(mode) {
    const title = document.getElementById('office-mode-title');
    if (!title) return;

    title.textContent = OFFICE_MODE_HEADER_LABELS[mode] || 'The Universal Office';
}

// ── Book of Needs tradition-context routing ──────────────────────────────────
const BOOK_OF_NEEDS_MODE_CONTEXTS = {
    daily: 'ANG',
    'ethiopian-saatat': 'OO',
    'east-syriac': 'COE',
    horologion: 'EO'
};

function getBookOfNeedsContextForMode(mode) {
    const profile = getUserProfileDefaults();

    if (profile.bookOfNeedsScope === 'universal') {
        return 'UNIVERSAL';
    }

    return BOOK_OF_NEEDS_MODE_CONTEXTS[mode] || 'UNIVERSAL';
}

function getActiveOfficeModeForBookOfNeeds() {
    if (selectedMode && selectedMode !== 'prayers') return selectedMode;

    const storedDefault = getUserEntryDefault();
    const storedMode = UNIVERSAL_OFFICE_TRADITION_MODE_MAP[storedDefault];

    if (storedMode && storedMode !== 'universal' && storedMode !== 'prayers') {
        return storedMode;
    }

    return 'daily';
}

function openBookOfNeedsForActiveOffice() {
    const returnMode = getActiveOfficeModeForBookOfNeeds();
    window._bookOfNeedsReturnMode = returnMode;
    window._bookOfNeedsContextTradition = getBookOfNeedsContextForMode(returnMode);
    selectMode('prayers');
}

function openUniversalBookOfNeeds() {
    window._bookOfNeedsReturnMode = 'universal';
    window._bookOfNeedsContextTradition = 'UNIVERSAL';
    selectMode('prayers');
}

function backFromBookOfNeeds() {
    const returnMode = window._bookOfNeedsReturnMode;

    if (returnMode && returnMode !== 'universal' && returnMode !== 'prayers') {
        window._bookOfNeedsReturnMode = null;
        selectMode(returnMode);
        return;
    }

    window._bookOfNeedsReturnMode = null;
    window._bookOfNeedsContextTradition = 'UNIVERSAL';
    backToSplash();
}

window.openBookOfNeedsForActiveOffice = openBookOfNeedsForActiveOffice;
window.openUniversalBookOfNeeds = openUniversalBookOfNeeds;
window.backFromBookOfNeeds = backFromBookOfNeeds;

// ── Commemoration tradition scoping ──────────────────────────────────────────
// The current commemoration resolver is Anglican/Daily-Office scoped. Until
// Eastern, Oriental, and Church of the East commemoration calendars are routed
// separately, do not show Anglican saint cards inside those offices.
function updateCommemorationVisibilityForMode(mode) {
    const saintSection = document.querySelector('.saint-section');
    const dateHeader = document.getElementById('date-header');
    const saintDisplay = document.getElementById('saint-display');
    const shouldShow = mode === 'daily';

    if (saintSection) {
        saintSection.hidden = !shouldShow;
        saintSection.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
        saintSection.classList.toggle('tradition-commemorations-hidden', !shouldShow);
    }

    if (!shouldShow) {
        if (dateHeader) dateHeader.textContent = '';
        if (saintDisplay) saintDisplay.innerHTML = '';
    }
}

window.updateCommemorationVisibilityForMode = updateCommemorationVisibilityForMode;

// ── Daily Office commemoration card readability ──────────────────────────────
// The current Daily Office commemoration card renderer can emit legacy dark-card
// markup and fused labels such as "ANGSaint". The parchment shell expects the
// commemoration to read as an integrated Daily Office card.
function normalizeCommemorationCardReadability() {
    const display = document.getElementById('saint-display');
    if (!display) return;

    for (const card of display.children) {
        card.classList.add('app-commemoration-card');

        const walker = document.createTreeWalker(
            card,
            window.NodeFilter ? NodeFilter.SHOW_TEXT : 4
        );

        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        for (const text of textNodes) {
            const normalized = text.nodeValue.replace(
                /(^|\s)(ANG|LAT|EOR|OOR|EO|OO|COE|LC)(?=\S)/g,
                '$1$2 '
            );

            if (normalized !== text.nodeValue) {
                text.nodeValue = normalized;
            }
        }
    }
}

function bindCommemorationCardReadabilityObserver() {
    const display = document.getElementById('saint-display');
    if (!display || display.dataset.readabilityObserverBound === 'true') return;

    const observer = new MutationObserver(() => normalizeCommemorationCardReadability());
    observer.observe(display, { childList: true, subtree: true });

    display.dataset.readabilityObserverBound = 'true';
    normalizeCommemorationCardReadability();
}

document.addEventListener('DOMContentLoaded', bindCommemorationCardReadabilityObserver);
window.normalizeCommemorationCardReadability = normalizeCommemorationCardReadability;

async function selectMode(mode) {
    selectedMode = mode;
    updateOfficeModeHeader(mode);
    updateCommemorationVisibilityForMode(mode);

    const splashBg = document.getElementById('splash-bg');
    const modeSelection = document.getElementById('mode-selection');
    const traditionEntry = document.getElementById('tradition-entry');

    if (splashBg) splashBg.style.display = 'none';
    hideEntrySurface(modeSelection);
    hideEntrySurface(traditionEntry);

    document.body.style.display        = '';
    document.body.style.alignItems     = '';
    document.body.style.justifyContent = '';
    document.body.style.height         = '';
    document.body.style.overflowY      = '';
    document.body.classList.add('office-active');

    document.body.classList.remove('ethiopian-theme');
    document.body.classList.toggle('roman-breviary-dev-mode', mode === 'roman-breviary-dev');
    window._forcedOfficeId = undefined;

    // Mode transition invariant: exactly one office drawer is active for the selected mode.
    // All non-active drawers must be both mode-hidden and sidebar-hidden so toggleSidebar()
    // cannot target a stale drawer after cross-tradition navigation.
    const settingsPanel = document.getElementById('settings-panel');
    const ethSettings   = document.getElementById('ethiopian-settings');
    const esySettings   = document.getElementById('east-syriac-settings');
    const genSettings   = document.getElementById('generic-settings');
    const mainContent   = document.getElementById('main-content');

    if (mode === 'prayers') {
        // ── Book of Needs ─────────────────────────────────────────────────────
        // Prayer text is still loaded by prayers.js. The selector is now scoped
        // by the originating tradition unless opened from the Universal selector.
        document.getElementById('daily-office-section').style.display       = 'none';
        document.getElementById('individual-prayers-section').style.display = 'flex';

        if (!window._bookOfNeedsContextTradition) {
            window._bookOfNeedsContextTradition = 'UNIVERSAL';
        }

        if (typeof window.resetBookOfNeedsView === 'function') {
            window.resetBookOfNeedsView();
        }

        if (typeof window.applyBookOfNeedsContext === 'function') {
            window.applyBookOfNeedsContext(window._bookOfNeedsContextTradition);
        }

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
        if (esySettings) {
            esySettings.classList.add('sidebar-hidden');
            esySettings.classList.add('mode-hidden');
        }
        if (genSettings) {
            genSettings.classList.add('sidebar-hidden');
            genSettings.classList.add('mode-hidden');
        }
        if (ethSettings) {
            ethSettings.classList.remove('mode-hidden');
            ethSettings.classList.remove('sidebar-hidden');
        }
        mainContent.classList.remove('sidebar-hidden');

        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Preparing the Sa'atat...</h3><p>Loading the Ethiopian Book of Hours.</p></div>`;

        await hydrateForEthiopianSaatat();
        initializeOfficeDefaultsForCurrentDateTime('ethiopian');
        isHydrationComplete = true;
        requestRender();

    } else if (mode === 'east-syriac') {
        // ── Church of the East ────────────────────────────────────────────────
        document.getElementById('individual-prayers-section').style.display = 'none';
        document.getElementById('daily-office-section').style.display       = 'flex';

        if (settingsPanel) {
            settingsPanel.classList.add('sidebar-hidden');
            settingsPanel.classList.add('mode-hidden');
        }
        if (ethSettings) {
            ethSettings.classList.add('sidebar-hidden');
            ethSettings.classList.add('mode-hidden');
        }
        if (genSettings) {
            genSettings.classList.add('sidebar-hidden');
            genSettings.classList.add('mode-hidden');
        }
        if (esySettings) {
            esySettings.classList.remove('sidebar-hidden');
            esySettings.classList.remove('mode-hidden');
        }
        mainContent.classList.remove('sidebar-hidden');

        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Preparing Ramsha...</h3><p>Loading the Church of the East Evening Prayer.</p></div>`;

        await hydrateForEastSyriac();
        initializeOfficeDefaultsForCurrentDateTime('eastSyriac');
        isHydrationComplete = true;
        requestRender();

    } else if (mode === 'horologion') {
        // ── Horologion — Byzantine Offices ────────────────────────────────────
        // Unified entry point for all Horologion offices. Office selection is
        // handled inside the sidebar via selectHorologionOffice(). On first
        // entry, selectedHorologionOffice defaults to 'vespers'.
        document.getElementById('individual-prayers-section').style.display = 'none';
        document.getElementById('daily-office-section').style.display       = 'flex';

        if (settingsPanel) {
            settingsPanel.classList.add('sidebar-hidden');
            settingsPanel.classList.add('mode-hidden');
        }
        if (ethSettings) {
            ethSettings.classList.add('sidebar-hidden');
            ethSettings.classList.add('mode-hidden');
        }
        if (esySettings) {
            esySettings.classList.add('sidebar-hidden');
            esySettings.classList.add('mode-hidden');
        }
        if (genSettings) {
            genSettings.classList.remove('mode-hidden');
            genSettings.classList.remove('sidebar-hidden');
        }
        mainContent.classList.remove('sidebar-hidden');

        updateGenericDateDisplay();
        _updateHorologionOfficeButtons();
        // v7.1: sync EO mode selector and calendar info line on every Horologion entry
        const _eoSelEntry = document.getElementById('hor-eo-calendar-select');
        if (_eoSelEntry) _eoSelEntry.value = selectedEoMode;
        const _depthSelEntry = document.getElementById('hor-depth-select');
        if (_depthSelEntry) _depthSelEntry.value = selectedHorologionReductionProfile;
        _updateGenericCalendarInfo();

        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Preparing ${_horologionOfficeLabel(selectedHorologionOffice)}…</h3><p>Loading the Byzantine Office.</p></div>`;

        await loadKernel();
        initializeOfficeDefaultsForCurrentDateTime('horologion');
        isHydrationComplete = true;
        requestRender();

    } else if (mode === 'roman-breviary-dev') {
        // ── Roman Breviary 1960/1962 — dev vertical slice ─────────────────────
        // Hidden behind ?advanced=1 in the Universal selector. This route proves
        // the lane pipeline without claiming full Roman Breviary coverage.
        document.getElementById('individual-prayers-section').style.display = 'none';
        document.getElementById('daily-office-section').style.display       = 'flex';

        for (const panel of [settingsPanel, ethSettings, esySettings, genSettings]) {
            if (panel) {
                panel.classList.add('sidebar-hidden');
                panel.classList.add('mode-hidden');
            }
        }

        if (mainContent) {
            mainContent.classList.remove('sidebar-hidden');
        }

        const officeDisplay = document.getElementById('office-display');
        if (officeDisplay) {
            officeDisplay.innerHTML =
                `<div class="office-container"><h3>Preparing Roman Breviary 1960/1962...</h3><p>Loading the pinned Divinum vertical slice.</p></div>`;
        }

        await loadKernel();

        if (!window.RomanBreviary1960DevSlice || typeof window.RomanBreviary1960DevSlice.mountDevSlice !== 'function') {
            if (officeDisplay) {
                officeDisplay.innerHTML =
                    `<div class="office-container"><h3>Roman Breviary dev slice unavailable</h3><p>The Roman Breviary dev module did not load.</p></div>`;
            }
            console.warn('[roman-breviary-dev] RomanBreviary1960DevSlice module unavailable.');
            return;
        }

        try {
            await window.RomanBreviary1960DevSlice.mountDevSlice('office-display', {
                year: 2026,
                date: '2026-11-02',
                hour: 'matins'
            });
            isHydrationComplete = true;
        } catch (err) {
            if (officeDisplay) {
                officeDisplay.innerHTML =
                    `<div class="office-container"><h3>Roman Breviary dev slice failed</h3><p>${err.message}</p></div>`;
            }
            console.error('[roman-breviary-dev] Failed to mount dev slice:', err);
        }

    } else {
        // ── Daily Office (default) ────────────────────────────────────────────
        document.getElementById('individual-prayers-section').style.display = 'none';
        document.getElementById('daily-office-section').style.display       = 'flex';

        if (ethSettings) {
            ethSettings.classList.add('sidebar-hidden');
            ethSettings.classList.add('mode-hidden');
        }
        if (esySettings) {
            esySettings.classList.add('sidebar-hidden');
            esySettings.classList.add('mode-hidden');
        }
        if (genSettings) {
            genSettings.classList.add('sidebar-hidden');
            genSettings.classList.add('mode-hidden');
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
        initializeOfficeDefaultsForCurrentDateTime('daily');
        updateSidebarForOffice();
        isHydrationComplete = true;
        requestRender();
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
    const genPanel = document.getElementById('generic-settings');
    const main     = document.getElementById('main-content');
    const toggle   = document.getElementById('sidebar-toggle');

    let activePanel;
    if (esyPanel && !esyPanel.classList.contains('mode-hidden')) {
        activePanel = esyPanel;
    } else if (ethPanel && !ethPanel.classList.contains('mode-hidden')) {
        activePanel = ethPanel;
    } else if (genPanel && !genPanel.classList.contains('mode-hidden')) {
        activePanel = genPanel;
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
  if (selectedMode === 'horologion') updateGenericDateDisplay();
    requestRender();
}
function resetDate() {
    currentDate = new Date();
    updateDatePicker();
  if (selectedMode === 'horologion') updateGenericDateDisplay();
    requestRender();
}
function updateDatePicker() {
    const year  = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day   = String(currentDate.getDate()).padStart(2, '0');
    const picker = document.getElementById('date-picker');
    if (picker) picker.value = `${year}-${month}-${day}`;
}
function updateGenericDateDisplay() {
    // Syncs #generic-settings date widgets with currentDate.
    // Called by changeDate(), resetDate(), setCustomDate() when
    // selectedMode === 'horologion'. Zero cost in all other modes.
    const year  = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day   = String(currentDate.getDate()).padStart(2, '0');

    const displayEl = document.getElementById('generic-display-date');
    const pickerEl  = document.getElementById('generic-date-picker');
    const infoEl    = document.getElementById('generic-calendar-info');

    if (displayEl) {
        displayEl.textContent = currentDate.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
    if (pickerEl) {
        pickerEl.value = `${year}-${month}-${day}`;
    }
    if (infoEl) {
        // v7.1: show active EO calendar mode rather than mirroring stale BCP info
        _updateGenericCalendarInfo();
    }
}
function setCustomDate(dateStr) {
    if (dateStr) {
        const [year, month, day] = dateStr.split('-');
        currentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    updateDatePicker();
    if (selectedMode === 'horologion') updateGenericDateDisplay();
    requestRender();
}



// ── Shared Office Navigation Apparatus ───────────────────────────────────────
// One control grammar for all office traditions:
// date navigation + date picker + hour/office selection.
// Tradition-specific words are allowed; interaction structure is not.
const SHARED_OFFICE_NAVIGATOR_CONFIGS = {
    daily: {
        panelId: "settings-panel",
        heading: "Office Navigation",
        dateTitle: "Date",
        datePickerLabel: "Select Date",
        officeTitle: "Time of Day",
        hideSelectors: [".ordo-control"],
        hideHeadings: ["Time of Day"],
        options: [
            { value: "morning-office", label: "Morning Prayer", detail: "Morning" },
            { value: "noonday-office", label: "Noonday Prayer", detail: "Midday" },
            { value: "evening-office", label: "Evening Prayer", detail: "Evening" },
            { value: "compline-office", label: "Compline", detail: "Night" },
        ],
    },
    ethiopian: {
        panelId: "ethiopian-settings",
        heading: "Sa'atat Navigation",
        dateTitle: "Date",
        datePickerLabel: "Select Date",
        officeTitle: "Canonical Watch",
        hideSelectors: ["#eth-override-panel"],
        hideHeadings: ["Active Watch"],
        hideButtonRowsAfterHeadings: ["Active Watch"],
        options: [
            { value: "eth-nigatu-hour-text", label: "Nigatu — ንጋቱ", detail: "Matins · 06:00–09:00" },
            { value: "eth-meserk-hour-text", label: "Mese'rk — መሠርቅ", detail: "Third Hour · 09:00–12:00" },
            { value: "eth-lika-hour-text", label: "Lika — ሊካ", detail: "Sixth Hour · 12:00–15:00" },
            { value: "eth-terk-hour-text", label: "Tese'at — ተሰዓት", detail: "Ninth Hour · 15:00–17:00" },
            { value: "eth-serkh-hour-text", label: "Serkh — ሠርክ", detail: "Vespers · 17:00–18:00" },
            { value: "eth-nome-hour-text", label: "Nime — ኖሜ", detail: "Compline · 18:00–21:00" },
            { value: "eth-hour-7", label: "Le'lit", detail: "First Night Watch · 21:00–00:00" },
            { value: "eth-lelit-hour-text", label: "Le'lit — ሌሊት", detail: "Midnight · 00:00–03:00" },
            { value: "eth-mahlet-hour-text", label: "Mahlet — ማህሌት", detail: "Pre-dawn Vigil · 03:00–06:00" },
        ],
    },
    eastSyriac: {
        panelId: "east-syriac-settings",
        heading: "Hudra Navigation",
        dateTitle: "Date",
        datePickerLabel: "Select Date",
        officeTitle: "Canonical Hour",
        hideSelectors: ["#esy-override-panel"],
        hideHeadings: ["Active Hour"],
        hideButtonRowsAfterHeadings: ["Active Hour"],
        options: [
            { value: "sapra", label: "Sapra", detail: "Morning Prayer · 06:00–09:00" },
            { value: "qutaa", label: "Quta'a", detail: "Third Hour · 09:00–12:00" },
            { value: "endana", label: "Endana", detail: "Sixth Hour · 12:00–15:00" },
            { value: "dtsha-sain", label: "D-tsha' Sa'in", detail: "Ninth Hour · 15:00–18:00" },
            { value: "ramsha", label: "Ramsha", detail: "Evening Prayer · 18:00–21:00" },
            { value: "lelya", label: "Lelya", detail: "Night Office · 21:00–03:00" },
            { value: "subaa", label: "Suba'a", detail: "Pre-dawn · 03:00–06:00" },
        ],
    },
    horologion: {
        panelId: "generic-settings",
        heading: "Horologion Navigation",
        dateTitle: "Date",
        datePickerLabel: "Select Date",
        officeTitle: "Office",
        hideSelectors: [".ordo-control"],
        hideNestedHeadings: ["Office"],
        options: [
            { value: "vespers", label: "Vespers", detail: "Evening" },
            { value: "small-compline", label: "Small Compline", detail: "Night" },
            { value: "great-compline", label: "Great Compline", detail: "Night" },
            { value: "midnight-office", label: "Midnight Office", detail: "Midnight" },
            { value: "orthros", label: "Orthros", detail: "Matins" },
            { value: "first-hour", label: "First Hour", detail: "Early morning" },
            { value: "third-hour", label: "Third Hour", detail: "Mid-morning" },
            { value: "sixth-hour", label: "Sixth Hour", detail: "Midday" },
            { value: "ninth-hour", label: "Ninth Hour", detail: "Afternoon" },
            { value: "typika", label: "Typika", detail: "Reader service" },
            { value: "interhour-first", label: "Interhour of the First Hour", detail: "Interhour" },
            { value: "interhour-third", label: "Interhour of the Third Hour", detail: "Interhour" },
            { value: "interhour-sixth", label: "Interhour of the Sixth Hour", detail: "Interhour" },
            { value: "interhour-ninth", label: "Interhour of the Ninth Hour", detail: "Interhour" },
        ],
    },
};

function _sharedOfficeNavigatorModeKey() {
    if (selectedMode === "ethiopian-saatat") return "ethiopian";
    if (selectedMode === "east-syriac") return "eastSyriac";
    if (selectedMode === "horologion") return "horologion";
    if (selectedMode === "daily" || !selectedMode) return "daily";
    return null;
}

function _sharedOfficeNavigatorIsoDate(date) {
    const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function _sharedOfficeNavigatorReadableDate() {
    const d = currentDate instanceof Date && !Number.isNaN(currentDate.getTime()) ? currentDate : new Date();
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function _sharedOfficeNavigatorEscape(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function _sharedOfficeNavigatorActiveValue(modeKey) {
    if (modeKey === "daily") {
        return document.querySelector('input[name="office-time"]:checked')?.value || "morning-office";
    }
    if (modeKey === "ethiopian") {
        return window._temporalOverride?.hourId || getEthiopianHourInfo().hourId;
    }
    if (modeKey === "eastSyriac") {
        return window._esyTemporalOverride?.hourId || getEastSyriacHourInfo().value;
    }
    if (modeKey === "horologion") {
        return selectedHorologionOffice || "vespers";
    }
    return "";
}

function _sharedOfficeNavigatorCleanLine(value) {
    const text = String(value || "").trim();
    if (!text || text === "—" || /^loading/i.test(text)) return "";
    return text;
}

function _sharedOfficeNavigatorCurrentLine(modeKey) {
    if (modeKey === "ethiopian") {
        const watch = _sharedOfficeNavigatorCleanLine(document.getElementById("eth-active-watch-label")?.textContent);
        const date = _sharedOfficeNavigatorCleanLine(document.getElementById("eth-active-date-label")?.textContent);
        return [watch, date].filter(Boolean).join(" · ") || _sharedOfficeNavigatorReadableDate();
    }
    if (modeKey === "eastSyriac") {
        const hour = _sharedOfficeNavigatorCleanLine(document.getElementById("esy-active-hour-label")?.textContent);
        const date = _sharedOfficeNavigatorCleanLine(document.getElementById("esy-active-date-label")?.textContent);
        return [hour, date].filter(Boolean).join(" · ") || _sharedOfficeNavigatorReadableDate();
    }
    if (modeKey === "horologion") {
        return _sharedOfficeNavigatorCleanLine(document.getElementById("generic-display-date")?.textContent) || _sharedOfficeNavigatorReadableDate();
    }
    return _sharedOfficeNavigatorCleanLine(document.getElementById("display-date")?.textContent) || _sharedOfficeNavigatorReadableDate();
}

function _sharedOfficeNavigatorRestoreLegacyElement(el) {
    if (!(el instanceof HTMLElement)) return;

    el.classList.remove("shared-office-nav-legacy-hidden");
    el.removeAttribute("aria-hidden");
    el.removeAttribute("data-shared-office-nav-retired");
    delete el.dataset.sharedOfficeNavRetired;

    if (el.dataset.sharedOfficeLegacyDisplay !== undefined) {
        el.style.display = el.dataset.sharedOfficeLegacyDisplay;
        delete el.dataset.sharedOfficeLegacyDisplay;
    } else {
        el.style.removeProperty("display");
    }

    if (el.dataset.sharedOfficeLegacyVisibility !== undefined) {
        el.style.visibility = el.dataset.sharedOfficeLegacyVisibility;
        delete el.dataset.sharedOfficeLegacyVisibility;
    } else {
        el.style.removeProperty("visibility");
    }

    if (el.dataset.sharedOfficeLegacyPointerEvents !== undefined) {
        el.style.pointerEvents = el.dataset.sharedOfficeLegacyPointerEvents;
        delete el.dataset.sharedOfficeLegacyPointerEvents;
    } else {
        el.style.removeProperty("pointer-events");
    }

    if (el.dataset.sharedOfficeLegacyTabIndex !== undefined) {
        if (el.dataset.sharedOfficeLegacyTabIndex === "") {
            el.removeAttribute("tabindex");
        } else {
            el.setAttribute("tabindex", el.dataset.sharedOfficeLegacyTabIndex);
        }
        delete el.dataset.sharedOfficeLegacyTabIndex;
    } else {
        el.removeAttribute("tabindex");
    }

    if (el.dataset.sharedOfficeLegacyDisabled !== "true" && "disabled" in el) {
        el.disabled = false;
    }
    delete el.dataset.sharedOfficeLegacyDisabled;

    try {
        el.inert = false;
    } catch (_error) {
        el.removeAttribute("inert");
    }
}

function _sharedOfficeNavigatorRetireLegacyElement(el) {
    if (!(el instanceof HTMLElement)) return;

    if (el.closest(".shared-office-nav")) return;

    if (el.style.display && el.dataset.sharedOfficeLegacyDisplay === undefined) {
        el.dataset.sharedOfficeLegacyDisplay = el.style.display;
    }
    if (el.style.visibility && el.dataset.sharedOfficeLegacyVisibility === undefined) {
        el.dataset.sharedOfficeLegacyVisibility = el.style.visibility;
    }
    if (el.style.pointerEvents && el.dataset.sharedOfficeLegacyPointerEvents === undefined) {
        el.dataset.sharedOfficeLegacyPointerEvents = el.style.pointerEvents;
    }
    if (el.hasAttribute("tabindex") && el.dataset.sharedOfficeLegacyTabIndex === undefined) {
        el.dataset.sharedOfficeLegacyTabIndex = el.getAttribute("tabindex") || "";
    }
    if (el.hasAttribute("disabled") && el.dataset.sharedOfficeLegacyDisabled === undefined) {
        el.dataset.sharedOfficeLegacyDisabled = "true";
    }

    el.classList.add("shared-office-nav-legacy-hidden");
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("data-shared-office-nav-retired", "true");
    el.dataset.sharedOfficeNavRetired = "true";
    el.tabIndex = -1;
    el.style.display = "none";
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";

    try {
        el.inert = true;
    } catch (_error) {
        el.setAttribute("inert", "");
    }

    if ("disabled" in el) {
        el.disabled = true;
    }

    el.querySelectorAll("a, button, input, select, textarea, summary, [tabindex]").forEach(child => {
        if (!(child instanceof HTMLElement)) return;

        if (child.hasAttribute("tabindex") && child.dataset.sharedOfficeLegacyTabIndex === undefined) {
            child.dataset.sharedOfficeLegacyTabIndex = child.getAttribute("tabindex") || "";
        }
        if (child.hasAttribute("disabled") && child.dataset.sharedOfficeLegacyDisabled === undefined) {
            child.dataset.sharedOfficeLegacyDisabled = "true";
        }

        child.setAttribute("aria-hidden", "true");
        child.setAttribute("data-shared-office-nav-retired", "true");
        child.tabIndex = -1;

        if ("disabled" in child) {
            child.disabled = true;
        }
    });
}

function _sharedOfficeNavigatorHideLegacy(panel, config) {
    panel.querySelectorAll(".shared-office-nav-legacy-hidden[data-shared-office-nav-retired='true']").forEach(_sharedOfficeNavigatorRestoreLegacyElement);

    const legacyElements = new Set();

    for (const selector of config.hideSelectors || []) {
        panel.querySelectorAll(selector).forEach(el => legacyElements.add(el));
    }

    for (const heading of config.hideHeadings || []) {
        Array.from(panel.children).forEach(el => {
            if (el.classList?.contains("setting-group") && el.textContent.trim().toLowerCase().includes(heading.toLowerCase())) {
                legacyElements.add(el);
            }
        });
    }

    for (const heading of config.hideButtonRowsAfterHeadings || []) {
        const groups = Array.from(panel.children);
        for (let i = 0; i < groups.length; i++) {
            const el = groups[i];
            if (el.classList?.contains("setting-group") && el.textContent.trim().toLowerCase().includes(heading.toLowerCase())) {
                const next = groups[i + 1];
                if (next?.classList?.contains("ordo-buttons")) legacyElements.add(next);
            }
        }
    }

    for (const heading of config.hideNestedHeadings || []) {
        panel.querySelectorAll(".nested-group").forEach(el => {
            const strong = el.querySelector("strong");
            if (strong && strong.textContent.trim().toLowerCase() === heading.toLowerCase()) {
                legacyElements.add(el);
            }
        });
    }

    legacyElements.forEach(_sharedOfficeNavigatorRetireLegacyElement);
}

function renderSharedOfficeNavigation() {
    const modeKey = _sharedOfficeNavigatorModeKey();
    if (!modeKey) return;

    const config = SHARED_OFFICE_NAVIGATOR_CONFIGS[modeKey];
    const panel = document.getElementById(config.panelId);
    if (!panel || panel.classList.contains("mode-hidden")) return;

    _sharedOfficeNavigatorHideLegacy(panel, config);

    let nav = panel.querySelector(".shared-office-nav");
    if (!nav) {
        nav = document.createElement("div");
        nav.className = "shared-office-nav";
        const heading = panel.querySelector("h3");
        if (heading?.parentNode) {
            heading.insertAdjacentElement("afterend", nav);
        } else {
            panel.prepend(nav);
        }
    }

    const activeValue = _sharedOfficeNavigatorActiveValue(modeKey);
    const currentLine = _sharedOfficeNavigatorCurrentLine(modeKey);
    const isoDate = _sharedOfficeNavigatorIsoDate(currentDate);

    const optionHtml = config.options.map(option => {
        const checked = option.value === activeValue ? "checked" : "";
        return `
            <label class="shared-office-nav-option">
                <input type="radio"
                    name="shared-office-nav-${modeKey}"
                    value="${_sharedOfficeNavigatorEscape(option.value)}"
                    ${checked}
                    onchange="setSharedOfficeNavHour('${modeKey}', this.value)">
                <span class="shared-office-nav-option-copy">
                    <span class="shared-office-nav-option-label">${_sharedOfficeNavigatorEscape(option.label)}</span>
                    <span class="shared-office-nav-option-detail">${_sharedOfficeNavigatorEscape(option.detail || "")}</span>
                </span>
            </label>`;
    }).join("");

    nav.dataset.sharedOfficeNav = modeKey;
    nav.innerHTML = `
        <section class="shared-office-nav-card shared-office-nav-date-card">
            <div class="shared-office-nav-section-title">${_sharedOfficeNavigatorEscape(config.dateTitle)}</div>
            <div class="shared-office-nav-current">${_sharedOfficeNavigatorEscape(currentLine)}</div>
            <div class="shared-office-nav-actions" aria-label="${_sharedOfficeNavigatorEscape(config.dateTitle)} navigation">
                <button type="button" onclick="changeSharedOfficeNavDate('${modeKey}', -1)">Prev</button>
                <button type="button" onclick="todaySharedOfficeNavDate('${modeKey}')">Today</button>
                <button type="button" onclick="changeSharedOfficeNavDate('${modeKey}', 1)">Next</button>
            </div>
            <label class="shared-office-nav-date-picker">
                <span>${_sharedOfficeNavigatorEscape(config.datePickerLabel)}</span>
                <input type="date"
                    value="${isoDate}"
                    onchange="setSharedOfficeNavDate('${modeKey}', this.value)">
            </label>
        </section>
        <section class="shared-office-nav-card shared-office-nav-hour-card">
            <div class="shared-office-nav-section-title">${_sharedOfficeNavigatorEscape(config.officeTitle)}</div>
            <div class="shared-office-nav-options" role="radiogroup" aria-label="${_sharedOfficeNavigatorEscape(config.officeTitle)}">
                ${optionHtml}
            </div>
        </section>`;
}

function setSharedOfficeNavHour(modeKey, value) {
    if (modeKey === "daily") {
        const radio = document.querySelector(`input[name="office-time"][value="${CSS.escape(value)}"]`);
        if (radio) radio.checked = true;
        updateSidebarForOffice();
        saveSettings();
        requestRender();
        return;
    }

    if (modeKey === "ethiopian") {
        const picker = document.getElementById("eth-override-date");
        if (picker && !picker.value) picker.value = _sharedOfficeNavigatorIsoDate(currentDate);
        const radio = document.querySelector(`input[name="eth-watch-override"][value="${CSS.escape(value)}"]`);
        if (radio) radio.checked = true;
        applyEthOverride();
        return;
    }

    if (modeKey === "eastSyriac") {
        const picker = document.getElementById("esy-override-date");
        if (picker && !picker.value) picker.value = _sharedOfficeNavigatorIsoDate(currentDate);
        const radio = document.querySelector(`input[name="esy-hour-override"][value="${CSS.escape(value)}"]`);
        if (radio) radio.checked = true;
        applyEsyOverride();
        return;
    }

    if (modeKey === "horologion") {
        selectHorologionOffice(value);
    }
}


function _sharedOfficeNavigatorDateFromIso(dateValue) {
    const parts = String(dateValue || "").split("-").map(Number);
    if (parts.length !== 3 || parts.some(n => !Number.isFinite(n))) return null;
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
}

function setSharedOfficeNavDate(modeKey, dateValue) {
    if (!dateValue) return;

    if (modeKey === "daily" || modeKey === "horologion") {
        setCustomDate(dateValue);
        renderSharedOfficeNavigation();
        return;
    }

    if (modeKey === "ethiopian") {
        const targetDate = _sharedOfficeNavigatorDateFromIso(dateValue);
        if (!targetDate) return;

        const hourId = _sharedOfficeNavigatorActiveValue("ethiopian") || getEthiopianHourInfo().hourId;
        currentDate = targetDate;
        updateDatePicker();

        const picker = document.getElementById("eth-override-date");
        if (picker) picker.value = dateValue;

        const radio = document.querySelector(`input[name="eth-watch-override"][value="${CSS.escape(hourId)}"]`);
        if (radio) radio.checked = true;

        window._temporalOverride = { active: true, date: targetDate, hourId };
        requestRender();
        renderSharedOfficeNavigation();
        return;
    }

    if (modeKey === "eastSyriac") {
        const targetDate = _sharedOfficeNavigatorDateFromIso(dateValue);
        if (!targetDate) return;

        const hourId = _sharedOfficeNavigatorActiveValue("eastSyriac") || getEastSyriacHourInfo().value;
        currentDate = targetDate;
        updateDatePicker();

        const picker = document.getElementById("esy-override-date");
        if (picker) picker.value = dateValue;

        const radio = document.querySelector(`input[name="esy-hour-override"][value="${CSS.escape(hourId)}"]`);
        if (radio) radio.checked = true;

        window._esyTemporalOverride = { active: true, date: targetDate, hourId };
        requestRender();
        renderSharedOfficeNavigation();
    }
}


function _sharedOfficeNavigatorAddDaysIso(days) {
    const base = currentDate instanceof Date && !Number.isNaN(currentDate.getTime()) ? currentDate : new Date();
    const next = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    next.setDate(next.getDate() + Number(days || 0));
    return _sharedOfficeNavigatorIsoDate(next);
}

function changeSharedOfficeNavDate(modeKey, days) {
    const targetIso = _sharedOfficeNavigatorAddDaysIso(days);
    setSharedOfficeNavDate(modeKey, targetIso);
    renderSharedOfficeNavigation();
}

function todaySharedOfficeNavDate(modeKey) {
    if (modeKey === "ethiopian") {
        currentDate = new Date();
        updateDatePicker();

        const picker = document.getElementById("eth-override-date");
        if (picker) picker.value = _sharedOfficeNavigatorIsoDate(currentDate);

        window._temporalOverride = { active: false, date: null, hourId: null };
        document.querySelectorAll('input[name="eth-watch-override"]').forEach(r => r.checked = false);

        requestRender();
        renderSharedOfficeNavigation();
        return;
    }

    if (modeKey === "eastSyriac") {
        currentDate = new Date();
        updateDatePicker();

        const picker = document.getElementById("esy-override-date");
        if (picker) picker.value = _sharedOfficeNavigatorIsoDate(currentDate);

        window._esyTemporalOverride = { active: false, date: null, hourId: null };
        document.querySelectorAll('input[name="esy-hour-override"]').forEach(r => r.checked = false);

        requestRender();
        renderSharedOfficeNavigation();
        return;
    }

    const todayIso = _sharedOfficeNavigatorIsoDate(new Date());
    setSharedOfficeNavDate(modeKey, todayIso);
    renderSharedOfficeNavigation();
}

window.renderSharedOfficeNavigation = renderSharedOfficeNavigation;
window.setSharedOfficeNavHour = setSharedOfficeNavHour;
window.setSharedOfficeNavDate = setSharedOfficeNavDate;
window.changeSharedOfficeNavDate = changeSharedOfficeNavDate;
window.todaySharedOfficeNavDate = todaySharedOfficeNavDate;


// ── Current Date / Current Hour Defaults ─────────────────────────────────────
// On first entry into an office mode, the app should begin at today's civil date
// and the prayer/watch/hour appropriate to the browser's current local time.
// Persisted preference settings may affect rite/display options, but must not
// make yesterday's date or a stale office-time selection the app default.
function _defaultDailyOfficeForCurrentTime(now = new Date()) {
    const hour = now.getHours();
    if (hour >= 5 && hour < 11) return "morning-office";
    if (hour >= 11 && hour < 15) return "noonday-office";
    if (hour >= 15 && hour < 21) return "evening-office";
    return "compline-office";
}

function _defaultHorologionOfficeForCurrentTime(now = new Date()) {
    const hour = now.getHours();
    if (hour >= 0 && hour < 3) return "midnight-office";
    if (hour >= 3 && hour < 5) return "orthros";
    if (hour >= 5 && hour < 7) return "first-hour";
    if (hour >= 7 && hour < 11) return "third-hour";
    if (hour >= 11 && hour < 15) return "sixth-hour";
    if (hour >= 15 && hour < 17) return "ninth-hour";
    if (hour >= 17 && hour < 21) return "vespers";
    return "small-compline";
}

function initializeOfficeDefaultsForCurrentDateTime(modeKey) {
    const now = new Date();
    currentDate = now;

    updateDatePicker();

    const isoToday = _sharedOfficeNavigatorIsoDate(now);

    const ethPicker = document.getElementById("eth-override-date");
    if (ethPicker) ethPicker.value = isoToday;

    const esyPicker = document.getElementById("esy-override-date");
    if (esyPicker) esyPicker.value = isoToday;

    const genericPicker = document.getElementById("generic-date-picker");
    if (genericPicker) genericPicker.value = isoToday;

    if (modeKey === "daily") {
        const office = _defaultDailyOfficeForCurrentTime(now);
        const radio = document.querySelector(`input[name="office-time"][value="${CSS.escape(office)}"]`);
        if (radio) radio.checked = true;
        updateSidebarForOffice();
    }

    if (modeKey === "ethiopian") {
        window._temporalOverride = { active: false, date: null, hourId: null };
        document.querySelectorAll('input[name="eth-watch-override"]').forEach(r => r.checked = false);
    }

    if (modeKey === "eastSyriac") {
        window._esyTemporalOverride = { active: false, date: null, hourId: null };
        document.querySelectorAll('input[name="esy-hour-override"]').forEach(r => r.checked = false);
        const autoHour = getEastSyriacHourInfo();
        const mainRadio = document.querySelector(`input[name="esy-time"][value="${CSS.escape(autoHour.value)}"]`);
        if (mainRadio) mainRadio.checked = true;
    }

    if (modeKey === "horologion") {
        selectedHorologionOffice = _defaultHorologionOfficeForCurrentTime(now);
        updateGenericDateDisplay();
        _updateHorologionOfficeButtons();
    }

    renderSharedOfficeNavigation();
}

window.initializeOfficeDefaultsForCurrentDateTime = initializeOfficeDefaultsForCurrentDateTime;

// ── Horologion office selector ────────────────────────────────────────────

function selectHorologionOffice(officeKey) {
    selectedHorologionOffice = officeKey;
    _updateHorologionOfficeButtons();
    requestRender();
}

function _updateHorologionOfficeButtons() {
    const keys = [
        'vespers',
        'small-compline',
        'great-compline',
        'midnight-office',
        'orthros',
        'first-hour',
        'third-hour',
        'sixth-hour',
        'ninth-hour',
        'typika',
        'interhour-first',
        'interhour-third',
        'interhour-sixth',
        'interhour-ninth'
    ];

    keys.forEach(key => {
        const input = document.getElementById(`hor-btn-${key}`);
        if (!input) return;

        const isActive = key === selectedHorologionOffice;
        input.checked = isActive;

        const row = input.closest('.hor-office-option');
        if (row) row.classList.toggle('is-active', isActive);
    });
}

function _horologionOfficeLabel(officeKey) {
   const labels = {
        'vespers':        'Vespers',
        'small-compline': 'Small Compline',
        'first-hour':     'First Hour',
        'third-hour':     'Third Hour',
        'sixth-hour':     'Sixth Hour',
        'ninth-hour':     'Ninth Hour',
  'orthros':         'Orthros (Matins)',
'midnight-office': 'Midnight Office',
'great-compline':  'Great Compline',
'typika':          'Typika (Obednitsa)',
'interhour-first': 'Interhour of the First Hour',
'interhour-third': 'Interhour of the Third Hour',
'interhour-sixth': 'Interhour of the Sixth Hour',
'interhour-ninth': 'Interhour of the Ninth Hour'
    };
    return labels[officeKey] || officeKey;
}

// ── v8.0: Horologion display-depth reduction profiles ────────────────────────
// Allowed values: 'full' | 'reader' | 'educational'. Default: 'full'.
// State persists in universalOfficeSettings.horologionReductionProfile.
// Profile is NEVER passed to HorologionEngine.resolveOffice().

function selectHorologionReductionProfile(profile) {
    const ALLOWED = ['full', 'reader', 'educational'];
    if (!ALLOWED.includes(profile)) {
        console.warn('[selectHorologionReductionProfile] Unknown profile:', profile);
        return;
    }
    selectedHorologionReductionProfile = profile;
    saveSettings();
    if (selectedMode === 'horologion') requestRender();
}

// Expose for inline HTML onchange and browser-console QC.
window.selectHorologionReductionProfile = selectHorologionReductionProfile;

// Returns true if item is a release-honesty notice that must never be collapsed.
function _isHonestyNotice(item) {
    if (item.type === 'rubric' || item.type === 'placeholder') return true;
    const HONESTY_KEYWORDS = [
        'source-unavailable', 'text-unavailable', 'deferred', 'not-appointed',
        'displaced', 'displacement', 'special-form', 'menaion', 'rank3', 'feast',
        'no-liturgy', 'unavailable', 'pending', 'appointed'
    ];
    const haystack = [
        String(item.resolvedAs || ''),
        String(item.text       || ''),
        String(item.note       || ''),
        String(item.label      || ''),
        String(item.key        || '')
    ].join('  ').toLowerCase();
    return HONESTY_KEYWORDS.some(kw => haystack.includes(kw));
}

// Wraps body HTML in a disclosure control for reader/educational profiles.
// Full profile and honesty notices always return html unchanged.
function _horologionBodyWrap(html, item, summaryLabel) {
    const profile = selectedHorologionReductionProfile;
    if (profile === 'full') return html;
    if (_isHonestyNotice(item)) return html;

    // Reader: collapse kathismata and genuinely long body text only.
    // This preserves short fixed prayers/sequences needed for ordinary lay use.
    // Educational: collapse broad body-text categories while preserving honesty notices.
    const EDUC_TYPES = new Set(['kathisma', 'psalm', 'sequence', 'stichera', 'text']);

    const plainHtml = String(html || '').replace(/<[^>]*>/g, ' ');
    const textLen   = Math.max(String(item.text || '').length, plainHtml.length);
    const childCnt  = Array.isArray(item.items) ? item.items.length : 0;
    const isLong    = item.type === 'kathisma' || textLen > 1400 || childCnt > 8;
    const readerCollapsibleType =
        item.type === 'kathisma' || item.type === 'psalm' || item.type === 'stichera' || item.type === 'text' || item.type === 'sequence';

    const shouldCollapse =
        (profile === 'reader'      && readerCollapsibleType && isLong) ||
        (profile === 'educational' && (EDUC_TYPES.has(item.type) || !item.type));

    if (!shouldCollapse) return html;

    const raw  = String(summaryLabel || item.label || item.key || 'Show text');
    const safe = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<details class="hor-depth-disclosure">`
         + `<summary class="rubric-text" style="cursor:pointer;">${safe}</summary>`
         + html
         + `</details>`;
}

// ── Tradition sidebar compatibility wrappers ──────────────────────────────
// index.html sidebar buttons for Ethiopian and East Syriac use these names.
// All delegate to the shared date helpers — no logic lives here.
function ethChangeDate(days) { changeDate(days); }
function ethToday()          { resetDate();      }
function esyChangeDate(days) { changeDate(days); }
function esyToday()          { resetDate();      }

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
    requestRender();
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
        rotateMissionPrayer: document.getElementById('toggle-rotate-mission-prayer')?.checked ?? true,
        psalter30Day:        document.getElementById('toggle-30day-psalter')?.checked || false,
        generalThanksgiving: document.getElementById('toggle-general-thanksgiving')?.checked || false,
        chrysostom:          document.getElementById('toggle-chrysostom')?.checked || false,
        prayerBeforeReading: document.getElementById('toggle-prayer-before-reading')?.checked || false,
        examen:              document.getElementById('toggle-examen')?.checked || false,
        kyriePantocrator:    document.getElementById('toggle-kyrie-pantocrator')?.checked || false,
        studyMode:                     appSettings.studyMode,
        eoMode:                        selectedEoMode,
        horologionReductionProfile:    selectedHorologionReductionProfile
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
        setChk('toggle-rotate-mission-prayer', s.rotateMissionPrayer !== false);
        setChk('toggle-30day-psalter',         s.psalter30Day);
        setChk('toggle-general-thanksgiving',  s.generalThanksgiving);
        setChk('toggle-chrysostom',            s.chrysostom);
        setChk('toggle-prayer-before-reading', s.prayerBeforeReading);
        setChk('toggle-examen',                s.examen);
        setChk('toggle-kyrie-pantocrator',     s.kyriePantocrator);

        if (typeof s.studyMode === 'boolean') {
            appSettings.studyMode = s.studyMode;
        }

        // v7.1: restore EO calendar mode
        if (typeof s.eoMode === 'string' &&
            (s.eoMode === 'new_calendar' || s.eoMode === 'old_calendar')) {
            selectedEoMode = s.eoMode;
            const eoSelLoad = document.getElementById('hor-eo-calendar-select');
            if (eoSelLoad) eoSelLoad.value = selectedEoMode;
        }

        // v8.0: restore Horologion display-depth profile
        if (typeof s.horologionReductionProfile === 'string' &&
            ['full', 'reader', 'educational'].includes(s.horologionReductionProfile)) {
            selectedHorologionReductionProfile = s.horologionReductionProfile;
            const _depthSelLoad = document.getElementById('hor-depth-select');
            if (_depthSelLoad) _depthSelLoad.value = selectedHorologionReductionProfile;
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

// ── Saints Resolver ────────────────────────────────────────────────────────────────
// Canonical saints boundary. All logic lives in js/saints-resolver.js (SaintsResolver).
// Local aliases keep call-sites in this file unchanged.

const saintOccursOnDate    = SaintsResolver.saintOccursOnDate;
const saintAppliesToContext = SaintsResolver.saintAppliesToContext;
const isDerivedEcumenical  = SaintsResolver.isDerivedEcumenical;

// ── Centralized tradition display labels ────────────────────────────────────
// All badge rendering MUST derive human-visible text from this map.
// Internal logic (filtering, matching) must use internal codes only — never
// the display label.  ECU is a derived state (all five codes present); it is
// never stored but always displayed as 'ECU'.
const TRADITION_DISPLAY_LABELS = {
    ANG: 'ANG',
    LAT: 'LAT',
    EOR: 'EOR',
    OOR: 'OOR',
    COE: 'COE',
    ECU: 'ECU',  // derived ecumenical — display label is the internal code
};

/** Return the badge display label for a given internal tradition code. */
function getTraditionDisplayLabel(code) {
    return TRADITION_DISPLAY_LABELS[code] || code;
}

/**
 * Canonical saints read path for the office renderers.
 * Thin wrapper around SaintsResolver.resolveCommemorations.
 * All caching and filtering is owned by SaintsResolver.
 *
 * @param {Date}   date
 * @param {string} tradition  - 'ANG' | 'LAT' | 'EOR' | 'OOR' | 'COE'
 * @param {object} [opts]
 * @returns {Promise<Array>}
 */
async function resolveCommemorations(date, tradition, opts) {
    return SaintsResolver.resolveCommemorations(date, tradition, opts);
}

const DAILY_OFFICE_RESOURCE_TIMEOUT_MS = 6500;
const DAILY_OFFICE_COMMENORATION_TIMEOUT_MS = 2500;

async function withDailyOfficeTimeout(promise, label, timeoutMs = DAILY_OFFICE_RESOURCE_TIMEOUT_MS, fallback = null) {
    let timeoutId = null;

    const timeout = new Promise(resolve => {
        timeoutId = setTimeout(() => {
            console.warn(`[daily-office] ${label} timed out after ${timeoutMs}ms.`);
            resolve(fallback);
        }, timeoutMs);
    });

    try {
        return await Promise.race([promise, timeout]);
    } catch (error) {
        console.warn(`[daily-office] ${label} failed:`, error);
        return fallback;
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

async function fetchDailyOfficeResource(url, timeoutMs = DAILY_OFFICE_RESOURCE_TIMEOUT_MS) {
    const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    const timeoutId = controller
        ? setTimeout(() => controller.abort(), timeoutMs)
        : null;

    try {
        const options = controller ? { signal: controller.signal } : undefined;
        return await fetch(url, options);
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

async function preloadDailyOfficeCommemorations(date, tradition) {
    const commemorations = await withDailyOfficeTimeout(
        resolveCommemorations(date, tradition),
        'Daily Office commemoration preload',
        DAILY_OFFICE_COMMENORATION_TIMEOUT_MS,
        []
    );

    return Array.isArray(commemorations) ? commemorations : [];
}


function requestRender() {
  if (typeof renderSharedOfficeNavigation === 'function') {
    renderSharedOfficeNavigation();
  }
  pendingRender = true;

  if (!renderScheduled) {
    renderScheduled = true;
    Promise.resolve().then(flushRender);
  }
}

async function flushRender() {
  renderScheduled = false;

  if (!pendingRender) return;
  pendingRender = false;

  if (activeRender) {
    await activeRender;
  }

  activeRender = Promise.resolve(renderOffice());
  try {
    await activeRender;
  } finally {
    activeRender = null;
  }
}

async function renderOffice() {
    if (!isHydrationComplete) return;

    if (selectedMode === 'ethiopian-saatat') {
        return renderEthiopianSaatat();
    } else if (selectedMode === 'east-syriac') {
        return renderEastSyriac();
    } else if (selectedMode === 'horologion') {
        return renderHorologionOffice(selectedHorologionOffice);
    } else {
        return renderBcpOffice();
    }
}


// ── HOROLOGION UI ADAPTER ─────────────────────────────────────────────────────
//
// renderHorologionOffice() is a THIN ADAPTER only. All liturgical logic lives
// in HorologionEngine (js/horologion-engine.js). This function:
//   1. Calls HorologionEngine.resolveOffice() — non-throwing by contract.
//   2. Checks payload.status === "error" and renders a visible error block.
//   3. Walks sections and items, rendering placeholders as visible dashed blocks.
//
// No calendar logic, no feast resolution, no text composition belongs here.
//
async function renderHorologionOffice(officeKey) {
    const display = document.getElementById('office-display');
    if (!display) return;

    // resolveOffice() is non-throwing: all failures come back as status:"error"
    const payload = await HorologionEngine.resolveOffice(currentDate, officeKey, { eoMode: selectedEoMode });

    // ── Error state: surface explicitly, never silently blank ────────────────
    if (payload.status === 'error') {
        const msg = (payload.diagnostics.warnings || []).join(' ') || 'Unknown error.';
        display.innerHTML =
            `<div class="office-container">` +
            `<h3 style="color:var(--rubric)">Horologion Error</h3>` +
            `<p class="component-text">${msg}</p>` +
            `</div>`;
        console.error('[renderHorologionOffice] Engine returned error payload:', msg);
        return;
    }

    // Validate for developer visibility (non-fatal — logs only)
    const validation = HorologionEngine.validateOfficePayload(payload);
    if (!validation.valid) {
        console.warn('[renderHorologionOffice] Payload validation errors:', validation.errors);
    }

    const dateLabel = currentDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    let html = `<div class="office-container">`;
    html += `<p class="office-book-title">The Horologion</p>`;
    html += `<h2>${payload.title}</h2>`;
    html += `<p class="liturgical-title">${dateLabel}</p>`;

    // Diagnostic banner when variable slots remain unresolved
    if (payload.diagnostics.placeholderSlots > 0) {
        html +=
            `<div style="border:1px solid var(--rubric); border-radius:4px; ` +
            `padding:10px 14px; margin:12px 0; font-size:0.8em; color:var(--rubric); ` +
            `font-family:'Cinzel',serif; letter-spacing:0.04em;">` +
            `⚠ Public-beta notice: unresolved slot(s) remain visible below. ` +
            `${payload.diagnostics.placeholderSlots} slot(s) require Octoechos, Menaion, or calendar data.` +
            `</div>`;
    }

    for (const section of payload.sections) {
        html +=
            `<h3 class="rubric-heading" style="margin-top:1.5em; font-family:'Cinzel',serif; ` +
            `font-size:1em; letter-spacing:0.1em; text-transform:uppercase; color:var(--rubric);">` +
            `${section.label}</h3>`;
        for (const item of section.items) {
            html += _renderHorologionItem(item);
        }
    }

    html += `</div>`;
    display.innerHTML = html;
}

// Renders a single Horologion item as HTML.
// Placeholder/unresolved items always produce a visible block — never silently omitted.
function _renderHorologionItem(item) {
    const isUnresolved =
        item.type === 'placeholder' ||
        item.status === 'unresolved' ||
        item.status === 'placeholder';

    if (isUnresolved) {
        const label   = item.label || item.key;
        const devNote = item.note
            ? `<span style="font-size:0.78em; opacity:0.7; display:block; margin-top:4px;">${item.note}</span>`
            : '';
        return `<div style="border:1px dashed var(--rubric); border-radius:3px; ` +
            `padding:8px 12px; margin:8px 0; opacity:0.75;">` +
            `<span class="rubric-text" style="font-size:0.85em;">Unresolved public-beta slot: ${label}.</span>` +
            devNote +
            `</div>`;
    }

    // Shared HTML-escape helper used by all resolved text branches.
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatParagraphText(text) {
        const safe = escapeHtml(String(text || ''));
        return safe
            .replace(/\n\n+/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    function renderRepeatedText(text, repeat) {
        const count = Number(repeat);

        if (!Number.isInteger(count) || count <= 1) {
            return `<div class="horologion-text"><p>${formatParagraphText(text)}</p></div>`;
        }

        // Governance rule:
        // 1–3 = spell out in full
        // 4+  = compress as (×N)
        if (count <= 3) {
            let out = '<div class="horologion-text">';
            for (let i = 0; i < count; i++) {
                out += `<p>${formatParagraphText(text)}</p>`;
            }
            out += '</div>';
            return out;
        }

        const compressed = `${String(text || '')} (×${count})`;
        return `<div class="horologion-text"><p>${formatParagraphText(compressed)}</p></div>`;
    }

    if (item.type === 'rubric') {
        const base = `<span class="rubric-text">${item.text || ''}</span>`;
        return base + _renderHorologionDiagnostics(item, escapeHtml);
    }

    // New: ordered liturgical sequence container.
    // Each child item is rendered recursively through the same renderer.
    if (item.type === 'sequence') {
        const label = item.label
            ? `<p class="rubric-text" style="margin-bottom:0.4em;">${escapeHtml(item.label)}</p>`
            : '';

        const children = Array.isArray(item.items)
            ? item.items.map(child => _renderHorologionItem(child)).join('')
            : '';

        const seqHtml = `<div class="horologion-sequence">${children}</div>`;
        return `${label}${_horologionBodyWrap(seqHtml, item, item.label || 'Section')}`;
    }

    // type: "psalm" — render label then body text.
    if (item.type === 'psalm') {
        const label    = item.label ? `<p class="rubric-text" style="margin-bottom:0.4em;">${escapeHtml(item.label)}</p>` : '';
        const body     = formatParagraphText(item.text || '');
        const bodyHtml = `<div class="horologion-text"><p>${body}</p></div>`;
        return `${label}${_horologionBodyWrap(bodyHtml, item, item.label || 'Psalm')}`;
    }

    // type: "stichera" — render rubric label then verse text (same layout as psalm).
    if (item.type === 'stichera') {
        const label    = item.label ? `<p class="rubric-text" style="margin-bottom:0.4em;">${escapeHtml(item.label)}</p>` : '';
        const body     = formatParagraphText(item.text || '');
        const bodyHtml = `<div class="horologion-text"><p>${body}</p></div>`;
        return `${label}${_horologionBodyWrap(bodyHtml, item, item.label || 'Sticheron')}` +
               _renderHorologionDiagnostics(item, escapeHtml);
    }

    // v5.5: type: "kathisma" — full psalm text organized by stasis.
    // item.stases: [ { stasis: number, psalms: [ { number, title, verses: string[] } ] } ]
    // Inter-stasis Glory doxology prompts appended after each stasis.
    if (item.type === 'kathisma') {
        const headerLabel = item.label
            ? `<p class="rubric-text" style="margin-bottom:0.3em;">${escapeHtml(item.label)}</p>`
            : '';
        const lxxNote = item.psalmsLxx
            ? `<p class="rubric-text" style="font-size:0.82em; opacity:0.8; margin-bottom:0.6em;">` +
              `Psalms ${escapeHtml(item.psalmsLxx)} (LXX) — OCA/Antiochian English Psalter</p>`
            : '';

        const stases = Array.isArray(item.stases) ? item.stases : [];
        let stasisHtml = '';

        for (let si = 0; si < stases.length; si++) {
            const stasis = stases[si];
            const psalms = Array.isArray(stasis.psalms) ? stasis.psalms : [];
            let psalmHtml = '';

            for (const psalm of psalms) {
                const psalmTitle = psalm.title
                    ? `<p class="rubric-text" style="margin:0.6em 0 0.2em; font-size:0.9em;">${escapeHtml(psalm.title)}</p>`
                    : '';
                const verses = Array.isArray(psalm.verses) ? psalm.verses : [];
                const verseHtml = verses.map((v, idx) =>
                    `<p style="margin:0.15em 0;">${escapeHtml(String(idx + 1))}.&nbsp;${escapeHtml(v)}</p>`
                ).join('');
                psalmHtml += `<div class="horologion-psalm-block">${psalmTitle}${verseHtml}</div>`;
            }

            const isLast = (si === stases.length - 1);
            const doxology = isLast
                ? `<p class="rubric-text" style="margin:0.7em 0 0.2em; font-size:0.88em; font-style:italic;">Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever and unto the ages of ages. Amen. Alleluia, alleluia, alleluia. Glory to Thee, O God. (×3)</p>`
                : `<p class="rubric-text" style="margin:0.7em 0 0.2em; font-size:0.88em; font-style:italic;">Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever and unto the ages of ages. Amen.</p>`;

            stasisHtml += `<div class="horologion-kathisma-stasis">${psalmHtml}${doxology}</div>`;
        }

        const variantNote = item.variantNote
            ? `<p class="rubric-text" style="font-size:0.8em; opacity:0.75; margin-top:0.5em;">(${escapeHtml(item.variantNote)})</p>`
            : '';

        const kathismaHtml = `<div class="horologion-kathisma">${headerLabel}${lxxNote}${stasisHtml}${variantNote}</div>`;
        return _horologionBodyWrap(kathismaHtml, item, item.label || 'Kathisma') +
               _renderHorologionDiagnostics(item, escapeHtml);
    }

    // type: "litany" — render each line role-tagged.
    if (item.type === 'litany') {
        const lines = String(item.text || '').split('\n');
        let out = '<div class="horologion-litany">';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                out += '<div style="height:0.5em;"></div>';
            } else if (/^(Deacon|Priest|Reader|Bishop):/.test(trimmed)) {
                out += `<p class="rubric-text" style="margin:0.2em 0;">${escapeHtml(trimmed)}</p>`;
            } else if (/^Choir:/.test(trimmed)) {
                out += `<p class="component-text" style="margin:0.15em 0 0.15em 1.5em; font-style:italic;">${escapeHtml(trimmed)}</p>`;
            } else {
                out += `<p class="component-text" style="margin:0.2em 0;">${escapeHtml(trimmed)}</p>`;
            }
        }
        out += '</div>';
        return out;
    }

    // New: repeat-aware plain text rendering.
    if (item.type === 'text' && item.repeat !== undefined) {
        const label = item.label
            ? `<p class="rubric-text" style="margin-bottom:0.4em;">${escapeHtml(item.label)}</p>`
            : '';
        return `${label}${_horologionBodyWrap(renderRepeatedText(item.text || '', item.repeat), item, item.label || 'Text')}`;
    }

    // Fallback: type "text" or any other resolved item.
    const formatted = formatParagraphText(item.text || '');
    const baseHtml  = `<div class="horologion-text"><p>${formatted}</p></div>`;
    return _horologionBodyWrap(baseHtml, item, item.label || item.key || 'Text') +
           _renderHorologionDiagnostics(item, escapeHtml);
}

// ── v5.4: Diagnostics annotation helper ──────────────────────────────────────
// Returns a diagnostics HTML string when _horDiagnosticsEnabled is true and
// the item's resolvedAs is in the known variable-slot set.
// Returns '' (empty string) in all other cases — safe to concatenate unconditionally.
//
// Called from: rubric branch, stichera branch, and fallback text branch of
// _renderHorologionItem(). Fixed corpus items never carry a recognized resolvedAs
// and will always receive ''.
//
// escapeHtml is passed in from the caller's closure to avoid duplication.
function _renderHorologionDiagnostics(item, escapeHtml) {
    if (!_horDiagnosticsEnabled || !item.resolvedAs) return '';

    const DIAG_SLOTS = new Set([
        'menaion-feast-troparion',   'menaion-text-unavailable',
        'triodion-lenten-troparion',
        'holy-week-troparion',
        'bright-week-paschal-stichera', 'bright-week-paschal-aposticha',
        'paschal-troparion',
        'weekday-theme-rubric',      'little-hour-lenten-rubric',
        'compline-lenten-rubric',    'great-lent-troparion-pending',
        'resurrectional-troparion-saturday', 'resurrectional-troparion-sunday',
        'weekday-octoechos-theotokion', 'menaion-feast-theotokion',
        'ordinary-weekday-baseline', 'octoechos-baseline-ordinary',
        'sunday-small-vespers-resurrectional-stichera',
        'sunday-small-vespers-resurrectional-aposticha'
    ]);

    if (!DIAG_SLOTS.has(item.resolvedAs)) return '';

    const layer   = _horDiagLayer(item.resolvedAs);
    const toneStr = (typeof item.tone === 'number') ? `tone ${item.tone}` : null;
    const parts   = [
        `resolvedAs: ${item.resolvedAs}`,
        `type: ${item.type}`,
        toneStr,
        layer  ? `layer: ${layer}`   : null,
        item.source ? `source: ${item.source}` : null
    ].filter(Boolean);

    return (
        `<div style="` +
            `font-size:0.68em; font-family:monospace; ` +
            `color:rgba(100,180,100,0.7); ` +
            `margin:-2px 0 6px 0; padding:2px 6px; ` +
            `border-left:2px solid rgba(100,180,100,0.3); ` +
            `letter-spacing:0.02em; line-height:1.4;` +
        `">` +
        escapeHtml(parts.join('  ·  ')) +
        `</div>`
    );
}

// ── v5.4: Map resolvedAs to a human-readable layer label ─────────────────────
// Called only when diagnostics are enabled. Returns null for unknown values
// so we never display fabricated metadata.
function _horDiagLayer(resolvedAs) {
    if (!resolvedAs) return null;
    if (resolvedAs.startsWith('menaion-'))                          return 'Menaion';
    if (resolvedAs.startsWith('triodion-'))                         return 'Triodion';
    if (resolvedAs.startsWith('holy-week-'))                        return 'Holy Week';
    if (resolvedAs.startsWith('bright-week-') ||
        resolvedAs === 'paschal-troparion')                         return 'Pentecostarion';
    if (resolvedAs.startsWith('resurrectional-') ||
        resolvedAs.startsWith('octoechos-') ||
        resolvedAs === 'weekday-octoechos-theotokion' ||
        resolvedAs.startsWith('sunday-small-vespers-') ||
        resolvedAs === 'ordinary-weekday-baseline')                 return 'Octoechos';
    if (resolvedAs === 'weekday-theme-rubric' ||
        resolvedAs.endsWith('-lenten-rubric') ||
        resolvedAs.endsWith('-pending'))                            return 'Fallback';
    return null;
}
// ── Deterministic daily rotation helper ─────────────────────────────────────
// Used to rotate among a fixed, ordered list of authorized text options based
// on the calendar date, so the same date always yields the same option
// worldwide (no timezone drift) and the choice never depends on load order,
// randomness, or client state. Anchor: ISO-8601 ordinal day-of-year (1-366),
// computed via UTC date math to avoid local-timezone boundary drift, taken
// modulo the number of options. Do not replace this with Math.random() or
// any non-deterministic source — liturgical rotation must be reproducible
// (so the same office is prayed by everyone on a given date) and auditable.
function getDailyRotationIndex(date, optionCount) {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const startOfYear = new Date(Date.UTC(date.getFullYear(), 0, 1));
    const dayOfYear = Math.floor((utcDate - startOfYear) / 86400000) + 1; // 1-366
    return (dayOfYear - 1) % optionCount;
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
    const seasonInfo = await withDailyOfficeTimeout(
        CalendarEngine.getSeasonAndFile(currentDate),
        'Daily Office season lookup',
        DAILY_OFFICE_RESOURCE_TIMEOUT_MS,
        { season: 'ordinary', liturgicalColor: 'green', litYear: 'year1' }
    );
    const { season, liturgicalColor, litYear } = seasonInfo || { season: 'ordinary', liturgicalColor: 'green', litYear: 'year1' };
    updateSeasonalTheme(liturgicalColor || 'green');

    const dailyData = await withDailyOfficeTimeout(
        CalendarEngine.fetchLectionaryData(currentDate),
        'Daily Office lectionary lookup',
        DAILY_OFFICE_RESOURCE_TIMEOUT_MS,
        null
    );
    const activeRubric = appData.rubrics.find(r => r.id === resolvedOfficeId);

    if (!dailyData) {
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3 style="color:var(--rubric)">Daily Office Render Timeout</h3>` +
            `<p class="component-text">The lectionary data did not finish loading. Please reload or choose another date.</p></div>`;
        return;
    }

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

    let officeHtml = `<div class="office-container">`;
    officeHtml += `<p class="office-book-title">The Daily Office</p>`;
    officeHtml += `<h2>${officeTitle}</h2>`;
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
                    const res = await fetchDailyOfficeResource(`data/bible/${folder}/${filename}`);
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
    // Warms SaintsResolver monthly cache before sequence loop.
    await preloadDailyOfficeCommemorations(currentDate, 'ANG');

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

        // VARIABLE_CANTICLE1 — canticle after the Old Testament Reading
        // Per BCP1979 "Suggested Canticles at Morning/Evening Prayer" (pp.144-145),
        // selection depends on day of week, with seasonal overrides in Advent/Lent/Easter.
        // NOTE: the table's separate "Feasts of our Lord and other Major Feasts" override
        // row is NOT yet implemented here — this app has no Major Feast / feast-rank flag
        // in the Anglican calendar data to detect that case. Flagged for Josh; until
        // resolved, Major Feast days will show the ordinary weekday canticle instead of
        // the Major-Feast override the BCP calls for.
        if (item === 'VARIABLE_CANTICLE1') {
            let canticleId = null;
            let canticleLabel = '';
            const dow = currentDate.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
            if (isMorning) {
                if (dow === 0) { // Sunday
                    if (season === 'advent')      { canticleId = 'bcp-surge-illuminare';   canticleLabel = 'The Third Song of Isaiah'; }
                    else if (season === 'lent')    { canticleId = 'bcp-kyrie-pantokrator';  canticleLabel = 'A Song of Penitence'; }
                    else if (season === 'easter')  { canticleId = 'bcp-cantemus-domino';    canticleLabel = 'The Song of Moses'; }
                    else                            { canticleId = 'bcp-benedictus';         canticleLabel = 'Benedictus Dominus Deus'; }
                } else if (dow === 1) { canticleId = 'bcp-ecce-deus';        canticleLabel = 'The First Song of Isaiah'; }
                else if (dow === 2)   { canticleId = 'bcp-benedictus-es';    canticleLabel = 'Benedictus es, Domine'; }
                else if (dow === 3) {
                    if (season === 'lent') { canticleId = 'bcp-kyrie-pantokrator'; canticleLabel = 'A Song of Penitence'; }
                    else                     { canticleId = 'bcp-surge-illuminare'; canticleLabel = 'The Third Song of Isaiah'; }
                }
                else if (dow === 4)   { canticleId = 'bcp-cantemus-domino';  canticleLabel = 'The Song of Moses'; }
                else if (dow === 5) {
                    if (season === 'lent') { canticleId = 'bcp-kyrie-pantokrator'; canticleLabel = 'A Song of Penitence'; }
                    else                     { canticleId = 'bcp-quaerite-dominum'; canticleLabel = 'The Second Song of Isaiah'; }
                }
                else if (dow === 6)   { canticleId = 'bcp-benedicite';       canticleLabel = 'A Song of Creation'; }
            } else if (isEvening) {
                if (dow === 0)        { canticleId = 'bcp-magnificat';       canticleLabel = 'The Magnificat'; }
                else if (dow === 1) {
                    if (season === 'lent') { canticleId = 'bcp-kyrie-pantokrator'; canticleLabel = 'A Song of Penitence'; }
                    else                     { canticleId = 'bcp-cantemus-domino'; canticleLabel = 'The Song of Moses'; }
                }
                else if (dow === 2)   { canticleId = 'bcp-quaerite-dominum'; canticleLabel = 'The Second Song of Isaiah'; }
                else if (dow === 3)   { canticleId = 'bcp-benedicite';       canticleLabel = 'A Song of Creation'; }
                else if (dow === 4)   { canticleId = 'bcp-surge-illuminare'; canticleLabel = 'The Third Song of Isaiah'; }
                else if (dow === 5)   { canticleId = 'bcp-benedictus-es';    canticleLabel = 'Benedictus es, Domine'; }
                else if (dow === 6)   { canticleId = 'bcp-ecce-deus';        canticleLabel = 'The First Song of Isaiah'; }
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

        // VARIABLE_CANTICLE2 — canticle after the New Testament Reading
        // Per BCP1979 "Suggested Canticles at Morning/Evening Prayer" (pp.144-145).
        // Same Major Feast caveat as VARIABLE_CANTICLE1 above applies here.
        if (item === 'VARIABLE_CANTICLE2') {
            let canticleId = null;
            let canticleLabel = '';
            const dow = currentDate.getDay();
            if (isMorning) {
                if (dow === 0) { // Sunday
                    if (season === 'advent' || season === 'lent') { canticleId = 'bcp-benedictus'; canticleLabel = 'Benedictus Dominus Deus'; }
                    else                                            { canticleId = 'bcp-te-deum';    canticleLabel = 'Te Deum Laudamus'; }
                } else if (dow === 1) { canticleId = 'bcp-magna-et-mirabilia'; canticleLabel = 'The Song of the Redeemed'; }
                else if (dow === 2)   { canticleId = 'bcp-dignus-es';          canticleLabel = 'A Song to the Lamb'; }
                else if (dow === 3)   { canticleId = 'bcp-benedictus';         canticleLabel = 'Benedictus Dominus Deus'; }
                else if (dow === 4) {
                    if (season === 'advent' || season === 'lent') { canticleId = 'bcp-magna-et-mirabilia'; canticleLabel = 'The Song of the Redeemed'; }
                    else                                            { canticleId = 'bcp-gloria-in-excelsis'; canticleLabel = 'Glory to God'; }
                }
                else if (dow === 5)   { canticleId = 'bcp-dignus-es';          canticleLabel = 'A Song to the Lamb'; }
                else if (dow === 6)   { canticleId = 'bcp-magna-et-mirabilia'; canticleLabel = 'The Song of the Redeemed'; }
            } else if (isEvening) {
                if (dow === 0)        { canticleId = 'bcp-nunc-dimittis'; canticleLabel = 'Nunc Dimittis'; }
                else if (dow === 1)   { canticleId = 'bcp-nunc-dimittis'; canticleLabel = 'Nunc Dimittis'; }
                else if (dow === 2)   { canticleId = 'bcp-magnificat';    canticleLabel = 'The Magnificat'; }
                else if (dow === 3)   { canticleId = 'bcp-nunc-dimittis'; canticleLabel = 'Nunc Dimittis'; }
                else if (dow === 4)   { canticleId = 'bcp-magnificat';    canticleLabel = 'The Magnificat'; }
                else if (dow === 5)   { canticleId = 'bcp-nunc-dimittis'; canticleLabel = 'Nunc Dimittis'; }
                else if (dow === 6)   { canticleId = 'bcp-magnificat';    canticleLabel = 'The Magnificat'; }
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

        // VARIABLE_MISSION_PRAYER — rotates among the 3 BCP-authorized Morning
        // Prayer mission prayers (p.99-100 Rite II / p.56-57 Rite I) when the
        // "Rotate Mission Prayer Daily" toggle is on; otherwise always uses
        // Option A, matching the app's prior fixed behavior.
        if (item === 'VARIABLE_MISSION_PRAYER') {
            const missionPrayerIds = ['bcp-mission-prayer-mp-a', 'bcp-mission-prayer-mp-b', 'bcp-mission-prayer-mp-c'];
            const rotateMissionPrayer = document.getElementById('toggle-rotate-mission-prayer')?.checked ?? true;
            const missionIdx = rotateMissionPrayer ? getDailyRotationIndex(currentDate, missionPrayerIds.length) : 0;
            const comp = appData.components.find(c => c.id === missionPrayerIds[missionIdx]);
            if (comp) {
                const t = resolveText(comp, rite) || comp.text || '';
                officeHtml += `<span class="rubric-text">A Prayer for Mission</span><span class="component-text">${t}</span>`;
            } else {
                console.warn(`[renderOffice] VARIABLE_MISSION_PRAYER: ${missionPrayerIds[missionIdx]} not found`);
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
                'sene': 'sene', 'hamle': 'hamle', 'nehase': 'nehase', 'pagume': 'pagumen'
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
                const MONTH_NAME_ALIASES = { 'teqemt': 'tiqimt' , 'pagume': 'pagumen', 'pagumen': 'pagumen'};
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

            // If Pagumen 6 is in view, allow rendering even if the index file has not yet been extended to 6 days.
            if (!indexEntry && monthSlug === 'pagumen' && ethDate.day === 6) {
                indexEntry = { title: '6 Pagumen — The Seal of the Year' };
            }



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
                let dayData = null;
                // Pagumen 6 is stored as a standalone file (only exists in Ethiopian leap years)
                if (monthSlug === 'pagumen' && ethDate.day === 6) {
                    const key6 = 'pagumen-6';
                    if (!appData.senkessarCache[key6]) {
                        try {
                            const day6Res = await fetch('data/synaxarium/ethiopian/pagumen-6.json');
                            if (day6Res.ok) appData.senkessarCache[key6] = await day6Res.json();
                        } catch (err) {
                            console.warn('[eth-saints-commemoration] Day 6 file load failed: pagumen-6.json', err);
                        }
                    }
                    dayData = appData.senkessarCache[key6] || null;
                } else {
                    dayData = appData.senkessarCache[monthSlug]
                        ? appData.senkessarCache[monthSlug][ethDate.day]
                        : null;
                }


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
                const orientalSaints = SaintsResolver.filterCachedByTradition(currentDate, 'OOR');

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
            'bcp-mission-prayer-mp-a':        'A Prayer for Mission',
            'bcp-mission-prayer-mp-b':        'A Prayer for Mission',
            'bcp-mission-prayer-mp-c':        'A Prayer for Mission',
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

   let dateHeaderText = `Commemorations for ${todayKey}`;
document.getElementById('date-header').innerText = 'Commemorations';
 // ── Saints (BCP / Daily Office) ─────────────────────────────────────────────
const angComms = await resolveCommemorations(currentDate, 'ANG', { includeEcumenical: true });

document.getElementById('saint-display').innerHTML = angComms
    .map(s => {
        const ctx = { tradition: 'ANG', includeEcumenical: true };
        const res = saintAppliesToContext(s, ctx);
        const label = getTraditionDisplayLabel(res.label || 'Unknown');
        return `<div class="saint-box"><small style="color:var(--accent); font-weight:bold; text-transform:uppercase;">${label}</small><strong>${s.name || 'Unknown'}</strong><p>${s.description || 'No description'}</p></div>`;
    })
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

    // Warms SaintsResolver monthly cache before sequence loop.
    await resolveCommemorations(currentDate, 'OOR');

    let officeHtml = `<div class="office-container">`;
    officeHtml += `<p class="office-book-title">The Ethiopian Sa'atat</p>`;
    officeHtml += `<h2>${ethHourInfo?.hourName || "The Ethiopian Sa'atat"}</h2>`;
    officeHtml += `<p class="liturgical-title">${ethSidebarDate}</p>`;

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
                'sene': 'sene', 'hamle': 'hamle', 'nehase': 'nehase', 'pagume': 'pagumen'
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
                const MONTH_NAME_ALIASES = { 'teqemt': 'tiqimt' , 'pagume': 'pagumen', 'pagumen': 'pagumen'};
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
                let dayData = null;
                // Pagumen 6 is stored as a standalone file (only exists in Ethiopian leap years)
                if (monthSlug === 'pagumen' && ethDate.day === 6) {
                    const key6 = 'pagumen-6';
                    if (!appData.senkessarCache[key6]) {
                        try {
                            const day6Res = await fetch('data/synaxarium/ethiopian/pagumen-6.json');
                            if (day6Res.ok) appData.senkessarCache[key6] = await day6Res.json();
                        } catch (err) {
                            console.warn('[renderEthiopianSaatat] Day 6 file load failed: pagumen-6.json', err);
                        }
                    }
                    dayData = appData.senkessarCache[key6] || null;
                } else {
                    dayData = appData.senkessarCache[monthSlug]
                        ? appData.senkessarCache[monthSlug][ethDate.day]
                        : null;
                }

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
                const orientalSaints = SaintsResolver.filterCachedByTradition(currentDate, 'OOR');
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

    // If an hour override is active, sync the radio; otherwise auto-detect from clock
    // so the sidebar "Active Hour" always reflects what is actually being displayed.
    if (window._esyTemporalOverride.active && window._esyTemporalOverride.hourId) {
        const overrideRadio = document.querySelector(`input[name="esy-time"][value="${window._esyTemporalOverride.hourId}"]`);
        if (overrideRadio) overrideRadio.checked = true;
    } else if (!document.querySelector('input[name="esy-time"]:checked')) {
        const autoHour  = getEastSyriacHourInfo();
        const autoRadio = document.querySelector(`input[name="esy-time"][value="${autoHour.value}"]`);
        if (autoRadio) autoRadio.checked = true;
    }

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

    // Apply date override if active
    if (window._esyTemporalOverride.active && window._esyTemporalOverride.date) {
        currentDate = window._esyTemporalOverride.date;
    }

    // COE-IIA: Use getDayClass() which wraps getSeason() and adds Layer 2
    // fixed-feast / corporate-commemoration data. All season engine fields
    // (season, cycle, cycleLabel, fastCharacter, etc.) are passed through
    // unchanged on esyData, so all downstream references are unaffected.
    const esyData    = EastSyriacCalendar.getDayClass(currentDate);
    const season     = esyData.season;
    const cycle      = esyData.cycle;
    const cycleLabel = esyData.cycleLabel;
    updateSeasonalTheme(esyData.seasonColor || 'green');

    const esyCycleDisplay = document.getElementById('esy-cycle-box');
    if (esyCycleDisplay) esyCycleDisplay.textContent = cycleLabel;

    // Fasting character display
    const esyFastDisplay = document.getElementById('esy-fast-box');
    if (esyFastDisplay) {
        esyFastDisplay.textContent = esyData.fastLabel || 'Ordinary Day';
        // Colour-code: fast days gold-red tint, feast days brighter, ordinary neutral
        const fastColors = {
            'nineveh-fast': '#c8785a',
            'great-fast':   '#c87a3a',
            'fast':         '#b8a060',
            'feast':        '#a0c890',
            'ordinary':     'var(--gold)',
        };
        esyFastDisplay.style.color = fastColors[esyData.fastCharacter] || 'var(--gold)';
    }

    // Anaphora display
    const esyAnaphoraDisplay = document.getElementById('esy-anaphora-box');
    if (esyAnaphoraDisplay) esyAnaphoraDisplay.textContent = esyData.anaphoraLabel || 'Anaphora of Addai and Mari';

    // Update sidebar Active Hour display
    const esyActiveLabel = document.getElementById('esy-active-hour-label');
    const esyDateLabel   = document.getElementById('esy-active-date-label');
    if (esyActiveLabel) {
        esyActiveLabel.textContent = officeTitle;
    }
    if (esyDateLabel) {
        const gregDateStr = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        // Show Nineveh Fast in week label if active, otherwise normal week label
        const weekStr = esyData.fastCharacter === 'nineveh-fast'
            ? "Ba\'utha d\'Ninwaye (Nineveh Fast)"
            : (esyData.weekLabel || esyData.seasonLabel || '');
        esyDateLabel.textContent = gregDateStr + (weekStr ? ` | ${weekStr}` : '')
                                 + (window._esyTemporalOverride.active ? ' ✦ override' : '');
    }

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

    // Warms SaintsResolver monthly cache before the office body is assembled.
    // Required so that the Layer 3 saint lookup below runs against the cached
    // data without triggering an async fetch inside the saint-display block.
    await resolveCommemorations(currentDate, 'COE');

    let officeHtml = `<div class="office-container">`;
    officeHtml += `<p class="office-book-title">The Hudra</p>`;
    officeHtml += `<h2>${officeTitle}</h2>`;
    officeHtml += `<p class="liturgical-title">${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>`;

    // ── COE-IIA: Commemoration area ──────────────────────────────────────────
    // Render Layer 2 fixed / corporate commemorations before the prayer sequence.
    // Framing is commemoration-first (not saint-first). If no commemoration
    // applies, this section is absent. The saint-grid model is not used here.
    const esyComms = esyData.commemorations || [];
    if (esyComms.length > 0) {
        const primaryComm = esyComms[0];

        // Choose heading based on key/type rather than free text to keep framing stable
        const headingMap = {
            'COE_FRIDAY_MARTYRS_SAUMA':    'Friday Commemoration of the Martyrs',
            'COE_COMMEMORATION_OF_DEAD':   'Seasonal Commemoration',
        };
        const sectionHeading = headingMap[primaryComm.key] || 'Seasonal Commemoration';

        officeHtml += `<div class="coe-commemoration-section">`;
        officeHtml += `<span class="rubric-text">${sectionHeading}</span>`;
        officeHtml += `<p class="commemoration-label">${primaryComm.label}</p>`;

        // Render any additional commemorations on this date
        for (let i = 1; i < esyComms.length; i++) {
            officeHtml += `<p class="commemoration-label commemoration-secondary">${esyComms[i].label}</p>`;
        }
        officeHtml += `</div>`;
    }

    for (let item of sequence) {
        item = item.trim();

        if (item === 'esy-variable-seasonal-onitha') {
            // Nineveh Fast uses its own Onitha; Sauma uses lent form; Qyamta uses easter form
            const onithaId = esyData.fastCharacter === 'nineveh-fast' ? 'esy-onitha-nineveh'
                           : season === 'sauma'                        ? 'esy-onitha-lent'
                           : season === 'qyamta'                       ? 'esy-onitha-easter'
                           :                                             'esy-onitha-ordinary';
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
        }

        if (item === 'esy-variable-qutaa-psalms') {
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
            // Nineveh Fast and Sauma both use the penitential Barekmar form
            const barekmarId = (season === 'sauma' || esyData.fastCharacter === 'nineveh-fast')
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

    // ── COE Layer 3 — Sparse Individual Commemorations (COE-IIB) ────────────
    //
    // Architecture:
    //   Layer 1 — season engine  (calendar-east-syriac.js getSeason)
    //   Layer 2 — fixed feasts   (getDayClass commemorations[], rendered above)
    //   Layer 3 — THIS BLOCK     (individual saints, sparse, gated by allowlist)
    //
    // Gating rules:
    //   • CoeEligibility.filter() is the sole eligibility gate. It enforces the
    //     explicit allowlist defined in js/coe-eligibility.js. No saint is
    //     displayed unless its identity id is in that allowlist.
    //   • The 5 STILL_UNRESOLVED identities (saint-ignatius-of-antioch,
    //     saint-nicholas-of-myra, saint-abraham-of-carrhae, mar-augustine,
    //     mar-augustine-commemoration) are NOT in the allowlist and will be
    //     excluded automatically — no special case needed here.
    //   • Layer 2 commemorations (esyComms) are structural observances, not
    //     saints. They are never passed through CoeEligibility; they are
    //     already rendered above. There is no override or collision with Layer 3.
    //   • If CoeEligibility.filter() returns an empty array, nothing is
    //     rendered. No fallback, no grid, no intercession placeholder.
    //   • The saint-of-the-day grid model is not used. Framing is secondary and
    //     non-assertive: "Commemorated Holy Figures".
    //
    const saintSection = document.querySelector('.saint-section');
    const dateHeader   = document.getElementById('date-header');
    const saintDisplay = document.getElementById('saint-display');

    // Resolve COE saints for today and apply the eligibility filter.
    // resolveCommemorations() uses the cache warmed above; no additional fetch.
    const coeRaw      = await resolveCommemorations(currentDate, 'COE');
    const coeEligible = (typeof CoeEligibility !== 'undefined')
        ? CoeEligibility.filter(coeRaw)
        : [];

    if (coeEligible.length > 0) {
        // Show the saint section with sparse, secondary framing.
        if (saintSection) saintSection.style.display = '';
        if (dateHeader)   dateHeader.style.display   = '';
        document.getElementById('date-header').innerText = 'Commemorated Holy Figures';

        saintDisplay.innerHTML = coeEligible
            .map(s => {
                // Badge: always COE for this renderer — do not show cross-tradition labels.
                return `<div class="saint-box">`
                     + `<small style="color:var(--accent); font-weight:bold; text-transform:uppercase;">COE</small>`
                     + `<strong>${s.name || 'Unknown'}</strong>`
                     + (s.description ? `<p>${s.description}</p>` : '')
                     + `</div>`;
            })
            .join('');
    } else {
        // No eligible Layer 3 saints for this date — silence is liturgically correct.
        if (saintSection) saintSection.style.display = 'none';
        if (dateHeader)   dateHeader.style.display   = 'none';
        if (saintDisplay) saintDisplay.innerHTML      = '';
    }
}

// === UO MOBILE DRAWER REPAIR START ===
// This end-of-file override avoids brittle edits inside the legacy drawer code.
(function () {
    function getActiveOfficeDrawer() {
        var panels = [
            document.getElementById('east-syriac-settings'),
            document.getElementById('ethiopian-settings'),
            document.getElementById('generic-settings'),
            document.getElementById('settings-panel')
        ];

        for (var i = 0; i < panels.length; i += 1) {
            if (panels[i] && !panels[i].classList.contains('mode-hidden')) {
                return panels[i];
            }
        }

        return document.getElementById('settings-panel');
    }

    function isMobileOfficeShell() {
        return Boolean(window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
    }

    var originalSelectMode = window.selectMode;

    if (typeof originalSelectMode === 'function' && !originalSelectMode.__uoMobileDrawerWrapped) {
        window.selectMode = async function repairedSelectMode(mode) {
            document.body.classList.remove('mobile-sidebar-open');
            var toggle = document.getElementById('sidebar-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');

            var result = await originalSelectMode.apply(this, arguments);

            if (isMobileOfficeShell()) {
                document.body.classList.remove('mobile-sidebar-open');

                var activePanel = getActiveOfficeDrawer();
                var main = document.getElementById('main-content');

                if (activePanel) activePanel.classList.add('sidebar-hidden');
                if (main) main.classList.add('sidebar-hidden');
                if (toggle) {
                    toggle.style.opacity = '0.86';
                    toggle.setAttribute('aria-expanded', 'false');
                }
            }

            return result;
        };

        window.selectMode.__uoMobileDrawerWrapped = true;
    }

    window.toggleSidebar = function repairedToggleSidebar() {
        var activePanel = getActiveOfficeDrawer();
        var main = document.getElementById('main-content');
        var toggle = document.getElementById('sidebar-toggle');

        if (!activePanel || !main) return;

        if (isMobileOfficeShell()) {
            var willOpen = !document.body.classList.contains('mobile-sidebar-open');

            document.body.classList.toggle('mobile-sidebar-open', willOpen);
            activePanel.classList.toggle('sidebar-hidden', !willOpen);
            main.classList.toggle('sidebar-hidden', !willOpen);

            if (toggle) {
                toggle.style.opacity = willOpen ? '1' : '0.86';
                toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            }

            return;
        }

        document.body.classList.remove('mobile-sidebar-open');

        var isHidden = activePanel.classList.toggle('sidebar-hidden');
        main.classList.toggle('sidebar-hidden', isHidden);

        if (toggle) {
            toggle.style.opacity = isHidden ? '0.65' : '0.5';
            toggle.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
        }
    };

    document.addEventListener('click', function closeMobileDrawerFromOverlay(event) {
        if (!isMobileOfficeShell()) return;
        if (!document.body.classList.contains('mobile-sidebar-open')) return;

        var activePanel = getActiveOfficeDrawer();
        var toggle = document.getElementById('sidebar-toggle');

        if (activePanel && activePanel.contains(event.target)) return;
        if (toggle && toggle.contains(event.target)) return;

        document.body.classList.remove('mobile-sidebar-open');
        if (activePanel) activePanel.classList.add('sidebar-hidden');

        var main = document.getElementById('main-content');
        if (main) main.classList.add('sidebar-hidden');

        if (toggle) {
            toggle.style.opacity = '0.86';
            toggle.setAttribute('aria-expanded', 'false');
        }
    }, true);

    window.addEventListener('resize', function normalizeMobileDrawerOnResize() {
        if (!isMobileOfficeShell()) {
            document.body.classList.remove('mobile-sidebar-open');
        }
    });
}());
// === UO MOBILE DRAWER REPAIR END ===
