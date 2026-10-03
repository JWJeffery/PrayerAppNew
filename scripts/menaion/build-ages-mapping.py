#!/usr/bin/env python3
"""Build data/menaion/ages/mapping.json: which rank-3 commemorations may use AGES texts,
and for which slots. Conservative rule (hand-reviewed token list below): an AGES slot is
approved only if EVERY numbered hymn in it names the saint (so forefeast/afterfeast hymns that
share the same day-file are never attributed to the saint). Doxastika/theotokia are not used.
"""
import json, glob, os
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
ages = {}
for f in glob.glob(os.path.join(ROOT, 'data/menaion/ages/[0-9][0-9].json')):
    ages.update(json.load(open(f))['dates'])
# mmdd -> (app commemoration id, tokens that must appear in each approved hymn)
SAINTS = {
 '01-04':('synaxis-seventy-apostles',['seventy','narcis']),'01-10':('gregory-nyssa',['gregory']),
 '01-16':('veneration-chains-peter',['chains','peter']),'02-08':('theodore-stratelates',['theodore']),
 '02-17':('theodore-tyron',['theodore']),'02-23':('polycarp-smyrna',['polycarp']),
'04-30':('james-zebedee',['james','iakov']),'05-10':('simon-zealot-apostle',['simon']),
 '05-15':('pachomius-great',['pachom']),'06-09':('cyril-alexandria-bishop',['cyril']),
 '06-11':('bartholomew-barnabas-apostles',['barnab','bartholomew']),'06-12':('onuphrius-great',['onuphr']),
'07-22':('mary-magdalene-equal-apostles',['mary','magdal']),
 '07-25':('dormition-anna-mother-theotokos',['anna']),'08-01':('procession-cross-maccabees',['macca','eleazar']),
 '08-09':('matthias-apostle-august',['matthias']),'08-31':('deposition-belt-theotokos',['belt','girdle','sash']),
 '09-16':('euphemia-all-praised-september',['euphemia']),'09-24':('thekla-equal-apostles',['thecla','thekla']),
 '09-30':('gregory-illuminator-armenia',['gregory','rhipsim']),'10-06':('thomas-apostle-october',['thomas']),
 '11-23':('amphilochius-iconium',['amphiloch']),'12-07':('ambrose-milan',['ambrose']),
 '12-09':('conception-theotokos-anna',['anna','conceiv']),'12-11':('daniel-stylite',['daniel']),
 '12-17':('prophet-daniel-three-youths',['daniel','youth']),'12-20':('ignatius-god-bearer',['ignatius']),
 '12-22':('great-martyr-anastasia',['anastasia']),'12-29':('holy-innocents',['infant','herod','innocent']),
 '03-09':('forty-martyrs-sebaste',['forty']),'06-22':('eusebius-samosata',['eusebius']),
 '06-30':('synaxis-twelve-apostles',['twelve']),'07-02':('deposition-robe-theotokos',['garment','robe']),
 '08-16':('icon-not-made-by-hands',['icon']),'09-06':('archangel-michael-miracle-chonae',['archangel']),
 '11-01':('cosmas-damian-asia',['cosmas','damian','unmercenar']),'11-12':('john-the-merciful',['john','merciful']),
}
EXTRA_REJECT = {}
# Hand-reviewed by reading each hymn (2026-10-01): slots approved although the automatic rule
# is too strict (e.g. the saint is named in only one of three hymns). Keys: '1','2','g' or
# 'k.h' for sessional hymns (kathisma k, hymn h).
FORCE = {
 ('06-22','vespers_stichera'): ['1','2','3'], ('06-11','vespers_aposticha'): ['1','2','3'],
 ('06-30','vespers_stichera'): ['1','2','3','4','5','6'], ('07-02','vespers_stichera'): ['1','2','3'],
 ('08-01','vespers_stichera'): ['4','5','6'], ('08-01','vespers_aposticha'): ['1','2','3'],
 ('08-16','vespers_stichera'): ['1','2','3'], ('09-06','sessional'): ['1.1'],
 ('09-16','vespers_stichera'): ['4','5','6'], ('11-01','vespers_aposticha'): ['1','2','3'],
 ('11-12','vespers_stichera'): ['4','5','6','g'], ('11-23','vespers_stichera'): ['1','2','3'],
 ('12-17','vespers_aposticha'): ['1','2','3'], ('03-09','vespers_aposticha'): ['g'],
}
ents = {}
for f in glob.glob(os.path.join(ROOT, 'data/menaion/[a-z]*.json')):
    if os.path.basename(f) in ('schema.json','research-batch.json','research-queue.json'): continue
    for k, v in json.load(open(f))['dates'].items():
        for e in v['commemorations']: ents[e['id']] = (k, e)
SLOT_KINDS = ('vespers_stichera','vespers_aposticha','sessional','praises','exapostilarion')
KEYS = lambda i: str(i['index'][0]) if i['role'] == 'n' and i['index'] else ('g' if i['role'] == 'glory' else None)
def names(i, toks): return any(t in i['text'].lower() for t in toks)
out = []
for mmdd, (cid, toks) in SAINTS.items():
    k, e = ents[cid]
    assert k == mmdd and e['rank'] == 3, (cid, k, e['rank'])
    day = ages[mmdd]['slots']
    slots = {}
    for kind in SLOT_KINDS:
        items = day.get(kind, [])
        sel = []
        if kind == 'sessional':   # only hymns that themselves name the saint
            sel += [str(i['index'][0]) + '.' + str(i['index'][1]) for i in items
                    if i['role'] == 'n' and names(i, toks)]
        else:
            nums = [i for i in items if i['role'] == 'n']
            hits = [i for i in nums if names(i, toks)]
            if kind in ('vespers_stichera', 'vespers_aposticha', 'praises'):
                same_tone = len({i['mode'] for i in nums}) == 1
                ok = len(nums) >= 3 and (len(hits) == len(nums) or (same_tone and len(hits) >= 2 and len(nums) == 3))
                if cid in EXTRA_REJECT.get(kind, ()): ok = False
                if ok: sel += [KEYS(i) for i in nums]
            else:   # exapostilarion: only hymns naming the saint
                sel += [KEYS(i) for i in hits]
            for i in items:     # a doxastikon is taken only when it names the saint
                if i['role'] == 'glory' and names(i, toks) and kind != 'praises': sel.append('g')
        if (mmdd, kind) in FORCE: sel = FORCE[(mmdd, kind)]
        if sel: slots[kind] = sel
    if slots:
        out.append({'id': cid, 'mmdd': mmdd, 'name': e['name'], 'slots': slots})
json.dump({'schema': 'menaion-ages-mapping/1',
           '_comment': 'Slot approved only when every selected numbered hymn names the saint (tokens in scripts/menaion/build-ages-mapping.py). Rank-3 only.',
           'entries': out}, open(os.path.join(ROOT, 'data/menaion/ages/mapping.json'), 'w'), indent=1, ensure_ascii=False)
for o in out: print(o['mmdd'], o['id'], o['slots'])
print(len(out))
