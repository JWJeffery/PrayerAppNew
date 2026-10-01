// ── js/menaion-commons.js ──────────────────────────────────────────────────
//
// MenaionCommons v1.0 (2026-10-01)
// Architecture layer: DATA RESOLVER for the Common of the Saints.
//
// Fills the Orthros/Vespers hymn slots that the engine otherwise renders as
// "not yet text-backed" for RANK-3 Menaion saints, using Orloff's *The General
// Menaion* (London 1899, from the Slavonic 16th ed. of 1862; public domain),
// ingested verbatim by scripts/menaion/ingest-orloff-commons.py into
// data/menaion/commons/<slug>.json (sections added by build-commons-sections.py).
//
// Scope, deliberately narrow:
//   - Only rank-3 commemorations listed in data/menaion/commons/mapping.json
//     (hand-reviewed). Anything unmapped keeps its existing deferred rubric.
//   - Only replaces a slot that is currently a deferred rubric (never real text).
//   - Great Feast (rank 1-2) propers are NOT touched.
//   - The saint's own proper hymns (where a service book has them) are not in
//     the corpus; the rendered text discloses that it is the Common.
//
// Exposed globally as window.MenaionCommons. Non-throwing.
// ──────────────────────────────────────────────────────────────────────────
const MenaionCommons = (() => {

    const BASE = 'data/menaion/commons/';

    const COMMON_LABEL = {
        'apostle': 'an Apostle', 'apostles-many': 'Several Apostles', 'hierarch': 'a Hierarch',
        'confessor': 'a Hierarch-Confessor', 'hieromartyr': 'a Hieromartyr', 'martyr': 'a Martyr',
        'female-martyr': 'a Female Martyr', 'monk': 'a Monk', 'nun': 'a Nun',
        'unmercenaries-wonderworkers': 'the Unmercenaries and Wonder-workers'
    };

    // engine slot key -> section kind, per office
    const SLOTS = {
        orthros: {
            'sessional-hymns-1': 'sessional_1',
            'sessional-hymns-2': 'sessional_2',
            'exapostilarion':    'exapostilarion',
            'praises-stichera':  'praises',
            'canon':             'canon'
        },
        vespers: {
            'stichera-at-lord-i-have-cried': 'vespers_stichera',
            'aposticha':                     'vespers_aposticha'
        }
    };

    // Only these existing resolvedAs values are deferred rubrics we may replace.
    const REPLACEABLE = {
        orthros: /^(orthros-rank3-menaion-(sessional-hymns|exapostilarion|praises)-deferred-rubric|orthros-feast-canon-rubric)$/,
        vespers: /^menaion-feast-rubric$/
    };

    const TROPARION_KEY = { orthros: 'troparion-of-the-day', vespers: 'troparion-or-apolytikion' };

    let _mappingPromise = null;
    const _commonPromises = {};

    async function _fetchJson(url) {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status + ' fetching ' + url);
        return resp.json();
    }

    function _loadMapping() {
        if (!_mappingPromise) {
            _mappingPromise = _fetchJson(BASE + 'mapping.json').catch(err => {
                console.warn('[MenaionCommons] mapping unavailable:', err.message);
                return null;
            });
        }
        return _mappingPromise;
    }

    function _loadCommon(slug) {
        if (!_commonPromises[slug]) {
            _commonPromises[slug] = _fetchJson(BASE + slug + '.json').catch(err => {
                console.warn('[MenaionCommons] common ' + slug + ' unavailable:', err.message);
                return null;
            });
        }
        return _commonPromises[slug];
    }

    function _render(lines, invocation) {
        return lines.join('\n\n').replace(/\{NAME\}/g, invocation);
    }

    function _buildItem(slotKey, kind, entry, common, section, original) {
        const commonLabel = COMMON_LABEL[entry.common] || entry.common;
        const baseLabel = (original && original.label ? String(original.label).split(' — ')[0] : slotKey);
        const body = _render(section.lines, entry.invocation);
        const note = '(Text: the Common of ' + commonLabel + ', Orloff, The General Menaion, London 1899 — ' +
                     'Slavonic usage. The proper hymns of ' + entry.invocation + ' themselves, where a service book ' +
                     'has them, are not yet in this corpus.)';
        return {
            type:       'stichera',
            key:        slotKey,
            label:      baseLabel + ' — Common of ' + commonLabel,
            text:       body + '\n\n' + note,
            source:     'Menaion Common (Orloff 1899)',
            rank:       3,
            commemoration: entry.name,
            commonId:   common.id,
            commonSource: common.source && common.source.url ? common.source.url : null,
            resolvedAs: 'menaion-orloff-common-text'
        };
    }

    /**
     * applyToSections(sections, officeKey)
     * Mutates the engine's already-resolved sections in place. Returns the
     * number of slots filled (0 when nothing applies).
     */
    async function applyToSections(sections, officeKey) {
        const slots = SLOTS[officeKey];
        if (!slots || !Array.isArray(sections)) return 0;

        const items = sections.flatMap(sec => Array.isArray(sec.items) ? sec.items : []);
        const trop = items.find(it => it && it.key === TROPARION_KEY[officeKey]) || null;
        if (!trop || trop.resolvedAs !== 'menaion-feast-troparion' || trop.rank !== 3 || !trop.commemoration) return 0;

        const mapping = await _loadMapping();
        if (!mapping || !Array.isArray(mapping.entries)) return 0;
        const entry = mapping.entries.find(e => e.name === trop.commemoration);
        if (!entry) return 0;

        const common = await _loadCommon('' + entry.common);
        if (!common || !Array.isArray(common.sections)) return 0;

        let filled = 0;
        for (const sec of sections) {
            if (!Array.isArray(sec.items)) continue;
            for (let i = 0; i < sec.items.length; i++) {
                const item = sec.items[i];
                if (!item || !Object.prototype.hasOwnProperty.call(slots, item.key)) continue;
                if (!REPLACEABLE[officeKey].test(item.resolvedAs || '')) continue;
                const section = common.sections.find(s => s.kind === slots[item.key] && s.lines && s.lines.length);
                if (!section) continue;   // this Common has no such section: keep the honest rubric
                sec.items[i] = _buildItem(item.key, slots[item.key], entry, common, section, item);
                filled++;
            }
        }
        return filled;
    }

    return { applyToSections };
})();

if (typeof window !== 'undefined') window.MenaionCommons = MenaionCommons;
