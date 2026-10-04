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
All 347 primary saints and groups were written; 346 are in the file. Alicia "Cristina" Rivera, OSH (08-?, UO-SIN-000053) was
withheld: no biographical source could be found, and the draft only described her order, so that day keeps its
one-line description until someone supplies a real source. Confidence: 250 high, 79 medium, 18 low (legendary or
thinly documented saints; the text says "according to tradition" where it applies). Still to do: the additional
saints of each day (769), the 19 feast days, and a human read-through of the medium and low entries.
Re-run `python3 scripts/merge-anglican-saint-lives.py` after adding month files to the scratch folder to re-check
and merge.
