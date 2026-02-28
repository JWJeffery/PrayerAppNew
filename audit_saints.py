#!/usr/bin/env python3
"""
audit_saints.py
===============
Reads the migrated saints files and produces a CSV listing every record
that needs human review — i.e. any record where:
  - tags is empty, OR
  - verification_status is "provisional"

Run AFTER migrate_saints.py.

Usage:
    python3 audit_saints.py

Outputs:
    data/saints/saints_audit.csv   — spreadsheet-friendly review list
    data/saints/saints_audit.json  — machine-readable version
"""

import json
import csv
from pathlib import Path

SAINTS_DIR = Path("data/saints")
MONTHS = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
]

VALID_TAGS = {"ANG", "LAT", "EOR", "OOR", "COE"}

def main():
    needs_review = []

    for month in MONTHS:
        filepath = SAINTS_DIR / f"saints-{month}.json"
        if not filepath.exists():
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            saints = json.load(f)

        for s in saints:
            tags = s.get('tags', [])
            status = s.get('verification_status', 'provisional')
            reason = None

            if not tags:
                reason = "no tags"
            elif status == 'provisional':
                reason = "provisional"

            if reason:
                needs_review.append({
                    "month":       month,
                    "day":         s.get('day', ''),
                    "id":          s.get('id', ''),
                    "name":        s.get('name', ''),
                    "type":        s.get('type', ''),
                    "current_tags": ','.join(sorted(tags)) if tags else '',
                    "reason":      reason,
                    "notes":       s.get('notes', ''),
                    "description": s.get('description', ''),
                    # Leave blank for researcher to fill in
                    "proposed_tags": '',
                    "proposed_type": '',
                })

    # Write CSV
    csv_path = SAINTS_DIR / "saints_audit.csv"
    fieldnames = [
        "month", "day", "name", "type", "current_tags",
        "reason", "proposed_tags", "proposed_type", "notes", "description", "id"
    ]
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(needs_review)

    # Write JSON
    json_path = SAINTS_DIR / "saints_audit.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(needs_review, f, indent=2, ensure_ascii=False)

    print(f"Records needing review: {len(needs_review)}")
    print(f"  CSV:  {csv_path}")
    print(f"  JSON: {json_path}")
    print()

    # Summary by reason
    from collections import Counter
    reasons = Counter(r['reason'] for r in needs_review)
    print("Breakdown:")
    for reason, count in sorted(reasons.items()):
        print(f"  {reason}: {count}")


if __name__ == '__main__':
    main()