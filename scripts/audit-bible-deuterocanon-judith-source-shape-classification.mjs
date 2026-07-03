#!/usr/bin/env node
import fs from "fs";

const path = "data/bible/registry/deuterocanon-judith-source-shape-classification-2026-07-02.json";
const record = JSON.parse(fs.readFileSync(path, "utf8"));
const failures = [];

if (record.status !== "judith_source_complete_nrsva_addressability_rows_classified") failures.push("unexpected status");
if (record.summary?.targetRows !== 35) failures.push("expected 35 Judith target rows");
if (record.summary?.classifiedNotApplicable !== 35) failures.push("expected 35 classified rows");
if (record.summary?.remainingNrsVApplicableRowsAfterClassification !== 234) failures.push("expected 234 remaining applicable rows");
if (record.summary?.nrsvNotApplicableRowsAfterClassification !== 110) failures.push("expected 110 not-applicable rows");
if (JSON.stringify(record.summary?.remainingApplicableBooksAfterClassification) !== JSON.stringify(["SIRACH"])) failures.push("expected Sirach only remaining");
if (record.summary?.activeBibleTextMutation !== "none") failures.push("Bible text mutation must be none");
if (record.summary?.syntheticRows !== 0) failures.push("synthetic rows must be zero");
if ((record.failures || []).length) failures.push("record contains failures");

for (const claim of [
  "judith_incomplete_for_nrsva",
  "judith_rows_repaired_from_absent_source_refs",
  "judith_rows_filled_synthetically",
  "deuterocanon_globally_textually_trusted"
]) {
  if (!(record.blockedClaims || []).includes(claim)) failures.push("missing blocked claim: " + claim);
}

console.log(JSON.stringify({
  audit: "deuterocanon_judith_source_shape_classification",
  status: failures.length ? "FAIL" : "PASS",
  recordPath: path,
  summary: record.summary,
  classifiedByChapter: record.classifiedByChapter,
  remainingApplicableMissingByBook: record.remainingApplicableMissingByBook,
  notApplicableByBook: record.notApplicableByBook,
  failures
}, null, 2));

process.exit(failures.length ? 1 : 0);
