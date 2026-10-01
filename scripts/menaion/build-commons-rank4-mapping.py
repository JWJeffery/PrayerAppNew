#!/usr/bin/env python3
"""Build data/menaion/commons/mapping-rank4.json: rank-4 commemorations -> Orloff Common,
by conservative rules on the app's own entry NAME (never guessed from elsewhere).
Skipped (not mapped): feasts/forefeasts/afterfeasts/leavetakings, righteous/ancestors, mixed or
ambiguous entries. Review the printed table before committing.
"""
import json, glob, os, re
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
FEMALE = set('''Anastasia Elizabeth Domnica Xenia Macrina Melania Tatiana Agatha Lucy Anysia Eudokia Pelagia Irene Glyceria
Theodosia Charitina Matrona Febronia Agrippina Aquilina Christina Theodora Euphrosyne Mary Menodora Sophia Phoebe Maura'''.split())
FEMALE_PLURAL = ('Menodora','Sophia (Faith)')
TITLES = re.compile(r'^(Holy Great Martyr|Holy Great-Martyr|Holy Martyrs|Holy Martyr|Martyr|Hieromartyrs|Hieromartyr|Venerable Martyr|Monastic Martyr|Holy Apostles|Holy Apostle|Holy Prophet|Venerable|St\.|Sts\.|Blessed|Equal-to-the-Apostles|Holy Unmercenary Physicians|Our Father among the Saints|The)\s+', re.I)
def personal(name):
    n = TITLES.sub('', name)
    n = re.sub(r'\s*\(.*?\)', '', n)
    n = n.split(';')[0]
    # single saint: drop " of Place", ", Bishop of ..." etc.
    plural = bool(re.search(r',| and |companions', n))
    if not plural:
        n = re.split(r'\s+(of|the)\s+', n)[0]
    else:
        n = re.sub(r',? and (his|their) .*$', '', n)
        n = re.sub(r',? and companions$', ' and companions', n)
        n = re.sub(r'\s+of\s+[A-Z][\w\s]*$', '', n) if ',' not in n and ' and ' not in n else n
    n = re.sub(r',\s*(Bishop|Archbishop|Patriarch|Pope|Hegumen|Abbot|Presbyter|Deacon|Archdeacon|Metropolitan|Confessor|Hymnographer)\b[^,]*?(?=( and companions|$))', '', n)
    n = re.sub(r',\s*(Bishop|Archbishop|Patriarch|Pope|Hegumen|Abbot)\b.*$', '', n)
    n = re.sub(r'\s+(the|of)\s+(Goths|Gardener|Wonder-Worker|Anchorite|Confessor|Great|Younger|Hospitable|Ascetic|New|Stylite|Penitent|Sabaite).*$', '', n) if ' and ' not in n and ',' not in n else n
    n = n.replace(', and ', ' and ').strip()
    return n
ents = []
for f in sorted(glob.glob(os.path.join(ROOT, 'data/menaion/[a-z]*.json'))):
    if os.path.basename(f) in ('schema.json','research-batch.json','research-queue.json'): continue
    for k, v in sorted(json.load(open(f))['dates'].items()):
        for e in v['commemorations']:
            if e['rank'] == 4: ents.append((k, e))
SKIP_TYPES = {'feast','marian_feast','lord','righteous','saint'}
SKIP_IDS = {'cyprian-ustyna-martyrs', 'cornelius-centurion', 'john-russian', 'stephen-younger'}
# hand-reviewed corrections to the rule output: id -> (common or None, invocation)
OV = {
 'lawrence-archdeacon-rome': ('martyr','Lawrence'), 'melania-roman': (None,'Melania'), 'macrina-sister-basil': (None,'Macrina'),
 'metrophanes-cp': (None,'Metrophanes'), 'hieromartyrs-cherson': ('hieromartyrs-many','the Hieromartyrs of Cherson'),
 'eutyches-hieromartyr': (None,'Eutyches'), 'sebastian-rome': (None,'Sebastian and his companions'),
 'martyr-codratus-corinth': (None,'Codratus and his companions'), 'pamphilius-caesarea': (None,'Pamphilius and his companions'),
 'isaakios-dalmatos-faustus': (None,'Isaakios, Dalmatos and Faustus'), 'ten-martyrs-crete': (None,'the Ten Martyrs'),
 'forty-two-martyrs-ammoria': (None,'the Forty-Two Martyrs'), 'thirty-three-martyrs-melitene': (None,'the Thirty-Three Martyrs'),
 'symeon-bishop-persia': (None,'Symeon and his companions'), 'patrick-bishop-prusa': (None,'Patrick and his companions'),
 'babylas-bishop-antioch': (None,'Babylas and his companions'), 'hermolaus-hieromartyr': (None,'Hermolaus and his companions'),
 'arethas-martyrs-nagran': (None,'Arethas and his companions'), 'acepsimas-bishop-persia': (None,'Acepsimas and his companions'),
 'martyr-paramon': (None,'Paramon and his companions'), 'nikon-and-companions': (None,'Nikon and his companions'),
 'terence-pompeius-companions': (None,'Terence, Pompeius and their companions'), 'lucian-antioch-martyr': (None,'Lucillian and his companions'),
 'agathonikos-martyr': (None,'Agathonikos and his companions'), 'andrew-stratelates': (None,'Andrew and his companions'),
 'martyrs-persia-shapur': (None,'the Martyrs and Confessors of Persia'), 'erasmus-of-ohrid': (None,'Orestes and Erasmus'),
 'dionysius-areopagite': (None,'Dionysius'), 'philip-apostle-october': (None,'Philip'), 'james-brother-lord-october': (None,'James'),
 'stephen-sabaite-hymnographer': ('monk','Stephen'), 'terence-neonilla-family': (None,'Terence, Neonilla and their children'),
 'george-chozebite': (None,'George'),
}
out, skipped = [], []
for k, e in ents:
    name = e['name']
    if e['type'] in SKIP_TYPES or e['id'] in SKIP_IDS or ';' in name or re.search(r'Forefeast|Leavetaking|Afterfeast|Translation of|Placing|Appearance|Synaxis|Conception|Indiction|Miracle|Seven Youths', name):
        skipped.append((k, e['id'], name[:60], 'feast/ambiguous')); continue
    first = TITLES.sub('', name).split()[0].strip(',')
    plural = bool(re.search(r'Martyrs|Apostles|Hieromartyrs|Sts\.|Prophets| and companions| and his |, and | and [A-Z]', name))
    if name.startswith('Hieromartyrs'): common = 'hieromartyrs-many'
    elif 'Hieromartyr' in name:
        common = 'hieromartyrs-many' if plural and re.search(r'companions|and its|,', name) and 'Bishop' not in name.split('companions')[0][-0:] and False else 'hieromartyr'
    elif name.startswith(('Holy Apostles','Holy Apostle')):
        common = 'apostles-many' if name.startswith('Holy Apostles') else 'apostle'
    elif name.startswith('Holy Prophet'): common = 'prophet'
    elif re.search(r'Venerable Martyr|Monastic Martyr', name):
        common = 'nun-martyr' if first in FEMALE else 'monk-martyr'
    elif name.startswith(('Holy Martyr','Holy Great Martyr','Holy Great-Martyr','The ')) :
        if plural or 'companions' in name or name.startswith('The '):
            common = 'martyrs-many'
        else:
            common = 'female-martyr' if first in FEMALE else 'martyr'
        if name.startswith('Holy Great Martyr') and ' and companions' in name: common = 'martyrs-many'
    elif 'Unmercenary' in name: common = 'unmercenaries-wonderworkers'
    elif name.startswith(('St.','Sts.','Blessed','Equal-to-the-Apostles','Our Father')) and re.search(r'Bishop|Patriarch|Archbishop|Pope|Metropolitan', name):
        common = 'confessor' if 'Confessor' in name else 'hierarch'
        if name.startswith('Sts.'): common = 'hierarchs-many'
    elif name.startswith('Martyr'):
        common = 'martyrs-many' if ('companions' in name or ' and ' in name) else ('female-martyr' if first in FEMALE else 'martyr')
    elif name.startswith('Venerable'):
        head = re.split(r',? (Abbot|Hegumen)\b|, Bishop', name)[0]
        if 'Bishop' in name and 'Confessor' in name: common = 'confessor'
        elif first in FEMALE: common = 'nun'
        elif re.search(r'Xenophon|Symeon the Fool|Disciple', name): common = None
        elif re.search(r',| and ', head.split(' of ')[0]) : common = 'monks-many'
        else: common = 'monk'
    else:
        common = None
    if not common:
        skipped.append((k, e['id'], name[:60], 'no rule')); continue
    inv = personal(name)
    if e['id'] in OV:
        c, i = OV[e['id']]
        common = c or common; inv = i
    out.append({'id': e['id'], 'mmdd': k, 'name': name, 'common': common, 'invocation': inv})
json.dump({'schema': 'menaion-commons-mapping-rank4/1',
           '_comment': 'Rank-4 commemorations mapped to an Orloff Common by name rules (scripts/menaion/build-commons-rank4-mapping.py), reviewed by hand. Vespers stichera only (Josh 2026-10-01).',
           'entries': out}, open(os.path.join(ROOT, 'data/menaion/commons/mapping-rank4.json'), 'w'), indent=1, ensure_ascii=False)
for o in out: print(o['mmdd'], o['common'], '|', o['invocation'], '|', o['name'][:55])
print(len(out), 'mapped;', len(skipped), 'skipped')
for s in skipped: print('SKIP', *s)
