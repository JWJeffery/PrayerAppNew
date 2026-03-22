/* Orthros — Weekday Aposticha (Octoechos)
 *
 * Namespace : window.OCTOECHOS.orthros.aposticha.weekday.tones[tone][dayOfWeek]
 * dayOfWeek : JS Date.getDay() — 1=Monday … 6=Saturday (0=Sunday not used here)
 * Schema    : each slot is either null (untranscribed) or a direct array of
 *             stichera entry objects: [{ sticheron: N, text: '...' }, ...]
 * Status    : Scaffolded — all slots null pending source-secure transcription.
 * Integration: wired into _resolveOrthrosSlots() aposticha ordinary-weekday
 *              branch in horologion-engine.js (v6.4).
 */

window.OCTOECHOS = window.OCTOECHOS || {};
window.OCTOECHOS.orthros = window.OCTOECHOS.orthros || {};
window.OCTOECHOS.orthros.aposticha = window.OCTOECHOS.orthros.aposticha || {};

window.OCTOECHOS.orthros.aposticha.weekday = {
    meta: {
        label:  'Weekday Aposticha (Orthros)',
        office: 'orthros',
        family: 'aposticha',
        source: 'UNTRANSCRIBED'
    },

    tones: {
        1: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        2: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        3: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        4: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        5: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        6: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        7: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        8: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null }
    }
};
