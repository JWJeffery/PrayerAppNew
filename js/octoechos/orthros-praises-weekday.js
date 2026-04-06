/* Orthros — Weekday Praises Stichera (Octoechos)
 *
 * Namespace : window.OCTOECHOS.orthros.praises.weekday.tones[tone][dayOfWeek]
 * dayOfWeek : JS Date.getDay() — 1=Monday … 6=Saturday (0=Sunday not used here)
 * Schema    : each slot is either null (untranscribed) or a direct array of
 *             stichera entry objects: [{ sticheron: N, text: '...' }, ...]
 * Status    : Scaffolded — all slots null pending source-secure transcription.
 * Integration: wired into _resolveOrthrosSlots() praises-stichera weekday
 *              else-branch in horologion-engine.js (v6.3).
 */

window.OCTOECHOS = window.OCTOECHOS || {};
window.OCTOECHOS.orthros = window.OCTOECHOS.orthros || {};
window.OCTOECHOS.orthros.praises = window.OCTOECHOS.orthros.praises || {};

window.OCTOECHOS.orthros.praises.weekday = {
    meta: {
        label:  'Weekday Praises Stichera (Orthros)',
        office: 'orthros',
        family: 'praises',
        source: 'UNTRANSCRIBED'
    },

    tones: {
        1: {
            1: [
                {
                    sticheron: 1,
                    text: 'We hymn Thy saving Passion, O Christ, and glorify Thy resurrection.'
                },
                {
                    sticheron: 2,
                    text: 'O Lord Who endured the Cross, abolished death and rose from the dead: Bring peace to our life, as Thou alone art almighty.'
                },
                {
                    sticheron: 3,
                    text: 'O Christ Who by the resurrection madest hades captive and raised men from the dead, count us worthy to hymn and glorify Thee with a pure heart.'
                },
                {
                    sticheron: 4,
                    text: 'Glorifying Thy divine condescension, we hymn Thee, O Christ. Thou wast born of the Virgin and yet wast not separated from the Father; Thou didst willingly suffer as a man and didst endure the Cross and rise from the tomb, issuing forth therefrom as from a bridal chamber, that Thou mightest save the world. O Lord, glory to be Thee!'
                },
                {
                    sticheron: 5,
                    text: 'When Thou wast nailed to the Tree of the Cross, the might of the enemy was slain, creation trembled with the fear of Thee, and hades was made captive by Thy might. Thou didst raise the dead from the graves, and didst open paradise to the thief. O Christ our God, glory be to Thee!'
                },
                {
                    sticheron: 6,
                    text: 'Give ear, O tumultuous Jewish race! Where are they who went to Pilate? Let the soldiers who kept watch say where the seals of the tomb are! Where hath the Buried One been laid? Where was He sold Who hath not been sold? How was the treasure stolen? Why slander ye the resurrection of the Savior, O most iniquitous Jews? He hath arisen Who is free among the dead, and granteth the world great mercy!'
                },
                {
                    sticheron: 7,
                    text: 'We bow down before the divine wounds of Thy sufferings, O Christ God, and to the sacrifice of the Master, which was revealed by God in Sion in the fullness of time; for the Sun of righteousness hath illumined those who sleep in darkness, guiding them to never-waning splendor. Glory be to Thee, O Lord!'
                },
                {
                    sticheron: 8,
                    text: 'When the honorable women, lamenting, arrived with haste at Thy grave and found the tomb open; and, learning of the new and all-glorious wonder from the angel, they announced to the apostles that the Lord had risen, granting the world great mercy.'
                }
            ],
            2: [
                {
                    sticheron: 1,
                    text: 'We hymn Thy saving Passion, O Christ, and glorify Thy resurrection.'
                },
                {
                    sticheron: 2,
                    text: 'O Lord Who endured the Cross, abolished death and rose from the dead: Bring peace to our life, as Thou alone art almighty.'
                },
                {
                    sticheron: 3,
                    text: 'O Christ Who by the resurrection madest hades captive and raised men from the dead, count us worthy to hymn and glorify Thee with a pure heart.'
                },
                {
                    sticheron: 4,
                    text: 'Glorifying Thy divine condescension, we hymn Thee, O Christ. Thou wast born of the Virgin and yet wast not separated from the Father; Thou didst willingly suffer as a man and didst endure the Cross and rise from the tomb, issuing forth therefrom as from a bridal chamber, that Thou mightest save the world. O Lord, glory to be Thee!'
                },
                {
                    sticheron: 5,
                    text: 'When Thou wast nailed to the Tree of the Cross, the might of the enemy was slain, creation trembled with the fear of Thee, and hades was made captive by Thy might. Thou didst raise the dead from the graves, and didst open paradise to the thief. O Christ our God, glory be to Thee!'
                },
                {
                    sticheron: 6,
                    text: 'Nailed to the Cross as a man, O Christ God, Thou didst deify human nature and slay the serpent, the author of evil. Becoming accursed in that Thou art compassionate, Thou didst free us from the curse which hath its origin in the tree. And Thou didst come that Thou mightest give blessing and great mercy unto all.'
                },
                {
                    sticheron: 7,
                    text: 'Though Thou art exalted far above all honor, O Master, Thou didst deign to be dishonored, enduring a violent death upon the Tree, that when Thou didst die in the flesh, O Almighty, through it the human race might embrace immortality and receive again its primal life.'
                },
                {
                    sticheron: 8,
                    text: 'O most precious Cross, purification of all the faithful, sanctify all who bow down before thee and glorify Christ, Who stretched out His all-pure hands upon thee in His ineffable loving-kindness, and Who hath gathered together all the ends of the earth.'
                }
            ],
            3: [
                {
                    sticheron: 1,
                    text: 'We hymn Thy saving Passion, O Christ, and glorify Thy resurrection.'
                },
                {
                    sticheron: 2,
                    text: 'O Lord Who endured the Cross, abolished death and rose from the dead: Bring peace to our life, as Thou alone art almighty.'
                },
                {
                    sticheron: 3,
                    text: 'O Christ Who by the resurrection madest hades captive and raised men from the dead, count us worthy to hymn and glorify Thee with a pure heart.'
                },
                {
                    sticheron: 4,
                    text: 'Glorifying Thy divine condescension, we hymn Thee, O Christ. Thou wast born of the Virgin and yet wast not separated from the Father; Thou didst willingly suffer as a man and didst endure the Cross and rise from the tomb, issuing forth therefrom as from a bridal chamber, that Thou mightest save the world. O Lord, glory to be Thee!'
                },
                {
                    sticheron: 5,
                    text: 'When Thou wast nailed to the Tree of the Cross, the might of the enemy was slain, creation trembled with the fear of Thee, and hades was made captive by Thy might. Thou didst raise the dead from the graves, and didst open paradise to the thief. O Christ our God, glory be to Thee!'
                },
                {
                    sticheron: 6,
                    text: 'We unceasingly hymn Thee as Savior and Master, Who wast nailed to the Tree and hast given us life.'
                },
                {
                    sticheron: 7,
                    text: 'By Thy Cross have angels and men been united into one flock, O Christ, and in a single assemblage heaven and earth rejoice, crying: Glory to Thee, O Lord!'
                },
                {
                    sticheron: 8,
                    text: 'Neither tribulation, nor oppression, nor starvation, nor persecution, nor wounds, nor the raging of wild beasts, nor the sword, nor the threatening fire were able to separate you from God, O most lauded martyrs; and ye forgot your own nature, struggling as in others\' bodies out of great love for Him, and spurning death. Wherefore, as is meet ye have received reward for your pangs, and have become inheritors of the kingdom of heaven. Pray ye unceasingly in behalf of our souls.'
                }
            ],
            4: [
                {
                    sticheron: 1,
                    text: 'We hymn Thy saving Passion, O Christ, and glorify Thy resurrection.'
                },
                {
                    sticheron: 2,
                    text: 'O Lord Who endured the Cross, abolished death and rose from the dead: Bring peace to our life, as Thou alone art almighty.'
                },
                {
                    sticheron: 3,
                    text: 'O Christ Who by the resurrection madest hades captive and raised men from the dead, count us worthy to hymn and glorify Thee with a pure heart.'
                },
                {
                    sticheron: 4,
                    text: 'Glorifying Thy divine condescension, we hymn Thee, O Christ. Thou wast born of the Virgin and yet wast not separated from the Father; Thou didst willingly suffer as a man and didst endure the Cross and rise from the tomb, issuing forth therefrom as from a bridal chamber, that Thou mightest save the world. O Lord, glory to be Thee!'
                },
                {
                    sticheron: 5,
                    text: 'When Thou wast nailed to the Tree of the Cross, the might of the enemy was slain, creation trembled with the fear of Thee, and hades was made captive by Thy might. Thou didst raise the dead from the graves, and didst open paradise to the thief. O Christ our God, glory be to Thee!'
                },
                {
                    sticheron: 6,
                    text: 'O glorious apostles, who enlightened the whole world, ever entreat God, that our souls may be saved.'
                },
                {
                    sticheron: 7,
                    text: 'Together let us praise Peter and Paul, Luke and Matthew, Mark and John, Andrew and Thomas, Bartholemew and Simon the Canaïte, James and Philip; and let us laud the whole choir of the disciples, as is meet.'
                },
                {
                    sticheron: 8,
                    text: 'Rejoice in the Lord, O ye martyrs, for ye fought the good fight: ye opposed emperors and vanquished tyrants; ye were not daunted by fire and the sword, nor by the wild beasts who devoured your bodies, but, sending up hymnody to Christ with the angels, ye received crowns from heaven. Ask that He grant peace to the world and great mercy to our souls.'
                }
            ],
            5: [
                {
                    sticheron: 1,
                    text: 'We hymn Thy saving Passion, O Christ, and glorify Thy resurrection.'
                },
                {
                    sticheron: 2,
                    text: 'O Lord Who endured the Cross, abolished death and rose from the dead: Bring peace to our life, as Thou alone art almighty.'
                },
                {
                    sticheron: 3,
                    text: 'O Christ Who by the resurrection madest hades captive and raised men from the dead, count us worthy to hymn and glorify Thee with a pure heart.'
                },
                {
                    sticheron: 4,
                    text: 'Glorifying Thy divine condescension, we hymn Thee, O Christ. Thou wast born of the Virgin and yet wast not separated from the Father; Thou didst willingly suffer as a man and didst endure the Cross and rise from the tomb, issuing forth therefrom as from a bridal chamber, that Thou mightest save the world. O Lord, glory to be Thee!'
                },
                {
                    sticheron: 5,
                    text: 'When Thou wast nailed to the Tree of the Cross, the might of the enemy was slain, creation trembled with the fear of Thee, and hades was made captive by Thy might. Thou didst raise the dead from the graves, and didst open paradise to the thief. O Christ our God, glory be to Thee!'
                },
                {
                    sticheron: 6,
                    text: 'We unceasingly hymn Thee as Savior and Master, Who wast nailed to the Tree and hast given us life.'
                },
                {
                    sticheron: 7,
                    text: 'By Thy Cross have angels and men been united into one flock, O Christ, and in a single assemblage heaven and earth rejoice, crying: Glory to Thee, O Lord!'
                },
                {
                    sticheron: 8,
                    text: 'Come, O ye people, let us all honor the passion-bearers of Christ with hymns and spiritual songs, for they are the luminaries of the world and the preachers of the Faith, the ever-flowing fountain from whence healings pour forth upon the faithful. By their supplications, O Christ our God, grant peace to Thy world and great mercy to our souls.'
                }
            ],
            6: [
                {
                    sticheron: 1,
                    text: 'Come, O ye people, let us all honor the passion-bearers of Christ with hymns and spiritual songs, for they are the luminaries of the world and the preachers of the Faith, the ever-flowing fountain from whence healings pour forth upon the faithful. By their supplications, O Christ our God, grant peace to Thy world and great mercy to our souls.'
                },
                {
                    sticheron: 2,
                    text: 'The warriors of the great King opposed the edicts of the tyrants, bravely paid no heed to tortures, and, having trampled all deception underfoot, have been crowned as is meet. And they ask of the Savior peace and great mercy for our souls.'
                },
                {
                    sticheron: 3,
                    text: 'Neither tribulation, nor oppression, nor starvation, nor persecution, nor wounds, nor the raging of wild beasts, nor the sword, nor the threatening fire were able to separate you from God, O most lauded martyrs; and ye forgot your own nature, struggling as in others’ bodies out of great love for Him, and spurning death. Wherefore, as is meet ye have received reward for your pangs, and have become inheritors of the kingdom of heaven. Pray ye unceasingly in behalf of our souls.'
                },
                {
                    sticheron: 4,
                    text: 'Rejoice in the Lord, O ye martyrs, for ye fought the good fight: ye opposed emperors and vanquished tyrants; ye were not daunted by fire and the sword, nor by the wild beasts who devoured your bodies, but, sending up hymnody to Christ with the angels, ye received crowns from heaven. Ask that He grant peace to the world and great mercy to our souls.'
                },
                {
                    sticheron: 5,
                    text: 'Nekrosimon: In deed Thou revealest that Thou art the resurrection of all, O my Savior, and by Thy word Thou didst raise up Lazarus from the dead, O Word. And when the dead arose from the graves and the gates of hades were harrowed, death became for men as but a dream. O Thou Who camest for the salvation of Thy creatures and not for their condemnation, grant rest unto those Thou hast chosen, in that Thou lovest mankind.'
                }
            ]
        },
                2: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: [
            { sticheron: 1, text: 'Ye suffered for Christ even unto death, O passion-bearers and martyrs. And though your souls are in the heavens, in the hand of God, your relics are venerated throughout the whole world. The priests and the people all bow down, and we cry out, rejoicing: Precious in the sight of the Lord is the death of His saints.' },
            { sticheron: 2, text: 'Every city and land honoreth your relics, O passion-bearers and martyrs; for, having suffered lawfully, ye have received heavenly crowns: wherefore, ye are the boast of hierarchs and the majesty of the Churches.' },
            { sticheron: 3, text: 'O holy martyrs, taking up the Cross of Christ as an ensign of victory, ye set at nought all the power of the devil; and receiving heavenly crowns, ye are become bulwarks for us, praying to the Lord in our behalf.' }
        ] },
        3: {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: [
                { sticheron: 1, text: 'Come, O ye people, and let us all honor the memory of the holy passion-bearers; for, having been a spectacle for angels and men, they received crowns of victory from Christ, and pray in behalf of our souls.' },
                { sticheron: 2, text: 'The warriors of Christ refused to be daunted by emperors and tyrants, and right boldly and manfully they confessed Him, the Lord God of all, our King; and they pray for our souls.' },
                { sticheron: 3, text: 'The hosts of the holy angels marveled at the sufferings of the martyrs, how, though clad in mortal flesh, they paid no heed to their tortures, becoming emulators of the sufferings of Christ the Savior, and they pray in behalf of our souls.' },
                { sticheron: 4, text: 'Having fought the good fight, even after death ye shine in the world like beacons, O holy martyrs; wherefore, possessed of boldness, entreat Christ to have mercy on our souls.' }
            ]
        },
        4: {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: [
                {
                    sticheron: 1,
                    text: 'Who is not filled with awe, beholding the good contest wherein ye struggled, O holy martyrs? How have ye, who are fleshly beings, vanquished incorporeal enemies. The threats of tyrants did not frighten you, neither did the infliction of tortures daunt you. Ye have truly been glorified by Christ, as is meet. Ask ye great mercy for our souls.'
                },
                {
                    sticheron: 2,
                    text: 'Ye have become fellow partakers with the angels, O holy martyrs who manfully preached Christ at the tribunal; for ye forsook all the beautiful things of this world as though they did not exist, and clung to the Faith as your steadfast hope. Wherefore, having driven deception away, ye pour forth gifts of healing upon the faithful, unceasingly praying that our souls be saved.'
                },
                {
                    sticheron: 3,
                    text: 'How can we fail to marvel at your struggles, O holy martyrs? For, clad in mortal bodies, ye vanquished incorporeal enemies. The threats of tyrants did not frighten you, neither did the infliction of tortures daunt you. Ye have truly been glorified by Christ, as is meet. Ask ye great mercy for our souls.'
                }
            ]
        },
        5: {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: [
                {
                    sticheron: 1,
                    text: 'Blessed is the army of the King of heaven, for though the passion-bearers were mortals, yet did they strive to attain the dignity of the angels; and they spurned the pangs of their bodies, and by their sufferings were vouchsafed the honor of the incorporeal ones. Wherefore, by their supplications, O Lord, send down upon us great mercy.'
                },
                {
                    sticheron: 2,
                    text: 'Thy passion-bearers, O Lord, emulators of the angelic ranks, endured tortures as though incorporeal, in oneness of mind possessed of the hope that they would enjoy the good things promised them. By their supplications, O Christ God, grant peace to Thy world and great mercy to our souls.'
                },
                {
                    sticheron: 3,
                    text: 'Struggling on earth, the holy martyrs endured the cold and gave themselves over to the fire. And as the waters received them their cry was: "We went through fire and water, and Thou didst bring us out into refreshment!" By their supplications, O Christ God, have mercy upon us!'
                },
                {
                    sticheron: 4,
                    text: 'Rejoicing in the midst of their torments, the saints cried out: "These things are wares for us to trade with the Lord: for, instead of the wounds we bear on our bodies, radiant vesture shall blossom forth for us unto our resurrection; instead of dishonor, we shall receive crowns; instead of fetters in prison, we shall receive paradise; and instead of condemnation with malefactors, we shall have life with the angels!" By their supplications, O Lord, save Thou our souls!'
                },
                {
                    sticheron: 5,
                    text: 'Nekrosimon: O Lord Who created me, Thou didst set Thy hand upon me, and commanding me didst say: "Thou shalt return unto the earth": Guide me to Thy right path, forgiving me my transgressions; and absolve and save me, I pray, in that Thou lovest mankind.'
                }
            ]
        },
        6: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        7: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
        8: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null }
    }
};