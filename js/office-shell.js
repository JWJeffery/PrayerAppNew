/**
 * js/office-shell.js — Phase 2 of the UI redesign: the three-column shell.
 *
 * See documentation/UI_REDESIGN_HANDOFF.md.
 *
 * Everything here is gated on `body.shell-v2`. With the flag off this file
 * builds nothing, moves nothing, and registers no listeners beyond one cheap
 * check. The old shell is untouched.
 *
 * WHAT THIS DOES
 *   1. Turns #main-content into the rail / page / margin grid, adding four
 *      chrome regions: the ordo line, the rail, the margin, the keeping-place
 *      bar.
 *   2. Moves the existing office content into the page column. It MOVES nodes,
 *      never clones or rebuilds them, so every existing event handler, id and
 *      piece of state survives intact.
 *   3. Provides the three-state Auto / Light / Dark control.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 *   The rail carries placeholders and the margin is empty. Both need the
 *   resolved-office envelope, which no lane emits yet — that is Phase 3. Fake
 *   rail items built by scraping the rendered DOM would be exactly the kind of
 *   invented completeness this design exists to prevent.
 */

(function () {
    'use strict';

    var SHELL_CLASS = 'shell-v2';
    var THEME_KEY   = 'universalOfficeShellTheme';   // 'auto' | 'light' | 'dark'

    function shellOn() {
        return !!document.body && document.body.classList.contains(SHELL_CLASS);
    }

    /* ── Auto theme: keyed to the OFFICE, not the clock ──────────────────────
     *
     * The handoff is explicit: Evening Prayer said at 5pm in June still renders
     * night, because the office is the thing being prayed. The app's existing
     * _defaultDarkModeForCurrentTime() is clock-keyed; that behaviour is left
     * completely alone for the unflagged app and is used here only as a
     * fallback when no office can be determined.
     *
     * These ids are not invented. They are the exact option values the app
     * itself uses in its office navigators, read out of js/office-ui.js. The
     * day-part in the comment is that option's own `detail` string.
     */
    var NIGHT_OFFICES = {
        /* daily (BCP 1979) */
        'evening-office':        true,   /* Evening */
        'compline-office':       true,   /* Night */
        /* Coptic Agpeya */
        'coptic-eleventh-hour':  true,   /* Vespers */
        'coptic-twelfth-hour':   true,   /* Compline */
        'coptic-midnight-office':true,   /* Three Nocturns */
        /* East Syriac Hudra */
        'ramsha':                true,   /* Evening Prayer, 18:00-21:00 */
        'lelya':                 true,   /* Night Office, 21:00-03:00 */
        'subaa':                 true,   /* Pre-dawn, 03:00-06:00 */
        /* Byzantine Horologion */
        'vespers':               true,   /* Evening */
        'small-compline':        true,   /* Night */
        'great-compline':        true,   /* Night */
        'midnight-office':       true    /* Midnight */
        /* Orthros is deliberately NOT here. It begins in darkness and ends at
           sunrise, so it is genuinely ambiguous; it is treated as the morning
           office, consistent with Morning Prayer. Flagged in the ledger as a
           judgement call rather than a fact. */
    };

    /**
     * The active office, resolved BY LANE rather than by first match.
     *
     * Every lane's navigator radios exist in the DOM at once and stay checked.
     * A console read on the Agpeya at the Twelfth Hour returned, simultaneously:
     *
     *     office-time=morning-office
     *     cop-hour=coptic-twelfth-hour
     *     esy-hour-override=ramsha
     *
     * An earlier version searched a fixed list with `office-time` first and
     * returned the first checked radio it found — so it answered with the BCP
     * office in EVERY lane, and the Agpeya and Hudra always resolved to
     * whatever BCP happened to be set to. BCP appeared to work only because it
     * was the lane being read every time; it was never actually consulting the
     * lane in front of the user.
     *
     * `selectedMode` is the app's own record of which lane is active, so key on
     * it. An unrecognised or null mode means the Daily Office, which is what
     * the app itself defaults to.
     */
    /**
     * The active lane, read from the DOM.
     *
     * NOT from `window.selectedMode`. `js/office-ui.js` declares
     * `let selectedMode = null;` at top level, and a top-level `let` in a
     * classic script creates a binding in the global LEXICAL environment
     * without becoming a property of `window` — so `window.selectedMode` is
     * permanently undefined. A console dump showed `mode` missing from the
     * output entirely, because JSON.stringify drops undefined values: the
     * absence was the finding. The previous patch keyed on that property,
     * looked correct, and changed nothing.
     *
     * The bare identifier IS readable via direct eval, but that cannot be
     * exercised in jsdom — each eval there gets its own lexical scope, so a
     * `let` in one is invisible to the next, while real script tags share one
     * global environment. An untestable read is what let the last three fixes
     * through, so this reads a DOM signal instead: each lane's settings drawer
     * carries `mode-hidden` when inactive, and exactly one does not.
     */
    var LANE_PANELS = [
        ['coptic-settings',      'coptic-agpeya',  'cop-hour'],
        ['east-syriac-settings', 'east-syriac',    'esy-hour-override'],
        ['generic-settings',     'horologion',     'shared-office-nav-horologion']
    ];

    function currentLane() {
        for (var i = 0; i < LANE_PANELS.length; i++) {
            var panel = document.getElementById(LANE_PANELS[i][0]);
            if (panel && !panel.classList.contains('mode-hidden')) {
                return LANE_PANELS[i];
            }
        }
        return [null, null, 'office-time'];   /* the Daily Office, the app's own default */
    }

    function currentOfficeId() {
        var lane = currentLane();
        var name = lane[2];

        var el = document.querySelector('input[name="' + name + '"]:checked');
        if (el && el.value) return el.value;

        if (lane[1] === 'horologion') {
            /* Horologion may keep its office only in a top-level `let`, which
               is not a window property. Direct eval reaches the global lexical
               binding; the typeof guard stops a ReferenceError if office-ui.js
               has not loaded. Unverifiable in jsdom — browser only. */
            try {
                /* eslint-disable no-eval */
                var h = eval('typeof selectedHorologionOffice !== "undefined" ? selectedHorologionOffice : undefined');
                /* eslint-enable no-eval */
                if (typeof h === 'string') return h;
            } catch (e) { /* CSP without unsafe-eval, or not loaded */ }
        }
        return null;
    }



    /* No clock fallback. Auto is keyed to the OFFICE; when no office can be
       determined there is no office being prayed, so there is nothing for Auto
       to answer and it holds at night rather than borrowing the old shell's
       clock rule. Mixing the two is what made a morning office render dark. */
    function autoIsDark() {
        var office = currentOfficeId();
        return office ? !!NIGHT_OFFICES[office] : true;
    }

    function readTheme() {
        try {
            var v = window.localStorage.getItem(THEME_KEY);
            return (v === 'light' || v === 'dark' || v === 'auto') ? v : 'auto';
        } catch (e) {
            return 'auto';
        }
    }

    function writeTheme(v) {
        try {
            if (v === 'auto') window.localStorage.removeItem(THEME_KEY);
            else window.localStorage.setItem(THEME_KEY, v);
        } catch (e) { /* not fatal */ }
    }

    /**
     * Applies the resolved theme.
     *
     * THE SHELL OWNS THE THEME ALONE. It sets one class, `uo-day`, and talks to
     * nothing else.
     *
     * It used to call `applyDarkMode()` and wrap it, to keep the old skin's
     * `body.dark-mode` in step. That produced six patches in a row: the app
     * re-set the theme after the shell did, from an async kernel load and from
     * `updateUI()`; the legacy checkbox was rebuilt by innerHTML on every
     * render; the guard then forced the shell's theme onto screens that are not
     * the shell, which is why the SPLASH went dark. Two systems owning one
     * piece of global state cannot be reconciled by synchronising them harder.
     *
     * So the shell no longer participates. The old skin may set
     * `body.dark-mode` whenever it likes; under `shell-v2` none of its rules
     * reach the office screen any more (see the neutralisation block in
     * css/office-shell.css), so it has nothing left to colour. Off the office
     * screen — the splash, the Book of Needs, the Bible browser — the old
     * behaviour is untouched and the shell keeps its hands off.
     */
    function applyTheme(mode) {
        if (!shellOn()) return;
        var isDark = (mode === 'dark') || (mode !== 'light' && autoIsDark());

        document.body.classList.toggle('uo-day', !isDark);

        var group = document.querySelector('.uo-theme-control');
        if (group) {
            group.querySelectorAll('button[data-uo-theme]').forEach(function (b) {
                var on = b.getAttribute('data-uo-theme') === mode;
                b.classList.toggle('is-on', on);
                b.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
        }
    }

    window.setUniversalOfficeTheme = function (mode) {
        if (mode !== 'light' && mode !== 'dark') mode = 'auto';
        writeTheme(mode);
        applyTheme(mode);
        return mode;
    };

    window.refreshUniversalOfficeShellTheme = function () {
        applyTheme(readTheme());
    };

    /* ── Chrome ──────────────────────────────────────────────────────────── */

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    /* The ✦ ornament is a dingbat and exists in neither Cormorant Garamond nor
       IBM Plex Mono. As a character it falls back to whatever the OS supplies,
       which differs across macOS, Windows and Android — directly beneath the
       office title. Drawn instead, taking its colour from currentColor. */
    function ornament() {
        var NS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'uo-ornament');
        svg.setAttribute('viewBox', '0 0 84 12');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        [14, 42, 70].forEach(function (cx) {
            var p = document.createElementNS(NS, 'path');
            p.setAttribute('d',
                'M' + cx + ' 0 L' + (cx + 2.1) + ' 3.9 L' + (cx + 6) + ' 6 L' +
                (cx + 2.1) + ' 8.1 L' + cx + ' 12 L' + (cx - 2.1) + ' 8.1 L' +
                (cx - 6) + ' 6 L' + (cx - 2.1) + ' 3.9 Z');
            p.setAttribute('fill', 'currentColor');
            svg.appendChild(p);
        });
        return svg;
    }

    function themeControl() {
        var wrap = el('div', 'uo-theme-control');
        wrap.setAttribute('role', 'group');
        wrap.setAttribute('aria-label', 'Appearance');
        [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].forEach(function (pair) {
            var b = el('button', 'uo-theme-button', pair[1]);
            b.type = 'button';
            b.setAttribute('data-uo-theme', pair[0]);
            b.setAttribute('aria-pressed', 'false');
            b.addEventListener('click', function () {
                window.setUniversalOfficeTheme(pair[0]);
            });
            wrap.appendChild(b);
        });
        return wrap;
    }

    function buildShell() {
        if (!shellOn()) return;
        var main = document.getElementById('main-content');
        if (!main || main.querySelector(':scope > .uo-page')) return;   /* idempotent */

        var ordo = el('div', 'uo-ordo');
        ordo.appendChild(el('div', 'uo-ordo-mark', 'The Universal Office'));
        var centre = el('div', 'uo-ordo-day');
        /* The liturgical day line is context.calendarSummary, verbatim, and
           arrives with the envelope in Phase 3. Empty until then — deliberately
           not scraped from the rendered page. */
        ordo.appendChild(centre);
        ordo.appendChild(themeControl());

        var rail = el('nav', 'uo-rail');
        rail.setAttribute('aria-label', 'The order of this office');
        rail.appendChild(el('div', 'uo-rail-head', 'The Order'));
        var note = el('p', 'uo-rail-placeholder',
            'The order of this office appears here once the lane emits its blocks.');
        rail.appendChild(note);

        var page = el('div', 'uo-page');
        var margin = el('aside', 'uo-margin');
        margin.setAttribute('aria-label', 'The margin');

        var keeping = el('div', 'uo-keeping');
        keeping.appendChild(el('div', 'uo-keeping-hint',
            '\u2191 \u2193 move by block \u00b7 space holds the place'));
        keeping.appendChild(el('div', 'uo-keeping-actions'));

        /* Move, never rebuild: these nodes carry live handlers and ids. */
        var moved = [];
        ['office-mode-title', 'office-context-actions'].forEach(function (id) {
            var n = document.getElementById(id);
            if (n) { ordo.insertBefore(n, centre); moved.push(id); }
        });
        var display = document.getElementById('office-display');
        if (display) page.appendChild(display);
        var saints = main.querySelector(':scope > .saint-section');
        if (saints) page.appendChild(saints);

        /* The audit-dashboard link is a direct child of #main-content with no
           id and no class — inline-styled markup. Left alone it has no
           grid-area, so CSS auto-places it into an implicit FOURTH row below
           the keeping bar, which is exactly where it appeared. It belongs in
           the keeping bar's action slot. Matched on its href rather than
           position, so re-ordering the markup cannot silently break this. */
        var auditLink = main.querySelector(':scope > div > a[href="audit-ledger.html"]');
        var auditBlock = auditLink ? auditLink.parentElement : null;
        if (auditBlock && auditBlock.parentElement === main) {
            keeping.querySelector('.uo-keeping-actions').appendChild(auditBlock);
            auditBlock.style.margin = '0';
        }

        main.insertBefore(ordo, main.firstChild);
        main.appendChild(rail);
        main.appendChild(page);
        main.appendChild(margin);
        main.appendChild(keeping);

        /* The ornament belongs under the office title in the page column; it is
           inserted once here and re-parented by the lane in Phase 3. */
        page.insertBefore(ornament(), page.firstChild);

        applyTheme(readTheme());
    }

    window.buildUniversalOfficeShell = buildShell;

    /**
     * Auto has to be RE-RESOLVED, not resolved once.
     *
     * Phase 2 shipped with applyTheme() called only at build time. The office
     * can change many times per session, and each change means a different
     * answer from an office-keyed Auto — so Evening Prayer, the Coptic Twelfth
     * Hour and Ramsha all rendered in whatever theme happened to be set when
     * the shell was built. Every jsdom test passed because each booted a fresh
     * page with a single office and never changed it: the harness could not see
     * a bug that only exists over time.
     *
     * Listeners are delegated on `document` deliberately. The app rebuilds its
     * navigation with innerHTML on every date and hour click, which destroys
     * any listener bound directly to a radio; a delegated listener survives
     * that.
     */
    function watchOfficeChanges() {
        var WATCHED = { 'office-time': 1, 'cop-hour': 1, 'esy-hour-override': 1 };

        document.addEventListener('change', function (ev) {
            var t = ev.target;
            if (!t) return;

            if (t.name && WATCHED[t.name]) {
                applyTheme(readTheme());
            }
        }, true);

        /* Horologion keeps its office in a module global rather than a radio,
           and the Universal Office selector re-enters the shell from the
           splash. Neither fires a change event we can read, so re-resolve after
           any click once the app has had a tick to update its state. Cheap:
           applyTheme is a class toggle and a few attribute writes. */
        document.addEventListener('click', function () {
            window.setTimeout(function () { applyTheme(readTheme()); }, 0);
        }, true);
    }

    /**
     * Re-resolve when the LANE changes, not only when the office does.
     *
     * Switching from the Daily Office to the Agpeya changes which settings
     * drawer carries `mode-hidden`, but that happens asynchronously — later
     * than the setTimeout(0) after the click. The resolver therefore read the
     * OLD lane, and the theme only corrected itself once the user nudged the
     * hour inside the new lane. Observed symptom: BCP Compline stayed light on
     * arrival, then went dark after switching to Evening Prayer and back.
     *
     * Watching the class attribute on the three drawers catches the lane change
     * whenever it actually lands, however long the render takes.
     */
    function watchLaneChanges() {
        if (typeof window.MutationObserver !== 'function') return;
        var pending = false;
        var obs = new window.MutationObserver(function () {
            if (pending) return;
            pending = true;
            window.setTimeout(function () {
                pending = false;
                if (shellOn()) applyTheme(readTheme());
            }, 0);
        });
        LANE_PANELS.forEach(function (entry) {
            var panel = document.getElementById(entry[0]);
            if (panel) obs.observe(panel, { attributes: true, attributeFilter: ['class'] });
        });
    }

    function init() {
        if (!shellOn()) return;
        watchLaneChanges();
        buildShell();
        watchOfficeChanges();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
