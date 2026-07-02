#!/usr/bin/env node
import fs from "fs";

const auditPath = "data/bible/registry/deuterocanon-status-consolidation-audit-2026-07-02.json";
const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
const failures = [];

if (![
  "deuterocanon_status_consolidated_nrsv_applicable_complete",
  "deuterocanon_status_consolidated_remaining_nrsv_applicable_gaps"
].includes(audit.status)) failures.push("unexpected audit status");

if (audit.determination?.globalTrustPromotion !== "not_performed") failures.push("global trust promotion was performed");
if (audit.determination?.activeBibleTextMutation !== "none") failures.push("Bible text mutation must be none");

const missingTotal = audit.bookSummaries.reduce((sum, book) => sum + (book.nrsvApplicableMissingRows || []).length, 0);
const notApplicableTotal = audit.bookSummaries.reduce((sum, book) => sum + (book.nrsvNotApplicableRows || []).length, 0);

if (audit.totals.nrsvApplicableMissingRows !== missingTotal) failures.push("applicable missing total mismatch");
if (audit.totals.nrsvNotApplicableRows !== notApplicableTotal) failures.push("not-applicable total mismatch");

for (const claim of [
  "deuterocanon_globally_textually_trusted",
  "deuterocanon_complete_without_review",
  "broad_canon_started_before_consolidation_review",
  "daniel_13_65_nrsv_filled_or_synthesized"
]) {
  if (!(audit.blockedClaims || []).includes(claim)) failures.push("missing blocked claim: " + claim);
}

console.log(JSON.stringify({
  audit: "deuterocanon_status_consolidation",
  status: failures.length ? "FAIL" : "PASS",
  auditPath,
  totals: audit.totals,
  consolidationStatus: audit.status,
  failures
}, null, 2));

process.exit(failures.length ? 1 : 0);
