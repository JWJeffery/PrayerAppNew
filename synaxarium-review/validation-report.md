# Kalendar Review — Validation Report (strict, no silent repair)

Source: current `origin/main` (fetched fresh via codeload tarball). Candidate schema checked against governed header.

## A. Candidate CSV structural validation

- All twelve monthly candidate files present: **YES**
- Header matches governed schema for all months: **YES**
- Malformed / overflow CSV rows: **0**
- Non-numeric rank values: **0**
- Rows where decision_status != 'Pending': **0**
- Rows where final_primary is non-blank: **0**
- Dates with incoherent rank sequences: **0**
- Civil dates with zero candidates: **0**

## B. Month row counts and date coverage

- **January**: 91 candidate rows, 31 of 31 days covered
- **February**: 87 candidate rows, 29 of 29 days covered
- **March**: 86 candidate rows, 31 of 31 days covered
- **April**: 90 candidate rows, 30 of 30 days covered
- **May**: 93 candidate rows, 31 of 31 days covered
- **June**: 90 candidate rows, 30 of 30 days covered
- **July**: 97 candidate rows, 31 of 31 days covered
- **August**: 106 candidate rows, 31 of 31 days covered
- **September**: 119 candidate rows, 30 of 30 days covered
- **October**: 127 candidate rows, 31 of 31 days covered
- **November**: 111 candidate rows, 30 of 30 days covered
- **December**: 97 candidate rows, 31 of 31 days covered

## C. SIN validation

- Total candidate rows: **1194**
- Rank-1 SIN joins: **366**
- Alternate SIN joins: **828**
- Missing SIN joins: **0**

Expected zero missing SIN joins: **MET**

## D. Harmonization validation

- Harmonization ledger rows loaded: **92**
- Matched to a specific candidate card by name+date: **92**
- Falling back to day-level warnings: **0**
- Unmatched entirely (date doesn't map to a real month): **0**
- Annotated date strings (e.g. "01-11 fixed", "Silas 07-13/07-30") parsed to a clean civil date: **YES, all of them**
- Entries containing a genuinely non-date descriptive note (e.g. "future possible date") rather than a civil date, kept as context but not attached to any day: **2**
  - Samuel Ajayi Crowther: ['future possible date']
  - Josephine Butler: ['future December possible']

## E. Luther validation

- Martin Luther present anywhere in the active candidate/SIN/harmonization apparatus: **NO**

## F. UI packaging validation

- `app.js` fetches `data/kalendar-data.json` (relative to index.html).
- Data file written to: `data/kalendar-data.json` inside the delivered bundle — path matches.
- No broken relative paths: confirmed by directory layout below.
- Console-error and import/export round-trip checks are reported in the README verification section (cannot be executed by this script itself, since it has no browser).

## Overall result

**Zero hard failures detected.** All structural, SIN-join, harmonization, and Luther-exclusion checks passed against the current repo state.
