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

## GRAND COMPLINE — audited (structural/spot-check level), 1 finding

**Scope note**: unlike Vespers, this office's live output is already 45/45 real content (0
placeholders) and structurally mature. Audited at the structural/section-ordering level against both
sources (confirmed opening sequence, conditional Psalm 69/Great Canon gating in Lent week 1, the two
psalm cycles, the "God is with us" placement, and the full closing sequence word-for-word against
`UNABHOR1997` pp.228-231) rather than re-verifying every psalm's full text line-by-line — the existing
build's actual wording was not found to diverge from the sources anywhere it was checked. This is a
lighter pass than Vespers got; flagged here rather than left silently implied, in case that gap
matters when this list is used to plan the fix.

### Finding GC1 — SOURCING: skeleton cites an unapproved source, not either governing text

`data/horologion/great-compline.json`'s own description says: "Source witness: orthodoxprayer.org
Great Compline." That is a website, not `HAPGOOD1922` or `UNABHOR1997` — neither is this project's own
approved governing source for Byzantine structure (Hapgood, approved 2026-09-04) nor the source
supplied specifically for offices Hapgood omits. Spot-checking the live output's actual wording
against `UNABHOR1997` (the closing sequence, pp.228-231) found close, consistent agreement — so
there's no live evidence the *content* is wrong — but the citation itself doesn't point at an approved
source, and the content has never actually been checked line-by-line against one. Recorded as a
sourcing-governance finding distinct from a content-correctness finding: the citation should be
corrected to whichever approved source the content is verified against, once that verification
happens.

### No structural ordering discrepancies found

Opening (Usual Beginning) → conditional Psalm 69/Great Canon (Lent week 1) or Psalms 4, 6, 12 →
doxology → Psalms 24, 30, 90 → "God is with us" → Day Being Past → Angelic Hymn → Creed → Trisagion/
weekday troparia/Prayer of Basil → second Come-let-us-worship → Psalms 50, 101 → Prayer of Manasseh →
Trisagion → sixth-tone troparia → Kyrie 40 (Prayer of St. Maradius) → third Come-let-us-worship →
Psalms 69/142 → Small Doxology → Canon → closing block (Kyrie 40/Prayer of the Hours → More Honourable
→ Prayer of Ephraim, omitted Fridays → Trisagion → Supplicatory Prayer to the Theotokos → Prayer of
Antiochus → ...→ dismissal) all match both sources' own ordering everywhere checked.

## THE FOUR HOURS — audited, 3 findings (2 shared across all four, 1 Third-Hour-specific)

All four Hours (`data/horologion/first-hour.json`, `third-hour.json`, `sixth-hour.json`,
`ninth-hour.json`) share one skeleton pattern: `[opening]` (usual-beginning) → `[psalmody]` (3 fixed
psalms — verified correct against both sources for First and Sixth Hour, matching standard Byzantine
assignment once Hapgood's KJV-vs-LXX psalm-numbering offset is accounted for: her Roman-numeral
citations run +1 relative to this app's LXX numbering throughout the range checked) → `[trisagion]` →
`[troparia]` (troparion + Theotokion) → `[prayer-and-dismissal]`. Live-verified via `resolveOffice()`
for an ordinary non-Lenten Wednesday (2026-09-30), all four fully resolved (0 placeholders each, aside
from the Theotokion slots — see below).

### Finding H1 — BUG: Third Hour's "prayer-of-the-third-hour" renders Lent-only troparion text year-round

Live-verified: on an ordinary September Wednesday (nowhere near Great Lent), `third-hour`'s
`prayer-of-the-third-hour` slot renders "O Lord God, Who didst send down Thy Most Holy Spirit at the
third hour upon Thine Apostles: take Him not from us..." — `UNABHOR1997` (p.116) is explicit and
unambiguous that this exact text belongs under a section literally headed "LENTEN SERVICE," introduced
with "(If Lent, skip to LENTEN SERVICE below.)" It is not a year-round fixed prayer. Confirmed as a
real content bug, not a labeling quirk, by comparing against the other three Hours: `first-hour`,
`sixth-hour`, and `ninth-hour` each render a distinct, substantial, genuine year-round "Prayer of the
Hour" text in the equivalent slot on the same test date (respectively "O Christ, the True Light...",
"O God and Lord of powers...", "O Master and Lord, Jesus Christ our God, Who art long-suffering...") —
all three read as authentic, correctly-sourced prayers proper to each hour. Third Hour is the outlier:
its slot currently holds what should be a Lent-only troparion, not its own year-round prayer. The
correct year-round Prayer of the Third Hour still needs to be sourced and substituted in; the current
text should be gated to Great Lent only (as an addition to the troparia, matching how the other
sources gate it) or dropped from this slot entirely, not left rendering unconditionally.

### Finding H2 — GAP/MISPLACEMENT, shared by all four Hours: the mid-office Trisagion is the wrong (fuller) form, and the correct short form is missing

Both sources agree each Hour's *opening* (before the psalms) uses the full complex (O Heavenly
King/Trisagion/Our Father/Lord have mercy ×12/Come let us worship) — confirmed already correctly
present in the app's own `[opening]` → `usual-beginning` sequence. But **between the psalms and the
troparia**, both sources show only a short unit — Alleluia ×3, Lord have mercy ×3, Glory — not the
full complex again (`HAPGOOD1922`, Third Hour, p.44-45: "Alleluia, alleluia, alleluia. Glory to thee,
O God. (Thrice.) Lord, have mercy. (Thrice.) Glory to the Father... Then the Hymn for the Day"). The
app's `[trisagion]` section, positioned exactly there, instead renders the FULL O-Heavenly-
King/Trisagion/Our-Father/12×-mercy complex a second time — dumped verbatim from
`verify_hours.mjs`'s output, confirmed live. The full complex's real place is a *second* occurrence,
after the troparia/Theotokion and before the dismissal (both sources show it there, `HAPGOOD1922`
eliding it with "..." as previously-given text, a standard convention in that book for repeated fixed
material — not proof it's short there). The app's skeleton has no section or item at all in that later
position — so as it stands, the full complex appears once, in the wrong place (mid-office instead of
at the close), and the short mid-office unit it should have replaced isn't rendered by anything.

### Finding H3 — GAP, shared by all four Hours: no "Blessed is the Lord God, blessed is the Lord day by day" verse

Both sources place this fixed verse (a paraphrase of Ps.68:19-20) directly after the Theotokion and
before the (repeated) Trisagion, in every one of the four Hours — confirmed directly in Third Hour's
text (`UNABHOR1997` p.116: "Blessed is the Lord God, blessed is the Lord day by day; the God of our
salvation shall prosper us along the way; our God is the God of salvation."; `HAPGOOD1922` gives the
same verse in its own wording). No item in any of the four Hours' skeletons represents it.

### Confirmed correct / honestly disclosed (not findings)

Psalm assignments (First Hour 5/89/100, Third Hour 16/24/50 — the two directly checked against both
sources) are correct. The Theotokion slots for all four Hours correctly and honestly disclose that the
Little Hours' own Theotokion corpus isn't yet imported, rather than fabricating text — not a finding.
The `troparion-of-the-day` slots correctly disclose the weekday troparion as deferred pending Menaion
import — not a finding, matches this project's standing policy.

## TYPIKA — audited, 7 findings

Live-verified via `resolveOffice(date, 'typika')` for an ordinary Wednesday. 13/13 slots "implemented"
per the engine's own diagnostics — but see T1, which shows that count is misleading for two of them.

### Finding T1 — BUG, live console error: Epistle/Gospel lectionary resolution is broken

The live console output shows, unprompted: `Typika ordinary weekday epistle resolution failed:
resolveScripturePericope is not defined` and the identical error for the Gospel. This is a real
`ReferenceError` at runtime — the function the resolver calls to look up the day's Epistle/Gospel does
not exist in scope. `structure.json`'s own `governance.byzantine_release_roadmap` claims this was built
and live ("Typika Epistle/Gospel scripture resolution is now helper-normalized via
`resolveScripturePericope()` as of 2026-05-10") — that claim is currently false at runtime. The failure
is caught and silently downgrades to a generic "consult the Apostol/Evangelist" rubric with no visible
error surfaced to the user, and the engine's own diagnostics still count these slots as "implemented"
(13/13, 0 placeholders) despite them having actually failed. This is the single highest-severity finding
in the audit so far — a claimed-complete feature that is silently non-functional.

### Finding T2 — BUG: Beatitudes rendered before Psalms 102 and 145 instead of after

Live-verified: section order is `[beatitudes]` then `[psalmody]`. Both sources place Psalm 102 and
Psalm 145 (with the "O Only-begotten Son" hymn between them and what follows) *before* the Beatitudes,
not after (`HAPGOOD1922` p.59: Psalm 145 concludes, then "O Only-begotten Son, and Word of God..."
hymn, then "In the Great Fast... we sing... The Beatitudes"). Same class of bug as Vespers Finding V1.

### Finding T3 — GAP: "O Only-begotten Son, and Word of God" hymn missing

Between the two psalms and the Beatitudes in both sources (`HAPGOOD1922` p.59, full text given above).
No item anywhere in the skeleton represents it.

### Finding T4 — GAP: "The heavenly choir doth hymn thee" hymn missing

Between the Beatitudes' closing "Remember us, O Lord/Master/Holy One" and the Creed, both sources give
this three-part hymn ("Holy, holy, holy, Lord God of Hosts: heaven and earth are full of thy glory"
with its own verse and Gloria). Absent from the skeleton.

### Finding T5 — BUG: a full Trisagion+Our Father sequence is inserted where the source has none, and duplicates the Lord's Prayer that correctly appears later

Live-dumped in full: the `[trisagion]` section between Creed and Troparia contains a complete Holy-
God/All-holy-Trinity/Our-Father/"For Thine is the kingdom" sequence. `HAPGOOD1922` (pp.60-61) shows no
Trisagion at all in this position — the Creed leads directly into a distinct prayer ("Loose, remit,
pardon, O God, our transgressions...", see T6) and then directly into the Lord's Prayer once, followed
by the day-of-week Kontakia. The app's `[lords-prayer]` section, correctly positioned near the end,
already renders "Our Father" again on its own (`typika-lords-prayer`) — meaning the Lord's Prayer is
currently rendered **twice** in one office render, once misplaced mid-office inside an unwarranted
Trisagion block and once correctly at the end.

### Finding T6 — GAP: "Loose, remit, pardon, O God, our transgressions" prayer missing

Both sources place this fixed prayer directly after the Creed, before the Lord's Prayer. Absent from
the skeleton.

### Finding T7 — SCOPE CORRECTION (not a bug, but changes what's blocked): the Kontakion-of-the-day does not need the Menaion

`typika-kontakion-rubric` currently discloses the day's Kontakion as needing the Menaion (echoing the
adjacent `troparion-of-the-day` rubric, which correctly does need it). But `HAPGOOD1922` (pp.61-62)
gives the Typika Kontakion as a **fixed table by day of week** — Monday: Bodiless Powers; Tuesday: the
Forerunner; Wednesday and Friday: the Cross; Thursday: the Holy Apostles (with St. Nicholas added the
same day); Saturday: the Martyrs, with the Transfiguration Kontakion given as the worked example — plus
a fixed Kontakion for the departed and a Theotokion ("O Protection of Christians") on every day except
Saturday. None of this depends on the Menaion; it's exactly the kind of fixed, day-keyed table this
project has already built for other slots (e.g. the Vespers prokeimena-by-day table). Recorded as a
scope correction because it means this slot is not actually blocked on the same thing the Troparion-
of-the-day slot is — it could be sourced and built now, independent of Menaion import.

## ORTHROS/MATINS — not yet audited

## ORTHROS/MATINS — not yet audited

## MIDNIGHT OFFICE — not yet audited

## SMALL COMPLINE — not yet audited
