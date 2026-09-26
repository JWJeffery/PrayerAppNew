/**
 * Phase 4 — Office Settings, as ONE drawer (UI_REDESIGN_HANDOFF.md §5, §9;
 * target: documentation/design/screens/1c-threshold-ordo-drawer.png).
 *
 * Phase 6 (2026-09-24) dropped the body.shell-v2 dev flag this file used to
 * gate itself on -- it now always runs.
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
 * Lane is read via js/office-ui.js's own exposed
 * `window._sharedOfficeNavigatorModeKey()` (Phase 6, sidebar-deletion
 * refactor) — a function, not `window.selectedMode` itself, which still
 * does not exist (a bare top-level `let` in office-ui.js, never a `window`
 * property — see RESUME_PROJECT_NOTE §0a). A function always reads the
 * live value; a mirrored variable would go stale the moment selectedMode is
 * reassigned by bare identifier, which is exactly the bug class
 * AUDIT_GOVERNANCE_LEDGER.md already recorded once.
 */
(function () {
    'use strict';

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    /* ── Lane ─────────────────────────────────────────────────────────────── */

    function currentModeKey() {
        var k = (typeof window._sharedOfficeNavigatorModeKey === 'function')
            ? window._sharedOfficeNavigatorModeKey() : null;
        return (k === 'coptic' || k === 'eastSyriac' || k === 'horologion') ? k : 'daily';
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

    /* RENAMED 2026-09-25, per Josh's direct instruction ("Additional Devotions,
       but we say where they are from"): "Borrowed" is retired; each item's own
       tradition is shown alongside its name instead. Sourced from this
       project's own governance data where it exists -- components/ecumenical.json
       (ecu-examen: "Ignatian"; ecu-prayer-before-reading, ecu-kyrie-pantocrator,
       and ecu-east-syriac-hours: "Byzantine Orthodox", the last corrected
       2026-09-21 from a previously-wrong "Church of the East" tag despite its
       own toggle id -- do not re-introduce that error here). Agpeya Opening and
       Theotokion both come from components/coptic.json, which carries no
       per-entry tradition field because the whole file is Coptic by scope; "Coptic"
       here reflects that file-level scoping, not a separate per-item citation.
       Angelus and Trisagion have no tradition recorded in ecumenical.json at
       all (a real, disclosed gap in that file, not fixed here) -- labeled with
       their well-established common attribution (Roman Catholic; Byzantine,
       consistent with the three already-sourced Byzantine entries above) rather
       than left blank, but this is common knowledge, not a citation this
       project has itself verified -- worth a real sourcing pass later. */
    var BORROWED_TRADITIONS = {
        'toggle-angelus':              'Roman Catholic',
        'toggle-trisagion':            'Byzantine',
        'toggle-prayer-before-reading':'Byzantine Orthodox',
        'toggle-examen':               'Ignatian',
        'toggle-kyrie-pantocrator':    'Byzantine Orthodox',
        'toggle-agpeya-opening':       'Coptic',
        'toggle-east-syriac-hours':    'Byzantine Orthodox'
    };
    var THEOTOKION_TRADITION = 'Coptic';

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
           updateSidebarForOffice() uses to show/hide per office.
           REORDERED 2026-09-25, per Josh's direct report ("this list is
           poorly ordered. You have options that cover one day or one week
           above daily options."): altGroup (Mary the Virgin / Michael and
           All Angels / Good Friday / Easter Day -- each a single named
           day's alternate reading) moved to the END, after
           during-office-section and closing-devotions-section, whose
           remaining content (Gloria Patri, the invitatory/noonday/compline
           rotation groups, the Suffrages/Mission/Collect/Blessing daily
           rotations) applies to every ordinary office, not one specific
           day. */
        var alt = document.getElementById('toggle-mary-virgin-alt');
        var altGroup = alt ? alt.closest('.nested-group') : null;
        [document.getElementById('during-office-section'),
         document.getElementById('closing-devotions-section'),
         altGroup
        ].forEach(function (n) { if (n) hosts.further.appendChild(n); });

        /* BCP Only Mode: the real checkbox, at the foot (§5, §3.7). */
        var bcp = labelOf('toggle-bcp-only');
        if (bcp) hosts.bcpOnly.appendChild(bcp);

        moveLegacyStateControls();
    }

    /* Every remaining real control across all four legacy sidebars that
       moveRealControls() above doesn't already handle -- not because it's
       unimportant, but because this drawer already gives it its own UI
       elsewhere: the "which office" grid (Section II, built from the
       separate shared-office-nav-* radios that write back to these) or a
       radioRow()/checkboxRow()/selectRow() synthetic row further down (which
       read these by name/id directly, never move them). Confirmed by
       reading radioRow()/checkboxRow()/selectRow()'s own code before writing
       this: they say plainly the controls they surface are read in place,
       never moved -- this function is what makes "read in place" survive
       the legacy sidebars eventually being deleted. Moved into
       hosts.legacyState (permanently display:none -- nothing here needs a
       visible home, the drawer's own UI already covers it), same appendChild
       pattern as moveRealControls() above: the same real nodes, same ids,
       same onchange handlers, never rebuilt.

       EXTENDED (Phase 6, sidebar-deletion refactor): the legacy sidebars
       are being deleted outright, not just hidden, so every real element
       any code still reads by id/name -- not just this drawer's own move/
       read functions -- must be preserved somewhere, whether or not it has
       its own drawer UI. Confirmed by reading every remaining reference
       before moving anything:
         - #ecumenical-devotions-section: its Marian nested-group and two
           borrowed-devotion checkboxes already left it individually above,
           leaving it an empty shell -- but toggleBcpOnly() (office-ui.js)
           and this file's own buildKeep() both still find it purely by
           getElementById('ecumenical-devotions-section') to read/write its
           bcp-only-hidden class, position-independent. Moved wholesale so
           that check keeps working unchanged.
         - hor-btn-diag: previously left out as "a dev-only display toggle,
           not a persisted value another function reads back" -- that was
           wrong, buildKeep()'s horologion branch does read it
           (getElementById('hor-btn-diag')) to build a working Diagnostics
           row. Moved (its own nested-group, distinct from the already-moved
           Display Depth nested-group) so that row keeps working.
         - East Syriac's "Active Hour" setting-group
           (esy-active-hour-label/esy-active-date-label/esy-override-toggle)
           -- a separate setting-group from esy-override-panel, not
           previously covered. esy-active-date-label is read by this file's
           own DAY_LINE_FALLBACK.eastSyriac.
         - esy-cycle-box/esy-fast-box/esy-anaphora-box -- three separate
           setting-groups, each read by this file's buildOrdo() eastSyriac
           branch and written by office-ui.js's render logic; confirmed
           both null-guard their lookups, no crash risk either way.
         - BCP's and Horologion's own .ordo-control blocks (date-picker/
           generic-date-picker plus their display-date/calendar-info
           siblings and Prev/Today/Next buttons) -- still read/written by id
           (updateDatePicker(), updateGenericDateDisplay(), setCustomDate())
           even though neither needs its own new drawer UI, superseded by
           the shared navigator's own stepper/picker.

       Still left OUT, on purpose, confirmed unread anywhere by id: only
       #settings-panel's "Appearance" Dark Mode checkbox (toggle-dark) --
       the shell provides its own lane-agnostic Auto/Light/Dark control,
       and every synthetic dark-mode toggle the shared navigator builds for
       coptic/eastSyriac/horologion uses the shared data-app-dark-toggle
       attribute, not this element's id; grepped the whole repo for
       getElementById('toggle-dark') and found zero hits outside its own
       onchange. */
    function moveLegacyStateControls() {
        var host = hosts.legacyState;

        // BCP: "Which office" (office-time), "Office Mode" (ang-office-mode),
        // and "Liturgical Settings" (rite, minister, creed-type, Gospel
        // placement + 30-Day Psalter -- Lectionary Alternates already left
        // this same setting-group above, via moveRealControls()'s altGroup).
        var officeTimeRadio = document.querySelector('input[name="office-time"]');
        var officeTimeGroup = officeTimeRadio ? officeTimeRadio.closest('.setting-group') : null;
        if (officeTimeGroup) host.appendChild(officeTimeGroup);

        var angModeRadio = document.querySelector('input[name="ang-office-mode"]');
        var angModeGroup = angModeRadio ? angModeRadio.closest('.setting-group') : null;
        if (angModeGroup) host.appendChild(angModeGroup);

        var riteRadio = document.querySelector('input[name="rite"]');
        var liturgicalGroup = riteRadio ? riteRadio.closest('.setting-group') : null;
        if (liturgicalGroup) host.appendChild(liturgicalGroup);

        // BCP: Marian Element (marian-element, marian-antiphon-pos) -- its
        // own nested-group inside #ecumenical-devotions-section, sibling to
        // the Coptic/Byzantine borrowed-devotion nested-groups that stay
        // behind (their own checkboxes already moved individually above).
        var marianRadio = document.querySelector('input[name="marian-element"]');
        var marianGroup = marianRadio ? marianRadio.closest('.nested-group') : null;
        if (marianGroup) host.appendChild(marianGroup);

        // Coptic: "Active Hour" (cop-hour, plus its own display labels).
        var copHourRadio = document.querySelector('input[name="cop-hour"]');
        var copHourGroup = copHourRadio ? copHourRadio.closest('.setting-group') : null;
        if (copHourGroup) host.appendChild(copHourGroup);

        // East Syriac: the override panel (esy-hour-override, esy-override-date,
        // the reset button) and the always-hidden esy-time radios it stays in
        // sync with -- already display:none in place, confirmed by its own
        // existing comment ("read by renderEastSyriac()... synced here").
        var esyOverridePanel = document.getElementById('esy-override-panel');
        if (esyOverridePanel) host.appendChild(esyOverridePanel);

        var esyTimeRadio = document.querySelector('input[name="esy-time"]');
        var esyTimeGroup = esyTimeRadio ? esyTimeRadio.closest('div') : null;
        if (esyTimeGroup) host.appendChild(esyTimeGroup);

        // East Syriac: "Office Mode" (esy-mode, Cathedral/Monastic).
        var esyModeRadio = document.querySelector('input[name="esy-mode"]');
        var esyModeGroup = esyModeRadio ? esyModeRadio.closest('.setting-group') : null;
        if (esyModeGroup) host.appendChild(esyModeGroup);

        // Horologion: the 14-office radio list, Calendar Mode, and Display
        // Depth -- each its own nested-group; Diagnostics (a sibling
        // nested-group of Display Depth) deliberately stays behind, see the
        // header comment on this function.
        var horOfficeRadio = document.querySelector('input[name="horologion-office"]');
        var horOfficeGroup = horOfficeRadio ? horOfficeRadio.closest('.nested-group') : null;
        if (horOfficeGroup) host.appendChild(horOfficeGroup);

        var horCalSelect = document.getElementById('hor-eo-calendar-select');
        var horCalGroup = horCalSelect ? horCalSelect.closest('.nested-group') : null;
        if (horCalGroup) host.appendChild(horCalGroup);

        var horDepthSelect = document.getElementById('hor-depth-select');
        var horDepthGroup = horDepthSelect ? horDepthSelect.closest('.nested-group') : null;
        if (horDepthGroup) host.appendChild(horDepthGroup);

        // #ecumenical-devotions-section: now-empty shell, moved so
        // toggleBcpOnly()'s/buildKeep()'s bcp-only-hidden class check
        // keeps working (both find it by id, not position).
        var ecoSection = document.getElementById('ecumenical-devotions-section');
        if (ecoSection) host.appendChild(ecoSection);

        // Horologion: Diagnostics button's own nested-group (distinct from
        // the already-moved Display Depth nested-group above).
        var horDiagBtn = document.getElementById('hor-btn-diag');
        var horDiagGroup = horDiagBtn ? horDiagBtn.closest('.nested-group') : null;
        if (horDiagGroup) host.appendChild(horDiagGroup);

        // East Syriac: "Active Hour" setting-group (esy-active-hour-label,
        // esy-active-date-label, esy-override-toggle) -- separate from
        // esy-override-panel, already moved above.
        var esyActiveLabel = document.getElementById('esy-active-hour-label');
        var esyActiveGroup = esyActiveLabel ? esyActiveLabel.closest('.setting-group') : null;
        if (esyActiveGroup) host.appendChild(esyActiveGroup);

        // East Syriac: Cycle/Fasting/Anaphora display boxes -- three
        // separate setting-groups.
        ['esy-cycle-box', 'esy-fast-box', 'esy-anaphora-box'].forEach(function (id) {
            var box = document.getElementById(id);
            var g = box ? box.closest('.setting-group') : null;
            if (g) host.appendChild(g);
        });

        // BCP and Horologion date-picker blocks -- no dedicated drawer UI
        // needed (superseded by the shared navigator's own stepper/picker),
        // but still read/written by id.
        var bcpDatePicker = document.getElementById('date-picker');
        var bcpOrdoControl = bcpDatePicker ? bcpDatePicker.closest('.ordo-control') : null;
        if (bcpOrdoControl) host.appendChild(bcpOrdoControl);

        var horDatePicker = document.getElementById('generic-date-picker');
        var horOrdoControl = horDatePicker ? horDatePicker.closest('.ordo-control') : null;
        if (horOrdoControl) host.appendChild(horOrdoControl);
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

    /* ── Section III · Which office (was II; swapped 2026-09-25, see buildDialog) ── */

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

    /* ── Section II · Options (was III, "How you keep it"; renamed and moved
       before "Which office" 2026-09-25, per Josh's direct instruction --
       lane-supplied) ──────────────────────────────────────────────────── */

    function borrowedSummary() {
        var names = [];
        BORROWED_IDS.forEach(function (id) {
            var box = document.getElementById(id);
            if (!box || !box.checked) return;
            var lab = box.closest('label');
            var t = lab ? lab.childNodes[1] && lab.childNodes[1].textContent : '';
            var name = (t || id).trim();
            var trad = BORROWED_TRADITIONS[id];
            names.push(trad ? name + ' (' + trad + ')' : name);
        });
        var m = document.querySelector('input[name="marian-element"]:checked');
        if (m && (m.value === 'theotokion' || m.value === 'both')) {
            names.push('Theotokion (' + THEOTOKION_TRADITION + ')');
        }
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
            ? names.join(' \u00B7 ') + '.'
            : (bcpOnly ? 'BCP Only Mode is on; nothing additional is included.'
                       : 'Nothing additional. The office is the Prayer Book\u2019s alone.');
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

        // ORDER SWAPPED 2026-09-25, per Josh's direct instruction ("'How you keep
        // it' effects your options for which office. Switch the order."): Options
        // (Cathedral/Monastic use, Rite, etc.) can change which entries "Which
        // office" even offers -- East Syriac's own Cathedral/Monastic choice is
        // the concrete case -- so it now comes first, reading in the order a
        // person actually decides: how you keep it, then which office follows
        // from that. Renamed from "How you keep it" per Josh's direct feedback
        // ("is not good wording. 'Options' would be better").
        body.appendChild(heading('II \u00B7 Options'));
        var keep = el('div', 'uo-drawer-section');
        hosts.keepRows = el('div', 'uo-drawer-rows');
        keep.appendChild(hosts.keepRows);

        hosts.borrowedBlock = el('div', 'uo-drawer-borrowed');
        var brow = el('div', 'uo-drawer-row uo-drawer-borrowed-row');
        brow.appendChild(el('span', 'uo-drawer-row-label', 'Additional devotions'));
        hosts.borrowedValue = el('span', 'uo-drawer-borrowed-count');
        brow.appendChild(hosts.borrowedValue);
        hosts.borrowedBlock.appendChild(brow);
        hosts.borrowedList = el('p', 'uo-drawer-borrowed-list');
        hosts.borrowedBlock.appendChild(hosts.borrowedList);
        hosts.borrowedDetails = el('details', 'uo-drawer-details');
        hosts.borrowedDetails.appendChild(el('summary', null, 'Choose additional devotions'));
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

        body.appendChild(heading('III · Which office'));
        hosts.offices = el('div', 'uo-drawer-section');
        body.appendChild(hosts.offices);

        hosts.foot = el('div', 'uo-drawer-foot');
        hosts.bcpOnly = el('div', 'uo-drawer-bcp-only');
        hosts.foot.appendChild(hosts.bcpOnly);
        dialog.appendChild(hosts.foot);

        /* Real home for every control that already has its own drawer UI
           (the "which office" grid above, or a radioRow()/checkboxRow()/
           selectRow() synthetic row) but whose real <input>/<select> still
           needs to exist SOMEWHERE for those rows -- and js/office-ui.js's
           own render functions -- to read from and write back to. Moved
           here, 2026-09-24, so the four legacy sidebars hold nothing this
           drawer still depends on; see moveLegacyStateControls() below for
           the inventory and RESUME_PROJECT_NOTE.md for why this was needed
           before the sidebars themselves could ever be deleted. Never shown:
           the drawer already has real UI for everything moved in here. */
        hosts.legacyState = el('div', 'uo-drawer-legacy-state');
        hosts.legacyState.style.display = 'none';
        dialog.appendChild(hosts.legacyState);

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
        if (!dialog) buildDialog();
        if (!dialog.open) dialog.showModal();
        refresh();
    }

    /* ── The keeping-place bar entry (§1, §3.1) ───────────────────────────── */

    function ensureEntry() {
        var actions = document.querySelector('#main-content .uo-keeping-actions');
        if (!actions || actions.querySelector('.uo-drawer-open')) return;
        var b = el('button', 'uo-drawer-open', 'Office Settings');
        b.type = 'button';
        b.setAttribute('aria-haspopup', 'dialog');
        b.onclick = open;
        actions.insertBefore(b, actions.firstChild);
    }

    function init() {
        /* The render landing is the signal (RESUME_PROJECT_NOTE §0a: re-resolve
           on the render, not the click). #office-display changes on every
           office, date and lane change; the shared navigator is rewritten after
           it -- this one observer already covers every lane switch, since
           every selectMode() branch rewrites #office-display's innerHTML and
           #office-display is #main-content's direct child. A second
           per-panel observer (watching the four legacy sidebars' own class
           attribute) used to run alongside this one; removed with the
           sidebars themselves (Phase 6, sidebar-deletion refactor) -- it was
           never the only signal, just a belt-and-suspenders one, confirmed
           live (open drawer, switch lanes, still refreshes) before removing
           it. */
        var obs = new MutationObserver(function () { ensureEntry(); refreshSoon(); });
        var main = document.getElementById('main-content');
        if (main) obs.observe(main, { childList: true, subtree: true });
        ensureEntry();
    }

    window.openUniversalOfficeSettings = open;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
