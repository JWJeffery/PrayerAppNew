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
        1: {
    1: [
        { sticheron: 1, text: 'The next world awaiteth thee, O soul, and the Judge will rebuke thy hidden and evil deeds. Wherefore, tarry not amid the things that are here, but step forth beforetime, crying out to the Judge: Cleanse me, O God, and save me!' },
        { sticheron: 2, text: 'Overlook me not who am beset by sinful sloth, O my Savior, but lift my mind up to repentance, and show me to be a skillful laborer in Thy vineyard. Grant unto me the reward of the eleventh hour, and great mercy.' },
        { sticheron: 3, text: 'Martyricon: Come, O ye people, and with hymns and spiritual songs let us all honor the passion-bearers of Christ, for they are the luminaries of the world and the preachers of the Faith, the ever-flowing fountain from whence healings pour forth upon the faithful. By their supplications, O Christ our God, grant peace to Thy world and great mercy to our souls.' }
    ],
    2: null, 3: null, 4: null, 5: null, 6: null
},
        2: {
    1: [
        { sticheron: 1, text: 'Mindful of the unseemly sins I have committed, I flee to Thy compassions, emulating the publican, the harlot who wept, and the prodigal son; wherefore, I fall down before Thee, O Merciful One, and say: Before Thou condemnest me, O God, have pity and mercy upon me!' },
        { sticheron: 2, text: 'Martyricon: Ye suffered for Christ even unto death, O passion-bearers and martyrs. And though your souls are in the heavens, in the hand of God, your relics are venerated throughout the whole world. The priests and the people all bow down; and we cry out, rejoicing: Precious in the sight of the Lord is the death of His saints.' },
        { sticheron: 3, text: 'Martyricon: Every city and land honoreth your relics, O passion-bearers and martyrs; for, having suffered lawfully, ye have received heavenly crowns: wherefore, ye are the boast of hierarchs and the majesty of the Churches.' }
    ],
    2: null, 3: null, 4: null, 5: null, 6: null
},
        3: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        4: {
    1: [
        { sticheron: 1, text: 'Wash me with my tears, O Savior, for I have defiled myself with many sins; wherefore, I fall down before Thee, crying: I have sinned, O God! Have mercy on me!' },
        { sticheron: 2, text: 'I am a sheep of Thy reason-endowed flock, and I flee to Thee, the good Shepherd. Seek me out who am lost, O God, and have mercy on me.' },
        { sticheron: 3, text: 'Martyricon: Who is not filled with awe, beholding not filled with awe, beholding not filled with awe, beholding the good contest wherein ye struggled, O holy martyrs? How have ye, who are fleshly beings, vanquished the incorporeal foe, confessing Christ and having armed yourselves with His Cross? Wherefore, as is meet, ye have been shown to be expellers of the demons and opponents of the barbarians, unceasingly praying that our souls be saved.' }
    ],
    2: null, 3: null, 4: null, 5: null, 6: null
},
        5: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        6: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        7: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        8: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null }
    }
};
