#!/usr/bin/env node
import fs from "node:fs";

const certPath = "data/bible/registry/deuterocanon-text-trust-certification-2026-07-04.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";
const governancePath = "data/bible/registry/deuterocanon-remaining-governance.json";
const closurePath = "data/bible/registry/deutero-01-catholic-source-shape-closure.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const failures = [];
const cert = readJson(certPath);
const status = readJson(statusPath);
const governance = readJson(governancePath);
const closure = readJson(closurePath);
const lane = status.lanes?.deuterocanon;

if (cert.schema !== "deuterocanon-text-trust-certification-v1") failures.push({ type: "cert-schema-mismatch", actual: cert.schema });
if (cert.status !== "certified_textually_trusted_deuterocanon_with_governed_boundaries") failures.push({ type: "cert-status-mismatch", actual: cert.status });
if (cert.trustReady !== true) failures.push({ type: "cert-trust-ready-mismatch", actual: cert.trustReady });

if (!Array.isArray(cert.scope?.appUsesCertified) || !cert.scope.appUsesCertified.includes("liturgical_reading") || !cert.scope.appUsesCertified.includes("devotional_reading") || !cert.scope.appUsesCertified.includes("study_reading")) {
  failures.push({ type: "missing-certified-app-uses" });
}

if (closure.status !== "closed_with_governed_source_shape_boundaries") failures.push({ type: "deutero-01-closure-status-mismatch", actual: closure.status });
if (closure.totals?.mismatches !== 0) failures.push({ type: "deutero-01-mismatch-count-not-zero", actual: closure.totals?.mismatches });
if (governance.status !== "not_trusted_remaining_deuterocanon_governed") failures.push({ type: "remaining-governance-status-mismatch", actual: governance.status });

if (governance.inspectedGreekBooks?.estherGK?.formPolicy?.status !== "active_nrsv_addition_form_governed_no_text_mutation") failures.push({ type: "greek-esther-form-policy-missing" });
if (governance.inspectedGreekBooks?.danielGK?.formPolicy?.status !== "active_nrsv_extended_daniel_form_governed_no_text_mutation") failures.push({ type: "greek-daniel-form-policy-missing" });
if (governance.inspectedMaccabees?.["4maccabees"]?.knownSourceGapPolicy?.status !== "variant_footnote_governed_no_active_row_insert") failures.push({ type: "maccabees-4-variant-policy-missing" });

if (!lane || lane.status !== cert.status) failures.push({ type: "lane-status-mismatch", actual: lane?.status || null });
if (lane?.certificationRecord !== certPath) failures.push({ type: "lane-certification-record-mismatch", actual: lane?.certificationRecord || null });
if (!Array.isArray(lane?.completedRemediations) || !lane.completedRemediations.includes("deuterocanon_text_trust_certification_2026_07_04")) failures.push({ type: "missing-lane-certification-marker" });

for (const claim of cert.certifiedClaims || []) {
  if (!Array.isArray(lane?.allowedClaims) || !lane.allowedClaims.includes(claim)) failures.push({ type: "missing-lane-allowed-claim", claim });
}

for (const claim of cert.blockedClaims || []) {
  if (!Array.isArray(lane?.blockedClaims) || !lane.blockedClaims.includes(claim)) failures.push({ type: "missing-lane-blocked-claim", claim });
}

console.log(JSON.stringify({
  audit: "deuterocanon-text-trust-certification",
  status: failures.length ? "failed" : "passed",
  laneStatus: lane?.status || null,
  certificationRecord: lane?.certificationRecord || null,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Deuterocanon certification record/status mismatch.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: Deuterocanon is certified for app-use trust with governed boundaries. Push after review.");
}

process.exit(failures.length ? 1 : 0);
