// ── js/day-guide.js ────────────────────────────────────────────────────────
//
// DayGuide v1.0 (2026-10-01)
// A plain-language "About Today's Service" panel, added as the first item of Vespers, Orthros and Typika.
// It explains (a) what day this is and its Typikon sign, (b) which hymns govern and why, and (c) honestly,
// where each kind of hymn on the page came from. It is composed from what the engine actually resolved plus
// js/orthodox-day.js data (data/orthodox-day), so it can never describe a service the page is not showing.
//
// Years without orthodox-day data get a shorter panel (no Typikon sign). Exposed as window.DayGuide. Non-throwing.
// ──────────────────────────────────────────────────────────────────────────
const DayGuide = (() => {

    // What the Typikon signs Orthocal reports mean, in plain words.
    const SIGN = {
        0: 'No Typikon sign: an ordinary day of the Octoechos and a lesser commemoration.',
        1: 'Presanctified Liturgy day (Great Lent).',
        2: 'Six-stichera feast (black squiggle): six stichera are sung at “Lord, I have cried”.',
        3: 'Doxology feast (red squiggle): the Great Doxology is sung at Matins, and the saint’s service is fuller than on an ordinary day.',
        4: 'Polyeleos feast (red cross): at Matins Psalms 134–135 are sung with the Polyeleos refrain, and the Gospel is read.',
        5: 'Vigil feast (red cross with half-circle): an all-night vigil is appointed — Great Vespers with the litia, then Matins.',
        6: 'Great feast (red cross in a circle): a vigil with the full festal rites of the day.',
        7: 'Major feast of the Theotokos: kept with the full festal rites.',
        8: 'Major feast of the Lord: kept with the full festal rites.'
    };

    const WEEKDAY = {
        0: 'Sunday keeps the Resurrection.',
        1: 'Monday’s Octoechos theme is the Bodiless Powers (the Angels).',
        2: 'Tuesday’s Octoechos theme is St John the Baptist and the Prophets.',
        3: 'Wednesday’s Octoechos theme is the Cross and the Theotokos.',
        4: 'Thursday’s Octoechos theme is the Holy Apostles and St Nicholas.',
        5: 'Friday’s Octoechos theme is the Cross and the Theotokos.',
        6: 'Saturday’s Octoechos theme is All Saints and the departed.'
    };

    // The app's own rank model (data/menaion/schema.json) in plain words.
    const RANK = {
        1: 'a Great Feast: the feast’s own troparion is sung and the Octoechos is set aside',
        2: 'a polyeleos feast: the saint’s troparion is sung and the Octoechos is not sung',
        3: 'a six-stichera or doxology commemoration: the saint’s troparion is sung in place of the weekday troparion',
        4: 'a simple commemoration: the saint’s troparion is sung, with the day’s Octoechos hymns still governing'
    };

    function _all(sections) {
        return sections.flatMap(s => Array.isArray(s.items) ? s.items : []).filter(Boolean);
    }

    function _commonLabel(items) {
        const hit = items.find(i => i.resolvedAs && /^menaion-orloff-common-text/.test(i.resolvedAs) && /Common of /.test(i.label || ''));
        const m = hit ? /Common of ([^—]+?)\s*$/.exec(hit.label) : null;
        return m ? m[1] : null;
    }

    function _sourcesLine(items) {
        const has = r => items.some(i => i.resolvedAs && r.test(i.resolvedAs));
        const parts = [];
        const common = _commonLabel(items);
        if (has(/^menaion-orloff-common-text/)) {
            parts.push('some of the commemoration’s hymns are taken from the Common' + (common ? ' of ' + common : '') +
                       ' (Orloff, The General Menaion, 1899, Slavonic usage) — the saint’s own proper hymns are not yet in this corpus');
        }
        if (has(/^menaion-ages-text$/)) parts.push('some hymns are the saint’s own, from the AGES library (Greek Archdiocese usage)');
        if (has(/^hymn-guide$/)) parts.push('where the words are not yet available, the page lists the tone, melody and number of hymns appointed');
        const deferred = items.some(i => i.type === 'rubric' && /deferred|not-embedded|menaion-feast-rubric|menaion-text-unavailable/.test(i.resolvedAs || ''));
        if (deferred) parts.push('some hymns are still marked “not yet in this corpus”');
        return parts.length ? 'On this page ' + parts.join('; ') + '.' : null;
    }

    async function applyToSections(sections, officeKey, iso, dateObj) {
        if (!['vespers', 'orthros', 'typika'].includes(officeKey) || !Array.isArray(sections) || !sections.length) return 0;
        const first = sections.find(s => Array.isArray(s.items));
        if (!first) return 0;
        const items = _all(sections);
        const lines = [];

        const day = (window.OrthodoxDay && window.OrthodoxDay.getDay) ? await window.OrthodoxDay.getDay(iso) : null;
        const dow = dateObj ? dateObj.getDay() : null;

        // 1. What day it is.
        if (day) {
            const t = (day.titles && day.titles[0]) || day.title;
            lines.push((t ? t + '. ' : '') + (day.tone ? 'Tone ' + day.tone + '.' : ''));
            if (SIGN[day.feast_level] !== undefined) lines.push(SIGN[day.feast_level]);
        }
        if (dow !== null && WEEKDAY[dow]) lines.push(WEEKDAY[dow]);

        // 2. Which troparion governs, and why.
        const trop = items.find(i => i && (i.key === 'troparion-of-the-day' || i.key === 'troparion-or-apolytikion'));
        if (trop && trop.resolvedAs === 'menaion-feast-troparion' && RANK[trop.rank]) {
            lines.push('The troparion today is for ' + (trop.commemoration || 'the commemoration') + ', ' + RANK[trop.rank] + '.');
        } else if (trop && /resurrectional|sunday/i.test(trop.resolvedAs || '')) {
            lines.push('The Resurrection governs today; a commemoration of the day is added after it.');
        } else if (trop && /lenten|great-lent|triodion/i.test(trop.resolvedAs || '')) {
            lines.push('Great Lent’s own services govern today: a saint of rank 3–4 does not displace the Lenten weekday office (only a Great Feast or polyeleos feast does).');
        } else if (trop && /paschal|bright|pentecostarion/i.test(trop.resolvedAs || '')) {
            lines.push('The Paschal season’s own services govern today.');
        } else if (trop && /holy-week/i.test(trop.resolvedAs || '')) {
            lines.push('Holy Week’s own services govern today.');
        } else if (trop && trop.resolvedAs) {
            lines.push('The weekday Octoechos governs today; no commemoration of high enough rank displaces it.');
        }

        // 3. Where the hymns on the page come from.
        const src = _sourcesLine(items);
        if (src) lines.push(src);

        if (!lines.length) return 0;
        first.items.unshift({
            type: 'text', key: 'about-today', label: 'About Today’s Service',
            text: lines.filter(Boolean).join('\n\n'),
            source: 'Composed from the engine’s resolved office and orthocal.info (OCA/Slavic)', resolvedAs: 'day-guide'
        });
        return 1;
    }

    return { applyToSections };
})();

if (typeof window !== 'undefined') window.DayGuide = DayGuide;
