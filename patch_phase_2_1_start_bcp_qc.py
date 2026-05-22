from pathlib import Path
import json

ROADMAP = Path("project_roadmap.json")

data = json.loads(ROADMAP.read_text(encoding="utf-8"))

data["last_updated"] = "2026-05-20"

state = data.setdefault("current_repo_state", {})
state["latest_known_commit"] = "bcebc9c"
state["latest_known_commit_message"] = "Add universal beta roadmap governance board"

for phase in data.get("phase_plan", []):
    if phase.get("id") == "phase_1":
        phase["status"] = "done"
    elif phase.get("id") == "phase_2":
        phase["status"] = "in_progress"

for tranche in data.get("tranche_plan", []):
    if tranche.get("id") == "1.3":
        tranche["status"] = "done"
    elif tranche.get("id") == "2.1":
        tranche["status"] = "in_progress"

ROADMAP.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# validation
check = json.loads(ROADMAP.read_text(encoding="utf-8"))
def status_phase(pid):
    return next((p.get("status") for p in check["phase_plan"] if p.get("id") == pid), None)
def status_tranche(tid):
    return next((t.get("status") for t in check["tranche_plan"] if t.get("id") == tid), None)

assert status_phase("phase_1") == "done"
assert status_phase("phase_2") == "in_progress"
assert status_tranche("1.3") == "done"
assert status_tranche("2.1") == "in_progress"
assert check["current_repo_state"]["latest_known_commit"] == "bcebc9c"

print("PASS: roadmap advanced to Phase 2.1 BCP public-flow QC")
