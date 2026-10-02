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
