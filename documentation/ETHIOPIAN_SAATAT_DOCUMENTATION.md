# ETHIOPIAN SA'ATAT — REMOVED (2026-08-18)

**This office was removed from the application on 2026-08-18. It is no longer
implemented anywhere in the codebase.** This file previously documented it in
detail (590 lines) and claimed "Production Status: OPERATIONAL" — that claim
is false as of this removal and the prior version of this file has been
deleted to avoid leaving a stale, misleading document in the repo.

## Why it was removed

The structure documented in the prior version of this file — nine fixed
3-hour watches, each with a fixed 3-psalm set, keyed purely to local clock
time — does not match the historically attested Sa'atat of Abba Giyorgis of
Segla, which Ethiopian Orthodox Christians actually pray. The real Sa'atat is
lesson-based: four scripture readings with a responsorial psalm before the
last (always a gospel at Nocturns), organized as Nocturns, the Eleventh Hour,
and a separate Twelfth Hour Marian office — not a clock-time psalm rotation.

What was built instead structurally resembles the **Coptic Agpeya** (which
genuinely does have a 7-hour, fixed-psalm-per-hour shape) with Ge'ez
vocabulary layered on top — not the real Ethiopian office. No adequate free
English source for the actual Giyorgis Sa'atat was ever found (only
commercial devotional compilations, nothing citable), so rather than ship
content built on a fabricated premise, the decision was made to remove it
entirely.

## What replaced it

Per Josh's direction, this slot is being rebuilt honestly as the **Coptic
Agpeya**, sourced from De Lacy O'Leary's public-domain 1911 *The Daily Office
and Theotokia of the Coptic Church*. The Oriental Orthodox tradition family
label is retained (the Coptic Orthodox Church is part of that communion),
but the office itself is now correctly identified as the Agpeya, not
conflated with Ethiopian content.

## What was NOT removed

- `data/synaxarium/ethiopian/*` and `senkessar-index.json` (the Ethiopian
  Senkessar/saints calendar) — real, Budge-sourced, substantially audited
  content, left parked as its own standalone thing pending a future
  Ethiopian office.
- `data/bible/ET/*` — the entire Ethiopian broader-canon Bible corpus
  (Jubilees, 1-3 Meqabyan, Tizaz, Abtilis, Guba'ekana, etc.) — unrelated to
  the Sa'atat's structural problem, untouched.
- `js/calendar-ethiopian.js` — the Ethiopian-to-Gregorian date conversion
  engine — never proven wrong, orthogonal to this removal.

## Full detail

See `AUDIT_GOVERNANCE_LEDGER.md`'s entries dated 2026-08-18 for the complete
deletion scope and rationale, and the original architecture-planning
conversation for the full decision history.
