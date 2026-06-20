# Roman Breviary 1960/1962 — Lane Architecture (Internal)

**Status:** PLANNED — architecture decision record. No corpus, no mirror, no resolver, no parser, no audit, no UI behaviour is created by this document.
**Last Recorded:** 2026-06-20
**Audience:** Maintainers / Builder / Architect
**Scope:** A single office-family **lane** document. It records the planned architecture, identity, source triage, and resolver strategy for a Traditional Roman Breviary (Rubrics 1960/1962) lane. It is *not* the Core Contract and does not change any shared layer; it sits beneath the Core Contract as one lane's posture.
**Canonical constraint:** This lane keeps its own resolver, calendar logic, rank logic, vocabulary, and structure, and meets the Universal Office shell only at the shared resolved-office output contract. Nothing here may be reinterpreted to create a cross-tradition resolver, and nothing here is a rendering, delivery, permission, or copyright control plane (that policy is governed elsewhere and is out of scope — see Core Contract §8, §15).

---

## 1. Purpose and scope

This document fixes, in writing, the intended architecture for a **Traditional Roman Breviary (Rubrics 1960/1962)** office-family lane inside the Universal Office, so that future work begins from a settled posture instead of re-deciding strategy each time.

It is **documentation-only**. Concretely, this tranche:

- imports no corpus and adds no Divinum Officium source files;
- writes no resolver, no parser, and no audit code;
- changes no UI behaviour;
- adds no broad generated daily-office snapshots;
- adds no public-rendering, permission, or copyright control-plane language.

What it does: it names the lane's internal identity, its user-facing naming posture, its source triage, its selected resolver strategy and the reason competing strategies are deferred, its minimum shippable floor, its explicit non-goals, its internal layer model, its diagnostics posture, its future phases, its audit discipline, and the governance gates that must be cleared before any corpus is ever imported.

This lane is **distinct from** the modern Roman Rite Liturgy of the Hours lane (`roman_loth`) tracked in `external_corpus_integrations`. It is an additional, honestly-deferred Latin recension lane, not a replacement for that baseline (see §11 and `project_roadmap.json → release_doctrine.not_beta_blockers_if_honestly_deferred`).

---

## 2. Conformance to the Core Contract

This lane is governed by `documentation/UNIVERSAL_OFFICE_CORE_CONTRACT.md`. In particular:

- It keeps its own resolver, calendar, rank logic, vocabulary, and structure (Core Contract §1, §3).
- It honours the non-flattening rule: 1960/1962 concepts (occurrence, concurrence, commemoration, octave, vigil, rank) are never re-expressed in another tradition's vocabulary to fit the shell (Core Contract §2).
- It emits the shared **resolved-office envelope** (Core Contract §4), carries tradition and office-family identity (Core Contract §5), composes **blocks** and **source units** (Core Contract §6, §8), uses the closed **block role taxonomy** with `other` as fallback (Core Contract §7), and records gaps as honest **diagnostics** rather than fabricating or cross-filling (Core Contract §11).
- It follows the **minimum shippable principle**: a correct, narrow, honestly-bounded lane is shippable; a wide fabricated one is not (Core Contract §13).

The Core Contract already records this lane's integration posture in its **§12 (Roman Breviary 1960/1962 integration posture)**. This document is the lane-level elaboration of that posture and must stay consistent with it.

---

## 3. Internal engine identity

The lane carries a stable internal identity. These are **engine keys**, not user-facing labels (§4):

| Field | Value |
|---|---|
| `tradition` | `roman_catholic` |
| `office_family` | `roman_breviary` |
| `edition_or_recension` | `rubrics_1960_1962` |
| primary language | Latin |

`office_family: roman_breviary` is deliberately separate from the modern Roman LOTH office family. The 1960/1962 lane resolves the traditional breviary's own structure; it does not borrow the LOTH lane's resolver, calendar, or unit identity.

---

## 4. User-facing naming posture

The lane is presented to users under recognizable, accurate names:

- **"Roman Breviary 1960/1962"** — primary precise name.
- **"Traditional Roman Breviary"** — acceptable friendly equivalent.
- **"Latin Liturgy of the Hours"** — permitted as a *friendly shorthand only*. It must **not** be used as the internal engine identity (§3 holds the engine identity), and it must not be allowed to blur this lane into the modern Roman LOTH lane.

User-facing labels live in the shell's framing/labelling layer (Core Contract §5); the engine keys in §3 never change to match a display string.

---

## 5. Source triage

The lane's source landscape is triaged once here so future work does not relitigate it:

- **`DivinumOfficium/divinum-officium`** — the **primary source corpus and source engine**. This is the canonical upstream for both the Latin source units and the day-by-day rubrical assembly this lane depends on.
- **`Geremia/divinum-officium`** — treated as a **fork / pointer only**, not the source of truth. It may be referenced for orientation but the canonical upstream is the primary repository above.
- **`2br-2b/Open-Breviary`** — **rejected as a corpus**. It is an app wrapper around iBreviary-hosted material rather than a normalizable breviary source corpus, and is not suitable as this lane's source of truth.
- **`igneus/Editio-Sti-Wolfgangi`** — a **secondary chant / booklet witness**, useful later for a chant/booklet layer (§14), but **not** the daily-office resolver corpus.

The daily-office resolver path depends on the primary Divinum Officium repository only. The other entries are, respectively, a pointer, a rejection, and a future-phase witness.

---

## 6. Source-hygiene note (one-time)

For source hygiene it is recorded that the Divinum Officium repository's README carries **MIT License** text.

This is a **one-time source-hygiene observation only**. It is deliberately **not** turned into an access, permission, delivery, or rendering-control architecture, and nothing in this document should be read as a licensing or copyright determination for any specific text. Delivery and permission policy are governed outside this lane document and are out of scope here (Core Contract §8, §15). Any actual import remains gated by §16.

---

## 7. Resolver strategy decision

Three resolver strategies were considered:

- **Option 1 — Native JavaScript reimplementation** of the 1960/1962 rubrical engine: rebuild the rubrics in JavaScript and compute each day's office live in the app.
- **Option 2 — Resolved-output import**: import only finished, pre-resolved offices with no source-unit normalization beneath them.
- **Option 3 — Hybrid Divinum-oracle manifest strategy**: mirror and normalize Divinum source units, and use Divinum's own build-time assembly output as the resolver *oracle* that says which units go where, then render through the Universal Office envelope.

**Decision: Option 3 (hybrid Divinum-oracle manifest strategy) is the initial implementation path.** This matches Core Contract §12.

---

## 8. Why Option 1 (native JS rubrical engine) is deferred

Option 1 is **not** rejected forever, but it is rejected as the *first* build path, for a concrete reason:

Divinum Officium's rubrical logic is **procedural and lives substantially in Perl**, not only in declarative data files. Faithfully reimplementing occurrence, concurrence, transfers, commemorations, octaves, vigils, and the Matins and Vespers restrictions of the 1960/1962 rubrics in JavaScript is a **major later project in its own right**, not something to attempt before any working lane exists. Building a native JS rubrical engine first would put the hardest computation ahead of a shippable result and risk silent rubric divergence from the trusted upstream.

Native-resolver research is therefore moved to a future phase, *after* a working hybrid lane exists (§14).

---

## 9. Selected hybrid strategy

The hybrid lane works as follows (consistent with Core Contract §12):

1. **Mirror** source files from a **pinned Divinum Officium commit** (a fixed snapshot, not a live pull).
2. **Parse and normalize** the Latin source units from that mirror into the source-unit shape of Core Contract §8.
3. Use **Divinum-generated build-time assembly manifests as the resolver oracle** — the manifests record which units, in which order, for which office and day, produced from Divinum's own output at build time rather than recomputed live in the app.
4. **Render** the assembled result through the Universal Office **resolved-office envelope** and **liturgical block contract** (Core Contract §4, §6), exactly like any other lane's output.
5. Allow **controlled manifest/text fallback only where unit mapping is not yet reliable**, always surfaced through **diagnostics** (§13), never as silent or fabricated content.

The rubrical computation is taken from Divinum's existing output via build-time manifests; the live app renders the assembled result. No live rubrical engine runs in the app in this path.

---

## 10. Minimum shippable floor

The lane is considered minimally shippable when it can emit valid resolved-office envelopes for:

- **Latin only.**
- The **Roman general calendar.**
- **Rubrics 1960/1962.**
- **All eight traditional hours:** Matins, Lauds, Prime, Terce, Sext, None, Vespers, Compline.
- **The current year plus the next year, precomputed.**

Explicitly **not required** for the minimum floor:

- no English layer;
- no chant layer;
- no local calendars;
- no monastic or Dominican variants.

Per the Core Contract's minimum shippable principle (§13), honest diagnostics for anything not yet resolved are acceptable; fabrication to appear complete is not.

---

## 11. Explicit non-goals

The following are explicitly **out of scope for the initial lane** and are not assumed by this document:

- no immediate native JS rubrical engine (§8);
- no English layer in the first implementation;
- no chant / booklet layer in the first implementation;
- no local calendars in the first implementation;
- **no modern Roman LOTH replacement claim** — this lane sits alongside the `roman_loth` lane and does not replace it;
- no broad daily export books and no broad generated daily-office snapshots.

---

## 12. Internal layer architecture

The hybrid lane is structured as an ordered build pipeline. Each layer is internal to the lane; only the final envelope (Layer E) is shared with the shell.

**Layer A — Source mirror layer.**
A mirror of source files from a pinned Divinum Officium commit. The pin is fixed and recorded; the lane does not pull live upstream during a build. This layer is raw upstream material, untransformed.

**Layer B — Parsed Divinum AST layer.**
The mirrored source is parsed into a structured abstract representation (AST) of the Divinum source — its sections, references, and rubric markers — without yet committing to Universal Office shapes. This layer is where upstream format is understood.

**Layer C — Normalized Universal Office source-unit layer.**
The parsed AST is reduced to **normalized Latin source units** that satisfy the source-unit contract (Core Contract §8): each unit carries a stable `key`, a `kind`, a `citation` where applicable, inline `text` or a `textRef`, and `source` provenance attributing the unit to its Divinum/breviary origin. Provenance is never erased and units are never silently relabelled (Core Contract §10).

**Layer D — Build-time assembly manifest layer.**
Divinum-generated assembly output is captured as **build-time assembly manifests**: for a given day, office, and hour, the manifest lists which normalized units (Layer C) appear, in which order. The manifest is the **resolver oracle** for this lane. It is produced at build time and is the join between upstream rubrical computation and the lane's normalized units.

**Layer E — Resolved-office envelope integration.**
For each requested day/office, the lane composes the manifest (Layer D) and units (Layer C) into the shared **resolved-office envelope** (Core Contract §4): tradition and office-family identity (§3), `context` summaries in the lane's own Latin/recension vocabulary, ordered `blocks` with the closed `role` taxonomy and lane-native `label`s, `units`, and `diagnostics`. The shell renders this envelope and reaches behind no internal layer.

---

## 13. Diagnostics and fallback rules

Fallback is **controlled and honest**, never silent.

- A **controlled manifest/text fallback** is permitted **only** where unit mapping is not yet reliable, and only with a corresponding diagnostic emitted into the envelope.
- Diagnostics use the Core Contract §11 vocabulary: `source-blocked` (in scope but not yet emittable for a recorded reason), `not-yet-mapped` (an honestly-deferred gap), and `coverage-gap` (a known, stated hole).
- **Honest degradation over fabrication** is non-negotiable: a stated gap is always preferable to invented or substituted content.
- **No cross-tradition fill:** this lane never fills a 1960/1962 gap with another tradition's native content. Borrowed material, if ever used, is an explicitly marked overlay and never a gap-filler presented as native (Core Contract §9, §10).
- Where the 1960/1962 structure genuinely appoints nothing for a position, an empty result is correct and is not an error (Core Contract §11).

---

## 14. Future phases

The following are sequenced **after** a working hybrid lane exists, not before:

- **English parallel layer** — an English text layer alongside the Latin, presented as a parallel, not a replacement of the Latin engine identity.
- **Chant / GABC / booklet witness layer** — drawing on a secondary witness such as `igneus/Editio-Sti-Wolfgangi` (§5) for chant/booklet rendering.
- **Optional native resolver research** — investigation of Option 1 (native JS rubrical engine, §7–§8), undertaken only once the hybrid lane is working and trusted.

None of these is part of the minimum shippable floor (§10) or the initial lane (§11).

---

## 15. Audit discipline

This lane runs **no broad audit campaign** and adds none here. When audits are eventually written for this lane, they are limited to **narrow checks** that protect:

- import integrity (the mirror matches the pinned commit);
- JSON validity (manifest and unit files parse);
- manifest validity (manifests reference real units and well-formed positions);
- reference resolution (`citation` / `textRef` references resolve);
- envelope conformance (the lane emits a valid resolved-office envelope, Core Contract §4).

Disciplines from Core Contract §14 apply: a strict audit is never weakened to make the lane pass; only genuinely stale expectations are advanced; and **no stale global counters** are introduced.

---

## 16. Governance gates before any corpus import

No corpus may be mirrored, parsed, normalized, or imported for this lane until the following decisions are made and recorded:

1. **Source snapshot / pinning decision** — which Divinum Officium commit is pinned as the source snapshot.
2. **Source mirror path decision** — where in the repository the mirror (Layer A) lives.
3. **Manifest format decision** — the shape of the build-time assembly manifests (Layer D).
4. **Unit ID convention decision** — the stable `key` convention for normalized source units (Layer C).
5. **Supported-year range decision** — the precomputed year range (the minimum floor of current year plus next year, §10, confirmed for the actual build).

Each gate is a prerequisite to any import work. Clearing these gates is itself outside this documentation-only tranche; this document only records that they exist and must precede corpus work.