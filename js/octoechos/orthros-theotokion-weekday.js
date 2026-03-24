/**
 * orthros-theotokion-weekday.js
 *
 * Slot: orthros-theotokion (weekday)
 * Data path: window.OCTOECHOS.orthros.theotokion.weekday.tones[tone][dayOfWeek]
 *
 * Slot definition (locked):
 *   The final "Now & ever…" Theotokion at Ode IX of the primary canon.
 *   Mon / Tue / Thu → Canon of Repentance, Ode IX Theotokion
 *   Wed / Fri       → Canon of the Cross, Ode IX Stavrotheotokion
 *   Sat             → Canon of All Saints, Ode IX Theotokion
 *
 * dayOfWeek key: 1 = Monday … 6 = Saturday
 *
 * Source:
 *   Isaac E. Lambertsen, The Octoechos: The Hymns of the Cycle of the
 *   Eight Tones for Sundays and Weekdays, Volume 1 (Tones I & II),
 *   St. John of Kronstadt Press, 1999.
 *
 * Transcription notes:
 *   Tone 1 — all six entries transcribed from Lambertsen Vol. 1.
 *   Source page references:
 *     tones[1][1]  Mon  p. 27  Canon of Repentance, Ode IX Theotokion
 *     tones[1][2]  Tue  p. 42  Canon of Repentance, Ode IX Theotokion
 *     tones[1][3]  Wed  p. 47  Canon of the Cross, Ode IX Stavrotheotokion
 *     tones[1][4]  Thu  p. 56  Canon of the Apostles, Ode IX Theotokion
 *     tones[1][5]  Fri  p. 66  Canon of the Cross, Ode IX Stavrotheotokion
 *     tones[1][6]  Sat  p. 76  Canon of All Saints, Ode IX Theotokion
 */

window.OCTOECHOS = window.OCTOECHOS || {};
window.OCTOECHOS.orthros = window.OCTOECHOS.orthros || {};
window.OCTOECHOS.orthros.theotokion = window.OCTOECHOS.orthros.theotokion || {};
window.OCTOECHOS.orthros.theotokion.weekday = window.OCTOECHOS.orthros.theotokion.weekday || {};

window.OCTOECHOS.orthros.theotokion.weekday = {

  meta: {
  slot: "orthros-theotokion",
  corpus: "weekday",
 source: "Lambertsen, Octoechos Vol. 1–4 — Tones 1–8 complete",
tones_active: [1, 2, 3, 4, 5, 6, 7, 8],
tones_pending: []
},

  tones: {

    1: {
      // Monday — Canon of Repentance, Ode IX Theotokion
      // Lambertsen Vol. 1, p. 27
      1: "Thou bearest Him Who sustaineth all things, and givest suck unto Him Who " +
         "giveth food unto all. Great and awesome beyond understanding is the mystery " +
         "of thee, O Virgin Theotokos, who art of worshipful holiness. Wherefore, we " +
         "bless thee with faith.",

      // Tuesday — Canon of Repentance, Ode IX Theotokion
      // Lambertsen Vol. 1, p. 42
      2: "I fear the implacable judgment seat and the impartial Judge, O most immaculate " +
         "one; for the multitude of mine offenses is beyond number, in that I live in " +
         "slothfulness, wholly consumed by the passions. Wherefore, moved to pity, have " +
         "mercy on me, O Theotokos.",

      // Wednesday — Canon of the Cross, Ode IX Stavrotheotokion
      // Lambertsen Vol. 1, p. 47
      3: "The Maiden who ineffably gave birth to the Word Who loveth mankind, beholding " +
         "Him voluntarily suffering at the hands of men, cried out: \"What is this? God " +
         "Who is beyond suffering undergoeth suffering, that He might deliver from the " +
         "sufferings those who worship Him with faith!\"",

      // Thursday — Canon of the Apostles, Ode IX Theotokion
      // Lambertsen Vol. 1, p. 56
      4: "O most immaculate one, who gavest birth to the divine Light, enlighten me who " +
         "am darkened by all the assaults of the evil one, who dwell in despondency, and " +
         "anger God; and guide me to good works, for thou art the cause of all good things.",

      // Friday — Canon of the Cross, Ode IX Stavrotheotokion
      // Lambertsen Vol. 1, p. 66
      5: "With the light of the Light Who shone forth from thee in the flesh, O Virgin, " +
         "illumine my mind and enlighten my heart, driving away the darkness of sin and " +
         "dispelling all the gloom of my despondency.",

      // Saturday — Canon of All Saints, Ode IX Theotokion
      // Lambertsen Vol. 1, p. 76
      6: "O thy wonders which pass understanding! For thou alone, O Virgin, hast granted " +
         "all under the sun to understand the newest miracle of thine incomprehensible " +
         "birthgiving. Wherefore, we all magnify thee, O all-pure one."
    },

    // Tone 2 — pending (Lambertsen Vol. 1 pages not in current scan)
   2: {
      // Monday — Canon of Repentance, Ode IX Theotokion
      // Lambertsen Vol. 1, p. 101
      1: "Spare me, spare me, O Lord, when Thou shalt render judgment! Condemn me not " +
         "to the fire, neither rebuke me in Thine anger. The Virgin who gave Thee birth " +
         "entreateth Thee, O Christ, as doth the multitude of the angels and the company " +
         "of martyrs.",

      // Tuesday — Canon of Repentance, Ode IX Theotokion
      // Lambertsen Vol. 1, p. 110
      2: "With the radiant effulgence of Him Who shone forth upon us from thy womb and " +
         "destroyed the night of ungodliness, O Mary, Virgin Mother, enlighten all who " +
         "honor thee with faith; and at the hour of condemnation, deliver them from the " +
         "darkness which is devoid of light.",

      // Wednesday — Canon of the Cross, Ode IX Stavrotheotokion
      // Lambertsen Vol. 1, p. 119
      3: "By Thy wounds mend my broken and contrite state, O unfathomable Word, and by " +
         "Thy suffering, O Lord God of my salvation, cleanse mine image, which hath been " +
         "buried under wicked passions.",

      // Thursday — Canon of the Apostles, Ode IX Theotokion
      // Lambertsen Vol. 1, p. 128
      4: "O all-pure one, the apostles preached thy Son\u2014God and man\u2014throughout " +
         "the whole world; wherefore, with them make entreaty, that those who magnify " +
         "thee with faith may be delivered from torments on the dread day of judgment.",

      // Friday — Canon of the Cross, Ode IX Stavrotheotokion
      // Lambertsen Vol. 1, p. 137
      5: "The unblemished Ewe-lamb, the adornment of the prophets and martyrs, beholding " +
         "Thee lifted up upon the Tree like a lamb, O Word Who art without beginning, wept " +
         "bitterly and said: \"Let all existing creation hymn the Lord and exalt Him " +
         "supremely for all the ages!\"",

      // Saturday — Canon of All Saints, Ode IX Theotokion
      // Lambertsen Vol. 1, p. 147
      6: "O pure Virgin Mother, who gavest birth in the flesh to the compassionately " +
         "loving God, with all the saints ever entreat Him, that He save us from " +
         "misfortunes."
    },
    // Tones 3–8 — pending (Lambertsen Vol. 2)
    3: {
  // Monday — Canon of Repentance, Ode IX Theotokion
  // Lambertsen Vol. 2, p. 25
  1: "We all know thee to be the foundation of our salvation; for by thy deifying " +
     "blood thine all-pure birthgiving hath saved those who with faith hymn and " +
     "glorify thee, O Theotokos.",

  // Tuesday — Canon of Repentance, Ode IX Theotokion
  // Lambertsen Vol. 2, p. 35
  2: "As the Mother of God, as the Mother of the Word of God Who was born of thee " +
     "in the flesh, O pure one, ever pray with the incorporeal ones, with the " +
     "apostles and prophets, the holy hierarchs and martyrs, that He have pity on " +
     "the world, O all-pure Virgin Mother.",

  // Wednesday — Canon of the Theotokos, Ode IX Theotokion
  // (Cross canon has no closing Theotokion at Ode IX; slot filled by final
  //  Theotokion of the Canon of the Theotokos at Ode IX)
  // Lambertsen Vol. 2, p. 44
  3: "In that thou art the Mother of God, beseech the Lord God and King, that I, " +
     "thy servant, who from my mother's womb have set my hope on thee, may be " +
     "delivered from every threat and wicked habit, O Mistress.",

  // Thursday — Canon of the Apostles, Ode IX Theotokion
  // Lambertsen Vol. 2, p. 54
  4: "O thou who gavest birth to the Light, thou hast been shown to be mine " +
     "enlightenment, dispelling the dark and cruel clouds of my soul, that by " +
     "thy supplications I may become a child of the day, doing holy deeds, that " +
     "in holiness I may bless thee in hymnody.",

  // Friday — Canon of the Theotokos, Ode IX Theotokion
  // (Cross canon has no closing Theotokion at Ode IX; slot filled by final
  //  Theotokion of the Canon of the Theotokos at Ode IX)
  // Lambertsen Vol. 2, p. 63
  5: "I am wholly in despair, wretch that I am, and am filled with consternation " +
     "as I ponder my wicked deeds. Freely have pity on me, O Mistress, and save me!",

  // Saturday — Canon of All Saints, Ode IX Theotokion
  // Lambertsen Vol. 2, p. 74
  6: "O Theotokos, all of us know thee to be the noetic lamp bearing the Light of " +
     "the Godhead, Who had united Himself to the coarseness of human nature. " +
     "Entreat thy Son and God, that unto those who have been taken from among us " +
     "He grant rest where all who rejoice have jubilation."
    },

    4: {
  1: "O Mother of God, we, the faithful, know thee to be the bridal-chamber and dwelling-place of the ineffable Incarnation, and the ark of the law; wherefore, we unceasingly magnify thee.", // p. 99 — Monday Matins, Ode IX, Canon of the Angels, Now & ever…
  2: "O right loving Theotokos, who gavest birth to the right loving God: Entreat Him to deliver me from all evil, and to make my heart zealous for Him, hating the sweet pleasures of the flesh, that I may magnify thee in hymns.", // p. 109 — Tuesday Matins, Ode IX, Canon of the Forerunner, final Theotokion
  3: "Confound all the counsels of those who have arrayed themselves against us, O Mother of God Most High, and fill with joy those who set their hope on thee, that we may all ardently proclaim thy help.", // p. 118 — Wednesday Matins, Ode IX, Canon of the Theotokos (Cross canon carries no closing Stavrotheotokion at Ode IX)
  4: "We joyfully offer thee the salutation of the divine Gabriel, and we cry out: Rejoice, O paradise who ever hast within thee the Tree of life, O all-glorious palace of the Word! Rejoice, O most immaculate Virgin!", // p. 127 — Thursday Matins, Ode IX, Canon of Saint Nicholas, final Theotokion
  5: "Save me, O pure one, who gavest birth to the most compassionate Savior! Have pity on me, thy servant, and direct me to the ways of repentance! Repel from me the temptations of the evil one, deliver me from his pursuit, and rescue me from everlasting fire, O all-immaculate one.", // p. 136 — Friday Matins, Ode IX, Canon of the Theotokos (Cross canon carries no closing Stavrotheotokion at Ode IX)
  6: "O most immaculate one who wast revealed to be more exalted than the cherubim, in that thou gavest birth to the Sustainer of all things, elevate my mind, strengthening me against the carnal passions, that I may do the will of the Master." // p. 146 — Saturday Matins, Ode IX, Canon of All Saints, Theotokion
},
    5: {
  // Monday — Canon of the Angels, Ode IX, final Theotokion
  // Lambertsen Vol. III, p. 28
  1: "With faith the archangels, authorities and thrones, the cherubim, powers " +
     "and seraphim, the radiant angels, principalities and dominions, noetically " +
     "minister unto thy Son with trembling, O pure and most blessed Theotokos.",

  // Tuesday — Canon of Repentance, Ode IX Theotokion
  // Lambertsen Vol. III, p. 38
  2: "Thou hast been shown to be the radiant chariot of the Sun Who shone forth " +
     "from thy womb and broke the cruel darkness of deception, O most immaculate " +
     "and pure one. Wherefore, with faith we bless thee as is meet.",

  // Wednesday — Canon of the Cross, Ode IX Theotokion
  // Lambertsen Vol. III, p. 47
  3: "Thou gavest birth to the Gardener, the Planter of piety Who soweth true " +
     "understanding on the earth and destroyeth the curse which grew from the garden. " +
     "And magnifying Him, we call thee, the Virgin, blessed.",

  // Thursday — Canon of Saint Nicholas, Ode IX Theotokion
  // Lambertsen Vol. III, p. 57
  4: "O all-pure one, the prophet foresaw the radiant lampstand bearing Christ, the " +
     "noetic Lamp, by Whom we have been enlightened who lie in darkness and the " +
     "passions. And we call thee blessed, O Ever-virgin Theotokos.",

  // Friday — Canon of the Theotokos, Ode IX final Theotokion
  // (Canon of the Cross carries no closing Theotokion at Ode IX)
  // Lambertsen Vol. III, p. 65
  5: "Grant me tear-drops, O pure one, that I may drive doubt from my heart and " +
     "hymn thee earnestly.",

  // Saturday — Canon of All Saints, Ode IX Theotokion
  // Lambertsen Vol. III, p. 76
  6: "In sickness of mind I committed many sins, O Virgin, and torment awaiteth me " +
     "in the future. Deliver me therefrom, for I come to thee with unwavering heart, " +
     "and I call upon thy divine protection."
},
    6: {
      1: "O thou who gavest birth to the Light of dispassion, enlighten me who have " +
         "been benighted by sins, that I may hymn thee, O pure Ever-virgin.",

      2: "Thou wast shown to be holier than the cherubim, O Virgin, for thou gavest " +
         "birth to the all-holy God. Sanctify us all, who day and night hallow thee " +
         "with holy voices and faith.",

      3: "When of old the undefiled ewe-lamb, the unblemished Mistress, beheld her " +
         "Lamb upon the tree of the Cross, she exclaimed maternally, and marveling " +
         "cried out: \"O my Child most sweet, what is this new and all-glorious thing " +
         "that I see? How hath the ungrateful assembly given Thee over to the tribunal " +
         "of Pilate and condemned to death the Life of all? I hymn Thine ineffable " +
         "condescension, O Word!\"",

      4: "O most hymned one, who gavest birth to the Savior, enlighten the blinded " +
         "eye of my heart, that, saved because of thee, I may hymn thee.",

      5: "Thou wast truly more highly exalted than all creation, for thou gavest birth " +
         "unto God in the flesh; wherefore, O Mistress, we, who hope to receive " +
         "salvation through thee, have thee as an intercessor, a sure hope and a " +
         "firm bulwark.",

      6: "O Virgin who gavest birth to the Light, enlighten my soul, driving away " +
         "the darkness of my slothfulness and sin."
    },
    7: {
  1: "As a mother now possessed of boldness before thy Son, O most holy Theotokos, deliver those who hymn thee with love from grievous transgressions, ailments and tribulations, that we may all ever magnify thee.", // PDF page 27
  2: "The Lord Who clothed Himself in me issued forth from thee, O all-pure one; wherefore, beseech Him to illumine me with the vesture of light, having now stripped from me the most grievous rags of the passions, O Virgin.", // PDF page 36
  3: "O Maiden who wast the dwelling-place of the Godhead, bathing me with tears, cleanse me, who have become a den of soul-destroying thieves and a place where every iniquity is wrought; and show me to be an abode of the divine Spirit.", // PDF page 45
  4: "In thy holy arms thou bearest Him Who upholdeth all things. Him do thou beseech, O pure one, that we be saved unharmed by the malefactions of the alien one.", // PDF page 54
  5: "O blessed one, who art holier than the cherubim, and gavest birth in the flesh unto the Word of God, Who was uplifted upon the Cross of His own will: Earnestly pray to Him in behalf of us all.", // PDF page 62
  6: "Sin-loving, I tremble before the dread judgment of Him Who was born of thee, O pure one. But preserve me uncondemned thereat, O good one." // PDF page 71
},
    8: {
  1: "O Mistress, portal of the Light, enlighten the eyes of my heart which the thick darkness of sin hath benighted; and send down upon me a ray of repentance, O pure one, and by thy mediation free me from everlasting fire.", // PDF page 99
  2: "O chosen ewe-lamb of the Word of God, entreat God Who became incarnate of thee, that at the dread hour He number me with His chosen sheep.", // PDF page 108
  3: "Having escaped maternal pangs when I gave birth to Thee, O Long-suffering One, I now suffer pangs in my womb, and my soul is filled with pain, as Thou now dost accept pain!\", cried the all-pure one, whom we magnify as is meet.", // PDF page 118
  4: "In that thou art merciful, O thou who gavest birth to the all-good God, heal my soul, which hath become sick through grievous passions; and ever deliver me from enemies who goad and attack me, O all-pure one, that, saved, I may diligently magnify thee, whom our generation hath magnified.", // PDF page 128
  5: "O Virgin, thou wast shown to be a radiant bridal-chamber for Him Who made His abode within thine incorrupt womb, Who by His will endured His blessed passion, and in His ineffable mercy granted dispassion unto all. Worshipping Him with faith, we piously magnify thee.", // PDF page 139
  6: "Save me, O Mother of God, who gavest birth to Christ my Savior, God and man, in two natures but a single Hypostasis: He is the only-begotten of the Father, and issued forth from thee as the firstborn of all creation. Him do we magnify in two natures." // PDF page 148
},
    }
   }