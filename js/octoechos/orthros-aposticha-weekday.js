/* Orthros — Weekday Aposticha (Octoechos)
 *
 * Namespace : window.OCTOECHOS.orthros.aposticha.weekday.tones[tone][dayOfWeek]
 * dayOfWeek : JS Date.getDay() — 1=Monday … 6=Saturday (0=Sunday not used here)
 * Schema    : each slot is either null (untranscribed) or a direct array of
 *             stichera entry objects: [{ sticheron: N, text: '...' }, ...]
 * Status    : Fully populated. Weekday aposticha for tones 1–8, days 1–6,
 *             transcribed from source-secure Octoechos volumes.
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
        source: 'PARTIALLY TRANSCRIBED — Lambertsen Octoechos (weekday aposticha in progress)'
    },

    tones: {
        1: {
    1: [
        { sticheron: 1, text: 'The next world awaiteth thee, O soul, and the Judge will rebuke thy hidden and evil deeds. Wherefore, tarry not amid the things that are here, but step forth beforetime, crying out to the Judge: Cleanse me, O God, and save me!' },
        { sticheron: 2, text: 'Overlook me not who am beset by sinful sloth, O my Savior, but lift my mind up to repentance, and show me to be a skillful laborer in Thy vineyard. Grant unto me the reward of the eleventh hour, and great mercy.' },
        { sticheron: 3, text: 'Martyricon: Come, O ye people, and with hymns and spiritual songs let us all honor the passion-bearers of Christ, for they are the luminaries of the world and the preachers of the Faith, the ever-flowing fountain from whence healings pour forth upon the faithful. By their supplications, O Christ our God, grant peace to Thy world and great mercy to our souls.' }
    ],
    2: [
        { sticheron: 1, text: 'The next world awaiteth thee, O soul, and the Judge will rebuke thy hidden and evil deeds. Wherefore, tarry not amid the things that are here, but step forth beforetime, crying out to the Judge: Cleanse me, O God, and save me!' },
        { sticheron: 2, text: 'Overlook me not who am beset by sinful sloth, O my Savior, but lift my mind up to repentance, and show me to be a skillful laborer in Thy vineyard. Grant unto me the reward of the eleventh hour, and great mercy.' },
        { sticheron: 3, text: 'Martyricon: The warriors of the great King opposed the edicts of the tyrants, bravely paid no heed to tortures, and, having trampled all deception underfoot, have been crowned as is meet. And they ask of the Savior peace and great mercy for our souls.' }
    ],
    3: [
        { sticheron: 1, text: 'We unceasingly hymn Thee as Savior and Master, Who wast nailed to the Tree and hast given us life.' },
        { sticheron: 2, text: 'By Thy Cross have angels and men been united into one flock, O Christ, and in a single assemblage heaven and earth rejoice, crying: Glory to Thee, O Lord!' },
        { sticheron: 3, text: 'Martyricon: Neither tribulation, nor oppression, nor starvation, nor persecution, nor wounds, nor the raging of wild beasts, nor the sword, nor the threatening fire were able to separate you from God, O most lauded martyrs; and ye forgot your own nature, struggling as in others\' bodies, and spurning death out of great love for Him. Wherefore, as is meet ye have received reward for your pangs, and have become inheritors of the kingdom of heaven. Pray ye unceasingly in behalf of our souls.' }
    ],
    4: [
        { sticheron: 1, text: 'O glorious apostles, who enlightened the whole world, ever entreat God, that our souls may be saved.' },
        { sticheron: 2, text: 'Together let us praise Peter and Paul, Luke and Matthew, Mark and John, Andrew and Thomas, Bartholemew and Simon the Canaïte, James and Philip; and let us laud the whole choir of the disciples, as is meet.' },
        { sticheron: 3, text: 'Martyricon: Rejoice in the Lord, O ye martyrs, for ye fought the good fight: ye opposed emperors and vanquished tyrants; ye were not daunted by fire and the sword, nor by the wild beasts who devoured your bodies, but, sending up hymnody to Christ with the angels, ye received crowns from heaven. Ask that He grant peace to the world and great mercy to our souls.' }
    ],
    5: [
        { sticheron: 1, text: 'We unceasingly hymn Thee as Savior and Master, Who wast nailed to the Tree and hast given us life.' },
        { sticheron: 2, text: 'By Thy Cross have angels and men been united into one flock, O Christ, and in a single assemblage heaven and earth rejoice, crying: Glory to Thee, O Lord!' },
        { sticheron: 3, text: 'Martyricon: O ye people, come, let us all honor the passion-bearers of Christ with hymns and spiritual songs: the luminaries of the world, the preachers of the Faith, the ever-flowing wellsprings from whence healings pour forth upon the people. By their supplications, O Christ our God, grant peace to Thy world and great mercy to our souls.' }
    ],
    6: [
        { sticheron: 1, text: 'We entreat Thee, O Savior: Vouchsafe Thy sweet fellowship unto those who have fallen asleep, and by Thy loving-kindness cause them to dwell with Thy saints in the habitations of the righteous and the abodes of heaven, overlooking their iniquities and granting them rest.' },
        { sticheron: 2, text: 'Surpassing visible things, O Savior, are Thy promises, which eye hath not seen, nor ear heard, and which have never entered the heart of man. We beseech Thee, O Master: Vouchsafe that those who have passed over to Thee may receive Thy sweet fellowship, and grant them life everlasting.' },
        { sticheron: 3, text: 'Rejoicing in Thy Cross and setting their hope thereon, Thy servants have passed over to Thee, O Thou Who lovest mankind. Unto them now grant Thy Cross, and the Blood Thou didst shed for the life of the world, as deliverance from their transgressions, forgiving their offenses in Thy kindheartedness, and illumining them with the light of Thy countenance.' }
    ]
},
               2: {
    1: [
        { sticheron: 1, text: 'Mindful of the unseemly sins I have committed, I flee to Thy compassions, emulating the publican, the harlot who wept, and the prodigal son; wherefore, I fall down before Thee, O Merciful One, and say: Before Thou condemnest me, O God, have pity and mercy upon me!' },
        { sticheron: 2, text: 'Martyricon: Ye suffered for Christ even unto death, O passion-bearers and martyrs. And though your souls are in the heavens, in the hand of God, your relics are venerated throughout the whole world. The priests and the people all bow down; and we cry out, rejoicing: Precious in the sight of the Lord is the death of His saints.' },
        { sticheron: 3, text: 'Martyricon: Every city and land honoreth your relics, O passion-bearers and martyrs; for, having suffered lawfully, ye have received heavenly crowns: wherefore, ye are the boast of hierarchs and the majesty of the Churches.' }
    ],
    2: [
        { sticheron: 1, text: 'I have surpassed all in sin! From whom shall I learn repentance? If I sigh like the publican, I only burden the heavens; if I weep like the harlot, I defile the earth with my tears. But grant me remission of sins, O God, and have mercy on me.' },
        { sticheron: 2, text: 'Overlook mine iniquities, O Lord Who wast born of the Virgin, and cleanse my heart, making it a temple of Thy most pure Body and Blood. Cast me not away from Thy countenance, O Thou Who hast great mercy without measure.' },
        { sticheron: 3, text: 'Martyricon: Taking up the Cross of Christ as a trophy of victory, O holy martyrs, ye set at nought all the power of the devil; and receiving heavenly crowns, ye are become bulwarks for us, praying to the Lord in our behalf.' }
    ],
    3: [
        { sticheron: 1, text: 'O Christ God, Thou hast shown the tree of Thy Cross to be a tree of life for us who believe on Thee; and thereby Thou hast abolished the dominion of death and brought life unto us who have been slain by sin. Wherefore, we cry out to Thee: O Lord, Benefactor of all, glory to Thee!' },
        { sticheron: 2, text: 'Having willingly impoverished Thyself for the sake of Adam’s poverty, O Christ God, Thou didst come to earth and wast incarnate of the Virgin; and Thou didst accept crucifixion, that Thou mightest free us from slavery to the enemy. Glory to Thee, O Lord!' },
        { sticheron: 3, text: 'Martyricon: Every city and land honoreth your relics, O passion-bearers and martyrs; for, having contended lawfully, ye have received heavenly crowns: wherefore, ye are the boast of hierarchs and the majesty of the Churches.' }
    ],
    4: [
        { sticheron: 1, text: 'Throughout the whole world Thou didst magnify the names of Thy preëminent apostles, O Savior, for they learned heavenly things and gave ineffable healings unto mortals. They who were fishermen healed diseases by their handkerchiefs alone; they who were Jews theologized the doctrines of grace. For their sake, O Thou Who art full of loving-kindness, grant us great mercy.' },
        { sticheron: 2, text: 'We, who are ever assailed by the actions of the unrighteous, yet truly find refuge in Thee, Who art God, offer unto Thee the voice of Thy disciples, saying: Save us, O our Instructor, for we are perishing! And we pray: Show now to our enemies that Thou dost protect men and savest them from misfortunes through the supplications of the apostles, overlooking their sins in Thy great goodness. O Lord, glory be to Thee!' },
        { sticheron: 3, text: 'Martyricon: The multitude of Thy saints entreateth Thee, O Christ: Have mercy and save us, in that Thou lovest mankind!' }
    ],
    5: [
        { sticheron: 1, text: 'O Christ God, Thou hast shown the tree of Thy Cross to be a tree of life for us who believe on Thee; and thereby Thou hast abolished the dominion of death and brought life unto us who have been slain by sin. Wherefore, we cry out to Thee: O Lord, Benefactor of all, glory to Thee!' },
        { sticheron: 2, text: 'Having willingly impoverished Thyself for the sake of Adam’s poverty, O Christ God, Thou didst come to earth and wast incarnate of the Virgin; and Thou didst accept crucifixion, that Thou mightest free us from slavery to the enemy. Glory to Thee, O Lord!' },
        { sticheron: 3, text: 'Martyricon: Having suffered like Christ even unto death, O passion-bearing martyrs, your souls are in heaven, in the hand of God, and your relics are venerated throughout the whole world. The priests bow down, and all of us, the people, cry aloud, rejoicing: Precious in the sight of the Lord is the repose of His saints!' }
    ],
    6: [
        { sticheron: 1, text: 'By Thy life-bearing death Thou didst stem the onslaught of death and corruption, O Christ our Savior; wherefore, grant rest with Thy saints to those whom Thou hast taken from us, overlooking all their offenses, in that Thou lovest mankind.' },
        { sticheron: 2, text: 'That Thou mightest enable men to share in Thy divine kingdom, O Christ, Thou didst become a mortal man and wast laid in the grave. Wherefore, grant unto those who have died in the hope of resurrection and life everlasting to share in Thy glory, overlooking their offenses, in that Thou lovest mankind.' },
        { sticheron: 3, text: 'Standing before Thy dread, terrible and awesome throne, O Christ, there is no one who can accuse those who have departed unto Thee in faith; for if Thou desirest to examine their deeds, who can dare to speak before Thee? Yet by the prayers of her who gave birth to Thee, O Christ, and of all Thy saints, grant them repose, in that Thou alone art compassionate.' }
    ]
},
       3: {
    1: [
        { sticheron: 1, text: 'Bring together my scattered mind, O Lord, and cleanse my hardened heart, giving me repentance, as Thou didst to Peter, sighing, as Thou didst to the publican, and tears, as Thou didst to the harlot; that with a mighty voice I may cry out to Thee: Save me, O God, in that Thou alone art compassionate and lovest mankind!' },
        { sticheron: 2, text: 'While I chant much hymnody, I am found to be committing sin; and while intoning hymns with my tongue, in my soul I ponder unseemly thoughts. Correct both by repentance, O Christ God, and save me.' },
        { sticheron: 3, text: 'Martyricon: Come, O ye people, and let us all honor the memory of the holy passion-bearers; for, having been a spectacle for angels and men, they received crowns of victory from Christ, and pray in behalf of our souls.' }
    ],
    2: [
        { sticheron: 1, text: 'Bring together my scattered mind, O Lord, and cleanse my hardened heart, giving me repentance, as Thou didst to Peter, sighing, as Thou didst to the publican, and tears, as Thou didst to the harlot; that with a mighty voice I may cry out to Thee: Save me, O God, in that Thou alone art compassionate and lovest mankind!' },
        { sticheron: 2, text: 'While I chant much psalmody, I am found to be committing sin; and while intoning hymns with my tongue, in my soul I ponder unseemly thoughts. Correct both by repentance, O Christ God, and save me.' },
        { sticheron: 3, text: 'Martyricon: The warriors of Christ refused to be daunted by emperors and tyrants, and right boldly and manfully they confessed Him, the Lord God of all, our King; and they pray for our souls.' }
    ],
    3: [
        { sticheron: 1, text: 'Coveting bliss, I was banished, suffering a great fall; yet Thou didst not despise me, O Master: for, assuming what is mine for my sake, Thou art crucified and savest me, and Thou leadest me into glory. O my Deliverer, glory to Thee!' },
        { sticheron: 2, text: 'On the mountain, lifting up his arms in the form of the Cross, Moses vanquished Amalek; and Thou, O Savior, stretched out upon the precious Cross, didst embrace me, saving me from slavery to the enemy, and didst give it to me as the sign of life, enabling me to escape the arrows of mine adversaries. Wherefore, O Word, I bow down before Thy precious Cross.' },
        { sticheron: 3, text: 'Martyricon: Having fought the good fight, even after death ye shine in the world like beacons, O holy martyrs; wherefore, possessed of boldness, entreat Christ to have mercy on our souls.' }
    ],
    4: [
        { sticheron: 1, text: 'Your sound went forth into all the earth, O holy apostles, and ye destroyed the deception of the idols, preaching the knowledge of God. Behold, your struggle is good, O blessed ones; wherefore, we hymn and glorify your memory.' },
        { sticheron: 2, text: 'As branches of the life-bearing Vine, O glorious apostles, ye brought yourselves to God as the fruit of piety; wherefore, as ye have boldness before Him, ask that He grant peace and great mercy to our souls.' },
        { sticheron: 3, text: 'Martyricon: Having fought the good fight, even after death ye shine in the world like beacons in the world, O holy martyrs. As ye have boldness, entreat Christ, that our souls may find mercy.' }
    ],
    5: [
        { sticheron: 1, text: 'Coveting bliss, I was banished, suffering a great fall; yet Thou didst not despise me, O Master: for, assuming what is mine for my sake, Thou art crucified and savest me, and Thou leadest me into glory. O my Deliverer, glory to Thee!' },
        { sticheron: 2, text: 'On the mountain, lifting up his arms in the form of the Cross, Moses vanquished Amalek; and Thou, O Savior, stretched out upon the precious Cross, didst embrace me, saving me from slavery to the enemy, and didst give it to me as the sign of life, enabling me to escape the arrows of mine adversaries. Wherefore, O Word, I bow down before Thy precious Cross.' },
        { sticheron: 3, text: 'Martyricon: Come, all ye people, honor the memory of the holy passion-bearers, for, having been a spectacle for angels and men, they received crowns of victory from Christ, and pray in behalf of our souls.' }
    ],
    6: [
        { sticheron: 1, text: 'I glorify Thy precious Cross, whereby life and delight in sustenance hath been given unto those who hymn Thee with love and faith, O only greatly Merciful One. Wherefore, we cry aloud to Thee, O Christ God: Unto those who have been taken from among us grant rest where all who rejoice have their abode with Thee.' },
        { sticheron: 2, text: 'O Christ God Who alone art merciful and compassionate, Who hast an unapproachable abyss of goodness, Who knowest human nature, which Thou hast created, we beseech Thee: Unto those who have been taken from among us grant rest where all who rejoice have their abode with Thee.' },
        { sticheron: 3, text: 'When Thou didst rest in the tomb as a man, as God Thou didst with invincible power raise up those who were sleeping in the graves, who offer Thee unceasing hymnody. Wherefore, we entreat Thee, O Christ God: Unto those who have been taken from among us grant rest where all who rejoice have their abode with Thee.' }
    ]
},
        4: {
    1: [
        { sticheron: 1, text: 'Wash me with my tears, O Savior, for I have defiled myself with many sins; wherefore, I fall down before Thee, crying: I have sinned, O God! Have mercy on me!' },
        { sticheron: 2, text: 'I am a sheep of Thy reason-endowed flock, and I flee to Thee, the good Shepherd. Seek me out who am lost, O God, and have mercy on me.' },
        { sticheron: 3, text: 'Martyricon: Who is not filled with awe, beholding the good contest wherein ye struggled, O holy martyrs? How have ye, who are fleshly beings, vanquished the incorporeal foe, confessing Christ and having armed yourselves with His Cross? Wherefore, as is meet, ye have been shown to be expellers of the demons and opponents of the barbarians, unceasingly praying that our souls be saved.' }
    ],
    2: [
        { sticheron: 1, text: 'Wash me with my tears, O Savior, for I have defiled myself with many sins; wherefore, I fall down before Thee, crying: I have sinned, O God! Have mercy on me!' },
        { sticheron: 2, text: 'I am a sheep of Thy reason-endowed flock, and I flee to Thee, the good Shepherd. Seek me out who am lost, O God, and have mercy on me.' },
        { sticheron: 3, text: 'Martyricon: Ye have become fellow partakers with the angels, O holy martyrs who manfully preached Christ at the tribunal; for ye forsook all the beautiful things of this world as though they did not exist, and clung to the Faith as your steadfast hope. Wherefore, having driven deception away, ye pour forth gifts of healing upon the faithful, unceasingly praying that our souls be saved.' }
    ],
    3: [
        { sticheron: 1, text: 'Let Thy Cross be for us a bulwark, O Jesus our Savior; for we, the faithful, have no other hope save Thee Who wast nailed to it in the flesh, and grantest us great mercy.' },
        { sticheron: 2, text: 'Thou hast given a sign unto those who fear Thee, O Lord: Thy precious Cross, whereby Thou didst put to shame the princes and rulers of darkness, and didst restore us to our primal blessed state. Wherefore, we glorify Thy loving dispensation, O almighty Jesus, Savior of our souls.' },
        { sticheron: 3, text: 'Martyricon: Who is not moved to awe, beholding the good fight which ye fought, O holy martyrs: how, though in the flesh, ye vanquished the incorporeal foe, confessing Christ and armed with the Cross? Wherefore, as is meet, ye were shown to be expellers of the demons and victors over the barbarians, praying unceasingly that our souls be saved.' }
    ],
    4: [
        { sticheron: 1, text: 'Thou didst enlighten the choir of the apostles with the Holy Spirit, O Christ God. By them wash away the defilement of our sin, and have mercy on us.' },
        { sticheron: 2, text: 'Thy Holy Spirit revealed the illiterate disciples to be tutors, O Christ God, and set at nought the deception of the pagans with their greatly eloquent harmony, in that He is almighty.' },
        { sticheron: 3, text: 'Martyricon: Precious is the death of Thy saints, O Lord! For broken by swords, fire and freezing cold, they poured forth their blood, placing in Thee their hope, that they would receive reward for their toils. They endured, O Savior, and have received great mercy from Thee.' }
    ],
    5: [
        { sticheron: 1, text: 'Let Thy Cross be for us a bulwark, O Jesus our Savior; for we, the faithful, have no other hope save Thee Who wast nailed to it in the flesh, and grantest us great mercy.' },
        { sticheron: 2, text: 'Thou hast given a sign unto those who fear Thee, O Lord: Thy precious Cross, whereby Thou didst put to shame the princes and rulers of darkness, and didst restore us to our primal blessed state. Wherefore, we glorify Thy loving dispensation, O almighty Jesus, Savior of our souls.' },
        { sticheron: 3, text: 'Martyricon: Who is not moved to awe, beholding the good fight which ye fought, O holy martyrs: how, though in the flesh, ye vanquished the incorporeal foe, confessing Christ and armed with the Cross? Wherefore, as is meet, ye were shown to be expellers of the demons and victors over the barbarians, praying unceasingly that our souls be saved.' }
    ],
    6: [
        { sticheron: 1, text: 'Truly awesome is the mystery of death: how the soul is perforce wrested from the body and is parted from the frame and cohesion of its physical form by Thy divine will! Wherefore, we beseech Thee: In the dwellings of Thy righteous grant rest to those who have departed unto Thee, O Bestower of life, Who lovest mankind.' },
        { sticheron: 2, text: 'Death is but a dream for those who believe in Thee Who wast laid in the tomb, and, exercising dominion over all, didst destroy the dominion of death, abolishing its age-old sway. Wherefore, we entreat Thee: Those who have departed unto Thee do Thou cause to dwell in the joy of Thy saints and the splendor of the just.' },
        { sticheron: 3, text: 'Thou becamest justification and sanctification for us, and the deliverance of our souls; for Thou didst call us, justified and delivered, unto the Father, accepting our debt as canceled. And we now entreat Thee: In the joy and radiance of Thy saints grant rest unto those who have passed over to Thee, O our Benefactor Who lovest mankind.' }
    ]
},
          5: {
    1: [
        { sticheron: 1, text: 'Overlook the multitude of my transgressions, O Lord, Who wast born of the Virgin; and cleanse me of all my sins, granting me the intention to convert, in that Thou alone lovest mankind. And have mercy on me, I pray Thee.' },
        { sticheron: 2, text: 'Woe is me! To whom have I likened myself? To the barren fig-tree! And I fear lest I be cursed and cut down. But do Thou, O Christ God, heavenly Husbandman, show my hardened soul to be fruitful, accept me as Thou didst the prodigal son, and have mercy on me.' },
        { sticheron: 3, text: 'Martyricon: Blessed is the army of the King of heaven, for though the passion-bearers were mortals, yet did they strive to attain the dignity of the angels; and they spurned the pangs of their bodies, and by their sufferings were vouchsafed the honor of the incorporeal ones. Wherefore, by their supplications, O Lord, send down upon us great mercy.' }
    ],
    2: [
        { sticheron: 1, text: 'Overlook the multitude of my transgressions, O Lord Who wast born of the Virgin; and cleanse me of all my sins, granting me the thought of converting, in that Thou alone lovest mankind. And have mercy on me, I pray Thee.' },
        { sticheron: 2, text: 'Woe is me! To whom have I likened myself? To the barren fig-tree! And I fear lest I be cursed and cut down. But do Thou, O Christ God, heavenly Husbandman, show my hardened soul to be fruitful, accept me as Thou didst the prodigal son, and have mercy on me.' },
        { sticheron: 3, text: 'Martyricon: Thy passion-bearers, O Lord, emulators of the angelic ranks, endured tortures as though incorporeal, in oneness of mind possessed of the hope that they would enjoy the good things promised them. By their supplications, O Christ God, grant peace to Thy world and great mercy to our souls.' }
    ],
    3: [
        { sticheron: 1, text: 'No sooner was the tree of Thy Cross planted, O Christ, than the deception of idols was driven away and grace blossomed forth; for the tyranny of condemnation was no more, but the triumph of our salvation was made manifest. For the Cross is our boast, the Cross is our confirmation, the Cross is our joy!' },
        { sticheron: 2, text: 'For our sake Thou wast led as a sheep to sacrifice and as an innocent lamb to voluntary slaughter, O Christ Immanuel; and Thou wast reckoned among the iniquitous. Come, O ye nations of the homeland, and hymn and worship the endless Life Who was uplifted upon the Cross!' },
        { sticheron: 3, text: 'Martyricon: Struggling on earth, the holy martyrs endured the cold and gave themselves over to the fire. And as the waters received them their cry was: "We went through fire and water, and Thou didst bring us out into refreshment!" By their supplications, O Christ God, have mercy upon us!' }
    ],
    4: [
        { sticheron: 1, text: 'As eye-witnesses to the mysteries of the Savior, O disciples, ye preached the Invisible One Who hath no beginning, saying: In the beginning was the Word. Ye were not created before the angels, nor were ye taught of men, but by the wisdom of the Most High. Wherefore, as ye have boldness, pray ye in behalf of our souls.' },
        { sticheron: 2, text: 'Together let us praise the apostles of the Lord with hymns, for, having arrayed themselves in the armor of the Cross, they abolished the deception of the demons and were shown to be crowned victors. By the supplications of them and all the saints, O God, have mercy upon us.' },
        { sticheron: 3, text: 'Martyricon: Rejoicing in the midst of their torments, the saints cried out: "These things are wares for us to trade with the Lord: for, instead of the wounds we bear on our bodies, radiant vesture shall blossom forth for us unto our resurrection; instead of dishonor, we shall receive crowns; instead of fetters in prison, we shall receive paradise; and instead of condemnation with malefactors, we shall have life with the angels!" By their supplications, O Lord, save Thou our souls!' }
    ],
    5: [
        { sticheron: 1, text: 'No sooner was the tree of Thy Cross planted, O Christ, than the deception of idols was driven away and grace blossomed forth; for the tyranny of condemnation was no more, but the triumph of our salvation was made manifest. For the Cross is our boast, the Cross is our confirmation, the Cross is our joy!' },
        { sticheron: 2, text: 'For our sake Thou wast led as a sheep to sacrifice and as an innocent lamb to voluntary slaughter, O Christ Immanuel; and Thou wast reckoned among the iniquitous. Come, O ye nations of the homeland, and hymn and worship the endless Life Who was uplifted upon the Cross!' },
        { sticheron: 3, text: 'Martyricon: Blessed is the army of the King of heaven, for even though the passion-bearers were mortal, yet did they strive to attain the dignity of the angels; and having spurned the pangs of their bodies, for the sake of the passions they have been vouchsafed honors. By their supplications, O Lord, save Thou our souls!' }
    ],
    6: [
        { sticheron: 1, text: 'With the light of Thy countenance, O Christ, enlighten those who have departed, in that Thou art compassionate. Cause them to dwell in a place of verdure, by the waters of Thy pure and divine place of rest, in the longed-for bosom of our forefather Abraham, where Thy light shineth in purity and springs of beneficence pour forth, and where in gladness the assemblies of all the righteous clearly join chorus in thy goodness. Number Thy servants with them, granting them great mercy.' },
        { sticheron: 2, text: 'O Compassionate One, be Thou well-pleased that those who have passed from transitory things unto Thee, the Master of all and our God, may with most harmonious voices hymn and glorify Thy might; and grant that they may be enlightened by Thy beauty, and most purely partake of sweet and beautiful communion with Thee, where the angels dance around Thy throne and the choirs of the saints joyously stand round about. Grant rest with them and great mercy unto Thy servants.' },
        { sticheron: 3, text: 'Unto those departed in faith grant rest where is the choir of the prophets, and the ranks of the martyrs, and those from times past, who were justified by Thy saving Passion and the blood wherewith Thou didst redeem captive man, in that Thou lovest mankind, forgiving their offenses; for, truly Holy, Thou alone didst live on earth without sinning, Thou alone wast free among the dead. Unto Thy servants grant rest and great mercy.' }
    ]
},
         6: {
    1: [
        { sticheron: 1, text: 'Finding me stripped bare of the virtues, the enemy wounded me with the arrow of sin; but do Thou, as the Physician of souls and bodies, heal the wounds of my soul, O God, and have mercy upon me.' },
        { sticheron: 2, text: 'As the Physician of souls and bodies, O Savior Who grantest forgiveness of offenses unto those who ask, heal the sores of my heart, which have grown on me because of my many offenses, ever granting me tears of repentance. Give me release from my debts, O Lord, and have mercy on me.' },
        { sticheron: 3, text: 'Martyricon: All creation celebrateth on the memorial of Thy saints, O Lord: the heavens rejoice with the angels, and the earth maketh merry with men. By their supplications have mercy on us.' }
    ],
    2: [
        { sticheron: 1, text: 'Finding me stripped bare of the virtues, the enemy wounded me with the arrow of sin; but do Thou, as the Physician of souls and bodies, heal the wounds of my soul, O God, and have mercy upon me.' },
        { sticheron: 2, text: 'As the Physician of souls and bodies, O Savior Who grantest forgiveness of offenses unto those who ask, heal the sores of my heart, which have grown on me because of my many offenses, ever granting me tears of repentance. Give me release from my debts, O Lord, and have mercy on me.' },
        { sticheron: 3, text: 'Martyricon: All creation celebrateth on the memorial of Thy saints, O Lord: the heavens rejoice with the angels, and the earth maketh merry with men. By their supplications have mercy on us.' }
    ],
    3: [
        { sticheron: 1, text: 'I trust in the Cross, O Christ, and, boasting therein, I cry out: O Lord Who lovest mankind, cast down the pride of those who do not confess Thee to be both God and man!' },
        { sticheron: 2, text: 'Protected by the Cross, we set ourselves against the enemy, undaunted by his wiles and treachery; for the prideful one hath been set at nought and trampled underfoot by the power of Christ Who was nailed to the Tree.' },
        { sticheron: 3, text: 'Martyricon: The memory of the martyrs is a joy to those who fear the Lord; for, having suffered for the sake of Christ, they have received crowns from Him; and they now pray with boldness in behalf of our souls.' }
    ],
    4: [
        { sticheron: 1, text: 'Wisely transforming the tempest of demonic delusion into tranquillity, O apostles of Christ, ye guided the whole world to the Orthodox Faith, and pray now in behalf of our souls.' },
        { sticheron: 2, text: 'O ye faithful, with hymns let us fittingly honor the memory of the all-wise disciples of Christ our King; for in the world they proclaimed faith in the Trinity.' },
        { sticheron: 3, text: 'Martyricon: Our God hath made wondrous His chosen saints. Rejoice and be glad, all ye His servants, for you have crowns and His kingdom been made ready! We pray you: Forget us not!' }
    ],
    5: [
        { sticheron: 1, text: 'I trust in the Cross, O Christ, and, boasting therein, I cry out: O Lord Who lovest mankind, cast down the pride of those who do not confess Thee to be both God and man!' },
        { sticheron: 2, text: 'Protected by the Cross, we set ourselves against the enemy, undaunted by his wiles and treachery; for the prideful one hath been set at nought and trampled underfoot by the power of Christ Who was nailed to the Tree.' },
        { sticheron: 3, text: 'Martyricon: All creation doth celebrate the memory of Thy saints, O Lord: the heavens rejoice with the angels, and earth maketh merry with men. By their supplications have mercy on us.' }
    ],
    6: [
        { sticheron: 1, text: 'O greatly merciful Master, Who hast unapproachable lovingkindness for us and an inexhaustible well-spring of divine goodness, when those on earth depart unto Thee cause them to dwell in the beloved and desirable habitations, granting them possession which abideth forever. For Thou didst shed Thy blood for all, O Savior, and hast redeemed the world with a life-bearing ransom.' },
        { sticheron: 2, text: 'Of Thine own will Thou didst endure a vivifying death, didst pour forth life, and gavest the faithful eternal food. Among them number those who have fallen asleep in the hope of resurrection, by grace forgiving all their offenses, in that Thou alone art sinless and alone art good and lovest mankind; that Thy name, O Christ, may be hymned by all, and we may glorify Thy saving love for mankind.' },
        { sticheron: 3, text: 'Knowing Thee to be, in Thy divine power, the Lord of the living and Master of the dead, O Christ, we beseech Thee: With Thy chosen ones grant rest unto Thy faithful servants who have departed unto Thee, the only Benefactor, O Thou Who lovest mankind, in a place of comfort, amid the splendors of the saints; for Thou art the One Who willest mercy, and as God Thou savest those whom Thou didst create according to Thine image, O only greatly Merciful One.' }
    ]
},
         7: {
    1: [
        { sticheron: 1, text: 'I have come, O Compassionate One, like the prodigal son. As one of Thy hirelings do Thou accept me who fall down before Thee, O God, and have mercy on me, O Thou Who lovest mankind.' },
        { sticheron: 2, text: 'Like the one who fell among thieves and was wounded, so have I fallen through many sins, and my soul hath been wounded. To whom shall I who am guilty flee? To Thee alone, the Physician of men\'s souls. O God, pour forth upon me Thy great mercy!' },
        { sticheron: 3, text: 'Martyricon: Glory to Thee, O Christ God, Thou boast of the apostles and joy of the martyrs, who preached the consubstantial Trinity!' }
    ],
    2: [
        { sticheron: 1, text: 'No longer are we forbidden the Tree of life, for we have Thy Cross as our hope. O Lord, glory to Thee!' },
        { sticheron: 2, text: 'Suspended upon the Tree, O Immortal One, Thou didst break the snares of the devil. O Lord, glory to Thee!' },
        { sticheron: 3, text: 'Martyricon: Caring nought for all the things of earth, O holy martyrs, and having manfully preached Christ at the tribunal, ye received from Him rewards for your torments; but as ye have boldness, beseech Him, as the almighty God, that He save the souls of us who flee to you, we pray.' }
    ],
    3: [
        { sticheron: 1, text: 'O glorious apostles, pillars of the Church, preachers of the Truth, radiant beacons: With the fire of the Spirit ye consumed all deception and illumined the human race with faith. Wherefore, we beseech you: Entreat our Savior and God, that He grant peace to the world and save our souls.' },
        { sticheron: 2, text: 'O apostles of Christ, husbandmen of the Savior, bearing the Cross upon your shoulders as a plough, and having cleared the earth made hard by the deception of idolatry, ye sowed the word of faith. And ye are fittingly honored, O holy apostles of Christ.' },
        { sticheron: 3, text: 'Martyricon: O most praised martyrs, spiritual lambs, reason-endowed holocausts, acceptable sacrifices well-pleasing to God: the earth did not hide thee, but heaven received thee, and ye are become communicants with the angels. With them entreat our Savior and God, we pray you, that He grant peace to the world and save our souls.' }
    ],
    4: [
        { sticheron: 1, text: 'No longer are we forbidden the Tree of life, for we have Thy Cross as our hope. O Lord, glory to Thee!' },
        { sticheron: 2, text: 'Suspended upon the Tree, O Immortal One, Thou didst break the snares of the devil. O Lord, glory to Thee!' },
        { sticheron: 3, text: 'Martyricon: Glory to Thee, O Christ God, Thou boast of the apostles and joy of the martyrs, who preached the consubstantial Trinity!' }
    ],
    5: [
        { sticheron: 1, text: 'Caring nought for all the things of earth, O holy martyrs, and having manfully preached Christ at the tribunal, ye received from Him rewards for your torments; but as ye have boldness, beseech Him, as the almighty God, that He save the souls of us who flee to you, we pray.' },
        { sticheron: 2, text: 'O most praised martyrs, spiritual lambs, reason-endowed holocausts, acceptable sacrifices well-pleasing to God: the earth did not hide thee, but heaven received thee, and ye are become communicants with the angels. With them entreat our Savior and God, we pray you, that He grant peace to the world and save our souls.' },
        { sticheron: 3, text: 'Nekrosimon: O Thou Who in the beginning didst make man in Thine image and according to Thy likeness, in paradise Thou didst appoint him to exercise dominion over Thy creatures; but, led astray by the malice of the devil, he partook of the fruit, breaking Thy commandment. Wherefore, Thou didst condemn him to return to the earth from whence he had been taken, O Lord, and to beg for repose.' }
    ],
    6: [
        { sticheron: 1, text: 'Thou wast seen dead upon the Cross and wast laid as one dead in the tomb, O only Immortal One, delivering mortal men from mortality and corruption. As Thou art an inexhaustible Abyss of lovingkindness and Source of goodness, grant rest to Thy servants who have departed from us.' },
        { sticheron: 2, text: 'O Good One, vouchsafe that those who have passed over unto Thee may be enlightened with Thine incorrupt beauty, and may delight in Thy comeliness and the rays of Thy divine light, joining chorus amid the effulgence of heaven with the angels, around Thee, the Master, King and Lord of glory.' },
        { sticheron: 3, text: 'As God, the inexhaustible majesty of divine gifts, as the abundant treasury of rich goodness, cause those who have passed over to Thee to dwell in the lands of Thine elect, in a place of rest, in the house of Thy glory, in the sustenance of paradise, in Thy virginal chamber, in that Thou art full of lovingkindness.' }
    ]
},
          8: {
    1: [
        { sticheron: 1, text: 'The angels unceasingly hymn Thee, the King and Master; and I fall down before Thee, crying like the publican: Cleanse me, O God, and have mercy upon me!' },
        { sticheron: 2, text: 'As thou art immortal, O my soul, let not the waves of life cover thee, but rise up, crying out to thy Benefactor: Cleanse me, O God, and save me!' },
        { sticheron: 3, text: 'Martyricon: O martyrs of the Lord, ye sanctify every place and heal every infirmity. Pray ye now, that our souls be delivered from the snares of the enemy, we beseech you.' }
    ],
    2: [
        { sticheron: 1, text: 'When I bring to mind the multitude of the evils I have done, and come to consider the dread trial, seized with trembling I flee to Thee, the God Who loveth mankind. Wherefore, disdain me not, I pray Thee, O only Sinless One; grant compunction to my lowly soul before the end, and save me.' },
        { sticheron: 2, text: 'Grant me tears as once Thou didst to the sinful woman, O God, and vouchsafe that I may wash the feet which have freed me from the path of deception, and that a pure life wrought for me by repentance I may offer Thee as myrrh of sweet savor, that even I may hear Thy longed-for voice saying: Thy faith hath saved thee. Go in peace!' },
        { sticheron: 3, text: 'Martyricon: Ye struggled greatly, O saints, valiantly enduring tortures at the hands of the iniquitous; and though ye have passed from this life, ye still work wonders in this world and heal those made sick by their passions. O holy ones, pray ye that our souls be saved.' }
    ],
    3: [
        { sticheron: 1, text: 'The staff of Moses prefigured Thy precious Cross, O our Savior; for thereby Thou savest Thy people as from the depths of the sea, O Thou Who lovest mankind.' },
        { sticheron: 2, text: 'Of old the Garden of Eden put forth in its midst the tree whose fruit was eaten; but Thy Church, O Christ, hath caused the Cross to spring forth, pouring out life upon the world. The one brought death upon Adam, who ate of its fruit, but the other gave life to the thief who was saved by faith. O Christ God, Who by Thy suffering didst break the snares laid for us by the enemy, show us to share in his salvation, and vouchsafe us Thy kingdom, O Lord.' },
        { sticheron: 3, text: 'Martyricon: O invincible martyrs of Christ, having vanquished falsehood with the power of the Cross, ye received the grace of eternal life; and undaunted by the threats of the tyrants, ye rejoiced as ye were wounded with tortures: and your blood hath now become healing for our souls. Pray ye, that our souls be saved.' }
    ],
    4: [
        { sticheron: 1, text: 'Ardently loving Thee on earth, O Lord, Thine apostles considered all but dung, that they might acquire Thee alone; and they gave their bodies over to wounds for Thee; wherefore, glorified, they pray for our souls.' },
        { sticheron: 2, text: 'O Lord, Thou didst magnify the memory of the apostles on earth, for assembling together thereon, we all glorify Thee; for for their sake Thou grantest us healings, and peace and great mercy to the whole world through their supplications.' },
        { sticheron: 3, text: 'Martyricon: Arrayed well in the breastplate of the Faith, having armed yourselves with the Cross as a sword, ye showed yourselves to be mighty warriors, manfully opposed the tyrants, and cast down the deception of the devil; and, victorious, ye were vouchsafed crowns. Pray ye ever in our behalf, that our souls be saved.' }
    ],
    5: [
        { sticheron: 1, text: 'The staff of Moses prefigured Thy precious Cross, O our Savior; for thereby Thou savest Thy people as from the depths of the sea, O Thou Who lovest mankind.' },
        { sticheron: 2, text: 'Of old the Garden of Eden put forth in its midst the tree whose fruit was eaten; but Thy Church, O Christ, hath caused the Cross to spring forth, pouring out life upon the world. The one brought death upon Adam, who ate of its fruit, but the other gave life to the thief who was saved by faith. O Christ God, Who by Thy suffering didst break the snares laid for us by the enemy, show us to share in his salvation, and vouchsafe us Thy kingdom, O Lord.' },
        { sticheron: 3, text: 'Martyricon: What shall we call you, O saints? Cherubim, for Christ rested on you. Seraphim, for ye glorified Him without ceasing. Angels, for ye rejected your bodies. Powers, for ye work miracles. Many are your names, and great your gifts. Pray ye that our souls be saved.' }
    ],
    6: [
        { sticheron: 1, text: 'Dipping Thy fingers in Thy blood and staining them therewith as with red ink, Thou hast signed for us a royal reprieve, O Master; wherefore, we entreat Thee with faith: Among Thy firstborn number those who have departed unto Thee, the Compassionate One, and vouchsafe that they may receive the joy of Thy righteous.' },
        { sticheron: 2, text: 'Conducting the priestly ministry as a man, and slaughtered like a lamb, Thou didst bring an offering to the Father, rescuing man from corruption. In that Thou lovest mankind, those who have departed do Thou enroll in the land of the living, where torrents of delight pour forth, and well-springs of eternal life flow.' },
        { sticheron: 3, text: 'With the depths of Thine ineffable wisdom Thou dost set the bounds of life, dost foresee things to come, and dost cause the servants Thou hast taken to Thyself to dwell in the life to come. Settle them by peaceful waters, in the splendor of the saints, O Lord, where the voice of joy and laudation is heard.' }
    ]
}
    }
};
