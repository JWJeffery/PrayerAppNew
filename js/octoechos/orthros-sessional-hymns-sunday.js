/* Orthros — Sunday Resurrectional Sessional Hymns (Octoechos)
 *
 * Namespace : window.OCTOECHOS.orthros.sessionalHymns.sunday.tones
 * Status    : Schema + provisional corpus. Texts are provisional pending
 *             source confirmation against the Slavic Octoechos
 *             (Jordanville / Hapgood tradition).
 * Integration: wired into _resolveOrthrosSlots() sessional-hymns Sunday
 *              branch in horologion-engine.js.
 */

window.OCTOECHOS = window.OCTOECHOS || {};
window.OCTOECHOS.orthros = window.OCTOECHOS.orthros || {};
window.OCTOECHOS.orthros.sessionalHymns = window.OCTOECHOS.orthros.sessionalHymns || {};

window.OCTOECHOS.orthros.sessionalHymns.sunday = {
    meta: {
        label:  'Sunday Resurrectional Sessional Hymns',
        office: 'orthros',
        family: 'sessional-hymns',
        source: 'Octoechos'
    },

    tones: {
        1: {
            afterKathisma1: 'The angelic powers trembled at Thy Resurrection, O Saviour, for Thou didst crush the power of the enemy, and didst raise Adam with Thee, releasing all from Hades. Wherefore we hymn Thee in faith: O Lord who art risen from the dead, glory to Thee!',
            afterKathisma2: 'Thou wast crucified and buried, O immortal Life, and didst rise on the third day as God in power and might, raising Adam together with Thee from corruption. O Lord, glory to Thee!'
        },
        2: {
            afterKathisma1: 'The stone was sealed, the soldiers kept watch, yet Thou didst rise on the third day, O Saviour of the world. Thou didst grant life incorruptible. Wherefore the heavenly powers cry unto Thee: O Giver of life, glory to Thy Resurrection, O Christ!',
            afterKathisma2: 'Death was vanquished, Hades was despoiled, when Thou, O immortal Word, wast united with the mortal nature, and Thou didst raise the dead and shine light upon those who lay in darkness. O Lord, glory to Thee!'
        },
        3: {
            afterKathisma1: 'Thou wast taken down from the Cross, O Master, and laid in a tomb; but Thou didst rise as God and didst enlighten all creation. Wherefore we cry unto Thee: O Giver of life, glory to Thy Resurrection, O Christ!',
            afterKathisma2: 'Having suffered willingly and risen in glory, Thou hast granted us resurrection, O Christ. Wherefore ceaselessly we hymn and bless Thee: O Lord who didst rise from the dead, glory to Thee!'
        },
        4: {
            afterKathisma1: 'The women beheld the Resurrection of Christ; with trembling and great joy they ran to tell the Apostles. They proclaimed the good tidings of salvation: that the Lord, rising from the tomb, hath granted us great mercy.',
            afterKathisma2: 'O Lord, Thou wast crucified for our sake and wast buried, and Thou didst rise from the dead as God, granting incorruption to our mortal nature. O Lord, glory to Thee!'
        },
        5: {
            afterKathisma1: 'Let us praise the Saviour who was incarnate of the Virgin: for He was crucified for us, and on the third day He arose, granting us great mercy.',
            afterKathisma2: 'Thou didst arise, O Christ, who art the resurrection and life and peace of the world. Thou didst lighten all creation. O Lord, glory to Thee!'
        },
        6: {
            afterKathisma1: 'The Angel proclaimed the joyful tidings to the women at the tomb: the Lord is risen! Tell the disciples and go to Galilee; there they shall see Christ who rose from the dead and granteth great mercy.',
            afterKathisma2: 'Having despoiled Hades, O Lord, and having trampled down death, Thou hast raised the world with Thee from corruption by Thy Resurrection. Wherefore we cry unto Thee: O Christ our God, glory to Thee!'
        },
        7: {
            afterKathisma1: 'Come, let us worship the Lord who was crucified and buried and arose from the dead. He alone is the God who taketh away the sins of the world and granteth great mercy.',
            afterKathisma2: 'O Christ, Thou didst come down to the lower parts of the earth and didst shatter the eternal bars, and on the third day Thou didst rise from the tomb enlightening all, crying: O Lord who didst rise from the dead, glory to Thee!'
        },
        8: {
            afterKathisma1: 'O Lord, the soldiers guarded Thy tomb in vain; for Thou, the immortal God, didst arise and granting life to the world, Thou didst fill all things with joy. O Lord, glory to Thee!',
            afterKathisma2: 'We worship Thy Resurrection, O Christ, whereby Thou hast delivered Adam from the ancient curse, granting the heavenly and divine joy to the ends of the earth. O Lord, glory to Thee!'
        }
    }
};

window.ORTHROS_SUNDAY_SESSIONAL_HYMNS =
    window.OCTOECHOS.orthros.sessionalHymns.sunday.tones;