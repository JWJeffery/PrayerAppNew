# Ground imagery credits

Per-lane background imagery used under `body.shell-v2` (see `css/office-shell.css`,
"PER-LANE GROUND IMAGERY"), always shown veiled — blurred, darkened, and at reduced
opacity — behind live liturgical text, never at full strength. Sources and licenses
below; every non-Anglican image was added 2026-09-24.

## Anglican (ANG)

Already part of this repository before this pass (Western Gothic imagery, used
elsewhere in the app — e.g. the entry screen, `#uo-threshold`).

- **`rood-screen.png`** — a Gothic rood screen archway. Night offices.
- **`chartres-rose.png`** — the south rose window, Chartres Cathedral. Day offices.

No separate provenance record exists for these two in this repository; they predate
the per-lane ground imagery work and were already in production use.

## Coptic Orthodox (OOR)

- **File**: `coptic-walters-w739.jpg` (cropped from the museum original)
- **Manuscript**: Walters Art Museum, **Ms. W.739, folio 1r** — a Coptic parchment
  fragment of the Book of Exodus, **8th century CE**.
- **Source**: The Digital Walters, [thedigitalwalters.org](https://www.thedigitalwalters.org/),
  Walters Ms. W.739.
- **License**: **Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported**
  (CC BY-NC-SA 3.0) — <http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode>.
  Confirmed directly from the image file's own embedded XMP/IPTC rights metadata, not
  assumed. **This is NOT CC0** — an earlier note in this project incorrectly recorded
  it as CC0 and as a different manuscript (W.592); both corrected 2026-09-24. Per the
  license: non-commercial use only (this app is non-commercial), attribution required
  (given here), share-alike applies to redistributed derivatives of the image itself.
- **Attribution**: The Walters Art Museum, Baltimore, MD, USA. Walters Ms. W.739,
  fol. 1r. Cataloguing and imaging by Walters Art Museum curatorial staff and
  researchers.
- Supplied directly by the project owner; cropped locally to remove the black
  photography backdrop and a pale binding-gutter strip along the original scan's left
  edge.
- **Day-mode fix, 2026-09-24**: found while checking whether the Byzantine lane's own
  day-mode "flat wash" bug (see that lane's own entry below) also affected this one.
  It did, more severely — the Morning Office (Prime), a real day office, measured only
  4.87:1 median contrast (the night-mode tuning cites 12.4:1) and the manuscript was
  essentially invisible on screen. Fixed with a `body.shell-v2.uo-day`-scoped override
  in `css/office-shell.css`: brightness raised toward the source image instead of
  darkened further, opacity raised too (0.5 → 0.44 net after two passes) rather than
  relying on darkness to veil it; blur unchanged. Re-verified by screenshot against
  real Morning Office text: manuscript text columns are now genuinely visible.

## Church of the East (COE)

- **File**: `east-syriac-thaksa.jpg` (cropped from the Commons original)
- **Subject**: An 18th-century Thaksa (service book) opening, Chaldean Syrian Church,
  Thrissur, India.
- **Source**: Wikimedia Commons, [File:East Syriac Script Thaksa.jpg](https://commons.wikimedia.org/wiki/File:East_Syriac_Script_Thaksa.jpg).
- **License**: Public domain — tagged on the Commons file page with both
  **`PD-old-70-expired`** and **`CC-PD-Mark`**. Confirmed directly against the live
  Commons page's own category tags, not assumed.
- Cropped locally to remove a thin black scan-edge vignette (a few pixels on the left
  and right edges, not a wide photography backdrop).
- **Day-mode fix, 2026-09-24**: same sweep as Coptic and Byzantine above. Sapra
  (Morning Prayer), the real day office, measured a safer 8.36:1 median than Coptic's
  day-mode failure, and the cross ornament stayed faintly perceptible, but noticeably
  fainter than this same image's own night-mode rendering. Fixed with the same
  `uo-day`-scoped override pattern: brightness raised, opacity lowered (0.42 → 0.3);
  blur unchanged. Re-verified by screenshot: the cross ornament is now clearly visible,
  matching the night-mode quality.

## Byzantine / Eastern Orthodox (BYZC)

- **File**: `byzantine-w528-headpiece.jpg` (cropped from the museum original)
- **Manuscript**: Walters Art Museum, **Ms. W.528, folio 188r** — the ornamented
  headpiece and zoomorphic initial opening the Gospel of John, a Greek Gospel Book,
  **early 13th century CE**.
- **Deliberately an ornament-and-text page**, not a figural image: per
  `documentation/UI_REDESIGN_HANDOFF.md`'s own correction to the original design
  proposal, an icon "is a venerated object, not a texture," and using one this way is
  explicitly ruled out. W.528's own single surviving miniature (a different folio, an
  Evangelist portrait, and even that was "painted over in the twentieth century" per
  the manuscript's own catalogue description) was never a candidate for that reason.
  Confirmed by looking directly at the page before cropping: geometric interlace,
  floral ornament, two peacocks, and the manuscript's own incipit text — nothing
  figural or venerated.
- **Source**: The Digital Walters, [thedigitalwalters.org](https://www.thedigitalwalters.org/),
  Walters Ms. W.528 (image `W528_000377_sap.jpg`, mapped from folio 188r via the
  manuscript's own TEI description).
- **License**: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
  (CC BY-NC-SA 3.0), per that manuscript's own published TEI description — the same
  terms as the Coptic W.739 image above, not CC0.
- **Status**: sourced, wired, and now LIVE — the Horologion lane (Phase 5, lane 3 of
  3) ships a real envelope as of 2026-09-24 (`data-uo-tradition="BYZC"`, corrected
  that same day from an initial `"EOR"`, which did not match `HorologionEngine`'s
  own authoritative `const TRADITION = 'BYZC'`). Re-verified against real rendered
  Horologion text (Orthros, Great Lent, March 2026), not a stand-in: contrast against
  live text stayed safe in both themes, and the headpiece's interlace and the two
  peacocks are genuinely recognizable, confirmed by screenshot, not assumed. Night
  mode kept its original tuning unchanged (blur 6px, saturate 0.55, brightness 0.55,
  opacity 0.42) — it held up. Day mode needed its own override, added this same day
  once real content could finally be checked: the night-mode numbers, composited
  over the near-white day ground instead of the near-black night ground, compressed
  into a flat wash even though the text-contrast number still passed. Fixed the way
  the Anglican lane's own day override already solves the same problem — raise
  brightness back toward the source image (1.05, not darkened) and lower opacity
  (0.3) instead of crushing the image dark first (see `css/office-shell.css`'s own
  comment on this rule for the full account).

## Method note

Coptic, East Syriac, and Byzantine images were all cropped locally with Pillow to
remove black photography backgrounds and, where present, scan-edge artifacts —
verified by inspecting the actual cropped image, not by file size alone. The Coptic
and East Syriac treatments were tuned by measuring real WCAG contrast ratios against
`--uo-ink` from live Playwright screenshots of the rendered office, not by eye; see
`AUDIT_GOVERNANCE_LEDGER.md`, key `ui:per-lane-ground-imagery`, for the full method
and the measured numbers.

## Book of Needs (ecumenical, not tied to one tradition)

- **File**: `chi-rho-sousse.jpg` (cropped from the museum original)
- **Subject**: A Chi-Rho (☧) Christogram mosaic with Alpha and Omega, from the
  Christian catacombs of Sousse (ancient Hadrumetum), Tunisia — paleochristian,
  now held in the Archaeological Museum of Sousse.
- **Source**: Wikimedia Commons, [File:Sousse mosaic chi rho.jpg](https://commons.wikimedia.org/wiki/File:Sousse_mosaic_chi_rho.jpg),
  photographed by Ad Meskens ("own work").
- **License**: Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0) —
  <https://creativecommons.org/licenses/by-sa/3.0/legalcode>. Confirmed directly
  from the file's own Commons page (`LicenseShortName` in its extended metadata),
  not assumed. Attribution required (given here); no non-commercial restriction,
  unlike the Coptic and Byzantine Walters images above.
- **Why this image, not a lane-specific one**: Book of Needs serves every
  tradition in this app at once — the original design pass deliberately shipped
  no ground image at all for exactly that reason ("Book of Needs has no one
  tradition of its own to veil a ground image for"). The Chi-Rho is one of the
  oldest Christian symbols in continuous use, predating the Great Schism (1054),
  the Church of the East's separation (431), and Oriental Orthodoxy's separation
  from Chalcedon (451) — every later division this app's traditions sit on
  either side of. A specifically *paleochristian* instance (not a later,
  tradition-specific stylization of the symbol) was chosen for the same reason:
  genuinely shared heritage, not a Western or Eastern rendering of it.
- Cropped locally to remove the museum mount's wide white mat, the wall-mounted
  descriptive plaque, and the dark gallery wall visible around the framed panel
  in the original photograph — the same treatment as every other image on this
  page, isolating the artifact itself.
- **Tuned by measurement, not eyeballed**, following the same Playwright
  contrast-sampling method as the Coptic/East Syriac images above (`--bon-ink`
  in place of `--uo-ink`, since Book of Needs uses its own, deliberately
  separate token set): night `blur(6px) saturate(0.5) brightness(0.55)
  opacity(0.48)` measured median 11.56:1, p95 13.57:1, p99 14.05:1 against
  `--bon-ink`; day `blur(6px) saturate(0.5) brightness(1.05) opacity(0.3)`
  measured median 9.71:1, p95 11.50:1, p99 12.04:1. Both comfortably clear
  WCAG AAA (7:1) at every percentile measured, on the first tuning pass —
  unlike Coptic/Byzantine above, no multi-pass correction was needed here.
  Confirmed visually as well, not contrast numbers alone: the mosaic's
  radiating pattern and the Chi-Rho monogram itself are both genuinely
  recognizable as texture in both themes, not reduced to an undifferentiated
  wash. See `AUDIT_GOVERNANCE_LEDGER.md`, key `needs:ecumenical-ground-imagery`,
  for the full method.

## Icons of the feast / saint of the day (added 2026-10-01/02)

Shown in the "About Today's Service" panel (`js/day-guide.js`) when the day's governing commemoration has one, plus the moveable feasts Palm Sunday, Pascha, Ascension and Pentecost. Data: `data/icons/commemoration-icons.json`. 201 icons. Every file's license was read from its Wikimedia Commons metadata (Public domain, or CC0 where marked) and stored locally at ≤500 px in `images/icons/`. Some are Menologion of Basil II miniatures or early-20th-century Russian book illustrations where no panel icon exists; several are under 400 px wide. About half the commemorations have none: no public-domain icon of that saint could be confirmed on Commons.

| File | Commons title | Artist / date | License |
|---|---|---|---|
| `abercius-bishop-hieropolis.jpg` | [Abercius of Hieropolis (Menologion of Basil II)](https://commons.wikimedia.org/wiki/File:Abercius_of_Hieropolis_(Menologion_of_Basil_II).jpg) | Unknown; 0985 | Public domain |
| `alexios-man-of-god.jpg` | [Alexios of Rome Russian Icon](https://commons.wikimedia.org/wiki/File:Alexios_of_Rome_Russian_Icon.jpg) | Unknown author; 16th-19th Centuries | Public domain |
| `alexios-metropolitan-moscow.jpg` | [Alexius of Moscow (1580, Solvychegodks)](https://commons.wikimedia.org/wiki/File:Alexius_of_Moscow_(1580,_Solvychegodks).jpg) | Unknown; 1580s | Public domain |
| `alypius-stylite.jpg` | [Alypius the Stylite (Tzanes)](https://commons.wikimedia.org/wiki/File:Alypius_the_Stylite_(Tzanes).png) | Emmanuel Tzanes; between 1635 and 1660 | Public domain |
| `amphilochius-iconium.jpg` | [Amphilochius of Iconium (Menologion of Basil II)](https://commons.wikimedia.org/wiki/File:Amphilochius_of_Iconium_(Menologion_of_Basil_II).jpg) | Unknown; 0985 | Public domain |
| `andrew-crete-bishop.jpg` | [Rila Mon. - Fresco mir. icon 022 Andrew bishop of Crete](https://commons.wikimedia.org/wiki/File:Rila_Mon._-_Fresco_mir._icon_022_Andrew_bishop_of_Crete.jpg) | Димитър Христов и Зафир. 1843; 1843 | Public domain |
| `andrew-stratelates.jpg` | [Saint Andrew Stratelates XVII c](https://commons.wikimedia.org/wiki/File:Saint_Andrew_Stratelates_XVII_c.jpg) | AnonymousUnknown author; 17th century | Public domain |
| `annunciation-theotokos.jpg` | [Byzantine icon of the Annunciation (14th c., Pushkin museum)](https://commons.wikimedia.org/wiki/File:Byzantine_icon_of_the_Annunciation_(14th_c.,_Pushkin_museum).jpg) | Unknown author; 14th century | Public domain |
| `anthony-great.jpg` | [Anthony the Great icon (lebanon)](https://commons.wikimedia.org/wiki/File:Anthony_the_Great_icon_(lebanon).jpg) | Unknown author; 18th century | Public domain |
| `antipas-pergamon.jpg` | [St Antipas Icon Sinai 13th century](https://commons.wikimedia.org/wiki/File:St_Antipas_Icon_Sinai_13th_century.jpg) | Unknown author; 2008-04 | Public domain |
| `apostle-andrew-first-called.jpg` | [Saint Andrew (Tzanes)](https://commons.wikimedia.org/wiki/File:Saint_Andrew_(Tzanes).png) | Emmanuel Tzanes; 1658 | Public domain |
| `apostle-evangelist-matthew.jpg` | [Matthew the Evangelist - icon](https://commons.wikimedia.org/wiki/File:Matthew_the_Evangelist_-_icon.jpeg) | Unknown Russian icon painter, middle of 19 th cen.; Middle of 19th century. Submitted to wikimedia on 2008-05-01 | Public domain |
| `apostle-philip.jpg` | [Philip the Apostle icon](https://commons.wikimedia.org/wiki/File:Philip_the_Apostle_icon.jpeg) | Unknown Russian Orthodox icon painter; First half of the 19th century. Posted to wikimedia on 2011-10-01. | Public domain |
| `aquilina-byblos.jpg` | [Акилина Библосская и Параскева Пятница](https://commons.wikimedia.org/wiki/File:%D0%90%D0%BA%D0%B8%D0%BB%D0%B8%D0%BD%D0%B0_%D0%91%D0%B8%D0%B1%D0%BB%D0%BE%D1%81%D1%81%D0%BA%D0%B0%D1%8F_%D0%B8_%D0%9F%D0%B0%D1%80%D0%B0%D1%81%D0%BA%D0%B5%D0%B2%D0%B0_%D0%9F%D1%8F%D1%82%D0%BD%D0%B8%D1%86%D0%B0.jpg) | Anonymous Russian icon painter (before 1917); 19th century | Public domain |
| `archangel-michael-miracle-chonae.jpg` | [Michael Miracle Icon Sinai 12th century](https://commons.wikimedia.org/wiki/File:Michael_Miracle_Icon_Sinai_12th_century.jpg) | Unknown authorUnknown author; 2008-04 | Public domain |
| `arethas-martyrs-nagran.jpg` | [Byzantine - Saint Arethas - Walters 4820862](https://commons.wikimedia.org/wiki/File:Byzantine_-_Saint_Arethas_-_Walters_4820862.jpg) | Anonymous (Byzantine Empire)Unknown author; 10th century | Public domain |
| `ascension.jpg` | [Ascension of Jesus icon, Lattakia (1667)](https://commons.wikimedia.org/wiki/File:Ascension_of_Jesus_icon,_Lattakia_(1667).jpg) | Unknown author; before 1667 | Public domain |
| `athanasios-athos.jpg` | [Athanasios](https://commons.wikimedia.org/wiki/File:Athanasios.jpg) | Manuel Panselinos; 1290 | Public domain |
| `athanasius-alexandria.jpg` | [Saint-Athanasius-of-Alexandria-icon-Sozopol-Bulgaria-17century](https://commons.wikimedia.org/wiki/File:Saint-Athanasius-of-Alexandria-icon-Sozopol-Bulgaria-17century.jpg) | Unknown author; End of 17 century | Public domain |
| `athanasius-cyril-alexandria.jpg` | [Saint-Athanasius-of-Alexandria-icon-Sozopol-Bulgaria-17century](https://commons.wikimedia.org/wiki/File:Saint-Athanasius-of-Alexandria-icon-Sozopol-Bulgaria-17century.jpg) | Unknown author; End of 17 century | Public domain |
| `augustine-hippo.jpg` | [Greek Icon of Saint Augustinus of Hippo 5](https://commons.wikimedia.org/wiki/File:Greek_Icon_of_Saint_Augustinus_of_Hippo_5.jpg) | Unknown authorUnknown author; 20th centurydate QS:P,+1950-00-00T00:00:00Z/7 | Public domain |
| `autonomus-bishop-martyr.jpg` | [Autonomus of Italy by O.Chirikov (Muz.ist.rel)](https://commons.wikimedia.org/wiki/File:Autonomus_of_Italy_by_O.Chirikov_(Muz.ist.rel).jpg) | Osip Semenovich Chirikov; 19 th century | Public domain |
| `barbara-great-martyr.jpg` | [Saint Barbara icon in Saint Barbara Church, Kastoria, 19 Century](https://commons.wikimedia.org/wiki/File:Saint_Barbara_icon_in_Saint_Barbara_Church,_Kastoria,_19_Century.jpg) | unknown; 19_Century | Public domain |
| `bartholomew-barnabas-apostles.jpg` | [Apostle Bartholomew. Fresco of the Church of Agios Nikolaos. Stavronikita Monastery. Athos](https://commons.wikimedia.org/wiki/File:Apostle_Bartholomew._Fresco_of_the_Church_of_Agios_Nikolaos._Stavronikita_Monastery._Athos.jpg) | Theophanes the Cretan and Symeon; 1546 | Public domain |
| `bartholomew-titus-apostles.jpg` | [Apostle Bartholomew. Fresco of the Church of Agios Nikolaos. Stavronikita Monastery. Athos](https://commons.wikimedia.org/wiki/File:Apostle_Bartholomew._Fresco_of_the_Church_of_Agios_Nikolaos._Stavronikita_Monastery._Athos.jpg) | Theophanes the Cretan and Symeon; 1546 | Public domain |
| `basil-ancyra-presbyter.jpg` | [Basil of Ancyra by M.Dikarev (1890, Hermitage)](https://commons.wikimedia.org/wiki/File:Basil_of_Ancyra_by_M.Dikarev_(1890,_Hermitage).jpg) | Mikhail Ivanovich Dikarev; конец XIX — начало XX вв. | Public domain |
| `basil-bishop-amasea.jpg` | [Martyrion Agiou Basileos Amasias Dionysiou](https://commons.wikimedia.org/wiki/File:Martyrion_Agiou_Basileos_Amasias_Dionysiou.jpg) | Tzortzis Phouka; 1547 | Public domain |
| `basil-great-circumcision.jpg` | [Novgorod School - Saint Basil the Great - NG.M.01523 - National Museum of Art, Architecture and Design](https://commons.wikimedia.org/wiki/File:Novgorod_School_-_Saint_Basil_the_Great_-_NG.M.01523_-_National_Museum_of_Art,_Architecture_and_Design.jpg) | School of Novgorod school; 1400s | Public domain |
| `beheading-john-baptist.jpg` | [Beheading of John the Baptist (Damaskinos)](https://commons.wikimedia.org/wiki/File:Beheading_of_John_the_Baptist_(Damaskinos).png) | Michael Damaskinos; 1590 | Public domain |
| `benedict-nursia.jpg` | [Жития Святых (1903-1911) - икона 07141 Венедикт](https://commons.wikimedia.org/wiki/File:%D0%96%D0%B8%D1%82%D0%B8%D1%8F_%D0%A1%D0%B2%D1%8F%D1%82%D1%8B%D1%85_(1903-1911)_-_%D0%B8%D0%BA%D0%BE%D0%BD%D0%B0_07141_%D0%92%D0%B5%D0%BD%D0%B5%D0%B4%D0%B8%D0%BA%D1%82.png) | Unknown authorUnknown author; before 1911date QS:P,+1911-00-00T00:00:00Z/7,P1326,+1911-00-00T00:00:00Z/9 | Public domain |
| `blase-sebaste.jpg` | [Modeste jerusalem and-blaise-sebaste 18c rus](https://commons.wikimedia.org/wiki/File:Modeste_jerusalem_and-blaise-sebaste_18c_rus.png) | Anonymous Russian icon painter (before 1917)Public domain image (according to PD-Russia-expired); 18th centurydate QS:P,+1750-00-00T00:00:00Z/7 | Public domain |
| `chariton-confessor.jpg` | [Saint Chariton](https://commons.wikimedia.org/wiki/File:Saint_Chariton.jpg) | AnonymousUnknown author; 1660sdate QS:P,+1660-00-00T00:00:00Z/8 | Public domain |
| `chrysanthos-daria.jpg` | [Жития Святых (1903-1911) - икона 07191 Хрисанф и Дария](https://commons.wikimedia.org/wiki/File:%D0%96%D0%B8%D1%82%D0%B8%D1%8F_%D0%A1%D0%B2%D1%8F%D1%82%D1%8B%D1%85_(1903-1911)_-_%D0%B8%D0%BA%D0%BE%D0%BD%D0%B0_07191_%D0%A5%D1%80%D0%B8%D1%81%D0%B0%D0%BD%D1%84_%D0%B8_%D0%94%D0%B0%D1%80%D0%B8%D1%8F.png) | Unknown authorUnknown author; before 1911date QS:P,+1911-00-00T00:00:00Z/7,P1326,+1911-00-00T00:00:00Z/9 | Public domain |
| `conception-john-baptist.jpg` | [Conception of John Baptist (icon, Russia, 15 c)](https://commons.wikimedia.org/wiki/File:Conception_of_John_Baptist_(icon,_Russia,_15_c).jpg) | AnonymousUnknown author; 2-я половина 15 века | Public domain |
| `constantine-helen-equal-apostles.jpg` | [Constantine and Helen](https://commons.wikimedia.org/wiki/File:Constantine_and_Helen.png) | Emmanuel Tzanes; 1669 | Public domain |
| `cornelius-centurion.jpg` | [Cornelius the centurion by O.Chirikov (Muz.ist.relig)](https://commons.wikimedia.org/wiki/File:Cornelius_the_centurion_by_O.Chirikov_(Muz.ist.relig).jpg) | Osip Semenovich Chirikov; 19th century | Public domain |
| `cosmas-damian-arabia.jpg` | [Saints Cosmas and Damian icon, Syria (1778)](https://commons.wikimedia.org/wiki/File:Saints_Cosmas_and_Damian_icon,_Syria_(1778).jpg) | Unknown authorUnknown author; circa 1778date QS:P,+1778-00-00T00:00:00Z/9,P1480,Q5727902 | Public domain |
| `cosmas-damian-asia.jpg` | [Saints Cosmas and Damian of the Gymnasium Church, Saints Cosmas and Damian Icon, 18th Century](https://commons.wikimedia.org/wiki/File:Saints_Cosmas_and_Damian_of_the_Gymnasium_Church,_Saints_Cosmas_and_Damian_Icon,_18th_Century.png) | Unknown author; 18th century | Public domain |
| `cyprian-ustyna-martyrs.jpg` | [Ciprian si Iustina](https://commons.wikimedia.org/wiki/File:Ciprian_si_Iustina.jpg) | Painter unknown, photographer unknown; Unknown date | Public domain |
| `cyril-constantine-philosopher.jpg` | [Sts. Cyril and Methodius Icon in Assumtion of Mary Church in Harlets](https://commons.wikimedia.org/wiki/File:Sts._Cyril_and_Methodius_Icon_in_Assumtion_of_Mary_Church_in_Harlets.JPG) | probably Velko Iliev; before 1900 | Public domain |
| `cyril-jerusalem.jpg` | [Serbian Fresco Icon of Saint Cyril of Jerusalem 2](https://commons.wikimedia.org/wiki/File:Serbian_Fresco_Icon_of_Saint_Cyril_of_Jerusalem_2.jpg) | Unknown author; 14th-16th Century | Public domain |
| `cyril-methodius-slavs.jpg` | [Sts. Cyril and Methodius Icon in Saint George Church in Dolna Beshovitsa](https://commons.wikimedia.org/wiki/File:Sts._Cyril_and_Methodius_Icon_in_Saint_George_Church_in_Dolna_Beshovitsa.jpg) | Velko Iliev; before 1880 | Public domain |
| `cyrus-john-unmercenaries.jpg` | [Cyrus and John](https://commons.wikimedia.org/wiki/File:Cyrus_and_John.jpg) | Unknown author; n.d. | Public domain |
| `daniel-stylite.jpg` | [Daniel Stylites (Kirillo-Belozersk)](https://commons.wikimedia.org/wiki/File:Daniel_Stylites_(Kirillo-Belozersk).jpg) | School of Dionisius; 1st h. 16 c. | Public domain |
| `demetrios-thessalonica.jpg` | [Saint Demetrius of Protat](https://commons.wikimedia.org/wiki/File:Saint_Demetrius_of_Protat.JPG) | Manuel Panselinos; between 1290 and 1310 | Public domain |
| `dionysius-areopagite.jpg` | [Emmanuel Tzanes - Dionysius the Areopagite - NG.M.01774 - National Museum of Art, Architecture and Design](https://commons.wikimedia.org/wiki/File:Emmanuel_Tzanes_-_Dionysius_the_Areopagite_-_NG.M.01774_-_National_Museum_of_Art,_Architecture_and_Design.jpg) | Emmanuel Tzanes; between 1610 and 1690date QS:P,+1650-00-00T00:00:00Z/7,P1319,+1610-00-00T00:00:00Z/9,P1326,+1690-00-00T00:00:00Z/9 | Public domain |
| `dormition-theotokos.jpg` | [Dormition of the Theotokos, Novgorod](https://commons.wikimedia.org/wiki/File:Dormition_of_the_Theotokos,_Novgorod.jpg) | Unknown author; turn of the 14/15th century | Public domain |
| `elijah-prophet.jpg` | [Semen Spiridonov Kholmogorets. Prophet Elijah. 1678](https://commons.wikimedia.org/wiki/File:Semen_Spiridonov_Kholmogorets._Prophet_Elijah._1678.jpg) | Semyon Spiridonov; 28 November 1678 | Public domain |
| `elisha-prophet.jpg` | [Elisha-Eliseus](https://commons.wikimedia.org/wiki/File:Elisha-Eliseus.jpg) | 18 century icon painter; first quarter of XVIII cen. | Public domain |
| `entrance-theotokos.jpg` | [Russian - Presentation of the Virgin in the Temple - Walters 372410](https://commons.wikimedia.org/wiki/File:Russian_-_Presentation_of_the_Virgin_in_the_Temple_-_Walters_372410.jpg) | Anonymous (Russian artist)Unknown author; 18th century | Public domain |
| `ephrem-syrian.jpg` | [Преподобный Ефрем Сирин](https://commons.wikimedia.org/wiki/File:%D0%9F%D1%80%D0%B5%D0%BF%D0%BE%D0%B4%D0%BE%D0%B1%D0%BD%D1%8B%D0%B9_%D0%95%D1%84%D1%80%D0%B5%D0%BC_%D0%A1%D0%B8%D1%80%D0%B8%D0%BD.jpg) | Manuel Panselinos / Мануил Панселин; early 14th c. ; Начало XIV в | Public domain |
| `epiphanius-cyprus.jpg` | [Жития Святых (1903-1911) - икона 09122 Епифаний](https://commons.wikimedia.org/wiki/File:%D0%96%D0%B8%D1%82%D0%B8%D1%8F_%D0%A1%D0%B2%D1%8F%D1%82%D1%8B%D1%85_(1903-1911)_-_%D0%B8%D0%BA%D0%BE%D0%BD%D0%B0_09122_%D0%95%D0%BF%D0%B8%D1%84%D0%B0%D0%BD%D0%B8%D0%B9.png) | Unknown authorUnknown author; before 1911date QS:P,+1911-00-00T00:00:00Z/7,P1326,+1911-00-00T00:00:00Z/9 | Public domain |
| `euphemia-all-praised-september.jpg` | [St Euphemia](https://commons.wikimedia.org/wiki/File:St_Euphemia.jpg) | Anonymous; 17 th century | Public domain |
| `euplus-catania-deacon.jpg` | [Mosaic of Saint Euplos of Catania at the Daphni Monastery](https://commons.wikimedia.org/wiki/File:Mosaic_of_Saint_Euplos_of_Catania_at_the_Daphni_Monastery.jpg) | Unknown authorUnknown author; 12th Century | Public domain |
| `eusebius-samosata.jpg` | [Menaion icon (17 c., TsAK) - June - 35 Eusebius of Samosata](https://commons.wikimedia.org/wiki/File:Menaion_icon_(17_c.,_TsAK)_-_June_-_35_Eusebius_of_Samosata.jpg) | Unknown author; 2011-07-05 | Public domain |
| `eustathios-thespesia-companions.jpg` | [Saint Eustace, Cretan school, 17 c.](https://commons.wikimedia.org/wiki/File:Saint_Eustace,_Cretan_school,_17_c..jpg) | Cretan School; Первая половина — середина XVII в. | Public domain |
| `euthymius-great.jpg` | [Euthymius the Great (Tzanes)](https://commons.wikimedia.org/wiki/File:Euthymius_the_Great_(Tzanes).png) | Emmanuel Tzanes; 1682 | Public domain |
| `exaltation-holy-cross.jpg` | [Unknown painter - Exaltation of the Cross - WGA23497](https://commons.wikimedia.org/wiki/File:Unknown_painter_-_Exaltation_of_the_Cross_-_WGA23497.jpg) | Unknown Icon Painter, Russian (late 15th century in northern Russia); 1490s | Public domain |
| `finding-relics-innocent-irkutsk.jpg` | [Innocent of Irkutsk](https://commons.wikimedia.org/wiki/File:Innocent_of_Irkutsk.jpg) | Anonymous; 19 th century | Public domain |
| `first-second-finding-head-john-baptist.jpg` | [Findings of John the Baptist's head BETTER](https://commons.wikimedia.org/wiki/File:Findings_of_John_the_Baptist%27s_head_BETTER.jpg) | Unknown author; 14th century | Public domain |
| `floros-lavros-martyrs.jpg` | [0899Ha. Hermitage Museum (Hall 144). Icon of the Martyrs Florus and Laurus](https://commons.wikimedia.org/wiki/File:0899Ha._Hermitage_Museum_(Hall_144)._Icon_of_the_Martyrs_Florus_and_Laurus.jpg) | Unknown author; конец XV | Public domain |
| `forefeast-annunciation.jpg` | [Annunciation Icon Sinai 12th century](https://commons.wikimedia.org/wiki/File:Annunciation_Icon_Sinai_12th_century.jpg) | anonymous; April 2008 | Public domain |
| `forefeast-dormition.jpg` | [Dormition of the Theotokos, Novgorod](https://commons.wikimedia.org/wiki/File:Dormition_of_the_Theotokos,_Novgorod.jpg) | Unknown author; turn of the 14/15th century | Public domain |
| `forefeast-entrance-theotokos.jpg` | [Presentation of Mary, II Half of XIV Century, St Mary Perivleptos Church, Ohrid Icon Gallery](https://commons.wikimedia.org/wiki/File:Presentation_of_Mary,_II_Half_of_XIV_Century,_St_Mary_Perivleptos_Church,_Ohrid_Icon_Gallery.jpg) | Unknown author; II Half of XIV Century | Public domain |
| `forefeast-exaltation-cross.jpg` | [Unknown painter - Exaltation of the Cross - WGA23497](https://commons.wikimedia.org/wiki/File:Unknown_painter_-_Exaltation_of_the_Cross_-_WGA23497.jpg) | Unknown Icon Painter, Russian (late 15th century in northern Russia); 1490s | Public domain |
| `forefeast-nativity.jpg` | [Nativity of Jesus icon](https://commons.wikimedia.org/wiki/File:Nativity_of_Jesus_icon.jpg) | Unknown author; 18th century | Public domain |
| `forefeast-nativity-2.jpg` | [Nativity of Jesus icon](https://commons.wikimedia.org/wiki/File:Nativity_of_Jesus_icon.jpg) | Unknown author; 18th century | Public domain |
| `forefeast-nativity-3.jpg` | [0668Ha. Hermitage Museum (Hall 143). Icon of the Nativity of Christ](https://commons.wikimedia.org/wiki/File:0668Ha._Hermitage_Museum_(Hall_143)._Icon_of_the_Nativity_of_Christ.jpg) | Unknown authorUnknown author; 1-я половина XVII | Public domain |
| `forefeast-nativity-4.jpg` | [Nativity Icon from Saint George Church in Kochani 1865](https://commons.wikimedia.org/wiki/File:Nativity_Icon_from_Saint_George_Church_in_Kochani_1865.jpg) | Unknown author; 1865 | Public domain |
| `forefeast-nativity-theotokos.jpg` | [Nikola-Obrazopisov-Belyova-church-Nativity-of-the-Theotokos-icon-1863](https://commons.wikimedia.org/wiki/File:Nikola-Obrazopisov-Belyova-church-Nativity-of-the-Theotokos-icon-1863.jpg) | Nikola Obrazopisov; 1863 | Public domain |
| `forefeast-transfiguration.jpg` | [1400-10 Theophanes the Greek Transfiguration anagoria](https://commons.wikimedia.org/wiki/File:1400-10_Theophanes_the_Greek_Transfiguration_anagoria.JPG) | Theophanes the Greek; between 1400 and 1410 | Public domain |
| `forty-martyrs-sebaste.jpg` | [Forty Martyrs of Sebaste, II Half of XI Century, St Mary Perivleptos Church, Ohrid Icon Gallery](https://commons.wikimedia.org/wiki/File:Forty_Martyrs_of_Sebaste,_II_Half_of_XI_Century,_St_Mary_Perivleptos_Church,_Ohrid_Icon_Gallery.jpg) | Unknown author; II Half of XI Century | Public domain |
| `gabriel-archangel-july.jpg` | [Archangel Gabriel icon from Svaneti (Bernoville, 1875)](https://commons.wikimedia.org/wiki/File:Archangel_Gabriel_icon_from_Svaneti_(Bernoville,_1875).jpg) | Tomaszkiewicz EX; 1875 | Public domain |
| `george-great-martyr.jpg` | [Orthodox Bulgarian icon of St. George fighting the dragon](https://commons.wikimedia.org/wiki/File:Orthodox_Bulgarian_icon_of_St._George_fighting_the_dragon.jpg) | Unknown author; 1621 | Public domain |
| `gerasimus-jordan.jpg` | [Saint Gerasimus of Jordan with a Lion. Icon. Russia, 16th century](https://commons.wikimedia.org/wiki/File:Saint_Gerasimus_of_Jordan_with_a_Lion._Icon._Russia,_16th_century.jpg) | Unknown author; 16th century | Public domain |
| `great-martyr-anastasia.jpg` | [Anastasia of Sirmium](https://commons.wikimedia.org/wiki/File:Anastasia_of_Sirmium.jpg) | Anonymous; 15 th century | Public domain |
| `great-martyr-catherine.jpg` | [Catherine of Alexandria Philotheos Skoufos](https://commons.wikimedia.org/wiki/File:Catherine_of_Alexandria_Philotheos_Skoufos.png) | Philotheos Skoufos; 1660s | Public domain |
| `gregory-illuminator-armenia.jpg` | [Անհայտ հայ նկարիչ, 18-րդ դար Սուրբ Գրիգոր Լուսավորիչ](https://commons.wikimedia.org/wiki/File:%D4%B1%D5%B6%D5%B0%D5%A1%D5%B5%D5%BF_%D5%B0%D5%A1%D5%B5_%D5%B6%D5%AF%D5%A1%D6%80%D5%AB%D5%B9,_18-%D6%80%D5%A4_%D5%A4%D5%A1%D6%80_%D5%8D%D5%B8%D6%82%D6%80%D5%A2_%D4%B3%D6%80%D5%AB%D5%A3%D5%B8%D6%80_%D4%BC%D5%B8%D6%82%D5%BD%D5%A1%D5%BE%D5%B8%D6%80%D5%AB%D5%B9.jpg) | unknown, 18th century; 18th century | Public domain |
| `gregory-nyssa.jpg` | [Agios Gregorios Nysses Dionysiou](https://commons.wikimedia.org/wiki/File:Agios_Gregorios_Nysses_Dionysiou.png) | Theophanes the Cretan; 1547 | Public domain |
| `gregory-theologian.jpg` | [Agios Gregorios Theologos Peribleptos](https://commons.wikimedia.org/wiki/File:Agios_Gregorios_Theologos_Peribleptos.jpg) | Painters Michael and Eutychios; 14th century AD | Public domain |
| `haralambos-martyr.jpg` | [Charalambos Destroying The Plague (19th-century Orthodox icon from Șcheii Brașovului)](https://commons.wikimedia.org/wiki/File:Charalambos_Destroying_The_Plague_(19th-century_Orthodox_icon_from_%C8%98cheii_Bra%C8%99ovului).png) | Anonymous (writer)Unknown author; before 1900 | Public domain |
| `herodion-asyncritus-phlegon.jpg` | [Icon of Herodion of Patras](https://commons.wikimedia.org/wiki/File:Icon_of_Herodion_of_Patras.jpg) | Anonymous; 1840 | Public domain |
| `hilarion-great.jpg` | [Жития Святых (1903-1911) - икона 02211 Иларион](https://commons.wikimedia.org/wiki/File:%D0%96%D0%B8%D1%82%D0%B8%D1%8F_%D0%A1%D0%B2%D1%8F%D1%82%D1%8B%D1%85_(1903-1911)_-_%D0%B8%D0%BA%D0%BE%D0%BD%D0%B0_02211_%D0%98%D0%BB%D0%B0%D1%80%D0%B8%D0%BE%D0%BD.png) | Unknown authorUnknown author; before 1911date QS:P,+1911-00-00T00:00:00Z/7,P1326,+1911-00-00T00:00:00Z/9 | Public domain |
| `hiob-righteous.jpg` | [Иов Многострадальный. Чтец](https://commons.wikimedia.org/wiki/File:%D0%98%D0%BE%D0%B2_%D0%9C%D0%BD%D0%BE%D0%B3%D0%BE%D1%81%D1%82%D1%80%D0%B0%D0%B4%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9._%D0%A7%D1%82%D0%B5%D1%86.jpg) | RUSSIAN (MSTERA); 2008-03-19 14:22:33 | Public domain |
| `holy-innocents.jpg` | [Massacre of the Innocents (Ionian, 17th c., Byzantine museum)](https://commons.wikimedia.org/wiki/File:Massacre_of_the_Innocents_(Ionian,_17th_c.,_Byzantine_museum).jpg) | Anonymous icon painter; 17th century | Public domain |
| `hosea-prophet.jpg` | [Hosea](https://commons.wikimedia.org/wiki/File:Hosea.jpg) | 18 century icon painter; first quarter of XVIII cen. | Public domain |
| `icon-not-made-by-hands.jpg` | [Ushakov Nerukotvorniy](https://commons.wikimedia.org/wiki/File:Ushakov_Nerukotvorniy.jpg) | Simon Ushakov; 1677 | Public domain |
| `ignatius-god-bearer.jpg` | [Byzantine - Saint Ignatius of Antioch - Walters 4820867](https://commons.wikimedia.org/wiki/File:Byzantine_-_Saint_Ignatius_of_Antioch_-_Walters_4820867.jpg) | Anonymous (Byzantine Empire)Unknown author; 10th century | Public domain |
| `indiction-new-year.jpg` | [Simeon Stylites icon 1465](https://commons.wikimedia.org/wiki/File:Simeon_Stylites_icon_1465.jpg) | Anonymous; 1465 | Public domain |
| `isaiah-prophet.jpg` | [Icon of Isaiah (19th c, priv.coll.)](https://commons.wikimedia.org/wiki/File:Icon_of_Isaiah_(19th_c,_priv.coll.).jpg) | Unknown; LATE 19TH CENTURY | Public domain |
| `james-alphaeus-apostle.jpg` | [Apostle James, son of Alphaeus](https://commons.wikimedia.org/wiki/File:Apostle_James,_son_of_Alphaeus.jpeg) | Mstyora craftsmen of the 19th century; 19-th century (Russian empire). Posted to wikimedia on 2011-10-01. | Public domain |
| `james-brother-lord.jpg` | [James the Just (Novgorod, 16 c.)](https://commons.wikimedia.org/wiki/File:James_the_Just_(Novgorod,_16_c.).jpg) | Anonymous; 16th century | Public domain |
| `james-the-persian.jpg` | [Saint James Intercisus Sinai(12th-13th Century)](https://commons.wikimedia.org/wiki/File:Saint_James_Intercisus_Sinai(12th-13th_Century).jpg) | Unknown; 12th century | Public domain |
| `januarius-bishop-beneventum.jpg` | [Januarius by O.Chirikov (Muz.ist. rel)](https://commons.wikimedia.org/wiki/File:Januarius_by_O.Chirikov_(Muz.ist._rel).jpg) | Osip Semenovich Chirikov; 19th century | Public domain |
| `joachim-anna-parents-theotokos.jpg` | [0670Ha. Hermitage Museum (Hall 143). Icon Meeting of Joachim and Anna at the Golden Gate](https://commons.wikimedia.org/wiki/File:0670Ha._Hermitage_Museum_(Hall_143)._Icon_Meeting_of_Joachim_and_Anna_at_the_Golden_Gate.jpg) | Unknown author; 1-я половина XVII | Public domain |
| `joannicius-great.jpg` | [Saint Ioannikios the Great Serbian](https://commons.wikimedia.org/wiki/File:Saint_Ioannikios_the_Great_Serbian.jpg) | Unknown author; 13th Century | Public domain |
| `john-chrysostom.jpg` | [Novgorod School - John Chrysostom - NG.M.01522 - National Museum of Art, Architecture and Design](https://commons.wikimedia.org/wiki/File:Novgorod_School_-_John_Chrysostom_-_NG.M.01522_-_National_Museum_of_Art,_Architecture_and_Design.jpg) | School of Novgorod school; 1400s | Public domain |
| `john-climacus.jpg` | [Ivan Ivanovich's dimensional icon (1554, Kremlin museum)](https://commons.wikimedia.org/wiki/File:Ivan_Ivanovich%27s_dimensional_icon_(1554,_Kremlin_museum).jpg) | Anonymous; 1554 | Public domain |
| `john-damascene.jpg` | [Athonite Fresco Icon of Saint John of Damascus 2](https://commons.wikimedia.org/wiki/File:Athonite_Fresco_Icon_of_Saint_John_of_Damascus_2.jpg) | Unknown author; 14th-15th Century | Public domain |
| `john-the-merciful.jpg` | [Kirill Ulanov. John the Merciful. 1704](https://commons.wikimedia.org/wiki/File:Kirill_Ulanov._John_the_Merciful._1704.jpg) | Kirill Ulanov; 1704 | Public domain |
| `john-theologian-apostle.jpg` | [Holy Apostle and Evangelist John the Theologian. Icon. Greece, 1500. Monastery of St. John the Theologian on the island of Patmos](https://commons.wikimedia.org/wiki/File:Holy_Apostle_and_Evangelist_John_the_Theologian._Icon._Greece,_1500._Monastery_of_St._John_the_Theologian_on_the_island_of_Patmos.jpg) | Unknown author; 1500 | Public domain |
| `john-theologian-repose.jpg` | [The Death of the Holy Apostle and Evangelist John the Theologian. Icon. Crete, circa 1500 (before 1507)](https://commons.wikimedia.org/wiki/File:The_Death_of_the_Holy_Apostle_and_Evangelist_John_the_Theologian._Icon._Crete,_circa_1500_(before_1507).jpg) | Unknown author; 1500 | Public domain |
| `julian-tarsus-martyr.jpg` | [Julian of Tarsus](https://commons.wikimedia.org/wiki/File:Julian_of_Tarsus.jpg) | Unknown author; n.d. | Public domain |
| `justin-martyr-philosopher.jpg` | [Saint Justin Martyr by Theophanes the Cretan](https://commons.wikimedia.org/wiki/File:Saint_Justin_Martyr_by_Theophanes_the_Cretan.jpg) | Theophanes the Cretan; between 1545 and 1546 | Public domain |
| `lawrence-archdeacon-rome.jpg` | [Lawrence of Rome by M.Dikarev (1897, Hermitage)](https://commons.wikimedia.org/wiki/File:Lawrence_of_Rome_by_M.Dikarev_(1897,_Hermitage).jpg) | Mikhail Ivanovich Dikarev; 1892 | Public domain |
| `leavetaking-dormition.jpg` | [Dormition of Theotokos Andreas Ritzos](https://commons.wikimedia.org/wiki/File:Dormition_of_Theotokos_Andreas_Ritzos.jpg) | Andreas Ritzos; from 1436 until 1492 | Public domain |
| `leavetaking-presentation.jpg` | [Sretenie (Russian museum, 15 c)](https://commons.wikimedia.org/wiki/File:Sretenie_(Russian_museum,_15_c).jpg) | Мастерская Андрея Рублева Школа или худ. центр: Москва; 1408 | Public domain |
| `leavetaking-theophany.jpg` | [Baptism of Christ from Vasilyevskiy chin (1408, Russian museum)](https://commons.wikimedia.org/wiki/File:Baptism_of_Christ_from_Vasilyevskiy_chin_(1408,_Russian_museum).jpg) | Anonymous Russian icon painter (before 1917); 1408 | Public domain |
| `leo-catania.jpg` | [Saint Leo of Catania](https://commons.wikimedia.org/wiki/File:Saint_Leo_of_Catania.jpg) | Anonymous; 1818 | Public domain |
| `luke-evangelist.jpg` | [Saint Luke the Evangelist - icon](https://commons.wikimedia.org/wiki/File:Saint_Luke_the_Evangelist_-_icon.jpeg) | Unknown Russian Orthodox painter; 18th century. Posted to wikimedia on 2011-10-01 | Public domain |
| `macarius-egypt.jpg` | [Macarius the Elder Full Body Length Icon](https://commons.wikimedia.org/wiki/File:Macarius_the_Elder_Full_Body_Length_Icon.jpg) | Солнцев, Фёдор Григорьевич; 1846—1853 | Public domain |
| `mark-bishop-arethusa.jpg` | [Mark of Arethusa by O.Chirikov (Muz.ist. relig)](https://commons.wikimedia.org/wiki/File:Mark_of_Arethusa_by_O.Chirikov_(Muz.ist._relig).jpg) | Osip Semenovich Chirikov; 19th centurydate QS:P,+1850-00-00T00:00:00Z/7 Кон. XIX в. (1880-1890-е гг.)[1893-1894 гг.] | Public domain |
| `mark-evangelist.jpg` | [Evangelist Mark Icon](https://commons.wikimedia.org/wiki/File:Evangelist_Mark_Icon.tif) | Unknown author; between 1700 and 1800 | Public domain |
| `martyr-codratus-corinth.jpg` | [Pridvor, Sinaxar,10 martie - Sf. Mc. Codrat si cei impreuna cu el](https://commons.wikimedia.org/wiki/File:Pridvor,_Sinaxar,10_martie_-_Sf._Mc._Codrat_si_cei_impreuna_cu_el.jpg) | AnonymousUnknown author; 16th centurydate QS:P,+1550-00-00T00:00:00Z/7 | Public domain |
| `martyr-eudokia.jpg` | [Eudokia of Heliopolis (19c., Russia, priv. coll)](https://commons.wikimedia.org/wiki/File:Eudokia_of_Heliopolis_(19c.,_Russia,_priv._coll).jpg) | Anonymous Russian icon painter (before 1917)Public domain image (according to PD-Russia-expired); 19th centurydate QS:P,+1850-00-00T00:00:00Z/7 | Public domain |
| `martyr-ignatius-god-bearer-translation.jpg` | [Byzantine - Saint Ignatius of Antioch - Walters 4820867](https://commons.wikimedia.org/wiki/File:Byzantine_-_Saint_Ignatius_of_Antioch_-_Walters_4820867.jpg) | Anonymous (Byzantine Empire)Unknown author; 10th centurydate QS:P571,+950-00-00T00:00:00Z/7 (Middle Agesera QS:P2348,Q12554) | Public domain |
| `mary-egypt.jpg` | [Icon of Mary of Egypt (Mstera, 19th c.)](https://commons.wikimedia.org/wiki/File:Icon_of_Mary_of_Egypt_(Mstera,_19th_c.).jpg) | RUSSIAN (MSTERA); LATE XIX CENTURY, | Public domain |
| `mary-magdalene-equal-apostles.jpg` | [Mary Magdalene by Constantin Tzanes (17th c.)](https://commons.wikimedia.org/wiki/File:Mary_Magdalene_by_Constantin_Tzanes_(17th_c.).jpg) | Konstantinos Tzanes; 17th century | Public domain |
| `maximus-confessor.jpg` | [Athonite Fresco Icon of Saint Maximos the Confessor](https://commons.wikimedia.org/wiki/File:Athonite_Fresco_Icon_of_Saint_Maximos_the_Confessor.jpg) | Unknown author; 14th-15th Century | Public domain |
| `maximus-confessor-repose.jpg` | [Athonite Fresco Icon of Saint Maximos the Confessor](https://commons.wikimedia.org/wiki/File:Athonite_Fresco_Icon_of_Saint_Maximos_the_Confessor.jpg) | Unknown author; 14th-15th Century | Public domain |
| `menas-hermogenes-eugraphus.jpg` | [Menas, Hermogenes and Eugraphus of Alexandria (Menologion of Basil II)](https://commons.wikimedia.org/wiki/File:Menas,_Hermogenes_and_Eugraphus_of_Alexandria_(Menologion_of_Basil_II).jpg) | Unknown; 0985 | Public domain |
| `methodius-bishop-patara.jpg` | [Methodius of Olympus](https://commons.wikimedia.org/wiki/File:Methodius_of_Olympus.jpg) | Anonymous; 17 th century | Public domain |
| `metrophanes-cp.jpg` | [Agios Metrophanes Konstantinoupoleos Vissarionos](https://commons.wikimedia.org/wiki/File:Agios_Metrophanes_Konstantinoupoleos_Vissarionos.jpg) | Tzortzis Phouka; 16th Century | Public domain |
| `michael-bishop-synnada.jpg` | [Agios Michael Synnadas](https://commons.wikimedia.org/wiki/File:Agios_Michael_Synnadas.jpg) | Unknown author; 18-19th Century | Public domain |
| `moses-prophet-ethiopia.jpg` | [Saints Poimen, Elijah, and Moses the Black](https://commons.wikimedia.org/wiki/File:Saints_Poimen,_Elijah,_and_Moses_the_Black.jpg) | Unknown author; 15th Century | Public domain |
| `nativity-christ.jpg` | [Nativity of christ](https://commons.wikimedia.org/wiki/File:Nativity_of_christ.jpg) | Unknown author; 15th century | Public domain |
| `nativity-john-baptist.jpg` | [0176Hb. Nativity of St. John the Baptist, late 18th - early 19th century](https://commons.wikimedia.org/wiki/File:0176Hb._Nativity_of_St._John_the_Baptist,_late_18th_-_early_19th_century.jpg) | Unknown author; конец XVIII - начало XIX | Public domain |
| `nativity-theotokos.jpg` | [Nikola-Obrazopisov-Belyova-church-Nativity-of-the-Theotokos-icon-1863](https://commons.wikimedia.org/wiki/File:Nikola-Obrazopisov-Belyova-church-Nativity-of-the-Theotokos-icon-1863.jpg) | Nikola Obrazopisov; 1863 | Public domain |
| `nestor-martyr-thessalonica.jpg` | [Nestor of Thessalonica, Holy Trinity Church, Resava Monastery](https://commons.wikimedia.org/wiki/File:Nestor_of_Thessalonica,_Holy_Trinity_Church,_Resava_Monastery.png) | Unknown author; circa 1418 | Public domain |
| `nicetas-medikion.jpg` | [Преподобный Никита Исповедник, игумен обители Мидикийской. 1380 год. Из церкви Спаса на Ковалёве](https://commons.wikimedia.org/wiki/File:%D0%9F%D1%80%D0%B5%D0%BF%D0%BE%D0%B4%D0%BE%D0%B1%D0%BD%D1%8B%D0%B9_%D0%9D%D0%B8%D0%BA%D0%B8%D1%82%D0%B0_%D0%98%D1%81%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4%D0%BD%D0%B8%D0%BA,_%D0%B8%D0%B3%D1%83%D0%BC%D0%B5%D0%BD_%D0%BE%D0%B1%D0%B8%D1%82%D0%B5%D0%BB%D0%B8_%D0%9C%D0%B8%D0%B4%D0%B8%D0%BA%D0%B8%D0%B9%D1%81%D0%BA%D0%BE%D0%B9._1380_%D0%B3%D0%BE%D0%B4._%D0%98%D0%B7_%D1%86%D0%B5%D1%80%D0%BA%D0%B2%D0%B8_%D0%A1%D0%BF%D0%B0%D1%81%D0%B0_%D0%BD%D0%B0_%D0%9A%D0%BE%D0%B2%D0%B0%D0%BB%D1%91%D0%B2%D0%B5.jpg) | Unknown author; 1380 | Public domain |
| `nicholas-myra.jpg` | [St Nicholas Icon Sinai 13th century](https://commons.wikimedia.org/wiki/File:St_Nicholas_Icon_Sinai_13th_century.jpg) | Unknown author; 2008-04 | Public domain |
| `niketas-goth-martyr.jpg` | [Nikita Martyr (16th c., Yaroslavl museum)](https://commons.wikimedia.org/wiki/File:Nikita_Martyr_(16th_c.,_Yaroslavl_museum).jpg) | Unknown authorUnknown author; Вторая половина XVI в. | Public domain |
| `nina-georgia.jpg` | [St. Nino. Georgian fresco, 17th-18th centuries](https://commons.wikimedia.org/wiki/File:St._Nino._Georgian_fresco,_17th-18th_centuries.jpg) | Unknown author; 17th-18th centuries | Public domain |
| `onesimus-apostle.jpg` | [St.Onesimus](https://commons.wikimedia.org/wiki/File:St.Onesimus.jpg) | Unknown; 2012-08-08 11:18:42 | Public domain |
| `onuphrius-great.jpg` | [Onuphrius (Kolomenskoe, 1670s) 2](https://commons.wikimedia.org/wiki/File:Onuphrius_(Kolomenskoe,_1670s)_2.jpg) | Anonymous; 1670s | Public domain |
| `palm-sunday.jpg` | [Russian School - Icon with Entry into Jerusalem - FA001223 - Brighton Museum ^ Art Gallery](https://commons.wikimedia.org/wiki/File:Russian_School_-_Icon_with_Entry_into_Jerusalem_-_FA001223_-_Brighton_Museum_%5E_Art_Gallery.jpg) | anonymous; 18th century | Public domain |
| `pamphilius-caesarea.jpg` | [Athonite Fresco of the Martyrdom of Saint Pamphilos of Caesarea and his companions](https://commons.wikimedia.org/wiki/File:Athonite_Fresco_of_the_Martyrdom_of_Saint_Pamphilos_of_Caesarea_and_his_companions.jpg) | Unknown author; 1547 | Public domain |
| `panteleimon-great-martyr.jpg` | [Byzantine - Saint Panteleimon - Walters 4820864](https://commons.wikimedia.org/wiki/File:Byzantine_-_Saint_Panteleimon_-_Walters_4820864.jpg) | Anonymous (Byzantine artist)Unknown author; 10th century | Public domain |
| `paraskeva-serbia.jpg` | [Unknown - Saint Paraskeva of the Balkans - MNK XVIII-57 (53839)](https://commons.wikimedia.org/wiki/File:Unknown_-_Saint_Paraskeva_of_the_Balkans_-_MNK_XVIII-57_(53839).jpg) | unknown; circa 1400-1500 | Public domain |
| `parthenius-lampsacus.jpg` | [Parthenios of Lampsakos](https://commons.wikimedia.org/wiki/File:Parthenios_of_Lampsakos.jpg) | Unknown author; n.d. | Public domain |
| `pascha.jpg` | [Russian School - Icon with the Resurrection and the Anastasis (Descent into Hell) - FA001215 - Brighton Museum ^ Art Gallery](https://commons.wikimedia.org/wiki/File:Russian_School_-_Icon_with_the_Resurrection_and_the_Anastasis_(Descent_into_Hell)_-_FA001215_-_Brighton_Museum_%5E_Art_Gallery.jpg) | anonymous; 19th century | Public domain |
| `paul-theban-john-huts.jpg` | [Saint-John-Hut-Dweller-Paul-Thebes-Icon-Orthodox](https://commons.wikimedia.org/wiki/File:Saint-John-Hut-Dweller-Paul-Thebes-Icon-Orthodox.jpg) | Anonymous; 15th-17th Centuries | Public domain |
| `pelagia-penitent.jpg` | [Pelagia of Antioch (Menologion of Basil II)](https://commons.wikimedia.org/wiki/File:Pelagia_of_Antioch_(Menologion_of_Basil_II).jpg) | Unknown; 0985 | Public domain |
| `pentecost.jpg` | [Descent of the Holy Spirit upon the Apostles (Joseph Vladimirov, 2)](https://commons.wikimedia.org/wiki/File:Descent_of_the_Holy_Spirit_upon_the_Apostles_(Joseph_Vladimirov,_2).jpg) | Joseph Vladimirov / Иосиф Владимиров; 1666 | Public domain |
| `peter-paul-apostles.jpg` | [Peter and Paul the Apostle icon, Aleppo 1667](https://commons.wikimedia.org/wiki/File:Peter_and_Paul_the_Apostle_icon,_Aleppo_1667.jpg) | Unknown author; before 1667 | Public domain |
| `pimen-great.jpg` | [Hosios Loukas (nave, vault over south-west bay) - S.Poimen](https://commons.wikimedia.org/wiki/File:Hosios_Loukas_(nave,_vault_over_south-west_bay)_-_S.Poimen.jpg) | Unknown artist; 11th century | Public domain |
| `plato-roman.jpg` | [Fresco of Saint Platon of Ankyra, Dečani](https://commons.wikimedia.org/wiki/File:Fresco_of_Saint_Platon_of_Ankyra,_De%C4%8Dani.jpg) | Unknown author; 1350 | Public domain |
| `polycarp-smyrna.jpg` | [Polycarp of Smyrna, Menologion of Basil II](https://commons.wikimedia.org/wiki/File:Polycarp_of_Smyrna,_Menologion_of_Basil_II.png) | Authors of Menologion of Basil II (circa 985 AC, Constantinople), Byzantine manuscript illuminators[1]: Pantoleon with Georgios, Michael the Younger, Michael of Blachernae, Symeon, Symeon of Blachernae, Menas, and Nestor (Online on Vatican site); 0985 | Public domain |
| `porphyry-gaza.jpg` | [Saint Porphyrius of Gaza Crop](https://commons.wikimedia.org/wiki/File:Saint_Porphyrius_of_Gaza_Crop.jpg) | Unknown author; 16th-18th century | Public domain |
| `presentation-lord.jpg` | [Sretenie (Russian museum, 15 c)](https://commons.wikimedia.org/wiki/File:Sretenie_(Russian_museum,_15_c).jpg) | Мастерская Андрея Рублева Школа или худ. центр: Москва; 1408 | Public domain |
| `prophet-habakkuk.jpg` | [Habakkuk](https://commons.wikimedia.org/wiki/File:Habakkuk.jpg) | 18 century icon painter; first quarter of XVIII cen. | Public domain |
| `prophet-jeremiah.jpg` | [0170Hb. Prophet Jeremiah, 2nd half of the 18th century](https://commons.wikimedia.org/wiki/File:0170Hb._Prophet_Jeremiah,_2nd_half_of_the_18th_century.jpg) | Unknown author; 2-я половина XVIII | Public domain |
| `prophet-malachi.jpg` | [Malachi](https://commons.wikimedia.org/wiki/File:Malachi.jpg) | 18 century icon painter; first quarter of XVIII cen. | Public domain |
| `prophet-nahum.jpg` | [Nahum-prophet](https://commons.wikimedia.org/wiki/File:Nahum-prophet.jpg) | Unknown; first quarter of XVIII cen. | Public domain |
| `prophet-zephaniah.jpg` | [Zephaniah from Yaroslavl (18 c, priv.coll)](https://commons.wikimedia.org/wiki/File:Zephaniah_from_Yaroslavl_(18_c,_priv.coll).jpg) | Anonymous Russian icon painter (before 1917); 18th century | Public domain |
| `protection-theotokos.jpg` | [Protection de la Mere de Dieu Ecole de Novgorod Moscou, Galerie Tretiakov](https://commons.wikimedia.org/wiki/File:Protection_de_la_Mere_de_Dieu_Ecole_de_Novgorod_Moscou,_Galerie_Tretiakov.jpg) | AnonymousUnknown author; between 1401 and 1425 | Public domain |
| `sabas-sanctified.jpg` | [The Dormition of Sabbas the Sanctified](https://commons.wikimedia.org/wiki/File:The_Dormition_of_Sabbas_the_Sanctified.png) | Philotheos Skoufos; circa 1656 | Public domain |
| `sampson-hospitable.jpg` | [Sampson the Hospitable att. to M.Dikarev (c. 1900, Sotheby's)](https://commons.wikimedia.org/wiki/File:Sampson_the_Hospitable_att._to_M.Dikarev_(c._1900,_Sotheby%27s).jpg) | attributed to the Dikariev workshop; circa 1900 | Public domain |
| `samuel-prophet.jpg` | [Prophet Samuel Fresco, Gračanica](https://commons.wikimedia.org/wiki/File:Prophet_Samuel_Fresco,_Gra%C4%8Danica.jpg) | Unknown authorUnknown author; 1318 | Public domain |
| `sebastian-rome.jpg` | [Sebastian by M.Dikarev (Muz.ist.relig)](https://commons.wikimedia.org/wiki/File:Sebastian_by_M.Dikarev_(Muz.ist.relig).jpg) | Mikhail Ivanovich Dikarev; 1880s-1890s | Public domain |
| `seraphim-sarov.jpg` | [Seraphim of Sarov (after 1903, priv.coll)](https://commons.wikimedia.org/wiki/File:Seraphim_of_Sarov_(after_1903,_priv.coll).jpg) | Anonymous Russian icon painter (before 1917)Public domain image (according to PD-Russia-expired); after 1903 | Public domain |
| `sergios-bacchus.jpg` | [Sergius baccus](https://commons.wikimedia.org/wiki/File:Sergius_baccus.jpg) | Unknown authorUnknown author; turn of the 6/7th century | Public domain |
| `seven-sleepers-ephesus.jpg` | [Russian Icon of the Seven Sleepers of Ephesos with Vine Frame](https://commons.wikimedia.org/wiki/File:Russian_Icon_of_the_Seven_Sleepers_of_Ephesos_with_Vine_Frame.jpg) | Unknown author; 19th-20th Century | Public domain |
| `simeon-bishop-jerusalem.jpg` | [Simon of Jerusalem (April 27) by O.Chirikov (Muz.it. relig)](https://commons.wikimedia.org/wiki/File:Simon_of_Jerusalem_(April_27)_by_O.Chirikov_(Muz.it._relig).jpg) | Osip Semenovich Chirikov; 19th century | Public domain |
| `simeon-god-receiver-anna.jpg` | [Saint Simeon (17th c., Russia, priv. coll)](https://commons.wikimedia.org/wiki/File:Saint_Simeon_(17th_c.,_Russia,_priv._coll).jpg) | Anonymous Russian icon painter (before 1917); Mid-17th century | Public domain |
| `simeon-stylites-junior.jpg` | [Kirillo-Belozersky iconostasis 21 - Simeon Jr](https://commons.wikimedia.org/wiki/File:Kirillo-Belozersky_iconostasis_21_-_Simeon_Jr.jpg) | Anonymous Russian icon painter (before 1917); 1497 | Public domain |
| `simon-zealot-apostle.jpg` | [Simon the Zealot - Apostle](https://commons.wikimedia.org/wiki/File:Simon_the_Zealot_-_Apostle.jpeg) | Unknown Russian Orthodox church icon painter from 1720; 1720, Russian empire. Submitted to wikimedia on 2011-10-01. | Public domain |
| `sisoes-great.jpg` | [Saint Sisoes facing the tomb of Alexander the Great (Byzantine museum)](https://commons.wikimedia.org/wiki/File:Saint_Sisoes_facing_the_tomb_of_Alexander_the_Great_(Byzantine_museum).jpg) | Anonymous icon painter; 17-18th century? | Public domain |
| `sophia-vera-nadezda-lyubov.jpg` | [Karp Zolotaryov Sophia Faith Hope Charity 1685](https://commons.wikimedia.org/wiki/File:Karp_Zolotaryov_Sophia_Faith_Hope_Charity_1685.jpg) | en:Karp Zolotaryov (fl. last quarter of the 17th century); 1685 | Public domain |
| `sophronius-jerusalem.jpg` | [Fresco Icon of Saint Sophronios of Jerusalem 2](https://commons.wikimedia.org/wiki/File:Fresco_Icon_of_Saint_Sophronios_of_Jerusalem_2.jpg) | Unknown author; 14th-15th Century | Public domain |
| `spyridon-trimythous.jpg` | [Saint Spyridon Icon from Gorno Statitsa 1720](https://commons.wikimedia.org/wiki/File:Saint_Spyridon_Icon_from_Gorno_Statitsa_1720.jpg) | Unknown author; 1720 | Public domain |
| `stephen-sabaite-hymnographer.jpg` | [Стефан Савваит. Чтец-3](https://commons.wikimedia.org/wiki/File:%D0%A1%D1%82%D0%B5%D1%84%D0%B0%D0%BD_%D0%A1%D0%B0%D0%B2%D0%B2%D0%B0%D0%B8%D1%82._%D0%A7%D1%82%D0%B5%D1%86-3.jpg) | Unknown author; 16th century | Public domain |
| `stephen-younger.jpg` | [Rila Mon. - Fresco mir. icon 008 Stephen the New](https://commons.wikimedia.org/wiki/File:Rila_Mon._-_Fresco_mir._icon_008_Stephen_the_New.jpg) | Димитър Христов и Зафир. 1843; 1843 | Public domain |
| `synaxis-archangel-gabriel.jpg` | [Archangel Gabriel Icon](https://commons.wikimedia.org/wiki/File:Archangel_Gabriel_Icon.tif) | Unknown author; between 1600 and 1700 | Public domain |
| `synaxis-bodiless-hosts.jpg` | [Kirill Ulanov. Synaxis of the Archangel Michael and the Other Bodiless Powers. 1704](https://commons.wikimedia.org/wiki/File:Kirill_Ulanov._Synaxis_of_the_Archangel_Michael_and_the_Other_Bodiless_Powers._1704.jpg) | Kirill Ulanov; 1704 | Public domain |
| `synaxis-forerunner-john.jpg` | [St John the Baptist, Angel of the Desert, 17the](https://commons.wikimedia.org/wiki/File:St_John_the_Baptist,_Angel_of_the_Desert,_17the.jpg) | Unknown author; 17th century | Public domain |
| `synaxis-seventy-apostles.jpg` | [70Apostles V-1](https://commons.wikimedia.org/wiki/File:70Apostles_V-1.jpg) | Ikonopisatelj; до XX века. | Public domain |
| `synaxis-theotokos-nativity.jpg` | [Synaxis of the Theotokos (Kirillo-Belozersk)](https://commons.wikimedia.org/wiki/File:Synaxis_of_the_Theotokos_(Kirillo-Belozersk).jpg) | AnonymousUnknown author; 15-16 c. | Public domain |
| `synaxis-twelve-apostles.jpg` | [Synaxis of the Twelve Apostles by Constantinople master (early 14th c., Pushkin museum)](https://commons.wikimedia.org/wiki/File:Synaxis_of_the_Twelve_Apostles_by_Constantinople_master_(early_14th_c.,_Pushkin_museum).jpg) | AnonymousUnknown author; 14th centurydate QS:P,+1350-00-00T00:00:00Z/7 | Public domain |
| `tarasius-patriarch-constantinople.jpg` | [Тарасий Константинопольский. Географ](https://commons.wikimedia.org/wiki/File:%D0%A2%D0%B0%D1%80%D0%B0%D1%81%D0%B8%D0%B9_%D0%9A%D0%BE%D0%BD%D1%81%D1%82%D0%B0%D0%BD%D1%82%D0%B8%D0%BD%D0%BE%D0%BF%D0%BE%D0%BB%D1%8C%D1%81%D0%BA%D0%B8%D0%B9._%D0%93%D0%B5%D0%BE%D0%B3%D1%80%D0%B0%D1%84.jpg) | Unknown authorUnknown author; circa 1350date QS:P,+1350-00-00T00:00:00Z/9,P1480,Q5727902 | Public domain |
| `tatiana-rome.jpg` | [Святая Татьяна](https://commons.wikimedia.org/wiki/File:%D0%A1%D0%B2%D1%8F%D1%82%D0%B0%D1%8F_%D0%A2%D0%B0%D1%82%D1%8C%D1%8F%D0%BD%D0%B0.jpg) | Anonymous; 18th century | Public domain |
| `ten-martyrs-crete.jpg` | [Ecole crétoise - Les dix martyrs de Crète - PPP4887 - Musée des Beaux-Arts de la ville de Paris](https://commons.wikimedia.org/wiki/File:Ecole_cr%C3%A9toise_-_Les_dix_martyrs_de_Cr%C3%A8te_-_PPP4887_-_Mus%C3%A9e_des_Beaux-Arts_de_la_ville_de_Paris.jpg) | School of Crete; between 1668 and 1800 | Public domain |
| `terence-neonilla-family.jpg` | [Neonilla](https://commons.wikimedia.org/wiki/File:Neonilla.jpg) | Тзортзи (Зорзис) Фука. Фреска. Афон (Дионисиат). 1547 г.; 1547 | Public domain |
| `thaddaeus-apostle.jpg` | [Icon of Apostle Jude Thaddeus, Saint John the Forerunner, Jerusalem](https://commons.wikimedia.org/wiki/File:Icon_of_Apostle_Jude_Thaddeus,_Saint_John_the_Forerunner,_Jerusalem.jpg) | Unknown author; 19th Century | Public domain |
| `theodore-stratelates.jpg` | [Theodore Stratelates (XVI century icon)](https://commons.wikimedia.org/wiki/File:Theodore_Stratelates_(XVI_century_icon).jpg) | AnonymousUnknown author; 16th centurydate QS:P,+1550-00-00T00:00:00Z/7 | Public domain |
| `theodore-stratilates-translation.jpg` | [Theodore Stratelates (XVI century icon)](https://commons.wikimedia.org/wiki/File:Theodore_Stratelates_(XVI_century_icon).jpg) | Anonymous; 16 th century | Public domain |
| `theodore-sykeote.jpg` | [St.Teodor Sikeot](https://commons.wikimedia.org/wiki/File:St.Teodor_Sikeot.jpg) | Unknown author; 3-я четверть XVII ст. | CC0 |
| `theodore-tyron.jpg` | [Theodore Tyron by O.Chirikov (1891, Abramov's icon museum)](https://commons.wikimedia.org/wiki/File:Theodore_Tyron_by_O.Chirikov_(1891,_Abramov%27s_icon_museum).jpg) | Osip Semenovich Chirikov; 19th century | Public domain |
| `theodosius-cenobiarch.jpg` | [Theodosius the Cenobiarch](https://commons.wikimedia.org/wiki/File:Theodosius_the_Cenobiarch.jpg) | AnonymousUnknown author; 18th century | Public domain |
| `theophany-epiphany.jpg` | [Baptism of Christ](https://commons.wikimedia.org/wiki/File:Baptism_of_Christ.jpg) | Unknown , Russian; circa 1730 | Public domain |
| `thirty-three-martyrs-melitene.jpg` | [33 Holy Martyrs of Melitene](https://commons.wikimedia.org/wiki/File:33_Holy_Martyrs_of_Melitene.jpg) | Unknown; 0985 | Public domain |
| `thomas-apostle-october.jpg` | [Saint Thomas K. Tzanes](https://commons.wikimedia.org/wiki/File:Saint_Thomas_K._Tzanes.png) | Konstantinos Tzanes; n.d. | Public domain |
| `three-hierarchs.jpg` | [Three Holy Hierarchs (Novgorod)](https://commons.wikimedia.org/wiki/File:Three_Holy_Hierarchs_(Novgorod).jpg) | Anonymous Russian icon painter (before 1917)Public domain image (according to PD-Russia-expired); Конец XV — начало XVI вв | Public domain |
| `thyrsus-leucius-philemon.jpg` | [Martyrdom of Saints Thyrsos, Leukios, and Kallinikos of Bithynia, Dionysiou](https://commons.wikimedia.org/wiki/File:Martyrdom_of_Saints_Thyrsos,_Leukios,_and_Kallinikos_of_Bithynia,_Dionysiou.jpg) | Tzortzis Phouka; 1547 | Public domain |
| `tikhon-zadonsk.jpg` | [St. Tikhon of Zadonsk (19th. c., Russia, priv. coll.)](https://commons.wikimedia.org/wiki/File:St._Tikhon_of_Zadonsk_(19th._c.,_Russia,_priv._coll.).jpg) | Anonymous; 19 c, | Public domain |
| `transfiguration-lord.jpg` | [Cretan Icon of the Transfiguration - Pantokratoros](https://commons.wikimedia.org/wiki/File:Cretan_Icon_of_the_Transfiguration_-_Pantokratoros.jpg) | Unknown author; 16th-17th Century | Public domain |
| `translation-chrysostom.jpg` | [Novgorod School - John Chrysostom - NG.M.01522 - National Museum of Art, Architecture and Design](https://commons.wikimedia.org/wiki/File:Novgorod_School_-_John_Chrysostom_-_NG.M.01522_-_National_Museum_of_Art,_Architecture_and_Design.jpg) | School of Novgorod school; 1400s | Public domain |
| `tryphon-martyr.jpg` | [Святой Трифон](https://commons.wikimedia.org/wiki/File:%D0%A1%D0%B2%D1%8F%D1%82%D0%BE%D0%B9_%D0%A2%D1%80%D0%B8%D1%84%D0%BE%D0%BD.jpg) | anonimus; 19th century | Public domain |
| `twenty-thousand-martyrs-nicomedia.jpg` | [20,000 martyrs of Nicomedia (Menologion of Basil II)](https://commons.wikimedia.org/wiki/File:20,000_martyrs_of_Nicomedia_(Menologion_of_Basil_II).jpg) | Unknown; 0985 | Public domain |
| `vladimir-equal-apostles.jpg` | [Icon of saint Vladimir (c. 1900, Russia, priv. coll.)](https://commons.wikimedia.org/wiki/File:Icon_of_saint_Vladimir_(c._1900,_Russia,_priv._coll.).jpg) | Anonymous; 19 c, | Public domain |
| `xenia-rome.jpg` | [Xenia of Rome](https://commons.wikimedia.org/wiki/File:Xenia_of_Rome.jpg) | Anonymous; 1551 | Public domain |
