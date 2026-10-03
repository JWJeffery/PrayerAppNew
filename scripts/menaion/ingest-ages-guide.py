#!/usr/bin/env python3
"""Build data/menaion/ages/guide/<MM>.json: hymn METADATA (tone, melody, count) from the AGES Menaion day files
(AGES-Initiatives/alwb-library-en-us-goadedes, CC0), for slots where the app has no text.

Per dated day: the day's commemoration TITLES (resolved from the library's titles file, used to verify which saint the
file is about) and, per slot kind, the ordered hymns {role, index, mode, melody}. NO hymn text is stored here.

Usage: python3 scripts/menaion/ingest-ages-guide.py /path/to/alwb.library_en_US_goadedes
"""
import json, os, re, sys, glob
LIB = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'menaion', 'ages', 'guide')
LINE = re.compile(r'^([\w.]+)\s*=\s*(.*?)\s*(//.*)?$')

res = {}   # resource name -> {key: raw value}
for f in glob.glob(os.path.join(LIB, '**', '*.ares'), recursive=True):
    name, kv = None, {}
    for line in open(f, encoding='utf-8'):
        s = line.strip()
        m = LINE.match(s)
        if not m: continue
        if m.group(1) == 'A_Resource_Whose_Name': name = m.group(2); continue
        kv[m.group(1)] = m.group(2)
    if name: res[name] = kv

def lit(v):
    return v[1:-1] if v and v.startswith('"') and v.endswith('"') and len(v) > 2 else None

def resolve(v, depth=0):
    """A literal string, or a reference 'resource.key' resolved through the library (<=4 hops)."""
    if v is None: return None
    l = lit(v)
    if l is not None: return l
    if v == '""' or depth > 4: return None
    m = re.match(r'^(.+?_en_US_goadedes)\.(.+)$', v)
    if m and m.group(1) in res:
        return resolve(res[m.group(1)].get(m.group(2)), depth + 1)
    return None

def mode_of(v):
    m = re.search(r'Mode(\d)$', v or '')
    return int(m.group(1)) if m else None

KINDS = {
  'vespers_stichera':  [(r'meVE\.Stichera(\d+)', 'n'), (r'meVE\.SticGlory', 'glory'), (r'meVE\.SticBoth', 'both'), (r'meVE\.SticTheotokion', 'theotokion')],
  'vespers_aposticha': [(r'meVE\.Aposticha(\d+)', 'n'), (r'meVE\.AposGlory', 'glory'), (r'meVE\.AposBoth', 'both'), (r'meVE\.AposTheotokion', 'theotokion')],
  'sessional':         [(r'meMA\.Kathisma(\d)(\d)', 'n'), (r'meMA\.Kathisma(\d)T', 'theotokion')],
  'exapostilarion':    [(r'meMA\.Exaposteilarion(\d+)', 'n'), (r'meMA\.ExapTheotokion', 'theotokion')],
  'praises':           [(r'meMA\.Lauds(\d+)', 'n'), (r'meMA\.LaudsGlory', 'glory'), (r'meMA\.LaudsBoth', 'both'), (r'meMA\.LaudsTheotokion', 'theotokion')],
}

by_month = {}
for name, kv in sorted(res.items()):
    m = re.match(r'^me\.m(\d\d)\.d(\d\d)_en_US_goadedes$', name)
    if not m: continue
    mm, dd = m.groups(); key = f'{mm}-{dd}'
    titles = []
    for t in ('first_title', 'second_title'):
        v = resolve(kv.get('meDA.commemoration.' + t))
        if v: titles.append(v)
    slots = {}
    for kind, pats in KINDS.items():
        items = []
        for rx, role in pats:
            seen = set()
            for k in kv:
                mm_ = re.fullmatch(rx + r'\.mode', k)
                if not mm_: continue
                base = k[:-5]
                if base in seen: continue
                seen.add(base)
                md = mode_of(kv[k])
                if md is None: continue
                mel = resolve(kv.get(base + '.melody')) or resolve(kv.get(base + '.name'))
                idx = [int(g) for g in mm_.groups()]
                items.append({'role': role, 'index': idx, 'mode': md, 'melody': mel,
                              'has_text': lit(kv.get(base + '.text')) is not None})
        if items:
            order = {'n': 0, 'glory': 1, 'both': 2, 'theotokion': 3}
            items.sort(key=lambda i: (order[i['role']], i['index']))
            slots[kind] = items
    if slots or titles:
        by_month.setdefault(mm, {})[key] = {'titles': titles, 'slots': slots}

os.makedirs(OUT, exist_ok=True)
for mm, days in by_month.items():
    json.dump({'schema': 'menaion-ages-guide/1',
               'source': 'AGES-Initiatives/alwb-library-en-us-goadedes (Fr. Seraphim Dedes, GOA English), CC0 1.0 -- metadata only, no hymn text',
               'usage': 'Greek Archdiocese (GOA) usage, new calendar', 'dates': days},
              open(os.path.join(OUT, mm + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(sum(len(d) for d in by_month.values()), 'days;', len(res), 'resources indexed')
