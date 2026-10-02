#!/usr/bin/env python3
"""Verify the Anglican calendar against the curator's approved corrections (2026-10-02). Run from the repository root.
Exit status 1 if any check fails."""
import csv, glob, json, re, sys
fails = []
def check(cond, msg):
    print(('PASS  ' if cond else 'FAIL  ') + msg)
    if not cond: fails.append(msg)

dec = json.load(open('data/kalendar/synaxarium/decisions.json'))['decisions']
exp = json.load(open('synaxarium-review/data/synaxarium-decisions-2026-10-02-corrected.json'))
san = json.load(open('data/saints/sanctoral.json'))['entries']
kd = json.load(open('synaxarium-review/data/kalendar-data.json'))
retired = [r['sin'] for r in csv.DictReader(open('data/kalendar/sin/retired-sins.csv'))]

def fixed(r): return ['%02d-%02d' % (d['month'], d['day']) for d in r.get('observance', {}).get('dates', [])] if r.get('observance', {}).get('type') == 'fixed' else []
def ang(date, role=None): return [r for r in san if 'ANG' in r['tags'] and date in fixed(r) and (role is None or r.get('angRole') == role)]

# 1. complete calendar
check(len(dec) == 366 and len(exp['decisions']) == 366, 'Synaxarium keeps its 366-day calendar (decisions.json and the corrected export)')
check(all(ang(k, 'primary') for k in dec), 'every one of the 366 dates has an Anglican primary row in sanctoral.json')
check(all(len(ang(k, 'primary')) == 1 for k in dec), 'exactly one Anglican primary row per date')

# 2. approved assignments
PRIMARY = {'05-03': 'Elisabeth Cruciger', '05-09': 'Gregory of Nazianzus', '05-10': 'Nicolaus Ludwig von Zinzendorf',
           '08-09': 'Edith Stein (Teresa Benedicta of the Cross)', '08-19': 'John Eudes',
           '11-24': 'Catherine of Alexandria, Barbara of Nicomedia, and Margaret of Antioch', '12-11': 'Frederick Howden Jr.',
           '12-18': 'Charles Wesley', '12-29': 'Thomas Becket', '01-02': 'Basil the Great and Gregory of Nazianzus',
           '06-14': 'Basil of Caesarea', '03-03': 'John and Charles Wesley', '11-25': 'James Otis Sargent Huntington',
           '02-29': 'Oswald of Worcester', '04-06': 'Celestine I', '05-06': 'John before the Latin Gate', '05-16': 'Brendan the Navigator',
           '05-17': 'Restituta of Carthage', '07-03': 'Joshua the Prophet (Son of Nun)', '07-10': 'Anthony and Theodosius of the Kyiv Caves',
           '07-15': 'Vladimir of Kyiv', '10-27': 'Odran of Iona', '12-20': 'Ammon and Companions', '12-22': 'Chaeremon of Nilopolis and Companions',
           '12-23': 'Thorlak of Iceland', '12-30': 'Egwin of Worcester'}
for k, n in PRIMARY.items():
    check(dec[k]['primary']['name'] == n, f'{k} primary in decisions.json = {n}')
    check(any(r.get('synaxariumSin') == dec[k]['primary']['sin'] for r in ang(k, 'primary')), f'{k} primary row in sanctoral.json carries the same SIN ({dec[k]["primary"]["sin"]}); row: ' + ', '.join(r['id'] for r in ang(k, 'primary')))
ALT = {'05-10': 'Comgall of Bangor', '08-09': 'Mary Sumner', '11-24': 'Lucy Menzies'}
for k, n in ALT.items():
    check(any(a['name'] == n and a.get('curator_approved') for a in dec[k]['alternates']), f'{k} approved alternate in decisions.json = {n}')
    asin = next(a['sin'] for a in dec[k]['alternates'] if a['name'] == n)
    check(any(r.get('synaxariumSin') == asin for r in ang(k, 'alternate')), f'{k} approved alternate row in sanctoral.json carries the same SIN ({asin}); row: ' + ', '.join(r['id'] for r in ang(k, 'alternate') if r.get('synaxariumSin') == asin))

# 3. superseded assignments gone
check(not any('Huntington' in a['name'] for a in dec['05-03']['alternates']) and 'Huntington' not in dec['05-03']['primary']['name'], '05-03: Huntington removed (primary and alternates)')
check(not any('Huntington' in r['name'] for r in ang('05-03')), '05-03: no Huntington row in sanctoral.json')
check(len([r for r in san if 'James' in r['name'] and 'Huntington' in r['name'] and 'ANG' in r['tags']]) == 1, 'James Otis Sargent Huntington is a single Anglican identity (11-25); William Reed Huntington (07-27) is a different person')
check(not any('Zinzendorf' in x['name'] for x in [dec['05-09']['primary']] + dec['05-09']['alternates']) and not ang('05-09', None) or all('Zinzendorf' not in r['name'] for r in ang('05-09')), '05-09: Zinzendorf removed')
check(all('Sumner' not in r['name'] for r in ang('08-19')) and 'Sumner' not in dec['08-19']['primary']['name'] and not any('Sumner' in a['name'] for a in dec['08-19']['alternates']), '08-19: Mary Sumner removed')
check(all('Menzies' not in r['name'] for r in ang('12-11')) and 'Menzies' not in dec['12-11']['primary']['name'] and not any('Menzies' in a['name'] for a in dec['12-11']['alternates']), '12-11: Lucy Menzies removed')
names = [dec[k]['primary']['name'] for k in dec] + [a['name'] for k in dec for a in dec[k]['alternates']] + [r['name'] for r in san if 'ANG' in r['tags']]
check('David of London' not in names, '"David of London" is not a primary, alternate or Anglican row anywhere (it survives only inside the curator_correction audit record)')
check(not any(r['id'] == 'david-of-london' for r in san), 'no david-of-london identifier exists')

# 4. documented overlaps
check('9 May' in (dec['01-02']['primary'].get('source_notes') or '') and 'intentional' in (dec['01-02']['primary'].get('source_notes') or ''), '01-02 apparatus documents the intentional Gregory 9 May / Basil 14 June overlap')
check('18 December' in (dec['03-03']['alternates'][0].get('source_witnesses') or '') + json.dumps(exp['decisions']['03-03']['original_candidate_row']) + json.dumps(kd['march']['days']['03-03']), '03-03 apparatus mentions the individual 18 December observance')
hz = list(csv.DictReader(open('data/kalendar/kalendar-v0.1-cross-date-harmonization.csv', encoding='utf-8-sig')))
def hz_note(name): return next((r['notes'] for r in hz if r['candidate_or_group'].startswith(name)), '')
check('intentional additional individual observances' in hz_note('Basil the Great and Gregory'), 'harmonization register: January 2 / May 9 / June 14 overlap documented')
check("deliberate birthday observance" in hz_note('Charles Wesley') and '03-03' in hz_note('Charles Wesley'), 'harmonization register: March 3 / December 18 overlap documented')
w = dec['12-18']['primary']
check('date variant' not in (w.get('source_witnesses') or ''), '12-18: unsupported "HWHM/GCW date variant" claim removed')
check("deliberate birthday observance" in (w.get('source_notes') or ''), '12-18: apparatus records the birthday observance in the notes (outside the devotional text)')

# 5. citations
def note(k): return (dec[k]['primary'].get('source_witnesses') or '') + ' ' + (dec[k]['primary'].get('source_notes') or '')
CIT = {'02-29': ['Worcester Cathedral', '18 Feb 2024'], '04-06': ['p.134', 'PDF p.147'], '05-06': ['John the Evangelist', 'Butler'], '05-16': ['p.58'],
       '05-17': ['p.638', 'PDF p.651'], '07-03': ['Paona 26', 'Great Church supplementation'], '07-10': ['Pechersky'], '07-15': ['15 July', 'Olga'],
       '10-27': ['Otteran', 'ODS'], '12-20': ['Ammon and companions', '1 June'], '12-22': ['p.135', 'PDF p.148'], '12-23': ['Thorlac'], '12-30': ['30 December', '10 September']}
for k, subs in CIT.items():
    check(all(s in note(k) for s in subs) and 'AM; Oxford' not in (dec[k]['primary'].get('source_witnesses') or ''), f'{k} citation repaired: {subs}')

# 6. shared identifiers
sin_tables = {}
for f in glob.glob('data/kalendar/sin/rank1/*.csv'):
    for r in csv.DictReader(open(f, encoding='utf-8-sig')): sin_tables[(r['date'], r['sin'])] = r['canonical_name']
for f in glob.glob('data/kalendar/sin/alternate/*.csv'):
    for r in csv.DictReader(open(f, encoding='utf-8-sig')): sin_tables[(r['date'], r['sin'])] = r['normalized_name']
check(all((k, dec[k]['primary']['sin']) in sin_tables for k in dec), 'every primary SIN resolves in the SIN tables on its own date')
check(all(r.get('synaxariumSin') for k in dec for r in ang(k, 'primary')), 'every Anglican primary row carries its SIN')
rows_sins = {r['synaxariumSin'] for k in dec for r in ang(k, 'primary')}
live = {dec[k]['primary']['sin'] for k in dec} | {a['sin'] for k in dec for a in dec[k]['alternates']}
check(all(s not in rows_sins and s not in live for s in retired), f'retired SINs {retired} are not selected or listed as alternates in decisions.json, and not on any sanctoral row')
check(all(s not in {x[1] for x in sin_tables} for s in retired), 'retired SINs do not appear in the live SIN tables')
check(dec['11-25']['primary']['sin'] == 'UO-SIN-000148', 'Huntington keeps his verified SIN UO-SIN-000148')
check(dec['03-03']['primary']['sin'] == 'UO-SIN-000675' and dec['12-18']['primary']['sin'] == 'UO-SIN-000594', 'joint Wesley commemoration (000675) and individual Charles (000594) keep distinct SINs')
check(dec['10-27']['primary']['sin'] and dec['12-20']['primary']['sin'] == 'UO-SIN-000598', '12-20 relabelled group keeps UO-SIN-000598')
check(sum(len(v['days']) for v in kd.values()) == 366, 'kalendar-data.json (review tool data) covers 366 days')
print('\n%d check(s) failed' % len(fails)); sys.exit(1 if fails else 0)
