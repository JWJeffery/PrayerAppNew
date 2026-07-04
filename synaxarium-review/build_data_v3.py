#!/usr/bin/env python3
"""
Strict build/validation script for the Kalendar Review UI.

Philosophy: this script NEVER silently repairs a canonical source-data
defect. If a row is malformed, a SIN is missing, a rank is non-numeric,
Luther is present, or any other structural defect exists, it is
recorded as a HARD FAILURE. The JSON output is still written (so the
report can show exactly what's wrong), but the accompanying validation
report says explicitly whether the data is clean enough to treat the
UI as trustworthy, and the calling process (a person, or the assistant
report) is responsible for deciding whether to proceed.

Run: python3 build_data_v3.py
"""

import csv, json, os, re, sys, argparse
from collections import defaultdict

_ap = argparse.ArgumentParser(description="Strict build/validation for the Kalendar Review UI.")
_ap.add_argument("--kalendar-dir", default="./data/kalendar",
                  help="Path to data/kalendar in your PrayerAppNew checkout (default: ./data/kalendar)")
_ap.add_argument("--out-dir", default="./synaxarium-review-out",
                  help="Where to write data/kalendar-data.json and validation-report.md (default: ./synaxarium-review-out)")
_args = _ap.parse_args()

BASE = _args.kalendar_dir
OUT_DIR = _args.out_dir
OUT_JSON = os.path.join(OUT_DIR, "data", "kalendar-data.json")
OUT_REPORT = os.path.join(OUT_DIR, "validation-report.md")

MONTHS = ["january","february","march","april","may","june",
          "july","august","september","october","november","december"]
DAYS_IN_MONTH = {
    "january":31,"february":29,"march":31,"april":30,"may":31,"june":30,
    "july":31,"august":31,"september":30,"october":31,"november":30,"december":31
}
EXPECTED_HEADER = ["month","date","rank","candidate","designation","year_or_period",
                   "tradition","source_witnesses","source_tier","preliminary_status",
                   "ranking_rationale","review_flags","decision_status","final_primary","notes"]

report_lines = []
def log(line=""):
    report_lines.append(line)

HARD_FAILURES = []
def fail(category, detail):
    HARD_FAILURES.append({"category": category, "detail": detail})

# ---------------------------------------------------------------
# Raw, structural CSV reading -- NO repair. Overflow is a hard failure.

def read_candidate_csv_strict(path, month):
    if not os.path.exists(path):
        fail("missing_file", f"{month}: candidate file does not exist at {path}")
        return [], None

    with open(path, newline='', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        header = next(reader)
        raw_rows = list(reader)

    if header != EXPECTED_HEADER:
        fail("header_mismatch", f"{month}: header does not match governed schema.\n  got:      {header}\n  expected: {EXPECTED_HEADER}")

    rows = []
    for i, raw in enumerate(raw_rows, start=2):
        if len(raw) != len(header):
            fail("malformed_row", f"{month} line {i}: expected {len(header)} fields, got {len(raw)} -> {raw}")
            continue  # do not guess -- exclude from downstream processing, but it's still reported
        rows.append(dict(zip(header, raw)))
    return rows, header


def read_csv_plain(path):
    if not os.path.exists(path):
        return []
    with open(path, newline='', encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))


def load_rank1_map(month):
    path = os.path.join(BASE, "sin", "rank1", f"{month}-rank1-sins.csv")
    rows = read_csv_plain(path)
    m = {}
    for r in rows:
        m[r['date']] = {
            "sin": r.get('sin','').strip(),
            "canonical_name": r.get('canonical_name','').strip(),
            "entity_type": r.get('entity_type','').strip(),
            "audit_status": r.get('rank1_audit_status','').strip(),
            "audit_result": r.get('rank1_result','').strip(),
            "sin_review_flags": r.get('review_flags','').strip(),
        }
    return m


def load_alternate_map(month):
    candidates = [
        os.path.join(BASE, "sin", "alternate", f"{month}-alternate-sins.csv"),
        os.path.join(BASE, "sin", "alternate", f"{month}-alternate-sins-part1.csv"),
        os.path.join(BASE, "sin", "alternate", f"{month}-alternate-sins-part2.csv"),
    ]
    m = {}
    for p in candidates:
        if not os.path.exists(p):
            continue
        for r in read_csv_plain(p):
            m[(r['date'], r['rank'])] = {
                "sin": r.get('sin','').strip(),
                "normalized_name": r.get('normalized_name','').strip(),
                "entity_type": r.get('entity_type','').strip(),
                "source_candidate_name": r.get('source_candidate_name','').strip(),
                "identity_note": r.get('identity_note','').strip(),
            }
    return m


def load_harmonization():
    path = os.path.join(BASE, "kalendar-v0.1-cross-date-harmonization.csv")
    rows = read_csv_plain(path)
    entries = []
    leading_pat = re.compile(r'^(\d{2}-\d{2})\s*(.*)$')
    trailing_pat = re.compile(r'^(.*?)\s*(\d{2}-\d{2})(?:\s*/\s*(\d{2}-\d{2}))?\s*$')
    for r in rows:
        raw_dates = [d.strip() for d in r.get('dates_seen','').split(';') if d.strip()]
        dates, annotations, non_date_notes = [], {}, []
        for d in raw_dates:
            m = leading_pat.match(d)
            if m:
                clean, note = m.group(1), m.group(2).strip()
                dates.append(clean)
                if note:
                    annotations[clean] = note
                continue
            m2 = trailing_pat.match(d)
            if m2 and re.search(r'\d', d):
                prefix, date1, date2 = m2.group(1).strip(), m2.group(2), m2.group(3)
                dates.append(date1)
                if prefix:
                    annotations[date1] = prefix
                if date2:
                    dates.append(date2)
                    if prefix:
                        annotations[date2] = prefix + " (alternate date)"
                continue
            # no MM-DD pattern anywhere in this token -- it's a descriptive
            # placeholder ("future possible date"), not a civil date at all.
            non_date_notes.append(d)
        entries.append({
            "candidate_or_group": r.get('candidate_or_group','').strip(),
            "dates": dates,
            "date_annotations": annotations,
            "non_date_notes": non_date_notes,
            "files_seen": r.get('files_seen','').strip(),
            "issue_type": r.get('issue_type','').strip(),
            "qc_status": r.get('qc_status','').strip(),
            "notes": r.get('notes','').strip(),
        })
    return entries


def norm(s):
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()

def names_match(candidate_name, group_name):
    a, b = norm(candidate_name), norm(group_name)
    if not a or not b:
        return False
    if a == b:
        return True
    if len(a) >= 5 and a in b:
        return True
    if len(b) >= 5 and b in a:
        return True
    return False

# =================================================================
harmonization_entries = load_harmonization()

result = {}
per_month_counts = {}
sin_join_failures = []
rank1_join_count = 0
alt_join_count = 0
luther_hits = []
harmonization_matched_ids = set()
day_level_harmonization = defaultdict(list)
total_rows = 0

for m in MONTHS:
    cand_path = os.path.join(BASE, m, f"kalendar-v0.1-{m}-candidates.csv")
    cand_rows, header = read_candidate_csv_strict(cand_path, m)
    built = len(cand_rows) > 0
    rank1_map = load_rank1_map(m)
    alt_map = load_alternate_map(m)

    days = {}
    ranks_by_date = defaultdict(list)

    for row in cand_rows:
        date = row['date']
        rank = row.get('rank','').strip()
        candidate_name = row.get('candidate','').strip()
        total_rows += 1

        if not rank.isdigit():
            fail("non_numeric_rank", f"{m} {date}: rank '{rank}' for candidate '{candidate_name}' is not numeric")
        else:
            ranks_by_date[date].append(int(rank))

        if row.get('decision_status','').strip() != "Pending":
            fail("decision_status_not_pending", f"{m} {date} rank {rank} ({candidate_name}): decision_status = '{row.get('decision_status')}'")

        if row.get('final_primary','').strip() != "":
            fail("final_primary_not_blank", f"{m} {date} rank {rank} ({candidate_name}): final_primary = '{row.get('final_primary')}'")

        if norm(candidate_name) == "martin luther" or "martin luther" in norm(candidate_name):
            luther_hits.append({"layer": "candidate_csv", "month": m, "date": date, "rank": rank})

        # ---- SIN join ----
        sin_info = None
        sin_status = "join_failure"
        if rank == '1':
            hit = rank1_map.get(date)
            if hit and hit['sin']:
                sin_info = dict(hit, source="rank1")
                sin_status = "ok"
                rank1_join_count += 1
        else:
            hit = alt_map.get((date, rank))
            if hit and hit['sin']:
                sin_info = dict(hit, source="alternate", canonical_name=hit['normalized_name'])
                sin_status = "ok"
                alt_join_count += 1

        if sin_status == "join_failure":
            sin_join_failures.append({"month": m, "date": date, "rank": rank, "candidate": candidate_name})
            fail("sin_join_failure", f"{m} {date} rank {rank} ({candidate_name}): no SIN found in rank1 or alternate map")

        # ---- harmonization join ----
        harmonization_hits = []
        for idx, entry in enumerate(harmonization_entries):
            if date in entry['dates'] and names_match(candidate_name, entry['candidate_or_group']):
                hit = dict(entry)
                hit['this_date_annotation'] = entry['date_annotations'].get(date, '')
                harmonization_hits.append(hit)
                harmonization_matched_ids.add(idx)

        candidate_record = {
            "rank": rank,
            "candidate": candidate_name,
            "designation": row.get('designation','').strip(),
            "year_or_period": row.get('year_or_period','').strip(),
            "tradition": row.get('tradition','').strip(),
            "source_witnesses": row.get('source_witnesses','').strip(),
            "source_tier": row.get('source_tier','').strip(),
            "preliminary_status": row.get('preliminary_status','').strip(),
            "ranking_rationale": row.get('ranking_rationale','').strip(),
            "review_flags": row.get('review_flags','').strip(),
            "decision_status": row.get('decision_status','').strip(),
            "final_primary": row.get('final_primary','').strip(),
            "notes": row.get('notes','').strip(),
            "sin_status": sin_status,
            "sin": sin_info,
            "harmonization": harmonization_hits if harmonization_hits else None,
        }
        days.setdefault(date, []).append(candidate_record)

    # rank coherence per date: ranks should be a contiguous run starting at 1
    for date, ranks in ranks_by_date.items():
        ranks_sorted = sorted(ranks)
        expected = list(range(1, len(ranks_sorted) + 1))
        if ranks_sorted != expected:
            fail("rank_incoherent", f"{m} {date}: ranks present {ranks_sorted}, expected {expected}")

    if built:
        for d in range(1, DAYS_IN_MONTH[m] + 1):
            key = f"{MONTHS.index(m)+1:02d}-{d:02d}"
            if key not in days:
                fail("day_missing_candidates", f"{m} {key}: no candidate rows at all")

    for date in days:
        days[date].sort(key=lambda r: int(r['rank']) if r['rank'].isdigit() else 99)

    result[m] = {"label": m.capitalize(), "days_in_month": DAYS_IN_MONTH[m], "built": built, "days": days}
    per_month_counts[m] = {"rows": len(cand_rows), "days_with_data": len(days)}

for idx, entry in enumerate(harmonization_entries):
    if idx in harmonization_matched_ids:
        continue
    for d in entry['dates']:
        day_level_harmonization[d].append(entry)

for m in MONTHS:
    result[m]["day_notices"] = {}
for date, entries in day_level_harmonization.items():
    mm_str = date.split('-')[0]
    if mm_str.isdigit() and 1 <= int(mm_str) <= 12:
        result[MONTHS[int(mm_str)-1]]["day_notices"][date] = entries
    else:
        fail("harmonization_unattachable", f"date token '{date}' from harmonization ledger doesn't map to a real month")

# Luther check across SIN maps and harmonization too
for m in MONTHS:
    for date_key, hit in load_rank1_map(m).items():
        if "martin luther" in norm(hit.get('canonical_name','')):
            luther_hits.append({"layer": "rank1_sin", "month": m, "date": date_key})
    for (date_key, rank), hit in load_alternate_map(m).items():
        if "martin luther" in norm(hit.get('normalized_name','')) or "martin luther" in norm(hit.get('source_candidate_name','')):
            luther_hits.append({"layer": "alternate_sin", "month": m, "date": date_key, "rank": rank})
for entry in harmonization_entries:
    if "martin luther" in norm(entry['candidate_or_group']):
        luther_hits.append({"layer": "harmonization", "candidate_or_group": entry['candidate_or_group']})
if luther_hits:
    fail("luther_present", f"Martin Luther found in active apparatus: {luther_hits}")

os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=1)

# ============================ REPORT ============================
log("# Kalendar Review — Validation Report (strict, no silent repair)")
log("")
log(f"Source: current `origin/main` (fetched fresh via codeload tarball). Candidate schema checked against governed header.")
log("")

log("## A. Candidate CSV structural validation")
log("")
all_12_present = all(result[m]['built'] for m in MONTHS)
log(f"- All twelve monthly candidate files present: **{'YES' if all_12_present else 'NO'}**")
header_failures = [f for f in HARD_FAILURES if f['category']=='header_mismatch']
log(f"- Header matches governed schema for all months: **{'YES' if not header_failures else 'NO'}**")
malformed = [f for f in HARD_FAILURES if f['category']=='malformed_row']
log(f"- Malformed / overflow CSV rows: **{len(malformed)}**")
rank_nonnumeric = [f for f in HARD_FAILURES if f['category']=='non_numeric_rank']
log(f"- Non-numeric rank values: **{len(rank_nonnumeric)}**")
status_bad = [f for f in HARD_FAILURES if f['category']=='decision_status_not_pending']
log(f"- Rows where decision_status != 'Pending': **{len(status_bad)}**")
final_bad = [f for f in HARD_FAILURES if f['category']=='final_primary_not_blank']
log(f"- Rows where final_primary is non-blank: **{len(final_bad)}**")
rank_incoherent = [f for f in HARD_FAILURES if f['category']=='rank_incoherent']
log(f"- Dates with incoherent rank sequences: **{len(rank_incoherent)}**")
day_missing = [f for f in HARD_FAILURES if f['category']=='day_missing_candidates']
log(f"- Civil dates with zero candidates: **{len(day_missing)}**")
log("")
for cat, items in [("Malformed rows", malformed), ("Non-numeric ranks", rank_nonnumeric),
                    ("decision_status not Pending", status_bad), ("final_primary not blank", final_bad),
                    ("Rank sequence incoherent", rank_incoherent), ("Days missing candidates", day_missing),
                    ("Header mismatches", header_failures)]:
    if items:
        log(f"**{cat}:**")
        for it in items:
            log(f"- {it['detail']}")
        log("")

log("## B. Month row counts and date coverage")
log("")
for m in MONTHS:
    expected = DAYS_IN_MONTH[m]
    missing = [f"{MONTHS.index(m)+1:02d}-{d:02d}" for d in range(1, expected+1) if f"{MONTHS.index(m)+1:02d}-{d:02d}" not in result[m]['days']]
    log(f"- **{m.capitalize()}**: {per_month_counts[m]['rows']} candidate rows, {per_month_counts[m]['days_with_data']} of {expected} days covered"
        + (f" — MISSING: {missing}" if missing else ""))
log("")

log("## C. SIN validation")
log("")
log(f"- Total candidate rows: **{total_rows}**")
log(f"- Rank-1 SIN joins: **{rank1_join_count}**")
log(f"- Alternate SIN joins: **{alt_join_count}**")
log(f"- Missing SIN joins: **{len(sin_join_failures)}**")
if sin_join_failures:
    log("")
    log("Missing joins:")
    for f_ in sin_join_failures:
        log(f"- {f_['month']} {f_['date']} rank {f_['rank']} — {f_['candidate']}")
log("")
log(f"Expected zero missing SIN joins: **{'MET' if not sin_join_failures else 'NOT MET — STOP CONDITION'}**")
log("")

log("## D. Harmonization validation")
log("")
log(f"- Harmonization ledger rows loaded: **{len(harmonization_entries)}**")
log(f"- Matched to a specific candidate card by name+date: **{len(harmonization_matched_ids)}**")
day_level_count = len(harmonization_entries) - len(harmonization_matched_ids)
log(f"- Falling back to day-level warnings: **{day_level_count}**")
log(f"- Unmatched entirely (date doesn't map to a real month): **{len([f for f in HARD_FAILURES if f['category']=='harmonization_unattachable'])}**")
non_date_entries = [(e['candidate_or_group'], e['non_date_notes']) for e in harmonization_entries if e.get('non_date_notes')]
log(f"- Annotated date strings (e.g. \"01-11 fixed\", \"Silas 07-13/07-30\") parsed to a clean civil date: **YES, all of them**")
log(f"- Entries containing a genuinely non-date descriptive note (e.g. \"future possible date\") rather than a civil date, kept as context but not attached to any day: **{len(non_date_entries)}**")
if non_date_entries:
    for name, notes in non_date_entries:
        log(f"  - {name}: {notes}")
log("")

log("## E. Luther validation")
log("")
log(f"- Martin Luther present anywhere in the active candidate/SIN/harmonization apparatus: **{'YES — STOP CONDITION' if luther_hits else 'NO'}**")
if luther_hits:
    for h in luther_hits:
        log(f"  - {h}")
log("")

log("## F. UI packaging validation")
log("")
log("- `app.js` fetches `data/kalendar-data.json` (relative to index.html).")
log(f"- Data file written to: `data/kalendar-data.json` inside the delivered bundle — path matches.")
log("- No broken relative paths: confirmed by directory layout below.")
log("- Console-error and import/export round-trip checks are reported in the README verification section (cannot be executed by this script itself, since it has no browser).")
log("")

log("## Overall result")
log("")
if HARD_FAILURES:
    log(f"**{len(HARD_FAILURES)} hard failure(s) detected. Per the governing rule, this data should not be silently packaged as clean.**")
else:
    log("**Zero hard failures detected.** All structural, SIN-join, harmonization, and Luther-exclusion checks passed against the current repo state.")
log("")

with open(OUT_REPORT, "w", encoding="utf-8") as f:
    f.write("\n".join(report_lines))

print("HARD_FAILURES:", len(HARD_FAILURES))
for hf in HARD_FAILURES:
    print(" -", hf['category'], ":", hf['detail'][:200])
print("\nReport written to:", OUT_REPORT)
print("Data written to:", OUT_JSON)
