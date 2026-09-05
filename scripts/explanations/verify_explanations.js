// verify_explanations.js -- Liturgical Education Layer verification
// (Architectural Charter section 11).
//
// RUN THIS AFTER ANY CHANGE to data/explanations/*.json, js/explanations.js, or
// applyExplanationLayer() in js/office-ui.js:
//
//     cd <repo root>
//     npm install jsdom --no-save
//     node scripts/explanations/verify_explanations.js
//
// Must be run FROM THE REPO ROOT. It reads the real corpus files by relative
// path, loads the real js/explanations.js, and extracts the real
// applyExplanationLayer() out of js/office-ui.js by brace-depth parsing. It does
// NOT reimplement either. That is deliberate: the first version of
// scripts/saints/verify_sanctoral.js reimplemented the logic it was checking,
// then disagreed with the resolver and reported a failure that did not exist.
//
// SANITY GATE: part 1 aborts if the Anglican corpus loads zero entries. A
// harness that compares empty to empty reports a perfect pass and means nothing
// -- that exact failure happened on 2026-09-03, when a fetch shim was installed
// on the global object while the code under test called bare fetch(), which
// resolves lexically to Node's real global, so both sides loaded nothing. fetch
// is therefore assigned to BOTH global and globalThis below.
//
// A PHANTOM FAILURE, recorded so it is not re-introduced: an earlier version of
// the depth-0 no-op check reconstructed an "expected" HTML string by stripping
// the .office-container div, which #office-display's innerHTML legitimately
// keeps. It failed against correct code. The check now captures the real
// before-state and compares the DOM to itself. When this harness and the code
// disagree, establish which of the two is wrong before changing either.

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const REPO = process.cwd();
let pass = 0, fail = 0;
function check(name, cond, detail) {
    if (cond) { pass++; console.log(`  PASS  ${name}`); }
    else { fail++; console.log(`  FAIL  ${name}${detail ? '  -- ' + detail : ''}`); }
}

const dom = new JSDOM('<!doctype html><html><body><div id="office-display"></div><div id="uo-tooltip"></div><div id="uo-tradition-explanation" style="display:none"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;

globalThis.fetch = global.fetch = async (url) => {
    const p = path.join(REPO, url);
    if (!fs.existsSync(p)) return { ok: false, status: 404, text: async () => '' };
    return { ok: true, status: 200, text: async () => fs.readFileSync(p, 'utf8') };
};

eval(fs.readFileSync(path.join(REPO, 'js/explanations.js'), 'utf8'));
const Explanations = global.window.Explanations;
global.Explanations = Explanations;

function extractFn(name) {
    const src = fs.readFileSync(path.join(REPO, 'js/office-ui.js'), 'utf8');
    const start = src.indexOf('function ' + name + '(');
    if (start < 0) throw new Error(name + ' not found in js/office-ui.js');
    const i = src.indexOf('{', start);
    let d = 0;
    for (let j = i; j < src.length; j++) {
        if (src[j] === '{') d++;
        else if (src[j] === '}') { d--; if (d === 0) return src.slice(start, j + 1); }
    }
    throw new Error('unbalanced braces extracting ' + name);
}

// Markup matching the shape all four renderers actually emit:
// <span class="rubric-text">LABEL</span><span class="component-text">TEXT</span>
const OFFICE = '<div class="office-container">'
    + '<span class="rubric-text">Opening Sentence</span><span class="component-text">Grace to you...</span>'
    + '<span class="rubric-text">The Invitatory</span><span class="component-text">Lord, open our lips...</span>'
    + '<span class="rubric-text">The Suffrages</span><span class="component-text">V. Show us your mercy...</span>'
    + '<span class="rubric-text">A Wholly Unknown Label</span><span class="component-text">...</span>'
    + '<span class="rubric-text">The Officiant may then conclude the service with one of the following sentences of Scripture, at discretion</span><span class="component-text">...</span>'
    + '</div>';

function decoratorTests() {
    const fnSrc = extractFn('applyExplanationLayer');
    const el = global.document.getElementById('office-display');

    const setState = (mode, depth) => {
        global.selectedMode = mode;
        global.selectedExplanationDepth = depth;
    };
    const render = (mode, depth) => {
        setState(mode, depth);
        el.innerHTML = OFFICE;
        eval('(' + fnSrc + ')')('office-display');
        return el;
    };

    console.log('\n=== 9. Depth 0: the layer must be a complete no-op ===');
    setState('daily-office', 0);
    el.innerHTML = OFFICE;
    const depth0Before = el.innerHTML;
    eval('(' + fnSrc + ')')('office-display');
    check('depth 0 adds no markers', el.querySelectorAll('.uo-explanation-marker').length === 0);
    check('depth 0 adds no disclosures', el.querySelectorAll('.uo-explanation-structural').length === 0);
    check('depth 0 leaves the DOM byte-identical', el.innerHTML === depth0Before);

    console.log('\n=== 10. Depth 1: glosses only ===');
    render('daily-office', 1);
    const m1 = el.querySelectorAll('.uo-explanation-marker');
    check('markers added for known labels', m1.length === 3, `got ${m1.length}, expected 3`);
    check('no structural disclosures at depth 1', el.querySelectorAll('.uo-explanation-structural').length === 0);
    check('unknown label gets no marker', !/A Wholly Unknown Label<\/span>\u00a0<span/.test(el.innerHTML));
    check('long rubric prose (>80 chars) is skipped', !/discretion<\/span>\u00a0<span/.test(el.innerHTML));
    check('every marker carries a data-tip', [...m1].every(b => (b.getAttribute('data-tip') || '').length > 20));
    // INVERTED 2026-09-05, per Josh: a reader learning the office wants the fact,
    // not the editor and page it came from. The source must still be present in
    // the corpus (section 6 below still enforces that) but must NOT reach the
    // reader's tooltip.
    check('no tip leaks a page citation to the reader',
        [...m1].every(b => !/BCP 1979|Maclean|O.Leary|Hapgood|pp?\.\s?\d/.test(b.getAttribute('data-tip'))));
    check('liturgical text is untouched', el.innerHTML.includes('Lord, open our lips...'));

    console.log('\n=== 11. Depth 2: glosses + structure ===');
    render('daily-office', 2);
    check('markers still present', el.querySelectorAll('.uo-explanation-marker').length === 3);
    const d2 = el.querySelectorAll('.uo-explanation-structural');
    check('disclosures added', d2.length === 3, `got ${d2.length}`);
    check('disclosures collapsed by default', [...d2].every(d => !d.hasAttribute('open')));
    // INVERTED 2026-09-05, same reason as the depth-1 check above.
    check('no disclosure shows a source line to the reader',
        [...d2].every(d => !d.querySelector('.uo-explanation-source')));
    check('disclosure sits immediately after its label',
        el.innerHTML.indexOf('Opening Sentence</span>') < el.innerHTML.indexOf('uo-explanation-structural'));

    console.log('\n=== 12. Cross-tradition isolation under decoration ===');
    // This section formerly asserted that unsourced traditions decorate nothing.
    // As of 2026-09-04 no tradition is unsourced, so the check was REPLACED rather
    // than deleted: it now asserts that decorating one tradition never pulls an
    // entry from another, which is the property the original test protected.
    for (const mode of ['coptic-agpeya']) {
        render(mode, 2);
        check(`${mode}: honest empty, no markers or disclosures`,
            el.querySelectorAll('.uo-explanation-marker').length === 0 &&
            el.querySelectorAll('.uo-explanation-structural').length === 0);
    }

    console.log('\n=== 13. Idempotency: repeated passes must not double-decorate ===');
    setState('daily-office', 2);
    el.innerHTML = OFFICE;
    const f = eval('(' + fnSrc + ')');
    f('office-display'); f('office-display'); f('office-display');
    check('three passes still yield 3 markers',
        el.querySelectorAll('.uo-explanation-marker').length === 3,
        String(el.querySelectorAll('.uo-explanation-marker').length));
    check('three passes still yield 3 disclosures',
        el.querySelectorAll('.uo-explanation-structural').length === 3);
}

(async () => {
    console.log('\n=== 1. Corpus loading ===');
    await Explanations.loadAll();
    const cov = Explanations.coverage();
    console.log('  coverage:', JSON.stringify(cov));

    // SANITY GATE -- see the header note.
    if (!cov.ANG || cov.ANG.entries === 0) {
        console.log('\n!! SANITY GATE FAILED: the Anglican corpus loaded zero entries.');
        console.log('!! Aborting -- a pass on an empty set is worthless. Fix loading first.');
        process.exit(1);
    }
    check('Anglican corpus loaded', cov.ANG.state === 'loaded');
    check('Anglican has entries', cov.ANG.entries > 0, String(cov.ANG.entries));
    check('Anglican depth 1 populated', cov.ANG.depth1 > 0, String(cov.ANG.depth1));
    check('Anglican depth 2 populated', cov.ANG.depth2 > 0, String(cov.ANG.depth2));
    check('Anglican depth 3 present', cov.ANG.depth3 === true);
    // As of 2026-09-04 no scaffolds remain: all four traditions are populated.
    // This is asserted explicitly so that a regression emptying any corpus fails
    // rather than passing as "honestly empty" under the old scaffold loop.
    for (const code of ['ANG', 'BYZC', 'COE', 'OOR-COP']) {
        check(`${code} corpus loaded and populated`,
            cov[code] && cov[code].state === 'loaded' && cov[code].entries > 0 &&
            cov[code].depth1 > 0 && cov[code].depth2 > 0 && cov[code].depth3 === true,
            cov[code] ? `entries=${cov[code].entries}` : 'MISSING');
    }
    // Byzantine was populated from Hapgood 1906 on 2026-09-04. Asserted explicitly
    // rather than left in the scaffold loop, so that a regression which silently
    // emptied this file would fail rather than pass as "honestly empty".
    check('Byzantine corpus loaded', cov.BYZC && cov.BYZC.state === 'loaded');
    check('Byzantine has entries', cov.BYZC && cov.BYZC.entries > 0, String(cov.BYZC && cov.BYZC.entries));
    check('Byzantine depth 1 populated', cov.BYZC && cov.BYZC.depth1 > 0, String(cov.BYZC && cov.BYZC.depth1));
    check('Byzantine depth 2 populated', cov.BYZC && cov.BYZC.depth2 > 0, String(cov.BYZC && cov.BYZC.depth2));
    check('Byzantine depth 3 present', cov.BYZC && cov.BYZC.depth3 === true);
    // East Syriac populated from Maclean's Introduction 2026-09-04, same reasoning.
    check('East Syriac corpus loaded', cov.COE && cov.COE.state === 'loaded');
    check('East Syriac has entries', cov.COE && cov.COE.entries > 0, String(cov.COE && cov.COE.entries));
    check('East Syriac depth 1 populated', cov.COE && cov.COE.depth1 > 0, String(cov.COE && cov.COE.depth1));
    check('East Syriac depth 2 populated', cov.COE && cov.COE.depth2 > 0, String(cov.COE && cov.COE.depth2));
    check('East Syriac depth 3 present', cov.COE && cov.COE.depth3 === true);

    console.log('\n=== 2. Mode -> tradition routing ===');
    check('daily-office -> ANG', Explanations.traditionForMode('daily-office') === 'ANG');
    check('east-syriac -> COE', Explanations.traditionForMode('east-syriac') === 'COE');
    check('coptic-agpeya -> OOR-COP', Explanations.traditionForMode('coptic-agpeya') === 'OOR-COP');
    check('horologion -> BYZC', Explanations.traditionForMode('horologion') === 'BYZC');
    check('unknown mode -> null', Explanations.traditionForMode('nonsense') === null);

    console.log('\n=== 3. Labels the renderers ACTUALLY emit ===');
    // Extracted from js/office-ui.js's own rubric-text emissions, not invented.
    const realLabels = [
        'Opening Sentence', 'The Invitatory', 'Antiphon', 'Christ Our Passover',
        "The Lord's Prayer", 'A Collect', 'The Collect', 'A Prayer for Mission',
        'The Psalms', 'The Psalm', 'Confession of Sin', 'Absolution',
        'The Suffrages', 'O Gracious Light', 'The Great Litany',
        'The General Thanksgiving', 'A Prayer of St. Chrysostom',
        'The Magnificat', 'Nunc Dimittis', 'The Apostles\u2019 Creed'
    ];
    let matched = 0;
    for (const l of realLabels) {
        if (Explanations.lookup('ANG', l)) matched++;
        else console.log(`         (no entry for emitted label: "${l}")`);
    }
    check('emitted labels resolve', matched >= 15, `${matched}/${realLabels.length}`);

    console.log('\n=== 4. Curly-apostrophe normalization ===');
    const straight = Explanations.lookup('ANG', "The Apostles' Creed");
    const curly = Explanations.lookup('ANG', 'The Apostles\u2019 Creed');
    check('straight and curly apostrophes resolve to the same entry', !!straight && straight === curly);

    console.log('\n=== 5. Null-sentinel behaviour ===');
    check('COE depth 3 resolves', Explanations.traditionExplanation('COE') !== null);
    check('OOR-COP depth 3 resolves', Explanations.traditionExplanation('OOR-COP') !== null);
    check('ANG depth 3 resolves', Explanations.traditionExplanation('ANG') !== null);
    check('BYZC depth 3 resolves', Explanations.traditionExplanation('BYZC') !== null);
    check('unknown label returns null, never a guess', Explanations.lookup('ANG', 'Zzz Not A Real Label') === null);
    check('no cross-tradition bleed into COE', Explanations.lookup('COE', 'Opening Sentence') === null);
    check('no cross-tradition bleed into BYZC', Explanations.lookup('BYZC', 'Opening Sentence') === null);

    console.log('\n=== 6. Every populated entry carries a source ===');
    const ang = JSON.parse(fs.readFileSync(path.join(REPO, 'data/explanations/anglican.json'), 'utf8'));
    const byz = JSON.parse(fs.readFileSync(path.join(REPO, 'data/explanations/byzantine.json'), 'utf8'));
    const esy = JSON.parse(fs.readFileSync(path.join(REPO, 'data/explanations/east-syriac.json'), 'utf8'));
    const cop = JSON.parse(fs.readFileSync(path.join(REPO, 'data/explanations/coptic.json'), 'utf8'));
    const ALL = [['anglican', ang], ['byzantine', byz], ['east-syriac', esy], ['coptic', cop]];
    for (const [name, corpus] of ALL) {
        const uncited = Object.entries(corpus.entries)
            .filter(([, e]) => (e.micro || e.structural) && !e.source).map(([k]) => k);
        check(`${name}: no populated entry lacks a source`, uncited.length === 0, uncited.join(', '));
        check(`${name}: depth-3 text carries a source`,
            !corpus.traditionExplanation.text || !!corpus.traditionExplanation.source);
    }

    console.log('\n=== 7. Roles inside the closed Core Contract taxonomy ===');
    // Mirrors UNIVERSAL_OFFICE_CORE_CONTRACT.md section 7. `creed` and `doxology`
    // added by amendment 2026-09-04. If section 7 changes again, change this too
    // -- the taxonomy lives in three places (that doc, data/explanations/schema.json,
    // and here) and nothing else in the repo consumes it.
    const ROLES = new Set(['opening', 'psalmody', 'reading', 'canticle', 'hymn', 'creed',
        'doxology', 'prayer', 'intercession', 'antiphon', 'rubric', 'dismissal', 'other']);
    for (const [name, corpus] of ALL) {
        const badRoles = Object.entries(corpus.entries)
            .filter(([, e]) => !ROLES.has(e.role)).map(([k, e]) => `${k}=${e.role}`);
        check(`${name}: all roles in taxonomy`, badRoles.length === 0, badRoles.join(', '));
    }
    // The check above would still pass if the creed and doxology entries had been
    // left as 'other', so assert the 2026-09-04 amendment actually landed in the
    // data rather than only in the taxonomy document.
    check('creed entry uses the creed role', ang.entries.creed && ang.entries.creed.role === 'creed',
        ang.entries.creed ? ang.entries.creed.role : 'entry missing');
    check('Gloria Patri uses the doxology role',
        ang.entries['gloria-patri'] && ang.entries['gloria-patri'].role === 'doxology',
        ang.entries['gloria-patri'] ? ang.entries['gloria-patri'].role : 'entry missing');
    check('nothing is left parked in other',
        Object.values(ang.entries).filter(e => e.role === 'other').length === 0,
        Object.entries(ang.entries).filter(([, e]) => e.role === 'other').map(([k]) => k).join(', '));

    console.log('\n=== 8. Cited BCP pages exist in the in-repo PDF page range ===');
    const pages = new Set();
    const collect = (s) => {
        if (!s) return;
        for (const m of String(s).matchAll(/p{1,2}\.\s?(\d{1,4})(?:-(\d{1,4}))?/g)) {
            pages.add(+m[1]); if (m[2]) pages.add(+m[2]);
        }
    };
    Object.values(ang.entries).forEach(e => collect(e.source));
    collect(ang.traditionExplanation.source);
    const outOfRange = [...pages].filter(p => p < 1 || p > 1001);
    check('all cited pages within the 1001-page BCP', outOfRange.length === 0, outOfRange.join(', '));
    console.log(`         ${pages.size} distinct pages cited, range ${Math.min(...pages)}-${Math.max(...pages)}`);

    decoratorTests();

    console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
    process.exit(fail === 0 ? 0 : 1);
})();
