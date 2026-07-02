#!/usr/bin/env node
import fs from "fs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const reviewPath = "data/bible/registry/deutero-02-greek-additions-source-active-review.json";
const auditPath = "data/bible/registry/deutero-02-greek-additions-source-active-audit.json";

const review = readJson(reviewPath);
const audit = readJson(auditPath);
const failures = [];

if (review.status !== "source_active_audit_reviewed_not_repair_ready") {
  failures.push("review status mismatch");
}

if (audit.status !== "PASS_SOURCE_ACTIVE_SHAPE_FINDINGS_RECORDED") {
  failures.push("source-active audit is not passed");
}

if (review.determination?.automatedOverlayRepair !== "blocked") {
  failures.push("automated overlay repair must be blocked");
}

if (review.determination?.sameAddressRepair !== "blocked_pending_better_source_or_adapter_policy") {
  failures.push("same-address repair must remain blocked");
}

for (const claim of [
  "deutero_02_text_repaired",
  "deutero_02_overlay_repair_allowed_from_current_snapshots",
  "deutero_02_same_address_complete",
  "deutero_02_source_row_split_without_adapter_policy",
  "deutero_02_synthetic_fill",
  "deuterocanon_textually_trusted",
  "deuterocanon_complete"
]) {
  if (!(review.blockedClaims || []).includes(claim)) {
    failures.push("missing blocked claim: " + claim);
  }
}

const totals = audit.totals || {};
for (const key of ["mismatches", "activeRefsWithoutSource", "activeMissingNrsVRows", "unavailableChapters"]) {
  if (review.blockingCounts?.[key] !== totals[key]) {
    failures.push("blocking count mismatch for " + key);
  }
}

if ((review.bookSummaries || []).length !== 2) {
  failures.push("review must summarize exactly 2 books");
}

const result = {
  audit: "deutero_02_greek_additions_source_active_review",
  status: failures.length ? "FAIL" : "PASS",
  reviewPath,
  sourceActiveAudit: auditPath,
  blockingCounts: review.blockingCounts,
  failures
};

console.log(JSON.stringify(result, null, 2));
process.exit(failures.length ? 1 : 0);
