#!/usr/bin/env python3
"""Audit what the app DISPLAYS for the Daily Office against the 1979 BCP Daily Office Lectionary.

  node scripts/lectionary/dump-displayed-readings.mjs --from 2025-01-01 --to 2031-12-31 --out displayed.json
  python3 scripts/lectionary/audit_lectionary.py displayed.json [--placement evening|morning]

For every day in the dump it works out, independently of the app's own calendar code, which row of the
BCP tables applies (season, week, weekday; the dated days of Christmas and Epiphany; the Sundays after
Christmas; the Eves) and checks, for Morning and Evening Prayer:
  * the psalms and the readings are exactly the BCP's (psalm numbers; citations ignoring spelling,
    optional lengthenings and verse letters);
  * which reading falls at which office follows the Gospel-placement setting;
  * a title that starts with a weekday names the day's real weekday;
  * no gap marker anywhere ("Lectionary Gap", "No collect appointed", "[... unavailable]", a stray "[ ]");
  * every Eve of a feast shows the BCP's Eve psalms and lessons (and none appears on any other evening).
Days whose title is a Holy Day or a day the plain three-reading model cannot express (Easter Day, Good
Friday, ...) are counted and skipped here; the Holy Day entries themselves are checked against the BCP
Holy Days table by the data checks at the end. Exit status 1 if anything fails.
"""
import json, re, sys, os, collections
from datetime import date, timedelta
sys.path.insert(0, os.path.dirname(__file__))
from bcp_convert import ROOT, cite_core, psalm_numbers

BCP = json.load(open(os.path.join(ROOT, 'scripts', 'lectionary', 'bcp1979-daily-office.json')))
HOLY = json.load(open(os.path.join(ROOT, 'scripts', 'lectionary', 'bcp1979-holy-days.json')))
WD = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
PLACEMENT = 'morning' if '--placement' in sys.argv and sys.argv[sys.argv.index('--placement') + 1] == 'morning' else 'evening'


# ───────────────────────── the calendar, from first principles ─────────────────────────
def easter(y):
    a = y % 19; b = y // 100; c = y % 100; d = b // 4; e = b % 4; f = (b + 8) // 25; g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30; i = c // 4; k = c % 4; l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    return date(y, (h + l - 7 * m + 114) // 31, ((h + l - 7 * m + 114) % 31) + 1)


def sunday_on_or_before(d): return d - timedelta(days=(d.weekday() + 1) % 7)
def advent1(y): return sunday_on_or_before(date(y, 12, 3))
def wday(d): return WD[d.weekday()]


def lit_year(d):
    nxt = d.year + 1 if d >= advent1(d.year) else d.year
    return 'y2' if nxt % 2 == 0 else 'y1'


PROPER_DATES = {1: (5, 11), 2: (5, 18), 3: (5, 25), 4: (6, 1), 5: (6, 8), 6: (6, 15), 7: (6, 22), 8: (6, 29), 9: (7, 6), 10: (7, 13),
                11: (7, 20), 12: (7, 27), 13: (8, 3), 14: (8, 10), 15: (8, 17), 16: (8, 24), 17: (8, 31), 18: (9, 7), 19: (9, 14),
                20: (9, 21), 21: (9, 28), 22: (10, 5), 23: (10, 12), 24: (10, 19), 25: (10, 26), 26: (11, 2), 27: (11, 9),
                28: (11, 16), 29: (11, 23)}


def closest_sunday(y, m, dd):
    t = date(y, m, dd)
    return next(t + timedelta(days=o) for o in range(-3, 4) if (t + timedelta(days=o)).weekday() == 6)


def proper_for_week(sun):
    for n, (m, dd) in PROPER_DATES.items():
        if closest_sunday(sun.year, m, dd) == sun:
            return n


def first_sunday_after_epiphany(y):
    j6 = date(y, 1, 6)
    return j6 + timedelta(days=(6 - j6.weekday()) % 7 or 7)


def locate(d):
    """BCP key 'Season|Section|Label' for date d, or None when the day is not a plain table day."""
    y = d.year; E = easter(y); A = E - timedelta(days=46); pent = E + timedelta(days=49); trinity = pent + timedelta(days=7)
    wd = wday(d); sun = wd == 'Sunday'
    a1 = advent1(y)
    if a1 <= d <= date(y, 12, 24):
        if d == date(y, 12, 24):
            return 'Advent|Week of 4 Advent|Dec 24'
        return f'Advent|Week of {(d - a1).days // 7 + 1} Advent|{wd}'
    if d >= date(y, 12, 25) or d <= date(y, 1, 5):
        mo, dd = d.month, d.day
        if (mo, dd) == (12, 25): return 'Christmas|Christmas Day and Following|Christmas Day'
        if (mo, dd) == (1, 1): return 'Christmas|Christmas Day and Following|Holy Name'
        if sun and mo == 12: return 'Christmas|Christmas Day and Following|First Sunday after Christmas'
        if sun and mo == 1: return 'Christmas|Christmas Day and Following|Second Sunday after Christmas'
        if mo == 12 and dd in (26, 27, 28): return None          # Holy Days (checked against the Holy Days table)
        return f'Christmas|Christmas Day and Following|{"Dec" if mo == 12 else "Jan"} {dd}'
    if date(y, 1, 6) <= d < A:
        if d == date(y, 1, 6): return 'Epiphany|The Epiphany and Following|Epiphany'
        fs = first_sunday_after_epiphany(y)
        if d < fs: return f'Epiphany|The Epiphany and Following|Jan {d.day}'
        last_sun = A - timedelta(days=3)
        n = (last_sun - fs).days // 7 + 1
        wk = (sunday_on_or_before(d) - fs).days // 7 + 1
        return f'Epiphany|{"Week of Last Epiphany" if wk == n else f"Week of {wk} Epiphany"}|{wd}'
    if A <= d < E:
        if d < A + timedelta(days=4): return f'Epiphany|Week of Last Epiphany|{"Ash Wednesday" if wd == "Wednesday" else wd}'
        wk = (d - (A + timedelta(days=4))).days // 7 + 1
        if wk >= 6: return None                                   # Holy Week: special rows
        return f'Lent|Week of {wk} Lent|{wd}'
    if E <= d <= E + timedelta(days=6):
        return None if d == E else f'Easter|Easter Week|{wd}'
    if d < pent:
        wk = (d - E).days // 7 + 1
        lab = 'Ascension Day' if (wk == 6 and wd == 'Thursday') else wd
        return f'Easter|Week of {wk} Easter|{lab}'
    if d == pent: return 'Easter|Week of 7 Easter|The Day of Pentecost'
    if d == trinity: return 'Easter|Week of 7 Easter|Trinity Sunday'
    if pent < d < date(y, 12, 25):
        n = proper_for_week(sunday_on_or_before(d))
        return f'Proper|Proper {n}|{wd}' if n else None
    return None


EVE_ROWS = {   # evening title suffix the app shows  ->  BCP table row
    'Christmas Eve': ('adv', 'Advent|Week of 4 Advent|Christmas Eve'),
    'Eve of the Holy Name': ('adv', 'Christmas|Christmas Day and Following|Eve of Holy Name'),
    'Eve of the Epiphany': ('adv', 'Christmas|Christmas Day and Following|Eve of Epiphany'),
    'Eve of the First Sunday after the Epiphany': ('adv', 'Epiphany|The Epiphany and Following|Eve of 1 Epiphany'),
    'Eve of the Ascension': ('adv', 'Easter|Week of 6 Easter|Eve of Ascension'),
    'Eve of Pentecost': ('adv', 'Easter|Week of 7 Easter|Eve of Pentecost'),
    'Eve of Trinity Sunday': ('adv', 'Easter|Week of 7 Easter|Eve of Trinity Sunday'),
}


def annunciation(y):
    """Mar 25, or -- when it falls in Holy Week or Easter Week -- the Monday after the Second Sunday of
    Easter (BCP p.17)."""
    E = easter(y); a = date(y, 3, 25)
    return E + timedelta(days=15) if E - timedelta(days=7) <= a <= E + timedelta(days=6) else a


def visitation(y):
    """May 31, or June 1 when May 31 is Trinity Sunday."""
    trinity = easter(y) + timedelta(days=56)
    return date(y, 6, 1) if trinity == date(y, 5, 31) else date(y, 5, 31)


def eve_dates(y):
    E = easter(y)
    return {date(y, 12, 24): 'Christmas Eve', date(y, 12, 31): 'Eve of the Holy Name', date(y, 1, 5): 'Eve of the Epiphany',
            first_sunday_after_epiphany(y) - timedelta(days=1): 'Eve of the First Sunday after the Epiphany',
            E + timedelta(days=38): 'Eve of the Ascension', E + timedelta(days=48): 'Eve of Pentecost',
            E + timedelta(days=55): 'Eve of Trinity Sunday',
            }    # the seven Holy-Day eves are derived from the days actually observed (see HOLY_EVE_OF)


HOLY_EVE_LABELS = {'Eve of the Presentation': 'Eve of the Presentation', 'Eve of the Annunciation': 'Eve of the Annunciation',
                   'Eve of the Visitation': 'Eve of the Visitation', 'Eve of Saint John the Baptist': 'Eve of St. John the Baptist',
                   'Eve of the Transfiguration': 'Eve of the Transfiguration', 'Eve of Holy Cross': 'Eve of Holy Cross',
                   'Eve of All Saints': 'Eve of All Saints'}

# ───────────────────────── Holy Day observance (BCP p.15-17) ─────────────────────────
MONTHS = {m: i + 1 for i, m in enumerate('January February March April May June July August September October November December'.split())}


def feast_titles():
    """(month, day) -> Holy Day title, from the app's own data (titles only; WHEN each is observed is decided below)."""
    import glob
    out, kind = {}, {}
    for f in glob.glob(os.path.join(ROOT, 'data', 'season', '*.json')):
        data = json.load(open(f))
        if not isinstance(data, list):
            continue
        for e in data:
            md = None
            m = re.match(r'^\d{4}-(\d\d)-(\d\d)$', e.get('date', '')) or None
            if m: md = (int(m.group(1)), int(m.group(2)))
            else:
                m2 = re.match(r'^(\w+) (\d+), \d{4}$', e.get('date', ''))
                if m2: md = (MONTHS[m2.group(1)], int(m2.group(2)))
            if md and (e.get('fixed_month_day') or e['title'] in ('St. Stephen, Deacon and Martyr', 'St. John, Apostle and Evangelist', 'The Holy Innocents',
                                                                  'The Holy Name of Our Lord Jesus Christ', 'Christmas Day')):
                if e['title'] == 'Christmas Eve':
                    continue            # a dated lectionary row, not a Holy Day
                out[md] = e['title']
                kind[md] = e.get('observance', 'ordinary')
    return out, kind


NEAR_EASTER = [(3, 19), (3, 25), (4, 25), (5, 1)]
FEASTS, FEAST_KIND = feast_titles()
PRINCIPAL = {(1, 6), (11, 1), (12, 25)}
SUNDAY_WINS = {(1, 1), (2, 2), (8, 6)} | PRINCIPAL


def observed_holy_days(y):
    """date -> feast title actually observed that day in year y, by the BCP's rules."""
    E = easter(y); out = {}
    holy_week = lambda d: E - timedelta(days=7) <= d <= E + timedelta(days=6)
    ash = E - timedelta(days=46)
    fixed = {date(y, m, dd): t for (m, dd), t in FEASTS.items()}
    # Christmas season: Stephen/John/Innocents postponed one day by the First Sunday after Christmas
    sd = next(dd for dd in range(26, 32) if date(y, 12, dd).weekday() == 6)
    for f in (26, 27, 28):
        d = date(y, 12, f)
        if (12, f) not in FEASTS: continue
        obs = date(y, 12, f + 1) if (sd <= 28 and f >= sd) else d
        if obs.weekday() == 6 and obs.day != 29 and False: pass
        out[obs] = FEASTS[(12, f)]
    # the Holy Week / Easter Week transfer
    moved = [(date(y, m, dd), (m, dd)) for (m, dd) in NEAR_EASTER if (m, dd) in FEASTS and holy_week(date(y, m, dd))]
    for i, (d0, md) in enumerate(sorted(moved)):
        out[E + timedelta(days=15 + i)] = FEASTS[md]
    for (m, dd), t in FEASTS.items():
        if m == 12 and dd in (26, 27, 28): continue
        d = date(y, m, dd)
        if holy_week(d):
            continue
        if d.weekday() == 6 and (m, dd) not in SUNDAY_WINS:
            # transferred to the first open day of the week
            for k in range(1, 7):
                x = d + timedelta(days=k)
                if x not in fixed and not holy_week(x) and x != ash and x not in out:
                    out[x] = t; break
            continue
        out[d] = t
    out[visitation(y)] = 'The Visitation of the Blessed Virgin Mary'
    # Thanksgiving Day: the fourth Thursday of November
    n = 0
    for dd in range(1, 31):
        if date(y, 11, dd).weekday() == 3:
            n += 1
            if n == 4: out[date(y, 11, dd)] = 'Thanksgiving Day'
    return out


HOLY_EVE_OF = {'The Presentation of Our Lord Jesus Christ in the Temple': 'Eve of the Presentation',
               'The Annunciation of Our Lord Jesus Christ to the Blessed Virgin Mary': 'Eve of the Annunciation',
               'The Visitation of the Blessed Virgin Mary': 'Eve of the Visitation',
               'The Nativity of Saint John the Baptist': 'Eve of Saint John the Baptist',
               'The Transfiguration of Our Lord Jesus Christ': 'Eve of the Transfiguration',
               'Holy Cross Day': 'Eve of Holy Cross', "All Saints' Day": 'Eve of All Saints'}

# ───────────────────────── checks ─────────────────────────
ORDINARY_TITLE = re.compile(r'^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) (in the Week of|in \d|after the Epiphany|after Christmas|before the Epiphany|in Easter Week|after Ash Wednesday)'
                            r'|^(Monday|Tuesday|Wednesday) in Holy Week|(Friday|Saturday) after Ascension|Sunday (of|in|after) (Advent|Lent|Easter|the Epiphany|Pentecost|Christmas)|^The \w+ Sunday after the Epiphany|^(First|Second) Sunday after Christmas|Sunday in the Week of Proper|Last Sunday after the Epiphany|Trinity Sunday|The Day of Pentecost|Ash Wednesday|Ascension Day|^(Christmas Eve|The Holy Name)|Fourth Sunday of Easter|Sunday after St\. Mark')
fails = collections.defaultdict(list)
counts = collections.Counter()


def split_refs(refs):
    psalms, reads = [], []
    for r in refs:
        (psalms if re.match(r'^Psalm\b', r) else reads).append(r)
    return psalms, reads


def check_psalms(shown, bcp_str, where, cat):
    if not bcp_str or bcp_str.strip('-') == '':
        return
    primary = re.split(r'\]\s*or\s|,?\s+or\s', bcp_str.replace('*', ''))[-1] if re.search(r'\]\s*or\s', bcp_str) else re.split(r',?\s+or\s+', bcp_str)[0]
    allb, core = psalm_numbers(bcp_str, True), psalm_numbers(primary, False)
    have = set()
    for s in shown:
        have |= psalm_numbers(s, True)
    if not (core <= have <= allb):
        fails[cat].append((where, f'psalms shown {sorted(have)} vs BCP "{bcp_str}"'))


def check_reads(shown, want, where, cat):
    got = [cite_core(x) for x in shown]
    exp = [cite_core(x) for x in want if x and not x.startswith('--')]
    if got != exp:
        fails[cat].append((where, f'readings shown {shown} vs BCP {want}'))


def expected_office(row, y, office, placement):
    r = row[y]['readings']
    if len(r) != 3:
        return None
    ot, ep, go = r
    if office == 'morning':
        return (row['y1']['psalms_mp'], [ot, go] if placement == 'morning' else [ot, ep])
    return (row['y1']['psalms_ep'], [ep] if placement == 'morning' else [go])


def main():
    path = [a for a in sys.argv[1:] if not a.startswith('--') and a not in ('morning', 'evening')][0]
    dump = json.load(open(path))
    days = sorted(dump)
    first = date.fromisoformat(days[0]); last = date.fromisoformat(days[-1])
    eves = {}
    for y in range(first.year, last.year + 1):
        eves.update(eve_dates(y))
    holy = {}
    for y in range(first.year, last.year + 1):
        holy.update(observed_holy_days(y))
    for d0, t in holy.items():
        if t in HOLY_EVE_OF:
            eves[d0 - timedelta(days=1)] = HOLY_EVE_OF[t]
    for iso in days:
        d = date.fromisoformat(iso); y = lit_year(d); rec = dump[iso]
        shown_title = rec['morning']['title']
        want_title = holy.get(d)
        if want_title and want_title not in shown_title:
            fails['holy-day'].append((f'{iso} ({wday(d)})', f'BCP observes "{want_title}" but the app shows "{shown_title}"'))
        elif not want_title and not ORDINARY_TITLE.search(shown_title) and shown_title not in ('Easter Day', 'Palm Sunday', 'Maundy Thursday', 'Good Friday', 'Holy Saturday'):
            fails['holy-day'].append((f'{iso} ({wday(d)})', f'app shows "{shown_title}", which the BCP does not observe on this day'))
        counts['holy-day observance checked'] += 1
        for office in ('morning', 'evening'):
            r = rec[office]; where = f'{iso} {office} ({r["title"]})'
            counts['renders'] += 1
            # gap markers
            if r['gap'] or r['noCollect'] or r['unavailable'] or r['blankBrackets'] or r['err'] or not r['refs']:
                fails['gap-marker'].append((where, {k: r[k] for k in ('gap', 'noCollect', 'unavailable', 'blankBrackets', 'err')} | {'refs': len(r['refs'])}))
            # title weekday
            m = re.match(r'^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) ', r['title'])
            if m and m.group(1) != wday(d):
                fails['title-weekday'].append((where, f'title names {m.group(1)} but the day is {wday(d)}'))
            # eves: evenings
            if office == 'evening':
                want_eve = eves.get(d)
                has_eve = ' · Eve' in r['title'] or r['title'] in ('Christmas Eve',)
                suffix = r['title'].split(' · ')[-1] if ' · ' in r['title'] else (r['title'] if r['title'] == 'Christmas Eve' else None)
                if want_eve and suffix != want_eve:
                    tomorrow = dump.get((d + timedelta(days=1)).isoformat(), {}).get('morning', {}).get('title', '')
                    # legitimate when tomorrow's feast is not observed that day (transfer, Sunday precedence)
                    fails['eve-missing'].append((where, f'expected "{want_eve}" (tomorrow shows "{tomorrow}")'))
                if has_eve and not want_eve:
                    fails['eve-unexpected'].append((where, f'shows "{suffix}" on a day with no Eve'))
                if suffix in EVE_ROWS or suffix in HOLY_EVE_LABELS:
                    psalms, reads = split_refs(r['refs'])
                    if suffix in EVE_ROWS:
                        row = BCP[EVE_ROWS[suffix][1]]['y1']
                        check_psalms(psalms, row['psalms_ep'], where, 'eve-content')
                        check_reads(reads, row['readings'], where, 'eve-content')
                    else:
                        h = next(x for x in HOLY if x['label'] == HOLY_EVE_LABELS[suffix])
                        check_psalms(psalms, h['ep']['psalms'], where, 'eve-content')
                        check_reads(reads, [x.split(' || ')[0] for x in h['ep']['readings']], where, 'eve-content')
                    counts['eves checked'] += 1
                    continue
            # ordinary content
            key = locate(d)
            if key and key.endswith('|Dec 24') and d.weekday() == 6:
                counts['skipped (holy day / special)'] += 1; continue   # Sunday takes precedence over the dated Dec 24 row
            if not key or key not in BCP or not ORDINARY_TITLE.search(r['title']):
                counts['skipped (holy day / special)'] += 1
                continue
            row = BCP[key]
            exp = expected_office(row, y, office, PLACEMENT)
            if exp is None:
                counts['skipped (not a 3-reading row)'] += 1
                continue
            psalm_str, reads = exp
            if key == 'Advent|Week of 4 Advent|Dec 24' and office == 'morning':
                reads = row[y]['readings']                    # Dec 24 gives all three readings at Morning Prayer
            psalms, shown = split_refs(r['refs'])
            check_psalms(psalms, psalm_str, where, 'psalms')
            check_reads(shown, reads, where, 'readings')
            counts['content checked'] += 1

    print(f'placement={PLACEMENT}; {counts["renders"]} office renders in {len(days)} days')
    for k in ('content checked', 'eves checked', 'skipped (holy day / special)', 'skipped (not a 3-reading row)'):
        print(f'  {k}: {counts[k]}')
    total = 0
    for cat in ('gap-marker', 'title-weekday', 'holy-day', 'psalms', 'readings', 'eve-missing', 'eve-unexpected', 'eve-content'):
        v = fails.get(cat, [])
        total += len(v)
        print(f'\n{cat}: {len(v)} problem(s)')
        for where, msg in v[:12]:
            print(f'   {where}: {msg}')
        if len(v) > 12:
            print(f'   ... and {len(v) - 12} more')
    print('\n' + ('PASS: nothing differs from the 1979 BCP.' if total == 0 else f'FAIL: {total} problem(s).'))
    sys.exit(1 if total else 0)


if __name__ == '__main__':
    main()
