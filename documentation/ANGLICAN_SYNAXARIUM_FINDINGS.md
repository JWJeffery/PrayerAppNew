# Anglican Synaxarium (Drive project) -- examined 2026-10-02

Read-only examination; nothing from Drive was copied into the repo and no governing document was altered.

## What is in Drive (folder `1MKGp9HIUS_y3y5LnSvcG3dlqjRvn1RAu`, owner josh@jwjeffery.org)
- **Editorial Rules** and **Production Workflow** (Google Docs): the governing rules for writing entries. Key points for the app: Anglican reception first (LFF 2024 controls where it speaks); original prose only; every entry = header, "Today the Church commemorates/celebrates...", past-tense narrative, closing, prayer (received proper or newly composed collect); apparatus kept outside the devotional text; British spelling and Title Case decided, header date format still open.
- **`synaxarium-decisions-2026-09-07-cleaned.json`** (600 KB): this is the **export of the `synaxarium-review/` tool** (`source: "An Anglican Synaxarium — Kalendar Review"`, `format_version 2`). **All 366 civil dates are decided** (319 `concur_rank1`, 47 `select_alternate`; 6 reviewer comments), made 2026-08-25, 08-26 and 09-07. Each record holds the chosen candidate, its SIN (`UO-SIN-nnnnnn`, 366 distinct), designation, period, tradition, source witnesses (BCP/LFF/HWHM/GCW/FAS/SEC/AM/ODS), source tier, review flags and harmonization notes. **This corrects the resume note, which said zero rows had been reviewed.** The tool's own `decision_status` field still reads "Pending" in all 366 (it was never updated by the export).
- **November 2026 Production Tracker** (Sheet): 30 entries, 12 approved; open decisions: header date format, calibration prototypes.
- **Completed Hagiographies** (folder): 12 approved entries (All Saints, All Souls, Hooker, Tyler and companions, Zechariah and Elizabeth, Temple, Willibrord, Ammonius, Rolle/Hilton/Kempe, Leo the Great, Martin of Tours, Charles Simeon) plus Brigid; each ~2-4 KB, ~650 words, ending with a collect. **Review Drafts** (Nov 13-15): Cabrini, Seabury's consecration, Herman of Alaska.
- Reference PDFs (LFF 2024, HWHM, GCW, BCP, etc.), `sec-master-calendar-2025-2026.csv`, `instructions.txt` (assistant persona instructions for Josh's separate writing project; not used by this app).

## How the decisions compare with the app's Anglican calendar (`data/saints/sanctoral.json`, ANG-tagged)
Matching by distinctive name tokens on the decided date (approximate):
- **211 of 366 dates agree** with what the app already shows (203 concur-rank-1, 8 alternates).
- **62 dates differ**: the app shows a different saint on that date than the decision (41 where Josh concurred with rank 1).
- **93 dates have no ANG entry at all** in the app (75 concur-rank-1); most are TEC/LFF figures the app never carried (e.g. William Passavant, Manche Masemola, Frances Perkins, Edward King).
- Of the 155 non-matching dates, the chosen saint exists elsewhere in the app for ~114 (other tradition tag or date); 67 carry an LFF witness.
- 77 ANG entries in the app are not the decided saint on their date.
Examples of differing dates: 01-02 (decision: Basil and Gregory of Nazianzus; app: Azariah), 01-11 (Theodosius the Cenobiarch vs Mary Slessor), 01-14 (Macrina the Elder vs Charles Gore), 03-14 (Matilda of Ringelheim vs Benedict).

## What "make it the controlling TEC commemoration calendar" would involve (proposal, not started)
1. Add a trimmed `data/kalendar/synaxarium/decisions.json` (date, name, SIN, designation, tradition, tier, decision type, harmonization flags) from the Drive export -- **needs Josh's go-ahead to copy it into the repo**.
2. Join to `sanctoral.json` through the existing SIN tables (`data/kalendar/sin/`, 366 rank-1 + 828 alternates; `synaxarium-review/data/kalendar-data.json` already carries the join) and create ANG entries for the ~93 missing saints.
3. For ANG mode, resolve the saint of the day from the decisions file (one per civil date) instead of the current multi-entry filter; keep the old rows for the other traditions.
4. Attach Josh's approved hagiographies (original prose; 12 exist, ~30 expected for November) as the expandable saint card; show them only once marked approved.
5. Reconcile the 62 conflicts and 69 harmonization notes (alternate dates) -- editorial calls for Josh.
Open questions for Josh: does "controlling" mean one saint per civil date (as the file encodes) or the primary plus alternates? Where do the 62 conflicting existing ANG rows go (drop, or keep as optional commemorations)? May the decisions export and the approved hagiographies be committed to the (public) repo?

## Applied 2026-10-02 (Josh: primary plus alternates; drop conflicting rows unless a credible ecclesial source proves them)
- `data/kalendar/synaxarium/decisions.json` is the exported decision file (primary + remaining ranked candidates as alternates, per civil date; no hagiographies). `scripts/saints/apply-synaxarium-decisions.py` applied it to `data/saints/sanctoral.json`:
  - all 366 primaries now exist as ANG rows with `angRole: primary` and the Synaxarium SIN (239 matched existing rows, of which some gained the ANG tag; 127 new rows created from the decision's designation/period/witnesses).
  - 27 existing ANG rows that conflicted were KEPT as `angRole: alternate` because the printed calendar of Lesser Feasts and Fasts 2024, Holy Women Holy Men or A Great Cloud of Witnesses prints them on that day (`angAlternateProof`).
  - 24 conflicting rows had only the ANG tag removed (they keep their Orthodox/Latin/Oriental tags); 25 rows that existed only as unproved Anglican entries were deleted.
- UI (`office-ui.js`): the Anglican saint panel shows the primary first, then other commemorations, then alternates (labelled), then a collapsed list of the decision file's other proposed commemorations.
- Proof test: the printed calendars were extracted with `pdftotext` and parsed (`parse-printed-calendars.py`, 366/366 days each). A row survives only when its distinctive name words appear in that day's printed entry; "(alternative date for ...)" notes are ignored. Holy Cross Day was matched by hand to Exaltation of the Holy Cross.
- 09-14: Josh's decision is Albert of Jerusalem and Holy Cross Day shows as an alternate. **Confirmed intentional by Josh, 2026-10-02.** Other LFF-printed saints (e.g. 05-06, 12-29) likewise stay as alternates.

### Kept as alternates (printed source)
- 01-02 vedanayagam-samuel-azariah
- 01-14 charles-gore
- 01-19 wulfstan-of-worcester
- 01-29 andrei-rublev
- 01-31 saint-john-bosco
- 03-04 paul-cuffee
- 03-06 william-mayo-charles-menninger-and-their-sons
- 03-30 saint-innocent-of-alaska
- 03-30 saint-mary-of-egypt
- 04-24 genocide-remembrance
- 05-06 saint-george-of-lydda
- 05-09 gregory-of-nazianzus
- 05-30 saint-joan-of-arc
- 07-14 samson-occom
- 08-13 jeremy-taylor
- 08-14 jonathan-daniels
- 08-30 charles-grafton
- 09-05 gregorio-aglipay
- 09-11 harry-thacker-burleigh
- 09-14 exaltation-of-the-holy-cross
- 10-03 george-bell
- 10-06 william-tyndale
- 11-22 saint-cecilia
- 11-26 isaac-watts
- 12-22 henry-budd
- 12-29 saint-thomas-becket
- 12-31 samuel-ajayi-crowther

### Dropped (no printed LFF 2024 / HWHM / GCW placement on that day)
- 01-08 saint-george-the-chozebite (ANG tag removed)
- 01-15 saint-paul-the-first-hermit (ANG tag removed)
- 02-22 chair-of-saint-peter (ANG tag removed)
- 03-14 venerable-benedict-of-nursia (ANG tag removed)
- 05-12 saints-nereus-and-achilleus (ANG tag removed)
- 05-18 saint-felix-of-cantalice (ANG tag removed)
- 05-28 blessed-lanfranc-of-canterbury (ANG tag removed)
- 06-03 saint-charles-lwanga-and-companions (ANG tag removed)
- 06-08 saint-william-of-york (ANG tag removed)
- 06-09 saint-ephrem-the-syrian (ANG tag removed)
- 06-19 saint-jude-thaddeus (ANG tag removed)
- 06-25 virgin-martyr-febronia-of-nisibis (ANG tag removed)
- 06-26 saint-david-of-thessaloniki (ANG tag removed)
- 07-04 saint-andrew-of-crete (ANG tag removed)
- 07-23 saint-bridget-of-sweden (ANG tag removed)
- 08-16 saint-stephen-of-hungary (ANG tag removed)
- 10-27 saint-frumentius (ANG tag removed)
- 11-08 synaxis-of-the-archangel-michael-and-all-angels (ANG tag removed)
- 11-14 saint-philip-the-apostle (ANG tag removed)
- 11-17 saint-elizabeth-of-hungary (ANG tag removed)
- 11-21 presentation-of-the-blessed-virgin-mary (ANG tag removed)
- 12-08 feast-immaculate-conception (ANG tag removed)
- 12-17 prophet-daniel-and-the-three-holy-youths (ANG tag removed)
- 12-23 saint-john-of-kanty (ANG tag removed)
- 01-11 mary-slessor (deleted)
- 01-12 benedict-biscop (deleted)
- 01-13 george-fox (deleted)
- 01-13 kentigern-mungo (deleted)
- 03-25 john-roberts (deleted)
- 05-24 saint-david-of-scotland (deleted)
- 06-04 petroc (deleted)
- 07-06 thomas-more (deleted)
- 07-10 saint-benedict-of-nursia-eve (deleted)
- 07-13 saint-silas (deleted)
- 07-15 swithun-of-winchester (deleted)
- 08-05 oswald-of-northumbria (deleted)
- 08-09 mary-sumner (deleted)
- 08-19 saint-bernard-of-clairvaux-eve (deleted)
- 08-23 saint-bartholomew-eve (deleted)
- 10-10 paulinus (deleted)
- 10-21 ursula-and-companions (deleted)
- 10-25 crispin-and-crispinian (deleted)
- 11-04 saints-of-the-old-testament (deleted)
- 11-08 saints-and-martyrs-of-the-anglican-communion (deleted)
- 11-20 priscilla-lydia-sellon (deleted)
- 12-13 samuel-johnson (deleted)
- 12-17 eglantyne-jebb (deleted)
- 10-27 thomas-traherne (deleted)
- 12-30 josephine-butler (deleted)

## Follow-up 2026-10-02 (items from Josh's go-ahead)
- **Saint cards:** each Anglican primary now shows the decision file's tradition and source witnesses under the description (no SIN is shown to readers; the SIN is stored as `synaxariumSin`). Five newly created rows (Elizabeth of Hungary, Euphrosyne/Smaragdus, Frances Xavier Cabrini, John XXIII, Thomas the Apostle) carry `crossRef` to the same person's existing row in another tradition; the other 122 new rows have no same-person row elsewhere in the app (a looser match produced false pairs such as Celestine I/V, Marina the Monk/Marina, Edward King/Edward the Confessor, and was rejected).
- **Harmonization notes (71 date-conflict notes on the decided saints) checked against the printed LFF 2024 / HWHM / GCW calendars:** for 62 the decided date is printed in at least one of them. For 9 it is not -- they rest on AM/SEC/FAS/Oxford witnesses only. For Josh's information (no change made):
  - 01-02 Basil the Great and Gregory of Nazianzus: printed calendars place it at 05-09 (LFF/HWHM/GCW), 06-14 (LFF/HWHM/GCW).
  - 01-19 Macarius the Great: printed calendars place it at no other listed date.
  - 02-18 Colman of Lindisfarne: printed calendars place it at no other listed date.
  - 04-26 Albert Ernest Laurie: printed calendars place it at no other listed date.
  - 05-30 Josephine Butler: printed calendars place it at no other listed date.
  - 06-25 Moluag of Lismore: printed calendars place it at no other listed date.
  - 07-16 Osmund of Salisbury: printed calendars place it at no other listed date.
  - 09-14 Albert of Jerusalem: printed calendars place it at no other listed date.
  - 12-18 Charles Wesley: printed calendars place it at 03-03 (LFF/HWHM/GCW).
