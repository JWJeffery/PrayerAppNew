#!/usr/bin/env python3
"""Bring data/season/{advent,lent,easter,ordinary}.json into line with the 1979 BCP Daily Office
Lectionary (scripts/lectionary/bcp1979-daily-office.json, parsed from bcponline.org and cross-checked
against the printed edition at justus.anglican.org/resources/bcp/bcp79.pdf).

What it does, and nothing else:
  * for every entry that maps to a BCP row, replaces a reading or psalm ONLY when it differs from the
    BCP (so correct entries are not touched and formatting is preserved);
  * adds the ordinary-weekday entry for every season slot that, in the original 2026-built data, was
    occupied by a fixed-date Holy Day (so other years had no entry for that day);
  * makes December 24 a fixed-date entry (the BCP gives it its own readings, whatever its weekday).

Re-runnable and idempotent. Usage:  python3 scripts/lectionary/apply_bcp_to_season_files.py [--dry-run]
"""
import json, re, sys, os, copy
sys.path.insert(0, os.path.dirname(__file__))
from bcp_convert import (ROOT, to_app_citation, cite_core, psalm_numbers, to_app_psalms)

DRY = '--dry-run' in sys.argv
BCP = json.load(open(os.path.join(ROOT, 'scripts', 'lectionary', 'bcp1979-daily-office.json')))
SEASON_DIR = os.path.join(ROOT, 'data', 'season')
WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
ORD = {'First': 1, 'Second': 2, 'Third': 3, 'Fourth': 4, 'Fifth': 5, 'Sixth': 6, 'Seventh': 7}

# app field names for each year's three readings
FIELDS = {
    'y1': {'ot': 'reading_ot_mp_year1', 'ep': 'reading_epistle_mp_year1', 'go': 'reading_gospel_ep_year1'},
    'y2': {'ot': 'reading_ot_mp_year2', 'ep': 'reading_epistle_ep_year2', 'go': 'reading_gospel_mp_year2'},
}
stats = {'readings': 0, 'psalms': 0, 'added': 0, 'entries_touched': set()}
log = []


def load(name):
    return json.load(open(os.path.join(SEASON_DIR, name)))


def save(name, data):
    if not DRY:
        with open(os.path.join(SEASON_DIR, name), 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')


def bcp_row(season, section, label):
    return BCP.get(f'{season}|{section}|{label}')


def special(row):
    """Rows the plain 3-reading model cannot express (Holy Week Thu/Fri/Sat, Easter Day, ...)."""
    for y in ('y1', 'y2'):
        e = row.get(y)
        if not e:
            return True
        if len(e['readings']) != 3:
            return True
        if any('**' in r or r.startswith('--') for r in e['readings']):
            return True
        if '*' in e['psalms_mp'] or '*' in e['psalms_ep']:
            return True
    return False


def update_entry(e, row, where):
    changed = False
    for y in ('y1', 'y2'):
        r = row[y]['readings']
        for slot, i in (('ot', 0), ('ep', 1), ('go', 2)):
            fld = FIELDS[y][slot]
            new = to_app_citation(r[i])
            if cite_core(e.get(fld)) != cite_core(r[i]):
                log.append(f"  {where} {fld}: {e.get(fld)!r} -> {new!r}")
                e[fld] = new
                stats['readings'] += 1
                changed = True
    for key in ('psalms_mp', 'psalms_ep'):
        b = row['y1'][key]
        if not b or b.strip('-') == '':
            continue
        allb = psalm_numbers(b, True)
        core = psalm_numbers(b, False)
        have = psalm_numbers(e.get(key), True)
        if not ((have <= allb and core <= have)):
            new = to_app_psalms(b)
            log.append(f"  {where} {key}: {e.get(key)!r} -> {new!r}")
            e[key] = new
            stats['psalms'] += 1
            changed = True
    if changed:
        stats['entries_touched'].add(where)
    return changed


# ───────────────────────── title → BCP row ─────────────────────────
def map_title(t):
    m = re.match(r'^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) in the Week of (\d) (Advent)$', t)
    if m: return ('Advent', f'Week of {m.group(2)} Advent', m.group(1))
    m = re.match(r'^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) in (\d) (Lent|Easter)$', t)
    if m: return (m.group(3), f'Week of {m.group(2)} {m.group(3)}', m.group(1))
    m = re.match(r'^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) in Easter Week$', t)
    if m: return ('Easter', 'Easter Week', m.group(1))
    m = re.match(r'^(Monday|Tuesday|Wednesday) in Holy Week$', t)
    if m: return ('Lent', 'Holy Week', m.group(1))
    m = re.match(r'^(First|Second|Third|Fourth|Fifth|Sixth|Seventh) Sunday (?:of|in) (Advent|Lent|Easter)$', t)
    if m: return (m.group(2), f'Week of {ORD[m.group(1)]} {m.group(2)}', 'Sunday')
    if t == 'Palm Sunday': return ('Lent', 'Holy Week', 'Palm Sunday')
    if t == 'Ash Wednesday': return ('Epiphany', 'Week of Last Epiphany', 'Ash Wednesday')
    m = re.match(r'^(Thursday|Friday|Saturday) after Ash Wednesday$', t)
    if m: return ('Epiphany', 'Week of Last Epiphany', m.group(1))
    if t == 'Sunday after St. Mark / Fourth Sunday of Easter': return ('Easter', 'Week of 4 Easter', 'Sunday')
    if t == 'Ascension Day': return ('Easter', 'Week of 6 Easter', 'Ascension Day')
    m = re.match(r'^(Friday|Saturday) after Ascension$', t)
    if m: return ('Easter', 'Week of 6 Easter', m.group(1))
    return None


# ───────────────────────── day-of-season → BCP row (for adding missing entries) ─────────────────────────
def lent_slot(n):
    if n == 1: return ('Epiphany', 'Week of Last Epiphany', 'Ash Wednesday')
    if n <= 4: return ('Epiphany', 'Week of Last Epiphany', ['Thursday', 'Friday', 'Saturday'][n - 2])
    if n >= 40:
        lab = ['Palm Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Maundy Thursday', 'Good Friday', 'Holy Saturday'][n - 40]
        return ('Lent', 'Holy Week', lab)
    wk, d = (n - 5) // 7 + 1, (n - 5) % 7
    return ('Lent', f'Week of {wk} Lent', WD[d])


def easter_slot(n):
    if n <= 7: return ('Easter', 'Easter Week', 'Easter Day' if n == 1 else WD[(n - 1) % 7])
    if n == 50: return ('Easter', 'Week of 7 Easter', 'The Day of Pentecost')
    wk, d = (n - 1) // 7 + 1, (n - 1) % 7
    if wk == 6 and d == 4: return ('Easter', 'Week of 6 Easter', 'Ascension Day')
    return ('Easter', f'Week of {wk} Easter', WD[d])


def advent_slot(n):
    wk, d = (n - 1) // 7 + 1, (n - 1) % 7
    return ('Advent', f'Week of {wk} Advent', WD[d])


def title_for(season, sec, lab):
    n = re.search(r'Week of (\d)', sec)
    if season == 'Advent': return f'{lab} in the Week of {n.group(1)} Advent'
    if season == 'Lent':
        if sec == 'Week of Last Epiphany':
            return 'Ash Wednesday' if lab == 'Ash Wednesday' else f'{lab} after Ash Wednesday'
        return f'{lab} in {n.group(1)} Lent'
    if season == 'Easter':
        if sec == 'Easter Week': return f'{lab} in Easter Week'
        return f'{lab} in {n.group(1)} Easter'
    return None


def add_missing(fname, season, slot_fn, max_day):
    data = load(fname)
    have = {e['day_of_season'] for e in data if 'day_of_season' in e and not e.get('fixed_month_day')}
    added = []
    for n in range(1, max_day + 1):
        if n in have:
            continue
        sec_season, sec, lab = slot_fn(n)
        row = bcp_row(sec_season, sec, lab)
        if not row or special(row):
            log.append(f"  {fname}: day {n} ({sec} {lab}) not added: no plain BCP row")
            continue
        # donor for non-reading metadata: a same-week, non-fixed neighbour
        donors = [e for e in data if 'day_of_season' in e and not e.get('fixed_month_day') and abs(e['day_of_season'] - n) <= 7]
        donor = min(donors, key=lambda e: abs(e['day_of_season'] - n))
        new = {k: v for k, v in donor.items() if k in
               ('season', 'liturgicalColor', 'collect', 'marian_antiphon', 'antiphon_mp', 'antiphon_ep')}
        new['title'] = title_for(season, sec, lab)
        new['season'] = donor.get('season', season)
        new['day_of_season'] = n
        new['psalms_mp'] = to_app_psalms(row['y1']['psalms_mp'])
        new['psalms_ep'] = to_app_psalms(row['y1']['psalms_ep'])
        for y in ('y1', 'y2'):
            for slot, i in (('ot', 0), ('ep', 1), ('go', 2)):
                new[FIELDS[y][slot]] = to_app_citation(row[y]['readings'][i])
        # keep the same key order the other entries use
        order = ['title', 'season', 'liturgicalColor', 'collect', 'marian_antiphon', 'antiphon_mp', 'antiphon_ep',
                 'psalms_mp', 'psalms_ep', 'reading_ot_mp_year1', 'reading_epistle_mp_year1', 'reading_gospel_ep_year1',
                 'reading_ot_mp_year2', 'reading_epistle_ep_year2', 'reading_gospel_mp_year2', 'day_of_season']
        new = {k: new[k] for k in order if k in new}
        added.append((n, new))
        log.append(f"  {fname}: ADDED day {n}: {new['title']}")
        stats['added'] += 1
    for n, new in added:
        data.append(new)
    data.sort(key=lambda e: (e.get('day_of_season', 999), 0 if not e.get('fixed_month_day') else 1))
    save(fname, data)


def regen_season(fname, season, mapper):
    data = load(fname)
    for e in data:
        if e.get('fixed_month_day'):
            continue
        key = mapper(e)
        if not key:
            continue
        row = bcp_row(*key)
        if not row:
            log.append(f"  {fname}: no BCP row for {e['title']!r} -> {key}")
            continue
        if special(row):
            continue
        update_entry(e, row, f"{fname}:{e['title']}")
    save(fname, data)


def advent_dec24():
    """Dec 24 is a dated day in the BCP whatever its weekday; the 2026 file had it as 'Thursday in the
    Week of 4 Advent' (day 26), so every other year's Dec 24 had no entry and its Dec 23 got Dec 24's readings."""
    data = load('advent.json')
    row = bcp_row('Advent', 'Week of 4 Advent', 'Dec 24')
    eve = bcp_row('Advent', 'Week of 4 Advent', 'Christmas Eve')
    target = next((e for e in data if e.get('date') == '2026-12-24'), None)
    if target and not target.get('fixed_month_day'):
        target['title'] = 'Christmas Eve'
        target['fixed_month_day'] = True
        target.pop('day_of_season', None)
        # The BCP gives Dec 24 THREE readings at Morning Prayer and nothing at Evening Prayer, whose
        # readings come from a separate "Christmas Eve" row (Psalm 89:1-29; Isa. 59:15b-21, Phil. 2:5-11).
        # So this day names each office's readings explicitly (see resolveDailyOfficeReadings).
        target['explicit_office_readings'] = True
        for f in ('reading_gospel_ep_year1', 'reading_epistle_ep_year2'):
            target.pop(f, None)
        target['psalms_mp'] = to_app_psalms(row['y1']['psalms_mp'])
        target['psalms_ep'] = to_app_psalms(eve['y1']['psalms_ep'])
        target['antiphon_ep'] = target.get('antiphon_mp', '')
        for y, yy in (('y1', 'year1'), ('y2', 'year2')):
            r = row[y]['readings']
            target[f'reading_ot_mp_{yy}'] = to_app_citation(r[0])
            target[f'reading_epistle_mp_{yy}'] = to_app_citation(r[1])
            target[f'reading_gospel_mp_{yy}'] = to_app_citation(r[2])
            target[f'reading_ot_ep_{yy}'] = to_app_citation(eve[y]['readings'][0])
            target[f'reading_epistle_ep_{yy}'] = to_app_citation(eve[y]['readings'][1])
        log.append("  advent.json: Dec 24 entry -> fixed-date 'Christmas Eve' with the BCP Christmas Eve Evening Prayer")
    save('advent.json', data)
    return eve


def regen_holy_days():
    """Holy Day entries (fixed_month_day) against the BCP Holy Days table: MP = psalms + OT + Epistle,
    EP = psalms + OT + Gospel. Only differences are written; entries with a deliberate 'or' pairing
    (alt_ep_toggle_id: St Mary the Virgin, St Michael) keep their Evening Prayer as designed."""
    import glob
    holy = json.load(open(os.path.join(ROOT, 'scripts', 'lectionary', 'bcp1979-holy-days.json')))
    MON = {m: i + 1 for i, m in enumerate('January February March April May June July August September October November December'.split())}
    table = {}
    for r in holy:
        m = re.search(r'(January|February|March|April|May|June|July|August|September|October|November|December) (\d+)$', r['label'])
        if m and not r['label'].startswith('Eve'):
            table[(MON[m.group(1)], int(m.group(2)))] = r
    n = 0
    for path in sorted(glob.glob(os.path.join(SEASON_DIR, '*.json'))):
        data = json.load(open(path))
        if not isinstance(data, list) or not data or 'title' not in data[0]:
            continue
        changed = False
        for e in data:
            if not (e.get('fixed_month_day') or e['title'] in ('St. Stephen, Deacon and Martyr', 'St. John, Apostle and Evangelist', 'The Holy Innocents')):
                continue
            m = re.match(r'^(\d{4})-(\d\d)-(\d\d)$', e.get('date', '')) or re.match(r'^(\w+) (\d+), (\d{4})$', e.get('date', ''))
            if not m:
                continue
            key = (int(m.group(2)), int(m.group(3))) if re.match(r'^\d{4}', e['date']) else (MON.get(m.group(1)), int(m.group(2)))
            row = table.get(key)
            if not row:
                continue
            for k, cell in (('psalms_mp', row['mp']), ('psalms_ep', row['ep'])):
                if not cell:
                    continue
                primary = re.split(r',?\s+or\s+', cell['psalms'])[0]      # "34, 150, or 104" -> "34, 150" (104 is psalms_ep_alt)
                want_all, want_core = psalm_numbers(primary, True), psalm_numbers(primary, False)
                if not (psalm_numbers(e.get(k), True) >= want_core and psalm_numbers(e.get(k), True) <= want_all):
                    new = to_app_psalms(primary)
                    log.append(f"  {os.path.basename(path)}:{e['title']} {k}: {e.get(k)!r} -> {new!r}")
                    e[k] = new; changed = True; n += 1
        if changed:
            save(os.path.basename(path), data)
    return n


def set_observance():
    """BCP p.15-16 precedence flags the engine reads (see CalendarEngine._applySundayPrecedence)."""
    flags = {'The Epiphany of Our Lord Jesus Christ': 'principal', "All Saints' Day": 'principal',
             'The Presentation of Our Lord Jesus Christ in the Temple': 'sunday-precedence',
             'The Transfiguration of Our Lord Jesus Christ': 'sunday-precedence',
             'Christmas Eve': 'dated-day'}
    n = 0
    for f in ('advent.json', 'christmas.json', 'epiphany.json', 'lent.json', 'easter.json', 'ordinary.json'):
        data = load(f); changed = False
        for e in data:
            if e['title'] in flags and e.get('observance') != flags[e['title']]:
                e['observance'] = flags[e['title']]; changed = True; n += 1
        if changed:
            save(f, data)
    return n


def normalize_book_names():
    """Every reading citation uses the app's full book names ("Ephesians 1:3-14", never "Eph. 1:3-14"):
    the scripture loader builds its file name from the book text, so an abbreviation loads
    data/bible/OT/eph..json and the reading shows "[Scripture unavailable: Eph.]"."""
    import glob
    from bcp_convert import split_book, app_book_names, FULLNAME, _BOOK_RE
    n = 0
    for path in sorted(glob.glob(os.path.join(SEASON_DIR, '*.json'))):
        data = json.load(open(path))
        if not isinstance(data, list):
            continue
        changed = False

        def fix(v):
            nonlocal n, changed
            if not isinstance(v, str):
                return v
            parts = []
            for seg in v.split(';'):
                lead = len(seg) - len(seg.lstrip())
                m = _BOOK_RE.match(seg.strip())
                sb = split_book(seg.strip()) if m else None
                if sb:
                    want = app_book_names().get(sb[0]) or FULLNAME.get(sb[0])
                    have = re.sub(r'\s+', ' ', m.group(1)).strip()
                    if want and have != want:
                        seg = seg[:lead] + want + ' ' + m.group(2)
                        n += 1; changed = True
                parts.append(seg)
            return ';'.join(parts)

        def walk(o):
            if isinstance(o, dict):
                for k, v in list(o.items()):
                    if (k.startswith('reading_') or k in ('reading_ot', 'reading_epistle', 'reading_gospel')) and isinstance(v, str):
                        o[k] = fix(v)
                    elif isinstance(v, (dict, list)):
                        walk(v)
            elif isinstance(o, list):
                for x in o:
                    walk(x)
        walk(data)
        if changed:
            save(os.path.basename(path), data)
    return n


def main():
    # Advent
    regen_season('advent.json', 'Advent', lambda e: map_title(e['title']))
    advent_dec24()
    add_missing('advent.json', 'Advent', advent_slot, 28)
    # Lent
    regen_season('lent.json', 'Lent', lambda e: map_title(e['title']))
    add_missing('lent.json', 'Lent', lent_slot, 46)
    # Easter
    regen_season('easter.json', 'Easter', lambda e: map_title(e['title']))
    add_missing('easter.json', 'Easter', easter_slot, 50)
    # Ordinary Time: Proper N + weekday
    regen_season('ordinary.json', 'Proper',
                 lambda e: ('Proper', f"Proper {e['proper_number']}", e['weekday']) if 'proper_number' in e and 'weekday' in e else None)
    nh = regen_holy_days()
    no = set_observance()
    if no: log.append(f'  set the precedence flag on {no} entr(ies)')
    nb = normalize_book_names()
    if nb: log.append(f'  normalised {nb} abbreviated book name(s) to the app spelling')
    print('\n'.join(log))
    print(f"\nreadings corrected: {stats['readings']}  psalm sets corrected: {stats['psalms']}  "
          f"entries added: {stats['added']}  entries touched: {len(stats['entries_touched'])}"
          + ('  (dry run, nothing written)' if DRY else ''))


if __name__ == '__main__':
    main()
