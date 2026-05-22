from pathlib import Path
import json

ROADMAP = Path("project_roadmap.json")
RUBRICS = Path("data/rubrics.json")
ANGLICAN = Path("components/anglican.json")

def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))

def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Validate component IDs exist before changing the office sequence.
components = load_json(ANGLICAN)
component_ids = {c.get("id") for c in components if isinstance(c, dict)}

required_component_ids = {
    "bcp-opening-blessing-compline",
    "bcp-versicles-before-prayers-compline"
}

missing = sorted(required_component_ids - component_ids)
if missing:
    raise SystemExit(f"BLOCKED: required Compline component IDs missing from components/anglican.json: {missing}")

# Patch data/rubrics.json.
rubrics = load_json(RUBRICS)

if not isinstance(rubrics, list):
    raise SystemExit("BLOCKED: data/rubrics.json is not a list as expected.")

compline = next((o for o in rubrics if isinstance(o, dict) and o.get("id") == "compline-office"), None)
if not compline:
    raise SystemExit("BLOCKED: compline-office not found in data/rubrics.json.")

seq = compline.get("sequence")
if not isinstance(seq, list):
    raise SystemExit("BLOCKED: compline-office.sequence is missing or not a list.")

old_to_new = {
    "bcp-opening-blessing": "bcp-opening-blessing-compline",
    "bcp-versicles-before-prayers": "bcp-versicles-before-prayers-compline"
}

changed = False
new_seq = []
for item in seq:
    if item in old_to_new:
        new_seq.append(old_to_new[item])
        changed = True
    else:
        new_seq.append(item)

compline["sequence"] = new_seq

if not changed:
    if all(new in seq for new in old_to_new.values()):
        print("SKIP: Compline sequence already uses Compline-specific IDs.")
    else:
        raise SystemExit("BLOCKED: stale Compline IDs not found, but expected replacement IDs are also not both present.")
else:
    print("PASS: replaced stale Compline IDs in data/rubrics.json")

# Validate stale IDs are gone from Compline only.
final_seq = compline["sequence"]
for old in old_to_new:
    if old in final_seq:
        raise SystemExit(f"FAIL: stale ID still present in Compline sequence: {old}")
for new in old_to_new.values():
    if new not in final_seq:
        raise SystemExit(f"FAIL: replacement ID missing from Compline sequence: {new}")

write_json(RUBRICS, rubrics)

# Update roadmap to show Phase 2.1 QC completed and Phase 2.2 repair in progress.
roadmap = load_json(ROADMAP)
roadmap["last_updated"] = "2026-05-20"

state = roadmap.setdefault("current_repo_state", {})
state["latest_known_commit"] = "bcebc9c"
state["latest_known_commit_message"] = "Add universal beta roadmap governance board"

for phase in roadmap.get("phase_plan", []):
    if phase.get("id") == "phase_1":
        phase["status"] = "done"
    elif phase.get("id") == "phase_2":
        phase["status"] = "in_progress"

for tranche in roadmap.get("tranche_plan", []):
    if tranche.get("id") == "1.3":
        tranche["status"] = "done"
    elif tranche.get("id") == "2.1":
        tranche["status"] = "done"
    elif tranche.get("id") == "2.2":
        tranche["status"] = "in_progress"

write_json(ROADMAP, roadmap)

# Final validation.
load_json(RUBRICS)
load_json(ROADMAP)

print("PASS: project_roadmap.json advanced to Phase 2.2 repair state")
print("PASS: Phase 2.2 Compline ID patch complete")
