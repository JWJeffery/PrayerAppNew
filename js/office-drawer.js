/**
 * Phase 4 — Office Settings, as ONE drawer (UI_REDESIGN_HANDOFF.md §5, §9;
 * target: documentation/design/screens/1c-threshold-ordo-drawer.png).
 *
 * Gated on `body.shell-v2`. With the flag off this file does nothing at all
 * and the four legacy sidebars behave exactly as before.
 *
 * WHAT THIS IS, AND WHAT IT DELIBERATELY IS NOT
 *
 * The four legacy sidebars (#settings-panel, #coptic-settings,
 * #east-syriac-settings, #generic-settings) remain in the DOM as the single
 * source of truth for every setting. This drawer never keeps state of its own:
 *
 *   - Section I and II call the app's EXISTING lane-neutral navigator API
 *     (changeSharedOfficeNavDate, todaySharedOfficeNavDate,
 *     setSharedOfficeNavDate, setSharedOfficeNavHour). No new date or hour
 *     logic exists here.
 *   - Compact value rows (Rite, Officiant, Psalter...) are native <select>s
 *     that CLICK the real legacy radio, so that radio's own onchange handler
 *     runs exactly as if the person had clicked it in the old sidebar.
 *   - Everything else — the seven borrowed-devotion toggles, the remaining
 *     BCP choices, BCP Only Mode — is MOVED into the drawer, never rebuilt:
 *     the same nodes, the same ids, the same handlers. toggleBcpOnly(),
 *     updateSidebarForOffice() and saveSettings() all look these up by id, so
 *     moving them changes nothing about how they behave (checked against each
 *     function's source before writing this).
 *
 * Native <dialog> + showModal() gives focus trapping, Esc-to-close, an inert
 * background and focus return with no dependency. The maintained open-source
 * option (a11y-dialog) is itself now a thin layer over the same element; the
 * one thing it adds — close on backdrop click — is done below in a few lines.
 *
 * Lane is read from the DOM (which drawer lacks `mode-hidden`), never from
 * `window.selectedMode`, which does not exist — see RESUME_PROJECT_NOTE §0a.
 */
(function () {
    'use strict';

    function shellOn() {
        return !!document.body && document.body.classList.contains('shell-v2');
    }

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    /* ── Lane ─────────────────────────────────────────────────────────────── */

    var LANES = [
        ['coptic-settings',      'coptic'],
        ['east-syriac-settings', 'eastSyriac'],
        ['generic-settings',     'horologion']
    ];

    function currentModeKey() {
        for (var i = 0; i < LANES.length; i++) {
            var p = document.getElementById(LANES[i][0]);
            if (p && !p.classList.contains('mode-hidden')) return LANES[i][1];
        }
        return 'daily';
    }

    /* ── Moving real controls ─────────────────────────────────────────────── */

    function labelOf(id) {
        var input = document.getElementById(id);
        return input ? input.closest('label') : null;
    }

    /* The seven borrowed-devotion toggles. The same list as toggleBcpOnly()'s
       own ecumenicalToggleIds and office-ui.js's BORROWED_DEVOTION_IDS.
       Theotokion, the eighth (Josh's classification, 2026-09-23), is a value of
       the Marian Element radios and is reached through that row instead. */
    var BORROWED_IDS = [
        'toggle-angelus', 'toggle-trisagion', 'toggle-prayer-before-reading',
        'toggle-examen', 'toggle-kyrie-pantocrator',
        'toggle-agpeya-opening', 'toggle-east-syriac-hours'
    ];

    var moved = false;
    var hosts = {};

    function moveRealControls() {
        if (moved) return;
        moved = true;

        /* Borrowed devotions: consolidated into one place, as §5 asks. */
        BORROWED_IDS.forEach(function (id) {
            var lab = labelOf(id);
            if (lab) hosts.borrowed.appendChild(lab);
        });

        /* The remaining native BCP choices, in their existing groups. Their
           borrowed labels have already left them (above), so what moves here
           is BCP-only content. The groups keep their ids, which
           updateSidebarForOffice() uses to show/hide per office. */
        var alt = document.getElementById('toggle-mary-virgin-alt');
        var altGroup = alt ? alt.closest('.nested-group') : null;
        [altGroup,
         document.getElementById('during-office-section'),
         document.getElementById('closing-devotions-section')
        ].forEach(function (n) { if (n) hosts.further.appendChild(n); });

        /* BCP Only Mode: the real checkbox, at the foot (§5, §3.7). */
        var bcp = labelOf('toggle-bcp-only');
        if (bcp) hosts.bcpOnly.appendChild(bcp);
    }

    /* ── Value rows: a native <select> standing in front of real radios ──── */

    function radioRow(key, label, name, options) {
        var radios = document.querySelectorAll('input[name="' + name + '"]');
        if (!radios.length) return null;
        var row = el('label', 'uo-drawer-row');
        row.appendChild(el('span', 'uo-drawer-row-label', label));
        var sel = el('select', 'uo-drawer-row-value');
        sel.setAttribute('data-uo-key', key);
        options.forEach(function (o) {
            var opt = el('option', null, o[1]);
            opt.value = o[0];
            sel.appendChild(opt);
        });
        var checked = document.querySelector('input[name="' + name + '"]:checked');
        if (checked) sel.value = checked.value;
        sel.addEventListener('change', function () {
            var r = document.querySelector('input[name="' + name + '"][value="' + CSS.escape(sel.value) + '"]');
            if (r) r.click();   /* fires the radio's own onchange */
        });
        row.appendChild(sel);
        return row;
    }

    function checkboxRow(key, label, id, offText, onText) {
        var box = document.getElementById(id);
        if (!box) return null;
        var row = el('label', 'uo-drawer-row');
        row.appendChild(el('span', 'uo-drawer-row-label', label));
        var sel = el('select', 'uo-drawer-row-value');
        sel.setAttribute('data-uo-key', key);
        [['off', offText], ['on', onText]].forEach(function (o) {
            var opt = el('option', null, o[1]); opt.value = o[0]; sel.appendChild(opt);
        });
        sel.value = box.checked ? 'on' : 'off';
        sel.addEventListener('change', function () {
            if ((sel.value === 'on') !== box.checked) box.click();
        });
        row.appendChild(sel);
        return row;
    }

    function selectRow(key, label, id) {
        var src = document.getElementById(id);
        if (!src) return null;
        var row = el('label', 'uo-drawer-row');
        row.appendChild(el('span', 'uo-drawer-row-label', label));
        var sel = el('select', 'uo-drawer-row-value');
        sel.setAttribute('data-uo-key', key);
        Array.prototype.forEach.call(src.options, function (o) {
            var opt = el('option', null, o.textContent); opt.value = o.value; sel.appendChild(opt);
        });
        sel.value = src.value;
        sel.addEventListener('change', function () {
            src.value = sel.value;
            src.dispatchEvent(new Event('change', { bubbles: true }));
        });
        row.appendChild(sel);
        return row;
    }

    /* The Formation depth select is rebuilt by innerHTML on every render
       (renderSharedOfficeNavigation), so it is read, never moved. */
    function explanationRow() {
        var src = document.querySelector('.shared-office-nav-formation-card select');
        if (!src || typeof window.setExplanationDepth !== 'function') return null;
        var row = el('label', 'uo-drawer-row');
        row.appendChild(el('span', 'uo-drawer-row-label', 'Explanations'));
        var sel = el('select', 'uo-drawer-row-value');
        sel.setAttribute('data-uo-key', 'explanations');
        Array.prototype.forEach.call(src.options, function (o) {
            var opt = el('option', null, o.textContent); opt.value = o.value; sel.appendChild(opt);
        });
        sel.value = src.value;
        sel.addEventListener('change', function () { window.setExplanationDepth(sel.value); });
        row.appendChild(sel);
        return row;
    }

    /* ── Section I · The Ordo ─────────────────────────────────────────────── */

    var MONTHS = ['January','February','March','April','May','June','July',
                  'August','September','October','November','December'];
    var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    function isoOnNavigator(modeKey) {
        var nav = document.querySelector('.shared-office-nav-date-card input[type="date"]');
        return nav && nav.value ? nav.value : null;
    }

    function stepperText(iso) {
        if (!iso) return '—';
        var p = iso.split('-');
        var d = new Date(+p[0], +p[1] - 1, +p[2]);
        return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
    }

    /* The day line is the lane's own words, verbatim, never composed here:
       the envelope's calendarSummary where the lane emits one (Anglican),
       otherwise the lane's own existing readout. */
    /* Horologion is deliberately absent: its only readout,
       #generic-calendar-info, names the calendar MODE, not the day, and
       showing it here would present a setting as if it were the liturgical
       day. Nothing until that lane has a real day line. */
    var DAY_LINE_FALLBACK = {
        coptic:     'cop-active-date-label',
        eastSyriac: 'esy-active-date-label'
    };

    function dayLineText(modeKey) {
        var ordo = document.querySelector('.uo-ordo-day');
        var t = ordo ? ordo.textContent.trim() : '';
        if (t) return t;
        var id = DAY_LINE_FALLBACK[modeKey];
        var n = id ? document.getElementById(id) : null;
        t = n ? n.textContent.trim() : '';
        return (t && t !== '—' && !/^Exploring the Ordo/.test(t)) ? t : '';
    }

    function buildOrdo(modeKey) {
        var sec = hosts.ordo;
        sec.textContent = '';

        var stepper = el('div', 'uo-drawer-stepper');
        var prev = el('button', 'uo-drawer-step', '\u25C0');
        prev.type = 'button';
        prev.setAttribute('aria-label', 'Previous day');
        prev.setAttribute('data-uo-key', 'prev');
        prev.onclick = function () { window.changeSharedOfficeNavDate(modeKey, -1); };
        var next = el('button', 'uo-drawer-step', '\u25B6');
        next.type = 'button';
        next.setAttribute('aria-label', 'Next day');
        next.setAttribute('data-uo-key', 'next');
        next.onclick = function () { window.changeSharedOfficeNavDate(modeKey, 1); };
        var iso = isoOnNavigator(modeKey);
        stepper.appendChild(prev);
        stepper.appendChild(el('div', 'uo-drawer-date', stepperText(iso)));
        stepper.appendChild(next);
        sec.appendChild(stepper);

        var line = el('div', 'uo-drawer-dayline');
        var dot = document.querySelector('#office-display .seasonal-dot');
        if (dot && dot.style.backgroundColor) {
            /* Only where the lane itself already drew a sourced dot (§6). */
            var d = el('span', 'uo-drawer-dot');
            d.style.backgroundColor = dot.style.backgroundColor;
            d.setAttribute('aria-hidden', 'true');
            line.appendChild(d);
        }
        var dayText = dayLineText(modeKey);
        line.appendChild(document.createTextNode(dayText));
        if (dayText) sec.appendChild(line);

        /* East Syriac's read-only facts about the day stay with the day. */
        if (modeKey === 'eastSyriac') {
            [['Cycle', 'esy-cycle-box'], ['Fasting', 'esy-fast-box'],
             ['Anaphora', 'esy-anaphora-box']].forEach(function (f) {
                var n = document.getElementById(f[1]);
                var t = n ? n.textContent.trim() : '';
                if (!t || t === '—' || /^Calculating/.test(t)) return;
                var r = el('div', 'uo-drawer-fact');
                r.appendChild(el('span', 'uo-drawer-row-label', f[0]));
                r.appendChild(el('span', 'uo-drawer-fact-value', t));
                sec.appendChild(r);
            });
        }

        var tools = el('div', 'uo-drawer-datetools');
        var today = el('button', 'uo-drawer-link', 'Today');
        today.type = 'button';
        today.setAttribute('data-uo-key', 'today');
        today.onclick = function () { window.todaySharedOfficeNavDate(modeKey); };
        var pick = el('input', 'uo-drawer-datepick');
        pick.type = 'date';
        pick.setAttribute('aria-label', 'Choose a date');
        pick.setAttribute('data-uo-key', 'datepick');
        if (iso) pick.value = iso;
        pick.onchange = function () { if (pick.value) window.setSharedOfficeNavDate(modeKey, pick.value); };
        tools.appendChild(today);
        tools.appendChild(pick);
        sec.appendChild(tools);
    }

    /* ── Section II · Which office ────────────────────────────────────────── */

    function buildOffices(modeKey) {
        var sec = hosts.offices;
        sec.textContent = '';
        /* The navigator's own radios already reflect every lane rule (e.g. the
           East Syriac Cathedral use offering only Ramsha and Sapra), so they
           are read rather than re-derived. */
        var radios = document.querySelectorAll('input[name="shared-office-nav-' + modeKey + '"]');
        var grid = el('div', 'uo-drawer-offices');
        grid.setAttribute('role', 'radiogroup');
        grid.setAttribute('aria-label', 'Which office');
        Array.prototype.forEach.call(radios, function (r) {
            var lab = r.closest('label');
            var name = lab ? lab.querySelector('.shared-office-nav-option-label') : null;
            var b = el('button', 'uo-drawer-office', name ? name.textContent : r.value);
            b.type = 'button';
            b.setAttribute('role', 'radio');
            b.setAttribute('aria-checked', r.checked ? 'true' : 'false');
            b.setAttribute('data-uo-key', 'office-' + r.value);
            if (r.disabled) b.disabled = true;
            b.onclick = function () { window.setSharedOfficeNavHour(modeKey, r.value); };
            grid.appendChild(b);
        });
        sec.appendChild(grid);
    }

    /* ── Section III · How you keep it (lane-supplied) ────────────────────── */

    function borrowedSummary() {
        var names = [];
        BORROWED_IDS.forEach(function (id) {
            var box = document.getElementById(id);
            if (!box || !box.checked) return;
            var lab = box.closest('label');
            var t = lab ? lab.childNodes[1] && lab.childNodes[1].textContent : '';
            names.push((t || id).trim());
        });
        var m = document.querySelector('input[name="marian-element"]:checked');
        if (m && (m.value === 'theotokion' || m.value === 'both')) names.push('Theotokion');
        return names;
    }

    function buildKeep(modeKey) {
        var rows = hosts.keepRows;
        rows.textContent = '';
        var add = function (r) { if (r) rows.appendChild(r); };

        if (modeKey === 'daily') {
            add(radioRow('rite', 'Rite', 'rite', [['rite1', 'Rite I'], ['rite2', 'Rite II']]));
            add(radioRow('minister', 'Officiant', 'minister', [['priest', 'Priest'], ['lay', 'Lay']]));
            add(checkboxRow('psalter', 'Psalter', 'toggle-30day-psalter', 'Office Lectionary', '30-Day'));
            add(radioRow('form', 'Form', 'ang-office-mode', [['full', 'Full Office'], ['devotion', 'Daily Devotion']]));
            add(selectRow('creed', 'Creed', 'creed-type'));
            add(radioRow('gospel', 'Gospel', 'gospel-placement',
                [['morning', 'Morning'], ['evening', 'Evening'], ['both', 'Both']]));
            /* The Marian Element lives inside #ecumenical-devotions-section,
               which BCP Only Mode hides whole. Mirrored exactly: same state,
               shown twice, never two states (§3.7). */
            var eco = document.getElementById('ecumenical-devotions-section');
            if (!(eco && eco.classList.contains('bcp-only-hidden'))) {
                add(radioRow('marian', 'Marian element', 'marian-element',
                    [['none', 'None'], ['antiphon', 'Seasonal Antiphon'],
                     ['theotokion', 'Theotokion'], ['both', 'Both']]));
                add(radioRow('marian-pos', 'Marian position', 'marian-antiphon-pos',
                    [['before', 'Before'], ['after', 'After']]));
            }
        } else if (modeKey === 'eastSyriac') {
            /* Kept reachable: hiding it would put Lelya, Suba'a and Endana out of
               reach. UI_REDESIGN_HANDOFF.md §8.4 asks for it hidden; that
               conflict is recorded in the ledger for Josh's call. */
            add(radioRow('esy-mode', 'Use', 'esy-mode',
                [['cathedral', 'Cathedral'], ['monastic', 'Monastic']]));
        } else if (modeKey === 'horologion') {
            add(selectRow('hor-cal', 'Calendar', 'hor-eo-calendar-select'));
            add(selectRow('hor-depth', 'Display depth', 'hor-depth-select'));
            var diag = document.getElementById('hor-btn-diag');
            if (diag) {
                var r = el('div', 'uo-drawer-row');
                r.appendChild(el('span', 'uo-drawer-row-label', 'Diagnostics'));
                var b = el('button', 'uo-drawer-row-value uo-drawer-toggle-value',
                    /ON/.test(diag.textContent) ? 'On' : 'Off');
                b.type = 'button';
                b.setAttribute('data-uo-key', 'hor-diag');
                b.onclick = function () { diag.click(); refreshSoon(); };
                r.appendChild(b);
                rows.appendChild(r);
            }
        }

        add(explanationRow());
        if (typeof window.openTraditionExplanation === 'function') {
            var about = el('button', 'uo-drawer-link', 'About this tradition');
            about.type = 'button';
            about.setAttribute('data-uo-key', 'about');
            about.onclick = function () { window.openTraditionExplanation(); };
            rows.appendChild(about);
        }

        /* Borrowed devotions and further BCP choices are Anglican-lane only. */
        var daily = modeKey === 'daily';
        hosts.borrowedBlock.hidden = !daily;
        hosts.furtherBlock.hidden = !daily;
        hosts.foot.hidden = !daily;
        if (!daily) return;

        var bcpOnly = !!(document.getElementById('toggle-bcp-only') || {}).checked;
        var names = borrowedSummary();
        hosts.borrowedValue.textContent = bcpOnly ? 'BCP only'
            : (names.length ? names.length + ' on' : 'None');
        hosts.borrowedList.textContent = names.length
            ? names.join(' \u00B7 ') + '. Each keeps its own name and its own tradition.'
            : (bcpOnly ? 'BCP Only Mode is on; nothing is borrowed.'
                       : 'Nothing borrowed. The office is the Prayer Book\u2019s alone.');
        /* When every borrowed row is hidden (BCP Only, or this office offers
           none), the expander has nothing to show and is not offered. */
        var anyShown = BORROWED_IDS.some(function (id) {
            var lab = labelOf(id);
            return lab && lab.style.display !== 'none' && !lab.classList.contains('bcp-only-hidden');
        });
        hosts.borrowedDetails.hidden = !anyShown;
    }

    /* ── Skeleton, built once ─────────────────────────────────────────────── */

    var dialog = null;

    function heading(text) { return el('div', 'uo-drawer-section-head', text); }

    function buildDialog() {
        dialog = el('dialog', 'uo-drawer');
        dialog.id = 'uo-office-settings';
        dialog.setAttribute('aria-labelledby', 'uo-drawer-title');

        var head = el('div', 'uo-drawer-head');
        var title = el('h2', 'uo-drawer-title', 'Office Settings');
        title.id = 'uo-drawer-title';
        var close = el('button', 'uo-drawer-close', '\u00D7');
        close.type = 'button';
        close.setAttribute('aria-label', 'Close Office Settings');
        close.onclick = function () { dialog.close(); };
        head.appendChild(title);
        head.appendChild(close);
        dialog.appendChild(head);

        var body = el('div', 'uo-drawer-body');
        dialog.appendChild(body);

        body.appendChild(heading('I \u00B7 The Ordo'));
        hosts.ordo = el('div', 'uo-drawer-section');
        body.appendChild(hosts.ordo);

        body.appendChild(heading('II \u00B7 Which office'));
        hosts.offices = el('div', 'uo-drawer-section');
        body.appendChild(hosts.offices);

        body.appendChild(heading('III \u00B7 How you keep it'));
        var keep = el('div', 'uo-drawer-section');
        hosts.keepRows = el('div', 'uo-drawer-rows');
        keep.appendChild(hosts.keepRows);

        hosts.borrowedBlock = el('div', 'uo-drawer-borrowed');
        var brow = el('div', 'uo-drawer-row uo-drawer-borrowed-row');
        brow.appendChild(el('span', 'uo-drawer-row-label', 'Borrowed devotions'));
        hosts.borrowedValue = el('span', 'uo-drawer-borrowed-count');
        brow.appendChild(hosts.borrowedValue);
        hosts.borrowedBlock.appendChild(brow);
        hosts.borrowedList = el('p', 'uo-drawer-borrowed-list');
        hosts.borrowedBlock.appendChild(hosts.borrowedList);
        hosts.borrowedDetails = el('details', 'uo-drawer-details');
        hosts.borrowedDetails.appendChild(el('summary', null, 'Choose borrowed devotions'));
        hosts.borrowed = el('div', 'uo-drawer-moved');
        hosts.borrowedDetails.appendChild(hosts.borrowed);
        hosts.borrowedBlock.appendChild(hosts.borrowedDetails);
        keep.appendChild(hosts.borrowedBlock);

        hosts.furtherBlock = el('details', 'uo-drawer-details uo-drawer-further');
        hosts.furtherBlock.appendChild(el('summary', null, 'Further Prayer Book choices'));
        hosts.further = el('div', 'uo-drawer-moved');
        hosts.furtherBlock.appendChild(hosts.further);
        keep.appendChild(hosts.furtherBlock);
        body.appendChild(keep);

        hosts.foot = el('div', 'uo-drawer-foot');
        hosts.bcpOnly = el('div', 'uo-drawer-bcp-only');
        hosts.foot.appendChild(hosts.bcpOnly);
        dialog.appendChild(hosts.foot);

        /* Close on backdrop click: the click lands on the <dialog> itself only
           when it is outside the panel box. */
        dialog.addEventListener('click', function (e) {
            if (e.target === dialog) dialog.close();
        });
        /* Any change inside (moved checkboxes included) re-reads state once the
           app's own handler has run and its render has landed. */
        dialog.addEventListener('change', refreshSoon);

        document.body.appendChild(dialog);
        moveRealControls();
    }

    /* ── Refresh ──────────────────────────────────────────────────────────── */

    function refresh() {
        if (!dialog || !dialog.open) return;
        var active = document.activeElement;
        var key = active && active.getAttribute ? active.getAttribute('data-uo-key') : null;
        var modeKey = currentModeKey();
        buildOrdo(modeKey);
        buildOffices(modeKey);
        buildKeep(modeKey);
        if (key) {
            var again = dialog.querySelector('[data-uo-key="' + key + '"]');
            if (again) again.focus();
        }
    }

    var pending = 0;
    function refreshSoon() {
        if (pending) return;
        pending = window.requestAnimationFrame(function () { pending = 0; refresh(); });
    }

    function open() {
        if (!shellOn()) return;
        if (!dialog) buildDialog();
        if (!dialog.open) dialog.showModal();
        refresh();
    }

    /* ── The keeping-place bar entry (§1, §3.1) ───────────────────────────── */

    function ensureEntry() {
        if (!shellOn()) return;
        var actions = document.querySelector('#main-content .uo-keeping-actions');
        if (!actions || actions.querySelector('.uo-drawer-open')) return;
        var b = el('button', 'uo-drawer-open', 'Office Settings');
        b.type = 'button';
        b.setAttribute('aria-haspopup', 'dialog');
        b.onclick = open;
        actions.insertBefore(b, actions.firstChild);
    }

    function init() {
        if (!shellOn()) return;
        /* The render landing is the signal (RESUME_PROJECT_NOTE §0a: re-resolve
           on the render, not the click). #office-display changes on every
           office, date and lane change; the shared navigator is rewritten after
           it. Both are watched; refresh is one call per frame. */
        var obs = new MutationObserver(function () { ensureEntry(); refreshSoon(); });
        var main = document.getElementById('main-content');
        if (main) obs.observe(main, { childList: true, subtree: true });
        ['settings-panel', 'coptic-settings', 'east-syriac-settings', 'generic-settings']
            .forEach(function (id) {
                var p = document.getElementById(id);
                if (p) obs.observe(p, { childList: true, subtree: true,
                                        attributes: true, attributeFilter: ['class'] });
            });
        ensureEntry();
    }

    window.openUniversalOfficeSettings = open;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
