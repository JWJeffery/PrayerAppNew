#!/usr/bin/env python3
"""Merge newly downloaded, license-verified Commons icons into data/icons/commemoration-icons.json and images/icons/.
Inputs (kept outside the repo): <scratch>/icons_batch_*.json (agent search results), <scratch>/ic2ver.json (license re-check),
<scratch>/ic2/<id>.jpg (downloads). Skips ids already present and files that are not valid images."""
import json, glob, re, os, sys
from PIL import Image
S = sys.argv[1].rstrip('/') + '/'
cand = {}
for f in sorted(glob.glob(S + 'icons_batch_*.json')):
    for k, v in json.load(open(f)).items():
        if v: cand[k] = v
ver = json.load(open(S + 'ic2ver.json'))
idmap = {}
for f in glob.glob('data/menaion/[a-z]*.json'):
    for k, v in (json.load(open(f)).get('dates') or {}).items():
        for c in v['commemorations']: idmap[c['id']] = (k, c['name'])
p = 'data/icons/commemoration-icons.json'; d = json.load(open(p))
have = {r['id'] for l in d['byDate'].values() for r in l} | set(d['moveable'])
def clean(t):
    t = re.sub(r'<[^>]+>', '', t or ''); t = re.sub(r'(Unknown)+', 'Unknown', t); return re.sub(r'\s+', ' ', t).strip()
added = []
for k in sorted(set(cand) - have):
    f = S + f'ic2/{k}.jpg'
    if not os.path.exists(f) or k not in idmap or k in ('apostle-timothy', 'boniface-tarsus'): continue
    try: im = Image.open(f); im.load()
    except Exception: continue
    v = cand[k]; lic = ver[v['file']][0]
    im = im.convert('RGB'); im.thumbnail((500, 900)); im.save(f'images/icons/{k}.jpg', 'JPEG', quality=86)
    mmdd, name = idmap[k]
    d['byDate'].setdefault(mmdd, []).append({'id': k, 'image': f'images/icons/{k}.jpg', 'title': v['file'][5:].rsplit('.', 1)[0], 'page': v['page'],
        'artist': clean(v['artist']), 'date': clean(v['date']), 'license': 'CC0' if 'CC0' in lic else 'Public domain', 'name': name})
    added.append((k, v['file'], v['description'][:70]))
json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)
for a in added: print('added', a)
print(len(added), 'added')
