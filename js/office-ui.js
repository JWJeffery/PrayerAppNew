/**
 * OFFICE-UI.JS
 * Core application logic for The Universal Office.
 * Depends on: calendar-engine.js, scripture-resolver.js
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
// Source: BCP 1979 Daily Office Lectionary, Traditional One-Month Psalm Cycle
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
    let hex = '#4a7c59'; // Default: Ordinary (muted green)
    if (color === 'purple') hex = '#6b3070'; // Advent/Lent — deep Byzantine purple
    if (color === 'rose')   hex = '#a04060'; // Gaudete/Laetare — antique rose
    if (color === 'white')  hex = '#c9a84c'; // Christmas/Epiphany — use gold for white seasons
    if (color === 'green')  hex = '#4a7c59'; // Ordinary — forest green
    if (color === 'red')    hex = '#9b2335'; // Pentecost/Martyrs — deep crimson
    document.documentElement.style.setProperty('--accent', hex);
}

// ── Initialization ───────────────────────────────────────────────────────────
async function init() {
    try {
        document.getElementById('office-display').innerHTML =
            `<div class="office-container"><h3>Loading...</h3><p>Preparing your daily office...</p></div>`;
        appData = {};
        const files = ['components', 'rubrics'];
        for (const file of files) {
            const res = await fetch(`data/${file}.json`);
            if (!res.ok) throw new Error(`Missing: data/${file}.json`);
            appData[file] = await res.json();
        }
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
        if (!appData || !appData.rubrics) {
            init();
        } else {
            renderOffice();
        }
    } else if (mode === 'prayers') {
        document.body.style.display = 'block';
        document.body.style.width = '100vw';
        document.body.style.maxWidth = '100vw';
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
    const panel   = document.getElementById('settings-panel');
    const toggle  = document.getElementById('sidebar-toggle');
    const main    = document.getElementById('main-content');
    const hidden  = panel.classList.toggle('sidebar-hidden');
    main.classList.toggle('sidebar-hidden', hidden);
    toggle.style.opacity = hidden ? '0.65' : '0.5';
}

function updateSidebarForOffice() {
    const officeId   = document.querySelector('input[name="office-time"]:checked')?.value || 'morning-office';
    const isMorning  = officeId === 'morning-office';
    const isEvening  = officeId === 'evening-office';
    const isNoonday  = officeId === 'noonday-office';
    const isCompline = officeId === 'compline-office';
    const isMpEp     = isMorning || isEvening;

    function setVisible(id, visible) {
        const el = document.getElementById(id);
        if (!el) return;
        const row = el.closest('label') || el.closest('.nested-group') || el.parentElement;
        if (row) row.style.display = visible ? '' : 'none';
        if (!visible) el.checked = false;
    }

    setVisible('toggle-angelus',              !isCompline);
    setVisible('toggle-trisagion',            isMpEp);
    setVisible('toggle-prayer-before-reading', isMpEp);
    setVisible('toggle-examen',               isCompline);
    setVisible('toggle-kyrie-pantocrator',    isMpEp);
    setVisible('toggle-suffrages',            isMpEp);
    setVisible('toggle-litany',               isMpEp);
    setVisible('toggle-general-thanksgiving', isMpEp);
    setVisible('toggle-chrysostom',           isMpEp);
}

function toggleBcpOnly() {
    const bcpOnly  = document.getElementById('toggle-bcp-only')?.checked || false;
    const sections = ['ecumenical-devotions-section','during-office-section','closing-devotions-section']
        .map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;
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
        darkMode:           document.getElementById('toggle-dark')?.checked || false,
        bcpOnly:            document.getElementById('toggle-bcp-only')?.checked || false,
        officeTime:         document.querySelector('input[name="office-time"]:checked')?.value || 'morning-office',
        rite:               document.querySelector('input[name="rite"]:checked')?.value || 'rite2',
        minister:           document.querySelector('input[name="minister"]:checked')?.value || 'lay',
        marianElement:      document.querySelector('input[name="marian-element"]:checked')?.value || 'none',
        marianPos:          document.querySelector('input[name="marian-antiphon-pos"]:checked')?.value || 'before',
        gloriaPatri:        document.getElementById('toggle-gloria-patri')?.checked || false,
        angelus:            document.getElementById('toggle-angelus')?.checked || false,
        trisagion:          document.getElementById('toggle-trisagion')?.checked || false,
        eastSyriacHours:    document.getElementById('toggle-east-syriac-hours')?.checked || false,
        agpeyaOpening:      document.getElementById('toggle-agpeya-opening')?.checked || false,
        creedType:          document.getElementById('creed-type')?.value || 'bcp-creed-apostles',
        gospelPlacement:    document.querySelector('input[name="gospel-placement"]:checked')?.value || 'evening',
        litany:             document.getElementById('toggle-litany')?.checked || false,
        suffrages:          document.getElementById('toggle-suffrages')?.checked || false,
        psalter30Day:       document.getElementById('toggle-30day-psalter')?.checked || false,
        generalThanksgiving:document.getElementById('toggle-general-thanksgiving')?.checked || false,
        chrysostom:         document.getElementById('toggle-chrysostom')?.checked || false,
        prayerBeforeReading:document.getElementById('toggle-prayer-before-reading')?.checked || false,
        examen:             document.getElementById('toggle-examen')?.checked || false,
        kyriePantocrator:   document.getElementById('toggle-kyrie-pantocrator')?.checked || false
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

    // ── Gather settings ──
    const officeId   = document.querySelector('input[name="office-time"]:checked')?.value || 'morning-office';
    const isMorning  = officeId === 'morning-office';
    const isEvening  = officeId === 'evening-office';
    const isNoonday  = officeId === 'noonday-office';
    const isCompline = officeId === 'compline-office';

    const rite               = document.querySelector('input[name="rite"]:checked')?.value || 'rite2';
    const minister           = document.querySelector('input[name="minister"]:checked')?.value || 'lay';
    const creedSelection     = document.getElementById('creed-type')?.value || 'bcp-creed-apostles';
    const gospelPlacement    = document.querySelector('input[name="gospel-placement"]:checked')?.value || 'evening';
    const marianElement      = document.querySelector('input[name="marian-element"]:checked')?.value || 'none';
    const marianPos          = document.querySelector('input[name="marian-antiphon-pos"]:checked')?.value || 'before';
    const suffragesChecked   = document.getElementById('toggle-suffrages')?.checked || false;
    const greatLitanyChecked = document.getElementById('toggle-litany')?.checked || false;
    const generalThanksgivingChecked = document.getElementById('toggle-general-thanksgiving')?.checked || false;
    const chrysostomChecked  = document.getElementById('toggle-chrysostom')?.checked || false;
    const use30Day           = document.getElementById('toggle-30day-psalter')?.checked || false;

    // ── Calendar lookup ──
    const { season, file, liturgicalColor, litYear } = await CalendarEngine.getSeasonAndFile(currentDate);
    // litYear is now returned by getSeasonAndFile (see calendar-engine.js fix)
    updateSeasonalTheme(liturgicalColor || 'green');

    const dailyData = await CalendarEngine.fetchLectionaryData(currentDate);

    // ── Rubric for this office ──
    const activeRubric = appData.rubrics.find(r => r.id === officeId);

    // ── Calendar info strip ──
    const calendarInfo = document.getElementById('calendar-info');
    if (calendarInfo && dailyData) {
        const litYearLabel = litYear === 'year1' ? 'Year I' : 'Year II';
        calendarInfo.textContent = `${dailyData.title || ''} · ${litYearLabel}`;
    }
    const displayDate = document.getElementById('display-date');
    if (displayDate) {
        displayDate.textContent = todayKey;
    }

    // ── Psalms ──
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

    // ── Marian components ──
    let marianComp = null, theotokionComp = null;
    if (marianElement !== 'none') {
        const marianId = `bcp-marian-antiphon-${season}`;
        marianComp     = appData.components.find(c => c.id === marianId)
                      || appData.components.find(c => c.id === 'bcp-marian-antiphon-ordinary');
        theotokionComp = appData.components.find(c => c.id === `coptic-theotokion-${season}`)
                      || appData.components.find(c => c.id === 'coptic-theotokion');
    }

    // ── Readings — independent morning/evening chains to prevent cross-contamination ──
    const otherYear = litYear === 'year1' ? 'year2' : 'year1';

    let morningOT = dailyData[`reading_ot_mp_${litYear}`]
        || dailyData[`reading_ot_mp_${otherYear}`]
        || dailyData['reading_ot'] || '';
    let morningEpistle = dailyData[`reading_epistle_mp_${litYear}`]
        || dailyData[`reading_epistle_mp_${otherYear}`]
        || dailyData['reading_epistle'] || '';
    let morningGospel = (gospelPlacement === 'morning' || gospelPlacement === 'both')
        ? (dailyData[`reading_gospel_mp_${litYear}`]
            || dailyData[`reading_gospel_mp_${otherYear}`]
            || dailyData['reading_gospel'] || '')
        : '';

    let eveningOT = dailyData[`reading_ot_ep_${litYear}`]
        || dailyData[`reading_ot_ep_${otherYear}`]
        || dailyData['reading_ot'] || '';
    let eveningEpistle = dailyData[`reading_epistle_ep_${litYear}`]
        || dailyData[`reading_epistle_ep_${otherYear}`]
        || dailyData['reading_epistle'] || '';
    let eveningGospel = (gospelPlacement === 'evening' || gospelPlacement === 'both')
        ? (dailyData[`reading_gospel_ep_${litYear}`]
            || dailyData[`reading_gospel_ep_${otherYear}`]
            || dailyData['reading_gospel'] || '')
        : '';

    if (!isMorning) { morningOT = ''; morningEpistle = ''; morningGospel = ''; }
    if (!isEvening && !isCompline && !isNoonday) { eveningOT = ''; eveningEpistle = ''; eveningGospel = ''; }

    // ── Build HTML ──
    let officeHtml = `<div class="office-container"><h2>${activeRubric?.officeName || 'Office'}</h2>`;
    officeHtml += `<p class="liturgical-title">${dailyData.title || 'Day Title'}</p>`;

    // AGPEYA OPENING
    if (document.getElementById('toggle-agpeya-opening')?.checked) {
        const agpeyaComp = appData.components.find(c => c.id === 'agpeya-opening');
        if (agpeyaComp) {
            let t = agpeyaComp.text;
            if (typeof t === 'object') t = t[rite] || t['rite2'] || t['rite1'] || t;
            officeHtml += `<span class="rubric-text">Agpeya Opening</span><span class="component-text">${t}</span>`;
        }
    }

    // EAST SYRIAC PRAYER OF THE HOURS
    if (document.getElementById('toggle-east-syriac-hours')?.checked) {
        const esComp = appData.components.find(c => c.id === 'east-syriac-prayer-of-hours');
        if (esComp) officeHtml += `<span class="rubric-text">Prayer of the Hours</span><span class="component-text">${esComp.text}</span>`;
    }

    // MARIAN ELEMENT — before office
    if (marianElement !== 'none' && marianPos === 'before') {
        if ((marianElement === 'antiphon' || marianElement === 'both') && marianComp) {
            let t = marianComp.text;
            if (typeof t === 'object' && t !== null) t = t[rite] || t['rite2'] || t['rite1'] || 'Marian Antiphon text not found';
            officeHtml += `<span class="rubric-text">Marian Antiphon</span><span class="component-text"><i>${t}</i></span>`;
        }
        if ((marianElement === 'theotokion' || marianElement === 'both') && theotokionComp) {
            officeHtml += `<span class="rubric-text">Theotokion</span><span class="component-text"><i>${theotokionComp.text}</i></span>`;
        }
    }

    const antiphon = isMorning
        ? (dailyData?.antiphon_mp || dailyData?.antiphon || '')
        : (dailyData?.antiphon_ep || dailyData?.antiphon || '');
    if (antiphon) {
        officeHtml += `<span class="rubric-text">Antiphon</span><span class="component-text"><i>${antiphon}</i></span>`;
    }

    // ── Sequence loop ──
    for (let item of activeRubric?.sequence || []) {
        item = item.trim();
        let compId = item.replace('[rite]', rite);

        // Slot resolution
        if (compId === 'bcp-absolution-slot') {
            const ritePrefix = rite === 'rite1' ? 'r1' : 'r2';
            compId = `bcp-absolution-${ritePrefix}-${minister}`;
        } else if (compId === 'bcp-creed-slot') {
            compId = creedSelection;
        } else if (compId === 'bcp-suffrages-slot') {
            if (suffragesChecked) {
                compId = `bcp-suffrages-${rite}`;
            } else {
                continue;
            }
        }

        if (item === 'VARIABLE_OPENING') {
            let openingId = `bcp-opening-${season}`;
            const comp = appData.components.find(c => c.id === openingId)
                      || appData.components.find(c => c.id === 'bcp-opening-general');
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Opening text not found';
            officeHtml += `<span class="rubric-text">Opening Sentence</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'VARIABLE_ANTIPHON') {
            const antiphonText = isMorning
                ? (dailyData?.antiphon_mp || dailyData?.antiphon || '')
                : (dailyData?.antiphon_ep || dailyData?.antiphon || '');
            if (antiphonText) {
                officeHtml += `<span class="rubric-text">Antiphon</span><span class="component-text"><i>${antiphonText}</i></span>`;
            }
            continue;
        }

        // ANGELUS — before Invitatory
        if (item === 'bcp-invitatory-full' && document.getElementById('toggle-angelus')?.checked && !isCompline) {
            const angelusComp = appData.components.find(c => c.id === 'angelus');
            if (angelusComp) {
                let t = angelusComp.text;
                if (typeof t === 'object') t = t[rite] || t['rite2'] || t['rite1'] || t;
                officeHtml += `<span class="rubric-text">The Angelus</span><span class="component-text">${t}</span>`;
            }
        }

        if (item === 'bcp-invitatory-full') {
            let invitatoryId = isMorning ? 'bcp-invitatory-full-mp' : 'bcp-invitatory-full-ep-noon-compline';
            const comp = appData.components.find(c => c.id === invitatoryId);
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Invitatory text not found';
            officeHtml += `<span class="rubric-text">The Invitatory</span><span class="component-text">${displayText}</span>`;

            // ── Invitatory Psalm (Venite / Jubilate) ──
            // BCP rubric: "Then follows one of the Invitatory Psalms, Venite or Jubilate."
            // During Lent, use Jubilate (Psalm 100); on Fridays in Lent, Psalm 95 (full).
            // During Easter (until Pentecost), Pascha Nostrum replaces the invitatory psalm.
            // At Noonday and Compline the invitatory psalm is omitted.
            if (isMorning || isEvening) {
                const isLent = (season === 'lent');
                const isEaster = (season === 'easter');
                const dayOfWeek = currentDate.getDay(); // 0=Sun,5=Fri
                const isFriday = dayOfWeek === 5;

                if (isEaster) {
                    const paschComp = appData.components.find(c => c.id === 'bcp-pascha-nostrum');
                    if (paschComp) {
                        let t = paschComp.text;
                        if (typeof t === 'object') t = t[rite] || t['rite2'] || t['rite1'] || t;
                        officeHtml += `<span class="rubric-text">Christ Our Passover</span><span class="component-text">${t}</span>`;
                    }
                } else if (isLent && isFriday) {
                    // Full Psalm 95 appointed for Friday mornings in Lent
                    const ps95Text = await getScriptureText('Psalm 95');
                    officeHtml += `<span class="rubric-text">Psalm 95</span>`;
                    officeHtml += `<div class="psalm-block">${formatPsalmAsPoetry(ps95Text) || '[Psalm 95 unavailable]'}</div>`;
                } else if (isLent) {
                    const jubComp = appData.components.find(c => c.id === 'bcp-jubilate');
                    if (jubComp) {
                        let t = jubComp.text;
                        if (typeof t === 'object') t = t[rite] || t['rite2'] || t['rite1'] || t;
                        officeHtml += `<span class="rubric-text">Jubilate</span><span class="component-text">${t}</span>`;
                    }
                } else {
                    const veniteComp = appData.components.find(c => c.id === 'bcp-venite');
                    if (veniteComp) {
                        let t = veniteComp.text;
                        if (typeof t === 'object') t = t[rite] || t['rite2'] || t['rite1'] || t;
                        officeHtml += `<span class="rubric-text">Venite</span><span class="component-text">${t}</span>`;
                    }
                }
            }
            continue;
        }

        if (item === 'bcp-phos-hilaron') {
            const comp = appData.components.find(c => c.id === 'bcp-phos-hilaron');
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Phos Hilaron not found';
            officeHtml += `<span class="rubric-text">Phos Hilaron</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'VARIABLE_PSALM') {
            if (psalms) {
                let psalmRefs = psalms.split(',').map(p => p.trim());
                let psalmHtml = '';
                const rubricTitle = psalmRefs.length > 1 ? 'The Psalms' : 'The Psalm';
                psalmHtml += `<span class="rubric-text">${rubricTitle}</span>`;
                for (let psalm of psalmRefs) {
                    // Strip any leading "Psalm " / "psalm " prefix before normalising
                    let psalmId = psalm.replace(/^psalm\s+/i, '').trim().toUpperCase();
                    psalmId = 'PSALM ' + psalmId;
                    const fullText = await getScriptureText(psalmId);
                    psalmHtml += `<h4 class="passage-reference">Psalm ${psalmId.replace(/^PSALM\s+/i, '').replace(/:\d+-\d+[a-z]?(\(\d+-\d+[a-z]?\))?/gi, '')}</h4>`;
                    psalmHtml += `<div class="psalm-block">${formatPsalmAsPoetry(fullText) || 'No psalm text found'}</div>`;
                    if (document.getElementById('toggle-gloria-patri')?.checked) {
                        const gloria = appData.components.find(c => c.id === 'bcp-gloria-patri');
                        let gloriaText = gloria ? (gloria.text[rite] || gloria.text['rite2'] || '(Gloria Patri)') : '(Gloria Patri not found)';
                        psalmHtml += `<span class="component-text"><i>${gloriaText}</i></span>`;
                    }
                }
                officeHtml += psalmHtml;
            }
            continue;
        }

        if (item === 'VARIABLE_READING_OT') {
            if (document.getElementById('toggle-prayer-before-reading')?.checked) {
                const pbrComp = appData.components.find(c => c.id === 'orthodox-prayer-before-reading');
                if (pbrComp) officeHtml += `<span class="rubric-text">Prayer Before Reading</span><span class="component-text">${pbrComp.text}</span>`;
            }
            let reading = isMorning ? morningOT : eveningOT;
            if (reading) {
                officeHtml += `<span class="rubric-text">The Old Testament Lesson</span>`;
                officeHtml += `<h4 class="passage-reference">${reading}</h4>`;
                const fullText = await getScriptureText(reading);
                officeHtml += `<div class="reading-text">${formatScriptureAsFlow(fullText) || '<p>No reading appointed</p>'}</div>`;
                officeHtml += '<div class="ornamental-divider"><div class="div-line-left"></div><span class="ornamental-divider-glyph">✦ ✝ ✦</span><div class="div-line-right"></div></div>';
            }
            continue;
        }

        if (item === 'VARIABLE_READING_EPISTLE') {
            let reading = isMorning ? morningEpistle : eveningEpistle;
            if (reading) {
                officeHtml += `<span class="rubric-text">The Epistle</span>`;
                officeHtml += `<h4 class="passage-reference">${reading}</h4>`;
                const fullText = await getScriptureText(reading);
                officeHtml += `<div class="reading-text">${formatScriptureAsFlow(fullText) || '<p>No reading appointed</p>'}</div>`;
                officeHtml += '<div class="ornamental-divider"><div class="div-line-left"></div><span class="ornamental-divider-glyph">✦ ✝ ✦</span><div class="div-line-right"></div></div>';
            }
            continue;
        }

        if (item === 'VARIABLE_READING_GOSPEL') {
            let reading = isMorning ? morningGospel : eveningGospel;
            if (reading) {
                officeHtml += `<span class="rubric-text">The Holy Gospel</span>`;
                officeHtml += `<h4 class="passage-reference">${reading}</h4>`;
                const fullText = await getScriptureText(reading);
                officeHtml += `<div class="reading-text">${formatScriptureAsFlow(fullText) || '<p>No reading appointed</p>'}</div>`;
                officeHtml += '<div class="ornamental-divider"><div class="div-line-left"></div><span class="ornamental-divider-glyph">✦ ✝ ✦</span><div class="div-line-right"></div></div>';
            }
            continue;
        }

        if (item === 'VARIABLE_CANTICLE1') {
            let canticleId = isMorning ? 'bcp-te-deum' : 'bcp-magnificat';
            const comp = appData.components.find(c => c.id === canticleId);
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Canticle not found';
            officeHtml += `<span class="rubric-text">Canticle</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'VARIABLE_CANTICLE2') {
            let canticleId = isMorning ? 'bcp-benedictus' : 'bcp-nunc-dimittis';
            const comp = appData.components.find(c => c.id === canticleId);
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Canticle not found';
            officeHtml += `<span class="rubric-text">Canticle</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'bcp-lords-prayer') {
            const comp = appData.components.find(c => c.id === 'bcp-lords-prayer');
            let displayText = comp ? (comp.text[rite] || comp.text) : "Lord's Prayer not found";
            officeHtml += `<span class="rubric-text">The Lord's Prayer</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'bcp-kyrie') {
            const comp = appData.components.find(c => c.id === 'bcp-kyrie');
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Kyrie not found';
            officeHtml += `<span class="rubric-text">Kyrie</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'bcp-salutation') {
            const comp = appData.components.find(c => c.id === 'bcp-salutation');
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Salutation not found';
            officeHtml += `<span class="rubric-text">Salutation</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'VARIABLE_WEEKDAY_COLLECT') {
            let collectId = isMorning ? 'bcp-collect-grace' : 'bcp-collect-peace';
            const comp = appData.components.find(c => c.id === collectId);
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Weekday Collect not found';
            officeHtml += `<span class="rubric-text">Weekday Collect</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'VARIABLE_MISSION_PRAYER') {
            const comp = appData.components.find(c => c.id === 'bcp-mission-prayer-1');
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Prayer for Mission not found';
            officeHtml += `<span class="rubric-text">Prayer for Mission</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'bcp-litany') {
            if (greatLitanyChecked) {
                const comp = appData.components.find(c => c.id === 'bcp-litany');
                let displayText = comp ? (comp.text[rite] || comp.text) : 'Great Litany not found';
                officeHtml += `<span class="rubric-text">The Great Litany</span><span class="component-text">${displayText}</span>`;
            }
            continue;
        }

        if (item === 'bcp-general-thanksgiving') {
            if (generalThanksgivingChecked) {
                const comp = appData.components.find(c => c.id === 'bcp-general-thanksgiving');
                let displayText = comp ? (comp.text[rite] || comp.text) : 'General Thanksgiving not found';
                officeHtml += `<span class="rubric-text">General Thanksgiving</span><span class="component-text">${displayText}</span>`;
            }
            continue;
        }

        if (item === 'bcp-chrysostom') {
            if (chrysostomChecked) {
                const comp = appData.components.find(c => c.id === 'bcp-chrysostom');
                let displayText = comp ? (comp.text[rite] || comp.text) : 'Prayer of St. Chrysostom not found';
                officeHtml += `<span class="rubric-text">Prayer of St. Chrysostom</span><span class="component-text">${displayText}</span>`;
            }
            continue;
        }

        if (item === 'bcp-closing') {
            const comp = appData.components.find(c => c.id === 'bcp-closing');
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Closing not found';
            officeHtml += `<span class="rubric-text">Closing</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'bcp-opening-blessing') {
            const comp = appData.components.find(c => c.id === 'bcp-opening-blessing-compline');
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Opening Blessing not found';
            officeHtml += `<span class="rubric-text">Opening Blessing</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'bcp-versicles-before-prayers') {
            const comp = appData.components.find(c => c.id === 'bcp-versicles-before-prayers-compline');
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Versicles not found';
            officeHtml += `<span class="rubric-text">Versicles</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'bcp-nunc-dimittis') {
            const comp = appData.components.find(c => c.id === 'bcp-nunc-dimittis');
            let displayText = comp ? (comp.text[rite] || comp.text) : 'Nunc Dimittis not found';
            officeHtml += `<span class="rubric-text">Nunc Dimittis</span><span class="component-text">${displayText}</span>`;
            continue;
        }

        if (item === 'VARIABLE_COLLECT') {
            officeHtml += `<span class="rubric-text">The Collect</span>`;
            let collectId = dailyData.collect || 'collect-default-ferial';

            // Manual mapping for Transfiguration naming mismatch
            if (collectId === 'collect-transfiguration') {
                collectId = 'collect-the-transfiguration-of-our-lord';
            }

            const collectComp = appData.components.find(c => c.id === collectId);
            if (collectComp) {
                let displayText = collectComp.text;
                if (typeof displayText === 'object' && displayText !== null) {
                    displayText = displayText[rite] || displayText['rite2'] || displayText['rite1'] || 'Collect text not found';
                } else {
                    displayText = displayText || 'Collect text not found';
                }
                officeHtml += `<span class="component-text">${displayText}</span>`;
            } else {
                officeHtml += `<span class="component-text">No collect appointed</span>`;
                console.log('Collect ID not found: ' + collectId);
            }
            officeHtml += '<div class="ornamental-divider"><div class="div-line-left"></div><span class="ornamental-divider-glyph">✦ ✝ ✦</span><div class="div-line-right"></div></div>';

            // EXAMEN — Compline only
            if (isCompline && document.getElementById('toggle-examen')?.checked) {
                const examenComp = appData.components.find(c => c.id === 'ignatian-examen');
                if (examenComp) {
                    const examenHtml = examenComp.text.replace(/\n\n/g, '<br><br>');
                    officeHtml += `<span class="rubric-text">The Examen</span><div class="component-text" style="white-space:normal">${examenHtml}</div>`;
                }
            }
            // KYRIE PANTOCRATOR — MP/EP only
            if (!isCompline && !isNoonday && document.getElementById('toggle-kyrie-pantocrator')?.checked) {
                const kyrieComp = appData.components.find(c => c.id === 'eastern-kyrie-pantocrator');
                if (kyrieComp) officeHtml += `<span class="rubric-text">Kyrie Pantocrator</span><span class="component-text">${kyrieComp.text}</span>`;
            }
            continue;
        }

        // Generic component fallback
        let comp = appData.components.find(c => c.id === compId);
        if (comp) {
            let displayText = comp.text;
            if (typeof displayText === 'object' && displayText !== null) {
                displayText = displayText[rite] || displayText['rite2'] || displayText['rite1'] || 'Text not found';
            } else {
                displayText = displayText || 'Text not found';
            }
            officeHtml += `<span class="rubric-text">${comp.title || compId}</span><span class="component-text">${displayText}</span>`;
        } else {
            officeHtml += `<span class="rubric-text">Component not found: ${compId}</span>`;
        }

        // TRISAGION — after Absolution
        if (item === 'bcp-absolution-slot' && document.getElementById('toggle-trisagion')?.checked) {
            const trisComp = appData.components.find(c => c.id === 'trisagion-byzantine');
            if (trisComp) {
                let t = trisComp.text;
                if (typeof t === 'object') t = t[rite] || t['rite2'] || t['rite1'] || t;
                officeHtml += `<span class="rubric-text">Trisagion</span><span class="component-text">${t}</span>`;
            }
        }
    }

    // MARIAN ELEMENT — after office
    if (marianElement !== 'none' && marianPos === 'after') {
        if ((marianElement === 'antiphon' || marianElement === 'both') && marianComp) {
            let t = marianComp.text;
            if (typeof t === 'object' && t !== null) t = t[rite] || t['rite2'] || t['rite1'] || 'Marian Antiphon text not found';
            officeHtml += `<span class="rubric-text">Marian Antiphon</span><span class="component-text"><i>${t}</i></span>`;
        }
        if ((marianElement === 'theotokion' || marianElement === 'both') && theotokionComp) {
            officeHtml += `<span class="rubric-text">Theotokion</span><span class="component-text"><i>${theotokionComp.text}</i></span>`;
        }
    }

    document.getElementById('office-display').innerHTML = officeHtml + `</div>`;
    document.getElementById('date-header').innerText = `Commemorations for ${todayKey}`;

    // ── Saints ──
    const monthIndex = currentDate.getMonth();
    const month      = monthNames[monthIndex];
    if (!appData.saints || appData.saintsMonth !== month) {
        try {
            const file = `saints-${month.toLowerCase()}.json`;
            const res  = await fetch(`data/saints/${file}`);
            if (!res.ok) throw new Error(`Failed to load ${file}`);
            appData.saints      = await res.json();
            appData.saintsMonth = month;
        } catch (err) {
            console.error('Saints load failed:', err);
            document.getElementById('saint-display').innerHTML = '<p>No commemorations for today.</p>';
            return;
        }
    }
    document.getElementById('saint-display').innerHTML = appData.saints
        .filter(s => s.day && s.day.toLowerCase().includes(todayKeyShort.toLowerCase()))
        .map(s => `
            <div class="saint-box">
                <small style="color:var(--accent); font-weight:bold; text-transform:uppercase;">${s.tradition || 'Unknown'}</small>
                <strong>${s.name || 'Unknown'}</strong>
                <p>${s.description || 'No description'}</p>
            </div>
        `).join('') || '<p>No commemorations for today.</p>';
}

// ── Back to Splash ───────────────────────────────────────────────────────────
function backToSplash() {
    document.getElementById('daily-office-section').style.display  = 'none';
    document.getElementById('individual-prayers-section').style.display = 'none';
    document.getElementById('prayer-display').style.display        = 'none';
    document.body.style.display    = 'flex';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
    document.body.style.height     = '100vh';
    document.body.style.overflowY  = 'hidden';
    document.body.classList.remove('office-active');
    document.getElementById('splash-bg').style.display    = 'block';
    document.getElementById('mode-selection').style.display = 'block';
    selectedMode = null;
}

// init() is called only when Daily Office mode is selected