#!/usr/bin/env python3
"""
scripts/saints/migrate_to_sanctoral.py

One-time migration: twelve month-keyed saints files -> a single flat
data/saints/sanctoral.json keyed by identity, with an explicit `observance`
rule on every entry.

WHY: the month-file layout cannot house a commemoration whose date moves
between months from year to year, and 11 of the 24 Church of the East
commemorations tested against the printed diocesan calendars do exactly that
(Mar Ezekiel of Daqoq is in June in 2024 and July in every other year; St Jacob
of Nisibis is in August in 2025 and July otherwise).

THREE OBSERVANCE TYPES:
  fixed    - {"type":"fixed","dates":[{"month":7,"day":3}]}
             A fixed Gregorian date. The default, and correct for every
             Anglican/Latin/Byzantine/Oriental entry and for part of the COE
             sanctoral. Multi-date `day` strings become multiple dates.
  cycle    - {"type":"cycle","cycle":"shlihe","week":7,"weekday":0}
             Anchored to the East Syriac week structure. weekday 0=Sunday.
             Resolved by js/calendar-east-syriac.js.
  ordinal  - {"type":"ordinal","month":3,"weekday":3,"n":1}
             The nth given weekday of a month (first Wednesday of March).

Every entry keeps its original `day` string as `dayLegacy`, so nothing is lost
and the migration is auditable after the fact.

A `ruleSource` field records WHY a non-fixed rule was assigned. An entry without
one has not been verified against a printed calendar and stays `fixed`.
"""
import json, re, os, sys

MONTHS = ['january','february','march','april','may','june','july','august',
          'september','october','november','december']
MONTH_NO = {m: i + 1 for i, m in enumerate(MONTHS)}

ACOTE = ("Verified against the Assyrian Church of the East, Diocese of Western "
         "Europe published ecclesiastical calendars 2020-2026, all seven editions")

# Rules assigned ONLY where the slot was confirmed against the printed calendars.
# The count after each is how many of the seven years agreed.
RULES = {
  # --- cycle-anchored, 7/7 ---
  'mar-yokhannan-zaroqa':   ({"type":"cycle","cycle":"denkha","week":1,"weekday":4},      f"Thursday of the First Week of Epiphany. {ACOTE} (7/7)."),
  'mar-benyamin-shimun':    ({"type":"cycle","cycle":"denkha","week":7,"weekday":0},      f"Sunday of the Seventh Week of Epiphany. {ACOTE} (7/7)."),
  'mar-michael':            ({"type":"cycle","cycle":"sauma","week":6,"weekday":0},       f"Sunday of the Sixth Week of the Fast. {ACOTE} (7/7)."),
  'mar-pinhas':             ({"type":"cycle","cycle":"qyamta","week":2,"weekday":5},      f"Friday of the Second Week of the Resurrection. {ACOTE} (7/7)."),
  'mar-abdisho':            ({"type":"cycle","cycle":"qyamta","week":3,"weekday":0},      f"Sunday of the Third Week of the Resurrection, with Mar Yonan and Mar Khanania. {ACOTE} (7/7)."),
  'mar-yonan':              ({"type":"cycle","cycle":"qyamta","week":3,"weekday":0},      f"Sunday of the Third Week of the Resurrection, with Mar Abdisho and Mar Khanania. {ACOTE} (7/7)."),
  'mar-sargis-and-bacchus': ({"type":"cycle","cycle":"qyamta","week":5,"weekday":5},      f"Friday of the Fifth Week of the Resurrection. {ACOTE} (7/7). NOTE: the calendars also keep a second, FIXED commemoration of these martyrs on 17 October; this entry is the spring one."),
  'mar-meelis-tel-khesh':   ({"type":"cycle","cycle":"shlihe","week":4,"weekday":0},      f"Sunday of the Fourth Week of the Apostles, with Mar Bar Qusre. {ACOTE} (7/7)."),
  'mar-ezekiel-of-daqoq':   ({"type":"cycle","cycle":"shlihe","week":7,"weekday":0},      f"Sunday of the Seventh Week of the Apostles. {ACOTE} (7/7). Falls in June in 2024 and July in the other six years, which is why a fixed date cannot express it."),
  'saint-jacob-of-nisibis': ({"type":"cycle","cycle":"qayta","week":1,"weekday":5},       f"Friday of the First Week of Summer. {ACOTE} (7/7). Falls in August in 2025 and July otherwise."),
  'mar-papa-bar-aggai':     ({"type":"cycle","cycle":"eliya-sliwa","week":1,"weekday":5}, f"Friday of the First Week of Elijah. {ACOTE} (7/7). Falls in August in 2024 and September otherwise."),
  'prophet-elias-elijah':   ({"type":"cycle","cycle":"eliya-sliwa","week":7,"weekday":5}, f"Friday of the Seventh Week of Elijah. {ACOTE} (7/7)."),
  'mar-augin-saint-eugene': ({"type":"cycle","cycle":"qudash-idta","week":1,"weekday":5}, f"Friday of the First Week of the Hallowing of the Church. {ACOTE} (7/7)."),
  # --- cycle-anchored, 6/7: the single miss is 2025, where the diocese merged
  #     the Sixth and Seventh Weeks of Summer into one calendar week ---
  'mar-shimon-bar-sabbae':  ({"type":"cycle","cycle":"qayta","week":6,"weekday":5},       f"Friday of the Sixth Week of Summer. {ACOTE} (6/7; the 2025 miss is that year's merger of the Sixth and Seventh Weeks of Summer, an editorial compression the diocese applies to make the year fit, not a different rule)."),
  'mar-qardagh':            ({"type":"cycle","cycle":"qayta","week":7,"weekday":5},       f"Friday of the Seventh Week of Summer. {ACOTE} (6/7; same 2025 compression as Mar Shimon Bar Sabbae, with whom he shared a day that year)."),
  'mar-mari-the-apostle':   ({"type":"cycle","cycle":"qayta","week":2,"weekday":5},       f"Friday of the Second Week of Summer. {ACOTE} (6/7; the 2025 edition places him on the Saturday of that week rather than the Friday)."),
  # --- ordinal weekday of month, 7/7 ---
  'mar-george-the-martyr':  ({"type":"ordinal","month":3,"weekday":3,"n":1},              f"The first Wednesday of March. {ACOTE} (7/7: 6 Mar 2024, 5 Mar 2025, 4 Mar 2026 and so on). NOTE: the calendars also keep St George on the FIXED 24 April and on the first Monday of November."),
  'mar-yosip-khnanisho':    ({"type":"ordinal","month":7,"weekday":0,"n":2},              f"The second Sunday of July. {ACOTE} (7/7). Coincided with the Feast of Nusardel in 2026 but not in other years."),
}

# Fixed-date entries whose fixity was positively CONFIRMED across all seven
# calendars, as opposed to merely inherited from the old data.
CONFIRMED_FIXED = {
  'mar-timotheus-malabar':   f"1 May in all seven editions. {ACOTE}.",
  'saint-ephrem-the-syrian': f"9 June in all seven editions. {ACOTE}.",
  'saint-thomas-the-apostle':f"3 July in all seven editions. {ACOTE}.",
  'mar-cyriacus-and-julitta':f"15 July in all seven editions. {ACOTE}.",
  'mar-hurmizd':             f"1 September in all seven editions. {ACOTE}.",
  'mar-sawa-the-physician':  f"14 September in all seven editions. {ACOTE}.",
  'mar-bisho-of-kmol':       f"14 September in all seven editions. {ACOTE}.",
  'mar-pethion':             f"25 October in all seven editions. {ACOTE}.",
  'mar-micha':               f"1 November in all seven editions, with Mar Akha. {ACOTE}.",
  'mar-jacob-the-mutilated': f"19 November in all seven editions. {ACOTE}.",
}

def parse_days(day_field):
    """'February 2, February 3' -> [{'month':2,'day':2},{'month':2,'day':3}]"""
    out = []
    for part in re.split(r'[;,]', str(day_field or '')):
        part = part.strip()
        if not part:
            continue
        m = re.match(r'^([A-Za-z]+)\s+0*(\d{1,2})$', part)
        if not m:
            raise ValueError(f"unparseable day field: {part!r}")
        mon = m.group(1).lower()
        if mon not in MONTH_NO:
            raise ValueError(f"unknown month: {part!r}")
        out.append({"month": MONTH_NO[mon], "day": int(m.group(2))})
    if not out:
        raise ValueError(f"empty day field: {day_field!r}")
    return out

def main(root='.'):
    entries, seen = [], {}
    for mon in MONTHS:
        path = os.path.join(root, 'data', 'saints', f'saints-{mon}.json')
        for rec in json.load(open(path, encoding='utf-8')):
            e = dict(rec)
            e['dayLegacy'] = rec['day']
            key = (rec['id'], rec['day'])
            if key in seen:
                raise ValueError(f"duplicate (id, day): {key}")
            seen[key] = True
            if rec['id'] in RULES and 'COE' in rec.get('tags', []):
                obs, why = RULES[rec['id']]
                e['observance'] = obs
                e['ruleSource'] = why
            else:
                e['observance'] = {"type": "fixed", "dates": parse_days(rec['day'])}
                if rec['id'] in CONFIRMED_FIXED and 'COE' in rec.get('tags', []):
                    e['ruleSource'] = CONFIRMED_FIXED[rec['id']]
            del e['day']
            entries.append(e)

    entries.sort(key=lambda e: (e['observance'].get('dates', [{}])[0].get('month', 99),
                                e['observance'].get('dates', [{}])[0].get('day', 99),
                                e['id']))
    doc = {
        "schemaVersion": 1,
        "note": ("Flat sanctoral. Every entry carries an explicit `observance` rule: "
                 "fixed | cycle | ordinal. `dayLegacy` preserves the original "
                 "month-file day string for audit. `ruleSource` records the "
                 "evidence for any non-default rule; an entry without one is a "
                 "fixed date inherited from the previous data and NOT independently "
                 "confirmed against a printed calendar."),
        "entries": entries,
    }
    out = os.path.join(root, 'data', 'saints', 'sanctoral.json')
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(doc, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    kinds = {}
    for e in entries:
        kinds[e['observance']['type']] = kinds.get(e['observance']['type'], 0) + 1
    print(f"wrote {out}: {len(entries)} entries")
    print("  by observance type:", kinds)
    print("  with ruleSource:", sum(1 for e in entries if 'ruleSource' in e))
    print("  COE entries:", sum(1 for e in entries if 'COE' in e.get('tags', [])))

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
