#!/usr/bin/env python3
"""Add the BCP collects the season data refers to but components/anglican.json lacked, and correct one
transcription slip. Texts are the 1979 BCP's own (Rite II "Contemporary", Rite I "Traditional"), taken
from bcponline.org/Collects/{seasonsc,seasonst,holydaysc,holydayst}.html.

  * Seventh and Eighth Sundays after the Epiphany -- needed in years with a long Epiphany season
  * Proper 1 and Proper 2 -- "No collect appointed" on May 17-22 in 2027 and 2029 and on any year Proper 1/2 are used
  * The Transfiguration, August 6 -- "No collect appointed" every August 6
  * First Sunday after Christmas Day -- the BCP gives it precedence over the three Holy Days after Christmas
  * Sixth Sunday after the Epiphany, Rite I: "give us the help of thy grace" (the app had "grant us")
Idempotent.
"""
import json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = os.path.join(ROOT, 'components', 'anglican.json')

NEW = [
 ('bcp-collect-last-epiphany', 'bcp-collect-epiphany-7', 'Collect for the Seventh Sunday after the Epiphany',
  "O Lord, who hast taught us that all our doings without charity are nothing worth: Send thy Holy Ghost and pour into our hearts that most excellent gift of charity, the very bond of peace and of all virtues, without which whosoever liveth is counted dead before thee. Grant this for thine only Son Jesus Christ's sake, who liveth and reigneth with thee and the same Holy Ghost, one God, now and for ever. Amen.",
  "O Lord, you have taught us that without love whatever we do is worth nothing; Send your Holy Spirit and pour into our hearts your greatest gift, which is love, the true bond of peace and of all virtue, without which whoever lives is accounted dead before you. Grant this for the sake of your only Son Jesus Christ, who lives and reigns with you and the Holy Spirit, one God, now and for ever. Amen."),
 ('bcp-collect-last-epiphany', 'bcp-collect-epiphany-8', 'Collect for the Eighth Sunday after the Epiphany',
  "O most loving Father, who willest us to give thanks for all things, to dread nothing but the loss of thee, and to cast all our care on thee who carest for us: Preserve us from faithless fears and worldly anxieties, and grant that no clouds of this mortal life may hide from us the light of that love which is immortal, and which thou hast manifested unto us in thy Son Jesus Christ our Lord; who liveth and reigneth with thee, in the unity of the Holy Spirit, one God, now and for ever. Amen.",
  "Most loving Father, whose will it is for us to give thanks for all things, to fear nothing but the loss of you, and to cast all our care on you who care for us: Preserve us from faithless fears and worldly anxieties, that no clouds of this mortal life may hide from us the light of that love which is immortal, and which you have manifested to us in your Son Jesus Christ our Lord; who lives and reigns with you, in the unity of the Holy Spirit, one God, now and for ever. Amen."),
 ('bcp-collect-proper-3', 'bcp-collect-proper-1', 'Proper 1 (Week of the Sunday closest to May 11)',
  "Remember, O Lord, what thou hast wrought in us and not what we deserve; and, as thou hast called us to thy service, make us worthy of our calling; through Jesus Christ our Lord, who liveth and reigneth with thee and the Holy Spirit, one God, now and for ever. Amen.",
  "Remember, O Lord, what you have wrought in us and not what we deserve; and, as you have called us to your service, make us worthy of our calling; through Jesus Christ our Lord, who lives and reigns with you and the Holy Spirit, one God, now and for ever. Amen."),
 ('bcp-collect-proper-3', 'bcp-collect-proper-2', 'Proper 2 (Week of the Sunday closest to May 18)',
  "O Almighty and most merciful God, of thy bountiful goodness keep us, we beseech thee, from all things that may hurt us, that we, being ready both in body and soul, may with free hearts accomplish those things which belong to thy purpose; through Jesus Christ our Lord, who liveth and reigneth with thee and the Holy Spirit, one God, now and for ever. Amen.",
  "Almighty and merciful God, in your goodness keep us, we pray, from all things that may hurt us, that we, being ready both in mind and body, may accomplish with free hearts those things which belong to your purpose; through Jesus Christ our Lord, who lives and reigns with you and the Holy Spirit, one God, now and for ever. Amen."),
 ('bcp-collect-presentation', 'bcp-collect-transfiguration', 'Collect for the Transfiguration of Our Lord (August 6)',
  "O God, who on the holy mount didst reveal to chosen witnesses thy well-beloved Son, wonderfully transfigured, in raiment white and glistening: Mercifully grant that we, being delivered from the disquietude of this world, may by faith behold the King in his beauty; who with thee, O Father, and thee, O Holy Ghost, liveth and reigneth, one God, world without end. Amen.",
  "O God, who on the holy mount revealed to chosen witnesses your well-beloved Son, wonderfully transfigured, in raiment white and glistening: Mercifully grant that we, being delivered from the disquietude of this world, may by faith behold the King in his beauty; who with you, O Father, and you, O Holy Spirit, lives and reigns, one God, for ever and ever. Amen."),
 ('bcp-collect-christmas-2', 'bcp-collect-christmas-1', 'Collect for the First Sunday after Christmas',
  "Almighty God, who hast poured upon us the new light of thine incarnate Word: Grant that the same light, enkindled in our hearts, may shine forth in our lives; through the same Jesus Christ our Lord, who liveth and reigneth with thee, in the unity of the Holy Spirit, one God, now and for ever. Amen.",
  "Almighty God, you have poured upon us the new light of your incarnate Word: Grant that this light, enkindled in our hearts, may shine forth in our lives; through Jesus Christ our Lord, who lives and reigns with you, in the unity of the Holy Spirit, one God, now and for ever. Amen."),
]

data = json.load(open(PATH))
ids = {c['id'] for c in data}
added = 0
for before, cid, title, r1, r2 in NEW:
    if cid in ids:
        continue
    idx = next(i for i, c in enumerate(data) if c['id'] == before)
    if cid in ('bcp-collect-transfiguration',):
        idx += 1                              # after the Presentation collect
    data.insert(idx, {'id': cid, 'title': title, 'text': {'rite1': r1, 'rite2': r2}, 'type': 'Collect'})
    ids.add(cid); added += 1
fixed = 0
for c in data:
    if c['id'] == 'bcp-collect-epiphany-6' and 'grant us the help of thy grace' in c['text']['rite1']:
        c['text']['rite1'] = c['text']['rite1'].replace('grant us the help of thy grace', 'give us the help of thy grace'); fixed += 1
with open(PATH, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False); f.write('\n')
print(f'collects added: {added}; corrected: {fixed}')
