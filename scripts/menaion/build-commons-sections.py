#!/usr/bin/env python3
"""Add a derived `sections` array to each data/menaion/commons/<slug>.json.

Splits Orloff's running paragraphs into liturgical sections by his own
rubrics. Text is never altered except: the print edition's italic
"(mentioned by name)" placeholder becomes the literal token {NAME}, which
js/menaion-commons.js replaces with the saint's name at render time.
Run after ingest-orloff-commons.py. Idempotent.
"""
import json, os, re

DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'menaion', 'commons')
NAME_RE = re.compile(r'\[?\(\s*mentioned by name\s*\)', re.I)

# (kind, regex tested against a paragraph's concatenated rubric text), in priority order
STARTS = [
  ('vespers_stichera',  re.compile(r'^\s*At the Vespers,.*Stichera', re.I)),
  ('vespers_aposticha', re.compile(r'(For|With)( the)? Versicles?,? the Stichera', re.I)),
  ('vespers_troparion', re.compile(r'The Troparion from the Typicon', re.I)),
  ('sessional_1',       re.compile(r'After the 1st Stichologia', re.I)),
  ('sessional_2',       re.compile(r'After the (2nd|second) Stichologia', re.I)),
  ('sessional_3',       re.compile(r'After the Polyeleon,? the Cathisma', re.I)),
  ('polyeleos',         re.compile(r'After Praise ye the name of the Lord', re.I)),
  ('gospel_gradual',    re.compile(r'^\s*The Graduals', re.I)),
  ('canon',             re.compile(r'^\s*The Canon[,.]', re.I)),
  ('exapostilarion',    re.compile(r'Photagogicon', re.I)),
  ('praises',           re.compile(r'^\s*With the Lauds,? the (Idiomelic )?Stichera', re.I)),
]

def rubric_text(p):
    return ''.join(s['text'] for s in p['segments'] if s.get('rubric'))

def clean_rubric(t):
    t = NAME_RE.sub('', t)
    t = re.sub(r'^[\s\[\]!,;.]+', '', t)
    return re.sub(r'\s+', ' ', t).strip()

def render(p):
    """Paragraph -> list of lines. Name placeholder stays inline as {NAME}."""
    lines, buf = [], ''
    def flush():
        nonlocal buf
        if buf.strip(): lines.append(re.sub(r'\s+', ' ', buf).strip())
        buf = ''
    for s in p['segments']:
        t = s['text']
        if not s.get('rubric'):
            buf += (' ' if buf and not buf.endswith(' ') else '') + t
            continue
        if NAME_RE.search(t):
            # Inline name; whatever follows the placeholder in this italic run
            parts = NAME_RE.split(t)
            for k, part in enumerate(parts):
                if k > 0: buf += ('' if buf.endswith(' ') or not buf else ' ') + '{NAME}'
                part = part.strip()
                if not part: continue
                if re.match(r'^[,;.:!\]\s]+$', part): buf += part.strip(); continue
                lead = re.match(r'^([,;.:!\]\s]*)(.*)$', part, re.S)
                buf += lead.group(1).strip()
                rest = lead.group(2).strip()
                if rest:
                    flush()
                    lines.append(rest if rest.lower().startswith('the verse') else '(' + rest.strip('[] ') + ')')
            continue
        flush()
        r = t.strip().strip('[]').strip()
        if r: lines.append(r if r.lower().startswith('the verse') else '(' + r + ')')
    flush()
    return lines

def build(doc):
    paras = doc['paragraphs']
    sections, cur = [], None
    for p in paras:
        text = ''.join(s['text'] for s in p['segments'])
        if text.lstrip().startswith('____'):
            break  # footnotes follow
        rt = rubric_text(p)
        kind = None
        for k, rx in STARTS:
            if rx.search(rt):
                kind = k; break
        if kind:
            cur = {'kind': kind, 'header': clean_rubric(rt) or None, 'ids': [], 'lines': []}
            sections.append(cur)
        if cur is None:
            continue
        cur['ids'].append(p['id'])
        cur['lines'].extend(render(p))
    for sec in sections:  # trim the shared Matins preamble off sessional-hymn headings
        if sec['kind'].startswith('sessional_') and sec['lines'] and sec['lines'][0].startswith('('):
            m = re.search(r'(Cathisma.*)$', sec['lines'][0].rstrip(')'), re.I)
            if m:
                sec['lines'][0] = '(The ' + m.group(1).strip() + ')'
                sec['header'] = m.group(1).strip()
    return sections

def main():
    index = json.load(open(os.path.join(DIR, 'index.json')))
    for c in index['commons']:
        f = os.path.join(DIR, c['file'])
        doc = json.load(open(f, encoding='utf-8'))
        doc['sections'] = build(doc)
        json.dump(doc, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        kinds = [s['kind'] for s in doc['sections']]
        print(c['id'], kinds)
main()
