#!/usr/bin/env node
import fs from "fs";

const path = "data/bible/registry/deuterocanon-sirach-source-shape-classification-2026-07-02.json";
const record = JSON.parse(fs.readFileSync(path, "utf8"));
const failures = [];

if (record.status !== "sirach_source_complete_nrsva_addressability_rows_classified") failures.push("unexpected status");
if (record.summary?.targetRows !== 234) failures.push("expected 234 Sirach target rows");
if (record.summary?.classifiedNotApplicable !== 234) failures.push("expected 234 classified rows");
if (record.summary?.repairCandidates !== 0) failures.push("expected zero repair candidates");
if (record.summary?.remainingNrsVApplicableRowsAfterClassification !== 0) failures.push("expected zero remaining applicable rows");
if (record.summary?.nrsvNotApplicableRowsAfterClassification !== 344) failures.push("expected 344 not-applicable rows");
if (record.summary?.activeBibleTextMutation !== "none") failures.push("Bible text mutation must be none");
if (record.summary?.syntheticRows !== 0) failures.push("synthetic rows must be zero");
if ((record.failures || []).length) failures.push("record contains failures");

const expectedCounts = {
  source_shape_absent_from_raw_nrsva_grid: 41,
  source_shape_beyond_raw_nrsva_endpoint: 193
};

for (const [key, value] of Object.entries(expectedCounts)) {
  if ((record.classificationCounts || {})[key] !== value) failures.push(`unexpected ${key} count`);
}

for (const claim of [
  "sirach_incomplete_for_nrsva",
  "sirach_rows_repaired_from_absent_source_refs",
  "sirach_rows_filled_synthetically",
  "deuterocanon_globally_textually_trusted"
]) {
  if (!(record.blockedClaims || []).includes(claim)) failures.push("missing blocked claim: " + claim);
}

console.log(JSON.stringify({
  audit: "deuterocanon_sirach_source_shape_classification",
  status: failures.length ? "FAIL" : "PASS",
  recordPath: path,
  summary: record.summary,
  classificationCounts: record.classificationCounts,
  activeTranslationCountsAcrossTargetRows: record.activeTranslationCountsAcrossTargetRows,
  failures
}, null, 2));

process.exit(failures.length ? 1 : 0);
