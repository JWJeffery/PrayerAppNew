#!/usr/bin/env node
import fs from "fs";

const path = "data/bible/registry/deuterocanon-status-accounting-after-tobit-2026-07-02.json";
const record = JSON.parse(fs.readFileSync(path, "utf8"));
const failures = [];

if (record.status !== "deuterocanon_status_accounted_after_tobit_source_shape_classification") failures.push("unexpected status");
if (record.postTobitTotals?.nrsvApplicableMissingRows !== 286) failures.push("expected 286 remaining applicable gaps");
if (record.postTobitTotals?.nrsvNotApplicableRows !== 58) failures.push("expected 58 not-applicable rows");
if (record.postTobitTotals?.tobitRowsMovedFromApplicableToNotApplicable !== 57) failures.push("expected 57 Tobit rows moved");
if (record.postTobitTotals?.activeBibleTextMutation !== "none") failures.push("Bible text mutation must be none");
if ((record.remainingApplicableMissingByBook || {}).TOBIT !== undefined) failures.push("Tobit still present in remaining applicable gap count");
if ((record.failures || []).length) failures.push("record contains failures");

console.log(JSON.stringify({
  audit: "deuterocanon_status_accounting_after_tobit",
  status: failures.length ? "FAIL" : "PASS",
  recordPath: path,
  postTobitTotals: record.postTobitTotals,
  remainingApplicableMissingByBook: record.remainingApplicableMissingByBook,
  notApplicableByBook: record.notApplicableByBook,
  failures
}, null, 2));

process.exit(failures.length ? 1 : 0);
