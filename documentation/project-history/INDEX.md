# Project History — Index

**EVERYTHING in this folder is HISTORICAL.** Nothing here is current status; the live state is `RESUME_PROJECT_NOTE.md` at the repo root. Each file below also carries a HISTORICAL marker at its top (the two JSON snapshots, which cannot, are historical by this statement).

This package is the consolidated, chronological historical record of this project, created
2026-09-28 at Josh's direction after too many different, uncoordinated mechanisms had accumulated
for tracking continuity and status (`RESUME_PROJECT_NOTE_HISTORICAL.md`, dated archive files
scattered in `documentation/`, ad hoc structure snapshots) — each invented independently, in a
different format, when whatever the current file was got too unwieldy. This index is the one place
that says what exists and where.

**If you want current project status, do not start here.** Read the live `RESUME_PROJECT_NOTE.md`
at the repo root. This package is for recovering *how* something in the past was decided or built —
narrative detail, not current state.

## What's in this package, in chronological order

| Volume | Date range | Source | Content |
|---|---|---|---|
| `VOLUME-1-2026-07-06-to-08-18.md` | 2026-07-06 – 2026-08-18 | was `RESUME_PROJECT_NOTE_HISTORICAL.md` | Anglican/BCP Daily Office work, Biblical Corpus remediation session detail, Coptic Agpeya rebuild |
| `VOLUME-2-2026-08-18-to-09-04.md` | 2026-08-18 – 2026-09-04 | was `documentation/RESUME_NOTE_ARCHIVE_2026-09-04.md` | 94 session entries archived when the live note was rewritten 2026-09-04 |
| `VOLUME-3-2026-09-04-to-09-07.md` | 2026-09-04 – 2026-09-07 | was `documentation/RESUME_NOTE_ARCHIVE_2026-09-07.md` | Was itself the live `RESUME_PROJECT_NOTE.md` for this window |
| `VOLUME-4-2026-09-07-to-09-28.md` | 2026-09-07 – 2026-09-28 | split out of the live `RESUME_PROJECT_NOTE.md` | The full session-log narrative, plus the 2026-09-07-dated standing-reference section that preceded this cleanup |
| `VOLUME-5-2026-09-28-session-log.md` | 2026-09-28 (same day) | split out of the live `RESUME_PROJECT_NOTE.md` | The note re-bloated to 879 lines within the same day as the Volume-4 split above, mixing closed session narrative back in with current material — a fourth recurrence of the exact pattern this package exists to prevent. Contains: the Defaults/Modes/Interhour-gating closeout, the profile/user-system build narrative, the Venite-screenshot confirmation, the documentation-cleanup scoping narrative, the Lucy-era scripts/ audit closeout, structure.json's closed todos, the project_roadmap.json governance-question removal, the full Task #14/#15/etc. UI-bug-queue closeout, and the EOR/OOR sanctoral sweep (including the mar-abraham/mar-abraham-of-qidun corrections) |
| `VOLUME-6-2026-09-29-to-09-30-cycle-of-prayer-and-ui.md` | 2026-09-29 – 2026-09-30 | split out of the live `RESUME_PROJECT_NOTE.md` on 2026-10-01 | Closed work only: the five rounds of UI fixes, the profile/user system, Authorized Intercessions + Communion tier, and the full Cycle of Prayer corpus ingestion (batches 1-15, roster complete), plus the closed UI-bug queue and sanctoral closeout. Opens with a list of statements later superseded (e.g. the Parish tier, wired in PR #90). |
| `VOLUME-7-2026-10-03-resume-note-retired-sections.md` | 2026-07-17 – 2026-10-02 | split out of the live `RESUME_PROJECT_NOTE.md` on 2026-10-03 | Josh asked for the note to be cleaned up and pruned (~510 -> ~220 lines). Contains the note's old header/rewrite narrative and its old "What is open" section: Menaion corpus source search and Josh's 2026-10-01 decisions, the Menaion plan-item DONE records, AGES and Orloff ingestion status, license status of unused sources, the original Anglican Synaxarium NEW TODO and the "zero rows reviewed" statement (both superseded 2026-10-02), the carried-forward and "vague/stale" item lists, and the retired-nav-audit and innerHTML notes |

Each volume's content is preserved verbatim from its source file, not rewritten — only a short
banner was added at the top of each pointing back here. Boundaries were verified directly (checked
each volume's actual first/last dated entries, and checked for date overlap) before moving anything,
not assumed from filenames.

## Other superseded documents folded in

- `SESSION_START_SCRIPT-superseded-2026-07-14.md` — was root `SESSION_START_SCRIPT.md`. Written
  2026-07-14, never updated; by 2026-09-28 it actively misled a session at the start of this one
  (named Lucy as still active — she was dismissed 2026-07-05, before this file was written — and
  framed the Bible-corpus audit as still in progress, contradicted by Josh directly). Moved here
  rather than left at the root where a future session would read it first and be misled the same way.

## Structure/governance snapshots (not narrative, kept for reference)

- `structure-snapshot-2026-05-17-ordinary-baseline.json` — was `documentation/structure-archive-2026-05-17-ordinary-baseline.json`
- `structure-snapshot-2026-05-30-roman-loth-oor-composition.json` — was `documentation/structure-archive-2026-05-30-roman-loth-oor-composition.json`

Point-in-time copies of `structure.json`, kept for recovering what governance state looked like at
those two dates. Not maintained going forward — `structure.json` itself is the live document.

## What is deliberately NOT in this package, and why

Two large documents document accomplishment/status the same way this package's sources did, but are
**left where they are, not merged in**, because they are still-live, actively-appended working
ledgers for specific ongoing subsystems, not closed history — folding them into a historical archive
would break the tool a current session actually needs:

- **`AUDIT_GOVERNANCE_LEDGER.md`** (root) — the permanent, still-growing record of every saints/
  calendar corpus decision (Coptic Synaxarium, Ethiopian Senkessar, EOR/OOR sanctoral work, SEED_VERSION
  history). Referenced directly by the archived volumes above as "the permanent record."
- **`AUDIT_SOURCE_VERIFICATION.md`** (root) — the resumable, still-open East Syriac office
  verification ledger against Maclean 1894.

This is a judgment call, not something Josh specified explicitly — flagged here so it can be
overridden if that's not what's wanted.

**`data/bible/registry/bible-corpus-remediation-ledger.md`** is a separate case: it documents
Bible-corpus trust status as of 2026-06-20 and is now known to be stale/contradicted by later
"fully done" claims elsewhere (surfaced earlier in this same session). Its disposition is being
handled as part of the full todo-inventory pass, not decided here.

## Status note, 2026-09-28

This package was built as part of a larger cleanup (see the live `RESUME_PROJECT_NOTE.md` for
current status). (Written 2026-09-28; Volumes 5-7 were added afterwards.) All four volumes were then in place, and the live note has been rewritten down to
current material only (5507 lines to ~300). **Not yet done as of this writing:** a full
line-by-line inventory of every todo across `AUDIT_GOVERNANCE_LEDGER.md` (23,523 lines),
`AUDIT_SOURCE_VERIFICATION.md`, and `data/bible/registry/bible-corpus-remediation-ledger.md` — the
live note's §7 reflects what's been verified so far (`structure.json`, `project_roadmap.json`, the
session-log split, today's live bug-report queue), not full coverage of those three documents.
