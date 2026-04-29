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
    }
};