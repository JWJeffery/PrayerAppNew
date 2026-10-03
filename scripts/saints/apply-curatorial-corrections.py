#!/usr/bin/env python3
"""Apply Josh's approved curatorial corrections (2026-10-02) to the Kalendar source records.

Edits, in place and line by line (unrelated lines stay byte-identical):
  data/kalendar/<month>/kalendar-v0.1-<month>-candidates.csv   candidate matrix (moves, removals, citation repairs)
  data/kalendar/sin/rank1/*.csv, data/kalendar/sin/alternate/*.csv   SIN tables (kept consistent with the matrix)
  data/kalendar/kalendar-v0.1-cross-date-harmonization.csv      harmonization register
  data/kalendar/sin/retired-sins.csv                           SINs withdrawn by these corrections (never reused)

Run from the repository root, once. It refuses to run twice (it checks for the retired-SIN register).
Next steps (see documentation/ANGLICAN_SYNAXARIUM_CORRECTION_PROPOSAL.md): rebuild synaxarium-review/data/kalendar-data.json with
build_data_v3.py, derive the corrected decisions export, merge it into the CSVs with merge_decisions_into_csv.py, then run
apply-synaxarium-decisions.py.
"""
import csv, io, os, sys, glob

ROOT = os.getcwd()
K = os.path.join(ROOT, 'data/kalendar')
MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
if os.path.exists(os.path.join(K, 'sin/retired-sins.csv')):
    sys.exit('already applied (data/kalendar/sin/retired-sins.csv exists)')


class Csv:
    """A CSV edited line by line. Each physical line is one row; the quoting style of every line is preserved."""
    def __init__(self, path):
        self.path = path
        raw = open(path, 'rb').read()
        self.bom = raw.startswith(b'\xef\xbb\xbf')
        txt = raw.decode('utf-8-sig')
        self.crlf = '\r\n' in txt
        self.eol = '\r\n' if self.crlf else '\n'
        lines = txt.split(self.eol)
        self.final_eol = lines[-1] == ''
        if self.final_eol: lines = lines[:-1]
        self.header = next(csv.reader([lines[0]]))
        self.rows = []                      # [{'d': dict, 'quoted': bool, 'line': str|None}]
        for ln in lines[1:]:
            vals = next(csv.reader([ln]))
            assert len(vals) == len(self.header), (path, ln[:80])
            self.rows.append({'d': dict(zip(self.header, vals)), 'quoted': ln.startswith('"'), 'line': ln})
        self.head_line = lines[0]

    def render(self, r):
        out = io.StringIO(newline='')
        csv.writer(out, lineterminator='', quoting=csv.QUOTE_ALL if r['quoted'] else csv.QUOTE_MINIMAL).writerow([r['d'][h] for h in self.header])
        return out.getvalue()

    def set(self, r, **kw):
        r['d'].update(kw); r['line'] = None          # re-render on save

    def save(self):
        lines = [self.head_line] + [(r['line'] if r['line'] is not None else self.render(r)) for r in self.rows]
        txt = self.eol.join(lines) + (self.eol if self.final_eol else '')
        open(self.path, 'wb').write((b'\xef\xbb\xbf' if self.bom else b'') + txt.encode('utf-8'))

    def by(self, **kw):
        return [r for r in self.rows if all(r['d'].get(k) == v for k, v in kw.items())]

    def insert_after(self, ref, d, quoted=None):
        i = self.rows.index(ref)
        self.rows.insert(i + 1, {'d': d, 'quoted': ref['quoted'] if quoted is None else quoted, 'line': None})


def cand(month): return Csv(os.path.join(K, month, f'kalendar-v0.1-{month}-candidates.csv'))
def rank1(month): return Csv(os.path.join(K, 'sin/rank1', f'{month}-rank1-sins.csv'))
def alt(month, date):
    for p in sorted(glob.glob(os.path.join(K, f'sin/alternate/{month}-alternate-sins*.csv'))):
        c = Csv(p)
        if any(r['d']['date'] == date for r in c.rows): return c
    return Csv(sorted(glob.glob(os.path.join(K, f'sin/alternate/{month}-alternate-sins*.csv')))[0])


def month_of(date): return MONTHS[int(date[:2]) - 1]


WHEN = '2026-10-02'
retired = []   # (sin, former name, canonical sin or '', reason)
CACHE = {}
def get(kind, month, date=None):
    if kind == 'alt':                      # alternate tables may be split into part files: cache by file path
        c = alt(month, date)
        key = ('alt', c.path)
        if key not in CACHE: CACHE[key] = c
        return CACHE[key]
    key = (kind, month)
    if key not in CACHE:
        CACHE[key] = {'cand': lambda: cand(month), 'r1': lambda: rank1(month)}[kind]()
    return CACHE[key]


def cand_rows(date): return sorted(get('cand', month_of(date)).by(date=date), key=lambda r: int(r['d']['rank']))
def row(date, name):
    m = [r for r in cand_rows(date) if r['d']['candidate'] == name]
    assert len(m) == 1, (date, name, [r['d']['candidate'] for r in cand_rows(date)])
    return m[0]


def sin_of(date, name):
    """Return ('r1'|'alt', row) holding the SIN record for this candidate on this date, matching by rank."""
    rk = row(date, name)['d']['rank']
    if rk == '1':
        r = [x for x in get('r1', month_of(date)).rows if x['d']['date'] == date]
        assert len(r) == 1, (date, name)
        if r[0]['d']['canonical_name'] != name: print('  note: SIN name differs from matrix name on', date, ':', r[0]['d']['canonical_name'], '|', name)
        return 'r1', r[0]
    c = get('alt', month_of(date), date)
    r = [x for x in c.rows if x['d']['date'] == date and x['d']['rank'] == rk]
    assert len(r) == 1, (date, name, [x['d'] for x in r])
    if r[0]['d']['source_candidate_name'] != name: print('  note: SIN name differs from matrix name on', date, ':', r[0]['d']['source_candidate_name'], '|', name)
    return 'alt', r[0]


def remove_candidate(date, name, reason, retire_sin=None):
    """Delete a matrix row and its SIN row, then renumber ranks (1..n) in the matrix and SIN tables."""
    kind, srow = sin_of(date, name)
    sin = srow['d']['sin']
    c = get('cand', month_of(date)); c.rows.remove(row(date, name))
    if kind == 'r1':
        get('r1', month_of(date)).rows.remove(srow)
    else:
        get('alt', month_of(date), date).rows.remove(srow)
    if retire_sin: retired.append((sin, name, retire_sin if retire_sin != 'withdrawn' else '', reason))
    return sin


def renumber(date):
    """Contiguous ranks; rank-1's SIN record lives in the rank1 table, the others in the alternate table (by rank)."""
    month = month_of(date); c = get('cand', month)
    r1t = get('r1', month); at = get('alt', month, date)
    rows = cand_rows(date)
    # gather SIN records by candidate name from both tables
    recs = {}                                   # keyed by the candidate's CURRENT rank (before renumbering)
    for x in r1t.rows:
        if x['d']['date'] == date: recs['1'] = ('r1', x)
    for x in at.rows:
        if x['d']['date'] == date: recs[x['d']['rank']] = ('alt', x)
    # detach all records for the date
    for kind, x in recs.values():
        (r1t if kind == 'r1' else at).rows.remove(x)
    anchor_r1 = None
    old_ranks = [r['d']['rank'] for r in rows]
    for i, r in enumerate(rows, start=1):
        name = r['d']['candidate']
        kind, x = recs[old_ranks[i - 1]]
        c.set(r, rank=str(i))
        d = x['d']
        if i == 1:
            nd = {'date': date, 'sin': d['sin'],
                  'canonical_name': name if kind == 'alt' else d['canonical_name'], 'entity_type': d['entity_type'],
                  'rank1_audit_status': d.get('rank1_audit_status') or 'rank1_controlled',
                  'rank1_result': d.get('rank1_result') or 'rank preserved pending governance',
                  'review_flags': d.get('review_flags') if kind == 'r1' else r['d']['review_flags']}
            if kind == 'alt': nd['rank1_result'] = f'curatorial correction {WHEN}: promoted to rank 1 by removal of the displaced candidate'
            # keep rank1 table ordered by date
            pos = len([y for y in r1t.rows if y['d']['date'] < date])
            r1t.rows.insert(pos, {'d': nd, 'quoted': r1t.rows[0]['quoted'], 'line': None})
        else:
            nd = {'date': date, 'rank': str(i), 'sin': d['sin'],
                  'normalized_name': d.get('canonical_name') or d.get('normalized_name'), 'entity_type': d['entity_type'],
                  'source_candidate_name': name, 'identity_note': d.get('identity_note', '') if kind == 'alt' else ''}
            pos = len([y for y in at.rows if (y['d']['date'], int(y['d']['rank'])) < (date, i)])
            at.rows.insert(pos, {'d': nd, 'quoted': at.rows[0]['quoted'], 'line': None})


def append_alternate(date, base_row_d, sin_rec, **over):
    """Append a candidate as the last-ranked alternate on `date`, with its SIN record."""
    month = month_of(date); c = get('cand', month); rows = cand_rows(date); last = rows[-1]
    rk = len(rows) + 1
    d = dict(base_row_d); d.update(month=month.capitalize(), date=date, rank=str(rk), decision_status='Pending', final_primary=''); d.update(over)
    c.insert_after(last, d)
    at = get('alt', month, date)
    pos = len([y for y in at.rows if (y['d']['date'], int(y['d']['rank'])) < (date, rk)])
    at.rows.insert(pos, {'d': {'date': date, 'rank': str(rk), 'sin': sin_rec['sin'], 'normalized_name': d['candidate'],
                               'entity_type': sin_rec['entity_type'], 'source_candidate_name': d['candidate'], 'identity_note': sin_rec.get('identity_note', '')},
                         'quoted': at.rows[0]['quoted'], 'line': None})


# ------------------------------------------------------------------------------------------------------------------
# 1. Moves and removals
# ------------------------------------------------------------------------------------------------------------------
# 05-03: Huntington's erroneous copy is removed; Elisabeth Cruciger (LFF 2024, May 3) becomes rank 1.
#        Huntington remains the 11-25 primary under UO-SIN-000148; the duplicate SIN 000999 is retired.
remove_candidate('05-03', 'James K. O. S. Huntington', 'Duplicate identity of James Otis Sargent Huntington (11-25, UO-SIN-000148); the 05-03 copy was an unsupported date assignment', retire_sin='UO-SIN-000148')
renumber('05-03')

# 05-09 -> 05-10: Zinzendorf moves to his printed date (HWHM, GCW, Anglican Martyrology). Gregory of Nazianzus (LFF/HWHM/GCW) becomes rank 1.
k, z = sin_of('05-09', 'Nicolaus Ludwig von Zinzendorf')
zrow = dict(row('05-09', 'Nicolaus Ludwig von Zinzendorf')['d']); zsin = dict(z['d'])
remove_candidate('05-09', 'Nicolaus Ludwig von Zinzendorf', 'moved to 05-10 (same SIN retained)')
renumber('05-09')
append_alternate('05-10', zrow, zsin,
                 source_witnesses='HWHM; GCW; AM (all print 10 May); FAS',
                 source_tier='TEC secondary / Anglican martyrology',
                 preliminary_status='Curator-approved date correction',
                 ranking_rationale='Printed on 10 May in Holy Women, Holy Men and A Great Cloud of Witnesses (Prophetic Witness, 1760) and listed on 10 May in the Anglican Martyrology. Moved from 05-09 by the curator on 2026-10-02; selected as primary on 05-10 with Comgall of Bangor retained as an alternate.',
                 review_flags='date corrected 2026-10-02; Protestant/Moravian review',
                 notes='Curatorial correction 2026-10-02: previously placed on 05-09, a date no held source supports.')

# 08-19 -> 08-09: Mary Sumner moves to her verified date as an alternate; John Eudes becomes rank 1 on 08-19.
k, s = sin_of('08-19', 'Mary Sumner')
srow = dict(row('08-19', 'Mary Sumner')['d']); ssin = dict(s['d'])
remove_candidate('08-19', 'Mary Sumner', 'moved to 08-09 (same SIN retained)')
renumber('08-19')
append_alternate('08-09', srow, {'sin': ssin['sin'], 'entity_type': ssin['entity_type'], 'identity_note': ''},
                 source_witnesses='AM (9 August, Alresford, 1921)',
                 source_tier='Anglican martyrology',
                 preliminary_status='Curator-approved alternate',
                 ranking_rationale='The Anglican Martyrology places Mary Sumner on 9 August (died at Alresford, 1921). Moved from 08-19 by the curator on 2026-10-02 and retained on 08-09 as an alternate to Edith Stein (LFF 2024).',
                 review_flags='date corrected 2026-10-02',
                 notes='Curatorial correction 2026-10-02: previously placed on 08-19, a date no held source supports.')

# 12-11: Menzies removed (she remains an alternate on 11-24 under the same SIN, UO-SIN-000541). Howden stays rank 1.
remove_candidate('12-11', 'Lucy Menzies', 'Lucy Menzies remains the 11-24 alternate (same SIN UO-SIN-000541); the 12-11 assignment had no source')
renumber('12-11')

# 12-29: the unsupported "David of London" is withdrawn; its SIN is retired and not reused. Thomas Becket stays rank 1.
remove_candidate('12-29', 'David of London', 'Unsupported identity: the Anglican Martyrology entry for 29 December is the prophet Nathan and King David; no David of London is attested. Not to be repurposed for King David or Thomas Becket', retire_sin='withdrawn')
renumber('12-29')

# ------------------------------------------------------------------------------------------------------------------
# 2. Charles Wesley 12-18: retained as the curator's deliberate birthday observance; attribution corrected
# ------------------------------------------------------------------------------------------------------------------
w = row('12-18', 'Charles Wesley')
get('cand', 'december').set(w,
    tradition='Anglican / Methodist',
    source_witnesses="Curator's birthday observance; ecclesial reception through the joint 3 March commemoration (LFF; HWHM; GCW; FAS; SEC)",
    source_tier='Editorial selection (curator) on a received joint commemoration',
    preliminary_status='Curator-approved editorial observance',
    ranking_rationale="Charles Wesley is individually commemorated on 18 December by the curator's deliberate birthday observance (born 18 December 1707; LFF 2024 gives the birthday in the 3 March biography, printed p.124). The received joint commemoration with John remains on 3 March. LFF, HWHM and GCW do not print a 18 December feast.",
    review_flags='editorial date (birthday); not a received calendar date; apparatus only',
    notes="Charles Wesley is individually commemorated on December 18 by the curator's deliberate birthday observance. The received joint commemoration with John remains on March 3.")
w3 = row('03-03', 'Charles Wesley')
get('cand', 'march').set(w3, source_witnesses='LFF; HWHM; GCW; FAS; SEC (joint commemoration with John, 3 March)',
    notes="Alternate form of the received joint commemoration. Charles is also individually observed on 18 December by the curator's deliberate birthday observance.")

# ------------------------------------------------------------------------------------------------------------------
# 3. Intentional overlaps (apparatus)
# ------------------------------------------------------------------------------------------------------------------
get('cand', 'january').set(row('01-02', 'Basil the Great and Gregory of Nazianzus'),
    notes="Received joint commemoration (Anglican Martyrology 2 Jan; For All the Saints 2 Jan; Common Worship). Preserved. Gregory is also individually observed on 9 May (LFF, HWHM, GCW) and Basil on 14 June: intentional additional observances (curator, 2026-10-02).")
get('cand', 'may').set(row('05-09', 'Gregory of Nazianzus'),
    notes="Printed 9 May in LFF, HWHM and GCW. Intentional additional individual observance alongside the joint 2 January commemoration with Basil (curator, 2026-10-02).")
get('cand', 'june').set(row('06-14', 'Basil of Caesarea'),
    notes="Printed 14 June in LFF, HWHM and GCW. Preserved; Basil is also commemorated jointly with Gregory on 2 January.")

# ------------------------------------------------------------------------------------------------------------------
# 4. Citation repairs (dates preserved)
# ------------------------------------------------------------------------------------------------------------------
REPAIRS = [
 ('02-29', 'Oswald of Worcester', dict(source_witnesses='Worcester Cathedral leap-year feast, Thursday 29 Feb 2024 (Sunday News 18 Feb 2024, p.5; Services and Music Feb/Mar 2024); AM (28 Feb); ODS',
    notes='Held books (Anglican Martyrology) place Oswald on 28 February. Worcester Cathedral keeps his feast on 29 February in leap years: "The Feast of St Oswald is on Thursday 29 February" (Sunday News, 18 Feb 2024, PDF p.5; https://www.worcestercathedral.org.uk/media/brtevqbd/2024-february-18.pdf); Services and Music Feb/Mar 2024 lists "Thursday 29th: Oswald, Bishop of Worcester, 992".')),
 ('04-06', 'Celestine I', dict(source_witnesses='Book of Saints, printed p.134 (PDF p.147), left column, 6 April',
    notes='Book of Saints: "Celestine I, Pope (St) ... 6 April ... d. 432". The earlier "AM; Oxford" attribution did not establish the date.')),
 ('05-06', 'John before the Latin Gate', dict(source_witnesses='ODS (John the Evangelist entry: West 6 May, Dedication of the church of St John before the Latin Gate); Butler, Lives of the Saints, 6 May',
    notes='ODS John the Evangelist entry: "in the West, 27 December and 6 May, the Dedication of the church of St. John before the Latin Gate". Butler\'s 6 May chapter cited by the curator (not held in the repository). The unverified AM attribution is removed.')),
 ('05-16', 'Brendan the Navigator', dict(source_witnesses='AM, p.58 (16 May: Brendan of Clonfert)',
    notes='Anglican Martyrology p.58 places Brendan of Clonfert on 16 May. A January 15 mention occurs within the entry for Ita.')),
 ('05-17', 'Restituta of Carthage', dict(source_witnesses='Book of Saints, printed p.638 (PDF p.651), right column, 17 May',
    notes='Book of Saints: "Restituta (St) 17 May d. 304. A Roman African maiden, she was martyred at Carthage in the reign of Diocletian."')),
 ('07-03', 'Joshua the Prophet (Son of Nun)', dict(source_witnesses='Coptic Orthodox Church Synaxarium (Paona 26)',
    source_tier='Great Church supplementation (Coptic Orthodox Synaxarium)',
    notes='Deliberate Great Church supplementation by the curator under the Editorial Rules: the date is dated by the received Coptic commemoration (Paona 26) and is not duplicated by an Anglican calendar.')),
 ('07-10', 'Anthony and Theodosius of the Kyiv Caves', dict(source_witnesses='AM (10 July: Antony Pechersky and Theodosius Pechersky)',
    notes='Anglican Martyrology 10 July names them "St. Antony Pechersky and St. Theodosius Pechersky", abbots of the Cave monastery of Kiev.')),
 ('07-15', 'Vladimir of Kyiv', dict(source_witnesses='AM (15 July); Vladimir also discussed on 11 July within Olga\'s entry',
    notes='Anglican Martyrology 15 July: "In 1015, St. Vladimir of Kiev". The 11 July discussion of Vladimir occurs within Olga\'s entry.')),
 ('10-27', 'Odran of Iona', dict(source_witnesses='AM (27 October, as Otteran); ODS (Odran (Otteran) of Iona)',
    notes='Anglican Martyrology 27 October: "In 563, St Otteran, abbot"; ODS: "ODRAN (Otteran) OF IONA (d. c.563)".')),
 ('12-20', 'Ammonius and Companions', dict(candidate='Ammon and Companions', source_witnesses='AM (20 December: Ammon and companions)',
    notes='Anglican Martyrology 20 December: "In 250, at Alexandria, St. Ammon and companions" (Decian persecution). Label reconciled from "Ammonius and Companions" to the attested "Ammon and Companions"; unrelated to Ammonius the hermit (8 November). Book of Saints gives the corresponding group on 1 June and is not evidence for 20 December.')),
 ('12-22', 'Chaeremon of Nilopolis and Companions', dict(source_witnesses='Book of Saints, printed p.135 (PDF p.148), right column, 22 December',
    notes='Book of Saints: "Chaeremon of Nilopolis and Comps (SS) 22 December d. 250. A very old bishop of Nilopolis (Egypt)".')),
 ('12-23', 'Thorlak of Iceland', dict(source_witnesses='AM (23 December, as Thorlac)',
    notes='Anglican Martyrology 23 December: "At Skalholt in Iceland, St. Thorlac, bishop".')),
 ('12-30', 'Egwin of Worcester', dict(source_witnesses='AM (30 December; 10 September is the translation of his relics); ODS (Feast: 30 December)',
    notes='Anglican Martyrology (entry under 10 September): "In the Middle Ages St Egwin was commemorated on 30 December: September 10 is the day of the translation of his relics in 1039." ODS: "Feast: 30 December; translation feasts 10 September and 11 January."')),
]
for date, name, ch in REPAIRS:
    r = row(date, name)
    kind, sr = sin_of(date, name)            # look the SIN record up under the OLD name first
    get('cand', month_of(date)).set(r, **ch)
    if 'candidate' in ch:                    # keep the SIN tables' names in step with the relabelled candidate
        if kind == 'alt': sr['d'].update(normalized_name=ch['candidate'], source_candidate_name=ch['candidate'])
        else: sr['d'].update(canonical_name=ch['candidate'])
        sr['line'] = None

# ------------------------------------------------------------------------------------------------------------------
# 5. Harmonization register
# ------------------------------------------------------------------------------------------------------------------
h = Csv(os.path.join(K, 'kalendar-v0.1-cross-date-harmonization.csv'))
def hset(name, **kw):
    r = [x for x in h.rows if x['d']['candidate_or_group'] == name]
    assert len(r) == 1, name
    h.set(r[0], **kw)
hset('Basil the Great and Gregory of Nazianzus / Basil and Gregory individual forms', qc_status='Resolved',
     notes='Governed 2026-10-02: the received joint commemoration stays on 01-02 (Anglican Martyrology, For All the Saints, Common Worship). Gregory (05-09) and Basil (06-14) are intentional additional individual observances printed in LFF, HWHM and GCW.')
hset('Charles Wesley / John and Charles Wesley', qc_status='Resolved',
     notes="Governed 2026-10-02: the received joint commemoration stays on 03-03 (LFF, HWHM, GCW, FAS, SEC). Charles is also commemorated individually on 12-18 by the curator's deliberate birthday observance (born 18 December 1707; LFF 2024 gives the birthday in the 3 March biography). 12-18 is an editorial date, not a received calendar date.")
last = h.rows[-1]
for name, dates, files, issue, notes in [
    ('James Otis Sargent Huntington', '05-03; 11-25', 'may; november', 'duplicate/date harmonization', 'Governed 2026-10-02: the 05-03 copy was an erroneous duplicate and is removed (its SIN UO-SIN-000999 is retired). Huntington remains the 11-25 primary (LFF, HWHM, GCW), UO-SIN-000148.'),
    ('Nicolaus Ludwig von Zinzendorf', '05-09; 05-10', 'may', 'date correction', 'Governed 2026-10-02: printed 10 May in HWHM, GCW and the Anglican Martyrology; moved from 05-09 and selected as primary on 05-10. Comgall of Bangor remains an alternate on 05-10.'),
    ('Mary Sumner', '08-19; 08-09', 'august', 'date correction', 'Governed 2026-10-02: the Anglican Martyrology places Mary Sumner on 08-09; she is retained there as an alternate to Edith Stein (LFF). 08-19 is now John Eudes.'),
    ('Lucy Menzies', '12-11; 11-24', 'december; november', 'date correction', 'Governed 2026-10-02: SEC calendar and the Anglican Martyrology place Lucy Menzies on 11-24, where she is an alternate to the primary group (LFF). 12-11 is now Frederick Howden Jr. (LFF).'),
    ('David of London', '12-29', 'december', 'unsupported identity', 'Governed 2026-10-02: withdrawn. No David of London is attested; the Anglican Martyrology entry for 29 December is the prophet Nathan and King David. Replaced by Thomas Becket (LFF, HWHM, GCW). UO-SIN-000610 is retired and must not be repurposed.'),
]:
    d = {'candidate_or_group': name, 'dates_seen': dates, 'files_seen': files, 'issue_type': issue, 'qc_status': 'Resolved', 'notes': notes}
    h.insert_after(last, d); last = h.rows[h.rows.index(last) + 1]

# ------------------------------------------------------------------------------------------------------------------
# write everything
# ------------------------------------------------------------------------------------------------------------------
for obj in list(CACHE.values()) + [h]:
    obj.save()
with open(os.path.join(K, 'sin/retired-sins.csv'), 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['sin', 'former_name', 'same_person_as_sin', 'reason', 'retired'])
    for sin, name, same, reason in retired: w.writerow([sin, name, same, reason, WHEN])
print('applied; retired SINs:', [(a, b) for a, b, *_ in retired])
