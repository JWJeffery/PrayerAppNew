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

## Icons of the feast / saint of the day (added 2026-10-01)

Shown in the "About Today's Service" panel (`js/day-guide.js`) for rank 1–2 commemorations and the moveable feasts of Palm Sunday, Pascha, Ascension and Pentecost. Data: `data/icons/commemoration-icons.json`. Every file was confirmed **Public domain** against its Wikimedia Commons metadata on 2026-10-01 and is stored locally at 500 px (or the original width where smaller) in `images/icons/`. Not yet found: Protomartyr Stephen (12-27) and the Third Finding of the Head of John the Baptist (05-25).

| File | Commons title | Artist / date |
|---|---|---|
| `annunciation-theotokos.jpg` | [Byzantine icon of the Annunciation (14th c., Pushkin museum)](https://commons.wikimedia.org/wiki/File:Byzantine_icon_of_the_Annunciation_(14th_c.,_Pushkin_museum).jpg) | Unknown author; 14th century |
| `anthony-great.jpg` | [Anthony the Great icon (lebanon)](https://commons.wikimedia.org/wiki/File:Anthony_the_Great_icon_(lebanon).jpg) | Unknown author; 18th century |
| `apostle-andrew-first-called.jpg` | [Saint Andrew (Tzanes)](https://commons.wikimedia.org/wiki/File:Saint_Andrew_(Tzanes).png) | Emmanuel Tzanes; 1658 |
| `apostle-evangelist-matthew.jpg` | [Matthew the Evangelist - icon](https://commons.wikimedia.org/wiki/File:Matthew_the_Evangelist_-_icon.jpeg) | Unknown Russian icon painter, middle of 19 th cen.; Middle of 19th century. Submitted to wikimedia on 2008-05-01 |
| `apostle-philip.jpg` | [Philip the Apostle icon](https://commons.wikimedia.org/wiki/File:Philip_the_Apostle_icon.jpeg) | Unknown Russian Orthodox icon painter; First half of the 19th century. Posted to wikimedia on 2011-10-01. |
| `ascension.jpg` | [Ascension of Jesus icon, Lattakia (1667)](https://commons.wikimedia.org/wiki/File:Ascension_of_Jesus_icon,_Lattakia_(1667).jpg) | Unknown author; before 1667 |
| `athanasius-cyril-alexandria.jpg` | [Saint-Athanasius-of-Alexandria-icon-Sozopol-Bulgaria-17century](https://commons.wikimedia.org/wiki/File:Saint-Athanasius-of-Alexandria-icon-Sozopol-Bulgaria-17century.jpg) | Unknown author; End of 17 century |
| `basil-great-circumcision.jpg` | [Novgorod School - Saint Basil the Great - NG.M.01523 - National Museum of Art, Architecture and Design](https://commons.wikimedia.org/wiki/File:Novgorod_School_-_Saint_Basil_the_Great_-_NG.M.01523_-_National_Museum_of_Art,_Architecture_and_Design.jpg) | School of Novgorod school; 1400s |
| `beheading-john-baptist.jpg` | [Beheading of John the Baptist (Damaskinos)](https://commons.wikimedia.org/wiki/File:Beheading_of_John_the_Baptist_(Damaskinos).png) | Michael Damaskinos; 1590 |
| `constantine-helen-equal-apostles.jpg` | [Constantine and Helen](https://commons.wikimedia.org/wiki/File:Constantine_and_Helen.png) | Emmanuel Tzanes; 1669 |
| `demetrios-thessalonica.jpg` | [Saint Demetrius of Protat](https://commons.wikimedia.org/wiki/File:Saint_Demetrius_of_Protat.JPG) | Manuel Panselinos; between 1290 and 1310 |
| `dormition-theotokos.jpg` | [Dormition of the Theotokos, Novgorod](https://commons.wikimedia.org/wiki/File:Dormition_of_the_Theotokos,_Novgorod.jpg) | Unknown author; turn of the 14/15th century |
| `elijah-prophet.jpg` | [Semen Spiridonov Kholmogorets. Prophet Elijah. 1678](https://commons.wikimedia.org/wiki/File:Semen_Spiridonov_Kholmogorets._Prophet_Elijah._1678.jpg) | Semyon Spiridonov; 28 November 1678 |
| `entrance-theotokos.jpg` | [Russian - Presentation of the Virgin in the Temple - Walters 372410](https://commons.wikimedia.org/wiki/File:Russian_-_Presentation_of_the_Virgin_in_the_Temple_-_Walters_372410.jpg) | Anonymous (Russian artist)Unknown author; 18th century |
| `ephrem-syrian.jpg` | [Преподобный Ефрем Сирин](https://commons.wikimedia.org/wiki/File:%D0%9F%D1%80%D0%B5%D0%BF%D0%BE%D0%B4%D0%BE%D0%B1%D0%BD%D1%8B%D0%B9_%D0%95%D1%84%D1%80%D0%B5%D0%BC_%D0%A1%D0%B8%D1%80%D0%B8%D0%BD.jpg) | Manuel Panselinos / Мануил Панселин; early 14th c. ; Начало XIV в |
| `euthymius-great.jpg` | [Euthymius the Great (Tzanes)](https://commons.wikimedia.org/wiki/File:Euthymius_the_Great_(Tzanes).png) | Emmanuel Tzanes; 1682 |
| `exaltation-holy-cross.jpg` | [Unknown painter - Exaltation of the Cross - WGA23497](https://commons.wikimedia.org/wiki/File:Unknown_painter_-_Exaltation_of_the_Cross_-_WGA23497.jpg) | Unknown Icon Painter, Russian (late 15th century in northern Russia); 1490s |
| `first-second-finding-head-john-baptist.jpg` | [Findings of John the Baptist's head BETTER](https://commons.wikimedia.org/wiki/File:Findings_of_John_the_Baptist%27s_head_BETTER.jpg) | Unknown author; 14th century |
| `george-great-martyr.jpg` | [Orthodox Bulgarian icon of St. George fighting the dragon](https://commons.wikimedia.org/wiki/File:Orthodox_Bulgarian_icon_of_St._George_fighting_the_dragon.jpg) | Unknown author; 1621 |
| `gregory-theologian.jpg` | [Agios Gregorios Theologos Peribleptos](https://commons.wikimedia.org/wiki/File:Agios_Gregorios_Theologos_Peribleptos.jpg) | Painters Michael and Eutychios; 14th century AD |
| `john-chrysostom.jpg` | [Novgorod School - John Chrysostom - NG.M.01522 - National Museum of Art, Architecture and Design](https://commons.wikimedia.org/wiki/File:Novgorod_School_-_John_Chrysostom_-_NG.M.01522_-_National_Museum_of_Art,_Architecture_and_Design.jpg) | School of Novgorod school; 1400s |
| `john-theologian-apostle.jpg` | [Holy Apostle and Evangelist John the Theologian. Icon. Greece, 1500. Monastery of St. John the Theologian on the island of Patmos](https://commons.wikimedia.org/wiki/File:Holy_Apostle_and_Evangelist_John_the_Theologian._Icon._Greece,_1500._Monastery_of_St._John_the_Theologian_on_the_island_of_Patmos.jpg) | Unknown author; 1500 |
| `john-theologian-repose.jpg` | [The Death of the Holy Apostle and Evangelist John the Theologian. Icon. Crete, circa 1500 (before 1507)](https://commons.wikimedia.org/wiki/File:The_Death_of_the_Holy_Apostle_and_Evangelist_John_the_Theologian._Icon._Crete,_circa_1500_(before_1507).jpg) | Unknown author; 1500 |
| `luke-evangelist.jpg` | [Saint Luke the Evangelist - icon](https://commons.wikimedia.org/wiki/File:Saint_Luke_the_Evangelist_-_icon.jpeg) | Unknown Russian Orthodox painter; 18th century. Posted to wikimedia on 2011-10-01 |
| `mark-evangelist.jpg` | [Evangelist Mark Icon](https://commons.wikimedia.org/wiki/File:Evangelist_Mark_Icon.tif) | Unknown author; between 1700 and 1800 |
| `nativity-christ.jpg` | [Nativity of christ](https://commons.wikimedia.org/wiki/File:Nativity_of_christ.jpg) | Unknown author; 15th century |
| `nativity-john-baptist.jpg` | [0176Hb. Nativity of St. John the Baptist, late 18th - early 19th century](https://commons.wikimedia.org/wiki/File:0176Hb._Nativity_of_St._John_the_Baptist,_late_18th_-_early_19th_century.jpg) | Unknown author; конец XVIII - начало XIX |
| `nativity-theotokos.jpg` | [Nikola-Obrazopisov-Belyova-church-Nativity-of-the-Theotokos-icon-1863](https://commons.wikimedia.org/wiki/File:Nikola-Obrazopisov-Belyova-church-Nativity-of-the-Theotokos-icon-1863.jpg) | Nikola Obrazopisov; 1863 |
| `nicholas-myra.jpg` | [St Nicholas Icon Sinai 13th century](https://commons.wikimedia.org/wiki/File:St_Nicholas_Icon_Sinai_13th_century.jpg) | Unknown author; 2008-04 |
| `palm-sunday.jpg` | [Russian School - Icon with Entry into Jerusalem - FA001223 - Brighton Museum ^ Art Gallery](https://commons.wikimedia.org/wiki/File:Russian_School_-_Icon_with_Entry_into_Jerusalem_-_FA001223_-_Brighton_Museum_%5E_Art_Gallery.jpg) | anonymous; 18th century |
| `pascha.jpg` | [Russian School - Icon with the Resurrection and the Anastasis (Descent into Hell) - FA001215 - Brighton Museum ^ Art Gallery](https://commons.wikimedia.org/wiki/File:Russian_School_-_Icon_with_the_Resurrection_and_the_Anastasis_(Descent_into_Hell)_-_FA001215_-_Brighton_Museum_%5E_Art_Gallery.jpg) | anonymous; 19th century |
| `pentecost.jpg` | [Descent of the Holy Spirit upon the Apostles (Joseph Vladimirov, 2)](https://commons.wikimedia.org/wiki/File:Descent_of_the_Holy_Spirit_upon_the_Apostles_(Joseph_Vladimirov,_2).jpg) | Joseph Vladimirov / Иосиф Владимиров; 1666 |
| `peter-paul-apostles.jpg` | [Peter and Paul the Apostle icon, Aleppo 1667](https://commons.wikimedia.org/wiki/File:Peter_and_Paul_the_Apostle_icon,_Aleppo_1667.jpg) | Unknown author; before 1667 |
| `presentation-lord.jpg` | [Sretenie (Russian museum, 15 c)](https://commons.wikimedia.org/wiki/File:Sretenie_(Russian_museum,_15_c).jpg) | Мастерская Андрея Рублева Школа или худ. центр: Москва; 1408 |
| `protection-theotokos.jpg` | [Protection de la Mere de Dieu Ecole de Novgorod Moscou, Galerie Tretiakov](https://commons.wikimedia.org/wiki/File:Protection_de_la_Mere_de_Dieu_Ecole_de_Novgorod_Moscou,_Galerie_Tretiakov.jpg) | AnonymousUnknown author; between 1401 and 1425 |
| `sabas-sanctified.jpg` | [The Dormition of Sabbas the Sanctified](https://commons.wikimedia.org/wiki/File:The_Dormition_of_Sabbas_the_Sanctified.png) | Philotheos Skoufos; circa 1656 |
| `seraphim-sarov.jpg` | [Seraphim of Sarov (after 1903, priv.coll)](https://commons.wikimedia.org/wiki/File:Seraphim_of_Sarov_(after_1903,_priv.coll).jpg) | Anonymous Russian icon painter (before 1917)Public domain image (according to PD-Russia-expired); after 1903 |
| `spyridon-trimythous.jpg` | [Saint Spyridon Icon from Gorno Statitsa 1720](https://commons.wikimedia.org/wiki/File:Saint_Spyridon_Icon_from_Gorno_Statitsa_1720.jpg) | Unknown author; 1720 |
| `synaxis-bodiless-hosts.jpg` | [Kirill Ulanov. Synaxis of the Archangel Michael and the Other Bodiless Powers. 1704](https://commons.wikimedia.org/wiki/File:Kirill_Ulanov._Synaxis_of_the_Archangel_Michael_and_the_Other_Bodiless_Powers._1704.jpg) | Kirill Ulanov; 1704 |
| `synaxis-forerunner-john.jpg` | [St John the Baptist, Angel of the Desert, 17the](https://commons.wikimedia.org/wiki/File:St_John_the_Baptist,_Angel_of_the_Desert,_17the.jpg) | Unknown author; 17th century |
| `synaxis-theotokos-nativity.jpg` | [Synaxis of the Theotokos (Kirillo-Belozersk)](https://commons.wikimedia.org/wiki/File:Synaxis_of_the_Theotokos_(Kirillo-Belozersk).jpg) | AnonymousUnknown author; 15-16 c. |
| `theodosius-cenobiarch.jpg` | [Theodosius the Cenobiarch](https://commons.wikimedia.org/wiki/File:Theodosius_the_Cenobiarch.jpg) | AnonymousUnknown author; 18th century |
| `theophany-epiphany.jpg` | [Baptism of Christ](https://commons.wikimedia.org/wiki/File:Baptism_of_Christ.jpg) | Unknown , Russian; circa 1730 |
| `three-hierarchs.jpg` | [Three Holy Hierarchs (Novgorod)](https://commons.wikimedia.org/wiki/File:Three_Holy_Hierarchs_(Novgorod).jpg) | Anonymous Russian icon painter (before 1917)Public domain image (according to PD-Russia-expired); Конец XV — начало XVI вв |
| `transfiguration-lord.jpg` | [Cretan Icon of the Transfiguration - Pantokratoros](https://commons.wikimedia.org/wiki/File:Cretan_Icon_of_the_Transfiguration_-_Pantokratoros.jpg) | Unknown author; 16th-17th Century |
| `translation-chrysostom.jpg` | [Novgorod School - John Chrysostom - NG.M.01522 - National Museum of Art, Architecture and Design](https://commons.wikimedia.org/wiki/File:Novgorod_School_-_John_Chrysostom_-_NG.M.01522_-_National_Museum_of_Art,_Architecture_and_Design.jpg) | School of Novgorod school; 1400s |
