#!/usr/bin/env python3
"""Build data/menaion/ages/guide/mapping.json: the commemorations for which the AGES hymn METADATA
(tone, melody, count) may be shown where the app has no text.

Only rank 1-2 entries: their identity is fixed by the calendar date (Great Feasts, Feasts of the Lord and Theotokos,
Apostles/Evangelists, the great Fathers) so the AGES day file cannot be about a different saint. Excluded as Slavic-only
(AGES/Greek usage keeps something else that day): Seraphim of Sarov (Jan 2) and the Protection of the Theotokos (Oct 1).
Rank 3-4 saints are NOT included: their AGES day files mix in forefeast/other hymns whose slots cannot be attributed
without the hymn text (see documentation/MENAION_AGES.md).
"""
import json, glob, os
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
EXCLUDE = {'seraphim-sarov': 'Slavic-only commemoration', 'protection-theotokos': 'Slavic-only feast; Greek usage keeps another commemoration on Oct 1'}
guide = {}
for f in glob.glob(os.path.join(ROOT, 'data/menaion/ages/guide/[0-9][0-9].json')): guide.update(json.load(open(f))['dates'])
out = []
for f in sorted(glob.glob(os.path.join(ROOT, 'data/menaion/[a-z]*.json'))):
    if os.path.basename(f) in ('schema.json', 'research-batch.json', 'research-queue.json'): continue
    for k, v in sorted(json.load(open(f))['dates'].items()):
        for e in v['commemorations']:
            if e['rank'] in (1, 2) and e['id'] not in EXCLUDE and guide.get(k, {}).get('slots'):
                out.append({'id': e['id'], 'mmdd': k, 'name': e['name'], 'rank': e['rank']})
json.dump({'schema': 'menaion-ages-guide-mapping/1', 'excluded': EXCLUDE, 'entries': out},
          open(os.path.join(ROOT, 'data/menaion/ages/guide/mapping.json'), 'w'), indent=1, ensure_ascii=False)
print(len(out), 'entries')
