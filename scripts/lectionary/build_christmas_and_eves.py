#!/usr/bin/env python3
"""Christmas season + the BCP's "Eve of ..." Evening Prayers.

CHRISTMAS (data/season/christmas.json). The 2025/2026-built file named its weekdays ("Monday after
Christmas") and put "Second Sunday after Christmas" on January 4, so in any other year the titles
named the wrong weekday and a Sunday got a weekday's readings (and vice versa). The BCP's table is
dated (Dec 29, 30, 31, Jan 2-5) with the two Sundays after Christmas as separate rows, and the BCP
itself says the First Sunday after Christmas "takes precedence over the three Holy Days which follow
Christmas Day". New shape (engine: CalendarEngine._findChristmasEntry):
    christmas_dated: true     dated weekdays, title gets the real weekday at lookup
    christmas_sunday: 1 | 2   the Sunday readings, used on the Sunday that falls in that window
The feast entries themselves (Christmas Day, Dec 26-28 Holy Days, Holy Name) are kept.

EVES. The BCP gives special Evening Prayer psalms and lessons on the eve of several feasts (Christmas
Eve, Eve of Holy Name, of the Epiphany, of 1 Epiphany, of Ascension, of Pentecost, of Trinity Sunday and
of seven Holy Days). The app's data had `eve_title / psalms_ep_eve / reading_*_ep_eve` fields on 2026's
weekday slots that no code ever read, and which were wrong in every other year, so Evening Prayer on
those evenings used the ordinary readings -- and on Dec 31 and Jan 5 had NO psalms at all. Each Eve now
lives on the FEAST's entry as `eve: {...}`; Evening Prayer looks at tomorrow's entry
(renderBcpOffice) and uses its `eve` when present.

Idempotent.  Usage: python3 scripts/lectionary/build_christmas_and_eves.py
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from bcp_convert import ROOT, to_app_citation, to_app_psalms

BCP = json.load(open(os.path.join(ROOT, 'scripts', 'lectionary', 'bcp1979-daily-office.json')))
SEASON = os.path.join(ROOT, 'data', 'season')
FIELDS = {
    'y1': {'ot': 'reading_ot_mp_year1', 'ep': 'reading_epistle_mp_year1', 'go': 'reading_gospel_ep_year1'},
    'y2': {'ot': 'reading_ot_mp_year2', 'ep': 'reading_epistle_ep_year2', 'go': 'reading_gospel_mp_year2'},
}
ORDER = ['date', 'title', 'season', 'liturgicalColor', 'collect', 'antiphon_mp', 'antiphon_ep', 'psalms_mp', 'psalms_ep',
         'reading_ot_mp_year1', 'reading_epistle_mp_year1', 'reading_gospel_ep_year1',
         'reading_ot_mp_year2', 'reading_epistle_ep_year2', 'reading_gospel_mp_year2']


def load(n): return json.load(open(os.path.join(SEASON, n)))
def save(n, d):
    with open(os.path.join(SEASON, n), 'w') as f:
        json.dump(d, f, indent=2, ensure_ascii=False); f.write('\n')


def readings_into(e, row):
    for y in ('y1', 'y2'):
        r = row[y]['readings']
        for slot, i in (('ot', 0), ('ep', 1), ('go', 2)):
            e[FIELDS[y][slot]] = to_app_citation(r[i])
    e['psalms_mp'] = to_app_psalms(row['y1']['psalms_mp']) if row['y1']['psalms_mp'].strip('-') else ''
    e['psalms_ep'] = to_app_psalms(row['y1']['psalms_ep']) if row['y1']['psalms_ep'].strip('-') else ''


def ordered(e):
    out = {k: e[k] for k in ORDER if k in e}
    out.update({k: v for k, v in e.items() if k not in out})
    return out


def eve_from_bcp(key, title):
    row = BCP[key]
    r = row['y1']['readings']
    ev = {'title': title, 'psalms_ep': to_app_psalms(row['y1']['psalms_ep']),
          'reading_ot': to_app_citation(r[0]), 'reading_epistle': to_app_citation(r[1])}
    if len(r) > 2:
        ev['reading_gospel'] = to_app_citation(r[2])
    # the BCP prints the same Eve readings in both years
    assert [to_app_citation(x) for x in row['y2']['readings']] == [to_app_citation(x) for x in r], key
    return ev


def holy_day_eve(title, psalms, ot, epistle=None, gospel=None):
    ev = {'title': title, 'psalms_ep': psalms, 'reading_ot': ot}
    if epistle: ev['reading_epistle'] = epistle
    if gospel: ev['reading_gospel'] = gospel
    return ev


# BCP Holy Days table (bcponline.org/DOLectionary/Holy Days.html), Evening Prayer on the eve of the feast
HOLY_EVES = {
    'The Presentation of Our Lord Jesus Christ in the Temple':
        holy_day_eve('Eve of the Presentation', 'Psalm 113, Psalm 122', '1 Samuel 1:20-28a', 'Romans 8:14-21'),
    'The Annunciation of Our Lord Jesus Christ to the Blessed Virgin Mary':
        holy_day_eve('Eve of the Annunciation', 'Psalm 8, Psalm 138', 'Genesis 3:1-15', 'Romans 5:12-21'),
    'The Visitation of the Blessed Virgin Mary':
        holy_day_eve('Eve of the Visitation', 'Psalm 132', 'Isaiah 11:1-10', 'Hebrews 2:11-18'),
    'The Nativity of Saint John the Baptist':
        holy_day_eve('Eve of Saint John the Baptist', 'Psalm 103', 'Ecclesiasticus 48:1-11', 'Luke 1:5-23'),
    'The Transfiguration of Our Lord Jesus Christ':
        holy_day_eve('Eve of the Transfiguration', 'Psalm 84', '1 Kings 19:1-12', '2 Corinthians 3:1-9, 18'),
    'Holy Cross Day':
        holy_day_eve('Eve of Holy Cross', 'Psalm 46, Psalm 87', '1 Kings 8:22-30', 'Ephesians 2:11-22'),
    "All Saints' Day":
        holy_day_eve('Eve of All Saints', 'Psalm 34', 'Wisdom 3:1-9', 'Revelation 19:1, 4-10'),
}


def build_christmas():
    old = load('christmas.json')
    by = {e['title']: e for e in old}
    keep = {}
    for t in ('Christmas Day', 'St. Stephen, Deacon and Martyr', 'St. John, Apostle and Evangelist', 'The Holy Innocents',
              'The Holy Name of Our Lord Jesus Christ'):
        keep[t] = dict(by[t])
    readings_into(keep['Christmas Day'], BCP['Christmas|Christmas Day and Following|Christmas Day'])
    readings_into(keep['The Holy Name of Our Lord Jesus Christ'], BCP['Christmas|Christmas Day and Following|Holy Name'])
    star = by['Christmas Day']['antiphon_mp']
    new = [keep['Christmas Day'], keep['St. Stephen, Deacon and Martyr'], keep['St. John, Apostle and Evangelist'],
           keep['The Holy Innocents']]

    def mk(title, row, color, collect, antiphon, **extra):
        e = {'title': title, 'season': 'christmas', 'liturgicalColor': color, 'collect': collect,
             'antiphon_mp': antiphon, 'antiphon_ep': antiphon}
        readings_into(e, row)
        e.update(extra)
        return ordered(e)

    new.append(mk('First Sunday after Christmas Day', BCP['Christmas|Christmas Day and Following|First Sunday after Christmas'],
                  'white', 'collect-christmas-1', star, christmas_sunday=1))
    for key, y, m, d, coll in (('Dec 29', 2025, 12, 29, 'collect-christmas'), ('Dec 30', 2025, 12, 30, 'collect-christmas'),
                               ('Dec 31', 2025, 12, 31, 'collect-christmas')):
        new.append(mk(f'December {d}', BCP[f'Christmas|Christmas Day and Following|{key}'], 'white', coll, star,
                      date=f'{y}-{m:02d}-{d:02d}', christmas_dated=True))
    new.append(keep['The Holy Name of Our Lord Jesus Christ'])
    for key, d, coll in (('Jan 2', 2, 'collect-christmas'), ('Jan 3', 3, 'collect-christmas-2'), ('Jan 4', 4, 'collect-christmas-2'),
                         ('Jan 5', 5, 'collect-epiphany')):
        anti = (by.get('Monday before Epiphany') or by.get('January 5'))['antiphon_mp'] if d == 5 else star
        new.append(mk(f'January {d}', BCP[f'Christmas|Christmas Day and Following|{key}'], 'white', coll, anti,
                      date=f'2026-01-{d:02d}', christmas_dated=True))
    new.append(mk('Second Sunday after Christmas Day', BCP['Christmas|Christmas Day and Following|Second Sunday after Christmas'],
                  'white', 'collect-christmas-2', star, christmas_sunday=2))
    save('christmas.json', new)


def strip_legacy_eve_fields():
    n = 0
    for f in ('advent.json', 'christmas.json', 'epiphany.json', 'lent.json', 'easter.json', 'ordinary.json'):
        data = load(f); changed = False
        for e in data:
            for k in [k for k in e if k in ('eve_title', 'psalms_ep_eve', 'reading_ot_ep_eve', 'reading_epistle_ep_eve', 'reading_gospel_ep_eve')]:
                del e[k]; changed = True; n += 1
        if changed:
            save(f, data)
    return n


def attach(fname, match, eve):
    data = load(fname)
    hits = [e for e in data if match(e)]
    assert len(hits) == 1, (fname, eve['title'], len(hits))
    hits[0]['eve'] = eve
    save(fname, data)


def attach_eves():
    attach('christmas.json', lambda e: e['title'] == 'Christmas Day',
           eve_from_bcp('Advent|Week of 4 Advent|Christmas Eve', 'Christmas Eve'))
    attach('christmas.json', lambda e: e['title'] == 'The Holy Name of Our Lord Jesus Christ',
           eve_from_bcp('Christmas|Christmas Day and Following|Eve of Holy Name', 'Eve of the Holy Name'))
    attach('epiphany.json', lambda e: e['title'] == 'The Epiphany of Our Lord Jesus Christ',
           eve_from_bcp('Christmas|Christmas Day and Following|Eve of Epiphany', 'Eve of the Epiphany'))
    attach('epiphany.json', lambda e: e.get('epiphany_week') == 1 and e.get('weekday') == 'Sunday',
           eve_from_bcp('Epiphany|The Epiphany and Following|Eve of 1 Epiphany', 'Eve of the First Sunday after the Epiphany'))
    attach('easter.json', lambda e: e['title'] == 'Ascension Day',
           eve_from_bcp('Easter|Week of 6 Easter|Eve of Ascension', 'Eve of the Ascension'))
    attach('easter.json', lambda e: e['title'] == 'The Day of Pentecost',
           eve_from_bcp('Easter|Week of 7 Easter|Eve of Pentecost', 'Eve of Pentecost'))
    attach('ordinary.json', lambda e: e['title'] == 'Trinity Sunday',
           eve_from_bcp('Easter|Week of 7 Easter|Eve of Trinity Sunday', 'Eve of Trinity Sunday'))
    for title, ev in HOLY_EVES.items():
        for f in ('epiphany.json', 'lent.json', 'ordinary.json'):
            data = load(f)
            hits = [e for e in data if e['title'] == title]
            if hits:
                hits[0]['eve'] = ev
                save(f, data)
                break
        else:
            raise SystemExit(f'no entry for {title}')


def clean_dec24():
    """Dec 24's own entry is Morning Prayer only; its Evening Prayer is Christmas Day's Eve."""
    data = load('advent.json')
    for e in data:
        if e['title'] == 'Christmas Eve':
            for k in ('psalms_ep', 'reading_ot_ep_year1', 'reading_ot_ep_year2', 'reading_epistle_ep_year1', 'reading_epistle_ep_year2', 'antiphon_ep'):
                e.pop(k, None)
            e['title'] = 'Christmas Eve'
            e['psalms_ep'] = ''
            e['explicit_office_readings'] = True
    save('advent.json', data)


if __name__ == '__main__':
    build_christmas()
    n = strip_legacy_eve_fields()
    attach_eves()
    clean_dec24()
    print(f'christmas.json rebuilt; {n} unused legacy eve fields removed; eves attached')
