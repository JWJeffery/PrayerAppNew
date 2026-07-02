#!/usr/bin/env node
import fs from "fs";

const recordPath = "data/bible/registry/deutero-tobit-nrsv-source-shape-classification-2026-07-02.json";
const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
const failures = [];

if (record.status !== "tobit_nrsv_gaps_classified_not_applicable_source_shape") {
  failures.push("unexpected record status");
}

if (record.summary?.totalTobitRowsPreviouslyListedAsApplicableMissing !== 57) {
  failures.push("expected 57 Tobit rows");
}

if (record.summary?.beyondSourceEndpointRows !== 56) {
  failures.push("expected 56 endpoint-boundary rows");
}

if (record.summary?.mergedSourceSpanRows !== 1) {
  failures.push("expected one merged-source-span row");
}

if (record.summary?.activeBibleTextMutation !== "none") {
  failures.push("classification must not mutate Bible text");
}

if ((record.failures || []).length !== 0) {
  failures.push("record contains classification failures");
}

const merged = record.mergedSourceSpanRows || [];
if (merged.length !== 1 || merged[0].ref !== "14:9" || merged[0].representedAt !== "14:8") {
  failures.push("Tobit 14:9 merged-span classification mismatch");
}

for (const claim of [
  "tobit_nrsv_repaired_by_synthetic_fill",
  "tobit_14_9_standalone_nrsv_gap",
  "tobit_rows_textually_mutated_by_source_shape_classification",
  "deuterocanon_globally_textually_trusted"
]) {
  if (!(record.blockedClaims || []).includes(claim)) {
    failures.push("missing blocked claim: " + claim);
  }
}

console.log(JSON.stringify({
  audit: "deutero_tobit_nrsv_source_shape_classification",
  status: failures.length ? "FAIL" : "PASS",
  recordPath,
  summary: record.summary,
  failures
}, null, 2));

process.exit(failures.length ? 1 : 0);
