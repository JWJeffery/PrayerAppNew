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
    }
};