/**
 * PRAYERS.JS
 * Book of Needs — UI logic for individual prayer display.
 * Prayer text data lives in data/prayers.json (loaded on demand).
 */

let prayersData = null; // cache

const BOOK_OF_NEEDS_TAXONOMY_VERSION = 1;

const BOOK_OF_NEEDS_TRADITION_CODES = Object.freeze({
    ANG: 'The Episcopal Church',
    LC: 'Latin Catholic',
    EO: 'Eastern Orthodoxy',
    OO: 'Oriental Orthodoxy',
    COE: 'Church of the East'
});

const BOOK_OF_NEEDS_ALLOWED_TRADITIONS = new Set(Object.keys(BOOK_OF_NEEDS_TRADITION_CODES));

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
    LC: {
        label: 'Latin Catholic',
        note: 'Showing prayers explicitly tagged for Latin Catholic use.',
        empty: 'No Latin Catholic prayers are available in this section yet.',
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
    'prayer-for-the-sick': ['ANG'],
    'prayer-for-peace': ['ANG'],
    'prayer-for-unity': ['ANG'],
    'prayer-for-mission': ['ANG'],
    'prayer-for-guidance': ['ANG'],
    'prayer-for-the-church': ['ANG'],
    'prayer-for-the-world': ['ANG'],
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
    'minister-after-serving-orthodox': ['EO'],
    'jesus-prayer': ['EO'],
    'trisagion-prayers': ['EO'],
    'prayer-of-st-mardarios': ['EO'],
    'prayer-of-st-philaret': ['EO'],
    'prayer-of-st-ephrem': ['EO'],
    'prayer-for-every-hour': ['EO'],
    'orthodox-before-reading-scripture': ['EO'],
    'orthodox-before-work': ['EO'],
    'orthodox-before-study': ['EO'],
    'prayer-of-st-john-chrysostom': ['EO'],
    'prayer-of-st-macarius': ['EO'],
    'prayer-of-st-basil': ['EO'],
    'prayer-to-guardian-angel': ['EO'],
    'orthodox-before-meals': ['EO'],
    'orthodox-after-meals': ['EO'],
    'orthodox-blessing-before-meal': ['EO'],
    'orthodox-thanksgiving-after-meal': ['EO'],
    'orthodox-before-journey': ['EO'],
    'orthodox-prayer-of-sick-person': ['EO'],
    'orthodox-prayer-for-sick-person': ['EO'],
    'orthodox-after-work': ['EO'],
    'orthodox-thanksgiving-after-recovery': ['EO'],
    'orthodox-for-times-of-need': ['EO'],
    'orthodox-for-times-of-trouble': ['EO'],
    'orthodox-for-times-of-temptation': ['EO'],
    'armenian-for-the-sick': ['OO'],
    'armenian-prayer-against-troubles': ['OO'],
    'armenian-for-travellers': ['OO'],
    'armenian-prayer-before-work': ['OO'],
    'coe-prayer-for-a-journey': ['COE'],
    'coe-prayer-while-travelling': ['COE'],
    'coe-prayer-of-repentance': ['COE'],
    'coe-prayer-for-students': ['COE'],
    'coe-maclean-prayer-kissing-cross': ['COE'],
    'coe-maclean-prayer-kissing-gospel': ['COE'],
    'coe-maclean-prayer-kissing-tomb': ['COE'],
    'coe-maclean-prayer-for-a-journey': ['COE'],
    'coe-maclean-prayer-boat-or-ship': ['COE'],
    'coe-maclean-prayer-for-himself': ['COE'],
    'coe-maclean-prayer-for-rain': ['COE'],
    'coe-maclean-prayer-for-crops': ['COE'],
    'coe-maclean-prayer-for-the-sick': ['COE'],
    'coe-maclean-prayer-for-infants': ['COE'],
    'coe-maclean-grace-before-meat': ['COE'],
    'coe-maclean-grace-after-meat': ['COE'],
    'coe-maclean-prayer-for-one-tempted': ['COE'],
    'coe-maclean-prayer-over-wine': ['COE'],
    'coe-maclean-prayer-oil-of-healing': ['COE'],
    'coe-maclean-prayer-for-a-reader': ['COE'],
    'coe-maclean-prayer-for-the-faithful': ['COE'],
    'coe-maclean-prayer-for-a-house': ['COE'],
    'coe-maclean-prayer-priest-washes-hands': ['COE'],
    'coe-maclean-prayer-in-fevers': ['COE'],
    'coe-maclean-prayer-hallowing-water': ['COE'],
    'coe-maclean-prayer-bride-forty-days': ['COE'],
    'coe-maclean-blessing-boy-forty-days': ['COE'],
    'coe-maclean-prayer-woman-seeking-prayers': ['COE'],
    'coe-maclean-prayer-new-cloths-vessels': ['COE']
};

// Real role gating, added 2026-08-30 at Josh's direction, following the
// profile.ministryRole field added the same day in js/office-ui.js.
//
// UPDATED 2026-08-30, same day: replaced the original binary Set (a prayer
// either needed no role, or needed "clergy or all") with a per-prayer
// minimum-tier map, after Josh asked for the major/minor-order distinction
// to be researched and then built. Confirmed (see documentation/book-of-
// needs-role-access-governance.json's majorOrderClassification) that reader
// and subdeacon are minor orders -- not fully/sacramentally ordained --
// while deacon, priest, and bishop are the major orders, both generally in
// Eastern Christian tradition and specifically for the Church of the East.
// The old binary let a self-identified "clergy" deacon or subdeacon see
// full priest-tier material, directly violating this same governance
// document's own principle ("Subdeacon access must not unlock deaconal,
// priestly, or episcopal material merely because the user is not a
// layperson"). Checked every one of the 13 prayers below against its own
// text and rubric rather than re-guessing: all 13 are performed BY a priest
// (over an object, a person, or the assembly) -- none is deacon-, subdeacon-,
// or reader-specific material -- so all map to 'priest'. That is a real
// finding, not an assumption: e.g. coe-maclean-prayer-priest-washes-hands is
// explicitly titled "when a Priest washes his hands," and coe-maclean-
// prayer-for-a-reader, despite its title, is a blessing spoken OVER a reader
// by whoever presides, not a prayer a reader says of himself -- the
// beneficiary of a prayer and the minimum rank required to say it are not
// the same question, and were checked separately for each entry.
//
// Everything else in BOOK_OF_NEEDS_OPTION_TRADITIONS above is lay-open with
// no entry here at all, which is the common case and needs no per-prayer
// bookkeeping.
const BOOK_OF_NEEDS_OPTION_MINIMUM_TIER = new Map([
    ['coe-maclean-prayer-for-one-tempted',       'priest'], // first-person exorcistic address over another
    ['coe-maclean-prayer-over-wine',             'priest'], // blessing of an object
    ['coe-maclean-prayer-oil-of-healing',        'priest'], // sacramental unction-adjacent blessing
    ['coe-maclean-prayer-for-a-reader',          'priest'], // blessing spoken OVER a reader by the one presiding, not by the reader himself
    ['coe-maclean-prayer-for-the-faithful',      'priest'], // benediction pronounced over an assembly
    ['coe-maclean-prayer-for-a-house',           'priest'], // clergy-administered house blessing
    ['coe-maclean-prayer-priest-washes-hands',   'priest'], // explicitly "when a priest... at the liturgy"
    ['coe-maclean-prayer-in-fevers',             'priest'], // first-person exorcistic address over another
    ['coe-maclean-prayer-hallowing-water',       'priest'], // explicit "He makes the sign of the cross on the water"
    ['coe-maclean-prayer-bride-forty-days',      'priest'], // explicit "He makes the sign of the cross on her head"
    ['coe-maclean-blessing-boy-forty-days',      'priest'], // explicitly modelled on the priestly Presentation rite
    ['coe-maclean-prayer-woman-seeking-prayers', 'priest'], // explicitly "given though the priesthood"
    ['coe-maclean-prayer-new-cloths-vessels',    'priest'], // explicitly "for priestly use", altar furnishings
]);

// Rank order for the major-order ladder, mirrored from
// UNIVERSAL_OFFICE_MINISTRY_ROLE_ORDER in js/office-ui.js so this file does
// not have to depend on load order to read it. Kept in sync manually --
// both are small and change rarely; see that file's own comment for the
// full reasoning on why 'monastic' sits at 0 and 'research-reference' at 5.
const BOOK_OF_NEEDS_ROLE_ORDER = {
    'lay': 0, 'reader': 1, 'subdeacon': 2, 'deacon': 3, 'priest': 4, 'bishop': 5,
    'monastic': 0, 'research-reference': 5, 'all': 5,
};

function getUserMinistryRole() {
    try {
        if (typeof getUserProfileDefaults === 'function') {
            return getUserProfileDefaults().ministryRole || 'lay';
        }
    } catch (_error) {
        // fall through to default below
    }
    return 'lay';
}

// CHANGED 2026-09-05, at Josh's direction: this is a FILTER, not a BAR.
// Previously an access control -- a lay profile could not reach priestly
// material by any route. Josh: "It isn't that we do not want a lay person
// being able to see Priestly prayers... we don't need to bar them. But we
// don't need to show them unnecessary content that they do not want to see."
// The role now decides what is shown BY DEFAULT; one toggle shows the rest.
let bookOfNeedsShowAboveRole = false;

function setBookOfNeedsShowAboveRole(show) {
    bookOfNeedsShowAboveRole = !!show;
    // Re-apply the current context so newly visible options, their group
    // labels and any now-invalid selection are recomputed by the one
    // function that already owns that logic.
    try { applyBookOfNeedsContext(currentBookOfNeedsContext || 'UNIVERSAL'); }
    catch (_error) { /* caller re-renders */ }
}

function prayerOptionMeetsRoleRequirement(prayerId) {
    const requiredTier = BOOK_OF_NEEDS_OPTION_MINIMUM_TIER.get(prayerId);
    if (!requiredTier) return true; // no entry here at all -- the common, lay-open case
    if (bookOfNeedsShowAboveRole) return true; // the user has asked to see everything
    const role = getUserMinistryRole();
    const userRank = BOOK_OF_NEEDS_ROLE_ORDER[role] ?? 0;
    const requiredRank = BOOK_OF_NEEDS_ROLE_ORDER[requiredTier] ?? 99;
    return userRank >= requiredRank;
}

function normalizeBookOfNeedsContext(context) {
    return BOOK_OF_NEEDS_CONTEXTS[context] ? context : 'UNIVERSAL';
}

function getBookOfNeedsTraditionsForPrayer(prayerId) {
    const traditions = BOOK_OF_NEEDS_OPTION_TRADITIONS[prayerId];

    if (!Array.isArray(traditions)) {
        console.warn(`[Book of Needs taxonomy] Missing tradition assignment for ${prayerId}.`);
        return [];
    }

    return traditions.filter(code => {
        const known = BOOK_OF_NEEDS_ALLOWED_TRADITIONS.has(code);

        if (!known) {
            console.warn(`[Book of Needs taxonomy] Unknown tradition code "${code}" for ${prayerId}.`);
        }

        return known;
    });
}

function prayerOptionAppliesToContext(option, context) {
    if (context !== 'UNIVERSAL') {
        const prayerId = option.dataset.value;
        const traditions = getBookOfNeedsTraditionsForPrayer(prayerId);
        option.dataset.traditions = traditions.join(' ');

        if (!traditions.includes(context)) return false;
    }

    return prayerOptionMeetsRoleRequirement(option.dataset.value);
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

let currentBookOfNeedsContext = 'UNIVERSAL';

function applyBookOfNeedsContext(context = 'UNIVERSAL') {
    const normalizedContext = normalizeBookOfNeedsContext(context);
    currentBookOfNeedsContext = normalizedContext;
    const config = BOOK_OF_NEEDS_CONTEXTS[normalizedContext];

    document.getElementById('book-needs-context-label').textContent = config.label;
    document.getElementById('book-needs-scope-note').textContent = config.note;

    const returnButton = document.getElementById('book-needs-return-button');
    if (returnButton) {
        const returnMode = window._bookOfNeedsReturnMode;
        const isOfficeOrigin = returnMode && returnMode !== 'universal' && returnMode !== 'prayers';
        returnButton.textContent = isOfficeOrigin ? 'Back to Office' : config.returnText;
    }

    for (const option of document.querySelectorAll('.prayer-option')) {
        const prayerId = option.dataset.value;
        const traditions = getBookOfNeedsTraditionsForPrayer(prayerId);
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
window.getBookOfNeedsTaxonomy = function getBookOfNeedsTaxonomy() {
    return {
        version: BOOK_OF_NEEDS_TAXONOMY_VERSION,
        traditionCodes: { ...BOOK_OF_NEEDS_TRADITION_CODES },
        assignments: JSON.parse(JSON.stringify(BOOK_OF_NEEDS_OPTION_TRADITIONS))
    };
};


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

window.setBookOfNeedsShowAboveRole = setBookOfNeedsShowAboveRole;
