// js/octoechos/gc-canon-great-canon.js
// Great Canon of Saint Andrew of Crete — Great Compline corpus scaffold
// Horologion v7.2
//
// Corpus contract: window.GC_CANON_GREAT_CANON.evenings[dayName]
//   dayName: "monday" | "tuesday" | "wednesday" | "thursday"
//   value: null (sentinel — text not yet transcribed) OR
//          { label: string, text: string }
//
// The engine (_getGcCanonGreatCanon in horologion-engine.js) probes this object
// in the isFirstWeekOfLent branch of the gc-canon routing block and degrades
// to the gc-canon-great-canon rubric slot in great-compline-fixed.json when
// the sentinel is null. No engine redesign will be required when corpus text
// is added: replace null with { label: "...", text: "..." } for that evening.
//
// Usage at Great Compline (first week of Great Lent):
//   Monday evening:    approximately Odes 1–3 (portion I)
//   Tuesday evening:   approximately Odes 4–6 (portion II)
//   Wednesday evening: approximately Odes 7–8 (portion III)
//   Thursday evening:  approximately Odes 9 + closing (portion IV)
// Exact division follows the Lenten Triodion (Faber & Faber / Mother Mary & Ware).
//
// Source target for transcription: Great Canon of Saint Andrew of Crete,
// as found in the Lenten Triodion (trans. Mother Mary & Archimandrite Kallistos Ware).
// DO NOT populate with fabricated or unverified text.
// Friday and Saturday are not appointed for the Great Canon at Great Compline;
// those keys are intentionally absent from this object.

window.GC_CANON_GREAT_CANON = {
    evenings: {
        "monday": {
            label: "Great Canon of Saint Andrew of Crete — Monday of the First Week (Odes I–IX)",
            text: `ODE I, In Tone VI:

Irmos: A helper and a protector * hath become unto me salvation. * My God, whom I will glorify, * the God of my fathers, * and I will exalt Him * for gloriously hath He been glorified.

Have mercy on me, O God, have mercy on me.

How shall I begin to mourn the deeds of my wretched life? What can I offer as first-fruits of lamentation? In thy compassion, O Christ, grant me remission of sins.

Have mercy on me, O God, have mercy on me.

Come, O my wretched soul, and with thy flesh confess thy sins to the creator of all. From this moment forsake thy former brutishness and offer to God tears of repentance.

Have mercy on me, O God, have mercy on me.

My transgressions rival those of Adam the first formed man, and because of my sins I find myself stripped naked of God and of his everlasting kingdom of joy.

Have mercy on me, O God, have mercy on me.

Woe to thee, my miserable soul, how thou art like the first Eve. Thou hast looked upon wickedness and wast grievously wounded by it; thou hast touched the tree and heedlessly tasted of its deceiving fruit.

Have mercy on me, O God, have mercy on me.

Instead of the visible Eve, I have within my mind an "Eve" of passionate thought in my flesh, revealing to me that which seems sweet, but when I taste thereof I find it bitter.

Have mercy on me, O God, have mercy on me.

For failing to observe just one of Thy commandments, O Savior, Adam was justly banished from Eden. What then shall I suffer? For I continually reject thy words of life?

Glory...: O Trinity beyond all essence and worshiped in unity, take from me the heavy yoke of sin, and since Thou art compassionate, grant me tears of compunction.

Both now...: O Theotokos, thou hope and protection of those who sing unto Thee, take from me the heavy yoke of sin and O Lady, as one pure, accept me in penitence.

ODE II

Irmos: Attend O heaven and I shall speak, * and sing in praise of Christ, * who from the virgin took flesh and came to dwell among us.

Have mercy on me, O God, have mercy on me.

Attend, O heaven, and I shall speak. Give ear O earth, to the voice of one who repenteth before God and doth sing his praises.

Have mercy on me, O God, have mercy on me.

Attend unto me O God my Savior, with Thine all-merciful eye, and accept my fervent tears of confession.

Have mercy on me, O God, have mercy on me.

More than all mankind have I sinned; I alone have sinned against Thee. But do Thou have compassion, since Thou art God, O Savior, on me Thy creature.

Have mercy on me, O God, have mercy on me.

Through my lustful desires I have formed within myself the deformity of the passions and disfigured the beauty of my mind.

Have mercy on me, O God, have mercy on me.

The storm of sin surges about me, O compassionate Lord, as Thou didst once stretch out Thy hand to save Peter, so now reach out to me.

Have mercy on me, O God, have mercy on me.

O Savior, I have defiled the garment of my flesh and defiled that which Thou hast fashioned within me according to Thine own image and likeness.

Have mercy on me, O God, have mercy on me.

I have darkened the beauty of my soul with the lust of passions, and wholly corrupted every aspect of my mind.

Have mercy on me, O God, have mercy on me.

Having rent asunder the garment which my creator hath fashioned for me in the beginning, I now lie naked.

Have mercy on me, O God, have mercy on me.

Having clothed myself in the garment which the serpent hath woven for me, I am ashamed.

Have mercy on me, O God, have mercy on me.

I offer unto Thee O Compassionate One the tears of the harlot, do Thou cleanse me O Savior according to Thy compassionate goodness.

Have mercy on me, O God, have mercy on me.

The beauty of the tree, which I looked upon in the midst of the garden, hath deceived me, and I like naked and ashamed.

Have mercy on me, O God, have mercy on me.

The ruling passions have ploughed deep upon my back; making long furrows of their wickedness.

Glory...: O God of all, I sing of Thee as one in three hypostases, Father, Son and Holy Spirit.

Both now...: O most pure Virgin Theotokos, who alone art praised everywhere, pray thou fervently that we may be saved.

ODE III

Irmos: Establish my thoughts, * O Christ, * on the unshakeable rock of thy commandments.

Have mercy on me, O God, have mercy on me.

The Lord once caused fire to rain down from heaven, O my soul, and consumed the land of Sodom.

Have mercy on me, O God, have mercy on me.

Upon the mountain shalt thou find salvation, O my soul!, as did Lot who took refuge in Zoar before it was too late.

Have mercy on me, O God, have mercy on me.

Flee from the flames, O my soul! Flee from the burning heat of Sodom! Flee the destruction of the divine flame!

Have mercy on me, O God, have mercy on me.

I alone have sinned against Thee More than all mankind; O Christ Savior forsake me not!

Have mercy on me, O God, have mercy on me.

As Thou art the good shepherd, seek me Thy lamb which hath gone astray, and forget me not.

Have mercy on me, O God, have mercy on me.

Thou art my sweet Jesus, Thou art my creator, in Thee shall I be justified O my Savior.

Have mercy on me, O God, have mercy on me.

I confess to Thee, O Savior, that I have sinned, I have sinned against Thee without measure, but since Thou art compassionate and good, do Thou absolve and forgive me.

Glory...: O God, Trinity in unity, save us from delusion, temptations and misfortune!

Both now...: Rejoice, O womb which received God! Rejoice, O throne of the Lord! Rejoice, O mother of our life!

ODE IV

Irmos: The prophet heard * of Thy coming, O Lord, * and he was afraid. * How wast Thou to be born of a virgin * and appear unto mankind? * and he said * "I have heard report of Thee and I am afraid"; * glory to Thy power, O Lord.

Have mercy on me, O God, have mercy on me.

O righteous judge despise not Thy works, nor turn away from Thy creation, but in Thy compassion do Thou forgive me, even though as a man I have sinned more than all, for as the Lord of all, it is within Thy power to remit sins.

Have mercy on me, O God, have mercy on me.

The end draweth near, O my soul! The end draweth near, yet thou dost not care or make ready. Arise! The time is short! The judge already standeth at the door, like a dream the days of our life pass as quickly as a flower. Why dost thou trouble thyself in vanity?

Have mercy on me, O God, have mercy on me.

Awake, O my soul, consider the evil things thou hast done. Set them before thine eyes and allow thy tears to flow. Then with boldness confess thy deeds and thoughts to Christ, and so be justified.

Have mercy on me, O God, have mercy on me.

There hath never been in life a sin, or deed, or wickedness that I have not committed, O Savior. I have sinned in my disposition, my thoughts, my words, and my deeds. There is none that hath sinned more than I.

Have mercy on me, O God, have mercy on me.

For this I the wretched one, am condemned in the tribunal of my conscience where the judgment is more compelling than that of any on earth. O my judge, Who didst redeem me, Thou knowest my heart, spare, deliver and save me, Thy servant.

Have mercy on me, O God, have mercy on me.

The ladder which long ago the great patriarch Jacob saw, is an example O my soul, of approach through action and ascent through knowledge. If thou dost will to live aright in action, in knowledge, and in contemplation, renew thy life.

Have mercy on me, O God, have mercy on me.

The patriarch endured the burning heat of day, and the frost of night, enduring privation making daily gains of sheep and cattle, to gain his two wives.

Have mercy on me, O God, have mercy on me.

By the two wives, we understand action, and knowledge in contemplation; Leah is action, for she bore many children, Rachel is knowledge for she endured great toil, for without toil O my soul, neither action, nor contemplation, will accomplish anything.

Glory...: Undivided in Essence, uncommingled in Hypostasis, I confess Thee to be God: Triune Deity, co-enthroned and co-ruling; and to Thee I raise the great thrice-holy hymn that is sung on high.

Both now...: Thou didst give birth and art yet a virgin, and in both thou didst remain by nature inviolate. He who is born maketh new the laws of nature, and the womb bringeth forth without travail. When God so willeth, the natural order is overcome: for He doeth whatsoever He doth will.

ODE V

Irmos: Out of the night I seek Thee early, * enlighten me I pray Thee, O Lover of mankind, * and guide me in Thy commandments, * and teach me, O Savior, * to do Thy will.

Have mercy on me, O God, have mercy on me.

My whole life hath passed in the darkness of night, and hath shrouded me in a shadowy mist, but do Thou O Savior, make me now a son of the day.

Have mercy on me, O God, have mercy on me.

Wretched as I am, I have followed the example of Reuben, and like him, devised a wicked and illegitimate plan against the most high God, defiling my bed as did he his father's.

Have mercy on me, O God, have mercy on me.

I confess to Thee O Christ king, I have sinned, for like Joseph's brothers I have sold into slavery that which was chaste and pure.

Have mercy on me, O God, have mercy on me.

The righteous soul was cast out by his brothers and sold into slavery, as an image of the Lord, whilst thou, O my soul, hast sold thyself to thine own wicked deeds.

Have mercy on me, O God, have mercy on me.

O wretched one, imitate the righteous and chaste mind and blameless soul of Joseph, and defile not thyself in wantonness, led astray by thy disordered desires.

Have mercy on me, O God, have mercy on me.

Once Joseph was cast into a pit, O Lord and Master, forming therein an image of Thy burial and resurrection. What offerings such as these shall I ever bring unto Thee?

Glory...: We glorify Thee, O Trinity, one God, simple essence and unity, and we worship Thee forever singing, "Holy! Holy! Holy!" Father, Son and Holy Spirit.

Both now...: O most pure Virgin Mother who knewest not a man, God the creator of all things became incarnate through thee, uniting Himself to our human nature.

ODE VI

Irmos: With my whole heart, I cried * unto the all-compassionate God, * and he heard me * from the lowest depths of Hades; * and raised up my life from corruption.

Have mercy on me, O God, have mercy on me.

The tears and deepest sighings of my soul I sincerely offer unto Thee, O Savior, crying from the heart, "O God, I have sinned against Thee, do Thou cleanse me."

Have mercy on me, O God, have mercy on me.

Thou hast become a stranger to thy Lord, O my soul, like Dathan and Abiram, but cry "spare me" from the lowest depths of Hades, that the Earth not open and swallow thee as once it did them.

Have mercy on me, O God, have mercy on me.

Rampaging like a heifer, O my soul, thou hast become like Ephraim, as an agile Hart flee the hunter's nets and save thy life, gaining wings with action, and contemplation.

Have mercy on me, O God, have mercy on me.

Be assured O my soul, as God was able to cleanse the hands of Moses, he can also cleanse and whiten a leprous life. Therefore, despair not of thyself even though thou art indeed leprous.

Glory...: "I am the Trinity, simple and undivided in Essence yet divided in Hypostasis. I am the Unity one in essence," sayeth the Father, the Son, and the divine Spirit.

Both now...: Thy womb, O Theotokos, bore God who for our sakes was clothed in our likeness. Implore Him, the creator of all, that by thy prayers we may be found justified.

Kontakion, in Tone VI: O My soul, O my soul, * arise! Why dost thou sleep? * The end draweth near, and thou shalt be confounded, * awake then and be watchful * that Christ thy God may spare thee, ** for He is everywhere present, and fillest all things.

ODE VII

Irmos: We have sinned, we have transgressed, * and we have done evil before Thee. * We have not kept nor followed * Thy commandments, but reject us not utterly, * O God of our fathers.

Have mercy on me, O God, have mercy on me.

I have sinned, I have offended, I have rejected Thy commandments. I have increased in my sins and added wounds to my sores. But as Thou art compassionate, be merciful to me, O God of our fathers.

Have mercy on me, O God, have mercy on me.

The secrets of my heart have I confessed to Thee, my judge. See my humility, see my distress, and attend unto my judgment now, and since Thou art compassionate, be merciful to me, O God of our fathers.

Have mercy on me, O God, have mercy on me.

Saul lost his father's donkeys and found himself suddenly proclaimed king. Watch, O my soul, lest unbeknownst to thyself thou desirest thine animal appetites rather than the kingdom of Christ.

Have mercy on me, O God, have mercy on me.

David the forefather of God, once sinned doubly, O my soul, pierced with the arrow of adultery, and with the lance, imprisoned by the anguish of murder. But thou art more anguished than he, through the desires of thy disordered self-will.

Have mercy on me, O God, have mercy on me.

David, though once compounding his sins by adding murder to adultery, showed a twofold repentance of both. But thou, O my soul, hath done worse things than he, yet hath never repented of them before God.

Have mercy on me, O God, have mercy on me.

David once showed us an image of repentance, writing in a psalm as if an Icon all that he had done and condemned it, crying "Be merciful to me for against Thee only have I sinned. O God of all, do Thou cleanse me."

Glory...: O simple and undivided Trinity, one in essence and nature, Light and Lights, one Holy and three Holies, God; is praised as the Trinity. Therefore sing praises to Him, O my soul, and glorify the Life and Lives, the God of all.

Both now...: We praise thee, we bless thee and we venerate thee, O Birthgiver of God, for from the undivided Trinity hast thou brought forth the only Son of God, opening unto us the heavenly realms on earth.

ODE VIII

Irmos: Him whom the hosts of heaven glorify, * and before whom tremble the Cherubim and Seraphim, * let every breath and all creation * praise, bless, and supremely exalt, * throughout all ages.

Have mercy on me, O God, have mercy on me.

O Savior, I have sinned! Have mercy, awaken my mind to turn back to Thee, have compassion and accept me in repentance as I cry, "Against Thee only have I sinned and done evil - have mercy on me!"

Have mercy on me, O God, have mercy on me.

The charioteer Elijah, once charioted the chariot of virtues into the heavens, high above all earthly things. Reflect, O my soul, on his ascent.

Have mercy on me, O God, have mercy on me.

Elisha, inherited Elijah's mantle and a double portion of Grace was granted him from the Lord. But of this Grace, O my soul, thou hast no share, by reason of thy greed, and uncontrolled desires?

Have mercy on me, O God, have mercy on me.

Elisha first struck the river Jordan with Elijah's mantle, and its flow was stopped on both sides. But thou, O my soul, hast no hope to share in such grace because of thy lack of abstinence?

Have mercy on me, O God, have mercy on me.

The Shunammite woman gladly entertained the righteous Prophet (Elisha), but in thy house O my soul, thou hast not received stranger nor traveler, wherefore thou shalt find thyself cast from the bridal chamber, weeping.

Have mercy on me, O God, have mercy on me.

The unclean thoughts of Gehazai dost thou ever imitate, O wretched soul, in thine old age, cast from thee his love of money. Flee the fire of Hades, and retreat from thy wickedness.

Let us bless the Father, Son, and Holy Spirit: the Lord!

O beginningless Father, co-eternal Son, and gracious Comforter, the Spirit of righteousness, Begetter of the Word of God, Word of the eternal Father, Spirit living and creative, O Trinity in unity, have mercy on me.

Both now...: As from purple silk, O undefiled virgin, the spiritual robe of Emmanuel was woven within thy womb. Wherefore we proclaim thee to be the very Theotokos in truth.

ODE IX

Irmos: Ineffable is the birthgiving * of a seedless conception, * from a mother who knew not a man; * an undefiled childbearing. * For the birth of God hath renewed nature, * wherefore all generations rightly worship and magnify thee * as the Bride and Mother of God.

Have mercy on me, O God, have mercy on me.

My mind is wounded, my body hath grown weak; and my spirit aileth within me. My speech hath lost its power. Life hath given way to death and the end draweth near. What then shalt thou do, O miserable soul, when the judge approacheth to examine thy deeds?

Have mercy on me, O God, have mercy on me.

I have put before thee, O my soul, Moses' account of the creation, and after that, examples from the Old Testament of both the righteous and the unrighteous. But of these thou hast imitated the latter rather than the former and thereby sinned against thy God.

Have mercy on me, O God, have mercy on me.

To thee, the law is enfeebled, the gospel is of no effect, the scriptures neglected, and words of the prophets fade away. Thy wounds O my soul have multiplied and there is no physician to heal thee.

Have mercy on me, O God, have mercy on me.

Therefore, O my soul, to lead thee to contrition I will bring thee examples from the New Testament. Imitate the righteous and shun the ways of sinners, that through prayer, fasting, chastity, and reverence thou mayest win back the mercy of Christ.

Have mercy on me, O God, have mercy on me.

Christ became a man calling to repentance both thieves and harlots. Repent, therefore, O my soul, for the doors of the kingdom now stand open and the Pharisees, Publicans and adulterers having changed their lives, enter in ahead of thee!

Have mercy on me, O God, have mercy on me.

Christ became man, shared in my flesh and of his own free will endured everything that pertains to human nature, only without sin. Thereby setting before thee an example and image of his condescension.

Have mercy on me, O God, have mercy on me.

Christ granted salvation to the Magi and summoned the shepherds; he revealed the multitude of infants to be martyrs, glorified the elder and the aged widow, but thou, O my soul, hast not imitated their lives and works. therefore, woe to thee when thou art judged!

Have mercy on me, O God, have mercy on me.

The Lord fasted forty days in the wilderness, and hungered at the end thus revealing His human nature. Therefore, O my soul, be not dismayed if the enemy attacks thee, for it is only through prayer and fasting that he shall be driven away.

Glory...: Let us glorify the Father, let us exalt the Son, and with faith let us worship the Holy Spirit of God, the indivisible Trinity and Unity in essence, Let us worship Light and Lights, the Life and Lives Who granteth light and life unto the ends of the Earth.

Both now...: Watch over thy City O most pure Birthgiver of God, for through Thee she reigneth in faith, and by thee she is strengthened, and by thee she is victorious, overcoming every temptation, despoiling the enemy, and ruling her faithful subjects.

Venerable father Andrew, pray to God for us.

O venerable Andrew, thrice-blessed father and pastor of Crete, cease not to offer prayer for those who sing thy praises, that all who faithfully honor thy memory may delivered from danger, distress, and from corruption and sin.

Katavasia: Ineffable is the birthgiving * of a seedless conception, * from a mother who knew not a man; * an undefiled childbearing. * For the birth of God hath renewed nature, * wherefore all generations rightly worship and magnify thee * as the Bride and Mother of God.`
        },
        "tuesday": {
            label: "Great Canon of Saint Andrew of Crete — Tuesday of the First Week (Odes I–IX)",
            text: `ODE I

Irmos: A helper and a protector * hath become unto me salvation. * My God, whom I will glorify, * the God of my fathers, * and I will exalt Him * for gloriously hath He been glorified.

Have mercy on me, O God, have mercy on me.

By mine own free choice I have incurred the guilt of Cain's murder. I have killed my conscience, bringing the flesh to life and making war upon the soul by my wicked actions.

Have mercy on me, O God, have mercy on me.

O Jesus, I have not been like Abel in His righteousness. I have never offered Thee acceptable gifts or godly actions, a pure sacrifice, or an unblemished life.

Have mercy on me, O God, have mercy on me.

O wretched soul, Like Cain, we have also offered to the Creator of all, defiled actions, a polluted sacrifice and a worthless life: wherefore also we are condemned.

Have mercy on me, O God, have mercy on me.

Thou hast fashioned me, O my Maker and Redeemer and Judge, as one who moulds clay, giving me flesh and bones, breath and life. But do Thou accept me in repentance.

Have mercy on me, O God, have mercy on me.

O Savior, I confess to Thee, the sins I have committed, the wounds of my soul and body, which murderous thoughts, like thieves, have inflicted upon me.

Have mercy on me, O God, have mercy on me.

Though I have sinned, O Savior, yet I know that Thou lovest mankind. Thou dost chastise with mercy and art fervently compassionate. Thou seest me weeping and dost hasten to meet me, like the Father calling back the Prodigal Son.

Glory...: O Trinity beyond all essence and worshiped in unity, take from me the heavy yoke of sin, and since Thou art compassionate, grant me tears of compunction.

Both now...: O Theotokos, thou hope and protection of those who sing unto Thee, take from me the heavy yoke of sin and O Lady, as one pure, accept me in penitence.

ODE II

Irmos: Attend O heaven and I shall speak, * and sing in praise of Christ, * who from the virgin took flesh and came to dwell among us.

Have mercy on me, O God, have mercy on me.

Sin hath stripped me of the robe that God once wove for me, and it hath sewn for me garments of skin.

Have mercy on me, O God, have mercy on me.

I am clothed with the raiment of shame as with the leaves of the fig tree, in condemnation of my self-willed passions.

Have mercy on me, O God, have mercy on me.

I am clad in a defiled garment, shamefully bloodstained by the flow of a passionate and self-indulgent life.

Have mercy on me, O God, have mercy on me.

I have fallen under the burden of passions and the corruption of material things; and the enemy vexeth me.

Have mercy on me, O God, have mercy on me.

I have lived a life of love for material things, lacking in abstinence, instead of one free from possessions, O Savior, and now I wear a heavy yoke.

Have mercy on me, O God, have mercy on me.

I have adorned the image of my flesh with a many-colored coat of shameful thoughts, wherefore I am condemned.

Have mercy on me, O God, have mercy on me.

Having cared only for outward adornment, I have neglected that which is within; the tabernacle fashioned in God's image.

Have mercy on me, O God, have mercy on me.

I have buried with the passions the first beauty of the image, O Savior. But seek me, as once Thou didst seek the lost coin, and find me.

Have mercy on me, O God, have mercy on me.

Like the Harlot I cry to Thee: I have sinned, I alone have sinned against Thee. Do Thou accept my tears as sweet myrrh, O Savior.

Have mercy on me, O God, have mercy on me.

Like the Publican I cry to Thee: Be merciful, O Savior, be merciful to me. For no child of Adam hath ever sinned against Thee as I have sinned.

Glory...: O God of all, I sing of Thee as one in three hypostases, Father, Son and Holy Spirit.

Both now...: O most holy virgin Theotokos, who alone art praised everywhere, pray thou fervently that we may be saved.

ODE III

Irmos: O Lord, upon the rock * of Thy commandments * make firm my heart, * for Thou alone art Holy and Lord.

Have mercy on me, O God, have mercy on me.

Unto me Thou art the Fountain of life, and the Destroyer of death; and before the end I cry unto Thee from my heart: I have sinned, do Thou cleanse and save me.

Have mercy on me, O God, have mercy on me.

I have sinned, O Lord, I have sinned against Thee, do Thou cleanse me. For there is none among men who have sinned, whom I have not surpassed in transgressions.

Have mercy on me, O God, have mercy on me.

I have followed the example, O Savior, of those who, in the days of Noah, lived in wantonness; and like them I am condemned to drown in the Flood.

Have mercy on me, O God, have mercy on me.

Thou, O my soul, hast followed after Ham, who mocked his father. Thou hast not covered thy neighbor's shame, by walking away with turned face.

Have mercy on me, O God, have mercy on me.

Flee, O my soul, like Lot from the burning of sin; flee from Sodom and Gomorrah; flee from the flame of every unspeakable desire.

Have mercy on me, O God, have mercy on me.

Have mercy, O Lord, have mercy on me, I cry unto Thee, who comest with Thine angels to give to every man what is due for his deeds.

Glory...: O simple Unity praised in a Trinity of Hypostases, uncreated beginningless Essence, save us who in faith worship Thy power.

Both now...: O Birthgiver of God, who without knowing a man hast given birth within time to a Son, who was begotten outside time from the Father; and, strange wonder! thou givest suck while remaining a Virgin.

ODE IV

Irmos: The prophet heard * of Thy coming, O Lord, * and he was afraid. * How wast Thou to be born of a virgin * and appear unto mankind? * and he said * "I have heard report of Thee and I am afraid"; * glory to Thy power, O Lord.

Have mercy on me, O God, have mercy on me.

O my soul, be watchful, be full of courage, like unto the great Patriarch, that thou mayest acquire action with knowledge, and be named Israel, "the mind that sees God"; and thus by contemplation reach the innermost darkness and gain great merchandise.

Have mercy on me, O God, have mercy on me.

The great Patriarch begat the twelve Patriarchs as children, mystically establishing for thee, O my soul, a ladder of ascent through action, for in his wisdom he set his children as steps, by which thou canst ascend upwards.

Have mercy on me, O God, have mercy on me.

Thou hast emulated Esau the despised, O my soul, and given the birthright of thy first beauty to the deceiver; thereby losing thy father's blessing, and in thy wretchedness thou hast been twice deceived, both in action and in knowledge, wherefore repent now.

Have mercy on me, O God, have mercy on me.

Esau was called Edom because of his raging love for women; burning always with unrestrained desire and stained with the smear of sensual pleasure, he was named "Edom", which means the red-hot heat of a soul that loveth sin.

Have mercy on me, O God, have mercy on me.

Thou hast heard, O my soul, of Job who was justified, but thou hast not imitated his fortitude. In all thine experiences, and trials, and temptations, thou hast not kept firmly to thy purpose but hast shown thyself to be inconsistent.

Have mercy on me, O God, have mercy on me.

He formerly sat upon a throne, but now he sitteth upon a dung-hill, naked and covered with lesions. Once he was blessed with many children and admired by all, but suddenly he became childless, and homeless. Even so, he counted the dung-hill as a palace and his sores as pearls.

Glory...: Undivided in Essence, uncommingled in Hypostasis, I confess Thee to be God: Triune Deity, co-enthroned and co-ruling; and to Thee I raise the great thrice-holy hymn that is sung on high.

Both now...: Thou didst give birth and art yet a virgin, and in both thou didst remain by nature inviolate. He who is born maketh new the laws of nature, and the womb bringeth forth without travail. When God so willeth, the natural order is overcome: for He doeth whatsoever He wills.

ODE V

Irmos: Out of the night I seek Thee early, * enlighten me I pray Thee, O Lover of mankind, * and guide me in Thy commandments, * and teach me, O Savior, * to do Thy will.

Have mercy on me, O God, have mercy on me.

Thou hast heard, O my soul, of the basket of Moses: how he was carried on the surging waves of the river as if in a tabernacle; and thus avoided the bitter execution of Pharaoh's decree.

Have mercy on me, O God, have mercy on me.

If thou hast heard of the midwives who once killed in its infancy the manly action of chastity O wretched soul; then be like the great Moses, and be suckled on wisdom.

Have mercy on me, O God, have mercy on me.

Thou hast not struck and killed the wretched mind, like Moses the great did to the Egyptian, O my soul. Tell me then, how canst thou go and dwell in the desert emptied of passions through repentance?

Have mercy on me, O God, have mercy on me.

Moses the great went to dwell in the desert, come and seek to emulate his way of life, O my soul, that thou mayest attain to the vision of God in the bush.

Have mercy on me, O God, have mercy on me.

Picture before thyself, O my soul, the rod of Moses striking the sea and making firm the deep by the sign of the divine Cross, by which thou canst also do great things.

Have mercy on me, O God, have mercy on me.

Aaron offered to God a blameless and undefiled fire, but Hophni and Phinehas brought to Him, as hast thou O my soul, a strange fire and a defiled life.

Glory...: We glorify Thee, O Trinity, one God, simple essence and unity, and we worship Thee forever singing, "Holy! Holy! Holy!" Father, Son and Holy Spirit.

Both now...: O most pure Virgin Mother who knew not a man, God the creator of all things became incarnate through thee, uniting Himself to our human nature.

ODE VI

Irmos: With my whole heart, I cried * unto the tenderly compassionate God, * and he heard me * from the lowest depths of Hades; * and raised up my life from corruption.

Have mercy on me, O God, have mercy on me.

The waves of my sins, O Savior, have returned and of a sudden engulfed me, as of old the waters of the Red Sea engulfed the Egyptians and their charioteers.

Have mercy on me, O God, have mercy on me.

Thou hast made a foolish choice, O my soul, like Israel before thee; instead of manna from heaven, thou hast unreasonably shown a preference for the pleasure-loving gluttony of the passions.

Have mercy on me, O God, have mercy on me.

The wells of Canaanitish thoughts, O my soul, hast thou prized more than the veined Rock from which floweth the river of Wisdom, like a chalice pouring forth streams of theology.

Have mercy on me, O God, have mercy on me.

The meat of swine, the flesh-pots and foods of Egypt hast thou preferred, O my soul, to the manna from heaven, as did the ungrateful people of old in the desert wilderness.

Have mercy on me, O God, have mercy on me.

When Thy servant Moses struck the rock with his rod, he prefigured Thy life-giving side, O Savior, from whence we all draw forth the water of life.

Have mercy on me, O God, have mercy on me.

Search O my soul, like Joshua the son of Nun, and spy out the land of thine inheritance, and take up thy dwelling within it through the goodness of the law.

Glory...: "I am the Trinity, simple and undivided in Essence yet divided in Hypostasis. I am the Unity one in essence," sayeth the Father, the Son, and the divine Spirit.

Both now...: Thy womb, O Theotokos, bore God who for our sakes was clothed in our likeness. Implore Him, the creator of all, that by thy prayers we may be found justified.

Kontakion, in Tone VI: O My soul, O my soul, * arise! Why dost thou sleep? * The end draweth near, and thou shalt be confounded, * awake then and be watchful * that Christ thy God may spare thee, ** for He is everywhere present, and fillest all things.

ODE VII

Irmos: We have sinned, we have transgressed, * and we have done evil before Thee. * We have not kept nor followed * Thy commandments, but reject us not utterly, * O God of our fathers.

Have mercy on me, O God, have mercy on me.

The Ark was being carried in a carriage, and when the ox stumbled, it was no more than touched, and invoked the wrath of God. O my soul, flee from such presumption and with reverence have respect for divine things.

Have mercy on me, O God, have mercy on me.

Thou hast heard of Absalom; how he rebelled against what is natural; thou knowest the unholy deeds by which he defiled his father David's bed, but nevertheless thou hast imitated him in his passionate and sensual-loving desires.

Have mercy on me, O God, have mercy on me.

Thou hast made thy free dignity subject to the flesh; for having found in thine enemy another Ahitophel, O my soul, thou hast acquiesced to his counsels. But Christ Himself hath nullified them, and redeemed thee from all of them.

Have mercy on me, O God, have mercy on me.

Solomon the wonderful, who was full of the grace of wisdom, once committed wickedness in the sight of God and turned away from Him. By thine accursed life O my soul, thou hast become like him.

Have mercy on me, O God, have mercy on me.

Consumed by sensual passions, he defiled himself, The zealot of wisdom hath became a zealot of prodigal women and a stranger to God. Woe is me! O my soul, thou hast noetically imitated him, defiling thyself with polluted desires.

Have mercy on me, O God, have mercy on me.

Thou hast imitated Rehoboam, who paid no attention to his father's counselors, and Jeroboam, that evil servant and betrayer of old. O my soul, flee from their example and cry unto God: "I have sinned, have compassion upon me."

Glory...: O simple and undivided Trinity, one in essence and nature, Light and Lights, one Holy and three Holies, God; is praised as the Trinity. Therefore sing praises to Him, O my soul, and glorify the Life and Lives, the God of all.

Both now...: We praise thee, we bless thee and we venerate thee, O Birthgiver of God, for from the undivided Trinity hast thou brought forth the only Son of God, opening unto us the heavenly realms on earth.

ODE VIII

Irmos: Him whom the hosts of heaven glorify, * and before whom tremble the Cherubim and Seraphim, * let every breath and all creation * praise, bless, and supremely exalt, * throughout all ages.

Have mercy on me, O God, have mercy on me.

Thou hast emulated Uzziah, O my soul, and hast twofold the leprosy he had: for thy thoughts are futile, and thy deeds unlawful. Leave what thou hast, and hasten to repentance.

Have mercy on me, O God, have mercy on me.

O my soul, thou hast heard how the men of Nineveh repented before God in sackcloth and ashes. Thou hast not imitated them, but rather art more wicked than all who have sinned before the Law, and after the Law.

Have mercy on me, O God, have mercy on me.

Thou hast heard, O my soul, how Jeremiah cried lamenting for the city of Zion while in the muddy pit, seeking tears. Follow then, his life of lamentation and be saved.

Have mercy on me, O God, have mercy on me.

Jonah fled to Tarshish, foreseeing the conversion of the men of Nineveh; for as a prophet he knew the compassionate goodness of God, and was jealous that his prophecy should not be proved wrong.

Have mercy on me, O God, have mercy on me.

O my soul, thou hast heard how Daniel stopped the mouths of the wild beasts in the pit; and thou knowest how the Children with Azarias, by their faith quenched the flames of the fiery furnace.

Have mercy on me, O God, have mercy on me.

All the names of the Old Testament have I set before thee, O my soul, as examples. Emulate the god-loving deeds of the righteous and flee from the sins of the wicked.

Let us bless the Father, Son, and Holy Spirit: the Lord!

O beginningless Father, co-eternal Son, and gracious Comforter, the Spirit of righteousness, Begetter of the Word of God, Word of the eternal Father, Spirit living and creative, O Trinity in unity, have mercy on me.

Both now...: As from purple silk, O undefiled virgin, the spiritual robe of Emmanuel was woven within thy womb. Wherefore we proclaim thee to be the Theotokos in truth.

ODE IX

Irmos: Ineffable is the birthgiving * of a seedless conception, * from a mother who knew not a man; * an undefiled childbearing. * For the birth of God hath renewed nature, * wherefore all generations rightly worship and magnify thee * as the Bride and Mother of God.

Have mercy on me, O God, have mercy on me.

Christ was being tempted, tempted by the devil O my soul, who showed Him the stones that they might be made bread, and led Him up into a mountain, to see all the kingdoms of the world in an instant. O my soul, look with fear on what happened; watch and pray every hour to God.

Have mercy on me, O God, have mercy on me.

The gentle Dove who loved the desert wilderness, the voice of one crying aloud, the Lamp of Christ, preached repentance; but Herod sinned with Herodias. O my soul, watch that thou be not trapped in the snares of the lawless ones, rather, embrace repentance.

Have mercy on me, O God, have mercy on me.

The Forerunner of Grace went to dwell in the desert wilderness, and Judaea and all Samaria hastened to hear him; they confessed their sins and were eagerly baptized. But thou, O my soul, hast not imitated them.

Have mercy on me, O God, have mercy on me.

Marriage is honorable, and the marriage-bed undefiled, for on both Christ hath given His blessing, eating in the flesh at the wedding in Cana, turning the water into wine, and revealing His first miracle, that thou, O my soul, may change thy life.

Have mercy on me, O God, have mercy on me.

Christ healed the paralyzed man, and he took up his bed; He raised from the dead the young man, the son of the widow, and the centurion's child-servant; He appeared to the woman of Samaria and spoke to thee, O my soul, of worship in spirit.

Have mercy on me, O God, have mercy on me.

The Lord healed the woman with an issue of blood, through the touching of the hem of His garment; He cleansed lepers, and restored the blind and the lame to health; He cured the deaf and the dumb, and the woman bowed to the ground, by His word, that thou, O wretched soul, may be brought to salvation.

Glory...: Let us glorify the Father, let us exalt the Son, and with faith let us worship the Holy Spirit of God, the indivisible Trinity and Unity in essence, Let us worship Light and Lights, the Life and Lives Who granteth light and life unto the ends of the Earth.

Both now...: Watch over thy City O most pure Birthgiver of God, for through Thee she reigneth in faith, and by thee she is strengthened, and by thee she is victorious, overcoming every temptation, despoiling the enemy, and ruling her faithful subjects.

Venerable father Andrew, pray to God for us.

O venerable Andrew, thrice-blessed father and pastor of Crete, cease not to offer prayer for those who sing thy praises, that all who faithfully honor thy memory may be delivered from danger, distress, and from corruption and sin.

Katavasia: Ineffable is the birthgiving * of a seedless conception, * from a mother who knew not a man; * an undefiled childbearing. * For the birth of God hath renewed nature, * wherefore all generations rightly worship and magnify thee * as the Bride and Mother of God.`
        },
        "wednesday": null,
        "thursday":  null
    }
};