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
