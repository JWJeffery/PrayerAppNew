# RESUME_PROJECT_NOTE.md

**Paste this at the start of a new conversation.** It is a handoff document, not a history. The
permanent record of every decision lives in `AUDIT_GOVERNANCE_LEDGER.md`; the classification of what
blocks each open item lives in `documentation/OPEN_ITEMS_FIXABILITY.md`. **Where this note and the
repo disagree, the repo wins** — it may have moved since this was written.

This note was rewritten on 2026-09-04. The previous version had accumulated 94 session entries over
~4,700 lines and had stopped being usable as a handoff. Its contents were checked against the ledger
before replacement: 59 entries existed **only** in the resume note, so the whole of the old note is
preserved verbatim at `documentation/RESUME_NOTE_ARCHIVE_2026-09-04.md`. Nothing was discarded.

**State as of 2026-09-05:** `SEED_VERSION v231`, East Syriac corpus 448 components / 57 sequences,
explanations harness 67 checks passing. `SEED_VERSION` lives in **one place only** — a `const` near the
bottom of `audit-ledger.html` (search the file for `const SEED_VERSION`). It is not a standalone file
and not in `index.html`. The HEAD hash is deliberately not recorded here; it goes stale within a
session. Run `git log --oneline -1` against a fresh clone instead. Cache-bust params are currently
`office-ui.js?v=219`, `prayers.js?v=206`.

---

## 1. First thing to do, every session

**Read the full repo and the governance documentation before any analysis or build work.** This is
the most consistently enforced rule on the project and prior instances have repeatedly failed it. In
particular read `AUDIT_GOVERNANCE_LEDGER.md`, `documentation/OPEN_ITEMS_FIXABILITY.md`, and
`documentation/UNIVERSAL_OFFICE_CORE_CONTRACT.md`.

**Do not trust this note, or any stored memory, about whether something is blocked.** That question
was answered wrongly twice in one session from recollection. `OPEN_ITEMS_FIXABILITY.md` exists
because of it. Check there first — **and check it against the ledger.** On 2026-09-05 that file was
found carrying two rows as "blocked" which the ledger had closed five days earlier, and the
2026-09-04 rewrite of this note copied the error forward. The fixability file records what blocks an
item; it is not proof the item is still open.

---

## 2. Who and what

Josh (GitHub `JWJeffery`) owns **PrayerAppNew** / "The Universal Office" — a free, non-commercial
multi-tradition liturgical prayer web app at theuniversaloffice.com. He is not a coder. Four
traditions: Anglican (BCP 1979), Coptic (Agpeya), Church of the East (East Syriac), Byzantine
(Horologion).

A prior assistant, **Lucy**, was dismissed for falsely certifying content as accurate. All Lucy-era
certifications are void and must be independently re-derived. Nothing in this repo's own docs or
`structure.json` counts as evidence; verify against primary sources.

---

## 3. Workflow — non-negotiable

- Claude generates patches with `git format-patch`; **Josh applies them.** Claude never pushes.
- Surface the two lines ready to copy-paste, with no walkthrough:
  ```
  git am <exact-patch-filename>
  git push origin main
  ```
- **Always build the patch against the verified current `origin/main`.** Clone fresh and check
  `git log --oneline -1` first.
- If `git am` fails, the usual cause is re-running an already-applied patch. Clear with
  `git am --abort 2>/dev/null; rm -rf .git/rebase-apply`, then check whether origin already has it.
- **Never use `json.dump()`** — it reformats whole files. Targeted string replacement only.
  **Validate JSON before writing**, not after; a regex that stops at an escaped quote will corrupt a
  file otherwise.
- Cache-bust params in `index.html` (`?v=NNN`) must be **bumped manually** whenever
  `js/office-ui.js` or `js/prayers.js` changes. Currently `office-ui.js?v=217`, `prayers.js?v=206`.
- `AUDIT_GOVERNANCE_LEDGER.md`, this note, `audit-ledger.html` and `SEED_VERSION` are updated **in
  the same commit** as the fix, never batched later.

---

## 4. Standing content rules

- Every component cites a specific source page. Gaps are **disclosed** in component metadata and on
  the dashboard, never filled by guessing.
- **Sweep the class, don't fix the instance.** When one instance of a bug is found, check every
  sibling programmatically.
- **But do not sweep on assumption.** Twice this project has been saved by refusing to apply a rule
  to components whose pages were not held. The Wednesday Evening Anthem is the standing
  counter-example: it genuinely differs from every other weekday, so a blind sweep would have
  introduced an error into a correct component.
- Reused components are verified by direct text comparison, never assumed from title similarity.
- Node simulation against real dates before committing any calendar or engine logic.
- Scope and architectural decisions are Josh's. Record conflicts for deliberate resolution rather
  than overriding them silently.
- Work continues until finished. Do not treat content-complete as done while defects remain.

---

## 5. Communication

Josh is extremely direct. Correct errors immediately, without softening or justification. No
walkthroughs of commands he already knows. **Ask directly and specifically for what you need** — his
words: *"I don't provide shit I'm not asked for. I'm not a mind reader."* Naming an exact page range
gets it supplied, usually within minutes. Read pushback as an instruction to work harder.

---

## 6. Source reachability — probed, not assumed

| Source | Reach |
|---|---|
| **Maclean 1894** via Drive `read_file_content` | Front matter through printed **p.34** only |
| Maclean via ACOE mirror / archive.org | ~p.45 / hard wall. **Do not retry either.** |
| **O'Leary 1911** via Drive `read_file_content` | Full. `download_file_content` is unusable (10MB cap, 40MB file) |
| **Hapgood 1906** | archive.org gives front matter only; Appendix B came from Josh |
| **BCP 1979** | In repo, complete |
| **ODCC** | In repo but **no text layer at all**. Do not re-propose. |
| **Lambertsen Octoechos** | In copyright to ~2087; citable, not reproducible |

**Any item needing Maclean past p.45 is blocked on Josh supplying pages.** Retrying will not change
it. Uploading works and is fast — pp.41–49, 103–108, 164–184, 211–224 and 264–283 were supplied this
way on 2026-09-04, and **pp.37–67 on 2026-09-05**; each unblocked real work the same day.

---

## 7. What is open

### Blocked on Maclean pages
**Nothing.** As of 2026-09-05 no open item is waiting on a Maclean page. Josh supplied pp.37–67 and
pp.96–98 / 206–211 / 236–248 the same day, which closed the last three rows. The one surviving
Farcings item — the Ps.100 "In the beginning" variant — needs the **Khudhra**, not Maclean, and
never was a Maclean question.

### Unblocked — startable now
- **Layer 3 East Syriac saints calendar.** The Kalendar appendix (pp.264–283) is now held. Josh's
  rule: any saint not verifiable through ACOE/ACE diocesan calendars or sanctoral books is to be
  **removed, not left bare**.
- **Pre-Fast Sunday folding rule — implementation.** The complete cascade is recorded in
  `components/traditions/east-syriac/rubrics.json` under `kalendar-rules-maclean-264-283`. Needs the
  count of Sundays after Epiphany per year plus Node simulation.
- **2038/2095 season overlap**; **`ordinary1/2/3.json` architecture review**.
  *(Dead `config.heading`, `#generic-tradition-label`, the untagged sanctoral rows and dark-mode
  parity were all cleared 2026-09-05 — see §8.)*
- **Education-layer coverage extension** — currently ~49% of Coptic titles to ~57% of East Syriac
  components. Generic headings and individual psalm citations are deliberately unmatched.

### Blocked on something other than pages
- **Royal Anthem sourcing** — copyright. Two routes, neither authorised: OIRSI/Moolan permission, or
  disclosed machine translation from Bedjan's public-domain Syriac. **Josh's decision.** Note that
  Maclean p.49 prints a "Royal Anthem" but it is a *ferial* Middle Friday alternative whose name U.
  omits; it does **not** touch this item, which concerns the Sunday propers in the Khudhra.
- **Cathedral/Monastic axis** — needs research. `rubrics.json` records that the axis was **deleted**
  because Maclean does not describe two parallel forms of each hour. The Sunhadus material is about
  which offices are obligatory and at what length; it is **not** a per-hour variant axis and must not
  be used as one.
- **Coptic Prayer of the Veil** — absent from O'Leary; needs a different edition.
- **Horologion splash wiring** — Josh: needs a full audit, not there yet.
- ACE Denkha/Cross Gregorian question; Mar Daniel the Physician; Mar Mushi / St Jacob (pending
  zero-Moses-year).

### Awaiting Josh's decision
- **Book of Needs** — whether to extend to the full 8-role access ladder.
- **Navigation governance conflict** — the navigation doc permits local panel naming; Josh has
  directed uniform "Office Settings" headings. Logged, unresolved.
- **Minor hours scope (East Syriac)** — keep out of scope, matching Maclean, or find a separate
  source for full monastic minor-hour texts.
- **Fast display title** — in a fast office a component titled "Prayer before the Martyrs' Anthem"
  now sits next to a note saying that Anthem is not said in the Fast. That is what the source does,
  but it reads oddly. A fast-specific title is Josh's call; the existing title is correct in six of
  the eight places it appears.

---

## 8. Settled — do not reopen

- **Charter §11 is CLOSED.** All four traditions carry all three explanatory depths, no scaffolds:
  Anglican 23 entries (BCP 1979), Byzantine 38 (Hapgood 1906), East Syriac 30 (Maclean 1894), Coptic
  28 (O'Leary 1911).
- **Depth default:** depth 1 on, higher depths user-selectable. Already shipped. Confirmed by Josh.
- **Middle Friday = the Friday of the FOURTH week of the Great Fast** (Kalendar pp.270–272). Wired.
  No `NOT-YET-WIRED` sequence remains anywhere.
- **Fast Evening Service is built** (pp.211–213, 220) and renders p.212's order exactly.
- **Coptic disclosure:** O'Leary states the Coptic Office was never introduced into the parish
  churches. Every Coptic depth-3 statement is explicitly about **monastic** use.
- **GREEN promotion criteria:** Josh stated (2026-08-18) that "documented human verification against
  a named primary source" was never an actual requirement. If it comes up, **ask him** rather than
  asserting a rule.
- Sidebar headings are uniformly "Office Settings". All screens have a dark-mode toggle. The "I'm not
  sure" splash option routing to Anglican is intentional. In-office tradition selectors are
  forbidden.
- **Do not use git authorship as provenance evidence** in this repo — Josh applies every change, so
  authorship cannot discriminate.
- **Seasonal-rubric sweep is CLOSED** (2026-09-05). All seven remaining Evening Anthems carry
  Maclean's `[Varies ... the season.]` rubric, restored from pp.37–67 directly. **p.57 prints
  "Varies *according to* the season"** where the other six print "Varies *with*" — that is a real
  variant, kept verbatim; do not normalise it. Wednesday (pp.30-31) genuinely has no such rubric and
  stays without one.
- **p.49 and p.65 "Royal Anthem" do NOT unblock the Royal Anthem item.** Both are ferial weekday
  alternatives; the open item is the Sunday/festival Royal Anthems in the Khudhra, outside Maclean.
- **There is no separate Great Fast Sunday Evening Service.** Settled 2026-08-30, re-confirmed from
  the page 2026-09-05: p.211 opens "WEEKS OF THE MYSTERIES IN THE FAST **[On Week Days]**" straight
  after the Sunday Morning Service. Fast Sundays use the ordinary Festival Evening Service. Do not
  reopen this as a missing-content question.
- **The Farcings reference is verified.** `esy-farcings-of-the-psalms-reference` was checked end to
  end against a clean scan of pp.236–248 on 2026-09-05 — all 150 psalms, four canticles, twelve
  "Or" alternatives and all twenty-two Ps.119 clauses correct. Despite being transcribed in the same
  session as the fabrication incident, it is sound.
- **Dark mode is on every surface.** `index.html`, `admin/admin.html`, `audit-ledger.html` and
  `synaxarium-review/index.html` all carry a `data-app-dark-toggle` control. The three standalone
  pages cannot call `applyDarkMode()` and reproduce the 2026-09-03 boot rule inline. **Boot must
  never write to storage** — it passes `persist=false` so the OS preference is re-read each visit.
- **The 170 untagged sanctoral rows are deliberate, not debris.** Each carries a `tagsGap` field
  explaining it is a retained-but-unsourced Layer 3 identity. Do not sweep them.
- **A documented rule is not an enforced rule.** The Motwa close carried its own "except in the Fast
  and the Rogation of the Ninevites" note from the day it was built, and the Rogation half was
  enforced nowhere for months. When a component's metadata states a condition, check the renderer
  actually applies it.

---

## 9. Useful specifics

- Fresh clone: `git clone https://github.com/JWJeffery/PrayerAppNew.git`
- Explanations harness: `node scripts/explanations/verify_explanations.js` (needs
  `npm install jsdom --no-save`; remove `node_modules` and restore `package-lock.json` before
  committing).
- Integrity check worth running after any sequence edit: zero dangling component refs, zero duplicate
  ids, all JSON valid, `node --check js/office-ui.js`.
- The Fast Ramsha sequences use placeholders `__DAY_FIRST_SHURAYA__`, `__DAY_SECOND_SHURAYA__`,
  `__DAY_EVENING_ANTHEM__`, resolved in `js/office-ui.js` by **substring match against the day's own
  ordinary ramsha sequence** — not a hardcoded map, because per-day/per-cycle ids are not uniformly
  named. An unresolvable marker fails loudly by design.
