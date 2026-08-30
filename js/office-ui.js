let appData = null;
let currentDate = new Date();
let selectedMode = null;
let isHydrationComplete        = false;
let selectedHorologionOffice   = 'vespers'; // tracks active office within Horologion mode
let selectedEoMode = 'new_calendar'; // 'new_calendar' | 'old_calendar' — persisted in universalOfficeSettings
let selectedCoeEasterMode = 'julian'; // 'julian' | 'gregorian' — persisted in universalOfficeSettings

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

// ── COE Easter-reckoning mode selector ──────────────────────────────────────
// Added 2026-08-30. Real ACOE practice is genuinely split on which Easter
// algorithm to use -- confirmed by direct comparison against the ACOTE
// Diocese of Western Europe's own published 2026 calendar, which uses
// Gregorian Easter (Apr 5, 2026), not the Julian Easter (Apr 12, 2026) this
// engine defaults to and was originally built/verified against (matching
// Maclean 1894). Mirrors js/calendar-eastern-orthodox.js's eoMode pattern,
// though note the two are NOT the same axis: eoMode only changes which
// calendar FIXED feasts use, Pascha itself is always Julian for EO either
// way. For COE, this setting changes the Easter algorithm itself, which
// shifts every movable season boundary (Sauma, Qyamta, Shlihe, Qayta,
// Eliya-Sliwa, Muse all key off Easter) -- a bigger effect, disclosed as
// such in documentation/AUDIT_GOVERNANCE_LEDGER.md.
function selectCoeEasterMode(mode) {
    if (mode !== 'julian' && mode !== 'gregorian') {
        console.warn('[selectCoeEasterMode] Invalid mode:', mode, '— defaulting to julian.');
        mode = 'julian';
    }
    selectedCoeEasterMode = mode;
    const sel = document.getElementById('coe-easter-mode-select');
    if (sel && sel.value !== mode) sel.value = mode;
    saveSettings();
    if (selectedMode === 'east-syriac') {
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

// ── App Settings ──────────────────────────────────────────────────────────────
const appSettings = {
    studyMode: false
};

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
    if (color === 'gold')   hex = '#b8860b';
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
        applyDarkMode(_defaultDarkModeForCurrentTime());

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


// ── COPTIC AGPEYA HYDRATION ───────────────────────────────────────────────────
//
// Replaces the fabricated Ethiopian Sa'atat removed 2026-08-18. Sourced from
// De Lacy O'Leary, The Daily Office and Theotokia of the Coptic Church (1911,
// public domain). Only the Morning Office exists so far -- the remaining 6
// hours + Midnight Office are a planned follow-on build, then the Theotokia
// weekly cycle as Phase 2. appData.copticRubrics is an array (one entry per
// hour built so far), mirroring the eastSyriacRubrics pattern.
//
async function hydrateForCopticAgpeya() {
    await loadKernel();
    if (!appData) return;

    if (appData._loadedTraditions.has('coptic')) {
        console.log('[hydrate:coptic] Already loaded — skipping.');
        return;
    }

    console.log('[hydrate:coptic] Fetching Coptic shard and rubrics in parallel...');

    const [shardResult, rubricsResult] = await Promise.allSettled([
        fetch('components/coptic.json'),
        fetch('components/traditions/coptic/rubrics.json')
    ]);

    if (shardResult.status === 'fulfilled') {
        const res = shardResult.value;
        if (res.ok) {
            try {
                const text = await res.text();
                if (text.trim()) {
                    const data = JSON.parse(text);
                    appData.components = appData.components.concat(data);
                    console.log(`[hydrate:coptic] Loaded components/coptic.json — ${data.length} components`);
                } else {
                    console.warn('[hydrate:coptic] components/coptic.json is present but empty.');
                }
            } catch (e) {
                console.warn('[hydrate:coptic] Failed to parse coptic.json:', e.message);
            }
        } else {
            console.warn(`[hydrate:coptic] components/coptic.json not found (HTTP ${res.status}).`);
        }
    } else {
        console.warn('[hydrate:coptic] Network error fetching components/coptic.json:', shardResult.reason);
    }

    if (rubricsResult.status === 'fulfilled') {
        const res = rubricsResult.value;
        if (res.ok) {
            try {
                const rubrics = await res.json();
                appData.copticRubrics = rubrics;
                console.log(`[hydrate:coptic] Loaded Coptic rubrics.json — ${rubrics.length} office(s).`);
            } catch (e) {
                console.warn('[hydrate:coptic] Failed to parse Coptic rubrics.json:', e.message);
            }
        } else {
            console.warn('[hydrate:coptic] Coptic rubrics.json not found — Agpeya sequence will be absent.');
        }
    } else {
        console.warn('[hydrate:coptic] Network error fetching Coptic rubrics.json:', rubricsResult.reason);
    }

    console.log(`[hydrate:coptic] Total components in registry: ${appData.components.length}`);
    appData._loadedTraditions.add('coptic');
    console.log('[hydrate:coptic] Coptic Agpeya hydration complete.');
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

    // No Quta'a or D-tsha' Sa'in entries here: confirmed against Maclean's
    // source that only two minor-hour relics exist at all (Quta'a, appended
    // automatically to Sapra during the Great Fast rather than separately
    // timed; and Endana/"Prayer at Noon", Great-Fast-only) -- there is no
    // Ninth Hour content in this source whatsoever.
    const hourMap = [
        { from:  6 * 60, to: 12 * 60, value: 'sapra',     label: 'Sapra — Morning Prayer' },
        { from: 12 * 60, to: 18 * 60, value: 'endana',    label: 'Endana — Prayer at Noon (Great Fast only)' },
        { from: 18 * 60, to: 21 * 60, value: 'ramsha',    label: 'Ramsha — Evening Prayer' },
        { from: 21 * 60, to: 24 * 60, value: 'lelya',     label: 'Lelya — Night Office' },
        { from:  0 * 60, to:  3 * 60, value: 'lelya',     label: 'Lelya — Night Office' },
        { from:  3 * 60, to:  6 * 60, value: 'subaa',     label: "Suba\'a — Compline" },
    ];

    let match = null;
    for (const entry of hourMap) {
        if (totalMinutes >= entry.from && totalMinutes < entry.to) { match = entry; break; }
    }
    if (!match) match = { value: 'sapra', label: 'Sapra — Morning Prayer' };

    // Cathedral mode (per Maclean's own Introduction: only Ramsha and Sapra
    // carry "the greatest authority" and a fixed shape "not to be added to
    // or taken from" for all people; Lelya, Suba'a, and the Fast-only Endana
    // are each described as observed "according to the rule of the
    // monastery") only ever auto-suggests Ramsha or Sapra. Monastic mode is
    // unaffected and keeps the full time-based suggestion above.
    if (isEastSyriacCathedralMode() && !['sapra', 'ramsha'].includes(match.value)) {
        // Fall back to whichever of the two Cathedral hours is nearer in
        // clock time, rather than always defaulting to one of them.
        const distTo = (h) => Math.min(Math.abs(totalMinutes - h * 60), 24 * 60 - Math.abs(totalMinutes - h * 60));
        match = distTo(7) <= distTo(19)
            ? { value: 'sapra',  label: 'Sapra — Morning Prayer' }
            : { value: 'ramsha', label: 'Ramsha — Evening Prayer' };
    }

    return match;
}

// Cathedral mode restricts the East Syriac offices offered to Ramsha and
// Sapra -- the two "greatest authority" fixed daily services per Maclean's
// own Introduction (p.xii-xiii). Lelya (Night), Suba'a (Compline), and the
// Fast-only Endana are each explicitly described there as kept "according
// to the rule of the monastery" rather than obligatory in fixed shape for
// all people, so Monastic mode is the one that offers the fuller cycle.
// Defaults to Cathedral (the HTML radio's own default) if the control isn't
// present in the DOM for any reason.
function isEastSyriacCathedralMode() {
    const checked = document.querySelector('input[name="esy-mode"]:checked');
    return !checked || checked.value !== 'monastic';
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

    // Clear any forced office override
    window._forcedOfficeId = undefined;

    // Reset all settings panels to their default hidden states so the next
    // mode selection starts clean (avoids e.g. East Syriac settings panel
    // bleeding into a subsequent Daily Office load)
   const settingsPanel = document.getElementById('settings-panel');
    const ethSettings   = document.getElementById('ethiopian-settings');
    const copSettings   = document.getElementById('coptic-settings');
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
    if (copSettings) {
        copSettings.classList.add('sidebar-hidden');
        copSettings.classList.add('mode-hidden');
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
    bookOfNeedsScope: 'tradition',
    ministryRole: 'lay'
});

const UNIVERSAL_OFFICE_TRADITION_MODE_MAP = {
    'anglican': 'daily',
    'unknown': 'daily',
    'church-of-the-east': 'east-syriac',
    'eastern-orthodox': 'horologion',
    'oriental-orthodox': 'coptic-agpeya',
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
// Self-identified role, used to gate Book of Needs content this project's own
// governance says shouldn't reach a default lay view (priestly, sacramental,
// or administered-by-one-person-over-another material) -- see
// documentation/book-of-needs-role-access-governance.json. Deliberately a
// coarse three-value honor-system field, not the full ten-tier ladder that
// document describes: 'lay' (default) sees only content with no role
// requirement; 'clergy' is a self-identified "I am ordained or monastic"
// declaration; 'all' is a blunt no-questions-asked override, for anyone who
// wants everything regardless of role, matching how bookOfNeedsScope's own
// 'universal' option already works as an unchallenged override elsewhere in
// this same profile. 'clergy' and 'all' are functionally equivalent for
// content gating today (both satisfy a 'clergy'-tier requirement) -- kept as
// two distinct values so the UI can honestly distinguish "I attest I'm
// ordained" from "just show me everything," per Josh's own framing of this
// feature (2026-08-30) rather than collapsing them into one meaning.
const UNIVERSAL_OFFICE_MINISTRY_ROLE_VALUES = new Set(['lay', 'clergy', 'all']);


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

    if (!UNIVERSAL_OFFICE_MINISTRY_ROLE_VALUES.has(profile.ministryRole)) {
        profile.ministryRole = 'lay';
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

function setUserProfileMinistryRole(value) {
    const profile = getUserProfileDefaults();
    profile.ministryRole = UNIVERSAL_OFFICE_MINISTRY_ROLE_VALUES.has(value)
        ? value
        : 'lay';

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
    const ministryRoleSelect = document.getElementById('profile-ministry-role');
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

    if (ministryRoleSelect) {
        ministryRoleSelect.value = normalized.ministryRole;
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

        const roleLabel = normalized.ministryRole === 'lay'
            ? 'showing lay-appropriate Book of Needs content only'
            : normalized.ministryRole === 'clergy'
                ? 'showing content appropriate for ordained/monastic use'
                : 'showing all Book of Needs content regardless of role';

        summary.textContent = `This browser ${entryLabel}; ${bookNeedsLabel}; ${roleLabel}.`;
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
            return { storedDefault: 'oriental-orthodox', mode: 'coptic-agpeya' };
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

    // Tradition-picker entry screen bypassed per Josh's direction (2026-07-25,
    // priest-testing deploy): always land directly on the 3-button mode
    // selection screen (Daily Office / Book of Needs / Bible Browser),
    // regardless of any stored per-browser tradition default.
    showUniversalModeSelection(false);
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
window.setUserProfileMinistryRole = setUserProfileMinistryRole;
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
    'coptic-agpeya': 'Oriental Orthodoxy',
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
    'coptic-agpeya': 'OO',
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

    document.body.classList.toggle('roman-breviary-dev-mode', mode === 'roman-breviary-dev');
    window._forcedOfficeId = undefined;

    // Mode transition invariant: exactly one office drawer is active for the selected mode.
    // All non-active drawers must be both mode-hidden and sidebar-hidden so toggleSidebar()
    // cannot target a stale drawer after cross-tradition navigation.
    const settingsPanel = document.getElementById('settings-panel');
    const ethSettings   = document.getElementById('ethiopian-settings');
    const copSettings   = document.getElementById('coptic-settings');
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

    } else if (mode === 'coptic-agpeya') {
        // ── Coptic Agpeya ──────────────────────────────────────────────────────
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
            genSettings.classList.add('sidebar-hidden');
            genSettings.classList.add('mode-hidden');
        }
        if (copSettings) {
            copSettings.classList.remove('sidebar-hidden');
            copSettings.classList.remove('mode-hidden');
        }
        mainContent.classList.remove('sidebar-hidden');

        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Preparing the Agpeya...</h3><p>Loading the Coptic Book of Hours.</p></div>`;

        await hydrateForCopticAgpeya();
        initializeOfficeDefaultsForCurrentDateTime('coptic');
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
    coptic: {
        panelId: "coptic-settings",
        heading: "Agpeya Navigation",
        dateTitle: "Date",
        datePickerLabel: "Select Date",
        officeTitle: "Hour",
        hideHeadings: ["Active Hour"],
        hideButtonRowsAfterHeadings: ["Active Hour"],
        showAppearanceToggle: true,
        appearanceToggleId: "toggle-dark-coptic",
        options: [
            { value: "coptic-morning-office", label: "The Morning Office", detail: "Prime" },
            { value: "coptic-third-hour", label: "The Third Hour", detail: "Terce" },
            { value: "coptic-sixth-hour", label: "The Sixth Hour", detail: "Sext" },
            { value: "coptic-ninth-hour", label: "The Ninth Hour", detail: "None" },
            { value: "coptic-eleventh-hour", label: "The Eleventh Hour", detail: "Vespers" },
            { value: "coptic-twelfth-hour", label: "The Twelfth Hour", detail: "Compline" },
            { value: "coptic-midnight-office", label: "The Midnight Office", detail: "Three Nocturns" },
            { value: "coptic-theotokia", label: "Theotokia", detail: "" },
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
            { value: "sapra", label: "Sapra", detail: "Morning Prayer · 06:00–09:00 (includes Quta'a automatically during the Great Fast)" },
            { value: "endana", label: "Endana", detail: "Prayer at Noon, Great Fast only · 12:00–18:00" },
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
    if (selectedMode === "coptic-agpeya") return "coptic";
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
    if (modeKey === "coptic") {
        return document.querySelector('input[name="cop-hour"]:checked')?.value || "coptic-morning-office";
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

    // Cathedral mode only offers Ramsha and Sapra as selectable hours (see
    // isEastSyriacCathedralMode's own comment for the source grounding);
    // Monastic mode offers the full set unchanged.
    const visibleOptions = (modeKey === 'eastSyriac' && isEastSyriacCathedralMode())
        ? config.options.filter(o => ['sapra', 'ramsha'].includes(o.value))
        : config.options;

    const optionHtml = visibleOptions.map(option => {
        const checked = option.value === activeValue ? "checked" : "";
        // The Theotokia option's detail is computed live from the currently
        // selected date, not authored statically -- it always names the
        // actual day/tune that will show, since the day itself isn't a
        // manual choice (see _copticTheotokiaIdForDate).
        const detail = option.value === "coptic-theotokia"
            ? `${_sharedOfficeNavigatorReadableDate().split(",")[0]} \u00b7 ${_copticTheotokiaToneForDate(currentDate)}`
            : (option.detail || "");
        return `
            <label class="shared-office-nav-option">
                <input type="radio"
                    name="shared-office-nav-${modeKey}"
                    value="${_sharedOfficeNavigatorEscape(option.value)}"
                    ${checked}
                    onchange="setSharedOfficeNavHour('${modeKey}', this.value)">
                <span class="shared-office-nav-option-copy">
                    <span class="shared-office-nav-option-label">${_sharedOfficeNavigatorEscape(option.label)}</span>
                    <span class="shared-office-nav-option-detail">${_sharedOfficeNavigatorEscape(detail)}</span>
                </span>
            </label>`;
    }).join("");

    const appearanceHtml = config.showAppearanceToggle ? `
        <section class="shared-office-nav-card shared-office-nav-appearance-card">
            <div class="shared-office-nav-section-title">Appearance</div>
            <label class="shared-office-nav-option" style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" id="${_sharedOfficeNavigatorEscape(config.appearanceToggleId)}"
                    ${document.body.classList.contains('dark-mode') ? 'checked' : ''}
                    onchange="updateUI(this.checked); saveSettings()">
                <span class="shared-office-nav-option-copy">
                    <span class="shared-office-nav-option-label">Dark Mode</span>
                </span>
            </label>
        </section>` : '';

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
        </section>${appearanceHtml}
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

    if (modeKey === "coptic") {
        const radio = document.querySelector(`input[name="cop-hour"][value="${CSS.escape(value)}"]`);
        if (radio) radio.checked = true;
        requestRender();
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

    if (modeKey === "daily" || modeKey === "horologion" || modeKey === "coptic") {
        setCustomDate(dateValue);
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

// Map clock time to the canonical Coptic Agpeya hour. Traditional Roman-style
// hour names (the Agpeya's own naming convention -- Prime, Terce, Sext, None,
// the Eleventh Hour, the Twelfth Hour) anchor these windows:
//   Morning Office (Prime)     04:00–09:00
//   Third Hour (Terce)         09:00–12:00
//   Sixth Hour (Sext)          12:00–15:00
//   Ninth Hour (None)          15:00–17:00
//   Eleventh Hour (Vespers)    17:00–19:00
//   Twelfth Hour (Compline)    19:00–21:00
//   Midnight Office            21:00–04:00 (wraps past midnight)
function _defaultCopticHourForCurrentTime(now = new Date()) {
    const hour = now.getHours();
    if (hour >= 21 || hour < 4) return "coptic-midnight-office";
    if (hour >= 4 && hour < 9) return "coptic-morning-office";
    if (hour >= 9 && hour < 12) return "coptic-third-hour";
    if (hour >= 12 && hour < 15) return "coptic-sixth-hour";
    if (hour >= 15 && hour < 17) return "coptic-ninth-hour";
    if (hour >= 17 && hour < 19) return "coptic-eleventh-hour";
    return "coptic-twelfth-hour";
}

// Map a date to its Coptic Theotokia rubric id. Unlike the canonical hours
// above (a real, time-of-day choice), the Theotokia is not something a
// person picks -- for each day of the week there is exactly one correct
// Theotokia, prayed on that day and no other (confirmed against multiple
// independent Coptic liturgical sources). This function is the single
// source of truth for that mapping; nothing about which day's Theotokia is
// "active" should ever be a manual UI selection.
const COPTIC_THEOTOKIA_WEEKDAY_IDS = [
    "coptic-sunday-theotokia",    // Date.getDay() === 0
    "coptic-monday-theotokia",    // 1
    "coptic-tuesday-theotokia",   // 2
    "coptic-wednesday-theotokia", // 3
    "coptic-thursday-theotokia",  // 4
    "coptic-friday-theotokia",    // 5
    "coptic-saturday-theotokia",  // 6
];
function _copticTheotokiaIdForDate(date = new Date()) {
    const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
    return COPTIC_THEOTOKIA_WEEKDAY_IDS[d.getDay()];
}
// The two Coptic melody families: Adam (Sunday-Tuesday) and Batos/Watos
// (Wednesday-Saturday) -- shown as a small, genuinely informative detail
// line rather than the old "Phase 2" build-jargon leftover.
function _copticTheotokiaToneForDate(date = new Date()) {
    const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
    return d.getDay() <= 2 ? "Adam Tune" : "Batos Tune";
}

// ── App-wide color theme (dark/light), driven by real time ──────────────────
// Light 06:00–18:00, dark 18:00–06:00. This is a global app appearance
// setting -- independent of any specific tradition's canonical-hour naming
// (the "Vespers" in the old checkbox label referred to nothing but this
// light/dark toggle and was routinely mistaken for actual liturgical Vespers,
// e.g. the Coptic Agpeya's Eleventh Hour or BCP Evening Prayer).
function _defaultDarkModeForCurrentTime(now = new Date()) {
    const hour = now.getHours();
    return !(hour >= 6 && hour < 18);
}

// Single source of truth for applying the color theme: sets the body classes
// and keeps every dark-mode checkbox across every tradition's sidebar in
// sync with each other, regardless of which one the person actually clicked.
function applyDarkMode(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('light-mode', !isDark);
    ['toggle-dark', 'toggle-dark-coptic'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = isDark;
    });
}
window.applyDarkMode = applyDarkMode;
window._defaultDarkModeForCurrentTime = _defaultDarkModeForCurrentTime;

function initializeOfficeDefaultsForCurrentDateTime(modeKey) {
    const now = new Date();
    currentDate = now;

    updateDatePicker();

    const isoToday = _sharedOfficeNavigatorIsoDate(now);

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

    if (modeKey === "coptic") {
        const hourId = _defaultCopticHourForCurrentTime(now);
        const radio = document.querySelector(`input[name="cop-hour"][value="${CSS.escape(hourId)}"]`);
        if (radio) radio.checked = true;
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
// index.html sidebar buttons for East Syriac use these names.
// All delegate to the shared date helpers — no logic lives here.
function esyChangeDate(days) { changeDate(days); }
function esyToday()          { resetDate();      }

function updateSidebarForOffice() {
    const officeId   = document.querySelector('input[name="office-time"]:checked')?.value || 'morning-office';
    const isMorning  = officeId === 'morning-office';
    const isEvening  = officeId === 'evening-office';
    const isNoonday  = officeId === 'noonday-office';
    const isCompline  = officeId === 'compline-office';
    const isMpEp      = isMorning || isEvening;

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

    // Invitatory group: Venite/Jubilate and Pascha Nostrum only ever render
    // within the Morning/Evening invitatory branch; the Evening-specific
    // toggle only does anything at Evening Prayer (Morning always shows the
    // invitatory psalm regardless of this toggle's state).
    setVisible('toggle-rotate-invitatory-psalm',    isMpEp);
    setVisible('toggle-invitatory-psalm-at-evening', isEvening);
    setVisible('toggle-pascha-nostrum-all-season',  isMpEp);

    // Noonday & Compline group: each toggle only ever affects its own office.
    setVisible('toggle-noonday-day-collect',        isNoonday);
    setVisible('toggle-noonday-lesson-dol',         isNoonday);
    setVisible('toggle-rotate-compline-collect',    isCompline);
    setVisible('toggle-compline-additional-prayer', isCompline);
    setVisible('toggle-compline-lesson-dol',        isCompline);

    // Hide the whole group box (title included) when none of its contents
    // apply to the current office -- otherwise an empty titled box shell was
    // left showing (e.g. "Noonday & Compline" during Morning Prayer with
    // nothing inside it).
    function setGroupVisible(id, visible) {
        const el = document.getElementById(id);
        if (el) el.style.display = visible ? '' : 'none';
    }
    setGroupVisible('invitatory-settings-group', isMpEp);
    setGroupVisible('noonday-settings-group',    isNoonday);
    setGroupVisible('compline-settings-group',   isCompline);
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
function updateUI(explicitIsDark) {
    const isDark = typeof explicitIsDark === 'boolean'
        ? explicitIsDark
        : (document.getElementById('toggle-dark')?.checked !== false);
    applyDarkMode(isDark);
}

// ── Settings Persistence ─────────────────────────────────────────────────────
// darkMode is intentionally NOT persisted here: the color theme is now
// recomputed fresh from real time on every load (see applyDarkMode /
// _defaultDarkModeForCurrentTime), the same way every other "what's the
// right default right now" setting in this app works (canonical hour,
// office time, etc.). A manual toggle during a session is a same-session
// override only, not a sticky forever-preference -- that was the source of
// the "always opens in dark mode regardless of the time" bug.
function saveSettings() {
    const settings = {
        bcpOnly:             document.getElementById('toggle-bcp-only')?.checked || false,
        officeTime:          document.querySelector('input[name="office-time"]:checked')?.value || 'morning-office',
        angOfficeMode:       document.querySelector('input[name="ang-office-mode"]:checked')?.value || 'full',
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
        coeEasterMode:                 selectedCoeEasterMode,
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

        // darkMode is deliberately not restored from storage here -- see the
        // comment above saveSettings(). The color theme for this session was
        // already set from real time at kernel load, before any mode was
        // even chosen; loading an old saved daily-office settings blob must
        // not silently override that.
        if (s.bcpOnly && document.getElementById('toggle-bcp-only')) {
            document.getElementById('toggle-bcp-only').checked = true;
            toggleBcpOnly();
        }

        const pick = (name, val) => {
            const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
            if (el) el.checked = true;
        };
        pick('office-time',         s.officeTime);
        pick('ang-office-mode',     s.angOfficeMode);
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

        // Restore COE Easter-reckoning mode (added 2026-08-30)
        if (typeof s.coeEasterMode === 'string' &&
            (s.coeEasterMode === 'julian' || s.coeEasterMode === 'gregorian')) {
            selectedCoeEasterMode = s.coeEasterMode;
            const coeSelLoad = document.getElementById('coe-easter-mode-select');
            if (coeSelLoad) coeSelLoad.value = selectedCoeEasterMode;
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

    if (selectedMode === 'coptic-agpeya') {
        return renderCopticAgpeya();
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
    const officeFormMode     = document.querySelector('input[name="ang-office-mode"]:checked')?.value || 'full';

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
    if (isNoonday) {
        // BCP p.103-104: Noonday's own fixed psalms -- not tied to the Daily
        // Office Lectionary cycle, and not affected by the 30-Day Psalter toggle.
        psalms = 'Psalm 119:105-112, Psalm 121, Psalm 126';
    } else if (isCompline) {
        // BCP p.127-130: Compline's own fixed psalms (4, 31:1-5, 91, 134) --
        // same rationale as Noonday above.
        psalms = 'Psalm 4, Psalm 31:1-5, Psalm 91, Psalm 134:1-2';
    } else if (use30Day) {
        const dayOfMonth = currentDate.getDate();
        const psalmEntry = psalterCycle.find(p => p.day === dayOfMonth);
        if (psalmEntry) psalms = isMorning ? psalmEntry.morning : psalmEntry.evening;
    } else {
        psalms = dailyData?.psalms_mp || dailyData?.psalms_morning || dailyData?.psalms || '';
        if (isEvening) {
            // Josh's settled decision (2026-07-09): where the BCP Holy Days table
            // offers a genuine "or" alternative for Evening Prayer (currently
            // Saint Mary the Virgin and Saint Michael and All Angels), offer both
            // via a toggle rather than silently picking one -- same pattern as
            // the Noonday Collect / Short Lesson toggles above.
            const altToggleId = dailyData?.alt_ep_toggle_id;
            const useAlt = altToggleId && (document.getElementById(`toggle-${altToggleId}-alt`)?.checked ?? false);
            psalms = (useAlt && dailyData?.psalms_ep_alt) || dailyData?.psalms_ep || dailyData?.psalms_evening || dailyData?.psalms || '';
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
    // The fallback chain checks, in order: this year's field, the other year's
    // field, then a non-year "mp"/"ep" field (added 2026-07-08 for Easter Day,
    // Good Friday, and Holy Saturday -- these three days have a genuine AM/PM
    // structure in the BCP, not a Year One/Two structure, so their Epistle/
    // Gospel content is the same regardless of year and belongs in these plain
    // fields instead), then the fully generic single-reading field.
    const otherYear = litYear === 'year1' ? 'year2' : 'year1';

    // Josh's decision, 2026-07-10: same toggle pattern as the EP alt below, but
    // for a genuine Morning Prayer OT alternative (currently only Good Friday's
    // "Wisdom 1:16-2:1,12-22, or Genesis 22:1-14" Year One reading, BCP p.956).
    // Unlike the EP alt, this is NOT looked up across both years -- the
    // alternate is tied to one specific year's own primary reading (Good
    // Friday's Year Two OT, Lamentations, has no BCP alternate at all), so
    // falling back to the other year's alt field here would wrongly show
    // Genesis as a substitute for Lamentations, which the BCP never offers.
    const altMpToggleId = dailyData?.alt_mp_toggle_id;
    const useAltMp = altMpToggleId && (document.getElementById(`toggle-${altMpToggleId}-alt`)?.checked ?? false);

    let morningOT      = (useAltMp && dailyData[`reading_ot_mp_alt_${litYear}`])
                         || dailyData[`reading_ot_mp_${litYear}`]      || dailyData[`reading_ot_mp_${otherYear}`]      || dailyData['reading_ot_mp']      || dailyData['reading_ot']      || '';
    let morningEpistle = dailyData[`reading_epistle_mp_${litYear}`]  || dailyData[`reading_epistle_mp_${otherYear}`]  || dailyData['reading_epistle_mp']  || dailyData['reading_epistle']  || '';
    let morningGospel  = (gospelPlacement === 'morning' || gospelPlacement === 'both')
                         ? (dailyData[`reading_gospel_mp_${litYear}`] || dailyData[`reading_gospel_mp_${otherYear}`] || dailyData['reading_gospel_mp'] || dailyData['reading_gospel'] || '') : '';

    // Josh's settled decision (2026-07-09): same alt-EP toggle as the psalm
    // selection above -- Saint Mary the Virgin and Saint Michael and All Angels
    // both have a real BCP "or" alternative for the Evening Prayer OT and
    // Gospel readings; check it once here and prefer the alt fields when set.
    const altEpToggleId = dailyData?.alt_ep_toggle_id;
    const useAltEp = altEpToggleId && (document.getElementById(`toggle-${altEpToggleId}-alt`)?.checked ?? false);

    let eveningOT      = (useAltEp && (dailyData[`reading_ot_ep_alt_${litYear}`] || dailyData[`reading_ot_ep_alt_${otherYear}`]))
                         || dailyData[`reading_ot_ep_${litYear}`]      || dailyData[`reading_ot_ep_${otherYear}`]      || dailyData['reading_ot_ep']      || dailyData['reading_ot']      || '';
    let eveningEpistle = dailyData[`reading_epistle_ep_${litYear}`]  || dailyData[`reading_epistle_ep_${otherYear}`]  || dailyData['reading_epistle_ep']  || dailyData['reading_epistle']  || '';
    let eveningGospel  = (gospelPlacement === 'evening' || gospelPlacement === 'both')
                         ? ((useAltEp && (dailyData[`reading_gospel_ep_alt_${litYear}`] || dailyData[`reading_gospel_ep_alt_${otherYear}`]))
                            || dailyData[`reading_gospel_ep_${litYear}`] || dailyData[`reading_gospel_ep_${otherYear}`] || dailyData['reading_gospel_ep'] || dailyData['reading_gospel'] || '') : '';

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
    // Daily Devotions for Individuals and Families (BCP p.137-140) is a shorter
    // form of each office. When selected, use the office's devotionSequence
    // (data/rubrics.json) instead of its full sequence. Falls back to the full
    // sequence if an office has no devotionSequence defined (e.g. offices from
    // other traditions that don't go through this same rubric structure).
    const sequenceToRender = (officeFormMode === 'devotion' && activeRubric?.devotionSequence)
        ? activeRubric.devotionSequence
        : (activeRubric?.sequence || []);
    for (let item of sequenceToRender) {
        item = item.trim();

        let compId = item.replace('[rite]', rite);

        if (compId === 'bcp-absolution-slot') {
            const ritePrefix = rite === 'rite1' ? 'r1' : 'r2';
            compId = `bcp-absolution-${ritePrefix}-${minister}`;
        } else if (compId === 'comm-creed-slot') {
            compId = creedSelection;
        } else if (compId === 'bcp-suffrages-slot') {
            // BCP p.54/96: "Then follows one of these sets of Suffrages" -- A and B
            // are equally authorized alternative forms. Only A existed until now;
            // fixed 2026-07-08 by adding B and rotating between them daily, same
            // convention as Venite/Jubilate and the Second Collect rotation.
            if (suffragesChecked) {
                const rotateSuffrages = document.getElementById('toggle-rotate-suffrages')?.checked ?? true;
                const useB = rotateSuffrages && (getDailyRotationIndex(currentDate, 2) === 1);
                compId = useB ? `bcp-suffrages-b-${rite}` : `bcp-suffrages-${rite}`;
            } else { continue; }
        }

        // VARIABLE_OPENING — seasonal opening sentence
        if (item === 'VARIABLE_OPENING') {
            // Holy Week, Trinity Sunday, and All Saints each have their own distinct
            // BCP opening sentence (pp.38-40/76-77) that the simple per-season lookup
            // below can't reach (Holy Week sits inside "lent", Trinity Sunday and All
            // Saints inside "ordinary"). Fixed 2026-07-08 via a lightweight override
            // field on just these entries, same pattern as the canticle precedence field.
            const openingOverride = dailyData?.opening_sentence_override;
            const comp = (openingOverride && appData.components.find(c => c.id === openingOverride))
                      || appData.components.find(c => c.id === `bcp-opening-${season}`)
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
            if (item === 'VARIABLE_READING_OT') {
                // Noonday (BCP p.105, 3 options) and Compline (BCP p.130, 4 options) each
                // offer their own suggested Short Lesson texts as an alternative to "some
                // other suitable passage of Scripture" -- previously the app silently always
                // used the day's Daily Office Lectionary reading (the "some other suitable
                // passage" branch), never the BCP's own suggested texts. Settled 2026-07-07:
                // offer both via a toggle. Default is the BCP's own suggested texts,
                // rotating daily, matching the same reasoning as Noonday's Collect toggle
                // (the office's own proper texts take priority over the borrowed-from-DOL
                // default); unchecking uses the day's DOL reading as before. Labeled "A
                // Reading" rather than "The Old Testament Lesson" here since several of the
                // BCP's own suggested texts are New Testament (Matthew, Hebrews, 1 Peter).
                if (isNoonday) {
                    title = 'A Reading';
                    const useDOL = document.getElementById('toggle-noonday-lesson-dol')?.checked ?? false;
                    if (useDOL) {
                        reading = eveningOT;
                        title = 'The Old Testament Lesson';
                    } else {
                        const noondayLessons = ['Romans 5:5', '2 Corinthians 5:17-18', 'Malachi 1:11'];
                        reading = noondayLessons[getDailyRotationIndex(currentDate, noondayLessons.length)];
                    }
                } else if (isCompline) {
                    title = 'A Reading';
                    const useDOL = document.getElementById('toggle-compline-lesson-dol')?.checked ?? false;
                    if (useDOL) {
                        reading = eveningOT;
                        title = 'The Old Testament Lesson';
                    } else {
                        const complineLessons = ['Jeremiah 14:9, 22', 'Matthew 11:28-30', 'Hebrews 13:20-21', '1 Peter 5:8-9a'];
                        reading = complineLessons[getDailyRotationIndex(currentDate, complineLessons.length)];
                    }
                } else {
                    reading = isMorning ? morningOT : eveningOT;
                    title = 'The Old Testament Lesson';
                }
            }
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
        // FIXED 2026-07-08 (Josh's decision): the table's separate "Feasts of our Lord
        // and other Major Feasts" override row is now implemented, using the new
        // `precedence` field (added to Principal Feasts and Holy Days only, not every
        // calendar entry) rather than day-of-week/season -- on these days the table
        // gives one fixed pair of canticles regardless of season or weekday: Benedictus
        // Dominus/Te Deum at Morning Prayer, Magnificat/Nunc Dimittis at Evening Prayer.
        if (item === 'VARIABLE_CANTICLE1') {
            let canticleId = null;
            let canticleLabel = '';
            const isMajorFeast = dailyData?.precedence === 'major-feast';
            const dow = currentDate.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
            if (isMajorFeast && isMorning) {
                canticleId = 'bcp-benedictus'; canticleLabel = 'Benedictus Dominus Deus';
            } else if (isMajorFeast && isEvening) {
                canticleId = 'bcp-magnificat'; canticleLabel = 'The Magnificat';
            } else if (isMorning) {
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
        // Same Major Feast handling as VARIABLE_CANTICLE1 above.
        if (item === 'VARIABLE_CANTICLE2') {
            let canticleId = null;
            let canticleLabel = '';
            const isMajorFeast = dailyData?.precedence === 'major-feast';
            const dow = currentDate.getDay();
            if (isMajorFeast && isMorning) {
                canticleId = 'bcp-te-deum'; canticleLabel = 'Te Deum Laudamus';
            } else if (isMajorFeast && isEvening) {
                canticleId = 'bcp-nunc-dimittis'; canticleLabel = 'Nunc Dimittis';
            } else if (isMorning) {
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

        // VARIABLE_CLOSING_BLESSING — Morning/Evening Prayer's closing blessing.
        // BCP p.59-60: "The Officiant may then conclude with one of the following" --
        // 3 options (2 Cor. 13:14 / Romans 15:13 / Eph. 3:20-21). Previously only
        // the first was ever shown. Fixed 2026-07-08: rotates daily, same convention
        // as Mission Prayer and the Second Collect rotation.
        if (item === 'VARIABLE_CLOSING_BLESSING') {
            const blessingIds = ['bcp-closing-blessing-1', 'bcp-closing-blessing-2', 'bcp-closing-blessing-3'];
            const rotate = document.getElementById('toggle-rotate-closing-blessing')?.checked ?? true;
            const idx = rotate ? getDailyRotationIndex(currentDate, blessingIds.length) : 0;
            const comp = appData.components.find(c => c.id === blessingIds[idx]);
            if (comp) {
                const t = resolveText(comp, rite) || comp.text || '';
                officeHtml += `<span class="component-text">${t}</span>`;
            }
            continue;
        }

        // VARIABLE_NOONDAY_COLLECT — Josh's settled decision (2026-07-07): BCP p.106
        // explicitly authorizes EITHER one of Noonday's own 4 collects OR the Collect
        // of the Day ("If desired, the Collect of the Day may be used") -- offer both
        // via a toggle rather than silently picking one. Off by default: Noonday's
        // own proper collects take priority, rotating daily, matching the BCP's own
        // ordering (the Day's Collect is presented as the secondary "if desired" option).
        if (item === 'VARIABLE_NOONDAY_COLLECT') {
            officeHtml += `<span class="rubric-text">The Collect</span>`;
            const useDayCollect = document.getElementById('toggle-noonday-day-collect')?.checked ?? false;
            let cId;
            if (useDayCollect) {
                let rawId = dailyData.collect || 'collect-default-ferial';
                cId = rawId.startsWith('bcp-') ? rawId : 'bcp-' + rawId;
                if (cId === 'bcp-collect-transfiguration') cId = 'bcp-collect-the-transfiguration-of-our-lord';
            } else {
                const noondayCollectIds = ['bcp-collect-noonday-1', 'bcp-collect-noonday-2', 'bcp-collect-noonday-3', 'bcp-collect-noonday-4'];
                const idx = getDailyRotationIndex(currentDate, noondayCollectIds.length);
                cId = noondayCollectIds[idx];
            }
            const comp = appData.components.find(c => c.id === cId);
            const t = comp ? (resolveText(comp, rite) || 'No collect appointed') : 'No collect appointed';
            officeHtml += `<span class="component-text">${t}</span>`;
            officeHtml += '<div class="ornamental-divider"><div class="div-line-left"></div><span class="ornamental-divider-glyph">✦ ✝ ✦</span><div class="div-line-right"></div></div>';
            continue;
        }

        // VARIABLE_COMPLINE_COLLECT — Compline's own proper collects (BCP p.132-133),
        // never the calendar day's Collect. Saturdays get their own collect; other
        // days rotate among the 4 general options (or stay on Option 1 if the
        // rotation toggle is off, matching the Mission Prayer convention).
        if (item === 'VARIABLE_COMPLINE_COLLECT') {
            officeHtml += `<span class="rubric-text">The Collect</span>`;
            const isSaturday = currentDate.getDay() === 6;
            let cId;
            if (isSaturday) {
                cId = 'bcp-collect-compline-saturday';
            } else {
                const complineCollectIds = ['bcp-collect-compline-1', 'bcp-collect-compline-2', 'bcp-collect-compline-3', 'bcp-collect-compline-4'];
                const rotate = document.getElementById('toggle-rotate-compline-collect')?.checked ?? true;
                const idx = rotate ? getDailyRotationIndex(currentDate, complineCollectIds.length) : 0;
                cId = complineCollectIds[idx];
            }
            const comp = appData.components.find(c => c.id === cId);
            const t = comp ? (resolveText(comp, rite) || 'No collect appointed') : 'No collect appointed';
            officeHtml += `<span class="component-text">${t}</span>`;

            if (document.getElementById('toggle-compline-additional-prayer')?.checked) {
                const addlIds = ['bcp-collect-compline-addl-1', 'bcp-collect-compline-addl-2'];
                const addlIdx = getDailyRotationIndex(currentDate, addlIds.length);
                const addlComp = appData.components.find(c => c.id === addlIds[addlIdx]);
                if (addlComp) {
                    const addlText = resolveText(addlComp, rite) || addlComp.text || '';
                    officeHtml += `<span class="component-text">${addlText}</span>`;
                }
            }
            officeHtml += '<div class="ornamental-divider"><div class="div-line-left"></div><span class="ornamental-divider-glyph">✦ ✝ ✦</span><div class="div-line-right"></div></div>';

            if (document.getElementById('toggle-examen')?.checked) {
                const ex = appData.components.find(c => c.id === 'ecu-examen');
                if (ex) {
                    officeHtml += `<span class="rubric-text">The Examen</span><div class="component-text" style="white-space:normal">${applyParagraphBreaks(ex.text)}</div>`;
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

            if (!isNoonday && document.getElementById('toggle-kyrie-pantocrator')?.checked) {
                const kp = appData.components.find(c => c.id === 'ecu-kyrie-pantocrator');
                if (kp) officeHtml += `<span class="rubric-text">Kyrie Pantocrator</span><span class="component-text">${kp.text}</span>`;
            }
            continue;
        }

        // VARIABLE_WEEKDAY_COLLECT -- ferial/weekday supplementary collect. BCP
        // p.55-57/98-99 (Morning) and p.68-70/122-124 (Evening) each offer a real
        // anthology of 7 options after the Collect of the Day -- previously the
        // app silently showed only one (Grace/Peace), every day. Per Josh's
        // decision 2026-07-08, these now rotate daily rather than needing a
        // manual pick, same convention as Mission Prayer's rotation.
        if (item === 'VARIABLE_WEEKDAY_COLLECT') {
            let wkComp = null;
            if (dailyData.collect_weekday) {
                const wkId = dailyData.collect_weekday.startsWith('bcp-')
                    ? dailyData.collect_weekday
                    : 'bcp-' + dailyData.collect_weekday;
                wkComp = appData.components.find(c => c.id === wkId);
            }
            if (!wkComp) {
                const morningCollectIds = ['bcp-collect-mp-sundays', 'bcp-collect-mp-fridays', 'bcp-collect-mp-saturdays', 'bcp-collect-renewal-of-life', 'bcp-collect-peace-morning', 'bcp-collect-grace', 'bcp-collect-guidance'];
                const eveningCollectIds = ['bcp-collect-ep-sundays', 'bcp-collect-ep-fridays', 'bcp-collect-ep-saturdays', 'bcp-collect-peace', 'bcp-collect-aid-against-perils', 'bcp-collect-protection', 'bcp-collect-presence-of-christ'];
                const collectIds = isMorning ? morningCollectIds : eveningCollectIds;
                const rotate = document.getElementById('toggle-rotate-weekday-collect')?.checked ?? true;
                const idx = rotate ? getDailyRotationIndex(currentDate, collectIds.length) : (isMorning ? 5 : 3);
                wkComp = appData.components.find(c => c.id === collectIds[idx]);
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
                // BCP p.45/85: Pascha Nostrum (Christ Our Passover) replaces the
                // Invitatory for Easter Week (Easter Day through the following
                // Saturday, day_of_season 1-7) -- mandatory. For the rest of the
                // Easter season (Easter 2 through Pentecost), the BCP permits
                // Pascha Nostrum daily but also permits the ordinary Venite/Jubilate
                // rotation every other season uses -- previously the app silently
                // used Pascha Nostrum for the entire 49-day season, every day.
                // Settled 2026-07-08: default now falls back to the normal rotation
                // after Easter Week, matching how the rest of the year behaves;
                // a toggle is available to extend Pascha Nostrum through the whole
                // season for those who prefer it.
                const isEasterWeek = season === 'easter' && (dailyData?.day_of_season ?? 99) <= 7;
                const extendPaschaNostrum = document.getElementById('toggle-pascha-nostrum-all-season')?.checked ?? false;
                const usePaschaNostrum = isEasterWeek || (season === 'easter' && extendPaschaNostrum);
                if (usePaschaNostrum) {
                    const pasch = appData.components.find(c => c.id === 'bcp-pascha-nostrum');
                    if (pasch) {
                        const pt = resolveText(pasch, rite) || pasch.text || '';
                        officeHtml += `<span class="rubric-text">Christ Our Passover</span><span class="component-text">${pt}</span>`;
                    }
                } else {
                    // BCP p.42/45 (Rite I) and p.82-83 (Rite II): "Then follows one
                    // of the Invitatory Psalms, Venite or Jubilate" -- a genuinely
                    // free daily choice with no seasonal restriction. (The former
                    // Lent->Jubilate and Lent-Friday->Psalm-95 rules here had no
                    // BCP basis and have been removed.) At Evening Prayer this is
                    // one of three authorized alternatives alongside Phos Hilaron
                    // (p.63/117), so it only renders here when the toggle below
                    // selects it instead of Phos Hilaron; at Morning Prayer it's
                    // the only variable part of the Invitatory, so it always shows.
                    const showInvitatoryPsalm = isMorning || (document.getElementById('toggle-invitatory-psalm-at-evening')?.checked ?? false);
                    if (showInvitatoryPsalm) {
                        const inviteIds = ['bcp-venite', 'bcp-jubilate'];
                        const rotate = document.getElementById('toggle-rotate-invitatory-psalm')?.checked ?? true;
                        const idx = rotate ? getDailyRotationIndex(currentDate, inviteIds.length) : 0;
                        const comp = appData.components.find(c => c.id === inviteIds[idx]);
                        if (comp) {
                            const t = resolveText(comp, rite) || comp.text || '';
                            const label = inviteIds[idx] === 'bcp-jubilate' ? 'Jubilate' : 'Venite';
                            officeHtml += `<span class="rubric-text">${label}</span><span class="component-text">${t}</span>`;
                        }
                    }
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

        // bcp-general-thanksgiving — gated behind General Thanksgiving toggle.
        // Bug found 2026-07-25: this previously had no explicit handler here and
        // fell through to the generic component-lookup fallback below, which
        // renders unconditionally — so General Thanksgiving appeared in every
        // Morning/Evening Prayer regardless of the sidebar toggle's state. The
        // toggle itself, saveSettings()/loadSettings(), and its sidebar
        // show/hide were all working; only the render-time gate was missing.
        if (item === 'bcp-general-thanksgiving') {
            if (document.getElementById('toggle-general-thanksgiving')?.checked) {
                const comp = appData.components.find(c => c.id === 'bcp-general-thanksgiving');
                if (comp) {
                    const t = resolveText(comp, rite) || comp.text || '';
                    officeHtml += `<span class="rubric-text">${comp.title || 'General Thanksgiving'}</span><span class="component-text">${t}</span>`;
                } else {
                    console.warn('[renderOffice] bcp-general-thanksgiving: component not found');
                }
            }
            continue;
        }

        // bcp-chrysostom — gated behind Prayer of St. Chrysostom toggle. Same
        // missing-handler bug as bcp-general-thanksgiving above, fixed the same
        // way. (setVisible('toggle-chrysostom', isMpEp) already correctly
        // showed/hid the toggle itself in the sidebar; it just never gated the
        // actual render.)
        if (item === 'bcp-chrysostom') {
            if (document.getElementById('toggle-chrysostom')?.checked) {
                const comp = appData.components.find(c => c.id === 'bcp-chrysostom');
                if (comp) {
                    const t = resolveText(comp, rite) || comp.text || '';
                    officeHtml += `<span class="rubric-text">${comp.title || 'Prayer of St. Chrysostom'}</span><span class="component-text">${t}</span>`;
                } else {
                    console.warn('[renderOffice] bcp-chrysostom: component not found');
                }
            }
            continue;
        }

        // bcp-phos-hilaron — one of three BCP-authorized alternatives at Evening
        // Prayer (Phos Hilaron / "some other suitable hymn" / an Invitatory Psalm,
        // p.63/117) -- skip it when the Invitatory Psalm toggle is showing the
        // other alternative instead, so only one renders, never both.
        if (item === 'bcp-phos-hilaron' && (document.getElementById('toggle-invitatory-psalm-at-evening')?.checked ?? false)) {
            continue;
        }

        // bcp-antiphon-nunc-dimittis — BCP p.134: "In Easter Season, add Alleluia,
        // alleluia, alleluia." Fixed 2026-07-08.
        if (item === 'bcp-antiphon-nunc-dimittis') {
            const comp = appData.components.find(c => c.id === 'bcp-antiphon-nunc-dimittis');
            if (comp) {
                let t = resolveText(comp, rite) || comp.text || '';
                if (season === 'easter') t += ' Alleluia, alleluia, alleluia.';
                officeHtml += `<span class="rubric-text">Antiphon</span><span class="component-text">${t}</span>`;
            }
            continue;
        }

        // ── Generic component lookup ──────────────────────────────────────────
        const DISPLAY_LABELS = {
            'bcp-confession-rite1':           'Confession of Sin',
            'bcp-confession-rite2':           'Confession of Sin',
            'bcp-confession-compline':        'Confession of Sin',
            'bcp-absolution-compline':        'Absolution',
            'bcp-absolution-r1-priest':       'Absolution',
            'bcp-absolution-r1-lay':          'Prayer for Forgiveness',
            'bcp-absolution-r2-priest':       'Absolution',
            'bcp-absolution-r2-lay':          'Prayer for Forgiveness',
            'bcp-suffrages-rite1':            'The Suffrages',
            'bcp-suffrages-rite2':            'The Suffrages',
            'bcp-suffrages-b-rite1':          'The Suffrages',
            'bcp-suffrages-b-rite2':          'The Suffrages',
            'bcp-phos-hilaron':               'O Gracious Light',
            'bcp-collect-grace':              'A Collect for Grace',
            'bcp-collect-peace':              'A Collect for Peace',
            'bcp-collect-mp-sundays':         'A Collect for Sundays',
            'bcp-collect-mp-fridays':         'A Collect for Fridays',
            'bcp-collect-mp-saturdays':       'A Collect for Saturdays',
            'bcp-collect-renewal-of-life':    'A Collect for the Renewal of Life',
            'bcp-collect-peace-morning':      'A Collect for Peace',
            'bcp-collect-guidance':           'A Collect for Guidance',
            'bcp-collect-ep-sundays':         'A Collect for Sundays',
            'bcp-collect-ep-fridays':         'A Collect for Fridays',
            'bcp-collect-ep-saturdays':       'A Collect for Saturdays',
            'bcp-collect-aid-against-perils': 'A Collect for Aid against Perils',
            'bcp-collect-protection':         'A Collect for Protection',
            'bcp-collect-presence-of-christ': 'A Collect for the Presence of Christ',
            'bcp-collect-noonday-1':          'A Collect for Noonday',
            'bcp-collect-noonday-2':          'A Collect for Noonday',
            'bcp-collect-noonday-3':          'A Collect for Noonday',
            'bcp-collect-noonday-4':          'A Collect for Noonday',
            'bcp-collect-compline-1':         'A Collect for the Evening',
            'bcp-collect-compline-2':         'A Collect for the Evening',
            'bcp-collect-compline-3':         'A Collect for the Evening',
            'bcp-collect-compline-4':         'A Collect for the Evening',
            'bcp-collect-compline-saturday':  'A Collect for Saturdays',
            'bcp-collect-compline-addl-1':    'A Prayer for the Night',
            'bcp-collect-compline-addl-2':    'A Prayer for the Night',
            'bcp-versicle-hear-our-prayer': 'Lord, Hear Our Prayer',
            'bcp-mission-prayer-mp-a':        'A Prayer for Mission',
            'bcp-mission-prayer-mp-b':        'A Prayer for Mission',
            'bcp-mission-prayer-mp-c':        'A Prayer for Mission',
            'bcp-versicles-before-prayers-compline': 'Versicles',
            'bcp-opening-blessing-compline':  'Opening Blessing',
            'bcp-help-versicle-compline':     'Our Help Is in the Name of the Lord',
            'bcp-nunc-dimittis':              'Nunc Dimittis',
            'bcp-versicle-bless-the-lord':    'Let Us Bless the Lord',
            'bcp-antiphon-nunc-dimittis':     'Antiphon',
            'bcp-benedictus':                 'The Benedictus',
            'bcp-magnificat':                 'The Magnificat',
            'bcp-te-deum':                    'Te Deum Laudamus',
            'bcp-devotion-psalm-morning':     'From Psalm 51',
            'bcp-devotion-reading-morning':   'A Reading',
            'bcp-devotion-psalm-noon':        'From Psalm 113',
            'bcp-devotion-reading-noon':      'A Reading',
            'bcp-collect-devotion-noon':      'The Collect',
            'bcp-devotion-reading-evening':   'A Reading',
            'bcp-collect-devotion-evening':   'The Collect',
            'bcp-devotion-psalm-close':       'Psalm 134',
            'bcp-devotion-reading-close':     'A Reading',
            'bcp-devotion-nunc-dimittis':     'The Song of Simeon',
            'bcp-collect-devotion-close':     'The Collect',
            'bcp-devotion-closing-blessing':  'The Blessing',
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

// ── CHURCH OF THE EAST RENDERER (rebuilt 2026-08-19) ────────────────────────
//
// Replaces the entire prior East Syriac build, which had zero source
// citations anywhere and used mechanically-invented content (e.g. a fixed
// "3 sequential psalms per weekday" Marmitha pattern with no relationship
// to the actual source). Rebuilt from A.J. Maclean, East Syrian Daily
// Offices (1894) -- public domain, archive.org item
// eastsyriandailyo00macluoft, NOT_IN_COPYRIGHT per archive.org's own
// review. See AUDIT_GOVERNANCE_LEDGER.md for the full account.
//
// STATUS: multi-session rebuild, in progress. Only Monday (Qdham/"before"
// week) Ramsha is built and verified so far. This renderer looks up an
// exact "{day}-{office}-{cycle}-sequence" key; if that exact sequence
// doesn't exist yet, it says so plainly rather than falling back to any
// placeholder or generic content. See the "_rebuild_todo" block in
// components/traditions/east-syriac/rubrics.json for what's left.
//
// Psalms are resolved from this app's own verified Bible corpus via each
// component's `psalms`/`psalmRef` fields, the same pattern already
// established for the Coptic Agpeya rebuild -- Maclean cites psalms by
// number, he doesn't supply his own translation of their text.
//
async function renderEastSyriac() {
    if (!appData || !appData.eastSyriacRubrics) {
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Loading...</h3><p>Church of the East data still loading.</p></div>`;
        return;
    }

    const rite = document.querySelector('input[name="rite"]:checked')?.value || 'rite2';

    if (window._esyTemporalOverride.active && window._esyTemporalOverride.date) {
        currentDate = window._esyTemporalOverride.date;
    }

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName  = dayNames[currentDate.getDay()];

    // Qdham ("before") / Wathar ("after") alternation, per Maclean's own rule
    // (Introduction, p.xvi): "If Sunday is 'before,' so also are Monday,
    // Wednesday, and Friday, but Tuesday, Thursday, and Saturday are
    // 'after'; and vice versa." This is NOT a single label applied uniformly
    // to every day of a calendar week -- it alternates BY WEEKDAY within
    // whichever cycle that week's Sunday carries. Content printed under
    // Maclean's "Week Before" section heading (pp.1-65) gives Monday,
    // Wednesday, and Friday's Qdham forms AND Tuesday, Thursday, and
    // Saturday's Wathar forms, side by side -- e.g. "First Tuesday" in that
    // section is the Wathar Tuesday, not a Qdham one. First computes which
    // cycle this week's SUNDAY carries, then applies the day-of-week flip.
    const QDHAM_ANCHOR_SUNDAY = new Date(2026, 0, 4); // a confirmed Qdham Sunday
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const daysSinceAnchorSunday = Math.floor((currentDate.getTime() - QDHAM_ANCHOR_SUNDAY.getTime()) / (24 * 60 * 60 * 1000));
    const weeksSinceAnchor = Math.floor(daysSinceAnchorSunday / 7);
    const sundayCycle = (((weeksSinceAnchor % 2) + 2) % 2) === 0 ? 'qdham' : 'wathar';
    const dow = currentDate.getDay(); // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
    const matchesSunday = [0, 1, 3, 5].includes(dow); // Sun, Mon, Wed, Fri share Sunday's cycle
    const cycle = matchesSunday ? sundayCycle : (sundayCycle === 'qdham' ? 'wathar' : 'qdham');
    const cycleLabel = cycle === 'qdham' ? "Qdham (\u2018Before\u2019 Week)" : "Wathar (\u2018After\u2019 Week)";

    // Honour whatever hour is actually selected in the sidebar (or the
    // auto-detected current hour if nothing is selected yet) -- even though
    // only Ramsha has real rebuilt content so far, selecting Sapra/Lelya/etc.
    // must say so honestly rather than silently substituting Ramsha.
    if (window._esyTemporalOverride.active && window._esyTemporalOverride.hourId) {
        const overrideRadio = document.querySelector(`input[name="esy-time"][value="${window._esyTemporalOverride.hourId}"]`);
        if (overrideRadio) overrideRadio.checked = true;
    } else if (!document.querySelector('input[name="esy-time"]:checked')) {
        const autoHour  = getEastSyriacHourInfo();
        const autoRadio = document.querySelector(`input[name="esy-time"][value="${autoHour.value}"]`);
        if (autoRadio) autoRadio.checked = true;
    }
    let officeKey = document.querySelector('input[name="esy-time"]:checked')?.value || 'ramsha';

    // If Cathedral mode is active but the currently selected hour is one
    // Cathedral mode doesn't offer (most often a stale selection carried
    // over from switching out of Monastic mode), fall back to Ramsha or
    // Sapra rather than silently rendering an hour the mode says shouldn't
    // be offered. A short note is shown explaining why, rather than the
    // switch happening invisibly.
    let esyModeFallbackNote = null;
    if (isEastSyriacCathedralMode() && !['sapra', 'ramsha'].includes(officeKey)) {
        const priorOfficeKey = officeKey;
        officeKey = getEastSyriacHourInfo().value; // already Cathedral-aware
        const priorLabel = { lelya: "Lelya", subaa: "Suba\u2019a", endana: "Endana" }[priorOfficeKey] || priorOfficeKey;
        esyModeFallbackNote = `${priorLabel} is offered in Monastic mode. Showing the nearest Cathedral-mode hour instead.`;
    }

    // Great Fast (Sauma) detection, via the already-existing calendar engine
    // -- no new date-computation logic needed here. Confirmed against
    // Maclean's own source (Introduction, and the "Services of the Great
    // Fast" section, pp.205-235): only TWO minor-hour relics exist in this
    // source -- Quta'a (Terce) and the "Prayer at Noon" (Sext, called
    // Endana here) -- there is no Ninth Hour (D-tsha' Sa'in/None) content
    // anywhere in Maclean. Quta'a is not a separately-timed office by 1894
    // (Maclean's own footnote: "Formerly that which follows was said as a
    // separate service three hours after the Morning Service") -- it is an
    // appendage to the tail of the Fast-season Morning Service, so it is
    // appended automatically to Sapra below rather than offered as its own
    // selectable hour.
    const isGreatFast = (typeof EastSyriacCalendar !== 'undefined')
        ? EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode }).isLenten
        : false;

    // Fixed Feasts of our Lord can fall on any day of the week, not just
    // Sunday. Maclean's own Festival material is titled for exactly this
    // ("Morning Service for Sundays, Feasts of our Lord, and Memorials of
    // Saints," esy-sunday-sapra-title) -- it was never a Sunday-exclusive
    // structure. Previously only Sunday itself triggered the Festival
    // sequences, so a Feast landing on a weekday fell through to the plain
    // ferial office, which understated Maclean's own stated scope. Checked
    // here once, reused below wherever the Sunday-only gates used to be.
    const isFeastDay = (typeof EastSyriacCalendar !== 'undefined')
        ? EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode }).commemorations.some(c => c.type === 'feast')
        : false;

    // The actual feast commemoration object (not just the boolean above),
    // reused below to resolve the two places in the Feast-of-our-Lord
    // Night Service where Maclean's own text names the specific feast
    // rather than giving fixed wording -- the "N" placeholder in the
    // third Night Anthem prayer, and the farced refrain on Psalm 78.
    const feastCommem = isFeastDay && typeof EastSyriacCalendar !== 'undefined'
        ? EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode }).commemorations.find(c => c.type === 'feast')
        : null;

    // Researched 2026-08-29, at Josh's request, beyond Maclean himself.
    // First pass: the modern Assyrian Church of the East's own published
    // Feasts-of-our-Lord list (acote.church/holy-feasts) gives exactly the
    // same seven feasts this project's calendar engine already tracks --
    // Nativity, Epiphany, Resurrection, Ascension, Pentecost,
    // Transfiguration, Cross. But Maclean's own Psalm 78 farcing (esy-
    // feast-lelya-ps78-farcing-gap) names EIGHT terms, not seven --
    // "Nativity of Christ, or Baptism, or Entrance, or Resurrection, or
    // Ascension, or Descent, or Revelation, or Cross" -- leaving two
    // unmatched at that point: "Entrance" and "Revelation."
    //
    // Second pass, requested again 2026-08-29 with instructions to keep
    // digging:
    //   - "Revelation" is now RESOLVED with good evidence: the Semantics
    //     of Ancient Hebrew Database (sahd-online.com), an academic
    //     Syriac lexicon, glosses gelyana (ܓܠܝܢܐ, "revelation, appearance,
    //     manifestation") and states directly that ‘ida dgelyana ("Feast
    //     of Revelation") is a designation for the Feast of the
    //     Transfiguration. Added to the table below.
    //   - "Entrance" is now UNDERSTOOD but still not wired. Multiple
    //     independent Syriac Christian sources (Malankara Orthodox,
    //     Syriac Orthodox parish sites) confirm ma'altho/macalto
    //     ("entrance") names the Feast of the Presentation of Christ in
    //     the Temple (Candlemas, 40 days after the Nativity) -- not Palm
    //     Sunday or the Hallowing of the Church, the two guesses in
    //     Maclean's own footnote. But every source found for this is
    //     WEST Syriac (Syriac Orthodox/Malankara) usage specifically, not
    //     confirmed for the East Syriac tradition Maclean himself
    //     documents; and more concretely, Presentation is not one of the
    //     seven Feasts of our Lord this project's calendar engine tracks
    //     at all -- unlike "Revelation," where the target feast
    //     (Transfiguration) was already tracked and only the TERM needed
    //     resolving, "Entrance" would need a new tracked feast added to
    //     EastSyriacCalendar first, a larger change than this table. Left
    //     out of FEAST_PS78_TERMS for now; a Feast Maclean would call
    //     "Entrance" isn't currently representable by this engine at all,
    //     so there's no case where this term's absence causes a wrong
    //     answer -- only ever the same disclosed bracket-list fallback.
    const FEAST_PS78_TERMS = {
        'COE_FEAST_NATIVITY':        'the Nativity of Christ',
        'COE_FEAST_EPIPHANY':        'the Baptism',
        'COE_FEAST_RESURRECTION':    'the Resurrection',
        'COE_FEAST_ASCENSION':       'the Ascension',
        'COE_FEAST_PENTECOST':       'the Descent of the Holy Ghost',
        'COE_FEAST_TRANSFIGURATION': 'the Revelation',
        'COE_FEAST_HOLY_CROSS':      'the Cross',
    };

    const officeTitleMap = {
        sapra:  'Sapra \u2014 Morning Prayer',
        endana: "Endana \u2014 Prayer at Noon (Great Fast only)",
        ramsha: 'Ramsha \u2014 Evening Prayer',
        lelya:  'Lelya \u2014 Night Office',
        subaa:  "Suba\u2019a \u2014 Compline",
    };
    const officeTitle = officeTitleMap[officeKey] || 'Ramsha \u2014 Evening Prayer';

    // Ramsha varies by Qdham/Wathar cycle on every day of the week
    // (Maclean's own Introduction, p.xvi-xvii: this alternation is "the
    // special feature of the Evening Service"). Lelya and Sapra do NOT
    // vary by cycle on ferial weekdays -- but on Sundays, Maclean's
    // Festival Night and Morning Services explicitly do carry their own
    // "Before"/"After" forms (distinct opening psalms, and for Sapra a
    // distinct Martyrs' Anthem), confirmed directly from the Festival
    // Night/Morning Service source text (pp.155-184).
    //
    // UPDATED 2026-08-29: a weekday Feast of our Lord is NOT the same case
    // as Sunday, now that Lelya has its own real Feast-of-our-Lord content
    // (feast-lelya-sequence, built from pp.152-155) rather than borrowing
    // Sunday's. That text recites the Psalter uniformly across all 21
    // Hulali with no "before"/"after" distinction anywhere in it -- so
    // Feast Lelya specifically does not cycle, even though Feast Ramsha
    // and Sapra still do (both still reuse the Sunday-named Festival
    // sequences via festivalSequenceDayKey below, unchanged by this
    // session's work, since neither was in scope here).
    //
    // Suba'a is deliberately NOT included here even on a Feast day: its
    // own rubric (see esy-sunday-lelya-title's Feast-extras block, and the
    // earlier Feast-of-our-Lord build note) says "on Memorials"
    // specifically, not Feasts, so it stays keyed to the real day-of-week
    // regardless.
    // Wednesday Lelya is a further, narrower exception on top of the above:
    // Maclean's own Introduction (p.xv) states the Motwa itself "varies with
    // the season and day, except on Wednesdays, when special anthems are
    // said, one for weeks 'before,' one for weeks 'after'" -- confirmed
    // directly from the two Wednesday Motwa texts themselves (pp.130-150),
    // which are headed "WEDNESDAY 'BEFORE'" and "WEDNESDAY 'AFTER'"
    // respectively. So on a ferial (non-Feast) Wednesday specifically,
    // Lelya also needs the qdham/wathar suffix, even though no other
    // ferial weekday's Lelya varies by cycle.
    const cycleVaryingOffices = (dayName === 'sunday' || isFeastDay)
        ? ['ramsha', 'lelya', 'sapra'].filter(k => !(isFeastDay && k === 'lelya'))
        : (dayName === 'wednesday' ? ['ramsha', 'lelya'] : ['ramsha']);

    // A weekday Feast reuses the Sunday-named Festival sequences directly
    // (sunday-ramsha-qdham-sequence, etc.) rather than sequences keyed to
    // the real weekday name, which don't exist and were never meant to --
    // Maclean gives one Festival structure for Sundays, Feasts, and
    // Memorials alike, not a separate weekday-Feast variant. Suba'a and
    // Endana are unaffected: they stay keyed to the real dayName since
    // cycleVaryingOffices never includes them.
    const festivalSequenceDayKey = (isFeastDay && dayName !== 'sunday') ? 'sunday' : dayName;
    let sequenceKey = cycleVaryingOffices.includes(officeKey)
        ? `${festivalSequenceDayKey}-${officeKey}-${cycle}-sequence`
        : `${dayName}-${officeKey}-sequence`;

    // During the Great Fast, ferial Sapra (weekdays only -- Sunday's Fast
    // Morning Service is Festival, out of scope here as elsewhere) uses a
    // structurally distinct sequence per Maclean's own Fast-season Morning
    // Service rubric (different opening prayers, different psalms, no
    // Martyrs' Anthem), not the ordinary ferial one.
    if (officeKey === 'sapra' && isGreatFast && dayName !== 'sunday') {
        sequenceKey = `${dayName}-sapra-fast-sequence`;
    }

    // During the Great Fast, ferial Lelya (weekdays only -- Sunday's Fast
    // Night Service is Festival, out of scope here as elsewhere) is its
    // own distinct office, not the ordinary ferial one with a Canon
    // spliced in. Confirmed 2026-08-29 by re-checking the complete Fast
    // Night Service text directly (pp.211-223): it has its own opening
    // Canon, its own fixed seasonal Tishbukhta (Mar Abraham of Izla on
    // Weeks of the Mysteries; Mar Shimun Bar Saba'i/Mar Ephraim on
    // Ordinary weeks -- both already built for Compline reuse, now reused
    // here too), and only reconverges with the ordinary ferial office at
    // its very end, where it explicitly cites "Tishbukhta for the day"
    // (that weekday's own already-built ferial Tishbukhta) and that
    // weekday's own Shubakha (Maclean: "the Shubakha (page 97) to a sad
    // tone" -- same day-keyed Shubakha table used every day, not new
    // text). This supersedes the narrower fix from 2026-08-27, which
    // (correctly, given what was in hand at the time) only spliced a bare
    // Canon citation into the ordinary sequence before that day's
    // Tishbukhta, since the fuller structure hadn't been obtained yet.
    let lelyaFastSequenceName = null;
    if (officeKey === 'lelya' && isGreatFast && dayName !== 'sunday' && typeof EastSyriacCalendar !== 'undefined') {
        const weekInSeason = EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode }).weekInSeason;
        const isMysteriesWeek = [1, 4, 7].includes(weekInSeason);
        lelyaFastSequenceName = isMysteriesWeek ? 'lelya-fast-mysteries-sequence' : 'lelya-fast-ordinary-sequence';
        sequenceKey = lelyaFastSequenceName;
    }

    // Feasts of our Lord: Lelya is its own distinct office, not the Sunday
    // Night Service borrowed via festivalSequenceDayKey. Maclean's own
    // Introduction (p.xvii) draws this exact line: "on feasts of our Lord
    // it [the Psalter] is said complete... on Sundays and other holy days
    // selections are made" -- the Sunday Night Service Maclean gives is
    // one of those "selections," genuinely shorter than what a Feast gets,
    // not a stand-in for it. Confirmed directly from the Feasts-of-our-
    // Lord Night Service text itself (pp.152-155), which recites the
    // entire Psalter across all 21 Hulali in three Motwa-separated blocks,
    // against a sequence that previously fell through to Sunday's partial
    // one for any Feast landing on a weekday. Takes priority even over a
    // Feast that happens to land on a Sunday, since Maclean's "said
    // complete" rule for feasts has no Sunday exception in the source --
    // this is a real behaviour change from before (a weekday Feast used
    // to get Sunday's Lelya; now every Feast gets its own), disclosed
    // here rather than left implicit. Excluded from isGreatFast, which
    // takes priority above if both are somehow true (Annunciation can
    // fall within Lent in some years; Maclean's treatment of that overlap
    // was not found during this session's source review, so the existing,
    // already-verified Fast handling is left to win rather than guessing).
    if (officeKey === 'lelya' && isFeastDay && !lelyaFastSequenceName) {
        sequenceKey = 'feast-lelya-sequence';
    }

    // Endana ("Prayer at Noon in the Fast") has no content outside the
    // Great Fast -- Maclean gives it no existence there, so it is not a
    // "not yet rebuilt" gap outside the Fast, but genuinely not part of
    // this office on non-Fast days.
    let sequence = (officeKey === 'endana' && !isGreatFast)
        ? null
        : appData.eastSyriacRubrics?.[sequenceKey];

    // Weeks of the Mysteries: confirmed directly from Maclean's own 1894
    // Kalendar appendix (p.271, footnote 2 -- not a secondary source):
    // "The first, fourth, and seventh weeks of the Fast are called the
    // 'Weeks of the Mysteries' (sacrament)." This settles all three weeks
    // by number, matching the two already independently confirmed from the
    // modern ACOE Diocese of Western Europe lectionary (First Week = week 1,
    // Middle Week = week 4) and resolving the previously-unidentified third
    // week as week 7 (the last week of the Fast, ending in Hosannas/Palm
    // Sunday). On these weeks Maclean directs a distinct farced psalm block
    // (Ps.113/93/148/149/150/117, transcribed as esy-fast-sapra-mysteries-
    // psalm-block) in place of the ordinary Fast-season fixed-psalm set
    // (esy-sapra-fixed-psalms) at the same point in ferial Fast Sapra.
    // weekInSeason is already computed by the calendar engine (1-based,
    // reset every Sauma) -- no new date-computation logic is needed here.
    if (officeKey === 'sapra' && isGreatFast && dayName !== 'sunday' && sequence && typeof EastSyriacCalendar !== 'undefined') {
        const weekInSeason = EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode }).weekInSeason;
        const isMysteriesWeek = [1, 4, 7].includes(weekInSeason);
        if (isMysteriesWeek) {
            sequence = sequence.map(id => id === 'esy-sapra-fixed-psalms' ? 'esy-fast-sapra-mysteries-psalm-block' : id);
        }
    }

    // Rogation of the Ninevites (Ba'utha d'Ninwaye): three days (Monday
    // through Wednesday), three weeks before the Great Fast, per Maclean
    // pp.226-228. The calendar engine already computes this window
    // (isNinevehFast, ninevehFast) for fasting-character labeling
    // elsewhere -- reused here rather than recomputed. Applies to Lelya
    // only; nothing transcribed so far touches Ramsha, Sapra, or Suba'a
    // for these three days (Suba'a's own rubric here, p.228 -- "said at
    // the Evening Service as in the Fast" -- is informational, not a
    // structural change: the already-complete, always-selectable Suba'a
    // office applies on these days exactly as on any other, so no new
    // wiring is needed for it).
    if (officeKey === 'lelya' && dayName !== 'sunday' && sequence && typeof EastSyriacCalendar !== 'undefined') {
        const isNineveh = EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode }).isNinevehFast;
        if (isNineveh) {
            // Qaltha: Maclean's own rubric (p.228) directs the same Qaltha
            // and psalms "as on ordinary Sundays 'after'" on all three
            // Rogation days -- esy-sunday-qaltha-rubric plus
            // esy-sunday-lelya-psalms-after-ordinary, both of which exist
            // now that the Sunday Festival Night Service has been built
            // (this cross-reference was originally disclosed as
            // unresolvable when the Rogation content was first
            // transcribed, before that Sunday material existed).
            const weekdayQalthaIds = {
                monday:    'esy-lelya-monday-qaltha',
                tuesday:   'esy-lelya-tuesday-qaltha',
                wednesday: 'esy-lelya-wednesday-qaltha',
            };
            const weekdayQalthaId = weekdayQalthaIds[dayName];
            if (weekdayQalthaId) {
                sequence = sequence.flatMap(id => id === weekdayQalthaId
                    ? ['esy-sunday-qaltha-rubric', 'esy-sunday-lelya-psalms-after-ordinary']
                    : [id]);
            }

            // Tishbukhta: Maclean gives distinct texts for Monday and
            // Wednesday of the Rogation (pp.226-227). No Tuesday-specific
            // text is given anywhere in the transcribed source, so
            // Tuesday's ordinary ferial Tishbukhta is left in place rather
            // than guessed at -- a disclosed gap, not a silent one.
            const tishbukhtaSwap = {
                monday:    ['esy-lelya-tishbukhta-monday',    'esy-nineveh-tishbukhta-mar-john'],
                wednesday: ['esy-lelya-tishbukhta-wednesday', 'esy-nineveh-tishbukhta-wednesday'],
            };
            const swap = tishbukhtaSwap[dayName];
            if (swap) {
                sequence = sequence.map(id => id === swap[0] ? swap[1] : id);
            }

            // Hallelujah between the Hulali: a distinctive extended form
            // said during the Rogation (pp.227-228). Maclean's own text
            // states only that it is said "between the Hulali," without
            // stating how many times across the day's seven Hulala --
            // inserted once, after the day's final Hulala and before the
            // Qaltha, as the most defensible single reading of the source.
            // Disclosed here and in the component's own meta rather than
            // assumed to repeat between every pair without textual basis.
            const lastHulalaOfDay = {
                monday:    'esy-hulala-7',
                tuesday:   'esy-hulala-14',
                wednesday: 'esy-hulala-21',
            };
            const lastHulala = lastHulalaOfDay[dayName];
            if (lastHulala) {
                sequence = sequence.flatMap(id => id === lastHulala
                    ? [id, 'esy-nineveh-hallelujah-rubric']
                    : [id]);
            }
        }
    }

    // Resolve this new sequence's two day-specific placeholders: the
    // Shubakha said "to a sad tone" is that weekday's own already-built
    // ferial Shubakha (Maclean directs the reader back to the ordinary
    // per-weekday table at page 97, not new text), and the Tishbukhta "for
    // the day" at the very end of the office is that weekday's own
    // already-built ferial Tishbukhta -- both confirmed directly from the
    // source text, not assumed by analogy with Sapra's Fast handling.
    if (lelyaFastSequenceName && sequence) {
        sequence = sequence.map(id => {
            if (id === '__DAY_SHUBAKHA__') return `esy-lelya-${dayName}-shubakha`;
            if (id === '__DAY_TISHBUKHTA__') return `esy-lelya-tishbukhta-${dayName}`;
            return id;
        });
    }

    // Blessing of the Months: a set of anthems said at the Evening Service
    // of the first day of each month, February excepted, per Maclean's own
    // rubric (esy-blessing-months-title, p.229). Appended to the end of
    // that day's Ramsha sequence on every day-of-week, not just Sunday --
    // Maclean gives no day-of-week restriction, only a date one. Uses the
    // Gregorian calendar date directly, matching how every other
    // date-driven substitution in this renderer already treats the
    // Gregorian date as authoritative (Sunday, Palm Sunday, the fixed
    // Feasts of our Lord), rather than a sunset-anticipated liturgical day.
    if (officeKey === 'ramsha' && sequence) {
        const isFirstOfMonth = currentDate.getDate() === 1 && currentDate.getMonth() !== 1; // February = month index 1
        if (isFirstOfMonth) {
            const blessingOfMonths = appData.eastSyriacRubrics?.['blessing-of-months-sequence'];
            if (blessingOfMonths) sequence = [...sequence, ...blessingOfMonths];
        }
    }

    // Quta'a (Terce) is not a separately-timed office by Maclean's own day
    // (see esy-quta-a-title's meta note) -- it is appended to the tail of
    // the Fast-season Morning Service. Splice its addendum sequence onto
    // Sapra automatically whenever the Great Fast applies, rather than
    // requiring the person to select it separately.
    if (officeKey === 'sapra' && isGreatFast && dayName !== 'sunday' && sequence) {
        const addendum = appData.eastSyriacRubrics?.['quta-a-addendum-sequence'];
        if (addendum) sequence = [...sequence, ...addendum];
    }

    // Sunday Lelya's opening psalm (Ps.86 "before" / Ps.91 "after") is
    // substituted during Advent and during the Hallowing of the Church,
    // per Maclean's own explicit rubric (p.156) -- confirmed against the
    // calendar engine's existing season keys ('subara' = Advent,
    // 'qudash-idta' = Hallowing of the Church) rather than assumed; no
    // new date-computation logic was needed; the substitution only swaps
    // which already-built component renders in that one slot.
    //
    // Palm Sunday is a further, higher-priority special case (it can never
    // coincide with Advent or the Hallowing of the Church, both outside
    // the Great Fast, so there is no real conflict between the two
    // branches below). Maclean's own rubric (p.156): "Ps. xcvi., xcvii.,
    // xcviii., then cxxi., etc., as on Sundays 'before.'" -- Palm Sunday
    // gets its own opening psalms (Ps.96-98; a disclosed gap, since
    // Maclean cites them by number only here, with no farced text given)
    // followed by the SAME "before"-form continuation (Ps.121/88/138)
    // already built into esy-sunday-lelya-psalms-before-ordinary,
    // regardless of which Qdham/Wathar cycle the calendar's own weekly
    // alternation would otherwise assign that Sunday -- so both pieces
    // are inserted together rather than the ordinary component being
    // fully replaced. isPalmSunday is exposed directly by the calendar
    // engine (EastSyriacCalendar.getDayClass), which already computed
    // Palm Sunday's date internally for anaphora assignment; no new
    // date-computation logic was needed here either.
    if (officeKey === 'lelya' && (dayName === 'sunday' || isFeastDay) && sequence && typeof EastSyriacCalendar !== 'undefined') {
        // NOTE 2026-08-29: isFeastDay is included in this condition from
        // when Feasts of our Lord still borrowed Sunday's own Lelya
        // sequence. Now that they have their own (feast-lelya-sequence),
        // `sequence` here holds that content instead on a Feast day, and
        // none of ordinaryId/Palm-Sunday/Advent/Hallowing ids below occur
        // in it -- so every operation in this block is a harmless no-op
        // for Feast days, not a functional bug, just now-unnecessary work.
        // Left as-is rather than narrowed further, to avoid touching more
        // of this block than the specific dead code Josh asked about.
        const dayClass = EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode });
        const ordinaryId = cycle === 'qdham' ? 'esy-sunday-lelya-psalms-before-ordinary' : 'esy-sunday-lelya-psalms-after-ordinary';

        if (dayClass.isPalmSunday) {
            sequence = sequence.flatMap(id => id === ordinaryId
                ? ['esy-sunday-lelya-palm-sunday', 'esy-sunday-lelya-psalms-before-ordinary']
                : [id]);
        } else {
            const season = dayClass.season;
            let substituteId = null;
            if (season === 'subara') {
                substituteId = cycle === 'qdham' ? 'esy-sunday-lelya-advent-before' : 'esy-sunday-lelya-advent-after';
            } else if (season === 'qudash-idta') {
                substituteId = cycle === 'qdham' ? 'esy-sunday-lelya-hallowing-before' : 'esy-sunday-lelya-hallowing-after';
            }
            if (substituteId) {
                sequence = sequence.map(id => id === ordinaryId ? substituteId : id);
            }
        }

        // NOTE 2026-08-29: a block previously lived here that spliced
        // Feast-of-our-Lord content (esy-qali-dshahra-feasts-note,
        // esy-night-anthem-prayer-third, esy-night-anthem-prayer-after-
        // nativity) into the Sunday Lelya sequence whenever a Feast of
        // our Lord fell on a Sunday. It is removed: this session built
        // the real Feast-of-our-Lord Night Service (feast-lelya-sequence,
        // pp.152-155), and the sequenceKey override above now routes
        // every Feast of our Lord's Lelya there directly -- including a
        // Feast that happens to fall on a Sunday, which no longer reaches
        // this Sunday-specific code path at all. All three components
        // that block used to insert are preserved and now wired directly
        // into feast-lelya-sequence instead (see that sequence in
        // rubrics.json). The one piece of that block's own reasoning
        // worth keeping on record: esy-third-motwa-note ("The Third
        // Motwa, of the Company of the Catholici", p.153) was
        // deliberately left unwired for a long time because its single
        // transcribed sentence doesn't state clearly enough what triggers
        // a "Third Motwa" occasion to gate it safely against a date
        // condition. That concern no longer applies here: feast-lelya-
        // sequence includes it unconditionally as a fixed rubric within
        // the Feast Night Service structure itself, not gated against any
        // date condition of its own -- it always occurs at the same fixed
        // point in that one office, so the original worry (wiring it "on
        // a guess" against an unclear date trigger) doesn't arise.
    }

    // Sunday Night Service Tishbukhta seasonal selection, and the
    // Sunday-in-Fast Canon (pp.205-206) -- content built 2026-08-29,
    // wired here as a separate step per Josh's direction.
    //
    // BUG FOUND AND FIXED HERE: the three Motwa-following Tishbukhta
    // (esy-sunday-lelya-tishbukhta-mar-babai-great, -mar-babai-nisibis,
    // -mar-george) previously had NO seasonal-selection logic anywhere in
    // this renderer and all three rendered unconditionally, every Sunday
    // of the year, despite Maclean's own headings explicitly restricting
    // each: Mar Babai the Great "on Sundays from Advent to Epiphany"
    // (season 'subara'), Mar George "for the Hallowing of the Church"
    // (season 'qudash-idta'), and Mar Babai of Nisibis "for all Sundays
    // of the year" (the year-round default, used whenever neither more
    // specific season applies). Fixed using the exact same season-check
    // pattern already working above for the Ps.86/91 Advent/Hallowing
    // substitution -- no new date logic needed, just applying the
    // existing pattern to content it had never been applied to.
    //
    // On the five Sundays of the Great Fast specifically, Maclean directs
    // that the Tishbukhta by Mar Saurishu Catholicos is said after the
    // Motwa instead -- so isGreatFast takes priority over the ordinary
    // three-way seasonal selection above.
    //
    // esy-sunday-lelya-tishbukhta-mar-narsai is deliberately left
    // untouched and unconditional. CONFIRMED 2026-08-29 (previously a
    // disclosed judgment call, not a checked fact): re-read directly
    // against the source, its heading is printed simply as "TISHBUKHTA by
    // Mar Narsai" -- none of the restrictive phrasing Maclean uses for the
    // genuinely restricted alternatives above it ("... on Sundays from
    // Advent to Epiphany"; "... for the Hallowing of the Church"; contrast
    // the third alternative there, explicitly headed "for all Sundays of
    // the year"). It is also structurally separate from that earlier
    // three-way set, falling after the Shubakha and its Continuation
    // rather than among the Motwa-adjacent alternatives. No restriction is
    // stated for it anywhere in the source -- said every Sunday.
    //
    // Palm Sunday is excluded from all of the Fast-specific substitutions
    // below (Canon, Mar Saurishu's Tishbukhta): Maclean gives Palm Sunday
    // its own distinct opening (Ps.96-98, already handled above) rather
    // than grouping it with "the five Sundays of the Fast" the Canon
    // rubric names, and nothing in this session's source review found
    // Palm-Sunday-specific text for either the Canon or Mar Saurishu's
    // Tishbukhta -- excluding it here is a disclosed assumption based on
    // its already-established special treatment elsewhere in this same
    // function, not a confirmed source citation.
    if (officeKey === 'lelya' && dayName === 'sunday' && sequence && typeof EastSyriacCalendar !== 'undefined') {
        const dayClass2 = EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode });
        const isFastSundayProper = isGreatFast && !dayClass2.isPalmSunday;
        const season2 = dayClass2.season;
        const motwaTishbukhtaIds = [
            'esy-sunday-lelya-tishbukhta-mar-babai-great',
            'esy-sunday-lelya-tishbukhta-mar-babai-nisibis',
            'esy-sunday-lelya-tishbukhta-mar-george'
        ];
        let selectedTishbukhtaId;
        if (isFastSundayProper) {
            selectedTishbukhtaId = 'esy-fast-sunday-lelya-tishbukhta-mar-saurishu';
        } else if (season2 === 'subara') {
            selectedTishbukhtaId = 'esy-sunday-lelya-tishbukhta-mar-babai-great';
        } else if (season2 === 'qudash-idta') {
            selectedTishbukhtaId = 'esy-sunday-lelya-tishbukhta-mar-george';
        } else {
            selectedTishbukhtaId = 'esy-sunday-lelya-tishbukhta-mar-babai-nisibis';
        }
        let insertedMotwaTishbukhta = false;
        sequence = sequence.flatMap(id => {
            if (motwaTishbukhtaIds.includes(id)) {
                if (insertedMotwaTishbukhta) return [];
                insertedMotwaTishbukhta = true;
                return [selectedTishbukhtaId];
            }
            return [id];
        });

        if (isFastSundayProper) {
            sequence = sequence.flatMap(id => id === 'esy-sunday-lelya-hulali-before-rubric'
                ? ['esy-fast-sunday-lelya-canon', 'esy-fast-sunday-lelya-canon-prayer', id]
                : [id]);
        }
    }

    // Sunday-in-Fast Morning Service opening prayers (p.207), replacing
    // the two ordinary Sunday opening prayers on the five Sundays of the
    // Fast. Same Palm Sunday exclusion and same disclosed-assumption
    // reasoning as the Lelya block above.
    if (officeKey === 'sapra' && dayName === 'sunday' && isGreatFast && sequence && typeof EastSyriacCalendar !== 'undefined') {
        const isFastSundayProperSapra = !EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode }).isPalmSunday;
        if (isFastSundayProperSapra) {
            sequence = sequence.map(id => {
                if (id === 'esy-sunday-sapra-prayer-make-us-worthy') return 'esy-fast-sunday-sapra-prayer-grant-us';
                if (id === 'esy-sunday-sapra-prayer-enlighten-us') return 'esy-fast-sunday-sapra-prayer-receive';
                return id;
            });
        }
    }

    // Sunday Ramsha (the Festival Evening Service, including the Royal
    // Anthem) resolves two things here. Both use the calendar engine's own
    // computed data rather than anything invented for this render step.
    //
    // (1) Whether the date is also a Feast of our Lord (added 2026-08-21,
    // via EastSyriacCalendar's new fixed-feast tracking). Per Maclean's own
    // rubrics: the Suyakhi ("on feasts and memorials") is added, preceded
    // by the Feast-specific "Prayer before the Royal Anthem on Feasts of
    // our Lord," replacing the ordinary Sunday's ferial reuse of "May our
    // souls be perfected." Suba'a is deliberately NOT added on Feast days
    // -- Maclean's own rubric for it reads "on Memorials" specifically, not
    // feasts, and this project has no individual-memorial tracking yet
    // (Layer 3 of the calendar engine's own documented model) to know when
    // a Memorial is being kept. Likewise the First/Second Anthem (tied to a
    // specific person's memorial, not a Feast of our Lord) remains excluded
    // regardless of Feast status.
    //
    // (2) The season-specific Royal Anthem ending. Six endings are
    // transcribed in full from Maclean (pp.78-80); which one applies is
    // confirmed directly against the calendar engine's own documented
    // season boundaries (js/calendar-east-syriac.js's getLiturgicalYear),
    // not assumed:
    //   - qayta (Summer) and eliya-sliwa (which this engine defines as
    //     running only up to Cross Sunday) together are exactly Maclean's
    //     own "Summer and till Holy Cross Day" -- both use the same ending.
    //   - muse begins exactly at Cross Sunday in this engine, matching
    //     Maclean's "From Holy Cross Day to the Hallowing of the Church"
    //     ending precisely.
    // The Mary refrain (esy-festival-royal-anthem-mary-refrain) is spliced
    // in afterward except: the Epiphany-Shawu'a ending already has it
    // embedded in its own text (so it is not duplicated), and the
    // Advent-to-Epiphany ending's own rubric explicitly says the refrain is
    // NOT said in that period at all.
    //
    // RESOLVED 2026-08-30, per Josh's direction, after finding the actual
    // answer in Maclean's own text rather than continuing to treat this as
    // an open gap: the "Great Fast's own distinct Sunday Evening Service"
    // does not exist as a separate structure at all. Maclean's "SUNDAYS IN
    // THE FAST" section (pp.206-210) gives special provisions for the Night
    // Service and Morning Service only -- it cites the ordinary Festival
    // Night Service (pp.151, 155) as its baseline and never once mentions
    // the Evening Service, confirming Sauma Sundays simply use this same
    // ordinary Festival Evening Service unmodified. The one genuinely
    // variable piece, the Royal Anthem's concluding "last verses," is
    // covered by an explicit rubric on p.79: "From the Great Fast to
    // Pentecost these concluding verses are not said" -- i.e. Sauma and
    // Qyamta are not gaps needing a transcription that was never given;
    // Maclean states outright that no ending is used in either season.
    // This also resolves the previously-separate "Qyamta has no ending"
    // disclosure the same way, for the same reason.
    //
    // Weekday Feasts of our Lord are in scope here (2026-08-27): this
    // block, and the parallel Sunday Lelya block above, both fire whenever
    // isFeastDay is true regardless of dayName, reusing the Sunday-named
    // Festival sequences directly (see festivalSequenceDayKey above) -- no
    // separate weekday-Feast content exists in Maclean, nor is any needed,
    // since the Festival Evening/Night/Morning Service was always titled
    // for "Sundays, Feasts of our Lord, and Memorials of Saints" together,
    // not Sundays exclusively. Compline (Suba'a) is the one office that
    // does NOT follow suit: its own rubric ties it to Memorials
    // specifically, not Feasts of our Lord, so it remains keyed to the
    // real day-of-week regardless of Feast status, unchanged by this.
    if (officeKey === 'ramsha' && (dayName === 'sunday' || isFeastDay) && sequence && typeof EastSyriacCalendar !== 'undefined') {
        const dayClass = EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode });
        const isFeast  = dayClass.commemorations.some(c => c.type === 'feast');

        sequence = sequence.flatMap(id => id === '__PRAYER_BEFORE_ROYAL_ANTHEM__'
            ? (isFeast
                ? ['esy-festival-suyakhi-prayer', 'esy-festival-prayer-before-royal-anthem']
                : ['esy-laying-on-of-hands-prayer'])
            : [id]);

        // Marmitha group selection: Maclean gives four psalm groups (p.68),
        // two of which are resolvable from calendar data alone -- (a)
        // Advent-to-Epiphany, (b) every other Festival/Sunday -- and two of
        // which need individual-memorial tracking this project doesn't have
        // (Memorials falling on a Friday vs. any other day). Since this
        // sequence only ever renders for a Sunday or a Feast of our Lord,
        // groups (c)/(d) never actually apply here, so only (a)/(b) need to
        // be chosen between. esy-festival-marmitha-table (the original,
        // full four-group transcription) is kept as the historical record;
        // the season-selected component replaces it in the live sequence.
        const season = dayClass.season;
        const marmithaId = (season === 'subara' || season === 'denkha')
            ? 'esy-festival-marmitha-advent-epiphany'
            : 'esy-festival-marmitha-other-sundays';
        sequence = sequence.map(id => id === '__MARMITHA_GROUP__' ? marmithaId : id);

        const endingBySeasonKey = {
            'subara':      { ending: 'esy-festival-royal-anthem-ending-advent-epiphany', maryRefrain: false },
            'denkha':      { ending: 'esy-festival-royal-anthem-ending-epiphany-shawua',  maryRefrain: false }, // embedded already
            'shlihe':      { ending: 'esy-festival-royal-anthem-ending-apostles',         maryRefrain: true  },
            'qayta':       { ending: 'esy-festival-royal-anthem-ending-summer-cross',     maryRefrain: true  },
            'eliya-sliwa': { ending: 'esy-festival-royal-anthem-ending-summer-cross',     maryRefrain: true  },
            'muse':        { ending: 'esy-festival-royal-anthem-ending-cross-hallowing',  maryRefrain: true  },
            'qudash-idta': { ending: 'esy-festival-royal-anthem-ending-dedication',       maryRefrain: true  },
            // FIXED 2026-08-30: sauma and qyamta are not missing data -- p.79's
            // own rubric ("From the Great Fast to Pentecost these concluding
            // verses are not said") confirms no ending applies in either
            // season. `ending: null` means "known, deliberately empty," not
            // "unresolved" -- distinct from the defensive fallback below.
            'sauma':       { ending: null, maryRefrain: false },
            'qyamta':      { ending: null, maryRefrain: false },
        };
        const resolved = endingBySeasonKey[season];
        if (resolved && resolved.ending) {
            const endingIds = resolved.maryRefrain
                ? [resolved.ending, 'esy-festival-royal-anthem-mary-refrain']
                : [resolved.ending];
            sequence = sequence.flatMap(id => id === '__ROYAL_ANTHEM_ENDING__' ? endingIds : [id]);
        } else if (resolved) {
            // sauma or qyamta: known season, deliberately no ending text.
            sequence = sequence.flatMap(id => id === '__ROYAL_ANTHEM_ENDING__' ? [] : [id]);
        } else {
            // Defensive only -- every season getLiturgicalYear can return is
            // now covered above. Should never trigger; if this engine ever
            // adds a tenth season this is where a new gap would surface.
            console.warn(`[renderEastSyriac] Unrecognised season "${season}" for Royal Anthem ending -- falling through to not-yet-rebuilt rather than guessing.`);
            sequence = null;
        }

        // Prayer after the Royal Anthem, added 2026-08-30 alongside the
        // ending fix above -- previously a single static component
        // (esy-festival-prayer-after-royal-anthem) was reused unchanged for
        // every season, which was simply wrong: Maclean's own text (p.80-81)
        // gives a DIFFERENT prayer for four groups of seasons. All four
        // texts were already fully transcribed in that one reference
        // component; this only needed season-selection, not new source
        // research. The Fast/Summer/Elijah group's own prayer is a direct
        // cross-reference to the ferial p.11 prayer ("Pity us, O thou
        // Compassionate one"), reused rather than duplicated, matching how
        // this project already treats every other "as on ferias" citation.
        if (sequence) {
            const prayerAfterBySeasonKey = {
                'subara':      'esy-festival-prayer-after-royal-anthem-wonderful-dispensation',
                'denkha':      'esy-festival-prayer-after-royal-anthem-wonderful-dispensation',
                'qyamta':      'esy-festival-prayer-after-royal-anthem-wonderful-dispensation',
                'sauma':       'esy-evening-anthem-prayer',
                'qayta':       'esy-evening-anthem-prayer',
                'eliya-sliwa': 'esy-evening-anthem-prayer',
                'shlihe':      'esy-festival-prayer-after-royal-anthem-apostles',
                'muse':        'esy-festival-prayer-after-royal-anthem-cross',
                'qudash-idta': 'esy-festival-prayer-after-royal-anthem-hallowing',
            };
            const prayerAfterId = prayerAfterBySeasonKey[season];
            if (prayerAfterId) {
                sequence = sequence.map(id => id === '__PRAYER_AFTER_ROYAL_ANTHEM__' ? prayerAfterId : id);
            } else {
                console.warn(`[renderEastSyriac] Unrecognised season "${season}" for Prayer after the Royal Anthem -- falling through to not-yet-rebuilt rather than guessing.`);
                sequence = null;
            }
        }
    }

    updateSeasonalTheme('purple');

    // Cycle label is only meaningful for Ramsha; showing "Qdham"/"Wathar"
    // next to Lelya or Sapra would be inventing a distinction the source
    // doesn't draw for those offices.
    const cycleSuffix = cycleVaryingOffices.includes(officeKey) ? ` \u00b7 ${cycleLabel}` : '';

    const esyActiveLabel = document.getElementById('esy-active-hour-label');
    const esyDateLabel   = document.getElementById('esy-active-date-label');
    if (esyActiveLabel) esyActiveLabel.textContent = officeTitle;
    if (esyDateLabel) {
        const gregDateStr = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        esyDateLabel.textContent = `${gregDateStr}` + (cycleVaryingOffices.includes(officeKey) ? ` | ${cycleLabel}` : '')
                                 + (window._esyTemporalOverride.active ? ' \u2726 override' : '');
    }

    if (!sequence) {
        const isEndanaOutsideFast = (officeKey === 'endana' && !isGreatFast);
        const fallbackBody = isEndanaOutsideFast
            ? `<p class="rubric-text">Not observed outside the Great Fast</p>`
              + `<p class="component-text">Endana ("Prayer at Noon in the Fast") is one of only two minor-hour relics in Maclean's `
              + `source (the other being Quta'a, said as part of the Fast-season Morning Service); neither has any existence `
              + `outside the Great Fast (Sauma). This is not unbuilt content -- it simply isn't part of the daily office on `
              + `non-Fast days, per the primary source itself.</p>`
            : `<p class="rubric-text">Not yet rebuilt</p>`
              + `<p class="component-text">The Church of the East office content is being rebuilt from a verified primary source `
              + `(A.J. Maclean, <em>East Syrian Daily Offices</em>, 1894) one day and one hour at a time, replacing an earlier build `
              + `that had no source citations. ${dayName[0].toUpperCase()}${dayName.slice(1)}'s ${officeTitle} hasn't been `
              + `built yet. See AUDIT_GOVERNANCE_LEDGER.md for the rebuild plan.</p>`;
        document.getElementById('office-display').innerHTML =
            `<div class="office-container">`
            + `<p class="office-book-title">The Hudra</p>`
            + `<h2>${officeTitle}</h2>`
            + `<p class="liturgical-title">${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${cycleSuffix}</p>`
            + (esyModeFallbackNote ? `<p class="rubric-text">${esyModeFallbackNote}</p>` : '')
            + fallbackBody
            + `</div>`;
        return;
    }

    let officeHtml = `<div class="office-container">`;
    officeHtml += `<p class="office-book-title">The Hudra</p>`;
    officeHtml += `<h2>${officeTitle}</h2>`;
    officeHtml += `<p class="liturgical-title">${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${cycleSuffix}</p>`;
    if (esyModeFallbackNote) officeHtml += `<p class="rubric-text">${esyModeFallbackNote}</p>`;

    for (const itemId of sequence) {
        const comp = appData.components.find(c => c.id === itemId);
        if (!comp) {
            console.warn(`[renderEastSyriac] Component not found: ${itemId}`);
            continue;
        }

        officeHtml += `<span class="rubric-text">${comp.title || itemId}</span>`;

        // Feast-name substitution (see FEAST_PS78_TERMS above for the
        // research this is based on, and its two deliberately-unresolved
        // terms). Resolved at render time, not baked into the component's
        // own stored text, so both the disclosed-gap fallback and the
        // resolved forms stay backed by the same single component.
        let componentText = comp.text || '';
        if (itemId === 'esy-feast-lelya-ps78-farcing-gap' && feastCommem && FEAST_PS78_TERMS[feastCommem.key]) {
            componentText = `<p class="rubric-text">They say Psalm 78, farced thus: between each pair of clauses, `
                + `\u2018Hallelu\u2019 four times, \u2018Hallelujah in ${FEAST_PS78_TERMS[feastCommem.key]}.\u2019</p>`;
        } else if (itemId === 'esy-night-anthem-prayer-third' && feastCommem) {
            // "N" here carries none of the Psalm 78 farcing's ambiguity --
            // Maclean's own convention is simply "insert the feast's
            // name," and this calendar engine already has a correct label
            // for all seven Feasts of our Lord, not just the six above.
            componentText = componentText.replace('the festival of N', `the festival of ${feastCommem.label}`);
        } else if (itemId === 'esy-festival-incense-psalms-feast-farcing' && feastCommem && FEAST_PS78_TERMS[feastCommem.key]) {
            // Same six-term table as Psalm 78 above, reused rather than
            // duplicated -- this is the Ramsha sibling of that farcing,
            // researched together (see FEAST_PS78_TERMS's own note). This
            // template is possessive ("glorious is thy ___"), unlike the
            // Night Service's "Hallelujah in ___" -- FEAST_PS78_TERMS's
            // own values carry a leading "the" for that other template
            // ("the Nativity of Christ"), which would double up here
            // ("thy the Nativity of Christ"); stripped for this one.
            const resolved = FEAST_PS78_TERMS[feastCommem.key].replace(/^the /, '');
            componentText = componentText
                .replace('[Nativity, or Epiphany, or Entrance, or Resurrection, or Ascension, or Descent, or Revelation, or Cross]', resolved)
                .split('[the feast]').join(resolved);
        }

        // Components carrying `psalms` (plural, e.g. a Marmitha of several
        // psalms) or `psalmRef` (a single citation, e.g. a Shuraya) resolve
        // their actual verse text from this app's own verified Bible corpus,
        // appended after the rubric text already embedded in `text`.
        officeHtml += `<span class="component-text">${componentText}</span>`;

        if (Array.isArray(comp.sections)) {
            // A Hulala: a sequence of {prayer, psalms|scriptureRefs} pairs.
            // Each section's own proper prayer is rendered, followed by its
            // psalm(s) or canticle(s) resolved from the corpus, mirroring
            // Maclean's actual structure (a proper prayer before each
            // subdivision of psalms within a Hulala, not one prayer for the
            // whole Hulala).
            for (const section of comp.sections) {
                if (section.prayer) {
                    officeHtml += `<p class="component-text">${section.prayer}</p>`;
                }
                const refs = Array.isArray(section.psalms) ? section.psalms.map(p => ({ label: `Psalm ${p}`, query: 'PSALM ' + p }))
                           : Array.isArray(section.scriptureRefs) ? section.scriptureRefs.map(r => ({ label: r, query: r }))
                           : [];
                for (const ref of refs) {
                    const fullText = await getScriptureText(ref.query);
                    officeHtml += `<h4 class="passage-reference">${ref.label}</h4>`;
                    officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
                }
            }
        } else if (Array.isArray(comp.psalms)) {
            for (const psRef of comp.psalms) {
                const fullText = await getScriptureText('PSALM ' + psRef);
                officeHtml += `<h4 class="passage-reference">Psalm ${psRef}</h4>`;
                officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
            }
        } else if (comp.psalmRef) {
            const fullText = await getScriptureText('PSALM ' + comp.psalmRef);
            officeHtml += `<h4 class="passage-reference">Psalm ${comp.psalmRef}</h4>`;
            officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
        } else if (comp.scriptureRef) {
            // Non-Psalm scripture citation (e.g. the Exodus 15 canticle used as a
            // Shuraya substitute) -- comp.scriptureRef already carries the full
            // "BOOK chapter:verse" citation getScriptureText expects.
            const fullText = await getScriptureText(comp.scriptureRef);
            officeHtml += `<h4 class="passage-reference">${comp.scriptureRef}</h4>`;
            officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
        }
    }

    document.getElementById('office-display').innerHTML = officeHtml + `</div>`;

    // ── Commemorations (Layer 3: individual saints) ─────────────────────────
    // Wired 2026-08-30, per Josh's direction, after Layer 3's existing
    // cross-tradition infrastructure (SaintsResolver + CoeEligibility, first
    // built 2026-03-06 per documentation/COE_LAYER3_REINTRODUCTION.md) was
    // found still present but disconnected from this rebuilt renderer -- the
    // full office rebuild that replaced this function 2026-08-19 never
    // re-added the two-block hook the March session had put in place.
    //
    // Before re-wiring, the underlying data this hook reads from
    // (data/saints/saints-{month}.json, COE-tagged rows) was itself audited
    // and found to have the same fabrication signature as the original
    // deleted office content: zero source citations, and at least 35
    // identities scattered across 2-5 different, essentially arbitrary dates
    // each (e.g. "mar-shalita" tagged COE on five separate dates spanning
    // three different months, when Maclean and the current ACOTE diocesan
    // calendar agree on exactly one, Sept.19). 234 of 235 COE-tagged rows
    // were corrected this session -- most had their COE tag removed outright
    // for lack of any real source; a small number were confirmed against
    // Maclean 1894 p.282-283 and/or the ACOTE Diocese of Western Europe's
    // 2026 Ecclesiastical Calendar and kept, moved to their sourced date.
    // Full detail: AUDIT_GOVERNANCE_LEDGER.md, session 2026-08-30 (Layer 3).
    //
    // Silence when nothing is eligible is correct -- no fallback text, no
    // placeholder grid. Most days will now correctly show nothing here,
    // since the fabricated majority of the old data no longer carries a COE
    // tag at all pending real re-sourcing (documented as future work, not
    // silently dropped).
    const coeRaw      = await resolveCommemorations(currentDate, 'COE');
    const coeEligible = (typeof CoeEligibility !== 'undefined')
        ? CoeEligibility.filter(coeRaw)
        : [];

    const saintSection = document.querySelector('.saint-section');
    if (coeEligible.length > 0) {
        document.getElementById('date-header').innerText = 'Commemorated Holy Figures';
        document.getElementById('date-header').style.display = '';
        if (saintSection) saintSection.style.display = '';
        document.getElementById('saint-display').innerHTML = coeEligible
            .map(s => `<div class="saint-box"><small style="color:var(--accent); font-weight:bold; text-transform:uppercase;">COE</small><strong>${s.name || 'Unknown'}</strong><p>${s.description || ''}</p></div>`)
            .join('');
    } else {
        document.getElementById('saint-display').innerHTML = '';
        document.getElementById('date-header').style.display = 'none';
        if (saintSection) saintSection.style.display = 'none';
    }
}

// ── COPTIC AGPEYA RENDERER ─────────────────────────────────────────────────────
//
// Replaces the fabricated Ethiopian Sa'atat removed 2026-08-18. Two hours
// built so far -- Morning Office ('coptic-morning-office') and Third Hour
// ('coptic-third-hour') in appData.copticRubrics -- the remaining hours
// (Sixth, Ninth, Eleventh/Vespers, Twelfth/Compline) + Midnight Office are a
// planned follow-on build. Active hour is picked via the
// input[name="cop-hour"] radio group (shared navigator, see
// SHARED_OFFICE_NAVIGATOR_CONFIGS.coptic), defaulting to Morning Office.
//
// Psalms and Gospel/Epistle lessons are resolved from this app's own
// verified Bible corpus via each rubric's `psalms`/`lesson` fields --
// O'Leary only cites these by reference, he never gives his own
// translations of them (confirmed directly against the source before this
// design was chosen).
//
async function renderCopticAgpeya() {
    if (!appData || !appData.copticRubrics || !Array.isArray(appData.copticRubrics) || appData.copticRubrics.length === 0) {
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Loading...</h3><p>Coptic Agpeya data still loading.</p></div>`;
        return;
    }

    const rite = document.querySelector('input[name="rite"]:checked')?.value || 'rite2';

    const rawSelectedHourId = document.querySelector('input[name="cop-hour"]:checked')?.value || 'coptic-morning-office';
    // "coptic-theotokia" is a UI-level generic selection, not a real rubric id
    // -- it always resolves to the specific weekday's Theotokia based on
    // currentDate (see _copticTheotokiaIdForDate), never a manual sub-choice.
    const selectedHourId = rawSelectedHourId === 'coptic-theotokia'
        ? _copticTheotokiaIdForDate(currentDate)
        : rawSelectedHourId;
    const activeRubric = appData.copticRubrics.find(r => r.id === selectedHourId)
                       || appData.copticRubrics.find(r => r.id === 'coptic-morning-office');
    if (!activeRubric) {
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Coptic Agpeya Error</h3><p class="component-text">No Agpeya rubric was found.</p></div>`;
        return;
    }

    updateSeasonalTheme('gold');

    const copActiveLabel = document.getElementById('cop-active-hour-label');
    const copDateLabel   = document.getElementById('cop-active-date-label');
    if (copActiveLabel) copActiveLabel.textContent = activeRubric.officeName || 'The Morning Office';
    if (copDateLabel) {
        copDateLabel.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    let officeHtml = `<div class="office-container">`;
    officeHtml += `<p class="office-book-title">The Coptic Agpeya</p>`;
    officeHtml += `<h2>${activeRubric.officeName || 'The Morning Office'}</h2>`;
    officeHtml += `<p class="liturgical-title">${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>`;

    for (let item of (activeRubric.sequence || [])) {
        item = item.trim();


        // VARIABLE_COP_LESSON — the scripture reading O'Leary cites by reference only
        if (item === 'VARIABLE_COP_LESSON') {
            const lesson = activeRubric.lesson;
            if (lesson && lesson.citation) {
                const text = await getScriptureText(lesson.citation);
                officeHtml += `<span class="rubric-text">${lesson.label || 'The Lesson'}</span><h4 class="passage-reference">${lesson.citation}</h4>`;
                officeHtml += `<div class="reading-text">${formatScriptureAsFlow(text)}</div>`;
            }
            continue;
        }

        // VARIABLE_COP_CANTICLE — a canticle O'Leary cites by its opening line and a
        // scripture reference only (e.g. the Nunc Dimittis, "'Lord, now lettest thou
        // thy servant depart in peace,' &c. (S. Luke ii. 29-32)") rather than printing
        // it in full. Resolved from this app's own corpus per the no-placeholder rule.
        if (item === 'VARIABLE_COP_CANTICLE') {
            const canticle = activeRubric.canticle;
            if (canticle && canticle.citation) {
                const text = await getScriptureText(canticle.citation);
                officeHtml += `<span class="rubric-text">${canticle.label || 'The Canticle'}</span><h4 class="passage-reference">${canticle.citation}</h4>`;
                officeHtml += `<div class="reading-text">${formatScriptureAsFlow(text)}</div>`;
            }
            continue;
        }

        // VARIABLE_COP_PSALMS — the fixed Psalm (51) plus the full Morning Psalm set,
        // resolved from this app's own corpus (now correctly Hebrew-numbered).
        if (item === 'VARIABLE_COP_PSALMS') {
            const psalmsSpec = activeRubric.psalms;
            if (psalmsSpec) {
                const psalmNums = [
                    ...(psalmsSpec.fixed ? [psalmsSpec.fixed] : []),
                    ...(Array.isArray(psalmsSpec.set) ? psalmsSpec.set : [])
                ];
                officeHtml += `<span class="rubric-text">The Psalms</span>`;
                for (const psNum of psalmNums) {
                    const fullText = await getScriptureText('PSALM ' + psNum);
                    officeHtml += `<h4 class="passage-reference">Psalm ${psNum}</h4>`;
                    officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
                }
            }
            continue;
        }

        // VARIABLE_COP_ANTIPHONAL_PSALM — a psalm O'Leary has interleaved verse-by-verse
        // with a troparion's refrain (currently only the Sixth Hour's Psalm 55). This app
        // does not yet render true interleaved antiphons, so the full psalm is presented
        // as its own labeled reading -- no content is omitted, only the precise
        // interleaving structure is simplified (documented in the rubric's own note).
        if (item === 'VARIABLE_COP_ANTIPHONAL_PSALM') {
            const antSpec = activeRubric.antiphonalPsalm;
            if (antSpec && antSpec.reference) {
                const fullText = await getScriptureText('PSALM ' + antSpec.reference);
                officeHtml += `<span class="rubric-text">${antSpec.label || ('Psalm ' + antSpec.reference)}</span>`;
                officeHtml += `<h4 class="passage-reference">Psalm ${antSpec.reference}</h4>`;
                officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
            }
            continue;
        }

        // VARIABLE_COP_MO_FIRST_NOCTURN_PSALM — the Midnight Office's own single-psalm
        // reading (Psalm 119) at the head of the First Nocturn.
        if (item === 'VARIABLE_COP_MO_FIRST_NOCTURN_PSALM') {
            const spec = activeRubric.firstNocturnPsalm;
            if (spec && spec.reference) {
                const fullText = await getScriptureText('PSALM ' + spec.reference);
                officeHtml += `<span class="rubric-text">The Psalm</span>`;
                officeHtml += `<h4 class="passage-reference">Psalm ${spec.reference}</h4>`;
                officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
            }
            continue;
        }

        // VARIABLE_COP_MO_SECOND_NOCTURN_PSALMS / VARIABLE_COP_MO_THIRD_NOCTURN_PSALMS —
        // O'Leary directs these nocturns to repeat the psalm sets already appointed for
        // the Eleventh and Twelfth Hours respectively ("Psalms repeated from the Office
        // of the Eleventh Hour", "The Psalms used in the Office of the Twelfth Hour are
        // repeated") rather than specifying new ones. Reused directly from those hours'
        // own rubric entries -- not re-transcribed.
        if (item === 'VARIABLE_COP_MO_SECOND_NOCTURN_PSALMS' || item === 'VARIABLE_COP_MO_THIRD_NOCTURN_PSALMS') {
            const sourceRubricId = item === 'VARIABLE_COP_MO_SECOND_NOCTURN_PSALMS' ? 'coptic-eleventh-hour' : 'coptic-twelfth-hour';
            const sourceRubric = appData.copticRubrics.find(r => r.id === sourceRubricId);
            const psalmsSpec = sourceRubric && sourceRubric.psalms;
            if (psalmsSpec) {
                const psalmNums = [
                    ...(psalmsSpec.fixed ? [psalmsSpec.fixed] : []),
                    ...(Array.isArray(psalmsSpec.set) ? psalmsSpec.set : [])
                ];
                officeHtml += `<span class="rubric-text">The Psalms</span>`;
                for (const psNum of psalmNums) {
                    const fullText = await getScriptureText('PSALM ' + psNum);
                    officeHtml += `<h4 class="passage-reference">Psalm ${psNum}</h4>`;
                    officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText)}</div>`;
                }
            } else {
                console.warn(`[renderCopticAgpeya] Could not find psalms for ${sourceRubricId} to resolve ${item}`);
            }
            continue;
        }

        // VARIABLE_COP_THEOTOKIA_SECTIONS — the Theotokia's own section/paraphrase/lection
        // pattern (Phase 2 of the Coptic Agpeya). Each rubric's theotokiaSections array
        // lists, in order, a component id (the section + its paraphrase, already combined
        // in that single component) and an optional lessonCitation. Generalized across all
        // seven days of the week rather than written per-day, since the pattern is
        // identical throughout O'Leary's Theotokia -- only the content and lesson
        // citations differ day to day.
        if (item === 'VARIABLE_COP_THEOTOKIA_SECTIONS') {
            const sections = Array.isArray(activeRubric.theotokiaSections) ? activeRubric.theotokiaSections : [];
            for (const section of sections) {
                const sectionComp = appData.components.find(c => c.id === section.component);
                if (sectionComp) {
                    const t = resolveText(sectionComp, rite) || sectionComp.text || '';
                    officeHtml += `<span class="rubric-text">${sectionComp.title || section.component}</span><div class="component-text" style="white-space:normal">${applyParagraphBreaks(t)}</div>`;
                } else {
                    console.warn(`[renderCopticAgpeya] Theotokia section component not found: ${section.component}`);
                }
                if (section.lessonCitation) {
                    const lessonText = await getScriptureText(section.lessonCitation);
                    officeHtml += `<h4 class="passage-reference">${section.lessonCitation}</h4>`;
                    officeHtml += `<div class="reading-text">${formatScriptureAsFlow(lessonText)}</div>`;
                }
            }
            continue;
        }

        // Generic component lookup — covers every cop-* fixed-text component
        // plus shared components like comm-lords-prayer.
        const comp = appData.components.find(c => c.id === item);
        if (comp) {
            const t = resolveText(comp, rite) || comp.text || '';
            officeHtml += `<span class="rubric-text">${comp.title || item}</span><div class="component-text" style="white-space:normal">${applyParagraphBreaks(t)}</div>`;
        } else {
            console.warn(`[renderCopticAgpeya] Component not found: ${item}`);
        }
    }

    document.getElementById('office-display').innerHTML = officeHtml + `</div>`;

    // Senkessar is intentionally not shown here -- parked separately per
    // governance decision 2026-08-18, not merged into the Coptic office.
    document.getElementById('saint-display').innerHTML = '';
    document.getElementById('date-header').style.display = 'none';
    const saintSection = document.querySelector('.saint-section');
    if (saintSection) saintSection.style.display = 'none';
}

// === UO MOBILE DRAWER REPAIR START ===
// This end-of-file override avoids brittle edits inside the legacy drawer code.
(function () {
    function getActiveOfficeDrawer() {
        var panels = [
            document.getElementById('east-syriac-settings'),
            document.getElementById('ethiopian-settings'),
            document.getElementById('generic-settings'),
            document.getElementById('coptic-settings'),
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
