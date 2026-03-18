/* Orthros — Sunday Resurrectional Exapostilarion / Svetilen
 *
 * Namespace : window.OCTOECHOS.orthros.exapostilarion.sunday.tones
 * Status    : SCHEMA ERROR — NOT USED BY RESOLVER.
 *             The Sunday Resurrectional Exapostilarion follows the eleven-part
 *             Eothinon cycle (keyed to the Resurrectional Matins Gospel), not
 *             the eight-tone Octoechos cycle. This tone-keyed structure is
 *             incorrect for this slot. The engine resolver no longer reads from
 *             this namespace. This file is retained for reference only pending
 *             a proper Eothinon implementation with gospel-number tracking.
 * Integration: Deliberately NOT read by _resolveOrthrosSlots() as of v6.1
 *              schema correction. The exapostilarion slot emits an explicit
 *              deferral rubric on all paths.
 */

window.OCTOECHOS = window.OCTOECHOS || {};
window.OCTOECHOS.orthros = window.OCTOECHOS.orthros || {};
window.OCTOECHOS.orthros.exapostilarion = window.OCTOECHOS.orthros.exapostilarion || {};

window.OCTOECHOS.orthros.exapostilarion.sunday = {
    meta: {
        label:  'Sunday Resurrectional Exapostilarion (Svetilen)',
        office: 'orthros',
        family: 'exapostilarion',
        source: 'Octoechos'
    },

    tones: {
        1: 'Exapostilarion text pending source confirmation. — Tone 1',
        2: 'Exapostilarion text pending source confirmation. — Tone 2',
        3: 'Exapostilarion text pending source confirmation. — Tone 3',
        4: 'Exapostilarion text pending source confirmation. — Tone 4',
        5: 'Exapostilarion text pending source confirmation. — Tone 5',
        6: 'Exapostilarion text pending source confirmation. — Tone 6',
        7: 'Exapostilarion text pending source confirmation. — Tone 7',
        8: 'Exapostilarion text pending source confirmation. — Tone 8'
    }
};

window.ORTHROS_SUNDAY_EXAPOSTILARION =
    window.OCTOECHOS.orthros.exapostilarion.sunday.tones;