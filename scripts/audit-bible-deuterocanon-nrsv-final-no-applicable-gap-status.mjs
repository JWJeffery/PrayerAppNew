#!/usr/bin/env node
import fs from "fs";

const path = "data/bible/registry/deuterocanon-nrsv-final-no-applicable-gap-status-2026-07-02.json";
const record = JSON.parse(fs.readFileSync(path, "utf8"));
const failures = [];

if (record.status !== "deuterocanon_nrsv_no_applicable_gaps_remaining") failures.push("unexpected status");
if (record.summary?.remainingNrsVApplicableRows !== 0) failures.push("expected zero remaining applicable rows");
if (record.summary?.nrsvNotApplicableRows !== 344) failures.push("expected 344 not-applicable rows");
if (record.summary?.repairCandidatesRemaining !== 0) failures.push("expected zero repair candidates");
if (record.summary?.activeBibleTextMutation !== "none") failures.push("Bible text mutation must be none");
if (record.summary?.syntheticRows !== 0) failures.push("synthetic rows must be zero");
if (record.summary?.globalTextTrustPromotion !== "not_performed") failures.push("global trust promotion must not be performed");
if ((record.failures || []).length) failures.push("record contains failures");

const expectedByBook = {
  GREEK_DANIEL: 1,
  TOBIT: 57,
  BARUCH: 2,
  FIRST_MACCABEES: 6,
  SECOND_MACCABEES: 3,
  WISDOM: 6,
  JUDITH: 35,
  SIRACH: 234
};

for (const [book, count] of Object.entries(expectedByBook)) {
  if ((record.classifiedNotApplicableByBook || {})[book] !== count) {
    failures.push(`unexpected not-applicable count for ${book}`);
  }
}

for (const claim of [
  "deuterocanon_globally_textually_trusted",
  "deuterocanon_all_translations_complete",
  "source_shape_rows_are_textual_defects",
  "tobit_judith_sirach_incomplete_for_selected_nrsva_grid",
  "synthetic_nrsv_rows_created"
]) {
  if (!(record.blockedClaims || []).includes(claim)) failures.push("missing blocked claim: " + claim);
}

console.log(JSON.stringify({
  audit: "deuterocanon_nrsv_final_no_applicable_gap_status",
  status: failures.length ? "FAIL" : "PASS",
  recordPath: path,
  summary: record.summary,
  classifiedNotApplicableByBook: record.classifiedNotApplicableByBook,
  failures
}, null, 2));

process.exit(failures.length ? 1 : 0);
