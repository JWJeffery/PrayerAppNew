// js/octoechos/orthros-exapostilarion-weekday.js
// Ordinary Weekday Exapostilarion (Svetilen) — Orthros / Matins
// Monday–Friday. One body per tone (Tones 1–8).
// Day differentiation is carried by endings, not separate daily bodies.
// Source: Lambertsen Octoechos, "Hymns of Light (Svetilen) at Matins
//         in the Eight Tones from the Oktoechos" (Daily Exapostilaria section).

window.OCTOECHOS = window.OCTOECHOS || {};
window.OCTOECHOS.orthros = window.OCTOECHOS.orthros || {};
window.OCTOECHOS.orthros.exapostilarion = window.OCTOECHOS.orthros.exapostilarion || {};

window.OCTOECHOS.orthros.exapostilarion.greatLentWeekday = {
    tones: {
        1: 'O Christ who doth make the light to shine, * cleanse Thou my soul from every sin.',
        2: 'Send forth Thine eternal light, O Christ my God, * and illumine the hidden eyes of my heart.',
        3: 'Send forth Thy light, O Christ my God, * and illumine my heart.',
        4: 'O Thou who dost make light shine forth upon Thy world, * cleanse my darkened soul from every sin.',
        5: 'O Lord the Giver of Light, * send down Thy light and illumine my heart.',
        6: 'Send down upon our souls * Thine everlasting light.',
        7: 'Stir me up to sing Thy praises, O Lord, * and teach me to do Thy will, O Holy One.',
        8: 'Thou art Light, O Christ, * fill me with Thine effulgent radiance.'
    },

    firstEndings: {
        monday:    'Through the protection of Thine angels, O Lord, and save me.',
        tuesday:   'By the prayers of Thy Forerunner, O Lord, and save me.',
        wednesday: 'By the power of Thy Cross, O Lord, and save me.',
        thursday:  'By the prayers of Thine apostles and St. Nicolas, O Lord, and save me.',
        friday:    'By the power of Thy Cross, O Lord, and save me.'
    },

    secondEnding: 'By the prayers of Thy saints, O Lord, and save me.',
    thirdEnding:  'By the prayers of the Theotokos, O Lord, and save me.',
 
    // ── Great Lent Saturday endings ───────────────────────────────────────
    // Source: Lambertsen / St. Sergius English Triodion,
    //         "Hymns to the Trinity and Hymns of Light … from the Oktoechos",
    //         Saturday rubrics.
    // On Saturdays the Exapostilarion is said only twice.
    // The Tone body from tones[n] is prepended by the engine before each ending.
    saturdayFirstEnding:  'By the prayers of Thy saints, O Lord, and save me.',
    saturdaySecondEnding: 'By the prayers of the Theotokos, O Lord, and save me.',
 
    // Tone III reposed hymn (used in place of a third Exapostilarion on the
    // 2nd, 3rd, and 4th Saturdays of Great Lent only).
    saturdayReposedThird: 'As Thou art God who hast dominion over both the living and the dead, * grant rest to Thy servants in the dwelling-place of the elect, * for though they have sinned, O Savior, ** yet they did not turn away from Thee.',
 
    // ── 1st Saturday of Great Lent: St. Theodore the Recruit ────────────
    // Source: St. Sergius English Triodion, "First Week of Lent: Saturday Matins",
    //         Exapostilarion of the holy great-martyr, Tone III.
    // Rubric: said twice; then the Theotokion (a separate slot, not encoded here).
    // The engine emits this field once. Full two-fold rendering is a known gap
    // pending engine expansion for this path.
    firstSaturdaySpecial: 'O crowned Saint, thou who standest now with the angels * before the judgment-seat of Christ: * Filled with the light of heaven, O passion-bearer, * intercede without ceasing for the peace of the whole world, * and for the salvation of us who reverently celebrate Thine effulgent memory, ** O spiritually rich martyr Theodore.',
 
    // ── 5th Saturday of Great Lent: Akathist (Praise of the Theotokos) ──
    // Source: St. Sergius English Triodion, "Saturday in the Fifth Week at Matins",
    //         Exapostilarion of the most holy Theotokos, Tone III.
    // Rubric: said thrice.
    // The engine emits this field once. Full three-fold rendering is a known gap
    // pending engine expansion for this path.
    fifthSaturdaySpecial: 'The mystery hidden from all ages * hath been made known today. * God from God, the Word hath become in His compassion * the Son of the Virgin Mary, * and Gabriel proclaimeth the Gospel of joy. * With him let us all cry aloud: ** Rejoice! Mother of the Lord.'
 
};