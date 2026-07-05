import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

const correctionPath = "data/bible/registry/broader-canon-3corinthians-mr-james-marker-count-correction-2026-07-04.json";
const rowShapePath = "data/bible/registry/broader-canon-3corinthians-mr-james-row-shape-audit-2026-07-04.json";
const policyPath = "data/bible/registry/broader-canon-3corinthians-source-shape-migration-policy-2026-07-04.json";
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

function eq(label, actual, expected) {
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

try {
  const correction = read(correctionPath);
  const rowShape = read(rowShapePath);
  const policy = read(policyPath);
  const sourceSelection = read(sourceSelectionPath);
  const governance = read(governancePath);
  const classification = read(classificationPath);
  const blocker = read(blockerPath);
  const candidateSha = sha256File(candidatePath);

  eq("correction.status", correction.status, "corrected_source_marker_total_33_no_candidate_mutation");
  eq("previous loose total", correction.correctionDecision?.previousLooseSourceMarkerTotal, 35);
  eq("corrected strict total", correction.correctionDecision?.correctedStrictSourceMarkerTotal, 33);
  eq("excluded loose-only markers", correction.correctionDecision?.excludedLooseOnlyMarkerCount, 2);
  eq("current candidate rows", correction.correctionDecision?.currentCandidateRows, 19);
  falsey("simpleOverlayAllowed", correction.correctionDecision?.simpleOverlayAllowed);

  falsey("candidateBibleTextMutated", correction.trustBoundary?.candidateBibleTextMutated);
  falsey("candidateTextTrusted", correction.trustBoundary?.candidateTextTrusted);
  falsey("trustPromotion", correction.trustBoundary?.trustPromotion);
  falsey("appRenderPromotion", correction.trustBoundary?.appRenderPromotion);
  eq("candidateSha256Before", correction.trustBoundary?.candidateSha256Before, candidateSha);
  eq("candidateSha256After", correction.trustBoundary?.candidateSha256After, candidateSha);

  const excluded = correction.sectionCorrections.flatMap(section => section.looseOnlyMarkersExcludedFromSourceRows || []);
  eq("excluded marker count", excluded.length, 2);
  if (!excluded.every(item => item.reason === "bracketed_apparatus_or_variant_note_marker_not_active_source_row")) {
    failures.push({ type: "bad-excluded-marker-reason", excluded });
  }

  if (!Array.isArray(correction.visibleSourceNumberingAnomaliesPreserved) || !correction.visibleSourceNumberingAnomaliesPreserved.some(item => item.visibleNumber === 86)) {
    failures.push({ type: "missing-preserved-86-anomaly" });
  }

  eq("rowShape.latestMarkerCountCorrection.recordPath", rowShape.latestMarkerCountCorrection?.recordPath, correctionPath);
  eq("policy.latestMarkerCountCorrection.recordPath", policy.latestMarkerCountCorrection?.recordPath, correctionPath);
  eq("policy.correctedObservedMismatch.activeCandidateRows", policy.correctedObservedMismatch?.activeCandidateRows, 19);
  eq("policy.correctedObservedMismatch.correctedSourceMarkerTotal", policy.correctedObservedMismatch?.correctedSourceMarkerTotal, 33);
  falsey("policy.correctedObservedMismatch.simpleOverlayAllowed", policy.correctedObservedMismatch?.simpleOverlayAllowed);
  eq("sourceSelection.latestMarkerCountCorrection.recordPath", sourceSelection.latestMarkerCountCorrection?.recordPath, correctionPath);

  eq("governance.latest marker correction recordPath", governance.latest3CorinthiansMrJamesMarkerCountCorrection?.recordPath, correctionPath);
  falsey("governance candidateTextMutation", governance.latest3CorinthiansMrJamesMarkerCountCorrection?.candidateTextMutation);
  falsey("governance trustPromotion", governance.latest3CorinthiansMrJamesMarkerCountCorrection?.trustPromotion);
  falsey("governance appRenderPromotion", governance.latest3CorinthiansMrJamesMarkerCountCorrection?.appRenderPromotion);

  includes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_mr_james_marker_count_corrected_to_33");
  includes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_previous_35_marker_total_superseded_for_source_map");
  includes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_source_map_forces_superseded_35_marker_count");
  includes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_marker_86_silently_corrected_to_36");

  eq("classification recordPath", classification.threeCorinthiansMrJamesMarkerCountCorrection?.recordPath, correctionPath);
  falsey("classification textMutation", classification.threeCorinthiansMrJamesMarkerCountCorrection?.textMutation);
  falsey("classification trustPromotion", classification.threeCorinthiansMrJamesMarkerCountCorrection?.trustPromotion);
  falsey("classification appRenderPromotion", classification.threeCorinthiansMrJamesMarkerCountCorrection?.appRenderPromotion);

  eq("blocker recordPath", blocker.latestMrJamesMarkerCountCorrection?.recordPath, correctionPath);
  truthy("blocker sourceMapReadyForCorrectedStrictCount", blocker.latestMrJamesMarkerCountCorrection?.sourceMapReadyForCorrectedStrictCount);
  falsey("blocker candidateTextMutation", blocker.latestMrJamesMarkerCountCorrection?.candidateTextMutation);
  falsey("blocker trustPromotion", blocker.latestMrJamesMarkerCountCorrection?.trustPromotion);
  falsey("blocker appRenderPromotion", blocker.latestMrJamesMarkerCountCorrection?.appRenderPromotion);

  console.log(JSON.stringify({
    audit: "broader-canon-3corinthians-mr-james-marker-count-correction",
    status: failures.length ? "failed" : "passed",
    correctionPath,
    candidateSha256: candidateSha,
    candidateTextMutation: false,
    trustPromotion: false,
    failures
  }, null, 2));
} catch (error) {
  failures.push({ type: "exception", message: String(error?.message || error) });
  console.log(JSON.stringify({
    audit: "broader-canon-3corinthians-mr-james-marker-count-correction",
    status: "failed",
    correctionPath,
    candidateTextMutation: false,
    trustPromotion: false,
    failures
  }, null, 2));
}

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 3 Corinthians marker-count correction.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: 3 Corinthians M. R. James marker-count correction passed QC.");
