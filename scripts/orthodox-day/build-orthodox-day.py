#!/usr/bin/env python3
"""Build data/orthodox-day/<year>.json from cached orthocal.info API responses
(https://orthocal.info/api/gregorian/Y/M/D/ -- Slavic/OCA tradition, new calendar).

Only FACTS are kept: the day's fasting level and abstentions, the appointed scripture
citations, feast rank, tone. The saints' "stories" (prose lives) are deliberately NOT copied.
Usage: python3 build-orthodox-day.py <cache-dir-with-YYYY-MM-DD.json files> [years...]
"""
import json, os, sys
cache = sys.argv[1]
years = [int(y) for y in sys.argv[2:]] or [2026, 2027]
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'orthodox-day')
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
        'source': 'orthocal.info API (Orthodox lectionary and calendar data; Slavic/OCA tradition, new calendar), fetched 2026-10-01. Facts only (citations, fast rules); prose lives not copied.',
        'year': year,
        'days': days,
    }, open(os.path.join(OUT, '%d.json' % year), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(year, len(days))
