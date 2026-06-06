/**
 * PRAYERS.JS
 * Book of Needs — UI logic for individual prayer display.
 * Prayer text data lives in data/prayers.json (loaded on demand).
 */

let prayersData = null; // cache

const BOOK_OF_NEEDS_CONTEXTS = {
    UNIVERSAL: {
        label: 'Universal Office Selector',
        note: 'Showing prayers from all available traditions.',
        returnText: 'Back to Modes'
    },
    ANG: {
        label: 'The Episcopal Church',
        note: 'Showing prayers explicitly tagged for Anglican/Episcopal use.',
        empty: 'No Anglican/Episcopal prayers are available in this section yet.',
        returnText: 'Back to Office'
    },
    OO: {
        label: 'Oriental Orthodoxy',
        note: 'Showing prayers explicitly tagged for Oriental Orthodox use.',
        empty: 'No Oriental Orthodox prayers are available in this section yet.',
        returnText: 'Back to Office'
    },
    COE: {
        label: 'Church of the East',
        note: 'Showing prayers explicitly tagged for Church of the East use.',
        empty: 'No Church of the East prayers are available in this section yet.',
        returnText: 'Back to Office'
    },
    EO: {
        label: 'Eastern Orthodoxy',
        note: 'Showing prayers explicitly tagged for Eastern Orthodox use.',
        empty: 'No Eastern Orthodox prayers are available in this section yet.',
        returnText: 'Back to Office'
    }
};

const BOOK_OF_NEEDS_OPTION_TRADITIONS = {
    'prayer-humble-access': ['ANG'],
    'spiritual-communion': ['ANG'],
    'thanksgiving-aquinas': ['LC'],
    'thanksgiving-hooker': ['ANG'],
    'thanksgiving-andrewes': ['ANG'],
    'thanksgiving-basil': ['EO', 'OO'],
    'o-salutaris': ['LC'],
    'tantum-ergo': ['LC'],
    'divine-praises': ['LC'],
    'anima-christi': ['LC'],
    'to-blessed-virgin': ['LC'],
    'to-saint-joseph': ['LC'],
    'in-sorrow-or-trouble': ['LC'],
    'ave-regina': ['LC'],
    'act-of-contrition': ['LC'],
    'after-neglect': ['LC'],
    'andrewes-commendation': ['ANG'],
    'andrewes-thanksgiving': ['ANG'],
    'andrewes-penitence': ['ANG'],
    'andrewes-petition': ['ANG'],
    'prayer-for-the-sick': [],
    'prayer-for-peace': [],
    'prayer-for-unity': [],
    'prayer-for-mission': [],
    'prayer-for-guidance': [],
    'prayer-for-the-church': [],
    'prayer-for-the-world': [],
    'minister-journey-bcp': ['ANG'],
    'minister-journey-orthodox': ['EO'],
    'minister-entering-bcp': ['ANG'],
    'minister-entering-orthodox': ['EO'],
    'vesting-amice': ['ANG'],
    'vesting-alb': ['ANG'],
    'vesting-cincture': ['ANG'],
    'vesting-stole-deacon': ['ANG'],
    'vesting-stole-priest': ['ANG'],
    'vesting-chasuble': ['ANG'],
    'vesting-orthodox-epitrachelion': ['EO'],
    'vesting-orthodox-phailonion': ['EO'],
    'vesting-orthodox-full': ['EO'],
    'minister-before-serving-bcp': ['ANG'],
    'minister-before-serving-orthodox': ['EO'],
    'minister-before-serving-deacon': ['EO'],
    'minister-after-serving-bcp': ['ANG'],
    'minister-after-serving-orthodox': ['EO']
};

function normalizeBookOfNeedsContext(context) {
    return BOOK_OF_NEEDS_CONTEXTS[context] ? context : 'UNIVERSAL';
}

function prayerOptionAppliesToContext(option, context) {
    if (context === 'UNIVERSAL') return true;

    const prayerId = option.dataset.value;
    const traditions = BOOK_OF_NEEDS_OPTION_TRADITIONS[prayerId] || [];
    option.dataset.traditions = traditions.join(' ');

    return traditions.includes(context);
}

function updatePrayerGroupVisibility() {
    const labels = [...document.querySelectorAll('.prayer-optgroup-label')];

    for (const label of labels) {
        let hasVisibleOption = false;
        let node = label.nextElementSibling;

        while (node && !node.classList.contains('prayer-optgroup-label')) {
            if (node.classList.contains('prayer-option') && !node.hidden) {
                hasVisibleOption = true;
                break;
            }
            node = node.nextElementSibling;
        }

        label.hidden = !hasVisibleOption;
        label.setAttribute('aria-hidden', hasVisibleOption ? 'false' : 'true');
    }
}

function resetPrayerSelectionIfHidden() {
    const selectedId = document.getElementById('prayer-dropdown')?.value;
    if (!selectedId) return;

    const selectedOption = [...document.querySelectorAll('.prayer-option')]
        .find(option => option.dataset.value === selectedId);

    if (!selectedOption || selectedOption.hidden) {
        document.querySelectorAll('.prayer-option').forEach(option => option.classList.remove('selected'));
        document.getElementById('prayer-dropdown').value = '';
        document.getElementById('prayer-select-label').textContent = '— Choose a Prayer —';
    }
}

function applyBookOfNeedsContext(context = 'UNIVERSAL') {
    const normalizedContext = normalizeBookOfNeedsContext(context);
    const config = BOOK_OF_NEEDS_CONTEXTS[normalizedContext];

    document.getElementById('book-needs-context-label').textContent = config.label;
    document.getElementById('book-needs-scope-note').textContent = config.note;

    const returnButton = document.getElementById('book-needs-return-button');
    if (returnButton) returnButton.textContent = config.returnText;

    for (const option of document.querySelectorAll('.prayer-option')) {
        const prayerId = option.dataset.value;
        const traditions = BOOK_OF_NEEDS_OPTION_TRADITIONS[prayerId] || [];
        option.dataset.traditions = traditions.join(' ');

        const visible = prayerOptionAppliesToContext(option, normalizedContext);
        option.hidden = !visible;
        option.setAttribute('aria-hidden', visible ? 'false' : 'true');
    }

    updatePrayerGroupVisibility();
    resetPrayerSelectionIfHidden();

    const visibleCount = [...document.querySelectorAll('.prayer-option')]
        .filter(option => !option.hidden).length;

    const list = document.getElementById('prayer-select-list');
    if (list) list.dataset.activeTradition = normalizedContext;
    if (list) list.dataset.visiblePrayerCount = String(visibleCount);

    const emptyState = document.getElementById('book-needs-empty-state');
    if (emptyState) {
        emptyState.textContent = visibleCount === 0
            ? (config.empty || 'No prayers have been tagged for this tradition yet.')
            : '';
        emptyState.hidden = visibleCount !== 0;
        emptyState.setAttribute('aria-hidden', visibleCount === 0 ? 'false' : 'true');
    }

    const wrapper = document.getElementById('prayer-select-wrapper');
    if (wrapper) {
        wrapper.hidden = visibleCount === 0;
        wrapper.setAttribute('aria-hidden', visibleCount === 0 ? 'true' : 'false');
    }

    const displayButton = document.getElementById('book-needs-display-button');
    if (displayButton) {
        displayButton.disabled = visibleCount === 0;
        displayButton.setAttribute('aria-disabled', visibleCount === 0 ? 'true' : 'false');
    }
}

function resetBookOfNeedsView() {
    document.getElementById('prayer-display').style.display = 'none';
    document.getElementById('prayer-back-bar').style.display = 'none';
    document.getElementById('individual-prayers-section').style.justifyContent = 'center';
    document.getElementById('individual-prayers-section').style.paddingTop = '0';
    document.getElementById('prayer-selection').style.display = 'block';
    document.getElementById('prayer-select-list')?.classList.remove('open');
}

window.applyBookOfNeedsContext = applyBookOfNeedsContext;
window.resetBookOfNeedsView = resetBookOfNeedsView;


// ── Dropdown Interaction ─────────────────────────────────────────────────────
function togglePrayerDropdown() {
    document.getElementById('prayer-select-list').classList.toggle('open');
}

function selectPrayer(el) {
    if (!el || el.hidden || el.getAttribute('aria-hidden') === 'true') return;

    document.querySelectorAll('.prayer-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('prayer-select-label').textContent = el.textContent;
    document.getElementById('prayer-dropdown').value = el.dataset.value;
    document.getElementById('prayer-select-list').classList.remove('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const wrapper = document.getElementById('prayer-select-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('prayer-select-list')?.classList.remove('open');
    }
});

// ── Display Prayer ───────────────────────────────────────────────────────────
async function showSinglePrayer() {
    const prayerId = document.getElementById('prayer-dropdown').value;
    if (!prayerId) {
        alert('Please select a prayer first.');
        return;
    }

    const selectedOption = [...document.querySelectorAll('.prayer-option')]
        .find(option => option.dataset.value === prayerId);

    if (selectedOption?.hidden) {
        alert('That prayer is not available in the current tradition context.');
        return;
    }

    // Load prayers.json if not already cached
    if (!prayersData) {
        try {
            const res = await fetch('data/prayers.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            prayersData = await res.json();
        } catch (err) {
            console.error('Failed to load prayers.json:', err);
            document.getElementById('single-prayer-content').innerHTML =
                `<div class="office-container"><h2>Error</h2><p>Could not load prayer data.</p></div>`;
            return;
        }
    }

    const prayer      = prayersData[prayerId];
    const selectedLabel = document.getElementById('prayer-select-label').textContent;
    const prayerTitle = prayer ? prayer.title : selectedLabel;
    const prayerSource = prayer
        ? `<p style="font-family:'Cinzel',serif; font-size:0.72em; letter-spacing:0.12em; text-transform:uppercase; color:#a89878; margin-top:-10px; margin-bottom:28px;">${prayer.source}</p>`
        : '';
    const prayerText  = prayer ? prayer.text : 'Prayer text not found.';

    document.getElementById('single-prayer-content').innerHTML = `
        <div class="office-container">
            <h2>${prayerTitle}</h2>
            ${prayerSource}
            <span class="component-text">${prayerText}</span>
        </div>`;

    document.getElementById('prayer-display').style.display        = 'flex';
    document.getElementById('prayer-display').style.flexDirection  = 'column';
    document.getElementById('prayer-display').style.alignItems     = 'center';
    document.getElementById('prayer-selection').style.display      = 'none';
    document.getElementById('individual-prayers-section').style.justifyContent = 'flex-start';
    document.getElementById('individual-prayers-section').style.paddingTop     = '60px';
    document.getElementById('individual-prayers-section').scrollTop = 0;
    document.getElementById('prayer-back-bar').style.display       = 'block';
}

// ── Navigation ───────────────────────────────────────────────────────────────
function backToPrayerDropdown() {
    document.getElementById('prayer-display').style.display        = 'none';
    document.getElementById('prayer-back-bar').style.display       = 'none';
    document.getElementById('individual-prayers-section').style.justifyContent = 'center';
    document.getElementById('individual-prayers-section').style.paddingTop     = '0';
    document.getElementById('prayer-selection').style.display      = 'block';
}