#!/usr/bin/env python3
"""Apply the Anglican Synaxarium decisions (Josh's export of synaxarium-review, 2026-09-07) to the app.

Inputs : <decisions-export.json> (the Drive file synaxarium-decisions-2026-09-07-cleaned.json),
         synaxarium-review/data/kalendar-data.json (candidate matrix, for alternates),
         <calsrc.json> from scripts/saints/parse-printed-calendars.py (printed LFF 2024 / HWHM / GCW calendars).
Outputs: data/kalendar/synaxarium/decisions.json  (primary + alternates per civil date)
         data/saints/sanctoral.json               (ANG fixed-date rows brought in line with the decisions)
Rules (Josh, 2026-10-02): primary plus alternates; an existing ANG row that conflicts with the decision for its day
is DROPPED unless a credible ecclesial source (printed LFF 2024, Holy Women Holy Men, A Great Cloud of Witnesses)
prints it on that day, in which case it stays as an alternate. The hagiographies are NOT part of this export.
"""
import json, re, sys, collections
dec_path, cal_path = sys.argv[1], sys.argv[2]
dec = json.load(open(dec_path)); decisions = dec['decisions']
kd = json.load(open('synaxarium-review/data/kalendar-data.json'))
cands = {}
for m, v in kd.items():
    for d, rows in v['days'].items(): cands[d] = rows
cal = json.load(open(cal_path))
STOP = {'prophet','three','youths','saint','of','for','their','all','holy','martyr','martyrs','bishop','archbishop','priest','monk','abbot','companions','virgin','mother','apostle','evangelist','feast','commemoration','the','and','king','queen','pastor','teacher','missionary','theologian','deacon','confessor','founder','poet','died','venerable','great','blessed','day','church','lord','jesus','christ'}
import unicodedata
ALIAS = {'lawrence': 'laurence', 'ephraim': 'ephrem', 'rosa': 'rose', 'jeanne': 'joan'}
def toks(n):
    n = unicodedata.normalize('NFKD', n).encode('ascii', 'ignore').decode().lower().replace("'", '')
    return {ALIAS.get(w, w) for w in re.findall(r"[a-z]{3,}", n) if w not in STOP}
def same(a, b):
    """Same person/observance under different spellings: two shared distinctive words, or one shared word of 5+ letters,
    or identical word sets (e.g. 'Leo the Great')."""
    x, y = toks(a), toks(b); c = x & y
    return bool(c) and (len(c) >= 2 or any(len(t) >= 5 for t in c) or x <= y or y <= x)
def clean(t): return re.sub(r'\((?:alternative|see)[^)]*\)', '', t)
PROOF_NAME = {'LFF': 'Lesser Feasts and Fasts 2024', 'HWHM': 'Holy Women, Holy Men', 'GCW': 'A Great Cloud of Witnesses'}
MANUAL_KEEP = {('09-14', 'Exaltation of the Holy Cross'): ['LFF', 'HWHM']}   # printed as "Holy Cross Day"
# rows that are the decided observance under a different title (spelling/wording differs too much for the token rule)
OVERRIDE = {('01-01', 'holy-name-of-jesus-circumcision-of-christ')}
MONTH = ['January','February','March','April','May','June','July','August','September','October','November','December']

# ---- 1. export -------------------------------------------------------------------
out = {'schema': 'universal_office_synaxarium_decisions_v1',
       'source': dec.get('source'), 'exported_at': dec.get('exported_at'), 'format_version': dec.get('format_version'),
       'note': 'Josh\'s decisions from the Kalendar Review tool: one primary per civil date, plus the other ranked candidates as alternates. Hagiographies are not included.',
       'decisions': {}}
for k in sorted(decisions):
    r = decisions[k]; o = r['original_candidate_row']
    prim = {'name': r['selected_candidate'], 'sin': r['selected_sin'], 'designation': o.get('designation'),
            'period': o.get('year_or_period'), 'tradition': o.get('tradition'), 'source_witnesses': o.get('source_witnesses'),
            'source_tier': o.get('source_tier'), 'review_flags': o.get('review_flags'), 'decision_type': r['decision_type'],
            'reviewer_comments': r['reviewer_comments'] or None, 'decided_at': r['timestamp'],
            'entity_type': (o.get('sin') or {}).get('entity_type'), 'harmonization': o.get('harmonization') or None}
    alts = []
    for c in cands.get(k, []):
        if c['candidate'] == r['selected_candidate'] or str(c.get('preliminary_status', '')).startswith('Weak'): continue
        alts.append({'name': c['candidate'], 'sin': (c.get('sin') or {}).get('sin'), 'designation': c.get('designation'),
                     'period': c.get('year_or_period'), 'tradition': c.get('tradition'),
                     'source_witnesses': c.get('source_witnesses'), 'preliminary_status': c.get('preliminary_status')})
    out['decisions'][k] = {'primary': prim, 'alternates': alts}
json.dump(out, open('data/kalendar/synaxarium/decisions.json', 'w'), ensure_ascii=False, indent=1)

# ---- 2. sanctoral ------------------------------------------------------------------
p = 'data/saints/sanctoral.json'; sd = json.load(open(p)); rows = sd['entries']
ids = {r['id'] for r in rows}
def slug(n):
    b = re.sub(r'[^a-z0-9]+', '-', n.lower().replace('’', '')).strip('-')[:60]; i = b; c = 2
    while i in ids: i = f'{b}-{c}'; c += 1
    ids.add(i); return i
def fixed_dates(r):
    ob = r.get('observance', {})
    return ['%02d-%02d' % (d['month'], d['day']) for d in ob.get('dates', [])] if ob.get('type') == 'fixed' else []
stats = collections.Counter(); report = {'matched': [], 'created': [], 'kept_alternate': [], 'stripped_ang': [], 'deleted': []}
primary_ids = {}
for k in sorted(decisions):
    r = decisions[k]; name = r['selected_candidate']; o = r['original_candidate_row']
    hit = next((x for x in rows if k in fixed_dates(x) and (same(name, x['name']) or (k, x['id']) in OVERRIDE)), None)
    if hit:
        if 'ANG' not in hit['tags']: hit['tags'].append('ANG'); stats['ang_tag_added'] += 1
        stats['matched'] += 1; report['matched'].append((k, hit['id']))
    else:
        mo, dy = int(k[:2]), int(k[3:])
        et = (o.get('sin') or {}).get('entity_type')
        hit = {'id': slug(name), 'name': name,
               'description': f"{o.get('designation') or 'Commemoration'}{', ' + o['year_or_period'] if o.get('year_or_period') else ''}. Commemorated in the Anglican calendar of An Anglican Synaxarium (decision of 2026-09-07).",
               'type': 'feast' if et in ('feast', 'event', 'commemoration') else 'saint', 'tags': ['ANG'],
               'dayLegacy': f'{MONTH[mo-1]} {dy}', 'observance': {'type': 'fixed', 'dates': [{'month': mo, 'day': dy}]}}
        rows.append(hit); stats['created'] += 1; report['created'].append((k, hit['id']))
    hit['angRole'] = 'primary'; hit['synaxariumSin'] = r['selected_sin']
    hit['angDecisionSource'] = f"An Anglican Synaxarium, Kalendar Review decision ({r['decision_type']}, {r['timestamp'][:10]}); witnesses: {o.get('source_witnesses')}."
    primary_ids[k] = hit['id']
# conflicting ANG rows
drop = []
for x in list(rows):
    if 'ANG' not in x['tags'] or x.get('angRole') == 'primary': continue
    for k in fixed_dates(x):
        if k not in decisions: continue
        prim = decisions[k]['selected_candidate']
        if same(prim, x['name']) or (k, x['id']) in OVERRIDE: continue   # same person as the primary under another spelling
        proof = [s for s in ('LFF', 'HWHM', 'GCW') if same(x['name'], clean(cal[s].get(k, '')))]
        proof = MANUAL_KEEP.get((k, x['name']), proof)
        if proof:
            x['angRole'] = 'alternate'
            x['angAlternateProof'] = 'Printed on this day in ' + '; '.join(PROOF_NAME[s] for s in proof) + '.'
            stats['kept_alternate'] += 1; report['kept_alternate'].append((k, x['id'], proof))
        else:
            drop.append((k, x))
for k, x in drop:
    if len(fixed_dates(x)) > 1 and any(d != k and d in decisions and same(decisions[d]['selected_candidate'], x['name']) for d in fixed_dates(x)):
        pass
    if x['tags'] == ['ANG']:
        rows.remove(x); stats['deleted'] += 1; report['deleted'].append((k, x['id']))
    else:
        x['tags'].remove('ANG'); x['angNote'] = f'ANG tag removed 2026-10-02: the Synaxarium decision for {k} is {decisions[k]["selected_candidate"]}, and no printed LFF 2024/HWHM/GCW calendar places this commemoration on that day.'
        stats['stripped_ang'] += 1; report['stripped_ang'].append((k, x['id']))
open(p, 'w').write(json.dumps(sd, indent=2, ensure_ascii=False) + '\n')
print(dict(stats))
json.dump(report, open('/tmp/claude-0/-home-user-PrayerAppNew/831c5b64-ae18-55a7-ac84-0cadf047a793/scratchpad/apply-report.json', 'w'), indent=1)
