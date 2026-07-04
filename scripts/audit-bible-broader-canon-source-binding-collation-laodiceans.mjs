#!/usr/bin/env node
import fs from "node:fs";

const candidatePath = "data/bible/NT/epistleofthelaodiceans.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";
const recordPath = "data/bible/registry/broader-canon-source-binding-collation-laodiceans-2026-07-04.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const failures = [];
const candidate = readJson(candidatePath);
const governance = readJson(governancePath);
const status = readJson(statusPath);
const record = readJson(recordPath);
const lane = status.lanes?.broader_canon;

const chapters = candidate.chapters || [];
const rows = chapters.flatMap(chapter => chapter.verses || []);

if (chapters.length !== 1) failures.push({ type: "candidate-chapter-count-mismatch", actual: chapters.length });
if (rows.length !== 16) failures.push({ type: "candidate-row-count-mismatch", actual: rows.length });
if (!String(rows[0]?.text || "").startsWith("Paul, an apostle")) failures.push({ type: "first-anchor-mismatch" });
if (!String(rows[15]?.text || "").startsWith("Cause this epistle")) failures.push({ type: "last-anchor-mismatch" });

if (record.schema !== "broader-canon-source-binding-collation-laodiceans-v2") failures.push({ type: "record-schema-mismatch", actual: record.schema });
if (record.status !== "passed_source_witness_binding_with_manual_variant_exceptions_no_candidate_mutation") failures.push({ type: "record-status-mismatch", actual: record.status });
if (record.scope?.candidatePath !== candidatePath) failures.push({ type: "candidate-path-mismatch", actual: record.scope?.candidatePath });
if (record.scope?.bibleVerseTextMutation !== false) failures.push({ type: "unexpected-bible-verse-text-mutation" });
if (record.scope?.candidateJsonMutation !== false) failures.push({ type: "unexpected-candidate-json-mutation" });
if (record.scope?.broaderCanonTextTrustPromotion !== false) failures.push({ type: "unexpected-text-trust-promotion" });
if (record.scope?.broaderCanonAppRenderPromotion !== false) failures.push({ type: "unexpected-app-render-promotion" });

if (record.bindingSummary?.rowCount !== 16) failures.push({ type: "record-row-count-mismatch", actual: record.bindingSummary?.rowCount });
if (record.bindingSummary?.bindingCount !== 16) failures.push({ type: "binding-count-mismatch", actual: record.bindingSummary?.bindingCount });
if (!Array.isArray(record.rowBindings) || record.rowBindings.length !== 16) failures.push({ type: "row-bindings-count-mismatch", actual: record.rowBindings?.length || null });
if ((record.bindingSummary?.minimumScore ?? 0) < 0.70) failures.push({ type: "minimum-score-below-manual-threshold", actual: record.bindingSummary?.minimumScore });

const manualRefs = record.bindingSummary?.manualVariantExceptionRefs || [];
for (const ref of ["1:3", "1:12", "1:14"]) {
  if (!manualRefs.includes(ref)) failures.push({ type: "missing-manual-variant-ref", ref });
}
if (manualRefs.length !== 3) failures.push({ type: "manual-variant-ref-count-mismatch", actual: manualRefs.length });

for (const binding of record.rowBindings || []) {
  if (binding.acceptanceClass === "below_threshold") failures.push({ type: "below-threshold-row-binding", ref: binding.ref, score: binding.score });
  if (["1:3", "1:12", "1:14"].includes(binding.ref) && binding.acceptanceClass !== "manual_variant_exception_source_family_binding") {
    failures.push({ type: "manual-row-class-mismatch", ref: binding.ref, actual: binding.acceptanceClass });
  }
}

if (!String(record.sourceWitness?.sourceBasisCaution || "").includes("does not certify")) failures.push({ type: "source-basis-caution-missing" });

if (governance.sourceBindingCollationLaodiceans?.recordPath !== recordPath) failures.push({ type: "governance-pointer-mismatch", actual: governance.sourceBindingCollationLaodiceans?.recordPath || null });
if (governance.sourceBindingCollationLaodiceans?.candidateJsonMutation !== false) failures.push({ type: "governance-candidate-json-mutation-mismatch", actual: governance.sourceBindingCollationLaodiceans?.candidateJsonMutation });

if (lane?.status !== "not_trusted_textually_broader_canon_candidates_quarantined_app_safe") failures.push({ type: "lane-status-mismatch", actual: lane?.status || null });
if (lane?.appUseTrustReady !== true) failures.push({ type: "lane-app-use-trust-ready-mismatch", actual: lane?.appUseTrustReady });
if (lane?.textTrustReady !== false) failures.push({ type: "lane-text-trust-ready-mismatch", actual: lane?.textTrustReady });
if (lane?.latest_broader_canon_source_binding_collation_laodiceans?.recordPath !== recordPath) failures.push({ type: "lane-pointer-mismatch", actual: lane?.latest_broader_canon_source_binding_collation_laodiceans?.recordPath || null });

for (const claim of record.blockedClaims || []) {
  if (!Array.isArray(governance.blockedClaims) || !governance.blockedClaims.includes(claim)) {
    failures.push({ type: "missing-governance-blocked-claim", claim });
  }
  if (!Array.isArray(lane?.blockedClaims) || !lane.blockedClaims.includes(claim)) {
    failures.push({ type: "missing-lane-blocked-claim", claim });
  }
}

console.log(JSON.stringify({
  audit: "broader-canon-source-binding-collation-laodiceans",
  status: failures.length ? "failed" : "passed",
  candidateRowCount: rows.length,
  bindingCount: record.bindingSummary?.bindingCount || null,
  minimumScore: record.bindingSummary?.minimumScore || null,
  averageScore: record.bindingSummary?.averageScore || null,
  manualVariantExceptionRefs: record.bindingSummary?.manualVariantExceptionRefs || [],
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Laodiceans source-binding record.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: Laodiceans source-witness binding is governed; proceed to 3 Corinthians source-basis inspection.");
}

process.exit(failures.length ? 1 : 0);
