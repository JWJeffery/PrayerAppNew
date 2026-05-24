import json
import re
import urllib.parse
import urllib.request
from difflib import SequenceMatcher
from html import unescape
from pathlib import Path

PSALMS_PATH = Path("data/bible/OT/psalms.json")
SOURCE_VERSION_TITLE = "Tanakh: The Holy Scriptures, published by JPS"
TARGET_RANGE = range(1, 151)
REFERENCE_ID = "PSALM 1"
MIN_REFERENCE_SCORE = 0.80
BASE = "https://www.sefaria.org/api/texts/"


def api_get(ref, version_title):
    params = {
        "context": "0",
        "commentary": "0",
        "pad": "0",
        "lang": "en",
        "ven": version_title,
    }
    url = BASE + urllib.parse.quote(ref) + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.load(response)


def clean_source_html(value):
    """Remove Sefaria footnote/appartus markup while preserving verse text.

    Sefaria exports this JPS source with inline HTML footnote markers and note
    bodies. A plain tag strip leaves artifacts such as `aOr...` in the verse.
    This function removes note bodies/markers first, then turns layout tags into
    spaces before collapsing whitespace.
    """
    value = str(value)

    # Remove common Sefaria note/footnote bodies before stripping tags.
    value = re.sub(
        r"<(i|span)[^>]*(footnote|foot-note|inline-footnote|note|refLink|commentary|tooltip)[^>]*>.*?</\1>",
        " ",
        value,
        flags=re.IGNORECASE | re.DOTALL,
    )

    # Remove standalone superscript footnote markers.
    value = re.sub(r"<sup[^>]*>.*?</sup>", " ", value, flags=re.IGNORECASE | re.DOTALL)

    # Treat structural/layout tags as word boundaries.
    value = re.sub(r"<\s*(br|p|div|span)[^>]*>", " ", value, flags=re.IGNORECASE)
    value = re.sub(r"<\s*/\s*(p|div|span)[^>]*>", " ", value, flags=re.IGNORECASE)

    # Strip any remaining tags and decode entities.
    value = re.sub(r"<[^>]+>", " ", value)
    value = unescape(value)

    # Normalize whitespace and punctuation spacing.
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"\s+([,.;:!?])", r"\1", value)
    value = re.sub(r"([,;!?])(?=\S)", r"\1 ", value)
    value = re.sub(r"(?<!\d):(?!\s|\d)", ": ", value)
    value = re.sub(r"\s+", " ", value).strip()

    return value


def normalize_for_match(value):
    value = clean_source_html(value)
    value = re.sub(r"\b\d+\s*:\s*\d+\b", " ", value)
    value = re.sub(r"[^A-Za-z0-9]+", " ", value)
    value = re.sub(r"\s+", " ", value).strip().lower()
    return value


def format_verses(psalm_num, api_text):
    if not isinstance(api_text, list):
        raise ValueError(f"Expected list of verses for Psalm {psalm_num}, got {type(api_text).__name__}")

    lines = []
    for verse_num, verse in enumerate(api_text, start=1):
        verse = clean_source_html(verse)
        if not verse:
            continue
        verse = re.sub(rf"^{psalm_num}\s*:\s*{verse_num}\s*", "", verse).strip()
        lines.append(f"{psalm_num}:{verse_num} {verse}")

    if not lines:
        raise ValueError(f"No verse text extracted for Psalm {psalm_num}")

    return "\n".join(lines)


def find_psalm(data, psalm_id):
    for item in data:
        if isinstance(item, dict) and item.get("id") == psalm_id:
            return item
    return None


def verify_reference_only(data):
    """Verify the selected source against one known-good local sample.

    The existing JPS1985 lane was previously mixed after Psalm 120, so later
    local samples must not veto the overwrite. This guard only confirms that the
    fixed Sefaria version agrees with the early modern-JPS local material before
    the script rewrites Psalms 1-150 from one consistent source.
    """
    print(f"Using Sefaria source version: {SOURCE_VERSION_TITLE!r}")

    n = int(REFERENCE_ID.split()[1])
    existing_item = find_psalm(data, REFERENCE_ID)
    if not existing_item:
        raise SystemExit(f"BLOCKED: {REFERENCE_ID} not found in psalms.json")

    existing_text = existing_item.get("text", {}).get("JPS1985")
    if not existing_text:
        raise SystemExit(f"BLOCKED: {REFERENCE_ID} has no existing JPS1985 text to verify against")

    fetched = api_get(f"Psalms.{n}", SOURCE_VERSION_TITLE)
    fetched_text = format_verses(n, fetched.get("text"))

    score = SequenceMatcher(
        None,
        normalize_for_match(existing_text),
        normalize_for_match(fetched_text),
    ).ratio()

    print(f"{REFERENCE_ID} verification score: {score:.3f}")
    if score < MIN_REFERENCE_SCORE:
        raise SystemExit(
            f"BLOCKED: {REFERENCE_ID} did not match the selected JPS1985/NJPS source strongly enough. "
            f"Score {score:.3f}; required {MIN_REFERENCE_SCORE:.3f}."
        )


def validate_formatted_psalm(psalm_id, formatted):
    lines = [line.strip() for line in formatted.splitlines() if line.strip()]
    if not lines:
        raise SystemExit(f"BLOCKED: {psalm_id} produced no verse lines")

    psalm_num = psalm_id.split()[1]
    if not all(line.startswith(f"{psalm_num}:") for line in lines):
        raise SystemExit(f"BLOCKED: {psalm_id} has a malformed verse prefix")

    if len(formatted) < 20:
        raise SystemExit(f"BLOCKED: {psalm_id} output is implausibly short")

    forbidden_patterns = [
        r"\b[a-z]Or\b",
        r"\b[a-z]Others\b",
        r"\b[a-z]Meaning of Heb\.",
        r"\blit\.\b",
    ]
    for pattern in forbidden_patterns:
        if re.search(pattern, formatted):
            raise SystemExit(f"BLOCKED: {psalm_id} still appears to contain inline apparatus: {pattern}")


def main():
    data = json.loads(PSALMS_PATH.read_text(encoding="utf-8"))
    verify_reference_only(data)

    by_id = {item.get("id"): item for item in data if isinstance(item, dict)}

    for n in TARGET_RANGE:
        psalm_id = f"PSALM {n}"
        item = by_id.get(psalm_id)
        if not item:
            raise SystemExit(f"BLOCKED: {psalm_id} not found in psalms.json")

        fetched = api_get(f"Psalms.{n}", SOURCE_VERSION_TITLE)
        formatted = format_verses(n, fetched.get("text"))
        validate_formatted_psalm(psalm_id, formatted)

        item.setdefault("text", {})
        item["text"]["JPS1985"] = formatted
        print(f"Set {psalm_id} JPS1985")

    missing = []
    for n in TARGET_RANGE:
        item = by_id.get(f"PSALM {n}")
        if not item or "JPS1985" not in item.get("text", {}):
            missing.append(n)

    if missing:
        raise SystemExit(f"BLOCKED: JPS1985 still missing Psalms: {missing}")

    PSALMS_PATH.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print("\nJPS1985 Psalms 1–150 written from one consistent source version.")
    print("Psalms 151–155 intentionally excluded from JPS1985 completion target.")


if __name__ == "__main__":
    main()
