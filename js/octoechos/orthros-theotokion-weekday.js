/* Orthros — Weekday Theotokion (Octoechos)
 *
 * Namespace : window.OCTOECHOS.orthros.theotokion.weekday.tones[tone][dayOfWeek]
 * dayOfWeek : JS Date.getDay() — 1=Monday … 6=Saturday (0=Sunday not used here)
 * Schema    : each slot is either null (untranscribed) or a plain string
 *             containing the full Theotokion text for that tone and weekday.
 *             Wednesday (3) and Friday (5) appoint a Stavrotheotokion
 *             (Cross Theotokion) rather than the ordinary Theotokion.
 * Status    : Scaffolded — all slots null pending source-secure transcription.
 * Integration: wired into _resolveOrthrosSlots() orthros-theotokion branch
 *              in horologion-engine.js (v6.5).
 */

window.OCTOECHOS = window.OCTOECHOS || {};
window.OCTOECHOS.orthros = window.OCTOECHOS.orthros || {};
window.OCTOECHOS.orthros.theotokion = window.OCTOECHOS.orthros.theotokion || {};

window.OCTOECHOS.orthros.theotokion.weekday = {
    meta: {
        label:  'Weekday Theotokion (Orthros)',
        office: 'orthros',
        family: 'theotokion',
        source: 'UNTRANSCRIBED',
        note:   'Wednesday (day 3) and Friday (day 5) appoint a Stavrotheotokion.'
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
