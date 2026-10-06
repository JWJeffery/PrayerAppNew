let appData = null;
let currentDate = new Date();
let selectedMode = null;
let isHydrationComplete        = false;
let selectedHorologionOffice   = 'vespers'; // tracks active office within Horologion mode
let selectedRomanBreviaryHour  = 'lauds';   // tracks the active hour within Roman Breviary mode
let selectedEoMode = 'new_calendar'; // 'new_calendar' | 'old_calendar' — persisted in universalOfficeSettings
let selectedCoeEasterMode = 'gregorian'; // 'julian' | 'gregorian' — persisted in universalOfficeSettings
// Default changed 2026-08-30, from 'julian' to 'gregorian': confirmed via research that the
// (modern) Assyrian Church of the East -- the body this app's "Church of the East" tradition
// primarily represents -- officially adopted the Gregorian calendar in 1964. The Ancient Church
// of the East split off specifically in protest of that change and kept the Julian calendar; it
// remains available as the alternate. See AUDIT_GOVERNANCE_LEDGER.md, session 2026-08-30, for
// the full sourcing and the 100-year re-verification performed after this default changed.

// ── v5.4: Horologion diagnostics toggle ──────────────────────────────────────
// Off by default. Enable via the sidebar toggle button or from the console:
//   toggleHorologionDiagnostics()
// When enabled, variable Horologion slots show a small inline diagnostics line
// with resolvedAs, type, tone, and source layer. Fixed/liturgical text is
// never annotated — diagnostics appear only on the slots that vary by date.
let _horDiagnosticsEnabled = false;
let selectedHorologionReductionProfile = 'full'; // 'full' | 'reader' | 'educational' — display-layer only, never passed to HorologionEngine

// ── Liturgical Education Layer — Architectural Charter section 11 ────────────
// 0 = prayer only (no explanation)
// 1 = + micro-explanations   (charter 11.1 — inline gloss, "what is this?")
// 2 = + structural notes     (charter 11.2 — expandable, "how does this fit?")
// Depth 3 (charter 11.3, tradition-level) is a separate panel, not a per-item
// depth, so it is not on this scale — it is opened deliberately, not layered
// onto every element.
//
// NOTE, distinct from the above and easy to confuse: selectedHorologionReductionProfile
// also has a value literally named 'educational', but that is a COLLAPSE
// setting controlling how much body text is folded into <details> in the
// Horologion — it is about display density, not explanation. The two are
// unrelated and must not be merged.
//
// Default 1: the charter makes formation a first-class layer, and the info
// marker is the app's existing unobtrusive affordance. Change this one literal
// to 0 to make the whole layer opt-in.
let selectedExplanationDepth = 1; // 0 | 1 | 2 — display-layer only, never reaches any resolver

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
        console.warn('[selectCoeEasterMode] Invalid mode:', mode, '— defaulting to gregorian.');
        mode = 'gregorian';
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
function updateSeasonalTheme(color, isPrincipalGoldFeast) {
    let hex = '#4a7c59';
    if (color === 'purple') hex = '#6b3070';
    if (color === 'rose')   hex = '#a04060';
    // 2026-09-23: 'white' is #f5f1e4 (an actual strong white) everywhere except the two
    // days EASTER_DOCUMENTATION.md explicitly documents as "Color: White (or Gold)" --
    // Easter Day and Ascension Day, the only two places that note appears anywhere in the
    // corpus. Not extended to other Principal Feasts (Christmas, Epiphany, Trinity Sunday,
    // All Saints') since none of those carry that note; Josh can extend it if he wants to.
    if (color === 'white')  hex = isPrincipalGoldFeast ? '#d4af37' : '#f5f1e4';
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

    // Liturgical Education Layer (Charter section 11). Preloaded here because
    // applyExplanationLayer() runs synchronously at the end of each render and
    // needs the corpus already in hand. Deliberately NOT awaited into the
    // kernel's own critical path and deliberately not allowed to reject: this
    // is a soft dependency, and an office must render in full whether or not
    // its explanations are available.
    if (typeof Explanations !== 'undefined') {
        Explanations.loadAll()
            .then(() => {
                // The corpus arriving AFTER the first render was the whole
                // reason the formation layer appeared dead: loadAll() is
                // fire-and-forget, applyExplanationLayer() is synchronous, and
                // nothing re-ran once the fetch resolved. On a fast render the
                // user saw no markers at all and no error. Re-decorate what is
                // already on screen rather than re-rendering the office, which
                // would be wasteful and would scroll the reader back to the top.
                if (typeof applyExplanationLayer === 'function') {
                    applyExplanationLayer('office-display');
                }
            })
            .catch(() => { /* soft dependency — see above */ });
    }

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
            `<div class="office-container"><h3>System Error</h3><p>${_sharedOfficeNavigatorEscape(err.message)}</p></div>`;
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

    // FIXED 2026-09-25, found via a real report (Josh: live screenshot of theuniversaloffice.com
    // showing "The Universal Office" selector grid with every heading and card rendered nearly
    // illegible -- dark ink on the screen's own permanently-dark background). Root cause:
    // js/office-shell.js's applyTheme() only ever WRITES `uo-day` while body.office-active is
    // present (by design, per its own comment), but nothing ever REMOVED it on the way back out.
    // A day-themed office (uo-day added) followed by any return to the splash/mode-selection
    // screens left uo-day stuck on <body> -- and since :root's `body.uo-day` rule sets the DAY
    // ink colors unconditionally, not scoped to office-active, the always-dark entry/threshold
    // screens then painted their text in near-black day-theme ink. Reproduced exactly (pixel-
    // identical to Josh's screenshot) by forcing uo-day before calling this function. Fixed
    // symmetrically with the office-active removal directly above, matching how this class is
    // scoped everywhere else in the shell.
    document.body.classList.remove('uo-day');

    // Clear any forced office override
    window._forcedOfficeId = undefined;

    // FIXED 2026-09-03, found via a real report (Josh: "why does it say override" after simply
    // navigating to BCP and back): _esyTemporalOverride is a persistent global set by the Prev/
    // Next buttons and the date picker in East Syriac's own sidebar -- but unlike _forcedOfficeId
    // right above, nothing ever reset it on navigating away, so a stale override from any earlier
    // point in the session (testing, or just clicking Next once) would keep silently showing
    // "override" every time East Syriac was reopened, with no relationship to what the user was
    // currently doing.
    window._esyTemporalOverride = { active: false, date: null, hourId: null };

    const mainContent = document.getElementById('main-content');
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
    ministryRole: 'lay',
    // ADDED 2026-09-12. Which Oriental Orthodox sub-tradition the user keeps.
    // null means "not narrowed": every OOR row renders, which is exactly the
    // behaviour before this field existed, so no existing user loses anything.
    oorSubtradition: null,
    // ADDED 2026-09-27. Which language the Roman Breviary 1960/1962 lane renders
    // in. REVERSED 2026-09-29, per Josh's direct instruction ("Roman Brev
    // should also default to English"): 'en' is now the default, 'la' (Latin)
    // an explicit opt-in -- the original comment here had this backwards.
    romanBreviaryLanguage: 'en',
    romanBreviaryCalendar: '1960',
    // ADDED 2026-09-28. See UNIVERSAL_OFFICE_PARISH_DEDICATION_VALUES above.
    // null means "not declared" -- the Kontakion-of-the-temple clause stays
    // disclosed-not-modeled, exactly today's behaviour, so no existing user
    // loses or gains anything until they explicitly pick one.
    parishDedication: null,
    // ADDED 2026-09-28, per Josh's direct instruction -- "the profile/user
    // system." The person's own name, collected by the first-time onboarding
    // prompt below and echoed back in the profile-defaults summary. null
    // until they actually enter one -- never inferred or defaulted.
    displayName: null,
    // Whether the first-time onboarding prompt (name + role) has already run
    // for this browser. Starts false for a fresh profile; a profile migrated
    // from an existing (pre-onboarding) install is ALSO seeded false the
    // first time it's normalized, per the spec's own "should already show
    // whatever tradition/entry info they've already provided, not ask again,
    // then prompt for name and role" -- see deriveProfileFromLegacyEntryDefault's
    // sibling handling below. Once true, it stays true; the prompt never
    // reappears on its own.
    onboardingComplete: false,
    // Soft/cosmetic super-user flag -- Josh's own explicit call, 2026-09-28:
    // "build a soft/cosmetic gate for now, and later we will address users /
    // permissions." This app has NO server-side auth; localStorage is
    // editable by any visitor in their own browser's devtools, so this flag
    // gates visibility (which buttons/panels render) exactly the same trust
    // tier as the existing `?advanced=1`/`data-advanced-only` mechanism --
    // it does not and cannot gate real access to anything. The toggle itself
    // is NOT exposed on the public onboarding/profile-defaults panel; it
    // lives in the Admin Console (already gated behind advanced-tools), so a
    // casual visitor doesn't stumble into flipping it for themselves. Real
    // enforcement (a server, a shared secret checked somewhere that isn't
    // this same editable localStorage) is explicitly deferred, not solved
    // here -- do not treat this flag as actual access control.
    isSuperUser: false,
    // ADDED 2026-09-28. Which diocese's published Cycle of Prayer (see
    // data/cycles-of-prayer/schema.json) surfaces in the BCP "authorized
    // intercessions" space. A "bodySlug/dioceseShort" key (js/cycles-of-
    // prayer.js's cycleOfPrayerDioceseKey), NOT year-scoped -- the diocese
    // stays the same user choice year over year, even though the actual
    // corpus file resolved for it changes every January. null means "not
    // declared", the same as parishDedication: no existing user loses or
    // gains anything, and the rubric renders exactly as it did before this
    // field existed.
    cycleOfPrayerDiocese: null,
    // ADDED 2026-09-28. The user's own home parish within cycleOfPrayerDiocese,
    // as a slug from js/cycles-of-prayer.js's cycleOfPrayerParishSlug (the
    // corpus itself assigns no stable id -- see that file's own comment).
    // Optional even when a diocese IS declared -- highlights the week that
    // names the user's own parish, but the diocese-wide line renders either
    // way. Meaningless without cycleOfPrayerDiocese also set; normalization
    // clears it whenever the diocese is cleared.
    cycleOfPrayerParish: null,
    // ADDED 2026-09-29. Free-text fallback for a parish this app has no real
    // Cycle of Prayer entry for -- either because cycleOfPrayerDiocese has no
    // ingested content at all yet (see TEC_DIOCESE_DIRECTORY vs.
    // CYCLES_OF_PRAYER_DIOCESES in js/cycles-of-prayer.js), or because the
    // declared diocese DOES have content but doesn't happen to list this
    // specific parish. Mutually exclusive with cycleOfPrayerParish -- setting
    // one always clears the other, since a real corpus match and a free-text
    // name can't both be "the" answer at once. Never resolved against the
    // corpus (there is nothing to match); purely a record of what the person
    // typed, for their own profile summary and for a future session to build
    // on once that diocese's own cycle is eventually ingested.
    cycleOfPrayerParishOther: null,
    // ADDED 2026-09-30. The parish whose prayer intentions (a rector-managed
    // list of current requests, served by /api/v1 -- see js/parish-intentions.js
    // and documentation/PARISH_INTENTIONS.md) this reader follows in the BCP
    // "authorized intercessions" space. A server-generated slug, validated
    // ^[a-z0-9-]{1,80}$. Independent of cycleOfPrayerDiocese/Parish: following
    // a parish never requires declaring a diocese, and never changes the Cycle
    // of Prayer tiers. null means "not following any parish" -- no request is
    // ever made and the rubric renders exactly as it did before this field.
    parishIntentionsSlug: null,
    // ADDED 2026-09-30. The stateless pass POST /parishes/{slug}/join returned
    // for a parish that requires a join code (null for a public parish, or
    // before the code has been entered). Meaningless without
    // parishIntentionsSlug -- normalization nulls it whenever the slug is null.
    // Rotating the parish's code invalidates it server-side; the 401 that
    // follows clears it here (see refreshParishIntentionsForProfile) so the
    // reader is asked for the new code rather than silently shown nothing.
    parishIntentionsPass: null
});

const UNIVERSAL_OFFICE_TRADITION_MODE_MAP = {
    'anglican': 'daily',
    'unknown': 'daily',
    'church-of-the-east': 'east-syriac',
    'eastern-orthodox': 'horologion',
    'oriental-orthodox': 'coptic-agpeya',
    'latin-catholic': 'roman-breviary-dev',
    'universal': 'universal'
};

// UPDATED 2026-09-28: matched the same five names Josh confirmed directly for
// #tradition-entry and #uo-threshold-grid's own labels at the time (see
// RESUME_PROJECT_NOTE.md's Task #14 entry) -- this object was a fourth place
// quietly carrying its own, older naming ('The Episcopal Church', 'Roman
// Breviary 1960/1962' as a TRADITION label rather than an office name), found
// and fixed in the same pass rather than left as a still-open inconsistency.
// CORRECTED 2026-09-29, per Josh's direct correction: "The Tradition is
// Anglicanism. The sub-tradition is The Episcopal Church." -- never "Anglican
// Communion", which names the worldwide fellowship of ~40 independent churches.
// RE-CORRECTED 2026-10-06: the 09-29 fix was applied backwards. The label for
// this lane is the TRADITION, "Anglican"; The Episcopal Church is the church
// within it (whose 1979 BCP the lane renders) and appears only in descriptive
// text, e.g. the entry card's subtitle. The other four entries are named for
// their traditions or church families and are unchanged.
const UNIVERSAL_OFFICE_TRADITION_LABELS = {
    anglican: 'Anglican',
    'church-of-the-east': 'Church of the East',
    'eastern-orthodox': 'Eastern Orthodox Church',
    'oriental-orthodox': 'Oriental Orthodox Church',
    'latin-catholic': 'Catholic Church',
    universal: 'Universal Office selector'
};

const UNIVERSAL_OFFICE_ENTRY_PAGE_VALUES = new Set(['ask', 'tradition', 'universal']);
const UNIVERSAL_OFFICE_BOOK_OF_NEEDS_SCOPE_VALUES = new Set(['tradition', 'universal']);
const UNIVERSAL_OFFICE_ROMAN_BREVIARY_LANGUAGE_VALUES = new Set(['la', 'en']);
const UNIVERSAL_OFFICE_ROMAN_BREVIARY_CALENDAR_VALUES = new Set(['1960', '2020usa']);

// The Oriental Orthodox sub-traditions currently represented in the sanctoral.
// Josh, 2026-09-07: more are coming -- this set is expected to grow, and the
// resolver treats an unrecognised value the same as null (no narrowing).
const UNIVERSAL_OFFICE_OOR_SUBTRADITION_VALUES = new Set(['Coptic', 'Armenian', 'Syriac', 'Ethiopian']);

// ADDED 2026-09-28. A Byzantine parish's own dedication (the commemoration a
// specific church building is named for), used to resolve the Kontakion "of
// the temple" clause in the Lenten Typika Kontakion sequence (Finding T8).
// Kept in sync BY HAND with data/horologion/parish-dedications.json's entry
// ids -- that file is the single source of truth for what's selectable in
// the UI; this Set only guards a corrupted/stale localStorage value the same
// way UNIVERSAL_OFFICE_OOR_SUBTRADITION_VALUES does above. An unrecognised
// value falls back to null (no dedication declared), never a guess.
const UNIVERSAL_OFFICE_PARISH_DEDICATION_VALUES = new Set([
    'presentation-lord', 'annunciation-theotokos', 'transfiguration-lord',
    'dormition-theotokos', 'nativity-theotokos', 'exaltation-holy-cross',
    'entrance-theotokos', 'nativity-christ',
    'basil-great-circumcision', 'seraphim-sarov', 'synaxis-forerunner-john',
    'anthony-great', 'athanasius-cyril-alexandria', 'ephrem-syrian',
    'three-hierarchs', 'first-second-finding-head-john-baptist',
    'george-great-martyr', 'mark-evangelist', 'beheading-john-baptist',
    'protection-theotokos', 'john-chrysostom', 'apostle-philip',
    'apostle-andrew-first-called', 'sabas-sanctified', 'nicholas-myra',
    'spyridon-trimythous', 'protomartyr-stephen'
]);
// Self-identified liturgical role, used to gate Book of Needs content this
// project's own governance says shouldn't reach a default lay view
// (priestly, sacramental, or administered-by-one-person-over-another
// material) -- see documentation/book-of-needs-role-access-governance.json.
//
// UPDATED 2026-08-30: replaced the original three-value (lay/clergy/all)
// field with the full eight-role, order-aware ladder that governance
// document specifies, after researching and confirming (with Josh) that
// reader and subdeacon are minor orders -- not fully/sacramentally
// ordained -- in the Eastern Christian traditions this ladder was designed
// for (Eastern/Oriental Orthodox, Church of the East), while deacon,
// priest, and bishop are the major orders there. CORRECTED 2026-09-29,
// per Josh's direct correction: this "minor order" framing does NOT hold
// for the Episcopal Church/Anglican Communion -- TEC recognizes only
// three ordained orders (bishop, priest, deacon); "Reader" there is a
// licensed LAY ministry under Canon III.4, not an order at all, minor or
// otherwise. This ladder's rank ORDERING (reader < subdeacon < deacon)
// is still reused as this app's one shared Book of Needs access gate
// across every tradition, but no user-facing copy anywhere in this file
// should describe reader/subdeacon as "a minor order" unqualified -- see
// the fixed option labels in index.html and the roleLabels object below.
// The old binary let a self-identified "clergy" deacon or subdeacon see
// full priest-tier material, which directly violated this same governance
// document's own stated principle ("Subdeacon access must not unlock
// deaconal, priestly, or episcopal material merely because the user is
// not a layperson") -- this ladder closes that gap.
//
// UNIVERSAL_OFFICE_MINISTRY_ROLE_ORDER gives each role's rank on the major-
// order ladder for comparison in js/prayers.js: higher-numbered roles see
// everything lower-numbered roles see, plus their own tier. 'monastic' is
// deliberately NOT placed on this linear ladder -- it's a state of life, not
// an ordination rank (a monastic may be lay or separately ordained), so a
// self-identified monastic is treated at the layperson rank (0) for
// major-order-gated material rather than assumed to be a priest. 'all' and
// 'research-reference' both see everything (research-reference is
// semantically distinct -- study access, not an attestation of fitness to
// perform the rite -- but not narrower in what it reveals).
// ADDED 2026-09-29, per Josh's direct correction: "Lay reader is just ONE
// licensed ministry in TEC" -- TEC's Canon III.4 covers several distinct
// licensed lay ministries (Pastoral Leader, Worship Leader, Preacher,
// Eucharistic Minister, Eucharistic Visitor, Catechist), not only Reader.
// None of these is an ordination rank -- they all sit at the SAME gating
// tier as 'reader' (rank 1: licensed-lay, above plain lay, below the
// ordained deacon/priest/bishop ladder), so they're added here as
// additional selectable values rather than a separate ladder.
const UNIVERSAL_OFFICE_MINISTRY_ROLE_VALUES = new Set([
    'lay', 'reader', 'pastoral-leader', 'worship-leader', 'preacher',
    'eucharistic-minister', 'eucharistic-visitor', 'catechist',
    'subdeacon', 'deacon', 'priest', 'bishop', 'monastic', 'research-reference', 'all'
]);
const UNIVERSAL_OFFICE_MINISTRY_ROLE_ORDER = Object.freeze({
    'lay': 0,
    'reader': 1,
    'pastoral-leader': 1,
    'worship-leader': 1,
    'preacher': 1,
    'eucharistic-minister': 1,
    'eucharistic-visitor': 1,
    'catechist': 1,
    'subdeacon': 2,
    'deacon': 3,
    'priest': 4,
    'bishop': 5,
    'monastic': 0,       // state of life, not an ordination rank -- see note above
    'research-reference': 5, // sees everything, same ceiling as 'all'/'bishop'
    'all': 5,             // blunt override, sees everything
});

// ADDED 2026-09-29, per Josh's direct correction: "orders/ministries should be
// gated by tradition" -- the app already knows the user's tradition by the time
// they see this picker, so it should not offer (or word) options that don't
// apply to it, rather than showing one universal list and hoping a wording
// caveat covers the gap. Each tradition's own array is what actually appears
// in the <select>; the value set doubles as this tradition's valid-role check
// in normalizeUserProfileDefaults below.
//
// 'reader'/'subdeacon' are the only roles that vary by tradition:
// - Anglican/TEC recognizes only three ordained orders (bishop, priest,
//   deacon); "Reader" there is a licensed LAY ministry under Canon III.4, not
//   an order at all -- no "subdeacon" option exists for this tradition, and
//   "reader" carries no order/minor-order claim.
// - Eastern Orthodox, Oriental Orthodox, and the Church of the East each
//   retain reader and subdeacon as real minor clerical ranks (conferred by
//   cheirothesia), below the major orders of deacon/priest/bishop.
// - The Roman Rite as it stood before the 1972 Ministeria Quaedam reform
//   (i.e. the 1960/1962 books this app's Roman Breviary lane represents) also
//   had reader/lector as one of its four minor orders -- but classified
//   SUBDEACON as the first of the MAJOR/sacred orders, not a minor one. This
//   is a genuine East/West difference, not an oversight: labeling subdeacon
//   "a minor order" here would repeat the exact kind of error just corrected
//   for TEC, just aimed at the wrong tradition instead.
const UNIVERSAL_OFFICE_MINISTRY_ROLE_STUDY_OPTIONS = Object.freeze([
    ['research-reference', "Study/reference use -- show role-restricted material, not as an attestation of fitness to perform it"],
    ['all', 'Show everything, regardless of role'],
]);
const UNIVERSAL_OFFICE_MINISTRY_ROLE_OPTIONS = Object.freeze({
    anglican: Object.freeze([
        ['lay', 'Lay use (default)'],
        // TEC's Canon III.4 licensed lay ministries -- Reader is one of
        // several, not the only one (Josh's direct correction). All gate
        // Book of Needs content identically (see UNIVERSAL_OFFICE_MINISTRY_
        // ROLE_ORDER above, all rank 1); listed alphabetically by ministry
        // name after Reader, which stays first as the most commonly known.
        ['reader', 'I am a reader (a licensed lay ministry)'],
        ['catechist', 'I am a catechist (a licensed lay ministry)'],
        ['eucharistic-minister', 'I am a eucharistic minister (a licensed lay ministry)'],
        ['eucharistic-visitor', 'I am a eucharistic visitor (a licensed lay ministry)'],
        ['pastoral-leader', 'I am a pastoral leader (a licensed lay ministry)'],
        ['preacher', 'I am a preacher (a licensed lay ministry)'],
        ['worship-leader', 'I am a worship leader (a licensed lay ministry)'],
        ['deacon', 'I am a deacon'],
        ['priest', 'I am a priest'],
        ['bishop', 'I am a bishop'],
        ['monastic', 'I am a monastic'],
        ...UNIVERSAL_OFFICE_MINISTRY_ROLE_STUDY_OPTIONS,
    ]),
    'eastern-orthodox': Object.freeze([
        ['lay', 'Lay use (default)'],
        ['reader', 'I am a reader (a minor order)'],
        ['subdeacon', 'I am a subdeacon (a minor order)'],
        ['deacon', 'I am a deacon'],
        ['priest', 'I am a priest'],
        ['bishop', 'I am a bishop'],
        ['monastic', 'I am a monastic'],
        ...UNIVERSAL_OFFICE_MINISTRY_ROLE_STUDY_OPTIONS,
    ]),
    'oriental-orthodox': Object.freeze([
        ['lay', 'Lay use (default)'],
        ['reader', 'I am a reader (a minor order)'],
        ['subdeacon', 'I am a subdeacon (a minor order)'],
        ['deacon', 'I am a deacon'],
        ['priest', 'I am a priest'],
        ['bishop', 'I am a bishop'],
        ['monastic', 'I am a monastic'],
        ...UNIVERSAL_OFFICE_MINISTRY_ROLE_STUDY_OPTIONS,
    ]),
    'church-of-the-east': Object.freeze([
        ['lay', 'Lay use (default)'],
        ['reader', 'I am a reader (a minor order)'],
        ['subdeacon', 'I am a subdeacon (a minor order)'],
        ['deacon', 'I am a deacon'],
        ['priest', 'I am a priest'],
        ['bishop', 'I am a bishop'],
        ['monastic', 'I am a monastic'],
        ...UNIVERSAL_OFFICE_MINISTRY_ROLE_STUDY_OPTIONS,
    ]),
    'latin-catholic': Object.freeze([
        ['lay', 'Lay use (default)'],
        ['reader', 'I am a reader (a minor order)'],
        ['subdeacon', 'I am a subdeacon (a major order, pre-1972 Latin Rite)'],
        ['deacon', 'I am a deacon'],
        ['priest', 'I am a priest'],
        ['bishop', 'I am a bishop'],
        ['monastic', 'I am a monastic'],
        ...UNIVERSAL_OFFICE_MINISTRY_ROLE_STUDY_OPTIONS,
    ]),
});
// Shown when no tradition is on file yet (a fresh profile, or the
// tradition-agnostic Universal Office selector context) -- the full role set
// so nobody's existing choice is hidden before we know which tradition's
// rules to apply, with neutral (unqualified) reader/subdeacon labels since
// asserting either classification would be a guess at this point.
const UNIVERSAL_OFFICE_MINISTRY_ROLE_OPTIONS_DEFAULT = Object.freeze([
    ['lay', 'Lay use (default)'],
    ['reader', 'I am a reader'],
    ['subdeacon', 'I am a subdeacon'],
    ['deacon', 'I am a deacon'],
    ['priest', 'I am a priest'],
    ['bishop', 'I am a bishop'],
    ['monastic', 'I am a monastic'],
    ...UNIVERSAL_OFFICE_MINISTRY_ROLE_STUDY_OPTIONS,
]);

function getMinistryRoleOptionsForTradition(traditionKey) {
    return UNIVERSAL_OFFICE_MINISTRY_ROLE_OPTIONS[traditionKey] || UNIVERSAL_OFFICE_MINISTRY_ROLE_OPTIONS_DEFAULT;
}

function populateMinistryRoleSelect(selectEl, traditionKey, currentValue) {
    if (!selectEl) return;
    const options = getMinistryRoleOptionsForTradition(traditionKey);
    selectEl.innerHTML = options.map(([value, label]) =>
        `<option value="${escapeHtmlForOptionLabel(value)}">${escapeHtmlForOptionLabel(label)}</option>`
    ).join('');
    const validValues = new Set(options.map(o => o[0]));
    selectEl.value = validValues.has(currentValue) ? currentValue : 'lay';
}

function populateMinistryRoleSelects(traditionKey, currentValue) {
    ['profile-ministry-role', 'uo-onboarding-role'].forEach(id => {
        populateMinistryRoleSelect(document.getElementById(id), traditionKey, currentValue);
    });
}

function escapeHtmlForOptionLabel(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ADDED 2026-09-29, per Josh's direct correction: fields tied to ONE
// tradition (Oriental Orthodox sub-tradition, Roman Breviary language, the
// Byzantine parish dedication picker, and the Anglican-only Diocese/home
// parish pair) should not show at all until the matching tradition is
// actually declared -- they were previously all shown flatly regardless of
// the declared tradition, exactly the same "one universal list" problem
// already fixed for the ministry-role picker above, just at the level of
// whole field rows instead of one field's own options. Each such field's
// wrapper carries `data-tradition-field="<tradition-key>"` in index.html;
// this shows only the one matching the current tradition and hides the
// rest. A field with no such attribute (name, tradition picker itself, the
// entry/Book-of-Needs settings, the ministry-role picker, the
// explore-other-offices checkbox) is unaffected -- those apply regardless
// of tradition.
function syncProfileFieldVisibilityForTradition(traditionKey) {
    document.querySelectorAll('[data-tradition-field]').forEach(function (field) {
        const matches = field.dataset.traditionField === traditionKey;
        field.hidden = !matches;
        field.setAttribute('aria-hidden', matches ? 'false' : 'true');
    });
}

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

// ADDED 2026-09-28. The Bible Browser previously had NO gating at all,
// unlike the adjacent Admin Console button, which already used
// data-advanced-only. Josh's own instruction: only super-users should have
// access to it. Deliberately a SEPARATE gate from the advanced-tools one
// above -- a browser can have advanced tools enabled (`?advanced=1`)
// without being marked super-user, and vice versa; they answer different
// questions (dev/debug visibility vs. this specific restriction). Soft/
// cosmetic, per profile.isSuperUser's own comment: this hides the button,
// it does not and cannot enforce anything against a visitor who edits their
// own localStorage directly.
function syncBibleBrowserSuperUserGate() {
    const button = document.getElementById('app-bible-browser-btn');
    if (!button) return;

    const isSuperUser = getUserProfileDefaults().isSuperUser === true;
    button.hidden = !isSuperUser;
    button.setAttribute('aria-hidden', isSuperUser ? 'false' : 'true');
}

// ADDED 2026-09-29, per Josh's direct instruction: "remove Audit Dashboard
// from all offices and put it in the super user's profile" -- the button had
// NO gating at all (unlike the adjacent Admin Console and Bible Browser
// buttons), so it was visible to every visitor. Same soft/cosmetic gate as
// syncBibleBrowserSuperUserGate above, on the same isSuperUser flag.
function syncAuditDashboardSuperUserGate() {
    const button = document.getElementById('app-audit-dashboard-btn');
    if (!button) return;

    const isSuperUser = getUserProfileDefaults().isSuperUser === true;
    button.hidden = !isSuperUser;
    button.setAttribute('aria-hidden', isSuperUser ? 'false' : 'true');
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

    if (!UNIVERSAL_OFFICE_ROMAN_BREVIARY_LANGUAGE_VALUES.has(profile.romanBreviaryLanguage)) {
        profile.romanBreviaryLanguage = 'en';
    }

    if (!UNIVERSAL_OFFICE_ROMAN_BREVIARY_CALENDAR_VALUES.has(profile.romanBreviaryCalendar)) {
        profile.romanBreviaryCalendar = '1960';
    }

    // Migrate the old three-value field (lay/clergy/all), replaced 2026-08-30
    // by the eight-role ladder above, so existing saved preferences aren't
    // silently reset to 'lay' and existing access silently taken away.
    // 'clergy' maps to 'priest': every prayer 'clergy' used to unlock was,
    // on inspection, priest-tier material (see js/prayers.js's own
    // BOOK_OF_NEEDS_OPTION_MINIMUM_TIER comment) -- so this preserves exactly
    // what a migrated user could already see, rather than guessing their
    // actual rank or dropping them to lay. They can pick a more precise
    // role afterward if 'priest' overstates their actual order.
    if (profile.ministryRole === 'clergy') {
        profile.ministryRole = 'priest';
    }

    if (!UNIVERSAL_OFFICE_MINISTRY_ROLE_VALUES.has(profile.ministryRole)) {
        profile.ministryRole = 'lay';
    }

    // An unknown or absent sub-tradition falls back to null, i.e. no narrowing:
    // a bad stored value must never silently HIDE commemorations from someone.
    if (profile.oorSubtradition !== null
        && !UNIVERSAL_OFFICE_OOR_SUBTRADITION_VALUES.has(profile.oorSubtradition)) {
        profile.oorSubtradition = null;
    }

    if (profile.parishDedication !== null
        && !UNIVERSAL_OFFICE_PARISH_DEDICATION_VALUES.has(profile.parishDedication)) {
        profile.parishDedication = null;
    }

    // displayName: any non-empty string is accepted as-is (a person's own
    // name is not a closed vocabulary to validate against); anything else
    // (a corrupted non-string value) degrades to null, never a guess.
    if (typeof profile.displayName !== 'string' || !profile.displayName.trim()) {
        profile.displayName = null;
    }

    // onboardingComplete/isSuperUser: plain booleans, no closed value set to
    // check against -- coerce a corrupted stored value to its safe default
    // (an onboarding prompt that wrongly stays hidden, or a super-user flag
    // that wrongly stays off, are both the safe-by-default direction; a
    // truthy value only sticks when it's actually the literal boolean true).
    profile.onboardingComplete = profile.onboardingComplete === true;
    profile.isSuperUser = profile.isSuperUser === true;

    // isValidCycleOfPrayerDioceseKey lives in js/cycles-of-prayer.js, loaded
    // before this file -- guarded the same way the OOR-subtradition/parish-
    // dedication checks above are, in case that script somehow failed to
    // load: an unrecognised value degrades to null, never a guess.
    if (profile.cycleOfPrayerDiocese !== null
        && (typeof isValidCycleOfPrayerDioceseKey !== 'function'
            || !isValidCycleOfPrayerDioceseKey(profile.cycleOfPrayerDiocese))) {
        profile.cycleOfPrayerDiocese = null;
    }

    // A parish only means something scoped to its own diocese. Full
    // validation against the diocese's actual parish list needs the corpus
    // loaded (async), so this only enforces the synchronous invariant --
    // render/UI call sites treat an unrecognised-but-nonempty slug as "no
    // match this week", never as an error.
    if (profile.cycleOfPrayerDiocese === null || typeof profile.cycleOfPrayerParish !== 'string' || !profile.cycleOfPrayerParish) {
        profile.cycleOfPrayerParish = null;
    }

    // Same diocese-scoping rule as cycleOfPrayerParish just above, plus
    // mutual exclusion with it: a free-text name is meaningless with no
    // diocese declared, and a real corpus match already answers the
    // question, so a stray "other" value never lingers alongside one.
    if (profile.cycleOfPrayerDiocese === null
        || profile.cycleOfPrayerParish !== null
        || typeof profile.cycleOfPrayerParishOther !== 'string'
        || !profile.cycleOfPrayerParishOther.trim()) {
        profile.cycleOfPrayerParishOther = null;
    }

    // ADDED 2026-09-30. A followed parish is a server-generated slug, so anything
    // else (a corrupted or hand-edited stored value) degrades to "not following",
    // and the pass only means something alongside a slug -- same "coerce to the
    // safe default" direction as every field above.
    if (typeof profile.parishIntentionsSlug !== 'string' || !/^[a-z0-9-]{1,80}$/.test(profile.parishIntentionsSlug)) {
        profile.parishIntentionsSlug = null;
    }
    if (profile.parishIntentionsSlug === null
        || typeof profile.parishIntentionsPass !== 'string'
        || !profile.parishIntentionsPass
        || profile.parishIntentionsPass.length > 400) {
        profile.parishIntentionsPass = null;
    }

    if (profile.traditionDefault && !UNIVERSAL_OFFICE_TRADITION_MODE_MAP[profile.traditionDefault]) {
        profile.traditionDefault = null;
    }

    if (profile.traditionDefault === 'unknown') {
        profile.traditionDefault = 'anglican';
    }

    // Re-check ministryRole now that traditionDefault is fully resolved: a
    // role valid for one tradition (e.g. 'subdeacon' under Eastern Orthodox)
    // is not necessarily valid for another (Anglican has no subdeacon at
    // all) -- if the stored role isn't in the CURRENT tradition's own option
    // list, it degrades to 'lay' rather than silently keeping an
    // inapplicable role's Book of Needs access active behind the scenes
    // after a tradition switch.
    const traditionRoleValues = new Set(getMinistryRoleOptionsForTradition(profile.traditionDefault).map(o => o[0]));
    if (!traditionRoleValues.has(profile.ministryRole)) {
        profile.ministryRole = 'lay';
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

    // ADDED 2026-09-30: the followed parish's cached intentions go with the
    // profile that named it (js/parish-intentions.js).
    if (typeof clearParishIntentionsCache === 'function') clearParishIntentionsCache();

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

function setUserProfileRomanBreviaryCalendar(value) {
    const profile = getUserProfileDefaults();
    profile.romanBreviaryCalendar = UNIVERSAL_OFFICE_ROMAN_BREVIARY_CALENDAR_VALUES.has(value)
        ? value
        : '1960';

    persistUserProfileDefaults(profile);
}

function setUserProfileRomanBreviaryLanguage(value) {
    const profile = getUserProfileDefaults();
    profile.romanBreviaryLanguage = UNIVERSAL_OFFICE_ROMAN_BREVIARY_LANGUAGE_VALUES.has(value)
        ? value
        : 'en';

    persistUserProfileDefaults(profile);
}

function setUserProfileMinistryRole(value) {
    const profile = getUserProfileDefaults();
    profile.ministryRole = UNIVERSAL_OFFICE_MINISTRY_ROLE_VALUES.has(value)
        ? value
        : 'lay';

    persistUserProfileDefaults(profile);
}

function setUserProfileOorSubtradition(value) {
    const profile = getUserProfileDefaults();

    // The select's empty option means "not narrowed", which is null in the
    // profile -- NEVER 'Coptic'. Absence means every OOR row renders, including
    // the 62 unscoped rows that are shared with other traditions and are
    // pan-Christian rather than Coptic-specific. (sanctoral.json's top-level
    // note still claims absence means Coptic; it is wrong, and the resolver's
    // own comment at appliesToSubtradition() records why. Do not "fix" this
    // setter to match that note.)
    profile.oorSubtradition = UNIVERSAL_OFFICE_OOR_SUBTRADITION_VALUES.has(value)
        ? value
        : null;

    persistUserProfileDefaults(profile);
}

function setUserProfileParishDedication(value) {
    const profile = getUserProfileDefaults();

    // The select's empty option means "not declared" -- null. An unrecognised
    // stored value degrades the same way, never guessing a dedication for
    // someone who hasn't picked one.
    profile.parishDedication = UNIVERSAL_OFFICE_PARISH_DEDICATION_VALUES.has(value)
        ? value
        : null;

    persistUserProfileDefaults(profile);
    if (selectedMode === 'horologion') requestRender();
}

function setUserProfileDisplayName(value) {
    const profile = getUserProfileDefaults();
    profile.displayName = (typeof value === 'string' && value.trim()) ? value.trim() : null;
    persistUserProfileDefaults(profile);
}

// Soft/cosmetic only -- see UNIVERSAL_OFFICE_USER_PROFILE_DEFAULTS.isSuperUser's
// own comment. Called only from the Admin Console's own toggle
// (already gated behind advanced-tools), never from the public onboarding
// or profile-defaults panel.
function setUserProfileSuperUser(value) {
    const profile = getUserProfileDefaults();
    profile.isSuperUser = value === true;
    persistUserProfileDefaults(profile);
    syncBibleBrowserSuperUserGate();
    syncAuditDashboardSuperUserGate();
}

// ADDED 2026-09-29. Sentinel <option> value for "I don't see my parish
// listed (or this diocese has no list at all) -- let me type it." Shared by
// every surface that offers the home-parish picker, so the setter and the
// populate function agree on what it means without either hard-coding the
// other's string.
const CYCLE_OF_PRAYER_OTHER_PARISH_VALUE = '__other__';

// Every element id pair (select id -> its sibling free-text input id) that
// offers diocese/parish pickers -- currently the profile-defaults panel and
// the one-time onboarding prompt. Kept as one list so a picker fires the
// same setter regardless of which surface it lives on, and every surface
// stays in sync with the others automatically (harmless no-op for whichever
// one isn't currently mounted -- document.getElementById returns null and
// the loop below just skips it).
const CYCLE_OF_PRAYER_PARISH_SELECT_IDS = ['profile-cycle-of-prayer-parish', 'uo-onboarding-cycle-of-prayer-parish'];
const CYCLE_OF_PRAYER_DIOCESE_SELECT_IDS = ['profile-cycle-of-prayer-diocese', 'uo-onboarding-cycle-of-prayer-diocese'];

function setUserProfileCycleOfPrayerDiocese(value) {
    const profile = getUserProfileDefaults();

    // The select's empty option means "not declared" -- null, same convention
    // as every other profile picker in this panel. Validity is now the much
    // larger TEC_DIOCESE_DIRECTORY (js/cycles-of-prayer.js), not just the
    // dioceses this app has real cycle content for -- see that function's
    // own comment.
    const key = (typeof isValidCycleOfPrayerDioceseKey === 'function' && isValidCycleOfPrayerDioceseKey(value))
        ? value
        : null;

    profile.cycleOfPrayerDiocese = key;
    // A parish slug/free-text name is meaningless outside the diocese it was
    // picked from -- changing diocese always clears both, matching
    // normalizeUserProfileDefaults' own invariant rather than leaving a
    // stale cross-diocese value around.
    profile.cycleOfPrayerParish = null;
    profile.cycleOfPrayerParishOther = null;
    persistUserProfileDefaults(profile);

    populateCycleOfPrayerDioceseSelects(key);
    populateCycleOfPrayerParishSelect(key, null, null);
    refreshCycleOfPrayerForCurrentYear(key);
}

function setUserProfileCycleOfPrayerParish(value) {
    const profile = getUserProfileDefaults();

    if (value === CYCLE_OF_PRAYER_OTHER_PARISH_VALUE) {
        // Picking "Other" doesn't by itself record a name -- the sibling
        // text input's own onchange (setUserProfileCycleOfPrayerParishOther)
        // does that. Just reveal it, keeping whatever was typed there
        // before if the person is toggling back to "Other" after briefly
        // picking a real parish.
        populateCycleOfPrayerParishSelect(profile.cycleOfPrayerDiocese, null, profile.cycleOfPrayerParishOther);
        return;
    }

    profile.cycleOfPrayerParish = value || null;
    profile.cycleOfPrayerParishOther = null;
    persistUserProfileDefaults(profile);
    populateCycleOfPrayerParishSelect(profile.cycleOfPrayerDiocese, profile.cycleOfPrayerParish, null);
    refreshCycleOfPrayerParishForCurrentMonth(profile.cycleOfPrayerDiocese, profile.cycleOfPrayerParish);
    if (selectedMode === 'daily') requestRender();
}

function setUserProfileCycleOfPrayerParishOther(value) {
    const profile = getUserProfileDefaults();
    const trimmed = (value || '').trim();
    profile.cycleOfPrayerParishOther = trimmed || null;
    // A typed name and a real corpus match can't both be "the" answer --
    // same mutual-exclusion invariant normalizeUserProfileDefaults enforces.
    profile.cycleOfPrayerParish = null;
    persistUserProfileDefaults(profile);
    populateCycleOfPrayerParishSelect(profile.cycleOfPrayerDiocese, null, profile.cycleOfPrayerParishOther);
}

/* ---------------------------------------------------------------------------
 * Parish prayer intentions -- profile controls and refresh. ADDED 2026-09-30.
 *
 * The network/cache layer is js/parish-intentions.js (loaded first); this block is the profile
 * side: the "Parish prayer intentions" field group in #user-profile-defaults, and the refresh
 * that repaints the office when data arrives. Same warm-then-repaint pattern as
 * refreshCycleOfPrayerForCurrentYear above. Only Anglican profiles see the field (the same
 * data-tradition-field gating as the diocese/parish fields), and no request of any kind is made
 * for anyone who does not follow a parish or open that field.
 * ------------------------------------------------------------------------- */

const PARISH_INTENTIONS_STALE_MS = 10 * 60 * 1000;   // refresh a cache older than this when the office renders
const PARISH_INTENTIONS_RETRY_MS = 60 * 1000;        // ...but never attempt more often than this
const PARISH_INTENTIONS_LIST_TTL_MS = 5 * 60 * 1000; // parish list reuse across the many profile syncs
const PARISH_INTENTIONS_CODE_MESSAGES = {
    'wrong-code': 'That code was not accepted. Please check it with your parish.',
    'rate-limited': 'Too many attempts. Please wait a while and try again.',
    'not-found': 'That parish is no longer available.',
    'network': 'Could not reach the server. Please try again in a moment.'
};

let parishIntentionsListCache = { key: null, at: 0, result: null, promise: null };
let parishIntentionsPopulateSeq = 0;
let parishIntentionsRefreshInFlight = false;
let parishIntentionsLastAttemptAt = 0;
let parishIntentionsNeedsCodeSlug = null; // a followed parish whose pass was rejected (code rotated)

function setParishIntentionsNote(text) {
    const note = document.getElementById('profile-parish-intentions-note');
    if (note) note.textContent = text || '';
}

function setParishIntentionsJoinBoxVisible(visible) {
    const box = document.getElementById('profile-parish-intentions-join');
    if (box) box.hidden = !visible;
}

/**
 * Approved parishes for the picker: the reader's own diocese first; if that diocese has none, every
 * approved parish (per the build spec). Cached briefly and de-duplicated, because
 * syncUserProfileControls runs on every profile change. Resolves to { parishes: [...]|null, fellBack }.
 */
function getParishIntentionsList(dioceseKey) {
    const key = dioceseKey || 'all';
    const cache = parishIntentionsListCache;
    if (cache.key === key && cache.result && (Date.now() - cache.at) < PARISH_INTENTIONS_LIST_TTL_MS) {
        return Promise.resolve(cache.result);
    }
    if (cache.key === key && cache.promise) return cache.promise;

    const promise = (async () => {
        let parishes = await listApprovedParishes(dioceseKey || null);
        let fellBack = false;
        if (Array.isArray(parishes) && parishes.length === 0 && dioceseKey) {
            parishes = await listApprovedParishes(null);
            fellBack = true;
        }
        const result = { parishes: parishes, fellBack: fellBack };
        // A failed lookup (null) is not cached, so the next sync tries again.
        parishIntentionsListCache = { key: key, at: parishes === null ? 0 : Date.now(), result: parishes === null ? null : result, promise: null };
        return result;
    })();
    parishIntentionsListCache = { key: key, at: 0, result: null, promise: promise };
    return promise;
}

function populateParishIntentionsControls(profile) {
    const select = document.getElementById('profile-parish-intentions-select');
    // No field mounted, not an Anglican profile (the field is hidden), or the client script is
    // missing: do nothing, and above all make no request.
    if (!select || profile.traditionDefault !== 'anglican' || typeof listApprovedParishes !== 'function') return;

    const requestId = ++parishIntentionsPopulateSeq;
    getParishIntentionsList(profile.cycleOfPrayerDiocese).then((result) => {
        if (requestId !== parishIntentionsPopulateSeq) return; // a newer sync superseded this one
        renderParishIntentionsSelect(select, getUserProfileDefaults(), result);
    });
}

function renderParishIntentionsSelect(select, profile, result) {
    const parishes = result.parishes;
    const followed = profile.parishIntentionsSlug;
    select.textContent = '';

    const none = document.createElement('option');
    none.value = '';
    none.textContent = 'Not following a parish';
    select.appendChild(none);

    if (Array.isArray(parishes) && parishes.length === 0 && !followed) {
        none.textContent = 'No parishes are using prayer intentions yet.';
        select.disabled = true;
        setParishIntentionsJoinBoxVisible(false);
        setParishIntentionsStopVisible(false);
        return;
    }

    const homeSlug = profile.cycleOfPrayerParish;
    let suggested = null;
    let listedFollowed = false;
    for (const parish of (parishes || [])) {
        const opt = document.createElement('option');
        opt.value = parish.slug;
        let label = parish.name;
        if (parish.visibility === 'code') label += ' (join code needed)';
        if (homeSlug && parish.corpusParishSlug === homeSlug) {
            label += ' — your home parish';
            suggested = parish;
        }
        opt.textContent = label; // names come from the server: textContent only
        select.appendChild(opt);
        if (parish.slug === followed) listedFollowed = true;
    }

    // A followed parish that is no longer in the list (suspended, deleted, or the list failed to load)
    // keeps its own option, so the reader can see and stop following it.
    if (followed && !listedFollowed) {
        const cached = (typeof getCachedParishIntentions === 'function') ? parishIntentionsMemoryCacheName(followed) : null;
        const opt = document.createElement('option');
        opt.value = followed;
        opt.textContent = (cached || followed) + (parishes === null ? '' : ' (no longer listed)');
        select.appendChild(opt);
    }

    select.disabled = false;
    select.value = followed || '';
    setParishIntentionsStopVisible(Boolean(followed));

    const needsCode = followed && parishIntentionsNeedsCodeSlug === followed;
    setParishIntentionsJoinBoxVisible(Boolean(needsCode));

    // Suggest, never follow silently.
    if (suggested && !followed) {
        setParishIntentionsNote('Your home parish, ' + suggested.name + ', is using prayer intentions. Choose it above to follow it.');
    } else if (parishes === null && !followed) {
        setParishIntentionsNote('Could not load the list of parishes right now.');
    } else if (result.fellBack && !followed) {
        setParishIntentionsNote('No parish in your diocese is using prayer intentions yet, so all parishes are shown.');
    }
}

function parishIntentionsMemoryCacheName(slug) {
    try {
        const stored = JSON.parse(localStorage.getItem(PARISH_INTENTIONS_CACHE_KEY) || 'null');
        return stored && stored.slug === slug && stored.parish && typeof stored.parish.name === 'string' ? stored.parish.name : null;
    } catch (_error) {
        return null;
    }
}

function setParishIntentionsStopVisible(visible) {
    const button = document.getElementById('profile-parish-intentions-stop');
    if (button) button.hidden = !visible;
}

function setUserProfileParishIntentions(slug, pass) {
    const profile = getUserProfileDefaults();
    profile.parishIntentionsSlug = slug || null;
    profile.parishIntentionsPass = slug ? (pass || null) : null;
    persistUserProfileDefaults(profile);
}

function clearUserProfileParishIntentions() {
    parishIntentionsNeedsCodeSlug = null;
    setUserProfileParishIntentions(null, null);
    if (typeof clearParishIntentionsCache === 'function') clearParishIntentionsCache();
    setParishIntentionsJoinBoxVisible(false);
    setParishIntentionsNote('You are no longer following a parish.');
    if (selectedMode === 'daily') requestRender();
}

function followParishIntentions(slug, pass) {
    parishIntentionsNeedsCodeSlug = null;
    setUserProfileParishIntentions(slug, pass);
    setParishIntentionsJoinBoxVisible(false);
    parishIntentionsLastAttemptAt = 0;
    refreshParishIntentionsForProfile();
}

function setUserProfileParishIntentionsFromSelect(value) {
    if (!value) { clearUserProfileParishIntentions(); return; }
    const profile = getUserProfileDefaults();
    const known = (parishIntentionsListCache.result && parishIntentionsListCache.result.parishes || []).find(p => p.slug === value);
    if (profile.parishIntentionsSlug === value && parishIntentionsNeedsCodeSlug !== value) return;

    if (known && known.visibility === 'code') {
        // Not followed until the code is accepted -- the pass is what proves it.
        setParishIntentionsJoinBoxVisible(true);
        setParishIntentionsNote('Enter the join code your parish gave you, then press Join.');
        const input = document.getElementById('profile-parish-intentions-code');
        if (input) input.focus();
        return;
    }
    setParishIntentionsJoinBoxVisible(false);
    followParishIntentions(value, null);
    setParishIntentionsNote(known ? 'You now follow ' + known.name + '.' : 'You now follow this parish.');
}

function joinSelectedParishIntentions() {
    const select = document.getElementById('profile-parish-intentions-select');
    const input = document.getElementById('profile-parish-intentions-code');
    const button = document.getElementById('profile-parish-intentions-join-button');
    if (!select || !input || !select.value || typeof joinParish !== 'function') return;

    const code = input.value.trim();
    if (!code) { setParishIntentionsNote('Please enter the join code.'); return; }

    const slug = select.value;
    const known = (parishIntentionsListCache.result && parishIntentionsListCache.result.parishes || []).find(p => p.slug === slug);
    if (button) button.disabled = true;
    joinParish(slug, code).then((result) => {
        if (button) button.disabled = false;
        if (!result.ok) {
            setParishIntentionsNote(PARISH_INTENTIONS_CODE_MESSAGES[result.reason] || PARISH_INTENTIONS_CODE_MESSAGES.network);
            return;
        }
        input.value = '';
        followParishIntentions(slug, result.pass);
        setParishIntentionsNote('You now follow ' + (known ? known.name : 'this parish') + '.');
    });
}

/**
 * Fetches the followed parish's intentions (cache + repaint), the same fire-and-forget shape as
 * refreshCycleOfPrayerForCurrentYear. A 401 means the parish rotated its join code: the stale pass is
 * cleared and the reader is asked for the new one; the slug is kept so the choice is not lost.
 */
function refreshParishIntentionsForProfile() {
    const profile = getUserProfileDefaults();
    if (!profile.parishIntentionsSlug || typeof refreshParishIntentions !== 'function') return;
    if (parishIntentionsRefreshInFlight) return;

    parishIntentionsRefreshInFlight = true;
    parishIntentionsLastAttemptAt = Date.now();
    refreshParishIntentions(profile.parishIntentionsSlug, profile.parishIntentionsPass).then((result) => {
        parishIntentionsRefreshInFlight = false;
        if (result.status === 'code-required') {
            parishIntentionsNeedsCodeSlug = profile.parishIntentionsSlug;
            if (profile.parishIntentionsPass) {
                const fresh = getUserProfileDefaults();
                fresh.parishIntentionsPass = null;
                persistUserProfileDefaults(fresh);
            }
            setParishIntentionsJoinBoxVisible(true);
            setParishIntentionsNote('The join code for this parish has changed. Enter the new code to keep following it.');
        } else if (result.status === 'not-found') {
            setParishIntentionsNote('This parish is no longer available.');
        }
        if (result.status !== 'error' && selectedMode === 'daily') requestRender();
    }).catch(() => { parishIntentionsRefreshInFlight = false; });
}

/**
 * Loads (or reuses the cache for) the given diocese's current-year cycle
 * file, then repaints whatever depends on it: the parish picker(s) (on
 * whichever surfaces are currently mounted) and the daily office itself
 * (if it's the currently-showing view and a diocese is actually declared).
 * A no-op, harmlessly, when `dioceseKey` is null (diocese cleared), the
 * declared diocese has no ingested cycle content at all (see
 * findCycleOfPrayerDiocese's own contract in js/cycles-of-prayer.js -- no
 * fetch is even attempted in that case), or the supporting functions from
 * that file aren't available.
 */
function refreshCycleOfPrayerForCurrentYear(dioceseKey) {
    if (!dioceseKey || typeof loadCycleOfPrayerYear !== 'function') return;

    loadCycleOfPrayerYear(dioceseKey, new Date().getFullYear()).then((corpus) => {
        const profile = getUserProfileDefaults();
        populateCycleOfPrayerParishSelect(dioceseKey, profile.cycleOfPrayerParish, profile.cycleOfPrayerParishOther);
        if (corpus && selectedMode === 'daily') requestRender();
    });
}

/**
 * ADDED 2026-09-29. Same warm-then-repaint pattern as
 * refreshCycleOfPrayerForCurrentYear above, for the single worldwide
 * Communion cycle instead of a user-declared diocese's own file -- no
 * dioceseKey parameter, since there is exactly one file and it applies to
 * every user. No parish-picker repaint either, since the Communion tier has
 * no parish concept.
 */
function refreshCommunionCycleOfPrayerForCurrentYear() {
    if (typeof loadCommunionCycleOfPrayerYear !== 'function') return;

    loadCommunionCycleOfPrayerYear(new Date().getFullYear()).then((corpus) => {
        if (corpus && selectedMode === 'daily') requestRender();
    });
}

/**
 * ADDED 2026-09-29. Same warm-then-repaint pattern as
 * refreshCycleOfPrayerForCurrentYear above, for the Parish tier -- a no-op,
 * harmlessly, when either `dioceseKey` or `parishSlug` is missing (no home
 * parish declared, or that diocese's own parish list wasn't picked from at
 * all) or when this app has no ingested household-cycle file for that
 * parish (see findCycleOfPrayerParishEntry in js/cycles-of-prayer.js -- no
 * fetch is even attempted in that case).
 */
function refreshCycleOfPrayerParishForCurrentMonth(dioceseKey, parishSlug) {
    if (!dioceseKey || !parishSlug || typeof loadCycleOfPrayerParishMonth !== 'function') return;

    loadCycleOfPrayerParishMonth(dioceseKey, parishSlug).then((corpus) => {
        if (corpus && selectedMode === 'daily') requestRender();
    });
}

/**
 * Rebuilds every mounted home-parish <select>'s options (see
 * CYCLE_OF_PRAYER_PARISH_SELECT_IDS) from an already-loaded (or
 * still-loading, or nonexistent) diocese corpus, and shows/hides that
 * select's sibling free-text "other" input to match. Built via DOM APIs
 * rather than an HTML string -- no escaping helper needed, and consistent
 * with how this file builds every other data-driven element.
 *
 * Three distinct states, per Josh's own direct instruction (2026-09-29):
 * 1. `dioceseKey` null -- "choose a diocese first", select disabled, no
 *    free-text field.
 * 2. `dioceseKey` set but this app has NO ingested cycle content for it at
 *    all (see findCycleOfPrayerDiocese in js/cycles-of-prayer.js -- true for
 *    100 of the 106 TEC_DIOCESE_DIRECTORY entries as of this writing) --
 *    never shows "Loading parishes..." for a fetch that will never happen;
 *    goes straight to a single disabled "Other" option with the free-text
 *    field already visible.
 * 3. `dioceseKey` set AND this app has content for it -- real parish list
 *    (once the corpus finishes loading; "Loading parishes..." meanwhile) plus
 *    a trailing "Other" option, for a parish that diocese's own file happens
 *    not to list. `currentSlug` (a real corpus match) and `currentOther` (a
 *    typed name) are mutually exclusive, matching the profile's own
 *    invariant -- whichever is non-null wins the select's displayed value.
 */
function populateCycleOfPrayerParishSelect(dioceseKey, currentSlug, currentOther) {
    for (const selectId of CYCLE_OF_PRAYER_PARISH_SELECT_IDS) {
        const select = document.getElementById(selectId);
        if (!select) continue;
        const otherInput = document.getElementById(selectId + '-other');
        _populateOneCycleOfPrayerParishSelect(select, otherInput, dioceseKey, currentSlug, currentOther);
    }
}

function _populateOneCycleOfPrayerParishSelect(select, otherInput, dioceseKey, currentSlug, currentOther) {
    select.textContent = '';

    const showOther = (visible, value) => {
        if (!otherInput) return;
        otherInput.style.display = visible ? '' : 'none';
        otherInput.value = visible ? (value || '') : '';
    };

    if (!dioceseKey) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Choose a diocese first';
        select.appendChild(opt);
        select.disabled = true;
        showOther(false);
        return;
    }

    const dioceseHasCycleContent = typeof findCycleOfPrayerDiocese === 'function'
        && findCycleOfPrayerDiocese(dioceseKey) !== null;

    if (!dioceseHasCycleContent) {
        const opt = document.createElement('option');
        opt.value = CYCLE_OF_PRAYER_OTHER_PARISH_VALUE;
        opt.textContent = 'Other (type below)';
        select.appendChild(opt);
        select.value = CYCLE_OF_PRAYER_OTHER_PARISH_VALUE;
        select.disabled = true; // nothing else to choose from
        showOther(true, currentOther);
        return;
    }

    const corpus = typeof getCachedCycleOfPrayerYear === 'function'
        ? getCachedCycleOfPrayerYear(dioceseKey, new Date().getFullYear())
        : null;

    if (!corpus) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Loading parishes...';
        select.appendChild(opt);
        select.disabled = true;
        showOther(false);
        return;
    }

    const notDeclared = document.createElement('option');
    notDeclared.value = '';
    notDeclared.textContent = 'Not declared (optional)';
    select.appendChild(notDeclared);

    const parishes = listCycleOfPrayerParishes(corpus);
    let matchedCurrent = false;
    for (const parish of parishes) {
        const opt = document.createElement('option');
        opt.value = parish.slug;
        opt.textContent = parish.place + ', ' + parish.name;
        select.appendChild(opt);
        if (parish.slug === currentSlug) matchedCurrent = true;
    }

    const otherOpt = document.createElement('option');
    otherOpt.value = CYCLE_OF_PRAYER_OTHER_PARISH_VALUE;
    otherOpt.textContent = 'Other (type below)';
    select.appendChild(otherOpt);

    select.disabled = false;

    if (matchedCurrent) {
        select.value = currentSlug;
        showOther(false);
    } else if (currentOther) {
        select.value = CYCLE_OF_PRAYER_OTHER_PARISH_VALUE;
        showOther(true, currentOther);
    } else {
        select.value = '';
        showOther(false);
    }
}

/**
 * ADDED 2026-09-29. Rebuilds a single diocese <select>'s options from
 * TEC_DIOCESE_DIRECTORY (js/cycles-of-prayer.js) -- every TEC
 * diocese/jurisdiction Josh's own roster names, not just the handful this
 * app has real Cycle of Prayer content for (see that file's own comment).
 * Keeps the markup's own first option (value "", "Not declared") and
 * rebuilds everything after it, so that fallback option's exact wording
 * stays wherever each surface's own HTML puts it rather than being
 * duplicated here.
 */
function populateCycleOfPrayerDioceseSelect(selectEl, currentKey) {
    if (!selectEl || typeof TEC_DIOCESE_DIRECTORY === 'undefined') return;

    while (selectEl.options.length > 1) selectEl.remove(1);

    for (const entry of TEC_DIOCESE_DIRECTORY) {
        const opt = document.createElement('option');
        opt.value = cycleOfPrayerDioceseKey(TEC_DIOCESE_DIRECTORY_BODY_SLUG, entry.dioceseShort);
        opt.textContent = entry.label;
        selectEl.appendChild(opt);
    }

    selectEl.value = currentKey || '';
}

/** Same "every mounted surface" pattern as populateCycleOfPrayerParishSelect. */
function populateCycleOfPrayerDioceseSelects(currentKey) {
    for (const selectId of CYCLE_OF_PRAYER_DIOCESE_SELECT_IDS) {
        populateCycleOfPrayerDioceseSelect(document.getElementById(selectId), currentKey);
    }
}

function openResetProfileConfirm() {
    const box = document.getElementById('profile-reset-confirm');
    if (!box) { resetUniversalOfficeUserProfile(); return; }
    box.hidden = false;
    const keep = box.querySelector('.app-profile-save');
    if (keep) keep.focus({ preventScroll: true });
}

function closeResetProfileConfirm() {
    const box = document.getElementById('profile-reset-confirm');
    if (box) box.hidden = true;
}

function confirmResetProfile() {
    closeResetProfileConfirm();
    closeUserProfilePanel();
    resetUniversalOfficeUserProfile();
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
    const oorSubtraditionSelect = document.getElementById('profile-oor-subtradition');
    const romanBreviaryLanguageSelect = document.getElementById('profile-roman-breviary-language');
    const romanBreviaryCalendarSelect = document.getElementById('profile-roman-breviary-calendar');
    const parishDedicationSelect = document.getElementById('profile-parish-dedication');
    const displayNameInput = document.getElementById('profile-display-name');
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

    // Repopulates the option list itself, not just the selected value --
    // which roles are even offered depends on the declared tradition (see
    // UNIVERSAL_OFFICE_MINISTRY_ROLE_OPTIONS above).
    populateMinistryRoleSelect(ministryRoleSelect, normalized.traditionDefault, normalized.ministryRole);

    // ADDED 2026-09-29, per Josh's direct correction ("weird to have a
    // question about oriental subtradition when TEC is Anglican... they are
    // dependencies"): fields that only apply to one tradition (Oriental
    // Orthodox sub-tradition, Roman Breviary language, Byzantine parish
    // dedication, Diocese/home parish) now hide themselves unless the
    // declared tradition is the one they belong to.
    syncProfileFieldVisibilityForTradition(normalized.traditionDefault);

    if (oorSubtraditionSelect) {
        oorSubtraditionSelect.value = normalized.oorSubtradition || '';
    }

    if (romanBreviaryLanguageSelect) {
        romanBreviaryLanguageSelect.value = normalized.romanBreviaryLanguage;
    }
    if (romanBreviaryCalendarSelect) {
        romanBreviaryCalendarSelect.value = normalized.romanBreviaryCalendar;
    }

    if (parishDedicationSelect) {
        parishDedicationSelect.value = normalized.parishDedication || '';
    }

    if (displayNameInput && document.activeElement !== displayNameInput) {
        displayNameInput.value = normalized.displayName || '';
    }

    // Both populated every sync, not only on change, so returning to this
    // panel (or a fresh page load, or the onboarding prompt appearing) shows
    // the full directory and real parish options (if the corpus is already
    // cached) rather than only after a select fires its own onchange again.
    populateCycleOfPrayerDioceseSelects(normalized.cycleOfPrayerDiocese);
    populateCycleOfPrayerParishSelect(normalized.cycleOfPrayerDiocese, normalized.cycleOfPrayerParish, normalized.cycleOfPrayerParishOther);
    populateParishIntentionsControls(normalized);

    if (summary) {
        const entryLabel = normalized.entryPageDefault === 'universal'
            ? 'opens to the Universal Office selector'
            : normalized.entryPageDefault === 'tradition' && normalized.traditionDefault
                ? `opens to ${UNIVERSAL_OFFICE_TRADITION_LABELS[normalized.traditionDefault] || 'the selected tradition'}`
                : 'asks for a tradition on entry';

        const bookNeedsLabel = normalized.bookOfNeedsScope === 'universal'
            ? 'Book of Needs office access shows all prayers'
            : 'Book of Needs office access stays tradition-filtered';

        const roleLabels = {
            'lay':                'showing lay-appropriate Book of Needs content only',
            'reader':             "showing lay content plus material for a reader's own use (not priestly or diaconal material)",
            'catechist':          "showing lay content plus material for a catechist's own use (not priestly or diaconal material)",
            'eucharistic-minister': "showing lay content plus material for a eucharistic minister's own use (not priestly or diaconal material)",
            'eucharistic-visitor':  "showing lay content plus material for a eucharistic visitor's own use (not priestly or diaconal material)",
            'pastoral-leader':    "showing lay content plus material for a pastoral leader's own use (not priestly or diaconal material)",
            'preacher':           "showing lay content plus material for a preacher's own use (not priestly or diaconal material)",
            'worship-leader':     "showing lay content plus material for a worship leader's own use (not priestly or diaconal material)",
            'subdeacon':          "showing lay content plus material for a subdeacon's own use (not priestly or diaconal material)",
            'deacon':             'showing content appropriate for a deacon (a major order -- not priestly or episcopal material)',
            'priest':             'showing content appropriate for a priest (not episcopal-only material)',
            'bishop':             'showing all role-gated content, including episcopal material',
            'monastic':           'showing lay-appropriate Book of Needs content, plus material for monastic use',
            'research-reference': 'showing all role-gated content for study and reference, not as an attestation of fitness to perform it',
            'all':                'showing all Book of Needs content regardless of role',
        };
        const roleLabel = roleLabels[normalized.ministryRole] || roleLabels['lay'];

        // Worded to state what narrowing actually does: it hides rows EXCLUSIVE
        // to another sub-tradition and keeps the shared ones, which is not the
        // same as "showing only Coptic saints".
        const subtraditionLabel = normalized.oorSubtradition
            ? `Oriental Orthodox commemorations narrowed to ${normalized.oorSubtradition} use, plus those kept across all the Oriental Orthodox churches`
            : 'Oriental Orthodox commemorations shown for every sub-tradition';

        // Labels live once, in the <select>'s own <option> text -- not duplicated
        // here, so this can never drift from data/horologion/parish-dedications.json.
        const dedicationOptionText = parishDedicationSelect && parishDedicationSelect.selectedOptions.length
            ? parishDedicationSelect.selectedOptions[0].textContent
            : null;
        const dedicationLabel = normalized.parishDedication && dedicationOptionText
            ? `home parish dedication set to ${dedicationOptionText}, for the Kontakion "of the temple"`
            : 'no home parish dedication declared, so the Kontakion "of the temple" stays disclosed rather than resolved';

        // Diocese label lives in TEC_DIOCESE_DIRECTORY (js/cycles-of-prayer.js),
        // same "one place, not duplicated" rule the dedication label above
        // follows -- the FULL directory, not just findCycleOfPrayerDiocese's
        // much shorter "has real content" list, so a declared diocese this
        // app has no cycle file for still gets its real name in the summary
        // rather than being reported as "no diocese declared".
        const dioceseDirectoryEntry = normalized.cycleOfPrayerDiocese && typeof findTecDioceseDirectoryEntry === 'function'
            ? findTecDioceseDirectoryEntry(normalized.cycleOfPrayerDiocese)
            : null;
        const dioceseHasCycleContent = normalized.cycleOfPrayerDiocese && typeof findCycleOfPrayerDiocese === 'function'
            && findCycleOfPrayerDiocese(normalized.cycleOfPrayerDiocese) !== null;
        const parishSelect = document.getElementById('profile-cycle-of-prayer-parish');
        const parishOptionText = normalized.cycleOfPrayerParish && parishSelect && parishSelect.selectedOptions.length
            ? parishSelect.selectedOptions[0].textContent
            : null;
        const cycleOfPrayerLabel = !dioceseDirectoryEntry
            ? 'no diocese declared, so the Diocesan Cycle of Prayer space stays a plain rubric'
            : !dioceseHasCycleContent
                ? `diocese on file: ${dioceseDirectoryEntry.label}${normalized.cycleOfPrayerParishOther ? ` (parish: ${normalized.cycleOfPrayerParishOther})` : ''}, but this app has no Cycle of Prayer content for it yet`
                : parishOptionText
                    ? `the Diocesan Cycle of Prayer follows ${dioceseDirectoryEntry.label}, highlighting this week's entry for ${parishOptionText}`
                    : normalized.cycleOfPrayerParishOther
                        ? `the Diocesan Cycle of Prayer follows ${dioceseDirectoryEntry.label} (parish: ${normalized.cycleOfPrayerParishOther}, not in that diocese's own list)`
                        : `the Diocesan Cycle of Prayer follows ${dioceseDirectoryEntry.label}`;

        const nameLabel = normalized.displayName
            ? `saved for ${normalized.displayName}`
            : 'no name entered yet';

        summary.textContent = `This browser ${entryLabel}; ${bookNeedsLabel}; ${roleLabel}; ${subtraditionLabel}; ${dedicationLabel}; ${cycleOfPrayerLabel}; ${nameLabel}.`;
    }
}

function selectTraditionFamily(family) {
    const traditionEntry = document.getElementById('tradition-entry');
    const title = document.getElementById('tradition-entry-title');
    const lede = document.querySelector('#tradition-entry .app-entry-lede');
    const familyGrid = document.getElementById('entry-family-grid');
    const western = document.getElementById('entry-western-options');
    const eastern = document.getElementById('entry-eastern-options');
    const coe = document.getElementById('entry-coe-options');
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

    if (coe) {
        coe.hidden = true;
        coe.setAttribute('aria-hidden', 'true');
    }
}

// Third-level entry step: which of the two Church of the East bodies. Added
// 2026-08-30 per Josh's direction, after confirming (1964 calendar reform,
// 1968 schism) that the concrete, sourceable difference between the Assyrian
// Church of the East and the Ancient Church of the East is the liturgical
// calendar -- both share the same East Syriac office text. See
// AUDIT_GOVERNANCE_LEDGER.md for the sourcing.
function showCoeEntryStep() {
    const traditionEntry = document.getElementById('tradition-entry');
    const title = document.getElementById('tradition-entry-title');
    const lede = document.querySelector('#tradition-entry .app-entry-lede');
    const familyGrid = document.getElementById('entry-family-grid');
    const western = document.getElementById('entry-western-options');
    const eastern = document.getElementById('entry-eastern-options');
    const coe = document.getElementById('entry-coe-options');

    if (traditionEntry) traditionEntry.dataset.entryStep = 'coe';
    if (title) title.textContent = 'Church of the East';
    if (lede) lede.textContent = 'Choose the tradition you want to pray with.';

    if (familyGrid) { familyGrid.hidden = true; familyGrid.setAttribute('aria-hidden', 'true'); }
    if (western)    { western.hidden    = true; western.setAttribute('aria-hidden', 'true'); }
    if (eastern)    { eastern.hidden    = true; eastern.setAttribute('aria-hidden', 'true'); }
    if (coe) {
        coe.hidden = false;
        coe.setAttribute('aria-hidden', 'false');
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

// ── The threshold (Phase 4, UI_REDESIGN_HANDOFF.md §4/§5), rebuilt 2026-09-22 ───────────────
// CORRECTED 2026-09-22: the original build (2026-09-21) put this in #tradition-entry (the ask
// state -- "Where do you pray?"). Checked against the actual design source Josh provided (a zip
// with the real mockup, not just this repo's prose paraphrase of it): §4's Phase 4 build plan
// says explicitly "Replace #mode-selection with the threshold" -- the universal state (someone
// who already chose to browse/compare traditions), not the ask state (a first-time visitor who
// hasn't said who they are yet). Naming a specific office as the first thing a brand-new visitor
// sees was the actual root of Josh's complaint ("It shouldn't be screaming 'It is time for
// Evening Prayer'") -- #tradition-entry has been reverted to its original content untouched;
// this lives in #mode-selection instead, where "It is the hour of X, praying tonight in five
// traditions" is genuinely appropriate context, not presumptuous.
//
// Visual style also rebuilt from the source mockup directly (Universal Office Redesign.dc.html,
// section #1c) rather than approximated: full-bleed rood-screen.png background (blurred,
// darkened, exact filter/gradient values below), Cinzel/Cormorant Garamond/IBM Plex Mono type,
// a real bordered Begin button (the rejected version reused .app-entry-family-card, a class
// built for a different kind of card, and rendered as an empty flat gray box).
const BCP_THRESHOLD_OFFICE_TEXT = {
    "morning-office":  "Psalms, the reading of Scripture, and the canticles of morning.",
    "noonday-office":  "A brief pause in the day's work, kept with psalms and a short reading.",
    "evening-office":  "Psalms, the reading of Scripture, and the Magnificat and Nunc Dimittis.",
    "compline-office": "The last office of the day, kept with psalms before sleep.",
};

// Threshold descriptions for the other three lanes. Text agreed with Josh in the 2026-09-22
// session and supplied verbatim by him 2026-09-23 (it had not been written into the repo).
// Keyed by each lane's own SHARED_OFFICE_NAVIGATOR_CONFIGS option values. NOT YET WIRED: those
// lanes have no threshold screen yet. Do not reword; these are Josh's text, not engineering copy.
const COPTIC_THRESHOLD_OFFICE_TEXT = {
    "coptic-morning-office":  "Psalms, the Trisagion prayers, and the Gospel of the Resurrection.",
    "coptic-third-hour":      "Psalms and the Trisagion prayers, with the hour's own troparia.",
    "coptic-sixth-hour":      "Psalms and the Trisagion prayers, with the hour's own troparia.",
    "coptic-ninth-hour":      "Psalms and the Trisagion prayers, with the hour's own troparia.",
    "coptic-eleventh-hour":   "Psalms, the Trisagion prayers, and Vouchsafe, O Lord.",
    "coptic-twelfth-hour":    "Psalms, the Prayer of Esaias, and the Litany of the Twelfth Hour.",
    "coptic-midnight-office": "Psalms kept across three watches, each with its own troparion.",
};

const EAST_SYRIAC_THRESHOLD_OFFICE_TEXT = {
    "sapra":  "Psalms, the Lakhumara, and the Tishbukhta of praise.",
    "endana": "A short office of psalms and prayer, kept only during the Great Fast.",
    "ramsha": "Psalms 141, 142, and 119, the Lakhumara, and the Karuzutha.",
    "lelya":  "The weekday Qaltha and Shubakha, kept through the watches of the night.",
    "subaa":  "Psalms and the Karuzutha, closing the day's prayer.",
};

const HOROLOGION_THRESHOLD_OFFICE_TEXT = {
    "vespers":          "The Evening Office \u2014 psalmody, the Litany, and the Evening Hymn.",
    "small-compline":   "The shorter night office, appointed for ordinary weekdays.",
    "great-compline":   "The solemn night office of Great Lent and the eves of Nativity and Theophany.",
    "midnight-office":  "Kept at the midnight hour, before Orthros on solemn occasions.",
    "orthros":          "The Morning Office \u2014 psalmody, the Canon, and the Great Doxology.",
    "first-hour":       "Fixed psalmody (Psalms 5, 89, 100) and the Trisagion prayers.",
    "third-hour":       "Fixed psalmody (Psalms 16, 24, 50) and the Trisagion prayers.",
    "sixth-hour":       "Fixed psalmody (Psalms 53, 54, 90) and the Trisagion prayers.",
    "ninth-hour":       "Fixed psalmody (Psalms 83, 84, 85) and the Trisagion prayers.",
    "typika":           "The Reader's Office, kept in place of the Liturgy when none is celebrated.",
    "interhour-first":  "Three psalms and the Trisagion, appended in monastic practice.",
    "interhour-third":  "Three psalms and the Trisagion, appended in monastic practice.",
    "interhour-sixth":  "Three psalms and the Trisagion, appended in monastic practice.",
    "interhour-ninth":  "Three psalms and the Trisagion, appended in monastic practice.",
};

// Lane thresholds (2026-09-23). Each entry tells updateUoThresholdDisplay() and
// showLaneThreshold() everything they need for one lane: which SHARED_OFFICE_NAVIGATOR_CONFIGS
// key holds its office labels, how to compute which office is due right now, which text table
// holds its descriptions, and which framing line runs above the office name. Josh's first call
// (2026-09-23) split this by hour-based vocabulary -- "It is the hour of" for Coptic/Horologion,
// "It is time for" for East Syriac. Seeing it rendered, he reversed that the same session: "It
// is the hour of THE THIRD HOUR" repeats itself (the office name already contains "Hour"), so
// all three lanes now read "It is time for", matching BCP. selectMode('daily') has no entry
// here -- BCP keeps its own original code path below unchanged.
const LANE_THRESHOLD_CONFIG = {
    "coptic-agpeya": {
        configKey: "coptic",
        framing: "It is time for",
        textTable: COPTIC_THRESHOLD_OFFICE_TEXT,
        currentOfficeValue: () => _defaultCopticHourForCurrentTime(new Date()),
    },
    "east-syriac": {
        configKey: "eastSyriac",
        framing: "It is time for",
        textTable: EAST_SYRIAC_THRESHOLD_OFFICE_TEXT,
        currentOfficeValue: () => getEastSyriacHourInfo().value,
    },
    "horologion": {
        configKey: "horologion",
        framing: "It is time for",
        textTable: HOROLOGION_THRESHOLD_OFFICE_TEXT,
        currentOfficeValue: () => _defaultHorologionOfficeForCurrentTime(new Date()),
    },
};

function updateUoThresholdDisplay(mode = "daily") {
    const now = new Date();
    const lane = LANE_THRESHOLD_CONFIG[mode] || null;

    const officeValue = lane ? lane.currentOfficeValue() : _defaultDailyOfficeForCurrentTime(now);
    const configKey    = lane ? lane.configKey : "daily";
    const officeOption = SHARED_OFFICE_NAVIGATOR_CONFIGS[configKey].options.find(o => o.value === officeValue);
    const officeLabel  = officeOption ? officeOption.label : "Prayer";
    const description  = lane ? (lane.textTable[officeValue] || "") : (BCP_THRESHOLD_OFFICE_TEXT[officeValue] || "");

    const framingEl = document.getElementById('uo-threshold-framing');
    if (framingEl) framingEl.textContent = lane ? lane.framing : "It is time for";

    const tsEl = document.getElementById('uo-threshold-timestamp');
    if (tsEl) {
        tsEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()
            + ' · ' + now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }
    const nameEl = document.getElementById('uo-threshold-office-name');
    if (nameEl) nameEl.textContent = officeLabel;

    const descEl = document.getElementById('uo-threshold-description');
    if (descEl) descEl.textContent = description;
}

function beginFromUoThreshold() {
    // selectMode(mode) already calls initializeOfficeDefaultsForCurrentDateTime(), which
    // recomputes each lane's own current-office function itself and checks the matching radio/
    // button -- the same functions this threshold used to compute what it displayed. No value
    // needs to be forced through. window._uoThresholdMode is set by showLaneThreshold() for the
    // three non-BCP lanes and cleared by showUoThresholdDefault()/showUniversalModeSelection()'s
    // own call path, so a plain load (never set) still defaults to 'daily' exactly as before.
    selectMode(window._uoThresholdMode || 'daily');
}

// Shows the same #uo-threshold screen BCP uses, but for one of the other three lanes -- called
// from setUserTraditionDefault() (the single funnel every "Where do you pray?" and Church-of-
// the-East-calendar-body pick already goes through) and from the "Another office" grid's Coptic
// Agpeya card. Mirrors showUniversalModeSelection()'s own transition mechanics exactly, minus
// persisting 'universal' as the saved default, since the caller has already persisted (or
// deliberately not persisted, for the grid's one-off case) the real lane.
function showLaneThreshold(mode) {
    window._uoThresholdMode = mode;
    syncUniversalOfficeAdvancedToolsVisibility();

    const splashBg = document.getElementById('splash-bg');
    const traditionEntry = document.getElementById('tradition-entry');
    const modeSelection = document.getElementById('mode-selection');

    hideAllActiveOfficeViews();
    if (splashBg) splashBg.style.display = '';
    hideEntrySurface(traditionEntry);
    showEntrySurface(modeSelection);

    document.body.classList.remove('office-active');
    document.body.classList.remove('roman-breviary-dev-mode');

    updateUoThresholdDisplay(mode);
    showUoThresholdDefault();
}

function showUoThresholdGrid() {
    // BUG FOUND 2026-09-22 (Josh: "Another Office does nothing"): #uo-threshold carries an
    // inline `display:flex` (set for the vertical-centering fix). Inline styles always beat
    // the UA stylesheet's `[hidden] { display:none }` rule, so setting .hidden alone never
    // actually hid it -- the fixed, full-viewport threshold stayed painted over the grid
    // underneath regardless. Setting .style.display directly fixes this for real.
    const threshold = document.getElementById('uo-threshold');
    const grid = document.getElementById('uo-threshold-grid');
    if (threshold) { threshold.hidden = true; threshold.style.display = 'none'; threshold.setAttribute('aria-hidden', 'true'); }
    if (grid) { grid.hidden = false; grid.removeAttribute('aria-hidden'); }
}

function showUoThresholdDefault() {
    const threshold = document.getElementById('uo-threshold');
    const grid = document.getElementById('uo-threshold-grid');
    if (threshold) { threshold.hidden = false; threshold.style.display = 'flex'; threshold.removeAttribute('aria-hidden'); }
    if (grid) { grid.hidden = true; grid.setAttribute('aria-hidden', 'true'); }
}

// ADDED 2026-09-29, per Josh's direct request/correction: the Profile panel
// (name/role/tradition/diocese) is now a standalone modal, opened from a
// persistent icon on every office page and from "Your Profile" on the splash
// screen's Tools row -- explicitly NOT tied to #uo-threshold-grid/"Another
// Office" ("do not attach it to where it currently is"). Same
// backdrop-click-to-close and Escape-to-close pattern as the onboarding
// prompt; syncUserProfileControls() runs on open so the panel always shows
// current data even if it was last synced before something else changed
// (e.g. a diocese ingested since the last time this session opened it).
//
// EXTENDED 2026-09-29 (same day): per Josh's direct instruction, this is now
// also the primary trigger for the one-time onboarding prompt -- "the
// onboarding prompt should appear for the first time when a user clicks on
// the profile button for the first time." A first click (before onboarding
// is complete) shows that prompt instead of this panel; every click after
// that (once Save/Skip has marked onboardingComplete) opens this panel as
// before. See maybeShowOnboardingPrompt's own comment for the second trigger
// (scrolling to the bottom of an office).
function openUserProfilePanel() {
    if (maybeShowOnboardingPrompt()) return;

    const backdrop = document.getElementById('user-profile-panel');
    if (!backdrop) return;
    syncUserProfileControls();
    backdrop.style.display = 'block';
    document.addEventListener('keydown', handleUserProfilePanelKeydown);
}

function closeUserProfilePanel() {
    const backdrop = document.getElementById('user-profile-panel');
    if (!backdrop) return;
    backdrop.style.display = 'none';
    document.removeEventListener('keydown', handleUserProfilePanelKeydown);
}

function handleUserProfilePanelKeydown(event) {
    if (event.key === 'Escape') {
        const confirmBox = document.getElementById('profile-reset-confirm');
        if (confirmBox && !confirmBox.hidden) { closeResetProfileConfirm(); return; }
        closeUserProfilePanel();
    }
}

function showTraditionEntry() {
    const splashBg = document.getElementById('splash-bg');
    const traditionEntry = document.getElementById('tradition-entry');
    const modeSelection = document.getElementById('mode-selection');

    hideAllActiveOfficeViews();
    if (splashBg) splashBg.style.display = '';
    showEntrySurface(traditionEntry);
    hideEntrySurface(modeSelection);

    document.body.classList.remove('office-active');
    document.body.classList.remove('roman-breviary-dev-mode');
    document.body.classList.remove('uo-day'); // see backToSplash()'s 2026-09-25 fix comment

    selectTraditionFamily(null);
}

// FIXED 2026-09-02, found while diagnosing a real report: Josh forced showTraditionEntry()
// (via the new East-Syriac mode-selection card, and separately via the resetUserTraditionDefault()
// console command already recommended as a general-purpose "return to entry" diagnostic) while
// the Bible Browser tool was active, and got a broken, narrow splash with the Bible Reader's own
// content still visible behind it. Root cause: showTraditionEntry() and showUniversalModeSelection()
// both only ever managed their own two sibling entry screens (#mode-selection, #tradition-entry)
// -- neither ever hid the actual office/tool view containers (#daily-office-section, shared by
// Daily Office/Coptic Agpeya/EO/East Syriac; #individual-prayers-section, Book of Needs;
// #bible-browser-section, its own separate system in js/bible-browser/bible-browser.js) that
// selectMode()/openBibleBrowser() show when entering those views. This worked fine as long as
// these functions were only ever called from mode-selection itself (the only path that existed
// before today), but broke the instant either was called from inside an active tool view --
// exactly the scenario both my new card and my own suggested console command created. Shared
// helper so both entry functions hide the same complete set, not two copies that could drift.
function hideAllActiveOfficeViews() {
    const daily   = document.getElementById('daily-office-section');
    const prayers = document.getElementById('individual-prayers-section');
    const bible   = document.getElementById('bible-browser-section');
    if (daily)   daily.style.display   = 'none';
    if (prayers) prayers.style.display = 'none';
    if (bible)   bible.style.display   = 'none';
}

function showUniversalModeSelection(persistDefault = false) {
    if (persistDefault) persistUserEntryDefault('universal');
    syncUniversalOfficeAdvancedToolsVisibility();

    const splashBg = document.getElementById('splash-bg');
    const traditionEntry = document.getElementById('tradition-entry');
    const modeSelection = document.getElementById('mode-selection');

    hideAllActiveOfficeViews();
    if (splashBg) splashBg.style.display = '';
    hideEntrySurface(traditionEntry);
    showEntrySurface(modeSelection);

    document.body.classList.remove('office-active');
    document.body.classList.remove('roman-breviary-dev-mode');
    document.body.classList.remove('uo-day'); // see backToSplash()'s 2026-09-25 fix comment

    // 2026-09-23: this always shows BCP's threshold (updateUoThresholdDisplay() with no
    // argument), so any lane a previous showLaneThreshold() call left in window._uoThresholdMode
    // must be cleared here too -- otherwise Begin could still route to that stale lane even
    // though the screen is showing BCP's office name and text.
    window._uoThresholdMode = undefined;

    updateUoThresholdDisplay();
    showUoThresholdDefault();
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

// ── Tradition availability (admin-controlled offline/paused traditions) ──────
// Generalizes the Byzantine Horologion's 2026-09-25 manual pause into a data-
// driven gate: data/tradition-availability.json is the single source of truth
// for which whole traditions are reachable, read here and applied to the entry
// cards + profile dropdown. See documentation/ADMIN_OFFICE_AVAILABILITY_CONTROL_DESIGN.md.
const TRADITION_AVAILABILITY_URL = 'data/tradition-availability.json';

// Fail-safe only: if the JSON can't be fetched (bad deploy, offline load, etc.),
// isTraditionAvailable() falls back to this set for the entry-routing guard --
// the one gate Josh called "the one that actually mattered" (a returning tester's
// stale stored default silently reopening a paused lane) must never regress even
// when the data-driven path can't run. The entry cards/dropdown need no such
// fallback: their disabled/aria-disabled markup in index.html already ships
// matching today's real state, so a failed fetch just leaves that baseline alone.
const TRADITION_AVAILABILITY_FETCH_FAILURE_FALLBACK = new Set(['eastern-orthodox']);

async function loadTraditionAvailability() {
    try {
        const response = await Promise.race([
            fetch(TRADITION_AVAILABILITY_URL),
            new Promise((_, reject) => window.setTimeout(() => reject(new Error('tradition-availability fetch timeout')), 1500)),
        ]);
        if (!response.ok) return null;
        const data = await response.json();
        return (data && data.traditions && typeof data.traditions === 'object') ? data.traditions : null;
    } catch (err) {
        console.warn('[tradition-availability] Could not load data/tradition-availability.json, entry screen keeps its shipped defaults:', err);
        return null;
    }
}

function isTraditionAvailable(tradition, availability) {
    if (availability && Object.prototype.hasOwnProperty.call(availability, tradition)) {
        return availability[tradition].available !== false;
    }
    return !TRADITION_AVAILABILITY_FETCH_FAILURE_FALLBACK.has(tradition);
}

function applyTraditionAvailabilityToDOM(availability) {
    if (!availability) return; // fetch failed/timed out -- leave index.html's shipped baseline as-is

    document.querySelectorAll('[data-entry-tradition]').forEach(card => {
        const entry = availability[card.dataset.entryTradition];
        if (!entry) return;
        const available = entry.available !== false;
        card.classList.toggle('is-disabled', !available);
        card.disabled = !available;
        card.setAttribute('aria-disabled', available ? 'false' : 'true');
        const subtitle = card.querySelector('small');
        if (subtitle) {
            subtitle.textContent = available
                ? (card.dataset.availableSubtitle || subtitle.textContent)
                : (entry.reason || subtitle.textContent);
        }
    });

    const dropdown = document.getElementById('profile-tradition-default');
    if (dropdown) {
        Array.from(dropdown.options).forEach(option => {
            const entry = availability[option.value];
            if (!entry) return;
            const available = entry.available !== false;
            const baseLabel = option.dataset.availableLabel || option.textContent;
            option.disabled = !available;
            option.textContent = available ? baseLabel : `${baseLabel} — ${entry.reason || 'unavailable'}`;
        });
    }
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
        case 'latin-catholic':
            return { storedDefault: 'latin-catholic', mode: 'roman-breviary-dev' };
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

    // 2026-09-23: the three lanes with a LANE_THRESHOLD_CONFIG entry (coptic-agpeya, east-
    // syriac, horologion) now get the same "It is [time for/the hour of] X" threshold BCP's
    // 'daily' route already had, instead of dropping straight into the office view. 'daily'
    // itself and 'roman-breviary-dev' (no config entry) are untouched -- they still go straight
    // to selectMode() exactly as before.
    if (LANE_THRESHOLD_CONFIG[route.mode]) {
        showLaneThreshold(route.mode);
        return;
    }

    selectMode(route.mode);
}

function handleTraditionEntryClick(event) {
    const button = event.target.closest('button');
    const entry = document.getElementById('tradition-entry');

    if (!button || !entry || !entry.contains(button)) return;

    const family = button.dataset.entryFamily;
    const tradition = button.dataset.entryTradition;
    const isBack = button.dataset.entryBack === 'true';
    const isCoeStep = button.dataset.entryCoeStep === 'true';
    const coeBody = button.dataset.entryCoeBody;

    if (!family && !tradition && !isBack && !isCoeStep) return;

    event.preventDefault();
    event.stopPropagation();

    if (isBack) {
        const backTo = button.dataset.entryBackTo;
        if (backTo === 'eastern') {
            selectTraditionFamily('eastern');
        } else {
            selectTraditionFamily(null);
        }
        return;
    }

    if (isCoeStep) {
        showCoeEntryStep();
        return;
    }

    if (family) {
        selectTraditionFamily(family);
        return;
    }

    if (tradition) {
        if (coeBody === 'acoe' || coeBody === 'ancient') {
            selectCoeEasterMode(coeBody === 'acoe' ? 'gregorian' : 'julian');
        }
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

async function initializeEntryRouting() {
    bindTraditionEntryControls();
    syncUserProfileControls();
    syncUniversalOfficeAdvancedToolsVisibility();
    setExploreOtherOfficesVisible(isExploreOtherOfficesVisible());
    scheduleSplashForegroundGuard();
    syncBibleBrowserSuperUserGate();
    syncAuditDashboardSuperUserGate();

    // Warm the Cycle of Prayer cache on load if the user already has a
    // diocese declared, so the BCP intercessions space has real content on
    // the very first render of the day rather than only after the profile
    // panel is opened once. Fire-and-forget -- refreshCycleOfPrayerForCurrentYear
    // repaints on its own once the fetch resolves. Independent of the routing
    // decision below, so it runs regardless of which branch this function
    // takes.
    const startupProfile = getUserProfileDefaults();
    if (startupProfile.cycleOfPrayerDiocese) {
        refreshCycleOfPrayerForCurrentYear(startupProfile.cycleOfPrayerDiocese);
    }
    if (startupProfile.cycleOfPrayerDiocese && startupProfile.cycleOfPrayerParish) {
        refreshCycleOfPrayerParishForCurrentMonth(startupProfile.cycleOfPrayerDiocese, startupProfile.cycleOfPrayerParish);
    }

    // ADDED 2026-09-30: same warm-then-repaint for a followed parish's prayer
    // intentions. Gated on the profile field, so a reader who follows no parish
    // makes no request at all.
    if (startupProfile.parishIntentionsSlug) {
        refreshParishIntentionsForProfile();
    }

    // Same warming, unconditionally: the worldwide Anglican Cycle of Prayer
    // (scope 'communion' in data/cycles-of-prayer/schema.json) applies to
    // every user identically, so unlike the diocese/parish warm-ups just
    // above this is never gated on any profile field.
    refreshCommunionCycleOfPrayerForCurrentYear();

    // Awaited here, before anything is shown: the entry/mode screens are already
    // hidden-by-default until this function decides which one to display (see the
    // comment on #tradition-entry in index.html), so there is no flash-of-wrong-
    // state risk in waiting on a same-origin JSON fetch (capped at 1.5s) at this
    // point. Applies disabled/reason text to the entry cards and profile dropdown
    // for any tradition the admin has paused, then feeds the same data into the
    // stale-stored-default guard below.
    const traditionAvailability = await loadTraditionAvailability();
    applyTraditionAvailabilityToDOM(traditionAvailability);

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

    // RESTORED 2026-09-02, per Josh's direction: the tradition-picker entry screen was
    // bypassed 2026-07-25 for a specific priest-testing deploy phase, always landing on
    // the 3-button mode-selection screen regardless of any stored preference. That phase
    // is over -- East Syriac (including the ACOE/Ancient Church of the East split built
    // 2026-08-30) is confirmed ready to ship, and needs to be reachable through the real
    // entry flow, not just via a directly-set profile default from a prior visit. Routes
    // through getUserEntryDefault() -- the already-built, already-correct logic this
    // bypass was silently overriding -- instead of unconditionally skipping it.
    let storedDefault = getUserEntryDefault();

    // GENERALIZED 2026-09-25, engine-audit-sweep follow-up: this used to be a single
    // hard-coded `if (storedDefault === 'eastern-orthodox')` block, written the same day
    // Byzantine Horologion was paused. It's now data-driven via
    // data/tradition-availability.json (isTraditionAvailable() above) so any tradition the
    // admin panel marks unavailable gets a returning tester's stale stored default cleared
    // here, not just Horologion specifically -- falling through to the entry screen (where
    // the card is now shown disabled, per applyTraditionAvailabilityToDOM() above) rather
    // than silently reopening a paused lane. See
    // documentation/ADMIN_OFFICE_AVAILABILITY_CONTROL_DESIGN.md.
    if (storedDefault && storedDefault !== 'universal' && !isTraditionAvailable(storedDefault, traditionAvailability)) {
        clearUserEntryDefault();
        storedDefault = null;
    }

    if (storedDefault === 'universal') {
        showUniversalModeSelection(false);
        return;
    }
    if (storedDefault) {
        setUserTraditionDefault(storedDefault);
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
window.setUserProfileMinistryRole = setUserProfileMinistryRole;
window.setUserProfileRomanBreviaryLanguage = setUserProfileRomanBreviaryLanguage;
window.setUserProfileRomanBreviaryCalendar = setUserProfileRomanBreviaryCalendar;
window.setUserProfileDisplayName = setUserProfileDisplayName;
window.setUserProfileSuperUser = setUserProfileSuperUser;
window.setUserProfileCycleOfPrayerDiocese = setUserProfileCycleOfPrayerDiocese;
window.setUserProfileParishIntentionsFromSelect = setUserProfileParishIntentionsFromSelect;
window.joinSelectedParishIntentions = joinSelectedParishIntentions;
window.clearUserProfileParishIntentions = clearUserProfileParishIntentions;
window.setUserProfileCycleOfPrayerParish = setUserProfileCycleOfPrayerParish;
window.resetUniversalOfficeUserProfile = resetUniversalOfficeUserProfile;
window.openLocalProfileDefaultsFromOffice = openLocalProfileDefaultsFromOffice;
window.focusLocalProfileDefaultsPanel = focusLocalProfileDefaultsPanel;
window.syncUniversalOfficeAdvancedToolsVisibility = syncUniversalOfficeAdvancedToolsVisibility;

document.addEventListener('DOMContentLoaded', function () {
    // FIXED 2026-09-29, per Josh's direct instruction ("the onboarding prompt
    // should appear for the first time when a user clicks on the profile
    // button for the first time. Not before prayer."): no longer auto-fires
    // on page load at all -- see openUserProfilePanel() (fires it on a first
    // profile-button click) and office-shell.js's updateRailCurrent() (fires
    // it the first time a reader scrolls to the very bottom of an office,
    // Josh's own suggested second trigger) for where it actually shows now.
    initializeEntryRouting();
});


// ── Office mode headers ──────────────────────────────────────────────────────
// The app shell must name the active office family. "The Universal Office" is
// the selector/project shell, not the title of every tradition page.
// UPDATED 2026-09-28: matched the same five church-body names Josh confirmed
// directly elsewhere at the time (see UNIVERSAL_OFFICE_TRADITION_LABELS above
// and RESUME_PROJECT_NOTE.md's Task #14 entry) -- this was a further,
// still-older spot carrying its own naming ('The Episcopal Church', a bare
// office name for Catholic) found and fixed in the same pass.
// CORRECTED 2026-10-06, per Josh's direct instruction ("The very top of the
// office should have the office name not the church name"): this header names
// the OFFICE (The Daily Office, The Coptic Agpeya, The Hudra, The Horologion,
// The Roman Breviary), not the church body or tradition. The same day he
// clarified that The Episcopal Church is the church within the Anglican
// tradition, not the tradition itself, so tradition pickers now say
// "Anglican" and The Episcopal Church appears only as the church named in
// descriptions.
const OFFICE_MODE_HEADER_LABELS = {
    daily: 'The Daily Office',
    'coptic-agpeya': 'The Coptic Agpeya',
    'east-syriac': 'The Hudra',
    horologion: 'The Horologion',
    'roman-breviary-dev': 'The Roman Breviary',
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
    horologion: 'EO',
    'roman-breviary-dev': 'LC'
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

    // FIXED 2026-09-03, same root cause as the showTraditionEntry()/showUniversalModeSelection()
    // fix earlier this session: selectMode() had the identical gap in the other direction -- it
    // never accounted for Bible Browser (a separate system with its own independent
    // DOMContentLoaded bootstrap in js/bible-browser/bible-browser.js) possibly already being
    // shown, so switching into a real tradition/office view could leave Bible Browser's own
    // content rendered underneath it. Same shared helper closes this uniformly.
    hideAllActiveOfficeViews();
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

    // FIXED 2026-09-03, same reason as the identical fix in backToSplash() above: a stale
    // East-Syriac-specific date/hour override (set by that tradition's own Prev/Next buttons or
    // date picker) must not silently persist into whatever mode/tradition is being switched to.
    window._esyTemporalOverride = { active: false, date: null, hourId: null };


    const mainContent = document.getElementById('main-content');

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
            `<div class="office-container"><h3>Preparing ${_sharedOfficeNavigatorEscape(_horologionOfficeLabel(selectedHorologionOffice))}…</h3><p>Loading the Byzantine Office.</p></div>`;

        await loadKernel();
        initializeOfficeDefaultsForCurrentDateTime('horologion');
        isHydrationComplete = true;
        requestRender();
        if (window.OfflinePacks) window.OfflinePacks.noteOrthodoxEntry(); // keep the saint icons offline too

    } else if (mode === 'roman-breviary-dev') {
        // ── Roman Breviary 1960/1962 ────────────────────────────────────────────
        // Reachable from the entry screen's "Catholic" card and the Universal
        // selector's own mode grid. The manifest data behind this covers the
        // full minimum-shippable floor (Roman general calendar, Rubrics
        // 1960/1962, Latin, all eight hours, 2026-2027) -- the "dev" in the mode
        // key/id names is now just history, not a coverage disclaimer.
        document.getElementById('individual-prayers-section').style.display = 'none';
        document.getElementById('daily-office-section').style.display       = 'flex';

        if (mainContent) {
            mainContent.classList.remove('sidebar-hidden');
        }

        const officeDisplay = document.getElementById('office-display');
        if (officeDisplay) {
            officeDisplay.innerHTML =
                `<div class="office-container"><h3>Preparing the 1962 Breviary...</h3><p>Loading the pinned Divinum vertical slice.</p></div>`;
        }

        await loadKernel();

        if (!window.RomanBreviary1960DevSlice || typeof window.RomanBreviary1960DevSlice.mountDevSlice !== 'function') {
            if (officeDisplay) {
                officeDisplay.innerHTML =
                    `<div class="office-container"><h3>1962 Breviary unavailable</h3><p>The Breviary module did not load.</p></div>`;
            }
            console.warn('[roman-breviary-dev] RomanBreviary1960DevSlice module unavailable.');
            return;
        }

        // Same shape as every other lane: date and hour live in the shared navigator and the
        // Office Settings drawer; this lane only renders (renderRomanBreviary).
        initializeOfficeDefaultsForCurrentDateTime('romanBreviary');
        isHydrationComplete = true;
        requestRender();

    } else {
        // ── Daily Office (default) ────────────────────────────────────────────
        document.getElementById('individual-prayers-section').style.display = 'none';
        document.getElementById('daily-office-section').style.display       = 'flex';

        mainContent.classList.remove('sidebar-hidden');

        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Loading...</h3><p>Preparing your daily office...</p></div>`;

        await hydrateForDailyOffice();
        loadSettings();
        updateBorrowedDevotionsCount();
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
            `<div class="office-container"><h3>System Error</h3><p>${_sharedOfficeNavigatorEscape(err.message)}</p></div>`;
        console.error('[init] Kernel load failed:', err);
    }
}
// ── Date Controls ────────────────────────────────────────────────────────────
function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    updateDatePicker();
  if (selectedMode === 'horologion') { updateGenericDateDisplay(); _updateHorologionOfficeButtons(); }
    requestRender();
}
function resetDate() {
    currentDate = new Date();
    updateDatePicker();
  if (selectedMode === 'horologion') { updateGenericDateDisplay(); _updateHorologionOfficeButtons(); }
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
    if (selectedMode === 'horologion') { updateGenericDateDisplay(); _updateHorologionOfficeButtons(); }
    requestRender();
}



// ── Shared Office Navigation Apparatus ───────────────────────────────────────
// One control grammar for all office traditions:
// date navigation + date picker + hour/office selection.
// Tradition-specific words are allowed; interaction structure is not.
const SHARED_OFFICE_NAVIGATOR_CONFIGS = {
    daily: {
        dateTitle: "Date",
        datePickerLabel: "Select Date",
        officeTitle: "Time of Day",
        options: [
            { value: "morning-office", label: "Morning Prayer", detail: "Morning" },
            { value: "noonday-office", label: "Noonday Prayer", detail: "Midday" },
            { value: "evening-office", label: "Evening Prayer", detail: "Evening" },
            { value: "compline-office", label: "Compline", detail: "Night" },
        ],
    },
    coptic: {
        dateTitle: "Date",
        datePickerLabel: "Select Date",
        officeTitle: "Hour",
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
        dateTitle: "Date",
        datePickerLabel: "Select Date",
        officeTitle: "Canonical Hour",
        // FIXED 2026-09-03, found via a real report (Josh: "It's in dark mode, with no option to
        // change"): every other tradition using this shared navigator (Coptic, immediately above)
        // has showAppearanceToggle set, giving it a real Dark Mode checkbox in its own sidebar.
        // East Syriac's config simply never set this, so the whole "Appearance" section never
        // rendered here at all -- not a CSS/rendering bug, a missing config value.
        showAppearanceToggle: true,
        appearanceToggleId: "toggle-dark-east-syriac",
        options: [
            { value: "sapra", label: "Sapra", detail: "Morning Prayer · 06:00–09:00" },
            { value: "endana", label: "Endana", detail: "Prayer at Noon, Great Fast only · 12:00–18:00" },
            { value: "ramsha", label: "Ramsha", detail: "Evening Prayer · 18:00–21:00" },
            { value: "lelya", label: "Lelya", detail: "Night Office · 21:00–03:00" },
            { value: "subaa", label: "Suba'a", detail: "Pre-dawn · 03:00–06:00" },
        ],
    },
    romanBreviary: {
        dateTitle: "Date",
        datePickerLabel: "Select Date",
        officeTitle: "Hour",
        options: [
            { value: "matins", label: "Matins", detail: "Matutinum" },
            { value: "lauds", label: "Lauds", detail: "Morning" },
            { value: "prime", label: "Prime", detail: "First hour" },
            { value: "terce", label: "Terce", detail: "Third hour" },
            { value: "sext", label: "Sext", detail: "Sixth hour" },
            { value: "none", label: "None", detail: "Ninth hour" },
            { value: "vespers", label: "Vespers", detail: "Evening" },
            { value: "compline", label: "Compline", detail: "Night" },
        ],
    },
    horologion: {
        dateTitle: "Date",
        datePickerLabel: "Select Date",
        officeTitle: "Office",
        showAppearanceToggle: true,
        appearanceToggleId: "toggle-dark-horologion",
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
    if (selectedMode === "roman-breviary-dev") return "romanBreviary";
    if (selectedMode === "daily" || !selectedMode) return "daily";
    return null;
}
/* Exposed so js/office-shell.js and js/office-drawer.js can read the active
   lane without re-deriving it from the DOM. `selectedMode` itself is a bare
   top-level `let` (line 3), never a `window` property, so a function is
   exposed instead of mirroring the variable -- a mirrored copy would go
   stale the moment `selectedMode` is reassigned by bare identifier
   elsewhere in this file, silently reintroducing the exact bug class
   recorded in AUDIT_GOVERNANCE_LEDGER.md (a prior fix assumed
   window.selectedMode worked and shipped a no-op). This function always
   reads the current value. */
window._sharedOfficeNavigatorModeKey = _sharedOfficeNavigatorModeKey;

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
    if (modeKey === "romanBreviary") {
        return selectedRomanBreviaryHour || "lauds";
    }
    return "";
}

function _sharedOfficeNavigatorCleanLine(value) {
    const text = String(value || "").trim();
    if (!text || text === "—" || /^loading/i.test(text)) return "";
    return text;
}

// FIXED 2026-09-03, found from a real screenshot: the date card read one day
// behind the date picker. Cause: requestRender() calls renderSharedOfficeNavigation()
// synchronously, but #display-date / #generic-display-date / #esy-active-*-label
// are only written later, inside the deferred office render -- so scraping those
// nodes always returned the PREVIOUS render's text. This now derives the line
// from currentDate and the config directly, so it cannot lag behind the picker.
function _sharedOfficeNavigatorCurrentLine(modeKey) {
    if (modeKey === "eastSyriac") {
        const config = SHARED_OFFICE_NAVIGATOR_CONFIGS.eastSyriac;
        const activeValue = _sharedOfficeNavigatorActiveValue("eastSyriac");
        const option = config.options.find(o => o.value === activeValue);
        // The detail field is "<English gloss> · <clock range>"; only the gloss
        // belongs in this line, not the clock range.
        const gloss = option ? String(option.detail || "").split("\u00b7")[0].trim() : "";
        const hour = option ? [option.label, gloss].filter(Boolean).join(" \u2014 ") : "";
        return [hour, _sharedOfficeNavigatorReadableDate()].filter(Boolean).join(" \u00b7 ");
    }
    return _sharedOfficeNavigatorReadableDate();
}

/* CORRECTED (Phase 6, sidebar-deletion refactor): this file used to also
   define _sharedOfficeNavigatorHideLegacy() and two helpers here, which
   retired old sibling markup inside each mode's own legacy sidebar so it
   wouldn't visually clash with the freshly-built nav sitting next to it.
   That legacy markup no longer exists (moved/deleted as part of this
   refactor), so there is nothing left for that machinery to retire -- it
   and the hideSelectors/hideHeadings/hideButtonRowsAfterHeadings/
   hideNestedHeadings config keys it read have been deleted outright,
   confirmed unread anywhere else in the repo before removal. */

const SHARED_OFFICE_NAV_HOST_ID = "legacy-office-controls";

function renderSharedOfficeNavigation() {
    const modeKey = _sharedOfficeNavigatorModeKey();
    if (!modeKey) return;

    const config = SHARED_OFFICE_NAVIGATOR_CONFIGS[modeKey];
    const panel = document.getElementById(SHARED_OFFICE_NAV_HOST_ID);
    if (!panel) return;

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
                    data-app-dark-toggle
                    ${document.body.classList.contains('dark-mode') ? 'checked' : ''}
                    onchange="updateUI(this.checked); saveSettings()">
                <span class="shared-office-nav-option-copy">
                    <span class="shared-office-nav-option-label">Dark Mode</span>
                </span>
            </label>
        </section>` : '';

    // Liturgical Education Layer control (Charter section 11). Rendered for
    // every mode without a config flag, deliberately: the standing sidebar
    // directive is uniform headings and a common drawer grammar across all four
    // offices, and universal-office-navigation-architecture.md section 4 already
    // names "display depth" as one of the drawer's expected office controls.
    const depthHtml = `
        <section class="shared-office-nav-card shared-office-nav-formation-card">
            <div class="shared-office-nav-section-title">Formation</div>
            <label class="shared-office-nav-date-picker">
                <span>Explanations</span>
                <select onchange="setExplanationDepth(this.value)">
                    <option value="0" ${selectedExplanationDepth === 0 ? 'selected' : ''}>Prayer only</option>
                    <option value="1" ${selectedExplanationDepth === 1 ? 'selected' : ''}>Brief glosses</option>
                    <option value="2" ${selectedExplanationDepth === 2 ? 'selected' : ''}>Glosses and structure</option>
                </select>
            </label>
            <div class="shared-office-nav-actions">
                <button type="button" onclick="openTraditionExplanation()">About this tradition</button>
            </div>
        </section>`;

    nav.dataset.sharedOfficeNav = modeKey;
    nav.innerHTML = `
        <section class="shared-office-nav-card shared-office-nav-date-card" aria-label="${_sharedOfficeNavigatorEscape(config.dateTitle)}">
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
        </section>${depthHtml}`;
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
        return;
    }

    if (modeKey === "romanBreviary") {
        selectedRomanBreviaryHour = value;
        requestRender();
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

    if (modeKey === "daily" || modeKey === "horologion" || modeKey === "coptic" || modeKey === "romanBreviary") {
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

        // FIXED 2026-09-03, per Josh's follow-up: previously this set active:true
        // unconditionally on every use of Prev/Next or the date picker, even when the result
        // happened to land back on today's actual date and the naturally-current hour --
        // meaning Next-then-Prev, or picking today's own date from the picker, would still show
        // "override" for no real reason. Now only true "override" states (a different day, or
        // today but a different hour than would naturally be showing right now) are marked as
        // such; landing back on the genuine current moment is treated the same as never having
        // navigated away, matching what todaySharedOfficeNavDate() already does explicitly.
        const isActualToday = _sharedOfficeNavigatorIsoDate(targetDate) === _sharedOfficeNavigatorIsoDate(new Date());
        const isNaturalHour = hourId === getEastSyriacHourInfo().value;
        const isGenuineOverride = !(isActualToday && isNaturalHour);

        window._esyTemporalOverride = isGenuineOverride
            ? { active: true, date: targetDate, hourId }
            : { active: false, date: null, hourId: null };
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

// Map clock time to one of the Roman Breviary's eight canonical Hours, in
// their traditional daily order (Matins through Compline). There's no single
// "correct" clock mapping for the pre-Vatican-II Hours -- Matins and Lauds
// were historically prayed at night or anticipated the evening before -- so
// this just picks a reasonable default for a user opening the office cold,
// the same role the other lanes' _default*ForCurrentTime helpers play.
function _defaultRomanBreviaryHourForCurrentTime(now = new Date()) {
    const hour = now.getHours();
    if (hour >= 0 && hour < 3) return "matins";
    if (hour >= 3 && hour < 6) return "lauds";
    if (hour >= 6 && hour < 9) return "prime";
    if (hour >= 9 && hour < 12) return "terce";
    if (hour >= 12 && hour < 15) return "sext";
    if (hour >= 15 && hour < 18) return "none";
    if (hour >= 18 && hour < 21) return "vespers";
    return "compline";
}

// The dev-slice manifests only cover full calendar years 2026-2027
// (architecture §10's minimum-shippable floor) -- clamp so a clock outside
// that window still lands on real data instead of a fetch 404.
function _clampRomanBreviaryDateToSupportedRange(isoDate) {
    if (isoDate < '1900-01-01') return '1900-01-01';
    if (isoDate > '2100-12-31') return '2100-12-31';
    return isoDate;
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
// Boot order, per Josh's direction 2026-09-03: honour the operating system's
// own colour-scheme preference first, since that is the setting the person has
// already deliberately made for every other app they use. Only when the OS
// expresses no preference (or the browser doesn't support the query) does this
// fall back to the older clock rule (light 06:00-18:00, dark otherwise).
//
// This is a BOOT default only. A manual toggle in any sidebar overrides it for
// the session, and no listener re-imposes the OS value afterwards -- an OS
// theme change mid-session must not silently undo a deliberate choice.
function _defaultDarkModeForCurrentTime(now = new Date()) {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
        try {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) return true;
            if (window.matchMedia("(prefers-color-scheme: light)").matches) return false;
        } catch (_) {
            // Fall through to the clock rule below.
        }
    }
    const hour = now.getHours();
    return !(hour >= 6 && hour < 18);
}

// Single source of truth for applying the color theme: sets the body classes
// and keeps every dark-mode checkbox across every tradition's sidebar in
// sync with each other, regardless of which one the person actually clicked.
function applyDarkMode(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('light-mode', !isDark);
    // Every dark-mode checkbox in the app, not a hardcoded subset. This list
    // was previously ['toggle-dark', 'toggle-dark-coptic'] and silently missed
    // each new tradition's toggle as it was added -- the same hardcoded-list
    // omission already recorded twice in RESUME_PROJECT_NOTE.md. Selecting by
    // a shared attribute instead means a new surface's toggle is covered the
    // moment it exists, with no list to remember to update.
    document.querySelectorAll('input[type="checkbox"][data-app-dark-toggle]').forEach(el => {
        el.checked = isDark;
    });
}
window.applyDarkMode = applyDarkMode;
window._defaultDarkModeForCurrentTime = _defaultDarkModeForCurrentTime;

// ADDED 2026-09-28, per Josh's direct instruction: "Defaults" and "Back to
// Modes" both ultimately called backToSplash() -- a redundant duplicate.
// "Defaults" is removed outright; "Back to Modes" is renamed "Explore other
// Offices" and hidden by default, shown only once the reader opts in via
// this checkbox (#toggle-explore-other-offices, surfaced in every lane's
// Office Settings drawer -- see js/office-drawer.js's buildKeep()). One
// button, one localStorage key, applies globally: the button is a single
// position:fixed element outside any per-tradition template, not duplicated
// per lane, so this one toggle genuinely covers every office view.
const EXPLORE_OTHER_OFFICES_STORAGE_KEY = 'uoExploreOtherOfficesVisible';

function isExploreOtherOfficesVisible() {
    try {
        // 2026-10-03: now visible unless the reader explicitly turned it off. Hidden-by-default
        // left first-time users (reported on Safari/Mac) with no way out of an office page.
        return localStorage.getItem(EXPLORE_OTHER_OFFICES_STORAGE_KEY) !== 'false';
    } catch (e) {
        return true; // no storage: show the exit rather than trap the reader
    }
}

function setExploreOtherOfficesVisible(visible) {
    try {
        localStorage.setItem(EXPLORE_OTHER_OFFICES_STORAGE_KEY, visible ? 'true' : 'false');
    } catch (e) { /* localStorage unavailable (private browsing, quota) -- degrade silently */ }

    const btn = document.getElementById('app-mode-return-button');
    if (btn) btn.hidden = !visible;

    const box = document.getElementById('toggle-explore-other-offices');
    if (box) box.checked = !!visible;
}
window.isExploreOtherOfficesVisible = isExploreOtherOfficesVisible;
window.setExploreOtherOfficesVisible = setExploreOtherOfficesVisible;

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

    if (modeKey === "romanBreviary") {
        selectedRomanBreviaryHour = _defaultRomanBreviaryHourForCurrentTime(now);
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

const INTERHOUR_OFFICE_KEYS = ['interhour-first', 'interhour-third', 'interhour-sixth', 'interhour-ninth'];

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

    // Interhours are appointed only on two days a year (UNABHOR1997 p.93 --
    // see HorologionEngine.isInterhourAppointed). Previously all four were
    // always shown, selecting one on an ordinary day just rendered a "Not
    // Appointed" disclosure -- hide them instead, so the picker only offers
    // what's actually appointed today.
    const interhourAppointed =
        typeof window !== 'undefined' &&
        window.HorologionEngine &&
        typeof window.HorologionEngine.isInterhourAppointed === 'function'
            ? window.HorologionEngine.isInterhourAppointed(currentDate)
            : true; // fail open: if the check itself is unavailable, don't hide real options

    // If the currently-selected office is an interhour that's about to be
    // hidden (e.g. the reader changed the date while one was selected), fall
    // back to a sensible default rather than leaving no radio checked.
    if (!interhourAppointed && INTERHOUR_OFFICE_KEYS.includes(selectedHorologionOffice)) {
        selectedHorologionOffice = _defaultHorologionOfficeForCurrentTime(currentDate);
    }

    keys.forEach(key => {
        const input = document.getElementById(`hor-btn-${key}`);
        if (!input) return;

        const row = input.closest('.hor-office-option');
        if (INTERHOUR_OFFICE_KEYS.includes(key)) {
            const hidden = !interhourAppointed;
            if (row) row.hidden = hidden;
            input.disabled = hidden;
        }

        const isActive = key === selectedHorologionOffice;
        input.checked = isActive;

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
        // FIXED 2026-09-24: this used to also set el.checked = false whenever a
        // control was hidden for the current office -- e.g. every visit to
        // Compline unchecked Suffrages and Rotate Venite/Jubilate, and that
        // unchecked state was then saved by saveSettings(), so returning to
        // Morning/Evening Prayer showed them off too, silently overriding their
        // true defaults (checked). Confirmed harmless to stop doing: every
        // control this function hides is read by renderOffice() only inside the
        // office-specific branch that actually uses it (e.g. suffragesChecked at
        // js/office-ui.js:4365 feeds only the Morning/Evening Prayer branch), so
        // its checked state while hidden for an unrelated office never reaches
        // that office's own output. Hiding the row is enough; the setting itself
        // must survive the visit.
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
    const bcpOnly = document.getElementById('toggle-bcp-only')?.checked || false;

    // FIXED 2026-09-03, found during a real content audit: 'ecumenical-devotions-section' is
    // entirely optional/non-BCP content (Agpeya, Church of the East hours, Marian Element), so
    // hiding the whole section is correct. But 'during-office-section' and
    // 'closing-devotions-section' each mix genuine BCP-authorized settings (Gloria Patri, the
    // Invitatory/Noonday/Compline rotation options, Suffrages, the second Collect, the closing
    // blessing -- all citing real BCP page numbers) together with a handful of ecumenical
    // additions (Angelus, Trisagion, Prayer Before Reading, the Examen, Kyrie Pantocrator).
    // Hiding those whole containers meant BCP Only Mode also hid legitimate BCP controls that
    // have nothing to do with staying BCP-only. Now only the specific ecumenical toggles' own
    // <label> rows are hidden, leaving every genuine BCP setting visible and adjustable.
    const wholeSection = document.getElementById('ecumenical-devotions-section');
    const ecumenicalToggleIds = ['toggle-angelus', 'toggle-trisagion', 'toggle-east-syriac-hours',
        'toggle-agpeya-opening', 'toggle-prayer-before-reading', 'toggle-examen', 'toggle-kyrie-pantocrator'];

    if (bcpOnly) {
        if (wholeSection) wholeSection.classList.add('bcp-only-hidden');
        ecumenicalToggleIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.checked = false;
                const label = el.closest('label');
                if (label) label.classList.add('bcp-only-hidden');
            }
        });
    } else {
        if (wholeSection) wholeSection.classList.remove('bcp-only-hidden');
        ecumenicalToggleIds.forEach(id => {
            const el = document.getElementById(id);
            const label = el?.closest('label');
            if (label) label.classList.remove('bcp-only-hidden');
        });
    }
    requestRender();
}

// ── Appearance ───────────────────────────────────────────────────────────────
function updateUI(explicitIsDark) {
    // Selects by attribute, not by a single id.
    //
    // This previously read `getElementById('toggle-dark')?.checked !== false`.
    // `toggle-dark` occurs ONCE in index.html, inside the BCP settings panel, so
    // every other lane was reading a checkbox belonging to a different
    // tradition -- and when the element is absent `?.checked` is `undefined`,
    // and `undefined !== false` is TRUE, so a missing element resolved to DARK.
    // The Coptic Agpeya and the East Syriac Hudra both forced dark because of
    // it. This is the same hardcoded-id failure mode recorded twice in
    // applyDarkMode() immediately below, which is why that function selects on
    // `[data-app-dark-toggle]`; updateUI() simply never got the same treatment.
    //
    // Falls back to the time-of-day default when no toggle exists at all, which
    // is what the app does elsewhere, rather than to an arbitrary dark.
    let isDark;
    if (typeof explicitIsDark === 'boolean') {
        isDark = explicitIsDark;
    } else {
        const box = document.querySelector('input[type="checkbox"][data-app-dark-toggle]');
        isDark = box ? box.checked : _defaultDarkModeForCurrentTime();
    }
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
// 2026-09-23: Phase 4 remainder (UI_REDESIGN_HANDOFF.md §5) -- borrowed-devotions count.
// Native-vs-borrowed classification is Josh's own call (2026-09-23), not invented here: every
// toggle listed carries no BCP page citation in its own tooltip, unlike every native option
// nearby. The Marian Element's "theotokion" and "both" values both count Theotokion as active;
// "antiphon" alone (the BCP Seasonal Antiphon) does not, since that option is native. Physical
// relocation of these 8 controls out of their current three sections (During/After/Opening
// Devotions) into one consolidated group is the fuller version of this Phase 4 item and was
// deliberately NOT done tonight -- moving DOM without being able to render-check the result
// risked breaking working tooltips/handlers for a change this environment can't verify. This
// is the count-and-mark half only.
const BORROWED_DEVOTION_IDS = [
    'toggle-angelus', 'toggle-trisagion', 'toggle-prayer-before-reading',
    'toggle-examen', 'toggle-kyrie-pantocrator',
    'toggle-agpeya-opening', 'toggle-east-syriac-hours',
];
function updateBorrowedDevotionsCount() {
    const el = document.getElementById('borrowed-devotions-count');
    if (!el) return;
    let active = BORROWED_DEVOTION_IDS.filter(id => document.getElementById(id)?.checked).length;
    const marian = document.querySelector('input[name="marian-element"]:checked')?.value;
    if (marian === 'theotokion' || marian === 'both') active += 1;
    const total = BORROWED_DEVOTION_IDS.length + 1; // +1 for Theotokion
    el.textContent = active > 0
        ? `${active} of ${total} borrowed devotions active`
        : `No borrowed devotions active (${total} available)`;
}

function saveSettings() {
    updateBorrowedDevotionsCount();
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
        // 2026-10-03: these two now default ON. Blobs saved before this marker existed hold
        // the old default (false) rather than a choice, so loadSettings() ignores them.
        closingPrayersDefaultOn: true,
        prayerBeforeReading: document.getElementById('toggle-prayer-before-reading')?.checked || false,
        examen:              document.getElementById('toggle-examen')?.checked || false,
        kyriePantocrator:    document.getElementById('toggle-kyrie-pantocrator')?.checked || false,
        studyMode:                     appSettings.studyMode,
        eoMode:                        selectedEoMode,
        coeEasterMode:                 selectedCoeEasterMode,
        horologionReductionProfile:    selectedHorologionReductionProfile,
        explanationDepth:              selectedExplanationDepth
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
        if (s.closingPrayersDefaultOn) {
            setChk('toggle-general-thanksgiving',  s.generalThanksgiving);
            setChk('toggle-chrysostom',            s.chrysostom);
        }
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

        // Liturgical Education Layer depth (Charter section 11). Validated
        // against the same closed set the setter uses; anything else falls back
        // to the default rather than being trusted from storage.
        if (typeof s.explanationDepth === 'number' && [0, 1, 2].includes(s.explanationDepth)) {
            selectedExplanationDepth = s.explanationDepth;
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
    // ADDED 2026-09-12. Injected HERE, at the one canonical wrapper, rather
    // than at each of the call sites scattered through this file -- every
    // renderer inherits the user's OOR sub-tradition without being touched,
    // and there is no call site left to forget. An explicit opts.subtradition
    // from a caller still wins, so the admin/dashboard paths can override.
    const profile = getUserProfileDefaults();
    const merged = Object.assign(
        { subtradition: (profile && profile.oorSubtradition) || null },
        opts || {}
    );
    return SaintsResolver.resolveCommemorations(date, tradition, merged);
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
    } else if (selectedMode === 'roman-breviary-dev') {
        return renderRomanBreviary();
    } else {
        return renderBcpOffice();
    }
}


// ── ROMAN BREVIARY UI ADAPTER ─────────────────────────────────────────────────
// Date and hour come from the shared navigator (currentDate, selectedRomanBreviaryHour); language from
// the profile. All liturgical work is done by the engine (js/roman-breviary/*), driven through
// js/roman-breviary-1960-1962-dev-slice.js.
async function renderRomanBreviary() {
    const display = document.getElementById('office-display');
    if (!display) return;
    if (!window.RomanBreviary1960DevSlice || typeof window.RomanBreviary1960DevSlice.mountDevSlice !== 'function') {
        display.innerHTML = `<div class="office-container"><h3>1962 Breviary unavailable</h3><p>The Breviary module did not load.</p></div>`;
        return;
    }
    const date = _clampRomanBreviaryDateToSupportedRange(_sharedOfficeNavigatorIsoDate(currentDate));
    try {
        await window.RomanBreviary1960DevSlice.mountDevSlice('office-display', {
            year: Number(date.slice(0, 4)),
            date,
            hour: selectedRomanBreviaryHour || 'lauds',
            language: getUserProfileDefaults().romanBreviaryLanguage,
            calendar: getUserProfileDefaults().romanBreviaryCalendar
        });
    } catch (err) {
        display.innerHTML = `<div class="office-container"><h3>1962 Breviary failed</h3><p>${_sharedOfficeNavigatorEscape(err.message)}</p></div>`;
        console.error('[roman-breviary] render failed:', err);
    }
}

// Language choice from Office Settings: remembered in the profile, then the office re-renders.
function setRomanBreviaryLanguage(value) {
    setUserProfileRomanBreviaryLanguage(value);
    requestRender();
}
window.setRomanBreviaryLanguage = setRomanBreviaryLanguage;
window.getRomanBreviaryLanguage = () => getUserProfileDefaults().romanBreviaryLanguage;

// Calendar choice (Rubrics 1960 general calendar, or the same rubrics with the 2020 USA calendar).
function setRomanBreviaryCalendar(value) {
    setUserProfileRomanBreviaryCalendar(value);
    requestRender();
}
window.setRomanBreviaryCalendar = setRomanBreviaryCalendar;
window.getRomanBreviaryCalendar = () => getUserProfileDefaults().romanBreviaryCalendar;

// ── HOROLOGION UI ADAPTER ─────────────────────────────────────────────────────
//
// renderHorologionOffice() is a THIN ADAPTER only. All liturgical logic lives
// in HorologionEngine (js/horologion-engine.js). This function:
//   1. Calls HorologionEngine.resolveOffice() — non-throwing by contract.
//   2. Checks payload.status === "error" and renders a visible error block.
//   3. Walks sections and items, rendering placeholders as visible dashed blocks.
//   4. Publishes the resolved-office envelope (Phase 5, lane 3 of 3) -- see
//      _pushHorologionEnvelopeEntries() below for the item-type -> role mapping.
//
// No calendar logic, no feast resolution, no text composition belongs here.
//
async function renderHorologionOffice(officeKey) {
    const display = document.getElementById('office-display');
    if (!display) return;

    // resolveOffice() is non-throwing: all failures come back as status:"error"
    const payload = await HorologionEngine.resolveOffice(currentDate, officeKey, {
        eoMode: selectedEoMode,
        parishDedication: getUserProfileDefaults().parishDedication
    });

    // ── Error state: surface explicitly, never silently blank ────────────────
    // No envelope is published here -- there is no resolved content to describe,
    // and the error block itself is the honest signal, same as the pre-port code.
    if (payload.status === 'error') {
        const msg = (payload.diagnostics.warnings || []).join(' ') || 'Unknown error.';
        display.innerHTML =
            `<div class="office-container">` +
            `<h3 style="color:var(--rubric)">Horologion Error</h3>` +
            `<p class="component-text">${_sharedOfficeNavigatorEscape(msg)}</p>` +
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

    const container = document.createElement('div');
    container.className = 'office-container';

    const bookTitle = document.createElement('p');
    bookTitle.className = 'office-book-title';
    bookTitle.textContent = 'The Horologion';
    container.appendChild(bookTitle);

    const h2 = document.createElement('h2');
    h2.textContent = payload.title;
    container.appendChild(h2);

    const subtitle = document.createElement('p');
    subtitle.className = 'liturgical-title';
    subtitle.textContent = dateLabel;
    // ADDED 2026-09-25, spec section 6 (Byzantine/Slavic liturgical colour).
    // Same "a single dot beside the day, never a wash over the page" contract
    // the Anglican lane's own dot already implements (see renderBcpOffice()),
    // reused here rather than duplicated blind: a saint/feast's own sourced
    // liturgicalColorEOR wins when one is commemorated that day (matching the
    // Anglican pattern where a Lesser Feast's own colour outranks the season
    // default); Great Lent falls back to purple (this palette's dark/penitential
    // entry -- Bulgakov's own scheme grades Lenten weekdays black-to-purple by
    // day, a distinction this dot deliberately does not attempt, per its own
    // "never a wash" contract); every other day falls back to gold, Bulgakov's
    // own stated general-season default ("used when not using some other
    // colour"). Only the six colours actually sourced get a dot -- anything
    // else renders nothing, honest silence rather than an invented colour.
    try {
        const eorComms = await resolveCommemorations(currentDate, 'EOR', { includeEcumenical: false });
        const eorColor = eorComms.find(s => s.liturgicalColorEOR)?.liturgicalColorEOR
            || (HorologionEngine.getLiturgicalSeason(currentDate) === 'great-lent' ? 'purple' : 'gold');
        const eorDotColor = {
            gold:   '#c9a84c',
            blue:   '#3a6ea5',
            red:    '#9b2335',
            purple: '#6b3070',
            green:  '#4a7c59',
            white:  '#f5f1e4',
        }[eorColor];
        if (eorDotColor) {
            const dot = document.createElement('span');
            dot.className = 'seasonal-dot';
            dot.setAttribute('aria-hidden', 'true');
            dot.style.cssText = `display:inline-block; width:0.5em; height:0.5em; border-radius:50%; background:${eorDotColor}; margin-left:0.5em; vertical-align:middle;`;
            subtitle.appendChild(dot);
        }
    } catch (_error) {
        // Commemoration lookup failing must never block the office itself
        // from rendering -- the dot is a disclosure, not a dependency.
    }
    container.appendChild(subtitle);

    // Diagnostic banner when variable slots remain unresolved
    if (payload.diagnostics.placeholderSlots > 0) {
        const banner = document.createElement('div');
        banner.setAttribute('style',
            'border:1px solid var(--rubric); border-radius:4px; padding:10px 14px; ' +
            'margin:12px 0; font-size:0.8em; color:var(--rubric); font-family:\'Cinzel\',serif; ' +
            'letter-spacing:0.04em;');
        banner.textContent =
            `⚠ Public-beta notice: unresolved slot(s) remain visible below. ` +
            `${payload.diagnostics.placeholderSlots} slot(s) require Octoechos, Menaion, or calendar data.`;
        container.appendChild(banner);
    }

    // env replaces nothing pre-existing here (this lane never built one) -- it is
    // built alongside the same _renderHorologionItem() string output the display
    // has always used, via _pushHorologionEnvelopeEntries() below, so the visible
    // render is byte-for-byte what it was before this port; only the envelope is new.
    const env = { blocks: [], overlays: [], diagnostics: [] };

    const contentDiv = document.createElement('div');
    let contentHtml = '';
    for (const section of payload.sections) {
        contentHtml +=
            `<h3 class="rubric-heading" style="margin-top:1.5em; font-family:'Cinzel',serif; ` +
            `font-size:1em; letter-spacing:0.1em; text-transform:uppercase; color:var(--rubric);">` +
            `${section.label}</h3>`;
        for (const item of section.items) {
            contentHtml += _renderHorologionItem(item);
            _pushHorologionEnvelopeEntries(env, item);
        }
    }
    contentDiv.innerHTML = contentHtml;
    container.appendChild(contentDiv);

    if (window.AnglicanEnvelope) {
        try {
            // Reusing window.AnglicanEnvelope.publish() deliberately -- see the
            // identical comment on renderCopticAgpeya()'s own publish call: it is
            // tradition-neutral, and the shell's listener reads env.tradition/
            // blocks/context/overlays/diagnostics generically. tradition is 'BYZC',
            // matching HorologionEngine's own authoritative `const TRADITION`
            // (js/horologion-engine.js), not the 'EOR' sanctoral-calendar tag used
            // elsewhere in this project for a different subsystem.
            window.AnglicanEnvelope.publish({
                tradition: 'BYZC',
                officeFamily: officeKey || null,
                context: {
                    calendarSummary: HorologionEngine.getCalendarSummary(currentDate) || null,
                    rankSummary: null
                },
                blocks: env.blocks,
                overlays: env.overlays,
                diagnostics: env.diagnostics
            });
        } catch (e) {
            console.warn('[shell] envelope emit failed; the office is unaffected:', e);
        }
    }

    display.replaceChildren(container);
    applyExplanationLayer('office-display');
}

/* Phase 5, lane 3 of 3 -- maps a resolved Horologion item to the contract's
   closed 13-role taxonomy (UNIVERSAL_OFFICE_CORE_CONTRACT.md §7) by item.type,
   built fresh rather than reusing js/anglican-envelope.js's ROLE_BY_LABEL
   table, which was found (2026-09-24, reading it end to end) to contain
   several non-compliant role strings of its own (penitential, invitatory,
   collect, lords-prayer, thanksgiving, suffrages) -- a pre-existing Anglican
   discrepancy, out of scope to fix here, but not one to copy into a new lane.
   item.type maps far more directly onto the taxonomy than any label table
   could: kathisma/psalm -> psalmody, stichera -> hymn, litany -> intercession,
   rubric -> rubric, matching the taxonomy's own worked examples in §7's prose. */
var HOR_ROLE_BY_TYPE = {
    psalm: 'psalmody',
    stichera: 'hymn',
    kathisma: 'psalmody',
    litany: 'intercession'
};

/* Walks one resolved (or unresolved) Horologion item and adds its contribution
   to env -- one block per item, recursing into `sequence` containers rather
   than giving the container itself a block (a sequence is structural grouping,
   not a liturgical unit; each child already gets its own block at the same
   granularity every other item type uses). Unresolved/placeholder items
   contribute NO block -- there is no content to attribute -- but DO contribute
   a real 'coverage-gap' diagnostic, per the explicit governance ruling
   (UI_REDESIGN_HANDOFF.md §8 item 3): the Horologion's incipit-only/deferred
   state is a stated gap, never a silently-dropped placeholder and never framed
   as a user preference. */
function _pushHorologionEnvelopeEntries(env, item) {
    const isUnresolved =
        item.type === 'placeholder' ||
        item.status === 'unresolved' ||
        item.status === 'placeholder';

    if (isUnresolved) {
        bcpPushDiagnostic(env, 'coverage-gap', item.label || item.key || 'Horologion slot');
        return;
    }

    if (item.type === 'sequence') {
        // FIXED 2026-09-28, Josh's live report (raw keys like
        // "usual-beginning-1".."usual-beginning-11" listed in the rail): a
        // sequence's own children are frequently small unlabeled fragments of
        // one continuous passage (e.g. the Usual Beginning's line-by-line
        // exchange) -- recursing into every one of them, unconditionally,
        // pushed each fragment's raw item.key as its own rail entry once the
        // generic fallback below ran out of anything better to call it. A
        // labeled sequence now gets exactly one rail entry, using its own
        // label, matching what the page itself shows as this section's one
        // heading. Recursion into children still happens, but only for a
        // child that carries a genuine label of its own -- never for one
        // that would otherwise fall through to a raw key or a bare "Text".
        if (item.label) {
            env.blocks.push({ label: item.label, role: 'other', units: [] });
        }
        if (Array.isArray(item.items)) {
            item.items.forEach(function (child) {
                if (child && child.label) _pushHorologionEnvelopeEntries(env, child);
            });
        }
        return;
    }

    if (item.type === 'rubric') {
        // An instruction, not source content -- no unit to attribute.
        // FIXED 2026-09-28 (Josh, live: "The Priest blesses: Blessed is our
        // God, always, now and ever..." and several others showing up as
        // rail entries verbatim). This used to fall back to the rubric's
        // own full body TEXT as the rail label whenever no distinct label
        // was set -- backwards: a rubric's text is body content, never a
        // title, and most rubrics (confirmed: 27 of 31 in the Horologion
        // skeleton files) have no label at all, being short procedural
        // asides (a blessing, a censing note) rather than named sections
        // worth their own row. Only a rubric with a REAL label (e.g. the
        // interhours' own "Dismissal") gets a rail entry now, matching the
        // "no rail entry for bare content" convention already established
        // for BCP's own bcpEmitBare(). The rubric's own text still renders
        // normally on the page either way -- _renderHorologionItem() (the
        // sibling call next to this one) is untouched; this only concerns
        // what becomes a rail entry.
        if (item.label) {
            env.blocks.push({ label: item.label, role: 'rubric', units: [] });
        }
        return;
    }

    if (item.type === 'kathisma') {
        const units = [];
        const stases = Array.isArray(item.stases) ? item.stases : [];
        stases.forEach(function (stasis, si) {
            const psalms = Array.isArray(stasis.psalms) ? stasis.psalms : [];
            psalms.forEach(function (psalm) {
                units.push({ kind: 'psalm', citation: psalm.title || ('Stasis ' + (si + 1)) });
            });
        });
        env.blocks.push({ label: item.label || 'Kathisma', role: 'psalmody', units: units });
        return;
    }

    if (item.type === 'litany') {
        env.blocks.push({ label: item.label || 'Litany', role: 'intercession', units: [{ kind: 'litany', citation: null }] });
        return;
    }

    if (item.type === 'psalm' || item.type === 'stichera') {
        env.blocks.push({
            label: item.label || (item.type === 'psalm' ? 'Psalm' : 'Sticheron'),
            role: HOR_ROLE_BY_TYPE[item.type],
            units: [{ kind: item.type, citation: item.label || null }]
        });
        return;
    }

    // Fallback: "text" and any other resolved item type -- the same fallback
    // branch _renderHorologionItem() itself falls through to.
    env.blocks.push({
        label: item.label || item.key || 'Text',
        role: 'other',
        units: [{ kind: item.type || 'text', citation: null }]
    });
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
        // FIXED 2026-09-28: item.label was silently discarded here -- only
        // item.text ever reached the page. Many rubric-type items carry a real,
        // distinct label ("Troparion of the Day", "Theotokion of Compline", the
        // Sessional Hymn slots, etc.) that had never been visible in the running
        // app at any display-depth setting. Same fix, same reasoning, as the
        // 'litany' branch and the fallback branch below.
        const label = item.label
            ? `<p class="rubric-text" style="margin-bottom:0.4em;">${escapeHtml(item.label)}</p>`
            : '';
        const base = `<span class="rubric-text">${item.text || ''}</span>`;
        return label + base + _renderHorologionDiagnostics(item, escapeHtml);
    }

    // v8.1: "text plus a real switch-office action" — used by the Lenten Typika
    // closing rubric to offer "Begin Vespers now" on days Vespers genuinely
    // follows directly, instead of only disclosing that it happens.
    if (item.type === 'action-rubric') {
        const label   = item.label ? `<p class="rubric-text" style="margin-bottom:0.4em;">${escapeHtml(item.label)}</p>` : '';
        const body    = `<div class="horologion-text"><p>${formatParagraphText(item.text || '')}</p></div>`;
        let actionHtml = '';
        if (item.action && item.action.officeKey) {
            const actionLabel = escapeHtml(item.action.label || 'Begin');
            actionHtml = `<button type="button" style="margin-top:8px;" ` +
                `onclick="setSharedOfficeNavHour('horologion', '${item.action.officeKey}')">${actionLabel}</button>`;
        }
        return label + body + actionHtml + _renderHorologionDiagnostics(item, escapeHtml);
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
        // FIXED 2026-09-28: item.label (e.g. "The Great Litany", "The Small
        // Litany") was never rendered anywhere in this branch -- only the
        // dialogue lines showed. Same fix as the 'rubric' branch above.
        const label = item.label
            ? `<p class="rubric-text" style="margin-bottom:0.4em;">${escapeHtml(item.label)}</p>`
            : '';
        const lines = String(item.text || '').split('\n');
        let out = label + '<div class="horologion-litany">';
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

    // Fallback: type "text" or any other resolved item (also covers the
    // engine's 'hymn'/'hymn-group'/'prokeimenon' item types, which have no
    // dedicated branch of their own).
    // FIXED 2026-09-28: item.label was passed to _horologionBodyWrap() only as
    // the <details> summary text for the 'reader'/'educational' display-depth
    // profiles -- under the default 'full' profile (what most users see) it
    // never appeared anywhere. Same fix as the 'rubric' and 'litany' branches
    // above, and the same pattern the 'text'-with-repeat branch just above
    // already used correctly.
    const label = item.label
        ? `<p class="rubric-text" style="margin-bottom:0.4em;">${escapeHtml(item.label)}</p>`
        : '';
    const formatted = formatParagraphText(item.text || '');
    const figure = (item.image && /^images\/icons\/[\w.-]+$/.test(item.image.src || ''))
        ? `<figure class="uo-icon" style="margin:0 0 1em;text-align:center;"><img src="${escapeHtml(item.image.src)}" alt="${escapeHtml(item.image.alt || '')}" loading="lazy" style="max-width:min(100%,260px);max-height:340px;border-radius:4px;"><figcaption style="font-size:0.75em;opacity:0.7;margin-top:0.4em;">${escapeHtml(item.image.credit || '')}</figcaption></figure>`
        : '';
    const baseHtml  = `<div class="horologion-text">${figure}<p>${formatted}</p></div>`;
    return label + _horologionBodyWrap(baseHtml, item, item.label || item.key || 'Text') +
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

// ── Liturgical Education Layer — render attachment (Charter section 11) ──────
//
// Runs AFTER a renderer has set #office-display.innerHTML, and decorates the
// labels already in the DOM. This is deliberate: all four office renderers emit
// the same markup shape (`<span class="rubric-text">LABEL</span>` followed by
// the text), so decorating afterwards gives one integration point per renderer
// instead of editing the ~90 separate string-concatenation sites inside
// renderBcpOffice() alone. That function's innerHTML string building is already
// on record as architectural debt (OFFICE_UI_DOCUMENTATION.md section 3); this
// layer is written not to add to it.
//
// Failure mode is silence, not breakage: a label with no registry entry, a
// corpus that failed to load, or depth 0 all produce an office identical to the
// one rendered before this layer existed.
function applyExplanationLayer(rootId) {
    if (typeof Explanations === 'undefined') return;
    if (!selectedExplanationDepth) return;

    const root = document.getElementById(rootId || 'office-display');
    if (!root) return;

    const tradition = Explanations.traditionForMode(selectedMode);
    if (!tradition) return;

    const escapeAttr = (s) => String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // .rubric-text is the per-element label in all four renderers.
    // .rubric-heading is the Horologion's section heading — a structural label,
    // so it takes structural notes but not per-element glosses.
    const labels = root.querySelectorAll('.rubric-text, .rubric-heading');

    labels.forEach((el) => {
        if (el.dataset.explanationApplied === '1') return;

        // Only ever read the label's own text. Some rubric-text spans in this
        // codebase carry a whole sentence of rubric prose rather than a short
        // label; those simply will not match the registry, which is correct.
        const raw = (el.textContent || '').trim();
        if (!raw || raw.length > 80) return;

        const entry = Explanations.lookup(tradition, raw);
        if (!entry) return;

        el.dataset.explanationApplied = '1';

        // Depth 1 — micro-explanation, via the existing .info-btn/data-tip
        // system in js/tooltip.js. No second tooltip implementation.
        if (entry.micro) {
            const btn = document.createElement('span');
            btn.className = 'info-btn uo-explanation-marker';
            // The gloss only. A reader learning the office wants the fact, not
            // the editor and page it was taken from; provenance lives in the
            // corpus file and on the dashboard, not in the reader's tooltip.
            btn.setAttribute('data-tip', entry.micro);
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-label', 'About ' + raw);
            btn.textContent = 'i';
            el.appendChild(document.createTextNode('\u00a0'));
            el.appendChild(btn);
        }

        // Depth 2 — structural explanation, as a <details> disclosure. Same
        // pattern already proven in _horologionBodyWrap().
        if (selectedExplanationDepth >= 2 && entry.structural) {
            const det = document.createElement('details');
            det.className = 'uo-explanation-structural';
            det.innerHTML =
                '<summary>How this fits into the office</summary>' +
                '<div class="uo-explanation-body">' +
                escapeAttr(entry.structural).replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') +
                '</div>';
            // Insert after the label, before the text it heads, so the note
            // reads as belonging to that element rather than to the next one.
            if (el.parentNode) el.parentNode.insertBefore(det, el.nextSibling);
        }
    });
}

// Depth 3 — tradition explanation (Charter section 11.3). A deliberate,
// separately-opened panel rather than something layered onto every element:
// "how does this tradition work, and how does it differ from others?" is a
// question asked once, not at every versicle.
function openTraditionExplanation() {
    if (typeof Explanations === 'undefined') return;
    const tradition = Explanations.traditionForMode(selectedMode);
    const data = tradition ? Explanations.traditionExplanation(tradition) : null;

    const host = document.getElementById('uo-tradition-explanation');
    if (!host) return;

    if (!data) {
        // Mechanical honesty (charter 0.2): an unwritten explanation says so
        // plainly. It is never filled with another tradition's text, and never
        // silently does nothing when the user asks for it.
        //
        // But "not written" and "not loaded yet" are different claims, and this
        // branch used to make the first when the second was true: the corpus
        // loads asynchronously, so opening the panel early produced a flat
        // assertion that nothing had been written for a tradition whose text
        // was in fact complete. Distinguish them.
        const state = (Explanations.coverage()[tradition] || {}).state;
        if (tradition && state !== 'loaded' && state !== 'missing' && state !== 'error') {
            host.innerHTML =
                '<div class="uo-tradition-explanation-inner">' +
                '<button type="button" class="uo-tradition-explanation-close" ' +
                'onclick="closeTraditionExplanation()" aria-label="Close">&times;</button>' +
                '<h3>About this tradition</h3>' +
                '<p class="uo-explanation-body">Still loading\u2026</p>' +
                '</div>';
            host.style.display = 'block';
            Explanations.loadAll().then(function () { openTraditionExplanation(); })
                                  .catch(function () { /* falls through on reopen */ });
            return;
        }
        host.innerHTML =
            '<div class="uo-tradition-explanation-inner">' +
            '<button type="button" class="uo-tradition-explanation-close" ' +
            'onclick="closeTraditionExplanation()" aria-label="Close">&times;</button>' +
            '<h3>About this tradition</h3>' +
            '<p class="uo-explanation-body">No tradition-level explanation has been written for ' +
            'this office yet. This layer only carries text written from that tradition\u2019s own ' +
            'governing source, cited to the page it came from \u2014 so it is left empty rather ' +
            'than filled in from elsewhere.</p>' +
            '</div>';
    } else {
        const esc = (s) => String(s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        host.innerHTML =
            '<div class="uo-tradition-explanation-inner">' +
            '<button type="button" class="uo-tradition-explanation-close" ' +
            'onclick="closeTraditionExplanation()" aria-label="Close">&times;</button>' +
            '<h3>' + esc(data.label) + '</h3>' +
            '<div class="uo-explanation-body"><p>' +
            esc(data.text).replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') +
            '</p></div>' +
            '</div>';
    }
    host.style.display = 'block';
}

function closeTraditionExplanation() {
    const host = document.getElementById('uo-tradition-explanation');
    if (host) { host.style.display = 'none'; host.innerHTML = ''; }
}

/**
 * ADDED 2026-09-28, per Josh's direct instruction -- "the profile/user
 * system." One-time prompt for name + role. Shown exactly once per browser
 * profile: `Save` and `Skip` both mark `onboardingComplete: true`, so it
 * never reappears on its own afterward -- the person can still change
 * name/role any time from the profile-defaults panel, this is only the
 * one-time introduction. Returns whether it actually rendered, so a caller
 * that wants to show something ELSE instead (see openUserProfilePanel) can
 * branch on it rather than duplicating the `onboardingComplete` check.
 *
 * REWORKED TWICE, 2026-09-29, both times from Josh's own direct live
 * reports. First: the original call site (`initializeEntryRouting().then
 * (maybeShowOnboardingPrompt)`) fired as soon as page-load routing
 * resolved, which for a first-time visitor IS the moment the tradition-entry
 * splash itself first renders -- so this was popping immediately, before
 * the person had touched anything. That first fix moved the trigger to
 * "right after a tradition is chosen" instead -- better, but still not what
 * Josh actually wanted: *"the onboarding prompt should appear for the first
 * time when a user clicks on the profile button for the first time. Not
 * before prayer."* This function no longer auto-fires from ANYWHERE in the
 * page-load/tradition-choice path at all (that call site, and the one in
 * setUserTraditionDefault, are both gone). It's called from exactly two
 * places instead, both genuinely user-initiated, neither "before prayer":
 * openUserProfilePanel() (a first profile-button click, from either the
 * per-office icon or the splash's "Your Profile" button -- the profile
 * button IS reachable before any tradition is chosen, via the splash, so
 * the "No tradition selected yet" copy branch in renderOnboardingPrompt is
 * a real, live path again, not dead code); and office-shell.js's
 * updateRailCurrent(), the first time a reader scrolls to the very bottom
 * of an office -- Josh's own suggested second trigger ("What might be
 * helpful is to have the profile pop up the first time the user scrolls to
 * the very bottom of the prayer").
 */
function maybeShowOnboardingPrompt() {
    const profile = getUserProfileDefaults();
    if (profile.onboardingComplete) return false;
    renderOnboardingPrompt(profile);
    return true;
}

function renderOnboardingPrompt(profile = getUserProfileDefaults()) {
    const host = document.getElementById('uo-onboarding-prompt');
    if (!host) return;

    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    // Echoes back whatever tradition the person has already chosen through
    // the existing entry flow, per the spec's own "should already show
    // whatever tradition/entry info the person has already provided... not
    // ask for it again" -- read-only here, never a second picker for it. The
    // "no tradition" branch is a real, live path as of 2026-09-29: this
    // prompt is now reachable via a first profile-button click from the
    // splash's own "Your Profile" button, before any tradition has been
    // chosen at all (see maybeShowOnboardingPrompt's own comment).
    const traditionLine = profile.traditionDefault && UNIVERSAL_OFFICE_TRADITION_LABELS[profile.traditionDefault]
        ? `Tradition on file: <strong>${esc(UNIVERSAL_OFFICE_TRADITION_LABELS[profile.traditionDefault])}</strong>`
        : 'No tradition selected yet -- you can set one any time from "Where do you pray?".';

    // Reuses the SAME <option> list already in index.html's
    // #profile-ministry-role, cloned live from the DOM rather than a second
    // hard-coded copy that could drift from it -- that select always exists
    // in the DOM (it's only visually hidden behind the Profile panel, never
    // removed), so this is safe to read at any point after page load.
    // Explicitly repopulated for the CURRENT tradition right before cloning
    // (rather than trusting an earlier syncUserProfileControls() call to
    // still be fresh) since this prompt can render right after the person's
    // very first tradition choice, before any other sync has run for it --
    // see UNIVERSAL_OFFICE_MINISTRY_ROLE_OPTIONS.
    const roleSelectSource = document.getElementById('profile-ministry-role');
    populateMinistryRoleSelect(roleSelectSource, profile.traditionDefault, profile.ministryRole);
    const roleOptionsHtml = roleSelectSource ? roleSelectSource.innerHTML : '<option value="lay">Lay use (default)</option>';

    // ADDED 2026-09-29, per Josh's direct instruction: "If the user selects
    // anglican, then obviously that needs to be recorded" -- asked here, at
    // first-profile-open, rather than only later from the profile-defaults
    // panel. Anglican-only (this corpus is TEC-specific), and only once the
    // person actually has that tradition on file -- never a second tradition
    // picker, matching this prompt's own existing "don't re-ask what's
    // already been answered" rule. The diocese/parish <select>s start with
    // only their own default option in this markup; populateCycleOfPrayer-
    // DioceseSelects/populateCycleOfPrayerParishSelect (js/office-ui.js) fill
    // in the rest below, same shared population functions the profile-
    // defaults panel's own pickers use, so the two surfaces can never drift
    // apart into two different diocese lists.
    const cycleOfPrayerFieldsHtml = profile.traditionDefault === 'anglican'
        ? '<div class="uo-onboarding-field">' +
          '<label for="uo-onboarding-cycle-of-prayer-diocese">Your diocese (optional)</label>' +
          '<select id="uo-onboarding-cycle-of-prayer-diocese" onchange="setUserProfileCycleOfPrayerDiocese(this.value)">' +
          '<option value="">Not declared</option>' +
          '</select>' +
          '</div>' +
          '<div class="uo-onboarding-field">' +
          '<label for="uo-onboarding-cycle-of-prayer-parish">Your parish (optional)</label>' +
          '<select id="uo-onboarding-cycle-of-prayer-parish" onchange="setUserProfileCycleOfPrayerParish(this.value)" disabled>' +
          '<option value="">Choose a diocese first</option>' +
          '</select>' +
          '<input type="text" id="uo-onboarding-cycle-of-prayer-parish-other" placeholder="Your parish\'s name" ' +
          'style="display:none" onchange="setUserProfileCycleOfPrayerParishOther(this.value)">' +
          '</div>'
        : '';

    host.innerHTML =
        '<div class="uo-tradition-explanation-inner">' +
        '<h3>Set up your profile</h3>' +
        '<p class="uo-explanation-body">' + traditionLine + '</p>' +
        '<div class="uo-onboarding-field">' +
        '<label for="uo-onboarding-name">Your name (optional)</label>' +
        '<input type="text" id="uo-onboarding-name" autocomplete="name" value="' + esc(profile.displayName || '') + '">' +
        '</div>' +
        '<div class="uo-onboarding-field">' +
        '<label for="uo-onboarding-role">Your role</label>' +
        '<select id="uo-onboarding-role">' + roleOptionsHtml + '</select>' +
        '</div>' +
        cycleOfPrayerFieldsHtml +
        '<div class="uo-onboarding-actions">' +
        '<button type="button" class="uo-onboarding-save" onclick="submitOnboardingPrompt()">Save</button>' +
        '<button type="button" class="uo-onboarding-skip" onclick="skipOnboardingPrompt()">Skip for now</button>' +
        '</div>' +
        '</div>';

    const roleSelect = document.getElementById('uo-onboarding-role');
    if (roleSelect) roleSelect.value = profile.ministryRole;

    if (profile.traditionDefault === 'anglican') {
        populateCycleOfPrayerDioceseSelects(profile.cycleOfPrayerDiocese);
        populateCycleOfPrayerParishSelect(profile.cycleOfPrayerDiocese, profile.cycleOfPrayerParish, profile.cycleOfPrayerParishOther);
    }

    host.style.display = 'block';
}

function submitOnboardingPrompt() {
    const nameInput = document.getElementById('uo-onboarding-name');
    const roleSelect = document.getElementById('uo-onboarding-role');

    if (nameInput) setUserProfileDisplayName(nameInput.value);
    if (roleSelect) setUserProfileMinistryRole(roleSelect.value);

    // Diocese/parish/parish-other are already live-saved by their own
    // onchange handlers as the person interacts with them (same as every
    // other picker in this prompt and in the profile-defaults panel) --
    // nothing further to read/save here for those fields.

    completeOnboardingPrompt();
}

function skipOnboardingPrompt() {
    completeOnboardingPrompt();
}

function completeOnboardingPrompt() {
    const profile = getUserProfileDefaults();
    profile.onboardingComplete = true;
    persistUserProfileDefaults(profile);

    const host = document.getElementById('uo-onboarding-prompt');
    if (host) { host.style.display = 'none'; host.innerHTML = ''; }

    // In case the profile-defaults panel happens to be visible already
    // (e.g. reached via a direct URL with ?advanced=1), reflect whatever
    // was just saved there too, rather than leaving it stale until the next
    // unrelated sync.
    syncUserProfileControls(profile);
}

function setExplanationDepth(value) {
    const depth = parseInt(value, 10);
    selectedExplanationDepth = [0, 1, 2].includes(depth) ? depth : 1;
    try { saveSettings(); } catch (e) { /* persistence is best-effort */ }
    if (typeof renderOffice === 'function') renderOffice();
}

window.applyExplanationLayer      = applyExplanationLayer;
window.openTraditionExplanation   = openTraditionExplanation;
window.closeTraditionExplanation  = closeTraditionExplanation;
window.setExplanationDepth        = setExplanationDepth;
window.submitOnboardingPrompt     = submitOnboardingPrompt;
window.skipOnboardingPrompt       = skipOnboardingPrompt;

/**
 * Real provenance for an ecumenical/cross-tradition component, for the
 * envelope's overlays[] (contract §9). Never a guess: components/*.json
 * carries an explicit `tradition` field on most of these; where it is
 * missing (e.g. `ecu-angelus`, `ecu-trisagion` as of 2026-09-16), this
 * returns null and the shell discloses "provenance not yet recorded in the
 * corpus" rather than naming a tradition nobody attested. The one inference
 * this makes is the `cop-` id prefix meaning Coptic Orthodox — the same
 * prefix convention UNIVERSAL_OFFICE_CORE_CONTRACT.md §7's own creed/doxology
 * amendment already cites as evidence (`cop-creed`, `esy-nicene-creed`), not
 * a new assumption invented here.
 */
function overlaySourceLabel(comp) {
    if (!comp) return null;
    if (comp.tradition) return comp.tradition;
    if (typeof comp.id === 'string' && comp.id.indexOf('cop-') === 0) return 'Coptic Orthodox (Agpeya)';
    return null;
}

/**
 * renderBcpOffice()'s block-emission helpers — Phase 3, the actual refactor.
 *
 * Replaces the `officeHtml += \`<span class="rubric-text">...\`` string
 * concatenation (890 lines, 90 call sites, per the handoff doc and
 * AUDIT_GOVERNANCE_LEDGER.md's 2026-09-16 entry) with real DOM nodes built and
 * appended one block at a time, directly into the real `#office-display`
 * container -- not one giant string set via a single innerHTML assignment at
 * the end. Every call site kept its own business logic (rotation, season
 * lookup, rite fallback, toggle checks) completely untouched; only the
 * emission tail of each branch changes, mechanically, shape by shape.
 *
 * This ALSO replaces js/anglican-envelope.js's regex-scrape approach for the
 * Anglican lane: `blocks`/`overlays`/`diagnostics` are now built directly,
 * from the same real structural knowledge the renderer already has at the
 * moment of emission -- there is no second pass reading `<span
 * class="rubric-text">` back out of an HTML string, and so no way for the
 * envelope and the rendered page to drift, which was the entire cost the
 * "emit alongside" slice named and accepted as temporary.
 *
 * Six shapes cover the whole function (confirmed by reading it end to end
 * before writing any of this):
 *   1. plain block        -- label + component-text
 *   2. italic block        -- label + component-text wrapping <i>
 *   3. paragraph-break italic block -- label + component-text DIV,
 *      white-space:normal, applyParagraphBreaks()'d, always an overlay here
 *      (Theotokion is the only caller)
 *   4. reading block        -- label + passage-reference + reading-text +
 *      ornamental divider
 *   5. psalm block          -- label, then per-psalm passage-reference +
 *      psalm-block (+ optional Gloria Patri), no divider
 *   6. bare text            -- component-text only, no label, no rail entry
 *      (matches the original exactly: a block with no rubric-text never got
 *      one before either)
 * Overlay tracking (previously the separate `overlayEmissions` array fed to
 * js/anglican-envelope.js's `emit()`) is now just an argument to shapes 1-3:
 * passing `overlayInfo` routes the same visual output into `overlays[]`
 * instead of `blocks[]`, at the exact point of emission -- the same real
 * knowledge `overlayEmissions.push(...)` used to record, just consumed
 * directly instead of matched back up by label later.
 *
 * Diagnostics: previously inferred AFTER rendering, by scraping the finished
 * HTML for a known placeholder string ("Text not found", "No collect
 * appointed"). That inference is gone -- every call site that could produce
 * one of those two strings already knows it did, right there, so it calls
 * `pushDiagnostic()` directly instead. This is strictly more honest than the
 * scrape it replaces: it cannot mis-attribute a placeholder to the wrong
 * block, because there is no separate attribution step at all.
 */
function bcpMakeSpan(cls, html, opts) {
    var el = document.createElement((opts && opts.tag) || 'span');
    el.className = cls;
    if (opts && opts.style) el.setAttribute('style', opts.style);
    if (opts && opts.italic) {
        var i = document.createElement('i');
        i.innerHTML = html;
        el.appendChild(i);
    } else {
        el.innerHTML = html;
    }
    return el;
}

function bcpRoleFor(label) {
    return (window.AnglicanEnvelope && typeof window.AnglicanEnvelope.roleFor === 'function')
        ? window.AnglicanEnvelope.roleFor(label)
        : 'other';
}

/* The page-gutter grid, handoff doc §1 -- Phase 3 follow-on, built once the
   refactor above made real per-block DOM grouping possible. `gutterText`
   becomes the small mono label in the 70px column (see css/office-shell.css);
   an empty/undefined value renders an empty cell so left-edge alignment
   stays one consistent column regardless of which blocks carry a label.
   `bodyNodes` are appended into the grid's content cell, in order. */
function bcpWrapInGutter(container, gutterText, bodyNodes) {
    var block = document.createElement('div');
    block.className = 'uo-block';

    var gutter = document.createElement('div');
    gutter.className = 'uo-gutter-label';
    gutter.textContent = gutterText || '';
    block.appendChild(gutter);

    var body = document.createElement('div');
    body.className = 'uo-block-body';
    bodyNodes.forEach(function (n) { body.appendChild(n); });
    block.appendChild(body);

    container.appendChild(block);
}

/* Gutter label by displayed rail label, NOT by component id -- the same
   canticle can reach the page via two different code paths with the same
   label text (e.g. VARIABLE_CANTICLE1's Major Feast override and the
   generic DISPLAY_LABELS lookup both call a Benedictus setting "Benedictus
   Dominus Deus"; only the generic lookup's own 'bcp-benedictus' entry says
   "The Benedictus" -- both variants are listed below so either path is
   caught). Deliberately conservative, per Josh's direction 2026-09-20:
   scripture keeps its real citation (handled separately, see
   bcpEmitReading/bcpEmitPsalmBlock); RUBRIC and ANTIPHON are the only kind
   labels the handoff doc names explicitly, extended here to three more
   established liturgical-function words already used as rail labels
   (collect, canticle, invitatory). Everything else -- Confession of Sin,
   the Lord's Prayer, Kyrie, General Thanksgiving, Chrysostom, Mission
   Prayer, the Litany, Opening Sentence, overlays -- gets NO gutter label:
   the rail already says what it is, and a repeated word adds nothing. A
   label missing from this table is not a bug -- it just renders an empty
   gutter cell, the same safe default as everything deliberately left out. */
var BCP_GUTTER_KIND_BY_LABEL = {
    'Antiphon':                   'ANTIPHON',
    'The Collect':                'COLLECT',
    'A Collect':                  'COLLECT',
    'The Invitatory':             'INVITATORY',
    'Venite':                     'CANTICLE',
    'Jubilate':                   'CANTICLE',
    'Christ Our Passover':        'CANTICLE',
    'Benedictus Dominus Deus':    'CANTICLE',
    'The Benedictus':             'CANTICLE',
    'The Third Song of Isaiah':   'CANTICLE',
    'A Song of Penitence':        'CANTICLE',
    'The Song of Moses':          'CANTICLE',
    'The First Song of Isaiah':   'CANTICLE',
    'Benedictus es, Domine':      'CANTICLE',
    'A Song of Creation':         'CANTICLE',
    'The Second Song of Isaiah':  'CANTICLE',
    'Te Deum Laudamus':           'CANTICLE',
    'Nunc Dimittis':              'CANTICLE',
    'The Song of the Redeemed':   'CANTICLE',
    'A Song to the Lamb':         'CANTICLE',
    'Glory to God':               'CANTICLE',
    'The Magnificat':             'CANTICLE'
};

/* Shapes 1-3: label + one text node, optionally italic or paragraph-broken,
   optionally an overlay. `env` is the {blocks, overlays} pair being built for
   this render; `overlayInfo` is {source, anchor} or null/undefined. Overlays
   are deliberately never given a gutter kind here (see the table comment
   above) -- they already get a margin card marking them as borrowed; a
   gutter tag too would be redundant with that. */
function bcpEmitBlock(container, env, label, text, overlayInfo, shape) {
    var gutterText = overlayInfo ? '' : (BCP_GUTTER_KIND_BY_LABEL[label] || '');

    /* When the gutter already carries a kind word (COLLECT, CANTICLE,
       ANTIPHON, INVITATORY), the in-page heading duplicated it -- "The
       Collect" as a heading immediately above "COLLECT" in the gutter next
       to the same text, the same word twice in a row. Found live 2026-09-20
       (screenshot review) and fixed by dropping the heading specifically
       when the gutter already says the same thing; every other block still
       gets its heading exactly as before, since its gutter is either a real
       citation (different information, both stay) or empty (nothing to
       duplicate). */
    if (!gutterText) {
        var labelSpan = document.createElement('span');
        labelSpan.className = 'rubric-text';
        labelSpan.textContent = label;
        container.appendChild(labelSpan);
    }

    /* 'para-italic' (Theotokion) and 'para' (the Examen) look alike apart from
       italics -- confirmed against both actual call sites rather than
       assumed, since they differ. */
    var bodyOpts = shape === 'para-italic' ? { tag: 'div', style: 'white-space:normal', italic: true }
                 : shape === 'para'        ? { tag: 'div', style: 'white-space:normal' }
                 : shape === 'italic'      ? { italic: true }
                 : {};
    var body = (shape === 'para-italic' || shape === 'para')
        ? bcpMakeSpan('component-text', applyParagraphBreaks(text), bodyOpts)
        : bcpMakeSpan('component-text', text, bodyOpts);

    bcpWrapInGutter(container, gutterText, [body]);

    if (overlayInfo) {
        env.overlays.push({ label: label, source: overlayInfo.source || null, anchor: overlayInfo.anchor || null });
    } else {
        env.blocks.push({ label: label, role: bcpRoleFor(label), units: [] });
    }
}

/* Shape 4: scripture reading -- label, citation (now shown in the gutter,
   not inline -- see the .passage-reference display:none rule in
   css/office-shell.css), flowed text, divider. */
function bcpEmitReading(container, env, title, citation, bodyText) {
    var labelSpan = document.createElement('span');
    labelSpan.className = 'rubric-text';
    labelSpan.textContent = title;
    container.appendChild(labelSpan);

    var cite = document.createElement('h4');
    cite.className = 'passage-reference';
    cite.textContent = citation;

    var body = bcpMakeSpan('reading-text', formatScriptureAsFlow(bodyText), { tag: 'div' });
    bcpWrapInGutter(container, citation, [cite, body]);
    bcpEmitDivider(container);

    env.blocks.push({ label: title, role: bcpRoleFor(title), units: [{ kind: 'scripture', citation: citation }] });
}

/* Shape 5: the psalm block -- one label, then per-psalm citation + poetry
   (+ optional Gloria Patri), each psalm its own gutter row (the contract's
   own unit granularity, §8: "one psalm" is the smallest attributable
   piece), no divider (matches the original exactly). */
function bcpEmitPsalmBlock(container, env, label, psalmEntries) {
    /* FIXED 2026-09-28, found live-testing Coptic Agpeya's rail (Josh: "the
       sidebar isn't tracking scroll position" -- confirmed NOT a repeat of
       the 2026-09-25 tooltip-text matching bug; the scroll listener and the
       matching algorithm both work correctly). Root cause: every psalm in
       psalmEntries rendered under this ONE combined rail entry, so a
       multi-psalm reading (Coptic's Morning Office appoints 12: Psalm 51
       plus a set of 11 more) left a single waypoint spanning the entire
       group -- 15,194 of 29,642px on that office, over half the page, with
       the rail dot unable to move at all until the reader scrolled past the
       whole thing. Horologion's Typika already gives each psalm its own rail
       item (typika-psalm-102, typika-psalm-145 as separate placeholders);
       this only extends that same one-item-per-psalm convention here.
       Multi-psalm groups now push one blocks[] entry per psalm, each
       labelled with its own citation; a single-psalm call (the antiphonal
       psalm, the Midnight Office's first-nocturn psalm) is unchanged --
       nothing to split, same one combined entry as before. */
    if (psalmEntries.length <= 1) {
        var labelSpan = document.createElement('span');
        labelSpan.className = 'rubric-text';
        labelSpan.textContent = label;
        container.appendChild(labelSpan);
    }

    var units = [];
    psalmEntries.forEach(function (p) {
        var citationText = 'Psalm ' + p.displayNumber;
        var cite = document.createElement('h4');
        cite.className = 'passage-reference';
        cite.textContent = citationText;

        var bodyNodes = [cite, bcpMakeSpan('psalm-block', formatPsalmAsPoetry(p.fullText), { tag: 'div' })];
        /* Original always rendered this span when the toggle was checked,
           even with gt resolving to an empty string -- null (toggle
           unchecked) is the only case that skips it, not falsy. */
        if (p.gloriaText !== null && p.gloriaText !== undefined) {
            bodyNodes.push(bcpMakeSpan('component-text', p.gloriaText, { italic: true }));
        }
        bcpWrapInGutter(container, citationText, bodyNodes);
        units.push({ kind: 'scripture', citation: citationText });
    });

    if (psalmEntries.length > 1) {
        /* One rail entry per psalm, labelled with its own citation --
           matched by computeRailWaypoints() against the SAME .uo-gutter-label
           text each psalm's own bcpWrapInGutter() call above already wrote,
           visibly, at the correct scroll position. No new DOM element added;
           the citation was already there, the rail just never looked. */
        psalmEntries.forEach(function (p) {
            var citationText = 'Psalm ' + p.displayNumber;
            env.blocks.push({ label: citationText, role: bcpRoleFor(label), units: [{ kind: 'scripture', citation: citationText }] });
        });
    } else {
        env.blocks.push({ label: label, role: bcpRoleFor(label), units: units });
    }
}

/* Shape 6: bare text, no label -- never a rail entry, matching the original
   (a block with no rubric-text never produced one before either). Still
   wrapped in the gutter grid, empty, so its left edge lines up with every
   other block on the page rather than sitting flush against the margin. */
function bcpEmitBare(container, text, opts) {
    bcpWrapInGutter(container, '', [bcpMakeSpan('component-text', text, opts)]);
}

/* Shared rubric-text heading for a bare-content block that wants one AND a
   sidebar rail entry. ADDED 2026-09-29, per Josh's direct request that the
   Communion/Diocesan/Parish Cycle of Prayer tiers "appear under their own
   rubric heading" -- the labelSpan construction mirrors bcpEmitBlock's own
   exactly, so it renders identically to every other in-page rubric heading
   (e.g. "Let Us Bless the Lord"). EXTENDED 2026-09-29 (same day, continued):
   per Josh's follow-up ("should appear in the sidebar when they are in the
   prayer"), also pushes a rail entry (`env.blocks`) the same way
   bcpEmitBlock's own label does -- this function's three call sites
   (renderCommunionCycleOfPrayerLine/renderDiocesanCycleOfPrayerLine/
   renderParishCycleOfPrayerLine) are each already gated on real content
   actually being available before calling this at all, so a tier with
   nothing to show correctly adds no rail entry either, matching the "any,
   all, or none may render" contract those three functions already document. */
function bcpEmitRubricHeading(container, env, label) {
    var labelSpan = document.createElement('span');
    labelSpan.className = 'rubric-text';
    labelSpan.textContent = label;
    container.appendChild(labelSpan);
    env.blocks.push({ label: label, role: bcpRoleFor(label), units: [] });
}

/**
 * ADDED 2026-09-28 (diocese tier); ADDED 2026-09-29 (Communion tier, then
 * Parish tier + per-tier rubric headings, then sidebar rail entries for
 * each, all same day -- `env` is threaded through here and into each tier
 * function purely so bcpEmitRubricHeading can push a rail entry alongside
 * the heading it emits; see that function's own comment). Appends, after the
 * static "Here may be sung a hymn or anthem..." rubric, up to three
 * independent tiers for the OFFICE'S OWN date (`date` -- never `new
 * Date()`/today, so an office rendered for a past or future date shows that
 * date's own entries, not today's): the worldwide Anglican Cycle of Prayer
 * (unconditional -- the same for every user), the user's declared diocese's
 * own weekly cycle (gated on profile.cycleOfPrayerDiocese), and the user's
 * declared parish's own household cycle (gated on profile.cycleOfPrayerParish
 * matching a real ingested corpus -- see renderParishCycleOfPrayerLine).
 * Any, all, or none may render depending on what's declared/loaded -- each
 * is an independent cache-only read, never blocking on a network fetch; see
 * js/cycles-of-prayer.js's own comments on the prefetch-then-repaint pattern
 * that eventually populates each cache.
 */
function renderCycleOfPrayerLine(container, env, date) {
    renderCommunionCycleOfPrayerLine(container, env, date);
    renderDiocesanCycleOfPrayerLine(container, env, date);
    renderParishCycleOfPrayerLine(container, env, date);
    renderParishIntentionsLine(container, env, date);
}

/**
 * The Communion tier: the worldwide Anglican Cycle of Prayer's own entry for
 * `date`, independent of any profile field -- every user sees the same line
 * for the same office date. Renders nothing when that date's entry isn't
 * loaded/covered yet (see js/cycles-of-prayer.js's
 * getCachedCommunionCycleOfPrayerDay -- notably, "not covered" is the
 * correct, honest state for any date outside whatever partial-year range the
 * current file happens to cover, not a bug).
 */
function renderCommunionCycleOfPrayerLine(container, env, date) {
    if (typeof getCachedCommunionCycleOfPrayerDay !== 'function') return;

    const dayEntry = getCachedCommunionCycleOfPrayerDay(date);
    if (!dayEntry) return;

    const subjectNames = dayEntry.subjects.map(subject =>
        subject.type === 'diocese' ? `${subject.name} (${subject.province})` : subject.name
    );
    const subjectPhrase = subjectNames.length === 1
        ? subjectNames[0]
        : `${subjectNames.slice(0, -1).join(', ')} and ${subjectNames[subjectNames.length - 1]}`;

    bcpEmitRubricHeading(container, env, 'The Anglican Cycle of Prayer');
    bcpEmitBare(container, `Today, the Anglican Cycle of Prayer asks us to pray for ${subjectPhrase}.`, { italic: true });
}

/**
 * The Diocesan tier: the user's declared diocese's own weekly Cycle of
 * Prayer entry (gated on profile.cycleOfPrayerDiocese). Unchanged in
 * substance from before the 2026-09-29 Communion/Parish-tier split, now
 * under its own name and a rubric heading rather than living directly
 * inside renderCycleOfPrayerLine.
 */
function renderDiocesanCycleOfPrayerLine(container, env, date) {
    const profile = getUserProfileDefaults();
    if (!profile.cycleOfPrayerDiocese || typeof getCachedCycleOfPrayerWeek !== 'function') return;

    const weekEntry = getCachedCycleOfPrayerWeek(profile.cycleOfPrayerDiocese, date);
    if (!weekEntry) return;

    const subjectNames = weekEntry.subjects.map(subject =>
        subject.type === 'parish' ? `${subject.place}, ${subject.name}` : subject.name
    );
    const subjectPhrase = subjectNames.length === 1
        ? subjectNames[0]
        : `${subjectNames.slice(0, -1).join(', ')} and ${subjectNames[subjectNames.length - 1]}`;

    const isHomeParishWeek = Boolean(profile.cycleOfPrayerParish) &&
        weekEntry.subjects.some(subject => cycleOfPrayerParishSlug(subject) === profile.cycleOfPrayerParish);

    const line = `This week, the Diocesan Cycle of Prayer asks us to pray for ${subjectPhrase}.` +
        (isHomeParishWeek ? ' This is your own parish’s week.' : '');

    bcpEmitRubricHeading(container, env, 'The Diocesan Cycle of Prayer');
    bcpEmitBare(container, line, { italic: true });
}

/**
 * ADDED 2026-09-29, per Josh's direct report that "the parish cycle of
 * prayer is missing" after St. Bede's own household-cycle file was ingested
 * but never wired into any loader (see
 * data/cycles-of-prayer/episcopal-western-oregon-st-bede.json's own header
 * comment). The Parish tier: a congregation's own household-by-household
 * prayer cycle (scope 'parish', subject type 'household'). Gated on a real
 * corpus-matched parish (profile.cycleOfPrayerParish, the slug set by
 * picking a parish from the diocese's own list) -- never on
 * cycleOfPrayerParishOther's free-text fallback, since there is no household
 * file to key off a typed name that doesn't match any ingested corpus.
 * Renders nothing when this app hasn't ingested that parish's own household
 * cycle yet -- same honest "no data yet" convention as the other two tiers,
 * not an error. "Today" (not "this week"), matching the corpus's own
 * day-of-month granularity (see resolveMonthlyRecurringEntry in
 * js/cycles-of-prayer.js).
 */
function renderParishCycleOfPrayerLine(container, env, date) {
    const profile = getUserProfileDefaults();
    if (!profile.cycleOfPrayerDiocese || !profile.cycleOfPrayerParish) return;
    if (typeof getCachedCycleOfPrayerParishMonth !== 'function') return;

    const monthEntry = getCachedCycleOfPrayerParishMonth(profile.cycleOfPrayerDiocese, profile.cycleOfPrayerParish, date);
    if (!monthEntry) return;

    const subjectNames = monthEntry.subjects.map(subject => subject.name);
    const subjectPhrase = subjectNames.length === 1
        ? subjectNames[0]
        : `${subjectNames.slice(0, -1).join(', ')} and ${subjectNames[subjectNames.length - 1]}`;

    bcpEmitRubricHeading(container, env, 'The Parish Cycle of Prayer');
    bcpEmitBare(container, `Today, your Parish Cycle of Prayer asks us to pray for ${subjectPhrase}.`, { italic: true });
}

/**
 * ADDED 2026-09-30. Plain-text sibling of bcpEmitBare: builds its node with createElement +
 * textContent and places it with bcpWrapInGutter. bcpEmitBare/bcpMakeSpan set innerHTML, which is
 * right for the app's own trusted corpus text and WRONG for anything a person typed -- prayer requests
 * come from a rector, so they must never pass through bcpMakeSpan. Nothing here can interpret markup.
 */
function bcpEmitPlainText(container, text, opts) {
    var span = document.createElement('span');
    span.className = (opts && opts.cls) || 'parish-intentions-item';
    if (opts && opts.italic) {
        var i = document.createElement('i');
        i.textContent = text;
        span.appendChild(i);
    } else {
        span.textContent = text;
    }
    bcpWrapInGutter(container, '', [span]);
}

/**
 * ADDED 2026-09-30 (Parish Intercessions, spec 11.2). The fourth tier under the Cycle of Prayer
 * lines: the followed parish's current, unexpired prayer requests, grouped by kind. Gated on
 * profile.parishIntentionsSlug; renders nothing (no heading, no rail entry) when nothing is cached
 * or every cached item has expired -- the same "no data yet" convention as the tiers above. Reads
 * the cache only (getCachedParishIntentions is synchronous); when that cache is old it kicks off a
 * background refresh that repaints on arrival. Expiry is judged against the REAL current time, not the
 * office's own `date`: unlike the dated Cycle of Prayer lines these are a "now" list, so an office
 * rendered for last Tuesday still shows what the parish is praying for today.
 */
function renderParishIntentionsLine(container, env, date) {
    const profile = getUserProfileDefaults();
    const slug = profile.parishIntentionsSlug;
    if (!slug || typeof getCachedParishIntentions !== 'function') return;

    const age = Date.now() - getParishIntentionsFetchedAt(slug);
    if (age > PARISH_INTENTIONS_STALE_MS && (Date.now() - parishIntentionsLastAttemptAt) > PARISH_INTENTIONS_RETRY_MS) {
        refreshParishIntentionsForProfile();
    }

    const items = getCachedParishIntentions(slug);
    if (!items || items.length === 0) return;

    bcpEmitRubricHeading(container, env, 'Parish Intercessions');
    const groups = [
        ['individual', 'Individuals'],
        ['family', 'Families'],
        ['situation', 'Situations'],
        ['institution', 'Institutions']
    ];
    for (const [category, label] of groups) {
        const inGroup = items.filter(item => item.category === category);
        if (inGroup.length === 0) continue;
        bcpEmitPlainText(container, label, { italic: true, cls: 'parish-intentions-category' });
        for (const item of inGroup) bcpEmitPlainText(container, item.text);
    }
}

function bcpEmitDivider(container) {
    var div = document.createElement('div');
    div.className = 'ornamental-divider';
    div.innerHTML = '<div class="div-line-left"></div><span class="ornamental-divider-glyph">\u2726 \u271d \u2726</span><div class="div-line-right"></div>';
    container.appendChild(div);
}

/* Contract §11: the same three real codes DIAGNOSTIC_WORDING in
   js/anglican-envelope.js already names, called directly at the moment a
   call site would otherwise have rendered a placeholder -- never inferred
   afterward. */
var BCP_DIAGNOSTIC_WORDING = {
    'not-yet-mapped': 'No proper is appointed for this day in the corpus. Nothing has been substituted.',
    'source-blocked': 'This exists in scope but cannot yet be shown.',
    'coverage-gap':   'A known gap, stated rather than hidden.'
};
function bcpPushDiagnostic(env, code, blockLabel) {
    env.diagnostics.push({ code: code, message: BCP_DIAGNOSTIC_WORDING[code], block: blockLabel });
}

/**
 * Coptic Agpeya port -- Phase 5, lane 1 of 3 (documentation/UI_REDESIGN_HANDOFF.md §9).
 *
 * renderCopticAgpeya() is far smaller than renderBcpOffice() was (one ~190-line
 * loop over 8 sequence-item shapes, not 970 lines / ~90 sites), so most of it
 * reuses the SAME emission helpers the Anglican refactor built just above --
 * bcpEmitBlock/bcpEmitPsalmBlock/bcpWrapInGutter/bcpRoleFor/bcpPushDiagnostic
 * take a container+env and a label/text; nothing in them is Anglican-specific,
 * and BCP_GUTTER_KIND_BY_LABEL simply returns '' for any label it doesn't
 * recognise (an empty gutter cell), which is the correct default here since no
 * Coptic-specific gutter-kind words have been agreed with Josh yet -- the same
 * conservative default the handoff doc itself calls for rather than inventing
 * new gutter vocabulary unasked.
 *
 * ONE genuine shape mismatch, confirmed by reading the pre-port function end to
 * end rather than assumed: bcpEmitReading() unconditionally calls
 * bcpEmitDivider() afterward. renderCopticAgpeya has never emitted an
 * ornamental divider anywhere -- confirmed by grepping the pre-port function
 * for 'ornamental-divider': zero hits. Reusing bcpEmitReading as-is would have
 * visibly added dividers this lane never had. Rather than add an options flag
 * to the Anglican lane's own helper and risk a regression there for a Coptic
 * need, this is its own small function below, mirroring bcpEmitReading's first
 * three nodes exactly and stopping before the divider.
 */
function copEmitReading(container, env, title, citation, bodyText) {
    if (title) {
        var labelSpan = document.createElement('span');
        labelSpan.className = 'rubric-text';
        labelSpan.textContent = title;
        container.appendChild(labelSpan);
    }
    var cite = document.createElement('h4');
    cite.className = 'passage-reference';
    cite.textContent = citation;
    var body = bcpMakeSpan('reading-text', formatScriptureAsFlow(bodyText), { tag: 'div' });
    bcpWrapInGutter(container, citation, [cite, body]);
    /* No title -- e.g. the Theotokia's own lessonCitation, which O'Leary's
       structure gives no separate heading for -- means no rail entry either,
       the same "no label, no block" rule bcpEmitBare's own comment states.
       The citation still reaches the page (the gutter cell above), just not
       the rail/envelope. */
    if (title) {
        env.blocks.push({ label: title, role: bcpRoleFor(title), units: [{ kind: 'scripture', citation: citation }] });
    }
}

/**
 * East Syriac Hudra port -- Phase 5, lane 2 of 3 (documentation/UI_REDESIGN_HANDOFF.md §9).
 * Shape mismatches against bcpEmitReading/bcpEmitPsalmBlock, found by reading renderEastSyriac()
 * end to end before converting anything (recorded 2026-09-24 in RESUME_PROJECT_NOTE.md and
 * AUDIT_GOVERNANCE_LEDGER.md, ui:phase5-east-syriac-lane-envelope):
 *
 * This lane renders EVERY scripture citation -- psalms, and even its one non-psalm citation
 * (comp.scriptureRef, an Exodus canticle) -- as poetry (formatPsalmAsPoetry, class psalm-block),
 * never as flowing prose. Neither bcpEmitReading nor copEmitReading fit (both are prose-shaped),
 * so this is its own tiny emitter. It also never emits a leading label of its own -- confirmed
 * 2026-09-24 that this lane's own component titles (e.g. "First Marmitha", "Second Shuraya",
 * "Letter Psalm") already ARE the real citation-bearing label, shown once via the surrounding
 * bcpEmitBlock call; a second "The Psalms"-style label immediately above the same content would
 * just repeat it. Per Josh's 2026-09-24 ruling ("consistency unless a tradition requires
 * otherwise"): every citation still gets its own gutter row and its own unit in the envelope --
 * nothing is hidden -- it just folds into the ONE block its parent component's title already
 * opened, rather than opening a second, redundant rail row. This matches bcpEmitPsalmBlock's own
 * stated contract (§8: "one psalm is the smallest attributable piece") at the UNIT level, not the
 * BLOCK level -- the same granularity, applied consistently, not a new rule invented for this lane.
 * No divider (this lane has never had one anywhere, confirmed by inspection, same finding as
 * Coptic's own copEmitReading).
 */
function esyEmitCitation(container, citationLabel, fullText) {
    var cite = document.createElement('h4');
    cite.className = 'passage-reference';
    cite.textContent = citationLabel;
    var body = bcpMakeSpan('psalm-block', formatPsalmAsPoetry(fullText), { tag: 'div' });
    bcpWrapInGutter(container, citationLabel, [cite, body]);
    return { kind: 'scripture', citation: citationLabel };
}

/* Which of a day's readings fall at Morning and at Evening Prayer.
 *
 * Three kinds of day, told apart by the shape of the data:
 *  - ORDINARY days: one OT, one Epistle, one Gospel for the CURRENT liturgical year only (Year One
 *    stores them as reading_*_mp_year1 / reading_gospel_ep_year1, Year Two as reading_ot_mp_year2 /
 *    reading_epistle_ep_year2 / reading_gospel_mp_year2). Morning gets the OT plus either the
 *    Epistle or the Gospel, Evening gets the other, per the Gospel-placement setting
 *    ("evening": MP = OT + Epistle, EP = Gospel; "morning": MP = OT + Gospel, EP = Epistle;
 *    "both": the Gospel at both offices).
 *  - HOLY DAYS (a separate Evening OT, reading_ot_ep_year*): MP = OT + Epistle, EP = OT + Gospel,
 *    exactly as the BCP Holy Days table has it, whatever the placement setting. Their two year
 *    columns carry identical text, so either year's field is fine.
 *  - Days with explicit morning/evening fields (Easter Day, Good Friday, Holy Saturday, Palm
 *    Sunday, Christmas Eve -- flagged explicit_office_readings): those fields are used as written,
 *    at the office they name, whatever the placement setting.
 */
function resolveDailyOfficeReadings(d, litYear, gospelPlacement, useAltMp, useAltEp) {
    const y = litYear === 'year2' ? 'year2' : 'year1';
    const other = y === 'year1' ? 'year2' : 'year1';
    const first = (...keys) => { for (const k of keys) { if (d[k]) return d[k]; } return ''; };
    const r = { morningOT: '', morningEpistle: '', morningGospel: '', eveningOT: '', eveningEpistle: '', eveningGospel: '' };

    const generic = !!(d.explicit_office_readings || d.reading_gospel_mp || d.reading_gospel_ep || d.reading_epistle_mp || d.reading_epistle_ep || d.reading_ot_ep);
    const holy = !generic && !!(d.reading_ot_ep_year1 || d.reading_ot_ep_year2);

    const otMp = (useAltMp && d[`reading_ot_mp_alt_${y}`]) || first(`reading_ot_mp_${y}`, 'reading_ot_mp', 'reading_ot');
    const otEp = (useAltEp && first(`reading_ot_ep_alt_${y}`, `reading_ot_ep_alt_${other}`))
              || first(`reading_ot_ep_${y}`, `reading_ot_ep_${other}`, 'reading_ot_ep');

    if (generic) {
        r.morningOT = otMp;
        r.morningEpistle = first(`reading_epistle_mp_${y}`, 'reading_epistle_mp', 'reading_epistle');
        r.morningGospel = first(`reading_gospel_mp_${y}`, 'reading_gospel_mp');
        r.eveningOT = otEp;
        r.eveningEpistle = first(`reading_epistle_ep_${y}`, 'reading_epistle_ep');
        r.eveningGospel = (useAltEp && first(`reading_gospel_ep_alt_${y}`, `reading_gospel_ep_alt_${other}`))
                       || first(`reading_gospel_ep_${y}`, 'reading_gospel_ep');
        return r;
    }

    if (holy) {
        r.morningOT = otMp;
        r.morningEpistle = first(`reading_epistle_mp_${y}`, `reading_epistle_ep_${y}`, `reading_epistle_mp_${other}`, `reading_epistle_ep_${other}`);
        r.eveningOT = otEp;
        r.eveningGospel = (useAltEp && first(`reading_gospel_ep_alt_${y}`, `reading_gospel_ep_alt_${other}`))
                       || first(`reading_gospel_ep_${y}`, `reading_gospel_mp_${y}`, `reading_gospel_ep_${other}`, `reading_gospel_mp_${other}`);
        return r;
    }

    // ordinary day: this year's Epistle and Gospel, wherever the data happens to store them
    const epistle = first(`reading_epistle_mp_${y}`, `reading_epistle_ep_${y}`);
    const gospel  = first(`reading_gospel_ep_${y}`, `reading_gospel_mp_${y}`);
    r.morningOT = otMp;
    r.eveningOT = otEp;
    if (gospelPlacement === 'morning') {
        r.morningGospel = gospel;
        r.eveningEpistle = epistle;
    } else if (gospelPlacement === 'both') {
        r.morningEpistle = epistle;
        r.morningGospel = gospel;
        r.eveningGospel = gospel;
    } else {
        r.morningEpistle = epistle;
        r.eveningGospel = gospel;
    }
    return r;
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

    const dailyData = await withDailyOfficeTimeout(
        CalendarEngine.fetchLectionaryData(currentDate),
        'Daily Office lectionary lookup',
        DAILY_OFFICE_RESOURCE_TIMEOUT_MS,
        null
    );
    const activeRubric = appData.rubrics.find(r => r.id === resolvedOfficeId);

    // 2026-09-23: resolved here, before updateSeasonalTheme(), so a Lesser Feast's own
    // sourced color (see below) can take precedence the same way a Sunday/Holy Day's already
    // does. This is the SAME resolveCommemorations('ANG', ...) call the saint-display panel
    // further down already makes -- calling it once here and reusing the result, rather than
    // fetching it twice, since it's now needed earlier for color as well as for its existing
    // display purpose later in this function.
    const angCommsForColor = await resolveCommemorations(currentDate, 'ANG', { includeEcumenical: true });
    const commemorationColor = angCommsForColor.find(s => s.liturgicalColor)?.liturgicalColor || null;

    // 2026-09-23: getSeasonAndFile()'s liturgicalColor is a flat per-SEASON default (one
    // color for all of Advent, all of Epiphany, etc.) -- correct for ordinary weekdays but
    // wrong for the ~30% of Sundays/Holy Days that carry their own proper color (a red
    // apostle inside green Ordinary Time, Palm Sunday red not purple, Trinity Sunday white
    // not green, etc.). dailyData is the specific matched entry for this exact day; when it
    // carries its own liturgicalColor (sourced -- see each entry's liturgicalColorSource),
    // that takes precedence over the season's flat default. A Lesser Feast's own sourced
    // color (commemorationColor -- only ~99 of 1072 sanctoral entries carry one so far, see
    // AUDIT_GOVERNANCE_LEDGER.md) takes precedence over BOTH, since a named commemoration is
    // more specific than either the season or an unremarkable ferial day. Ordinary weekdays
    // with neither have no override and correctly fall through to the season default.
    // 2026-09-23: the only two days documented anywhere as "White (or Gold)" --
    // EASTER_DOCUMENTATION.md, Easter Day and Ascension Day specifically, nothing broader.
    // Computed once here and reused by both the theme accent and the seasonal dot below, so
    // the two can never disagree with each other.
    const isPrincipalGoldFeast = dailyData?.title === 'Easter Day' || dailyData?.title === 'Ascension Day';
    updateSeasonalTheme(commemorationColor || dailyData?.liturgicalColor || liturgicalColor || 'green', isPrincipalGoldFeast);

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
            `<p class="component-text">${_sharedOfficeNavigatorEscape(dailyData.title)}</p>` +
            `<p class="component-text" style="font-size:0.85em; opacity:0.7;">` +
            `No lectionary entry exists in the data files for this date. ` +
            `The season file may need to be extended.</p></div>`;
        return;
    }


    // Evening Prayer on the eve of a feast: the BCP gives the Eve its own psalms and lessons
    // (Christmas Eve, Eve of the Epiphany, of Ascension, of Pentecost, of Trinity Sunday, of seven
    // Holy Days...). They live on the FEAST's entry as `eve`, so look at tomorrow's entry.
    let eveData = null;
    if (isEvening) {
        try {
            const tomorrow = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
            const nextDay = await CalendarEngine.fetchLectionaryData(tomorrow);
            if (nextDay && !nextDay._isFallback && nextDay.eve) eveData = nextDay.eve;
        } catch (e) { /* the Eve is an addition to the office; never let it break the office */ }
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

    if (eveData && !use30Day && !isNoonday && !isCompline) psalms = eveData.psalms_ep || psalms;

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

    // Josh's settled decision (2026-07-09): same alt-EP toggle as the psalm
    // selection above -- Saint Mary the Virgin and Saint Michael and All Angels
    // both have a real BCP "or" alternative for the Evening Prayer OT and
    // Gospel readings; check it once here and prefer the alt fields when set.
    const altEpToggleId = dailyData?.alt_ep_toggle_id;
    const useAltEp = altEpToggleId && (document.getElementById(`toggle-${altEpToggleId}-alt`)?.checked ?? false);


    // 2026-10-05: READINGS ARE NEVER MIXED ACROSS YEARS. The season data stores Year One and Year
    // Two readings under different field names (Year One: Epistle at MP, Gospel at EP; Year Two:
    // Epistle at EP, Gospel at MP -- the BCP's own suggested layout). The chains this replaces fell
    // back to the OTHER year's field whenever the current year's was empty, so on an ordinary
    // Year Two day Morning Prayer showed Year Two's Old Testament beside Year One's Epistle, and
    // Evening Prayer Year Two's Epistle beside Year One's Gospel (found by checking every day of
    // 2025-2031 against the 1979 BCP tables). The fix: gather the day's three readings from the
    // CURRENT year's fields only, then place them by the Gospel-placement setting.
    const _dayReadings = resolveDailyOfficeReadings(dailyData, litYear, gospelPlacement, !!useAltMp, !!useAltEp);
    let morningOT      = _dayReadings.morningOT;
    let morningEpistle = _dayReadings.morningEpistle;
    let morningGospel  = _dayReadings.morningGospel;
    let eveningOT      = _dayReadings.eveningOT;
    let eveningEpistle = _dayReadings.eveningEpistle;
    let eveningGospel  = _dayReadings.eveningGospel;
    if (eveData && isEvening) {
        eveningOT      = eveData.reading_ot || '';
        eveningEpistle = eveData.reading_epistle || '';
        eveningGospel  = eveData.reading_gospel || '';
    }

    if (!isMorning) { morningOT = ''; morningEpistle = ''; morningGospel = ''; }
    if (!isEvening && !isCompline && !isNoonday) { eveningOT = ''; eveningEpistle = ''; eveningGospel = ''; }

    // ── Begin DOM assembly (Phase 3 refactor: real nodes, not one string) ────
    const officeTitle    = activeRubric?.officeName || 'Office';
    const officeSubtitle = (eveData && eveData.title && eveData.title !== dailyData.title) ? `${dailyData.title} \u00b7 ${eveData.title}` : (dailyData.title || 'Day Title');

    const container = document.createElement('div');
    container.className = 'office-container';

    const bookTitle = document.createElement('p');
    bookTitle.className = 'office-book-title';
    bookTitle.textContent = 'The Daily Office';
    container.appendChild(bookTitle);

    const h2 = document.createElement('h2');
    h2.textContent = officeTitle;
    container.appendChild(h2);

    const subtitle = document.createElement('p');
    subtitle.className = 'liturgical-title';
    subtitle.textContent = officeSubtitle;
    // 2026-09-23: the seasonal dot, UI_REDESIGN_HANDOFF.md §6 -- "a single dot beside the
    // day in the ordo line, never a wash over the page." Reuses the exact color already
    // resolved above for updateSeasonalTheme() (commemorationColor || dailyData's own ||
    // the season default), so the dot and the accent theme are always the same color by
    // construction, never computed twice. Only the five colors §6 actually names get a dot
    // -- 'none' and anything else render nothing, which is honest silence (§11 rule 3), not
    // a gap to fill with an invented color.
    const seasonalDotColor = {
        green:  '#4a7c59',
        red:    '#9b2335',
        purple: '#6b3070',
        rose:   '#a04060',
        white:  isPrincipalGoldFeast ? '#d4af37' : '#f5f1e4',
    }[commemorationColor || dailyData?.liturgicalColor || liturgicalColor];
    if (seasonalDotColor) {
        const dot = document.createElement('span');
        dot.className = 'seasonal-dot';
        dot.setAttribute('aria-hidden', 'true');
        dot.style.cssText = `display:inline-block; width:0.5em; height:0.5em; border-radius:50%; background:${seasonalDotColor}; margin-left:0.5em; vertical-align:middle;`;
        subtitle.appendChild(dot);
    }
    container.appendChild(subtitle);

    // env replaces the old overlayEmissions array plus the scrape-based
    // js/anglican-envelope.js pass: blocks/overlays/diagnostics are built
    // directly, here, at the moment each is actually emitted.
    const env = { blocks: [], overlays: [], diagnostics: [] };

    // Pre-sequence ecumenical devotions (BCP offices only)
    if (document.getElementById('toggle-agpeya-opening')?.checked) {
        const agpeyaComp = appData.components.find(c => c.id === 'cop-agpeya-opening');
        if (agpeyaComp) {
            bcpEmitBlock(container, env, 'Agpeya Opening', agpeyaComp.text,
                { source: overlaySourceLabel(agpeyaComp), anchor: 'before the office' });
        }
    }
    if (document.getElementById('toggle-east-syriac-hours')?.checked) {
        const esComp = appData.components.find(c => c.id === 'ecu-east-syriac-hours');
        if (esComp) {
            bcpEmitBlock(container, env, 'Prayer of the Hours', esComp.text,
                { source: overlaySourceLabel(esComp), anchor: 'before the office' });
        }
    }

    // Pre-sequence Marian (before position — BCP offices only)
    if (marianElement !== 'none' && marianPos === 'before') {
        if ((marianElement === 'antiphon' || marianElement === 'both') && marianComp) {
            const t = resolveText(marianComp, rite);
            if (!t) bcpPushDiagnostic(env, 'not-yet-mapped', 'Marian Antiphon');
            bcpEmitBlock(container, env, 'Marian Antiphon', t || 'Text not found', null, 'italic');
        }
        if ((marianElement === 'theotokion' || marianElement === 'both') && theotokionComp) {
            const raw = resolveText(theotokionComp, rite) || theotokionComp.text || '';
            bcpEmitBlock(container, env, 'Theotokion', raw,
                { source: overlaySourceLabel(theotokionComp), anchor: 'before the office' }, 'para-italic');
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
            const t = comp ? resolveText(comp, rite) : null;
            if (!t) bcpPushDiagnostic(env, 'not-yet-mapped', 'Opening Sentence');
            bcpEmitBlock(container, env, 'Opening Sentence', t || 'Text not found');
            continue;
        }

        // VARIABLE_ANTIPHON — appointed antiphon from lectionary data
        if (item === 'VARIABLE_ANTIPHON') {
            const antText = isMorning
                ? (dailyData?.antiphon_mp || dailyData?.antiphon || '')
                : (dailyData?.antiphon_ep || dailyData?.antiphon || '');
            if (antText) bcpEmitBlock(container, env, 'Antiphon', antText, null, 'italic');
            continue;
        }

        // VARIABLE_PSALM — appointed psalms with optional Gloria Patri
        if (item === 'VARIABLE_PSALM') {
            if (psalms) {
                const psalmRefs = psalms.split(',').map(p => p.trim());
                const psalmEntries = [];
                for (const psalm of psalmRefs) {
                    const psalmId  = 'PSALM ' + psalm.replace(/^psalm\s+/i, '').trim().toUpperCase();
                    const fullText = await getScriptureText(psalmId);
                    let gloriaText = null;
                    if (document.getElementById('toggle-gloria-patri')?.checked) {
                        const gloria = appData.components.find(c => c.id === 'comm-gloria-patri');
                        gloriaText = gloria ? (resolveText(gloria, rite) || '') : '';
                    }
                    psalmEntries.push({ displayNumber: psalmId.replace(/^PSALM\s+/i, ''), fullText, gloriaText });
                }
                bcpEmitPsalmBlock(container, env, psalmRefs.length > 1 ? 'The Psalms' : 'The Psalm', psalmEntries);
            }
            continue;
        }

        // VARIABLE_READING_OT / _EPISTLE / _GOSPEL — scripture lessons
        if (item === 'VARIABLE_READING_OT' || item === 'VARIABLE_READING_EPISTLE' || item === 'VARIABLE_READING_GOSPEL') {
            if (item === 'VARIABLE_READING_OT' && document.getElementById('toggle-prayer-before-reading')?.checked) {
                const pbr = appData.components.find(c => c.id === 'ecu-prayer-before-reading');
                if (pbr) {
                    bcpEmitBlock(container, env, 'Prayer Before Reading', pbr.text,
                        { source: overlaySourceLabel(pbr), anchor: 'before the Old Testament Lesson' });
                }
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
                const text = await getScriptureText(reading);
                bcpEmitReading(container, env, title, reading, text);
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
                    const t = resolveText(comp, rite);
                    if (!t) bcpPushDiagnostic(env, 'not-yet-mapped', canticleLabel);
                    bcpEmitBlock(container, env, canticleLabel, t || 'Text not found');
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
                    const t = resolveText(comp, rite);
                    if (!t) bcpPushDiagnostic(env, 'not-yet-mapped', canticleLabel);
                    bcpEmitBlock(container, env, canticleLabel, t || 'Text not found');
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
                bcpEmitBare(container, t);
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
            const useDayCollect = document.getElementById('toggle-noonday-day-collect')?.checked ?? false;
            let cId;
            if (useDayCollect) {
                let rawId = dailyData.collect || 'collect-default-ferial';
                cId = rawId.startsWith('bcp-') ? rawId : 'bcp-' + rawId;
            } else {
                const noondayCollectIds = ['bcp-collect-noonday-1', 'bcp-collect-noonday-2', 'bcp-collect-noonday-3', 'bcp-collect-noonday-4'];
                const idx = getDailyRotationIndex(currentDate, noondayCollectIds.length);
                cId = noondayCollectIds[idx];
            }
            const comp = appData.components.find(c => c.id === cId);
            const t = comp ? resolveText(comp, rite) : null;
            if (!t) bcpPushDiagnostic(env, 'not-yet-mapped', 'The Collect');
            bcpEmitBlock(container, env, 'The Collect', t || 'No collect appointed');
            bcpEmitDivider(container);
            continue;
        }

        // VARIABLE_COMPLINE_COLLECT — Compline's own proper collects (BCP p.132-133),
        // never the calendar day's Collect. Saturdays get their own collect; other
        // days rotate among the 4 general options (or stay on Option 1 if the
        // rotation toggle is off, matching the Mission Prayer convention).
        if (item === 'VARIABLE_COMPLINE_COLLECT') {
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
            const t = comp ? resolveText(comp, rite) : null;
            if (!t) bcpPushDiagnostic(env, 'not-yet-mapped', 'The Collect');
            bcpEmitBlock(container, env, 'The Collect', t || 'No collect appointed');

            if (document.getElementById('toggle-compline-additional-prayer')?.checked) {
                const addlIds = ['bcp-collect-compline-addl-1', 'bcp-collect-compline-addl-2'];
                const addlIdx = getDailyRotationIndex(currentDate, addlIds.length);
                const addlComp = appData.components.find(c => c.id === addlIds[addlIdx]);
                if (addlComp) {
                    const addlText = resolveText(addlComp, rite) || addlComp.text || '';
                    bcpEmitBare(container, addlText);
                }
            }
            bcpEmitDivider(container);

            if (document.getElementById('toggle-examen')?.checked) {
                const ex = appData.components.find(c => c.id === 'ecu-examen');
                if (ex) {
                    bcpEmitBlock(container, env, 'The Examen', ex.text,
                        { source: overlaySourceLabel(ex), anchor: 'after the Compline collect' }, 'para');
                }
            }
            continue;
        }

        // VARIABLE_COLLECT — principal daily collect with manual ID mappings
        if (item === 'VARIABLE_COLLECT') {
            let rawId = dailyData.collect || 'collect-default-ferial';
            let cId   = rawId.startsWith('bcp-') ? rawId : 'bcp-' + rawId;

            const comp = appData.components.find(c => c.id === cId);
            const t    = comp ? resolveText(comp, rite) : null;
            if (!t) bcpPushDiagnostic(env, 'not-yet-mapped', 'The Collect');
            bcpEmitBlock(container, env, 'The Collect', t || 'No collect appointed');
            bcpEmitDivider(container);

            if (!isNoonday && document.getElementById('toggle-kyrie-pantocrator')?.checked) {
                const kp = appData.components.find(c => c.id === 'ecu-kyrie-pantocrator');
                if (kp) {
                    bcpEmitBlock(container, env, 'Kyrie Pantocrator', kp.text,
                        { source: overlaySourceLabel(kp), anchor: 'after the Collect' });
                }
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
                bcpEmitBlock(container, env, 'A Collect', t);
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
                bcpEmitBlock(container, env, 'A Prayer for Mission', t);
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
                    bcpEmitBlock(container, env, 'The Angelus', t,
                        { source: overlaySourceLabel(angelusComp), anchor: 'within the Invitatory' });
                }
            }
            const invitId = isMorning ? 'bcp-invitatory-full-mp' : 'bcp-invitatory-full-ep-noon-compline';
            const invComp = appData.components.find(c => c.id === invitId);
            const invTextResolved = invComp ? resolveText(invComp, rite) : null;
            if (!invTextResolved) bcpPushDiagnostic(env, 'not-yet-mapped', 'The Invitatory');
            bcpEmitBlock(container, env, 'The Invitatory', invTextResolved || 'Text not found');

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
                        bcpEmitBlock(container, env, 'Christ Our Passover', pt);
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
                            bcpEmitBlock(container, env, label, t);
                        }
                    }
                }
            }
            continue;
        }

        // comm-lords-prayer — rite-aware
        if (item === 'comm-lords-prayer') {
            const comp = appData.components.find(c => c.id === 'comm-lords-prayer');
            const t = comp ? resolveText(comp, rite) : null;
            if (!t) bcpPushDiagnostic(env, 'not-yet-mapped', "The Lord's Prayer");
            bcpEmitBlock(container, env, "The Lord's Prayer", t || "Lord's Prayer not found");
            continue;
        }

        // comm-kyrie — rite-aware
        if (item === 'comm-kyrie') {
            const comp = appData.components.find(c => c.id === 'comm-kyrie');
            const t = comp ? resolveText(comp, rite) : null;
            if (!t) bcpPushDiagnostic(env, 'not-yet-mapped', 'Kyrie');
            bcpEmitBlock(container, env, 'Kyrie', t || 'Kyrie not found');
            continue;
        }

        // bcp-litany — gated behind Great Litany toggle
        if (item === 'bcp-litany') {
            if (greatLitanyChecked) {
                const comp = appData.components.find(c => c.id === 'bcp-litany');
                if (comp) {
                    const t = resolveText(comp, rite) || comp.text || '';
                    bcpEmitBlock(container, env, comp.title || 'The Great Litany', t);
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
                    bcpEmitBlock(container, env, comp.title || 'General Thanksgiving', t);
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
                    bcpEmitBlock(container, env, comp.title || 'Prayer of St. Chrysostom', t);
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
                bcpEmitBlock(container, env, 'Antiphon', t);
            }
            continue;
        }

        // bcp-hymn-anthem-intercessions-rubric — Josh (2026-09-28): a space for
        // authorized intercessions in Morning/Evening Prayer, after A Prayer for
        // Mission, matching BCP 1979 pp.57-58 (Rite I) / pp.100-101 (Rite II) --
        // the same rubric data/explanations/anglican.json's own "A Prayer for
        // Mission" gloss already described but that was never actually rendered.
        // The space only, per Josh's own scope -- no actual intercession texts,
        // which he'll supply in a future session. bcpEmitBare (not bcpEmitBlock):
        // a two-line procedural rubric, not a titled prayer, so no rail entry --
        // same "no rail entry for bare content" convention as VARIABLE_CLOSING_BLESSING
        // just above.
        if (item === 'bcp-hymn-anthem-intercessions-rubric') {
            const comp = appData.components.find(c => c.id === 'bcp-hymn-anthem-intercessions-rubric');
            if (comp) {
                const t = resolveText(comp, rite) || comp.text || '';
                bcpEmitBare(container, t, { italic: true });
                renderCycleOfPrayerLine(container, env, currentDate);
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
            bcpEmitBlock(container, env, label, t);
        } else if (compId && !compId.startsWith('VARIABLE_') && compId !== item) {
            console.warn(`[renderOffice] Generic lookup failed for resolved ID: ${compId} (from: ${item})`);
        } else if (compId && !compId.startsWith('VARIABLE_')) {
            console.warn(`[renderOffice] Generic lookup failed for: ${compId}`);
        }

        // Trisagion injection — after absolution, if toggled
        if (item === 'bcp-absolution-slot' && document.getElementById('toggle-trisagion')?.checked) {
            const tris = appData.components.find(c => c.id === 'ecu-trisagion');
            if (tris) {
                bcpEmitBlock(container, env, 'Trisagion', tris.text,
                    { source: overlaySourceLabel(tris), anchor: 'after the Absolution' });
            }
        }
    }

    // Post-sequence Marian (after position — BCP offices only)
    if (marianElement !== 'none' && marianPos === 'after') {
        if ((marianElement === 'antiphon' || marianElement === 'both') && marianComp) {
            const t = resolveText(marianComp, rite);
            if (!t) bcpPushDiagnostic(env, 'not-yet-mapped', 'Marian Antiphon');
            bcpEmitBlock(container, env, 'Marian Antiphon', t || 'Text not found', null, 'italic');
        }
        if ((marianElement === 'theotokion' || marianElement === 'both') && theotokionComp) {
            const raw = resolveText(theotokionComp, rite) || theotokionComp.text || '';
            bcpEmitBlock(container, env, 'Theotokion', raw,
                { source: overlaySourceLabel(theotokionComp), anchor: 'after the office' }, 'para-italic');
        }
    }

    // ── Finalise DOM (Phase 3 refactor: real nodes throughout, one assignment
    // to office-display, and the envelope assembled directly from `env` --
    // no more scraping the rendered HTML for it) ─────────────────────────────
    if (window.AnglicanEnvelope) {
        try {
            window.AnglicanEnvelope.publish(
                window.AnglicanEnvelope.assemble(env, {
                    calendarSummary: officeSubtitle || null,
                    officeFamily: resolvedOfficeId || null
                })
            );
        } catch (e) {
            console.warn('[shell] envelope emit failed; the office is unaffected:', e);
        }
    }

    document.getElementById('office-display').replaceChildren(container);
    applyExplanationLayer('office-display');

    document.getElementById('date-header').innerText = 'Commemorations';
    // ── Saints (BCP / Daily Office) ─────────────────────────────────────────────
    // 2026-09-23: reuses angCommsForColor (resolved earlier in this function, before
    // updateSeasonalTheme()) instead of calling resolveCommemorations() a second time with
    // the same arguments.
    const angComms = angCommsForColor;

// Anglican calendar: the decided primary first, then other commemorations of the day, then alternates
// (data/saints/sanctoral.json `angRole`), then the Synaxarium decision file's remaining ranked candidates.
const _angRoleOrder = s => (s.angRole === 'primary' ? 0 : s.angRole === 'alternate' ? 2 : 1);
const angSorted = angComms.slice().sort((a, b) => _angRoleOrder(a) - _angRoleOrder(b));
const angMoreAlternates = await _angDecisionAlternates(currentDate, angSorted.map(s => s.name));
const angPrimaryDetail = await _angPrimaryDetail(currentDate);
const angPrimaryLife = await _angPrimaryLife(currentDate);
const angAllLives = await _loadAngLives();
document.getElementById('saint-display').innerHTML = (angSorted
    .map(s => {
        // No tradition code ("ANG") or source label above the name: that is catalogue metadata.
        const label = s.angRole === 'alternate' ? 'Alternate' : '';
        return `<div class="saint-box">${label ? `<small style="display:block; color:var(--accent); font-weight:bold; text-transform:uppercase;">${label}</small>` : ''}<strong>${_sharedOfficeNavigatorEscape(s.name || 'Unknown')}</strong>${_angLifeText(s, angPrimaryLife, angAllLives) ? '' : '<p>' + _sharedOfficeNavigatorEscape(s.description || 'No description') + '</p>'}${s.angRole === 'primary' && angPrimaryDetail ? '<p style="font-size:0.8em;opacity:0.75;margin-top:0.3em;">' + _sharedOfficeNavigatorEscape(angPrimaryDetail) + '</p>' : ''}${_angLifeText(s, angPrimaryLife, angAllLives) ? '<p class="saint-life">' + _sharedOfficeNavigatorEscape(_angLifeText(s, angPrimaryLife, angAllLives)) + '</p>' : ''}</div>`;
    })
    .join('') || '<p>No commemorations.</p>') + angMoreAlternates;
}

// ── Anglican Synaxarium decisions: alternates not already shown ─────────────────
let _angDecisionsPromise = null;
function _loadAngDecisions() {
    if (!_angDecisionsPromise) {
        _angDecisionsPromise = fetch('data/kalendar/synaxarium/decisions.json')
            .then(r => (r.ok ? r.json() : null)).catch(() => null);
    }
    return _angDecisionsPromise;
}
function _angNameKey(n) { return String(n || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z ]/g, ' '); }
// Short lives of the Anglican calendar's saints (data/saints/anglican-lives.json, keyed by the saint's
// identifier in the decisions file); original prose written for this app, see documentation/ANGLICAN_SAINT_LIVES.md.
let _angLivesPromise = null;
function _loadAngLives() {
    if (!_angLivesPromise) {
        _angLivesPromise = fetch('data/saints/anglican-lives.json')
            .then(r => (r.ok ? r.json() : null)).catch(() => null);
    }
    return _angLivesPromise;
}
// The life to show for a saint box: the day's primary uses the decisions file's primary; any other saint box
// (an alternate kept from the sanctoral data) looks itself up by its Synaxarium identifier.
function _angLifeText(saint, primaryLife, livesFile) {
    if (saint.angRole === 'primary') return primaryLife || '';
    const e = saint.synaxariumSin && livesFile && livesFile.lives ? livesFile.lives[saint.synaxariumSin] : null;
    return e && e.life ? e.life : '';
}
async function _angPrimaryLife(date) {
    try {
        const [data, lives] = await Promise.all([_loadAngDecisions(), _loadAngLives()]);
        const key = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        const sin = data && data.decisions && data.decisions[key] && data.decisions[key].primary ? data.decisions[key].primary.sin : null;
        const entry = sin && lives && lives.lives ? lives.lives[sin] : null;
        return entry && entry.life ? entry.life : '';
    } catch (e) { return ''; }
}
async function _angPrimaryDetail(date) {
    try {
        const data = await _loadAngDecisions();
        const key = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        const p = data && data.decisions && data.decisions[key] ? data.decisions[key].primary : null;
        if (!p) return '';
        // About the saint, not about the records: who they were and when. (Which calendars and books
        // attest the commemoration is audit data, kept in the decisions file, never shown to people praying.)
        const parts = [];
        if (p.designation) parts.push(p.designation);
        if (p.period) parts.push(p.period);
        return parts.join(' \u00b7 ');
    } catch (e) { return ''; }
}
async function _angDecisionAlternates(date, shownNames) {
    try {
        const data = await _loadAngDecisions();
        if (!data || !data.decisions) return '';
        const key = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        const day = data.decisions[key];
        if (!day || !Array.isArray(day.alternates) || !day.alternates.length) return '';
        const shown = shownNames.map(_angNameKey);
        const bigWords = k => k.split(' ').filter(w => w.length >= 5);
        const fresh = day.alternates.filter(a => {
            const k = _angNameKey(a.name);
            return !shown.some(sn => sn === k || bigWords(k).some(w => sn.indexOf(w) !== -1));
        });
        if (!fresh.length) return '';
        const livesFile = await _loadAngLives();
        const items = fresh.map(a => {
            const head = '<strong>' + _sharedOfficeNavigatorEscape(a.name) + '</strong>' +
                (a.designation ? ' \u2014 ' + _sharedOfficeNavigatorEscape(a.designation) : '') +
                (a.period ? ', ' + _sharedOfficeNavigatorEscape(a.period) : '');
            const entry = livesFile && livesFile.lives ? livesFile.lives[a.sin] : null;
            // A saint with a written life opens to it; the others stay a plain line.
            return entry && entry.life
                ? '<li><details><summary style="cursor:pointer;">' + head + '</summary><p class="saint-life">' + _sharedOfficeNavigatorEscape(entry.life) + '</p></details></li>'
                : '<li>' + head + '</li>';
        }).join('');
        return '<details class="saint-box"><summary style="cursor:pointer;color:var(--accent);font-weight:bold;text-transform:uppercase;font-size:0.8em;">' +
               'Also commemorated today</summary><ul style="margin:0.5em 0 0 1.1em;">' + items + '</ul></details>';
    } catch (e) { return ''; }
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

    // FIXED 2026-09-02: the sidebar's Current Cycle / Fasting Character / Anaphora
    // boxes (#esy-cycle-box, #esy-fast-box, #esy-anaphora-box) existed in
    // index.html but were never written to by any code -- found during a
    // sidebar functionality audit requested by Josh, the same class of dead-
    // control bug already found and fixed once for the Cathedral/Monastic
    // toggle. getDayClass() already computes and exposes exactly these three
    // values as ready-to-display labels (seasonLabel, fastLabel,
    // anaphoraLabel) -- they simply were never read into the DOM.
    {
        const sidebarDayClass = EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode });
        const cycleBox    = document.getElementById('esy-cycle-box');
        const fastBox     = document.getElementById('esy-fast-box');
        const anaphoraBox = document.getElementById('esy-anaphora-box');
        if (cycleBox)    cycleBox.textContent    = `${sidebarDayClass.seasonLabel || cycleLabel} \u2014 ${cycleLabel}`;
        if (fastBox)     fastBox.textContent     = sidebarDayClass.fastLabel || 'No fast observed';
        if (anaphoraBox) anaphoraBox.textContent = sidebarDayClass.anaphoraLabel || '\u2014';
    }

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

    // Individual-saint memorial days (getDayClass's own dayClass === 'commemoration':
    // a real, non-feast commemoration exists that day). Wired 2026-09-24 --
    // components/traditions/east-syriac/rubrics.json's memorials-lelya-sequence
    // (built 2026-08-19 from Maclean pp.68-84 alongside the Festival Evening
    // Service) had zero references anywhere in this file until now, confirmed by
    // grep before writing this: fully built content sitting orphaned. Ramsha and
    // Sapra have NO equivalent assembled Memorial sequence yet -- Maclean's own
    // Memorial content for those offices (the four commemoration-of-the-departed
    // First/Second Anthem forms, the Suba'a appended afterward) exists only as
    // loose components, not yet assembled into a sequence the way Lelya's was.
    // That remains open; this wiring covers Lelya only, the one office where the
    // content was already a complete, ready-to-route sequence.
    const isMemorialDay = (typeof EastSyriacCalendar !== 'undefined')
        ? EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode }).dayClass === 'commemoration'
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
    // During the Great Fast, ferial Ramsha (weekdays only) is its own office,
    // not the ordinary ferial evening service. Maclean gives it in full at
    // pp.211-213 under "Weeks of the Mysteries in the Fast", and p.220 directs
    // that Ordinary Weeks follow the same order "except that before the Suba'a
    // they always say the Lord's Prayer and its collects (page 212)" -- i.e.
    // restoring exactly what the Mysteries rubric says is omitted there. Until
    // 2026-09-04 Ramsha had no Fast branch at all, so every weekday evening of
    // the Fast rendered the ordinary ferial sequence.
    //
    // Three slots are day-specific. Maclean does not reprint them: he sends the
    // reader back to that weekday's own ferial text ("the First Shuraya for the
    // day (page 3, etc.)", "the Evening Anthem (page 11, etc.)"). They are
    // therefore resolved by reading the day's OWN ordinary Ramsha sequence and
    // lifting the matching component out of it, rather than by hardcoding a
    // day-to-id map -- the per-day/per-cycle ids are not uniformly named, and a
    // map would silently rot if any were renamed.
    let ramshaFastSequenceName = null;
    let ramshaFastDaySourceKey = null;
    if (officeKey === 'ramsha' && isGreatFast && dayName !== 'sunday' && typeof EastSyriacCalendar !== 'undefined') {
        const weekInSeason = EastSyriacCalendar.getDayClass(currentDate, { easterMode: selectedCoeEasterMode }).weekInSeason;
        const isMysteriesWeek = [1, 4, 7].includes(weekInSeason);
        ramshaFastSequenceName = isMysteriesWeek ? 'ramsha-fast-mysteries-sequence' : 'ramsha-fast-ordinary-sequence';

        // MIDDLE FRIDAY. Resolved from the Kalendar (Maclean pp.270-272), which
        // lists "Middle (Fourth) Monday of the Fast" ... "Middle Friday of the
        // Fast" between the Fourth and Fifth Sundays -- the parenthetical is
        // Maclean's own, so Middle = the fourth week of the Great Fast. Friday
        // uniquely has a third set of propers (pp.48-49) alongside First
        // (pp.41-47) and Last (pp.61-65). Those propers feed the day-specific
        // slots of the Fast evening structure; they are not a substitute for it.
        const isMiddleFriday = (dayName === 'friday' && weekInSeason === 4);
        ramshaFastDaySourceKey = isMiddleFriday
            ? 'middle-friday-ramsha-sequence'
            : `${dayName}-ramsha-${cycle}-sequence`;

        sequenceKey = ramshaFastSequenceName;
    }

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
    } else if (officeKey === 'lelya' && isMemorialDay && dayName !== 'sunday' && !lelyaFastSequenceName) {
        // A Feast of our Lord always wins over a coinciding memorial (the branch
        // above), and Sunday's own Night Service always wins over a coinciding
        // weekday memorial (matching how Sunday already takes precedence
        // everywhere else in this function) -- a real memorial only reaches this
        // branch when neither of those applies. Overrides Wednesday's own
        // Before/After Motwa variation too, on the same reasoning already
        // established for the Feast branch just above: this is inferred from
        // this codebase's existing feast-over-weekday-variation precedent, not
        // separately confirmed against Maclean's own stated priority order for
        // this specific case.
        sequenceKey = 'memorials-lelya-sequence';
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

            // Motwa close: Maclean's own rubric at p.96 states the fixed
            // close "ends daily on ferias as follows, except on Wednesdays,
            // and except in the Fast and the Rogation of the Ninevites."
            // The Wednesday and Fast halves of that rule were already
            // enforced structurally -- Wednesday's own Lelya sequences never
            // contained esy-lelya-motwa-close, and the Fast routes to
            // lelya-fast-{mysteries,ordinary}-sequence, which do not contain
            // it either -- but the Rogation half was never enforced anywhere,
            // so Rogation Monday and Tuesday were still rendering it. The
            // component's own meta.note had recorded the full rule since it
            // was built; this was a documented condition that the engine
            // never applied. Wednesday of the Rogation is unaffected, having
            // never carried the id in the first place.
            sequence = sequence.filter(id => id !== 'esy-lelya-motwa-close');

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

    // Resolve the Fast Ramsha day-specific slots out of the day's own ordinary
    // Ramsha sequence (or Middle Friday's, on the fourth Friday of the Fast).
    // Matching is by id substring against that real sequence, so a renamed
    // component fails loudly as an unresolved marker rather than silently
    // rendering the wrong day's text.
    if (ramshaFastSequenceName && sequence) {
        const daySeq = appData.eastSyriacRubrics?.[ramshaFastDaySourceKey] || [];
        const pick = (needle) => daySeq.find(id => id.includes(needle)) || null;
        const slots = {
            '__DAY_FIRST_SHURAYA__':  pick('first-shuraya'),
            '__DAY_SECOND_SHURAYA__': pick('second-shuraya'),
            '__DAY_EVENING_ANTHEM__': pick('evening-anthem')
        };
        sequence = sequence
            .map(id => (id in slots) ? slots[id] : id)
            .filter(Boolean);
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
        // DOM-based, not a fallback string -- built the same way as every other state in this
        // function (and the same move renderBcpOffice()'s own Phase 3 refactor made for its own
        // no-content states), so the rail gets populated here too instead of staying inert.
        const isEndanaOutsideFast = (officeKey === 'endana' && !isGreatFast);

        const fbContainer = document.createElement('div');
        fbContainer.className = 'office-container';

        const fbBookTitle = document.createElement('p');
        fbBookTitle.className = 'office-book-title';
        fbBookTitle.textContent = 'The Hudra';
        fbContainer.appendChild(fbBookTitle);

        const fbH2 = document.createElement('h2');
        fbH2.textContent = officeTitle;
        fbContainer.appendChild(fbH2);

        const fbSubtitleText = currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + cycleSuffix;
        const fbSubtitle = document.createElement('p');
        fbSubtitle.className = 'liturgical-title';
        fbSubtitle.textContent = fbSubtitleText;
        fbContainer.appendChild(fbSubtitle);

        if (esyModeFallbackNote) {
            const fbNote = document.createElement('span');
            fbNote.className = 'rubric-text';
            fbNote.textContent = esyModeFallbackNote;
            fbContainer.appendChild(fbNote);
        }

        const fbEnv = { blocks: [], overlays: [], diagnostics: [] };

        // Endana outside the Fast is NOT a diagnostic: it is correct, by-design absence (the
        // primary source gives this office no existence outside the Great Fast at all), not a
        // gap this project simply hasn't rebuilt yet -- the same distinction the pre-port
        // function already drew between the two states with different wording. "Not yet rebuilt"
        // IS a genuine, disclosed content gap, so it gets the real diagnostic contract (§11)
        // BCP already uses for exactly this situation, via bcpPushDiagnostic's existing
        // 'not-yet-mapped' wording ("No proper is appointed for this day in the corpus. Nothing
        // has been substituted.") -- an exact semantic match, not repurposed loosely.
        if (isEndanaOutsideFast) {
            bcpEmitBlock(fbContainer, fbEnv, 'Not observed outside the Great Fast',
                `Endana ("Prayer at Noon in the Fast") is one of only two minor-hour relics in Maclean's `
                + `source (the other being Quta'a, said as part of the Fast-season Morning Service); neither has any existence `
                + `outside the Great Fast (Sauma). This is not unbuilt content -- it simply isn't part of the daily office on `
                + `non-Fast days, per the primary source itself.`,
                null, undefined);
        } else {
            bcpEmitBlock(fbContainer, fbEnv, 'Not yet rebuilt',
                `The Church of the East office content is being rebuilt from a verified primary source `
                + `(A.J. Maclean, <em>East Syrian Daily Offices</em>, 1894) one day and one hour at a time, replacing an earlier build `
                + `that had no source citations. ${dayName[0].toUpperCase()}${dayName.slice(1)}'s ${officeTitle} hasn't been `
                + `built yet. See AUDIT_GOVERNANCE_LEDGER.md for the rebuild plan.`,
                null, undefined);
            bcpPushDiagnostic(fbEnv, 'not-yet-mapped', officeTitle);
        }

        if (window.AnglicanEnvelope) {
            try {
                window.AnglicanEnvelope.publish({
                    tradition: 'COE',
                    officeFamily: officeKey || null,
                    context: { calendarSummary: fbSubtitleText || null, rankSummary: null },
                    blocks: fbEnv.blocks,
                    overlays: fbEnv.overlays,
                    diagnostics: fbEnv.diagnostics
                });
            } catch (e) {
                console.warn('[shell] envelope emit failed; the office is unaffected:', e);
            }
        }

        document.getElementById('office-display').replaceChildren(fbContainer);
        applyExplanationLayer('office-display');
        return;
    }

    const container = document.createElement('div');
    container.className = 'office-container';

    const bookTitle = document.createElement('p');
    bookTitle.className = 'office-book-title';
    bookTitle.textContent = 'The Hudra';
    container.appendChild(bookTitle);

    const h2 = document.createElement('h2');
    h2.textContent = officeTitle;
    container.appendChild(h2);

    const officeSubtitleText = currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + cycleSuffix;
    const subtitle = document.createElement('p');
    subtitle.className = 'liturgical-title';
    subtitle.textContent = officeSubtitleText;
    container.appendChild(subtitle);

    if (esyModeFallbackNote) {
        const noteSpan = document.createElement('span');
        noteSpan.className = 'rubric-text';
        noteSpan.textContent = esyModeFallbackNote;
        container.appendChild(noteSpan);
    }

    // env replaces the string-concatenated officeHtml entirely -- blocks/overlays/diagnostics
    // built directly, here, at the moment each is actually emitted, the same pattern
    // renderBcpOffice()/renderCopticAgpeya() established. overlays stays empty throughout this
    // lane: nothing in the East Syriac Hudra borrows content from another tradition (confirmed
    // 2026-09-24 by reading this function end to end), so there is nothing to mark as an overlay.
    const env = { blocks: [], overlays: [], diagnostics: [] };

    for (const itemId of sequence) {
        const comp = appData.components.find(c => c.id === itemId);
        if (!comp) {
            console.warn(`[renderEastSyriac] Component not found: ${itemId}`);
            bcpPushDiagnostic(env, 'coverage-gap', itemId);
            continue;
        }

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

        // Label + body: reuses bcpEmitBlock exactly as the Anglican/Coptic lanes do -- per Josh's
        // 2026-09-24 ruling ("consistency unless a tradition requires otherwise"), and nothing
        // here requires otherwise (BCP_GUTTER_KIND_BY_LABEL simply returns '' for every East
        // Syriac term, the same safe empty-gutter default Coptic got). Pushes exactly ONE
        // env.blocks entry for this component; any citations below (psalms/psalmRef/scriptureRef/
        // sections) fold into THAT SAME block's units rather than opening a second rail row that
        // would just repeat the title already shown -- see esyEmitCitation's own comment for why.
        bcpEmitBlock(container, env, comp.title || itemId, componentText, null, undefined);
        const activeBlock = env.blocks[env.blocks.length - 1];

        if (Array.isArray(comp.sections)) {
            // A Hulala: a sequence of {prayer, psalms|scriptureRefs} pairs.
            // Each section's own proper prayer is rendered, followed by its
            // psalm(s) or canticle(s) resolved from the corpus, mirroring
            // Maclean's actual structure (a proper prayer before each
            // subdivision of psalms within a Hulala, not one prayer for the
            // whole Hulala). Sections carry no label of their own -- matching
            // the pre-port function, which never gave them individual headings.
            for (const section of comp.sections) {
                if (section.prayer) {
                    bcpEmitBare(container, section.prayer, {});
                }
                const refs = Array.isArray(section.psalms) ? section.psalms.map(p => ({ label: `Psalm ${p}`, query: 'PSALM ' + p }))
                           : Array.isArray(section.scriptureRefs) ? section.scriptureRefs.map(r => ({ label: r, query: r }))
                           : [];
                for (const ref of refs) {
                    const fullText = await getScriptureText(ref.query);
                    activeBlock.units.push(esyEmitCitation(container, ref.label, fullText));
                }
            }
        } else if (Array.isArray(comp.psalms)) {
            for (const psRef of comp.psalms) {
                const fullText = await getScriptureText('PSALM ' + psRef);
                activeBlock.units.push(esyEmitCitation(container, `Psalm ${psRef}`, fullText));
            }
        } else if (comp.psalmRef) {
            const fullText = await getScriptureText('PSALM ' + comp.psalmRef);
            activeBlock.units.push(esyEmitCitation(container, `Psalm ${comp.psalmRef}`, fullText));
        } else if (comp.scriptureRef) {
            // Non-Psalm scripture citation (e.g. the Exodus 15 canticle used as a
            // Shuraya substitute) -- comp.scriptureRef already carries the full
            // "BOOK chapter:verse" citation getScriptureText expects.
            const fullText = await getScriptureText(comp.scriptureRef);
            activeBlock.units.push(esyEmitCitation(container, comp.scriptureRef, fullText));
        }
    }

    if (window.AnglicanEnvelope) {
        try {
            window.AnglicanEnvelope.publish({
                tradition: 'COE',
                officeFamily: officeKey || null,
                context: { calendarSummary: officeSubtitleText || null, rankSummary: null },
                blocks: env.blocks,
                overlays: env.overlays,
                diagnostics: env.diagnostics
            });
        } catch (e) {
            console.warn('[shell] envelope emit failed; the office is unaffected:', e);
        }
    }

    document.getElementById('office-display').replaceChildren(container);
    applyExplanationLayer('office-display');

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
            .map(s => `<div class="saint-box"><small style="color:var(--accent); font-weight:bold; text-transform:uppercase;">COE</small><strong>${_sharedOfficeNavigatorEscape(s.name || 'Unknown')}</strong><p>${_sharedOfficeNavigatorEscape(s.description || '')}</p></div>`)
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

    // ── Begin DOM assembly (Phase 5 port: real nodes, not one string --
    // same move renderBcpOffice() made in its own Phase 3 refactor) ─────────
    const officeSubtitleText = currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const container = document.createElement('div');
    container.className = 'office-container';

    const bookTitle = document.createElement('p');
    bookTitle.className = 'office-book-title';
    bookTitle.textContent = 'The Coptic Agpeya';
    container.appendChild(bookTitle);

    const h2 = document.createElement('h2');
    h2.textContent = activeRubric.officeName || 'The Morning Office';
    container.appendChild(h2);

    const subtitle = document.createElement('p');
    subtitle.className = 'liturgical-title';
    subtitle.textContent = officeSubtitleText;
    // ADDED 2026-09-25, spec section 6. SOURCED, PARTIALLY WIRED -- disclosed,
    // not silently shipped incomplete. Coptic practice has no codified
    // per-feast colour scheme (confirmed directly: a Coptic liturgical-
    // vestments researcher who checked the canons found none, beyond "the
    // tunic must be white" -- tasbeha.org community discussion); the commonly-
    // observed but non-canonical folk custom (white default, red for martyr
    // commemorations, purple during fasting periods) was built anyway on
    // Josh's direct instruction. White/red are wired below, from each day's
    // own sourced liturgicalColorOOR (data/saints/sanctoral.json). Purple is
    // NOT wired: it would need a Coptic fasting-period calendar (Great Lent,
    // the Nativity/Apostles'/Virgin Mary fasts, on the Coptic church's own
    // Alexandrian computus -- distinct from both the Western and Byzantine
    // reckonings already built for other lanes) that does not exist anywhere
    // in this codebase, confirmed by a repo-wide search before writing this.
    // Building one is real, separate engine work, not a data-sourcing gap --
    // flagged here and on the dashboard rather than faked with a guessed date
    // range or silently dropped from the approved 3-colour scheme.
    try {
        const oorComms = await resolveCommemorations(currentDate, 'OOR', { includeEcumenical: false });
        const oorColor = oorComms.find(s => s.liturgicalColorOOR)?.liturgicalColorOOR || 'white';
        const oorDotColor = { white: '#f5f1e4', red: '#9b2335' }[oorColor];
        if (oorDotColor) {
            const dot = document.createElement('span');
            dot.className = 'seasonal-dot';
            dot.setAttribute('aria-hidden', 'true');
            dot.style.cssText = `display:inline-block; width:0.5em; height:0.5em; border-radius:50%; background:${oorDotColor}; margin-left:0.5em; vertical-align:middle;`;
            subtitle.appendChild(dot);
        }
    } catch (_error) {
        // Commemoration lookup failing must never block the office itself
        // from rendering -- the dot is a disclosure, not a dependency.
    }
    container.appendChild(subtitle);

    // env replaces the string-concatenated officeHtml entirely -- blocks/
    // overlays/diagnostics are built directly, here, at the moment each is
    // actually emitted, the same pattern renderBcpOffice() established.
    // overlays stays empty throughout this lane: nothing in the Coptic
    // Agpeya borrows content from another tradition (unlike BCP's Agpeya
    // Opening/Prayer of the Hours/Angelus toggles, which borrow INTO BCP),
    // so there is nothing to mark as an overlay here -- confirmed by reading
    // the pre-port function end to end, not assumed from the shape of BCP's.
    const env = { blocks: [], overlays: [], diagnostics: [] };

    for (let item of (activeRubric.sequence || [])) {
        item = item.trim();


        // VARIABLE_COP_LESSON — the scripture reading O'Leary cites by reference only
        if (item === 'VARIABLE_COP_LESSON') {
            const lesson = activeRubric.lesson;
            if (lesson && lesson.citation) {
                const text = await getScriptureText(lesson.citation);
                copEmitReading(container, env, lesson.label || 'The Lesson', lesson.citation, text);
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
                copEmitReading(container, env, canticle.label || 'The Canticle', canticle.citation, text);
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
                const psalmEntries = [];
                for (const psNum of psalmNums) {
                    const fullText = await getScriptureText('PSALM ' + psNum);
                    psalmEntries.push({ displayNumber: psNum, fullText: fullText });
                }
                bcpEmitPsalmBlock(container, env, 'The Psalms', psalmEntries);
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
                bcpEmitPsalmBlock(container, env, antSpec.label || ('Psalm ' + antSpec.reference),
                    [{ displayNumber: antSpec.reference, fullText: fullText }]);
            }
            continue;
        }

        // VARIABLE_COP_MO_FIRST_NOCTURN_PSALM — the Midnight Office's own single-psalm
        // reading (Psalm 119) at the head of the First Nocturn.
        if (item === 'VARIABLE_COP_MO_FIRST_NOCTURN_PSALM') {
            const spec = activeRubric.firstNocturnPsalm;
            if (spec && spec.reference) {
                const fullText = await getScriptureText('PSALM ' + spec.reference);
                bcpEmitPsalmBlock(container, env, 'The Psalm', [{ displayNumber: spec.reference, fullText: fullText }]);
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
                const psalmEntries = [];
                for (const psNum of psalmNums) {
                    const fullText = await getScriptureText('PSALM ' + psNum);
                    psalmEntries.push({ displayNumber: psNum, fullText: fullText });
                }
                bcpEmitPsalmBlock(container, env, 'The Psalms', psalmEntries);
            } else {
                console.warn(`[renderCopticAgpeya] Could not find psalms for ${sourceRubricId} to resolve ${item}`);
                bcpPushDiagnostic(env, 'coverage-gap', 'The Psalms');
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
                    bcpEmitBlock(container, env, sectionComp.title || section.component, t, null, 'para');
                } else {
                    console.warn(`[renderCopticAgpeya] Theotokia section component not found: ${section.component}`);
                    bcpPushDiagnostic(env, 'coverage-gap', section.component);
                }
                if (section.lessonCitation) {
                    const lessonText = await getScriptureText(section.lessonCitation);
                    // No label -- O'Leary gives this lesson no separate heading beyond the
                    // section it belongs to, matching the pre-port function exactly.
                    copEmitReading(container, env, '', section.lessonCitation, lessonText);
                }
            }
            continue;
        }

        // Generic component lookup — covers every cop-* fixed-text component
        // plus shared components like comm-lords-prayer.
        const comp = appData.components.find(c => c.id === item);
        if (comp) {
            const t = resolveText(comp, rite) || comp.text || '';
            bcpEmitBlock(container, env, comp.title || item, t, null, 'para');
        } else {
            console.warn(`[renderCopticAgpeya] Component not found: ${item}`);
            bcpPushDiagnostic(env, 'coverage-gap', item);
        }
    }

    // ── Finalise DOM (same move as renderBcpOffice()'s own Phase 3 close:
    // publish the envelope first, then one replaceChildren, not innerHTML) ──
    if (window.AnglicanEnvelope) {
        try {
            // Reusing window.AnglicanEnvelope.publish() deliberately -- it is a
            // plain, tradition-neutral event dispatch (sets
            // window.__universalOfficeEnvelope, fires 'universal-office-envelope'),
            // not Anglican-specific logic; the shell's own listener
            // (js/office-shell.js: watchEnvelope/renderRailFromEnvelope/
            // renderOrdoFromEnvelope/renderMarginFromEnvelope) reads env.tradition,
            // env.blocks, env.context, env.overlays and env.diagnostics generically
            // and was confirmed, by reading it, to contain nothing gated to
            // tradition 'ANG'. Building the envelope object directly here rather
            // than adding a parallel CopticEnvelope.assemble() avoids a second
            // near-duplicate wrapper for a one-line object literal.
            window.AnglicanEnvelope.publish({
                tradition: 'OOR',
                officeFamily: selectedHourId || null,
                context: { calendarSummary: officeSubtitleText || null, rankSummary: null },
                blocks: env.blocks,
                overlays: env.overlays,
                diagnostics: env.diagnostics
            });
        } catch (e) {
            console.warn('[shell] envelope emit failed; the office is unaffected:', e);
        }
    }

    document.getElementById('office-display').replaceChildren(container);
    applyExplanationLayer('office-display');

    // Senkessar is intentionally not shown here -- parked separately per
    // governance decision 2026-08-18, not merged into the Coptic office.
    document.getElementById('saint-display').innerHTML = '';
    document.getElementById('date-header').style.display = 'none';
    const saintSection = document.querySelector('.saint-section');
    if (saintSection) saintSection.style.display = 'none';
}

