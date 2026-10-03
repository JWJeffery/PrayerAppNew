#!/usr/bin/env python3
"""Ingest Orloff, *The General Menaion* (London, 1899), from CCEL into
data/menaion/commons/<slug>.json, one file per chapter (type of saint / feast).

Verbatim transcription: text is NOT corrected (CCEL's own OCR slips such as
"incorrnption" are preserved and counted in `source.known_ocr_slips` only if
listed by hand). Each paragraph keeps its CCEL id and print-edition page.
Italic runs (rubrics in the print edition) are kept as {"rubric": true} segments.

Usage: python3 scripts/menaion/ingest-orloff-commons.py [--cache DIR]
"""
import html, json, os, re, sys, urllib.request
BASE = 'https://www.ccel.org/ccel/anonymous/menaion/menaion.%s.html'
CHAPTERS = [  # (ccel suffix, slug, chapter numeral)
 ('iv','lord','I'),('v','theotokos','II'),('vi','cross','III'),('vii','angels','IV'),
 ('viii','forerunner','V'),('ix','holy-fathers-councils','VI'),('x','prophet','VII'),
 ('xi','apostle','VIII'),('xii','apostles-many','IX'),('xiii','hierarch','X'),
 ('xiv','hierarchs-many','XI'),('xv','monk','XII'),('xvi','monks-many','XIII'),
 ('xvii','martyr','XIV'),('xviii','martyrs-many','XV'),('xix','hieromartyr','XVI'),
 ('xx','hieromartyrs-many','XVII'),('xxi','monk-martyr','XVIII'),
 ('xxii','monk-martyrs-many','XIX'),('xxiii','female-martyr','XX'),
 ('xxiv','female-martyrs-many','XXI'),('xxv','nun','XXII'),('xxvi','nuns-many','XXIII'),
 ('xxvii','nun-martyr','XXIV'),('xxviii','confessor','XXV'),
 ('xxix','unmercenaries-wonderworkers','XXVI'),('xxx','fools-for-christ','XXVII'),
 ('xxxi','appendix','APPENDIX')]
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
OUT = os.path.join(ROOT, 'data', 'menaion', 'commons')

def fetch(suffix, cache):
    p = os.path.join(cache, suffix + '.html')
    if os.path.exists(p):
        return open(p, encoding='utf-8', errors='ignore').read()
    raw = urllib.request.urlopen(BASE % suffix, timeout=60).read().decode('utf-8', 'ignore')
    open(p, 'w', encoding='utf-8').write(raw)
    return raw

def clean(s):
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()

def parse(raw, suffix):
    start = raw.find('id="%s-p0.1"' % suffix)
    body = raw[start:] if start >= 0 else raw
    end = body.find('<div class="clearfix')  # best-effort footer cut
    paras, title = [], []
    for m in re.finditer(r'<(h[123]|p)([^>]*)>(.*?)</\1>', body, re.S):
        tag, attrs, inner = m.groups()
        pid = (re.search(r'id="([^"]+)"', attrs) or [None, None])[1]
        if tag.startswith('h'):
            title.append(clean(re.sub(r'<[^>]+>', '', inner))); continue
        pages = [int(x) for x in re.findall(r'<span class="pb"[^>]*><a[^>]*>(\d+)</a></span>', inner)]
        inner = re.sub(r'<span class="pb".*?</span>', '', inner, flags=re.S)
        segs = []
        for part in re.split(r'(<i>.*?</i>)', inner, flags=re.S):
            if not part: continue
            if part.startswith('<i>'):
                t = clean(re.sub(r'<[^>]+>', '', part)); rub = True
            else:
                t = clean(re.sub(r'<[^>]+>', '', part)); rub = False
            if t: segs.append({'text': t, 'rubric': True} if rub else {'text': t})
        if not segs: continue
        paras.append({'id': pid, 'centered': 'Center' in attrs,
                      'pages': pages, 'segments': segs})
    return title, paras

def main():
    cache = os.path.join(ROOT, '.orloff-cache')
    if '--cache' in sys.argv: cache = sys.argv[sys.argv.index('--cache') + 1]
    os.makedirs(cache, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    index = []
    for suffix, slug, numeral in CHAPTERS:
        title, paras = parse(fetch(suffix, cache), suffix)
        doc = {
          'schema': 'menaion-common/1',
          'id': 'common-' + slug,
          'chapter': numeral,
          'title': ' '.join(title) if title else slug,
          'source': {
            'work': 'The General Menaion (Orloff), London 1899, translated from the Slavonic 16th ed. of 1862',
            'edition_cited': '1899 first edition (public domain)',
            'url': BASE % suffix,
            'transcribed_by': 'scripts/menaion/ingest-orloff-commons.py (verbatim from CCEL HTML; no corrections)',
            'name_placeholder': '(mentioned by name)'},
          'paragraphs': paras}
        json.dump(doc, open(os.path.join(OUT, slug + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        words = sum(len(s['text'].split()) for p in paras for s in p['segments'])
        index.append({'id': doc['id'], 'file': slug + '.json', 'chapter': numeral,
                      'title': doc['title'], 'paragraphs': len(paras), 'words': words})
        print(slug, len(paras), words)
    json.dump({'schema': 'menaion-commons-index/1', 'commons': index},
              open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
main()
