// ── gc-canon-great-canon.js ───────────────────────────────────────────────────
// Great Canon of Saint Andrew of Crete (+740)
// Four stases appointed at Great Compline, First Week of Great Lent
// (Monday–Thursday evenings)
//
// Source: All Saints Eastern Orthodox Church English Triodion
//   https://st-sergius.org/services/triod/11.pdf (Monday)
//   https://st-sergius.org/services/triod/12.pdf (Tuesday)
//   https://st-sergius.org/services/triod/13.pdf (Wednesday)
//   https://st-sergius.org/services/triod/14.pdf (Thursday)
//
// Corpus contract:
//   window.GC_CANON_GREAT_CANON.evenings[dayName]
//     { label: string, text: string }  → corpus text populated
//     null                             → null sentinel (not yet populated)
//     key absent / file not loaded     → engine degrades to fixed-data rubric
// ─────────────────────────────────────────────────────────────────────────────

window.GC_CANON_GREAT_CANON = {
    evenings: {

        monday: {
            label: "Canon — Great Canon of Saint Andrew of Crete (Monday, First Stasis)",
            text: `THE GREAT CANON OF SAINT ANDREW OF CRETE
MONDAY OF THE FIRST WEEK — FIRST STASIS
Tone VI

ODE I
Irmos: A helper and a protector hath become unto me salvation. My God, whom I will glorify, the God of my fathers, and I will exalt Him for gloriously hath He been glorified.

Refrain: Have mercy on me, O God, have mercy on me.

How shall I begin to mourn the deeds of my wretched life? What can I offer as first-fruits of lamentation? In thy compassion, O Christ, grant me remission of sins.

Refrain: Have mercy on me, O God, have mercy on me.

Come, O my wretched soul, and with thy flesh confess thy sins to the creator of all. From this moment forsake thy former brutishness and offer to God tears of repentance.

Refrain: Have mercy on me, O God, have mercy on me.

My transgressions rival those of Adam the first formed man, and because of my sins I find myself stripped naked of God and of his everlasting kingdom of joy.

Refrain: Have mercy on me, O God, have mercy on me.

Woe to thee, my miserable soul, how thou art like the first Eve. Thou hast looked upon wickedness and wast grievously wounded by it; thou hast touched the tree and heedlessly tasted of its deceiving fruit.

Refrain: Have mercy on me, O God, have mercy on me.

Instead of the visible Eve, I have within my mind an "Eve" of passionate thought in my flesh, revealing to me that which seems sweet, but when I taste thereof I find it bitter.

Refrain: Have mercy on me, O God, have mercy on me.

For failing to observe just one of Thy commandments, O Savior, Adam was justly banished from Eden. What then shall I suffer? For I continually reject thy words of life?

Glory ...: O Trinity beyond all essence and worshiped in unity, take from me the heavy yoke of sin, and since Thou art compassionate, grant me tears of compunction.

Both now ...: O Theotokos, thou hope and protection of those who sing unto Thee, take from me the heavy yoke of sin and O Lady, as one pure, accept me in penitence.

ODE II
Irmos: Attend O heaven and I shall speak, and sing in praise of Christ, who from the virgin took flesh and came to dwell among us.

Refrain: Have mercy on me, O God, have mercy on me.

Attend, O heaven, and I shall speak. Give ear O earth, to the voice of one who repenteth before God and doth sing his praises.

Refrain: Have mercy on me, O God, have mercy on me.

Attend unto me O God my Savior, with Thine all-merciful eye, and accept my fervent tears of confession.

Refrain: Have mercy on me, O God, have mercy on me.

More than all mankind have I sinned; I alone have sinned against Thee. But do Thou have compassion, since Thou art God, O Savior, on me Thy creature.

Refrain: Have mercy on me, O God, have mercy on me.

Through my lustful desires I have formed within myself the deformity of the passions and disfigured the beauty of my mind.

Refrain: Have mercy on me, O God, have mercy on me.

The storm of sin surges about me, O compassionate Lord, as Thou didst once stretch out Thy hand to save Peter, so now reach out to me.

Refrain: Have mercy on me, O God, have mercy on me.

O Savior, I have defiled the garment of my flesh and defiled that which Thou hast fashioned within me according to Thine own image and likeness.

Refrain: Have mercy on me, O God, have mercy on me.

I have darkened the beauty of my soul with the lust of passions, and wholly corrupted every aspect of my mind.

Refrain: Have mercy on me, O God, have mercy on me.

Having rent asunder the garment which my creator hath fashioned for me in the beginning, I now lie naked.

Refrain: Have mercy on me, O God, have mercy on me.

Having clothed myself in the garment which the serpent hath woven for me, I am ashamed.

Refrain: Have mercy on me, O God, have mercy on me.

I offer unto Thee O Compassionate One the tears of the harlot, do Thou cleanse me O Savior according to Thy compassionate goodness.

Refrain: Have mercy on me, O God, have mercy on me.

The beauty of the tree, which I looked upon in the midst of the garden, hath deceived me, and I like naked and ashamed.

Refrain: Have mercy on me, O God, have mercy on me.

The ruling passions have ploughed deep upon my back; making long furrows of their wickedness.

Glory ...: O God of all, I sing of Thee as one in three hypostases, Father, Son and Holy Spirit.

Both now ...: O most pure Virgin Theotokos, who alone art praised everywhere, pray thou fervently that we may be saved.

ODE III
Irmos: Establish my thoughts, O Christ, on the unshakeable rock of thy commandments.

Refrain: Have mercy on me, O God, have mercy on me.

The Lord once caused fire to rain down from heaven, O my soul, and consumed the land of Sodom.

Refrain: Have mercy on me, O God, have mercy on me.

Upon the mountain shalt thou find salvation, O my soul!, as did Lot who took refuge in Zoar before it was too late.

Refrain: Have mercy on me, O God, have mercy on me.

Flee from the flames, O my soul! Flee from the burning heat of Sodom! Flee the destruction of the divine flame!

Refrain: Have mercy on me, O God, have mercy on me.

I alone have sinned against Thee more than all mankind; O Christ Savior forsake me not!

Refrain: Have mercy on me, O God, have mercy on me.

As Thou art the good shepherd, seek me Thy lamb which hath gone astray, and forget me not.

Refrain: Have mercy on me, O God, have mercy on me.

Thou art my sweet Jesus, Thou art my creator, in Thee shall I be justified O my Savior.

Refrain: Have mercy on me, O God, have mercy on me.

I confess to Thee, O Savior, that I have sinned, I have sinned against Thee without measure, but since Thou art compassionate and good, do Thou absolve and forgive me.

Glory ...: O God, Trinity in unity, save us from delusion, temptations and misfortune!

Both now ...: Rejoice, O womb which received God! Rejoice, O throne of the Lord! Rejoice, O mother of our life!

ODE IV
Irmos: The prophet heard of Thy coming, O Lord, and he was afraid. How wast Thou to be born of a virgin and appear unto mankind? and he said "I have heard report of Thee and I am afraid"; glory to Thy power, O Lord.

Refrain: Have mercy on me, O God, have mercy on me.

O righteous judge despise not Thy works, nor turn away from Thy creation, but in Thy compassion do Thou forgive me, even though as a man I have sinned more than all, for as the Lord of all, it is within Thy power to remit sins.

Refrain: Have mercy on me, O God, have mercy on me.

The end draweth near, O my soul! The end draweth near, yet thou dost not care or make ready. Arise! The time is short! The judge already standeth at the door, like a dream the days of our life pass as quickly as a flower. Why dost thou trouble thyself in vanity?

Refrain: Have mercy on me, O God, have mercy on me.

Awake, O my soul, consider the evil things thou hast done. Set them before thine eyes and allow thy tears to flow. Then with boldness confess thy deeds and thoughts to Christ, and so be justified.

Refrain: Have mercy on me, O God, have mercy on me.

There hath never been in life a sin, or deed, or wickedness that I have not committed, O Savior. I have sinned in my disposition, my thoughts, my words, and my deeds. There is none that hath sinned more than I.

Refrain: Have mercy on me, O God, have mercy on me.

For this I the wretched one, am condemned in the tribunal of my conscience where the judgment is more compelling than that of any on earth. O my judge, Who didst redeem me, Thou knowest my heart, spare, deliver and save me, Thy servant.

Refrain: Have mercy on me, O God, have mercy on me.

The ladder which long ago the great patriarch Jacob saw, is an example O my soul, of approach through action and ascent through knowledge. If thou dost will to live aright in action, in knowledge, and in contemplation, renew thy life.

Refrain: Have mercy on me, O God, have mercy on me.

The patriarch endured the burning heat of day, and the frost of night, enduring privation making daily gains of sheep and cattle, to gain his two wives.

Refrain: Have mercy on me, O God, have mercy on me.

By the two wives, we understand action, and knowledge in contemplation. Leah is action, for she bore many children, Rachel is knowledge for she endured great toil, for without toil O my soul, neither action, nor contemplation, will accomplish anything.

Glory ...: Undivided in Essence, uncommingled in Hypostasis, I confess Thee to be God: Triune Deity, co-enthroned and co-ruling; and to Thee I raise the great thrice-holy hymn that is sung on high.

Both now ...: Thou didst give birth and art yet a virgin, and in both thou didst remain by nature inviolate. He who is born maketh new the laws of nature, and the womb bringeth forth without travail. When God so willeth, the natural order is overcome: for He doeth whatsoever He doth will.

ODE V
Irmos: Out of the night I seek Thee early, enlighten me I pray Thee, O Lover of mankind, and guide me in Thy commandments, and teach me, O Savior, to do Thy will.

Refrain: Have mercy on me, O God, have mercy on me.

My whole life hath passed in the darkness of night, and hath shrouded me in a shadowy mist, but do Thou O Savior, make me now a son of the day.

Refrain: Have mercy on me, O God, have mercy on me.

Wretched as I am, I have followed the example of Reuben, and like him, devised a wicked and illegitimate plan against the most high God, defiling my bed as did he his father's.

Refrain: Have mercy on me, O God, have mercy on me.

I confess to Thee O Christ king, I have sinned, for like Joseph's brothers I have sold into slavery that which was chaste and pure.

Refrain: Have mercy on me, O God, have mercy on me.

The righteous soul was cast out by his brothers and sold into slavery, as an image of the Lord, whilst thou, O my soul, hast sold thyself to thine own wicked deeds.

Refrain: Have mercy on me, O God, have mercy on me.

O wretched one, imitate the righteous and chaste mind and blameless soul of Joseph, and defile not thyself in wantonness, led astray by thy disordered desires.

Refrain: Have mercy on me, O God, have mercy on me.

Once Joseph was cast into a pit, O Lord and Master, forming therein an image of Thy burial and resurrection. What offerings such as these shall I ever bring unto Thee?

Glory ...: We glorify Thee, O Trinity, one God, simple essence and unity, and we worship Thee forever singing, "Holy! Holy! Holy!" Father, Son and Holy Spirit.

Both now ...: O most pure Virgin Mother who knewest not a man, God the creator of all things became incarnate through thee, uniting Himself to our human nature.

ODE VI
Irmos: With my whole heart, I cried unto the all-compassionate God, and he heard me from the lowest depths of Hades; and raised up my life from corruption.

Refrain: Have mercy on me, O God, have mercy on me.

The tears and deepest sighings of my soul I sincerely offer unto Thee, O Savior, crying from the heart, "O God, I have sinned against Thee, do Thou cleanse me."

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast become a stranger to thy Lord, O my soul, like Dathan and Abiram, but cry "spare me" from the lowest depths of Hades, that the Earth not open and swallow thee as once it did them.

Refrain: Have mercy on me, O God, have mercy on me.

Rampaging like a heifer, O my soul, thou hast become like Ephraim, as an agile Hart flee the hunter's nets and save thy life, gaining wings with action, and contemplation.

Refrain: Have mercy on me, O God, have mercy on me.

Be assured O my soul, as God was able to cleanse the hands of Moses, he can also cleanse and whiten a leprous life. Therefore, despair not of thyself even though thou art indeed leprous.

Glory ...: "I am the Trinity, simple and undivided in Essence yet divided in Hypostasis. I am the Unity one in essence," sayeth the Father, the Son, and the divine Spirit.

Both now ...: Thy womb, O Theotokos, bore God who for our sakes was clothed in our likeness. Implore Him, the creator of all, that by thy prayers we may be found justified.

Kontakion, in Tone VI:
O My soul, O my soul, arise! Why dost thou sleep? The end draweth near, and thou shalt be confounded, awake then and be watchful that Christ thy God may spare thee, for He is everywhere present, and fillest all things.

ODE VII
Irmos: We have sinned, we have transgressed, and we have done evil before Thee. We have not kept nor followed Thy commandments, but reject us not utterly, O God of our fathers.

Refrain: Have mercy on me, O God, have mercy on me.

I have sinned, I have offended, I have rejected Thy commandments. I have increased in my sins and added wounds to my sores. But as Thou art compassionate, be merciful to me, O God of our fathers.

Refrain: Have mercy on me, O God, have mercy on me.

The secrets of my heart have I confessed to Thee, my judge. See my humility, see my distress, and attend unto my judgment now, and since Thou art compassionate, be merciful to me, O God of our fathers.

Refrain: Have mercy on me, O God, have mercy on me.

Saul lost his father's donkeys and found himself suddenly proclaimed king. Watch, O my soul, lest unbeknownst to thyself thou desirest thine animal appetites rather than the kingdom of Christ.

Refrain: Have mercy on me, O God, have mercy on me.

David the forefather of God, once sinned doubly, O my soul, pierced with the arrow of adultery, and with the lance, imprisoned by the anguish of murder. But thou art more anguished than he, through the desires of thy disordered self-will.

Refrain: Have mercy on me, O God, have mercy on me.

David, though once compounding his sins by adding murder to adultery, showed a twofold repentance of both. But thou, O my soul, hath done worse things than he, yet hath never repented of them before God.

Refrain: Have mercy on me, O God, have mercy on me.

David once showed us an image of repentance, writing in a psalm as if an Icon all that he had done and condemned it, crying "Be merciful to me for against Thee only have I sinned. O God of all, do Thou cleanse me."

Glory ...: O simple and undivided Trinity, one in essence and nature, Light and Lights, one Holy and three Holies, God; is praised as the Trinity. Therefore sing praises to Him, O my soul, and glorify the Life and Lives, the God of all.

Both now ...: We praise thee, we bless thee and we venerate thee, O Birthgiver of God, for from the undivided Trinity hast thou brought forth the only Son of God, opening unto us the heavenly realms on earth.

ODE VIII
Irmos: Him whom the hosts of heaven glorify, and before whom tremble the Cherubim and Seraphim, let every breath and all creation praise, bless, and supremely exalt, throughout all ages.

Refrain: Have mercy on me, O God, have mercy on me.

O Savior, I have sinned! Have mercy, awaken my mind to turn back to Thee, have compassion and accept me in repentance as I cry, "Against Thee only have I sinned and done evil - have mercy on me!"

Refrain: Have mercy on me, O God, have mercy on me.

The charioteer Elijah, once charioted the chariot of virtues into the heavens, high above all earthly things. Reflect, O my soul, on his ascent.

Refrain: Have mercy on me, O God, have mercy on me.

Elisha, inherited Elijah's mantle and a double portion of Grace was granted him from the Lord. But of this Grace, O my soul, thou hast no share, by reason of thy greed, and uncontrolled desires?

Refrain: Have mercy on me, O God, have mercy on me.

Elisha first struck the river Jordan with Elijah's mantle, and its flow was stopped on both sides. But thou, O my soul, hast no hope to share in such grace because of thy lack of abstinence?

Refrain: Have mercy on me, O God, have mercy on me.

The Shunammite woman gladly entertained the righteous Prophet (Elisha), but in thy house O my soul, thou hast not received stranger nor traveler, wherefore thou shalt find thyself cast from the bridal chamber, weeping.

Refrain: Have mercy on me, O God, have mercy on me.

The unclean thoughts of Gehazai dost thou ever imitate, O wretched soul, in thine old age, cast from thee his love of money. Flee the fire of Hades, and retreat from thy wickedness.

Let us bless the Father, Son, and Holy Spirit: the Lord!: O beginningless Father, co-eternal Son, and gracious Comforter, the Spirit of righteousness, Begetter of the Word of God, Word of the eternal Father, Spirit living and creative, O Trinity in unity, have mercy on me.

Both now ...: As from purple silk, O undefiled virgin, the spiritual robe of Emmanuel was woven within thy womb. Wherefore we proclaim thee to be the very Theotokos in truth.

ODE IX
Irmos: Ineffable is the birthgiving of a seedless conception, from a mother who knew not a man; an undefiled childbearing. For the birth of God hath renewed nature, wherefore all generations rightly worship and magnify thee as the Bride and Mother of God.

Refrain: Have mercy on me, O God, have mercy on me.

My mind is wounded, my body hath grown weak; and my spirit aileth within me. My speech hath lost its power. Life hath given way to death and the end draweth near. What then shalt thou do, O miserable soul, when the judge approacheth to examine thy deeds?

Refrain: Have mercy on me, O God, have mercy on me.

I have put before thee, O my soul, Moses' account of the creation, and after that, examples from the Old Testament of both the righteous and the unrighteous. But of these thou hast imitated the latter rather than the former and thereby sinned against thy God.

Refrain: Have mercy on me, O God, have mercy on me.

To thee, the law is enfeebled, the gospel is of no effect, the scriptures neglected, and words of the prophets fade away. Thy wounds O my soul have multiplied and there is no physician to heal thee.

Refrain: Have mercy on me, O God, have mercy on me.

Therefore, O my soul, to lead thee to contrition I will bring thee examples from the New Testament. Imitate the righteous and shun the ways of sinners, that through prayer, fasting, chastity, and reverence thou mayest win back the mercy of Christ.

Refrain: Have mercy on me, O God, have mercy on me.

Christ became a man calling to repentance both thieves and harlots. Repent, therefore, O my soul, for the doors of the kingdom now stand open and the Pharisees, Publicans and adulterers having changed their lives, enter in ahead of thee!

Refrain: Have mercy on me, O God, have mercy on me.

Christ became man, shared in my flesh and of his own free will endured everything that pertains to human nature, only without sin. Thereby setting before thee an example and image of his condescension.

Refrain: Have mercy on me, O God, have mercy on me.

Christ granted salvation to the Magi and summoned the shepherds; he revealed the multitude of infants to be martyrs, glorified the elder and the aged widow, but thou, O my soul, hast not imitated their lives and works. therefore, woe to thee when thou art judged!

Refrain: Have mercy on me, O God, have mercy on me.

The Lord fasted forty days in the wilderness, and hungered at the end thus revealing His human nature. Therefore, O my soul, be not dismayed if the enemy attacks thee, for it is only through prayer and fasting that he shall be driven away.

Glory ...: Let us glorify the Father, let us exalt the Son, and with faith let us worship the Holy Spirit of God, the indivisible Trinity and Unity in essence, Let us worship Light and Lights, the Life and Lives Who granteth light and life unto the ends of the Earth.

Both now ...: Watch over thy City O most pure Birthgiver of God, for through Thee she reigneth in faith, and by thee she is strengthened, and by thee she is victorious, overcoming every temptation, despoiling the enemy, and ruling her faithful subjects.

Refrain: Venerable father Andrew, pray to God for us.

O venerable Andrew, thrice-blessed father and pastor of Crete, cease not to offer prayer for those who sing thy praises, that all who faithfully honor thy memory may delivered from danger, distress, and from corruption and sin.

Katavasia: Ineffable is the birthgiving of a seedless conception, from a mother who knew not a man; an undefiled childbearing. For the birth of God hath renewed nature, wherefore all generations rightly worship and magnify thee as the Bride and Mother of God.`
        },

        tuesday: {
            label: "Canon — Great Canon of Saint Andrew of Crete (Tuesday, Second Stasis)",
            text: `THE GREAT CANON OF SAINT ANDREW OF CRETE
TUESDAY OF THE FIRST WEEK — SECOND STASIS
Tone VI

ODE I
Irmos: A helper and a protector hath become unto me salvation. My God, whom I will glorify, the God of my fathers, and I will exalt Him for gloriously hath He been glorified.

Refrain: Have mercy on me, O God, have mercy on me.

By mine own free choice I have incurred the guilt of Cain's murder. I have killed my conscience, bringing the flesh to life and making war upon the soul by my wicked actions.

Refrain: Have mercy on me, O God, have mercy on me.

O Jesus, I have not been like Abel in His righteousness. I have never offered Thee acceptable gifts or godly actions, a pure sacrifice, or an unblemished life.

Refrain: Have mercy on me, O God, have mercy on me.

O wretched soul, Like Cain, we have also offered to the Creator of all, defiled actions, a polluted sacrifice and a worthless life: wherefore also we are condemned.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast fashioned me, O my Maker and Redeemer and Judge, as one who moulds clay, giving me flesh and bones, breath and life. But do Thou accept me in repentance.

Refrain: Have mercy on me, O God, have mercy on me.

O Savior, I confess to Thee, the sins I have committed, the wounds of my soul and body, which murderous thoughts, like thieves, have inflicted upon me.

Refrain: Have mercy on me, O God, have mercy on me.

Though I have sinned, O Savior, yet I know that Thou lovest mankind. Thou dost chastise with mercy and art fervently compassionate. Thou seest me weeping and dost hasten to meet me, like the Father calling back the Prodigal Son.

Glory ...: O Trinity beyond all essence and worshiped in unity, take from me the heavy yoke of sin, and since Thou art compassionate, grant me tears of compunction.

Both now ...: O Theotokos, thou hope and protection of those who sing unto Thee, take from me the heavy yoke of sin and O Lady, as one pure, accept me in penitence.

ODE II
Irmos: Attend O heaven and I shall speak, and sing in praise of Christ, who from the virgin took flesh and came to dwell among us.

Refrain: Have mercy on me, O God, have mercy on me.

Sin hath stripped me of the robe that God once wove for me, and it hath sewn for me garments of skin.

Refrain: Have mercy on me, O God, have mercy on me.

I am clothed with the raiment of shame as with the leaves of the fig tree, in condemnation of my self-willed passions.

Refrain: Have mercy on me, O God, have mercy on me.

I am clad in a defiled garment, shamefully bloodstained by the flow of a passionate and self-indulgent life.

Refrain: Have mercy on me, O God, have mercy on me.

I have fallen under the burden of passions and the corruption of material things; and the enemy vexeth me.

Refrain: Have mercy on me, O God, have mercy on me.

I have lived a life of love for material things, lacking in abstinence, instead of one free from possessions, O Savior, and now I wear a heavy yoke.

Refrain: Have mercy on me, O God, have mercy on me.

I have adorned the image of my flesh with a many-colored coat of shameful thoughts, wherefore I am condemned.

Refrain: Have mercy on me, O God, have mercy on me.

Having cared only for outward adornment, I have neglected that which is within; the tabernacle fashioned in God's image.

Refrain: Have mercy on me, O God, have mercy on me.

I have buried with the passions the first beauty of the image, O Savior. But seek me, as once Thou didst seek the lost coin, and find me.

Refrain: Have mercy on me, O God, have mercy on me.

Like the Harlot I cry to Thee: I have sinned, I alone have sinned against Thee. Do Thou accept my tears as sweet myrrh, O Savior.

Refrain: Have mercy on me, O God, have mercy on me.

Like the Publican I cry to Thee: Be merciful, O Savior, be merciful to me. For no child of Adam hath ever sinned against Thee as I have sinned.

Glory ...: O God of all, I sing of Thee as one in three hypostases, Father, Son and Holy Spirit.

Both now ...: O most holy virgin Theotokos, who alone art praised everywhere, pray thou fervently that we may be saved.

ODE III
Irmos: O Lord, upon the rock of Thy commandments make firm my heart, for Thou alone art Holy and Lord.

Refrain: Have mercy on me, O God, have mercy on me.

Unto me Thou art the Fountain of life, and the Destroyer of death; and before the end I cry unto Thee from my heart: I have sinned, do Thou cleanse and save me.

Refrain: Have mercy on me, O God, have mercy on me.

I have sinned, O Lord, I have sinned against Thee, do Thou cleanse me. For there is none among men who have sinned, whom I have not surpassed in transgressions.

Refrain: Have mercy on me, O God, have mercy on me.

I have followed the example, O Savior, of those who, in the days of Noah, lived in wantonness; and like them I am condemned to drown in the Flood.

Refrain: Have mercy on me, O God, have mercy on me.

Thou, O my soul, hast followed after Ham, who mocked his father. Thou hast not covered thy neighbor's shame, by walking away with turned face.

Refrain: Have mercy on me, O God, have mercy on me.

Flee, O my soul, like Lot from the burning of sin; flee from Sodom and Gomorrah; flee from the flame of every unspeakable desire.

Refrain: Have mercy on me, O God, have mercy on me.

Have mercy, O Lord, have mercy on me, I cry unto Thee, who comest with Thine angels to give to every man what is due for his deeds.

Glory ...: O simple Unity praised in a Trinity of Hypostases, uncreated beginningless Essence, save us who in faith worship Thy power.

Both now ...: O Birthgiver of God, who without knowing a man hast given birth within time to a Son, who was begotten outside time from the Father; and, strange wonder! thou givest suck while remaining a Virgin.

ODE IV
Irmos: The prophet heard of Thy coming, O Lord, and he was afraid. How wast Thou to be born of a virgin and appear unto mankind? and he said "I have heard report of Thee and I am afraid"; glory to Thy power, O Lord.

Refrain: Have mercy on me, O God, have mercy on me.

O my soul, be watchful, be full of courage, like unto the great Patriarch, that thou mayest acquire action with knowledge, and be named Israel, "the mind that sees God"; and thus by contemplation reach the innermost darkness and gain great merchandise.

Refrain: Have mercy on me, O God, have mercy on me.

The great Patriarch begat the twelve Patriarchs as children, mystically establishing for thee, O my soul, a ladder of ascent through action, for in his wisdom he set his children as steps, by which thou canst ascend upwards.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast emulated Esau the despised, O my soul, and given the birthright of thy first beauty to the deceiver; thereby losing thy father's blessing, and in thy wretchedness thou hast been twice deceived, both in action and in knowledge, wherefore repent now.

Refrain: Have mercy on me, O God, have mercy on me.

Esau was called Edom because of his raging love for women; burning always with unrestrained desire and stained with the smear of sensual pleasure, he was named "Edom", which means the red-hot heat of a soul that loveth sin.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast heard, O my soul, of Job who was justified, but thou hast not imitated his fortitude. In all thine experiences, and trials, and temptations, thou hast not kept firmly to thy purpose but hast shown thyself to be inconsistent.

Refrain: Have mercy on me, O God, have mercy on me.

He formerly sat upon a throne, but now he sitteth upon a dung-hill, naked and covered with lesions. Once he was blessed with many children and admired by all, but suddenly he became childless, and homeless. Even so, he counted the dung-hill as a palace and his sores as pearls.

Glory ...: Undivided in Essence, uncommingled in Hypostasis, I confess Thee to be God: Triune Deity, co-enthroned and co-ruling; and to Thee I raise the great thrice-holy hymn that is sung on high.

Both now ...: Thou didst give birth and art yet a virgin, and in both thou didst remain by nature inviolate. He who is born maketh new the laws of nature, and the womb bringeth forth without travail. When God so willeth, the natural order is overcome: for He doeth whatsoever He wills.

ODE V
Irmos: Out of the night I seek Thee early, enlighten me I pray Thee, O Lover of mankind, and guide me in Thy commandments, and teach me, O Savior, to do Thy will.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast heard, O my soul, of the basket of Moses: how he was carried on the surging waves of the river as if in a tabernacle; and thus avoided the bitter execution of Pharaoh's decree.

Refrain: Have mercy on me, O God, have mercy on me.

If thou hast heard of the midwives who once killed in its infancy the manly action of chastity O wretched soul; then be like the great Moses, and be suckled on wisdom.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast not struck and killed the wretched mind, like Moses the great did to the Egyptian, O my soul. Tell me then, how canst thou go and dwell in the desert emptied of passions through repentance?

Refrain: Have mercy on me, O God, have mercy on me.

Moses the great went to dwell in the desert, come and seek to emulate his way of life, O my soul, that thou mayest attain to the vision of God in the bush.

Refrain: Have mercy on me, O God, have mercy on me.

Picture before thyself, O my soul, the rod of Moses striking the sea and making firm the deep by the sign of the divine Cross, by which thou canst also do great things.

Refrain: Have mercy on me, O God, have mercy on me.

Aaron offered to God a blameless and undefiled fire, but Hophni and Phinehas brought to Him, as hast thou O my soul, a strange fire and a defiled life.

Glory ...: We glorify Thee, O Trinity, one God, simple essence and unity, and we worship Thee forever singing, "Holy! Holy! Holy!" Father, Son and Holy Spirit.

Both now ...: O most pure Virgin Mother who knew not a man, God the creator of all things became incarnate through thee, uniting Himself to our human nature.

ODE VI
Irmos: With my whole heart, I cried unto the tenderly compassionate God, and he heard me from the lowest depths of Hades; and raised up my life from corruption.

Refrain: Have mercy on me, O God, have mercy on me.

The waves of my sins, O Savior, have returned and of a sudden engulfed me, as of old the waters of the Red Sea engulfed the Egyptians and their charioteers.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast made a foolish choice, O my soul, like Israel before thee; instead of manna from heaven, thou hast unreasonably shown a preference for the pleasure-loving gluttony of the passions.

Refrain: Have mercy on me, O God, have mercy on me.

The wells of Canaanitish thoughts, O my soul, hast thou prized more than the veined Rock from which floweth the river of Wisdom, like a chalice pouring forth streams of theology.

Refrain: Have mercy on me, O God, have mercy on me.

The meat of swine, the flesh-pots and foods of Egypt hast thou preferred, O my soul, to the manna from heaven, as did the ungrateful people of old in the desert wilderness.

Refrain: Have mercy on me, O God, have mercy on me.

When Thy servant Moses struck the rock with his rod, he prefigured Thy life-giving side, O Savior, from whence we all draw forth the water of life.

Refrain: Have mercy on me, O God, have mercy on me.

Search O my soul, like Joshua the son of Nun, and spy out the land of thine inheritance, and take up thy dwelling within it through the goodness of the law.

Glory ...: "I am the Trinity, simple and undivided in Essence yet divided in Hypostasis. I am the Unity one in essence," sayeth the Father, the Son, and the divine Spirit.

Both now ...: Thy womb, O Theotokos, bore God who for our sakes was clothed in our likeness. Implore Him, the creator of all, that by thy prayers we may be found justified.

Kontakion, in Tone VI:
O My soul, O my soul, arise! Why dost thou sleep? The end draweth near, and thou shalt be confounded, awake then and be watchful that Christ thy God may spare thee, for He is everywhere present, and fillest all things.

ODE VII
Irmos: We have sinned, we have transgressed, and we have done evil before Thee. We have not kept nor followed Thy commandments, but reject us not utterly, O God of our fathers.

Refrain: Have mercy on me, O God, have mercy on me.

The Ark was being carried in a carriage, and when the ox stumbled, it was no more than touched, and invoked the wrath of God. O my soul, flee from such presumption and with reverence have respect for divine things.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast heard of Absalom; how he rebelled against what is natural; thou knowest the unholy deeds by which he defiled his father David's bed, but nevertheless thou hast imitated him in his passionate and sensual-loving desires.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast made thy free dignity subject to the flesh; for having found in thine enemy another Ahitophel, O my soul, thou hast acquiesced to his counsels. But Christ Himself hath nullified them, and redeemed thee from all of them.

Refrain: Have mercy on me, O God, have mercy on me.

Solomon the wonderful, who was full of the grace of wisdom, once committed wickedness in the sight of God and turned away from Him. By thine accursed life O my soul, thou hast become like him.

Refrain: Have mercy on me, O God, have mercy on me.

Consumed by sensual passions, he defiled himself, The zealot of wisdom hath became a zealot of prodigal women and a stranger to God. Woe is me! O my soul, thou hast noetically imitated him, defiling thyself with polluted desires.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast imitated Rehoboam, who paid no attention to his father's counselors, and Jeroboam, that evil servant and betrayer of old. O my soul, flee from their example and cry unto God: "I have sinned, have compassion upon me."

Glory ...: O simple and undivided Trinity, one in essence and nature, Light and Lights, one Holy and three Holies, God; is praised as the Trinity. Therefore sing praises to Him, O my soul, and glorify the Life and Lives, the God of all.

Both now ...: We praise thee, we bless thee and we venerate thee, O Birthgiver of God, for from the undivided Trinity hast thou brought forth the only Son of God, opening unto us the heavenly realms on earth.

ODE VIII
Irmos: Him whom the hosts of heaven glorify, and before whom tremble the Cherubim and Seraphim, let every breath and all creation praise, bless, and supremely exalt, throughout all ages.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast emulated Uzziah, O my soul, and hast twofold the leprosy he had: for thy thoughts are futile, and thy deeds unlawful. Leave what thou hast, and hasten to repentance.

Refrain: Have mercy on me, O God, have mercy on me.

O my soul, thou hast heard how the men of Nineveh repented before God in sackcloth and ashes. Thou hast not imitated them, but rather art more wicked than all who have sinned before the Law, and after the Law.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast heard, O my soul, how Jeremiah cried lamenting for the city of Zion while in the muddy pit, seeking tears. Follow then, his life of lamentation and be saved.

Refrain: Have mercy on me, O God, have mercy on me.

Jonah fled to Tarshish, foreseeing the conversion of the men of Nineveh; for as a prophet he knew the compassionate goodness of God, and was jealous that his prophecy should not be proved wrong.

Refrain: Have mercy on me, O God, have mercy on me.

O my soul, thou hast heard how Daniel stopped the mouths of the wild beasts in the pit; and thou knowest how the Children with Azarias, by their faith quenched the flames of the fiery furnace.

Refrain: Have mercy on me, O God, have mercy on me.

All the names of the Old Testament have I set before thee, O my soul, as examples. Emulate the god-loving deeds of the righteous and flee from the sins of the wicked.

Let us bless the Father, Son, and Holy Spirit: the Lord!: O beginningless Father, co-eternal Son, and gracious Comforter, the Spirit of righteousness, Begetter of the Word of God, Word of the eternal Father, Spirit living and creative, O Trinity in unity, have mercy on me.

Both now ...: As from purple silk, O undefiled virgin, the spiritual robe of Emmanuel was woven within thy womb. Wherefore we proclaim thee to be the Theotokos in truth.

ODE IX
Irmos: Ineffable is the birthgiving of a seedless conception, from a mother who knew not a man; an undefiled childbearing. For the birth of God hath renewed nature, wherefore all generations rightly worship and magnify thee as the Bride and Mother of God.

Refrain: Have mercy on me, O God, have mercy on me.

Christ was being tempted, tempted by the devil O my soul, who showed Him the stones that they might be made bread, and led Him up into a mountain, to see all the kingdoms of the world in an instant. O my soul, look with fear on what happened; watch and pray every hour to God.

Refrain: Have mercy on me, O God, have mercy on me.

The gentle Dove who loved the desert wilderness, the voice of one crying aloud, the Lamp of Christ, preached repentance; but Herod sinned with Herodias. O my soul, watch that thou be not trapped in the snares of the lawless ones, rather, embrace repentance.

Refrain: Have mercy on me, O God, have mercy on me.

The Forerunner of Grace went to dwell in the desert wilderness, and Judaea and all Samaria hastened to hear him; they confessed their sins and were eagerly baptized. But thou, O my soul, hast not imitated them.

Refrain: Have mercy on me, O God, have mercy on me.

Marriage is honorable, and the marriage-bed undefiled, for on both Christ hath given His blessing, eating in the flesh at the wedding in Cana, turning the water into wine, and revealing His first miracle, that thou, O my soul, may change thy life.

Refrain: Have mercy on me, O God, have mercy on me.

Christ healed the paralyzed man, and he took up his bed; He raised from the dead the young man, the son of the widow, and the centurion's child-servant; He appeared to the woman of Samaria and spoke to thee, O my soul, of worship in spirit.

Refrain: Have mercy on me, O God, have mercy on me.

The Lord healed the woman with an issue of blood, through the touching of the hem of His garment; He cleansed lepers, and restored the blind and the lame to health; He cured the deaf and the dumb, and the woman bowed to the ground, by His word, that thou, O wretched soul, may be brought to salvation.

Glory ...: Let us glorify the Father, let us exalt the Son, and with faith let us worship the Holy Spirit of God, the indivisible Trinity and Unity in essence, Let us worship Light and Lights, the Life and Lives Who granteth light and life unto the ends of the Earth.

Both now ...: Watch over thy City O most pure Birthgiver of God, for through Thee she reigneth in faith, and by thee she is strengthened, and by thee she is victorious, overcoming every temptation, despoiling the enemy, and ruling her faithful subjects.

Refrain: Venerable father Andrew, pray to God for us.

O venerable Andrew, thrice-blessed father and pastor of Crete, cease not to offer prayer for those who sing thy praises, that all who faithfully honor thy memory may be delivered from danger, distress, and from corruption and sin.

Katavasia: Ineffable is the birthgiving of a seedless conception, from a mother who knew not a man; an undefiled childbearing. For the birth of God hath renewed nature, wherefore all generations rightly worship and magnify thee as the Bride and Mother of God.`
        },

        wednesday: {
            label: "Canon — Great Canon of Saint Andrew of Crete (Wednesday, Third Stasis)",
            text: `THE GREAT CANON OF SAINT ANDREW OF CRETE
WEDNESDAY OF THE FIRST WEEK — THIRD STASIS
Tone VI

ODE I
Irmos: A helper and a protector hath become unto me salvation. My God, whom I will glorify, the God of my fathers, and I will exalt Him for gloriously hath He been glorified.

Refrain: Have mercy on me, O God, have mercy on me.

O Savior, from my youth I have rejected Thy commandments, and ruled by the passions, I have passed my whole life in slothfulness. Wherefore I cry to Thee, O Savior, even now at the end: do Thou Save me.

Refrain: Have mercy on me, O God, have mercy on me.

As an outcast I lie before Thy gate, O Savior. In my old age cast me not down empty into Hades; but, before the end cometh, as the Lover of mankind, grant me remission of sins.

Refrain: Have mercy on me, O God, have mercy on me.

I have wasted the substance of my soul in prodigal living, O Savior, and am left bereft of the fruit of the virtues, and in hunger I cry out: O merciful Father, come out quickly to meet me and have compassion upon me.

Refrain: Have mercy on me, O God, have mercy on me.

I am like the man who fell among thieves - my own thoughts - and they, having covered my entire body with wounds, have left me beaten and bruised. But do Thou come to me, O Christ my Savior, and heal me.

Refrain: Have mercy on me, O God, have mercy on me.

The Priest saw me first, but passed by on the other side; the Levite looked on me in my distress but despised my nakedness. O Jesus, sprung from Mary, do Thou come to me and take pity on me.

Refrain: Holy Mother Mary, pray to God for us.

Grant me the radiant light of grace, from God's noetic providence, that I may flee from the darkness of the passions and sing fervently the spiritually beautiful tale of thy life, O Mary.

Glory ...: O Trinity beyond all essence and worshiped in unity, take from me the heavy yoke of sin, and since Thou art compassionate, grant me tears of compunction.

Both now ...: O Theotokos, thou hope and protection of those who sing to Thee, take from me the heavy yoke of sin O Lady, and as one pure, accept me in penitence.

ODE II
Irmos: Attend O heaven and I shall speak, and sing in praise of Christ, who from the virgin took flesh and came to dwell among us.

Refrain: Have mercy on me, O God, have mercy on me.

Like David I have fallen in lust, and defiled myself: but wash me clean O Savior, with my tears.

Refrain: Have mercy on me, O God, have mercy on me.

I have no tears, I have no repentance, nor compunction: But do Thou Thyself grant me these, as Thou art God.

Refrain: Have mercy on me, O God, have mercy on me.

I have lost the beauty and glory with which I was first created and now I lie naked and ashamed.

Refrain: Have mercy on me, O God, have mercy on me.

Lord, O Lord, at the last Day, shut not Thy door against me; but open it to me, for I repent before Thee.

Refrain: Have mercy on me, O God, have mercy on me.

Give ear to the sighing of my soul, and accept the tears that fall from mine eyes O Lord, and save me, O Lover of mankind, who desirest that all should be saved, in Thy goodness call me back and accept me in repentance.

Refrain: Most Holy Theotokos, save us.

O Theotokos undefiled, all-praised Virgin, intercede fervently that we may be saved.

Irmos in Tone V: Behold now, and see that I am God, Who by My right hand and by My power alone rained down manna in the days of old, and made springs of water flow from the barren rock, for My people in the wilderness.

Refrain: Have mercy on me, O God, have mercy on me.

"See now, see that I am God": hearken, my soul, to the Lord as he crieth to thee; forsake thy former sin, and do thou, as one unclean, fear Him as thy Judge and God.

Refrain: Have mercy on me, O God, have mercy on me.

To whom shall I liken thee, O greatly sinful soul? Only to the firstborn Cain and Lamech. For thou hast stoned thy body with thy wicked deeds, and killed thy mind with thine unspeakable desires.

Refrain: Have mercy on me, O God, have mercy on me.

Call to remembrance all those who lived before the Law, O my soul, for thou hast not emulated Seth, nor followed Enos, nor Enoch, who was translated to heaven, nor Noah; rather, thou art destitute of the life of the righteous.

Refrain: Have mercy on me, O God, have mercy on me.

Thou alone, O my soul, hast opened the floodgates of the wrath of thy God, and flooded, as once was the earth, all thy flesh and deeds and life; and thus remained outside the Ark of salvation.

Refrain: Venerable Mother Mary, pray to God for us.

With all eagerness and love didst thou run to Christ, turning from thy former path of sin, finding thy food in the trackless desert, and fulfilling in purity the divine commandments.

Glory ...: Trinity uncreated and without beginning, O undivided Unity: accept me in repentance and save me, a sinner. I am Thy creation, reject me not; but spare me and deliver me from the fire of condemnation.

Both now ...: Most pure Lady, Birthgiver of God, the hope of those who run to thee and the haven of the storm-tossed: pray to the merciful God, thy Creator and thy Son, that He may grant His mercy even to me.

ODE III
Irmos: O Lord, upon the rock of Thy commandments make firm my heart, for Thou alone art Holy and Lord.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast not inherited the blessing of Shem, O wretched soul, nor hast thou received, like Japhet, a place in the land of forgiveness.

Refrain: Have mercy on me, O God, have mercy on me.

Depart from the land of Haran, O my soul, depart from sin, and come to the land that Abraham inherited, which floweth with incorruption and eternal life.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast heard, O my soul, how in days of old, Abraham left his fatherland and became a wanderer: emulate him in his choice.

Refrain: Have mercy on me, O God, have mercy on me.

At the oak of Mamre the Patriarch was hospitable to the angels, and he inherited the reward of the promise in his old age.

Refrain: Have mercy on me, O God, have mercy on me.

O my wretched soul, thou knowest how Isaac was mystically offered as a new whole burnt offering to the Lord: emulate him in his choice.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast heard O my soul, how Ishmael was driven out as the child of a bondwoman. Take heed and be watchful, lest the same thing happen to thee because of thy lustful heart.

Refrain: Venerable Mother Mary, pray to God for us.

I am held captive by the tempest and billows of sin: but do thou O Mother, ever keep me safe and lead me to the haven of divine repentance.

Refrain: Venerable Mother Mary, pray to God for us.

The supplication of a servant of God, O venerable mother, do thou offer to the Compassionate Theotokos, and by thine intercessions open unto me the divine entranceway.

Glory ...: O simple Unity praised in a Trinity of Hypostases, uncreated beginningless Essence, save us who in faith worship Thy power.

Both now ...: O Birthgiver of God, who without knowing a man hast given birth within time to a Son, who was begotten outside time from the Father; and, strange wonder! thou givest suck while remaining a Virgin.

ODE IV
Irmos: The prophet heard of Thy coming, O Lord, and he was afraid. How wast Thou to be born of a virgin and appear unto mankind? and he said "I have heard report of Thee and I am afraid"; glory to Thy power, O Lord.

Refrain: Have mercy on me, O God, have mercy on me.

I have defiled my body, my spirit is stained, and I am covered all over with wounds: but do Thou O Christ, as the physician, heal both through repentance. Wash, purify and cleanse me, O my Savior, and show me to be whiter than snow.

Refrain: Have mercy on me, O God, have mercy on me.

Thy Body, and Blood, O Word, didst Thou lay down at Thy Crucifixion on behalf of all: Thy Body to restore me, Thy Blood to cleanse me; and Thy spirit didst Thou offer up, O Christ, to bring me back to Thy Father.

Refrain: Have mercy on me, O God, have mercy on me.

Thou hast wrought salvation in the midst of the earth O compassionate One, that we might be saved. Of Thine own will Thou wast crucified upon the Tree; and Eden, closed till then, was opened. Things above and those below, creation and all peoples, have thereby been saved and worship Thee.

Refrain: Have mercy on me, O God, have mercy on me.

May the Blood from Thy side be to me a cleansing fount, and may the water that floweth with it be a drink of forgiveness. May I be purified by both, anointed and refreshed, O Word, having as chrism and drink Thy words flowing with life.

Refrain: Have mercy on me, O God, have mercy on me.

The Church hath been granted Thy life-giving side as a chalice from which floweth unto us a twofold stream of forgiveness and knowledge, representing the two Covenants, the Old and the New, O our Savior.

Refrain: Have mercy on me, O God, have mercy on me.

I have been deprived of the bridal chamber, I have been deprived of the wedding and the supper; for want of oil my lamp hath gone out and while I slept the door to the bridal chamber hath been shut; the supper hath been eaten; and I have been bound hand and foot, and cast out.

Glory ...: Undivided in Essence, uncommingled in Hypostasis, I confess Thee to be God: Triune Deity, co-enthroned and co-ruling; and to Thee I raise the great thrice-holy hymn that is sung on high.

Both now ...: Thou didst give birth and art yet a virgin, and in both thou didst remain by nature inviolate. He who is born maketh new the laws of nature, and the womb bringeth forth without travail. When God so willeth, the natural order is overcome; for He doeth whatsoever He wills.

ODE V
Irmos: Out of the night I seek Thee early, enlighten me I pray Thee, O Lover of mankind, and guide me in Thy commandments, and teach me, O Savior, to do Thy will.

Refrain: Have mercy on me, O God, have mercy on me.

My will is heavy, O Master, and my mind hath been engulfed, I have become like the cruel magicians of Pharaoh, Jannes and Jambres, in soul and body, but do Thou help me.

Refrain: Have mercy on me, O God, have mercy on me.

I the wretched one, have defiled my mind with filth, but I beseech Thee, O Master; wash me clean in the waters of my tears, and make the garment of my flesh white as snow.

Refrain: Have mercy on me, O God, have mercy on me.

If I examine mine actions, O Savior, I see that I exceed all mankind in sin; for I fully understand what I have done, and was not sinning in ignorance.

Refrain: Have mercy on me, O God, have mercy on me.

Spare, O spare, Thy creature, O Lord, I have sinned, forgive me, for Thou alone art pure by nature, and none save Thee is without defilement.

Refrain: Have mercy on me, O God, have mercy on me.

For my sake, Thou who art God was fashioned as I am, and in that form, hast manifest miracles, healed lepers, given strength to the paralyzed, and stopped the issue of blood when the woman, O Savior, touched the hem of Thy garment.

Refrain: Venerable Mother Mary, pray to God for us.

Crossing the stream of the Jordan, thou didst find tranquil peace, having escaped the pleasures of the flesh; by thine intercessions do thou also deliver us from them, O venerable one.

Glory ...: We glorify Thee, O Trinity, one God, simple essence and unity, and we worship Thee forever singing, "Holy! Holy! Holy!" Father, Son and Holy Spirit.

Both now ...: O most pure Virgin Mother who knew not a man, God the creator of all things became incarnate through thee, uniting Himself to our human nature.

ODE VI
Irmos: With my whole heart, I cried unto the tenderly compassionate God, and he heard me from the lowest depths of Hades; and raised up my life from corruption.

Refrain: Have mercy on me, O God, have mercy on me.

Rise up and make war, as did Joshua against Amalek, against the passions of the flesh, ever gaining the victory over the Gibeonites, thy deceitful thoughts.

Refrain: Have mercy on me, O God, have mercy on me.

Traverse the flowing waters of time, as did the Ark of old, and take possession of the promised land: for God thus commandeth thee, O my soul.

Refrain: Have mercy on me, O God, have mercy on me.

As Thou didst save Peter who cried out, "save me", do Thou come quickly, O Savior, before it is too late, and save me from the beast. Stretch out Thine hand and lead me up from the abyss of sin.

Refrain: Have mercy on me, O God, have mercy on me.

O Lord, I know Thee to be a tranquil haven; come quickly, O Lord Christ, and deliver me from the lowest depths of sin and despair.

Glory ...: "I am the Trinity, simple and undivided in Essence yet divided in Hypostasis. I am the Unity one in essence," sayeth the Father, the Son, and the divine Spirit.

Both now ...: Thy womb, O Theotokos, bore God who for our sakes wast clothed in our likeness. Implore Him, the creator of all, that by thy prayers we may be found justified.

Kontakion, in Tone VI:
O My soul, O my soul, arise! Why dost thou sleep? The end draweth near, and thou shalt be confounded, awake then and be watchful that Christ thy God may spare thee, for He is everywhere present, and fillest all things.

ODE VII
Irmos: We have sinned, we have transgressed, and we have done evil before Thee. We have not kept nor followed Thy commandments, but reject us not utterly, O God of our fathers.

Refrain: Have mercy on me, O God, have mercy on me.

Consciously hast thou incurred the guilt of Manasseh, setting up the passions as an abomination and multiplying, O my soul, indignations. But do thou fervently emulate his repentance and acquire compunction.

Refrain: Have mercy on me, O God, have mercy on me.

Woe is me, O my soul! Thou hast imitated Ahab in defilement. Thou hast become a dwelling-place of the pollutions of the flesh and a disgraceful vessel of the passions. But sighing from the depths of thy soul, tell thy sins to God.

Refrain: Have mercy on me, O God, have mercy on me.

Heaven is closed to thee, O my soul, and a famine from God hath seized thee, as when Ahab was not attentive to the words of Elijah the Tishbite. But be like the widow of Zarephat and feed the soul of the Prophet.

Refrain: Have mercy on me, O God, have mercy on me.

Elijah of old twice destroyed with fire fifty of Jezebel's servants, and slew the prophets of shame, as a rebuke to Ahab. But flee from the example of both of them, O my soul, and strengthen thyself.

Glory ...: O simple and undivided Trinity, one in essence and nature, Light and Lights, one Holy and three Holies, God; is praised as the Trinity. Therefore sing praises to Him, O my soul, and glorify the Life and Lives, the God of all.

Both now ...: We praise thee, we bless thee and we venerate thee, O Birthgiver of God, for from the undivided Trinity hast thou brought forth the only Son of God, opening unto us the heavenly realms on earth.

ODE VIII
Irmos: Him whom the hosts of heaven glorify, and before whom tremble the Cherubim and Seraphim, let every breath and all creation praise, bless, and supremely exalt, throughout all ages.

Refrain: Have mercy on me, O God, have mercy on me.

O righteous Judge and Savior, have mercy on me and deliver me from the fire, and from the punishment that I rightly deserve at the judgment. Before the end, grant me remission of sins through virtue and repentance.

Refrain: Have mercy on me, O God, have mercy on me.

Like the Thief I cry to Thee. "Remember me"; like Peter I weep bitterly; like the Publican I cry aloud, "Forgive me, O Savior"; I weep as did the Harlot, do Thou accept my lamentation, as once Thou didst the entreaties of the woman of Canaan.

Refrain: Have mercy on me, O God, have mercy on me.

Heal, O Savior, the corruption of my humbled soul, for Thou alone art the Physician of souls, apply plaster and pour in oil and wine: the works of repentance, and compunction with tears.

Refrain: Have mercy on me, O God, have mercy on me.

The woman of Canaan do I imitate, and cry to Thee, "Have mercy on me, O Son of David", and like the woman with an issue of blood, I touch the hem of Thy garment, and I weep as did Martha and Mary for Lazarus.

Let us bless the Father, Son, and Holy Spirit: the Lord!: O beginningless Father, co-eternal Son, and gracious Comforter, the Spirit of righteousness, Begetter of the Word of God, Word of the eternal Father, Spirit living and creative, O Trinity in unity, have mercy on me.

Both now ...: As from purple silk, O undefiled virgin, the spiritual robe of Emmanuel was woven within thy womb. Wherefore we proclaim thee to be the Theotokos in truth.

ODE IX
Irmos: Ineffable is the birthgiving of a seedless conception, from a mother who knew not a man; an undefiled childbearing. For the birth of God hath renewed nature, wherefore all generations rightly worship and magnify thee as the Bride and Mother of God.

Refrain: Have mercy on me, O God, have mercy on me.

Healing infirmities, preaching good tidings to the poor, Christ the Word cured cripples, ate with publicans, and conversed with sinners. He brought back the departed soul of Jairus' daughter with the touch of His hand.

Refrain: Have mercy on me, O God, have mercy on me.

The Publican was saved, and the Harlot converted to a chaste life, but the Pharisee was condemned with his boasting. For the first cried out "be merciful", and the second, "Have mercy on me"; but the third said boasting, "I thank Thee, O God", and other words of madness.

Refrain: Have mercy on me, O God, have mercy on me.

Zacchaeus was a publican, yet he was saved; but Simon the Pharisee went astray, whilst the Harlot received remission and release from Him who hath the power to forgive sins. Make haste, O my soul, to follow her example.

Refrain: Have mercy on me, O God, have mercy on me.

The Harlot, O my wretched soul, hast thou not followed; she who took the alabaster box of ointment, and anointed with tears the feet of the Lord wiping them with her hair, whereupon He shred the record of her previous sins.

Refrain: Have mercy on me, O God, have mercy on me.

The cities in which Christ preached the Gospel, O my soul, were cursed, as thou dost well know. Fear their example, lest it be the same with thee. For the Master likened them to Sodom and condemned them to Hades.

Refrain: Have mercy on me, O God, have mercy on me.

Be not overwhelmed by despair, O my soul; for thou hast heard of the faith of the woman of Canaan, by it her daughter was healed by the Word of God. Do thou cry out from the depth of thy soul "save me also, O Son of David", as she so cried to Christ.

Glory ...: Let us glorify the Father, let us exalt the Son, and with faith let us worship the Holy Spirit of God, the indivisible Trinity and Unity in essence, Let us worship Light and Lights, the Life and Lives Who granteth light and life unto the ends of the Earth.

Both now ...: Watch over thy City O most pure Birthgiver of God, for through Thee she reigneth in faith, and by thee she is strengthened, and by thee she is victorious, overcoming every temptation, despoiling the enemy, and ruling her faithful subjects.

Refrain: Venerable father Andrew, pray to God for us.

O venerable Andrew, thrice-blessed father and pastor of Crete, cease not to offer prayer for those who sing thy praises, that all who faithfully honor thy memory may be delivered from danger, distress, and from corruption and sin.

Katavasia: Ineffable is the birthgiving of a seedless conception, from a mother who knew not a man; an undefiled childbearing. For the birth of God hath renewed nature, wherefore all generations rightly worship and magnify thee as the Bride and Mother of God.`
        },

        thursday: {
            label: "Canon — Great Canon of Saint Andrew of Crete (Thursday, Fourth Stasis)",
            text: `THE GREAT CANON OF SAINT ANDREW OF CRETE
THURSDAY OF THE FIRST WEEK — FOURTH STASIS
Tone VI

ODE I
Irmos: A helper and a protector hath become unto me salvation. My God, whom I will glorify, the God of my fathers, and I will exalt Him for gloriously hath He been glorified.

Refrain: Have mercy on me, O God, have mercy on me.

O Lamb of God, that takest away the sins of all, take from me the heavy yoke of sin, and since Thou art compassionate, grant me tears of compunction.

Refrain: Have mercy on me, O God, have mercy on me.

I fall down before Thee O Jesus: I have sinned against Thee, be merciful to me. Take from me the heavy yoke of sin, and since Thou art compassionate, grant me tears of compunction.

Refrain: Have mercy on me, O God, have mercy on me.

Enter not into judgment with me, setting before me things I have done, examining my words, and correcting my disordered impulses. But according to Thine abundant compassion, overlook my wickedness, and save me O Almighty One.

Refrain: Have mercy on me, O God, have mercy on me.

It is the time for repentance, wherefore I come to Thee, my Creator. Take from me the heavy yoke of sin, and since Thou art compassionate, grant me tears of compunction.

Refrain: Have mercy on me, O God, have mercy on me.

As the Prodigal, O Savior, I have wasted the substance of my soul in sin, and I am barren of the virtues of holiness. In my hunger I cry: O Giver of mercy, come out quickly to meet me and take pity on me.

Refrain: Holy Mother Mary, pray to God for us.

Bowing before the divine laws of Christ, thou didst draw near to Him, and having forsaken the unbridled lust of sensual pleasure; in the fear of God thou didst attain unto all the God-pleasing virtues as if one.

Glory ...: O Trinity beyond all essence and worshiped in unity, take from me the heavy yoke of sin, and since Thou art compassionate, grant me tears of compunction.

Both now ...: O Theotokos, thou hope and protection of those who sing unto Thee, take from me the heavy yoke of sin and O Lady, as one pure, accept me in penitence.

ODE II
Irmos: Behold now, and see that I am God, Who by My right hand and by My power alone rained down manna in the days of old, and made springs of water flow from the barren rock, for My people in the wilderness.

Refrain: Have mercy on me, O God, have mercy on me.

"I have slain a man to my grief and wounding, and a young man to my detriment" cried Lamech lamenting; dost thou not tremble O my soul, for thou hast defiled thy flesh and polluted thy mind?

Refrain: Have mercy on me, O God, have mercy on me.

Skillfully didst thou plan to build a tower, O my soul, and establish a stronghold for thy wanton lusts; had the Creator not confounded thy designs and dashed thy crafty plans to the ground.

Refrain: Have mercy on me, O God, have mercy on me.

O how I have emulated Lamech, the murderer, slaying my soul as it were a man, and my mind as it were a young man, and as Cain the murderer killed his brother, so have I killed my body with sensual desires.

Refrain: Have mercy on me, O God, have mercy on me.

The Lord once rained down fire from heaven and burnt up those who dwelt in Sodom, roused to anger by their transgressions. And thou, O my soul, hast kindled within the fire of Gehenna, and there shalt thou burn.

Refrain: Have mercy on me, O God, have mercy on me.

I have been assaulted and wounded; behold, the arrows of the enemy which have pierced my soul and body; behold the lesions, the sores and injuries, which cry to God on behalf of the wounds of my freely-chosen passions.

Refrain: Venerable Mother Mary, pray to God for us.

Thou didst lift up thine hands to the compassionate God O Mary, having sunk into the abyss of sin, and, as once He did to Peter, so also in His love for mankind, He stretched forth His hand to help thee, in every way seeking thy conversion.

Glory ...: Trinity uncreated and without beginning, O undivided Unity: accept me in repentance and save me, a sinner. I am Thy creation, reject me not; but spare me and deliver me from the fire of condemnation.

Both now ...: O most pure Lady, Birthgiver of God, the hope of those who run to thee and the haven of the storm-tossed: pray to the merciful God, thy Creator and thy Son, that He may grant His mercy even to me.

ODE III
Irmos: O Lord, upon the rock of Thy commandments make firm my heart, for Thou alone art Holy and Lord.

Refrain: Have mercy on me, O God, have mercy on me.

O my soul, thou hast become like Hagar the Egyptian: thy free choice hath become enslaved, and thou hast borne a new Ishmael, stubbornness.

Refrain: Have mercy on me, O God, have mercy on me.

Thou knowest, O my soul, how the ladder that was shown to Jacob, reached from earth to heaven. Why hast thou not provided a firm foundation for such a passage through piety?

Refrain: Have mercy on me, O God, have mercy on me.

The priest of God, the king set apart, whose life was an image of Christ among men in the world, do thou emulate him.

Refrain: Have mercy on me, O God, have mercy on me.

Turn back, wretched soul, and lament, before the fairground of life cometh to an end, before the Lord shutteth the door of the bridal chamber.

Refrain: Have mercy on me, O God, have mercy on me.

Be not turned into a pillar of salt O my soul, looking back: Fear the example of the people of Sodom, and find salvation in the mount of Zoar.

Refrain: Have mercy on me, O God, have mercy on me.

Reject not, O Master, the prayer of those who sing Thy praises, but in Thy loving-kindness be merciful and grant forgiveness to them that ask with faith.

Glory ...: O simple Unity praised in a Trinity of Hypostases, uncreated beginningless Essence, save us who in faith worship Thy power.

Both now ...: O Birthgiver of God, who without knowing a man hast given birth within time to a Son, who was begotten outside time from the Father; and, strange wonder! thou givest suck while remaining a Virgin.

ODE IV
Irmos: The prophet heard of Thy coming, O Lord, and he was afraid. How wast Thou to be born of a virgin and appear unto mankind? and he said "I have heard report of Thee and I am afraid"; glory to Thy power, O Lord.

Refrain: Have mercy on me, O God, have mercy on me.

The time of my life is short, and filled with illness and wickedness. But accept me in repentance and call me back to knowledge, that I not become the possession and food of the enemy; but do Thou, O Savior, have compassion upon me.

Refrain: Have mercy on me, O God, have mercy on me.

A man of great wealth and righteousness, abounding in riches and livestock, clothed in royal dignity, in a crown and purple robe, Job was suddenly stripped of wealth, glory and kingship, and became a beggar.

Refrain: Have mercy on me, O God, have mercy on me.

If he who was righteous and blameless above all men did not escape the snares and pits of the deceiver, what wilt thou do, O wretched and sin-loving soul, when some sudden misfortune befalleth thee?

Refrain: Have mercy on me, O God, have mercy on me.

Now I speak boastfully, with boldness of heart; but to no avail and in vain, may I not be condemned with the Pharisee, but rather grant me the humility of the Publican, O righteous Judge, who alone art compassionate, and number me with him.

Refrain: Have mercy on me, O God, have mercy on me.

I know, O compassionate One, that I have sinned and violated the vessel of my body. But accept me in repentance and call me back to knowledge. Let me not become the possession and food of the enemy; but do Thou, O Savior, have compassion upon me.

Refrain: Have mercy on me, O God, have mercy on me.

I have become mine own idol, utterly defiling my soul with the passions, O compassionate One. But accept me in repentance and call me back to knowledge. Let me not become the possession and food of the enemy; but do Thou, O Savior, have compassion upon me.

Refrain: Have mercy on me, O God, have mercy on me.

I have not hearkened to Thy voice, I have not heeded Thy Scripture, O Giver of the Law. But accept me in repentance and call me back to divine knowledge. Let me not become the possession and food of the enemy; but do Thou, O Savior, have pity on me.

Refrain: Venerable Mother Mary, pray to God for us.

Having descended into an abyss of great iniquity, thou was not held captive therein: but with better thinking didst gloriously ascend the heights of virtue through action, and the angelic orders, O Mary, were amazed.

Glory ...: Undivided in Essence, uncommingled in Hypostasis, I confess Thee to be God: Triune Deity, co-enthroned and co-ruling; and to Thee I raise the great thrice-holy hymn that is sung on high.

Both now ...: Thou didst give birth and art yet a virgin, and in both thou didst remain by nature inviolate. He who is born maketh new the laws of nature, and the womb bringeth forth without travail. When God so willeth, the natural order is overcome: for He doeth whatsoever He wills.

ODE V
Irmos: Out of the night I seek Thee early, enlighten me I pray Thee, O Lover of mankind, and guide me in Thy commandments, and teach me, O Savior, to do Thy will.

Refrain: Have mercy on me, O God, have mercy on me.

Imitate the woman who was bowed down to the ground, O my soul; come and fall down at the feet of Jesus, that He may make thee straight again; and thou shalt walk upright upon the paths of the Lord.

Refrain: Have mercy on me, O God, have mercy on me.

As Thou art a deep well, O Master; flow forth unto me water from Thy pure veins, that like the woman of Samaria I may drink thereof and thirst no more; for from Thee floweth the streams of life.

Refrain: Have mercy on me, O God, have mercy on me.

May my tears be to me like the pool of Siloam, O Master and Lord, that I also may cleanse the eyes of my heart, and with my mind behold Thee, the pre-eternal Light.

Refrain: Venerable Mother Mary, pray to God for us.

With an incomparable and exceedingly rich love, thou didst desire to venerate the wood of the Cross, and wast deemed worthy to fulfill thy desire. Make me also worthy to attain the glory on high.

Glory ...: We glorify Thee, O Trinity, one God, simple essence and unity, and we worship Thee forever singing, "Holy! Holy! Holy!" Father, Son and Holy Spirit.

Both now ...: O most pure Virgin Mother who kneweth not a man, God the creator of all things became incarnate through thee, uniting Himself to our human nature.

ODE VI
Irmos: With my whole heart, I cried unto the tenderly compassionate God, and he heard me from the lowest depths of Hades; and raised up my life from corruption.

Refrain: Have mercy on me, O God, have mercy on me.

I am like the coin, O Savior, marked with the likeness of the King, which of old Thou didst lose. But light Thy lamp, O Word, Thy Fore-runner, and seek and find Thine image again.

Refrain: Have mercy on me, O God, have mercy on me.

Rise up and make war, as did Joshua against Amalek, against the passions of the flesh, ever gaining the victory over the Gibeonites, thy deceitful thoughts.

Refrain: Venerable mother Mary, pray to God for us.

Thou didst ceaselessly shed streams of tears, and with thy soul afire, quenched the burning of the passions O Mary, grant also unto me thy servant, the grace of these thy tears.

Refrain: Venerable mother Mary, pray to God for us.

Thou didst attain to heavenly passionlessness, through the perfection of thy life on earth, O Mother, wherefore we hymn thee, and beseech thee to intercede on our behalf, that we may be delivered from the passions.

Glory ...: "I am the Trinity, simple and undivided in Essence yet divided in Hypostasis. I am the Unity one in essence," sayeth the Father, the Son, and the divine Spirit.

Both now ...: Thy womb, O Theotokos, bore God who for our sakes was clothed in our likeness. Implore Him, the creator of all, that by thy prayers we may be found justified.

Kontakion, in Tone VI:
O My soul, O my soul, arise! Why dost thou sleep? The end draweth near, and thou shalt be confounded, awake then and be watchful that Christ thy God may spare thee, for He is everywhere present, and fillest all things.

ODE VII
Irmos: We have sinned, we have transgressed, and we have done evil before Thee. We have not kept nor followed Thy commandments, but reject us not utterly, O God of our fathers.

Refrain: Have mercy on me, O God, have mercy on me.

Like a dream of one awakening my days have vanished; wherefore, like Hezekiah, I weep upon my bed, that years may be added to my life. But what Isaiah will come to help, O my soul, except the God of all?

Refrain: Have mercy on me, O God, have mercy on me.

I fall down before Thee, and bring to Thee my words as tears. I have sinned as never did the Harlot, and I have transgressed as no other man on earth. But have compassion upon Thy creature, O Master, and call me back.

Refrain: Have mercy on me, O God, have mercy on me.

I have buried Thine image and broken Thy commandment. All my beauty hath been destroyed O Savior, and my lamp hath been quenched by the passions, but have compassion upon me, as David once sang, and "restore to me Thy joy."

Refrain: Have mercy on me, O God, have mercy on me.

Turn back, repent, uncover thine hidden things, and tell God, before whom all things are known; "Thou alone knowest my secrets, O only Savior; have mercy on me", as David once sang, "according to Thy mercy."

Refrain: Venerable mother Mary, pray to God for us.

Raising thy lament to the most pure Mother of God, thou didst first drive away the fury of the passions which, of necessity, assailed thee, then didst thou put the enemy to shame. Do thou ever grant help to me thy suffering servant.

Refrain: Venerable mother Mary, pray to God for us.

To Him whom thou hast loved, and whom thou didst desire, and for whose sake thou didst wear out thy flesh, O venerable one, to Christ pray now on behalf of us thy servants, that He may be merciful to us all, and grant a peaceful life to those who with honor worship Him.

Glory ...: O simple and undivided Trinity, one in essence and nature, Light and Lights, one Holy and three Holies, God; is praised as the Trinity. Therefore sing praises to Him, O my soul, and glorify the Life and Lives, the God of all.

Both now ...: We praise thee, we bless thee and we venerate thee, O Birthgiver of God, for from the undivided Trinity hast thou brought forth the only Son of God, opening unto us the heavenly realms on earth.

ODE VIII
Irmos: Him whom the hosts of heaven glorify, and before whom tremble the Cherubim and Seraphim, let every breath and all creation praise, bless, and supremely exalt, throughout all ages.

Refrain: Have mercy on me, O God, have mercy on me.

O Savior, I pour out upon Thine head as precious oil, the alabaster box of my tears, and like the Harlot, I cry out to Thee, seeking Thy mercy: I bring my prayer to Thee and ask of Thee forgiveness.

Refrain: Have mercy on me, O God, have mercy on me.

None hath sinned against Thee as I; yet accept even me, O compassionate and good Savior, for I repent in fear and cry with love: Against Thee only have I sinned; I have transgressed, have mercy on me O merciful one.

Refrain: Have mercy on me, O God, have mercy on me.

Spare, O Savior thy creature, and as a shepherd seeketh the lost sheep that hath gone astray, do Thou snatch me from the wolf and make me a nursling in the pasture of Thine own flock.

Refrain: Have mercy on me, O God, have mercy on me.

When Thou the Judge sittest upon Thy throne, since Thou art compassionate, Thou wilt reveal Thy fearful glory, O Savior, what fear there shall be then! When the furnace burns with fire, and all shrink back in fear before Thy Judgment-seat.

Refrain: Venerable mother Mary, pray to God for us.

The Mother of the never-setting Light illumined thee and delivered thee from the darkness of the passions. Since thou hast recourse to the grace of the Spirit, O Mary, enlighten those who praise thee with faith.

Refrain: Venerable mother Mary, pray to God for us.

Upon beholding in thee a wonder truly strange and new, Zosimas was struck with amazement, O Mother. For he saw an angel in the body and filled with astonishment, he praiseth Christ throughout the ages.

Let us bless the Father, Son, and Holy Spirit: the Lord!: O beginningless Father, co-eternal Son, and gracious Comforter, the Spirit of righteousness, Begetter of the Word of God, Word of the eternal Father, Spirit living and creative, O Trinity in unity, have mercy on me.

Both now ...: As from purple silk, O undefiled virgin, the spiritual robe of Emmanuel was woven within thy womb. Wherefore we proclaim thee to be the Theotokos in truth.

ODE IX
Irmos: Ineffable is the birthgiving of a seedless conception, from a mother who knew not a man; an undefiled childbearing. For the birth of God hath renewed nature, wherefore all generations rightly worship and magnify thee as the Bride and Mother of God.

Refrain: Have mercy on me, O God, have mercy on me.

Have mercy on me and save me O Son of David, Thou who with Thy word didst heal the possessed. Let me hear Thy compassionate voice speak unto me as to the thief: "Verily, I say unto thee thou shalt be with Me in Paradise, when I come in My glory."

Refrain: Have mercy on me, O God, have mercy on me.

One thief accused Thee, the other thief confessed Thy Divinity: for both were hanging beside Thee on the Cross. Open to me also, O compassionate One, the door of Thy glorious Kingdom, as once it was opened to the thief who with faith confessed Thee to be God.

Refrain: Have mercy on me, O God, have mercy on me.

Creation shuddered, upon seeing Thee crucified. Mountains and rocks were split from fear, the earth quaked, and Hades was despoiled; the light of day grew dark, at beholding Thee, O Jesus, nailed to the Cross.

Refrain: Have mercy on me, O God, have mercy on me.

Demand not from me fruits worthy of repentance, for my strength hath failed within me. Grant me an ever-contrite heart and poverty of spirit, that I may offer these unto Thee as an acceptable sacrifice, O only Savior.

Refrain: Have mercy on me, O God, have mercy on me.

O my Judge, who knowest me well, when Thou comest again with the angels to judge the whole world, look upon me then with Thy merciful eye and spare me, and have compassion upon me, O Jesus, for I have sinned beyond that of any other man.

Refrain: Venerable mother Mary, pray to God for us.

Thou hast struck all with wonder, by thy strange and wonderful way of life, both the ranks of angels and the race of mankind; for having surpassed nature thou didst live as though immaterial, traversing the Jordan with thy feet like that of a bodiless angel, O Mary.

Refrain: Venerable mother Mary, pray to God for us.

Call down the gracious mercy of the Creator upon us who sing thy praises, O venerable Mother, that we may be delivered from the sufferings and afflictions that beset us; that without ceasing, we may magnify the Lord who hath glorified thee.

Refrain: Venerable father Andrew, pray to God for us.

O venerable Andrew, thrice-blessed father and pastor of Crete, ceaselessly offer prayer on behalf of those who sing thy praises, that all who faithfully honor thy memory may be delivered from danger, distress, and from corruption and sin.

Glory ...: Let us glorify the Father, let us exalt the Son, and with faith let us worship the Holy Spirit of God, the indivisible Trinity and Unity in essence, Let us worship Light and Lights, the Life and Lives Who granteth light and life unto the ends of the Earth.

Both now ...: Watch over thy City O most pure Birthgiver of God, for through Thee she reigneth in faith, and by thee she is strengthened, and by thee she is victorious, overcoming every temptation, despoiling the enemy, and ruling her faithful subjects.

Katavasia: Ineffable is the birthgiving of a seedless conception, from a mother who knew not a man; an undefiled childbearing. For the birth of God hath renewed nature, wherefore all generations rightly worship and magnify thee as the Bride and Mother of God.`
        }

    }
};
