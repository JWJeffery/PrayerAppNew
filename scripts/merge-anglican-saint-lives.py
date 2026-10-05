#!/usr/bin/env python3
"""Merge per-month saint-life files (scratch dir) into data/saints/anglican-lives.json, validating each entry.
Usage: python3 scripts/merge-anglican-saint-lives.py [scratch_dir]   (default /tmp/claude-0/saints)"""
import json, sys, glob, os, re
scratch = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/saints'
target = 'data/saints/anglican-lives.json'
cur = json.load(open(target)) if os.path.exists(target) else {"schema": "anglican-saint-lives/1", "note": "Original short lives written for this app from published sources (see each entry); no source text copied. Keyed by the saint's identifier in data/kalendar/synaxarium/decisions.json.", "lives": {}}
inputs = {}
for f in glob.glob(f'{scratch}/in*/*.json'):
    for e in json.load(open(f)): inputs[e['sin']] = e
problems = []
added = 0
for f in sorted(glob.glob(f'{scratch}/out*/*.json')):
    try: d = json.load(open(f))['lives']
    except Exception as ex: problems.append((f, 'unreadable: %s' % ex)); continue
    for sin, v in d.items():
        if sin not in inputs: problems.append((sin, 'unknown sin')); continue
        n = len(v.get('life', '').split())
        issues = []
        if not 60 <= n <= 125: issues.append(f'{n} words')
        if len(v.get('sources', [])) < 2: issues.append('fewer than 2 sources')
        if v.get('confidence') not in ('high', 'medium', 'low'): issues.append('bad confidence')
        if re.search(r'commemorat|calendar|Lesser Feasts|feast day|Holy Women', v.get('life', ''), re.I): issues.append('mentions records/calendar')
        if issues: problems.append((inputs[sin]['name'], '; '.join(issues)))
        cur['lives'][sin] = v; added += 1
missing = [e['name'] for s, e in inputs.items() if s not in cur['lives']]
json.dump(cur, open(target, 'w'), indent=1, ensure_ascii=False)
print(f'{len(cur["lives"])} lives in file ({added} read this run); still missing {len(missing)} of {len(inputs)}')
for p in problems: print('CHECK', p)
