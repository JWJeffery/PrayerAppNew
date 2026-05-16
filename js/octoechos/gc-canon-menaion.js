// js/octoechos/gc-canon-menaion.js
// Menaion Great Compline canon corpus — date-keyed scaffold
// Horologion v7.3
//
// Corpus contract: window.GC_CANON_MENAION.dates["MM-DD"]
//   key present: { label: string, text: string }  → corpus text emitted
//   key absent:  (no entry)                        → engine degrades to
//                gc-canon-menaion rubric slot in great-compline-fixed.json
//
// The engine (_getGcCanonMenaion in horologion-engine.js) probes this object
// after confirming a rank 1–2 Menaion commemoration on the appointed day.
// No engine redesign, schema change, or resolver change is required when
// corpus text is added: simply add a "MM-DD" key with { label, text }.
//
// Key format:  two-digit month + hyphen + two-digit day  e.g. "09-14"
//
// This object is intentionally sparse. Absence of a key is the sentinel
// for "not yet transcribed." Do not add placeholder or null values.
//
// Source target for transcription: The Great Menaion (OCA / Jordanville /
// Antiochian editions). Each entry should carry the full canon for that
// feast as it appears at Great Compline. DO NOT populate with fabricated
// or unverified text.
//
// Feast entries will be added date by date as transcription proceeds.
// Friday and Saturday Great Compline is typically not appointed; entries
// for those dates are permitted if a qualifying feast falls on such a day.

window.GC_CANON_MENAION = {
    dates: {
        // ── Entries added here as corpus transcription proceeds ──────────
        // Example format (do not uncomment — illustrative only):
        // "09-14": {
        //     label: "Canon — The Universal Exaltation of the Precious and Life-Giving Cross",
        //     text:  "Ode I. Irmos: … Troparia: …"
        // },

        "04-23": {
            label: "Canon of the Holy Great Martyr & Wonderworker George the Trophy-Bearer — Tone II (Theophanes)",
            text: `ODE I. Irmos: In the deep of old the infinite Power overwhelmed Pharaoh's whole army. But the Incarnate Word annihilated pernicious sin. Exceedingly glorious is the Lord, for gloriously hath He been glorified.

Standing, most radiant, before the precious throne of Him Who hath dominion over all, by thy supplications and intercessions preserve those who call upon thee with fervent faith and love, O martyr of Christ, crown-bearer George.

Thou wast a noble field of Christ, O George, cultivated by the acts of thy martyrdom, and the Judge of the contest hath laid thee up in the treasuries of heaven as most glorious riches, in that thou didst contend most excellently.

Called to struggles, O George, thou didst strive steadfastly and with endurance, O most blessed George, and having cast down the bold array of the tyrants, thou hast become an advocate for all who call upon thee.

Thou hast now received the blessed life which is hidden in Christ, for which thou didst contend, even to the shedding of thy blood, O George. Pray thou, that those who hymn thee be saved from every evil circumstance, O passion-bearer.

Theotokion: Thou wast a noetic heaven, O Mother of God, containing within thy womb the heavenly Word by Whom all things — heaven and earth, and those things that are above them — came into being. Wherefore, pray thou with boldness, that He save those who hymn thee.

ODE III. Irmos: The desert of the barren Church of the nations blossomed like a lily at Thy coming, O Lord; therein hath my heart been established.

Resplendent in the crown of suffering, O glorious and blessed one, entreat God our Redeemer, that He deliver from all necessity those who piously call upon thee.

Illumined with rich effulgence, O most wise one, from us who praise thee with faith drive far away dark grief and the gloom of the passions.

Made steadfast by hope and love, and fortified by faith, O George, strengthened by the power of Christ thou didst cast down the delusion of the idols.

Theotokion: O most pure one, thou gavest birth in the flesh to the Incorporeal One Who hath enlightened the ends of the earth, and Who before all things is co-beginningless with the Father. Wherefore, we the faithful honor thee, the Theotokos.

ODE IV. Irmos: From a Virgin didst Thou come forth, not as an ambassador, nor as an Angel, but the very Lord Himself incarnate, and didst save me, the whole man; wherefore I cry unto Thee: Glory to Thy power, O Lord!

O most blessed George, we hymn thy struggles, whereby thou didst break asunder the worship of the idols; and thou didst set at naught all the delusion of the demons, O most glorious one.

Still thou the turbulence of perils and misfortunes, O right wondrous one, and dispel from those who hymn thee as a warrior of Christ every evil assault of the demons.

Thou hast shone forth like a radiant star, O George, driving away dark delusion with valor of spirit and steadfastness of faith, and saving those who hymn thee.

Theotokion: O Virgin, thou gavest birth to Him Who is in essence salvation, saving mankind in the richness of His goodness and His essential kindness, and restoring His image which had become corrupt.

ODE V. Irmos: O Christ my Savior, the enlightenment of those lying in the darkness of sin, I rise early to hymn Thee, O King of Peace; enlighten me with Thy radiance, for I know no other God than Thee.

As thou hast the boldness of a martyr before the Master, earnestly beseech salvation for those who hymn thee, doing away with their spiritual ailments by thine entreaties, O passion-bearing martyr, most blessed George.

As thou joinest chorus with the choirs of angels and martyrs, O crown-bearer, and sharest in immortal and blessed glory, rescue those who have recourse to thy protection from threefold waves and tempest.

Deliver us from all necessity, O Christ, in that Thou art merciful, dispelling the multifarious turmoil of sin and misfortune, and accepting the supplications of George Thy favorite.

Theotokion: Thou didst repay the debt of our first mother Eve, O Mother of God; for thou didst wrap in flesh the Savior of the world Who was born of thee. Wherefore, we all call thee blessed, O joyous and all-immaculate Virgin.

ODE VI. Irmos: Whirled about in the abyss of sin, I appeal to the unfathomable abyss of Thy compassion: Raise me up from corruption, O God.

Transcending nature, all telling and understanding are the brave deeds of thy valor, which are unceasingly hymned, O most blessed martyr George.

In that thou art a converser with the army of heaven, and beholdest the revelation of God insofar as thou canst attain thereto, O blessed one, save those who honor thee with faith.

Inclining toward God in every way, and receiving the effulgence of miracles, O most blessed George, thou dost distribute gifts to those in need.

Theotokion: I now flee to thee, O most pure one. Save and preserve me by the supplications; for thou canst do all things whatsoever thou desirest, in that thou art the Mother of the Almighty.

ODE VII. Irmos: The godless order of the lawless tyrant fanned the roaring flame; but Christ bedewed the God-fearing children with the Spirit; therefore He is blessed and supremely exalted.

Emulating thy Master, O glorious martyr, thou didst willingly hasten to the struggle, and having received the victory hast become the guardian of the Church of Christ. Do thou ever preserve it by thine intercession.

As an invincible martyr, as an athlete, as an unvanquished champion of the Faith, O all-wise George, be thou now an unshakable pillar for those who praise thee, protecting them by thy supplications.

Having wisely cultivated the divine seed, thou hast multiplied it, watering it with the torrents of thy blood, with the urgency of thy pangs and divers wounds, whereby thou didst put down the savagery of the tyrants.

Theotokion: Thou didst remain a virgin even after giving birth, for thou gavest birth to God Who feedeth all creatures in His ineffable mercy, and Who in His great loving-kindness became a man, O pure one. Him do thou entreat, that our souls be saved.

ODE VIII. Irmos: In Babylon, the activity of the fire was once divided; for, by the command of God it consumed the Chaldeans, but bedewed the faithful, who chant: Bless ye the Lord, all ye works of the Lord!

By thy supplications, O crown-bearer George, bring a halt to the torrent of cruel sufferings and misfortunes, tumultuous evil circumstances, attacks of pain, the wiles of the demons and the assaults of the ungodly.

Wholly illumined with purity by the light of the Trinity, O blessed dweller in heaven, as an invincible martyr, a champion of piety and a divinely crowned victor, by thy supplications save those who honor thee.

Adorned in every way with the noetic crown and diadem of the kingdom, dignified with a scepter and arrayed in a royal robe empurpled in thy blood, O blessed one, thou reignest with the King of hosts.

Theotokion: O Virgin Mother, thou gavest birth to Him Who was begotten timelessly of the Father, Who shone forth before time began and hath created all things, visible and invisible. Wherefore, we and all the terrestrial nations glorify thee, the Theotokos.

ODE IX. Irmos: The Son of the Beginningless Father, God and Lord, hath appeared to us incarnate of a Virgin, to enlighten those in darkness, and to gather the dispersed; therefore the all-hymned Theotokos do we magnify.

Unceasingly entreat the Lord for us who hymn thee, O blessed one, as a martyr of Christ who vanquished the tyrant, as an expeller of evil spirits, a tireless guardian, a helper unashamed.

The Master of all hath richly rewarded thee for thy sufferings, O thrice-blessed one; and, standing before Him with the boldness of a martyr, preserve those who call upon thee with gladness.

The earth covered thee, but heaven received thee and manifestly opened unto thee the gates of paradise, O athlete; and joyously dancing and leaping up therein, by thy supplications preserve those who hymn thee with faith.

Theotokion: The tabernacle of the witness, wherein were the tablets of the law, the jar of manna and the golden ark, prefigured thee, O most pure one; for like it, O Theotokos, thou didst contain the beginningless Word, incarnate, within thy womb.`
        },

        "08-15": {
        label: "Canon of the Dormition of Our All-holy, Glorious Mistress, the Theotokos and Ever-virgin Mary",
        text: `Two canons, with a total of 12 troparia, including the irmoi.

Ode I

Canon I of the Dormition, the acrostic whereof is: "Let the divinely wise hold festival", the composition of Cosmas of Maiuma, in Tone I—

Irmos: Thy sacred and glorious memorial, all-adorned with divine glory, O Virgin, hath assembled the faithful in gladness, as Miriam beginneth, with choirs and drums, to chant unto Thine only-begotten Son, for gloriously hath He been glorified.

Let the immaterial ranks accompany thy divine and immaterial body to Sion. For the multitude of the apostles, coming together of a sudden from the ends of the earth, stood before thee, O Theotokos. With them we also glorify thine honored memory, O pure one.

The honors of victory over nature hast thou taken, having given birth unto God, O pure one; yet, emulating thy Creator and Son, thou submittest to the laws of nature in supernatural manner. Wherefore, having died, thou risest with thy Son unto everlasting life.

Canon II of the dormition, the composition of John of Damascus, in Tone IV—

Irmos: I will open my mouth, and with the Spirit will it be filled; and I shall utter discourse unto the Queen and Mother, and shall appear, keeping splendid festival; and, rejoicing, I will hymn her dormition.

O virgin maidens, with Miriam the prophetess raise ye now a hymn of parting! For she who alone is Virgin and Mother of God is translated and received into heaven.

The divine mansions of heaven received thee as an animate heaven, as is meet, O all-pure one; and thou hast taken thy place as a bride, splendidly adorned, before thy King and God, O most immaculate one.

Katavasia: The right choir chanteth the irmos of Canon I, and the left choir that of Canon II.

Ode III

Canon I

Irmos: O Christ, Thou creative and almighty Wisdom and Power of God, establish the Church immovable and unshaken; for Thou alone art holy Who restest in the saints.

The glorious apostles, seeing thee to be a mortal woman, yet, in manner transcending nature, the Mother of God, O all-immaculate one, with awe touched with their hands thee who art resplendent in glory, perceiving thee to be a habitation acceptable to God.

When God preserved with the glory of His divinity the honor of the animate ark wherein the Word became flesh, the judgment of retribution overtook the insolent one through the severing of his audacious hands.

Canon II

Irmos: O Theotokos, thou living and abundant fountain: in thy divine commemoration establish those who hymn thee and spiritually form themselves into a choir; and vouchsafe unto them crowns of glory.

Having issued forth from a mortal womb, O pure one, thou didst receive an end conforming to nature; but, having given birth unto Him Who is Life, Thou hast been translated to the divine and hypostatic Life.

At the behest of the Almighty, the choir of theologians journeyed from the ends of the earth, and multitudes of angels came from on high to Sion, to minister at thy burial as was meet, O Mistress.

Hypacoï, in Tone VIII—

All of us, the generations of men, bless thee, O Virgin Theotokos; for Christ our God, Who is infinite, was well-pleased to be contained within thee. Blessed are we to enjoy thine intercession; for thou prayest for us day and night, and by thy supplications are the scepters of kingdoms made steadfast. Wherefore, chanting, we cry aloud to thee: Rejoice, O thou who art full of grace! The Lord is with thee!

Ode IV

Canon I

Irmos: The sayings and indistinct images of the prophets showed forth Thine incarnation from the Virgin, O Christ. The effulgence of Thy radiance issueth forth to enlighten the nations, and the deep crieth out to Thee with gladness: Glory to Thy power, O Thou Who lovest mankind!

Behold, O ye people, and marvel, for the holy and openly manifest mountain of God is exalted on high to the mansions of heaven: the earthly heaven becometh a celestial and incorrupt habitation.

Thy death became a passage to an everlasting and better life, O pure one, translating thee from transitory life to that which is truly divine and eternal, that thou mightest behold thy Son and Lord in gladness, O pure one.

The gates of heaven were raised and the angelic choirs chanted; and Christ received the vessel of His Mother's virginity. The cherubim lifted her up with gladness, and the seraphim glorify her, rejoicing.

Canon II

Irmos: Perceiving the inscrutable counsel of God — the Incarnation of Thee, the Most High, from the Virgin — the Prophet Habbakuk cried aloud: Glory to Thy power, O Lord!

A wonder was it to see the animate heaven of the King of all, which surpasseth the barren places of the earth. How wondrous are Thy works! Glory to Thy power, O Lord!

If her unapproachable Fruit, through Whom the heavens arose, chose of His own will to accept burial as a mortal, how can she, who gave birth to Him without knowing wedlock, refuse burial?

At thy repose, O Mother of God, with trembling and joy the armies of the angels covered with their sacred wings thy most spacious body, which had held God.

Ode V

Canon I

Irmos: We confess the divine and ineffable beauty of Thy virtues, O Christ; for having shone forth from eternal Glory as the co-eternal and hypostatic Effulgence, incarnate of the Virgin's womb Thou hast shone forth like the Sun upon those in darkness and shadow.

The choir of the apostles assembled, borne as on a cloud to Sion from the ends of the earth, to serve thee, the light cloud through whom God Most High, the Sun of righteousness, hath shone forth upon those who are in darkness and shadow.

More melodious than clarions, the God-pleasing tongues of the theologizing men sounded forth to the Theotokos, playing a funeral hymn inspired by the Spirit: Rejoice, O incorrupt fountain of God's life-creating incarnation which saveth all!

Canon II

Irmos: All things are filled with awe at thine honored dormition; for thou, O Virgin who hast not known wedlock, hast passed from earth to the everlasting mansions, and to never-ending life, bestowing salvation upon all who hymn thee.

Let the clarions of the theologians trumpet forth today, and let the eloquent tongues of men now render praise; let the air resound, shining with boundless light, and let the angels hymn the dormition of the all-pure Virgin.

It was fitting for thee, O most lauded Virgin Theotokos, to be the chosen vessel, which is wholly marvelled at in hymnody at thy departure, wholly consecrated to God, divinely pleasing unto all, and truly shown to be such.

Ode VI

Canon I

Irmos: The inner fire of the sea from the deep which giveth rise to the whales was a prefiguring of Thy three-day burial, whereof Jonah was shown to be the proclaimer; for, remaining unharmed as he was before he was sent forth, he cried: I will sacrifice to Thee with a voice of praise, O Lord!

God, the King of all, giveth thee that which transcendeth nature; for, as He kept thee a virgin during thy birthgiving, so did He preserve thy body untouched by corruption in the tomb; and He glorified thee with Himself by a divine translation, rendering thee honor as a Son to His Mother.

Truly, O Virgin, thine Offspring set thee in the Holy of Holies as the splendid candlestick of the immaterial Light, the golden censer of the divine Coal, the jar and the staff, the divinely inscribed tablet, the holy ark, the table of the Word of life.

Canon II

Irmos: Celebrating this divine and most honored festival of the Mother of God, come, ye divinely wise, let us clap our hands and glorify God Who was born of her.

From thee did Life shine forth, leaving intact the seal of thy virginity. How, therefore, hast thine all-pure and life-giving body been permitted to be tempted by death?

As the temple of Life, thou didst attain life everlasting; for, having given birth to the hypostatic Life, thou didst pass through death on to life.

Kontakion of the feast, in Tone II—

The tomb and mortality could not hold the Theotokos, who is untiring in her supplications and our certain hope in her intercessions. For, as the Mother of Life, she hath passed over to the Life Who dwelt within her ever-virgin womb.

Ikos: Guard thou my thoughts, O my Christ, for I make bold to hymn the bulwark of the world, Thy pure Mother. Establish me firmly in the bastion of my words, and help me in the midst of difficult thoughts; for Thou fulfillest the entreaties of those who cry out and ask with faith. Wherefore, grant unto me a deft tongue and a ready mind, for every good deed of enlightenment cometh down from Thee, O Bestower of light, Who dwelt within her ever-virgin womb.

Ode VII

Canon I

Irmos: The divine will, opposing the shameless rage and the fire, bedewed the fire and put wrath to shame by the divinely inspired three-stringed lyre of the venerable youths, opposing the musical instruments amid the flames, chanting: O all-glorious God of our fathers, blessed art Thou!

Enraged, Moses smashed the divinely wrought tablets which had been inscribed by the divine Spirit; but the Master, preserving unharmed her who gave birth to Him, hath now caused her to dwell in the mansions of heaven. Celebrating with her, let us cry out to Christ: O all-glorious God of our fathers, blessed art Thou!

On the cymbals of pure lips, with the music of a radiant heart, on the high-sounding clarion of exalted thought, clapping our diligent hands on the renowned and chosen day of the repose of the pure Virgin, let us cry aloud: O all-glorious God of our fathers, blessed art Thou!

Gather ye together, O divinely wise people, for the dwelling-place of the glory of God is translated from Sion to the habitation of heaven, where is the pure voice of those who keep festival, the voice of the unutterable rejoicing of those who cry out to Christ in gladness: O all-glorious God of our fathers, blessed art Thou!

Canon II

Irmos: The divinely wise youths worshipped not a creation rather than the Creator, but, manfully trampling the threat of the fire underfoot, they rejoice, chanting: Blessed art Thou, the all-hymned God of our fathers!

Honoring the memory of the Mother of God, O youths and virgins, elders and princes, kings and judges, chant ye: O Lord and God of our fathers, blessed art Thou!

Let the mountains of heaven sound the trumpet of the Spirit! Let the hills rejoice and the divine apostles dance! The Queen passeth over to her Son, reigning with Him!

The most sacred repose of Thy divine and incorrupt Mother hath united the celestial ranks of the exalted hosts to rejoice with those on earth, chanting unto Thee: Blessed art Thou, O God!

Ode VIII

Canon I

Irmos: The almighty Angel of God showed forth for the youths a flame which bedewed the venerable and utterly consumed the ungodly; and He made the Theotokos a life-creating wellspring pouring forth destruction for death and life for those who chant: O ye who have been delivered, let us hymn and exalt the one Creator for all ages!

With discourses the whole multitude of theologians accompanied the sacred coffin of the Theotokos in Sion, exclaiming: Whither goest thou, O tabernacle of the living God? Cease not to regard those who chant with faith: O ye who have been delivered, let us hymn and exalt the one Creator for all ages!

Thou goest forth, O all-immaculate one, lifting up thine hands, the hands wherewith thou didst bear God in the flesh; and as a Mother thou didst with boldness say to Him Who was born of thee: Preserve Thou forever those whom Thou hast given to me, who cry out to Thee: O ye who have been delivered, let us hymn and exalt the one Creator for all ages!

Canon II

Irmos: The birthgiving of the Theotokos saved the pious children in the furnace — then in figure, but now in deed — and it moveth all the world to chant to Thee: Hymn ye the Lord and exalt Him supremely for all ages!

The principalities, authorities and powers, the angels, archangels, thrones, dominions, the cherubim and the dread seraphim, glorify thy memory, O pure Virgin; and we, the race of men, hymn and exalt it supremely for all ages.

He Who, in manner strange, made His abode, incarnate, within thy pure womb, O Theotokos, receiveth thy most sacred spirit and, as thy Son and One in thy debt, hath given it rest by His side. Wherefore, we hymn and exalt thee supremely for all ages, O Virgin.

O the wonders of the Ever-virgin and Mother of God, which pass understanding! For, taking up her abode in the grave, she hath shown it to be paradise; and standing before it today, rejoicing, we chant: Hymn the Lord, ye works, and exalt Him supremely for all ages!

We do not chant the Magnificat before Ode IX, but sing instead the refrain of the feast:

All of us, the generation of men, bless thee, the only Theotokos.

Or:

Beholding the dormition of the all-pure one, the angels were amazed that the Virgin ascended from earth to heaven.

And thereafter the irmos of Ode IX of Canon I. The second choir chanteth the same refrain and irmos. And at each troparion of the canons the refrain is chanted.

Ode IX

Canon I

Irmos: In thee are the laws of nature overcome, O pure Virgin, for thy birthgiving is virginal and death is betrothed to life. A Virgin giving birth and alive after death, O Theotokos, thou hast saved thine inheritance.

The angelic hosts were amazed, seeing their Master in Sion, bearing in His arms a woman's soul; for as befitteth a Son, He exclaimed to her in all-pure manner: Come, O pure one, and be glorified with thy Son and God!

The choir of angels buried thy body, which had received God, gazing upon it with fear, and exclaiming with a loud voice: O Theotokos who ascendest to thy Son in the heavenly mansions, thou ever savest thine inheritance!

Canon II

Magnify, O my soul, the honored passing of the Mother of God from earth to heaven.

And then the irmos of Canon II. This refrain is chanted before each of the troparia of Canon II.

Irmos: Let every mortal leap for joy, enlightened by the Spirit; and let the nature of the incorporeal intelligences keep festival, honoring the sacred repose of the Mother of God, and let them cry aloud: Rejoice, O most blessed Theotokos, pure Ever-virgin!

Come ye to Sion, the divine and fertile mountain of the living God, and let us behold the Theotokos; for Christ hath translated her, as His Mother, to the Holy of Holies of a far better and divine tabernacle.

Come, ye faithful, let us approach the tomb of the Mother of God and kiss it with hearts and lips, touching to it your eyes and faces, and drawing gifts of abundant healings from the ever-flowing fountain.

Accept from us a hymn of parting, O Mother of the living God, and with thy light-bearing and divine grace overshadow us, granting victory to Orthodox hierarchs over heresies, and forgiveness to all Christian people who hymn thee, and salvation to their souls.

Then both choirs, having gone down together, chant the refrain of Canon I and its irmos, and the refrain of Canon II and its irmos. Prostration.`
        },

        "09-08": {
        label: "Canon of the Nativity of Our All-holy Mistress, the Theotokos and Ever-virgin Mary",
        text: `Two canons of the feast, with a total of 12 troparia, each irmos being chanted twice.

        Ode I

        Canon I of the Theotokos, the composition of John of Damascus, in Tone II—

        Irmos: Come, ye people, let us chant a hymn to Christ God, Who divided the sea and guided the people whom He had led forth from the bondage of Egypt, for He hath been glorified.

        Come, ye faithful, and, rejoicing with divine spirit, let us honor with hymns the Ever-virgin Maiden who today hath issued forth from a barren woman for the salvation of men.

        Rejoice, O pure one, Mother and handmaid of Christ God, mediatress of our primal blessedness! All of us, the human race, glorify thee with hymns, as is meet.

        Today is the bridge of life born, through which men have attained restoration after their fall into hades, glorifying Christ, the Bestower of life, with hymns.

        Canon II of the Theotokos, the composition of Andrew of Crete, in Tone VIII—

        Irmos: To Him Who crushed battles with His arm and led Israel across the Red Sea, let us chant, as to God our Deliverer, for gloriously hath He been glorified.

        Let all creation join chorus, and let David be glad, for from his tribe and seed hath come forth as a flower the rod which beareth the Lord, the Creator of all.

        The Holy of holies is placed in the holy sanctuary as a babe, to be fed by the hands of angels. Let us all, therefore, faithfully keep festival together on her nativity.

        Anna was barren and unable to give birth, yet she was not childless in God's eyes; for, lo! she hath become known by all generations as the mother of the pure Virgin, from whom the Creator of nature hath sprung forth in the guise of a servant.

        With hymns we all honor thee, the innocent ewe-lamb who hast been born of Anna and who through thy womb brought the Lamb Christ into our nature.

        Triadicon: I glorify the three Unoriginate Ones, I hymn the three Holy Ones, I proclaim the three equally Everlasting Ones to be of a single Essence; for the one God is glorified in the Father, the Son, and the Holy Spirit.

        Theotokion: Who hath seen a Babe fed with milk Whom a father hath now sown? Or where hath there been seen a Mother who is a Virgin? Truly past understanding are both of these things, O pure Theotokos.

        Katavasia: Tracing an upright line with his staff, Moses divided the Red Sea for Israel which was traveling on foot; and striking it a transverse blow, he brought the waters together over the chariots of Pharaoh, thereby inscribing the invincible weapon of the Cross. Wherefore, let us hymn Christ our God, for He hath been glorified.

        Ode III

        Canon I

        Irmos: Establish us in thee, O Lord Who hast slain sin by the Tree, and plant the fear of Thee in the hearts of us who hymn Thee.

        Having lived blamelessly for God, ye gave birth unto the salvation of all, O divinely wise parents of her who gave birth to our Creator and God.

        From a barren woman did the Lord, Who poureth forth life upon all, cause the Virgin to come forth, in whom He was pleased to make His abode, preserving her incorrupt even after giving birth.

        Let us hymn Mary today as the Theotokos, the fruit of Anna, the intercessor and helper of all, who gave birth to the life-bearing Cluster.

        Canon II

        Irmos: My heart is established in the Lord; my horn is exalted in my God; my mouth is enlarged over mine enemies. I am glad in Thy salvation.

        O all-pure Virgin Theotokos, thou hast been shown to be higher than all creation, having given birth in the flesh to the Creator.

        Blessed is thy womb, O chaste Anna, for thou didst pour forth the fruit of virginity who gave birth without seed to Jesus the Deliverer, the Nurturer of creation.

        O Ever-virgin, all creation calleth thee blessed who hast been born today of Anna as the rod sprung forth from the root of Jesse, who put forth Christ as an all-pure Bloom.

        Showing thee to be more exalted than all creation, O pure Theotokos, thy Son magnifieth thy birth from Anna and gladdeneth all today.

        Triadicon: We worship Thee, O Father unoriginate in essence, we hymn Thy timeless Son, and we honor Thy Spirit Who is equally everlasting: as God three in Hypostases but one in Essence.

        Theotokion: O pure Theotokos, who gavest birth unto the Bestower of light, the Author of man's life, thou hast been shown to be the treasure of our life and the portal of Light unapproachable.

        Katavasia: The rod of Aaron is taken to be an image of the mystery, for by its budding forth it chose one priest over others; and for the Church, which before was barren, the tree of the Cross hath now budded forth, for her might and confirmation.

        Sessional hymn, in Tone IV: Spec. Mel.: "Joseph marvelled..."—

        Like a cloud of light hath the Virgin Mary, the Theotokos, truly shone forth upon us today, and she cometh forth from the righteous ones for our glory. No longer is Adam condemned, and Eve is freed from her bonds. Wherefore, we exclaim, crying aloud with boldness to her who alone is pure: Thy nativity announceth joy to the whole world!

        Glory..., Now & ever...: The foregoing is repeated.

        Ode IV

        Canon I

        Irmos: I have heard report of Thy dispensation, O Lord, and have glorified Thee Who alone lovest mankind.

        We hymn Thee, O Lord, Who hast given unto all, as a haven of salvation, her who gaveth birth to Thee.

        Christ hath revealed thee, O Bride of God, to all who with faith hymn thy mystery as their boast and might.

        Delivered from transgressions by thy supplications, O Mistress who knewest not wedlock, we all bless thee with a good understanding.

        Canon II

        Irmos: With noetic eyes the Prophet Habbakuk foresaw Thy coming, O Lord; wherefore he cried aloud: "God shall come out of Thaeman!" Glory to Thy power! Glory to Thy condescension!

        The Patriarch Jacob, clearly foreseeing the mighty works of Thy dispensation, O Savior, cried out in the Spirit, saying mystically to Judah: "From the tender plant thou art gone up, O my Son!", referring to Thee, O God, Who wast born of the Virgin.

        Now the pure Virgin, the rod of Aaron which sprung forth from the root of David, cometh forth from Anna, and heaven and earth and all the nations of the gentiles mystically join chorus together with Anna and Joachim.

        Let heaven now be glad; let the earth rejoice! And let Joachim and David join chorus: the one as the father of thee who truly gavest birth to God, and the other as thine ancestor who proclaimed thy mighty deeds, O pure one.

        The whole world rejoiceth with thee today, O divinely wise Anna; for thou hast budded forth the Mother of its Deliverer, she who from the root of David put forth for us the rod of strength which beareth Christ as a flower.

        Triadicon: I glorify God, the unoriginate Father, the Son and the Holy Spirit, the consubstantial, uncreated Trinity, before Whom the seraphim stand with reverence, crying aloud: Holy, Holy, Holy art Thou, O God!

        Theotokion: The all-unoriginate Origin receiveth a beginning from thee in the flesh and in time, O Theotokos, and He remaineth equally the unoriginate and incarnate Word of the Father, equally everlasting with the Spirit, maintaining His divine dignity.

        Katavasia: I have heard, O Lord, the mystery of Thy dispensation; I have considered Thy works, and have glorified Thy divinity.

        Ode V

        Canon I

        Irmos: Having destroyed the shadowy darkness of indistinct images and illumined the hearts of the faithful by the coming of the Truth through the divine Maiden, O Christ, guide us by Thy light.

        O ye people, let us hymn the cause of the Cause of all, Who became like unto us. For the prophets, counted worthy to behold her image, rejoiced, bringing forth the fruit of manifest salvation through her.

        The budding forth of the dry rod of the priest showed forth the destiny of Israel; and now the most glorious offspring of the barren woman most gloriously shineth forth the splendor of those who gave rise to her.

        Canon II

        Irmos: Grant us peace, O Lord our God. O Lord our God, take us for Thy possession. O Lord, we know none other than Thee; we call upon Thy name.

        Thy nativity is all-pure, O immaculate Virgin, thy conception is ineffable, and thy birthgiving unutterable, O Bride unwedded; for God hath clad Himself in all of me.

        Let the angelic ranks be glad; let the descendants of Adam join chorus; for the rod hath been born which put forth as flower Christ alone, our Deliverer.

        Today the condemnation of Eve is lifted in thy nativity, the barrenness of Anna is loosed, and Adam is freed from the ancient curse; for by thee have we been delivered from corruption.

        Glory to Thee Who hast glorified the barren woman today! For, according to the promise, she gave birth unto the flowering rod from whence Christ, the Flower of our life, hath budded forth.

        Triadicon: Glory to Thee, O holy Father, unbegotten God! Glory to Thee, O timeless and only-begotten Son! Glory to Thee, O Spirit divine and equally enthroned, Who proceedest from the Father and restest in the Son!

        Theotokion: Thy womb becameth the chariot of the Sun; thy purity remained intact as before, O Virgin; for Christ the Sun appeared from thee like a Bridegroom from a bridal chamber.

        Katavasia: O thrice-blessed Tree, whereon the King and Lord was crucified, and whereby he who beguiled mankind by the tree did fall! He was beguiled by thee, when God was nailed in the flesh, Who granteth peace unto our souls!

        Ode VI

        Canon I

        Irmos: From the belly of the sea monster, Jonah cried out: Lead me up from the abyss of hell, I pray, that with a spirit of truth and in a voice of praise I may sacrifice to Thee, as to my Deliverer!

        The divinely wise parents of the Mother of God cried out to the Lord in grief over their barrenness; and they gave birth to her, our common boast and salvation for generations of generations.

        The divinely wise parents of the Mother of God received a gift worthy of heaven from God, for she is a chariot more highly exalted than the cherubim, the Mother of the Word and Creator.

        Canon II

        Irmos: Like the waters of the sea am I tossed about by the waves of life, O Thou Who lovest mankind. Wherefore, like Jonah I cry to Thee: Lead up my life from corruption, O compassionate Lord!

        Thy chaste parents placed thee, who art the Holy of holies, in the temple of the Lord, O pure one, to be raised with honor and prepared to become His Mother.

        Join chorus, ye barren women and mothers! Be of good cheer and leap up, O ye childless! For a childless and barren woman buddeth forth the Theotokos who delivereth Eve from her birth pangs and Adam from the curse.

        I hearken to David who singeth to thee: "The virgins that follow after thee shall be brought into the temple of the King. And with him I also hymn thee, the daughter of the King."

        We hymn thy holy nativity and honor thine immaculate conception, O divinely chosen Bride and Virgin. And with us the ranks of angels and the souls of the saints glorify thee.

        Triadicon: In thee, O pure one, is the mystery of the Trinity hymned and glorified; for the Father was well pleased, and the Word made His abode within thee, and the divine Spirit overshadowed thee.

        Theotokion: Thou wast a golden candlestick, O pure Theotokos, for in thy womb the Fire made His abode: the Word from the Holy Spirit; and He became visible in thee in human form.

        Katavasia: Stretching forth his arms in the form of a cross in the belly of the sea monster, Jonah clearly prefigured the saving Passion. And, issuing forth after three days, he foreshadowed the transcendent resurrection of Christ God, Who was nailed in the flesh and enlightened the world by His rising on the third day.

        Kontakion, in Tone IV—

        In thy holy nativity, O all-pure one, Joachim and Anna are freed from the reproach of childlessness, and Adam and Eve from mortal corruption. And, delivered from the affliction of sin, thy people celebrate it, crying out to thee: A barren woman giveth birth to the Theotokos, the nourisher of our Life!

        Ikos: The supplication of Joachim over his childlessness, together with the sighing of Anna over her barrenness, were right acceptable to God: they entered the ears of the Lord and brought forth life-bearing fruit for the world. For the one made supplication on the mountain, and the other bore her reproach in the garden; and with joy the barren woman giveth birth to the Theotokos, the nourisher of our Life.

        Ode VII

        Canon I

        Irmos: The fiery bush on the mount and the dew-bearing furnace of Chaldaea manifestly prefigured thee, O Bride of God; for in thy material womb thou didst receive the divine and immaterial Fire without being consumed. Wherefore, to Him Who was born of thee do we chant: Blessed art Thou, O God of our fathers!

        Once, the transmitter of the law was prevented from understanding thy great mystery in material manifestations, O all-pure one, though instructed through images not to think earthly thoughts. Wherefore, marvelling at the wonder, he said: Blessed is the God of our fathers!

        In godly manner the divine choir called thee beforehand the mountain and portal of heaven and the noetic ladder; for from thee was the Stone cut without the aid of man's hands, and thou art the door through which passed the Lord of wonders, the God of our fathers.

        Canon II

        Irmos: The Chaldaean furnace, burning with fire, was bedewed by the Spirit through the presence of God; and the children chanted: Blessed art Thou, O God of our fathers!

        We celebrate and bow down with faith before thy holy nativity, O pure one, honoring thy Son, by Whom we have now been delivered from the ancient condemnation of Adam.

        Now Anna maketh merry and, rendering praise, crieth out: Though barren, I have given birth unto the Mother of God, for whose sake the condemnation of Eve, to give birth in pain and grief, hath been loosed!

        Adam hath been freed and Eve danceth; and they cry out to thee in spirit, O Theotokos: Through thee have we been delivered from the primeval curse with the appearance of Christ!

        O the womb which contained the dwelling-place of God! O the womb which bore her who is more spacious than the heavens, the holy throne, the noetic ark of sanctification!

        Triadicon: We glorify the Father, the Son and the Holy Spirit in the unity of the Godhead, the all-holy Trinity, indivisible, uncreated, equally everlasting and consubstantial.

        Theotokion: Most gloriously didst thou alone give birth unto God, O Virgin. By thy nativity thou hast renewed nature, O Mary. Thou hast released Eve from the primeval curse, O pure Theotokos.

        Katavasia: The mad command of the impious tyrant, breathing forth threats and blasphemy hateful to God, cast the people into confusion. Yet the three children feared not the fury of the wild beasts, nor the roaring blaze; but, in the midst of the fire, when the dew-bearing wind blew upon it, they sang: O all-hymned God of our fathers, blessed art Thou!

        Ode VIII

        Canon I

        Irmos: Thou didst once prefigure Thy Mother in the furnace of the children, O Lord; for her image drew from the fire those who entered it, without being consumed. We hymn and exalt her supremely for all ages, who through Thee hath been made manifest today to the ends of the earth.

        Now the foreordained tabernacle of our reconciliation to God, who is to give birth to the Word Who hath manifested Himself to us in the coarseness of our flesh, beginneth her existence. Him do we, who have been brought into existence by Him out of nonexistence, hymn and exalt supremely for all ages.

        The reversal of Anna's barrenness hath loosed the world's lack of good things, and hath plainly shown forth a miracle: Christ, Who hath come to mortal men. Him do we, who have been brought into existence by Him out of nonexistence, hymn and exalt supremely for all ages.

        Canon II

        Irmos: O Thou Who coverest Thy chambers with waters and settest the sands as a bound for the sea: Thee doth the sun hymn; Thee doth the moon glorify; and unto Thee doth all creation offer a hymn forever, as to the Creator of all.

        Thou, O holy God, Who wrought most glorious things through the barren womb, Who opened the childless womb of Anna and gave her fruit, Thou, O Son of the Virgin, hast received flesh from her, the ever-flourishing Virgin and Theotokos.

        Thou, O Lord, Who closest the abyss and openest it, Who raisest water to the clouds and givest the rain, hast given the holy Anna to bud forth and give birth unto the all-pure fruit, the Theotokos, out of a barren root.

        O Cultivator of our thoughts, Planter of our souls, Who hast shown forth barren earth as right fruitful, Thou hast made the holy Anna, a field which before was dry, to become burgeoning, right fertile and fruitful, giving rise to the Theotokos, the all-pure fruit.

        Come ye all, let us gaze upon the city of God born as from a little chamber, which issueth forth from the gate of Anna's womb, yet hath no knowledge of the entry, for the one God and Creator issued forth by this strange path.

        Triadicon: O transcendent Trinity, unoriginate Unity, the multitude of angels hymneth and trembleth before Thee; heaven and earth are in awe of Thee; men bless Thee, and fire serveth Thee as a slave. Everything in creation submitteth to Thee with fear, O holy Trinity.

        Theotokion: O report most new! God becometh the Son of a woman! O seedless birthgiving! A Mother without a husband, a begotten God! O awesome sight! O, the strange conception of the Virgin! O ineffable nativity, truly past all understanding and contemplation!

        Katavasia: O children equal in number to the Trinity: bless ye God, the Father and Creator; hymn ye the Word Who came down and transformed the fire into dew; and the all-holy Spirit, Who giveth life unto all, exalt ye supremely forever!

        Ode IX

        At Ode IX we do not sing the Magnificat, we chant before the irmos and each of the troparia of Canon I this refrain:

        Magnify, O my soul, the all-glorious nativity of the Mother of God!

        Canon I

        Irmos: Thee do we magnify, O blessed and most pure Theotokos, who through thy virginal womb ineffably didst make God incarnate, the Luminary Who shone forth before the sun and hath come to us in the flesh.

        He Who poured forth water from the stone for the rebellious people, through the womb of a barren woman giveth to us, the right submissive nations, the fruit of gladness: thee, O all-pure Mother of God, whom we magnify as is meet.

        Thee, O Theotokos, do we magnify, who hast removed the ancient and precipitous condemnation: the restoration of our first mother, the cause of the reconciliation of our race to God, the bridge to the Creator.

        Before the irmos and troparia of Canon II, we chant this refrain:

        Magnify, O my soul, the Virgin Mary who hath been born of the barren woman!

        Canon II

        Irmos: Foreign to mothers is virginity, and strange is childbirth to virgins; yet both were accomplished in thee, O Theotokos. Wherefore, all of us, the peoples of the world, magnify thee unceasingly.

        Thou hast received a nativity worthy of thy purity, O Mother of God; for, according to the promise, thou wast given to the barren one as a fruit springing forth divinely. Wherefore, all of us, the peoples of the earth, unceasingly magnify thee.

        Fulfilled is the prophecy of him who crieth, for he saith: I shall raise up the tabernacle of sacred David which is fallen, which was a foretype of thee, O pure one, through whom the dust of all men hath been fashioned into a body for God.

        We venerate thy swaddling clothes, O Theotokos. We glorify Him Who gave fruit to her who before was barren, and Who most gloriously opened the womb of her who was unable to give birth. For as God with complete authority, He doeth all things soever He desireth.

        To thee, O Theotokos who wast born of Anna, do we faithfully offer up hymnody as a gift, mothers and virgins glorifying thee as the only Mother and Virgin; and we bow down before thee and hymn and glorify thee.

        Triadicon: Strange is it for the iniquitous to glorify the unoriginate Trinity: the Father, the Son and the Holy Spirit, the uncreated omnipotent Principle, by Whom the whole world is sustained by the hand of His might.

        Theotokion: Within thy womb, O Mother, thou didst contain One of the Trinity: Christ the King, Whom all creation doth hymn and before Whom the ranks of heaven tremble. Him do thou entreat, O most pure one, that our souls be saved.

        As katavasia, we chant here both irmoi of Ode IX of the canon of the Exaltation of the Cross—

        O Theotokos, thou art a mystical paradise, which, untilled, did put forth Christ, by Whom the life-bearing tree of the Cross was planted. Wherefore, worshipping it as it is now raised aloft, we magnify thee.

        Death, which came upon our race through the eating of the tree, hath been abolished by the Cross today; for the curse of our first mother, which fell upon us all, hath been annulled through the Offspring of the pure Mother of God, whom all the hosts of heaven magnify.`
        },
        "09-14": {
            label: "Canon of the Universal Exaltation of the Precious and Life-giving Cross — Tone VIII (Cosmas of Maiuma)",
            text: `Canon of the Cross, the irmoi chanted twice, the troparia repeated to make up 12 in number.

Ode I

Canon of the Cross, the acrostic whereof is: "Having arrayed myself in the Cross, I give utterance to hymnody", the composition of Cosmas of Maiuma, in Tone VIII—

Irmos: Tracing an upright line with his staff, Moses divided the Red Sea for Israel, which was travelling on foot; and striking it a transverse blow, he brought the waters together over the chariots of Pharaoh, thereby inscribing the invincible weapon of the Cross. Wherefore, let us hymn Christ our God, for He hath been glorified.

Of old, Moses, standing between the priests, prefigured in himself the image of Christ's most pure sufferings; for, forming a cross with his outstretched arms, he raised up victory, vanquishing the might of the tyrant Amalek. Wherefore, let us hymn Christ our God, for He hath been glorified.

Upon a pole did Moses set the cure of the deadly and venomous sting of the serpents, and the deliverance therefrom; for to the tree, in the image of the Cross, he bound a serpent which crawleth upon the ground, triumphing over the sinister bane therein. Wherefore, let us hymn Christ God, for He hath been glorified.

The sky showed forth the victory of the Cross to the divinely wise Emperor Constantine, the pious ruler; and therein the audacity of the hostile foe was cast down, delusion was destroyed and the divine Faith spread to the ends of the earth. Wherefore let us hymn Christ our God, for He hath been glorified.

Katavasiae: The irmosi are repeated at the end of each ode.

Ode III

Irmos: The rod of Aaron is taken to be an image of the mystery, for by its budding forth it chose one priest over others; and for the Church, which before was barren, the Tree of the Cross hath now budded forth, for her might and confirmation.

The rough stone, struck, put forth water for a disobedient and hardhearted people, and showed forth the mystery of the divinely elect Church, whereof the Cross is the might and confirmation.

When Christ's all-pure side was pierced by the spear, blood and water flowed therefrom, renewing the covenant and washing sin away, for the Cross is the boast of the faithful, the might and confirmation of kings.

Sessional hymn, in Tone IV: Spec. Mel.: "Go thou quickly before…"—

Rejoicing in thee, O thrice-blessed and life-bestowing Cross, the people celebrate together with the immaterial choirs, the ranks of hierarchs reverently hymn thee, multitudes of monastics and fasters bow down before thee in adoration, and we all glorify Christ Who was crucified on thee.

Ode IV

Irmos: I have heard, O Lord, the mystery of Thy dispensation; I have understood Thy works, and have glorified Thy divinity.

Of old, Moses transformed with a tree the bitter springs in the desert, showing forth the conversion of the gentiles to piety through the Cross.

Jordan, having hidden in its depths an axe-head, gave it forth again through the power of a stick, signifying the cutting off of deception by the Cross and baptism.

In a sacred manner did the people encamp in four divisions; and preceding in this fashion the tabernacle of the witness, they were glorified in the cross-like formation of their ranks.

Wondrously stretched forth, the Cross emitted rays like the sun's, and the heavens declared the glory of our God.

Ode V

Irmos: O thrice-blessed Tree, whereon Christ, our King and Lord, was crucified, and whereby he who beguiled mankind by the tree did fall, when God was nailed in the flesh, Who granteth peace to our souls!

O ever-hymned Tree, whereon Christ was stretched: the whirling sword which guarded Eden stood in awe of thee, O Cross, and the dread cherubim withdrew, when Christ was nailed to thee, Who granteth peace unto our souls.

The adverse powers of the nether world are stricken with fear when the sign of the Cross is traced in the air in which they live, as are the generations of the earthborn and the heavenly, who bend the knee to Christ, Who granteth peace unto our souls.

Having shone forth a divine light and revealed itself in rays of incorruption unto the benighted gentiles astray in error, the divine Cross acquireth them for Christ Who was nailed thereto, and granteth peace unto our souls.

Ode VI

Irmos: Stretching forth his arms in the form of the Cross in the belly of the sea monster, Jonah clearly prefigured the saving passion. And issuing forth after three days, he foreshadowed the transcendent resurrection of Christ God, Who was nailed in the flesh and hath enlightened the world by His rising on the third day.

Bent with age and weighed down with infirmity, Jacob drew himself up when he crossed his arms, showing forth the power of the life-bearing Cross; for God Who was nailed in the flesh hath set aright the obsolescence of the law of the Scripture which was written in shadows, and hath dispelled the soul-destroying disease of deception.

Divine Israel, laying his hands cross-wise upon the heads of the young, revealed that the people who hath the honor of being the elder is a slave to the law. Wherefore, when suspected of erring in so doing, he did not alter the life-bearing image, for, he said, protected by the Cross, the newly established people of Christ God surpass them.

Kontakion of the Cross, in Tone IV—

O Thou Who wast lifted up willingly on the Cross, bestow Thy compassions upon the new community called after Thee, O Christ God; gladden by Thy power Orthodox Christians, granting them victory over all adversaries. May they have as an ally the invincible trophy, Thy weapon of peace.

Ikos: He who was caught up to the third heaven of paradise and heard unspeakable and divine words which the human tongue cannot utter, what writeth he to the Galatians, which, as lovers of the Scriptures, ye have both read and come to understand? God forbid, saith he, that I should glory, save only in the Cross of the Lord, whereon having suffered He slew the passions. Let us all then firmly hold this boast, the Cross of the Lord; for this Wood is our salvation, the invincible trophy, the weapon of peace.

Ode VII

Irmos: The mad command of the ungodly tyrant, breathing forth threats and blasphemy hateful to God, cast the people into confusion. Yet the three youths feared not the fury of the wild beasts, nor the raging blaze; but in the midst of the fire, when the dew-bearing wind blew upon it, they sang: O all-hymned God of our fathers, blessed art Thou!

The first man, tasting of the tree, made his abode in corruption; for, having condemned himself by an inglorious rejection of life, he imparted a certain taint as a corruption to the whole race. But we mortals, gaining utterance through the tree of the Cross, cry out: O all-hymned God of our fathers, blessed art Thou!

Disobedience violated the commandment of God, and the tree brought death to man by its being partaken of unseasonably, for, for the preservation of that which is most precious, the tree of life was forbidden; but God disclosed it to the hapless thief who cried out rightly: O all-hymned God of our fathers, blessed art Thou!

Israel, foreseeing things to come, laid hold of the tip of Joseph's staff, revealing beforehand that the most glorious Cross would seize the power of the kingdom, for it is the victorious boast of kings and a light for those who cry out with faith: O all-hymned God of our fathers, blessed art Thou!

Ode VIII

Irmos: O children, equal in number to the Trinity, bless ye God, the Father and Creator; hymn ye the Word, Who came down and transformed the fire into dew; and the all-holy Spirit, Who imparteth life unto all, exalt ye supremely forever!

O hosts of heaven, chant ye to the exalted Tree which was drenched in the blood of God the Word incarnate, celebrating the restoration of those on earth. Ye people, worship the Cross of Christ, whereby the resurrection of the world is accomplished forever!

O ye mortal stewards of grace, in sacred manner raise on high with your hands the Cross whereon Christ God stood and the spear which pierced the body of God the Word, that all the nations may see the salvation which is of God, glorifying Him forever!

O faithful Christian kings, forechosen by divine decree, be ye glad! And having received from God the precious Cross, rejoice in it, the weapon of victory, for thereby tribes of warriors seeking courage are scattered abroad forever.

We do not sing the Magnificat before Ode IX, but chant instead the refrain of the feast—

Magnify, O my soul, the all-honored Cross of the Lord!

Then we chant the irmos of Canon I: "O Theotokos, thou art a mystical garden…" The second choir likewise chanteth the refrain and the irmos. The refrain is chanted before each of the 6 troparia of Canon I.

Ode IX

Irmos: O Theotokos, thou art a mystical garden of paradise, which, untilled, didst put forth Christ, by Whom the life-bearing Tree of the Cross was planted. Wherefore, worshipping it as it is now raised aloft, we magnify thee.

Let all the trees of the forests rejoice, for their nature hath been sanctified by Him Who planted them in the beginning—Christ Who was stretched out upon the Tree. Wherefore, worshipping it as it is now raised aloft, we magnify thee, O Theotokos.

A sacred horn hath been lifted up, the chief horn for all the divinely wise: the Cross, whereby all the horns of the sinful are noetically broken asunder. Wherefore, worshipping it as it is now raised aloft, we magnify thee, O Theotokos.

Then the refrain of Canon II—

Magnify, O my soul, the exaltation of the life-creating Cross of the Lord!

And the irmos of Canon II: "Death, which came upon our race…" The second choir likewise chanteth the refrain and the irmos. The refrain is chanted before each of the 6 troparia of Canon II.

Canon II

Irmos: Death, which came upon our race through the eating of the tree hath been abolished by the Cross today; for the curse of our first mother, which fell upon us all, hath been annulled through the Offspring of the pure Mother of God, whom all the hosts of heaven magnify.

Thou didst not permit the murderous bitterness of the tree still to remain, O Lord, for thou didst utterly destroy it by the Cross. Wherefore, by a tree Thou didst once sweeten the bitterness of the waters of Marah, prefiguring the activity of the Cross, which all the hosts of heaven magnify.

Those who are continually sunk in the darkness of our forefather, Thou hast raised up by the Cross today, O Lord; for though our nature was brought low through deceit and great lack of restraint, the light of Thy Cross hath again guided all of us aright, which we, the faithful, magnify.

That Thou mightest show forth to the world the image of the Cross venerated among all, O Lord, Thou didst trace its outline in the heavens, in that it is all-glorious, radiant with boundless light: the invincible weapon for the emperor. Wherefore, all the hosts of heaven magnify Thee.

Then, as katavasiae, the ninth irmoi of both canons, with their refrains, after which we make a prostration.`
        },
        "11-21": {
            label: "Canon of the Entry of Our All-holy Mistress, the Theotokos and Ever-virgin Mary, into the Temple",
            text: `Two canons of the Theotokos: the first with 8, the irmos being chanted twice, followed by 6 troparia; and the second like the first, with 8, the irmos being chanted twice, followed by 6 troparia.

Ode I

Canon I of the Theotokos, the acrostic whereof is: "O Mistress, grant me the grace of discourse", the composition of George, in Tone IV—

Irmos: I will open my mouth, and with the Spirit will it be filled; and I shall utter discourse unto the Queen and Mother, and shall appear, keeping splendid festival; and, rejoicing, I will hymn her Entry.

O all-pure one, we know thee to be a treasury of wisdom and an ever-flowing fountain of grace; and we pray thee: Rain down drops of knowledge upon us, that we may praise thee forever.

Being a temple and palace more exalted than the heavens, O all-pure one, thou wast set apart in the Temple of God to be prepared as a divine dwelling-place for His advent.

Shining with the Light of grace, the Theotokos hath illumined all and assembled them to adorn her most splendid festival. Come ye, let us draw nigh to her!

The glorious portal which thoughts cannot pass, having opened the doors of the Temple of God, doth now command us that have assembled to delight in her divine wonders.

Canon II of the Theotokos, the composition of Basil, in Tone I—

Irmos: Let us all chant a hymn of victory unto God, Who hath wrought marvelous wonders with His upraised arm and saved Israel, for He is glorious.

Let us hasten today, honoring the Theotokos with hymns, and let us celebrate a spiritual feast; for she is offered to God in the temple as a gift.

With songs let us hymn the glorious arrival of the Theotokos; for today, as the prophets foretold, she is borne into the temple as a gift of great price, though she is herself the temple of God.

The blameless Anna rejoiced, maternally bringing a gift of great price to God in the temple; and with her Joachim keepeth splendid festival.

Of old, David, thine ancestor, hymned thee, O Virgin Bride of God, calling thee the daughter of Christ the King; and, having given birth to Him, as a Mother thou didst feed Him with milk as a babe.

Three years of age in the flesh, the Theotokos is borne unto the Lord; and, receiving her, Zachariah the priest of God hath installed her in the temple, rejoicing.

Ye candle-bearing virgins, join chorus! O ye mothers, do ye likewise today! Chant ye unto the Queen and Mother who cometh to the temple of Christ the King!

Glory…: Triadicon: O Trinity One in essence — Father, Word and Holy Spirit: Thee do we glorify with faith as the Creator of all, and unto Thee do we piously cry aloud: Save us, O God!

Now & ever…: Theotokion: Arrayed in purple vesture dyed in thy blood, O all-pure one, God the King, issuing forth, hath restored the whole human race in His compassion.

Katavasia: Christ is born, give ye glory! Christ cometh from heaven, meet ye Him! Christ is on earth, be ye exalted! O all the earth, sing ye unto the Lord, and chant with gladness, ye people, for He hath been glorified!

Ode III

Canon I

Irmos: O Theotokos, thou living and abundant fountain: in thy divine glory establish those who hymn thee and spiritually form themselves into a choir; and vouchsafe unto them crowns of glory.

Receiving the pure and undefiled one, who is more splendid than all creation, the animate bridal chamber of God, the beautiful Temple and chamber doth today appear as that which adorneth the bride for her wedding.

David, preceding the chorus, doth leap and dance with us, and declareth thee, O all-pure one, the queen adorned, who standeth in the Temple before our King and God, O most pure one.

From her, from whom transgressions went forth among the human race, hath her correction and incorruption blossomed forth, the Theotokos, who is led today into the house of God.

The angelic armies and a multitude of all men leap for joy, and they advance as lamp-bearers before thy countenance, proclaiming thy majesty in the house of God.

Canon II

Irmos: Let my heart be made steadfast in Thy will, O Christ God, Who didst establish the second heaven above the waters and didst found the earth upon the waters, O Almighty One.

O ye who love the feasts of the Church, let us keep festival and rejoice together in spirit, revelling today on the holy feast of the daughter of the King, the Mother of our God.

Rejoice today, O Joachim! Be thou glad in spirit, O Anna, leading to the Lord the three-year old child born of thee, as though she were a pure and most immaculate heifer.

Mary, the Theotokos, the habitation of God, is led into the holy temple, being three years of age in the flesh; and, going before her, virgins bear lighted lamps.

The pure ewe-lamb of God, the undefiled turtle-dove, the tabernacle containing God, the sanctuary of glory, hath chosen to dwell within the holy tabernacle.

With hymns let the Bride of God be praised, who is more spacious than the heavens and more exalted than the heavenly hosts, and who, though but three years in the flesh, is yet mature in spirit.

Celebrating the arrival of the Theotokos in the precincts which cannot be entered, joyously bearing candles noetically today, let us draw nigh unto the temple with the virgins.

Ye priests of God, clothe yourselves in righteousness through grace and go forth in splendor to greet the daughter of God the King, granting her entry into the Holy of holies.

Glory…: Triadicon: The Father is light; His Son is light; and the comforting Spirit is also light: for the Trinity, shining forth as from a single sun, doth divinely illumine and preserve our souls.

Now & ever…: O pure one, the prophets proclaimed thee as the ark of the sanctuary, the gold censer, the lampstand and table; and we hymn thee as the tabernacle which held God.

Katavasia: To Christ God, the Son Who was begotten of the Father without corruption before time began, and in latter times without seed became incarnate of the Virgin, let us cry aloud: O Lord Who liftest up our horn, holy art Thou!

Sessional hymn, in Tone IV: Spec. Mel.: "Joseph marvelled…"—

Tell us, O David: what is this present festival? Who is she whom thou once didst hymn in the Book of Psalms as daughter, divine Maiden and Virgin? "The virgins that follow after her, together with those near her," said he, "shall be mystically brought unto the King." Make this a wondrous and universal feast for those who cry: The Theotokos is come unto us, the mediatress of salvation!

Glory…, Now & ever…, in the same tone & melody—

With gladness Mary, the Theotokos, is all-gloriously brought into the house of God: the unblemished ewe-lamb, the undefiled bridal-chamber, whom the angels of God escort with faith and all the faithful ever call blessed and hymn her unceasingly with a loud voice in thanksgiving: Thou art our glory and salvation, O most immaculate one!

Ode IV

Canon I

Irmos: Perceiving the inscrutable counsel of God—the Incarnation of Thee, the Most High, from the Virgin—the Prophet Habbakuk cried aloud: Glory to Thy power, O Lord!

The Temple of God, receiving today the portal through whom none may pass, hath ceased to perform any service of the Law, crying: Truly truth hath appeared to those who are on earth!

The mountain overshadowed, which Habbakuk beheld of old, prefigured her who hath made her abode in the inaccessible chambers of the Temple, flourishing with virtues, for she doth cover the ends of the earth therewith.

All the earth hath seen most glorious things, things strange and marvellous; for the Virgin, receiving food from an angel, doth receive tokens of God's dispensation.

Revealed as temple and palace and animate heaven, O divine bride of the King, thou art brought today to the Temple of the Law to be kept for Him, O all-pure one.

Canon II

Irmos: Foreseeing in the Spirit the incarnation of the Word, O Prophet Habbakuk, thou didst announce, crying out: When the years draw nigh, Thou shalt be acknowledged; when the season cometh, Thou shalt be shown forth! Glory to Thy power, O Lord!

O Prophet Isaiah, prophesy unto us: Who is the Virgin who will conceive in her womb, who, springing forth from the root of Judah, shall give birth to the right glorious Fruit of the holy seed of King David?

O virgins, commence ye to chant hymns, holding candles in your hands, and praising the arrival of the pure Theotokos who now cometh to the temple of God, and celebrating with us!

Rejoice now, O Joachim and Anna, leading into the temple of the Lord, like a heifer three years of age, the pure one born of you, who will become the Mother of God.

As the holy of holies, O pure one, thou didst love to dwell in the holy temple, and thou dost remain, conversing all-gloriously with the angels, receiving bread from heaven, O Virgin, thou nourisher of Life.

Having given birth beyond hope to the all-pure Virgin, Joachim and Anna piously vowed to offer her unto God; and they fulfill their oath, giving up to the house of God as a sacrifice her who was born of them.

The rod of Aaron once budded forth, prefiguring the divine birthgiving, O pure one: for thou dost conceive without seed and hast remained incorrupt; and even after giving birth thou art shown to be a virgin, nurturing the God of all as an infant.

Ye virgins and mothers, haste ye together with us to honor the Virgin and Mother who hath been born; and let us all splendidly celebrate her as an unblemished sacrifice brought forth as fruitful for God.

Glory…: Triadicon: Let us piously glorify the true God, the Trinity of Persons, the Unity in image, Whom the ranks of angels and archangels hymn as the Master of creation, and whom men ever worship with faith.

Now & ever…: Theotokion: O all-pure and pure one, unceasingly entreat thy Son and God to Whom thou gavest birth in the flesh, that He deliver all thy servants from the multifarious snares of the devil and from every assailing temptation.

Katavasia: A rod from the root of Jesse and blossom therefrom, O Christ, Thou didst spring forth from the Virgin; from the mountain overshadowed and densely wooded hast Thou come, incarnate of her who knew not man, O Thou praised and immaterial God. Glory to Thy power, O Lord!

Ode V

Canon I

Irmos: All things are filled with awe at thy divine glory; for thou, O Virgin who hast not known wedlock, didst contain within thy womb Him Who is God over all, and gavest birth to the timeless Son, granting peace unto all who hymn thee.

The all-pure Virgin, the glorious sanctity and sacred offering which is brought today to the Temple of God, is preserved as a habitation for our one God, the King of all, as He Himself doth know.

Zachariah, beholding once the beauty of thy soul, cried out in faith: Thou art the deliverance, thou art the joy of all, thou art our restoration, through whom the Uncontainable One shall appear unto me contained.

O, thy wonders which pass understanding, O all-pure one! Strange is thy birthgiving; strange is the manner of thy growth; strange also, most glorious and unutterable by men, are all thy wonders, O Bride of God.

A most radiant lamp, O Bride of God, thou hast shone forth today in the house of the Lord and dost illumine us with the precious gifts of thy wonders, O pure and all-hymned Theotokos.

Canon II

Irmos: Shine forth thy radiant and everlasting light upon us who rise early unto the judgments of Thy commandments, O Master Christ our God, Who lovest mankind.

O all ye Orthodox, let us take up lamps, hastening to glorify the Mother of God, for she is led to the Lord today as a right acceptable sacrifice.

Let thine ancestors be glad today, O Mistress; and let her who gave thee birth rejoice with thy father, for their fruit is offered to the Lord.

Celebrating with faith, let us all hymn the unblemished heifer, most glorious and of great renown, for she gave birth to the divine Bullock in the flesh.

The divine tokens of thy betrothal, of thy birthgiving which passeth understanding, O pure Virgin, are recorded today by the Holy Spirit in the house of God.

Let the outer doors of the glory of our God be opened, and let them receive as an unblemished heifer of three years the Mother of God, who will not taste of wedlock.

Let us hymn the Ever-virgin who hath become the Mother of God, the most honorable mountain overshadowed; for she hath shone forth light upon the ends of the earth.

Glory…: Triadicon: Glorifying the one all-originating and ever-existing Godhead, we worship the indivisible Essence in three Persons, equal in honor and glory.

Now & ever…: Theotokion: Ever delivered from misfortunes and tribulations, O Theotokos, we have acquired thy prayer as a right tranquil haven and an invincible bulwark amid evil circumstances.

Katavasia: As God of peace and Father of compassion, Thou didst send Thine Angel of Great Counsel, Who granteth us peace. Therefore, guided to the light of knowledge divine, and waking at dawn out of the night, we glorify Thee, Who lovest mankind.

Ode VI

Canon I

Irmos: Celebrating this divine and most honored festival of the Mother of God, come, ye divinely wise, let us clap our hands and glorify God Who was born of her.

Thou Who hast upheld all things by Thy word hast hearkened to the prayer of the righteous ones. Wherefore, Thou hast loosed the infirmity of the barren woman, in that Thou art compassionate, and hast given them her who is the cause of joy.

Desiring to make His salvation known to the gentiles, the Lord hath now taken from among men her who hath not known wedlock, as a sign of reconciliation and renewal.

As a house of grace, wherein treasures of the ineffable dispensation of God are laid up, O most pure one, thou didst share in unfading delight in the Temple.

Receiving thee as a royal diadem, O Bride of God, the Temple hath been made splendid and hath mounted to higher things, beholding in thee the fulfillment of the prophecies.

Canon II

Irmos: Emulating the Prophet Jonah, I cry out: O Good One, free me from corruption! O Savior of the world, save me who cry out: Glory to Thee!

O ye faithful, let us celebrate the spiritual feast of the Mother of God, chanting piously; for she is more holy than the heavenly intelligences.

With spiritual hymns let us praise the Mother of the Light, O ye faithful, for she hath appeared to us today, going forth into the temple of God.

The unblemished ewe-lamb, the pure turtle-dove, is brought to dwell in the house of God, for, as immaculate, she was chosen beforehand to be the Mother of God.

The temple of God, the heavenly tabernacle, maketh entry into the temple of the law, and from her hath the Light shone forth upon us who are in darkness.

A child in the flesh, though perfect in soul, the holy ark entereth the house of God, to be nurtured with grace divine.

By thine entreaties free us who have recourse unto thee, from all temptations and spiritual misfortunes, O Mother of Christ God.

Glory…: Triadicon: O Father, Son and upright Spirit, Unity in three Hypostases, indivisible Trinity: have mercy upon those who worship Thy divine might.

Now & ever…: Theotokion: Contained in thy womb, O all-pure Mother of God, He Whom nought could contain issued forth from thee in two natures: God and man.

Katavasia: The sea monster thrust forth, like a babe from the womb, Jonah whom it had swallowed; and the Word, Who dwelt within the Virgin and took flesh of her, issued forth, preserving her incorrupt. He kept her who gave Him birth unharmed, for He Himself was not subject to corruption.

Kontakion of the feast, in Tone IV: Spec. Mel.: "Having been lifted up…"—

The most pure temple of the Savior, the precious bridal chamber and Virgin, the sacred treasury of the glory of God, is on this day brought into the house of the Lord, bringing with her the grace that is in the divine Spirit. To her do the angels of God chant the hymn: She is the heavenly tabernacle!

Ikos: Beholding the grace of the ineffable and divine mysteries of God made plainly manifest in and filling the Virgin, I rejoice; yet I know not how to understand this strange and ineffable image. How hath the pure one alone been shown to be above all creation, visible and noetic? Wherefore, desiring to praise her, I am greatly in awe in mind and word; yet, making bold, I proclaim and magnify her, saying: She is the heavenly tabernacle!

Ode VII

Canon I

Irmos: The divinely wise youths worshipped not a creation rather than the Creator, but, manfully trampling the threat of the fire underfoot, they rejoice, chanting: Blessed art Thou, the all-hymned God of our fathers!

Lo, today a joyous spring hath burst forth upon the ends of the earth, enlightening our souls, thoughts and minds with grace: the festival of the Theotokos. Let us mystically hold feast this day!

Let all things—heaven and earth, the ranks of angels and the multitude of men—bear gifts today unto the Queen and Mother of God; and let them cry out: Our joy and deliverance is brought to the Temple!

The Scriptures have come to pass, the Law hath faded like a shadow, and rays of grace have shone forth upon thee who hast entered into the Temple of God, O pure Virgin Mother, wherein thou art blessed.

Heaven and earth and the netherworld are subject to thine Offspring as Creator and God, O most pure one, and every nation of mortals doth confess that the Lord and Savior of our souls hath appeared.

Canon II

Irmos: The furnace was bedewed, O Savior, and the children, dancing, chanted: O God of our fathers, blessed art Thou!

O ye who love the feasts of the Church, let us join chorus and hymn the pure Mistress, honoring Joachim and Anna as is meet.

Prophesy, O David, giving utterance in the Spirit: The virgins that follow after thee shall be brought to thee into the temple of the Queen and Mother.

The ranks of the angels rejoiced and the souls of the righteous were gladdened, for the Mother of God is led into the Holy of holies.

Receiving heavenly food, she who was to become the Mother of Christ God in the flesh excelled in wisdom and grace.

Abiding in the temple of God as a most sacred vessel, the immaculate Mary rejoiced in body and spirit.

Thy chaste parents brought thee to the innermost chamber of the temple, O all-pure one, to be raised as the dwelling-place of Christ God in strange manner.

Glory…: Triadicon: We glorify the indivisible Trinity, and we hymn the one Divinity: the Father, the Word and the most Holy Spirit.

Now & ever…: Theotokion: The Lord to Whom thou gavest birth, do thou entreat, in that He is compassionate by nature, O Theotokos, that He save the souls of those who hymn thee.

Katavasia: The children raised together in piety, disdaining the ungodly command, feared not the threat of the fire, but, standing in the midst of the flame, they chanted: O God of our fathers, blessed art Thou!

Ode VIII

Canon I

Irmos: Hearken, O pure Virgin Maiden! Let Gabriel give utterance unto the true and ancient counsel of the Most High: "Make ready to receive God, for through thee hath the Infinite One come to dwell with men!" Wherefore, rejoicing, I cry out: Bless the Lord, all ye works of the Lord!

Anna, once, leading the all-pure temple to the house of God, faithfully said unto the priest, crying aloud: Now accept thou this child, given me by God; lead her into the Temple of the Creator; and, rejoicing, chant unto Him: Bless the Lord, all ye works of the Lord!

And Zachariah then, beholding them in the Spirit, said unto Anna: Thou dost bring hither the true Mother of Life, whom the prophets of God have clearly foretold as the Theotokos! How, therefore, can the Temple hold her? Wherefore, marvelling, I cry out: Bless the Lord, all ye works of the Lord!

The handmaid of God have I been, answered Anna unto him, and I call upon Him with faith and prayer to accept the fruit of my birth-pangs, that, having received this child, I might bring her who was born unto Him Who bestowed her. Wherefore, I cry aloud: Bless the Lord, all ye works of the Lord!

Truly this is a matter of the Law, the priest said to her, and strange doth this thing seem unto me, beholding her who doth most gloriously surpass the holy ones in grace led into the house of God. Wherefore, rejoicing, I cry out: Bless the Lord, all ye works of the Lord!

Canon II

Irmos: Him of Whom the angels and all the hosts of heaven stand in awe as their Creator and Lord, hymn, ye priests; glorify, ye children; bless, ye people, and exalt Him supremely for all ages!

Joachim rejoiceth today in splendor, and the blameless Anna offereth to the Lord God a sacrifice: the holy daughter given her according to God's promise.

The holy David and Jesse render praise, and Judah offereth homage; for the pure Virgin, of whom the preëternal God was born, grew forth as fruit from their root.

The all-pure Mary, the animate tabernacle, is brought today into the house of God; and Zachariah taketh her in his arms as the sanctified treasure of the Lord.

O ye faithful, let us truly honor the Virgin Mother of God, who is blessed by the hands of the priests, as the portal of salvation, the noetic mountain and the animate ladder.

O ye prophets, apostles and martyrs of Christ, ye ranks of angels, and all ye mortals, with hymns let us honor the pure Virgin as the blessed Mother of the Most High.

O pure and most immaculate one, they who divinely gave thee birth have brought thee to the temple as a pure sacrifice; and thou dost strangely abide in the impassable precincts of God, to be prepared as the dwelling-place of the Word.

We bless the Father, the Son and the Holy Spirit: the Lord.

Triadicon: Let the Thrice-holy One be hymned: the Father, the Son and the Holy Spirit, the indivisible Unity, the one Godhead, Who holdeth all creation in His hand for all ages!

Now & ever…: Theotokion: The Word Who is without beginning receiveth a beginning in the flesh, being born of the Virgin Maiden as was His good pleasure: both God and man, restoring us who before were fallen, in His extreme loving-kindness.

Katavasia: The dew-bearing furnace showed forth the image of a supernatural wonder; for it burned not the youths whom it had received, just as the fire of the Godhead burned not the Virgin, whose womb it entered. Wherefore, chanting, let us sing: Let all creation bless the Lord and exalt Him supremely for all ages!

At Ode IX we do not chant the Magnificat, but sing instead the refrains of the feast:

The angels, beholding the entry of the all-pure one, were amazed to see the Virgin enter into the Holy of holies.

The irmos of Canon I is then chanted: "May the hands of the profane in nowise touch…", whereupon the second choir chanteth the same refrain and irmos. A refrain is also chanted before each troparion of the ode, alternating between both choirs.

Ode IX

Canon I

Irmos: May the hands of the profane in nowise touch the Theotokos, the animate ark of God; but let the lips of the faithful, unceasingly chanting the cry of the angel, joyfully cry out: Truly thou art more highly exalted than all, O pure Virgin!

Refrain: The angels, beholding the entry of the most pure one, were amazed at how she entered into the Holy of holies with glory.

O pure Theotokos, as thou hast the most radiant beauty of purity of soul and art full of the grace of God from heaven, with the eternal light thou dost ever enlighten those who cry out with joy: Truly thou art more highly exalted than all, O pure Virgin!

Refrain: The angels, beholding the entry of the Virgin, were amazed at how she entered into the Holy of holies all-gloriously.

Thy wonder doth surpass the power of words, O pure Theotokos, for in thee I perceive a body impervious to the movement of sin. Wherefore, thankfully I cry out to thee: Truly thou art more highly exalted than all, O pure Virgin!

Refrain: The angels and we men honor the entry of the Virgin: how she entered the Holy of holies with glory.

Most gloriously did the Law prefigure thee, O pure one, as the tabernacle, the divine jar, the awesome ark, the veil, the staff, the inviolable temple and portal of God. Wherefore, all these things teach us to cry to thee: Truly thou art more highly exalted than all, O pure Virgin!

Refrain: The angels, beholding the entry of the Virgin, were amazed to see her enter the Holy of holies in God-pleasing manner.

In hymnody David cried out to thee prophetically, calling thee the daughter of the King in the comeliness of thy virtues, beholding thee standing, elaborately adorned, at the right hand of God. Wherefore, in prophecy he cried out: Truly thou art more highly exalted than all, O pure Virgin!

Refrain: O ye angels, leap up with the saints! Ye virgins, dance together! For the divine Maiden hath entered into the Holy of holies!

Foreseeing thee who art pleasing to God, Solomon proclaimed thee to be the bower of the King, the living and sealed fountain, from whence untroubled waters have issued forth for us who cry out with faith: Truly thou art more highly exalted than all, O pure Virgin!

Refrain: O ye angels and men, let us magnify the Virgin with hymns; for in godly manner she hath entered the Holy of holies.

O Theotokos, thou givest to my soul the tranquility of thy gifts, pouring forth life upon those who honor thee as is meet, defending, protecting and preserving them thyself, that they might cry to thee: Truly thou art more highly exalted than all, O pure Virgin!

Then the first choir chanteth the refrain of Canon II of the feast:

Refrain: Magnify, O my soul, her who was led into the temple of the Lord and blessed by the hands of the priest.

Then the irmos is chanted: "The radiant cloud…" The second choir then chanteth the same refrain and irmos of the feast. And before each troparion of the canon we chant the above festal refrain.

Canon II

Irmos: The radiant cloud upon which the unoriginate Master of all descended from heaven, like rain upon the fleece, and of whom He was incarnate, becoming man for our sake, let us all magnify as the pure Mother of God.

Refrain: Magnify, O my soul…

The divine maiden Mary, the fruit of the promise, issued forth from the righteous Joachim and Anna, and, a babe in the flesh, she is brought into the holy sanctuary like pleasing incense, to dwell in the Holy of holies.

Refrain: Magnify, O my soul…

With hymns let us praise her who was a babe by nature and was supernaturally revealed as the Mother of God; for she is led unto the Lord in the temple of the law, as the fragrance of sweet savor for the righteous, as the spiritual fruit of her righteous parents.

Refrain: Magnify, O my soul…

O ye faithful, with the angel let us as is meet cry out to the Theotokos "Rejoice!" Rejoice, O most comely Bride! Rejoice, O radiant cloud, from whom the Lord hath shone forth upon us who sit in the darkness of ignorance! Rejoice, thou hope of all!

Refrain: Magnify, O my soul…

O pure Mary Mother of God, thou Holy of holies, from the snares of the enemy and from all heresy and tribulation do thou free us by thy supplications, who bow down with faith before the image of thy holy countenance.

Refrain: Magnify, O my soul…

With the Angel Gabriel all creation uttereth a fitting hymn to the Theotokos, crying: Rejoice, O most immaculate Mother of God, by whom we have been delivered from the primal curse, coming to share in incorruption!

Refrain: Magnify, O my soul…

O Virgin, thou hast been shown to be greater than the cherubim, more exalted than the seraphim and more spacious than the heavens, for thou didst contain within thy womb our God Whom nought can contain, and gavest birth to Him ineffably. Him do thou earnestly beseech in our behalf.

Refrain: Magnify, O my soul, the dominion of the indivisible Godhead in three Hypostases.

Triadicon: Let us glorify the indivisible Trinity, the Essence in three Hypostases, the undivided glory, Who, in a single Godhead, is unceasingly hymned in heaven and on earth, piously worshipping the Father, the Son and the Spirit.

Refrain: Magnify, O my soul, the all-pure Theotokos, who is more honorable and more glorious than the armies on high.

O Virgin Theotokos, pray thou, that we who flee with faith beneath thy compassion and piously worship thy Son as God and Lord of the world be delivered from corruption, misfortunes and all manner of temptations.

Then both choirs, descending together, chant the refrain of Canon I, followed by the katavasia:

The angels, beholding the entry of the all-pure one, were amazed to see the Virgin enter into the Holy of holies.

A strange and most glorious mystery do I behold: the cave is heaven; the Virgin, the throne of the cherubim; the manger, the place wherein lay Christ God, Whom naught can contain, Whom praising, we magnify.`
        },
    }
};