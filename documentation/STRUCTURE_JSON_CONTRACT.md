# structure.json — Canonical Contract (Internal)

**Status:** Active  
**Last Realigned:** 2026-03-03  
**Audience:** Maintainers / Builder / Architect  
**Role:** Canonical governance + documentation ledger. Also consumed at runtime by the Admin Dashboard (todos + version display).

## 1. What structure.json is

1) The authoritative, human-edited project ledger for:
- release metadata (`project_manifest`)
- governance pointers (`governance`)
- roadmap and milestones (`roadmap_summary`, `recent_logic_changes`)
- known issues (`known_outstanding_issues`)
- saints workflow metadata (`saints_model`)
- admin devtool configuration (`admin`)

2) A runtime-consumed configuration source for `admin/admin.html`:
- Top To-Dos panel reads `admin.todos`
- Version display reads `project_manifest.version` and `project_manifest.operational_status`

## 2. What structure.json is NOT

- It is not a liturgical content store.
- It must not contain canonical office text, scripture, or full saint biographies.
- It must not contain runtime state (no “currentDate”, no cached payloads).
- It must not become a dumping ground for speculative notes. Put deep design work in `documentation/*`.

## 3. Top-level keys and ownership

### project_manifest (manual)
Release ledger. Must be updated when:
- a version is cut
- operational status meaningfully changes
- audit findings change

Required fields:
- `name`
- `version`
- `last_updated`
- `operational_status`

### active_modules (manual)
Declarative list of enabled engines/modes.

### known_outstanding_issues (manual)
Authoritative issue registry. Prefer deterministic, testable phrasing.

### recent_logic_changes (manual)
Changelog-like record. One entry per meaningful change.

### roadmap_summary (manual)
Single paragraph summaries:
- completed
- next_required
- next_planned
- future

### governance (manual)
Pointers to governance documents. Must include charter path + version.

### saints_model (manual)
Declares:
- canonical source-of-truth files
- any generated caches
- generator tooling name
- workflow rules

### admin (manual)
Development-only configuration.
- `admin.todos` is the canonical To-Do list used by Admin Dashboard.
  Each todo requires: `id`, `title`, `description`, `severity`, `status`, `area`.
  Optional: `phase`.

## 4. Edit discipline

- Treat edits as “merge-gated” changes.
- Do not remove historical milestones; append to `recent_logic_changes`.
- Keep To-Dos small and actionable; move long design narratives into `documentation/*`.
