# Roman Breviary 1960/1962 — Pre-Import Gate Decisions (Internal)

**Status:** ACTIVE — pre-import gate decision record.
**Last Recorded:** 2026-06-20
**Audience:** Maintainers / Builder / Architect
**Scope:** Record the five required pre-import decisions for the Roman Breviary 1960/1962 lane before any corpus mirror, parser, normalized units, build-time manifests, resolver, audit, UI, or public delivery work begins.
**Conformance:** Governed by `documentation/UNIVERSAL_OFFICE_CORE_CONTRACT.md` and `documentation/ROMAN_BREVIARY_1960_1962_ARCHITECTURE.md`. This record clears the governance gates enumerated in that architecture document's §16. It does not supersede or amend either document; it sits beneath them as a decision record.

---

## 0. Nature of this record (documentation-only)

This is a documentation-only governance record. It records decisions; it performs no import or build work. Concretely, this record:

- imports no corpus;
- mirrors no Divinum files;
- writes no parser;
- writes no resolver;
- writes no audit;
- changes no UI;
- creates no generated daily-office snapshots;
- creates no permission, public-rendering, or control-plane policy.

Clearing each gate in code or data is later-tranche work. This record only fixes the decisions so that future work begins from a settled posture rather than re-deciding strategy each time. Any actual import remains gated by these decisions and by the architecture document's §16.

---

## 1. Source snapshot / pinning decision

| Field | Value |
|---|---|
| Primary upstream | `DivinumOfficium/divinum-officium` |
| Default branch observed | `master` |
| Pinned source snapshot | `0ce8747d7dba3276fc05937635e02360b49a60a6` |

**Decision.** All future mirror/import work for the initial Roman Breviary 1960/1962 lane must use this pinned commit unless a later explicit governance record updates the pin. Builds must not pull live upstream. The pin is a fixed snapshot, not a moving branch reference.

---

## 2. Source mirror path decision

**Decision.** When the mirror is later created, the stable repository path is:

Initial schema key:

`roman_breviary_1960_1962_assembly_manifest_v1`
