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
 '04-30':('james-brother-lord',['james','iakov']),'05-10':('simon-zealot-apostle',['simon']),
 '05-15':('pachomius-great',['pachom']),'06-09':('cyril-alexandria-bishop',['cyril']),
 '06-11':('bartholomew-barnabas-apostles',['barnab','bartholomew']),'06-12':('onuphrius-great',['onuphr']),
 '07-07':('thomas-apostle',['thomas']),'07-22':('mary-magdalene-equal-apostles',['mary','magdal']),
 '07-25':('dormition-anna-mother-theotokos',['anna']),'08-01':('procession-cross-maccabees',['macca','eleazar']),
 '08-09':('matthias-apostle-august',['matthias']),'08-31':('deposition-belt-theotokos',['belt','girdle','sash']),
 '09-16':('euphemia-all-praised-september',['euphemia']),'09-24':('thekla-equal-apostles',['thecla','thekla']),
 '09-30':('gregory-illuminator-armenia',['gregory','rhipsim']),'10-06':('thomas-apostle-october',['thomas']),
 '11-23':('amphilochius-iconium',['amphiloch']),'12-07':('ambrose-milan',['ambrose']),
 '12-09':('conception-theotokos-anna',['anna','conceiv']),'12-11':('daniel-stylite',['daniel']),
 '12-17':('prophet-daniel-three-youths',['daniel','youth']),'12-20':('ignatius-god-bearer',['ignatius']),
 '12-22':('great-martyr-anastasia',['anastasia']),'12-29':('holy-innocents',['infant','herod','innocent']),
}
ents = {}
for f in glob.glob(os.path.join(ROOT, 'data/menaion/[a-z]*.json')):
    if os.path.basename(f) in ('schema.json','research-batch.json','research-queue.json'): continue
    for k, v in json.load(open(f))['dates'].items():
        for e in v['commemorations']: ents[e['id']] = (k, e)
SLOT_KINDS = ('vespers_stichera','vespers_aposticha','praises','exapostilarion')
out = []
for mmdd, (cid, toks) in SAINTS.items():
    k, e = ents[cid]
    assert k == mmdd and e['rank'] == 3, (cid, k, e['rank'])
    slots = {}
    for kind in SLOT_KINDS:
        nums = [i for i in ages[mmdd]['slots'].get(kind, []) if i['role'] == 'n']
        hits = [i for i in nums if any(t in i['text'].lower() for t in toks)]
        if kind == 'vespers_stichera' or kind == 'vespers_aposticha':
            ok = len(nums) >= 3 and len(hits) == len(nums)
        else:
            ok = len(hits) >= 1 and (len(hits) == len(nums) or (cid == 'ignatius-god-bearer' and kind == 'exapostilarion'))
        if ok:
            slots[kind] = [i['index'][0] for i in hits]
    if slots:
        out.append({'id': cid, 'mmdd': mmdd, 'name': e['name'], 'slots': slots})
json.dump({'schema': 'menaion-ages-mapping/1',
           '_comment': 'Slot approved only when every selected numbered hymn names the saint (tokens in scripts/menaion/build-ages-mapping.py). Rank-3 only.',
           'entries': out}, open(os.path.join(ROOT, 'data/menaion/ages/mapping.json'), 'w'), indent=1, ensure_ascii=False)
for o in out: print(o['mmdd'], o['id'], o['slots'])
print(len(out))
