/**
 * PRAYERS.JS
 * Book of Needs — UI logic for individual prayer display.
 * Prayer text data lives in data/prayers.json (loaded on demand).
 */

let prayersData = null; // cache

// ── Dropdown Interaction ─────────────────────────────────────────────────────
function togglePrayerDropdown() {
    document.getElementById('prayer-select-list').classList.toggle('open');
}

function selectPrayer(el) {
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