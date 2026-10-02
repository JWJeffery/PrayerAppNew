# Orthodox day data (fast + appointed readings) -- record

Built 2026-10-01. `scripts/orthodox-day/build-orthodox-day.py` turns cached orthocal.info API responses (Slavic/OCA
tradition, new calendar) into `data/orthodox-day/2026.json` and `2027.json`: per day the fasting level and
abstentions, the appointed scripture citations (Vespers paroemias, Matins Gospel, Epistle, Gospel), feast rank, tone.
Only facts are kept; the saints' prose lives are NOT copied. Scripture text comes from the app's own Bible corpus
through `resolveScripturePericope()`.

`js/orthodox-day.js` (`window.OrthodoxDay`, called from `HorologionEngine.resolveOffice` for vespers, orthros, typika):
- adds "The Fast Today" as the first item;
- Vespers: fills the empty "Vesperal Reading (Paremiae)" slot (incl. the Genesis/Proverbs readings of Great Lent);
- Orthros: adds the Gospel at Matins before Psalm 50 when the engine has none;
- Typika: REPLACES the engine's own Epistle and Gospel with the published lectionary's (all readings of the day,
  including the saint's, labelled), because the two disagree (below).
Years without a data file keep the engine's old behaviour. 2026 sweep (vespers/orthros/typika, 365 days): 0 errors;
fast 1095, vesperal 102, Matins Gospel 105, Epistle 328, Gospel 328; 6 vesperal items have a composite Old Testament
citation the resolver cannot parse (the citation is shown with a "read it from the book" note).

## Finding: the engine's Typika lectionary disagrees with the published lectionary
On the 2026 days where both exist, the engine's Typika Epistle/Gospel agreed on about half (172 of 338 compared) and
differed on 166 (list below, first 60). Example: 12-16 Jan 2026 the engine gives Hebrews/Mark in the wrong sequence
where the published table has James/Mark. Josh to decide whether to fix the engine's tables for years beyond 2027.

| Date | Published lectionary | Engine (before this change) |
|---|---|---|
| 2026-01-02 | Hebrews 11.8, 11-16; Galatians 5.22-6.2; Mark 12.1-12; Luke 6.17-23 | The Epistle — Hebrews 11:8; Hebrews 11:11-16 | The Holy Gospel — Mark 10:23-32 |
| 2026-01-03 | Ephesians 5.1-8; 1 Timothy 3.14-4.5; Luke 17.3-10; Matthew 3.1-11 | The Epistle — Saturday before Theophany: 1 Timothy 3:14-4:5 | The Holy Gospel — Saturday before Theophany: Matthew 3:1-11 |
| 2026-01-07 | Acts 19.1-8; James 1.1-18; John 1.29-34; Mark 8.30-34 | The Epistle — Synaxis of the Holy Glorious Prophet, Forerunner, and Baptist John: Acts 19: | The Holy Gospel — Synaxis of the Holy Glorious  |
| 2026-01-08 | James 1.19-27; Mark 9.10-16 | The Epistle — James 1:19-27 | The Holy Gospel — Mark 11:27-33 |
| 2026-01-09 | James 2.1-13; Mark 9.33-41 | The Epistle — James 2:1-13 | The Holy Gospel — Mark 12:1-12 |
| 2026-01-10 | Ephesians 6.10-17; Colossians 1.3-6; Matthew 4.1-11; Luke 14.1-11 | The Epistle — Saturday after Theophany: Ephesians 6:10-17 | The Holy Gospel — Saturday after Theophany: Matthew 4:1-11 |
| 2026-01-11 | Ephesians 4.7-13; 2 Corinthians 4.6-15; Matthew 4.12-17; Matthew 11.27-30 | The Epistle — Sunday after Theophany: Ephesians 4:7-13 | The Holy Gospel — Sunday after Theophany: Matthew 4:12-17 |
| 2026-01-12 | James 2.14-26; Mark 9.42-10.1 | The Epistle — Hebrews 11:17-23; Hebrews 11:27-31 | The Holy Gospel — Mark 10:46-52 |
| 2026-01-13 | James 3.1-10; Mark 10.2-12 | The Epistle — Hebrews 12:25-26; Hebrews 13:22-25 | The Holy Gospel — Mark 11:11-23 |
| 2026-01-14 | James 3.11-4.6; Mark 10.11-16 | The Epistle — James 1:1-18 | The Holy Gospel — Mark 11:22-26 |
| 2026-01-15 | James 4.7-5.9; Mark 10.17-27 | The Epistle — James 1:19-27 | The Holy Gospel — Mark 11:27-33 |
| 2026-01-16 | 1 Peter 1.1-2, 10-12, 2.6-10; Mark 10.23-32 | The Epistle — James 2:1-13 | The Holy Gospel — Mark 12:1-12 |
| 2026-01-17 | 1 Thessalonians 5.14-23; Hebrews 13.17-21; Luke 16.10-15; Luke 6.17-23 | The Epistle — Colossians 1:3-6 | The Holy Gospel — Luke 17:3-10 |
| 2026-01-18 | 1 Timothy 1.15-17; Luke 18.35-43 |  | The Holy Gospel — Luke 18:18-27 |
| 2026-01-19 | James 2.14-26; Mark 10.46-52 | The Epistle — James 2:14-26 | The Holy Gospel — Mark 12:13-17 |
| 2026-01-20 | James 3.1-10; Hebrews 13.17-21; Mark 11.11-23; Luke 6.17-23 | The Epistle — James 3:1-10 | The Holy Gospel — Mark 12:18-27 |
| 2026-01-21 | James 3.11-4.6; Mark 11.22-26 | The Epistle — James 3:11-4:6 | The Holy Gospel — Mark 12:28-37 |
| 2026-01-22 | James 4.7-5.9; Mark 11.27-33 | The Epistle — James 4:7-5:9 | The Holy Gospel — Mark 12:38-44 |
| 2026-01-23 | 1 Peter 1.1-2, 10-12, 2.6-10; Mark 12.1-12 | The Epistle — 1 Peter 1:1-2; 1 Peter 1:10-12; 1 Peter 2:6-10 | The Holy Gospel — Mark 13:1-8 |
| 2026-01-24 | 1 Thessalonians 5.14-23; Luke 17.3-10 | The Epistle — 1 Thessalonians 5:14-23 | The Holy Gospel — Luke 18:2-8 |
| 2026-01-25 | 1 Timothy 4.9-15; 1 Corinthians 12.7-11; Luke 19.1-10; John 10.9-16 | The Epistle — 1 Timothy 4:9-15 | The Holy Gospel — Luke 19:1-10 |
| 2026-01-26 | 1 Peter 2.21-3.9; Mark 12.13-17 | The Epistle — 1 Peter 2:21-3:9 | The Holy Gospel — Mark 13:9-13 |
| 2026-01-27 | 1 Peter 3.10-22; Hebrews 7.26-8.2; Mark 12.18-27; John 10.9-16 | The Epistle — 1 Peter 3:10-22 | The Holy Gospel — Mark 13:14-23 |
| 2026-01-28 | 1 Peter 4.1-11; Mark 12.28-37 | The Epistle — 1 Peter 4:1-11 | The Holy Gospel — Mark 13:24-31 |
| 2026-01-29 | 1 Peter 4.12-5.5; Mark 12.38-44 | The Epistle — 1 Peter 4:12-5:5 | The Holy Gospel — Mark 13:31-37; Mark 14:1-2 |
| 2026-01-30 | 2 Peter 1.1-10; Hebrews 13.7-16; Mark 13.1-8; Matthew 5.14-19 | The Epistle — 2 Peter 1:1-10 | The Holy Gospel — Mark 14:3-9 |
| 2026-01-31 | 2 Timothy 2.11-19; Luke 18.2-8 | The Epistle — 2 Timothy 2:11-19 | The Holy Gospel — Luke 20:46-47; Luke 21:1-4 |
| 2026-02-02 | Hebrews 7.7-17; 2 Peter 1.20-2.9; Luke 2.22-40; Mark 13.9-13 | The Epistle — Meeting of our Lord God and Savior Jesus Christ in the Temple: Hebrews 7:7-1 | The Holy Gospel — Meeting of our Lord God and S |
| 2026-02-05 | 1 John 1.8-2.6; Hebrews 13.17-21; Mark 13.31-14.2; Luke 6.17-23 | The Epistle — 1 John 1:8-2:6 | The Holy Gospel — Mark 13:31-14:2 |
| 2026-02-09 | 1 John 2.18-3.10; Hebrews 7.7-17; Mark 11.1-11; Luke 2.22-40 | The Epistle — 1 John 2:18-3:10 | The Holy Gospel — Mark 11:1-11 |
| 2026-02-13 | 2 John 1.1-13; Mark 15.22, 25, 33-41 | The Epistle — 2 John 1:1-13 | The Holy Gospel — Mark 15:22; Mark 15:25; Mark 15:33-41 |
| 2026-02-14 | 1 Thessalonians 4.13-17; 1 Corinthians 10.23-28; John 5.24-30; Luke 21.8-9, 25-27, 33-36 | The Epistle — Day: 1 Corinthians 10:23-28 / Departed: 1 Thessalonians 4:13-17 | The Holy Gospel — Day: Luke 21:8-9; Luke 21:25-27; Luke 21:3 |
| 2026-02-19 | Jude 11-25; Luke 23.2-34, 44-56 | The Epistle — Jude 1:11-25 | The Holy Gospel — Luke 23:1-34; Luke 23:44-56 |
| 2026-02-24 | 2 Corinthians 4.6-15; Matthew 11.2-15 |  |
| 2026-02-27 | Hebrews 13.17-21; John 10.9-16 |  |
| 2026-02-28 | Hebrews 1.1-12; 2 Timothy 2.1-10; Mark 2.23-3.5; John 15.17-16.2 |  |  |
| 2026-03-07 | 1 Thessalonians 4.13-17; Hebrews 3.12-16; John 5.24-30; Mark 1.35-44 |  |  |
| 2026-03-08 | Hebrews 1.10-2.3; Hebrews 7.26-8.2; Mark 2.1-12; John 10.9-16 | The Epistle — Hebrews 1:10-14; Hebrews 2:1-3 | The Holy Gospel — Mark 2:1-12 |
| 2026-03-09 | Hebrews 12.1-10; Matthew 20.1-16 |  |
| 2026-03-14 | 1 Thessalonians 4.13-17; Hebrews 10.32-38; John 5.24-30; Mark 2.14-17 |  |  |
| 2026-03-15 | Hebrews 4.14-5.6; Mark 8.34-9.1 | The Epistle — Hebrews 4:14-16; Hebrews 5:1-6 | The Holy Gospel — Mark 8:34-38; Mark 9:1-1 |
| 2026-03-21 | 1 Corinthians 15.47-57; Hebrews 6.9-12; John 5.24-30; Mark 7.31-37 |  |  |
| 2026-03-22 | Hebrews 6.13-20; Ephesians 5.8-19; Mark 9.17-31; Matthew 4.25-5.12 | The Epistle — Hebrews 6:13-20 | The Holy Gospel — Mark 9:17-31 |
| 2026-03-25 | Hebrews 2.11-18; Luke 1.24-38 |  |
| 2026-03-28 | Hebrews 9.24-28; Hebrews 9.1-7; Mark 8.27-31; Luke 10.38-42, 11.27-28 |  |  |
| 2026-03-29 | Hebrews 9.11-14; Galatians 3.23-29; Mark 10.32-45; Luke 7.36-50 | The Epistle — Hebrews 9:11-14 | The Holy Gospel — Mark 10:32-45 |
| 2026-03-31 | Hebrews 7.26-8.2; John 10.9-16 |  |
| 2026-04-04 | Hebrews 12.28-13.8; John 11.1-45 |  |  |
| 2026-04-06 | Matthew 21.18-43; Matthew 24.3-35 |  |
| 2026-04-07 | Matthew 22.15-23.39; Hebrews 7.26-8.2; Matthew 24.36-26.2; John 10.9-16 |  |
| 2026-04-08 | John 12.17-50; Matthew 26.6-16 |  |
| 2026-04-09 | Luke 22.1-39; 1 Corinthians 11.23-32; Matthew 26:2-20; John 13:3-17; Matt 26:21-39; Luke 22:43-45; Matt 26:40-27:2; John 13.1-11; John 13.12-17 |  |
| 2026-04-10 | 1 Corinthians 1.18-2.2; Matthew 27.1-38; Luke 23:39-43; Matt 27:39-54; John 19:31-37; Matt 27:55-61 |  |
| 2026-04-11 | Romans 6.3-11; Matthew 28.1-20 |  |  |
| 2026-04-12 | Acts 1.1-8; John 1.1-17 |  |  |
| 2026-04-17 | Acts 3.1-8; Philippians 2.5-11; John 2.12-22; Luke 10.38-42, 11.27-28 | The Epistle — Acts 3:1-8 | The Holy Gospel — John 2:12-22 |
| 2026-04-20 | Acts 3.19-26; John 2.1-11 |  |  |
| 2026-04-21 | Acts 4.1-10; John 3.16-21 |  |  |
| 2026-04-22 | Acts 4.13-22; John 5.17-24 |  |  |
| 2026-04-23 | Acts 4.23-31; Acts 12.1-11; John 5.24-30; John 15.17-16.2 |  |  |

## "About Today's Service" panel (`js/day-guide.js`)

`window.DayGuide.applyToSections` inserts a first item `about-today` (`resolvedAs: day-guide`) into Vespers and Orthros (New Calendar mode only; hooked last in `resolveOffice` so it sits first). It is composed only from data already in the app: the Orthodox-day record (title, tone, Typikon sign → plain-language meaning), the weekday Octoechos theme, the rank of the troparion's commemoration, Lent/Pascha/Holy Week notes, and a sources line counting what this page took from the Orloff Commons, AGES, hymn-guide metadata, and what remains deferred. No liturgical text is invented. Verified over all of 2026–2027 (1,460 office-days): panel present and first every time, no errors, no empty or "undefined" text.

## Patristic commentary on the appointed readings (plan item 7)

`data/commentary/readings/<year>.json` holds one verbatim excerpt (≤ ~1,100 characters, cut at a paragraph or sentence end, marked "…") per appointed Epistle / Gospel / Matins-Gospel citation of 2026 and 2027. `scripts/commentary/build-reading-commentary.py <clone of HistoricalChristianFaith/Commentaries-Database>` rebuilds it. `js/orthodox-day.js` (`_commentaryItem`) inserts it as item `patristic-commentary` ("From the Fathers — <Father>, <work>") directly after the Typika Epistle, Typika Gospel and Matins Gospel.

- **Public-domain translations only** (whitelist in the script): Chrysostom's NPNF homilies, Augustine's tractates/expositions, Cyril of Alexandria on John and Luke, and the Catena Aurea. Theophylact is excluded: the only translation in the database is modern. So are modern scholarly translations (Jerome on Matthew, Bede's homilies, etc.).
- Selection: entries contained in the pericope first, then Father priority (Chrysostom, Cyril, Augustine, others), then source priority (a Father's own homily over Catena).
- Coverage: 2026 650/720 citations, 2027 634/703 (Chrysostom 571). Gaps: 1 John and 1 Peter (only Theophylact available), plus a few others. 1,416 of 1,460 checked Typika/Orthros days carry a comment.
- Vespers Old Testament readings have no commentary yet.
- Known blemish: Catena Aurea text occasionally carries stray footnote letters (e.g. "Hereticsb").

## Icons (plan item 8)

`data/icons/commemoration-icons.json` maps the rank 1–2 Menaion commemorations (by MM-DD and exact Menaion name) and four moveable feasts (by day title regex) to a public-domain icon stored in `images/icons/`. `js/day-guide.js` (`_iconFor`) attaches it as `image` on the `about-today` item; `js/office-ui.js` renders it as a `<figure class="uo-icon">` with the credit line (only `images/icons/*` paths are accepted). The Commons search was done by agents and every license re-verified directly against the Commons API; the images were reviewed on a contact sheet. 181 distinct icons appear over 2026–27 (200 stored; extended 2026-10-02 to rank 3–4 saints, ~54% of all 360 commemorations) (Mark's 2027 date falls in Pascha so the feast is not the governing commemoration). Gaps: ~160 commemorations with no confirmable public-domain icon on Commons (nulls), and 14 found-but-not-downloaded (Wikimedia rate limit; retry later: andronicus-junia-apostles, cyriacus-hermit, acepsimas-bishop-persia, nikita-bishop-chalcedon, cyril-alexandria-bishop, david-thessalonica, placing-robe-lord-moscow, abdias-prophet, prophet-daniel-three-youths, eupsychios-caesarea, euphemia-great-martyr, phocas-gardener-sinope, gregory-wonderworker, melania-roman; their Commons file titles were in agent output only, so re-search by saint name, keep only Public-domain-licensed files, and add via the same merge as the others). Only the governing commemoration's icon shows on a day. Credits: `images/CREDITS.md`.
