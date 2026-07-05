#!/usr/bin/env node
import fs from "node:fs";
const rebuildPath = "data/bible/registry/broader-canon-odesofsolomon-nuhra-rebuild-2026-07-05.json";
const candidatePath = "data/bible/ODES/odesofsolomonSY.json";
const failures = [];
if (!fs.existsSync(rebuildPath)) failures.push({ type: "missing-rebuild-record" });
else {
  const rebuild = JSON.parse(fs.readFileSync(rebuildPath, "utf8"));
  const candidate = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
  if (rebuild.status !== "rebuilt_complete_nuhra_source_snapshot_pending_collation") failures.push({ type: "rebuild-status-mismatch", actual: rebuild.status });
  if ((candidate.chapters || []).length !== 42) failures.push({ type: "candidate-not-rebuilt", actual: (candidate.chapters || []).length });
}
console.log(JSON.stringify({
  audit: "broader-canon-source-scope-blocker-odesofsolomon",
  status: failures.length ? "failed" : "passed_superseded",
  supersededBy: rebuildPath,
  failures
}, null, 2));
if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Odes superseded blocker audit.");
  process.exit(1);
}
console.log("ALL PASSED");
console.log("NEXT: Historical Odes fragmentary blocker is superseded by complete Nuhra rebuild.");
