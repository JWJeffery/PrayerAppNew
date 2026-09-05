# Open Items — Fixability Classification

**Created 2026-09-04.** This file exists because "is this item blocked?" was twice answered wrongly
in a single session, both times from recollection rather than from checking. It records, for each
open item, **what the item actually needs and whether that thing is reachable**, so the question does
not have to be re-litigated by guesswork every session.

**How to use it.** Before starting an open item, look it up here. If it is marked BLOCKED, do not
start it and do not try to "just check whether the source is reachable" — the reachability findings
below were established by direct probe and are recorded so the probe is not repeated. If the
blocking condition has since changed (Josh supplies pages, a licence lands), update the row.

**What this file is not.** It is not a priority order and not a plan. It is only a statement of what
stands in the way of each item.

---

## Part 1 — Source reachability, established by probe

These findings gate most of the content items below. All were established by direct attempt, not
assumption.

| Source | Route | Reach | Established |
|---|---|---|---|
| **Maclean 1894** | Google Drive `read_file_content` (`East-Syrian-Daily-Offices---Maclean.pdf`) | **Front matter through printed p.34.** Truncates mid-"FIRST WEDNESDAY". | Probed twice, 2026-09-04 |
| Maclean 1894 | ACOE California PDF mirror, direct fetch | ~p.45, then hard truncation | Previously documented; **do not retry** |
| Maclean 1894 | archive.org `_djvu.txt` | Truncation wall regardless of token limit | Previously documented; **do not retry** |
| **O'Leary 1911** | Google Drive `read_file_content` (`DO 1-124 small.pdf`) | Full Introduction §§I–XV plus the office texts | 2026-09-04 |
| O'Leary 1911 | `download_file_content` | **Unusable** — hard 10MB cap, file is 40MB | Previously documented |
| **Hapgood 1906** | archive.org `_djvu.txt` | Front matter only; Appendix B unreachable | 2026-09-04 |
| Hapgood 1906 | Josh upload | Appendix B pp.592–615 supplied | 2026-09-04 |
| **BCP 1979** | In repo, `data/kalendar/source-witnesses/` | Full, PDF page = printed page | Established earlier |
| **ODCC** | In repo | **Unusable** — no text layer at all, pure image scan, no OCR | Previously established; **do not re-propose** |
| **Lambertsen Octoechos** | — | In copyright to ~2087. Consultable and citable, not reproducible. Foundation has announced an intended free public licence; **not confirmed landed as of 2026-09-04** | 2026-09-04 |

**The practical consequence, stated plainly:** *any* item requiring Maclean beyond printed p.45
is blocked on Josh supplying pages, and no amount of retrying will change that. The Hapgood
Appendix B upload is the working precedent for how to unblock this kind of item.

---

## Part 2 — Items BLOCKED on Josh supplying Maclean pages

Each of these needs pages past the p.34/p.45 reachability boundary. They are otherwise ready:
the corpus is in place, the audit method is established, and the work would proceed immediately.

| Item | Pages needed | Notes |
|---|---|---|
| ~~Ferial Morning Service dedicated audit~~ **DONE 2026-09-04** | pp.103–108 | Josh supplied the pages; audit complete, two defects found and fixed. See dashboard `esy:sapra:ferial-morning-audit`. |
| ~~First/Middle Friday audits~~ **DONE 2026-09-04** | pp.41–49 | Content exact; a systemic seasonal-rubric defect was found and partly swept. Middle Friday remains unwired — needs the Kalendar appendix, not these pages. |
| **NEW** — seasonal-rubric sweep, 7 components | pp.37, 50–51, 57, 59, 63, 65–66, 67 | Each carries a disclosed-gap note. Not fixable by analogy: Wednesday genuinely differs. |
| Great Fast's own Sunday Evening Service | pp.206–211 | |
| Farcings loose ends — Ps.100 "In the beginning" variant; Palm Sunday Ps.96–98 fit | pp.236–248 | |
| Pre-Fast Sunday folding rule | Kalendar appendix, pp.264–283 | Flagged from the appendix, never modelled |
| Layer 3 East Syriac saints calendar | pp.264–283 | Kalendar appendix |

**Precedent, 2026-09-04:** Josh supplied pp.103–108 within hours of this file being written and the
Ferial Morning Service audit ran to completion the same day, finding and fixing two real defects.
The upload route works and is the way to move any of the remaining rows.

**DONE 2026-09-04:** Josh supplied pp.164–184 and pp.211–224; the Fast and Festival Morning
Services were audited the same day and three corrections made across the eight sequences. See
dashboard `esy:sapra:fast-and-festival-morning-audit`.

**Remaining Maclean-dependent rows** are the First/Middle Friday audits (pp.41–43, 48–49), the
Great Fast's own Sunday Evening Service (pp.206–211), the two Farcings loose ends (pp.236–248), and
the Pre-Fast folding rule plus the Layer 3 saints calendar (both pp.264–283).

---

## Part 3 — Items BLOCKED on something other than page supply

| Item | What actually blocks it |
|---|---|
| **Royal Anthem sourcing** | Copyright. Two live options, neither authorised: OIRSI/Moolan permission request, or disclosed machine translation from Bedjan's public-domain Syriac. **Needs Josh's decision, not research.** |
| **Cathedral/Monastic axis** | Research, and the repo already says so. `components/traditions/east-syriac/rubrics.json` records that this axis was **deleted** because Maclean does not describe two parallel forms of each hour the way the old build assumed — he describes one ferial form and, separately, festival/Sunday/memorial forms. The note says the distinction must be researched before rebuilding, not assumed. **The Sunhadus material in Maclean's Introduction is about which offices are obligatory and at what length — it is NOT a per-hour variant axis, and must not be used as if it were.** |
| **Coptic Prayer of the Veil** | O'Leary has seven hours and does not contain it. Needs a different Coptic edition; none identified. |
| **Horologion splash wiring** | Full audit, per Josh 2026-09-04. Not a sourcing problem. |
| **Whether ACE moved Denkha and Cross to Gregorian** | Needs a current ACE/ACOE authority, not a historical source |
| **Mar Daniel the Physician** | Unruleable from data; needs judgement |
| **Mar Mushi / St Jacob the Recluse** | Held FIXED pending the zero-Moses-year answer |

---

## Part 4 — Items that are genuinely NOT blocked

These need no new source and no decision from Josh. They can be started at any time.

| Item | What it needs |
|---|---|
| **2038/2095 season overlap** | Engine reasoning plus Node simulation against real dates. Self-contained. |
| **`ordinary1/2/3.json` architecture review** | Repo reading. Was deferred until other corrections landed, not blocked. |
| **Admin dark-mode toggle** | Known defect, in-repo fix |
| **Dead `config.heading`** | Known defect, in-repo fix |
| **Empty-`tags` rows** | Known defect, in-repo fix |
| **Navigation governance conflict** | A decision for Josh — uniform headings vs. the navigation doc permitting local naming. Logged, unresolved, needs no research. |
| **Education-layer coverage extension** | Content work within sources already held. Coverage currently ~49% (Coptic titles) to ~57% (East Syriac components). Deliberately excludes generic headings and individual psalm citations. |

---

## Part 5 — Awaiting a decision from Josh, no work possible until then

| Item | The decision |
|---|---|
| **Book of Needs role ladder** | Whether to extend toward the full 8-role access-tier ladder in `book-of-needs-role-access-governance.json` |
| **Royal Anthem** | Which of the two sourcing routes, if either (see Part 3) |
| **Minor hours scope (East Syriac)** | Per `rubrics.json`: keep minor hours out of scope entirely, matching how Maclean scopes them, or find a separate source for full monastic minor-hour texts. Maclean's own stated scope excludes the Khudhra/Geza/Kashkul where such material would live. |
| **Navigation headings** | See Part 4 |

---

## Standing lessons this file encodes

1. **Reachability is a property to be probed, not recalled.** Two items were called unblocked in one
   session on the strength of memory; both were blocked. The probe costs one tool call.
2. **A source being in Drive does not mean an arbitrary page of it is reachable.** Maclean is fully
   present in Drive and still truncates at p.34.
3. **When the repo and a stored note disagree about whether something is blocked, the repo wins.**
   The Cathedral/Monastic axis is the worked example: the note said dead control, the repo said
   deliberately deleted pending research, and the repo was right.
