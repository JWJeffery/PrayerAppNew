// ── js/orthodox-day.js ─────────────────────────────────────────────────────
//
// OrthodoxDay v1.0 (2026-10-01)
// DATA RESOLVER for the Eastern Orthodox calendar facts the engine lacks:
//   - the day's FAST (level, abstentions)
//   - the appointed SCRIPTURE READINGS (Vespers paroemias, Matins Gospel, Epistle, Gospel)
// from data/orthodox-day/<year>.json (built by scripts/orthodox-day/build-orthodox-day.py
// from orthocal.info; Slavic/OCA tradition, new calendar; citations only -- the scripture
// TEXT comes from the app's own Bible corpus via resolveScripturePericope()).
//
// Years without a data file (outside 2026-2027) are left entirely to the engine's own logic.
// Exposed as window.OrthodoxDay. Non-throwing.
// ──────────────────────────────────────────────────────────────────────────
const OrthodoxDay = (() => {

    const BASE = 'data/orthodox-day/';
    const _years = {};

    function _loadYear(year, old) {
        const ck = (old ? 'old/' : '') + year;
        if (!_years[ck]) {
            _years[ck] = fetch(BASE + (old ? 'old/' : '') + year + '.json')
                .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
                .catch(() => null);
        }
        return _years[ck];
    }

    // ── Patristic commentary on the appointed readings (data/commentary/readings) ──
    const _comm = {};
    function _loadCommentary(year) {
        if (!_comm[year]) {
            _comm[year] = fetch('data/commentary/readings/' + year + '.json')
                .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
                .catch(() => null);
        }
        return _comm[year];
    }

    // One commentary item for the first of these readings that has an excerpt, or null.
    async function _commentaryItem(iso, readings) {
        const data = await _loadCommentary(String(iso).slice(0, 4));
        if (!data || !data.entries) return null;
        for (const r of readings) {
            const h = data.entries[String(r.display || '').replace(/\u200b/g, '')];
            if (!h || !h.excerpt) continue;
            return {
                type: 'text', key: 'patristic-commentary',
                label: 'From the Fathers \u2014 ' + h.father + ', ' + h.work,
                text: h.excerpt + '\n\n(On ' + String(r.display).replace(/\u200b/g, '').replace(/(\d)\.(\d)/g, '$1:$2') + '. Public-domain translation; excerpt only.)',
                source: h.url, resolvedAs: 'orthodox-day-patristic-commentary'
            };
        }
        return null;
    }

    async function getDay(iso, old) {
        const data = await _loadYear(String(iso).slice(0, 4), !!old);
        return data && data.days ? (data.days[iso] || null) : null;
    }

    // ── Commemorations of the day, with short original lives where we have them ──
    const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    const _month = {};
    let _livesPromise = null;
    function _loadMonthFile(mm) {
        if (!_month[mm]) {
            _month[mm] = fetch('data/menaion/' + MONTHS[mm - 1] + '.json')
                .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).catch(() => null);
        }
        return _month[mm];
    }
    function _loadLives() {
        if (!_livesPromise) {
            _livesPromise = fetch('data/menaion/lives/lives.json')
                .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
                .then(j => j.lives || {}).catch(() => ({}));
        }
        return _livesPromise;
    }
    async function commemorationsText(iso, mmdd) {
        const key = mmdd || String(iso).slice(5), mm = parseInt(key.slice(0, 2), 10);
        const month = await _loadMonthFile(mm);
        const entry = month && month.dates ? month.dates[key] : null;
        if (!entry || !Array.isArray(entry.commemorations) || !entry.commemorations.length) return null;
        const lives = await _loadLives();
        const withLife = entry.commemorations.filter(c => lives[c.id]);
        if (!withLife.length) return null;
        const blocks = entry.commemorations.map(c => lives[c.id] ? c.name + '\n' + lives[c.id].life : null).filter(Boolean);
        blocks.push('(Short summaries written for this app from published sources such as the OCA lives of the saints; they are not liturgical texts.)');
        return blocks.join('\n\n');
    }

    function fastText(day) {
        const f = day && day.fast;
        if (!f) return null;
        const abst = Array.isArray(f.abstentions) ? f.abstentions : [];
        if (!f.level && !abst.length) {
            return f.exception === 11 ? 'No fast today (a fast-free period: no fast even on Wednesday and Friday).' : 'No fast today.';
        }
        let t = (f.description || 'Fast') + '.';
        if (abst.length) t += ' Abstain from: ' + abst.join(', ') + '.';
        if (f.exception_description && f.exception !== 10) t += ' (' + f.exception_description + '.)';
        return t;
    }

    // Orthocal citation -> a form the app's resolver accepts (best effort; else reference only)
    function _segments(display) {
        let s = String(display || '').replace(/\u200b/g, '').replace(/^Composite \d+ - /, '');
        s = s.replace(/\s*\((?:[-\d.:\s]*)?LXX\)/g, '').replace(/\s*\(-?[\d.]+ LXX\)/g, '');
        // "Jeremiah (Baruch 3.35-4.4)": the lectionary files Baruch under Jeremiah; cite the book it is read from
        s = s.replace(/^[A-Za-z ]+\(((?:\d\s)?[A-Za-z][A-Za-z ]*\s+\d[^)]*)\)\s*$/, '$1');
        s = s.replace(/(\d)\.(\d)/g, '$1:$2').replace(/\b3 ?\[1\] Kings/g, '1 Kings').replace(/\b4 ?\[2\] Kings/g, '2 Kings');
        const parts = s.split(';').map(x => x.trim()).filter(Boolean);
        let book = null;
        return parts.map(p => {
            p = p.replace(/^Matt\b/, 'Matthew');
            const m = p.match(/^((?:\d\s)?[A-Za-z][A-Za-z ]*?)\s+\d/);
            if (m) book = m[1].trim(); else if (book && /^\d/.test(p)) p = book + ' ' + p;
            return p;
        });
    }

    async function _readingBlock(readings) {
        const labels = [], texts = [];
        for (const r of readings) {
            const shown = String(r.display || '').replace(/(\d)\.(\d)/g, '$1:$2');
            const label = (r.description ? r.description + ': ' : '') + shown;
            labels.push(label);
            let body = null;
            try {
                if (typeof window.resolveScripturePericope === 'function') {
                    const res = await window.resolveScripturePericope(_segments(r.display));
                    if (res && !res.unavailable && res.text) body = res.text;
                }
            } catch (e) { body = null; }
            texts.push(label + '\n\n' + (body || '(Text not available in this corpus. Read the citation above from the Apostol / Gospel book.)'));
        }
        return { label: labels.join(' / '), text: texts.join('\n\n') };
    }

    function _find(sections, key) {
        for (const s of sections) {
            if (!Array.isArray(s.items)) continue;
            const i = s.items.findIndex(it => it && it.key === key);
            if (i !== -1) return { section: s, index: i };
        }
        return null;
    }

    /**
     * applyToSections(sections, officeKey, iso) -- mutates the engine's resolved sections.
     * Returns the number of items added or replaced.
     */
    async function applyToSections(sections, officeKey, iso, opts) {
        opts = opts || {};
        if (!['vespers', 'orthros', 'typika'].includes(officeKey) || !Array.isArray(sections) || !sections.length) return 0;
        const day = await getDay(iso, opts.old);
        if (!day) return 0;
        let n = 0;

        // 1. The fast, as the first item of the office.
        const ft = fastText(day);
        const first = sections.find(s => Array.isArray(s.items));
        if (ft && first) {
            first.items.unshift({
                type: 'text', key: 'fast-today', label: 'The Fast Today',
                text: ft, source: 'Orthodox calendar data (orthocal.info, OCA/Slavic)', resolvedAs: 'orthodox-day-fast'
            });
            n++;
        }

        // 1b. Who is commemorated, with a short life where we have one.
        const ct = await commemorationsText(iso, opts.mmdd);
        if (ct && first) {
            first.items.splice(1, 0, {
                type: 'text', key: 'commemorated-today', label: 'Commemorated Today',
                text: ct, source: 'Original summaries (data/menaion/lives)', resolvedAs: 'orthodox-day-commemorations'
            });
            n++;
        }

        const by = src => (day.readings || []).filter(r => src(r.source || ''));

        // 2. Vespers: the appointed paroemias/readings replace the empty placeholder.
        if (officeKey === 'vespers') {
            const rd = by(s => /^Vespers/.test(s));
            const hit = _find(sections, 'vesperal-reading');
            if (rd.length && hit && /placeholder|rubric/.test(hit.section.items[hit.index].type || '')) {
                const b = await _readingBlock(rd);
                hit.section.items[hit.index] = {
                    type: 'text', key: 'vesperal-reading', label: 'Vesperal Readings — ' + b.label, text: b.text,
                    source: 'Orthodox lectionary (orthocal.info, OCA/Slavic); scripture text from the app corpus', resolvedAs: 'orthodox-day-vesperal-readings'
                };
                n++;
            }
        }

        // 3. Orthros: the Gospel at Matins (before Psalm 50), when the engine has none.
        if (officeKey === 'orthros') {
            const rd = by(s => /Matins Gospel$/.test(s));
            const hasGospel = sections.some(s => (s.items || []).some(it => it && /gospel/i.test(it.key || '')));
            const at = _find(sections, 'psalm-50') || _find(sections, 'canon');
            if (rd.length && at && !hasGospel) {
                const b = await _readingBlock(rd);
                at.section.items.splice(at.index, 0, {
                    type: 'text', key: 'matins-gospel', label: 'The Gospel at Matins — ' + b.label, text: b.text,
                    source: 'Orthodox lectionary (orthocal.info, OCA/Slavic); scripture text from the app corpus', resolvedAs: 'orthodox-day-matins-gospel'
                });
                n++;
                const ci = await _commentaryItem(iso, rd);
                if (ci) { at.section.items.splice(at.index + 1, 0, ci); n++; }
            }
        }

        // 4. Typika: the day's Epistle(s) and Gospel(s) from the published lectionary.
        if (officeKey === 'typika') {
            for (const [key, src, title] of [['typika-epistle-rubric', 'Epistle', 'The Epistle'], ['typika-gospel-rubric', 'Gospel', 'The Holy Gospel']]) {
                const rd = by(s => s === src);
                const hit = _find(sections, key);
                if (!rd.length || !hit) continue;
                const b = await _readingBlock(rd);
                hit.section.items[hit.index] = {
                    type: 'text', key, label: title + ' — ' + b.label, text: b.text,
                    source: 'Orthodox lectionary (orthocal.info, OCA/Slavic); scripture text from the app corpus', resolvedAs: 'orthodox-day-' + src.toLowerCase()
                };
                n++;
                const ci = await _commentaryItem(iso, rd);
                if (ci) { hit.section.items.splice(hit.index + 1, 0, ci); n++; }
            }
        }
        return n;
    }

    return { getDay, fastText, applyToSections };
})();

if (typeof window !== 'undefined') window.OrthodoxDay = OrthodoxDay;
