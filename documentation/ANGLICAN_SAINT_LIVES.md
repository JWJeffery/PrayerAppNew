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
