# COE-IIB — Church of the East Saint-Tag Audit

**Status:** Complete — source-data corrections applied  
**Phase:** COE-IIB  
**Audit date:** 2026-03-06  
**Source-data pass:** 2026-03-06  
**Depends on:** COE-IIA (complete)

---

## 1. Audit basis

Source files read: `data/saints/identities.json`, `data/saints/commemorations.json`

Total COE-tagged commemoration rows: **375**  
Total unique identity IDs carrying COE tag: **314**  
— of which COE-only (no other tradition): **166**  
— of which COE + at least one other tradition: **148**

### Eligibility criteria (from `structure.json`)

**INCLUDE** only:
- Pre-schism and universally ancient
- Explicitly East Syriac (Hudra manuscript evidence)
- Apostolic or biblical figures
- Persian/Mesopotamian martyrs

**EXCLUDE:**
- Eastern Orthodox saints not in COE usage
- Saints in Roman Martyrology but not in Hudra
- Included only because they are "early enough"
- Post-7th century Western saints
- Augustine of Hippo — explicitly named
- Gregory the Great — explicitly named as disputed
- Any saint tagged COE solely by proximity to EOR

### Bucket definitions

| Bucket | Meaning |
|--------|---------|
| `KEEP_CANDIDATE` | Plausible Layer 3 individual. Retain COE tag. Eligible for future display once tag removals and duplicate consolidation are applied. |
| `REMOVE_COE_TAG` | COE tag has no defensible basis. Remove from `commemorations.json`. |
| `LAYER2_NOT_LAYER3` | Not an individual saint slot; belongs in Layer 2 feast/commemoration logic or the season engine. Must not appear in Layer 3 rendering. COE tag may be retained for Layer 2 purposes where appropriate. |
| `NEEDS_REVIEW` | Uncertain; cannot classify without external Hudra evidence or pending identity consolidation. Do not display. |

---

## 2. Classifications

### 2A. COE-native individuals — KEEP_CANDIDATE

Foundational figures of the Church of the East, Persian/Mesopotamian martyrs, and
East Syriac monastics documented within the tradition's own hagiography.

| identity_id | Name | Basis |
|---|---|---|
| `mar-narsai` | Mar Narsai | Doctor of the East Syriac school; "Harp of the Spirit"; Nisibis. |
| `mar-babai-the-great` | Mar Babai the Great | "Pillar of the Church of the East"; Great Monastery, Mt. Izla. |
| `mar-addai` | Mar Addai | Apostle to Edessa; founder of the East Syriac apostolic chain. |
| `saint-addai-the-apostle` | Saint Addai the Apostle | Alternate identity for Mar Addai; same person and basis. |
| `mar-mari` | Mar Mari | Disciple of Addai; Apostle of the East; his name is in the Anaphora of Addai and Mari. |
| `mar-mari-the-apostle` | Mar Mari the Apostle | Primary apostle identity for Mar Mari. |
| `st-mari-the-bishop` | St. Mari the Bishop | Early bishop and disciple of Addai; in the Addai-Mari chain. |
| `mar-shimon-bar-sabbae` | Mar Shimon Bar Sabbae | Catholicos-Patriarch martyred 341 AD in Shapur II's Great Persecution. |
| `mar-shimun-bar-sabbae` | Mar Shimun Bar Sabbae | Secondary identity form for the same Catholicos-martyr. |
| `mar-qardagh` | Mar Qardagh | Persian governor-martyr; explicitly Assyrian/Persian. |
| `mar-kardagh` | Mar Kardagh | Variant identity for Mar Qardagh; COE-only. |
| `mar-pethion` | Mar Pethion | Martyr and evangelist of the Persian interior. |
| `saint-pethion` | Saint Pethion | Secondary identity, same martyr. |
| `mar-abraham-of-kashkar` | Mar Abraham of Kashkar | Reviver of East Syriac monasticism; founder of the Great Monastery. |
| `mar-isaac-of-nineveh` | Mar Isaac of Nineveh | Mystic bishop; native of Beth Qatraye; major COE spiritual writer. |
| `saint-isaac-of-nineveh` | Saint Isaac of Nineveh | Secondary identity, same person. |
| `mar-papa-bar-aggai` | Mar Papa bar Aggai | Early Catholicos of Seleucia-Ctesiphon; founder of the patriarchal see. |
| `saint-ya-qub-james-of-nisibis` | Saint Ya'qub (James) of Nisibis | Bishop of Nisibis; at Council of Nicaea 325 AD; explicitly COE. |
| `saint-jacob-of-nisibis` | Saint Jacob of Nisibis | Secondary identity, same bishop. |
| `mar-yakob-of-nisibis` | Mar Yakob of Nisibis | Third identity form for the same bishop. |
| `mar-balai` | Mar Balai | East Syriac hymnographer; identity description names this explicitly. |
| `saint-ahudemmeh` | Saint Ahudemmeh | Bishop and missionary to the Arabs; clearly East Syriac. |
| `mar-abdisho` | Mar Abdisho | Metropolitan and author; East Syriac literary tradition. |
| `saint-sawrisho-of-beth-garmi` | Saint Sawrisho of Beth Garmi | Monk and ascetic, 6th century; Beth Garmi is in the COE heartland. |
| `mar-behnam-and-sarah` | Mar Behnam and Sarah | Martyred royal siblings; major COE pilgrimage site at Mar Behnam monastery. |
| `mar-augin` | Mar Augin | "Pearl of the East"; brought Egyptian monasticism to Mesopotamia. |
| `mar-augin-commemoration` | Mar Augin (Commemoration) | Secondary commemoration of the same figure. |
| `mar-augin-saint-eugene` | Mar Augin (Saint Eugene) | Tertiary identity form for the same figure. |
| `mar-awgin-and-his-disciples` | Mar Awgin and his Disciples | Corporate feast of the monastic founder and his school. |
| `saint-ephrem-the-syrian` | Saint Ephrem the Syrian | Deacon-hymnographer of Nisibis and Edessa; hymns used directly in the Hudra. |
| `saint-ephraim-the-syrian` | Saint Ephraim the Syrian | Duplicate identity for the same person. |
| `saint-ephrem-of-edessa` | Saint Ephrem of Edessa | Third identity form for the same person. |
| `saint-shamuni-and-sons` | Saint Shamuni and Sons | Maccabean martyrs; specifically venerated in COE liturgy. |
| `virgin-martyr-febronia-of-nisibis` | Virgin Martyr Febronia of Nisibis | Martyr at Nisibis, 304 AD; Nisibis location anchors COE relevance. |
| `mar-awa-i` | Mar Awa I | Catholicos and 6th-century reformer; explicitly COE. |
| `mar-awa` | Mar Awa | Catholicos and scholar. |
| `mar-awa-catholicos` | Mar Awa Catholicos | Alternate identity form for a COE Catholicos. |
| `saint-awa-catholicos` | Saint Awa Catholicos | Alternate form; same figure. |
| `mar-timothy-i` | Mar Timothy I | Catholicos; author of apologetic letters; 8th-century COE. |
| `saint-john-bar-malkeh` | Saint John Bar Malkeh | COE bishop and theologian, 8th century. |
| `mar-dadisho` | Mar Dadisho | Catholicos and ascetic. |
| `mar-sabrisho` | Mar Sabrisho | Catholicos and monk. |
| `mar-gregory-the-wonderworker` | Mar Gregory the Wonderworker | Identity description explicitly says "East Syriac feast." |
| `saint-hardut` | Saint Hardut | COE-only; martyr and witness. |
| `saint-faraj-of-shiraz` | Saint Faraj of Shiraz | Martyr; Shiraz is in Persia — plausible Persian martyr. |
| `mar-giwargis` | Mar Giwargis | Martyr and bishop; name is East Syriac form of George. |
| `mar-zaia` | Mar Zaia | Description explicitly says "East Syriac tradition." |
| `mar-pinhas` | Mar Pinhas | Martyr; COE-only. |
| `mar-sliwa` | Mar Sliwa | Martyr; COE-only. |
| `mar-barsabba` | Mar Barsabba | Abbot; COE-only. |
| `mar-saba` | Mar Saba | Monk and miracle worker; COE-only. |
| `mar-shalita` | Mar Shalita | Disciple of Mar Augin; COE-only. |
| `mar-mushi` | Mar Mushi | Monk and writer; COE-only. |
| `mar-abda` | Mar Abda | Bishop and martyr; COE-only. |
| `mar-shmon` | Mar Shmon | Bishop and martyr; COE-only. |
| `mar-yohannan` | Mar Yohannan | Bishop and confessor; COE-only. |
| `mar-elias` | Mar Elias | Monk; COE-only. |
| `mar-ishaia` | Mar Ishaia | Monk and ascetic; COE-only. |
| `mar-zeia` | Mar Zeia | "The traveler and ascetic"; COE-only. |
| `mar-adar` | Mar Adar | Abbot; COE-only. |
| `mar-michael` | Mar Michael | Abbot; COE-only. |
| `mar-shimon` | Mar Shimon | Bishop and witness; COE-only. |
| `mar-george-the-martyr` | Mar George the Martyr | Description says "Persian commemoration of the Great Martyr." |
| `mar-menas` | Mar Menas | "The Great Martyr and soldier"; COE form of an early martyr. |
| `martyrs-of-the-east` | Martyrs of the East | Corporate commemoration of early East Syriac martyrs. |
| `saint-simon-the-zealot` | Saint Simon the Zealot | Apostle; traditional martyrdom in Persia gives specific COE standing. |
| `mar-shmon-the-second` | Mar Shmon the Second | COE Patriarch. |
| `mar-archelaus` | Mar Archelaus | Martyr; COE-only. |
| `mar-abraham` | Mar Abraham | Catholicos and missionary; COE-only. |
| `mar-abraham-the-great` | Mar Abraham the Great | Monastic reformer; COE-only. |

### 2B. Apostles and biblical figures — KEEP_CANDIDATE

Apostolic and biblical figures with clear COE liturgical standing. The `shlihe` season
explicitly calls for apostolic commemorations per `structure.json`.

| identity_id | Name | Note |
|---|---|---|
| `saint-thomas-the-apostle` | Saint Thomas the Apostle | Apostle to India and the East; Thomas Christianity has foundational COE standing. |
| `mar-toma-apostle-thomas` | Mar Toma (Apostle Thomas) | COE-native form of Thomas; explicitly "Apostle of the East." |
| `saint-matthew-the-apostle` | Saint Matthew the Apostle | Apostle. |
| `saint-mark-the-evangelist` | Saint Mark the Evangelist | Apostolic evangelist. |
| `saint-luke-the-evangelist` | Saint Luke the Evangelist | Apostolic evangelist. |
| `saint-john-the-apostle` | Saint John the Apostle | Apostle. |
| `saints-peter-and-paul-apostles` | Saints Peter and Paul | Universal apostolic feast. |
| `saint-andrew-the-apostle` | Saint Andrew the Apostle | Apostle. |
| `saint-barnabas-the-apostle` | Saint Barnabas the Apostle | Apostle. |
| `saint-bartholomew-the-apostle` | Saint Bartholomew the Apostle | Apostle. |
| `saint-philip-the-apostle` | Saint Philip the Apostle | Apostle. |
| `saint-jude-thaddeus` | Saint Jude Thaddeus | Apostle. |
| `saints-simon-and-jude` | Saints Simon and Jude | Apostles. |
| `saint-james-the-brother-of-the-lord` | Saint James the Brother of the Lord | First Bishop of Jerusalem; apostolic. |
| `saint-stephen-protomartyr` | Saint Stephen, Protomartyr | First martyr; universally ancient. |
| `saint-john-the-baptist` | Saint John the Baptist | Forerunner; universal. |
| `saint-matthias-the-apostle` | Saint Matthias the Apostle | Apostle. |
| `saint-timothy` | Saint Timothy | Apostolic companion of Paul. |
| `prophet-elias-elijah` | Prophet Elias (Elijah) | OT prophet. |
| `prophet-elisha` | Prophet Elisha | OT prophet. |
| `prophet-joel` | Prophet Joel | OT prophet. |
| `jeremiah-the-prophet` | Jeremiah the Prophet | OT prophet. |
| `prophet-daniel-and-the-three-holy-youths` | Prophet Daniel and the Three Holy Youths | OT prophets. |
| `saint-dismas` | Saint Dismas | The Penitent Thief; biblical figure (Luke 23:39–43). |
| `saint-simeon-the-elder` | Saint Simeon the Elder | Righteous elder who received Christ in the Temple; biblical. |
| `mar-ya-qub-saint-james` | Mar Ya'qub (Saint James) | COE-native form of James the Apostle. |
| `synaxis-of-the-twelve-apostles` | Synaxis of the Twelve Apostles | Corporate apostolic feast; `shlihe` context. |

### 2C. Universal feasts — LAYER2_NOT_LAYER3

These are Christ-events and Marian feasts. Not individual saint slots. They belong in
Layer 2 as fixed feasts if implemented. COE tags may be retained for Layer 2 use;
these must not appear in Layer 3 rendering.

| identity_id | Name |
|---|---|
| `the-epiphany-theophany-of-our-lord` | Epiphany/Theophany (major COE feast — Denha) |
| `the-nativity-of-our-lord` | Nativity |
| `easter-sunday-the-resurrection-of-our-lord` | Easter/Qyamta |
| `transfiguration-of-the-lord` | Transfiguration |
| `exaltation-of-the-holy-cross` | Exaltation of the Holy Cross (major COE feast — Sleeba) |
| `presentation-of-the-lord-candlemas` | Presentation of the Lord |
| `holy-name-of-jesus-circumcision-of-christ` | Holy Name/Circumcision |
| `nativity-of-saint-john-the-baptist` | Nativity of John the Baptist |
| `martyrdom-of-saint-john-the-baptist` | Martyrdom of John the Baptist |
| `annunciation-of-the-lord-annunciation-of-the-theotokos` | Annunciation |
| `dormition-or-assumption-of-the-virgin-mary` | Dormition/Assumption |
| `nativity-of-the-blessed-virgin-mary` | Nativity of the BVM |
| `presentation-of-the-blessed-virgin-mary` | Presentation of the BVM |
| `synaxis-of-the-theotokos` | Synaxis of the Theotokos |
| `saint-joseph-spouse-of-the-blessed-virgin-mary` | Saint Joseph |
| `eve-of-the-nativity-and-holy-ancestors` | Eve of the Nativity and Holy Ancestors |
| `all-saints` | All Saints |
| `all-souls-commemoration-of-the-dead` | All Souls / Commemoration of the Dead |
| `the-holy-innocents` | The Holy Innocents |
| `synaxis-of-the-archangel-michael-and-all-angels` | Synaxis of Archangel Michael and All Angels |
| `saint-gabriel-the-archangel` | Saint Gabriel the Archangel (angelic — not a saint slot) |
| `mar-gabriel-archangel` | Mar Gabriel Archangel (duplicate angelic entry) |
| `commemoration-of-all-the-saints` | Commemoration of All the Saints (duplicate All Saints variant) |
| `entrance-of-the-theotokos` | Entrance of the Theotokos |

### 2D. COE-native secondary observances — LAYER2_NOT_LAYER3

Relic feasts, synaxis variants, vigils, and combined commemorations. The underlying
person may be KEEP_CANDIDATE, but these specific identity records are secondary
observances that belong in Layer 2 or should be merged into the primary identity
at Phase 4 consolidation.

| identity_id | Name | Primary |
|---|---|---|
| `mar-addai-secondary-feast` | Mar Addai (Secondary Feast) | `mar-addai` |
| `mar-addai-relics` | Mar Addai (Relics) | `mar-addai` |
| `mar-addai-and-mar-mari` | Mar Addai and Mar Mari | Combined corporate feast |
| `mar-mari-synaxis` | Mar Mari (Synaxis) | `mar-mari` |
| `mar-mari-translation-of-relics` | Mar Mari (Translation of Relics) | `mar-mari` |
| `mar-mari-the-evangelist` | Mar Mari the Evangelist | Redundant variant |
| `mar-toma-feast-of-relics` | Mar Toma (Feast of Relics) | `mar-toma-apostle-thomas` |
| `mar-toma-relics` | Mar Toma (Relics) | `mar-toma-apostle-thomas` |
| `mar-shimon-bar-sabbae-commemoration` | Mar Shimon Bar Sabbae (Commemoration) | `mar-shimon-bar-sabbae` |
| `mar-shimun-bar-sabbae-secondary` | Mar Shimun Bar Sabbae (Secondary) | `mar-shimun-bar-sabbae` |
| `mar-papa-bar-aggai-see-foundation` | Mar Papa bar Aggai (See Foundation) | `mar-papa-bar-aggai` |
| `mar-papa-commemoration` | Mar Papa (Commemoration) | `mar-papa-bar-aggai` |
| `mar-papa-secondary` | Mar Papa (Secondary) | `mar-papa-bar-aggai` |
| `mar-awgin-departure` | Mar Awgin (Departure) | `mar-augin` |
| `mar-abraham-of-kashkar-secondary` | Mar Abraham of Kashkar (Secondary) | `mar-abraham-of-kashkar` |
| `mar-george-the-martyr-secondary` | Mar George the Martyr (Secondary) | `mar-george-the-martyr` |
| `mar-isaac-of-nineveh-secondary` | Mar Isaac of Nineveh (Secondary) | `mar-isaac-of-nineveh` |
| `mar-yohannan-vigil` | Mar Yohannan (Vigil) | `mar-yohannan` |
| `commemoration-of-st-sawrisho-of-beth-garmi` | Commemoration of St. Sawrisho | `saint-sawrisho-of-beth-garmi` |
| `commemoration-of-st-awa-catholicos` | Commemoration of St. Awa Catholicos | `saint-awa-catholicos` |
| `commemoration-of-st-john-daylimaya` | Commemoration of St. John Daylimaya | `mar-yohannan` or new primary |
| `commemoration-of-mar-benyamin-shimun-xxi` | Commemoration of Mar Benyamin Shimun XXI | Modern patriarch; Layer 2 at most |

### 2E. COE calendar structure entries — LAYER2_NOT_LAYER3

Liturgical days, Sundays, fast periods, and seasonal markers. All typed `saint` in the
data, which is incorrect. None are individual person entries. Most belong in the season
engine (Layer 1); a few belong in Layer 2 fixed feasts. Correct per cleanup-queue §D1
batch when that phase is executed.

| identity_id | Name | Correct layer |
|---|---|---|
| `rogation-of-the-ninevites` | Rogation of the Ninevites | Layer 1 — season engine (Ba'utha d-Ninevaye) |
| `friday-of-the-deceased` | Friday of the Deceased | Layer 2 — corporate fast/commemoration |
| `friday-of-the-dead` | Friday of the Dead | Layer 2 — duplicate |
| `good-friday` | Good Friday | Layer 1/2 |
| `holy-thursday-of-the-passover` | Holy Thursday of the Passover | Layer 1/2 |
| `ash-wednesday` | Ash Wednesday | Layer 2 at most; not a native COE observance |
| `saturday-of-light-easter-vigil` | Saturday of Light (Easter Vigil) | Layer 1/2 |
| `first-sunday-of-great-fast` | First Sunday of Great Fast | Layer 1 |
| `second-sunday-of-great-lent` | Second Sunday of Great Lent | Layer 1 |
| `third-sunday-of-great-lent` | Third Sunday of Great Lent | Layer 1 |
| `fourth-sunday-of-great-lent` | Fourth Sunday of Great Lent | Layer 1 |
| `monday-of-great-lent` | Monday of Great Lent | Layer 1 |
| `wednesday-of-mid-lent` | Wednesday of Mid-Lent | Layer 1 |
| `second-sunday-of-the-apostles` | Second Sunday of the Apostles | Layer 1 |
| `third-sunday-of-the-apostles` | Third Sunday of the Apostles | Layer 1 |
| `pentecost-sunday` | Pentecost Sunday | Layer 1 |
| `5th-epiphany-sunday` | 5th Epiphany Sunday | Layer 1 |
| `feast-of-the-ascension` | Feast of the Ascension | Layer 2 fixed feast |
| `forefeast-of-the-annunciation` | Forefeast of the Annunciation | Layer 2 |
| `the-holy-feast-of-the-epiphany` | The Holy Feast of the Epiphany | Duplicate of Epiphany; Layer 2 |

### 2F. REMOVE_COE_TAG

The COE tag on these entries has no defensible basis. Remove from `commemorations.json`.
They are explicitly named exclusions, post-7th-century Western saints, or saints whose
presence in COE data is entirely explained by EOR-proximity migration.

| identity_id | Name | Reason |
|---|---|---|
| `saint-augustine-of-hippo` | Saint Augustine of Hippo | Explicitly named in `structure.json` as "not COE." |
| `gregory-the-great-gregory-the-dialogist` | Gregory the Great | Explicitly named in `structure.json` as disputed. Description lists ANG/EOR/LAT/OOR — COE absent. |
| `saint-gregory-the-dialogist` | Saint Gregory the Dialogist | Duplicate identity for Gregory the Great; same removal. |
| `saint-cyril-of-alexandria` | Saint Cyril of Alexandria | The Church of the East explicitly rejected Cyrillian Christology at the Synod of Mar Isaac (410) and later councils. His inclusion is historically inaccurate. |
| `saint-joan-of-arc` | Saint Joan of Arc | 15th-century French visionary; no COE basis. |
| `saint-thomas-becket` | Saint Thomas Becket | 12th-century Archbishop of Canterbury; no COE basis. |
| `saint-kateri-tekakwitha` | Saint Kateri Tekakwitha | 17th-century Mohawk; no COE basis. |
| `saint-bernadette-soubirous` | Saint Bernadette Soubirous | 19th-century French visionary; no COE basis. |
| `saint-damien-of-moloka-i` | Saint Damien of Moloka'i | 19th-century missionary; no COE basis. |
| `saint-aloysius-gonzaga` | Saint Aloysius Gonzaga | 16th-century Jesuit; no COE basis. |
| `saint-fidelis-of-sigmaringen` | Saint Fidelis of Sigmaringen | 17th-century Capuchin; no COE basis. |
| `saint-francis-of-assisi` | Saint Francis of Assisi | 13th-century Italian friar; no COE basis. |
| `saint-francis-of-paola` | Saint Francis of Paola | 15th-century Calabrian hermit; no COE basis. |
| `saint-vincent-ferrer` | Saint Vincent Ferrer | 14th-century Dominican; no COE basis. |
| `saint-anselm-of-canterbury` | Saint Anselm of Canterbury | 11th-century Archbishop; no COE basis. |
| `saint-stanislaus` | Saint Stanislaus | 11th-century Polish bishop-martyr; no COE basis. |
| `saint-alphege` | Saint Alphege | 11th-century Archbishop of Canterbury; no COE basis. |
| `saint-peter-chanel` | Saint Peter Chanel | 19th-century Marist missionary; no COE basis. |
| `saint-john-baptist-de-la-salle` | Saint John Baptist de la Salle | 17th-century French educator; no COE basis. |
| `saint-john-of-san-francisco` | Saint John of San Francisco | 20th-century Russian bishop; no COE basis. |
| `saint-john-the-russian` | Saint John the Russian | 18th-century Russian confessor; no COE basis. |
| `saint-john-metropolitan-of-tobolsk` | Saint John Metropolitan of Tobolsk | 18th-century Siberian bishop; no COE basis. |
| `saint-jonah-of-novgorod` | Saint Jonah of Novgorod | 15th-century Russian bishop; no COE basis. |
| `saint-blaise` | Saint Blaise | Western martyr; no COE basis. |
| `saint-pancras` | Saint Pancras | Roman youth martyr; no COE basis. |
| `saint-isidore-of-seville` | Saint Isidore of Seville | 7th-century Spanish bishop; no COE basis. |
| `saint-theodosius-the-cenobiarch` | Saint Theodosius the Cenobiarch | Palestinian monastic; no specific COE basis. |
| `saint-waldetrudis` | Saint Waldetrudis | 7th-century Flemish abbess; no COE basis. |
| `saint-teresa-of-avila` | Saint Teresa of Avila | 16th-century Spanish mystic; no COE basis. |
| `saint-bede` | Saint Bede | 8th-century Northumbrian monk; no COE basis. |
| `saint-rupert-of-salzburg` | Saint Rupert of Salzburg | 8th-century Bavarian bishop; no COE basis. |
| `saint-maron-of-syria` | Saint Maron of Syria | Founder of the Maronite tradition, which separated from the COE. Not a COE figure. |
| `saint-cecilia` | Saint Cecilia | Roman virgin martyr; Roman Martyrology provenance; no COE basis. |
| `saint-martin-of-tours` | Saint Martin of Tours | 4th-century Gallic bishop; Western saint; no COE basis. |
| `saint-hilary-of-poitiers` | Saint Hilary of Poitiers | 4th-century Gallic Doctor; no COE basis. |
| `saint-ambrose-of-milan` | Saint Ambrose of Milan | Description explicitly names ANG/EOR/LAT/OOR; COE absent. No COE basis. |
| `saint-anthony-of-padua` | Saint Anthony of Padua | 13th-century Portuguese Franciscan; no COE basis. |
| `saint-category-of-siena` | Saint Catherine of Siena | 14th-century Italian mystic; no COE basis. |
| `saint-martin-i` | Saint Martin I | 7th-century Pope; Western papacy concern; no COE basis. |
| `saint-boethius` | Saint Boethius | 6th-century Roman philosopher; no COE basis. |
| `saint-hilarion` | Saint Hilarion | Palestinian hermit; EOR/OOR figure; no specific COE basis. |
| `saint-cosmas-of-maiuma` | Saint Cosmas of Maiuma | 8th-century Byzantine hymnographer; no COE basis. |
| `saint-cosmas-of-constantinople` | Saint Cosmas of Constantinople | 8th-century Byzantine archbishop; no COE basis. |
| `saint-romanos-the-melodist` | Saint Romanos the Melodist | 6th-century Byzantine hymnographer; Byzantine not East Syriac. |
| `saint-timothy-of-symbola` | Saint Timothy of Symbola | "Monk (shared commemoration)"; no identifiable COE basis. |
| `saint-julian-the-hermit` | Saint Julian the Hermit | "Ascetic"; no identifiable COE basis. |
| `venerable-bessarion` | Venerable Bessarion | "Wonderworker, shared veneration"; no identifiable COE basis. |
| `saint-thalassius` | Saint Thalassius | "Hermit and healer"; no identifiable COE basis. |
| `saint-syncletica` | Saint Syncletica | Egyptian desert mother; EOR/OOR proximity; no COE basis. |
| `saint-gerasimus` | Saint Gerasimus | Palestinian monk; EOR/OOR proximity; no COE basis. |
| `saint-nicon` | Saint Nicon | "Monk and preacher (shared commemoration)"; no COE basis. |
| `saint-nicephorus` | Saint Nicephorus | Patriarch of Constantinople; Byzantine; no COE basis. |
| `saint-nicetas` | Saint Nicetas | "Confessor (shared commemoration)"; no COE basis. |
| `saint-bucolus` | Saint Bucolus | "Bishop (shared commemoration)"; no COE basis. |
| `saint-conon` | Saint Conon | "Martyr (shared commemoration)"; no COE basis. |
| `saint-dionysius` | Saint Dionysius | "Bishop and martyr"; no COE basis. |
| `saint-dorotheus` | Saint Dorotheus | "Bishop and martyr, shared veneration"; no COE basis. |
| `saint-sabinus` | Saint Sabinus | "Martyr (shared commemoration)"; no COE basis. |
| `saint-eutropius` | Saint Eutropius | "Martyr (shared commemoration)"; no COE basis. |
| `saint-tatiana` | Saint Tatiana | "Martyr (shared commemoration)"; no COE basis. |
| `saint-polyeuctus` | Saint Polyeuctus | "Martyr (shared commemoration)"; no COE basis. |
| `saint-quadratus` | Saint Quadratus | "Martyr (shared commemoration)"; no COE basis. |
| `saint-sophronius` | Saint Sophronius | 7th-century Patriarch of Jerusalem; Byzantine; no COE basis. |
| `saint-basilides` | Saint Basilides | "Martyr (shared commemoration)"; no COE basis. |
| `saint-meletius` | Saint Meletius | "Bishop (shared commemoration)"; no COE basis. |
| `saint-malachi` | Saint Malachi | OT prophet, but the COE entries carry "shared commemoration" framing with no specific COE evidence. |
| `saint-david-of-thessaloniki` | Saint David of Thessaloniki | 6th-century Macedonian hermit; no COE basis. |
| `saint-george-the-chozebite` | Saint George the Chozebite | Palestinian monastic; EOR proximity; no COE basis. |
| `saint-maximus-the-confessor` | Saint Maximus the Confessor | Byzantine theologian; no COE basis. |
| `saint-theoctistus` | Saint Theoctistus | "Abbot at Cucomo in Sicily"; no COE basis. |
| `venerable-theophanes-the-confessor` | Venerable Theophanes the Confessor | Byzantine monastic; no COE basis. |
| `venerable-macarius-the-egyptian` | Venerable Macarius the Egyptian | Egyptian desert father; EOR/OOR figure; no COE basis. |
| `venerable-onuphrius-the-great` | Venerable Onuphrius the Great | Egyptian desert hermit; no COE basis. |
| `the-holy-fathers-slain-at-sinai` | The Holy Fathers slain at Sinai | "Martyred monks (shared commemoration)"; no COE basis. |
| `martyrs-zoticus-atallus-camisius-and-philip` | Martyrs Zoticus, Atallus, Camisius and Philip | "Newly-revealed saints"; no COE basis. |
| `martyrs-nazarius-and-companions` | Martyrs Nazarius and Companions | Roman martyrs; no COE basis. |
| `saint-cyprian` | Saint Cyprian | 3rd-century North African bishop; no COE basis. |
| `saint-john-climacus` | Saint John Climacus | Byzantine monastic; no COE basis. |
| `saint-longinus` | Saint Longinus | Centurion martyr; EOR/OOR proximity; no specific COE basis. |
| `saint-abramius` | Saint Abramius | "Recluse"; EOR/OOR proximity; no COE basis. |
| `saint-demetrius` | Saint Demetrius | Byzantine Great Martyr; no COE basis. |
| `saint-nestor` | Saint Nestor | EOR/OOR martyr; no COE basis. |
| `saint-euthymius` | Saint Euthymius | Palestinian hermit; no COE basis. |
| `saint-carpus` | Saint Carpus | Bishop and martyr; EOR/OOR proximity; no COE basis. |
| `saint-marcian` | Saint Marcian | "Martyr"; EOR/OOR proximity; no COE basis. |
| `saint-artemius` | Saint Artemius | Byzantine military martyr; no COE basis. |
| `saint-charitina` | Saint Charitina | "Virgin martyr"; EOR/OOR proximity; no COE basis. |
| `saint-pelagia` | Saint Pelagia | "Virgin martyr"; EOR/OOR proximity; no COE basis. |
| `saint-stachys` | Saint Stachys | "Apostle"; EOR/OOR proximity; no COE basis. |
| `saint-zenobius` | Saint Zenobius | "Martyr"; EOR/OOR proximity; no COE basis. |
| `saint-pachomius` | Saint Pachomius | Egyptian founder of communal monasticism; no COE basis. |
| `saint-theodore-of-sykeon` | Saint Theodore of Sykeon | Byzantine bishop; no COE basis. |
| `saint-theodore-of-tabennisi` | Saint Theodore of Tabennisi | Egyptian monastic; no COE basis. |
| `saint-theodore-stratelates` | Saint Theodore Stratelates | Byzantine military martyr; no COE basis. |
| `saint-james-the-confessor` | Saint James the Confessor | "Confessor"; EOR/OOR proximity; no COE basis. |
| `saints-cosmas-and-damian` | Saints Cosmas and Damian | Unmercenary healers; primarily EOR/OOR; no specific COE basis. |
| `saint-basil-the-great` | Saint Basil the Great | Cappadocian Father; primarily EOR; his anaphora is Byzantine. No COE basis. |
| `saint-gregory-of-nyssa` | Saint Gregory of Nyssa | Cappadocian Father; primarily EOR; no COE basis. |
| `saint-clement-of-rome` | Saint Clement of Rome | Apostolic Father; universal, but no specific COE basis. |
| `saint-polycarp-of-smyrna` | Saint Polycarp of Smyrna | Apostolic Father; universal, but no specific COE basis. |
| `saint-irenaeus-of-lyons` | Saint Irenaeus of Lyons | Gallic bishop; no specific COE basis. |
| `saint-justin-martyr` | Saint Justin Martyr | Roman apologist; no specific COE basis. |
| `saint-athanasius-the-great` | Saint Athanasius the Great | Patriarch of Alexandria; no specific COE basis beyond Nicene acceptance. |
| `saint-john-chrysostom` | Saint John Chrysostom | Patriarch of Constantinople; primarily EOR; no COE basis. |
| `saint-george` | Saint George | Widely venerated; no specific COE basis beyond general Eastern veneration. |
| `saint-elizabeth` | Saint Elizabeth | Mother of John the Baptist; biblical but COE tagging has no specific basis. |
| `hieromartyr-eusebius-of-samosata` | Hieromartyr Eusebius of Samosata | Bishop of Samosata; COE+EOR; no specific COE basis. |
| `hieromartyr-methodius-of-patara` | Hieromartyr Methodius of Patara | Bishop of Patara; COE+EOR+OOR; no specific COE basis. |
| `hieromartyr-eutychius-of-melitene` | Hieromartyr Eutychius of Melitene | COE-only; no specific COE basis in description. |
| `hieromartyr-olbian-of-anaea` | Hieromartyr Olbian of Anaea | COE-only; no specific COE basis. |
| `hieromartyr-theodotus` | Hieromartyr Theodotus | "Martyr, shared"; no COE basis. |
| `martyr-agapius` | Martyr Agapius | "Martyr (shared commemoration)"; no COE basis. |
| `martyr-meletius` | Martyr Meletius | "General and martyr with family"; no COE basis. |
| `martyrs-peter-andrew-paul-and-dionysia` | Martyrs Peter, Andrew, Paul, and Dionysia | Martyrs under Decius; no COE basis. |
| `martyrs-solochon-pamphamer-and-pamphalon` | Martyrs Solochon, Pamphamer, and Pamphalon | Soldiers martyred at Chalcedon; no COE basis. |
| `martyrs-eulampius-and-eulampia` | Martyrs Eulampius and Eulampia | Brother and sister martyrs; no COE basis. |
| `martyrs-isaurus-and-companions` | Martyrs Isaurus and Companions | Martyrs of Athens; no COE basis. |
| `martyrs-polyeuctus-victorinus-and-donatus` | Martyrs Polyeuctus, Victorinus and Donatus | Martyrs of Caesarea in Cappadocia; no COE basis. |
| `the-42-martyrs-of-amorium` | The 42 Martyrs of Amorium | 9th-century Byzantine martyrs; no COE basis. |
| `holy-myrrh-bearer-mary-wife-of-cleopas` | Holy Myrrh-bearer Mary Wife of Cleopas | EOR-specific commemoration form; no specific COE basis. |
| `saint-john-the-evangelist` | Saint John the Evangelist | COE-only identity redundant with `saint-john-the-apostle`; weaker entry. |
| `saint-isaiah-the-prophet` | Saint Isaiah the Prophet | Description says "Eastern Syriac commemoration" but this phrase does not confirm Hudra evidence. |
| `saint-symeon` | Saint Symeon | "Bishop of Jerusalem (shared commemoration)"; no specific COE basis. |
| `saint-tiburtius` | Saint Tiburtius | Roman martyr; no COE basis. |
| `forefeast-of-the-annunciation` | Forefeast of the Annunciation | Calendrical entry; belongs in Layer 2 not Layer 3. (Also in §2E.) |
| `saint-peter-the-apostle` | Saint Peter the Apostle | This specific identity describes "Veneration of relics (shared commemoration)" — a relic feast, not the primary apostle entry. See `saints-peter-and-paul-apostles` (KEEP). |
| `saint-john-the-baptist` | Saint John the Baptist | This specific COE+OOR entry describes "the martyrdom of the Forerunner" — this is a martyrdom observance form, not a primary feast entry. See `nativity-of-saint-john-the-baptist` and `martyrdom-of-saint-john-the-baptist` in §2C. Keep as KEEP_CANDIDATE only if treated as the primary apostolic forerunner entry and not as a relic/martyrdom variant. CONSERVATIVELY: remove unless confirmed as the intended primary entry for COE. |
| `saint-philip-the-deacon` | Saint Philip the Deacon | "One of the Seven Deacons"; COE+OOR; borderline — moves to §2G. |
| `saint-cyril-of-jerusalem` | Saint Cyril of Jerusalem | Pre-schism bishop; no specific COE basis. |
| `saint-athanasius` | Saint Athanasius | ANG+COE only; "Bishop of Alexandria and Teacher of the Faith, died 373 AD." No specific COE basis. |
| `saint-nicholas-of-myra` | Saint Nicholas of Myra | Universally venerated; possible Hudra presence unconfirmed — moves to §2G. |
| `saint-ignatius-of-antioch` | Saint Ignatius of Antioch | Bishop of Antioch; letters circulated in Syriac world; borderline — moves to §2G. |

### 2G. NEEDS_REVIEW

Cannot be definitively classified from available data. Do not display in Layer 3
until resolved by external Hudra evidence or identity consolidation (Phase 4).

| identity_id | Name | Reason |
|---|---|---|
| `saint-ignatius-of-antioch` | Saint Ignatius of Antioch | Pre-schism; bishop of Antioch; letters had Syriac reception. Possibly defensible but unconfirmed. |
| `saint-nicholas-of-myra` | Saint Nicholas of Myra | Universally venerated pre-schism bishop. Possible Hudra presence — cannot confirm or deny. |
| `saint-arethas` | Saint Arethas | Martyr of Najran (Arabia), 526 AD. Najran had COE-connected Christian community. Regional basis possible. |
| `saints-sergius-and-bacchus` | Saints Sergius and Bacchus | Syrian Roman soldiers martyred at Resafa, c. 303. Syrian location gives possible COE basis. |
| `saint-abraham-of-carrhae` | Saint Abraham of Carrhae | Syrian bishop from Harran (COE+OOR). Harran is in the Syriac heartland; possible basis. |
| `mar-augustine` | Mar Augustine | COE-only; "Monk and teacher." Not Augustine of Hippo — appears to be a distinct East Syriac monastic. Identity needs a more specific description before confirming as KEEP_CANDIDATE. |
| `mar-augustine-commemoration` | Mar Augustine (Commemoration) | Secondary of the above; same dependency. |
| `saint-mar-babai-the-great` | Saint Mar Babai the Great | Duplicate of `mar-babai-the-great`. Consolidation must complete (Phase 4) before this entry is resolved. |
| `saint-james-the-brother-of-the-lord-james-the-just` | Saint James the Just | Duplicate of `saint-james-the-brother-of-the-lord`. Same Phase 4 dependency. |
| `saint-matthias` | Saint Matthias | Duplicate of `saint-matthias-the-apostle`. Same Phase 4 dependency. |
| `apostles-herodion-and-agabus` | Apostles Herodion and Agabus | Members of the Seventy; COE+EOR+OOR. Could have COE apostolic standing under `shlihe` rules but unconfirmed. |
| `saint-philip-the-deacon` | Saint Philip the Deacon | One of the Seven Deacons; evangelistic role in Acts. COE+OOR. Borderline. |
| `saint-cyril-of-jerusalem` | Saint Cyril of Jerusalem | Pre-schism bishop of Jerusalem; his catechetical tradition had some Syriac reception. Borderline. |

---

## 3. Summary counts

| Bucket | Approx. unique identity IDs |
|---|---|
| KEEP_CANDIDATE (2A — COE-native) | 65 |
| KEEP_CANDIDATE (2B — apostles/biblical) | 27 |
| LAYER2_NOT_LAYER3 (2C — universal feasts) | 24 |
| LAYER2_NOT_LAYER3 (2D — secondary observances) | 22 |
| LAYER2_NOT_LAYER3 (2E — calendar structure) | 20 |
| REMOVE_COE_TAG (2F) | ~143 |
| NEEDS_REVIEW (2G) | 13 |
| **Total** | **~314** |

---

## 4. Key structural findings

**The COE tag was applied mechanically in v2.8.2** by renaming the legacy string
"Church of the East" to `COE`. Roughly **46%** of COE-tagged entries should have
the tag removed. A further **21%** belong in Layer 2 or the season engine rather than
Layer 3. Only about **30%** are plausible Layer 3 KEEP_CANDIDATEs.

**Source-data corrections applied (COE-IIB source-data pass, 2026-03-06):**
129 unique identity IDs (132 commemoration rows) had their COE tags removed from
`commemorations.json`. Monthly caches regenerated via `npm run saints:regen`.
Post-correction: 243 COE commemoration rows remain (down from 375), covering
185 unique identity IDs.

**The genuine COE Layer 3 corpus is small and coherent.** The Mar- prefixed identities
form a recognisable, historically grounded set: Narsai, Babai, Addai, Mari, Shimon bar
Sabbae, Qardagh, Pethion, Abraham of Kashkar, Isaac of Nineveh, and the patriarchs and
abbots of the tradition. Thomas, Ephrem, the apostles in `shlihe` season context, and
the Persian martyrs round it out.

**Layer 3 remains silenced.** Two blockers remain:
1. Duplicate identity consolidation (saints-cleanup-queue.md Phase 4): at minimum
   `mar-babai-the-great` / `saint-mar-babai-the-great`,
   `saint-james-the-brother-of-the-lord` / `saint-james-the-brother-of-the-lord-james-the-just`,
   `saint-matthias` / `saint-matthias-the-apostle`.
2. NEEDS_REVIEW resolution (13 entries): external Hudra evidence required for
   Ignatius of Antioch, Nicholas of Myra, Arethas of Najran, Sergius and Bacchus,
   Abraham of Carrhae, and the `mar-augustine` cluster; Phase 4 consolidation required
   for the three duplicate-pending IDs.
