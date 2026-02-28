# Architectural Charter — Universal Office
# Architectural Charter — Universal Office
**Version:** 0.1 (Draft)  
**Status:** Active upon merge to main  
**Scope:** Repository architecture, data modeling, calendar engines, saints/commemoration system, merge governance

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

## 7. Amendments

This charter may be revised only through:
- A documented change proposal
- Explicit approval by the Lead Architect
- Merge to `main` with version bump