# Anglican saint lives (started 2026-10-04)

The saint panel (Anglican Daily Office) shows each day's primary saint with a short life, so a person praying
learns about the saint rather than about catalogue records.

- **Data:** `data/saints/anglican-lives.json`, keyed by the saint's `sin` identifier in
  `data/kalendar/synaxarium/decisions.json` (`decisions[MM-DD].primary.sin`). Each entry: `name`, `life`
  (70-110 words, original prose), `period`, `place`, `confidence` (high/medium/low), `sources` (pages read).
- **Display:** `_angPrimaryLife()` in `js/office-ui.js`; when a life exists it replaces the one-line description
  (name, then designation and period, then the life).
- **Scope:** 347 of the 366 days have a person or group as the primary commemoration; the 19 feasts and
  commemorations (Christmas, Epiphany, All Saints, ...) are not saints and get no life here. The additional
  saints of each day (769 in the decisions file, listed as "Also commemorated today") come second.
- **Method:** one research agent per month reads each saint up on the web (Wikipedia, Britannica, Catholic
  Encyclopedia, Dictionary of Christian Biography, Project Canterbury, OCA), writes fresh prose, and lists the
  pages it read. Nothing is copied; Lesser Feasts and Fasts, Holy Women Holy Men, A Great Cloud of Witnesses and
  the Oxford Dictionary of Saints are not used. Entries with `confidence` medium or low deserve a human look.
- **Not covered:** the Roman Breviary's own saints' lessons (they are in the office text).

## Status (2026-10-04)
All 347 primary saints and groups are written and in the file. August 22 was changed by Josh to Philip Benizi (Alicia "Cristina" Rivera, OSH was
made an additional commemoration: the only source, the Great Cloud of Witnesses appendix, lists her by name with no biography). Confidence: 250 high, 79 medium, 18 low (legendary or
thinly documented saints; the text says "according to tradition" where it applies). Still to do: the additional
saints of each day (769), the 19 feast days, and a human read-through of the medium and low entries.
Re-run `python3 scripts/merge-anglican-saint-lives.py` after adding month files to the scratch folder to re-check
and merge.

Also 2026-10-04: the boilerplate sentence "Commemorated in the Anglican calendar of An Anglican Synaxarium (decision of ...)" was removed from 126 saint descriptions in data/saints/sanctoral.json (the provenance stays in `angDecisionSource`), because the panel showed it to readers.

## Update 2026-10-05: additional saints
Lives for the additional saints of each day are written and merged (1,007 lives in all: 347 principal saints and groups plus
the additional ones; confidence 677 high, 280 medium, 50 low). The "Also commemorated today" list opens each saint to
their life. Not written, on purpose: the 17 Marian and Lord's-feast observances (Our Lady of Lourdes, Holy Cross Day,
dedications and the like) and two devotional themes ("Interior Life of Our Saviour/Lady"); and, for lack of any
biographical source, Benedictine Martyrs of the Tyburn tradition, Gundelina of Niedermunster, Armogastes and Companions,
Benjamin Tankersley, Tertullian of Bologna, Charles Raymond Barnes, Dora P. Chaplin, Finnbar of Caithness and Alicia
"Cristina" Rivera, OSH (these show as a plain line). Caveats from the writing agents: several ran out of web-search budget
and used background knowledge for a few details (they listed which); Wikipedia is one of the two sources for many
entries; Britannica could not be fetched. The medium and low entries (330) need a human read-through, and a second pass
could confirm the entries whose second source was thin.

## Update 2026-10-05 (later): the skipped saints retried
Retried with the repository's reference books (Book of Saints, Oxford Dictionary of Saints, Anglican Martyrology, Great Cloud of Witnesses)
as fact sources. Written: Gundelina of Niedermunster, Armogastes and Companions, Charles Raymond Barnes, Dora P. Chaplin, and
Finnbar of Caithness (low confidence; the entry blends several Finbars, and the life says so). Still without a life, because nothing
biographical could be found: Benedictine Martyrs of the Tyburn tradition (the entry is too vague to identify), Benjamin Tankersley,
Tertullian of Bologna (only "eighth bishop of Bologna, died about 490"), and Alicia "Cristina" Rivera, OSH. These show as a plain line.


## Curator-approved corrections, 2026-10-05

The Benedictine Martyrs of the Tyburn tradition (March 14, UO-SIN-000911) and Benjamin Tankersley (March 31, UO-SIN-000938) were withdrawn by the curator after a direct source audit found the Anglican Martyrology attributions unsupported. Both have been removed from active `decisions[MM-DD].alternates`; their original records and withdrawal reasons remain under `withdrawn_alternates`. Their identifiers remain reserved.

Tertullian of Bologna (UO-SIN-000988) was retained as an additional commemoration on the historical April 27 date. A three-sentence life is now in `data/saints/anglican-lives.json`, drawn from the Bologna diocesan episcopal and saints lists and the Italian Episcopal Conference's Sacerno church inventory. The eighth-bishop and established-death-year claims are withdrawn. Bologna lists him fifteenth with dates uncertain. The Book of Saints, PDF p.719, records the historical date and deletion from the revised Roman Martyrology; Bologna's present local collective observance is September 28. The former April 18 local date remains documented.

These corrections verify the named entries only. They do not establish that the other source attributions or lives have passed a full source audit.

## Catalogue questions found while writing the lives (2026-10-05; for the Synaxarium crew's source audit)
These come from the writing agents' own reports. I have not independently checked them, and they are leads for the audit, not findings.
**Name or identity questions (corrected 2026-10-05 after the Synaxarium crew's source check against the Anglican Martyrology (AM) pages):**
- Caradoc of Llancarfan (04-13, UO-SIN-000962): confirmed mismatch. The entry describes the hermit who died in 1124 (AM p.44, Oxford Dictionary of Saints p.193), not the Llancarfan writer; the life was written about the hermit and says so.
- Macarius of Antioch (UO-SIN-000955): the only biography found was for Macharius of Ghent. The crew notes these are received designations of the same saint in Ghent's diocesan account, so "a different man" was premature; the biography itself still needs examination.
- Maximilian (08-26): not an error. AM p.103 explicitly commemorates the Numidian conscientious objector (Maximilian of Tebessa) on 26 August; 12 March elsewhere does not invalidate that witness.
- Finnbar of Caithness (09-25): AM p.116 lists him separately from Fin Barre of Cork, so the date has a witness. The uncertain identity and the blended biography (possible confusion with Finnian of Movilla) still need review.
- Elizabeth of the Trinity: the AM itself prints 1916 (a faithfully copied source error); the Vatican canonization biography gives 1906, which the life uses.
- Also reported, unchecked: Boniface of Ross (UO-SIN-000686) is really Curetan, bishop of Rosemarkie; Adrian of May's massacre may be a conflation with Ethernan; Bruno of Cologne (UO-SIN-000426) is Bruno the Great (d. 965), not the Carthusian; Chaeremon and Companions: Chaeremon fled and was never found.
- Placeholder or source-form names in the catalogue, read by the agents as the standard saints, which still need canonical identification and date harmonization: "Ambrose source/date variant", "Irenaeus SEC transfer row", "Peter / Paul individual source form", "Columba source variants", "Ephrem source-date preparation", "Older BCP/HWHM form" (Latimer and Ridley), "Athanasius source octave/date context", "Pantaleon" (the Wikipedia page of that title is a Bactrian king).
**Dates that differ from the sources:** Janani Luwum (died 16 Feb 1977, catalogue 17 Feb), Ethelfleda (catalogue c. 970, sources c. 1016), Baldred (608 vs c. 757), Elizabeth of the Trinity (1916 vs 1906), Hiram Kano (1986 vs 1988), Wright (1904 vs 1906), Adalbert of Egmond (740 vs c. 705), Joseph of Cupertino (1603 is his birth; died 1663), Quodvultdeus (439 is the exile; c. 450), Bertin (c. 698 vs c. 709), Barnes (birth 1892 vs 1894).
**Too little to identify or write from:** Alicia "Cristina" Rivera, OSH (the Great Cloud of Witnesses appendix lists her by name only).
**Ranking note:** many principal and additional entries are legendary or thinly attested (the lives say "according to tradition"); confidence is recorded per entry in `data/saints/anglican-lives.json`.

## Rivera withdrawn (2026-10-05)
Alicia "Cristina" Rivera, OSH was withdrawn by the curator (Josh): her `decisions` record moved to `withdrawn_alternates` on 08-22
(identifier UO-SIN-000053 reserved) and her `sanctoral.json` row removed. Philip Benizi remains the principal for August 22.

Counts: 1,013 lives written; 335 rated medium or low, 678 high. A high rating records only that the writing agent found consistent sources; it is not a source verification of the catalogue identity or date. The audit must cover every catalogue identity and assigned date.

## Crew review applied to the lives (2026-10-05)
The Synaxarium crew's individual review of the 96 flagged principal lives (register: ANGLICAN_SAINT_LIVES_REVIEW_2026-10-05.xlsx) was applied to the **life texts** of 40 entries (every
entry whose finding was not "Supported with limits", except Baldred). Each revised entry in `data/saints/anglican-lives.json` now has a `review` block (register row, finding,
what changed, what it was checked in). Unverified particulars the review named were removed, not kept; some lives are shorter. Confidence was re-set from what could be checked.
**Not applied:** (1) Baldred (UO-SIN-000676, 03-06): the curator must choose which Baldred is meant before the catalogue and life can agree; the life is unchanged and still uncertified.
(2) Catalogue corrections, which belong to the crew's data: David of Wales (c. 544 to sixth century, variants c. 589 and 601), Boisil (c. 642 to seventh century, variants 661/664),
Hiram Kano (1986 to 1988), Brigid (c. 523 against c. 525), Gregory the Illuminator (c. 332 against c. 330), Vincent of Lérins (445/450), Sophronius (639 against 638/644), Brendan (575/577),
Ignatius (early second century), Edmund (869/870), Maximinus (346/347/349), Bertin (698/709), Nino (a fourth-century period, not a death year), Deiniol (AM's 384 is a source error),
Jutta (5 May has a Teutonic Order witness, not AM), Egwin (AM locator is its 10 September entry), Agatha (no LFF entry), Zenaida/Philonella/Hermione (LFF locator).
(3) The 55 entries found "Supported with limits" were left as written; their listed limits (unverified particulars) remain.
This does not certify the other 251 principal lives or the additional commemorations.
