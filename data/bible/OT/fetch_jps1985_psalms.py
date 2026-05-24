import json
import re
import sys
import urllib.parse
import urllib.request
from difflib import SequenceMatcher
from html import unescape
from pathlib import Path

PSALMS_PATH = Path("data/bible/OT/psalms.json")
TARGET_RANGE = range(121, 151)
MATCH_REF = "Psalms.120"
MATCH_ID = "PSALM 120"
MIN_MATCH_SCORE = 0.78

BASE = "https://www.sefaria.org/api/texts/"

KNOWN_CANDIDATE_TITLES = [
    "Tanakh: The Holy Scriptures, published by JPS",
    "THE JPS TANAKH: The Holy Scriptures (1985)",
    "JPS 1985",
    "New JPS",
]


def api_get(ref, version_title=None):
    params = {
        "context": "0",
        "commentary": "0",
        "pad": "0",
        "lang": "en",
    }
    if version_title:
        params["ven"] = version_title

    url = BASE + urllib.parse.quote(ref) + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)


def strip_html(s):
    s = re.sub(r"<[^>]+>", "", s)
    return unescape(s)


def flatten_api_text(text):
    if isinstance(text, list):
        return "\n".join(str(x) for x in text if str(x).strip())
    if isinstance(text, str):
        return text
    return ""


def add_verse_prefixes(psalm_num, text):
    if not isinstance(text, list):
        raise ValueError(f"Expected list of verses for Psalm {psalm_num}, got {type(text).__name__}")

    lines = []
    for i, verse in enumerate(text, start=1):
        verse = strip_html(str(verse)).strip()
        if not verse:
            continue
        verse = re.sub(rf"^{psalm_num}\s*:\s*{i}\s*", "", verse).strip()
        lines.append(f"{psalm_num}:{i} {verse}")

    if not lines:
        raise ValueError(f"No verse text extracted for Psalm {psalm_num}")

    return "\n".join(lines)


def normalize_for_match(s):
    s = strip_html(str(s))
    s = re.sub(r"\b\d+\s*:\s*\d+\b", " ", s)
    s = re.sub(r"[^A-Za-z0-9]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip().lower()
    return s


def collect_candidate_versions(metadata):
    candidates = []

    for field in ["available_versions", "versions"]:
        versions = metadata.get(field)
        if isinstance(versions, list):
            for v in versions:
                if not isinstance(v, dict):
                    continue
                lang = v.get("language") or v.get("lang")
                title = v.get("versionTitle") or v.get("version")
                if lang == "en" and title:
                    candidates.append(title)

    for key in ["versionTitle", "enVersionTitle"]:
        title = metadata.get(key)
        if title:
            candidates.append(title)

    candidates.extend(KNOWN_CANDIDATE_TITLES)

    seen = set()
    out = []
    for candidate in candidates:
        if candidate not in seen:
            seen.add(candidate)
            out.append(candidate)
    return out


def find_psalm(data, psalm_id):
    for item in data:
        if item.get("id") == psalm_id:
            return item
    return None


def find_matching_version(existing_psalm_120):
    metadata = api_get(MATCH_REF)
    candidates = collect_candidate_versions(metadata)

    print("Candidate English versions found:")
    for candidate in candidates:
        print("-", candidate)

    if not candidates:
        raise SystemExit("BLOCKED: Sefaria API returned no candidate English versions.")

    expected = normalize_for_match(existing_psalm_120)
    scored = []

    for title in candidates:
        try:
            fetched = api_get(MATCH_REF, version_title=title)
            raw = flatten_api_text(fetched.get("text"))
            got = normalize_for_match(raw)
            score = SequenceMatcher(None, expected, got).ratio()
            scored.append((score, title))
        except Exception as exc:
            scored.append((0.0, title))
            print(f"Could not test version {title!r}: {exc}")

    scored.sort(reverse=True)

    print("\nVersion match scores against existing JPS1985 Psalm 120:")
    for score, title in scored[:12]:
        print(f"{score:.3f}  {title}")

    best_score, best_title = scored[0]
    if best_score < MIN_MATCH_SCORE:
        raise SystemExit(
            f"BLOCKED: no Sefaria version matched existing JPS1985 Psalm 120 strongly enough. "
            f"Best was {best_score:.3f}: {best_title!r}"
        )

    print(f"\nSelected version: {best_title!r} with score {best_score:.3f}")
    return best_title


def main():
    data = json.loads(PSALMS_PATH.read_text(encoding="utf-8"))

    ps120 = find_psalm(data, MATCH_ID)
    if not ps120 or "JPS1985" not in ps120.get("text", {}):
        raise SystemExit("BLOCKED: existing PSALM 120 JPS1985 text not found; cannot verify source version.")

    selected_version = find_matching_version(ps120["text"]["JPS1985"])

    updates = {}
    for n in TARGET_RANGE:
        ref = f"Psalms.{n}"
        payload = api_get(ref, version_title=selected_version)
        api_text = payload.get("text")
        formatted = add_verse_prefixes(n, api_text)

        if "..." in formatted or "…" in formatted:
            raise SystemExit(f"BLOCKED: Psalm {n} contains ellipsis/incomplete marker.")

        updates[f"PSALM {n}"] = formatted
        print(f"Fetched PSALM {n}")

    by_id = {item.get("id"): item for item in data if isinstance(item, dict)}

    for n in TARGET_RANGE:
        psalm_id = f"PSALM {n}"
        item = by_id.get(psalm_id)
        if not item:
            raise SystemExit(f"BLOCKED: {psalm_id} not found in psalms.json")

        item.setdefault("text", {})

        if "JPS1985" in item["text"]:
            raise SystemExit(f"BLOCKED: {psalm_id} already has JPS1985; refusing overwrite.")

        item["text"]["JPS1985"] = updates[psalm_id]

    PSALMS_PATH.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8"
    )

    missing = []
    for n in range(1, 151):
        item = by_id.get(f"PSALM {n}")
        if not item or "JPS1985" not in item.get("text", {}):
            missing.append(n)

    if missing:
        raise SystemExit(f"BLOCKED: JPS1985 still missing Psalms: {missing}")

    print("\nJPS1985 Psalms 1–150 complete.")
    print("Psalms 151–155 intentionally excluded from JPS1985 completion target.")


if __name__ == "__main__":
    main()
