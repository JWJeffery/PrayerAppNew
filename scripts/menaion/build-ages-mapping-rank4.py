#!/usr/bin/env python3
"""Candidate finder for AGES rank-4 Vespers stichera (run from the repo root). Prints candidates only; the
approved list (all 58 read hymn by hymn on 2026-10-02, generic-name tokens excluded) was written to
data/menaion/ages/mapping-rank4.json from this output. Generic tokens excluded: compan, wonder, first, john, martyr, etc.
"""
import json,glob,re,os
ages={}
for f in glob.glob('data/menaion/ages/[0-9][0-9].json'): ages.update(json.load(open(f))['dates'])
STOP=set('saint saints holy venerable martyr martyrs apostle apostles bishop archbishop patriarch hieromartyr our father among the of and with his her their great monk nun righteous prophet confessor wonderworker wonder-worker equal-to-the-apostles metropolitan abbot priest deacon archdeacon king emperor prince virgin mother miracle lord first-called evangelist theologian new relics translation finding synaxis church repose'.split())
rank4=[]
for f in glob.glob('data/menaion/[a-z]*.json'):
    if os.path.basename(f) in('schema.json','research-batch.json','research-queue.json'): continue
    for k,v in json.load(open(f)).get('dates',{}).items():
        for e in v['commemorations']:
            if e['rank']==4: rank4.append((k,e))
cand=[]
for k,e in sorted(rank4,key=lambda x:(x[0],x[1]['id'])):
    day=ages.get(k)
    if not day: continue
    items=[i for i in day['slots'].get('vespers_stichera',[]) if i['role']=='n']
    if len(items)<3: continue
    words=[w for w in re.findall(r"[A-Za-z']{4,}",e['name'].lower()) if w not in STOP]
    toks=[w[:6] for w in words]
    hits=[i for i in items if any(t in i['text'].lower() for t in toks)]
    ok=len(hits)==len(items) or (len(items)==3 and len({i['mode'] for i in items})==1 and len(hits)>=2)
    if ok: cand.append((k,e['id'],e['name'][:60],toks,len(items),len(hits)))
if __name__=='__main__':
    print(len(rank4),len(cand))
    for c in cand: print(c)
