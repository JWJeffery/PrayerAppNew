#!/usr/bin/env node
import fs from "fs";

const path = "data/bible/registry/deuterocanon-small-gap-source-shape-classification-2026-07-02.json";
const record = JSON.parse(fs.readFileSync(path, "utf8"));
const failures = [];

if (record.status !== "small_gap_rows_classified_as_source_shape_addressability") failures.push("unexpected status");
if (record.summary?.targetRows !== 17) failures.push("expected 17 target rows");
if (record.summary?.classifiedNotApplicable !== 17) failures.push("expected 17 classified not-applicable rows");
if (record.summary?.remainingNrsVApplicableRowsAfterClassification !== 269) failures.push("expected 269 remaining applicable rows");
if (record.summary?.nrsvNotApplicableRowsAfterClassification !== 75) failures.push("expected 75 not-applicable rows");
if (record.summary?.activeBibleTextMutation !== "none") failures.push("Bible text mutation must be none");
if (record.summary?.syntheticRows !== 0) failures.push("synthetic rows must be zero");
if ((record.failures || []).length) failures.push("record contains failures");

for (const book of ["BARUCH", "FIRST_MACCABEES", "SECOND_MACCABEES", "WISDOM"]) {
  if (!(record.classifiedByBook || {})[book]) failures.push("missing classified book: " + book);
}

for (const claim of [
  "small_gap_rows_filled_synthetically",
  "small_gap_rows_repaired_from_absent_source_refs",
  "deuterocanon_globally_textually_trusted"
]) {
  if (!(record.blockedClaims || []).includes(claim)) failures.push("missing blocked claim: " + claim);
}

console.log(JSON.stringify({
  audit: "deuterocanon_small_gap_source_shape_classification",
  status: failures.length ? "FAIL" : "PASS",
  recordPath: path,
  summary: record.summary,
  classifiedByBook: record.classifiedByBook,
  remainingApplicableMissingByBook: record.remainingApplicableMissingByBook,
  notApplicableByBook: record.notApplicableByBook,
  failures
}, null, 2));

process.exit(failures.length ? 1 : 0);
