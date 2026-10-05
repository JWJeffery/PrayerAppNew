#!/usr/bin/env python3
"""Rebuild data/season/epiphany.json as a PERPETUAL table from the 1979 BCP Daily Office Lectionary.

The 2026-built file keyed every entry to a 2026 calendar date, so in any other year the Epiphany
weekday readings landed on the wrong weekday (e.g. Sunday's readings on Monday) and the weeks that a
longer Epiphany season needs (6, 7 and 8) did not exist at all (47 days with no readings in 2025-2031).

New shape (the engine's _findEpiphanyEntry matches these):
  * `epiphany_dated: true`   -- the dated days Jan 7-12 (used only until the following Saturday);
                                matched by month/day, title filled in with the weekday at lookup.
  * `epiphany_week` (1-8 or 'last') + `weekday` -- every weekday AND Sunday of each week.
  * `fixed_month_day: true`  -- the three Holy Days (Confession of St Peter, Conversion of St Paul,
                                Presentation) and the Epiphany itself, kept from the original file.

Idempotent: always rebuilds from bcp1979-daily-office.json plus the metadata of the ORIGINAL entries
that survive (collects, antiphons, the Holy Days).  Usage: python3 scripts/lectionary/build_epiphany.py
"""
import json, os, sys, re
sys.path.insert(0, os.path.dirname(__file__))
from bcp_convert import ROOT, to_app_citation, to_app_psalms

BCP = json.load(open(os.path.join(ROOT, 'scripts', 'lectionary', 'bcp1979-daily-office.json')))
PATH = os.path.join(ROOT, 'data', 'season', 'epiphany.json')
WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
ORDW = {1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', 5: 'Fifth', 6: 'Sixth', 7: 'Seventh', 8: 'Eighth'}
FIELDS = {
    'y1': {'ot': 'reading_ot_mp_year1', 'ep': 'reading_epistle_mp_year1', 'go': 'reading_gospel_ep_year1'},
    'y2': {'ot': 'reading_ot_mp_year2', 'ep': 'reading_epistle_ep_year2', 'go': 'reading_gospel_mp_year2'},
}
STAR = 'We have seen his star in the east: Come let us adore him.'
GLORY = 'The Lord has shown forth his glory: Come let us adore him.'

orig = json.load(open(PATH))

def readings_into(entry, row):
    for y in ('y1', 'y2'):
        r = row[y]['readings']
        for slot, i in (('ot', 0), ('ep', 1), ('go', 2)):
            entry[FIELDS[y][slot]] = to_app_citation(r[i])
    entry['psalms_mp'] = to_app_psalms(row['y1']['psalms_mp'])
    ep = row['y1']['psalms_ep']
    entry['psalms_ep'] = to_app_psalms(ep) if ep.strip('-') else ''


def mk(title, row, color, collect, antiphon, **extra):
    e = {'title': title, 'season': 'Epiphany', 'liturgicalColor': color, 'collect': collect,
         'antiphon_mp': antiphon, 'antiphon_ep': antiphon}
    readings_into(e, row)
    e.update(extra)
    order = ['date', 'title', 'season', 'liturgicalColor', 'collect', 'antiphon_mp', 'antiphon_ep', 'psalms_mp', 'psalms_ep',
             'reading_ot_mp_year1', 'reading_epistle_mp_year1', 'reading_gospel_ep_year1',
             'reading_ot_mp_year2', 'reading_epistle_ep_year2', 'reading_gospel_mp_year2']
    out = {k: e[k] for k in order if k in e}
    out.update({k: v for k, v in e.items() if k not in out})
    return out


def build():
    new = []
    old_by_title = {e['title']: e for e in orig}

    # The Epiphany itself (Jan 6) -- keep metadata, refresh readings
    ep = dict(old_by_title['The Epiphany of Our Lord Jesus Christ'])
    readings_into(ep, BCP['Epiphany|The Epiphany and Following|Epiphany'])
    ep['fixed_month_day'] = True
    new.append(ep)

    # dated days Jan 7-12 (only until the following Saturday)
    for d in range(7, 13):
        row = BCP[f'Epiphany|The Epiphany and Following|Jan {d}']
        e = mk(f'January {d}', row, 'white', 'collect-epiphany', STAR, date=f'2026-01-{d:02d}', epiphany_dated=True)
        if not e['psalms_ep']:
            # Jan 12's Evening Prayer is the BCP's separate "Eve of 1 Epiphany" row
            eve = BCP['Epiphany|The Epiphany and Following|Eve of 1 Epiphany']
            e['psalms_ep'] = to_app_psalms(eve['y1']['psalms_ep'])
        new.append(e)

    # weekly entries
    for wk in list(range(1, 9)) + ['last']:
        sec = 'Week of Last Epiphany' if wk == 'last' else f'Week of {wk} Epiphany'
        days = WD if wk != 'last' else ['Sunday', 'Monday', 'Tuesday']       # Ash Wednesday on belongs to Lent
        for lab in days:
            row = BCP[f'Epiphany|{sec}|{lab}']
            if wk == 'last':
                coll = 'collect-last-epiphany'
            elif wk == 1:
                coll = 'collect-baptism-of-our-lord' if lab == 'Sunday' else 'collect-epiphany-1'
            else:
                coll = f'collect-epiphany-{wk}'
            if lab == 'Sunday':
                if wk == 1: title, color = 'First Sunday after the Epiphany: The Baptism of Our Lord', 'white'
                elif wk == 'last': title, color = 'Last Sunday after the Epiphany: The Transfiguration', 'white'
                else: title, color = f'The {ORDW[wk]} Sunday after the Epiphany', 'green'
            else:
                title = f'{lab} in the Week of {"Last" if wk == "last" else wk} Epiphany'
                color = 'green'
            new.append(mk(title, row, color, coll, GLORY, epiphany_week=wk, weekday=lab))

    # the three Holy Days that fall in the season keep their (2026-built, fixed-date) entries
    for t in ('The Confession of Saint Peter the Apostle', 'The Conversion of Saint Paul the Apostle',
              'The Presentation of Our Lord Jesus Christ in the Temple'):
        e = dict(old_by_title[t]); e['fixed_month_day'] = True
        new.append(e)
    return new


if __name__ == '__main__':
    new = build()
    with open(PATH, 'w') as f:
        json.dump(new, f, indent=2, ensure_ascii=False); f.write('\n')
    print(f'epiphany.json rebuilt: {len(new)} entries '
          f'({sum(1 for e in new if e.get("epiphany_week") is not None)} weekly, '
          f'{sum(1 for e in new if e.get("epiphany_dated"))} dated, '
          f'{sum(1 for e in new if e.get("fixed_month_day"))} fixed Holy Days)')
