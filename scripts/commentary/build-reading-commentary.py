#!/usr/bin/env python3
"""Build data/commentary/readings/<year>.json: one verbatim public-domain patristic excerpt per
appointed Epistle/Gospel/Matins-Gospel citation in data/orthodox-day/<year>.json.

Source: HistoricalChristianFaith/Commentaries-Database (clone path = argv[1]). Only translations
that are public domain are used (whitelist below): Chrysostom's NPNF homilies, Augustine's NPNF
tractates, Cyril of Alexandria on John/Luke (Pusey, Payne Smith), and the Catena Aurea (Neale/Newman).
Theophylact (modern Holy House translation) and modern scholarly translations are NOT used.
"""
import json, re, sys, os, glob, collections
REPO = sys.argv[1]
OUT = 'data/commentary/readings'
AUTH = {  # author -> (priority, allowed source_title regex)
  'John Chrysostom': (0, r'^Homily on|^Catena Aurea'),
  'Cyril of Alexandria': (1, r'^Commentary on the Gospel of John|^COMMENTARY ON LUKE|^Catena Aurea'),
  'Augustine of Hippo': (2, r'^Tractates on John|^Catena Aurea|^Exposition'),
  'Gregory the Dialogist': (3, r'^Catena Aurea'),
  'Jerome': (3, r'^Catena Aurea'), 'Ambrose of Milan': (3, r'^Catena Aurea'),
  'Origen of Alexandria': (4, r'^Catena Aurea'), 'Bede': (4, r'^Catena Aurea'),
}
SRC_PRI = lambda t: 0 if t.startswith('Homily') or t.startswith('Tractates') or t.startswith('Commentary on the Gospel') or t.startswith('COMMENTARY') else 1

def parse_toml(path):
    s = open(path, encoding='utf8').read()
    q = re.search(r"quote='''\n?(.*?)'''", s, re.S)
    u = re.search(r"source_url='([^']*)'", s); t = re.search(r'source_title="([^"]*)"', s) or re.search(r"source_title='([^']*)'", s)
    if not q: return None
    return q.group(1).strip(), (u.group(1) if u else ''), (t.group(1) if t else '')

NAME = re.compile(r'^(.*) (\d+)_(\d+)(?:-(?:(\d+)_)?(\d+))?\.toml$')
index = collections.defaultdict(list)   # book -> [(start,end,author,path)]
for a in AUTH:
    for p in glob.glob(f'{REPO}/{a}/*.toml'):
        m = NAME.match(os.path.basename(p))
        if not m: continue
        book, c, v, c2, v2 = m.groups()
        st = (int(c), int(v)); en = (int(c2 or c), int(v2 or v))
        index[book].append((st, en, a, p))

def parse_ref(ref):
    m = re.match(r'^((?:\d\s)?[A-Za-z]+(?: [A-Za-z]+)*?)\s+(\d.*)$', ref.strip())
    if not m: return None
    book, rest = m.groups(); book = {'Matt': 'Matthew'}.get(book, book)
    ivs = []; chap = None
    for piece in re.split(r'[;,]', rest):
        piece = piece.strip()
        if not piece: continue
        mm = re.match(r'^(?:(\d+)\.)?(\d+)(?:-(?:(\d+)\.)?(\d+))?$', piece)
        if not mm: return None
        c1, v1, c2, v2 = mm.groups()
        if c1: chap = int(c1)
        if chap is None: return None
        s = (chap, int(v1)); 
        if c2: chap = int(c2)
        e = (chap, int(v2)) if v2 else s
        ivs.append((s, e))
    return book, ivs

def pick(ref):
    pr = parse_ref(ref)
    if not pr: return None
    book, ivs = pr
    lo = min(i[0] for i in ivs); hi = max(i[1] for i in ivs)
    cands = []
    for st, en, a, p in index.get(book, []):
        if en < lo or st > hi: continue
        ov = any(not (en < s or st > e) for s, e in ivs)
        if not ov: continue
        contained = st >= lo and en <= hi
        pa, srcre = AUTH[a]
        d = parse_toml(p)
        if not d or not re.search(srcre, d[2]): continue
        if len(d[0]) < 300: continue
        cands.append(((0 if contained else 1), pa, SRC_PRI(d[2]), -(len(d[0]) // 1500), st, a, d))
    if not cands: return None
    cands.sort(key=lambda x: x[:5])
    c = cands[0]; a = c[5]; q, url, title = c[6]
    return {'father': a, 'work': title, 'url': url.replace('%2520', '%20'), 'excerpt': excerpt(q), 'partial': bool(c[0])}

def excerpt(q, limit=1100):
    q = re.sub(r'^\((?:[^)]{2,60})\)\s*', '', q.strip())   # Catena Aurea source-reference prefix
    paras = [p.strip() for p in re.split(r'\n\s*\n', q) if p.strip()]
    out = ''
    for p in paras:
        if out and len(out) + len(p) > limit:
            break
        out += ('\n\n' if out else '') + p
        if len(out) >= limit * 0.6: break
    if len(out) > limit * 1.4:   # one very long paragraph: cut at a sentence end
        cut = out[:limit]; k = max(cut.rfind('. '), cut.rfind('? '), cut.rfind('! '))
        out = cut[:k + 1] if k > 300 else cut
    full = out.strip() == q.strip()
    return out.strip() + ('' if full else ' …')

for yf in sorted(glob.glob('data/orthodox-day/20*.json')):
    d = json.load(open(yf)); year = d['year']; res = {}; refs = set(); miss = set()
    for day in d['days'].values():
        for r in day.get('readings', []):
            if r.get('source') in ('Epistle', 'Gospel') or str(r.get('source', '')).endswith('Matins Gospel'):
                refs.add(r['display'].replace('​', ''))
    for ref in sorted(refs):
        parts = [x for x in re.split(r'\s*;\s*', ref)]
        h = pick(parts[0]) if len(parts) == 1 else pick(parts[0])
        if h: res[ref] = h
        else: miss.add(ref)
    json.dump({'schema': 'universal_office_reading_commentary_v1', 'year': year,
               'source': 'HistoricalChristianFaith/Commentaries-Database (public-domain translations only)',
               'entries': res}, open(f'{OUT}/{year}.json', 'w'), ensure_ascii=False, indent=1)
    print(year, 'refs', len(refs), 'hit', len(res), 'miss', len(miss), sorted(miss)[:12])
