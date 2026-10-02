# Retired audits (2026-10-02)

These three audits guarded the pre-redesign UI and had been failing since the shell-v2 redesign:

- `audit-shared-mode-navigation-grammar.mjs` -- left rail toggle, per-mode drawers (including the removed Ethiopian Sa'atat mode).
- `audit-shared-office-sidebars.mjs` -- `.app-mode-drawer` CSS for the same drawers.
- `audit-app-navigation-architecture.mjs` -- the parchment-shell navigation document, whose surface sections Josh superseded on 2026-09-21 (see `documentation/universal-office-navigation-architecture.md`, header, and `UI_REDESIGN_HANDOFF.md`).

The markup and document sections they check no longer exist by design, so they were retired rather than patched.
The npm scripts `audit:app-navigation-architecture`, `audit:shared-mode-navigation-grammar` and `audit:shared-office-sidebars` were removed from `package.json`.
