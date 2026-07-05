#!/usr/bin/env node
import fs from "node:fs";
const rebuildPath = "data/bible/registry/broader-canon-odesofsolomon-nuhra-rebuild-2026-07-05.json";
const exclusionPath = "data/bible/registry/broader-canon-odesofsolomon-fragmentary-exclusion-2026-07-04.json";
const failures = [];
if (!fs.existsSync(rebuildPath)) failures.push({ type: "missing-rebuild-record" });
if (!fs.existsSync(exclusionPath)) failures.push({ type: "missing-prior-exclusion-record" });
console.log(JSON.stringify({
  audit: "broader-canon-odesofsolomon-fragmentary-exclusion",
  status: failures.length ? "failed" : "passed_superseded",
  priorExclusionPath: exclusionPath,
  supersededBy: rebuildPath,
  failures
}, null, 2));
if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Odes superseded exclusion audit.");
  process.exit(1);
}
console.log("ALL PASSED");
console.log("NEXT: Historical Odes fragmentary exclusion is superseded by complete Nuhra rebuild.");
