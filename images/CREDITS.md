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

## Byzantine / Eastern Orthodox (EOR)

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
- **Status**: sourced and wired (`css/office-shell.css`, `data-uo-tradition="EOR"`)
  but currently **inert** — the Horologion lane (Phase 5, lane 3 of 3) is not built
  yet, so no envelope sets this attribute in production today. The blur/opacity
  values are a starting estimate, not yet measured against real rendered Horologion
  text the way the other three lanes' values are; re-verify by the same measurement
  method (see `css/office-shell.css`'s own comment on the Coptic rule) once that lane
  ships a real envelope.

## Method note

Coptic, East Syriac, and Byzantine images were all cropped locally with Pillow to
remove black photography backgrounds and, where present, scan-edge artifacts —
verified by inspecting the actual cropped image, not by file size alone. The Coptic
and East Syriac treatments were tuned by measuring real WCAG contrast ratios against
`--uo-ink` from live Playwright screenshots of the rendered office, not by eye; see
`AUDIT_GOVERNANCE_LEDGER.md`, key `ui:per-lane-ground-imagery`, for the full method
and the measured numbers.
