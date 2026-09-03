# COE calendar tooling

## `week_anchor_test.py`

Tests whether Church of the East commemorations are anchored to a fixed Gregorian
date or to a position in the East Syriac week structure.

Run: `python3 scripts/coe-calendar/week_anchor_test.py`

It holds week-cycle tables transcribed from the Assyrian Church of the East,
Diocese of Western Europe English Ecclesiastical Calendars for 2020-2026
(acote.church/ecclesiastical-calendar), plus each commemoration's date in each of
those seven years. For every commemoration it computes the (cycle, week number,
weekday) slot in each year and reports how many years agree.

Result as of 2026-09-03: **164 of 166 year-instances (98.8%)** land on the same
slot, across seven years whose Easter dates span 31 March to 20 April. Both
outliers are 2025, and both come from the same cause: the 2025 calendar merged
the Sixth and Seventh Weeks of Summer into a single week, which forced Mar Shimun
Bar Sabbae and St Qardagh onto the same Friday.

This is the evidence base for treating the COE sanctoral as week-anchored rather
than fixed-date. See `AUDIT_GOVERNANCE_LEDGER.md`, session 2026-09-03.

Extending it: add the year's week table to `W` and the commemoration dates to `C`.
The tables are hand-transcribed from the printed calendars deliberately -- OCR of
these PDFs interleaves four languages per row and is not reliable enough to parse
automatically.
