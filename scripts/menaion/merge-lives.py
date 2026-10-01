#!/usr/bin/env python3
"""Merge data/menaion/lives/batch-*.json into data/menaion/lives/lives.json.

Batches are written by research subagents (original 2-4 sentence lives). This merge:
  - drops source URLs that no longer resolve (urlcheck json: url -> HTTP status),
  - sets confidence 'high' only when >= 2 distinct source domains remain, else 'medium'/'low' as given,
  - EXCLUDES entries whose calendar identity differs from the app's own entry (listed in EXCLUDE) --
    those need a data fix first, not a life written for a different saint.
Usage: merge-lives.py <urlcheck.json>
"""
import json, glob, os, sys
from urllib.parse import urlparse
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
DIR = os.path.join(ROOT, 'data', 'menaion', 'lives')
EXCLUDE = {  # identity mismatches fixed 2026-10-01 -- kept as a mechanism, now empty
}
_OLD_EXCLUDE = {
 'thomas-apostle': 'Calendar for Jul 7 is Ven. Thomas of Mt Maleon (+ Martyr Kyriake); the app entry says Apostle Thomas (who is Oct 6).',
 'irene-great-martyr': 'Calendar for Apr 16 is Martyrs Agape, Irene and Chionia (three sisters); Great Martyr Irene is May 5.',
 'fathers-council-nicaea': 'Calendar for Jan 14 gives Nina of Georgia, the Sinai/Raithu fathers and Sava of Serbia; the Nicaea fathers are kept on a Sunday of the Paschal season.',
}
urlcheck = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else {}
out, report = {}, {'merged': 0, 'excluded': {}, 'flags': {}}
for f in sorted(glob.glob(os.path.join(DIR, 'batch-*.json'))):
    for cid, v in json.load(open(f)).items():
        if cid in EXCLUDE: report['excluded'][cid] = EXCLUDE[cid]; continue
        if not v.get('life'): report['excluded'][cid] = 'no life written: ' + (v.get('flags') or ''); continue
        srcs = [u for u in (v.get('sources') or []) if urlcheck.get(u, '200') == '200']
        domains = {urlparse(u).netloc.replace('www.', '') for u in srcs}
        conf = v.get('confidence') or 'medium'
        if conf == 'high' and len(domains) < 2: conf = 'medium'
        out[cid] = {'life': v['life'].strip(), 'period': v.get('period'), 'place': v.get('place'),
                    'confidence': conf, 'sources': srcs}
        if v.get('flags'): report['flags'][cid] = v['flags']
        report['merged'] += 1
json.dump({'schema': 'menaion-lives/1',
           'note': 'Original short summaries written for this app from published sources (see each entry); no source text copied.',
           'lives': out}, open(os.path.join(DIR, 'lives.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(report, open(os.path.join(DIR, 'merge-report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(report['merged'], 'merged;', len(report['excluded']), 'excluded;', len(report['flags']), 'flagged')
