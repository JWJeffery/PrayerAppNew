#!/usr/bin/env python3
"""Ingest literal Menaion hymn texts from the AGES English library (Fr. Seraphim Dedes,
GOA translations; repo AGES-Initiatives/alwb-library-en-us-goadedes, CC0 1.0) into
data/menaion/ages/<MM>.json, keyed MM-DD.

Only QUOTED literal texts are kept, plus references that point to another Menaion day file
(resolved up to 3 hops). References into Octoechos/Heirmologion/etc. are NOT followed and
are counted as `unresolved`. Nothing is edited. Empty `""` fields are omitted.

Usage: python3 scripts/menaion/ingest-ages-menaion.py /path/to/Books-Collections/Menaion
"""
import json, os, re, sys, glob
src = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'menaion', 'ages')
LINE = re.compile(r'^([\w.]+)\s*=\s*(.*?)\s*(//.*)?$')

def read(path):
    kv = {}
    for line in open(path, encoding='utf-8'):
        m = LINE.match(line.strip())
        if not m: continue
        kv[m.group(1)] = m.group(2)
    return kv

files = {}
for f in glob.glob(os.path.join(src, 'm*', 'me.m*.d*_en_US_goadedes.ares')):
    name = os.path.basename(f).replace('_en_US_goadedes.ares', '')   # me.m11.d24
    files[name] = read(f)

def literal(v):
    if v.startswith('"') and v.endswith('"') and len(v) > 2:
        return v[1:-1]
    return None

def resolve(file, key, depth=0):
    """Return text for key in a day file, following Menaion-day references."""
    v = files.get(file, {}).get(key)
    if v is None: return None
    lit = literal(v)
    if lit is not None: return lit
    if depth >= 3: return None
    m = re.match(r'^(me\.m\d\d\.d\w\w)_en_US_goadedes\.(.+)$', v)
    if m: return resolve(m.group(1), m.group(2), depth + 1)
    return None

def mode(file, base):
    v = files[file].get(base + '.mode', '')
    m = re.search(r'Mode(\d)$', v)
    return int(m.group(1)) if m else None

GROUPS = {   # slot -> list of (key-regex, role)
  'vespers_stichera':  [(r'meVE\.Stichera(\d+)', 'n'), (r'meVE\.SticGlory', 'glory'), (r'meVE\.SticTheotokion', 'theotokion'), (r'meVE\.SticBoth', 'both')],
  'vespers_aposticha': [(r'meVE\.Aposticha(\d+)', 'n'), (r'meVE\.AposGlory', 'glory'), (r'meVE\.AposTheotokion', 'theotokion'), (r'meVE\.AposBoth', 'both')],
  'sessional':         [(r'meMA\.Kathisma(\d)(\d)', 'n'), (r'meMA\.Kathisma(\d)T', 'theotokion')],
  'exapostilarion':    [(r'meMA\.Exaposteilarion(\d+)', 'n'), (r'meMA\.ExapTheotokion', 'theotokion')],
  'praises':           [(r'meMA\.Lauds(\d+)', 'n'), (r'meMA\.LaudsGlory', 'glory'), (r'meMA\.LaudsTheotokion', 'theotokion'), (r'meMA\.LaudsBoth', 'both')],
}

def extract(file):
    kv = files[file]
    out = {}
    unresolved = 0
    for slot, pats in GROUPS.items():
        items = []
        for rx, role in pats:
            seen = set()
            for key in kv:
                m = re.fullmatch(rx + r'\.text', key)
                if not m: continue
                base = key[:-5]
                if base in seen: continue
                seen.add(base)
                t = resolve(file, key)
                if t is None:
                    if kv[key] not in ('""',): unresolved += 1
                    continue
                if not t.strip(): continue
                idx = tuple(int(g) for g in m.groups()) if m.groups() else ()
                items.append({'role': role, 'index': list(idx), 'mode': mode(file, base),
                              'incipit': resolve(file, base + '.incipit') or None, 'text': t})
        if items:
            order = {'n': 0, 'glory': 1, 'both': 2, 'theotokion': 3}
            items.sort(key=lambda i: (order[i['role']], i['index']))
            out[slot] = items
    return out, unresolved

by_month = {}
stats = {'days': 0, 'with_text': 0, 'unresolved_refs': 0}
for name in sorted(files):
    m = re.match(r'me\.m(\d\d)\.d(\d\d)$', name)
    if not m: continue            # skip dHF/dAC/dBC/dFF special files
    mm, dd = m.groups()
    data, unres = extract(name)
    stats['days'] += 1; stats['unresolved_refs'] += unres
    if data:
        stats['with_text'] += 1
        by_month.setdefault(mm, {})['%s-%s' % (mm, dd)] = {'source_file': name + '_en_US_goadedes.ares', 'slots': data}

os.makedirs(OUT, exist_ok=True)
for mm, days in by_month.items():
    json.dump({'schema': 'menaion-ages/1',
               'source': 'AGES-Initiatives/alwb-library-en-us-goadedes (translations by Fr. Seraphim Dedes for the Greek Orthodox Archdiocese of America), CC0 1.0',
               'calendar': 'GOA New Calendar (Revised Julian) usage; commemorations may differ from the Slavic usage the app otherwise follows',
               'dates': days},
              open(os.path.join(OUT, mm + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(stats)
