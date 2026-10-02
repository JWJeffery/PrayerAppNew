"""Parse the printed calendars of LFF 2024, Holy Women Holy Men and A Great Cloud of Witnesses into {source: {MM-DD: text}}.
Usage: pdftotext -layout each PDF in data/kalendar/source-witnesses/ into <dir>/ (lesser_feasts_and_fasts_-_2024__final_.txt, book_holy_women_holy_men_for_web.txt, lm_great_cloud_of_witnesses.txt), then
  python3 scripts/saints/parse-printed-calendars.py <dir> <out.json>
The output feeds apply-synaxarium-decisions.py (proof that an existing Anglican row belongs on its day). Not committed (derived from the books).
"""
import re,json,sys
MONTHS=['january','february','march','april','may','june','july','august','september','october','november','december']
def parse(path,start_pat,end_pat=None,maxlines=None):
    L=open(path,errors='ignore').read().split('\n')
    # locate calendar region
    s=next(i for i,l in enumerate(L) if re.search(start_pat,l))
    e=len(L)
    if end_pat:
        e=next((i for i in range(s+50,len(L)) if re.search(end_pat,L[i])),len(L))
    cal={}; month=None; cur=None
    for l in L[s:e]:
        t=l.strip()
        m=re.match(r'^(January|February|March|April|May|June|July|August|September|October|November|December)\b\s*$',t,re.I)
        if m: month=MONTHS.index(m.group(1).lower())+1; cur=None; continue
        if month is None: continue
        m=re.match(r'^(\d{1,2})\s*[a-z]?\s*(?=\S|$)(.*)$',t) if re.match(r'^\d{1,2}(\s|[A-Za-z\[\(]|$)',t) else None
        if m and 1<=int(m.group(1))<=31:
            cur=(month,int(m.group(1)))
            cal.setdefault(cur,'')
            cal[cur]+=' '+m.group(2)
        elif cur and t and not re.search(r'Calendar|Copyright|Church Pension|^\d+$',t):
            cal[cur]+=' '+t
    return cal
if __name__=='__main__':
    src=(sys.argv[1].rstrip('/')+'/') if len(sys.argv)>1 else 'src/'
    out={}
    out['LFF']=parse(src+'lesser_feasts_and_fasts_-_2024__final_.txt',r'^\s*January\s*$',r'Collects|The Calendar of the Church Year.{0,5}\s*1[89]\s*$')
    out['HWHM']=parse(src+'book_holy_women_holy_men_for_web.txt',r'^\s*JANUARY\s*$|^\s*January\s*$')
    out['GCW']=parse(src+'lm_great_cloud_of_witnesses.txt',r'^\s*JANUARY\s*$')
    for k,v in out.items():
        print(k,len(v),[ (m,sum(1 for (mm,d) in v if mm==m)) for m in range(1,13)])
    json.dump({k:{'%02d-%02d'%a:b for a,b in v.items()} for k,v in out.items()},open(sys.argv[2] if len(sys.argv)>2 else 'calsrc.json','w'))
