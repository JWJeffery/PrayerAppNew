# Horologion Full Audit — Findings Log

**Status: all 8 offices/office-groups audited. Fix pass complete — 7 of 7 office-groups fixed
(Vespers, Grand Compline, the four Hours, Typika, Orthros/Matins, Midnight Office, Small Compline).**
Per Josh's instruction: "Keep auditing. Record every error, and then we'll fix everything at once,"
followed by "Please proceed" (twice) to start the fix pass. This file is the running record.
Each finding is verified against both `HAPGOOD1922` and `UNABHOR1997`
(`data/kalendar/source-witnesses/source-index.json`) wherever both cover the office, and against the
actual live resolver output (`resolveOffice()` in `js/horologion-engine.js`), never against the
skeleton file alone — a skeleton's declared item order is not proof of the rendered order unless
confirmed live (see the Vespers kathisma/stichera finding below, which required exactly that check).

## Summary, for planning the fix pass

| Office | Findings | Headline |
|---|---|---|
| Vespers | 5 (1 bug, 4 gaps) — *was 6, V3 retracted as a false positive, see below* | Kathisma sequenced after "Lord, I have cried"; 4 missing litanies/prayers |
| Grand Compline | 1 (sourcing) | Cites an unapproved source (orthodoxprayer.org); content agrees with `UNABHOR1997` where spot-checked |
| The four Hours | 3 (1 bug, 2 shared gaps) — **FIXED 2026-09-26** | Third Hour renders Lent-only troparion year-round; mid-office Trisagion uses the wrong form; each Hour missing its own fixed verse (not one shared verse — corrected during the fix pass) |
| Typika | 6 (2 bugs, 3 gaps, 1 scope correction) — *was 7, T1 retracted as a false positive, see below* — **FIXED 2026-09-26** | Beatitudes before the Psalms instead of after; a misplaced Trisagion block duplicates the Lord's Prayer; the Kontakion-of-the-day table (T7) built |
| Orthros/Matins | 2 (2 gaps) — **FIXED 2026-09-26** | Psalms 19/20 missing from the opening; sessional hymns not interleaved per-kathisma |
| Midnight Office | 4 (1 major structural, 1 bug, 2 gaps) — **FIXED 2026-09-26, full rebuild** | Real office has 3 distinct day-forms, now built with day-of-week branching; Psalm 117 removed; all 9 Macarius/Basil prayers and the full closing sequence built; M3's "Canon" corrected (no such structure exists on Weekday/Saturday — the real Canon to the Trinity exists only on Sunday, disclosed as tone-dependent) |
| Small Compline | 4 (3 gaps, 1 scope correction) — **FIXED 2026-09-26** | Three fixed prayers missing; day-of-week troparia wrongly modeled as Menaion-dependent (and, once corrected, a second latent bug found: the shared Menaion-override machinery was pre-empting the fixed table on rank 3-4 commemorations — nearly every day — now capped to rank 1-2) |

**24 findings total** (27 originally recorded, minus Typika's T1 and Vespers' V3, both retracted during
the fix pass before any fix was attempted — T1 was a false positive from an incomplete test harness;
V3 was a real rubric this app already correctly follows, misread the first time because `HAPGOOD1922`
frames Vespers around the festal Vigil throughout) across 7 audited office-groups (8 offices, since the
four Hours share one entry). The
recurring pattern worth noticing before the fix pass: at least four different offices (Vespers, Typika,
Orthros, Midnight Office) show a component sequenced in the wrong position relative to both sources
agreeing on the correct order — this looks like a systemic authoring pattern, not isolated mistakes,
and the fix pass should probably re-verify ordering deliberately in every office it touches, not just
the ones with a finding already recorded here.

Audit order: Vespers → Grand Compline → the four Hours → Typika → Orthros/Matins → Midnight Office →
Small Compline.

---

## VESPERS — audited, 6 findings, FIXED 2026-09-26 (V1, V2, V4, V5, V6; V3 retracted, no fix needed)

Fixed in `data/horologion/vespers.json`: reordered Kathisma before the Little Litany and "Lord, I have
cried" (V1/V2); added "Vouchsafe, O Lord" (V4), the Litany of Completion (V5), and the Prayer of the
Bowing of Heads (V6), sourced from `UNABHOR1997` (and, for the one prayer only it doesn't print,
`HAPGOOD1922`). Live-verified via the corrected full-script `resolveOffice()` harness: 21/21 slots
resolve (was 17/17 before the 4 additions), correct new order confirmed
(`kathisma-reading` → `little-litany-after-kathisma` → `lord-i-have-cried-rubric` →
`stichera-at-lord-i-have-cried`), no JSON errors, no regressions. Also confirmed, so it isn't mistaken
for a regression: on the test date the stichera slot now correctly renders an honest "proper festal
stichera... should be appointed here" rubric instead of ordinary Octoechos stichera, because loading
the correct full script set (including `menaion-resolver.js`, omitted from this office's original
narrower audit test) lets the engine see a real rank-3 feast on that date — exactly the disclosed-gap
behavior this project already uses elsewhere, not something this fix changed or broke.

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

### Finding V3 — RETRACTED: the Augmented Litany is correctly absent on ordinary weekdays

**Originally recorded as a gap. Caught and corrected during the fix pass, before touching any code,
by reading `UNABHOR1997` more precisely than the first audit pass had.** `HAPGOOD1922`'s presentation
is framed around the festal Vigil throughout (as already disclosed for Orthros/Matins), which is what
led the original pass to assume the Augmented Litany belongs at ordinary Vespers too. `UNABHOR1997`
p.194 states the actual rule explicitly: *"If there be a vigil or polyeleos... the Augmented Ectenia...
is said after the parables, followed by Vouchsafe, O Lord... If it be a simple service, immediately
after the prokeimenon: Reader: Vouchsafe, O Lord, to keep us this evening without sin."* The Augmented
Litany is vigil/polyeleos-only; on an ordinary weekday ("a simple service") it is correctly *omitted*,
and going straight from the Prokeimenon to "Vouchsafe, O Lord" — which is exactly what the app already
does, once V4 below is fixed — is the correct ordinary-day behavior, not a gap. No fix needed for this
finding; it should not have been recorded as one.

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

## GRAND COMPLINE — audited (structural/spot-check level), 1 finding, FIXED 2026-09-26 (GC1)

Fixed in `data/horologion/great-compline.json`'s description: corrected the source citation from
`orthodoxprayer.org` to record the `UNABHOR1997` spot-check already performed (structure/sequencing
only, not a line-by-line re-verification of every psalm's exact wording — disclosed as such in the
corrected text, not overclaimed).

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

## THE FOUR HOURS — audited, 3 findings, FIXED 2026-09-26 (H1, H2, H3)

**Correction made during the fix pass, not assumed from the finding text above:** H3's own
wording called the missing verse "shared by all four Hours" on the strength of checking Third
Hour alone. Re-verified individually against `UNABHOR1997` for each of the other three Hours
before fixing — **each Hour has its own distinct fixed verse at this position, not a shared
one**: First Hour (Psalm 118 LXX vv.133-135, 171 — "My steps do thou direct..."), Third Hour
("Blessed is the Lord God...", as originally found), Sixth Hour (Psalm 78 LXX vv.8-9 — "Let thy
compassions quickly go before us..."), Ninth Hour (Song of the Three Youths / Daniel 3 LXX
vv.34-35 — "Deliver us not up utterly..."). Fixed per-Hour, not copied across Hours. This is
exactly the over-generalization the methodology warning below cautions about, caught by
independently re-checking the primary source per office rather than trusting the finding's own
summary.

**H1 fix, also verified beyond the finding's own text**: neither `HAPGOOD1922` nor `UNABHOR1997`
gives the Third Hour a distinct year-round prose "Prayer of the Hour" the way First/Sixth/Ninth
Hour each genuinely have one (confirmed by reading each Hour's post-Kontakion material directly,
not inferred) — on ordinary days Third Hour's own governing sources simply proceed from the
Kontakion to the dismissal. `_resolveThirdHourSlots()` in `js/horologion-engine.js` now gates the
Lenten troparion to Great Lent weekdays (Mon-Fri, matching the existing `isGreatLentWeekday`
pattern already used elsewhere in this file) and renders an honest disclosure rubric otherwise,
rather than the finding's other suggested option (fabricating a substitute year-round prayer,
which no real source supports).

**H2 fix**: `trisagion-prayers` in all four `*-fixed.json` files shrunk to the real short
Alleluia/Lord-have-mercy unit; a new `trisagion-prayers-repeated` slot (the full complex, its real
second occurrence) added after each Hour's own fixed verse, before the Kontakion position.

**Verified**: `node --check js/horologion-engine.js` clean; all 8 touched JSON files reparse
clean; a rebuilt full-script harness (per the methodology warning below — every script
`index.html` loads before `horologion-engine.js`, in order) confirms all four Hours render
`status: "complete"`, 0 placeholders, on an ordinary Wednesday (2026-09-30), and confirms the
Lenten branch fires correctly and renders the correct (relabeled) troparion on a real Great Lent
weekday (2027-03-15, Clean Monday). A 5-year (2024-2028), 10-office, both-calendar-mode sweep
(36,540 calls) shows zero exceptions and zero placeholders — no regression elsewhere. Live-
confirmed in real headless Chromium against the running dev server under `?shell=v2`: all four
Hours' new sections render with the correct item keys, zero non-environmental console errors (one
`ERR_CERT_AUTHORITY_INVALID` on a Google Fonts request, confirmed via `requestfailed` to be the
sandbox's own proxy blocking an external font fetch, unrelated to this change and matching the
class of environmental noise prior sessions already documented).

### Original findings, for reference (all three now fixed as described above)

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

## TYPIKA — audited, 7 findings, FIXED 2026-09-26 (T2-T7; T1 already retracted)

**Verified against both sources directly before fixing, in full** (`HAPGOOD1922` pp.59-63;
`UNABHOR1997` pp.135-143, "The Order of the Typica") — not just the excerpts quoted in T2-T6 below.
This full read surfaced three things beyond what T2-T6 state:

1. **The Beatitudes' own closing refrain ("Remember us, O Lord/Master/Holy One") was missing
   entirely from `typika-beatitudes`.** T4's own wording assumed it already existed ("between the
   Beatitudes' closing ... and the Creed") — checked directly and it wasn't there at all. Added as
   part of fixing T4, since T4's new hymn's position depends on it.
2. **`typika-psalm-145`'s own fixed text carried a spurious trailing Alleluia/Lord-have-mercy
   unit** ("Alleluia, Alleluia, Alleluia. Glory to Thee, O God. (×3) / Lord, have mercy. (×3) /
   Glory...") with no basis in either source for Typika — reads as a copy-paste artifact from the
   Hours' own mid-office unit (see H2 above). Found while sourcing T3's insertion point (which
   needs to sit immediately after this psalm's real ending); removed.
3. **T5's own text treated the app's Lord's Prayer position ("near the end," after the Epistle/
   Gospel readings) as already correct, only asking for the duplicate to be removed.** Both sources'
   literal running order is Creed → "Loose, remit, pardon" → the Lord's Prayer (once) → the day's
   Kontakion — i.e., the Lord's Prayer belongs well *before* the readings/Kontakion position, not
   after. Fixed to match: the `lords-prayer` section moved up to sit directly after `creed`, and a
   new `dismissal` section holds the closing rubric that used to share space with it. **Beyond what
   T5 itself asked for, but the correct position was directly verifiable, so left uncorrected would
   have been a known error, not a disclosed limitation.**

### Finding T2 — BUG: Beatitudes rendered before Psalms 102 and 145 instead of after

Live-verified via `resolveOffice(date, 'typika')` for an ordinary Wednesday. 13/13 slots "implemented"
per the engine's own diagnostics — but see T1, which shows that count is misleading for two of them.

### Finding T1 — RETRACTED, false positive from my own incomplete test harness

**Originally recorded as the audit's single highest-severity bug. It was wrong. Retracted 2026-09-25,
before any fix was attempted, once the fix pass began and re-verification caught it.** The original
test script loaded only `js/byzantine-paschalion.js` and `js/horologion-engine.js` — omitting
`js/scripture-resolver.js`, which `index.html` actually loads *before* `horologion-engine.js` and which
defines the very function (`resolveScripturePericope`, exported as `window.resolveScripturePericope`)
the original error claimed was undefined. Re-ran with a harness loading the exact 26-script sequence
`index.html` loads ahead of `horologion-engine.js`, in the same order: the Epistle correctly resolved to
Ephesians 5:25-33 and the Gospel to Luke 5:33-39 (both real, correctly-cited text — "Metropolitan Cantor
Institute" ordinary-after-Pentecost lectionary), no error, no fallback rubric.
`structure.json`'s claim that this was built and live is correct after all.

**Consequence for the rest of this document, checked deliberately rather than assumed**: every other
finding here concerns either (a) the declared array order of items within a skeleton file, or (b) the
presence, absence, or fixed content of a JSON data file read directly by URL — neither depends on which
*other* JS modules happen to be loaded, so this specific harness gap could not have produced a false
positive anywhere else. Re-ran all ten offices (Vespers, Great Compline, all four Hours, Typika,
Orthros, Midnight Office, Small Compline) through the corrected 26-script harness as a direct check
rather than trusting that reasoning alone: every office's `implementedSlots` count and every
`resolvedAs` value already recorded in this document matched exactly, with zero warnings and zero
errors anywhere. T2-T7 below stand as originally recorded.

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

**T7 built, not just recorded as unblocked.** Per the same worked pattern quoted above, cross-
verified against `UNABHOR1997` pp.139-141 (independently gives the same six weekday assignments and
the same Saturday structure): Monday (Bodiless Powers, Tone 2), Tuesday (Forerunner, Tone 2),
Wednesday and Friday (the Cross, Tone 4, identical text both days), Thursday (Holy Apostles, Tone 2,
plus St. Nicholas, Tone 3, same day), each followed by the shared memorial verse ("With the saints
give rest...") and, on every day but Saturday, the shared Theotokion ("O Protection of Christians...
"). Saturday has no day-proper Kontakion of its own in this position — only the memorial verse,
followed by the Kontakion of the Holy Martyrs (Tone 8), with no Theotokion (confirmed: "on weekdays,
but not Saturdays" is the source's own wording). Sunday's existing tone-keyed Resurrectional
Kontakion table (already correct, unchanged) is untouched. Built inline in
`_resolveTypikaSlots()`, matching the existing `SUNDAY_RESURRECTIONAL_KONTAKIA` object's own code
style rather than a new fetched file, since that's the established precedent for exactly this shape
of content in this function. The Menaion/feast-override branch the source's own preamble also
describes ("if there be a feast of the Lord, we say its Kontakion...") remains deferred, matching
`troparion-of-the-day`'s own disclosed status — this table is the fallback when no such feast/saint
applies, not a replacement for that override.

**A real regression caught before it shipped, during the sweep, not before:** implementing T7
required changing `typika-kontakion-rubric`'s skeleton item from a `rubric` (with real, if generic,
fallback text) to a `placeholder` — which meant that on Pascha itself, where no Octoechos tone
1-8 resolves (the week's tone cycle doesn't begin until Thomas Sunday), the item was left as a bare
unresolved placeholder instead of degrading gracefully. Caught by a 5-year regression sweep (10
offices, both calendar modes, 36,540 calls) that had shown zero placeholders before this fix and 10
after — all 10 were Pascha itself across the swept years. Fixed with an honest disclosure rubric
("The Paschal Kontakion belongs here; not yet sourced in this corpus.") rather than fabricating the
Paschal Kontakion's own text, which is out of scope for this finding. Re-swept clean: 0 exceptions,
0 placeholders.

**Verified overall**: `node --check` clean; both touched JSON files reparse clean; the rebuilt
harness confirms all seven weekdays plus Pascha resolve `status: "complete"`/`"complete"`
(Pascha's one honestly-disclosed gap aside, which is a `rubric`, not a `placeholder`, so it doesn't
count against `diagnostics.placeholderSlots`); the 5-year, 10-office, both-calendar-mode sweep
(36,540 calls) is clean after the Pascha fix. Live-confirmed in headless Chromium against the real
dev server under `?shell=v2`: Monday, Saturday and Sunday all resolve with the correct new section
order and the correct day-specific Kontakion label, zero non-environmental console errors (the same
Google Fonts/`ERR_CERT_AUTHORITY_INVALID` sandbox-proxy noise already documented, confirmed
unrelated).

## ORTHROS/MATINS — audited, 2 findings, FIXED 2026-09-26 (O1, O2)

**Source note**: `HAPGOOD1922`'s Matins presentation is specifically the Sunday/festal All-Night Vigil
form (Polyeleos + Gospel), not ordinary ferial Matins — not the right direct comparison for the
skeleton's own stated scope ("the ordinary Orthros of the Constantinopolitan Horologion"). Used
`UNABHOR1997`'s general "THE ORDER OF THE MATINS" (pp.46-64) as the primary structural source for this
office instead, cross-checking against `HAPGOOD1922` only for pieces common to both forms (Six Psalms,
God is the Lord, Great Litany placement — all confirmed matching). Live-verified via
`resolveOffice('orthros', ...)`: 26/26 slots resolve, several correctly and honestly deferred (rank-3
Menaion sessional hymns/kontakion/exapostilarion/praises stichera for a real saint on the test date,
St. Gregory the Illuminator — not findings, matches this project's standing disclosure policy).

### Finding O1 — GAP: Psalms 19 and 20 missing from the opening, before the Six Psalms

`UNABHOR1997` p.47: after "O come, let us worship" (marked point "(III)," the branch reached when
Matins is preceded by Vespers or the Midnight Office and it is not Great Lent — the common case for
this app's independently-resolved offices, same reasoning as the Vespers V-O1 observation), the
rubric explicitly continues "And three reverences. And Psalms 19 and 20," followed by their full text.
Live-verified: the app's `[opening]` section jumps directly from the `usual-beginning` sequence to the
Six Psalms rubric — no item anywhere represents Psalms 19/20.

### Finding O2 — GAP/MISORDERING: sessional hymns are not interleaved with their own kathisma

`UNABHOR1997` pp.60-61 shows each kathisma followed immediately by its own sessional hymn(s) and a
Small Ectenia, repeated per kathisma (kathisma 1 → its sessional hymns → litany → kathisma 2 → its
sessional hymns → litany → ...), not all kathismata read consecutively with sessional hymns bundled
separately afterward. Live-verified: the app's `[kathismata]` section renders Kathisma 8, then
Kathisma 9, then a "not appointed" rubric for a third, as three consecutive items — only *after* all
three does the separate `[sessional-hymns]` section render a single combined sessional-hymns slot.
Structurally, two real kathismata were read on the test date, each of which should carry its own
sessional hymn immediately after it; the skeleton only has one combined slot to represent both.

### O1 and O2 fixed

**O1**: `psalm-19` and `psalm-20` added as their own new section between `opening` and
`six-psalms`, text sourced from `HAPGOOD1922` pp.15-16 (her All-Night Vigil reaches the identical
point via her own entry marking) for internal consistency with this file's own Coverdale-sourced
Six Psalms and Psalm 50. **Not built, disclosed only**: what both sources show between Psalm 20 and
the Six Psalms on this same entry path — a repeated Trisagion complex and what read as
festal/Vigil-specific troparia and a hierarch litany — is out of scope for this finding, which asks
only for the two psalms themselves; that further material wasn't investigated to the depth needed
to be confident it belongs in this office's *ordinary ferial* baseline rather than only its Vigil
form.

**O2**: the `kathismata` and `sessional-hymns` sections merged into one interleaved section
(kathisma 1 → its own sessional hymn → a Small Litany → kathisma 2 → its own sessional hymn → a
Small Litany → kathisma 3, Lenten/Holy-Week only, unchanged). The single `sessional-hymns` slot
split into `sessional-hymns-1`/`sessional-hymns-2`; the engine's own resolution logic already
tracked per-kathisma hymn text internally (`afterKathisma1`/`afterKathisma2` on both the Sunday and
ordinary-weekday corpus paths) — only the *skeleton's* structural position was wrong, not the
underlying data model. The Small Litany's fixed text reuses Vespers' own
`little-litany-after-kathisma` verbatim (same fixed litany form, same UNABHOR1997 source).

**A real bug caught while restructuring, not part of the original finding**:
`_finalizeOrthrosReleaseHonestyPatch()` — a post-processing safety patch that downgrades a
Sunday sessional hymn to "pending source confirmation" when the loaded corpus text hasn't been
independently verified — matched on the old singular `sessional-hymns` key and `break`s after
patching the first hit. Splitting the key into two would have silently disabled this patch for
both new items (no match at all). Fixed to match either new key and to patch each independently
(no `break`).

**A second real gap caught while restructuring**: on an ordinary Sunday, only the first kathisma is
appointed (the second and third correctly disclose "not appointed"), but the new interleaved
structure would have rendered `sessional-hymns-2` and its Small Litany as if a real hymn/litany
belonged there regardless. Both now check their sibling kathisma item's own resolution and disclose
"not applicable" when it isn't appointed, rather than rendering pending/deferred content for a
kathisma that isn't there. Verified against Great Lent, Bright Week, and Holy Week dates directly —
none of those paths' own "no kathisma" wording matches the specific "not-appointed" check, so their
existing (correct, unrelated) behavior is unaffected.

**Verified**: `node --check` clean; both touched JSON files reparse clean; the rebuilt harness
confirms both an ordinary weekday and a Sunday resolve `status: "complete"`, 0 placeholders, with
the correct interleaved section order; the "not applicable" guard confirmed correct on the Sunday
case (only one kathisma appointed) and confirmed NOT to misfire on Great Lent, Bright Week, or Holy
Week dates (all three kathismata carry real or season-appropriate content there, unaffected). The
5-year, 10-office, both-calendar-mode sweep (36,540 calls) is clean. Live-confirmed in headless
Chromium against the real dev server under `?shell=v2`.

### Confirmed correct / honestly disclosed (not findings)

Opening → Six Psalms → Great Litany → God is the Lord → Troparia → Kathismata order is otherwise
correct (Great Litany placement directly after the Six Psalms, before "God is the Lord," matches
`UNABHOR1997` precisely). Psalm 50 correctly opens the `[canon]` section, matching the "simple
service" path in `UNABHOR1997` p.61 exactly. The Canon, Kontakion, Exapostilarion, and Praises-
Stichera slots all correctly and honestly disclose Menaion-dependent content as not yet available
rather than fabricating it — not findings. The "third Kathisma not appointed on ordinary weekdays"
rubric reads as a reasoned, aware disclosure of real Typikon complexity (weekday kathisma count
varies by season), not an error — not investigated further given time, but not flagged as a finding
either.

## MIDNIGHT OFFICE — audited, 1 major structural finding + 3 specific findings, FIXED 2026-09-26 (M0-M3, full rebuild)

**This is the office `UNABHOR1997` was specifically supplied to source**, since `HAPGOOD1922` omits it
entirely (confirmed in Phase 1). Read `UNABHOR1997` pp.1-19 (the Weekday form) in full.

### Finding M0 — MAJOR: the real office has three distinct forms; the app builds one generic form for all days

`UNABHOR1997` gives **three separate, substantially different offices**: "The Midnight Office for
Weekdays" (pp.1-19), "...for Saturdays" (pp.21-39), and "...for Sundays" (pp.40-45) — different psalms,
different canons, different closing material. `data/horologion/midnight-office.json`'s own description
says "the ordinary (weekday/Sunday) Midnight Office" as if one structure serves both, and the skeleton
has no day-of-week branching at all. This is a bigger gap than a missing component: it's a missing axis
of variation. Given the scope, the findings below are scoped to the **Weekday** form only, read in
full; the Saturday and Sunday forms were confirmed to exist and to differ (different psalms visible at
their own section starts, e.g. Saturday's own Psalm 50 opening at p.21 followed by a completely
different sequence reaching Psalms 64-69 by its ninth kathisma) but were not read in the same depth
given time — that remains outstanding even after this pass.

### Finding M1 — BUG: Psalm 117 does not appear anywhere in the real Weekday Midnight Office

The app declares `psalm-50`, `psalm-117`, `psalm-118` as the office's fixed psalmody. `UNABHOR1997`'s
actual sequence after Psalm 50 is: the Prayers of St. Macarius the Great (see M2), then "THE
SEVENTEENTH KATHISMA" — which *is* Psalm 118 in its entirety, read in three stases — not a separate
Psalm 117 anywhere before, between, or after. Checked specifically for it (searched the full extracted
text for "Psalm 117" and Roman/alternate renderings) and found no occurrence.

### Finding M2 — GAP: the Prayers of St. Macarius the Great are entirely missing

Directly after Psalm 50, `UNABHOR1997` gives "Prayer 1, of St. Macarius the Great" (full text present,
p.3) — the app's `[psalmody]` section goes straight from `psalm-50` to `psalm-117` with nothing between.

### Finding M3 — GAP: the closing sequence (Canon to the Holy Trinity, Psalms 120 and 133, and the true dismissal complex) is not represented

After the Kathisma, `UNABHOR1997` has a Canon (a "wise virgins"/oil-lamp themed Ode structure,
concluding in a Theotokion), then "Lord, have mercy" ×40 and "the Prayer of the Hours" (the same fixed
prayer seen in Great Compline's closing this audit), "More honourable than the Cherubim," a second "O
come, let us worship," and finally **Psalms 120 and 133** before the closing Trisagion and dismissal.
None of this — the Canon, the ×40 Kyrie/Prayer of the Hours, the second Come-let-us-worship, or Psalms
120/133 — appears anywhere in the skeleton, which jumps from its single "trisagion-prayers" placeholder
directly to the troparia and a generic closing prayer.

**Given the scope of M0-M3 together, this office needs to be substantially rebuilt against
`UNABHOR1997` rather than patched — the current skeleton represents perhaps a third of the real
Weekday office's actual content, has one wrong psalm, and doesn't yet account for the Saturday/Sunday
forms at all.**

### The rebuild, per the user's own direction: read and scope all three forms before building any of them

Read `UNABHOR1997` pp.1-45 in full — the Weekday form again in full depth (not just re-relying on the
notes above), then the Saturday form (pp.21-39) and the Sunday form (pp.40-45), neither previously read
at this depth. This surfaced the real relationship between the three forms, corrected M3, and confirmed
M0-M2 exactly as found.

**What the three day-forms actually share, and where they genuinely diverge (M0 confirmed, precisely
rather than just "three different forms")**: the Weekday and Saturday forms are **word-for-word
identical** through their opening (Usual Beginning, risen-from-sleep troparia, two opening prayers,
Psalm 50) and through all nine Prayers of St. Macarius/St. Basil plus the Final Morning Prayer (M2) —
they diverge only in which Kathisma is appointed (Weekday: the Seventeenth, i.e. Psalm 118 in full,
M1; Saturday: the Ninth, Psalms 64-69) and in the troparia sung immediately after it. From there the
two forms converge again and share their entire closing sequence verbatim (Psalms 120/133, the
repeated Trisagion, two sets of memorial troparia for the departed, a litany for protection from
calamity, mutual forgiveness, a closing Ectenia, icon veneration) — Saturday's only addition is its own
Prayer of St. Eustratius, fitting for the day traditionally kept for the departed. **Sunday differs far
more substantially**: no Macarius/Basil prayers at all, no Kathisma — instead, immediately after Psalm
50, a real Canon to the Most Holy Trinity (tone-dependent, from the Octoechos) followed by the fixed
"Hymns to the Trinity" of Gregory the Sinaite, then the repeated Trisagion, the tone-dependent Hypakoe
of the Tone, Lord-have-mercy-forty (bare, no Prayer of the Hours), and a long "Prayer to the Most Holy
Trinity" by Mark the Monk — skipping the Kathisma, Psalms 120/133, and the memorial troparia entirely.
All three forms converge again on the same closing (mutual forgiveness, Ectenia, icon veneration).

**M3 corrected, not taken on its own wording, once the fuller reading reached it**: there is no "Canon
(a wise-virgins/oil-lamp Ode structure)" anywhere in the Weekday or Saturday closing. The real content
at that position is a set of **troparia** — Bridegroom/Ten-Virgins themed, Tone 8, on Weekdays (this is
where the finding's own "wise virgins" phrase actually belongs, just misattributed to a nonexistent
Canon; the literal phrase "companion of the wise virgins" is in fact from an unrelated *opening* prayer)
— or Trinity-praise themed, Tone 2, on Saturdays. Everything else M3 named (Lord-have-mercy-forty with
the Prayer of the Hours, More Honourable, a second "O come, let us worship," Psalms 120 and 133) **is
real**, confirmed directly, just further along in the sequence than the first read had reached. The
*actual* Canon (to the Holy Trinity) exists too, but only on **Sunday**, where M3's own first-pass
reading never went — confirming M0's own point that the office's real center of gravity per day-form
is genuinely different, not a paraphrase issue.

**A further correction, not named in M0-M3 at all**: the old skeleton's `troparion-of-the-day` and
`midnight-office-theotokion` slots — resolved via the same Menaion/Octoechos machinery as every other
office in this corpus — do not correspond to anything in the real Midnight Office. Checked directly:
none of the three day-forms ever names the day's commemorated saint or cites a day-of-week/tone-keyed
Theotokion at a fixed position the way Vespers, the Hours, Typika, and Orthros all genuinely do. This
office is essentially a private monastic prayer rule with no calendar dependency at all. Both slots
removed rather than carried forward; the old `midnight-office-theotokion.json` corpus file (one string,
already correctly sourced but positioned at the wrong point in the office) deleted, its text folded into
its real position inside the memorial-troparia sequence below.

**Built**: `data/horologion/midnight-office-fixed.json` rebuilt from 6 slots to 28 — the shared
opening and Sunday's own shorter opening; all nine Macarius/Basil prayers plus the Final Morning
Prayer; Saturday's Ninth Kathisma (Psalms 64-69, all six in full); the Creed (shared); both day-forms'
own post-Kathisma troparia; Lord-have-mercy-forty with the Prayer of the Hours (shared) and its bare
Sunday counterpart; the brief Trinity prayer (shared) and Saturday's own Prayer of St. Eustratius;
Psalms 120 and 133; the repeated Trisagion; both sets of memorial troparia with their Kontakion and
Theotokia; the long memorial prayer; the calamity-protection litany and the *real* dismissal (which
fires mid-sequence in the source, not as a trailing generic rubric the way the app previously modelled
it); Sunday's own dismissal; the shared closing (mutual forgiveness, Ectenia, icon veneration); and,
for Sunday, the fixed Hymns to the Trinity (Gregory the Sinaite, built in full) and the Prayer to the
Most Holy Trinity (Mark the Monk, built in full). `psalm-118` (already correct) kept unchanged;
`psalm-117` (M1) removed. **Disclosed, not built**: Sunday's own Canon to the Most Holy Trinity and its
Hypakoe of the Tone are both genuinely tone-dependent, Octoechos-sourced content — an 8-tone corpus for
each is a separate, substantial sourcing task, not attempted in this pass; both render an honest
disclosure rubric rather than fabricated text.

`data/horologion/midnight-office.json` rebuilt with 17 sections, each tagged with the day-form(s) it
belongs to (`forDays`); `js/horologion-engine.js`'s `_resolveMidnightOfficeSlots()` now computes the
day-form from the date and prunes every section that doesn't apply before resolving anything — the
same kind of runtime branching this engine already uses for Great Lent/Holy Week/Bright Week, just
keyed on day-of-week instead of season. The pre-existing Bright Week displacement (which replaces the
whole office with a Paschal-Office rubric) is unchanged and still fires first.

**Verified**: `node --check` clean; both touched JSON files reparse clean; the rebuilt harness confirms
all three day-forms (an ordinary Wednesday, a Saturday, a Sunday) resolve `status: "complete"`, 0
placeholders, each with the correct section set for its day-form; Bright Week displacement re-confirmed
unaffected; the 5-year, 10-office, both-calendar-mode sweep (36,540 calls) is clean. Live-confirmed in
headless Chromium against the real dev server under `?shell=v2` for all three day-forms, zero
non-environmental console errors.

## SMALL COMPLINE — audited, 4 findings, FIXED 2026-09-26 (SC1, SC2, SC3, SC4)

Read `UNABHOR1997` pp.238-244 (through the day-of-week troparia table) in full. Psalms 50, 69, and 142
are correctly assigned (all three confirmed present in that exact order in the source) — not a finding.

### Finding SC1 — GAP: three fixed prayers missing between the Small Doxology and "Vouchsafe, O Lord"

`UNABHOR1997` p.240-241 gives, in order after the Small Doxology ("Glory to God in the highest..."):
"Every night will I bless Thee, and I will praise Thy name for ever..." and "Lord, Thou hast been our
refuge in generation and generation..." — both fixed texts — *before* reaching "Vouchsafe, O Lord, to
keep us this night without sin." The app's `[doxology-creed]` section has only two items (`doxology`,
`creed`) with nothing between them; whatever `doxology`'s live content actually contains needs checking
against this (not yet done at the same live-verification depth as other offices, given time — flagged
here so it isn't silently assumed fine).

### Finding SC2 — GAP: "Vouchsafe, O Lord, to keep us this night without sin" and its continuation missing

Same fixed prayer already found missing from Vespers (Finding V4) and implicated in Great Compline's
build; here too (`UNABHOR1997` p.241, continuing "Let Thy mercy, O Lord, be upon us... Blessed art
Thou, O Lord, teach me Thy statutes...") it sits between the two prayers in SC1 and the Creed. Not
represented in the skeleton.

### Finding SC3 — GAP: "It is truly meet"/"More honourable than the Cherubim" missing after the Creed

`UNABHOR1997` p.241-242, after the (deferred, Menaion/Octoechos-dependent) canon: "It is truly meet to
bless thee... More honourable than the Cherubim..." No item in the skeleton represents it, between
`creed` and the `[trisagion]` section.

### Finding SC4 — SCOPE CORRECTION, same pattern as Typika Finding T7: the day-of-week troparia are a fixed table, not Menaion-dependent

The app's `troparion-of-the-day` under `[troparia]` presumably discloses (unverified live at the same
depth as other offices, given time) a Menaion dependency matching the pattern seen everywhere else in
this corpus. But `UNABHOR1997` pp.242-244 gives Small Compline's day-of-week troparia as a **fixed
table**, independent of the Menaion: Sunday night — the Bodiless Powers; Monday night — the Forerunner;
Tuesday and Thursday nights — "Save, O Lord, Thy people" (with St. Nicholas added Wednesday); Friday
night — All Saints; Saturday night — the Resurrection troparion and kontakion in the week's own tone
(both given in full, tones 1 and 2 shown as the worked examples). Same correction as Typika T7: this
slot is not actually blocked on Menaion import the way the app's naming convention (`troparion-of-the-
day`, shared with genuinely Menaion-dependent slots elsewhere) suggests.

### Findings SC1–SC4 fixed

Re-read `UNABHOR1997` pp.239–245 in full depth (the entire Order of Small Compline through the
Saturday tone-8 troparion/kontakion) to build against, not just the excerpts quoted in the findings
above.

**SC1/SC2/SC3** — added the three missing fixed prayers to `data/horologion/compline-fixed.json`
(`sc-night-prayers`: "Every night will I bless Thee..." + "Lord, Thou hast been our refuge..."
verbatim from p.240-241; `sc-vouchsafe`: "Vouchsafe, O Lord, to keep us this night without sin..." +
"Let Thy mercy, O Lord..." continuation from p.241; `sc-it-is-truly-meet`: "It is truly meet to bless
thee..." from p.241-242) and restructured `data/horologion/small-compline.json`'s `doxology-creed`
section to interleave them in source order: `doxology`, `sc-night-prayers`, `sc-vouchsafe`, `creed`,
`sc-canon-rubric` (new disclosure rubric — the canon itself is Menaion/Octoechos-dependent and not
built here, matching this corpus's existing practice for other offices' canons), `sc-it-is-truly-meet`.

**SC4** — built the fixed day-of-week troparia table verbatim from pp.242-245 as a new function,
`_resolveSmallComplineFixedTroparion(dayOfWeek, toneResult)`: Sunday (Bodiless Powers), Monday
(Forerunner), Tuesday/Thursday ("Save, O Lord, Thy people"), Wednesday (Apostles + St. Nicholas),
Friday (All Saints + Kontakion for the Departed + Theotokion), and Saturday (Resurrection troparion +
kontakion, all 8 tones, each cross-checked verbatim against the source — including the tones not shown
as "worked examples" in the findings note above, which turned out to already be printed in full in the
source, tones 1-8 all present at pp.243-245).

**A second bug, found while verifying SC4 actually fires**: wiring the new function in behind a gate
that checked for `resolvedAs === 'weekday-theme-rubric'` (the shared Vespers-style machinery's "no
qualifying feast" fallback label) looked right by inspection, but a full-year sweep for dates where the
new branch fires found it firing on only 3 days out of the entire year, and *zero* Saturdays or Sundays
ever. Root cause: that shared machinery (`_resolveTroparionSlot`, via `_resolveFeastOverrideContext`)
lets *any* Menaion commemoration of rank 1-4 override the ordinary fallback — and rank 4 ("simple
commemoration") is documented in `documentation/menaion-v1-architecture-and-diffs.md` as applying to
nearly every date on the real calendar. On Sunday/Saturday specifically, the "no override" fallback
never even carries the `'weekday-theme-rubric'` label at all (it's `'resurrectional-troparion-sunday'`/
`'-saturday'`, Great Vespers' own baseline labels, reused here) — so the gate as first written could
never fire on those two days regardless of rank.

Re-reading pp.239-245 confirms this table is genuinely presented as fixed and calendar-day-independent
— no rubric anywhere in the Order of Small Compline mentions the day's Menaion saint overriding it (the
only saint-related rubric in this section, p.242, concerns the *temple's own patron saint*, an
unrelated and already-unmodeled concept elsewhere in this app). Since letting every rank 3-4
commemoration (i.e. nearly every day) pre-empt the fixed table would have made this fix fire on a
handful of days a year — leaving the underlying defect the finding names effectively unfixed while
looking fixed in code review — the override was narrowed to rank 1-2 only (Great Feast / Polyeleos,
the one tier where a real override is textually plausible and consistent with how much more sparingly
those ranks occur), and the gate rewritten to apply the fixed table to every other outcome
unconditionally, rather than enumerating specific `resolvedAs` strings from machinery this office
doesn't actually share the Menaion-dependency of. Verified live: 2026-01-06 (Theophany, rank 1) still
correctly shows the feast's own troparion; a full-year sweep now finds all 6 weekday entries and all 8
Saturday tones firing correctly, and the pre-existing Great Lent Triodion override (a separate,
previously-built feature, left untouched) still fires correctly on Lenten weekdays (confirmed
2027-03-16, a Lenten Tuesday).

**Test-harness bug found and fixed in passing**: the 5-year regression sweep script used office key
`'compline'` for Small Compline throughout this entire fix pass; the real key is `'small-compline'` —
`'compline'` silently falls through to `getOfficeSkeleton('compline')`, which doesn't exist, and
degrades to an error payload with `placeholderSlots: 0`, so it never flagged a regression but also
never actually exercised this office. This did not affect the validity of any *other* office's sweep
results reported earlier in this fix pass (their own keys were correct) — only Small Compline's own
sweep, run for the first time correctly as part of this fix, which now confirms 36,540 calls (5 years,
10 offices, both calendar modes), 0 exceptions, 0 placeholders. Live-confirmed in headless Chromium
against the real dev server under `?shell=v2` across all 6 weekdays, a Saturday tone, the Theophany
override, a Great Lent weekday, and Bright Monday (correctly displaced, no `troparion-of-the-day` item
at all — confirmed intentional, this office's Bright Week handling is a pre-existing, unmodified
feature), zero non-environmental console errors.

**Disclosed, not built (out of SC1-SC4's literal scope)**: `UNABHOR1997` p.241 shows a further shared
closing block after each Sunday-through-Thursday night's own troparion ("O God of our fathers, Who
ever dealest by us..." / "Adorned in the blood of Thy martyrs..." / Glory.../Kontakion for the
Departed/Both now.../"Through the intercessions, O Lord, of all the saints...") — not built here, since
none of SC1-SC4 name this slot. Also disclosed: the app's current closing content after the Trisagion
prayers (`prayer-of-basil`, `into-thy-hands`) does not obviously correspond to what pp.245+ actually
show following the troparia table (Lord-have-mercy ×40, Prayer of the Hours, "More honourable than the
Cherubim" again, a priestly blessing, the Lenten Prayer of St. Ephraim on Lenten nights, and the
Supplicatory Prayer to the Theotokos by Paul of Evergetis) — not verified or touched in this pass, since
no SC finding names it; flagged here per this project's disclose-don't-fix-opportunistically practice
for the next audit pass to pick up.
