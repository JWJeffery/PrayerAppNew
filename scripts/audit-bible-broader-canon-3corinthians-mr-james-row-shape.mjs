import fs from "node:fs";

const failures = [];

const rowShapePath = "data/bible/registry/broader-canon-3corinthians-mr-james-row-shape-audit-2026-07-04.json";
const sourceSelectionPath = "data/bible/registry/broader-canon-3corinthians-mr-james-source-selection-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";
const blockerPath = "data/bible/registry/broader-canon-source-identity-blocker-3corinthians-2026-07-04.json";

function read(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function requireEqual(label, actual, expected) {
  if (actual !== expected) failures.push({ type: "mismatch", label, actual, expected });
}

function requireFalse(label, actual) {
  if (actual !== false) failures.push({ type: "not-false", label, actual });
}

function requireIncludes(label, list, value) {
  if (!Array.isArray(list) || !list.includes(value)) {
    failures.push({ type: "missing-list-value", label, value });
  }
}

const rowShape = read(rowShapePath);
const sourceSelection = read(sourceSelectionPath);
const governance = read(governancePath);
const classification = read(classificationPath);
const blocker = read(blockerPath);

if (![
  "blocked_simple_overlay_source_shape_migration_required_no_candidate_mutation",
  "source_shape_potentially_overlay_compatible_pending_exact_mapping"
].includes(rowShape.status)) {
  failures.push({ type: "bad-status", label: "rowShape.status", actual: rowShape.status });
}

requireEqual("rowShape.candidatePath", rowShape.candidatePath, "data/bible/AR/3corinthiansAR.json");
requireEqual("rowShape.activeCandidateShape.candidateRowsDetected", rowShape.activeCandidateShape?.candidateRowsDetected, 19);
requireFalse("rowShape.shapeDecision.candidateTextMutation", rowShape.shapeDecision?.candidateTextMutation);
requireFalse("rowShape.shapeDecision.trustPromotion", rowShape.shapeDecision?.trustPromotion);
requireFalse("rowShape.shapeDecision.appRenderPromotion", rowShape.shapeDecision?.appRenderPromotion);

if (!Array.isArray(rowShape.sourceShape?.sourceSections) || rowShape.sourceShape.sourceSections.length !== 4) {
  failures.push({
    type: "bad-source-section-count",
    actual: rowShape.sourceShape?.sourceSections?.length
  });
}

for (const key of [
  "intro_narrative",
  "I_corinthians_letter",
  "II_narrative_bridge",
  "III_paul_reply"
]) {
  if (!rowShape.sourceShape.sourceSections.some(section => section.key === key)) {
    failures.push({ type: "missing-source-section", key });
  }
}

requireEqual("sourceSelection.latestRowShapeAudit.recordPath", sourceSelection.latestRowShapeAudit?.recordPath, rowShapePath);
requireFalse("sourceSelection.latestRowShapeAudit.candidateTextMutation", sourceSelection.latestRowShapeAudit?.candidateTextMutation);
requireFalse("sourceSelection.latestRowShapeAudit.trustPromotion", sourceSelection.latestRowShapeAudit?.trustPromotion);
requireFalse("sourceSelection.latestRowShapeAudit.appRenderPromotion", sourceSelection.latestRowShapeAudit?.appRenderPromotion);

requireEqual("governance.latest3CorinthiansMrJamesRowShapeAudit.recordPath", governance.latest3CorinthiansMrJamesRowShapeAudit?.recordPath, rowShapePath);
requireFalse("governance.latest3CorinthiansMrJamesRowShapeAudit.candidateTextMutation", governance.latest3CorinthiansMrJamesRowShapeAudit?.candidateTextMutation);
requireFalse("governance.latest3CorinthiansMrJamesRowShapeAudit.trustPromotion", governance.latest3CorinthiansMrJamesRowShapeAudit?.trustPromotion);
requireFalse("governance.latest3CorinthiansMrJamesRowShapeAudit.appRenderPromotion", governance.latest3CorinthiansMrJamesRowShapeAudit?.appRenderPromotion);

requireIncludes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_mr_james_row_shape_audited");
requireIncludes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_simple_overlay_repair_without_shape_audit");
requireIncludes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_textually_trusted_from_source_selection_alone");

requireEqual("classification.threeCorinthiansMrJamesRowShapeAudit.recordPath", classification.threeCorinthiansMrJamesRowShapeAudit?.recordPath, rowShapePath);
requireFalse("classification.threeCorinthiansMrJamesRowShapeAudit.textMutation", classification.threeCorinthiansMrJamesRowShapeAudit?.textMutation);
requireFalse("classification.threeCorinthiansMrJamesRowShapeAudit.trustPromotion", classification.threeCorinthiansMrJamesRowShapeAudit?.trustPromotion);
requireFalse("classification.threeCorinthiansMrJamesRowShapeAudit.appRenderPromotion", classification.threeCorinthiansMrJamesRowShapeAudit?.appRenderPromotion);

requireEqual("blocker.latestMrJamesRowShapeAudit.recordPath", blocker.latestMrJamesRowShapeAudit?.recordPath, rowShapePath);
requireFalse("blocker.latestMrJamesRowShapeAudit.candidateTextMutation", blocker.latestMrJamesRowShapeAudit?.candidateTextMutation);
requireFalse("blocker.latestMrJamesRowShapeAudit.trustPromotion", blocker.latestMrJamesRowShapeAudit?.trustPromotion);
requireFalse("blocker.latestMrJamesRowShapeAudit.appRenderPromotion", blocker.latestMrJamesRowShapeAudit?.appRenderPromotion);

console.log(JSON.stringify({
  audit: "broader-canon-3corinthians-mr-james-row-shape",
  status: failures.length ? "failed" : "passed",
  rowShapePath,
  candidateTextMutation: false,
  trustPromotion: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 3 Corinthians M. R. James row-shape audit.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: 3 Corinthians M. R. James row-shape audit passed QC.");
