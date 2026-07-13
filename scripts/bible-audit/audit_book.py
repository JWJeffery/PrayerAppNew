import json, re, sys, sqlite3, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from parse_usfm import parse_usfm_file

def norm(t, lord_norm=False):
    if t is None: return None
    if lord_norm:
        t = re.sub(r'\bLORD\b', 'Lord', t)
        t = re.sub(r'\bGOD\b', 'God', t)
    return re.sub(r'\s+', ' ', t.strip())

def audit_kjv_rotherham(app_path, book_name):
    app = json.load(open(app_path))
    kjva = json.load(open('/home/claude/bible_databases_batch/formats/json/KJVA.json'))
    roth = json.load(open('/home/claude/bible_databases_batch/formats/json/Rotherham.json'))
    kjva_b = next(b for b in kjva['books'] if b['name']==book_name)
    roth_b = next(b for b in roth['books'] if b['name']==book_name)
    kjva_v = {(ch['chapter'], v['verse']): norm(v['text']) for ch in kjva_b['chapters'] for v in ch['verses']}
    roth_v = {(ch['chapter'], v['verse']): norm(v['text']) for ch in roth_b['chapters'] for v in ch['verses']}
    kjv_mismatch, roth_mismatch = [], []
    for ch in app['chapters']:
        for v in ch['verses']:
            addr = (ch['num'], v['num'])
            a_kjv = norm(v['text'].get('KJV'))
            s_kjv = kjva_v.get(addr)
            if a_kjv != s_kjv: kjv_mismatch.append((addr, a_kjv, s_kjv))
            a_roth = norm(v['text'].get('Rotherham'))
            s_roth = roth_v.get(addr)
            if a_roth != s_roth: roth_mismatch.append((addr, a_roth, s_roth))
    return kjv_mismatch, roth_mismatch

def audit_drb(app_path, usfm_filename):
    app = json.load(open(app_path))
    src = parse_usfm_file(f'/home/claude/original-douay-rheims/usfm/{usfm_filename}')
    mismatch = []
    app_chcounts = {}
    for ch in app['chapters']:
        app_chcounts[ch['num']] = len(ch['verses'])
        for v in ch['verses']:
            a = norm(v['text'].get('DRB'))
            s = norm(src.get(ch['num'], {}).get(str(v['num'])))
            if a != s: mismatch.append(((ch['num'], v['num']), a, s))
    src_chcounts = {c: len(v) for c,v in src.items()}
    diffs = {c: (app_chcounts.get(c), src_chcounts.get(c)) for c in set(list(app_chcounts)+list(src_chcounts)) if app_chcounts.get(c) != src_chcounts.get(c)}
    return mismatch, diffs

SIMPLE_CHAPTER = re.compile(r'^(?:[IVXLCDM]+\.\s+.*?\s+)?Chapter\s+\d+(?:\s+.*?)?\s+-\s+(?:(?=[A-Z\[])[^.]{1,80}\.\s+)?')
FULL_PATTERN = re.compile(r'^(?:(?:[IVXLCDM]+\.\s+.*?)|(?:Chapter\s+\d+.*?)|(?:[IVXLCDM]+\.\s+.*?Chapter\s+\d+.*?))\s+-\s+(?:(?=[A-Z\[])[^.]{1,80}\.\s+)?')

def audit_nabre(app_path, nabre_book_name):
    nabre_src = json.load(open('/home/claude/PrayerAppNew/data/kalendar/source-witnesses/nabre.json'))
    book_src = next((b for b in nabre_src if b['book']==nabre_book_name), None)
    if book_src is None: return None, "NO SOURCE"
    app_data = json.load(open(app_path))
    src_v = {(ch['chapter'], v['verse']): v['text'] for ch in book_src['chapters'] for v in ch['verses']}
    mismatches = []
    for ch in app_data['chapters']:
        for v in ch['verses']:
            addr = (ch['num'], v['num'])
            app_text = v['text'].get('NABRE')
            src_text = src_v.get(addr)
            if app_text is None or src_text is None: continue
            m = SIMPLE_CHAPTER.match(src_text)
            if not m: m = FULL_PATTERN.match(src_text)
            src_content = src_text[m.end():] if m else src_text
            src_content = re.sub(r'\s+-\s+', ' ', src_content)
            a = norm(app_text, lord_norm=True)
            s = norm(src_content, lord_norm=True)
            if a != s:
                mismatches.append((addr, app_text, src_content))
    return mismatches, None

def audit_nrsv(app_path, book_number):
    conn = sqlite3.connect('/home/claude/nrsv_batch/NRSV-CI.SQLite3')
    cur = conn.cursor()
    cur.execute(f'SELECT chapter, verse, text FROM verses WHERE book_number={book_number}')
    rows = cur.fetchall()
    cur.execute(f"SELECT chapter, verse, text FROM verses WHERE book_number={book_number} AND text LIKE '%<n>%'")
    n_tags = cur.fetchall()

    def clean_source(t):
        t = re.sub(r'<pb/>', '', t)
        t = re.sub(r'<f>.*?</f>', '', t)
        t = re.sub(r'</?t>', '', t)
        t = t.replace("'", '\u2019')
        t = re.sub(r'\bLORD\b', 'Lord', t)
        t = re.sub(r'\bGOD\b', 'God', t)
        t = re.sub(r'\u2019\s+\u201d', '\u2019\u201d', t)
        return t

    src = {}
    for ch, v, t in rows:
        src[(ch, v)] = norm(clean_source(t))

    app = json.load(open(app_path))
    changes = []
    for ch in app['chapters']:
        for v in ch['verses']:
            addr = (ch['num'], v['num'])
            a = norm(v['text'].get('NRSV'))
            s = src.get(addr)
            if s is not None and a != s:
                changes.append({'addr': list(addr), 'old': a, 'new': s})
    return changes, n_tags, len(rows)
