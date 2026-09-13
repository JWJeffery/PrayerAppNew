/**
 * js/shell-flag.js — the hidden dev toggle for the redesigned office shell.
 *
 * See documentation/UI_REDESIGN_HANDOFF.md, Phase 1.
 *
 * Adds (or removes) `shell-v2` on <body>. That class is the sole gate on
 * css/office-shell.css: with it absent, every rule in that file is unreachable
 * and the app behaves exactly as it did before this file existed.
 *
 * HOW TO TURN IT ON — three ways, no devtools needed for the first two:
 *
 *     ?shell=v2      in the URL   → on, and remembered for this browser
 *     ?shell=v1      in the URL   → off, and remembered  (also: off, none)
 *     setUniversalOfficeShell('v2' | 'v1')   from the console
 *
 * Once set by URL the choice persists in localStorage, so it survives ordinary
 * navigation within the app and a reload without the parameter. A small gold
 * "SHELL V2" badge appears bottom-right while the flag is on, so the state is
 * verifiable without opening devtools. Phase 2 removes the badge, when the
 * shell itself becomes the evidence.
 *
 * WHY THIS IS A SEPARATE FILE AND NOT PART OF js/office-ui.js:
 * Phase 1's acceptance criterion is that the app is byte-identical in behaviour
 * with the flag off. Editing office-ui.js would mean bumping its cache-bust
 * param and re-verifying a 200KB file for a nine-line feature. A new file that
 * nothing else imports is the smaller claim to have to defend.
 *
 * THIS IS A DEV FLAG, NOT A USER PREFERENCE. It deliberately does NOT live in
 * `profile` / UNIVERSAL_OFFICE_USER_PROFILE_KEY alongside entryPageDefault,
 * ministryRole and oorSubtradition. Those are things a person chose about how
 * they pray; this is a build state that disappears at Phase 6. Mixing them
 * would leave a dead key in every user's stored profile forever.
 */

(function () {
    'use strict';

    var STORAGE_KEY = 'universalOfficeShellV2';
    var CLASS_NAME  = 'shell-v2';
    var BADGE_CLASS = 'uo-dev-flag';

    /* localStorage throws outright in some private-browsing modes rather than
       returning null. A dev flag must never be able to break the app for a real
       user praying an office, so every access is guarded and every failure
       falls back to "off". */
    function readStored() {
        try {
            return window.localStorage.getItem(STORAGE_KEY) === 'on';
        } catch (e) {
            return false;
        }
    }

    function writeStored(on) {
        try {
            if (on) {
                window.localStorage.setItem(STORAGE_KEY, 'on');
            } else {
                window.localStorage.removeItem(STORAGE_KEY);
            }
        } catch (e) {
            /* Not fatal: the flag simply won't persist past this page. */
        }
    }

    function readUrlOverride() {
        try {
            var value = new URLSearchParams(window.location.search).get('shell');
            if (value === null) return null;
            value = value.toLowerCase();
            if (value === 'v2' || value === 'on')  return true;
            if (value === 'v1' || value === 'off' || value === 'none') return false;
            return null;
        } catch (e) {
            return null;
        }
    }

    function setBadge(on) {
        var body = document.body;
        if (!body) return;

        var existing = body.querySelector('.' + BADGE_CLASS);
        if (!on) {
            if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
            return;
        }
        if (existing) return;

        var badge = document.createElement('div');
        badge.className = BADGE_CLASS;
        badge.setAttribute('aria-hidden', 'true');   /* dev chrome, not content */
        badge.textContent = 'shell v2';
        body.appendChild(badge);
    }

    function apply(on) {
        var body = document.body;
        if (!body) return;
        if (on) {
            body.classList.add(CLASS_NAME);
        } else {
            body.classList.remove(CLASS_NAME);
        }
        setBadge(on);
    }

    function resolve() {
        var override = readUrlOverride();
        if (override !== null) {
            writeStored(override);
            return override;
        }
        return readStored();
    }

    /* Public, for the console. Returns the state actually applied. */
    window.setUniversalOfficeShell = function (value) {
        var on = (value === 'v2' || value === 'on' || value === true);
        writeStored(on);
        apply(on);
        return on ? 'v2' : 'v1';
    };

    window.getUniversalOfficeShell = function () {
        return document.body && document.body.classList.contains(CLASS_NAME) ? 'v2' : 'v1';
    };

    /* This file is loaded immediately after <body> opens, so document.body
       exists and the class lands before first paint — no flash of the old shell
       before the new one. The DOMContentLoaded fallback covers the case of this
       script being moved into <head> by a later edit. */
    if (document.body) {
        apply(resolve());
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            apply(resolve());
        });
    }
}());
