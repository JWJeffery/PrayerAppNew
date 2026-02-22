/**
 * OFFICE-UI.JS
 * Core application logic for The Universal Office.
 * Depends on: calendar-engine.js, scripture-resolver.js
 *
 * PATCH 2026-02-22 — Structural fixes per architectural directive:
 *   • VARIABLE_CANTICLE1 handler — Te Deum (MP) / Magnificat (EP), rite-aware
 *   • VARIABLE_CANTICLE2 handler — Benedictus (MP) / Nunc Dimittis (EP), rite-aware
 *   • VARIABLE_MISSION_PRAYER handler — resolves bcp-mission-prayer-1
 *   • VARIABLE_WEEKDAY_COLLECT handler — tiered fallback (seasonal → standard → skip)
 *   • bcp-litany — gated behind greatLitanyChecked toggle
 *   • bcp-salutation — falls through to generic lookup (component exists)
 *   • [rite] interpolation verified — bcp-confession-rite1 / bcp-confession-rite2
 *   • Theotokion \n\n → <br><br> rendering parity with Examen
 *   • collect-transfiguration → collect-the-transfiguration-of-our-lord manual map
 */

// ── State ────────────────────────────────────────────────────────────────────
let appData = null;
let currentDate = new Date();
let selectedMode = null;

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

// ── Initialization ───────────────────────────────────────────────────────────
async function init() {
    try {
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Loading...</h3><p>Preparing your daily office...</p></div>`;

        appData = { components: [], rubrics: [] };

        // 1. Load Rubrics
        const rubricsRes = await fetch('data/rubrics.json');
        if (!rubricsRes.ok) throw new Error('Missing: data/rubrics.json');
        appData.rubrics = await rubricsRes.json();

        // 2. Load Component Shards
        // Live component data lives in components/*.json (modularized structure).
        // data/components.json is the stale pre-modularization monolith — do not use.
        const shards = ['common', 'anglican', 'coptic', 'ecumenical', 'ethiopian'];
        for (const shard of shards) {
            const required = shard !== 'ethiopian';
            try {
                const res = await fetch(`components/${shard}.json`);
                if (!res.ok) {
                    if (required) console.warn(`[init] Required shard missing: components/${shard}.json`);
                    continue;
                }
                const text = await res.text();
                if (!text.trim()) {
                    // Empty file — skip silently for optional shards, warn for required
                    if (required) console.warn(`[init] Required shard is empty: components/${shard}.json`);
                    else console.log(`[init] Skipping empty optional shard: components/${shard}.json`);
                    continue;
                }
                const shardData = JSON.parse(text);
                appData.components = appData.components.concat(shardData);
                console.log(`[init] Loaded components/${shard}.json — ${shardData.length} components`);
            } catch (e) {
                if (required) console.warn(`[init] Failed to parse components/${shard}.json:`, e.message);
                else console.log(`[init] Skipping unparseable optional shard: components/${shard}.json`);
            }
        }
        console.log(`[init] Total components loaded: ${appData.components.length}`);

        updateUI();
        await CalendarEngine.init();
        await CalendarEngine.fetchLectionaryData();
        renderOffice();

    } catch (err) {
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>System Error</h3><p>${err.message}</p></div>`;
        console.error('Init failed:', err);
    }
}

// ── Mode Selection ───────────────────────────────────────────────────────────
function selectMode(mode) {
    selectedMode = mode;
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('splash-bg').style.display = 'none';
    document.body.classList.add('office-active');
    document.body.style.height = 'auto';
    document.body.style.overflowY = 'auto';

    if (mode === 'daily') {
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'flex-start';
        document.body.style.alignItems = 'flex-start';
        document.getElementById('daily-office-section').style.display = 'flex';
        document.getElementById('sidebar-toggle').style.display = 'flex';
        document.getElementById('settings-panel').style.display = 'block';
        document.getElementById('settings-panel').classList.add('sidebar-hidden');
        loadSettings();
        updateSidebarForOffice();
        updateDatePicker();
        if (!appData || !appData.rubrics || appData.components.length === 0) {
            init();
        } else {
            renderOffice();
        }
    } else if (mode === 'prayers') {
        document.body.style.display = 'block';
        document.body.style.width = '100vw';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.getElementById('individual-prayers-section').style.display = 'flex';
        document.getElementById('individual-prayers-section').style.width = '100vw';
        document.getElementById('sidebar-toggle').style.display = 'none';
        document.getElementById('settings-panel').style.display = 'none';
    }
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

// ── Sidebar ──────────────────────────────────────────────────────────────────
function toggleSidebar() {
    const panel  = document.getElementById('settings-panel');
    const toggle = document.getElementById('sidebar-toggle');
    const main   = document.getElementById('main-content');
    const hidden = panel.classList.toggle('sidebar-hidden');
    main.classList.toggle('sidebar-hidden', hidden);
    toggle.style.opacity = hidden ? '0.65' : '0.5';
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
        kyriePantocrator:    document.getElementById('toggle-kyrie-pantocrator')?.checked || false
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
        { from: 6 * 60, to: 9 * 60, hourId: 'eth-tuat-hour-text', hourName: 'Tuat — The Morning Watch', uiLabel: 'Morning Prayer', psalms: ['3', '63', '133'] },
        // Future phases: Tierce (9–12), Sext (12–15), None (15–18), Vespers (18–21), Compline (21–24), Midnight (0–3), pre-Tuat (3–6)
    ];

    for (const entry of hourMap) {
        if (totalMinutes >= entry.from && totalMinutes < entry.to) return entry;
    }
    // Default fallback: Tuat covers all unmapped windows until further phases are added
    return { hourId: 'eth-tuat-hour-text', hourName: 'Tuat — The Morning Watch', uiLabel: 'Morning Prayer', psalms: ['3', '63', '133'] };
}

// ── Office Renderer ──────────────────────────────────────────────────────────
async function renderOffice() {
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
    const officeId   = document.querySelector('input[name="office-time"]:checked')?.value || 'morning-office';
    const isMorning  = officeId === 'morning-office';
    const isEvening  = officeId === 'evening-office';
    const isNoonday  = officeId === 'noonday-office';
    const isCompline        = officeId === 'compline-office';
    const isEthiopianSaatat = officeId === 'ethiopian-saatat';
    const ethHourInfo       = isEthiopianSaatat ? getEthiopianHourInfo() : null;

    // rite resolves to 'rite1' or 'rite2' — used as the key into component.text objects.
    // bcp-confession-[rite] interpolation produces bcp-confession-rite1 / bcp-confession-rite2,
    // which are the exact IDs present in data/components.json. No conflict with the ritePrefix
    // (r1/r2) logic used solely for bcp-absolution-slot.
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

    const dailyData    = await CalendarEngine.fetchLectionaryData(currentDate);
    const activeRubric = appData.rubrics.find(r => r.id === officeId);

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
        // Two-step Theotokion lookup: seasonal variant first, generic fallback
        theotokionComp = appData.components.find(c => c.id === `cop-theotokion-${season}`)
                      || appData.components.find(c => c.id === 'cop-theotokion');
    }

    // ── Reading chains (independent MP / EP — no cross-contamination) ─────────
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
    let officeHtml = `<div class="office-container"><h2>${activeRubric?.officeName || 'Office'}</h2>`;
    officeHtml += `<p class="liturgical-title">${dailyData.title || 'Day Title'}</p>`;

    // Pre-sequence ecumenical devotions
    if (document.getElementById('toggle-agpeya-opening')?.checked) {
        const agpeyaComp = appData.components.find(c => c.id === 'cop-agpeya-opening');
        if (agpeyaComp) officeHtml += `<span class="rubric-text">Agpeya Opening</span><span class="component-text">${agpeyaComp.text}</span>`;
    }
    if (document.getElementById('toggle-east-syriac-hours')?.checked) {
        const esComp = appData.components.find(c => c.id === 'ecu-east-syriac-hours');
        if (esComp) officeHtml += `<span class="rubric-text">Prayer of the Hours</span><span class="component-text">${esComp.text}</span>`;
    }

    // Pre-sequence Marian (before position)
    if (marianElement !== 'none' && marianPos === 'before') {
        if ((marianElement === 'antiphon' || marianElement === 'both') && marianComp) {
            const t = resolveText(marianComp, rite) || 'Text not found';
            officeHtml += `<span class="rubric-text">Marian Antiphon</span><span class="component-text"><i>${t}</i></span>`;
        }
        if ((marianElement === 'theotokion' || marianElement === 'both') && theotokionComp) {
            // Apply paragraph-break formatting to Theotokion text
            const raw = resolveText(theotokionComp, rite) || theotokionComp.text || '';
            officeHtml += `<span class="rubric-text">Theotokion</span><div class="component-text" style="white-space:normal"><i>${applyParagraphBreaks(raw)}</i></div>`;
        }
    }

    // ── Main Rubric Sequence Loop ─────────────────────────────────────────────
    for (let item of activeRubric?.sequence || []) {
        item = item.trim();

        // ── Slot interpolation & redirects (run before all VARIABLE_ checks) ──
        // [rite] interpolation: bcp-confession-[rite] → bcp-confession-rite1 / bcp-confession-rite2
        // These exact IDs exist in data/components.json. No conflict with ritePrefix (r1/r2)
        // which is used exclusively in the bcp-absolution-slot block below.
        let compId = item.replace('[rite]', rite);

        if (compId === 'bcp-absolution-slot') {
            // Absolution uses abbreviated ritePrefix (r1/r2) + minister — separate from [rite]
            const ritePrefix = rite === 'rite1' ? 'r1' : 'r2';
            compId = `bcp-absolution-${ritePrefix}-${minister}`;
        } else if (compId === 'comm-creed-slot') {
            compId = creedSelection;
        } else if (compId === 'bcp-suffrages-slot') {
            if (suffragesChecked) { compId = `bcp-suffrages-${rite}`; } else { continue; }
        }

        // ── VARIABLE_ token handlers ──────────────────────────────────────────

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
        // Rite I / Rite II text selected via resolveText(comp, rite)
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
        // Rite I / Rite II text selected via resolveText(comp, rite)
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
            // Manual ID map for known lectionary naming discrepancies
            if (cId === 'bcp-collect-transfiguration') cId = 'bcp-collect-the-transfiguration-of-our-lord';

            const comp = appData.components.find(c => c.id === cId);
            const t    = comp ? (resolveText(comp, rite) || 'No collect appointed') : 'No collect appointed';
            officeHtml += `<span class="component-text">${t}</span>`;
            officeHtml += '<div class="ornamental-divider"><div class="div-line-left"></div><span class="ornamental-divider-glyph">✦ ✝ ✦</span><div class="div-line-right"></div></div>';

            // Examen (Compline only) — paragraph breaks preserved
            if (isCompline && document.getElementById('toggle-examen')?.checked) {
                const ex = appData.components.find(c => c.id === 'ecu-examen');
                if (ex) {
                    officeHtml += `<span class="rubric-text">The Examen</span><div class="component-text" style="white-space:normal">${applyParagraphBreaks(ex.text)}</div>`;
                }
            }
            // Kyrie Pantocrator (MP/EP only)
            if (!isCompline && !isNoonday && document.getElementById('toggle-kyrie-pantocrator')?.checked) {
                const kp = appData.components.find(c => c.id === 'ecu-kyrie-pantocrator');
                if (kp) officeHtml += `<span class="rubric-text">Kyrie Pantocrator</span><span class="component-text">${kp.text}</span>`;
            }
            continue;
        }

        // VARIABLE_WEEKDAY_COLLECT — ferial/weekday supplementary collect
        // Tiered fallback: (1) seasonal key in dailyData → (2) standard office collect → (3) skip
        if (item === 'VARIABLE_WEEKDAY_COLLECT') {
            let wkComp = null;
            // Priority 1: look for a specific weekday/seasonal collect in lectionary data
            if (dailyData.collect_weekday) {
                const wkId = dailyData.collect_weekday.startsWith('bcp-')
                    ? dailyData.collect_weekday
                    : 'bcp-' + dailyData.collect_weekday;
                wkComp = appData.components.find(c => c.id === wkId);
            }
            // Priority 2: fall back to the standard grace/peace collect for the office
            if (!wkComp) {
                const fallbackId = isMorning ? 'bcp-collect-grace' : 'bcp-collect-peace';
                wkComp = appData.components.find(c => c.id === fallbackId);
            }
            // Priority 3: skip silently if neither is found
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

        // ── Named component handlers ──────────────────────────────────────────

        // bcp-invitatory-full — invitatory with Angelus injection and seasonal canticle
        if (item === 'bcp-invitatory-full') {
            // Optional Angelus (before invitatory text, not in Compline)
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

            // Seasonal invitatory canticle (MP and EP only)
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

        // eth-saatat-hour-slot — resolves to the canonical hour text keyed by local clock
        if (item === 'eth-saatat-hour-slot') {
            if (ethHourInfo) {
                const hourComp = appData.components.find(c => c.id === ethHourInfo.hourId);
                if (hourComp) {
                    officeHtml += `<span class="rubric-text">${ethHourInfo.hourName}</span>`;
                    officeHtml += `<div class="component-text" style="white-space:normal">${applyParagraphBreaks(hourComp.text)}</div>`;
                } else {
                    console.warn(`[renderOffice] eth-saatat-hour-slot: component not found — ${ethHourInfo.hourId}`);
                }
            }
            continue;
        }

        // eth-mazmur-slot — renders appointed Psalms for the active hour, closes with Anqaşa Birhān
        if (item === 'eth-mazmur-slot') {
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

        // eth-saints-commemoration — scaffold text, then surfaces Ethiopian saints for today
        if (item === 'eth-saints-commemoration') {
            const commComp = appData.components.find(c => c.id === 'eth-saints-commemoration');
            if (commComp) {
                officeHtml += `<span class="rubric-text">Commemoration of Saints</span>`;
                officeHtml += `<span class="component-text">${commComp.text}</span>`;
            }
            if (appData.saints) {
                const ethSaints = appData.saints.filter(s =>
                    s.day && s.day.toLowerCase().includes(todayKeyShort.toLowerCase()) &&
                    s.tradition && s.tradition.toLowerCase().includes('ethiopian')
                );
                if (ethSaints.length > 0) {
                    officeHtml += `<span class="rubric-text">Ethiopian Commemorations Today</span>`;
                    ethSaints.forEach(s => {
                        officeHtml += `<div class="component-text"><strong>${s.name || 'Unknown'}</strong>${s.description ? ' — ' + s.description : ''}</div>`;
                    });
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

        // ── Generic component lookup (handles bcp-salutation, bcp-closing, etc.) ──
        // Display label map: overrides verbose JSON titles that contain parenthetical
        // metadata (rite, minister, office-time) which are internal to the data layer
        // and must not appear in the rendered office.
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
            // compId was transformed (slot/interpolation) but still not found — warn
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

    // Post-sequence Marian (after position)
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
    document.getElementById('date-header').innerText = `Commemorations for ${todayKey}`;

    // Saints / commemorations
    const mIdx  = currentDate.getMonth();
    const month = monthNames[mIdx];
    if (!appData.saints || appData.saintsMonth !== month) {
        try {
            const res = await fetch(`data/saints/saints-${month.toLowerCase()}.json`);
            if (res.ok) { appData.saints = await res.json(); appData.saintsMonth = month; }
        } catch (err) { console.error('Saints load failed:', err); }
    }
    document.getElementById('saint-display').innerHTML = appData.saints
        ?.filter(s => s.day && s.day.toLowerCase().includes(todayKeyShort.toLowerCase()))
        .map(s => `<div class="saint-box"><small style="color:var(--accent); font-weight:bold; text-transform:uppercase;">${s.tradition || 'Unknown'}</small><strong>${s.name || 'Unknown'}</strong><p>${s.description || 'No description'}</p></div>`)
        .join('') || '<p>No commemorations.</p>';
}

function backToSplash() {
    document.getElementById('daily-office-section').style.display       = 'none';
    document.getElementById('individual-prayers-section').style.display = 'none';
    document.getElementById('prayer-display').style.display             = 'none';
    document.body.style.display        = 'flex';
    document.body.style.alignItems     = 'center';
    document.body.style.justifyContent = 'center';
    document.body.style.height         = '100vh';
    document.body.style.overflowY      = 'hidden';
    document.body.classList.remove('office-active');
    document.getElementById('splash-bg').style.display      = 'block';
    document.getElementById('mode-selection').style.display = 'block';
    selectedMode = null;
}