import json
from pathlib import Path

QUEUE = Path("data/menaion/research-queue.json")
OUTPUT = Path("data/menaion/research-batch.json")

BATCH_SIZE = 12

data = json.loads(QUEUE.read_text())

entries = data["entries"]

# prioritize high → medium → low
priority_order = {"high": 0, "medium": 1, "low": 2}

entries.sort(key=lambda e: (priority_order[e["priority"]], e["date"]))

batch = entries[:BATCH_SIZE]

payload = {
    "_meta": {
        "description": "Next research batch for troparion import",
        "batch_size": len(batch)
    },
    "entries": batch
}

OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False))

print(f"Wrote research batch with {len(batch)} entries to {OUTPUT}")