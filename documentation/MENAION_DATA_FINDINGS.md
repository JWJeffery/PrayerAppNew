# Menaion data findings from the lives pass (2026-10-01)

Writing a short life for each rank-3 commemoration (research subagents, two or more sources each) exposed entries where the
app's entry does not match what the Orthodox calendar (OCA / orthocal.info, Slavic) commemorates on that date. These need a
decision by Josh; no life was published for the first three because it would describe a different saint than the entry names.

## Calendar and identity questions -- evidence per source (checked 2026-10-01) -- ALL APPLIED 2026-10-01

Resolution: Thomas of Maleon (+Acacius) on Jul 7 (OCA troparion/kontakion); the sisters Agape, Irene and Chionia on Apr 16 (OCA); Great Martyr Irene moved to May 5, rank 3 (OCA Tone 1 troparion, Tone 3 kontakion); Jan 14 renamed to Nina only and the Leavetaking of Theophany moved to Jan 14; Tikhon moved to 08-13, Innocent of Irkutsk to 02-09, Royal Martyrs to 07-04 (Menaion-date keying). Emptied dates (01-13, 08-26, 02-22, 07-17) keep an empty commemorations list. Kyriake of Nicomedia (listed by orthocal.info for Jul 7, absent from OCA) was not added.

Sources: **Orthocal** = orthocal.info API, OCA/Slavic tradition, fetched live; "Orthocal-Julian" = its `/api/julian/` endpoint, which takes a
civil date and returns the Old-Calendar Menaion day (civil date minus 13 days); **App** = this repo's data/menaion files;
**Engine** = `js/horologion-engine.js`, whose `_getFixedCalendarMmdd()` subtracts the 13-day Julian offset from the civil date when the user
is on the Old Calendar, so Menaion files must be keyed by the *Menaion* date (the new-calendar date), not by an Old-Calendar civil date.

| # | App entry | What the app has | What Orthocal says | Proposed fix |
|---|---|---|---|---|
| 1 | 07-07 `thomas-apostle` | "Holy Apostle Thomas", rank 3, with Apostle Thomas's troparion ("O Apostle Thomas, thou wast not absent from the burial...") | Jul 7: "Ven. Thomas of Mt Maleon; Holy Martyr Kyriake of Nicomedia". Oct 6: "Holy Apostle Thomas" (the app already has him there, `thomas-apostle-october`). The AGES hymns for Jul 7 are about a rich man turned monk, i.e. Maleon. | Replace the Jul 7 entry with Thomas of Maleon (needs his troparion from OCA) |
| 2 | 04-16 `irene-great-martyr` | "Holy Great Martyr Irene", rank 3, with her troparion ("Thy lamb Irene crieth out...") | Apr 16: "Virgin Martyrs Agape, Irene and Chionia". May 5: "Great Martyr Irene of Thessalonica" (the app has only a rank-4 "Martyr Irene of Thessalonica" there). | Move Great Martyr Irene to May 5 (rank 3); make Apr 16 the three sisters |
| 3 | 01-14 `fathers-council-nicaea` | Name "Holy Fathers of the First Council at Nicaea (observed); Equal-to-the-Apostles Nina", but the troparion is Nina's | Jan 14: "Leavetaking of Theophany; St Nino of Georgia; Sava of Serbia; Fathers slain at Sinai and Raithu". The First Council's Fathers are on the 7th Sunday of Pascha (2026-05-24, feast "Holy Fathers of the First Ecumenical Council"). | Rename the entry Nina only; the Nicaea half is not a Jan 14 commemoration |
| 3b | 01-13 `leavetaking-theophany` | Leavetaking of Theophany stored on Jan 13 | Jan 13 is Hermylus & Stratonicus, Maximos Kavsokalybites, Hilary of Poitiers; Leavetaking is Jan 14 | Move to Jan 14 |
| 4 | 08-26 Tikhon of Zadonsk | Aug 26 | Orthocal: Aug 13 ("St Tikhon of Zadonsk (1783)"). Orthocal-Julian civil Aug 26 also shows Tikhon, i.e. Aug 26 is the Old-Calendar *civil* date of Aug 13. Aug 26 (Orthocal) is Martyrs Adrian & Natalia. | Key it at 08-13 |
| 4 | 02-22 Finding of Relics, Innocent of Irkutsk | Feb 22 | Orthocal: Feb 9 ("Relics of St Innocent of Irkutsk"); Orthocal-Julian civil Feb 22 matches. Orthocal Feb 22 is not him. | Key it at 02-09 |
| 4 | 07-17 Royal Passion-Bearers | Jul 17 (july.json header: "Russian calendar") | Orthocal lists them on both Jul 4 and Jul 17 | Key it at 07-04; Old-Calendar users then get them on civil Jul 17 automatically |

Effect of the current keying: a new-calendar user sees Tikhon on Aug 26 (OCA: Aug 13); an Old-Calendar user gets the Menaion day for civil Aug 26 minus 13 days, i.e. Tikhon would
appear on civil Sep 8. A scan of all 370 entries against Orthocal's 2026 days found only these (plus the false positives from spelling variants such as Prokopios/Procopius) as
Old-Calendar-keyed; the 28 other "no name match" entries were mostly Sundays whose Orthocal day text omits the saints, or spelling differences, and were not treated as errors.

## Other flags raised by the research (identity is fine; details differ between sources)
- **gregory-nyssa**: Calendar also commemorates Dometian, Bishop of Melitene (6th c.) on Jan 10; the life is written for Gregory, the app's primary identity. Sources differ on birth year (331 in Orthocal; roughly 335 elsewhere), so no birth year is given.
- **veneration-chains-peter**: Sources agree on Acts 12 and on veneration of the chains; the later history of the relics (Constantinople, Rome) is tradition and varies by account.
- **martyr-ignatius-god-bearer-translation**: Year and details of the translation (108) come from tradition; sources agree on the return of the relics to Antioch but are brief.
- **theodore-stratelates**: Distinct from Theodore the Recruit (Feb 17); some traditions confuse the two.
- **haralambos-martyr**: Sources differ on his age at death (103 or 113) and on the location of Magnesia; age omitted.
- **onesimus-apostle**: New Testament gives only the Philemon story; later career and martyrdom are tradition.
- **theodore-tyron**: Date of death varies (303 to 306); the dragon story is a later legend. Distinct from Theodore Stratelates (Feb 8).
- **finding-relics-innocent-irkutsk**: DATE: Orthocal and OCA list Uncovering of relics of martyrs at the Gate of Eugenius on Feb 22 (Gregorian) and not Innocent. In the Russian (Julian) calendar the uncovering of Innocent's relics falls on Feb 9 O.S., which is Feb 22 N.S., so this is a Slavic-calendar entry. 1764 = discovery of incorrupt body; 1805 = formal uncovering/glorification (app says 'finding 1764').
- **polycarp-smyrna**: Date of martyrdom disputed (c. 155 or 167); stated approximately.
- **forty-martyrs-sebaste**: Sources differ slightly on details such as the guard's replacement and the fate of the relics.
- **john-climacus**: Orthocal says he entered at sixteen; OCA says little is known of his origins. Dates are approximate.
- **mary-egypt**: Orthocal notes the date of her repose is very unclear (378, 437 or 522 in different accounts); no year given.
- **james-zebedee**: Identity corrected in app: April 30 is James son of Zebedee (not James the Brother of the Lord, who is Oct 23). Orthocal's title reads 'brother of St John the Theologian'. Spain tradition is not historically established.
- **athanasius-alexandria**: May 2 is a secondary commemoration (translation of relics); main feast is Jan 18 with Cyril of Alexandria. Orthocal's May 2 entry points to Jan 18 for the life.
- **simon-zealot-apostle**: Accounts of his later mission and martyrdom vary; Cana bridegroom identification is tradition only.
- **jude-apostle-brother-lord**: Orthodox calendar treats Jude, Brother of the Lord (June 19) as distinct from Thaddaeus of the Twelve (June 21); the app note identifies him with Thaddaeus. Life written for the calendar identity. Wikipedia notes the identification is debated.
- **euphemia-great-martyr**: July 11 is the commemoration of the Chalcedon miracle in Slavic usage; her martyrdom is Sept 16 (see separate entry). Wikipedia dates her death 303; app note says 304.
- **vladimir-equal-apostles**: Orthocal gives death year 1051 in its title; the standard date is 1015.
- **dormition-anna-mother-theotokos**: Details of Anna's life rest on non-canonical tradition.
- **matthias-apostle-august**: Sources differ on where Matthias later preached.
- **tikhon-zadonsk**: DATE NOTE: OCA lists Tikhon on Aug 13, while Orthocal's Aug 26 lists Martyrs Adrian and Natalia. Aug 26 is the civil-calendar equivalent of Aug 13 Old Style (his repose, 1783), so the date is correct only for Julian-calendar Slavic usage. Check which calendar the app uses.
- **deposition-belt-theotokos**: Sources differ on what the feast commemorates; the app's 395 date is approximate.
- **euphemia-all-praised-september**: Duplicate saint of the July 11 entry; this one is the martyrdom feast. Life text differs deliberately.
- **eustathios-thespesia-companions**: Hadrian's reign is 117-138; the app's +118 is approximate. The saints are Eustathios, Theopiste and their sons.
- **thekla-equal-apostles**: Her story comes from an apocryphal text.
- **paraskeva-serbia**: Calendar names her 'Parasceva of Serbia'; she is the same as Paraskeva the New / of the Balkans, born in Thrace (Epivates), venerated in Serbia because her relics rested in Belgrade. Distinct from Paraskeva of Rome (July 26) and Paraskeva Friday (Oct 28). Dates of life vary by source.
- **james-brother-lord**: Identity matches the calendar (James the Brother of the Lord, Oct 23; distinct from James son of Zebedee, Apr 30). No mismatch; noted because of the earlier mislabelling.
- **cosmas-damian-asia**: App lists type 'martyr'; calendar tradition for Nov 1 says these Asian unmercenaries reposed in peace rather than suffering martyrdom (the martyr pairs are Roman, July 1, and Arabian, Oct 17). Dates are traditional and uncertain.
- **john-the-merciful**: Date of death differs by source (616 vs 619).
- **great-martyr-catherine**: Historicity of details is debated; the emperor named differs by source (Maximian/Maxentius).
- **clement-rome**: Nov 25 also has the Leavetaking of the Entrance (separate entry).
- **barbara-great-martyr**: Place and date vary between sources; Orthocal lists the year as 290, the app notes say 306.
- **john-damascene**: Orthocal gives death year 760; most sources give c. 749.
- **ignatius-god-bearer**: Dec 20 also has the Forefeast of the Nativity.
- **great-martyr-anastasia**: Place of martyrdom varies by source (Sirmium or an island near Rome). The epithet and details are traditional.
- **twenty-thousand-martyrs-nicomedia**: Year differs (302 vs 303); the number and details come from tradition rather than contemporary records.


## Rank-4 lives pass (2026-10-01): entries where the calendar does not support the app's entry
Eight research agents wrote lives for the 244 rank-4 entries, reading the OCA "all-lives" page and the orthocal.info record for each date. Where
the calendar for that date did not name the app's saint, NO life was published. Fixed the same day (Orthocal evidence): Agabus 03-15 -> 04-08;
Cornelius the Centurion 10-13 -> 09-13; Cosmas and Damian of Cilicia/Arabia 10-12 -> 10-17; Theodotus of Ancyra 05-16 -> 05-18; the
duplicate rank-4 "Miracle of Archangel Michael at Chonae" on 11-09 deleted (the feast is on 09-06); 12-14 renamed Thyrsus, Leucius and
Callinicus (OCA; Philemon's group is separate); 06-07 renamed Theodotus, Bishop of Ancyra (was "Marcellus", which is a different pope).

### RESOLVED 2026-10-01: Josh said "delete all nine" -- the nine entries below were removed from data/menaion
(their dates now carry no commemoration, or only the remaining ones). Original evidence kept for the record.
| App date | App entry | What OCA / Orthocal say |
|---|---|---|
| 04-20 | Holy Martyr Anastasia of Rome (`anastasia-rome-martyr`) | OCA April 20 lists Theodore Trichinas, Athanasios of Meteora, Apostle Zaccheus, and others; no Anastasia of Rome appears there, and Orthocal 4/20 names only Theodore Trichinas, Athanasios of Meteora and Zaccheus. OCA places 'Martyrs Basilissa and Anastasia of Rome, disciples of the Apostles' on April 15 (1st c., under Nero). Date mismatch or different identity; no life written. |
| 05-18 | Venerable Peter of Caesarea in Cappadocia (`peter-caesarea-cappadocia`) | OCA May 18 names Martyr Theodotus of Ancyra and the Martyrs Peter, Dionysius, Andrew, Paul, Christina (Lampsacus, under Decius); Orthocal 5/18 similar. No 'Venerable Peter of Caesarea in Cappadocia' appears for May 18 (nor on May 16/17 OCA pages checked). Unidentified; no life written. |
| 11-10 | Holy Martyrs Orestes and Erasmus of Ohrid (`erasmus-of-ohrid`) | App names Holy Martyrs Orestes and Erasmus of Ohrid on 11-10. OCA lives page for November 10 lists Apostles of the Seventy Erastus, Olympas, Herodion, Sosipater, Quartus and Tertius; Martyr Orestes the Physician of Cappadocia (Tyana, d. 304; OCA states he is not Orestes of Sebaste); Hieromartyr Milos of Persia; Theocteristus of Symbola; Constantine-Kakhi of Georgia; Great-martyr George of Georgia. No Erasmus and no O |
| 11-15 | Holy Martyrs and Confessors of Persia (`martyrs-persia-shapur`) | App names Holy Martyrs and Confessors of Persia on 11-15. OCA lives page for November 15 lists Martyrs and Confessors Gurias, Samonas and Habibus of Edessa (under Diocletian/Maximian and Licinius, not Persia); Martyrs Elpidius, Marcellus and Eustochius (under Julian); Martyr Demetrios of Thrace; and Paisios Velichkovsky. Orthocal for 11-15 lists the start of the Nativity Fast, Gurias, Shamuna and Habib of Edessa, and |
| 03-02 | Holy Martyr Hesychius of Antioch (`hesychius-antioch`) | App names Holy Martyr Hesychius of Antioch on 03-02. OCA March 2 lists Hieromartyr Theodotus of Cyrenia, Arseny of Tver, 440 Martyrs of Lombardy, and Martyr Euthalia; Orthocal 3/2 lists the same. No Hesychius appears on either source for that date, so no life was written. |
| 03-20 | Holy Martyr Niketas of the Goths (`martyr-niketas-gothi`) | App names Holy Martyr Niketas of the Goths on 03-20. OCA March 20 lists Holy Fathers Slain at St Sabbas Monastery, Myron the New Martyr of Crete, Photine the Samaritan Woman and Cuthbert of Lindisfarne; Orthocal 3/20 lists the same. Niketas the Goth is not named for that date in either source (OCA's page does not mention him), so no life was written. |
| 06-28 | Forefeast of the Feast of the Holy Apostles Peter  (`paul-peter-apostles-forefeast`) | App names a Forefeast of Sts Peter and Paul on 06-28. OCA all-lives for June 28 and Orthocal list only: Translation of Relics of Cyrus and John, Xenophon of Robeika, Sergius and Herman of Valaam, Paul of Corinth, Icon of the Three Hands, Hieromartyr Basil, Sergius of Paphlagonia (Orthocal adds Pappias, Sennuphius). Neither names a forefeast of Peter and Paul. |
| 07-09 | Venerable Paisios the Great (`paisios-great`) | App names Paisios the Great on 07-09. OCA all-lives for July 9 lists Pancratius of Taormina, Cyril of Gortyna, Patermuthius, Coprius and Alexander, Theodore of Edessa, Dionysios the Rhetorician and Metrophanes, and two Theotokos icons; Orthocal lists Pancratius and Patermuthius. Neither mentions Paisios. |
| 07-23 | Hieromartyr Phocas, Bishop of Sinope (`phocas-bishop-sinope`) | App names Hieromartyr Phocas of Sinope on 07-23. OCA all-lives for July 23 lists Trophimus and 14 others in Lycia, Hieromartyr Apollinaris of Ravenna, two Theotokos icons, and Anna of Leukadio (Orthocal adds Ezekiel and Anna mother of Samuel). No Phocas appears on that date. |

### Lives published with an identity/detail caveat (the life follows the calendar, the app entry's own name/notes differ)
- **gregory-nyssa**: Calendar also commemorates Dometian, Bishop of Melitene (6th c.) on Jan 10; the life is written for Gregory, the app's primary identity. Sources differ on birth year (331 in Orthocal; roughly 335 elsewhere), so no birth year is given.
- **theodore-tyron**: Date of death varies (303 to 306); the dragon story is a later legend. Distinct from Theodore Stratelates (Feb 8).
- **finding-relics-innocent-irkutsk**: DATE: Orthocal and OCA list Uncovering of relics of martyrs at the Gate of Eugenius on Feb 22 (Gregorian) and not Innocent. In the Russian (Julian) calendar the uncovering of Innocent's relics falls on Feb 9 O.S., which is Feb 22 N.S., so this is a Slavic-calendar entry. 1764 = discovery of incorrupt body; 1805 = formal uncovering/glorification (app says 'finding 1764').
- **polycarp-smyrna**: Date of martyrdom disputed (c. 155 or 167); stated approximately.
- **john-climacus**: Orthocal says he entered at sixteen; OCA says little is known of his origins. Dates are approximate.
- **mary-egypt**: Orthocal notes the date of her repose is very unclear (378, 437 or 522 in different accounts); no year given.
- **james-zebedee**: Identity corrected in app: April 30 is James son of Zebedee (not James the Brother of the Lord, who is Oct 23). Orthocal's title reads 'brother of St John the Theologian'. Spain tradition is not historically established.
- **nina-georgia**: IDENTITY/DATE: app id and name lead with the Fathers of the First Council of Nicaea, but the calendar for Jan 14 (OCA, Orthocal) gives Nina of Georgia (and the Fathers slain at Sinai and Raithu, and Sava of Serbia); the Nicaea fathers are commemorated on a Sunday in the Paschal season, not Jan 14. Life written for Nina.
- **agape-irene-chionia**: IDENTITY: app names Great Martyr Irene (+303, Diocletian). On Apr 16 the calendar (OCA, Orthocal) commemorates the Virgin Martyrs Agape, Irene and Chionia; the Great Martyr Irene is commemorated on May 5. Life written for the three sisters. Some Greek accounts place them at Thessalonica; sources differ on place.
- **jude-apostle-brother-lord**: Orthodox calendar treats Jude, Brother of the Lord (June 19) as distinct from Thaddaeus of the Twelve (June 21); the app note identifies him with Thaddaeus. Life written for the calendar identity. Wikipedia notes the identification is debated.
- **euphemia-great-martyr**: July 11 is the commemoration of the Chalcedon miracle in Slavic usage; her martyrdom is Sept 16 (see separate entry). Wikipedia dates her death 303; app note says 304.
- **vladimir-equal-apostles**: Orthocal gives death year 1051 in its title; the standard date is 1015.
- **tikhon-zadonsk**: DATE NOTE: OCA lists Tikhon on Aug 13, while Orthocal's Aug 26 lists Martyrs Adrian and Natalia. Aug 26 is the civil-calendar equivalent of Aug 13 Old Style (his repose, 1783), so the date is correct only for Julian-calendar Slavic usage. Check which calendar the app uses.
- **deposition-belt-theotokos**: Sources differ on what the feast commemorates; the app's 395 date is approximate.
- **eustathios-thespesia-companions**: Hadrian's reign is 117-138; the app's +118 is approximate. The saints are Eustathios, Theopiste and their sons.
- **paraskeva-serbia**: Calendar names her 'Parasceva of Serbia'; she is the same as Paraskeva the New / of the Balkans, born in Thrace (Epivates), venerated in Serbia because her relics rested in Belgrade. Distinct from Paraskeva of Rome (July 26) and Paraskeva Friday (Oct 28). Dates of life vary by source.
- **james-brother-lord**: Identity matches the calendar (James the Brother of the Lord, Oct 23; distinct from James son of Zebedee, Apr 30). No mismatch; noted because of the earlier mislabelling.
- **cosmas-damian-asia**: App lists type 'martyr'; calendar tradition for Nov 1 says these Asian unmercenaries reposed in peace rather than suffering martyrdom (the martyr pairs are Roman, July 1, and Arabian, Oct 17). Dates are traditional and uncertain.
- **john-the-merciful**: Date of death differs by source (616 vs 619).
- **barbara-great-martyr**: Place and date vary between sources; Orthocal lists the year as 290, the app notes say 306.
- **forefeast-theophany**: OCA and Orthocal name the martyrs as Theopemptus and Theonas (Orthocal dates them ca. 290; OCA says 303). Orthocal also lists Apollinaria and Syncletica on this date. Life covers the forefeast and Theopemptus/Theonas only.
- **domnica-constantinople**: Sources differ on her origin: OCA says she came from Carthage; Orthocal says she was born in Rome (and sailed via Alexandria). Orthocal dates her ca. 474; app notes say c.473. Life omits origin.
- **leavetaking-theophany**: Date confirmed: OCA and Orthocal both place the Leavetaking of Theophany on January 14. Entry is a feast, not a person.
- **tryphon-martyr**: Place: OCA heading reads 'of Lampsacus near Apamea in Syria'; the text itself places his martyrdom at Nicaea. App name says Apamea.
- **agatha-catania**: Birthplace: OCA says Palermo; Orthocal says Catania or Palermo. OCA and Orthocal title her 'of Palermo'; app says 'of Catania' (martyrdom place). Same saint.
- **leavetaking-presentation**: Date confirmed: OCA and Orthocal list the Leavetaking of the Meeting on February 9. Entry is a feast, not a person.
- **martinian-caesarea**: Location of his first desert: OCA says near Caesarea in Palestine; Orthocal says a mountain in Cappadocia. Life follows OCA and the app name.
- **martyr-eudokia**: Sources differ on the emperor (Trajan or Hadrian) and details of her later life; the app's '+2nd c.' is consistent. OCA and Orthocal spell the name Eudokia/Eudoxia.
- **martyr-codratus-corinth**: App says +258 under Valerian; OCA and Orthocal place the Corinth martyrdom under Decius (249-251). OCA's entry is titled 'Quadratus', the same name as Codratus. The life omits the date and emperor. OCA also has a separate Quadratus of Nicomedia on this date.
- **nikephoros-patriarch-constantinople**: Date of death differs slightly between sources (OCA 828, Orthocal about 827); the app entry is the translation of relics, not his main feast.
- **sabin-egypt**: Date (287) given by OCA; Orthocal gives no date. OCA also briefly lists Sabinus on March 13.
- **james-confessor**: OCA lists James of Catania; Orthocal on this date lists only a James, Bishop of the Studion (different wording, location unknown). The identification of the Studite James with Catania rests on OCA alone.
- **nikon-and-companions**: Number of companions differs: OCA says 199 monks beheaded (190 monks entrusted to Nikon plus former soldiers), Orthocal says 190 perished. OCA gives no emperor; Orthocal places it under Decius, consistent with the app's +251.
- **mark-bishop-arethusa**: OCA and Orthocal both say Mark was released after torture, not killed; he is a hieromartyr by title. The app says martyrs '+362' (under Julian); sources place the persecution then but do not report Mark's death.
- **claudius-diodorus-victor-papias**: OCA April 5 only lists 'Martyr Claudius and those with him' (Claudius, Diodoros, Victor, Victorinus, Pappios, Serapion, Nikephoros) with a note that they are probably the group of January 31; no separate life. Orthocal 4/5 does not list them. The life draws on OCA January 31 (https://www.oca.org/saints/all-lives/2026/01/31).
- **antipas-pergamon**: App notes give ca. 92 AD; OCA dates his death to the reign of Nero (ca. 68). Sources differ, so no precise date is given in the life.
- **basil-bishop-parium**: App lists him as 'Hieromartyr' with '+3rd c.'; OCA calls him Basil the Confessor, Bishop of Parium, 8th century, an iconoclast-era confessor who died in peace, not a martyr. Orthocal also lists 'St Basil the Confessor'. Type/title/century in app likely need correcting.
- **symeon-bishop-persia**: App notes give +341 and place the saint at Seleucia-Ctesiphon; OCA gives 344 and does not name the see. Sources differ on the year; the life gives OCA's date.
- **john-disciple-gregory-theologian**: App name says disciple of 'St. Gregory the Theologian'; OCA and Orthocal name him disciple of Gregory of Decapolis (Nov 20). Same commemoration (April 18), but the name in the app appears wrong.
- **memnou-memnon-wonder-worker**: App calls him 'Holy Martyr Memnon the Wonder-Worker (+3rd c.)'; OCA lists 'Venerable Memnon the Wonderworker', an Egyptian desert abbot, with no martyrdom and no century given. Orthocal for April 29 does not list him. Type and period in app need checking.
- **glyceria-martyr**: App notes say +177 under Marcus Aurelius; OCA says second century under Antoninus (138-161). Sources differ; life omits the emperor's name and exact date.
- **simeon-stylites-junior**: Sources differ on dates (OCA: born 521, died 596; Orthocal: born 522; app notes say +592). Life gives only 'late sixth century'.
- **theodosia-caesarea-cappadocia**: App says 'Theodosia of Caesarea in Cappadocia'. OCA and Orthocal for May 29 name Virgin Martyr Theodosia of Tyre, martyred at Caesarea in PALESTINE under Maximian/Diocletian era (307/308); no Cappadocian Theodosia is listed. Life written for Theodosia of Tyre; app name/place should be corrected. (OCA also lists a separate Theodosia the Nun of Constantinople, 730, same date.)
- **bessarion-egypt**: OCA's life names him a disciple of Isidore of Pelusium; app notes say disciple of Anthony and Moses the Ethiopian and dated c.466. Omitted as sources are unclear.
- **alexander-antonina-martyrs**: App says martyrs 'of Caesarea in Cappadocia'. OCA says Antonina was from Krodamos (Asia Minor) and heads the entry 'at Constantinople'; Orthocal places the trial in Alexandria. Sources differ on location; life names no specific city of martyrdom.
- **leontius-martyr**: App notes say Leontius '+2nd c.'; OCA and Orthocal place the martyrdom under Vespasian (1st century) and commemorate him with Hypatius and Theodulus.
- **febronia-nisibis**: OCA says she was raised at Sivapolis in Assyria; Orthocal says Mesopotamia and martyred at Nisibis. Place given as Nisibis per the app's title.
- **maximus-confessor-repose**: App name/id say repose; OCA lists this day under 'Translation of the relics of St Maximus the Confessor', noting his main commemoration is January 21 (Orthocal lists Maximos on 08-13 with the same note). Life mentions both.
- **alexander-john-paul-cp-patriarchs**: Identity of Patriarch John differs: OCA notes John the Faster (+595) by one account, John Scholasticus (+577) by another.
- **autonomus-bishop-martyr**: App notes place him in Paphlagonia; OCA says bishop in Italy martyred in Bithynia (near Soreus).
- **sophia-vera-nadezda-lyubov**: App name reads 'Sophia (Faith)'; OCA lists Sophia and her daughters Faith, Hope and Love.
- **phocas-gardener-sinope**: OCA's 09-22 list names 'Hieromartyr Phocas, Bishop of Sinope' (Orthocal likewise, under Trajan); OCA's full-life page also has 'Martyr Phokas the Gardener of Sinope' (not a hieromartyr). Date for Phocas the Gardener not given in text read, so period is uncertain.
- **callistratos-companions**: Sources differ on date (288 or 304).
- **cyprian-ustyna-martyrs**: OCA lists Hieromartyr Cyprian with Martyrs Justina and Theoctistus; app name omits Theoctistus. Wikipedia notes Catholic sources say no bishop of Antioch was named Cyprian and that the legend is of uncertain historicity; life framed as 'tradition holds'.
- **hierotheos-bishop-athens**: OCA calls him Hieromartyr; app type is 'hierarch'. OCA gives no details of his martyrdom.
- **philip-apostle-october**: OCA title: 'Apostle Philip of the Seventy' (one of the 7 Deacons); matches the app's identity.
- **euthymios-thessalonica**: App notes give death as 889; OCA and Wikipedia both give 898.
- **hosea-prophet**: Century differs: OCA says ninth century BC; app notes (and Wikipedia) say 8th century BC.
- **artemios-antioch-martyr**: Death year: Wikipedia gives 362; app notes say 363; OCA gives no year (Julian reigned 361-363).
- **martyrs-notarios**: Death date: OCA says ca. 335; app notes say 351. Life gives only 'mid-fourth century'.
- **nestor-martyr-thessalonica**: OCA gives no year; app notes' '+306' not verified.
- **terence-neonilla-family**: OCA gives no date; app notes' '3rd c.' not verified.
- **stephen-sabaite-hymnographer**: OCA Oct 28 names 'Stephen the Hymnographer of Saint Savva Monastery' and does not give dates or the family link; Wikipedia gives 725-796 or 807 (app notes say +794). OCA says he may not be the Stephen of July 13.
- **galacteon-episteme**: App notes say husband and wife; OCA title says wife but the narrative says betrothed who became monastics.
- **plato-roman**: App id is 'plato-roman' and notes give '+286'; OCA names Martyr Platon of Ancyra (listed with Romanus the Deacon) and gives no year or emperor for him. No death date included in life.
- **stephen-younger**: App lists type 'hierarch' with a hierarch troparion; OCA and Wikipedia describe him as a monk, martyr and confessor (not a bishop). OCA calls him 'Stephen the New'. Death year 764 is from Wikipedia; OCA text gives birth (715) but no death year in the portion read.
- **patapius-thebes**: OCA gives no century for Patapios; period is the app's estimate.
- **boniface-tarsus**: App notes give '+290'; OCA gives no year and Wikipedia gives 307, so no date stated.
