/* Orthros — Sunday Resurrectional Exapostilarion (Svetilen)
 *
 * Namespace : window.OCTOECHOS.orthros.exapostilarion.sunday.eothinon
 * Keying    : 11-part Eothinon (Morning Gospel) cycle, not the 8-tone Octoechos.
 * Source    : NOT YET TRANSCRIBED. All entries are null pending transcription
 *             from a verified source (Jordanville Horologion 2008 or OCA/
 *             Antiochian published Orthros). Do not replace null with
 *             unverified prose.
 *
 * Structure:
 *   .gospels[1–11]  — null until transcribed; engine treats null as
 *                     'orthros-sunday-exapostilarion-eothinon-text-untranscribed'.
 *
 * Integration: Read by _resolveOrthrosSlots() in js/horologion-engine.js
 *              when dayOfWeek === 0 and OrthrosEothinonEngine returns
 *              applicable === true.
 *
 * Relationship to orthros-exapostilarion-sunday.js:
 *   That file (window.OCTOECHOS.orthros.exapostilarion.sunday.tones) is a
 *   schema error — it keys exapostilarion by Octoechos tone, which is
 *   incorrect for this slot. It is NOT read by the resolver. This file
 *   supersedes it for the Sunday Resurrectional Exapostilarion path.
 *
 * v1.0 — namespace and engine wiring established; corpus not yet transcribed.
 */

window.OCTOECHOS        = window.OCTOECHOS        || {};
window.OCTOECHOS.orthros = window.OCTOECHOS.orthros || {};
window.OCTOECHOS.orthros.exapostilarion =
    window.OCTOECHOS.orthros.exapostilarion || {};

window.OCTOECHOS.orthros.exapostilarion.sunday =
    window.OCTOECHOS.orthros.exapostilarion.sunday || {};

window.OCTOECHOS.orthros.exapostilarion.sunday.eothinon = {

    meta: {
        label:     'Sunday Resurrectional Exapostilarion (Svetilen)',
        office:    'orthros',
        family:    'exapostilarion',
        cycle:     'eothinon',
        source:    'UNTRANSCRIBED — requires verified source (Jordanville 2008 / OCA Orthros)',
        note:      'Keyed to the Resurrectional Matins Gospel (1–11), not to the Octoechos tone.'
    },

    gospels: {
        // null = not yet transcribed from verified source.
        // Replace null with a verified string when source text is confirmed.
        // DO NOT replace with reconstructed or paraphrased prose.

        1:  null,  // Eothinon I   — Matthew 28:16–20
        2:  null,  // Eothinon II  — Mark 16:1–8
        3:  null,  // Eothinon III — Mark 16:9–20
        4:  null,  // Eothinon IV  — Luke 24:1–12
        5:  null,  // Eothinon V   — Luke 24:12–35
        6:  null,  // Eothinon VI  — Luke 24:36–53
        7:  null,  // Eothinon VII — John 20:1–10
        8:  null,  // Eothinon VIII — John 20:11–18
        9:  null,  // Eothinon IX  — John 20:19–31
        10: null,  // Eothinon X   — John 21:1–14
        11: null   // Eothinon XI  — John 21:15–25
    }
};