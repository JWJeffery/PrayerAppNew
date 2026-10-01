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
