#!/usr/bin/env python3
"""
Build a research queue of all unresolved Menaion troparion entries.

Scans:
    data/menaion/*.json

Outputs:
    data/menaion/research-queue.json

Rules:
- Skip schema.json
- Skip non-month JSON files
- Collect only commemorations with troparion_status == "text-unavailable"
- Preserve enough metadata to research efficiently
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List


ROOT = Path(__file__).resolve().parent
MENAION_DIR = ROOT / "data" / "menaion"
OUTPUT_FILE = MENAION_DIR / "research-queue.json"


def load_json(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def is_month_file(data: Dict[str, Any]) -> bool:
    meta = data.get("_meta", {})
    return isinstance(meta, dict) and "month_number" in meta and "dates" in data


def month_sort_key(item: Dict[str, Any]) -> tuple:
    date = item["date"]
    month, day = date.split("-")
    return int(month), int(day), item["name"]


def priority_for_entry(entry: Dict[str, Any]) -> str:
    rank = entry.get("rank")
    saint_type = entry.get("type", "")
    tags = set(entry.get("tradition_tags", []))

    if rank in (1, 2, 3):
        return "high"

    if saint_type in {"apostle", "hierarch", "marian_feast", "feast"}:
        return "high"

    if "ANG" in tags or "LAT" in tags:
        return "medium"

    if saint_type in {"martyr", "monastic"}:
        return "medium"

    return "low"


def research_bucket(entry: Dict[str, Any]) -> str:
    saint_type = entry.get("type", "")

    if saint_type in {"apostle"}:
        return "apostles"
    if saint_type in {"hierarch"}:
        return "hierarchs"
    if saint_type in {"martyr"}:
        return "martyrs"
    if saint_type in {"monastic"}:
        return "monastics"
    if saint_type in {"feast", "marian_feast"}:
        return "major-feasts"
    return "other"


def build_queue() -> List[Dict[str, Any]]:
    queue: List[Dict[str, Any]] = []

    for path in sorted(MENAION_DIR.glob("*.json")):
        if path.name in {"schema.json", "research-queue.json"}:
            continue

        data = load_json(path)
        if not is_month_file(data):
            continue

        meta = data["_meta"]
        month_name = meta.get("month_name")
        dates = data.get("dates", {})

        for date_key, date_entry in dates.items():
            commemorations = date_entry.get("commemorations", [])
            for comm in commemorations:
                if comm.get("troparion_status") != "text-unavailable":
                    continue

                row = {
                    "date": date_key,
                    "month": month_name,
                    "source_file": str(path.relative_to(ROOT)).replace("\\", "/"),
                    "id": comm.get("id"),
                    "name": comm.get("name"),
                    "type": comm.get("type"),
                    "rank": comm.get("rank"),
                    "troparion_tone": comm.get("troparion_tone"),
                    "tradition_tags": comm.get("tradition_tags", []),
                    "notes": comm.get("notes"),
                    "priority": "",          # filled below
                    "research_bucket": "",   # filled below
                    "verdict": "",           # leave blank for research pass
                    "verified_tone": None,   # leave blank for research pass
                    "source_witness": "",    # leave blank for research pass
                    "action": ""             # leave blank for research pass
                }

                row["priority"] = priority_for_entry(row)
                row["research_bucket"] = research_bucket(row)
                queue.append(row)

    queue.sort(key=month_sort_key)
    return queue


def main() -> None:
    queue = build_queue()

    payload = {
        "_meta": {
            "file": "data/menaion/research-queue.json",
            "description": "Queue of unresolved Menaion troparion entries requiring source research.",
            "generated_from": "data/menaion/*.json",
            "entry_count": len(queue)
        },
        "entries": queue
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(queue)} unresolved entries to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()