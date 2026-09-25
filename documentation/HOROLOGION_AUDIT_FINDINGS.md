# Horologion Full Audit — Findings Log

**Status: audit in progress, no fixes applied yet.** Per Josh's instruction: "Keep auditing. Record
every error, and then we'll fix everything at once." This file is the running record. Each finding is
verified against both `HAPGOOD1922` and `UNABHOR1997` (`data/kalendar/source-witnesses/source-index.json`)
wherever both cover the office, and against the actual live resolver output (`resolveOffice()` in
`js/horologion-engine.js`), never against the skeleton file alone — a skeleton's declared item order
is not proof of the rendered order unless confirmed live (see the Vespers kathisma/stichera finding
below, which required exactly that check).

Audit order: Vespers → Grand Compline → the four Hours → Typika → Orthros/Matins → Midnight Office →
Small Compline.

---

## VESPERS — audited, 6 findings

### Finding V1 — BUG: Kathisma reading sequenced after "Lord, I have cried" instead of before it

**Live-verified.** `resolveOffice(date, 'vespers')` for an ordinary Wednesday renders section
`lamp-lighting-psalms` as: `lord-i-have-cried-rubric` → `stichera-at-lord-i-have-cried` (resolved,
real content) → `kathisma-reading` (resolved, real content). Both sources agree the true order is
Great Litany → Kathisma → Little Litany → "Lord, I have cried" with stichera:
- Hapgood: "Then shall be said or sung several verses from the First Selection of the Psalms
  (Stikhoslovie Kafismi)... Psalms i., ii." (p.5) precedes "Lord, I have cried unto thee" (p.6-7).
- Unabbreviated Horologion: "If it be a Monday through Friday evening... the appointed kathisma is
  read... followed by the Small Ectenia... And, regardless of rank of service, we chant Lord, I have
  cried" (pp.189-190) — explicit, unambiguous ordering.

Not a placeholder issue — both slots resolve to real, complete text (`resolvedAs:
"octoechos-baseline-ordinary"` and `"ordinary-weekday-full-text"`), so every ordinary Vespers render
currently shows this in the wrong order.

### Finding V2 — GAP: No Little (Small) Litany between Kathisma and "Lord, I have cried"

Both sources place a Little Litany here (Unabbreviated Horologion calls it "the Small Ectenia," p.189,
explicitly "After Blessed is the man or the appointed kathisma"). Entirely absent from the skeleton
(`data/horologion/vespers.json`) — no item, placeholder or otherwise, represents it.

### Finding V3 — GAP: No Augmented Litany after the Prokeimenon/readings

Hapgood: "The Augmented Litany (Sugubaya Ekteniya). Let us say, with all our soul..." (p.9), following
the Prokeimenon and any Parables. Unabbreviated Horologion has the equivalent. The skeleton's
`prokeimenon` section (`daily-prokeimenon`, `vesperal-reading`) has nothing after it before jumping to
`aposticha` — this litany is not represented anywhere.

### Finding V4 — GAP: No "Vouchsafe, O Lord, to keep us this night without sin"

A fixed prayer both sources place immediately after the Augmented Litany's exclamation (Hapgood p.9-10).
Absent from the skeleton entirely.

### Finding V5 — GAP: No Litany of Completion ("Let us complete our evening prayer unto the Lord")

Hapgood p.10: "Deacon. Let us complete our evening prayer unto the Lord... An evening all-perfect,
holy, peaceful and sinless, let us beseech of the Lord..." — a full litany with its own petitions,
distinct from the Augmented Litany (V3) and the Great/Little Litanies already present. Absent from the
skeleton.

### Finding V6 — GAP: No Prayer of the Bowing of Heads before the Aposticha

Hapgood p.10-11: "Deacon. Let us bow our heads unto the Lord... O Lord our God, who didst bow the
heavens and come down for the salvation of mankind..." — said by the priest as the people bow, directly
before the Aposticha. Absent from the skeleton.

### Observation V-O1 — NOT a bug, disclosed for completeness

The `opening` section's `usual-beginning` sequence always renders the FULL standalone-Vespers opening
(Trisagion prayers, Our Father, 12x Lord have mercy). Both sources note this fuller form is used only
when Vespers is *not* immediately preceded by the Ninth Hour — when it is, a shorter opening ("Blessed
is our God..." / "O come, let us worship" directly) applies instead (Unabbreviated Horologion, p.185).
Given this app resolves each office independently with no memory of what was prayed immediately before
it, defaulting to the fuller, safer form is a reasonable architectural simplification — flagged here as
a known limitation, not something to silently "fix" by guessing continuity that the engine can't
actually know.

### Confirmed correct / honestly disclosed (not findings)

`troparion-or-apolytikion` correctly renders an honest rubric disclosing that the weekday troparion
needs the Menaion and isn't yet available, rather than fabricating text. Psalm 103 placement, the
Great Litany's placement, the Entrance/"O Gladsome Light," the Prokeimenon-by-day table, the Aposticha,
and the Nunc Dimittis are all correctly ordered and match both sources.

---

## GRAND COMPLINE — not yet audited

## THE FOUR HOURS — not yet audited

## TYPIKA — not yet audited

## ORTHROS/MATINS — not yet audited

## MIDNIGHT OFFICE — not yet audited

## SMALL COMPLINE — not yet audited
