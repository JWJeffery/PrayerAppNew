# Universal Office — Core Contract (Internal)

**Status:** Active — Phase -1 architecture record
**Last Recorded:** 2026-06-20
**Audience:** Maintainers / Builder / Architect
**Scope:** The architecture *above* every office-family lane. This is not a lane document. It does not describe Anglican, Roman, Byzantine, Ethiopian, or East Syriac resolution. It describes the contract those lanes share with the Universal Office shell.
**Canonical constraint:** Universal Office does **not** use one universal liturgical resolver. Each office family keeps its own resolver, calendar logic, rank logic, vocabulary, and structure. The Universal Office receives a shared *resolved-office output contract* from each lane and renders it. Nothing in this document may be reinterpreted to create a single cross-tradition resolver.

---

## 0. What "Phase -1" means here

The phased release plan in `project_roadmap.json` runs `phase_0` through `phase_8`. This document sits *beneath* that plan: it is the architecture every phase already assumes but had not yet written down. It is labelled Phase -1 because it predates and underlies the numbered phases. It introduces no new phase into the roadmap and adds no corpus, resolver, audit, or rendering policy. It is a contract record only.

---

## 1. Purpose

The Universal Office presents the daily offices and related devotional material across several apostolic traditions through one app shell. The temptation in any such system is to build a single "liturgical engine" that all traditions are squeezed into. That temptation is rejected here.

The purpose of this contract is to fix, in writing, the one structural decision that makes the project coherent: **the traditions are resolved independently and meet only at a shared output shape.** The shell knows how to render that shape. It does not know — and must never need to know — how any given tradition decided what to render.

This lets each tradition be liturgically honest in its own terms while the user still experiences one recognizable app.

---

## 2. Non-flattening rule

No office family may be flattened into another family's vocabulary, calendar, rank system, or structure to make it fit a shared engine.

Concretely:

- A Byzantine tone is not re-expressed as a Roman class.
- A Roman commemoration is not re-expressed as a Byzantine Menaion troparion slot.
- An East Syriac station is not re-expressed as an Anglican "office setting."
- An Ethiopian watch is not re-expressed as a Western canonical hour.

Each lane keeps its native concepts and its native words. Where the shell needs to do something generic (order blocks, label a block role, show a diagnostic), it uses the small neutral vocabulary defined in this contract — and the lane keeps its own labels alongside. The neutral vocabulary is a *thin* shared layer for the shell; it is never a replacement for a tradition's own language.

The non-flattening rule is permanent. It is the reason the project exists as a *Universal Office* and not a single-rite app with skins.

---

## 3. Resolver separation

Every office family owns, in full and on its own:

- its **resolver** — the logic that turns a date and user selections into a concrete office for that day;
- its **calendar logic** — season computation, moveable-feast computation, fast windows, cycle tracking;
- its **rank logic** — how competing observances are arbitrated (feast rank, octoechos tone cycling, commemoration precedence, station, watch, recension rubric, etc.);
- its **vocabulary** — the names it uses for offices, hours, seasons, ranks, and parts;
- its **structure** — the internal data shape and files it resolves against.

These are not shared. There is no common resolver, no common calendar service, and no common rank arbiter. The Anglican lane resolves Anglican offices; the Byzantine lane resolves Byzantine offices; and so on. A bug or rubric change in one lane's resolver must be impossible to introduce by editing another lane.

What is shared is **only the output** of each resolver, defined in §4.

---

## 4. Shared resolved-office output contract

Each lane, having resolved an office in its own terms, emits a single normalized envelope: the **resolved office**. The Universal Office shell consumes this envelope and renders it. The shell reads no lane-internal data and runs no lane-internal logic.

The envelope is a *shape*, not an implementation. The following is illustrative — field names and meaning, not code, and deliberately abstract (no corpus content):

```jsonc
{
  "tradition": { "...": "see §5" },
  "officeFamily": { "...": "see §5" },
  "context": {
    "date": "<the date this office was resolved for>",
    "calendarSummary": "<lane-native season/day summary string>",
    "rankSummary": "<lane-native rank/precedence summary string>"
  },
  "blocks": [ { "...": "liturgical block — see §6" } ],
  "overlays": [ { "...": "devotional overlay — see §9" } ],
  "diagnostics": [ { "...": "see §11" } ]
}
```

Rules of the envelope:

1. The lane fills `context` in its **own** vocabulary (a string summary the shell can show verbatim). The shell does not parse season or rank out of it.
2. `blocks` is an **ordered** list. Order is liturgical order. The shell renders blocks in the order given and does not reorder them.
3. Anything that is not native to the resolved office goes in `overlays`, never silently inside `blocks` as if native (see §9, §10).
4. `diagnostics` is first-class, not an error channel of last resort. A lane that cannot fully resolve something records it here honestly rather than fabricating content (see §11).
5. The shell must be able to render a valid envelope with empty `blocks`, empty `overlays`, and one or more `diagnostics`. Silence or a stated gap is a valid, renderable result.

A lane is conformant when, for every office it claims to support, it can emit a valid envelope of this shape.

---

## 5. Tradition and office-family identity

Two identity objects travel with every resolved office so the shell can frame it correctly without inferring anything.

**Tradition identity** answers "whose office is this?" It carries at minimum a stable tradition key and a human label, e.g. Anglican, Roman Catholic, Eastern Orthodox (Russian/Slavic Byzantine), Oriental Orthodox (Ethiopian/Tewahedo), Church of the East (East Syriac). The tradition key is stable and is the anchor for §10's distinction between native, local-variation, and overlay content.

**Office-family identity** answers "which office is this, in that tradition's own terms?" It carries the lane-native name of the office or hour (e.g. an Anglican Daily Office hour, a Byzantine Orthros, an East Syriac office, an Ethiopian watch) plus any lane-native sub-identity the lane considers part of *what this office is* (recension, use, tone, station, watch).

The shell uses identity for framing and labelling only. It does not use identity to select a resolver behaviour — the lane has already resolved before identity is read.

---

## 6. Liturgical block contract

A **block** is one ordered, renderable section of the office: an opening, a psalmody section, a reading, a canticle, a collect, an intercession, a dismissal, and so on.

Each block carries:

- `role` — a value from the **shared block role taxonomy** (§7). This is the only field the shell uses to decide generic rendering treatment.
- `label` — the **lane-native** name for this block (e.g. "First Lesson", "Kathisma", "Hulala", "Nunc dimittis"). The shell shows the label; it does not translate it.
- `units` — an ordered list of **source units** (§8). A block is composed of units; the unit is where text, citation, and provenance live.
- optional lane-native fields the lane needs to render correctly, which the shell passes through untouched.

Blocks are the join between the lane's structure and the shell's rendering. The lane decides which blocks exist, in what order, with what labels; the shell only needs the `role` to apply consistent generic treatment across traditions.

---

## 7. Shared block role taxonomy

The role taxonomy is the *thin* neutral layer that lets the shell treat structurally similar parts consistently across traditions without flattening their vocabulary (§2). A role is a generic structural category; the lane's own name for the block remains in `label`.

The shared roles are intentionally few and structural:

| Role | Meaning (generic, cross-tradition) |
|---|---|
| `opening` | Invitatory / opening versicles / introductory material |
| `psalmody` | Appointed psalmody section (psalms, kathismata, hulali, etc.) |
| `reading` | A scripture lesson or appointed reading |
| `canticle` | A canticle or appointed song |
| `hymn` | A hymn, troparion, or appointed sung text in a hymn role |
| `prayer` | Collect, oration, or appointed prayer |
| `intercession` | Litany / intercession / supplication section |
| `antiphon` | An antiphon or refrain attached to other material |
| `rubric` | A rubric or instruction shown to the user, not prayed text |
| `dismissal` | Concluding versicles, blessing, or dismissal |
| `other` | Structurally present but not matching a role above |

Rules:

1. The taxonomy is **closed by governance** (§15). A lane may not invent a new top-level role on its own; it uses `other` and, if a genuine new structural category is needed across traditions, proposes an addition through governance.
2. A role is a *structural* category only. It never encodes tradition-specific rank, season, or theology. Those stay in the lane's native fields and labels.
3. Overloading an existing role to smuggle in tradition-specific meaning is forbidden. If it does not fit, it is `other` plus a native label, not a stretched role.

---

## 8. Source unit contract

A **source unit** is the smallest attributable piece of a block: one psalm, one lesson, one collect, one antiphon, one rubric.

A unit carries:

- `key` — a stable identifier for this unit within its lane.
- `kind` — what the unit is (psalm, reading, collect, canticle, antiphon, rubric, etc.). `kind` describes the unit; the block's `role` describes the unit's structural position.
- `citation` — a reference the unit resolves against where applicable (e.g. a scripture citation or a collect key), following the existing "structure-and-keys, resolve-at-render" pattern already used by the static offices.
- `text` *or* `textRef` — inline text where the lane carries it, or a reference the lane resolves at render time. A unit is not required to embed full text.
- `source` — provenance: which tradition / witness / edition this unit is drawn from. Provenance is an **identity and attribution** field. It records *where the unit comes from* so the unit can never be silently relabelled (§10).

Scope boundary: this contract describes the **shape and identity** of a source unit only. Rendering and delivery policy are governed outside this document and are out of scope here; this contract neither defines them nor should be extended to.

---

## 9. Devotional overlay contract

A **devotional overlay** is additive material placed adjacent to an office that is **not** part of that office family's native resolution. Overlays are how the Universal Office lets a user pray a piece of devotional material drawn from one tradition alongside an office of another, or alongside extra-liturgical devotion, without corrupting either.

An overlay is carried in the envelope's `overlays` list (or as an explicitly overlay-marked unit anchored to a block position), never inside `blocks` as if it were native. Every overlay carries:

- its own `source` provenance identifying the tradition/witness it actually comes from;
- an anchor describing where, relative to the native office, it is shown (e.g. "before the first reading");
- an explicit overlay marker so the shell can present it as borrowed devotion, attributed to its real source.

**Named example — the Hudra Prayer for Understanding.** The Hudra Prayer for Understanding is an East Syriac / Hudra unit. A user praying the Anglican Daily Office may have it inserted **before an Anglican Old Testament (Hebrew Bible) reading**. In the resolved-office envelope this is a devotional overlay: it carries East Syriac / Hudra provenance, it is anchored before the Anglican lesson, and it is marked as an overlay. The Universal Office presents it as an East Syriac devotional prayer borrowed into the Anglican office — **it never claims the prayer is native Anglican content.** The Anglican lane did not resolve it; the Anglican lane does not own it; and the shell must not display it as though the Anglican office appointed it.

This is the model for all overlays: borrowed, anchored, attributed, and never relabelled.

---

## 10. Native content vs. local variation vs. devotional overlay

Three categories are kept strictly distinct. Conflating them is the central correctness risk this contract guards against.

**Canonical / native content.** What the office family's own resolver produces for that day, from that family's own books, calendar, and rubrics. It is owned by the lane and belongs to that tradition. It travels as ordinary `blocks` / `units` with that tradition's identity (§5) and the lane's own provenance.

**Local variation.** Legitimate variation *within* a tradition: a recension or edition difference, a use or jurisdictional option, an optional appointment, or an officiant choice. Local variation is **still native** — it is one of the tradition's own valid forms, not a different tradition. It is tracked as variation inside the lane (selectable options, recension fields, defaults), and it never changes the unit's tradition identity. A variant Anglican collect is still Anglican.

**Devotional overlay.** Material that is **not** native to the resolved office — most often drawn from another tradition, or extra-liturgical devotion. It is carried as an overlay (§9), always attributed to its real source, and never relabelled as native. The Hudra Prayer for Understanding before an Anglican lesson (§9) is the canonical example: not Anglican native content, not an Anglican local variation, but an East Syriac overlay.

The test: *does this tradition's own resolver, working only from its own books and rubrics, produce this for this day?* If yes and it is one valid form → native (possibly a local variation). If no → overlay, with honest provenance.

---

## 11. Diagnostics and failure states

Failure states are first-class and honest. A lane that cannot resolve something does not invent content and does not borrow another tradition's content to fill the gap.

The `diagnostics` list carries honest machine- and human-readable states such as:

- **source-blocked** — content exists in scope but the lane is not yet able to emit it for a recorded reason;
- **not-yet-mapped** — the appointment or mapping has not yet been built (an honestly-deferred gap);
- **coverage-gap** — a known hole in coverage, stated rather than hidden.

Rules:

1. **Honest degradation over fabrication.** A stated gap is always preferable to invented or substituted content. This is a non-negotiable project principle and applies to every lane.
2. **No cross-tradition fill.** A lane must never fill its own gap with another tradition's native content. (Borrowed material is only ever an explicitly marked overlay — §9 — and an overlay is never a gap-filler presented as native.)
3. **Silence can be correct.** Where a tradition's own structure means a section is genuinely empty for that day, an empty result is correct and is not an error. (The Church of the East lane already models this: a weekday with no individual commemoration shows nothing, with no fallback.)
4. The shell renders diagnostics consistently across traditions, so a gap in one lane looks and behaves like a gap in another.

---

## 12. Roman Breviary 1960/1962 integration posture

The Roman Breviary 1960/1962 lane is recorded here as planned architecture posture only. This document imports no Roman Breviary data, mirrors no source, and builds no engine. It states the intended strategy so future work has a fixed starting posture.

The 1960/1962 lane should **initially** use a **hybrid strategy**:

1. **Divinum Officium source mirror** — the lane draws on a mirror of the Divinum Officium source data rather than re-keying the breviary from scratch.
2. **Normalized Latin units** — that source is reduced to normalized Latin source units that fit the source-unit contract (§8).
3. **Divinum-generated build-time assembly manifests** — the day-by-day assembly (which units, in which order, for which office) is produced **at build time** from Divinum's own output as assembly manifests, rather than recomputed live in the app.
4. **Universal Office rendering** — the resulting resolved-office envelopes are rendered by the Universal Office shell exactly like any other lane's output (§4).

Explicit non-goal for this lane, initially: **the project is not reimplementing Divinum Officium's full Perl rubrical engine in JavaScript.** The rubrical computation is taken from Divinum's existing output via build-time manifests; the live app renders the assembled result. A native JS rubrical engine for 1960/1962 is out of scope for the initial integration and is not assumed by this contract.

---

## 13. Minimum shippable principle

A lane is **shippable** when it can emit a valid resolved-office envelope (§4) for the offices it claims to support, with honest diagnostics (§11) for anything it cannot yet resolve.

- Full corpus coverage is **not** a precondition for shipping a lane. A narrow lane that is correct and honest about its gaps is shippable; a broad lane that fabricates to appear complete is not.
- Honestly-deferred coverage is not a blocker. Deferral is recorded as a diagnostic, not hidden.
- The contract favours a correct, narrow, honestly-bounded lane over a wide, impressive, fabricated one — every time.

This principle is what lets the project add traditions incrementally without each new lane having to be "finished" before the shell can carry it.

---

## 14. Audit discipline

The audits relevant to *this contract* are conformance checks on the shape, not broad content audits, and this document adds none:

- Does each lane emit a valid resolved-office envelope (§4)?
- Are non-native units carried as marked overlays with provenance (§9, §10), never as native content?
- Are gaps recorded as honest diagnostics (§11) rather than fabricated or cross-filled?

Disciplines that govern any such checks:

1. **A strict audit is never weakened to make a lane pass.** When reality and an audit expectation disagree, the response is to advance a stale expectation or record an honest gap — never to loosen the check so failing content passes.
2. **Only stale expectations are advanced**, and only when the underlying state has genuinely changed.
3. **No broad new audits are introduced here.** This contract is a record, not an audit campaign.
4. For any **JSON file edited** in service of this architecture (e.g. the documentation manifest), the appropriate minimum is a **lightweight JSON validity check** (the file parses). Nothing heavier is implied by this document.

---

## 15. Governance rules for future office-family lanes

Any new office-family lane added to the Universal Office must:

1. **Keep its own resolver, calendar logic, rank logic, vocabulary, and structure.** The no-universal-resolver rule (§1, §3) is permanent; a new lane never adds a shared cross-tradition resolver.
2. **Emit the shared resolved-office output contract** (§4) and nothing the shell must reach behind.
3. **Carry tradition and office-family identity** (§5) so the shell frames it without inferring.
4. **Use the shared block role taxonomy** (§7) for the `role` field, falling back to `other` rather than overloading a role or inventing one ad hoc. A genuinely new shared role requires governance review and an edit to §7.
5. **Mark all non-native material as a devotional overlay** with real provenance (§9, §10), and never relabel borrowed or extra-liturgical material as native.
6. **Honour the non-flattening rule** (§2): never re-express its tradition in another tradition's concepts to fit the shell.
7. **Emit honest diagnostics** (§11) for gaps; never fabricate or cross-fill.
8. **Be recorded** in the documentation manifest / roadmap when it reaches a planning state, using those files' existing schemas — not by inventing new schema.

Changes to the shared layers in this document — the envelope shape (§4), the block role taxonomy (§7), or the native / local-variation / overlay distinction (§10) — are governance-gated. They affect every lane and are not edited casually. This document records shape and identity only; rendering and delivery policy are governed elsewhere and are out of scope here.