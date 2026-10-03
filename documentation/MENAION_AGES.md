# Menaion: AGES texts (Fr. Seraphim Dedes, GOA English translations) -- ingestion and wiring record

Source: `AGES-Initiatives/alwb-library-en-us-goadedes` (CC0 1.0), uploaded by Josh 2026-10-01 as a ZIP (not committed; 16MB).
Credit shown in-app on every AGES-derived item.

## Data
- `scripts/menaion/ingest-ages-menaion.py <path to .../Books-Collections/Menaion>` -> `data/menaion/ages/<MM>.json`,
  keyed `MM-DD` (366 dated days; 226 with some literal hymn text). Keeps only quoted literal texts (+ references to
  other Menaion day files, up to 3 hops). References into Octoechos/Heirmologion/etc. are not followed (718 counted as
  unresolved). Nothing is edited. Slots: vespers_stichera, vespers_aposticha, sessional, exapostilarion, praises.
- AGES is GOA New-Calendar usage and its day files MIX the saint with forefeast/afterfeast/other commemorations
  (e.g. Dec 20/22 stichera 1-3 are the Nativity forefeast, 4-6 the saint; Feb 8 aposticha are Presentation afterfeast).
  So a day file is never used wholesale.
- `scripts/menaion/build-ages-mapping.py` -> `data/menaion/ages/mapping.json`: 27 rank-3 commemorations and, per slot,
  the approved hymn indexes. Rule: a slot is approved only if EVERY selected numbered hymn names the saint (hand-reviewed
  token list in the script). Doxastika/Theotokia are not used. Slots approved: Vespers stichera (19 saints), aposticha
  (5), Orthros praises (3), exapostilarion (10); no sessional hymns or canons.

## Runtime
`js/menaion-commons.js`: for a rank-3 day it first tries the approved AGES slot, else the Orloff Common
(`MENAION_COMMONS_ORLOFF.md`), else leaves the deferred rubric. Same "replace only a deferred rubric" guard.
`resolvedAs: 'menaion-ages-text'`. 2026 sweep (all dates, Orthros + Vespers): 0 errors; 276 Orloff + 26 AGES items.

## Not done / limits
- Rank 1-2 feasts and rank-4 saints untouched. AGES partial-coverage (see resume note) means most days still use Orloff.
- Unapproved AGES hymns on mixed days (e.g. 12-20 stichera 1-3) are deliberately dropped, not shown.
- Possible follow-up: hand-select hymn indexes for more days (needs reading each day file), and resolve Octoechos
  references for melody names.


## Update 2026-10-01 (later): hymn-by-hymn review
- Josh asked for AGES day files to be read one by one to approve more hymns. Every rank-3 day with AGES text was read.
  `build-ages-mapping.py` now has (a) an automatic rule (all numbered hymns in a slot name the saint, OR three same-tone
  hymns with at least two naming the saint; sessional/exapostilarion only the hymns that themselves name the saint;
  a doxastikon only when it names the saint) and (b) a `FORCE` table of slots approved by reading the hymns.
- Mapping: 36 saints. Slot keys: `'3'` numbered hymn, `'g'` doxastikon, `'k.h'` sessional (kathisma k, hymn h).
- Rejected on reading (AGES day file is a different saint or feast than the app's entry): 02-12 Alexios (Meletius),
  04-30 James (the file is James the son of Zebedee; the app labels 04-30 "Brother of the Lord" -- app data question for
  Josh), 07-07 Thomas (Thomas of Maleon), 07-17 Royal Martyrs (Marina), 08-26 Tikhon, 09-20 Eustathios, 10-09 James
  Alphaeus (Andronikos & Athanasia), 10-19 Kronstadt (Joel), 11-24 Catherine (Clement & Peter), 12-22 stichera 1-6
  (Nativity forefeast + Anastasia, only her exapostilarion approved).
- Sweep: 37 AGES items on the 2026 calendar.


## Hymn guide (metadata only) -- 2026-10-01
Where the app has no hymn text for a Great Feast / major feast, `js/hymn-guide.js` (`window.HymnGuide`, run after MenaionCommons in
`HorologionEngine.resolveOffice`) replaces the "not yet text-backed" note with what is appointed: per slot the number of Menaion hymns, their tones
and melody names (e.g. "stichera 1-3: Tone 4, to the melody 'When you were called'; Glory: Tone 8"), plus one line on what the day's rank means
(taken from data/menaion/schema.json's own rank model: rank 1 Great Feast, rank 2 Polyeleos feast).
- Data: `scripts/menaion/ingest-ages-guide.py` -> `data/menaion/ages/guide/<MM>.json` (366 days, 4,271 hymn slots, 82% with a melody name; NO hymn
  text); `scripts/menaion/build-guide-mapping.py` -> `guide/mapping.json` (43 rank 1-2 entries).
- Why only rank 1-2: AGES day titles are generic ("For the Saint."), and a saint's day file mixes in forefeast/other hymns, so a text-less slot cannot be
  attributed to a rank 3-4 saint. For rank 1-2 the date fixes the identity. Excluded as Slavic-only: Seraphim of Sarov (Jan 2) and the Protection (Oct 1).
- Every guide line says "Greek Archdiocese usage (AGES)" and that Slavic usage may differ in count and order. Replaces only a deferred rubric, never text.
- 2026 sweep (vespers + orthros): 43 feast days get guides (Vespers stichera/aposticha, Orthros sessional hymns 1-2, exapostilarion, praises); 0 errors.
