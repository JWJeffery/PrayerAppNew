/**
 * EXPLANATIONS.JS
 * The Liturgical Education Layer — Architectural Charter section 11.
 *
 * The charter makes educational explanation a first-class architectural layer
 * with three depths:
 *
 *   1. Micro-explanation      — short gloss answering "what is this?"
 *   2. Structural explanation — expandable, answering "how does this fit into
 *                               the office?"
 *   3. Tradition explanation  — broader, answering "how does this tradition
 *                               work, and how does it differ from others?"
 *
 * ARCHITECTURE NOTES, so the next session doesn't have to rediscover them:
 *
 * - One corpus file per tradition (data/explanations/*.json), never one shared
 *   file. UNIVERSAL_OFFICE_CORE_CONTRACT.md section 2 (non-flattening) and
 *   section 3 (resolver separation) both forbid a single cross-tradition
 *   explanatory store. A tradition's explanation is written from that
 *   tradition's own governing source or it is not written at all.
 *
 * - Attachment is by rendered label, not by component id. All four office
 *   renderers in js/office-ui.js emit the same markup shape --
 *   `<span class="rubric-text">LABEL</span><span class="component-text">TEXT</span>`
 *   -- so decorating the label after render gives ONE integration point per
 *   renderer instead of touching the ~90 string-concatenation sites inside
 *   renderBcpOffice() alone. That function's innerHTML string building is
 *   already recorded as architectural debt (OFFICE_UI_DOCUMENTATION.md section
 *   3, admin.todos -> innerHTML-architecture); this layer deliberately does not
 *   make it worse.
 *
 * - Null-sentinel, per Charter section 13. A null `micro` or `structural` means
 *   "not yet sourced." The resolver returns nothing and the UI shows nothing.
 *   It never substitutes a placeholder, a guess, or another tradition's text.
 *
 * - Depth 1 reuses the existing js/tooltip.js `.info-btn` / `data-tip` system.
 *   No second tooltip implementation is introduced.
 *
 * - Depth 2 uses a <details> disclosure, the same pattern already proven in
 *   _horologionBodyWrap().
 */
(function (global) {
    'use strict';

    var FILES = {
        ANG:       'data/explanations/anglican.json',
        COE:       'data/explanations/east-syriac.json',
        'OOR-COP': 'data/explanations/coptic.json',
        BYZC:      'data/explanations/byzantine.json'
    };

    // selectedMode (js/office-ui.js) -> tradition code.
    var MODE_TO_TRADITION = {
        'daily-office':  'ANG',
        'east-syriac':   'COE',
        'coptic-agpeya': 'OOR-COP',
        'horologion':    'BYZC'
    };

    var corpora = {};       // tradition code -> parsed file
    var lookups = {};       // tradition code -> normalized label -> entry
    var loadState = {};     // tradition code -> 'loaded' | 'missing' | 'error'

    function normalizeLabel(value) {
        return String(value == null ? '' : value)
            .replace(/\u2019/g, "'")          // curly apostrophe -> straight
            .replace(/\u00a0/g, ' ')          // nbsp -> space
            .replace(/\s+/g, ' ')
            .replace(/^[\s.,;:()\[\]-]+/, '')
            .replace(/[\s.,;:()\[\]-]+$/, '')
            .trim()
            .toLowerCase();
    }

    function buildLookup(code) {
        var corpus = corpora[code];
        var map = {};
        if (!corpus || !corpus.entries) { lookups[code] = map; return; }

        Object.keys(corpus.entries).forEach(function (key) {
            var entry = corpus.entries[key];
            if (!entry) return;

            // An entry with content but no source is a governance violation
            // (data/explanations/schema.json, rules). Refuse to serve it rather
            // than silently showing uncited explanatory text to a user.
            var hasContent = !!(entry.micro || entry.structural);
            if (hasContent && !entry.source) {
                console.warn('[explanations] entry "' + key + '" in ' + code +
                    ' carries content with no source; not loaded.');
                return;
            }

            var labels = Array.isArray(entry.matchLabels) ? entry.matchLabels.slice() : [];
            if (entry.label) labels.push(entry.label);

            labels.forEach(function (label) {
                var norm = normalizeLabel(label);
                if (!norm) return;
                if (map[norm] && map[norm]._key !== key) {
                    console.warn('[explanations] duplicate match label "' + label +
                        '" in ' + code + ': "' + map[norm]._key + '" vs "' + key + '".');
                    return;
                }
                map[norm] = { _key: key, entry: entry };
            });
        });

        lookups[code] = map;
    }

    function load(code) {
        if (!FILES[code]) return Promise.resolve(null);
        if (corpora[code] || loadState[code]) return Promise.resolve(corpora[code] || null);

        return fetch(FILES[code])
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.text();
            })
            .then(function (text) {
                if (!text || !text.trim()) { loadState[code] = 'missing'; return null; }
                corpora[code] = JSON.parse(text);
                buildLookup(code);
                loadState[code] = 'loaded';
                return corpora[code];
            })
            .catch(function (err) {
                // Soft dependency. The office must still render in full without
                // this layer; a missing explanation file degrades to no
                // explanations, never to a broken office.
                loadState[code] = 'error';
                console.warn('[explanations] could not load ' + FILES[code] + ':', err.message);
                return null;
            });
    }

    function loadAll() {
        return Promise.all(Object.keys(FILES).map(load));
    }

    function traditionForMode(mode) {
        return MODE_TO_TRADITION[mode] || null;
    }

    function lookup(code, label) {
        var map = lookups[code];
        if (!map) return null;
        var hit = map[normalizeLabel(label)];
        return hit ? hit.entry : null;
    }

    function traditionExplanation(code) {
        var corpus = corpora[code];
        if (!corpus || !corpus.traditionExplanation) return null;
        var te = corpus.traditionExplanation;
        if (!te.text) return null;                 // null-sentinel: show nothing
        if (!te.source) {
            console.warn('[explanations] tradition explanation for ' + code +
                ' has text with no source; not served.');
            return null;
        }
        return {
            label:  corpus.traditionLabel || code,
            text:   te.text,
            source: te.source
        };
    }

    // Honest reporting of what this layer actually holds, for the dashboard and
    // for any future audit pass. Counts nulls as gaps rather than hiding them.
    function coverage() {
        var out = {};
        Object.keys(FILES).forEach(function (code) {
            var corpus = corpora[code];
            if (!corpus) { out[code] = { state: loadState[code] || 'not-loaded' }; return; }
            var entries = corpus.entries || {};
            var keys = Object.keys(entries);
            var micro = 0, structural = 0;
            keys.forEach(function (k) {
                if (entries[k] && entries[k].micro) micro++;
                if (entries[k] && entries[k].structural) structural++;
            });
            out[code] = {
                state:        loadState[code] || 'not-loaded',
                sourceStatus: corpus.sourceStatus || 'unknown',
                entries:      keys.length,
                depth1:       micro,
                depth2:       structural,
                depth3:       !!(corpus.traditionExplanation && corpus.traditionExplanation.text)
            };
        });
        return out;
    }

    global.Explanations = {
        load:                 load,
        loadAll:              loadAll,
        lookup:               lookup,
        traditionForMode:     traditionForMode,
        traditionExplanation: traditionExplanation,
        normalizeLabel:       normalizeLabel,
        coverage:             coverage,
        _files:               FILES
    };
})(typeof window !== 'undefined' ? window : globalThis);
