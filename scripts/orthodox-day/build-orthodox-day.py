#!/usr/bin/env python3
"""Build data/orthodox-day/<year>.json from cached orthocal.info API responses
(https://orthocal.info/api/gregorian/Y/M/D/ -- Slavic/OCA tradition, new calendar).

Only FACTS are kept: the day's fasting level and abstentions, the appointed scripture
citations, feast rank, tone. The saints' "stories" (prose lives) are deliberately NOT copied.
Usage: python3 build-orthodox-day.py [--old] <cache-dir-with-YYYY-MM-DD.json files> [years...]
--old: the cache holds orthocal.info /api/julian/ responses (keyed by CIVIL date; Old Calendar); output goes to data/orthodox-day/old/.
"""
import json, os, sys
args = sys.argv[1:]
old = '--old' in args
args = [a for a in args if a != '--old']
cache = args[0]
years = [int(y) for y in args[1:]] or [2026, 2027]
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'orthodox-day') + ('/old' if old else '')
os.makedirs(OUT, exist_ok=True)
for year in years:
    days = {}
    for fn in sorted(os.listdir(cache)):
        if not fn.startswith(str(year)) or not fn.endswith('.json'): continue
        d = json.load(open(os.path.join(cache, fn)))
        days[fn[:-5]] = {
            'title': d.get('summary_title') or None,
            'titles': d.get('titles') or [],
            'tone': d.get('tone'),
            'feast_level': d.get('feast_level'),
            'feast_level_description': d.get('feast_level_description'),
            'feasts': d.get('feasts') or [],
            'saints': d.get('saints') or [],
            'fast': {
                'level': d.get('fast_level'),
                'description': d.get('fast_level_desc'),
                'exception': d.get('fast_exception'),
                'exception_description': d.get('fast_exception_desc') or None,
                'abstentions': d.get('fast_abstentions') or [],
            },
            'readings': [
                {'source': r.get('source'), 'description': r.get('description') or None,
                 'display': r.get('display')}
                for r in (d.get('readings') or []) if r.get('display')
            ],
        }
    json.dump({
        'schema': 'orthodox-day/1',
        'source': 'orthocal.info API (Orthodox lectionary and calendar data; Slavic/OCA tradition, ' + ('Old (Julian) calendar, keyed by civil date' if old else 'new calendar') + '), fetched 2026-10-0%d.' % (2 if old else 1) + ' Facts only (citations, fast rules); prose lives not copied.',
        'year': year,
        'days': days,
    }, open(os.path.join(OUT, '%d.json' % year), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(year, len(days))
