#!/usr/bin/env python3
"""
Merge confirmed Kalendar Review decisions back into the monthly candidate
CSVs, setting decision_status and final_primary on the matching row.

This is a separate, manually-run tool. The static review UI never
touches the source CSVs — this is the documented pathway for turning a
reviewed decisions export into updated source data, run by a person
(Josh or Lucy), reviewed via normal git diff/PR before it's trusted.

USAGE
-----
    python3 merge_decisions_into_csv.py \\
        --decisions synaxarium-decisions-2026-07-04.json \\
        --kalendar-dir /path/to/PrayerAppNew/data/kalendar \\
        --out-dir /path/to/merged_output \\
        [--only-status Decided]

By default this WRITES NOTHING to your real repo: it writes updated
copies of the affected monthly CSVs into --out-dir, so you can diff
them against the originals before committing anything. Pass --in-place
only once you're confident, and only after reviewing the diff.

WHAT IT DOES, PER DAY
----------------------
For each date in the decisions export with a non-null selected_candidate:
  - decision_type == 'concur_rank1' or 'select_alternate':
      finds the candidate row in that month's CSV whose `rank` matches
      the rank recorded in `original_candidate_row`, sets
      decision_status = "Decided", final_primary = selected_candidate
      on that row, and leaves every other row for that date untouched
      (their decision_status stays "Pending" — they were considered
      and not chosen, not un-reviewed).
  - decision_type == 'custom' ("none of the above"):
      does NOT modify any existing row (there is no row to mark,
      since the reviewer chose something not in the candidate list).
      Instead these are collected into a separate report
      (custom-decisions-needing-manual-entry.md) in --out-dir, since
      adding a brand-new candidate row is a content decision, not a
      mechanical merge, and this script deliberately does not
      fabricate liturgical text or rows on its own.

WHAT IT NEVER DOES
-------------------
  - Never invents, guesses, or fabricates a candidate row.
  - Never changes rank, candidate name, tradition, or any other
    descriptive column — only decision_status and final_primary.
  - Never writes to the original CSV path unless --in-place is passed
    explicitly, and even then only after the same day/rank match logic.
"""

import argparse, csv, json, os, sys


def load_decisions(path):
    with open(path, encoding="utf-8") as f:
        payload = json.load(f)
    return payload.get("decisions", payload)


def month_of(date_key):
    mm = int(date_key.split("-")[0])
    return ["january","february","march","april","may","june",
            "july","august","september","october","november","december"][mm - 1]


def merge_month(month, decisions_for_month, kalendar_dir, out_dir, in_place):
    src_path = os.path.join(kalendar_dir, month, f"kalendar-v0.1-{month}-candidates.csv")
    if not os.path.exists(src_path):
        print(f"  [skip] no candidate file for {month}")
        return [], []

    with open(src_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    applied, skipped_custom = [], []

    for date_key, entry in decisions_for_month.items():
        selected = entry.get("selected_candidate")
        if not selected:
            continue
        decision_type = entry.get("decision_type")

        if decision_type == "custom":
            skipped_custom.append({"date": date_key, "selected_candidate": selected,
                                    "reviewer_comments": entry.get("reviewer_comments", "")})
            continue

        original_row = entry.get("original_candidate_row") or {}
        target_rank = original_row.get("rank")
        matched = False
        for row in rows:
            if row.get("date") == date_key and row.get("rank") == target_rank:
                row["decision_status"] = "Decided"
                row["final_primary"] = selected
                matched = True
                applied.append({"date": date_key, "rank": target_rank, "candidate": selected})
                break
        if not matched:
            skipped_custom.append({"date": date_key, "selected_candidate": selected,
                                    "reviewer_comments": "NO MATCHING ROW FOUND — needs manual check"})

    if applied:
        out_path = src_path if in_place else os.path.join(out_dir, month, os.path.basename(src_path))
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        print(f"  [{month}] wrote {out_path} — {len(applied)} row(s) updated")

    return applied, skipped_custom


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--decisions", required=True, help="Path to an exported decisions JSON file")
    ap.add_argument("--kalendar-dir", required=True, help="Path to data/kalendar in the repo")
    ap.add_argument("--out-dir", default="./merged_output", help="Where to write updated CSV copies (default: ./merged_output)")
    ap.add_argument("--in-place", action="store_true", help="Write directly back into --kalendar-dir instead of --out-dir. Use with care, after reviewing a dry run.")
    args = ap.parse_args()

    decisions = load_decisions(args.decisions)
    by_month = {}
    for date_key, entry in decisions.items():
        m = month_of(date_key)
        by_month.setdefault(m, {})[date_key] = entry

    all_applied, all_skipped = [], []
    for month, entries in sorted(by_month.items()):
        applied, skipped = merge_month(month, entries, args.kalendar_dir, args.out_dir, args.in_place)
        all_applied.extend(applied)
        all_skipped.extend(skipped)

    os.makedirs(args.out_dir, exist_ok=True)
    if all_skipped:
        report_path = os.path.join(args.out_dir, "custom-decisions-needing-manual-entry.md")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("# Decisions not mechanically merged\n\n")
            f.write("These need a person to add or fix a row by hand — nothing was fabricated.\n\n")
            for item in all_skipped:
                f.write(f"- **{item['date']}** — \"{item['selected_candidate']}\" — {item.get('reviewer_comments','')}\n")
        print(f"\n{len(all_skipped)} decision(s) need manual attention — see {report_path}")

    print(f"\nTotal rows mechanically updated: {len(all_applied)}")
    if not args.in_place:
        print(f"Nothing in the original repo was touched. Review the files in {args.out_dir} and diff them yourself before committing.")


if __name__ == "__main__":
    main()
