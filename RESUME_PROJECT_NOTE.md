# RESUME_PROJECT_NOTE.md

**Read this file in full via bash (not the view tool) before starting any work, and read to the
actual end -- not just until the first "DONE" marker.** Verify actual pushed state against a fresh
clone before beginning. Full historical detail for everything summarized below lives in
`RESUME_PROJECT_NOTE_HISTORICAL.md` -- this file was trimmed back down on 2026-08-19 (was 3200
lines) following the same practice used the last time it grew too large.

Session continuity for this project flows through this file and `AUDIT_GOVERNANCE_LEDGER.md`
(governance/audit history) plus `audit-ledger.html` (the live dashboard). These are authoritative;
memory across sessions is not.

---

## Where things stand right now (as of 2026-08-19)

**Biblical corpus (OT/NT, five translations):** fully remediated, zero known defects, closed.

**BCP Daily Office:** engine audit complete, multiple defects found and fixed (Ordinary Time
date-matching, Holy Days lectionary, Deuterocanon schema mismatch). `engine:office-ui-core` marked
GREEN after a full read-through of `js/office-ui.js`.

**Ethiopian broader-canon remediation:** ongoing, unrelated to the Coptic work below. See
`RESUME_PROJECT_NOTE_HISTORICAL.md` for full detail on Meqabyan, Jubilees, Malke'a Virgin Mary,
Tizaz, etc. Nothing in that lane changed this session.

**The Ethiopian Sa'atat was removed entirely** (not rebuilt) after no adequate free English source
for the real Giyorgis structure could be found. Its slot was rebuilt from scratch as **the Coptic
Agpeya** instead.

**The Coptic Agpeya is complete and GREEN.** This was this session's main work, across several
sub-sessions:
- Built from De Lacy O'Leary's 1911 *The Daily Office and Theotokia of the Coptic Church* (public
  domain). All seven hours (Morning, Third, Sixth, Ninth, Eleventh, Twelfth, and the Midnight
  Office with its three nocturns), plus the complete seven-day Theotokia hymn cycle (Sunday through
  Saturday, each with a Psali, Alternative Psali, and full Theotokia body). 87 components, 15
  selectable offices, all wired into `components/coptic.json` and
  `components/traditions/coptic/rubrics.json`.
- Every one of the 87 components was then checked against source line by line (not spot-checked).
  Found and fixed 5 real issues: four small wording errors in the Morning Office, and one inverted
  sentence in Sunday's Theotokia Section V -- the Section V fix required going back to the actual
  PDF page (via Google Drive + `pdftoppm`, since the automated OCR text extraction had genuinely
  garbled that one passage) rather than accepting the extraction as a ceiling.
- Josh reviewed this verification work and explicitly authorized promoting the whole thing to
  GREEN. All 16 `cop:agpeya:*` dashboard rows now show green.
- One item remains an honestly-disclosed judgement call rather than a confirmed exact source match:
  Saturday's two Theotokia Crown endings (backed by three independently-confirmed matching
  instances from the preceding days, but Saturday's own text abbreviates slightly differently) --
  noted in that component's own `meta`, not hidden by the GREEN status. Not blocking, no action
  needed unless a better source turns up.
- The dashboard was reorganized after this: the Coptic Agpeya's rows had been living inside the
  "Ethiopian Office" section (an artifact of reusing that slot) even though the two are different
  traditions. Fixed: new standalone "IV. The Coptic Agpeya" section, its own JS array
  (`COPTIC_AGPEYA`), its own render call. "III. The Ethiopian Office" now contains only the two
  real Senkessar rows. The old `eth:saatat:removed` dashboard row was deleted entirely (its history
  remains in `AUDIT_GOVERNANCE_LEDGER.md` and `documentation/ETHIOPIAN_SAATAT_DOCUMENTATION.md`,
  which is now a deprecation notice). Subsequent section numerals (Church of the East, Byzantine,
  Book of Needs, Roman Breviary) were bumped up by one accordingly.
- Current `SEED_VERSION` in `audit-ledger.html`: `v138-2026-08-18-dashboard-coptic-section-split`.

**No outstanding work remains on the Coptic Agpeya.** Treat it like any other GREEN book in this
project -- re-opening it needs a real reason (a reported error, a newly available source, a scope
change Josh requests), not routine re-litigation.

---

## Important correction made this session -- read this before citing GREEN-promotion criteria

A stored memory claimed this project has a standing rule: "never mark a file GREEN without
documented human verification against a named primary source." **Josh stated directly that this
was never an actual project requirement** -- it came from an inaccurate memory, not a real
decision. This has been recorded in a memory-edit correction (so future sessions shouldn't repeat
the claim), and the false assertion was fixed directly in the live dashboard notes and corrected
(not erased) in the governance ledger's historical entries.

**Do not assume any particular bar for GREEN promotion going forward -- ask Josh directly if it
comes up.** The Coptic Agpeya's promotion this session followed extensive AI self-verification plus
Josh's explicit authorization, which is the actual precedent now, not any rule about human
read-throughs.

Also corrected in the same conversation: Sammie (an AI theological-librarian agent on OpenAI) was
briefly and wrongly suggested as a source of "human verification" -- a category error independent
of the rule issue above. Sammie is an AI, not a human.

---

## Standing rules and lessons that apply project-wide, not just to Coptic

- **No abbreviated/placeholder liturgical text, ever.** If a source says "say the Gloria," render
  the whole Gloria. If a source abbreviates a refrain with "&c." after giving it once in full,
  write it out in full at every occurrence. Established during the Coptic build, applies to all
  future liturgical content work.
- **"Corroborate before completing" method** for genuine textual gaps (a source's own abbreviation
  with no full statement nearby): check whether the same formula is independently attested in full
  elsewhere in the same book before completing it, and disclose the completion as such in the
  component's own `meta` rather than presenting it as a verbatim match. Used multiple times
  successfully in the Coptic build (Third Hour, Tuesday's and Saturday's Theotokia Crowns).
- **When OCR/automated extraction seems inadequate for a specific passage, don't treat that as a
  ceiling.** This environment has `pdftoppm`/`pdfimages`/`pdftotext` available via bash.
  `Google Drive:download_file_content` has a hard 10MB cap (confirmed: both O'Leary PDFs, at 30MB
  and 40MB, exceed it) -- but `Google Drive:read_file_content` (the OCR text tool actually used to
  build all this content) has no such limit. When a specific passage needs direct verification and
  text extraction won't cut it, identify the exact page and ask Josh for just that one page
  (paste or screenshot) rather than presenting "needs a page image" as an unrecoverable dead end.
- **Never certify GREEN with outstanding known defects.** If any problem exists in a book, it's not
  green until every known issue is resolved.
- **Patch workflow (non-negotiable, raised many times):** work in a local clone, commit, export with
  `git format-patch -1 HEAD -o /mnt/user-data/outputs/`, present via `present_files`. **Before
  generating a patch, always check `git log origin/main..HEAD --oneline` to confirm you're only
  packaging commits Josh doesn't already have** -- this session had a real incident where two local
  commits were made but only the second was ever turned into a patch, so the first was silently
  missing when Josh tried to apply it. If more than one commit is ahead, use
  `git format-patch <last-known-good-commit>..HEAD` to get the full series, numbered so `git am`
  applies them in order. Surface the exact `git am ...` and `git push origin main` commands ready
  to copy-paste, without explanation, every time.
- **Never direct-push from Claude's environment.**
- **If `git am` fails with a leftover-state error** (e.g. "previous rebase directory .git/rebase-apply
  still exists"), the fix is `git am --abort` (or `rm -rf .git/rebase-apply` if that itself errors),
  then retry the `git am` command.
- **Every deliverable requires:** `node --check` syntax validation (for `.js` files),
  `audit-ledger.html`'s inline `<script>` validated the same way (extract and run through
  `new Function()`), a ledger update, dashboard `SEED_VERSION` bump, and resume note update in the
  same action as the fix.
- **Write the resume note after each completed engine fix**, not batched at the end. This file
  itself gets unwieldy if left to grow indefinitely -- when it does, archive wholesale into
  `RESUME_PROJECT_NOTE_HISTORICAL.md` and rewrite this file fresh with just current state, the way
  this entry did.

---

## Tools & resources (unchanged from before this session, still accurate)

- **Repository:** github.com/JWJeffery/PrayerAppNew (public); Josh works in GitHub Codespaces.
- **Governance files:** `RESUME_PROJECT_NOTE.md` (this file), `RESUME_PROJECT_NOTE_HISTORICAL.md`
  (full history), `AUDIT_GOVERNANCE_LEDGER.md`, `audit-ledger.html` (dashboard).
- **Repo access:** `curl -sL "https://codeload.github.com/JWJeffery/PrayerAppNew/tar.gz/refs/heads/main"`
  for tarball download (GitHub API rate-limits unauthenticated). `git clone` for actual patch work
  (tarball + git init produces new-file patches that fail on apply).
- **Source witnesses (fixed paths):** see `RESUME_PROJECT_NOTE_HISTORICAL.md` for the full list
  (KJVA/Rotherham, DRB USFM, NRSV SQLite, NABRE json paths, etc.) -- unchanged this session, not
  reproduced here to keep this file short.
- **Known tool limitations:** archive.org `_djvu.txt` hard truncation wall (have Josh upload
  directly); en.wikisource.org cache-only; `Google Drive:download_file_content` 10MB cap (use
  `Google Drive:read_file_content` for text, or ask for a specific page image when that's not
  enough); `create_file` unreliable for large appends (use bash `cat >> file << 'EOF'` instead).

---

## What's actually next

Nothing is currently in progress. The Coptic Agpeya rebuild that occupied most of this session is
done, verified, GREEN, and the dashboard is clean. Next steps depend entirely on what Josh wants to
pick up -- could be continuing the Ethiopian broader-canon backlog (Tizaz, Fetha Nagast, remaining
ET books), the 10 unaudited other-tradition engines, or something new. Ask, don't assume.
