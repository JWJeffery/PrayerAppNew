import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

const segmentationPath = "data/bible/translations/mr-james-apocryphal-nt-1924/raw/third-corinthians-source-segmentation.json";
const sourceMapPath = "data/bible/registry/broader-canon-3corinthians-mr-james-source-map-2026-07-04.json";
const correctionPath = "data/bible/registry/broader-canon-3corinthians-mr-james-marker-count-correction-2026-07-04.json";
const policyPath = "data/bible/registry/broader-canon-3corinthians-source-shape-migration-policy-2026-07-04.json";
const rowShapePath = "data/bible/registry/broader-canon-3corinthians-mr-james-row-shape-audit-2026-07-04.json";
const sourceSelectionPath = "data/bible/registry/broader-canon-3corinthians-mr-james-source-selection-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";
const blockerPath = "data/bible/registry/broader-canon-source-identity-blocker-3corinthians-2026-07-04.json";
const candidatePath = "data/bible/AR/3corinthiansAR.json";

function read(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function sha256File(path) {
  return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
}

function equal(label, actual, expected) {
  if (actual !== expected) failures.push({ type: "mismatch", label, actual, expected });
}

function falsey(label, actual) {
  if (actual !== false) failures.push({ type: "not-false", label, actual });
}

function truthy(label, actual) {
  if (actual !== true) failures.push({ type: "not-true", label, actual });
}

function includes(label, list, value) {
  if (!Array.isArray(list) || !list.includes(value)) failures.push({ type: "missing-list-value", label, value });
}

const segmentation = read(segmentationPath);
const sourceMap = read(sourceMapPath);
const correction = read(correctionPath);
const policy = read(policyPath);
const rowShape = read(rowShapePath);
const sourceSelection = read(sourceSelectionPath);
const governance = read(governancePath);
const classification = read(classificationPath);
const blocker = read(blockerPath);
const candidateSha = sha256File(candidatePath);

const numberedRows = sourceMap.sourceMap.filter(row => row.sourceUnitType === "numbered_source_row");
const introRows = sourceMap.sourceMap.filter(row => row.sourceUnitType === "introductory_narrative");
const anomaly86Rows = numberedRows.filter(row => row.visibleNumber === 86);

equal("segmentation.status", segmentation.status, "segmented_corrected_33_for_source_shape_rebuild_pending_candidate_mutation");
equal("segmentation.counts.correctedStrictNumberedSourceRows", segmentation.counts?.correctedStrictNumberedSourceRows, 33);
equal("segmentation.counts.supersededLooseNumberedSourceRows", segmentation.counts?.supersededLooseNumberedSourceRows, 35);
equal("segmentation.counts.excludedLooseOnlyApparatusMarkers", segmentation.counts?.excludedLooseOnlyApparatusMarkers, 2);
equal("segmentation.counts.section I", segmentation.counts?.sectionCounts?.I_corinthians_letter, 7);
equal("segmentation.counts.section II", segmentation.counts?.sectionCounts?.II_narrative_bridge, 3);
equal("segmentation.counts.section III", segmentation.counts?.sectionCounts?.III_paul_reply, 23);
falsey("segmentation candidate mutation", segmentation.trustBoundary?.candidateBibleTextMutated);
falsey("segmentation trust promotion", segmentation.trustBoundary?.trustPromotion);

equal("sourceMap.status", sourceMap.status, "source_map_created_corrected_33_pending_rebuild_script_no_candidate_mutation");
equal("sourceMap.qcSummary.correctedStrictSourceRowsExpectedFromMarkerCountCorrection", sourceMap.qcSummary?.correctedStrictSourceRowsExpectedFromMarkerCountCorrection, 33);
equal("sourceMap.qcSummary.sourceRowsMapped", sourceMap.qcSummary?.sourceRowsMapped, 33);
equal("sourceMap.qcSummary.currentCandidateRows", sourceMap.qcSummary?.currentCandidateRows, 19);
equal("numbered source rows", numberedRows.length, 33);
equal("intro rows", introRows.length, 1);
equal("86 anomaly rows", anomaly86Rows.length, 1);
equal("86 anomaly policy", anomaly86Rows[0]?.visibleMarkerPolicy, "preserved_visible_source_anomaly_not_silently_corrected");
falsey("sourceMap candidate mutation", sourceMap.trustBoundary?.candidateBibleTextMutated);
falsey("sourceMap candidate trusted", sourceMap.trustBoundary?.candidateTextTrusted);
falsey("sourceMap trust promotion", sourceMap.trustBoundary?.trustPromotion);
falsey("sourceMap app render promotion", sourceMap.trustBoundary?.appRenderPromotion);
equal("candidate sha before", sourceMap.trustBoundary?.candidateSha256Before, candidateSha);
equal("candidate sha after", sourceMap.trustBoundary?.candidateSha256After, candidateSha);

equal("correction latest source map", correction.latestMrJamesSourceMap?.recordPath, sourceMapPath);
falsey("correction latest source map mutation", correction.latestMrJamesSourceMap?.candidateTextMutation);
equal("policy latest source map", policy.latestMrJamesSourceMap?.recordPath, sourceMapPath);
falsey("policy latest source map mutation", policy.latestMrJamesSourceMap?.candidateTextMutation);
equal("rowShape latest source map", rowShape.latestCorrectedMrJamesSourceMap?.recordPath, sourceMapPath);
equal("sourceSelection latest source map", sourceSelection.latestCorrectedMrJamesSourceMap?.recordPath, sourceMapPath);

equal("governance latest source map", governance.latest3CorinthiansMrJamesSourceMap?.recordPath, sourceMapPath);
falsey("governance source map mutation", governance.latest3CorinthiansMrJamesSourceMap?.candidateTextMutation);
falsey("governance source map trust", governance.latest3CorinthiansMrJamesSourceMap?.trustPromotion);
falsey("governance source map render", governance.latest3CorinthiansMrJamesSourceMap?.appRenderPromotion);

includes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_mr_james_source_map_created_corrected_33");
includes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_corrected_source_rows_mapped_33");
includes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_text_repaired_by_corrected_source_map");
includes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_trusted_by_corrected_source_map");

equal("classification source map", classification.threeCorinthiansCorrectedMrJamesSourceMap?.recordPath, sourceMapPath);
falsey("classification mutation", classification.threeCorinthiansCorrectedMrJamesSourceMap?.textMutation);
falsey("classification trust", classification.threeCorinthiansCorrectedMrJamesSourceMap?.trustPromotion);
falsey("classification render", classification.threeCorinthiansCorrectedMrJamesSourceMap?.appRenderPromotion);

equal("blocker source map", blocker.latestCorrectedMrJamesSourceMap?.recordPath, sourceMapPath);
truthy("blocker rebuild ready", blocker.latestCorrectedMrJamesSourceMap?.sourceShapeRebuildReadyForNextCommand);
falsey("blocker mutation", blocker.latestCorrectedMrJamesSourceMap?.candidateTextMutation);
falsey("blocker trust", blocker.latestCorrectedMrJamesSourceMap?.trustPromotion);
falsey("blocker render", blocker.latestCorrectedMrJamesSourceMap?.appRenderPromotion);

console.log(JSON.stringify({
  audit: "broader-canon-3corinthians-mr-james-source-map",
  status: failures.length ? "failed" : "passed",
  segmentationPath,
  sourceMapPath,
  candidateSha256: candidateSha,
  correctedStrictSourceRowsMapped: numberedRows.length,
  candidateTextMutation: false,
  trustPromotion: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 3 Corinthians corrected source map.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: 3 Corinthians corrected M. R. James source map passed QC.");
