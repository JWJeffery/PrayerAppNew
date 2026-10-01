# Menaion Commons (Orloff 1899) -- ingestion and wiring record

Moved out of RESUME_PROJECT_NOTE.md on 2026-10-01 (closed work). Source: Orloff, *The General Menaion* (London 1899), via CCEL.

**DONE 2026-10-01 -- Orloff Commons ingested AND wired for rank-3 saints (live-verified in headless Chromium).**
- Data: `scripts/menaion/ingest-orloff-commons.py` fetched all 27 chapters + Appendix from CCEL into
  `data/menaion/commons/<slug>.json` (verbatim, CCEL OCR typos preserved; each paragraph keeps its CCEL id,
  print page, italic rubric runs). `scripts/menaion/build-commons-sections.py` then adds a `sections` array
  (vespers_stichera, vespers_aposticha, sessional_1/2/3, canon, exapostilarion, praises, ...) split by
  Orloff's own rubrics; his "(mentioned by name)" becomes the token `{NAME}`. Both scripts are idempotent.
- Mapping: `data/menaion/commons/mapping.json` -- 47 hand-reviewed RANK-3 commemorations -> a common +
  `invocation` (the name substituted for {NAME}). Deliberately UNMAPPED (keep their deferred rubrics):
  Synaxes, feasts/Marian feasts, Equal-to-the-Apostles, groups of martyrs, saints with companions,
  Clement/Ignatius/John Damascene (type ambiguous), the Daniel+Three Youths day, Royal Martyrs, Holy Innocents.
- Runtime: `js/menaion-commons.js` (`window.MenaionCommons.applyToSections`, loaded in `index.html` after
  `menaion-resolver.js`), called from `HorologionEngine.resolveOffice` for `orthros` and `vespers` right
  before the diagnostics pass. It ONLY replaces a slot that is still a deferred rubric (resolvedAs
  `orthros-rank3-menaion-*-deferred-rubric`, `orthros-feast-canon-rubric`, or Vespers `menaion-feast-rubric`)
  and only when the day's governing troparion is a rank-3 `menaion-feast-troparion` whose name is in the
  mapping. Orthros slots filled: sessional-hymns-1/-2, canon, exapostilarion, praises-stichera. Vespers:
  stichera-at-lord-i-have-cried, aposticha. If a Common lacks a section (e.g. the hieromartyr chapter has
  no Vespers texts) the honest rubric stays. Rendered text carries a disclosure line (Common, Slavonic
  usage, saint's own proper hymns not in corpus). Item `resolvedAs: 'menaion-orloff-common-text'`.
- Verified: swept all 365 days of 2026 x {orthros, vespers} in headless Chromium -- 0 exceptions, 0 leftover
  `{NAME}`/"mentioned by name"; 36 Orthros + 32 Vespers days filled (others fall on Sundays/Lent, where the
  engine's existing paths govern); UI screenshot of Vespers 2026-07-07 (Apostle Thomas) renders correctly
  with sidebar entries. NOT touched: rank 1-2 feasts, rank-4 saints, Orthros aposticha, kontakion slot,
  Octoechos interplay on Sundays.
- Known limitations/next: (1) rank-4 saints (246 of 370 commemorations) still show ordinary weekday
  content -- extending needs Typikon rules for which Orloff sections apply at three-stichera rank;
  (2) Orloff's alternate-branch rubrics ("If there be a Festival...") are shown as printed, not resolved;
  (3) unmapped rank-3 entries above could be mapped with Josh's judgment; (4) AGES for saint-specific propers.



## Update 2026-10-01 (later): mapping widened, section detection fixed
- Mapping now 60 rank-3 entries (was 47): added Synaxes of the 70 and the 12 Apostles, Gregory of Nyssa + Dometian,
  Translation of Ignatius, Haralambos, Innocent of Irkutsk, the Forty and the Twenty Thousand Martyrs, Eustathios
  and family, Clement of Rome, Ignatius the God-bearer, John of Damascus, Daniel and the Three Youths.
- Still unmapped, with reasons: Equal-to-the-Apostles saints (Cyril, Cyril & Methodius, Vladimir, Mary Magdalene,
  Thekla, Nina) -- Orloff has no such Common; Nicaea Fathers + Nina; feasts with their own propers (Chains of Peter,
  Procession of the Cross/Maccabees, Mandylion, Conception, Leavetaking, Repose of Anna); Royal Martyrs, Holy Innocents,
  John of Kronstadt; Gabriel / Michael-at-Chonae (Orloff's Angels chapter names Michael in the text); Robe/Belt of the
  Theotokos (Theotokos chapter has an unfilled "((name of the event))" placeholder).
- `build-commons-sections.py` fixed: sections now also start at a rubric in the MIDDLE of a paragraph; patterns accept
  Typicon/Typikon, 1st/first, Sticheron/Stichera/Idiomelic, "Lauds ... the". A boundary check (no other section's
  rubric inside a section) passes for every mapped common. 2026 sweep: 43 Orthros + 39 Vespers days filled, 0 errors.
