# Saints Data Model

**This directory holds hand-edited, direct-source files, one per month:**

```
data/saints/saints-{month}.json   — january, february, ..., december
```

Each file is a flat array of commemoration records:

```jsonc
{
  "id":          "saint-jacob-of-nisibis",
  "day":         "July 17",
  "name":        "St. Jacob of Nisibis",
  "description": "One of the 318 Fathers of the Council of Nicaea... (real citation here)",
  "type":        "saint",
  "tags":        ["EOR", "OOR", "COE"]   // ANG | LAT | EOR | OOR | COE
}
```

`js/saints-resolver.js` reads these files directly at runtime, one file per requested month.
There is no other layer between this directory and the live app.

---

## There used to be a generator. It's gone, deliberately, as of 2026-09-02.

From 2026-03-01 to 2026-09-02, this directory also held two "source of truth" files
(`identities.json`, `commemorations.json`) plus a generator script
(`tools/build_saints_cache.js`) that was supposed to produce the `saints-{month}.json` files
above from them, with a GitHub Actions gate (`.github/workflows/saints-gate.yml`) enforcing that
the two stayed in sync on every push.

**That architecture was built by Lucy** (this project's prior architect/QA lead, dismissed
2026-07-05 for falsely certifying content as accurate — see `AUDIT_GOVERNANCE_LEDGER.md`'s
2026-07-05 entry). `commemorations.json` was seeded by importing the *already-fabricated*
`saints-{month}.json` data wholesale on 2026-03-01, then never independently cleaned for the
Church of the East. Meanwhile, several real sessions across 2026-08-27 through 2026-08-31
correctly audited and re-sourced the COE portion of `saints-{month}.json` directly — the *cache*
files, not knowing they were meant to be generated, not hand-edited — because nothing anywhere
disclosed that this generator/CI-gate architecture existed or that it would silently overwrite
direct edits the next time it ran. The result, discovered 2026-09-02: a live CI gate configured to
regenerate the cache from a source file still carrying Lucy's original uncited, fabricated COE
data, with a `git diff --exit-code` step that would have reverted months of real sourcing work the
next time anyone touched anything in `data/saints/`.

**Removed rather than reconciled**, per Josh's direction: `identities.json`, `commemorations.json`,
the generator and its sibling tools (`build_saints_cache.js`, `import_legacy_saints.js`,
`validate_saints_sources.js`, `fix_commemorations_calendar.js`, `rank_identity_frequency.js`), the
CI workflow, and the `saints:*` npm scripts that invoked them. Reconciling two divergent sources
of truth — one still full of Lucy's fabrications, one carrying real, cited, multi-session work —
would have meant re-deriving all of that real work a second time into a schema nobody has used
correctly for COE even once. Simpler and safer to have one file per month, hand-edited, with
citations in the `description` field, and nothing automated standing between an edit and what the
app actually renders.

**If a future session is tempted to rebuild something like this generator/cache split:** don't,
without first checking whether the "source of truth" you're building from has actually been
audited for every tradition it claims to cover. The failure here wasn't the two-file *idea* — it
was that one side of it was seeded from fabricated data and never checked before being wired to
silently overwrite the other side.

---

## Adding or correcting a commemoration

1. Open `saints-{month}.json` for the correct month directly.
2. Add or edit the record in place. Give `description` a real, checkable citation — which source,
   which page or URL, not just a bare claim.
3. Add the relevant tradition code to `tags` (`ANG`/`LAT`/`EOR`/`OOR`/`COE`). Multiple traditions
   sharing one date is normal; don't create a duplicate row for the same person on the same day.
4. If the same person is already dated elsewhere in this corpus under other traditions, or the
   same identity is represented by more than one `id` in an allowlist (COE's `js/coe-eligibility.js`
   has several documented cases of this), tag the *one* canonical row rather than duplicating —
   see the existing "RESOLVED as a duplicate" pattern used throughout this corpus for how to
   annotate that decision.
5. Commit the file directly. There is no build or generate step.
