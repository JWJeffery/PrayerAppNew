// ── js/hymn-guide.js ───────────────────────────────────────────────────────
//
// HymnGuide v1.0 (2026-10-01)
// Where the app has no hymn TEXT for a Great Feast / major feast, say what is appointed instead:
// the tone and melody of each hymn and how many there are, taken from the AGES library's metadata
// (Fr. Seraphim Dedes, Greek Orthodox Archdiocese usage; CC0), plus one line on what the day's rank
// means. Metadata only -- no hymn text. Source: data/menaion/ages/guide/<MM>.json (built by
// scripts/menaion/ingest-ages-guide.py), entries listed in data/menaion/ages/guide/mapping.json
// (rank 1-2 only, whose identity the date fixes).
//
// Replaces ONLY a slot still showing a deferred-rubric note. Runs after MenaionCommons.
// Exposed as window.HymnGuide. Non-throwing.
// ──────────────────────────────────────────────────────────────────────────
const HymnGuide = (() => {

    const BASE = 'data/menaion/ages/guide/';

    // engine slot key -> [guide kind, sessional kathisma group]
    const SLOTS = {
        vespers: {
            'stichera-at-lord-i-have-cried': { kind: 'vespers_stichera', what: 'Stichera at “Lord, I have cried”' },
            'aposticha':                     { kind: 'vespers_aposticha', what: 'Aposticha' }
        },
        orthros: {
            'sessional-hymns-1': { kind: 'sessional', group: 1, what: 'Sessional hymn after the first kathisma' },
            'sessional-hymns-2': { kind: 'sessional', group: 2, what: 'Sessional hymn after the second kathisma' },
            'exapostilarion':    { kind: 'exapostilarion', what: 'Exapostilarion (Svetilen)' },
            'praises-stichera':  { kind: 'praises', what: 'Stichera at the Praises' }
        }
    };

    // Only a deferred-rubric note may be replaced (never real text).
    const REPLACEABLE = /^(menaion-feast-rubric|orthros-(menaion-feast|rank3-menaion|feast)-[\w-]*rubric|orthros-[\w-]*deferred-rubric)$/;

    const TROPARION_KEY = { orthros: 'troparion-of-the-day', vespers: 'troparion-or-apolytikion' };

    const RANK_LINE = {
        1: 'Great Feast: the feast’s own apolytikion replaces the Octoechos troparion, and the Octoechos is set aside.',
        2: 'Polyeleos feast: the Polyeleos (Psalms 134–135) is sung at Orthros, and the Octoechos is not sung.'
    };

    let _mapping = null;
    const _months = {};

    function _json(url) {
        return fetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).catch(() => null);
    }
    function _loadMapping() { return _mapping || (_mapping = _json(BASE + 'mapping.json')); }
    function _loadMonth(mm) { return _months[mm] || (_months[mm] = _json(BASE + mm + '.json')); }

    function _melody(m) {
        if (!m) return '';
        const s = String(m).replace(/\.$/, '');
        if (/^(idiomelon|automelon)$/i.test(s)) return s.toLowerCase();
        return 'to the melody “' + s + '”';
    }

    // Group consecutive numbered hymns that share tone and melody.
    function _describe(items, group) {
        let list = items;
        if (group) list = items.filter(i => i.index && i.index[0] === group);
        if (!list.length) return null;
        const parts = [];
        const nums = list.filter(i => i.role === 'n');
        let run = null;
        const flush = () => {
            if (!run) return;
            const label = group
                ? 'hymn' + (run.items.length > 1 ? 's ' : ' ') + run.items.map(i => i.index.length > 1 ? i.index[1] : i.index[0]).join(', ')
                : (run.items.length > 1 ? 'stichera ' + run.items[0].index[0] + '–' + run.items[run.items.length - 1].index[0]
                                        : 'sticheron ' + run.items[0].index[0]);
            parts.push(label + ': Tone ' + run.mode + (run.mel ? ', ' + run.mel : ''));
            run = null;
        };
        for (const h of nums) {
            const mel = _melody(h.melody);
            if (run && run.mode === h.mode && run.mel === mel) run.items.push(h);
            else { flush(); run = { mode: h.mode, mel, items: [h] }; }
        }
        flush();
        const extra = { glory: 'Glory…', both: 'Both now…', theotokion: 'Theotokion' };
        for (const role of ['glory', 'both', 'theotokion']) {
            for (const h of list.filter(i => i.role === role)) {
                parts.push(extra[role] + ': Tone ' + h.mode + (_melody(h.melody) ? ', ' + _melody(h.melody) : ''));
            }
        }
        return parts.length ? parts : null;
    }

    async function applyToSections(sections, officeKey) {
        const slots = SLOTS[officeKey];
        if (!slots || !Array.isArray(sections)) return 0;
        const items = sections.flatMap(sec => Array.isArray(sec.items) ? sec.items : []);
        const trop = items.find(it => it && it.key === TROPARION_KEY[officeKey]) || null;
        if (!trop || trop.resolvedAs !== 'menaion-feast-troparion' || !trop.commemoration) return 0;

        const mapping = await _loadMapping();
        const entry = mapping && Array.isArray(mapping.entries) ? mapping.entries.find(e => e.name === trop.commemoration) : null;
        if (!entry) return 0;
        const month = await _loadMonth(entry.mmdd.slice(0, 2));
        const day = month && month.dates ? month.dates[entry.mmdd] : null;
        if (!day || !day.slots) return 0;

        let n = 0;
        let rankShown = false;
        for (const sec of sections) {
            if (!Array.isArray(sec.items)) continue;
            for (let i = 0; i < sec.items.length; i++) {
                const item = sec.items[i];
                if (!item || !Object.prototype.hasOwnProperty.call(slots, item.key)) continue;
                if (item.type !== 'rubric' || !REPLACEABLE.test(item.resolvedAs || '')) continue;
                const spec = slots[item.key];
                const parts = day.slots[spec.kind] ? _describe(day.slots[spec.kind], spec.group) : null;
                if (!parts) continue;
                const rank = rankShown ? '' : (RANK_LINE[entry.rank] || '');
                rankShown = true;
                sec.items[i] = {
                    type: 'rubric', key: item.key,
                    label: spec.what + ' — what is appointed',
                    text: 'The Menaion proper for ' + entry.name + ' appoints, in Greek Archdiocese usage (AGES): ' + parts.join('; ') + '.' +
                          (rank ? '\n\n' + rank : '') +
                          '\n\n(The words of these hymns are not yet in this corpus. Tones and melodies are from the AGES library metadata; ' +
                          'Slavic usage may differ in count and order.)',
                    source: 'AGES library metadata (Greek Archdiocese usage), CC0',
                    rank: entry.rank, commemoration: entry.name, resolvedAs: 'hymn-guide'
                };
                n++;
            }
        }
        return n;
    }

    return { applyToSections };
})();

if (typeof window !== 'undefined') window.HymnGuide = HymnGuide;
