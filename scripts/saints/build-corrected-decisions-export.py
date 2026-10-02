#!/usr/bin/env python3
"""Derive the corrected Kalendar Review decisions export (same format as the Drive file synaxarium-decisions-2026-09-07-cleaned.json).

Usage: build-corrected-decisions-export.py <original export> <kalendar-data.json built from the corrected matrix> <out.json>
Every record's original_candidate_row is refreshed from the corrected matrix; decisions Josh did not change keep their
timestamps, comments and decision types. Josh's approved corrections of 2026-10-02 are applied to the listed dates, each
carrying a `curator_correction` object (previous decision + reason) and, where he approved alternates, `approved_alternates`.
"""
import json, sys
src, kd_path, out = sys.argv[1:4]
exp = json.load(open(src)); dec = exp['decisions']
kd = json.load(open(kd_path))
cands = {}
for m, v in kd.items():
    for d, rows in v['days'].items(): cands[d] = rows
NOW = '2026-10-02T00:00:00.000Z'
# date: (selected candidate or None to keep, approved alternates, reason)
CHANGES = {
 '05-03': ('Elisabeth Cruciger', [], 'Elisabeth Cruciger is printed on 3 May in LFF 2024. The earlier selection (Huntington) was an erroneous duplicate of the 25 November primary.'),
 '05-09': ('Gregory of Nazianzus', [], 'Gregory of Nazianzus is printed on 9 May in LFF, HWHM and GCW; an intentional additional observance beside the joint 2 January commemoration. Zinzendorf moves to 10 May.'),
 '05-10': ('Nicolaus Ludwig von Zinzendorf', ['Comgall of Bangor'], 'Zinzendorf is printed on 10 May (HWHM, GCW, Anglican Martyrology). Comgall of Bangor, the previous primary, is retained as an alternate.'),
 '08-09': (None, ['Mary Sumner'], 'Edith Stein (LFF) retained; Mary Sumner added as an alternate on her verified 9 August date (Anglican Martyrology).'),
 '08-19': ('John Eudes', [], 'Mary Sumner removed from 19 August (moved to 9 August); John Eudes (Anglican Martyrology, 19 August) approved as primary.'),
 '11-24': (None, ['Lucy Menzies'], 'Catherine, Barbara and Margaret retained; Lucy Menzies (SEC calendar and Anglican Martyrology, 24 November) retained as an alternate.'),
 '12-11': ('Frederick Howden Jr.', [], 'Frederick Howden Jr. is printed on 11 December in LFF 2024. Lucy Menzies removed from 11 December (she is the 24 November alternate).'),
 '12-18': (None, [], "Charles Wesley retained as the curator's deliberate birthday observance (born 18 December 1707). The received joint commemoration with John remains on 3 March; LFF/HWHM/GCW do not print a 18 December feast."),
 '12-29': ('Thomas Becket', [], 'The unsupported "David of London" (UO-SIN-000610, retired) is replaced by Thomas Becket (LFF, HWHM, GCW).'),
}
RENAMES = {'Ammonius and Companions': 'Ammon and Companions'}   # 12-20: label reconciled with the attested group
changed = []
for k in sorted(dec):
    r = dec[k]
    sel = RENAMES.get(r['selected_candidate'], r['selected_candidate'])
    corr = None
    if k in CHANGES:
        new, alts, why = CHANGES[k]
        corr = {'date': k, 'previous_selected': r['selected_candidate'], 'previous_sin': r['selected_sin'], 'reason': why, 'authority': 'Josh Jeffery, approved corrections of 2026-10-02'}
        if new: sel = new
        if alts: r['approved_alternates'] = alts
    row = [c for c in cands[k] if c['candidate'] == sel]
    assert len(row) == 1, (k, sel, [c['candidate'] for c in cands[k]])
    row = row[0]
    r['selected_candidate'] = sel; r['selected_sin'] = row['sin']['sin']
    r['original_candidate_row'] = row
    idx = int(row['rank']) - 1
    r['_internal_chosen_key'] = f'{idx}:{sel}'
    if corr:
        r['decision_type'] = 'concur_rank1' if row['rank'] == '1' else 'select_alternate'
        r['timestamp'] = NOW
        r['curator_correction'] = corr
        if r.get('reviewer_comments'): r['previous_reviewer_comments'] = r['reviewer_comments']   # the comment belonged to the superseded selection
        r['reviewer_comments'] = 'Curatorial correction 2026-10-02: ' + corr['reason']
        changed.append(k)
exp['exported_at'] = NOW
exp['correction_note'] = ('Corrected 2026-10-02 per the curator\'s approved corrections (documentation/ANGLICAN_SYNAXARIUM_CORRECTION_PROPOSAL.md). '
                          'Dates changed: ' + ', '.join(changed) + '. Retired SINs: UO-SIN-000999 (duplicate Huntington), UO-SIN-000610 (David of London).')
exp['retired_sins'] = ['UO-SIN-000999', 'UO-SIN-000610']
json.dump(exp, open(out, 'w'), ensure_ascii=False, indent=1)
print('records', len(dec), 'corrected dates', changed)
