import fs from "node:fs";

const failures = [];

const sourceMapPath = "data/bible/registry/broader-canon-3corinthians-mr-james-source-map-2026-07-04.json";
const segmentationPath = "data/bible/translations/mr-james-apocryphal-nt-1924/raw/third-corinthians-source-segmentation.json";
const candidatePath = "data/bible/AR/3corinthiansAR.json";

function read(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function fail(type, detail) {
  failures.push({ type, ...detail });
}

function eq(label, actual, expected) {
  if (actual !== expected) fail("mismatch", { label, actual, expected });
}

function falsey(label, actual) {
  if (actual !== false) fail("not-false", { label, actual });
}

const sourceMap = read(sourceMapPath);
const segmentation = read(segmentationPath);
const candidate = read(candidatePath);

const sourceRows = sourceMap.sourceMap.filter(row => row.sourceUnitType === "numbered_source_row");
const introRows = sourceMap.sourceMap.filter(row => row.sourceUnitType === "introductory_narrative");
const anomaly86Rows = sourceRows.filter(row => row.visibleNumber === 86);

eq("sourceMap.status", sourceMap.status, "source_map_created_corrected_33_pending_rebuild_script_no_candidate_mutation");
eq("segmentation.status", segmentation.status, "segmented_corrected_33_for_source_shape_rebuild_pending_candidate_mutation");
eq("source rows", sourceRows.length, 33);
eq("intro rows", introRows.length, 1);
eq("86 anomaly rows", anomaly86Rows.length, 1);
eq("86 anomaly policy", anomaly86Rows[0]?.visibleMarkerPolicy, "preserved_visible_source_anomaly_not_silently_corrected");
falsey("sourceMap.trustBoundary.candidateBibleTextMutated", sourceMap.trustBoundary?.candidateBibleTextMutated);
falsey("sourceMap.trustBoundary.trustPromotion", sourceMap.trustBoundary?.trustPromotion);
falsey("sourceMap.trustBoundary.appRenderPromotion", sourceMap.trustBoundary?.appRenderPromotion);

const candidateRows = (candidate.chapters || []).flatMap(chapter => chapter.verses || []);
if (["source_shaped_rebuilt_from_corrected_mr_james_source_map_pending_trust_certification", "textually_trusted_source_map_backed_pending_app_render_policy"].includes(candidate.status)) {
  eq("post-rebuild candidate rows", candidateRows.length, 33);
  for (const sourceRow of sourceRows) {
    const candidateRow = candidateRows.find(row => row.sourceUnitId === sourceRow.sourceUnitId);
    if (!candidateRow) {
      fail("missing-source-row-in-candidate", { sourceUnitId: sourceRow.sourceUnitId });
    } else {
      eq(`row text ${sourceRow.sourceUnitId}`, candidateRow.text, sourceRow.sourceText);
      eq(`row sha ${sourceRow.sourceUnitId}`, candidateRow.sourceTextSha256, sourceRow.sourceTextSha256);
    }
  }
}

console.log(JSON.stringify({
  audit: "broader-canon-3corinthians-mr-james-source-map",
  status: failures.length ? "failed" : "passed",
  sourceMapPath,
  correctedStrictSourceRowsMapped: sourceRows.length,
  postRebuildCandidateStatus: candidate.status,
  candidateTextMutation: false,
  trustPromotion: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 3 Corinthians source map audit.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: 3 Corinthians M. R. James source map audit passed QC.");
