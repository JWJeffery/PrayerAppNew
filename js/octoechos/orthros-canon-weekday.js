/* Orthros — Weekday Canon (Octoechos)
 *
 * Namespace : window.OCTOECHOS.orthros.canon.weekday.tones
 *
 * Key contract
 *   tones[tone][day]
 *     tone : 1–8  (Octoechos tone)
 *     day  : 1=Monday  2=Tuesday  3=Wednesday  4=Thursday  5=Friday  6=Saturday
 *   Each slot is either a structured canon entry object (with metadata + odes)
 *   or explicit null (placeholder, not yet authored).
 *
 * Live status
 *   Tone 1          : all six day slots fully populated
 *   Tone 2, day 1   : fully populated
 *   Tone 2, days 2–6: null
 *   Tones 3–8       : null grids (all six day slots null)
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
      tone: 2,
      day: 1,
      dayName: "Monday"
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
            2: null,
            3: null,
            4: null,
            5: null,
            6: null
        },

        4: {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null
        },

        5: {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null
        },

        6: {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null
        },

        7: {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null
        },

        8: {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null
        }

    }
}