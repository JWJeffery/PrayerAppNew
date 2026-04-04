/* Orthros — Weekday Canon (Octoechos)
 *
 * Namespace : window.OCTOECHOS.orthros.canon.weekday.tones
 *
 * Key contract
 *   tones[tone][day]
 *     tone : 1–8  (Octoechos tone)
 *     day  : 1=Monday  2=Tuesday  3=Wednesday  4=Thursday  5=Friday  6=Saturday
 *   Each slot is a structured canon entry object (with metadata + odes).
 *
 * Live status
 *   Tones 1–8: all six day slots fully populated
 *
 * Consumed by : Orthros weekday canon resolver
 */

window.OCTOECHOS = window.OCTOECHOS || {};
window.OCTOECHOS.orthros = window.OCTOECHOS.orthros || {};
window.OCTOECHOS.orthros.canon = window.OCTOECHOS.orthros.canon || {};

window.OCTOECHOS.orthros.canon.weekday = {
tones: {
        1: {
            1: {
  metadata: {
    day:             "Monday",
    theme:           "Bodiless Powers and Repentance",
    canons:          ["Canon of Repentance", "Canon of the Incorporeal Hosts"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Incorporeal Hosts per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. I (Tones I & II), St. John of Kronstadt Press, 1999",
    pages:           "24–28",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Thy victorious right arm hath in godly manner been glorified in strength; for as almighty, O Immortal One, it smote the adversary, fashioning anew the path of the deep for the Israelites.",
      troparia: [
        "According to the magnitude of Thy mercy, O Christ, do away with the multitude of my sins, I pray Thee, and grant me the thought of converting, that I may glorify Thy goodness, which is past understanding.",
        "In the loving-kindness of Thy compassions Thou didst appear on earth as an incarnate man; wherefore, accept me who have sinned more than any other man, O Word of God, and who now fall down before Thy compassions in repentance.",
        "Standing in splendor before the throne of the Master, Who is equally eternal with the Father, and is His Angel of great Counsel, O most holy angels, pray for me who hymn you, that He may inspire my words.",
        "Considering of old, the divine Mind created the ranks of the angels, who receive the reflection of the light of the Godhead and the radiance of the three-Sunned Effulgence, as far as they were able."
      ],
      theotokion: "He Who as God adorned the ranks of the hosts on high made His abode within thy womb, which knew not wedlock and is more exalted than the seraphim, O Theotokos; and He became immutable flesh."
    },
    3: {
      irmos: "O Thou Who alone hast known the weakness of human nature, having in Thy mercy formed Thyself therein: Thou dost gird me about with power from on high, that I may chant to Thee: Holy is the living temple of Thine ineffable glory, O Thou Who lovest mankind!",
      troparia: [
        "Arise and step forth, O my soul, and cry out to thy Creator, Who knoweth all thy hidden things; and show forth fruits of repentance, that the compassionate Lord may have mercy on thee and deliver thee from everlasting fire.",
        "O only Good One, purify, cleanse and save me, for like the publican I cry out to thee with fear: I am drawn along by a multitude of sins, am crushed beneath the weight of my transgressions, and am filled with immeasurable shame!",
        "Directly approaching the deifying Light, and filled therewith in multifarious ways, the seraphim were manifestly the first to be enlightened by the primal radiances, and became like secondary luminaries, deified by the Godhead.",
        "Earnestly desiring to hymn the radiance of the angels who thereby impart help from God, O ye faithful, in purity of mind and with all-pure mouths let us beg to receive their effulgence."
      ],
      theotokion: "He Who is understood to transcend all creation in His life-giving creative power, truly working miracles on earth by virginal splendors, made His abode within thy pure womb, O all-pure one."
    },
    4: {
      irmos: "Habbakuk, gazing with the eyes of foresight upon thee, the mountain overshadowed by the grace of God, prophesied that the Holy One of Israel would come forth from thee, for our salvation and restoration.",
      troparia: [
        "Unto what can I liken thee, O my wretched soul, who committest wickedness and failest to do good? Turn thou, and cry out to Him Who of His own will beggared Himself for thy sake: O Thou Who knowest the hearts of men, have pity and save me!",
        "O Savior Who hast appointed repentance for those who turn away, bestow it upon me, O Good One, granting me compunction and sighs before the end of my life, as Thou didst to the harlot of old who clasped Thy feet, O Master.",
        "As the first adornments [of the universe] the thrones, and cherubim and seraphim shone forth directly with divine rays; and ordering themselves now in their deifying sacred ranks, they chant: Glory to Thy power, O Lord!",
        "With unceasing threefold hymns to the Trinity the sacred seraphim praise the threefold Unity of the Godhead, revealing the all-pure mystery of theology, and teaching the Orthodox Faith."
      ],
      theotokion: "He Who is understood to transcend all creation in His life-giving creative power, truly working miracles on earth by virginal splendors, made His abode within thy pure womb, O all-pure one."
    },
    5: {
      irmos: "O Christ Who hast enlightened the ends of the world with the radiance of Thy coming and hast illumined them with Thy Cross: with the light of Thy divine knowledge enlighten the hearts of those who hymn Thee in Orthodox manner.",
      troparia: [
        "I have fallen into the corruption of the passions, and fear Thy just judgment, O righteous Lord; wherefore, I pray to Thee: Strengthen me to do good works which may justify me.",
        "Thou knowest the hidden and secret things of my heart, O my God, Creator and Lord; wherefore, condemn me not at the hour of judgment, when Thou shalt come to judge all men.",
        "Set afire by divine love, the dominions, principalities and powers, the secondary ranks, hymn the one Essence and Power of the Godhead with unceasing voices.",
        "The angelic ranks, the angels and principalities, and the countless armies [of heaven] are guided by the Spirit: they are taught to worship with splendor the illumining Essence in three Hypostases."
      ],
      theotokion: "He Who is understood to transcend all creation in His life-giving creative power, truly working miracles on earth by virginal splendors, made His abode within thy pure womb, O all-pure one."
    },
    6: {
      irmos: "The uttermost abyss hath surrounded us, and there is none to deliver us. We are accounted as lambs for the slaughter. Save Thy people, O our God, for Thou art the strength and correction of the weak!",
      troparia: [
        "As a physician, O Christ, heal the sufferings of my heart, and cleanse me of every defilement with streams of compunction, O my Jesus, that I may hymn and magnify Thy compassion.",
        "Turn me back, who am gone astray among the ways of destruction and fall into the pit of offenses, O Christ, and lead me to the straight paths of Thine honorable justifications, that I may glorify Thee.",
        "The ranks of the incorporeal beings, standing before the throne of Thy glory, O Lord Who lovest mankind, worship Thee with unceasing angelic voices, for thou art their strength, O Christ, and their hymn.",
        "Gazing upon Thy countenance, the inconceivable beauty and all-divine magnificence of Thy divine radiance, the angels are enlightened; for Thou art their light and joy."
      ],
      theotokion: "The Word Who before was the incorporeal, Who accomplisheth all things by His will, and bringeth the armies of the incorporeal beings out of non-existence, became incarnate of thee, O all-pure one, in that He is Almighty."
    },
    7: {
      irmos: "O Theotokos, we, the faithful, perceive thee to be a noetic furnace; for, as the supremely Exalted One saved the three youths, in thy womb the praised and most glorious God of our fathers wholly renewed the world.",
      troparia: [
        "With virtue as his companion, Daniel tamed the lions of old. Emulate him, O my soul, and ever lifting thine eyes up to God, render impotent him who ever roareth like a lion, desiring to seize thee.",
        "I have grievously defiled my soul with an excess of fornication. O Christ Who hast exalted virtue, accept me as the prodigal, and have pity on me who chant: All-hymned and all-glorious is the God of our fathers!",
        "Thou art the Light without beginning, Who shone forth from the Father of light, O Master, and didst make the armies of the angels mirrors reflecting Thy never-waning radiance. All-hymned and all-glorious is the God of our fathers!",
        "O Lord of all, Thou dost manifestly save the human race at the supplications of the angels, for Thou hast assigned them to all believers who in Orthodox manner hymn Thee, the all-hymned and all-glorious God of our fathers.",
        "Tongue and mind are unable to recount Thy wonders and the majesty of Thy works, O Master; for Thou hast enlightened all the beauty of the heavenly hosts. All-hymned and all-glorious is the God of our fathers!"
      ],
      theotokion: "The Son, Who before was begotten of the Father without mother, became incarnate of thee, O pure one, for our sake becoming like us. Him do the regiments of the incorporeal beings now serve as the praised and all-glorious God of our fathers."
    },
    8: {
      irmos: "The children of Israel in the furnace, shining more brightly than gold in a crucible in the beauty of their piety, said: Bless the Lord, all ye works of the Lord; hymn and exalt Him supremely for all ages!",
      troparia: [
        "O Christ my compassionate Deliverer, from the gloom of sin which besetteth me and from all temptations deliver me who cry: Bless the Lord, all ye works of the Lord! Hymn and exalt Him supremely for all ages!",
        "When Thou shalt come in glory to judge the world, O Christ, with Thine elect cause me to stand, who cry out and say: Bless the Lord, all ye works of the Lord! Hymn and exalt Him supremely for all ages!",
        "From afar sacred voices proclaimed thee to be the Mother of God Who created all things, O all-pure one. Unto Him do we cry: Bless the Lord, all ye works of the Lord! Hymn and exalt Him supremely for all ages!",
        "Emulating the armies of the angels, which are enlightened and fully illumined by the rays of the beauty of the threefold Sun, O ye faithful, let us chant: Bless the Lord, all ye works of the Lord! Hymn and exalt Him supremely for all ages!",
        "As the source of all good things, the divine power of the Godhead brought forth the divine hosts as secondary luminaries which receive the primal Light and cry out: Bless the Lord, all ye works of the Lord! Hymn and exalt Him supremely for all ages!",
        "The primal Mind and Creator transessentially made celestial the angelic intelligences, who manifestly draw nigh unto Him and cry: Bless the Lord, all ye works of the Lord! Hymn and exalt Him supremely for all ages!",
        "Unto Him Who was begotten by the Father before time in manner past describing didst thou ineffably give birth for us, O most immaculate Virgin. Unto Him do we cry: Bless the Lord, all ye works of the Lord! Hymn and exalt Him supremely for all ages!"
      ],
      theotokion: null
    },
    9: {
      irmos: "The radiant cloud upon which the unoriginate Master of all descended from heaven, like rain upon the fleece, and of whom He was incarnate, becoming man for our sake, let us all magnify as the pure Mother of God.",
      troparia: [
        "Now is the time for repentance and works of purity! This is the day for us to do the works of light! Flee the darkness of the passions, and cast off the sleep of evil despondency, O my soul, that thou mayest share in light divine.",
        "I sigh like the publican, and I shed tears like the harlot; like the thief I cry out to Thee: Remember me, O Compassionate One; and like the prodigal son I exclaim: I have sinned! And I fall down before Thee as did the Canaanite woman. O merciful Christ, disdain me not!",
        "O Savior, Thou didst create the incorporeal intelligences to share in Thine ineffable glory. By them do Thou preserve now Thy people, who flee unto Thee with faith and love, that we may magnify Thee directly, O Master.",
        "Send Thou an angel of peace to preserve Thy flock, O Almighty; for Thou art the Cause of peace and love, Who preservest the divinely wise Faith, and destroyest all heresies by Thy power.",
        "All the delight of which we sing, the radiance of heavenly delight, do Thou plant in Thy Churches, O Master; and grant us the state wherein with piety we may unceasingly magnify Thee, the Savior."
      ],
      theotokion: "The ranks of angels now unceasingly hymn thy birthgiving, O all-pure one, for they stand in rank, gazing upon and sharing in His gladness; and they unceasingly magnify thee, the Theotokos."
    }
  }
},
            2: {
  metadata: {
    day: "Tuesday",
    theme: "Repentance and the Holy Forerunner John the Baptist",
    canons: ["Canon of Repentance", "Canon of the Forerunner"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Forerunner per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present: false,
    source: "Lambertsen, The Octoechos Vol. I (Tones I & II), St. John of Kronstadt Press, 1999",
    pages: "32–37",
    verified: true
  },
  odes: {
    1: {
      irmos: "Let us all chant a hymn of victory unto God, Who hath wrought marvelous wonders with His upraised arm and saved Israel, for He is glorious.",
      troparia: [
        "Enslaved by the passions of sin, I fall down before Thee, O Lord, that Thou mightest show me to be free of them, for I ardently glorify Thy goodness.",
        "Wretch that I am, I have been wounded by the spear of sin and am done to death. And the enemy, seeing me lying there, is glad. O Thou Who dost raise up the dead, give me life and save me.",
        "Thou wast the voice of the Word, O blessed one; wherefore, accept the cries we make unto thee, O Forerunner, freeing us from evils by thy mediation.",
        "Thou wast shown to be fruitful in divine deeds; wherefore, my heart, which is in all ways unfruitful, do thou render fruitful in good works, that I may ever faithfully glorify thee."
      ],
      theotokion: "O unwedded and pure Virgin Theotokos, only intercession and protection of the faithful, from misfortunes, tribulations and grievous circumstances deliver all who place their trust in thee, O Virgin, and by thy divine supplications save thou our souls."
    },
    3: {
      irmos: "The same stone which the builders rejected, is become the head-stone in the corner; this is the stone whereon Christ hath established the Church which He redeemed from among the nations.",
      troparia: [
        "Behold my weakness, O greatly merciful Christ Who clothed Thyself therein! Behold the exceeding ugliness of my soul! Hearken to my voice, O Savior, and transform its lack of beauty into comeliness.",
        "O Jesus Who saved the prodigal, save me who alone have transgressed Thy laws of salvation, though I have mindlessly committed every sin, and estrange myself from Thee by thoughts which make me alien to Thee, O Good One.",
        "O Forerunner who sprang forth in sacred manner from a barren and childless woman, thou wast shown to be fruitful in divine deeds; wherefore, my heart, which is in all ways unfruitful, do thou render fruitful in good works, that I may ever faithfully glorify thee.",
        "With the bread of heaven, O blessed one, fortify my heart which is paralyzed by wicked thoughts; and grant that I may earnestly do the will of God the most compassionate, that I may ever glorify thee with faith."
      ],
      theotokion: "Thou gavest birth unto Him Whom the Father begat before time began. And without having known man thou didst feed the Nourisher [of all]. Behold an all-wondrous miracle, a new mystery, O thou who art full of the grace of God! For this cause the soul of each of the faithful doth glorify thee."
    },
    4: {
      irmos: "Foreseeing in the Spirit the incarnation of the Word, O Prophet Habbakuk, thou didst announce, crying out: When the years draw nigh, Thou shalt be acknowledged; when the season cometh, Thou shalt be shown forth! Glory to Thy power, O Lord!",
      troparia: [
        "The riches Thou gavest me have I squandered, O Christ, wickedly committing unseemly deeds; and, myself naked, I clothed myself in works of ungodliness. Wherefore, I cry to Thee: Taking pity on me in Thy divine goodness, clothe me again in my primal vesture.",
        "I have been brought low by mindlessness, have fallen grievously, and lie on the ground, incurably sick. Raise me up, O Christ, Thou restoration of the fallen, and establish my heart on the rock of saving repentance.",
        "Thou didst preach the Lamb Who taketh away the sins of the world, O blessed prophet. Ease thou the heavy burden of my sins, I pray, granting me compunction, which washeth away the defilements of the passions.",
        "Having woven a garment of salvation for thyself in the nakedness of thy body, O thou who didst baptize the Lord, with the vesture of righteousness and gladness do thou clothe me, who am stripped bare of all good works, I pray."
      ],
      theotokion: "Thou hast been shown to be a sanctified temple of God, Who dwelt within thee in manner past understanding, O Virgin. Him do thou beseech, that He cleanse us of the defilements of sin, that we may be shown to be temples and habitations of the divine Spirit."
    },
    5: {
      irmos: "Grant us Thy peace, O Son of God, for we know none other than Thee. We call upon Thy name, for Thou art the God of the living and the dead.",
      troparia: [
        "Replete am I with many and grievous falls into sin, O compassionate and long-suffering Master. Have pity on me who have condemned myself, and turn not Thy face away from me.",
        "Thou didst justify the publican who sighed, O Christ. And I, emulating him, beat my breast and cry out to Thee: Cleanse me, O Thou Who alone art compassionate and full of loving-kindness!",
        "It is neither an angel nor a mediator who hath saved us, but the Lord Himself, Who came to earth, and for Whom thou didst make the ways straight, O blessed one. Him do thou now entreat, that He show me the path which leadeth to the kingdom.",
        "Let fall a drop of salvation upon me who am withering away through the burning of the passions, O Forerunner, who submerged in the streams of the Jordan Jesus the Bestower of life, the Torrent of sweetness, that I may glorify thee as is meet."
      ],
      theotokion: "O most immaculate one, thou gavest birth to One of the all-holy Trinity in two wills but bearing a single hypostasis. Him do thou earnestly beseech, that we all may be saved."
    },
    6: {
      irmos: "Emulating the Prophet Jonah, I cry out: O Good One, free my life from corruption! O Savior of the world, save me who cry out: Glory to Thee!",
      troparia: [
        "The bones of mine accursed soul have been broken, and I have been crushed beneath the weight of many pleasures. But help me, O Christ, Thou only help of all.",
        "I have fallen into the deep of evils and the tempest of the passions, but I cry to Thee, O almighty Christ: Lead me up with Thy mighty hand, and save me!",
        "O Baptist who preached repentance on the earth, show me the paths of repentance which lead to the light, and deliver me out of the chasm of falsehood.",
        "O thou who immersed the Abyss of mercy in the streams of the river, dry up the abyss of my passions, giving me a well-spring of tears, O Forerunner and Herald of Christ."
      ],
      theotokion: "O Mary, revealed tabernacle of sanctification, sanctify my wretched soul which alone hath been defiled by pleasures, and cause me to share in glory divine."
    },
    7: {
      irmos: "The fire neither touched nor vexed Thy children in the furnace, O Savior; for then, as with one mouth, the three hymned and blessed Thee, saying: Blessed is the God of our fathers!",
      troparia: [
        "Job mastered patience, and as a tower of courage remained unshaken by all the attacks of the wicked one. Him do thou emulate, O my soul, and in nowise be disheartened amid evils.",
        "I have been overcome by the pleasures of the body, and though a rational being, have become irrational. O Word of God Who saved the harlot by Thy word, save me, the wretched one, that I may sing, blessing Thy goodness.",
        "O Baptist and Forerunner of Christ, thou didst appear on earth laying down the law of repentance. By thy supplications do thou strengthen all to keep this law, that we may be delivered from the countless evils we ever commit.",
        "Pursuing all mastery, O wise one, thou didst tread the narrow path, being wholly illumined by the breadth of splendid divine visions. And beseeching Christ, grant that we also may delight therein."
      ],
      theotokion: "O most hymned one, Christ desired thee alone out of all generations, as one pure and honorable, to be His habitation; and shining forth from thee like the sun, He hath enlightened all the earth."
    },
    8: {
      irmos: "Him of Whom the angels and all the hosts of heaven stand in awe do ye hymn as Creator and Lord, O ye priests; glorify, ye children; ye people, bless and exalt Him supremely for all ages!",
      troparia: [
        "By his wicked counsel the lying serpent hath stripped me bare of all the virtues. O my Savior Who hath stripped away his evil, array me now in the robe of the virtues.",
        "O righteous Judge Who shalt come to judge the human race at the dread hour, send me not condemned into the fire of Gehenna, but have pity and save me.",
        "Thou wast unjustly beheaded, O blessed one who immersed the head of Christ in the waters. By thy supplications strengthen all of us, that we may truly crush the pernicious head of the deceiver underfoot.",
        "An angel in manner of life wast thou shown to be, O John the Baptist, who preached the Angel of great Counsel to the ends of the earth; wherefore, with hymns we glorify thee for all ages.",
        "I alone have sinned more than others born on earth; I alone have been a breaker of Thy laws, O Lord. Wherefore, for the sake of the Forerunner have pity and save me.",
        "The Husbandman of all, finding thee to be like a flower in the vales of life, made His abode within thee, O Theotokos; and He now perfumeth us with the sweet scents of the virtues and purity."
      ],
      theotokion: null
    },
    9: {
      irmos: "The radiant cloud upon which the unoriginate Master of all descended from heaven, like rain upon the fleece, and of whom He was incarnate, becoming man for our sake, let us all magnify as the pure Mother of God.",
      troparia: [
        "Behold, the beacon shining forth upon those in the darkness of life! Behold, the melodiously singing swallow, the harbinger of spring for all, the great Forerunner of Christ, the mediator between the old and the new! By his supplications may we ever be preserved.",
        "I, who have a multitude of sins, now send thee, the friend of the Bridegroom, unto Him as an advocate, and I cry out to thee, O thou who didst baptize Him: Grant that my debts may be repaid, O all-blessed one, and light thou the lamp of my soul, which through my carelessness hath utterly gone out.",
        "With the incorporeal angels, with the honored apostles, with the sacred passion-bearers, and with the prophets, O Forerunner, ever entreat the all-good God, that we who are ever enriched by thee, our good intercessor, may receive everlasting good things.",
        "O beauteous swallow, precious nightingale, all-good dove, turtledove who lovest the wilderness, offspring of the desert, who didst baptize the Lord: Show forth my soul, which hath become barren through unfruitfulness, to bear good deeds as fruit."
      ],
      theotokion: "Like the throne of the cherubim thou holdest Him Who upholdeth all things, and thou feedest Him Who feedeth us. Him do thou unceasingly entreat, O divinely joyous and pure one, that thy flock may ever be delivered from earthquake, calamity, exile and every need."
    }
  }
},
            3: {
  metadata: {
    day: "Wednesday",
    theme: "The Precious and Life-creating Cross and the Theotokos",
    canons: ["Canon of the Holy Cross", "Canon of the Theotokos"],
    flatteningOrder: "Canon of the Holy Cross irmos governs; troparia: Canon of the Holy Cross then Canon of the Theotokos per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present: false,
    source: "Lambertsen, The Octoechos Vol. I (Tones I & II), St. John of Kronstadt Press, 1999",
    pages: "42–47",
    verified: true
  },
  odes: {
    1: {
      irmos: "Delivered from bitter bondage, Israel traversed the impassable as though it were dry land, and, seeing the enemy drowning, they chanted a hymn to God, as to their Benefactor, Who worketh wonders with His upraised arm, for He hath been glorified.",
      troparia: [
        "Lifted up upon the Cross, O Christ, with Thyself Thou didst raise up fallen man and didst cast down all the power of the enemy, O Word. Wherefore, I hymn the sufferings of Thee Who suffered and hast delivered me from the passions.",
        "Thou art the Lord of glory, O Thou Who hast crowned man with glory; and Thou wast crowned with thorns, that Thou mightest make fruitful our thorny nature, O Planter of divine deeds.",
        "Grant me streams of spiritual tears, O most immaculate one who gavest rise to the Well-spring of remission Who washeth away the defilement of sin and bringeth forth my life in humility.",
        "In conceiving God, thou becamest more exalted than creation, O pure one; wherefore, I beseech thee: Raise me up out of the mire of the passions, and lead me up to the divine heights of dispassion."
      ],
      theotokion: "On the day of judgment show thyself to be merciful unto me, I pray, O pure one, delivering me from the dreadful standing [on the left hand of Christ] and from grievous torment, for I flee beneath thy protection, O all-pure Mistress."
    },
    3: {
      irmos: "Let no mortal boast in his wisdom or riches, but rather in his faith in the Lord, crying out to Christ God in Orthodox manner, and ever chanting: On the rock of Thy commandments establish me, O Master!",
      troparia: [
        "The iniquitous made holes in Thy hands and feet, O my Jesus, Who of old ineffably fashioned man by Thy hand, and Who by suffering Thy passion hast freed all from corruption, O Christ God.",
        "\"Let the moon and the sun stand still!\" cried Joshua, prefiguring the dimming of the heavenly lights when the Master suffered in the flesh upon the Cross, whereby the evil princes of darkness have been put to shame.",
        "O all-pure one, thou wast consumed by the sword of the sufferings of thy Son, for thou didst see pierced by the spear Him Who hath withdrawn the sword which barred the way in paradise, and which forbade divine entry even to the faithful.",
        "Raise me up who am beset by the darkness of sin and have fallen, O all-pure one, and grant me a shower of tears whereby I may wash away my vile deeds; for thee alone do we have as a helper, O Theotokos."
      ],
      theotokion: "Beholding Thy crucifixion, the all-pure one cried out: 'O my Son, what strange sight is this? How is it that I see Thee, O Christ, Who healest the sufferings of the sick, dost endure new sufferings? How have Thine enemies rewarded Thee, O Benefactor, for the grace they have received?'"
    },
    4: {
      irmos: "Habbakuk, of old, heard wondrous report of Thee, O Christ, and cried out in fear: God shall come out of Thaeman, and the Holy One out of a mountain overshadowed and densely wooded, to save His anointed! Glory to Thy power, O Lord!",
      troparia: [
        "Stripes and wounds didst Thou endure, O Christ, healing the wounds of our hearts; and tasting bitter gall, Thou didst remove the bane of the sweet taste of corruption; and, nailed to the Tree, thou didst lift the ancient curse.",
        "Uplifted upon the Cross, Thou didst bring nigh the nations who had rejected Thee, and didst reconcile us to the Father, O Long-suffering One; and as Mediator Thou didst set Thyself between us, and in the midst of the earth didst endure a violent death.",
        "O good one, disdain not me who am sorely diverted from the commandments of God by the lies of the demon; but have pity, I pray, and show me to be immune to his deception, O all-pure one, for I flee to thy mercy.",
        "O Christ God Who alone art merciful, through the supplications of her who gave Thee birth have mercy and take pity on those who set their hope on Thee, and guide them to the light of Thy commandments, and vouchsafe unto them life everlasting."
      ],
      theotokion: "By thy tireless supplication, O all-pure one, rouse me who have fallen into the sleep of death, and who, weighted down by the chains of my transgressions, languish in the tomb of despair; and show me the way to repentance, I pray."
    },
    5: {
      irmos: "Shine forth Thy never-waning light, O Christ, into the hearts of those who hymn Thee with faith, granting us the peace which passeth understanding. Wherefore, hastening from the night of ignorance to the day by Thy light, we glorify Thee, Who lovest mankind.",
      troparia: [
        "Beholding Thee, Who suspended the earth upon the waters, hanging naked on the Tree, O Savior, the sun stripped away its light; and when the stones felt Thee lifted up upon the rock [of Golgotha], they split asunder in fear; and the foundations [of the earth] quaked.",
        "Uplifted upon the Tree, and run through with nails, Thou didst stain Thy fingers with blood, O Long-suffering One; and pierced by a spear in Thy side, Thou didst heal the wound of Adam, which he received when he listened to [Eve], his rib, and disobeyed the One Who created her.",
        "The torrents of my many transgressions have engulfed me and brought down the temple of my soul, O all-pure one; but as thou art the restoration of our first parents, O Theotokos, raise me up, thy servant.",
        "Extending thy hand, O Mistress, raise me up who am sinking in the mire of the passions, wretch that I am, and am foundering amid the storm of my many offenses; and guide me to the haven of repentance."
      ],
      theotokion: "Grant me cleansing of the defilements of my flesh, heal the pangs of my flesh, I pray, and by thy supplications lift the grievous despondency which besetteth me."
    },
    6: {
      irmos: "I am wholly held fast by boundless passions, and have fallen into the sea monster of evils; yet lead me up from corruption, O God, as thou didst Jonah of old, and grant me dispassion by faith, that I may sacrifice to Thee with a voice of praise and in the spirit of salvation.",
      troparia: [
        "When Moses raised up his arms, he provided an image of the Passion of Thee Who stretched out Thy hands on the Tree and destroyed the pernicious dominion of the evil one; wherefore, we hymn Thee, knowing Thee to be our Deliverer and Savior, O Thou Who lovest mankind.",
        "Uplifted upon the Tree, Thou didst endure death and didst put to death him who brought death upon us; and having brought life again to the work of Thy hands, O Christ, pierced in the side with a spear Thou didst pour forth remission with both hands, O Thou Who art hymned as having two volitions.",
        "I pray to thee, the only good one, the undefiled tabernacle: By your mediation wash away all defilement from me who have been defiled by many sins.",
        "Be thou a pilot for me who am tossed about on the deep of evils by the needs of life, O pure one; steer me to the true harbor, and save me."
      ],
      theotokion: "Threefold billows of wicked thoughts, assaults of the passions and the abyss of sin overwhelm my wretched soul. Help me, O holy Mistress!"
    },
    7: {
      irmos: "The youths, who once were manifestly shown forth as holy for their piety, passed through the unbearable flame of the furnace as though it were a bridal chamber; and, chanting with one accord, they sang: O God of our fathers, blessed art Thou!",
      troparia: [
        "Though Thou art Master, O my Jesus, a servant smote Thee, for Thou didst desire to free me who am held in thrall by the enemy; and, nailed to the Cross, Thou savest me who chant: O God of our fathers, blessed art Thou!",
        "All creation trembled, O compassionate Lord, when Thou wast crucified; and when Thy side was pierced by a spear, the enemy was wholly wounded; and Thou didst heal wounded Adam, who cried: Blessed is the God of our fathers!",
        "The shadows of the law and the former indistinct images of the divinely eloquent prophets manifestly proclaimed thy seedless birthgiving, O all-pure and most immaculate one. And we cry out, hymning the hymned and all-glorious God of our fathers.",
        "O pure one full of the grace of God, thou gavest birth to the Sun of the East, Who hath illumined the fullness of all the faithful and caused the night of impiety to fade. Wherefore, we honor the hymned and all-glorious God of our fathers."
      ],
      theotokion: "The Maiden who ineffably gave birth to the Word Who loveth mankind, beholding Him voluntarily suffering at the hands of men, cried out: 'What is this? God Who is beyond suffering undergoeth suffering, that He might deliver from the sufferings those who worship Him with faith!'"
    },
    8: {
      irmos: "The children of Israel in the furnace, shining more brightly than gold in a crucible in the beauty of their piety, said: Bless the Lord, all ye works of the Lord; hymn and exalt Him supremely for all ages!",
      troparia: [
        "Enlighten the eyes of my heart, O pure one who art the portal of the Light, dispelling the deep darkness and cloud of the passions, that I may chant: Hymn the Lord, all ye works of the Lord, and exalt Him supremely forever!",
        "O pure, most immaculate Mistress, never cease to pray for all who call upon thee as the Mother of God and cry out: Bless the Lord, all ye works of the Lord! Hymn and exalt Him supremely forever!",
        "O most hymned Virgin, who ineffably gavest birth to Christ, the Source of salvation, pray for all who fervently cry out: Bless the Lord, all ye works of the Lord! Hymn and exalt Him supremely forever!",
        "Of Thine own will Thou wast crucified, O Christ, and with Thy hand unfurled the sky; and Thou wast pierced by nails, desiring to set aright the terrible stumbling of first-created Adam. Wherefore, chanting, we sing: Let all creation bless the Lord and exalt Him supremely forever!",
        "When the hard-hearted assembly lifted Thee, the Rock, up upon the rock [of Golgotha], the mountains quaked and the earth shook, O Word of God; but timid souls were made steadfast in divine life, and ever cry: Let all creation bless the Lord and exalt Him supremely forever!"
      ],
      theotokion: null
    },
    9: {
      irmos: "Ineffable is the mystery of the Virgin! For she hath been shown forth as heaven, the throne of the cherubim and the radiant bridal-chamber of Christ God Almighty. Her do we piously magnify as the Theotokos.",
      troparia: [
        "When of old the wise thief beheld Thee, Who suspended the earth upon the unfathomable waters, hanging upon the Tree, O Savior, he cried out to Thee with faith: Remember me! And with him we piously glorify Thy sufferings.",
        "Crucified, Thou didst shake the foundations of the earth; and when Thou wast pierced by the spear, Thou didst pour forth drops of immortality — Thy Blood and water — whereby Thou didst cleanse mankind of the passions, O Jesus. Wherefore, chanting, we magnify Thee.",
        "Take away the heavy burden of mine offenses, O most hymned Theotokos, and vouchsafe that I may bear the yoke of thy Son and God, which is most light, and may tread the path which leadeth to perfection on high.",
        "I tremble, O most immaculate one, when I think of the dread day of the coming of Christ; for all my life hath ended in sins, and my soul is full of the passions. But have pity on me, and deliver me then from all damnation."
      ],
      theotokion: "O all-pure Mistress, accept the entreaties of thine unprofitable servant, and transform the turmoil of my soul and body into profound serenity, that, saved, I may magnify thee."
    }
  }
},
            4: {
  metadata: {
    day: "Thursday",
    theme: "The Holy Apostles and St. Nicholas the Wonderworker",
    canons: ["Canon of the Holy Apostles", "Canon of St. Nicholas"],
    flatteningOrder: "Canon of the Holy Apostles irmos governs; troparia: Canon of the Holy Apostles then Canon of St. Nicholas per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present: false,
    source: "Lambertsen, The Octoechos Vol. I (Tones I & II), St. John of Kronstadt Press, 1999",
    pages: "52–57",
    verified: true
  },
  odes: {
    1: {
      irmos: "Thy victorious right arm hath in godly manner been glorified in strength; for as almighty, O Immortal One, it smote the adversary, fashioning anew the path of the deep for the Israelites.",
      troparia: [
        "Illumined by the divine rays of the effulgence of the threefold Sun, O glorious and radiant apostles, ye truly became gods by adoption; wherefore, as is meet, we honor you with faith.",
        "Ye became faithful ministers of the Word Who in His loving-kindness appeared on earth in the coarseness of the flesh, and fulfillers of all His precepts by faith, O apostles, and are ever honored.",
        "O ever-blessed ones, with the radiant beams of the all-holy Spirit enlighten the whole of me, who am enshrouded in the darkness of sins; and manifestly guide me to the path of repentance.",
        "Adorned with crowns of righteousness, and standing before the throne of grace, O Nicholas, by thy supplications ever save those who in hymns now crown thee with faith."
      ],
      theotokion: "O most immaculate Theotokos and Mistress, who art the joy of the apostles: In that thou art Mother to Him Who hath divinely spoken in them, pray with them, that He deliver me from the fire of Gehenna."
    },
    3: {
      irmos: "O Thou Who alone hast known the weakness of human nature, having in Thy mercy formed Thyself therein: Thou dost gird me about with power from on high, that I may chant to Thee: Holy is the living temple of Thine ineffable glory, O Thou Who lovest mankind!",
      troparia: [
        "God, Who alone is invisible, became visible when He was incarnate; and He chose you as disciples for the whole world, to proclaim His name and surpassing glory, O all-blessed, divine apostles.",
        "Against Thee only have I sinned, O Christ, against Thee only have I committed iniquity; and I have defiled my soul with evils. By Thy mercy cleanse Thou and save me, for I have Thine all-wise apostles entreating Thee, O Jesus Who alone art readily appeased.",
        "O merciful apostles, deliver me from bitterness of the defilements of passions and sins, sweetening my thoughts with repentance, in that ye have divine sweetness in your hearts, O most lauded ones.",
        "O most blessed Nicholas, who receivest the grace of healings, by thy supplications heal the wounds of my soul, and deliver me from the temptations which beset me, I pray."
      ],
      theotokion: "With thy light dispel the gloom from my mind, O most immaculate one, and deliver me from everlasting darkness, that I may ever hymn thy mighty works."
    },
    4: {
      irmos: "Habbakuk, gazing with the eyes of foresight upon thee, the mountain overshadowed by the grace of God, prophesied that the Holy One of Israel would come forth from thee, for our salvation and restoration.",
      troparia: [
        "Roiling the sea of ungodliness and unbelief by your riding forth like horses, O divinely chosen apostles of Christ, ye drowned the noetic foe and drew drowning men forth to salvation.",
        "O apostles, ye receptacles of the divine effulgence of the Spirit, with the light of repentance enlighten my darkened soul, which hath become a receptacle of all manner of passions, O godly apostles divinely blessed.",
        "O clouds who let fall the water of life, give drink divinely unto my soul, which is desiccated by the drought of the passions, and cause it to produce the grain of salvation and the virtues, O most praised apostles.",
        "As the fulfiller of all the precepts of God, O holy hierarch Nicholas our father, and by thy supplications enable us on earth to keep the laws which lead to salvation; and deliver us from all the temptations which assail us."
      ],
      theotokion: "Enlightened in mind by the Spirit of God, the prophet described thee beforehand, O pure one, as the mountain overshadowed. By grace and thy right acceptable mediations, O Theotokos, cool now those who are burning up with the heat of many transgressions."
    },
    5: {
      irmos: "O Christ Who hast enlightened the ends of the world with the radiance of Thy coming and hast illumined them with Thy Cross: with the light of Thy divine knowledge enlighten the hearts of those who hymn Thee in Orthodox manner.",
      troparia: [
        "Ye were shown to be mountains giving rise to sweetness and beauteous gladness, O most glorious apostles, washing away all the bitterness of the enemy and delighting the faithful.",
        "Ye understood that Christ had come to His own people as a sojourner, and ye cleaved unto Him sincerely. Wherefore, deliver me from the harm of the alien one, O divine apostles of the Word.",
        "Heal Thou the hidden wounds of my soul through the supplications of those who in sacred manner preached in the world Thy divine coming, Thy sufferings and rising from the tomb, O Compassionate One.",
        "Having finished thy course for Christ in holiness, direct thou our ways unto Him, O God-bearing father Nicholas, that, having escaped from wandering in trackless wastes, we may attain unto saving protection."
      ],
      theotokion: "The mouths of orators are unable to convey the ineffable wonder of thy birthgiving, O Bride of God; for thou gavest birth to the Ineffable One, and in thine arms didst hold Him Who upholdeth all things in His hand."
    },
    6: {
      irmos: "The uttermost abyss hath surrounded us, and there is none to deliver us. We are accounted as lambs for the slaughter. Save Thy people, O our God, for Thou art the strength and correction of the weak!",
      troparia: [
        "With noetic nets ye fished for the nations, drawing them forth to the understanding of Him Who edifieth men, O divinely blessed apostles. Him do ye earnestly entreat in behalf of the world.",
        "O lowly soul, O wretched soul, O unrepentant soul: Repent, and cry out unto Christ: I have sinned! By the supplications of Thine apostles cleanse me, O Master Who lovest mankind, in that Thou art all-good.",
        "O Almighty Christ, Who of old didst pour forth water from a rock for Israel, by the supplications of Thine apostles dispel my gloom and cause me to produce torrents of tears, in that Thou art greatly merciful, that I may hymn and magnify Thy loving-kindness.",
        "O all-wise father Nicholas, who set at nought all the wiles of the enemy, through thy divine watchfulness fill all of us with grace who keep vigil, hymn God, and set thee before Him as an advocate."
      ],
      theotokion: "O Virgin, Him Who in His goodness was well-pleased to be born of thee do thou entreat as Creator and God, that He save from temptations and perils those who ever hope in thee, O all-holy one."
    },
    7: {
      irmos: "O Theotokos, we, the faithful, perceive thee to be a noetic furnace; for, as the supremely Exalted One saved the three youths, in thy womb the praised and most glorious God of our fathers wholly renewed the world.",
      troparia: [
        "The Lord Jesus, the Wellspring of life, left you, His disciples, as rivers imparting the waters of the knowledge of God as drink to the whole world, for ye chant: Praised and all-glorious is the God of our fathers!",
        "Bearing in your hearts the noetic Fire, the divine grace of Christ, O disciples, ye burned up the tinder of ungodliness; wherefore, utterly consume the flammable passions of me who cry out: Praised and all-glorious is the God of our fathers!",
        "Deliver me from fiery torment, O God, through the supplications of Thy glorious disciples; and turn not Thy face away from me, O Lord, for I cry out in repentance: Praised and all-glorious is the God of our fathers!",
        "O most blessed Nicholas, who receivest the grace of healings, by thy supplications heal the wounds of my soul, and deliver me from the temptations which beset me, that I may chant: All-hymned and all-glorious is the God of our fathers!"
      ],
      theotokion: "O Lord, Who wast born of the Virgin Mother of God without corruption, rescue me from corrupting sins and the passions, granting incorruption unto all who chant in hymns: Praised and all-glorious is the God of our fathers!"
    },
    8: {
      irmos: "The children of Israel in the furnace, shining more brightly than gold in a crucible in the beauty of their piety, said: Bless the Lord, all ye works of the Lord; hymn and exalt Him supremely for all ages!",
      troparia: [
        "The great Sun shone you forth like rays upon the whole world, O apostles, illuminining those who sing with faith: Bless the Lord, all ye works of the Lord! Hymn and exalt Him supremely forever!",
        "As reason-endowed shepherds, as sheep of the Shepherd, as lambs of Christ the Lamb, our Deliverer, O apostles who beheld God, unceasingly pray that He deliver me from the noetic wolf and vouchsafe me the portion of the saved.",
        "O all-accursed soul, groan and cry out to the Lord: I have sinned more than any other, and have wickedly committed iniquity! Cleanse and save me as Thou didst the harlot, the publican, and the thief, O Compassionate One, through the right acceptable prayers of the apostles.",
        "Standing on the mountain of the godly virtues, by the showing forth of exalted miracles thou becamest known to the ends of the earth, O Nicholas; wherefore, every tongue honoreth thee for all ages.",
        "Having tasted of divine sweetness, O venerable one, thou didst hate the bitterness of passions and pleasures. Deliver us from them, entreating Christ to put down the misfortunes that assail us.",
        "As the unshakable pillar and confirmation of the faithful, O most blessed Nicholas, by thy supplications strengthen me who am ever shaken by the evils of life and the inspirations of the demons.",
        "Thou alone didst deify men when thou gavest birth to the incarnate Word. Him do thou entreat with the apostles and martyrs, O all-pure and most immaculate Virgin, in behalf of us who bless and honor thee with faith."
      ],
      theotokion: null
    },
    9: {
      irmos: "The bush which burnt with fire yet was not consumed showed forth an image of thy pure birthgiving. And we pray now that the furnace of temptations which rageth against us may be extinguished, that we may magnify thee unceasingly, O Theotokos.",
      troparia: [
        "Ye were shown to be divine and radiant lamps of the Holy Spirit, O blessed ones, and by the splendor of your honorable and all-wise preaching ye illumined the whole world, driving away the darkness of the idols.",
        "As branches of the divine, noetic vine, ye produced the divine grapes which pour forth the wine of salvation, O glorious apostles. Wherefore, deliver me from the drunkenness of pleasures.",
        "I tremble, wretch that I am, when I consider Thy dread judgment, O Christ; for I am now clad in shameful and foul deeds, and am condemned even before trial. Wherefore, through the supplications of Thine apostles have pity on me.",
        "The end is already nigh! Wherefore art thou slothful, O my soul? Why dost thou not strive to live a life pleasing unto God? Haste thou, and arise henceforth, and cry aloud: Have mercy upon me, O Thou Who lovest mankind, directing my life through the supplications of Nicholas, in that Thou art good!"
      ],
      theotokion: "O most immaculate one, who gavest birth to the divine Light, enlighten me who am darkened by all the assaults of the evil one, who dwell in despondency, and anger God; and guide me to good works, for thou art the cause of all good things."
    }
  }
},
            5: {
  metadata: {
    day: "Friday",
    theme: "The Precious and Life-creating Cross and the Theotokos",
    canons: ["Canon of the Holy Cross", "Canon of the Theotokos"],
    flatteningOrder: "Canon of the Holy Cross irmos governs; troparia: Canon of the Holy Cross then Canon of the Theotokos per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present: false,
    source: "Lambertsen, The Octoechos Vol. I (Tones I & II), St. John of Kronstadt Press, 1999",
    pages: "61–66",
    verified: true
  },
  odes: {
    1: {
      irmos: "Let us all chant a hymn of victory unto God, Who helped Moses in Egypt and by him destroyed Pharaoh and his whole army, for He hath been glorified.",
      troparia: [
        "O Word Who art dispassionate by nature, yet didst endure sufferings for our sake and wast crucified with thieves, Thou didst slay the serpent, the author of evil, and hast saved those who worship Thee.",
        "Though Thou art the dawning of the East, O Jesus, Thou didst come to the parts of the West, our rejected nature; and the sun, seeing Thee crucified, hid its light.",
        "Do away with all the barrenness of mine unfruitful thoughts, and show my soul to be fruitful through the virtues, O all-pure Theotokos, helper of the faithful.",
        "O most immaculate one who gavest birth to the preeternal Light, deliver me from every evil circumstance, from the many temptations of the serpent, and from eternal fire and darkness."
      ],
      theotokion: "In that thou gavest birth to Christ in time to the only timeless God incarnate, O most holy and all-pure one, heal mine all-accursed soul of the passions which ever afflict me."
    },
    3: {
      irmos: "Let my heart be made steadfast in Thy will, O Christ God, Who didst establish the second heaven above the waters and didst found the earth upon the waters, O Almighty One.",
      troparia: [
        "Thou didst stretch out Thy hands upon the Cross, staining Thy divine fingers with blood, and delivering Adam, the work of Thy hands, O Master, from the hands of the slayer, in that Thou alone art good and lovest mankind.",
        "Thou wast lifted up upon the Tree and wast pierced in the side by a spear, O Master, setting aright the fall caused by [Eve, Adam's] rib, whom of old misfortune befell through the fruit of the tree; and thou didst lead them into paradise with the honest thief.",
        "O most immaculate one who gavest birth to the preeternal Light, deliver me from every evil circumstance, from the many temptations of the serpent, and from eternal fire and darkness.",
        "Wholly condemned am I by the dread tribunal, the unquenchable fire and the stern sentence, O all-pure one. Haste thou, O all-pure Mistress, to save me, thy servant."
      ],
      theotokion: "To deify mankind, God became a man through thee, in manner past recounting and understanding, O pure Virgin; wherefore, together all of us, the faithful, call thee blessed."
    },
    4: {
      irmos: "I have heard report of Thee, O Lord, and I was afraid; I have understood thy works, the prophet said, and have glorified Thy power.",
      troparia: [
        "Though Thou art the righteous Bestower of the law, Thou wast reckoned among the lawless, and wast lifted up upon the Tree, desiring to justify all, O Lord our Benefactor.",
        "All the angelic hosts marveled, beholding Thee, the Sun, uplifted upon the Cross; and the hordes of the prince of darkness were vanquished.",
        "O Virgin Theotokos, thou undefiled tabernacle, by thy compassions, as with outpourings of great purity, cleanse me who am defiled by transgressions, and grant me a helping hand, that I may cry: Glory to thee, O pure Bride of God!",
        "Thou wast shown to be a temple dedicated to God Who made His abode within thee in manner past understanding. Him do thou entreat, that He cleanse us of the defilements of sin, that we may be known to be the temples and habitations of the Spirit."
      ],
      theotokion: "O holy Theotokos who gavest birth to the All-holy One in the flesh, sanctify us, that we may emulate Him Whose desire it was to become like men; and by thy supplications show us all to share in the kingdom of heaven, O all-pure one."
    },
    5: {
      irmos: "Shine forth thy radiant and everlasting light upon us who rise early unto the judgments of Thy commandments, O Master Christ our God, Who lovest mankind.",
      troparia: [
        "Uplifted upon the Cross in the flesh, Thou didst call to the knowledge of Thee the nations who knew Thee not, O Judge of all, O only merciful Christ our God.",
        "When Thou didst stand before the unjust tribunal, O righteous Lord, Adam, who before was condemned, was justified; and he crieth out: Glory to Thy crucifixion, O long-suffering Lord!",
        "The torrents of my many transgressions have engulfed me and brought down the temple of my soul, O all-pure one; but as thou art the restoration of our first parents, O Theotokos, raise me up, thy servant.",
        "Save me from cruel tribulations! Raise me up from the vile passions, and from the captivity and oppression of the evil demons deliver me who honor thee with love."
      ],
      theotokion: "O pure Virgin Mother, we know thee to be the cloud and garden of paradise, the portal of the Light, the table and fleece, and the jar holding within thee the Manna which is the delight of the world."
    },
    6: {
      irmos: "Thou didst save the prophet from the sea monster, O Thou Who lovest mankind. Lead me up from the abyss of transgressions, I pray.",
      troparia: [
        "O Christ Who dost surpass all honor, lifted up upon the Cross Thou didst endure dishonor, desiring to honor men.",
        "O all-good Christ our God, Who wast beaten with a reed, Thou signest a manumission for me who have been enslaved to deception.",
        "I pray to thee, the only good one, the undefiled tabernacle: By your mediation wash away all defilement from me who have been defiled by many sins.",
        "Be thou a pilot for me who am tossed about on the deep of evils by the needs of life, O pure one; steer me to the true harbor, and save me."
      ],
      theotokion: "O Mary, thou sacred tabernacle which hath been revealed, sanctify my wretched soul, which hath been defiled by pleasures."
    },
    7: {
      irmos: "The furnace was bedewed, O Savior, and the children, dancing, chanted: O God of our fathers, blessed art Thou!",
      troparia: [
        "When Thou wast crucified, Thou didst shake creation; and when Thou didst die, Thou didst slay the serpent. Blessed art Thou, O Christ, God of our fathers!",
        "Thou didst taste gall, O Long-suffering One, pouring forth the sweetness of salvation upon me who was deprived of the food of paradise through pleasurable eating.",
        "Sanctify my soul, which hath been defiled by the passions, O all-pure Bride of God, and quickly bring an end to the grievous captivity of my mind, the perplexity of my heart and the onslaughts of the demons.",
        "Enliven my mind, which hath been done to death by carnal passions, O most immaculate one, and strengthen me to do works pleasing unto God, that I may magnify thee and ever glorify thy compassion."
      ],
      theotokion: "Beholding Him Who alone is most high uplifted upon the Tree and putting down the uprisings of the enemy, she who is more exalted than the heavens hymned Him aloud."
    },
    8: {
      irmos: "Christ God, Who saved the chanting children in the furnace and transformed the raging flames into dew, hymn ye and exalt supremely for all ages!",
      troparia: [
        "When Thou wast nailed to the Cross, O Savior, creation was shaken, the sun stopped its shining, and the rocks split asunder; and hades was soon emptied, unable to withstand Thy might.",
        "O Compassionate One, Thou didst hang naked on the Tree, suffering condemnation for the condemnation of him who was cast out, receiving nakedness. Great is Thy might and long-suffering!",
        "Sanctify my soul, which hath been defiled by the passions, O all-pure Bride of God, and quickly bring an end to the grievous captivity of my mind, the perplexity of my heart and the onslaughts of the demons.",
        "Beholding Thy crucifixion, the all-pure one cried out: 'O my Son, what strange sight is this? How is it that I see Thee, O Christ, Who healest the sufferings of the sick, dost endure new sufferings? How have Thine enemies rewarded Thee, O Benefactor, for the grace they have received?'",
        "In godly manner He Who is incorporeal became incarnate of thee. Him do thou beseech, O all-pure one, that He slay my carnal passions and give life to my soul, which hath been slain by my sins.",
        "O all-pure one, thou gavest birth to God the Savior, Who healeth the contrition of Adam, who had been fashioned from dust. Him do thou entreat, that He heal the incurably painful wounds of my soul.",
        "Raise me up who lie in the depths of evils, vanquish now him who wageth war against me, O pure one, and disdain not my soul, which hath been wounded by unseemly pleasures. Have pity, O all-pure one, and save me.",
        "By thy vigilant prayers unto God are we, who know thee to be the blessed and joyous Theotokos, delivered from all manner of temptations, O all-pure one."
      ],
      theotokion: null
    },
    9: {
      irmos: "O pure Mother, with hymns do we magnify thee: the unconsumed bush which Moses saw, the animate ladder which Jacob beheld, and the portal of heaven, through which Christ our God did pass.",
      troparia: [
        "O how the disobedient people gave over to the Cross Thee, the only Long-suffering One, Who didst impoverish Thyself of Thine own will, accepted sufferings, and by dispassion becamest a Mediator for all who had stumbled, from Adam on.",
        "Thou didst undergo ignominious crucifixion in the flesh, O Christ, desiring to honor man who was dishonored by irrational passions and had marred his ancient beauty. Glory to Thy loving-kindness, which passeth understanding!",
        "Loving sin, I abide in slothfulness, O pure one, and I tremble before the implacable tribunal. Keep me uncondemned thereat by thy holy supplications, O all-pure Bride of God, that I may ever bless thee as my helper.",
        "I tremble before the judgment and the inescapable eye of thy Son, having committed many sins on earth. Wherefore, I cry to thee: O most merciful Mistress, help me! O pure one, rescue me uncondemned from my need at that time!"
      ],
      theotokion: "O thou who gavest birth to the divine Light Who shone forth from the Father, have pity on my soul, which hath been benighted by the deceptions of life and is become an object of mockery to mine enemies; and vouchsafe unto me the light of saving repentance, O pure one."
    }
  }
},
            6: {
  metadata: {
    day: "Saturday",
    theme: "All Saints and the Departed",
    canons: ["Canon of All Saints", "Canon of the Departed"],
    flatteningOrder: "Canon of All Saints irmos governs; troparia: Canon of All Saints then Canon of the Departed per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present: false,
    source: "Lambertsen, The Octoechos Vol. I (Tones I & II), St. John of Kronstadt Press, 1999",
    pages: "71–77",
    verified: true
  },
  odes: {
    1: {
      irmos: "Guiding Israel with a pillar of fire and cloud, as God He divided the sea and overwhelmed the chariots of Pharaoh in the deep. Let us chant a hymn of victory, for He alone is glorious!",
      troparia: [
        "Protected by the shield of piety, the godly athletes went forth to do battle; and they destroyed all the power of the enemy, chanting a hymn of victory unto Christ, Who strengthened them.",
        "Ye tended the flock of God on the mystical pasture, O divine shepherds, driving away the wolves with the staff of your sacred words; and ye made your abode, rejoicing, in the fold of heaven, where the great Shepherd is.",
        "By Thy death thou didst break the gates and bars of death, O Immortal One. Open the gates of immortality which are past understanding, O Master, unto those who have fallen asleep, through the supplications of Thy passion-bearers.",
        "Nekrosimon: When Thou didst die, Thou gavest unto the dead Thy divine and immortal life. Give those who with faith have passed from this corrupt life a share in Thy kingdom, in that Thou art compassionate and alone art greatly merciful."
      ],
      theotokion: "O ye faithful, let us hymn her who through God gave birth to God the Word, for she, the most pure one, is become the path of life for those who have died. Let us glorify her as the God-receiver and Theotokos."
    },
    3: {
      irmos: "Let my heart be made steadfast in Thy will, O Christ God, Who didst establish the second heaven above the waters and didst found the earth upon the waters, O Almighty One.",
      troparia: [
        "Having endured many torments, ye have been vouchsafed many good things, O sacred multitude of martyrs; wherefore, by your supplications cleanse me of the incalculable multitude of mine evils.",
        "The sacred ones, having been clothed in the grace of righteousness, and the council of the venerable, having acquired gladness and beauty, made themselves like unto the immaterial ministers.",
        "O Christ Who of Thine own will and with Thine own hand fashioned man out of the earth, vouchsafe the good things of heaven unto all Thy servants who have departed from us with faith.",
        "Nekrosimon: That we might be vouchsafed divine life, Thou didst descend unto death, and having looted its strongholds, Thou didst lead us up therefrom; and now, O Bestower of life, give rest to those who have departed unto Thee."
      ],
      theotokion: "O Theotokos who knewest not wedlock, bear the petitions of all unto God our Creator, Who was born of thy womb, that we may obtain complete deliverance from evils."
    },
    4: {
      irmos: "I have heard report of Thee, O Lord, and I was afraid; I have understood thy works, the prophet said, and have glorified Thy power.",
      troparia: [
        "O martyrs who withstood every wound with valiant resolve, ye brought yourselves as unblemished lambs unto Christ, the Life Who was sacrificed for all.",
        "Taught by the word of God, the holy hierarchs became divine mouths, and delivered men's souls from the mouth of the deceiver. And we honor them with pious intent.",
        "Mighty in the divine Spirit, O godly fathers, by grace ye mightily vanquished the spirits of evil, O venerable ones.",
        "Nekrosimon: Having died of Thine own will upon the Tree, O Thou Who lovest mankind, vouchsafe life everlasting unto those who have passed on to Thee with faith."
      ],
      theotokion: "The choir of women who suffered manfully did not deny the Lord, nor were the saints overwhelmed by the pleasures of the body, for they had thee as an ally, O all-pure one."
    },
    5: {
      irmos: "Shine forth thy radiant and everlasting light upon us who rise early unto the judgments of Thy commandments, O Master Christ our God, Who lovest mankind.",
      troparia: [
        "Armed with piety, ye were shown to be unwounded by the arrows of the foe, O martyrs, and having become victors through grace, ye have received crowns.",
        "The Lord hath anointed with divine oil His priests who have shepherded multitudes of the faithful in holiness and have led them to the fold of heaven.",
        "O most sacred hieromartyrs, all ye venerable, who kept the laws of the Spirit and came to share in the kingdom, ye have been divinely glorified.",
        "Nekrosimon: O Master and Lord, unto those whom Thou hast taken to Thyself at Thy command, vouchsafe Thy kingdom with the saints, overlooking their ancient offenses."
      ],
      theotokion: "Those who suffered mightily and fasted ardently have through thee been led to Christ, the King of all, in thy train, as saith the psalm, O most hymned Theotokos."
    },
    6: {
      irmos: "Emulating the Prophet Jonah, I cry out: O Good One, free my life from corruption! O Savior of the world, save me who cry out: Glory to Thee!",
      troparia: [
        "Done to death through the infliction of many wounds, together ye have inherited true life, praying that all of us may be saved, O holy martyrs.",
        "Known on earth as radiant morning-stars, ye illumined the faithful with the light of piety, O all-glorious sword-bearers of Christ, ye all-wise and holy hierarchs.",
        "Ye were shown to be sojourners on the earth and citizens of heaven, O God-bearing fasters, who mortified carnal-mindedness by asceticism and humility.",
        "Nekrosimon: O Thou Who lovest mankind, and art possessed of an abyss of mercies which overwhelmeth the transgressions of Thy servants, receiving those whom Thou hast chosen, give rest to them in the bosom of Abraham, and cause them to dwell with Lazarus in Thy light."
      ],
      theotokion: "O ye faithful, let us hymn her who through God gave birth to God the Word, for she, the most pure one, is become the path of life for those who have died. Let us glorify her as the God-receiver and Theotokos."
    },
    7: {
      irmos: "The fire neither touched nor harmed Thy children in the furnace, O Savior; for then the three hymned and blessed Thee as with a single mouth, saying: Blessed is the God of our fathers!",
      troparia: [
        "Tried by all manner of tortures like gold in the fire, in the love of God the martyrs were shown to be more lustrous than any gold, and were deposited in the treasuries of heaven.",
        "As priests, as ministers of God, O sacred hierarchs, ye offered unbloody sacrifices unto God; and having shepherded the people, ye have made your abode where the great Shepherd dwelleth.",
        "Refusing to submit to the passions of the flesh, and having clothed yourselves in dispassion as in a mystic robe, O venerable ones, ye were shown to dwell with the angels. By their supplications, O Christ, deliver us from temptations.",
        "Nekrosimon: Where there is mystical food, where the light of Thy countenance shineth, O Christ, there through grace cause those who have departed from us in faith to dwell, that with piety they may glorify Thy goodness."
      ],
      theotokion: "The holy women, having thee, O all-pure one, as their adornment, joyfully join chorus with the angels and glorify God the Word Who in the flesh was born of thee in His great loving-kindness."
    },
    8: {
      irmos: "Him of Whom the angels and all the hosts of heaven stand in awe as their Creator and Lord, hymn, ye priests; glorify, ye children; bless, ye people, and exalt Him supremely for all ages!",
      troparia: [
        "All-gloriously cooled by the fire of the divine Spirit, all the martyrs passed the mouths of the lions and the boiling of cauldrons unharmed.",
        "Having granted Thy prophets to foresee things afar off, in sacred manner Thou didst make wise Thy holy hierarchs. Through their supplications, O Christ God, enlighten the hearts of those who hymn Thee with faith.",
        "O venerable ascetics, who crucified yourselves to the world, ye have inherited heavenly life with those who from all the ages pleased God in holiness and righteousness.",
        "Nekrosimon: O Thou Who as God didst fashion man from the earth, in that Thou art good Thou hast taken the faithful from the earth. Vouchsafe unto them the food of paradise, overlooking all things they have committed.",
        "Knowing thee manifestly to be good and immaculate among women, the women who suffered make entreaty with thee unto God, O pure Virgin, that thy servants may be saved from misfortunes.",
        "Nekrosimon: O Christ Who hast redeemed the world by the Blood which flowed from Thy side, by Thy precious sufferings deliver those who have fallen asleep in faith, for Thou didst pay Thyself over as a ransom for all men.",
        "Nekrosimon: O Thou Who of old didst fashion me with Thine all-pure hands and gavest me a spirit, and hast most beautifully restored me who have fallen grievously: Do Thou Thyself grant rest unto the souls of the departed."
      ],
      theotokion: null
    },
    9: {
      irmos: "O ye faithful, let us magnify the Theotokos, the ever-flowing, Life-receiving wellspring, the light-bearing lamp of grace, the animate temple, the all-pure tabernacle which is more spacious than heaven and earth.",
      troparia: [
        "Rejoicing, let us honor the sacred contests of the sacred martyrs, the sufferings and wounds, nailings and banishments, and blessed sacrifice, whereby they were shown to be heirs of Christ.",
        "As priests of God the divine favorites were clothed in righteousness; for having lived in holiness those who manifestly reached the end of their life in fasting rejoice, magnifying Christ.",
        "As divine mouths of the Lord, all the prophets proclaimed beforehand His light unto all; and with them now rejoice the women who struggled mightily and pleased God by fasting.",
        "Nekrosimon: O Power Who reignest over all, those whom Thou hast taken from the earth do Thou show to share with Thy saints in Thy kingdom; and in Thine all-great goodness, O God of all, overlook the things they have committed."
      ],
      theotokion: "O thy wonders which pass understanding! For thou alone, O Virgin, hast granted all under the sun to understand the newest miracle of thine incomprehensible birthgiving. Wherefore, we all magnify thee, O all-pure one."
    }
  }
}
        },
        2: {
  1: {
    metadata: {
      day:             "Monday",
      theme:           "Repentance and the Bodiless Powers",
      canons:          ["Canon of repentance to our Lord Jesus Christ and His holy martyrs", "Canon of the holy, incorporeal angelic hosts of heaven"],
      flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Bodiless Powers per ode, in source order (Martyricon troparia excluded); theotokion: final theotokion of the ode sequence",
      ode2Present:     false,
      source:          "Lambertsen, The Octoechos Vol. I (Tones I & II), St. John of Kronstadt Press, 1999",
      pages:           "97–102",
      verified:        true
    },
    odes: {
      1: {
        irmos: "Come, ye people, let us chant a hymn to Christ God, Who divided the sea and guided the people whom He had led forth from the bondage of Egypt, for He hath been glorified.",
        troparia: [
          "O Word Who becamest incarnate, and Who hast not come to call the righteous, but sinners to repentance: Accept me, who have greatly sinned!",
          "I alone have been enslaved to sins; I alone have opened the door to the passions! O Thou Who alone art easy to appease, turning me, save me in Thy loving-kindness.",
          "The choirs of the incorporeal beings who glorify Thee as almighty, O Christ, didst Thou show to be God-bearing coals set afire by the radiance of Thine essence.",
          "Having acquired the power of incorruption and been given the glory of immortality, the angels are enlightened by drawing nigh unto Thee, O Christ.",
          "As perceptible images of purity, the angels were revealed as light-bearers, showing forth the immaterial nature of their essence in their forms, O Christ."
        ],
        theotokion: "Rejoicing, O pure Virgin, the ranks of the angels ministered at thy birthgiving, which transcendeth nature; for thou gavest birth to their God and Lord."
      },
      3: {
        irmos: "Establish us in thee, O Lord Who hast slain sin by the Tree, and plant the fear of Thee in the hearts of us who hymn Thee.",
        troparia: [
          "O Christ Who didst enter into an incorrupt womb, through repentance restore my soul, which hath been corrupted by the passions, and show it to be full of everlasting light.",
          "I have been obedient to the enraging enemy, have committed every sin, and have mindlessly angered Thee, the only Long-suffering One, O Thou Who lovest mankind.",
          "God Who by nature is deathless, all-wisely acting through grace, revealeth the immortal armies.",
          "Standing now in your uttermost desire before Christ, O angels, pray ye that all of us may be saved."
        ],
        theotokion: "The Creator of the ages is known to have accepted a beginning under time through thee, O Ever-virgin."
      },
      4: {
        irmos: "I hymn Thee, O Lord, for I heard report of Thee, and I was afraid; for Thou comest to me, seeking me who have strayed. Wherefore, I glorify Thy great condescension toward me, O greatly Merciful One.",
        troparia: [
          "Falling into the mire of sin, I destroyed my higher comeliness, O Lord, and I fear torment. Wherefore, with the beauty of repentance enlighten my humbled soul.",
          "With lying words the deceiver who stole me away from Thee hath made me food for him to devour. O God of all, rescue me from his malice, and call me to Thee through examples of repentance.",
          "I bring before Thee the incorporeal ones as advocates, O Compassionate One. Accepting them, in that Thou art full of loving-kindness, deliver me from sins.",
          "Purified, the divine intelligences draw nigh to the all-accomplishing Mind, and are enlightened with transcendent understanding.",
          "Adorned by the divine Spirit, the divine adornments of the heavenly ranks are immutably preserved."
        ],
        theotokion: "Perceiving thee from afar, Isaiah foretold thee as the one who would bear God incarnate in thine arms, O Virgin."
      },
      5: {
        irmos: "O Lord, Bestower of light and Creator of the ages: guide us in the light of Thy commandments, for we know none other God than Thee.",
        troparia: [
          "O Thou Who broughtest light to the eyes of the blind man, enlighten my blinded soul, and strengthen it to keep awake for the doing of good, and utterly to hate the sleep of slothfulness.",
          "O only Savior, Who of old healed the wounds of him who fell among thieves, heal Thou my soul, which hath truly sustained a grievous wound.",
          "The cherubim and seraphim, shining forth in splendor with the all-exalted thrones near the divine Godhead, divinely illumine all other beings.",
          "O Word of God, Bestower of all effulgence, Thou didst bring into being the luminous reflections, who receive Thy radiance with gladness and sure understanding."
        ],
        theotokion: "The sacred Archangel Gabriel, having flown down from heaven, O pure Bride of God, declared unto thee the 'Rejoice!' which releaseth our first parents from grief."
      },
      6: {
        irmos: "Whirled about in the abyss of sin, I call upon the unfathomable abyss of Thy loving-kindness: Lead me up from corruption, O God!",
        troparia: [
          "I have fallen headlong through the malice of the serpent, and lie upon the bed of despair. O Christ Who by Thy word didst raise up paralytics, raise me up also.",
          "Save me, as Thou didst Peter, O Lord, for I am buffeted by the winds of the serpent and am ever engulfed by the billows of sin.",
          "The divine points of the glory of Thy primary light, glowing with the effulgence of Thy splendor, O Master Christ, remain eternally brilliant in radiance.",
          "Strengthened by divine power, and crying out the thrice-holy hymn with unceasing voices, the seraphim lead in worshipping the Essence in three Hypostases."
        ],
        theotokion: "The Lord swore in truth unto David, as He said of old; and in issuing forth from thy womb He fulfilled His word, for thou gavest birth unto Him Who reigneth over heaven and earth, O Maiden."
      },
      7: {
        irmos: "When the golden image was worshipped on the plain of Dura, Thy three youths spurned the ungodly command, and, cast into the midst of the fire, bedewed, they sang: Blessed art Thou, O God of our fathers!",
        troparia: [
          "With debauchery of mind and the attacks of the demons am I replete with all manner of shame; and like the prodigal I find myself at far remove from Thy commandments. But turning now, I cry: 'I have sinned like him, but despise me not, O Jesus Who becamest incarnate for my sake!'",
          "O God of all, of old Thou didst save the repentant Ninevites from the chastisement which would have brought death upon them. Thus also, O Thou Who alone lovest mankind, deliver from grievous torments my heart which hath been defiled by gross fornication, yet turneth now to Thee.",
          "Ever joining chorus round about the throne of Thine ineffable glory, the celestial intelligences sing with unceasing voices: O all-divine God of our fathers and of us, blessed art Thou!",
          "When the angelic ranks beheld Thee upborne in the flesh into the heavens, they threw wide the celestial gates unto Thee, saying: O all-divine God of our fathers and of us, blessed art Thou!"
        ],
        theotokion: "Showing thee to be the beginning of the law and the prophets, Gabriel cried out, O Maiden: 'Lo! thou who alone art most hymned shalt give birth to the all-divine and blessed God of the fathers and of us!'"
      },
      8: {
        irmos: "Once, in Babylon, the fiery furnace divided its activity at the command of God, consuming the Chaldæans, but bedewing the faithful, who chant: Bless the Lord, all ye works of the Lord!",
        troparia: [
          "I have fallen to the evil one, and been held in thrall by his wiles, and seeing me stuck fast in utter hopelessness, the deceiver boasteth greatly; wherefore rescue me, O Compassionate One, Who art the conversion of those in error.",
          "Loose me, who am held fast by the unbreakable bonds of carnal passions, O Christ, Thou Savior of the world, Who didst loose those fettered with everlasting chains; and guide me to flee unto the ways of salvation.",
          "Thou didst create the angels who carry out Thy commandments with might, to be likenesses of Thy goodness, O Word; and they help all the faithful to cry: Let all existing creation hymn and exalt the Lord supremely for all ages!",
          "The life of heaven, the ranks of the holy angels, didst Thou adorn with divine virtues, O Christ, enlightening them; and they cry unto Thee: Let all existing creation hymn and exalt the Lord supremely for all ages!",
          "Rejoicing in splendor, without fail let us unfailingly chant the divine hymn of the incorporeal ones; and theologizing concerning the Master, let us cry out with them in hymnody: Let all existing creation hymn and exalt the Lord supremely for all ages!",
          "The Righteous One, Who in wisdom setteth all things aright, loved thee, as is meet, the immaculate and all-pure Virgin, ineffably making His abode within thee, O all-holy Theotokos, and we glorify thee, saying: Let all creation hymn and supremely exalt the Lord for all ages!"
        ],
        theotokion: null
      },
      9: {
        irmos: "O ye faithful, with hymns let us magnify in oneness of mind the Word of God, Who from God came in His ineffable wisdom to renew Adam who had grievously fallen into corruption through eating, and Who became ineffably incarnate of the holy Virgin for our sake.",
        troparia: [
          "Now is the time to act! Why dost thou mindlessly sleep in deep despondency? Arise, and replenish thy lamp with tears! Haste thee, for the Bridegroom draweth nigh unto men's souls! Tarry not, lest thou remain outside the divine doors.",
          "O how awesome is Thy tribunal, which layeth every action bare before angels and men! O how grievous is the sentence which Thou shalt pronounce upon sinners! Before the end, O Christ, deliver me therefore, granting me tears of conversion.",
          "Thou didst create the angels who carry out Thy commandments with might, to be likenesses of Thy goodness, O Word; and they help all the faithful to cry: Let all existing creation hymn and exalt the Lord supremely for all ages!",
          "As the Benefactor of all rational nature, in Thy surpassing goodness Thou didst first create for Thyself a secondary radiance; wherefore, giving thanks, we all magnify Thee."
        ],
        theotokion: "Spare me, spare me, O Lord, when Thou shalt render judgment! Condemn me not to the fire, neither rebuke me in Thine anger. The Virgin who gave Thee birth entreateth Thee, O Christ, as doth the multitude of the angels and the company of martyrs."
      }
    }
  },

    2: {
      metadata: {
        day:             "Tuesday",
        theme:           "Repentance and the Holy Martyrs; the Forerunner",
        canons:          ["Canon of Repentance to our Lord Jesus Christ and His holy martyrs", "Canon of the holy prophet John the Forerunner"],
        flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Forerunner per ode, in source order (Martyricon troparia excluded); theotokion: final theotokion of the ode sequence",
        ode2Present:     false,
        source:          "Lambertsen, The Octoechos Vol. I (Tones I & II), St. John of Kronstadt Press, 1999",
        pages:           "106–111",
        verified:        true
      },
      odes: {
        1: {
          irmos: "Taking up the hymn of Moses, cry aloud, O my soul: My Helper and Protector hath He been for my salvation! He is my God, and I shall glorify Him!",
          troparia: [
            "Before our departure let us weep bitterly over ourselves, O brethren, that by goodly tears we, who are devoid of ought that is profitable, may avoid torment at that time.",
            "Ten thousands of times I vowed to repent, O Christ, but my soul is numb, and I fall into transgressions. Have pity on my weakness, O Savior.",
            "O Baptist and Forerunner of Christ, pilot my mind, which is ever overwhelmed by bodily pleasures, and still the waves of the passions, that I may hymn thee in divine serenity.",
            "Illumined with inconceivable enlightenment, like a star of great radiance thou didst advance before the noetic Dawn. Thereby, O Baptist, I pray: Let my heart be enlightened which hath been benighted by all the assaults of the demons.",
            "In the river, O most wise one, thou didst once immerse the Abyss Who by grace doth accomplish the drowning of all transgression. And I pray, O blessed one: By thy divine mediation dry up the torrents of my transgressions."
          ],
          theotokion: "Thou wast the kinsman of the pure Virgin who gave flesh unto God; and we who now dwell in thy divine temple honor thee with her, and we pray: Make us also temples of the Holy Spirit."
        },

        3: {
          irmos: "By Thy compassion show forth my barren mind to be fruitful, O God, Thou Husbandman of good things and Planter of blessings.",
          troparia: [
            "I have weighed my soul down with the slumber of slothfulness. But rouse me, O Christ unto the wakefulness of repentance, that I may do Thy commandments.",
            "I have defiled my hands and eyes, having done those things which I ought not to have done, O Lord; and I have turned Thy compassions to wrath, squandering Thy long-suffering. But look down, O Good One, and have pity on me.",
            "Heal the stripes of my soul, O Forerunner of the Lord, and with thy divine mediation illumine my mind, which hath been obscured by indifference; and deliver me from every machination of the adversary, I pray.",
            "Born in accordance with the providence of God, O all-wise prophet, thou didst free thy mother from barrenness; wherefore, by thy mediation make my barren heart now fruitful, O Forerunner of the Lord, that it may put forth the virtues as shoots.",
            "In thy love pray that those who with faith serve thy temple may receive the heavenly life of Him Who createth the divine abode; and by thy mediation, O Baptist and Forerunner, make them temples of the divine Spirit."
          ],
          theotokion: "Carried in the womb of thy mother, O Forerunner, thou didst rejoice and pay homage to the Lord, Who was borne in the womb of her who is full of grace. Him do thou entreat, that He deliver me from all tribulation."
        },

        4: {
          irmos: "Foreseeing thy nativity from the Virgin, the prophet lifted his voice in proclamation, crying: I heard report of Thee, and I was afraid, O Christ, for Thou hast come from Thæman, from the holy mountain which is overshadowed!",
          troparia: [
            "Seeing me everywhere robbed and reduced to penury, the enemy, the crafty deceiver, rejoiceth, O Word. But deliver me from his malefactions, O Lord of glory, O Enricher of the poor.",
            "With thy right hand, thou didst bow the head of Him Who bowed down the heavens and conversed with men, O thou who art most rich. Preserve me also thereby, maintaining my heart in humility.",
            "The trackless desert had thee dwelling within it, O blessed Forerunner; wherefore, I cry unto thee: Keep safe my soul, which is devoid of any divine activity.",
            "Observing the law of God, thou wast iniquitously slain; wherefore, I pray to thee: Set me aright, who ever commit iniquity and am led astray by the deceptions of the demons.",
            "Having made thyself a temple for the King and Master, O Forerunner, thou hast now passed over to the divine habitations. Pray thou that those who have raised up a divine house unto thee may receive it."
          ],
          theotokion: "Look down upon me who am ailing, O most immaculate one, and free me from my grievous and nigh incurable passions, that I may magnify thee who hast magnified all humanity."
        },

        5: {
          irmos: "Dispelling the darkness of my soul, O my Savior, with the light of the commandments illumine me, in that Thou alone art the King of peace.",
          troparia: [
            "Mindlessly do I heap sins upon sins, and there is no uplifting in my death. Woe is me! How shall I appear before Christ?",
            "Misfortune hath smitten me like a ship, and I have cast overboard the freight Thou gavest me, O Compassionate One; and, now impoverished, I cry: Disdain me not, O Christ!",
            "O Forerunner, who baptized Christ, the Stream of incorruption, in the torrents of the Jordan: Beseech Him to dry up the effluvia of my passions, that I may inherit torrents of sweetness and the beautiful joy of the righteous.",
            "Already I lament, and am constrained by fear, and am ever stuck fast in perplexity, thinking upon the things I have done and the terrible judgment which is to come. O compassionate Lord, have pity on me, through the entreaties of Thy Forerunner.",
            "O Forerunner, who didst tell the people that the law of salvation lieth in repentance for their transgressions, thou didst stand before the law and grace; wherefore, we entreat thee: Enlighten us with examples of repentance.",
            "Time to repent do Thou grant unto me who have wasted all the time I have despondently passed through, O Benefactor and Word, for Thou hast John, the great Forerunner and universal preacher of repentance, entreating Thee for this."
          ],
          theotokion: "I have been done to death by the assaults and pursuit of the deceiver, O most immaculate Mistress. Enliven me, O Theotokos who gavest birth to the hypostatic Life of all, that with piety I may hymn thee, the most immaculate one."
        },

        6: {
          irmos: "Stuck fast am I in the abyss of sin, O Savior, and tempest-tossed on the deep of life; yet lead me up from the passions and save me, as Thou didst Jonah from the sea monster.",
          troparia: [
            "Like the Canaanite woman of old do I cry unto Thee: O Son of God, have mercy and pity on me! For my soul suffereth in its grievous deeds, and doth not itself desire to come to its senses.",
            "The tempest of countless passions vexeth me. As once Thou didst rebuke the sea and save Thy holy disciples, O Jesus Christ, so raise me up and save me.",
            "O voice who proclaimed the Word, accepting the cries of us all, ask that He grant forgiveness of sins unto those who hymn Him with faith.",
            "Heal the broken state of my soul, loose the burden of my sins, and by thy supplications save me who am beyond hope, O blessed Forerunner.",
            "Entreat Jesus, Whom thou didst baptize with thy hand, O most glorious Forerunner, that from the hand of sin He deliver me who ever lift up my hands unto Him."
          ],
          theotokion: "I am stuck fast in the slumber of slothfulness, and the sleep of sin weigheth heavily upon my heart. But by thy vigilant mediation raise me up, O all-pure one, and save me."
        },

        7: {
          irmos: "Emulating the cherubim, the youths danced in the midst of the furnace, crying: Blessed art Thou, O God, for in truth and judgment Thou hast brought all these things upon us because of our sins! All-hymned and all-glorious art Thou for all ages!",
          troparia: [
            "I have rejected Thy laws and made myself subject to irrational lusts, doing unseemly things, O Christ, for I have become vain in my mindlessness more than any other men on earth. But in Thy loving-kindness leave me not to perish, O Savior.",
            "Behold, I have been conceived in iniquities, O Lord: like David I cry out, like the harlot I weep, and like an offensive servant I have offended Thee, the only good God. But in Thy loving-kindness leave me not to perish, O Savior.",
            "Having hewn down the wounds of my passion-plagued heart with thine axe of repentance, O Forerunner, plant in their stead divine dispassion and the most pure fear of God, which remove me from all evil.",
            "As thou didst baptize in the streams of the Jordan the Lord Who covereth His chambers with the waters, beseech Him ever to give the water of divine compunction to mine eyes, O glorious Forerunner.",
            "Having preached the Lamb of God, Who taketh away the sin of the world, O glorious Forerunner, beseech Him to deliver me from the lot of the goats, and to number me among the lambs at His right hand."
          ],
          theotokion: "A barren womb bore thee, O Virgin, who didst bear in thy womb the Word incarnate, Whom the great Forerunner, rejoicing, acknowledged with godly leaps as the most holy and seedless Fruit, bowing down before Him."
        },

        8: {
          irmos: "Hymn and bless Him Who, on Mount Sinai of old, prefigured the miracle of the Virgin in the bush for Moses, and exalt Him supremely for all ages!",
          troparia: [
            "That Thou mightest deify us, in Thy mercy Thou becamest incarnate. This have I not understood, in thrall as I am to pleasures. But in Thy goodness convert me, O Christ, Thou salvation of all.",
            "O Word, good Shepherd, turn Thou and save my wretched soul, which hath become lost in the mountains of transgression, and let not the deceiving foe slay me utterly.",
            "Extend thy right hand unto me who lie on the ground, O Forerunner who, extending thy right hand, didst wash the Undefiled One in the waters. Deliver me from bodily corruption, cleansing me wholly with repentance; and save me.",
            "As thou hast time to repent, O my soul, shake off the heavy sleep of slothfulness, and hasten to keep watch, crying out to thy Master: Have pity on me, O Thou Who art full of loving-kindness, through the entreaties of him who baptized Thee.",
            "The torrents of the passions and the waters of evil have entered in unto my soul, O blessed Forerunner. Haste thou quickly to rescue me, O thou who in the river's streams did wash the most tranquil Deep of dispassion."
          ],
          theotokion: null
        },

        9: {
          irmos: "Who among mortals hath ever heard or seen such a thing as a virgin being found to have conceived in her womb and given birth to a babe without pain? Such a miracle was thine, O pure Theotokos, and we magnify thee.",
          troparia: [
            "O how awesome is the tribunal at which I shall await judgment, O Christ; yet I in nowise feel terror thereof, spending all my time in idleness. But convert me, O only Creator, Who converted the sinful Manasseh.",
            "Stanch the torrents of my boundless evils, I cry unto Thee, O Christ, granting me outpourings of tears which wash away the defilement in which I wallowed in mine insanity; and in Thy mercy save me, O Thou Who didst save the harlot who repented with all her soul.",
            "Deliver me from the mire of sin, O only sinless and greatly merciful Lord, through the entreaties of the Baptist who to the whole world proclaimed Thee the Lamb of God Who taketh away the sins of men.",
            "Having thee as a fragrant rose, as a right redolent cypress-tree, as a never-fading lily, as precious myrrh, O Forerunner of the Lord, running to thy protection I am delivered from the stench of my deeds by thy supplications.",
            "O most blessed one, make me ever fruitful in the virtues who am become barren through my fruitless deeds, making me a child of the Lord, a dweller with the council of the saints.",
            "From heaven grant remission of evils, correction of life and deliverance from transgressions unto us who love thee, who honor thee with love and join chorus in thy divine temple, O Forerunner of the Lord."
          ],
          theotokion: "Thou didst pay homage unto Him Who was borne in the womb of the Mother of God and holdeth all things in His hand, O prophet. With her pray that my lowly soul may be saved, for every day it falleth into many offenses."
        }
      }
    },

3: {
      metadata: {
        day:             "Wednesday",
        theme:           "The Precious and Life-creating Cross and the Theotokos",
        canons:          ["Canon to the precious and life-creating Cross of the Lord", "Canon of the all-holy Theotokos"],
        flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross then Canon of the Theotokos per ode, in source order (Martyrica excluded); theotokion: final theotokion of the ode sequence",
        ode2Present:     false,
        source:          "Lambertsen, The Octoechos Vol. I (Tones I & II), St. John of Kronstadt Press, 1999",
        pages:           "115–120",
        verified:        true
      },
      odes: {
        1: {
          irmos: "Overwhelming power once laid low the whole army of Pharaoh in the deep, and the incarnate Word hath destroyed pernicious sin. All-glorious is the Lord, for gloriously hath He been glorified.",
          troparia: [
            "Of old, through the tree death befell the first-created man, when he broke the first commandment; but the Immortal One, Who was lifted up upon the Tree and tasted death, hath given immortality to all men.",
            "When the Cross was planted in the earth the arrogance of the enemy fell and was thus destroyed; and man, who before was cast out, entereth again into paradise. Glory to Thee, our only God, Whose good pleasure this was!",
            "Come, all ye faithful, and together let us chant unto the Theotokos; for she gave birth to Christ in manner past all human understanding, and unceasingly prayeth that He save us all.",
            "He Who is the image of the Hypostasis of the Father took on matter from thee, O Theotokos, and hath glorified our corrupted form and restored it.",
            "As one higher in honor than the cherubim, thou transcendest the circles of heaven; for in manner past understanding thou didst contain God in thy womb without suffering.",
            "Thou gavest birth unto the Lord and Benefactor, the deliverance from our sins, changing the mortality of our forefather Adam; and thou hast lifted our nature up to the heavens."
          ],
          theotokion: "Thou gavest birth unto the Lord and Benefactor, the deliverance from our sins, changing the mortality of our forefather Adam; and thou hast lifted our nature up to the heavens."
        },
        3: {
          irmos: "The desert, the barren Church of the nations, blossomed like a lily at Thine advent, O Lord; and therein hath my heart been established.",
          troparia: [
            "When Thou wast crucified, Thou didst shake all creation, O Lord, but didst make steadfast the faithful, who hymn Thy power and Thine ineffable condescension, O Word.",
            "By Thy Cross Thou didst open paradise, O Master, and didst lead therein the thief who acknowledged Thy kingship and the richness of Thy divine loving-kindness.",
            "O Virgin, we all truly call thee the golden censer, the jar of manna, the mountain of God and the divine and beauteous palace.",
            "In that thou art the temple and sacred dwelling-place of the Word, O all-pure and Ever-virgin Theotokos, be thou for me the cleansing of offenses.",
            "Neither the tongue of mortals nor the mind of the incorporeal beings is able to describe thy birthgiving, O Theotokos, for thou gavest birth to the Creator in manner transcending nature and comprehension.",
            "O Virgin Theotokos, be thou the confirmation and refuge of those who have recourse unto thee with faith and declare thee to be the Mother of God."
          ],
          theotokion: "O Virgin Theotokos, be thou the confirmation and refuge of those who have recourse unto thee with faith and declare thee to be the Mother of God."
        },
        4: {
          irmos: "Thou didst come forth from the Virgin, neither a mediator nor an angel, but Thyself incarnate, O Lord, and hast saved me, the whole man; wherefore, I cry to thee: Glory to Thy power, O Lord!",
          troparia: [
            "When Thou wast uplifted upon the Tree Thou didst abolish the rule of the cruel prince of this world, and didst annul the curse. Wherefore, saved by Thee, O only Lord, we glorify Thee.",
            "Beholding Thee stretched out upon the Tree, the sun hid its light, the mountains and rocks split asunder, and the veil of the temple was rent in twain, O Almighty One.",
            "O Theotokos, we, the faithful, have come to know the Son Who was born, incarnate, of thee without seed: true God and man by nature. Wherefore, we glorify thee.",
            "Ever fleeing with faith beneath thy protection and help, O all-pure Virgin, because of thee we are delivered from every grievous circumstance.",
            "Deliver us from temptations, from the tempest of thoughts, from all wrath and every sin, from famine and plague, and from everlasting torment, O all-pure Virgin.",
            "As thou art our intercessor, salvation and the hope of Christians, O Mistress, save those who ever hymn thee with faith and love, O most hymned Virgin."
          ],
          theotokion: "As thou art our intercessor, salvation and the hope of Christians, O Mistress, save those who ever hymn thee with faith and love, O most hymned Virgin."
        },
        5: {
          irmos: "Thou art a Mediator between God and man, O Christ God; for by Thee, O Master, are we led up out of the night of ignorance to Thy Father, the Source of light.",
          troparia: [
            "Nailed to the Cross, Thou didst shake the foundations of the earth; and pierced by the spear, Thou didst slay the serpent, the author of evil, and didst pour forth streams of salvation upon all, O Christ.",
            "Thou couldst not bear to see lost that which Thou didst create with Thine own hands; and, slain, Thou didst stretch out Thy hands upon the Tree, O Word; and by the Tree Thou didst bring life unto him who died of old.",
            "O Theotokos, we, the faithful, have come to know the Son Who was born, incarnate, of thee without seed: true God and man by nature. Wherefore, we glorify thee.",
            "Ever fleeing with faith beneath thy protection and help, O all-pure Virgin, because of thee we are delivered from every grievous circumstance.",
            "Deliver us from temptations, from the tempest of thoughts, from all wrath and every sin, from famine and plague, and from everlasting torment, O all-pure Virgin.",
            "As thou art our intercessor, salvation and the hope of Christians, O Mistress, save those who ever hymn thee with faith and love, O most hymned Virgin."
          ],
          theotokion: "As thou art our intercessor, salvation and the hope of Christians, O Mistress, save those who ever hymn thee with faith and love, O most hymned Virgin."
        },
        6: {
          irmos: "From the belly of the sea monster, Jonah cried out: Lead me up from the abyss of hell, I pray, that with a spirit of truth and in a voice of praise I may sacrifice to Thee, as to my Deliverer!",
          troparia: [
            "Jacob once laid his hands upon the heads of his grandsons, prefiguring the Cross on which Thou, O Word, didst stretch out Thy hands; and Thou didst deliver mankind from the hand of the lying adversary, O Christ.",
            "When Thou wast crucified of Thine own will, O Christ our King, reigning sin was overthrown; and Adam, who once, of old, was driven out of paradise, was brought to dwell therein again, hymning Thee.",
            "He Who of His own will created all things deigned to make His abode within the womb of her who knew not wedlock; and, in that He is full of loving-kindness, He enriched with incorruption those sick with corruption.",
            "O all-immaculate One, who art more exalted and holy than the hosts on high, in supernatural manner thou didst contain in thy womb the uncontainable Word.",
            "O Mistress, unto the ways of repentance guide me who have strayed from the path of life and often wander lost amid the trackless wilderness of sin.",
            "Disdain not our entreaties of us, thy servants, who set our hope on thee, O pure one; for thou art the refuge and cleansing of men's souls, O Mistress."
          ],
          theotokion: "Disdain not our entreaties of us, thy servants, who set our hope on thee, O pure one; for thou art the refuge and cleansing of men's souls, O Mistress."
        },
        7: {
          irmos: "The command of the iniquitous tyrant, opposed to God, raised up a lofty flame; but Christ, Who is blessed and all-glorious, spread a spiritual dew upon the pious youths.",
          troparia: [
            "The sword which before was unsheathed is now withdrawn for me since Thou, O compassionate Lord, wast lifted up upon the Cross and pierced with a spear; wherefore, finding dispassion through thy precious suffering, I magnify thee.",
            "The serpent which was lifted up by Moses on a tree prefigured the divine lifting up of Christ, Who slew the lying serpent and hath given life unto all, who became dead through disobedience.",
            "As thou art my strength and song, my salvation, firm help and invincible bulwark, O Mistress, vanquish the demons which war against me, ever seeking to slay me.",
            "Giving flesh to God of thy virginal blood, O Virgin, thou hast deified mankind; wherefore, I pray thee: by thy supplications deliver me, who have been defiled by the passions and corrupted by the wiles of the enemy.",
            "The furnace prefigured thy birthgiving, O most immaculate one, for it did not consume the children, just as the unbearable Fire did not consume thy womb. Wherefore, we entreat thee: Deliver thy servants from eternal fire.",
            "Remaining a virgin, thou alone didst show forth an all-pure conception and an incorrupt birthgiving, for thou didst conceive Christ, Who is God over all and became man, O pure one, for the salvation and deliverance of the faithful."
          ],
          theotokion: "Remaining a virgin, thou alone didst show forth an all-pure conception and an incorrupt birthgiving, for thou didst conceive Christ, Who is God over all and became man, O pure one, for the salvation and deliverance of the faithful."
        },
        8: {
          irmos: "Once, in Babylon, the fiery furnace divided its activity at the command of God, consuming the Chaldæans, but bedewing the faithful, who chant: Bless the Lord, all ye works of the Lord!",
          troparia: [
            "By the blood which flowed from Thine incorrupt side hath creation been sanctified, O Long-suffering One, the rivers of polytheism were dried up, and showers of piety have brought an end to the drought of deceptions.",
            "The sun was appalled by Thy crucifixion and hid its rays; the rocks split asunder, and hades, below, was terrified; and the souls of the righteous leapt up, trusting in their ultimate deliverance, O Word.",
            "O unblemished Ewe-lamb, who gavest birth unto the Lamb of God, the living and abundant salvation of us mortals: Spurn me not who cry: Bless the Lord, all ye works of the Lord!",
            "O all-pure one, thy divine Offspring hath restored us and shown us all to be sons of the day and light; and, saved, we cry out: Bless the Lord, all ye works of the Lord!",
            "O pure one, from thy virgin womb thou gavest birth to the living Water, and hast poured forth remission upon the faithful from thy well-spring of healings; wherefore, we all cry out: Bless the Lord, all ye works of the Lord!",
            "Thou gavest rise to the ripe Grapes of life, O pure one; for thou art the vine which sweeteneth the earth with good things, and hymning thee, we cry: Bless the Lord, all ye works of the Lord!"
          ],
          theotokion: null
        },
        9: {
          irmos: "God the Lord, the Son of the unoriginate Father, hath revealed Himself to us incarnate of the Virgin, to enlighten those in darkness and to gather the dispersed. Wherefore, we magnify the all-hymned Theotokos.",
          troparia: [
            "By Thy wounds mend my broken and contrite state, O unfathomable Word, and by Thy suffering, O Lord God of my salvation, cleanse mine image, which hath been buried under wicked passions.",
            "In Thy goodness Thou wast seen to be uplifted upon the cypress, the pine and the cedar, that Thou mightest save mankind, O Master, Who art One of the Holy Trinity, possessed of a single Hypostasis in two natures.",
            "O pure one, who for us gavest birth to the hypostatic Life Who manifestly destroyed death by His death, slay thou the passions of my soul, and grant me a fountain of tears, that I may ever glorify thee.",
            "Hope unashamed, certain trust, an unassailable rampart, protection and helper, O most immaculate one, be thou unto me who set my hope on thee; and guide me to the light of repentance and compunction, O pure one.",
            "That thy servant may be delivered from all the evil of the demons, from grief and damnation, and from everlasting fire, entreat thy Son, that I may ever glorify thee with faith.",
            "Thou alone hast been shown to be the one whose conception was all-pure and whose birthgiving was incorrupt, so that thou didst remain a virgin; for thou didst conceive Christ, the God of all, O pure one, for the salvation and deliverance of the faithful."
          ],
          theotokion: "Thou alone hast been shown to be the one whose conception was all-pure and whose birthgiving was incorrupt, so that thou didst remain a virgin; for thou didst conceive Christ, the God of all, O pure one, for the salvation and deliverance of the faithful."
        }
      }
    },
4: {
      metadata: {
        day:             "Thursday",
        theme:           "The Holy Apostles and St. Nicholas the Wonderworker",
        canons:          ["Canon of the holy apostles", "Canon of St. Nicholas the great wonderworker"],
        flatteningOrder: "Canon of the Apostles irmos governs; troparia: Canon of the Apostles then Canon of St. Nicholas per ode, in source order (Martyrica excluded); theotokion: final theotokion of the ode sequence",
        ode2Present:     false,
        source:          "Lambertsen, The Octoechos Vol. I (Tones I & II), St. John of Kronstadt Press, 1999",
        pages:           "124–129",
        verified:        true
      },
      odes: {
        1: {
          irmos: "Overwhelming power once laid low the whole army of Pharaoh in the deep, and the incarnate Word hath destroyed pernicious sin. All-glorious is the Lord, for gloriously hath He been glorified.",
          troparia: [
            "O radiant apostles of the Savior, who through faith became the lightning-bolts of the divine Light, enlighten me, who have wholly become darkened by the blackness of pleasures and have passed all my life in slothfulness.",
            "O disciples and friends of Christ, deliver me who, because of mine affinity for evils, am become a friend of the enemy, and impel my soul toward the love of Him Who, in His goodness, hath loved the human race.",
            "O my lowly soul, before my death haste thou to repent, and weep for thyself, who hast been given to death, that He Who in His loving-kindness raised up Lazarus who was four days dead might raise thee up also, at the entreaties of the apostles.",
            "Ever standing before the divine throne of grace, O Nicholas, pray that grace and mercy be given to thy servants, who call upon thee with faith.",
            "O father Nicholas, primate of the people of Myra, with thy good works thou didst perfume the assemblies of the faithful. Deliver me from fœtid transgression.",
            "Having acquired a heart more brilliant than the sun, O father Nicholas, wholly enlighten me, dispelling the darkness of temptations and tribulations."
          ],
          theotokion: "O most immaculate one, thou art my might, joy and gladness, a steadfast bulwark and intercessor, delivering me from temptations and misfortunes."
        },
        3: {
          irmos: "The desert, the barren Church of the nations, blossomed like a lily at Thine advent, O Lord; and therein hath my heart been established.",
          troparia: [
            "Having acquired the Wisdom of God as your Teacher through the Spirit, O saints, ye rendered foolish the wisdom of the pagans, O right wondrous beholders of God.",
            "Loose ye the barrenness of my soul, O most lauded ones, and cause it to produce fruitful acts in the virtues, in that ye are right blessed eye-witnesses of the Word.",
            "At the entreaties of Thine apostles, O greatly merciful Benefactor of all, heal me, who have now been grievously wounded by the venomous sting of the enemy.",
            "As thou art a well-spring of healings, O holy one, cure the passions of my soul and preserve my life, keeping me, thy servant, free from harm.",
            "Granting my mind recovery from defeat, O great Nicholas, as mine intercessor save me from the harm wrought by the enemy, visible and invisible, who wage war on me.",
            "He Who alone is good hath given thee to men as a good helper; wherefore, I beseech thee: Free me from all evils!"
          ],
          theotokion: "O most immaculate one, thou art my might, joy and gladness, a steadfast bulwark and intercessor, delivering me from temptations and misfortunes."
        },
        4: {
          irmos: "Foreseeing thy nativity from the Virgin, the prophet lifted his voice in proclamation, crying: I heard report of Thee, and I was afraid, O Christ, for Thou hast come from Thæman, from the holy mountain which is overshadowed!",
          troparia: [
            "O Thou Who alone lovest mankind, at the divine entreaties of the apostles who preached Thee throughout the world, nourish with the food of salvation me who am ever starving and famished by hunger.",
            "Into the sea of the world Thou didst ride all Thy glorious apostles like steeds, O Thou Who lovest mankind, and they roil its salty waters of bitter unbelief.",
            "O all-praised apostles, who announced Christ the Sun to those in darkness, enlighten me who lie in the darkness of sin, and restrain the wicked thoughts of my heart.",
            "Adorning thy cathedra with the virtues, O Nicholas, thou wast shown to be the precious ornament of hierarchs; wherefore, I entreat thee: Make beautiful the ugliness of my soul, and save me from the temptations of the world.",
            "Smooth thou the way which leadeth to heaven, O all-blessed one; let me ride lightly upon the waves of life; and steer me into the harbor of life, for I have been made rich by thee, the great intercessor, O Nicholas.",
            "O great Nicholas, who hearest words divine, hearkening unto my words deliver me from the temptations of the enemy, from iniquitous men, and from the evil circumstances which beset me."
          ],
          theotokion: "O holy Mistress Theotokos, sanctify me night and day, and preserve and guide me to salvation, for I have fallen into many sins and am brought low by the assaults of the demons."
        },
        5: {
          irmos: "Thou art a Mediator between God and man, O Christ God; for by Thee, O Master, are we led up out of the night of ignorance to Thy Father, the Source of light.",
          troparia: [
            "The great Shepherd sent you forth, His godly apostles, like sheep among wolves, transforming them by the divine grace of baptism and the goodness of your words.",
            "With divine light ye illumined the hearts of those who languished in the darkness of deception, O apostles; wherefore, I beseech you: Enlighten me who have been benighted by dark pleasures, O divinely blessed ones.",
            "O my wretched soul, before the end make haste and repent, crying out to the Lord: I have sinned against Thee, O Master! For the sake of the apostles forgive and save me, in that Thou art full of loving-kindness.",
            "O fulfiller of the law of God, entreat the good God, that I may observe the laws of God; and rescue me from the iniquitous foe and the harm wrought by the demons, O most blessed Nicholas.",
            "As of old thou didst stand forth, delivering the three youths, O holy one, so now by thy supplications deliver me from every sin, O divinely wise Nicholas.",
            "O great wonderworker, sacred minister of Christ, surety of sinners: Entreat God, the Bestower of good, that He not put me to shame at the hour of judgment."
          ],
          theotokion: "O pure one who gavest birth to the Lord, in that thou art good stand forth and deliver me who am beset by many passions, that, saved, I may hymn thee with soul, heart and tongue."
        },
        6: {
          irmos: "Whirled about in the abyss of sin, I call upon the unfathomable abyss of Thy loving-kindness: Lead me up from corruption, O God!",
          troparia: [
            "In that ye bear the Water of life, O disciples of the Savior, give drink to my soul, which withereth away under the burning heat of sin, I pray.",
            "As noetic heavens, O divinely radiant apostles, ye declared the ineffable glory of God. Pray ye that all of us may also receive it.",
            "Tempest-tossed on the cruel deep, I come to Thee Who art the Helmsman of all, O Christ. For the sake of Thine apostles pilot me to the harbor of salvation.",
            "O Nicholas, primate of the people of Myra, with thy good works thou didst perfume the assemblies of the faithful. O wise one who receivest the grace of healings, by thy supplications loose the bonds of mine evils, and bind me to the divine love of the Master Who desired to become man.",
            "Visit me day and night with thy divine presence, smoothing the way for my lowly soul, O holy Nicholas; and preserve me unwounded by the temptations of the evil one, which assail me.",
            "Grant me a hand to stretch forth for the help of God, and preserve me from the cruel expectation of the enemy, O Nicholas who once didst deliver the youths from bitter death, that I may honor thee as my good intercessor."
          ],
          theotokion: "Ineffably giving birth without tasting of wedlock, thou wast not consumed by the fire of the Godhead, O Virgin; wherefore, O pure one, pray with the apostles that He free me, who glorify thee, from the everlasting flame."
        },
        7: {
          irmos: "The command of the iniquitous tyrant, opposed to God, raised up a lofty flame; but Christ, Who is blessed and all-glorious, spread a spiritual dew upon the pious youths.",
          troparia: [
            "Having first been ignited by the fire of the divine Spirit, O apostles, ye quenched the burning coals of deception and enkindled the love of God in the minds of all the faithful; wherefore, we honor you aloud.",
            "Ye hated the world and those in the world, and ye loved Christ, Who in the world united Himself to the flesh of men. Him do ye beseech, O divine apostles, that He free me from all evils in this life.",
            "O righteous Judge Who knowest the hearts of men, Who alone knowest my secret offenses: At the hour of judgment condemn me not, neither send me into the fire, through the supplications of Thine apostles.",
            "Having first been ignited by the fire of the divine Spirit, O apostles, ye quenched the burning coals of deception and enkindled the love of God in the minds of all the faithful; wherefore, we honor you aloud.",
            "Every day I experience the fire of temptations, O father Nicholas; I pass among snares like a bird, and hasten under thy compassionate protection. Preserve me untouched by harm, entreating the good God and Lord.",
            "Swiftly hearkening to my words, O father Nicholas, haste thou to come to the aid of me who am bestormed by the tribulations and necessities of life and the affliction of the demons, that, saved, I may hymn thine intercession.",
            "O father Nicholas, who of old appeared in a dream to the emperor, delivering the innocent who were set to be executed, ever deliver me from the assaults which beset me, from sickness of body and pain of soul."
          ],
          theotokion: "Thee alone do I have as a helper, O all-pure one; thee do I declare to be the preserver of the life of all. Disdain me not, thy servant, O thou who alone art the intercessor for the world, but save me who chant: Blessed is the God of our fathers!"
        },
        8: {
          irmos: "Once, in Babylon, the fiery furnace divided its activity at the command of God, consuming the Chaldæans, but bedewing the faithful, who chant: Bless the Lord, all ye works of the Lord!",
          troparia: [
            "The all-holy Spirit, in material form descending on you in the guise of fire, made you torches burning up ungodliness and enlightening all the pious, O divine apostles of the Word.",
            "O Compassionate One, I pray: Heal Thou my heart, which is bestormed by the passions and is not set aright. And at the entreaties of Thine apostles, enlighten my soul, and direct my mind, which hath inclined unto evil.",
            "Sigh, O my soul, shed tears in earnest, and weep for thyself before the end, lest inconsolable lamentation overtake thee; and cry out to the Lord: Save me, O Merciful One, at the supplications of Thine apostles!",
            "O divinely wise father Nicholas, who received from God the authority to loose and to bind, by thy supplications loose the bonds of mine evils, and bind me to the divine love of the Master Who desired to become man.",
            "Visit me day and night with thy divine presence, smoothing the way for my lowly soul, O holy Nicholas; and preserve me unwounded by the temptations of the evil one, which assail me.",
            "When Thou shalt sit on Thy dread throne to judge the world, O God, enter not into judgment with Thy servant, but, through the supplications of Nicholas, vouchsafe unto me the portion of the saved."
          ],
          theotokion: null
        },
        9: {
          irmos: "God the Lord, the Son of the unoriginate Father, hath revealed Himself to us incarnate of the Virgin, to enlighten those in darkness and to gather the dispersed. Wherefore, we magnify the all-hymned Theotokos.",
          troparia: [
            "O glorious apostles, blessed disciples of the Savior, most wise preachers: Deliver me from all harm, from all wrath, from all sin, from every evil circumstance, and from divers perils.",
            "At the prayers of Thine apostles, O Lord, return me who am condemned, who am incorrigible, who have ignored Thy precepts and, sick of mind, have followed the beguilements of the demons.",
            "I possess a soul which is incorrigible, a conscience buried under transgressions, a heart defiled and a mind bemired, O Thou Who lovest mankind, yet I cry unto Thee: For the sake of the apostles have pity on me in Thy mercy!",
            "I know thee to be a standard for the priesthood and model of meekness, O wise Nicholas. By thy supplications still thou the storm of passions and misfortunes which assaileth me all the days of my life, and keep me unharmed, O most sacred father.",
            "As a most sacred vessel deemed worthy of the divine Myrrh which is mercifully poured forth upon the earth, perfume the hearts of us all, O wise one who wast the chief hierarch of the people of Myra, dispelling the stench of temptation by thy supplications.",
            "Bring peace to my soul, which is sorely vexed by the invisible horde; and allay for me the countless temptations which the deceiver hurleth at me day and night, showing thyself to be my good intercessor, O Nicholas."
          ],
          theotokion: "Have pity, have pity on me, O Lord, when Thou shalt come to render judgment, and condemn me not to the fire, neither rebuke me in Thine anger; for the Virgin who gave Thee birth, the multitude of the apostles, and the glorious Nicholas entreat Thee, O Christ."
        }
      }
    },
5: {
      metadata: {
        day:             "Friday",
        theme:           "The Precious and Life-creating Cross and the Theotokos",
        canons:          ["Canon of the precious and life-creating Cross of the Lord", "Canon of the all-holy Theotokos"],
        flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross then Canon of the Theotokos per ode, in source order (Martyrica excluded); theotokion: final theotokion of the ode sequence",
        ode2Present:     false,
        source:          "Lambertsen, The Octoechos Vol. I (Tones I & II), St. John of Kronstadt Press, 1999",
        pages:           "133–138",
        verified:        true
      },
      odes: {
        1: {
          irmos: "Traversing the impassable, uncommon path of the sea dryshod, Israel the chosen cried aloud: Let us chant unto the Lord, for He hath been glorified!",
          troparia: [
            "Thou didst accept crucifixion, being ignominiously pierced with nails, O Word, desiring to honor all men who glorify Thy voluntary sufferings.",
            "Thou didst stretch out Thy hands upon the Cross, O Savior Who stretched out the sky like a skin, and thereby didst embrace the nations and men who glorify Thy voluntary sufferings.",
            "O Maiden, who gavest birth to the Source of dispassion, heal me who am wounded by the passions, and rescue me from the everlasting fire, O thou who alone art full of divine joy.",
            "Deliver me from bodily illness, and cure the unseemly passions of my soul, and rescue me from the everlasting fire, O thou who alone art full of the grace of God.",
            "Thou gavest birth unto the Lord and Benefactor, the deliverance from our sins, changing the mortality of our forefather Adam; and thou hast lifted our nature up to the heavens."
          ],
          theotokion: "Thou gavest birth unto the Lord and Benefactor, the deliverance from our sins, changing the mortality of our forefather Adam; and thou hast lifted our nature up to the heavens."
        },
        3: {
          irmos: "Establishing me upon the rock of faith, Thou hast enlarged my mouth against mine enemies, for my spirit doth exult when I chant: There is none holy as our God, and none righteous save Thee, O Lord!",
          troparia: [
            "Hanging upon the Tree, the incorrupt Grapes—Jesus, the Deliverer of our souls—exuded the divine sweetness which gladdeneth the hearts of men and which by grace taketh away the drunkenness of evil.",
            "Of Thine own will Thou wast raised up upon the Tree, O Jesus, and didst foil all the malefactions of the devil; and Thou didst raise up men who had fallen into destruction through their depraved minds, O greatly Merciful One.",
            "Unto the King, Who is without beginning and Who had received flesh from thee, O Virgin Mother, thou gavest birth. Entreat Him as the One Who loveth mankind, that He save thy servant from all tribulation and the damnation which is to come.",
            "Resolve the perplexity of my heart, heal my wounds and rid me of festering corruption by thy divine power; and grant me a stream of compunction, O thou who gavest birth to the Source of everlasting life.",
            "O Theotokos, heal my soul, which hath become sick through despondency and the assaults of the demons; grant tears of repentance to my heart, and cleanse me, guiding me to the light of repentance and rescuing me from the fire which is to come."
          ],
          theotokion: "O Theotokos, heal my soul, which hath become sick through despondency and the assaults of the demons; grant tears of repentance to my heart, and cleanse me, guiding me to the light of repentance and rescuing me from the fire which is to come."
        },
        4: {
          irmos: "I hymn Thee, O Lord, for I heard report of Thee, and I was afraid; for Thou comest to me, seeking me who am lost. Wherefore, I glorify Thy great condescension toward me, O greatly Merciful One.",
          troparia: [
            "Thou wast suspended upon the Tree, O Almighty, Who suspended the earth upon the waters; and, pierced in the side by a spear, Thou didst pour forth blood and water for the salvation of all.",
            "When Thy side was pierced, it healed my sickness; when thou wast smitten on the cheek by the hand of man, I received freedom; and by Thy tasting of gall, O Christ, we have been delivered from the sweet taste of the fruit in Eden.",
            "I truly hymn thee, O most hymned one, who supernaturally gavest birth to the all-hymned Word of God; and I pray: Heal the pangs of my lowly soul, and deliver me from grievous condemnation.",
            "Rain down upon us the riches of thy mercy, as is thy wont, O Virgin, ending our infirmities and loosing the divers passions of our souls; and free my heart from the bonds of sin and from many pangs.",
            "I have defiled my soul with the passions; but do thou, who becamest the most pure dwelling-place of the All-pure One, O Theotokos, cleanse me, guiding me to the light of repentance and rescuing me from the fire which is to come."
          ],
          theotokion: "I have defiled my soul with the passions; but do thou, who becamest the most pure dwelling-place of the All-pure One, O Theotokos, cleanse me, guiding me to the light of repentance and rescuing me from the fire which is to come."
        },
        5: {
          irmos: "The Sun—the live Coal which was revealed beforehand to Isaiah—shone forth from the Virgin's womb, granting the enlightenment of divine knowledge to those gone astray in darkness.",
          troparia: [
            "Having accepted the Cross in Thy loving-kindness, O Master, Thou didst draw me forth from the abyss of evils, and by sitting with the Father Thou didst honor me, who of mine own will have become dishonored.",
            "Crowned with thorns, O Word Who crownest the whole world with flowers, Thou dost hew down the thorns of my passions at the root, and plantest the understanding of Thee within me.",
            "Having wasted my life in slothfulness and defiled my heart with the passions, I come to thee in compunction of soul, O Mistress, and pray: Have pity and save me, making me steadfast by models of repentance.",
            "O most immaculate Mistress Theotokos, who gavest birth to the hypostatic Life of all, enliven me who have been done to death by the assaults and pursuit of the deceiver, that I may piously hymn thee, the most immaculate one.",
            "Enlighten my mind, O all-pure Mistress, I pray thee; and still the waves of my passion-plagued heart, putting down carnal desires and leading me to the divine haven."
          ],
          theotokion: "Enlighten my mind, O all-pure Mistress, I pray thee; and still the waves of my passion-plagued heart, putting down carnal desires and leading me to the divine haven."
        },
        6: {
          irmos: "Hearkening to the sound of the cries of entreaty which issue forth from a soul in pain, O Master, deliver me from my grievous sins, for Thou alone art the Cause of our salvation.",
          troparia: [
            "Having given Thy shoulders over to stripes, Thy cheek to buffeting, and Thy face to spitting, Thou didst save me who have sinned greatly against Thee in knowledge and in ignorance.",
            "Thou wast led like a lamb to the slaughter, O Christ my God, leading back to life those who had been slain by the poisonous bite of the noetic wolf. Glory to Thy crucifixion!",
            "I flee now unto thee, O all-hymned one. Save and preserve me by thy supplications; for whatsoever thou desirest, thou canst do, in that thou art the Mother of Him Who strengtheneth all.",
            "O Virgin Theotokos, save thy servant, who am bestormed by the tempest of griefs and am overwhelmed by the battery of threefold waves.",
            "Vouchsafe thy loving-kindness unto me who am an object of pitilessness and malice; and rescue me from the retribution which lieth before me and from everlasting fire."
          ],
          theotokion: "Vouchsafe thy loving-kindness unto me who am an object of pitilessness and malice; and rescue me from the retribution which lieth before me and from everlasting fire."
        },
        7: {
          irmos: "The command of the iniquitous tyrant, opposed to God, raised up a lofty flame; but Christ, Who is blessed and all-glorious, spread a spiritual dew upon the pious youths.",
          troparia: [
            "When Thou wast uplifted upon the Cross, O Word Who art the resurrection and uplifting of all, Thou didst raise me up who had fallen through disobedience; and Thou didst cast down the adversary who caused me to fall, showing him to be wholly impotent and dead. Glory to Thy dominion!",
            "By Thy nails Thou didst transfix the sins of our forefather; and, beaten with the reed, thou didst sign a writ of manumission for all men. Glory to Thy suffering, whereby we have been delivered from the darkness of the passions!",
            "As thou art my confirmation, O Mistress, vouchsafe that I may behold the beauty of thy glory when my soul shall be sundered from my flesh, that I may thus know remission.",
            "By thy supplications to God deliver thy servants, who have recourse to thee with faith, from perils, misfortunes and sorrows, O holy Mistress.",
            "O my Christ Who art Thyself the Word, Who of old delivered the three youths from the furnace, by the entreaties of Thy Mother who knew not wedlock, bedew me and deliver me from the flame which I have kindled by my boundless evil deeds.",
            "Coming upon my material heart, the corrupter hath slain it; but by thy divine power cause rain to fall upon me, O Mother who knewest not wedlock, and vouchsafe that I may vanquish him, that I may cry out with faith: Blessed art thou who gavest birth to God in the flesh!"
          ],
          theotokion: "Coming upon my material heart, the corrupter hath slain it; but by thy divine power cause rain to fall upon me, O Mother who knewest not wedlock, and vouchsafe that I may vanquish him, that I may cry out with faith: Blessed art thou who gavest birth to God in the flesh!"
        },
        8: {
          irmos: "The thrice-blessed youths, disdaining the golden image and beholding the immutable and living image of God, chanting in the midst of the flame: Let all existing creation hymn the Lord and exalt Him supremely for all ages!",
          troparia: [
            "Disobedient men, who without compunction wrought all manner of iniquities, raised up Thee two malefactors, O Thou Who dost justify sinners, crucifying Thee, O Compassionate One; but all creation glorifieth Thee as Lord and Master, hymning Thy long-suffering.",
            "Nailed to the Tree, Thou didst bloody Thy fingers, O Christ, and Thou didst bring an end to the blood sacrificed of old to the demons unto the damnation of those who offered it up. Wherefore, all creation glorifieth Thee, hymning Thy love for mankind, O God of all.",
            "Be zealous for good works, O my soul, withdrawing from evils with care for godly acts, having the Theotokos praying for thee, the unashamed helper of all, in that she is merciful and loving.",
            "Thou hast broken the bonds of men's ancient condemnation; wherefore, I beseech thee, O Theotokos: Loose all the evil bonds of my heart, binding me with the divine love of the Creator, O all-pure one.",
            "Having given birth to the Effulgence of the Father's glory, O Theotokos, illumine mine heart, which hath become downcast because of the infamy of my transgressions, and show me forth to share in everlasting glory, that I may glorify thee with faith.",
            "Through thee, O Theotokos, hath the true Sun of righteousness been revealed to us, illumining all things with rays of divinity. Him, the Most High incarnate, do we hymn."
          ],
          theotokion: null
        },
        9: {
          irmos: "Every tongue is at a loss how to praise thee as is meet, and even an intelligence from above the world is in doubt how to hymn thee, O Theotokos; yet, as thou art good, accept our faith, for thou knowest our longing inspired by God; for thou art the intercessor of Christians, and we magnify thee.",
          troparia: [
            "Of old, Isaac was bound, that he might provide an image of Thy suffering; and as a symbol of remission [Abraham] freed the lamb who was caught in the thicket, and then truly released the involuntary sacrifice. For when Thou wast sacrificed of Thine own will, we were freed from evils.",
            "Glory to Thy loving-kindness, O only loving Lord Christ, Who art comely in beauty more than the sons of men, yet wast bereft of form and beauty when Thou wast hung upon the tree of the Cross, transforming the ugliness of the whole human race into beauty!",
            "Vouchsafe unto me God's love for man, O Maiden who alone ineffably gavest birth to God Who loveth mankind, Who borrowed flesh from thee, and deliver me from the coming flame and all torment, for I glorify thee with love.",
            "Having acquired thee alone as a sure intercessor, our hope, bulwark and trust, steadfast protection, an unassailable foundation, a harbor unbeset by storms and a refuge of strength, O all-hymned one, we are all saved.",
            "O all-hymned Mother of the Light, drive away the clouds from my soul, and grant that I may gaze in purity upon the saving beauty which shone forth ineffably from thine all-holy womb to enlighten the nations.",
            "O Virgin Maiden Who gavest birth to the divine Light, illumine my heart, which hath been darkened by the many assaults of the passions and the plots of the alien one, and ever let fall upon me the drop which cleanseth me of the defilements of sin, O Virgin."
          ],
          theotokion: "O Virgin Maiden Who gavest birth to the divine Light, illumine my heart, which hath been darkened by the many assaults of the passions and the plots of the alien one, and ever let fall upon me the drop which cleanseth me of the defilements of sin, O Virgin."
        }
      }
    },
    6: {
      metadata: {
        day:             "Saturday",
        theme:           "All Saints and the Departed",
        canons:          ["Canon of the holy martyrs, hierarchs, the venerable and the departed", "Canon of the Departed"],
        flatteningOrder: "Canon of All Saints irmos governs; troparia: Canon of All Saints then Canon of the Departed per ode, in source order (Nekrosima included in source order); theotokion: final theotokion of the ode sequence",
        ode2Present:     false,
        source:          "Lambertsen, The Octoechos Vol. I (Tones I & II), St. John of Kronstadt Press, 1999",
        pages:           "143–149",
        verified:        true
      },
      odes: {
        1: {
          irmos: "Taking up the hymn of Moses, cry aloud, O my soul: My Helper and Protector hath He been for my salvation! He is my God, and I shall glorify Him!",
          troparia: [
            "Cruel banishments and grievous wounds did ye patiently endure, O athletes, and by divine power ye drove all deception from the ends of the earth.",
            "The ministers and holy hierarchs of God, manifestly shining with noetic light, guided the fullness of all the pious to the light of piety.",
            "Humbling the prideful mind, O venerable ones, ye passed over to the good land; and having been exalted by your godly ideals, ye ever help all the lowly.",
            "Nekrosimon: Thy faithful servants whom Thou hast transported from transitory things, O our all-good God, do Thou show forth as sharers in the most radiant light and everlasting gladness, in that Thou art God.",
            "Trampling down death by Thy death, Thou didst pour forth the eternity of life divine, which do Thou bestow upon the souls of the departed, O Good One, at the entreaties of Thy martyrs, granting them remission of transgressions.",
            "O Christ, Who ever pourest forth rich mercy, in that Thou art full of loving-kindness grant a place of ease in Thy dwelling-place, in Thy wondrous tabernacle, unto Thy servants who ever piously accept Thee.",
            "Nekrosimon: Thou wast stronger than death, O Christ; wherefore, binding it, Thou didst deliver us, and hast now, as God, delivered the departed from its prison. Grant that they may share in Thine effulgence."
          ],
          theotokion: "Making my wavering mind steadfast, O Mother of God, strengthen me with the divine precepts of Him Who was born of thy sanctified womb and hath abolished the dark kingdom of hades, O Mistress."
        },
        3: {
          irmos: "By Thy compassion show forth my barren mind to be fruitful, O God, Thou Husbandman of good things and Planter of blessings.",
          troparia: [
            "Aflame with the fire of the love of Christ, O passion-bearers, ye quenched the burning of torments with the dew of the all-accomplishing Spirit.",
            "O most holy hierarchs of Christ, and ye honored assemblies of the venerable, in behalf of us all entreat God Who loveth mankind.",
            "The most sacred choir of the divine prophets was magnified, and the multitude of the women who suffered manfully hath received glory.",
            "Nekrosimon: Dying on the Cross, O Christ, Thou didst grant immortality unto the dead. Grant that they who have departed unto Thee in faith may also receive it.",
            "Aflame with the fire of the love of Christ, O passion-bearers, ye quenched the burning of torments with the dew of the all-accomplishing Spirit.",
            "O most holy hierarchs of Christ, and ye honored assemblies of the venerable, in behalf of us all entreat God Who loveth mankind.",
            "Nekrosimon: Vouchsafe life everlasting, O Master, unto the great multitude of those who worshipped Thee in the Orthodox Faith, and whom Thou hast taken away from this transitory life, reckoning them among the multitude of the saved."
          ],
          theotokion: "With all the prophets and the sacred women do thou now earnestly entreat Him Who was born of thee, O Virgin, that He have pity on us."
        },
        4: {
          irmos: "Foreseeing thy nativity from the Virgin, the prophet lifted his voice in proclamation, crying: I heard report of Thee, and I was afraid, O Christ, for Thou hast come from Thæman, from the holy mountain which is overshadowed!",
          troparia: [
            "The right glorious passion-bearers, who emulated well the sufferings of Christ, rejoiced when they were racked by many tortures, looking forward to their heavenly rewards; and having received them, they are ever called blessed.",
            "Keeping the laws of the Spirit, O ye primates of the Churches, like most excellent pilots ye all-wisely guided the people into the divine harbor; and having turned away from the tumults of life, ye have passed over to the tranquillity of Life.",
            "Ye showed yourselves to be sojourners on the earth, O fathers, turning your life unto heaven with pious mind, and taming the passions of the flesh with the pangs of asceticism by the power of Christ.",
            "The honorable women, desiring a godly death, and truly asking thee to pray for endless life, O all-pure Mistress, have through thee been vouchsafed it; and they pray to thy Son and God in our behalf.",
            "In Thy great love for mankind, and at the entreaties of the chosen martyrs, O Christ, vouchsafe Thy glory, which is past understanding, unto Thy servants, who live by hope, love and an Orthodox understanding.",
            "In that Thou art possessed of an ever-flowing torrent of sweetness, O Lord, ever give drink unto the elect; and in Thine ineffable loving-kindness, O Christ, with them Thou dost feed by the rivers of remission those who have now departed unto Thee.",
            "Nekrosimon: Thou art Lord of the living and hast dominion over the dead, O Master, and by Thy power Thou dost raise up the dust of the earth; wherefore, those who have passed over to Thee, O Savior, do Thou cause to dwell in Thy courts."
          ],
          theotokion: "O all-pure Virgin Theotokos, thou mend the broken state of Eve and annul the ancient curse; for thou gavest birth to the Creator, Who is able to set us aright who have been cast down by transgressions, O Theotokos, only Mother of God."
        },
        5: {
          irmos: "Dispelling the darkness of my soul, O my Savior, with the light of the commandments illumine me, in that Thou alone art the King of peace.",
          troparia: [
            "O holy hierarchs, prophets and ye God-bearing venerable ones, ye enlighten the world with the rays of the Spirit, dispelling the darkness of the passions.",
            "O holy martyrs, taking up the Cross of Christ as an ensign of victory, ye set at nought all the power of the devil; and receiving heavenly crowns, ye are become bulwarks for us, praying to the Lord in our behalf.",
            "Nekrosimon: We beseech Thee, O Word: Enrolling those Thou hast taken from among us in the choir of Thine elect, show them to be sharers in the higher life.",
            "O passion-bearers of the Lord, blessed is the ground which drank your blood, and holy the temples which have received your bodies; for ye rebuked the enemy at your trials, and preached Christ with boldness. Entreat Him, in that He is good, we pray, that our souls may be saved.",
            "In the great love for mankind of the chosen martyrs, O Christ, do Thou vouchsafe Thy glory unto Thy servants who have departed in faith.",
            "O Christ Who alone art free among the dead, and Thou didst shake off the mortality of death. Deliver Thy servants now from the mortality of sin, O Master, showing them to be heirs of Thy kingdom."
          ],
          theotokion: "They who trust in thee find safety beneath thy protection, O Theotokos. Let us not fall away from hope, but save us from misfortunes, O helper of the perplexed, and set at nought the counsels of the adversary. For thou art our salvation, O blessed one."
        },
        6: {
          irmos: "Stuck fast am I in the abyss of sin, O Savior, and tempest-tossed on the deep of life; yet lead me up from the passions and save me, as Thou didst Jonah from the sea monster.",
          troparia: [
            "Arrayed in strength of heart against the enemy, the athletes cast him down and have received crowns of victory from God; and they now pray earnestly in behalf of all mortals.",
            "Saved from all wrath, tribulation and the assault of the enemy by their entreaties, with faith let us honor the holy hierarchs of God and bless His venerable ones.",
            "The godly choir of women suffered, and pleased God in fasting, and hath received the heavenly kingdom. At their supplications have pity on Thy world, O God.",
            "Nekrosimon: O Christ, Bestower of life, Who fashioned man out of earth, give rest unto those whom Thou hast taken from us, granting them remission of evils, in that Thou art full of loving-kindness and lovest mankind.",
            "Unto those whom Thou hast taken from the earth by Thine all-accomplishing will, O Thou Who lovest mankind, do Thou vouchsafe ineffable and divine radiance where the choirs of the martyrs are.",
            "O Christ, Who ever pourest forth rich mercy, in that Thou art full of loving-kindness grant a place of ease in Thy dwelling-place, in Thy wondrous tabernacle, unto Thy servants who ever piously accept Thee.",
            "Nekrosimon: Only Thou art free among the dead, O Christ, and Thou didst shake off the mortality of death. Deliver Thy servants now from the mortality of sin, O Master, showing them to be heirs of Thy kingdom."
          ],
          theotokion: "Thou didst mend the broken state of Eve and annul the ancient curse; for thou gavest birth to the Creator, Who is able to set us aright who have been cast down by transgressions, O Theotokos, only Mother of God."
        },
        7: {
          irmos: "Emulating the cherubim, the youths danced in the midst of the furnace, crying: Blessed art Thou, O God, for in truth and judgment Thou hast brought all these things upon us because of our sins! All-hymned and all-glorious art Thou for all ages!",
          troparia: [
            "The saints cast down the enemy by their patience, enduring every temptation of cruel tortures, for they truly loved God Who suffered for our sins. At their supplications, O Word, from perils and misfortunes save all of us who glorify Thee.",
            "O holy martyrs, taking up the Cross of Christ as an ensign of victory, ye set at nought all the power of the devil; and receiving heavenly crowns, ye are become bulwarks for us, praying to the Lord in our behalf.",
            "O holy hierarchs, prophets and ye God-bearing venerable ones, ye enlighten the world with the rays of the Spirit, dispelling the darkness of the passions.",
            "The venerable fathers, prophets and hierarchs, and the ever-glorious women earnestly pray to Thee, the Master of all, in our behalf.",
            "Nekrosimon: We beseech Thee, O Word: Enrolling those Thou hast taken from among us in the choir of Thine elect, show them to be sharers in the higher life.",
            "O Lord Who art everywhere present, Thou didst come down to save the human race, which was led astray of old; wherefore, the martyrs entreat Thee: Unto those whom Thou hast translated from the earth, O Savior, grant rest in the land of the meek.",
            "Only Thou art free among the dead, O Christ, and Thou didst shake off the mortality of death. Deliver Thy servants now from the mortality of sin, O Master, showing them to be heirs of Thy kingdom.",
            "Nekrosimon: In Thy great and ineffable loving-kindness and the unfathomable depths of Thy love for mankind, O Christ, grant remission of transgressions unto the departed, and show them to be cleansed by Thy grace."
          ],
          theotokion: "O holy Theotokos, sanctify our thoughts, strengthen our mind, and preserve unharmed by the arrows of the enemy us who glorify thy mighty works, O most hymned one."
        },
        8: {
          irmos: "Hymn and bless Him Who, on Mount Sinai of old, prefigured the miracle of the Virgin in the bush for Moses, and exalt Him supremely for all ages!",
          troparia: [
            "The streams of your blood sanctified all creation and manifestly dried up the effluvia of deception, O passion-bearers of the Lord; and they give drink in abundance to the souls of the faithful.",
            "With the assembly of holy hierarchs and women, and the glorious prophets, the choir of ascetics hath appeared, which is equal to that of the angels; for on earth they lived the life of the angels through the Spirit.",
            "O passion-bearers of the Lord, ye primates and prophets, ye multitude of the venerable, and holy women: From the arrows of the enemy deliver all of us who praise you.",
            "Nekrosimon: Those whom Thou hast taken from us, O Savior, do Thou cause to dwell in the bosom of Abraham, and give them rest with all the elect, for They cry out to Thee: Thou art our God, and none is righteous save Thee, O Lord.",
            "O radiant hierarchs, ye venerable and righteous, O right glorious multitude of hieromartyrs, and sacred company of holy women who shone forth in suffering and asceticism: Ever make entreaty unto God, that He have mercy on us.",
            "The multitude of the martyrs entreateth Thee, O Christ our Benefactor. From all woes, tribulations, grievous perils, all transgressions, and from harm, do Thou save me who am perishing, O Word.",
            "Nekrosimon: Where the light of Thy countenance shineth, O Christ, whence all sickness, sighing and grief are fled, and where the assemblies of the saints now join chorus, do Thou number the souls of all who have departed unto Thee, overlooking all their transgressions, in that Thou alone art merciful, O Thou lovest mankind."
          ],
          theotokion: null
        },
        9: {
          irmos: "O ye faithful, in unceasing hymnody let us magnify her who supernaturally conceived in the flesh of her womb the Word Who shone forth from the Father before time began.",
          troparia: [
            "Shown to be mighty against the passions and powerful against the enemy, O passion-bearers, having contended lawfully ye took the prize and were crowned by God.",
            "As godly sacred ministers and emulators of the good Shepherd, O divinely glorious primates, ye tended His sheep in holiness.",
            "With the venerable, the ascetics and the sacred prophets let us honor the multitude of women who suffered and cast down the enemy by fasting.",
            "Nekrosimon: The all-glorious multitude of Thy saints unceasingly entreateth Thee, O Lord: Show forth as sharers in everlasting life those in the Faith, whom Thou hast brought over to Thyself, O Christ.",
            "O pure Virgin Mother, thou boast of the martyrs, the venerable and the righteous, free us from all the tyranny of the evil one.",
            "Nekrosimon: O Ruler Who hast authority over the living and the dead: Unto those who have passed over to Thee from life do Thou grant the inheritance of heaven and the splendor of the saints and Thine all-glorious passion-bearers, O Master.",
            "O Lord Who art everywhere present, Thou didst come down to save the human race, which was led astray of old; wherefore, the martyrs entreat Thee: Unto those whom Thou hast translated from the earth, O Savior, grant rest in the land of the meek.",
            "Only Thou art free among the dead, O Christ, and Thou didst shake off the mortality of death. Deliver Thy servants now from the mortality of sin, O Master, showing them to be heirs of Thy kingdom."
          ],
          theotokion: "When my soul must needs sever its fleshly bond and depart this life, then stand before me, O Mistress. Set at nought the counsels of the incorporeal foe, and crush the jaws of those who seek to slaughter me without pity, that, unhindered, I may elude the myriad princes of darkness who inhabit the air, O Bride of God."
        }
      }
    }
        },

3: {
            1: {
  metadata: {
    day:             "Monday",
    theme:           "Repentance and the Bodiless Powers",
    canons:          ["Canon of Repentance", "Canon of the Incorporeal Hosts"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Incorporeal Hosts per ode, in source order; theotokion: final theotokion of the ode sequence (Canon of Repentance theotokion); Ode 8 theotokion null per rule",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. II (Tones III & IV), St. John of Kronstadt Press",
    pages:           "22–26",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Thou didst part the sea, O Lord, covering the chariots of Pharaoh in the deep, and didst save the people of Israel, who praised Thee with hymns.",
      troparia: [
        "O Sinless One, deliver me from the myriads of transgressions I have mindlessly committed, granting me tears of compunction, as once Thou did to the harlot.",
        "Through the virtues show me to be Thy temple, though I am become a den of thieves through mine unseemly deeds, O Thou Who, loving mankind, wast of Thine own will born in a cave.",
        "Piloted by the divine Spirit, ye navigated the tempest of torments, O divinely inspired martyr, and have put in at the harbor of God.",
        "Enlightened by the grace of the Spirit, O all-praised martyrs, rejoicing, ye escaped the most profound darkness of the madness of idolatry.",
        "As the Light without beginning, imparting all radiance, O Christ God, enlighten my thoughts at the intercession of Thy hosts.",
        "Rejoicing angelically, the choirs of the angels are mystically illumined by a most rich communion of Thy beauteous splendors, O Savior.",
        "As the good Creator of life, the Spirit, Who doth good and Who proceedeth from the Father, hath made steadfast the heavenly hosts by His intangible divine grace."
      ],
      theotokion: "O most holy and all-pure one, helper of sinners, restoration of the fallen: Grant the repentance of compunction unto me who have sinned greatly."
    },
    3: {
      irmos: "Make me steadfast, O Lord Who alone art greatly merciful; extend Thy hand unto me, as Thou didst to Peter, and save me.",
      troparia: [
        "As Thou didst save drowning Peter, O Thou Who lovest mankind, so do Thou lead me up from the depths of my transgressions.",
        "The deceiver hath brought death upon me, slaying me with the passions; but do Thou, O Bestower of life, revive me by examples of repentance.",
        "Unjustly consumed by material fire, O martyrs, ye were immaterially consumed by the desire for the Immaterial One.",
        "Torn asunder, the martyrs set at naught the maimings and pursuits of the deceiver; and they were vouchsafed crowns.",
        "O Good One, Thou hast shown the angelic choirs to be rivers and streams flowing with goodness, shining with the radiance of Thy hidden mystery.",
        "That Thou mightest manifestly show forth the treasures of Thy riches and Thy might, O Master Christ, Thou didst bring forth the noetic hosts to share in Thy glory.",
        "Standing with trembling before Thee and ministering to Thee, the angelic luminaries ever hymn Thine infinite power, O Christ."
      ],
      theotokion: "O Mary of lordly name, by thy supplications free me who am beset by many soul-destroying passions."
    },
    4: {
      irmos: "Nay, with the rivers wast Thou wroth, O Lord? Nay, against the rivers was Thine anger, or against the sea Thine attack?",
      troparia: [
        "Loose the bonds of my passions, O Lord, and, binding me with repentance, show me to be a sharer in Thy good things.",
        "Illumine me with splendid examples of repentance, O Christ my Sun, dispelling the deep nighttime of mine evils.",
        "O wise athletes, ye were shown to be burning coals consuming the tinder of ungodliness and enlightening those in darkness.",
        "Ye emulated the death of Christ, O martyrs, having been subjected to divers pangs; wherefore, ye have inherited life divine.",
        "O clouds who received the effulgence of the threefold Sun, ornaments of the Trinity: Impelled by the power of the Spirit ye were upborne by the divine will.",
        "The angels were sent into the world as guardians of the salvation of the pious who would believe on Thee, O Savior; and they preserve Thy servants.",
        "The angels are mystically illumined by their pure proximity to Thee and Thy divine effulgence; and they cry: Glory to Thy power, O Thou Who lovest mankind!"
      ],
      theotokion: "Grant me true repentance, and still the tumult of my passions, O pure intercessor for the sinful."
    },
    5: {
      irmos: "With Thy never-waning light, O Christ God, illumine my lowly soul, and guide me to the fear of Thee, to the light of Thy commandments.",
      troparia: [
        "Leave me not stripped naked of good deeds at Thy tribunal, O Thou Who lovest mankind; but through repentance clothe me in the raiment of godly deeds.",
        "I have been wounded by the sword of the passions and cast into the pit of despair. Disdain me not, O Master, but cure me with the medicine of conversion.",
        "Though your nails were cruelly torn out, and ye were lacerated with wounds and slain with the sword, ye did not bend your knees before the graven images.",
        "The world is ever adorned by your sufferings, O martyrs; wherefore, ye have received a dwelling-place with the angels.",
        "Illumined with thrice-radiant light, O ye faithful, with the angelic armies let us hymn the one Godhead—the Father, the Son and the Spirit.",
        "Luminaries revolving within the never-waning radiance of the all-divine Godhead, the angelic ranks, manifestly enriched, give utterance.",
        "The seraphim, angels illumined by the Spirit of the Godhead, teach us to worship the one divine Principle which is wholly without beginning, manifestly giving utterance to the thrice-holy cry."
      ],
      theotokion: "O thou who, at the word of the archangel, didst alone give birth to the Word in the flesh, yet didst remain a virgin, deliver me from irrational acts, that I may hymn thee with honorable words."
    },
    6: {
      irmos: "O Thou Who lovest mankind, disdain not those who have reached the end of time and are assailed with destruction by the threefold billows of perils, yet cry: O Savior, save us, as Thou didst save the prophet from the sea monster!",
      troparia: [
        "Puffed up in mind, like the Pharisee of old I have grievously fallen through transgressions, O Christ, and seeing me, the deceiver is gladdened. O Thou Who didst humble him by the Cross, have pity on me who am now brought low.",
        "Sin-loving in this life like no other man, O Master, I have wasted Thy long-suffering, wretch that I am, and am still senseless. But by Thy lovingkindness convert me.",
        "With wrathful eagerness condemning the divinely wise to be run through and to be consumed by fire, the violators of the law showed them to be truly more lustrous than gold, and heirs to Christ.",
        "Passing through trials full of battles and tremendous struggles, and wounds beyond human nature to endure, ye defeated the prince of darkness and received crowns from God, O athletes.",
        "Their voices never stilled, the archangels and angels, the principalities, authorities and powers mightily hymn the primal and all-accomplishing effulgence of the Godhead.",
        "O Thou Who didst invisibly adorn the noetic world with a harmonious arrangement of the ranks of angels, Thou wast well-pleased that the honored Church emulate its goodly order."
      ],
      theotokion: "We hymn thee, the true Mother of the Creator, as the ark of the law, the table truly holy, our mercy-seat, the animate temple of God, and the lampstand all of gold."
    },
    7: {
      irmos: "The three children in the furnace prefigured the Trinity: they trampled the threat of the fire underfoot and cried aloud, chanting: Blessed art Thou, O God of our fathers!",
      troparia: [
        "My time draweth to a close, O my soul. My departure is at hand. Wherefore, show forth the fruits of repentance before the doors are closed to thee, and cry out unto Christ: Save me, O Lord!",
        "Let us till our hearts with the plough of true understanding, sowing the wheat of repentance, that we may reap the grain of righteousness for Christ, the Husbandman of our souls.",
        "O martyrs of the Lord, ye beacons of piety who fought against ungodliness and enrichers of the poor: Enrich with the virtues mine all-accursed, impoverished soul.",
        "O Christ Who saved the publican who sighed from the depths of his heart, accept my feeble sighing and save me, for the sake of the passion-bearers who glorified Thee by their own members.",
        "Gazing upon the primal effulgence with steadfast mind and undaunted gaze, O ye angelic choirs, ye became secondary luminaries through partaking thereof, crying out: Blessed art Thou, O God of our fathers!",
        "Led on by unwavering desire and steadfast love, by proximity ye became secondary luminaries through the beauties of the Creator, O ye angelic choirs, crying out: Blessed art Thou, O God of our fathers!"
      ],
      theotokion: "O well-spring who pourest forth the water of remission, dry up the effluvia of my transgressions, granting me a shower of tears, that I may ever hymn thee as the Theotokos."
    },
    8: {
      irmos: "O ye priests, bless the Lord Who with divine power descended unto the Hebrew children in the flame and hath manifested Himself as Lord, and exalt Him supremely for all ages.",
      troparia: [
        "For his mockery Ham was declared a slave by his father's sentence. And what dost thou do, O my soul, enslaving thyself to the passions and riotously giving thyself over to mockery, lacking all sense of shame before the heavenly father?",
        "Mindlessly surrendering to enmity, Cain became the slayer of his brother. And thou hast shown thyself to be like unto him, for though thou hast not slain anyone, yet thou hast done thyself to death through the love of pleasures and the deceptions of life, O my soul.",
        "Assembling in faith, let us hymn as is meet the choice pearls of the Lord, the precious vessels, the lamps shining with the radiance of divine grace, the passion-bearers of the Lord.",
        "Accepting the blood of the wise passion-bearers like incense, O Word, at their entreaties save those who fall down before Thee in repentance, for Thou alone art merciful.",
        "As the Creator of all, by Thy thought Thou didst bring the angels into being; and they stand before Thee with fear, crying out: Bless the Lord, all ye works of the Lord, and exalt Him supremely for all ages!",
        "Becoming like flames by partaking of the divine fire, the celestial intelligences cry out: Bless the Lord, all ye works of the Lord, and exalt Him supremely for all ages!",
        "Before visible things Thou didst create the immaterial and noetic angels, who unceasingly cry out to Thee: Bless the Lord, all ye works of the Lord, and exalt Him supremely for all ages!"
      ],
      theotokion: null
    },
    9: {
      irmos: "On Mount Sinai Moses beheld in the bush thee who without being consumed didst conceive the fire of the Godhead within thy womb. Daniel beheld thee as the unquarried mountain. And Isaiah cried aloud: Thou art the rod sprung forth from the root of David!",
      troparia: [
        "Once, because of his temperance, Jacob received the birthright, and, unable to restrain his stomach, Esau fell from his position as elder son. How evil is intemperance, and how great is abstinence! Cease committing evil deeds, O my soul, and love the increase of good things.",
        "Having endured many evils, the blameless Job was crowned; for the torrents of temptations, rushing at him, did not shake the tower of his heart. Him do thou ever emulate, remaining unaffected by the wiles of the evil one, O my soul.",
        "Forged in the fire of the divine Spirit, ye were manifestly shown to be swords which cut down the hordes of the adversary, O passion-bearers of Christ; and, glorified by great victories, ye have been crowned by the almighty right hand of the King of all.",
        "O ye multitude of martyrs, entreat God the Master, Who hath accepted your ineffable toils and enrolled you in the armies of the incorporeal ones, that He wash away the multitude of my countless evils.",
        "Standing now before the great and primal Light, O most divine angels of God, ye have become most powerful advocates for all of us who magnify you as far as we are able.",
        "Clearly vouchsafed to glorify the Trinity equal in power, and first illumined by the effulgence thereof, vouchsafe us who piously magnify you, that we may be illumined with reflected radiance."
      ],
      theotokion: "O splendid palace of the Master, show me to be a dwelling-place of light; O impassable gate, open unto me the ways of repentance; O holy land, guide me to the land of the meek. O Mistress, show me to be free of all the dominion of the passions."
    }
  }
},
2: {
  metadata: {
    day:             "Tuesday",
    theme:           "Repentance and the Holy Forerunner",
    canons:          ["Canon of Repentance to our Lord Jesus Christ and His martyrs", "Canon of John the Forerunner"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Forerunner per ode, in source order (Martyrica excluded); theotokion: final theotokion of the ode sequence (Canon of the Forerunner theotokion in most odes); Ode 8 theotokion null per rule",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. II (Tones III & IV), St. John of Kronstadt Press",
    pages:           "31–36",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Thou, O God, art He Who wondrously and gloriously wrought miracles, Who made the deep land, Who engulfed the chariots, and saved the people, who sang unto Thee as our King and God.",
      troparia: [
        "Before the end, O ye faithful, let us weep for ourselves with all our soul. The Bridegroom approacheth; let us light our deeds as though they were radiant lamps, that together we may enter the divine bridal-chamber.",
        "Repenting with all his soul, Manasseh of old was saved; for he cried out to the one Master from the midst of his fetters. Him do thou emulate, O my soul, and thou shalt easily find salvation.",
        "O Forerunner of the Lord, godly offspring of a barren womb: Pray to God, that I may produce the fruits of the virtues, and loose the barrenness of my sin, dispelling the gloom from my mind.",
        "On earth thou wast shown by faith to be a star preceding the great Sun of glory Who hath illumined the whole world. Wherefore, entreat Him, O Forerunner, that He enlighten my soul, which hath been benighted by evil thoughts.",
        "O Prophet, who by the divine Spirit didst announce beforehand to those in hades the Light Who was drawing nigh: By thine entreaties give life to my deadened soul, and raise me up from my transgressions as from a grave, I pray, O glorious Forerunner."
      ],
      theotokion: "With the archangels and angels, and all the saints, entreat the Lord Who through thee revealed Himself to us, we pray, O Virgin, that we who confess thee to be the true Theotokos may be delivered from misfortunes."
    },
    3: {
      irmos: "O barren and sterile soul, acquire thou right glorious fruit, and cry out in gladness: I have been made steadfast by Thee, O God! There is none so holy or so righteous as Thee, O Lord!",
      troparia: [
        "I have senselessly broken the law of God, and must needs be condemned. And what I shall do, I know not. O most righteous Judge, have pity and save me in Thy lovingkindness.",
        "O greatly Merciful One Who lovest mankind, Thou Dayspring of the East: Shine forth the light of righteousness upon me, I pray, rescuing me from the gloom of the passions and the darkness of torment.",
        "As thou art the voice of the Word, O Baptist, unto Him direct now the cries of those who honor thee, and by thy mediation grant us remission of transgressions.",
        "I have sinned against Thee, and have committed iniquity and sorely transgressed, O Savior, and I have defiled my soul. Wherefore, I pray Thee: Have pity on me for the sake of him who baptized Thee.",
        "I beseech thee, O Forerunner, thou child of the desert and guide of the new people of God: To the paths of repentance guide me, who through pleasures have gone astray in the wilderness."
      ],
      theotokion: "With the apostles, the sacred prophets, the martyrs and the heavenly hosts entreat thy Son, O all-pure one, that He have pity on us who hymn thee."
    },
    4: {
      irmos: "O pure one, Habbakuk foresaw thine all-pure womb as a mountain overshadowed; wherefore, he cried aloud: God cometh from Thæman, the Holy One from a mountain overshadowed and densely wooded.",
      troparia: [
        "O Christ God, Who upon the disobedient and gainsaying people didst pour forth of old water from a rock, slaking their thirst: From my stony soul draw forth a drop of compunction to wash me clean.",
        "O Physician of the sick, as a gesture of compassion cure my heart of the passions, applying repentance to it as a poultice of divine medicine, O Savior, in that Thou art good, that I may glorify Thee with faith.",
        "O Forerunner of the Lord, I entreat thee, the voice of the Word Who appeared in the flesh: From irrational actions deliver me who honor thee with my words and bless thee with faith, as is meet.",
        "Sigh, O my soul, and cry out to God, thy Creator: I have sinned! Cleanse me, O Christ, and at the entreaties of the divine Forerunner deliver me from dreadful torment, misfortunes and tribulations.",
        "Rescue me, who am drowning in the many waves of grievous passions, am cruelly beset by the storm and am ever foundering therein, O Baptist, and guide me to the harbor of repentance."
      ],
      theotokion: "O most immaculate Mother of God, O chariot more exalted than the cherubim: With the immaterial ministers and all the saints entreat Christ to Whom thou gavest birth, that He save me, the accursed one."
    },
    5: {
      irmos: "Rising early, we hymn Thee, O Word, Thou only-begotten Son of God. Grant us Thy peace, and have mercy upon us who hymn and worship Thee with faith.",
      troparia: [
        "Sprinkling me with the hyssop of repentance, purify me of the defilements of the passions, O Jesus, that I may appear before Thee clean when Thou shalt judge all men in Thy righteous judgment.",
        "The wounds of mine all-wretched soul have festered, O Savior. O Healer of the sick and Bestower of good things, heal Thou and save me in Thy surpassing mercy.",
        "On earth thou didst manifestly live like an angel in the flesh, O blessed one; wherefore, I pray to thee: Free my soul from carnalmindedness.",
        "O Forerunner of the Lord, save me, who have fallen into the abyss of sin, who have defiled my soul with pleasures, and am in distress, yet flee unto thee.",
        "Thou wast shown to be more exalted than the prophets, O Prophet, for thou thyself didst see Him Whom thou didst proclaim. Him do thou unceasingly entreat, that He enlighten our souls."
      ],
      theotokion: "O divinely joyous one, who by the indwelling of the Word wast shown to be more spacious than the heavens: Free me from the sins which constrict me."
    },
    6: {
      irmos: "The abyss of the passions and the tempest of contrary winds have risen up against me; but going before me, save me, O Savior, and deliver me from corruption, as Thou didst save the prophet from the beast.",
      troparia: [
        "I have been benighted by the gloom of sin and lie wholly dormant. O Christ God, Who wast once wounded by a spear for my sake, have pity on me in Thy lovingkindness.",
        "I groan, yet I remain sunk in evils; I weep, yet I tremble not before the judgment; I experience pain, but am yet unfeeling. O Word of God, have pity and save me by Thy good judgments!",
        "In the waters thou didst baptize the Torrent of sweetness, Who bowed His head beneath thy hand. Him do thou entreat, O wise one, that He send down the water of compunction upon me who have greatly sinned.",
        "In the river, O Forerunner, thou didst wash Jesus Who loveth mankind, the Abyss of lovingkindness Who covereth the chambers of the heavens with waters. Him do thou entreat, that He pour forth remission upon me.",
        "'Repent, for the kingdom of heaven is at hand!' thou didst cry out, O Forerunner. Wherefore, vouchsafe that those who honor thee with love and flee beneath thine honored protection may receive it."
      ],
      theotokion: "O all-pure one, who didst lend thy flesh to the Creator: With the heavenly hosts, all the prophets, the apostles and martyrs, beseech Him to have pity and save me."
    },
    7: {
      irmos: "O Lord God of our fathers, Who bedewed the flame of the furnace and saved the children unconsumed: Blessed art Thou forever!",
      troparia: [
        "I have stripped myself of the garments of incorruption and clothed myself in deeds of ungodliness; wherefore, I cry out to Thee: O Compassionate One, make me splendid in the raiment of the virtues.",
        "I have sullied myself with lustful gazes and defiled myself by unseemly touching, and am become vile in Thy sight. O Jesus, accept me as Thou didst the prodigal!",
        "O Forerunner and Baptist of Christ, star of the Sun, my soul, which hath been darkened and blinded by slothfulness, do thou illumine, guiding me to the path of repentance.",
        "Mindful of the hour of judgment, I am wholly seized with fear; for I wallow in a multitude of unseemly deeds. But stand before me, O thou who didst baptize the Lord, and deliver me from the impending fire.",
        "O intercessor for my life, O Forerunner my helper, preserve and protect me from enemies, visible and invisible, and cause me to share in the heavenly kingdom."
      ],
      theotokion: "O Virgin Theotokos, with the prophets, apostles and martyrs beseech thy Son, that from impending need He deliver us who ever honor thee."
    },
    8: {
      irmos: "O ye heavens of heavens, O earth, ye mountains and hills, O abyss, ye whole generation of mankind, with hymns bless God Who is glorified unceasingly by the angels in the highest, and exalt Him supremely as Creator and Deliverer for all ages.",
      troparia: [
        "I have not had the fear of Thee dwelling in my heart, and, devoid of conscience, have brought carnal pleasure to fulfillment; and I tremble before Thy judgment, O King of all. Disdain me not, who am now penitent.",
        "Washing earthly sin from me by repentance, vouchsafe that I may pass over to the holy land wherein the meek dwell, O greatly Merciful One Who wast sinlessly born on earth of the Virgin.",
        "Thou didst preach the Lamb of God Who taketh away the sins of men, O godly John the Forerunner. Him do thou beseech, that He loose the burden of my sins and vouchsafe unto me the portion of the saved.",
        "From the furnace of burning flame and the outer darkness which is devoid of light deliver me who am wholly held fast in the darkness of evil deeds, for the sake of Thy glorious and divine Baptist, I pray Thee, O Word of God, Who art wholly without beginning.",
        "O divine Prophet of the Lord, who through repentance preached fruitfulness to souls empty and barren: Clear my thorn-choked soul of all the pleasures, that I may produce the grain of good works."
      ],
      theotokion: null
    },
    9: {
      irmos: "Blessed is the Lord God of Israel, Who hath exalted the horn of our salvation in the house of David His child, for the sake of His lovingkindness; and therein He hath visited us, the Dayspring from on high, and hath guided us to the path of peace.",
      troparia: [
        "Now is the right acceptable time and the day of purification! Turn, O my soul, and make it thy will henceforth to bring forth fruits of repentance, lest the dread axe of death find thee barren and, hewing thee down like the fig-tree of old, send thee into the fire.",
        "Like the rich man of old do I wallow in the pleasures, lacking any great love for my neighbor; and I am not daunted by the unquenchable fire. Wherefore, soften the hardness of my soul, O Master, that in the end I who am benighted may but a little be enlightened by lovingkindness.",
        "Having entered the tabernacle of the law, thou didst richly gaze upon the splendor of divine grace, O wise prophet, enlightening the ends of the earth and dispelling the darkness of ignorance; wherefore, we honor thee.",
        "In that thou art a martyr of Christ, the godly one who baptized Him, a beacon of repentance, the dawning of piety, the mediator between the Old and New Covenants, enlighten my lowly soul, which hath grown old through evil, renewing it with divine understanding.",
        "At the hour of horror, the hour of terror, the hour of condemnation, from the threats that await me beyond do thou deliver me who am condemned, O wise one, for thou hast the Bridegroom, the Savior of our souls, hearkening to thine entreaties as a friend."
      ],
      theotokion: "As the Mother of God, as the Mother of the Word of God Who was born of thee in the flesh, O pure one, ever pray with the incorporeal ones, with the apostles and prophets, the holy hierarchs and martyrs, that He have pity on the world, O all-pure Virgin Mother."
    }
  }
},
            3: {
  metadata: {
    day:             "Wednesday",
    theme:           "The Precious and Life-creating Cross and the Theotokos",
    canons:          ["Canon of the precious and life-creating Cross", "Canon of the all-holy Theotokos"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross then Canon of the Theotokos per ode, in source order; theotokion: final theotokion of the ode sequence; Ode 8 theotokion null per rule",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. II (Tones III & IV), St. John of Kronstadt Press",
    pages:           "41–46",
    verified:        true
  },
  odes: {
    1: {
      irmos: "He Who of old gathered the waters into one at His divine behest and parted the sea for the people of Israel, is our God and is most glorious. To Him let us chant, for He hath been glorified!",
      troparia: [
        "Thou didst cause the greatly painful passions to cease, O Word, and didst save men, whom the adversary wounded of old, yet who piously worship Thine ineffable dispensation.",
        "He who by deceit bound man through the violation of the commandment in paradise is bound by the unbreakable bonds wherewith Thou wast bound, having become incarnate of thee, O Virgin, loosing our transgressions.",
        "Thee whom the Prophet Habbakuk foresaw in the Spirit as the mountain overshadowed, do I beseech thee: O all-pure one, overshadow me who am pierced through by passion and am in the shadow of death, that I may be freed of the passions which assail me.",
        "With the sprinkling of the divine streams which flow from the divine side of thy Son, wash clean the wounds of my heart, that, as is meet, I may magnify and glorify thee, the ever-blessed and all-immaculate one."
      ],
      theotokion: "Thou gavest birth to the Word Who is the equal of the One Who begat Him, and hath made the essence of man divine. Entreat Him, O pure one, that He vouchsafe divine consolation unto me who am confused and weakened by the wiles of the enemy."
    },
    3: {
      irmos: "O Most High, Thou Ruler of all, Who out of non-existence hast brought all things, which are fashioned by Thy Word and made perfect by the Spirit: Confirm me in Thy love!",
      troparia: [
        "By the Tree did the assembly of the Jews slay Thee, Who in the essence of Thy divinity art dispassionate, yet in Thy goodness becamest subject to suffering in the flesh, and dost make us immortal.",
        "O Word Who suspended the earth upon the waters, of Thine own will Thou wast suspended upon the Tree, leading up to the heavens me who have fallen into the pit of evil.",
        "O most immaculate one who gavest birth to the preeternal Light, deliver me from every evil circumstance, from the many temptations of the serpent, and from eternal fire and darkness.",
        "Wholly condemned am I by the dread tribunal, the unquenchable fire and the stern sentence, O all-pure one. Haste thou, O all-pure Mistress, to save me, thy servant."
      ],
      theotokion: "To deify mankind, God became a man through thee, in manner past recounting and understanding, O pure Virgin; wherefore, together all of us, the faithful, call thee blessed."
    },
    4: {
      irmos: "Thou hast shown us constant love, O Lord, for Thou didst give Thine only-begotten Son over to death for us. Wherefore, in thanksgiving we cry to Thee: Glory to Thy power, O Lord!",
      troparia: [
        "Beaten about the head with a reed, Thou didst endure mockery, O Master Who dost truly surpass all honor, that Thou mayest honor me who have been dishonored by disobedience, O Christ Who lovest mankind.",
        "As the King of truth Thou wast crowned with a crown of thorns as Thou didst desire, O Long-suffering One, and Thou didst uproot thorny sin. I hymn Thy sufferings, O Savior!",
        "O Virgin Theotokos, thou undefiled tabernacle, by thy compassions, as with outpourings of great purity, cleanse me who am defiled by transgressions, and grant me a helping hand, that I may cry: Glory to thee, O pure Bride of God!",
        "Thou wast shown to be a temple dedicated to God Who made His abode within thee in manner past understanding. Him do thou entreat, that He cleanse us of the defilements of sin, that we may be known to be the temples and habitations of the Spirit."
      ],
      theotokion: "O holy Theotokos who gavest birth to the All-holy One in the flesh, sanctify us, that we may emulate Him Whose desire it was to become like men; and by thy supplications show us all to share in the kingdom of heaven, O all-pure one."
    },
    5: {
      irmos: "Thou hast appeared on earth, O Invisible One, and of Thine own will hast dwelt with men, O Unapproachable One. And rising early unto Thee, we hymn Thee, O Thou Who lovest mankind.",
      troparia: [
        "Thou wast uplifted upon the Tree like a lamb, O Good One, didst offer Thyself to the Father as a sacrifice for us, O Almighty, and didst abolish idolatrous sacrifice.",
        "Pierced in the side with a spear, O Bestower of life, Thou pourest forth two streams of salvation upon those who declare Thee to be one of the Trinity, yet having two natures.",
        "The torrents of my many transgressions have engulfed me and brought down the temple of my soul, O all-pure one; but as thou art the restoration of our first parents, O Theotokos, raise me up, thy servant.",
        "Save me from cruel tribulations! Raise me up from the vile passions, and from the captivity and oppression of the evil demons deliver me who honor thee with love."
      ],
      theotokion: "O pure Virgin Mother, we know thee to be the cloud and garden of paradise, the portal of the Light, the table and fleece, and the jar holding within thee the Manna which is the delight of the world."
    },
    6: {
      irmos: "The uttermost abyss of sins hath engulfed me, and my spirit doth perish. But, stretching forth Thine upraised arm, O Master, save me as Thou didst Peter, O Helmsman!",
      troparia: [
        "The lying serpent, who deceived me with the fruit of falsehood, caused me to be expelled from Eden; but Christ, having been raised up upon the Tree of His own will, restoreth mine ancient access thereto.",
        "By Thy wounded side, O Lord our Benefactor, he who wounded us was wounded and remaineth unhealed; but we, the faithful, have been healed by the wounds whereby Thou wast wounded of Thine own will.",
        "I pray to thee, the only good one, the undefiled tabernacle: By thy mediation wash away all defilement from me who have been defiled by many sins.",
        "Be thou a pilot for me who am tossed about on the deep of evils by the needs of life, O pure one; steer me to the true harbor, and save me."
      ],
      theotokion: "O Mary, thou sacred tabernacle which hath been revealed, sanctify my wretched soul, which hath been defiled by pleasures."
    },
    7: {
      irmos: "Of old, the three children would not bow down before the golden image, the object of the Persians' worship, but chanted in the midst of the furnace: O God of our fathers, blessed art Thou!",
      troparia: [
        "By Thy pangs Thou didst cause our pangs to cease, O Thou Who lovest mankind, and thou hast now brought to the life devoid of pain those who piously worship Thine honored sufferings, O God of all.",
        "When creation saw Thee crucified, O Christ, it quaked and trembled: the earth shook, the rocks split asunder, and the sun in its transit hid its light.",
        "Sanctify my soul, which hath been defiled by the passions, O all-pure Bride of God, and quickly bring an end to the grievous captivity of my mind, the perplexity of my heart and the onslaughts of the demons.",
        "Enliven my mind, which hath been done to death by carnal passions, O most immaculate one, and strengthen me to do works pleasing unto God, that I may magnify thee and ever glorify thy compassion."
      ],
      theotokion: "Beholding Him Who alone is most high uplifted upon the Tree and putting down the uprisings of the enemy, she who is more exalted than the heavens hymned Him aloud."
    },
    8: {
      irmos: "The Babylonian furnace did not consume the children, nor did the fire of the Godhead harm the Virgin. Wherefore, O ye faithful, let us cry out with the children: Bless the Lord, ye works of the Lord!",
      troparia: [
        "When Thou wast crucified, paradise was opened again, and the sword which was wielded against us was withdrawn, putting to shame the spear which pierced Thy holy side, O greatly merciful Christ.",
        "The adversary was wounded by Thy spear and fell, and fallen Adam is returned to life, crying out to Thee Who wast slain of Thine own will, O Christ: I glorify Thee Who givest blessings, O my greatly merciful God!",
        "As thou art the Mother of God, beseech the Lord God and King, that I, thy servant, who from my mother's womb have set my hope on thee, may be delivered from every threat and wicked habit, O Mistress.",
        "In that thou art the Mother of God, with the holy angels, the prophets, apostles and martyrs make supplication, that those who ever confess thee to be the Theotokos may be delivered from misfortunes, tribulations, and all the torments which are to come."
      ],
      theotokion: null
    },
    9: {
      irmos: "Honoring her with hymns, let us magnify the Theotokos who was prefigured on Sinai to Moses the law-giver by the bush and the fire, who conceived the fire of God in her womb without being consumed, who is the most radiant and inextinguishable lamp.",
      troparia: [
        "That Thou mightest find the coin which Thou hadst lost, O good Christ, Thou didst set Thy flesh alight on the Cross; and Thou makest Thy heavenly hosts to share in joy, O Bestower of life. And hymning Thee with them as our Benefactor, we magnify Thee in song.",
        "As Thou didst lift up Thy hands upon the Cross, O Christ, with Thy power Thou didst strengthen my hands, which before were weakened by many passions; and thou didst fortify my truly weak knees to run the divine race: Wherefore, I glorify Thee.",
        "O incorrupt and immaculate Virgin, disdain me not who am corrupt of mind and depraved of soul and conscience, who am defiled by evil and am shown to be stripped bare of all good deeds; but do thou adorn me with works of piety.",
        "I have been filled with evils, filled with thoughts which alienate me from Thee Who lovest mankind; wherefore, I groan and cry out: Accept me, the penitent, and at the supplications of her who gave Thee birth, reject me not, O greatly merciful Benefactor.",
        "That I may be delivered by thy supplications from all wrath, the deadly passions, cruel Gehenna and fire, from unjust men and wicked enemies, O most immaculate Maiden, I have fled to thy protection and call upon thee for help.",
        "In that thou art the Mother of God, beseech the Lord God and King, that I, thy servant, who from my mother's womb have set my hope on thee, may be delivered from every threat and wicked habit, O Mistress."
      ],
theotokion: "In that thou art the Mother of God, beseech the Lord God and King, that I, thy servant, who from my mother's womb have set my hope on thee, may be delivered from every threat and wicked habit, O Mistress."
    }
  }
},
            4: {
  metadata: {
    day:             "Thursday",
    theme:           "The Holy Apostles and St. Nicholas the Wonderworker",
    canons:          ["Canon of the holy, glorious and most lauded apostles", "Canon of St. Nicholas the great wonderworker"],
    flatteningOrder: "Canon of the Apostles irmos governs; troparia: Canon of the Apostles then Canon of St. Nicholas per ode, in source order; theotokion: final theotokion of the ode sequence; Ode 8 theotokion null per rule",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. II (Tones III & IV), St. John of Kronstadt Press",
    pages:           "49–55",
    verified:        true
  },
  odes: {
    1: {
      irmos: "He Who of old gathered the waters into one at His divine behest and parted the sea for the people of Israel, is our God and is most glorious. To Him let us chant, for He hath been glorified!",
      troparia: [
        "Come, let us bless the sacred apostles—the pillars of the Church, the foundations of the Faith, the bulwarks of piety who make steadfast all the faithful—that we may be saved by their entreaties.",
        "Terrified, I, the prodigal, condemn myself even before the judgment, for I have amassed countless evil deeds; wherefore, I pray Thee, O righteous Judge: Through the divine entreaties of Thine apostles save me, who am desperate.",
        "O steadfast pillars of piety, set me aright who am ensnared by the deception of the enemy, for I lie upon the ground in affliction, and know not what to do to find remission for those things in which I have sinned.",
        "Let all of us, who are ever engulfed by the waves of life, honor and lovingly bless Nicholas, the all-radiant and inextinguishable beacon, the tower on earth, who beckoneth us to the divine harbor.",
        "Strengthened by the power of God, O most blessed one, in mind thou didst acquire zeal for piety; wherefore, thou didst deliver those who were to be unjustly put to death. We therefore beseech thee: Deliver us from all unjust affliction, O Nicholas!"
      ],
      theotokion: "O most immaculate one, thou art my might, joy and gladness, a steadfast bulwark and intercessor, delivering me from temptations and misfortunes."
    },
    3: {
      irmos: "O Most High, Thou Ruler of all, Who out of non-existence hast brought all things, which are fashioned by Thy Word and made perfect by the Spirit: Confirm me in Thy love!",
      troparia: [
        "O eye-witnesses of Christ, who have filled the ends of the earth with divine doctrine, fill my soul with virtuous works and good thoughts.",
        "Deliver me, O disciples of Christ, from the many temptations of the wicked one, from all manner of tribulation, from all oppression and every evil circumstance.",
        "Alas, O my wretched and lowly soul! Sinning often and angering God, how canst thou ask forgiveness for thy wickedness, since thou dost not cease to do it?",
        "O divine ladder which Jacob beheld, whereby God descended, lifting us up: Earnestly pray with the apostles, that He have pity on us.",
        "Thou didst offer supplications to the Lord in abundance, O father, that He deliver us from sins and the flame of everlasting torment, from perils and tribulations, in that He is good.",
        "Together let us hymn the all-pure Mary, the divine ark containing the Giver of the law Who, in the ineffable depths of His divine lovingkindness, taketh away all our iniquities."
      ],
      theotokion: "O most immaculate one, thou art my might, joy and gladness, a steadfast bulwark and intercessor, delivering me from temptations and misfortunes."
    },
    4: {
      irmos: "Thou hast shown us constant love, O Lord, for Thou didst give Thine only-begotten Son over to death for us. Wherefore, in thanksgiving we cry to Thee: Glory to Thy power, O Lord!",
      troparia: [
        "Extending the word to the ends of the world, as lightning-bolts and rays of the never-setting Sun, O apostles, ye enlightened all, dispelling the gloom of ungodliness.",
        "The sea of grievous sin bestormeth me, and waves of unseemly thoughts batter my lowly soul. O Lord my Helmsman, save me by the entreaties of Thy disciples!",
        "I am filled with horror, contemplating Thy dread coming, O Master, for I have within me my conscience condemning me ever before the trial, and before the tormenting tortures my senselessness.",
        "Every one of the faithful ever setteth thee forth as a mediator before God, O Nicholas; wherefore, we beseech thee: Deliver us from grievous perils and falls into sin, O Nicholas.",
        "As thou dost possess the grace of the Lord, O wise one, thou ever pourest living water upon the hearts of those oppressed by the burning heat of tribulations and the aridity of sins, and who must needs perish wretchedly, O most blessed one.",
        "O most blessed one, who once didst deliver those led forth unjustly to execution, save us now from the oppression of corrupting men, and from all the deception of the demons."
      ],
      theotokion: "O Word of God Who wast born of the divine Virgin Maiden, at her mediations and those of Thine apostles, deliver our souls from every evil circumstance and all want, O Savior."
    },
    5: {
      irmos: "Thou hast appeared on earth, O Invisible One, and of Thine own will hast dwelt with men, O Unapproachable One. And rising early unto Thee, we hymn Thee, O Thou Who lovest mankind.",
      troparia: [
        "Incarnate on earth, Thou didst make the disciples heavens declaring Thy glory, O Christ. Wherefore, for their sake, O Lord, have mercy on our souls.",
        "Deliver Thy servants from the passions and all need, and from grievous circumstances, O Word, through the right acceptable supplications of Thine apostles.",
        "Woe is me, O my most passion-wracked soul! How shalt thou, who art fruitless, stand before the dread tribunal? Make haste and repent, producing the fruits of the virtues!",
        "Standing before the pure Light and ever illumined with the rays emitted thereby, O father, ask for us cleansing and peace.",
        "O All-good One, at the fervent supplications of Nicholas have pity on me who have angered Thee more than all other men by mine insensitive mind.",
        "I who have wasted my life in despondency pray to thee, O father Nicholas: Raise my defiled mind up to repentance."
      ],
      theotokion: "Ever entreat as thy Son Him Who ineffably appeared on earth in the flesh through thy pure blood, O pure one, that He grant us cleansing."
    },
    6: {
      irmos: "The uttermost abyss of sins hath engulfed me, and my spirit doth perish. But, stretching forth Thine upraised arm, O Master, save me as Thou didst Peter, O Helmsman!",
      troparia: [
        "Pouring forth an abyss of spiritual wisdom, the company of the apostles dried up the effluvium of worldly mindedness, and gave drink to the assemblies of the pious.",
        "Sigh and shed tears, O my lowly soul, and cry out to the Lord, saying: I have sinned against Thee, O Master! Cleanse me, O Compassionate One, at the entreaties of Thine all-wise apostles!",
        "Torrents of the passions have gushed forth and engulfed the house of my soul. But as ye are rivers of the Spirit, O apostles, restore me to life, who have been demolished.",
        "Having mortified thy members by abstinence, thou didst acquire the life which waxeth not old, wherein do thou cause us to share by thy supplications, O wise one, through the avoidance of wicked sin.",
        "With the mast and sails of thy sacred prayers, deliver us from the deep of multifarious perils and the abyss of sin, O wise and holy hierarch, steering us to the harbor of life.",
        "Adorning the cathedra of Myra in Lycæa, thou wast shown to be the beauty of high priests. O holy hierarch, by thy supplications save us unharmed by the perils of the world!"
      ],
      theotokion: "With her who gave Thee birth, O Christ, the council of the apostles entreateth Thee, that Thou send down cleansing and peace upon Thy servants, in that Thou art the easily reconciled God Who lovest mankind."
    },
    7: {
      irmos: "Of old, the three children would not bow down before the golden image, the object of the Persians' worship, but chanted in the midst of the furnace: O God of our fathers, blessed art Thou!",
      troparia: [
        "Christ, the Light of the world, showed you, O light-bearing apostles, to be the light which dispelleth the darkness of deception and enlighteneth the thoughts of the faithful.",
        "O divinely eloquent apostles, break ye the snares which the enemy hath laid for us, and make smooth the paths of repentance for us who have recourse unto you.",
        "As divine salt cleanse my soul, which hath been made foolish by the carnal passions, O divinely eloquent disciples of the Lord, imparting to it life through faith.",
        "As a true chief shepherd, O father Nicholas, with the cords of thy words thou didst strangle the mindless Arius, who of old was leading the people of the Lord to destruction.",
        "Having passed thine all-holy life in holiness, O father Nicholas, thou dwellest with the saints, sending sanctification and enlightenment upon those who piously call thee blessed.",
        "Thou didst show men the straight path of salvation, O Nicholas. Guide thereto who in this life traverse it by thy supplications, that together we may enter the gates of life."
      ],
      theotokion: "Enlighten me with goodly ideas, I beseech thee, O beauty of Jacob, praying now with the apostles unto Him Who was born of thy pure blood."
    },
    8: {
      irmos: "United in the unbearable fire, yet unharmed by its flame, the pious youths chanted a divine hymn in intercession: Bless the Lord, all ye works of the Lord, and exalt Him supremely for all ages!",
      troparia: [
        "I have been wounded by the sword of the passions, and have injured my heart in mindlessness, the accomplisher of evil. Heal me, who am wholly at a loss, O glorious apostles, for ye are the physicians of men's souls and bodies.",
        "The divine sound of the preachers went forth into all the earth, teaching men to worship forever the single Essence, the one Being of the Holy Trinity, the one true Dominion, the one Kingship.",
        "O Master, O Word Who knowest mine infirmity, slothfulness and evil-mindedness, convert me, who have sinned greatly and have wasted Thy divine long-suffering by remaining in my transgressions.",
        "O all-pure Theotokos, thou who ineffably received the divine Coal: Quench the burning embers of my passions with the dew of thy prayers and those of the most glorious and divine apostles.",
        "As a true chief shepherd, O father Nicholas, thou didst inherit the land of the meek; wherefore, I pray to thee with faith: By thy supplications still thou the threefold waves of the evil one, which ever batter me.",
        "As thou didst deliver the military commanders who were unjustly condemned to die, so deliver us from the oppression of wicked men and from every assault of the demons, praying to the Savior, O Nicholas.",
        "Thou didst show men the straight path of salvation, O Nicholas. Guide thereto who in this life traverse it by thy supplications, that together we may enter the gates of life."
      ],
      theotokion: null
    },
    9: {
      irmos: "In the shadow and the writings of the law do we behold an image, O ye faithful: every male child which openeth the womb is consecrated to God. Wherefore, we magnify the firstborn Word of the unoriginate Father, the firstborn Son of the Mother Who knew not man.",
      troparia: [
        "O Word of the unoriginate Father, Who by the words of Thy disciples didst confirm the ends of the earth: By their entreaties have pity on me who have fallen headlong into irrational passions and am overwhelmed by the deception of the demons.",
        "O my soul who servest the onslaughts of the passions, offer entreaties unto Him Who suffered for thy sake, that He deliver thee from grievous circumstances as the sacred disciples manifestly pray for thee, for they emulated the sufferings of His flesh.",
        "O disciples of Christ, when ye sit with Him to judge the fate of the innocent, keep my soul from condemnation, though it hath been defiled by unseemly deeds, for ye are my good intercessors and the helpers of the world.",
        "The world hath acquired thee as a divine bulwark and foundation, and a goodly refuge, for by thy mediations we are ever delivered from every temptation and oppression, O father Nicholas. Wherefore, in praise we bless thee with faith.",
        "Beset by many evil circumstances, I flee to the broad expanse of thy fervent prayers, O most blessed one. Cause the pain of my soul to cease, I cry to thee; still thou the waves of despair, and calm the turmoil of my mind.",
        "O pure Virgin, all-pure Virgin, palace of Christ, all-holy Virgin, who beyond cause and recounting gavest birth to God, the Holiest of the holy: With the holy apostles pray for us all."
      ],
theotokion: "O pure Virgin, all-pure Virgin, palace of Christ, all-holy Virgin, who beyond cause and recounting gavest birth to God, the Holiest of the holy: With the holy apostles pray for us all."
    }
  }
},
            5: {
  metadata: {
    day:             "Friday",
    theme:           "The Precious and Life-creating Cross and the Theotokos",
    canons:          ["Canon of the precious and life-creating Cross", "Canon of the all-holy Theotokos"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross then Canon of the Theotokos per ode, in source order; theotokion: final theotokion of the ode sequence; Ode 8 theotokion null per rule",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. II (Tones III & IV), St. John of Kronstadt Press",
    pages:           "59–65",
    verified:        true
  },
  odes: {
    1: {
      irmos: "The sun once passed over dry land born of the deep, for the water became firm as a wall on either side when the people traversed the sea, chanting in God-pleasing manner: Let us sing unto the Lord, for gloriously hath He been glorified!",
      troparia: [
        "Making the waves of the sea solid by the staff of Moses, Thou didst lead the people across, prefiguring Thy Cross, O Compassionate One, whereby Thou hast parted the water of falsehood and led over to the land of divine knowledge all who hymn Thy power with faith.",
        "O Thou Who created the deep by Thy command, Who with strength didst cover Thy chambers with waters and suspend the earth upon the waters: Thou didst hang suspended upon the Cross, yet didst shake all creation; and Thou dost establish the hearts of all in the fear of Thee.",
        "By thy divine entreaties, O Virgin, grant me cleansing of transgressions; for thy supplication is powerful, O all-pure one, and thou deliverest those who honor thee from offenses, the passions, tribulations and evil circumstances.",
        "With the waters of thy prayers, O Virgin, bedew my lowly soul, which hath withered under the burning heat of my countless offenses and passions, that, having received divine coolness, I may in hymns magnify thee as my fervent intercessor."
      ],
      theotokion: "As thou hast boldness before thy Son to pray earnestly for us, O all-pure one, by thy supplications tear apart the record of my sins and transgressions, for thee do we Christians have as a helper."
    },
    3: {
      irmos: "O Lord, Thou confirmation of those who trust in Thee, establish the Church which Thou hast acquired with Thy precious blood.",
      troparia: [
        "Possessing a single compound composition, O Word, Thou didst endure a most ignominious crucifixion. Yet vouchsafe honor unto those who honor Thee.",
        "The curse of mortal men was abolished when Thou, O Master, wast accursed and poured forth blessing through the Cross.",
        "Quickly open unto me the compassion of thy lovingkindness, I pray, O all-pure Theotokos, and show thyself to me as a fervent helper and salvation amid temptations.",
        "Deliver me from every cruel tempest of sin which besetteth me, thy servant, O all-pure one, and by thy supplications guide me to the harbor of salvation."
      ],
      theotokion: "O pure Virgin Mother, save me from the filthy effluvia of my passions, which now surround my lowly soul and oppress it."
    },
    4: {
      irmos: "Thy virtue hath covered the heavens, O Christ; for having issued forth from Thine immaculate Mother, the ark of Thy holiness, Thou hast appeared in the temple of Thy glory as a babe borne in arms, and all things have been filled with Thy praise.",
      troparia: [
        "As the new Adam, Thou alone didst set aright the fall of Adam when, as Thou didst will, Thy hands were nailed to the Cross and Thou wast beaten with the reed and didst taste of vinegar and gall, O Thou Who transcendest the heights of Thy kingdom.",
        "O Word of God, the prophet foresaw Thee as sheep and sacrifice, as a lamb who struggled not, neither cried out; for Thou didst willingly endure crucifixion, that Thou mightest deliver and save those who have sinned of their own will, O loving Lord.",
        "Grant me a torrent of tears, O good one, and therewith quench the furnace of my passions, and wash away all the defilements of my soul, O Theotokos.",
        "O pure Mistress, mighty helper of the world: Cast me not away from thee, neither banish me in disgrace from thy presence, nor show me to be the object of the demons' jubilation."
      ],
      theotokion: "Wretch that I am, I am wholly denuded of godly works and have been riddled with the sharp arrows of pleasures and wounded; wherefore, I cry to thee, O Mistress: Save me, O all-pure one!"
    },
    5: {
      irmos: "In a vision Isaiah beheld God exalted upon a throne borne aloft by angels of glory, and he cried: O accursed am I, for I have beheld beforehand the incarnate God, the unwaning Light, Who reigneth with peace!",
      troparia: [
        "Falling asleep on the Tree, O Master, Thou didst grant peace unto me who am weighed down by the burden of transgressions; and having suffered reproach, O Word, Thou didst take away my reproach. I hymn Thy might and divine sufferings, O Jesus.",
        "Thou didst light Thy flesh on the Cross as it were a torch, and didst search for the lost coin, O Thou Who lovest mankind; and Thou callest all Thy friends, all Thy hosts, to the finding thereof. We hymn the might of Thy kingdom, O Christ!",
        "O pure Virgin, who hast given peace to the world and salvation to all, in that thou gavest birth to divine Peace, with the fear of Christ the Savior bring an end to the present aggression of the passions of my soul and body.",
        "In thy lovingkindness heal my soul, which is sick of sin, O all-pure one, and, guiding me vouchsafe that in humility I may ever do the commandments of thy Son, that I may receive His goodness."
      ],
      theotokion: "O pure Bride of God, quickly remove from me the wounds inflicted upon me by the enemies who war against me, for, wretch that I am, I can no longer bear their assaults, their great wickedness and insolence; yet haste thou to deliver me."
    },
    6: {
      irmos: "The elder, beholding with his own eyes the salvation which hath come to me from God, cried out to Thee, O Christ: Thou art my God, Who art the Master of life and death!",
      troparia: [
        "Like a lamb Thou wast slaughtered of Thine own will, O Christ, leading back to life him who of his own will was slain by the fruit of the tree.",
        "When Thou wast uplifted upon the Cross the deception of the demons collapsed, and the multitude of the faithful was raised up, hymning Thee, O Bestower of life.",
        "O Virgin, thou divine vine, who produced the beautiful Grape Who giveth divine drink unto men's souls: Deliver my soul from the draught of bitterness, the drunkenness of passions and pleasures, and everlasting fire.",
        "O all-pure Bride of God, out of the mire of sins pull me who have fallen into the mud of the passions; and having cleansed me of the defilements of the passions with the streams of thy supplications, clothe me in the splendid robe of salvation."
      ],
      theotokion: "O pure one, thou divine vine, having given peace to the world and salvation to all, in that thou gavest birth to the divine Peace, with the fear of Christ the Savior bring an end to the onslaughts of the passions of my soul and body."
    },
    7: {
      irmos: "We hymn Thee, God the Word Who bedewed the theologizing children in the fire and dwelt within the incorrupt Virgin, and piously we chant: Blessed is the God of our fathers!",
      troparia: [
        "O Master Who art One of the Trinity, Thou wast lifted up upon the cedar, the pine and the cypress, and didst raise up those who had fallen into the depths of many pleasures. Blessed is the God of our fathers!",
        "By Thy precious blood Thou didst cleanse creation of the blood offered to the vile demons, O Lord; and when Thou wast slaughtered like an innocent lamb, O Word of God, Thou didst abolish their abominable sacrifices. Glory to Thy dominion!",
        "Seeing Him crucified on the Tree Who took flesh of her virginal blood, O all-pure one, she who is more exalted than the heavens cried out, weeping: O Sun of glory, Thou hast set from before mine eyes, bringing light to those in darkness!",
        "O all-pure one, thou gavest birth in time unto Him Who transcendeth time, Who by His bonds freeth first-created Adam from the bonds of time, and bindeth him to Himself with the bonds of His sweet love."
      ],
      theotokion: "O all-pure one, thou gavest birth in time unto Him Who transcendeth time, Who by His bonds freeth first-created Adam from the bonds of time, and bindeth him to Himself with the bonds of His sweet love."
    },
    8: {
      irmos: "United in the unbearable fire, yet unharmed by its flame, the pious youths chanted a divine hymn in intercession: Bless the Lord, all ye works of the Lord, and exalt Him supremely for all ages!",
      troparia: [
        "The disobedient and foolish people condemned Thee to death, Who in Thy right obedient character didst desire to be crucified, O Word, that Thou mayest give life to those dead in will, who hymn and exalt Thee supremely forever.",
        "Stretching out Thy hands upon the Cross, O Master, Thou didst heal the hands of the first-created man, which stretched out unrestrainedly to pluck the fruit of the tree; and seeing Thee, the sun hid its rays in fear and all creation trembled.",
        "O cloud of the Light Who fashioned the great luminaries in the universe: with thy rays dispel all the darkness, day and night, of all my passions and transgressions, and show me to be a child of the light, O Theotokos.",
        "By the Rain which descended from heaven into thy womb, O Theotokos, enlighten and bedew my soul and heart, and extinguish the flame of passions and sorrows, that I may glorify thee fervently for all ages."
      ],
      theotokion: null
    },
    9: {
      irmos: "In the shadow and the writings of the law do we behold an image, O ye faithful: every male child which openeth the womb is consecrated to God. Wherefore, we magnify the firstborn Word of the unoriginate Father, the firstborn Son of the Mother Who knew not man.",
      troparia: [
        "Nailed to the Cross, O Jesus Christ Who founded the whole earth upon nothing, Thou art good have pity and draw me forth, who by my wicked character am become stuck in the mire of sin, for by Thine ignominious death Thou hast brought honor to me, O greatly Merciful One.",
        "Though Thou art God Who is invisible by nature, yet didst Thou become visible, exalted in the flesh, that Thou mightest deliver the visible world from the invisible foe, O Christ, and make heavenly those who are below, who glorify the dominion of Thy great authority.",
        "Having cleansed my mind of the defilement of passionate thoughts, O pure one, clothe me in the splendid robe of dispassion.",
        "Open unto me the divine gates of repentance, O Virgin, shutting the gates of my passions and pleasures, closing them by thy power.",
        "Hearken unto the sound of my groaning and the voice of my weeping, O most immaculate Virgin, and grant cleansing and salvation to my wretched soul.",
        "I am wholly in despair, wretch that I am, and am filled with consternation as I ponder my wicked deeds. Freely have pity on me, O Mistress, and save me!"
      ],
theotokion: "I am wholly in despair, wretch that I am, and am filled with consternation as I ponder my wicked deeds. Freely have pity on me, O Mistress, and save me!"
    }
  }
},
            6: {
  metadata: {
    day:             "Saturday",
    theme:           "All Saints and the Departed",
    canons:          ["Canon of the holy martyrs, hierarchs, the venerable and the departed", "Canon of the Departed"],
    flatteningOrder: "Canon of All Saints irmos governs; troparia: Canon of All Saints then Canon of the Departed per ode, in source order (Nekrosima included in source order); theotokion: final theotokion of the ode sequence; Ode 8 theotokion null per rule",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. II (Tones III & IV), St. John of Kronstadt Press",
    pages:           "69–75",
    verified:        true
  },
  odes: {
    1: {
      irmos: "By the staff Israel of old crossed the cloven sea as though on dry land, for, moving in the form of the Cross, it manifestly prepared a way. Wherefore, let us chant in praise to our wondrous God, for He hath been glorified!",
      troparia: [
        "O Christ Who by Thy burial didst slay death and cast down the tyranny of hades, ascending into the heavens as our forerunner, with Thyself Thou didst raise up the choir of the passion-bearers. Grant rest now unto the souls of those who have passed over to Thee.",
        "Ye found the glory of martyrdom, O all-wise athletes and passion-bearers, and bravely endured multifarious tortures; wherefore, ye are ever glorified.",
        "Tending the flock of the Lord well with power divine, ye were shown to possess a most exalted manner of life, O divine ministers, all-wise initiates of the mysteries of the incarnate Word.",
        "Having crucified yourselves to the world, ye rejected all the carnal passions, O venerable ones, and, revealed as vessels of the Spirit, with divine power together ye destroyed the spirits of deception.",
        "Nekrosimon: Granting endless life and never-waning light unto those who with pious faith have passed from the earth at Thy command, O Compassionate One, grant rest unto them, in that Thou art good.",
        "Let us hymn the pure Theotokos, who gave birth unto God Who by His own death hath overthrown our death, and poured forth life which waxeth not old and abiding blessedness."
      ],
      theotokion: "Let us hymn the pure Theotokos, who gave birth unto God Who by His own death hath overthrown our death, and poured forth life which waxeth not old and abiding blessedness."
    },
    3: {
      irmos: "O barren and sterile soul, acquire thou right glorious fruit, and cry out in gladness: I have been made steadfast by Thee, O God! There is none so holy or so righteous as Thee, O Lord!",
      troparia: [
        "Strengthened by the power of God, O glorious martyrs, ye utterly destroyed the pernicious power of the enemy who is mighty in evil, and ye have received divine crowns of victory.",
        "O Christ our Master, Who revealed the venerable as victors over the enemy, and didst consecrate the holy hierarchs with all-holy anointing: At their entreaties sanctify and enlighten those who hymn Thee.",
        "With all the prophets we praise the choir of the godly women who shone forth in fasting and suffered with faith, trampling down the greatly crafty enemy.",
        "Nekrosimon: Those whom Thou hast taken from among us by Thy divine will, O compassionate Christ, do Thou number with the saints through the supplications of Thy holy ones, overlooking the transgressions they committed in this life.",
        "We who have been saved by thy holy birthgiving with faith cry out to thee the salutation of Gabriel, 'Rejoice!'; and we pray: In thy supplications ask forgiveness for us all."
      ],
      theotokion: "We who have been saved by thy holy birthgiving with faith cry out to thee the salutation of Gabriel, 'Rejoice!'; and we pray: In thy supplications ask forgiveness for us all."
    },
    4: {
      irmos: "O pure one, Habbakuk foresaw thine all-pure womb as a mountain overshadowed; wherefore, he cried aloud: God cometh from Thæman, the Holy One from a mountain overshadowed and densely wooded.",
      troparia: [
        "Slaughtered of your own will like lambs, O wise athletes, ye all brought yourselves like sheep to the Lamb, the Word of God, Who on the tree of the Cross was well-pleased to be slain for the human race.",
        "With the venerable let us honor the right glorious chief hierarchs, who were lamps unto the faithful; for they dispelled the profound darkness of heresy and the passions, and with faith have passed over to the never-waning Light.",
        "With the beauty of their words the divinely eloquent prophets enlighten the souls of the faithful; and with the splendors of their struggles and the dawning of their miracles the God-bearing women illumine their hearts.",
        "Nekrosimon: Those who have departed this life do Thou reveal as sharers in heavenly glory, O good Word of God, granting them deliverance from the transgressions they committed on earth in knowledge and in ignorance.",
        "Let us hymn the most hymned Mother of the Lord, the glory of the martyrs, the divine adornment of holy hierarchs and the venerable, the confirmation of the faithful, and the proclamation of the prophets."
      ],
      theotokion: "Let us hymn the most hymned Mother of the Lord, the glory of the martyrs, the divine adornment of holy hierarchs and the venerable, the confirmation of the faithful, and the proclamation of the prophets."
    },
    5: {
      irmos: "With Thy never-waning light, O Christ God, illumine my lowly soul, and guide me to the fear of Thee, to the light of Thy commandments.",
      troparia: [
        "Your stripes and wounds inflicted incurable wounds upon the enemy, but they now heal the wounds of all the faithful, O athletes of the Lord.",
        "Let us hymn the multitude of the venerable, let us bless the holy hierarchs of Christ, and let us honor His prophets, who ever pray now in our behalf.",
        "Loving God Who became incarnate for our sake, the most glorious women, who with upright character suffered and fasted, abide now in the heavens.",
        "Nekrosimon: Amid the sustenance of paradise, in the land of the living, where Thy light shineth, O Christ, settle Thy faithful servants, whom Thou hast brought over from the earth.",
        "God became incarnate of thee, O all-pure one, and hath now shown thee to be more exalted than the angels and higher than all creation; wherefore, we hymn thee, O Mistress."
      ],
      theotokion: "God became incarnate of thee, O all-pure one, and hath now shown thee to be more exalted than the angels and higher than all creation; wherefore, we hymn thee, O Mistress."
    },
    6: {
      irmos: "The abyss of the passions and the tempest of contrary winds have risen up against me; but going before me, save me, O Savior, and deliver me from corruption, as Thou didst save the prophet from the beast.",
      troparia: [
        "Let the luminaries of the honored Church, the most sacred and most glorious athletes of Christ, the Lamb and Shepherd, be honored with sacred hymns.",
        "The assembly of the venerable, who exalted God in humility, hath been exalted, and the multitude of the holy hierarchs hath been glorified in good works, glorifying the Holy Trinity.",
        "Full of courageous valor, the choir of sacred women hath wounded the iniquitous foe by showing forth divine miracles and by their perfect endurance of pangs.",
        "Nekrosimon: Those whom Thou hast taken from us, O Savior, do Thou cause to dwell in the bosom of Abraham, and give them rest with all the elect, for they cry out to Thee: Thou art our God, and none is righteous save Thee, O Lord.",
        "O all-pure one, thou art the boast of the martyrs, the prophets and the venerable, and the righteous of ages past; wherefore, with them we honor thee with joyful voices, O Theotokos."
      ],
      theotokion: "O all-pure one, thou art the boast of the martyrs, the prophets and the venerable, and the righteous of ages past; wherefore, with them we honor thee with joyful voices, O Theotokos."
    },
    7: {
      irmos: "The three children in the furnace formed an image of the Trinity: they trampled the threat of the fire underfoot and cried aloud, chanting: Blessed art Thou, O God of our fathers!",
      troparia: [
        "Standing in the midst of the fire, O all-glorious passion-bearers of the Lord, ye received divine dew from heaven; and slain by tortures, ye rendered the greatly crafty foe dead.",
        "O divine and holy hierarchs, as helmsmen of the ship of the Church of Christ ye kept it from foundering, truly escaping the evil waves of deception.",
        "O true ascetics who mortified the flesh with sacred struggles, ye have inherited the life of dispassion, which waxeth not old, chanting: Blessed art Thou, O Lord God of our fathers!",
        "Nekrosimon: Those whom Thou hast taken from us, O Savior, do Thou cause to dwell in the bosom of Abraham, and give them rest with all the elect, for they cry out to Thee: Thou art our God, and none is righteous save Thee, O Lord.",
        "O Theotokos, thou glory of the martyrs, the venerable and the righteous, free us from all the tyranny of the evil one."
      ],
      theotokion: "O Theotokos, thou glory of the martyrs, the venerable and the righteous, free us from all the tyranny of the evil one."
    },
    8: {
      irmos: "O ye heavens of heavens, O earth, ye mountains and hills, O abyss, ye whole generation of mankind, with hymns bless God Who is glorified unceasingly by the angels in the highest, and exalt Him supremely as Creator and Deliverer for all ages.",
      troparia: [
        "Sorely beset by the endurance of wounds and the infliction of pangs, ye did not deny the true Life, O passion-bearers of the Lord, nor did ye offer worship to graven images, a wicked deception.",
        "O lamps of the honored virtues, set upon lampstands, ye illumine the souls of all, dispelling all darkness, O passion-bearers who work sacred deeds, who dwell with the celestial intelligences.",
        "Let the right laudable prophets, the company of the righteous and the right glorious multitude of all the reverent women, who pray to God the Savior in our behalf, be hymned as is meet.",
        "Nekrosimon: O Thou Who hast dominion over the living, the faithful whom Thou hast taken from the earth do Thou settle with the saints in the light of Thy countenance, O Savior, granting them forgiveness of transgressions in Thy great lovingkindness.",
        "As is meet, let the greatly hymned Virgin, the proclamation of the prophets, the adornment of holy hierarchs, passion-bearers and the venerable, and the joy of holy women, be hymned forever."
      ],
      theotokion: null
    },
    9: {
      irmos: "On Mount Sinai Moses beheld in the bush thee who without being consumed didst conceive the fire of the Godhead within thy womb. Daniel beheld thee as the unquarried mountain. And Isaiah cried aloud: Thou art the rod sprung forth from the root of David!",
      troparia: [
        "Ye brought yourselves like lambs to Him Who was slain for our sake, and filled the divine choirs of the angels with joy, O passion-bearers of Christ; wherefore, by your supplications make all steadfast and deliver them from the harmful deception of the enemy.",
        "Possessed of the Word of life, like lamps ye enlightened men's souls, O most sacred hierarchs of Christ who share in divine glory; for, having received the fire of the Spirit, O venerable ones, ye utterly consumed the passions and abolished the immolation of idolatrous sacrifices.",
        "Let us honor the holy prophets and the multitude of the venerable, who in their pure life shone forth before the law and under the law; and let us praise the choirs of holy women, and cry out: By their supplications, O Lord, save us all!",
        "Nekrosimon: Thy burial and resurrection became life for all; wherefore, with boldness we cry out to Thee: Grant rest with all the elect unto the faithful whom Thou hast taken to Thyself, forgiving all their offenses, in that Thou art the all-good God.",
        "O Theotokos, thou glory of the martyrs, thou boast of the venerable, adornment of the angels and all the prophets, and salvation of the faithful, be hymned forever."
      ],
      theotokion: "O Theotokos, thou glory of the martyrs, thou boast of the venerable, adornment of the angels and all the prophets, and salvation of the faithful, be hymned forever."
    }
  }
}
        },

4: {
            1: {
  metadata: {
    day:             "Monday",
    theme:           "Repentance and the Bodiless Powers",
    canons:          ["Canon of Repentance to our Lord Jesus Christ and His martyrs", "Canon of the Incorporeal Hosts"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Incorporeal Hosts per ode, in source order; theotokion: final theotokion of the ode sequence; Ode 8 theotokion null per rule",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. II (Tones III & IV), St. John of Kronstadt Press",
    pages:           "79–84",
    verified:        true
  },
  odes: {
    1: {
      irmos: "I will open my mouth, and the Spirit will inspire it, and I will sing a hymn to the sovereign Mistress, and I shall be seen as one who rejoiceth, and I will sing of her wondrous works with gladness.",
      troparia: [
        "Grant me tears, O Christ my God, as Thou didst once grant them to the sinful woman, and like her may I wash Thy feet with them, which have led me on the path of salvation.",
        "Wretched and shameless is my soul, for it hath surrendered itself entirely to sin and hath not acquired even one virtue. But do Thou, O Physician of souls, heal me.",
        "O most lauded martyrs, whose blood hath sanctified the streams and watered the Church of Christ as a garden, fragrant with the blossoms of your virtuous deeds: Pray for our souls.",
        "With the droplets of your blood, O passion-bearers, ye quenched the coal of ungodliness; and with the dew of the Spirit, now co-dwellers with the angels, ye refresh the souls of the faithful.",
        "The noetic intelligences, perpetually moved in a circle round the Primal Beauty, by divine love are drawn thereto; and their movement is without ceasing.",
        "O radiant servants of the radiant God, illumine my mind which hath been darkened by the passions, that with pure heart I may hymn the one Godhead in three Hypostases."
      ],
      theotokion: "O Mother of God, thou art the true vine which budded forth the Cluster of life. Thee do we entreat: Intercede, O Lady, with the apostles and all the saints, that He have mercy on our souls."
    },
    3: {
      irmos: "O Lord, Who hast fashioned the vault of heaven without hands and hast founded the Church, do Thou build me up in Thy love, O Height of heights, O Thou Who art the fulfilment of all that the faithful desire.",
      troparia: [
        "Heal the wounds of my soul, O Christ, and sanctify me entirely, that I may worthily hymn and glorify Thine immeasurable majesty.",
        "Pierce my heart with the fear of Thee, O Lord, that fleeing evil I may ever do Thy will and be saved.",
        "O ye God-bearing martyrs, who fought manfully against the invisible and visible enemies: Heal the infirmities of my soul by your supplications.",
        "O holy passion-bearers, ye endured pains, chains and divers tortures for Christ; wherefore, ye have received the glory of the kingdom of heaven.",
        "The bodiless natures, more brilliant than the sun, surrounded the divine throne and send forth the holy and glorious hymn, the Trisagion.",
        "The legions of the bodiless ones stand in awe before the divine throne, cry out: Holy! and send forth the thrice-holy cry to the Trinity."
      ],
      theotokion: "O Theotokos, thou art the vine which hath blossomed with the undying Cluster, Christ our God. Him do thou entreat, that He save from corruption the souls of those who with faith and love magnify thee."
    },
    4: {
      irmos: "Thou hast come from the Virgin, neither a mediator nor an angel, but Thyself made flesh, O Lord, and hast saved me, the whole man; wherefore, I cry to Thee: Glory to Thy power, O Lord!",
      troparia: [
        "Thou didst become poor for me, O Lord, assuming my poverty, that Thou mightest enrich me with Thy divinity. O incomprehensible depth of Thy condescension! Glory to Thy power, O Lord!",
        "Thou, O Christ, the Creator, didst condescend to become a creature, not undergoing change in Thy nature; but assuming human nature Thou didst make it one with Thy divine nature. Glory to Thy power, O Lord!",
        "Let us hymn the sacred chorus of the martyrs which shone forth with the light of faith, which vanquished the deceit of the enemies, and which now unceasingly prayeth for our souls.",
        "O victorious athletes and glorious martyrs of Christ, who endured tortures with long-suffering and received crowns of victory: Preserve us by your supplications from every harm and temptation.",
        "The bodiless powers, which surround the divine and unapproachable throne of the Master, send forth with trembling the dread hymn: Holy is the Lord our God!",
        "The divine angels, who are filled with the divine lightning flashes of God, radiate light and are immaterial, purifying and enlightening our souls."
      ],
      theotokion: "O all-pure one, thou art the noetic paradise planted from the east, in which was planted the divine and life-giving Tree, Christ our God, from Whom, having eaten, we shall live and not die as did Adam of old."
    },
    5: {
      irmos: "O Lord God, Thou art my God; I will rise early unto Thee, and in Thy name will I lift up my hands, that I may hymn Thy might.",
      troparia: [
        "O Christ, Thou art the Way and the Truth; guide me in Thy paths and lead me back from the deception of the adversary, that I may hymn Thy might.",
        "Enlighten the eyes of my heart, O Christ, that I may understand the breadth and length and height of Thy love for man, and may hymn Thy might.",
        "In hymns let us praise the assemblies of the righteous passion-bearers, who are near to God and who have received the grace to intercede for our souls.",
        "Crowned with the crown of martyrdom, ye stand before the throne of the Trinity, interceding for those who honor your memory, O all-wise passion-bearers.",
        "The immaterial powers, surrounding the divine throne on high, cry out: Holy! and send forth a thrice-holy hymn to the Trinity that is one in essence.",
        "O holy angels, who are enlightened by the rays of the divine Light, illumine me who have been darkened by the passions of sin, that I may hymn the might of God."
      ],
      theotokion: "O Lady, thou art the gate through which the Word passed at His coming to us; thou didst remain a virgin after giving birth; and thou dost ever intercede for the salvation of our souls."
    },
    6: {
      irmos: "Beholding the depths of the sea of divine providence, and seeing the miracle of God becoming man, I cry with the prophet Habakkuk in fear: Glory to Thy power, O Lord!",
      troparia: [
        "Beholding the depth of my falls and the abyss of my evils and transgressions, I am sore afraid and flee to Thee, O Lord, crying: Glory to Thy power, O Lord!",
        "Grant me the grace of repentance, O compassionate God, as Thou didst grant it to the woman who was a sinner; for my sins are more numerous than hers. Glory to Thy power, O Lord!",
        "O passion-bearers, who are the weapons of God and armour of the faithful, overthrow the invisible enemies and the warring powers of darkness by your supplications.",
        "Having passed through the sea of life unharmed, O blessed passion-bearers, ye have reached the calm harbour of the kingdom; and ye guide thither those who honour you.",
        "The bodiless angels stand with fear before the divine throne and, beholding the unapproachable glory of God, send forth the doxology: Glory to Thy power, O Lord!",
        "O good angels, who are ever enlightened by the rays of the divine goodness, as ministers and servants of God, illumine our darkened souls."
      ],
      theotokion: "O Theotokos who knewest not wedlock, thou art the living temple of the King Who created all things; none shall enter through thee save only the Lord Who took flesh of thee and hath saved all."
    },
    7: {
      irmos: "We sing to Thee, O holy Lord, for Thou hast enlightened and saved us; we worship Thee, O Word of God incarnate, who with the Father and the Spirit art one God.",
      troparia: [
        "I have sinned more than any man, O Christ, and more than any man have I angered Thee; but as the compassionate One save me by Thy compassion, for Thou alone art sinless.",
        "I have not turned back from evil, but have been led astray by pleasures; not for a moment have I practised virtue, O my Savior. But as the merciful God, have mercy upon me.",
        "O precious passion-bearers of Christ, who are more radiant than the stars of heaven: With the immaterial powers pray for those who hymn your sacred memory.",
        "Ye bore your sufferings in the flesh with faith, O passion-bearers, and ye offered yourselves as a living sacrifice, well-pleasing to Christ; and now ye reign with Him in heaven.",
        "O angels who stand before God and look upon the glory of the Most High: With your radiance illumine those who with faith praise your sacred order.",
        "The ranks of the bodiless ones, which stand before the divine throne with fear and trembling, unceasingly send forth praise to the Trinity, crying: Holy art Thou, O God!"
      ],
      theotokion: "O thou who knewest not wedlock but didst conceive and give birth in manner past understanding, remaining a virgin, O Theotokos: Intercede for us with the God Who became incarnate of thee."
    },
    8: {
      irmos: "Him Whom the armies of heaven glorify, and before Whom cherubim and seraphim tremble, let every breath and all creation hymn, bless, and exalt above all forever.",
      troparia: [
        "O compassionate God, overlook the multitude of my transgressions; and as Thou didst accept the publican who repented, so accept me who repent; and count me worthy of salvation.",
        "O all-seeing Christ, Who knowest the nature of man and hast compassion on our infirmity: By Thine ineffable mercy grant forgiveness of sins to those who with faith hymn Thee.",
        "O holy passion-bearers, whose radiant assembly outshines the sun: Grant us forgiveness of sins by your supplications, O ye who now reign with the King of all.",
        "Filled with the heavenly light of the grace of the Holy Spirit, O passion-bearers, ye shone forth on earth and now ye shine more brightly in the heavens, praying for our souls.",
        "The heavenly powers, the seraphim and cherubim and all the ranks of the angels, trembling stand before the throne of God and send forth the thrice-holy cry.",
        "O angels, who minister before the divine throne and behold the unutterable glory of the Master: Pray for us who are held fast in the passions of this fleeting life."
      ],
      theotokion: null
    },
    9: {
      irmos: "Every earthly creature rejoice, illumined by the Spirit; and let the nature of the bodiless intelligences celebrate the honorable feast of the Mother of God and cry: Rejoice, O most blessed Theotokos pure Ever-virgin!",
      troparia: [
        "O Christ, do Thou Thyself forgive me my transgressions, as Thou didst forgive the harlot of old, and count me worthy of the kingdom of heaven in Thy compassion, for Thou art good.",
        "Cleanse me, O Lord, from all defilement of flesh and spirit, and make me a vessel of Thy divine grace, O Thou Who in Thy compassion dost purify those who with faith draw nigh unto Thee.",
        "O passion-bearers, who have gone on before us into the heavenly mansions and now stand before the throne of the King of all: Pray earnestly for those who hymn your radiant memory.",
        "O God-bearing martyrs, who bravely fought the good fight and subdued the might of the enemies by your faith: Grant peace to those who hymn you and pray for your aid.",
        "The ranks of the bodiless intelligences, which are ever illumined by the rays of the divine Light and stand before the throne of God: Ask for us peace and great mercy.",
        "O ye bodiless angels, who stand before the awesome throne of God and are filled with His divine Light: Deliver from evil those who with faith bless your holy memory."
      ],
      theotokion: "O Theotokos, thou didst give birth to the Word Who is before the ages and Who hath renewed the nature of man, which had grown old in sin; Him do thou entreat without ceasing, that He save and illuminate our souls."
    }
  }
},
2: {
  metadata: {
    day:             "Tuesday",
    theme:           "Repentance and the Martyrs; the Holy Forerunner",
    canons:          ["Canon of Repentance to our Lord Jesus Christ and His holy martyrs", "Canon of the holy and great John the Forerunner"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Forerunner per ode, in source order (Martyricon troparia excluded); theotokion: final theotokion of the ode sequence; Ode 8 theotokion null per rule",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. II (Tones III & IV), St. John of Kronstadt Press",
    pages:           "104–109",
    verified:        true
  },
  odes: {
    1: {
      irmos: "O Thou Who smote Egypt and drowned the tyrant Pharaoh in the sea, Thou didst save from slavery the people who like Moses chanted a hymn of victory, for Thou hast been glorified.",
      troparia: [
        "Do not openly denounce me who commit acts of darkness in secret, neither put me to shame before all men; but shine forth upon me the light of sincere repentance, O Savior, and save me.",
        "Prodigal as I am, I ever heap sins upon sins and never sense the fear of Thee, O Master; wherefore, save me before mine end, and have pity on me, O Lord.",
        "Preceding the Sun like a great star, thou didst enlighten the earth with thy radiance, O Baptist; wherefore, I cry unto thee: Enlighten my heart, which hath been blinded by the cruel darkness of my countless transgressions.",
        "O blessed one, in thy nativity thou didst once release thy mother from barrenness; wherefore, I beseech thee: By thy supplications show my soul, which is become empty through unfruitfulness, to be fruitful, bringing forth the virtues as goodly children."
      ],
      theotokion: "Thou didst prepare the ways of the Deliverer, achieving the power of Elijah, O ever-glorious Baptist. By thy supplications direct the movement of my soul unto Him, removing every stumbling-block and the flame of the passions."
    },
    3: {
      irmos: "O Lord Who dost establish the thunder and formest the wind: make me steadfast, that I may hymn Thee in truth and do Thy will; for none is as holy as Thee, O our God.",
      troparia: [
        "O Christ Who enlightened the eyes of blind men, enlighten mine eyes, which have grown dim through pleasures and the griefs of life, and which never look to thy judgments.",
        "Lo! the time is come! Awake from the evils thou hast committed, O my soul, and cry out with fear to the Master and Deliverer: Open unto me the doors of repentance, O Christ!",
        "Thou didst stand in the currents of the Jordan, baptizing the Master Who taketh away the sins of all men. Him do thou never cease to entreat, O Forerunner, that He have pity on our souls.",
        "O Forerunner, thou wast shown to be a preacher of repentance, wherein do thou keep my heart, which hath been defiled by harmful sins and hath no recovery."
      ],
      theotokion: "Thou didst assuage the grief of our first parents by giving birth for us to Joy, the Bestower of life and Deliverer, O all-holy Theotokos. Him do thou earnestly entreat, that He save our souls."
    },
    4: {
      irmos: "I heard report of Thee, O God, and I was afraid; I understood Thy works, O Lord, and I was filled with awe, for the earth is full of Thy praise.",
      troparia: [
        "Stripped bare of the virtues, I have clothed myself in evil, and, lo! I am filled with shame. O Jesus Who lovest mankind, make me bright with divine vesture.",
        "Navigating the waters of the sea of life, O Word, through slothfulness I have fallen into the misfortune of the shipwreck of bodily pleasures; but guide me to the harbor of repentance.",
        "As thou art the mediator between the Old and New Covenants, O Forerunner, by thy supplications renew all of me, who am broken by the pummeling of the deceiver.",
        "By thy divine supplications, O Forerunner, who led a blameless life in the wilderness, renew my mind, which hath been laid waste by all manner of wicked deeds."
      ],
      theotokion: "Thy Son, O Virgin, hath become known as our cleansing and deliverance. Him do thou entreat, that He save the souls of those who bless thee in compunction."
    },
    5: {
      irmos: "Shine forth upon me the light of Thy precepts, O Lord, for my spirit riseth early unto Thee and hymneth Thee: for Thou art our God, and I flee to Thee, O King of peace.",
      troparia: [
        "O Jesus, have pity on me, who in despondency have led a corrupt life, and all the days of my life am benighted by the deceptions of the deceiver.",
        "My heart hath been made lofty by the assaults of the serpent, and I have fallen greatly. O Jesus, Who dost correct the negligent, raise me up and save me, for the sake of Thy many compassions.",
        "O offspring of the wilderness, with the dew of thy supplications preserve me, who am consumed by the assaults of the passions as with the burning coals of the desert, uninjured by their harm.",
        "By thy holy right hand O most blessed one, was the divine Right Hand of the Father baptized, Who saveth us from the hand of the deceiver by thy mediations."
      ],
      theotokion: "O Theotokos, boast of all, Queen of the Orthodox: Cast down the arrogance of the heretics, and put them to shame who neither bow down before nor venerate thy precious icon, O all-pure one."
    },
    6: {
      irmos: "I have been brought down into hades by the abyss of life and my deeds; yet as Jonah cried out from within the sea monster, so do I cry: Lead me up from the depths of evils, I pray, O Son and Word of God!",
      troparia: [
        "I have weighed down my soul with the slumber of negligence, wretch that I am, and am brought low by the sleep of sin. Rouse me to the light of repentance, O Lord, and save me by Thy lovingkindness.",
        "How have I fallen, wretch that I am? How have I withdrawn far from the all-good God? How have I paid no heed in my senses to the dread tribunal at which I must needs be judged? O my Creator, have pity on me!",
        "Thou didst stand in the currents of the Jordan, baptizing Him Who taketh away the sins of all men. O blessed one, in the trackless wilderness thou didst proclaim to souls the coming of the Word Who was to arrive.",
        "O Forerunner, thou wast shown to be a beauteous turtledove and a melodious swallow, O divine Forerunner, heralding the divine springtime of Christ. Him do thou beseech, that He deliver me from the soul-corrupting winter and the tempest of sin, I pray thee."
      ],
      theotokion: "God loved thee, the beauty of Jacob, O Virgin Maiden, through thee adorning all who before had enshrouded themselves in gloom through disobedience."
    },
    7: {
      irmos: "The children of Abraham in the Persian furnace, refusing to worship the golden image, were tried like gold in a crucible; and they joined chorus in the fiery furnace, as in a splendid bridal-chamber, chanting: Blessed art Thou, O God of our fathers!",
      troparia: [
        "Desiring to deliver the world from the age-old condemnation, O Christ, Thou didst reveal Thyself as a young babe, in that Thou art full of lovingkindness; wherefore, I cry out to Thee: Renew me now, who have grown old in many sins, O Compassionate One, and save me who chant: Blessed is the God of our fathers!",
        "O Savior, Who once saved Manasseh who repented, and had pity on the harlot who wept, and didst justify the thief by Thy word, accept me also, who have committed many and grievous sins against Thee, but cry out: Blessed is the God of our fathers!",
        "O blessed one, in the trackless wilderness thou didst proclaim to souls the coming of the Word Who was to arrive; wherefore, the whole Church blesseth thee with unceasing voices.",
        "The images of the law were made clear by thine awesome birthgiving, O Bride of God; and, seeing their fulfillment now, O Mistress, we honor thee fittingly."
      ],
      theotokion: "The images of the law were made clear by thine awesome birthgiving, O Bride of God; and, seeing their fulfillment now, O Mistress, we honor thee fittingly."
    },
    8: {
      irmos: "Once, in Babylon, the children of Abraham trampled upon the flame of the furnace, crying aloud in hymns: O God of our fathers, blessed art Thou!",
      troparia: [
        "Do not openly denounce me who commit acts of darkness in secret, O Savior, but show my soul, which is become empty through unfruitfulness, to be fruitful in the virtues, through Thy goodness.",
        "O Word of God Who art without beginning, turn and save me, who cry: Bless and hymn the Lord, all ye works of the Lord!",
        "O prophet, who wast shown to be greater than all who were born, by thy supplication most great deliver from great flame and everlasting darkness me who have sinned greatly against God, that I may call thee blessed.",
        "I have shown myself to be a barren fig-tree, and fear lest I be hewn down. Make me steadfast by thy mediation, O Forerunner of Christ, and render me fruitful, that I may call thee blessed."
      ],
      theotokion: null
    },
    9: {
      irmos: "The God of Israel hath wrought might with His arm; for He hath cast down the mighty from their thrones and exalted those of low degree, wherein the Dayspring from on high hath visited us, and guided us to the way of peace.",
      troparia: [
        "Like the harlot I noetically clasp Thy feet and bathe them in my tears, O Word. Wash away the mire of the passions, O Savior, saying to me now: 'Thy faith hath saved thee!', that I may hymn Thine incalculable lovingkindness.",
        "Behold! the mystical bridal-chamber hath been opened, and the wise, having replenished their lamps with the oil of the virtues, enter it in splendor. Shake off the sleep of despondency, O my soul, that, bearing thine own lamp, thou mayest enter in with Christ.",
        "O blessed Forerunner John, who in the river's waters didst baptize Him Who taketh away the transgressions of the world: With the streams of thy supplications dry up the abyss of mine evils.",
        "Seeing the Holy Spirit, thou didst hear the voice of the Father bearing witness to Jesus, Who was ineffably baptized by thee, O Forerunner. Him do thou entreat, that He save us."
      ],
      theotokion: "As the Source of our restoration, wholly renew me who have been undone by the sting of the serpent, that I may bless thee with faith and love, O most immaculate Virgin Theotokos."
    }
  }
},
            3: {
  metadata: {
    day:             "Wednesday",
    theme:           "The Precious and Life-creating Cross and the Theotokos",
    canons:          ["Canon of the precious and life-creating Cross", "Canon of the all-holy Theotokos"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross then Canon of the Theotokos per ode, in source order (Martyricon troparia excluded); theotokion: final theotokion of the ode sequence; Ode 8 theotokion null per rule",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. II (Tones III & IV), St. John of Kronstadt Press",
    pages:           "114–119",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Having traversed the depths of the Red Sea with dryshod feet, Israel of old vanquished the might of Amalek in the wilderness by Moses' arms stretched out in the form of the Cross.",
      troparia: [
        "O Jesus Who stretched out the heavens, in that Thou art good and full of lovingkindness Thou didst stretch out Thine own hands, radiantly beckoning to Thee the nations who were far removed from Thee.",
        "Protect me by Thy Cross, O Word my Christ, that I may not fall prey to the wolf, who seeketh my destruction and every day layeth snares and traps for me.",
        "In that thou art more pure than all creation, O all-pure Theotokos, by thy pure supplication purify my heart, which hath been grievously defiled by the impure passions.",
        "By thy God-pleasing prayers to our Creator and God, O all-pure Virgin Mother, deliver me from the tears and sighs that lie before me at the dread judgment which is to come."
      ],
      theotokion: "By thy God-pleasing prayers to our Creator and God, O all-pure Virgin Mother, deliver me from the tears and sighs that lie before me at the dread judgment which is to come."
    },
    3: {
      irmos: "Thy Church rejoiceth in Thee, O Christ, crying aloud: Thou art my strength, O Lord, my refuge and my confirmation!",
      troparia: [
        "Uplifted upon the Cross, O Christ our God, Thou didst lift up those who had been cast down into corruption, and didst cast down the enemy, O Master.",
        "The swords of the enemy were blunted when Thou wast pierced in the side, O hypostatic Word of the Father, and Eden was opened.",
        "In that thou art she who is more pure than all creation, O all-pure Theotokos, by thy pure supplication purify my heart, which hath been grievously defiled by the impure passions.",
        "As thou alone, in manner past understanding, hast by thy birthgiving freed the human race from the curse, O all-pure one, by thine entreaties free me who am enslaved by carnal passions."
      ],
      theotokion: "As thou alone, in manner past understanding, hast by thy birthgiving freed the human race from the curse, O all-pure one, by thine entreaties free me who am enslaved by carnal passions."
    },
    4: {
      irmos: "Beholding Thee lifted up upon the Cross, O Sun of righteousness, the Church stood rooted in place, crying out as is meet: Glory to Thy power, O Lord!",
      troparia: [
        "Seeing Thee, the Sun of glory, uplifted upon the Tree of Thine own will, the sun clothed itself in darkness; the stones split asunder, and the veil of the temple was rent in twain.",
        "When Thou wast crucified and pierced by a spear, O Lord and Savior, at Thy command the sword which barred the way into Eden was withdrawn for the noble thief, who hymneth Thy might.",
        "O all-pure one, who art the divine habitation of the Holy One Who poured forth His benefactions upon His creatures: Sanctify my soul and illumine my thoughts.",
        "By thy supplications, O Mistress, make steadfast my mind, which is hurled about by the wind of evil and is wholly engulfed by slothfulness; and rescue me from my fall."
      ],
      theotokion: "By thy supplications, O Mistress, make steadfast my mind, which is hurled about by the wind of evil and is wholly engulfed by slothfulness; and rescue me from my fall."
    },
    5: {
      irmos: "Thou hast come, O my Lord, as a light into the world: a holy light turning from the darkness of ignorance those who hymn Thee with faith.",
      troparia: [
        "From Thy pierced side, O Master, Thou pourest forth divine streams of incorruption upon me who have stumbled into corruption through the disobedience of Eve and the rib of Adam.",
        "Thy precious Cross is victory over the enemy, which Thou hast given as salvation of soul unto us who hymn Thee with faith, O Word.",
        "From thee, O all-pure one, the fiery and God-bearing bush, O Mistress, burn up the thorns of my wicked thoughts, illumine the thoughts of my soul, and dry up the abyss of my passions.",
        "O Mistress, thou Ewe-lamb who gavest birth to the Lamb of God: Seek out my soul, which hath been led astray by the counsel of the serpent and through disobedience hath become lost in the mountains."
      ],
      theotokion: "O Mistress, thou Ewe-lamb who gavest birth to the Lamb of God: Seek out my soul, which hath been led astray by the counsel of the serpent and through disobedience hath become lost in the mountains."
    },
    6: {
      irmos: "I will sacrifice to Thee with a voice of praise, O Lord, the Church crieth unto Thee, cleansed of the blood of demons by the blood which, for mercy's sake, flowed from Thy side.",
      troparia: [
        "Though higher than all honor, Thou didst endure dishonor, that Thou mightest honor me who have wickedly dishonored myself, O Thou Who lovest mankind; and Thou savest me by Thy Cross.",
        "Thou wast uplifted upon the Cross and didst die, O Lord, making the slayer of my soul dead and full of all shame. And now, O my Creator, I hymn Thy power.",
        "O Virgin, thine Offspring is the Destroyer of death and the Life and Deliverance of those who die; wherefore, I beseech thee: Raise up my soul, which hath been slain.",
        "O Thou Who lovest mankind, at the entreaties of Thy Mother and of the countless hosts on high extend a helping hand unto me, who am bestormed upon the deep of life."
      ],
      theotokion: "O Thou Who lovest mankind, at the entreaties of Thy Mother and of the countless hosts on high extend a helping hand unto me, who am bestormed upon the deep of life."
    },
    7: {
      irmos: "The children of Abraham in the Persian furnace, afire with love of piety more than with the flame, cried out: Blessed art Thou in the temple of Thy glory, O Lord!",
      troparia: [
        "O only Eternal and Immortal One, Who dost array the skies with clouds, and Who didst will to be crucified naked upon the Tree: Thou hast clothed in shame him who of old stripped our forefather naked.",
        "Thou wast lifted up upon the Cross and didst raise up fallen Adam; Thou wast pierced in the side with a spear, O Master, and the greatly crafty one was dealt a mortal blow. Blessed is Thy might, O Lord!",
        "O Maiden, thou divine mountain, from whence the Stone was quarried Who crushed the pillars of the idols: Do away with the graven images of my soul and the stony doubt of my heart.",
        "As the one who received in thy womb Him Whose gaze causeth the earth and all that is on it to tremble when He so desireth, thou wast not shaken, O Maiden; wherefore, make me steadfast, who am shaken by the assaults of the enemy."
      ],
      theotokion: "As the one who received in thy womb Him Whose gaze causeth the earth and all that is on it to tremble when He so desireth, thou wast not shaken, O Maiden; wherefore, make me steadfast, who am shaken by the assaults of the enemy."
    },
    8: {
      irmos: "Stretching forth his hands, Daniel shut the lions' mouths in the pit; and the young lovers of piety, girded about with virtue, quenched the power of the fire, crying out: Bless the Lord, all ye works of the Lord!",
      troparia: [
        "Thou didst extend Thy hands upon the Cross, O Master, desiring to cure of their transgression the unrestrained hands of our first parents; and Thou wast transfixed with nails, O Lord, removing all the passion-fraught understanding of the first-created man, who singeth: Bless the Lord, all ye works of the Lord!",
        "By the piercing of Thy divine side was the record of first-created Adam torn asunder, O Master; and by the drops of Thy blood is the whole earth sanctified, which ever uttereth cries of thanksgiving: Bless the Lord, all ye works of the Lord!",
        "O Theotokos, break asunder the bonds of my transgressions and still the uprisings of my body, cut down mine evil thoughts and quickly cleanse thy servant of secret thoughts, O Theotokos, thou intercessor and help of all the faithful.",
        "O all-pure one, who hast been shown to be the unquarried mountain of God, rich, densely wooded and overshadowed, shield me with the shelter of thy supplications, deliver me from the snares of the hunters, and preserve me from the darts of the demons and from vile thoughts."
      ],
      theotokion: null
    },
    9: {
      irmos: "Christ, the Chief Cornerstone uncut by human hands, Who united the two disparate natures, was cut from thee, the unquarried mountain, O Virgin. Wherefore, in gladness we magnify thee, O Theotokos.",
      troparia: [
        "Behold, the Life of all appeared, hanging on the Cross; and the sun, unable to endure the sight, withdrew its rays, and the earth quaked, but the thoughts of the faithful are made steadfast in piety and purity.",
        "O how hath the iniquitous assembly condemned to die upon the Tree Thee, the Giver of the law, Who art the Life and Lord of all, and Who through Thy sufferings pourest forth immortality upon all men?",
        "O pure one, enlighten my soul, which hath been benighted by sins, and drive away the clouds of mine evils, O cloud of the Light, who of old once beheld the sun dimmed when the Immortal One was crucified.",
        "Sever the bonds of mine evils with the divine spear of thy Son; and loose thou my wretched soul, which is fettered and in distress, O Virgin Mother of our God, and bind it to the love of Him."
      ],
      theotokion: "Sever the bonds of mine evils with the divine spear of thy Son; and loose thou my wretched soul, which is fettered and in distress, O Virgin Mother of our God, and bind it to the love of Him."
    }
  }
},
            4: {
  metadata: {
    day:             "Thursday",
    theme:           "The Holy Apostles and St. Nicholas the Wonderworker",
    canons:          ["Canon of the holy, glorious and all-praised apostles", "Canon of St. Nicholas the holy wonderworker"],
    flatteningOrder: "Canon of the Apostles irmos governs; troparia: Canon of the Apostles then Canon of St. Nicholas per ode, in source order (Martyricon troparia excluded); theotokion: final theotokion of the ode sequence; Ode 8 theotokion null per rule",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. II (Tones III & IV), St. John of Kronstadt Press",
    pages:           "123–128",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Having traversed the depths of the Red Sea with dryshod feet, Israel of old vanquished the might of Amalek in the wilderness by Moses' arms stretched out in the form of the Cross.",
      troparia: [
        "As divine instruments of the Comforter, ever heralding Him with divine exhalations, the right glorious apostles of Christ have played for us a truly salvific song.",
        "O glorious eye-witnesses of Christ, vouchsafe enlightenment unto me who languish on the bed of slothfulness and am grievously wasting away in the death of sin through sickness of spirit.",
        "O apostles who by your discourse loosed the irrationality of the nations, by the grace of the Comforter enlighten my heart, which hath been grievously benighted by irrational acts, O apostles.",
        "Having inherited the life which is devoid of grief, O blessed one, ever filled with spiritual joy drive all grief from my soul, I pray, that, rejoicing, I may glorify thee, O most sacred father Nicholas.",
        "Thou wast set upon the lampstand of exalted virtues, and like a lamp dost enlighten the hearts of the faithful, O holy hierarch Nicholas; wherefore, I entreat thee with faith: With thy luminous supplications drive the darkness from my soul.",
        "O all-wise father, overwhelmed now by the abyss of this corrupt life and divers temptations, fleeing unto thee, I cry: Let me find thee to be a helmsman who by thy divine supplications transformeth the storm into calm."
      ],
      theotokion: "O pure one, who art possessed of ever-vigilant prayer, lull to sleep the passions of our souls by thy sacred mediations, granting us divine and saving watchfulness for the fulfillment of the will of God."
    },
    3: {
      irmos: "Thy Church rejoiceth in Thee, O Christ, crying aloud: Thou art my strength, O Lord, my refuge and my confirmation!",
      troparia: [
        "The currents of Thy disciples, Thy noetic rivers, O God, gladden Thy city with sanctity.",
        "O citizens of heaven, fellow ministers with the noetic ranks, most glorious apostles: Deliver us from all tribulation.",
        "O Christ Who established the apostles, Thy noetic heavens: By their supplications establish me steadfast upon the rock of Thy will, in that Thou art full of lovingkindness.",
        "In that the Mother who gave Thee birth in purity prayeth with the choir of the disciples, O Lord, grant us Thy mercies.",
        "Thou wast shown to be a sword slaughtering the rampaging foe, O Nicholas; wherefore, preserve us unharmed by their temptations, that we may do the will of God.",
        "Heal the broken state of my soul, O holy hierarch who broke all the snares and traps of the enemy, that with faith I may honor thee, mine intercessor."
      ],
      theotokion: "O pure one, who art possessed of ever-vigilant prayer, lull to sleep the passions of our souls by thy sacred mediations, granting us divine and saving watchfulness for the fulfillment of the will of God."
    },
    4: {
      irmos: "Beholding Thee lifted up upon the Cross, O Sun of righteousness, the Church stood rooted in place, crying out as is meet: Glory to Thy power, O Lord!",
      troparia: [
        "Thou didst ride Thy chosen steeds into the sea, O Thou Who lovest mankind, and they roil the waters of false belief, and proclaim to all the true understanding of Thee.",
        "O glorious apostles, ye stars who have enlightened the noetic firmament of the Church with piety: Deliver me from the night of ignorance and transgressions.",
        "Having been shown to be like well-honed arrows, O apostles, quench now the burning arrows of mine evil, and make steadfast my thoughts.",
        "At the supplications of her who gave Thee birth and of Thy sacred apostles, O Christ, with effective remedies heal my soul, which hath been embittered by venom through the sting of the adversary.",
        "Thine all-glorious life, O Nicholas, hath everywhere shown thee to be all-glorious, radiant with divine miracles, the adornment of hierarchs and boast of all who honor thee with hymns of joy.",
        "Resplendent with the divine rays of humble-mindedness, thou didst praise God on thine exalted cathedra, O blessed one, and by thy right acceptable entreaties, O wise father, thou hast caused us to partake thereof."
      ],
      theotokion: "O Theotokos, Queen of all, boast of the Orthodox: Cast down the arrogance of the heretics, and put them to shame who neither bow down before nor venerate thy precious icon, O all-pure one."
    },
    5: {
      irmos: "Thou hast come, O my Lord, as a light into the world: a holy light turning from the darkness of ignorance those who hymn Thee with faith.",
      troparia: [
        "The Cause of all gave you to drink of noetic gladness, O glorious apostles, who art branches putting forth the grapes of life.",
        "O apostles, unto the light of the commandments of God guide those who mindlessly remain in the darkness of despondency of soul.",
        "Deliver us from transgressions of soul and from the judgment which is to come, from corruption and misfortunes, O blessed apostles.",
        "Save me, O God, in that Thou lovest mankind! Save me at the entreaties of her who ineffably gave Thee birth, and of all Thy divine apostles!",
        "Dying, O wise father, thou didst set like the sun, but in Christ thou hast shone forth in the luminous effulgence of thy miracles, illumining the whole world, O Nicholas.",
        "O sacred Nicholas, hearken unto us in these days, when temptations and tribulations befall us, relieving all oppression by the grace of the Spirit Who dwelleth within thee."
      ],
      theotokion: "Beholding thee with noetic eyes, O Virgin, Isaiah cried out: Behold, Jesus the Lord will be born of the Virgin, the divine Maiden, unto the regeneration of men!"
    },
    6: {
      irmos: "I will sacrifice to Thee with a voice of praise, O Lord, the Church crieth unto Thee, cleansed of the blood of demons by the blood which, for mercy's sake, flowed from Thy side.",
      troparia: [
        "O divinely chosen sheep of the good Shepherd, who scattered throughout the world, by faith ye transformed all the bestiality of the wolves into the meekness of lambs.",
        "O apostles, ye right fruitful trees of divine paradise, transform all the barrenness of my soul into the goodly fruitfulness of virtuous ways.",
        "I have been wounded by the sword of the passions and am done to death. O glorious ones, who received from Christ the grace to resurrect the dead, give life to my wretched soul, which hath been slain.",
        "Still Thou the raging storm of my soul, O compassionate God of all, at the entreaties of the Theotokos who gave Thee birth, and of Thine apostles and martyrs.",
        "Thou wast strengthened by the might of the Savior, O divinely wise one, who art able to destroy the invisible foe. By thine entreaties, O father Nicholas, deliver us from his grievous harm.",
        "By thy sacred supplications, O all-glorious Nicholas, deliver us from torment in Gehenna, and from the most harmful oppression of wicked men."
      ],
      theotokion: "Thy people and city entreat thee, O Mother of God: Rescue us from all need, O most holy Mistress, and from eternal damnation in the life to come."
    },
    7: {
      irmos: "The children of Abraham in the Persian furnace, afire with love of piety more than with the flame, cried out: Blessed art Thou in the temple of Thy glory, O Lord!",
      troparia: [
        "With the strength of your most holy preaching, O true apostles of Christ, ye have broken the winter of deception and enlightened the minds of the faithful with the knowledge of God.",
        "Ever pouring forth fragrant myrrh, O divine disciples, fill with the sweet smell of noetic myrrh those who have recourse unto you, and drive away the foul-smelling passions.",
        "O glorious disciples of the incorrupt Word, save me, who am become corrupt through carnal offenses, yet who sing: Blessed art Thou in the temple of Thy glory, O Lord!",
        "The choir of the angels, the choir of the martyrs and Thine apostles, O Word, ever entreat the magnitude of Thy lovingkindness: Through the Theotokos have pity on all, in that Thou art compassionate.",
        "O holy Nicholas, entreat the one Creator of all, Who resteth in the saints, that He sanctify us and send down upon us His rich mercies.",
        "Holy, righteous and meek, gentle and humble, O glorious one, thou didst ascend to the all-glorious heights of the priesthood, working signs and wonders."
      ],
      theotokion: "Put down the uprisings of the passions of my soul, and by thy vigilant supplications grant me watchfulness, O Maiden, driving far away the slumber of despondency."
    },
    8: {
      irmos: "Stretching forth his hands, Daniel shut the lions' mouths in the pit; and the young lovers of piety, girded about with virtue, quenched the power of the fire, crying out: Bless the Lord, all ye works of the Lord!",
      troparia: [
        "O mouths of Christ inspired by the fire of the Spirit, ye who closed the mouths of the unrestrained and spread the preaching of salvation everywhere: Ye have delivered from the mouth of the noetic wolf those who cry out: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "Sound ye the melodious trumpets of Christ round about my deadened soul, O glorious apostles, and raise it up from the grave of despair and despondency, that it may sing: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "At the entreaties of Thy disciples, O Christ, disdain me not, who with depravity of mind have trampled Thy laws underfoot and, a prodigal, have stumbled headlong into the abyss, and am ever in thrall to wicked habits.",
        "Keeping the laws of God, O venerable one, thou wast shown to be a most pure temple of God; wherefore, we cry out: O most blessed one, deliver thy servants from all iniquity!",
        "The military officers, who of old were sentenced to die unjustly, were delivered through thine intercessions, O right wondrous one. Rescue us from all harm as thou didst them.",
        "Thy people and city entreat thee, O Mother of God: Rescue us from all need, O most holy Mistress, and from eternal damnation in the life to come."
      ],
      theotokion: null
    },
    9: {
      irmos: "God the Lord, the Son of the unoriginate Father, hath revealed Himself to us incarnate of the Virgin, to enlighten those in darkness and to gather the dispersed. Wherefore, we magnify the all-hymned Theotokos.",
      troparia: [
        "O apostles, ye chosen stones of the Stone set as the Chief Cornerstone, ye have built up the hearts of all the faithful, toppling the foundations of the enemy with the rock of the Faith.",
        "O apostles, who received from Christ the authority to loose and to bind, loose the bonds of mine evils, bind me to the divine love of God, and cause me to share in the kingdom of God.",
        "O apostles, who received from Christ the authority to loose and to bind, loose the bonds of mine evils, bind me to the divine love of God, and cause me to share in the kingdom of God.",
        "In that I have a soul broken by the passions of life, I call upon thee for help, O sacred Nicholas: Haste thou, and grant me perfect healing, entreating the All-good One!",
        "Like the sun thou sheddest light upon the whole world, O divinely blessed Nicholas, driving away the darkness of grievous circumstances with the radiance of divine miracles through thy sacred mediations, O adornment of hierarchs.",
        "O my soul, be thou mindful of the dread day and hour, when the Master will hail thee to trial and judge thy secret acts; and cry out to Him: O Savior, save me by the entreaties of Nicholas!"
      ],
      theotokion: "We joyfully offer thee the salutation of the divine Gabriel, and we cry out: Rejoice, O paradise who ever hast within thee the Tree of life, O all-glorious palace of the Word! Rejoice, O most immaculate Virgin!"
    }
  }
},
            5: {
  metadata: {
    day:             "Friday",
    theme:           "The Precious and Life-creating Cross and the Theotokos",
    canons:          ["Canon of the precious and life-creating Cross of the Lord", "Canon of the all-holy Theotokos"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross then Canon of the Theotokos per ode, in source order (Martyricon troparia excluded); theotokion: final theotokion of the ode sequence; Ode 8 theotokion null per rule",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. II (Tones III & IV), St. John of Kronstadt Press",
    pages:           "132–138",
    verified:        true
  },
  odes: {
    1: {
      irmos: "I will open my mouth, and the Spirit will inspire it, and I will sing a hymn to the sovereign Mistress, and I shall be seen as one who rejoiceth, and I will sing of her wondrous works with gladness.",
      troparia: [
        "Thou didst stretch out Thy divine hands upon the Cross, O Long-suffering One, and didst call the perishing world to recognize Thy might. Wherefore, O Compassionate One, we magnify Thy lovingkindness.",
        "Moses lifted up the brazen serpent, prefiguring Thy divine crucifixion, O all-beginning-less Word, whereby the venomous serpent who caused the fall of Adam himself fell.",
        "Thou alone art help, refuge and protection for thy servants, O pure Theotokos; wherefore, falling down, we cry to thee: Save us in Thy lovingkindness, O Mistress!",
        "O Mistress who gavest birth to the all-holy Word, O most immaculate Maiden who art more holy than all the hosts on high, sanctify my defiled heart.",
        "O most immaculate one, thou art the restoration of the fallen and the confirmation of those who stand fast; wherefore, I pray to thee: Set aright my mind, which hath fallen through sin, O Mistress, that I may glorify thee."
      ],
      theotokion: "O most immaculate one, thou art the restoration of the fallen and the confirmation of those who stand fast; wherefore, I pray to thee: Set aright my mind, which hath fallen through sin, O Mistress, that I may glorify thee."
    },
    3: {
      irmos: "O Theotokos, thou living and abundant fountain: in thy divine glory establish those who hymn thee and spiritually form themselves into a choir; and vouchsafe unto them crowns of glory.",
      troparia: [
        "All-iniquitous men led thee like a lamb to the slaughter, O Christ, Who art the Lamb of God Who desirest to deliver from the cruel wolf the lambs whom Thou didst love.",
        "Unjustly condemned, Thou didst stand before the judge, O Thou Who dost judge the whole earth with righteousness; and Thou didst endure smiting on Thy cheek, O Lord, desiring to free me, who am enslaved to the evil prince of this world.",
        "Wash away our sins, we pray, O Thou Who lovest mankind, by the supplications of her who gave birth to Thee without seed; for for our sake, O Word, Thou didst shed Thy precious blood.",
        "Against us hath a wicked assembly of those who unjustly war against us gathered together, O Bride of God; but cast them down, like Peter cast down Simon Magus of old."
      ],
      theotokion: "Against us hath a wicked assembly of those who unjustly war against us gathered together, O Bride of God; but cast them down, like Peter cast down Simon Magus of old."
    },
    4: {
      irmos: "Perceiving the inscrutable counsel of God — the Incarnation of Thee, the Most High, from the Virgin — the Prophet Habbakuk cried aloud: Glory to Thy power, O Lord!",
      troparia: [
        "That Thou mightest release me from the bonds of sin, O Thou Who lovest mankind, Thou wast bound of Thine own will and didst die on the Cross like a malefactor. Glory to Thy great lovingkindness!",
        "Thou didst endure wounds and a violent death, O Word of God, making immortal the essence of mortal men, which had been slain by the passions. Glory to Thy great lovingkindness!",
        "Our God, the King of all, assumed human guise through thee, O Virgin, and hath shown thee to be, as the Theotokos, more exalted than the cherubim and the awesome seraphim.",
        "O thou who alone gavest birth to the divine Life Who granteth salvation unto all, vouchsafe salvation unto me who am in despair, and cut through the uprisings of my passions."
      ],
      theotokion: "O thou who alone gavest birth to the divine Life Who granteth salvation unto all, vouchsafe salvation unto me who am in despair, and cut through the uprisings of my passions."
    },
    5: {
      irmos: "All things are filled with awe at thy divine glory; for thou, O Virgin who hast not known wedlock, didst contain within thy womb Him Who is God over all, and gavest birth to the timeless Son, granting peace unto all who hymn thee.",
      troparia: [
        "Beholding Thee, the Sun, stretched out upon the Cross, the sun hid its rays, when Thou didst set, O Savior, enlightening those asleep in the night of deception, who now worship Thy might.",
        "Crucified in Thy lovingkindness, Thou savest me; and Thou dost taste gall and vinegar, in that Thou art good, delivering us from the taste of pleasures, whereby we were deceived and fell into corruption.",
        "Thou ever pourest forth the waters of healing upon all the infirm, O Virgin, in that thou art the animate cloud of Christ the King; wherefore, send down the dew of healing upon me who am sick.",
        "O Virgin Bride of God, cease thou never to entreat as Savior and Master Him Thou didst bear, that He grant me remission of sorrows and pangs, and lead me up to joy incorruptible, forgiving my transgressions."
      ],
      theotokion: "O Virgin Bride of God, cease thou never to entreat as Savior and Master Him Thou didst bear, that He grant me remission of sorrows and pangs, and lead me up to joy incorruptible, forgiving my transgressions."
    },
    6: {
      irmos: "Celebrating this divine and most honored festival of the Mother of God, come, ye divinely wise, let us clap our hands and glorify God Who was born of her.",
      troparia: [
        "By the pangs which Thou didst endure when Thou wast crucified Thou didst cause the pangs of mankind to cease, O loving Lord, and Thou leadest all to the life which is devoid of pain.",
        "The rays of the sun were hidden, the veil of the temple was rent in twain, the earth trembled and the rocks split asunder in fear, unable to bear the sight of the Creator on the Cross.",
        "O thou who alone art the help of all, help us who are in tribulation, grant us thy hand, and steer us to the haven of salvation, O thou who alone art full of the grace of God.",
        "Our God, Who is King of all, assumed human guise through thee, O Virgin, and hath shown thee to be, as the Theotokos, more exalted than the cherubim and the awesome seraphim."
      ],
      theotokion: "Our God, Who is King of all, assumed human guise through thee, O Virgin, and hath shown thee to be, as the Theotokos, more exalted than the cherubim and the awesome seraphim."
    },
    7: {
      irmos: "The divinely wise youths worshipped not a creation rather than the Creator, but, manfully trampling the threat of the fire underfoot, they rejoice, chanting: Blessed art Thou, the all-hymned God of our fathers!",
      troparia: [
        "The adversary was vanquished and suffered a wondrous fall when Christ was uplifted upon the Tree; and that which before was condemned was saved, crying out to Him: Blessed art Thou, the Lord and God of our fathers!",
        "O Christ Who died upon the Tree, Thou didst impart life unto me who was slain by the tree; and by thy divine wounds Thou didst heal the wounds of my heart. Blessed art Thou, the Lord and God of our fathers!",
        "O field who gavest rise to the divine Grain, disdain not my soul, which hath been weakened and withered amid a famine of godly acts, but water it with the divine grace of thy Son.",
        "Lull to sleep the movements of my bodily passions, and make the uprisings of my flesh subject to my mind, like as they were a mule, O pure one, calming them with thy supplications as with sleep."
      ],
      theotokion: "Lull to sleep the movements of my bodily passions, and make the uprisings of my flesh subject to my mind, like as they were a mule, O pure one, calming them with thy supplications as with sleep."
    },
    8: {
      irmos: "Stretching forth his hands, Daniel shut the lions' mouths in the pit; and the young lovers of piety, girded about with virtue, quenched the power of the fire, crying out: Bless the Lord, all ye works of the Lord!",
      troparia: [
        "As the Timeless One, having entered into time Thou dost release me from the bonds of time; and bound of Thine own will, O Master, Thou didst send the prideful one into unbreakable bonds, and savest me by Thy Cross and sufferings. Wherefore, I bless Thee, O Christ, for all ages.",
        "Uplifted upon the Tree of Thine own will, Thou didst raise up all creation with Thyself, O all-hymned and invisible Word Who art without beginning; and by Thy suffering Thou didst rebuke the princes and powers of darkness, O Christ. Wherefore, we glorify Thee for all ages.",
        "Break thou the chains of my transgressions and quell thou the uprisings of my body, cut down mine evil thoughts and quickly cleanse thy servant of secret thoughts, O Theotokos, thou intercessor and help of all the faithful.",
        "O all-pure one, who hast been shown to be the unquarried mountain of God, rich, densely wooded and overshadowed, shield me with the shelter of thy supplications, deliver me from the snares of the hunters, and preserve me from the darts of the demons and from vile thoughts."
      ],
      theotokion: null
    },
    9: {
      irmos: "Every earthly creature rejoice, illumined by the Spirit; and let the nature of the bodiless intelligences celebrate the honorable feast of the Mother of God and cry: Rejoice, O most blessed Theotokos pure Ever-virgin!",
      troparia: [
        "O Thou Who lovest mankind, and wilt come to judge all men, Thou didst stand condemned. Of Thine own will and desire Thou wast crowned with the crown of thorns, O Christ our Savior, uprooting the thorns of disobedience, and delighting all with the knowledge of Thy lovingkindness.",
        "O how can the iniquitous men, benighted by envy, condemn Thee, the righteous and blameless Judge, to the Cross, O Bestower of light? Seeing Thy sufferings, the sun was darkened, the veil of the temple was rent in twain, and the foundations of the earth trembled.",
        "Rejoice, O all-pure one, who for those on earth truly gavest birth unto Joy! Rejoice, haven of salvation and protection of those who have recourse unto thee! Rejoice, O pure ladder who bearest up those who have fallen! Rejoice, O most blessed Theotokos, thou hope of our souls!",
        "By thy powerful supplication rid my defiled soul and body of the weeds of my sin, O divinely joyous and all-pure Mistress, granting me the healing of salvation, the divine fear of the Master, O most immaculate one."
      ],
      theotokion: "By thy powerful supplication rid my defiled soul and body of the weeds of my sin, O divinely joyous and all-pure Mistress, granting me the healing of salvation, the divine fear of the Master, O most immaculate one."
    }
  }
},
            6: {
  metadata: {
    day:             "Saturday",
    theme:           "All Saints and the Departed",
    canons:          ["Canon of All Saints", "Canon of the Departed"],
    flatteningOrder: "Canon of All Saints irmos governs; troparia: Canon of All Saints then Canon of the Departed per ode, in source order (Nekrosimon troparia included as final troparia per ode before theotokion); theotokion: final theotokion of the ode sequence; Ode 8 theotokion null per rule",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. II (Tones III & IV), St. John of Kronstadt Press",
    pages:           "142–148",
    verified:        true
  },
  odes: {
    1: {
      irmos: "I will open my mouth, and the Spirit will inspire it, and I will sing a hymn to the sovereign Mistress, and I shall be seen as one who rejoiceth, and I will sing of her wondrous works with gladness.",
      troparia: [
        "The honorable Church is ever made splendid by the radiant struggles of the athletes of the Lord, and rendering worship it glorifieth Christ, the Sun Who shone forth from the Virgin and dispelled the darkness of deception.",
        "With faith let us praise the holy hierarchs of Christ, who shepherded well the chosen people; and let us praise the whole assembly of those who lived in holiness and by their spirit mortified the pleasures of the body.",
        "Might was given by God to women who by grace trampled down the enemy in fasting and mighty suffering. By the supplications of them and Thy holy prophets, O Lord, send down Thy mercies upon all.",
        "Nekrosimon: Keep Thy servants at Thy right hand, O Savior, and, entreated by the passion-bearing martyrs, guide them to the pasture of immortality, that they may behold Thy beauty."
      ],
      theotokion: "The mystery hidden from before the ages and unknown even to the angels, through thee, O Theotokos, hath been revealed to those on earth: God incarnate in unconfused union, Who willingly accepted the Cross for our sake and, thereby raising up the first-formed man, hath saved our souls from death."
    },
    3: {
      irmos: "The bow of the mighty is become weak, and the strengthless have girded themselves with power; wherefore, my heart is established in the Lord.",
      troparia: [
        "Slaughtered like lambs, the right victorious martyrs were offered unto Christ, the Lamb and Word of God Who was slain for the deliverance of all.",
        "The innumerable multitude of the venerable hath been adorned, the sole triumph of divine women hath been magnified, and the holy council of the prophets hath been honored, united, rejoicing, with the offices of the angels.",
        "Nekrosimon: Having become fellow citizens with the angels, O holy martyrs, ask for all those who have fallen asleep remission, a dwelling in divine paradise, and ultimate deliverance from transgressions.",
        "He Who preserved thee a virgin after thine incorrupt birthgiving hath glorified the virgins who stand round about thee. With them do thou unceasingly pray that our souls be saved from every sorrow and peril."
      ],
      theotokion: "He Who preserved thee a virgin after thine incorrupt birthgiving hath glorified the virgins who stand round about thee. With them do thou unceasingly pray that our souls be saved from every sorrow and peril."
    },
    4: {
      irmos: "Beholding Thee lifted up upon the Cross, O Sun of righteousness, the Church stood rooted in place, crying out as is meet: Glory to Thy power, O Lord!",
      troparia: [
        "The most sacred company of martyrs hath been glorified; and by their members in sacred manner they have glorified the Lord Who is glorified by all the angels, and they pray that we be delivered from all tribulation.",
        "Possessed of a mind resplendent with immaterial radiance, O godly hierarchs, ye dispelled the night of all deception, and with true instruction guided the divinely chosen flock of Christ to understanding.",
        "Nekrosimon: Shown forth as luminaries, the martyrs enlighten the sky of the Church, and they entreat Christ the Savior to grant surcease unto those who have fallen asleep.",
        "The Immortal One, Who hath dominion over the dead and the living, becoming incarnate as a man from thee, O Mother of God, endured death in the flesh, destroying the power of death."
      ],
      theotokion: "The Immortal One, Who hath dominion over the dead and the living, becoming incarnate as a man from thee, O Mother of God, endured death in the flesh, destroying the power of death."
    },
    5: {
      irmos: "Thou hast come, O my Lord, as a light into the world: a holy light turning from the darkness of ignorance those who hymn Thee with faith.",
      troparia: [
        "Following the sayings of the prophets, in sufferings and fasting the multitude of women pleased God the Word, Who shone forth from the Virgin, a woman.",
        "Nekrosimon: O greatly Merciful One, Thou Life of all, vouchsafe unto the dead who in faith have passed from us unto Thee, the Creator, that they may dwell in light with Thy saints.",
        "Nekrosimon: O greatly Merciful One, Thou Life of all, vouchsafe unto the dead who in faith have passed from us unto Thee, the Creator, that they may dwell in light with Thy saints.",
        "With mouth, tongue and heart I confess thee to be the pure Mother of our God, O Maiden. By thy mediation deliver me from everlasting damnation."
      ],
      theotokion: "With mouth, tongue and heart I confess thee to be the pure Mother of our God, O Maiden. By thy mediation deliver me from everlasting damnation."
    },
    6: {
      irmos: "I will sacrifice to Thee with a voice of praise, O Lord, the Church crieth unto Thee, cleansed of the blood of demons by the blood which, for mercy's sake, flowed from Thy side.",
      troparia: [
        "Like most costly stones all-wisely rolling upon the earth, O martyrs, ye demolished the whole structure of ungodliness and became temples of God.",
        "From violent hands ye save all who are under your hands, O holy, righteous and venerable hierarchs, preserving the flock in Christ; wherefore, ye are called blessed.",
        "Nekrosimon: Let the flaming sword, beholding the spear which pierced Thy divine side, withdraw before Thy servants, O Savior, at the entreaties of Thy passion-bearers.",
        "Thou didst combine virginity with divine birthgiving, O all-pure one; for thou didst ineffably give birth to the Creator of all things, unto Whose will all submit."
      ],
      theotokion: "Thou didst combine virginity with divine birthgiving, O all-pure one; for thou didst ineffably give birth to the Creator of all things, unto Whose will all submit."
    },
    7: {
      irmos: "The children of Abraham in the Persian furnace, afire with love of piety more than with the flame, cried out: Blessed art Thou in the temple of Thy glory, O Lord!",
      troparia: [
        "Together let us in gladness of soul hymn the martyrs of the Lord, the sanctified vessels of Christ the Master, the bulwarks and pillars of the Church.",
        "The holy hierarchs, prophets and martyrs, who fought the sacred fight, have received a sacred habitation with the angels, and with them ask that cleansing and great mercy be given to us all.",
        "Nekrosimon: Accepting the endurance and patience and the blood of all the martyrs, grant rest unto those who in piety have fallen asleep in Thee, in that Thou art merciful and right placable.",
        "Rejoice, O blessed Theotokos, Virgin Mother, for in thee the destruction of death been wrought and life indestructible been given to those who have died."
      ],
      theotokion: "Rejoice, O blessed Theotokos, Virgin Mother, for in thee the destruction of death been wrought and life indestructible been given to those who have died."
    },
    8: {
      irmos: "Stretching forth his hands, Daniel shut the lions' mouths in the pit; and the young lovers of piety, girded about with virtue, quenched the power of the fire, crying out: Bless the Lord, all ye works of the Lord!",
      troparia: [
        "The holy hierarchs, prophets and martyrs and women, who fought the sacred fight, have received a sacred habitation with the angels, and with them ask that cleansing and great mercy be given to us all.",
        "Having been ordained as bishops for the people and made yourselves radiant through fasting, O holy hierarchs who preached God, ye shone forth more brightly than the sun, illumining the faithful in the manifestation of great deeds, O venerable ones.",
        "Nekrosimon: Numbering the souls of Thy servants who have passed on to Thee among the firstborn and Thy righteous, O Savior, vouchsafe that they may unceasingly delight in Thee Who hast dominion over all.",
        "We hymn thee, O Mother of God, through whom the ineffable and unapproachable Light hath shone forth on those in darkness, and we bless thee with love."
      ],
      theotokion: null
    },
    9: {
      irmos: "Every earthly creature rejoice, illumined by the Spirit; and let the nature of the bodiless intelligences celebrate the honorable feast of the Mother of God and cry: Rejoice, O most blessed Theotokos pure Ever-virgin!",
      troparia: [
        "Seeing the divine gifts and receiving honors for their great pangs, the martyrs rejoice, magnifying Christ Who truly magnified them and showed them to be victors.",
        "Having been ordained as bishops for the people and made yourselves radiant through fasting, O holy hierarchs who preached God, ye shone forth more brightly than the sun, illumining the faithful in the manifestation of great deeds, O venerable ones.",
        "Let us bless all the venerable and the righteous, the hieromartyrs and all the prophets, and the women who splendidly pleased God, crying out: At their entreaties, O Christ, deliver our souls from Gehenna!",
        "Nekrosimon: Unto true martyrs and athletes Thou gavest the boldness to entreat Thee, O Lord. For their sake give divine deliverance unto those who have reposed in faith, granting them to dwell in a place of holy habitation.",
        "O most immaculate one who wast revealed to be more exalted than the cherubim, in that thou gavest birth to the Sustainer of all things, elevate my mind, strengthening me against the carnal passions, that I may do the will of the Master."
      ],
      theotokion: "O most immaculate one who wast revealed to be more exalted than the cherubim, in that thou gavest birth to the Sustainer of all things, elevate my mind, strengthening me against the carnal passions, that I may do the will of the Master."
    }
  }
}
        },

5: {
            1: {
  metadata: {
    day:             "Monday",
    theme:           "Repentance and the Bodiless Powers",
    canons:          ["Canon of Repentance", "Canon of the Incorporeal Hosts"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Incorporeal Hosts per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "24–28",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Let us chant a hymn of victory unto the Lord, Who wrought wondrous miracles in the Red Sea, for He hath been glorified.",
      troparia: [
        "O Christ, in that Thou art almighty, turn and have compassion on me, who have been led astray and deceived by the many falsehoods of the alien one.",
        "O Christ Who opened the ears of the deaf man, open Thou the deaf ears of my soul, I pray, that I may hear Thy words.",
        "O ye angels, initiates of the life-giving Godhead, shining with the light of His first-revealed rays, entreat the Master, that He illumine my soul with light.",
        "As ye all have boldness, standing before the throne on high, O supreme commanders, captains of the ranks of heaven, from misfortunes deliver those who piously hymn you."
      ],
      theotokion: "The curse hath been annulled and grief is ended; for the blessed and gracious one hath shone forth Christ, the Joy of the faithful, putting forth blessing like a flower for all the ends of the earth."
    },
    3: {
      irmos: "God is King over the nations. God sitteth on His holy throne. And with understanding we chant unto Him as King and God.",
      troparia: [
        "O good Lord, Who dost not will that even one person perish: With Thy merciful hand have pity and save me who am perishing, O most Compassionate One.",
        "O Christ our Lord, Who knowest all the sins I have committed against Thee in knowledge and in ignorance, I approach and fall down before Thee: Accept me as Thou didst the prodigal.",
        "O Thou Who by Thy word all-wisely formed the choirs of the hosts on high, and Who showest forth Thine incalculable goodness: By their intercessions make steadfast Thy Church, O only Good One, Who lovest mankind.",
        "Adorning the angels with ineffable radiance, and by them making Thy Church steadfast, O loving Christ, enlighten my wretched soul, O Master, remembering not my countless sins."
      ],
      theotokion: "Without uniting with a man thou becamest the Mother of God Who illumineth the incorporeal choirs, that they might unceasingly hymn the one Godhead in three sanctities and lordships, O all-pure and most hymned Virgin."
    },
    4: {
      irmos: "The workings of Thy dispensation filled the Prophet Habbakuk with awe, O Lord; for Thou didst issue forth for the salvation of Thy people, Thou didst come to save Thine anointed ones.",
      troparia: [
        "The works I have done in this life are wicked and grievous. O Christ my God: deliver me from them, granting me sincere repentance.",
        "Every honorable commandment have I spurned; I have rejected the fear of Thee, O Christ. And I fear Thine inexorable tribunal. Condemn me not thereat, O Thou Who art full of lovingkindness.",
        "Thou didst form the angelic luminaries and hast right generously enlightened them with deifying rays, for Thou art mighty in power, O Thou Who lovest mankind, and keepest Thy word.",
        "Let us set aside the worldly wisdom of our bodies, O ye faithful, emulating the life of the incorporeal ranks; and let us give wings to our mind."
      ],
      theotokion: "Be thou an intercessor, refuge and haven for me, averting the storm of the passions, O all-immaculate one who hast incomparably surpassed the angelic choirs in goodness."
    },
    5: {
      irmos: "O Christ God, Thou true Light, out of the night my spirit riseth at dawn unto Thee. Show forth Thy countenance upon me.",
      troparia: [
        "Awake, O my soul, awake from the heavy sleep of my grievous sin, and enlighten thyself with the light of repentance.",
        "Let us diligently restore our souls and drink in showers of compunction, that we may produce the grain of repentance.",
        "Traveling all the ends of the earth, ye bring the benefactions of the Master unto the faithful, and preserve them, O most glorious archangels.",
        "Submitting to Thy word, O Word of God the Father, the glorious orders of the heavenly ranks are illumined with the light of Thine effulgence."
      ],
      theotokion: "All my desire do I set before thee, O thou who, in manner past recounting, gavest birth to the Sweetness of desire for those who acknowledge thee to be the Theotokos, O pure one."
    },
    6: {
      irmos: "Thou didst deliver the prophet from the sea monster, O Lord; lead me up also from the abyss of sins, and save me.",
      troparia: [
        "There is no sin in this life which I alone have not committed, wretch that I am. O only Sinless One, have pity on me.",
        "Propelled by the sail of zeal, let us all hasten to the harbor of salvation by repentance, that we may be saved.",
        "O chosen assemblies of the angels, adorned with sanctity, ye shine with light-giving effulgence, manifestly perfected by deifying brilliance.",
        "Richly all-adorned with thrice-radiant beams, O ye angels and archangels, in godly manner illumine my wretched soul with your supplications."
      ],
      theotokion: "O all-pure one, thou didst conceive the Creator and God of all, upon whom the angels, rejoicing, gaze with fear, standing reverently before Him."
    },
    7: {
      irmos: "Blessed, all-hymned and all-glorious art Thou, O God Who lookest upon the depths and sittest upon the throne of glory!",
      troparia: [
        "Blessed art Thou, O God, and all-hymned and all-glorious art Thou Who in thy lovingkindness dost accept all who repent.",
        "Heal Thou my many passions, O all-hymned, all-glorious and compassionate Christ, Who knowest my weakness.",
        "Showing forth infinitely powerful might, Christ appointed you, O supreme commanders, and taught you to chant: Blessed art Thou, O God!",
        "O Thou Who with goodness adornest the countless multitude of the incorporeal ranks, vouchsafe that the companies of men may hymn Thee, crying: Blessed art Thou, O God!"
      ],
      theotokion: "Make me now steadfast who am shaken by the passions, O Virgin who hast poured forth dispassion upon all the faithful, who chant with faith: Blessed art Thou, O God!"
    },
    8: {
      irmos: "Hymn the Author of creation, of Whom the angels are in awe, O ye people, and exalt Him supremely for all ages!",
      troparia: [
        "O Lord, enliven me who am done to death by my trespasses, that I may glorify Thee for all ages.",
        "Enlightening me with repentance, O Lord, deliver me from the darkness of sin, that I may glorify Thee for all ages.",
        "The councils of the angels now move me to chant with hymns and heartfelt desire; and with them I sing: Hymn the Lord, all ye works, and exalt Him supremely forever!",
        "O servants of the all-holy and three-Sunned Radiance, pray ye that they may be saved who chant with faith: Hymn the Lord, ye works, and exalt Him supremely forever!"
      ],
      theotokion: null
    },
    9: {
      irmos: "In that the Mighty One hath done great things to thee, revealing thee to be a pure virgin even after giving birth, as thou gavest birth to thine own Creator without seed, we therefore magnify thee, O Theotokos.",
      troparia: [
        "That I may magnify Thy long-suffering, I cry to Thee: O Jesus, be Thou yet patient with me, and hew me not down like the barren fig-tree, but let me produce for Thee the fruits of repentance.",
        "O Lord, be merciful unto me who have mindlessly committed sins without number, and vouchsafe unto me Thy kingdom, O Word.",
        "As commander of the angelic ranks, O all-radiant Michael, and thou, O Gabriel, as the true herald of the divine incarnation: Preserve all who hymn you, O glorious ones.",
        "O Thou Who pourest out Thy treasures in rich gifts and Who appointed the angelic ranks: When Thou comest with them as Judge and King of all, save me who flee to Thy mercy, O Master."
      ],
      theotokion: "With faith the archangels, authorities and thrones, the cherubim, powers and seraphim, the radiant angels, principalities and dominions, noetically minister unto thy Son with trembling, O pure and most blessed Theotokos."
    }
  }
},
2: {
  metadata: {
    day:             "Tuesday",
    theme:           "Repentance and the Forerunner",
    canons:          ["Canon of Repentance", "Canon of John the Forerunner"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Forerunner per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "33–38",
    verified:        true
  },
  odes: {
    1: {
      irmos: "The land on which the sun had never shone, and which it had not seen, and the abyss which the expanse of heaven had never seen uncovered, did Israel cross dryshod, O Lord; and Thou didst lead them to the mountain of Thy holiness, as they gave praise and chanted a hymn of victory.",
      troparia: [
        "Grant me cleansing of the things I have done, O Savior, and absolve me before I depart from hence. Wash away my great filth, O Lord Who cleansed the lepers, and vouchsafe that I may stand blamelessly before Thee Who wilt come to judge the living and the dead.",
        "The discharge which lieth upon the eyes of my soul preventeth me from gazing upon Thy beams, which Thou didst emit when Thou didst appear on earth, O unapproachable Sun. Wash it away, O Savior, and grant that I may contemplate the light of Thy grace, O compassionate Lord.",
        "Bring me forth from evil habits, O pure Virgin. Upon the rock of the commandments establish me who am shaken by the machinations of him who of old caused our first parents to fall. And vouchsafe that I may please Christ, singing well and chanting a hymn of victory.",
        "O Baptist, accept this entreaty of thy servants who are beset by temptations, and entreat Christ in our behalf, that He enlighten those who piously honour thee, delivering them from temptations."
      ],
      theotokion: "Deliver me from evil habits, O pure Virgin. Upon the rock of the commandments establish me who am shaken by the machinations of him who of old caused our first parents to fall. And vouchsafe that I may please Christ, singing well and chanting a hymn of victory."
    },
    3: {
      irmos: "O Lord, make steadfast my heart, which is buffeted by the waves of life, guiding it into calm harbor, in that Thou art God.",
      troparia: [
        "I promised Thee that I would repent, O God, yet still I commit sin. What will become of me? How shall I find myself when Thou shalt come to judge the earth?",
        "Let us offer supplication unto the Lord; let us sigh and shed the tears which wash away defilement, that we may be find deliverance in the world to come.",
        "Open now to me the gates of repentance, the portal of the Light, O Virgin; and forbid the passions entry into my lowly soul.",
        "O Forerunner of Christ, with grace illumining me, who am held fast in the sleep of slothfulness, assiduously rouse me to do the things which God willeth."
      ],
      theotokion: "Open now to me the gates of repentance, the portal of the Light, O Virgin; and forbid the passions entry into my lowly soul."
    },
    4: {
      irmos: "I heard report of Thee, O Lord, and was afraid; I understood Thy dispensation, and glorified Thee, Who alone lovest mankind.",
      troparia: [
        "Paying no heed to Thine enlightening words, O Lord, I have committed deeds of darkness, and I fear Thy dread tribunal in the life to come.",
        "If we give wings to the ship of our soul with the sail of the fear of God, we shall reach the havens of repentance, escaping the threefold waves of evils.",
        "O all-pure Mistress, intercessor for sinners, divine correction of those who have fallen, thou art glorified as she who gave birth to God.",
        "Foreseeing the gratefulness of thy heart, the Lord sanctified thee from thy mother's womb, O blessed one. Him do thou entreat, that He sanctify us all, we pray."
      ],
      theotokion: "O all-pure Mistress, intercessor for sinners, divine correction of those who have fallen, thou art glorified as she who gave birth to God."
    },
    5: {
      irmos: "Anticipating my need, take pity on my wretched soul, which doth battle at night with the darkness of the passions, and shine forth in me the noetic sun of the day-star, that I may distinguish night from light.",
      troparia: [
        "There is no salvation for me in my works, for I have committed many sins on earth, wretch that I am, and I shall tremble before Thy dread judgment-seat when thou shalt judge those who have broken Thy commandments, O God.",
        "How mindless have I been! How dark I have become by doing evil deeds! How I have failed to understand the fear of Thee, O Christ! I have fallen face down upon the ground and made myself like the irrational beasts; yet convert me, O God of all.",
        "The tempest of sin assaileth me, O all-pure Theotokos. Make haste to deliver me, guiding me to the haven of repentance, O most immaculate one.",
        "A pure way of life and an immaterial life didst thou show forth in a material body, O Forerunner; wherefore, we beseech thee: Make those who bless thee with faith emulators of thyself."
      ],
      theotokion: "The tempest of sin assaileth me, O all-pure Theotokos. Make haste to deliver me, guiding me to the haven of repentance, O most immaculate one."
    },
    6: {
      irmos: "As Thou didst deliver the prophet from the beast, O Lord, so lead me up from the abyss of unrestrained pleasures, that I may dare to lift up mine eyes upon Thy holy temple.",
      troparia: [
        "Now is the time to convert, yet I always lie prostrate, ever stuck in great senselessness. But releasing me from the darkness of my heart, O Word, have pity on me.",
        "Have pity on me who groan, as once Thou hadst pity on the publican, O compassionate Christ; and vouchsafe that I may weep fervent tears like the harlot, that I also may wash away the filth of my many transgressions.",
        "O all-pure one, impassable portal of glory, open unto me the gates of repentance, winning for me divine entry and rest in the life to come.",
        "O Forerunner of the Savior, mediating causes of repentance for me, I pray thee: Ask and entreat Him Who loveth mankind, that I be granted the compunction which washeth away the fœtid mire of sin."
      ],
      theotokion: "O all-pure one, impassable portal of glory, open unto me the gates of repentance, winning for me divine entry and rest in the life to come."
    },
    7: {
      irmos: "The prayer of the children quenched the fire; and the dew-bearing furnace was the herald of a miracle, for it neither consumed nor burned those who hymned the God of our fathers.",
      troparia: [
        "Forgive Thou mine iniquities, mine injustices and my countless offenses, O Christ, and in the greatness of Thy compassions, O God, deliver me from the torment which is to come.",
        "Like the prodigal I have now squandered all the wealth I once received, and I am beset by starvation, deprived of divine food. Accept me, the penitent, O Savior, and save me.",
        "Thou hast been shown to be a haven of salvation for all, O pure one, stilling the tempest of the passions and leading to tranquillity all who are humble on the earth, O pure Theotokos.",
        "The tempest of sin assaileth me, O all-pure Theotokos. Make haste to deliver me, guiding me to the haven of repentance, O most immaculate one."
      ],
      theotokion: "The tempest of sin assaileth me, O all-pure Theotokos. Make haste to deliver me, guiding me to the haven of repentance, O most immaculate one."
    },
    8: {
      irmos: "Ye assembly of angels and council of men, ye priests, hymn the King and Creator of all! Ye Levites, bless Him! Ye people, exalt Him supremely for all ages!",
      troparia: [
        "Behold, the sores of my soul have putrefied and grown fœtid, O Christ, and I have suffered and been brought low thereby; but treat me, O Savior, with the medicines of repentance.",
        "By deception the most wicked serpent defrauded me and filled me with evils; but, sighing, I cry: O Word, reject me not, who am condemned and brought low!",
        "O most immaculate one, thou gavest birth to Christ as a little Child, Who worketh the renewal of us who have grown old through the ancient transgression.",
        "Thou didst wash the assembly of the people in the streams of the Jordan, preaching repentance, O great Forerunner; wherefore, I cry out to thee: Dry up the stream of my passions, sending forth well-springs of tears upon me."
      ],
      theotokion: null
    },
    9: {
      irmos: "In that the Mighty One hath done great things to thee, revealing thee to be a pure virgin even after giving birth, as thou gavest birth to thine own Creator without seed, we therefore magnify thee, O Theotokos.",
      troparia: [
        "That I may magnify Thy long-suffering, I cry to Thee: O Jesus, be Thou yet patient with me, and hew me not down like the barren fig-tree, but let me produce for Thee the fruits of repentance.",
        "O Lord, be merciful unto me who have mindlessly committed sins without number, and vouchsafe unto me Thy kingdom, O Word.",
        "O thou who didst put forth the divine Flower from thy root, O ark and candlestand, golden jar, holy table holding the Bread of life as thy Son and God: Entreat Him with the holy Forerunner, that He have pity and save those who confess thee to be the Theotokos.",
        "Lo! the majesty of thy temple is acknowledged to be heaven on earth, O Forerunner of Christ, and with divine rays thou enlightenest those who approach it and who now bless thee therein every day."
      ],
      theotokion: "O thou who didst put forth the divine Flower from thy root, O ark and candlestand, golden jar, holy table holding the Bread of life as thy Son and God: Entreat Him with the holy Forerunner, that He have pity and save those who confess thee to be the Theotokos."
    }
  }
},
            3: {
  metadata: {
    day:             "Wednesday",
    theme:           "The Holy Cross and the Theotokos",
    canons:          ["Canon of the Cross", "Canon of the Theotokos"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross then Canon of the Theotokos per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "43–48",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Bringing battles to nought with His upraised arm, Christ hath overthrown horse and rider in the Red Sea, and hath saved Israel, who chanteth a hymn of victory.",
      troparia: [
        "Of old, the law-breaking assembly of the Jews lifted up upon the Tree Him Who is inconceivably understood to be incarnate, and Who appeared to the world in the flesh as He desired.",
        "When the Jews lifted Thee up, suspending Thee, the fruitful vine, upon the tree of the Cross, O Christ, Thou didst exude the wine of gladness which taketh away all the drunkenness of evils, O Word.",
        "O Portal of divine glory, open unto me the doors of repentance, I pray, and enlighten my mind, that I may hymn thee, O divinely joyous one.",
        "O pure one, with the remedy inherent in thee heal me wholly, who have been wounded by the darts of sin. Free me from the pangs which beset me, O thou who by thy birthgiving hast freed the human race from pain."
      ],
      theotokion: "O pure one, with the remedy inherent in thee heal me wholly, who have been wounded by the darts of sin. Free me from the pangs which beset me, O thou who by thy birthgiving hast freed the human race from pain."
    },
    3: {
      irmos: "O Christ Who by Thy command fixed the earth upon naught and suspended its weight unsupported: establish Thou Thy Church upon the immovable rock of Thy commandments, O Thou Who alone art good and lovest mankind.",
      troparia: [
        "When Thou wast crucified, paradise was opened again and the thief was the first of all to enter therein, rejoicing; and when Thou didst die, O my Jesus, the enemy deceiver was slain, and slain Adam was given life. Glory to Thy surpassing lovingkindness!",
        "Crucified upon the Tree in Thy goodness, O Jesus, Thou didst cause the flame of sin to wither away; bound, Thou hast released man from deception; and stripped naked, Thou hast clothed man in the vesture of glory. Glory to Thy surpassing compassion!",
        "O Mistress, by thine aid cast down the invisible enemies who assail in vain my lowly heart and seek to slay me, that they may remain impotent and full of shame.",
        "O Mistress who hast poured forth upon the world the divine Water, fill me with life-creating waters, dry up the grievous torrents of mine iniquities, and with thy divine serenity still thou the waves of my heart."
      ],
      theotokion: "Ending, the tabernacle of the law hath passed away, for thou gavest birth to Christ, the Bestower of the law, Who layeth down for us the grace of purification and enlightenment, and annulleth the curse, O all-pure, most immaculate Virgin."
    },
    4: {
      irmos: "Perceiving Thy divine condescension prophetically, O Christ, Habbakuk cried out to Thee with trembling: Thou art come for the salvation of Thy people, to save Thine anointed ones!",
      troparia: [
        "Working never-ending deliverance for men's souls when hanging of Thine own will upon the Tree, O Christ, Thou didst commit Thine all-holy soul into the hands of the Father.",
        "The unjust judge condemned Thee, the righteous Judge, to die suspended upon the Tree, that Thou mightest justify us who unjustly submitted to the enemy.",
        "Thou didst restrain the onrushing of death, O most immaculate one who gavest birth unto Him Who hath dominion over life and death. Him do thou entreat, that He restrain my soul and save me, O thou who puttest transgressions to death.",
        "The Word Who with the Father is equally without beginning chose thee alone, the beauty of Jacob, from among the generations of men, and became incarnate of thy blood. O Mistress, save me by thy mediations."
      ],
      theotokion: "Like the fleece thou didst absorb the rain of heaven which descended upon thee, O most pure one; wherefore, dry up the teeming of my passions, I pray thee, O Virgin Mother."
    },
    5: {
      irmos: "O Thou Who art clothed in light as with a garment: I rise at dawn unto Thee, and to Thee do I cry: enlighten Thou my gloom-enshrouded soul, O Christ, in that Thou alone art compassionate!",
      troparia: [
        "Thou didst stand condemned, O Christ, Thou righteous Judge, condemning the enmity of the flesh; and beaten with a reed, Thou hast signed for me a complete release.",
        "When it beheld Thee suspended on the Tree in the flesh, O Christ, the sun turned its light into darkness, the earth quaked, and the rocks split asunder.",
        "O pure receptacle of the Light, honored chariot of the Sun: Illumine my heart, which hath been darkened by the gloom of evils, and save me, I pray, O Mistress.",
        "O Maiden who of thy virginal blood didst weave a robe for Him Who covereth the sky with clouds: With a robe of incorruption clothe me who have been stripped naked by deception."
      ],
      theotokion: "The Creator took thee like a lily from the vales of life, and through thee He breathed forth a spiritual fragrance upon the world, O all-holy Virgin Bride of God."
    },
    6: {
      irmos: "O Christ Master, still Thou the sea of the passions which rageth with a soul-destroying tempest, and lead me up from corruption, in that Thou art compassionate.",
      troparia: [
        "Thou wast lifted up upon the Tree, O Long-suffering One, didst put down all the uprisings of the enemy, and in Thy surpassing goodness hast saved me who have fallen.",
        "No sooner did the souls of the righteous sense Thee surrendering Thy soul upon the Tree of old, O Word and Master, than they were released from everlasting bonds.",
        "I have no saving works; wherefore, with hope I flee under thy protection, O most immaculate Virgin. By thy supplications save me who am desperate.",
        "O pure receptacle of the Light, honored chariot of the Sun: Illumine my heart, which hath been darkened by the gloom of evils, and save me, I pray, O Mistress."
      ],
      theotokion: "O Virgin who lent Christ flesh of thy blood, wholly wash away my carnal passions, and show me the way of dispassion."
    },
    7: {
      irmos: "The supremely exalted Lord of our fathers quenched the flame and bedewed the children, who sang together: Blessed art Thou, O God!",
      troparia: [
        "The iniquitous assembly crowned Thee with thorns, O immortal King, who cuttest off the thorns of deception at the root. Blessed art Thou, O God!",
        "That Thou mightest clothe me in the vesture of incorruption, O Word, Thou didst willingly allow Thyself to be stripped naked; and though dispassionate by nature, Thou didst deign to be spat upon, crucified and subjected to suffering.",
        "O pure one, thou gavest birth to the Savior, the unshakable Foundation, Who by His command founded the earth upon the waters. Him do thou entreat, that He make us steadfast who in pure manner call thee blessed.",
        "O pure one, cause me to walk, unerringly and without being led astray, the path of the humility of the precepts of God, driving far from me the turmoil of the demons and the assaults of the passions, and granting me tranquillity."
      ],
      theotokion: "The enemy, seeing me stuck fast in the slumber of indifference, attacketh me mightily, hoping to carry me off by pleasurable dreams; but do thou thyself preserve me by thy tireless supplication, O pure Virgin Mother."
    },
    8: {
      irmos: "The children, forming a universal chorus in the furnace, chanted to Thee, the Creator of all: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
      troparia: [
        "O Most High God, Thou wast lifted up upon the Cross and given gall to eat, O Sweetness of life; and Thou wast pierced by a spear, slaying the serpent who laid Adam low in paradise.",
        "Bound of Thine own will, O Word, Thou freest me from the bonds of sin, binding the apostate foe with eternal bonds, O Savior. Wherefore, I glorify Thy sufferings forever.",
        "I hymn thee, O most hymned and most holy Virgin, for without seed thou gavest birth unto the most hymned God Who deifieth those who chant: Blessed art Thou, O God!",
        "Mortify my passions, O thou who gavest birth to Life, and raise me up who lie in the grave of insensibility, that I may glorify thee with love, O Bride of God."
      ],
      theotokion: null
    },
    9: {
      irmos: "Rejoice, O Isaiah! The Virgin hath conceived in her womb and borne a Son, Immanuel, both God and man. Orient is His name; and, magnifying Him, we call the Virgin blessed.",
      troparia: [
        "Thou wast lifted up upon the Tree like a lamb, O Christ our Master, breaking the jaws of the noetic wolf, snatching Thy reason-endowed sheep from his maw, and bringing them to the Father, O Master.",
        "As King of kings Thou wast crowned with a crown of thorns, O Christ, abolishing the rule of the evil one, and cutting the thorns of deception off at the root; wherefore, we glorify Thee with faith, O Good One.",
        "O pure one, thou gavest birth to the Savior, the unshakable Foundation, Who by His command founded the earth upon the waters. Him do thou entreat, that He make us steadfast who in pure manner call thee blessed.",
        "Past understanding is thy birthgiving, O Mother of God; for thou didst conceive within thee without knowing man, and thy birthgiving was virginal, in that it is God Who was born of thee. And magnifying Him, we bless thee, O Virgin."
      ],
      theotokion: "Past understanding is thy birthgiving, O Mother of God; for thou didst conceive within thee without knowing man, and thy birthgiving was virginal, in that it is God Who was born of thee. And magnifying Him, we bless thee, O Virgin."
    }
  }
},
            4: {
  metadata: {
    day:             "Thursday",
    theme:           "The Holy Apostles and Saint Nicholas",
    canons:          ["Canon of the Holy Apostles", "Canon of Saint Nicholas"],
    flatteningOrder: "Canon of the Apostles irmos governs; troparia: Canon of the Apostles then Canon of Saint Nicholas per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "53–57",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Bringing battles to nought with His upraised arm, Christ hath overthrown horse and rider in the Red Sea, and hath saved Israel, who chanteth a hymn of victory.",
      troparia: [
        "Enriched by the effulgence of Him Who first bestowed the gift of light, and Who deigned to converse with men in the flesh, O glorious and divine apostles, release my soul from all darkness.",
        "Drawing, the divine Bow loosed you like arrows at the whole world, O apostles, breaking all the arrows of the wicked and crafty one, and healing the wounds of the faithful.",
        "Uniting thyself unto God by faith and love, O father, thou didst fulfill His most holy desires, and thereby becamest holy in all things, O wise and holy hierarch Nicholas.",
        "Having thee as an intercessor before the Compassionate One, we who are beset by perils and griefs flee unto thee. Grant thou a hand that saveth us from all straits."
      ],
      theotokion: "Of old, the choir of the prophets foretold thee to be the divine mountain and impassable portal, O Virgin. Wherefore, we pray thee: Open unto us the divine gates of repentance, O Maiden."
    },
    3: {
      irmos: "O Christ Who by Thy command fixed the earth upon naught and suspended its weight unsupported: establish Thou Thy Church upon the immovable rock of Thy commandments, O Thou Who alone art good and lovest mankind.",
      troparia: [
        "He Who is exceeding great in goodness, and beggared Himself by assuming the flesh, with all manner of gifts enriched you, O glorious apostles, who became poor for His sake and have enriched the ends of the earth with divine and honorable understandings.",
        "I have sustained the venomous bite of the serpent, and my heart hath been wounded; wherefore, I cry out to Thee, O Christ, Who wast wounded for my sake: By the entreaties of Thine apostles heal and save me, I pray!",
        "Having shown forth an angelic life on earth, thou now ever standest with the angels before the throne of the Trinity, O sacred one, asking remission of our offenses and temptations, O father and chief hierarch Nicholas.",
        "With the opposition of thy divine labors, O venerable one, thou didst break the arrows of the evil one. And by thy supplications, O all-wise one, preserve thou, unharmed by his malice and violence, those who hymn thee, O great Nicholas."
      ],
      theotokion: "O thou who received the Rain of heaven, with the apostles entreat Him to cause the torrents of my passions to cease their flow, drying up my sin, and to save me who glorify thee in a pure manner."
    },
    4: {
      irmos: "Perceiving Thy divine condescension prophetically, O Christ, Habbakuk cried out to Thee with trembling: Thou art come for the salvation of Thy people, to save Thine anointed ones!",
      troparia: [
        "As the Door, Jesus, our God and Lord, opened to the apostles the understanding of Him, and through their teachings opened the door to all the nations.",
        "O Son of God, by fellowship Thou didst reveal the apostles as sons of the heavenly Father. Through their entreaty make us all children of the light.",
        "O apostles who will all-gloriously be seated on twelve thrones with the Judge and King, deliver me from the awesome and dread trial.",
        "By thy luminous supplications drive away all darkness from my mind, O Nicholas; still the tempest of my passions, O father, and steer me to the harbor of dispassion, I pray, that I may glorify thee in praise."
      ],
      theotokion: "O ark of divine sanctity, hallow my soul and enlighten my mind, ever praying to Christ with the apostles, that He save me."
    },
    5: {
      irmos: "O Thou Who art clothed in light as with a garment: I rise at dawn unto Thee, and to Thee do I cry: enlighten Thou my gloom-enshrouded soul, O Christ, in that Thou alone art compassionate!",
      troparia: [
        "In the upper room, the rhetors of the Spirit, the honored apostles, beheld the Holy Spirit Who came upon them in the guise of fire, and they received Him in awesome manner.",
        "O apostles who crush ungodliness, with the dew of healing heal my mind, which hath been crushed by transgressions.",
        "O apostles, Christ sent you forth like choice arrows, breaking the arrows of wickedness; wherefore, heal me who have been wounded by the arrows of the enemy.",
        "By thy supplications drive away all darkness from my mind, O Nicholas; still the tempest of my passions, O father, and steer me to the harbor of dispassion."
      ],
      theotokion: "Condemn me not, neither turn Thy face away from me, O greatly Merciful One!, the council of the apostles and she who gave Thee birth entreat Thee in a pure manner."
    },
    6: {
      irmos: "O Christ Master, still Thou the sea of the passions which rageth with a soul-destroying tempest, and lead me up from corruption, in that Thou art compassionate.",
      troparia: [
        "With the salt of the teaching of Thy sacred disciples Thou didst put an end to the corruption of evil for the souls of the nations, O Thou Who lovest mankind.",
        "Thou knowest the depths of mine evils, O Master Christ. Grant me Thy hand, and by the entreaties of Thy sacred apostles save me, O Thou Who lovest mankind.",
        "By thy supplications render the Master merciful unto all who honor thee, O Nicholas, that He may grant us remission of our transgressions.",
        "Those who have acquired thee as an advocate before the Lord, O Nicholas, do thou deliver from infirmities and the temptations of life, from perils and tribulations."
      ],
      theotokion: "Thou wast a mother who knew no husband, O pure Mother of God; wherefore, I pray thee with faith: Dispel the despondency of my soul."
    },
    7: {
      irmos: "The supremely exalted Lord of our fathers quenched the flame and bedewed the children, who sang together: Blessed art Thou, O God!",
      troparia: [
        "The supremely exalted Lord of our fathers exalted you supremely, O disciples of Christ who beheld God; and He cast down all the power of the enemy.",
        "With streams of compunction and your entreaties, O apostles, wash away the defilement of my heart, teaching me to cry: Blessed art Thou, O God!",
        "Christ the Master hath shown thee to be an excellent physician; wherefore, heal thou the infirmities of those who approach thee in piety, O Nicholas.",
        "Every wicked mouth which is opened against me do thou shut by thy supplications, O Nicholas, and deliver me from enemies, visible and invisible."
      ],
      theotokion: "O Virgin who set aright the fall of Adam, by your supplications and those of the divine apostles raise me up who have fallen into the defile of evil."
    },
    8: {
      irmos: "The children, forming a universal chorus in the furnace, chanted to Thee, the Creator of all: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
      troparia: [
        "O Word, Thou didst send forth Thine apostles as noetic clouds which let fall upon us the rain of all-wise and divine teachings and give us drink forever.",
        "O beholders of God, pillars of the Church all-adorned, surrounding it with the teachings of the Faith: with divine skill make steadfast the defiled house of my soul.",
        "O Nicholas, who wast a great hierarch in Myra, perfume the senses of my soul with myrrh, that I may escape the stench of the passions and receive the grace of the Comforter.",
        "With streams pouring forth from thy holy tongue, O all-wise one, thou didst stop the streams of the blasphemy of Arius; wherefore, we cry out to thee: By thy supplications dry up the streams of my passions, O most blessed Nicholas!"
      ],
      theotokion: null
    },
    9: {
      irmos: "Rejoice, O Isaiah! The Virgin hath conceived in her womb and borne a Son, Immanuel, both God and man. Orient is His name; and, magnifying Him, we call the Virgin blessed.",
      troparia: [
        "By the splendors of divine virtues ye were noetically shown to be starry skies, having Christ, the Sun, in your midst; and ye have renewed the ends of the earth, O all-wise ones; wherefore, we call you blessed.",
        "Bearing the wounds of Christ upon your divine bodies like most magnificent armor, O all-wise ones, by your mediations before the Lord heal my soul, which hath been wounded by the darts of the demons.",
        "As a divine and holy hierarch thou didst keep all the commandments of Christ; wherefore, thou wast the godly preserver of the faithful. O father Nicholas, preserve them from all perils and afflictions.",
        "As once, as a good shepherd, thou feddest thy city, which was starving in hunger, so now feed thou my soul with the bread of understanding, O father Nicholas, for I have acquired thee as a good helper."
      ],
      theotokion: "O all-pure one, the prophet foresaw thee as the radiant lampstand bearing Christ, the noetic Lamp, by Whom we have been enlightened who lie in darkness and the passions. And we call thee blessed, O Ever-virgin Theotokos."
    }
  }
},
           5: {
  metadata: {
    day:             "Friday",
    theme:           "The Holy Cross and the Theotokos",
    canons:          ["Canon of the precious and life-creating Cross", "Canon of the Theotokos"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross then Canon of the Theotokos per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "62–67",
    verified:        true
  },
  odes: {
    1: {
      irmos: "To God the Savior, Who led His people in the sea with dryshod feet and drowned Pharaoh and all his army, let us chant alone, for He is glorious.",
      troparia: [
        "By Thine own will Thou didst endure the passion-slaying Passion, O Christ, and didst slay him who of old brought death upon us in paradise; wherefore, we glorify Thy goodness.",
        "Thou wast uplifted upon the Cross, and the enemy fell headlong; and we, who are fallen, have been raised up and made inhabitants of paradise, O Christ, glorifying the might of Thy kingdom.",
        "I know thee, O most immaculate Mary, Virgin and Mother, to be a well-spring of compassion and a fervent intercessor; and I cry out to thee: Have mercy and compassion upon my lowly soul.",
        "Making His abode within thy womb, and taking human essence upon Himself, in that He is good, O pure one, the Son of God hath delivered all from the corruption of the serpent."
      ],
      theotokion: "Making His abode within thy womb, and taking human essence upon Himself, in that He is good, O pure one, the Son of God hath delivered all from the corruption of the serpent."
    },
    3: {
      irmos: "By the power of Thy Cross, O Christ, establish Thou my mind, that I may hymn and glorify Thy saving resurrection.",
      troparia: [
        "Nailed to the Tree, O Savior, Thou dost cause the fruit of corruption to wither away, and from Thy side dost pour forth upon us streams of incorruption, O Master.",
        "Thou wast uplifted upon the Cross, and the enemy fell headlong; and we, who are fallen, have been raised up and made inhabitants of paradise, O Christ, glorifying the might of Thy kingdom.",
        "Be mine enlightenment and hope of salvation, O most immaculate Theotokos, loosing the bonds of my transgressions, and delivering me from the torments and condemnation which are to come.",
        "Free my lowly soul from wicked thoughts, O Theotokos, and make it a dwelling-place of God, that I may always glorify thee as is meet."
      ],
      theotokion: "Free my lowly soul from wicked thoughts, O Theotokos, and make it a dwelling-place of God, that I may always glorify thee as is meet."
    },
    4: {
      irmos: "I heard report of the power of the Cross, that paradise hath been opened thereby, and I cried aloud: Glory to Thy power, O Lord!",
      troparia: [
        "When Thou didst set upon the Cross, O Christ, Sun of righteousness, Thou didst shine forth never-waning light upon us who hymn Thine awesome dispensation, O Word.",
        "When once thou didst stand before the judgment-seat, O Christ our Judge, Thou didst condemn the unjust foe; and Thou wast crucified between the unrighteous thieves, justifying us.",
        "When thou didst behold on the Cross Christ to Whom thou gavest birth, O pure one, thou didst marvel at His ineffable long-suffering; wherefore, we glorify thee with Him.",
        "Who can entreat the Judge concerning my wicked deeds and my transgressions if not thee, O pure one, thou only helper of the sinful?"
      ],
      theotokion: "Who can entreat the Judge concerning my wicked deeds and my transgressions if not thee, O pure one, thou only helper of the sinful?"
    },
    5: {
      irmos: "Rising at dawn, we cry to Thee: Save us, O Lord! for Thou art our God, and we know none other than Thee.",
      troparia: [
        "When the rocks felt Thee uplifted upon the Tree, O Christ, they split asunder, and the foundations of the earth were shaken.",
        "The sun set aside its radiance when Thou wast uplifted upon the Tree, O long-suffering Sun of righteousness.",
        "Seeing the Savior uplifted upon the Cross, O most immaculate Virgin Mother, thou didst lift up thy voice in lamentation.",
        "O Mistress, apply the poultice of thy lovingkindness to the bruises which through sin have come to cover my whole body."
      ],
      theotokion: "O Mistress, apply the poultice of thy lovingkindness to the bruises which through sin have come to cover my whole body."
    },
    6: {
      irmos: "The abyss engulfed me, and the sea monster became a tomb for me; yet I cried unto Thee Who lovest mankind, and Thy right hand saved me, O Lord.",
      troparia: [
        "When the Cross was planted in the ground, the fall of the demons took place, faith received the beginning of its confirmation, and evil hath been driven from our midst.",
        "The sun was extinguished when Thou didst light Thy flesh like a lamp upon the Tree, O Lord; and the coin was found which had been lost through the dark passions.",
        "Of old thou didst halt the advance of corruption by thy divine birthgiving, O all-immaculate one, and thou hast now stopped the advance of my transgressions.",
        "By thy power, O all-pure one, raise me up who have fallen through many transgressions and enslaved my soul through sins, and free me from slavery through thy supplication."
      ],
      theotokion: "By thy power, O all-pure one, raise me up who have fallen through many transgressions and enslaved my soul through sins, and free me from slavery through thy supplication."
    },
    7: {
      irmos: "Blessed is the God of our fathers, Who saved the children who chanted unto Him in the fiery furnace.",
      troparia: [
        "That we might be delivered from pleasurable sin, Thou didst taste gall, O Christ, Thou sweetness of life.",
        "When Thou wast wounded on the Tree, O Christ, Thou didst heal the wounds Adam had suffered for many years.",
        "O pure Theotokos, disdain not who with faith ever flee beneath thy protection.",
        "O Theotokos who ever driest up the pasture of my passions, grant that I may shed drops of tears."
      ],
      theotokion: "By thy supplications release me who am bound with the chains of my sins, O all-immaculate one who gavest birth to our most hymned God."
    },
    8: {
      irmos: "The Son and God, Who was begotten of the Father before the ages, and in latter times became incarnate of the Virgin Mother, hymn, ye priests, and exalt Him supremely for all ages!",
      troparia: [
        "O Savior, Who healed the curse of the tree by the Tree and hast poured forth blessing upon men, we hymn and glorify Thee forever!",
        "By Thy Cross Thou didst bring down the serpent who exalted himself, and when Thou wast laid low Thou didst raise up him who had grievously fallen. Thee, O Savior, do we hymn and exalt supremely for all ages!",
        "O pure Theotokos, disdain not who with faith ever flee beneath thy protection.",
        "Unto thee do I flee with faith, O pure one, and to thee do I cry: Deliver me from everlasting fire, O Virgin!"
      ],
      theotokion: null
    },
    9: {
      irmos: "With oneness of mind, we, the faithful, magnify thee, the Mother of God, who, in manner past understanding and recounting, ineffably gavest birth in time to the Timeless One.",
      troparia: [
        "The might and dominion of the enemy were taken away, O only mighty Lord, when Thou wast uplifted upon the Cross and didst bloody Thy fingers thereon.",
        "O my Christ, the iniquitous ones who crucified Thee impaled Thy hands and feet and reckoned the number of Thy bones; and they gave Thee vinegar with gall to drink.",
        "At a loss, I have no fear of the threat of Gehenna in either heart or mind, and I ever commit sins; but do thou, O Virgin, free me from perplexity, and deliver me from the fire.",
        "I am often dragged out and sold like a captive by the pleasures of my flesh, and I ever anger God. O Theotokos, only help of the helpless, do thou thyself have mercy upon me!"
      ],
      theotokion: "Thy supplication is sure and certain, O most immaculate one, for whatsoever things thou desirest thou givest, entreating thy Son and God. Wherefore, I pray thee: Have mercy and save my lowly soul!"
    }
  }
},
            6: {
  metadata: {
    day:             "Saturday",
    theme:           "All Saints and the Departed",
    canons:          ["Canon of All Saints", "Canon of the Departed"],
    flatteningOrder: "Canon of All Saints irmos governs; troparia: Canon of All Saints then Canon of the Departed per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "72–78",
    verified:        true
  },
  odes: {
    1: {
      irmos: "The land on which the sun had never shone, and which it had not seen, and the abyss which the expanse of heaven had never seen uncovered, did Israel cross dryshod, O Lord; and Thou didst lead them to the mountain of Thy holiness, as they gave praise and chanted a hymn of victory.",
      troparia: [
        "Surrendering your bodies to arrogant judges, ye endured unbearable wounds, O valiant athletes, expecting to receive honors from on high; and Christ led you into the eternal mansions of those who rejoice and chant thy hymn of victory.",
        "The venerable and the righteous, and the holy hierarchs, fulfilling the right glorious precepts of God, pastured the people and guided them to the water of understanding; and they have worthily received torrents of sweetness, pouring forth rivers of healing through grace.",
        "With divine love the passion-bearers of Christ trampled the pride of the tyrants underfoot; and with faith they ask prayerful remission and rest for the departed.",
        "Cause the departed to dwell in Thy holy habitations and courts, O Christ Master, Who shed Thine all-precious blood to redeem our debt."
      ],
      theotokion: "Rejoice!, I cry to thee who gavest birth to Joy, O most hymned one. Enlighten our minds and souls, and guide all in the steps of understanding, and entreat thy Son and God, that He grant cleansing of transgressions unto all, O only Bride of God."
    },
    3: {
      irmos: "O Lord, make steadfast my heart, which is buffeted by the waves of life, guiding it into calm harbor, in that Thou art God.",
      troparia: [
        "Ye spared not your bodies when they were beaten with staves and dismembered by the sword, O most lauded warrior martyrs, who were strengthened by the hope of everlasting good things.",
        "Ye enlightened the vesture of the hierarchy, shepherding the flock of Christ in the fields of life through the virtues.",
        "Struggling manfully, the athletes withstood the assaults of the tyrants; and they pray to Christ in behalf of those who have fallen asleep.",
        "Receiving in Thy splendid mansions those who were nurtured on Thy laws and have reposed, grant them rest, O Good One."
      ],
      theotokion: "As they beheld thee, blessed among women, the company of women suffered and were taken to thy Son, O Virgin Mother."
    },
    4: {
      irmos: "I heard report of Thee, O Lord, and was afraid; I understood Thy dispensation, and glorified Thee, Who alone lovest mankind.",
      troparia: [
        "By Thy power, O Lord, the passion-bearers trampled the power of the enemy underfoot, and became for the faithful might and great confirmation.",
        "All the venerable now rejoice with great joy, and the divine priests are clothed in righteousness as in a garment.",
        "Guiding to the harbor of Thy kingdom those whom Thou hast taken from the tumult and tempest of this present life, O Master, grant them rest."
      ],
      theotokion: "Through thee, O Virgin, hath the Timeless One now come under time. Him do thou entreat, that He free my soul from the transgressions I have committed in time."
    },
    5: {
      irmos: "Thou hast come, O my Lord, as a light into the world: a holy light turning from the darkness of ignorance those who hymn Thee with faith.",
      troparia: [
        "The bones of the martyrs pour forth healing upon the infirm, for, unbroken by malice, they restore our broken state and grind to dust all the bones of ungodliness.",
        "Observing Thy laws, the holy hierarchs shepherded the people and guided them to the life which is to come, O Compassionate One; and the venerable ones slew the tyranny of the passions with perfect mind.",
        "Let the prophets be honored, and with them all who were righteous by faith; and let the divine women who lived in holiness and shone forth on earth through their torments be praised as servants of Christ.",
        "O greatly Merciful One, Thou Life of all, vouchsafe unto the dead who in faith have passed from us unto Thee, the Creator, that they may dwell in light with Thy saints."
      ],
      theotokion: "With mouth, tongue and heart I confess thee to be the pure Mother of our God, O Maiden. By thy mediation deliver me from everlasting damnation."
    },
    6: {
      irmos: "I will sacrifice to Thee with a voice of praise, O Lord, the Church crieth unto Thee, cleansed of the blood of demons by the blood which, for mercy's sake, flowed from Thy side.",
      troparia: [
        "Like most costly stones all-wisely rolling upon the earth, O martyrs, ye demolished the whole structure of ungodliness and became temples of God.",
        "From violent hands ye save all who are under your hands, O holy, righteous and venerable hierarchs, preserving the flock in Christ; wherefore, ye are called blessed.",
        "Let the flaming sword, beholding the spear which pierced Thy divine side, withdraw before Thy servants, O Savior, at the entreaties of Thy passion-bearers.",
        "Thou didst combine virginity with divine birthgiving, O all-pure one; for thou didst ineffably give birth to the Creator of all things, unto Whose will all submit."
      ],
      theotokion: "Thou didst combine virginity with divine birthgiving, O all-pure one; for thou didst ineffably give birth to the Creator of all things, unto Whose will all submit."
    },
    7: {
      irmos: "The children of Abraham in the Persian furnace, afire with love of piety more than with the flame, cried out: Blessed art Thou in the temple of Thy glory, O Lord!",
      troparia: [
        "Together let us in gladness of soul hymn the martyrs of the Lord, the sanctified vessels of Christ the Master, the bulwarks and pillars of the Church.",
        "The holy hierarchs, prophets and martyrs, who fought the sacred fight, have received a sacred habitation with the angels, and with them ask that cleansing and great mercy be given to us all.",
        "Accepting the endurance and patience and the blood of all the martyrs, grant rest unto those who in piety have fallen asleep in Thee, in that Thou art merciful and right placable.",
        "Rejoice, O blessed Theotokos, Virgin Mother, for in thee the destruction of death hath been wrought and life indestructible been given to those who have died."
      ],
      theotokion: "Rejoice, O blessed Theotokos, Virgin Mother, for in thee the destruction of death hath been wrought and life indestructible been given to those who have died."
    },
    8: {
      irmos: "Stretching forth his hands, Daniel shut the lions' mouths in the pit; and the young lovers of piety, girded about with virtue, quenched the power of the fire, crying out: Bless the Lord, all ye works of the Lord!",
      troparia: [
        "The holy hierarchs, prophets and martyrs and women, who fought the sacred fight, have received a sacred habitation with the angels, and with them ask that cleansing and great mercy be given to us all.",
        "Having been ordained as bishops for the people and made yourselves radiant through fasting, O holy hierarchs who preached God, ye shone forth more brightly than the sun, illumining the faithful in the manifestation of great deeds, O venerable ones.",
        "Numbering the souls of Thy servants who have passed on to Thee among the firstborn and Thy righteous, O Savior, vouchsafe that they may unceasingly delight in Thee Who hast dominion over all.",
        "We hymn thee, O Mother of God, through whom the ineffable and unapproachable Light hath shone forth on those in darkness, and we bless thee with love."
      ],
      theotokion: null
    },
    9: {
      irmos: "Every earthly creature rejoice, illumined by the Spirit; and let the nature of the bodiless intelligences celebrate the honorable feast of the Mother of God and cry: Rejoice, O most blessed Theotokos pure Ever-virgin!",
      troparia: [
        "Seeing the divine gifts and receiving honors for their great pangs, the martyrs rejoice, magnifying Christ Who truly magnified them and showed them to be victors.",
        "Having been ordained as bishops for the people and made yourselves radiant through fasting, O holy hierarchs who preached God, ye shone forth more brightly than the sun, illumining the faithful in the manifestation of great deeds, O venerable ones.",
        "Let us bless all the venerable and the righteous, the hieromartyrs and all the prophets, and the women who splendidly pleased God, crying out: At their entreaties, O Christ, deliver our souls from Gehenna!",
        "Unto true martyrs and athletes Thou gavest the boldness to entreat Thee, O Lord. For their sake give divine deliverance unto those who have reposed in faith, granting them to dwell in a place of holy habitation."
      ],
      theotokion: "O most immaculate one who wast revealed to be more exalted than the cherubim, in that thou gavest birth to the Sustainer of all things, elevate my mind, strengthening me against the carnal passions, that I may do the will of the Master."
    }
  }
}
        },

        5: {
            1: {
  metadata: {
    day:             "Monday",
    theme:           "Repentance and the Bodiless Powers",
    canons:          ["Canon of Repentance to our Lord Jesus Christ", "Canon of the Incorporeal Hosts"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Incorporeal Hosts per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "22–27",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Let us chant unto the Lord, Who led His people through the Red Sea, for He alone hath gloriously triumphed.",
      troparia: [
        "O merciful Savior, as once Thou didst pardon the harlot and the thief, so pardon also me who have sinned more than they, in that Thou art good and lovest mankind.",
        "O compassionate Savior, I have been wounded by the spear of despondency. Do Thou Who art all-compassionate, heal me, a sinner who with faith falleth down before Thee.",
        "O ye angels who stand before the face of God, entreat Him for us sinners, that He Who in His goodness created us grant us remission of sins.",
        "O ye incorporeal hosts, who stand round the unapproachable throne of the Lord of all, unceasingly ask Him to give peace to the world and our souls great mercy."
      ],
      theotokion: "Hail, O unwedded Virgin, who gavest birth to God the Word for the salvation of all! Through thee we have found salvation, O Theotokos, thou who art blessed among women."
    },
    3: {
      irmos: "O Lord, Who didst create all things by Thy Word and didst fashion man by Thy wisdom, confirm me on the unshakeable rock of Thy love, for Thou alone art holy and lovest mankind.",
      troparia: [
        "Having run in haste into the pit of vices and having filled my wretched soul with unseemly works, I flee unto Thee, O Christ God: Grant me, the prodigal, the grace of repentance.",
        "I have sinned and done evil before Thee, O Christ our God; but pardon me through the repentance of my heart, O only long-suffering One, in that Thou art good and lovest mankind.",
        "O bright ones, who are adorned with unapproachable light and who stand before the Lord, the holy angels: Make entreaty for those who in faith hymn your light-bearing order.",
        "Standing in holiness before the terrible throne of God and the divine glory, O incorporeal ones, cease not to beseech Christ to grant mercy and peace to the world."
      ],
      theotokion: "O most immaculate one, who without seed gavest birth to the Lord of all, cease not to make entreaty for those who with longing and faith take refuge under thy shelter."
    },
    4: {
      irmos: "I have heard, O Lord, the report of Thy dispensation and I have glorified Thee, O Thou Who alone lovest mankind.",
      troparia: [
        "Accept, O Christ, the compunction of us who fall down before Thee, for we have no good works and our souls are enslaved to sin; but do Thou, in Thine ineffable mercy, save us.",
        "O Lord, I have grievously transgressed, having served the desires of the flesh; but do Thou, O greatly Merciful One, receive me who repent, and have mercy on me.",
        "O ye angels who stand before the glory of God, and ye archangels who are ministers of the divine will, entreat Christ to grant us remission of offenses and great mercy.",
        "O ye divine hosts, who serve the Lord with the seraphim and the cherubim and together with them unceasingly send up the thrice-holy hymn, intercede for those who hymn you."
      ],
      theotokion: "O all-immaculate Virgin, who didst conceive the Son of God and who art the Queen of all, from the eternal fire deliver the souls of those who flee unto thee."
    },
    5: {
      irmos: "Illumine us, O Lord, with Thy commandments, and with Thine upraised arm grant Thy peace to us, O Thou Who lovest mankind.",
      troparia: [
        "O compassionate Lord, I have squandered my life in the pleasures of sin; but do Thou in Thine ineffable goodness, O Christ, receive me who repent and turn back to Thee.",
        "Granting me tears of compunction, O my Christ, wash away the multitude of my sins, for I have become wholly darkened and enslaved to the passions, O Thou Who lovest mankind.",
        "Standing before the throne of the divine glory in holiness, O ye angelic hosts, cease not to entreat the Lord to send down peace and great mercy upon us.",
        "O ye divine armies of the first ranks of heaven, who are ministers of God and lamps of light to the world, enlighten our souls which are darkened by the passions."
      ],
      theotokion: "O thou who gavest birth to the God of all, make thou intercession for those who with faith hymn thee, O pure Theotokos, that they may be delivered from every tribulation."
    },
    6: {
      irmos: "Having sunk to the very depths of sin, I cry unto Thee, O God of compassion: Raise me up!",
      troparia: [
        "Enslaved by the most tyrannical passions, I fall down before Thee, O greatly Merciful One, and cry unto Thee: As once Thou didst deliver the prodigal, so deliver me also.",
        "Freed by Thee from subjection to the passions, the saints received light; but I, being weighed down by them, fall down before Thee and pray: Enlighten me also, O only Light.",
        "O holy angels and archangels, make entreaty to God for us who are immersed in sins, that He Who is merciful deliver our souls from eternal punishment.",
        "O incorporeal powers, who hymn God with unceasing voices, intercede with Christ our God for those who faithfully fall down before you, that He may grant them great mercy."
      ],
      theotokion: "O most pure Theotokos, who art the treasury of our great joy: Deliver me from every sorrow and grief and vouchsafe me the good things which are to come."
    },
    7: {
      irmos: "The godly youths in the furnace combined fasting with song and declared: Blessed art Thou, O God of our fathers!",
      troparia: [
        "Having become a slave of sin and wholly enslaved to the pleasures of the flesh, I cry to Thee: O God of our fathers, deliver me from the bonds of sin!",
        "O Christ, Who alone art compassionate, in Thy goodness save me who am become the captive of transgressions, and free me from the bonds of sin; for I cry: O God of our fathers, blessed art Thou!",
        "O all-holy powers, who hymn God in heaven with unceasing songs, cease not to intercede for us before God, crying: Blessed art Thou, O God of our fathers!",
        "Receiving no benefit from our good works and having no boldness before God, we flee unto the intercession of the angels who serve Him, crying: Blessed art Thou, O God of our fathers!"
      ],
      theotokion: "O most immaculate Virgin, who alone art pure among women, having given birth to the Word Who is before all ages, cease not to intercede for those who cry: Blessed art thou who gavest birth to God in the flesh!"
    },
    8: {
      irmos: "The divinely wise youths worshiped not the creature instead of the Creator, but manfully treading the threat of fire underfoot, they rejoiced as they chanted: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
      troparia: [
        "O Savior Who art rich in compassion, I have become wretched and destitute of good works, and am in want of Thy mercy; cast me not away, but receive me who repent, and have mercy on me, that I may cry: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "O Savior, in Thy divine goodness receive my repentance and have mercy on me, as once Thou didst have mercy on the harlot and the publican; for I cry to Thee: All ye works of God, hymn the Lord and exalt Him supremely for all ages!",
        "O ye divine powers, who are ministers of the Almighty Lord and ever stand before His throne, intercede for us who cry: All ye works of God, hymn the Lord and exalt Him supremely for all ages!",
        "O ye holy angels, defenders of the human race, be ye guardians and shelters for those who fall down before you in faith and cry: All ye works of God, hymn the Lord and exalt Him supremely for all ages!"
      ],
      theotokion: null
    },
    9: {
      irmos: "It is truly meet to call thee blessed, O Theotokos, ever-blessed and most blameless and the Mother of our God. More honorable than the Cherubim and more glorious beyond compare than the Seraphim: without corruption thou gavest birth to God the Word. True Theotokos, we magnify thee.",
      troparia: [
        "O Christ my God, Who alone art compassionate, receive my repentance and have mercy on me, as once Thou didst have mercy on the publican; for I fall down before Thee and cry: O Theotokos, magnify us who faithfully magnify thee!",
        "Having squandered the wealth of virtues through the poverty of evil works, I fall down before Thee, O Christ, and cry: Accept me who turn back, in that Thou art compassionate, and magnify me together with Thy saints.",
        "O ye angelic hosts, ministers of the divine glory, who send up the thrice-holy hymn to the Trinity, cease not to intercede for those who with faith honor the divine order of the angels.",
        "O ye armies of the bodiless powers, who hymn the Trinity with voices of fire, intercede before God for those who with faith hymn you, that He may grant them great mercy."
      ],
      theotokion: "O pure Theotokos, thou haven of salvation and fervent intercessor: From every tribulation, danger, and eternal condemnation deliver those who with faith take refuge in thee."
    }
  }
},
            2: {
  metadata: {
    day:             "Tuesday",
    theme:           "Repentance and the Holy Forerunner John the Baptist",
    canons:          ["Canon of Repentance to our Lord Jesus Christ", "Canon of the Holy Forerunner and Baptist John"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Forerunner per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "27–33",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Let us chant unto the Lord, Who led His people through the Red Sea, for He alone hath gloriously triumphed.",
      troparia: [
        "O long-suffering Lord, I have sinned against Thee in knowledge and in ignorance; but as Thou art good, have mercy on me, and turn me from the captivity of sin, for I cry unto Thee with faith.",
        "O Savior, I have squandered the wealth of good works and am naked of every virtue; but clothe me with the garment of repentance, O compassionate One, and save me.",
        "O glorious Forerunner of the Lord, thou who art the greatest among those born of women: By thy supplications preserve those who honor thee from every grief and tribulation.",
        "O divine Forerunner of the Lord, who didst leap for joy in thy mother's womb while yet unborn: Earnestly intercede before God for those who honor thee with love."
      ],
      theotokion: "O Virgin Theotokos, who gavest birth to Christ the Savior: Together with the Forerunner and all the saints intercede for those who honor thee with faith."
    },
    3: {
      irmos: "O Lord, Who didst create all things by Thy Word and didst fashion man by Thy wisdom, confirm me on the unshakeable rock of Thy love, for Thou alone art holy and lovest mankind.",
      troparia: [
        "O compassionate Lord, as once Thou didst receive the prodigal, so receive also me who return to Thee through repentance; for I fall down before Thee and pray: Grant me remission of my transgressions.",
        "O Christ, receive me who, like the woman who lost the coin, have lost the image of Thine incorruption through sins, and grant me the grace of repentance.",
        "O glorious prophet, thou didst rebuke kings and wast not ashamed, adorning thyself with the courage of the Spirit; entreat the Master to deliver from passions those who honor thee.",
        "Thou didst stand in the wilderness as an angel in the flesh, O blessed one, feeding on locusts and wild honey and watering the earth with thy sweat; entreat Christ to grant us mercy."
      ],
      theotokion: "O most immaculate Theotokos, thou protection of Christians: Shelter beneath the wings of thy lovingkindness those who flee unto thee, and save them from every adversity."
    },
    4: {
      irmos: "I have heard, O Lord, the report of Thy dispensation and I have glorified Thee, O Thou Who alone lovest mankind.",
      troparia: [
        "O Christ my God, I have transgressed Thy divine commandments and trampled Thy law; receive me who repent, O compassionate One, for I fall down before Thee in faith.",
        "I have fallen into the pit of evils and of mine own will have been enslaved to sin; but raise me up, O Christ, who art long-suffering, and receive me who repent.",
        "O Forerunner of the Lord, who didst pour water upon the head of the Lord of glory: Wash me from the stains of sin by thy holy supplications.",
        "Thou didst preach in the desert as a voice crying aloud, O blessed one, preparing the way of the Lord; and now, standing before Him in heaven, cease not to intercede for us."
      ],
      theotokion: "O most pure Theotokos, thou pride of the world and joy of all the faithful: By thy supplications loose the bonds of my transgressions and save me."
    },
    5: {
      irmos: "Illumine us, O Lord, with Thy commandments, and with Thine upraised arm grant Thy peace to us, O Thou Who lovest mankind.",
      troparia: [
        "O Savior Who art merciful, I cry unto Thee with all my heart: Receive me who return to Thee through repentance, and grant me remission of my transgressions.",
        "O Lord Who art good and lovest mankind, I have grown old in evil deeds; but receive me who repent, O compassionate One, granting me compunction of heart.",
        "Thou wast the lamp of the Sun of righteousness, O blessed Forerunner, and the herald of His saving coming; wherefore, entreat Him to enlighten our souls.",
        "Thou didst baptize with water the One Who baptizeth with the Holy Spirit, O glorious one, and thou didst hear the voice of the Father above the waters; wherefore, intercede for us before the Lord."
      ],
      theotokion: "O Virgin who gavest birth to the Lord, be thou an intercessor for those who honor thee, that we may obtain remission of sins and deliverance from eternal fire."
    },
    6: {
      irmos: "Having sunk to the very depths of sin, I cry unto Thee, O God of compassion: Raise me up!",
      troparia: [
        "I have sinned and done lawless deeds before Thee, O compassionate Christ; but as once Thou didst forgive the thief upon the cross, so forgive also me who repent.",
        "Deliver me from the dark pit of passions, O Christ Who art the Deliverer of the captives, and save me who cry unto Thee with compunction and faith.",
        "O glorious Forerunner, who didst leap for joy at the voice of the Mother of God: Entreat the Savior to grant joy to those who honor thee with love.",
        "Thou wast beheaded for the sake of righteousness, O prophet and Forerunner; wherefore, bowing before thine honored head, we ask: Intercede before Christ for our souls."
      ],
      theotokion: "O most pure Mistress, who art the intercessor of sinners: Receive the supplications of thy servants and present them before thy Son and our God, that He may save our souls."
    },
    7: {
      irmos: "The godly youths in the furnace combined fasting with song and declared: Blessed art Thou, O God of our fathers!",
      troparia: [
        "O Christ Who art compassionate, receive my prayer and my sighing, and grant me, who am enslaved to sin, the gift of repentance; for I cry: Blessed art Thou, O God of our fathers!",
        "O my Christ, I have spent my whole life in sloth and negligence and have grievously sinned against Thee; but in Thine ineffable mercy save me, who cry: Blessed art Thou, O God of our fathers!",
        "O glorious Forerunner, thou didst suffer for the sake of the Truth and wast beheaded by the iniquitous Herod; intercede before Christ for those who cry: Blessed art Thou, O God of our fathers!",
        "O holy prophet of the Most High, who art the lamp of the light of grace and the seal of all the prophets: Intercede before God for those who cry: Blessed art Thou, O God of our fathers!"
      ],
      theotokion: "O pure Theotokos, thou intercessor for sinners: Cease not to intercede before thy Son and our God for those who cry: Blessed art thou who gavest birth to God in the flesh!"
    },
    8: {
      irmos: "The divinely wise youths worshiped not the creature instead of the Creator, but manfully treading the threat of fire underfoot, they rejoiced as they chanted: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
      troparia: [
        "O Christ Who art compassionate, I am ashamed at the multitude of mine evil deeds and tremble before Thy righteous judgment; but receive me who repent, O greatly Merciful One, that I may cry: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "O greatly Merciful One, loose the bonds of my sins and grant me the grace of amendment, that I may offer Thee the fruit of repentance and cry: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "O Forerunner of the Lord, thou didst prepare the way of His coming with divine boldness; and now standing before Him, cease not to intercede that we may cry: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "O glorious Forerunner, thou didst point out the Lamb of God Who taketh away the sin of the world; wherefore, entreat Him for those who cry: Hymn the Lord, all ye works, and exalt Him supremely for all ages!"
      ],
      theotokion: null
    },
    9: {
      irmos: "It is truly meet to call thee blessed, O Theotokos, ever-blessed and most blameless and the Mother of our God. More honorable than the Cherubim and more glorious beyond compare than the Seraphim: without corruption thou gavest birth to God the Word. True Theotokos, we magnify thee.",
      troparia: [
        "O Christ my God, Who alone art compassionate, in Thine ineffable goodness receive me who repent, and as Thou art the Lover of mankind, have mercy on me who fall down before Thee, and magnify me with Thy saints.",
        "O greatly Merciful Savior, though I have no virtue and am naked of good works, yet I cry unto Thee with compunction: Magnify me who am unworthy, together with those who have pleased Thee.",
        "O glorious Forerunner, thou art the lamp of the True Light and the friend of the Bridegroom; wherefore, intercede before Christ for those who hymn thee, that He may grant us great mercy.",
        "O blessed Forerunner of the Lord, thou didst cry in the wilderness: Prepare ye the way of the Lord; and now standing in the heavens before the Lord, intercede for us who faithfully hymn thee."
      ],
      theotokion: "O pure Theotokos, thou haven of the storm-tossed and fervent intercessor: From every tribulation, danger, and eternal condemnation deliver those who with faith take refuge in thee."
    }
  }
},
            3: {
  metadata: {
    day:             "Wednesday",
    theme:           "The Holy Cross and the Theotokos",
    canons:          ["Canon of the Holy and Life-creating Cross", "Canon of the Theotokos"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross then Canon of the Theotokos per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "33–39",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Let us chant unto the Lord, Who led His people through the Red Sea, for He alone hath gloriously triumphed.",
      troparia: [
        "Uplifted upon the Cross of Thine own will, O Christ, Thou didst draw up with Thee those who were brought low by sin, granting them incorruption.",
        "Stretched out upon the Cross, O Word, Thou didst stretch out Thine arms and gathered together those who were scattered, uniting them to the Father.",
        "O most immaculate Theotokos, the staff of the faithful and the confirmation of those who are in tribulations: Deliver from every adversity those who flee unto thee."
      ],
      theotokion: "O most immaculate Theotokos, the staff of the faithful and the confirmation of those who are in tribulations: Deliver from every adversity those who flee unto thee."
    },
    3: {
      irmos: "O Lord, Who didst create all things by Thy Word and didst fashion man by Thy wisdom, confirm me on the unshakeable rock of Thy love, for Thou alone art holy and lovest mankind.",
      troparia: [
        "Thou didst stretch out Thy hands upon the Cross, O Savior, gathering together those who were scattered, and hast reconciled to the Father those who were estranged.",
        "Having been lifted up upon the Cross, O Savior, Thou didst lift up with Thee human nature which had been cast down, granting it divine life.",
        "O most pure Theotokos, the confirmation of those who have recourse to thee with faith: Deliver from all tribulation those who hymn thee."
      ],
      theotokion: "O most pure Theotokos, the confirmation of those who have recourse to thee with faith: Deliver from all tribulation those who hymn thee."
    },
    4: {
      irmos: "I have heard, O Lord, the report of Thy dispensation and I have glorified Thee, O Thou Who alone lovest mankind.",
      troparia: [
        "Thou wast uplifted upon the Tree, O Master, and didst draw all men unto Thyself, as Thou Thyself didst promise, O Lord.",
        "By the Cross, O Savior, Thou didst trample upon the enemy and didst grant victory to those who glorify Thee with faith.",
        "O most immaculate Theotokos, thou art the confirmation of the faithful and the protection of those who hymn thee: Deliver from all harm those who take refuge in thee."
      ],
      theotokion: "O most immaculate Theotokos, thou art the confirmation of the faithful and the protection of those who hymn thee: Deliver from all harm those who take refuge in thee."
    },
    5: {
      irmos: "Illumine us, O Lord, with Thy commandments, and with Thine upraised arm grant Thy peace to us, O Thou Who lovest mankind.",
      troparia: [
        "Uplifted upon the Tree, O Word, Thou didst uproot the tree of disobedience and hast planted the tree of life for those who hymn Thee.",
        "Thy Cross, O Lord, is the weapon of peace and the trophy of victory over the enemy; by it preserve those who glorify Thee.",
        "O pure one, thou gavest birth to God the Word, Who became flesh for our sake; cease not to intercede for those who hymn thee."
      ],
      theotokion: "O pure one, thou gavest birth to God the Word, Who became flesh for our sake; cease not to intercede for those who hymn thee."
    },
    6: {
      irmos: "Having sunk to the very depths of sin, I cry unto Thee, O God of compassion: Raise me up!",
      troparia: [
        "Thou didst voluntarily accept the Cross, O long-suffering Lord, and didst deliver from the ancient curse those who glorify Thee.",
        "Thou wast pierced in the side by a spear, O Master, and hast healed the wound of the sin of our forefather Adam.",
        "O all-immaculate Theotokos, thou art the haven of those who take refuge in thee: From every tribulation deliver those who hymn thee with love."
      ],
      theotokion: "O all-immaculate Theotokos, thou art the haven of those who take refuge in thee: From every tribulation deliver those who hymn thee with love."
    },
    7: {
      irmos: "The godly youths in the furnace combined fasting with song and declared: Blessed art Thou, O God of our fathers!",
      troparia: [
        "When Thou wast crucified upon the Cross, O Lord, Thou didst shake all creation; and the enemy, beholding Thy might, cried: Blessed art Thou, O God of our fathers!",
        "Thou didst bow Thy head upon the Cross, O Master, and didst resurrect those who were bowed down by the ancient curse, that they might cry: Blessed art Thou, O God of our fathers!",
        "O pure Theotokos, thou wast shown to be more exalted than the heavens, having given birth to the Creator of all; cease not to intercede for those who cry: Blessed art thou who gavest birth to God in the flesh!"
      ],
      theotokion: "O pure Theotokos, thou wast shown to be more exalted than the heavens, having given birth to the Creator of all; cease not to intercede for those who cry: Blessed art thou who gavest birth to God in the flesh!"
    },
    8: {
      irmos: "The divinely wise youths worshiped not the creature instead of the Creator, but manfully treading the threat of fire underfoot, they rejoiced as they chanted: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
      troparia: [
        "When Thou wast crucified upon the Cross, O Lord, creation was shaken; and Thou didst open the gates of paradise to the thief who cried: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "Thou didst voluntarily accept crucifixion, O compassionate One, trampling upon death by Thy death; wherefore, we cry to Thee: Hymn the Lord, all ye works, and exalt Him supremely for all ages!"
      ],
      theotokion: null
    },
    9: {
      irmos: "It is truly meet to call thee blessed, O Theotokos, ever-blessed and most blameless and the Mother of our God. More honorable than the Cherubim and more glorious beyond compare than the Seraphim: without corruption thou gavest birth to God the Word. True Theotokos, we magnify thee.",
      troparia: [
        "By Thy Cross, O Savior, Thou hast overthrown the power of death and opened paradise to the thief; grant also to us, who hymn Thee, the inheritance of paradise.",
        "Thou wast uplifted upon the Tree, O Word, and hast drawn all men unto Thyself; wherefore, we who are drawn unto Thee cry: O Theotokos, magnify us who faithfully magnify thee!"
      ],
      theotokion: "O pure Theotokos, thou glory of Christians and confirmation of the faithful: By thy supplications before Christ God, deliver from every tribulation those who hymn thee."
    }
  }
},
            4: {
  metadata: {
    day:             "Thursday",
    theme:           "The Holy Apostles and St. Nicholas the Wonderworker",
    canons:          ["Canon of the Holy Apostles", "Canon of our Father among the Saints Nicholas, Archbishop of Myra in Lycia"],
    flatteningOrder: "Canon of the Apostles irmos governs; troparia: Canon of the Apostles then Canon of St. Nicholas per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "39–45",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Let us chant unto the Lord, Who led His people through the Red Sea, for He alone hath gloriously triumphed.",
      troparia: [
        "O holy apostles of the Savior, ye who are the lights of the world and the foundations of the Church: By your supplications preserve from every adversity those who honor you.",
        "O divine apostles of Christ, ye who are the vessels of grace and the teachers of piety: Entreat the Lord to grant remission of sins to those who hymn you.",
        "O holy father Nicholas, thou shepherd and teacher, thou rule of faith and image of meekness: Intercede before Christ for those who honor thee with love.",
        "O holy hierarch Nicholas, thou hast appeared as a great wonderworker and champion of the oppressed; wherefore, we cry to thee: Cease not to intercede for us before the Lord."
      ],
      theotokion: "O most pure Theotokos, thou art the confirmation of those who have recourse to thee: Deliver from every tribulation those who hymn thee with faith."
    },
    3: {
      irmos: "O Lord, Who didst create all things by Thy Word and didst fashion man by Thy wisdom, confirm me on the unshakeable rock of Thy love, for Thou alone art holy and lovest mankind.",
      troparia: [
        "O divine apostles, ye went about the whole world preaching the Word and enlightening those who were in darkness; wherefore, intercede before Christ for those who honor you.",
        "Having received the grace of the Spirit, O blessed apostles, ye cast out demons and healed the sick; cease not to intercede for those who hymn you.",
        "O holy Nicholas, thou wast a chosen vessel of grace and a great wonderworker; wherefore, we beseech thee: Intercede before Christ for us who honor thee.",
        "O glorious hierarch Nicholas, thou didst appear as a swift helper to those in need and a fervent intercessor before God; cease not to entreat Him for those who honor thee."
      ],
      theotokion: "O all-immaculate Virgin, thou gavest birth to the Lord Who created all things; cease not to intercede before Him for those who hymn thee with faith and love."
    },
    4: {
      irmos: "I have heard, O Lord, the report of Thy dispensation and I have glorified Thee, O Thou Who alone lovest mankind.",
      troparia: [
        "O glorious apostles of the Lord, ye who are the pillars of the Church and the teachers of the Faith: Intercede before Christ to grant us remission of our transgressions.",
        "Illumined by the light of the Spirit, O holy apostles, ye cast the net of the Gospel over all the earth; wherefore, intercede for those who honor you.",
        "O holy Nicholas, thou wast a fervent intercessor for the innocent and a helper of those in need; cease not to intercede for us before Christ.",
        "By thy holy supplications, O father Nicholas, deliver from evil and tribulation those who flee unto thee with faith, and save us."
      ],
      theotokion: "O all-pure Virgin, thou art the boast of Christians and the glory of the faithful; by thy supplications before Christ deliver from every adversity those who honor thee."
    },
    5: {
      irmos: "Illumine us, O Lord, with Thy commandments, and with Thine upraised arm grant Thy peace to us, O Thou Who lovest mankind.",
      troparia: [
        "O blessed apostles of the Lord, ye enlightened the ends of the earth with the light of the Gospel; wherefore, entreat Christ to grant peace and great mercy to the world.",
        "Having received the grace of the All-holy Spirit, O apostles, ye drove out the darkness of error from all the ends of the earth; intercede before God for those who honor you.",
        "O holy Nicholas, thou wast shown to be a lamp of the Church and a great wonderworker; cease not to entreat Christ to grant us peace and great mercy.",
        "O glorious Nicholas, thou art a swift helper and an invincible champion; wherefore, deliver from every evil those who flee unto thee with faith."
      ],
      theotokion: "O all-immaculate Virgin, thou art the intercessor of those who have recourse to thee; by thy supplications before Christ deliver from every tribulation those who honor thee."
    },
    6: {
      irmos: "Having sunk to the very depths of sin, I cry unto Thee, O God of compassion: Raise me up!",
      troparia: [
        "O holy apostles of the Lord, ye cast the net of the divine word over the whole world and drew up rational fish from the depths of ignorance; intercede before Christ for those who honor you.",
        "O glorious apostles of Christ, who journeyed to the ends of the earth and enlightened all nations with the light of piety: Cease not to intercede for those who hymn you.",
        "O father Nicholas, thou wast shown to be a great champion of the faithful and a swift helper of those in need; by thy supplications deliver from all evil those who honor thee.",
        "O wonderful Nicholas, thou art a fervent intercessor before God and a defender of the poor; wherefore, intercede before Christ for those who call upon thee with faith."
      ],
      theotokion: "O most immaculate Theotokos, thou art the haven of those who take refuge in thee; by thy supplications before Christ deliver from every tribulation those who honor thee with faith."
    },
    7: {
      irmos: "The godly youths in the furnace combined fasting with song and declared: Blessed art Thou, O God of our fathers!",
      troparia: [
        "O holy apostles, having endured many tribulations and torments for the sake of Christ, ye received crowns of victory; intercede for those who cry: Blessed art Thou, O God of our fathers!",
        "O glorious apostles, having traversed the whole world, ye planted the Faith and gathered in those who were scattered; intercede for those who cry: Blessed art Thou, O God of our fathers!",
        "O holy Nicholas, thou wast a fervent intercessor for the poor and a helper of those in tribulation; entreat Christ for those who cry: Blessed art Thou, O God of our fathers!",
        "O father Nicholas, thou wast given to us by God as a great wonderworker and swift helper; intercede before Him for those who cry: Blessed art Thou, O God of our fathers!"
      ],
      theotokion: "O most immaculate Theotokos, thou art the confirmation of Christians and the glory of the faithful; cease not to intercede for those who cry: Blessed art thou who gavest birth to God in the flesh!"
    },
    8: {
      irmos: "The divinely wise youths worshiped not the creature instead of the Creator, but manfully treading the threat of fire underfoot, they rejoiced as they chanted: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
      troparia: [
        "O holy apostles, having gone about the whole world, ye preached the Word of God and gathered in those who were scattered, crying: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "O glorious apostles of Christ, ye enlightened all the nations with the light of the Gospel and drew them to the knowledge of God, crying: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "O wonderful Nicholas, thou wast given to the faithful as a great champion and swift helper, and thou ceasest not to intercede for those who cry: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "O holy hierarch Nicholas, thou art a fervent intercessor and a wondrous helper to all who call upon thee, who cry: Hymn the Lord, all ye works, and exalt Him supremely for all ages!"
      ],
      theotokion: null
    },
    9: {
      irmos: "It is truly meet to call thee blessed, O Theotokos, ever-blessed and most blameless and the Mother of our God. More honorable than the Cherubim and more glorious beyond compare than the Seraphim: without corruption thou gavest birth to God the Word. True Theotokos, we magnify thee.",
      troparia: [
        "O holy apostles of the Lord, ye traversed the whole earth and enlightened all nations with the light of the Gospel; intercede before Christ for those who hymn you.",
        "O glorious apostles, having received the grace of the All-holy Spirit, ye healed every sickness and drove out demons; cease not to intercede for those who faithfully hymn you.",
        "O holy Nicholas, thou art a great wonderworker and a swift helper of those in need; cease not to intercede before Christ for those who call upon thee with love.",
        "O glorious father Nicholas, thou wast given to the faithful as a fervent intercessor and a great champion; intercede before God for those who hymn thee."
      ],
      theotokion: "O pure Theotokos, thou art the haven of Christians and the fervent intercessor; from every tribulation and eternal condemnation deliver those who with faith hymn thee."
    }
  }
},
            5: {
  metadata: {
    day:             "Friday",
    theme:           "The Holy Cross and the Theotokos",
    canons:          ["Canon of the Holy and Life-creating Cross", "Canon of the Theotokos"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross then Canon of the Theotokos per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "45–51",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Let us chant unto the Lord, Who led His people through the Red Sea, for He alone hath gloriously triumphed.",
      troparia: [
        "Having accepted crucifixion of Thine own will, O Lord, Thou didst nail to the Cross the sin of Adam and hast given life to those who were dead.",
        "Thou wast lifted up upon the Cross, O Master, and didst pour forth streams of salvation upon all who hymn Thee with faith.",
        "O most immaculate Theotokos, thou gavest birth to the Sun of righteousness; cease not to intercede before Him for those who hymn thee with love."
      ],
      theotokion: "O most immaculate Theotokos, thou gavest birth to the Sun of righteousness; cease not to intercede before Him for those who hymn thee with love."
    },
    3: {
      irmos: "O Lord, Who didst create all things by Thy Word and didst fashion man by Thy wisdom, confirm me on the unshakeable rock of Thy love, for Thou alone art holy and lovest mankind.",
      troparia: [
        "When Thou wast lifted up upon the Cross, O Savior, Thou didst draw all men unto Thyself, and hast delivered from corruption those who hymn Thee.",
        "Stretched out upon the Cross, O Word, Thou didst stretch out Thine arms and didst gather together those who were far off, reconciling them to the Father.",
        "O most immaculate Virgin, thou art the confirmation of the faithful and the protection of those who take refuge in thee; save those who hymn thee."
      ],
      theotokion: "O most immaculate Virgin, thou art the confirmation of the faithful and the protection of those who take refuge in thee; save those who hymn thee."
    },
    4: {
      irmos: "I have heard, O Lord, the report of Thy dispensation and I have glorified Thee, O Thou Who alone lovest mankind.",
      troparia: [
        "By the Cross, O Savior, Thou hast trampled upon death and hast opened the gates of paradise to the thief; grant to us also the inheritance of paradise.",
        "Having been nailed to the Cross, O Lord, Thou didst nail thereto the handwriting against us and hast freed us from the curse of the law.",
        "O all-immaculate Virgin, thou art the intercessor of sinners and the helper of those in tribulation; by thy supplications before Christ save those who hymn thee."
      ],
      theotokion: "O all-immaculate Virgin, thou art the intercessor of sinners and the helper of those in tribulation; by thy supplications before Christ save those who hymn thee."
    },
    5: {
      irmos: "Illumine us, O Lord, with Thy commandments, and with Thine upraised arm grant Thy peace to us, O Thou Who lovest mankind.",
      troparia: [
        "Uplifted upon the Tree, O Word, Thou didst uproot the tree of disobedience and hast planted in its place the tree of life for those who glorify Thee.",
        "By Thy Cross, O Lord, Thou hast sanctified the whole creation and hast delivered from the ancient curse those who hymn Thee with faith.",
        "O most pure Theotokos, thou art the confirmation of those who take refuge in thee; by thy supplications before Christ save those who hymn thee."
      ],
      theotokion: "O most pure Theotokos, thou art the confirmation of those who take refuge in thee; by thy supplications before Christ save those who hymn thee."
    },
    6: {
      irmos: "Having sunk to the very depths of sin, I cry unto Thee, O God of compassion: Raise me up!",
      troparia: [
        "Having voluntarily accepted the Cross, O long-suffering Lord, Thou didst deliver from the ancient curse those who glorify Thee with faith.",
        "Thou wast pierced in Thy side by a spear, O Savior, and hast healed the wound of our forefather Adam, granting incorruption to those who hymn Thee.",
        "O all-immaculate Theotokos, thou art the haven of those who take refuge in thee; from every tribulation and sorrow deliver those who hymn thee with love."
      ],
      theotokion: "O all-immaculate Theotokos, thou art the haven of those who take refuge in thee; from every tribulation and sorrow deliver those who hymn thee with love."
    },
    7: {
      irmos: "The godly youths in the furnace combined fasting with song and declared: Blessed art Thou, O God of our fathers!",
      troparia: [
        "When Thou wast crucified, O Lord, Thou didst shake all creation; and the enemy, beholding Thy power, cried: Blessed art Thou, O God of our fathers!",
        "Thou didst bow Thy head upon the Cross and didst raise up those who were bowed down, O Master; and the whole creation cried: Blessed art Thou, O God of our fathers!",
        "O most immaculate Theotokos, thou art more exalted than the heavens; cease not to intercede before thy Son for those who cry: Blessed art thou who gavest birth to God in the flesh!"
      ],
      theotokion: "O most immaculate Theotokos, thou art more exalted than the heavens; cease not to intercede before thy Son for those who cry: Blessed art thou who gavest birth to God in the flesh!"
    },
    8: {
      irmos: "The divinely wise youths worshiped not the creature instead of the Creator, but manfully treading the threat of fire underfoot, they rejoiced as they chanted: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
      troparia: [
        "When Thou wast crucified, O Lord, creation was shaken; and Thou didst open paradise to the thief who cried: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "Having accepted crucifixion of Thine own will, O compassionate One, Thou didst trample upon death by Thy death; wherefore, we cry: Hymn the Lord, all ye works, and exalt Him supremely for all ages!"
      ],
      theotokion: null
    },
    9: {
      irmos: "It is truly meet to call thee blessed, O Theotokos, ever-blessed and most blameless and the Mother of our God. More honorable than the Cherubim and more glorious beyond compare than the Seraphim: without corruption thou gavest birth to God the Word. True Theotokos, we magnify thee.",
      troparia: [
        "By Thy Cross, O Savior, Thou hast overthrown the power of death and opened paradise to the thief; grant also to us who hymn Thee the inheritance of paradise.",
        "Thou wast uplifted upon the Tree, O Word, and hast drawn all men unto Thyself; wherefore, we cry: O Theotokos, magnify us who faithfully magnify thee!"
      ],
      theotokion: "O pure Theotokos, thou art the glory of Christians and the confirmation of the faithful; by thy supplications before Christ deliver from every tribulation those who hymn thee."
    }
  }
},
            6: {
  metadata: {
    day:             "Saturday",
    theme:           "All Saints and the Departed",
    canons:          ["Canon of All Saints", "Canon of the Departed"],
    flatteningOrder: "Canon of All Saints irmos governs; troparia: Canon of All Saints then Canon of the Departed per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "51–57",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Let us chant unto the Lord, Who led His people through the Red Sea, for He alone hath gloriously triumphed.",
      troparia: [
        "O ye saints, who shone forth in the world as noetic stars, and who illumined the ends of the earth with the light of piety: By your supplications preserve from every evil those who honor you.",
        "O ye holy martyrs, who manfully endured the torments of the tyrants and utterly destroyed the error of the ungodly: By your supplications before God, deliver from every tribulation those who honor you.",
        "O Christ, Who in Thy mercy hast created man and hast given him Thy divine image: Vouchsafe rest in Thy kingdom to those who have fallen asleep in faith.",
        "O God, Who hast fashioned man from the earth and hast granted him to share in Thine image: Vouchsafe to Thy servants who have fallen asleep in faith the inheritance of paradise."
      ],
      theotokion: "O all-immaculate Theotokos, thou art the hope of Christians and the intercessor of the faithful: By thy supplications before God deliver from every tribulation those who honor thee."
    },
    3: {
      irmos: "O Lord, Who didst create all things by Thy Word and didst fashion man by Thy wisdom, confirm me on the unshakeable rock of Thy love, for Thou alone art holy and lovest mankind.",
      troparia: [
        "O ye saints, who have received the grace of the Spirit and who intercede before God with boldness: By your supplications deliver from every evil those who honor you with faith.",
        "O ye glorious martyrs, who endured great torments for the sake of Christ: By your supplications before God grant remission of sins to those who honor you.",
        "O greatly Merciful One, Who didst fashion man from the earth: Vouchsafe rest in Thy heavenly kingdom to Thy servants who have fallen asleep in faith.",
        "O Christ, Who art the Life of all: Grant rest in the land of the meek to those who have fallen asleep in faith, and number them with the saints."
      ],
      theotokion: "O most immaculate Theotokos, thou art the hope of the hopeless and the intercessor of sinners: By thy supplications before God deliver from every tribulation those who honor thee."
    },
    4: {
      irmos: "I have heard, O Lord, the report of Thy dispensation and I have glorified Thee, O Thou Who alone lovest mankind.",
      troparia: [
        "O ye saints, who are the pillars of the Church and the luminaries of the world: By your supplications before God deliver from all evil those who honor you.",
        "O ye holy martyrs, who struggled bravely for the sake of Christ: By your supplications before God grant remission of sins to those who honor you with faith.",
        "O Christ, the Life and Resurrection of all: Vouchsafe rest in Thy heavenly kingdom to Thy servants who have fallen asleep in faith.",
        "O greatly Merciful One, Who hast authority over the living and the dead: Number with Thy saints those who have fallen asleep in faith and love of Thee."
      ],
      theotokion: "O all-pure Theotokos, thou art the confirmation of the faithful and the protection of those who take refuge in thee: By thy supplications before God deliver from every tribulation those who honor thee."
    },
    5: {
      irmos: "Illumine us, O Lord, with Thy commandments, and with Thine upraised arm grant Thy peace to us, O Thou Who lovest mankind.",
      troparia: [
        "O ye saints, who are ministers of God and lamps of light to the world: By your supplications before God enlighten the souls of those who honor you.",
        "O ye holy martyrs, who endured torments for the sake of Christ and received crowns of victory: By your supplications before God deliver from all evil those who honor you.",
        "O Christ, the Resurrection of all: Vouchsafe rest in the land of the living to those who have fallen asleep in faith, overlooking all their sins.",
        "O Lord, Who hast authority over the living and the dead: Vouchsafe to those who have fallen asleep in faith the good things of heaven and rest with all the saints."
      ],
      theotokion: "O most immaculate Theotokos, thou art the haven of Christians and the intercessor of the faithful: By thy supplications before Christ deliver from every tribulation those who honor thee."
    },
    6: {
      irmos: "Having sunk to the very depths of sin, I cry unto Thee, O God of compassion: Raise me up!",
      troparia: [
        "O ye saints of God, who have received the grace of the Spirit and who stand before the throne of God: By your supplications deliver from every evil those who honor you with faith.",
        "O ye holy martyrs, who endured many tribulations for the sake of Christ: By your supplications before God deliver from all evil those who honor you.",
        "O Christ, the Resurrection of all: Receive the souls of Thy servants who have fallen asleep in faith and vouchsafe them rest in the heavenly kingdom.",
        "O greatly Merciful One, Who hast power over the living and the dead: Receive Thy servants who have fallen asleep and number them with the saints in Thy kingdom."
      ],
      theotokion: "O all-immaculate Theotokos, thou art the intercessor of sinners and the haven of the storm-tossed: By thy supplications before God deliver from every tribulation those who honor thee."
    },
    7: {
      irmos: "The godly youths in the furnace combined fasting with song and declared: Blessed art Thou, O God of our fathers!",
      troparia: [
        "O ye saints, who are the pillars of the Church and the luminaries of the world, who stand before the throne of God: Intercede for those who cry: Blessed art Thou, O God of our fathers!",
        "O ye glorious martyrs, who endured torments for the sake of Christ and received crowns of victory: Intercede for those who cry: Blessed art Thou, O God of our fathers!",
        "O Christ, Who art the Resurrection of all: Vouchsafe rest in the heavenly kingdom to Thy servants who have fallen asleep, for they cry: Blessed art Thou, O God of our fathers!",
        "O Lord, Who hast authority over the living and the dead: Number with Thy saints those who have fallen asleep in faith, who cry: Blessed art Thou, O God of our fathers!"
      ],
      theotokion: "O most immaculate Theotokos, thou art the confirmation of the faithful: Cease not to intercede before thy Son for those who cry: Blessed art thou who gavest birth to God in the flesh!"
    },
    8: {
      irmos: "The divinely wise youths worshiped not the creature instead of the Creator, but manfully treading the threat of fire underfoot, they rejoiced as they chanted: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
      troparia: [
        "O ye saints, who have received the grace of the Spirit and who stand before the throne of God: Intercede for those who cry: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "O ye glorious martyrs, who struggled bravely for the sake of Christ: Intercede before God for those who cry: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "O Christ, the Resurrection of all: Vouchsafe rest with the saints to Thy servants who have fallen asleep in faith and cry: Hymn the Lord, all ye works, and exalt Him supremely for all ages!",
        "O Lord, Who hast power over the living and the dead: Grant rest to Thy servants who have fallen asleep, who cry: Hymn the Lord, all ye works, and exalt Him supremely for all ages!"
      ],
      theotokion: null
    },
    9: {
      irmos: "It is truly meet to call thee blessed, O Theotokos, ever-blessed and most blameless and the Mother of our God. More honorable than the Cherubim and more glorious beyond compare than the Seraphim: without corruption thou gavest birth to God the Word. True Theotokos, we magnify thee.",
      troparia: [
        "O ye saints, who are the pillars of the Church and the glory of the faithful: By your supplications before God deliver from every tribulation those who honor you.",
        "O ye holy martyrs, who endured great torments for the sake of Christ and received crowns of victory: By your supplications before God deliver from all evil those who honor you.",
        "O Christ, the Resurrection of all: Vouchsafe rest in the heavenly kingdom to Thy servants who have fallen asleep in faith, overlooking all their transgressions.",
        "O Lord, Who hast power over the living and the dead: Grant rest with the saints to those who have fallen asleep in faith and hope of the resurrection."
      ],
      theotokion: "O most immaculate Theotokos, thou art the hope of Christians and the fervent intercessor: From every tribulation, danger, and eternal condemnation deliver those who with faith take refuge in thee."
    }
  }
}
        },

        6: {
            1: {
  metadata: {
    day:             "Monday",
    theme:           "Repentance and the Bodiless Powers",
    canons:          ["Canon of Repentance to our Lord Jesus Christ", "Canon of the Incorporeal Hosts"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Incorporeal Hosts per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "169–175",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Having traversed the deep on foot as on dry land, and having beheld the Egyptian tyrant drowned, Israel cried aloud: Let us chant unto God a hymn of victory!",
      troparia: [
        "Having sunk into the abyss of evil, I cry unto Thee, O Master: Stretch forth Thy hand unto me, as once unto Peter, and draw me up from the depth of sins.",
        "As a prodigal I have wasted the substance of virtue through my evil works; but I return to Thee repenting: Receive me, O Savior, and save me.",
        "O holy angels, who stand before the throne of God in holiness: By your supplications before God deliver from every adversity those who hymn you.",
        "O ye incorporeal powers of heaven, who stand before the Creator with fear and trembling: Cease not to intercede before Him for those who faithfully honor you."
      ],
      theotokion: "O most immaculate Theotokos, thou art the hope and the confirmation of those who flee unto thee; from every tribulation deliver those who hymn thee with faith."
    },
    3: {
      irmos: "Thou art the confirmation of those who flee unto Thee, O Lord; Thou art the light of those in darkness, and my spirit doth hymn Thee.",
      troparia: [
        "O Lord, I have sinned more than all men, and have been burdened with the weight of my sins; but do Thou, O greatly Merciful One, lighten the burden of my transgressions and save me.",
        "O merciful Christ, I have no good works and my soul is naked of virtue; but as once Thou didst receive the harlot, so receive also me who repent.",
        "O angelic powers of heaven, who stand before the unapproachable glory of God: Cease not to intercede before the Creator for those who honor you.",
        "O ye holy angels, ye noetic ministers of the All-holy Spirit: By your supplications before God, deliver from every evil those who faithfully hymn you."
      ],
      theotokion: "O all-immaculate Virgin, thou art the confirmation of the faithful; by thy supplications before Christ deliver from every tribulation those who flee unto thee."
    },
    4: {
      irmos: "Thou hast come from the Virgin, neither as an ambassador nor as an angel, but Thou the very Lord incarnate, and hast saved me, the whole man; therefore I cry to Thee: Glory to Thy power, O Lord.",
      troparia: [
        "O Christ Who art good, I fall down before Thee and pray: Grant me, who am enslaved to sin, the gift of repentance, that, being freed from the bonds of sin, I may glorify Thy goodness.",
        "O Lord Who art good and lovest mankind, I have wasted my life in the pleasures of sin; but in Thine ineffable mercy receive me who return to Thee through repentance.",
        "O holy ranks of the angels, who stand before the divine glory and intercede for men: Cease not to entreat God to grant us remission of sins and great mercy.",
        "O ye divine hosts of heaven, ye first ranks of the angels, who are ministers of God: Intercede before the Creator for those who with faith honor your divine order."
      ],
      theotokion: "O all-immaculate Virgin, thou art the intercessor of sinners and the confirmation of the faithful; by thy supplications before God save those who take refuge in thee."
    },
    5: {
      irmos: "O Lord, enlighten us with Thy commandments, and with Thine upraised arm grant us Thy peace, O Thou Who lovest mankind.",
      troparia: [
        "O Savior Who art compassionate, I have squandered my life in the pleasure of sins; but as Thou art good, receive me who repent, and grant me tears of compunction.",
        "Grant me, O Christ, tears of compunction and amendment of life, that I may wash away the stains of sin with which I have defiled my wretched soul.",
        "O ye holy angels, ye noetic lights of the spiritual world: Shine upon those who are darkened by sin and intercede before God for those who hymn you.",
        "O ye divine hosts of the heavenly powers, who stand before the throne of the Most High: Cease not to intercede before God for those who faithfully honor you."
      ],
      theotokion: "O all-immaculate Theotokos, thou art the intercessor of the faithful; by thy supplications before Christ deliver from every tribulation those who flee unto thee."
    },
    6: {
      irmos: "Having cried out with his whole heart unto the compassionate God from the belly of the whale, Jonah was brought forth from the abyss; and he cried aloud: Raise my life from corruption, O Lord!",
      troparia: [
        "From the belly of hades I cry unto Thee, O Lord: Hear my voice and deliver my soul from the bonds of sin, raising me up from the abyss of passions.",
        "O Christ, Who art the Deliverer of the captives and the Liberator of those held in bondage: Free me who am held captive by sin, and save me who flee unto Thee with faith.",
        "O ye holy angels, ye noetic ministers of the Creator: By your supplications before God deliver from every tribulation those who honor your holy order.",
        "O ye divine hosts of heaven, who stand before the unapproachable glory of God: Intercede before Him for those who faithfully hymn your light-bearing order."
      ],
      theotokion: "O most immaculate Virgin, thou art the confirmation and the protection of those who take refuge in thee; by thy supplications before Christ deliver from every tribulation those who hymn thee."
    },
    7: {
      irmos: "The pious youths in the furnace of fire quenched the flame with the dew of the Spirit and chanted: Blessed art Thou, O Lord God of our fathers!",
      troparia: [
        "Having become utterly subject to the passions and enslaved to sin, I flee unto Thee, O greatly Merciful One, and cry: Deliver me from the bonds of sin, O God of our fathers!",
        "O Christ Who art good and compassionate, have mercy upon me and grant me the grace of repentance; for I cry unto Thee with faith: Blessed art Thou, O Lord God of our fathers!",
        "O holy angels, ye lamps of the spiritual world, who are filled with divine light: By your supplications before God deliver from every evil those who cry: Blessed art Thou, O Lord God of our fathers!",
        "O ye heavenly powers, who hymn the Creator with unceasing voices: Intercede before God for those who faithfully hymn you and cry: Blessed art Thou, O Lord God of our fathers!"
      ],
      theotokion: "O most immaculate Virgin, having given birth to the Eternal Light, illumine my soul which is darkened by sin, and deliver me who flee unto thee from the fire of Gehenna."
    },
    8: {
      irmos: "The Chaldaean tyrant was set afire by rage, and he heated the furnace sevenfold; but the pious children were not harmed. Beholding this miracle, the tyrant himself glorified God, crying: Ye servants, bless Him; ye priests, hymn Him; ye people, exalt Him supremely for all ages!",
      troparia: [
        "O greatly Merciful Savior, I am bowed down beneath the weight of my sins and have no boldness before Thee; but as once Thou didst receive the prodigal, so receive also me who repent, that I may cry: Bless the Lord, all ye His works!",
        "O Christ Who lovest mankind, as once Thou didst receive the publican and the harlot who repented, so receive also me who cry to Thee: Have mercy on me, O God, and save me, that I may cry: All ye His works, bless the Lord!",
        "O ye holy angels, ye ministers of the divine will, who stand before the throne of the Most High: By your supplications before God grant remission of sins to those who cry: All ye His works, bless the Lord!",
        "O ye divine hosts, ye lamps of the spiritual world, who are filled with the radiance of the Godhead: Intercede before God for those who faithfully honor you and cry: All ye His works, bless the Lord!"
      ],
      theotokion: null
    },
    9: {
      irmos: "Every tongue is at a loss to praise thee worthily; even a mind illumined from on high is overwhelmed when it would hymn thee, O Theotokos. But as thou art good, accept our faith; for thou knowest our love inspired of God, for thou art the intercessor of Christians, we magnify thee.",
      troparia: [
        "O Christ Who art the Deliverer of those held captive by sin: Free me who am enslaved to the passions, and as once Thou didst receive the prodigal, so receive also me who repent.",
        "O greatly Merciful Lord, in Thine ineffable goodness receive me who return to Thee through repentance, and magnify me with Thy saints, O Thou Who art the Lover of mankind.",
        "O ye divine hosts of heaven, ye light-bearing powers, who stand before the Creator: By your supplications before God deliver from every tribulation those who faithfully hymn you.",
        "O ye holy angels, ye ministers of the divine glory, who are filled with divine light: Intercede before God for those who faithfully honor your light-bearing order."
      ],
      theotokion: "O pure Theotokos, thou art the haven of the storm-tossed and the fervent intercessor; from every tribulation and eternal condemnation deliver those who with faith take refuge in thee."
    }
  }
},
            2: {
  metadata: {
    day:             "Tuesday",
    theme:           "Repentance and the Holy Forerunner John the Baptist",
    canons:          ["Canon of Repentance to our Lord Jesus Christ", "Canon of the Holy Forerunner and Baptist John"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance then Canon of the Forerunner per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "175–182",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Having traversed the deep on foot as on dry land, and having beheld the Egyptian tyrant drowned, Israel cried aloud: Let us chant unto God a hymn of victory!",
      troparia: [
        "O Christ Who art compassionate, I have sinned against Thee and have transgressed Thy commandments; but do Thou, O greatly Merciful One, receive me who return to Thee through repentance.",
        "O Lord Who art good and lovest mankind, I have spent my life in the passions of sin; but receive me who repent, O compassionate One, and grant me remission of my transgressions.",
        "O glorious Forerunner of the Lord, thou lamp of the True Light and herald of the Savior's coming: By thy supplications before God deliver from every adversity those who honor thee.",
        "O blessed Forerunner, thou didst cry in the wilderness: Prepare ye the way of the Lord; and now standing before Him in heaven, cease not to intercede for those who honor thee."
      ],
      theotokion: "O most immaculate Theotokos, thou art the confirmation of the faithful and the hope of those who take refuge in thee; by thy supplications before God deliver from every tribulation those who hymn thee."
    },
    3: {
      irmos: "Thou art the confirmation of those who flee unto Thee, O Lord; Thou art the light of those in darkness, and my spirit doth hymn Thee.",
      troparia: [
        "O Christ, I have sinned more than all men and have no good works to offer; but do Thou, O greatly Merciful One, receive me who repent and grant me remission of my transgressions.",
        "O Savior, I have squandered my life in sloth and evil deeds; but receive me who return to Thee through repentance, and save me who flee unto Thee with faith.",
        "O glorious Forerunner, thou wast the lamp of the True Light and the voice of the Word; cease not to intercede before God for those who honor thee with love.",
        "O blessed prophet, thou didst rebuke kings with divine boldness and hast been glorified by God; by thy supplications deliver from every evil those who faithfully honor thee."
      ],
      theotokion: "O all-immaculate Virgin, thou art the intercessor for sinners and the hope of those who have recourse to thee; by thy supplications before Christ save those who flee unto thee."
    },
    4: {
      irmos: "Thou hast come from the Virgin, neither as an ambassador nor as an angel, but Thou the very Lord incarnate, and hast saved me, the whole man; therefore I cry to Thee: Glory to Thy power, O Lord.",
      troparia: [
        "O Christ Who art compassionate, I fall down before Thee and pray: Receive me who repent, and as once Thou didst receive the prodigal son, so receive also me who return to Thee.",
        "O Lord Who art good, in Thine ineffable mercy receive me who repent and turn back to Thee, and grant me the grace of compunction, O Thou Who lovest mankind.",
        "O glorious Forerunner of the Lord, thou wast the lamp of the True Light and the voice of the Word; entreat Christ to grant remission of sins to those who honor thee.",
        "O blessed John, thou wast shown to be a great prophet and the Forerunner of the Lord; cease not to intercede before God for those who faithfully hymn thee."
      ],
      theotokion: "O most pure Theotokos, thou art the confirmation and the protection of those who take refuge in thee; by thy supplications before Christ deliver from every tribulation those who honor thee."
    },
    5: {
      irmos: "O Lord, enlighten us with Thy commandments, and with Thine upraised arm grant us Thy peace, O Thou Who lovest mankind.",
      troparia: [
        "O compassionate Lord, I have spent my life in sin; but do Thou, Who art the Lover of mankind, receive me who repent and grant me remission of my transgressions.",
        "O Christ Who art good, cleanse me from the defilement of sin and grant me the gift of repentance, that I may offer Thee a contrite heart.",
        "O glorious Forerunner of the Lord, thou art the lamp of the True Light; by thy supplications before God enlighten those who honor thee.",
        "O blessed prophet and Forerunner of the Lord, who didst baptize the Master with thine own hand: Cease not to intercede for those who faithfully hymn thee."
      ],
      theotokion: "O all-immaculate Virgin, thou art the haven of those who take refuge in thee; by thy supplications before Christ deliver from every tribulation those who hymn thee with faith."
    },
    6: {
      irmos: "Having cried out with his whole heart unto the compassionate God from the belly of the whale, Jonah was brought forth from the abyss; and he cried aloud: Raise my life from corruption, O Lord!",
      troparia: [
        "O Christ Who art good, as once Thou didst receive the harlot and the publican who repented, so receive also me who cry unto Thee: Grant me remission of my many sins.",
        "O long-suffering Lord, deliver me from the captivity of the passions and from the bondage of sin, and grant me the grace of repentance, that I may cry unto Thee with compunction.",
        "O glorious Forerunner, thou wast beheaded for the sake of righteousness and wast shown to be worthy of God; by thy supplications before Christ deliver from every evil those who honor thee.",
        "O blessed prophet, thou didst point out the Lamb of God Who taketh away the sin of the world; cease not to intercede before Christ for those who faithfully hymn thee."
      ],
      theotokion: "O most immaculate Virgin, thou gavest birth to the Word of God in the flesh; cease not to intercede before Him for those who hymn thee, that He may grant them remission of sins."
    },
    7: {
      irmos: "The pious youths in the furnace of fire quenched the flame with the dew of the Spirit and chanted: Blessed art Thou, O Lord God of our fathers!",
      troparia: [
        "O Christ Who art compassionate, receive my repentance and grant me remission of sins, that I may cry unto Thee with compunction: Blessed art Thou, O Lord God of our fathers!",
        "O greatly Merciful Lord, I have no boldness before Thee because of my sins; but in Thine ineffable goodness receive me who repent and cry: Blessed art Thou, O Lord God of our fathers!",
        "O glorious Forerunner of the Lord, thou art the lamp of the True Light; cease not to intercede before God for those who cry: Blessed art Thou, O Lord God of our fathers!",
        "O blessed John, thou wast the greatest of the prophets and the Forerunner of the Lord; by thy supplications before God save those who cry: Blessed art Thou, O Lord God of our fathers!"
      ],
      theotokion: "O most immaculate Virgin, thou gavest birth to the Lord of all in the flesh; cease not to intercede before Him for those who cry: Blessed art thou who gavest birth to God in the flesh!"
    },
    8: {
      irmos: "The Chaldaean tyrant was set afire by rage, and he heated the furnace sevenfold; but the pious children were not harmed. Beholding this miracle, the tyrant himself glorified God, crying: Ye servants, bless Him; ye priests, hymn Him; ye people, exalt Him supremely for all ages!",
      troparia: [
        "O Christ Who art good, I have no virtue and am naked of good works; but as once Thou didst receive the prodigal, so receive also me who cry: All ye His works, bless the Lord!",
        "O greatly Merciful Savior, in Thine ineffable goodness receive me who repent, and grant me remission of my many sins, that I may cry: All ye His works, bless the Lord!",
        "O glorious Forerunner of the Lord, thou art the lamp of the True Light; by thy supplications before God deliver from every evil those who cry: All ye His works, bless the Lord!",
        "O blessed John, thou wast shown to be the greatest of the prophets and the Forerunner of the Lord; cease not to intercede before God for those who cry: All ye His works, bless the Lord!"
      ],
      theotokion: null
    },
    9: {
      irmos: "Every tongue is at a loss to praise thee worthily; even a mind illumined from on high is overwhelmed when it would hymn thee, O Theotokos. But as thou art good, accept our faith; for thou knowest our love inspired of God, for thou art the intercessor of Christians, we magnify thee.",
      troparia: [
        "O Christ Who art compassionate, receive me who repent and grant me remission of my many sins, that I may cry: O Theotokos, magnify us who faithfully magnify thee!",
        "O greatly Merciful Lord, in Thine ineffable goodness receive me who return to Thee through repentance, and magnify me with Thy saints.",
        "O glorious Forerunner of the Lord, thou lamp of the True Light and herald of the Savior's coming: By thy supplications before God deliver from every tribulation those who hymn thee.",
        "O blessed John, thou wast the friend of the Bridegroom and the Forerunner of the Lord; cease not to intercede before God for those who faithfully hymn thee."
      ],
      theotokion: "O pure Theotokos, thou art the haven of the storm-tossed and the fervent intercessor; from every tribulation, danger, and eternal condemnation deliver those who with faith take refuge in thee."
    }
  }
},
            3: {
  metadata: {
    day:             "Wednesday",
    theme:           "The Holy Cross and the Theotokos",
    canons:          ["Canon of the Holy and Life-creating Cross", "Canon of the Theotokos"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross then Canon of the Theotokos per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "182–188",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Having traversed the deep on foot as on dry land, and having beheld the Egyptian tyrant drowned, Israel cried aloud: Let us chant unto God a hymn of victory!",
      troparia: [
        "Having voluntarily accepted the Cross, O Lord, Thou didst nail to it the sin of Adam and hast saved those who hymn Thee with faith.",
        "Uplifted upon the Cross, O Savior, Thou didst pour out streams of salvation upon all who glorify Thee with faith and love.",
        "O most immaculate Theotokos, thou gavest birth to the Word in the flesh; cease not to intercede before Him for those who hymn thee with love."
      ],
      theotokion: "O most immaculate Theotokos, thou gavest birth to the Word in the flesh; cease not to intercede before Him for those who hymn thee with love."
    },
    3: {
      irmos: "Thou art the confirmation of those who flee unto Thee, O Lord; Thou art the light of those in darkness, and my spirit doth hymn Thee.",
      troparia: [
        "When Thou wast lifted up upon the Cross, O Savior, Thou didst draw all men unto Thyself, delivering from corruption those who hymn Thee.",
        "Stretched out upon the Cross, O Word, Thou didst stretch out Thine arms and gather together those who were far off, reconciling them to the Father.",
        "O most immaculate Theotokos, thou art the confirmation of the faithful; by thy supplications before Christ deliver from every tribulation those who hymn thee."
      ],
      theotokion: "O most immaculate Theotokos, thou art the confirmation of the faithful; by thy supplications before Christ deliver from every tribulation those who hymn thee."
    },
    4: {
      irmos: "Thou hast come from the Virgin, neither as an ambassador nor as an angel, but Thou the very Lord incarnate, and hast saved me, the whole man; therefore I cry to Thee: Glory to Thy power, O Lord.",
      troparia: [
        "By the Cross, O Savior, Thou hast trampled upon death and opened the gates of paradise to the thief; grant to us also the inheritance of paradise.",
        "Having been nailed to the Cross of Thine own will, O Savior, Thou didst free us from the curse of the law and hast granted us divine life.",
        "O all-immaculate Theotokos, thou art the intercessor of sinners; by thy supplications before Christ deliver from every tribulation those who take refuge in thee."
      ],
      theotokion: "O all-immaculate Theotokos, thou art the intercessor of sinners; by thy supplications before Christ deliver from every tribulation those who take refuge in thee."
    },
    5: {
      irmos: "O Lord, enlighten us with Thy commandments, and with Thine upraised arm grant us Thy peace, O Thou Who lovest mankind.",
      troparia: [
        "Uplifted upon the Tree, O Word, Thou didst uproot the tree of disobedience and hast planted the tree of life for those who hymn Thee.",
        "By Thy Cross, O Lord, Thou hast sanctified all creation and delivered from the ancient curse those who glorify Thee with faith.",
        "O most pure Theotokos, thou gavest birth to the Lord of all; by thy supplications before Him deliver from every tribulation those who hymn thee."
      ],
      theotokion: "O most pure Theotokos, thou gavest birth to the Lord of all; by thy supplications before Him deliver from every tribulation those who hymn thee."
    },
    6: {
      irmos: "Having cried out with his whole heart unto the compassionate God from the belly of the whale, Jonah was brought forth from the abyss; and he cried aloud: Raise my life from corruption, O Lord!",
      troparia: [
        "Having voluntarily accepted the Cross, O long-suffering Lord, Thou didst deliver from the ancient curse those who hymn Thee with faith.",
        "Thou wast pierced in Thy side by a spear, O Savior, and hast healed the wound of our forefather Adam, granting incorruption to those who hymn Thee.",
        "O all-immaculate Theotokos, thou art the haven of those who take refuge in thee; from every tribulation and sorrow deliver those who hymn thee."
      ],
      theotokion: "O all-immaculate Theotokos, thou art the haven of those who take refuge in thee; from every tribulation and sorrow deliver those who hymn thee."
    },
    7: {
      irmos: "The pious youths in the furnace of fire quenched the flame with the dew of the Spirit and chanted: Blessed art Thou, O Lord God of our fathers!",
      troparia: [
        "When Thou wast crucified upon the Cross, O Lord, Thou didst shake all creation; and the enemy, beholding Thy might, cried: Blessed art Thou, O Lord God of our fathers!",
        "Thou didst bow Thy head upon the Cross, O Master, and didst raise up those who were bowed down; and all creation cried: Blessed art Thou, O Lord God of our fathers!",
        "O most immaculate Theotokos, thou art more exalted than all creation; cease not to intercede before thy Son for those who cry: Blessed art thou who gavest birth to God in the flesh!"
      ],
      theotokion: "O most immaculate Theotokos, thou art more exalted than all creation; cease not to intercede before thy Son for those who cry: Blessed art thou who gavest birth to God in the flesh!"
    },
    8: {
      irmos: "The Chaldaean tyrant was set afire by rage, and he heated the furnace sevenfold; but the pious children were not harmed. Beholding this miracle, the tyrant himself glorified God, crying: Ye servants, bless Him; ye priests, hymn Him; ye people, exalt Him supremely for all ages!",
      troparia: [
        "When Thou wast crucified upon the Cross, O Lord, creation was shaken; and Thou didst open paradise to the thief who cried: All ye His works, bless the Lord!",
        "Having accepted crucifixion of Thine own will, O compassionate One, Thou didst trample upon death; wherefore we cry: All ye His works, bless the Lord!"
      ],
      theotokion: null
    },
    9: {
      irmos: "Every tongue is at a loss to praise thee worthily; even a mind illumined from on high is overwhelmed when it would hymn thee, O Theotokos. But as thou art good, accept our faith; for thou knowest our love inspired of God, for thou art the intercessor of Christians, we magnify thee.",
      troparia: [
        "By Thy Cross, O Savior, Thou hast overthrown the power of death and opened paradise to the thief; grant also to us who hymn Thee the inheritance of paradise.",
        "Thou wast uplifted upon the Tree, O Word, and hast drawn all men unto Thyself; wherefore we cry: O Theotokos, magnify us who faithfully magnify thee!"
      ],
      theotokion: "O pure Theotokos, thou art the glory of Christians and the confirmation of the faithful; by thy supplications before Christ deliver from every tribulation those who hymn thee."
    }
  }
},
            4: {
  metadata: {
    day:             "Thursday",
    theme:           "The Holy Apostles and St. Nicholas the Wonderworker",
    canons:          ["Canon of the Holy Apostles", "Canon of our Father among the Saints Nicholas, Archbishop of Myra in Lycia"],
    flatteningOrder: "Canon of the Apostles irmos governs; troparia: Canon of the Apostles then Canon of St. Nicholas per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "188–195",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Having traversed the deep on foot as on dry land, and having beheld the Egyptian tyrant drowned, Israel cried aloud: Let us chant unto God a hymn of victory!",
      troparia: [
        "O holy apostles of the Savior, ye who are the foundations of the Church and the teachers of piety: By your supplications before God deliver from every adversity those who honor you.",
        "O divine apostles of Christ, ye who traversed the whole world and enlightened it with the light of the Gospel: Cease not to intercede before God for those who faithfully hymn you.",
        "O holy father Nicholas, thou shepherd and teacher of the faithful, thou rule of faith and image of meekness: By thy supplications before Christ deliver from every evil those who honor thee.",
        "O holy hierarch Nicholas, thou art a great wonderworker and a swift helper of those in need; cease not to intercede before the Lord for those who faithfully honor thee."
      ],
      theotokion: "O most immaculate Theotokos, thou art the confirmation of the faithful and the haven of those who take refuge in thee; by thy supplications before God deliver from every tribulation those who hymn thee."
    },
    3: {
      irmos: "Thou art the confirmation of those who flee unto Thee, O Lord; Thou art the light of those in darkness, and my spirit doth hymn Thee.",
      troparia: [
        "O divine apostles, ye went about the whole world proclaiming the Word and enlightening those who sat in darkness; cease not to intercede before God for those who honor you.",
        "Having received the grace of the All-holy Spirit, O blessed apostles, ye drove out demons and healed the sick; by your supplications before God deliver from every evil those who hymn you.",
        "O holy Nicholas, thou wast a chosen vessel of grace and a great wonderworker; by thy supplications before Christ deliver from every tribulation those who honor thee.",
        "O glorious hierarch Nicholas, thou art a fervent intercessor and a swift helper; cease not to entreat God for those who faithfully call upon thee."
      ],
      theotokion: "O all-immaculate Virgin, thou gavest birth to the Lord of all; by thy supplications before Him deliver from every tribulation those who hymn thee with faith."
    },
    4: {
      irmos: "Thou hast come from the Virgin, neither as an ambassador nor as an angel, but Thou the very Lord incarnate, and hast saved me, the whole man; therefore I cry to Thee: Glory to Thy power, O Lord.",
      troparia: [
        "O glorious apostles of the Lord, ye who are the pillars of the Church and the teachers of the Faith: By your supplications before Christ grant us remission of sins and great mercy.",
        "Illumined by the light of the Spirit, O holy apostles, ye cast the net of the Gospel over all the earth and gathered in the nations; intercede before God for those who hymn you.",
        "O holy Nicholas, thou wast a fervent intercessor for the innocent and a champion of those in need; by thy supplications before Christ deliver from every evil those who honor thee.",
        "By thy holy supplications, O father Nicholas, deliver from all tribulation those who flee unto thee with faith, and save us who faithfully hymn thee."
      ],
      theotokion: "O all-pure Virgin, thou art the boast of Christians and the glory of the faithful; by thy supplications before Christ deliver from every adversity those who honor thee."
    },
    5: {
      irmos: "O Lord, enlighten us with Thy commandments, and with Thine upraised arm grant us Thy peace, O Thou Who lovest mankind.",
      troparia: [
        "O blessed apostles of the Lord, ye enlightened the ends of the earth with the light of the Gospel; cease not to entreat Christ to grant peace and great mercy to the world.",
        "Having received the grace of the All-holy Spirit, O apostles, ye drove out the darkness of error from all the ends of the earth; intercede before God for those who faithfully honor you.",
        "O holy Nicholas, thou wast shown to be a lamp of the Church and a great wonderworker; cease not to intercede before Christ to grant us peace and great mercy.",
        "O glorious Nicholas, thou art a swift helper and an invincible champion of those in need; by thy supplications deliver from every evil those who call upon thee with faith."
      ],
      theotokion: "O all-immaculate Virgin, thou art the intercessor of those who take refuge in thee; by thy supplications before Christ deliver from every tribulation those who honor thee."
    },
    6: {
      irmos: "Having cried out with his whole heart unto the compassionate God from the belly of the whale, Jonah was brought forth from the abyss; and he cried aloud: Raise my life from corruption, O Lord!",
      troparia: [
        "O holy apostles of the Lord, ye cast the net of the divine word over the whole world and drew up rational fish from the depths of ignorance; intercede before Christ for those who honor you.",
        "O glorious apostles of Christ, who journeyed to the ends of the earth and enlightened all nations with the light of piety: Cease not to intercede before God for those who hymn you.",
        "O father Nicholas, thou wast shown to be a great champion of the faithful and a swift helper of those in need; by thy supplications deliver from all evil those who honor thee.",
        "O wonderful Nicholas, thou art a fervent intercessor before God and a defender of the poor and oppressed; intercede before Christ for those who call upon thee with faith."
      ],
      theotokion: "O most immaculate Theotokos, thou art the haven of those who take refuge in thee; by thy supplications before Christ deliver from every tribulation those who honor thee with faith."
    },
    7: {
      irmos: "The pious youths in the furnace of fire quenched the flame with the dew of the Spirit and chanted: Blessed art Thou, O Lord God of our fathers!",
      troparia: [
        "O holy apostles, having endured many tribulations for the sake of Christ, ye received crowns of victory; intercede for those who cry: Blessed art Thou, O Lord God of our fathers!",
        "O glorious apostles, having traversed the whole world, ye planted the Faith in all the nations; intercede before God for those who cry: Blessed art Thou, O Lord God of our fathers!",
        "O holy Nicholas, thou wast a fervent intercessor for the poor and a helper of those in tribulation; entreat Christ for those who cry: Blessed art Thou, O Lord God of our fathers!",
        "O father Nicholas, thou wast given to us as a great wonderworker and swift helper; intercede before God for those who cry: Blessed art Thou, O Lord God of our fathers!"
      ],
      theotokion: "O most immaculate Theotokos, thou art the confirmation of Christians and the glory of the faithful; cease not to intercede before thy Son for those who cry: Blessed art thou who gavest birth to God in the flesh!"
    },
    8: {
      irmos: "The Chaldaean tyrant was set afire by rage, and he heated the furnace sevenfold; but the pious children were not harmed. Beholding this miracle, the tyrant himself glorified God, crying: Ye servants, bless Him; ye priests, hymn Him; ye people, exalt Him supremely for all ages!",
      troparia: [
        "O holy apostles, having gone about the whole world, ye preached the Word of God and gathered in those who were scattered, crying: All ye His works, bless the Lord!",
        "O glorious apostles of Christ, ye enlightened all the nations with the light of the Gospel and drew them to the knowledge of God, crying: All ye His works, bless the Lord!",
        "O wonderful Nicholas, thou wast given to the faithful as a great champion and swift helper, and thou ceasest not to intercede for those who cry: All ye His works, bless the Lord!",
        "O holy hierarch Nicholas, thou art a fervent intercessor and a wondrous helper to all who call upon thee, who cry: All ye His works, bless the Lord!"
      ],
      theotokion: null
    },
    9: {
      irmos: "Every tongue is at a loss to praise thee worthily; even a mind illumined from on high is overwhelmed when it would hymn thee, O Theotokos. But as thou art good, accept our faith; for thou knowest our love inspired of God, for thou art the intercessor of Christians, we magnify thee.",
      troparia: [
        "O holy apostles of the Lord, ye traversed the whole earth and enlightened all nations with the light of the Gospel; intercede before Christ for those who hymn you.",
        "O glorious apostles, having received the grace of the All-holy Spirit, ye healed every sickness and drove out demons; cease not to intercede for those who faithfully hymn you.",
        "O holy Nicholas, thou art a great wonderworker and a swift helper of those in need; cease not to intercede before Christ for those who call upon thee with love.",
        "O glorious father Nicholas, thou wast given to the faithful as a fervent intercessor and a great champion; intercede before God for those who hymn thee."
      ],
      theotokion: "O pure Theotokos, thou art the haven of Christians and the fervent intercessor; from every tribulation, danger, and eternal condemnation deliver those who with faith take refuge in thee."
    }
  }
},
            5: {
  metadata: {
    day:             "Friday",
    theme:           "The Holy Cross and the Theotokos",
    canons:          ["Canon of the Holy and Life-creating Cross", "Canon of the Theotokos"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross then Canon of the Theotokos per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "195–201",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Having traversed the deep on foot as on dry land, and having beheld the Egyptian tyrant drowned, Israel cried aloud: Let us chant unto God a hymn of victory!",
      troparia: [
        "Having voluntarily accepted the Cross, O Lord, Thou didst nail to it the sin of Adam and hast saved those who hymn Thee with faith and love.",
        "Uplifted upon the Cross, O Savior, Thou didst pour out streams of salvation upon all who glorify Thee with faith.",
        "O most immaculate Theotokos, thou gavest birth to the Creator of all in the flesh; cease not to intercede before Him for those who hymn thee."
      ],
      theotokion: "O most immaculate Theotokos, thou gavest birth to the Creator of all in the flesh; cease not to intercede before Him for those who hymn thee."
    },
    3: {
      irmos: "Thou art the confirmation of those who flee unto Thee, O Lord; Thou art the light of those in darkness, and my spirit doth hymn Thee.",
      troparia: [
        "When Thou wast lifted up upon the Cross, O Savior, Thou didst draw all men unto Thyself, delivering from corruption those who hymn Thee.",
        "Stretched out upon the Cross, O Word, Thou didst stretch out Thine arms and gather together those who were scattered, reconciling them to the Father.",
        "O most immaculate Theotokos, thou art the confirmation of the faithful; by thy supplications before Christ deliver from every tribulation those who take refuge in thee."
      ],
      theotokion: "O most immaculate Theotokos, thou art the confirmation of the faithful; by thy supplications before Christ deliver from every tribulation those who take refuge in thee."
    },
    4: {
      irmos: "Thou hast come from the Virgin, neither as an ambassador nor as an angel, but Thou the very Lord incarnate, and hast saved me, the whole man; therefore I cry to Thee: Glory to Thy power, O Lord.",
      troparia: [
        "By the Cross, O Savior, Thou hast trampled upon death and opened the gates of paradise to the thief; grant to us also the inheritance of paradise.",
        "Having been nailed to the Cross of Thine own will, O Savior, Thou didst free us from the curse of the law and hast granted us divine life.",
        "O all-immaculate Theotokos, thou art the intercessor of sinners; by thy supplications before Christ deliver from every tribulation those who take refuge in thee."
      ],
      theotokion: "O all-immaculate Theotokos, thou art the intercessor of sinners; by thy supplications before Christ deliver from every tribulation those who take refuge in thee."
    },
    5: {
      irmos: "O Lord, enlighten us with Thy commandments, and with Thine upraised arm grant us Thy peace, O Thou Who lovest mankind.",
      troparia: [
        "Uplifted upon the Tree, O Word, Thou didst uproot the tree of disobedience and hast planted the tree of life for those who hymn Thee.",
        "By Thy Cross, O Lord, Thou hast sanctified all creation and delivered from the ancient curse those who glorify Thee with faith.",
        "O most pure Theotokos, thou gavest birth to the Lord of all; by thy supplications before Him deliver from every tribulation those who hymn thee."
      ],
      theotokion: "O most pure Theotokos, thou gavest birth to the Lord of all; by thy supplications before Him deliver from every tribulation those who hymn thee."
    },
    6: {
      irmos: "Having cried out with his whole heart unto the compassionate God from the belly of the whale, Jonah was brought forth from the abyss; and he cried aloud: Raise my life from corruption, O Lord!",
      troparia: [
        "Having voluntarily accepted the Cross, O long-suffering Lord, Thou didst deliver from the ancient curse those who hymn Thee with faith.",
        "Thou wast pierced in Thy side by a spear, O Savior, and hast healed the wound of our forefather Adam, granting incorruption to those who hymn Thee.",
        "O all-immaculate Theotokos, thou art the haven of those who take refuge in thee; from every tribulation and sorrow deliver those who hymn thee with love."
      ],
      theotokion: "O all-immaculate Theotokos, thou art the haven of those who take refuge in thee; from every tribulation and sorrow deliver those who hymn thee with love."
    },
    7: {
      irmos: "The pious youths in the furnace of fire quenched the flame with the dew of the Spirit and chanted: Blessed art Thou, O Lord God of our fathers!",
      troparia: [
        "When Thou wast crucified upon the Cross, O Lord, Thou didst shake all creation; and the enemy, beholding Thy might, cried: Blessed art Thou, O Lord God of our fathers!",
        "Thou didst bow Thy head upon the Cross, O Master, and didst raise up those who were bowed down; and all creation cried: Blessed art Thou, O Lord God of our fathers!",
        "O most immaculate Theotokos, thou art more exalted than all creation; cease not to intercede before thy Son for those who cry: Blessed art thou who gavest birth to God in the flesh!"
      ],
      theotokion: "O most immaculate Theotokos, thou art more exalted than all creation; cease not to intercede before thy Son for those who cry: Blessed art thou who gavest birth to God in the flesh!"
    },
    8: {
      irmos: "The Chaldaean tyrant was set afire by rage, and he heated the furnace sevenfold; but the pious children were not harmed. Beholding this miracle, the tyrant himself glorified God, crying: Ye servants, bless Him; ye priests, hymn Him; ye people, exalt Him supremely for all ages!",
      troparia: [
        "When Thou wast crucified upon the Cross, O Lord, creation was shaken; and Thou didst open paradise to the thief who cried: All ye His works, bless the Lord!",
        "Having accepted crucifixion of Thine own will, O compassionate One, Thou didst trample upon death; wherefore we cry: All ye His works, bless the Lord!"
      ],
      theotokion: null
    },
    9: {
      irmos: "Every tongue is at a loss to praise thee worthily; even a mind illumined from on high is overwhelmed when it would hymn thee, O Theotokos. But as thou art good, accept our faith; for thou knowest our love inspired of God, for thou art the intercessor of Christians, we magnify thee.",
      troparia: [
        "By Thy Cross, O Savior, Thou hast overthrown the power of death and opened paradise to the thief; grant also to us who hymn Thee the inheritance of paradise.",
        "Thou wast uplifted upon the Tree, O Word, and hast drawn all men unto Thyself; wherefore we cry: O Theotokos, magnify us who faithfully magnify thee!"
      ],
      theotokion: "O pure Theotokos, thou art the glory of Christians and the confirmation of the faithful; by thy supplications before Christ deliver from every tribulation those who hymn thee."
    }
  }
},
            6: {
  metadata: {
    day:             "Saturday",
    theme:           "All Saints and the Departed",
    canons:          ["Canon of All Saints", "Canon of the Departed"],
    flatteningOrder: "Canon of All Saints irmos governs; troparia: Canon of All Saints then Canon of the Departed per ode, in source order; theotokion: final theotokion of the ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. III (Tones V & VI), St. John of Kronstadt Press",
    pages:           "201–208",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Having traversed the deep on foot as on dry land, and having beheld the Egyptian tyrant drowned, Israel cried aloud: Let us chant unto God a hymn of victory!",
      troparia: [
        "O ye saints, who shone forth in the world as noetic stars and enlightened the ends of the earth with the light of piety: By your supplications before God deliver from every evil those who honor you.",
        "O ye holy martyrs, who manfully endured the torments of the tyrants and destroyed the error of the ungodly: By your supplications before God deliver from every tribulation those who honor you.",
        "O Christ, Who in Thy mercy hast created man and hast granted him to share in Thine image: Vouchsafe rest in Thy kingdom to those who have fallen asleep in faith.",
        "O God, Who hast fashioned man from the earth and hast granted him a share in Thine image: Vouchsafe to Thy servants who have fallen asleep in faith the inheritance of paradise."
      ],
      theotokion: "O all-immaculate Theotokos, thou art the hope of Christians and the intercessor of the faithful: By thy supplications before God deliver from every tribulation those who honor thee."
    },
    3: {
      irmos: "Thou art the confirmation of those who flee unto Thee, O Lord; Thou art the light of those in darkness, and my spirit doth hymn Thee.",
      troparia: [
        "O ye saints, who have received the grace of the Spirit and who intercede before God with boldness: By your supplications deliver from every evil those who honor you with faith.",
        "O ye glorious martyrs, who endured great torments for the sake of Christ: By your supplications before God grant remission of sins to those who honor you.",
        "O greatly Merciful One, Who didst fashion man from the earth: Vouchsafe rest in Thy heavenly kingdom to Thy servants who have fallen asleep in faith.",
        "O Christ, Who art the Life of all: Grant rest in the land of the meek to those who have fallen asleep in faith, and number them with the saints."
      ],
      theotokion: "O most immaculate Theotokos, thou art the hope of the hopeless and the intercessor of sinners: By thy supplications before God deliver from every tribulation those who honor thee."
    },
    4: {
      irmos: "Thou hast come from the Virgin, neither as an ambassador nor as an angel, but Thou the very Lord incarnate, and hast saved me, the whole man; therefore I cry to Thee: Glory to Thy power, O Lord.",
      troparia: [
        "O ye saints, who are the pillars of the Church and the luminaries of the world: By your supplications before God deliver from all evil those who honor you.",
        "O ye holy martyrs, who struggled bravely for the sake of Christ: By your supplications before God grant remission of sins to those who honor you with faith.",
        "O Christ, the Life and Resurrection of all: Vouchsafe rest in Thy heavenly kingdom to Thy servants who have fallen asleep in faith.",
        "O greatly Merciful One, Who hast authority over the living and the dead: Number with Thy saints those who have fallen asleep in faith and love of Thee."
      ],
      theotokion: "O all-pure Theotokos, thou art the confirmation of the faithful and the protection of those who take refuge in thee: By thy supplications before God deliver from every tribulation those who honor thee."
    },
    5: {
      irmos: "O Lord, enlighten us with Thy commandments, and with Thine upraised arm grant us Thy peace, O Thou Who lovest mankind.",
      troparia: [
        "O ye saints, who are ministers of God and lamps of light to the world: By your supplications before God enlighten the souls of those who honor you.",
        "O ye holy martyrs, who endured torments for the sake of Christ and received crowns of victory: By your supplications before God deliver from all evil those who honor you.",
        "O Christ, the Resurrection of all: Vouchsafe rest in the land of the living to those who have fallen asleep in faith, overlooking all their sins.",
        "O Lord, Who hast authority over the living and the dead: Vouchsafe to those who have fallen asleep in faith the good things of heaven and rest with all the saints."
      ],
      theotokion: "O most immaculate Theotokos, thou art the haven of Christians and the intercessor of the faithful: By thy supplications before Christ deliver from every tribulation those who honor thee."
    },
    6: {
      irmos: "Having cried out with his whole heart unto the compassionate God from the belly of the whale, Jonah was brought forth from the abyss; and he cried aloud: Raise my life from corruption, O Lord!",
      troparia: [
        "O ye saints of God, who have received the grace of the Spirit and who stand before the throne of God: By your supplications deliver from every evil those who honor you with faith.",
        "O ye holy martyrs, who endured many tribulations for the sake of Christ: By your supplications before God deliver from all evil those who honor you.",
        "O Christ, the Resurrection of all: Receive the souls of Thy servants who have fallen asleep in faith and vouchsafe them rest in the heavenly kingdom.",
        "O greatly Merciful One, Who hast power over the living and the dead: Receive Thy servants who have fallen asleep and number them with the saints in Thy kingdom."
      ],
      theotokion: "O all-immaculate Theotokos, thou art the intercessor of sinners and the haven of the storm-tossed: By thy supplications before God deliver from every tribulation those who honor thee."
    },
    7: {
      irmos: "The pious youths in the furnace of fire quenched the flame with the dew of the Spirit and chanted: Blessed art Thou, O Lord God of our fathers!",
      troparia: [
        "O ye saints, who are the pillars of the Church and the luminaries of the world and who stand before the throne of God: Intercede for those who cry: Blessed art Thou, O Lord God of our fathers!",
        "O ye glorious martyrs, who endured torments for the sake of Christ and received crowns of victory: Intercede for those who cry: Blessed art Thou, O Lord God of our fathers!",
        "O Christ, Who art the Resurrection of all: Vouchsafe rest in the heavenly kingdom to Thy servants who have fallen asleep, who cry: Blessed art Thou, O Lord God of our fathers!",
        "O Lord, Who hast authority over the living and the dead: Number with Thy saints those who have fallen asleep in faith and cry: Blessed art Thou, O Lord God of our fathers!"
      ],
      theotokion: "O most immaculate Theotokos, thou art the confirmation of the faithful: Cease not to intercede before thy Son for those who cry: Blessed art thou who gavest birth to God in the flesh!"
    },
    8: {
      irmos: "The Chaldaean tyrant was set afire by rage, and he heated the furnace sevenfold; but the pious children were not harmed. Beholding this miracle, the tyrant himself glorified God, crying: Ye servants, bless Him; ye priests, hymn Him; ye people, exalt Him supremely for all ages!",
      troparia: [
        "O ye saints, who have received the grace of the Spirit and who stand before the throne of God: Intercede for those who cry: All ye His works, bless the Lord!",
        "O ye glorious martyrs, who struggled bravely for the sake of Christ: Intercede before God for those who cry: All ye His works, bless the Lord!",
        "O Christ, the Resurrection of all: Vouchsafe rest with the saints to Thy servants who have fallen asleep in faith and cry: All ye His works, bless the Lord!",
        "O Lord, Who hast power over the living and the dead: Grant rest to Thy servants who have fallen asleep, who cry: All ye His works, bless the Lord!"
      ],
      theotokion: null
    },
    9: {
      irmos: "Every tongue is at a loss to praise thee worthily; even a mind illumined from on high is overwhelmed when it would hymn thee, O Theotokos. But as thou art good, accept our faith; for thou knowest our love inspired of God, for thou art the intercessor of Christians, we magnify thee.",
      troparia: [
        "O ye saints, who are the pillars of the Church and the glory of the faithful: By your supplications before God deliver from every tribulation those who honor you.",
        "O ye holy martyrs, who endured great torments for the sake of Christ and received crowns of victory: By your supplications before God deliver from all evil those who honor you.",
        "O Christ, the Resurrection of all: Vouchsafe rest in the heavenly kingdom to Thy servants who have fallen asleep in faith, overlooking all their transgressions.",
        "O Lord, Who hast power over the living and the dead: Grant rest with the saints to those who have fallen asleep in faith and hope of the resurrection."
      ],
      theotokion: "O most immaculate Theotokos, thou art the hope of Christians and the fervent intercessor: From every tribulation, danger, and eternal condemnation deliver those who with faith take refuge in thee."
    }
  }
}
        },

        7: {
            1: {
  metadata: {
    day:             "Monday",
    theme:           "Repentance and the Bodiless Powers",
    canons:          ["Canon of Repentance to our Lord Jesus Christ and His holy martyrs, the composition of Joseph", "Canon of the holy incorporeal angels, the composition of Theophanes"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance troparia then Martyrica then Canon of Angels troparia per ode, in source order; where source marks Twice the troparion is spelled out twice in the array; theotokion: final theotokion of the full ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. IV (Tones VII & VIII), St. John of Kronstadt Press",
    pages:           "23–27",
    verified:        true
  },
  odes: {
    1: {
      irmos: "In Egypt, Moses led Israel forth with the help of God. To Him alone let us sing, for He hath been glorified!",
      troparia: [
        "Having fallen into the abyss of evils, I cry unto Thee: Reach forth Thy hand unto me, O Compassionate One, and save me, as Thou didst Peter, O Thou Who lovest mankind.",
        "With a gesture of Thy mercy, O Christ, wash away the many offenses from me who repent, as Thou didst the harlot, that I may glorify Thee with faith.",
        "O Christ Who made Thy saints luminous in the crucible of multifarious wounds, by their entreaty deliver me from the darkness of the passions.",
        "Purified by the endurance of wounds, the holy martyrs shone more brightly than the sun, and cast deception into darkness.",
        "Having illumined my mind with Thy light, O Christ infinite in power, inspire me to hymn Thine angels, in that Thou art omnipotent.",
        "Having illumined my mind with Thy light, O Christ infinite in power, inspire me to hymn Thine angels, in that Thou art omnipotent.",
        "Possessed of the mighty radiance which doth originate with the well-spring of the Godhead, the choirs of heaven honor Christ with hymns."
      ],
      theotokion: "We, the faithful, know thee to be adorned with divine splendors, O pure one, and we all manifestly cry out to thee: Rejoice!"
    },
    3: {
      irmos: "My heart hath been established in the Lord; my horn hath been exalted in my God; my mouth hath been enlarged over the enemy; and I have found gladness in Thy salvation.",
      troparia: [
        "At night I have been beset by unseemly sins. Illumine me now with the light of repentance, O Bestower of light Who lovest mankind, that I may glorify Thee with love.",
        "All the paths I have followed in this life have brought me down into the defile of the passions. O Jesus, show me the divine paths of repentance!",
        "Having finished your struggles with valor, O most glorious martyrs, ye have been vouchsafed crowns; and ye pray for all.",
        "Having endured myriads of pangs, O passion-bearers, ye have been vouchsafed myriads of good things, having joined the myriads of the incorporeal hosts.",
        "As mediators of the manifestation of the Divinity, O ye choirs of angels, ye unceasingly cry out immaterially: Holy art Thou, O Lord!, saving our souls.",
        "Emitting divine effulgence upon one another with love of the law, ye chant in goodly ranks unto Christ: Holy art Thou, O Lord, Who alone art greatly merciful!",
        "Let us piously emulate the life of the secondary luminaries of the primal Radiance, chanting unto Christ: Holy art Thou, O Lord!, saving our souls."
      ],
      theotokion: "The Word Who loveth mankind, Who by His will brought all things out of non-existence, in His lovingkindness took flesh of thee, O Virgin, becoming man."
    },
    4: {
      irmos: "By Thy dispensation the virtue of Thine ineffable wisdom hath covered the heavens, O Christ God Who lovest mankind.",
      troparia: [
        "O Compassionate Word, Who desirest that all men be saved, save me who have transgressed Thy precepts, and destroy me not.",
        "I have submitted to the irrational passions, O Compassionate One, and made myself like unto the beasts. O Word of God, taking pity save me.",
        "Bound and burned with fire, ye utterly consumed deception, aflame with the zeal of piety, O martyrs.",
        "Ye were shown to be a noetic paradise, O blessed ones, having in your midst the Tree of life: Christ, the Husbandman of all.",
        "O ye choirs of angels who stand before Christ as chosen ministers: Entreat Him to heal the wounds of my soul.",
        "The armies of incorporeal beings, standing with reverence round about Thy throne, O Master, ever manifestly cry out: Glory to Thy power, O Lord!",
        "The ranks of angels were amazed, beholding Thee, O Christ, living on earth in the body, with mortal men."
      ],
      theotokion: "In thine all-pure and most holy womb the all-divine Mind joined Himself to what is human, O pure one, uniting Himself hypostatically, without confusion or change."
    },
    5: {
      irmos: "Rising at dawn unto Thy glory and laudation, O Word, we unceasingly praise the image of Thy Cross, which Thou hast given us as a weapon to help us.",
      troparia: [
        "I have wasted my life in slothfulness, and tremble before Thine inevitable tribunal, at which I, the passion fraught, must needs be judged. Have pity on me, O Lord!",
        "O Word Who enlightened the eyes of the blind, open Thou the eyes of my soul, which have been cruelly darkened, that I may behold the light of Thy precepts.",
        "Confessing Christ with mighty thought, ye endured the wounds of every torment, O valiant athletes; wherefore, ye were blessed.",
        "Navigating the threefold waves of all torments, ye reached the harbor of the kingdom on high, full of true serenity, O martyrs.",
        "Illumined by immaterial effulgences, with most sacred and eloquent mouths the seraphim hymn the all-unoriginate and all-divine Godhead.",
        "Not daring to gaze upon the divine Radiance, the cherubim, the manifestations of the wisdom of God, cover themselves with their sacred and most luminous wings.",
        "Delighting noetically in divine, most rich and most beauteous effulgence, the glorious thrones are supernaturally shown to be beholders of ineffable things."
      ],
      theotokion: "In thine all-pure and most holy womb the all-divine Mind joined Himself to what is human, O pure one, uniting Himself hypostatically, without confusion or change."
    },
    6: {
      irmos: "Jonah cried out from the belly of hades: Lead up my life from corruption! And we cry out to Thee: O almighty Savior, have mercy on us!",
      troparia: [
        "The abyss of transgressions hath encompassed me, and I have gone down into the depths of destruction. Lead me up, O Word, as once Thou didst raise Jonah up from corruption unto life.",
        "Threefold waves of evil thoughts bestorm me, but guide me to the harbor of true repentance, O Compassionate One, preserving my heart in tranquillity.",
        "Defended by your faith, O holy martyrs, ye rejected the false blandishments of the tyrants, and were not wounded by the darts of the enemy.",
        "Uplifted to God in love, ye hated worldly love, O martyrs, and were shown to be friends of the Creator of all.",
        "The dominions are ever shown to be illumined like the youths with the effulgences of the Godhead, hymning His ineffable glory.",
        "The dominions are ever shown to be illumined like the youths with the effulgences of the Godhead, hymning His ineffable glory.",
        "Gazing with love upon Him Who is omnipotent in power, the divine hosts manifestly remain mighty in strength."
      ],
      theotokion: "A descendant of the royal tribe, O Virgin, thou gavest birth in manner transcending nature unto the Word, the King of all, and wast truly perfected as a virgin."
    },
    7: {
      irmos: "Thou didst bedew the burning furnace, O Savior and didst save the children who chanted, saying: Blessed art Thou forever, O Lord God of our fathers!",
      troparia: [
        "Make thou a sacrifice of praise unto God, O my soul. Haste thou and repent while the commerce of life is still underway. Now shall I purchase goodly gifts.",
        "The severance of death is nigh at hand, O my soul; bring forth worthy fruits, lest thou be cast into the fire of Gehenna like the barren tree, and wail inconsolably.",
        "Having quenched the furnace of deception with torrents of blood, the holy martyrs cried aloud like the children: O God of our fathers, blessed art Thou!",
        "Having mingled with the Light ye desired, O martyrs, ye became children of the Light. And ye enlighten all who are in darkness, and dispel the gloom of deception.",
        "Manifestly surrounding Thy throne, O Christ, the choirs of heaven manifestly send up glory noetically, crying: O God of our fathers, blessed art Thou!",
        "Manifestly surrounding Thy throne, O Christ, the choirs of heaven manifestly send up glory noetically, crying: O God of our fathers, blessed art Thou!",
        "Immaterially revolving around Thee, the one Godhead with zeal derived therefrom, the principalities cry out with unceasing glorifications: O God of our fathers, blessed art Thou!"
      ],
      theotokion: "O Theotokos, without seed thou gavest birth to the one Christ, the God of our fathers: a single Hypostasis in two natures, Who carrieth out His awesome dispensation."
    },
    8: {
      irmos: "The bush on Sinai which partook of fire without being consumed revealed God unto Moses, who was slow of speech and spake with difficulty; and the zeal of God showed forth the three children in the fire as invincible, who chanted: Hymn the Lord, all ye works of the Lord, and exalt Him supremely forever!",
      troparia: [
        "I received the Word like a radiant lampstand, but, wretch that I am, I have inclined toward the irrational passions and ever walk in the darkness of evil.",
        "The Lord is nigh, as we believe. Take care, O my soul, and be not despondent. Be thou vigilant, and cry out in watchfulness: O Compassionate One Who lovest mankind, save me!",
        "Having tasted of divine sweetness, ye endured the bitterness of pain, and now enjoy the divine communion of the Word, O martyrs.",
        "Ye have entered into divine peace and received the good things ye hoped for, O most lauded martyrs; wherefore, we bless you as is meet.",
        "Having set all your desire upon God, O archangels who delight in His radiance, entreat Christ, the King of all, that those who hymn you may be delivered from perils.",
        "Having set all your desire upon God, O archangels who delight in His radiance, entreat Christ, the King of all, that those who hymn you may be delivered from perils.",
        "As most honored intelligences free of all passionate material attachments, O angels, save all who with you lovingly exalt Christ for all ages."
      ],
      theotokion: "Having ineffably received the unapproachable Light in thy womb, O Virgin Theotokos, thou hast enlightened those in the darkness of life, that they may piously glorify Christ Who ineffably issued forth from thee."
    },
    9: {
      irmos: "O ye faithful, with hymns let us magnify the Theotokos, who became a mother in manner transcending nature, is a virgin by nature, and is blessed among women!",
      troparia: [
        "Lo! the judgment approacheth, and possessed of condemnation for my deeds, I am cast into despondency. O Christ God, righteous Judge, condemn me not!",
        "Like the faithful Canaanite woman I cry to Thee: Have mercy upon me! And straighten me as Thou didst the hunchback of old, that I may walk aright in Thy ways, O Thou Who lovest mankind.",
        "Ye stripped away the garments of all evil, O athletes, and, clad in grievous torments, ye won for yourselves the vesture of glory.",
        "The divine land of the living, the city of Sion on high, received you, the firstborn who are illumined by the beauties of your struggles, O athletes.",
        "All the choirs of the angels, delighting in the radiance of the effulgence of the Godhead, unceasingly hymn our all-glorious God and ever glorify Him.",
        "All the choirs of the angels, delighting in the radiance of the effulgence of the Godhead, unceasingly hymn our all-glorious God and ever glorify Him.",
        "O cherubim and seraphim, powers, principalities, angels, archangels, authorities, thrones and dominions: Earnestly entreat Christ, that I be delivered from the besetting passions."
      ],
      theotokion: "As a mother now possessed of boldness before thy Son, O most holy Theotokos, deliver those who hymn thee with love from grievous transgressions, ailments and tribulations, that we may all ever magnify thee."
    }
  }
},
            2: {
  metadata: {
    day:             "Tuesday",
    theme:           "Repentance and the Holy Forerunner John the Baptist",
    canons:          ["Canon of Repentance to our Lord Jesus Christ and His holy martyrs, the composition of Joseph", "Canon of the honorable and great prophet John the Forerunner, the composition of Joseph"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance troparia then Martyrica then Canon of the Forerunner troparia per ode, in source order; where source marks Twice the troparion is spelled out twice in the array; theotokion: final theotokion of the full ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. IV (Tones VII & VIII), St. John of Kronstadt Press",
    pages:           "31–37",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Unto Him Who crushed battles with His arm and drowned the mounted captains let us sing, as to our God and Deliverer, for He hath been glorified.",
      troparia: [
        "I ever commit sins, and have no fear of Thee, O Christ, Who seekest my repentance with longsuffering. Grant me the intention to convert, and disdain me not, in that Thou art good.",
        "Wretch that I am, I never cease to heap up sins upon sins, O Christ, O only Good and Sinless One. Take pity and save me.",
        "Boldly did the valiant athletes call to each other: This contest is full of struggles. Let us run, for Christ, the Judge of the contest standeth before us, crowning those who vanquish the enemy.",
        "Ye put off the body through multifarious wounds, and clothed yourselves in the vesture of incorruption, O wise martyrs; and ye became children of the Father of compassions.",
        "The beauty of the Church, thou wast shown to be adorned, O blessed Forerunner. By thy supplications ever save it mighty and unshaken by every tempest of the heretics.",
        "Thou didst offer thyself to the Creator as a sacred, unblemished sacrifice, O divine Forerunner, and wast slaughtered like an innocent lamb. Wherefore, I pray thee with faith: Deliver me from all the malice of the enemy."
      ],
      theotokion: "O Virgin Theotokos, heal thou my soul, which hath been afflicted by many sins, that with cries of thanksgiving I may ever earnestly glorify thee."
    },
    3: {
      irmos: "O Thou Who lovest mankind, Who established the heavens and made firm the foundation of the earth upon many waters: Establish Thou my mind in Thy will.",
      troparia: [
        "O Christ, only Savior, Who overlooketh the sins of men in Thy great love for mankind, overlook my many evils, that I may glorify Thee, the All-good One.",
        "I do the wishes of my flesh, unconscionably ignoring Thy wishes, O Christ; and I fear the fiery retribution, O Word. Deliver me therefrom.",
        "While partaking of bodily pangs, the athletes look forward to life and ease without pain; and having received it in joy, they ever ease the pains of the faithful.",
        "With the rays of your struggles ye disperse the cruel night of deception, O passion-bearers, and have passed over to the unwaning Light, ever removing the darkness of our pangs.",
        "Heal thou the diseases of our souls and bodies, O ever-glorious Forerunner, ever beseeching the Word, Who in His lovingkindness hath taken away all infirmities and sicknesses.",
        "Thou didst spring forth from a barren and elderly woman, O blessed one; wherefore, I cry out to thee: With the beauty of repentance renew me who have grown old through many sins."
      ],
      theotokion: "O most holy one, thou gavest birth to the unapproachable Word Who shareth the flesh with us hypostatically. Him do thou ever entreat, that He save all who ever bless thee with faith."
    },
    4: {
      irmos: "Assuring us of Thine advent in the flesh, O Christ, the Prophet Habbakuk cried aloud: Glory to Thy power, O Lord!",
      troparia: [
        "I have wandered from the path which leadeth me to life, and have fallen into the pit of evils. O Savior, disdain me not.",
        "Send down upon me streams of tears, O Master, Word of God, that I may wash away the mire of my many offenses.",
        "Led like lambs to the slaughter, O martyrs, vouchsafed glory ye slew the warlike enemy.",
        "Thy streams of your blood prepared all to receive torrents of delight, O all-praised and divine martyrs.",
        "Having cast down the horde of the adversary and prevailed over them with brilliance, O Baptist, by thy supplications cast down sin which reigneth in me, I pray thee.",
        "Revealed as a noetic lampstand, O blessed one, unto men didst thou point out Jesus, the great Sun of righteousness. Pray thou that the hearts of all may be illumined by Him."
      ],
      theotokion: "The Lord was incarnate of thy pure blood, granting repentance to all men through thy mediation, O Maiden."
    },
    5: {
      irmos: "O Thou Who hast dispelled the night of the passions, illumine me with the noetic light, driving away the primordial darkness of the abyss, and shining forth upon the world the first-created light, O Creator of all.",
      troparia: [
        "When Thou shalt judge the earth, O Word, deliver me from Thy righteous wrath, and show me to be a temple of Thy goodness, cleansed of my many offenses through repentance, O only Creator of all.",
        "I have become blinded in mind by the evil gloom of the passions, and, my heart having become senseless, I know not what I do. Convert me, O Christ, and grant me the repentance which purifies from sin.",
        "Conceived and born in iniquities, I live in slothfulness, and fear the torments to come. Praying to God, rescue me from them, O Baptist.",
        "Bring to God entreaties for us who honor thee, O Baptist, that He may deliver us from every grievous circumstance and from the harm wrought by the demons, we pray.",
        "I have been wounded by the sword of pleasures, and cry out to thee in pain of heart: Heal thou the pangs of my soul, entreating Christ, the only Physician of souls and bodies.",
        "O Forerunner who baptized the Word with thine own hand, cease thou never to entreat Him, that from the hand of sin He deliver me who have sinned greatly and am brought low and condemned."
      ],
      theotokion: "In many images the shadows of the law revealed thee who gavest birth unto God. Him do thou entreat, O most immaculate one, that He deliver me from iniquity and the carnal passions."
    },
    6: {
      irmos: "Having fallen into the abyss of sin, O Good One, like Jonah from the midst of the sea monster I cry unto Thee: Lead up my life from corruption, and save me, O Thou Who lovest mankind.",
      troparia: [
        "I have been shown to be a new prodigal, having lived vilely on earth, and have capitulated before the assault of the passions; but turn me, O Christ my God, and save me, in that Thou lovest mankind.",
        "Groan thou, O my soul, that thou mayest be delivered from groaning; shed tears, that in the next world thou mayest not taste of ceaseless tears and pain, which will avail thee not.",
        "Ye were shown to be like stones manifestly set in the crown of the Church of Christ, and became its magnificent adornment, O honored great-martyrs.",
        "Having received worthy ends in God, O all-wise ones, ye have inherited never-ending rewards. Wherefore, pray ye, O martyrs, that we may end our life in repentance.",
        "Manifestly aglow with rays of the virtues, and shining with splendid martyrdom, thou dost illumine all creation, O close friend of the noetic Dayspring.",
        "O divine prophet, lampstand of the never-waning Light, with thy supplications light the lamp of my heart, and cause me to share in the divine Light."
      ],
      theotokion: "Lift me up out of the depths of the slothfulness of countless evils, O good one who gavest birth to the Abyss of lovingkindness, and grant me a well-spring of tears, O Ever-virgin."
    },
    7: {
      irmos: "In the furnace the fire neither touched nor disturbed Thy children, O Savior. Then the three, as with a single mouth, hymned and blessed Thee, saying: Blessed art Thou, O God of our fathers!",
      troparia: [
        "I have fallen into the passion of dishonor, O Savior, and have made myself like unto the beasts. And, benighted, I no longer see Thee waiting with great patience, O Word. Grant me time for repentance, and save me.",
        "I have reached the end of my life in slothfulness, doing what I ought not to do; and lo! I approach now the gates of hades all unawares. Disdain me not, O Christ Who alone art good.",
        "Ye stripped away the garments of all evil, O athletes, and, clad in grievous torments, ye won for yourselves the vesture of glory.",
        "O all-wise ones, ye died, desiring everlasting life for the world; and having utterly slain the enemy, ye took wing to the heavens, ever praying for us, O athletes.",
        "Released from the demands of the body, O martyrs, ye broke asunder the bonds of deception, and with mighty love bound men's souls to Christ Who was bound by the flesh and loosed men from the curse.",
        "By thy supplications grant me showers of tears, O Forerunner who immersed the Abyss of lovingkindness in the river's streams, and wholly cleanse me of defilement of flesh and spirit.",
        "By thy supplications grant me showers of tears, O Forerunner who immersed the Abyss of lovingkindness in the river's streams, and wholly cleanse me of defilement of flesh and spirit.",
        "Offer entreaty to our God, Who is over all, that, in that He is full of lovingkindness, He have mercy upon me who have sinned and cannot recover.",
        "O barren soul, haste thou to repent, lest the righteous judgment cut thee down at the root like the barren fig-tree; but cry unto the Master: O God of mine, save me!"
      ],
      theotokion: "Possessed of a soul slain by evil crimes, I pray thee, O Mistress who slew hades by thy birthgiving: Enliven me with models of repentance."
    },
    8: {
      irmos: "Ye heavens of heavens, O earth and ye mountains, ye hills and depths of the sea, and all ye race of men, with hymns bless ye as Creator and Deliverer God Who is unceasingly glorified in the highest by the angels!",
      troparia: [
        "Enjoying harmful pleasures in overabundance, I, the senseless one, have madly surpassed every other sinner. As Thou hast an infinite abundance of lovingkindness, grant me cleansing of my transgressions.",
        "The Bridegroom is at the door! Light thy lamp, O my soul, filling it with the oil of lovingkindness and every good work. Before the door is closed, make haste to enter with Christ in ineffable joy.",
        "Undaunted by tortures, the valiant athletes cried out: Behold, now is the acceptable time! Let us all stand with steadfast mind, and with a little pain, let us acquire the life which is devoid of pain and sweetness which groweth not old!",
        "Ever irrigated with divine waters, O passion-bearers of the Savior, ye water the whole earth with the emulation of your struggles, and forever render it fruitful in the virtues, for Christ.",
        "Cease thou never to entreat the only Deliverer, Who gave release to those who were bound and ever glorifieth thee, O prophet, that I, who have been bound, may be released from my many transgressions.",
        "I have been wounded by the sword of pleasures, and cry out to thee in pain of soul: Heal thou the pangs of my soul, entreating Christ, the only Physician of souls and bodies."
      ],
      theotokion: "Thou didst remain unconsumed when thou didst take the unbearable Fire into thy womb, O Virgin. Wherefore, rescue me from the unquenchable fire, bedewing me now with the all-beauteous examples of true repentance."
    },
    9: {
      irmos: "Who among men is able to describe the seedless conception of thy birthgiving? Who among mortals will not marvel at the birth of thine incorrupt Offspring? Wherefore, we, the tribes of earth, magnify thee, O Theotokos.",
      troparia: [
        "That we may inherit the good things to come, let us weep, let us sigh, let us entreat Christ, O ye faithful, while we have time for repentance and prayer.",
        "Like the Canaanite woman I cry to Thee: Have mercy on me, O Christ, as of old Thou didst set aright the prostrate woman, O Jesus, and save me who am drowning in sins, as Thou didst Peter O Savior.",
        "Afflicted by tribulations, imprisonment and torments, O martyred passion-bearers, ye passed over to the broad plain of consolation, and deliver us from oppression and transgressions.",
        "While the earth hath now covered your bodies, heaven holdeth your holy souls; and standing ever before the throne of glory, they rejoice with the angels.",
        "Thou didst spring forth from a sacred root, O prophet, and didst wholly uproot the roots of evil, whereby I am choked and am become useless. O blessed one, set me aright, that I may put forth the fruits of divine repentance.",
        "O Forerunner who baptized the Word with thine own hand, cease thou never to entreat Him, that from the hand of sin He deliver me who have sinned greatly and am brought low and condemned."
      ],
      theotokion: "The Lord Who clothed Himself in me issued forth from thee, O all-pure one; wherefore, beseech Him to illumine me with the vesture of light, having now stripped from the most grievous rags of the passions, O Virgin."
    }
  }
},
            3: {
  metadata: {
    day:             "Wednesday",
    theme:           "The Holy Cross and the Theotokos",
    canons:          ["Canon to the precious and life-creating Cross of the Lord, the composition of Joseph", "Canon of the all-holy Theotokos, the composition of Joseph"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross troparia then Martyrica then Canon of the Theotokos troparia per ode, in source order; where source marks Twice the troparion is spelled out twice in the array; theotokion: final theotokion of the full ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. IV (Tones VII & VIII), St. John of Kronstadt Press",
    pages:           "40–46",
    verified:        true
  },
  odes: {
    1: {
      irmos: "By Thy hand was the nature of water, which before was fluid, transformed into solid form, O Lord. Wherefore, having passed through it dryshod, Israel chanteth to Thee a hymn of victory.",
      troparia: [
        "Mocked, the Master endureth crucifixion, removing the mockeries of men in that He loveth mankind. He is pierced by a spear, thereby slaying the adverse foe.",
        "Wielding Thy Cross like a bow, O merciful Savior, with the darts of the nails Thou didst wound the adversary, and didst heal men, who of old were wounded by him.",
        "By the blood of the saints were the abominable defilements of blood offered to the idols abolished; and the whole earth is sanctified, ever blessing the martyrs with praises.",
        "The hosts of heaven lifted their voice in song, beholding those on earth doing battle against incorporeal foes. Wherefore, the Judge of the contest hath crowned them victors.",
        "O Theotokos, preserve thy people, who hymn thy mighty works with love, and deliver them from harm; for thou art the intercessor, guide and confirmation of all, O pure one.",
        "O Virgin who gavest rise to the Water of immortality, grant us the waters of healing, washing away all the deadly passions of our souls and bodies.",
        "O Mistress, full of the grace of God, thou wast shown to be the honored habitation of Him Who honored the nature of our forefather [Adam]; wherefore, we beseech thee: Deliver us from all dishonor.",
        "Having given birth to the Sun of righteousness for the world, O most immaculate Maiden, drive the darkness away from those who hymn thee with faith in this thy splendid and holy temple."
      ],
      theotokion: "In this thy divine temple, wherein thou hast shown forth a well-spring of miracles, O pure one, grant the salvific petitions of thy servants; and deliver them from torment, ever pouring forth thy divine visitation."
    },
    3: {
      irmos: "O Lord and Savior, Who in the beginning established the heavens by Thine omnipotent word and confirmed all their power by the all-accomplishing and divine Spirit: establish me upon the immovable rock of the confession of Thee!",
      troparia: [
        "O Jesus, Who stretched out the heaven as it were a curtain, Thou didst stretch out Thy hands upon the Tree, healing the intemperance of Adam, in that Thou art merciful, and snatching all from the hands of the lying enemy.",
        "With thorns do the iniquitous men crown Thee, O Christ our King, Who hast crowned men with glory, uprooted the thorns of Adam's disobedience, and planted the plant of understanding for all.",
        "Mortal in essence, therein ye deigned to teach immortality, O all-wise ones; wherefore, wounds and tribulations, persecutions and beatings, and the severing of your members, did ye all endure, rejoicing, O martyrs.",
        "With steadfast intent ye brought low the lying enemy who boasteth that he will destroy all things, O ye athletes who humbled yourselves for Christ; and having arrayed yourselves against him, ye were exalted with divine might.",
        "O Virgin, we have all understood thee to be the holy ground which without seed put forth for us Jesus Christ, the comely Grain Who feedeth those who bless thee with faith and love.",
        "The ways of God Most High were seen in thee, O Virgin, when He ineffably became incarnate; for thou wast the Mother of Him Who reigneth over all.",
        "Pondering thy divine birthgiving, O Virgin, enriched by thine aid, I cry out: Holy art Thou, O Lord, Who saveth our souls!",
        "O Mistress, full of the grace of King of glory, thou hast manifestly exalted human nature to heaven; wherefore, lead me up from the abyss of my manifold transgressions, temptations and passions."
      ],
      theotokion: "O pure Virgin, in manner past understanding and recounting thou gavest birth to the incarnate Word Who hath delivered us from irrationality; wherefore, we unceasingly hymn thee with divine discourse, and glorify thee with faith."
    },
    4: {
      irmos: "O Christ God Who, without leaving the bosom of the Father, didst descend to earth: I have heard the mystery of Thy dispensation, and have glorified Thee, Who alone lovest mankind.",
      troparia: [
        "Having appeared on earth as a man, Thou didst make men heavenly; and suspended upon the Tree, O Master, Thou didst exalt with Thyself all who hymn Thy sufferings.",
        "For mortals Thou dost die, O Life, and for the unjust Thou dost endure violent suffering, O my righteous Jesus. We hymn Thine infinite lovingkindness, O Long-suffering One.",
        "The onslaught of wild beasts, the raging of the flame, the severing of hands and feet, the mutilation of your members, and all other tortures which win divine delight, did ye endure, O martyrs.",
        "Crying out to Christ, the God of all, from the ends of your bodies, O athletes, ye were heard, and have now been set high upon the rock of divine perfection.",
        "O most hymned one, who even before creation appeared to God as wholly elect and beauteous in the splendor of thy radiance, enlighten those who hymn thee.",
        "For man, O pure one, thou gavest birth unto God, Who became incarnate of thy pure blood, and delivereth from many offenses those who with love glorify and honor thee, O Mother and Virgin.",
        "Reason-endowed nature, having now learned the ineffable mystery of thy birthgiving, O most hymned and all-blessed one, offereth priestly ministry unto Him Who shone forth from thee."
      ],
      theotokion: "Make entreaty for us to Him Who became incarnate of thee, O Theotokos, that we who glorify His sufferings may find help in time of peril."
    },
    5: {
      irmos: "Rising at dawn unto Thee out of the night, I beseech Thee, O Lord my God: Grant me remission of my transgressions, and guide my steps to the light of Thy precepts, I pray.",
      troparia: [
        "Accepting crucifixion for the removal of evils, O Word of God, Thou didst taste gall, abolishing the bitter harm wrought by the pleasing fruit. Glory to Thy great lovingkindness!",
        "By Thy suspension upon the Cross, Thou didst cause the whole earth to quake by Thy divine might and healest the abasement thereof, O Master; and Thou makest wavering hearts steadfast in the knowledge of Thee.",
        "Belial everywhere spread his evil nets, yet he did not ensnare the martyrs of Christ; for, receiving wings of fire, they reached the divine mansions.",
        "Deified by God with the hand of His abundance, O passion-bearers, ye were in nowise daunted by painful tortures, for for you it was as though others were suffering; and ye remained thus, O all-wise ones.",
        "Keeping vigil, we are weighed down by the sleep of sin, O pure one; yet in thine all-honored temple take pity on us by thy vigilant divine supplication, O Bride of God.",
        "O pure one, grant a helping hand unto all of us who have recourse unto thee; wash away the defilement of all evil, and by thy supplications cleanse us of illness.",
        "O all-pure Theotokos, who conceived God in thy virginal womb and gavest birth to Him: From all everlasting condemnation deliver those who hymn thee.",
        "The souls of those who come to thy temple with faith, having grown old through sins, are renewed, O all-immaculate one, and they all glorify thee as is meet."
      ],
      theotokion: "O most hymned Virgin, who by thine all-pure birthgiving released Eve from pain: Release me also from the pain of the passions which assail my soul and body."
    },
    6: {
      irmos: "Sailing amid the tumult of the cares of life, I founder with the ship of sin and am cast to the soul-destroying beast; yet like Jonah I cry to Thee, O Christ: Lead me up from the deadly abyss!",
      troparia: [
        "O only Deliverer, Thou didst pay Thy saving Blood as our price, didst redeem us who were held captive, and didst bring us to Thy Father, slaying the tyrant by the Cross, O all-good Christ.",
        "Of old, through intemperance I suffered a grievous fall, but Christ, uplifted upon the Cross, His arms stretched out, exalted me, who had fallen, and manifestly healed all my wounds.",
        "In nowise sleeping the slumber of deception, O martyrs, ye lulled to sleep every assault of the tormentors; and having fallen into the excellent sleep of the righteous, O blessed ones, ye became ever-watchful advocates for all.",
        "Established firmly upon the rock of Christ's divine precepts, O most glorious martyrs, ye remained unmoved by the wiles of the enemy; and with divine wisdom ye trampled him underfoot, divinely hastening to God.",
        "Thou alone hast poured forth the Water of salvation upon us, O only pure one, drying up the burning of deceptions; and thou bedewest the true understanding of thy servants.",
        "O animate city of our God, free thy flock from godless barbarians, earthquake and want, and from every temptation.",
        "With the application of thy supplications cure the sores of our souls, O Theotokos, that we may hymn thee with divine voices.",
        "O Virgin Maiden, who by thine all-pure birthgiving released Eve from pain: Release me from the pain of the passions of soul and body."
      ],
      theotokion: "O all-pure Theotokos, thou gavest birth to a young Child, Who is known to exist timelessly with the Father, before all ages, and Who by His Cross reneweth mankind, which had grown old through sins by the counsel of the author of evil."
    },
    7: {
      irmos: "Of old, the children showed the fiery furnace to pour forth dew, hymning the one God and saying: Supremely exalted and all-glorious God of our fathers!",
      troparia: [
        "The life of our first parents, devoid of pain, did I find when thou wast suspended upon the Cross and died of Thine own will, and slew the serpent, O greatly merciful Jesus Christ.",
        "We have all been delivered from the curse of the law; for the Bestower of the law was lifted up upon the Cross, pouring forth ever-flowing blessing, grace, mercy, and the abolition of corruption.",
        "Approaching tortures with willing haste, the martyrs voluntarily emulated Him Who suffered; and, crowned by Him, they now join chorus with the angels.",
        "Giving your bodies over to divers torments, O all-praised martyrs, ye drowned the incorporeal foe in the streams of your blood, and pour forth fountains of healing.",
        "Thy Lord and Creator, O Virgin, loved thee, who art possessed of raiment embroidered with gold, wrought of many colors. Supremely exalted and all-glorious is the God of our fathers!",
        "Receiving the burning coal of old, Isaiah was purified, O Maiden; and in signs he beheld thy giving birth to the supremely exalted and all-glorious God of our fathers.",
        "Of old, the divine prophets, beholding images and signs of thy divine birthgiving, joyously cried out, chanting: Supremely exalted and all-glorious is the God of our fathers!"
      ],
      theotokion: "O Theotokos, upon the world thou didst shine forth Christ, the Light Who existeth from before the sun, and Who delivereth from darkness and with divine knowledge enlighteneth all who cry out: Blessed art Thou, O Lord God of our fathers!"
    },
    8: {
      irmos: "The only unoriginate King of glory, whom the hosts of heaven bless, and before Whom the ranks of angels tremble, do ye hymn, O ye priests, and exalt supremely, O ye people!",
      troparia: [
        "The tree of understanding rendered me mortal; but, having died upon the Tree Thou didst enliven me, O my Christ, and enlighten me to chant: Hymn the Lord, O ye priests, and exalt Him supremely for all ages.",
        "O King, the law-breaking assembly crowned Thee with thorns, Who uprootest the thorns of first-created Adam's disobedience; and they suspended Thee upon the Cross, Who hast delivered all from the abyss of deception.",
        "Upon the Tree mindless men stretched Thee out, Who spread out the heavens with understanding, O Savior, Who healest our sufferings by Thy suffering, and causeth our pain to cease through the pain caused in Thy hands by the nails.",
        "The relics of the martyrs emit the sweet fragrance of miracles for those who approach with undoubting heart, and they ever dispel the fœtor of the passions, and in God impart health unto all.",
        "The ranks of the saints pray to the Master, Who issued forth from thy womb, and on the Cross showed them the path of suffering, O pure one; and they glorify thee as the Queen of all.",
        "With the light of thy birthgiving thou didst strangely enlighten the whole world, O Theotokos; for in thine arms thou dost bear Him Who is truly God, Who enlighteneth the faithful, who ever cry: O all ye works of the Lord, hymn the Lord and exalt Him supremely for all ages!",
        "O pure one, we piously hymn thy womb, which ineffably contained the incarnate God, Who hath given the enlightenment of the knowledge of God unto all the faithful, who ever cry: O all ye works of the Lord, hymn the Lord and exalt Him supremely for all ages!",
        "With the splendors of thy light thou hast rendered those who hymn thee luminous, O pure Theotokos, bearer of the Light; for thou wast shown to be the habitation of the Light, illumining with light those who cry: O all ye works of the Lord, hymn the Lord and exalt Him supremely for all ages!"
      ],
      theotokion: "Thy pure and most unblemished state hath purified the vile and abominable state of the whole world, O Virgin; and thou becamest the cause of our reconciliation with God. Wherefore, O all-pure Virgin, all of us, His works, bless and exalt thee supremely for all ages."
    },
    9: {
      irmos: "O Mother of God and Virgin, thou gavest birth yet remainest a virgin still, and this was not a work of nature, but of the condescension of God; wherefore, we ever magnify thee as her who hath been vouchsafed divine wonders.",
      troparia: [
        "When they saw Thee uplifted upon the Cross, O Jesus, almighty King of ages, the sun was darkened, the earth quaked, and the splendor of the veil of the temple was rent asunder.",
        "The iniquitous ran Thy hands and feet through with nails, pierced Thy life-bearing side with a spear, and gave Thee gall and vinegar to drink, O my Christ, Thou true God and delight of all.",
        "They who were broken by all manner of tortures, broke asunder the nets of the author of evil; and having been crowned with victory, the valiant athletes are called blessed.",
        "Through the deposit of their relics the passion-bearers sanctified the whole earth and, cast into the midst of the fire and mystically consumed, they set at nought the vile stench of the sacrifices of the idols.",
        "Thou hast been the Mediatress of everlasting joy and gladness for us, O Ever-virgin Maiden, having given birth to the Deliverer Who delivereth those who worship Him as God in truth and by the divine Spirit.",
        "David, thine ancestor, O all-pure one, hymning thee, calleth thee the ark of divine holiness, which supernaturally contained God Who sitteth in the bosom of the Father. O ye faithful, let us magnify Him without ceasing.",
        "Thou art truly more exalted than all creation, O Maiden, for thou didst give birth bodily to the Creator of all for us; wherefore, as the Mother of the one Master, with authority thou dost carry the victory against all enemies."
      ],
      theotokion: "O blessed one, who art holier than the cherubim, and gavest birth in the flesh unto the Word of God, Who was uplifted upon the Cross of His own will: Earnestly pray to Him in behalf of us all."
    }
  }
},
            4: {
  metadata: {
    day:             "Thursday",
    theme:           "The Holy Apostles and St. Nicholas the Wonderworker",
    canons:          ["Canon of the holy, glorious and all-praised apostles, the composition of Theophanes", "Canon to the great and holy wonderworker Nicholas, the acrostic whereof is 'Accept thou our seventh entreaty, O Nicholas', the composition of Joseph"],
    flatteningOrder: "Canon of the Apostles irmos governs; troparia: Canon of the Apostles troparia then Canon of St. Nicholas troparia per ode, in source order; where source marks Twice the troparion is spelled out twice in the array; theotokion: final theotokion of the full ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. IV (Tones VII & VIII), St. John of Kronstadt Press",
    pages:           "49–55",
    verified:        true
  },
  odes: {
    1: {
      irmos: "By Thy hand was the nature of water, which before was fluid, transformed into solid form, O Lord. Wherefore, having passed through it dryshod, Israel chanteth to Thee a hymn of victory.",
      troparia: [
        "Godlike in your striving for the divine, ye shattered the gods of the ungodly, and to divine love ye have moved all who came to believe in God, O most honored ones.",
        "Godlike in your striving for the divine, ye shattered the gods of the ungodly, and to divine love ye have moved all who came to believe in God, O most honored ones.",
        "As the salt of the whole earth, O divinely eloquent apostles of the Lord, halt the corruption of my heart, and cure it, for it hath lost its savor.",
        "When the most righteous Judge of all will come again, He will sit down with you, O godly apostles; deliver us then from all condemnation.",
        "Having lived a glorious life on earth, O Nicholas, cause those who glorify thee to share in the glory on high.",
        "Sailing the deep of evils, we are buffeted by the waves of life's temptations, O most blessed ones, from which do thou save us.",
        "Grant me now a generous helping hand, O father Nicholas, and deliver me from enemies, visible and invisible."
      ],
      theotokion: "He Who created the immaterial ministers was born of thee in His ineffable mercy, O Theotokos, and was seen of men."
    },
    3: {
      irmos: "O Lord and Savior, Who in the beginning established the heavens by Thine omnipotent word and confirmed all their power by the all-accomplishing and divine Spirit: establish me upon the immovable rock of the confession of Thee!",
      troparia: [
        "Like the heavens ye proclaim the glory of God, as saith the prophet, O wise disciples of God, manifestly making clear His divine incarnation and sufferings, whereby deliver ye all from the passions, death and corruption.",
        "Ye were shown to be sharp arrows of Christ the mighty, O wise disciples of the Lord, wherefore deliver me from the arrows of the evil one, and heal my heart, which hath been grievously wounded by the sword of sin.",
        "O disciples of Christ, who laid bare all the wiles of the enemy and clothed him in shame, make haste to array me in divine vesture, for I have been cruelly deceived and stripped naked of the divine raiment.",
        "Offering up supplication for the whole world, save us from all need and countless tribulations, O holy Nicholas.",
        "As thou didst deliver from prison those inescapably bound, break asunder the bonds of mine evil deeds, and by thy supplications propitiate God, O holy Nicholas.",
        "Night and day we all call thee our helper, O holy Nicholas; bear thou our prayers unto the Lord, ever preserving us."
      ],
      theotokion: "O all-pure one, thou tongs which received the burning divine Coal in thy womb without in any wise being consumed: burn up our transgressions."
    },
    4: {
      irmos: "O Christ God Who, without leaving the bosom of the Father, didst descend to earth: I have heard the mystery of Thy dispensation, and have glorified Thee, Who alone lovest mankind.",
      troparia: [
        "The Son Who is equally enthroned with the Father, and Who became incarnate as a man on earth, chose you as disciples, to proclaim His divinity to all nations.",
        "The Son Who is equally enthroned with the Father, and Who became incarnate as a man on earth, chose you as disciples, to proclaim His divinity to all nations.",
        "I have been wounded in heart, wretch that I am, having made myself subject to the authors of all the passions in the sickness of my mind. Wherefore, I pray: Heal me, O apostles, physicians of the infirm.",
        "Deliver us from the passions, O glorious apostles, from grievous misfortunes and tribulations, from all perils and most painful torments.",
        "With thy wisdom blackening the mind of Arius, which was benighted by heresy, thou didst enlighten those deceived by him, O Nicholas.",
        "Treat my many sores with thy God-pleasing prayers, O divinely blessed father Nicholas, and enlighten my heart.",
        "Having mortified the uprisings of the passions, O most blessed one, by thy supplications enliven me who am done to death by them, and make me new."
      ],
      theotokion: "Thou gavest birth in the flesh unto the Timeless One. Him do thou beseech, that He deliver from chronic evils us who hymn thee, O most immaculate one."
    },
    5: {
      irmos: "Rising at dawn unto Thee out of the night, I beseech Thee, O Lord my God: Grant me remission of my transgressions, and guide my steps to the light of Thy precepts, I pray.",
      troparia: [
        "O Lord my God, Who of old bestowed peace upon Thine apostles: By their supplications grant peace and forgiveness of transgressions unto all.",
        "O Lord my God, Who of old bestowed peace upon Thine apostles: By their supplications grant peace and forgiveness of transgressions unto all.",
        "O Lord my God, Who knowest the offenses of my soul and the uncorrected ways of my heart: Freely taking pity, save me through the entreaties of the apostles.",
        "O Lord my God, in Thy great goodness Thou didst save the thief and the sinful harlot. Through the supplications of Thine apostles take pity on me, the prodigal.",
        "My soul riseth at dawn unto Thee, O God, for Thou art light, and Thy precepts are healing for Thy servants, O Thou Who lovest mankind.",
        "The counsels of ignorant men, which are ever directed against us, do thou render ineffectual by thy supplications, O Nicholas.",
        "By thy supplications rend asunder the bonds of our evils, O most holy Nicholas, who hast bound the malice of the soul-corrupting serpent."
      ],
      theotokion: "O Mary Theotokos, Lady of all creation, utterly free my lowly heart from the enemy who shamelessly seeketh to gain dominion over my heart."
    },
    6: {
      irmos: "Sailing amid the tumult of the cares of life, I founder with the ship of sin and am cast to the soul-destroying beast; yet like Jonah I cry to Thee, O Christ: Lead me up from the deadly abyss!",
      troparia: [
        "As godly disciples of Wisdom Itself, the apostles showed the wisdom of the pagans to be foolishness and destroyed the malice of their sages; and with the light of piety the all-wise ones illumined those lost in ignorance.",
        "As godly disciples of Wisdom Itself, the apostles showed the wisdom of the pagans to be foolishness and destroyed the malice of their sages; and with the light of piety the all-wise ones illumined those lost in ignorance.",
        "O Christ Who of old didst wash away the transgression of Peter with his tears, by his supplications wash away the countless offenses of my soul, in Thine immeasurable lovingkindness and great goodness.",
        "O Deliverer, Who of old took pity on the penitent Ninevites: In Thy lovingkindness, as is Thy wont, have mercy on me for the sake of Thine apostles, and let not the multitude of my transgressions bring torments upon me.",
        "Thou didst annul the unjust sentence of death and by thy mercy didst save those who were about to die, O father Nicholas, as the fervent helper of those who call upon thee.",
        "Ease thou the ailments of our souls, O most sacred pastor, and stop thou the mouths which open vainly against those who love thee.",
        "Thou didst destroy the bitter pasturage of the ungodliness of Arius with the medicine of thy words, O Nicholas, initiate of the sacred mysteries, and wast the confirmation of the faithful."
      ],
      theotokion: "O most immaculate one, heal thou my wretched soul, which hath been made incurably sick with the beguilements of life and many sinful circumstances."
    },
    7: {
      irmos: "Of old, the children showed the fiery furnace to pour forth dew, hymning the one God and saying: Supremely exalted and all-glorious God of our fathers!",
      troparia: [
        "The furnace of bitter ungodliness of old did ye quench with the dew of divine preaching, O glorious apostles, crying: Supremely exalted and all-glorious is the God of our fathers!",
        "Rescue me from grievous sin, from torment in hell and pain in Gehenna, O Christ, and save me, I pray Thee, through the entreaties of Thine apostles, O Word.",
        "O disciples of Christ, who drew men forth from the depths of ignorance with the net of the Word, save me who am tempest-tossed and drowning amid countless transgressions.",
        "As the beauty of the Church, O wise Nicholas, deliver me from all the ugliness of the ignominious passions, ever entreating the Benefactor of the whole world, O holy hierarch.",
        "Water the hearts of us all with the showers of thy prayers, O wise Nicholas, that we may offer fruits worthy of repentance, O holy hierarch.",
        "By thy supplications enlighten the minds of us who rise early with faith and glorify God, O thou who by thine entreaties didst raze the temple of Artemis."
      ],
      theotokion: "With faith doth every tongue glorify thee, who art the glory and boast of our race and the guide of those astray, O pure and all-blessed Theotokos."
    },
    8: {
      irmos: "The bush on Sinai which partook of fire without being consumed revealed God unto Moses, who was slow of speech and spake with difficulty; and the zeal of God showed forth the three children in the fire as invincible, who chanted: Hymn the Lord, all ye works of the Lord, and exalt Him supremely forever!",
      troparia: [
        "Coals set aflame by the noetic Fire, the disciples of Christ burned up all the falsehood of idolatry as if they were reeds, and have enlightened the faithful, who cry: All ye works of God, hymn the Lord, and exalt Him supremely for all ages.",
        "Enlighten now my soul which hath been darkened by sin, and my heart which through the passions hath been enshrouded in the gloom of dishonor, O apostles of Christ who partake of everlasting light, that I may unceasingly cry: All ye works of God, hymn the Lord and exalt Him supremely for all ages.",
        "By the supplications of Thy sacred disciples heal my soul, which hath been wounded by the venomous fangs of the prideful one, O Thou Who accepted wounds in the flesh; and save those who chant: All ye works of God, hymn the Lord, and exalt Him supremely for all ages.",
        "Thy body, redolent of myrrh, which lay in Myra, O most holy Nicholas, poureth forth myrrh upon those who have recourse thereto, and bringeth an end to the infirmities of men.",
        "The Creator and Lord of the world hath shown thee to be a helper of the world; wherefore, thou hast been found to be a ready deliverer for those who now call upon thee in their needs, O Nicholas.",
        "There is no-one who calleth upon thee amid tribulations who doth not quickly receive consolation; wherefore, we pray to thee: Ease all our sicknesses, O Nicholas."
      ],
      theotokion: "Every tongue hymneth and glorifieth thee, O Virgin Bride of God, for thou gavest birth to the all-hymned God. Him do thou unceasingly beseech, that our souls be saved."
    },
    9: {
      irmos: "O Mother who knewest not man, who gavest birth without experiencing corruption, and lent flesh to the Word Who hath fashioned all things, O Virgin Theotokos, thou receptacle of Him Whom nought can resist and dwelling-place of the Infinite: thee do we magnify.",
      troparia: [
        "The Word of God the Father revealed you as sons of the light and the day, for having loved Him, O divine apostles, ye were shown to be beacons for the whole world, dispellers of demons, guides for the lost and firm foundations for the Church.",
        "O ploughs of the Word, who bore His most easy yoke upon your necks, cultivate now my soul, which hath grown hard through the passions, and render it fertile with the seed of repentance.",
        "Through the divine Spirit is the earth sanctified by the divine relics of the right glorious apostles; and the heavenly Church of the firstborn is unceasingly made splendid by their spirits. For their sake, O Savior, have pity upon us all.",
        "Following the ways of the sacred apostles, thou didst inherit their thrones, as an honorable and holy hierarch, O right glorious Nicholas.",
        "O blessed one, the Creator hath shown thee forth as most great, as a lover of God and a helper in all things for those who fervently call upon thee throughout the world.",
        "With contrite heart we cry to thee, O father Nicholas: Be thou a comfort for us amid tribulations, ever driving griefs away from our souls.",
        "The severing of death lieth before thee as an axe lieth before a tree, O my soul. Wherefore, be not slothful but diligent in showing God the fruits of repentance."
      ],
      theotokion: "In thy holy arms thou bearest Him Who upholdeth all things. Him do thou beseech, O pure one, that we be saved unharmed by the malefactions of the alien one."
    }
  }
},
            5: {
  metadata: {
    day:             "Friday",
    theme:           "The Holy Cross and the Theotokos",
    canons:          ["Canon to the precious and life-creating Cross of the Lord, the acrostic whereof is 'On the Tree Christ set at nought the ancient bane', the composition of Joseph", "Canon of the all-holy Theotokos, the composition of Joseph"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross troparia then Martyrica then Canon of the Theotokos troparia per ode, in source order; where source marks Twice the troparion is spelled out twice in the array; theotokion: final theotokion of the full ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. IV (Tones VII & VIII), St. John of Kronstadt Press",
    pages:           "58–63",
    verified:        true
  },
  odes: {
    1: {
      irmos: "To God Who shook Pharaoh off into the Red Sea let us chant a hymn of victory, for He hath been glorified.",
      troparia: [
        "Uplifted upon the Cross, Christ drew all men to Himself, and cast down the enemy who had laid all low.",
        "From Thy life-bearing side Thou didst pour forth water upon my life, O Master, and as mortal didst slay the enemy.",
        "Bear ye earnest supplication to Christ for us, O passion-bearers, that we all may be delivered from the dread judgment.",
        "O all-wise martyrs, who humbled yourselves for Christ's sake: Cast down the prideful foe with grace divine.",
        "Beholding on the Cross Him Who had shone forth from thee in His all-great lovingkindness, O Mistress, thou didst weep, glorifying Him.",
        "In giving birth to God in the flesh, O all-pure Mistress, thou didst restore our first father Adam, who had fallen into the corruption of disobedience."
      ],
      theotokion: "Beholding on the Cross Him Who had shone forth from thee in His all-great lovingkindness, O Mistress, thou didst weep, glorifying Him."
    },
    3: {
      irmos: "My heart hath been established in the Lord; my horn hath been exalted in my God; my mouth hath been enlarged over the enemy; and I have found gladness in Thy salvation.",
      troparia: [
        "O Thou Who dost breathe life into me, and art dispassionate in essence, how dost Thou endure suffering? How diest Thou upon the Tree? Great is Thy mercy and long-suffering, O Savior!",
        "Thou wast unjustly uplifted on the Cross between two thieves, O Word, and didst justify him who by faith acknowledged Thee as the Author of all creation Who suffered of His own will.",
        "Enduring the convulsions of their flesh, the severing of their hands and feet, and all their members, the passion-bearers were vouchsafed glory, and pray for us.",
        "Made radiant in God by multifarious torments, ye have now inherited great glory, O wise ones, ever praying for our souls.",
        "By thy maternal supplications grant release from our debts, O pure Virgin who gavest birth to God the Word Who was nailed as a man to the Cross.",
        "In the image of the most holy tabernacle did God foretell thee to the law-giver on the mountain; for thou becamest the habitation of Him Who sanctifieth all.",
        "O Virgin, we have all understood thee to be the holy ground which without seed put forth for us Jesus Christ, the comely Grain Who feedeth those who bless thee with faith and love.",
        "The ways of God Most High were seen in thee, O Virgin, when He ineffably became incarnate; for thou wast the Mother of Him Who reigneth over all."
      ],
      theotokion: "Pondering thy divine birthgiving, O Virgin, enriched by thine aid, I cry out: Holy art Thou, O Lord, Who saveth our souls!"
    },
    4: {
      irmos: "I heard report of Thee and was afraid; I understood Thy works and was filled with awe, O Lord.",
      troparia: [
        "Thou wast uplifted upon the Cross like a most comely cluster of grapes, O Master Who lovest mankind, and didst exude the wine of gladness.",
        "Willingly accepting sufferings in Thy flesh, O Master, Thou didst truly calm the greatly painful passions of men.",
        "Shot through with arrows, the passion-bearers wounded the adversary and showed themselves to be physicians of our souls.",
        "The passion-bearers arrayed themselves against the tyrants and, vanquishing them, were crowned with crowns of victory.",
        "O Virgin, without seed thou gavest birth to the Word Who in His goodness destroyed corruption on the Cross.",
        "O Mother and ewe-lamb, beholding the Lamb Who is slaughtered of His own will going to His Passion, thou sheddest fountains of tears, saying: 'What is this sacred thing, O my Child? How dost Thou die, intending to bring life to those who have died?'"
      ],
      theotokion: "Make entreaty for us to Him Who became incarnate of thee, O Theotokos, that we who glorify His sufferings may find help in time of peril."
    },
    5: {
      irmos: "My soul riseth at dawn unto Thee, O God, for Thou art light, and Thy precepts are healing for Thy servants, O Thou Who lovest mankind.",
      troparia: [
        "Uplifted upon the Tree in the flesh, O Master, Thou didst draw all creation out of the pit of evils unto the understanding of Thee, O Thou Who lovest mankind.",
        "Iniquitous men asked to crucify Thee at the place of the skull, O Jesus, Who dost crush the pernicious head of the serpent.",
        "Ye halted the flow of ungodliness with your divine blood, O martyrs, and drowned the tyrant Pharaoh therein.",
        "Their fingernails pitilessly torn away, the passion-bearers rent vain-minded hearts asunder with their rebuke, and have become victors.",
        "God sanctified thy womb and dwelt therein, O holy and pure one; and uplifted upon the Cross, He raised up creation with Himself.",
        "Loving thy godly, comely, most sweet and goodly beauty, O Virgin Lady, the Master made His abode within thee.",
        "O Maiden, most holy and splendid portal of grace, who hast illumined the whole world with thy most radiant light: Enlighten those who hymn thee.",
        "Let those who confess thee to be the Theotokos receive through thy light the kingdom and food which pass not away, O Mother, Virgin and Theotokos."
      ],
      theotokion: "Thou wast shown to be the temple of the Omnipotent One Who seeth all things; for, finding thy womb to be more honorable than the heavens, He dwelt therein, O most pure Theotokos."
    },
    6: {
      irmos: "Jonah cried out from the belly of hades: Lead up my life from corruption! And we cry out to Thee: O almighty Savior, have mercy on us!",
      troparia: [
        "Manifesting Thyself in the lovingkindness of Thy mercy, O Physician of the infirm, by Thy Cross and sufferings Thou didst heal infirm human nature.",
        "By the tree did Adam bring condemnation upon himself of old; but now he hath been justified by the tree of the Cross, gaining access to paradise and receiving delight.",
        "We hymn Thee Who wast crucified in the flesh; we glorify Thee Who wast crowned with thorns and hast crowned men with glory, O all-good King.",
        "Having rejected the pernicious harm of the madness of idolatry, the athletes underwent tortures; and having died with Christ, they now reign.",
        "Neither persecution, nor starvation, nor nakedness, nor tribulation, nor death could in anywise separate the godly passion-bearers from the love of Christ.",
        "Thou didst glorify Him Who became incarnate of thee, and didst weep for Him Who was lifted up upon the Cross, as thou didst gaze upon Him, O Virgin Mother, holy and most immaculate.",
        "Loving thy godly, comely, most sweet and goodly beauty, O Virgin Lady, the Master made His abode within thee.",
        "O Maiden, most holy and splendid portal of grace, who hast illumined the whole world with thy most radiant light: Enlighten those who hymn thee."
      ],
      theotokion: "God sanctified thy womb and dwelt therein, O holy and pure one; and uplifted upon the Cross, He raised up creation with Himself."
    },
    7: {
      irmos: "Of old, the children showed the fiery furnace to pour forth dew, hymning the one God and saying: Supremely exalted and all-glorious God of our fathers!",
      troparia: [
        "The life of our first parents, devoid of pain, did I find when thou wast suspended upon the Cross and died of Thine own will, and slew the serpent, O greatly merciful Jesus Christ.",
        "We have all been delivered from the curse of the law; for the Bestower of the law was lifted up upon the Cross, pouring forth ever-flowing blessing, grace, mercy, and the abolition of corruption.",
        "Approaching tortures with willing haste, the martyrs voluntarily emulated Him Who suffered; and, crowned by Him, they now join chorus with the angels.",
        "Giving your bodies over to divers torments, O all-praised martyrs, ye drowned the incorporeal foe in the streams of your blood, and pour forth fountains of healing.",
        "Of old thine Offspring saved those who were in the fiery furnace; and now He hath saved us who cry out at His coming which transcendeth recounting: Blessed art Thou, O God of our fathers!",
        "David thine ancestor, O all-pure one, hymning thee, calleth thee the ark of divine holiness, which supernaturally contained God Who sitteth in the bosom of the Father. O ye faithful, let us magnify Him without ceasing.",
        "Thou art truly more exalted than all creation, O Maiden, for thou didst give birth bodily to the Creator of all for us; wherefore, as the Mother of the one Master, with authority thou dost carry the victory against all enemies."
      ],
      theotokion: "O Theotokos, upon the world thou didst shine forth Christ, the Light Who existeth from before the sun, and Who delivereth from darkness and with divine knowledge enlighteneth all who cry out: Blessed art Thou, O Lord God of our fathers!"
    },
    8: {
      irmos: "The only unoriginate King of glory, whom the hosts of heaven bless, and before Whom the ranks of angels tremble, do ye hymn, O ye priests, and exalt supremely, O ye people!",
      troparia: [
        "The tree of understanding rendered me mortal; but, having died upon the Tree Thou didst enliven me, O my Christ, and enlighten me to chant: Hymn the Lord, O ye priests, and exalt Him supremely for all ages.",
        "O King, the law-breaking assembly crowned Thee with thorns, Who uprootest the thorns of first-created Adam's disobedience; and they suspended Thee upon the Cross, Who hast delivered all from the abyss of deception.",
        "Upon the Tree mindless men stretched Thee out, Who spread out the heavens with understanding, O Savior, Who healest our sufferings by Thy suffering, and causeth our pain to cease through the pain caused in Thy hands by the nails.",
        "The relics of the martyrs emit the sweet fragrance of miracles for those who approach with undoubting heart, and they ever dispel the fœtor of the passions, and in God impart health unto all.",
        "The ranks of the saints pray to the Master, Who issued forth from thy womb, and on the Cross showed them the path of suffering, O pure one; and they glorify thee as the Queen of all.",
        "With the light of thy birthgiving thou didst strangely enlighten the whole world, O Theotokos; for in thine arms thou dost bear Him Who is truly God, Who enlighteneth the faithful, who ever cry: O all ye works of the Lord, hymn the Lord and exalt Him supremely for all ages!",
        "O pure one, we piously hymn thy womb, which ineffably contained the incarnate God, Who hath given the enlightenment of the knowledge of God unto all the faithful, who ever cry: O all ye works of the Lord, hymn the Lord and exalt Him supremely for all ages!",
        "With the splendors of thy light thou hast rendered those who hymn thee luminous, O pure Theotokos, bearer of the Light; for thou wast shown to be the habitation of the Light, illumining with light those who cry: O all ye works of the Lord, hymn the Lord and exalt Him supremely for all ages!"
      ],
      theotokion: "Thy pure and most unblemished state hath purified the vile and abominable state of the whole world, O Virgin; and thou becamest the cause of our reconciliation with God. Wherefore, O all-pure Virgin, all of us, His works, bless and exalt thee supremely for all ages."
    },
    9: {
      irmos: "O Mother of God and Virgin, thou gavest birth yet remainest a virgin still, and this was not a work of nature, but of the condescension of God; wherefore, we ever magnify thee as her who hath been vouchsafed divine wonders.",
      troparia: [
        "When they saw Thee uplifted upon the Cross, O Jesus, almighty King of ages, the sun was darkened, the earth quaked, and the splendor of the veil of the temple was rent asunder.",
        "The iniquitous ran Thy hands and feet through with nails, pierced Thy life-bearing side with a spear, and gave Thee gall and vinegar to drink, O my Christ, Thou true God and delight of all.",
        "They who were broken by all manner of tortures, broke asunder the nets of the author of evil; and having been crowned with victory, the valiant athletes are called blessed.",
        "Through the deposit of their relics the passion-bearers sanctified the whole earth and, cast into the midst of the fire and mystically consumed, they set at nought the vile stench of the sacrifices of the idols.",
        "Most perfect humanity was received from thee, O all-pure Maiden, when the Word united Himself to animate flesh and a soul adorned with discourse; wherefore, all of us, the faithful, magnify thee.",
        "Let the foolishness of the rhetors keep silence, but let the clarion of the apostles sound forth, praising thee, O Virgin, with cries of truth, and declaring thee the true Theotokos.",
        "Because of thee mercy was shown to mankind, which was hypostatically united to the true Word, O Virgin, and by God's gift became divine; wherefore, we all ever magnify thee."
      ],
      theotokion: "O blessed one, who art holier than the cherubim, and gavest birth in the flesh unto the Word of God, Who was uplifted upon the Cross of His own will: Earnestly pray to Him in behalf of us all."
    }
  }
},
            6: {
  metadata: {
    day:             "Saturday",
    theme:           "All Saints and the Departed",
    canons:          ["Canon of the holy martyrs, hierarchs, the venerable and the departed, the acrostic whereof is 'With choirs I, Joseph, hymn the pastors and martyrs'", "Canon of the departed, the acrostic whereof is 'The seventh rule, being the same form', the composition of Theophanes"],
    flatteningOrder: "Canon of the martyrs irmos governs; troparia: Canon of the martyrs/hierarchs/venerable/departed troparia then Canon of the departed troparia per ode, in source order; where source marks Twice the troparion is spelled out twice in the array; theotokion: final theotokion of the full ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. IV (Tones VII & VIII), St. John of Kronstadt Press",
    pages:           "66–72",
    verified:        true
  },
  odes: {
    1: {
      irmos: "In Egypt, Moses led Israel forth with the help of God. To Him alone let us sing, for He hath been glorified!",
      troparia: [
        "The choir of true martyrs overcame all the deceptions of the enemy, and it danceth, rejoicing before the face of Him Who created them.",
        "The holy hierarchs of Christ, and all the venerable who struggled in asceticism, have through grace been vouchsafed everlasting food.",
        "Through the supplications of the prophets and the venerable, and of the sacred women, deliver us, O Christ, from all wrath, and save our souls.",
        "Resplendent in piety, O martyrs, ye offered yourselves unto Christ as comeliness adorned with all forms of the virtues and a divine offering splendid in divers beauties.",
        "Grant rest, O Lord, to the souls of Thy departed servants.",
        "Vouchsafe that Thy departed servants may receive a ray of the unapproachable effulgence of the threefold Sun, O greatly merciful Lord, from whence all pain, grief and sighing are fled."
      ],
      theotokion: "O all-pure Mother who gavest birth to the all-holy Word of God: Sanctify all who glorify thee with love."
    },
    3: {
      irmos: "O Thou Who lovest mankind, Who established the heavens and made firm the foundation of the earth upon many waters: Establish Thou my mind in Thy will.",
      troparia: [
        "Crushed by stones and cast into pits, ye broke all the power of the deceiver, and remained unbroken in mind, O martyrs.",
        "Illumining the faithful with the radiance of divine teachings and beams of the virtues, O all-wise hierarchs, ye dispelled all the gloom of heresies.",
        "Having died to the world, Thy righteous ones, O Word, have truly inherited the life of heaven. For their sake, O Compassionate One, have pity on us all.",
        "We all pray to the good Master for those who have departed in faith and hope, that He have mercy on them at the hour of judgment.",
        "Without leaving the bosom of the Father, the Word showed Himself to be a babe held, O all-pure one, in Thy bosom, He Who is without beginning receiving a beginning from thee."
      ],
      theotokion: "Without leaving the bosom of the Father, the Word showed Himself to be a babe held, O all-pure one, in Thy bosom, He Who is without beginning receiving a beginning from thee."
    },
    4: {
      irmos: "Assuring us of Thine advent in the flesh, O Christ, the Prophet Habbakuk cried aloud: Glory to Thy power, O Lord!",
      troparia: [
        "Strengthened by love for the Lord, the martyrs rendered the power of the enemy impotent; wherefore, they are called blessed.",
        "As sheep and lambs of the Shepherd, O blessed hierarchs, ye headed the flock of the Word with divine grace.",
        "As stars of great radiance, O our venerable fathers, ye illumined the fullness of the faithful with the brilliance of virtue.",
        "The one company of mighty women and the assembly of the holy prophets have received heavenly goodness.",
        "Entreat the Son to Whom thou gavest birth, O most hymned one, that thy servants may be delivered from all temptations and tribulations.",
        "Grant rest, O Lord, to the souls of Thy departed servants.",
        "Patiently did the martyrs endure the pangs of suffering, O Christ, and they were crowned with wreaths of Thy righteousness, and glorify Thy power."
      ],
      theotokion: "Entreat the Son to Whom thou gavest birth, O most hymned one, that thy servants may be delivered from all temptations and tribulations."
    },
    5: {
      irmos: "My soul riseth at dawn unto Thee, O God, for Thou art light, and Thy precepts are healing for Thy servants, O Thou Who lovest mankind.",
      troparia: [
        "Armed with piety, O mighty athletes, by your divine wounds ye heal the wounds and passions of all.",
        "Ye received the authority to bind and loose on earth, O holy hierarchs of Christ; wherefore, ye have broken the unbreakable bonds of our sins.",
        "The choirs of ascetics, prophets, the righteous and the honorable women, having united themselves to God with a pure mind, dance in constant chorus, rejoicing.",
        "In that Thou alone art greatly merciful, O Christ Who lovest mankind, make those who have departed this life in faith inhabitants of paradise.",
        "Having shown thyself to be an indestructible chamber for God, O most holy Virgin, entreat Him to make me an inhabitant of His noetic bridal-chamber."
      ],
      theotokion: "Having shown thyself to be an indestructible chamber for God, O most holy Virgin, entreat Him to make me an inhabitant of His noetic bridal-chamber."
    },
    6: {
      irmos: "Jonah cried out from the belly of hades: Lead up my life from corruption! And we cry out to Thee: O almighty Savior, have mercy on us!",
      troparia: [
        "Uplifted to God in your sufferings, O most glorious soldiers, ye cast down the uprisings of the enemy and have become citizens of heaven.",
        "Dispelling the winter of heresies, the true hierarchs of Christ led a multitude of the pious into the springtime of Truth.",
        "By Thy might were the multitude of the venerable, the prophets and holy women justified, O Christ; and they delight in never-waning light.",
        "Thou hast taken to Thyself Thy servants from ages past, O Compassionate One. Vouchsafe that they may share in everlasting gladness and true life.",
        "Sanctify thy servants, O most holy Virgin Who gavest birth in the flesh to the all-holy Word, Whom every creature hymneth."
      ],
      theotokion: "Sanctify thy servants, O most holy Virgin Who gavest birth in the flesh to the all-holy Word, Whom every creature hymneth."
    },
    7: {
      irmos: "In the Chaldaean furnace, the children of Abraham danced with the Angel, saying: Blessed art Thou, O God of our fathers!",
      troparia: [
        "With the flow of their blood the passion-bearers quenched the flame of ungodliness, chanting: O God of our fathers, blessed art Thou!",
        "We praise the hierarchs, who were enlighteners of the world, chanting: O God of our fathers, blessed art Thou!",
        "With hymns let the holy assembly of the prophets and venerable be honored, chanting: O God of our fathers, blessed art Thou!",
        "From Gehenna deliver Thy faithful servants whom Thou hast taken to Thyself, O compassionate Christ, and who cry out: O God of our fathers, blessed art Thou!",
        "We hymn the Theotokos as more honorable than the angels, crying: O God of our fathers, blessed art Thou!"
      ],
      theotokion: "We hymn the Theotokos as more honorable than the angels, crying: O God of our fathers, blessed art Thou!"
    },
    8: {
      irmos: "Emulating the children who in the furnace received the dew of the Spirit, let us say with faith: Bless the Lord, O ye works of the Lord!",
      troparia: [
        "Ye demolished the temples of the idols, O most glorious passion-bearers, and made yourselves temples of the Spirit, bravely finishing your race.",
        "Ye were shown to be like fragrant flowers, O holy hierarchs, gladdening the souls of the faithful with the understanding of piety; wherefore, ye are called blessed, as is meet.",
        "Traversing the whole earth, O venerable ones, ye became divine sojourners and prophets, observing heavenly delight and ever-abiding glory.",
        "O Word, Lord of the living and the dead, reckon among the choirs of all the saved Thy servants who have departed with faith, for Thou alone lovest mankind.",
        "The company of all the women who with fasting and asceticism have sought the Lord, offereth unceasing entreaty before thy divine face, O all-pure one."
      ],
      theotokion: "The company of all the women who with fasting and asceticism have sought the Lord, offereth unceasing entreaty before thy divine face, O all-pure one."
    },
    9: {
      irmos: "O ye faithful, with hymns let us magnify the Theotokos, who became a mother in manner transcending nature, is a virgin by nature, and is blessed among women!",
      troparia: [
        "Through the supplications of the sacred martyrs, prophets and the righteous who lived virtuously in ages past, have mercy on our souls, O Christ.",
        "Shown to be ministers of the Master, O initiates of the sacred mysteries, ye have joined yourselves to the heavenly servants. With them offer entreaties for us.",
        "With the women who finished the good race let us honor the holy choirs of the ascetics, that through their supplications we may receive sanctity.",
        "Vouchsafe that the departed who served Thee in Orthodox manner may partake of the glory which the choirs of all the saints were vouchsafed, O Christ.",
        "Sin-loving, I tremble before the dread judgment and the inescapable eye of thy Son, having committed many sins on earth. Wherefore, I cry to thee: O most merciful Mistress, help me! O pure one, rescue me uncondemned from my need at that time!"
      ],
      theotokion: "Sin-loving, I tremble before the dread judgment and the inescapable eye of thy Son, having committed many sins on earth. Wherefore, I cry to thee: O most merciful Mistress, help me! O pure one, rescue me uncondemned from my need at that time!"
    }
  }
}
        },

        8: {
            1: {
  metadata: {
    day:             "Monday",
    theme:           "Repentance and the Holy Angels",
    canons:          ["Canon of repentance to our Lord Jesus Christ and His holy martyrs, the composition of Joseph", "Another canon, of the holy incorporeal angels, the composition of Theophanes"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance troparia then Martyrica then Canon of the Angels troparia per ode, in source order; where source marks Twice the troparion is spelled out twice in the array; theotokion: final theotokion of the full ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. IV (Tones VII & VIII), St. John of Kronstadt Press",
    pages:           "96–100",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Having traversed the water as though it were dry land, and escaped the evil of Egypt, the Israelite cried aloud: Let us chant unto our Deliverer and God!",
      troparia: [
        "Deliver me from Gehenna, which I have earned by mine unseemly deeds, O Deliverer, and in my mind enkindle the divine fire of Thy love.",
        "I have made myself subject to the passions. I have become benighted, and shown myself to be irrational, though I was honored with the ability to speak. O Lord, by the judgments which Thou knowest grant that my soul may arise, and save me!",
        "Afflicted with wounds, your bodies showed forth your upright and unbreakable character and your love for the Creator, O martyrs most lauded and crowned.",
        "The rivers of blood which flowed from the bodies of Thy holy and glorious athletes drowned the thorns of the madness of idolatry by Thy power, O Compassionate One.",
        "As the chief leaders of the holy angels, radiantly delighting in the vision of God, in our behalf entreat the Savior, the Bestower of good, O archangels.",
        "As the chief leaders of the holy angels, radiantly delighting in the vision of God, in our behalf entreat the Savior, the Bestower of good, O archangels.",
        "Beset by violent passions, we, the faithful, now flee to you as our intercessors, O divine archangels. Earnestly entreat now the Master in our behalf."
      ],
      theotokion: "Be thou a refuge, haven, bulwark and intercessor for me, O Virgin Mother of God, who gavest birth in the flesh unto God, the most compassionate Deliverer."
    },
    3: {
      irmos: "O Lord, Fashioner of the vault of heaven and Creator of the Church: establish me in Thy love, O summit of desire, confirmation of the faithful, Who alone lovest mankind.",
      troparia: [
        "With what eyes shall I, who have kept not one of Thy commandments, gaze upon Thee, O Christ my Savior? How shall I stand before Thine unbearable throne to give answer for my countless evils?",
        "Stretching forth the hands of Thy compassions, accept me as of old Thou didst the prodigal who had likewise enslaved himself to the dishonorable passions, for I too have departed far from Thee, O all-good Jesus Who lovest mankind.",
        "Having established yourselves upon the rock of the understanding of God, O martyrs and passion-bearers of Christ, with the sword of the Faith ye cut off the thorns of ignorance at the root, and produced the fruits of suffering.",
        "Let the martyrs be praised: the unshakable pillars of the true Faith, the all-splendid ornaments of the Church, the most sacred lambs of Christ, who were slaughtered of their own will.",
        "Adorned with the multifarious gifts of the angelic rank, O supreme commanders, in that ye are leaders of the hosts, by your intercessions keep the Churches of Christ steadfast.",
        "Adorned with the multifarious gifts of the angelic rank, O supreme commanders, in that ye are leaders of the hosts, by your intercessions keep the Churches of Christ steadfast.",
        "Crowned now with the beauties of Orthodoxy and wielding the sword of God's good pleasure, O divine archangels, deliver the fullness of the faithful from perils, in that ye are right glorious divine intercessors."
      ],
      theotokion: "I have acquired thee as a mediator amid perils, O all-holy one; and after God I have thee as my tireless intercessor. May I find thee delivering me from all condemnation on the day of judgment, O all-pure one."
    },
    4: {
      irmos: "O Word, with divine vision the prophet perceived Thee Who wast to become incarnate of the Theotokos alone, the mountain overshadowed; and with fear he glorified Thy power.",
      troparia: [
        "Great is the struggle when the soul is parted from the body; and dreadful the trembling when the Judge taketh His seat and sinful men are condemned! Woe is me! What shall I do when I am condemned?",
        "Possessed of a heart full of defilements and a burden of sin which is almost unbearable, I flee to Thy compassions, O Master. Despise me not, but take pity on me, I pray!",
        "Your death was shown to be precious in the sight of God, O valiant passion-bearers; for though afflicted with myriads of pangs and wounds, ye did not deny Him.",
        "The enemy was wounded by the wounds of the martyrs, and his vaunted pride hath fallen. Magnified is He Who bestowed crowns upon them, glorified with hymns divine.",
        "Standing round about God, and illumined with the rays emitted by Him, O supreme commanders, preserve ye your flock.",
        "Standing round about God, and illumined with the rays emitted by Him, O supreme commanders, preserve ye your flock.",
        "As mediators of deliverance for all, pray ye to our Master and God, that He grant us deliverance."
      ],
      theotokion: "With faith I entreat thee, O Theotokos, the pure receptacle of the Master: Cleanse me of every defilement, and show me to be the abode of the all-accomplishing divine Spirit."
    },
    5: {
      irmos: "Enlighten us with Thy commandments, O Lord, and with Thine upraised arm grant us Thy peace, O Thou Who lovest mankind.",
      troparia: [
        "With mine evil ways I have embittered Thee, O Lord, committing unseemly acts; but have pity on me who repent, and save me.",
        "Possessed of a mind which doth not recoil from evils, I have no sense of my foolishness. Resolve my perplexity, O Jesus, and save me.",
        "The Bestower of light set you like stones brilliant in the knowledge of God and dispelling the darkness of deception, O divine martyrs.",
        "Ye set the laws of God against the wicked laws, and preaching God, ye earnestly willed to be slain for His sake.",
        "O beholders of God, who have been vouchsafed to stand unwaveringly before the dread throne, ye now delight in the effulgence of the Holy Trinity. Pray ye, O archangels, that those who have recourse to you may be delivered from perils and sufferings.",
        "O beholders of God, who have been vouchsafed to stand unwaveringly before the dread throne, ye now delight in the effulgence of the Holy Trinity. Pray ye, O archangels, that those who have recourse to you may be delivered from perils and sufferings.",
        "O archangels who behold God, most glorious Michael and Gabriel, pray ye, that those who hymn you in song may receive the hospitality of the Master, everlasting joy and divine splendor."
      ],
      theotokion: "Mortify the movements of my flesh, O pure Maiden, who by thy birthgiving slew the living sin of our first parent."
    },
    6: {
      irmos: "Thou didst cause Jonah to sojourn alone within the sea monster, O Lord. Save me, who am caught in the nets of the enemy, as thou didst save him from corruption.",
      troparia: [
        "O Christ, Bestower of light, shine forth the solar light of repentance upon me who am in the darkness of transgressions, that I may hymn Thy goodness.",
        "I ever tremble before Thy dread judgment-seat, yet, ever in thrall to wicked habits, I do not put away mine evil deeds. Set me aright, O Christ, that I may hymn Thy goodness.",
        "The choirs of the martyrs of Christ suffered, vanquished the hordes of the demons, and united themselves in joy to the angelic choirs. By their supplications, O Lord, save Thou our souls.",
        "Thou didst show Thy martyrs to be mighty in Thy power, O Lord, and they cast down all the power of him who of old caused man to fall. By their supplications, O Lord, save Thou our souls.",
        "O most pure one, we call thee the mystical myrrh, who gavest birth in the flesh unto God Who poureth forth gifts of sweet fragrance."
      ],
      theotokion: "That I may ever glorify thee with cries of thanksgiving, O most immaculate one, drive the darkness from my soul and by the light of repentance release me from dark offenses."
    },
    7: {
      irmos: "Once, in Babylon, the youths who had come forth from Judaea trod down the flame of the furnace with their faith in the Trinity, chanting: O God of our fathers, blessed art Thou!",
      troparia: [
        "Grant me sighs, O Christ, as once Thou didst to the publican, washing away the filth of mine evils as Thou didst for the harlot; and have pity on me, O Compassionate One. O God of our fathers, blessed art Thou!",
        "With the oil of sincere repentance heal me who have fallen among soul-destroying thieves and am grievously wounded, O Savior, and with pity move me to chant unto Thee: O God of our fathers, blessed art Thou!",
        "Ye died to the world, O valiant passion-bearers, and in nowise denied the life-bearing Christ, Who underwent death, but as ye suffered, ye chanted: O God of our fathers, blessed art Thou!",
        "Confessing the one nature of the Trinity in three Hypostases, O wise passion-bearers, ye set at nought the falsehood of idolatrous polytheism, chanting: O God of our fathers, blessed art Thou!",
        "The Benefactor of all bestowed upon you many-faceted grace, O divine supreme commanders. Save ye now the Church which singeth to Him: O God of our fathers, blessed art Thou!",
        "The Benefactor of all bestowed upon you many-faceted grace, O divine supreme commanders. Save ye now the Church which singeth to Him: O God of our fathers, blessed art Thou!",
        "Strengthened by the power of Him Who seeth all things, ye manifestly watch over all the ends of the earth and save all who chant with faith: O God of our fathers, blessed art Thou!"
      ],
      theotokion: "God, the Word of God, making His abode in thy womb, O pure Virgin Mother, revealeth thee as the helper of all the oppressed, who cry: O God of our fathers, blessed art Thou!"
    },
    8: {
      irmos: "The Lord Who was glorified on the holy mountain, and by the fire in the bush revealed to Moses the mystery of the Ever-virgin, hymn ye and exalt Him supremely for all ages!",
      troparia: [
        "O Savior, despise me not who am led astray by the love of carnal pleasures, who have foolishly estranged myself from Thee, O Word, and likened myself to all the beasts; and converting me before the end, save me.",
        "In nowise do I leave off sinning, nor do I ever turn from my ways, but, wretch that I am, I cry: I have sinned against Thee, O Lord! Have mercy on my hardened soul, O Compassionate One!",
        "Baptized in the streams of your blood, O valiant passion-bearers of the Lord, ye were not defiled by further pollutions; and, crowned, ye join chorus unceasingly with the angels.",
        "Enlivened by the hope of things to come, the valiant martyrs of piety endured the cruelty of tortures; and having died, they stand forever before the throne of the Master.",
        "Having thee as a haven of salvation, O Virgin Theotokos, we flee the tribulations and tumults of life, crying out to thy Son: O God of our fathers, blessed art Thou!"
      ],
      theotokion: "Thou art the confirmation of those who stand and the setting aright of those who have fallen, O Virgin; wherefore, raise me up who have fallen, that I may glorify thee, who art blessed and full of joy."
    },
    9: {
      irmos: "Every ear trembleth to hear of the ineffable condescension of God, for the Most High willingly came down even to the flesh, becoming man through the Virgin's womb. Wherefore, we, the faithful, magnify the all-pure Theotokos.",
      troparia: [
        "As Thou didst cleanse the harlot of old, who fell down before Thee in tears, O Savior, and as Thou didst justify the publican who merely sighed, O Word, and as Thou didst accept Manasseh and hadst mercy on the penitent David, O Thou Who lovest mankind, so do Thou accept and save me.",
        "Sigh and shed tears, O my soul; abandon thy former offenses, and fall down before Him Who clearly knoweth thy hidden deeds, and cry out with fervor: I have sinned against Thee, O Lord! Freely take pity on me, O greatly Merciful One, in Thy great compassion.",
        "The divinely illumined passion-bearers, who suffered patiently on earth, have now received the sure inheritance of the kingdom, and, rejoicing, they partake of the delight of paradise. By their supplications, O Christ God, grant us a share in Thy glory.",
        "Ye were shown to be beacons shining with the light of the never-waning East, O all-wise ones; and ye destroyed the night of ungodliness, and with sacred rays have illumined all who magnify your splendid feast, O passion-bearers.",
        "Show now Thy Church to emulate in virtue the choirs of the incorporeal beings, guarding Thy flock with the angels, O Christ.",
        "Show now Thy Church to emulate in virtue the choirs of the incorporeal beings, guarding Thy flock with the angels, O Christ.",
        "Pray ye, O most glorious angelic helpers, that salvation be given by God to the souls who flee beneath your protection."
      ],
      theotokion: "O Mistress, portal of the Light, enlighten the eyes of my heart which the thick darkness of sin hath benighted; and send down upon me a ray of repentance, O pure one, and by thy mediation free me from everlasting fire."
    }
  }
},
            2: {
  metadata: {
    day:             "Tuesday",
    theme:           "Repentance and the Holy Forerunner",
    canons:          ["Canon of repentance to our Lord Jesus Christ and His holy martyrs, the composition of Joseph", "Another canon, of the holy & great Forerunner John"],
    flatteningOrder: "Canon of Repentance irmos governs; troparia: Canon of Repentance troparia then Martyrica then Canon of the Forerunner troparia per ode, in source order; where source marks Twice the troparion is spelled out twice in the array; theotokion: final theotokion of the full ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. IV (Tones VII & VIII), St. John of Kronstadt Press",
    pages:           "104–109",
    verified:        true
  },
  odes: {
    1: {
      irmos: "To Him Who crushed battles with His arm and led Israel across the Red Sea, let us chant, as to God our Deliverer, for gloriously hath He been glorified.",
      troparia: [
        "Fill my heart with compunction, O Christ, that with repentance I may enter Thy habitations, and may with confession pray to Thee Who dost release me from my debts.",
        "Loose me from the bonds of my countless evils, O Word, that in repentance I may walk in Thy righteous footsteps which lead me to the divine resting-place of eternal beauty.",
        "The great magnificence of Thy martyrs is exalted to the highest, O Christ; for suffering most gloriously, they were magnified by Thine all-great grace.",
        "By the sprinkling of the divine blood of the holy athletes the blood sacrificed to the enemy in pagan temples was stanched, and those on earth have been sanctified by the grace of the Spirit.",
        "O Forerunner and preacher of repentance, entreat the Savior and Lord that I may repent with all my soul, and that He enlighten the mind and heart of me who honor thee with love.",
        "As a most comely lamb of the desert, O Forerunner and martyr of Christ, by thy divine supplication to the life of repentance guide me who now abide in the desert of the passions.",
        "By thy mediation free me quickly from the sin which tormenteth me, I pray, O Forerunner, and liberate me from the raging tempest of the demons."
      ],
      theotokion: "O Mother of the Truth, save me who am cruelly bestormed and oft engulfed by the passions, and steer me to the right calm harbor of salvation."
    },
    3: {
      irmos: "My heart is established in the Lord; my horn is exalted in my God; my mouth is enlarged over mine enemies. I am glad in Thy salvation.",
      troparia: [
        "Having washed away the evil pollutions of my heart, O my Christ, in that Thou art good vouchsafe that I may appear blameless before Thee on the day of judgment.",
        "The apostate spirit was able through wickedness to slay me with the sting of sin, O Word; but do Thou Thyself, O Christ, heal me with the life-bearing herb of repentance.",
        "\"Let us stand courageously,\" the passion-bearers cried one to another, \"that no-one may desert the army. As an ally the Lord standeth before us who suffer with valiant mind.\"",
        "In hymns let us all honor the faithful martyrs of the Lord, the all-precious stones of the Church, the divine pillars of piety.",
        "Let fall upon me drops of repentance, O right glorious martyr and Forerunner of the Lord of all, who in the river baptized the Abyss of lovingkindness.",
        "Ever buffeted in mind by the perilous waves of life, I flee beneath thy protection, O Forerunner of the Savior. Make haste to help me, thy servant.",
        "In my prayers at night I call upon thee, the day-star of the world, O Forerunner blessed of God. Enlighten the senses of my heart."
      ],
      theotokion: "O Theotokos, thou righting of the fallen, from the pit of mine evils raise me up who have fallen, and set me firmly upon the rock of the commandments of God, O Mistress."
    },
    4: {
      irmos: "I heard report of Thee, O Lord, and was afraid; for by the ineffable Counsel of the Godhead, Thou, Who art God eternal, didst issue forth, incarnate, from the Virgin. Glory to Thy condescension, O Christ! Glory to Thy power!",
      troparia: [
        "The enemy deceiver beguiled me into sinfully tasting [of the fruit], O Good One, and exiled me far from Thee, and made me prey to his fangs. O only Savior, haste Thou to rescue me!",
        "O Lord, Thou Thyself knowest the hidden and secret things of me who have sinned greatly against Thee. By thy many compassions have pity, O Word of God, and as Thou art full of lovingkindness grant me a purifying time of repentance.",
        "Overwhelmed by tortures as with waves, O martyrs, ye were guided by the steering of Christ to the havens of the kingdom of heaven, and are truly adorned by Him with crowns of victory.",
        "Cultivating the ground of your hearts with piety, O martyrs, ye sowed upon it the seed of confession, and by grace manifestly reaped the comely Grain an hundredfold.",
        "Let fall upon me drops of repentance, O right glorious martyr and Forerunner of the Lord of all, who in the river baptized the Abyss of lovingkindness.",
        "Ever buffeted in mind by the perilous waves of life, I flee beneath thy protection, O Forerunner of the Savior. Make haste to help me, thy servant.",
        "In my prayers at night I call upon thee, the day-star of the world, O Forerunner blessed of God. Enlighten the senses of my heart."
      ],
      theotokion: "O all-pure one, who gavest birth to Him Who raised up our abased nature, having humbled me who live in arrogance of mind, save me."
    },
    5: {
      irmos: "O Christ God, Bestower of light, Who didst dispel the primeval darkness of the abyss: disperse the gloom of my soul, and grant me the light of Thy commandments, O Word, that, rising early, I may glorify Thee.",
      troparia: [
        "O Creator of all, Who purified the harlot and the lepers by Thy command, cleanse Thou my lowly soul of defiling sin, and make it beautiful with garments of light, I pray, O Master.",
        "O Christ God, Who hast released me from the bonds of my many transgressions, guide me, that without hindrance I may walk Thy paths, that, parted from the flesh and dwelling in the holy mansions, I may glorify Thee.",
        "Having woven for themselves robes of glory, and arrayed themselves beautifully therein, the martyrs dwell in joy in the kingdom on high, adorned with beautiful crowns of victory.",
        "O wise martyrs, ye right wisely traded fleeting things for those which are permanent; for, beset by the afflictions of divers tortures, rejoicing, ye attained unto the true expanse of the kingdom of heaven.",
        "As the luminary of the Sun of righteousness, O glorious Forerunner, enlighten me who am astray in the night of life.",
        "At the trial to come, when I must needs stand before the Lord, may I find thee to be an intercessor, O Forerunner, rescuing me from dread condemnation.",
        "O ever-hymned one, on the rock of the will of God establish me who am imperiled and buffeted by the temptations of the demons."
      ],
      theotokion: "In that thou art higher than all creation, O Ever-virgin Mother of God, show me to elude the snares of the enemy."
    },
    6: {
      irmos: "As Thou didst deliver the prophet from the uttermost abyss, O Christ God, in that Thou lovest mankind deliver me from my sins, and direct my life, I beseech Thee.",
      troparia: [
        "Accept me who repent, as once Thou didst the Ninevites who believed in the divine preaching of Thy prophet, O Christ, and guide Thou my life, I pray Thee.",
        "Drowning amid many transgressions, O Christ, I sigh like the publican, shed tears like the harlot, and like Peter cry out: Grant me a helping hand, and save me!",
        "As beacons of divine radiance, O martyrs, with the rays of your suffering ye ever illumine the earthly world and drive away the deep darkness of deception.",
        "Having found a most blessed end, O most holy martyrs, ye ever worship the blessed God, delighting in His effulgence.",
        "I weep for myself, who ever have a life uncorrected. O Forerunner, save and have pity on me who am perishing in my sins.",
        "In thy supplications and entreaties, O blessed one, may I find thee to be a helper strengthening my soul and illumining my mind.",
        "O Forerunner of the Savior, to the harbor of divine understanding steer me who am engulfed and put imperiled by the tempest of offenses."
      ],
      theotokion: "The jar containing manna once prefigured thee, O Theotokos; for thou didst bear the manna of understanding upon all who honor thee."
    },
    7: {
      irmos: "Blessed art Thou, O God of our fathers, Who by Thine Angel didst save the youths from the fire and transformed the thundering furnace into dew!",
      troparia: [
        "Conceived and born in iniquities, I have sinned more than all men, O Compassionate One. Grant me the time to obtain justification.",
        "Like the Pharisee of old I have foolishly exalted myself, and have sustained a grievous fall; and seeing me, the adversary rejoiceth. O Word of God, disdain me not!",
        "The council of the honored martyrs, the invincible army, the holy regiment, who were brave on earth, have been enrolled in the city of the heavens.",
        "Having willingly passed through the suffering which winneth immortality, O martyrs, ye pour forth a stream of healings which driveth away the sufferings of men.",
        "With the scythe of true repentance clear thou my whole heart, O all-wise John, making it fertile with the virtues.",
        "When I must needs stand before Thy dread throne, O Word, and the penalty for my acts will be assessed, what answer shall I find, wretch that I am? For the sake of Thy Baptist, O Lord my God, have pity on me then.",
        "As the voice of the Word, direct my cries unto God, O all-wise Baptist, and deliver me from the evil of the demons and the temptations of men, that I may call thee blessed, as is meet."
      ],
      theotokion: "In manner past cause thou gavest birth to the Cause of all, Who in the superabundance of His goodness became man. Wherefore, together we call thee blessed, O pure one."
    },
    8: {
      irmos: "O Thou Who coverest Thy chambers with waters and settest the sands as a bound for the sea: Thee doth the sun hymn; Thee doth the moon glorify; and unto Thee doth all creation offer a hymn forever, as to the Creator of all.",
      troparia: [
        "Thou hast defiled thy hands with all manner of malefactions, O my soul. How canst thou lift them up, conversing with God? And thy feet, which hasten to shameless deeds, thou hast rendered useless. Take care to walk with repentance the paths of salvation.",
        "I have never abode in Thy commandments, O good Lord, nor have I done Thy will for even a single day. What eyes can I raise to Thee Who rendereth just judgment and shalt send the guilty into the fire of Gehenna?",
        "Baptized in the streams of your blood, O valiant passion-bearers of the Lord, ye were not defiled by further pollutions; and, crowned, ye join chorus unceasingly with the angels.",
        "Enduring the severing of your hands and feet, ye transcended your lowly earthly bodies, as though it were others who were suffering, O holy ones; wherefore, ye have now been vouchsafed life on high forever.",
        "Nurture me with the immortal food of Christ's commandments, and give me the drink of life to consume, O prophet and Forerunner; and present me, saved, who flee under thy protection, to stand before God.",
        "Ease thou the burden of my soul and do battle against those who make war upon me, O Baptist of the Lord; and show me to be unscathed by their malice.",
        "Fleeing, thou didst withdraw and make thine abode in the trackless wilderness, O prophet; wherefore, I beseech thee: Quickly lay waste to the passions of my soul."
      ],
      theotokion: "Buffeted by the tempest of sin, I cry to thee, O pure Mistress: By thy mediation steer me to saving repentance and the most calm haven, that I, who am ever benighted by sloth, may behold the light of salvation."
    },
    9: {
      irmos: "Blessed be the Lord God of Israel, Who hath exalted the horn of salvation for us in the house of David His child, wherein the Dayspring from on high hath visited us, and directed us to the path of peace.",
      troparia: [
        "That, saved, I may magnify Thee with thanksgiving, O Christ, mercifully regard me, whose shoulders have received many stripes, and heal them, pouring forth wine and oil upon them — the knowledge of Thy lovingkindness, O Savior.",
        "As Thou didst deliver from murder and evils the good thief who cried out to Thee, and as Thou didst have compassion for the harlot who wept, have mercy upon me, the despairing, O Savior as Thou didst Thy great disciple Peter and David the prophet.",
        "Conforming to the passions of Him Who suffered for our sake, O passion-bearers, with Him ye now send up glory together, deified by divine communion, resplendent with rays that outshine the material sun, and enlightening the hearts of the faithful.",
        "The virtue of the holy athletes shone forth, and every city is truly enriched in faith, possessing them as treasures which cannot be stolen away, which abundantly emit the grace of all-glorious miracles. Let us hymn them as our fervent intercessors.",
        "O chosen ewe-lamb of the Word of God, entreat God Who became incarnate of thee, that at the dread hour He number me with His chosen sheep.",
        "Ease thou the burden of my soul and do battle against those who make war upon me, O Baptist of the Lord; and show me to be unscathed by their malice.",
        "Fleeing, thou didst withdraw and make thine abode in the trackless wilderness, O prophet; wherefore, I beseech thee: Quickly lay waste to the passions of my soul."
      ],
      theotokion: "O Virgin, thou art the vine which gave rise to the ripe Cluster, and now givest me the drink of compunction. Take away the drunkenness of mine evils."
    }
  }
},
            3: {
  metadata: {
    day:             "Wednesday",
    theme:           "The Holy Cross and the Theotokos",
    canons:          ["Canon of the precious & life-creating Cross, the acrostic whereof (excluding the Theotokia) is 'Grace be to God, Who was nailed to the Tree', the composition of Joseph", "Canon of the all-holy Theotokos, in Tone VIII"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross troparia then Martyrica then Canon of the Theotokos troparia per ode, in source order; where source marks Twice the troparion is spelled out twice in the array; theotokion: final theotokion of the full ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. IV (Tones VII & VIII), St. John of Kronstadt Press",
    pages:           "113–119",
    verified:        true
  },
  odes: {
    1: {
      irmos: "The staff of Moses, once working a wonder, striking the sea in the form of the Cross and dividing it, drowned the mounted tyrant Pharaoh, and saved Israel who fled on foot, chanting a hymn unto God.",
      troparia: [
        "O Word Who died on the Cross, Thou hast given life to me who was slain by the tree through pleasing food, and Thou hast adorned me with glory. I worship Thy dominion, glorifying Thy sufferings and infinite lovingkindness.",
        "When the uncultivated Grape hung upon the Tree, He exuded for us the wine of divine grace which gladdeneth men's hearts, wholly doing away with the drunkenness of deception, and washing sins away.",
        "Arrayed in wounds and adorned with the pangs of your sufferings, O great martyrs, ye stood with glory before the beneficent Master, rejoicing most gloriously, recognized as godlike.",
        "Manifestly strengthened by divine power, ye manfully cast down all the pernicious power of the mighty one; and beautifully invested with crowns of victory, ye stand before God, rejoicing.",
        "On thee, O Virgin, have I set my hope of salvation. Wash me clean of all the filth of sin and make me pure, that I may act and be well-pleasing to thy Son and God and His most holy name.",
        "O portal of the Light, enlighten mine eyes which the gloomy serpent hath enshrouded with the darkness of transgressions. Open unto me the doors of repentance, O Virgin; guide me to life, and rescue me from the flame and darkness."
      ],
      theotokion: "O blessed and all-pure Bride of God, blessed is the Fruit of thy womb whereby all of us mortals have been delivered from the curse: an ineffable wonder, incomprehensible knowledge, the salvation of all the faithful!"
    },
    3: {
      irmos: "O Christ, Who in the beginning established the heavens in wisdom and founded the earth upon the waters, make me steadfast upon the rock of Thy commandments; for none is holy as Thee, O Thou Who lovest mankind.",
      troparia: [
        "O Thou Who established the heavens, Who set the foundations of the earth and set the boundaries of the sea by Thy word, Thou wast bound for my sake and nailed to the Cross, that Thou mightest release me from the bonds of sin, O Thou Who lovest mankind.",
        "Hurling himself against the tree of the Cross, the enemy and his maleficent demons were slain; he who was condemned for wickedly eating hath found mercy; and creation hath been made steadfast by the confirmation of piety.",
        "The godly and valiant athletes had their naked bodies subjected to all manner of wounds, sharp blades, and wild beasts by the wicked persecutors; but, protected by God's hand, they remained undaunted.",
        "Looking in thought with watchful mind toward things to come, the glorious martyrs of Christ utterly spurned transitory things; wherefore, rejoicing, they endured unbearable wounds.",
        "All my desire is directed toward thee, O pure Mistress: quickly free me of carnal desires.",
        "O Mistress, portal of the Light, shine upon me the pure rays of repentance, and dispel the gloom of my sins.",
        "O only most immaculate one, deliver us from every lust, from the temptations which assail us, and everlasting fire.",
        "Haste thou, O all-pure one, to visit me who am sick, and deliver me from grievous wounds and every affliction."
      ],
      theotokion: "Pondering thy divine birthgiving, O Virgin, enriched by thine aid, I cry out: Holy art Thou, O Lord, Who saveth our souls!"
    },
    4: {
      irmos: "Thou art my strength, O Lord, Thou art my power; Thou art my God, Thou art my joy, Who, without leaving the bosom of the Father, hast visited our lowliness. Wherefore, with the Prophet Habbakuk I cry unto Thee: Glory to Thy power, O Thou Who lovest mankind!",
      troparia: [
        "The human race hath been recalled from the fall which the first-formed man suffered of old; for the Creator of all was lifted up upon the Tree, His hands run through with nails, His fingers bloody, His side pierced by a spear.",
        "When the Cross was set up, all deceit fell down; when Thy garments, O Savior, were removed, the alien one was stripped naked, and Adam was arrayed in a robe of divine incorruption. Creation was enlightened when Thou wast crucified on the Tree, O Christ, and the sun dimmed its rays.",
        "The greatly hymned Ewe-lamb, beholding the Lamb uplifted unjustly upon the Tree, cried out to Thee, O Word: \"The sun, seeing this, hath halted in its circuit, unable to shine when Thou art suffering, O Master. I hymn Thine innocence, O my Son!\"",
        "Standing before Thy Cross, O Lord, she who knew not wedlock, beholding Thy wounds, O Master, was wounded, and said: \"Woe is me, O my Child! I who escaped pain at Thy birth am now rent apart by pain!\"",
        "With light illumine my soul, which hath been darkened by transgressions, O Ever-virgin who gavest birth to the Sun of righteousness.",
        "Rescue me from temptations and the soul-destroying tempest of life, O Bride of God, and free me from everlasting fire.",
        "O sacred vessel of virginity, habitation of Him Who by nature is uncontainable: Enlighten my soul, which hath been darkened by many passions.",
        "O most holy Bride of God, Mistress of the world: Save me, delivering me from misfortunes and dispelling the tumult of the passions."
      ],
      theotokion: "Make entreaty for us to Him Who became incarnate of thee, O Theotokos, that we who glorify His sufferings may find help in time of peril."
    },
    5: {
      irmos: "Wherefore hast Thou turned Thy face from me, O Light never-waning? And why hath a strange darkness covered me, wretch that I am? But turn me, and guide my steps to the light of Thy commandments, I pray.",
      troparia: [
        "Desiring to clothe with the vesture of incorruption us, who have been stripped naked, Thou wast stripped naked; and crucified upon the Cross, Thou didst lay bare the wiles of the enemy. Wherefore, we glorify Thy sufferings.",
        "The saving blood which flowed from [Christ's] side manifestly cleansed the world, abolished the blood of the temples of the idols, restored those made subject to corruption by the fruit of knowledge, and poured forth incorruption upon our souls.",
        "Resplendent in the beauty of their multifarious wounds, and signed with the divine Blood, the glorious martyrs manifestly passed by the sword which before barred the way, and have made their abode, rejoicing, in paradise.",
        "How wonderful art Thou, O Christ, in the saints who loved Thee with faith! For, enriched by Thee, they pour forth upon the world rivers of divine healing, and dry up the effluence of our passions.",
        "That Thou mightest deliver me from the pleasant taste [of the fruit], Thou didst deign to taste gall, O Long-suffering One; and that Thou mightest strip me of the mortality of the passions, O Jesus, Thou didst will to be nailed, naked, to the Tree. I hymn Thy lovingkindness!",
        "Making new my soul, which had been corrupted by the passions, O Word, Thou didst commit Thy soul to the Father as Thou didst hang on the Tree. Perceiving this, the inanimate earth could not bear it, but quaked in fear, hymning Thee.",
        "With all diligence I hasten to thine aid, O most immaculate one, and I lift up the eyes of my soul. Turn not away from me, but help and deliver me, in that thou art good, and wash away the defilement of my transgressions.",
        "Deadly poison lay in the fangs of sin, but thou didst supply an antidote thereto in the nails and divine spear of thine Offspring, Who in His lovingkindness suffered in the flesh for our sake, O only most hymned one."
      ],
      theotokion: "Thou wast shown to be the temple of the Omnipotent One Who seeth all things; for, finding thy womb to be more honorable than the heavens, He dwelt therein, O most pure Theotokos."
    },
    6: {
      irmos: "The abyss of my sins and the tempest of my transgressions discomfit me and thrust me down into the depths of violent despondency; but stretch forth Thy mighty arm unto me, as Thou didst to Peter, and save me, O my Guide.",
      troparia: [
        "All the hosts of heaven sang and were amazed, seeing Thee hanging upon the Cross, O Word. By Thy wounds Thou didst heal wounded Adam, and the curse was annulled and mankind was released from unbreakable bonds when Thou wast bound in the flesh, O Word; and the tyrant is trussed like a bird, reviled by all the faithful. Glory to Thy lovingkindness, O Christ!",
        "Drawing the divine bow, Thy precious Cross, O Christ, Thou didst loose Thine arrows at the slayer; with the nails of Thy hands Thou didst pierce his wrathful and most polluted heart, O Master; and Thou didst utterly slay him, and grant life to those he had slain, O Compassionate One.",
        "With the stream of blood which flowed from the bodies of the holy athletes they quenched all the flame of the madness of idolatry by the Spirit, watered the furrows of the honored Church, and caused the grain of salvation, hope and love to grow, wherewith every soul is nourished by grace divine.",
        "The character of the glorious suffering passion-bearers was enflamed more than with fire, when the evil judges sentenced them to be consumed by material fire; but they were preserved unharmed through the activity and grace of the Holy Spirit, Who crowned them who suffered lawfully.",
        "Living in fornication, I have fallen away from God. I have become a wretched slave to pleasures, and am stripped bare of all the divine virtues. But visit me, O all-pure one.",
        "I have shunned the commandments given me, and, having withdrawn from life, I have drawn nigh unto death. But instruct me to return, O all-pure Mother of God.",
        "My life is wicked, full of indifference, but thy mercy is great and ineffable, O all-pure one. Let the lovingkindness of thy goodness prevail over my weak mind.",
        "O pure one, who gavest birth to the most compassionate Savior and Deliverer, have pity on me, and save and deliver me from those who surround and mercilessly attack my weakness."
      ],
      theotokion: "Seeing her Bullock uplifted upon the Tree, the unblemished heifer cried out, exclaiming: \"O my Child, how hath the assembly of the iniquitous failed to have pity on Thee Who had pity on them, but instead by a deceitful plot willed unjustly to do Thee to death?\""
    },
    7: {
      irmos: "Once, in Babylon, the youths who had come forth from Judaea trod down the flame of the furnace with their faith in the Trinity, chanting: O God of our fathers, blessed art Thou!",
      troparia: [
        "The hands wherewith Thou didst work wonders were wounded, O Christ; and Thou didst endure wounds, healing all my wounds. O only Long-suffering One, I hymn Thee, crying out: Blessed is the God of our fathers!",
        "Crucified, Thy hands and feet were run through with nails, and Thy side, pierced, poured forth drops of remission upon all who unceasingly chant and say: Blessed is the God of our fathers!",
        "Let us form a choir, hymning the martyrs of God, who are reckoned with the angelic choirs, enlighten those on earth, and ever chant: Blessed is the God of our fathers!",
        "Sanctified, ye have come to dwell amid the splendors of the saints, O divine martyrs, sending sanctification and deliverance upon all who praise you and sing unto Christ: Blessed is the God of our fathers!",
        "I beseech thee, O all-pure Virgin: Slay thou the sin which liveth in me, vouchsafe that I may receive life, and deliver me from the lot of those who are tormented in the hereafter.",
        "Divers passions bestorm me, O pure one who gavest birth to the Source of dispassion. Deliver me from their oppression and from everlasting fire by thy supplications, O Theotokos.",
        "I sin of my free will, and, enslaved to unseemly habits, I flee now to thy wonted mercy. Save me who am despairing, O most holy Theotokos.",
        "Quench thou the flame of my passions, and still the tempest of my heart, O pure Mother of God; and deliver me from the tyranny of the demons and from everlasting fire, O all-pure one."
      ],
      theotokion: "Groaning with pain, thou didst cry out maternally; and unable to bear the turmoil in thy womb, thou didst look upon Him Who was born of thy womb hanging on the Cross, and didst cry: \"What is this sight, O my Child? How is it that Thou Who art by nature dispassionate, desiring in every way to free the human race from the passions?\""
    },
    8: {
      irmos: "Madly did the Chaldaean tyrant heat the furnace sevenfold for the pious ones; but, beholding them saved by a higher Power, he cried out to the Creator and Deliverer: Ye children, bless; ye priests, hymn; ye people, exalt Him supremely for all ages!",
      troparia: [
        "The tree in Eden once gave rise to bitterness, but the tree of the Cross hath blossomed forth sweet life; for Adam, eating, fell headlong into corruption, but we, enjoying the fruit of Christ, are enlivened and mystically deified, receiving the eternal kingdom of God. Wherefore, we cry out with faith: Glory to Thy sufferings, O Word.",
        "Of old the Garden of Eden put forth in its midst the tree whose fruit was eaten; but Thy Church, O Christ, hath caused the Cross to spring forth, pouring out life upon the world. The one brought death upon Adam, who ate of its fruit, but the other gave life to the thief who was saved by faith. O Christ God, Who by Thy suffering didst break the snares laid for us by the enemy, show us to share in his salvation, and vouchsafe us Thy kingdom, O Lord.",
        "Bound, and slaughtered like lambs, mercilessly roasted in the fire, cast to the wild beasts, your heads cut off, ye rejoiced with indescribable joy, O martyrs, crying out: Ye children, bless; ye priests, hymn; ye people, exalt Christ supremely forever!",
        "O crowned martyrs, companions of the angels, who trampled the incorporeal foe underfoot: make entreaty for us to the Lord, that we may live in love and great oneness of mind, crying out with unwavering heart: Ye children, bless; ye priests, hymn; ye people, exalt Christ supremely forever!",
        "O all-pure one, I pray thee: Enlighten the eyes of my heart, which have been blinded by the blackness of sin; and show them to be receptive to divine radiance, that for thy sake I may be shown to be pure for thy Son.",
        "O all-pure one, I pray thee: Enlighten the eyes of my heart, which have been blinded by the blackness of sin; and show them to be receptive to divine radiance, that for thy sake I may be shown to be pure for thy Son.",
        "My many transgressions have increased, O Theotokos. Grant me now a helping hand, and deliver me, the useless one, from the ever-burning flame.",
        "My many transgressions have increased, O Theotokos. Grant me now a helping hand, and deliver me, the useless one, from the ever-burning flame."
      ],
      theotokion: "\"A strange sight do I see,\" the all-hymned one cried; \"How hast Thou, at the sight of Whom the whole earth doth quake, fallen asleep lifted up upon the Tree, desiring to wake those asleep from ages past? I bow down before Thy long-suffering, O my Son!\""
    },
    9: {
      irmos: "Heaven was stricken with awe, and the ends of the earth were amazed, that God hath appeared in the flesh, and that thy womb became more spacious than the heavens. Wherefore, the ranks of men and angels magnify thee as the Theotokos.",
      troparia: [
        "With Thy wounded and blood-stained hands Thou didst heal my wounds, O Master and Lord, in that Thou art good; and Thou didst show me how to walk the paths of salvation, Thy feet affixed to the Cross — those feet at the sight of which, when our first parents of old beheld Thee walking in paradise, they hid themselves.",
        "When Thou wast set upright on the Cross, the first-formed man, who had suffered a great fall, was set aright, all the might of the enemy fell, and the whole earth was sanctified by the blood and water which flowed from Thy side. Wherefore, we magnify Thee unceasingly, O most Compassionate One.",
        "Bound, O holy martyrs, ye loosed the bonds of the evil one, and with the bonds which ye patiently endured ye bound him and set him under your feet, full of shame, and by divine grace made him a mockery for those who saw him.",
        "By the deposition of the sacred relics of the martyrs hath the earth been sanctified; for it acquireth them as a divine well-spring pouring forth all manner of healings, body and soul, and with grace divine setting at nought the bane of the demons.",
        "Take pity on my wretched soul, O all-pure one, mortify my destructive passions, and dispel the perplexity which tormenteth me; and grant me holy and ever-vivifying streams of tears, whereby I may be delivered from the grievous condemnation which awaiteth me.",
        "O pure Virgin Bride of God, thou art a bulwark for Christians and a safe refuge for the world, wherein we are saved; for God, having become incarnate of thee, hath given thee to all as saving protection. Wherefore, save me who am unworthy, O pure one.",
        "\"O my Son, beginningless Word of the Father, Who art equally enthroned with the Holy Spirit, how is it that Thou hast stretched out Thine all-precious feet upon the Cross? What is this Thy great abasement, O All-good One?\", the most immaculate one cried out, standing before Thee as Thou wast crucified.",
        "O thou who gavest birth to the Sweetness of all, letting drops of divine sweetness fall, sweeten my soul, which hath been made bitter by the venom of the serpent, O sure intercessor of the faithful, ever estranging me to bitter sin by thy mediation."
      ],
      theotokion: "O blessed one, who art holier than the cherubim, and gavest birth in the flesh unto the Word of God, Who was uplifted upon the Cross of His own will: Earnestly pray to Him in behalf of us all."
    }
  }
},
            4: {
  metadata: {
    day:             "Thursday",
    theme:           "The Holy Apostles and Saint Nicholas",
    canons:          ["Canon of the holy, glorious & most laudable apostles, the composition of Theophanes", "Another canon, of the holy wonderworker Nicholas"],
    flatteningOrder: "Canon of the Apostles irmos governs; troparia: Canon of the Apostles troparia then Canon of Saint Nicholas troparia per ode, in source order; where source marks Twice the troparion is spelled out twice in the array; theotokion: final theotokion of the full ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. IV (Tones VII & VIII), St. John of Kronstadt Press",
    pages:           "124–129",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Having traversed the water as though it were dry land, and escaped the evil of Egypt, the Israelite cried aloud: Let us chant unto our Deliverer and God!",
      troparia: [
        "O radiant choir of the apostles who stand before the great Light, illumine my darkened heart, and guide me to the paths of salvation.",
        "O radiant choir of the apostles who stand before the great Light, illumine my darkened heart, and guide me to the paths of salvation.",
        "O true friends of the Deliverer, from the love of the passions deliver me who have been beguiled by the many deceits of life and am covered by the night of ignorance.",
        "As arrows of the Mighty One, O divine apostles, with your keen blades cure those wounded by the evil one, who flee under your protection with faith.",
        "Standing before the King of all with the choirs of the heavenly hosts, O blessed Nicholas, from every evil temptation save us on earth who ever call upon thee; and ask release from our transgressions.",
        "Enriched by thee, our intercessor, O Nicholas, we cry out to thee with faith day and night: Go now before us who are greatly afflicted by the wicked attacks of the demons and corrupt men, that, finding tranquillity, we may praise thee."
      ],
      theotokion: "Full of divine majesty, the Fruit of thy womb issueth forth, O pure Mother, saving those beguiled by the malice of the serpent."
    },
    3: {
      irmos: "Thou art the confirmation of those who have recourse to Thee, O Lord; Thou art the light of the benighted; and my spirit doth hymn Thee.",
      troparia: [
        "O apostles of the Savior, with power ye gird about my heart, which hath been weakened by evil thoughts and the passions.",
        "O apostles of the Savior, with power ye gird about my heart, which hath been weakened by evil thoughts and the passions.",
        "Proclaiming the one, thrice-holy effulgence of God, the disciples dissipated the gloom of polytheism.",
        "As divine physicians and surgeons, treat ye the evil sores of my heart, O disciples of our God.",
        "That we may honor and hymn thee forever, grant us a helping hand, O holy hierarch Nicholas.",
        "By thine unsleeping supplications, O Nicholas, lull to sleep the perils which arise before us, we beseech thee.",
        "By thy mediation, O holy Nicholas, deliver me who am wholly imperiled by the passions and the temptations of wicked men."
      ],
      theotokion: "Save me, O pure Mistress who supernaturally gavest birth to the Deliverer, Master, Savior and Lord of all."
    },
    4: {
      irmos: "I have heard, O Lord, the mystery of Thy dispensation; I have understood Thy works, and have glorified Thy divinity.",
      troparia: [
        "Ye have been adorned, O glorious apostles, arrayed in divine splendors and enlightened by the rays of Him Who showed you to be luminaries.",
        "Ye have been adorned, O glorious apostles, arrayed in divine splendors and enlightened by the rays of Him Who showed you to be luminaries.",
        "O helmsmen of all, ye divine apostles, from every tempest deliver me who am imperiled upon the deep and am shaken by the dangers of life.",
        "Roiling the sea of polytheism, O divinely chosen steeds, with your supplications ye overwhelm the deep of my transgressions.",
        "Because of the multitude of my transgressions I fall into many and countless tribulations. Make haste to help me, O holy Nicholas, emulating the Benefactor.",
        "Living in slothfulness, I weep over myself, who am perishing. By thy supplications, O Nicholas, guide me to repentance.",
        "O father Nicholas, who delivered the three youths who were to be executed, deliver me from all oppression and from everlasting condemnation."
      ],
      theotokion: "In thy womb thou gavest flesh to the Word Who is equal in activity to the Father, O Virgin; wherefore, thou hast been shown to transcend all creation, O Mistress."
    },
    5: {
      irmos: "Waking at dawn, we cry to Thee: Save us, O Lord! For Thou art our God, and we know none other than Thee.",
      troparia: [
        "As helmsmen, O apostles, to the broad expanse of salvation guide me who am hemmed in by many transgressions.",
        "As helmsmen, O apostles, to the broad expanse of salvation guide me who am hemmed in by many transgressions.",
        "O apostles who beheld God with your own eyes, from every dishonorable act deliver me, who honor your most honorable council, I pray.",
        "In that ye emulated the sufferings of the Savior, O holy apostles, drive all passion for luxury from my soul.",
        "Thy heart, O Nicholas, was like paradise, having Christ the Deliverer within it like the tree of life. Him do thou unceasingly entreat, that He make us all dwellers in paradise, enriched by thee, our fervent helper.",
        "By thy supplications, O divinely blessed Nicholas, strengthen us to keep the commandments of Christ, our one God.",
        "Having lived in Myra, O Nicholas, with divine fragrance fill us who piously hymn thee."
      ],
      theotokion: "Cure my sick soul, O all-pure Mistress who gavest birth to Him Who taketh away the infirmities of all."
    },
    6: {
      irmos: "I pour forth my prayer unto the Lord, and to Him do I declare my grief; for my soul is full of evil and my life hath drawn nigh unto hell, and like Jonah I pray: Lead me up from corruption, O God!",
      troparia: [
        "Ye cast down the temples of the idols, which shook at the sound of your supplications, O disciples of Christ. And I pray with faith: Break ye the idols of my mind, and show me to be a temple of God, though I am guilty of many sins.",
        "Ye cast down the temples of the idols, which shook at the sound of your supplications, O disciples of Christ. And I pray with faith: Break ye the idols of my mind, and show me to be a temple of God, though I am guilty of many sins.",
        "O chosen ones who beheld God, and who like stones were founded upon the immovable Rock, save my heart, which hath foolishly been founded upon the sand; for the rivers rage dangerously and buffet me cruelly.",
        "O friends of Christ, from the beguiling love of the flesh deliver me, who have shown myself to be vile by my great evil; and bind me to the love of Him Who loveth sinners in the great mercy of remission.",
        "Have pity on us by thy supplications, O holy hierarch Nicholas, entreating the most compassionate God, that we be delivered from misfortunes and tribulations."
      ],
      theotokion: "The Creator, choosing thee, O Maiden, as a rose, as a most pure lily, as an aroma of sweet fragrance, from the beautiful vales of the world, and making His abode in thy womb, and being born of thee, hath filled all things with sweet savor."
    },
    7: {
      irmos: "In the furnace the Hebrew children boldly trod the flame underfoot and transformed the fire into dew, crying out: Blessed art Thou, O Lord God, forever!",
      troparia: [
        "The night of slothfulness holdeth me, and the darkness of sin covereth me. O all-wise apostles, who were shown to be the light of the world, haste ye to illumine my darkened heart.",
        "The night of slothfulness holdeth me, and the darkness of sin covereth me. O all-wise apostles, who were shown to be the light of the world, haste ye to illumine my darkened heart.",
        "O divinely eloquent ones, who were shown to be another heaven declaring the glory of our God, from the indignity of the passions deliver those who with faith have recourse to your mighty protection.",
        "O apostles, who were shown to be burning coals alight with the fire of the Comforter, utterly consume all the tinder of our malice, and deliver us forever from the unquenchable fire.",
        "The night of slothfulness holdeth me also, O most blessed Nicholas. Haste to illumine my darkened heart. Seek from the Compassionate One remission of sins for me.",
        "Thou didst pour forth streams of doctrine, drying up the torrents of heresies and giving abundant drink to the souls of the faithful, O sacred minister Nicholas; wherefore, we honor thee.",
        "Enlightened by the radiant beams of the three-Sunned Godhead, O divinely wise and holy hierarch Nicholas, by thy supplications dispel the darkness of my passions."
      ],
      theotokion: "Thou wast shown to be a mountain overshadowed and unquarried, from whence the Stone was cut; wherefore, O Mistress, grant compunction to my darkened soul, which hath been hardened by the bitter love of pleasures."
    },
    8: {
      irmos: "Madly did the Chaldaean tyrant heat the furnace sevenfold for the pious ones; but, beholding them saved by a higher Power, he cried out to the Creator and Deliverer: Ye children, bless; ye priests, hymn; ye people, exalt Him supremely for all ages!",
      troparia: [
        "Strengthen my soul, which is whirled about by the passions, O ye who are the unbreakable foundations and unshakable pillars of the Church, the bulwark of the faithful, who draw out those who are in the depths of perdition, the right calm harbors of those who chant with faith: Ye children, bless; ye priests, hymn; ye people, exalt Him supremely forever!",
        "Strengthen my soul, which is whirled about by the passions, O ye who are the unbreakable foundations and unshakable pillars of the Church, the bulwark of the faithful, who draw out those who are in the depths of perdition, the right calm harbors of those who chant with faith: Ye children, bless; ye priests, hymn; ye people, exalt Him supremely forever!",
        "O disciples of the Savior, by your supplications raise me up who am in the grave of dark despair and lie in the netherworld, having fallen through pleasures. Have pity, O apostles who beheld God, for ye have manifestly been vouchsafed to be enriched with the Teacher's compassion for all ages.",
        "O disciples of the Savior, by your supplications raise me up who am in the grave of dark despair and lie in the netherworld, having fallen through pleasures. Have pity, O apostles who beheld God, for ye have manifestly been vouchsafed to be enriched with the Teacher's compassion for all ages.",
        "O Nicholas, initiate of the sacred mysteries, who delivered the three generals from death by thine awesome appearance, deliver us also from all deadly harm.",
        "By thy supplications, O most blessed Nicholas, make steadfast those who are beset by the temptations of the demons and oppressive men, and save us unharmed.",
        "As thou art the deliverer of those who with faith pray to thee in their sorrow, O Nicholas, deliver me from all malice, entreating the Lord God in prayer."
      ],
      theotokion: "Bring entreaty to the Lord, that He have pity and save those who have recourse to thee with faith, O all-holy Virgin, helper of men."
    },
    9: {
      irmos: "Heaven was stricken with awe, and the ends of the earth were amazed, that God hath appeared in the flesh, and that thy womb became more spacious than the heavens. Wherefore, the ranks of men and angels magnify thee as the Theotokos.",
      troparia: [
        "With the power of God ye broke the jaws of the soul-destroying lions, O apostles, for ye were ordained by Christ to be princes on earth, piously submitting in hymnody to this Spirit; wherefore, make the disorderly movements of my heart subject to the laws of God.",
        "Preaching the Word of God, Who is more comely than all the sons of men, and Who appeared in the world, ye made beautiful your feet, as ones proclaiming peace and life; wherefore, by your supplications bring peace to my soul, which is vexed by the passions.",
        "Having mortified your members on earth, ye clothed yourselves in all life, emulating the honored Passion by your sufferings; wherefore, O divinely blessed apostles, with the remedy of true repentance give life to me who have been wounded by the darts of the evil one's malice.",
        "Having mortified your members on earth, ye clothed yourselves in all life, emulating the honored Passion by your sufferings; wherefore, O divinely blessed apostles, with the remedy of true repentance give life to me who have been wounded by the darts of the evil one's malice.",
        "O most holy father Nicholas, who art now with the heavenly choirs, beseech the good God, that He save us.",
        "Judgment is at the gates! Be watchful, O my soul, and cry out to God the Judge: Through the prayers of Nicholas save me, O Lord!"
      ],
      theotokion: "In that thou art merciful, O thou who gavest birth to the all-good God, heal my soul, which hath become sick through grievous passions; and ever deliver me from enemies who goad and attack me, O all-pure one, that, saved, I may diligently magnify thee, whom our generation hath magnified."
    }
  }
},
            5: {
  metadata: {
    day:             "Friday",
    theme:           "The Holy Cross and the Theotokos",
    canons:          ["Canon of the precious & life-creating Cross, the composition of Joseph", "Canon of the all-holy Theotokos, in Tone VIII"],
    flatteningOrder: "Canon of the Cross irmos governs; troparia: Canon of the Cross troparia then Martyrica then Canon of the Theotokos troparia per ode, in source order; where source marks Twice the troparion is spelled out twice in the array; theotokion: final theotokion of the full ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. IV (Tones VII & VIII), St. John of Kronstadt Press",
    pages:           "133–139",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Tracing an upright line with his staff, Moses divided the Red Sea for Israel, which was traveling on foot; and striking it a transverse blow, he brought the waters together over the chariots of Pharaoh, thereby inscribing the invincible weapon of the Cross. Wherefore, let us hymn Christ our God, for He hath been glorified.",
      troparia: [
        "Stretching forth Thy divine hands on the Cross, O Jesus, Thou didst gather to Thyself Thine own hands' creation, didst free all from the hands of the evil one and subdue him with Thy mighty hand, O King of all. Wherefore, we, the faithful, hymn Thy majesty, for Thou hast been glorified.",
        "Harmful was the bitter eating of the tree in Eden, which brought death upon us; but, dying on the Cross, Christ hath poured forth life upon all, slaying the serpent with His divine power. Wherefore, let us sing to Him, our God, for He hath been glorified!",
        "Waging war, the multitude of the martyrs fought against the passions with Thy Cross and sufferings, O Jesus, and before the enemy they confessed Thee to reign over creation; and they endured tortures and boundless tribulations. Wherefore, they have received the glory of the Lord of glory.",
        "Finding deliverance through the sprinkling of Thy deifying precious blood, O Lord, Thy martyrs truly shed their own blood, and, unjustly tortured, they refused to offer sacrifice to the vile soul-destroying demons. Wherefore, they brought honorable wholeburnt offerings unto Thee, the King of all.",
        "By thy visitation, O Mother of God, enlighten my soul, which hath been darkened by the pleasures of life and is constantly vexed by the griefs of the world.",
        "The gates of heaven have been opened by thy divine birthgiving, O Mother of God. As thou art merciful, grant entry therein to my soul, and guide me to them.",
        "O Virgin, by thy mercy heal my soul, which hath been shot by the darts loosed by the evil one and is wounded by his wiles and machinations.",
        "As the hope of the hopeless and setting aright of the fallen, O thou who gavest birth to the divine Light, illumine my soul, which is in darkness."
      ],
      theotokion: "When she saw Thee, Who seest all things, nailed to the Cross, the immaculate one said, lamenting: \"What is this, O my Child? How have those who enjoyed Thy many gifts rewarded Thee? How can I bear the pain? Glory to Thy compassion and awesome dispensation, O Long-suffering One!\""
    },
    3: {
      irmos: "The rod of Aaron is taken to be an image of the mystery, for by its budding forth it chose one priest over others; and for the Church, which before was barren, the Tree of the Cross hath now budded forth, for her might and confirmation.",
      troparia: [
        "Beholding Thee unjustly suspended upon the Tree, the sun changed its bright vesture to black, the rocks split asunder, and the whole earth quaked, O only Savior, Thou deliverance of all.",
        "Stretching out his arms, Moses prefigured the precious Cross; and we, now making the sign thereof with goodly wisdom, vanquish all the alien hordes of the demons, immune to all their harm.",
        "Enduring sufferings, the passion-bearers emulated the suffering [of Christ], and they underwent all manner of tortures for the sake of Him Who suffered of His own will, Who slew the passions and shone forth life upon the world.",
        "Unwaveringly treading the path of torment, the right glorious passion-bearers cast from their hearts the stumbling-blocks of deception, and hastened in gladness to the place of divine rest.",
        "\"I gave birth to Thee in manner transcending the ways of men's laws, O my Child,\" the Theotokos declared, weeping; \"How then have the iniquitous lifted Thee up upon the Tree in the midst of malefactors, O Thou Who alone set forth the law of life?\"",
        "Grant me loud sighs, ardent tears and a contrite heart, O Virgin, that I may weep over what I have done; and destroy my growing passions, O thou who alone art most hymned.",
        "Rescue my soul, which is heavy with sinful slumber and is sunk in the bowels of hades, O Mistress, and grant me the thought of true repentance, O blessed of God.",
        "Love of contrition and the virtues do thou grant unto my soul, which hath been sunk by my transgressions, that it might love the life of heaven and possess divine desire."
      ],
      theotokion: "On thee do I set my hope, O Mother of God, and I am quickly delivered from despair; for I know, I quickly know the richness of thy loving-kindness and the power of thy boldness."
    },
    4: {
      irmos: "I have heard, O Lord, the mystery of Thy dispensation; I have understood Thy works, and have glorified Thy divinity.",
      troparia: [
        "Bearing piety like the cedar, faith like the cypress, and love like the pine, we bow down before the divine Cross.",
        "By Thy Cross hath paradise been opened, O Savior, and man who had been condemned hath entered it again, magnifying Thy goodness.",
        "Having died, Thou gavest life to men who had died, and didst slay the serpent who introduced sin.",
        "Emulating the sufferings of Christ, the divine martyrs were shown to share in the radiance of heaven.",
        "Uniting themselves to the beautiful Word, the martyrs were adorned; and, loving the Sun of righteousness, they were splendidly enlightened.",
        "Unto Him Who was perfected before time began thou gavest birth as a little babe, O most immaculate Maiden; and He hath perfected all things by His Cross and goodness.",
        "O thou who ineffably gavest birth to God the Word, bind up the wounds of my soul with effective herbs, pouring out upon them the precious blood of thy Son, Who destroyed the soul-corrupting belly of hades, and poured forth resurrection upon the world.",
        "O Bride of God, send down upon my soul the cleansing of transgressions, with streams wash away mine evil thoughts, and vouchsafe that it may become pure; for I have fled to thy mediation and help, O Virgin Theotokos."
      ],
      theotokion: "Thou hast healed us who have been afflicted by sin, O all-pure Virgin, who gavest birth to the Savior and Physician of all, Who was nailed to the tree of the Cross, and poured forth salvation upon our souls."
    },
    5: {
      irmos: "O thrice-blessed Tree, whereon Christ, our King and Lord, was crucified, and whereby he who beguiled mankind by the tree did fall, when God was nailed in the flesh, Who granteth peace to our souls!",
      troparia: [
        "Desiring to clothe with the vesture of incorruption us, who have been stripped naked, Thou wast stripped naked; and crucified upon the Cross, Thou didst lay bare the wiles of the enemy. Wherefore, we glorify Thy sufferings.",
        "The saving blood which flowed from [Christ's] side manifestly cleansed the world, abolished the blood of the temples of the idols, restored those made subject to corruption by the fruit of knowledge, and poured forth incorruption upon our souls.",
        "Resplendent in the beauty of their multifarious wounds, and signed with the divine Blood, the glorious martyrs manifestly passed by the sword which before barred the way, and have made their abode, rejoicing, in paradise.",
        "How wonderful art Thou, O Christ, in the saints who loved Thee with faith! For, enriched by Thee, they pour forth upon the world rivers of divine healing, and dry up the effluence of our passions.",
        "With all diligence I hasten to thine aid, O most immaculate one, and I lift up the eyes of my soul. Turn not away from me, but help and deliver me, in that thou art good, and wash away the defilement of my transgressions.",
        "Deadly poison lay in the fangs of sin, but thou didst supply an antidote thereto in the nails and divine spear of thine Offspring, Who in His lovingkindness suffered in the flesh for our sake, O only most hymned one.",
        "Grant life to me, who am slain by mine evil ways and corrupted by my transgressions, O thou who gavest birth to eternal Life; and turn me to incorruption by renewing my soul, O blessed of God.",
        "Deliver me from the evil of the demons and the malice of men, O Mistress who alone gavest birth to the Healer of all flesh and offenses, the Savior and Lord, and quickly heal the pain of my soul and body."
      ],
      theotokion: "Thou hast healed us who have been afflicted by sin, O all-pure Virgin, who gavest birth to the Savior and Physician of all, Who was nailed to the tree of the Cross, and poured forth salvation upon our souls."
    },
    6: {
      irmos: "Stretching forth his arms in the form of the Cross in the belly of the sea monster, Jonah clearly prefigured the saving passion. And issuing forth after three days, he foreshadowed the transcendent resurrection of Christ God, Who was nailed in the flesh and hath enlightened the world by His rising on the third day.",
      troparia: [
        "The Cross was planted in the midst of the earth at the place of the skull, and healed the sickness caused by the tree which grew in the midst of paradise; for Jesus the Messiah, Who alone is righteous, appeared in the midst of two iniquitous thieves, and with Himself hath raised up all, and cast down into the abyss him who fell headlong from the heights.",
        "Drawing the divine bow, Thy precious Cross, O Christ, Thou didst loose Thine arrows at the slayer; with the nails of Thy hands Thou didst pierce his wrathful and most polluted heart, O Master; and Thou didst utterly slay him, and grant life to those he had slain, O Compassionate One.",
        "With the stream of blood which flowed from the bodies of the holy athletes they quenched all the flame of the madness of idolatry by the Spirit, watered the furrows of the honored Church, and caused the grain of salvation, hope and love to grow, wherewith every soul is nourished by grace divine.",
        "The character of the glorious suffering passion-bearers was enflamed more than with fire, when the evil judges sentenced them to be consumed by material fire; but they were preserved unharmed through the activity and grace of the Holy Spirit, Who crowned them who suffered lawfully.",
        "Still thou the unbearable tempest of my passions, O thou who gavest birth to God, the Helmsman and Lord.",
        "The ranks of the angels and the assembly of men minister to thine Offspring, O all-pure Theotokos.",
        "O Mary Theotokos, who knewest not wedlock, show forth the hopes of the enemy as vain, and fill with gladness those who hymn thee.",
        "O Mary Theotokos, who knewest not wedlock, show forth the hopes of the enemy as vain, and fill with gladness those who hymn thee."
      ],
      theotokion: "O pure one who knewest not wedlock, beseech Thy Son and our God, that He send down upon us, the faithful, great mercy, O all-pure Mary."
    },
    7: {
      irmos: "The mad command of the ungodly tyrant, breathing forth threats and blasphemy hateful to God, cast the people into confusion. Yet the three youths feared not the fury of the wild beasts, nor the raging blaze; but in the midst of the fire, when the dew-bearing wind blew upon it, they sang: O all-hymned God of our fathers, blessed art Thou!",
      troparia: [
        "When Thou wast stretched out upon the tree of the Cross like a most comely cluster of grapes, O Word of the Father, Thou didst mystically exude the wine which doth away with the drunkenness of disobedience and gladdeneth all who acknowledge Thee to be God the Creator, Who sufferest of Thine own will. And it saveth those who chant: O all-hymned God of our fathers, blessed art Thou!",
        "Thou didst endure the mockery of crucifixion, O Christ my God, bringing an end to the reproaches and sighing of men; Thou didst eat gall, transforming all the bitterness of evil; and Thou didst suffer Thy hands to be wounded, healing the wounds of our souls, O Compassionate One, and commanding us to chant: O all-hymned God of our fathers, blessed art Thou!",
        "With your pangs, O valiant athletes, ye gained the life which is devoid of pain; wherefore, having received from on high the grace to heal our sufferings and dispel evil spirits, ye ease our pains, O holy ones; and ye stand forth before the faithful, and save those who cry: O all-hymned God of our fathers, blessed art Thou!",
        "Ye stood before the tribunal, confessing Christ Who for our sake assumed flesh like ours, though without corruption, O martyrs; and, truly showing yourselves to be emulators of His sufferings, ye endured fire and all other tortures, crying out in gladness: O all-hymned God of our fathers, blessed art Thou!",
        "\"I was filled with grief, beholding Thee, my Son, suffering unjustly; and I was wounded in soul when by the spear Thou wast pierced in the side,\" weeping and lamenting the Theotokos, the only Mistress, cried, whom we all call blessed as is meet, piously crying out: O all-hymned God of our fathers, blessed art Thou!",
        "I beseech thee, O all-pure Virgin: Slay thou the sin which liveth in me, vouchsafe that I may receive life, and deliver me from the lot of those who are tormented in the hereafter.",
        "Divers passions bestorm me, O pure one who gavest birth to the Source of dispassion. Deliver me from their oppression and from everlasting fire by thy supplications, O Theotokos.",
        "I sin of my free will, and, enslaved to unseemly habits, I flee now to thy wonted mercy. Save me who am despairing, O most holy Theotokos."
      ],
      theotokion: "\"I gave birth to Thee, the Lord of my life, Who art comely in beauty more than the sons of men,\" the Virgin cried out; \"How now dost Thou die crucified, bereft of beauty, O my Son Who by Thy hand didst make all beautiful?\""
    },
    8: {
      irmos: "O children, equal in number to the Trinity, bless ye God, the Father and Creator; hymn ye the Word, Who came down and transformed the fire into dew; and the all-holy Spirit, Who imparteth life unto all, exalt ye supremely forever!",
      troparia: [
        "Blessed is the Tree whereby all the curse of deception in Eden was annulled, which resulted from the wicked eating of the tree; and Christ the all-glorious is exalted, Who in His lovingkindness desired of His own will to be lifted up thereon.",
        "Once, the ever-glorious [Jacob], crossing his arms in sacred manner, blessed his grandsons, manifesting the form of the sacred Tree, whereby blessing hath been imparted unto all who were cursed by the malignant fruit of the tree and stumbled headlong into the abyss of evils.",
        "All mankind was set aright when Thou, O Master, wast stretched forth on the Cross. The horde of evil demons fell, and those who were scattered came together in unity; and the might of Thine authority and Thy power are exalted forever.",
        "Bound, O holy martyrs, ye loosed the bonds of the evil one, and with the bonds which ye patiently endured ye bound him and set him under your feet, full of shame, and by divine grace made him a mockery for those who saw him.",
        "By the deposition of the sacred relics of the martyrs hath the earth been sanctified; for it acquireth them as a divine well-spring pouring forth all manner of healings, body and soul, and with grace divine setting at nought the bane of the demons.",
        "Take pity on my wretched soul, O all-pure one, mortify my destructive passions, and dispel the perplexity which tormenteth me; and grant me holy and ever-vivifying streams of tears, whereby I may be delivered from the grievous condemnation which awaiteth me.",
        "O pure Virgin Bride of God, thou art a bulwark for Christians and a safe refuge for the world, wherein we are saved; for God, having become incarnate of thee, hath given thee to all as saving protection. Wherefore, save me who am unworthy, O pure one.",
        "O pure Virgin Bride of God, thou art a bulwark for Christians and a safe refuge for the world, wherein we are saved; for God, having become incarnate of thee, hath given thee to all as saving protection. Wherefore, save me who am unworthy, O pure one."
      ],
      theotokion: "Having escaped maternal pangs when I gave birth to Thee, O Long-suffering One, I now suffer pangs in my womb, as my soul is filled with pain, as Thou now dost accept pain!, and my soul is filled with pain, as Thou now partakest of suffering Thine own will and dost accept pain!, cried the all-pure one, whom we magnify as is meet."
    },
    9: {
      irmos: "Death, which came upon our race through the eating of the tree hath been abolished by the Cross today; for the curse of our first mother, which fell upon us all, hath been annulled through the Offspring of the pure Mother of God, whom all the hosts of heaven magnify.",
      troparia: [
        "Exalting Thee most sacredly, O compassionate Master, we bow down before Thy Cross, the spear, the sponge, the reed, and the holy nails which pierced Thy hands and feet, whereby we have found perfect remission and have been vouchsafed to live in paradise.",
        "O how unjustly Thou wast condemned to be nailed, crucified, to the Tree, O Thou Who alone art the most just Judge of all, seeking to justify all who with faith glorify thy voluntary sufferings and dispensation, and who magnify Thee, O my Christ, with faith.",
        "Giving their bodies over to tortures with all their soul, the glorious martyrs endured wounds and a violent death, the severing of their members, laceration, and burning by fire, and were aflame with love for the Lord; wherefore, crowned, they dwell in the heavens.",
        "O Thou Who art the delight of the apostles and martyrs, by thy supplications fill us all with mercy, in that Thou art compassionate, granting us the remission of our transgressions, the deliverance from all evils, and a place to dwell in Thy kingdom, O Thou Who for our sake appeared as a man.",
        "Having escaped maternal pangs when I gave birth to Thee, O Long-suffering One, I now suffer pangs in my womb; for my soul is filled with pain, beholding Thee, my Son, suffering unjustly; and Thou dost hasten and dost desire to leave me childless. Haste Thou, and glorify Thyself, that I may be magnified by Thy suffering!",
        "O all-holy Theotokos, gird about my lowly soul with the might and power of the Spirit, with weaponry and dominion, and arm it with the sword of the Cross. And cleanse thou the wounds of my sin with the dew of thy love for mankind and thy great mercy.",
        "Be thou for me a pillar of salvation, O pure one; and render the hordes of the demons impotent, dispelling the turmoil of dangers and misfortunes, driving far away the assaults of the passions, and granting us pure liberation.",
        "O pure and all-glorious Mother of God, save those who hymn thee with love, mercifully quelling the tumults of temptation; for as thou gavest birth unto God, O Virgin, thou art able to do whatsoever thou dost desire, and freely grantest mercy. Wherefore, we all magnify thee."
      ],
      theotokion: "O thou who art truly the divine Mother of God, never cease to entreat Him Whom thou didst bear, that He grant now to thy servants remission of sins and most perfect forgiveness to them for the evils they have committed; and that He vouchsafe them everlasting bliss with all the saints."
    }
  }
},
            6: {
  metadata: {
    day:             "Saturday",
    theme:           "All Saints and the Departed",
    canons:          ["Canon of the holy martyrs, hierarchs, the venerable and the departed, the acrostic whereof is 'the divine conclusion of the new Octoechos', the composition of Joseph", "Canon of the departed, the acrostic whereof is 'I fashion an eighth hymn for the faithful departed', the composition of Theophanes"],
    flatteningOrder: "Canon of the martyrs irmos governs; troparia: Canon of the martyrs/hierarchs/venerable/departed troparia then Canon of the departed troparia per ode, in source order; where source marks Twice the troparion is spelled out twice in the array; theotokion: final theotokion of the full ode sequence",
    ode2Present:     false,
    source:          "Lambertsen, The Octoechos Vol. IV (Tones VII & VIII), St. John of Kronstadt Press",
    pages:           "144–150",
    verified:        true
  },
  odes: {
    1: {
      irmos: "Let us chant unto the Lord, Who led His people through the Red Sea, for He alone hath gloriously been glorified.",
      troparia: [
        "Ye were shown to be precious pearls rendering the crown of the honored Church brilliant, O most valiant passion-bearers of Christ.",
        "With divine splendors the all-wise and holy hierarchs shone forth the dogma of the virtues and have enlightened the hearts of the faithful.",
        "O Word Who art wondrous in the prophets and the righteous, we beseech Thee: By their supplications save us!",
        "When Thou, the righteous Judge, shalt come to do what is most just, O Word, save us from condemnation by their entreaties.",
        "Having emulated the death of Christ by their death and His honored suffering by their sufferings, all the martyrs have received divine and blessed life.",
        "Overlooking the transgressions of youth and transcending men's sins, O Christ our Savior, number among Thine elect Thy servants who have fallen asleep.",
        "Unto Thy servants whom Thou hast taken to Thyself, O greatly Merciful One, richly grant the glory and joy which those who have acquired a blessed sojourn have received."
      ],
      theotokion: "Knowing thee to be the one who gave birth to the Lord, O Virgin, the choir of women who suffered, following in thy train, is brought before Him."
    },
    3: {
      irmos: "O Christ, Who in the beginning established the heavens in wisdom and founded the earth upon the waters, make me steadfast upon the rock of Thy commandments; for none is holy as Thee, O Thou Who lovest mankind.",
      troparia: [
        "Spurning vile sacrifices with most mighty intent, the athletes became most pure sacrifices for the Word Who was sacrificed.",
        "Renewing with sanctifying words those grown old through all the passions, ye showed yourselves to be divine disciples of the Word Who hath renewed the world.",
        "The grace of the most Holy Spirit, which of old was manifestly imparted to the prophets, hath in latter times filled the ascetics with divine gifts.",
        "Join Thou to the choirs of the saints those who have passed from this life with faith, O God, and in Thine ineffable mercy cause them to dwell in paradise.",
        "Having emulated the death of Christ by their death and His honored suffering by their sufferings, all the martyrs have received divine and blessed life.",
        "Cleansed of the ancient fall of our first parents, and having been sprinkled with baptism, regeneration and the streams of your blood, O blessed ones, ye reign with Christ.",
        "O Savior, Who of Thine own will wast laid, dead, in the tomb, and called forth those who abide in the grave, be Thou well-pleased that those whom Thou hast taken from us may dwell in the habitations of Thy righteous."
      ],
      theotokion: "He Who alone manifestly loveth mankind, who was incarnate of thy womb and became man, saveth man from the gates of death, O only all-pure and most hymned Mother of God."
    },
    4: {
      irmos: "I have heard, O Lord, the mystery of Thy dispensation; I have understood Thy works, and have glorified Thy divinity.",
      troparia: [
        "Passing through the arena of torments, O divinely blessed athletes, with the fervor of the Spirit ye utterly consumed the tinder of deception.",
        "Thou hast splendidly glorified Thy venerable and holy hierarchs, O Lord. By their divine entreaties show me to partake of Thy glory.",
        "The inspiration of the divine Spirit, which enlightened the prophets, gave women the strength to cast down the arrogance of the enemy.",
        "O All-good One, entreated, do Thou vouchsafe that Thy servants, whom Thou hast taken to Thyself, may join chorus with all the saints in Thy holy habitations.",
        "That they might behold Thy glory and splendidly receive Thine effulgence in the heavens, O Master, the divine martyrs endured all manner of tortures, singing to Thee: Glory to Thy power, O Thou Who lovest mankind!",
        "In Thy house are many mansions, O Savior, which are set aside for all according to the measure of their virtues, as is fitting. Be Thou well-pleased, O Compassionate One, to fill them with those who have reposed in faith, piously chanting unto Thee: Glory to Thy power, O Thou Who lovest mankind!",
        "Thou didst appear as a man equal to us, O Immortal One, didst endure death as do all, and hast shown us the path to life. In that Thou lovest mankind, free those who have departed from us, granting them forgiveness of offenses, O Master."
      ],
      theotokion: "In manner transcending nature, O most immaculate one, thou gavest birth to the Bestower of the law of God, Who became a man. As thou art good, O most immaculate one, entreat Him to overlook the iniquities of us who ever cry out: Glory to Thy power, O Thou Who lovest mankind!"
    },
    5: {
      irmos: "Enlighten us with Thy commandments, O Lord, and with Thine upraised arm grant us Thy peace, O Thou Who lovest mankind.",
      troparia: [
        "The divine martyrs bore the wounding of their flesh; wherefore, they ever heal our wounds, wounding the demons.",
        "O holy hierarchs of God, with all the venerable entreat Christ, that He grant us remission of sins.",
        "Laying waste to their bodies with discomfort and asceticism, the venerable women have been vouchsafed that for which they truly hoped, O Thou Who lovest mankind.",
        "O Immortal One, Who destroyed death by Thy death, in that Thou lovest mankind grant rest to Thy faithful servants, who have died in hope of life.",
        "In the habitations of the saints, where the beauteous cry is heard of those who keep festival, vouchsafe the life of dispassion, Thine ineffable glory and Thy blessedness, which is past recounting, unto those who have departed, O Thou Who alone lovest mankind, taking pity on them.",
        "In the bosom of Abraham, where the ranks of the angels are, and where the assemblies of the righteous rejoice, cause Thy servants to dwell, O loving Savior, and be Thou well-pleased that those whom Thou hast taken from us may stand with boldness before Thy dread and divine throne."
      ],
      theotokion: "Thou hast annulled the condemnation of our first father, O pure one, having given birth in the flesh unto Jesus, the one Lord, Who hath justified all."
    },
    6: {
      irmos: "Cleanse me, O Savior, for many are my transgressions; and lead me up from the abyss of evils, I pray, for to Thee have I cried, and Thou hast hearkened to me, O God of my salvation.",
      troparia: [
        "With your honored stripes ye heal the infirmities of men's souls, O holy martyrs, and ever remove the corruption of their bodies, wounding the multitude of evil demons.",
        "The choir of the venerable, the company of holy hierarchs, and the divine assembly of sacred women, who struggled steadfastly, have inherited bliss in the heavens.",
        "Having mortified the flesh, ye received life, O ascetics; and having tended well the flock of Christ, O all-wise and holy hierarchs, ye were vouchsafed immortal glory after your end.",
        "O Word, Who art the life of the living and rest of the dead: Cause Thy servants, who have departed from us at Thy divine behest, to dwell in the bosom of Abraham, Thy favored one.",
        "Wounded in their souls by the love of Thee, Thy martyrs, O Savior, endured many tortures, desiring everlasting glory and Thy sweet communion.",
        "Thou didst cut open the belly of the enemy by Thy death, and didst resurrect all who were held prisoner therein, O Bestower of life. Vouchsafe this unto those who have departed, O Benefactor.",
        "Thou didst free Thy servants in hades from tears and sighing, O Savior, for as Thou alone art full of lovingkindness, Thou hast wiped away every tear from the face of all who bless thee with faith."
      ],
      theotokion: "The Effulgence of the Father dwelt within thee, O pure one, and with the immaterial rays of His divinity destroyed the darkness of polytheism, and illumined the world."
    },
    7: {
      irmos: "In Babylon, the pious youths did not worship the golden image, but, bedewed in the midst of the fiery furnace, they chanted a hymn, saying: O supremely exalted God of our fathers, blessed art Thou!",
      troparia: [
        "Having destroyed the hedge of ungodliness with your sacred bonds, release from me the burden of mine offenses, O martyrs, and save me who cry: Blessed is the God of our fathers!",
        "With the showers of your sacred blood ye extinguished the fire of heresies, and by the flame [ye endured] ye burned up the tares of the deception of ungodliness and enlightened the souls of the faithful.",
        "Having mortified the flesh with asceticism, the fasters live even after death; and the choir of the prophets and the righteous, and the company of women who struggled, have been glorified. By their entreaties, O Christ, deliver us from misfortunes.",
        "Grant rest, O Christ, unto the souls of all who have fallen asleep in the hope of life, in Thy great lovingkindness overlooking the offenses they committed in this life, O only compassionate Savior. O God of our fathers, blessed art Thou!",
        "All the desire of the martyrs was for the one Master, for they were united to Him in love and chanted: O God of our fathers, blessed art Thou!",
        "The splendor of the divine kingdom dost Thou give to those who have departed in faith, granting the vesture of incorruption unto those who cry: Blessed art Thou, O Lord God, forever!"
      ],
      theotokion: "Annulling the curse of Eve, Thou madest Thine abode within the all-immaculate Virgin, pouring forth a fountain of blessing upon those who cry: Blessed is the Fruit of thy womb, O all-pure one!"
    },
    8: {
      irmos: "Trampling down the fire and flame in the furnace, the divinely eloquent youths did chant: Bless the Lord, O ye works of the Lord!",
      troparia: [
        "Suffering, ye demolished the temples of the idols and made yourselves temples of the Spirit, bravely finishing your race.",
        "Thy priests, O Christ, having clothed themselves in righteousness with those who lived holy lives in times past, now rejoice, beholding Thy divine beauty most clearly.",
        "By the supplications of Thy most sacred prophets, the ever-memorable women, and the righteous of ages past, O Word, grant Thy mercies unto Thy world.",
        "O Word, Lord of the living and the dead, reckon among the choirs of all the saved Thy servants who have departed with faith, for Thou alone lovest mankind.",
        "All the desire of the martyrs was for the one Master, for they were united to Him in love and chanted: Bless the Lord, O ye works of the Lord!",
        "Having passed through the struggles of earth, the true martyrs received heavenly crowns, and without ceasing they cry unto Thee: Hymn the Lord, and exalt Him supremely for all ages!",
        "Descending into the nethermost pit, with Thy life-creating hand Thou didst raise up those who abide in the graves, and gavest rest unto Thy servants who reposed aforetime in faith, O Compassionate One."
      ],
      theotokion: "O Virgin Mary, Theotokos, who gavest birth to God, the Savior of men, in the body: Save those who with faith hymn and supremely exalt thine Offspring for all ages."
    },
    9: {
      irmos: "With unceasing glorification we magnify thee, the Mother of the Most High, who knewest not wedlock, who didst truly give birth unto God the Word in manner past understanding, and art more highly exalted than the all-pure hosts.",
      troparia: [
        "The martyrs stood before the unjust tribunals, condemning all injustice with the grace of Christ, rescuing those held fast by them, and receiving crowns of righteousness.",
        "Ye were shown to be pilots of the Church, piously steering the whole ship with the commandments of God, O all ye blessed primates and pastors. Wherefore, we honor you as our helmsmen.",
        "The council of the prophets and the venerable entreateth Thee, O Lord, and the company of women who suffered most splendidly and shone forth in asceticism, doth beseech Thee, O Thou Who lovest mankind: Grant us Thy compassions!",
        "O Merciful One, through the supplications of Thy saints vouchsafe that Thy servants, who have departed in faith from this vain world, may have a share in the honor and everlasting glory which all the saints of Christ have been granted.",
        "Possessed of invincible and unvanquishable might, O martyrs of Christ, ye set at nought the ungodly edicts of the tyrants and, enlightened by the rays of the Trinity, O right glorious ones, ye were manifestly vouchsafed the kingdom of heaven.",
        "Bitter hades was destroyed when Thou didst demolish it and didst raise up those who slept there from times past. O Compassionate One, in that Thou art good, vouchsafe Thy never-waning light to those who have now passed over to Thee."
      ],
      theotokion: "Save me, O Mother of God, who gavest birth to Christ my Savior, God and man, in two natures but a single Hypostasis: He is the only-begotten of the Father, and issued forth from thee as the firstborn of all creation. Him do we magnify in two natures."
    }
  }
}
        }

    }
}