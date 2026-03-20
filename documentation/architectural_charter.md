# Architectural Charter — Universal Office
**Version:** 0.3  
**Status:** Active  
**Scope:** Repository architecture, data modeling, calendar engines, saints/commemoration system, merge governance

## Changelog

- **0.3 (2026-03-19)** — Horologion engine boundary formalization:
  - Added `## 6A. Horologion Engine Boundary`.
  - Declared `js/horologion-engine.js` the deterministic orchestration and arbitration layer for Horologion offices.
  - Prohibited direct in-engine growth of large hymnographic corpora, reusable cycle systems, and duplicated resolver trees.
  - Required extraction of new global or reusable liturgical systems into helper modules and/or corpus files.
  - Formalized corpus-first expansion pattern for Orthros hymnographic families.

- **0.2 (2026-03-03)** — Documentation realignment and contracts formalization:
  - Declared `structure.json` as an operational governance ledger (consumed by admin dashboard) and documented its contract.
  - Formalized “mechanical honesty” as documentation + UI requirement (no silent fallbacks in engines; visible “not implemented” states).
  - Recorded saints normalization milestone: `data/saints/identities.json` + `data/saints/commemorations.json` as canonical source-of-truth.
  - Added COE-II as a design spec (observance-first; three-layer model).

---

## 1. Authority and Merge Governance

### 1.1 Lead Architect Authority
The Lead Architect has final approval on:
- Core data models
- Calendar engine logic and resolvers
- Saints / commemoration taxonomy and visibility rules
- Merge to `main` (and any `release/*` branches)

### 1.2 Merge Gate (Non-Negotiable)
- No changes may be merged to `main` without explicit architectural approval.
- No exceptions, including urgent fixes, unless the Lead Architect approves the exception.

### 1.3 Roles and Boundaries
- **Founder:** vision, theological direction, product direction. May propose changes. Does not bypass merge gates.
- **Builder:** implements within architectural constraints. Does not self-approve architectural changes.
- **Lead Architect:** defines and enforces architectural standards and guardrails; blocks drift; rejects hero-debug culture.

Governance is preventative, not punitive.

---

## 2. Theological Priority Principle

- Theology determines structure.
- Structure enforces theology.
- No abstraction may flatten tradition-specific ontologies for convenience.
- “Ecumenical” is a derived state; it is never used as a shortcut.

If a tradition’s internal logic differs, the system adapts to the tradition—not the tradition to the system.

---

## 3. Core Structural Model (Non-Negotiable)

The saints system is designed as a three-layer separation:

### Layer A — Identity
- Who the person is (ontological identity)
- Basic metadata and stable identifiers
- Biography pointers (where applicable)

### Layer B — Liturgical Commemoration
- When and how a tradition commemorates the person
- Calendar logic per tradition
- Rank, precedence, transfers, suppressions, and seasonality

### Layer C — Veneration / Devotional Context
- Tradition-specific devotional status and scope (local / regional / universal)
- Visibility rules and presentation constraints
- Distinctions between commemoration and devotional emphasis

**Forbidden:** boolean shortcuts that collapse layers or conflate identity with commemoration, e.g. `ANG || ECU` patterns or any equivalent “pseudo-ecumenism.”

All inclusion must be explicit and tradition-scoped.

---

## 4. Federated Rule Engines

Each tradition receives its own rule engine:
- Calendar resolver (dates, transfers, seasonality)
- Rank and precedence rules
- Classification schema for saints/commemorations

Shared utilities are allowed.
Shared ontologies are allowed only where historically justified.

Design goal is fidelity, not symmetry.

---

## 5. Freeze Policy Until Saints Logic Is Correct

Until the saints model is corrected and the COE model is properly implemented:

- No new feature work unrelated to the refactor
- No UI polish that masks structural deficiencies
- No expansion to additional traditions

Stabilize primitives first. Velocity follows.

---

## 6. Enforcement: Drift and Review Standards

### 6.1 Drift Definition
“Architectural drift” includes:
- Unreviewed data model changes
- Cross-tradition shortcuts for convenience
- Ad hoc fixes that entrench wrong abstractions
- Introducing “temporary” patterns that become permanent

### 6.2 Review Standard
Architectural approval is required for:
- Any schema changes
- Any change to calendar logic
- Any saint filtering / categorization logic
- Any changes that affect tradition scoping, commemoration, or rank precedence

---

## 6A. Horologion Engine Boundary

### 6A.1 Definition
`js/horologion-engine.js` is the deterministic orchestration and arbitration layer for Horologion offices.

It may own:
- office resolution
- `item.key` slot dispatch
- season / feast / tone arbitration
- `resolvedAs` classification
- normalized payload construction
- small helper logic tightly coupled to slot resolution

It is **not** a primary corpus layer and must not become one.

### 6A.2 Allowed In-Engine Responsibilities
The following may remain in `js/horologion-engine.js`:
- bounded slot-specific resolver branches
- localized seasonal / festal / tonal gates
- output shaping and diagnostics
- small helper functions that are tightly coupled to the engine and not independently reusable

These are considered acceptable bounded resolver patches.

### 6A.3 Prohibited Growth Patterns
The following must not be added directly to `js/horologion-engine.js` except by explicit architectural exception:
- large hymnographic corpora
- long inlined tone-by-tone or day-by-day text maps
- new standalone liturgical cycle systems
- duplicated arbitration logic across multiple slot families
- reusable logic that could be shared by a helper or module
- logic that is naturally corpus-owned but embedded inline for convenience

If introduced inline, this constitutes architectural drift.

### 6A.4 Mandatory Extraction Triggers
Extraction is required when a proposed change introduces:
- a new cycle or indexing system
- a reusable liturgical subsystem
- repeated tone/day/theme selection logic across branches
- more than one long conditional tree for the same slot family
- arbitration logic spanning multiple offices or multiple hymnographic families
- enough new logic that the implementation is no longer naturally understandable as a local slot patch

In such cases, the new logic must be implemented as:
- a dedicated helper module, and/or
- a dedicated corpus/data file

The engine must call these systems, not absorb them wholesale.

### 6A.5 Preferred Horologion Expansion Pattern
Horologion expansion must prefer this order:

1. Define or extend corpus in dedicated data/corpus files.
2. Add helper/module if a new isolated system is introduced.
3. Add a minimal engine hook to dispatch, arbitrate, and shape output.

The engine orchestrates corpora and helpers. It does not store or own them wholesale.

### 6A.6 Orthros-Specific Application
This rule applies especially to Orthros hymnographic expansion.

Families such as:
- Praises
- Exapostilarion
- Sessional Hymns
- Canon

must grow through corpus-first implementations with bounded resolver hooks.

Major systems, especially those requiring separate cycle computation or multi-family arbitration, must not be embedded wholesale into `js/horologion-engine.js`.

### 6A.7 Stability Principle
Engine growth is acceptable when:
- the change is bounded to a single slot family
- the logic remains locally understandable
- no reusable subsystem is embedded inline
- verification remains straightforward

Engine growth is not acceptable when it materially increases:
- cross-branch coupling
- duplicated logic
- stale-branch risk
- hidden fallback behavior
- regression difficulty

In such cases, extraction is required regardless of implementation convenience.

---

## 7. Amendments

This charter may be revised only through:
- A documented change proposal
- Explicit approval by the Lead Architect
- Merge to `main` with version bump

---

## 8. Octoechos Corpus Schema

Octoechos hymnography in the Universal Office project is stored using a normalized namespace structure.

The standard pattern is:

window.OCTOECHOS.<office>.<family>.<case>.tones

Example:

window.OCTOECHOS.orthros.praises.sunday.tones

Each tone (1–8) contains the hymnographic items for that family.

Where the item structure is repetitive, the corpus may store simple string arrays and allow the resolver to inflate them into richer objects during runtime.

This approach reduces corpus size and keeps the hymnographic data readable while maintaining a consistent resolver contract.

---

## 9. Byzantine Tradition Profiles

The Universal Office Horologion is designed to support multiple Byzantine liturgical traditions.

The first fully implemented baseline recension is the Slavic Byzantine tradition. This baseline provides the initial corpus and resolver reference.

Future profiles (for example Antiochian or Greek usages) will be implemented through profile-specific corpora and rubrical overlays rather than through separate engines.

The office structure and resolver framework remain shared wherever possible.

---

## 10. Octoechos Tone Computation

The Octoechos tone of the week is computed algorithmically from Pascha rather than stored by date.

The governing rule is:

- Tone 1 begins on Thomas Sunday.
- The tone advances by one each week.
- After Tone 8, the cycle returns to Tone 1.
- Bright Week suspends the ordinary Octoechos weekly cycle.

This means hymnographic corpora store texts by tone, while the calendar engine supplies the tone index for a given date.

---

## 11. Liturgical Education Layer

The Universal Office is intended not only for devotional use but also for liturgical formation.

Educational explanation is therefore a first-class architectural layer.

Three explanatory depths should be supported:

1. **Micro-explanation** — short tooltip or inline gloss answering “what is this?”
2. **Structural explanation** — short expandable explanation answering “how does this fit into the office?”
3. **Tradition explanation** — broader comparative explanation answering “how does this tradition work, and how does it differ from others?”

Educational content must preserve tradition-specific logic and must not flatten distinctions between traditions for convenience.