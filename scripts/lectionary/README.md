# Daily Office lectionary (1979 BCP) – data, builders and audit

Source of truth: the 1979 Book of Common Prayer only (https://www.bcponline.org/ DOLectionary pages, cross-checked
against http://justus.anglican.org/resources/bcp/bcp79.pdf). No RCL, USCCB, ACNA or 1928 material.

## Data
- `bcp1979-daily-office.json` – 410 rows keyed `Season|Section|Label`; `y1`/`y2` = psalms (MP/EP) + three readings.
- `bcp1979-holy-days.json` – the BCP Holy Days table ("||" separates "or" alternatives).
- Adjudications where the site and PDF disagree (kept as printed on the site): Advent 2 Sunday Y2 epistle
  `2 Thess. 1:5-12`, `Gen. 3:8-15`, `Rom. 14:7-12`; four psalm typos corrected (Proper 1 Sat Y2, Proper 16 Tue Y2 EP,
  Proper 16 Sat Y1, Proper 17 Sat Y2 EP).

## Rebuild (all idempotent; run from the repo root)
1. `python3 scripts/lectionary/apply_bcp_to_season_files.py` – Advent/Lent/Easter/Ordinary readings + psalms, Holy Days, observance flags
2. `python3 scripts/lectionary/build_epiphany.py` – Epiphany by week/weekday
3. `python3 scripts/lectionary/build_christmas_and_eves.py` – Christmas season and the "Eve of …" Evening Prayers
4. `python3 scripts/lectionary/add_missing_collects.py`

## Audit
```
NODE_PATH=$(npm root -g) node scripts/lectionary/dump-displayed-readings.mjs --from 2025-01-01 --to 2031-12-31 --out /tmp/displayed.json
python3 scripts/lectionary/audit_lectionary.py /tmp/displayed.json                      # gospel placement: evening
# and with --placement morning on both commands for the other gospel-placement setting
```
The dump drives the real app (Playwright + Chromium); the audit compares what is displayed with the BCP data using an
independent calendar (Easter, Propers, Holy Day transfers, Eves). Expect `PASS: nothing differs from the 1979 BCP.`
