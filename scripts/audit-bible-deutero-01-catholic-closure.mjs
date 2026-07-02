#!/usr/bin/env node
import fs from "fs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const closurePath = "data/bible/registry/deutero-01-catholic-source-shape-closure.json";
const postrepairPath = "data/bible/registry/deutero-01-catholic-postrepair-source-shape-audit.json";
const repairPath = "data/bible/registry/deutero-01-catholic-nrsv-biblegateway-nrsva-repair.json";

const closure = readJson(closurePath);
const postrepair = readJson(postrepairPath);
const repair = readJson(repairPath);

const failures = [];

if (closure.status !== "closed_with_governed_source_shape_boundaries") failures.push("closure status mismatch");
if (repair.status !== "source_backed_same_address_repair_completed") failures.push("repair is not completed");
if (postrepair.status !== "PASS_REMAINING_SOURCE_SHAPE_BOUNDARIES_RECORDED") failures.push("postrepair audit did not pass");
if (postrepair.totals?.mismatches !== 0) failures.push("postrepair mismatches must be zero");

for (const key of [
  "missingNrsVRows",
  "activeRefsWithoutSource",
  "sourceRefsWithoutActive",
  "noSourceButHasNrsV",
  "mismatches"
]) {
  if (closure.totals?.[key] !== postrepair.totals?.[key]) {
    failures.push("closure total mismatch for " + key);
  }
}

for (const claim of [
  "deutero_01_catholic_nrsv_active_grid_complete_without_source_shape_adapter",
  "deutero_01_catholic_nrsv_synthetic_fill",
  "deutero_01_catholic_no_source_nrsv_rows_source_backed_without_verification",
  "deuterocanon_textually_trusted",
  "deuterocanon_complete"
]) {
  if (!(closure.blockedClaims || []).includes(claim)) {
    failures.push("missing blocked claim: " + claim);
  }
}

if ((closure.books || []).length !== 8) failures.push("closure must include 8 books");

const result = {
  audit: "deutero_01_catholic_source_shape_closure",
  status: failures.length ? "FAIL" : "PASS",
  closurePath,
  repairPath,
  postrepairPath,
  totals: closure.totals,
  failures
};

console.log(JSON.stringify(result, null, 2));
process.exit(failures.length ? 1 : 0);
