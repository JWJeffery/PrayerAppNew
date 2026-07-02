#!/usr/bin/env node
import fs from "fs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const boundaryPath = "data/bible/registry/deutero-02-greek-additions-form-policy-boundary.json";
const boundary = readJson(boundaryPath);

const failures = [];

if (boundary.status !== "form_policy_recorded_no_text_mutation") {
  failures.push("boundary status mismatch");
}

for (const path of [
  "data/bible/OT/estherGK.json",
  "data/bible/OT/danielGK.json",
  "data/bible/registry/deuterocanon-remaining-governance.json"
]) {
  if (!fs.existsSync(path)) {
    failures.push("required path missing: " + path);
  }
}

if (boundary.activeFilePolicy?.GREEK_ESTHER?.canonicalActivePath !== "data/bible/OT/estherGK.json") {
  failures.push("Greek Esther canonical active path mismatch");
}

if (boundary.activeFilePolicy?.GREEK_DANIEL?.canonicalActivePath !== "data/bible/OT/danielGK.json") {
  failures.push("Greek Daniel canonical active path mismatch");
}

for (const claim of [
  "greek_esther_missing_because_greekesther_json_absent",
  "greek_daniel_missing_because_greekdaniel_json_absent",
  "greek_esther_simple_full_source_overlay_allowed",
  "greek_daniel_simple_full_source_overlay_allowed",
  "create_parallel_greekesther_or_greekdaniel_active_files_without_migration_policy"
]) {
  if (!(boundary.determination?.blockedClaims || []).includes(claim)) {
    failures.push("missing blocked claim: " + claim);
  }
}

if (boundary.inspection?.GREEK_ESTHER?.activeRows <= 0) {
  failures.push("Greek Esther active row count must be positive");
}

if (boundary.inspection?.GREEK_DANIEL?.activeRows <= 0) {
  failures.push("Greek Daniel active row count must be positive");
}

const result = {
  audit: "deutero_02_greek_additions_form_policy_boundary",
  status: failures.length ? "FAIL" : "PASS",
  boundaryPath,
  inspection: boundary.inspection,
  legacyPathState: boundary.legacyPathState,
  failures
};

console.log(JSON.stringify(result, null, 2));
process.exit(failures.length ? 1 : 0);
