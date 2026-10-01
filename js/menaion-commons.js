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
// Saint-specific texts (AGES, Fr. Seraphim Dedes' GOA English translations, CC0) take
// precedence over the Common for the few slots approved in data/menaion/ages/mapping.json
// (slot approved only when every selected hymn names the saint); the Common fills the rest.
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
        'unmercenaries-wonderworkers': 'the Unmercenaries and Wonder-workers',
        'hierarchs-many': 'Several Hierarchs', 'martyrs-many': 'Several Martyrs', 'prophet': 'a Prophet',
        'angels': 'the Holy Angels'
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

    const AGES_BASE = 'data/menaion/ages/';
    const AGES_KIND = { 'exapostilarion': 'exapostilarion', 'praises-stichera': 'praises',
                        'stichera-at-lord-i-have-cried': 'vespers_stichera', 'aposticha': 'vespers_aposticha' };
    let _agesMappingPromise = null;
    const _agesMonthPromises = {};

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

    function _loadAgesMapping() {
        if (!_agesMappingPromise) {
            _agesMappingPromise = _fetchJson(AGES_BASE + 'mapping.json').catch(err => {
                console.warn('[MenaionCommons] AGES mapping unavailable:', err.message);
                return null;
            });
        }
        return _agesMappingPromise;
    }

    function _loadAgesMonth(mm) {
        if (!_agesMonthPromises[mm]) {
            _agesMonthPromises[mm] = _fetchJson(AGES_BASE + mm + '.json').catch(err => {
                console.warn('[MenaionCommons] AGES month ' + mm + ' unavailable:', err.message);
                return null;
            });
        }
        return _agesMonthPromises[mm];
    }

    function _buildAgesItem(slotKey, agesEntry, hymns, original) {
        const baseLabel = (original && original.label ? String(original.label).split(' — ')[0] : slotKey);
        const lines = [];
        let lastMode = null;
        for (const h of hymns) {
            if (h.mode && h.mode !== lastMode) { lines.push('(Tone ' + h.mode + ')'); lastMode = h.mode; }
            lines.push(h.text);
        }
        lines.push('(Text: translation by Fr. Seraphim Dedes for the Greek Orthodox Archdiocese of America (AGES), ' +
                   'CC0. Greek-Archdiocese usage: the selection and order of hymns may differ from Slavic usage.)');
        return {
            type:       'stichera',
            key:        slotKey,
            label:      baseLabel + ' — Proper hymns (AGES)',
            text:       lines.join('\n\n'),
            source:     'AGES (Fr. Seraphim Dedes, GOA)',
            rank:       3,
            commemoration: agesEntry.name,
            resolvedAs: 'menaion-ages-text'
        };
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
                     'Slavonic usage. The proper hymns of ' + (entry.subject || entry.invocation) + ' themselves, where a service book ' +
                     'has them, are not yet in this corpus.' + (entry.note && /Equal-to-the-Apostles/.test(entry.note)
                         ? ' Orloff has no Common for the Equal-to-the-Apostles; the ' + 'Common of ' + commonLabel + ' is used.' : '') + ')';
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

    // ── Rank 4 (three-stichera commemorations): Vespers stichera ONLY ──────────
    // Josh 2026-10-01: add just the saint's three "Lord, I have cried" stichera from
    // the Common (hand-reviewed data/menaion/commons/mapping-rank4.json). Where the
    // engine shows only the "proper stichera should be appointed" rubric, that rubric
    // is replaced; where it shows the Octoechos stichera, the saint's three follow.
    let _rank4Promise = null;
    function _loadRank4Mapping() {
        if (!_rank4Promise) {
            _rank4Promise = _fetchJson(BASE + 'mapping-rank4.json').catch(err => {
                console.warn('[MenaionCommons] rank-4 mapping unavailable:', err.message);
                return null;
            });
        }
        return _rank4Promise;
    }

    async function _applyRank4Vespers(sections, trop) {
        const mapping = await _loadRank4Mapping();
        const entry = mapping && Array.isArray(mapping.entries)
            ? mapping.entries.find(e => e.name === trop.commemoration) : null;
        if (!entry) return 0;
        const common = await _loadCommon('' + entry.common);
        const sec = common && Array.isArray(common.sections)
            ? common.sections.find(s => s.kind === 'vespers_stichera' && s.lines && s.lines.length) : null;
        if (!sec) return 0;

        // header + melody line + the first stichera, up to the Glory/Theotokion rubric
        const cut = sec.lines.findIndex((l, i) => i > 0 && /^\(\s*Glory/i.test(l));
        const lines = cut > 0 ? sec.lines.slice(0, cut) : sec.lines.slice(0, 5);
        if (lines.length < 3) return 0;
        const commonLabel = COMMON_LABEL[entry.common] || entry.common;

        for (const s of sections) {
            if (!Array.isArray(s.items)) continue;
            for (let i = 0; i < s.items.length; i++) {
                const item = s.items[i];
                if (!item || item.key !== 'stichera-at-lord-i-have-cried') continue;
                const replaceRubric = item.resolvedAs === 'menaion-feast-rubric';
                const afterOctoechos = item.resolvedAs === 'octoechos-baseline-ordinary';
                if (!replaceRubric && !afterOctoechos) return 0;
                const note = replaceRubric
                    ? '(Three stichera of the commemoration, from the Common of ' + commonLabel + '. The stichera of the day\'s tone ' +
                      '(Octoechos) that the Typikon sings with them are not shown here.)'
                    : '(The three stichera of the commemoration follow the Octoechos stichera above, from the Common of ' + commonLabel + '.)';
                const built = {
                    type:       'stichera',
                    key:        'stichera-at-lord-i-have-cried' + (afterOctoechos ? '-menaion' : ''),
                    label:      'Stichera at "Lord, I have cried" — ' + (afterOctoechos ? 'of the Commemoration' : 'Common of ' + commonLabel),
                    text:       _render(lines, entry.invocation) + '\n\n' + note + '\n\n(Text: Orloff, The General Menaion, London 1899 — Slavonic usage. ' +
                                'The proper hymns of ' + entry.invocation + ' themselves, where a service book has them, are not yet in this corpus.)',
                    source:     'Menaion Common (Orloff 1899)',
                    rank:       4,
                    commemoration: entry.name,
                    commonId:   common.id,
                    resolvedAs: 'menaion-orloff-common-text-rank4'
                };
                if (replaceRubric) s.items[i] = built; else s.items.splice(i + 1, 0, built);
                return 1;
            }
        }
        return 0;
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
        if (!trop || trop.resolvedAs !== 'menaion-feast-troparion' || !trop.commemoration) return 0;
        if (trop.rank === 4) return officeKey === 'vespers' ? _applyRank4Vespers(sections, trop) : 0;
        if (trop.rank !== 3) return 0;

        const mapping = await _loadMapping();
        const entry = mapping && Array.isArray(mapping.entries)
            ? mapping.entries.find(e => e.name === trop.commemoration) : null;
        const agesMapping = await _loadAgesMapping();
        const agesEntry = agesMapping && Array.isArray(agesMapping.entries)
            ? agesMapping.entries.find(e => e.name === trop.commemoration) : null;
        if (!entry && !agesEntry) return 0;

        const common = entry ? await _loadCommon('' + entry.common) : null;
        const agesMonth = agesEntry ? await _loadAgesMonth(agesEntry.mmdd.slice(0, 2)) : null;
        const agesDay = agesMonth && agesMonth.dates ? agesMonth.dates[agesEntry.mmdd] : null;

        let filled = 0;
        for (const sec of sections) {
            if (!Array.isArray(sec.items)) continue;
            for (let i = 0; i < sec.items.length; i++) {
                const item = sec.items[i];
                if (!item || !Object.prototype.hasOwnProperty.call(slots, item.key)) continue;
                if (!REPLACEABLE[officeKey].test(item.resolvedAs || '')) continue;

                // 1. Saint-specific AGES hymns, when this slot is approved for this saint.
                const agesKind = AGES_KIND[item.key];
                const approved = agesEntry && agesKind && agesEntry.slots ? agesEntry.slots[agesKind] : null;
                if (approved && agesDay && agesDay.slots && Array.isArray(agesDay.slots[agesKind])) {
                    const hymns = agesDay.slots[agesKind]
                        .filter(h => h.role === 'n' && approved.indexOf(h.index[0]) !== -1);
                    if (hymns.length) {
                        sec.items[i] = _buildAgesItem(item.key, agesEntry, hymns, item);
                        filled++;
                        continue;
                    }
                }

                // 2. Otherwise the Orloff Common, when this saint is mapped to one.
                if (!entry || !common || !Array.isArray(common.sections)) continue;
                if (Array.isArray(entry.skip) && entry.skip.indexOf(slots[item.key]) !== -1) continue;
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
