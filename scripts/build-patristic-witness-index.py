#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tomllib
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SOURCE_REPO_URL = "https://github.com/HistoricalChristianFaith/Commentaries-Database.git"
SOURCE_BRANCH = "master"
SOURCE_DIR = ROOT / ".external" / "commentaries-database"
POLICY_PATH = ROOT / "data" / "commentary" / "patristic-witness-author-policy.json"
OUT_DIR = ROOT / ".external" / "generated" / "patristic-witness"
BOOKS_DIR = OUT_DIR / "books"
SUMMARY_PATH = ROOT / "documentation" / "patristic-witness-intake-summary.json"

UNKNOWN_YEAR_SENTINELS = {9999, 9999999, 999999, 0}


def run(cmd: list[str], cwd: Path | None = None) -> str:
    result = subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )
    return result.stdout.strip()


def ensure_source_repo(refresh: bool) -> str:
    if SOURCE_DIR.exists() and (SOURCE_DIR / ".git").exists():
        if refresh:
            run(["git", "fetch", "--depth", "1", "origin", SOURCE_BRANCH], cwd=SOURCE_DIR)
            run(["git", "checkout", "-f", "FETCH_HEAD"], cwd=SOURCE_DIR)
    else:
        SOURCE_DIR.parent.mkdir(parents=True, exist_ok=True)
        if SOURCE_DIR.exists():
            shutil.rmtree(SOURCE_DIR)
        run(["git", "clone", "--depth", "1", "--branch", SOURCE_BRANCH, SOURCE_REPO_URL, str(SOURCE_DIR)])
    return run(["git", "rev-parse", "HEAD"], cwd=SOURCE_DIR)


def load_toml(path: Path) -> dict[str, Any]:
    with path.open("rb") as handle:
        return tomllib.load(handle)


def to_int(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def meaningful_year(value: Any) -> int | None:
    year = to_int(value)
    if year is None or year in UNKNOWN_YEAR_SENTINELS:
        return None
    return year


def normalize_book_key(book_name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", book_name.lower())


def parse_verse_range(token: str) -> tuple[int, int, int, int]:
    pieces = re.split(r"[_-]", token)
    if len(pieces) == 2:
        start_chapter, start_verse = pieces
        end_chapter, end_verse = start_chapter, start_verse
    elif len(pieces) == 3:
        start_chapter, start_verse, end_verse = pieces
        end_chapter = start_chapter
    elif len(pieces) == 4:
        start_chapter, start_verse, end_chapter, end_verse = pieces
    else:
        raise ValueError(f"Unexpected verse range token: {token}")

    return int(start_chapter), int(start_verse), int(end_chapter), int(end_verse)


def encode_location(chapter: int, verse: int) -> int:
    return chapter * 1_000_000 + verse


def format_range_label(book_name: str, start_chapter: int, start_verse: int, end_chapter: int, end_verse: int) -> str:
    if start_chapter == end_chapter and start_verse == end_verse:
        return f"{book_name} {start_chapter}:{start_verse}"
    if start_chapter == end_chapter:
        return f"{book_name} {start_chapter}:{start_verse}-{end_verse}"
    return f"{book_name} {start_chapter}:{start_verse}-{end_chapter}:{end_verse}"


def load_policy() -> dict[str, Any]:
    return json.loads(POLICY_PATH.read_text(encoding="utf-8"))


def collect_author_metadata() -> dict[str, dict[str, Any]]:
    metadata: dict[str, dict[str, Any]] = {}
    for path in sorted(SOURCE_DIR.glob("*/metadata.toml")):
        try:
            data = load_toml(path)
        except Exception as error:
            metadata[path.parent.name] = {
                "default_year": None,
                "wiki": "",
                "metadata_error": str(error),
            }
            continue

        metadata[path.parent.name] = {
            "default_year": to_int(data.get("default_year")),
            "wiki": str(data.get("wiki", "")),
        }
    return metadata


def classify_author(author: str, year: int | None, policy: dict[str, Any]) -> dict[str, Any]:
    overrides = policy.get("authorOverrides", {})
    if author in overrides:
        override = overrides[author]
        return {
            "status": "include" if override.get("include") else "exclude",
            "classification": override.get("classification", "manual"),
            "reason": override.get("reason", "author policy override"),
            "source": "authorOverride",
        }

    lowered = author.lower()
    for keyword in policy.get("protestantAuthorNameKeywords", []):
        if keyword.lower() in lowered:
            return {
                "status": "exclude",
                "classification": "post-reformation-protestant",
                "reason": f"matched Protestant author keyword: {keyword}",
                "source": "protestantAuthorNameKeywords",
            }

    max_year = int(policy["filterPolicy"]["defaultIncludeMaxYearInclusive"])
    if year is not None and year <= max_year:
        return {
            "status": "include",
            "classification": "pre-reformation-catholic-orthodox-or-patristic",
            "reason": f"default/effective year {year} is <= {max_year}",
            "source": "yearCutoff",
        }

    if year is not None and year > max_year:
        return {
            "status": "exclude",
            "classification": "post-reformation",
            "reason": f"default/effective year {year} is > {max_year}",
            "source": "yearCutoff",
        }

    return {
        "status": "review",
        "classification": "unknown-date-review-required",
        "reason": "no reliable default/effective year; excluded pending review",
        "source": "unknownYearPolicy",
    }


def parse_commentary_file(path: Path) -> tuple[str, str, tuple[int, int, int, int]]:
    stem = path.stem
    pieces = stem.split(" ")
    if len(pieces) < 2:
        raise ValueError(f"Unexpected commentary filename: {path.relative_to(SOURCE_DIR)}")
    book_name = " ".join(pieces[:-1])
    verse_range = parse_verse_range(pieces[-1])
    return book_name, normalize_book_key(book_name), verse_range


def stable_id(relative_path: str, index: int, quote: str) -> str:
    digest = hashlib.sha256(f"{relative_path}\n{index}\n{quote}".encode("utf-8")).hexdigest()
    return f"pw-{digest[:20]}"


def clean_quote(value: Any) -> str:
    text = str(value or "").strip()
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def build_index(refresh: bool) -> dict[str, Any]:
    source_commit = ensure_source_repo(refresh)
    policy = load_policy()
    author_metadata = collect_author_metadata()

    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    BOOKS_DIR.mkdir(parents=True, exist_ok=True)

    entries_by_book: dict[str, list[dict[str, Any]]] = defaultdict(list)
    author_inventory: dict[str, dict[str, Any]] = {}
    review_queue: dict[str, dict[str, Any]] = {}
    stats = Counter()
    excluded_reasons = Counter()

    commentary_files = sorted(
        path for path in SOURCE_DIR.glob("**/*.toml")
        if path.is_file() and path.name != "metadata.toml"
    )

    for path in commentary_files:
        relative_path = str(path.relative_to(SOURCE_DIR))
        father_name = path.parent.name
        meta = author_metadata.get(father_name, {})
        default_year = meaningful_year(meta.get("default_year"))

        try:
            book_name, book_key, verse_range = parse_commentary_file(path)
            data = load_toml(path)
        except Exception as error:
            stats["fileErrors"] += 1
            review_queue.setdefault(father_name, {
                "fatherName": father_name,
                "defaultYear": default_year,
                "wikiUrl": meta.get("wiki", ""),
                "status": "review",
                "classification": "file-error",
                "reason": "one or more source TOML files could not be parsed",
                "fileErrors": [],
            })["fileErrors"].append({"path": relative_path, "error": str(error)})
            continue

        start_chapter, start_verse, end_chapter, end_verse = verse_range
        location_start = encode_location(start_chapter, start_verse)
        location_end = encode_location(end_chapter, end_verse)
        range_label = format_range_label(book_name, start_chapter, start_verse, end_chapter, end_verse)

        if location_start > location_end:
            stats["fileErrors"] += 1
            review_queue.setdefault(father_name, {
                "fatherName": father_name,
                "defaultYear": default_year,
                "wikiUrl": meta.get("wiki", ""),
                "status": "review",
                "classification": "inverted-source-range",
                "reason": "source TOML filename encodes a range whose start is after its end",
                "sampleFiles": [],
            })
            samples = review_queue[father_name].setdefault("sampleFiles", [])
            if relative_path not in samples and len(samples) < 8:
                samples.append(relative_path)
            continue

        commentaries = data.get("commentary", [])
        if not isinstance(commentaries, list):
            stats["fileErrors"] += 1
            continue

        for idx, commentary in enumerate(commentaries):
            if not isinstance(commentary, dict):
                stats["entryErrors"] += 1
                continue

            effective_year = meaningful_year(commentary.get("time")) or default_year
            classification = classify_author(father_name, effective_year, policy)

            inventory = author_inventory.setdefault(father_name, {
                "fatherName": father_name,
                "defaultYear": default_year,
                "wikiUrl": meta.get("wiki", ""),
                "status": classification["status"],
                "classification": classification["classification"],
                "reason": classification["reason"],
                "source": classification["source"],
                "includedEntries": 0,
                "excludedEntries": 0,
                "reviewEntries": 0,
            })

            inventory["status"] = classification["status"]
            inventory["classification"] = classification["classification"]
            inventory["reason"] = classification["reason"]
            inventory["source"] = classification["source"]

            quote = clean_quote(commentary.get("quote"))
            if not quote:
                stats["entryErrors"] += 1
                continue

            if classification["status"] != "include":
                if classification["status"] == "review":
                    inventory["reviewEntries"] += 1
                    stats["reviewEntries"] += 1
                    review_queue.setdefault(father_name, {
                        "fatherName": father_name,
                        "defaultYear": default_year,
                        "wikiUrl": meta.get("wiki", ""),
                        "status": "review",
                        "classification": classification["classification"],
                        "reason": classification["reason"],
                        "source": classification["source"],
                        "sampleFiles": [],
                    })
                    samples = review_queue[father_name]["sampleFiles"]
                    if relative_path not in samples and len(samples) < 8:
                        samples.append(relative_path)
                else:
                    inventory["excludedEntries"] += 1
                    stats["excludedEntries"] += 1
                    excluded_reasons[classification["classification"]] += 1
                continue

            inventory["includedEntries"] += 1
            stats["includedEntries"] += 1

            append_to_author = str(commentary.get("append_to_author_name", "") or "")
            source_title = str(commentary.get("source_title", "") or "").strip()
            source_url = str(commentary.get("source_url", "") or "").strip()

            entry = {
                "id": stable_id(relative_path, idx, quote),
                "fatherName": father_name,
                "authorDisplay": f"{father_name}{append_to_author}",
                "classification": classification["classification"],
                "time": effective_year,
                "defaultYear": default_year,
                "book": book_key,
                "bookName": book_name,
                "range": {
                    "label": range_label,
                    "startChapter": start_chapter,
                    "startVerse": start_verse,
                    "endChapter": end_chapter,
                    "endVerse": end_verse,
                    "locationStart": location_start,
                    "locationEnd": location_end,
                },
                "quote": quote,
                "sourceTitle": source_title,
                "sourceUrl": source_url,
                "sourceFile": relative_path,
                "sourceRepository": policy["sourceRepository"],
                "sourceCommit": source_commit,
                "notice": "Source database is mixed public-domain/fair-use; preserve source attribution and source URLs where supplied.",
            }
            entries_by_book[book_key].append(entry)

    book_manifest = []
    total_generated_bytes = 0

    for book_key, entries in sorted(entries_by_book.items()):
        entries.sort(key=lambda item: (
            item["range"]["locationStart"],
            item["time"] if item["time"] is not None else 9999999,
            item["fatherName"],
            item["sourceTitle"],
        ))

        shard = {
            "schema": "universal_office_patristic_witness_book_shard_v1",
            "book": book_key,
            "bookName": entries[0]["bookName"] if entries else book_key,
            "sourceRepository": policy["sourceRepository"],
            "sourceBranch": policy["sourceBranch"],
            "sourceCommit": source_commit,
            "filterPolicy": policy["filterPolicy"],
            "entryCount": len(entries),
            "entries": entries,
        }

        out_path = BOOKS_DIR / f"{book_key}.json"
        out_path.write_text(json.dumps(shard, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        size = out_path.stat().st_size
        total_generated_bytes += size
        book_manifest.append({
            "book": book_key,
            "bookName": shard["bookName"],
            "path": str(out_path.relative_to(ROOT)),
            "entryCount": len(entries),
            "bytes": size,
        })

    author_list = sorted(author_inventory.values(), key=lambda item: item["fatherName"])
    review_list = sorted(review_queue.values(), key=lambda item: item["fatherName"])

    (OUT_DIR / "author-inventory.json").write_text(json.dumps({
        "schema": "universal_office_patristic_witness_author_inventory_v1",
        "sourceRepository": policy["sourceRepository"],
        "sourceBranch": policy["sourceBranch"],
        "sourceCommit": source_commit,
        "authorCount": len(author_list),
        "authors": author_list,
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    (OUT_DIR / "review-queue.json").write_text(json.dumps({
        "schema": "universal_office_patristic_witness_review_queue_v1",
        "sourceRepository": policy["sourceRepository"],
        "sourceBranch": policy["sourceBranch"],
        "sourceCommit": source_commit,
        "reviewAuthorCount": len(review_list),
        "authors": review_list,
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    total_generated_bytes += (OUT_DIR / "author-inventory.json").stat().st_size
    total_generated_bytes += (OUT_DIR / "review-queue.json").stat().st_size

    status_counts = Counter(author["status"] for author in author_list)
    manifest = {
        "schema": "universal_office_patristic_witness_manifest_v1",
        "sourceRepository": policy["sourceRepository"],
        "sourceBranch": policy["sourceBranch"],
        "sourceCommit": source_commit,
        "sourcePath": str(SOURCE_DIR.relative_to(ROOT)),
        "filterPolicy": policy["filterPolicy"],
        "licenseNotice": {
            "summary": "Source repository contains public-domain material and fair-use excerpts. Preserve attribution and source URLs where supplied.",
            "downstreamUse": "Review before public redistribution beyond private/internal Bible Browser use."
        },
        "stats": {
            "commentaryFilesScanned": len(commentary_files),
            "includedEntries": stats["includedEntries"],
            "excludedEntries": stats["excludedEntries"],
            "reviewEntries": stats["reviewEntries"],
            "fileErrors": stats["fileErrors"],
            "entryErrors": stats["entryErrors"],
            "authorStatusCounts": dict(status_counts),
            "excludedReasonCounts": dict(excluded_reasons),
            "bookShardCount": len(book_manifest),
            "generatedBytes": total_generated_bytes,
        },
        "books": book_manifest,
        "authorInventoryPath": ".external/generated/patristic-witness/author-inventory.json",
        "reviewQueuePath": ".external/generated/patristic-witness/review-queue.json",
    }

    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    total_generated_bytes += (OUT_DIR / "manifest.json").stat().st_size

    summary = {
        "schema": "universal_office_patristic_witness_intake_summary_v1",
        "sourceRepository": manifest["sourceRepository"],
        "sourceBranch": manifest["sourceBranch"],
        "sourceCommit": manifest["sourceCommit"],
        "filterPolicy": manifest["filterPolicy"],
        "licenseNotice": manifest["licenseNotice"],
        "stats": manifest["stats"],
        "books": manifest["books"],
        "generatedOutput": ".external/generated/patristic-witness",
        "runtimeStatus": "source-intake-only; not yet shipped in web-release",
    }
    SUMMARY_PATH.parent.mkdir(parents=True, exist_ok=True)
    SUMMARY_PATH.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the Universal Office patristic witness index.")
    parser.add_argument("--no-refresh", action="store_true", help="Use existing .external clone without fetching latest source.")
    args = parser.parse_args()

    manifest = build_index(refresh=not args.no_refresh)
    print(
        "PASS patristic witness build: "
        f"books={manifest['stats']['bookShardCount']} "
        f"included={manifest['stats']['includedEntries']} "
        f"excluded={manifest['stats']['excludedEntries']} "
        f"review={manifest['stats']['reviewEntries']} "
        f"bytes={manifest['stats']['generatedBytes']}"
    )


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        print(error.stdout or "", file=sys.stderr)
        print(error.stderr or "", file=sys.stderr)
        raise
