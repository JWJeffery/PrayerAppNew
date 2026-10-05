"""Shared helpers: turn 1979 BCP lectionary citations/psalms into the app's own style.

The BCP prints abbreviated books ("Isa."), "--" for chapter spans, parentheses for optional
lengthenings and brackets for optional psalms. The app's season data uses full book names, "-"
for every range, includes lengthenings, and drops optional bracketed psalms. Everything here is
deterministic and has no network access.
"""
import json, re, glob, collections, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

# canonical id for every spelling the BCP, the website or the app uses
ALIAS = {
 'gen':'gen','genesis':'gen','exod':'exod','exodus':'exod','lev':'lev','leviticus':'lev','num':'num','numbers':'num',
 'deut':'deut','deuteronomy':'deut','josh':'josh','joshua':'josh','judg':'judg','judges':'judg','ruth':'ruth',
 '1sam':'1sam','1samuel':'1sam','2sam':'2sam','2samuel':'2sam','1kings':'1kgs','2kings':'2kgs','1kgs':'1kgs','2kgs':'2kgs',
 '1chron':'1chr','1chronicles':'1chr','2chron':'2chr','2chronicles':'2chr','ezra':'ezra','neh':'neh','nehemiah':'neh',
 'esth':'esth','esther':'esth','job':'job','ps':'ps','psalm':'ps','psalms':'ps','prov':'prov','proverbs':'prov',
 'eccles':'eccl','ecclesiastes':'eccl','songofsol':'song','songofsolomon':'song','songofsongs':'song',
 'isa':'isa','isaiah':'isa','jer':'jer','jeremiah':'jer','lam':'lam','lamentations':'lam','ezek':'ezek','ezekiel':'ezek',
 'dan':'dan','daniel':'dan','hos':'hos','hosea':'hos','joel':'joel','amos':'amos','obad':'obad','obadiah':'obad',
 'jonah':'jonah','micah':'mic','mic':'mic','nahum':'nah','nah':'nah','hab':'hab','habakkuk':'hab','zeph':'zeph',
 'zephaniah':'zeph','hag':'hag','haggai':'hag','zech':'zech','zechariah':'zech','mal':'mal','malachi':'mal',
 'tobit':'tob','judith':'jdt','wisdofsol':'wis','wisdomofsolomon':'wis','wisdom':'wis','wisd':'wis','ecclus':'sir',
 'ecclesiasticus':'sir','sirach':'sir','baruch':'bar','1macc':'1mac','1maccabees':'1mac','2macc':'2mac','2maccabees':'2mac',
 'matt':'matt','mat':'matt','matthew':'matt','mark':'mark','luke':'luke','john':'john','acts':'acts','rom':'rom','romans':'rom',
 '1cor':'1cor','1corinthians':'1cor','2cor':'2cor','2corinthians':'2cor','gal':'gal','galatians':'gal','eph':'eph',
 'ephesians':'eph','phil':'phil','philippians':'phil','col':'col','colossians':'col','1thess':'1thess',
 '1thessalonians':'1thess','2thess':'2thess','2thessalonians':'2thess','1tim':'1tim','1timothy':'1tim','2tim':'2tim',
 '2timothy':'2tim','titus':'titus','philemon':'phlm','phlm':'phlm','heb':'heb','hebrews':'heb','james':'jas','jas':'jas',
 '1pet':'1pet','1peter':'1pet','2pet':'2pet','2peter':'2pet','1john':'1john','2john':'2john','3john':'3john','jude':'jude',
 'rev':'rev','revelation':'rev','songofthreeyoungmen':'s3y','prayerofazariah':'azar','2esdras':'2esd','susanna':'sus',
}
FULLNAME = {  # fallback display names when the app has never used a book
 'gen':'Genesis','exod':'Exodus','lev':'Leviticus','num':'Numbers','deut':'Deuteronomy','josh':'Joshua','judg':'Judges',
 'ruth':'Ruth','1sam':'1 Samuel','2sam':'2 Samuel','1kgs':'1 Kings','2kgs':'2 Kings','1chr':'1 Chronicles',
 '2chr':'2 Chronicles','ezra':'Ezra','neh':'Nehemiah','esth':'Esther','job':'Job','prov':'Proverbs','eccl':'Ecclesiastes',
 'song':'Song of Solomon','isa':'Isaiah','jer':'Jeremiah','lam':'Lamentations','ezek':'Ezekiel','dan':'Daniel','hos':'Hosea',
 'joel':'Joel','amos':'Amos','obad':'Obadiah','jonah':'Jonah','mic':'Micah','nah':'Nahum','hab':'Habakkuk','zeph':'Zephaniah',
 'hag':'Haggai','zech':'Zechariah','mal':'Malachi','tob':'Tobit','jdt':'Judith','wis':'Wisdom','sir':'Ecclesiasticus',
 'bar':'Baruch','1mac':'1 Maccabees','2mac':'2 Maccabees','matt':'Matthew','mark':'Mark','luke':'Luke','john':'John',
 'acts':'Acts','rom':'Romans','1cor':'1 Corinthians','2cor':'2 Corinthians','gal':'Galatians','eph':'Ephesians',
 'phil':'Philippians','col':'Colossians','1thess':'1 Thessalonians','2thess':'2 Thessalonians','1tim':'1 Timothy',
 '2tim':'2 Timothy','titus':'Titus','phlm':'Philemon','heb':'Hebrews','jas':'James','1pet':'1 Peter','2pet':'2 Peter',
 '1john':'1 John','2john':'2 John','3john':'3 John','jude':'Jude','rev':'Revelation',
}
_BOOK_RE = re.compile(r'^((?:[123]\s*)?[A-Za-z][A-Za-z\.\s]*?)\s*(\d.*)$')


def split_book(cite):
    """('Isa. 40:1-11') -> ('isa', '40:1-11'); None if it does not look like a citation."""
    s = cite.strip()
    m = _BOOK_RE.match(s)
    if not m:
        return None
    key = re.sub(r'[\.\s]', '', m.group(1)).lower()
    return ALIAS.get(key, key), m.group(2).strip()


_TOK = re.compile(r'(\d+)[a-c]?(?:-(?:(\d+):)?(\d+)[a-c]?)?')


def _merge_ranges(tokens):
    """Merge contiguous verse tokens within a chapter: '1-9','10-17' -> '1-17'; '29','30-41' -> '29-41';
    '39-48a','48b-56' -> '39-56'; '1-11','12-2:1' -> '1-2:1'; '18-4:6','7-18' -> '18-4:18'.
    Tokens that carry their own chapter at the start (4:4-7) are never merged."""
    out = []   # each: [start, end_chapter or None, end_verse] or the raw string
    for t in tokens:
        m = _TOK.fullmatch(t)
        if not m:
            out.append(t)
            continue
        start = int(m.group(1))
        echap = m.group(2)
        everse = int(m.group(3)) if m.group(3) else start
        if out and isinstance(out[-1], list):
            p = out[-1]
            if start in (p[2], p[2] + 1) and not echap:
                p[2] = everse; p[3] = None        # same chapter as the previous token's end
                continue
            if start in (p[2], p[2] + 1) and echap:
                out[-1] = [p[0], echap, everse, None]   # continuation that crosses into a new chapter
                continue
        out.append([start, echap, everse, t])
    res = []
    for o in out:
        if isinstance(o, str):
            res.append(o)
        else:
            start, echap, everse, orig = o
            if orig:
                res.append(orig)
            elif echap:
                res.append(f"{start}-{echap}:{everse}")
            elif everse != start:
                res.append(f"{start}-{everse}")
            else:
                res.append(str(start))
    return res


def clean_rest(rest):
    """Verse part of a citation: remove footnote stars, include optional lengthenings, merge ranges."""
    r = rest.replace('\u2014', '-').replace('\u2013', '-').replace('--', '-')
    r = re.sub(r'\*+', '', r)
    r = re.sub(r'<.*$', '', r)
    r = r.replace('(', ',').replace(')', ',')           # lengthenings become ordinary list members
    r = re.sub(r'\s+', ' ', r)
    groups = []
    for grp in r.split(';'):
        grp = grp.strip(' ,')
        pre = ''
        m = re.match(r'^(\d+:)(.*)$', grp)
        if m:
            pre, grp = m.group(1), m.group(2)
        toks = [t.strip() for t in re.split(r',| (?=\d)', grp) if t.strip()]
        groups.append(pre + ', '.join(_merge_ranges(toks)))
    return '; '.join(g for g in groups if g)


_app_names = None
def app_book_names():
    """canonical id -> the spelling the app's season data already uses most."""
    global _app_names
    if _app_names is None:
        cnt = collections.defaultdict(collections.Counter)
        for f in glob.glob(os.path.join(ROOT, 'data', 'season', '*.json')):
            data = json.load(open(f))
            if not isinstance(data, list):
                continue
            for e in data:
                for k, v in e.items():
                    if k.startswith('reading_') and isinstance(v, str):
                        sb = split_book(v)
                        if sb:
                            m = _BOOK_RE.match(v.strip())
                            cnt[sb[0]][re.sub(r'\s+', ' ', m.group(1)).strip()] += 1
        _app_names = {k: c.most_common(1)[0][0] for k, c in cnt.items()}
    return _app_names


def to_app_citation(bcp):
    """'Isa. 42:(1-9)10-17' -> 'Isaiah 42:1-17'. Takes the first alternative of 'X, or Y'."""
    s = re.split(r',?\s+or\s+', bcp.strip())[0]
    s = re.sub(r'^([^()\d]*?[A-Za-z\.])\s*\((?=\d)([^)]*)\)', r'\1 \2 ', s)
    sb = split_book(s)
    if not sb:
        return s
    key, rest = sb
    name = app_book_names().get(key) or FULLNAME.get(key) or key
    return f"{name} {clean_rest(rest)}"


def cite_core(s):
    """Comparison key: ignores book spelling, spaces, lengthening parentheses and verse letters."""
    if not s:
        return ''
    s0 = re.split(r',?\s+or\s+', str(s).strip())[0]
    s0 = re.sub(r'^([^()\d]*?[A-Za-z\.])\s*\((?=\d)([^)]*)\)', r'\1 \2 ', s0)
    sb = split_book(s0)
    if not sb:
        return re.sub(r'\W', '', str(s).lower())
    key, rest = sb
    rest = re.sub(r'(?<=\d)[a-c](?=[\W]|$)', '', clean_rest(rest))
    return f"{key} {re.sub(r'[ ]', '', rest).replace(';', ',')}"


def psalm_numbers(text, keep_brackets):
    """Set of psalm numbers named in a psalm string (verse ranges and lengthenings ignored)."""
    t = (text or '').replace('Psalms', '').replace('Psalm', '').replace('*', ',')
    t = re.sub(r'\(.*?\)', '', t)
    if keep_brackets:
        t = t.replace('[', '').replace(']', '')
    else:
        t = re.sub(r'\[.*?\]', '', t)
    out = set()
    for tok in re.split(r'[,&]|\bor\b', t):
        tok = tok.strip()
        m = re.match(r'^(\d{1,3})(?::.*)?$', tok)
        if m:
            out.add(int(m.group(1)))
    return out


def to_app_psalms(bcp):
    """'63:1-8(9-11), 98' -> 'Psalm 63:1-11, Psalm 98'; optional [bracketed] psalms are dropped;
    '[59, 60] or 66, 67' takes the unbracketed alternative."""
    s = bcp.replace('*', '').strip()
    if re.search(r'\]\s*or\s', s):
        s = re.split(r'\]\s*or\s', s, 1)[1]
    s = re.sub(r'\[[^\]]*\]', '', s)
    s = s.replace('—', '-').replace('--', '-')
    parts = []
    # tokenise on commas that start a new psalm (not verse continuations like "109:1-4(5-19)20-30")
    for tok in [t.strip() for t in re.split(r',', s) if t.strip()]:
        parts.append(tok)
    outp = []
    for tok in parts:
        if re.match(r'^\d{1,3}(:|$)', tok):
            outp.append(tok)
        elif outp:
            outp[-1] += ',' + tok            # verse continuation of the previous psalm
    result = []
    for p in outp:
        if ':' in p:
            ps, rest = p.split(':', 1)
            rest = clean_rest(rest)
            result.append(f"Psalm {ps}:{rest}")
        else:
            result.append(f"Psalm {p}")
    return ', '.join(result)
